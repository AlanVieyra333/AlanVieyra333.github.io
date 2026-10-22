import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { initI18n } from './i18n/index.ts';
import { detectInitialLocale } from './i18n/detectLocale.ts';

const initialLocale = detectInitialLocale(window.location.pathname);

// i18n se inicializa **antes** de montar React y ya en el idioma
// correcto. Si se hiciera después (o durante el render de un
// componente), el primer paint de `/en-US` saldría en español y
// corregirlo con un `changeLanguage` posterior deja la UI pegada en
// el idioma anterior: los `useTranslation()` ya se suscribieron al
// evento `languageChanged` de la instancia anterior al `init()`.
initI18n(initialLocale);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary label="root">
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  </StrictMode>,
);