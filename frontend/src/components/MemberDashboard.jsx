import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import {
  getRestaurants,
  getMenuItems,
  createOrder,
  getUserOrders,
} from '../api/resturant.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── localStorage helpers ──────────────────────────────────────────────────
const LS_CART_KEY = 'member_dashboard_cart';
const LS_RESTAURANT_KEY = 'member_dashboard_selected_restaurant';

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage quota exceeded or private-browsing restriction — fail silently
  }
};

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // fail silently
  }
};
// ──────────────────────────────────────────────────────────────────────────

const MemberDashboard = () => {
  const queryClient = useQueryClient();

  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isAdmin = currentUser?.role === 'ADMIN';

  // Initialise state from localStorage so values survive a page reload
  const [selectedRestaurant, setSelectedRestaurant] = useState(() =>
    loadFromStorage(LS_RESTAURANT_KEY, null)
  );
  const [cart, setCart] = useState(() => loadFromStorage(LS_CART_KEY, []));
  const [activeTab, setActiveTab] = useState('restaurants'); // restaurants, cart, orders

  // ── Persist cart to localStorage whenever it changes ──────────────────
  useEffect(() => {
    saveToStorage(LS_CART_KEY, cart);
  }, [cart]);

  // ── Persist selectedRestaurant to localStorage whenever it changes ─────
  useEffect(() => {
    if (selectedRestaurant) {
      saveToStorage(LS_RESTAURANT_KEY, selectedRestaurant);
    } else {
      removeFromStorage(LS_RESTAURANT_KEY);
    }
  }, [selectedRestaurant]);

  // Fetch Restaurants
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });

  // Fetch Menu Items for selected restaurant
  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems', selectedRestaurant?._id],
    queryFn: () => getMenuItems(selectedRestaurant._id),
    enabled: !!selectedRestaurant,
  });

  // Fetch User Orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getUserOrders,
  });

  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      // Clear cart from both state and localStorage on successful order
      setCart([]);
      removeFromStorage(LS_CART_KEY);
      setActiveTab('orders');
    },
  });

  // ── Cart helpers ───────────────────────────────────────────────────────

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      return existing
        ? prev.map((c) =>
            c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
          )
        : [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((item) => item._id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // ── Handle create order ────────────────────────────────────────────────

  const handleCreateOrder = () => {
    const orderData = {
      restaurantId: selectedRestaurant._id,
      items: cart.map((item) => ({
        menuItemId: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: calculateTotal(),
      paymentMethod: 'CARD',
    };
    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-green-50 to-emerald-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 mb-3">
            Member Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Full system control and management
          </p>
          {/* ✅ Show current user role badge */}
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-amber-500'}`}
            ></span>
            <span className="text-sm font-semibold text-slate-700">
              Logged in as:{' '}
              <span className={isAdmin ? 'text-emerald-600' : 'text-amber-600'}>
                {currentUser?.role || 'Unknown'}
              </span>
            </span>
          </div>
        </div>

        {/* Info Banner - Members cannot checkout */}
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-lg mb-8 shadow-md">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-amber-500 mr-3 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-amber-800 font-semibold mb-1">
                Member Access
              </h3>
              <p className="text-amber-700 text-sm">
                As a member, you can browse restaurants and add items to your
                cart, but you cannot place orders or checkout.
                <span className="font-semibold">
                  {' '}
                  Contact a manager or admin to place orders.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">
                  Restaurants
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {restaurants.length}
                </p>
              </div>
              <div className="bg-linear-to-br from-orange-500 to-red-500 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">
                  Cart Items
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {cart.length}
                </p>
              </div>
              <div className="bg-linear-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">
                  My Orders
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {orders.length}
                </p>
              </div>
              <div className="bg-linear-to-br from-emerald-500 to-teal-500 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">
                  Cart Total
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  ${calculateTotal().toFixed(2)}
                </p>
              </div>
              <div className="bg-linear-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-4 bg-white p-2 rounded-xl shadow-md border border-slate-200">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'restaurants'
                  ? 'bg-linear-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="hidden sm:inline">Restaurants</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-200 relative ${
                activeTab === 'cart'
                  ? 'bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'orders'
                  ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="hidden sm:inline">My Orders</span>
              </span>
            </button>
          </div>
        </div>

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            {/* Restaurant Selection */}
            {!selectedRestaurant ? (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                  Browse Restaurants
                </h2>
                {restaurantsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
                      >
                        <div className="h-40 bg-slate-200 rounded-xl mb-4"></div>
                        <div className="h-6 bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant) => (
                      <div
                        key={restaurant._id}
                        onClick={() => setSelectedRestaurant(restaurant)}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 border border-slate-200 hover:shadow-2xl"
                      >
                        <div className="h-48 bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <svg
                            className="w-20 h-20 text-white opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {restaurant.name}
                          </h3>
                          <p className="text-slate-600 text-sm mb-4">
                            {restaurant.cuisine || 'Various cuisines'}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-amber-500">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {restaurant.rating || '4.5'}
                            </span>
                            <span className="text-slate-500">
                              {restaurant.location || 'Nearby'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Menu Items */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <button
                      onClick={() => setSelectedRestaurant(null)}
                      className="flex items-center text-emerald-600 hover:text-emerald-700 font-semibold mb-2"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      Back to Restaurants
                    </button>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedRestaurant.name}
                    </h2>
                  </div>
                </div>

                {menuLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl shadow-lg p-6 animate-pulse"
                      >
                        <div className="h-32 bg-slate-200 rounded-xl mb-4"></div>
                        <div className="h-6 bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <svg
                      className="w-16 h-16 text-slate-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-slate-600 font-medium">
                      No menu items available
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow duration-300"
                      >
                        <div className="h-40 bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-white opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-slate-800 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                            {item.description || 'Delicious food item'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-emerald-600">
                              ${item.price.toFixed(2)}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Shopping Cart
            </h2>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-24 h-24 text-slate-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-slate-600 font-medium mb-4">
                  Your cart is empty
                </p>
                <button
                  onClick={() => setActiveTab('restaurants')}
                  className="px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Browse Restaurants
                </button>
              </div>
            ) : (
              <div>
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex-1 mb-4 sm:mb-0">
                        <h3 className="font-semibold text-slate-800 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-300 px-3 py-2">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            className="text-slate-600 hover:text-slate-800 font-bold"
                          >
                            -
                          </button>
                          <span className="font-semibold text-slate-800 min-w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            className="text-slate-600 hover:text-slate-800 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-slate-800 min-w-20">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-bold text-slate-800">
                      Total:
                    </span>
                    <span className="text-3xl font-bold text-emerald-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>

                  {/* Member Restriction Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start">
                      <svg
                        className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <div>
                        <h4 className="text-amber-800 font-semibold text-sm mb-1">
                          Checkout Restricted
                        </h4>
                        <p className="text-amber-700 text-xs">
                          Members cannot place orders directly. Please contact
                          your manager or administrator to complete this
                          purchase.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateOrder}
                    disabled={createOrderMutation.isLoading}
                    className="w-full px-6 py-4 bg-linear-to-r from-slate-400 to-slate-500 text-white text-lg font-bold rounded-xl shadow-lg cursor-not-allowed opacity-60"
                    title="Members cannot checkout - Contact your manager"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Checkout Unavailable (Members Only)
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              My Orders
            </h2>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-6 bg-slate-50 rounded-xl animate-pulse"
                  >
                    <div className="h-6 bg-slate-200 rounded mb-3 w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-24 h-24 text-slate-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-slate-600 font-medium">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-6 bg-linear-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-slate-800">
                            Order #{order._id.slice(-8)}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : order.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700'
                                  : order.status === 'CANCELLED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">
                          <span className="font-semibold">Restaurant:</span>{' '}
                          {order.restaurant?.name || 'N/A'}
                        </p>
                        <p className="text-slate-600 text-sm mb-2">
                          <span className="font-semibold">Items:</span>{' '}
                          {order.items?.length || 0}
                        </p>
                        <p className="text-lg font-bold text-emerald-600">
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <span className="px-4 py-2 bg-slate-200 text-slate-600 font-semibold rounded-lg cursor-not-allowed">
                          View Only
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDashboard;
