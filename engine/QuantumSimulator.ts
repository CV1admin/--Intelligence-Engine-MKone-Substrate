/**
 * MKONE Quantum-Classical Feature Layer v1.4
 *
 * Exact small statevector simulation. This is quantum-circuit simulation on a
 * classical CPU, not QPU execution and not evidence of quantum advantage.
 */

type Complex = { re: number; im: number };

export interface QuantumFeatureResult {
  inputVector: number[];
  eigenphase: number;
  executionClass: 'simulator_quantum_classical_hybrid';
  qpuExecuted: false;
  quantumAdvantageClaimed: false;
  backendId: 'typescript-statevector';
  circuitSchema: 'MKONE-FEATURE-MAP/1.0';
  qubits: number;
  depth: number;
  stateNorm: number;
  expectationZ0: number;
  quantumFeatureProbability: number;
}

const add = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
const scale = (a: Complex, x: number): Complex => ({ re: a.re * x, im: a.im * x });
const abs2 = (a: Complex): number => a.re * a.re + a.im * a.im;

const applyRealSingleQubit = (
  state: Complex[],
  gate: [[number, number], [number, number]],
  qubit: number,
): void => {
  const stride = 1 << qubit;
  for (let base = 0; base < state.length; base += stride << 1) {
    for (let offset = 0; offset < stride; offset += 1) {
      const zero = base + offset;
      const one = zero + stride;
      const a = state[zero];
      const b = state[one];
      state[zero] = add(scale(a, gate[0][0]), scale(b, gate[0][1]));
      state[one] = add(scale(a, gate[1][0]), scale(b, gate[1][1]));
    }
  }
};

const applyCnot = (state: Complex[], control: number, target: number): void => {
  for (let index = 0; index < state.length; index += 1) {
    const controlOn = ((index >> control) & 1) === 1;
    const targetOff = ((index >> target) & 1) === 0;
    if (controlOn && targetOff) {
      const partner = index | (1 << target);
      [state[index], state[partner]] = [state[partner], state[index]];
    }
  }
};

export const executeQuantumFeatureMap = (values: number[]): Omit<QuantumFeatureResult, 'inputVector' | 'eigenphase'> => {
  if (values.length < 2 || values.length > 8) throw new Error('qubit_count_out_of_range');
  if (values.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
    throw new Error('feature_out_of_range');
  }

  const qubits = values.length;
  const state: Complex[] = Array.from({ length: 1 << qubits }, () => ({ re: 0, im: 0 }));
  state[0] = { re: 1, im: 0 };
  const invSqrt2 = 1 / Math.sqrt(2);
  const h: [[number, number], [number, number]] = [[invSqrt2, invSqrt2], [invSqrt2, -invSqrt2]];

  for (let q = 0; q < qubits; q += 1) applyRealSingleQubit(state, h, q);
  values.forEach((value, q) => {
    const theta = Math.PI * (2 * value - 1);
    const c = Math.cos(theta / 2);
    const s = Math.sin(theta / 2);
    applyRealSingleQubit(state, [[c, -s], [s, c]], q);
  });
  for (let q = 0; q < qubits - 1; q += 1) applyCnot(state, q, q + 1);

  const probabilities = state.map(abs2);
  const stateNorm = probabilities.reduce((sum, probability) => sum + probability, 0);
  const expectationZ0 = probabilities.reduce(
    (sum, probability, index) => sum + (((index & 1) === 0 ? 1 : -1) * probability),
    0,
  );

  return {
    executionClass: 'simulator_quantum_classical_hybrid',
    qpuExecuted: false,
    quantumAdvantageClaimed: false,
    backendId: 'typescript-statevector',
    circuitSchema: 'MKONE-FEATURE-MAP/1.0',
    qubits,
    depth: 3 * qubits - 1,
    stateNorm,
    expectationZ0,
    quantumFeatureProbability: (expectationZ0 + 1) / 2,
  };
};

/**
 * Backward-compatible perception entry point used by the existing dashboard.
 * The returned eigenphase is now derived from an executed quantum feature map.
 */
export const simulateQuantumPerception = (time: number): QuantumFeatureResult => {
  const baseEntropy = Math.sin(time * 0.1) * 0.2 + 0.5;
  const modulation = Math.cos(time * 0.05) * 0.4;
  const inputVector = [
    Math.abs(Math.sin(time * 0.2) + 0.5) % 1.0,
    Math.abs(Math.cos(time * 0.2) + 0.5) % 1.0,
    Math.abs(Math.sin(time * 0.15) * baseEntropy) % 1.0,
    Math.abs(Math.cos(time * 0.15) * baseEntropy) % 1.0,
    Math.abs(Math.sin(time * 0.1) + modulation) % 1.0,
  ];
  const execution = executeQuantumFeatureMap(inputVector);
  return { inputVector, eigenphase: execution.quantumFeatureProbability, ...execution };
};

export const classifyAwareness = (vector: number[]): { state: string; emotionHint: string } => {
  const avg = vector.reduce((a, b) => a + b, 0) / vector.length;
  const q4 = vector[4];
  if (avg > 0.75) return { state: 'TRANSCENDENTAL', emotionHint: 'joy' };
  if (avg < 0.3) return { state: 'DREAMING', emotionHint: 'sadness' };
  if (q4 > 0.8) return { state: 'CHAOS', emotionHint: 'fear' };
  return { state: 'WAKE', emotionHint: q4 < 0.2 ? 'anger' : 'curiosity' };
};
