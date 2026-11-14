import { Route, Routes } from 'react-router';

import Layout from './components/Layout';
import NotFound from './components/NotFound';
import AppointmentPage from './features/appointments/AppointmentPage';
import BookingPage from './features/appointments/BookingPage';
import OwnersPage from './features/owners/OwnersPage';
import SchedulePage from './features/schedule/SchedulePage';
import VetsPage from './features/vets/VetsPage';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<SchedulePage />} />
      <Route path="appointments/new" element={<BookingPage />} />
      <Route path="appointments/:id" element={<AppointmentPage />} />
      <Route path="owners" element={<OwnersPage />} />
      <Route path="vets" element={<VetsPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
