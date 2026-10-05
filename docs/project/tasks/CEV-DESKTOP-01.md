# CEV-DESKTOP-01

- Owner: Product Manager and Orchestrator
- Scope: Create a desktop shortcut to a project folder linking Markdown documents, agent definitions and installed skills.
- Dependencies: Existing Cevanta documents and local skills installation.
- Allowed files: desktop-resources/**; scripts/create-desktop-resources.ps1; this task; docs/project/handoffs/CEV-DESKTOP-01.md; desktop shortcut Cevanta Markdown and Skills.lnk.
- Acceptance criteria: Links target existing original files/folders; desktop shortcut opens the resource folder; no copied credentials or stale source copies.
- Required evidence: Shortcut targets checked with Windows shortcut API and Test-Path.
- Isolation: Coordinator-only disjoint file ownership; no application changes.
- State: accepted; seven resource shortcuts and desktop shortcut verified.
