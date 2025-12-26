  import { useState, useEffect } from 'react';
  import './App.css';

  function App() {

  const [target, setTarget] = useState(0);
  const [numbers, setNumbers] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [slots, setSlots] = useState([null, null, null, null]);


  useEffect(() => {
    fetch('http://localhost:8000/api/game/start/')
    .then(response => response.json())
    .then (data => {
      setTarget(data.target);
      setNumbers(data.numbers);
    })
    .catch(error => console.error('Error fetching game data:', error));
  }, []);


  const handleNumberClick = (index) => {
    setSelectedIndex(index);
  };

  const handleSlotClick = (slotIndex) => {
    if (selectedIndex !== null) {
      const newSlots = [...slots];
      newSlots[slotIndex] = numbers[selectedIndex];
      setSlots(newSlots);
      setSelectedIndex(null);
    }
  }
    return(
    <div className="game-container">

    <div id="number-pool">
      {numbers.map((num, index) => (
        <div 
          key={index} 
          className={`num ${selectedIndex === index ? 'active' : ''}`}
          onClick={() => handleNumberClick(index)}
        >
          {num}
        </div>
      ))}
    </div>

    <div id="expression">
      <div className="slot" onClick={() => handleSlotClick(0)}>{slots[0]}</div>
      <span className="op">+</span>
      <div className="slot" onClick={() => handleSlotClick(1)}>{slots[1]}</div>
      <span className="op">-</span>
      <div className="slot" onClick={() => handleSlotClick(2)}>{slots[2]}</div>
      <span className="op">*</span>
      <div className="slot" onClick={() => handleSlotClick(3)}>{slots[3]}</div>
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

  // belajar bang baru pindah UI