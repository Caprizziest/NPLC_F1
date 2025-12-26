  import { useState, useEffect } from 'react';
  import './App.css';

  function App() {

  const [target, setTarget] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [poolNumbers, setPoolNumbers] = useState([]);
  const [selectedPoolIndex, setSelectedPoolIndex] = useState(null);
  const [slots, setSlots] = useState([null, null, null, null]);


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
      <div className="slot" onClick={() => handleSlotsClick(0)}>{slots[0]?.value}</div>
      <span className="op">+</span>
      <div className="slot" onClick={() => handleSlotsClick(1)}>{slots[1]?.value}</div>
      <span className="op">-</span>
      <div className="slot" onClick={() => handleSlotsClick(2)}>{slots[2]?.value}</div>
      <span className="op">*</span>
      <div className="slot" onClick={() => handleSlotsClick(3)}>{slots[3]?.value}</div>
      <span className="equals">=</span>
      <span id="target">{target}</span>
    </div>

  <div id="operator-presets">
    <h3>Pilih Pola Operator:</h3>
    <table className="presets-table">
      <tr>
        <td>
          <label>
            <input type="radio" name="ops" value="p1" /> 
            <div className="operator-cell">× × +</div>
          </label>
        </td>
        <td>
          <label>
            <input type="radio" name="ops" value="p2" />
            <div className="operator-cell">+ × +</div>
          </label>
        </td>
        <td>
          <label>
            <input type="radio" name="ops" value="p3" />
            <div className="operator-cell">+ + ×</div>
          </label>
        </td>
        <td>
          <label>
            <input type="radio" name="ops" value="p4" />
            <div className="operator-cell">× + -</div>
          </label>
        </td>
      </tr>
      <tr>
        <td>
          <label>
            <input type="radio" name="ops" value="p5" />
            <div className="operator-cell">× - ×</div>
          </label>
        </td>
        <td>
          <label>
            <input type="radio" name="ops" value="p6" />
            <div className="operator-cell">× + ×</div>
          </label>
        </td>
        <td>
          <label>
            <input type="radio" name="ops" value="p7" />
            <div className="operator-cell">× - -</div>
          </label>
        </td>
        <td>
          <label>
            <input type="radio" name="ops" value="p8" />
            <div className="operator-cell">- + ×</div>
          </label>
        </td>
      </tr>
    </table>
  </div>

    <button id="submit">Kirim</button>

    <div id="result"></div>

  </div>
    );
  }

  export default App;
