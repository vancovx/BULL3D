import React from 'react';
import './Contact.css';

const ContactPage = () => {
  return (
    <div className="app-container contact-page">
      <div className="contact-container">
        <div className="contact-box">
          <div className="contact-header">
            <h1>Contáctanos</h1>
            <p>Estamos aquí para ayudarte. Ponte en contacto con nosotros utilizando la información a continuación.</p>
          </div>
          
          <div className="contact-content">
            <div className="contact-info-section">
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
                      <p>Bull3D@gmail.com</p>
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
            </div>
          </div>
          
          <footer className="contact-footer">
            <p>&copy; 2025 Tu Empresa. Todos los derechos reservados.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;