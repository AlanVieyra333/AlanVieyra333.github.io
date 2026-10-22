import { Routes, Route } from 'react-router-dom';
import LocaleApp from '@components/LocaleApp';
import RootRedirect from '@components/RootRedirect';
import Home from '@pages/Home';
import NotFound from '@pages/NotFound';

/**
 * Árbol de rutas.
 *
 * Tres ramas:
 *
 *   - `/`             → `RootRedirect`. Resuelve locale y navega.
 *   - `/:locale/*`    → `LocaleApp` que provee `LocaleProvider`
 *                        y `<Layout />`, con sub-rutas.
 *   - `*`             → NotFound global (URL sin locale y fuera
 *                        del root; ej. `/foo`, `/random/path`).
 *
 * El `<Outlet>` vive dentro de `<Layout>` (que `LocaleApp`
 * renderiza). Las rutas perezosas siguen funcionando gracias al
 * `<Suspense>` que vive en `Layout`.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/:locale/*" element={<LocaleApp />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
