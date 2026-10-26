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

export function isExternalReferrer(referrer: string): boolean {
  if (!referrer) return false;
  try {
    const refUrl = new URL(referrer);
    if (typeof window !== 'undefined') {
      if (refUrl.hostname === window.location.hostname) return false;
      if (
        (refUrl.hostname === 'localhost' || refUrl.hostname === '127.0.0.1') &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ) {
        return false;
      }
    }
    return true;
  } catch (_) {
    return false;
  }
}

export function detectSocialPlatform(referrer: string, utmSource?: string): string {
  const source = (utmSource || '').toLowerCase().trim();
  const ref = (referrer || '').toLowerCase().trim();

  if (source.includes('tiktok') || ref.includes('tiktok.com') || ref.includes('byteoversea')) return 'tiktok';
  if (source.includes('instagram') || ref.includes('instagram.com') || ref.includes('cdninstagram') || source === 'ig') return 'instagram';
  if (source.includes('facebook') || source === 'fb' || ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('messenger.com')) return 'facebook';
  if (source.includes('snapchat') || ref.includes('snapchat.com')) return 'snapchat';
  if (source.includes('whatsapp') || source === 'wa' || ref.includes('wa.me') || ref.includes('whatsapp.com')) return 'whatsapp';
  if (source.includes('twitter') || source.includes('x.com') || source === 'x' || ref.includes('t.co') || ref.includes('x.com') || ref.includes('twitter.com')) return 'x_twitter';
  if (source.includes('youtube') || source === 'yt' || ref.includes('youtube.com') || ref.includes('youtu.be')) return 'youtube';
  if (source.includes('google') || ref.includes('google.') || ref.includes('googleads')) return 'google';
  if (source.includes('telegram') || source === 'tg' || ref.includes('t.me') || ref.includes('telegram.me')) return 'telegram';
  if (source.includes('pinterest') || ref.includes('pinterest.com') || ref.includes('pin.it')) return 'pinterest';

  return source || (ref ? 'external_referrer' : 'direct');
}

export function initCampaignTracker(baseUrl?: string): CampaignAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || urlParams.get('source') || urlParams.get('ref') || undefined;
    const utmMedium = urlParams.get('utm_medium') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || undefined;
    const utmContent = urlParams.get('utm_content') || undefined;
    const campaignId = urlParams.get('cid') || urlParams.get('campaignId') || urlParams.get('utm_id') || undefined;
    const hasClickId = !!(
      urlParams.get('fbclid') ||
      urlParams.get('gclid') ||
      urlParams.get('ttclid') ||
      urlParams.get('twclid') ||
      urlParams.get('igshid')
    );

    const rawReferrer = typeof document !== 'undefined' ? document.referrer : '';
    const external = isExternalReferrer(rawReferrer);

    const hasNewCampaignParams = !!(campaignId || utmCampaign || utmSource || hasClickId);
    const existing = getCampaignAttribution();

    // If there are explicit campaign params or an external referrer, capture or update attribution
    if (hasNewCampaignParams || external) {
      const platform = detectSocialPlatform(external ? rawReferrer : '', utmSource);

      const effectiveCampaignId = campaignId || existing?.campaignId;
      const effectiveUtmCampaign = utmCampaign || existing?.utmCampaign;
      const effectiveUtmSource = utmSource || (platform !== 'direct' && platform !== 'external_referrer' ? platform : existing?.utmSource);
      const effectiveUtmMedium = utmMedium || existing?.utmMedium;

      const attribution: CampaignAttribution = {
        campaignId: effectiveCampaignId,
        utmSource: effectiveUtmSource,
        utmMedium: effectiveUtmMedium,
        utmCampaign: effectiveUtmCampaign,
        utmContent: utmContent || existing?.utmContent,
        platform: platform,
        channel: 'website',
        referrer: external ? rawReferrer : existing?.referrer,
        timestamp: Date.now(),
      };

      // Persist across session and local storage
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));

      // Call backend track-click if campaignId or platform is present (deduped per session)
      const targetCampaignKey = effectiveCampaignId || effectiveUtmCampaign;
      const sessionTrackKey = `matger_tracked_${targetCampaignKey || platform}`;
      const alreadyTrackedInSession = sessionStorage.getItem(sessionTrackKey);

      if (!alreadyTrackedInSession && baseUrl && (effectiveCampaignId || effectiveUtmSource || platform)) {
        sessionStorage.setItem(sessionTrackKey, 'true');
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const isUnique = !localStorage.getItem(`matger_unique_${targetCampaignKey || 'campaign'}`);

        fetch(`${cleanBase}/campaigns/track-click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: effectiveCampaignId,
            utmSource: effectiveUtmSource || platform,
            platform,
            channel: 'website',
            isUnique,
          }),
        }).catch((err) => {
          console.warn('[CampaignTracker] track-click failed silently:', err);
        });

        if (targetCampaignKey) {
          localStorage.setItem(`matger_unique_${targetCampaignKey}`, 'true');
        }
      }

      return attribution;
    }
  } catch (e) {
    console.warn('[CampaignTracker] initialization error:', e);
  }

  // Return already-established session attribution if present
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

export function clearCampaignAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}
