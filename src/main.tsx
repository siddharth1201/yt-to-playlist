import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="68023862060-v1gvil962ta6041edgkf5iqluu35tjba.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);