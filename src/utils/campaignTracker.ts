/**
 * Campaign & Marketing Attribution Tracker for Next.js Matger Website
 */

export interface CampaignAttribution {
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  platform?: string;
  channel?: string;
  referrer?: string;
  timestamp?: number;
}

const STORAGE_KEY = 'matger_campaign_attribution';

export function detectSocialPlatform(referrer: string, utmSource?: string): string {
  const source = (utmSource || '').toLowerCase().trim();
  const ref = (referrer || '').toLowerCase().trim();

  if (source.includes('tiktok') || ref.includes('tiktok.com')) return 'tiktok';
  if (source.includes('instagram') || ref.includes('instagram.com') || ref.includes('ig')) return 'instagram';
  if (source.includes('facebook') || ref.includes('fb') || ref.includes('facebook.com')) return 'facebook';
  if (source.includes('snapchat') || ref.includes('snapchat.com')) return 'snapchat';
  if (source.includes('whatsapp') || ref.includes('wa.me') || ref.includes('whatsapp.com')) return 'whatsapp';
  if (source.includes('twitter') || source.includes('x.com') || ref.includes('t.co') || ref.includes('x.com')) return 'x';
  if (source.includes('youtube') || ref.includes('youtube.com') || ref.includes('youtu.be')) return 'youtube';
  if (source.includes('google') || ref.includes('google.')) return 'google';
  if (source.includes('telegram') || ref.includes('t.me')) return 'telegram';
  if (source.includes('pinterest') || ref.includes('pinterest.com')) return 'pinterest';

  return source || 'web';
}

export function initCampaignTracker(baseUrl?: string): CampaignAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || undefined;
    const utmMedium = urlParams.get('utm_medium') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || undefined;
    const utmContent = urlParams.get('utm_content') || undefined;
    const campaignId = urlParams.get('cid') || urlParams.get('utm_id') || undefined;
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    // If campaign params or referrer exist, capture them
    if (utmSource || utmCampaign || campaignId || referrer) {
      const platform = detectSocialPlatform(referrer, utmSource);

      const attribution: CampaignAttribution = {
        campaignId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        platform,
        channel: 'website',
        referrer,
        timestamp: Date.now(),
      };

      // Save in sessionStorage and localStorage
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));

      // Call backend track-click if campaignId or platform is present
      if (baseUrl && (campaignId || utmSource || platform)) {
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        fetch(`${cleanBase}/campaigns/track-click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId,
            utmSource: utmSource || platform,
            platform,
            channel: 'website',
            isUnique: true,
          }),
        }).catch((err) => {
          console.warn('[CampaignTracker] track-click failed silently:', err);
        });
      }

      return attribution;
    }
  } catch (e) {
    console.warn('[CampaignTracker] initialization error:', e);
  }

  return getCampaignAttribution();
}

export function getCampaignAttribution(): CampaignAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as CampaignAttribution;
    }
  } catch (e) {}

  return null;
}
