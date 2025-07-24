import { useState, useEffect, useRef } from 'react';
import './userAuth.css';

const UserAuth = ({ onUserChange }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    username: ''
  });
  const [recentUsers, setRecentUsers] = useState([]);
  
  // Use ref to track if we've already loaded the initial user
  const hasLoadedInitialUser = useRef(false);

  useEffect(() => {
    // Only run this once when component mounts
    if (hasLoadedInitialUser.current) return;
    
    // Load recent users from localStorage
    const saved = localStorage.getItem('wuwa-recent-users');
    if (saved) {
      try {
        setRecentUsers(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent users:', e);
      }
    }

    // Check if there's a current user
    const savedCurrentUser = localStorage.getItem('wuwa-current-user');
    if (savedCurrentUser) {
      try {
        const user = JSON.parse(savedCurrentUser);
        setFormData(user);
        setIsSignedIn(true);
        onUserChange(user);
      } catch (e) {
        console.error('Error loading current user:', e);
      }
    }
    
    hasLoadedInitialUser.current = true;
  }, []); // FIXED: Remove onUserChange from dependencies

  const saveRecentUser = (user) => {
    const updated = [user, ...recentUsers.filter(u => u.userId !== user.userId)].slice(0, 5);
    setRecentUsers(updated);
    localStorage.setItem('wuwa-recent-users', JSON.stringify(updated));
  };

  const handleSignIn = () => {
    if (!formData.userId.trim() || !formData.username.trim()) {
      alert('Please enter both User ID and Username');
      return;
    }

    const user = {
      userId: formData.userId.trim(),
      username: formData.username.trim(),
      signInTime: new Date().toISOString()
    };

    setIsSignedIn(true);
    setShowSignIn(false);
    localStorage.setItem('wuwa-current-user', JSON.stringify(user));
    saveRecentUser(user);
    onUserChange(user);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setFormData({ userId: '', username: '' });
    localStorage.removeItem('wuwa-current-user');
    onUserChange(null);
  };

  const handleQuickSignIn = (user) => {
    const updatedUser = {
      ...user,
      signInTime: new Date().toISOString()
    };
    
    setFormData(updatedUser);
    setIsSignedIn(true);
    setShowSignIn(false);
    localStorage.setItem('wuwa-current-user', JSON.stringify(updatedUser));
    saveRecentUser(updatedUser);
    onUserChange(updatedUser);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isSignedIn) {
    return (
      <div className="user-auth-container signed-in">
        <div className="user-info">
          <div className="user-avatar">
            {formData.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="username">{formData.username}</div>
            <div className="user-id">ID: {formData.userId}</div>
          </div>
        </div>
        <button onClick={handleSignOut} className="btn btn-outline">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="user-auth-container">
      {!showSignIn ? (
        <div className="sign-in-prompt">
          <button 
            onClick={() => setShowSignIn(true)} 
            className="btn btn-primary"
          >
            Sign In to Track Stats
          </button>
          
          {recentUsers.length > 0 && (
            <div className="recent-users">
              <div className="recent-users-title">Recent Users:</div>
              <div className="recent-users-list">
                {recentUsers.map((user, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSignIn(user)}
                    className="recent-user-btn"
                  >
                    <div className="recent-user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="recent-user-info">
                      <div className="recent-username">{user.username}</div>
                      <div className="recent-user-id">{user.userId}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="sign-in-form">
          <div className="form-title">Sign In to Your Account</div>
          
          <div className="form-group">
            <label htmlFor="userId">User ID:</label>
            <input
              id="userId"
              name="userId"
              type="text"
              value={formData.userId}
              onChange={handleInputChange}
              placeholder="Enter your user ID"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className="form-input"
            />
          </div>
          
          <div className="form-actions">
            <button onClick={handleSignIn} className="btn btn-primary">
              Sign In
            </button>
            <button 
              onClick={() => setShowSignIn(false)} 
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAuth;
