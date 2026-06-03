import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import CustomsDeclarations from './pages/CustomsDeclarations'
import VatInvoices from './pages/VatInvoices'
import Matching from './pages/Matching'
import ManualMatching from './pages/ManualMatching'
import MatchingRules from './pages/MatchingRules'
import TaxRates from './pages/TaxRates'
import Declarations from './pages/Declarations'
import DeclarationDetail from './pages/DeclarationDetail'
import DeclarationProgress from './pages/DeclarationProgress'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents/customs" element={<CustomsDeclarations />} />
        <Route path="/documents/invoices" element={<VatInvoices />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/matching/manual" element={<ManualMatching />} />
        <Route path="/matching/rules" element={<MatchingRules />} />
        <Route path="/tax-rates" element={<TaxRates />} />
        <Route path="/declarations" element={<Declarations />} />
        <Route path="/declarations/:id" element={<DeclarationDetail />} />
        <Route path="/declarations/:id/progress" element={<DeclarationProgress />} />
      </Route>
    </Routes>
  )
}
