/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
// Fixed: Added missing imports for motion and AnimatePresence from framer-motion
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, MaximizeIcon } from './icons';
import Spinner from './Spinner';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
}

const Canvas: React.FC<CanvasProps> = ({ displayImageUrl, onStartOver, isLoading, onSelectPose, poseInstructions, currentPoseIndex }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <div className="w-full h-full p-4 flex items-center justify-center relative overflow-hidden bg-white">
      {/* Top Bar Actions */}
      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center">
        <button onClick={onStartOver} className="bg-white/90 backdrop-blur-md p-2.5 px-4 rounded-full border border-gray-200 shadow-sm text-xs font-bold text-gray-700 flex items-center gap-2 hover:bg-white active:scale-95 transition-all">
          <RotateCcwIcon className="w-4 h-4" /> <span className="hidden sm:inline">Reiniciar</span>
        </button>

        <div className="flex gap-2">
          <button onClick={() => setIsFullScreen(true)} className="bg-white/90 backdrop-blur-md p-2.5 rounded-full border border-gray-200 shadow-sm hover:bg-white active:scale-95 transition-all">
            <MaximizeIcon className="w-5 h-5 text-gray-700"/>
          </button>
          <button className="bg-gray-900 text-white p-2.5 px-5 rounded-full shadow-lg text-xs font-black tracking-wide hover:bg-black active:scale-95 transition-all">
            <DownloadIcon className="w-4 h-4 inline mr-1.5"/> Baixar
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="relative w-full h-full flex items-center justify-center pb-12 md:pb-0">
        {displayImageUrl ? (
          <img 
            src={displayImageUrl} 
            className="max-h-[50vh] md:max-h-[80vh] w-auto object-contain rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-700 animate-zoom-in" 
            alt="Modelo Gerado"
          />
        ) : (
          <div className="flex flex-col items-center">
            <Spinner />
            <p className="mt-4 text-[10px] tracking-[0.3em] font-black text-gray-300 uppercase">Gerando Arte...</p>
          </div>
        )}
      </div>

      {/* Floating Pose Controller */}
      {displayImageUrl && !isLoading && (
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-100 p-1.5 rounded-full z-30 min-w-[300px] border-b-2 border-gray-200/50">
          <button 
            onClick={() => onSelectPose((currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length)} 
            className="p-3.5 hover:bg-gray-50 rounded-full active:scale-75 transition-all"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-900"/>
          </button>
          
          <div className="text-center flex-grow px-2">
            <p className="text-[8px] uppercase font-black text-gray-400 tracking-widest mb-0.5">Estilo da Pose</p>
            <p className="text-xs font-black text-gray-900 truncate max-w-[140px] md:max-w-[200px]">
                {poseInstructions[currentPoseIndex].split(':')[0]}
            </p>
          </div>

          <button 
            onClick={() => onSelectPose((currentPoseIndex + 1) % poseInstructions.length)} 
            className="p-3.5 hover:bg-gray-50 rounded-full active:scale-75 transition-all"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-900"/>
          </button>
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-4 cursor-zoom-out" 
            onClick={() => setIsFullScreen(false)}
          >
            <img src={displayImageUrl!} className="max-w-full max-h-full object-contain" alt="Visualização Completa" />
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">Fechar (Esc)</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Canvas;