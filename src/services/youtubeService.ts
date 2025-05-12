import axios from 'axios';
import { Course, Lecture, Section } from '../types';



// import { extractPlaylistId } from '../utils/formatters';

// Mock data for development purposes since we can't actually use the YouTube API without a key
// In a real app, you would use the YouTube API with proper authentication


/**
 * In a real implementation, this would fetch YouTube playlist data
 * For now, we're using mock data
 */

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const extractPlaylistId = (url: string): string => {
  const regex = /[?&]list=([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  if (!match || !match[1]) {
    throw new Error('Invalid YouTube playlist URL');
  }
  return match[1];
};

export const fetchPlaylistData = async (playlistUrl: string): Promise<Course> => {
  const playlistId = extractPlaylistId(playlistUrl);
  const playlistItems: any[] = [];
  let nextPageToken: string | undefined = undefined;

  // Fetch all videos in the playlist
  do {
    const res:any = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: 'snippet,contentDetails',
        maxResults: 50,
        playlistId,
        pageToken: nextPageToken,
        key: YOUTUBE_API_KEY
      }
    });

    playlistItems.push(...res.data.items);
    nextPageToken = res.data.nextPageToken;
  } while (nextPageToken);

  // Get video durations via videos API
  const videoIds = playlistItems.map(item => item.contentDetails.videoId);
  const durationMap: Record<string, number> = {};

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const res = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'contentDetails',
        id: batch.join(','),
        key: YOUTUBE_API_KEY
      }
    });

    for (const video of res.data.items) {
      const durationISO = video.contentDetails.duration;
      durationMap[video.id] = isoDurationToSeconds(durationISO);
    }
  }

  // Map to Lecture[]
  const lectures: Lecture[] = playlistItems.map((item, index) => ({
    id: item.contentDetails.videoId,
    title: item.snippet.title,
    videoId: item.contentDetails.videoId,
    duration: durationMap[item.contentDetails.videoId] || 0,
    thumbnail: item.snippet.thumbnails?.high?.url || '',
    position: index
  }));

  const totalDuration = lectures.reduce((sum, l) => sum + l.duration, 0);

  // YouTube playlists don't have sections, so we wrap everything in one section
  const section: Section = {
    id: playlistId + '_section_0',
    title: 'Playlist',
    lectures,
    position: 0
  };

  const course: Course = {
    id: playlistId,
    title: playlistItems[0]?.snippet?.title || 'Untitled Course',
    description: playlistItems[0]?.snippet?.description || '',
    thumbnail: playlistItems[0]?.snippet?.thumbnails?.high?.url || '',
    sections: [section],
    totalLectures: lectures.length,
    totalDuration
  };

  return course;
};

const isoDurationToSeconds = (iso: string): number => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const [, hours, minutes, seconds] = iso.match(regex) || [];
  return (
    (parseInt(hours || '0', 10) * 3600) +
    (parseInt(minutes || '0', 10) * 60) +
    parseInt(seconds || '0', 10)
  );
};

/**
 * In a real implementation, this would fetch video details
 * For now, we're using mock data
 */
export const fetchVideoDetails = async (videoId: string): Promise<any> => {
  // This would be implemented with the YouTube API in a real app
  return {
    id: videoId,
    title: 'Mock Video Title',
    duration: 600, // 10 minutes
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  };
};