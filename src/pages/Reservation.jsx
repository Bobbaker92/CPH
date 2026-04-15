import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Calendar, CheckCircle, Tag, Phone } from 'lucide-react'
import CallbackModal from '../components/CallbackModal'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

// Tarifs
const PRIX_STANDARD = 199
const REDUCTION_RECOMMANDE = 20
const PRIX_RECOMMANDE = PRIX_STANDARD - REDUCTION_RECOMMANDE

// Simule des creneaux avec interventions existantes
const INTERVENTIONS_EXISTANTES = {
  '2026-05-04': { zone: 'Marseille', count: 2 },
  '2026-05-05': { zone: 'Aubagne', count: 1 },
  '2026-05-11': { zone: 'Marseille', count: 3 },
  '2026-05-12': { zone: 'Toulon', count: 2 },
  '2026-05-18': { zone: 'Aix-en-Provence', count: 1 },
  '2026-05-19': { zone: 'Martigues', count: 2 },
  '2026-05-25': { zone: 'Marseille', count: 2 },
  '2026-05-26': { zone: 'Aubagne', count: 1 },
}

export default function Reservation() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [creneau, setCreneau] = useState('')
  const [callbackOpen, setCallbackOpen] = useState(false)
  const clientVille = 'Marseille'

  const today = new Date(2026, 3, 14)
  const minDate = new Date(today)
  minDate.setDate(minDate.getDate() + 15)

  const year = 2026
  const month = 4
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = firstDay === 0 ? 6 : firstDay - 1

  const days = []
  for (let i = 0; i < offset; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const getDateStr = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const isRecommended = (d) => {
    if (!d) return false
    const intervention = INTERVENTIONS_EXISTANTES[getDateStr(d)]
    return intervention && intervention.zone === clientVille
  }

  const getDayClass = (d) => {
    if (!d) return 'calendar-day disabled'
    const dateStr = getDateStr(d)
    const date = new Date(year, month, d)
    const isWeekend = date.getDay() === 0
    if (isWeekend || date < minDate) return 'calendar-day disabled'
    if (selected === d) return 'calendar-day selected'
    const intervention = INTERVENTIONS_EXISTANTES[dateStr]
    if (intervention && intervention.zone === clientVille) return 'calendar-day recommended'
    if (intervention) return 'calendar-day available'
    return 'calendar-day'
  }

  const prixFinal = selected && isRecommended(selected) ? PRIX_RECOMMANDE : PRIX_STANDARD
  const estRecommande = selected && isRecommended(selected)

  const handleConfirm = () => {
    const dateStr = selected ? getDateStr(selected) : null
    navigate('/paiement', {
      state: {
        date: dateStr,
        creneau,
        prix: prixFinal,
        estRecommande,
        ville: clientVille,
      }
    })
  }

  return (
    <div style={{minHeight:'100vh', background:'var(--bg)'}}>
      <div style={{background:'var(--primary)', color:'white', padding:'20px 24px'}}>
        <div className="container" style={{display:'flex', alignItems:'center', gap:12, justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <ChevronLeft size={20} style={{cursor:'pointer'}} onClick={() => navigate('/')} />
            <div>
              <h2 style={{fontSize:18, fontWeight:700}}>{"Choisissez votre cr\u00E9neau"}</h2>
              <p style={{fontSize:13, opacity:0.7}}>{"Intervention \u00E0 "}{clientVille}{" \u2014 \u00E0 partir de 179\u00A0\u20AC TTC"}</p>
            </div>
          </div>
          <button
            onClick={() => setCallbackOpen(true)}
            style={{display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:999, background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.2)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}
          >
            <Phone size={13} /> &Ecirc;tre rappel&eacute;
          </button>
        </div>
      </div>

      {callbackOpen && <CallbackModal onClose={() => setCallbackOpen(false)} context="reservation" />}

      <div className="container" style={{maxWidth:700, padding:'32px 24px'}}>
        {/* Offre reduction */}
        <div className="card" style={{
          marginBottom:24, background:'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          border:'1px solid var(--green)', padding:20,
        }}>
          <div style={{display:'flex', alignItems:'flex-start', gap:14}}>
            <div style={{
              width:44, height:44, borderRadius:10, background:'var(--green)', color:'white',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <Tag size={22} />
            </div>
            <div>
              <h3 style={{fontSize:15, fontWeight:700, color:'var(--primary)', marginBottom:4}}>
                {"\u20ac20 de r\u00E9duction sur les cr\u00E9neaux recommand\u00E9s"}
              </h3>
              <p style={{fontSize:13, color:'var(--gray-700)', lineHeight:1.6}}>
                {"Nous intervenons d\u00E9j\u00E0 dans votre secteur ces jours-l\u00E0. En choisissant un cr\u00E9neau "}
                <strong>{"vert"}</strong>
                {", vous payez "}
                <strong style={{color:'var(--green)'}}>{"179\u00A0\u20AC"}</strong>
                {" au lieu de "}
                <span style={{textDecoration:'line-through'}}>{"199\u00A0\u20AC"}</span>
                {"."}
              </p>
            </div>
          </div>
          <div style={{display:'flex', gap:16, marginTop:16, fontSize:12, flexWrap:'wrap'}}>
            <span style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{width:14, height:14, borderRadius:4, background:'var(--green-light)', border:'2px solid var(--green)', display:'inline-block'}}></span>
              <strong>{"Recommand\u00E9 \u2014 179\u00A0\u20AC"}</strong>
            </span>
            <span style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{width:14, height:14, borderRadius:4, background:'var(--blue-light)', display:'inline-block'}}></span>
              {"Disponible \u2014 199\u00A0\u20AC"}
            </span>
            <span style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{width:14, height:14, borderRadius:4, background:'var(--gray-100)', display:'inline-block'}}></span>
              Indisponible
            </span>
          </div>
        </div>

        {/* Calendrier */}
        <div className="card" style={{marginBottom:24}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <h3 style={{fontSize:16, fontWeight:700}}>
              <Calendar size={16} style={{verticalAlign:'middle', marginRight:8}} />
              Mai 2026
            </h3>
          </div>
          <div className="calendar-grid">
            {JOURS.map(j => <div key={j} className="calendar-header">{j}</div>)}
            {days.map((d, i) => (
              <div
                key={i}
                className={getDayClass(d)}
                onClick={() => {
                  if (d) {
                    const date = new Date(year, month, d)
                    if (date >= minDate && date.getDay() !== 0) setSelected(d)
                  }
                }}
              >
                {d || ''}
              </div>
            ))}
          </div>
        </div>

        {/* Creneau horaire */}
        {selected && (
          <div className="card" style={{marginBottom:24}}>
            <h3 style={{fontSize:16, fontWeight:700, marginBottom:16}}>
              {"Cr\u00E9neau pour le "}{selected}{" mai 2026"}
              {estRecommande && (
                <span style={{
                  marginLeft:10, fontSize:11, fontWeight:700, color:'var(--green)',
                  background:'var(--green-light)', padding:'3px 10px', borderRadius:4,
                  textTransform:'uppercase', letterSpacing:0.5,
                }}>
                  {"\u2212 20\u00A0\u20AC"}
                </span>
              )}
            </h3>
            <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
              {['8h - 10h', '10h - 12h', '14h - 16h', '16h - 18h'].map(c => (
                <button
                  key={c}
                  className={`btn btn-sm ${creneau === c ? 'btn-dark' : 'btn-outline'}`}
                  onClick={() => setCreneau(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation */}
        {selected && creneau && (
          <div className="card" style={{
            background: estRecommande ? 'var(--green-light)' : 'var(--blue-light)',
            borderLeft: `4px solid ${estRecommande ? 'var(--green)' : 'var(--blue)'}`,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
              <CheckCircle size={20} color={estRecommande ? 'var(--green)' : 'var(--blue)'} />
              <div style={{flex:1}}>
                <h3 style={{fontSize:16, fontWeight:700}}>Votre intervention</h3>
                <p style={{fontSize:14, color:'var(--gray-600)'}}>
                  {selected}{" mai 2026 \u2022 "}{creneau}{" \u2022 "}{clientVille}
                </p>
              </div>
              <div style={{textAlign:'right'}}>
                {estRecommande ? (
                  <>
                    <div style={{fontSize:12, color:'var(--gray-500)', textDecoration:'line-through'}}>
                      {"199\u00A0\u20AC"}
                    </div>
                    <div style={{fontSize:22, fontWeight:800, color:'var(--green)'}}>
                      {"179\u00A0\u20AC"}
                    </div>
                  </>
                ) : (
                  <div style={{fontSize:22, fontWeight:800, color:'var(--primary)'}}>
                    {prixFinal}{"\u00A0\u20AC"}
                  </div>
                )}
              </div>
            </div>

            {estRecommande && (
              <div style={{
                padding:'10px 14px', background:'white', borderRadius:8, marginBottom:16,
                fontSize:13, color:'var(--green)', fontWeight:500,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <Tag size={14} />
                {"Vous \u00E9conomisez 20\u00A0\u20AC en choisissant un cr\u00E9neau recommand\u00E9"}
              </div>
            )}

            <button className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'16px 28px'}} onClick={handleConfirm}>
              {"Confirmer ma r\u00E9servation \u2014 "}{prixFinal}{"\u00A0\u20AC TTC"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
