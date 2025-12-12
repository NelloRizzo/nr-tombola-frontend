// src/types/gtm.d.ts

// 1. Definisce la struttura degli oggetti per la gestione del consenso (Consent Mode)
interface ConsentSettings {
    ad_storage: 'granted' | 'denied';
    analytics_storage: 'granted' | 'denied';
    // Puoi aggiungere altri tipi di consenso se necessario
    [key: string]: 'granted' | 'denied' | string;
}

// 2. Definisce la struttura generica per gli oggetti inviati a dataLayer
interface DataLayerPush {
    // Proprietà standard usate per GTM o eventi personalizzati
    event?: string; 
    
    // Proprietà specifiche di Consent Mode
    consent?: 'default' | 'update'; 

    // Permette altre proprietà generiche e l'uso di 'gtm.start'
    [key: string]: any; 
}

// 3. Combina la struttura di base con le impostazioni di consenso
// Partial<ConsentSettings> rende opzionali le chiavi ad_storage e analytics_storage
type ConsentPush = DataLayerPush & Partial<ConsentSettings>;

// 4. Definisce il tipo dell'array dataLayer
type DataLayer = ConsentPush[];

// 5. Estende l'interfaccia Window con la proprietà dataLayer
declare global {
    interface Window {
        dataLayer: DataLayer;
        gtag: (...args: any[]) => void;
    }
}