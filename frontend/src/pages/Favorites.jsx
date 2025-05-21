import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getFavorites, removeFavorite, reset } from '../features/favorites/favoriteSlice'
import Spinner from '../components/Spinner'
import AssetItem from '../components/AssetItem'
import './Favorites.css'

function Favorites() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user } = useSelector((state) => state.auth)
  const { favorites, isLoading, isError, message } = useSelector(
    (state) => state.favorites
  )

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    dispatch(getFavorites())

    return () => {
      dispatch(reset())
    }
  }, [user, navigate, dispatch])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const handleRemoveFavorite = (assetId) => {
    dispatch(removeFavorite(assetId))
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <div className="favorites-container">
      <h1 className="favorites-title">Mis Favoritos</h1>

      {favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map((favorite) => (
            <div key={favorite._id} className="favorite-item">
              <AssetItem asset={favorite.asset} />
              <button 
                className="remove-favorite-btn"
                onClick={() => handleRemoveFavorite(favorite.asset._id)}
              >
                Quitar de favoritos
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-favorites">
          <p>No tienes assets favoritos.</p>
        </div>
      )}
    </div>
  )
}

export default Favorites