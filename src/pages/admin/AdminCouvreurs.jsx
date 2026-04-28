import { useEffect, useState, useMemo } from 'react'
import { Plus, Phone, Mail, Star, Calendar, TrendingUp, MapPin, MoreVertical, Award } from 'lucide-react'
import { getInterventions, subscribe } from '../../lib/interventionsStore'

const PRIX_INTERVENTION = 199

// Catalogue couvreurs (statique pour l'instant — sera un store dédié quand
// on aura plusieurs couvreurs). L'email sert de clé pour matcher les
// interventions du store.
const COUVREURS_INFO = [
  {
    id: 1,
    email: 'karim@cphpaca.fr',
    nom: 'Karim Ziani',
    role: 'Couvreur principal',
    tel: '06 11 22 33 44',
    zones: ['Marseille', 'Aubagne', 'Aix', 'Toulon'],
    note: 4.9,
    certifs: ['Qualibat', 'RGE'],
    status: 'actif',
  },
]

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function parseInterventionDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export default function AdminCouvreurs() {
  const [interventions, setInterventions] = useState(() => getInterventions())

  useEffect(() => {
    const refresh = () => setInterventions(getInterventions())
    const unsubscribe = subscribe(refresh)
    return unsubscribe
  }, [])

  // Calcul stats agrégées par couvreur depuis le store
  const couvreurs = useMemo(() => {
    const debutMois = startOfMonth()
    return COUVREURS_INFO.map((c) => {
      const interventionsCouvreur = interventions.filter(
        (i) => i.couvreurEmail === c.email
      )
      const interventionsMois = interventionsCouvreur.filter((i) => {
        const d = parseInterventionDate(i.date)
        return d && d >= debutMois
      })
      const terminees = interventionsCouvreur.filter((i) => i.statut === 'terminee')
      const aVenir = interventionsCouvreur
        .filter((i) => i.statut === 'planifie' || i.statut === 'a-venir')
        .map((i) => ({ ...i, _date: parseInterventionDate(i.date) }))
        .filter((i) => i._date && i._date >= new Date())
        .sort((a, b) => a._date - b._date)

      return {
        ...c,
        interventionsMois: interventionsMois.length,
        interventionsTotal: interventionsCouvreur.length,
        terminees: terminees.length,
        ca: terminees.length * PRIX_INTERVENTION,
        prochaine: aVenir[0] || null,
      }
    })
  }, [interventions])

  const totalInterventionsMois = couvreurs.reduce((s, c) => s + c.interventionsMois, 0)
  const noteMoyenne = (couvreurs.reduce((s, c) => s + c.note, 0) / couvreurs.length).toFixed(1)

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Couvreurs</h1>
            <p>Équipe terrain et zones d&rsquo;intervention.</p>
          </div>
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Ajouter un couvreur</button>
        </div>
      </div>

      <div className="stats-grid stats-grid-3">
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Couvreurs actifs</div>
            <Award size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{couvreurs.length}</div>
          <div className="stat-change">Tous Qualibat</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Interventions ce mois</div>
            <Calendar size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{totalInterventionsMois}</div>
          <div className="stat-change"><TrendingUp size={12} /> calcul&eacute; depuis le store</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Note moyenne</div>
            <Star size={14} className="stat-icon" />
          </div>
          <div className="stat-value">
            {noteMoyenne}<span style={{fontSize:16, color:'var(--gray-400)'}}>/5</span>
          </div>
          <div className="stat-change">Sur Google &amp; interne</div>
        </div>
      </div>

      <div className="couvreurs-grid">
        {couvreurs.map(c => (
          <article key={c.id} className="couvreur-card">
            <div className="couvreur-head">
              <div className="couvreur-avatar">
                {c.nom.split(' ').map(s => s[0]).slice(0,2).join('')}
              </div>
              <div className="couvreur-head-info">
                <h3>{c.nom}</h3>
                <span>{c.role}</span>
              </div>
              <button className="icon-btn" aria-label={`Actions pour ${c.nom}`}><MoreVertical size={16} /></button>
            </div>

            <div className="couvreur-contact">
              <a href={`tel:${c.tel.replace(/\s/g, '')}`}><Phone size={13} /> {c.tel}</a>
              <a href={`mailto:${c.email}`}><Mail size={13} /> {c.email}</a>
            </div>

            <div className="couvreur-stats">
              <div>
                <span className="couvreur-stat-val">{c.interventionsMois}</span>
                <span className="couvreur-stat-lbl">Interv. mois</span>
              </div>
              <div>
                <span className="couvreur-stat-val">
                  {c.note}<Star size={12} fill="var(--accent)" color="var(--accent)" style={{marginLeft:4}}/>
                </span>
                <span className="couvreur-stat-lbl">Note</span>
              </div>
              <div>
                <span className="couvreur-stat-val">{c.ca.toLocaleString('fr-FR')}&nbsp;€</span>
                <span className="couvreur-stat-lbl">CA terminé</span>
              </div>
            </div>

            {c.prochaine && (
              <div className="couvreur-prochaine">
                <p className="couvreur-section-label"><Calendar size={11} /> Prochaine intervention</p>
                <p className="couvreur-prochaine-text">
                  <strong>{c.prochaine.date || 'Date à confirmer'}</strong>
                  {c.prochaine.client && <> · {c.prochaine.client}</>}
                  {c.prochaine.ville && <> · {c.prochaine.ville}</>}
                </p>
              </div>
            )}

            <div className="couvreur-zones">
              <p className="couvreur-section-label"><MapPin size={11} /> Zones</p>
              <div className="couvreur-chips">
                {c.zones.map(z => <span key={z} className="chip">{z}</span>)}
              </div>
            </div>

            <div className="couvreur-zones">
              <p className="couvreur-section-label"><Award size={11} /> Certifications</p>
              <div className="couvreur-chips">
                {c.certifs.map(ct => <span key={ct} className="chip chip-accent">{ct}</span>)}
              </div>
            </div>

            <div className="couvreur-actions">
              <button className="btn btn-sm btn-outline" style={{flex:1, justifyContent:'center'}}>
                Voir planning ({c.interventionsTotal})
              </button>
              <button className="btn btn-sm btn-dark" style={{flex:1, justifyContent:'center'}}>Fiche</button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
