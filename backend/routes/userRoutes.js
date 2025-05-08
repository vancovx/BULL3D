const express = require('express')
const router = express.Router()
const { 
  registerUser, 
  loginUser, 
  getMe, 
  getUserById, 
  updateUser 
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

//Rutas públicas
router.post('/', registerUser)
router.post('/login', loginUser)

// Ruta para obtener datos públicos de un usuario
router.get('/:id', getUserById) 

//Rutas privadas (requieren autenticación)
router.get('/me', protect, getMe)
router.put('/me', protect, updateUser)

module.exports = router