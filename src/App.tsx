import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { router } from './router';
import muiTheme from './theme/muiTheme';
import { useEffect } from 'react';
import { logout } from './store/slices/authSlice';

function AppContent() {
  useEffect(() => {
    const handleAuthError = () => {
      store.dispatch(logout());
      // ProtectedRoute will handle the redirection if authenticated state changes
    };
    window.addEventListener('auth-error', handleAuthError as EventListener);
    return () => window.removeEventListener('auth-error', handleAuthError as EventListener);
  }, []);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
