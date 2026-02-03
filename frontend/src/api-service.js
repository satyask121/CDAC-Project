// api.js - Backend Integration Service
// Base URL for your Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api';

// ==================== AUTH API ====================
export const authAPI = {
  // Register user (customer)
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return await response.json();
  },

  // Register staff
  registerStaff: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register-staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Staff registration failed');
    }
    
    return await response.json();
  },

  // Register admin
  registerAdmin: async (userData) => {
    const token = localStorage.getItem('token');
  
    const response = await fetch(`${API_BASE_URL}/users/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      })
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Admin creation failed');
    }
  
    return await response.json();
  },
  
  // registerAdmin: async (userData) => {
  //   const response = await fetch(`${API_BASE_URL}/auth/register-admin`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       name: userData.name,
  //       email: userData.email,
  //       phone: userData.phone,
  //       password: userData.password
  //     })
  //   });
    
  //   if (!response.ok) {
  //     const error = await response.json();
  //     throw new Error(error.message || 'Admin registration failed');
  //   }
    
  //   return await response.json();
  // },

  // Login user with email and password
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const loginResponse = await response.json();
    // Store token in localStorage
    if (loginResponse.token) {
      localStorage.setItem('token', loginResponse.token);
    }
    return loginResponse;
  },

  // Get current authenticated user
  getCurrentUser: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    
    return await response.json();
  },

  // Get user by email (admin only)
  getUserByEmail: async (email) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/email/${email}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('User not found');
    }
    
    return await response.json();
  },

  // Get user by ID
  getUserById: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  }
};

// ==================== FOOD CATEGORIES API ====================
export const categoryAPI = {
  // Get all categories
  getAll: async () => {
    const token = localStorage.getItem('token');
  
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    if (!response.ok) {
      throw new Error('Failed to load categories');
    }
  
    return await response.json();
  },
  
  
  // getAll: async () => {
  //   const response = await fetch(`${API_BASE_URL}/categories`);
  //   return await response.json();
  // },

  // Get category by ID
  getById: async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
    return await response.json();
  },

  // Create category (admin only)
  create: async (categoryData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: categoryData.name,
        description: categoryData.description,
        displayOrder: categoryData.displayOrder,
        isActive: categoryData.isActive ?? true
      })
    });
    return await response.json();
  },

  // Update category (admin only)
  update: async (categoryId, categoryData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(categoryData)
    });
    return await response.json();
  },

  // Delete category (admin only)
  delete: async (categoryId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  }
};

// ==================== FOOD ITEMS API ====================
export const foodItemAPI = {
  // Get all food items
  getAll: async () => {
    const token = localStorage.getItem('token');
  
    const response = await fetch(`${API_BASE_URL}/food-items`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    if (!response.ok) {
      throw new Error('Failed to load food items');
    }
  
    return await response.json();
  },
  
  
  // getAll: async () => {
  //   const response = await fetch(`${API_BASE_URL}/food-items`);
  //   return await response.json();
  // },

  // Get food item by ID
  getById: async (itemId) => {
    const response = await fetch(`${API_BASE_URL}/food-items/${itemId}`);
    return await response.json();
  },

  // Get food items by category
  getByCategory: async (categoryId) => {
    const response = await fetch(`${API_BASE_URL}/food-items/category/${categoryId}`);
    return await response.json();
  },

  // Get only veg food items
  getVegItems: async () => {
    const response = await fetch(`${API_BASE_URL}/food-items/veg`);
    return await response.json();
  },

  // Add food item (admin only)
  create: async (itemData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/food-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        isVeg: itemData.isVeg,
        isAvailable: itemData.isAvailable ?? true,
        imageurl: itemData.imageurl,
        categoryId: itemData.categoryId
      })
    });
    return await response.json();
  },

  // Update food item (admin only)
  update: async (itemId, itemData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/food-items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(itemData)
    });
    return await response.json();
  },

  // Delete food item (admin only)
  delete: async (itemId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/food-items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  }
};

// ==================== ORDERS API ====================
export const orderAPI = {
  // Get all orders (staff/admin)
  getAll: async () => {
    const token = localStorage.getItem('token');
  
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Unauthorized or expired token');
      }
      throw new Error('Failed to fetch orders');
    }
  
    return await response.json();
  },
  
  // getAll: async () => {
  //   const token = localStorage.getItem('token');
  //   const response = await fetch(`${API_BASE_URL}/orders`, {
  //     headers: {
  //       'Authorization': `Bearer ${token}`
  //     }
  //   });

  //   if (!response.ok) {
  //     const error = await response.json();
  //     throw new Error(error.message || 'Failed to fetch orders');
  //   }

  //   return await response.json();
  // },

  // Create order (customer)
  create: async (orderData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: orderData.userId,
        orderType: orderData.orderType || 'DINE_IN', // DINE_IN or TAKEAWAY
        tableNumber: orderData.tableNumber,
        items: orderData.items.map(item => ({
          foodItemId: item.id,
          quantity: item.quantity
        }))
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Order creation failed');
    }
    
    return await response.json();
  },

  // Get order by ID
  getById: async (orderId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },

  // Get orders by user ID
  getByUser: async (userId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  },

  // Update order status (staff/admin)
  updateStatus: async (orderId, status) => {
    // status should be one of: PENDING, PREPARING, READY, COMPLETED, CANCELLED
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  }
};

// ==================== HELPER FUNCTIONS ====================

// Error handler wrapper
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Format price in INR
export const formatPrice = (price) => {
  return `₹${price.toLocaleString('en-IN')}`;
};

// Map frontend role to backend role enum
export const mapRoleToBackend = (role) => {
  const roleMap = {
    'customer': 'CUSTOMER',
    'staff': 'KITCHEN_STAFF',
    'admin': 'ADMIN'
  };
  return roleMap[role] || 'CUSTOMER';
};

// Map backend order status to frontend
export const mapOrderStatus = (status) => {
  const statusMap = {
    'PENDING': 'pending',
    'PREPARING': 'preparing',
    'READY': 'ready',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled'
  };
  return statusMap[status] || 'pending';
};

// Default export
export default {
  authAPI,
  categoryAPI,
  foodItemAPI,
  orderAPI,
  handleAPIError,
  formatPrice,
  mapRoleToBackend,
  mapOrderStatus
};