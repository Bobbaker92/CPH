import { Link } from 'react-router-dom'
import {
  HelpCircle, Inbox, Calendar, Users, UserCheck, Gift, Target, Settings,
  Keyboard, Sparkles, FileText
} from 'lucide-react'

const SECTIONS = [
  {
    icon: Inbox, color: '#dc2626',
    titre: 'Demandes', path: '/admin/demandes',
    desc: "Tous les leads qui arrivent par le formulaire public, le bouton 'Être rappelé' ou en téléphone direct. Statuts : nouveau / à rappeler / planifié / refusé.",
  },
  {
    icon: Calendar, color: '#2563eb',
    titre: 'Planning', path: '/admin/planning',
    desc: "Vue calendrier des interventions. Capacité maxi 3-4 chantiers/jour. Quand vous planifiez une demande, elle bascule auto en statut 'planifié'.",
  },
  {
    icon: Users, color: '#16a34a',
    titre: 'Clients', path: '/admin/clients',
    desc: "Base de tous vos clients (créés au paiement ou à la 1ère intervention). Dédoublonnage par téléphone. Onglet 'Historique' pour voir toutes les interventions liées.",
  },
  {
    icon: UserCheck, color: '#f59e0b',
    titre: 'Couvreurs', path: '/admin/couvreurs',
    desc: "L'équipe terrain. Pour l'instant 1 seul couvreur (Karim). Les stats (nb interventions mois, CA terminé) sont calculées en direct depuis le store.",
  },
  {
    icon: Gift, color: '#ec4899',
    titre: 'Parrainages', path: '/admin/parrainages',
    desc: "Suivi des invitations envoyées par les clients. Statuts : envoyé → inscrit (le parrainé a réservé) → validé (intervention faite, bonus 30 € à créditer au parrain).",
  },
  {
    icon: Target, color: '#7c3aed',
    titre: 'Prospection', path: '/admin/prospection',
    desc: "RDV pris par votre équipe de prospection. Calcul auto des commissions (5% au-delà de 10 000 € vendus + primes par paliers).",
  },
  {
    icon: Settings, color: '#475569',
    titre: 'Paramètres', path: '/admin/parametres',
    desc: "Export/import des données en JSON, reset des stores, et bouton 'Charger une démo' pour injecter 10+ leads + interventions + clients (utile pour montrer le site à un prospect).",
  },
]

const SHORTCUTS = [
  { key: '⌘K', desc: 'Focus la barre de recherche dans la topbar' },
  { key: '⌘P', desc: 'Imprimer / Enregistrer en PDF (sur /client/rapport)' },
  { key: 'Esc', desc: 'Fermer une modale, un drawer ou une lightbox' },
  { key: 'Tab', desc: 'Naviguer entre les éléments interactifs' },
]

const ASTUCES = [
  {
    icon: Sparkles,
    titre: 'Démo prospect en 1 clic',
    desc: 'Allez dans Paramètres → "Charger la démo" pour injecter des données réalistes en quelques secondes. Idéal avant un rendez-vous prospect.',
  },
  {
    icon: FileText,
    titre: 'Export CSV des leads',
    desc: "Sur Demandes, Clients, Parrainages — un bouton 'Exporter' télécharge un CSV au format Excel/Mailjet/Brevo prêt à importer.",
  },
  {
    icon: Keyboard,
    titre: 'Recherche rapide',
    desc: '⌘K (Cmd + K) sur Mac ou Ctrl+K sur PC pour aller direct à la recherche, depuis n\'importe quelle page admin.',
  },
]

export default function AdminAide() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1><HelpCircle size={20} style={{verticalAlign:'middle', marginRight:8}} /> Aide</h1>
            <p>Tour rapide de l&rsquo;administration CPH Solar.</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <section className="admin-card">
        <h3>Les 7 sections de l&rsquo;administration</h3>
        <div className="aide-sections-list">
          {SECTIONS.map((s) => (
            <Link key={s.path} to={s.path} className="aide-section">
              <div className="aide-section-icon" style={{background: `${s.color}1a`, color: s.color}}>
                <s.icon size={18} />
              </div>
              <div>
                <strong>{s.titre}</strong>
                <p>{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Astuces */}
      <section className="admin-card">
        <h3>Astuces utiles</h3>
        <div className="aide-tips">
          {ASTUCES.map((a, i) => (
            <div key={i} className="aide-tip">
              <a.icon size={18} />
              <div>
                <strong>{a.titre}</strong>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Raccourcis clavier */}
      <section className="admin-card">
        <h3><Keyboard size={16} style={{verticalAlign:'middle', marginRight:6}} /> Raccourcis clavier</h3>
        <table className="aide-shortcuts">
          <tbody>
            {SHORTCUTS.map((s, i) => (
              <tr key={i}>
                <td><kbd className="aide-kbd">{s.key}</kbd></td>
                <td>{s.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Contact dev */}
      <section className="admin-card" style={{textAlign:'center'}}>
        <h3>Une question, un bug, une idée&nbsp;?</h3>
        <p style={{margin:'8px 0 16px'}}>
          Le site est encore en phase maquette. Les retours sont bienvenus pour prioriser les am&eacute;liorations.
        </p>
        <a className="btn btn-primary btn-sm" href="mailto:contact@cphpaca.fr?subject=Retour%20admin%20CPH%20Solar">
          Envoyer un retour
        </a>
      </section>
    </>
  )
}
