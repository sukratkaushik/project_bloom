# OPIN AI Agent Command System

This directory houses your 4 specialized AI team members for **Our Pregnancy (OPIN)**.

```text
agents/
├── README.md               <-- This guide
├── specs/                  <-- The 4 Agent System Specs
│   ├── tech_agent.md       <-- Lead Fullstack Engineer
│   ├── compliance_agent.md <-- Medical & Regulatory Auditor
│   ├── marketing_agent.md  <-- Maternal Health Content Lead
│   └── outbound_agent.md   <-- Clinic Partnerships & B2B Lead
├── inbox/                  <-- Drop your tasks here
└── outputs/                <-- Agents write their completed deliverables here
```

---

## How to Trigger an Agent

Whenever you want an agent to work, you can simply tell your AI assistant (in Antigravity, Claude Code, or Cursor):

> *"Run the **Marketing Agent** using `agents/specs/marketing_agent.md` to generate content for pregnancy weeks 12–16."*

or

> *"Run the **Outbound Agent** using `agents/specs/outbound_agent.md` to draft an email sequence for 5 OB-GYN clinics in Bengaluru."*

or

> *"Run the **Compliance Agent** using `agents/specs/compliance_agent.md` to audit our latest code changes."*

---

## The Workflow Loop

1. **Assign:** Drop a brief note in `agents/inbox/` or give a one-line prompt.
2. **Execute:** The agent reads the shared company context in `OPIN_Brain/` and generates the deliverable.
3. **Review:** The agent saves its work in `agents/outputs/`.
4. **Approve:** You spend 5–10 minutes reviewing and approving the deliverable.
