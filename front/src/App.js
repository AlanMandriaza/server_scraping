import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './componentes/Navbar'; 
import PromotedPage from './componentes/pages/promoted/PromotedPage';
import CategoryDetailPage from './componentes/pages/categorias/CategoryDetailPage';
import CreatorDetailPage from './componentes/pages/search/CreatorDetailPage';
import TopLikesPage from './componentes/pages/toplikes/TopLikesPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PromotedPage page={1} />} />
        <Route path="/promocionados" element={<PromotedPage />} />
        <Route path="/creadores/:creadorId" element={<CreatorDetailPage />} />
        <Route path="/categorias/:categoryName" element={<CategoryDetailPage />} />
        <Route path="/top-likes" element={<TopLikesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
