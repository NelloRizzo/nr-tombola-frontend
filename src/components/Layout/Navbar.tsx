// src/components/Layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Navbar.scss';
import logo from '/favicon.png';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isLoggedIn = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    // Non mostrare navbar nella pagina del tabellone
    if (location.pathname.match(/^\/game\/\d+$/)) {
        return null;
    }

    const handleLogout = () => {
        authService.logout();
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <div className="navbar-logo" onClick={() => navigate('/')}>
                    <span className="logo-icon"><img src={logo} width='32' alt='🎲' /></span>
                    <span className="logo-text">NR Tombola</span>
                </div>

                {/* Desktop Menu */}
                <div className="navbar-menu">
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                    <Link to="/privacy-policy" className={location.pathname === '/privacy-policy' ? 'active' : ''}>Privacy</Link>
                    <Link to="/games" className={location.pathname === '/games' ? 'active' : ''}>Games</Link>
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
                            <Link to="/cards/upload" className={location.pathname === '/dashboard' ? 'active' : ''}>Cartelle</Link>
                            <div className="user-menu">
                                <div className="user-info">
                                    <span className="user-name">{user?.name}</span>
                                    <span className="user-email">{user?.email}</span>
                                </div>
                                <button onClick={handleLogout} className="logout-btn">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
                            <Link to="/register" className="register-btn">Register</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Mobile Menu */}
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/" onClick={() => setIsMenuOpen(false)}>
                        Home
                    </Link>

                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                Dashboard
                            </Link>
                            <div className="mobile-user-info">
                                <div className="user-avatar">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="user-name">{user?.name}</div>
                                    <div className="user-email">{user?.email}</div>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="mobile-logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="mobile-register-btn">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;