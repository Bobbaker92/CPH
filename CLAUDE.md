# CPH Solar — Maquette `solaire-paca`

> Point d'entrée pour toute session Claude Code sur ce projet.
> **Lire en premier :** ce fichier puis `docs/BUSINESS.md`.

## TL;DR

- **Projet** : site de nettoyage de panneaux solaires en région PACA
- **Entreprise** : CPH (Contrôle Provence Habitat) — auto-entreprise/société à Aubagne
- **Propriétaire projet** : Fares (`contact@cph13.fr`)
- **Couvreur unique actuel** : **Karim Ziani** (à terme, plusieurs)
- **Stack** : Vite + React 19 + React Router 7 + CSS vanille (pas de TS, pas de Tailwind)
- **Statut** : **MAQUETTE UNIQUEMENT** — aucun backend, données en dur dans les fichiers `.jsx`
- **Domaine cible** : `cphpaca.fr` (pas encore acheté probablement)
- **Tarif** : 199 € TTC / intervention (179 € si créneau recommandé sur secteur déjà programmé)

## Règle d'or

⚠️ **Tu n'écris PAS de code backend sans demande explicite.** On est en phase maquette.
Si on commence à coder la prod, le user te le dira. Jusque-là, chaque donnée affichée
est un mock en dur dans le composant qui la consomme.

## Cartographie des docs

| Fichier | Contenu |
|---|---|
| [docs/BUSINESS.md](docs/BUSINESS.md) | Règles métier, tarifs, capacité planning, PACA |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Entités (Demande, Client, Intervention…) + statuts |
| [docs/FLOWS.md](docs/FLOWS.md) | Parcours utilisateur public/client/admin/couvreur |
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | Stripe, WordPress, email, SMS — décisions prises |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Ce qu'il reste à coder, ordre recommandé |
| [docs/STATE_SYNC.md](docs/STATE_SYNC.md) | Pourquoi les pages ne se parlent pas encore |

## Architecture actuelle

```
src/
├── App.jsx                    ← Router (toutes les routes)
├── App.css                    ← CSS vanille, 2000+ lignes, tout dans un fichier
├── components/
│   ├── ActionMenu.jsx         ← Dropdown (⋯) réutilisable
│   ├── AddInterventionModal.jsx  ← Modale intelligente avec scoring de créneaux
│   ├── CallbackModal.jsx      ← Modale "Être rappelé" + CallbackFab
│   └── ScrollToTop.jsx        ← Scroll top au changement de route
└── pages/
    ├── Landing.jsx            ← /
    ├── Blog.jsx / BlogArticle.jsx
    ├── Login.jsx              ← Mock auth (3 comptes démo en dur)
    ├── Formulaire.jsx         ← /devis (funnel 5 étapes)
    ├── Reservation.jsx        ← /reservation (choix créneau)
    ├── Paiement.jsx           ← /paiement (Stripe-style UI)
    ├── Confirmation.jsx       ← /confirmation (identifiants envoyés)
    ├── admin/                 ← Espace admin (Fares)
    │   ├── AdminDashboard.jsx    ← Shell : sidebar + topbar + mobile nav
    │   ├── AdminHome.jsx         ← Tableau de bord
    │   ├── AdminDemandes.jsx     ← Inbox leads
    │   ├── AdminPlanning.jsx     ← Planning avec règles capacité
    │   ├── AdminClients.jsx      ← Base clients + fiche drawer
    │   ├── AdminCouvreurs.jsx    ← Liste des couvreurs
    │   └── AdminParrainages.jsx  ← Suivi parrainages 30€
    ├── client/                ← Espace client (identifiants envoyés post-paiement)
    │   ├── Dashboard.jsx
    │   ├── ClientHome.jsx
    │   ├── ClientIntervention.jsx
    │   ├── ClientPhotos.jsx
    │   ├── ClientRapport.jsx
    │   └── ClientRecommander.jsx
    └── couvreur/
        └── CouvreurApp.jsx    ← App mobile terrain (photos, signature)
```

## Comptes démo (Login.jsx)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin (Fares) | `admin@cphpaca.fr` | `admin123` |
| Couvreur (Karim) | `karim@cphpaca.fr` | `couvreur123` |
| Client test | `client@test.fr` | `client123` |

## Conventions code

- **Français** partout (UI + commentaires + variable names si métier)
- **CSS vanille** dans `App.css` — PAS de Tailwind, PAS de CSS-in-JS
  - Préfixe `.admin-*` pour l'espace admin (isolation)
  - Variables CSS dans `:root` (index.css)
- **React Router** pour navigation — pas de framework type Next
- **Aucune lib de UI** (ni MUI, ni shadcn) — tous les composants sont custom
- **lucide-react** pour les icônes
- **CSS responsive** : tables deviennent cards sur mobile via `data-label` + media queries

## Déploiement cible (décisions prises)

- **Hébergeur** : o2switch (pas AWS/GCP/Azure — voir memory)
- **DNS** : Cloudflare en DNS-only
- **Email transactionnel** : Brevo (gratuit 300/jour) puis IONOS
- **SMS** : optionnel, payant (~0,06 €/SMS FR via Brevo)
- **Paiement** : Stripe
- **CMS blog** : WordPress headless (wp-json) sur même domaine dans /wp/, à l'image de nephants.fr
- **SEO** : prerender build-time (type `vite-plugin-prerender-spa` ou `vite-ssg`) + meta + JSON-LD

Voir `docs/INTEGRATIONS.md` pour les détails.
