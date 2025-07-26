import { checkGeminiApiKeys } from '~/lib/gemini/checkGeminiApiKey'
import { sample } from '~/utils/fp'

export async function selectGeminiApiKey(apiKey?: string) {
  if (apiKey) {
    if (checkGeminiApiKeys(apiKey)) {
      const userApiKeys = apiKey.split(',')
      return sample(userApiKeys)
    }
  }

  // don't need to validate anymore, already verified in middleware?
  const myApiKeyList = process.env.GEMINI_API_KEY
  const luckyApiKey = sample(myApiKeyList?.split(','))
  return luckyApiKey || ''
}
