import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';

import Admin from './pages/Admin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Workspace from './pages/Workspace';
import Dashboard from './pages/Dashboard';
import TemplateList from './pages/TemplateList';
import TemplateDetails from './pages/TemplateDetails';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
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
        // path: 'workspace',
        index: true,
        element: <Workspace />,
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
          <ProtectedRoute>
            <TemplateList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'template/:id',
        element: (
          <ProtectedRoute>
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
