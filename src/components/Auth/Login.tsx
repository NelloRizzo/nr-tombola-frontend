// src/components/Auth/Login.tsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Auth.scss';
import { AuthContext } from './AuthProvider';

const Login: React.FC = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('Login must be used within an AuthProvider');
    }
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        setError('');

        const { refreshAuth } = context;

        const result = await authService.login(formData);
        setLoading(false);
        if (result.success) {
            await refreshAuth();
            navigate('/dashboard');
        } else {
            setError(result.error || 'Login failed');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Tombola Login</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <button onClick={() => navigate('/register')} className="link-btn">
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;