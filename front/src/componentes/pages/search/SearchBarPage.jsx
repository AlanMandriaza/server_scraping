import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import CreadorCard from './CreadorCard';
import useSearch from './hooks/useSearch';

import '../styles/paginacion.css';

const SearchBarPage = () => {
  const navigate = useNavigate();
  const { suggestions, loading, error, handleSearch, handleSuggestionClick } = useSearch(fetchCreatorsByCategory);


  const onSuggestionSelected = useCallback((suggestion) => {
    handleSuggestionClick(suggestion); // Maneja los datos de la sugerencia
    // Realiza la navegación aquí basada en el tipo de sugerencia
    if (typeof suggestion === 'string') {
      navigate(`/categorias/${suggestion}`);
    } else if (typeof suggestion === 'object' && suggestion.creador_id) {
      navigate(`/creadores/${suggestion.creador_id}`);
    }
  }, [handleSuggestionClick, navigate]);

  return (
    <div className="main-page">
      <Navbar
        suggestions={suggestions}
        handleSuggestionClick={onSuggestionSelected}
        onSearch={handleSearch}
      />
      <div className="loading-and-error">
        {loadingSearch && <p className="loading-message">Cargando búsqueda...</p>}
        {errorSearch && <p className="error-message">{errorSearch}</p>}
      </div>
      <div className="content">
        {creators.map((creator, index) => (
          <CreadorCard key={index} creator={creator} />
        ))}
      </div>
    </div>
  );
};

export default SearchBarPage;
