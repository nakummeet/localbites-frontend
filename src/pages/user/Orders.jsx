/**
 * User Orders Page — displays all orders placed by the user.
 *
 * Features:
 * - Order list with status badges
 * - Order items preview
 * - Total amount
 * - Date formatting
 * - Empty state
 */

import { useState, useEffect } from 'react';
import * as orderService from '../../services/orderService';
import * as restaurantService from '../../services/restaurantService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDate, formatStatus, getErrorMessage } from '../../utils/helpers';
import { STATUS_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [restaurantsMap, setRestaurantsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdersAndRestaurants = async () => {
      try {
        const [ordersData, restaurantsData] = await Promise.allSettled([
          orderService.getUserOrders(),
          restaurantService.getAllRestaurants(),
        ]);

        if (ordersData.status === 'fulfilled') {
          const fetchedOrders = ordersData.value.orders || ordersData.value || [];
          setOrders(fetchedOrders);
        }

        if (restaurantsData.status === 'fulfilled') {
          const restList = restaurantsData.value.restaurants || restaurantsData.value || [];
          const map = {};
          if (Array.isArray(restList)) {
            restList.forEach((r) => {
              if (r._id) map[r._id] = r.name;
            });
          }
          setRestaurantsMap(map);
        }
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load orders'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndRestaurants();
  }, []);

  const getRestaurantName = (restaurant) => {
    if (!restaurant) return '';
    if (typeof restaurant === 'object' && restaurant.name) return restaurant.name;
    if (typeof restaurant === 'string') {
      return restaurantsMap[restaurant] || 'LocalBites Partner';
    }
    return 'LocalBites Partner';
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-page__title">My Orders</h1>

        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            message="Place your first order and it will appear here"
            actionLabel="Browse Restaurants"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="orders-page__list">
            {orders.map((order) => {
              const statusKey = (order.status || '').toLowerCase();
              const restName = getRestaurantName(order.restaurant);
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card__header">
                    <div className="order-card__meta">
                      <span className="order-card__id">#{order._id?.slice(-6).toUpperCase()}</span>
                      <span className="order-card__date">
                        {formatDate(order.createdAt || order.date)}
                      </span>
                    </div>
                    <span
                      className="order-card__status"
                      style={{
                        backgroundColor: `${STATUS_COLORS[statusKey] || '#6b7280'}15`,
                        color: STATUS_COLORS[statusKey] || '#6b7280',
                      }}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  {restName && (
                    <p className="order-card__restaurant">
                      🏪 {restName}
                    </p>
                  )}

                  {order.items && order.items.length > 0 && (
                    <div className="order-card__items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-card__item">
                          <span className="order-card__item-name">
                            {item.food?.name || item.name || 'Item'}
                          </span>
                          <span className="order-card__item-qty">×{item.quantity || 1}</span>
                          <span className="order-card__item-price">
                            {formatCurrency((item.food?.price || item.price || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="order-card__footer">
                    <span className="order-card__total-label">Total</span>
                    <span className="order-card__total">
                      {formatCurrency(order.totalAmount || order.total || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

