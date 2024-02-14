import { HashRouter as Router, Routes, Route } from 'react-router-dom';
// import './App.css';
import './global.less';

import IndexCom from './pages/Index';
import ViewCom from './pages/View';

function Hello() {
  const page = window.location.search?.slice(1)?.split('=')?.[1];
  return <div>{page === 'view' ? <ViewCom /> : <IndexCom />}</div>;
}

export default function AppCom() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
