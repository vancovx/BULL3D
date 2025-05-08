import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import assetService from './assetService'

const initialState = {
    assets: [],
    userAssets: [],
    asset: {},
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

// Get all assets (public)
export const getAssets = createAsyncThunk(
    'assets/getAll',
    async (_, thunkAPI) => {
        try {
            // Get assets without token (public access)
            return await assetService.getAssets()
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

// Get assets for a specific user (public)
export const getUserAssets = createAsyncThunk(
    'assets/getUserAssets',
    async (userId, thunkAPI) => {
        try {
            // Get user assets without token (public access)
            return await assetService.getUserAssets(userId)
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

// Get asset by ID (public)
export const getAssetById = createAsyncThunk(
    'assets/getById',
    async (id, thunkAPI) => {
        try {
            // Get asset by ID without token (public access)
            return await assetService.getAssetById(id)
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

// Create new asset (protected)
export const createAsset = createAsyncThunk(
    'assets/create',
    async (assetData, thunkAPI) => {
        try {
            // Get token from auth state
            const token = thunkAPI.getState().auth.user.token
            // Create asset with token (protected)
            return await assetService.createAsset(assetData, token)
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

// Update asset (protected)
export const updateAsset = createAsyncThunk(
    'assets/update',
    async ({ id, assetData }, thunkAPI) => {
        try {
            // Get token from auth state
            const token = thunkAPI.getState().auth.user.token
            // Update asset with token (protected)
            return await assetService.updateAsset(id, assetData, token)
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

// Delete asset (protected)
export const deleteAsset = createAsyncThunk(
    'assets/delete',
    async (id, thunkAPI) => {
        try {
            // Get token from auth state
            const token = thunkAPI.getState().auth.user.token
            // Delete asset with token (protected)
            return await assetService.deleteAsset(id, token)
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

export const assetSlice = createSlice({
    name: 'asset',
    initialState,
    reducers: {
        // Reducer para reiniciar los estados de las operaciones
        reset: (state) => {
            state.isLoading = false
            state.isSuccess = false
            state.isError = false
            state.message = ''
        },
    },
    // Reducers adicionales para manejar los estados de las acciones asíncronas
    extraReducers: (builder) => {
        builder
            // Para getAssets
            .addCase(getAssets.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getAssets.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.assets = action.payload
            })
            .addCase(getAssets.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Para getUserAssets
            .addCase(getUserAssets.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getUserAssets.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.userAssets = action.payload
            })
            .addCase(getUserAssets.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Para getAssetById
            .addCase(getAssetById.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getAssetById.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.asset = action.payload
            })
            .addCase(getAssetById.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Para createAsset
            .addCase(createAsset.pending, (state) => {
                state.isLoading = true
                state.isSuccess = false // Resetear isSuccess al empezar
            })
            .addCase(createAsset.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true // CORREGIDO: Debe ser true cuando se completa exitosamente
                state.assets.push(action.payload)
            })
            .addCase(createAsset.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Para updateAsset
            .addCase(updateAsset.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateAsset.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.assets = state.assets.map(asset => 
                    asset._id === action.payload._id ? action.payload : asset
                )
                // Also update userAssets if applicable
                if (state.userAssets.length > 0) {
                    state.userAssets = state.userAssets.map(asset => 
                        asset._id === action.payload._id ? action.payload : asset
                    )
                }
            })
            .addCase(updateAsset.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Para deleteAsset
            .addCase(deleteAsset.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteAsset.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.assets = state.assets.filter(asset => asset._id !== action.payload.id)
                // Also update userAssets if applicable
                if (state.userAssets.length > 0) {
                    state.userAssets = state.userAssets.filter(asset => asset._id !== action.payload.id)
                }
            })
            .addCase(deleteAsset.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

// Exporta el action creator para el reducer reset
export const { reset } = assetSlice.actions
// Exporta el reducer para usar en el store
export default assetSlice.reducer