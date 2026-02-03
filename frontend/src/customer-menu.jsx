import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Minus, X, Check, Clock, ChevronDown, Search, LogOut, ChefHat, Bell, CheckCircle } from 'lucide-react';

// Restaurant data (in real app, this comes from QR scan parameter)
const restaurantData = {
  id: 'rest_001',
  tableNumber: '12',
  name: "Spice Symphony",
  logo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
  cuisine: "Indian Restaurant",
  address: "FC Road, Pune"
};

// Mock data for when backend is not available
const mockCategories = [
  { id: 1, name: 'Starters', description: 'Appetizers', isActive: true },
  { id: 2, name: 'Main Course', description: 'Main dishes', isActive: true },
  { id: 3, name: 'Rice & Breads', description: 'Rice and breads', isActive: true },
  { id: 4, name: 'Desserts', description: 'Sweet treats', isActive: true },
  { id: 5, name: 'Beverages', description: 'Drinks', isActive: true }
];

const mockMenuItems = [
  {
    id: 1,
    name: "Paneer Tikka",
    description: "Grilled cottage cheese marinated in spices",
    price: 285,
    imageurl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=300&fit=crop",
    categoryId: 1,
    isVeg: true,
    isAvailable: true
  },
  {
    id: 2,
    name: "Chicken Tikka",
    description: "Tender chicken pieces marinated and grilled",
    price: 325,
    imageurl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
    categoryId: 1,
    isVeg: false,
    isAvailable: true
  },
  {
    id: 3,
    name: "Butter Chicken",
    description: "Rich tomato cream sauce with tender chicken",
    price: 385,
    imageurl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop",
    categoryId: 2,
    isVeg: false,
    isAvailable: true
  },
  {
    id: 4,
    name: "Paneer Butter Masala",
    description: "Cottage cheese in creamy tomato gravy",
    price: 325,
    imageurl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
    categoryId: 2,
    isVeg: true,
    isAvailable: true
  },
  {
    id: 5,
    name: "Dal Makhani",
    description: "Black lentils slow-cooked with butter",
    price: 285,
    imageurl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
    categoryId: 2,
    isVeg: true,
    isAvailable: true
  },
  {
    id: 6,
    name: "Biryani",
    description: "Fragrant basmati rice with aromatic spices",
    price: 425,
    imageurl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
    categoryId: 3,
    isVeg: false,
    isAvailable: true
  },
  {
    id: 7,
    name: "Garlic Naan",
    description: "Soft flatbread with garlic and butter",
    price: 65,
    imageurl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
    categoryId: 3,
    isVeg: true,
    isAvailable: true
  },
  {
    id: 8,
    name: "Jeera Rice",
    description: "Fragrant basmati rice with cumin",
    price: 175,
    imageurl: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=300&fit=crop",
    categoryId: 3,
    isVeg: true,
    isAvailable: true
  },
  {
    id: 9,
    name: "Gulab Jamun",
    description: "Sweet milk dumplings in sugar syrup",
    price: 125,
    imageurl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop",
    categoryId: 4,
    isVeg: true,
    isAvailable: true
  },
  {
    id: 10,
    name: "Mango Lassi",
    description: "Refreshing yogurt drink with mango",
    price: 95,
    imageurl: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",
    categoryId: 5,
    isVeg: true,
    isAvailable: true
  }
];

const CustomerMenuApp = ({ user, onLogout }) => {
  const [lastKnownStatus, setLastKnownStatus] = useState(null);
  const [menuCategories, setMenuCategories] = useState(mockCategories);
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CASH');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Order tracking state
  const [activeOrder, setActiveOrder] = useState(null);
  const [showOrderTracker, setShowOrderTracker] = useState(false);

  // Poll for order status when there's an active order
  const fetchOrderStatus = useCallback(async () => {
    if (!activeOrder?.orderId) return;
  
    try {
      const { orderAPI } = await import('./api-service.js');
  
      const orderData = await orderAPI.getById(activeOrder.orderId);
  
      if (!orderData) return;
  
      // 🔔 STATUS CHANGED
      if (orderData.status !== lastKnownStatus) {
        setActiveOrder(orderData);
        setLastKnownStatus(orderData.status);
  
        // Show tracker ONLY when status changes
        setShowOrderTracker(true);
      }
  
      // Stop polling when finished
      if (orderData.status === 'COMPLETED' || orderData.status === 'CANCELLED') {
        setTimeout(() => setShowOrderTracker(false), 10000);
      }
    } catch (err) {
      console.log('Order status fetch failed:', err);
    }
  }, [activeOrder?.orderId, lastKnownStatus]);
  
  // const fetchOrderStatus = useCallback(async () => {
  //   if (!activeOrder || !activeOrder.orderId) return;
    
  //   try {
  //     const apiService = await import('./api-service.js').catch(() => null);
  //     if (apiService && apiService.orderAPI) {
  //       const orderData = await apiService.orderAPI.getById(activeOrder.orderId);
  //       if (orderData) {
  //         setActiveOrder(orderData);
  //         // Stop tracking if order is completed or cancelled
  //         if (orderData.status === 'COMPLETED' || orderData.status === 'CANCELLED') {
  //           // Keep showing for a moment then auto-hide
  //           setTimeout(() => {
  //             setShowOrderTracker(false);
  //           }, 10000); // Hide after 10 seconds when completed
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.log('Failed to fetch order status:', err);
  //   }
  // }, [activeOrder]);

  // Poll order status every 7 seconds
  useEffect(() => {
    if (!activeOrder?.orderId) return;
  
    // Poll only while order is active
    if (activeOrder.status === 'COMPLETED' || activeOrder.status === 'CANCELLED') {
      return;
    }
  
    const interval = setInterval(fetchOrderStatus, 7000); // 7s is enough
    return () => clearInterval(interval);
  }, [activeOrder?.orderId, activeOrder?.status, fetchOrderStatus]);
  
  // useEffect(() => {
  //   if (!activeOrder || activeOrder.status === 'COMPLETED' || activeOrder.status === 'CANCELLED') {
  //     return;
  //   }
    
  //   const interval = setInterval(fetchOrderStatus, 5000);
  //   return () => clearInterval(interval);
  // }, [activeOrder, fetchOrderStatus]);

  // Optional: Try to fetch from backend, fallback to mock data
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Try to import API service
        const apiService = await import('./api-service.js').catch(() => null);
        
        if (apiService) {
          setLoading(true);
          
          // Fetch categories
          const categories = await apiService.categoryAPI.getAll();
          setMenuCategories(categories.filter(cat => cat.isActive));
          
          // Fetch food items
          const items = await apiService.foodItemAPI.getAll();
          setMenuItems(items.filter(item => item.isAvailable));
          
          setLoading(false);
        }
      } catch (err) {
        // Silently use mock data if backend fails
        console.log('Using mock data - backend not available');
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem.quantity > 1) {
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const placeOrder = async () => {
    try {
      // Try to use backend API
      const apiService = await import('./api-service.js').catch(() => null);
      
      if (apiService) {
        const orderResponse = await apiService.orderAPI.create({
          userId: user?.id || 1,
          tableNumber: restaurantData.tableNumber,
          orderType: 'DINE_IN',
          items: cart
        });
        setOrderNumber(orderResponse.orderId);

        // Open payment method sheet to choose how to pay
        setShowPaymentSheet(true);
      } else {
        // Mock order ID
        const orderId = 'ORD' + Date.now().toString().slice(-6);
        setOrderNumber(orderId);
        setShowPaymentSheet(true);
      }
      
      setShowCart(false);
      
    } catch (err) {
      // Fallback to mock order
      const orderId = 'ORD' + Date.now().toString().slice(-6);
      setOrderNumber(orderId);
      setShowPaymentSheet(true);
      setShowCart(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = Math.round(cartTotal * 0.05);

  const handleConfirmPayment = async () => {
    try {
      setProcessingPayment(true);
      const apiService = await import('./api-service.js').catch(() => null);

      if (apiService && apiService.orderAPI && apiService.paymentAPI) {
        // If using backend payment API (if you add paymentAPI export later)
        await apiService.paymentAPI.makePayment({
          orderId: orderNumber,
          paymentMethod: selectedPaymentMethod,
        });
      } else if (apiService && apiService.orderAPI) {
        // Backend has /api/payments but our api-service doesn't expose it yet.
        // Make a direct fetch call as a fallback so the choice still reaches the backend.
        const token = localStorage.getItem('token');
        await fetch('http://localhost:8080/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            orderId: orderNumber,
            paymentMethod: selectedPaymentMethod,
          }),
        }).catch(() => {});
      }

      setShowPaymentSheet(false);
      setShowOrderSuccess(true);
      
      // Start tracking the order
      setActiveOrder({
        orderId: orderNumber,
        status: 'PENDING',
        items: cart,
        totalAmount: cartTotal + gst,
        createdAt: new Date().toISOString(),
      });
      setLastKnownStatus('PENDING'); 
      setShowOrderTracker(false);

      setTimeout(() => {
        setCart([]);
        setOrderPlaced(true);
      }, 1500);
    } catch (e) {
      setError('Failed to process payment. Please try again or pay at counter.');
      setShowPaymentSheet(false);
      setShowOrderSuccess(true);
      
      // Still track the order even if payment API failed
      setActiveOrder({
        orderId: orderNumber,
        status: 'PENDING',
        items: cart,
        totalAmount: cartTotal + gst,
        createdAt: new Date().toISOString(),
      });
      setShowOrderTracker(true);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="customer-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap');
        
        :root {
          --primary: #E63946;
          --primary-dark: #C1121F;
          --accent: #2A9D8F;
          --warning: #F4A261;
          --dark: #1D1D1F;
          --gray: #86868B;
          --light-gray: #F5F5F7;
          --white: #FFFFFF;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Manrope', sans-serif;
          background: var(--light-gray);
          color: var(--dark);
          -webkit-font-smoothing: antialiased;
        }
        
        .customer-app {
          min-height: 100vh;
          padding-bottom: 100px;
        }
        
        /* Restaurant Header */
        .restaurant-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          padding: 2rem 1.5rem 3rem;
          position: relative;
          overflow: hidden;
        }
        
        .restaurant-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 400px;
          height: 400px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          animation: float 20s infinite ease-in-out;
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, 30px); }
        }
        
        .header-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .logout-btn {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .logout-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .restaurant-info {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        
        .restaurant-logo {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          object-fit: cover;
          border: 3px solid rgba(255,255,255,0.3);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        
        .restaurant-details h1 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 900;
          margin-bottom: 0.25rem;
        }
        
        .restaurant-details p {
          opacity: 0.9;
          font-size: 0.95rem;
        }
        
        .table-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          padding: 0.625rem 1.25rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1rem;
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        /* Search Bar */
        .search-section {
          padding: 1.5rem;
          background: white;
          max-width: 1200px;
          margin: -1.5rem auto 0;
          border-radius: 20px 20px 0 0;
          position: relative;
          z-index: 2;
        }
        
        .search-container {
          position: relative;
        }
        
        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid var(--light-gray);
          border-radius: 14px;
          font-size: 1rem;
          font-family: 'Manrope', sans-serif;
          transition: all 0.3s ease;
          background: var(--light-gray);
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 4px 16px rgba(230, 57, 70, 0.15);
        }
        
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
        }
        
        /* Categories */
        .categories-section {
          padding: 0 1.5rem 1rem;
          background: white;
          max-width: 1200px;
          margin: 0 auto;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        
        .categories-scroll {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding: 1rem 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .categories-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .category-chip {
          flex-shrink: 0;
          padding: 0.75rem 1.25rem;
          background: var(--light-gray);
          border: 2px solid transparent;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .category-chip:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
        }
        
        .category-chip.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        /* Menu Items */
        .menu-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        .menu-grid {
          display: grid;
          gap: 1.25rem;
        }
        
        .menu-item {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }
        
        .menu-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        
        .menu-item-image-container {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }
        
        .menu-item-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .menu-item-content {
          flex: 1;
          padding: 1rem 1rem 1rem 0;
          display: flex;
          flex-direction: column;
        }
        
        .item-header {
          display: flex;
          align-items: start;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .veg-indicator {
          width: 18px;
          height: 18px;
          border: 2px solid var(--accent);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .veg-indicator::after {
          content: '';
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
        }
        
        .veg-indicator.non-veg {
          border-color: #D32F2F;
        }
        
        .veg-indicator.non-veg::after {
          background: #D32F2F;
        }
        
        .item-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 0.25rem;
        }
        
        .item-description {
          color: var(--gray);
          font-size: 0.875rem;
          line-height: 1.4;
          margin-bottom: 0.75rem;
          flex: 1;
        }
        
        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .item-price {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--dark);
        }
        
        .add-button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.625rem 1.5rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Manrope', sans-serif;
          font-size: 0.9rem;
        }
        
        .add-button:hover {
          background: var(--primary-dark);
          transform: scale(1.05);
        }
        
        .add-button:active {
          transform: scale(0.98);
        }
        
        /* Cart Float Button */
        .cart-float {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(42, 157, 143, 0.4);
          transition: all 0.3s ease;
          z-index: 100;
          min-width: 200px;
          justify-content: space-between;
          animation: slideUp 0.5s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        .cart-float:hover {
          transform: translateX(-50%) translateY(-4px);
          box-shadow: 0 12px 40px rgba(42, 157, 143, 0.5);
        }
        
        .cart-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .cart-count {
          background: rgba(255,255,255,0.3);
          padding: 0.25rem 0.625rem;
          border-radius: 20px;
          font-weight: 800;
          font-size: 0.85rem;
        }
        
        .cart-total {
          font-weight: 800;
          font-size: 1.1rem;
        }
        
        /* Cart Modal */
        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          z-index: 200;
          animation: fadeIn 0.3s ease-out;
          backdrop-filter: blur(4px);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .cart-modal {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-radius: 24px 24px 0 0;
          max-height: 85vh;
          z-index: 201;
          display: flex;
          flex-direction: column;
          animation: slideUpModal 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes slideUpModal {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .cart-header {
          padding: 1.5rem;
          border-bottom: 2px solid var(--light-gray);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .cart-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 900;
        }
        
        .close-cart {
          background: var(--light-gray);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .close-cart:hover {
          background: var(--primary);
          color: white;
          transform: rotate(90deg);
        }
        
        .cart-items-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        
        .cart-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--light-gray);
        }
        
        .cart-item-image {
          width: 70px;
          height: 70px;
          border-radius: 10px;
          object-fit: cover;
        }
        
        .cart-item-details {
          flex: 1;
        }
        
        .cart-item-name {
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .cart-item-price {
          color: var(--gray);
          font-size: 0.9rem;
        }
        
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .qty-btn {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .qty-btn:hover {
          background: var(--primary-dark);
          transform: scale(1.1);
        }
        
        .quantity {
          font-weight: 700;
          min-width: 24px;
          text-align: center;
        }
        
        .cart-summary {
          padding: 1.5rem;
          background: var(--light-gray);
          border-radius: 16px 16px 0 0;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }
        
        .summary-row.total {
          font-size: 1.25rem;
          font-weight: 800;
          padding-top: 1rem;
          margin-top: 1rem;
          border-top: 2px solid var(--dark);
        }
        
        .place-order-btn {
          width: 100%;
          background: var(--accent);
          color: white;
          border: none;
          padding: 1.25rem;
          border-radius: 14px;
          font-weight: 800;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
          font-family: 'Manrope', sans-serif;
        }
        
        .place-order-btn:hover {
          background: #248075;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(42, 157, 143, 0.3);
        }
        
        /* Order Success */
        .order-success-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-out;
        }
        
        .success-content {
          background: white;
          padding: 3rem 2rem;
          border-radius: 24px;
          text-align: center;
          max-width: 400px;
          margin: 0 1rem;
          animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .success-icon {
          width: 80px;
          height: 80px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        
        .success-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          color: var(--dark);
        }
        
        .order-number {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          margin: 1rem 0;
        }
        
        .success-content p {
          color: var(--gray);
          margin-bottom: 2rem;
        }
        
        .continue-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Manrope', sans-serif;
          font-size: 1rem;
        }
        
        .continue-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          color: var(--gray);
        }
        
        .empty-state h3 {
          margin-top: 1rem;
          color: var(--dark);
        }
        
        @media (min-width: 768px) {
          .cart-modal {
            left: 50%;
            transform: translateX(-50%);
            max-width: 500px;
            bottom: 2rem;
            border-radius: 24px;
            max-height: 80vh;
          }
          
          .menu-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Order Status Tracker */
        .order-tracker-float {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background: white;
          border-radius: 16px;
          padding: 0.75rem 1rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          z-index: 150;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: slideInRight 0.4s ease-out;
          border: 2px solid var(--accent);
          max-width: 220px;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .order-tracker-float:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.2);
        }

        .tracker-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .tracker-icon.pending {
          background: #FEF3C7;
          color: #D97706;
          animation: pulse 2s infinite;
        }

        .tracker-icon.preparing {
          background: #DBEAFE;
          color: #2563EB;
          animation: pulse 1.5s infinite;
        }

        .tracker-icon.ready {
          background: #D1FAE5;
          color: #059669;
          animation: bounce 1s infinite;
        }

        .tracker-icon.completed {
          background: #D1FAE5;
          color: #059669;
        }

        .tracker-icon.cancelled {
          background: #FEE2E2;
          color: #DC2626;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .tracker-info {
          flex: 1;
          min-width: 0;
        }

        .tracker-order-id {
          font-size: 0.75rem;
          color: var(--gray);
        }

        .tracker-status {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--dark);
        }

        /* Order Tracker Modal */
        .tracker-modal {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-radius: 24px 24px 0 0;
          max-height: 70vh;
          z-index: 201;
          display: flex;
          flex-direction: column;
          animation: slideUpModal 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .tracker-header {
          padding: 1.5rem;
          border-bottom: 2px solid var(--light-gray);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tracker-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 900;
        }

        .tracker-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .status-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }

        .status-step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          position: relative;
          padding-bottom: 1.5rem;
        }

        .status-step:last-child {
          padding-bottom: 0;
        }

        .status-step::before {
          content: '';
          position: absolute;
          left: 18px;
          top: 40px;
          bottom: 0;
          width: 2px;
          background: var(--light-gray);
        }

        .status-step:last-child::before {
          display: none;
        }

        .status-step.active::before {
          background: var(--accent);
        }

        .status-step.completed::before {
          background: var(--accent);
        }

        .step-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: var(--light-gray);
          color: var(--gray);
          position: relative;
          z-index: 1;
        }

        .status-step.active .step-icon {
          background: var(--accent);
          color: white;
          animation: pulse 2s infinite;
        }

        .status-step.completed .step-icon {
          background: var(--accent);
          color: white;
        }

        .step-content h4 {
          font-weight: 700;
          font-size: 1rem;
          color: var(--gray);
          margin-bottom: 0.25rem;
        }

        .status-step.active .step-content h4,
        .status-step.completed .step-content h4 {
          color: var(--dark);
        }

        .step-content p {
          font-size: 0.85rem;
          color: var(--gray);
        }

        .tracker-order-details {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid var(--light-gray);
        }

        .tracker-order-details h4 {
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .tracker-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--light-gray);
        }

        .tracker-item:last-child {
          border-bottom: none;
        }

        .dismiss-btn {
          width: 100%;
          background: var(--light-gray);
          color: var(--dark);
          border: none;
          padding: 1rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 1.5rem;
          transition: all 0.3s ease;
          font-family: 'Manrope', sans-serif;
        }

        .dismiss-btn:hover {
          background: var(--primary);
          color: white;
        }

        @media (min-width: 768px) {
          .tracker-modal {
            left: 50%;
            transform: translateX(-50%);
            max-width: 450px;
            bottom: 2rem;
            border-radius: 24px;
          }
        }
      `}</style>

      {/* Restaurant Header */}
      <div className="restaurant-header">
        <div className="header-content">
          <div className="header-top">
            <div className="restaurant-info">
              <img src={restaurantData.logo} alt={restaurantData.name} className="restaurant-logo" />
              <div className="restaurant-details">
                <h1>{restaurantData.name}</h1>
                <p>{restaurantData.cuisine} • {restaurantData.address}</p>
              </div>
            </div>
            {onLogout && (
              <button className="logout-btn" onClick={onLogout}>
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
          <div className="table-badge">
            🪑 Table {restaurantData.tableNumber}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="categories-section">
        <div className="categories-scroll">
          <button
            className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Items
          </button>
          {menuCategories.map(category => (
            <button
              key={category.id}
              className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="menu-section">
        {loading ? (
          <div className="empty-state">
            <h3>Loading menu...</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Error loading menu</h3>
            <p>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>Try searching for something else</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="menu-item">
                <div className="menu-item-image-container">
                  <img src={item.imageurl} alt={item.name} className="menu-item-image" />
                </div>
                <div className="menu-item-content">
                  <div className="item-header">
                    <div className={`veg-indicator ${!item.isVeg ? 'non-veg' : ''}`} />
                    <div>
                      <div className="item-name">{item.name}</div>
                    </div>
                  </div>
                  <div className="item-description">{item.description}</div>
                  <div className="item-footer">
                    <div>
                      <div className="item-price">₹{item.price}</div>
                    </div>
                    <button className="add-button" onClick={() => addToCart(item)}>
                      ADD +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && !showCart && (
        <div className="cart-float" onClick={() => setShowCart(true)}>
          <div className="cart-info">
            <ShoppingCart size={24} />
            <span className="cart-count">{cart.length} items</span>
          </div>
          <div className="cart-total">₹{cartTotal}</div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <>
          <div className="cart-overlay" onClick={() => setShowCart(false)} />
          <div className="cart-modal">
            <div className="cart-header">
              <h2 className="cart-title">Your Order</h2>
              <button className="close-cart" onClick={() => setShowCart(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="cart-items-container">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.imageurl} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{item.price}</div>
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => removeFromCart(item.id)}>
                        <Minus size={16} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => addToCart(item)}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="summary-row">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{cartTotal + gst}</span>
              </div>
              <button className="place-order-btn" onClick={placeOrder}>
                Place Order ₹{cartTotal + gst}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Payment Method Sheet */}
      {showPaymentSheet && (
        <>
          <div className="cart-overlay" onClick={() => !processingPayment && setShowPaymentSheet(false)} />
          <div className="cart-modal">
            <div className="cart-header">
              <h2 className="cart-title">Choose Payment Method</h2>
              <button
                className="close-cart"
                onClick={() => !processingPayment && setShowPaymentSheet(false)}
                disabled={processingPayment}
              >
                <X size={20} />
              </button>
            </div>
            <div className="cart-items-container">
              <p style={{ marginBottom: '1rem', color: '#64748B' }}>
                Please select how you would like to pay for order <strong>#{orderNumber}</strong>.
              </p>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {[
                  { key: 'CASH', label: 'Cash at Counter' },
                  { key: 'CARD', label: 'Card (POS Machine)' },
                  { key: 'UPI', label: 'UPI (PhonePe / GPay / Paytm)' },
                  { key: 'NET_BANKING', label: 'Net Banking' },
                ].map(method => (
                  <button
                    key={method.key}
                    type="button"
                    className="place-order-btn"
                    style={{
                      padding: '0.9rem 1rem',
                      borderRadius: '12px',
                      background:
                        selectedPaymentMethod === method.key ? '#E63946' : '#F5F5F7',
                      color: selectedPaymentMethod === method.key ? '#ffffff' : '#1D1D1F',
                      border:
                        selectedPaymentMethod === method.key
                          ? '2px solid #C1121F'
                          : '2px solid transparent',
                    }}
                    onClick={() => setSelectedPaymentMethod(method.key)}
                    disabled={processingPayment}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="cart-summary">
              <div className="summary-row total">
                <span>Total Payable</span>
                <span>₹{cartTotal + gst}</span>
              </div>
              <button
                className="place-order-btn"
                onClick={handleConfirmPayment}
                disabled={processingPayment}
              >
                {processingPayment ? 'Processing...' : `Confirm & Pay (${selectedPaymentMethod})`}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Order Success Modal */}
      {showOrderSuccess && (
        <div className="order-success-modal" onClick={() => setShowOrderSuccess(false)}>
          <div className="success-content" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">
              <Check size={40} />
            </div>
            <h2>Order Placed!</h2>
            <div className="order-number">#{orderNumber}</div>
            <p>Your order has been sent to the kitchen. We'll notify you when it's ready!</p>
            <button className="continue-btn" onClick={() => setShowOrderSuccess(false)}>
              Continue Ordering
            </button>
          </div>
        </div>
      )}

      {/* Order Status Tracker - Floating Badge */}
      {activeOrder && showOrderTracker && !showCart && !showPaymentSheet && !showOrderSuccess && (
        <div 
          className="order-tracker-float"
          onClick={() => setShowOrderTracker('modal')}
        >
          <div className={`tracker-icon ${(activeOrder.status || 'PENDING').toLowerCase()}`}>
            {activeOrder.status === 'PENDING' && <Clock size={20} />}
            {activeOrder.status === 'PREPARING' && <ChefHat size={20} />}
            {activeOrder.status === 'READY' && <Bell size={20} />}
            {activeOrder.status === 'COMPLETED' && <CheckCircle size={20} />}
            {activeOrder.status === 'CANCELLED' && <X size={20} />}
            {!activeOrder.status && <Clock size={20} />}
          </div>
          <div className="tracker-info">
            <div className="tracker-order-id">Order #{activeOrder.orderId}</div>
            <div className="tracker-status">
              {activeOrder.status === 'PENDING' && 'Waiting...'}
              {activeOrder.status === 'PREPARING' && 'Being Prepared'}
              {activeOrder.status === 'READY' && 'Ready for Pickup!'}
              {activeOrder.status === 'COMPLETED' && 'Completed'}
              {activeOrder.status === 'CANCELLED' && 'Cancelled'}
              {!activeOrder.status && 'Waiting...'}
            </div>
          </div>
        </div>
      )}

      {/* Order Tracker Modal */}
      {showOrderTracker === 'modal' && activeOrder && (
        <>
          <div className="cart-overlay" onClick={() => setShowOrderTracker(true)} />
          <div className="tracker-modal">
            <div className="tracker-header">
              <h2 className="tracker-title">Order #{activeOrder.orderId}</h2>
              <button className="close-cart" onClick={() => setShowOrderTracker(true)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="tracker-content">
              {/* Status Timeline */}
              <div className="status-timeline">
                {[
                  { key: 'PENDING', label: 'Order Received', desc: 'Your order has been received', icon: Clock },
                  { key: 'PREPARING', label: 'Preparing', desc: 'The kitchen is preparing your food', icon: ChefHat },
                  { key: 'READY', label: 'Ready', desc: 'Your order is ready for pickup!', icon: Bell },
                  { key: 'COMPLETED', label: 'Completed', desc: 'Order has been delivered', icon: CheckCircle },
                ].map((step, index, arr) => {
                  const statusOrder = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];
                  const currentIndex = statusOrder.indexOf(activeOrder.status || 'PENDING');
                  const stepIndex = statusOrder.indexOf(step.key);
                  const isCompleted = stepIndex < currentIndex;
                  const isActive = stepIndex === currentIndex;
                  const Icon = step.icon;
                  
                  return (
                    <div 
                      key={step.key} 
                      className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                    >
                      <div className="step-icon">
                        {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                      </div>
                      <div className="step-content">
                        <h4>{step.label}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Items */}
              {activeOrder.items && activeOrder.items.length > 0 && (
                <div className="tracker-order-details">
                  <h4>Order Items</h4>
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="tracker-item">
                      <span>{item.foodName || item.name} × {item.quantity}</span>
                      <span>₹{(item.subTotal || item.price * item.quantity || 0).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="tracker-item" style={{ fontWeight: 700, marginTop: '0.5rem' }}>
                    <span>Total</span>
                    <span>₹{(activeOrder.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Dismiss Button (show when completed or cancelled) */}
              {(activeOrder.status === 'COMPLETED' || activeOrder.status === 'CANCELLED') && (
                <button 
                  className="dismiss-btn"
                  onClick={() => {
                    setActiveOrder(null);
                    setShowOrderTracker(false);
                  }}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerMenuApp;