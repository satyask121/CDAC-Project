import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, ChefHat, UtensilsCrossed, 
  ShoppingBag, LogOut, 
  Search, Plus, Edit, Trash2, DollarSign, Eye,
  Calendar, Filter, MoreVertical, Download, Bell
} from 'lucide-react';
import apiService, { authAPI, handleAPIError, orderAPI, formatPrice } from './api-service';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState('');

  const [staffMembers, setStaffMembers] = useState([]);
  const [staffError, setStaffError] = useState('');
  const [staffSearch, setStaffSearch] = useState('');
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editingStaffForm, setEditingStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [allUsers, setAllUsers] = useState([]);

  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);

  const [menuSearch, setMenuSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState('');
  const [customerStats, setCustomerStats] = useState([]);

  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editItemForm, setEditItemForm] = useState(null);

  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeUsers: 0,
    menuItems: 0,
    avgOrderValue: 0,
    completionRate: 0
  });

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isVeg: true,
    imageurl: '',
    isAvailable: true,
  });
   
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);

const [newAdmin, setNewAdmin] = useState({
  name: '',
  email: '',
  phone: '',
  password: ''
});


  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const initialMenuItems = [
    { 
      id: 1, name: 'Butter Chicken', category: 'Main Course', 
      price: 385, isVeg: false, available: true, orders: 45 
    },
    { 
      id: 2, name: 'Paneer Tikka', category: 'Starters', 
      price: 285, isVeg: true, available: true, orders: 38 
    },
    { 
      id: 3, name: 'Biryani', category: 'Rice', 
      price: 425, isVeg: false, available: true, orders: 52 
    },
    { 
      id: 4, name: 'Dal Makhani', category: 'Main Course', 
      price: 285, isVeg: true, available: false, orders: 28 
    }
  ];

  const initialStaffMembers = [
    { id: 1, name: 'Rajesh Kumar', role: 'Chef', email: 'rajesh@foodie.com', status: 'active', joinDate: '2023-06-15' },
    { id: 2, name: 'Priya Sharma', role: 'Kitchen Staff', email: 'priya@foodie.com', status: 'active', joinDate: '2023-08-20' },
    { id: 3, name: 'Amit Patel', role: 'Chef', email: 'amit@foodie.com', status: 'active', joinDate: '2023-05-10' },
    { id: 4, name: 'Sneha Reddy', role: 'Kitchen Staff', email: 'sneha@foodie.com', status: 'inactive', joinDate: '2023-09-01' }
  ];

  // Load menu (categories + items) and staff from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingMenu(true);
        // Load categories and items
        const [cats, items] = await Promise.all([
          apiService.categoryAPI.getAll(),
          apiService.foodItemAPI.getAll(),
        ]);
        setCategories(cats);
        setMenuItems(items);
        setMenuError('');
      } catch (err) {
        console.error('Failed to load menu data', err);
        setMenuError(handleAPIError(err));
        // Fallback to mock data
        setCategories([]);
        setMenuItems(initialMenuItems);
      } finally {
        setLoadingMenu(false);
      }

      try {
        const usersFromApi = await authAPI.getAllUsers();
        setAllUsers(Array.isArray(usersFromApi) ? usersFromApi : []);
        const staff = (Array.isArray(usersFromApi) ? usersFromApi : [])
          .filter(u => u.role === 'STAFF')
          .map(u => ({
            id: u.id,
            name: u.name,
            role: 'Kitchen Staff',
            email: u.email,
            status: 'active',
            joinDate: new Date().toISOString().slice(0, 10),
          }));
        setStaffMembers(staff.length ? staff : initialStaffMembers);
        setStaffError('');
      } catch (err) {
        console.error('Failed to load staff data', err);
        setStaffError(handleAPIError(err));
        setStaffMembers(initialStaffMembers);
      }
    };

    loadData();
  }, []);

  const handleNewItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    try {
      const created = await apiService.foodItemAPI.create({
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        isVeg: newItem.isVeg,
        isAvailable: newItem.isAvailable,
        imageurl: newItem.imageurl,
        categoryId: Number(newItem.categoryId),
      });
      setMenuItems(prev => [...prev, created]);
      setShowAddItemForm(false);
      setNewItem({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        isVeg: true,
        imageurl: '',
        isAvailable: true,
      });
      setMenuError('');
    } catch (err) {
      console.error('Failed to add menu item', err);
      setMenuError(handleAPIError(err));
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      await apiService.foodItemAPI.delete(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete menu item', err);
      setMenuError(handleAPIError(err));
    }
  };

  const handleToggleAvailability = async (item) => {
    const currentAvailable = item.isAvailable ?? item.available ?? false;

    // If item has no categoryId (mock data), just toggle locally
    if (!item.categoryId) {
      setMenuItems(prev =>
        prev.map(it =>
          it.id === item.id
            ? { ...it, isAvailable: !currentAvailable, available: !currentAvailable }
            : it
        )
      );
      return;
    }

    try {
      const updated = await apiService.foodItemAPI.update(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        isVeg: item.isVeg,
        isAvailable: !currentAvailable,
        imageurl: item.imageurl,
        categoryId: item.categoryId,
      });
      setMenuItems(prev =>
        prev.map(it => (it.id === item.id ? updated : it))
      );
      setMenuError('');
    } catch (err) {
      console.error('Failed to update availability', err);
      setMenuError(handleAPIError(err));
    }
  };

  const handleMenuSearchChange = (e) => {
    setMenuSearch(e.target.value);
  };

  const handleViewMenuItem = (item) => {
    setSelectedMenuItem(item);
    setIsEditingItem(false);
    setEditItemForm(null);
  };

  const handleStartEditItem = (item) => {
    setSelectedMenuItem(item);
    setIsEditingItem(true);
    setEditItemForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      imageurl: item.imageurl || '',
      isVeg: item.isVeg ?? true,
      isAvailable: item.isAvailable ?? item.available ?? true,
      categoryId: item.categoryId || '',
    });
  };

  const handleEditItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditItemForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveEditItem = async (e) => {
    e.preventDefault();
    if (!selectedMenuItem || !editItemForm) return;

    const categoryId = Number(editItemForm.categoryId || selectedMenuItem.categoryId);
    if (!categoryId) {
      setMenuError('Category is required to update the item.');
      return;
    }

    try {
      const updated = await apiService.foodItemAPI.update(selectedMenuItem.id, {
        name: editItemForm.name,
        description: editItemForm.description,
        price: parseFloat(editItemForm.price),
        isVeg: editItemForm.isVeg,
        isAvailable: editItemForm.isAvailable,
        imageurl: editItemForm.imageurl,
        categoryId,
      });

      setMenuItems(prev =>
        prev.map(it => (it.id === selectedMenuItem.id ? updated : it))
      );
      setSelectedMenuItem(null);
      setIsEditingItem(false);
      setEditItemForm(null);
      setMenuError('');
    } catch (err) {
      console.error('Failed to update menu item', err);
      setMenuError(handleAPIError(err));
    }
  };

  const handleCloseItemDetails = () => {
    setSelectedMenuItem(null);
    setIsEditingItem(false);
    setEditItemForm(null);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await orderAPI.updateStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o => (o.orderId === orderId ? updated : o))
      );
      setOrdersError('');
    } catch (err) {
      console.error('Failed to update order status', err);
      setOrdersError(handleAPIError(err));
    }
  };

  useEffect(() => {
    if (activeTab !== 'orders' && activeTab !== 'dashboard') return;

    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        const data = await orderAPI.getAll();
        setOrders(data || []);
        setOrdersError('');
      } catch (err) {
        console.error('Failed to load orders', err);
        setOrdersError(handleAPIError(err));
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [activeTab]);

  useEffect(() => {
    // Recalculate dashboard stats whenever orders, menu items, or users change
    const todayDateStr = new Date().toISOString().slice(0, 10);

    const todaysOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      const createdDate = new Date(o.createdAt).toISOString().slice(0, 10);
      return createdDate === todayDateStr;
    });

    const todayOrdersCount = todaysOrders.length;
    const todayRevenueTotal = todaysOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );

    const totalOrdersCount = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );

    const avgOrderValue =
      totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    const completedCount = orders.filter(
      o => o.status === 'COMPLETED'
    ).length;
    const completionRate =
      totalOrdersCount > 0
        ? Math.round((completedCount / totalOrdersCount) * 100)
        : 0;

    const activeUsersCount = (Array.isArray(allUsers) ? allUsers : []).filter(
      u => u.role === 'CUSTOMER'
    ).length;

    setStats({
      todayOrders: todayOrdersCount,
      todayRevenue: todayRevenueTotal,
      activeUsers: activeUsersCount,
      menuItems: menuItems.length,
      avgOrderValue,
      completionRate
    });
  }, [orders, menuItems, allUsers]);

  const recentOrders = [...orders]
    .filter(o => o && o.orderId)
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  const filteredMenuItems = menuItems.filter(item => {
    const query = menuSearch.trim().toLowerCase();
    if (!query) return true;
    const category =
      categories.find(c => c.id === item.categoryId) || null;
    const categoryName = (category ? category.name : item.category || '').toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(query) ||
      categoryName.includes(query)
    );
  });

  const filteredOrders = orders.filter(order => {
    if (orderStatusFilter === 'ALL') return true;
    return (order.status || '').toUpperCase() === orderStatusFilter;
  });

  const customerUsers = (Array.isArray(allUsers) ? allUsers : []).filter(u => u.role === 'CUSTOMER');

  const filteredCustomers = customerUsers.filter(c => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query)
    );
  });

  const getCustomerStat = (userId) => {
    return customerStats.find(cs => cs.userId === userId) || {
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: null,
    };
  };
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const admin = await authAPI.registerAdmin(newAdmin);
  
      alert(`Admin created: ${admin.email}`);
  
      setNewAdmin({
        name: '',
        email: '',
        phone: '',
        password: ''
      });
  
      setShowAddAdminForm(false);
    } catch (err) {
      alert(handleAPIError(err));
    }
  };
  

  const handleNewStaffChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const user = await authAPI.registerStaff({
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        password: newStaff.password,
      });

      const newStaffEntry = {
        id: user.id,
        name: user.name,
        role: 'Kitchen Staff',
        email: user.email,
        status: 'active',
        joinDate: new Date().toISOString().slice(0, 10),
      };

      setStaffMembers(prev => [...prev, newStaffEntry]);
      setShowAddStaffForm(false);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        password: '',
      });
      setStaffError('');
    } catch (err) {
      console.error('Failed to add staff', err);
      setStaffError(handleAPIError(err));
    }
  };

  const handleStaffSearchChange = (e) => {
    setStaffSearch(e.target.value);
  };

  const handleStartEditStaff = (staff) => {
    setEditingStaffId(staff.id);
    setEditingStaffForm({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
    });
  };

  const handleEditingStaffChange = (e) => {
    const { name, value } = e.target;
    setEditingStaffForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEditStaff = () => {
    setEditingStaffId(null);
    setEditingStaffForm({
      name: '',
      email: '',
      phone: '',
    });
  };

  const handleSaveEditStaff = async (id) => {
    try {
      // Backend currently doesn't expose an update endpoint for staff,
      // so for now we just update the UI locally to reflect changes.
      setStaffMembers(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, name: editingStaffForm.name, email: editingStaffForm.email, phone: editingStaffForm.phone }
            : s
        )
      );
      setEditingStaffId(null);
      setEditingStaffForm({
        name: '',
        email: '',
        phone: '',
      });
      setStaffError('');
    } catch (err) {
      console.error('Failed to update staff', err);
      setStaffError(handleAPIError(err));
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      // There is no explicit delete staff API; you might add one later.
      // For now, we remove from the local list to keep the UI functional.
      setStaffMembers(prev => prev.filter(s => s.id !== id));
      setStaffError('');
    } catch (err) {
      console.error('Failed to delete staff', err);
      setStaffError(handleAPIError(err));
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const query = staffSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      (staff.name || '').toLowerCase().includes(query) ||
      (staff.email || '').toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (activeTab !== 'customers') return;

    const loadCustomerStats = async () => {
      try {
        setCustomersLoading(true);
        const customersOnly = (Array.isArray(allUsers) ? allUsers : []).filter(u => u.role === 'CUSTOMER');

        const statsPromises = customersOnly.map(async (u) => {
          try {
            const userOrders = await orderAPI.getByUser(u.id);
            const totalOrders = userOrders.length;
            const totalSpent = userOrders.reduce(
              (sum, o) => sum + (o.totalAmount || 0),
              0
            );
            const latestTime = userOrders.reduce((max, o) => {
              if (!o.createdAt) return max;
              const t = new Date(o.createdAt).getTime();
              return t > max ? t : max;
            }, 0);
            const lastOrderDate = latestTime ? new Date(latestTime) : null;

            return {
              userId: u.id,
              totalOrders,
              totalSpent,
              lastOrderDate,
            };
          } catch (err) {
            console.error('Failed to load orders for customer', u.id, err);
            return {
              userId: u.id,
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: null,
            };
          }
        });

        const statsArr = await Promise.all(statsPromises);
        setCustomerStats(statsArr);
        setCustomersError('');
      } catch (err) {
        console.error('Failed to load customer stats', err);
        setCustomersError(handleAPIError(err));
      } finally {
        setCustomersLoading(false);
      }
    };

    loadCustomerStats();
  }, [activeTab, allUsers]);

  return (
    <div className="admin-dashboard">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap');
        
        :root {
          --primary: #6366F1;
          --primary-dark: #4F46E5;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
          --dark: #0F172A;
          --gray: #64748B;
          --light: #F8FAFC;
          --border: #E2E8F0;
          --sidebar-width: 280px;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: var(--light);
          color: var(--dark);
        }
        
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
        }
        
        /* Sidebar */
        .sidebar {
          width: var(--sidebar-width);
          background: var(--dark);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 100;
        }
        
        .sidebar-header {
          padding: 2rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .logo {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.75rem;
          font-weight: 900;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0;
          overflow-y: auto;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 0.95rem;
          border-left: 3px solid transparent;
        }
        
        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        
        .nav-item.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          border-left-color: var(--primary);
        }
        
        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          border-radius: 10px;
          color: #FCA5A5;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }
        
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          padding: 2rem;
        }
        
        /* Top Bar */
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .page-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
        }
        
        .top-bar-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .icon-button {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: var(--light);
          color: var(--gray);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .icon-button:hover {
          background: var(--primary);
          color: white;
          transform: translateY(-2px);
        }
        
        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--danger);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          border-color: var(--primary);
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .stat-icon.orders {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          color: white;
        }
        
        .stat-icon.revenue {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
        }
        
        .stat-icon.users {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
        }
        
        .stat-icon.menu {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          color: white;
        }
        
        .stat-label {
          color: var(--gray);
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }
        
        .stat-value {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--dark);
        }
        
        .stat-change {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          margin-top: 0.5rem;
        }
        
        .stat-change.positive {
          background: #D1FAE5;
          color: #065F46;
        }
        
        .stat-change.negative {
          background: #FEE2E2;
          color: #991B1B;
        }
        
        /* Content Section */
        .content-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .section-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--dark);
        }
        
        .action-button {
          padding: 0.75rem 1.5rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        
        .action-button:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        
        .action-button.secondary {
          background: var(--light);
          color: var(--gray);
        }
        
        .action-button.secondary:hover {
          background: var(--border);
          color: var(--dark);
        }
        
        /* Search Bar */
        .search-bar {
          position: relative;
          flex: 1;
          max-width: 400px;
        }
        
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid var(--border);
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
        }
        
        /* Table */
        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .data-table thead {
          background: var(--light);
        }
        
        .data-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 700;
          color: var(--gray);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid var(--border);
        }
        
        .data-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--dark);
          font-size: 0.95rem;
        }
        
        .data-table tbody tr {
          transition: all 0.2s ease;
        }
        
        .data-table tbody tr:hover {
          background: var(--light);
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .status-badge.completed {
          background: #D1FAE5;
          color: #065F46;
        }
        
        .status-badge.preparing {
          background: #DBEAFE;
          color: #1E40AF;
        }
        
        .status-badge.ready {
          background: #FEF3C7;
          color: #92400E;
        }

        .status-badge.received {
          background: #E0F2FE;
          color: #0369A1;
        }

        .status-badge.cancelled {
          background: #FEE2E2;
          color: #991B1B;
        }
        
        .status-badge.active {
          background: #D1FAE5;
          color: #065F46;
        }
        
        .status-badge.inactive {
          background: #FEE2E2;
          color: #991B1B;
        }
        
        .availability-toggle {
          width: 48px;
          height: 24px;
          background: var(--border);
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .availability-toggle.active {
          background: var(--success);
        }
        
        .availability-toggle::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: all 0.3s ease;
        }
        
        .availability-toggle.active::after {
          left: 27px;
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .table-action-btn {
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--light);
          color: var(--gray);
        }
        
        .table-action-btn:hover {
          transform: translateY(-2px);
        }
        
        .table-action-btn.edit:hover {
          background: var(--primary);
          color: white;
        }
        
        .table-action-btn.delete:hover {
          background: var(--danger);
          color: white;
        }
        
        .table-action-btn.view:hover {
          background: var(--success);
          color: white;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--gray);
        }
        
        .empty-state h3 {
          margin-top: 1rem;
          color: var(--dark);
        }
        
        @media (max-width: 1200px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .main-content {
            margin-left: 0;
          }
        }
        
        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .top-bar {
            flex-direction: column;
            gap: 1rem;
            align-items: start;
          }
          
          .data-table {
            font-size: 0.85rem;
          }
          
          .data-table th,
          .data-table td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">Foodie Admin</div>
        </div>

        <div className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </div>
          <div 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={20} />
            Orders
          </div>
          <div 
            className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <UtensilsCrossed size={20} />
            Menu Management
          </div>
          <div 
            className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <ChefHat size={20} />
            Staff
          </div>
          <div 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={20} />
            Customers
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <h1 className="page-title">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'orders' && 'Orders'}
            {activeTab === 'menu' && 'Menu Management'}
            {activeTab === 'staff' && 'Staff Management'}
            {activeTab === 'customers' && 'Customers'}
          </h1>
          <div className="top-bar-actions">
            <button className="icon-button">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            <button className="icon-button">
              <Calendar size={20} />
            </button>
            <button className="icon-button">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div>
                    <div className="stat-label">Today's Orders</div>
                    <div className="stat-value">{stats.todayOrders}</div>
                    <div className="stat-change positive">↑ 12.5%</div>
                  </div>
                  <div className="stat-icon orders">
                    <ShoppingBag size={28} />
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div>
                    <div className="stat-label">Revenue</div>
                    <div className="stat-value">₹{stats.todayRevenue.toLocaleString()}</div>
                    <div className="stat-change positive">↑ 8.2%</div>
                  </div>
                  <div className="stat-icon revenue">
                    <DollarSign size={28} />
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div>
                    <div className="stat-label">Active Users</div>
                    <div className="stat-value">{stats.activeUsers}</div>
                    <div className="stat-change positive">↑ 5.1%</div>
                  </div>
                  <div className="stat-icon users">
                    <Users size={28} />
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div>
                    <div className="stat-label">Menu Items</div>
                    <div className="stat-value">{stats.menuItems}</div>
                    <div className="stat-change positive">↑ 3</div>
                  </div>
                  <div className="stat-icon menu">
                    <UtensilsCrossed size={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">Recent Orders</h2>
                <button
                  className="action-button secondary"
                  type="button"
                  onClick={() => setActiveTab('orders')}
                >
                  View All
                </button>
              </div>
              {ordersLoading && <p>Loading recent orders...</p>}
              {!ordersLoading && !recentOrders.length && (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <h3>No recent orders</h3>
                  <p>New orders will appear here as they come in.</p>
                </div>
              )}
              {!!recentOrders.length && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => {
                      const itemsCount = Array.isArray(order.items)
                        ? order.items.reduce(
                            (sum, it) => sum + (it.quantity || 0),
                            0
                          )
                        : 0;
                      const statusClass = (order.status || '').toLowerCase();
                      const createdTime = order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString()
                        : '-';
                      return (
                        <tr key={order.orderId}>
                          <td><strong>#{order.orderId}</strong></td>
                          <td>{itemsCount} items</td>
                          <td><strong>{formatPrice(order.totalAmount || 0)}</strong></td>
                          <td>
                            <span className={`status-badge ${statusClass}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{createdTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Menu Management View */}
        {activeTab === 'menu' && (
          <div className="content-section">
            <div className="section-header">
              <div className="search-bar">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search menu items..."
                  value={menuSearch}
                  onChange={handleMenuSearchChange}
                />
              </div>
              <button
                className="action-button"
                type="button"
                onClick={() => setShowAddItemForm(prev => !prev)}
              >
                <Plus size={20} />
                {showAddItemForm ? 'Close' : 'Add New Item'}
              </button>
            </div>

            {loadingMenu && <p>Loading menu...</p>}
            {menuError && (
              <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{menuError}</p>
            )}

            {showAddItemForm && (
              <form
                onSubmit={handleAddMenuItem}
                style={{
                  marginBottom: '1.5rem',
                  display: 'grid',
                  gap: '0.75rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Item name"
                  className="search-input"
                  value={newItem.name}
                  onChange={handleNewItemChange}
                  required
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  className="search-input"
                  value={newItem.description}
                  onChange={handleNewItemChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  className="search-input"
                  value={newItem.price}
                  onChange={handleNewItemChange}
                  min="1"
                  step="1"
                  required
                />
                <select
                  name="categoryId"
                  className="search-input"
                  value={newItem.categoryId}
                  onChange={handleNewItemChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="imageurl"
                  placeholder="Image URL"
                  className="search-input"
                  value={newItem.imageurl}
                  onChange={handleNewItemChange}
                  required
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="isVeg"
                    checked={newItem.isVeg}
                    onChange={handleNewItemChange}
                  />
                  Veg item
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={newItem.isAvailable}
                    onChange={handleNewItemChange}
                  />
                  Available
                </label>
                <button type="submit" className="action-button" style={{ alignSelf: 'center' }}>
                  Save Item
                </button>
              </form>
            )}

            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Orders</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.map(item => {
                  const category =
                    categories.find(c => c.id === item.categoryId) || null;
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>{category ? category.name : (item.category || '-')}</td>
                      <td><strong>₹{item.price}</strong></td>
                      <td>
                        <span style={{ color: item.isVeg ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                          {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                        </span>
                      </td>
                      <td>{item.orders ?? '-'}{item.orders ? ' orders' : ''}</td>
                      <td>
                        <div
                          className={`availability-toggle ${item.isAvailable ?? item.available ? 'active' : ''}`}
                          onClick={() => handleToggleAvailability(item)}
                        ></div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="table-action-btn view"
                            type="button"
                            onClick={() => handleViewMenuItem(item)}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="table-action-btn edit"
                            type="button"
                            onClick={() => handleStartEditItem(item)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="table-action-btn delete"
                            type="button"
                            onClick={() => handleDeleteMenuItem(item.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {selectedMenuItem && !isEditingItem && (
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--light)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Item Details</h3>
                  <button
                    type="button"
                    className="action-button secondary"
                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                    onClick={handleCloseItemDetails}
                  >
                    Close
                  </button>
                </div>
                <p><strong>Name:</strong> {selectedMenuItem.name}</p>
                <p><strong>Description:</strong> {selectedMenuItem.description}</p>
                <p><strong>Price:</strong> ₹{selectedMenuItem.price}</p>
                <p><strong>Type:</strong> {selectedMenuItem.isVeg ? 'Veg' : 'Non-Veg'}</p>
                <p><strong>Available:</strong> {(selectedMenuItem.isAvailable ?? selectedMenuItem.available) ? 'Yes' : 'No'}</p>
              </div>
            )}

            {selectedMenuItem && isEditingItem && editItemForm && (
              <form
                onSubmit={handleSaveEditItem}
                style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--light)',
                  display: 'grid',
                  gap: '0.75rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Item name"
                  className="search-input"
                  value={editItemForm.name}
                  onChange={handleEditItemChange}
                  required
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  className="search-input"
                  value={editItemForm.description}
                  onChange={handleEditItemChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  className="search-input"
                  value={editItemForm.price}
                  onChange={handleEditItemChange}
                  min="1"
                  step="1"
                  required
                />
                <select
                  name="categoryId"
                  className="search-input"
                  value={editItemForm.categoryId}
                  onChange={handleEditItemChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="imageurl"
                  placeholder="Image URL"
                  className="search-input"
                  value={editItemForm.imageurl}
                  onChange={handleEditItemChange}
                  required
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="isVeg"
                    checked={editItemForm.isVeg}
                    onChange={handleEditItemChange}
                  />
                  Veg item
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={editItemForm.isAvailable}
                    onChange={handleEditItemChange}
                  />
                  Available
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button type="submit" className="action-button">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={handleCloseItemDetails}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Staff Management View */}
        {activeTab === 'staff' && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Staff Members</h2>
              <div className="search-bar" style={{ maxWidth: '260px' }}>
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search staff..."
                  value={staffSearch}
                  onChange={handleStaffSearchChange}
                />
              </div>
              <button
                className="action-button"
                type="button"
                onClick={() => setShowAddStaffForm(prev => !prev)}
              >
                <Plus size={20} />
                {showAddStaffForm ? 'Close' : 'Add Staff'}
              </button>
              <button
  className="action-button secondary"
  type="button"
  onClick={() => setShowAddAdminForm(prev => !prev)}
>
  <Plus size={20} />
  {showAddAdminForm ? 'Close Admin' : 'Add Admin'}
</button>

            </div>

            {staffError && (
              <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{staffError}</p>
            )}

            {showAddStaffForm && (
              <form
                onSubmit={handleAddStaff}
                style={{
                  marginBottom: '1.5rem',
                  display: 'grid',
                  gap: '0.75rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  className="search-input"
                  value={newStaff.name}
                  onChange={handleNewStaffChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="search-input"
                  value={newStaff.email}
                  onChange={handleNewStaffChange}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit phone"
                  className="search-input"
                  value={newStaff.phone}
                  onChange={handleNewStaffChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="search-input"
                  value={newStaff.password}
                  onChange={handleNewStaffChange}
                  required
                />
                <button type="submit" className="action-button" style={{ alignSelf: 'center' }}>
                  Save Staff
                </button>
              </form>
            )}

{showAddAdminForm && (
  <form
    onSubmit={handleAddAdmin}
    style={{
      marginBottom: '1.5rem',
      display: 'grid',
      gap: '0.75rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      border: '1px solid var(--border)',
      padding: '1rem',
      borderRadius: '12px',
      background: 'var(--light)',
    }}
  >
    <input
      type="text"
      placeholder="Admin name"
      className="search-input"
      value={newAdmin.name}
      onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
      required
    />

    <input
      type="email"
      placeholder="Admin email"
      className="search-input"
      value={newAdmin.email}
      onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
      required
    />

    <input
      type="tel"
      placeholder="Phone"
      className="search-input"
      value={newAdmin.phone}
      onChange={e => setNewAdmin({ ...newAdmin, phone: e.target.value })}
      required
    />

    <input
      type="password"
      placeholder="Password"
      className="search-input"
      value={newAdmin.password}
      onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
      required
    />

    <button type="submit" className="action-button">
      Create Admin
    </button>
  </form>
)}


            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(staff => {
                  const isEditing = editingStaffId === staff.id;
                  return (
                    <tr key={staff.id}>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            className="search-input"
                            value={editingStaffForm.name}
                            onChange={handleEditingStaffChange}
                          />
                        ) : (
                          <strong>{staff.name}</strong>
                        )}
                      </td>
                      <td>{staff.role}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            className="search-input"
                            value={editingStaffForm.email}
                            onChange={handleEditingStaffChange}
                          />
                        ) : (
                          staff.email
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            className="search-input"
                            value={editingStaffForm.phone}
                            onChange={handleEditingStaffChange}
                          />
                        ) : (
                          staff.phone || '-'
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${staff.status}`}>
                          {staff.status}
                        </span>
                      </td>
                      <td>{staff.joinDate}</td>
                      <td>
                        <div className="action-buttons">
                          {!isEditing ? (
                            <>
                              <button
                                className="table-action-btn edit"
                                type="button"
                                onClick={() => handleStartEditStaff(staff)}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                className="table-action-btn delete"
                                type="button"
                                onClick={() => handleDeleteStaff(staff.id)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="table-action-btn view"
                                type="button"
                                onClick={() => handleSaveEditStaff(staff.id)}
                              >
                                Save
                              </button>
                              <button
                                className="table-action-btn delete"
                                type="button"
                                onClick={handleCancelEditStaff}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Customers View */}
        {activeTab === 'customers' && (
          <div className="content-section">
            <div className="section-header">
              <h2 className="section-title">Customer List</h2>
              <div className="search-bar">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>
            {customersError && (
              <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{customersError}</p>
            )}
            {customersLoading && <p>Loading customers...</p>}
            {!customersLoading && !filteredCustomers.length && !customersError && (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <h3>No customers found</h3>
                <p>Registered customers will appear here.</p>
              </div>
            )}
            {!!filteredCustomers.length && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Total Orders</th>
                    <th>Total Spent</th>
                    <th>Last Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => {
                    const statsForCustomer = getCustomerStat(customer.id);
                    const lastOrderLabel = statsForCustomer.lastOrderDate
                      ? statsForCustomer.lastOrderDate.toLocaleDateString()
                      : '-';
                    return (
                      <tr key={customer.id}>
                        <td><strong>{customer.name}</strong></td>
                        <td>{customer.email}</td>
                        <td>{statsForCustomer.totalOrders}</td>
                        <td><strong>{formatPrice(statsForCustomer.totalSpent || 0)}</strong></td>
                        <td>{lastOrderLabel}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="table-action-btn view" type="button">
                              <Eye size={18} />
                            </button>
                            <button className="table-action-btn edit" type="button">
                              <Edit size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Orders View */}
        {activeTab === 'orders' && (
          <div className="content-section">
            <div className="section-header">
              <div className="search-bar">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by Order ID..."
                  // simple client-side filter using status dropdown for now
                  disabled
                  style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--gray)', fontWeight: 600 }}>
                  Status:
                </label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="search-input"
                  style={{ maxWidth: '180px' }}
                >
                  <option value="ALL">All</option>
                  <option value="RECEIVED">Received</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {ordersLoading && <p>Loading orders...</p>}
            {ordersError && (
              <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{ordersError}</p>
            )}

            {!ordersLoading && !orders.length && !ordersError && (
              <div className="empty-state">
                <h3>No orders found</h3>
                <p>New orders will appear here in real-time.</p>
              </div>
            )}

            {!!filteredOrders.length && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const itemsCount = Array.isArray(order.items)
                      ? order.items.reduce((sum, it) => sum + (it.quantity || 0), 0)
                      : 0;
                    const createdAt = order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : '-';
                    const statusClass = (order.status || '').toLowerCase();
                    return (
                      <tr key={order.orderId}>
                        <td><strong>#{order.orderId}</strong></td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{itemsCount} items</td>
                        <td><strong>{formatPrice(order.totalAmount || 0)}</strong></td>
                        <td>{createdAt}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="table-action-btn edit"
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.orderId, 'PREPARING')}
                              disabled={order.status === 'PREPARING' || order.status === 'READY' || order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                            >
                              Prep
                            </button>
                            <button
                              className="table-action-btn view"
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.orderId, 'READY')}
                              disabled={order.status === 'READY' || order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                            >
                              Ready
                            </button>
                            <button
                              className="table-action-btn view"
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.orderId, 'COMPLETED')}
                              disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                            >
                              Done
                            </button>
                            <button
                              className="table-action-btn delete"
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order.orderId, 'CANCELLED')}
                              disabled={order.status === 'COMPLETED' || order.status === 'CANCELLED'}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;