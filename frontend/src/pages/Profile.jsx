import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUser, FaEdit, FaCheck, FaTimes, FaSignOutAlt } from 'react-icons/fa'
import { getMe, updateUser, reset } from '../features/users/userSlice'
import { logout, reset as authReset } from '../features/auth/authSlice'
import { getUserAssets } from '../features/assets/assetSlice'
import Spinner from '../components/Spinner'
import PersonalizeModal from './PersonalizeModal'
import './Profile.css'

function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user } = useSelector((state) => state.auth)
  const { profile, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.user
  )
  const { userAssets, isLoading: assetsLoading } = useSelector(
    (state) => state.assets
  )

  const [isEditing, setIsEditing] = useState(false)
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    numberphone: '',
    description: ''
  })

  // Función para cerrar sesión
  const onLogout = () => {
    dispatch(logout())
    dispatch(authReset())
    navigate('/')
  }

  // Cargar datos de usuario cuando se monta el componente
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    console.log('Cargando perfil del usuario autenticado')
    dispatch(getMe())

    // Cargar los assets del usuario
    if (user._id) {
      dispatch(getUserAssets(user._id))
    }

    return () => {
      dispatch(reset())
    }
  }, [user, navigate, dispatch])

  // Actualizar formulario cuando cambia el perfil
  useEffect(() => {
    if (profile) {
      console.log('Perfil cargado:', profile)
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        numberphone: profile.numberphone || '',
        description: profile.description || ''
      })
    }
  }, [profile])

  // Manejar errores y mensajes de éxito
  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && message) {
      toast.success(message)
    }
  }, [isError, isSuccess, message])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const handleEditToggle = () => {
    if (isEditing && profile) {
      // Revertir cambios si se cancela la edición
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        numberphone: profile.numberphone || '',
        description: profile.description || ''
      })
    }
    setIsEditing(!isEditing)
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const userData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      numberphone: formData.numberphone || null,
      description: formData.description || ''
    }

    dispatch(updateUser(userData))
    setIsEditing(false)
  }

  const openPersonalizeModal = () => {
    setShowPersonalizeModal(true)
  }

  const closePersonalizeModal = () => {
    setShowPersonalizeModal(false)
  }

  // Función de utilidad para obtener iniciales
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

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