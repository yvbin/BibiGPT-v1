export function checkGeminiApiKey(str: string) {
  // Gemini API keys are typically 39 characters long and start with "AI"
  var pattern = /^AI[A-Za-z0-9]{37}$/
  return pattern.test(str)
}

export function checkGeminiApiKeys(str: string) {
  if (str.includes(',')) {
    const userApiKeys = str.split(',')
    return userApiKeys.every(checkGeminiApiKey)
  }

  return checkGeminiApiKey(str)
}
