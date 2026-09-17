import { createTheme } from '@mui/material/styles';

// Theme creation function
export const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    ...(mode === 'light' ? {
      // Light mode colors
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
    } : {
      // Dark mode colors
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    }),
  },
 
  // Custom color palette extensions
  custom: {
    folderItem: {
      light: {
        background: '#f5f5f5',
        border: '#e0e0e0',
      },
      dark: {
        background: 'rgba(255, 255, 255, 0.04)',
        border: 'rgba(255, 255, 255, 0.12)',
      },
    },
    userItem: {
      light: {
        activeBackground: '#f8f9fa',
        inactiveBackground: '#f5f5f5',
        border: '#e0e0e0',
      },
      dark: {
        activeBackground: 'rgba(255, 255, 255, 0.08)',
        inactiveBackground: 'rgba(255, 255, 255, 0.04)',
        border: 'rgba(255, 255, 255, 0.12)',
      },
    },
  },
});
