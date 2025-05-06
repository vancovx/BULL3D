import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { login, reset } from '../features/auth/authSlice'
import Spinner from '../components/Spinner'
import '../Login.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

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

    const userData = {
      email,
      password,
    }

    dispatch(login(userData))
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="app-container login-page">
      <div className="login-container expanded-container">
        <div className="login-box expanded-box">
          <div className="login-header">
            <h1>BULL3D</h1>
            <p>Nos alegra volver a verte!!</p>
          </div>
          
          <form onSubmit={onSubmit} className="login-form">
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
              <p className="forgot-password">He olvidado mi contraseña.</p>
            </div>
            
            <div className="form-group">
              <button type="submit" className="btn-login-submit">
                Iniciar Sesión
              </button>
            </div>
            
            <div className="register-prompt">
              <p>¿Es tu primera vez? <a href="/register" className="register-link">Registrarse</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login