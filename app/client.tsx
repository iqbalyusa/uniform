import { createRoot } from 'react-dom/client';
import UniformApp from './uniform-app';
import '@fontsource/geist/latin-400.css';
import '@fontsource/geist/latin-500.css';
import '@fontsource/geist/latin-600.css';
import '@fontsource/geist/latin-700.css';
import './globals.css';
createRoot(document.getElementById('app')!).render(<UniformApp/>);
