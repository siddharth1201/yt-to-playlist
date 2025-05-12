import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleSignInPopupProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  onClose: () => void;
}

const GoogleSignInPopup: React.FC<GoogleSignInPopupProps> = ({ onSuccess, onError, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 20,
    right: 20,
    background: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    padding: 24,
    borderRadius: 8,
    zIndex: 1000,
    minWidth: 280
  }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>&times;</button>
    </div>
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      width="100%"
      text="signin_with"
      shape="pill"
      theme="outline"
    />
    <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
      Sign in with Google to save your course
    </div>
  </div>
);

export default GoogleSignInPopup;