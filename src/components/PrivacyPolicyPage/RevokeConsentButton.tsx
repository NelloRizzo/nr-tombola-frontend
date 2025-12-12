import React from 'react';
// La libreria react-cookie-consent espone una funzione per resettare il consenso.
import { getCookieConsentValue, Cookies } from 'react-cookie-consent'; 

const COOKIE_NAME = "nr-Tombola-Consent";

const RevokeConsentButton: React.FC = () => {
    
    // Funzione per inviare l'aggiornamento a GTM (denied)
    const denyGtmConsent = () => {
        // Questa funzione deve essere richiamata anche se GTM non è ancora caricato
        // per impostare lo stato di rifiuto al prossimo caricamento.
        if ((window as any).dataLayer) {
            (window as any).dataLayer.push({
                'consent': 'update',
                'ad_storage': 'denied',
                'analytics_storage': 'denied'
            });
            console.log("GTM Consent Mode aggiornato a 'denied'.");
        }
    };
    
    // Gestione del click
    const handleRevoke = () => {
        const consentValue = getCookieConsentValue(COOKIE_NAME);
        
        if (consentValue === 'true') {
            // 1. Rimuove il cookie del consenso
            Cookies.remove(COOKIE_NAME, { path: "/" }); 
            
            // 2. Invia il segnale di rifiuto a GTM
            denyGtmConsent();
            
            // 3. Fornisce un feedback all'utente e ricarica il banner
            alert("Il tuo consenso è stato revocato. Sarai reindirizzato alla Home per visualizzare il banner aggiornato.");
            window.location.href = '/'; // Ricarica la pagina base per mostrare il banner
        } else {
            alert("Non hai ancora accettato i cookie analitici.");
        }
    };
    
    return (
        <button 
            onClick={handleRevoke}
            style={{ 
                padding: '10px 20px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
            }}
        >
            Revoca Consenso ai Cookie Analitici
        </button>
    );
};

export default RevokeConsentButton;