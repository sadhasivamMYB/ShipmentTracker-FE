import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { router } from './router';
import muiTheme from './theme/muiTheme';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
