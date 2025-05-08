import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Inicio from './pages/Inicio'
import ViewAsset from './pages/ViewAsset'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import UploadAsset from './pages/UploadAsset'
import './App.css'

function App() {
  return (
    <>
      <Router>
        <Header />
        <div className="page-container">
          <Routes>
            <Route path='/' element={<Inicio />} />
            <Route path='/inicio' element={<Inicio />} />
            <Route path='/assets/:id' element={<ViewAsset />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/explore' element={<Inicio />} />
            <Route path='/upload' element={<UploadAsset/>} />
          </Routes>
        </div>
        <Footer />
      </Router>
      <ToastContainer />
    </>
  )
}

export default App