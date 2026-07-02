/**
 * Reusable EmptyState component.
 *
 * Used when a list/section has no data (e.g., empty cart, no orders).
 * Supports custom icon, title, message, and an optional action button.
 */

import Button from './Button';
import './EmptyState.css';

const EmptyState = ({
  icon,
  title = 'Nothing here yet',
  message = '',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="empty-state__action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
