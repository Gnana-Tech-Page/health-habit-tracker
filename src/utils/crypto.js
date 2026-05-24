// SHA-256 via the browser's built-in Web Crypto API.
// Produces a one-way hex digest — far stronger than btoa.
// Note: this is client-side hashing only; not a substitute for server-side bcrypt in production.
export async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(plain, hash) {
  return (await hashPassword(plain)) === hash
}
