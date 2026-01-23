// src/Leaderboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css'; // Pakai style yang sama

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    // Ambil data dari Backend Django Anda
    fetch('http://127.0.0.1:8000/api/game/leaderboard/')
      .then(res => res.json())
      .then(data => setScores(data))
      .catch(err => console.error("Gagal ambil leaderboard:", err));
  }, []);

  return (
    <div className="game-container" style={{ textAlign: 'center' }}>
      <h1>🏆 Leaderboard 🏆</h1>
      
      <table className="presets-table" style={{ margin: '20px auto' }}>
        <thead>
          <tr style={{ background: '#333', color: 'white' }}>
            <th style={{ padding: '10px' }}>Rank</th>
            <th>Tim</th>
            <th>Skor</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td style={{ fontWeight: 'bold' }}>{s.team_name}</td>
              <td style={{ color: '#646cff', fontSize: '1.2em' }}>{s.score}</td>
              <td>{new Date(s.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tombol Kembali ke Game */}
      <Link to="/">
        <button style={{ marginTop: '20px' }}>Kembali Main</button>
      </Link>
    </div>
  );
}