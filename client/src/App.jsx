import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import GrievanceForm from './pages/GrievanceForm';
import TrackingPage from './pages/TrackingPage';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';
import MockWhatsApp from './components/layout/MockWhatsApp';

import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/layout/ProtectedRoute';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import { useAuth } from './context/AuthContext';

import GrievancesPage from './pages/admin/GrievancesPage';
import OfficersPage from './pages/admin/OfficersPage';
import VCHearingsPage from './pages/admin/VCHearingsPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import VideoHearingPage from './pages/VideoHearingPage';
import OperatorGrievanceForm from './pages/operator/OperatorGrievanceForm';
import UserManagementPage from './pages/admin/UserManagementPage';
import SubOfficialDashboard from './pages/officer/SubOfficialDashboard';
import CommissionerDashboard from './pages/commissioner/CommissionerDashboard';

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return null;

  if (user.role === 'COMMISSIONER') return <CommissionerDashboard />;
  if (user.role === 'SECTION_OFFICER') return <OfficerDashboard />;
  if (user.role === 'OPERATOR') return <OperatorGrievanceForm />;
  if ([
    'EXECUTIVE_ENGINEER',
    'REVENUE_OFFICIAL',
    'PLANNING_OFFICIAL',
    'LEGAL_OFFICIAL',
    'FINANCE_OFFICIAL'
  ].includes(user.role)) return <SubOfficialDashboard />;
  if (user.role === 'SUPER_ADMIN') return <UserManagementPage />;
  return <ModeratorDashboard />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/submit" element={<GrievanceForm />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route path="/hearing/:roomId" element={<VideoHearingPage />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={[
            'MODERATOR', 'SECTION_OFFICER', 'OPERATOR', 'SUPER_ADMIN',
            'EXECUTIVE_ENGINEER', 'REVENUE_OFFICIAL', 'PLANNING_OFFICIAL',
            'LEGAL_OFFICIAL', 'FINANCE_OFFICIAL', 'COMMISSIONER'
          ]} />}>
            <Route path="/dashboard" element={<DashboardLayout><Outlet /></DashboardLayout>}>
              <Route index element={<DashboardRouter />} />
              <Route path="grievances" element={<GrievancesPage />} />

              <Route path="submit-grievance" element={<OperatorGrievanceForm />} />
              <Route path="officers" element={<OfficersPage />} />
              <Route path="hearings" element={<VCHearingsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UserManagementPage />} />
            </Route>
          </Route>
        </Routes>
        <MockWhatsApp />
      </AuthProvider>
    </Router>
  );
}

export default App;
