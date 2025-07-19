// src/components/characterDetail.jsx
import { useParams, useNavigate } from 'react-router-dom'
import charactersData from "../data/wuwave_characters.json"
import './characterDetail.css'

function CharacterDetail() {
  const { characterId } = useParams()
  const navigate = useNavigate()
  
  // Find the character data based on the ID from the URL
  const character = charactersData.charactersData.find(char => char.id === characterId)
  
  // If character not found, show error message
  if (!character) {
    return (
      <div className="character-detail">
        <h1>Character not found</h1>
        <button onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    )
  }

  return (
    <div className="character-detail">
      {/* Header with character image and basic info */}
      <div className="character-header">
        <div className="character-portrait">
          <img src={character.image} alt={character.name} />
        </div>
        <div className="character-basic-info">
          <h1>{character.name}</h1>
          <p className="weapon-type"><strong>Weapon:</strong> {character.weapon}</p>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Characters
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="character-stats">
        <h2>Base Stats</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">HP:</span>
            <span className="stat-value">{character.hp}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Attack:</span>
            <span className="stat-value">{character.attack}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Defense:</span>
            <span className="stat-value">{character.defense}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Crit Rate:</span>
            <span className="stat-value">{character.critRate}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Crit Damage:</span>
            <span className="stat-value">{character.critDmg}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">DMG Bonus:</span>
            <span className="stat-value">{character.dmgPerSetBonus}%</span>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="character-skills">
        <h2>Skills</h2>
        <div className="skills-list">
          {character.skills.map((skill, index) => (
            <div key={index} className={`skill-item ${skill.type}`}>
              <div className="skill-header">
                <h3>{skill.name}</h3>
                <span className="skill-type">{skill.type}</span>
              </div>
              <p className="skill-description">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CharacterDetail