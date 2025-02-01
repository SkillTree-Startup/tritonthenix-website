import { Routes, Route } from 'react-router-dom';
import Schedule from './Schedule';
import { AdminPanel } from './AdminPanel';
import { PrivacyPolicy } from './PrivacyPolicy';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Schedule />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
};

export default AppRoutes; 