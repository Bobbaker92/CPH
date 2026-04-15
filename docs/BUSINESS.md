# Règles métier — CPH Solar

## Identité

| Élément | Valeur |
|---|---|
| Nom commercial | **CPH Solar** |
| Entité juridique | Contrôle Provence Habitat (CPH) |
| Adresse | 168 rue du dirigeable, ZI Les Paluds, 13400 Aubagne |
| Téléphone affiché | 04 12 16 06 30 |
| Email | `contact@cphpaca.fr` (à activer sur domaine réel) |
| Certifications affichées | Qualibat, RGE, Décennale |
| Zone | **Région PACA** — départements 04, 05, 06, 13, 83, 84 |

## Offre

- **Service principal** : nettoyage de panneaux solaires
- **Inclus gratuitement** :
  - Inspection de toiture (faîtage, rives, tuiles, étanchéité)
  - Rapport photo sous 48h (photos avant/après + observations)
- **Upsell** : devis travaux couverture si anomalie détectée (faîtage, rives, hydrofuge, tuiles cassées…)

## Positionnement

> « Nous sommes des **couvreurs**, pas des auto-entrepreneurs avec une perche. »

Argument clé : compétence toiture = valeur ajoutée vs la concurrence "nettoyeurs purs".

## Tarification

| Cas | Prix TTC |
|---|---|
| Tarif standard | **199 €** |
| Créneau recommandé (jour où on intervient déjà dans le secteur) | **179 €** (-20 €) |
| Parrainage : filleul converti → parrain gagne | **30 €** sur prochaine intervention |

**Pas d'abonnement, pas de frais de déplacement, pas de supplément.**
Paiement soit maintenant (Stripe), soit à l'intervention (CB/espèces/chèque).

## Règles de planification (capacité journalière)

**Par couvreur, par jour :**

```
Max 3 chantiers standard
OU max 4 chantiers SI (toutes ≤10 panneaux) ET (toutes même secteur)
```

### Définitions

| Terme | Seuil |
|---|---|
| Petite installation | ≤ **10 panneaux** |
| Grosse installation | > 10 panneaux |
| Même secteur | `getSecteur(ville)` identique — on extrait le nom de ville sans code postal (ex: "Marseille 13008" → "Marseille") |

### Créneaux horaires standards

```
8h-10h
10h30-12h30
14h-16h
16h30-18h
```

Une intervention moyenne dure **~1h30 à 2h** selon taille.

### Pourquoi cette règle

Raison pratique : regrouper les interventions par secteur limite le temps de trajet.
Sur Marseille → Aubagne → Aix, un aller-retour mal optimisé = 2h perdues dans la journée.

## Notifications envoyées au client

Après paiement / réservation confirmée :

| Canal | Par défaut | Coût réel | Contenu |
|---|---|---|---|
| **Email** | ✅ Coché | Gratuit (Brevo 300/jour) | Confirmation + N° réservation + identifiants espace client |
| **SMS** | ☐ Optionnel | ~0,06 €/SMS | Idem en court |

## Obligations légales (à compléter avant prod)

Voir `project_legal_obligations` en memory (DGCCRF). Spécifique maquette solaire :
- Mentions légales complètes
- CGV accessibles (footer)
- Politique de confidentialité (RGPD, formulaires = collecte PII)
- Affichage du SIRET
- Affichage N° de décennale (pour Qualibat)
- Droit de rétractation 14 jours pour particuliers (vente à distance)

## Parrainage

- Lien unique par client : `https://cphpaca.fr/?parrain=<code>`
- Filleul → intervention complète → parrain reçoit **30 € de réduction** sur prochaine intervention
- Pas de plafond (en théorie — à confirmer avec Fares)
- Visibilité admin : voir `/admin/parrainages`

## Règle UX importante

**Capturer le lead à chaque étape** même sans réservation/paiement — bouton "Être rappelé" présent partout (modale `CallbackModal`). Voir `docs/FLOWS.md` section Capture de lead.
