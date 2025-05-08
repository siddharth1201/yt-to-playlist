import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Youtube, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { PageTransition } from '../components/animations/PageTransition';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { extractPlaylistId } from '../utils/formatters';
import { fetchPlaylistData } from '../services/youtubeService';
import { saveCourse } from '../services/storageService';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!playlistUrl.trim()) {
      setError('Please enter a YouTube playlist URL');
      return;
    }
    
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      setError('Invalid YouTube playlist URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const courseData = await fetchPlaylistData(playlistUrl);
      saveCourse(courseData);
      
      // Redirect to the course page
      navigate(`/courses/${courseData.id}`);
    } catch (err) {
      console.error('Error fetching playlist:', err);
      setError('Failed to fetch playlist data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Animation for the background elements
  React.useEffect(() => {
    const elements = document.querySelectorAll('.floating-element');
    
    elements.forEach(element => {
      const delay = Math.random() * 2;
      const duration = 3 + Math.random() * 2;
      
      gsap.to(element, {
        y: '-20px',
        duration,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay
      });
    });
  }, []);
  
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden flex flex-col">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-element absolute top-20 left-[10%] w-20 h-20 rounded-full bg-accent-primary/10"></div>
          <div className="floating-element absolute top-40 right-[15%] w-24 h-24 rounded-full bg-accent-secondary/10"></div>
          <div className="floating-element absolute bottom-20 left-[20%] w-16 h-16 rounded-full bg-accent-tertiary/10"></div>
          <div className="floating-element absolute bottom-40 right-[25%] w-32 h-32 rounded-full bg-accent-primary/10"></div>
        </div>
        
        <div className="flex-1 flex items-center justify-center container mx-auto px-4 py-12 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl w-full"
          >
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 bg-accent-primary rounded-full flex items-center justify-center text-white"
              >
                <Youtube size={40} />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent"
              >
                Transform YouTube into Your Personal Learning Platform
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-text-secondary text-lg mb-8"
              >
                Track your progress, manage your learning journey, and never lose your place in tutorial playlists again.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-background-secondary p-6 rounded-xl shadow-medium border border-background-accent"
            >
              <form onSubmit={handleSubmit}>
                <Input
                  label="YouTube Playlist URL"
                  placeholder="https://www.youtube.com/playlist?list=PLxxxxxx"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  error={error}
                  fullWidth
                  startIcon={<Youtube size={18} />}
                  className="mb-4"
                />
                
                <Button 
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  fullWidth
                  endIcon={<ArrowRight size={18} />}
                >
                  Create Course
                </Button>
              </form>
              
              <div className="mt-4 text-sm text-text-muted">
                <p>Example: <code className="bg-background-accent px-2 py-1 rounded text-text-secondary">https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d</code></p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8 text-center text-text-muted"
            >
              <p>Already have courses? <a href="/courses" className="text-accent-primary underline">View your courses</a></p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};