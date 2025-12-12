// src/components/Common/Modal.tsx
import React, { useEffect, type ReactNode } from 'react';
import './Modal.scss'; // Stili dedicati per il modal

// Interfaccia delle proprietà
interface ModalProps {
    title: string;
    onClose: () => void; // Funzione per chiudere il modal
    children: ReactNode; // Contenuto del modal
}

/**
 * Componente Modal riutilizzabile.
 * Gestisce l'overlay, il titolo, il pulsante di chiusura e la chiusura con il tasto ESC.
 */
const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {

    // Effetto per la chiusura tramite tasto ESC
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Chiude il modal se viene premuto il tasto ESC (keyCode 27 o key 'Escape')
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Aggiunge l'event listener
        document.addEventListener('keydown', handleKeyDown);

        // Funzione di cleanup: rimuove l'event listener al dismount del componente
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]); // Dipendenza da onClose per coerenza

    // Impedisce la chiusura se si clicca direttamente sul contenuto del modal
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        // Overlay (onClick gestisce la chiusura se si clicca all'esterno del contenuto)
        <div className="modal-overlay" onClick={onClose}>
            {/* Contenitore principale del contenuto (dove avviene lo stopPropagation) */}
            <div className="modal-container" onClick={handleContentClick}>

                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="close-button" onClick={onClose} aria-label="Chiudi">
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;