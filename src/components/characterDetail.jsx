import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import charactersData from "../data/wuwave_characters.json";
import CharacterStatsForm from "./characterStatsForm";
import "./characterDetail.css";

function CharacterDetail({ currentUser }) {
  const { characterId } = useParams();
  const [character, setCharacter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Find the character based on the ID from the URL
    const foundCharacter = charactersData.charactersData.find(
      (char) => char.id === characterId
    );
    setCharacter(foundCharacter);
  }, [characterId]);

  // Function to get character image
  const getCharacterImage = () => {
    if (character?.image) {
      return character.image;
    }
    // Fallback to placeholder if no image found
    return `https://via.placeholder.com/120x120/667eea/ffffff?text=${
      character?.name?.charAt(0) || "?"
    }`;
  };

  if (!character) {
    return (
      <div className="character-detail-container">
        <div className="character-not-found">
          <h2>Character not found</h2>
          <p>The character with ID "{characterId}" could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="character-detail-container">
      {/* Character Header with Image */}
      <div className="character-header">
        <img
          src={getCharacterImage()}
          alt={character.name}
          className="character-image"
          onError={(e) => {
            // Fallback to a placeholder if image doesn't load
            console.log("Image failed to load:", e.target.src);
            e.target.src = `https://via.placeholder.com/120x120/667eea/ffffff?text=${character.name.charAt(
              0
            )}`;
          }}
        />
        <div className="character-info">
          <h1 className="character-title">{character.name}</h1>
          <div className="character-weapon-type">{character.weapon}</div>
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back to Characters
          </button>
        </div>
      </div>

      {/* Stats Layout Container - Base Stats and User Stats Side by Side */}
      <div className="stats-layout-container">
        {/* Character Base Stats */}
        <div className="character-base-stats">
          <h2 className="section-title">Base Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">Base HP</div>
              <div className="stat-value">{character.hp}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Base Attack</div>
              <div className="stat-value">{character.attack}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Base Defense</div>
              <div className="stat-value">{character.defense}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Crit Rate</div>
              <div className="stat-value">{character.critRate}%</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Crit DMG</div>
              <div className="stat-value">{character.critDmg}%</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">DMG Bonus</div>
              <div className="stat-value">{character.dmgPerSetBonus}%</div>
            </div>
          </div>
        </div>

        {/* User Stats Management */}
        <div className="character-user-stats">
          <h2 className="section-title">Your {character.name} Stats</h2>
          <CharacterStatsForm
            selectedCharacter={character}
            currentUser={currentUser}
            compactMode={true}
            showCharacterSelector={false}
          />
        </div>
      </div>

      {/* Character Skills */}
      <div className="character-skills">
        <h2 className="section-title">Skills</h2>
        <div className="skills-container">
          {character.skills.map((skill, index) => (
            <div key={index} className={`skill-card skill-${skill.type}`}>
              <div className="skill-header">
                <h3 className="skill-name">{skill.name}</h3>
                <span className={`skill-type-badge ${skill.type}`}>
                  {skill.type}
                </span>
              </div>
              <p className="skill-description">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CharacterDetail;
