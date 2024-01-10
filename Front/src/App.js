import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import CreadorCard from './components/CreadorCard';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/sortbycat/categories');
      if (!response.ok) {
        throw new Error(`Error en la obtención de categorías: ${response.statusText}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setError('Error al obtener categorías. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const handleTopLikes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/filtros/filtrar_por_likes');
      if (!response.ok) {
        throw new Error(`Error al obtener los mejores likes: ${response.statusText}`);
      }
      const data = await response.json();
      if (Array.isArray(data.creadores)) {
        setSearchResults(data.creadores);
      }
    } catch (error) {
      console.error('Error al obtener los mejores likes:', error);
      setError('Error al obtener los mejores likes. Por favor, inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="App">
      <Navbar
        onSearch={handleSearch}
        onTopLikes={handleTopLikes}
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
        categories={categories}
      />
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="main-content">
        {searchResults.length > 0 && searchResults.map((result, index) => (
          <CreadorCard key={index} creador={result} />
        ))}
      </div>
    </div>
  );
}

export default App;