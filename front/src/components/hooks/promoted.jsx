// hooks/usePromotedCreators.jsx
import { useState, useCallback } from 'react';

const usePromotedCreators = () => {
  const [promotedData, setPromotedData] = useState({});
  const [loadingPromoted, setLoadingPromoted] = useState(false);
  const [errorPromoted, setErrorPromoted] = useState(null);

  const fetchPromotedCreators = useCallback(async (page) => {
    setLoadingPromoted(true);
    setErrorPromoted(null);

    try {
      const response = await fetch(`http://localhost:5000/promocionados?page=${page}`);
      if (!response.ok) {
        throw new Error('Error al obtener creadores promocionados');
      }
      const data = await response.json();
      setPromotedData(data);
    } catch (error) {
      console.error('Error al obtener creadores promocionados:', error);
      setErrorPromoted('Error al obtener creadores promocionados. Por favor, inténtelo de nuevo.');
    } finally {
      setLoadingPromoted(false);
    }
  }, []);

  return {
    promotedData,
    loadingPromoted,
    errorPromoted,
    fetchPromotedCreators,
  };
};

export default usePromotedCreators;
