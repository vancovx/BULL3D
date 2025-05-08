import axios from 'axios'

const API_URL = '/api/users/'

// Obtener datos del perfil del usuario autenticado
const getMe = async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  
    const response = await axios.get(API_URL + 'me', config)
    return response.data
}

// GET usuario por ID (público, no requiere autenticación)
const getUserById = async (userId) => {
    const response = await axios.get(`${API_URL}${userId}`)
    return response.data
}

// Actualizar información del usuario
const updateUser = async (userData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        },
    }

    const response = await axios.put(API_URL + 'me', userData, config)
    return response.data
}

const userService = {
    getMe,
    getUserById,
    updateUser
}

export default userService