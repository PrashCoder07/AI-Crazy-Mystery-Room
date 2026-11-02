import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import InvestigationRoom from './pages/InvestigationRoom.jsx';

function readSession() {
  try { return JSON.parse(localStorage.getItem('amr-session') || 'null'); } catch { return null; }
}

export default function App() {
  const [session, setSession] = useState(readSession);

  function onAuth(nextSession) {
    localStorage.setItem('amr-session', JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function signOut() {
    localStorage.removeItem('amr-session');
    setSession(null);
  }

  return (
    <Routes>
      <Route path="/" element={<Home session={session} onAuth={onAuth} onSignOut={signOut} />} />
      <Route path="/case/:id" element={session?.token ? <InvestigationRoom session={session} onExit={() => window.location.assign('/')} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
