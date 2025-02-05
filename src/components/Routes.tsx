import { Routes, Route } from 'react-router-dom';
import Schedule from './Schedule';
import { AdminPanel } from './AdminPanel';
import { PrivacyPolicy } from './PrivacyPolicy';
import Home from './Home';
import { Profile } from './Profile';

interface RoutesProps {
  userEmail?: string;
  userName?: string;
  tempAdminMode?: boolean;
  onTempAdminToggle?: () => void;
}

const AppRoutes = ({ userEmail, userName, tempAdminMode, onTempAdminToggle }: RoutesProps) => {
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
            email={userEmail} 
            name={userName}
            tempAdminMode={tempAdminMode}
            onTempAdminToggle={onTempAdminToggle}
          />
        } 
      />
    </Routes>
  );
};

export default AppRoutes; 