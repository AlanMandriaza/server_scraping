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

      // Agregamos la cantidad de creadores a cada categoría
      const categoriesWithCounts = data.map((category) => ({
        ...category,
        asociaciones: await getCreatorCountForCategory(category.id),
      }));

      setCategories(categoriesWithCounts);
    } catch (error) {
      setError('Error al obtener categorías. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener la cantidad de creadores asociados a una categoría
  const getCreatorCountForCategory = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:5000/sortbycat/categories/${categoryId}/creators/count`);
      const count = await response.json();
      return count;
    } catch (error) {
      console.error('Error al obtener el conteo de creadores:', error);
      return 0; // Devolvemos 0 si hay un error
    }
  };

  return { categories, fetchCategories, loading, error };
};

export default useCategories;
