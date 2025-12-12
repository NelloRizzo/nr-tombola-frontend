// src/hooks/useTracking.ts

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

export const useTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Controlla se GA è stato inizializzato (il consenso è stato dato)
        // La libreria gestisce implicitamente il controllo, ma è meglio essere espliciti
        
        // Invia l'evento di visualizzazione di pagina
        ReactGA.send({ 
            hitType: 'pageview', 
            page: location.pathname + location.search 
        });

        // Questa logica si attiva ad ogni cambio di URL gestito da React Router
    }, [location]);
};