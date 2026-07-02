/**
 * User Profile Page
 *
 * Features:
 * - Display user info (name, email, role)
 * - Logout button
 * - Delete account with confirmation
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import * as userService from '../../services/userService';
import { getInitials, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.deleteAccount();
      logout();
      toast.success('Account deleted successfully');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete account'));
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-page__title">Profile</h1>

        <div className="profile-page__card">
          {/* ─── Avatar ──────────────────────── */}
          <div className="profile-page__avatar">
            {getInitials(user?.name)}
          </div>

          {/* ─── Info ────────────────────────── */}
          <div className="profile-page__info">
            <div className="profile-page__field">
              <label className="profile-page__label">Full Name</label>
              <p className="profile-page__value">{user?.name}</p>
            </div>
            <div className="profile-page__field">
              <label className="profile-page__label">Email</label>
              <p className="profile-page__value">{user?.email}</p>
            </div>
            <div className="profile-page__field">
              <label className="profile-page__label">Role</label>
              <span className="profile-page__role-badge">
                {user?.role === 'owner' ? '🏪 Restaurant Owner' : '🍕 Food Lover'}
              </span>
            </div>
          </div>

          {/* ─── Actions ─────────────────────── */}
          <div className="profile-page__actions">
            <Button variant="outline" onClick={handleLogout} fullWidth>
              Logout
            </Button>
            <Button variant="danger" onClick={() => setDeleteConfirm(true)} fullWidth>
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? All your data will be permanently removed. This action cannot be undone."
        confirmText="Delete My Account"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Profile;
