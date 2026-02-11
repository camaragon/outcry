# PR Review Workflow

## When to Use
After creating any PR in the Outcry repo.

## The Flow

### 1. Create PR
- Push branch, open PR via `gh pr create`
- Note the PR number

### 2. Alert Cameron
Send a Telegram message with:
- What the PR does (1-2 sentences)
- Link to the PR
- Any context needed for review

### 3. Wait for Cameron's Review
Cameron reviews the PR manually. He'll send feedback with specific items to address.
**Do not self-approve or auto-merge. Do not run a self-review loop.**

### 4. Fix & Push
- Address the items Cameron flags
- Push changes
- Report back with what was fixed

### 5. Repeat Until Clean
Continue the fix → review cycle until Cameron says it's good.

### 6. Ready to Merge
Cameron clicks merge. Never merge yourself.

## Rules
- **Never merge a PR** — Cameron always clicks merge
- **Cameron reviews** — don't run self-review loops or chase Copilot cycles
- **Create issues for deferred work** — if review surfaces future work, open a GitHub issue
- **Conventional commits** — all commits follow conventional commit format
