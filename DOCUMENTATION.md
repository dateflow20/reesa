# LeadReddit Technical Specifications & Architecture (v1.7)

## 1. Project Overview
**LeadReddit** is an advanced AI-orchestrated lead generation engine. It automates the process of market research, community discovery, and lead qualification on the Reddit platform. By utilizing the Google Gemini API, it transforms vague business descriptions or URLs into surgical search parameters and highly qualified sales opportunities.

---

## 2. Design System: "The Liquid Void"
The application follows a high-fidelity, minimalist dark aesthetic termed the "Liquid Void."

### Visual Language
*   **Palette:** Deep Black (`#000000`), Crimson Red (`#991b1b`), and Zinc Gray (`#18181b`).
*   **Atmosphere:** Dense, moving liquid backgrounds created via blurred, animated radial gradients with `mix-blend-mode: screen`.
*   **Interactivity:** Features "sinking and rising" UI elements. Features drift into the background liquid, lose opacity, and resurface with dynamic color "fill" animations (Red/Blue/Emerald) to signify active processing.
*   **Typography:** Ultra-bold, black-weighted sans-serif (Inter) with wide letter-spacing for headers.

---

## 3. AI Model Orchestration Logic
LeadReddit utilizes a tiered AI strategy to balance deep reasoning with operational speed.

### Model A: Strategic Architect (`gemini-3-pro-preview`)
*   **Role:** Phase 1 Market Analysis.
*   **Input:** Raw URL or user-provided service description.
*   **Task:** Deconstructs the offering into a `ServiceAnalysis` object.
*   **Prompt Strategy:** Focuses on "Buyer Intent" identification. It looks for behavioral markers (e.g., users asking for alternatives or expressing specific pain points).
*   **Output Schema:** Strictly enforced JSON containing `name`, `summary`, `keywords`, `suggestedSubreddits`, and `targetAudience`.

### Model B: High-Throughput Classifier (`gemini-3-flash-preview`)
*   **Role:** Phase 4 Lead Qualification.
*   **Input:** A batch of up to 25 raw Reddit posts/comments.
*   **Task:** Evaluates each lead against the `ServiceAnalysis` profile.
*   **Metrics:** 
    *   **AI Score (0-100):** Probability of conversion.
    *   **Reasoning:** Qualitative justification for the score.
    *   **Persona Insight:** Behavioral profile of the author.
    *   **Outreach Draft:** Context-aware, non-spammy initial contact message.

---

## 4. Reddit API & Discovery Engine
The discovery engine is built on a "Tiered Search" logic to ensure data density.

### Authentication
*   **Flow:** OAuth2 Client Credentials Grant.
*   **Rate Limiting:** Managed via Bearer token rotation (internal logic).

### Query Construction
1.  **Strict Targeted Search:** Combines AI keywords with identified subreddits using boolean logic: `(KW1 OR KW2) (subreddit:SUB1 OR subreddit:SUB2)`.
2.  **Global Fallback:** If Targeted Search returns `< 5` results, the system automatically strips the subreddit restrictions and performs a global keyword search across all of Reddit to ensure the user receives actionable data.

---

## 5. Functional Flow (The 4-Phase Pipeline)

1.  **Context Injection:** User inputs data. `gemini-3-pro` interprets the business logic.
2.  **Signal Management:** The Intelligence Dashboard populates. The user acts as a "Human-in-the-loop" to manually add/remove keywords or subreddits using the `+` and `×` controls.
3.  **Community Infiltration:** The Reddit Service fetches raw data from the OAuth search endpoint based on the finalized signals.
4.  **Neural Qualification:** `gemini-3-flash` processes the batch. Results are rendered as "Verified Opportunities" sorted by Intent Score.

---

## 6. Frontend Implementation Details

### Animation Engine
*   **Fluid Text:** Sine-wave floating achieved via `translateY` and staggered `animation-delay` on individual character spans.
*   **Button Fills:** Ghost buttons use a hidden absolute-positioned `div` that transitions from `translate-y-full` to `translate-y-0` on hover, changing text contrast dynamically.
*   **Feature Pop-ups:** Use a custom `sink-rise` keyframe that handles `translate`, `opacity`, and `filter: blur` simultaneously to simulate depth in a liquid medium.

### State Management
*   **AppState Interface:** Centralized tracking of analysis results, active signals, search results, and UI flags (scanning, analyzing, onboarding).
*   **Persistence:** Theme is locked to `dark` to maintain the intended premium experience.

---

## 7. Developer Notes
*   **API Security:** The `API_KEY` is strictly pulled from `process.env.API_KEY`.
*   **Extensibility:** To add new platforms (e.g., Twitter/X), the `Discovery Service` should be abstracted to accept a generic signal list.
*   **Performance:** Batch processing leads through Gemini Flash is limited to 25 items per call to maintain low latency and stay within standard token limits.

*LeadReddit Engine Core | Technical Documentation*
