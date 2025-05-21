import axios from 'axios'

// Definir la URL base para las rutas de comentarios
const API_URL = '/api/assets/'
const COMMENTS_API_URL = '/api/comments/'

// Obtener todos los comentarios para un asset específico
const getAssetComments = async (assetId) => {
  try {
    console.log(`Obteniendo comentarios para el asset: ${assetId}`);
    const response = await axios.get(`${API_URL}${assetId}/comments`);
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en getAssetComments:', error.response?.data || error.message);
    throw error;
  }
}

// Crear un nuevo comentario para un asset
const createComment = async (assetId, commentData, token) => {
  try {
    console.log(`Creando comentario para el asset: ${assetId}`, commentData);
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const response = await axios.post(
      `${API_URL}${assetId}/comments`, 
      { text: commentData.text, parentComment: commentData.parentComment || null },
      config
    );
    
    console.log('Respuesta del servidor al crear comentario:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en createComment:', error.response?.data || error.message);
    throw error;
  }
}

// Actualizar un comentario existente
const updateComment = async (commentId, commentData, token) => {
  try {
    console.log(`Actualizando comentario: ${commentId}`, commentData);
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const response = await axios.put(
      `${COMMENTS_API_URL}${commentId}`, 
      { text: commentData.text },
      config
    );
    
    console.log('Respuesta del servidor al actualizar comentario:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en updateComment:', error.response?.data || error.message);
    throw error;
  }
}

// Eliminar un comentario
const deleteComment = async (commentId, token) => {
  try {
    console.log(`Eliminando comentario: ${commentId}`);
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const response = await axios.delete(`${COMMENTS_API_URL}${commentId}`, config);
    console.log('Respuesta del servidor al eliminar comentario:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error en deleteComment:', error.response?.data || error.message);
    throw error;
  }
}

const commentService = {
  getAssetComments,
  createComment,
  updateComment,
  deleteComment
}

export default commentService