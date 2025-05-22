import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaSignOutAlt, FaTrash, FaCalendar, FaFileAlt, FaAdjust, FaEdit, FaCloudUploadAlt } from 'react-icons/fa'
import { getMe, updateUser, reset as userReset } from '../features/users/userSlice'
import { logout, reset as authReset } from '../features/auth/authSlice'
import { getUserAssets, deleteAsset, reset as assetReset } from '../features/assets/assetSlice'
import { getUserDownloads, deleteDownloadEntry, getDownloadStats, reset as downloadReset } from '../features/downloads/downloadSlice'
import Spinner from '../components/Spinner'
import PersonalizeModal from './PersonalizeModal'
import './Profile.css'

function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false)
  const [activeTab, setActiveTab] = useState('assets')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Estado para alto contraste
  const [isHighContrast, setIsHighContrast] = useState(false)

  // Obtenemos el usuario autenticado y el perfil del estado
  const { user } = useSelector((state) => state.auth)
  const { profile, isLoading, isSuccess, isError, message } = useSelector((state) => state.user)
  const { userAssets, isLoading: assetsLoading, isError: assetsError, message: assetsMessage } = useSelector((state) => state.assets)
  const { downloads, pagination, stats, isLoading: downloadsLoading, isError: downloadsError, message: downloadsMessage } = useSelector((state) => state.downloads)

  // Solo leer el estado inicial del alto contraste
  useEffect(() => {
    const savedContrast = localStorage.getItem('high-contrast')
    if (savedContrast) {
      setIsHighContrast(JSON.parse(savedContrast))
    }
  }, [])

  // Este useEffect se ejecuta al cargar el componente
  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
      navigate('/login')
      return
    }

    // Cargar el perfil del usuario actual con dispatch
    dispatch(getMe())
    
    // Cargar los assets del usuario
    if (user && (user._id || user.id)) {
      dispatch(getUserAssets(user._id || user.id))
    }

    // Cargar las estadísticas de descargas inmediatamente al cargar el perfil
    dispatch(getDownloadStats())
    
    // Limpiar estados al desmontar el componente
    return () => {
      dispatch(userReset())
      dispatch(assetReset())
      dispatch(downloadReset())
    }
  }, [user, navigate, dispatch])
  
  // Cargar descargas cuando se selecciona la pestaña de descargas
  useEffect(() => {
    if (activeTab === 'downloads' && user) {
      dispatch(getUserDownloads({ page: currentPage, limit: 10 }))
    }
  }, [activeTab, currentPage, dispatch, user])
  
  // Manejar errores
  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
    
    if (assetsError) {
      toast.error(assetsMessage)
    }

    if (downloadsError) {
      toast.error(downloadsMessage)
    }
  }, [isError, message, assetsError, assetsMessage, downloadsError, downloadsMessage])

  // Función para manejar el toggle de alto contraste
  const handleContrastToggle = () => {
    const newContrastState = !isHighContrast
    setIsHighContrast(newContrastState)
    
    // Guardar en localStorage
    localStorage.setItem('high-contrast', JSON.stringify(newContrastState))
    
    // Aplicar/quitar el tema inmediatamente
    if (newContrastState) {
      document.documentElement.setAttribute('data-theme', 'high-contrast')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  // Función para cerrar sesión
  const onLogout = () => {
    dispatch(logout())
    dispatch(authReset())
    dispatch(userReset())
    dispatch(assetReset())
    dispatch(downloadReset())
    navigate('/')
  }

  // Función para eliminar un asset
  const handleDeleteAsset = (assetId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este asset?')) {
      dispatch(deleteAsset(assetId))
        .unwrap()
        .then(() => {
          toast.success('Asset eliminado correctamente')
          // Recargar los assets del usuario
          if (user && (user._id || user.id)) {
            dispatch(getUserAssets(user._id || user.id))
          }
        })
        .catch((error) => {
          toast.error('Error al eliminar el asset')
        })
    }
  }

  // NUEVA: Función para editar un asset
  const handleEditAsset = (assetId) => {
    navigate(`/edit-asset/${assetId}`)
  }

  // Función para eliminar entrada del historial de descargas
  const handleDeleteDownloadEntry = (downloadId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta entrada del historial?')) {
      dispatch(deleteDownloadEntry(downloadId))
        .unwrap()
        .then(() => {
          toast.success('Entrada eliminada del historial')
          // Recargar la página actual de descargas y las estadísticas
          dispatch(getUserDownloads({ page: currentPage, limit: 10 }))
          dispatch(getDownloadStats())
        })
        .catch((error) => {
          toast.error('Error al eliminar la entrada')
        })
    }
  }

  // Función para descargar nuevamente un asset desde el historial (SIN registrar nueva entrada)
  const handleRedownload = async (download) => {
    // Verificar que el asset existe y tiene downloadUrl
    if (!download.asset || !download.asset.downloadUrl) {
      toast.error('No se puede descargar: asset no disponible o sin URL de descarga');
      return;
    }

    try {
      console.log('Iniciando descarga directa sin registrar en historial...');
      
      // Descargar directamente usando la URL del asset (sin registrar en historial)
      const fileName = download.assetTitle 
        ? `${download.assetTitle.replace(/[^a-zA-Z0-9]/g, '_')}` 
        : 'asset_content';
      
      const link = document.createElement('a');
      link.href = download.asset.downloadUrl;
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Descarga iniciada');
      
    } catch (error) {
      console.error('Error al iniciar la descarga:', error);
      toast.error('Error al iniciar la descarga');
    }
  }

  // Funciones para manejar el modal
  const openPersonalizeModal = () => setShowPersonalizeModal(true)
  const closePersonalizeModal = () => setShowPersonalizeModal(false)

  // Función para obtener la inicial del nombre
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  // Función para manejar el cambio de tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'downloads') {
      setCurrentPage(1) // Resetear página al cambiar a descargas
    }
  }

  // Función para manejar la paginación
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  // Función para manejar la actualización del perfil
  const handleProfileUpdate = (userData) => {
    console.log('Datos a actualizar:', userData)
    dispatch(updateUser(userData))
      .unwrap()
      .then((updatedData) => {
        console.log('Perfil actualizado:', updatedData)
        toast.success('Perfil actualizado correctamente')
        closePersonalizeModal()
        // Recargar el perfil después de actualizar para obtener los datos más recientes
        dispatch(getMe())
      })
      .catch((error) => {
        console.error('Error al actualizar perfil:', error)
        toast.error('Error al actualizar el perfil')
      })
  }

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Preparar los datos del perfil para pasar al modal
  const profileData = profile || user || {}
  

  // Mostrar spinner mientras carga
  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="profile-page-container">
      <div className="profile-banner">
        <div className="profile-info">
          <div className="profile-avatar">
            <div className="profile-initials">
              {getInitial(profile?.name || user?.name || '?')}
            </div>
          </div>
          <div className="profile-user-info">
            <h2>{profile?.name || user?.name || 'Usuario'}</h2>
            <p className="username">@{profile?.username || user?.username || 'username'}</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{userAssets?.length || 0}</span> Assets
              </div>
              <div className="stat">
                <span className="stat-value">{stats?.totalDownloads || 0}</span> Descargas
              </div>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button className="personalize-btn" onClick={openPersonalizeModal}>
            Personalizar
          </button>
          <button 
            className={`contrast-btn ${isHighContrast ? 'active' : ''}`}
            onClick={handleContrastToggle}
            title={isHighContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
          >
            <FaAdjust />
          </button>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => handleTabChange('assets')}
        >
          Mis Assets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'downloads' ? 'active' : ''}`}
          onClick={() => handleTabChange('downloads')}
        >
          Historial de Descargas
        </button>
        <div className="tab-right">
          <button className="logout-btn" onClick={onLogout}>
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      </div>

      {activeTab === 'assets' && (
        <div className="assets-grid">
          {assetsLoading ? (
            <div className="loading-assets">Cargando assets...</div>
          ) : userAssets && userAssets.length > 0 ? (
            userAssets.map(asset => (
              <div className="asset-card" key={asset._id}>
                <div className="asset-img">
                  <img 
                    src={asset.coverImageUrl} 
                    alt={asset.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                    onClick={() => navigate(`/assets/${asset._id}`)}
                  />
                  <button 
                    className="remove-btn" 
                    onClick={() => handleDeleteAsset(asset._id)}
                    title="Eliminar asset"
                  >
                    <FaTrash />
                  </button>
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEditAsset(asset._id)}
                    title="Editar asset"
                  >
                    <FaEdit />
                  </button>
                </div>
                <div className="asset-title" onClick={() => navigate(`/assets/${asset._id}`)}>
                  {asset.title}
                </div>
              </div>
            ))
          ) : (
            <div className="no-assets">
              <div className="no-assets-content">
                <FaCloudUploadAlt className="no-assets-icon" />
                <h3>No tienes assets publicados</h3>
                <p>Cuando publiques contenido, aparecerá aquí en tu perfil.</p>
                <button className="create-asset-btn" onClick={() => navigate('/upload')}>
                  Crear un asset
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'downloads' && (
        <div className="downloads-section">
          {downloadsLoading ? (
            <div className="loading-downloads">
              <Spinner />
            </div>
          ) : downloads && downloads.length > 0 ? (
            <>
              <div className="downloads-list">
                {downloads.map(download => (
                  <div className="download-item" key={download._id}>
                    <div className="download-asset-info">
                      {download.asset ? (
                        <div className="download-asset-image">
                          <img 
                            src={download.asset.coverImageUrl} 
                            alt={download.assetTitle}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                            onClick={() => navigate(`/assets/${download.asset._id}`)}
                          />
                        </div>
                      ) : (
                        <div className="download-asset-image placeholder">
                          <FaFileAlt />
                        </div>
                      )}
                      
                      <div className="download-details">
                        <h4 className="download-title">
                          {download.asset ? (
                            <span 
                              onClick={() => navigate(`/assets/${download.asset._id}`)}
                              className="clickable-title"
                            >
                              {download.assetTitle}
                            </span>
                          ) : (
                            <span className="unavailable-title">
                              {download.assetTitle} (No disponible)
                            </span>
                          )}
                        </h4>
                        <div className="download-meta">
                          <span className="download-category">{download.assetCategory}</span>
                          <span className="download-date">
                            <FaCalendar /> {formatDate(download.downloadDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="download-actions">
                      <button 
                        className="delete-download-btn"
                        onClick={() => handleDeleteDownloadEntry(download._id)}
                        title="Eliminar del historial"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Paginación */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className={`pagination-btn ${!pagination.hasPrevPage ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Anterior
                  </button>
                  
                  <div className="pagination-info">
                    Página {pagination.currentPage} de {pagination.totalPages}
                  </div>
                  
                  <button 
                    className={`pagination-btn ${!pagination.hasNextPage ? 'disabled' : ''}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-downloads">
              <div className="no-downloads-content">
                <FaFileAlt className="no-downloads-icon" />
                <h3>No tienes descargas registradas</h3>
                <p>Cuando descargues assets, aparecerán aquí en tu historial.</p>
                <button className="browse-assets-btn" onClick={() => navigate('/')}>
                  Explorar Assets
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showPersonalizeModal && (
        <PersonalizeModal 
          profile={profileData}
          onClose={closePersonalizeModal} 
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  )
}

export default Profile