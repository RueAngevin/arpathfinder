// App.tsx
import React, { useState } from 'react';
import RoleSelectScreen from './components/RoleSelectScreen';
import ShareLocationScreen from './components/ShareLocationScreen';
import TrackFriendScreen from './components/TrackFriendScreen';
import CameraPreview from './components/CameraPreview';

type Mode = 'select' | 'share' | 'track' | 'ar';

export default function App() {
  const [mode, setMode] = useState<Mode>('select');
  const [code, setCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');

  return (
    <>
      {mode === 'select' && (
        <RoleSelectScreen
          onShare={() => {
            const newCode = Math.random().toString(36).slice(2, 8).toUpperCase();
            setCode(newCode);
            setMode('share');
          }}
          onTrack={() => setMode('track')}
        />
      )}

      {mode === 'share' && (
        <ShareLocationScreen
          code={code}
          onBack={() => setMode('select')}
        />
      )}

      {mode === 'track' && (
        <TrackFriendScreen
          inputCode={inputCode}
          setInputCode={setInputCode}
          onStartTracking={() => {
            if (inputCode.trim().length === 6) {
              setMode('ar');
            } else {
              alert('Please enter a valid 6 character code');
            }
          }}
          onBack={() => setMode('select')}
        />
      )}

      {mode === 'ar' && (
        <CameraPreview code={inputCode} onExit={() => setMode('select')} />
      )}
    </>
  );
}
