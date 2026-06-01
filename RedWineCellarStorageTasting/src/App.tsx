import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import WineList from '@/pages/WineList';
import WineDetail from '@/pages/WineDetail';
import WineForm from '@/pages/WineForm';
import CellarView from '@/pages/CellarView';
import StockIn from '@/pages/StockIn';
import TastingList from '@/pages/TastingList';
import TastingForm from '@/pages/TastingForm';
import Alerts from '@/pages/Alerts';
import Valuation from '@/pages/Valuation';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/wines" element={<WineList />} />
        <Route path="/wines/:id" element={<WineDetail />} />
        <Route path="/wines/new" element={<WineForm />} />
        <Route path="/cellar" element={<CellarView />} />
        <Route path="/cellar/stock-in" element={<StockIn />} />
        <Route path="/tasting" element={<TastingList />} />
        <Route path="/tasting/new" element={<TastingForm />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/valuation" element={<Valuation />} />
      </Route>
    </Routes>
  );
}
