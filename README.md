# Ascent AI

# AI Workplace Productivity Assistant

## Project Scope

Build ONE complete, modern, responsive integrated web application called "AI Workplace Productivity Assistant".

- This project is a single unified platform, not multiple apps or unrelated tools.

- It must contain five AI-powered workplace productivity features:

  1. Smart Email Generator

  2. Meeting Notes Summarizer

  3. AI Task Planner / Scheduler

  4. AI Research Assistant

  5. AI Chatbot Interface

The application aims to help professionals automate routine tasks via AI while demonstrating:

- Practical AI implementation

- Strong prompt engineering

- Real-world problem solving

- Responsible AI use

- Modern, clean UI/UX design

---

## 1. Application Structure

Build a professional SaaS-style app with:

- Central dashboard/homepage

- Persistent sidebar navigation on desktop

- Responsive mobile navigation

- Top header bar

- Consistent design system for all modules

- Five integrated AI modules sharing application state where appropriate

- Clear input/output areas with loading, empty, error, and success states

- Editable AI-generated outputs and copy-to-clipboard buttons where relevant

- Visible, professional AI-generated content disclaimer

Design Style:

Clean, modern, professional, academic/presentation ready.

Use minimal animations and decorations. Prioritize usability, clarity and professional presentation.

---

## 2. Dashboard

Landing page includes:

- Application name and short platform overview

- Welcome section

- Quick-access cards for all five AI features

- Recent activity feed showing real user-generated activity

- Productivity overview metrics:

  - Tasks completed

  - Emails generated

  - Meetings summarized

  - Research sessions

- Clear calls to action

- Realistic empty states

- No fabricated results or statistics

Only display metrics generated from actual user activity. When there is no activity, display zero values or an appropriate empty state. Never generate fictional productivity statistics.

---

## 3. Smart Email Generator

Capabilities:

- Generate professional emails from user-provided purpose/context

- Recipient audience options:

  - Client

  - Manager

  - Team

  - Other

- Tone options:

  - Formal

  - Friendly

  - Persuasive

UI:

- Clear input fields

- Output:

  - Subject

  - Email Body

- Both subject and email body must be editable

Controls:

- Generate

- Regenerate

- Make Shorter

- Make More Formal

- Copy

- Edit

AI Prompt Architecture:

ROLE:

Professional workplace communication assistant.

TASK:

Generate context-appropriate workplace emails.

AUDIENCE:

Adapt language and communication style according to the selected recipient.

TONE:

Follow the selected tone: Formal, Friendly or Persuasive.

CONTEXT:

Use the user-provided purpose and context.

CONSTRAINTS:

Do not invent names, facts, dates, commitments, events, qualifications or other information that the user did not provide.

OUTPUT FORMAT:

Return a clear email subject and professional email body.

QUALITY:

The email should be clear, concise, professional, grammatically correct and appropriate for the selected audience and tone.

Keep this prompt logic modular so it can be tested and refined independently.

---

## 4. Meeting Notes Summarizer

Features:

- Large text input for meeting notes

- Clear instructions

- Summarize button

- Loading state

- Input validation

Output structured into:

1. Meeting Summary

2. Key Points

3. Decisions

4. Action Items

5. Deadlines

6. Responsibilities

Action Items should be displayed in a structured table:

Task | Responsible Person | Deadline

Include:

"Add to Task Planner"

When selected, extracted action items should be transferred into the Task Planner.

The system must clearly indicate when information is missing.

Do not invent:

- Action items

- Deadlines

- Responsible people

- Decisions

- Meeting details

AI Prompt Architecture:

ROLE:

Professional meeting analysis assistant.

TASK:

Organize supplied meeting notes into a concise structured summary.

CONTEXT:

Use the provided meeting notes only.

CONSTRAINTS:

Do not fabricate decisions, tasks, people, dates, deadlines or responsibilities.

OUTPUT:

Return the required structured sections.

QUALITY:

Preserve important information while removing unnecessary repetition and improving clarity.

---

## 5. AI Task Planner / Scheduler

Features:

- Add tasks

- Edit tasks

- Delete tasks

- Task title

- Task description

- Deadline

- Urgency

- Importance

- Category

- Active/completed status

AI capabilities:

- Prioritize tasks

- Generate daily plans

- Generate weekly plans

- Provide time-organization suggestions

AI prioritization should consider:

- Urgency

- Importance

- Deadline

- User-provided context

Display priority levels:

- High

- Medium

- Low

The Task Planner must accept tasks transferred from the Meeting Notes Summarizer.

Controls:

- Add Task

- Complete Task

- Edit Task

- Delete Task

- Prioritize Tasks

- Generate Daily Plan

- Generate Weekly Plan

AI Prompt Architecture:

ROLE:

Workplace productivity and planning assistant.

TASK:

Organize, prioritize and schedule the user's tasks.

CONTEXT:

Use task details, deadlines, urgency, importance and user preferences.

CONSTRAINTS:

Do not invent deadlines, task requirements or responsibilities.

OUTPUT:

Provide prioritized tasks and practical daily or weekly schedules.

QUALITY:

Prioritize realistically and provide useful reasoning for prioritization when appropriate.

---

## 6. AI Research Assistant

Features:

- Topic/question input

- Optional source-material input

- Research/analyze button

- Loading state

Outputs:

1. Executive Summary

2. Key Insights

3. Recommendations

4. Simplified Explanation

Allow:

- Editing

- Copying

- Regeneration where appropriate

Clearly label AI-generated information.

Encourage users to verify important information.

If the user provides source material:

- Prioritize the supplied material

- Clearly indicate when information is not available in the supplied material

- Do not fabricate sources, statistics, quotations or facts

AI Prompt Architecture:

ROLE:

Professional research and information-analysis assistant.

TASK:

Analyze the user's question or supplied source material.

CONTEXT:

Use the user's question and any supplied material.

CONSTRAINTS:

Do not fabricate sources, statistics, quotations or facts.

OUTPUT:

Return the required structured report sections.

QUALITY:

Be clear, useful, concise and transparent about uncertainty.

---

## 7. AI Chatbot Interface

Features:

- Accept workplace/productivity questions

- Maintain conversation context during the current session

- Provide helpful responses

- Suggest productivity workflows

- Help users decide which application module to use

- Guide users to the appropriate module

Example prompts:

- "Help me write an email to my manager."

- "Summarize these meeting notes."

- "Help prioritize my tasks."

- "Explain this topic."

- "How can I organize my work today?"

The chatbot should recommend the appropriate application feature when relevant.

Do not claim that an action has been completed if the application did not actually perform that action.

---

## 8. Cross-Module Integration

The five modules must feel like one integrated productivity platform.

Workflow 1:

Meeting Notes

→ Extract Action Items

→ Add to Task Planner

→ Prioritize Tasks

→ Generate Schedule

Workflow 2:

Task Planner

→ Select Task

→ Draft Related Email

→ Open Email Generator with relevant task context prefilled

Workflow 3:

Chatbot

→ Understand User Request

→ Recommend Appropriate Module

→ Guide User to That Module

Use shared application state where appropriate.

Avoid isolated tools that cannot interact.

The user should be able to move naturally between modules without losing relevant information.

---

## 9. Responsible AI

Build Responsible AI into the application.

Principles:

- Do not invent or fabricate information

- Do not fabricate names

- Do not fabricate dates

- Do not fabricate responsibilities

- Do not fabricate qualifications

- Do not fabricate commitments

- Identify missing information clearly

- Do not present uncertainty as certainty

- Encourage user verification

- Allow users to edit AI outputs

- Display a professional AI-generated-content disclaimer

- Validate inputs and outputs

- Provide friendly error/failure states

- Never use fake AI outputs as if they were real generated results

Where required information is missing, clearly state that the information was not provided rather than guessing.

---

## 10. Prompt Engineering Architecture

Each AI module MUST have separate modular prompt logic.

Do NOT use one generic AI prompt for the entire application.

Each module's prompt should contain:

- Role

- Task

- Context

- User Input

- Constraints

- Output Format

- Quality Requirements

Keep prompts individually:

- Testable

- Updatable

- Refinable

- Easy to compare

The architecture should allow individual prompts to be modified and improved without redesigning the entire application.

Prompt logic for Email, Meeting Notes, Task Planning, Research and Chatbot functionality should remain clearly separated.

---

## 11. AI Output UX

For every AI feature:

Before generation:

- Clear instructions

- Input validation

- Helpful examples where appropriate

During generation:

- Loading indicator

- Prevent duplicate submissions where appropriate

After generation:

- Structured output

- Editable content

- Copy functionality where appropriate

- Regenerate functionality where appropriate

- Clear AI-generated-content label

On failure:

- Friendly error message

- Retry option

- Do not display fake fallback AI content as if it were generated

---

## 12. Design System

Use:

- Modern typography

- Consistent spacing

- Clear visual hierarchy

- Professional cards

- Consistent button styles

- Accessible form controls

- Clear icons

- Clean navigation

- Responsive layouts

Desktop:

- Persistent sidebar

Mobile:

- Responsive/collapsible navigation

All five modules must share the same design system.

Do not make each module visually unrelated.

The final UI should look like one professional SaaS productivity platform.

---

## 13. Navigation Structure

Sidebar contains:

Dashboard

AI Tools

  ├── Email Generator

  ├── Meeting Summarizer

  ├── Task Planner

  ├── Research Assistant

  └── AI Chatbot

Activity

Settings / AI Guidelines

Include clear active navigation states.

---

## 14. Productivity Impact Tracking

Dashboard includes real activity metrics:

- Emails generated

- Meetings summarized

- Tasks completed

- Research sessions

Only display metrics generated from actual user activity.

When there is no activity:

- Display zero values or

- Display an appropriate empty state

Never fabricate productivity statistics.

---

## 15. Responsive Design

Ensure full usability and readability on:

- Desktop

- Laptop

- Tablet

- Mobile

Forms, tables, cards, outputs and navigation must adapt gracefully to different screen sizes.

Ensure that important actions remain easy to access on mobile.

---

## 16. Technical Quality

- Build reusable components

- Avoid unnecessary code duplication

- Use clean architecture

- Use appropriate state management for cross-module workflows

- Keep AI prompt logic modular

- Handle loading states properly

- Handle errors properly

- Handle empty states properly

- Validate user inputs

- Validate AI outputs where appropriate

Do not create fake backend functionality.

Do not claim an AI integration is live if it has not actually been configured.

If an external AI/API integration requires credentials or configuration that are not available during this build, create a clear integration structure that can be connected properly later.

---

## CRITICAL FUNCTIONALITY REQUIREMENT

Prioritize working functionality and reliable user flows over visual complexity.

Do not create placeholder buttons, fake AI responses, or non-functional interactions.

Every visible control should either:

1. Work correctly, OR

2. Be clearly identified as requiring an AI/API configuration.

Do not create buttons that appear functional but do nothing.

Do not use fabricated AI responses simply to make the interface appear complete.

Prioritize the core user journeys and make them reliable.

---

## 17. Build Priority

Focus development on:

1. Complete application scaffold and architecture

2. Dashboard and sidebar navigation

3. All five AI modules

4. Cross-module workflows

5. Professional responsive UI/UX quality

6. Input/output state management

7. Modular AI prompt engineering

8. Responsible AI safeguards

9. Reliable functionality and error handling

Do NOT:

- Create multiple applications

- Create multiple projects

- Create five disconnected prototypes

- Create fake AI outputs

- Create unnecessary features that distract from the core requirements

Build one holistic AI Workplace Productivity Assistant application.

The final result should be a polished, presentation-ready integrated AI productivity platform demonstrating:

- Practical AI implementation

- Strong prompt engineering

- Real-world problem solving

- Responsible AI usage

- Modern UI/UX design

The application should clearly demonstrate how AI can help professionals automate and improve common workplace tasks.

Build the complete integrated application now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/562ce059-462d-44cc-a33e-9a2e95ee935d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
