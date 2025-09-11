import React from 'react';
import { Modal } from './Modal';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  profileName: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  profileName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 md:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4">
            Eliminar Perfil
          </h2>
          <p className="text-brand-text mb-8">
            ¿Estás seguro de que quieres eliminar el perfil{" "}
            <span className="font-bold text-white">{profileName}</span>?
            <br />
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-slate-700/50 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-600/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </Modal>
  );
};