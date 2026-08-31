# MKone Intelligence Engine Substrate

Research interface for MKONE routing, ThinLine evidence boundaries, MK3A provenance concepts, and a simulator-backed quantum-classical feature layer.

## Quantum-AI v1.4

The repository includes a small exact TypeScript statevector simulator:

```text
classical features -> H -> RY encoding -> CNOT chain -> <Z(q0)>
```

This is quantum-circuit simulation on a classical CPU. It is not physical QPU execution and does not establish quantum advantage or general irreducible intelligence.

See:

- [Quantum-AI v1.4 design](research/QUANTUM_AI_HYBRID_V1.4.md)
- [Repository evidence status](research/EVIDENCE_STATUS_V1.4.md)
- [QPU adapter acceptance specification](research/QPU_ADAPTER_SPEC.md)
- [System improvements](SYSTEM_IMPROVEMENTS.md)

## Local verification

Prerequisites: Node.js 22.

```bash
npm install --ignore-scripts
npm run build
npm test
```

The test suite verifies the TypeScript simulator path only. Claims about the separate FastAPI stack, finite-shot provenance, ML-DSA-65 signatures, and the historical 26-test benchmark are not reproducible from this repository at present.

## Optional AI Studio interface

The dashboard can use a Gemini API key through `.env.local`. Quantum simulator verification does not require that credential.
