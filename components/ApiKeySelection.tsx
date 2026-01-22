/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface ApiKeySelectionProps {
  onKeySelected: () => void;
}

const ApiKeySelection: React.FC<ApiKeySelectionProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio?.openSelectKey) {
        await aistudio.openSelectKey();
      }
    } catch (e) {
      console.error("Failed to open key selector", e);
    } finally {
      // Per instructions: Assume success and proceed.
      // Also handles race condition by not waiting for hasSelectedApiKey to return true immediately.
      onKeySelected();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
          Acesso ao Modelo Pro
        </h2>
        <p className="text-gray-600 mb-6">
          Para utilizar o modelo de alta qualidade (4K), é necessário conectar uma chave de API válida de um projeto pago do Google Cloud.
        </p>
        
        <button
          onClick={handleSelectKey}
          className="w-full bg-gray-900 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors shadow-md mb-4"
        >
          Selecionar Chave de API
        </button>

        <p className="text-xs text-gray-500">
          Precisa de ajuda? Consulte a documentação de faturamento: <br/>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            ai.google.dev/gemini-api/docs/billing
          </a>
        </p>
      </div>
    </div>
  );
};

export default ApiKeySelection;