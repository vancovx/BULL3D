import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaSignOutAlt } from 'react-icons/fa'
import { getMe, updateUser, reset as userReset } from '../features/users/userSlice'
import { logout, reset as authReset } from '../features/auth/authSlice'
import { getUserAssets, deleteAsset, reset as assetReset } from '../features/assets/assetSlice'
import Spinner from '../components/Spinner'
import PersonalizeModal from './PersonalizeModal'
import './Profile.css'

function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)
  const [activeTab, setActiveTab] = useState('assets')

  // Obtenemos el usuario autenticado y el perfil del estado
  const { user } = useSelector((state) => state.auth)
  const { profile, isLoading, isSuccess, isError, message } = useSelector((state) => state.user)
  const { userAssets, isLoading: assetsLoading, isError: assetsError, message: assetsMessage } = useSelector((state) => state.assets)

  // Este useEffect se ejecuta al cargar el componente
  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
      navigate('/login')
      return
    }

    // Cargar el perfil del usuario actual con dispatch
    dispatch(getMe())
    
    // Cargar los assets del usuario
    if (user && (user._id || user.id)) {
      dispatch(getUserAssets(user._id || user.id))
    }
    
    // Limpiar estados al desmontar el componente
    return () => {
      dispatch(userReset())
      dispatch(assetReset())
    }
  }, [user, navigate, dispatch])
  
  // Manejar errores
  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
    
    if (assetsError) {
      toast.error(assetsMessage)
    }
  }, [isError, message, assetsError, assetsMessage])

  // Función para cerrar sesión
  const onLogout = () => {
    dispatch(logout())
    dispatch(authReset())
    dispatch(userReset())
    dispatch(assetReset())
    navigate('/')
  }

  // Función para eliminar un asset
  const handleDeleteAsset = (assetId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este asset?')) {
      dispatch(deleteAsset(assetId))
        .unwrap()
        .then(() => {
          toast.success('Asset eliminado correctamente')
          // Recargar los assets del usuario
          if (user && (user._id || user.id)) {
            dispatch(getUserAssets(user._id || user.id))
          }
        })
        .catch((error) => {
          toast.error('Error al eliminar el asset')
        })
    }
  }

  // Función para descargar un asset
  const handleDownloadAsset = (asset) => {
    // Verificar si hay una URL de contenido para descargar
    if (asset.contentUrl) {
      // Crear un enlace temporal
      const link = document.createElement('a')
      link.href = asset.contentUrl
      link.download = asset.title || 'asset-download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      toast.error('No hay contenido disponible para descargar')
    }
  }

  // Funciones para manejar el modal
  const openPersonalizeModal = () => setShowPersonalizeModal(true)
  const closePersonalizeModal = () => setShowPersonalizeModal(false)

  // Función para obtener la inicial del nombre
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  // Función para manejar el cambio de tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Función para manejar la actualización del perfil
  const handleProfileUpdate = (userData) => {
    console.log('Datos a actualizar:', userData)
    dispatch(updateUser(userData))
      .unwrap()
      .then((updatedData) => {
        console.log('Perfil actualizado:', updatedData)
        toast.success('Perfil actualizado correctamente')
        closePersonalizeModal()
        // Recargar el perfil después de actualizar para obtener los datos más recientes
        dispatch(getMe())
      })
      .catch((error) => {
        console.error('Error al actualizar perfil:', error)
        toast.error('Error al actualizar el perfil')
      })
  }

  // Preparar los datos del perfil para pasar al modal
  const profileData = profile || user || {}
  
  console.log('Profile data:', profileData) // Debug
  console.log('User data:', user) // Debug

  // Mostrar spinner mientras carga
  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="profile-page-container">
      <div className="profile-banner">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="profile-initials">
              {getInitial(profile?.name || user?.name || '?')}
            </div>
          </div>
          <div className="profile-user-info">
            <h2>{profile?.name || user?.name || 'Usuario'}</h2>
            <p className="username">@{profile?.username || user?.username || 'username'}</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">0</span> Seguidores
              </div>
              <div className="stat">
                <span className="stat-value">0</span> Siguiendo
              </div>
            </div>
          </div>
        </div>
        <button className="personalize-btn" onClick={openPersonalizeModal}>
          Personalizar
        </button>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => handleTabChange('assets')}
        >
          Mis Assets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'downloads' ? 'active' : ''}`}
          onClick={() => handleTabChange('downloads')}
        >
          Descargas
        </button>
        <div className="tab-right">
          <button className="logout-btn" onClick={onLogout}>
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </div>

      {activeTab === 'assets' && (
        <div className="assets-grid">
          {assetsLoading ? (
            <div className="loading-assets">Cargando assets...</div>
          ) : userAssets && userAssets.length > 0 ? (
            userAssets.map(asset => (
              <div className="asset-card" key={asset._id}>
                <div className="asset-img">
                  <img 
                    src={asset.coverImageUrl} 
                    alt={asset.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                    onClick={() => navigate(`/assets/${asset._id}`)}
                  />
                  <button 
                    className="remove-btn" 
                    onClick={() => handleDeleteAsset(asset._id)}
                    title="Eliminar asset"
                  >
                    ×
                  </button>
                  <button 
                    className="download-btn" 
                    onClick={() => handleDownloadAsset(asset)}
                    title="Descargar asset"
                  >
                    ↓
                  </button>
                </div>
                <div className="asset-title" onClick={() => navigate(`/assets/${asset._id}`)}>
                  {asset.title}
                </div>
              </div>
            ))
          ) : (
            <div className="no-assets">
              <p>No tienes assets publicados</p>
              <button className="create-asset-btn" onClick={() => navigate('/new-asset')}>
                Crear un asset
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'downloads' && (
        <div className="downloads-section">
          <p>Funcionalidad de descargas en desarrollo.</p>
        </div>
      )}

      {showPersonalizeModal && (
        <PersonalizeModal 
          profile={profileData}
          onClose={closePersonalizeModal} 
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  )
}

export default Profile