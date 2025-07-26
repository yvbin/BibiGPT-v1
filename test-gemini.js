// 简单的Gemini API测试脚本
// 使用方法: node test-gemini.js

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-gemini-api-key-here'

async function testGeminiAPI() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: '请简单介绍一下你自己' }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
      temperature: 0.7,
    },
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    if (response.status !== 200) {
      const errorJson = await response.json()
      console.error('Gemini API Error:', errorJson)
      return
    }

    const result = await response.json()
    console.log('Gemini API 测试成功!')
    console.log('响应内容:', result.candidates?.[0]?.content?.parts?.[0]?.text || '无内容')
  } catch (error) {
    console.error('测试失败:', error.message)
  }
}

if (GEMINI_API_KEY === 'your-gemini-api-key-here') {
  console.log('请设置 GEMINI_API_KEY 环境变量或修改脚本中的API key')
} else {
  testGeminiAPI()
}
