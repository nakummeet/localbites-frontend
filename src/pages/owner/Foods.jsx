/**
 * Owner Foods Page — manage food items for the restaurant.
 *
 * Features:
 * - List all foods with toggle availability
 * - Add food via modal
 * - Edit food via modal
 * - Delete food with confirmation
 */

import { useState, useEffect } from 'react';
import * as foodService from '../../services/foodService';
import * as restaurantService from '../../services/restaurantService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Foods.css';

const initialFormData = { name: '', description: '', price: '', image: '' };

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rest = await restaurantService.getMyRestaurant();
        setRestaurant(rest);

        if (rest?._id) {
          const foodData = await foodService.getFoodsByRestaurant(rest._id);
          setFoods(foodData.foods || foodData || []);
        }
      } catch {
        // No restaurant
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'Enter a valid price';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAddModal = () => {
    setEditingFood(null);
    setFormData(initialFormData);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name || '',
      description: food.description || '',
      price: String(food.price || ''),
      image: food.image || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        restaurant: restaurant._id,
      };

      if (editingFood) {
        const data = await foodService.updateFood(editingFood._id, payload);
        const updated = data.food || data;
        setFoods((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
        toast.success('Food updated');
      } else {
        const data = await foodService.addFood(payload);
        const newFood = data.food || data;
        setFoods((prev) => [...prev, newFood]);
        toast.success('Food added! 🍔');
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save food'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (food) => {
    try {
      const data = await foodService.toggleFoodAvailability(food._id);
      const updated = data.food || data;
      setFoods((prev) => prev.map((f) => (f._id === food._id ? { ...f, isAvailable: updated.isAvailable ?? !f.isAvailable } : f)));
      toast.success(updated.isAvailable !== false ? 'Now available' : 'Marked unavailable');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to toggle'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await foodService.deleteFood(deleteTarget._id);
      setFoods((prev) => prev.filter((f) => f._id !== deleteTarget._id));
      toast.success('Food deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete'));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  if (!restaurant) {
    return (
      <EmptyState
        icon="🏪"
        title="Create a restaurant first"
        message="You need to create a restaurant before adding food items"
      />
    );
  }

  return (
    <div className="foods-page">
      <div className="foods-page__header">
        <h1 className="foods-page__title">Manage Foods</h1>
        <Button variant="primary" onClick={openAddModal}>
          + Add Food
        </Button>
      </div>

      {foods.length === 0 ? (
        <EmptyState
          icon="🍔"
          title="No food items yet"
          message="Add your first food item to get started"
          actionLabel="Add Food"
          onAction={openAddModal}
        />
      ) : (
        <div className="foods-page__grid">
          {foods.map((food) => (
            <div key={food._id} className={`food-manage-card ${food.isAvailable === false ? 'food-manage-card--unavailable' : ''}`}>
              <div className="food-manage-card__image-wrapper">
                <img
                  src={food.image || `https://placehold.co/300x160/ff6b35/white?text=${encodeURIComponent(food.name)}`}
                  alt={food.name}
                  className="food-manage-card__image"
                  loading="lazy"
                />
                <span className={`food-manage-card__badge ${food.isAvailable === false ? 'food-manage-card__badge--off' : 'food-manage-card__badge--on'}`}>
                  {food.isAvailable === false ? 'Unavailable' : 'Available'}
                </span>
              </div>
              <div className="food-manage-card__body">
                <h3 className="food-manage-card__name">{food.name}</h3>
                <p className="food-manage-card__price">{formatCurrency(food.price)}</p>
                <div className="food-manage-card__actions">
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(food)}>
                    {food.isAvailable === false ? '✅ Enable' : '⛔ Disable'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditModal(food)}>
                    ✏️ Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(food)}>
                    🗑️
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add/Edit Modal ──────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFood ? 'Edit Food' : 'Add Food'}
      >
        <form onSubmit={handleSubmit} className="foods-page__form" noValidate>
          <Input
            label="Food Name"
            name="name"
            placeholder="e.g., Butter Chicken"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
          />
          <Input
            label="Description"
            name="description"
            as="textarea"
            placeholder="Describe the dish..."
            value={formData.description}
            onChange={handleChange}
          />
          <Input
            label="Price (₹)"
            name="price"
            type="number"
            placeholder="249"
            value={formData.price}
            onChange={handleChange}
            error={formErrors.price}
          />
          <Input
            label="Image URL"
            name="image"
            placeholder="https://example.com/food.jpg"
            value={formData.image}
            onChange={handleChange}
          />
          <div className="foods-page__modal-actions">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingFood ? 'Update' : 'Add Food'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Food"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Foods;
