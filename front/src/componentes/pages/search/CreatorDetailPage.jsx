import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreadorCard from '../../CreadorCard';


const CreatorDetailPage = () => {
  const { creadorId } = useParams(); // Obtén el creador_id de la URL
  const [creatorDetails, setCreatorDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCreatorDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/sortbyname/search?creador_id=${creadorId}`);

        if (!response.ok) {
          throw new Error('No se pudo obtener los detalles del creador.');
        }
        const data = await response.json();
        setCreatorDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreatorDetails();
  }, [creadorId]);

  return (
    <div>
      <h1 className='titulo'>Detalles del Creador</h1>
      {isLoading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : creatorDetails ? (
        <CreadorCard creador={creatorDetails} />
      ) : (
        <p>No se encontró información del creador.</p>
      )}
    </div>
  );
};

export default CreatorDetailPage;
