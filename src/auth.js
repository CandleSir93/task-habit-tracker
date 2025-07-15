// Authentication components for Task & Habit Tracker

// Login component
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
      loading: false
    };
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    
    // Validation
    if (!username || !password) {
      this.setState({ error: 'Please enter both username and password' });
      return;
    }
    
    try {
      this.setState({ loading: true });
      await this.props.onLogin(username, password);
      // Login success is handled by parent component
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  render() {
    const { username, password, error, loading } = this.state;
    
    return (
      <div className="auth-container">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={this.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={this.handleInputChange}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.handleInputChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          <div className="auth-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <div className="auth-toggle">
          <p>Don't have an account? <a href="#" onClick={this.props.onSwitchToRegister}>Register</a></p>
        </div>
      </div>
    );
  }
}

// Register component
class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      loading: false
    };
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = this.state;
    
    // Validation
    if (!username || !email || !password) {
      this.setState({ error: 'All fields are required' });
      return;
    }
    
    if (password !== confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }
    
    try {
      this.setState({ loading: true });
      await this.props.onRegister(username, email, password);
      // Registration success is handled by parent component
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  render() {
    const { username, email, password, confirmPassword, error, loading } = this.state;
    
    return (
      <div className="auth-container">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={this.handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={this.handleInputChange}
              placeholder="Choose a username"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={this.handleInputChange}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={this.handleInputChange}
              placeholder="Choose a password"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={this.handleInputChange}
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>
          <div className="auth-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="auth-toggle">
          <p>Already have an account? <a href="#" onClick={this.props.onSwitchToLogin}>Login</a></p>
        </div>
      </div>
    );
  }
}
