import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
import SkipLink from './components/SkipLink'

// Pages publiques : eager (visiteurs SEO + Lighthouse)
import Landing from './pages/Landing'
import Login from './pages/Login'
import MotDePasseOublie from './pages/MotDePasseOublie'
import Formulaire from './pages/Formulaire'
import Reservation from './pages/Reservation'
import Paiement from './pages/Paiement'
import Confirmation from './pages/Confirmation'
import Blog from './pages/Blog'
import BlogArticle from './pages/BlogArticle'
import MentionsLegales from './pages/legal/MentionsLegales'
import CGV from './pages/legal/CGV'
import Confidentialite from './pages/legal/Confidentialite'
import NotFound from './pages/NotFound'

// Espaces privés : lazy (uniquement chargés quand l'utilisateur s'y rend)
const ClientDashboard = lazy(() => import('./pages/client/Dashboard'))
const ClientHome = lazy(() => import('./pages/client/ClientHome'))
const ClientIntervention = lazy(() => import('./pages/client/ClientIntervention'))
const ClientPhotos = lazy(() => import('./pages/client/ClientPhotos'))
const ClientRapport = lazy(() => import('./pages/client/ClientRapport'))
const ClientRecommander = lazy(() => import('./pages/client/ClientRecommander'))
const ClientCompte = lazy(() => import('./pages/client/ClientCompte'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminHome = lazy(() => import('./pages/admin/AdminHome'))
const AdminPlanning = lazy(() => import('./pages/admin/AdminPlanning'))
const AdminDemandes = lazy(() => import('./pages/admin/AdminDemandes'))
const AdminClients = lazy(() => import('./pages/admin/AdminClients'))
const AdminCouvreurs = lazy(() => import('./pages/admin/AdminCouvreurs'))
const AdminParrainages = lazy(() => import('./pages/admin/AdminParrainages'))
const AdminProspection = lazy(() => import('./pages/admin/AdminProspection'))
const AdminParametres = lazy(() => import('./pages/admin/AdminParametres'))
const CouvreurApp = lazy(() => import('./pages/couvreur/CouvreurApp'))
const ProspectionApp = lazy(() => import('./pages/prospection/ProspectionApp'))

function LazyFallback() {
  return (
    <div className="lazy-fallback" role="status" aria-live="polite">
      <div className="lazy-fallback-spinner" />
      <p>Chargement&hellip;</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SkipLink />
      <ScrollToTop />
      <CookieConsent />
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/devis" element={<Formulaire />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/paiement" element={<Paiement />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/confidentialite" element={<Confidentialite />} />

          {/* Espace Client */}
          <Route path="/client" element={<ClientDashboard />}>
            <Route index element={<ClientHome />} />
            <Route path="intervention" element={<ClientIntervention />} />
            <Route path="photos" element={<ClientPhotos />} />
            <Route path="rapport" element={<ClientRapport />} />
            <Route path="recommander" element={<ClientRecommander />} />
            <Route path="compte" element={<ClientCompte />} />
          </Route>

          {/* Espace Admin */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminHome />} />
            <Route path="demandes" element={<AdminDemandes />} />
            <Route path="planning" element={<AdminPlanning />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="couvreurs" element={<AdminCouvreurs />} />
            <Route path="parrainages" element={<AdminParrainages />} />
            <Route path="prospection" element={<AdminProspection />} />
            <Route path="parametres" element={<AdminParametres />} />
          </Route>

          {/* Espace Prospection */}
          <Route path="/prospection" element={<ProspectionApp />} />

          {/* Espace Couvreur */}
          <Route path="/couvreur" element={<CouvreurApp />} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
