
import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import '../styles/navbar.css';

const Navbar = ({ handleSearch }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        if (!query.trim()) {
          setSuggestions([]);
          return;
        }

        const response = await fetch(`http://localhost:5000/sorbyname/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [query]);

  const handleSuggestionClick = (creadorId) => {
    console.log('Sending creadorId to endpoint:', creadorId); // Added console.log here
    setQuery('');
    if (typeof handleSearch === 'function') {
      handleSearch(creadorId);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">Logo</div>
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Buscar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <FaSearch className="search-icon" />

          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.creador_id}
                  onClick={() => handleSuggestionClick(suggestion.creador_id)}
                >
                  {suggestion.creador_id}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="navbar-links">
          <button>Categories</button>
          <button>Top Creators</button>
          <button>Top Likes</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;