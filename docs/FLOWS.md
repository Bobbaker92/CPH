# Parcours utilisateurs — CPH Solar

## Parcours 1 : Lead → Client payant (happy path)

```
Visiteur SEO/Google Ads
        │
        ▼
    /                           ← Landing
        │
        │  Clic "Réserver mon intervention"
        ▼
    /devis                      ← Funnel 5 étapes
        │   1. Panneaux (6-10, 10-16, 16-24, 24+, ?)
        │   2. Maison (plain-pied, étage, immeuble) + accès toit
        │   3. Toiture : type tuile + POSE (surimposition/intégré/?)
        │   4. Localisation (code postal → auto-ville API geo.api.gouv.fr)
        │   5. Coordonnées (nom + tel + email) + récap
        │
        ▼
    /reservation                ← Choix créneau
        │   Calendrier avec 3 niveaux :
        │   🟢 Recommandé (179 €, même secteur que clients existants)
        │   🔵 Disponible (199 €)
        │   ⚫ Indisponible (journée pleine)
        │
        ▼
    /paiement                   ← Stripe-style
        │   Choix : Carte Stripe (maintenant) OU à l'intervention
        │   Choix notif : Email (gratuit) + SMS (option)
        │
        ▼
    /confirmation               ← Success
        │   N° réservation CPH-2026-XXXX
        │   Bloc identifiants (email + mdp temporaire)
        │   CTA "Accéder à mon espace"
        │
        ▼
    /client                     ← Dashboard client
```

## Parcours 2 : Lead abandonné → Capture

Points d'abandon identifiés et capturés :

| Étape | Comportement | Capture |
|---|---|---|
| Landing sans clic CTA | Fermeture onglet | **Bouton flottant "Être rappelé"** (FAB) |
| Funnel partiellement rempli | Quitte après étape 3 | Auto-save localStorage + POST dès que tel saisi à étape 5 → source "Formulaire abandonné" |
| Reservation sans choix créneau | Quitte la page | Bouton "Être rappelé" en topbar |
| Paiement sans finalisation | Ferme l'onglet après avoir vu la CB | **Source "Paiement abandonné" = lead ultra-chaud** |

Toutes les captures passent par le composant `<CallbackModal>` avec un `context` qui
indique où on en est. Le backend devra stocker ce context pour prioriser les rappels.

## Parcours 3 : Admin — Inbox leads → Planning

```
Fares arrive le matin
        │
        ▼
   /admin                       ← Dashboard
        │   Banner rouge "3 nouvelles demandes" (lien rapide)
        │
        ▼
   /admin/demandes              ← Inbox, filtres par statut + source
        │   Pastilles source :
        │   📝 Formulaire  | 📞 Rappel demandé
        │   ⚠️ Formulaire abandonné | 🔥 Paiement abandonné
        │
        │  Clic "Planifier" sur une demande
        ▼
   /admin/planning               ← Modale "Nouvelle intervention" AUTO-OUVERTE
        │   (données pré-remplies depuis la demande)
        │
        │  Colonne droite : scoring intelligent des créneaux
        │   🟢 "Idéal" : 3 interv. déjà prévues à Marseille ce jour
        │   🔵 "Libre" : journée vide
        │   🟡 "Zone diff." : interv. prévues mais autre secteur
        │   (🔴 journée pleine : exclue)
        │
        │  Sélection slot → Planifier
        ▼
   Intervention créée
        │   → Demande marquée "planifie"
        │   → Email de confirmation envoyé au client
        │   → Rappel automatique la veille (J-1)
```

## Parcours 4 : Jour de l'intervention — Couvreur mobile

```
Karim arrive sur site
        │
        ▼
   /couvreur                    ← App mobile (écran intervention)
        │   Liste des interventions du jour
        │   Itinéraire GPS
        │
        │  Clic sur intervention
        ▼
   Écran intervention
        │   Photos avant (1 seul slot)
        │   → nettoyage ~1h30
        │   Photos après (1 seul slot)
        │   Observations toiture (optionnel, bouton "+ Ajouter")
        │   Notes terrain libres
        │   Signature client
        │
        ▼
   Clic "Terminer l'intervention"
        │   → Envoi email rapport au client sous 48h
        │   → Si observation warning → génère devis couverture
        │   → Intervention status: "termine"
```

## Parcours 5 : Post-intervention — Client

```
Client reçoit email rapport
        │
        ▼
   /client                      ← Dashboard (login email + mdp auto)
        │   Timeline de l'intervention
        │
        ├──► /client/photos     ← Comparatif avant/après + observations
        ├──► /client/rapport    ← Rapport PDF téléchargeable
        ├──► /client/intervention ← Détails, facture, couvreur, RDV
        └──► /client/recommander ← Lien de parrainage (-30 €)
```

## Parcours 6 : Parrainage → Conversion

```
Client partage son lien: https://cphpaca.fr/?parrain=MA1234
        │
        ▼
Filleul clique le lien
        │   Cookie "parrain=MA1234" posé (30 jours)
        │
        ▼
Filleul fait tout le parcours 1 normalement
        │
        ▼
Intervention filleul = "termine" payé
        │
        ▼
Admin /admin/parrainages
        │   Statut passe "envoye" → "inscrit" → "convertie"
        │   Réduction 30 € créditée pour le parrain sur sa prochaine interv.
```

## Notifications envoyées (à coder en prod)

| Événement | Canal | Contenu |
|---|---|---|
| Lead capturé (callback) | — | Log admin uniquement |
| Demande reçue (formulaire) | Email admin | Alerte Fares |
| Réservation confirmée (post-paiement) | Email + SMS client | N° résa + identifiants + créneau |
| Veille de l'intervention (J-1 18h) | Email + SMS client | Confirmation horaire, GPS couvreur |
| Rappel J-0 2h avant | SMS client | "Karim arrive dans 2h" |
| Rapport disponible (J+1 ou J+2) | Email client | Lien espace client + PDF |
| Devis couverture généré | Email client | PDF devis + lien signature |
| Parrainage converti | Email parrain | "Merci, 30 € créditées" |

## Routes publiques vs privées

| Route | Accès | Notes |
|---|---|---|
| `/`, `/devis`, `/reservation`, `/paiement`, `/confirmation` | Public | **SEO critique** — doivent être prerendered |
| `/blog`, `/blog/:slug` | Public | Alimenté par WP headless (wp-json) |
| `/connexion` | Public | Mock auth actuellement |
| `/client/*` | Auth client | `noindex` en prod |
| `/admin/*` | Auth admin | `noindex` en prod |
| `/couvreur` | Auth couvreur | `noindex` en prod |
