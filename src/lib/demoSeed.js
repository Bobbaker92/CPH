/**
 * Génère un set de données démo réalistes pour montrer le site à un
 * prospect en quelques clics. Injecte dans les 4 stores (demandes,
 * interventions, clients, parrainages) avec des dates récentes et des
 * cas variés (statuts différents, sources différentes, parrainages à
 * différents stades).
 *
 * Utilisation :
 *   import { applyDemoSeed } from '@/lib/demoSeed'
 *   applyDemoSeed()
 *   // → recharge la page pour voir les nouveaux mocks
 *
 * Implémentation : on écrit directement dans localStorage (clés des
 * stores) puis le caller reload la page. Pas d'appel à addDemande/
 * addClient/etc. car on veut des dates fixes et des IDs stables.
 */

const VILLES = [
  { nom: 'Marseille 13008', cp: '13008' },
  { nom: 'Aix-en-Provence', cp: '13100' },
  { nom: 'Aubagne', cp: '13400' },
  { nom: 'La Ciotat', cp: '13600' },
  { nom: 'Toulon', cp: '83000' },
  { nom: 'Hyères', cp: '83400' },
  { nom: 'Nice', cp: '06000' },
  { nom: 'Cannes', cp: '06400' },
  { nom: 'Avignon', cp: '84000' },
  { nom: 'Salon-de-Provence', cp: '13300' },
]

const DATA = {
  demandes: [
    { nom: 'Pierre Martin', tel: '06 12 34 56 78', email: 'p.martin@gmail.com', ville: 'Marseille 13008', adresse: '12 rue Paradis', panneaux: '10-16', tuile: 'romane', integration: 'surimposition', etage: 'plain-pied', dateRecu: 'Aujourd\'hui 09:42', statut: 'nouveau', source: 'Formulaire', notes: '' },
    { nom: 'Sophie Lambert', tel: '07 88 21 45 90', email: 'sophie.l@gmail.com', ville: 'Aix-en-Provence', adresse: '5 chemin des Pinsons', panneaux: '16-24', tuile: 'canal', integration: 'integre', etage: 'etage', dateRecu: 'Aujourd\'hui 10:15', statut: 'nouveau', source: 'Formulaire', notes: 'Panneaux intégrés, attention étanchéité' },
    { nom: 'Julien Roussel', tel: '06 22 11 00 77', email: 'j.roussel@laposte.net', ville: 'Toulon', adresse: '45 rue Anatole France', panneaux: '10-16', tuile: 'canal', integration: 'surimposition', etage: 'etage', dateRecu: 'Aujourd\'hui 11:30', statut: 'nouveau', source: 'Rappel demandé', notes: 'Dispo : matin. Source : bouton flottant landing.' },
    { nom: 'Carla Neves', tel: '07 01 23 45 67', email: 'carla.n@hotmail.fr', ville: 'Nice', adresse: '8 boulevard Gambetta', panneaux: '6-10', tuile: 'bac-acier', integration: 'surimposition', etage: 'plain-pied', dateRecu: 'Hier 14:08', statut: 'a-rappeler', source: 'Formulaire', notes: 'Pas de réponse au 1er appel' },
    { nom: 'Mathieu Gilles', tel: '07 44 55 66 77', email: 'mgilles@free.fr', ville: 'Aubagne', adresse: '3 allée des Oliviers', panneaux: '16-24', tuile: 'canal', integration: 'integre', etage: 'etage', dateRecu: 'Hier 16:12', statut: 'nouveau', source: 'Paiement abandonné', notes: 'Arrivé jusqu\'à la CB. Créneau choisi : 12 mai 10h-12h. N\'a pas finalisé.' },
    { nom: 'Isabelle Morel', tel: '06 77 44 22 11', email: 'imorel@yahoo.fr', ville: 'Cannes', adresse: '15 rue d\'Antibes', panneaux: '24+', tuile: 'plate', integration: 'unknown', etage: 'immeuble', dateRecu: 'Il y a 2 jours', statut: 'planifie', source: 'Téléphone', notes: 'RDV le 5 mai 8h-10h avec Karim' },
    { nom: 'Stéphane Bennani', tel: '06 45 78 12 03', email: 's.bennani@orange.fr', ville: 'Aubagne', adresse: '28 avenue de la Liberté', panneaux: '6-10', tuile: 'redland', integration: 'surimposition', etage: 'plain-pied', dateRecu: 'Il y a 3 jours', statut: 'planifie', source: 'Formulaire', notes: '' },
    { nom: 'Sabrina Cohen', tel: '06 01 02 03 04', email: 'scohen@yahoo.fr', ville: 'Aix-en-Provence', adresse: '—', panneaux: '10-16', tuile: '—', integration: 'unknown', etage: '—', dateRecu: 'Il y a 4 jours', statut: 'a-rappeler', source: 'Formulaire abandonné', notes: 'A rempli 3 étapes sur 5 puis quitté. Tel saisi à l\'étape 5.' },
    { nom: 'Laurent Dubois', tel: '06 99 88 77 66', email: 'l.dubois@gmail.com', ville: 'La Ciotat', adresse: '7 quai François Mitterrand', panneaux: '10-16', tuile: 'canal', integration: 'surimposition', etage: 'plain-pied', dateRecu: 'Il y a 5 jours', statut: 'refuse', source: 'Formulaire', notes: 'A choisi un autre prestataire' },
    { nom: 'Nathalie Garcia', tel: '07 33 44 55 66', email: 'n.garcia@hotmail.com', ville: 'Avignon', adresse: '22 cours Jean Jaurès', panneaux: '16-24', tuile: 'romane', integration: 'integre', etage: 'etage', dateRecu: 'Il y a 6 jours', statut: 'planifie', source: 'Formulaire', notes: 'Toiture en pente forte, prévoir équipement' },
  ],
  // 5 interventions futures + passées (couvreurEmail = karim@cphpaca.fr)
  interventions: [
    { date: '2026-05-05', creneau: '8h-10h', client: 'Isabelle Morel', tel: '06 77 44 22 11', ville: 'Cannes', adresse: '15 rue d\'Antibes', panneaux: '24+', tuile: 'plate', couvreurEmail: 'karim@cphpaca.fr', statut: 'planifie', notes: '' },
    { date: '2026-05-08', creneau: '10h-12h', client: 'Stéphane Bennani', tel: '06 45 78 12 03', ville: 'Aubagne', adresse: '28 avenue de la Liberté', panneaux: '6-10', tuile: 'redland', couvreurEmail: 'karim@cphpaca.fr', statut: 'planifie', notes: '' },
    { date: '2026-05-12', creneau: '14h-16h', client: 'Nathalie Garcia', tel: '07 33 44 55 66', ville: 'Avignon', adresse: '22 cours Jean Jaurès', panneaux: '16-24', tuile: 'romane', couvreurEmail: 'karim@cphpaca.fr', statut: 'planifie', notes: 'Toiture pente forte' },
    { date: '2026-04-22', creneau: '9h-11h', client: 'Marc Lefebvre', tel: '06 55 66 77 88', ville: 'Aix-en-Provence', adresse: '11 cours Mirabeau', panneaux: '10-16', tuile: 'canal', couvreurEmail: 'karim@cphpaca.fr', statut: 'terminee', notes: 'RAS' },
    { date: '2026-04-15', creneau: '8h-10h', client: 'Béatrice Roy', tel: '07 11 22 33 44', ville: 'Marseille 13008', adresse: '60 corniche Kennedy', panneaux: '6-10', tuile: 'tuile', couvreurEmail: 'karim@cphpaca.fr', statut: 'terminee', notes: '2 tuiles à signaler' },
  ],
  // 3 clients (les 2 derniers convertis + 1 du parrainage)
  clients: [
    { nom: 'Marc Lefebvre', tel: '06 55 66 77 88', email: 'm.lefebvre@gmail.com', ville: 'Aix-en-Provence', adresse: '11 cours Mirabeau' },
    { nom: 'Béatrice Roy', tel: '07 11 22 33 44', email: 'b.roy@free.fr', ville: 'Marseille 13008', adresse: '60 corniche Kennedy' },
    { nom: 'Isabelle Morel', tel: '06 77 44 22 11', email: 'imorel@yahoo.fr', ville: 'Cannes', adresse: '15 rue d\'Antibes' },
  ],
  parrainages: [
    { parrainNom: 'Marc Lefebvre', parrainTel: '06 55 66 77 88', inviteNom: 'Pierre Martin', inviteTel: '06 12 34 56 78', statut: 'inscrit', dateEnvoi: 'Il y a 5 jours', bonus: 30 },
    { parrainNom: 'Béatrice Roy', parrainTel: '07 11 22 33 44', inviteNom: 'Carla Neves', inviteTel: '07 01 23 45 67', statut: 'envoye', dateEnvoi: 'Il y a 2 jours', bonus: 30 },
  ],
}

function buildId() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function applyDemoSeed() {
  // Demandes : on écrit dans cph_demandes_v1 avec des UUIDs
  const demandes = DATA.demandes.map((d) => ({ ...d, id: buildId() }))
  localStorage.setItem('cph_demandes_v1', JSON.stringify(demandes))

  // Clients
  const clientsByTel = {}
  const clients = DATA.clients.map((c) => {
    const id = buildId()
    clientsByTel[c.tel] = id
    return { ...c, id }
  })
  localStorage.setItem('cph_clients_v1', JSON.stringify(clients))

  // Interventions : lier au clientId si possible
  const interventions = DATA.interventions.map((i) => ({
    ...i,
    id: buildId(),
    clientId: clientsByTel[i.tel] || null,
  }))
  localStorage.setItem('cph_interventions_v1', JSON.stringify(interventions))

  // Parrainages : lier au parrainClientId
  const parrainages = DATA.parrainages.map((p) => ({
    ...p,
    id: buildId(),
    parrainClientId: clientsByTel[p.parrainTel] || null,
    interventionId: null,
    dateConversion: p.statut === 'inscrit' ? 'Il y a 1 jour' : null,
  }))
  localStorage.setItem('cph_parrainages_v1', JSON.stringify(parrainages))

  // On vide les overrides (sinon des modifs de mocks restent visibles)
  for (const k of [
    'cph_demandes_overrides_v1',
    'cph_interventions_overrides_v1',
    'cph_clients_overrides_v1',
    'cph_parrainages_overrides_v1',
  ]) {
    localStorage.removeItem(k)
  }

  return {
    demandes: demandes.length,
    interventions: interventions.length,
    clients: clients.length,
    parrainages: parrainages.length,
  }
}
