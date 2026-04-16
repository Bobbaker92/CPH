import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Inbox, Calendar, Users, UserCheck, Gift, Target, LogOut, Sun,
  Search, Bell, ChevronDown, Menu, X, Settings
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', short: 'Accueil', end: true },
  { to: '/admin/demandes', icon: Inbox, label: 'Demandes', short: 'Demandes', badge: 3 },
  { to: '/admin/planning', icon: Calendar, label: 'Planning', short: 'Planning' },
  { to: '/admin/clients', icon: Users, label: 'Clients', short: 'Clients' },
  { to: '/admin/couvreurs', icon: UserCheck, label: 'Couvreurs', short: 'Couvreurs' },
  { to: '/admin/parrainages', icon: Gift, label: 'Parrainages', short: 'Parrain.' },
  { to: '/admin/prospection', icon: Target, label: 'Prospection', short: 'Prosp.' },
]

const MOBILE_NAV = NAV_ITEMS.slice(0, 5) // 5 items max en bottom nav

const NOTIFS = [
  { id: 1, type: 'demande', title: 'Nouvelle demande', text: 'Pierre Vidal — Marseille 13008', time: 'il y a 12 min' },
  { id: 2, type: 'devis', title: 'Devis sign\u00E9', text: 'Marc Lefebvre — 4\u00A0200\u00A0\u20AC', time: 'il y a 2 h' },
  { id: 3, type: 'planning', title: 'Intervention termin\u00E9e', text: 'Sophie Blanc — rapport \u00E0 envoyer', time: 'hier' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const searchRef = useRef(null)

  // Cmd+K pour focus recherche
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('.admin-dropdown-wrap')) {
        setNotifOpen(false)
        setUserOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const totalBadges = NAV_ITEMS.reduce((s, it) => s + (it.badge || 0), 0)

  return (
    <div className="admin-shell">
      {/* Sidebar desktop */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo"><Sun size={18} /></div>
          <div>
            <h2>CPH Solar</h2>
            <span>Administration</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge ? <span className="admin-sidebar-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-link" onClick={() => navigate('/')}>
            <LogOut size={18} /><span>D&eacute;connexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <>
          <div className="admin-drawer-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <aside className="admin-drawer">
            <div className="admin-drawer-head">
              <div className="admin-sidebar-brand" style={{padding:0, border:'none', margin:0}}>
                <div className="admin-sidebar-logo"><Sun size={18} /></div>
                <div>
                  <h2>CPH Solar</h2>
                  <span>Administration</span>
                </div>
              </div>
              <button className="admin-drawer-close" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="admin-sidebar-nav">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({isActive}) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {item.badge ? <span className="admin-sidebar-badge">{item.badge}</span> : null}
                </NavLink>
              ))}
            </nav>
            <div className="admin-sidebar-footer">
              <button className="admin-sidebar-link" onClick={() => { setMobileMenuOpen(false); navigate('/') }}>
                <LogOut size={18} /><span>D&eacute;connexion</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-topbar-burger"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
            <div className="admin-search">
              <Search size={16} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher client, ville, t&eacute;l&eacute;phone&hellip;"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd className="admin-search-kbd">&#8984;K</kbd>
            </div>
          </div>

          <div className="admin-topbar-right">
            {/* Notifications */}
            <div className="admin-dropdown-wrap">
              <button
                className="admin-iconbtn"
                onClick={() => { setNotifOpen(o => !o); setUserOpen(false) }}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {totalBadges > 0 && <span className="admin-iconbtn-dot">{totalBadges}</span>}
              </button>
              {notifOpen && (
                <div className="admin-dropdown admin-dropdown-notifs">
                  <div className="admin-dropdown-head">
                    <strong>Notifications</strong>
                    <button className="admin-linkbtn">Tout marquer lu</button>
                  </div>
                  <div className="admin-dropdown-list">
                    {NOTIFS.map(n => (
                      <button
                        key={n.id}
                        className="admin-notif-item"
                        onClick={() => {
                          setNotifOpen(false)
                          if (n.type === 'demande') navigate('/admin/demandes')
                        }}
                      >
                        <span className={`admin-notif-dot admin-notif-dot-${n.type}`} />
                        <div>
                          <p className="admin-notif-title">{n.title}</p>
                          <p className="admin-notif-text">{n.text}</p>
                          <p className="admin-notif-time">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="admin-dropdown-foot">
                    <button className="admin-linkbtn" onClick={() => { setNotifOpen(false); navigate('/admin/demandes') }}>
                      Voir toutes les demandes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar / user menu */}
            <div className="admin-dropdown-wrap">
              <button
                className="admin-user"
                onClick={() => { setUserOpen(o => !o); setNotifOpen(false) }}
              >
                <span className="admin-avatar">FA</span>
                <span className="admin-user-info">
                  <span className="admin-user-name">Fares</span>
                  <span className="admin-user-role">Administrateur</span>
                </span>
                <ChevronDown size={14} />
              </button>
              {userOpen && (
                <div className="admin-dropdown admin-dropdown-user">
                  <div className="admin-dropdown-head admin-dropdown-head-user">
                    <span className="admin-avatar admin-avatar-lg">FA</span>
                    <div>
                      <strong>Fares</strong>
                      <span>contact@cph13.fr</span>
                    </div>
                  </div>
                  <button className="admin-dropdown-item"><Settings size={14} /> Param&egrave;tres</button>
                  <button className="admin-dropdown-item" onClick={() => navigate('/')}>
                    <LogOut size={14} /> D&eacute;connexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="admin-bottomnav">
        {MOBILE_NAV.map(item => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`admin-bottomnav-item ${isActive ? 'active' : ''}`}
            >
              <div className="admin-bottomnav-icon">
                <item.icon size={20} />
                {item.badge ? <span className="admin-bottomnav-badge">{item.badge}</span> : null}
              </div>
              <span>{item.short}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
