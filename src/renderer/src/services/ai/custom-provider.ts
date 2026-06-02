import { OpenAIProvider } from './openai-provider'
import type { ProviderConfig } from '@typings/ai'

/**
 * Custom/self-hosted provider that assumes OpenAI-compatible API format.
 * Works with: Ollama, LM Studio, vLLM, LocalAI, text-generation-webui, etc.
 */
export class CustomProvider extends OpenAIProvider {
  name = 'Custom'
  type = 'custom' as const

  constructor(config: ProviderConfig) {
    super({
      ...config,
      endpoint: config.endpoint || 'http://localhost:11434/v1'
    })
  }

  async validateApiKey(key: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'http://localhost:11434/v1'
      const response = await fetch(`${endpoint}/models`, {
        headers: key ? { Authorization: `Bearer ${key}` } : {}
      })
      return response.ok
    } catch {
      return false
    }
  }
}
