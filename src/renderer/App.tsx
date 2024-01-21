import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderCom from './pages/Header';
import './App.css';

import IndexCom from './pages/Index';

function Hello() {
  return (
    <div>
      <HeaderCom />
      <IndexCom />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
