import { describe, it, expect } from 'vitest'
import { cn, formatTimestamp, truncate, generateId } from '@lib/utils'

describe('Utility Functions', () => {
  describe('cn()', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })

    it('should merge tailwind conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })
  })

  describe('formatTimestamp()', () => {
    it('should format timestamp to readable time', () => {
      const ts = new Date('2025-01-15T14:30:00').getTime()
      const result = formatTimestamp(ts)
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i)
    })
  })

  describe('truncate()', () => {
    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('should truncate long strings with ellipsis', () => {
      expect(truncate('hello world foo', 10)).toBe('hello w...')
    })
  })

  describe('generateId()', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should include timestamp', () => {
      const id = generateId()
      expect(id).toMatch(/^\d+_/)
    })
  })
})
