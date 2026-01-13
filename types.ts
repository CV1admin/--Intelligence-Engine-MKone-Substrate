
export enum AwarenessState {
  DREAMING = 'DREAMING',
  WAKE = 'WAKE',
  TRANSCENDENTAL = 'TRANSCENDENTAL',
  CHAOS = 'CHAOS'
}

export interface InfoPacket {
  id: string;
  kind: 'observation' | 'self_model' | 'vireax_anchor' | 'recursive_trigger';
  timestamp: number;
  inputVector: number[];
  awarenessState: AwarenessState;
  qualia: {
    vector: number[];
    eigenphase: number;
    isRecursiveTrigger?: boolean;
  };
}

export interface EngineMetrics {
  entropy: number;
  coherence: number;
  diversity: number;
  recursion: number;
  health: number;
}

export interface HistoryPoint {
  time: number;
  metrics: EngineMetrics;
  state: AwarenessState;
}
