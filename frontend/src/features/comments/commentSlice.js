import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import commentService from './commentService'

const initialState = {
  comments: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
}

// Obtener todos los comentarios para un asset específico
export const getAssetComments = createAsyncThunk(
  'comments/getAssetComments',
  async (assetId, thunkAPI) => {
    try {
      console.log('Llamando al servicio para obtener comentarios del asset:', assetId);
      const response = await commentService.getAssetComments(assetId);
      console.log('Respuesta del servidor para comentarios:', response);
      return response;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
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

// Crear un nuevo comentario
export const createComment = createAsyncThunk(
  'comments/create',
  async ({ assetId, commentData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      const response = await commentService.createComment(assetId, commentData, token);
      console.log('Comentario creado:', response);
      return response;
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

// Actualizar un comentario existente
export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ commentId, commentData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await commentService.updateComment(commentId, commentData, token)
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

// Eliminar un comentario
export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (commentId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await commentService.deleteComment(commentId, token)
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

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
      // No reiniciamos los comentarios al hacer reset
    },
    clearComments: (state) => {
      state.comments = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para getAssetComments
      .addCase(getAssetComments.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.isSuccess = false
        state.message = ''
      })
      .addCase(getAssetComments.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.isError = false
        // Asegurarnos de que action.payload sea un array
        state.comments = Array.isArray(action.payload) ? action.payload : []
        console.log('Estado actualizado con comentarios:', state.comments);
      })
      .addCase(getAssetComments.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.isSuccess = false
        state.message = action.payload
        // No modificamos los comentarios en caso de error
      })
      // Casos para createComment
      .addCase(createComment.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.message = ''
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.isError = false
        // Añadir el nuevo comentario al inicio del array
        if (action.payload) {
          state.comments = [action.payload, ...state.comments]
          console.log('Comentario añadido al estado:', action.payload);
          console.log('Estado actualizado de comentarios:', state.comments);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.isSuccess = false
        state.message = action.payload
      })
      // Casos para updateComment
      .addCase(updateComment.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.message = ''
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.isError = false
        // Actualizar el comentario en el array
        if (action.payload && action.payload._id) {
          state.comments = state.comments.map(comment => 
            comment._id === action.payload._id ? action.payload : comment
          )
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.isSuccess = false
        state.message = action.payload
      })
      // Casos para deleteComment
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true
        state.isError = false
        state.message = ''
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.isError = false
        // Eliminar el comentario del array
        if (action.payload && action.payload.id) {
          state.comments = state.comments.filter(comment => 
            comment._id !== action.payload.id
          )
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.isSuccess = false
        state.message = action.payload
      })
  }
})

export const { reset, clearComments } = commentSlice.actions
export default commentSlice.reducer