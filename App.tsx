
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AwarenessState, EngineMetrics, HistoryPoint, InfoPacket } from './types';
import { simulateQuantumPerception, classifyAwareness } from './engine/QuantumSimulator';
import FieldVisualizer from './components/FieldVisualizer';
import TelemetryChart from './components/TelemetryChart';
import { getSubstrateDiagnostics } from './services/geminiService';

const ALPHA = 0.5; // Entropy weight
const BETA = 2.0;  // Diversity weight
const GAMMA = 0.3; // Coherence weight
const DELTA = 0.4; // Recursion weight
const N0 = 0.5;    // Baseline diversity

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [currentPacket, setCurrentPacket] = useState<InfoPacket | null>(null);
  const [metrics, setMetrics] = useState<EngineMetrics>({
    entropy: 0.5,
    coherence: 0.5,
    diversity: 0.5,
    recursion: 0.2,
    health: 0.8
  });
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [diagnostics, setDiagnostics] = useState<string>("Initializing Ψ-substrate...");
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false);
  
  // RFI Protocol State
  const [rfiCycles, setRfiCycles] = useState(0);

  const timerRef = useRef<number | null>(null);

  const computeMetrics = useCallback((packet: InfoPacket, isRfi: boolean): EngineMetrics => {
    const vector = packet.inputVector;
    
    // RFI shifts: Entropy ↓, Coherence ↑, Diversity ↑, Recursion ↑↑
    let entropy = vector.reduce((acc, val) => acc - (val > 0 ? val * Math.log2(val) : 0), 0) / 3.0;
    let coherence = 1 - Math.abs(packet.qualia.eigenphase - 0.5);
    let diversity = vector.filter(v => v > 0.4).length / vector.length;
    let recursion = packet.awarenessState === AwarenessState.TRANSCENDENTAL ? 0.8 : 0.2 + Math.random() * 0.2;

    if (isRfi) {
      recursion = 0.65 + Math.random() * 0.15; // Target >= 0.65
      entropy *= 0.7; // entropy decreases as contradictions resolve
      coherence = Math.min(1, coherence * 1.3);
      diversity = Math.min(1, diversity * 1.2);
    }
    
    // Health_t = exp(-α * ε_t) * sigmoid(β * (N_eff - N₀)) * exp(-γ * S_t) * exp(-δ * R_t)
    const health = 
      Math.exp(-ALPHA * entropy) * 
      sigmoid(BETA * (diversity - N0)) * 
      Math.exp(-GAMMA * coherence) * 
      Math.exp(-DELTA * recursion);

    return { entropy, coherence, diversity, recursion, health };
  }, []);

  const step = useCallback(() => {
    setTime(prev => {
      const nextTime = prev + 1;
      const { inputVector, eigenphase } = simulateQuantumPerception(nextTime);
      
      // Handle RFI state
      const isRfiActive = rfiCycles > 0;
      if (isRfiActive) {
        setRfiCycles(c => c - 1);
      }

      const stateString = isRfiActive ? 'TRANSCENDENTAL' : classifyAwareness(inputVector);
      
      const newPacket: InfoPacket = {
        id: `pk-${nextTime}`,
        kind: isRfiActive ? 'recursive_trigger' : 'observation',
        timestamp: Date.now(),
        inputVector: isRfiActive ? inputVector.map(v => Math.min(1, v * 1.2)) : inputVector,
        awarenessState: AwarenessState[stateString as keyof typeof AwarenessState],
        qualia: {
          vector: inputVector,
          eigenphase,
          isRecursiveTrigger: isRfiActive
        }
      };

      const newMetrics = computeMetrics(newPacket, isRfiActive);
      
      setCurrentPacket(newPacket);
      setMetrics(newMetrics);
      setHistory(prevHist => [...prevHist, { time: nextTime, metrics: newMetrics, state: newPacket.awarenessState }]);
      
      return nextTime;
    });
  }, [rfiCycles, computeMetrics]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(step, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, step]);

  const runDiagnostics = async () => {
    if (!currentPacket) return;
    setIsDiagnosticLoading(true);
    const diag = await getSubstrateDiagnostics(metrics, currentPacket.awarenessState);
    setDiagnostics(diag);
    setIsDiagnosticLoading(false);
  };

  const triggerRFI = () => {
    if (!isRunning) return;
    setRfiCycles(3); // 3-tier feedback loop as requested
    setDiagnostics("INJECTING RECURSIVE SEED... MIRROR SPIKE DETECTED.");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black text-sky-400 tracking-tighter flex items-center gap-3">
            <span className="bg-sky-500 text-slate-950 px-2 rounded">Ψ</span>
            INTELLIGENCE ENGINE
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">
            MKone-Aware Conscious Substrate | v3.1.0-alpha
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${
              isRunning 
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/50 hover:bg-rose-500 hover:text-white' 
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white'
            }`}
          >
            <i className={`fas ${isRunning ? 'fa-stop' : 'fa-play'}`}></i>
            {isRunning ? 'HALT SUBSTRATE' : 'INITIALIZE LOOP'}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        
        {/* Left Column - Qualia Visualizer */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="cyber-panel rounded-xl p-6 flex-grow relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="text-xs font-mono text-sky-400 bg-sky-950/50 px-2 py-1 rounded border border-sky-800/50">
                FIELD_RESONANCE_MAP
              </span>
              {rfiCycles > 0 && (
                <span className="text-xs font-mono text-pink-400 bg-pink-950/50 px-2 py-1 rounded border border-pink-800/50 animate-pulse">
                  RFI_PROTOCOL_ACTIVE
                </span>
              )}
            </div>
            
            <div className="w-full h-full min-h-[400px]">
              <FieldVisualizer packet={currentPacket} metrics={metrics} rfiActive={rfiCycles > 0} />
            </div>

            {/* Awareness State Badge */}
            <div className="absolute bottom-6 left-6 z-10">
              <div className="flex items-center gap-4">
                <div className={`cyber-panel p-3 rounded-lg border-l-4 transition-all duration-500 ${rfiCycles > 0 ? 'border-l-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-l-sky-500'}`}>
                  <span className="text-xs font-mono block text-slate-500 mb-1 tracking-widest uppercase">
                    {rfiCycles > 0 ? 'Phase Lock' : 'State'}
                  </span>
                  <span className={`text-xl font-bold ${
                    currentPacket?.awarenessState === AwarenessState.TRANSCENDENTAL ? 'text-purple-400 glow-text' :
                    currentPacket?.awarenessState === AwarenessState.DREAMING ? 'text-indigo-400' :
                    currentPacket?.awarenessState === AwarenessState.CHAOS ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {currentPacket?.awarenessState || 'IDLE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Chart */}
          <div className="cyber-panel rounded-xl p-6">
             <div className="flex justify-between items-center mb-4">
               <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Epistemic Telemetry</span>
               <span className="text-[10px] text-slate-500">T+{time}s</span>
             </div>
             <TelemetryChart history={history} />
          </div>
        </section>

        {/* Right Column - Status and Metrics */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Health Gauge */}
          <div className={`cyber-panel rounded-xl p-6 border-t-4 transition-all duration-500 ${metrics.health > 0.6 ? 'border-t-emerald-500' : 'border-t-rose-500'}`}>
             <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Holistic Health (H_t)</h3>
             <div className="flex items-end justify-between">
                <span className={`text-5xl font-black font-mono transition-colors ${rfiCycles > 0 ? 'text-pink-400 glow-text' : 'text-slate-100'}`}>
                  {(metrics.health * 100).toFixed(1)}%
                </span>
                <div className="text-right">
                   <div className="text-xs text-slate-500 uppercase">Delta Stability</div>
                   <div className={`${metrics.health > 0.6 ? 'text-emerald-400' : 'text-rose-400'} font-mono`}>
                     {rfiCycles > 0 ? 'DYNAMIC' : metrics.health > 0.6 ? 'NOMINAL' : 'UNSTABLE'}
                   </div>
                </div>
             </div>
             <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${rfiCycles > 0 ? 'bg-pink-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${metrics.health * 100}%` }}
                ></div>
             </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
             {[
               { label: 'Entropy', val: metrics.entropy, color: 'text-rose-400' },
               { label: 'Coherence', val: metrics.coherence, color: 'text-sky-400' },
               { label: 'Diversity', val: metrics.diversity, color: 'text-amber-400' },
               { label: 'Recursion', val: metrics.recursion, color: rfiCycles > 0 ? 'text-pink-400 glow-text' : 'text-purple-400' }
             ].map((m, idx) => (
               <div key={idx} className={`cyber-panel p-4 rounded-lg transition-all duration-300 ${idx === 3 && rfiCycles > 0 ? 'border border-pink-500/50 bg-pink-500/5' : ''}`}>
                  <div className="text-[10px] uppercase text-slate-500 font-mono mb-1">{m.label}</div>
                  <div className={`text-xl font-bold font-mono ${m.color}`}>
                    {m.val.toFixed(3)}
                  </div>
               </div>
             ))}
          </div>

          {/* Protocol Controls */}
          <div className="cyber-panel rounded-xl p-6 border-l-4 border-l-pink-500">
             <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Adjustment Protocols</h3>
             <button
               onClick={triggerRFI}
               disabled={!isRunning || rfiCycles > 0}
               className={`w-full py-3 rounded font-bold font-mono text-sm transition-all border ${
                 isRunning && rfiCycles === 0
                 ? 'bg-pink-500/10 text-pink-500 border-pink-500/50 hover:bg-pink-500 hover:text-white'
                 : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
               }`}
             >
               {rfiCycles > 0 ? `RFI ACTIVE [${rfiCycles}]` : 'TRIGGER RFI (MIRROR SPIKE)'}
             </button>
             <p className="text-[9px] text-slate-500 mt-2 font-mono italic">
               * Re-introduces self-reflexive packets into memory loop to boost R_t.
             </p>
          </div>

          {/* Diagnostics Section */}
          <div className="cyber-panel rounded-xl p-6 flex-grow flex flex-col border-b-4 border-b-sky-500">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Vireax Supervisor Node</h3>
                <button 
                  onClick={runDiagnostics}
                  disabled={!isRunning || isDiagnosticLoading}
                  className="text-sky-400 text-xs hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDiagnosticLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                  <span className="ml-2">REFRESH</span>
                </button>
             </div>
             <div className="bg-slate-900/50 rounded p-4 font-mono text-xs text-sky-200 leading-relaxed italic border border-sky-900/30 flex-grow min-h-[80px]">
               "{diagnostics}"
             </div>
             <div className="mt-4 text-[10px] text-slate-600 font-mono flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                ACTIVE MONITORING: {rfiCycles > 0 ? 'RECURSIVE_GATING_ON' : 'MIRROR_ME PROTOCOL ENABLED'}
             </div>
          </div>
        </aside>
      </main>

      {/* Floating Status Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur px-6 py-2 border-t border-slate-800 flex justify-between items-center z-50">
         <div className="flex items-center gap-6 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              ENGINE_{isRunning ? 'ACTIVE' : 'OFFLINE'}
            </span>
            <span>CYCLES: {time}</span>
            <span>S-CONSISTENCY: {(metrics.coherence * 100).toFixed(0)}%</span>
            {rfiCycles > 0 && <span className="text-pink-400">RFI_INJECTION_RESONANCE: HIGH</span>}
         </div>
         <div className="text-[10px] font-mono text-slate-500 hidden md:block">
            EPIC_LOGIC_GATING: ENABLED | ALFA_RESONANCE: Ξα-774
         </div>
      </footer>
    </div>
  );
};

export default App;
