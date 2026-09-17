<div align="center">

# 🕵️ Detective Rewind

### The mystery only continues if you truly understand what you just read.

**An AI reading tutor disguised as a detective game — where wrong answers don't end the story, they rewind it.**

[![Made with React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)](#-tech-stack)
[![AI](https://img.shields.io/badge/AI-NVIDIA%20Nemotron%20via%20OpenRouter-76B900?logo=nvidia&logoColor=white)](#-the-ai-engine)
[![Status](https://img.shields.io/badge/Status-Hackathon%20Prototype-orange)](#-project-status)
[![License](https://img.shields.io/badge/License-MIT-blue)](#-license)


</div>

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [How It Works](#-how-it-works)
- [What Makes It Different](#-what-makes-it-different)
- [The AI Engine](#-the-ai-engine)
- [Game Progression](#-game-progression)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Roadmap](#-roadmap)
- [Project Status](#-project-status)
- [Target Learners](#-target-learners)
- [License](#-license)

---

## 🎯 The Problem

Most reading apps can tell you *that* an answer is wrong. Very few can tell you **why**.

A learner might miss a question because they:

| Struggle | What it actually looks like |
|---|---|
| 🔍 Missed evidence | Skimmed past the key sentence |
| 🧩 Misunderstood a line | Read it, but not correctly |
| 📚 Hit a vocabulary wall | Didn't know a critical word |
| 🔗 Failed to connect clues | Understood parts, not the whole |
| 💭 Struggled to infer | Couldn't read between the lines |
| 🎭 Misjudged motivation | Missed *why* a character acted |

A flashing **"Try Again"** doesn't fix any of these. It just repeats the failure.

> **Detective Rewind asks a better question: what went wrong, what does this learner need, and what happens next?**

---

## 💡 Our Solution

Detective Rewind turns comprehension practice into a detective investigation, where reading carefully *is* the gameplay:

| | |
|---|---|
| 📖 Interactive mystery storytelling | 🧠 AI-powered comprehension analysis |
| 🎙️ Oral reading practice | 🔄 Adaptive "Rewind" interventions |
| 🔎 Evidence-based reasoning | 📚 Vocabulary learned in context |
| 📈 Ongoing learner modeling | 🎮 Progressive, unlockable case levels |
| 👩‍🏫 Tutor-facing learning insights | 🧩 Learning-error pattern tracking |

The product feels like a game. Under the hood, it behaves like an adaptive reading tutor.

---

## 🔄 How It Works

```text
READ → LISTEN & ANALYZE → UNDERSTAND → ANSWER
                                          │
                          ┌───────────────┴───────────────┐
                          │                                │
                      ✅ Correct                       ❌ Struggle
                          │                                │
                    Unlock Clue                    AI Diagnoses Why
                          │                                │
                          │                            🔄 REWIND
                          │                                │
                          │                     Targeted Micro-Lesson
                          │                                │
                          │                             Retry
                          │                                │
                          └──────────────► Measure ◄───────┘
                                              │
                                      Adapt Next Challenge
                                              │
                                          Solve Case
```

### The Rewind Loop, in practice

> **Learner:** *"The witness left because he was angry."*
> **Story evidence:** the witness actually left because he was **afraid**.

Instead of a red ❌:

```text
Response Analyzed → Difficulty Identified: "Missed textual evidence"
      → Rewind Triggered → Relevant Sentence Highlighted
      → Guided Explanation → Retry → Evidence Connected ✅
```

The mistake becomes the lesson — not a dead end.

---

## 🧠 What Makes It Different

<table>
<tr><td width="40px">🔄</td><td><b>AI Rewind</b><br/>Wrong answers trigger diagnosis → targeted support → guided retry, instead of a simple "wrong" flag.</td></tr>
<tr><td>🎙️</td><td><b>Reading Fluency Built In</b><br/>Witness statements are read aloud, feeding accuracy and confidence signals into the learner model.</td></tr>
<tr><td>🔎</td><td><b>Evidence-Based Comprehension</b><br/>Answers are evaluated against actual story evidence, not just matched to a key.</td></tr>
<tr><td>📚</td><td><b>Vocabulary in Context</b><br/>New words appear naturally inside clues and evidence, then resurface later for reinforcement.</td></tr>
<tr><td>🧩</td><td><b>Learning-Error Fingerprint</b><br/>Tracks recurring patterns (missed evidence, weak inference, vocabulary gaps) across sessions, not just single mistakes.</td></tr>
<tr><td>📈</td><td><b>Adaptive Learner Model</b><br/>Fluency, comprehension, inference, vocabulary, and persistence are tracked to shape future challenge difficulty.</td></tr>
</table>

---

## 🤖 The AI Engine

Detective Rewind runs its reasoning layer on **NVIDIA Nemotron via OpenRouter**. The model isn't just generating story text — it's making pedagogical decisions:

```
comprehension evaluation · inference analysis · evidence linking
vocabulary assessment · learning-error classification
intervention selection · rewind explanation · adaptive difficulty
tutor-facing insight generation
```

### Structured, validated AI output

```text
Learner Interaction → OpenRouter → NVIDIA Nemotron → JSON Response
        → Parse → Validate → Update Learner State → UI / Rewind / Insights
```

```json
{
  "strength": "Vocabulary in context",
  "primary_skill": "Evidence-based inference",
  "observed_difficulty": "Missed textual evidence",
  "evidence": "The learner selected an answer without connecting it to the witness statement.",
  "intervention": "Guided rereading with evidence highlighting",
  "learner_response": "Correct reasoning after intervention",
  "recommended_activity": "Practice another evidence-based inference",
  "ai_confidence": 0.91
}
```

If a response fails to parse, the app falls back to controlled default behavior — learners never see a raw error.

### Child-safe by design

- Controlled story structures with fixed learning objectives
- Reading-level and vocabulary boundaries enforced by prompt design
- Structured, closed-ended interaction — not an open-ended chatbot
- AI supports the lesson; it never free-talks with the child

---

## 🎮 Game Progression

Cases unlock sequentially, keeping the focus on mastery rather than competition:

```
Level 01 → The Midnight Library
Level 02 → The Vanishing Painting
Level 03 → The Clockwork Secret
Level 04 → The Silent Witness
Level 05 → The Final Case
```

Rewards are earned through **learning behavior**, not speed:

`🔎 Evidence Found` · `📖 Careful Reader` · `💡 Strong Inference` · `📚 Word Mastery` · `🔄 Rewind Recovery` · `⭐ Case Solved`

### Sample Tutor Insight (post-session)

```text
STRENGTH            Vocabulary in context
PRIMARY SKILL       Evidence-based inference
DIFFICULTY          Missed textual evidence
INTERVENTION        Guided rereading with evidence highlighting
OUTCOME             Correct reasoning after intervention
NEXT ACTIVITY       Practice another evidence-based inference
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, JavaScript, HTML5, CSS, fully responsive |
| **AI Reasoning** | OpenRouter → NVIDIA Nemotron |
| **State & Storage** | Browser session state, LocalStorage persistence, no forced account creation |
| **Browser Capabilities** | Microphone / speech interaction |

---

## 🏛️ Architecture

```text
┌────────────────────────────┐
│          React UI          │   Home · Cases · Reading · Rewind
│                            │   Clues · Progress · Insights
└──────────────┬─────────────┘
               ↓
┌────────────────────────────┐
│       Learner State        │   Fluency · Comprehension · Vocabulary
│                            │   Error Patterns · Interventions · Progress
└──────────────┬─────────────┘
               ↓
┌────────────────────────────┐
│      AI Service Layer      │   Prompt Construction · OpenRouter Request
│                            │   JSON Parsing · Validation · Fallback
└──────────────┬─────────────┘
               ↓
┌────────────────────────────┐
│      NVIDIA Nemotron       │   Analyze → Explain → Intervene → Adapt
└────────────────────────────┘
```

**AI decision loop:** `Observe → Understand → Identify Difficulty → Intervene → Retry → Measure → Adapt`

---

## ⚙️ Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-username/detective-rewind.git
cd detective-rewind

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Add your OpenRouter API key:
# VITE_OPENROUTER_API_KEY=your_key_here
# VITE_OPENROUTER_MODEL=nvidia/nemotron-...

# 4. Run locally
npm run dev
```

Open `http://localhost:5173` and start your first case.

---

## 🎨 Design Language

Cream / warm off-white backgrounds, deep navy UI elements, and gold/amber investigation accents — evidence cards, case-file layouts, and clue boards, built responsively for `375px → 1920px+`.

> Goal: **a premium AI learning product, disguised as a detective investigation.**

---

## 🚀 Roadmap

- [ ] **Expanded Case Library** — more stories across levels, genres, themes
- [ ] **Deeper Speech Analysis** — richer oral-reading feedback with ASR-uncertainty handling
- [ ] **Personalized Reading Paths** — long-term adaptation from learner history
- [ ] **Multilingual Scaffolding** — optional Tamil (and other) support for concept clarification, English-first
- [ ] **Tutor Dashboards** — evidence-linked learning histories for teachers
- [ ] **Real-World Validation** — pilot testing the rewind loop with learners and tutors

---

## 📌 Project Status

**Prototype — Hackathon Build**

<details>
<summary><b>Completed features</b> (click to expand)</summary>

- [x] Interactive mystery cases
- [x] Reading + oral reading interaction
- [x] Comprehension questions
- [x] Evidence-based reasoning
- [x] AI evaluation + AI Rewind
- [x] Adaptive interventions
- [x] Learner modeling & error-pattern tracking
- [x] Vocabulary in context
- [x] Progressive, locked case levels
- [x] Gamified investigation rewards
- [x] Tutor Action Card / learning insights
- [x] Structured AI JSON handling with validation & fallback
- [x] Fully responsive UI

</details>

---

## 👥 Target Learners

Built primarily for **young English learners, ages ~7–10**, bridging:

```
Basic Reading Practice → Fluency → Comprehension → Inference → Independent Reading
```

---

## 🏁 Hackathon Demo Flow

1. Open a mystery case → read a witness statement aloud
2. Answer a comprehension question — **intentionally get it wrong**
3. Watch AI Rewind trigger: difficulty detected → evidence highlighted → guided retry
4. Unlock the clue after success → see the adaptive next challenge
5. View the Tutor Action Card → unlock the next level

**The hero moment:** *wrong answer → AI understands why → story rewinds → learner gets targeted help → learner succeeds → mystery continues.*

---

## 💬 Closing Thought

> Don't just tell learners they're wrong. **Understand why, help them recover, and let them try again.**

**Read. Rewind. Learn. Solve.**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">

Made with 🔦 for readers who deserve better than "Try Again."

</div>
