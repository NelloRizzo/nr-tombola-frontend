// Funzione helper per combinare il BASE_PATH e la rotta, gestendo gli slash.
export const combinePath = (base: string, route: string): string => {
    // 1. Pulizia della base (rimuovi slash finale se presente, tranne se è solo '/')
    let cleanBase = base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
    
    // 2. Pulizia della rotta (rimuovi slash iniziale)
    const cleanRoute = route.startsWith('/') ? route.slice(1) : route;

    // Se la base è vuota (es. in locale), usiamo solo la rotta prefissata con '/'
    if (!cleanBase || cleanBase === '/') {
        return `/${cleanRoute}`;
    }

    // 3. Combinazione (es. /nr-tombola-frontend + /game/table/123)
    return `${cleanBase}/${cleanRoute}`;
};