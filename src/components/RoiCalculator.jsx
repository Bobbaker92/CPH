import { useState, useMemo } from 'react'
import { Sun, TrendingUp, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Calculateur de retour sur investissement.
 * Estime la production récupérée après nettoyage selon :
 *  - taille de l'installation (kWc)
 *  - estimation de l'encrassement (en % de perte actuelle)
 *
 * Hypothèses (PACA, autoconsommation moyenne) :
 *  - 1 kWc produit ~1 580 kWh/an en PACA
 *  - 0,21 €/kWh économisé (tarif EDF moyen 2026)
 *  - Tarif intervention : 199 € TTC
 */
const KWH_PAR_KWC_AN = 1580
const PRIX_KWH = 0.21
const PRIX_INTERVENTION = 199

const NIVEAUX_ENCRASSEMENT = [
  { v: 5, l: 'Léger', desc: 'Poussière fine, pollution urbaine' },
  { v: 12, l: 'Modéré', desc: 'Pollen + particules sahariennes' },
  { v: 20, l: 'Important', desc: 'Fientes, résine, lichens' },
  { v: 30, l: 'Très important', desc: 'Panneaux jamais nettoyés' },
]

export default function RoiCalculator() {
  const [kwc, setKwc] = useState(6)
  const [perte, setPerte] = useState(12)

  const calculs = useMemo(() => {
    const productionAn = kwc * KWH_PAR_KWC_AN
    const productionPerdue = productionAn * (perte / 100)
    const euroPerduAn = Math.round(productionPerdue * PRIX_KWH)
    const euroPerdu5Ans = euroPerduAn * 5
    const roiMois = euroPerduAn > 0 ? Math.max(1, Math.round((PRIX_INTERVENTION / euroPerduAn) * 12)) : 99
    return { productionAn, euroPerduAn, euroPerdu5Ans, roiMois }
  }, [kwc, perte])

  return (
    <section className="roi-section" id="roi-calculateur">
      <div className="container">
        <div className="roi-head">
          <span className="roi-eyebrow"><Calculator size={14} /> Calculateur</span>
          <h2>Combien votre encrassement vous co&ucirc;te ?</h2>
          <p>Estimation bas&eacute;e sur les rendements moyens en r&eacute;gion PACA.</p>
        </div>

        <div className="roi-grid">
          <div className="roi-controls">
            <div className="roi-control">
              <label htmlFor="roi-kwc">
                <Sun size={14} /> Taille de votre installation
              </label>
              <div className="roi-slider-wrap">
                <input
                  id="roi-kwc"
                  type="range"
                  min="3"
                  max="24"
                  step="1"
                  value={kwc}
                  onChange={(e) => setKwc(Number(e.target.value))}
                />
                <span className="roi-value">{kwc}&nbsp;kWc</span>
              </div>
              <small>{Math.round(kwc / 0.4)} panneaux environ</small>
            </div>

            <div className="roi-control">
              <label>Niveau d&rsquo;encrassement estim&eacute;</label>
              <div className="roi-pills">
                {NIVEAUX_ENCRASSEMENT.map((n) => (
                  <button
                    key={n.v}
                    type="button"
                    className={`roi-pill ${perte === n.v ? 'active' : ''}`}
                    onClick={() => setPerte(n.v)}
                  >
                    <strong>{n.l}</strong>
                    <span>&minus;{n.v}%</span>
                  </button>
                ))}
              </div>
              <small>{NIVEAUX_ENCRASSEMENT.find((n) => n.v === perte)?.desc}</small>
            </div>
          </div>

          <div className="roi-result">
            <div className="roi-stat">
              <span className="roi-stat-label">Vous perdez chaque ann&eacute;e</span>
              <strong className="roi-stat-value">{calculs.euroPerduAn}&nbsp;&euro;</strong>
              <span className="roi-stat-sub">soit {Math.round(calculs.productionAn * (perte / 100))}&nbsp;kWh non produits</span>
            </div>
            <div className="roi-stat roi-stat-secondary">
              <span className="roi-stat-label">Sur 5&nbsp;ans sans nettoyage</span>
              <strong className="roi-stat-value">{calculs.euroPerdu5Ans}&nbsp;&euro;</strong>
            </div>
            <div className="roi-roi">
              <TrendingUp size={16} />
              <span>
                Un nettoyage &agrave; <strong>199&nbsp;&euro;</strong> est rembours&eacute; en{' '}
                <strong>{calculs.roiMois > 24 ? '+ de 24' : calculs.roiMois}&nbsp;mois</strong>{' '}
                de production r&eacute;cup&eacute;r&eacute;e.
              </span>
            </div>
            <Link to="/devis" className="btn btn-primary roi-cta">
              R&eacute;server mon nettoyage
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
