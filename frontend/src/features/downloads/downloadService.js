import axios from 'axios';

const API_URL = '/api/downloads/';

// Registrar descarga
const registerDownload = async (assetId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  

  const response = await axios.post(`${API_URL}${assetId}`, {}, config);
  return response.data;
};

// Obtener historial de descargas del usuario
const getUserDownloads = async (page = 1, limit = 10, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`, config);
  return response.data;
};

// Obtener estadísticas de descargas
const getDownloadStats = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}stats`, config);
  return response.data;
};

// Eliminar entrada del historial
const deleteDownloadEntry = async (downloadId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`${API_URL}${downloadId}`, config);
  return response.data;
};

// Limpiar todo el historial
const clearDownloadHistory = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL, config);
  return response.data;
};

const downloadService = {
  registerDownload,
  getUserDownloads,
  getDownloadStats,
  deleteDownloadEntry,
  clearDownloadHistory,
};

export default downloadService;