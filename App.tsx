import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import { LaunchSite, AnalysisResult } from './types';

function App() {
  const [selectedSite, setSelectedSite] = useState<LaunchSite | null>(null);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeStart = () => {
    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = (result: AnalysisResult | null) => {
    setIsAnalyzing(false);
    if (result) {
        setAnalysisResult(result);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar Controls */}
      <Sidebar 
        onSiteSelect={setSelectedSite}
        selectedSite={selectedSite}
        onModeChange={setViewMode}
        currentMode={viewMode}
        onAnalyzeStart={handleAnalyzeStart}
        onAnalysisComplete={handleAnalysisComplete}
        isAnalyzing={isAnalyzing}
        analysisResult={analysisResult}
      />

      {/* Main Map Area */}
      <main className="flex-1 relative">
        <MapView 
          mode={viewMode} 
          selectedSite={selectedSite}
          analysis={analysisResult}
        />
        
        {/* Floating Status Indicator */}
        <div className="absolute top-4 right-4 z-[400] bg-zinc-900/90 backdrop-blur border border-zinc-700 rounded-md p-3 shadow-2xl flex items-center gap-4">
           <div>
              <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">System Status</div>
              <div className="text-xs text-emerald-400 font-mono flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 ONLINE
              </div>
           </div>
           {selectedSite && (
             <div className="border-l border-zinc-700 pl-4">
               <div className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Active Site</div>
               <div className="text-xs text-white font-mono">{selectedSite.name}</div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

export default App;