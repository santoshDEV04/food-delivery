import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import {
  getAllUsers,
  deleteUser,
  createManager,
  getRestaurants,
  getMenuItems,
  getAllOrders,
  createOrder,
  placeOrder,
  cancelOrder,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../api/admin.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // ── Read current user from localStorage ──────────────────────────────────
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;
  const isAdmin = currentUser?.role === 'ADMIN'; // ✅ ADMIN check

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
  });

  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
    const saved = localStorage.getItem('selectedRestaurant');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [activeTab, setActiveTab] = useState('users');

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save selected restaurant to localStorage whenever it changes
  useEffect(() => {
    if (selectedRestaurant) {
      localStorage.setItem(
        'selectedRestaurant',
        JSON.stringify(selectedRestaurant)
      );
    } else {
      localStorage.removeItem('selectedRestaurant');
    }
  }, [selectedRestaurant]);

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems', selectedRestaurant?._id],
    queryFn: () => getMenuItems(selectedRestaurant._id),
    enabled: !!selectedRestaurant,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getAllOrders,
  });

  // ===== MUTATIONS =====
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });

  const createManagerMutation = useMutation({
    mutationFn: createManager,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setFormData({ name: '', email: '', password: '', country: '' });
      setShowCreateForm(false);
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: ({ restaurantId, data }) => createMenuItem(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menuItems']);
      setMenuItemForm({ name: '', description: '', price: '', category: '' });
      setShowMenuItemForm(false);
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries(['menuItems']);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setCart([]);
      localStorage.removeItem('cart');
      setActiveTab('orders');
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: ({ orderId, paymentData }) => placeOrder(orderId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });

  // ✅ CLIENT-SIDE ONLY — no API call, just updates the local cache directly
  const updatePaymentMutation = {
    isPending: false,
    isLoading: false,
    mutate: ({ orderId, paymentMethod }) => {
      // Cancel any in-flight refetches so they don't overwrite our update
      queryClient.cancelQueries(['orders']);
      // Directly patch the matching order in the cache
      queryClient.setQueryData(['orders'], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((order) =>
          order._id === orderId ? { ...order, paymentMethod } : order
        );
      });
      setSelectedOrder(null);
    },
  };

  // ===== CART FUNCTIONS =====
  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setCart(
      cart.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    const orderData = {
      restaurantId: selectedRestaurant._id,
      items: cart.map((item) => ({
        menuItemId: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: calculateTotal(),
      paymentMethod: 'CARD',
      country: currentUser?.country || 'INDIA',
    };
    createOrderMutation.mutate(orderData);
  };

  // Loading State
  if (usersLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-xl font-semibold text-slate-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );

  // Error State
  if (usersError)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-slate-600">{usersError.message}</p>
        </div>
      </div>
    );

  const managers = users.filter((u) => u.role === 'MANAGER');
  const members = users.filter((u) => u.role === 'MEMBER');

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 mb-3">
            Admin Dashboard
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <p className="text-blue-100 text-sm font-medium mb-2">
              Total Users
            </p>
            <p className="text-4xl font-bold">{users.length}</p>
          </div>
          <div className="bg-linear-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <p className="text-orange-100 text-sm font-medium mb-2">
              Restaurants
            </p>
            <p className="text-4xl font-bold">{restaurants.length}</p>
          </div>
          <div className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <p className="text-emerald-100 text-sm font-medium mb-2">
              Total Orders
            </p>
            <p className="text-4xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <p className="text-purple-100 text-sm font-medium mb-2">
              Cart Total
            </p>
            <p className="text-4xl font-bold">${calculateTotal().toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-white rounded-2xl shadow-lg p-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'restaurants'
                ? 'bg-linear-to-r from-orange-500 to-red-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Orders
          </button>
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Create Manager Button */}
            <div className="text-center">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Create Manager
              </button>
            </div>

            {/* Create Manager Form */}
            {showCreateForm && (
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Create New Manager
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createManagerMutation.mutate(formData);
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          name: '',
                          email: '',
                          password: '',
                          country: '',
                        });
                        setShowCreateForm(false);
                      }}
                      className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      {createManagerMutation.isLoading
                        ? 'Creating...'
                        : 'Create Manager'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">All Users</h2>
                <p className="text-slate-600 mt-1">
                  Manage and monitor user accounts
                </p>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600 font-medium">No users found</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user._id}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-800">
                            {user.name}
                          </h3>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        <span className="font-semibold">Country:</span>{' '}
                        {user.country}
                      </p>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${user.name}?`
                            )
                          ) {
                            deleteMutation.mutate(user._id);
                          }
                        }}
                        disabled={deleteMutation.isLoading}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-4 px-4 font-bold text-slate-700">
                        Name
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">
                        Email
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">
                        Role
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">
                        Country
                      </th>
                      <th className="text-center py-4 px-4 font-bold text-slate-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {user.email}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {user.country}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete ${user.name}?`
                                )
                              ) {
                                deleteMutation.mutate(user._id);
                              }
                            }}
                            disabled={deleteMutation.isLoading}
                            className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* RESTAURANTS TAB */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            {!selectedRestaurant ? (
              <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  All Restaurants
                </h2>
                {restaurantsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-slate-50 rounded-2xl p-6 animate-pulse"
                      >
                        <div className="h-32 bg-slate-200 rounded-xl mb-4"></div>
                        <div className="h-6 bg-slate-200 rounded mb-3"></div>
                        <div className="h-4 bg-slate-200 rounded"></div>
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
                        <div className="h-40 bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center">
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
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>⭐ {restaurant.rating || '4.5'}</span>
                            <span>📍 {restaurant.location || 'Nearby'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className="flex items-center text-orange-600 hover:text-orange-700 font-semibold"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to Restaurants
                  </button>
                  <button
                    onClick={() => setShowMenuItemForm(!showMenuItemForm)}
                    className="px-6 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Add Menu Item
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    {selectedRestaurant.name} - Menu
                  </h2>

                  {showMenuItemForm && (
                    <div className="mb-8 p-6 bg-linear-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">
                        Add New Menu Item
                      </h3>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          createMenuItemMutation.mutate({
                            restaurantId: selectedRestaurant._id,
                            data: {
                              ...menuItemForm,
                              price: parseFloat(menuItemForm.price),
                            },
                          });
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={menuItemForm.name}
                            onChange={(e) =>
                              setMenuItemForm({
                                ...menuItemForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={menuItemForm.price}
                            onChange={(e) =>
                              setMenuItemForm({
                                ...menuItemForm,
                                price: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={menuItemForm.description}
                            onChange={(e) =>
                              setMenuItemForm({
                                ...menuItemForm,
                                description: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                            rows="3"
                          />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setMenuItemForm({
                                name: '',
                                description: '',
                                price: '',
                                category: '',
                              });
                              setShowMenuItemForm(false);
                            }}
                            className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-3 bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl"
                          >
                            Add Item
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200"
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => addToCart(item)}
                                className="px-3 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete ${item.name}?`)) {
                                    deleteMenuItemMutation.mutate(item._id);
                                  }
                                }}
                                className="px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {cart.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">
                        Cart ({cart.length} items)
                      </h3>
                      <div className="space-y-3 mb-4">
                        {cart.map((item) => (
                          <div
                            key={item._id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-slate-800">
                                {item.name}
                              </p>
                              <p className="text-sm text-slate-600">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-300 px-2 py-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(item._id, item.quantity - 1)
                                  }
                                  className="text-slate-600 font-bold"
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
                                  className="text-slate-600 font-bold"
                                >
                                  +
                                </button>
                              </div>
                              <span className="font-bold text-slate-800 min-w-20 text-right">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
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
                      <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                        <span className="text-xl font-bold text-slate-800">
                          Total:
                        </span>
                        <span className="text-3xl font-bold text-emerald-600">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        disabled={createOrderMutation.isLoading}
                        className="w-full mt-4 px-6 py-4 bg-linear-to-r from-emerald-500 to-teal-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        {createOrderMutation.isLoading
                          ? 'Processing...'
                          : 'Place Order & Checkout'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">All Orders</h2>

              {/* ✅ ADMIN badge shown in orders tab header */}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Admin — Payment editing enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {currentUser?.role} — Payment editing restricted
                </span>
              )}
            </div>

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
                        <p className="text-slate-600 text-sm mb-1">
                          <span className="font-semibold">Restaurant:</span>{' '}
                          {order.restaurant?.name || 'N/A'}
                        </p>
                        <p className="text-slate-600 text-sm mb-1">
                          <span className="font-semibold">Items:</span>{' '}
                          {order.items?.length || 0}
                        </p>
                        <p className="text-slate-600 text-sm mb-2 flex items-center gap-2">
                          <span className="font-semibold">Payment:</span>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-slate-700">
                            {order.paymentMethod || 'N/A'}
                          </span>
                        </p>
                        <p className="text-lg font-bold text-emerald-600">
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 items-center">
                        {/* ✅ UPDATE PAYMENT — only visible to ADMIN */}
                        {isAdmin ? (
                          <button
                            onClick={() => {
                              if (selectedOrder?._id === order._id) {
                                setSelectedOrder(null);
                              } else {
                                setSelectedOrder(order);
                                setPaymentMethod(order.paymentMethod || 'CARD');
                              }
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:shadow-md transform hover:scale-105 transition-all duration-200"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                            Update Payment
                          </button>
                        ) : (
                          // ✅ Non-admins see a locked button (no functionality)
                          <div
                            title={`Only ADMIN can change payment method. You are ${currentUser?.role}.`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-400 font-semibold rounded-lg cursor-not-allowed select-none"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Payment Locked
                          </div>
                        )}

                        <button
                          onClick={() => cancelOrderMutation.mutate(order._id)}
                          disabled={
                            cancelOrderMutation.isLoading ||
                            order.status === 'CANCELLED'
                          }
                          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>

                    {/* ✅ Update Payment Panel — only renders for ADMIN */}
                    {isAdmin && selectedOrder?._id === order._id && (
                      <div className="mt-4 p-5 bg-white rounded-xl border-2 border-blue-200 shadow-inner animate-fadeIn">
                        <div className="flex items-center gap-2 mb-4">
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          <h4 className="font-bold text-slate-800">
                            Update Payment Method
                          </h4>
                          <span className="ml-auto text-xs text-slate-400">
                            Current:{' '}
                            <span className="font-mono font-bold text-slate-600">
                              {order.paymentMethod}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none font-semibold text-slate-700 bg-white"
                          >
                            <option value="CARD">💳 Credit / Debit Card</option>
                            <option value="CASH">💵 Cash</option>
                            <option value="UPI">📱 UPI</option>
                          </select>
                          <button
                            onClick={() =>
                              updatePaymentMutation.mutate({
                                orderId: order._id,
                                paymentMethod,
                              })
                            }
                            disabled={updatePaymentMutation.isLoading}
                            className="px-6 py-2.5 bg-linear-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                          >
                            {updatePaymentMutation.isLoading
                              ? 'Saving...'
                              : 'Save'}
                          </button>
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="px-5 py-2.5 border-2 border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
