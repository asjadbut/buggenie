import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const darkTheme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          
        },
        '#root': {
           width: '100%',
           
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    background: {
      default: '#222',
      paper: '#23272f',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
