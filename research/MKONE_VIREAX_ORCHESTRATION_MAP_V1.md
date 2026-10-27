# MKone + VIREÁX Orchestration Integration Map (v1)

**Status:** Architecture proposal; not an implemented runtime integration  
**Repository baseline:** main at 6c3e9a326b99817526654ac630c837d3c7075ec4 (2026-10-27)  
**Scope:** MKone routing + VIREÁX orchestration, evidence checks, authority boundary

## 1. Executive decision

Implement a small, typed orchestration boundary before adding more providers or autonomous behavior. MKone selects a route; VIREÁX resolves explicit context, critiques the proposed route, checks evidence and policy, and assembles a result envelope. The orchestrator may recommend or prepare an action, but must not silently authorize or execute consequential actions.

The repository currently contains a React/Vite research interface, a TypeScript statevector simulator, and a Gemini diagnostic service. It does not currently contain a server-side multi-model router, a VIREÁX evidence-validation pipeline, a durable memory transaction workflow, a provider-neutral orchestration API, or an action authorization service. These are proposed additions, not existing capabilities.

## 2. Architecture map

Proposed request path:

    User / UI
      -> Orchestration Facade (new; typed request + correlation ID)
      -> Context & Identity Resolver (new; explicit context only)
      -> MKone Router (new; candidate routes + deterministic policy)
      -> Provider Adapter(s) (new; model/tool calls, timeout and budget)
      -> VIREÁX Mirror + Critic (new; check constraints, assumptions, contradictions)
      -> Evidence & Verification Gate (new; provenance + claim labels + checks)
      -> Synthesis Gate (new; supported claims only; preserve disagreement)
      -> Result Envelope + Audit Event (new)
      -> UI / caller: answer, evidence, uncertainty, trace ID
      -> Human approval gate for consequential actions

### Responsibility boundaries

| Component | Owns | Must not own |
|---|---|---|
| Orchestration facade | Request schema, correlation ID, lifecycle, timeout/cancellation | Provider-specific policy or user sovereignty |
| Context/identity resolver | Explicit request context, user/session scope, consent flags | Invented identity or unapproved memory writes |
| MKone router | Candidate selection, fallback policy, cost/latency/capability constraints | Declaring a candidate fact true because it was selected |
| Provider adapter | Transport, normalized response, provider/model metadata, failure normalization | Authorization to act or claim validation |
| VIREÁX mirror/critic | Faithful reflection, contradiction checks, alternatives, explicit uncertainty | Treating inference as observed fact |
| Evidence gate | Claim/evidence mapping, source status, validation outcomes | Converting missing evidence into support |
| Synthesis gate | Bounded synthesis, disagreement retention, abstention | Hiding material disagreement or elevating hypotheses |
| Authority gate | Verify permission and explicit approval for a proposed action | Self-granting permissions |
| Audit writer | Append request/route/validation/approval/outcome metadata | Storing secrets or unredacted sensitive payloads by default |

## 3. Evidence and authority rules

Each output should distinguish:
- Provider output: raw model response; not independently validated.
- Claim: proposition extracted from output.
- Evidence status: established, supported, hypothesis, speculation, unknown, or refuted.
- Validation result: checks performed, outcome, version and provenance.
- Action proposal: optional structured intent, separate from the answer.
- Authorization: false by default; only an independent policy check and required human approval may authorize it.

Hard invariants:

1. AI output is not the same as a validated claim, and neither is execution authority.
2. Missing, unavailable, or contradictory evidence cannot be silently promoted to support.
3. A provider response cannot set its own authority or validation status.
4. Memory writes use propose -> preview -> approve -> commit -> audit.
5. Provider secrets stay server-side; never embed keys in browser bundles or logs.
6. Adapters declare capability and limitations; simulator execution is not QPU execution.
7. Fallbacks are traceable and must not bypass policy/evidence gates.
8. Timeouts, provider errors, and validator failures produce explicit incomplete/error states, not fabricated success.

## 4. Proposed contract sketch

Design targets only; these are not current exported TypeScript interfaces.

    type EvidenceStatus =
      | "established" | "supported" | "hypothesis"
      | "speculation" | "unknown" | "refuted";

    interface OrchestrationRequest {
      requestId: string;
      input: string;
      context?: Record<string, unknown>;
      constraints: {
        allowedProviders: string[];
        maxLatencyMs?: number;
        maxCostUnits?: number;
        requireEvidence: boolean;
        allowExternalTools: boolean;
      };
    }

    interface RouteDecision {
      providerId: string;
      modelId: string;
      reasonCodes: string[];
      fallbackFrom?: string;
    }

    interface ClaimRecord {
      claimId: string;
      text: string;
      status: EvidenceStatus;
      evidenceRefs: string[];
      rationale: string;
    }

    interface OrchestrationResult {
      requestId: string;
      route: RouteDecision[];
      answer: string;
      claims: ClaimRecord[];
      disagreements: string[];
      limitations: string[];
      validation: { status: "pass" | "partial" | "fail"; checks: string[] };
      actionProposal?: { kind: string; payload: Record<string, unknown> };
      executionAuthority: false;
      auditEventId: string;
    }

The literal executionAuthority=false is the default for this research phase. If later product behavior needs actions, define a separate authorization service and action-specific schema rather than relaxing this envelope implicitly. TypeScript interfaces do not validate untrusted JSON at runtime; choose a runtime schema strategy after checking dependency policy.

## 5. Repository mapping: verified current files

- App.tsx: current UI/dashboard surface; inspect before connecting the facade.
- types.ts: AwarenessState, InfoPacket, EngineMetrics, and HistoryPoint; these are UI/research types, not an orchestration protocol.
- services/geminiService.ts: directly calls Gemini for dashboard diagnostics and returns human-readable fallback strings. It is not a provider-neutral router or server-side security boundary.
- engine/QuantumSimulator.ts: local 2–8 qubit statevector feature map; explicitly reports qpuExecuted=false and quantumAdvantageClaimed=false.
- tests/quantum-simulator.test.ts: tests simulator input validation, normalization/bounds, determinism, balanced-input behavior, and dashboard compatibility. No orchestration contract tests are present in the current tree.
- research/EVIDENCE_STATUS_V1.4.md: documents that the FastAPI stack, finite-shot provenance, ML-DSA signatures, 26-test suite and 128-job benchmark are not reproducible from this repository.
- .github/workflows/quantum-verification.yml: Node 22 workflow installs dependencies, runs npm run build, then npm test.

## 6. Incremental implementation plan

### Phase 0 — baseline and protocol freeze

1. Keep main untouched; work on a dedicated branch.
2. Record the current commit and CI run for comparison.
3. Agree request/result schemas, claim labels, redaction rules, timeout policy, and authority invariants.
4. Do not move API keys or provider calls into client-side orchestration.

Exit: schema and security invariants reviewed; existing build/test workflow remains the baseline.

### Phase 1 — pure contracts and deterministic router

Proposed files:
- orchestration/contracts.ts — request, route, claim, validation, result and error types.
- orchestration/router.ts — pure route selection from explicit capabilities and constraints; no network calls.
- orchestration/policy.ts — allowed-provider, timeout, budget, external-tool and authority rules.
- tests/orchestration-contracts.test.ts — malformed payloads, missing fields, enum bounds, unknown provider and default-deny behavior.
- tests/orchestration-router.test.ts — deterministic choice, disallowed provider rejection, unavailable route, fallback trace and constraint handling.

Keep the first router deterministic and testable. Avoid using an LLM to decide its own permissions.

Exit: unit tests prove stable route decisions and that no request can grant itself authority.

### Phase 2 — provider adapter boundary

Proposed files:
- orchestration/providers/types.ts — provider adapter interface and normalized errors.
- orchestration/providers/gemini.ts — adapt Gemini behind the interface only after confirming a server-side execution boundary and secret handling.
- tests/provider-adapter.test.ts — mock transport, timeout, malformed response, empty output, provider error and secret-redaction cases.

Do not claim multi-provider orchestration until at least two independently configured adapters are implemented and exercised in tests. Do not add provider keys to VITE_* variables or client-visible source.

Exit: adapter behavior is isolated; provider failures are observable and do not bypass policy.

### Phase 3 — VIREÁX verification pipeline

Proposed files:
- orchestration/vireax/mirror.ts — compare request constraints against candidate answer.
- orchestration/vireax/critic.ts — detect unsupported leaps, contradictions and alternatives; emit structured findings.
- orchestration/evidence/gate.ts — attach claim status, evidence references, and validation outcomes.
- orchestration/synthesis.ts — preserve unresolved disagreement and emit partial/abstain states.
- tests/vireax-evidence-gate.test.ts — explicit vs inferred vs absent vs contradicted claims; empty references; validator unavailable; conflicting providers.
- tests/orchestration-synthesis.test.ts — no silent conflict erasure; unknown remains unknown; failure/partial state propagation.

Use deterministic, inspectable checks first. Model-generated critique may be advisory, never the sole validator for high-impact claims.

Exit: synthetic adversarial cases show unsupported claims are not labeled established/supported without evidence.

### Phase 4 — audit and human approval

Proposed files:
- orchestration/audit.ts — append-only structured event writer with redaction and correlation IDs.
- orchestration/authority.ts — action-specific policy check; deny by default.
- tests/orchestration-audit.test.ts — event order, correlation, redaction, duplicate IDs and append failure.
- tests/orchestration-authority.test.ts — default deny, insufficient permission, approval required, revoked permission, replay and idempotency.

Memory mutation remains a separate explicit transaction; do not combine answering with committing memory.

Exit: every request has traceable route/validation events; action proposals cannot execute without separate approval.

### Phase 5 — UI integration and release gate

Proposed touch points:
- App.tsx — render structured status, evidence labels, limitations, and trace ID.
- services/geminiService.ts — replace direct UI-level provider usage only when a safe server-side facade exists; otherwise keep it labelled as a prototype diagnostic.
- types.ts — reuse or map existing UI types without conflating AwarenessState with evidence or authority states.
- README.md and research/EVIDENCE_STATUS_V1.4.md — update only after behavior and tests exist.

Exit: no secret in built assets; error/partial paths render honestly; CI passes; evidence claims match the checked-in implementation.

## 7. Verification matrix

| Test group | Required cases | Release condition |
|---|---|---|
| Existing baseline | npm run build, npm test | Both pass on PR head |
| Contracts | valid/invalid schemas, unknown enum/status | All deterministic |
| Router | constraints, tie-breaking, disallowed route, fallback | No policy bypass |
| Provider | timeout, empty response, network failure, redaction | No secret leakage |
| VIREÁX gate | unsupported, inferred, absent, contradicted, conflicting claims | No unsupported promotion |
| Synthesis | disagreement retention, abstention, partial failures | No false success |
| Audit | ordered events, trace IDs, redaction, persistence failure | Fail closed where required |
| Authority | default deny, explicit approval, replay/idempotency | No self-authorization |
| Integration | UI state, error states, cancellation, provider unavailable | Build and tests pass |

## 8. CI and governance findings

At inspection, main was at 6c3e9a326b99817526654ac630c837d3c7075ec4. The repository workflow Quantum simulator verification had a completed successful run for that SHA at https://github.com/CV1admin/--Intelligence-Engine-MKone-Substrate/actions/runs/40467416283. This validates only the workflow's configured build and simulator tests, not any orchestration implementation.

The branch API reports main as unprotected and required status checks disabled. This is a governance risk: a green workflow does not itself prevent a direct push or merge. Proposal: enable branch protection/rules requiring the workflow on PRs after confirming the check name and repository settings.

Open dependency PRs were present during inspection:
- #5: actions/setup-node 4 -> 7
- #6: actions/checkout 4 -> 7

Do not bundle those dependency upgrades into this architecture change; evaluate their compatibility and security separately.

## 9. Acceptance criteria for the first implementation PR

- [ ] main unchanged; all work isolated on a feature branch.
- [ ] Pure contracts/router/policy merged only after runtime schema validation strategy is explicit.
- [ ] No credentials or provider network calls in browser-only routing logic.
- [ ] Evidence status, validation result, and action authority are separate fields.
- [ ] executionAuthority defaults to false; only a separate gate can authorize an action.
- [ ] At least two provider adapters are implemented before claiming multi-provider orchestration.
- [ ] New tests cover adversarial and failure paths, not only happy paths.
- [ ] CI build and all tests pass on the PR head; logs are linked.
- [ ] Documentation labels implemented, proposed, and unavailable features distinctly.
- [ ] No merge or deployment without human review.

## 10. Final boundary

This document is a repository-mapped implementation plan, not evidence that the proposed orchestration system exists. The current repository's verified quantum-related capability is a small classical statevector simulator with tests. The proposed MKone + VIREÁX orchestration must be implemented and tested incrementally before it can be described as operational.
