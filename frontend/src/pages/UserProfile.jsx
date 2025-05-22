import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaArrowLeft, FaUser, FaCalendar, FaEye } from 'react-icons/fa'
import { getUserById, reset as userReset } from '../features/users/userSlice'
import { getUserAssets, reset as assetReset } from '../features/assets/assetSlice'
import Spinner from '../components/Spinner'
import AssetItem from '../components/AssetItem'
import './UserProfile.css'

function UserProfile() {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState(null)

  // Estados de Redux
  const { userProfiles, isLoading, isError, message } = useSelector((state) => state.user)
  const { userAssets, isLoading: assetsLoading, isError: assetsError, message: assetsMessage } = useSelector((state) => state.assets)
  const { user: currentUser } = useSelector((state) => state.auth)

  // Cargar datos del usuario y sus assets
  useEffect(() => {
    if (!userId) {
      navigate('/')
      return
    }

    // Si es el usuario actual, redirigir a /profile
    if (currentUser && (currentUser._id === userId || currentUser.id === userId)) {
      navigate('/profile')
      return
    }

    // Limpiar estados previos
    setProfileUser(null)

    // Cargar datos del usuario
    dispatch(getUserById(userId))
      .unwrap()
      .then(userData => {
        console.log('Usuario cargado:', userData)
        setProfileUser(userData)
      })
      .catch(error => {
        console.error('Error al cargar el usuario:', error)
        toast.error('Usuario no encontrado')
        navigate('/')
      })

    // Cargar assets del usuario
    dispatch(getUserAssets(userId))

    // Limpiar al desmontar
    return () => {
      dispatch(userReset())
      dispatch(assetReset())
    }
  }, [userId, currentUser, navigate, dispatch])

  // Manejar errores
  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
    
    if (assetsError) {
      toast.error(assetsMessage)
    }
  }, [isError, message, assetsError, assetsMessage])

  // Función para obtener la inicial del nombre
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Función para navegar al asset
  const navigateToAsset = (assetId) => {
    navigate(`/assets/${assetId}`)
  }

  // Mostrar spinner mientras carga
  if (isLoading || !profileUser) {
    return <Spinner />
  }

  return (
    <div className="user-profile-page-container">
      {/* Botón de volver */}
      <div className="back-navigation">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Volver
        </button>
      </div>

      {/* Banner del perfil */}
      <div className="user-profile-banner">
        <div className="user-profile-info">
          <div className="user-profile-avatar">
            <div className="user-profile-initials">
              {getInitial(profileUser.name)}
            </div>
          </div>
          <div className="user-profile-details">
            <h1 className="user-profile-name">{profileUser.name}</h1>
            <p className="user-profile-username">@{profileUser.username}</p>
            
            {profileUser.description && (
              <p className="user-profile-bio">{profileUser.description}</p>
            )}
            
            <div className="user-profile-stats">
              <div className="user-stat">
                <FaUser className="stat-icon" />
                <span className="stat-value">{userAssets?.length || 0}</span>
                <span className="stat-label">Assets</span>
              </div>
              
              {profileUser.createdAt && (
                <div className="user-stat">
                  <FaCalendar className="stat-icon" />
                  <span className="stat-label">Miembro desde {formatDate(profileUser.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de assets */}
      <div className="user-assets-section">
        <div className="section-header">
          <h2>Assets de {profileUser.name}</h2>
          <span className="assets-count">({userAssets?.length || 0} assets)</span>
        </div>

        {assetsLoading ? (
          <div className="loading-assets">
            <Spinner />
          </div>
        ) : userAssets && userAssets.length > 0 ? (
          <div className="user-assets-grid">
            {userAssets.map(asset => (
              <div key={asset._id} className="user-asset-item">
                <AssetItem asset={asset} />
                <div className="asset-overlay">
                  <button 
                    className="view-asset-btn"
                    onClick={() => navigateToAsset(asset._id)}
                    title="Ver asset"
                  >
                    <FaEye /> Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-user-assets">
            <div className="no-assets-content">
              <FaUser className="no-assets-icon" />
              <h3>{profileUser.name} no ha publicado assets aún</h3>
              <p>Cuando publique contenido, aparecerá aquí.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile