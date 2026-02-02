# AGENTS.md - Google Antigravity Guidelines

> Project-specific instructions for Google Antigravity AI Agent.

---

## 🏗️ Project Structure

```plaintext
.agent/
├── ARCHITECTURE.md          # Full system reference (20 agents, 36 skills, 11 workflows)
├── agents/                  # 21 Specialist Agent definitions
├── skills/                  # 36 Skill modules with SKILL.md index files
├── workflows/               # 12 Slash command procedures
├── rules/                   # Global rules (GEMINI.md)
└── scripts/                 # Master validation scripts
```

---

## 🚀 Quick Start

1. **Read** `.agent/ARCHITECTURE.md` for full system overview
2. **Apply** the appropriate agent for your task domain
3. **Load** skills from agent frontmatter
4. **Follow** workflow protocols for slash commands

---

## 🤖 Agent System

### Core Agents

| Agent                 | Path                                   | Description                                   |
| --------------------- | -------------------------------------- | --------------------------------------------- |
| `orchestrator`        | `.agent/agents/orchestrator.md`        | Multi-agent coordination                      |
| `project-planner`     | `.agent/agents/project-planner.md`     | Discovery & task planning                     |
| `frontend-specialist` | `.agent/agents/frontend-specialist.md` | Web UI/UX                                     |
| `backend-specialist`  | `.agent/agents/backend-specialist.md`  | API & business logic                          |
| `database-architect`  | `.agent/agents/database-architect.md`  | Schema & SQL                                  |
| `mobile-developer`    | `.agent/agents/mobile-developer.md`    | iOS, Android, React Native                    |
| `debugger`            | `.agent/agents/debugger.md`            | Root cause analysis                           |
| `git-manager`         | `.agent/agents/git-manager.md`         | Stage, commit, push with conventional commits |

### Specialist Agents

| Agent                    | Path                                      | Description                |
| ------------------------ | ----------------------------------------- | -------------------------- |
| `devops-engineer`        | `.agent/agents/devops-engineer.md`        | CI/CD, Docker              |
| `security-auditor`       | `.agent/agents/security-auditor.md`       | Security compliance        |
| `penetration-tester`     | `.agent/agents/penetration-tester.md`     | Offensive security         |
| `test-engineer`          | `.agent/agents/test-engineer.md`          | Testing strategies         |
| `qa-automation-engineer` | `.agent/agents/qa-automation-engineer.md` | E2E testing, CI pipelines  |
| `performance-optimizer`  | `.agent/agents/performance-optimizer.md`  | Speed, Web Vitals          |
| `seo-specialist`         | `.agent/agents/seo-specialist.md`         | Ranking, visibility        |
| `documentation-writer`   | `.agent/agents/documentation-writer.md`   | Manuals, docs              |
| `product-manager`        | `.agent/agents/product-manager.md`        | Requirements, user stories |
| `product-owner`          | `.agent/agents/product-owner.md`          | Strategy, backlog, MVP     |
| `game-developer`         | `.agent/agents/game-developer.md`         | Game logic, mechanics      |
| `code-archaeologist`     | `.agent/agents/code-archaeologist.md`     | Legacy code, refactoring   |
| `explorer-agent`         | `.agent/agents/explorer-agent.md`         | Codebase analysis          |

---

## 🔄 Workflows (Slash Commands)

| Command          | Path                                | Description              |
| ---------------- | ----------------------------------- | ------------------------ |
| `/brainstorm`    | `.agent/workflows/brainstorm.md`    | Socratic discovery       |
| `/create`        | `.agent/workflows/create.md`        | Create new features      |
| `/debug`         | `.agent/workflows/debug.md`         | Debug issues             |
| `/deploy`        | `.agent/workflows/deploy.md`        | Deploy application       |
| `/enhance`       | `.agent/workflows/enhance.md`       | Improve existing code    |
| `/git`           | `.agent/workflows/git.md`           | Git operations           |
| `/orchestrate`   | `.agent/workflows/orchestrate.md`   | Multi-agent coordination |
| `/plan`          | `.agent/workflows/plan.md`          | Task breakdown           |
| `/preview`       | `.agent/workflows/preview.md`       | Preview changes          |
| `/status`        | `.agent/workflows/status.md`        | Check project status     |
| `/test`          | `.agent/workflows/test.md`          | Run tests                |
| `/ui-ux-pro-max` | `.agent/workflows/ui-ux-pro-max.md` | Design with 50 styles    |

---

## 📋 Agent Loading Protocol

When performing any task:

1. **Identify Domain** → Determine the appropriate agent for the task
2. **Read Agent File** → Load the agent's `.md` file from `.agent/agents/`
3. **Check Frontmatter** → Load required skills from `skills:` field
4. **Apply Rules** → Follow agent-specific guidelines and constraints

### Priority Order

```
P0: Global Rules (GEMINI.md) > P1: Agent Rules > P2: Skill Rules
```

---

## 🧩 Key Skills Reference

| Category     | Skills                                                                          |
| ------------ | ------------------------------------------------------------------------------- |
| **Frontend** | `react-best-practices`, `frontend-design`, `tailwind-patterns`, `ui-ux-pro-max` |
| **Backend**  | `api-patterns`, `nodejs-best-practices`, `nestjs-expert`                        |
| **Database** | `database-design`, `prisma-expert`                                              |
| **Testing**  | `testing-patterns`, `webapp-testing`, `tdd-workflow`                            |
| **Security** | `vulnerability-scanner`, `red-team-tactics`                                     |
| **DevOps**   | `docker-expert`, `deployment-procedures`                                        |
| **Planning** | `brainstorming`, `plan-writing`, `architecture`                                 |

---

## 📁 Important Files

| File                           | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `.agent/ARCHITECTURE.md`       | Complete system architecture reference |
| `.agent/rules/GEMINI.md`       | Global rules (always active)           |
| `.agent/scripts/checklist.py`  | Priority-based validation              |
| `.agent/scripts/verify_all.py` | Comprehensive verification             |

---

## 🎯 Request Classification

| Type             | Keywords                       | Action                 |
| ---------------- | ------------------------------ | ---------------------- |
| **Question**     | "what is", "explain"           | Text response only     |
| **Survey**       | "analyze", "overview"          | Explorer agent         |
| **Simple Code**  | "fix", "add" (single file)     | Inline edit            |
| **Complex Code** | "build", "create", "implement" | Full agent + task file |
| **Design**       | "design", "UI", "page"         | Frontend/Mobile agent  |

---

## ✅ Validation Commands

```bash
# Quick validation during development
python .agent/scripts/checklist.py .

# Full verification before deployment
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

---

## 📚 Further Reading

- **Full Architecture**: [.agent/ARCHITECTURE.md](.agent/ARCHITECTURE.md)
- **Global Rules**: [.agent/rules/GEMINI.md](.agent/rules/GEMINI.md)
- **Git Operations**: [.agent/agents/git-manager.md](.agent/agents/git-manager.md)
