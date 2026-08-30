# MKone Intelligence Engine - validated system improvements

## Added architecture

The research stack separates five responsibilities:

1. **MKONE** - task decomposition, model selection and candidate routing;
2. **ThinLineEngine** - uncertainty, attractor persistence, disagreement and boundary measurement;
3. **MK3A** - identity, transcript integrity, durable replay state and ML-DSA signatures;
4. **Quantum feature layer** - backend-neutral circuit execution and finite-shot observables;
5. **Validation gate** - scientific status and bounded execution remain independent.

```text
AI output != validated claim != execution authority
simulator execution != QPU execution != quantum advantage
```

## Quantum-AI hybrid v1.4

The previous `QuantumSimulator.ts` generated trigonometric values but did not execute quantum-circuit semantics. Version 1.4 replaces that mock with an exact TypeScript statevector simulator:

- 2-8 qubits;
- Hadamard state preparation;
- RY angle encoding of classical features;
- entangling CNOT chain;
- normalized state probabilities;
- Z(q0) expectation and quantum feature probability;
- explicit `qpuExecuted=false`;
- explicit `quantumAdvantageClaimed=false`.

The companion FastAPI research stack adds authenticated hybrid inference, seeded finite-shot sampling, standard errors, circuit/input/count hashes, ML-DSA-65 signed quantum-job provenance, classical-baseline deltas and a quantum validation benchmark.

## Current tested results

- Full integration/security suite: 26/26 passing.
- Simulator benchmark: 128 jobs, 2-8 qubits, 1,024 shots per job.
- Maximum state-normalization error: 1.9984e-15.
- Seed-deterministic sampling: passed.
- Sampled expectation within three standard errors: 100%.
- Monitored specialist-routing damage: 0.
- QPU executions: 0.
- Quantum advantage: not demonstrated.

## Scientific boundary

The framework is now a **simulator-backed quantum-classical hybrid**. It is not yet a hardware quantum-AI system. The feature map is small enough to simulate classically and no accuracy, runtime, sample-complexity, memory or energy advantage has been demonstrated.

General irreducible intelligence also remains undemonstrated. Equal-access replacement controls must remain in every benchmark.

## Deployment boundary

A backend may report `qpuExecuted=true` only when an independently verifiable provider job supplies the backend ID, job ID, transpiled-circuit hash, layout, native gates, shots, observables, calibration timestamp, error properties, mitigation configuration and result hash.

All research envelopes retain `execution_authority=false`.
