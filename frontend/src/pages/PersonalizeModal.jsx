import { useState, useEffect } from 'react';
import './PersonalizeModal.css';

function PersonalizeModal({ profile, onClose, onSave }) {
  console.log('PersonalizeModal recibió el perfil:', profile);
  
  // Inicializar userData con los datos de profile
  const [userData, setUserData] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    description: profile?.description || '',
    highContrast: profile?.highContrast || false
  });

  // Actualizar userData cada vez que profile cambia
  useEffect(() => {
    if (profile) {
      console.log('Actualizando userData con profile:', profile);
      setUserData({
        name: profile.name || '',
        username: profile.username || '',
        description: profile.description || '',
        highContrast: profile.highContrast || false
      });
    }
  }, [profile]);

  const [editableFields, setEditableFields] = useState({
    name: false,
    username: false,
    description: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({
      ...userData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Enviando datos actualizados:', userData);
    onSave(userData);
  };

  const handleEditField = (fieldName) => {
    setEditableFields({
      ...editableFields,
      [fieldName]: !editableFields[fieldName]
    });
  };

  // Función para obtener inicial
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="modal-overlay">
      <div className="personalize-modal">
        <div className="modal-header">
          <h2>Personalizar</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="bull3d-logo">
          <h1>BULL3D</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="user-profile-section">
            <div className="profile-avatar">
              <div className="profile-initials">
                {getInitial(userData.name)}
              </div>
            </div>
            <div className="profile-name-username">
              <h3>{userData.name || 'Usuario'}</h3>
              <p>@{userData.username || 'username'}</p>
            </div>
            <button type="button" className="change-photo-btn">
              Cambiar foto
            </button>
          </div>

          <div className="form-fields">
            <div className="form-group">
              <label>Nombre</label>
              <div 
                className="input-with-edit"
                onClick={() => !editableFields.name && handleEditField('name')}
              >
                <input 
                  type="text" 
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  disabled={!editableFields.name}
                  placeholder="Nombre"
                />
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditField('name');
                  }}
                >
                  {editableFields.name ? 'Listo' : 'Editar'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Nombre de Usuario</label>
              <div 
                className="input-with-edit"
                onClick={() => !editableFields.username && handleEditField('username')}
              >
                <input 
                  type="text" 
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  disabled={!editableFields.username}
                  placeholder="Username"
                />
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditField('username');
                  }}
                >
                  {editableFields.username ? 'Listo' : 'Editar'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <div 
                className="input-with-edit"
                onClick={() => !editableFields.description && handleEditField('description')}
              >
                <input 
                  type="text" 
                  name="description"
                  value={userData.description}
                  onChange={handleChange}
                  disabled={!editableFields.description}
                  placeholder="Añade una descripción"
                />
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditField('description');
                  }}
                >
                  {editableFields.description ? 'Listo' : 'Editar'}
                </button>
              </div>
            </div>

            <div className="form-group accessibility">
              <label>Accessibilidad</label>
              <div className="toggle-option">
                <span>Contraste alto de colores</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="highContrast"
                    checked={userData.highContrast}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonalizeModal;