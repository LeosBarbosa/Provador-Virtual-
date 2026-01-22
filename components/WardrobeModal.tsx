/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import type { WardrobeItem } from '../types';
import { UploadCloudIcon, CheckCircleIcon, XIcon } from './icons';
import Spinner from './Spinner';
import { urlToFile } from '../lib/utils';

interface WardrobePanelProps {
  onGarmentSelect: (garmentFile: File, garmentInfo: WardrobeItem) => Promise<boolean>;
  activeGarmentIds: string[];
  isLoading: boolean;
  wardrobe: WardrobeItem[];
}

const WardrobePanel: React.FC<WardrobePanelProps> = ({ onGarmentSelect, activeGarmentIds, isLoading, wardrobe }) => {
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleGarmentClick = async (item: WardrobeItem) => {
        if (isLoading || activeGarmentIds.includes(item.id)) return;
        setError(null);
        try {
            // If the item was from an upload, its URL is a blob URL. We need to fetch it to create a file.
            // If it was a default item, it's a regular URL. This handles both.
            const file = await urlToFile(item.url, item.name);
            await onGarmentSelect(file, item);
        } catch (err) {
            const detailedError = `Falha ao carregar item do guarda-roupa. Isso geralmente é um problema de CORS. Verifique o console do desenvolvedor para detalhes.`;
            setError(detailedError);
            console.error(`[CORS Check] Failed to load and convert wardrobe item from URL: ${item.url}. The browser's console should have a specific CORS error message if that's the issue.`, err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setError('Por favor, selecione um arquivo de imagem.');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleConfirmUpload = async () => {
        if (selectedFile && previewUrl) {
            setIsProcessing(true);
            try {
                const customGarmentInfo: WardrobeItem = {
                    id: `custom-${Date.now()}`,
                    name: selectedFile.name,
                    url: previewUrl,
                };
                const success = await onGarmentSelect(selectedFile, customGarmentInfo);
                
                if (success) {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                }
            } catch (e) {
                console.error("Selection failed", e);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleCancelUpload = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
    };

  return (
    <div className="pt-6 border-t border-gray-400/50">
        <h2 className="text-xl font-serif tracking-wider text-gray-800 mb-3">Guarda-roupa</h2>
        
        {previewUrl && selectedFile && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg animate-fade-in">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">Nova Peça Selecionada</h3>
                    <button onClick={handleCancelUpload} className="text-gray-400 hover:text-gray-600" aria-label="Cancelar envio">
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-gray-200 bg-white" />
                    <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2 truncate max-w-[150px]" title={selectedFile.name}>{selectedFile.name}</p>
                        <button 
                            onClick={handleConfirmUpload}
                            disabled={isLoading || isProcessing}
                            className="w-full bg-gray-900 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors min-h-[36px]"
                        >
                            {isProcessing ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Processando...
                                </span>
                            ) : (
                                "Experimentar"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-3 gap-3">
            {wardrobe.map((item) => {
            const isActive = activeGarmentIds.includes(item.id);
            return (
                <button
                key={item.id}
                onClick={() => handleGarmentClick(item)}
                disabled={isLoading || isActive || isProcessing}
                className="relative aspect-square border rounded-lg overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 group disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={`Selecionar ${item.name}`}
                >
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-bold text-center p-1">{item.name}</p>
                </div>
                {isActive && (
                    <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                        <CheckCircleIcon className="w-8 h-8 text-white" />
                    </div>
                )}
                </button>
            );
            })}
            <label htmlFor="custom-garment-upload" className={`relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 transition-colors ${isLoading || isProcessing ? 'cursor-not-allowed bg-gray-100' : 'hover:border-gray-400 hover:text-gray-600 cursor-pointer'}`}>
                <UploadCloudIcon className="w-6 h-6 mb-1"/>
                <span className="text-xs text-center">Enviar</span>
                <input id="custom-garment-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} disabled={isLoading || isProcessing}/>
            </label>
        </div>
        {wardrobe.length === 0 && !previewUrl && (
             <p className="text-center text-sm text-gray-500 mt-4">Suas roupas enviadas aparecerão aqui.</p>
        )}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default WardrobePanel;