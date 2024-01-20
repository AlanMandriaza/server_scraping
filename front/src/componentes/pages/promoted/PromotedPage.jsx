import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import usePromotedCreators from '../../hooks/usePromotedCreators';
import CreadorCard from '../../CreadorCard';
import '../../styles/paginacion.css';

const PromotedPage = () => {
  const navigate = useNavigate();
  const { creators, fetchPromotedCreators, error, isLoading, totalPages } = usePromotedCreators();

  const searchParams = new URLSearchParams(window.location.search);
  const initialPage = parseInt(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    fetchPromotedCreators(currentPage);
  }, [currentPage, fetchPromotedCreators]);

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1;
    setCurrentPage(newPage);
    navigate(`/promocionados?page=${newPage}`);
    
    //  delay before scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 100); 
  };
  
  return (
    <div>
      <div>
        <h1 className='titulo'>Contenido Promocionado</h1>
        <div>
          {isLoading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : creators && creators.length > 0 ? (
            creators.map(creator => (
              <CreadorCard key={creator.creador_id} creador={creator} />
            ))
          ) : (
            <p>No hay creadores promocionados disponibles.</p>
          )}
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <ReactPaginate
              previousLabel={"Prev"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={totalPages}
              forcePage={currentPage - 1}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageChange}
              containerClassName={"pagination-container"}
              pageClassName={"pagination-page"}
              activeClassName={"active"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotedPage;
