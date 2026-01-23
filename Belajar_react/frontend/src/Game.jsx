import { useState, useEffect } from 'react';
// Hapus import useNavigate/Link jika ada, karena pemain tidak boleh pindah halaman
import './App.css';

// Konfigurasi Waktu Total (dalam detik)
const TOTAL_GAME_TIME = 120; // 1 Menit

const PRESETS = [
  { id: 'p1', ops: ['*', '*', '+'], label: '× × +' },
  { id: 'p2', ops: ['+', '*', '+'], label: '+ × +' },
  { id: 'p3', ops: ['+', '+', '*'], label: '+ + ×' },
  { id: 'p4', ops: ['*', '+', '-'], label: '× + -' },
  { id: 'p5', ops: ['*', '-', '*'], label: '× - ×' },
  { id: 'p6', ops: ['*', '+', '*'], label: '× + ×' },
  { id: 'p7', ops: ['*', '-', '-'], label: '× - -' },
  { id: 'p8', ops: ['-', '+', '*'], label: '- + ×' },
];

function Game() {
  // === 1. STATE MANAGEMENT ===
  // Status Game: "MENU" -> "PLAYING" -> "TRANSITION" -> "FINISHED"
  const [gameState, setGameState] = useState("MENU"); 
  const [timeLeft, setTimeLeft] = useState(TOTAL_GAME_TIME); 
  const [teamName, setTeamName] = useState("");
  const [roundScore, setRoundScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  
  // State Gameplay
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(0);
  const [poolNumbers, setPoolNumbers] = useState([]);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState(null);
  const [selectedOps, setSelectedOps] = useState(['?', '?', '?']);

  // === 2. LOGIKA TIMER GLOBAL ===
  useEffect(() => {
    let timerId;
    
    // Timer hanya berjalan saat status PLAYING.
    // Saat status TRANSITION (popup hasil), timer otomatis PAUSE.
    if (gameState === "PLAYING" && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } 
    // JIKA WAKTU HABIS
    else if (gameState === "PLAYING" && timeLeft === 0) {
      finishGame(); // Panggil fungsi selesai game
    }
    return () => clearInterval(timerId);
  }, [gameState, timeLeft]);


  // === 3. LOGIKA UTAMA ===

  // A. Mulai Game (Set Waktu Global di sini)
  const startGame = () => {
    if (!teamName) return alert("Masukkan nama tim dulu!");
    setScore(0);
    setTimeLeft(TOTAL_GAME_TIME); // Set waktu total 3 menit
    startNewRound();
  };

  // B. Siapkan Ronde Baru
  const startNewRound = async () => {
    // Cek dulu apakah waktu sudah habis sebelum mulai ronde baru
    if (timeLeft <= 0) {
        finishGame();
        return;
    }

    setGameState("PLAYING"); 
    // CATATAN: Jangan reset setTimeLeft di sini agar waktu terus berkurang dari total
    
    setSlots([null, null, null, null]);
    setSelectedOps(['?', '?', '?']);
    setFeedback("");
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/game/start/');
      const data = await res.json();
      setTarget(data.target);
      setPoolNumbers(data.numbers.map((num, i) => ({ id: i, value: num, used: false })));
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  // C. Logika Game Selesai (Waktu Habis)
  const finishGame = async () => {
    setGameState("FINISHED"); // Pindah ke layar akhir
    
    // Kirim skor ke backend secara otomatis
    try {
      await fetch('http://127.0.0.1:8000/api/game/submit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: teamName,
          score: score // Skor terakhir yang tercatat
        })
      });
      // Tidak perlu navigate ke leaderboard. Biarkan user di layar FINISHED.
    } catch (error) {
      console.error("Gagal save skor:", error);
      alert("Gagal menyimpan skor ke server. Panggil panitia!");
    }
  };

  // D. Akhiri Ronde (Dipanggil saat Submit Sukses)
  const handleRoundEnd = (points, msg) => {
    setRoundScore(points);
    setScore(prev => prev + points);
    setFeedback(msg);
    setGameState("TRANSITION"); // Ini akan men-trigger PAUSE pada timer di useEffect
  };

  // E. Submit Jawaban
  const handleSubmit = () => {
    if (slots.some(s => s === null)) return alert("Isi semua slot angka!");
    if (selectedOps[0] === '?') return alert("Pilih operator dulu!");

    const v = slots.map(s => s.value);
    const o = selectedOps;
    const formula = `${v[0]} ${o[0]} ${v[1]} ${o[1]} ${v[2]} ${o[2]} ${v[3]}`;
    
    let result = 0;
    try { result = new Function('return ' + formula)(); } 
    catch { return alert("Error hitung"); }

    const dist = Math.abs(target - result);
    let pts = 0;
    let msg = "";

    if (dist > 10) {
      msg = `SALAH! Hasil: ${result} (Jauh dari target ${target})`;
    } else {
      if (dist <= 1) pts = 100;
      else pts = 100 - ((dist - 1) * 5);
      msg = `BENAR! Hasil: ${result} (+${pts} Poin)`;
    }

    handleRoundEnd(pts, msg);
  };

  // --- Helper Click Handlers ---
  const handleSlotsClick = (slotIndex) => {
    if (slots[slotIndex] !== null) {
      const item = slots[slotIndex];
      const newSlots = [...slots]; newSlots[slotIndex] = null; setSlots(newSlots);
      setPoolNumbers(poolNumbers.map(n => n.id === item.id ? {...n, used: false} : n));
      return;
    }
    if (selectedPoolIndex !== null) {
      const item = poolNumbers[selectedPoolIndex];
      const newSlots = [...slots]; newSlots[slotIndex] = item; setSlots(newSlots);
      const newPool = [...poolNumbers]; newPool[selectedPoolIndex].used = true; setPoolNumbers(newPool);
      setSelectedPoolIndex(null);
    }
  };

  const handlePoolClick = (index) => {
    if (!poolNumbers[index].used) setSelectedPoolIndex(index);
  };

  // === 4. RENDER TAMPILAN ===
  return (
    <div className="game-container">
      
      {/* HEADER: Skor & Timer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
           <h1 style={{margin: 0}}>NPLC F1</h1>
           {teamName && <small style={{color: '#888'}}>Tim: {teamName}</small>}
        </div>
        <div style={{ textAlign: 'right' }}>
           <div className="score-box" style={{ background: '#333', color: 'white', padding: '5px 15px', borderRadius: '8px' }}>
             Total Skor: {score}
           </div>
           {/* Timer */}
           <div style={{ marginTop: '5px', fontWeight: 'bold', color: timeLeft <= 10 ? '#ff4444' : 'white' }}>
             Sisa Waktu: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
           </div>
        </div>
      </div>

      {/* --- MODAL 1: INPUT NAMA (Status: MENU) --- */}
      {gameState === "MENU" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Selamat Datang</h2>
            <p>Game berlangsung selama 3 Menit.</p>
            <input 
              placeholder="Nama Tim..." 
              value={teamName} 
              onChange={e => setTeamName(e.target.value)} 
            />
            <button onClick={startGame} style={{width: '100%'}}>MULAI WAKTU</button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: HASIL RONDE (Status: TRANSITION) --- */}
      {gameState === "TRANSITION" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Ronde Selesai</h2>
            <p style={{fontSize: '1.2em', margin: '10px 0'}}>{feedback}</p>
            {/* <p style={{fontSize: '0.9em', color: '#aaa'}}>Timer dipause saat layar ini muncul.</p> */}
            
            <div style={{ fontSize: '3em', fontWeight: 'bold', color: '#646cff', margin: '20px 0' }}>
              +{roundScore}
            </div>
            
            <button onClick={startNewRound} style={{width: '100%'}}>
              RONDE BERIKUTNYA
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 3: GAME OVER (Status: FINISHED) --- */}
      {gameState === "FINISHED" && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderColor: '#ff4444' }}>
            <h2>WAKTU HABIS!</h2>
            <p>Terima kasih telah bermain.</p>
            
            <div style={{ margin: '30px 0' }}>
              <div style={{ fontSize: '1.2em' }}>Skor Akhir Tim {teamName}:</div>
              <div style={{ fontSize: '4em', fontWeight: 'bold', color: '#ff4444' }}>
                {score}
              </div>
            </div>
            
            <p style={{color: '#888'}}>Skor telah disimpan ke sistem.</p>
            <p style={{color: '#888'}}>Silakan panggil panitia.</p>
            
            <button onClick={() => window.location.reload()} style={{marginTop: '20px', background: '#555'}}>
              Reset Game (Untuk Tim Baru)
            </button>
          </div>
        </div>
      )}

      {/* --- AREA GAMEPLAY --- */}
      <div style={{ filter: gameState !== "PLAYING" ? 'blur(4px)' : 'none', pointerEvents: gameState !== "PLAYING" ? 'none' : 'auto' }}>
         
         <div id="number-pool">
            {poolNumbers.map((num, i) => (
              <div key={num.id} className={`num ${num.used?'used':''} ${selectedPoolIndex===i?'active':''}`}
                   onClick={() => handlePoolClick(i)}>{num.value}</div>
            ))}
         </div>

         <div id="expression">
            <div className="slot" onClick={() => handleSlotsClick(0)}>{slots[0]?.value}</div>
            <span className="op">{selectedOps[0].replace('*', '×')}</span>
            <div className="slot" onClick={() => handleSlotsClick(1)}>{slots[1]?.value}</div>
            <span className="op">{selectedOps[1].replace('*', '×')}</span>
            <div className="slot" onClick={() => handleSlotsClick(2)}>{slots[2]?.value}</div>
            <span className="op">{selectedOps[2].replace('*', '×')}</span>
            <div className="slot" onClick={() => handleSlotsClick(3)}>{slots[3]?.value}</div>
            <span className="equals">=</span>
            <span id="target">{target}</span>
         </div>

         <div id="operator-presets">
            <div className="presets-grid"> 
              {PRESETS.map((p) => (
                <label key={p.id} className="preset-label">
                  <input type="radio" name="ops" checked={selectedOps === p.ops} 
                         onChange={() => setSelectedOps(p.ops)} />
                  <div className="preset-display">{p.label}</div>
                </label>
              ))}
            </div>
         </div>

         <button id="submit" onClick={handleSubmit}>Kirim Jawaban</button>
      </div>

    </div>
  );
}

export default Game;




  // TO DO 
  // TIMER
  // LEADERBOARD