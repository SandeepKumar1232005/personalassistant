import type { AIProvider, ProviderConfig } from '@typings/ai'
import { OpenAIProvider } from './openai-provider'
import { AnthropicProvider } from './anthropic-provider'
import { GeminiProvider } from './gemini-provider'
import { CustomProvider } from './custom-provider'

export function createProvider(config: ProviderConfig): AIProvider {
  switch (config.type) {
    case 'gemini':
      return new GeminiProvider(config)
    default:
      throw new Error(`Unknown provider type: ${config.type}`)
  }
}

export { OpenAIProvider, AnthropicProvider, GeminiProvider, CustomProvider }
