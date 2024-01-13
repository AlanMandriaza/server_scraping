import { useState, useCallback } from 'react';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/sortbycat/categories');
      if (!response.ok) {
        throw new Error(`Error en la obtención de categorías: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Respuesta de la API:', response); // Aquí se imprime la respuesta de la API
      console.log('Datos de la respuesta aapi:', data); // Aquí se imprimen los datos de la respuesta
      setCategories(data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setError('Error al obtener categorías. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);
  

  return { categories, fetchCategories, loading, error };
};

export default useCategories;
