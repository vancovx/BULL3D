import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaCloudUploadAlt, FaImage, FaFile, FaTimes, FaArrowLeft } from 'react-icons/fa'
import { getAssetById, updateAsset, reset } from '../features/assets/assetSlice'
import Spinner from '../components/Spinner'
import './UploadAsset.css' // Reutilizamos los estilos del upload

function EditAsset() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.auth)
  const { asset, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.assets
  )

  // Seguimiento de si el formulario se ha enviado
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    date: ''
  })
  
  // Estado para etiquetas
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])

  // Estado para archivos (opcionales en edición)
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState([])
  const [content, setContent] = useState(null)
  const [contentName, setContentName] = useState('')

  // Cargar el asset al montar el componente
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (id) {
      dispatch(getAssetById(id))
    }
    
    // Limpiar al desmontar
    return () => {
      dispatch(reset())
    }
  }, [user, navigate, dispatch, id])

  // Cargar datos del asset en el formulario cuando se obtenga
  useEffect(() => {
    if (asset && asset._id) {
      // Verificar que el usuario actual es el propietario del asset
      if (asset.user !== user.id && asset.user !== user._id) {
        toast.error('No tienes permisos para editar este asset')
        navigate('/profile')
        return
      }

      // Llenar el formulario con los datos del asset
      setFormData({
        title: asset.title || '',
        category: asset.category || '',
        description: asset.description || '',
        date: asset.date ? new Date(asset.date).toISOString().split('T')[0] : ''
      })

      // Configurar etiquetas
      if (asset.tags && Array.isArray(asset.tags)) {
        setTags(asset.tags)
      }

      // Configurar imagen de portada existente
      if (asset.coverImageUrl) {
        setCoverImagePreview(asset.coverImageUrl)
      }

      // Configurar imágenes adicionales existentes
      if (asset.imagesUrl) {
        try {
          const existingImages = JSON.parse(asset.imagesUrl)
          setAdditionalImagesPreview(existingImages)
        } catch (e) {
          console.error('Error parsing existing images:', e)
        }
      }
    }
  }, [asset, user, navigate])

  // Manejar respuestas de la API
  useEffect(() => {
    if (isError) {
      toast.error(message)
      setFormSubmitted(false)
    }

    if (isSuccess && formSubmitted) {
      toast.success('Asset actualizado correctamente')
      navigate('/profile')
    }
  }, [isSuccess, isError, message, navigate, formSubmitted])

  // Manejar cambios en los campos de texto
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }
  
  // Manejar cambios en el input de etiquetas
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value)
  }
  
  // Agregar etiqueta
  const addTag = () => {
    const trimmedInput = tagInput.trim()
    if (trimmedInput && !tags.includes(trimmedInput) && tags.length < 5) {
      setTags([...tags, trimmedInput])
      setTagInput('')
    }
  }
  
  // Manejar key press en el input de etiquetas
  const handleTagKeyDown = (e) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }
  
  // Eliminar etiqueta
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  // Manejar cambio de imagen de portada
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Manejar cambio de imágenes adicionales
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      // Limitar a un máximo de 4 imágenes
      const newFiles = [...additionalImages, ...files].slice(0, 4)
      setAdditionalImages(newFiles)

      // Generar previsualizaciones
      const newPreviews = newFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result)
          }
          reader.readAsDataURL(file)
        })
      })

      Promise.all(newPreviews).then(previews => {
        setAdditionalImagesPreview(previews)
      })
    }
  }

  // Eliminar una imagen adicional
  const removeAdditionalImage = (index) => {
    const updatedImages = [...additionalImages]
    updatedImages.splice(index, 1)
    setAdditionalImages(updatedImages)

    const updatedPreviews = [...additionalImagesPreview]
    updatedPreviews.splice(index, 1)
    setAdditionalImagesPreview(updatedPreviews)
  }

  // Manejar cambio del archivo de contenido
  const handleContentChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setContent(file)
      setContentName(file.name)
    }
  }

  // Enviar el formulario
  const onSubmit = (e) => {
    e.preventDefault()

    // Validar los campos requeridos
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    // Marcar el formulario como enviado
    setFormSubmitted(true)

    // Crear objeto con datos para enviar (solo incluir archivos si se han cambiado)
    const assetData = {
      ...formData,
      tags: tags,
      typeContent: 'Modelo 3D'
    }

    // Solo incluir archivos si se han seleccionado nuevos
    if (coverImage) assetData.coverImage = coverImage
    if (additionalImages.length > 0) assetData.images = additionalImages
    if (content) assetData.content = content

    dispatch(updateAsset({ id: asset._id, assetData }))
  }

  // Función para obtener la URL de imagen con proxy
  const getImageUrl = (url) => {
    if (!url) return '';
    
    if (url.startsWith('/api/proxy/image/')) {
      return url;
    }
    
    if (url.includes('drive.google.com')) {
      const idParam = url.match(/[?&]id=([^&]+)/);
      if (idParam && idParam[1]) {
        return `/api/proxy/image/${idParam[1]}`;
      }
      
      const pathId = url.match(/\/d\/([^\/\?]+)/) || url.match(/\/file\/d\/([^\/\?]+)/);
      if (pathId && pathId[1]) {
        return `/api/proxy/image/${pathId[1]}`;
      }
    }
    
    return url;
  };

  if (isLoading || !asset) {
    return <Spinner />
  }

  return (
    <div className="upload-container">

      <form onSubmit={onSubmit} className="upload-form">
        <div className="form-grid">
          {/* Primera columna: Archivos (opcionales en edición) */}
          <div className="form-column">
            <div className="form-section">
              <h2>Archivos (opcional - solo si quieres cambiarlos)</h2>
              
              {/* Imagen de portada */}
              <div className="form-group">
                <label>Imagen de portada</label>
                <div className="file-upload-container">
                  {coverImagePreview ? (
                    <div className="image-preview-container">
                      <img 
                        src={typeof coverImagePreview === 'string' && coverImagePreview.startsWith('http') 
                          ? getImageUrl(coverImagePreview) 
                          : coverImagePreview} 
                        alt="Vista previa" 
                        className="cover-preview" 
                      />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setCoverImage(null)
                          setCoverImagePreview(asset.coverImageUrl) // Volver a la imagen original
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="file-upload-box cover-upload-box" onClick={() => document.getElementById('coverImage').click()}>
                      <FaImage className="upload-icon cover-icon" />
                      <p>Haz clic para cambiar la imagen principal</p>
                      <span className="file-hint">PNG, JPG o WEBP (max 5MB)</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="coverImage"
                    onChange={handleCoverImageChange}
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Imágenes adicionales */}
              <div className="form-group">
                <label>Imágenes adicionales</label>
                <div className="file-upload-container">
                  <div className="file-upload-box additional-upload-box" onClick={() => document.getElementById('additionalImages').click()}>
                    <FaImage className="upload-icon additional-icon" />
                    <p>Haz clic para cambiar imágenes adicionales</p>
                    <span className="file-hint">Máximo 3 imágenes (max 5MB cada una)</span>
                  </div>
                  <input
                    type="file"
                    id="additionalImages"
                    onChange={handleAdditionalImagesChange}
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                    style={{ display: 'none' }}
                  />
                </div>
                
                {additionalImagesPreview.length > 0 && (
                  <div className="additional-images-preview">
                    {additionalImagesPreview.map((preview, index) => (
                      <div key={index} className="additional-image-item">
                        <img 
                          src={typeof preview === 'string' && preview.startsWith('http') 
                            ? getImageUrl(preview) 
                            : preview} 
                          alt={`Imagen ${index + 1}`} 
                        />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Archivo principal */}
              <div className="form-group">
                <label>Archivo de contenido</label>
                <div className="file-upload-container">
                  {content ? (
                    <div className="file-selected">
                      <FaFile className="file-icon" />
                      <span className="file-name">{contentName}</span>
                      <button 
                        type="button" 
                        className="remove-file-btn"
                        onClick={() => {
                          setContent(null)
                          setContentName('')
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="content-upload-button" onClick={() => document.getElementById('content').click()}>
                      <FaFile className="content-icon" />
                      <span>Cambiar archivo principal</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="content"
                    onChange={handleContentChange}
                    style={{ display: 'none' }}
                  />
                  <span className="file-hint content-hint">ZIP, RAR, FBX, OBJ, etc. (max 1GB)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Segunda columna: Detalles principales */}
          <div className="form-column">
            <div className="form-section">
              <h2>Información Básica</h2>
              
              <div className="form-group">
                <label htmlFor="title">Título <span className="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={onChange}
                  placeholder="Nombre del asset"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoría <span className="required">*</span></label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={onChange}
                >
                  <option value="">-- Seleccionar categoría --</option>
                  <option value="Código">Código</option>
                  <option value="3D">3D</option>
                  <option value="2D">2D</option>
                  <option value="Imágenes">Imágenes</option>
                  <option value="Sonido y Música">Sonido y Música</option>
                  <option value="Plugins">Plugins</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tagInput">Etiquetas (máx. 5)</label>
                <input
                  type="text"
                  id="tagInput"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Escribe y presiona Tab o Enter para agregar"
                  maxLength={20}
                />
                {tags.length > 0 && (
                  <div className="tags-container">
                    {tags.map((tag, index) => (
                      <div key={index} className="tag-item">
                        <span className="tag-text">#{tag}</span>
                        <button 
                          type="button" 
                          className="tag-remove-btn"
                          onClick={() => removeTag(tag)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="tags-hint">
                  {tags.length < 5 ? 
                    `Puedes agregar ${5 - tags.length} etiqueta${5 - tags.length !== 1 ? 's' : ''} más` : 
                    'Has alcanzado el límite de etiquetas'}
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Descripción <span className="required">*</span></label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  rows="6"
                  placeholder="Describe tu asset, incluye características, software utilizado, formatos, etc."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/profile')}>
            Cancelar
          </button>
          <button type="submit" className="submit-btn">
            Actualizar Asset
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditAsset