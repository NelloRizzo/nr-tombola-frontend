// src/components/Home/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Home.scss';
import logo from '/favicon.png';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = authService.isAuthenticated();

    return (
        <div className="home-container">
            <main className="home-content">
                <section className="hero-section">
                    <div className="hero-content">
                        <h1><img src={logo} alt='[NR] Tombola' /> NR Tombola</h1>
                        <p className="subtitle">Gioca la tombola on-line insieme con i tuoi amici.</p>
                        <p className="description">
                            Vivi l'emozione della Tombola in tempo reale! Partecipa al gioco, chiama i numeri e gareggia con giocatori da tutto il mondo.
                        </p>

                        <div className="hero-buttons">
                            {isLoggedIn ? (
                                <button onClick={() => navigate('/dashboard')} className="btn-primary">
                                    Vai al tuo Dashboard
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => navigate('/register')} className="btn-primary">
                                        Inizia a Giocare Gratis
                                    </button>
                                    <button onClick={() => navigate('/login')} className="btn-secondary">
                                        Ho già un Account
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hero-image">
                        <div className="tombola-preview">
                            <div className="numbers-grid">
                                {[15, 27, 42, 68, 89, 3, 19, 51, 74].map((num, index) => (
                                    <div
                                        key={num}
                                        className={`preview-number ${index < 5 ? 'drawn' : ''}`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {num}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="how-it-works">
                    <h2>Come Giocare</h2>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Crea Partita o Partecipa</h3>
                            <p>Inizia una partita ed estrai i numeri, oppure partecipa ad una partita gestita da un tuo amico.</p>
                        </div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Controlla le Cartelle</h3>
                            <p>Ogni giocatore potrà possedere più cartelle con 15 numeri casuali.</p>
                        </div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Ascolta le Estrazioni</h3>
                            <p>I numeri saranno estratti casualmente.</p>
                        </div>

                        <div className="step">
                            <div className="step-number">4</div>
                            <h3>Segna i Numeri Estratti</h3>
                            <p>Segna i numeri estratti sulle tue cartelle digitali.</p>
                        </div>

                        <div className="step">
                            <div className="step-number">5</div>
                            <h3>Vinci!</h3>
                            <p>Gioca per realizzare Ambo, Terno, Quaterna, Cinquina, o Tombola!</p>
                        </div>
                    </div>
                </section>

                <section className="features">
                    <h2>Why Choose Our Platform?</h2>
                    <div className="features-grid">
                        <div className="feature">
                            <div className="feature-icon">⚡</div>
                            <h3>Real-time Gameplay</h3>
                            <p>No delays, play with friends instantly</p>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">🎨</div>
                            <h3>Beautiful Interface</h3>
                            <p>Wooden-themed Tombola table with smooth animations</p>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">👥</div>
                            <h3>Multiplayer</h3>
                            <p>Play with friends or join public games</p>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">📱</div>
                            <h3>Mobile Friendly</h3>
                            <p>Play on any device, anywhere</p>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">🔒</div>
                            <h3>Secure & Fair</h3>
                            <p>Random number generation ensures fair play</p>
                        </div>

                        <div className="feature">
                            <div className="feature-icon">🎯</div>
                            <h3>Easy to Use</h3>
                            <p>Simple interface, no downloads required</p>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="cta-content">
                        <h2>Ready to Start Playing?</h2>
                        <p>Join thousands of players enjoying Tombola online. It's free to start!</p>

                        <div className="cta-buttons">
                            {isLoggedIn ? (
                                <button onClick={() => navigate('/dashboard')} className="btn-cta">
                                    Go to Dashboard
                                </button>
                            ) : (
                                <>
                                    <button onClick={() => navigate('/register')} className="btn-cta">
                                        Create Free Account
                                    </button>
                                    <button onClick={() => navigate('/login')} className="btn-cta-outline">
                                        Login to Play
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <span className="logo-icon">🎲</span>
                        <span className="logo-text">Tombola Online</span>
                    </div>

                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Game</h4>
                            <a href="/how-to-play">How to Play</a>
                        </div>

                        <div className="footer-column">
                            <h4>Company</h4>
                            <a href="/about">About Us</a>
                            <a href="/contact">Contact</a>
                            <a href="/blog">Blog</a>
                        </div>

                        <div className="footer-column">
                            <h4>Legal</h4>
                            <a href="/privacy">Privacy Policy</a>
                            <a href="/terms">Terms of Service</a>
                            <a href="/cookies">Cookie Policy</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} Tombola Online by EnnErrE. All rights reserved.</p>
                    <p>For entertainment purposes only. Must be 18+ to play.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;