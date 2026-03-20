// Quiz Pool — Maritime Cybersecurity Fundamentals (Q1)
// Questions sourced from CybersecurityStudyMaterial-Q1.pdf — Section 16 + topic-specific additions
// Delete this file and replace quizPool in cybersecurity_study_material.js to swap the quiz set.

export const csmQuizPool = [
  {
    id: "q1",
    question: "What does the CIA Triad stand for in cybersecurity?",
    options: [
      "Control, Integrity, Access",
      "Confidentiality, Integrity, Availability",
      "Compliance, Incident, Authorization",
      "Cyber, Infrastructure, Awareness",
    ],
    correctIndex: 1,
  },
  {
    id: "q2",
    question: "Which of the following is a sign of a ransomware attack onboard?",
    options: [
      "Faster system performance and quicker file access",
      "Files locked with unusual extensions, ransom messages appearing, and inability to access systems",
      "Improved network connectivity throughout the vessel",
      "New software updates being installed automatically",
    ],
    correctIndex: 1,
  },
  {
    id: "q3",
    question: "What is the correct immediate action if you suspect GPS spoofing?",
    options: [
      "Continue navigation using only the GPS display",
      "Turn off all navigation systems and anchor immediately",
      "Cross-check position with radar and visual bearings, then notify the Master",
      "Call the nearest port authority for confirmation",
    ],
    correctIndex: 2,
  },
  {
    id: "q4",
    question: "Why is network segmentation critical on a vessel?",
    options: [
      "It increases internet speed for crew entertainment",
      "It isolates critical OT systems so a cyber incident cannot spread from IT to operational systems",
      "It reduces the ship's power consumption",
      "It simplifies network maintenance for the IT team",
    ],
    correctIndex: 1,
  },
  {
    id: "q5",
    question: "What should you do if you find a USB drive onboard that you did not bring?",
    options: [
      "Plug it in to check what it contains",
      "Share it with other crew members who may need files",
      "Report it to the security officer and do not connect it to any ship system",
      "Dispose of it overboard to eliminate the risk",
    ],
    correctIndex: 2,
  },
  {
    id: "q6",
    question: "What does IMO Resolution MSC.428(98) require from vessel operators?",
    options: [
      "All ships must have high-speed satellite internet access",
      "Cyber risk management must be included in the Safety Management System (SMS)",
      "All crew members must hold an IT certification",
      "All ship systems must be migrated to cloud-based platforms",
    ],
    correctIndex: 1,
  },
  {
    id: "q7",
    question: "Which statement best describes social engineering in a maritime context?",
    options: [
      "Installing social media applications on ship computers",
      "Manipulating crew through deception to gain unauthorized access or reveal sensitive information",
      "Building relationships with port authorities for smoother operations",
      "Organizing team-building events to improve crew morale",
    ],
    correctIndex: 1,
  },
  {
    id: "q8",
    question: "What is the key lesson from the 2017 Maersk NotPetya attack?",
    options: [
      "Only older ships are vulnerable to cyberattacks",
      "Even trusted software can carry malware; offline backups are essential for recovery",
      "Cybersecurity only matters for the largest shipping companies",
      "Antivirus software alone is always sufficient protection",
    ],
    correctIndex: 1,
  },
  {
    id: "q9",
    question: "What makes OT systems particularly vulnerable to cyberattacks?",
    options: [
      "They are always directly connected to the public internet",
      "They were designed for reliability, not cybersecurity, and often lack modern protection",
      "They exclusively use outdated hardware that cannot be upgraded",
      "OT systems are always well protected by default",
    ],
    correctIndex: 1,
  },
  {
    id: "q10",
    question: "A person claiming to be 'IT support' asks for your ECDIS password to fix a system issue. What is the correct response?",
    options: [
      "Provide the password since they are a certified professional",
      "Provide the password only if they are wearing a company uniform",
      "Do not provide the password; verify identity through the Master and follow company procedures",
      "Give temporary access to observe whether they can fix the problem",
    ],
    correctIndex: 2,
  },
  {
    id: "q11",
    question: "Which cyber hygiene practice best protects against malware spreading through ship systems?",
    options: [
      "Using the same strong password for all ship systems for simplicity",
      "Never connecting unknown or unscanned USB drives to any ship system",
      "Sharing login credentials only with trusted senior officers",
      "Disabling firewalls to improve system performance",
    ],
    correctIndex: 1,
  },
  {
    id: "q12",
    question: "What should you preserve during a cyber incident before technical experts arrive?",
    options: [
      "Nothing — restart the system immediately to clear the threat",
      "Logs, alerts, on-screen messages, and a written record of symptoms, timeline, and actions taken",
      "Only the most recent file backups",
      "Power off all systems immediately to contain the threat",
    ],
    correctIndex: 1,
  },
  {
    id: "q13",
    question: "During a port call, what rule applies to visiting technicians working on ship systems?",
    options: [
      "Allow full unsupervised access for operational efficiency",
      "Only pre-approved devices may be connected, all activities must be logged, and technicians must be supervised at all times",
      "Trust technicians as long as they carry port authority badges",
      "Allow them to work independently to avoid wasting crew time",
    ],
    correctIndex: 1,
  },
  {
    id: "q14",
    question: "What does the Maritime Cybersecurity Resilience Formula state?",
    options: [
      "Speed + Power + Navigation = Safe Ship",
      "Awareness + Preparedness + Segmentation + Backups = Resilience",
      "Firewall + Antivirus + Patches = Full Security",
      "Training + Certification + Compliance = Zero Risk",
    ],
    correctIndex: 1,
  },
  {
    id: "q15",
    question: "Which of the following best describes a phishing attack in a maritime context?",
    options: [
      "A navigation technique using electronic fishing charts",
      "Attackers sending fake emails pretending to be port authorities, charterers, or company HQ to steal credentials",
      "A type of malware that physically damages shipboard hardware",
      "Routine port inspections conducted via email communication",
    ],
    correctIndex: 1,
  },
];
