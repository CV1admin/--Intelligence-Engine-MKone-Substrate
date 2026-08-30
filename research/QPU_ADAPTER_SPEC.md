# QPU Adapter Acceptance Specification

A backend may emit `qpuExecuted=true` only when the provider job record independently supplies:

- immutable provider/backend ID;
- provider job ID and terminal status;
- circuit hashes before and after transpilation;
- native gate set, layout, depth and two-qubit gate count;
- shots, observables and measured results;
- calibration timestamp and applicable error properties;
- suppression and mitigation configuration;
- submission, activation and completion timestamps;
- provider and local result hashes.

The adapter must expose an execution interface and a separate provider-job verification method. Hardware evaluation must use matched classical baselines and cannot infer quantum advantage from successful QPU execution alone.
