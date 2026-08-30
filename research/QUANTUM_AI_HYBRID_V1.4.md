# Quantum-AI Hybrid Upgrade v1.4

## Status

The framework is now a **simulator-backed quantum-classical hybrid**. A classical MKONE route invokes an exact quantum-circuit simulator and combines its observable with a classical specialist result. This is not QPU execution and does not demonstrate quantum advantage.

## Evidence-driven architecture

IBM exposes quantum workloads through Sampler and Estimator job abstractions and supplies statevector reference implementations. This supports a backend-neutral job interface rather than hiding quantum execution behind a generic AI call:

- [IBM Qiskit primitives](https://quantum.cloud.ibm.com/docs/api/qiskit/primitives)
- [IBM Sampler inputs and outputs](https://quantum.cloud.ibm.com/docs/en/guides/sampler-input-output)
- [IBM Estimator inputs and outputs](https://quantum.cloud.ibm.com/docs/en/guides/estimator-input-output)

Classical data must be encoded into a circuit. IBM documents angle and other encodings while warning that some feature maps are efficiently classically simulable and do not establish speed-up:

- [IBM Quantum Learning: data encoding](https://quantum.cloud.ibm.com/learning/courses/quantum-machine-learning/data-encoding)

Hardware circuits must be transpiled for a device topology and native gate set, while backend calibration properties change over time:

- [IBM Qiskit transpiler](https://quantum.cloud.ibm.com/docs/api/qiskit/transpiler)
- [IBM backend details](https://quantum.cloud.ibm.com/docs/en/guides/qpu-information)

Quantum feature spaces are a valid research method, but classical learning from data can eliminate apparent advantage in important regimes:

- [Havlicek et al., supervised learning with quantum enhanced feature spaces](https://arxiv.org/abs/1804.11326)
- [Huang, Kueng and Preskill, power of data in quantum machine learning](https://www.nature.com/articles/s41467-021-22539-9)

## Implemented circuit

```text
|0...0> -> H on every qubit -> RY(angle(feature)) -> CNOT chain -> <Z(q0)>
```

The implementation records:

- simulator/QPU execution class;
- backend ID and version;
- canonical circuit and input hashes;
- number of qubits, circuit depth, shots and seed;
- observable, expectation and standard error;
- state normalization and counts hash;
- registry and ThinLine policy versions;
- ML-DSA-65 signature;
- classical result, quantum feature and hybrid delta;
- deny-by-default execution authority.

## Validation

- 26/26 integration and security tests passed.
- 128 simulator jobs were executed using 2-8 qubits.
- Each benchmark job used 1,024 shots.
- Maximum state-normalization error: 1.9984e-15.
- Seed-deterministic sampling: passed.
- Sampled expectations within three standard errors: 100%.
- QPU executed: false.
- Quantum advantage demonstrated: false.

## QPU acceptance gate

A future QPU adapter must bind provider-generated backend and job IDs, pre- and post-transpilation circuit hashes, layout, native gates, shot count, observable, calibration timestamp, error properties, mitigation configuration, timestamps and provider result hash.

An advantage claim additionally requires a preregistered task, matched strong classical baselines, uncertainty intervals, complete resource accounting and independent reproduction.
