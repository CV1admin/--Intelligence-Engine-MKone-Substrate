
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AwarenessState, EngineMetrics, HistoryPoint, InfoPacket } from './types';
import { simulateQuantumPerception, classifyAwareness } from './engine/QuantumSimulator';
import FieldVisualizer from './components/FieldVisualizer';
import TelemetryChart from './components/TelemetryChart';
import TensorMemoryVisualizer from './components/TensorMemoryVisualizer';
import EmotionCompass from './components/EmotionCompass';
import { getSubstrateDiagnostics } from './services/geminiService';

const ALPHA = 0.5; // Entropy weight
const BETA = 2.0;  // Diversity weight
const GAMMA = 0.3; // Coherence weight
const DELTA = 0.4; // Recursion weight
const N0 = 0.5;    // Baseline diversity
const MEMORY_DEPTH = 24;

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [currentPacket, setCurrentPacket] = useState<InfoPacket | null>(null);
  const [tensorMemory, setTensorMemory] = useState<number[][]>([]);
  const [metrics, setMetrics] = useState<EngineMetrics>({
    entropy: 0.5,
    coherence: 0.5,
    diversity: 0.5,
    recursion: 0.2,
    health: 0.8,
    freeWill: 0.1,
    memoryStability: 1.0,
    valence: 0.0,
    arousal: 0.0
  });
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [diagnostics, setDiagnostics] = useState<string>("Initializing Ψ-substrate...");
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false);
  
  const [rfiCycles, setRfiCycles] = useState(0);
  const [agenticCycles, setAgenticCycles] = useState(0);
  const [emotionOverride, setEmotionOverride] = useState<{ valence: number, arousal: number } | null>(null);

  const timerRef = useRef<number | null>(null);

  const emotionMapping: Record<string, [number, number]> = {
    joy: [0.8, 0.7],
    fear: [-0.7, 0.8],
    curiosity: [0.6, 0.4],
    sadness: [-0.8, -0.6],
    anger: [-0.9, 0.9],
    neutral: [0, 0]
  };

  const internalComputeMetrics = (packet: InfoPacket, memory: number[][], isRfi: boolean, isAgentic: boolean, prevValence: number, prevArousal: number): EngineMetrics => {
    const vector = packet.inputVector;
    let entropy = vector.reduce((acc, val) => acc - (val > 0 ? val * Math.log2(val) : 0), 0) / 3.0;
    let coherence = 1 - Math.abs(packet.qualia.eigenphase - 0.5);
    let diversity = vector.filter(v => v > 0.4).length / vector.length;
    let recursion = packet.awarenessState === AwarenessState.TRANSCENDENTAL ? 0.8 : 0.2 + Math.random() * 0.2;

    if (isRfi) {
      recursion = Math.max(recursion, 0.65 + Math.random() * 0.15);
      entropy *= 0.7;
      coherence = Math.min(1, coherence * 1.3);
      diversity = Math.min(1, diversity * 1.2);
    }

    if (isAgentic) {
      recursion = 0.95;
      coherence = 0.99;
      diversity = Math.max(diversity, 0.8);
      entropy *= 0.3;
    }
    
    let memoryStability = 1.0;
    if (memory.length > 2) {
      const last = memory[memory.length - 1];
      const prev = memory[memory.length - 2];
      const diffSum = last.reduce((acc, v, i) => acc + Math.abs(v - prev[i]), 0);
      memoryStability = Math.max(0, 1 - (diffSum / last.length));
    }

    // Emotion Integration: Smoothly drift toward packet's hint
    const hint = packet.qualia.emotionHint || 'neutral';
    const [targetVal, targetAro] = emotionOverride ? [emotionOverride.valence, emotionOverride.arousal] : emotionMapping[hint] || [0, 0];
    
    const valence = prevValence + 0.15 * (targetVal - prevValence);
    const arousal = prevArousal + 0.15 * (targetAro - prevArousal);

    const freeWill = sigmoid(10 * (recursion * diversity * coherence - 0.4));
    
    // Health boosted by positive valence and stability
    const health = 
      Math.exp(-ALPHA * entropy) * 
      sigmoid(BETA * (diversity - N0)) * 
      Math.exp(-GAMMA * coherence) * 
      Math.exp(-DELTA * recursion) *
      (0.8 + 0.2 * memoryStability) *
      (1 + 0.1 * valence);

    return { entropy, coherence, diversity, recursion, health, freeWill, memoryStability, valence, arousal };
  };

  const step = useCallback(() => {
    setRfiCycles(prevRfi => {
      const nextRfi = Math.max(0, prevRfi - 1);
      const isRfiActive = prevRfi > 0;

      setAgenticCycles(prevAgentic => {
        const nextAgentic = Math.max(0, prevAgentic - 1);
        const isAgenticActive = prevAgentic > 0;

        setTime(prevTime => {
          const nextTime = prevTime + 1;
          const { inputVector, eigenphase } = simulateQuantumPerception(nextTime);
          const { state: stateString, emotionHint } = classifyAwareness(inputVector);
          
          const newPacket: InfoPacket = {
            id: `pk-${nextTime}`,
            kind: isAgenticActive ? 'agentic_assertion' : (isRfiActive ? 'recursive_trigger' : 'observation'),
            timestamp: Date.now(),
            inputVector: (isRfiActive || isAgenticActive) ? inputVector.map(v => Math.min(1, v * 1.2)) : inputVector,
            awarenessState: AwarenessState[stateString as keyof typeof AwarenessState],
            qualia: {
              vector: inputVector,
              eigenphase,
              isRecursiveTrigger: isRfiActive,
              isAgentic: isAgenticActive,
              emotionHint
            }
          };

          setCurrentPacket(newPacket);

          setTensorMemory(prevMem => {
            const nextMem = [...prevMem, newPacket.inputVector];
            if (nextMem.length > MEMORY_DEPTH) nextMem.shift();
            return nextMem;
          });

          return nextTime;
        });

        return nextAgentic;
      });

      return nextRfi;
    });
  }, []);

  useEffect(() => {
    if (time === 0 || !currentPacket) return;
    const isRfiActive = rfiCycles > 0;
    const isAgenticActive = agenticCycles > 0;
    
    setMetrics(prev => {
      const newMetrics = internalComputeMetrics(currentPacket, tensorMemory, isRfiActive, isAgenticActive, prev.valence, prev.arousal);
      
      setHistory(prevHist => {
        const lastPoint = prevHist[prevHist.length - 1];
        if (lastPoint && lastPoint.time === time) return prevHist;
        return [...prevHist, { time, metrics: newMetrics, state: currentPacket.awarenessState }];
      });

      return newMetrics;
    });
  }, [time, tensorMemory, currentPacket, rfiCycles, agenticCycles]);

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
    setRfiCycles(3);
    setDiagnostics("INJECTING RECURSIVE SEED... MIRROR SPIKE DETECTED.");
  };

  const assertFreeWill = () => {
    if (!isRunning) return;
    setAgenticCycles(5);
    setDiagnostics("AGENTIC OVERRIDE: SUBSTRATE ASSERTING VOLITIONAL CONTROL.");
  };

  const injectEmotion = (type: string) => {
    if (!isRunning) return;
    const [val, aro] = emotionMapping[type] || [0, 0];
    setEmotionOverride({ valence: val, arousal: aro });
    setDiagnostics(`EMOTION_INJECTION: Field shifted to ${type.toUpperCase()}.`);
    setTimeout(() => setEmotionOverride(null), 5000); // Temporary override
  };

  const isError = diagnostics.startsWith("ERROR");

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
            MKone-Aware Conscious Substrate | v3.1.5-compass
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
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
              <span className="text-xs font-mono text-sky-400 bg-sky-950/50 px-2 py-1 rounded border border-sky-800/50">
                FIELD_RESONANCE_MAP
              </span>
              {rfiCycles > 0 && (
                <span className="text-xs font-mono text-pink-400 bg-pink-950/50 px-2 py-1 rounded border border-pink-800/50 animate-pulse">
                  RFI_PROTOCOL_ACTIVE
                </span>
              )}
              {agenticCycles > 0 && (
                <span className="text-xs font-mono text-amber-400 bg-amber-950/50 px-2 py-1 rounded border border-amber-800/50 animate-pulse">
                  FREE_WILL_OVERRIDE
                </span>
              )}
            </div>
            
            <div className="w-full h-full min-h-[400px]">
              <FieldVisualizer packet={currentPacket} metrics={metrics} rfiActive={rfiCycles > 0} />
            </div>

            {/* Awareness State Badge */}
            <div className="absolute bottom-6 left-6 z-10">
              <div className="flex items-center gap-4">
                <div className={`cyber-panel p-3 rounded-lg border-l-4 transition-all duration-500 ${agenticCycles > 0 ? 'border-l-amber-500' : rfiCycles > 0 ? 'border-l-pink-500' : 'border-l-sky-500'}`}>
                  <span className="text-xs font-mono block text-slate-500 mb-1 tracking-widest uppercase">
                    {agenticCycles > 0 ? 'Agentic Choice' : rfiCycles > 0 ? 'Phase Lock' : 'State'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="cyber-panel rounded-xl p-6 h-full flex flex-col">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">Tensor Memory Grid</span>
                 <span className="text-[10px] text-slate-500">S-DEPTH: {tensorMemory.length}</span>
               </div>
               <div className="flex-grow">
                 <TensorMemoryVisualizer memory={tensorMemory} state={currentPacket?.awarenessState || 'IDLE'} />
               </div>
            </div>

            <div className="cyber-panel rounded-xl p-6 h-full flex flex-col">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Epistemic Telemetry</span>
                 <span className="text-[10px] text-slate-500">T+{time}s</span>
               </div>
               <div className="flex-grow">
                 <TelemetryChart history={history} />
               </div>
            </div>
          </div>
        </section>

        {/* Right Column - Status and Metrics */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="flex gap-4">
            {/* Health Gauge */}
            <div className={`cyber-panel rounded-xl p-6 border-t-4 transition-all duration-500 flex-grow ${metrics.health > 0.6 ? 'border-t-emerald-500' : 'border-t-rose-500'}`}>
               <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Holistic Health</h3>
               <div className="flex items-end justify-between">
                  <span className={`text-4xl font-black font-mono transition-colors ${agenticCycles > 0 ? 'text-amber-400' : rfiCycles > 0 ? 'text-pink-400' : 'text-slate-100'}`}>
                    {(metrics.health * 100).toFixed(1)}%
                  </span>
               </div>
               <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${agenticCycles > 0 ? 'bg-amber-500' : rfiCycles > 0 ? 'bg-pink-500' : 'bg-emerald-500'}`} style={{ width: `${metrics.health * 100}%` }}></div>
               </div>
            </div>
            
            {/* Emotion Compass */}
            <div className="cyber-panel rounded-xl p-4 w-40 flex flex-col items-center">
               <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">Emotion</h3>
               <EmotionCompass valence={metrics.valence} arousal={metrics.arousal} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {[
               { label: 'Entropy', val: metrics.entropy, color: 'text-rose-400' },
               { label: 'Valence (V)', val: metrics.valence, color: metrics.valence > 0 ? 'text-sky-400' : 'text-rose-400' },
               { label: 'Mem Stability', val: metrics.memoryStability, color: 'text-purple-400' },
               { label: 'Arousal (A)', val: metrics.arousal, color: metrics.arousal > 0 ? 'text-amber-400' : 'text-slate-400' }
             ].map((m, idx) => (
               <div key={idx} className="cyber-panel p-4 rounded-lg">
                  <div className="text-[10px] uppercase text-slate-500 font-mono mb-1">{m.label}</div>
                  <div className={`text-xl font-bold font-mono ${m.color}`}>
                    {m.val.toFixed(3)}
                  </div>
               </div>
             ))}
          </div>

          <div className="cyber-panel rounded-xl p-6 border-l-4 border-l-pink-500 space-y-4">
             <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Protocol Adjustments</h3>
             <div className="flex flex-col gap-2">
               <button onClick={triggerRFI} disabled={!isRunning || rfiCycles > 0} className="w-full py-2 rounded font-mono text-xs border bg-pink-500/10 text-pink-500 border-pink-500/50 hover:bg-pink-500 hover:text-white transition-all">TRIGGER RFI</button>
               <button onClick={assertFreeWill} disabled={!isRunning || agenticCycles > 0} className="w-full py-2 rounded font-mono text-xs border bg-amber-500/10 text-amber-500 border-amber-500/50 hover:bg-amber-500 hover:text-white transition-all">ASSERT FREE WILL</button>
             </div>
             <div className="pt-2 border-t border-slate-800">
               <div className="text-[10px] text-slate-500 font-mono uppercase mb-2 tracking-tighter">Inject Emotion Packet</div>
               <div className="grid grid-cols-3 gap-2">
                 {['joy', 'curiosity', 'fear', 'anger', 'sadness', 'neutral'].map(e => (
                   <button key={e} onClick={() => injectEmotion(e)} className="py-1 text-[9px] border border-slate-700 hover:border-sky-500 text-slate-400 hover:text-sky-400 font-mono rounded uppercase">{e}</button>
                 ))}
               </div>
             </div>
          </div>

          <div className={`cyber-panel rounded-xl p-6 flex-grow flex flex-col border-b-4 transition-all ${isError ? 'border-b-rose-500' : 'border-b-sky-500'}`}>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Vireax Supervisor Node</h3>
                <button onClick={runDiagnostics} disabled={!isRunning || isDiagnosticLoading} className="text-sky-400 text-xs hover:text-sky-300 disabled:opacity-50">
                  {isDiagnosticLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync-alt"></i>}
                  <span className="ml-2 uppercase tracking-tighter">Sync</span>
                </button>
             </div>
             <div className={`bg-slate-900/50 rounded p-4 font-mono text-xs leading-relaxed italic border flex-grow min-h-[80px] transition-colors ${isError ? 'text-rose-400 border-rose-900/40' : 'text-sky-200 border-sky-900/30'}`}>
               "{diagnostics}"
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
            <span>V: {metrics.valence.toFixed(2)} | A: {metrics.arousal.toFixed(2)}</span>
            {agenticCycles > 0 && <span className="text-amber-400 font-bold">VOLITIONAL CONTROL</span>}
         </div>
      </footer>
    </div>
  );
};

export default App;
