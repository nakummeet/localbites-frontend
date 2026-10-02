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
import Button from '../../components/common/Button';
import { formatCurrency, formatDate, formatStatus, getErrorMessage } from '../../utils/helpers';
import { STATUS_COLORS, ORDER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';
import './Orders.css';

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

  const handleAccept = async (orderId) => {
    setUpdatingId(orderId);
    try {
      const data = await orderService.acceptOrder(orderId);
      const updated = data.order || data;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: updated.status || ORDER_STATUS.ACCEPTED } : o))
      );
      toast.success('Order accepted! 👨‍🍳');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to accept order'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (orderId) => {
    setUpdatingId(orderId);
    try {
      const data = await orderService.rejectOrder(orderId);
      const updated = data.order || data;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: updated.status || ORDER_STATUS.REJECTED } : o))
      );
      toast.success('Order rejected');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to reject order'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const data = await orderService.updateOrderStatus(orderId, newStatus);
      const updated = data.order || data;
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: updated.status || newStatus } : o))
      );
      toast.success(`Order status updated to ${formatStatus(newStatus)}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update order status'));
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
          {orders.map((order) => {
            const statusKey = (order.status || '').toLowerCase();
            const isProcessing = updatingId === order._id;

            return (
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
                      backgroundColor: `${STATUS_COLORS[statusKey] || '#6b7280'}15`,
                      color: STATUS_COLORS[statusKey] || '#6b7280',
                    }}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>

                {/* Customer info */}
                {order.user && (
                  <p className="owner-order-card__customer">
                    👤 {order.user?.name || order.user} {order.user?.email ? `— ${order.user.email}` : ''}
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

                  <div className="owner-order-card__actions">
                    {statusKey === ORDER_STATUS.PENDING && (
                      <div className="owner-order-card__btn-group">
                        <Button
                          variant="primary"
                          size="sm"
                          loading={isProcessing}
                          onClick={() => handleAccept(order._id)}
                        >
                          Accept Order
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => handleReject(order._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {statusKey === ORDER_STATUS.ACCEPTED && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={isProcessing}
                        onClick={() => handleStatusChange(order._id, ORDER_STATUS.PREPARING)}
                      >
                        Start Preparing 🍳
                      </Button>
                    )}

                    {statusKey === ORDER_STATUS.PREPARING && (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={isProcessing}
                        onClick={() => handleStatusChange(order._id, ORDER_STATUS.DELIVERED)}
                      >
                        Mark as Delivered 🚚
                      </Button>
                    )}

                    {(statusKey === ORDER_STATUS.DELIVERED ||
                      statusKey === ORDER_STATUS.REJECTED ||
                      statusKey === ORDER_STATUS.CANCELLED) && (
                      <span className="owner-order-card__completed-text">
                        {statusKey === ORDER_STATUS.DELIVERED ? '✓ Completed' : formatStatus(order.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerOrders;

