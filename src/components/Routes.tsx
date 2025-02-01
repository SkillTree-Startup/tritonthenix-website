import { Routes, Route } from 'react-router-dom';
import Schedule from './Schedule';
import { AdminPanel } from './AdminPanel';
import { PrivacyPolicy } from './PrivacyPolicy';
import Home from './Home';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/schedule/workouts" element={<Schedule defaultTab="Workouts" />} />
      <Route path="/schedule/events" element={<Schedule defaultTab="Events" />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  );
};

export default AppRoutes; 