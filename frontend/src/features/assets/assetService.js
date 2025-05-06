import axios from 'axios'

const API_URL = '/api/assets/'

//Ver todos los assets
// Get all assets (public access)
const getAssets = async () => {
    const response = await axios.get(API_URL)
    return response.data
}


//Upload asset
const postAsset = async(token, assetData) => {

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await axios.post(API_URL, config, assetData)

    return response.data
}

//Delete asset
const deleteAsset = async(token, assetId) => {

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await axios.delete(`${API_URL}${assetId}`, config)
    
    return response.data
}

//Get asset especifico
const getAssetById = async(token, assetId) => {

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await axios.get(`${API_URL}${assetId}`, config)

    return response.data
}

//Put asset
const putAsset = async(token, assetId) => {

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await axios.put(`${API_URL}${assetId}`, config)

    return response.data
}


const assetService = {
    getAssets,
    getAssetById,
    putAsset,
    deleteAsset
    
}

export default assetService