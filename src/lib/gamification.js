import { prince } from '@/api/princeClient';

// XP rewards for different actions
const XP_REWARDS = {
  watch_video: 10,
  complete_video: 50,
  daily_challenge: 20,
  forum_post: 15,
  forum_reply: 5,
  study_group_join: 25,
  streak_bonus: 30,
};

// Level thresholds (cumulative XP needed)
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2100,   // Level 7
  2800,   // Level 8
  3600,   // Level 9
  4500,   // Level 10
  5500,   // Level 11
  6600,   // Level 12
  7800,   // Level 13
  9100,   // Level 14
  10500,  // Level 15
  12000,  // Level 16
  13600,  // Level 17
  15300,  // Level 18
  17100,  // Level 19
  19000,  // Level 20
];

/**
 * Calculate level based on total XP
 */
export function calculateLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getLevelProgress(xp) {
  const totalXP = Math.max(0, Math.floor(Number(xp) || 0));
  const level = calculateLevel(totalXP);
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1];
  const nextLevelXP = LEVEL_THRESHOLDS[level];
  const xpToNextLevel = nextLevelXP === undefined ? 0 : nextLevelXP - totalXP;

  return {
    level,
    progress: nextLevelXP === undefined
      ? 100
      : Math.min(99, Math.round(((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)),
    xpToNextLevel,
    isMaxLevel: nextLevelXP === undefined,
  };
}

/**
 * Get XP needed to reach next level
 */
export function getXPToNextLevel(xp) {
  const currentLevel = calculateLevel(xp);
  const nextLevelIndex = currentLevel; // 0-indexed
  if (nextLevelIndex >= LEVEL_THRESHOLDS.length) {
    return 0; // Max level
  }
  return LEVEL_THRESHOLDS[nextLevelIndex] - xp;
}

/**
 * Award XP to a user
 */
export async function awardXP(userEmail, actionType, referenceId = null) {
  try {
    const xpAmount = XP_REWARDS[actionType] || 0;
    if (xpAmount === 0) return;

    const result = await prince.functions.invoke('awardXP', {
      action_type: actionType,
      reference_id: referenceId,
    });

    // Check for level-up
    if (result.awarded && result.level > result.previous_level) {
      await checkAndAwardBadge(userEmail, 'level_up', result.level);
    }

    return { ...result, awarded: result.awarded ? xpAmount : 0 };
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
}

/**
 * Update user streak
 */
export async function updateStreak(userEmail) {
  try {
    const result = await prince.functions.invoke('updateStreak', {});

    // Check for streak badges
    if (result.current_streak >= 3) await checkAndAwardBadge(userEmail, 'streak_3');
    if (result.current_streak >= 7) await checkAndAwardBadge(userEmail, 'streak_7');
    if (result.current_streak >= 30) await checkAndAwardBadge(userEmail, 'streak_30');

    return {
      streak: result.current_streak,
      longestStreak: result.longest_streak,
      bonus: result.bonus_awarded,
    };
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

/**
 * Check and award badge if conditions are met
 */
async function checkAndAwardBadge(userEmail, badgeType, value = null) {
  try {
    // Get badge by type
    const badges = await prince.entities.Badge.filter({ category: badgeType });
    if (!badges || badges.length === 0) return;

    // Check if user already has this badge
    const userBadges = await prince.entities.UserBadge.filter({ user_email: userEmail });
    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

    for (const badge of badges) {
      if (!earnedBadgeIds.includes(badge.id)) {
        // Award the badge
        await prince.entities.UserBadge.create({
          user_email: userEmail,
          badge_id: badge.id,
        });

        // Award badge XP
        if (badge.xp_reward > 0) {
          await awardXP(userEmail, 'badge_earned', badge.id);
        }

        return badge;
      }
    }
  } catch (error) {
    console.error('Error checking badge:', error);
  }
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userEmail) {
  try {
    const userBadges = await prince.entities.UserBadge.filter({ user_email: userEmail });
    if (!userBadges || userBadges.length === 0) return [];

    const badgeIds = userBadges.map(ub => ub.badge_id);
    const badges = [];

    for (const badgeId of badgeIds) {
      const badge = await prince.entities.Badge.get(badgeId);
      if (badge) badges.push(badge);
    }

    return badges;
  } catch (error) {
    console.error('Error getting user badges:', error);
    return [];
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit = 50) {
  try {
    const users = await prince.entities.User.list();
    if (!users) return [];

    return users
      .map(user => ({
        email: user.email,
        name: user.full_name,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.current_streak || 0,
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}
