import React, { useState } from 'react';
import './Contact.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('Por favor ingresa un email válido.');
      return;
    }
    
    // Simulación de envío exitoso
    setError('');
    setEnviado(true);
    
    // Reset del formulario después de 3 segundos
    setTimeout(() => {
      setEnviado(false);
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
      });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <header className="contact-header">
        <div className="container">
          <h1>Contáctanos</h1>
          <p>Estamos aquí para ayudarte. Envíanos un mensaje y nos pondremos en contacto contigo lo antes posible.</p>
        </div>
      </header>
      
      <main className="container">
        <div className="contact-content">
          <section className="contact-form-section">
            {enviado ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <h2>¡Mensaje enviado con éxito!</h2>
                <p>Gracias por contactarnos. Te responderemos pronto.</p>
              </div>
            ) : (
              <div className="contact-form">
                <h2>Envíanos un mensaje</h2>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-group">
                  <label htmlFor="nombre">Nombre completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Correo electrónico *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@email.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="asunto">Asunto</label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    placeholder="¿Sobre qué nos escribes?"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje aquí..."
                    rows="5"
                  />
                </div>
                
                <button onClick={handleSubmit} type="button" className="submit-button">
                  Enviar mensaje
                </button>
              </div>
            )}
          </section>
          
          <section className="contact-info-section">
            <div className="info-card">
              <h3>Información de contacto</h3>
              <ul className="contact-list">
                <li>
                  <div className="icon">📍</div>
                  <div>
                    <strong>Dirección</strong>
                    <p>Calle Principal 123, Ciudad, CP 12345</p>
                  </div>
                </li>
                <li>
                  <div className="icon">📞</div>
                  <div>
                    <strong>Teléfono</strong>
                    <p>+34 123 456 789</p>
                  </div>
                </li>
                <li>
                  <div className="icon">✉️</div>
                  <div>
                    <strong>Email</strong>
                    <p>info@tuempresa.com</p>
                  </div>
                </li>
                <li>
                  <div className="icon">🕒</div>
                  <div>
                    <strong>Horario de atención</strong>
                    <p>Lunes a Viernes: 9:00 - 18:00</p>
                    <p>Sábados: 10:00 - 14:00</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="map-container">
              <h3>Encuéntranos</h3>
              <div className="map-placeholder">
                <img 
                  src="https://via.placeholder.com/600x300" 
                  alt="Ubicación en el mapa" 
                  className="map-image"
                />
                <div className="map-overlay">Mapa interactivo</div>
              </div>
            </div>
            
            <div className="social-media">
              <h3>Síguenos</h3>
              <div className="social-icons">
                <div className="social-icon">
                  <div className="icon">📘</div>
                  <span>Facebook</span>
                </div>
                <div className="social-icon">
                  <div className="icon">📷</div>
                  <span>Instagram</span>
                </div>
                <div className="social-icon">
                  <div className="icon">🐦</div>
                  <span>Twitter</span>
                </div>
                <div className="social-icon">
                  <div className="icon">💼</div>
                  <span>LinkedIn</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="contact-footer">
        <div className="container">
          <p>&copy; 2025 Tu Empresa. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;