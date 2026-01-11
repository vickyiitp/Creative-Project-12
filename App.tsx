import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import GameInterface from './components/GameInterface';
import SimplePage from './components/SimplePage';
import { View } from './types';

function App() {
  const [view, setView] = useState<View>('landing');

  return (
    <>
      {view === 'landing' && <LandingPage onNavigate={setView} />}
      {view === 'game' && <GameInterface onExit={() => setView('landing')} />}
      {view === 'privacy' && <SimplePage title="Privacy Policy" type="privacy" onBack={() => setView('landing')} />}
      {view === 'terms' && <SimplePage title="Terms of Service" type="terms" onBack={() => setView('landing')} />}
    </>
  );
}

export default App;