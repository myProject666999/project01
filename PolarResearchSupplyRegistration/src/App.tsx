import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Voyages from '@/pages/Voyages'
import VoyageDetail from '@/pages/VoyageDetail'
import Inventory from '@/pages/Inventory'
import InventoryDetail from '@/pages/InventoryDetail'
import Requisitions from '@/pages/Requisitions'
import Alerts from '@/pages/Alerts'
import DemandList from '@/pages/DemandList'
import Stocktaking from '@/pages/Stocktaking'
import StocktakingDetail from '@/pages/StocktakingDetail'
import Warehouses from '@/pages/Warehouses'
import Categories from '@/pages/Categories'
import Members from '@/pages/Members'
import Projects from '@/pages/Projects'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/voyages" element={<Voyages />} />
          <Route path="/voyages/:id" element={<VoyageDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:id" element={<InventoryDetail />} />
          <Route path="/requisitions" element={<Requisitions />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/demand" element={<DemandList />} />
          <Route path="/stocktaking" element={<Stocktaking />} />
          <Route path="/stocktaking/:id" element={<StocktakingDetail />} />
          <Route path="/base/warehouses" element={<Warehouses />} />
          <Route path="/base/categories" element={<Categories />} />
          <Route path="/base/members" element={<Members />} />
          <Route path="/base/projects" element={<Projects />} />
        </Route>
      </Routes>
    </Router>
  )
}
