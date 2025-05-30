import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import assetReducer from '../features/assets/assetSlice'
import userReducer from '../features/users/userSlice'
import commentReducer from '../features/comments/commentSlice'
import favoriteReducer from '../features/favorites/favoriteSlice'
import downloadReducer from '../features/downloads/downloadSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        assets: assetReducer,
        user: userReducer,
        comments: commentReducer,
        favorites: favoriteReducer,
        downloads: downloadReducer,
    },
})