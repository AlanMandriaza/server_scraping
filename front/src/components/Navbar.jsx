import React, { useState, useEffect, useRef } from 'react';
import '../styles/navbar.css';

const Navbar = ({ onSearch, onTopLikes, suggestions, handleSuggestionClick, categories, onCategoryClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // Un solo ref para el dropdown
  const topLikesRef = useRef(null); // Ref para el botón "Top Likes"

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  // Función para hacer scroll al principio y llamar a onTopLikes
  const handleTopLikesClick = () => {
    if (topLikesRef.current) {
      topLikesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    onTopLikes(); 
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">Logo</div>
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search..."
            className="search-input"
          />
          {suggestions.length > 0 && (
            <div className="suggestions-list" ref={dropdownRef}>
              {suggestions.map((suggestion, index) => (
                <div key={index} onClick={() => {
                  if (suggestion.tipo === 'categoria') {
                    console.log("Category clicked:", suggestion.nombre);
                    onCategoryClick(suggestion.nombre);
                  } else if (suggestion.tipo === 'creador') {
                    console.log("Creator clicked:", suggestion);
                    handleSuggestionClick(suggestion);
                  }
                }}>
                  {suggestion.tipo === 'creador' ? suggestion.creador_id : suggestion.nombre}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="navbar-links">
          {/* Botón "Top Likes" con referencia para hacer scroll */}
          <button onClick={handleTopLikesClick} className="likes-button" ref={topLikesRef}>
            Top Likes
          </button>
          <button onClick={() => setShowDropdown(!showDropdown)} className="categories-button">
            Categories
          </button>
          {showDropdown && (
            <div className="categories-dropdown" ref={dropdownRef}>
              {categories && categories.map((category, index) => (
                <div key={index} onClick={() => onCategoryClick(category.nombre)}>
                  {category.nombre} ({category.asociaciones})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Navbar);
