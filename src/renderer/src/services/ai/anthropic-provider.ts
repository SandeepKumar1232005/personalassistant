import { BaseProvider } from './base-provider'
import type { AnalyzeParams, ChatParams, ProviderConfig } from '@typings/ai'

export class AnthropicProvider extends BaseProvider {
  name = 'Anthropic'
  type = 'anthropic' as const

  constructor(config: ProviderConfig) {
    super(config)
  }

  private extractBase64Data(dataUrl: string): { mediaType: string; data: string } {
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) {
      return { mediaType: match[1], data: match[2] }
    }
    return { mediaType: 'image/png', data: dataUrl }
  }

  async *analyzeImage(params: AnalyzeParams): AsyncGenerator<string, void, unknown> {
    const systemPrompt = this.buildSystemPrompt(params)
    const userPrompt = this.buildUserPrompt(params)
    const endpoint = this.config.endpoint || 'https://api.anthropic.com'
    const { mediaType, data } = this.extractBase64Data(params.imageBase64)

    const response = await this.fetchWithTimeout(`${endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        stream: true,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data
                }
              },
              { type: 'text', text: userPrompt }
            ]
          }
        ]
      })
    })

    yield* this.parseAnthropicStream(response)
  }

  async *chat(params: ChatParams): AsyncGenerator<string, void, unknown> {
    const endpoint = this.config.endpoint || 'https://api.anthropic.com'

    const messages = params.messages
      .filter((m) => m.role !== 'system')
      .map((msg) => {
        // Support screenshot directly on the message
        if (msg.screenshot) {
          const { mediaType, data } = this.extractBase64Data(msg.screenshot)
          return {
            role: msg.role,
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data }
              },
              { type: 'text', text: msg.content }
            ]
          }
        }
        // Fallback to top-level imageBase64 for the first user message
        if (msg.role === 'user' && params.imageBase64 && msg === params.messages.find(m => m.role === 'user')) {
          const { mediaType, data } = this.extractBase64Data(params.imageBase64)
          return {
            role: msg.role,
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data }
              },
              { type: 'text', text: msg.content }
            ]
          }
        }
        return { role: msg.role, content: msg.content }
      })

    const systemMsg = params.messages.find((m) => m.role === 'system')

    const response = await this.fetchWithTimeout(`${endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        stream: true,
        system: systemMsg?.content || '',
        messages
      })
    })

    yield* this.parseAnthropicStream(response)
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://api.anthropic.com'
      const response = await fetch(`${endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        })
      })
      return response.ok || response.status === 400 // 400 means valid key but bad request
    } catch {
      return false
    }
  }

  private async *parseAnthropicStream(
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
            if (json.type === 'content_block_delta' && json.delta?.text) {
              yield json.delta.text
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
    if ((json as { type?: string }).type === 'content_block_delta') {
      const delta = (json as { delta?: { text?: string } }).delta
      return delta?.text || null
    }
    return null
  }
}
