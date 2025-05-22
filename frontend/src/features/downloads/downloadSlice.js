import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import downloadService from './downloadService';

const initialState = {
  downloads: [],
  stats: null,
  pagination: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Registrar descarga
export const registerDownload = createAsyncThunk(
  'downloads/register',
  async (assetId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await downloadService.registerDownload(assetId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Obtener historial de descargas
export const getUserDownloads = createAsyncThunk(
  'downloads/getUserDownloads',
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await downloadService.getUserDownloads(page, limit, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Obtener estadísticas
export const getDownloadStats = createAsyncThunk(
  'downloads/getStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await downloadService.getDownloadStats(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Eliminar entrada del historial
export const deleteDownloadEntry = createAsyncThunk(
  'downloads/deleteEntry',
  async (downloadId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await downloadService.deleteDownloadEntry(downloadId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Limpiar historial completo
export const clearDownloadHistory = createAsyncThunk(
  'downloads/clearHistory',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await downloadService.clearDownloadHistory(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const downloadSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearDownloads: (state) => {
      state.downloads = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register download
      .addCase(registerDownload.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerDownload.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(registerDownload.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get user downloads
      .addCase(getUserDownloads.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserDownloads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.downloads = action.payload.downloads;
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserDownloads.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get download stats
      .addCase(getDownloadStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Delete download entry
      .addCase(deleteDownloadEntry.fulfilled, (state, action) => {
        state.downloads = state.downloads.filter(
          (download) => download._id !== action.payload.id
        );
      })
      // Clear download history
      .addCase(clearDownloadHistory.fulfilled, (state) => {
        state.downloads = [];
        state.pagination = null;
      });
  },
});

export const { reset, clearDownloads } = downloadSlice.actions;
export default downloadSlice.reducer;