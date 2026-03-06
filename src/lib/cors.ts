// CORS and caching headers for public API endpoints
import { NextResponse } from 'next/server'

const PUBLIC_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}

/**
 * Add CORS and cache headers to a NextResponse.json response
 */
export function publicJson<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: PUBLIC_HEADERS,
  })
}

/**
 * Return a JSON error with CORS headers
 */
export function publicError(error: string, status = 500): NextResponse {
  return NextResponse.json(
    { error },
    { status, headers: PUBLIC_HEADERS }
  )
}

/**
 * Handle OPTIONS preflight requests for public endpoints
 */
export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: PUBLIC_HEADERS,
  })
}
