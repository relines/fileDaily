import { App } from 'antd';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import IndexCom from './pages/Index';
import ViewCom from './pages/View';

function Hello() {
  return (
    <div>
      <IndexCom />
    </div>
  );
}

export default function AppCom() {
  return (
    <App>
      <Router>
        <Routes>
          <Route path="/" element={<Hello />} />
          <Route path="/view" element={<ViewCom />} />
        </Routes>
      </Router>
    </App>
  );
}
