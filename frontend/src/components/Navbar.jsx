import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link to="/expenses" style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#667eea',
            textDecoration: 'none'
          }}>
            💰 ExpenseManager
          </Link>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/expenses" style={{
              color: '#4a5568',
              textDecoration: 'none',
              fontWeight: '500',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f7fafc';
              e.target.style.color = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#4a5568';
            }}>
              Expenses
            </Link>
            
            {(user.role === 'manager' || user.role === 'admin') && (
              <Link to="/approvals" style={{
                color: '#4a5568',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f7fafc';
                e.target.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#4a5568';
              }}>
                Approvals
              </Link>
            )}
            
            {user.role === 'admin' && (
              <>
                <Link to="/users" style={{
                  color: '#4a5568',
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f7fafc';
                  e.target.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#4a5568';
                }}>
                  Users
                </Link>
                <Link to="/rules" style={{
                  color: '#4a5568',
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f7fafc';
                  e.target.style.color = '#667eea';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#4a5568';
                }}>
                  Rules
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '12px', color: '#718096' }}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-danger"
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}