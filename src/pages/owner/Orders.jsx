/**
 * Owner Orders Page — view and manage restaurant orders.
 *
 * Features:
 * - List all orders received by the restaurant
 * - Status update dropdown (Accept, Reject, Preparing, Out for Delivery, Delivered)
 * - Status badge colors
 * - Customer info
 */

import { useState, useEffect } from 'react';
import * as orderService from '../../services/orderService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';
import { STATUS_COLORS, ORDER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';
import './Orders.css';

const statusFlow = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.ACCEPTED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.REJECTED,
  ORDER_STATUS.CANCELLED,
];

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getRestaurantOrders();
        setOrders(data.orders || data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load orders'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const data = await orderService.updateOrderStatus(orderId, { status: newStatus });
      const updated = data.order || data;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: updated.status || newStatus } : o))
      );
      toast.success(`Order updated to ${newStatus}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="owner-orders-page">
      <h1 className="owner-orders-page__title">Restaurant Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No orders yet"
          message="Orders from customers will appear here"
        />
      ) : (
        <div className="owner-orders-page__list">
          {orders.map((order) => (
            <div key={order._id} className="owner-order-card">
              <div className="owner-order-card__header">
                <div className="owner-order-card__meta">
                  <span className="owner-order-card__id">
                    #{order._id?.slice(-6).toUpperCase()}
                  </span>
                  <span className="owner-order-card__date">
                    {formatDate(order.createdAt || order.date)}
                  </span>
                </div>
                <span
                  className="owner-order-card__status"
                  style={{
                    backgroundColor: `${STATUS_COLORS[order.status] || '#6b7280'}15`,
                    color: STATUS_COLORS[order.status] || '#6b7280',
                  }}
                >
                  {order.status}
                </span>
              </div>

              {/* Customer info */}
              {order.user && (
                <p className="owner-order-card__customer">
                  👤 {order.user?.name || order.user} — {order.user?.email || ''}
                </p>
              )}

              {/* Order items */}
              {order.items && order.items.length > 0 && (
                <div className="owner-order-card__items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="owner-order-card__item">
                      <span>{item.food?.name || item.name || 'Item'}</span>
                      <span className="owner-order-card__item-qty">×{item.quantity || 1}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="owner-order-card__footer">
                <span className="owner-order-card__total">
                  {formatCurrency(order.totalAmount || order.total || 0)}
                </span>

                <div className="owner-order-card__status-control">
                  <select
                    className="owner-order-card__select"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={
                      updatingId === order._id ||
                      order.status === ORDER_STATUS.DELIVERED ||
                      order.status === ORDER_STATUS.CANCELLED ||
                      order.status === ORDER_STATUS.REJECTED
                    }
                  >
                    {statusFlow.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerOrders;
