# Gitflow

## Branches
- main: production releases
- develop: integration
- feature/*: feature development
- bugfix/*: fixes on develop
- release/*: release candidates
- hotfix/*: critical fixes on main

## Conventions
- Use Conventional Commits (feat:, fix:, docs:, chore:, etc.).
- Squash merges for feature branches into develop.
- Merge commits for release/hotfix into main.

## Workflow
1. Create feature branch from develop.
2. Open PR to develop with CI green.
3. Release branches merge to main and back to develop.
