# Roadmap — De la maquette à la prod

> Ordre recommandé pour passer du stade maquette actuel à un produit en ligne.

## État actuel de la maquette

✅ Fait côté UI :
- Landing complète avec hero, trust bar, process, avant/après, témoignages, formulaire court, zones, CTA, footer
- Funnel `/devis` 5 étapes (panneaux, maison, toiture+pose, localisation, contact)
- Page `/reservation` avec calendrier et créneaux recommandés (-20 €)
- Page `/paiement` style Stripe (CB mock + "à l'intervention") + choix notif email/SMS
- Page `/confirmation` avec N° de résa + identifiants espace client
- Espace client : Dashboard + Intervention + Photos (comparatif 1 avant/1 après) + Rapport + Parrainage
- Espace admin complet : Dashboard + Demandes + Planning + Clients + Couvreurs + Parrainages
- App couvreur mobile
- Capture de leads via `CallbackModal` (Landing FAB, funnel, reservation, paiement)
- Modale "Nouvelle intervention" avec scoring intelligent par secteur
- Règle capacité 3/4 chantiers/jour intégrée au planning
- Blog + article (structure seulement — pas de contenu réel)

❌ Limitations maquette :
- Aucune donnée persistée (tout disparaît au refresh)
- Aucune communication entre pages (AdminDemandes et AdminPlanning ont leurs états séparés)
- Login fictif (3 comptes en dur dans `Login.jsx`)
- Aucun appel backend
- Pas de meta SEO / JSON-LD
- Pas de prerender

## Étapes prod (ordre recommandé)

### Phase 1 — Fondations techniques (1-2 jours)

1. **[Infra]** Acheter domaine `cphpaca.fr` + config DNS Cloudflare + hébergement o2switch
2. **[SEO]** Ajouter `react-helmet-async` + composants `<Seo>` par page publique
   - Meta (title, desc, og:, canonical)
   - JSON-LD (Organization, LocalBusiness, Service, FAQPage)
3. **[SEO]** Config `vite-plugin-prerender-spa` (ou `vite-ssg`) pour build HTML statique
4. **[SEO]** Génération sitemap.xml au build
5. **[Conformité]** Pages Mentions légales + CGV + Confidentialité (en dur d'abord)
6. **[Conformité]** Bandeau cookies conforme CNIL

### Phase 2 — Capture des leads (1 jour)

7. **[Backend léger]** Endpoint `POST /api/leads` (Node simple ou fonction PHP sur o2switch)
   - Stocke en DB + envoie email interne à `contact@cphpaca.fr`
8. **[Brancher]** `CallbackModal.onSubmit` → l'endpoint
9. **[Brancher]** `Formulaire.jsx` étape 5 → POST au submit même partiel
10. **[Auto-save]** localStorage + retry si offline

À ce stade : **tu captures déjà 100% des leads en prod**, même sans paiement/planning réels.

### Phase 3 — Store partagé + vrai login (1-2 jours)

11. **[State]** Créer Context React (`AppStateContext`) avec entités : `demandes`, `interventions`, `clients`, `couvreurs`, `parrainages`
    - Synchrone avec `localStorage` (dev) puis API (prod)
    - Résout le problème "les pages ne se parlent pas" de la maquette
12. **[Auth]** Remplacer `Login.jsx` mock par vraie auth
    - Option simple : auth par lien magique (IONOS SMTP envoie le lien login)
    - Option classique : bcrypt + JWT sessions
13. **[Backend]** Setup Node + Express + SQLite sur o2switch
    - Routes : `/api/auth`, `/api/demandes`, `/api/interventions`, `/api/clients`, etc.

### Phase 4 — Paiement réel (1 jour)

14. **[Stripe]** Compte Stripe + clés + webhook
15. **[Front]** Remplacer UI mock par `@stripe/stripe-js` + Stripe Checkout
16. **[Backend]** Endpoint `POST /api/checkout-session` qui crée la session Stripe
17. **[Backend]** Webhook `checkout.session.completed` → crée la réservation + envoie email

### Phase 5 — Emails (0,5 jour)

18. **[IONOS]** Pack IONOS Mail Pro + nom de domaine `cphpaca.fr` + SPF/DKIM/DMARC configurés
19. **[Templates]** Créer les 5 templates email (voir `INTEGRATIONS.md`)
20. **[Brancher]** Tous les emails trigger-é côté backend via SMTP IONOS authentifié

### Phase 6 — Blog WP (1 jour)

21. **[WP]** Installer WP dans `cphpaca.fr/wp/` sur o2switch
22. **[WP]** Config Yoast SEO + plugins de sécurité (Wordfence + 2FA)
23. **[Front]** Pages `/blog` et `/blog/:slug` consomment `/wp-json/wp/v2/posts`
24. **[SEO]** Prerender les articles WP au build (nightly build ou webhook WP → rebuild)
25. **[Contenu]** Écrire 5-10 premiers articles SEO locaux :
    - "Nettoyage panneaux solaires Marseille — pourquoi tous les 2 ans"
    - "Panneaux encrassés : combien perdez-vous en rendement ?"
    - "Inspection toiture : les 4 points vérifiés systématiquement"
    - etc.

### Phase 7 — Espace client + app couvreur (1-2 jours)

26. **[Photos]** Upload S3 (ou o2switch FTP) + CDN Cloudflare pour les photos
27. **[Rapport PDF]** Génération PDF côté backend (Puppeteer ou @react-pdf/renderer)
28. **[Couvreur]** PWA — app installable mobile avec offline support (cache last interventions)
29. **[Signature]** Canvas signature dans CouvreurApp → upload PDF

### Phase 8 — Optimisation et monitoring

30. **[Analytics]** Plausible self-hosted sur o2switch
31. **[Monitoring]** Logs d'erreurs (Sentry gratuit jusqu'à 5k events/mois)
32. **[Perf]** Audit Lighthouse + optimisation images
33. **[SEO]** Google Search Console + soumission sitemap
34. **[Trust]** Intégration vrais avis Google (widget) sur landing

## Checklist avant lancement prod

- [ ] Domaine configuré (SSL, DNS, email)
- [ ] Mentions légales + CGV + Confidentialité
- [ ] SIRET affiché
- [ ] Décennale + Qualibat (numéros réels)
- [ ] Droit de rétractation 14 jours mentionné
- [ ] Bandeau cookies CNIL
- [ ] Formulaires avec mention RGPD
- [ ] Robots.txt avec disallow espaces privés
- [ ] Sitemap.xml soumis à Google
- [ ] Stripe activé en live mode
- [ ] Webhooks Stripe testés
- [ ] Emails testés (spam-checker Mail-Tester)
- [ ] Tests login admin/couvreur/client
- [ ] Tests mobile sur Safari iOS + Chrome Android
- [ ] Sauvegarde automatique DB quotidienne
- [ ] Page 404 custom

## Ordre de priorité si budget/temps serré

Si Fares doit faire un MVP en 5 jours max :

1. Phase 1 (infra + SEO basique) — **obligatoire**
2. Phase 2 (capture leads) — **obligatoire**, sans ça le site ne rapporte rien
3. Phase 5 (emails) — pour répondre aux leads
4. Phase 6 (blog WP) en mode minimal — pour commencer à ranker
5. Phase 4 (Stripe) — peut attendre si on accepte "paiement à l'intervention" uniquement
6. Phase 3 (auth réelle) — peut attendre tant qu'il n'y a pas d'espace client utilisable
7. Phase 7 (espace client + app couvreur) — peut attendre la v2
