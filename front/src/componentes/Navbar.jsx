import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importa Link desde react-router-dom
import './styles/navbar.css';  

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategorySelect = (categoryName) => {
    navigate(`/categorias/${categoryName}`);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Placeholder for search functionality
  };

  return (
    <div className="navbar">
      <div className="navbar-container">
        {/* Agrega el enlace al logo */}
        <Link to="/" className="navbar-logo">Logo</Link>
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search..."
            className="search-input"
          />
          {/* Placeholder for search suggestions */}
        </div>
        <div className="navbar-links">
          <button onClick={() => setShowDropdown(!showDropdown)} className="categories-button">
            Categories
          </button>
          {showDropdown && (
            <div className="categories-dropdown" ref={dropdownRef}>
              {categories.map((category, index) => (
                <div key={index} onClick={() => handleCategorySelect(category.nombre)}>
                  {category.nombre} ({category.asociaciones})
                </div>
              ))}
            </div>
          )}
          {/* Placeholder for other buttons */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
