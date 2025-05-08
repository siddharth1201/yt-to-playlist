export interface Lecture {
  id: string;
  title: string;
  videoId: string;
  duration: number; // in seconds
  thumbnail: string;
  position: number;
}

export interface Section {
  id: string;
  title: string;
  lectures: Lecture[];
  position: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  sections: Section[];
  totalLectures: number;
  totalDuration: number; // in seconds
}

export interface Progress {
  courseId: string;
  completedLectures: string[]; // lecture ids
  lastWatched: {
    lectureId: string;
    timestamp: number; // in seconds
    lastAccessed: number; // unix timestamp
  };
  dailyProgress: Record<string, {
    date: string;
    completedCount: number;
    minutesWatched: number;
  }>;
}

export interface DailyProgressStats {
  date: string;
  completedCount: number;
  minutesWatched: number;
}

export interface AppState {
  courses: Course[];
  currentCourse: Course | null;
  progress: Record<string, Progress>;
}