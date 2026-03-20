// ─── Maritime Cybersecurity Fundamentals — Q1 Study Material ─────────────────
// Source: CybersecurityStudyMaterial-Q1.pdf
//
// HOW TO MAKE THIS MODULAR:
//   • Each lesson lives in its own file under ./csm_modules/
//   • To remove a lesson: delete its file and remove the import + entry below
//   • To add a lesson: create a new section file and add it to the lessons array
//   • To swap the quiz: replace quizPool.js or update the import
//
// INTEGRATION:
//   This file is imported by courseData.js and added to coursesByDepartment.
//   The course is accessible at: /course/cybersecurity/maritime-cybersecurity-q1
// ─────────────────────────────────────────────────────────────────────────────

import { section01 } from "./csm_modules/section_01_introduction";
import { section02 } from "./csm_modules/section_02_why_matters";
import { section03 } from "./csm_modules/section_03_fundamentals";
import { section04 } from "./csm_modules/section_04_threats";
import { section05 } from "./csm_modules/section_05_it_ot_systems";
import { section06 } from "./csm_modules/section_06_critical_systems";
import { section07 } from "./csm_modules/section_07_case_studies";
import { section08 } from "./csm_modules/section_08_cyber_hygiene";
import { section09 } from "./csm_modules/section_09_securing_it";
import { section10 } from "./csm_modules/section_10_securing_ot";
import { section11 } from "./csm_modules/section_11_physical_security";
import { section12 } from "./csm_modules/section_12_port_calls";
import { section13 } from "./csm_modules/section_13_incident_response";
import { section14 } from "./csm_modules/section_14_regulations";
import { section15 } from "./csm_modules/section_15_dos_donts";
import { section17 } from "./csm_modules/section_17_conclusion";
import { csmQuizPool } from "./csm_modules/quizPool";

// ─── Flat lessons array (required by courses.jsx) ────────────────────────────
// Order matches the PDF table of contents. Remove entries here when you delete
// their corresponding section file.
const lessons = [
  section01,
  section02,
  section03,
  section04,
  section05,
  section06,
  section07,
  section08,
  section09,
  section10,
  section11,
  section12,
  section13,
  section14,
  section15,
  section17,
];

// ─── Chapter groupings (mirrors PDF index structure) ─────────────────────────
// Used for display / reference. Each chapter groups related lessons.
const chapters = [
  {
    id: "ch1",
    title: "Chapter 1: Foundations of Maritime Cybersecurity",
    lessons: [section01, section02, section03],
  },
  {
    id: "ch2",
    title: "Chapter 2: Cyber Threats & Attack Types",
    lessons: [section04, section05, section06],
  },
  {
    id: "ch3",
    title: "Chapter 3: Real-World Maritime Cyberattacks",
    lessons: [section07],
  },
  {
    id: "ch4",
    title: "Chapter 4: Cyber Hygiene & IT/OT Protection",
    lessons: [section08, section09, section10],
  },
  {
    id: "ch5",
    title: "Chapter 5: Physical Security & Port Call Risks",
    lessons: [section11, section12],
  },
  {
    id: "ch6",
    title: "Chapter 6: Incident Response & Compliance",
    lessons: [section13, section14, section15],
  },
  {
    id: "ch7",
    title: "Chapter 7: Summary & Best Practices",
    lessons: [section17],
  },
];

// ─── Course object ────────────────────────────────────────────────────────────
export const cybersecurityQ1Course = {
  id: "maritime-cybersecurity-q1",
  title: "Maritime Cybersecurity Fundamentals (Q1)",
  icon: "🛡️",
  description:
    "Comprehensive Q1 study material covering all aspects of maritime cybersecurity — from the CIA Triad and common threats to real incident case studies, OT protection, port call security, and IMO compliance.",
  totalDuration: "5h 20min",
  lessons,      // flat array — consumed by courses.jsx
  chapters,     // grouped by topic — mirrors PDF index
  quizPool: csmQuizPool,
};

export default cybersecurityQ1Course;
