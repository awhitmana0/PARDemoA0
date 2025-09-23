// Utility function to decode JWT tokens (client-side only, for demo purposes)
export function decodeJWT(token: string): any {
  try {
    // Split the token into parts
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    // Decode the payload (second part)
    const payload = parts[1]

    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4)

    // Decode base64url
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'))

    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

export function formatTokenClaims(claims: any): { [key: string]: any } {
  if (!claims) return {}

  // Format common JWT claims with readable names
  const formatted: { [key: string]: any } = {}

  Object.entries(claims).forEach(([key, value]) => {
    switch (key) {
      case 'iss':
        formatted['Issuer'] = value
        break
      case 'sub':
        formatted['Subject (User ID)'] = value
        break
      case 'aud':
        formatted['Audience'] = value
        break
      case 'exp':
        formatted['Expires At'] = new Date(Number(value) * 1000).toLocaleString()
        break
      case 'iat':
        formatted['Issued At'] = new Date(Number(value) * 1000).toLocaleString()
        break
      case 'nbf':
        formatted['Not Before'] = new Date(Number(value) * 1000).toLocaleString()
        break
      case 'name':
        formatted['Full Name'] = value
        break
      case 'email':
        formatted['Email'] = value
        break
      case 'email_verified':
        formatted['Email Verified'] = value ? 'Yes' : 'No'
        break
      case 'picture':
        formatted['Profile Picture'] = value
        break
      case 'nickname':
        formatted['Nickname'] = value
        break
      case 'given_name':
        formatted['First Name'] = value
        break
      case 'family_name':
        formatted['Last Name'] = value
        break
      case 'locale':
        formatted['Locale'] = value
        break
      case 'updated_at':
        formatted['Last Updated'] = new Date(String(value)).toLocaleString()
        break
      default:
        // Keep other claims as-is but with original key
        formatted[key] = value
    }
  })

  return formatted
}