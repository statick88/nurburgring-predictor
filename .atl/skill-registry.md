# Skill Registry — nurburgring-predictor/frontend

## Project Context

| Property | Value |
|----------|-------|
| **Project** | nurburgring-predictor/frontend |
| **Path** | /Users/statick/dev/ideas/estadisticas/nurburgring-predictor/frontend |
| **Stack** | Next.js 15 + React 19 + TypeScript + Tailwind CSS |
| **Package Manager** | pnpm |
| **Output** | Static export to docs/ for GitHub Pages |
| **Language** | Bilingual React (Spanish default) |

## Detected Skills

| Skill | Status | Trigger Context |
|-------|--------|-----------------|
| **nextjs-15** | ✅ Active | App Router, Server Actions, data fetching |
| **react-19** | ✅ Active | React 19 components, no useMemo/useCallback needed |
| **typescript** | ✅ Active | TypeScript 5.3, strict mode via tsconfig |
| **tailwind-4** | ⚠️ Version mismatch | v3.4 installed, but skill patterns compatible |
| **eslint** | ✅ Active | eslint-config-next 15.1.3 |
| **code-quality** | ✅ Active | ESLint + TypeScript for linting/typecheck |

## Testing Capabilities

| Capability | Status | Notes |
|------------|--------|-------|
| **Test Runner** | ❌ Not detected | No test scripts in package.json, no .test.tsx files |
| **Unit Tests** | ❌ Unavailable | Project lacks testing infrastructure |
| **Integration Tests** | ❌ Unavailable | Project lacks testing infrastructure |
| **E2E Tests** | ❌ Unavailable | No Playwright/Cypress detected |
| **Coverage** | ❌ Unavailable | No coverage tool configured |
| **Linting** | ✅ Available | ESLint via next lint |
| **Type Check** | ✅ Available | TypeScript --noEmit |

## SDD Configuration

| Property | Value |
|----------|-------|
| **Persistence Mode** | engram |
| **Strict TDD** | false (no test runner) |
| **Openspec Path** | N/A (engram mode) |
| **Registry Path** | .atl/skill-registry.md |

## Next Recommended Steps

1. **Add test infrastructure** — Consider adding Vitest or Jest for unit tests
2. **Run sdd-explore** — Explore feature ideas before committing to changes
3. **Configure CI/CD** — Add GitHub Actions for lint + typecheck on push

## Risks

- **No test safety net** — Any implementation changes lack regression protection
- **Static export limits** — Some Next.js features (SSR, dynamic API routes) unavailable
- **Bilingual complexity** — All components use `t('es', 'en')` pattern — maintain consistency