import { useState } from 'react';
import './PersonalizeModal.css';

function PersonalizeModal({ profile, onClose, onSave }) {
  const [userData, setUserData] = useState({
    name: profile?.name || 'Oliver Ryan',
    username: profile?.username || 'oliver1234',
    description: profile?.description || 'Soy Diseñador Gráfico 3D...',
    highContrast: profile?.highContrast || false
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
    console.log(`Editing field: ${fieldName}`);
  };

  return (
    <div className="modal-overlay">
      <div className="personalize-modal">
        <div className="modal-header">
          <h2>Personalizar</h2>
        </div>
        
        <div className="bull3d-logo">
          <h1>BULL3D</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="user-profile-section">
            <div className="profile-avatar">
              <div className="profile-initials">
                {userData.name ? userData.name.charAt(0).toUpperCase() : 'O'}
              </div>
            </div>
            <div className="profile-name-username">
              <h3>{userData.name}</h3>
              <p>@{userData.username}</p>
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
                  disabled
                />
                <button 
                  type="button" 
                  className="edit-field-btn"
                  onClick={() => handleEditField('name')}
                >
                  Editar
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
                  disabled
                />
                <button 
                  type="button" 
                  className="edit-field-btn"
                  onClick={() => handleEditField('username')}
                >
                  Editar
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
                  disabled
                />
                <button 
                  type="button" 
                  className="edit-field-btn"
                  onClick={() => handleEditField('description')}
                >
                  Editar
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

          <button type="submit" className="save-changes-btn">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}

export default PersonalizeModal;