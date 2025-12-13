import React, { useState } from 'react';
import styles from './CardUploadControl.module.scss';

// URL dell'endpoint backend (dovrebbe essere /api/cards/upload come definito nelle rotte)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_URL = `${API_BASE_URL}/cards/upload`;

const CardUploadControl: React.FC = () => {
    // Stato per il file selezionato dall'utente
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // Stato per l'opzione "Pulisci esistenti" (corrisponde a req.body.clearExisting)
    const [clearExisting, setClearExisting] = useState<boolean>(false);
    // Stato per monitorare l'attività di upload
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    // Messaggio di feedback per l'utente
    const [message, setMessage] = useState<string>('');

    /**
     * Gestisce la selezione di un file dall'input.
     */
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            // Prende il primo file selezionato
            setSelectedFile(event.target.files[0]);
            setMessage('');
        } else {
            setSelectedFile(null);
        }
    };

    /**
     * Gestisce l'invio del form, includendo la richiesta di conferma per la pulizia.
     */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedFile) {
            setMessage('Seleziona un file prima di procedere.');
            return;
        }

        // 🟢 STEP 1: Richiesta di conferma per l'operazione TRUNCATE
        if (clearExisting) {
            const confirmation = window.confirm(
                "ATTENZIONE: Hai selezionato di pulire tutte le cartelle esistenti. " +
                "Questo eliminerà TUTTE le cartelle dal database in modo irreversibile. " +
                "Sei sicuro di voler procedere con la TRONCATURA della tabella?"
            );

            // Se l'utente annulla, interrompe l'invio
            if (!confirmation) {
                setMessage('Importazione annullata dall\'utente.');
                return;
            }
        }
        // -----------------------------

        setUploadStatus('loading');
        setMessage('Caricamento in corso...');

        // STEP 2: Prepara i dati in formato multipart/form-data
        const formData = new FormData();

        // Multer cerca il campo 'cardsFile'. Deve corrispondere a upload.single('cardsFile')
        formData.append('cardsFile', selectedFile);

        // Invia il flag di pulizia come stringa
        formData.append('clearExisting', clearExisting.toString());

        try {
            // STEP 3: Esegue la chiamata API
            const response = await fetch(API_URL, {
                method: 'POST',
                // Non impostare Content-Type: il browser lo gestisce automaticamente con FormData
                body: formData,
            });

            const result = await response.json();

            // STEP 4: Gestisce la risposta
            if (response.ok) {
                setUploadStatus('success');
                setMessage(`✅ Importazione completata! Salvate ${result.count} cartelle. Messaggio: ${result.message}`);
                setSelectedFile(null); // Resetta il file
                // Opzionale: pulisce anche il flag clearExisting
                setClearExisting(false);
            } else {
                setUploadStatus('error');
                setMessage(`❌ Errore Backend: ${result.message || 'Errore sconosciuto durante l\'importazione.'}`);
            }
        } catch (error) {
            setUploadStatus('error');
            setMessage(`❌ Errore di Rete: Impossibile connettersi al server. Controlla la console.`);
            console.error(error);
        } finally {
            // L'upload è finito, sia in caso di successo che di errore
            setUploadStatus('idle');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Gestione Importazione Cartelle Tombola</h2>

            <form onSubmit={handleSubmit} className={styles.uploadForm}>

                <div className={styles.fileInputGroup}>
                    <label htmlFor="cardFile">Seleziona File (.cards / XML):</label>
                    <input
                        type="file"
                        id="cardFile"
                        // Il 'name' qui non è rilevante per FormData, ma serve per l'accessibilità
                        name="cardFile"
                        accept=".cards, .xml, text/xml"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                        disabled={uploadStatus === 'loading'}
                    />
                    {selectedFile && <p className={styles.fileName}>File Selezionato: **{selectedFile.name}**</p>}
                </div>

                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        id="clearExisting"
                        checked={clearExisting}
                        onChange={(e) => setClearExisting(e.target.checked)}
                        disabled={uploadStatus === 'loading'}
                    />
                    <label htmlFor="clearExisting" className={clearExisting ? styles.dangerLabel : ''}>
                        Pulisci Cartelle Esistenti prima dell'Importazione (TRUNCATE)
                    </label>
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    // Disabilita il pulsante se nessun file è selezionato o se è in caricamento
                    disabled={!selectedFile || uploadStatus === 'loading'}
                >
                    {uploadStatus === 'loading' ? 'Caricamento...' : 'Importa Cartelle'}
                </button>
            </form>

            {/* Messaggio di stato */}
            {message && (
                <div className={`${styles.statusMessage} ${styles[uploadStatus]}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default CardUploadControl;