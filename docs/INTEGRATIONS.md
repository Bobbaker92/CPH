# Intégrations externes — CPH Solar

> Toutes les décisions prises pendant la phase maquette.
> À consulter avant de commencer à coder chaque intégration.

## Hébergement

**Choix : o2switch** (décidé, voir memory `project_infra_decisions`).

- **Pourquoi** : déjà utilisé pour nephants, support FR, bon rapport qualité/prix,
  panneau cPanel familier, PHP + Node.js dispo.
- **Rejeté** : AWS/GCP/Azure (surdimensionné, complexité inutile à ce stade)
- **DNS** : Cloudflare en mode DNS-only (pas de proxy — évite cache agressif sur formulaires)
- **Email entrant** : IONOS d'abord, Brevo SMTP ensuite

## Paiement : Stripe

### Décisions

- **Stripe Checkout hosted** en priorité (le plus simple, 3DS inclus, mobile OK)
- Alternative : Stripe Elements (UI intégrée) — plus de code, + de contrôle
- **Capture immédiate**, pas d'autorisation différée (l'intervention est sous 2 semaines)
- **Webhook `checkout.session.completed`** côté backend pour confirmer la création
  de la réservation + envoyer email identifiants
- **Remboursement** : manuel côté admin via dashboard Stripe si annulation >48h

### Config à préparer

```env
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Modes exposés au client

| Mode | Friction | Cashflow |
|---|---|---|
| CB Stripe au clic "Réserver" | Plus élevée | Encaissé immédiatement |
| À l'intervention (CB/espèces/chèque) | Zéro | Risque no-show |

Garder les 2 modes — déjà fait dans la maquette `Paiement.jsx`.

## CMS Blog : WordPress headless

### Décisions

- **WP installé en sous-dossier** `/wp/` sur `cphpaca.fr` (pas en sous-domaine)
- **Mode headless** : React consomme `/wp-json/wp/v2/posts` pour afficher les articles
- **Pattern identique à nephants.fr** (voir leurs URLs `/app/` + `/wp-json/` en prod)
- Admin WP accessible via `/wp-login.php` — Fares publie ses articles depuis là
- **Sécurité** : masquer `/wp-login.php` derrière un slug custom + limit-login-attempts

### Endpoints utiles

```
GET /wp-json/wp/v2/posts?per_page=10&_embed    ← Liste articles avec featured image
GET /wp-json/wp/v2/posts?slug=<slug>&_embed    ← Article par slug
GET /wp-json/wp/v2/categories
GET /wp-json/wp/v2/pages                        ← Mentions légales, CGV, etc
```

### SEO

- **Problème** : SPA Vite = Google indexe mal (JS requis)
- **Solution** : **prerender au build** (`vite-plugin-prerender-spa` ou `vite-ssg`)
  - Génère un HTML statique par route publique avec toutes les meta/JSON-LD inline
  - Google voit tout sans exécuter de JS
- **Balises à inclure** (par page publique) :
  - `<title>`, `<meta description>`, `<link canonical>`
  - Open Graph (og:title, og:image, og:type)
  - JSON-LD : `Organization`, `LocalBusiness`, `Service`, `FAQPage` (landing), `Article` (blog)
  - Sitemap.xml généré au build
- **Blog** : chaque article prerender-é individuellement avec son contenu depuis WP

## Email transactionnel : Brevo

### Décisions

- **Brevo** (ex-Sendinblue) — gratuit 300 emails/jour = largement suffisant pour un démarrage
- Envoi via API HTTP (pas SMTP) pour pouvoir tracker l'événement
- Domaine d'envoi : `contact@cphpaca.fr` (à configurer SPF + DKIM + DMARC sur o2switch)
- **Pas Mailchimp** (plus cher, overkill pour du transactionnel)

### Emails à coder

| Template | Déclencheur | Variables |
|---|---|---|
| `reservation-confirmation` | Paiement réussi OU choix "à l'intervention" | {nom, date, creneau, ville, montant, numReservation, loginEmail, loginPassword} |
| `rappel-veille` | CRON J-1 à 18h | {nom, date, creneau, couvreurNom, tel} |
| `rapport-disponible` | Intervention terminée + photos uploadées | {nom, urlRapport, espaceClientUrl} |
| `devis-couverture` | Observation warning → génération devis | {nom, prestation, montant, urlSignature} |
| `parrainage-converti` | Filleul → intervention terminée | {parrainNom, filleulNom, montant: 30} |

Tous en MJML + variables Handlebars.

## SMS : Brevo SMS (option)

### Décisions

- **Coût réel** : ~0,06 €/SMS FR (Brevo, Twilio, OVH — similaires)
- Pas de SMS "gratuit" transactionnel possible en France légalement
- **Proposé au client en option** (case à cocher, actuellement marquée "Offert" mais en prod coûte 0,06 € à l'entreprise)
- À activer SI le taux de no-show dépasse 15% (SMS = meilleure ouverture)

### SMS à coder (si activé)

| Template | Déclencheur |
|---|---|
| `reservation-sms` | Post-paiement — court |
| `rappel-2h` | J-0, 2h avant créneau |

## Store de session / base de données

### Décisions (à prendre)

Deux pistes en prod :

**Option A : Node + SQLite/Postgres** (recommandé)
- Backend Node.js sur o2switch (ou VPS)
- Base SQLite pour démarrer, migrable Postgres
- API REST custom ou tRPC
- Auth : sessions cookies ou JWT

**Option B : WordPress comme backend complet**
- Utilise déjà WP pour le blog → étendre pour les données custom (clients, interventions)
- Custom Post Types + ACF pour chaque entité
- API via WP REST
- ⚠️ Risque : WP pas fait pour ce genre de data relationnelle

**Ma reco : Option A** — WordPress reste cantonné au blog/contenu.

## RGPD / Cookies

### Obligations

- Bandeau cookies conforme CNIL (consent explicit avant tracking)
- Pas de Google Analytics sans consent (préférer **Plausible** ou **Matomo self-hosted**)
- Registre des traitements : formulaires = collecte PII
- Droit à l'oubli : endpoint admin pour supprimer un client + ses données
- Mention d'information dans chaque formulaire (texte RGPD court)

## Google / SEO / Performance

- **Google Business Profile** (ex My Business) : créer une fiche "CPH Solar Aubagne"
- **Schema LocalBusiness** avec les 6 départements PACA listés en `areaServed`
- **Core Web Vitals** : viser LCP <2.5s, CLS <0.1 → prerender HTML + images optimisées (webp)
- **robots.txt** : disallow `/admin/`, `/client/`, `/couvreur/`, `/api/`
