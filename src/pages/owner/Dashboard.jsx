/**
 * Owner Dashboard Page — overview stats for restaurant owner.
 *
 * Features:
 * - Stats cards (total orders, foods, status breakdown)
 * - Recent orders preview
 * - Quick action links
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import * as restaurantService from '../../services/restaurantService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate, getErrorMessage } from '../../utils/helpers';
import { STATUS_COLORS, ORDER_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderData, restData] = await Promise.allSettled([
          orderService.getRestaurantOrders(),
          restaurantService.getMyRestaurant(),
        ]);

        if (orderData.status === 'fulfilled') {
          setOrders(orderData.value.orders || orderData.value || []);
        }
        if (restData.status === 'fulfilled') {
          setRestaurant(restData.value || null);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader fullScreen />;

  // Compute stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === ORDER_STATUS.PENDING).length;
  const totalRevenue = orders
    .filter((o) => o.status === ORDER_STATUS.DELIVERED)
    .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">Dashboard</h1>
        {restaurant && (
          <p className="dashboard-page__restaurant-name">🏪 {restaurant.name}</p>
        )}
      </div>

      {!restaurant ? (
        <EmptyState
          icon="🏪"
          title="No restaurant yet"
          message="Create your restaurant to start receiving orders"
          actionLabel="Create Restaurant"
          onAction={() => navigate('/owner/restaurant')}
        />
      ) : (
        <>
          {/* ─── Stats Grid ─────────────────── */}
          <div className="dashboard-page__stats">
            <div className="stat-card">
              <span className="stat-card__icon">📦</span>
              <div className="stat-card__content">
                <p className="stat-card__value">{totalOrders}</p>
                <p className="stat-card__label">Total Orders</p>
              </div>
            </div>
            <div className="stat-card stat-card--warning">
              <span className="stat-card__icon">⏳</span>
              <div className="stat-card__content">
                <p className="stat-card__value">{pendingOrders}</p>
                <p className="stat-card__label">Pending</p>
              </div>
            </div>
            <div className="stat-card stat-card--success">
              <span className="stat-card__icon">💰</span>
              <div className="stat-card__content">
                <p className="stat-card__value">{formatCurrency(totalRevenue)}</p>
                <p className="stat-card__label">Revenue</p>
              </div>
            </div>
          </div>

          {/* ─── Quick Actions ──────────────── */}
          <div className="dashboard-page__actions">
            <Link to="/owner/foods" className="quick-action">
              <span className="quick-action__icon">🍔</span>
              <span>Manage Foods</span>
            </Link>
            <Link to="/owner/orders" className="quick-action">
              <span className="quick-action__icon">📋</span>
              <span>View Orders</span>
            </Link>
            <Link to="/owner/restaurant" className="quick-action">
              <span className="quick-action__icon">⚙️</span>
              <span>Settings</span>
            </Link>
          </div>

          {/* ─── Recent Orders ──────────────── */}
          <div className="dashboard-page__recent">
            <h2 className="dashboard-page__section-title">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="dashboard-page__empty">No orders yet</p>
            ) : (
              <div className="dashboard-page__order-list">
                {recentOrders.map((order) => (
                  <div key={order._id} className="dashboard-order">
                    <div className="dashboard-order__info">
                      <span className="dashboard-order__id">
                        #{order._id?.slice(-6).toUpperCase()}
                      </span>
                      <span className="dashboard-order__date">
                        {formatDate(order.createdAt || order.date)}
                      </span>
                    </div>
                    <span
                      className="dashboard-order__status"
                      style={{
                        backgroundColor: `${STATUS_COLORS[order.status] || '#6b7280'}15`,
                        color: STATUS_COLORS[order.status] || '#6b7280',
                      }}
                    >
                      {order.status}
                    </span>
                    <span className="dashboard-order__total">
                      {formatCurrency(order.totalAmount || order.total || 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
