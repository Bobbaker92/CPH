import { useParams, Link } from 'react-router-dom'
import { Shield, Calendar, Clock, ArrowLeft, BookOpen, User, Phone, Check, ArrowRight, Sun } from 'lucide-react'
import useSeo from '../lib/useSeo'
import useJsonLd from '../lib/useJsonLd'
import BlogShareButtons from '../components/BlogShareButtons'

const SITE = 'https://cphpaca.fr'

const ARTICLES = {
  'pourquoi-nettoyer-panneaux-solaires': {
    titre: 'Pourquoi nettoyer vos panneaux solaires en PACA\u00A0?',
    date: '10 avril 2026',
    temps: '5 min',
    categorie: 'Entretien',
    contenu: [
      { type: 'p', text: 'La r\u00E9gion Provence-Alpes-C\u00F4te d\u2019Azur b\u00E9n\u00E9ficie d\u2019un ensoleillement exceptionnel avec plus de 2\u00A0600 heures de soleil par an. C\u2019est ce qui rend l\u2019installation de panneaux solaires si rentable ici. Mais cet avantage a un revers\u00A0: la poussi\u00E8re, le pollen et la pollution.' },
      { type: 'h2', text: 'Les ennemis de vos panneaux en PACA' },
      { type: 'p', text: 'Le climat m\u00E9diterran\u00E9en g\u00E9n\u00E8re des conditions sp\u00E9cifiques qui encrassent vos panneaux plus rapidement que dans d\u2019autres r\u00E9gions\u00A0:' },
      { type: 'ul', items: [
        'Poussi\u00E8re et sable\u00A0: les \u00E9pisodes de sirocco d\u00E9posent une fine couche de particules sahariennes',
        'Pollen\u00A0: de f\u00E9vrier \u00E0 juin, le pollen de pin, cypr\u00E8s et olivier recouvre toutes les surfaces',
        'Pollution atmosph\u00E9rique\u00A0: les zones urbaines (Marseille, Toulon) ajoutent des d\u00E9p\u00F4ts de micro-particules',
        'Fientes d\u2019oiseaux\u00A0: les go\u00E9lands sur le littoral, les pigeons en ville',
        'R\u00E9sine de pin\u00A0: si votre maison est entour\u00E9e de pins, la r\u00E9sine cr\u00E9e un film collant difficile \u00E0 enlever',
      ]},
      { type: 'cta' },
      { type: 'h2', text: 'L\u2019impact sur votre production' },
      { type: 'p', text: 'Un panneau encras\u00E9 peut perdre entre 5% et 20% de rendement selon le niveau de salet\u00E9. Sur une installation 6\u00A0kWc typique en PACA, cela repr\u00E9sente entre 200 et 400\u00A0\u20AC de production perdue par an.' },
      { type: 'p', text: 'Les cellules photovolta\u00EFques fonctionnent de mani\u00E8re optimale quand la surface vitr\u00E9e re\u00E7oit le maximum de lumi\u00E8re. M\u00EAme une fine couche de poussi\u00E8re, invisible \u00E0 l\u2019\u0153il nu, suffit \u00E0 r\u00E9duire significativement la production.' },
      { type: 'h2', text: 'Quand faire nettoyer vos panneaux\u00A0?' },
      { type: 'p', text: 'En PACA, nous recommandons un nettoyage\u00A0:' },
      { type: 'ul', items: [
        'Au printemps (avril-mai)\u00A0: apr\u00E8s la saison des pollens',
        'En automne (septembre-octobre)\u00A0: apr\u00E8s la poussi\u00E8re estivale',
      ]},
      { type: 'p', text: 'Un \u00E0 deux nettoyages par an suffisent pour maintenir un rendement optimal.' },
      { type: 'h2', text: 'Pourquoi faire appel \u00E0 un professionnel\u00A0?' },
      { type: 'p', text: 'Nettoyer soi-m\u00EAme ses panneaux comporte des risques\u00A0: chute en toiture, rayure des panneaux avec des produits inadapt\u00E9s, ou simple inefficacit\u00E9. Un couvreur professionnel intervient en s\u00E9curit\u00E9, utilise de l\u2019eau pure d\u00E9min\u00E9ralis\u00E9e, et profite de sa pr\u00E9sence sur le toit pour v\u00E9rifier l\u2019\u00E9tat de votre couverture.' },
    ],
  },
  'frequence-nettoyage-panneaux-solaires': {
    titre: '\u00C0 quelle fr\u00E9quence nettoyer ses panneaux solaires\u00A0?',
    date: '5 avril 2026',
    temps: '4 min',
    categorie: 'Conseils',
    contenu: [
      { type: 'p', text: 'La fr\u00E9quence id\u00E9ale de nettoyage d\u00E9pend principalement de votre environnement. En r\u00E9gion PACA, le climat sec et ensoleill\u00E9 favorise l\u2019accumulation de poussi\u00E8re et de pollen sur vos panneaux.' },
      { type: 'h2', text: 'La r\u00E8gle g\u00E9n\u00E9rale' },
      { type: 'p', text: 'Pour la plupart des installations r\u00E9sidentielles en PACA, un nettoyage annuel au printemps suffit. Si votre maison est situ\u00E9e dans un environnement particuli\u00E8rement expos\u00E9, deux passages par an sont recommand\u00E9s.' },
      { type: 'cta' },
      { type: 'h2', text: 'Les facteurs qui augmentent la fr\u00E9quence' },
      { type: 'ul', items: [
        'Proximit\u00E9 d\u2019une route \u00E0 fort trafic',
        'Zone agricole ou industrielle',
        'Pr\u00E9sence d\u2019arbres au-dessus du toit (pins, ch\u00EAnes)',
        'Bord de mer (sel, go\u00E9lands)',
        'Faible inclinaison du toit (les poussi\u00E8res stagnent)',
      ]},
    ],
  },
  'perte-rendement-panneaux-sales': {
    titre: 'Panneaux solaires sales\u00A0: combien perdez-vous vraiment\u00A0?',
    date: '28 mars 2026',
    temps: '6 min',
    categorie: 'Rendement',
    contenu: [
      { type: 'p', text: 'Quand vous avez investi dans des panneaux solaires, c\u2019\u00E9tait pour produire de l\u2019\u00E9lectricit\u00E9 et r\u00E9duire vos factures. Mais saviez-vous qu\u2019un panneau encrass\u00E9 peut perdre jusqu\u2019\u00E0 20\u00A0% de rendement\u00A0? Sur une installation de 6\u00A0kWc en r\u00E9gion PACA, cela repr\u00E9sente 200 \u00E0 400\u00A0\u20AC d\u2019\u00E9lectricit\u00E9 perdus chaque ann\u00E9e.' },
      { type: 'h2', text: 'D\u2019o\u00F9 viennent ces pertes\u00A0?' },
      { type: 'p', text: 'Le principe d\u2019un panneau photovolta\u00EFque est simple\u00A0: les rayons du soleil traversent la vitre pour atteindre les cellules photovolta\u00EFques. Toute couche d\u00E9pos\u00E9e \u00E0 la surface r\u00E9duit la quantit\u00E9 de lumi\u00E8re re\u00E7ue \u2014 et donc l\u2019\u00E9nergie produite.' },
      { type: 'h2', text: 'Les chiffres r\u00E9els selon le niveau de salet\u00E9' },
      { type: 'ul', items: [
        'L\u00E9g\u00E8re salet\u00E9 (poussi\u00E8re fine, pollution urbaine)\u00A0: 5 \u00E0 8\u00A0% de perte',
        'Salet\u00E9 mod\u00E9r\u00E9e (pollen, particules sahariennes)\u00A0: 10 \u00E0 15\u00A0%',
        'Salet\u00E9 importante (fientes, r\u00E9sine, lichens)\u00A0: 20 \u00E0 30\u00A0%',
        'Cas extr\u00EAmes (panneaux jamais nettoy\u00E9s en bord de mer)\u00A0: jusqu\u2019\u00E0 40\u00A0% de perte',
      ]},
      { type: 'cta' },
      { type: 'h2', text: 'Combien \u00E7a co\u00FBte sur 10\u00A0ans\u00A0?' },
      { type: 'p', text: 'Prenons une installation typique en PACA\u00A0: 6\u00A0kWc, productible annuel d\u2019environ 9\u00A0500\u00A0kWh. Au tarif moyen de 0,21\u00A0\u20AC/kWh autoconsomm\u00E9 \u00E9conomis\u00E9, c\u2019est presque 2\u00A0000\u00A0\u20AC d\u2019\u00E9lectricit\u00E9 produite par an.' },
      { type: 'p', text: 'Si vos panneaux perdent 15\u00A0% de rendement \u00E0 cause de l\u2019encrassement, vous perdez 300\u00A0\u20AC chaque ann\u00E9e. Sur 10\u00A0ans sans nettoyage\u00A0: 3\u00A0000\u00A0\u20AC envol\u00E9s. Soit 15 \u00E0 20\u00A0nettoyages professionnels qui auraient \u00E9vit\u00E9 ces pertes.' },
      { type: 'h2', text: 'Comment savoir si vos panneaux sont encrass\u00E9s\u00A0?' },
      { type: 'p', text: 'Si vous suivez votre production via une application (Enphase, SolarEdge, MySolarEdge\u2026), comparez vos kWh produits ce mois-ci avec ceux du m\u00EAme mois l\u2019an dernier. Une baisse inexpliqu\u00E9e de plus de 10\u00A0% est un signal d\u2019alerte.' },
      { type: 'p', text: 'Sans monitoring, le rep\u00E8re visuel reste le plus fiable\u00A0: si vos panneaux sont visiblement gris\u00E2tres ou si vous voyez des tra\u00EEn\u00E9es, il est temps d\u2019intervenir.' },
      { type: 'h2', text: 'Le retour sur investissement d\u2019un nettoyage' },
      { type: 'p', text: 'Un nettoyage professionnel co\u00FBte 199\u00A0\u20AC TTC chez CPH. Si votre installation perdait ne serait-ce que 10\u00A0% de production, le nettoyage est rembours\u00E9 par la production r\u00E9cup\u00E9r\u00E9e en moins d\u2019un an. Apr\u00E8s, c\u2019est du gain net.' },
    ],
  },
  'nettoyage-panneaux-solaires-marseille': {
    titre: 'Nettoyage de panneaux solaires \u00E0 Marseille\u00A0: ce qu\u2019il faut savoir',
    date: '20 mars 2026',
    temps: '5 min',
    categorie: 'Local',
    contenu: [
      { type: 'p', text: 'Marseille est l\u2019une des villes les plus ensoleill\u00E9es de France\u00A0: pr\u00E8s de 2\u00A0850\u00A0heures de soleil par an. C\u2019est un terrain id\u00E9al pour le photovolta\u00EFque. Mais c\u2019est aussi une ville o\u00F9 vos panneaux s\u2019encrassent particuli\u00E8rement vite. On vous explique pourquoi.' },
      { type: 'h2', text: 'Marseille, championne de l\u2019encrassement' },
      { type: 'p', text: 'Trois facteurs combin\u00E9s rendent les panneaux marseillais plus expos\u00E9s qu\u2019ailleurs en France\u00A0:' },
      { type: 'ul', items: [
        'La pollution atmosph\u00E9rique\u00A0: d\u00E9p\u00F4ts de particules fines venant du Vieux-Port, de l\u2019autoroute A50, et des navires de croisi\u00E8re',
        'Le sirocco\u00A0: ce vent du sud apporte r\u00E9guli\u00E8rement des poussi\u00E8res sahariennes qui se d\u00E9posent en fine couche orang\u00E9e',
        'L\u2019air marin\u00A0: pour les quartiers du littoral (8e, 7e, Estaque, Pointe Rouge), le sel marin colle aux vitres et fixe les autres salet\u00E9s',
      ]},
      { type: 'cta' },
      { type: 'h2', text: 'Quels quartiers de Marseille sont les plus concern\u00E9s\u00A0?' },
      { type: 'p', text: 'Tous les arrondissements ont leur lot de salet\u00E9, mais certains demandent une attention particuli\u00E8re\u00A0:' },
      { type: 'ul', items: [
        '13002 (Joliette), 13003 (Belle de Mai)\u00A0: pollution urbaine forte',
        '13007, 13008 (littoral, Endoume, Bompard)\u00A0: air marin + go\u00E9lands',
        '13009 (Mazargues, Sainte-Marguerite)\u00A0: pollens de pins parasols',
        '13013 (Saint-Just, Malpass\u00E9)\u00A0: proximit\u00E9 A7 et A507',
      ]},
      { type: 'h2', text: 'La fr\u00E9quence recommand\u00E9e \u00E0 Marseille' },
      { type: 'p', text: 'Pour la majorit\u00E9 des installations marseillaises, nous recommandons un nettoyage \u00E0 deux p\u00E9riodes\u00A0: au printemps (apr\u00E8s la saison des pollens, vers avril) et \u00E0 l\u2019automne (apr\u00E8s les \u00E9pisodes secs estivaux, vers octobre).' },
      { type: 'p', text: 'Pour les maisons en bord de mer ou \u00E0 c\u00F4t\u00E9 d\u2019axes routiers majeurs, un troisi\u00E8me passage en plein \u00E9t\u00E9 peut faire sens si vous constatez une baisse de rendement.' },
      { type: 'h2', text: 'Faut-il faire appel \u00E0 un couvreur professionnel\u00A0?' },
      { type: 'p', text: 'Travailler en hauteur sur une toiture marseillaise typique (tuiles canal, pente moyenne) sans \u00E9quipement professionnel est dangereux. Sans compter le risque de rayer vos panneaux avec un produit inadapt\u00E9 ou de provoquer une infiltration en marchant n\u2019importe o\u00F9.' },
      { type: 'p', text: 'CPH intervient sur tout Marseille et sa couronne avec des couvreurs certifi\u00E9s, \u00E9quip\u00E9s en s\u00E9curit\u00E9 antichute, et utilisant uniquement de l\u2019eau d\u00E9min\u00E9ralis\u00E9e (z\u00E9ro produit chimique, z\u00E9ro trace au s\u00E9chage).' },
    ],
  },
  'entretien-toiture-panneaux-photovoltaiques': {
    titre: 'Toiture et panneaux photovolta\u00EFques\u00A0: l\u2019entretien \u00E0 ne pas n\u00E9gliger',
    date: '15 mars 2026',
    temps: '7 min',
    categorie: 'Toiture',
    contenu: [
      { type: 'p', text: 'On parle souvent du nettoyage des panneaux solaires, mais on oublie qu\u2019ils sont fix\u00E9s sur une toiture qui m\u00E9rite la m\u00EAme attention. Une couverture en mauvais \u00E9tat peut compromettre toute votre installation\u00A0: infiltrations, panneaux qui se descellent, garantie d\u00E9cennale annul\u00E9e\u2026 Voici ce qu\u2019un couvreur professionnel v\u00E9rifie syst\u00E9matiquement.' },
      { type: 'h2', text: 'Les 4\u00A0points de v\u00E9rification syst\u00E9matiques' },
      { type: 'p', text: 'Lors de chaque intervention CPH, le couvreur profite de sa pr\u00E9sence sur le toit pour inspecter\u00A0:' },
      { type: 'ul', items: [
        '\u00C9tat des fixations des panneaux\u00A0: vis desserr\u00E9es, joints d\u00E9grad\u00E9s, rails l\u00E9g\u00E8rement d\u00E9plac\u00E9s par les vents forts',
        'Tuiles environnantes\u00A0: cass\u00E9es, d\u00E9plac\u00E9es, fissur\u00E9es par le gel ou les chocs (branches, gr\u00EAle)',
        '\u00C9tanch\u00E9it\u00E9 autour des perforations\u00A0: l\u00E0 o\u00F9 les fixations traversent la couverture, c\u2019est le point critique pour les infiltrations',
        '\u00C9tat du fa\u00EEtage et des solins\u00A0: souvent oubli\u00E9s, ce sont les premiers points faibles d\u2019une toiture vieillissante',
      ]},
      { type: 'cta' },
      { type: 'h2', text: 'Pourquoi un couvreur et pas un nettoyeur classique\u00A0?' },
      { type: 'p', text: 'C\u2019est exactement le c\u0153ur de notre approche. Une entreprise de nettoyage classique sait laver des panneaux \u2014 mais elle ne saura pas vous dire si une tuile est sur le point de tomber, ni rep\u00E9rer un d\u00E9but d\u2019infiltration sous un solin.' },
      { type: 'p', text: 'Un couvreur, lui, conna\u00EEt votre toit. Il identifie les signes faibles avant qu\u2019ils ne deviennent des sinistres co\u00FBteux. Et si une r\u00E9paration mineure peut \u00EAtre faite sur place, c\u2019est inclus.' },
      { type: 'h2', text: 'Les sinistres \u00E9vit\u00E9s en pratique' },
      { type: 'p', text: 'Sur 100\u00A0interventions CPH en 2025, voici ce qu\u2019on a rep\u00E9r\u00E9 chez nos clients sans qu\u2019ils ne le sachent\u00A0:' },
      { type: 'ul', items: [
        '23\u00A0toitures avec une ou plusieurs tuiles cass\u00E9es ou d\u00E9plac\u00E9es',
        '11\u00A0d\u00E9buts d\u2019infiltration au niveau d\u2019une fixation panneau',
        '8\u00A0fa\u00EEtages descell\u00E9s par les vents (mistral)',
        '4\u00A0cas de mousses qui auraient soulev\u00E9 les tuiles sous 2\u00A0ans',
      ]},
      { type: 'p', text: '\u00C0 chaque fois, le co\u00FBt de la r\u00E9paration imm\u00E9diate \u00E9tait inf\u00E9rieur \u00E0 100\u00A0\u20AC. Le co\u00FBt d\u2019une r\u00E9paration apr\u00E8s d\u00E9g\u00E2t des eaux\u00A0? 2\u00A0000 \u00E0 8\u00A0000\u00A0\u20AC.' },
      { type: 'h2', text: 'Le rapport d\u2019inspection inclus' },
      { type: 'p', text: 'Apr\u00E8s chaque intervention CPH, vous recevez un rapport synth\u00E9tique avec photos avant/apr\u00E8s du nettoyage et un \u00E9tat de votre toiture. Si nous d\u00E9tectons quelque chose qui m\u00E9rite r\u00E9paration, vous le savez avant de descendre du toit.' },
    ],
  },
  'prix-nettoyage-panneaux-solaires-2026': {
    titre: 'Prix du nettoyage de panneaux solaires en 2026',
    date: '8 mars 2026',
    temps: '5 min',
    categorie: 'Tarifs',
    contenu: [
      { type: 'p', text: 'Avant de vous engager, vous voulez probablement savoir combien co\u00FBte un nettoyage de panneaux solaires. La fourchette de prix sur le march\u00E9 est large\u00A0: de 80\u00A0\u20AC pour un nettoyeur ind\u00E9pendant \u00E0 plus de 500\u00A0\u20AC pour certaines entreprises. Voici les rep\u00E8res pour faire le bon choix sans vous faire avoir.' },
      { type: 'h2', text: 'Les 3\u00A0niveaux de prix du march\u00E9' },
      { type: 'p', text: 'On peut classer les offres en trois cat\u00E9gories\u00A0:' },
      { type: 'ul', items: [
        'Entr\u00E9e de gamme (80 \u00E0 130\u00A0\u20AC)\u00A0: nettoyeur ind\u00E9pendant, sans assurance d\u00E9cennale, souvent \u00E0 l\u2019eau du r\u00E9seau (laisse des traces) et sans inspection toiture',
        'Milieu de gamme (150 \u00E0 250\u00A0\u20AC)\u00A0: entreprise sp\u00E9cialis\u00E9e en nettoyage, avec assurance, eau d\u00E9min\u00E9ralis\u00E9e, mais sans expertise toiture',
        'Haut de gamme (300 \u00E0 500\u00A0\u20AC)\u00A0: couvreur sp\u00E9cialis\u00E9, inspection compl\u00E8te incluse, rapport d\u00E9taill\u00E9, garantie d\u00E9cennale',
      ]},
      { type: 'cta' },
      { type: 'h2', text: 'Le positionnement CPH\u00A0: 199\u00A0\u20AC TTC' },
      { type: 'p', text: 'Notre tarif standard est de 199\u00A0\u20AC TTC par intervention pour les installations jusqu\u2019\u00E0 24\u00A0panneaux. Au-del\u00E0, devis personnalis\u00E9.' },
      { type: 'p', text: 'Ce tarif inclut\u00A0:' },
      { type: 'ul', items: [
        'D\u00E9placement partout en r\u00E9gion PACA (04, 05, 06, 13, 83, 84)',
        'Nettoyage complet \u00E0 l\u2019eau d\u00E9min\u00E9ralis\u00E9e (sans produit chimique)',
        'Inspection toiture sur les 4\u00A0points cl\u00E9s (fixations, tuiles, \u00E9tanch\u00E9it\u00E9, fa\u00EEtage)',
        'Rapport photo avant/apr\u00E8s envoy\u00E9 sous 24h',
        'Couverture par notre assurance d\u00E9cennale',
      ]},
      { type: 'h2', text: 'Le tarif r\u00E9duit \u00E0 179\u00A0\u20AC' },
      { type: 'p', text: 'Quand nous sommes d\u00E9j\u00E0 programm\u00E9s sur votre secteur un jour donn\u00E9, nous vous proposons un cr\u00E9neau \u00AB\u00A0recommand\u00E9\u00A0\u00BB \u00E0 179\u00A0\u20AC TTC. Vous \u00E9conomisez 20\u00A0\u20AC, et nous optimisons nos d\u00E9placements \u2014 tout le monde y gagne.' },
      { type: 'h2', text: 'Pourquoi pas moins cher\u00A0?' },
      { type: 'p', text: 'Pourrions-nous facturer 99\u00A0\u20AC\u00A0? Oui, en sacrifiant l\u2019eau d\u00E9min\u00E9ralis\u00E9e (qui co\u00FBte cher), l\u2019inspection toiture (qui prend du temps), et la garantie d\u00E9cennale (que tr\u00E8s peu d\u2019entreprises de nettoyage portent r\u00E9ellement). Nous avons fait le choix de ne pas baisser ce niveau de qualit\u00E9.' },
      { type: 'h2', text: 'Modalit\u00E9s de paiement' },
      { type: 'p', text: 'Vous pouvez payer en ligne par carte bancaire au moment de la r\u00E9servation, ou bien r\u00E9gler le couvreur \u00E0 la fin de l\u2019intervention par carte, ch\u00E8que ou esp\u00E8ces. Aucune avance n\u2019est exig\u00E9e.' },
    ],
  },
}

const DEFAULT = {
  titre: 'Article',
  date: 'Mars 2026',
  temps: '5 min',
  categorie: 'Conseils',
  contenu: [
    { type: 'p', text: 'Contenu \u00E0 venir. Cet article est en cours de r\u00E9daction.' },
  ],
}

function InlineCTA() {
  return (
    <div className="article-inline-cta">
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:12}}>
        <div style={{
          width:40, height:40, borderRadius:10, background:'var(--accent)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <Sun size={20} color="var(--primary)" />
        </div>
        <div>
          <strong style={{display:'block', fontSize:15, color:'var(--primary)'}}>
            {"Nettoyage par un couvreur pro \u2014 199\u00A0\u20AC"}
          </strong>
          <span style={{fontSize:12, color:'var(--gray-500)'}}>
            {"Inspection toiture incluse. Paiement \u00E0 l\u2019intervention."}
          </span>
        </div>
      </div>
      <Link to="/devis" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'12px 20px', fontSize:13}}>
        {"R\u00E9server mon nettoyage"} <ArrowRight size={14} />
      </Link>
    </div>
  )
}

export default function BlogArticle() {
  const { slug } = useParams()
  const article = ARTICLES[slug] || DEFAULT

  const firstPara = article.contenu?.find((b) => b.type === 'p')?.text || ''
  const seoDescription = firstPara.length > 160 ? `${firstPara.slice(0, 157)}...` : firstPara
  useSeo({
    title: article.titre,
    description: seoDescription || article.titre,
    path: `/blog/${slug}`,
  })

  // Breadcrumb JSON-LD : Accueil > Blog > Article
  useJsonLd(`breadcrumb-${slug}`, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 3, name: article.titre, item: `${SITE}/blog/${slug}` },
    ],
  })

  // Article JSON-LD : pour rich snippet article (date, auteur, titre)
  useJsonLd(`article-${slug}`, {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.titre,
    datePublished: article.date,
    author: { '@type': 'Organization', name: 'CPH Solar' },
    publisher: {
      '@type': 'Organization',
      name: 'CPH Solar',
      logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${slug}` },
    articleSection: article.categorie,
  })

  return (
    <div style={{minHeight:'100vh', background:'var(--white)'}}>
      {/* Navbar with conversion CTA */}
      <nav style={{
        background: 'var(--primary)', padding: '12px 0',
        borderBottom: '3px solid var(--accent)',
        position:'sticky', top:0, zIndex:100,
      }}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Link to="/" style={{display:'flex', alignItems:'center', gap: 8}}>
            <Shield size={18} color="var(--accent)" />
            <span style={{color:'white', fontWeight:700, fontSize:14}}>CPH</span>
            <span className="hide-mobile" style={{color:'rgba(255,255,255,0.4)', fontSize:12, marginLeft:4}}>Nettoyage solaire</span>
          </Link>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <a href="tel:0412160630" className="hide-mobile" style={{color:'var(--accent)', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6}}>
              <Phone size={14} /> 04 12 16 06 30
            </a>
            <Link to="/devis" className="btn btn-primary btn-sm" style={{padding:'8px 16px', fontSize:12}}>
              {"R\u00E9server \u2014 199\u00A0\u20AC"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Article layout with sidebar */}
      <div className="article-layout">
        <article className="article-main" id="main-content" tabIndex="-1">
          {/* Back */}
          <Link to="/blog" style={{
            display:'inline-flex', alignItems:'center', gap:6,
            fontSize:13, color:'var(--gray-500)', fontWeight:500, marginBottom:24,
          }}>
            <ArrowLeft size={14} /> Retour au blog
          </Link>

          {/* Meta */}
          <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap'}}>
            <span style={{
              fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5,
              color:'var(--accent-hover)', background:'var(--accent-light)',
              padding:'3px 10px', borderRadius:4,
            }}>
              {article.categorie}
            </span>
            <span style={{fontSize:12, color:'var(--gray-400)', display:'flex', alignItems:'center', gap:4}}>
              <Calendar size={11} /> {article.date}
            </span>
            <span style={{fontSize:12, color:'var(--gray-400)', display:'flex', alignItems:'center', gap:4}}>
              <Clock size={11} /> {article.temps}
            </span>
          </div>

          {/* Titre */}
          <h1 style={{fontSize:28, fontWeight:700, color:'var(--primary)', lineHeight:1.3, marginBottom:16}}>
            {article.titre}
          </h1>

          <BlogShareButtons slug={slug} title={article.titre} />

          {/* Teaser CTA (haut d'article) */}
          <div className="article-teaser-cta">
            <div>
              <strong>{"199\u00A0\u20AC \u2014 Intervention sous 15 jours"}</strong>
              <span>{"Nettoyage + inspection toiture + rapport photo"}</span>
            </div>
            <Link to="/devis" className="btn btn-primary btn-sm">
              {"Je r\u00E9serve"} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Contenu */}
          <div style={{lineHeight:1.8}}>
            {article.contenu.map((block, i) => {
              if (block.type === 'p') return (
                <p key={i} style={{fontSize:15, color:'var(--gray-700)', marginBottom:20}}>
                  {block.text}
                </p>
              )
              if (block.type === 'h2') return (
                <h2 key={i} style={{fontSize:20, fontWeight:700, color:'var(--primary)', marginTop:36, marginBottom:16}}>
                  {block.text}
                </h2>
              )
              if (block.type === 'ul') return (
                <ul key={i} style={{paddingLeft:24, marginBottom:20}}>
                  {block.items.map((item, j) => (
                    <li key={j} style={{fontSize:14, color:'var(--gray-600)', marginBottom:8, lineHeight:1.7}}>
                      {item}
                    </li>
                  ))}
                </ul>
              )
              if (block.type === 'cta') return <InlineCTA key={i} />
              return null
            })}
          </div>

          {/* CTA final */}
          <div className="article-final-cta">
            <div className="article-final-cta-inner">
              <div>
                <h3>{"Pr\u00EAt \u00E0 faire nettoyer vos panneaux ?"}</h3>
                <p>{"Intervention par un couvreur certifi\u00E9 Qualibat. Inspection toiture offerte. Rapport d\u00E9taill\u00E9."}</p>
                <div className="article-final-cta-features">
                  <span><Check size={14} /> 199&nbsp;&euro; TTC</span>
                  <span><Check size={14} /> Sous 15 jours</span>
                  <span><Check size={14} /> Paiement sur place</span>
                </div>
              </div>
              <Link to="/devis" className="btn btn-primary btn-lg" style={{whiteSpace:'nowrap'}}>
                {"R\u00E9server mon nettoyage"} <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Articles à lire ensuite */}
          {(() => {
            const others = Object.entries(ARTICLES)
              .filter(([s]) => s !== slug)
              .slice(0, 3)
            if (!others.length) return null
            return (
              <section className="related-articles">
                <h3>{"\u00C0 lire ensuite"}</h3>
                <div className="related-articles-grid">
                  {others.map(([s, a]) => (
                    <Link key={s} to={`/blog/${s}`} className="related-article-card">
                      <span className="related-article-cat">{a.categorie}</span>
                      <h4>{a.titre}</h4>
                      <span className="related-article-meta">
                        <Clock size={11} /> {a.temps}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })()}
        </article>

        {/* Sticky sidebar desktop */}
        <aside className="article-sidebar">
          <div className="sidebar-cta-card">
            <div className="sidebar-cta-icon">
              <Sun size={24} />
            </div>
            <h3>{"Nettoyage de vos panneaux"}</h3>
            <div className="sidebar-cta-price">
              <span className="price">{"199\u00A0\u20AC"}</span>
              <span className="price-label">TTC / intervention</span>
            </div>
            <ul className="sidebar-cta-features">
              <li><Check size={14} /> Nettoyage complet</li>
              <li><Check size={14} /> Inspection toiture</li>
              <li><Check size={14} /> Rapport photo</li>
              <li><Check size={14} /> Qualibat</li>
            </ul>
            <Link to="/devis" className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'14px', fontSize:14}}>
              {"R\u00E9server"} <ArrowRight size={14} />
            </Link>
            <a href="tel:0412160630" className="sidebar-cta-phone">
              <Phone size={14} /> 04 12 16 06 30
            </a>
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA bar */}
      <div className="mobile-sticky-cta">
        <div>
          <span className="mobile-sticky-price">{"199\u00A0\u20AC"}</span>
          <span className="mobile-sticky-label">TTC tout compris</span>
        </div>
        <Link to="/devis" className="btn btn-primary btn-sm">
          {"R\u00E9server"} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p style={{marginBottom:8}}><strong style={{color:'white'}}>{"Contr\u00F4le Provence Habitat"}</strong> {"\u2014 Entreprise de couverture"}</p>
          <p>168 rue du dirigeable, ZI Les Paluds, 13400 Aubagne</p>
          <p style={{marginTop:4}}>04 12 16 06 30 | contact@cphpaca.fr</p>
        </div>
      </footer>
    </div>
  )
}
