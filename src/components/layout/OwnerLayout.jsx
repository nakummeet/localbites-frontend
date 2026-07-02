/**
 * OwnerLayout — wraps all restaurant owner pages.
 *
 * Structure: Navbar → Sidebar + Page Content (Outlet)
 * No footer — dashboard UIs typically skip footers.
 * Sidebar is collapsible on mobile via a toggle button.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './OwnerLayout.css';

const OwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <Navbar />
      <div className="owner-layout">
        {/* Mobile sidebar toggle */}
        <button
          className="owner-layout__sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="owner-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
