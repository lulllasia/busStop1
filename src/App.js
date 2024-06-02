import './App.css';
import { useState } from 'react';
import { Routes, Route, HashRouter } from "react-router-dom";
import Home from './component/Home'
import Navbar from './component/Navbar.js';
import Context from './context/Context.js';

function App() {
  const [shortest, setShortest] = useState(null);
  const [startingPoint, setStartingPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');

  return (
    <Context.Provider value={{
        shortest, setShortest, 
        startingPoint, setStartingPoint,
        endPoint, setEndPoint,
      }}>
      <HashRouter>
        <div className="main">
        <Navbar/>
          <Routes>
            <Route path="/" element={ <Home />} />
            <Route path="*" element={ <div> Not Found </div> }/>
          </Routes>
        </div>
      </HashRouter>     
    </Context.Provider>

  );
}

export default App;