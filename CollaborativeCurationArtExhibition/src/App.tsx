import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ExhibitionList from '@/pages/ExhibitionList';
import ExhibitionDetail from '@/pages/ExhibitionDetail';
import ArtistManagement from '@/pages/ArtistManagement';
import ArtworkManagement from '@/pages/ArtworkManagement';
import FloorPlanEditor from '@/pages/FloorPlanEditor';
import GuestManagement from '@/pages/GuestManagement';
import GuestCheckin from '@/pages/GuestCheckin';
import MediaManagement from '@/pages/MediaManagement';

function PrivateRoute() {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exhibitions" element={<ExhibitionList />} />
            <Route path="/exhibitions/:id" element={<ExhibitionDetail />}>
              <Route path="artists" element={<ArtistManagement />} />
              <Route path="artworks" element={<ArtworkManagement />} />
              <Route path="floorplan" element={<FloorPlanEditor />} />
              <Route path="guests" element={<GuestManagement />} />
              <Route path="guests/checkin" element={<GuestCheckin />} />
              <Route path="media" element={<MediaManagement />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
