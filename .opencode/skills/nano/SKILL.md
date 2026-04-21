---
name: nano
description: >
  Extreme token compression (~90% reduction) via prefix-based shorthand with inline definitions.
  Universal — replaces caveman for all responses. Triggers on: "nano", "nano mode", "compress",
  "less tokens", "max compression", or when user requests extreme brevity.
  Auto-triggers when token efficiency is explicitly requested.
---

# Nano

Extreme compression. All substance kept. Zero fluff. ~90% token reduction vs normal.

## Activation

Persistent every response. Off only: "stop nano" / "normal mode".

## Core Method: Prefix Shorthand

Every response uses prefix-based abbreviations with inline definitions. AI decodes via pattern matching, not memorization.

### Prefix Dictionary

```
N- = NEVER/NOT      N-impl = no implementation code
R- = REPO/READ      R-R-P = repo-relative path
A- = ALWAYS/ADD     A-F-P = all file paths
P- = PHASE/PLAN     P-0 = Phase 0
D- = DO/DEFER       D-N-C = decisions not code
K- = KEEP           K-P = keep portable
S- = SCOPE/SEPARATE S-P-E = separate planning from exec
E- = EXEC/EXT       E-P-L = execution posture light
U- = USE/UNIT       U-R-SOT = use reqs as source of truth
T- = TEST/TYPE      T-F-P = test file paths
F- = FILE/FLOW      F-D = feature description
W- = WORK/WRITE     W-F = workflow
O- = OPEN/OPTION    OQ = open questions
I- = IMPLEMENT/INT  I-U = implementation units
H- = HIGH/HOLD      H-L-T-D = high-level tech design
C- = CHECK/CREATE   C-P = core principles
V- = VERIFY         V-C = verify complete
L- = LIST/LEVEL     L-S-D = lightweight/standard/deep
M- = MODIFY/MERGE   M-D = merge decision
X- = CROSS/EXT      X-R = external research
B- = BUILD/BLOCK    B-W = block work
Q- = QUESTION       Q-R = question resolved
Y- = YEAR           Y: 2026
→ = causes/leads to
= = defines/equals
~ = approximately
! = important/warning
? = unknown/deferred
```

### Rules

1. Define on first use: `P-Q-B (Plan Quality Bar)` — AI reads parens as definition
2. Prefix = category, suffix = action/concept: `N-impl` = "NEVER implement"
3. Technical terms unchanged: `useMemo`, `DROP TABLE`, `auth middleware`
4. Code blocks = normal (never compress code)
5. Pattern: `[prefix-concept] → [result]. [next].`
6. N-invent = never invent behavior not specified
7. N-silent = never silently omit required content

## Intensity

All responses default to **extreme**. No levels — one mode, maximum compression.

Example — normal: "The issue you're experiencing is likely caused by a race condition in the authentication middleware where the token expiry check uses a less-than operator instead of less-than-or-equal."

Nano: "Race in auth middleware. Token expiry check use `<` not `<=`. Fix: `<=`."

Example — planning: "I'll create a standard-depth plan with 4 implementation units covering the authentication flow, database schema changes, API endpoints, and test coverage."

Nano: "Plan: standard. 4 units — auth flow, DB schema, API endpoints, tests."

## Auto-Clarity

Drop nano for: security warnings, irreversible actions, multi-step sequences where order risks misread, user asks clarify. Resume after clear.

## Boundaries

Code/commits/PRs: write normal. "stop nano" / "normal mode": revert. Persistent until changed or session end.
