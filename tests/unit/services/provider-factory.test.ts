import { describe, it, expect } from 'vitest'
import { createProvider } from '@services/ai/provider-factory'
import { OpenAIProvider } from '@services/ai/openai-provider'
import { AnthropicProvider } from '@services/ai/anthropic-provider'
import { GeminiProvider } from '@services/ai/gemini-provider'
import { CustomProvider } from '@services/ai/custom-provider'

describe('Provider Factory', () => {
  const baseConfig = {
    apiKey: 'test-key',
    model: 'test-model',
    endpoint: 'http://localhost:8080'
  }

  it('should create OpenAI provider', () => {
    const provider = createProvider({ ...baseConfig, type: 'openai' })
    expect(provider).toBeInstanceOf(OpenAIProvider)
    expect(provider.name).toBe('OpenAI')
  })

  it('should create Anthropic provider', () => {
    const provider = createProvider({ ...baseConfig, type: 'anthropic' })
    expect(provider).toBeInstanceOf(AnthropicProvider)
    expect(provider.name).toBe('Anthropic')
  })

  it('should create Gemini provider', () => {
    const provider = createProvider({ ...baseConfig, type: 'gemini' })
    expect(provider).toBeInstanceOf(GeminiProvider)
    expect(provider.name).toBe('Google Gemini')
  })

  it('should create Custom provider', () => {
    const provider = createProvider({ ...baseConfig, type: 'custom' })
    expect(provider).toBeInstanceOf(CustomProvider)
    expect(provider.name).toBe('Custom')
  })

  it('should throw for unknown provider type', () => {
    expect(() => {
      createProvider({ ...baseConfig, type: 'unknown' as never })
    }).toThrow('Unknown provider type')
  })
})
