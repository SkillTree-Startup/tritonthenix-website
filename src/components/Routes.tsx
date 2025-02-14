import { Routes, Route } from 'react-router-dom';
import Schedule from './Schedule';
import { AdminPanel } from './AdminPanel';
import { PrivacyPolicy } from './PrivacyPolicy';
import Home from './Home';
import { Profile } from './Profile';
import { UserData } from '../types/Event';

interface RoutesProps {
  userEmail: string;
  userName?: string;
  userData: UserData | null;
  handleSignOut: () => void;
}

const AppRoutes = ({ userEmail, userData, handleSignOut }: RoutesProps) => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/schedule/workouts" 
        element={<Schedule defaultTab="Workouts" userEmail={userEmail} />} 
      />
      <Route 
        path="/schedule/events" 
        element={<Schedule defaultTab="Events" userEmail={userEmail} />} 
      />
      <Route path="/admin" element={<AdminPanel userEmail={userEmail || ''} />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route 
        path="/profile" 
        element={
          <Profile 
            userData={userData}
            handleSignOut={handleSignOut}
          />
        } 
      />
    </Routes>
  );
};

export default AppRoutes; 