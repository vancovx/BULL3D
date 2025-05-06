import axios from 'axios'

const API_URL = '/api/assets/'

// Get all assets (public access)
const getAssets = async () => {
    const response = await axios.get(API_URL)
    return response.data
}

// Get assets from a specific user (public access)
const getUserAssets = async (userId) => {
    const response = await axios.get(`${API_URL}user/${userId}`)
    return response.data
}

// Get specific asset by ID (public access)
const getAssetById = async (assetId) => {
    const response = await axios.get(`${API_URL}${assetId}`)
    return response.data
}

// Upload asset (protected)
const createAsset = async (assetData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',  // Important for file uploads
        },
    }
    
    // Create a FormData object for file uploads
    const formData = new FormData()
    
    // Add text fields
    formData.append('title', assetData.title)
    formData.append('typeContent', assetData.typeContent)
    formData.append('description', assetData.description)
    if (assetData.date) {
        formData.append('date', assetData.date)
    }
    
    // Add files
    if (assetData.coverImage) {
        formData.append('coverImage', assetData.coverImage)
    }
    
    if (assetData.images && assetData.images.length > 0) {
        assetData.images.forEach(image => {
            formData.append('images', image)
        })
    }
    
    if (assetData.content) {
        formData.append('content', assetData.content)
    }
    
    const response = await axios.post(API_URL, formData, config)
    return response.data
}

// Update asset (protected)
const updateAsset = async (assetId, assetData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',  // Important for file uploads
        },
    }
    
    // Create a FormData object for file uploads
    const formData = new FormData()
    
    // Add text fields
    if (assetData.title) formData.append('title', assetData.title)
    if (assetData.typeContent) formData.append('typeContent', assetData.typeContent)
    if (assetData.description) formData.append('description', assetData.description)
    if (assetData.date) formData.append('date', assetData.date)
    
    // Add files
    if (assetData.coverImage) {
        formData.append('coverImage', assetData.coverImage)
    }
    
    if (assetData.images && assetData.images.length > 0) {
        assetData.images.forEach(image => {
            formData.append('images', image)
        })
    }
    
    if (assetData.content) {
        formData.append('content', assetData.content)
    }
    
    const response = await axios.put(`${API_URL}${assetId}`, formData, config)
    return response.data
}

// Delete asset (protected)
const deleteAsset = async (assetId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await axios.delete(`${API_URL}${assetId}`, config)
    return response.data
}

const assetService = {
    getAssets,
    getUserAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset
}

export default assetService