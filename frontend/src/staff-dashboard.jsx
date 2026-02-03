import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChefHat, AlertCircle, TrendingUp, LogOut } from 'lucide-react';

// Mock orders for when backend is not available
const mockOrders = [
  {
    orderId: 1001,
    tableNumber: '12',
    items: [
      { foodItemId: 1, foodName: 'Butter Chicken', quantity: 2, unitPrice: 385, subTotal: 770 },
      { foodItemId: 7, foodName: 'Garlic Naan', quantity: 3, unitPrice: 65, subTotal: 195 },
      { foodItemId: 5, foodName: 'Dal Makhani', quantity: 1, unitPrice: 285, subTotal: 285 }
    ],
    totalAmount: 1250,
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    status: 'PENDING'
  },
  {
    orderId: 1002,
    tableNumber: '5',
    items: [
      { foodItemId: 1, foodName: 'Paneer Tikka', quantity: 2, unitPrice: 285, subTotal: 570 },
      { foodItemId: 6, foodName: 'Biryani', quantity: 1, unitPrice: 425, subTotal: 425 }
    ],
    totalAmount: 995,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'PREPARING'
  },
  {
    orderId: 1003,
    tableNumber: '8',
    items: [
      { foodItemId: 2, foodName: 'Chicken Tikka', quantity: 2, unitPrice: 325, subTotal: 650 },
      { foodItemId: 10, foodName: 'Mango Lassi', quantity: 2, unitPrice: 95, subTotal: 190 }
    ],
    totalAmount: 840,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    status: 'READY'
  },
  {
    orderId: 1004,
    tableNumber: '3',
    items: [
      { foodItemId: 4, foodName: 'Paneer Butter Masala', quantity: 1, unitPrice: 325, subTotal: 325 },
      { foodItemId: 8, foodName: 'Jeera Rice', quantity: 1, unitPrice: 175, subTotal: 175 },
      { foodItemId: 9, foodName: 'Gulab Jamun', quantity: 2, unitPrice: 125, subTotal: 250 }
    ],
    totalAmount: 750,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    status: 'COMPLETED'
  }
];

const StaffDashboard = ({ user, onLogout }) => {
  const [orders, setOrders] = useState(mockOrders);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useBackend, setUseBackend] = useState(false);

  // Fetch all orders from backend
  useEffect(() => {
    fetchOrders();
    
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      // Try to use backend API
      const apiModule = await import('./api-service.js').catch(() => null);
      
      if (apiModule && apiModule.orderAPI) {
        // Use typed API with auth header
        const backendOrders = await apiModule.orderAPI.getAll();
        setOrders(backendOrders);
        setUseBackend(true);
        setError(null);
      } else {
        console.log('API service not available, using mock data');
        setUseBackend(false);
      }
    } catch (err) {
      // Silently use mock data if backend fails
      console.log('Using mock data - backend not available', err);
      setUseBackend(false);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Try to use backend API
      const apiService = await import('./api-service.js').catch(() => null);
      
      if (apiService && apiService.orderAPI && useBackend) {
        await apiService.orderAPI.updateStatus(orderId, newStatus.toUpperCase());
      }
      
      // Update local state regardless of backend
      setOrders(orders.map(order => 
        order.orderId === orderId ? { ...order, status: newStatus.toUpperCase() } : order
      ));
      
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      // Still update local state even if backend fails
      setOrders(orders.map(order => 
        order.orderId === orderId ? { ...order, status: newStatus.toUpperCase() } : order
      ));
      console.log('Updated locally - backend not available');
    }
  };

  const getTimeSince = (timestamp) => {
    const date = new Date(timestamp);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  const mapOrderStatus = (status) => {
    const statusMap = {
      'PENDING': 'pending',
      'PREPARING': 'preparing',
      'READY': 'ready',
      'COMPLETED': 'completed',
      'CANCELLED': 'cancelled'
    };
    return statusMap[status] || 'pending';
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => mapOrderStatus(order.status) === filterStatus);

  const stats = {
    pending: orders.filter(o => mapOrderStatus(o.status) === 'pending').length,
    preparing: orders.filter(o => mapOrderStatus(o.status) === 'preparing').length,
    ready: orders.filter(o => mapOrderStatus(o.status) === 'ready').length,
    completed: orders.filter(o => mapOrderStatus(o.status) === 'completed').length
  };

  return (
    <div className="staff-dashboard">
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
        
        .staff-dashboard {
          min-height: 100vh;
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
        }
        
        /* Header */
        .dashboard-header {
          background: linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%);
          color: white;
          padding: 2.5rem;
          border-radius: 20px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .dashboard-header::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
        
        .logout-btn {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          font-size: 1rem;
        }
        
        .logout-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .header-title h1 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -1px;
        }
        
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.9rem;
        }
        
        .backend-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
        
        .live-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 1.75rem;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        
        .stat-card.pending {
          border-color: var(--warning);
          background: linear-gradient(135deg, #FEF3C7 0%, white 100%);
        }
        
        .stat-card.preparing {
          border-color: var(--primary);
          background: linear-gradient(135deg, #E0E7FF 0%, white 100%);
        }
        
        .stat-card.ready {
          border-color: var(--success);
          background: linear-gradient(135deg, #D1FAE5 0%, white 100%);
        }
        
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .stat-card.pending .stat-icon {
          background: var(--warning);
          color: white;
        }
        
        .stat-card.preparing .stat-icon {
          background: var(--primary);
          color: white;
        }
        
        .stat-card.ready .stat-icon {
          background: var(--success);
          color: white;
        }
        
        .stat-card.completed .stat-icon {
          background: var(--gray);
          color: white;
        }
        
        .stat-label {
          color: var(--gray);
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--dark);
        }
        
        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: white;
          padding: 1rem;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          flex-wrap: wrap;
        }
        
        .filter-tab {
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--border);
          background: white;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
        }
        
        .filter-tab:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        
        .filter-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        
        .filter-tab .badge {
          display: inline-block;
          background: rgba(0,0,0,0.1);
          padding: 0.15rem 0.5rem;
          border-radius: 10px;
          font-size: 0.8rem;
          margin-left: 0.5rem;
        }
        
        .filter-tab.active .badge {
          background: rgba(255,255,255,0.3);
        }
        
        /* Orders Section */
        .orders-section h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: var(--dark);
        }
        
        .orders-grid {
          display: grid;
          gap: 1.5rem;
        }
        
        .order-card {
          background: white;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          border-left: 5px solid var(--border);
          animation: slideIn 0.4s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        
        .order-card.pending {
          border-left-color: var(--warning);
          background: linear-gradient(90deg, #FEF3C7 0%, white 5%);
        }
        
        .order-card.preparing {
          border-left-color: var(--primary);
          background: linear-gradient(90deg, #E0E7FF 0%, white 5%);
        }
        
        .order-card.ready {
          border-left-color: var(--success);
          background: linear-gradient(90deg, #D1FAE5 0%, white 5%);
        }
        
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1.25rem;
        }
        
        .order-info {
          flex: 1;
        }
        
        .order-id {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 0.25rem;
        }
        
        .order-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--gray);
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        
        .table-number {
          background: var(--primary);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 1.25rem;
        }
        
        .order-items {
          margin-bottom: 1.25rem;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--light);
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }
        
        .item-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }
        
        .veg-badge {
          width: 16px;
          height: 16px;
          border: 2px solid var(--success);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .veg-badge::after {
          content: '';
          width: 7px;
          height: 7px;
          background: var(--success);
          border-radius: 50%;
        }
        
        .veg-badge.non-veg {
          border-color: var(--danger);
        }
        
        .veg-badge.non-veg::after {
          background: var(--danger);
        }
        
        .item-quantity {
          background: var(--primary);
          color: white;
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.85rem;
        }
        
        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.25rem;
          border-top: 2px solid var(--border);
        }
        
        .order-total {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--dark);
        }
        
        .order-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .action-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .action-btn.primary {
          background: var(--primary);
          color: white;
        }
        
        .action-btn.success {
          background: var(--success);
          color: white;
        }
        
        .action-btn.complete {
          background: var(--gray);
          color: white;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          color: var(--gray);
        }
        
        .empty-state h3 {
          margin-top: 1rem;
          color: var(--dark);
        }
        
        @media (max-width: 768px) {
          .staff-dashboard {
            padding: 1rem;
          }
          
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }
          
          .header-title h1 {
            font-size: 2rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filter-tabs {
            overflow-x: auto;
            scrollbar-width: none;
          }
          
          .order-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <div className="header-title">
              <ChefHat size={48} />
              <h1>Kitchen Dashboard</h1>
            </div>
            <div className="live-indicator">
              <div className="live-dot"></div>
              Live Orders
            </div>
            <div className="backend-indicator">
              {useBackend ? '🟢 Connected to Backend' : '🟡 Using Mock Data'}
            </div>
          </div>
          {onLogout && (
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={20} />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-header">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
          </div>
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>

        <div className="stat-card preparing">
          <div className="stat-header">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
          </div>
          <div className="stat-label">Preparing</div>
          <div className="stat-value">{stats.preparing}</div>
        </div>

        <div className="stat-card ready">
          <div className="stat-header">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="stat-label">Ready</div>
          <div className="stat-value">{stats.ready}</div>
        </div>

        <div className="stat-card completed">
          <div className="stat-header">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Orders
          <span className="badge">{orders.length}</span>
        </button>
        <button
          className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
          <span className="badge">{stats.pending}</span>
        </button>
        <button
          className={`filter-tab ${filterStatus === 'preparing' ? 'active' : ''}`}
          onClick={() => setFilterStatus('preparing')}
        >
          Preparing
          <span className="badge">{stats.preparing}</span>
        </button>
        <button
          className={`filter-tab ${filterStatus === 'ready' ? 'active' : ''}`}
          onClick={() => setFilterStatus('ready')}
        >
          Ready
          <span className="badge">{stats.ready}</span>
        </button>
        <button
          className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed
          <span className="badge">{stats.completed}</span>
        </button>
      </div>

      {/* Orders Section */}
      <div className="orders-section">
        <h2>
          {filterStatus === 'all' ? 'All Orders' : 
           filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1) + ' Orders'}
        </h2>
        
        {loading ? (
          <div className="empty-state">
            <h3>Loading orders...</h3>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Error loading orders</h3>
            <p>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={64} />
            <h3>No {filterStatus === 'all' ? '' : filterStatus} orders</h3>
            <p>All caught up! 🎉</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => {
              const orderStatus = mapOrderStatus(order.status);
              return (
                <div key={order.orderId} className={`order-card ${orderStatus}`}>
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-id">#{order.orderId}</div>
                      <div className="order-meta">
                        <div className="meta-item">
                          <Clock size={16} />
                          {getTimeSince(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="table-number">
                      T{order.tableNumber || 'N/A'}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="item-name">
                          <div className={`veg-badge ${item.foodName?.toLowerCase().includes('chicken') ? 'non-veg' : ''}`} />
                          {item.foodName}
                        </div>
                        <div className="item-quantity">x{item.quantity}</div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">₹{order.totalAmount}</div>
                    <div className="order-actions">
                      {orderStatus === 'pending' && (
                        <button
                          className="action-btn primary"
                          onClick={() => updateOrderStatus(order.orderId, 'preparing')}
                        >
                          <ChefHat size={18} />
                          Start Preparing
                        </button>
                      )}
                      {orderStatus === 'preparing' && (
                        <button
                          className="action-btn success"
                          onClick={() => updateOrderStatus(order.orderId, 'ready')}
                        >
                          <CheckCircle size={18} />
                          Mark Ready
                        </button>
                      )}
                      {orderStatus === 'ready' && (
                        <button
                          className="action-btn complete"
                          onClick={() => updateOrderStatus(order.orderId, 'completed')}
                        >
                          <CheckCircle size={18} />
                          Complete
                        </button>
                      )}
                    </div>
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

export default StaffDashboard;