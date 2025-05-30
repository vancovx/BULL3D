import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaPaperPlane, FaTrash, FaEdit, FaLock, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import './Comments.css';

const CommentSection = ({ assetId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  // Cargar comentarios al montar el componente
  useEffect(() => {
    if (assetId) {
      fetchComments();
    }
  }, [assetId]);
  
  // Función para cargar los comentarios
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/assets/${assetId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      toast.error('No se pudieron cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };
  
  // Enviar un nuevo comentario
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }
    
    if (!user) {
      return;
    }
    
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      };
      
      await axios.post(`/api/assets/${assetId}/comments`, {
        text: newComment
      }, config);
      
      // Limpiar el campo y recargar comentarios
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error al publicar comentario:', error);
      toast.error('No se pudo publicar el comentario');
    }
  };
  
  // Eliminar un comentario
  const handleDeleteComment = async (commentId) => {
    if (!user) {
      toast.error('Debes iniciar sesión para eliminar comentarios');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        };
        
        await axios.delete(`/api/comments/${commentId}`, config);
        
        // Recargar comentarios
        fetchComments();
        toast.success('Comentario eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar comentario:', error);
        toast.error('No se pudo eliminar el comentario');
      }
    }
  };
  
  // Iniciar edición de un comentario
  const startEditing = (comment) => {
    setEditingComment(comment._id);
    setEditText(comment.text);
  };
  
  // Cancelar edición
  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };
  
  // Guardar edición de comentario
  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }
    
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      };
      
      await axios.put(`/api/comments/${commentId}`, {
        text: editText
      }, config);
      
      // Recargar comentarios y resetear estado de edición
      fetchComments();
      setEditingComment(null);
      setEditText('');
      toast.success('Comentario actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      toast.error('No se pudo actualizar el comentario');
    }
  };
  
  // Función para obtener la inicial del nombre
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // NUEVA: Función para navegar al perfil del usuario
  const navigateToUserProfile = (userId) => {
    if (userId) {
      navigate(`/user/${userId}`);
    }
  };
  
  return (
    <div className="comments-section">
      <h2 className="comments-title">Comentarios</h2>
      
      {/* Formulario para nuevos comentarios (solo para usuarios autenticados) */}
      {user ? (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <div className="comment-input-container">
            <div className="comment-avatar">
              <div className="comment-initials">{getInitial(user.name)}</div>
            </div>
            <textarea
              className="comment-input"
              placeholder="Escribe tu comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
            />
          </div>
          <button type="submit" className="post-comment-btn">
            <FaPaperPlane /> Publicar
          </button>
        </form>
      ) : (
        <div className="login-to-comment">
          <FaLock className="lock-icon" />
          <p>Inicia sesión para dejar un comentario</p>
          <Link to="/login" className="login-comment-btn">
            <FaSignInAlt /> Iniciar sesión
          </Link>
        </div>
      )}
      
      {/* Lista de comentarios (visible para todos) */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">Cargando comentarios...</div>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment._id} className="comment-item">
              <div 
                className="comment-avatar"
                onClick={() => comment.user?._id && navigateToUserProfile(comment.user._id)}
                style={{ cursor: comment.user?._id ? 'pointer' : 'default' }}
                title={comment.user?._id ? `Ver perfil de ${comment.user.name}` : ''}
              >
                <div className="comment-initials">{getInitial(comment.user?.name)}</div>
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span 
                    className="comment-author"
                    onClick={() => comment.user?._id && navigateToUserProfile(comment.user._id)}
                    style={{ 
                      cursor: comment.user?._id ? 'pointer' : 'default',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => comment.user?._id && (e.target.style.color = '#8c52ff')}
                    onMouseLeave={(e) => comment.user?._id && (e.target.style.color = '#fff')}
                    title={comment.user?._id ? `Ver perfil de ${comment.user.name}` : ''}
                  >
                    {comment.user?.name || 'Usuario'}
                  </span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  
                  
                </div>
                
                {editingComment === comment._id ? (
                  <div className="edit-comment-container">
                    <textarea
                      className="edit-comment-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                    />
                    <div className="edit-actions">
                      <button className="save-edit-btn" onClick={() => handleUpdateComment(comment._id)}>
                        Guardar
                      </button>
                      <button className="cancel-edit-btn" onClick={cancelEditing}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-text">{comment.text}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-comments">
            No hay comentarios. {user ? '¡Sé el primero en comentar!' : 'Inicia sesión para comentar.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;