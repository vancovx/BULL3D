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

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    typeContent: '',
    category: '',
    tags: '',
    description: '',
    date: ''
  })

  // Estado para archivos
  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState([])
  const [content, setContent] = useState(null)
  const [contentName, setContentName] = useState('')

  // Comprobar si el usuario ha iniciado sesión
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Manejar respuestas de la API
  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess) {
      toast.success('Asset subido correctamente')
      navigate('/')
      dispatch(reset())
    }

    return () => {
      dispatch(reset())
    }
  }, [isSuccess, isError, message, navigate, dispatch])

  // Manejar cambios en los campos de texto
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
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
    if (!formData.title || !formData.typeContent || !formData.description || !formData.category) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    // Validar que se han seleccionado los archivos necesarios
    if (!coverImage || additionalImages.length === 0 || !content) {
      toast.error('Por favor sube todos los archivos requeridos')
      return
    }

    // Crear objeto con datos para enviar
    const assetData = {
      ...formData,
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
      <div className="upload-header">
        <h1><FaCloudUploadAlt /> Subir Asset</h1>
        <p>Comparte tus modelos 3D, texturas, y otros recursos con la comunidad</p>
      </div>

      <form onSubmit={onSubmit} className="upload-form">
        <div className="form-grid">
          {/* Primera columna: Detalles principales */}
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
                  <option value="Arquitectura">Arquitectura</option>
                  <option value="Personajes">Personajes</option>
                  <option value="Vehículos">Vehículos</option>
                  <option value="Naturaleza">Naturaleza</option>
                  <option value="Animales">Animales</option>
                  <option value="Muebles">Muebles</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Etiquetas (máx. 5, separadas por comas)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={onChange}
                  placeholder="Ej: blender, pbr, lowpoly, gratuito, gratis"
                />
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

          {/* Segunda columna: Subida de archivos */}
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
                    <div className="file-upload-box" onClick={() => document.getElementById('coverImage').click()}>
                      <FaImage className="upload-icon" />
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
                  <div className="file-upload-box" onClick={() => document.getElementById('additionalImages').click()}>
                    <FaImage className="upload-icon" />
                    <p>Haz clic para subir imágenes adicionales</p>
                    <span className="file-hint">Máximo 10 imágenes (max 5MB cada una)</span>
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
                    <div className="file-upload-box" onClick={() => document.getElementById('content').click()}>
                      <FaFile className="upload-icon" />
                      <p>Haz clic para subir el archivo principal</p>
                      <span className="file-hint">ZIP, RAR, FBX, OBJ, etc. (max 1GB)</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="content"
                    onChange={handleContentChange}
                    style={{ display: 'none' }}
                  />
                </div>
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