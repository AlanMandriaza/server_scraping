import React, { useState } from 'react';
import {
  FaPhotoVideo, FaCheck, FaFacebook, FaTwitter, FaHeart,
  FaInstagram, FaMapMarker, FaTiktok, FaSnapchat,FaYoutube, FaAmazon
} from 'react-icons/fa';
import { BsCameraVideo, BsImages } from 'react-icons/bs';
import Modal from './Modal';
import './styles/creadores.css';
import './styles/modal.css';
const CreadorCard = ({ creador }) => {
  const [showBio, setShowBio] = useState(false);
  const categoriasAsociadasArray = (creador.categorias_asociadas);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const toggleBio = () => {
    setShowBio(prev => !prev);
  };
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const getSocialMediaIcon = (socialMediaName) => {
    switch (socialMediaName.toLowerCase()) {
      case 'facebook': return <FaFacebook className="social-icon facebook" />;
      case 'twitter': return <FaTwitter className="social-icon twitter" />;
      case 'instagram': return <FaInstagram className="social-icon instagram" />;
      case 'tiktok': return <FaTiktok className="social-icon tiktok" />;
      case 'snapchat': return <FaSnapchat className="social-icon snapchat" />;
      case 'youtube': return <FaYoutube className="social-icon youtube" />;
      case 'amazon': return <FaAmazon className="social-icon amazon" />;
      default: return null;
    }
  };
  
  const getVideoIcon = () => <BsCameraVideo className="video-icon" />;
  const getStreamIcon = () => <FaPhotoVideo className="stream-icon" />;
  const getPhotoIcon = () => <BsImages className="photo-icon" />;
  const getLocationIcon = () => <FaMapMarker className="location-icon" />;
  const getLikesIcon = () => <FaHeart className="likes-icon" />;
  const getCheckIcon = () => <FaCheck className="check-icon" />;

  const getSubscriptionIcon = () => {
    if (creador.precio_suscripcion === '0' || creador.precio_suscripcion === 0) {
      return 'Free';
    }
    return creador.precio_suscripcion ? `${creador.precio_suscripcion} USD` : null;
  };

  return (
    <li className="creador-card">
      <div className="creador-content">
        <div className="creador-header">
          <h3 className="creador-title">
            {creador.verificado ? getCheckIcon() : <span className="verificado-x">x</span>}
            {creador.nombre}
          </h3>
          <div className="avatar-container">
            <div className="bio-container">
              <img
                src={`/images/${creador.creador_id}/${creador.creador_id}_bio.jpg`}
                alt={`${creador.nombre} Biography`}
                className={`bio-image ${showBio ? '' : 'hide-on-mobile'}`}
              />
              <img
                src={`/images/${creador.creador_id}/${creador.creador_id}.jpg`}
                alt={`${creador.nombre} Profile`}
                onClick={() => handleImageClick(`/images/${creador.creador_id}/${creador.creador_id}_hd.jpg`)}
                className="avatar-image"
              />
              <p className={`bio-text ${showBio ? '' : 'hide-on-mobile'}`}>{creador.biografia}</p>

              <button
                onClick={() => window.open(`https://onlyfans.com/${creador.creador_id}`, '_blank', 'noopener,noreferrer')}
                className="subscription-button"
              >
                {getSubscriptionIcon()}
              </button>

              <button onClick={toggleBio} className={`show-bio-button ${showBio ? 'active' : ''}`}>
                {getPhotoIcon()} Show Bio
              </button>
            </div>
          </div>
        </div>

        <div className="creador-stats">
          {creador.redes_sociales && creador.redes_sociales.length > 0 && (
            <div className="redes-sociales">
              {creador.redes_sociales.map((redSocial, index) => (
                <a key={index} href={redSocial.enlace} target="_blank" rel="noopener noreferrer">
                  {getSocialMediaIcon(redSocial.nombre)}
                </a>
              ))}
            </div>
          )}
          {(creador.likes !== undefined && creador.likes !== null && parseFloat(creador.likes) !== 0) && (creador.visible === undefined || creador.visible) && (
            <div className="likes">
              {getLikesIcon()} {parseFloat(creador.likes).toLocaleString()}
            </div>
          )}
          {creador.pais && creador.pais !== 'sin pais' && creador.pais !== null && (
            <div className={`pais ${!creador.visible ? 'hidden-element' : ''}`}>
              {getLocationIcon()} {creador.pais}
            </div>
          )}
          {creador.videos !== undefined && parseFloat(creador.videos) !== 0 && (
            <div className="videos">
              {getVideoIcon()} {creador.videos}
            </div>
          )}
          {creador.fotos !== undefined && parseFloat(creador.fotos) !== 0 && (
            <div className="fotos">
              {getPhotoIcon()} {creador.fotos}
            </div>
          )}
          {creador.suscripciones !== undefined && creador.streams !== null && parseFloat(creador.suscripciones) !== 0 && (
            <div className="suscripciones">
              {getSubscriptionIcon()} {creador.suscripciones} Suscripciones
            </div>
          )}
          {creador.streams !== undefined && creador.streams !== null && parseFloat(creador.streams) !== 0 && (
            <div className={`streams ${!creador.visible ? 'hidden-element' : ''}`}>
              {getStreamIcon()} {creador.streams}
            </div>
          )}
        </div>
        <div className='tags-container'>
          {categoriasAsociadasArray && Array.isArray(categoriasAsociadasArray) && categoriasAsociadasArray.length > 0 && (
            <div>
              <h4 className='tags-titulo'>Tags:</h4>
              <ul className="categorias-lista">
                {categoriasAsociadasArray.map((categoria, index) => (
                  <li key={index}>{categoria}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div> <Modal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        selectedImage={selectedImage} 
      />
    </li>
  );
};

export default React.memo(CreadorCard);
