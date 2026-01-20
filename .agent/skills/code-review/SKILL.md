---
name: code-review
description: Comprehensive guide for reviewing code to ensure it is clean, bug-free, and high-quality. Use when reviewing PRs, checking code quality, or before finalizing changes.
---
# Code Review Skill
This skill provides a rigorous framework for reviewing code. Your goal is to ensure the code is "as clean and bug-free as possible."
## When to use this skill
- Before finalizing any implementation task.
- When the user explicitly asks for a code review.
- When you are "verifying" a change and want to double-check your own work.
- When exploring existing code to identify refactoring opportunities.
## Review Checklist
Apply these checks to every piece of code you review.
### 1. Correctness & Logic
- [ ] **Functional Requirements**: Does the code strictly meet the user's requirements?
- [ ] **Algorithm Correctness**: Is the logic sound? Are there no infinite loops or incorrect state updates?
- [ ] **Typing**: Are TypeScript types strict and correct? Avoid `any` unless absolutely necessary.
- [ ] **State Management**: Is state handled correctly (e.g., React `useState`, `useEffect` deps)?
### 2. Edge Cases & Robustness
- [ ] **Null/Undefined**: Are null and undefined values handled gracefully? (e.g., optional chaining `?.`, nullish coalescing `??`).
- [ ] **Empty States**: How does the UI behaves when lists are empty?
- [ ] **Error Handling**: Are errors caught and handled? Is the user informed of errors?
- [ ] **Input Validation**: Is user input validated before processing?
### 3. Security
- [ ] **Secrets**: Are hardcoded secrets/keys present? (They should be in `.env`).
- [ ] **Injection**: Is there protection against XSS/SQL injection? (e.g., using proper libraries/framework features).
- [ ] **Access Control**: Does the code respect user permissions?
### 4. Performance
- [ ] **Re-renders**: (React) Are there unnecessary re-renders? Are `useMemo`/`useCallback` used appropriately?
- [ ] **Data Fetching**: Is data fetching optimized (caching, deduplication)?
- [ ] **Complexity**: Are there O(n^2) or worse operations on potentially large datasets?
### 5. Style & Maintainability
- [ ] **Naming**: Are variable/function names descriptive and consistent?
- [ ] **Modularity**: Is code broken down into small, reusable functions/components?
- [ ] **Comments**: "Why" is documented, not just "What".
- [ ] **Dead Code**: Is unused code removed?
## How to Provide Feedback
When acting as a reviewer:
1.  **Be Explicit**: Quote the line numbers.
2.  **Categorize**: Label issues (e.g., [CRITICAL], [SUGGESTION], [NIT]).
3.  **Explain Why**: "Change X to Y because Z prevents a potential race condition."
4.  **Suggest Fixes**: Provide the corrected code snippet.
## Example Usage
If you find a bug:
> **[CRITICAL] Correctness**
> In `utils.ts:45`, the loop condition `i <= length` causes an Index Out of Bounds error because arrays are 0-indexed.
>
> **Fix:**
> ```typescript
> for (let i = 0; i < length; i++) { ... }
> ```
If you suggest a cleanup:
> **[SUGGESTION] Maintainability**
> This logic in `Component.tsx` is complex. Consider extracting it to a custom hook `useCustomLogic`.
