import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import HsCodes from '@/pages/HsCodes';
import HsCodeMapping from '@/pages/HsCodeMapping';
import Declarations from '@/pages/Declarations';
import DeclarationDetail from '@/pages/DeclarationDetail';
import DeclarationNew from '@/pages/DeclarationNew';
import Tariff from '@/pages/Tariff';
import Archive from '@/pages/Archive';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/hs-codes" element={<HsCodes />} />
        <Route path="/hs-codes/mapping" element={<HsCodeMapping />} />
        <Route path="/declarations" element={<Declarations />} />
        <Route path="/declarations/new" element={<DeclarationNew />} />
        <Route path="/declarations/:id" element={<DeclarationDetail />} />
        <Route path="/tariff" element={<Tariff />} />
        <Route path="/archive" element={<Archive />} />
      </Route>
    </Routes>
  );
}
