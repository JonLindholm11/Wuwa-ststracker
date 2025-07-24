import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import charactersData from '../data/wuwave_characters.json'
import CharacterStatsForm from './CharacterStatsForm'
import './CharacterDetail.css'

function CharacterDetail({ currentUser }) {
  const { characterId } = useParams()
  const [character, setCharacter] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [statsKey, setStatsKey] = useState(0)
  const [isLoadingUserStats, setIsLoadingUserStats] = useState(false)

  useEffect(() => {
    // Find the character based on the ID from the URL
    const foundCharacter = charactersData.charactersData.find(
      char => char.id === characterId
    )
    setCharacter(foundCharacter)
  }, [characterId])

  // Load user stats when character or user changes
  const loadUserStats = useCallback(async () => {
    if (!currentUser?.userId || !characterId) {
      setUserStats(null)
      return
    }

    setIsLoadingUserStats(true)
    try {
      console.log(`CharacterDetail: Loading user stats for ${currentUser.userId}/${characterId}`)
      
      const response = await fetch(`http://localhost:3001/api/user-stats/${currentUser.userId}/${characterId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('CharacterDetail: User stats loaded:', data.stats)
          setUserStats(data.stats)
        } else {
          setUserStats(null)
        }
      } else if (response.status === 404) {
        console.log('CharacterDetail: No user stats found (404)')
        setUserStats(null)
      } else {
        console.error(`CharacterDetail: Error loading stats: ${response.status}`)
        setUserStats(null)
      }
    } catch (error) {
      console.error('CharacterDetail: Network error loading user stats:', error)
      setUserStats(null)
    } finally {
      setIsLoadingUserStats(false)
    }
  }, [currentUser?.userId, characterId])

  useEffect(() => {
    loadUserStats()
  }, [loadUserStats])

  // Handle stats updates from the form
  const handleStatsUpdate = useCallback(async (updatedCharacterId, updatedStats) => {
    console.log('CharacterDetail: Stats updated notification received:', updatedCharacterId, updatedStats)
    
    // Reload user stats to ensure we have the latest data
    await loadUserStats()
    
    // Force re-render by updating key
    setStatsKey(prev => prev + 1)
  }, [loadUserStats])

  // Function to get character image
  const getCharacterImage = () => {
    if (character?.image) {
      return character.image
    }
    // Fallback to placeholder if no image found
    return `https://via.placeholder.com/120x120/667eea/ffffff?text=${character?.name?.charAt(0) || '?'}`
  }

  if (!character) {
    return (
      <div className="character-detail-container">
        <div className="character-not-found">
          <h2>Character not found</h2>
          <p>The character with ID "{characterId}" could not be found.</p>
        </div>
      </div>
    )
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
            console.log('Image failed to load:', e.target.src)
            e.target.src = `https://via.placeholder.com/120x120/667eea/ffffff?text=${character.name.charAt(0)}`
          }}
        />
        <div className="character-info">
          <h1 className="character-title">{character.name}</h1>
          <div className="character-weapon-type">{character.weapon}</div>
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

        {/* User Stats Display - ONLY saved stats from API */}
        <div className="character-user-stats">
          <h2 className="section-title">Your {character.name} Stats</h2>
          
          {/* Display Current Saved Stats */}
          {isLoadingUserStats ? (
            <div className="user-stats-loading">Loading your stats...</div>
          ) : userStats ? (
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Your HP</div>
                <div className="stat-value">{userStats.hp || 'Not set'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Your Attack</div>
                <div className="stat-value">{userStats.attack || 'Not set'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Your Defense</div>
                <div className="stat-value">{userStats.defense || 'Not set'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Your DMG Bonus</div>
                <div className="stat-value">{userStats.dmgBonus ? `${userStats.dmgBonus}%` : 'Not set'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Your Crit Rate</div>
                <div className="stat-value">{userStats.critRate ? `${userStats.critRate}%` : 'Not set'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Your Crit DMG</div>
                <div className="stat-value">{userStats.critDamage ? `${userStats.critDamage}%` : 'Not set'}</div>
              </div>
            </div>
          ) : (
            <div className="no-user-stats">
              <p>No stats saved yet. Use the management form below to save your {character.name} stats!</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Management Form - Separate section */}
      <div className="stats-management-container">
        <h2 className="section-title">Manage Your {character.name} Stats</h2>
        <CharacterStatsForm 
          key={statsKey}
          selectedCharacter={character}
          currentUser={currentUser}
          compactMode={true}
          showCharacterSelector={false}
          onStatsUpdate={handleStatsUpdate}
        />
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
  )
}

export default CharacterDetail