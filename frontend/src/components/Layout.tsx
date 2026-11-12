import { NavLink, Outlet } from 'react-router';

import { useClinicTimeZone } from '../lib/time';

const NAV = [
  { to: '/', label: 'Schedule' },
  { to: '/owners', label: 'Owners' },
  { to: '/vets', label: 'Vets' },
];

const Layout = () => {
  const timeZone = useClinicTimeZone();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold whitespace-nowrap">🐾 Vet Clinic</span>
          <nav aria-label="Main" className="flex gap-1">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          {timeZone && <span className="ml-auto text-xs text-slate-500">Times in {timeZone}</span>}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
