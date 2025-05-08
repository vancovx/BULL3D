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

//GET usuario 
const getUserById = async (userId) => {
    const user = JSON.parse(localStorage.getItem(userId))
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`
        },
    }

    const response = await axios.get(`${API_URL}${userId}`, config)

    return response.data
}

//PUT usuario
const putUser = async (userId) => {
    const user = JSON.parse(localStorage.getItem('user')) 
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`
        },
    }

    const response = await axios.put(`${API_URL}${userId}`, config)

    return response.data
}

const userService = {
    getMe,
    getUserById,
    putUser
}

export default userService