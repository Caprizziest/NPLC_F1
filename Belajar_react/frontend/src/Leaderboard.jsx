import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css'; 

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  // Fungsi ambil data
  const fetchScores = () => {
    fetch('http://127.0.0.1:8000/api/game/leaderboard/')
      .then(res => res.json())
      .then(data => setScores(data))
      .catch(err => console.error("Gagal ambil leaderboard:", err));
  };

  useEffect(() => {
    fetchScores();
    // Auto refresh setiap 2 detik (Realtime)
    const interval = setInterval(fetchScores, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- FUNGSI RESET DATA ---
  const handleReset = async () => {
    if (!confirm("Yakin ingin MENGHAPUS SEMUA data leaderboard?")) return;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/game/reset/', {
        method: 'POST' // Kita akan buat endpoint ini di Django sebentar lagi
      });
      
      if (res.ok) {
        alert("Leaderboard berhasil di-reset!");
        fetchScores(); // Refresh tampilan
      } else {
        alert("Gagal reset database.");
      }
    } catch (err) {
      console.error(err);
      alert("Error koneksi ke server.");
    }
  };

  return (
    <div className="game-container" style={{ textAlign: 'center' }}>
      <h1>Leaderboard</h1>
      
      <table className="presets-table" style={{ margin: '20px auto' }}>
        <thead>
          <tr style={{ background: '#333', color: 'white' }}>
            <th style={{ padding: '10px' }}>Rank</th>
            <th>Tim</th>
            <th>Skor</th>
            <th>Waktu Submit</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td style={{ fontWeight: 'bold' }}>{s.team_name}</td>
              <td style={{ color: '#646cff', fontSize: '1.2em' }}>{s.score}</td>
              
              {/* --- UPDATE TAMPILAN WAKTU DI SINI --- */}
              <td>
                {new Date(s.created_at).toLocaleString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric', // Tanggal
                  hour: '2-digit', minute: '2-digit', second: '2-digit', // Jam:Menit:Detik
                  hour12: false // Format 24 jam
                })}
              </td>
              
            </tr>
          ))}
          {scores.length === 0 && <tr><td colSpan="4">Belum ada data.</td></tr>}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {/* Tombol Kembali */}
        <Link to="/">
          <button>Kembali Main</button>
        </Link>

        {/* Tombol Reset (Warna Merah) */}
        <button 
          onClick={handleReset} 
          style={{ background: '#ff4444', border: '1px solid #cc0000' }}
        >
          Reset Data 🗑️
        </button>
      </div>
    </div>
  );
}