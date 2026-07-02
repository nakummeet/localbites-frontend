/**
 * Login Page
 *
 * Features:
 * - Email + password form with validation
 * - Loading state on submit
 * - Error messages from backend
 * - Link to signup
 * - Redirects based on role after login
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers';
import { ROLES } from '../../utils/constants';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(formData);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === ROLES.OWNER ? '/owner/dashboard' : '/', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h2 className="login-page__title">Welcome Back</h2>
      <p className="login-page__subtitle">Sign in to continue to LocalBites</p>

      <form onSubmit={handleSubmit} className="login-page__form" noValidate>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          icon={<span>✉️</span>}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
          icon={<span>🔒</span>}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          className="login-page__submit"
        >
          Sign In
        </Button>
      </form>

      <p className="login-page__footer">
        Don't have an account?{' '}
        <Link to="/signup" className="login-page__link">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
