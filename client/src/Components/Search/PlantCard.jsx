import React from 'react';
import { Link } from 'react-router-dom'; // Gebruik Link in plaats van useNavigate voor navigatie
import './PlantCard.css';

function PlantCard({ plant, isFavorite, onFavorite, onUnfavorite, session }) {

  return (
    <div className="plant-card">
      <div className="plant-image-overlay">
        <img src={plant.image_url} alt={plant.name} className="plant-image" />
      </div>
      <div className='plant-card-info'>
        <h2>{plant.name}</h2>
        {session && (
          <button
            className={`favorite-button ${isFavorite ? 'favorite' : ''}`}
            onClick={() => isFavorite ? onUnfavorite(plant.id) : onFavorite(plant.id)}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
        <div className='plant-card-info-dots'>
          <p>{plant.sunlight}</p>
          <p>{plant.water_frequency}</p>
          <p>{plant.height} cm</p>
        </div>
      </div>
      {/* Gebruik Link om naar de DetailPage te navigeren */}
      <Link to={`/plants/${plant.id}`} className="detail-link">Meer Info</Link>
    </div>
  );
}

export default PlantCard;
