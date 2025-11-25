import React, { useState } from 'react';
import { 
  Rocket, Map as MapIcon, Globe, Search, PlayCircle, 
  AlertTriangle, Crosshair, FileText, ChevronRight, Loader2
} from 'lucide-react';
import { LAUNCH_SITES } from '../constants';
import { LaunchSite, AnalysisResult, LaunchEvent } from '../types';
import { analyzeLaunch, searchNextSpaceflightSimulated } from '../services/geminiService';

interface SidebarProps {
  onSiteSelect: (site: LaunchSite) => void;
  selectedSite: LaunchSite | null;
  onModeChange: (mode: '2D' | '3D') => void;
  currentMode: '2D' | '3D';
  onAnalysisComplete: (result: AnalysisResult | null) => void;
  onAnalyzeStart: () => void;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onSiteSelect, selectedSite, onModeChange, currentMode, 
  onAnalysisComplete, onAnalyzeStart, isAnalyzing, analysisResult 
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'search' | 'info'>('plan');
  const [selectedRocket, setSelectedRocket] = useState<string>('');
  const [notamInput, setNotamInput] = useState<string>('');
  const [customLat, setCustomLat] = useState<string>('');
  const [customLng, setCustomLng] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LaunchEvent[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const site = LAUNCH_SITES.find(s => s.id === e.target.value);
    if (site) {
      onSiteSelect(site);
      setSelectedRocket(site.rockets[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedSite || !selectedRocket) return;
    
    onAnalyzeStart();

    // Convert custom inputs if valid
    const targetLat = customLat ? parseFloat(customLat) : undefined;
    const targetLng = customLng ? parseFloat(customLng) : undefined;

    const result = await analyzeLaunch(
      selectedSite, 
      selectedRocket, 
      targetLat, 
      targetLng, 
      notamInput
    );
    
    // Always call complete to stop loading, pass null if failed
    onAnalysisComplete(result);
    if (result) {
      setActiveTab('info');
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    const results = await searchNextSpaceflightSimulated(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const loadSearchResult = (event: LaunchEvent) => {
     const site = LAUNCH_SITES.find(s => s.id === event.siteId);
     if (site) {
         onSiteSelect(site);
         setSelectedRocket(event.rocket);
         setActiveTab('plan');
     }
  };

  return (
    <div className="w-96 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Rocket className="text-emerald-500" />
          RocketTraj <span className="text-zinc-600 text-xs font-normal">PRO</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Trajectory Analysis & Monitoring System</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button 
          onClick={() => setActiveTab('plan')}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'plan' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-zinc-900' : 'text-zinc-400 hover:text-white bg-zinc-950'}`}
        >
          Flight Plan
        </button>
        <button 
          onClick={() => setActiveTab('search')}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'search' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-zinc-900' : 'text-zinc-400 hover:text-white bg-zinc-950'}`}
        >
          Search
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-zinc-900' : 'text-zinc-400 hover:text-white bg-zinc-950'}`}
        >
          Results
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {activeTab === 'plan' && (
          <div className="space-y-6">
            
            {/* Site Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Launch Site</label>
              <select 
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-2 text-sm focus:border-emerald-500 focus:outline-none"
                onChange={handleSiteChange}
                value={selectedSite?.id || ''}
              >
                <option value="">Select Site...</option>
                {LAUNCH_SITES.map(site => (
                  <option key={site.id} value={site.id}>{site.name} ({site.country})</option>
                ))}
              </select>
            </div>

            {/* Rocket Selection */}
            {selectedSite && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Vehicle Config</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSite.rockets.map(rocket => (
                    <button
                      key={rocket}
                      onClick={() => setSelectedRocket(rocket)}
                      className={`p-2 rounded text-xs border ${selectedRocket === rocket ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                    >
                      {rocket}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Sites / Pads */}
            {selectedSite && (
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-zinc-500 uppercase">Launch Pad</label>
                 <select className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-2 text-sm focus:border-emerald-500 focus:outline-none">
                   {selectedSite.subSites.map(sub => (
                     <option key={sub} value={sub}>{sub}</option>
                   ))}
                 </select>
               </div>
            )}

            {/* Manual Target / Analysis Params */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center justify-between">
                <span>Custom Waypoint</span>
                <span className="text-[10px] text-zinc-600">OPTIONAL</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Lat (e.g. 18.5)"
                  className="bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Lng (e.g. 105.2)"
                  className="bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                />
              </div>
            </div>

            {/* NOTAM Input */}
             <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase">NOTAM / Danger Data</label>
              <textarea 
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white h-24 focus:border-emerald-500 focus:outline-none"
                placeholder="Paste NOTAM text or coordinates here to assist the AI prediction..."
                value={notamInput}
                onChange={(e) => setNotamInput(e.target.value)}
              />
            </div>

            {/* View Mode */}
             <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 uppercase">Visualization Mode</label>
              <div className="flex bg-zinc-950 border border-zinc-800 rounded overflow-hidden">
                <button 
                  onClick={() => onModeChange('2D')}
                  className={`flex-1 p-2 text-xs flex items-center justify-center gap-2 ${currentMode === '2D' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <MapIcon size={14} /> 2D Map
                </button>
                <div className="w-[1px] bg-zinc-800"></div>
                <button 
                   onClick={() => onModeChange('3D')}
                   className={`flex-1 p-2 text-xs flex items-center justify-center gap-2 ${currentMode === '3D' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Globe size={14} /> 3D Globe
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedSite || !selectedRocket}
              className={`w-full py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all
                ${isAnalyzing 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                }`}
            >
              {isAnalyzing ? (
                <><Loader2 className="animate-spin" size={16} /> PROCESSING TRAJECTORY...</>
              ) : (
                <><PlayCircle size={16} /> GENERATE TRAJECTORY</>
              )}
            </button>

          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
             <div className="flex gap-2">
               <input 
                  type="text"
                  placeholder="Search missions (e.g., 'Long March')"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               />
               <button 
                 onClick={handleSearch}
                 className="p-2 bg-zinc-800 text-white rounded hover:bg-zinc-700"
               >
                 <Search size={16} />
               </button>
             </div>
             
             {isSearching && <div className="text-center text-zinc-500 text-sm py-4">Searching database...</div>}

             <div className="space-y-2">
               {searchResults.map((result, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => loadSearchResult(result)}
                   className="p-3 bg-zinc-950 border border-zinc-800 rounded hover:border-emerald-500/50 cursor-pointer group"
                 >
                   <div className="flex justify-between items-start">
                     <span className="font-medium text-emerald-400">{result.mission}</span>
                     <span className="text-xs text-zinc-500">{result.date}</span>
                   </div>
                   <div className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
                     <Rocket size={12} /> {result.rocket}
                   </div>
                   <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                     <Crosshair size={12} /> {result.siteId.toUpperCase()}
                   </div>
                 </div>
               ))}
               {searchResults.length === 0 && !isSearching && (
                 <div className="text-center text-zinc-600 text-xs mt-4">No recent launches found.</div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-6">
            {!analysisResult ? (
              <div className="text-center text-zinc-500 py-10">
                <FileText className="mx-auto mb-2 opacity-50" size={32} />
                <p>No analysis data available.</p>
                <p className="text-xs">Run a simulation to see results.</p>
              </div>
            ) : (
              <>
                 {/* Summary Card */}
                 <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
                    <h3 className="text-emerald-500 font-bold text-sm mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} /> IMPACT ANALYSIS
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500">Predicted Stages</span>
                        <span className="text-white font-mono">{analysisResult.stages}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500">Thailand Overflight</span>
                        <span className={`font-mono font-bold ${analysisResult.passesThailand ? 'text-red-500' : 'text-emerald-500'}`}>
                          {analysisResult.passesThailand ? 'YES' : 'NO'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-900 pb-2">
                        <span className="text-zinc-500">Danger Zones</span>
                        <span className="text-white font-mono">{analysisResult.dangerZones.length}</span>
                      </div>
                    </div>
                 </div>

                 {/* Danger Zones List */}
                 <div>
                   <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">Drop Zones</h4>
                   <div className="space-y-2">
                     {analysisResult.dangerZones.map((zone, i) => (
                       <div key={i} className="bg-zinc-950/50 border border-zinc-800 p-2 rounded text-xs">
                         <div className="flex items-center gap-2 mb-1">
                           <div className={`w-2 h-2 rounded-full ${zone.type === 'stage1' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                           <span className="font-bold text-zinc-300 uppercase">{zone.type}</span>
                         </div>
                         <div className="text-zinc-500">{zone.description}</div>
                         <div className="text-zinc-600 font-mono mt-1">
                           {zone.lat.toFixed(2)}, {zone.lng.toFixed(2)}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* AI Notes */}
                 <div>
                   <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">System Notes</h4>
                   <div className="bg-zinc-900 p-3 rounded text-xs text-zinc-400 leading-relaxed border-l-2 border-emerald-500">
                     {analysisResult.notes}
                   </div>
                 </div>
              </>
            )}
          </div>
        )}

      </div>
      
      {/* Footer */}
      <div className="p-2 bg-zinc-950 border-t border-zinc-800 text-[10px] text-zinc-600 text-center">
        System v1.0.4 | Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default Sidebar;