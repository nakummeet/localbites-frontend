/**
 * Sidebar component — owner dashboard side navigation.
 *
 * Features:
 * - Active link highlighting via NavLink
 * - Collapsible on mobile (controlled by parent via prop)
 * - Clean icon + label layout
 */

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import * as restaurantService from '../../services/restaurantService';
import './Sidebar.css';

const defaultOwnerLinks = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/owner/restaurant', label: 'Restaurant', icon: '🏪' },
  { to: '/owner/foods', label: 'Foods', icon: '🍔' },
  { to: '/owner/orders', label: 'Orders', icon: '📋' },
  { to: '/owner/profile', label: 'Profile', icon: '👤' },
];

const Sidebar = ({ isOpen = false, onClose }) => {
  const [ownerLinks, setOwnerLinks] = useState(defaultOwnerLinks);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await restaurantService.getMyRestaurant();
        const restaurant = data.restaurant || data;
        if (restaurant) {
          setOwnerLinks((links) => links.filter((link) => link.to !== '/owner/restaurant'));
        }
      } catch {
        setOwnerLinks(defaultOwnerLinks);
      }
    };

    fetchRestaurant();
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar__overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__content">
          <div className="sidebar__header">
            <h3 className="sidebar__title">Owner Panel</h3>
          </div>

          <nav className="sidebar__nav">
            {ownerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                onClick={onClose}
                end={link.to === '/owner/dashboard'}
              >
                <span className="sidebar__link-icon">{link.icon}</span>
                <span className="sidebar__link-label">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
