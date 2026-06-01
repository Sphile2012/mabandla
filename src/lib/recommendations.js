import { prince } from '@/api/princeClient';

/**
 * Get recommended videos for a user based on their grade, watch history, and preferences
 */
export async function getRecommendedVideos(userEmail, userGrade, limit = 6) {
  try {
    // Get all videos for the user's grade
    const videos = await prince.entities.Video.filter({ grade: userGrade });
    
    // Get user's video progress to understand what they've watched
    const videoProgress = await prince.entities.VideoProgress.filter({ user_email: userEmail });
    
    // Get user's favorites
    const favorites = await prince.entities.Favorite.filter({ user_email: userEmail });
    const favoriteIds = new Set(favorites.map(f => f.video_id));
    
    // Get completed video IDs
    const completedIds = new Set(videoProgress.filter(vp => vp.completed).map(vp => vp.video_id));
    
    // Get watched topics (from completed videos)
    const watchedVideos = videos.filter(v => completedIds.has(v.id));
    const watchedTopics = new Set(watchedVideos.map(v => v.topic));
    
    // Calculate recommendation scores
    const scoredVideos = videos.map(video => {
      let score = 0;
      
      // Skip already completed videos
      if (completedIds.has(video.id)) {
        return { ...video, score: -1 };
      }
      
      // Boost score for favorite topics (topics user has watched)
      if (watchedTopics.has(video.topic)) {
        score += 10;
      }
      
      // Boost score for favorited videos
      if (favoriteIds.has(video.id)) {
        score += 5;
      }
      
      // Boost score for videos with high views (popular content)
      score += Math.min((video.views || 0) / 10, 5);
      
      // Boost score for recently added videos
      const daysSinceCreation = (Date.now() - new Date(video.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        score += 3;
      }
      
      // Boost score for Standard tier videos (more accessible)
      if (video.tier === 'Standard') {
        score += 2;
      }
      
      // Random factor to add variety
      score += Math.random() * 2;
      
      return { ...video, score };
    });
    
    // Sort by score and return top recommendations
    const recommendations = scoredVideos
      .filter(v => v.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

/**
 * Get recommended videos based on a specific video (similar content)
 */
export async function getSimilarVideos(videoId, limit = 4) {
  try {
    const video = await prince.entities.Video.get(videoId);
    if (!video) return [];
    
    // Get videos with same topic and grade
    const similarVideos = await prince.entities.Video.filter({
      topic: video.topic,
      grade: video.grade,
    });
    
    // Exclude the current video
    const recommendations = similarVideos
      .filter(v => v.id !== videoId)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
    
    return recommendations;
  } catch (error) {
    console.error('Error getting similar videos:', error);
    return [];
  }
}

/**
 * Get trending videos (most viewed in the last 7 days)
 */
export async function getTrendingVideos(limit = 6) {
  try {
    const videos = await prince.entities.Video.list('-views', 50);
    return videos.slice(0, limit);
  } catch (error) {
    console.error('Error getting trending videos:', error);
    return [];
  }
}
