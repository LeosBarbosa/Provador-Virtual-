/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { UploadCloudIcon, CheckCircleIcon, XIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { SceneOptions } from '../types';

interface BackgroundPanelProps {
  onBackgroundSelect: (file: File, options: SceneOptions) => void;
  isLoading: boolean;
}

const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ onBackgroundSelect, isLoading }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  // Options State
  const [replaceSubject, setReplaceSubject] = useState(false);
  const [poseHint, setPoseHint] = useState("");
  const [expressionHint, setExpressionHint] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // By default, open options when a file is selected
      setShowOptions(true);
    }
  };

  const handleApply = () => {
    if (selectedFile) {
        onBackgroundSelect(selectedFile, {
            replaceSubject,
            poseHint,
            expressionHint
        });
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setReplaceSubject(false);
    setPoseHint("");
    setExpressionHint("");
    setShowOptions(false);
  };

  return (
    <div className="pt-6 border-t border-gray-400/50">
      <h2 className="text-xl font-serif tracking-wider text-gray-800 mb-3">Cenário Personalizado</h2>
      <p className="text-xs text-gray-500 mb-4">Envie um cenário. A IA analisará a iluminação, cores e texturas para compor uma imagem fotorealista, como se você estivesse lá.</p>

      {!previewUrl ? (
        <label className={`w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-gray-900 hover:bg-gray-50 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
             <div className="bg-gray-100 p-3 rounded-full mb-2 text-gray-700">
                <UploadCloudIcon className="w-6 h-6" />
             </div>
             <span className="text-sm font-medium text-gray-700">Enviar Cenário</span>
             <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
             />
        </label>
      ) : (
        <div className="space-y-4">
            {/* Preview Image */}
            <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video shadow-sm">
                <img src={previewUrl} alt="Cenário selecionado" className="w-full h-full object-cover" />
                <button 
                    onClick={handleClear}
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Fine Tuning Options */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className="w-full flex items-center justify-between p-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    <span>Ajustes de Composição</span>
                    {showOptions ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>
                
                {showOptions && (
                    <div className="p-3 pt-0 space-y-3 animate-fade-in">
                        <div className="flex items-start gap-2 pt-2">
                             <input 
                                id="replace-subject" 
                                type="checkbox" 
                                checked={replaceSubject}
                                onChange={(e) => setReplaceSubject(e.target.checked)}
                                className="mt-1 w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                disabled={isLoading}
                             />
                             <label htmlFor="replace-subject" className="text-sm text-gray-600 leading-tight">
                                <span className="font-medium text-gray-800">Substituir pessoa na foto</span>
                                <br/>
                                <span className="text-xs">A IA removerá a pessoa original e colocará você na mesma posição/pose.</span>
                             </label>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Ajuste de Pose (Opcional)</label>
                            <input 
                                type="text"
                                value={poseHint}
                                onChange={(e) => setPoseHint(e.target.value)}
                                placeholder="Ex: Sentado relaxado, andando..."
                                className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Expressão Facial (Opcional)</label>
                            <input 
                                type="text"
                                value={expressionHint}
                                onChange={(e) => setExpressionHint(e.target.value)}
                                placeholder="Ex: Sorrindo, sério, olhando para o lado..."
                                className="w-full text-sm border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}
            </div>

            <button 
                onClick={handleApply}
                disabled={isLoading}
                className="w-full bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading ? 'Criando Composição...' : 'Gerar Nova Cena'}
            </button>
        </div>
      )}
    </div>
  );
};

export default BackgroundPanel;