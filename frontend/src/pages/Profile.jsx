import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUser, FaEdit, FaCheck, FaTimes } from 'react-icons/fa'
import { getMe, updateUser, reset } from '../features/users/userSlice'
import Spinner from '../components/Spinner'
import './Profile.css'

function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user } = useSelector((state) => state.auth)
  const { profile, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.user
  )

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    numberphone: '',
    description: ''
  })

  // Cargar el perfil cuando se monte el componente
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

  // Actualizar el formulario cuando se cargue el perfil
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

  // Manejar errores y éxito
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
    if (isEditing) {
      // Si estamos cancelando la edición, restauramos los datos originales
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

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>
          <FaUser className="profile-icon" /> Mi Perfil
        </h1>
        {!isEditing ? (
          <button className="edit-btn" onClick={handleEditToggle}>
            <FaEdit /> Editar Perfil
          </button>
        ) : (
          <div className="edit-controls">
            <button className="save-btn" onClick={onSubmit}>
              <FaCheck /> Guardar
            </button>
            <button className="cancel-btn" onClick={handleEditToggle}>
              <FaTimes /> Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-image-section">
          <div className="profile-image">
            {/* Imagen de perfil con iniciales si no hay imagen */}
            <div className="profile-initials">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>
          {isEditing && (
            <button className="upload-image-btn">
              Cambiar Imagen
            </button>
          )}
        </div>

        <div className="profile-details">
          <div className="profile-form">
            <div className="form-group">
              <label>Nombre</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  placeholder="Tu nombre"
                />
              ) : (
                <p className="profile-value">{profile?.name}</p>
              )}
            </div>

            <div className="form-group">
              <label>Nombre de Usuario</label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={onChange}
                  placeholder="Nombre de usuario"
                />
              ) : (
                <p className="profile-value">{profile?.username}</p>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  placeholder="Email"
                />
              ) : (
                <p className="profile-value">{profile?.email}</p>
              )}
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              {isEditing ? (
                <input
                  type="text"
                  name="numberphone"
                  value={formData.numberphone || ''}
                  onChange={onChange}
                  placeholder="Número de teléfono"
                />
              ) : (
                <p className="profile-value">
                  {profile?.numberphone ? profile.numberphone : 'No especificado'}
                </p>
              )}
            </div>

            <div className="form-group description-group">
              <label>Descripción</label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={onChange}
                  placeholder="Cuéntanos sobre ti"
                  rows="5"
                />
              ) : (
                <p className="profile-value description-value">
                  {profile?.description ? profile.description : 'No hay descripción disponible.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <div className="card user-stats">
          <h3>Estadísticas de Usuario</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Assets</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Descargas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Favoritos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Comentarios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile