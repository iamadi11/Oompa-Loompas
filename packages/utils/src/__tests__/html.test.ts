import { describe, it, expect } from 'vitest'
import { escapeHtml } from '../html.js'

describe('escapeHtml', () => {
  it('escapes HTML-special characters', () => {
    expect(escapeHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;')
  })

  it('leaves plain text unchanged', () => {
    expect(escapeHtml('Acme Corp')).toBe('Acme Corp')
  })
})
