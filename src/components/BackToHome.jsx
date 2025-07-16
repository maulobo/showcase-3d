import { Link } from 'react-router-dom'

function BackToHome() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      left: '20px', 
      zIndex: 1000 
    }}>
      <Link 
        to="/" 
        style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: 'rgba(100, 108, 255, 0.9)', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '4px',
          fontSize: '0.9rem',
          backdropFilter: 'blur(10px)'
        }}
      >
        ← Volver al inicio
      </Link>
    </div>
  )
}

export default BackToHome
