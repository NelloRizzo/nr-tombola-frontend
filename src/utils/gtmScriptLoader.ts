// @ts-nocheck

/**
 * Inietta lo snippet GTM nel DOM.
 * @param {string} gtmId L'ID del contenitore GTM (es. GTM-XXXXXXX).
 */
export const loadGtmScript = (gtmId) => {
    if (!gtmId || gtmId === 'GTM-NO_ID') {
        console.error("GTM Script Loader: ID GTM non valido.");
        return;
    }

    // Snippet GTM esatto, eseguito in un contesto JS non tipizzato
    (function (w, d, s, l, i) {
        w[l] = w[l] || []; w[l].push({
            'gtm.start':
                new Date().getTime(), event: 'gtm.js'
        }); var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', gtmId);

    console.log(`GTM Script caricato per ID: ${gtmId}`);
};