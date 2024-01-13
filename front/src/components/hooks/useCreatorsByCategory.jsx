import { useState, useCallback } from 'react';

const useCreatorsByCategory = () => {
  const [creators, setCreators] = useState([]);
  const [error, setError] = useState(null);

  const fetchCreatorsByCategory = useCallback(async (categoryName) => {
    try {
      const response = await fetch(`http://localhost:5000/sortbycat/categories/${categoryName}`);
  
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
  
      const data = await response.json();
  
      console.log('API Response:', data); // Add this line to log the response
  
      if (Array.isArray(data.creadores)) {
        setCreators(data.creadores);
        setError(null);
      } else {
        console.error('Error in API response');
        setError('Error in API response');
      }
    } catch (error) {
      console.error('Error fetching creators for category:', error);
      setError('Error fetching data. Please try again later.');
    }
  }, []);
  

  return {
    creators,
    error,
    fetchCreatorsByCategory, // Make sure to return the function
  };
};

export default useCreatorsByCategory;
