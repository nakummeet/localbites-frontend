# localbites-backend — AICodeBridge
> 7/2/2026, 10:48:05 PM | 📄 Full

---

**localbites-backend** — backend API (Express.js + MongoDB (Mongoose)).

## 🛠 Stack

- **Lang:** JavaScript
- **Backend:** Express.js
- **DB:** MongoDB (Mongoose)
- **Other:** JWT, Stripe

## 🔧 Scripts

- `test` → echo "Error: no test specified" && exit 1
- `dev` → nodemon server.js
- `start` → node server.js

## ⭐ Key Files

- `api/index.js` — Root
- `config/db.js` — Database
- `controllers/authController.js` — Controller
- `controllers/cartController.js` — Controller
- `controllers/foodController.js` — Controller
- `controllers/orderController.js` — Controller
- `controllers/restaurantController.js` — Controller
- `controllers/userController.js` — Controller

## 📎 Code

### api/index.js _(52 lines)_
```javascript
// api/index.js
const express = require("express");
const cors = require("cors");

const connectDB = require("../config/db");
const errorMiddleware = require("../middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB connection before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ Database Connection Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Routes
app.use("/api/auth", require("../routes/authRoutes"));
app.use("/api/restaurants", require("../routes/restaurantRoutes"));
app.use("/api/foods", require("../routes/foodRoutes"));
app.use("/api/cart", require("../routes/cartRoutes"));
app.use("/api/orders", require("../routes/orderRoutes"));
app.use("/api/users", require("../routes/userRoutes"));

// Health Check
app.get("/", (req, res) => {
  res.status(200).send("🚀 LocalBites Backend is Running");
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use(errorMiddleware);

module.exports = app;
```

### config/db.js _(48 lines)_
```javascript
const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  // Return existing connection
  if (cached.conn) {
    console.log("✅ Using existing MongoDB connection");
    return cached.conn;
  }

  // Create new connection if one doesn't exist
  if (!cached.promise) {
    console.log("🔄 Connecting to MongoDB...");

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err);
        cached.promise = null; // Allow retry on next request
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.conn = null;
    throw err;
  }
};

module.exports = connectDB;
```

### controllers/authController.js _(94 lines)_
```javascript
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const apiResponse = require("../utils/apiResponse");

/* ===================== SIGNUP ===================== */
const signup = async (req, res) => {
  try {
    const { name, email, password, address, number, role } = req.body;

    if (!name || !email || !password || !address || !number) {
      return apiResponse.error(res, "All fields required", 400);
    }

    // ✅ Only allow client to opt into "owner" or default to "user" — no arbitrary roles
    const allowedRoles = ["user", "owner"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    const exists = await User.findOne({ email });
    if (exists) {
      return apiResponse.error(res, "User already exists", 409);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      address,
      number,
      role: finalRole,
    });

    const token = generateToken({ id: user._id, role: user.role });

    return apiResponse.success(
      res,
      "Signup success",
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: null, // ALWAYS null on signup
        },
      },
      201
    );
  } catch (err) {
    return apiResponse.error(res, "Server error", 500);
  }
};

/* ===================== SIGNIN ===================== */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return apiResponse.error(res, "Invalid credentials", 401);
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return apiResponse.error(res, "Invalid credentials", 401);
    }

    const token = generateToken({ id: user._id, role: user.role });

    const restaurantId = user.restaurant ? user.restaurant : null;

    return apiResponse.success(res, "Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        number: user.number,
        address: user.address,
        restaurantId,
      },
    });
  } catch (err) {
    console.error(err);
    return apiResponse.error(res, "Server error", 500);
  }
};

module.exports = { signup, signin };
```

### controllers/cartController.js _(156 lines)_
```javascript
const Cart = require("../models/Cart");
const Food = require("../models/Food");
const apiResponse = require("../utils/apiResponse");
const isValidObjectId = require("../utils/validateObjectId");

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);


exports.addToCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    if (!foodId || !isValidObjectId(foodId)) {
      return apiResponse.error(res, "Valid Food ID is required", 400);
    }

    if (quantity < 1) {
      return apiResponse.error(res, "Quantity must be at least 1", 400);
    }

    const food = await Food.findById(foodId);
    if (!food || !food.isAvailable) {
      return apiResponse.error(res, "Food not available", 404);
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const index = cart.items.findIndex(
      (item) => item.food.toString() === foodId
    );

    if (index > -1) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({
        food: food._id,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity,
      });
    }

    await cart.save();

    return apiResponse.success(res, "Item added to cart", {
      items: cart.items,
      total: calculateTotal(cart.items),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return apiResponse.error(res, "Server error", 500);
  }
};


exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
      return apiResponse.success(res, "Cart is empty", {
        items: [],
        total: 0,
      });
    }

    return apiResponse.success(res, "Cart fetched", {
      items: cart.items,
      total: calculateTotal(cart.items),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return apiResponse.error(res, "Server error", 500);
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;

    if (!foodId || !isValidObjectId(foodId)) {
      return apiResponse.error(res, "Valid Food ID is required", 400);
    }

    if (quantity < 0) {
      return apiResponse.error(res, "Invalid quantity", 400);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return apiResponse.error(res, "Cart not found", 404);
    }

    const index = cart.items.findIndex(
      (item) => item.food.toString() === foodId
    );

    if (index === -1) {
      return apiResponse.error(res, "Item not found in cart", 404);
    }

    if (quantity === 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }

    await cart.save();

    return apiResponse.success(res, "Cart updated", {
      items: cart.items,
      total: calculateTotal(cart.items),
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return apiResponse.error(res, "Server error", 500);
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.params;

    if (!isValidObjectId(foodId)) {
      return apiResponse.error(res, "Invalid Food ID", 400);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return apiResponse.error(res, "Cart not found", 404);
    }

    cart.items = cart.items.filter(
      (item) => item.food.toString() !== foodId
    );

    await cart.save();

    return apiResponse.success(res, "Item removed", {
      items: cart.items,
      total: calculateTotal(cart.items),
    });
  } catch (error) {
    console.error("Remove cart item error:", error);
    return apiResponse.error(res, "Server error", 500);
  }
};
```

### controllers/foodController.js _(156 lines)_
```javascript
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");
const apiResponse = require("../utils/apiResponse");
const isValidObjectId = require("../utils/validateObjectId");

const addFood = async (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    if (!name || price === undefined) {
      return apiResponse.error(res, "Food name and price are required", 400);
    }

    if (price <= 0) {
      return apiResponse.error(res, "Price must be greater than zero", 400);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return apiResponse.error(res, "You do not own a restaurant", 403);
    }

    const food = await Food.create({
      name,
      description,
      price,
      image,
      restaurant: restaurant._id,
    });

    return apiResponse.success(res, "Food added successfully", food, 201);
  } catch (error) {
    return apiResponse.error(res, "Server error", 500, error.message);
  }
};

const getFoodsByRestaurant = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return apiResponse.error(res, "Invalid restaurant ID", 400);
    }

    const foods = await Food.find({
      restaurant: req.params.id,
      isAvailable: true,
    });

    return apiResponse.success(res, "Foods fetched successfully", foods);
  } catch (error) {
    return apiResponse.error(res, "Server error", 500, error.message);
  }
};


const updateFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return apiResponse.error(res, "Invalid food ID", 400);
    }

    const { name, description, price, image } = req.body;

    const food = await Food.findById(id);
    if (!food) {
      return apiResponse.error(res, "Food not found", 404);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant || food.restaurant.toString() !== restaurant._id.toString()) {
      return apiResponse.error(res, "Access denied", 403);
    }

    if (price !== undefined && price <= 0) {
      return apiResponse.error(res, "Invalid price", 400);
    }

    food.name = name ?? food.name;
    food.description = description ?? food.description;
    food.price = price ?? food.price;
    food.image = image ?? food.image;

    await food.save();

    return apiResponse.success(res, "Food updated successfully", food);
  } catch (error) {
    return apiResponse.error(res, "Server error", 500, error.message);
  }
};


const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return apiResponse.error(res, "Invalid food ID", 400);
    }

    const food = await Food.findById(id);
    if (!food) {
      return apiResponse.error(res, "Food not found", 404);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant || food.restaurant.toString() !== restaurant._id.toString()) {
      return apiResponse.error(res, "Access denied", 403);
    }

    await food.deleteOne();

    return apiResponse.success(res, "Food deleted successfully");
  } catch (error) {
    return apiResponse.error(res, "Server error", 500, error.message);
  }
};

const toggleFoodAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return apiResponse.error(res, "Invalid food ID", 400);
    }

    const food = await Food.findById(id);
    if (!food) {
      return apiResponse.error(res, "Food not found", 404);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant || food.restaurant.toString() !== restaurant._id.toString()) {
      return apiResponse.error(res, "Access denied", 403);
    }

    food.isAvailable = !food.isAvailable;
    await food.save();

    return apiResponse.success(
      res,
      `Food marked as ${food.isAvailable ? "available" : "unavailable"}`,
      food
    );
  } catch (error) {
    return apiResponse.error(res, "Server error", 500, error.message);
  }
};

module.exports = {
  addFood,
  getFoodsByRestaurant,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
};
```

### controllers/orderController.js _(221 lines)_
```javascript
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Restaurant = require("../models/Restaurant");
const apiResponse = require("../utils/apiResponse");
const isValidObjectId = require("../utils/validateObjectId");

/* -------------------------------------------------------
   CREATE ORDER (USER)
------------------------------------------------------- */
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.food");

    if (!cart || cart.items.length === 0) {
      return apiResponse.error(res, "Cart is empty", 400);
    }

    const restaurantIds = cart.items.map(item =>
      item.food.restaurant.toString()
    );

    const uniqueRestaurants = [...new Set(restaurantIds)];
    if (uniqueRestaurants.length !== 1) {
      return apiResponse.error(
        res,
        "Cart items must be from the same restaurant",
        400
      );
    }

    const restaurantId = uniqueRestaurants[0];
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return apiResponse.error(res, "Restaurant not found", 404);
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user.id,
      restaurant: restaurant._id,
      items: cart.items.map(item => ({
        food: item.food._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      totalAmount,
      status: "pending",
    });

    cart.items = [];
    await cart.save();

    return apiResponse.success(res, "Order placed", order, 201);
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return apiResponse.error(res, "Server error", 500);
  }
};

/* -------------------------------------------------------
   USER: GET MY ORDERS
------------------------------------------------------- */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    return apiResponse.success(res, "Orders fetched", orders);
  } catch (err) {
    return apiResponse.error(res, "Server error", 500);
  }
};

/* -------------------------------------------------------
   SHOPKEEPER: GET RESTAURANT ORDERS
------------------------------------------------------- */
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    if (!restaurantId) {
      return apiResponse.error(res, "Restaurant not linked to user", 403);
    }

    const orders = await Order.find({
      restaurant: restaurantId,
    }).sort({ createdAt: -1 });

    return apiResponse.success(res, "Restaurant orders fetched", orders);
  } catch (err) {
    console.error(err);
    return apiResponse.error(res, "Server error", 500);
  }
};


/* -------------------------------------------------------
   SHOPKEEPER: ACCEPT ORDER
------------------------------------------------------- */
exports.acceptOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return apiResponse.error(res, "Invalid order ID", 400);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return apiResponse.error(res, "Restaurant not found", 403);
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
      status: "pending",
    });

    if (!order) {
      return apiResponse.error(
        res,
        "Order not found or already processed",
        404
      );
    }

    order.status = "accepted";
    await order.save();

    return apiResponse.success(res, "Order accepted", order);
  } catch (err) {
    return apiResponse.error(res, "Server error", 500);
  }
};

/* -------------------------------------------------------
   SHOPKEEPER: REJECT ORDER
------------------------------------------------------- */
exports.rejectOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return apiResponse.error(res, "Invalid order ID", 400);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return apiResponse.error(res, "Restaurant not found", 403);
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
      status: "pending",
    });

    if (!order) {
      return apiResponse.error(
        res,
        "Order not found or already processed",
        404
      );
    }

    order.status = "rejected";
    await order.save();

    return apiResponse.success(res, "Order rejected", order);
  } catch (err) {
    return apiResponse.error(res, "Server error", 500);
  }
};

/* -------------------------------------------------------
   SHOPKEEPER: UPDATE ORDER STATUS
------------------------------------------------------- */
exports.updateOrderStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return apiResponse.error(res, "Invalid order ID", 400);
    }

    const { status } = req.body;

    const allowedTransitions = {
      accepted: ["preparing"],
      preparing: ["delivered"],
    };

    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return apiResponse.error(res, "Restaurant not found", 403);
    }

    const order = await Order.findOne({
      _id: req.params.id,
      restaurant: restaurant._id,
    });

    if (!order) {
      return apiResponse.error(res, "Order not found", 404);
    }

    const allowedNext = allowedTransitions[order.status];
    if (!allowedNext || !allowedNext.includes(status)) {
      return apiResponse.error(res, "Invalid status transition", 400);
    }

    order.status = status;
    await order.save();

    return apiResponse.success(res, "Order status updated", order);
  } catch (err) {
    return apiResponse.error(res, "Server error", 500);
  }
};
```

### controllers/restaurantController.js _(179 lines)_
```javascript
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const Food = require("../models/Food");
const apiResponse = require("../utils/apiResponse");
const isValidObjectId = require("../utils/validateObjectId");

/* ================= CREATE RESTAURANT ================= */
const createRestaurant = async (req, res) => {
  try {
    const { name, address, category, openTime, closeTime, phone, description } =
      req.body;

    if (!name || !address) {
      return apiResponse.error(res, "Restaurant name and address are required.", 400);
    }

    if (req.user.role !== "owner") {
      return apiResponse.error(res, "Access denied. Only owners can create a restaurant.", 403);
    }

    const ownerId = req.user.id;

    const existingRestaurant = await Restaurant.findOne({ owner: ownerId });
    if (existingRestaurant) {
      return apiResponse.error(res, "You already have a restaurant.", 409);
    }

    const restaurant = await Restaurant.create({
      name,
      address,
      owner: ownerId,
      category: category || "",
      openTime: openTime || "",
      closeTime: closeTime || "",
      phone: phone || "",
      description: description || "",
    });

    await User.findByIdAndUpdate(ownerId, { restaurant: restaurant._id });

    return apiResponse.success(res, "Restaurant created successfully.", restaurant, 201);
  } catch (error) {
    console.error("Create restaurant error:", error);
    return apiResponse.error(res, "Server error.", 500);
  }
};

/* ================= GET ALL RESTAURANTS ================= */
const getAllRestaurants = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const restaurants = await Restaurant.find(filter).select("-__v");

    if (restaurants.length === 0) {
      return apiResponse.success(res, "No restaurants found.", []);
    }

    return apiResponse.success(res, "Restaurants fetched successfully.", restaurants);
  } catch (error) {
    console.error("Get all restaurants error:", error);
    return apiResponse.error(res, "Server error.", 500);
  }
};

/* ================= GET MY RESTAURANT ================= */
const getMyRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return apiResponse.error(res, "Access denied.", 403);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id }).select("-__v");

    if (!restaurant) {
      return apiResponse.error(res, "No restaurant found. Please create one first.", 404);
    }

    return apiResponse.success(res, "Your restaurant fetched successfully.", restaurant);
  } catch (error) {
    console.error("Get my restaurant error:", error);
    return apiResponse.error(res, "Server error.", 500);
  }
};

/* ================= GET RESTAURANT BY ID ================= */
const getRestaurantById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return apiResponse.error(res, "Invalid restaurant ID.", 400);
    }

    const restaurant = await Restaurant.findById(req.params.id).select("-__v");

    if (!restaurant) {
      return apiResponse.error(res, "Restaurant not found.", 404);
    }

    return apiResponse.success(res, "Restaurant fetched successfully.", restaurant);
  } catch (error) {
    console.error("Get restaurant by ID error:", error);
    return apiResponse.error(res, "Server error.", 500);
  }
};

/* ================= UPDATE MY RESTAURANT ================= */
const updateMyRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return apiResponse.error(res, "Access denied.", 403);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return apiResponse.error(res, "No restaurant found to update.", 404);
    }

    const allowedFields = ["name", "address", "category", "openTime", "closeTime", "phone", "description"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        restaurant[field] = req.body[field];
      }
    });

    await restaurant.save();

    return apiResponse.success(res, "Restaurant updated successfully.", restaurant);
  } catch (error) {
    console.error("Update restaurant error:", error);
    return apiResponse.error(res, "Server error.", 500);
  }
};

/* ================= DELETE MY RESTAURANT ================= */
const deleteMyRestaurant = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return apiResponse.error(res, "Access denied.", 403);
    }

    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return apiResponse.error(res, "No restaurant found to delete.", 404);
    }

    // 🔥 Cascade delete: remove all foods tied to this restaurant
    await Food.deleteMany({ restaurant: restaurant._id });

    await Restaurant.deleteOne({ _id: restaurant._id });

    await User.findByIdAndUpdate(req.user.id, { restaurant: null });

    return apiResponse.success(res, "Restaurant deleted successfully.", null);
  } catch (error) {
    console.error("Delete restaurant error:", error);
    return apiResponse.error(res, "Server error.", 500);
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getMyRestaurant,
  getRestaurantById,
  updateMyRestaurant,
  deleteMyRestaurant,
};
```

### controllers/userController.js _(61 lines)_
```javascript
const User = require("../models/User");
const Cart = require("../models/Cart");
const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");
const apiResponse = require("../utils/apiResponse");

// GET logged-in user's profile
exports.getMyProfile = async (req, res) => {
  try {
    return apiResponse.success(
      res,
      "User profile fetched successfully",
      req.user
    );
  } catch (error) {
    return apiResponse.error(res, "Server error", 500);
  }
};


// GET user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return apiResponse.error(res, "User not found", 404);
    }

    return apiResponse.success(res, "User fetched successfully", user);
  } catch (error) {
    return apiResponse.error(res, "Invalid user ID", 400);
  }
};

// DELETE own account
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cleanup cart
    await Cart.deleteOne({ user: userId });

    // Cleanup restaurant + its foods (Food is linked via restaurant, not owner)
    const restaurant = await Restaurant.findOne({ owner: userId });
    if (restaurant) {
      await Food.deleteMany({ restaurant: restaurant._id });
      await Restaurant.deleteOne({ _id: restaurant._id });
    }

    await User.findByIdAndDelete(userId);

    return apiResponse.success(
      res,
      "Account deleted successfully"
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return apiResponse.error(res, "Server error", 500);
  }
};
```

### middleware/authMiddleware.js _(30 lines)_
```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const apiResponse = require("../utils/apiResponse");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiResponse.error(res, "No token provided", 401);
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return apiResponse.error(res, "User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return apiResponse.error(res, "Invalid token", 401);
  }
};

module.exports = authMiddleware;
```

### middleware/errorMiddleware.js _(9 lines)_
```javascript
const apiResponse = require("../utils/apiResponse");

const errorMiddleware = (err, req, res, next) => {
  console.error(err);
  return apiResponse.error(res, err.message || "Server Error", 500);
};

module.exports = errorMiddleware;
```

### middleware/roleMiddleware.js _(18 lines)_
```javascript
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
```

### middleware/validateAuth.js _(52 lines)_
```javascript
const validateSignup = (req, res, next) => {
  const { email, password, number } = req.body;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Password validation
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters long and include 1 uppercase letter and 1 number",
    });
  }

  // Mobile number validation (SIGNUP ONLY)
  const numberRegex = /^[0-9]{10}$/;

  if (!number || !numberRegex.test(number.toString())) {
    return res.status(400).json({
      success: false,
      message: "Mobile number must be exactly 10 digits",
    });
  }

  next();
};

const validateSignin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  next();
};

module.exports = { validateSignup, validateSignin };
```

### models/Cart.js _(54 lines)_
```javascript
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
```

### models/Food.js _(42 lines)_
```javascript
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSw6lDFqegyGGT6Ptp0C4ZPh-ksB3791uqEqxuWdLOQw&s",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
```

### models/Order.js _(83 lines)_
```javascript
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (items) => items.length > 0,
        "Order must have at least one item",
      ],
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
    "pending",    // user placed order
    "accepted",   // shopkeeper accepted
    "rejected",   // shopkeeper rejected
    "preparing",  // cooking
    "delivered",  // completed
    "cancelled",  // user cancelled (optional)
  ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
```

### models/Restaurant.js _(60 lines)_
```javascript
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 owner = 1 restaurant
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    openTime: {
      type: String,
      default: "",
    },

    closeTime: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
```

### models/User.js _(37 lines)_
```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "owner"],
      default: "user",
    },

    number: { type: String, required: true },
    address: { type: String, required: true },

    // ✅ SINGLE SOURCE OF TRUTH
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
```

### routes/authRoutes.js _(24 lines)_
```javascript
const express = require("express");
const router = express.Router();

const { signup, signin } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateSignup, validateSignin } = require("../middleware/validateAuth");

// Signup with validation
router.post("/signup", validateSignup, signup);

// Signin with validation (optional but recommended)
router.post("/signin", validateSignin, signin);

// Protected route
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = router;
```

### routes/cartRoutes.js _(20 lines)_
```javascript
const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} = require("../controllers/cartController");

const auth = require("../middleware/authMiddleware");

// USER CART ROUTES
router.post("/add", auth, addToCart);
router.get("/", auth, getCart);
router.put("/update", auth, updateCart);
router.delete("/remove/:foodId", auth, removeFromCart);

module.exports = router;
```

### routes/foodRoutes.js _(25 lines)_
```javascript
const express = require("express");
const router = express.Router();

const {
  addFood,
  getFoodsByRestaurant,
  updateFood,
  deleteFood,
  toggleFoodAvailability,
} = require("../controllers/foodController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// PUBLIC
router.get("/restaurant/:id", getFoodsByRestaurant);

// OWNER ONLY
router.post("/", auth, role("owner"), addFood);
router.put("/:id", auth, role("owner"), updateFood);
router.delete("/:id", auth, role("owner"), deleteFood);
router.patch("/:id/toggle", auth, role("owner"), toggleFoodAvailability);

module.exports = router;
```

### routes/orderRoutes.js _(27 lines)_
```javascript
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  acceptOrder,
  rejectOrder,
} = require("../controllers/orderController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// USER ROUTES
router.post("/place", auth, createOrder);
router.get("/my", auth, getMyOrders);

// OWNER ROUTES
router.get("/restaurant", auth, role("owner"), getRestaurantOrders);
router.put("/:id/accept", auth, role("owner"), acceptOrder);
router.put("/:id/reject", auth, role("owner"), rejectOrder);
router.put("/:id/status", auth, role("owner"), updateOrderStatus);

module.exports = router;
```

### routes/restaurantRoutes.js _(28 lines)_
```javascript
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createRestaurant,
  getAllRestaurants,
  getMyRestaurant,
  getRestaurantById,
  updateMyRestaurant,
  deleteMyRestaurant,
} = require("../controllers/restaurantController");

// ⚠️ /me routes MUST be before /:id (applies to ALL methods, including GET)
router.get("/me", authMiddleware, roleMiddleware("owner"), getMyRestaurant);
router.put("/me", authMiddleware, roleMiddleware("owner"), updateMyRestaurant);
router.delete("/me", authMiddleware, roleMiddleware("owner"), deleteMyRestaurant);

// ================= PUBLIC =================
router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

// ================= OWNER ONLY =================
router.post("/", authMiddleware, roleMiddleware("owner"), createRestaurant);

module.exports = router;
```

### routes/testRoutes.js _(15 lines)_
```javascript
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/owner-only", authMiddleware, roleMiddleware("owner"), (req, res) => {
  res.json({
    message: "Welcome owner!",
    user: req.user,
  });
});

module.exports = router;
```

### routes/userRoutes.js _(17 lines)_
```javascript
const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  deleteMyAccount,
} = require("../controllers/userController");

const auth = require("../middleware/authMiddleware");

// Get own profile
router.get("/me", auth, getMyProfile);

// Delete own account
router.delete("/me", auth, deleteMyAccount);

module.exports = router;
```

### utils/apiResponse.js _(20 lines)_
```javascript
const apiResponse = {
  success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error(res, message, statusCode = 400, error = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  },
};

module.exports = apiResponse;
```

### utils/generateToken.js _(10 lines)_
```javascript
const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = generateToken;
```

### utils/validateObjectId.js _(5 lines)_
```javascript
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

module.exports = isValidObjectId;
```

### package.json _(33 lines)_
```json
{
  "name": "localbites-backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "Meet Nakum",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "bcryptjs": "^3.0.3",
    "body-parser": "^2.2.2",
    "cors": "^2.8.6",
    "dotenv": "^17.4.1",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.0.1",
    "multer": "^2.1.1",
    "serverless-http": "^4.0.0",
    "stripe": "^22.0.1",
    "validator": "^13.15.35"
  },
  "devDependencies": {
    "nodemon": "^3.1.14"
  }
}
```

### README.md _(194 lines)_
```markdown
🍽️ LocalBites Backend

LocalBites is a full-stack food ordering backend built with Node.js, Express, MongoDB, designed to support users and restaurant owners with role-based access, cart management, and order processing.

This repository contains the backend API powering the LocalBites mobile app (Flutter).

🚀 Features
🔐 Authentication & Authorization

JWT-based authentication

Role-based access (user, owner)

Secure protected routes

🏪 Restaurant Management (Owner)

Create restaurant (one per owner)

Add food items

Update food details

Delete food

Toggle food availability

🍔 Food Management

Fetch foods by restaurant

Default food image support

Availability control

🛒 Cart System (User)

One cart per user

Add food to cart

Update quantity

Remove items

Cart total calculation handled by backend

📦 Order System

Place order from cart

Cart cleared after order confirmation

User order history

Owner order dashboard

Order status updates (pending, confirmed, preparing, delivered, cancelled)

🧱 Tech Stack

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

bcryptjs (password hashing)

Vercel (deployment)

🌍 Live API Base URL
https://<your-vercel-backend-url>


Replace with your deployed Vercel backend URL.

🔑 Authentication Flow

User/Owner signs up

Login returns JWT token

Token must be sent in all protected requests:

Authorization: Bearer <JWT_TOKEN>

📚 API Endpoints Overview
Auth
Method	Endpoint	Description
POST	/api/auth/signup	Register user / owner
POST	/api/auth/signin	Login and get token
Restaurants
Method	Endpoint	Access
POST	/api/restaurants	Owner
GET	/api/restaurants	Public
Foods
Method	Endpoint	Access
POST	/api/foods	Owner
GET	/api/foods/restaurant/:id	Public
PUT	/api/foods/:id	Owner
DELETE	/api/foods/:id	Owner
PATCH	/api/foods/:id/toggle	Owner
Cart
Method	Endpoint	Access
POST	/api/cart/add	User
GET	/api/cart	User
PUT	/api/cart/update	User
DELETE	/api/cart/remove/:foodId	User
Orders
Method	Endpoint	Access
POST	/api/orders/place	User
GET	/api/orders/my	User
GET	/api/orders/restaurant	Owner
PUT	/api/orders/:id/status	Owner
🧠 Important Backend Rules

Cart is backend-controlled, not frontend-controlled

JWT token must be sent on every protected request

User cart is cleared after order placement

Owners can manage only their own restaurant

Role enforcement handled entirely by backend

⚙️ Environment Variables

Create a .env file:

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

▶️ Run Locally
npm install
npx nodemon api/index.js


Server runs at:

http://localhost:3000

🧪 Testing

Tested using Postman

All endpoints validated with:

valid token

invalid token

role mismatch

empty cart

order flow

📱 Frontend

Frontend is built using Flutter

Backend designed for mobile-first usage

Stateless API design

🛡️ Security Notes

Passwords are hashed using bcrypt

JWT tokens expire automatically

No sensitive data exposed in responses

🧩 Future Enhancements

Payment gateway integration

Admin dashboard

Restaurant analytics

Search & filters

Ratings & reviews

👨‍💻 Author

Meet Nakum
Built with ❤️ for learning, scaling, and real-world usage.
```

### server.js _(21 lines)_
```javascript
// server.js
require("dotenv").config();

const app = require("./api/index");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running locally on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err.message);
    process.exit(1);
  }
};

start();
```

## 🕐 Git

- `5961ce2` 3 hours ago — upadt index.js
- `733616d` 4 hours ago — rewrite a index.js
- `6abc024` 8 hours ago — fix all controller bug
- `c3b5002` 5 months ago — fix some bug in auth middlewar
- `decee3a` 5 months ago — test file

---

## 🐛 Errors

> Auto-scanned: 7/2/2026, 10:48:05 PM

✅ No errors found!
