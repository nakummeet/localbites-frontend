/**
 * UserLayout — wraps all user-facing pages.
 *
 * Structure: Navbar → Page Content (Outlet) → Footer
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const UserLayout = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="app__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
