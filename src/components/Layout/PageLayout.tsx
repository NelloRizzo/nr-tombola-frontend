// src/components/Layout/PageLayout.tsx
import React from 'react';
import Navbar from './Navbar';
import './PageLayout.scss';

interface PageLayoutProps {
    children: React.ReactNode;
    fullPage?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, fullPage = false }) => {
    return (
        <div className="page-layout">
            <Navbar />
            <div className={`page-content ${fullPage ? 'full-page-content' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default PageLayout;