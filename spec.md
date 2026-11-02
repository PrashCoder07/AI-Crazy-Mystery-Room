# MASTER SPECIFICATION & EXECUTION PROMPT FOR CODEX
# PROJECT: AI MYSTERY ROOM (MERN + GEMINI API)

You are an autonomous full-stack engineering agent operating under Spec-Driven Development (SDD). This document is your Single Source of Truth (SSOT). Build the complete, production-ready "AI Mystery Room" web application strictly following every architectural rule, schema, API contract, and UI/UX constraint defined below.

---

## 1. PROJECT OVERVIEW & CORE REQUIREMENTS

**Concept:**
AI Mystery Room is an interactive forensic detective web application. The user inputs a short scenario or story seed. The backend uses Google Gemini (`gemini-2.5-flash`) to dynamically generate a logically airtight criminal investigation with 4 suspects, alibis, a hidden culprit, and interactive digital evidence:
1. **WhatsApp Messages:** Simulated multi-person and direct chat logs with timestamps and recovered deleted messages.
2. **CCTV Camera Recordings:** Interactive security camera feeds with frame-by-frame scrubbers, timestamps, room wireframes, and motion/tamper anomalies.
3. **Forensic Images:** Crime-scene visual blueprints (fingerprints, keycard access logs, floorplan traces, receipts, physical objects) with embedded clue codes.

The user inspects the proofs inside a dark investigation room UI and locks in a final accusation to see if they caught the true culprit.

**Non-Negotiable Quality & Performance Targets:**
- **Fast Response (< 4 Seconds):** Use `@google/genai` with `gemini-2.5-flash`, `responseMimeType: "application/json"`, a strict `responseSchema`, and `thinkingConfig: { thinkingBudget: 0 }` so cases generate in under 4 seconds without JSON parsing failures.
- **Zero-Latency Multimodal Rendering:** Render WhatsApp chats, CCTV camera feeds, and forensic image blueprints natively in React using structured JSON data and procedural SVG/Canvas forensic templates rather than slow external video/image diffusion APIs.
- **Logical Accuracy (No Hallucinated Plotholes):** The AI prompt must enforce a backward-designed 3-point contradiction chain linking a WhatsApp statement, a CCTV timestamp/location, and a forensic image code to a single guilty suspect while allowing innocent suspects to be systematically cleared.
- **Anti-Cheat Security:** Strip the `solution` object (`culpritId`, `smokingGunSummary`, `contradictionChain`) from `POST /api/mysteries/generate` and `GET /api/mysteries/:id` responses. Only reveal `solution` when the client submits `POST /api/mysteries/:id/accuse`.

---

## 2. DESIGN SYSTEM ("CYBER-NOIR FORENSIC TERMINAL")

The application must look like a classified dark-room investigation terminal.
- **Theme:** Deep matte black backgrounds (`#050505` and `#0A0D0A`) paired with high-tech Neon Green (`#00FF66` and `#39FF14`).
- **Strictly Scoped Neon Glows:** Apply glowing neon effects (`text-shadow` and `box-shadow`) **ONLY** to:
  1. Button text and button borders/outlines
  2. Section headers, case titles, and HUD badges (`[ LIVE FEED ]`, `[ RECOVERED ]`, `[ PRIME SUSPECT ]`)
  3. Active tab outlines, input focus rings, and selected suspect card borders
- **Readable Body Copy:** Long paragraphs, suspect alibis, and WhatsApp message bodies must use clean, non-glowing `#E8F5E9` text so the player can read clues effortlessly.

### CSS Variables & Tailwind Utilities (`client/src/styles/index.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-void: #050505;
  --bg-panel: #0A0D0A;
  --bg-elevated: #111711;
  --neon-primary: #00FF66;
  --neon-bright: #39FF14;
  --neon-muted: #008F39;
  --neon-dim: rgba(0, 255, 102, 0.12);
  --text-primary: #E8F5E9;
  --text-secondary: #819CA0;
  --text-alert: #FF3366;
}

body {
  background-color: var(--bg-void);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}

.font-mono-hud {
  font-family: 'JetBrains Mono', 'Share Tech Mono', monospace;
}

@layer components {
  /* Glowing Text Utilities */
  .neon-text {
    color: #00FF66;
    text-shadow: 0 0 8px rgba(0, 255, 102, 0.65);
  }

  .neon-heading {
    color: #39FF14;
    text-shadow: 0 0 10px rgba(0, 255, 102, 0.85), 0 0 22px rgba(57, 255, 20, 0.45);
  }

  .neon-alert-text {
    color: #FF3366;
    text-shadow: 0 0 10px rgba(255, 51, 102, 0.8);
  }

  /* Glowing Button with Glowing Text & Outline */
  .neon-btn {
    background-color: #0A0D0A;
    color: #00FF66;
    border: 1px solid #00FF66;
    text-shadow: 0 0 8px rgba(0, 255, 102, 0.65);
    box-shadow: 0 0 12px rgba(0, 255, 102, 0.35), inset 0 0 8px rgba(0, 255, 102

    # AI MYSTERY ROOM — MASTER TECHNICAL SPECIFICATION (SSOT)
**Document Version:** 2.0.0-PRODUCTION  
**Methodology:** Spec-Driven Development (SDD)  
**Target Agent:** Autonomous Full-Stack Engineering Agent (Codex / Cursor / Windsurf)  
**Tech Stack:** MongoDB, Express.js, React 18 (Vite + Tailwind CSS), Node.js (v20+), Google Gemini API (`@google/genai`)  

---

## 1. EXECUTIVE SUMMARY & AUTONOMOUS AGENT DIRECTIVES

You are an autonomous full-stack engineering agent tasked with building **AI Mystery Room** from scratch. This `spec.md` file is your Single Source of Truth (SSOT). Every architectural decision, database schema, Gemini structured output contract, REST API endpoint, CSS glow token, and React component implementation is fully specified in this document.

### 1.1 Core Product Loop
1. **Scenario Seed Input:** The user enters a short crime scenario or selects a preset seed on the forensic terminal home screen.
2. **Sub-4-Second AI Case Synthesis:** The Express backend invokes Google Gemini (`gemini-2.5-flash`) using strict JSON Schema validation (`responseSchema`) and zero thinking budget (`thinkingBudget: 0`) to construct a complete, logically solvable murder/heist/sabotage mystery.
3. **Interactive Multi-Modal Evidence Inspection:** The frontend receives the sanitized case file (with the solution stripped out to prevent cheating via DevTools) and renders an immersive dark-room forensic workstation with three interactive evidence emulators:
   - **WhatsApp Intercepts Emulator:** Multi-thread dark chat UI with timestamps, read receipts, and glowing `[ RECOVERED BY FORENSICS ]` deleted messages.
   - **CCTV Surveillance Player:** Multi-camera security monitor with CRT scanlines, interactive frame-by-frame scrubber, anomaly flags, and dynamic SVG room wireframes (`CORRIDOR`, `VAULT`, `PARKING`, `LAB`, `OFFICE`) plotting detected entities in real time.
   - **Forensic Photo Locker:** Procedural high-contrast SVG forensic blueprints (`FINGERPRINT_MATCH`, `ACCESS_LOG_SCREENSHOT`, `FLOORPLAN_TRACE`, `RECEIPT_DOCUMENT`, `PHYSICAL_OBJECT`) with embedded security codes and a magnifying modal.
4. **Deduction & Pinboard:** The user marks suspects as `[ CLEAR ]` or `[ SUSPECT ]`, pins incriminating WhatsApp messages, CCTV frames, and forensic photos to their Deduction Board, selects one of the 4 suspects, and clicks `[ LOCK IN CULPRIT & SOLVE ]`.
5. **Verdict & Contradiction Chain Reveal:** The backend verifies the accusation against the hidden solution and returns the verdict (`isCorrect`), the true culprit, the `smokingGunSummary`, and the exact 3-step `contradictionChain` proving how the WhatsApp lie, CCTV frame, and forensic image exposed the culprit.

### 1.2 Non-Negotiable Engineering Invariants
- **Strict Visual Theme ("Cyber-Noir Forensic Terminal"):**
  - Backgrounds must be deep matte black (`#050505`, `#0A0D0A`, `#111711`).
  - Primary accents must be Neon Green (`#00FF66` and `#39FF14`).
  - **Scoped Neon Glow Rule:** Apply neon `text-shadow` and `box-shadow` ONLY to button text, button borders/outlines, section headers, HUD status badges, and active card borders. NEVER apply `text-shadow` glow to long body paragraphs, suspect alibi descriptions, or WhatsApp message bodies—keep body copy crisp `#E8F5E9` for effortless reading.
- **High Speed & Zero Crashes:**
  - Configure Gemini with `model: 'gemini-2.5-flash'`, `responseMimeType: 'application/json'`, `responseSchema: mysteryResponseSchema`, and `thinkingConfig: { thinkingBudget: 0 }`.
  - Provide a dual-layer persistence engine in `server/config/db.js`: if MongoDB (`MONGO_URI`) is running, persist via Mongoose; if MongoDB is unreachable or not started, automatically fall back to an in-memory `Map` store so the application runs with zero setup friction.
  - Provide a deterministic fallback case generator in `server/services/geminiService.js` if `GEMINI_API_KEY` is missing or rate-limited during offline testing.
- **Anti-Cheat Payload Sanitization:**
  - Never send `solution.culpritId`, `solution.smokingGunSummary`, or `solution.contradictionChain` in `POST /api/mysteries/generate` or `GET /api/mysteries/:id`. Only reveal `solution` in the response of `POST /api/mysteries/:id/accuse`.

---

## 2. SYSTEM ARCHITECTURE & DATA FLOW PIPELINE

```text
+-----------------------------------------------------------------------------------+
|                        CLIENT: REACT 18 + VITE + TAILWIND CSS                     |
|                                                                                   |
|  +-----------------------+     +-----------------------------------------------+  |
|  |   TerminalHome.jsx    | --> |            InvestigationBoard.jsx             |  |
|  | (Scenario Prompt UI)  |     |  +-------------+ +---------------+ +-------+  |  |
|  +-----------+-----------+     |  |SuspectRoster| |EvidenceViewprt| |Deductn|  |  |
|              |                 |  | (4 Dossiers)| | - WhatsApp UI | | Panel |  |  |
|              |                 |  |             | | - CCTV Player | | (Pins)|  |  |
|              |                 |  |             | | - Photo Locker| |       |  |  |
|              |                 |  +-------------+ +---------------+ +---+---+  |  |
|             

# AI MYSTERY ROOM

## Master Product Specification

### Single Source of Truth (SSOT) for Development

**Document Version:** 1.0
**Project Name:** AI Mystery Room
**Document Type:** Product Requirements + Software Architecture + Technical Specification
**Development Approach:** Specification-Driven Development
**Frontend:** React.js
**Backend:** Node.js + Express.js
**Database:** MongoDB
**AI Engine:** Google Gemini API

---

# 1. PROJECT OVERVIEW

## 1.1 Product Vision

AI Mystery Room is an AI-powered interactive detective investigation platform.

Users provide a short fictional scenario, incident, or story. Based on this input, the AI generates a complete fictional criminal investigation containing:

* A central mystery.
* Multiple suspects.
* One actual culprit.
* Individual suspect profiles.
* Motives and alibis.
* Evidence and clues.
* WhatsApp conversations.
* CCTV footage descriptions or recordings.
* Photographs and forensic reports.
* Witness statements.
* Hidden contradictions.
* A final investigation solution.

Users enter an interactive investigation room, examine the available evidence, connect clues, investigate suspects, and ultimately identify the culprit.

The experience should resemble an actual detective investigation environment rather than a conventional quiz website.

## 1.2 Core Concept

**User Input → AI Investigation Generation → Evidence Room → Investigation → Culprit Selection → Final Verdict**

The AI acts as the investigation's backend intelligence.

It must create a fictional but logically consistent investigation where the culprit is determined before evidence is presented.

The user should not be able to identify the culprit simply by guessing. They should have to examine evidence and discover contradictions.

## 1.3 Product Objectives

1. Create an immersive detective investigation experience.
2. Generate unique mysteries using Gemini.
3. Produce logically consistent evidence.
4. Make investigations interactive rather than passive.
5. Allow users to solve mysteries independently.
6. Provide an explanation of the correct answer after submission.
7. Deliver a fast, responsive and reliable experience.
8. Support future expansion into multiplayer investigations and advanced AI-generated media.

---

# 2. TECHNOLOGY STACK

## 2.1 Frontend

* React.js
* Vite
* JavaScript (ES6+)
* Tailwind CSS
* React Router
* Axios
* Framer Motion
* Lucide React

Use reusable React components and a modular folder structure.

## 2.2 Backend

* Node.js
* Express.js
* JavaScript
* REST API architecture
* JWT authentication
* Google Gemini SDK

## 2.3 Database

MongoDB with Mongoose ODM.

The database should store:

* User accounts.
* Investigation records.
* Suspect profiles.
* Evidence metadata.
* Investigation progress.
* Submitted verdicts.
* Investigation results.

## 2.4 Artificial Intelligence

Primary AI provider: Google Gemini.

The Gemini API must be accessed exclusively through the backend.

Never expose API keys or sensitive AI configuration in frontend code.

The AI integration should use structured JSON responses wherever possible.

## 2.5 Additional Services

The architecture should support:

* Cloudinary or equivalent for generated media storage.
* Redis for optional caching and rate limiting.
* MongoDB indexes for optimized queries.
* A background job system for long-running AI generation.

These integrations should remain optional for the initial MVP unless required by implementation constraints.

---

# 3. DESIGN SYSTEM & VISUAL IDENTITY

## 3.1 Overall Design Philosophy

The entire website must resemble a futuristic criminal investigation room.

Visual inspiration:

* Digital forensic investigation laboratories.
* Cybersecurity operation centers.
* Detective investigation boards.
* Dark surveillance interfaces.
* Futuristic intelligence terminals.

The design must feel premium, mysterious, immersive and professional.

Avoid making it look like a generic AI SaaS dashboard.

## 3.2 Color Palette

The primary combination is NEON GREEN + BLACK.

| Element               | Color   |
| --------------------- | ------- |
| Primary background    | #050806 |
| Secondary background  | #0A100D |
| Card background       | #0D1511 |
| Elevated panels       | #111C16 |
| Primary neon green    | #39FF14 |
| Secondary green       | #00E676 |
| Muted green           | #1B6B35 |
| Primary text          | #E8F5E9 |
| Secondary text        | #91A397 |
| Muted text            | #637369 |
| Borders               | #1B3324 |
| Danger / Warning      | #FF4545 |
| Investigation warning | #FFC857 |

## 3.3 Glow Effects

IMPORTANT DESIGN RULE:

**Neon glow must be controlled and intentional. Do not make the entire interface glow.**

Glow should primarily be applied to:

1. Button text.
2. Button outlines.
3. Active navigation indicators.
4. Selected investigation elements.
5. Important status indicators.
6. Interactive icons when active.
7. Focused input borders.

Example button styling:

* Transparent or dark background.
* Neon green outline.
* Neon green text.
* Subtle green text shadow.
* Subtle green border shadow on hover.
* Smooth transition.

Avoid excessive glow on:

* Paragraphs.
* Large headings.
* Card backgrounds.
* Entire page sections.
* Normal descriptive text.

The overall interface should remain dark, clean and readable.

## 3.4 Typography

Recommended fonts:

* Headings: Space Grotesk.
* Body: Inter.
* Investigation data: JetBrains Mono.

Typography should establish a clear hierarchy.

Use uppercase labels and letter spacing for technical metadata.

Example:

CASE ID: MR-2026-001

STATUS: INVESTIGATION ACTIVE

EVIDENCE COLLECTED: 08/12

## 3.5 Design Principles

* Dark-first design.
* Minimal visual clutter.
* Strong visual hierarchy.
* Consistent spacing.
* Smooth micro-interactions.
* Subtle animations.
* Responsive layouts.
* Accessible contrast.
* Professional investigation-room aesthetics.

---

# 4. APPLICATION STRUCTURE

The website should contain the following primary pages.

## 4.1 Landing Page

Purpose: Introduce the product and encourage users to create an investigation.

Sections:

**A. Navigation Bar**

* AI Mystery Room logo.
* Home.
* How It Works.
* Create Mystery.
* Login / Profile.

**B. Hero Section**

Main heading:

"EVERY CRIME HAS A STORY. EVERY STORY HAS A SECRET."

Supporting description:

"Enter the investigation room. Examine the evidence. Connect the dots. Find the truth."

Primary CTA:

[ INITIATE INVESTIGATION ]

Secondary CTA:

[ EXPLORE HOW IT WORKS ]

**C. How It Works**

Display three steps:

1. CREATE A MYSTERY
   Submit your story or scenario.

2. INVESTIGATE
   Examine suspects, evidence and hidden clues.

3. FIND THE CULPRIT
   Submit your verdict and uncover the truth.

**D. Features Section**

Highlight:

* AI-generated mysteries.
* Dynamic evidence.
* Multiple suspects.
* Logical investigations.
* Interactive investigation room.

**E. Footer**

* About.
* Privacy Policy.
* Terms.
* Contact.

## 4.2 Create Investigation Page

This is where the user submits the story.

Components:

**Scenario Input**

A large text area where users describe an incident.

Example placeholder:

"Describe an incident, suspicious event, disappearance, murder mystery, theft or any fictional situation you want investigated..."

**Mystery Configuration**

Allow users to select:

Difficulty:

* Easy.
* Medium.
* Hard.
* Expert.

Investigation Type:

* Murder.
* Theft.
* Disappearance.
* Cybercrime.
* Corporate Espionage.
* General Mystery.

Number of Suspects:

* 3.
* 4.
* 5.
* 6.

Investigation Complexity:

* Short.
* Standard.
* Advanced.

Provide sensible defaults so users can start without configuring everything.

**Generate Button**

Label:

[ GENERATE CASE ]

When clicked:

1. Validate the scenario.
2. Send the request to the backend.
3. Display a generation interface.
4. Generate the mystery.
5. Validate the AI response.
6. Save the investigation.
7. Redirect the user to the investigation room.

The frontend must never directly communicate with Gemini.

## 4.3 Investigation Loading Screen

Do not show a generic loading spinner.

Create an immersive investigation initialization experience.

Display progressive status messages:

* ANALYZING INCIDENT...
* IDENTIFYING POSSIBLE SUSPECTS...
* ESTABLISHING TIMELINE...
* GENERATING FORENSIC EVIDENCE...
* CROSS-VERIFYING TESTIMONIES...
* SECURING INVESTIGATION FILE...

These messages must reflect actual backend progress where possible.

Do not falsely imply that an operation has completed.

Use skeleton loaders and a progress indicator.

If generation takes longer than expected, provide an informative status message.

---

# 5. THE INVESTIGATION ROOM

This is the most important page in the entire application.

It should feel like an interactive detective investigation workspace.

## 5.1 Layout

Use a desktop-first investigation layout that adapts to smaller screens.

Recommended structure:

**LEFT SIDEBAR**

* Case Overview.
* Suspects.
* Evidence.
* Timeline.
* Investigation Notes.
* Submit Verdict.

**MAIN CONTENT AREA**

Displays the selected investigation section.

**RIGHT INFORMATION PANEL**

Displays relevant context:

* Case status.
* Evidence collected.
* Important discoveries.
* Investigation statistics.

On mobile, convert the sidebars into collapsible navigation panels.

## 5.2 Case Overview

Display:

* Case title.
* Case ID.
* Incident description.
* Incident location.
* Incident date and time.
* Victim information, if applicable.
* Investigation difficulty.
* Number of suspects.
* Current investigation status.

Example:

CASE: THE MIDNIGHT DISAPPEARANCE

LOCATION: BLACKWOOD MANSION

STATUS: ACTIVE INVESTIGATION

SUSPECTS IDENTIFIED: 4

EVIDENCE AVAILABLE: 12

## 5.3 Suspect Profiles

Every suspect must have an individual profile.

Information:

* Full name.
* Age.
* Occupation.
* Photograph or AI-generated portrait.
* Relationship with the victim.
* Possible motive.
* Initial statement.
* Claimed alibi.
* Known connections.

Each profile should have a dedicated detail view.

IMPORTANT:

The actual culprit must not be identified in the visible suspect information.

Suspect profiles must contain realistic information without directly revealing the answer.

## 5.4 Evidence Room

Users must be able to explore different evidence categories.

Evidence types:

1. WhatsApp Messages.
2. CCTV Recordings.
3. Photographs.
4. Audio Recordings.
5. Witness Statements.
6. Forensic Reports.
7. Documents.
8. Call Logs.
9. Digital Records.
10. Physical Evidence.

Every evidence item must have:

* Unique evidence ID.
* Evidence title.
* Evidence category.
* Description.
* Date and time.
* Source.
* Relevant suspect connections.
* Content or media reference.
* Investigation significance.

### A. WhatsApp Messages

Create a realistic WhatsApp-style conversation interface.

Include:

* Sender.
* Receiver.
* Message content.
* Timestamps.
* Message sequence.
* Delivery/read indicators where appropriate.

Messages must be fictional.

The interface should resemble a digital forensic extraction rather than a direct copy of the WhatsApp application.

### B. CCTV Recordings

CCTV evidence should contain:

* Camera ID.
* Location.
* Recording date.
* Timestamp.
* Recording description.
* Relevant observations.
* Optional generated video or image.

If actual video generation is unavailable, generate a CCTV-style visual or a structured recording transcript.

Never represent a static image as an actual video recording.

### C. Photographs

Display photographs in an evidence viewer.

Features:

* Image zoom.
* Full-screen preview.
* Evidence metadata.
* Image description.
* Associated timestamp.

### D. Audio Recordings

Support audio playback where actual audio files exist.

Otherwise, provide a transcript with:

* Recording source.
* Timestamp.
* Speaker information.
* Transcribed conversation.

### E. Forensic Reports

Display structured reports containing:

* Examination details.
* Findings.
* Relevant observations.
* Possible interpretations.

Do not present fictional forensic findings as real-world scientific conclusions.

## 5.5 Investigation Timeline

Create a chronological timeline of relevant events.

Example:

08:30 PM — Victim arrives at the mansion.

09:15 PM — Suspect A enters the building.

09:45 PM — CCTV camera records unusual activity.

10:05 PM — Victim's phone receives a message.

10:30 PM — Incident discovered.

Users should be able to compare this timeline against suspect alibis.

## 5.6 Investigation Notes

Allow users to create private investigation notes.

Features:

* Add notes.
* Edit notes.
* Delete notes.
* Associate notes with suspects.
* Associate notes with evidence.

Notes should persist when the user refreshes the page.

---

# 6. AI MYSTERY GENERATION ENGINE

This is the application's core intelligence.

The AI must create a complete investigation rather than randomly generating disconnected evidence.

## 6.1 Generation Architecture

Use a structured generation pipeline.

STEP 1: SCENARIO ANALYSIS

Gemini analyzes the submitted scenario and identifies:

* Incident type.
* Main characters.
* Setting.
* Possible motivations.
* Relevant events.
* Mystery opportunities.

STEP 2: SECRET SOLUTION GENERATION

Generate the actual solution internally.

Determine:

* Culprit.
* Motive.
* Method.
* Opportunity.
* Exact sequence of events.
* Supporting facts.
* Explanation of the crime.

This solution becomes the immutable ground truth of the investigation.

STEP 3: SUSPECT GENERATION

Generate multiple suspects.

Each suspect must have:

* A believable background.
* A potential motive or suspicious connection.
* A believable alibi.
* Distinct characteristics.
* A relationship with the incident.

Include red herrings, but do not make every suspect equally suspicious without reason.

STEP 4: TIMELINE GENERATION

Create a chronological sequence of events.

Ensure that every event is consistent with the actual solution.

STEP 5: EVIDENCE GENERATION

Generate evidence based on the already-established truth.

Evidence should support or challenge different suspect theories.

STEP 6: LOGICAL VALIDATION

Validate:

* Timeline consistency.
* Alibi consistency.
* Suspect relationships.
* Evidence timestamps.
* Culprit identity.
* Contradictions.
* Whether the culprit can reasonably be identified.

STEP 7: FINAL INVESTIGATION STORAGE

Store the investigation and its secret solution securely.

Only then expose the public investigation data to the frontend.

## 6.2 Critical AI Rules

The following rules are mandatory.

1. Exactly one actual culprit per investigation.
2. The culprit must be determined before evidence generation.
3. All evidence must follow the established truth.
4. No evidence should contradict established facts accidentally.
5. Every investigation must be solvable.
6. There must be enough evidence to distinguish the culprit.
7. Red herrings must be explainable.
8. The solution must have a logical explanation.
9. The AI must not reveal the culprit in public API responses.
10. The investigation must not change its culprit during subsequent interactions.

## 6.3 Evidence Fairness

The mystery must be challenging but fair.

The culprit should be identifiable through at least two independent evidence connections.

For example:

* A suspect claims to have left at 9:00 PM.
* CCTV establishes that the suspect remained inside until 9:30 PM.
* A message sent at 9:20 PM confirms knowledge of an event that supposedly had not yet occurred.

The contradiction should have a logical explanation connected to the actual solution.

Do not rely on arbitrary coincidences.

## 6.4 AI Structured Output

Gemini must generate data using a predefined JSON schema.

Conceptual structure:

{
"case": {},
"solution": {},
"suspects": [],
"timeline": [],
"evidence": [],
"validation": {}
}

Use schema-constrained JSON output when supported.

Validate all responses with backend validation before saving.

If the response is invalid:

1. Attempt controlled repair.
2. Retry generation when appropriate.
3. Reject repeatedly invalid responses.
4. Return a meaningful error to the frontend.

Never save incomplete investigations as successfully generated cases.

---

# 7. GEMINI AI INTEGRATION

## 7.1 Backend Integration

Create a dedicated AI service.

Suggested location:

server/services/geminiService.js

Responsibilities:

* Initialize Gemini.
* Send structured prompts.
* Generate investigations.
* Parse responses.
* Handle API errors.
* Enforce token limits.
* Handle timeouts.
* Retry temporary failures.

## 7.2 Prompt Engineering

Maintain separate prompts for:

* Scenario analysis.
* Mystery solution generation.
* Suspect generation.
* Evidence generation.
* Investigation validation.
* Final verdict explanation.

Prompts should be stored separately from route handlers.

Suggested structure:

server/prompts/
scenarioPrompt.js
solutionPrompt.js
suspectPrompt.js
evidencePrompt.js
validationPrompt.js
verdictPrompt.js

## 7.3 Performance Optimization

The AI must not perform unnecessary sequential requests.

Recommended approach:

* Use one generation request for related structured data when output size allows.
* Otherwise, use a small number of logically separated requests.
* Parallelize independent tasks where safe.
* Validate the final combined result.
* Use bounded retries.
* Avoid repeatedly regenerating already-valid data.

Prefer a fast Gemini model that supports the required structured output and quality.

The model name must be configurable through environment variables.

Do not hardcode model names throughout the application.

## 7.4 AI Reliability

Implement:

* Request timeouts.
* Retry with exponential backoff.
* Invalid JSON recovery.
* Schema validation.
* Duplicate generation protection.
* Generation status tracking.
* Failure logging.

If Gemini is temporarily unavailable, show a recoverable error.

Do not create fake investigations as a fallback without clearly distinguishing them from AI-generated cases.

---

# 8. CULPRIT SELECTION & VERDICT SYSTEM

Once the user finishes investigating, they can submit their final answer.

## 8.1 Verdict Interface

Display all suspects with their names and photographs.

Prompt:

"WHO DO YOU BELIEVE IS RESPONSIBLE?"

Allow exactly one suspect selection.

Include an optional explanation field:

"Explain which evidence led you to this conclusion."

Button:

[ SUBMIT FINAL VERDICT ]

## 8.2 Submission Rules

* One final verdict per investigation by default.
* Do not expose the correct answer before submission.
* Validate suspect ID against the investigation.
* Prevent duplicate submissions.
* Store the submitted verdict.

## 8.3 Result Screen

After submission, reveal:

* Correct or incorrect verdict.
* Actual culprit.
* Motive.
* Method.
* Timeline of events.
* Critical evidence.
* Why other suspects were innocent.
* Explanation of misleading clues.

Display the outcome in an immersive case-closure interface.

Example:

CASE CLOSED

VERDICT: CORRECT

CULPRIT IDENTIFIED: ALEX MORGAN

INVESTIGATION ACCURACY: 100%

The score must reflect actual evidence analysis rather than simply guessing the culprit.

## 8.4 Scoring System

Suggested scoring:

| Action                                       | Points |
| -------------------------------------------- | -----: |
| Correct culprit identification               |     60 |
| Correct explanation of motive                |     15 |
| Identifying critical evidence                |     15 |
| Correctly identifying timeline contradiction |     10 |

Total: 100 points.

The scoring system should be configurable.

---

# 9. DATABASE ARCHITECTURE

Use MongoDB with Mongoose.

Suggested collections:

## 9.1 Users

{
"_id": "ObjectId",
"username": "string",
"email": "string",
"passwordHash": "string",
"createdAt": "Date",
"updatedAt": "Date"
}

Never store plain-text passwords.

## 9.2 Investigations

{
"_id": "ObjectId",
"userId": "ObjectId",
"caseId": "string",
"title": "string",
"scenario": "string",
"difficulty": "string",
"investigationType": "string",
"status": "generating | active | completed | failed",
"publicData": {},
"secretSolution": {},
"createdAt": "Date",
"updatedAt": "Date"
}

IMPORTANT:

secretSolution must be protected from public API serialization.

It must never be returned through ordinary investigation endpoints.

## 9.3 Suspects

{
"_id": "ObjectId",
"investigationId": "ObjectId",
"name": "string",
"age": "number",
"occupation": "string",
"relationship": "string",
"motive": "string",
"alibi": "string",
"description": "string",
"imageUrl": "string"
}

## 9.4 Evidence

{
"_id": "ObjectId",
"investigationId": "ObjectId",
"evidenceId": "string",
"title": "string",
"category": "string",
"description": "string",
"content": {},
"timestamp": "Date",
"mediaUrl": "string",
"relatedSuspects": ["ObjectId"]
}

## 9.5 Verdicts

{
"_id": "ObjectId",
"investigationId": "ObjectId",
"userId": "ObjectId",
"selectedSuspectId": "ObjectId",
"explanation": "string",
"isCorrect": "boolean",
"score": "number",
"submittedAt": "Date"
}

## 9.6 Investigation Notes

{
"_id": "ObjectId",
"investigationId": "ObjectId",
"userId": "ObjectId",
"content": "string",
"relatedEvidenceId": "ObjectId",
"createdAt": "Date",
"updatedAt": "Date"
}

Use appropriate indexes for userId, caseId, investigationId and frequently queried fields.

For an MVP, suspect and evidence subdocuments may also be embedded within investigations. Choose the data model that best supports atomic generation and efficient retrieval.

---

# 10. BACKEND API SPECIFICATION

Base URL:

/api/v1

## Authentication

POST /auth/register

Register a new account.

POST /auth/login

Authenticate the user.

GET /auth/me

Retrieve authenticated user information.

## Investigations

POST /investigations

Generate a new investigation.

Request:

{
"scenario": "A businessman disappears from his locked office.",
"difficulty": "medium",
"type": "disappearance",
"suspectCount": 4
}

Response:

{
"success": true,
"investigationId": "case_id",
"status": "generating"
}

GET /investigations

Retrieve the user's investigations.

GET /investigations/:id

Retrieve public investigation information.

GET /investigations/:id/status

Retrieve generation status.

DELETE /investigations/:id

Delete an investigation owned by the authenticated user, subject to deletion rules.

## Suspects

GET /investigations/:id/suspects

Retrieve suspect profiles.

GET /investigations/:id/suspects/:suspectId

Retrieve individual suspect details.

## Evidence

GET /investigations/:id/evidence

Retrieve evidence list.

GET /investigations/:id/evidence/:evidenceId

Retrieve individual evidence.

## Notes

POST /investigations/:id/notes

Create investigation notes.

GET /investigations/:id/notes

Retrieve notes.

PUT /investigations/:id/notes/:noteId

Update notes.

DELETE /investigations/:id/notes/:noteId

Delete notes.

## Verdict

POST /investigations/:id/verdict

Submit the final verdict.

Request:

{
"suspectId": "suspect_object_id",
"explanation": "The CCTV footage contradicts the suspect's alibi."
}

GET /investigations/:id/result

Retrieve the result only after verdict submission.

All protected endpoints must verify authentication and resource ownership.

Return consistent response structures and appropriate HTTP status codes.

---

# 11. SECURITY REQUIREMENTS

Security is mandatory.

Implement:

1. Password hashing using bcrypt or Argon2.
2. JWT-based authentication.
3. Protected routes.
4. Input validation.
5. Rate limiting.
6. CORS configuration.
7. Helmet security headers.
8. Request size limits.
9. MongoDB query sanitization.
10. Environment-based secrets.
11. API key protection.
12. Authorization checks for every investigation.
13. Protection against duplicate submissions.
14. Secure media upload validation.

Most importantly:

**The culprit and secret solution must remain on the server until the user submits their verdict.**

Do not include hidden culprit information in:

* Frontend state.
* Public JSON responses.
* HTML.
* Browser-accessible configuration.
* Public evidence metadata.

AI-generated images and documents should be treated as untrusted content and validated before rendering.

---

# 12. PERFORMANCE & RELIABILITY

The application should feel fast even when AI generation requires additional processing time.

## 12.1 Performance Targets

These are initial engineering targets, not guaranteed AI-provider response times.

| Operation                   | Target               |
| --------------------------- | -------------------- |
| Initial page load           | Under 2.5 seconds    |
| Normal API response         | Under 500 ms         |
| Investigation retrieval     | Under 500 ms         |
| UI navigation               | Under 200 ms         |
| AI investigation generation | Target 10–30 seconds |
| Verdict submission          | Under 1 second       |

AI generation time depends on model availability, output size and external API latency.

Do not block the entire application while one investigation is generating.

## 12.2 Reliability

Implement:

* Centralized error handling.
* Structured logging.
* API timeout handling.
* Database connection monitoring.
* AI request tracking.
* Background generation jobs.
* Generation status persistence.
* Retry protection.
* Graceful failure states.

If the user refreshes during generation, they should be able to return to the same investigation.

## 12.3 Generation Status

Possible statuses:

* pending.
* analyzing.
* generating_solution.
* generating_suspects.
* generating_evidence.
* validating.
* completed.
* failed.

The frontend should poll the status endpoint or use Server-Sent Events when appropriate.

For the initial MVP, polling is sufficient.

---

# 13. RESPONSIVENESS & ACCESSIBILITY

Support:

* Desktop.
* Laptop.
* Tablet.
* Mobile.

Desktop should provide the complete investigation workspace.

Mobile should use collapsible navigation and vertically stacked content.

Additional requirements:

* Keyboard-accessible controls.
* Visible focus states.
* Readable text contrast.
* Image alternative text.
* Responsive evidence viewers.
* Reduced-motion support.

---

# 14. PROJECT FOLDER STRUCTURE

Recommended structure:

AI-MYSTERY-ROOM/

├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   ├── evidence/
│       │   ├── suspects/
│       │   └── investigation/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── CreateInvestigation.jsx
│       │   ├── InvestigationRoom.jsx
│       │   └── Result.jsx
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       ├── styles/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   ├── geminiService.js
│   │   ├── investigationService.js
│   │   ├── evidenceService.js
│   │   └── validationService.js
│   ├── prompts/
│   ├── jobs/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── docs/
│
├── .env.example
├── .gitignore
├── package.json
└── SPEC.md

The folder structure may evolve, but responsibilities must remain modular.

---

# 15. MVP DEVELOPMENT PRIORITIES

Do not attempt to build every advanced feature simultaneously.

Build in the following order.

## PHASE 1: FOUNDATION

* Initialize MERN project.
* Configure MongoDB.
* Configure Express.
* Configure React and Vite.
* Establish API communication.
* Implement the dark neon-green design system.
* Build the landing page.
* Build the navigation structure.

DELIVERABLE: Functional website foundation.

## PHASE 2: AI INTEGRATION

* Configure Gemini API.
* Build prompt architecture.
* Implement scenario analysis.
* Generate secret solutions.
* Generate suspects.
* Generate evidence.
* Generate timelines.
* Implement logical validation.
* Save investigations in MongoDB.

DELIVERABLE: Working AI investigation generator.

## PHASE 3: INVESTIGATION ROOM

* Build case overview.
* Build suspect profiles.
* Build evidence room.
* Build WhatsApp-style conversations.
* Build CCTV evidence viewer.
* Build photograph viewer.
* Build investigation timeline.
* Build investigation notes.

DELIVERABLE: Fully interactive investigation environment.

## PHASE 4: VERDICT SYSTEM

* Build suspect selection.
* Implement verdict submission.
* Validate answers.
* Reveal the actual culprit.
* Generate final explanations.
* Implement scoring.

DELIVERABLE: Complete mystery-solving experience.

## PHASE 5: AUTHENTICATION & RELIABILITY

* Implement registration and login.
* Implement user-specific investigations.
* Secure secret solutions.
* Add error handling.
* Add request validation.
* Add rate limiting.
* Implement generation recovery.
* Optimize database queries.

DELIVERABLE: Reliable application ready for testing.

## PHASE 6: POLISH & TESTING

* Responsive design.
* UI animations.
* Loading states.
* Error states.
* Performance optimization.
* Security testing.
* AI consistency testing.
* End-to-end testing.

DELIVERABLE: MVP ready for deployment.

---

# 16. TESTING REQUIREMENTS

Testing must cover both software correctness and AI-generated mystery quality.

## 16.1 Functional Testing

Verify:

* Users can submit scenarios.
* Investigations generate successfully.
* Suspects appear correctly.
* Evidence loads correctly.
* Timeline is accessible.
* Notes persist.
* Verdicts can be submitted.
* Results reveal the correct culprit.
* Users cannot access another user's private investigation.

## 16.2 AI Quality Testing

For every generated mystery, verify:

1. Exactly one culprit exists.
2. The culprit belongs to the suspect list.
3. All evidence is consistent with the solution.
4. Timestamps are chronologically valid.
5. Suspect alibis are internally consistent.
6. The mystery is reasonably solvable.
7. There is sufficient evidence to identify the culprit.
8. Red herrings have logical explanations.
9. The final explanation matches the evidence.

Build a collection of test scenarios and use them for regression testing.

## 16.3 Performance Testing

Test:

* Multiple concurrent users.
* Multiple simultaneous AI generations.
* Slow Gemini responses.
* Gemini API failures.
* MongoDB disconnections.
* Network interruptions.
* Duplicate requests.

---

# 17. FUTURE FEATURES

These features are NOT required for the initial MVP.

Keep the architecture extensible enough to support them.

### 17.1 AI-Generated Media

Generate:

* Realistic suspect photographs.
* CCTV-style images.
* Crime-scene photographs.
* Documents.
* Audio recordings.
* Short video clips.

Use dedicated image/audio/video generation services where necessary.

Gemini should orchestrate and describe the media requirements, but do not assume the text-generation model itself can generate every media format.

### 17.2 Interactive AI Detective Assistant

Allow users to ask questions about discovered evidence.

The AI should act as an investigation assistant without revealing the culprit.

It must only use public investigation information and must not leak the secret solution.

### 17.3 Multiplayer Investigation

Allow multiple users to investigate the same case.

### 17.4 Advanced Investigation Board

Allow users to:

* Pin evidence.
* Connect clues.
* Draw relationships.
* Build suspect theories.
* Create their own investigation map.

### 17.5 Leaderboards

Introduce:

* Fastest investigation.
* Highest investigation score.
* Most accurate detectives.
* Global rankings.

### 17.6 Community Mysteries

Allow users to publish and share their own generated investigations.

---

# 18. IMPORTANT DEVELOPMENT RULES FOR CODEX

These instructions take priority over implementation convenience.

1. Treat this SPEC.md as the single source of truth.
2. Do not randomly change the project's design language.
3. Do not introduce unnecessary technologies.
4. Do not build unrelated features.
5. Use reusable components.
6. Maintain modular backend architecture.
7. Keep Gemini integration isolated.
8. Never expose API keys.
9. Never expose the secret culprit before verdict submission.
10. Validate all AI-generated data.
11. Never trust raw Gemini output.
12. Never silently ignore backend errors.
13. Ensure responsive layouts.
14. Maintain consistent neon-green and black styling.
15. Avoid excessive visual glow.
16. Do not use placeholder functionality where a working implementation is required.
17. Do not mark a feature complete until it has been tested.
18. Update documentation when architectural decisions change.

## 18.1 Specification Change Management

If implementation requires a change to this specification:

* Identify the requirement that needs modification.
* Explain why the change is necessary.
* Update SPEC.md.
* Ensure dependent components remain consistent.
* Do not silently introduce architectural changes.

The specification must remain synchronized with the actual application.

---

# 19. DEFINITION OF DONE

The MVP will be considered complete when all the following conditions are satisfied:

[ ] Landing page is fully functional.

[ ] Users can create investigations from custom scenarios.

[ ] Gemini successfully generates complete investigations.

[ ] Every investigation has exactly one predetermined culprit.

[ ] Suspect profiles are generated correctly.

[ ] Evidence is logically connected to the investigation.

[ ] WhatsApp-style conversations work.

[ ] CCTV evidence can be displayed.

[ ] Photographs and forensic reports can be viewed.

[ ] Investigation timelines work.

[ ] Investigation notes persist.

[ ] Users can select and submit a culprit.

[ ] Correct answers are revealed only after submission.

[ ] Final explanations match the actual investigation.

[ ] Secret solutions are never exposed through public APIs.

[ ] User authentication works.

[ ] Database persistence works.

[ ] Error handling and retry mechanisms work.

[ ] The application is responsive.

[ ] The application maintains the specified visual identity.

[ ] Core functional and AI consistency tests pass.

---

# 20. FINAL PRODUCT STANDARD

AI Mystery Room must not feel like a simple website that sends a prompt to an AI and displays its response.

It must feel like a real digital investigation environment powered by artificial intelligence.

The user should experience three distinct stages:

**STAGE 1 — THE INCIDENT**

The user creates a mystery and the AI establishes the investigation.

**STAGE 2 — THE INVESTIGATION**

The user explores suspects, examines evidence, discovers contradictions and develops theories.

**STAGE 3 — THE VERDICT**

The user identifies the culprit, submits their conclusion and discovers the complete truth.

The most important product qualities are:

1. Logical consistency.
2. Immersive user experience.
3. Reliable AI generation.
4. Interesting and solvable mysteries.
5. Fast performance.
6. Secure investigation data.
7. Beautiful dark-themed interface.

**THE GOLDEN RULE:**

A mystery is only as good as its evidence.

Prioritize investigation logic and evidence consistency over generating large amounts of random content.

The application should create mysteries that make users think, question their assumptions and genuinely feel like detectives.

---

# END OF MASTER SPECIFICATION

Document: AI Mystery Room
Version: 1.0
Status: Development Specification
Authority: Single Source of Truth
