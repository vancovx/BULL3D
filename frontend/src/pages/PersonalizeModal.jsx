import { useState } from 'react';
import './PersonalizeModal.css';

function PersonalizeModal({ profile, onClose, onSave }) {
  const [userData, setUserData] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    description: profile?.description || '',
    highContrast: profile?.highContrast || false
  });

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
              <div className="input-with-edit">
                <input 
                  type="text" 
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  disabled={!editableFields.name}
                  className={editableFields.name ? 'editable' : ''}
                />
                <button 
                  type="button" 
                  className={`edit-field-btn ${editableFields.name ? 'active' : ''}`}
                  onClick={() => handleEditField('name')}
                >
                  {editableFields.name ? 'Listo' : 'Editar'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Nombre de Usuario</label>
              <div className="input-with-edit">
                <input 
                  type="text" 
                  name="username"
                  value={userData.username}
                  onChange={handleChange}
                  disabled={!editableFields.username}
                  className={editableFields.username ? 'editable' : ''}
                />
                <button 
                  type="button" 
                  className={`edit-field-btn ${editableFields.username ? 'active' : ''}`}
                  onClick={() => handleEditField('username')}
                >
                  {editableFields.username ? 'Listo' : 'Editar'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <div className="input-with-edit">
                <input 
                  type="text" 
                  name="description"
                  value={userData.description}
                  onChange={handleChange}
                  disabled={!editableFields.description}
                  className={editableFields.description ? 'editable' : ''}
                />
                <button 
                  type="button" 
                  className={`edit-field-btn ${editableFields.description ? 'active' : ''}`}
                  onClick={() => handleEditField('description')}
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
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-changes-btn">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonalizeModal;