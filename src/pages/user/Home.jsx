/**
 * Home Page — lists all restaurants for users to browse.
 *
 * Features:
 * - Restaurant grid with cards
 * - Search by name
 * - Loading state
 * - Empty state
 * - Responsive grid
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as restaurantService from '../../services/restaurantService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Home.css';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getAllRestaurants();
        setRestaurants(data.restaurants || data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load restaurants'));
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filtered = restaurants.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="home-page">
      <div className="container">
        {/* ─── Hero Section ──────────────────── */}
        <section className="home-page__hero">
          <h1 className="home-page__title">
            Discover Local <span className="home-page__title-accent">Flavors</span>
          </h1>
          <p className="home-page__subtitle">
            Order from the best restaurants near you, delivered fresh to your doorstep.
          </p>
          <div className="home-page__search">
            <Input
              placeholder="Search restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<span>🔍</span>}
            />
          </div>
        </section>

        {/* ─── Restaurant Grid ──────────────── */}
        <section className="home-page__section">
          <div className="home-page__section-header">
            <h2 className="home-page__section-title">All Restaurants</h2>
            <span className="home-page__count">{filtered.length} places</span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="No restaurants found"
              message={
                searchQuery
                  ? 'Try a different search term'
                  : 'No restaurants are available right now'
              }
            />
          ) : (
            <div className="home-page__grid">
              {filtered.map((restaurant) => (
                <Link
                  to={`/restaurants/${restaurant._id}`}
                  key={restaurant._id}
                  className="restaurant-card"
                >
                  <div className="restaurant-card__image-wrapper">
                    <img
                      src={restaurant.image || `https://placehold.co/400x200/ff6b35/white?text=${encodeURIComponent(restaurant.name || 'Restaurant')}`}
                      alt={restaurant.name}
                      className="restaurant-card__image"
                      loading="lazy"
                    />
                    {restaurant.cuisine && (
                      <span className="restaurant-card__badge">{restaurant.cuisine}</span>
                    )}
                  </div>
                  <div className="restaurant-card__body">
                    <h3 className="restaurant-card__name">{restaurant.name}</h3>
                    {restaurant.address && (
                      <p className="restaurant-card__address">📍 {restaurant.address}</p>
                    )}
                    <div className="restaurant-card__footer">
                      {restaurant.phone && (
                        <span className="restaurant-card__info">📞 {restaurant.phone}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
