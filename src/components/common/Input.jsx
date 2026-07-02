/**
 * Reusable Input component.
 *
 * Supports label, error message, icon (left-side), and all native input props.
 * Also handles textarea via the `as` prop.
 */

import './Input.css';

const Input = ({
  label,
  error,
  icon,
  id,
  as = 'input',
  className = '',
  ...rest
}) => {
  const Component = as === 'textarea' ? 'textarea' : 'input';
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      )}
      <div className="input-group__wrapper">
        {icon && <span className="input-group__icon">{icon}</span>}
        <Component
          id={inputId}
          className={`input-group__field ${icon ? 'input-group__field--with-icon' : ''} ${
            as === 'textarea' ? 'input-group__field--textarea' : ''
          }`}
          {...rest}
        />
      </div>
      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
};

export default Input;
