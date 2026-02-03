import React, { useState, useEffect } from 'react';
import AuthPage from './auth-page';
import CustomerMenuApp from './customer-menu';
import StaffDashboard from './staff-dashboard';
import AdminDashboard from './admin-dashboard';
import { authAPI } from './api-service';


const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('auth');

  // Check if user is already logged in (from localStorage)
  // useEffect(() => {
  //   const savedUser = localStorage.getItem('currentUser');
  //   if (savedUser) {
  //     const user = JSON.parse(savedUser);
  //     setCurrentUser(user);
  //     setCurrentView(getRoleView(user.role));
  //   }
  // }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
  
      if (!token) {
        setCurrentUser(null);
        setCurrentView('auth');
        return;
      }
  
      try {
        // 🔐 verify token with backend
        const user = await authAPI.getCurrentUser();
  
        setCurrentUser({  
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase()
        });
  
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.toLowerCase()
          })
        );
  
        setCurrentView(getRoleView(user.role.toLowerCase()));
      }catch (err) {
        console.warn('Token invalid or expired');
      
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      
        setCurrentUser(null);
        setCurrentView('auth');
      }
      
    };
  
    initAuth();
  }, []);
  
  

  const getRoleView = (role) => {
    switch(role) {
      case 'customer':
        return 'customer-menu';
      case 'staff':
        return 'staff-dashboard';
      case 'admin':
        return 'admin-dashboard';
      default:
        return 'auth';
    }
  };

  const handleLogin = (userData) => {
    console.log('LOGGED USER:', userData); 
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setCurrentView(getRoleView(userData.role));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token'); // Clear JWT token
    setCurrentView('auth');
  };

  return (
    <div className="app-container">
      {currentView === 'auth' && (
        <AuthPage onLogin={handleLogin} />
      )}

{currentView === 'customer-menu' && currentUser?.role === 'customer' && (
  <CustomerMenuApp onLogout={handleLogout} user={currentUser} />
)}


      {currentView === 'staff-dashboard' && (
        <StaffDashboard onLogout={handleLogout} user={currentUser} />
      )}

{currentView === 'admin-dashboard' && currentUser?.role === 'admin' && (
  <AdminDashboard onLogout={handleLogout} user={currentUser} />
)}

    </div>
  );
};

export default App;