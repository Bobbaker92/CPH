import { useState, useEffect } from 'react'
import { X, Phone, Clock, Check, Loader2, Shield } from 'lucide-react'

/**
 * Modal de demande de rappel — capture lead minimale (nom + tel)
 * onClose: fonction fermeture
 * context: 'landing' | 'devis' | 'reservation' | 'paiement' — indique d'où vient le lead
 */
export default function CallbackModal({ onClose }) {
  const [form, setForm] = useState({ nom: '', tel: '', dispo: 'rapide', note: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const canSubmit = form.nom.trim().length > 1 && form.tel.replace(/\D/g, '').length >= 9

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e) => {
    e.preventDefault()
    if (!canSubmit || loading) return
    setLoading(true)
    // Simu capture lead côté backend
    setTimeout(() => {
      setLoading(false)
      setDone(true)
      // (vrai backend ici : POST /api/leads avec { ...form, context, timestamp })
    }, 900)
  }

  return (
    <>
      <div className="admin-drawer-backdrop" onClick={onClose} />
      <div className="callback-modal" role="dialog" aria-modal="true">
        {done ? (
          <div className="callback-modal-inner">
            <div className="callback-success">
              <div className="callback-success-icon"><Check size={28} /></div>
              <h2>Merci {form.nom.split(' ')[0]} !</h2>
              <p>Nous vous rappelons {form.dispo === 'rapide' ? 'dans les plus brefs d\u00E9lais' : form.dispo === 'matin' ? 'demain matin' : 'demain apr\u00E8s-midi'} au <strong>{form.tel}</strong>.</p>
              <button className="btn btn-primary" onClick={onClose} style={{width:'100%', justifyContent:'center'}}>
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form className="callback-modal-inner" onSubmit={submit}>
            <div className="callback-head">
              <div className="callback-head-icon"><Phone size={20} /></div>
              <div>
                <h2>Demande de rappel gratuit</h2>
                <p>Nous vous rappelons sous 24h, sans engagement.</p>
              </div>
              <button type="button" className="admin-drawer-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="callback-body">
              <div className="input-group">
                <label>Votre nom *</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Pr&eacute;nom Nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Votre t&eacute;l&eacute;phone *</label>
                <input
                  type="tel"
                  placeholder="06 00 00 00 00"
                  value={form.tel}
                  onChange={(e) => setForm({ ...form, tel: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Quand vous rappeler ?</label>
                <div className="callback-pills">
                  {[
                    { v: 'rapide', l: 'D&egrave;s que possible' },
                    { v: 'matin', l: 'Matin' },
                    { v: 'apresmidi', l: 'Apr&egrave;s-midi' },
                  ].map(o => (
                    <button
                      key={o.v}
                      type="button"
                      className={`callback-pill ${form.dispo === o.v ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, dispo: o.v })}
                      dangerouslySetInnerHTML={{ __html: o.l }}
                    />
                  ))}
                </div>
              </div>
              <div className="input-group">
                <label>Note (facultatif)</label>
                <textarea
                  placeholder="Ex\u00A0: je ne suis pas s\u00FBr du nombre de panneaux&hellip;"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  style={{padding:'10px 14px', border:'1px solid var(--admin-border)', borderRadius:8, fontSize:13, fontFamily:'inherit', resize:'vertical', outline:'none'}}
                />
              </div>

              <div className="callback-trust">
                <Shield size={12} />
                <span>Vos donn&eacute;es restent confidentielles. Aucun spam, aucun engagement.</span>
              </div>
            </div>

            <div className="callback-foot">
              <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={!canSubmit || loading} style={{flex:1, justifyContent:'center'}}>
                {loading ? <><Loader2 size={16} className="spin" /> Envoi&hellip;</> : <><Clock size={14} /> Je veux &ecirc;tre rappel&eacute;</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

/** Bouton flottant "Être rappelé" */
export function CallbackFab({ onClick }) {
  return (
    <button className="callback-fab" onClick={onClick} aria-label="Demander un rappel">
      <Phone size={16} />
      <span>&Ecirc;tre rappel&eacute;</span>
    </button>
  )
}
