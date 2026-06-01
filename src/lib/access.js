/**
 * Centralised access control for Prince Math Academy.
 *
 * Subscription tiers:
 *   Trial    — 3-day free trial, Standard videos only
 *   Standard — R100/month, Standard videos only
 *   Premium  — R150/month, all videos (Standard + Premium)
 *   admin / teacher — full access to everything
 */

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@princemath.co.za';

/** Returns true if the user is an admin or teacher */
export function isAdminOrTeacher(user) {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'teacher' || user.email === ADMIN_EMAIL;
}

/** Returns true if the user has any active access (trial or paid) */
export function hasActiveAccess(user) {
  if (!user) return false;
  if (isAdminOrTeacher(user)) return true;
  const now = new Date();
  if (user.trial_end_date && new Date(user.trial_end_date) > now) return true;
  if (
    user.subscription_active &&
    user.subscription_tier &&
    user.subscription_tier !== 'Trial' &&
    (!user.subscription_end_date || new Date(user.subscription_end_date) > now)
  ) return true;
  return false;
}

/** Returns true if the user can watch a specific video */
export function canWatchVideo(user, video) {
  if (!user || !video) return false;
  if (isAdminOrTeacher(user)) return true;

  const now = new Date();
  const videoTier = video.tier || 'Standard';

  // Active trial — Standard only
  if (user.trial_end_date && new Date(user.trial_end_date) > now) {
    return videoTier === 'Standard';
  }

  // Paid subscription
  if (
    user.subscription_active &&
    user.subscription_tier &&
    user.subscription_tier !== 'Trial' &&
    (!user.subscription_end_date || new Date(user.subscription_end_date) > now)
  ) {
    if (user.subscription_tier === 'Premium') return true;          // R150 — all videos
    if (user.subscription_tier === 'Standard') return videoTier === 'Standard'; // R100 — Standard only
  }

  return false;
}

/** Returns a human-readable reason why access is denied */
export function accessDeniedReason(user, video) {
  if (!user) return 'sign_in';
  const videoTier = video?.tier || 'Standard';
  const now = new Date();

  // Trial expired
  if (user.trial_end_date && new Date(user.trial_end_date) <= now && !user.subscription_active) {
    return 'trial_expired';
  }

  // Has Standard but video is Premium
  if (
    user.subscription_active &&
    user.subscription_tier === 'Standard' &&
    videoTier === 'Premium'
  ) {
    return 'upgrade_to_premium';
  }

  // No subscription at all
  return 'no_subscription';
}

/** Returns the user's current plan label */
export function getPlanLabel(user) {
  if (!user) return null;
  if (isAdminOrTeacher(user)) return 'Admin';
  const now = new Date();
  if (user.trial_end_date && new Date(user.trial_end_date) > now) return 'Free Trial';
  if (user.subscription_active && user.subscription_tier && user.subscription_tier !== 'Trial') {
    if (!user.subscription_end_date || new Date(user.subscription_end_date) > now) {
      return user.subscription_tier; // 'Standard' or 'Premium'
    }
    return 'Expired';
  }
  return 'No Plan';
}
