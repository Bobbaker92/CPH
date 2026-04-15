import { useNavigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, Calendar, Image, FileText, Gift, LogOut, Sun } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/client', icon: Home, label: 'Accueil', end: true },
  { to: '/client/intervention', icon: Calendar, label: 'Intervention' },
  { to: '/client/photos', icon: Image, label: 'Photos' },
  { to: '/client/rapport', icon: FileText, label: 'Rapport' },
  { to: '/client/recommander', icon: Gift, label: 'Recommander' },
]

export default function ClientDashboard() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="dashboard">
      {/* Sidebar desktop */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>CPH</h2>
          <span>Espace client</span>
        </div>
        <ul className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={({isActive}) => isActive ? 'active' : ''}>
                <item.icon size={18} /> {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className="sidebar-nav" style={{borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:8}}>
          <li><button onClick={() => navigate('/')}><LogOut size={18} /> {"D\u00E9connexion"}</button></li>
        </ul>
      </aside>

      {/* Mobile header */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-inner">
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{width:28, height:28, borderRadius:6, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Sun size={14} color="var(--primary)" />
            </div>
            <span style={{fontWeight:700, fontSize:14, color:'white'}}>CPH</span>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:12, fontFamily:'inherit', cursor:'pointer'}}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottomnav">
        {NAV_ITEMS.map(item => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`mobile-bottomnav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
