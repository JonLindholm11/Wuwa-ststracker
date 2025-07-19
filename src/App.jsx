import { useState } from 'react'
import './App.css'
import charactersData from "./data/wuwave_characters.json"  // Import JSON file directly

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState(null)  // Fixed useState usage

  const handleCharacterClick = (character) => {  // Moved outside and fixed parameter
    console.log('Selected character:', character)
    setSelectedCharacter(character)
  }

  return (
    <>
      <div>
        <h1>Welcome to the Wuthering Waves Stat Tracker</h1>

        <div>
          {charactersData.map((character) => (  // Use charactersData instead of characters
            <button 
              key={character.id}  // Fixed: use character.id not characters.id
              onClick={() => handleCharacterClick(character)}  // Fixed: pass character not characters
              style={{ margin: '5px', padding: '10px' }}  // Added some basic styling
            >
              {character.name}
            </button>
          ))}
        </div>

        {/* Display selected character info */}
        {selectedCharacter && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Selected Character:</h3>
            <p>Name: {selectedCharacter.name}</p>
            <p>ID: {selectedCharacter.id}</p>
          </div>
        )}
      </div>
    </>
  )
}

export default App