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

//Rutas privadas (requieren autenticación) - ESTAS DEBEN IR ANTES DE /:id
router.get('/me', protect, getMe)
router.put('/me', protect, updateUser)

// Ruta para obtener datos públicos de un usuario - ESTA DEBE IR AL FINAL
router.get('/:id', getUserById) 

module.exports = router