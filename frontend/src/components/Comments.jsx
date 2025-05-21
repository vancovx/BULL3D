import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getAssetComments, createComment, updateComment, deleteComment, reset } from '../features/comments/commentSlice'
import { toast } from 'react-toastify'
import './Comments.css'

function Comments({ assetId }) {
  const [commentText, setCommentText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  
  const dispatch = useDispatch()
  
  const { user } = useSelector(state => state.auth)
  
  // Manejo seguro de la desestructuración con valores predeterminados
  const { comments = [], isLoading = false, isError = false, isSuccess = false, message = '' } = 
    useSelector(state => state.comments || {})
  
  // Cargar comentarios cuando se monte el componente o cambie el assetId
  useEffect(() => {
    if (assetId) {
      dispatch(getAssetComments(assetId))
    }
    
    return () => {
      dispatch(reset())
    }
  }, [assetId, dispatch])
  
  // Manejar respuestas de la API
  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
    
    if (isSuccess && editingId) {
      setEditingId(null)
      setEditText('')
    }
    
  }, [isError, isSuccess, message, editingId])
  
  // Enviar un nuevo comentario
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!commentText.trim()) {
      toast.error('El comentario no puede estar vacío')
      return
    }
    
    if (!user) {
      toast.error('Debes iniciar sesión para comentar')
      return
    }
    
    const commentData = {
      text: commentText
    }
    
    dispatch(createComment({
      assetId,
      commentData
    }))
    
    setCommentText('')
  }
  
  // Iniciar edición de comentario
  const handleEdit = (comment) => {
    setEditingId(comment._id)
    setEditText(comment.text)
  }
  
  // Guardar edición de comentario
  const handleSaveEdit = (e) => {
    e.preventDefault()
    
    if (!editText.trim()) {
      toast.error('El comentario no puede estar vacío')
      return
    }
    
    dispatch(updateComment({
      commentId: editingId,
      commentData: { text: editText }
    }))
  }
  
  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }
  
  // Eliminar comentario
  const handleDelete = (commentId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      dispatch(deleteComment(commentId))
    }
  }
  
  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  return (
    <div className="comments-section">
      <h3 className="comments-title">Comentarios</h3>
      
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            placeholder="Escribe un comentario..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="3"
            required
          />
          <button type="submit" className="comment-btn" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Publicar comentario'}
          </button>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Inicia sesión para dejar un comentario</p>
        </div>
      )}
      
      <div className="comments-list">
        {isLoading && comments.length === 0 ? (
          <div className="loading-comments">Cargando comentarios...</div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment._id} className="comment-item">
              {editingId === comment._id ? (
                <form onSubmit={handleSaveEdit} className="edit-form">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows="3"
                    required
                  />
                  <div className="edit-actions">
                    <button type="submit" className="save-btn" disabled={isLoading}>
                      Guardar
                    </button>
                    <button 
                      type="button" 
                      className="cancel-btn" 
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="comment-header">
                    <div className="comment-user">
                      <div className="comment-avatar">
                        {comment.user && comment.user.name 
                          ? comment.user.name.charAt(0).toUpperCase() 
                          : '?'}
                      </div>
                      <span className="comment-username">
                        {comment.user ? comment.user.name : 'Usuario'} 
                        {comment.user && comment.user.username ? ` (@${comment.user.username})` : ''}
                      </span>
                    </div>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="comment-content">{comment.text}</div>
                  
                  {user && user._id === comment.user._id && (
                    <div className="comment-actions">
                      <button 
                        className="edit-comment-btn"
                        onClick={() => handleEdit(comment)}
                      >
                        Editar
                      </button>
                      <button 
                        className="delete-comment-btn"
                        onClick={() => handleDelete(comment._id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className="no-comments">
            <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Comments