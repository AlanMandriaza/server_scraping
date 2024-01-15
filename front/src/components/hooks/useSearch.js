import { useState, useCallback } from 'react';

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

        // Obtener nombres de categorías
        const categorias = data.categorias.map((categoria) => categoria);

        // Obtener nombres de creadores 
        const creadores = data.creadores.map((creador) => ({ ...creador }));


        const suggestions = [...categorias, ...creadores];
        setSuggestions(suggestions);
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
    setSuggestions([]); // Limpiar sugerencias
    setSearchResults([]); 
    try {
      if (typeof suggestion === 'string') {
        // Si la sugerencia es una cadena, entonces es el nombre de la categoría.
        // Llama a la función que maneja las categorías.
        await fetchCreatorsByCategory(suggestion);
      } else if (typeof suggestion === 'object' && suggestion.creador_id) {
        // Si la sugerencia es un objeto con la propiedad 'creador_id', entonces es un nombre de creador.
        // Llama a la función que maneja la búsqueda por creador.
        const response = await fetch(`http://localhost:5000/sortbyname/search?creador_id=${suggestion.creador_id}`);
        if (!response.ok) {
          throw new Error(`Error al obtener detalles: ${response.statusText}`);
        }
        const data = await response.json();
        setSearchResults([data]);
      }
    } catch (error) {
      console.error('Error al obtener detalles:', error);
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
