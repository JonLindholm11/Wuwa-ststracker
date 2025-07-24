// src/hooks/useCharacterData.jsx
import { useState, useEffect } from 'react';

// Create a singleton to cache the character data
let cachedCharacterData = null;
let isLoading = false;
let loadPromise = null;

const useCharacterData = () => {
  const [charactersData, setCharactersData] = useState(cachedCharacterData);
  const [loading, setLoading] = useState(!cachedCharacterData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedCharacterData) {
      setCharactersData(cachedCharacterData);
      setLoading(false);
      return;
    }

    if (isLoading && loadPromise) {
      loadPromise.then(data => {
        setCharactersData(data);
        setLoading(false);
      }).catch(err => {
        setError(err);
        setLoading(false);
      });
      return;
    }

    if (!isLoading) {
      isLoading = true;
      setLoading(true);
      
      // FIXED: Remove async from Promise executor
      loadPromise = new Promise((resolve, reject) => {
        // Use setTimeout to make this async without making the executor async
        setTimeout(async () => {
          try {
            // Use dynamic import for better code splitting
            const response = await import('../data/wuwave_characters.json');
            const data = response.default;
            
            // Cache the data
            cachedCharacterData = data;
            
            resolve(data);
          } catch (error) {
            console.error('Error loading characters data:', error);
            reject(error);
          }
        }, 0);
      });

      loadPromise.then(data => {
        setCharactersData(data);
        setLoading(false);
        isLoading = false;
      }).catch(err => {
        setError(err);
        setLoading(false);
        isLoading = false;
      });
    }
  }, []);

  return { charactersData, loading, error };
};

export default useCharacterData;