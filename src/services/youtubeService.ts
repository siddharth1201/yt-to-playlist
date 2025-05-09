import axios from 'axios';
import { Course, Lecture, Section } from '../types';



// import { extractPlaylistId } from '../utils/formatters';

// Mock data for development purposes since we can't actually use the YouTube API without a key
// In a real app, you would use the YouTube API with proper authentication
const generateMockCourseData = (playlistUrl: string): Course => {
  const playlistId = extractPlaylistId(playlistUrl) || 'default-playlist';
  
  // Generate a mock course structure
  const mockSections: Section[] = [
    {
      id: 'section-1',
      title: 'Getting Started',
      position: 1,
      lectures: [
        {
          id: 'lecture-1-1',
          title: 'Introduction to the Course',
          videoId: 'dQw4w9WgXcQ', // Just a placeholder YouTube video ID
          duration: 320,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 1
        },
        {
          id: 'lecture-1-2',
          title: 'Setting Up Your Development Environment',
          videoId: 'dQw4w9WgXcQ',
          duration: 525,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 2
        },
        {
          id: 'lecture-1-3',
          title: 'Project Overview',
          videoId: 'dQw4w9WgXcQ',
          duration: 410,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 3
        }
      ]
    },
    {
      id: 'section-2',
      title: 'Core Concepts',
      position: 2,
      lectures: [
        {
          id: 'lecture-2-1',
          title: 'Understanding the Basics',
          videoId: 'dQw4w9WgXcQ',
          duration: 620,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 1
        },
        {
          id: 'lecture-2-2',
          title: 'Working with Components',
          videoId: 'dQw4w9WgXcQ',
          duration: 580,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 2
        },
        {
          id: 'lecture-2-3',
          title: 'State Management',
          videoId: 'dQw4w9WgXcQ',
          duration: 730,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 3
        },
        {
          id: 'lecture-2-4',
          title: 'Handling User Input',
          videoId: 'dQw4w9WgXcQ',
          duration: 495,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 4
        }
      ]
    },
    {
      id: 'section-3',
      title: 'Advanced Topics',
      position: 3,
      lectures: [
        {
          id: 'lecture-3-1',
          title: 'Optimization Techniques',
          videoId: 'dQw4w9WgXcQ',
          duration: 820,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 1
        },
        {
          id: 'lecture-3-2',
          title: 'Advanced Patterns',
          videoId: 'dQw4w9WgXcQ',
          duration: 930,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 2
        },
        {
          id: 'lecture-3-3',
          title: 'Building for Production',
          videoId: 'dQw4w9WgXcQ',
          duration: 850,
          thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          position: 3
        }
      ]
    }
  ];
  
  // Calculate total statistics
  let totalLectures = 0;
  let totalDuration = 0;
  
  mockSections.forEach(section => {
    totalLectures += section.lectures.length;
    section.lectures.forEach(lecture => {
      totalDuration += lecture.duration;
    });
  });
  
  return {
    id: playlistId,
    title: 'Complete Web Development Bootcamp',
    description: 'Learn web development from scratch with this comprehensive tutorial series covering HTML, CSS, JavaScript, and modern frameworks.',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    sections: mockSections,
    totalLectures,
    totalDuration
  };
};

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