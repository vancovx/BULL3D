import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaUser } from 'react-icons/fa'
import { register, reset } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'
import '../Login.css' // Importamos el mismo CSS que usa el componente Login

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    password: '',
    password2: '',
  })

  const { name, username, email, phone, bio, password, password2 } = formData

  const [termsAccepted, setTermsAccepted] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess || user) {
      navigate('/')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (password !== password2) {
      toast.error('Las contraseñas no coinciden')
    } else if (!termsAccepted) {
      toast.error('Debes aceptar las condiciones del servicio')
    } else {
      const userData = {
        name,
        username,
        email,
        phone,
        bio,
        password,
      }

      dispatch(register(userData))
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="app-container">
      <div className="login-container expanded-container">
        <div className="login-box expanded-box">
          <div className="login-header">
            <h1>BULL3D</h1>
          </div>
          
          <form onSubmit={onSubmit} className="login-form">
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
              <input
                type="text"
                id="bio"
                name="bio"
                value={bio}
                placeholder="Pequeña Descripción"
                onChange={onChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña <span className="required">*</span></label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                placeholder="Contraseña"
                onChange={onChange}
                required
              />
              <p className="password-hint">Mínimo 8 caracteres, incluyendo 2 números y una mayúscula.</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="password2">Repetir contraseña <span className="required">*</span></label>
              <input
                type="password"
                id="password2"
                name="password2"
                value={password2}
                placeholder="Repetir Contraseña"
                onChange={onChange}
                required
              />
            </div>
            
            <div className="form-group terms-group">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
              <label htmlFor="terms" className="terms-label">
                Acepto las Condiciones del servicio y la Política de privacidad de Bull3D
              </label>
            </div>
            
            <div className="form-group">
              <button type="submit" className="btn-login-submit">
                Registrarse
              </button>
            </div>
            
            <div className="register-prompt">
              <p>¿Ya tienes una cuenta? <a href="/login" className="register-link">Inicia Sesión</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register