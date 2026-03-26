import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import '../pages/admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, loading: true, error: null, usersByRole: [] });
    const navigate = useNavigate();

    // Theme matching colors
    const COLORS = ['hsl(207, 52%, 40%)', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const data = await response.json();

                const usersByRole = Object.keys(data.roles).map(role => ({
                    name: role,
                    value: data.roles[role]
                }));

                setStats({
                    totalUsers: data.total_users,
                    usersByRole,
                    loading: false,
                    error: null
                });

            } catch (err) {
                setStats({ totalUsers: 0, usersByRole: [], loading: false, error: err.message });
            }
        };

        fetchStats();
    }, [navigate]);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Admin Dashboard</h1>
                    <div className="admin-breadcrumb">
                        <span>Home</span> / <span>Admin Dashboard</span>
                    </div>
                </div>
            </div>

            {stats.error && <div className="error-message">{stats.error}</div>}

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-card-title">Total Users</div>
                    <div className="stat-card-value">
                        {stats.loading ? '...' : stats.totalUsers}
                    </div>
                </div>
                {/* Future stats can go here */}
                <div className="admin-stat-card">
                    <div className="stat-card-title">Platform Status</div>
                    <div className="stat-card-value" style={{color: '#4CAF50', fontSize: '1.5rem', marginTop: '1rem'}}>
                        Online 🚀
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            {!stats.loading && stats.usersByRole.length > 0 && (
                <div className="admin-stats-grid" style={{ marginTop: '2rem', gap: '2rem' }}>
                    <div className="admin-stat-card" style={{ padding: '2rem 1rem' }}>
                        <h3 className="stat-card-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>User Role Distribution</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={stats.usersByRole}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.usersByRole.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff'}} itemStyle={{color: '#fff'}} />
                                    <Legend wrapperStyle={{ color: '#888' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="admin-stat-card" style={{ padding: '2rem 1rem' }}>
                        <h3 className="stat-card-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Users By Role (Bar View)</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats.usersByRole} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                    <XAxis dataKey="name" stroke="#888" tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#888" tick={{fill: '#888'}} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip cursor={{fill: 'rgba(128,128,128,0.1)'}} contentStyle={{backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                                    <Bar dataKey="value" fill="hsl(207, 52%, 40%)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-actions" style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <Link to="/admin/users" className="admin-btn admin-btn-primary" style={{textDecoration: 'none'}}>
                    Manage Users
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
