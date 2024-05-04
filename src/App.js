import './App.css';
import { Routes, Route, HashRouter } from "react-router-dom";
import Home from './component/Home'

function App() {
  

  return (
    <HashRouter>
      <div className="main">
        <Routes>
          <Route path="/" element={ <Home />} />
          <Route path="*" element={ <div> Not Found </div> }/>
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;