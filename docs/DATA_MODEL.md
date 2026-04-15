# Modèle de données — CPH Solar

> Les données sont aujourd'hui en dur dans chaque composant.
> Cette doc fige les **schémas** pour préparer le backend.

## Vue d'ensemble

```
Lead ─────► Demande ─────► Intervention ─────► Rapport
  │            │              │                    │
  │            └─► Client ◄───┘                    │
  │                   │                            │
  │                   └─► Parrainage               │
  │                                                │
  └─► (source, context abandon)       Photo avant/après + observations
                                       + Devis couverture (upsell)
```

## Entités

### Lead

> Point d'entrée universel. Capturé à chaque interaction.

```js
{
  id: "lead-xxx",
  nom: "Pierre Vidal",
  tel: "06 12 34 56 78",
  email: "p.vidal@free.fr",           // optionnel si source=rappel
  source: "Formulaire" | "Téléphone" | "Manuel" | "Rappel demandé"
        | "Formulaire abandonné" | "Paiement abandonné",
  context: "landing" | "devis-etape-N" | "reservation" | "paiement",
  // Contexte d'abandon :
  abandonStep: null | "devis-3" | "reservation" | "paiement",
  partialData: { /* toutes les infos déjà saisies dans le funnel */ },
  dateRecu: ISO8601,
  note: string,
}
```

**Source critique** `Paiement abandonné` = lead ultra-chaud à rappeler en priorité.

### Demande (= Lead qualifié avec infos installation)

Voir mock dans `src/pages/admin/AdminDemandes.jsx`.

```js
{
  id: number,
  nom: string,
  tel: string,
  email: string,
  ville: string,                      // "Marseille 13008"
  adresse: string,
  panneaux: "6-10" | "10-16" | "16-24" | "24+" | "unknown",
  tuile: "canal" | "romane" | "redland" | "plate" | "bac-acier" | "autre",
  integration: "surimposition" | "integre" | "unknown",
  etage: "plain-pied" | "etage" | "immeuble",
  dateRecu: string,                   // "Aujourd'hui 10:42"
  statut: "nouveau" | "a-rappeler" | "planifie" | "refuse",
  source: string,                     // cf. Lead.source
  notes: string,                      // notes internes admin
}
```

### Intervention (= Demande planifiée)

```js
{
  id: string,
  demandeId: number,                  // lien vers demande d'origine
  clientId: number,                   // lien client si déjà connu
  date: "2026-05-04",                 // YYYY-MM-DD
  jour: "Lundi 4 mai",                // dérivé de date, pour affichage
  heure: "8h-10h" | "10h30-12h30" | "14h-16h" | "16h30-18h",
  client: string,
  tel: string,
  ville: string,
  adresse: string,
  panneaux: number,                   // ici CHIFFRE (contrairement à Demande)
  couvreur: string,                   // "Karim Ziani"
  statut: "a-confirmer" | "confirme" | "termine" | "annulee",
  // Post-intervention :
  photos: { avant: string|null, apres: string|null, toiture: [{ label, url }] },
  signature: string,                  // base64 ou URL
  notes: string,                      // notes terrain du couvreur
  rapportEnvoye: boolean,
  // Upsell :
  devisCouverture: { prestation, montant, statut } | null,
}
```

### Client

```js
{
  id: number,
  nom: string,
  tel: string,
  email: string,
  ville: string,
  adresse: string,
  dateCreation: ISO8601,
  interventions: number,              // compteur
  ca: number,                         // cumul en €
  derniere: string,                   // date dernière intervention
  statut: "nouveau" | "actif" | "vip",
  notes: string,                      // notes internes
  parrainages: { code: string, filleuls: number, gains: number },
  // Identifiants espace client :
  passwordHash: string,
  mustChangePassword: boolean,
}
```

**Statut dérivé** :
- `nouveau` : 1 intervention ou moins
- `actif` : 2+ interventions
- `vip` : signataire d'un devis couverture important

### Couvreur

```js
{
  id: number,
  nom: string,
  role: string,                       // "Couvreur principal"
  tel: string,
  email: string,                      // sert aussi d'identifiant login
  zones: string[],                    // secteurs couverts
  certifs: ("Qualibat" | "RGE" | "Décennale")[],
  interventionsMois: number,          // compteur glissant
  note: number,                       // /5
  ca: number,                         // cumul
  status: "actif" | "inactif",
  // Capacité / règles spécifiques :
  capaciteStandard: 3,                // peut varier par couvreur ?
  capaciteEtendue: 4,
}
```

### Paiement

```js
{
  id: string,
  interventionId: string,
  mode: "carte" | "intervention",
  montant: number,
  statut: "pending" | "authorized" | "captured" | "failed" | "refunded",
  stripePaymentIntentId: string|null,
  stripeChargeId: string|null,
  brand: "Visa" | "Mastercard" | "Amex" | null,
  last4: string|null,
  date: ISO8601,
}
```

### Parrainage

```js
{
  id: number,
  parrainClientId: number,
  filleulNom: string,                 // avant conversion
  filleulClientId: number|null,       // après conversion
  lienCode: string,                   // pour l'URL
  ville: string,
  dateEnvoi: string,
  statut: "envoye" | "inscrit" | "convertie",
  recompense: number,                 // 30 si converti, 0 sinon
  appliqueeSur: string|null,          // id intervention sur laquelle la réduc a été appliquée
}
```

### Notification

```js
{
  id: string,
  clientId: number,
  interventionId: string|null,
  canal: "email" | "sms",
  type: "confirmation" | "identifiants" | "rappel-veille" | "rapport-envoye",
  sentAt: ISO8601,
  status: "sent" | "delivered" | "bounced" | "failed",
  providerId: string,                 // Brevo ID
}
```

## Statuts et transitions

### Demande

```
nouveau ──► a-rappeler ──► planifie ──► (termine via Intervention)
   │            │
   └────────────┴──► refuse
```

### Intervention

```
a-confirmer ──► confirme ──► termine
      │            │
      └────────────┴──► annulee
```

### Paiement

```
pending ──► authorized ──► captured
   │           │              │
   └───────────┴──► failed    └──► refunded (optionnel)
```

## Référentiels

### Ville → Secteur

Fonction à mutualiser côté backend :

```js
getSecteur(ville)
// "Marseille 13008" → "Marseille"
// "Aix-en-Provence 13100" → "Aix-en-Provence"
// "Aubagne 13400" → "Aubagne"
```

Algo actuel : `ville.split(/\s+\d/)[0].trim()` — marche dans 95% des cas. À valider avec
base de données villes INSEE en prod.

### Constantes métier

```js
export const SEUIL_PETITE_INSTALLATION = 10       // panneaux
export const CAPACITE_STANDARD = 3
export const CAPACITE_ETENDUE = 4
export const PRIX_STANDARD = 199
export const PRIX_RECOMMANDE = 179
export const REDUCTION_PARRAINAGE = 30
export const DEPTS_PACA = ['04', '05', '06', '13', '83', '84']
export const CRENEAUX = ['8h-10h', '10h30-12h30', '14h-16h', '16h30-18h']
```
