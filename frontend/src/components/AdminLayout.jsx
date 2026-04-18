import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, BookOpen, Settings, 
  LogOut, Menu, X, Bell, Search, User as UserIcon, Shield,ShieldCheck, GraduationCap 
} from 'lucide-react';
import '../pages/admin.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('full_name');
    navigate('/login');
  };

  const adminName = localStorage.getItem('full_name') || 'Admin';
  const adminRole = localStorage.getItem('role') || 'admin';

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'User Info', path: '/admin/user-courses', icon: GraduationCap },
    { name: 'Role Management', path: '/admin/roles', icon: ShieldCheck }, 
    { name: 'Course Management', path: '/admin/courses', icon: BookOpen },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-layout-root">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <Shield className="admin-logo-icon" />
            {(sidebarOpen || mobileMenuOpen) && <span className="admin-logo-text">MarineAdmin</span>}
          </div>
          <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={`admin-nav-item ${isActive ? 'active' : ''}`} title={!sidebarOpen ? item.name : ''}>
                <Icon className="admin-nav-icon" size={22} />
                {(sidebarOpen || mobileMenuOpen) && <span className="admin-nav-text">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-nav-item logout-btn" title={!sidebarOpen ? "Logout" : ""}>
             <LogOut className="admin-nav-icon" size={22} />
             {(sidebarOpen || mobileMenuOpen) && <span className="admin-nav-text">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div className="admin-mobile-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <div className={`admin-main-wrapper ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="admin-search">
              <Search className="admin-search-icon" size={18} />
              <input type="text" placeholder="Search resources, users, or settings..." />
            </div>
          </div>
          
          <div className="admin-topbar-right">
            <button className="admin-icon-btn">
              <Bell size={20} />
              <span className="admin-badge">3</span>
            </button>
            <div className="admin-profile-menu">
              <div className="admin-avatar">
                <UserIcon size={20} />
              </div>
              <div className="admin-profile-text">
                <span className="admin-profile-name">{adminName}</span>
                <span className="admin-profile-role">{adminRole}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
