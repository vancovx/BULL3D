import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUser, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import { getMe, updateUser, reset } from '../features/users/userSlice'
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

  const [isEditing, setIsEditing] = useState(false)
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    numberphone: '',
    description: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    dispatch(getMe())

    return () => {
      dispatch(reset())
    }
  }, [user, navigate, dispatch])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        numberphone: profile.numberphone || '',
        description: profile.description || ''
      })
    }
  }, [profile])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && message) {
      toast.success(message)
    }

    dispatch(reset())
  }, [isError, isSuccess, message, dispatch])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const handleEditToggle = () => {
    if (isEditing && profile) {
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

  if (isLoading || !profile) {
    return <Spinner />
  }

  return (
    <div className="profile-page-container">
      <div className="profile-banner">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="profile-initials">
              {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
          <div className="profile-user-info">
            <h2>{profile.name ?? 'Cargando...'}</h2>
            <p className="username">@{profile.username ?? '...'}</p>
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
          <button className="logout-btn">Cerrar Sesión</button>
        </div>
      </div>

      <div className="assets-grid">
        {/* Simulación de assets, puedes conectarlos dinámicamente más adelante */}
        <div className="asset-card">
          <div className="asset-img">
            <img src="/toro-blender.jpg" alt="Toro en Blender" />
            <button className="remove-btn">×</button>
            <button className="download-btn">↓</button>
          </div>
          <div className="asset-title">Toro en Blender</div>
        </div>
        {/* Más assets... */}
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
    </div>
  )
}

export default Profile
