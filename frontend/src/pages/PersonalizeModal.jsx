import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaTimes, FaUserEdit } from 'react-icons/fa'
import './PersonalizeModal.css'

function PersonalizeModal({ profile, onClose, onSave }) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
  })

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

    // Preparar datos para enviar
    const userData = {
      id: profile?._id || profile?.id,
      name,
      username,
      email,
      phone,
      bio,
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
            {/* Sin botones para cambiar foto */}
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
            <label htmlFor="bio">Pequeña Descripción</label>
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