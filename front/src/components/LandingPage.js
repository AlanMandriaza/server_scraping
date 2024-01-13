import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCategories from './hooks/useCategories';
import useCreatorsByCategory from './hooks/useCreatorsByCategory';
import CreadorCard from './CreadorCard'; // Asegúrate de importar el componente CreadorCard

function LandingPage() {
  const { categories, fetchCategories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { creators, fetchCreatorsByCategory, error: creatorsError } = useCreatorsByCategory();

  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = async (event) => {
    const categoryName = event.target.value;
    setSelectedCategory(categoryName);
    await fetchCreatorsByCategory(categoryName);
  };

  const handleImageClick = (imageUrl) => {
    // Aquí puedes manejar el clic en la imagen
  };

  return (
    <div>
      <h1>Bienvenido a mi página de inicio</h1>
      <button onClick={fetchCategories} disabled={categoriesLoading}>
        {categoriesLoading ? 'Cargando categorías...' : 'Cargar Categorías'}
      </button>
      {categoriesError && <p>{categoriesError}</p>}

      {categories.length > 0 && (
        <div>
          <h2>Categorías:</h2>
          <select onChange={handleCategoryChange}>
            {categories.map((category) => (
              <option key={category.id} value={category.nombre}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedCategory && (
        <div>
          <h2>Creadores para la Categoría: {selectedCategory}</h2>
          {creatorsError && <p>{creatorsError}</p>}
          <ul>
            {creators.map((creator) => (
              <CreadorCard key={creator.creador_id} creador={creator} handleImageClick={handleImageClick} />
            ))}
          </ul>
        </div>
      )}

      <Link to="/main/">Ir a la página principal</Link>
    </div>
  );
}

export default LandingPage;
