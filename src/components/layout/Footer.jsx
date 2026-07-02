/**
 * Footer component — simple branded footer.
 */

import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container container">
        <div className="footer__brand">
          <span className="footer__logo-icon">🍽️</span>
          <span className="footer__logo-text">LocalBites</span>
        </div>
        <div className="footer__links">
        </div>
        <p className="footer__copyright">
          © {currentYear} LocalBites. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
