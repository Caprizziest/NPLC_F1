  import { useState, useEffect } from 'react';
  import './App.css';


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


  function App() {

  const [target, setTarget] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [poolNumbers, setPoolNumbers] = useState([]);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState(null);
  const [slots, setSlots] = useState([null, null, null, null]);

  const [selectedOps, setSelectedOps] = useState(['?', '?', '?']);
  const [feedback, setFeedback] = useState("");

  const [score, setScore] = useState(0);

const fetchNewRound = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/game/start/');
      const data = await res.json();
      
      setTarget(data.target);
      
      const numberObjects = data.numbers.map((num, index) => ({
        id: index,
        value: num,
        used: false
      }));

      setPoolNumbers(numberObjects);
      
      // RESET BOARD FOR NEW ROUND
      setSlots([null, null, null, null]);
      setSelectedOps(['?', '?', '?']);
      setFeedback(""); 
      
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  useEffect(() => {
    fetchNewRound(); 
  }, []);


const handleSlotsClick = (slotIndex) => {
  
  if (slots[slotIndex] !== null) {
    const itemToReturn = slots[slotIndex];

    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);

    const newPool = poolNumbers.map(n => 
      n.id === itemToReturn.id ? {...n, used: false} : n
    );
    setPoolNumbers(newPool);
    
    return; 
  }

  if (selectedPoolIndex !== null) {
    const selectedItem = poolNumbers[selectedPoolIndex];

    const newSlots = [...slots];
    newSlots[slotIndex] = selectedItem;
    setSlots(newSlots);

    const newPool = [...poolNumbers];
    newPool[selectedPoolIndex].used = true;
    setPoolNumbers(newPool);

    setSelectedPoolIndex(null);
  }
};


const handlePoolClick = (index) => {
  if (poolNumbers[index].used) return;
  

  setSelectedPoolIndex(index);
};



const handleSubmit = () => {
  // --- VALIDATION (Keep this the same) ---
  if (slots.some(slot => slot === null)) {
    setFeedback("Semua slot angka harus diisi!");
    return;
  }
  if (selectedOps[0] === '?') {
    setFeedback("Pilih pola operator dulu!");
    return;
  }

  // --- CALCULATION ---
  const v = slots.map(s => s.value); 
  const o = selectedOps;
  const formulaStr = `${v[0]} ${o[0]} ${v[1]} ${o[1]} ${v[2]} ${o[2]} ${v[3]}`;
  
  let result = 0;
  try {
    result = new Function('return ' + formulaStr)();
  } catch (e) {
    setFeedback("Error menghitung rumus");
    return;
  }

  // --- SCORING SYSTEM ---
  const distance = Math.abs(target - result);
  let pointsEarned = 0;

  // 1. Logic: Outside Range = 0 pts
  if (distance > 10) {
    setFeedback(`SALAH! Hasil: ${result} (Selisih: ${distance}). Tidak dapat poin.`);
  } 
  // 2. Logic: Inside Range = Calculate Points
  else {
    if (distance <= 1) {
      pointsEarned = 100;
    } else {
      // Formula: 100 - 5 points for every step away beyond 1
      pointsEarned = 100 - ((distance - 1) * 5);
    }
    
    // Update Score
    setScore(prevScore => prevScore + pointsEarned);
    setFeedback(`BENAR! Hasil: ${result}. Poin: +${pointsEarned}`);
    
    // AUTOMATICALLY START NEXT ROUND
    // We use setTimeout so the user can see "Correct!" for 1.5 seconds before it changes
  }
      setTimeout(() => {
      fetchNewRound();
    }, 1500);
};

    return(
    <div className="game-container">

      {/* SCOREBOARD HEADER */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h1>NPLC F1</h1>
      <div className="score-box" style={{ background: '#333', color: '#fff', padding: '10px 20px', borderRadius: '8px' }}>
        <h2>Score: {score}</h2>
      </div>
    </div>

<div id="number-pool">
      {poolNumbers.map((numObj, index) => (
        <div 
          key={numObj.id} 
          className={`num ${numObj.used ? 'used' : ''} ${selectedPoolIndex === index ? 'active' : ''}`}
          onClick={() => handlePoolClick(index)}
        >
          {numObj.value}
        </div>
      ))}
    </div>

<div id="expression">
  <div className="slot" onClick={() => handleSlotsClick(0)}>
    {slots[0]?.value}
  </div>

  {/* Operator 1 */}
  <span className="op">{selectedOps[0].replace('*', '×')}</span>

  <div className="slot" onClick={() => handleSlotsClick(1)}>
    {slots[1]?.value}
  </div>

  {/* Operator 2 */}
  <span className="op">{selectedOps[1].replace('*', '×')}</span>

  <div className="slot" onClick={() => handleSlotsClick(2)}>
     {slots[2]?.value}
  </div>

  {/* Operator 3 */}
  <span className="op">{selectedOps[2].replace('*', '×')}</span>

  <div className="slot" onClick={() => handleSlotsClick(3)}>
    {slots[3]?.value}
  </div>

  <span className="equals">=</span>
  <span id="target">{target}</span>
</div>

<div id="operator-presets">
  <h3>Pilih Pola Operator:</h3>
  <div className="presets-grid"> 
    {PRESETS.map((preset) => (
      <label key={preset.id} className="preset-label">
        <input
          type="radio"
          name="ops"
          value={preset.id}
          onChange={() => setSelectedOps(preset.ops)}
        />
        <div className="preset-display">{preset.label}</div>
      </label>
    ))}
  </div>
</div>  



<button id="submit" onClick={handleSubmit}>Kirim</button>
<div id="result">{feedback}</div>

  </div>
    );
  }

  export default App;
