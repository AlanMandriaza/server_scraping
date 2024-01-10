import React, { useState, useEffect, useCallback } from 'react';
import '../styles/loading.css';

const Modal = ({ showModal, setShowModal, selectedImage }) => {
  const [imageLoading, setImageLoading] = useState(true);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, [setShowModal]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    const handleOutsideClick = (event) => {
      if (showModal && !event.target.closest('.modal-content')) {
        closeModal();
      }
    };

    if (showModal) {
      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showModal, closeModal]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    showModal && (
      <div className="modal">
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="close" onClick={closeModal}>
            &times;
          </span>
          {imageLoading && <p className="loading"></p>}
          <img
            src={selectedImage}
            alt="HD"
            className={`modal-image ${imageLoading ? 'hidden' : ''}`}
            onLoad={handleImageLoad}
          />
        </div>
      </div>
    )
  );
};

export default Modal;
