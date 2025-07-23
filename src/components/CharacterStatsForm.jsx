import { useState, useEffect } from 'react';
import './CharacterStatsForm.css';

const CharacterStatsForm = ({ 
  selectedCharacter = null, 
  currentUser = null, 
  compactMode = false,
  showCharacterSelector = true 
}) => {
  const [characterId, setCharacterId] = useState(selectedCharacter?.id || '');
  const [stats, setStats] = useState({
    hp: '',
    attack: '',
    defense: '',
    dmgBonus: '',
    critRate: '',
    critDamage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [existingStats, setExistingStats] = useState(null);
  const [charactersData, setCharactersData] = useState({ charactersData: [] });

  // Load characters data
  useEffect(() => {
    const loadCharactersData = async () => {
      try {
        // In a real app, you might fetch this from an API
        const response = await import('../data/wuwave_characters.json');
        setCharactersData(response.default);
      } catch (error) {
        console.error('Error loading characters data:', error);
      }
    };
    loadCharactersData();
  }, []);

  // Update character when prop changes
  useEffect(() => {
    if (selectedCharacter?.id) {
      setCharacterId(selectedCharacter.id);
    }
  }, [selectedCharacter]);

  // Load existing stats when character or user changes
  useEffect(() => {
    if (characterId && currentUser?.userId) {
      loadExistingStats();
    } else {
      resetForm();
    }
  }, [characterId, currentUser?.userId]);

  const resetForm = () => {
    setStats({
      hp: '',
      attack: '',
      defense: '',
      dmgBonus: '',
      critRate: '',
      critDamage: ''
    });
    setExistingStats(null);
    setMessage('');
  };

  const loadExistingStats = async () => {
    if (!currentUser?.userId || !characterId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/user-stats/${currentUser.userId}/${characterId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setExistingStats(data.stats);
          setMessage('Loaded existing stats for this character');
        }
      } else {
        resetForm();
        setMessage('No existing stats found - ready for new input');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setMessage('Error loading existing stats');
    }
  };

  const handleCharacterChange = (e) => {
    setCharacterId(e.target.value);
    setMessage('');
  };

  const handleStatChange = (statName, value) => {
    setStats(prev => ({
      ...prev,
      [statName]: value
    }));
  };

  const handleSubmit = async () => {
    if (!characterId) {
      setMessage('Please select a character');
      return;
    }

    if (!currentUser) {
      setMessage('Please sign in to save stats');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const selectedCharacterData = charactersData.charactersData.find(
        char => char.id === characterId
      );

      if (!selectedCharacterData) {
        setMessage('Character data not found');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        userId: currentUser.userId,
        username: currentUser.username,
        characterId: characterId,
        characterName: selectedCharacterData.name,
        stats,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/api/user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Stats saved successfully!');
        setExistingStats(stats);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving stats:', error);
      setMessage('Error saving stats. Please check if the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!characterId || !existingStats || !currentUser) {
      setMessage('No stats to delete');
      return;
    }

    if (!window.confirm('Are you sure you want to delete these stats?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/user-stats/${currentUser.userId}/${characterId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Stats deleted successfully!');
        resetForm();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting stats:', error);
      setMessage('Error deleting stats');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCharacterData = characterId 
    ? charactersData.charactersData.find(char => char.id === characterId)
    : null;

  const getMessageClass = () => {
    if (message.includes('Error')) return 'status-message status-error';
    if (message.includes('successfully')) return 'status-message status-success';
    return 'status-message status-info';
  };

  if (!currentUser) {
    return (
      <div className={`stats-form-container ${compactMode ? 'compact-mode' : ''}`}>
        <div className="status-message status-info">
          Please sign in to manage character stats
        </div>
      </div>
    );
  }

  return (
    <div className={`stats-form-container ${compactMode ? 'compact-mode' : ''}`}>
      {!compactMode && <h2 className="stats-form-title">Character Stats Manager</h2>}
      
      {/* Character Selection */}
      {showCharacterSelector && (
        <div className="character-selection">
          <label htmlFor="character">Select Character:</label>
          <select
            id="character"
            value={characterId}
            onChange={handleCharacterChange}
            className="character-select"
          >
            <option value="">-- Select a Character --</option>
            {charactersData.charactersData.map(character => (
              <option key={character.id} value={character.id}>
                {character.name} ({character.weapon})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Character Details Display */}
      {selectedCharacterData && (
        <div className="character-details">
          <h3 className="character-details-title">Character Details</h3>
          <div className="character-details-grid">
            <div className="character-detail-item"><strong>Name:</strong> {selectedCharacterData.name}</div>
            <div className="character-detail-item"><strong>Weapon:</strong> {selectedCharacterData.weapon}</div>
            <div className="character-detail-item"><strong>Base HP:</strong> {selectedCharacterData.hp}</div>
            <div className="character-detail-item"><strong>Base Attack:</strong> {selectedCharacterData.attack}</div>
            <div className="character-detail-item"><strong>Base Defense:</strong> {selectedCharacterData.defense}</div>
            <div className="character-detail-item"><strong>Crit Rate:</strong> {selectedCharacterData.critRate}%</div>
            <div className="character-detail-item"><strong>Crit DMG:</strong> {selectedCharacterData.critDmg}%</div>
          </div>
        </div>
      )}

      {/* Stats Input Section */}
      {characterId && (
        <div className="stats-input-section">
          <h3 className="stats-input-title">
            Character Stats {existingStats ? 
              <span className="stats-existing-indicator">(Editing Existing)</span> : 
              <span className="stats-new-indicator">(New Entry)</span>
            }
          </h3>
          
          <div className="stats-grid">
            <div className="stat-input-group">
              <label htmlFor="hp">HP:</label>
              <input
                id="hp"
                type="number"
                value={stats.hp}
                onChange={(e) => handleStatChange('hp', e.target.value)}
                placeholder="Enter HP value"
                className="stat-input"
              />
            </div>

            <div className="stat-input-group">
              <label htmlFor="attack">Attack:</label>
              <input
                id="attack"
                type="number"
                value={stats.attack}
                onChange={(e) => handleStatChange('attack', e.target.value)}
                placeholder="Enter Attack value"
                className="stat-input"
              />
            </div>

            <div className="stat-input-group">
              <label htmlFor="defense">Defense:</label>
              <input
                id="defense"
                type="number"
                value={stats.defense}
                onChange={(e) => handleStatChange('defense', e.target.value)}
                placeholder="Enter Defense value"
                className="stat-input"
              />
            </div>

            <div className="stat-input-group">
              <label htmlFor="dmgBonus">Damage Bonus (%):</label>
              <input
                id="dmgBonus"
                type="number"
                step="0.1"
                value={stats.dmgBonus}
                onChange={(e) => handleStatChange('dmgBonus', e.target.value)}
                placeholder="Enter Damage Bonus %"
                className="stat-input"
              />
            </div>

            <div className="stat-input-group">
              <label htmlFor="critRate">Crit Rate (%):</label>
              <input
                id="critRate"
                type="number"
                step="0.1"
                value={stats.critRate}
                onChange={(e) => handleStatChange('critRate', e.target.value)}
                placeholder="Enter Crit Rate %"
                className="stat-input"
              />
            </div>

            <div className="stat-input-group">
              <label htmlFor="critDamage">Crit Damage (%):</label>
              <input
                id="critDamage"
                type="number"
                step="0.1"
                value={stats.critDamage}
                onChange={(e) => handleStatChange('critDamage', e.target.value)}
                placeholder="Enter Crit Damage %"
                className="stat-input"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Saving...' : (existingStats ? 'Update Stats' : 'Save Stats')}
            </button>

            {existingStats && (
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="btn btn-danger"
              >
                Delete Stats
              </button>
            )}

            <button
              onClick={loadExistingStats}
              disabled={isSubmitting}
              className="btn btn-success"
            >
              Reload Stats
            </button>
          </div>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className={getMessageClass()}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CharacterStatsForm;