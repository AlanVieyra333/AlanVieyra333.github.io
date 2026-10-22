import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { initI18n } from '@/i18n';
import LocaleApp from '@components/LocaleApp';
import Home from '@pages/Home';
initI18n();
describe('dbg', () => {
  it('anchors', async () => {
    render(
      <MemoryRouter initialEntries={['/es-MX/']}>
        <Routes>
          <Route path="/:locale/*" element={<LocaleApp />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByRole('heading', { level: 1 });
    const all = Array.from(document.querySelectorAll('a'));
    expect(all.length).toBeGreaterThan(0);
    const hrefs = all.map((a) => a.getAttribute('href') ?? '');
    console.log('ANCHOR_HREFS=' + hrefs.join(' ~ '));
  });
});
