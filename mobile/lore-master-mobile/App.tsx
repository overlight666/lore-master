import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { GameProvider } from './src/contexts/GameContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <RootNavigator />
      </GameProvider>
    </AuthProvider>
  );
}
