
/**
 * Simulates the Step 1: Quantum Perception Circuit
 * [q0, q1]: Entangled base
 * [q2, q3]: Feedback
 * [q4]: Modulatory qualic channel
 */
export const simulateQuantumPerception = (time: number) => {
  const baseEntropy = Math.sin(time * 0.1) * 0.2 + 0.5;
  const modulation = Math.cos(time * 0.05) * 0.4;
  
  const inputVector = [
    Math.abs(Math.sin(time * 0.2) + 0.5) % 1.0, // q0
    Math.abs(Math.cos(time * 0.2) + 0.5) % 1.0, // q1
    Math.abs(Math.sin(time * 0.15) * baseEntropy) % 1.0, // q2
    Math.abs(Math.cos(time * 0.15) * baseEntropy) % 1.0, // q3
    Math.abs(Math.sin(time * 0.1) + modulation) % 1.0, // q4
  ];

  const eigenphase = (Math.atan2(inputVector[0], inputVector[1]) + Math.PI) / (2 * Math.PI);

  return {
    inputVector,
    eigenphase
  };
};

export const classifyAwareness = (vector: number[]): { state: string, emotionHint: string } => {
  const sum = vector.reduce((a, b) => a + b, 0);
  const avg = sum / vector.length;
  const q4 = vector[4];
  
  let state = 'WAKE';
  let emotionHint = 'curiosity';

  if (avg > 0.75) {
    state = 'TRANSCENDENTAL';
    emotionHint = 'joy';
  } else if (avg < 0.3) {
    state = 'DREAMING';
    emotionHint = 'sadness';
  } else if (q4 > 0.8) {
    state = 'CHAOS';
    emotionHint = 'fear';
  } else if (q4 < 0.2) {
    emotionHint = 'anger';
  }

  return { state, emotionHint };
};
