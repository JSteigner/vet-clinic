import { Route, Routes } from 'react-router';

import Layout from './components/Layout';
import NotFound from './components/NotFound';
import AppointmentPage from './features/appointments/AppointmentPage';
import BookingPage from './features/appointments/BookingPage';
import OwnerPage from './features/owners/OwnerPage';
import OwnersPage from './features/owners/OwnersPage';
import PetPage from './features/pets/PetPage';
import SchedulePage from './features/schedule/SchedulePage';
import VetPage from './features/vets/VetPage';
import VetsPage from './features/vets/VetsPage';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<SchedulePage />} />
      <Route path="appointments/new" element={<BookingPage />} />
      <Route path="appointments/:id" element={<AppointmentPage />} />
      <Route path="owners" element={<OwnersPage />} />
      <Route path="owners/:id" element={<OwnerPage />} />
      <Route path="pets/:id" element={<PetPage />} />
      <Route path="vets" element={<VetsPage />} />
      <Route path="vets/:id" element={<VetPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
