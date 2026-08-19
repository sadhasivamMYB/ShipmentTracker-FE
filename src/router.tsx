import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import ActivateAccount from './pages/ActivateAccount';

import Admin from './pages/Admin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Workspace from './pages/Workspace';
// import Dashboard from './pages/Dashboard';
import TemplateList from './pages/TemplateList';
import TemplateDetails from './pages/TemplateDetails';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/activate-account',
    element: <ActivateAccount />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // {
      //   index: true,
      //   element: <Dashboard />,
      // },
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <Workspace />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/*',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: 'template',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <TemplateList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'template/:id',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <TemplateDetails />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
