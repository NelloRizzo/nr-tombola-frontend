// src/context/GameRefreshContext.tsx

import React, { createContext, useState, useContext, type ReactNode, useCallback, useMemo } from 'react';

// Interfaccia per il valore del contesto
interface GameRefreshContextType {
    // Contatore che cambia ogni volta che un'azione richiede un refresh
    refreshKey: number;
    // Funzione che i componenti trigger chiamano
    triggerRefresh: () => void;
}

const defaultState: GameRefreshContextType = {
    refreshKey: 0,
    triggerRefresh: () => console.warn('Refresh context not initialized')
};

export const GameRefreshContext = createContext<GameRefreshContextType>(defaultState);

export const useGameRefresh = () => useContext(GameRefreshContext);

interface GameRefreshProviderProps {
    children: ReactNode;
}

export const GameRefreshProvider: React.FC<GameRefreshProviderProps> = ({ children }) => {
    // Stato: un contatore che aumenta ad ogni refresh
    const [refreshKey, setRefreshKey] = useState(0);

    // Funzione per incrementare il contatore e notificare tutti i sottoscrittori
    const triggerRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const contextValue = useMemo(() => ({
        refreshKey, 
        triggerRefresh,
    }), [refreshKey, triggerRefresh]); 

    return (
        <GameRefreshContext.Provider value={contextValue}>
            {children}
        </GameRefreshContext.Provider>
    );
};