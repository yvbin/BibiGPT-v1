import React from 'react'
import { AIService } from '~/lib/types'

interface AIServiceSelectorProps {
  value: AIService
  onChange: (service: AIService) => void
}

export function AIServiceSelector({ value, onChange }: AIServiceSelectorProps) {
  return (
    <div className="mt-4 flex items-center space-x-4">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">AI 服务:</label>
      <div className="flex space-x-2">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="aiService"
            value={AIService.OpenAI}
            checked={value === AIService.OpenAI}
            onChange={(e) => onChange(e.target.value as AIService)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">OpenAI</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="aiService"
            value={AIService.Gemini}
            checked={value === AIService.Gemini}
            onChange={(e) => onChange(e.target.value as AIService)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">Gemini</span>
        </label>
      </div>
    </div>
  )
}
