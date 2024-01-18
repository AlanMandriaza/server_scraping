import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import useCreatorsByCategory from '../../hooks/useCreatorsByCategory';
import CreadorCard from '../../CreadorCard';
  import '../../styles/paginacion.css';

const CategoryDetailPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { creators, fetchCreatorsByCategory, error, isLoading, totalPages } = useCreatorsByCategory();

  const searchParams = new URLSearchParams(window.location.search);
  const page = parseInt(searchParams.get('page')) || 1;

  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    fetchCreatorsByCategory(categoryName, currentPage);
  }, [categoryName, currentPage, fetchCreatorsByCategory]);

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1;
    setCurrentPage(newPage);
    navigate(`/categorias/${categoryName}?page=${newPage}`);

    // Scroll suave
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div>
      <h1 className='titulo'>Categoría: {categoryName}</h1>
      <div>
        {creators.length > 0 ? (
          creators.map((creator) => (
            <CreadorCard key={creator.creador_id} creador={creator} />
          ))
        ) : (
          <p>No hay creadores en esta categoría.</p>
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
            containerClassName={"pagination"}
            activeClassName={"active"}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryDetailPage;
