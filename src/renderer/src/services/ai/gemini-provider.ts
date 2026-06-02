import { BaseProvider } from './base-provider'
import type { AnalyzeParams, ChatParams, ProviderConfig } from '@typings/ai'

export class GeminiProvider extends BaseProvider {
  name = 'Google Gemini'
  type = 'gemini' as const

  constructor(config: ProviderConfig) {
    super(config)
  }

  private extractBase64Data(dataUrl: string): { mimeType: string; data: string } {
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) {
      return { mimeType: match[1], data: match[2] }
    }
    return { mimeType: 'image/png', data: dataUrl }
  }

  async *analyzeImage(params: AnalyzeParams): AsyncGenerator<string, void, unknown> {
    const systemPrompt = this.buildSystemPrompt(params)
    const userPrompt = this.buildUserPrompt(params)
    const endpoint = this.config.endpoint || 'https://generativelanguage.googleapis.com/v1beta'
    const model = this.config.model || 'gemini-2.5-flash-preview-05-20'
    const { mimeType, data } = this.extractBase64Data(params.imageBase64)

    const url = `${endpoint}/models/${model}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data } },
              { text: userPrompt }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.3
        }
      })
    })

    yield* this.parseGeminiStream(response)
  }

  async *chat(params: ChatParams): AsyncGenerator<string, void, unknown> {
    const endpoint = this.config.endpoint || 'https://generativelanguage.googleapis.com/v1beta'
    const model = this.config.model || 'gemini-2.5-flash-preview-05-20'

    const contents = params.messages
      .filter((m) => m.role !== 'system')
      .map((msg) => {
        const parts: Array<Record<string, unknown>> = [{ text: msg.content }]

        // Support screenshot directly on the message
        if (msg.screenshot) {
          const { mimeType, data } = this.extractBase64Data(msg.screenshot)
          parts.unshift({ inlineData: { mimeType, data } })
        } 
        // Fallback to top-level imageBase64 for the first user message
        else if (msg.role === 'user' && params.imageBase64 && msg === params.messages.find(m => m.role === 'user')) {
          const { mimeType, data } = this.extractBase64Data(params.imageBase64)
          parts.unshift({ inlineData: { mimeType, data } })
        }

        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts
        }
      })

    const systemMsg = params.messages.find((m) => m.role === 'system')
    const url = `${endpoint}/models/${model}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(systemMsg && {
          systemInstruction: { parts: [{ text: systemMsg.content }] }
        }),
        contents,
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.3
        }
      })
    })

    yield* this.parseGeminiStream(response)
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://generativelanguage.googleapis.com/v1beta'
      const response = await fetch(`${endpoint}/models?key=${key}`)
      return response.ok
    } catch {
      return false
    }
  }

  private async *parseGeminiStream(
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
          if (!trimmed.startsWith('data: ')) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            const candidates = json.candidates
            if (candidates?.[0]?.content?.parts) {
              for (const part of candidates[0].content.parts) {
                if (part.text) yield part.text
              }
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  protected extractContentFromChunk(json: Record<string, unknown>): string | null {
    const candidates = (json as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates
    if (candidates?.[0]?.content?.parts?.[0]?.text) {
      return candidates[0].content.parts[0].text
    }
    return null
  }
}
