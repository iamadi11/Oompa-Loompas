export interface ParsedDeal {
  title?: string
  brandName?: string
  value?: number
  currency?: 'INR' | 'USD' | 'EUR' | 'GBP'
  notes?: string
}

type Currency = 'INR' | 'USD' | 'EUR' | 'GBP'

function cleanAmount(s: string): number {
  return parseFloat(s.replace(/,/g, ''))
}

function extractValueAndCurrency(text: string): { value?: number; currency?: Currency } {
  // Priority 1: Lakh/lac/lakhs (with or without ₹ prefix)
  const lakhMatch = text.match(/[₹]?\s*(\d+(?:\.\d+)?)\s*(?:L\b|lakhs?\b|lacs?\b)/i)
  if (lakhMatch?.[1]) {
    return { value: parseFloat(lakhMatch[1]) * 100_000, currency: 'INR' }
  }

  // Priority 2: K shorthand — check for dollar first, otherwise INR
  const kDollarMatch = text.match(/\$\s*(\d+(?:\.\d+)?)\s*K\b/i)
  if (kDollarMatch?.[1]) {
    return { value: parseFloat(kDollarMatch[1]) * 1000, currency: 'USD' }
  }
  const kMatch = text.match(/[₹Rs.]?\s*(\d+(?:\.\d+)?)\s*K\b/i)
  if (kMatch?.[1]) {
    return { value: parseFloat(kMatch[1]) * 1000, currency: 'INR' }
  }

  // Priority 3: Currency symbol or text prefix + numeric amount
  const symbolMatch = text.match(
    /(₹|Rs\.?\s*|INR\s+|USD\s+|\$|EUR\s+|€|GBP\s+|£)(\d[\d,]*(?:\.\d+)?)/i,
  )
  if (symbolMatch?.[1] && symbolMatch[2]) {
    const sym = symbolMatch[1].trim()
    const amount = cleanAmount(symbolMatch[2])
    let currency: Currency = 'INR'
    if (/^\$|^USD/i.test(sym)) currency = 'USD'
    else if (/^€|^EUR/i.test(sym)) currency = 'EUR'
    else if (/^£|^GBP/i.test(sym)) currency = 'GBP'
    return { value: amount, currency }
  }

  return {}
}

function extractBrandName(text: string): string | undefined {
  // Pattern 1: greeting + "from [Brand]" — stops at team/partnerships/marketing keywords or punctuation
  const greetingFrom = text.match(
    /\b(?:Hi|Hello)\b[^.!?]*?\bfrom\s+(?:the\s+)?([A-Z][A-Za-z0-9& ]+?)(?:\s+(?:partnerships?|team|marketing|brand|side|here)|[.,!?\n]|$)/im,
  )
  if (greetingFrom?.[1]) return greetingFrom[1].trim()

  // Pattern 2: "from [Brand] team/marketing/etc" (no greeting needed)
  const fromTeam = text.match(
    /\bfrom\s+(?:the\s+)?([A-Z][A-Za-z0-9& ]+?)\s+(?:team|marketing|brand|partnership|partnerships)\b/i,
  )
  if (fromTeam?.[1]) return fromTeam[1].trim()

  // Pattern 3: email domain → capitalize
  const emailDomain = text.match(/@([a-z][a-z0-9-]+)\./i)
  if (emailDomain?.[1]) {
    const domain = emailDomain[1].replace(/-/g, ' ')
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  }

  // Pattern 4: capitalized 1–3 word sequence near collaboration keywords
  const nearKeyword = text.match(
    /([A-Z][A-Za-z0-9]+(?: [A-Z][A-Za-z0-9]+){0,2})\s+(?:collaboration|deal|sponsorship|campaign)\b/i,
  )
  if (nearKeyword?.[1]) return nearKeyword[1].trim()

  return undefined
}

function extractTitle(text: string, brandName?: string): string | undefined {
  // Subject line takes priority
  const subjectMatch = text.match(/^Subject:\s*(.+)$/im)
  if (subjectMatch?.[1]) return subjectMatch[1].trim()

  if (!brandName) return undefined

  // Brand + first deliverable type found
  const deliverableTypes = ['integration', 'reel', 'post', 'video', 'story', 'review', 'short']
  for (const type of deliverableTypes) {
    if (new RegExp(`\\b${type}s?\\b`, 'i').test(text)) {
      return `${brandName} ${type.charAt(0).toUpperCase() + type.slice(1)}`
    }
  }
  return `${brandName} Deal`
}

function extractNotes(text: string): string | undefined {
  const pattern =
    /\b(\d+)\s+(?:[A-Za-z]+\s+)?(?:reels?|posts?|videos?|integrations?|shorts?|stories|story|reviews?)\b/gi
  const matches = [...text.matchAll(pattern)].map((m) => m[0].trim())
  return matches.length > 0 ? matches.join(', ') : undefined
}

export function parseDealFromText(text: string): ParsedDeal {
  const trimmed = text.trim()
  if (!trimmed) return {}

  const { value, currency } = extractValueAndCurrency(trimmed)
  const brandName = extractBrandName(trimmed)
  const title = extractTitle(trimmed, brandName)
  const notes = extractNotes(trimmed)

  const result: ParsedDeal = {}
  if (title) result.title = title
  if (brandName) result.brandName = brandName
  if (value !== undefined) result.value = value
  if (currency !== undefined) result.currency = currency
  if (notes) result.notes = notes
  return result
}
