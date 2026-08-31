import assert from 'node:assert/strict';
import test from 'node:test';

import {
  executeQuantumFeatureMap,
  simulateQuantumPerception,
} from '../engine/QuantumSimulator';

test('rejects unsupported qubit counts and invalid features', () => {
  assert.throws(() => executeQuantumFeatureMap([0.5]), /qubit_count_out_of_range/);
  assert.throws(() => executeQuantumFeatureMap(Array(9).fill(0.5)), /qubit_count_out_of_range/);
  assert.throws(() => executeQuantumFeatureMap([0.5, -0.1]), /feature_out_of_range/);
  assert.throws(() => executeQuantumFeatureMap([0.5, Number.NaN]), /feature_out_of_range/);
});

test('preserves state normalization for two through eight qubits', () => {
  for (let qubits = 2; qubits <= 8; qubits += 1) {
    const values = Array.from({ length: qubits }, (_, i) => (i + 1) / (qubits + 1));
    const result = executeQuantumFeatureMap(values);
    assert.ok(Math.abs(result.stateNorm - 1) < 1e-12);
    assert.ok(result.expectationZ0 >= -1 - 1e-12);
    assert.ok(result.expectationZ0 <= 1 + 1e-12);
    assert.ok(result.quantumFeatureProbability >= -1e-12);
    assert.ok(result.quantumFeatureProbability <= 1 + 1e-12);
  }
});

test('is deterministic and reports simulator-only authority boundary', () => {
  const input = [0.1, 0.3, 0.7, 0.9];
  const first = executeQuantumFeatureMap(input);
  const second = executeQuantumFeatureMap(input);
  assert.deepEqual(first, second);
  assert.equal(first.executionClass, 'simulator_quantum_classical_hybrid');
  assert.equal(first.backendId, 'typescript-statevector');
  assert.equal(first.qpuExecuted, false);
  assert.equal(first.quantumAdvantageClaimed, false);
});

test('balanced angle input gives zero Z0 expectation', () => {
  const result = executeQuantumFeatureMap([0.5, 0.5, 0.5]);
  assert.ok(Math.abs(result.expectationZ0) < 1e-12);
  assert.ok(Math.abs(result.quantumFeatureProbability - 0.5) < 1e-12);
});

test('dashboard compatibility path is derived from circuit execution', () => {
  const result = simulateQuantumPerception(12.5);
  assert.equal(result.inputVector.length, 5);
  assert.equal(result.eigenphase, result.quantumFeatureProbability);
  assert.ok(Math.abs(result.stateNorm - 1) < 1e-12);
});
