// App.tsx
import React, { useState } from 'react';
import RoleSelectScreen from './components/RoleSelectScreen';
import ShareLocationScreen from './components/ShareLocationScreen';
import TrackFriendScreen from './components/TrackFriendScreen';
import CameraPreview from './components/CameraPreview';

type Mode = 'select' | 'share' | 'track' | 'ar';

export default function App() {
  const [mode, setMode] = useState<Mode>('ar');
  const [code, setCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');

  return (
    <>

      {mode === 'ar' && (
        <CameraPreview code={inputCode} onExit={() => setMode('select')} />
      )}
    </>
  );
}
