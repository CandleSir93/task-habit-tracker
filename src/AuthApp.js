// AuthApp.js - Modified App component with authentication & SQLite persistence
// This wraps the main App functionality with authentication and syncing

// Import API helpers
// Note: In a production app, you would use ES6 imports, but we're using script tags here
const API = {}; // Will be populated when api.js loads

class AuthApp extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      authView: 'login', // 'login' or 'register'
      syncStatus: 'offline', // 'online', 'offline', 'syncing'
      lastSyncTime: null,
      error: null
    };
    
    // Reference to the main App component
    this.appRef = React.createRef();
  }
  
  componentDidMount() {
    // Check if user is already logged in
    this.checkAuthStatus();
    
    // Set up sync interval
    this.syncInterval = setInterval(this.syncData, 60000); // Sync every minute
    
    // Set up online/offline detection
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Initial online status
    if (navigator.onLine) {
      this.setState({ syncStatus: 'online' });
    }
  }
  
  componentWillUnmount() {
    clearInterval(this.syncInterval);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
  
  // Check if we have an active session
  checkAuthStatus = async () => {
    try {
      // In a real implementation, we would check for an active session
      // For now, check localStorage for a stored user session
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.setState({
          isAuthenticated: true,
          user: JSON.parse(storedUser),
          isLoading: false
        });
        
        // If online, sync data immediately
        if (navigator.onLine) {
          this.syncData();
        }
      } else {
        this.setState({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      this.setState({ isLoading: false });
    }
  }
  
  handleLogin = async (username, password) => {
    try {
      this.setState({ isLoading: true });
      
      // Call API to login
      const response = await API.login(username, password);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));
      
      this.setState({
        isAuthenticated: true,
        user: response.user,
        isLoading: false
      });
      
      // Initial sync
      this.syncData();
      
      return response;
    } catch (error) {
      this.setState({ isLoading: false });
      throw error;
    }
  }
  
  handleRegister = async (username, email, password) => {
    try {
      this.setState({ isLoading: true });
      
      // Call API to register
      await API.register(username, email, password);
      
      // Automatically login after successful registration
      await this.handleLogin(username, password);
      
      return true;
    } catch (error) {
      this.setState({ isLoading: false });
      throw error;
    }
  }
  
  handleLogout = async () => {
    try {
      // Call API to logout
      await API.logout();
      
      // Clear local storage
      localStorage.removeItem('user');
      
      this.setState({
        isAuthenticated: false,
        user: null
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  switchAuthView = (view) => {
    this.setState({ authView: view, error: null });
  }
  
  handleOnline = () => {
    this.setState({ syncStatus: 'online' });
    // Attempt to sync immediately when coming online
    this.syncData();
  }
  
  handleOffline = () => {
    this.setState({ syncStatus: 'offline' });
  }
  
  syncData = async () => {
    // Only sync if authenticated and online
    if (!this.state.isAuthenticated || !navigator.onLine) {
      return;
    }
    
    try {
      this.setState({ syncStatus: 'syncing' });
      
      // Get app data from the main app component
      const appData = this.appRef.current?.getDataForSync();
      
      if (appData) {
        // Send data to server
        const response = await API.syncData(appData);
        
        // Update app with merged data from server
        this.appRef.current?.updateDataFromSync(response.data);
        
        this.setState({
          syncStatus: 'online',
          lastSyncTime: new Date(),
          error: null
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.setState({
        syncStatus: 'online', // Reset to online, but with an error
        error: `Sync failed: ${error.message}`
      });
    }
  }
  
  renderAuthForm() {
    const { authView } = this.state;
    
    if (authView === 'login') {
      return (
        <Login 
          onLogin={this.handleLogin}
          onSwitchToRegister={() => this.switchAuthView('register')}
        />
      );
    } else {
      return (
        <Register
          onRegister={this.handleRegister}
          onSwitchToLogin={() => this.switchAuthView('login')}
        />
      );
    }
  }
  
  renderSyncStatus() {
    const { syncStatus, lastSyncTime } = this.state;
    
    let statusText = '';
    switch (syncStatus) {
      case 'online':
        statusText = 'Connected';
        break;
      case 'offline':
        statusText = 'Offline - Changes saved locally';
        break;
      case 'syncing':
        statusText = 'Syncing...';
        break;
      default:
        statusText = 'Unknown status';
    }
    
    return (
      <div className="sync-status">
        <span className={`status-indicator ${syncStatus}`}></span>
        <span>{statusText}</span>
        {lastSyncTime && (
          <span className="last-sync-time">
            &nbsp;• Last synced: {lastSyncTime.toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  }
  
  render() {
    const { isAuthenticated, isLoading, error } = this.state;
    
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    return (
      <div className="auth-wrapper">
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {isAuthenticated ? (
          <>
            <App 
              ref={this.appRef}
              user={this.state.user}
              onLogout={this.handleLogout}
              onSync={this.syncData}
            />
            {this.renderSyncStatus()}
          </>
        ) : (
          this.renderAuthForm()
        )}
      </div>
    );
  }
}

// Will be initialized after all scripts are loaded
let appInstance = null;

// Initialize app after DOM and scripts are loaded
function initApp() {
  // Make API methods available 
  Object.assign(API, {
    register,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getHabits,
    createHabit,
    updateHabitCompletion,
    getLogs,
    saveLog,
    syncData
  });
  
  console.log('AuthApp module executing - overriding root element render');

  // Override any previous render to the root element
  // This ensures our AuthApp wrapper is the entry point
  ReactDOM.render(<AuthApp />, document.getElementById('root'));
}

// Allow time for all scripts to load
document.addEventListener('DOMContentLoaded', () => {
  // Short timeout to ensure all scripts are fully processed
  setTimeout(initApp, 100);
});
