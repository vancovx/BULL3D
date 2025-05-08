import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AssetItem.css';

function AssetItem({ asset }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Función para obtener la URL de la imagen adaptada para usar nuestro proxy
  const getImageUrl = (url) => {
    if (!url) return '';
    
    // Si la URL ya es de nuestro proxy, la usamos directamente
    if (url.startsWith('/api/proxy/image/')) {
      return url;
    }
    
    // Si es una URL de Google Drive, extraemos el ID y usamos nuestro proxy
    if (url.includes('drive.google.com')) {
      // Intentar obtener el ID del parámetro id=
      const idParam = url.match(/[?&]id=([^&]+)/);
      if (idParam && idParam[1]) {
        return `/api/proxy/image/${idParam[1]}`;
      }
      
      // Intentar obtener el ID del patrón /d/ o /file/d/
      const pathId = url.match(/\/d\/([^\/\?]+)/) || url.match(/\/file\/d\/([^\/\?]+)/);
      if (pathId && pathId[1]) {
        return `/api/proxy/image/${pathId[1]}`;
      }
    }
    
    // Para cualquier otra URL, la devolvemos tal cual
    return url;
  };

  // Manejar error de carga de imagen
  const handleImageError = () => {
    setImageError(true);
    console.error('Error al cargar la imagen:', asset.coverImageUrl);
  };

  return (
    <div className="asset-card">
      <div className="asset-image">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">Cargando...</div>
        )}
        {imageError && (
          <div className="image-error">
            <p>Error al cargar la imagen</p>
            <small>{asset.title}</small>
          </div>
        )}
        <img 
          src={getImageUrl(asset.coverImageUrl)} 
          alt={asset.title} 
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </div>
      <div className="asset-info">
        <h3 className="asset-title">{asset.title}</h3>
        <div className="asset-meta">
          <span className="asset-category">{asset.category}</span>
        </div>
        <Link to={`/assets/${asset._id}`} className="asset-btn">
          Ver Más
        </Link>
      </div>
    </div>
  );
}

export default AssetItem;