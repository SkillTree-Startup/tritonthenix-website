import { Routes, Route } from 'react-router-dom';
import Schedule from './Schedule';
import { AdminPanel } from './AdminPanel';
import { PrivacyPolicy } from './PrivacyPolicy';
import Home from './Home';
import { Profile } from './Profile';

interface RoutesProps {
  userEmail?: string;
  userName?: string;
}

const AppRoutes = ({ userEmail, userName }: RoutesProps) => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/schedule/workouts" element={<Schedule defaultTab="Workouts" />} />
      <Route path="/schedule/events" element={<Schedule defaultTab="Events" />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/profile" element={<Profile email={userEmail} name={userName} />} />
    </Routes>
  );
};

export default AppRoutes; 