export function safeExternalUrl(value: string | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

export function safeImageUrl(value: string | undefined): string {
  if (!value) return '';
  if (value.startsWith('data:image/')) return value;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  return safeExternalUrl(value);
}

export function safeCtaUrl(value: string | undefined): string {
  if (!value) return '/shop';
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  return safeExternalUrl(value) || '/shop';
}

export function normalizeWhatsAppNumber(value: string | undefined): string {
  if (!value) return '919999517599';
  const clean = value.replace(/\D/g, '');
  if (clean.length === 10) return `91${clean}`;
  return clean || '919999517599';
}

export function generateWhatsAppUrl(phone: string | undefined, message?: string): string {
  const clean = normalizeWhatsAppNumber(phone);
  return message
    ? `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${clean}`;
}
