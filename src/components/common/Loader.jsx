/**
 * Reusable Loader component.
 *
 * Two modes:
 * - fullScreen: centered spinner overlay (for page-level loading)
 * - inline: small spinner within a section
 */

import './Loader.css';

const Loader = ({ size = 'md', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loader-overlay" role="status" aria-label="Loading">
        <div className={`loader loader--${size}`}>
          <div className="loader__ring"></div>
          <div className="loader__ring"></div>
          <div className="loader__ring"></div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="loader-inline" role="status" aria-label="Loading">
      <div className={`loader loader--${size}`}>
        <div className="loader__ring"></div>
        <div className="loader__ring"></div>
        <div className="loader__ring"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;
