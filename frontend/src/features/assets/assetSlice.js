import { createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import assetService from './assetService'

const initialState = {
    assets: [],
    asset: {},
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

export const getAssets = createAsyncThunk(
    'assets/getAll',
    async (_, thunkAPI) => {
        try {
            //Obtenemos el token
            const token = thunkAPI.getState().auth.user.token

            //Llamamos al servicio para obtener todos los assets
            return await assetService.getAssets(token)

        }catch (error) {
            const message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString()
          // Rechaza la promesa con el mensaje de error
          return thunkAPI.rejectWithValue(message)
        }
    }
)


//



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
      // Para getAssets:
      .addCase(getAssets.pending, (state) => {
        state.isLoading = true  // Cuando empieza la carga
      })
      .addCase(getAssets.fulfilled, (state, action) => {
        state.isLoading = false  // Finaliza la carga
        state.isSuccess = true   // Indica éxito
        state.assets = action.payload  // Guarda los assets en el estado
      })
      .addCase(getAssets.rejected, (state, action) => {
        state.isLoading = false  // Finaliza la carga
        state.isError = true     // Indica error
        state.message = action.payload  // Guarda el mensaje de error
      })
      // Para getAssetById:
      //.addCase(getAssetById.pending, (state) => {
      //  state.isLoading = true  // Cuando empieza la carga
      //})
      //.addCase(getAssetById.fulfilled, (state, action) => {
      //  state.isLoading = false  // Finaliza la carga
      //  state.isSuccess = true   // Indica éxito
      //  state.asset = action.payload  // Guarda el asset en el estado
      //})
      //.addCase(getAssetById.rejected, (state, action) => {
      //  state.isLoading = false  // Finaliza la carga
      //  state.isError = true     // Indica error
      //  state.message = action.payload  // Guarda el mensaje de error
      //})
  },
})

// Exporta el action creator para el reducer reset
export const { reset } = assetSlice.actions
// Exporta el reducer para usar en el store
export default assetSlice.reducer