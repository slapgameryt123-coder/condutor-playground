const BLOCKED_PROTOCOLS = new Set(['javascript:', 'data:', 'file:'])
const CALENDAR_ALLOWED_HOSTS = ['calendar.google.com', 'www.google.com', 'calendly.com'] as const
const VIDEO_ALLOWED_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com'] as const
const IMAGE_ALLOWED_HOSTS = ['images.unsplash.com', 'cdn.pixabay.com', 'images.pexels.com'] as const

type UrlValidationResult =
  | { ok: true; normalizedUrl: string; hostname: string }
  | { ok: false; reason: string }

function isLocalOrPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()

  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower.endsWith('.local')
  ) {
    return true
  }

  if (lower.startsWith('10.') || lower.startsWith('192.168.')) {
    return true
  }

  const match172 = lower.match(/^172\.(\d{1,3})\./)
  if (match172) {
    const secondOctet = Number(match172[1])
    if (secondOctet >= 16 && secondOctet <= 31) return true
  }

  return false
}

export function validateExternalUrl(rawValue: string): UrlValidationResult {
  const trimmed = rawValue.trim()

  if (!trimmed) {
    return { ok: false, reason: 'URL is empty' }
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { ok: false, reason: 'URL format is invalid' }
  }

  if (BLOCKED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, reason: 'URL protocol is not allowed' }
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Only HTTPS URLs are allowed' }
  }

  if (isLocalOrPrivateHost(parsed.hostname)) {
    return { ok: false, reason: 'Local and private network URLs are blocked' }
  }

  return {
    ok: true,
    normalizedUrl: parsed.toString(),
    hostname: parsed.hostname.toLowerCase(),
  }
}

function hostAllowed(hostname: string, allowedHosts: readonly string[]): boolean {
  return allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))
}

export function isAllowedCalendarUrl(rawValue: string): boolean {
  const validated = validateExternalUrl(rawValue)
  if (!validated.ok) return false

  return hostAllowed(validated.hostname, CALENDAR_ALLOWED_HOSTS)
}

export function isAllowedVideoUrl(rawValue: string): boolean {
  const validated = validateExternalUrl(rawValue)
  if (!validated.ok) return false

  return hostAllowed(validated.hostname, VIDEO_ALLOWED_HOSTS)
}

export function isAllowedImageUrl(rawValue: string): boolean {
  const validated = validateExternalUrl(rawValue)
  if (!validated.ok) return false

  return hostAllowed(validated.hostname, IMAGE_ALLOWED_HOSTS)
}
