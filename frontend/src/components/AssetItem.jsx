import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AssetItem.css';

function AssetItem({ asset }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  
  const getImageUrl = (url) => {
    if (!url) return '';
    
    // Check if it's a Google Drive file URL that needs converting
    if (url.includes('drive.google.com/file/d/')) {
      const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    
    // Check if it's a Google Drive thumbnail URL
    if (url.includes('drive.google.com/thumbnail')) {
      // These URLs should work directly in image tags
      return url;
    }
    
    // Handle Google User Content URLs (lh3.googleusercontent.com)
    if (url.includes('googleusercontent.com/d/')) {
      // These URLs should generally work directly
      return url;
    }
    
    // Default: return the original URL
    return url;
  };

  // Handle image error - try a fallback if the main URL fails
  const handleImageError = () => {
    setImageError(true);
    
    // If we haven't tried a fallback yet, attempt to get a different URL format
    if (!fallbackAttempted && asset.coverImageUrl) {
      setFallbackAttempted(true);
      
      // Try to extract file ID if it's a Google Drive URL
      if (asset.coverImageUrl.includes('drive.google.com')) {
        // Try to extract ID from various Google Drive URL formats
        const idMatch = 
          asset.coverImageUrl.match(/id=([^&]+)/) || 
          asset.coverImageUrl.match(/\/d\/([^\/]+)/) ||
          asset.coverImageUrl.match(/\/file\/d\/([^\/]+)/);
          
        if (idMatch && idMatch[1]) {
          const fileId = idMatch[1];
          // Try the thumbnail URL as a fallback
          const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}`;
          // Set a new image with the thumbnail URL
          const img = new Image();
          img.onload = () => {
            setImageLoaded(true);
            setImageError(false);
            // Update the image source
            document.getElementById(`asset-img-${asset._id}`).src = thumbnailUrl;
          };
          img.src = thumbnailUrl;
        }
      }
    }
  };

  return (
    <div className="asset-card">
      <div className="asset-image">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">Cargando...</div>
        )}
        {imageError && !imageLoaded && (
          <div className="image-error">
            <p>Error al cargar la imagen</p>
            <small>{asset.title}</small>
          </div>
        )}
        <img 
          id={`asset-img-${asset._id}`}
          src={getImageUrl(asset.coverImageUrl)} 
          alt={asset.title} 
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </div>
      <div className="asset-info">
        <h3 className="asset-title">{asset.title}</h3>
        <p className="asset-type">{asset.typeContent}</p>
        <p className="asset-description">
          {asset.description ? `${asset.description.substring(0, 100)}...` : 'Sin descripción'}
        </p>
        <Link to={`/assets/${asset._id}`} className="asset-btn">
          Ver Más
        </Link>
      </div>
    </div>
  );
}

export default AssetItem;