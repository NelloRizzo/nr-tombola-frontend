import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { loadGtmScript } from '../../utils/gtmScriptLoader';

const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-NO_ID';

type LocalDataLayer = {
    push: (data: any) => void;
};

const getDataLayer = (): LocalDataLayer => {
    // Se dataLayer non è definito, lo inizializziamo come un array vuoto.
    (window as any).dataLayer = (window as any).dataLayer || [];
    return (window as any).dataLayer as LocalDataLayer;
}

/**
 * 1. Attiva il Consent Mode di GTM.
 * Questa funzione imposta i valori predefiniti per i tipi di cookie (negati di default).
 */
// Usiamo i tipi ConsentSettings e DataLayerPush che abbiamo definito globalmente
// Se TypeScript si lamenta, puoi importarli direttamente se hai messo export nel file .d.ts,
// altrimenti confidiamo nel global.

export const setGtmDefaultConsent = () => {
    const dataLayer = getDataLayer();

    dataLayer.push({
        'consent': 'default',
        'ad_storage': 'denied',
        'analytics_storage': 'denied'
    });
};

/**
 * 3. Aggiorna il consenso in GTM a 'granted' per i cookie accettati.
 * Questo sblocca i tag interni al contenitore GTM.
 */
export const updateGtmConsent = () => {
    const dataLayer = getDataLayer();
    dataLayer.push({
        'consent': 'update',
        'ad_storage': 'granted',
        'analytics_storage': 'granted'
    });
    console.log("GTM Consent Mode aggiornato a 'granted'.");
};

/**
 * Banner per la gestione del consenso ai cookie di Google Analytics (GDPR compliant).
 */
const CookieConsentBanner: React.FC = () => {
    return (
        <CookieConsent
            // Parametri Base e Stile
            location="bottom"
            buttonText="Accetto"
            declineButtonText="Rifiuto"
            cookieName="nrTombolaConsent"
            style={{ background: "#2B3742", padding: '10px 0' }}
            buttonStyle={{ color: "white", fontSize: "14px", background: "#FFD700", padding: '10px 20px', borderRadius: '5px' }}
            declineButtonStyle={{ color: "#FFD700", background: "transparent", border: '1px solid #FFD700', padding: '10px 20px', borderRadius: '5px' }}

            // Logica GDPR
            enableDeclineButton
            flipButtons
            expires={150}
            debug={true} // Imposta a true in sviluppo per testare

            // Funzione di consenso
            onAccept={() => {
                loadGtmScript(GTM_ID); 
                updateGtmConsent();
            }}

            // Funzione di rifiuto
            onDecline={() => {
                console.log("Cookie: Consenso Rifiutato. GA Bloccato.");
                setGtmDefaultConsent();
            }}
        >
            Questo sito utilizza cookie di Google Analytics per l'analisi statistica. Cliccando su "Accetto" acconsenti al loro utilizzo.{" "}
            <a href="/privacy-policy" style={{ color: "#FFD700", fontWeight: 'bold' }}>Maggiori informazioni</a>
        </CookieConsent>
    );
};

export default CookieConsentBanner;