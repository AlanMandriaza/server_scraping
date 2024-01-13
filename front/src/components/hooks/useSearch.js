import { useState, useCallback } from 'react';

const useSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const encodedQuery = encodeURIComponent(query);
      if (encodedQuery) {
        const response = await fetch(`http://localhost:5000/sortbyname/search?query=${encodedQuery}`);
        if (!response.ok) {
          throw new Error(`Error en la búsqueda: ${response.statusText}`);
        }
        const data = await response.json();
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setError('Error en la búsqueda. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSuggestionClick = useCallback(async (suggestion) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/sortbyname/search?creador_id=${suggestion.creador_id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener detalles: ${response.statusText}`);
      }
      const data = await response.json();
      setSearchResults([data]);
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      setError('Error al obtener detalles. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchResults,
    suggestions,
    loading,
    error,
    handleSearch,
    handleSuggestionClick,
  };
};

export default useSearch;
