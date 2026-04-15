# Décisions UI / UX — journal des choix

> Pour éviter de revenir sur des choix déjà validés. Chaque décision a un pourquoi.

## Charte

| Variable | Valeur | Usage |
|---|---|---|
| `--primary` | `#0b304f` | Bleu marine — fonds sombres, nav, titres |
| `--primary-dark` | `#072034` | Hover du primary |
| `--primary-light` | `#1a4a6f` | Gradients sur primary |
| `--accent` | `#f7bb2e` | Jaune/doré — CTA, focus, badges "idéal" |
| `--accent-hover` | `#d19508` | Hover accent |
| `--accent-light` | `#fef3c7` | Backgrounds doux sur accent |
| `--green` | `#40bf40` | Succès, "idéal", confirmations |
| `--red` | `#f33` | Erreurs, demandes nouvelles |
| `--blue` | `#0b304f` | = primary, alias pour badges |

**Font** : Poppins (300 à 800) via Google Fonts dans `index.css`.

## Design tokens structurels

- Radius : `8px` (petit), `12px` (cards), `16px` (modales), `999px` (pills)
- Ombre cards : `0 2px 12px rgba(0,0,0,0.04)` (très subtile)
- Ombre modales : `0 20px 60px rgba(0,0,0,0.2)`
- Transitions : 120-180ms en général

## Décisions importantes

### 1. CSS vanille, pas Tailwind

**Pourquoi** : simple à exporter vers WP ou toute autre stack, zéro dépendance de build
côté CSS, charte stable. Les classes sont semantiques (`.admin-sidebar-link` vs `.bg-blue-500 p-3`).

### 2. Espace admin préfixé `.admin-*`

**Pourquoi** : isolation totale du CSS public. On peut refondre l'admin sans toucher
à la landing (SEO critique). Les pages client utilisent les classes legacy (`.sidebar`,
`.main-content`) de la première version, mais l'admin a été refait proprement après.

### 3. Tables → Cards sur mobile via `data-label`

**Pourquoi** : pas de scroll horizontal = expérience mobile utilisable en one-hand.
Le pattern `data-label` permet d'afficher le nom de la colonne à gauche de chaque
valeur dans la vue carte. Zéro JS.

```css
@media (max-width: 760px) {
  .admin-table thead { display: none; }
  .admin-table tbody tr { display: block; border-radius: 12px; }
  .admin-table tbody td::before { content: attr(data-label); }
}
```

### 4. Photos allégées (1 avant + 1 après)

**Pourquoi** : Fares a dit que demander 4 photos avant/après prend trop de place
visuellement pour peu de valeur ajoutée. Le couvreur choisit quand il juge nécessaire
de faire plus via "+ Ajouter une observation". Voir `src/pages/couvreur/CouvreurApp.jsx`.

### 5. Bouton "Être rappelé" partout (CallbackFab)

**Pourquoi** : Fares a demandé de capturer les leads même sans réservation/paiement.
Le FAB flottant jaune est le pattern le plus visible sans être intrusif. Le `context`
passé au backend permet de prioriser : "Paiement abandonné" = lead 🔥.

### 6. Couvreur unique pour l'instant (Karim Ziani)

**Pourquoi** : Fares démarre avec 1 couvreur. Le code est prêt multi-couvreurs (il
suffit d'étendre le tableau `COUVREURS` dans `AdminPlanning.jsx`) mais l'UI actuelle
masque le filtre et le dropdown d'assignation tant qu'il n'y en a qu'un.

### 7. Règle capacité 3/4 chantiers

**Pourquoi** : contrainte métier directe de Fares — si grosses installations ou zones
différentes, max 3. Si toutes petites et même secteur, 4 car courtes (1h-1h30 chacune).
Voir `AdminPlanning.jsx` fonction `computeCapacity`.

### 8. Modale add intervention avec scoring

**Pourquoi** : Fares voulait "voir le meilleur moment pour programmer selon le secteur".
L'algo score chaque jour des 21 prochains en tenant compte : secteurs déjà prévus,
capacité, petite vs grosse installation. Affiche Top 6 trié par pertinence.

### 9. Topbar admin : Fares + couvreur distinct

**Pourquoi** : Fares est l'admin (propriétaire entreprise), Karim est le couvreur
sur le terrain. Confusion possible si même nom affiché. Dans la topbar admin, on
affiche `FA` + "Fares / Administrateur".

### 10. Rappel capacité en bandeau dismissable

**Pourquoi** : la règle 3/4 est métier, pas évidente pour un nouvel utilisateur
de l'admin. Bandeau bleu au-dessus du Planning avec la règle écrite en toutes
lettres, fermable (préférence utilisateur).

## Patterns UI à réutiliser

- **ActionMenu (⋯)** : pour toute ligne de tableau. Voir `src/components/ActionMenu.jsx`.
- **CallbackModal** : pour capturer un lead vite fait n'importe où. Voir même dossier.
- **AddInterventionModal** : pattern "form gauche + recos droite". Pourrait être étendu
  pour "add devis", "add client" avec la même approche.
- **Drawer détail avec onglets** : voir `AdminClients.jsx` — pattern "clic ligne →
  ouvre drawer droite avec tabs Infos/Historique/Notes".
- **Capacity bar** : le pattern `used/max` + barre colorée selon status.
- **Empty state** : `<div class="empty-state"><Icon /> <p>Aucun...</p></div>` — uniforme.

## Choses à NE PAS refaire

- Ne pas ajouter de librairie UI (shadcn, MUI, Chakra) — on est cohérent en vanille
- Ne pas mélanger du Tailwind dans l'App.css — choix fait, on s'y tient
- Ne pas refaire de placeholder photo qui prend tout l'écran (cf. décision 4)
- Ne pas réintroduire de sidebar fixe pour l'espace client (mobile-first, bottom nav)
