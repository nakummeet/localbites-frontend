/**
 * Owner Profile Page — reuses the same pattern as user Profile
 * but lives in the owner route namespace.
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

const OwnerProfile = () => {
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
    <div className="owner-profile-page">
      <h1 className="owner-profile-page__title">Profile</h1>

      <div className="owner-profile-page__card">
        <div className="owner-profile-page__avatar">
          {getInitials(user?.name)}
        </div>

        <div className="owner-profile-page__info">
          <div className="owner-profile-page__field">
            <label className="owner-profile-page__label">Full Name</label>
            <p className="owner-profile-page__value">{user?.name}</p>
          </div>
          <div className="owner-profile-page__field">
            <label className="owner-profile-page__label">Email</label>
            <p className="owner-profile-page__value">{user?.email}</p>
          </div>
          <div className="owner-profile-page__field">
            <label className="owner-profile-page__label">Role</label>
            <span className="owner-profile-page__role-badge">🏪 Restaurant Owner</span>
          </div>
        </div>

        <div className="owner-profile-page__actions">
          <Button variant="outline" onClick={handleLogout} fullWidth>
            Logout
          </Button>
          <Button variant="danger" onClick={() => setDeleteConfirm(true)} fullWidth>
            Delete Account
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This will permanently delete your account, restaurant, and all food items. This cannot be undone."
        confirmText="Delete My Account"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default OwnerProfile;
