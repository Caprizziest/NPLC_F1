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

useEffect(() => {
  const fetchData = async () => {
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
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };
  fetchData(); 
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
  // 1. Check if any slot is empty (null)
  if (slots.some(s => s === null)) {
    setFeedback("Semua slot angka harus diisi!");
    return;
  }

  // 2. Check if operators are selected (default is '?')
  if (selectedOps[0] === '?') {
    setFeedback("Pilih pola operator dulu!");
    return;
  }

  try {
    // 3. Construct the formula string
    // We map the slots to get values, and zip them with operators
    const values = slots.map(s => s.value);
    const ops = selectedOps;
    
    // Template Literal: Clean and readable
    const formulaStr = `${values[0]} ${ops[0]} ${values[1]} ${ops[1]} ${values[2]} ${ops[2]} ${values[3]}`;

    // 4. Execute safely
    // We explicitly cast the result to a Number just to be sure
    const result = Number(new Function('return ' + formulaStr)());
    
    // 5. Check against Target
    const min = target - 10;
    const max = target + 10;

    if (result >= min && result <= max) {
      setFeedback(`BENAR! Hasil: ${result} (Target: ${target})`);
      // Optional: Add score here later
    } else {
      setFeedback(`SALAH! Hasil: ${result} (Target: ${target})`);
    }
  } catch (e) {
    console.error(e);
    setFeedback("Error dalam perhitungan.");
  }
};

    return(
    <div className="game-container">

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
