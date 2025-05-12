import { get, set, del } from 'idb-keyval';
import { AppState, Course, Progress } from '../types';
import { getTodayDate } from '../utils/formatters';

// Storage keys
const APP_STATE_KEY = 'youtube-course-tracker-state';

// Default state
const defaultState: AppState = {
  courses: [],
  currentCourse: null,
  progress: {}
};

/**
 * Load the app state from IndexedDB
 */
export const loadState = async (): Promise<AppState> => {
  try {
    const state = await get<AppState>(APP_STATE_KEY);
    return state || defaultState;
  } catch (err) {
    console.error('Error loading state from IndexedDB:', err);
    return defaultState;
  }
};

/**
 * Save the app state to IndexedDB
 */
export const saveState = async (state: AppState): Promise<void> => {
  try {
    await set(APP_STATE_KEY, state);
  } catch (err) {
    console.error('Error saving state to IndexedDB:', err);
  }
};

/**
 * Attempt to save reduced state when storage quota is exceeded
 */
const saveReducedState = async (state: AppState): Promise<void> => {
  try {
    const reducedState: AppState = {
      courses: state.courses,
      currentCourse: state.currentCourse,
      progress: {}
    };
    if (state.currentCourse) {
      reducedState.progress[state.currentCourse.id] = state.progress[state.currentCourse.id];
    }
    await set(APP_STATE_KEY, reducedState);
  } catch (err) {
    console.error('Failed to save even reduced state:', err);
  }
};

/**
 * Save a course to the storage
 */
export const saveCourse = async (course: Course): Promise<void> => {
  const state = await loadState();
  const courseIndex = state.courses.findIndex(c => c.id === course.id);

  if (courseIndex >= 0) {
    state.courses[courseIndex] = course;
  } else {
    state.courses.push(course);
  }

  if (!state.progress[course.id]) {
    state.progress[course.id] = {
      courseId: course.id,
      completedLectures: [],
      lastWatched: {
        lectureId: '',
        timestamp: 0,
        lastAccessed: Date.now()
      },
      dailyProgress: {
        [getTodayDate()]: {
          date: getTodayDate(),
          completedCount: 0,
          minutesWatched: 0
        }
      }
    };
  }

  state.currentCourse = course;
  await saveState(state);
};

/**
 * Mark a lecture as completed
 */
export const markLectureCompleted = async (courseId: string, lectureId: string): Promise<void> => {
  const state = await loadState();
  const progress = state.progress[courseId];
  if (!progress) return;

  if (!progress.completedLectures.includes(lectureId)) {
    progress.completedLectures.push(lectureId);

    const today = getTodayDate();
    if (!progress.dailyProgress[today]) {
      progress.dailyProgress[today] = {
        date: today,
        completedCount: 0,
        minutesWatched: 0
      };
    }
    progress.dailyProgress[today].completedCount += 1;
    await saveState(state);
  }
};

/**
 * Mark a lecture as not completed
 */
export const markLectureNotCompleted = async (courseId: string, lectureId: string): Promise<void> => {
  const state = await loadState();
  const progress = state.progress[courseId];
  if (!progress) return;

  progress.completedLectures = progress.completedLectures.filter(id => id !== lectureId);
  await saveState(state);
};

/**
 * Update last watched position for a lecture
 */
export const updateLastWatched = async (courseId: string, lectureId: string, timestamp: number): Promise<void> => {
  const state = await loadState();
  const progress = state.progress[courseId];
  if (!progress) return;

  progress.lastWatched = {
    lectureId,
    timestamp,
    lastAccessed: Date.now()
  };

  const today = getTodayDate();
  if (!progress.dailyProgress[today]) {
    progress.dailyProgress[today] = {
      date: today,
      completedCount: 0,
      minutesWatched: 0
    };
  }
  progress.dailyProgress[today].minutesWatched += 1;
  await saveState(state);
};

/**
 * Get course progress statistics
 */
export const getCourseProgress = async (courseId: string): Promise<Progress | null> => {
  const state = await loadState();
  return state.progress[courseId] || null;
};

/**
 * Get all saved courses
 */
export const getAllCourses = async (): Promise<Course[]> => {
  const state = await loadState();
  return state.courses;
};

/**
 * Get course by ID
 */
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  const state = await loadState();
  return state.courses.find(course => course.id === courseId) || null;
};

/**
 * Delete a course and its progress data
 */
export const deleteCourse = async (courseId: string): Promise<void> => {
  const state = await loadState();
  state.courses = state.courses.filter(course => course.id !== courseId);
  delete state.progress[courseId];
  if (state.currentCourse && state.currentCourse.id === courseId) {
    state.currentCourse = null;
  }
  await saveState(state);
};

/**
 * Export all user data to a JSON file for backup
 */
export const exportData = async (): Promise<void> => {
  try {
    const state = await loadState();
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `youtube-course-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  } catch (err) {
    console.error('Error exporting data:', err);
  }
};

/**
 * Import data from a JSON file backup
 */
export const importData = async (jsonFile: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = async (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('Invalid file content');
        }
        const importedState: AppState = JSON.parse(event.target.result);
        if (!importedState.courses || !importedState.progress) {
          throw new Error('Invalid data structure in the imported file');
        }
        await saveState(importedState);
        resolve(true);
      } catch (err) {
        console.error('Error importing data:', err);
        reject(err);
      }
    };

    fileReader.onerror = () => {
      reject(new Error('Error reading the file'));
    };

    fileReader.readAsText(jsonFile);
  });
};

/**
 * Check available storage size in IndexedDB
 * Returns approximate size in MB
 */
export const checkStorageSize = async (): Promise<number> => {
  try {
    const state = await loadState();
    const serializedState = JSON.stringify(state);
    const sizeInBytes = new Blob([serializedState]).size;
    return sizeInBytes / (1024 * 1024); // Convert to MB
  } catch (err) {
    console.error('Error calculating storage size:', err);
    return 0;
  }
};

/**
 * Clear all data from storage
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await del(APP_STATE_KEY);
  } catch (err) {
    console.error('Error clearing data:', err);
  }
};