import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MainPage from './components/MainPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} exact />
        <Route path="/main" element={<MainPage />} />
  
      </Routes>
    </Router>
  );
}

export default App;
