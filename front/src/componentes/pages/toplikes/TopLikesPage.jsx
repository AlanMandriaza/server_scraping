import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import useTopLikes from '../../hooks/useTopLikes';
import CreadorCard from '../../CreadorCard';
import '../../styles/paginacion.css';

const TopLikesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { topLikesData, loadingTopLikes, errorTopLikes, fetchTopLikes } = useTopLikes();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    setCurrentPage(page);
    fetchTopLikes(page); // Fetch top likes for the current page
  }, [location.search, fetchTopLikes]);

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1;
    setCurrentPage(newPage);
    navigate(`?page=${newPage}`); // Update the URL with the new page number
  };

  return (
    <div>
      <div>
        <h1 className='titulo'>Top Likes</h1>
        <div>
          {loadingTopLikes ? (
            <p>Cargando...</p>
          ) : errorTopLikes ? (
            <p>Error: {errorTopLikes}</p>
          ) : topLikesData && topLikesData.creadores && topLikesData.creadores.length > 0 ? (
            topLikesData.creadores.map(creator => (
              <CreadorCard key={creator.creador_id} creador={creator} />
            ))
          ) : (
            <p>No hay creadores con mejores likes disponibles.</p>
          )}
        </div>
        {topLikesData.total_paginas > 1 && (
          <div className="pagination">
            <ReactPaginate
              previousLabel={"Prev"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={topLikesData.total_paginas}
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

export default TopLikesPage;
