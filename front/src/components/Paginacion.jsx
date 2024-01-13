  import React, { useState, useEffect } from 'react';
  import CreadorCard from './CreadorCard';

  const Paginacion = ({ searchResults }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const RESULTS_PER_PAGE = 10;
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
      setTotalPages(Math.ceil(searchResults.length / RESULTS_PER_PAGE));
    }, [searchResults]);

    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
    };

    const displayResults = searchResults
      .slice((currentPage - 1) * RESULTS_PER_PAGE, currentPage * RESULTS_PER_PAGE)
      .map(result => <CreadorCard key={result.id} creador={result} />);

    const paginationButtons = [];
    for (let i = 1; i <= totalPages; i++) {
      paginationButtons.push(
        <button key={i} onClick={() => handlePageChange(i)} className={currentPage === i ? 'active' : ''}>
          {i}
        </button>
      );
    }

    return (
      <div className="paginacion-container">
        {displayResults}
        <div className="pagination-buttons">
          {paginationButtons}
        </div>
      </div>
    );
  };

  export default Paginacion;
