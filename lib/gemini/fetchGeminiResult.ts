import { Redis } from '@upstash/redis'
import { VideoConfig } from '~/lib/types'
import { isDev } from '~/utils/env'
import { getCacheId } from '~/utils/getCacheId'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export interface GeminiStreamPayload {
  api_key?: string
  model: string
  contents: GeminiMessage[]
  generationConfig?: {
    temperature?: number
    topP?: number
    topK?: number
    maxOutputTokens: number
  }
  stream?: boolean // Make stream optional since it's not needed in the request body
}

export function trimGeminiResult(result: any) {
  const answer = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (answer.startsWith('\n\n')) {
    return answer.substring(2)
  }
  return answer
}

export async function fetchGeminiResult(payload: GeminiStreamPayload, apiKey: string, videoConfig: VideoConfig) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  isDev && console.log({ apiKey })

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${payload.model}:generateContent?key=${apiKey}`

  const requestBody = {
    contents: payload.contents,
    generationConfig: payload.generationConfig,
  }

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(requestBody),
  })

  if (res.status !== 200) {
    const errorJson = await res.json()
    throw new Error(
      `Gemini API Error [${res.statusText}]: ${
        errorJson.error?.message || errorJson.error?.details?.[0]?.errorMessage || 'Unknown error'
      }`,
    )
  }

  const redis = Redis.fromEnv()
  const cacheId = getCacheId(videoConfig)

  if (!payload.stream) {
    const result = await res.json()
    const betterResult = trimGeminiResult(result)

    // Temporarily disable caching to fix hanging issue
    // try {
    //   const data = await redis.set(cacheId, betterResult)
    //   console.info(`video ${cacheId} cached:`, data)
    // } catch (cacheError) {
    //   console.warn('Failed to cache result:', cacheError)
    //   // Continue without caching if it fails
    // }
    isDev && console.log('========betterResult========', betterResult)

    return betterResult
  }

  // For streaming, we need to use a different endpoint
  const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${payload.model}:streamGenerateContent?key=${apiKey}`

  const streamRes = await fetch(streamUrl, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(requestBody),
  })

  if (streamRes.status !== 200) {
    const errorJson = await streamRes.json()
    throw new Error(
      `Gemini API Error [${streamRes.statusText}]: ${
        errorJson.error?.message || errorJson.error?.details?.[0]?.errorMessage || 'Unknown error'
      }`,
    )
  }

  let counter = 0
  let tempData = ''
  const stream = new ReadableStream({
    async start(controller) {
      const reader = streamRes.body?.getReader()
      if (!reader) {
        controller.error(new Error('No response body'))
        return
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                controller.close()
                // Temporarily disable caching to fix hanging issue
                // try {
                //   const data = await redis.set(cacheId, tempData)
                //   console.info(`video ${cacheId} cached:`, data)
                //   isDev && console.log('========betterResult after streamed========', tempData)
                // } catch (cacheError) {
                //   console.warn('Failed to cache result:', cacheError)
                //   // Continue without caching if it fails
                // }
                return
              }

              try {
                const json = JSON.parse(data)
                // Gemini streaming response format is different from OpenAI
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
                tempData += text

                if (counter < 2 && (text.match(/\n/) || []).length) {
                  // this is a prefix character (i.e., "\n\n"), do nothing
                  continue
                }

                const queue = encoder.encode(text)
                controller.enqueue(queue)
                counter++
              } catch (e) {
                // maybe parse error, continue
                continue
              }
            }
          }
        }
      } catch (e) {
        controller.error(e)
      }
    },
  })

  return stream
}
