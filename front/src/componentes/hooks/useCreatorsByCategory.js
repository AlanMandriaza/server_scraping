import { useState, useCallback } from 'react';

const useCreatorsByCategory = () => {
  const [creators, setCreators] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0); // To store total number of pages

  const fetchCreatorsByCategory = useCallback(async (categoryName, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/sortbycat/categories/${categoryName}?page=${page}`);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      const data = await response.json();
      setCreators(data.creadores || []);
      setTotalPages(data.total_paginas || 0);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { creators, error, isLoading, fetchCreatorsByCategory, totalPages };
};


export default useCreatorsByCategory;
