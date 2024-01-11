import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import CreadorCard from './CreadorCard';
import useSearch from './hooks/useSearch';
import useTopLikes from './hooks/useTopLikes';
import useCategories from './hooks/useCategories';
import useCreatorsByCategory from './hooks/useCreatorsByCategory';

const MainPage = () => {

  const { searchResults, suggestions, loading: loadingSearch, error: errorSearch, handleSearch, handleSuggestionClick } = useSearch();
  const { topLikesData, loading: loadingTopLikes, error: errorTopLikes, fetchTopLikes } = useTopLikes();
  const { categories, loading: loadingCategories, error: errorCategories, fetchCategories } = useCategories();
  const { creators, fetchCreatorsByCategory, loading: loadingCreators, error: errorCreators } = useCreatorsByCategory();
  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 10;
  const [totalPages, setTotalPages] = useState(0);
  const MAX_PAGES_SHOWN = 5;
  const [activeDataSet, setActiveDataSet] = useState('searchResults');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [creatorsByCategory, setCreatorsByCategory] = useState([]);


  const handleCategoryClick = async (categoryName) => {

    try {

      const response = await fetchCreatorsByCategory(categoryName);
      if (response && response.data) {
        setCreatorsByCategory(response.data.creadores);
      } else {
        console.error('Error en la respuesta del API');
      }
    } catch (error) {
      console.error('Error fetching creators', error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (activeDataSet === 'searchResults') {
      setTotalPages(Math.ceil(searchResults.length / RESULTS_PER_PAGE));
    } else if (activeDataSet === 'topLikes') {
      setTotalPages(Math.ceil(topLikesData.total_paginas));
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
  const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGES_SHOWN / 2));
  const endPage = Math.min(totalPages, startPage + MAX_PAGES_SHOWN - 1);

  for (let i = startPage; i <= endPage; i++) {
    paginationButtons.push(
      <button key={i} onClick={() => handlePageChange(i)} className={`page-button ${currentPage === i ? 'active' : ''}`}>
        {i}
      </button>
    );
  }
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  console.log('creatorsByCategory:', creatorsByCategory); // Agrega este console.log

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
        onCategoryClick={handleCategoryClick}
      />
      <div className="loading-and-error">
        {loadingSearch && <p className="loading-message">Cargando búsqueda...</p>}
        {errorSearch && <p className="error-message">{errorSearch}</p>}
        {loadingTopLikes && <p className="loading-message">Cargando top likes...</p>}
        {errorTopLikes && <p className="error-message">{errorTopLikes}</p>}
        {loadingCategories && <p className="loading-message">Cargando categorías...</p>}
        {errorCategories && <p className="error-message">{errorCategories}</p>}
      </div>
      <div className="content">
        {(activeDataSet === 'searchResults' ? searchResults : topLikesData.creadores)?.map((creador, index) => (
          <CreadorCard key={index} creador={creador} className="creador-card" />
        ))}
        <div className="content">
          {activeDataSet === 'category' && creatorsByCategory.length > 0 && creatorsByCategory.map((creador, index) => (
            <CreadorCard key={index} creador={creador} className="creador-card" />
          ))}
        </div>
        {activeDataSet === 'category' &&
          creatorsByCategory.map(creador => (
            <CreadorCard creador={creador} />
          ))
        }
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
