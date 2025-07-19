// src/components/CharacterButtons.jsx
import { useNavigate } from 'react-router-dom'
import charactersData from "../data/wuwave_characters.json"
import './CharacterButtons.css'

function CharacterButtons({ onCharacterClick }) {
  const navigate = useNavigate()

  const handleCharacterClick = (character) => {
    console.log('Selected character:', character.name)
    // Navigate to the character's specific page
    navigate(`/character/${character.id}`)
    
    // Call the parent's onClick handler if provided
    if (onCharacterClick) {
      onCharacterClick(character)
    }
  }

  return (
    <div className="character-grid">
      {charactersData.charactersData.map((character) => (
        <button 
          key={character.id}
          onClick={() => handleCharacterClick(character)}
          className="character-button"
          style={{backgroundImage: `url(${character.image})`}}
        >
          {character.name}
        </button>
      ))}
    </div>
  )
}

export default CharacterButtons