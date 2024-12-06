import React from 'react';

const Modal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl">Incoming Call</h2>
        <p>Would you like to answer the call?</p>
        <div className="mt-4 flex justify-around">
          <button 
            onClick={onAccept} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Answer
          </button>
          <button 
            onClick={onClose} 
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
