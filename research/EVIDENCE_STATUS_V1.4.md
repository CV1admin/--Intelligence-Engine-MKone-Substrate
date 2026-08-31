# Quantum-AI v1.4 Repository Evidence Status

## Executable truth in this repository

The repository contains an exact, small TypeScript statevector simulator implementing:

- 2-8 qubits;
- Hadamard gates on all qubits;
- RY angle encoding;
- nearest-neighbour CNOT chain;
- state normalization;
- Z expectation on qubit zero;
- explicit `qpuExecuted=false`;
- explicit `quantumAdvantageClaimed=false`.

The accompanying tests check invalid inputs, normalization, observable bounds, determinism, a known balanced-input result, and the dashboard compatibility path.

## Documented but not implemented here

The following v1.4 claims refer to a companion research stack that is not present in this repository:

- FastAPI authenticated hybrid inference;
- seeded finite-shot counts and standard errors;
- circuit/input/count provenance hashes;
- ML-DSA-65 signatures;
- 26 integration and security tests;
- the reported 128-job benchmark.

These claims are therefore **UNAVAILABLE FOR REPOSITORY REPRODUCTION** here. They must not be reported as verified by this repository until their implementation, dependencies, tests, and evidence are committed or linked to an immutable source revision.

## Not established

- physical QPU execution;
- predictive improvement caused by the quantum feature;
- quantum computational, sample, memory, or energy advantage;
- general or irreducible intelligence.

## Hardware gate

The QPU acceptance contract remains a specification only. No adapter may emit `qpuExecuted=true` without independently verifiable provider job identity, transpilation data, backend calibration context, execution timestamps, shots, observable and result hashes.
