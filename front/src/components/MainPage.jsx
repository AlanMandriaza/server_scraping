import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import CreadorCard from './CreadorCard';
import useSearch from './hooks/useSearch';
import useTopLikes from './hooks/useTopLikes';
import useCategories from './hooks/useCategories';
import useCreatorsByCategory from './hooks/useCreatorsByCategory';

const RESULTS_PER_PAGE = 10;

const MainPage = () => {
  const { creators, fetchCreatorsByCategory, error: errorCreators } = useCreatorsByCategory();

  const { searchResults, suggestions, loading: loadingSearch, error: errorSearch, handleSearch, handleSuggestionClick } = useSearch(fetchCreatorsByCategory);

  const { topLikesData, loading: loadingTopLikes, error: errorTopLikes, fetchTopLikes } = useTopLikes();
  const { categories, loading: loadingCategories, error: errorCategories, fetchCategories } = useCategories();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const MAX_PAGES_SHOWN = 5;
  const [activeDataSet, setActiveDataSet] = useState('searchResults');

  // Función para manejar el clic en una categoría
  const handleCategoryClick = useCallback(async (categoryName) => {
    try {
      // Llama al hook de la categoría para obtener los creadores de la categoría seleccionada
      await fetchCreatorsByCategory(categoryName);
      setActiveDataSet('category');
      console.log('Successfully fetched creators for category:', categoryName);
    } catch (error) {
      console.error('Error fetching creators for category:', error);
    }
  }, [fetchCreatorsByCategory]);

  useEffect(() => {
    // Fetch de categorías
    fetchCategories()
      .then((data) => {
        console.log('Datos de categorías:', data);
      })
      .catch((error) => {
        console.error('Error al obtener categorías:', error);
      });
  }, [fetchCategories]);

  useEffect(() => {
    if (activeDataSet === 'searchResults') {
      setTotalPages(Math.ceil(searchResults.length / RESULTS_PER_PAGE));
    } else if (activeDataSet === 'topLikes') {
      setTotalPages(topLikesData.total_paginas || 0);
    }
  }, [searchResults, topLikesData, activeDataSet]);

  const handleTopLikesClick = () => {
    fetchTopLikes(currentPage);
    setActiveDataSet('topLikes');
  };

  useEffect(() => {
    if (activeDataSet === 'topLikes') {
      fetchTopLikes(currentPage);
    }
  }, [currentPage, activeDataSet, fetchTopLikes]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const paginationButtons = [];
  for (let i = Math.max(1, currentPage - Math.floor(MAX_PAGES_SHOWN / 2)); i <= Math.min(totalPages, currentPage + MAX_PAGES_SHOWN - 1); i++) {
    paginationButtons.push(
      <button key={i} onClick={() => handlePageChange(i)} className={`page-button ${currentPage === i ? 'active' : ''}`}>
        {i}
      </button>
    );
  }

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="main-page">
      <Navbar
        onSearch={(query) => {
          handleSearch(query);
          setActiveDataSet('searchResults');
        }}
        onTopLikes={handleTopLikesClick}
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
        categories={categories}
        onCategoryClick={handleCategoryClick} // Pasa la función de manejo de clic a Navbar
      />
      <div className="loading-and-error">
        {loadingSearch && <p className="loading-message">Cargando búsqueda...</p>}
        {errorSearch && <p className="error-message">{errorSearch}</p>}
        {loadingTopLikes && <p className="loading-message">Cargando top likes...</p>}
        {errorTopLikes && <p className="error-message">{errorTopLikes}</p>}
        {loadingCategories && <p className="loading-message">Cargando categorías...</p>}
        {errorCategories && <p className="error-message">{errorCategories}</p>}
        {errorCreators && <p className="error-message">{errorCreators}</p>}
      </div>
      <div className="content">
        {activeDataSet === 'searchResults' && searchResults.map((creador, index) => (
          <CreadorCard key={index} creador={creador} className="creador-card" />
        ))}
        {activeDataSet === 'topLikes' && topLikesData.creadores?.map((creador, index) => (
          <CreadorCard key={index} creador={creador} className="creador-card" />
        ))}
        {activeDataSet === 'category' && creators.map((creador, index) => (
          <CreadorCard key={index} creador={creador} className="creador-card" />
        ))}
      </div>
      <div className="pagination">
        {canGoPrev && <button onClick={() => handlePageChange(currentPage - 1)} className="prev-button">Prev</button>}
        {paginationButtons}
        {canGoNext && <button onClick={() => handlePageChange(currentPage + 1)} className="next-button">Next</button>}
      </div>
    </div>
  );
};

export default MainPage;
