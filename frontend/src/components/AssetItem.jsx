import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AssetItem.css';

function AssetItem({ asset }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Depuración para ver qué URL estamos recibiendo
  useEffect(() => {
    console.log(`Asset ${asset._id} - URL:`, asset.coverImageUrl);
  }, [asset]);

  return (
    <div className="asset-card">
      <div className="asset-image">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">Cargando...</div>
        )}
        {imageError && (
          <div className="image-error">
            <p>Error al cargar la imagen</p>
            <small>{asset.coverImageUrl}</small>
          </div>
        )}
        <img 
          src={asset.coverImageUrl} 
          alt={asset.title} 
          onLoad={() => {
            console.log(`Imagen cargada: ${asset._id}`);
            setImageLoaded(true);
          }}
          onError={(e) => {
            console.error(`Error al cargar imagen ${asset._id}:`, asset.coverImageUrl);
            setImageError(true);
          }}
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