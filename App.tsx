
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import StartScreen from './components/StartScreen';
import Canvas from './components/Canvas';
import WardrobePanel from './components/WardrobeModal';
import OutfitStack from './components/OutfitStack';
import BackgroundPanel from './components/BackgroundPanel';
import { generateVirtualTryOnImage, generatePoseVariation } from './services/geminiService';
import { OutfitLayer, WardrobeItem } from './types';
import { defaultWardrobe } from './wardrobe';
import Footer from './components/Footer';
import Spinner from './components/Spinner';

const POSES = [
  "Corpo inteiro frontal: Postura neutra.",
  "Plano Americano: Foco cintura para cima.",
  "Walking Shot: Caminhando para a câmera.",
  "Sentado: Editorial relaxado.",
  "Perfil: Destaque lateral."
];

const App: React.FC = () => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<OutfitLayer[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [poseIdx, setPoseIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const displayUrl = useMemo(() => {
    if (history.length === 0) return modelUrl;
    const layer = history[index];
    return layer?.poseImages[POSES[poseIdx]] || Object.values(layer?.poseImages || {})[0] || modelUrl;
  }, [history, index, poseIdx, modelUrl]);

  const onModelReady = (url: string) => {
    setModelUrl(url);
    setHistory([{ garment: null, poseImages: { [POSES[0]]: url } }]);
    setIndex(0);
  };

  const onGarment = async (file: File, info: WardrobeItem) => {
    if (!displayUrl || loading) return false;
    setLoading(true); setMsg("Vestindo...");
    try {
      const res = await generateVirtualTryOnImage(displayUrl, file);
      setHistory(prev => [...prev.slice(0, index + 1), { garment: info, poseImages: { [POSES[poseIdx]]: res } }]);
      setIndex(prev => prev + 1);
      return true;
    } catch (e) { console.error(e); return false; } 
    finally { setLoading(false); }
  };

  const onPose = async (pIdx: number) => {
    if (loading || history.length === 0) return;
    const key = POSES[pIdx];
    const layer = history[index];
    if (layer.poseImages[key]) { setPoseIdx(pIdx); return; }
    
    setLoading(true); setMsg("Mudando pose...");
    try {
      // Fix: explicitly cast 'base' to string to fix line 69 type error where Object.values returns unknown[] in some environments
      const base = Object.values(layer.poseImages)[0] as string;
      const res = await generatePoseVariation(base, key);
      setHistory(prev => {
        const next = [...prev];
        if (next[index]) next[index].poseImages[key] = res;
        return next;
      });
      setPoseIdx(pIdx);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {!modelUrl ? (
          <StartScreen onModelFinalized={onModelReady} />
        ) : (
          <div className="flex flex-col md:flex-row flex-grow h-screen">
            <main className="flex-grow bg-white flex items-center justify-center relative h-[60vh] md:h-full z-10">
              <Canvas 
                displayImageUrl={displayUrl} 
                onStartOver={() => setModelUrl(null)} 
                isLoading={loading}
                onSelectPose={onPose}
                poseInstructions={POSES}
                currentPoseIndex={poseIdx}
              />
            </main>
            <aside className={`absolute md:relative bottom-0 w-full md:w-1/3 bg-white border-t border-gray-200 z-40 transition-transform duration-500 ${collapsed ? 'translate-y-[calc(100%-3rem)]' : 'translate-y-0'} md:translate-y-0 max-h-[75vh] md:max-h-full flex flex-col shadow-2xl`}>
              <button onClick={() => setCollapsed(!collapsed)} className="md:hidden h-12 flex items-center justify-center bg-gray-50">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </button>
              <div className="p-4 overflow-y-auto pb-32 space-y-6">
                <OutfitStack outfitHistory={history.slice(0, index + 1)} onRemoveLastGarment={() => setIndex(i => i - 1)} onAddGarment={() => setCollapsed(false)} isLoading={loading} onUpdateLayerColor={() => {}} />
                <WardrobePanel onGarmentSelect={onGarment} activeGarmentIds={[]} isLoading={loading} wardrobe={defaultWardrobe} />
                <BackgroundPanel onBackgroundSelect={() => {}} isLoading={loading} />
              </div>
            </aside>
          </div>
        )}
      </AnimatePresence>
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
          <Spinner />
          <p className="mt-6 font-serif text-gray-900 text-xl">{msg}</p>
        </div>
      )}
      <Footer isOnDressingScreen={!!modelUrl} />
    </div>
  );
};

export default App;
