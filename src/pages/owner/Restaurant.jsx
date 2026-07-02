/**
 * Owner Restaurant Page — create or manage restaurant details.
 *
 * Features:
 * - If no restaurant exists → show create form
 * - If restaurant exists → show edit form with current data
 * - Delete restaurant with confirmation
 */

import { useState, useEffect } from 'react';
import * as restaurantService from '../../services/restaurantService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Restaurant.css';

const Restaurant = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    phone: '',
    image: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const rest = await restaurantService.getMyRestaurant();
        setRestaurant(rest);

        if (rest) {
          setFormData({
            name: rest.name || '',
            cuisine: rest.cuisine || '',
            address: rest.address || '',
            phone: rest.phone || '',
            image: rest.image || '',
          });
        }
      } catch {
        // No restaurant yet — show create form
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Restaurant name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (restaurant) {
        const data = await restaurantService.updateRestaurant(formData);
        setRestaurant(data.restaurant || data);
        toast.success('Restaurant updated');
      } else {
        const data = await restaurantService.createRestaurant(formData);
        setRestaurant(data.restaurant || data);
        toast.success('Restaurant created! 🎉');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save restaurant'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await restaurantService.deleteRestaurant();
      setRestaurant(null);
      setFormData({ name: '', cuisine: '', address: '', phone: '', image: '' });
      toast.success('Restaurant deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete restaurant'));
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="restaurant-page">
      <h1 className="restaurant-page__title">
        {restaurant ? 'Manage Restaurant' : 'Create Restaurant'}
      </h1>

      <form onSubmit={handleSubmit} className="restaurant-page__form" noValidate>
        <Input
          label="Restaurant Name"
          name="name"
          placeholder="My Awesome Restaurant"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={<span>🏪</span>}
        />

        <Input
          label="Cuisine Type"
          name="cuisine"
          placeholder="e.g., Indian, Italian, Chinese"
          value={formData.cuisine}
          onChange={handleChange}
          icon={<span>🍽️</span>}
        />

        <Input
          label="Address"
          name="address"
          placeholder="123 Main Street, City"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          icon={<span>📍</span>}
        />

        <Input
          label="Phone"
          name="phone"
          placeholder="+91 9876543210"
          value={formData.phone}
          onChange={handleChange}
          icon={<span>📞</span>}
        />

        <Input
          label="Image URL"
          name="image"
          placeholder="https://example.com/restaurant.jpg"
          value={formData.image}
          onChange={handleChange}
          icon={<span>🖼️</span>}
        />

        <div className="restaurant-page__actions">
          <Button type="submit" variant="primary" loading={saving} fullWidth>
            {restaurant ? 'Update Restaurant' : 'Create Restaurant'}
          </Button>

          {restaurant && (
            <Button
              type="button"
              variant="danger"
              onClick={() => setDeleteConfirm(true)}
              fullWidth
            >
              Delete Restaurant
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Restaurant"
        message="This will permanently delete your restaurant and all associated food items. This action cannot be undone."
        confirmText="Delete Restaurant"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Restaurant;
