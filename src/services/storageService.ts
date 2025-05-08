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
 * Load the app state from localStorage
 */
export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(APP_STATE_KEY);
    if (!serializedState) return defaultState;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return defaultState;
  }
};

/**
 * Save the app state to localStorage
 */
export const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(APP_STATE_KEY, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
    // Notify user if storage fails (e.g., quota exceeded)
    if (err instanceof DOMException && err.code === 22) {
      console.warn('Storage quota exceeded. Some data may not be saved.');
      // Attempt to save critical data only
      saveReducedState(state);
    }
  }
};

/**
 * Attempt to save reduced state when storage quota is exceeded
 */
const saveReducedState = (state: AppState): void => {
  try {
    // Create a reduced version of the state with only essential data
    const reducedState: AppState = {
      courses: state.courses,
      currentCourse: state.currentCourse,
      progress: {} // We'll add only current course progress
    };
    
    // Add progress for current course if available
    if (state.currentCourse) {
      reducedState.progress[state.currentCourse.id] = state.progress[state.currentCourse.id];
    }
    
    const serializedReducedState = JSON.stringify(reducedState);
    localStorage.setItem(APP_STATE_KEY, serializedReducedState);
  } catch (err) {
    console.error('Failed to save even reduced state:', err);
  }
};

/**
 * Save a course to the storage
 */
export const saveCourse = (course: Course): void => {
  const state = loadState();
  
  // Check if course already exists
  const courseIndex = state.courses.findIndex(c => c.id === course.id);
  
  if (courseIndex >= 0) {
    // Update existing course
    state.courses[courseIndex] = course;
  } else {
    // Add new course
    state.courses.push(course);
  }

  // Initialize progress tracking if it doesn't exist
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
  
  // Set as current course
  state.currentCourse = course;
  
  saveState(state);
};

/**
 * Mark a lecture as completed
 */
export const markLectureCompleted = (courseId: string, lectureId: string): void => {
  const state = loadState();
  const progress = state.progress[courseId];
  
  if (!progress) return;
  
  // Check if lecture is already marked as completed
  if (!progress.completedLectures.includes(lectureId)) {
    progress.completedLectures.push(lectureId);
    
    // Update daily progress
    const today = getTodayDate();
    if (!progress.dailyProgress[today]) {
      progress.dailyProgress[today] = {
        date: today,
        completedCount: 0,
        minutesWatched: 0
      };
    }
    
    progress.dailyProgress[today].completedCount += 1;
    
    // Save the updated state
    saveState(state);
  }
};

/**
 * Mark a lecture as not completed
 */
export const markLectureNotCompleted = (courseId: string, lectureId: string): void => {
  const state = loadState();
  const progress = state.progress[courseId];
  
  if (!progress) return;
  
  // Remove lecture from completed lectures
  progress.completedLectures = progress.completedLectures.filter(id => id !== lectureId);
  
  // Save the updated state
  saveState(state);
};

/**
 * Update last watched position for a lecture
 */
export const updateLastWatched = (courseId: string, lectureId: string, timestamp: number): void => {
  const state = loadState();
  const progress = state.progress[courseId];
  
  if (!progress) return;
  
  progress.lastWatched = {
    lectureId,
    timestamp,
    lastAccessed: Date.now()
  };
  
  // Update daily progress for minutes watched
  const today = getTodayDate();
  if (!progress.dailyProgress[today]) {
    progress.dailyProgress[today] = {
      date: today,
      completedCount: 0,
      minutesWatched: 0
    };
  }
  
  // Add a minute to the watched time (simplified)
  progress.dailyProgress[today].minutesWatched += 1;
  
  saveState(state);
};

/**
 * Get course progress statistics
 */
export const getCourseProgress = (courseId: string): Progress | null => {
  const state = loadState();
  return state.progress[courseId] || null;
};

/**
 * Get all saved courses
 */
export const getAllCourses = (): Course[] => {
  const state = loadState();
  return state.courses;
};

/**
 * Get course by ID
 */
export const getCourseById = (courseId: string): Course | null => {
  const state = loadState();
  return state.courses.find(course => course.id === courseId) || null;
};

/**
 * Delete a course and its progress data
 */
export const deleteCourse = (courseId: string): void => {
  const state = loadState();
  
  // Remove course
  state.courses = state.courses.filter(course => course.id !== courseId);
  
  // Remove progress data
  delete state.progress[courseId];
  
  // Clear current course if it's the one being deleted
  if (state.currentCourse && state.currentCourse.id === courseId) {
    state.currentCourse = null;
  }
  
  saveState(state);
};

/**
 * Export all user data to a JSON file for backup
 */
export const exportData = (): void => {
  try {
    const state = loadState();
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
export const importData = (jsonFile: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    
    fileReader.onload = (event) => {
      try {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('Invalid file content');
        }
        
        const importedState: AppState = JSON.parse(event.target.result);
        
        // Validate the imported data structure
        if (!importedState.courses || !importedState.progress) {
          throw new Error('Invalid data structure in the imported file');
        }
        
        // Save the imported state
        saveState(importedState);
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
 * Check available storage space in localStorage
 * Returns approximate size in MB
 */
export const checkStorageSize = (): number => {
  try {
    const state = loadState();
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
export const clearAllData = (): void => {
  try {
    localStorage.removeItem(APP_STATE_KEY);
  } catch (err) {
    console.error('Error clearing data:', err);
  }
};