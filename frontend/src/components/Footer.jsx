import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-left">
          <Link to="/" className="footer-logo">
            <img src="/Logo_Toro.png" alt="BULL3D Logo" className="footer-logo-img" />
          </Link>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaYoutube />
            </a>
          </div>
        </div>
        
        <div className="footer-right">
          <nav className="footer-nav">
            <Link to="/terminos" className="footer-link">Terminos y Condiciones</Link>
            <Link to="/faq" className="footer-link">FAQ</Link>
            <Link to="/contact" className="footer-link">Contactanos</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;