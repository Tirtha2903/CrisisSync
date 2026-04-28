import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo-dot" />
        CrisisSync
      </div>

      {user && (
        <div className="navbar-right">
          <div className="navbar-user">
            <span>👤 {user.name}</span>
            <span className={`role-badge ${user.role}`}>{user.role}</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
