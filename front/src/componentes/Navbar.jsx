import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './styles/navbar.css';
import useSearch from './hooks/useSearch';
import logoImage from './logofinal.jpg';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const suggestionsRef = useRef(null);
  const categoriesRef = useRef(null);
  const navigate = useNavigate();
  const { suggestions, handleSearch } = useSearch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/sortbycat/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value) {
      setShowSuggestions(true);
      handleSearch(e.target.value);
    } else {
      setShowSuggestions(false);
    }
  };

  const onSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    if (suggestion.tipo === 'categoria') {
      navigate(`/categorias/${suggestion.nombre}`);
    } else if (suggestion.tipo === 'creador') {
      navigate(`/creadores/${suggestion.creador_id}`);
    }
  };

  const onCategoryClick = (categoryName) => {
    navigate(`/categorias/${categoryName}`);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img className="logo" src={logoImage} alt="Logo" />
        </Link>
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search..."
            className="search-input"
          />
          {showSuggestions && suggestions && suggestions.length > 0 && (
            <div className="suggestions-list" ref={suggestionsRef}>
              {suggestions.map((suggestion, index) => (
                <div key={index} onClick={() => onSuggestionClick(suggestion)}>
                  {suggestion.tipo === 'creador' ? (
                    <>
                      <span>{suggestion.nombre}</span>
                      <span> / {suggestion.creador_id}</span>
                    </>
                  ) : (
                    <>
                      <span>{suggestion.nombre}</span>
                      <span> ({suggestion.num_creadores_asociados})</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="navbar-links">
          <button onClick={toggleDropdown} className="categories-button">
            Categories
          </button>
          {showDropdown && (
            <div className="categories-dropdown" ref={categoriesRef}>
              {categories.map((category, index) => (
                <div key={index} onClick={() => onCategoryClick(category.nombre)}>
                  <span className="category-name">{category.nombre}</span>
                  <span className="category-associations"> ({category.asociaciones})</span>
                </div>
              ))}
            </div>
          )}
          <button>
            <Link to="/top-likes" className="top-likes-link stylish-button">Top Likes</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
