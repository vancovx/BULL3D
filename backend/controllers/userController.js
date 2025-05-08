const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { 
      name, 
      username, 
      email, 
      password, 
      numberphone, 
      description 
    } = req.body
  
    if (!name || !username || !email || !password) {
      res.status(400)
      throw new Error('Please add all required fields')
    }
  
    // Check if user exists
    const userExists = await User.findOne({ email })
  
    if (userExists) {
      res.status(400)
      throw new Error('User already exists')
    }
  
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
  
    // Crear objeto de usuario
    const userData = {
      name,
      username,
      email,
      password: hashedPassword,
      numberphone: numberphone !== undefined ? numberphone : null,
      description: description !== undefined ? description : null
    }
  
    // Create user
    const user = await User.create(userData)
  
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        numberphone: user.numberphone,
        description: user.description,
        token: generateToken(user._id),
      })
    } else {
      res.status(400)
      throw new Error('Invalid user data')
    }
})
  
// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for user email
  const user = await User.findOne({ email })

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid credentials')
  }
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user)
})

// @desc    Get public user data by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email')
  
  if (!user) {
    res.status(404)
    throw new Error('Usuario no encontrado')
  }
  
  res.status(200).json({
    _id: user._id,
    name: user.name,
    username: user.username,
    description: user.description,
    // No incluimos email ni otra info sensible
  })
})

// @desc    Update user data
// @route   PUT /api/users/me
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const { name, username, email, numberphone, description } = req.body
  
  const updateData = {}
  if (name) updateData.name = name
  if (username) updateData.username = username
  if (email) updateData.email = email
  if (numberphone !== undefined) updateData.numberphone = numberphone
  if (description !== undefined) updateData.description = description
  
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true }
  ).select('-password')
  
  if (!updatedUser) {
    res.status(404)
    throw new Error('Usuario no encontrado')
  }
  
  res.status(200).json(updatedUser)
})

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUserById,
  updateUser,
}