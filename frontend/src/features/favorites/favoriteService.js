import axios from 'axios';

const API_URL = '/api/favorites/';

// Add asset to favorites
const addFavorite = async (assetId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(
    API_URL,
    { assetId },
    config
  );

  return response.data;
};

// Remove asset from favorites
const removeFavorite = async (assetId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Asegurarnos de que la URL tiene el formato correcto
  const response = await axios.delete(`${API_URL}${assetId}`, config);
  return response.data;
};

// Get all favorites
const getFavorites = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Check if asset is favorite
const checkFavorite = async (assetId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}check/${assetId}`, config);
  return response.data;
};

const favoriteService = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
};

export default favoriteService;