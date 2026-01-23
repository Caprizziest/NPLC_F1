import { useState, useEffect } from 'react';
import Game from './Game';
import Leaderboard from './Leaderboard';
import { Link } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* URL "/" akan membuka Game */}
        <Route path="/" element={<Game />} />
        
        {/* URL "/leaderboard" akan membuka Leaderboard */}
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;





  // TO DO 
  // TIMER
  // LEADERBOARD