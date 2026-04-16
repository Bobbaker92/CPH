import { Plus, Phone, Mail, Star, Calendar, TrendingUp, MapPin, MoreVertical, Award } from 'lucide-react'

const COUVREURS = [
  {
    id: 1, nom: 'Karim Ziani', role: 'Couvreur principal',
    tel: '06 11 22 33 44', email: 'karim@cphpaca.fr',
    zones: ['Marseille', 'Aubagne', 'Aix', 'Toulon'],
    interventionsMois: 18, note: 4.9, ca: 3582,
    certifs: ['Qualibat', 'RGE'],
    status: 'actif',
  },
]

export default function AdminCouvreurs() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Couvreurs</h1>
            <p>&Eacute;quipe terrain et zones d'intervention.</p>
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
          <div className="stat-value">{COUVREURS.length}</div>
          <div className="stat-change">Tous Qualibat</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Interventions ce mois</div>
            <Calendar size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{COUVREURS.reduce((s,c) => s + c.interventionsMois, 0)}</div>
          <div className="stat-change"><TrendingUp size={12} /> +28% vs mars</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-head">
            <div className="stat-label">Note moyenne</div>
            <Star size={14} className="stat-icon" />
          </div>
          <div className="stat-value">{(COUVREURS.reduce((s,c) => s + c.note, 0) / COUVREURS.length).toFixed(1)}<span style={{fontSize:16, color:'var(--gray-400)'}}>/5</span></div>
          <div className="stat-change">Sur Google &amp; interne</div>
        </div>
      </div>

      <div className="couvreurs-grid">
        {COUVREURS.map(c => (
          <article key={c.id} className="couvreur-card">
            <div className="couvreur-head">
              <div className="couvreur-avatar">
                {c.nom.split(' ').map(s => s[0]).slice(0,2).join('')}
              </div>
              <div className="couvreur-head-info">
                <h3>{c.nom}</h3>
                <span>{c.role}</span>
              </div>
              <button className="icon-btn"><MoreVertical size={16} /></button>
            </div>

            <div className="couvreur-contact">
              <a href={`tel:${c.tel.replace(/\s/g, '')}`}><Phone size={13} /> {c.tel}</a>
              <a href={`mailto:${c.email}`}><Mail size={13} /> {c.email}</a>
            </div>

            <div className="couvreur-stats">
              <div><span className="couvreur-stat-val">{c.interventionsMois}</span><span className="couvreur-stat-lbl">Interv. mois</span></div>
              <div><span className="couvreur-stat-val">{c.note}<Star size={12} fill="var(--accent)" color="var(--accent)" style={{marginLeft:4}}/></span><span className="couvreur-stat-lbl">Note</span></div>
              <div><span className="couvreur-stat-val">{c.ca.toLocaleString('fr-FR')}&nbsp;&euro;</span><span className="couvreur-stat-lbl">CA g&eacute;n&eacute;r&eacute;</span></div>
            </div>

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
              <button className="btn btn-sm btn-outline" style={{flex:1, justifyContent:'center'}}>Voir planning</button>
              <button className="btn btn-sm btn-dark" style={{flex:1, justifyContent:'center'}}>Fiche</button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
