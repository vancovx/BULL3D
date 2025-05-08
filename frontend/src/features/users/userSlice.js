import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userService from './userService'

const initialState = {
  profile: null,
  userProfiles: {}, // Para almacenar perfiles de usuarios por ID
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Get current user profile
export const getMe = createAsyncThunk(
  'users/getMe',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await userService.getMe(token)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get user profile by ID (public)
export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (userId, thunkAPI) => {
    try {
      return await userService.getUserById(userId)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Update user profile
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (userData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await userService.updateUser(userData, token)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isError = false
      state.isSuccess = false
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder
      // Para getMe
      .addCase(getMe.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.profile = action.payload
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Para getUserById
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        // Almacenar el perfil del usuario en el objeto userProfiles usando su ID como clave
        if (action.payload && action.payload._id) {
          state.userProfiles[action.payload._id] = action.payload
        }
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Para updateUser
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.profile = action.payload
        // También actualizar en userProfiles si existe
        if (action.payload && action.payload._id) {
          state.userProfiles[action.payload._id] = action.payload
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  }
})

export const { reset } = userSlice.actions
export default userSlice.reducer