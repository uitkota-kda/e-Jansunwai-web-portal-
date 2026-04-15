
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import GrievanceForm from './pages/GrievanceForm';
import GrievanceOtpLogin from './pages/GrievanceOtpLogin';
import LandingPage from './pages/LandingPage';
import TrackingPage from './pages/TrackingPage';
import ModeratorDashboard from './pages/moderator/ModeratorDashboard';

import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import { useAuth } from './context/AuthContext';

import GrievancesPage from './pages/admin/GrievancesPage';
import OfficersPage from './pages/admin/OfficersPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import OperatorGrievanceForm from './pages/operator/OperatorGrievanceForm';
import UserManagementPage from './pages/admin/UserManagementPage';
import SubOfficialDashboard from './pages/officer/SubOfficialDashboard';
import CommissionerDashboard from './pages/commissioner/CommissionerDashboard';
import GuidelinesPage from './pages/GuidelinesPage';

const DashboardRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    console.log('DashboardRouter: Loading...');
    return null;
  }
  if (!user) {
    console.log('DashboardRouter: No user');
    return null;
  }

  console.log('DashboardRouter: User Role:', user.role);

  if (user.role === 'COMMISSIONER') return <CommissionerDashboard />;
  if (user.role === 'SECTION_OFFICER') return <OfficerDashboard />;
  if (user.role === 'OPERATOR') return <OperatorGrievanceForm />;
  if ([
    'EXECUTIVE_ENGINEER',
    'REVENUE_OFFICIAL',
    'PLANNING_OFFICIAL',
    'LEGAL_OFFICIAL',
    'FINANCE_OFFICIAL',
    'DIRECTOR'
  ].includes(user.role)) {
    console.log('DashboardRouter: Rendering SubOfficialDashboard');
    return <SubOfficialDashboard />;
  }
  if (user.role === 'SUPER_ADMIN') return <UserManagementPage />;

  console.log('DashboardRouter: Defaulting to ModeratorDashboard');
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
            {/* Public registration disabled - Physical only */}
            {/* <Route path="/submit" element={<GrievanceOtpLogin />} /> */}
            {/* <Route path="/register-grievance" element={<GrievanceForm />} /> */}
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/guidelines" element={<GuidelinesPage />} />
            <Route path="/login" element={<LoginPage key="officer-login" />} />
            <Route path="/operator-login" element={<LoginPage defaultRole="OPERATORS" key="operator-login" />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={[
            'MODERATOR', 'SECTION_OFFICER', 'OPERATOR', 'SUPER_ADMIN',
            'EXECUTIVE_ENGINEER', 'REVENUE_OFFICIAL', 'PLANNING_OFFICIAL',
            'LEGAL_OFFICIAL', 'FINANCE_OFFICIAL', 'COMMISSIONER', 'DIRECTOR'
          ]} />}>
            <Route path="/dashboard" element={<ErrorBoundary><DashboardLayout><Outlet /></DashboardLayout></ErrorBoundary>}>
              <Route index element={<DashboardRouter />} />
              <Route path="grievances" element={<GrievancesPage />} />

              <Route path="submit-grievance" element={<OperatorGrievanceForm />} />
              <Route path="officers" element={<OfficersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UserManagementPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
