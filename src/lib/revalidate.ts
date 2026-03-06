/**
 * Trigger on-demand revalidation on the public website.
 * Fire-and-forget — does not block the admin response.
 */
export async function triggerRevalidation(type: string, slug?: string) {
  const siteUrl = process.env.SITE_URL || 'https://www.trdremedial.com.au';
  const secret = process.env.REVALIDATION_SECRET;

  if (!secret) {
    console.warn('[revalidate] REVALIDATION_SECRET not set, skipping');
    return;
  }

  try {
    // Fire-and-forget: don't await in production to avoid slowing admin responses
    fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, type, slug }),
    }).catch((err) => {
      console.error('[revalidate] Failed to trigger:', err);
    });
  } catch (err) {
    console.error('[revalidate] Failed to trigger:', err);
  }
}
