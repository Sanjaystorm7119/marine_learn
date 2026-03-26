import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import '../pages/admin.css';

const AdminUserDetails = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Theming for chart
    const COLORS = ['hsl(207, 52%, 40%)', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        const fetchUserDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(`http://127.0.0.1:8000/users/${id}`, {
                     headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [id, navigate]);

    if (loading) {
        return <div className="loading-container">Loading User Profile...</div>;
    }

    if (error) {
        return (
            <div className="admin-container">
                <div className="error-message">{error}</div>
                <Link to="/admin/users" className="admin-btn admin-btn-outline">Back to Users</Link>
            </div>
        );
    }

    if (!user) return null;

    // Formatting chart data for Recharts - Courses
    const chartData = user.course_progress && user.course_progress.length > 0 
        ? user.course_progress.map(cp => ({
            name: `Course ${cp.course_id}`,
            completion: cp.completion_percentage,
            status: cp.status
        })) : [];

    // Mock categorizing achievements for a Radar Chart to make it graphical
    // In a real app, 'category' would come from the database.
    const achievementCategories = [
        { subject: 'Leadership', A: 0, fullMark: 100 },
        { subject: 'Safety', A: 0, fullMark: 100 },
        { subject: 'Navigation', A: 0, fullMark: 100 },
        { subject: 'Engineering', A: 0, fullMark: 100 },
        { subject: 'Communication', A: 0, fullMark: 100 },
    ];

    if (user.achievements && user.achievements.length > 0) {
        user.achievements.forEach((ach, index) => {
             // Assigning mock scores based on the existence of achievements
             const catIndex = index % achievementCategories.length;
             achievementCategories[catIndex].A += 35; // arbitrary score boost per achievement
             if(achievementCategories[catIndex].A > 100) achievementCategories[catIndex].A = 100;
        });
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">User Profile</h1>
                    <div className="admin-breadcrumb">
                        <Link to="/admin">Admin Dashboard</Link> / 
                        <Link to="/admin/users"> Users</Link> / 
                        <span> {user.full_name}</span>
                    </div>
                </div>
            </div>

            <div className="user-profile-header">
                <div className="profile-avatar">
                   {/* Grab first letter of name */}
                   {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="profile-info">
                    <h2>{user.full_name}</h2>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> <span style={{color: 'hsl(207, 52%, 40%)', fontWeight: 'bold'}}>{user.role}</span></p>
                    <p><strong>ID:</strong> {user.id}</p>
                </div>
            </div>

            <div className="details-grid">
                {/* Course Progress Chart Section */}
                <div className="details-section">
                    <h3>Course Progress Overview</h3>
                    {chartData.length > 0 ? (
                        <div style={{ width: '100%', height: 350, marginTop: '1.5rem' }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
                                    <XAxis type="number" domain={[0, 100]} stroke="#888" tick={{fill: '#888'}} />
                                    <YAxis type="category" dataKey="name" stroke="#888" tick={{fill: '#888'}} width={100} />
                                    <RechartsTooltip 
                                        cursor={{fill: 'rgba(128,128,128,0.1)'}} 
                                        contentStyle={{backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff', borderRadius: '8px'}}
                                        formatter={(value, name, props) => [`${value}% (${props.payload.status})`, 'Completion']}
                                    />
                                    <Bar dataKey="completion" radius={[0, 4, 4, 0]} background={{ fill: 'rgba(128,128,128,0.1)' }} barSize={30}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.completion === 100 ? '#4CAF50' : 'hsl(207, 52%, 40%)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p style={{color: '#888', textAlign: 'center', marginTop: '3rem'}}>No courses started yet.</p>
                    )}
                </div>

                {/* Achievements Section */}
                <div className="details-section">
                    <h3>Skills & Achievements Radar</h3>
                    {user.achievements && user.achievements.length > 0 ? (
                        <div style={{ width: '100%', height: 350, marginTop: '1.5rem' }}>
                             <ResponsiveContainer>
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={achievementCategories}>
                                    <PolarGrid stroke="rgba(128,128,128,0.3)" />
                                    <PolarAngleAxis dataKey="subject" tick={{fill: '#888', fontSize: 12}} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Skills" dataKey="A" stroke="hsl(207, 52%, 40%)" fill="hsl(207, 52%, 40%)" fillOpacity={0.5} />
                                    <RechartsTooltip 
                                        contentStyle={{backgroundColor: '#1a1a1a', borderColor: '#333', color: '#fff', borderRadius: '8px'}}
                                        formatter={(value) => [`${value}/100`, 'Skill Level']}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p style={{color: '#888', textAlign: 'center', marginTop: '3rem'}}>No skills rated or achievements earned yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetails;
