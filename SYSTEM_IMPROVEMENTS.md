# MKone Intelligence Engine — validated system improvements

## Added architecture

The research stack now separates four responsibilities:

1. **MKONE** — task decomposition, model selection and candidate routing;
2. **ThinLineEngine** — uncertainty, attractor persistence, disagreement and boundary measurement;
3. **MK3A** — identity, transcript integrity, ML-KEM session establishment and ML-DSA signatures;
4. **Validation gate** — scientific status and bounded execution remain independent.

```text
AI output != validated claim != execution authority
```

## Current tested results

- ThinLineEngine one-dimensional PDE numerical consistency: passed in the declared test regime.
- Deterministic MKONE policy kernel: passed internal routing cases.
- ML-KEM-768/1024 and ML-DSA-65/87 behavioural tests: passed.
- Five-task continual-learning specialists: 95.91% clean and 93.35% noisy OOD accuracy.
- Silent shuffled routing: 54.57%.
- ML-DSA-bound route rejection plus replay fallback: 94.79% recovery.

## Scientific boundary

General irreducible intelligence is not demonstrated. An equal-parameter replay monolith reached 94.78% against 95.91% for specialists. The 1.13-point gap failed the preregistered 5% irreducibility threshold.

The valid result is coordinated emergent capability and routing dependence, not absolute or general architectural irreducibility.

## Deployment boundary

The cryptographic results are behavioural integration tests, not NIST certification, a side-channel audit or production key-management approval. All research envelopes retain `execution_authority=false`.
