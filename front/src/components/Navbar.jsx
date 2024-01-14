import React, { useState, useEffect, useRef } from 'react';
import '../styles/navbar.css';

const Navbar = ({ onSearch, onTopLikes, suggestions, handleSuggestionClick, categories, onCategoryClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // Un solo ref para el dropdown

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
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
    if (typeof suggestion === 'string') {
      console.log("Category clicked:", suggestion);
      onCategoryClick(suggestion);
    } else if (suggestion && suggestion.creador_id) {
      console.log("Suggestion clicked:", suggestion);
      handleSuggestionClick(suggestion);
    }
  }}>
    {typeof suggestion === 'string' ? suggestion : suggestion.name}
  </div>
))}



            </div>

          )}

        </div>
        <div className="navbar-links">
          <button onClick={onTopLikes} className="likes-button">
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