/**
 * Cart Page — shows cart items, allows quantity changes, and place order.
 *
 * Features:
 * - List cart items with images, name, price, quantity controls
 * - Remove item
 * - Cart summary (subtotal, total)
 * - Place Order button
 * - Empty cart state
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import * as orderService from '../../services/orderService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartLoading, cartTotal, updateQuantity, removeItem, clearCart, fetchCart } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    await updateQuantity(itemId, newQty);
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setConfirmOpen(false);
    try {
      await orderService.placeOrder({});
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders', { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to place order'));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartLoading) return <Loader fullScreen />;

  const items = Array.isArray(cartItems) ? cartItems : [];

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-page__title">Your Cart</h1>

        {items.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            message="Browse restaurants and add items to get started"
            actionLabel="Browse Restaurants"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="cart-page__layout">
            {/* ─── Cart Items ────────────────── */}
            <div className="cart-page__items">
              {items.map((item) => {
                const food = item.food && typeof item.food === 'object' ? item.food : item;
                const foodId = food._id || item.food || item._id;
                return (
                  <div key={foodId} className="cart-item">
                    <div className="cart-item__image-wrapper">
                      <img
                        src={food.image || `https://placehold.co/100x100/ff6b35/white?text=${encodeURIComponent(food.name || 'Food')}`}
                        alt={food.name}
                        className="cart-item__image"
                      />
                    </div>
                    <div className="cart-item__info">
                      <h3 className="cart-item__name">{food.name}</h3>
                      <p className="cart-item__price">{formatCurrency(food.price)}</p>
                    </div>
                    <div className="cart-item__controls">
                      <div className="cart-item__quantity">
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => handleQuantityChange(foodId, (item.quantity || 1) - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="cart-item__qty-value">{item.quantity || 1}</span>
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => handleQuantityChange(foodId, (item.quantity || 1) + 1)}
                        >
                          +
                        </button>
                      </div>
                      <p className="cart-item__subtotal">
                        {formatCurrency((food.price || 0) * (item.quantity || 1))}
                      </p>
                      <button
                        className="cart-item__remove"
                        onClick={() => removeItem(foodId)}
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Order Summary ─────────────── */}
            <div className="cart-page__summary">
              <div className="cart-summary">
                <h2 className="cart-summary__title">Order Summary</h2>
                <div className="cart-summary__rows">
                  <div className="cart-summary__row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="cart-summary__row">
                    <span>Delivery Fee</span>
                    <span className="cart-summary__free">Free</span>
                  </div>
                  <div className="cart-summary__divider" />
                  <div className="cart-summary__row cart-summary__row--total">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={placingOrder}
                  onClick={() => setConfirmOpen(true)}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handlePlaceOrder}
        title="Confirm Order"
        message={`Place order for ${formatCurrency(cartTotal)}?`}
        confirmText="Place Order"
        variant="primary"
        loading={placingOrder}
      />
    </div>
  );
};

export default Cart;
