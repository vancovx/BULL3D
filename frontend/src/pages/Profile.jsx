import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaSignOutAlt } from 'react-icons/fa'
import { getMe, updateUser } from '../features/users/userSlice'
import { logout, reset as authReset } from '../features/auth/authSlice'
import { getUserAssets } from '../features/assets/assetSlice'
import Spinner from '../components/Spinner'
import PersonalizeModal from './PersonalizeModal'
import { useState } from 'react'
import './Profile.css'

function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)

  // Obtenemos el usuario autenticado y el perfil del estado
  const { user } = useSelector((state) => state.auth)
  const { profile, isLoading } = useSelector((state) => state.user)
  const { userAssets, isLoading: assetsLoading } = useSelector((state) => state.assets)

  // Este useEffect se ejecuta al cargar el componente
  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
      navigate('/login')
      return
    }

    // Cargar el perfil del usuario actual
    dispatch(getMe())

    // Cargar los assets del usuario si tenemos su ID
    if (user._id) {
      dispatch(getUserAssets(user._id))
    }
  }, []) // Se ejecuta solo al montar el componente

  // Función para cerrar sesión
  const onLogout = () => {
    dispatch(logout())
    dispatch(authReset())
    navigate('/')
  }

  // Funciones para manejar el modal
  const openPersonalizeModal = () => setShowPersonalizeModal(true)
  const closePersonalizeModal = () => setShowPersonalizeModal(false)

  // Función para obtener la inicial del nombre
  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

  // Mostrar spinner mientras carga
  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="profile-page-container">
      {profile && (
        <>
          <div className="profile-banner">
            <div className="profile-info">
              <div className="profile-avatar">
                <div className="profile-initials">
                  {getInitial(profile.name)}
                </div>
              </div>
              <div className="profile-user-info">
                <h2>{profile.name}</h2>
                <p className="username">@{profile.username}</p>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-value">10</span> Seguidores
                  </div>
                  <div className="stat">
                    <span className="stat-value">10</span> Siguiendo
                  </div>
                </div>
              </div>
            </div>
            <button className="personalize-btn" onClick={openPersonalizeModal}>
              Personalizar
            </button>
          </div>

          <div className="profile-tabs">
            <button className="tab-btn active">Mis Assets</button>
            <button className="tab-btn">Descargas</button>
            <div className="tab-right">
              <button className="logout-btn" onClick={onLogout}>
                <FaSignOutAlt /> Cerrar Sesión
              </button>
            </div>
          </div>

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
                    />
                    <button className="remove-btn">×</button>
                    <button className="download-btn">↓</button>
                  </div>
                  <div className="asset-title">{asset.title}</div>
                </div>
              ))
            ) : (
              <div className="no-assets">
                <p>No tienes assets publicados</p>
              </div>
            )}
          </div>

          {showPersonalizeModal && (
            <PersonalizeModal 
              profile={profile} 
              onClose={closePersonalizeModal} 
              onSave={(data) => {
                dispatch(updateUser(data))
                closePersonalizeModal()
              }} 
            />
          )}
        </>
      )}
    </div>
  )
}

export default Profile