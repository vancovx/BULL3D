import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Commets from './components/Comments'
import Login from './pages/Login'
import Register from './pages/Register'
import Inicio from './pages/Inicio'
import ViewAsset from './pages/ViewAsset'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import UploadAsset from './pages/UploadAsset'
import Favorites from './pages/Favorites'
import ExplorarCategoria from './pages/ExplorarCategoria'
import SearchResults from './pages/SearchResults'
import UserProfile from './pages/UserProfile'
import Terminos from './pages/Terminos'
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
            <Route path='/categoria/:categoria' element={<ExplorarCategoria />} />
            <Route path='/upload' element={<UploadAsset/>} />
            <Route path='/favorites' element={<Favorites />} />
            <Route path='/search' element={<SearchResults />} />
            <Route path='/user/:userId' element={<UserProfile />} />
            <Route path='/terminos' element={<Terminos />} />
          </Routes>
        </div>
        <Footer />
      </Router>
      <ToastContainer />
    </>
  )
}

export default App