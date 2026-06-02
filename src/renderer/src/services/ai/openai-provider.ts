import { BaseProvider } from './base-provider'
import type { AnalyzeParams, ChatParams, ProviderConfig } from '@typings/ai'

export class OpenAIProvider extends BaseProvider {
  name = 'OpenAI'
  type = 'openai' as const

  constructor(config: ProviderConfig) {
    super(config)
  }

  async *analyzeImage(params: AnalyzeParams): AsyncGenerator<string, void, unknown> {
    const systemPrompt = this.buildSystemPrompt(params)
    const userPrompt = this.buildUserPrompt(params)
    const endpoint = this.config.endpoint || 'https://api.openai.com/v1'

    const response = await this.fetchWithTimeout(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o',
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: params.imageBase64,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.3
      })
    })

    yield* this.parseSSEStream(response)
  }

  async *chat(params: ChatParams): AsyncGenerator<string, void, unknown> {
    const endpoint = this.config.endpoint || 'https://api.openai.com/v1'

    const messages = params.messages.map((msg) => {
      // Support screenshot directly on the message
      if (msg.screenshot) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            {
              type: 'image_url',
              image_url: {
                url: msg.screenshot,
                detail: 'high'
              }
            }
          ]
        }
      }
      // Fallback to top-level imageBase64 for the first user message
      if (msg.role === 'user' && params.imageBase64 && msg === params.messages[0]) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            {
              type: 'image_url',
              image_url: {
                url: params.imageBase64,
                detail: 'high'
              }
            }
          ]
        }
      }
      return { role: msg.role, content: msg.content }
    })

    const response = await this.fetchWithTimeout(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o',
        stream: true,
        messages,
        max_tokens: 4096,
        temperature: 0.3
      })
    })

    yield* this.parseSSEStream(response)
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://api.openai.com/v1'
      const response = await fetch(`${endpoint}/models`, {
        headers: { Authorization: `Bearer ${key}` }
      })
      return response.ok
    } catch {
      return false
    }
  }

  protected extractContentFromChunk(json: Record<string, unknown>): string | null {
    const choices = json.choices as Array<Record<string, unknown>> | undefined
    if (!choices?.[0]) return null
    const delta = choices[0].delta as Record<string, unknown> | undefined
    return (delta?.content as string) || null
  }
}
