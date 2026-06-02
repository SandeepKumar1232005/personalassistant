import type { AIProvider, AnalyzeParams, ChatParams, ProviderConfig, ChatMessage } from '@typings/ai'
import { getSystemPrompt } from '@lib/prompts'

export abstract class BaseProvider implements AIProvider {
  abstract name: string
  abstract type: ProviderConfig['type']

  protected config: ProviderConfig

  constructor(config: ProviderConfig) {
    this.config = config
  }

  abstract analyzeImage(params: AnalyzeParams): AsyncGenerator<string, void, unknown>
  abstract chat(params: ChatParams): AsyncGenerator<string, void, unknown>
  abstract validateApiKey(key: string): Promise<boolean>

  protected buildSystemPrompt(params: AnalyzeParams): string {
    return getSystemPrompt(params.mode, params.appMode || 'quick-explain')
  }

  protected buildUserPrompt(params: AnalyzeParams): string {
    if (params.prompt) return params.prompt

    const modePrompts: Record<string, string> = {
      explain: 'Please explain what you see in this image in clear, simple terms.',
      summarize: 'Provide a concise summary of the content in this image.',
      ocr: 'Extract all visible text from this image. Preserve the formatting as closely as possible.',
      'code-analysis':
        'Analyze this code. Explain what it does, identify any bugs or issues, and suggest improvements.',
      'error-debug':
        'Analyze this error message. Explain what is causing the error and suggest specific fixes.',
      'ui-understanding':
        'Describe this user interface. Explain what each element does and the overall workflow.',
      'table-analysis':
        'Analyze this table. Extract the data, identify patterns, and provide insights.',
      'chart-analysis':
        'Interpret this chart/graph. Describe the data, identify trends, and explain key takeaways.',
      'diagram-analysis':
        'Explain this diagram. Describe the components, relationships, and overall structure.',
      translate: 'Detect and translate all text visible in this image to English.',
      qa: 'Look at this image and answer any questions I might ask about it.'
    }

    return modePrompts[params.mode] || modePrompts.explain
  }

  protected async *parseSSEStream(
    response: Response
  ): AsyncGenerator<string, void, unknown> {
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            const content = this.extractContentFromChunk(json)
            if (content) yield content
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  protected abstract extractContentFromChunk(json: unknown): string | null

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs = 60000
  ): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error')
        throw new Error(`API Error (${response.status}): ${errorBody}`)
      }

      return response
    } finally {
      clearTimeout(timeout)
    }
  }
}
