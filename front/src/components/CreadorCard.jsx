import React from 'react';
import {
  FaPhotoVideo,
  FaCheck,
  FaFacebook,
  FaTwitter,
  FaHeart,
  FaInstagram,
  FaMapMarker,
  FaTiktok,
  FaSnapchat,
} from 'react-icons/fa';
import { BsCameraVideo, BsImages } from 'react-icons/bs';
import '../styles/creadores.css';

const CreadorCard = ({ creador, handleImageClick }) => {
  const categoriasAsociadasArray = JSON.parse(creador.categorias_asociadas);

  const getSocialMediaIcon = (socialMediaName) => {
    switch (socialMediaName.toLowerCase()) {
      case 'facebook':
        return <FaFacebook className="social-icon" />;
      case 'twitter':
        return <FaTwitter className="social-icon" />;
      case 'instagram':
        return <FaInstagram className="social-icon" />;
      case 'tiktok':
        return <FaTiktok className="social-icon" />;
      case 'snapchat':
        return <FaSnapchat className="social-icon" />;
      default:
        return null;
    }
  };

  const getVideoIcon = () => {
    return <BsCameraVideo className="video-icon" />;
  };

  const getStreamIcon = () => {
    return <FaPhotoVideo className="stream-icon" />;
  };

  const getPhotoIcon = () => {
    return <BsImages className="photo-icon" />;
  };

  const getSubscriptionIcon = () => {
    return creador.precio_suscripcion === '0' || creador.precio_suscripcion === 0
      ? 'Free'
      : creador.precio_suscripcion
        ? `${creador.precio_suscripcion} USD`
        : null;
  };

  return (
    <li className="creador-card">
      <div className="creador-content container">
        <div className="creador-info">
          <h3 className="verificado-container">
            {creador.verificado ? (
              <FaCheck className="verificado-mark" />
            ) : (
              <span className="verificado-x">x</span>
            )}
            {creador.nombre}
          </h3>
          <div className='image'>
           
            <img
              src={`/images/${creador.creador_id}/${creador.creador_id}_bio.jpg`}
              alt={`${creador.nombre} Biography`}
              className="bio-image"
            />
             <img
              src={`/images/${creador.creador_id}/${creador.creador_id}.jpg`}
              alt={`${creador.nombre} Profile`}
              onClick={() => handleImageClick(`/images/${creador.creador_id}/${creador.creador_id}_hd.jpg`)}
              className="avatar-image"
            />
          </div>
        </div>
        {categoriasAsociadasArray && Array.isArray(categoriasAsociadasArray) && categoriasAsociadasArray.length > 0 && (
          <div>
            <h4>Tags:</h4>
            <ul className="categorias-lista">
              {categoriasAsociadasArray.map((categoria, index) => (
                <li key={index}>{categoria}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="creador-body">
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
         
          {(creador.likes !== undefined && creador.likes && creador.streams !== null !== null && parseFloat(creador.likes) !== 0) && (creador.visible === undefined || creador.visible) && (
            <div className="likes">
              <FaHeart /> {parseFloat(creador.likes).toLocaleString()}
            </div>
          )}
          {creador.pais && creador.pais !== 'sin pais' && creador.pais !== null && (
            <div className={`pais ${!creador.visible ? 'hidden-element' : ''}`}>
              <FaMapMarker /> {creador.pais}
            </div>
          )}
          {creador.videos !== undefined && parseFloat(creador.videos) !== 0 && (
            <div className="videos">{getVideoIcon()} {creador.videos}</div>
          )}
          {creador.fotos !== undefined && parseFloat(creador.fotos) !== 0 && (
            <div className="fotos">{getPhotoIcon()} {creador.fotos}</div>
          )}
          {creador.suscripciones !== undefined && creador.streams !== null && parseFloat(creador.suscripciones) !== 0 && (
            <div className="suscripciones">{getSubscriptionIcon()} {creador.suscripciones} Suscripciones</div>
          )}
          {creador.streams !== undefined && creador.streams !== null && parseFloat(creador.streams) !== 0 && (
            <div className={`streams ${!creador.visible ? 'hidden-element' : ''}`}>
              {getStreamIcon()} {creador.streams}
            </div>
          )}
        </div>
        <div>
          <p className="bio-visible">{creador.biografia}</p>
        </div>
      </div>
    </li>
  );
};

export default React.memo(CreadorCard);
