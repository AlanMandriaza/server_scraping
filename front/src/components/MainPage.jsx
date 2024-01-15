import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import CreadorCard from './CreadorCard';
import useSearch from './hooks/useSearch';
import useTopLikes from './hooks/useTopLikes';
import useCategories from './hooks/useCategories';
import useCreatorsByCategory from './hooks/useCreatorsByCategory';
import usePromotedCreators from './hooks/promoted';
import '../styles/paginacion.css';

const RESULTS_PER_PAGE = 20;
const MAX_PAGES_SHOWN = 5;

const MainPage = () => {
  const { creators, fetchCreatorsByCategory, error: errorCreators } = useCreatorsByCategory();
  const { searchResults, suggestions, loading: loadingSearch, error: errorSearch, handleSearch, handleSuggestionClick } = useSearch(fetchCreatorsByCategory);
  const { topLikesData, loading: loadingTopLikes, error: errorTopLikes, fetchTopLikes } = useTopLikes();
  const { categories, loading: loadingCategories, error: errorCategories, fetchCategories } = useCategories();
  const { promotedData, loadingPromoted, errorPromoted, fetchPromotedCreators } = usePromotedCreators();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeDataSet, setActiveDataSet] = useState('promoted');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null); // Agregar estado para la sugerencia seleccionada

  useEffect(() => {
    fetchCategories();
    fetchPromotedCreators(currentPage);
  }, [fetchCategories, fetchPromotedCreators, currentPage]);

  const handleCategoryClick = useCallback(async (categoryName) => {
    try {
      await fetchCreatorsByCategory(categoryName);
      setActiveDataSet('category');
      setSelectedSuggestion(null); // Limpiar la sugerencia seleccionada al cambiar de categoría
    } catch (error) {
      console.error('Error fetching creators for category:', error);
    }
  }, [fetchCreatorsByCategory]);

  const handleTopLikesClick = useCallback(() => {
    setActiveDataSet('topLikes');
    fetchTopLikes(currentPage);
    setSelectedSuggestion(null); // Limpiar la sugerencia seleccionada al hacer clic en "Top Likes"
  }, [fetchTopLikes, currentPage]);

  const handleNewSearch = useCallback((query) => {
    setActiveDataSet('searchResults');
    handleSearch(query);
    setSelectedSuggestion(null); // Limpiar la sugerencia seleccionada al realizar una nueva búsqueda
  }, [searchResults, suggestions]);

  useEffect(() => {
    let dataLength = 0;
    switch (activeDataSet) {
      case 'searchResults':
        dataLength = searchResults.length;
        break;
      case 'topLikes':
        dataLength = topLikesData.total_paginas * RESULTS_PER_PAGE;
        break;
      case 'category':
        dataLength = creators.length;
        break;
      case 'promoted':
        dataLength = promotedData.total_paginas * RESULTS_PER_PAGE;
        break;
      default:
        break;
    }
    setTotalPages(Math.ceil(dataLength / RESULTS_PER_PAGE));
  }, [searchResults, topLikesData, creators, promotedData, activeDataSet]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (activeDataSet === 'topLikes') {
        fetchTopLikes(newPage);
      } else if (activeDataSet === 'promoted') {
        fetchPromotedCreators(newPage);
      }
    }
  }, [totalPages, activeDataSet, fetchTopLikes, fetchPromotedCreators]);

  const renderContent = () => {
    let dataToShow = [];
    switch (activeDataSet) {
      case 'searchResults':
        dataToShow = searchResults || []; // Verificar si searchResults es undefined
        break;
      case 'topLikes':
        dataToShow = topLikesData?.creadores || []; // Verificar si topLikesData o creadores son undefined
        break;
      case 'category':
        dataToShow = creators || []; // Verificar si creators es undefined
        break;
      case 'promoted':
        dataToShow = promotedData?.creadores || []; // Verificar si promotedData o creadores son undefined
        break;
      default:
        break;
    }

    // Ahora puedes usar .slice con dataToShow
    return dataToShow.slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE).map((creador, index) => (
      <CreadorCard key={index} creador={creador} />
    ));
  };

  let paginationContent = totalPages > 1 ? (
    <div className="pagination">
      {currentPage > 1 && <button onClick={() => handlePageChange(currentPage - 1)} className="prev-button">Prev</button>}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(Math.max(0, currentPage - Math.floor(MAX_PAGES_SHOWN / 2)), Math.min(currentPage + Math.floor(MAX_PAGES_SHOWN / 2), totalPages))
        .map(page => (
          <button key={page} onClick={() => handlePageChange(page)} className={`page-button ${currentPage === page ? 'active' : ''}`}>
            {page}
          </button>
        ))
      }
      {currentPage < totalPages && <button onClick={() => handlePageChange(currentPage + 1)} className="next-button">Next</button>}
    </div>
  ) : null;

  return (
    <div className="main-page">
      <Navbar
        onSearch={handleNewSearch}
        onTopLikes={handleTopLikesClick}
        suggestions={suggestions}
        handleSuggestionClick={(suggestion) => {
          setSelectedSuggestion(suggestion); // Actualizar la sugerencia seleccionada al hacer clic en ella
          handleSuggestionClick(suggestion);
        }}
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
        {loadingPromoted && <p className="loading-message">Cargando creadores promocionados...</p>}
        {errorPromoted && <p className="error-message">{errorPromoted}</p>}
      </div>
      <div className="content">
        {renderContent()}
      </div>
      {paginationContent}
    </div>
  );
};

export default MainPage;
