import { useState, useEffect, useCallback, useMemo } from 'react';
import './characterStatsForm.css';

const CharacterStatsForm = ({ 
  selectedCharacter = null, 
  currentUser = null, 
  compactMode = false,
  showCharacterSelector = true,
  onStatsUpdate = null
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
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [charactersData, setCharactersData] = useState({ charactersData: [] });

  // Load characters data
  useEffect(() => {
    const loadCharactersData = async () => {
      try {
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

  // Memoize selected character data
  const selectedCharacterData = useMemo(() => {
    if (!characterId || !charactersData?.charactersData) return null;
    return charactersData.charactersData.find(char => char.id === characterId);
  }, [characterId, charactersData]);

  // Optimized resetForm function
  const resetForm = useCallback(() => {
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
  }, []);

  // Load existing stats from server
  const loadExistingStats = useCallback(async () => {
    if (!currentUser?.userId || !characterId) return;

    setIsLoadingStats(true);
    try {
      console.log(`Loading stats for user: ${currentUser.userId}, character: ${characterId}`);
      
      const response = await fetch(`http://localhost:3001/api/user-stats/${currentUser.userId}/${characterId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Stats loaded successfully:', data.stats);
          setStats(data.stats);
          setExistingStats(data.stats);
          setMessage('Loaded existing stats for this character');
        }
      } else if (response.status === 404) {
        console.log('No existing stats found (404) - this is normal for new characters');
        resetForm();
        setMessage('No existing stats found - ready for new input');
      } else {
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        resetForm();
        setMessage(`Error loading stats: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Network error loading stats:', error);
      resetForm();
      setMessage('Cannot connect to backend. Please check if the server is running on port 3001.');
    } finally {
      setIsLoadingStats(false);
    }
  }, [currentUser?.userId, characterId, resetForm]);

  // Load existing stats when character or user changes
  useEffect(() => {
    if (characterId && currentUser?.userId) {
      loadExistingStats();
    } else {
      resetForm();
    }
  }, [characterId, currentUser?.userId, loadExistingStats, resetForm]);

  const handleCharacterChange = useCallback((e) => {
    setCharacterId(e.target.value);
    setMessage('');
  }, []);

  const handleStatChange = useCallback((statName, value) => {
    setStats(prev => ({
      ...prev,
      [statName]: value
    }));
  }, []);

  // FIXED: Added automatic reload after successful save
  const handleSubmit = useCallback(async () => {
    if (!characterId) {
      setMessage('Please select a character');
      return;
    }

    if (!currentUser) {
      setMessage('Please sign in to save stats');
      return;
    }

    if (!selectedCharacterData) {
      setMessage('Character data not found');
      return;
    }

    setIsSubmitting(true);
    setMessage('Saving...');

    try {
      const payload = {
        userId: currentUser.userId,
        username: currentUser.username,
        characterId: characterId,
        characterName: selectedCharacterData.name,
        stats,
        timestamp: new Date().toISOString()
      };

      console.log('Submitting payload:', payload);

      const response = await fetch('http://localhost:3001/api/user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        setMessage('Stats saved successfully!');
        
        // FIXED: Automatically reload stats from server after successful save
        console.log('Reloading stats from server to verify save...');
        setTimeout(async () => {
          await loadExistingStats();
          
          // Notify parent component of the update
          if (onStatsUpdate) {
            onStatsUpdate(characterId, stats);
          }
        }, 500); // Small delay to ensure database is updated
        
      } else {
        setMessage(`Error saving: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving stats:', error);
      setMessage('Error saving stats. Please check if the backend is running on port 3001.');
    } finally {
      setIsSubmitting(false);
    }
  }, [characterId, currentUser, selectedCharacterData, stats, loadExistingStats, onStatsUpdate]);

  const handleDelete = useCallback(async () => {
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
        
        // Notify parent component of the deletion
        if (onStatsUpdate) {
          onStatsUpdate(characterId, null);
        }
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting stats:', error);
      setMessage('Error deleting stats. Please check if the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  }, [characterId, existingStats, currentUser, resetForm, onStatsUpdate]);

  const getMessageClass = useCallback(() => {
    if (message.includes('Error') || message.includes('Cannot connect')) return 'status-message status-error';
    if (message.includes('successfully')) return 'status-message status-success';
    return 'status-message status-info';
  }, [message]);

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
            disabled={isLoadingStats}
          >
            <option value="">-- Select a Character --</option>
            {charactersData?.charactersData?.map(character => (
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
            {isLoadingStats && <span className="loading-indicator"> Loading...</span>}
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
                disabled={isLoadingStats}
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
                disabled={isLoadingStats}
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
                disabled={isLoadingStats}
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
                disabled={isLoadingStats}
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
                disabled={isLoadingStats}
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
                disabled={isLoadingStats}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingStats}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Saving...' : (existingStats ? 'Update Stats' : 'Save Stats')}
            </button>

            {existingStats && (
              <button
                onClick={handleDelete}
                disabled={isSubmitting || isLoadingStats}
                className="btn btn-danger"
              >
                Delete Stats
              </button>
            )}

            <button
              onClick={loadExistingStats}
              disabled={isSubmitting || isLoadingStats}
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