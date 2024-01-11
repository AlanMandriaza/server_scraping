import { useState, useCallback } from 'react';

const useCreatorsByCategory = () => {

  const [creators, setCreators] = useState([]);

  const fetchCreatorsByCategory = useCallback(async (categoryName) => {

    try {
      
      const response = await fetch(`http://localhost:5000/sortbycat/categories/${categoryName}`);
      
      const data = await response.json();

      setCreators(data.creators);

    } catch (error) {

      console.error(error);

    }

  }, []);

  return {
    creators,
    fetchCreatorsByCategory
  }

}

export default useCreatorsByCategory;