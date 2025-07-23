import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import CharacterButtons from './components/characterButtons'
import CharacterDetail from './components/characterDetail'
import CharacterStatsForm from './components/CharacterStatsForm'
import UserAuth from './components/UserAuth'

// User Context to share user data across components
function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  const handleUserChange = (user) => {
    setCurrentUser(user)
    console.log('User changed:', user)
  }

  return (
    <div>
      {/* User Auth appears on every page */}
      <UserAuth onUserChange={handleUserChange} currentUser={currentUser} />
      {/* Pass currentUser to all child components */}
      {children({ currentUser })}
    </div>
  )
}

function HomePage({ currentUser }) {
  const handleCharacterSelection = (character) => {
    console.log('Character selected from component:', character.name)
  }

  return (
    <div>
      <h1>Welcome to the Wuthering Waves Stat Tracker</h1>
      <CharacterButtons onCharacterClick={handleCharacterSelection} />
      
      {/* Add a stats management section on homepage */}
      <div style={{ marginTop: '40px' }}>
        <h2>Quick Stats Management</h2>
        <CharacterStatsForm 
          currentUser={currentUser}
          compactMode={false}
          showCharacterSelector={true}
        />
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <UserProvider>
        {({ currentUser }) => (
          <Routes>
            <Route 
              path="/" 
              element={<HomePage currentUser={currentUser} />} 
            />
            <Route 
              path="/character/:characterId" 
              element={<CharacterDetail currentUser={currentUser} />} 
            />
          </Routes>
        )}
      </UserProvider>
    </Router>
  )
}

export default App
