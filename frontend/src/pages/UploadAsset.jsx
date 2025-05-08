import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FaCloudUploadAlt, FaImage, FaFile, FaTimes } from 'react-icons/fa'
import { createAsset, reset } from '../features/assets/assetSlice'
import Spinner from '../components/Spinner'
import './UploadAsset.css'

function UploadAsset() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.auth)
  const { isLoading, isError, isSuccess, message } = useSelector(
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

  // Estado para archivos
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState([])
  const [content, setContent] = useState(null)
  const [contentName, setContentName] = useState('')

  // Comprobar si el usuario ha iniciado sesión y resetear estado al montar
  useEffect(() => {
    // Resetear el estado al cargar el componente
    dispatch(reset())
    
    if (!user) {
      navigate('/login')
    }
    
    // Limpiar al desmontar
    return () => {
      dispatch(reset())
    }
  }, [user, navigate, dispatch])

  // Manejar respuestas de la API
  useEffect(() => {
    if (isError) {
      toast.error(message)
      // Resetear el estado de envío del formulario
      setFormSubmitted(false)
    }

    // Solo mostrar mensaje de éxito y redirigir si realmente se ha enviado el formulario
    if (isSuccess && formSubmitted) {
      toast.success('Asset subido correctamente')
      navigate('/')
    }
  }, [isSuccess, isError, message, navigate, dispatch, formSubmitted])

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

    // Validar que se han seleccionado los archivos necesarios
    if (!coverImage || additionalImages.length === 0 || !content) {
      toast.error('Por favor sube todos los archivos requeridos')
      return
    }

    // Marcar el formulario como enviado
    setFormSubmitted(true)

    // Crear objeto con datos para enviar
    const assetData = {
      ...formData,
      tags: tags, // Usar el array de etiquetas
      typeContent: 'Modelo 3D', // Valor por defecto ya que se eliminó el selector
      coverImage,
      images: additionalImages,
      content
    }

    dispatch(createAsset(assetData))
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="upload-container">

      <form onSubmit={onSubmit} className="upload-form">
        <div className="form-grid">
          {/* Primera columna: Archivos (movida a la izquierda) */}
          <div className="form-column">
            <div className="form-section">
              <h2>Archivos</h2>
              
              {/* Imagen de portada */}
              <div className="form-group">
                <label>Imagen de portada <span className="required">*</span></label>
                <div className="file-upload-container">
                  {coverImagePreview ? (
                    <div className="image-preview-container">
                      <img src={coverImagePreview} alt="Vista previa" className="cover-preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setCoverImage(null)
                          setCoverImagePreview(null)
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="file-upload-box cover-upload-box" onClick={() => document.getElementById('coverImage').click()}>
                      <FaImage className="upload-icon cover-icon" />
                      <p>Haz clic para subir la imagen principal</p>
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
                <label>Imágenes adicionales <span className="required">*</span></label>
                <div className="file-upload-container">
                  <div className="file-upload-box additional-upload-box" onClick={() => document.getElementById('additionalImages').click()}>
                    <FaImage className="upload-icon additional-icon" />
                    <p>Haz clic para subir imágenes adicionales</p>
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
                        <img src={preview} alt={`Imagen ${index + 1}`} />
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
                <label>Archivo de contenido <span className="required">*</span></label>
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
                      <span>Archivo principal</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="content"
                    onChange={handleContentChange}
                    style={{ display: 'none' }}
                  />
                  {!content && <span className="file-hint content-hint">ZIP, RAR, FBX, OBJ, etc. (max 1GB)</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Segunda columna: Detalles principales (movida a la derecha) */}
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
          <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
            Cancelar
          </button>
          <button type="submit" className="submit-btn">
            Publicar Asset
          </button>
        </div>
      </form>
    </div>
  )
}

export default UploadAsset