import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import CreadorCard from './CreadorCard';
import useSearch from './hooks/useSearch';
import useCreatorsByCategory from './hooks/useCreatorsByCategory';
import '../styles/paginacion.css';

const SearchBarPage = () => {
  const { creators, fetchCreatorsByCategory, error: errorCreators } = useCreatorsByCategory();
  const { searchResults, loading: loadingSearch, error: errorSearch } = useSearch(fetchCreatorsByCategory);

  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const handleSuggestionClick = useCallback(async (suggestion) => {
    try {
      setSelectedSuggestion(suggestion);

      if (typeof suggestion === 'string') {
        // If the suggestion is a category name, fetch creators by category
        await fetchCreatorsByCategory(suggestion);
      } else if (typeof suggestion === 'object' && suggestion.creador_id) {
        // If the suggestion is an object with a 'creador_id', it's a creator
        // Fetch details or perform any other action as needed
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [fetchCreatorsByCategory]);

  return (
    <div className="main-page">
      <Navbar
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
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
