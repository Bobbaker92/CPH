import { useState, useEffect, useRef } from 'react'
import { MoreVertical } from 'lucide-react'

/**
 * Menu d'actions réutilisable (⋯) ouvert au clic.
 * items: [{ icon, label, onClick, danger? }]
 */
export default function ActionMenu({ items, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="action-menu" ref={ref}>
      <button
        className="icon-btn"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        aria-label="Actions"
        aria-expanded={open}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className={`action-menu-dropdown action-menu-${align}`} onClick={(e) => e.stopPropagation()}>
          {items.map((item, i) => (
            item.divider ? (
              <div key={i} className="action-menu-divider" />
            ) : (
              <button
                key={i}
                className={`action-menu-item ${item.danger ? 'action-menu-item-danger' : ''}`}
                onClick={() => { setOpen(false); item.onClick?.() }}
              >
                {item.icon && <span className="action-menu-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}
