import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './Navbar';
import CreadorCard from './CreadorCard';
import Paginacion from './Paginacion';
import Modal from './Modal';
import Loading from './Loading';
import '../styles/creadores.css';
import '../styles/modal.css';

const Creadores = React.memo(({ creadorIdFilter, handleSearch }) => {
  const [creadores, setCreadores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [creadoresPerPage] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const totalCreadoresRef = useRef(0);
  const creadoresListRef = useRef(null);

  const fetchCreadores = useCallback(async () => {
    try {
      const url = creadorIdFilter
        ? `http://localhost:5000/sorbyname/search?creator_id=${creadorIdFilter}`
        : `http://localhost:5000/filtros/filtrar_por_likes?page=${currentPage}&per_page=${creadoresPerPage}`;
  
      const response = await fetch(url);
      const data = await response.json();
  
      if (response.headers.get('X-Total-Paginas')) {
        totalCreadoresRef.current = parseInt(response.headers.get('X-Total-Paginas'), 20);
      }
  
      setCreadores(data.creadores);
      if (creadoresListRef.current) {
        creadoresListRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('Error al obtener creadores:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, creadoresPerPage, creadorIdFilter]);

  useEffect(() => {
    totalCreadoresRef.current = 0;
    fetchCreadores();
  }, [fetchCreadores, currentPage, creadorIdFilter]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleImageClick = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
    setShowModal(true);
  }, []);

  return (
    <div>
      <Navbar handleSearch={handleSearch} />
      <Paginacion
        currentPage={currentPage}
        totalCreadores={totalCreadoresRef.current}
        handlePageChange={handlePageChange}
        scrollToTop={() => {
          if (creadoresListRef.current) {
            creadoresListRef.current.scrollTop = 0;
          }
        }}
        showPagination={!creadorIdFilter}
      />

      {loading ? (
        <Loading />
      ) : creadores && creadores.length > 0 ? (
        <div>
          <ul className="creadores-list" ref={creadoresListRef}>
            {creadores.map((creador) => (
              <CreadorCard key={creador.creador_id} creador={creador} handleImageClick={handleImageClick} />
            ))}
          </ul>
        </div>
      ) : (
        <p>No se encontraron creadores.</p>
      )}

      <Paginacion
        currentPage={currentPage}
        totalCreadores={totalCreadoresRef.current}
        handlePageChange={handlePageChange}
        scrollToTop={() => {
          if (creadoresListRef.current) {
            creadoresListRef.current.scrollTop = 0;
          }
        }}
        showPagination={!creadorIdFilter}
      />

      <Modal showModal={showModal} setShowModal={setShowModal} selectedImage={selectedImage} />
    </div>
  );
});

export default Creadores;
