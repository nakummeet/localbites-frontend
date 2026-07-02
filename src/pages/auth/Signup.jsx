/**
 * Signup Page
 *
 * Features:
 * - Name, Email, Mobile Number, Address, Password
 * - User / Owner role selection
 * - Client-side validation
 * - Sends payload matching backend API
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils/helpers';
import { ROLES } from '../../utils/constants';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: ROLES.USER,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }

    // Mobile Number
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Mobile number must be exactly 10 digits';
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (
      !/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)
    ) {
      newErrors.password =
        'Password must be at least 8 characters with 1 uppercase letter and 1 number';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Backend expects these exact field names
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim(),
        number: formData.phone.trim(),
        role: formData.role,
      };

      const user = await signup(payload);

      toast.success(`Welcome ${user.name}!`);

      navigate(
        user.role === ROLES.OWNER
          ? '/owner/dashboard'
          : '/',
        { replace: true }
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Signup failed. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <h2 className="signup-page__title">Create Account</h2>

      <p className="signup-page__subtitle">
        Join LocalBites today
      </p>

      <form
        onSubmit={handleSubmit}
        className="signup-page__form"
        noValidate
      >
        <Input
          label="Full Name"
          type="text"
          name="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
          icon={<span>👤</span>}
        />

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
          label="Mobile Number"
          type="tel"
          name="phone"
          placeholder="9876543210"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          autoComplete="tel"
          maxLength={10}
          icon={<span>📞</span>}
        />

        <Input
          label="Address"
          type="text"
          name="address"
          placeholder="Enter your address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          autoComplete="street-address"
          icon={<span>📍</span>}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Password123"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          icon={<span>🔒</span>}
        />

        {/* Role Selection */}
        <div className="signup-page__role">
          <label className="signup-page__role-label">
            I want to
          </label>

          <div className="signup-page__role-options">
            <button
              type="button"
              className={`signup-page__role-btn ${formData.role === ROLES.USER
                  ? 'signup-page__role-btn--active'
                  : ''
                }`}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  role: ROLES.USER,
                }))
              }
            >
              <span className="signup-page__role-icon">
                🍕
              </span>
              <span>Order Food</span>
            </button>

            <button
              type="button"
              className={`signup-page__role-btn ${formData.role === ROLES.OWNER
                  ? 'signup-page__role-btn--active'
                  : ''
                }`}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  role: ROLES.OWNER,
                }))
              }
            >
              <span className="signup-page__role-icon">
                🏪
              </span>
              <span>Sell Food</span>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          className="signup-page__submit"
        >
          Create Account
        </Button>
      </form>

      <p className="signup-page__footer">
        Already have an account?{' '}
        <Link
          to="/login"
          className="signup-page__link"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Signup;