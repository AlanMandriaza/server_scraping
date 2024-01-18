import { useState, useCallback } from 'react';

const usePromotedCreators = () => {
  const [creators, setCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPromotedCreators = useCallback(async (page) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/promocionados?page=${page}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCreators(data.creadores);
      setTotalPages(data.total_paginas);
      setError(null);
    } catch (error) {
      setError(error.message || 'An error occurred while fetching promoted creators.');
    }
    setIsLoading(false);
  }, []); // Dependencies can be added if there are any

  return { creators, fetchPromotedCreators, error, isLoading, totalPages };
};

export default usePromotedCreators;
