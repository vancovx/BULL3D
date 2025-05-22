import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaTimes, FaUserEdit } from 'react-icons/fa'
import './PersonalizeModal.css'

function PersonalizeModal({ profile, onClose, onSave }) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
  })

  // Inicializar el formulario con los datos del perfil
  useEffect(() => {
    console.log('Profile recibido en modal:', profile) // Debug
    if (profile && Object.keys(profile).length > 0) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.numberphone || profile.phone || '',
        bio: profile.description || profile.bio || '',
      })
    }
  }, [profile])

  // Log para debug del estado del formulario
  useEffect(() => {
    console.log('FormData actualizado:', formData)
  }, [formData])

  // Extraer valores del formData
  const { name, username, email, phone, bio } = formData

  // Handler para cambios en los inputs
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validaciones básicas
    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!username.trim()) {
      toast.error('El nombre de usuario es requerido')
      return
    }

    if (!email.trim()) {
      toast.error('El email es requerido')
      return
    }

    // Preparar datos para enviar (usando los nombres correctos de la DB)
    const userData = {
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      numberphone: phone.trim() || null, // Usar numberphone como en la DB
      description: bio.trim() || null, // Usar description como en la DB
    }

    // Enviar al componente padre
    onSave(userData)
  }

  // Función para obtener la inicial del nombre
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  return (
    <div className="modal-backdrop">
      <div className="personalize-modal">
        <div className="modal-header">
          <h2>Personalizar perfil</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="personalize-form">
          <div className="avatar-section">
            <div className="profile-avatar-large">
              <div className="profile-initials">
                {getInitial(name || profile?.name || '?')}
              </div>
            </div>
            <p className="avatar-note">
              La foto de perfil se genera automáticamente con las iniciales de tu nombre
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              placeholder="Nombre"
              onChange={onChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario <span className="required">*</span></label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              placeholder="Nombre de Usuario"
              onChange={onChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Email"
              onChange={onChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Número de Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              placeholder="Número de Teléfono"
              onChange={onChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bio">Descripción</label>
            <textarea
              id="bio"
              name="bio"
              value={bio}
              placeholder="Cuéntanos un poco sobre ti..."
              onChange={onChange}
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PersonalizeModal