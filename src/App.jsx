import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import ScrollToTop from './components/ScrollToTop'
import Landing from './pages/Landing'
import Login from './pages/Login'
import MotDePasseOublie from './pages/MotDePasseOublie'
import Formulaire from './pages/Formulaire'
import Reservation from './pages/Reservation'
import Paiement from './pages/Paiement'
import Confirmation from './pages/Confirmation'
import Blog from './pages/Blog'
import BlogArticle from './pages/BlogArticle'
import ClientDashboard from './pages/client/Dashboard'
import ClientHome from './pages/client/ClientHome'
import ClientIntervention from './pages/client/ClientIntervention'
import ClientPhotos from './pages/client/ClientPhotos'
import ClientRapport from './pages/client/ClientRapport'
import ClientRecommander from './pages/client/ClientRecommander'
import ClientCompte from './pages/client/ClientCompte'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHome from './pages/admin/AdminHome'
import AdminPlanning from './pages/admin/AdminPlanning'
import AdminDemandes from './pages/admin/AdminDemandes'
import AdminClients from './pages/admin/AdminClients'
import AdminCouvreurs from './pages/admin/AdminCouvreurs'
import AdminParrainages from './pages/admin/AdminParrainages'
import AdminProspection from './pages/admin/AdminProspection'
import CouvreurApp from './pages/couvreur/CouvreurApp'
import ProspectionApp from './pages/prospection/ProspectionApp'
import MentionsLegales from './pages/legal/MentionsLegales'
import CGV from './pages/legal/CGV'
import Confidentialite from './pages/legal/Confidentialite'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
        </Route>

        {/* Espace Prospection */}
        <Route path="/prospection" element={<ProspectionApp />} />

        {/* Espace Couvreur */}
        <Route path="/couvreur" element={<CouvreurApp />} />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
