import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import CharacterButtons from './components/characterButtons'
import CharacterDetail from './components/characterDetail'

function HomePage() {
  const handleCharacterSelection = (character) => {
    console.log('Character selected from component:', character.name)
  }

  return (
    <div>
      <h1>Welcome to the Wuthering Waves Stat Tracker</h1>
      <CharacterButtons onCharacterClick={handleCharacterSelection} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/character/:characterId" element={<CharacterDetail />} />
      </Routes>
    </Router>
  )
}

export default App
