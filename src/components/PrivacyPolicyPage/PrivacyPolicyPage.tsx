import React from 'react';
import styles from './PrivacyPolicyPage.module.scss'; // Stile per la pagina
import RevokeConsentButton from './RevokeConsentButton';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className={styles.privacyContainer}>
            <header className={styles.header}>
                <h1>Informativa sulla Privacy (Privacy Policy)</h1>
                <p><strong>[NR] Tombola</strong></p>
                <p>Ultimo aggiornamento: 12 Dicembre 2025</p>
            </header>

            <section>
                <h2>1. Titolare del Trattamento dei Dati</h2>
                <p>Il Titolare del Trattamento dei Dati è: EnnErrE Consulting di Aniello Rizzo (nello.rizzo.ascea@gmail.com)</p>
            </section>

            <section>
                <h2>2. Dati Raccolti e Modalità di Trattamento</h2>
                <p>L'Applicazione raccoglie due tipologie principali di dati: Dati Funzionali (Essenziali) e Dati di Analisi Statistica (Soggetti a Consenso).</p>

                <h3>2.1. Dati di Gioco e Funzionali (Dati Essenziali)</h3>
                <p>Questi dati sono essenziali per il funzionamento del gioco (ID partita, numeri estratti, ecc.). La base giuridica è l'esecuzione di un contratto (Termini di Servizio del gioco).</p>

                <h3>2.2. Dati di Analisi Statistica e Cookie di Terze Parti (Dati Soggetti a Consenso)</h3>
                <p>L'Applicazione utilizza Google Tag Manager (GTM) e Google Analytics per l'analisi statistica anonima.<br />
                    <strong>Questi strumenti sono attivati solo dopo che l'utente ha fornito il consenso esplicito.</strong></p>
            </section>

            <section>
                <h2>3. Gestione e Revoca del Consenso (Cookie)</h2>
                <p>Ai sensi del GDPR, l'attivazione degli strumenti di tracciamento avviene solo tramite consenso preventivo (Opt-in). Hai il diritto di revocare il tuo consenso in qualsiasi momento.</p>

                <p>Per revocare il consenso ai cookie analitici, clicca sul pulsante sottostante:</p>

                <RevokeConsentButton />

                <p className={styles.note}>Dopo la revoca, i cookie analitici verranno bloccati al prossimo caricamento della pagina e i dati di tracciamento non essenziali non verranno più raccolti.</p>
            </section>

            <section>
                <h2>4. Trasferimento dei Dati</h2>
                <p>I dati raccolti da Google Analytics e Google Tag Manager vengono trasferiti e conservati sui server di Google. Google aderisce agli standard di protezione dei dati previsti dal GDPR.</p>
            </section>

            <section>
                <h2>5. I Tuoi Diritti (GDPR)</h2>
                <p>In qualità di utente, hai il diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei dati. Per esercitare questi diritti, contatta il Titolare del Trattamento.</p>
            </section>

            <section>
                <h2>6. Modifiche a questa Informativa</h2>
                <p>Questa informativa può essere aggiornata periodicamente. Si prega di consultare questa pagina per le versioni più recenti.</p>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;