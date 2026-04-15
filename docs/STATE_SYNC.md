# Problème de synchronisation d'état (limitation maquette)

## Le problème

Aujourd'hui, chaque page gère **son propre état local** :

| Page | State local | Donnée |
|---|---|---|
| `AdminDemandes.jsx` | `useState(DEMANDES_INIT)` | 9 leads en dur |
| `AdminPlanning.jsx` | `useState(ALL_INTERVENTIONS_INIT)` | 9 interventions en dur |
| `AdminHome.jsx` | `const INTERVENTIONS = [...]` | 5 interventions en dur |
| `AdminClients.jsx` | `const CLIENTS = [...]` | 8 clients en dur |
| etc. | | |

**Conséquence concrète** : quand l'utilisateur planifie une demande depuis
`/admin/demandes`, le nouvel état (intervention ajoutée) n'est visible que dans
`/admin/planning`. Les autres pages ne le voient pas. Au rafraîchissement, tout est perdu.

## Pourquoi c'est OK pour la maquette

- On valide l'UX, pas la data layer
- Fares peut cliquer partout sans rien casser
- Claude (moi futur) pourra facilement brancher un store au-dessus sans repenser l'UI

## La solution (quand on passera en prod)

### Étape 1 : Context React partagé

Créer `src/store/AppStateContext.jsx` :

```jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  const [demandes, setDemandes] = useState([])
  const [interventions, setInterventions] = useState([])
  const [clients, setClients] = useState([])
  const [couvreurs, setCouvreurs] = useState([])
  const [parrainages, setParrainages] = useState([])

  // Persist to localStorage
  useEffect(() => {
    const data = { demandes, interventions, clients, couvreurs, parrainages }
    localStorage.setItem('cph-state', JSON.stringify(data))
  }, [demandes, interventions, clients, couvreurs, parrainages])

  // Hydrate at boot
  useEffect(() => {
    const saved = localStorage.getItem('cph-state')
    if (saved) {
      const data = JSON.parse(saved)
      setDemandes(data.demandes || [])
      setInterventions(data.interventions || [])
      setClients(data.clients || [])
      setCouvreurs(data.couvreurs || [])
      setParrainages(data.parrainages || [])
    }
  }, [])

  // Actions cross-entité (la vraie valeur du Context)
  const planifierDemande = (demandeId, interventionData) => {
    // Crée l'intervention + marque la demande "planifie" en 1 action
    setInterventions(list => [...list, { id: genId(), ...interventionData }])
    setDemandes(list => list.map(d => d.id === demandeId ? { ...d, statut: 'planifie' } : d))
    // Si le client n'existe pas, le créer
    const existingClient = clients.find(c => c.tel === interventionData.tel)
    if (!existingClient) {
      setClients(list => [...list, {
        id: genId(),
        nom: interventionData.client,
        tel: interventionData.tel,
        ville: interventionData.ville,
        interventions: 1,
        ca: 199,
        statut: 'nouveau',
      }])
    }
  }

  return (
    <AppStateContext.Provider value={{
      demandes, interventions, clients, couvreurs, parrainages,
      setDemandes, setInterventions, setClients, setCouvreurs, setParrainages,
      planifierDemande,
      // ... autres actions cross-entité
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

export const useAppState = () => useContext(AppStateContext)
```

### Étape 2 : Wrapper dans App.jsx

```jsx
<AppStateProvider>
  <BrowserRouter>
    <ScrollToTop />
    <Routes>...</Routes>
  </BrowserRouter>
</AppStateProvider>
```

### Étape 3 : Refactor de chaque page

Remplacer `useState(XXX_INIT)` par `useAppState()`.
Les mocks initiaux deviennent un seeder appelé une seule fois au premier boot si
`localStorage` est vide.

### Étape 4 (prod) : Brancher le backend

Le Context devient une **façade** : les setters font des `fetch('/api/...')` et
mettent à jour le state après succès. Les composants restent identiques.

```jsx
const planifierDemande = async (demandeId, interventionData) => {
  const res = await fetch('/api/planifier', {
    method: 'POST',
    body: JSON.stringify({ demandeId, ...interventionData }),
  })
  if (res.ok) {
    const { intervention, updatedDemande, newClient } = await res.json()
    setInterventions(list => [...list, intervention])
    setDemandes(list => list.map(d => d.id === demandeId ? updatedDemande : d))
    if (newClient) setClients(list => [...list, newClient])
  }
}
```

## Actions cross-entité à prévoir

Liste des opérations qui touchent **plusieurs entités** (c'est là que la synchro est critique) :

| Action | Impact |
|---|---|
| Planifier une demande | demande.statut → "planifie" + crée intervention + crée/update client |
| Terminer une intervention | intervention.statut → "termine" + client.interventions++ + client.ca += montant |
| Créer un devis couverture | nouvelle entrée `devis` + client.statut → "vip" si montant > 2000€ |
| Parrainage converti | parrainage.statut → "convertie" + parrain (client) → réduc 30€ sur next |
| Refuser une demande | demande.statut → "refuse" + log raison |
| Annuler une intervention | intervention.statut → "annulee" + rembourser si payé CB |

Toutes ces actions doivent **tomber dans une seule transaction** côté backend pour
éviter les incohérences.
