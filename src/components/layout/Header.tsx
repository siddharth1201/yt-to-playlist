import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Laptop, Home, BarChart2 } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  // Read user info from localStorage
  const user = React.useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  const navItems = [
    { icon: <Home size={18} />, label: 'Home', path: '/' },
    { icon: <Laptop size={18} />, label: 'Courses', path: '/courses' },
    { icon: <BarChart2 size={18} />, label: 'Progress', path: '/progress' }
  ];

  return (
    <header className="bg-background-secondary border-b border-background-accent">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: 0, ease: "easeInOut" }}
              className="mr-3 text-accent-primary"
            >
              <Laptop size={28} />
            </motion.div>
            <h1 className="text-xl font-bold text-text-primary">CourseTracker</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 relative ${
                    isActive ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-3 left-0 right-0 h-0.5 bg-accent-primary rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Mobile nav */}
            <div className="md:hidden flex items-center space-x-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2 rounded-full ${
                      isActive 
                        ? 'bg-background-accent text-accent-primary' 
                        : 'text-text-secondary hover:bg-background-accent hover:text-text-primary'
                    }`}
                  >
                    {item.icon}
                  </Link>
                );
              })}
            </div>
            {/* User profile picture */}
            {user && user.picture ? (
              <img
                src={user.picture}
                alt={user.name || user.email}
                title={user.email}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginLeft: 16 }}
              />
            ) : (
              <span className="text-text-secondary text-sm ml-2">Sign in</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};