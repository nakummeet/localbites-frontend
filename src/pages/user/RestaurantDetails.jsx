/**
 * RestaurantDetails Page — shows a single restaurant and its food menu.
 *
 * Features:
 * - Restaurant info header
 * - Food menu grid
 * - Add to cart button per food item
 * - Loading / empty states
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as restaurantService from '../../services/restaurantService';
import * as foodService from '../../services/foodService';
import useCart from '../../hooks/useCart';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './RestaurantDetails.css';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, removeItem, cartItems } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null); // tracks which food is being updated

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restData, foodData] = await Promise.all([
          restaurantService.getRestaurantById(id),
          foodService.getFoodsByRestaurant(id),
        ]);
        setRestaurant(restData.restaurant || restData);
        setFoods(foodData.foods || foodData || []);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load restaurant'));
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const getCartItem = (foodId) => {
    return cartItems.find(
      (item) => item.food?._id === foodId || item.food === foodId || item._id === foodId
    );
  };

  const getCartQuantity = (foodId) => {
    const item = getCartItem(foodId);
    return item ? (item.quantity || 1) : 0;
  };

  const handleAddToCart = async (food) => {
    setUpdatingItem(food._id);
    await addToCart(food._id, id, 1);
    setUpdatingItem(null);
  };

  const handleIncrease = async (food) => {
    const currentQty = getCartQuantity(food._id);
    setUpdatingItem(food._id);
    await updateQuantity(food._id, currentQty + 1);
    setUpdatingItem(null);
  };

  const handleDecrease = async (food) => {
    const currentQty = getCartQuantity(food._id);
    setUpdatingItem(food._id);
    if (currentQty <= 1) {
      await removeItem(food._id);
    } else {
      await updateQuantity(food._id, currentQty - 1);
    }
    setUpdatingItem(null);
  };

  if (loading) return <Loader fullScreen />;
  if (!restaurant) return null;

  const availableFoods = foods.filter((f) => f.isAvailable !== false);
  const unavailableFoods = foods.filter((f) => f.isAvailable === false);

  return (
    <div className="restaurant-details">
      <div className="container">
        {/* ─── Restaurant Header ────────────── */}
        <section className="restaurant-details__header">
          <div className="restaurant-details__image-wrapper">
            <img
              src={restaurant.image || `https://placehold.co/800x300/ff6b35/white?text=${encodeURIComponent(restaurant.name)}`}
              alt={restaurant.name}
              className="restaurant-details__image"
            />
          </div>
          <div className="restaurant-details__info">
            <h1 className="restaurant-details__name">{restaurant.name}</h1>
            {restaurant.cuisine && (
              <span className="restaurant-details__cuisine">{restaurant.cuisine}</span>
            )}
            {restaurant.address && (
              <p className="restaurant-details__address">📍 {restaurant.address}</p>
            )}
            {restaurant.phone && (
              <p className="restaurant-details__phone">📞 {restaurant.phone}</p>
            )}
          </div>
        </section>

        {/* ─── Food Menu ───────────────────── */}
        <section className="restaurant-details__menu">
          <h2 className="restaurant-details__menu-title">Menu</h2>

          {foods.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="No items yet"
              message="This restaurant hasn't added any food items yet."
            />
          ) : (
            <>
              {availableFoods.length > 0 && (
                <div className="food-grid">
                  {availableFoods.map((food) => {
                    const quantity = getCartQuantity(food._id);
                    const isProcessing = updatingItem === food._id;
                    return (
                      <div key={food._id} className="food-card">
                        <div className="food-card__image-wrapper">
                          <img
                            src={food.image || `https://placehold.co/300x200/ff6b35/white?text=${encodeURIComponent(food.name)}`}
                            alt={food.name}
                            className="food-card__image"
                            loading="lazy"
                          />
                        </div>
                        <div className="food-card__body">
                          <h3 className="food-card__name">{food.name}</h3>
                          {food.description && (
                            <p className="food-card__description">{food.description}</p>
                          )}
                          <div className="food-card__footer">
                            <span className="food-card__price">
                              {formatCurrency(food.price)}
                            </span>
                            {quantity > 0 ? (
                              <div className="food-card__qty-control">
                                <button
                                  type="button"
                                  className="food-card__qty-btn"
                                  disabled={isProcessing}
                                  onClick={() => handleDecrease(food)}
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="food-card__qty-count">
                                  {isProcessing ? '...' : quantity}
                                </span>
                                <button
                                  type="button"
                                  className="food-card__qty-btn"
                                  disabled={isProcessing}
                                  onClick={() => handleIncrease(food)}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                loading={isProcessing}
                                onClick={() => handleAddToCart(food)}
                              >
                                ADD +
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {unavailableFoods.length > 0 && (
                <div className="restaurant-details__unavailable">
                  <h3 className="restaurant-details__unavailable-title">
                    Currently Unavailable
                  </h3>
                  <div className="food-grid">
                    {unavailableFoods.map((food) => (
                      <div key={food._id} className="food-card food-card--unavailable">
                        <div className="food-card__image-wrapper">
                          <img
                            src={food.image || `https://placehold.co/300x200/cccccc/666666?text=${encodeURIComponent(food.name)}`}
                            alt={food.name}
                            className="food-card__image"
                            loading="lazy"
                          />
                          <span className="food-card__unavailable-badge">Unavailable</span>
                        </div>
                        <div className="food-card__body">
                          <h3 className="food-card__name">{food.name}</h3>
                          {food.description && (
                            <p className="food-card__description">{food.description}</p>
                          )}
                          <div className="food-card__footer">
                            <span className="food-card__price">
                              {formatCurrency(food.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default RestaurantDetails;
