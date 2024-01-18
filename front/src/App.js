import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './componentes/Navbar';
import PromotedPage from './componentes/pages/promoted/PromotedPage';
import CategoryDetailPage from './componentes/pages/categorias/CategoryDetailPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
      <Route path="/" element={<PromotedPage page={1} />} />
        <Route path="/promocionados" element={<PromotedPage />} />
        <Route path="/categorias/:categoryName" element={<CategoryDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
