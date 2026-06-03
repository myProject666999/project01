import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Samples from './pages/Samples';
import Customers from './pages/Customers';
import Mailings from './pages/Mailings';
import Feedbacks from './pages/Feedbacks';
import ROI from './pages/ROI';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="samples" element={<Samples />} />
        <Route path="customers" element={<Customers />} />
        <Route path="mailings" element={<Mailings />} />
        <Route path="feedbacks" element={<Feedbacks />} />
        <Route path="roi" element={<ROI />} />
      </Route>
    </Routes>
  );
}

export default App;
