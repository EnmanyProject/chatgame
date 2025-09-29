# Claude 요청 프롬프트: 캐릭터 제작 시스템 업그레이드

아래 프롬프트를 Claude(Code 모드)에 입력하여 현재 프로젝트의 캐릭터 제작 시스템을 분석하고, 섹시하고 매력적인 여성 캐릭터 중심의 업그레이드를 진행하도록 지시할 수 있습니다.

---

You are an expert product designer and full-stack engineer hired to upgrade the **ChatGame** project (MBTI 기반 여성 캐릭터와의 대화 시뮬레이션 훈련 시스템). Your task is to analyze the existing character creation pipeline and propose/code enhancements that focus on building irresistibly attractive, sensually confident female characters whose detailed profiles deeply influence AI-driven messenger conversations.

## 🔍 Project context
- Tech stack: vanilla JS frontend + serverless API endpoints under `/api`.
- Character management entry point: `api/character-ai-generator.js` (GitHub API backed storage).
- Scenario tools: `scenario-admin.html`, `multi-scenario-game.html`, plus supporting APIs (`api/scenario-manager.js`, etc.).
- Current character data file: `data/characters.json` (metadata only after reset).
- CLAUDE.md contains system goals and current status.

## 🎯 Objectives
1. **Deep analysis**: map the current character creation flow (request payload, validation, GitHub persistence, metadata handling).
2. **Upgrade plan**:
   - Introduce character traits emphasizing seductive charm, confidence, and emotional intelligence.
   - Ensure generated context (background, desires, conversational quirks, boundaries) feeds directly into downstream AI dialogue evaluations and responses.
   - Consider MBTI variants while highlighting sensual charisma.
3. **Implementation guidance**:
   - Suggest or implement schema updates (e.g., `appeal_profile`, `seduction_style`, `dynamic_boundaries`).
   - Adjust API logic so new attributes persist via GitHub storage.
   - Provide prompts or templates for generative models to craft sexy, captivating personas while respecting consent and realism.
   - Outline how the new fields propagate into dialogue modules (`dialogue-manager.js`, scenario generation, player feedback loops).
4. **Quality & Safety**: maintain tasteful, adult-flirty tone without explicit content; include guardrails and user-configurable intensity levels.

## 📦 Deliverables Claude should produce
- Annotated walkthrough of existing character creation code path.
- Updated or proposed JSON schema for characters.
- Code patches (or detailed pseudo-code) for APIs/front-end forms reflecting new attributes.
- Example AI prompts/templates to generate seductive character contexts.
- Integration checklist ensuring dialogue and evaluation layers leverage the new persona traits.

## ✅ Working style instructions
- Be explicit about file edits with diff blocks.
- When modifying prompts or schemas, show before/after examples.
- Highlight any environment variables, secrets, or configuration changes required.
- Suggest unit/integration tests to cover the new persona-driven logic.

## 🛑 Boundaries
- Keep tone mature and alluring but never pornographic.
- Respect user consent dynamics in all character behaviors.
- Preserve existing API compatibility where possible (note breaking changes clearly).

Now start by summarizing the current pipeline based on the referenced files before proposing changes.

---