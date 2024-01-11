import { useState, useCallback } from 'react';

const useTopLikes = () => {
  const [topLikesData, setTopLikesData] = useState({});
  const [loadingTopLikes, setLoadingTopLikes] = useState(false);
  const [errorTopLikes, setErrorTopLikes] = useState(null);

  const fetchTopLikes = useCallback(async (page) => {
    setLoadingTopLikes(true);
    setErrorTopLikes(null);

    try {
      const response = await fetch(`http://localhost:5000/filtros/filtrar_por_likes?page=${page}`);
      if (!response.ok) {
        throw new Error(`Error al obtener los mejores likes: ${response.statusText}`);
      }
      const data = await response.json();
      setTopLikesData(data);
    } catch (error) {
      console.error('Error al obtener los mejores likes:', error);
      setErrorTopLikes('Error al obtener los mejores likes. Por favor, inténtelo de nuevo.');
    } finally {
      setLoadingTopLikes(false);
    }
  }, []);

  return {
    topLikesData,
    loadingTopLikes,
    errorTopLikes,
    fetchTopLikes,
  };
};

export default useTopLikes;
