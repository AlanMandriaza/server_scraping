import { useState, useCallback, navigate } from 'react';

const useSearch = (fetchCreatorsByCategory) => {
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
        const categorias = data.categorias.map(categoria => categoria);
        const creadores = data.creadores.map(creador => ({ ...creador }));
        setSuggestions([...categorias, ...creadores]);
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


    const handleSuggestionClick = async (suggestion) => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSearchResults([]);

    try {
      if (typeof suggestion === 'string') {
        await fetchCreatorsByCategory(suggestion);
        navigate(`/categorias/${suggestion}`);
      } else if (typeof suggestion === 'object' && suggestion.creador_id) {
        const response = await fetch(`http://localhost:5000/sortbyname/search?creador_id=${suggestion.creador_id}`);
        if (!response.ok) {
          throw new Error(`Error al obtener detalles: ${response.statusText}`);
        }
        const data = await response.json();
        setSearchResults([data]);
        navigate(`/creadores/${suggestion.creador_id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al obtener detalles. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
