"""
seed_courses.py
Run once to populate the study_materials, chapters, lessons, and quiz_questions
tables from the CybersecurityStudyMaterial-Q1.pdf content.

Usage (from backend/ directory, with venv active):
    python seed_courses.py
"""

from database import SessionLocal, engine
import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

# ── Seed data extracted from CybersecurityStudyMaterial-Q1.pdf ────────────────

STUDY_MATERIAL = {
    "material_key": "maritime-cybersecurity-awareness-q1",
    "title": "Maritime Cybersecurity Awareness Training",
    "description": (
        "Comprehensive maritime cybersecurity awareness training for all vessel crew. "
        "Covers cyber threats, hygiene, system security, incident response, and IMO compliance."
    ),
    "icon": "🛡️",
    "total_duration": "3h 30min",
    "department": None,  # cross-department
    "target_roles": ["Crews", "Officers", "Department Head"],
    "order_index": 1,
}

CHAPTERS = [
    # ─── Chapter 1 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch1",
        "title": "Chapter 1: Introduction to Maritime Cybersecurity",
        "order_index": 1,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "1.1 Definition",
                "duration": "10min",
                "topics": [
                    "Modern ships as floating digital environments",
                    "Core operations relying on digital technology",
                    "Navigation, engine control, cargo, communication systems",
                    "How digitalisation introduced cybersecurity vulnerabilities",
                ],
                "content": (
                    "Modern ships operate as floating digital environments where critical shipboard "
                    "functions depend on interconnected digital technologies. Core operations such as "
                    "navigation, engine and propulsion control, cargo handling, communication systems, "
                    "and crew welfare services rely heavily on computers, onboard networks, and "
                    "satellite-based connectivity.\n\n"
                    "The increasing adoption of digital systems has significantly improved operational "
                    "efficiency, safety, and decision-making capabilities. However, this same "
                    "digitalisation has also introduced new and often invisible cybersecurity "
                    "vulnerabilities, exposing vessels to cyber threats that can originate from "
                    "anywhere in the world."
                ),
            },
            {
                "lesson_key": "l2",
                "title": "1.2 The Reality of Cyber Risk at Sea",
                "duration": "15min",
                "topics": [
                    "Cyber threats are silent and invisible",
                    "Over 90% of global trade transported by sea",
                    "Key Truth for Crew: cybersecurity is a safety issue",
                    "Prevention through awareness and digital hygiene",
                ],
                "content": (
                    "Unlike physical threats such as fire, collision, or grounding, cyberattacks may "
                    "occur without immediate physical warning signs. Cyber risks in the maritime domain "
                    "are often silent, unseen, and difficult to detect until damage has already occurred.\n\n"
                    "Key realities:\n"
                    "- Over 90% of global trade is transported by sea, making vessels attractive targets\n"
                    "- A single cyber incident can manipulate navigation systems, disable engines, "
                    "disrupt cargo operations, or interrupt global supply chains\n\n"
                    "KEY TRUTH FOR CREW: Cybersecurity is not only an IT responsibility. It is a "
                    "critical safety issue, comparable to fire prevention and collision avoidance. "
                    "Simple human actions — clicking malicious emails, using infected USB devices, "
                    "creating weak passwords — can trigger serious incidents.\n\n"
                    "PREVENTION: The majority of maritime cyber incidents are preventable by improving "
                    "awareness, maintaining basic digital hygiene, and strictly following company "
                    "cybersecurity procedures."
                ),
            },
        ],
    },
    # ─── Chapter 2 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch2",
        "title": "Chapter 2: Why Cybersecurity Matters in Maritime",
        "order_index": 2,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "2.1–2.2 Navigation Safety & Crew Safety",
                "duration": "15min",
                "topics": [
                    "GPS, ECDIS, AIS spoofing and manipulation",
                    "Grounding, collision, and restricted water risks",
                    "OT systems: engine automation, ballast control, power management",
                    "Life-threatening failures from compromised OT",
                ],
                "content": (
                    "NAVIGATION SAFETY: Modern vessels rely extensively on GPS, ECDIS, and AIS. "
                    "Cyber attackers can manipulate or spoof navigation data, causing vessels to "
                    "unknowingly deviate while all systems appear normal. Potential impacts include "
                    "collisions, grounding, and entry into restricted or high-risk waters.\n\n"
                    "CREW SAFETY: Shipboard OT systems such as engine automation, ballast control, "
                    "and power management are increasingly network-connected. If compromised, these "
                    "can cause unexpected engine shutdowns, unstable ballast operations, or total "
                    "loss of electrical power — rapidly escalating into life-threatening emergencies."
                ),
            },
            {
                "lesson_key": "l2",
                "title": "2.3–2.5 Environmental, Business & Regulatory Impact",
                "duration": "15min",
                "topics": [
                    "Environmental protection: pollution prevention systems at risk",
                    "Business continuity: global supply chain disruption",
                    "Regulatory compliance: IMO Resolution MSC.428(98)",
                    "Cybersecurity is now the law",
                ],
                "content": (
                    "ENVIRONMENTAL PROTECTION: Cyberattacks can impact systems responsible for "
                    "environmental safety and pollution prevention. A compromised ballast water "
                    "system or fuel valve could trigger catastrophic spills.\n\n"
                    "BUSINESS CONTINUITY: A single vessel cyberattack can cascade into port delays, "
                    "cargo loss, charter disputes, and global supply chain disruption. Maersk lost "
                    "approximately $300M in the 2017 NotPetya attack.\n\n"
                    "REGULATORY COMPLIANCE: The IMO mandated that cyber risk management be "
                    "incorporated into Safety Management Systems (SMS) under Resolution MSC.428(98), "
                    "effective from 1 January 2021. Non-compliance exposes companies to PSC "
                    "detentions and insurance voidance."
                ),
            },
        ],
    },
    # ─── Chapter 3 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch3",
        "title": "Chapter 3: Cybersecurity Fundamentals",
        "order_index": 3,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "3.1–3.2 What Is Cybersecurity & the CIA Triad",
                "duration": "15min",
                "topics": [
                    "Definition of cybersecurity",
                    "Confidentiality: protect sensitive data",
                    "Integrity: ensure data is unaltered",
                    "Availability: systems accessible when needed",
                ],
                "content": (
                    "WHAT IS CYBERSECURITY? Cybersecurity is the practice of protecting systems, "
                    "networks, and data from digital attacks, damage, or unauthorised access.\n\n"
                    "THE CIA TRIAD — three core principles:\n"
                    "1. CONFIDENTIALITY: Ensuring sensitive information is accessible only to "
                    "authorised persons. Example: cargo manifests visible only to relevant officers.\n"
                    "2. INTEGRITY: Ensuring data is accurate and has not been tampered with. "
                    "Example: navigation charts that reflect true positions.\n"
                    "3. AVAILABILITY: Ensuring systems and data are accessible when needed. "
                    "Example: GMDSS communication available during emergencies."
                ),
            },
            {
                "lesson_key": "l2",
                "title": "3.3–3.5 Cyber Terms, Three Pillars & Maritime Perspective",
                "duration": "15min",
                "topics": [
                    "Essential cyber terms: malware, phishing, ransomware, vulnerability",
                    "People: trained and alert crew",
                    "Process: clear and enforced procedures",
                    "Technology: firewalls, antivirus, access controls",
                ],
                "content": (
                    "ESSENTIAL CYBER TERMS FOR SEAFARERS:\n"
                    "- Malware: Malicious software designed to damage or gain access to systems\n"
                    "- Phishing: Deceptive messages to trick users into revealing credentials\n"
                    "- Ransomware: Malware that encrypts files and demands payment\n"
                    "- Firewall: A security system that monitors and controls network traffic\n"
                    "- Vulnerability: A weakness attackers exploit, often caused by poor habits\n\n"
                    "THREE PILLARS OF CYBER SAFETY:\n"
                    "1. PEOPLE — Trained, alert crew who think before clicking or sharing\n"
                    "2. PROCESS — Clear, enforced procedures for computers, email, USB, passwords\n"
                    "3. TECHNOLOGY — Firewalls, antivirus, access controls, network segregation\n\n"
                    "All three pillars must work together. Technology alone cannot prevent human "
                    "error, and processes fail if people don't follow them."
                ),
            },
        ],
    },
    # ─── Chapter 4 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch4",
        "title": "Chapter 4: Common Cyber Threats at Sea",
        "order_index": 4,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "4.1–4.3 Phishing, Ransomware & Infected USB",
                "duration": "20min",
                "topics": [
                    "Phishing via email, SMS, WhatsApp",
                    "Red flags: urgency, fear, credential requests",
                    "Ransomware: COSCO 2018, Port of San Diego 2018",
                    "Malware via USB drives and contractor laptops",
                ],
                "content": (
                    "PHISHING: Attackers send fake emails, SMS, or WhatsApp messages pretending to "
                    "be port authorities, company HQ, or charterers. Red flags: messages that create "
                    "urgency, demand immediate action, or request login details. Defense: verify the "
                    "sender through a secondary communication channel before acting.\n\n"
                    "RANSOMWARE: Locks important systems and files, demanding payment for restoration. "
                    "Real incidents:\n"
                    "- COSCO (2018): Terminal operations disrupted, email systems locked\n"
                    "- Port of San Diego (2018): Critical IT systems compromised, port operations delayed\n\n"
                    "MALWARE VIA REMOVABLE MEDIA: USB drives, external hard disks, or contractor "
                    "laptops can carry malware that infects navigation systems, spreads into OT "
                    "networks, and disables critical controls. A free USB can cost the ship millions."
                ),
            },
            {
                "lesson_key": "l2",
                "title": "4.4–4.7 GPS Spoofing, AIS Manipulation & Social Engineering",
                "duration": "20min",
                "topics": [
                    "GPS spoofing: fake signals causing wrong position",
                    "AIS manipulation: phantom ships and hidden vessels",
                    "Unauthorized access from unattended workstations",
                    "Social engineering: attackers posing as IT support",
                ],
                "content": (
                    "GPS SPOOFING: Attackers transmit fake GPS signals, causing wrong position on "
                    "GPS/ECDIS, false course and speed data, and increased grounding/collision risk. "
                    "The ship may be off-course while the screen shows 'safe waters'.\n\n"
                    "AIS MANIPULATION: Attackers can hide real vessels, create phantom ships, or "
                    "broadcast false vessel identity and position — leading to poor collision "
                    "avoidance decisions in congested waters.\n\n"
                    "UNAUTHORIZED ACCESS: Leaving systems unattended or protected with weak passwords "
                    "allows physical system access, remote unauthorized access, and data theft. "
                    "An unlocked console is an open door.\n\n"
                    "SOCIAL ENGINEERING: Attackers pose as IT support, port inspection officers, or "
                    "company technicians. They use politeness, authority, and urgency to gain access. "
                    "If someone asks for passwords or system access — it's a red flag."
                ),
            },
        ],
    },
    # ─── Chapter 5 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch5",
        "title": "Chapter 5: Maritime IT, OT & Critical Systems at Risk",
        "order_index": 5,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "5.1–5.3 IT, OT & Integrated Systems",
                "duration": "15min",
                "topics": [
                    "IT systems: email, office computers, crew Wi-Fi",
                    "OT systems: engine automation, SCADA, sensors",
                    "Integration points: the hidden digital bridge between IT and OT",
                    "Why IT/OT convergence increases attack surface",
                ],
                "content": (
                    "Modern vessels are no longer separated into 'office' and 'engine room' "
                    "worlds — they are digitally connected ecosystems.\n\n"
                    "IT SYSTEMS (where most attacks begin): Email and messaging, office computers "
                    "and servers, crew Wi-Fi and internet access, business and documentation apps.\n\n"
                    "OT SYSTEMS (where incidents become dangerous): Engine automation, SCADA "
                    "systems, propulsion control, ballast management, cargo sensors and actuators. "
                    "A cyber incident here can have immediate physical consequences.\n\n"
                    "INTEGRATION POINTS: Modern ships increasingly connect IT and OT networks for "
                    "efficiency. This creates hidden digital bridges that attackers can use to "
                    "pivot from an infected crew laptop to engine control systems."
                ),
            },
            {
                "lesson_key": "l2",
                "title": "6.1–6.5 Critical Maritime Systems at Risk",
                "duration": "15min",
                "topics": [
                    "ECDIS: chart manipulation risks",
                    "GPS: spoofing and positioning errors",
                    "AIS: ships appearing and disappearing",
                    "Engine control systems: no second chances",
                    "Cargo management systems: data errors with real damage",
                ],
                "content": (
                    "ECDIS (When the Chart Lies): A compromised ECDIS can display incorrect charts, "
                    "wrong hazard positions, or outdated data — putting the vessel on a collision "
                    "course with uncharted rocks.\n\n"
                    "GPS (Accurate Until It Isn't): Even small position errors from spoofed GPS "
                    "signals can be catastrophic in confined waterways or during berthing.\n\n"
                    "AIS (Ships That Appear and Disappear): AIS data feeds into ECDIS and ARPA — "
                    "false AIS targets create phantom traffic and hide real vessels.\n\n"
                    "ENGINE CONTROL SYSTEMS: Automation failures can cause sudden loss of "
                    "propulsion, steering, or power. There are no second chances in heavy traffic "
                    "or rough weather.\n\n"
                    "CARGO MANAGEMENT SYSTEMS: Data manipulation can cause improper stowage, "
                    "incorrect weight distribution, or misdirected hazardous cargo."
                ),
            },
        ],
    },
    # ─── Chapter 6 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch6",
        "title": "Chapter 6: Case Studies — Real Maritime Cyberattacks",
        "order_index": 6,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "7.1–7.3 Maersk, COSCO & Port of San Diego",
                "duration": "20min",
                "topics": [
                    "Maersk NotPetya attack (2017): $300M loss",
                    "COSCO ransomware attack (2018): operations disrupted",
                    "Port of San Diego ransomware (2018): IT systems compromised",
                    "Lessons learned from each incident",
                ],
                "content": (
                    "CASE STUDY 1 — MAERSK NotPetya (2017):\n"
                    "The NotPetya ransomware wiped Maersk's global IT infrastructure, affecting "
                    "45,000 PCs, 4,000 servers, and 2,500 applications. Over 76 port terminals "
                    "were impacted. Estimated financial loss: ~$300 million. The malware spread "
                    "through a single compromised accounting software update in Ukraine.\n\n"
                    "CASE STUDY 2 — COSCO SHIPPING Ransomware (2018):\n"
                    "Ransomware infected COSCO's US network, locking email systems and disrupting "
                    "terminal operations in Long Beach, Houston, New Orleans, and Savannah. The "
                    "attack demonstrated that even partial network compromise can halt global "
                    "logistics chains.\n\n"
                    "CASE STUDY 3 — PORT OF SAN DIEGO (2018):\n"
                    "Ransomware targeted the port's IT systems, disrupting business services and "
                    "administrative functions. Critical port operations continued but the incident "
                    "highlighted the vulnerability of port infrastructure to cyber threats.\n\n"
                    "KEY LESSON: All three incidents could have been reduced in impact through "
                    "network segmentation, regular backups, and patching."
                ),
            },
        ],
    },
    # ─── Chapter 7 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch7",
        "title": "Chapter 7: Cyber Hygiene for Crew Members",
        "order_index": 7,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "8.1–8.2 Passwords & USB Drives",
                "duration": "15min",
                "topics": [
                    "Strong passwords: length, complexity, uniqueness",
                    "Password managers",
                    "Never use company passwords on personal devices",
                    "USB drives: scan before connecting, avoid unknown drives",
                ],
                "content": (
                    "PASSWORDS — YOUR FIRST LINE OF DEFENSE:\n"
                    "- Use passwords of at least 12 characters with mixed case, numbers, symbols\n"
                    "- Never reuse passwords across systems\n"
                    "- Use a password manager to store credentials securely\n"
                    "- Never write passwords on sticky notes or share them with colleagues\n"
                    "- Change passwords immediately if you suspect compromise\n\n"
                    "USB DRIVES — THE SILENT INFECTION:\n"
                    "- Never connect unknown USB drives to vessel systems\n"
                    "- Always scan external media with antivirus before use\n"
                    "- Use only company-approved and encrypted USB drives\n"
                    "- Report found USB drives to the officer in charge — never plug them in out of curiosity\n"
                    "- A free USB drive found in a port parking lot is almost certainly a trap"
                ),
            },
            {
                "lesson_key": "l2",
                "title": "8.3–8.5 Software Updates, Emails & Workstations",
                "duration": "15min",
                "topics": [
                    "Apply updates only from authorised sources",
                    "Recognise phishing email red flags",
                    "Verify unexpected requests through secondary channels",
                    "Lock workstations before walking away",
                ],
                "content": (
                    "SOFTWARE UPDATES:\n"
                    "- Apply software updates only from the approved vessel IT procedure\n"
                    "- Never install software from personal USB drives or unauthorised websites\n"
                    "- Notify your IT officer when prompted for updates\n\n"
                    "EMAILS & MESSAGES — URGENCY IS A RED FLAG:\n"
                    "- Legitimate organisations never demand immediate password changes via email\n"
                    "- Check sender email addresses carefully for slight misspellings\n"
                    "- Hover over links before clicking to verify destination\n"
                    "- When in doubt, call the sender through an official number to verify\n\n"
                    "WORKSTATIONS — LOCK BEFORE YOU WALK AWAY:\n"
                    "- Always lock your screen (Win+L or Ctrl+Alt+L) when stepping away\n"
                    "- Set automatic screen lock after 3–5 minutes of inactivity\n"
                    "- Never leave bridge or engine room terminals unattended and unlocked\n"
                    "- Log out completely at end of watch"
                ),
            },
        ],
    },
    # ─── Chapter 8 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch8",
        "title": "Chapter 8: Securing Shipboard IT & OT Systems",
        "order_index": 8,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "9.1–9.5 Securing IT Systems",
                "duration": "20min",
                "topics": [
                    "Firewalls and endpoint protection",
                    "Patching and software control",
                    "Access control: least privilege principle",
                    "Network separation: IT vs OT vs crew Wi-Fi",
                    "Backups: your last line of survival",
                ],
                "content": (
                    "FIREWALLS & ENDPOINT PROTECTION:\n"
                    "- Ensure firewalls are enabled and configured on all shipboard computers\n"
                    "- Antivirus must be installed and updated on schedule\n"
                    "- All incoming and outgoing traffic should be monitored\n\n"
                    "PATCHING & SOFTWARE CONTROL:\n"
                    "- Apply security patches within approved maintenance windows\n"
                    "- Maintain an inventory of all software installed on vessel systems\n"
                    "- Unauthorised software installation is strictly prohibited\n\n"
                    "ACCESS CONTROL:\n"
                    "- Each crew member should have a unique user account — no shared logins\n"
                    "- Apply least-privilege: users get only the access they need\n"
                    "- Disable or remove accounts when crew members change\n\n"
                    "NETWORK SEPARATION:\n"
                    "- Separate crew internet Wi-Fi from navigation and OT networks\n"
                    "- Use VLANs to isolate critical systems\n"
                    "- Never bridge networks without approval\n\n"
                    "BACKUPS:\n"
                    "- Back up critical data regularly and store copies offline\n"
                    "- Test backup restoration procedures periodically\n"
                    "- In a ransomware attack, good backups mean the difference between "
                    "a minor incident and a catastrophe"
                ),
            },
            {
                "lesson_key": "l2",
                "title": "10.1–10.4 Securing OT Systems",
                "duration": "20min",
                "topics": [
                    "Isolation: keep OT off the internet",
                    "Remote access: manage with strict controls",
                    "Change and maintenance records",
                    "Risk assessments and cyber exercises",
                ],
                "content": (
                    "ISOLATION — KEEP OT OFF THE INTERNET:\n"
                    "- OT systems (engine control, SCADA) should never have direct internet access\n"
                    "- Use data diodes or one-way gateways where monitoring data must be shared\n"
                    "- Physical separation of OT cabinets from crew network switches\n\n"
                    "REMOTE ACCESS — CONVENIENCE IS A RISK:\n"
                    "- Every remote session must be logged with the vendor's name, date, and purpose\n"
                    "- Never allow remote access without an officer physically present\n"
                    "- Revoke remote access credentials immediately after use\n\n"
                    "CHANGE & MAINTENANCE RECORDS:\n"
                    "- Log all software or firmware changes to OT systems\n"
                    "- Require signed authorisation before any change is applied\n"
                    "- Keep copies of original configuration files in a secure offline location\n\n"
                    "RISK ASSESSMENTS & EXERCISES:\n"
                    "- Conduct annual cyber risk assessments per ISM Code requirements\n"
                    "- Run tabletop exercises simulating ransomware or GPS spoofing scenarios\n"
                    "- Review and update the vessel Cyber Security Management Plan (CSMP)"
                ),
            },
        ],
    },
    # ─── Chapter 9 ──────────────────────────────────────────────────────────
    {
        "chapter_key": "ch9",
        "title": "Chapter 9: Physical Security & Port Call Risks",
        "order_index": 9,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "11.1–11.3 Physical Cybersecurity Risks Onboard",
                "duration": "15min",
                "topics": [
                    "Restrict bridge and engine control room access",
                    "Secure network closets and cabling",
                    "Supervise all technicians and visitors",
                    "Tailgating and shoulder-surfing risks",
                ],
                "content": (
                    "ACCESS TO BRIDGE & ENGINE CONTROL:\n"
                    "- Restrict access to bridge and ECR to authorised personnel only\n"
                    "- Log all third-party technician access to these areas\n"
                    "- Never leave critical terminals unlocked when visitors are aboard\n\n"
                    "NETWORK CLOSETS & CABLES:\n"
                    "- Lock all network cabinets and communication rooms\n"
                    "- Inspect network panels for unauthorised devices (rogue switches, keyloggers)\n"
                    "- Report any unfamiliar cables or devices to the officer in charge\n\n"
                    "TECHNICIANS & VISITORS:\n"
                    "- Never leave an external technician unsupervised at a vessel system\n"
                    "- Verify identification and work orders before granting system access\n"
                    "- Watch for shoulder-surfing (someone observing you type a password)\n"
                    "- Social engineers often pose as legitimate service personnel"
                ),
            },
            {
                "lesson_key": "l2",
                "title": "12.1–12.3 Cybersecurity During Port Calls",
                "duration": "15min",
                "topics": [
                    "Port Wi-Fi networks: avoid using for vessel systems",
                    "Supervise visiting technicians at all times",
                    "Information sharing: less is safer",
                    "Shore-side USB and device risks",
                ],
                "content": (
                    "PORT NETWORKS — CONVENIENCE CAN BE A TRAP:\n"
                    "- Never connect vessel computers or navigation systems to port Wi-Fi\n"
                    "- Use only the vessel's own cellular or VSAT connection\n"
                    "- If crew must use port Wi-Fi for personal devices, ensure these devices "
                    "are never connected to vessel networks\n\n"
                    "VISITING TECHNICIANS — SUPERVISE EVERY MOVE:\n"
                    "- Assign a responsible officer to accompany all technicians\n"
                    "- Do not allow technicians to connect personal laptops without prior approval\n"
                    "- Verify that all devices brought aboard are scanned for malware\n\n"
                    "INFORMATION SHARING — LESS IS SAFER:\n"
                    "- Do not share vessel system details (software versions, IP addresses) "
                    "with unknown parties\n"
                    "- Be cautious with cargo or schedule information — it has operational value "
                    "to adversaries\n"
                    "- Shred or securely dispose of printed documents containing sensitive data"
                ),
            },
        ],
    },
    # ─── Chapter 10 ─────────────────────────────────────────────────────────
    {
        "chapter_key": "ch10",
        "title": "Chapter 10: Incident Response & IMO Compliance",
        "order_index": 10,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "13.1 Cyber Incident Reporting & Response Procedures",
                "duration": "20min",
                "topics": [
                    "Identify: recognise signs of a cyber incident",
                    "Contain: isolate affected systems immediately",
                    "Report: notify master, DPA, and company IT",
                    "Recover: restore from backups, document everything",
                ],
                "content": (
                    "INCIDENT RESPONSE FLOWCHART:\n\n"
                    "STEP 1 — IDENTIFY:\n"
                    "Signs of a cyber incident: unusual system behaviour, ransom messages, "
                    "navigation system anomalies, unexplained alarms, locked files.\n\n"
                    "STEP 2 — CONTAIN:\n"
                    "- Disconnect the affected system from the network immediately\n"
                    "- Do NOT power off — preserve forensic evidence\n"
                    "- Switch to backup or manual navigation/control if required\n\n"
                    "STEP 3 — REPORT:\n"
                    "- Notify the Master immediately\n"
                    "- Master notifies the Designated Person Ashore (DPA)\n"
                    "- DPA contacts company cybersecurity / IT incident response team\n"
                    "- Report to flag state authority and port state as required\n\n"
                    "STEP 4 — RECOVER:\n"
                    "- Restore clean backups after full system scan\n"
                    "- Document all actions taken with timestamps\n"
                    "- Conduct post-incident review to prevent recurrence\n"
                    "- Update the Cyber Security Management Plan accordingly"
                ),
            },
            {
                "lesson_key": "l2",
                "title": "14.1–14.2 IMO Regulations & Compliance",
                "duration": "15min",
                "topics": [
                    "IMO Resolution MSC.428(98): cyber risk in SMS",
                    "Effective from 1 January 2021",
                    "Guidelines MSC-FAL.1/Circ.3",
                    "BIMCO, OCIMF, and flag state guidance",
                ],
                "content": (
                    "IMO RESOLUTION MSC.428(98):\n"
                    "The IMO adopted Resolution MSC.428(98) in June 2017, urging administrations "
                    "to ensure that cyber risks are appropriately addressed in Safety Management "
                    "Systems (SMS) no later than the first annual verification after 1 January 2021.\n\n"
                    "What this means for ships:\n"
                    "- Cyber risk must be included in the ISM Code Safety Management System\n"
                    "- Vessels without documented cyber risk management may face PSC detentions\n"
                    "- Annual ISM audits now include review of cyber risk documentation\n\n"
                    "GUIDELINES MSC-FAL.1/Circ.3:\n"
                    "The IMO issued practical guidelines covering:\n"
                    "- Identifying systems exposed to cyber risk\n"
                    "- Implementing risk control measures\n"
                    "- Contingency planning\n"
                    "- Training and awareness\n\n"
                    "CYBERSECURITY IS NOT JUST DOCUMENTATION: Compliance means implemented "
                    "procedures, trained crew, tested response plans — not just a filed policy document."
                ),
            },
        ],
    },
    # ─── Chapter 11 ─────────────────────────────────────────────────────────
    {
        "chapter_key": "ch11",
        "title": "Chapter 11: Do's & Don'ts and Best Practices Summary",
        "order_index": 11,
        "lessons": [
            {
                "lesson_key": "l1",
                "title": "15 & 17 Cybersecurity Do's & Don'ts for Vessels",
                "duration": "15min",
                "topics": [
                    "Top 10 Do's: lock screens, strong passwords, report incidents",
                    "Top 10 Don'ts: no unknown USB, no personal devices on vessel network",
                    "Cybersecurity as seamanship in the digital age",
                    "The resilience formula: People + Process + Technology",
                ],
                "content": (
                    "CYBERSECURITY DO'S:\n"
                    "1. Lock your workstation whenever you step away\n"
                    "2. Use strong, unique passwords for every system account\n"
                    "3. Report any suspicious email, message, or system behaviour immediately\n"
                    "4. Verify unknown callers or visitors through official channels\n"
                    "5. Keep software updated through approved ship IT procedures\n"
                    "6. Back up important files to approved offline storage\n"
                    "7. Follow all USB and removable media policies\n"
                    "8. Attend all mandatory cybersecurity drills and training\n"
                    "9. Segregate personal internet use from vessel systems\n"
                    "10. Know the incident reporting chain of command onboard\n\n"
                    "CYBERSECURITY DON'TS:\n"
                    "1. Never connect unknown USB drives to vessel computers\n"
                    "2. Never share your password with anyone — including the IT officer\n"
                    "3. Never click links in unexpected emails without verification\n"
                    "4. Never leave bridge or engine room terminals unlocked and unattended\n"
                    "5. Never install unauthorised software on vessel systems\n"
                    "6. Never connect personal devices to the vessel's operational networks\n"
                    "7. Never give port or cargo details to unknown parties\n"
                    "8. Never bypass firewall or security settings even temporarily\n"
                    "9. Never ignore system alerts or unusual alarms\n"
                    "10. Never allow unsupervised access to vessel systems by visitors\n\n"
                    "THE RESILIENCE FORMULA:\n"
                    "Resilience = Awareness + Procedures + Technology\n"
                    "Cybersecurity is seamanship in the digital age — it protects the vessel, "
                    "the cargo, the environment, and every life onboard."
                ),
            },
        ],
    },
]

# ── Quiz questions from Section 16 of the PDF ────────────────────────────────

QUIZ_QUESTIONS = [
    {
        "order_index": 1,
        "question": "What does the CIA Triad stand for in cybersecurity?",
        "options": [
            {"key": "A", "text": "Confidentiality, Integrity, Availability"},
            {"key": "B", "text": "Cyber, Intelligence, Analysis"},
            {"key": "C", "text": "Control, Isolation, Authentication"},
            {"key": "D", "text": "Communication, Integrity, Access"},
        ],
        "correct_answer": "A",
        "explanation": (
            "The CIA Triad represents the three core principles of cybersecurity: "
            "Confidentiality (protecting data from unauthorised access), "
            "Integrity (ensuring data is accurate and unaltered), and "
            "Availability (ensuring systems are accessible when needed)."
        ),
    },
    {
        "order_index": 2,
        "question": "Which of the following is a warning sign that your vessel's computer may have ransomware?",
        "options": [
            {"key": "A", "text": "The system runs slightly slower than usual"},
            {"key": "B", "text": "Files are locked and a payment demand appears on screen"},
            {"key": "C", "text": "A new software update is available"},
            {"key": "D", "text": "The screen saver activates after 5 minutes"},
        ],
        "correct_answer": "B",
        "explanation": (
            "Ransomware encrypts files and displays a ransom demand. Locked files combined "
            "with a payment message are the classic ransomware signs. Slow performance alone "
            "is not a definitive indicator."
        ),
    },
    {
        "order_index": 3,
        "question": "Your GPS shows your vessel is safely positioned, but the Officer of the Watch suspects GPS spoofing. What is the CORRECT immediate action?",
        "options": [
            {"key": "A", "text": "Ignore the concern and continue the passage"},
            {"key": "B", "text": "Cross-check position using radar, visual bearings, and ECDIS independently"},
            {"key": "C", "text": "Reboot the GPS receiver and wait for it to reconnect"},
            {"key": "D", "text": "Call the port agent to confirm your position"},
        ],
        "correct_answer": "B",
        "explanation": (
            "When GPS spoofing is suspected, immediately cross-check the GPS position against "
            "independent means: radar fixes, visual bearings, depth soundings, and celestial "
            "navigation if available. Never rely on a single system that may be compromised."
        ),
    },
    {
        "order_index": 4,
        "question": "Why is network segmentation important on a vessel?",
        "options": [
            {"key": "A", "text": "It makes the internet faster for crew"},
            {"key": "B", "text": "It prevents a cyberattack on crew Wi-Fi from spreading to navigation or OT systems"},
            {"key": "C", "text": "It reduces electricity consumption onboard"},
            {"key": "D", "text": "It is only required for passenger vessels"},
        ],
        "correct_answer": "B",
        "explanation": (
            "Network segmentation isolates different networks (crew internet, administrative, "
            "navigation, OT/engine) so that a compromise in one segment cannot automatically "
            "spread to safety-critical systems."
        ),
    },
    {
        "order_index": 5,
        "question": "A service technician arrives onboard with a personal laptop to update navigation software. What should you do?",
        "options": [
            {"key": "A", "text": "Allow the technician to connect immediately to save time"},
            {"key": "B", "text": "Verify the work order, check identification, scan the laptop for malware, and supervise throughout"},
            {"key": "C", "text": "Leave the technician to work independently in the chart room"},
            {"key": "D", "text": "Ask the technician to email the update file instead"},
        ],
        "correct_answer": "B",
        "explanation": (
            "Before any external device is connected to vessel systems, verify the technician's "
            "identity and authorisation, scan their device for malware, and assign an officer to "
            "supervise every action taken. Never leave external parties unsupervised."
        ),
    },
    {
        "order_index": 6,
        "question": "You receive a WhatsApp message from someone claiming to be your company's IT department, asking you to confirm your login password urgently. What should you do?",
        "options": [
            {"key": "A", "text": "Reply with your password since it came from a known contact name"},
            {"key": "B", "text": "Ignore it — your company already has all passwords"},
            {"key": "C", "text": "Recognise this as a social engineering attempt and report it to the Master"},
            {"key": "D", "text": "Change your password and then reply with the new one"},
        ],
        "correct_answer": "C",
        "explanation": (
            "Legitimate IT departments never ask for passwords via messaging apps. "
            "This is a classic social engineering / phishing attempt. Report it to the "
            "Master and your DPA, and do not share any credentials."
        ),
    },
    {
        "order_index": 7,
        "question": "Which IMO resolution requires cyber risk management to be included in a vessel's Safety Management System?",
        "options": [
            {"key": "A", "text": "SOLAS Chapter V"},
            {"key": "B", "text": "IMO Resolution MSC.428(98)"},
            {"key": "C", "text": "MARPOL Annex VI"},
            {"key": "D", "text": "ISM Code Chapter 4"},
        ],
        "correct_answer": "B",
        "explanation": (
            "IMO Resolution MSC.428(98), adopted in 2017, requires that cyber risk management "
            "be appropriately addressed within SMS no later than the first annual verification "
            "after 1 January 2021."
        ),
    },
    {
        "order_index": 8,
        "question": "What is the FIRST step in the cyber incident response procedure onboard a vessel?",
        "options": [
            {"key": "A", "text": "Power off all affected computers immediately"},
            {"key": "B", "text": "Identify and contain the incident, then notify the Master"},
            {"key": "C", "text": "Post about it on the company intranet for awareness"},
            {"key": "D", "text": "Wait 24 hours to see if the system recovers on its own"},
        ],
        "correct_answer": "B",
        "explanation": (
            "The first steps are to identify signs of an incident and contain it by isolating "
            "the affected system (without powering off, to preserve evidence), then immediately "
            "notify the Master. Do not delay — early containment limits damage."
        ),
    },
    {
        "order_index": 9,
        "question": "A crew member finds a USB drive in the port parking lot with a label 'Crew Payroll Q4'. What should they do?",
        "options": [
            {"key": "A", "text": "Plug it into a vessel computer to check its contents"},
            {"key": "B", "text": "Hand it to the Chief Officer and report it without connecting it"},
            {"key": "C", "text": "Format it and use it as personal storage"},
            {"key": "D", "text": "Connect it to a personal phone first to check if it is safe"},
        ],
        "correct_answer": "B",
        "explanation": (
            "USB drives left in public places are a classic attack vector. The label is designed "
            "to trigger curiosity. Never plug it in. Hand it to the officer in charge and report "
            "it as a potential security threat."
        ),
    },
    {
        "order_index": 10,
        "question": "Which of the following best describes the 'Three Pillars of Cyber Safety' in maritime?",
        "options": [
            {"key": "A", "text": "Firewall, Antivirus, Backup"},
            {"key": "B", "text": "Captain, Chief Engineer, IT Officer"},
            {"key": "C", "text": "People, Process, Technology"},
            {"key": "D", "text": "Confidentiality, Integrity, Availability"},
        ],
        "correct_answer": "C",
        "explanation": (
            "The Three Pillars are People (trained and alert crew), Process (clear and enforced "
            "procedures), and Technology (firewalls, antivirus, access controls). All three must "
            "work together — a weakness in any one pillar leaves the vessel vulnerable."
        ),
    },
]


# ── Seed function ──────────────────────────────────────────────────────────────

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = (
            db.query(models.StudyMaterial)
            .filter(models.StudyMaterial.material_key == STUDY_MATERIAL["material_key"])
            .first()
        )
        if existing:
            print(f"Study material '{STUDY_MATERIAL['material_key']}' already exists. Skipping seed.")
            return

        # Create the top-level material
        material = models.StudyMaterial(**{k: v for k, v in STUDY_MATERIAL.items()})
        db.add(material)
        db.flush()  # get material.id

        # Create chapters and lessons
        for ch_data in CHAPTERS:
            lessons_data = ch_data["lessons"]
            chapter = models.Chapter(
                material_id=material.id,
                chapter_key=ch_data["chapter_key"],
                title=ch_data["title"],
                order_index=ch_data["order_index"],
            )
            db.add(chapter)
            db.flush()  # get chapter.id

            for lesson_data in lessons_data:
                lesson = models.Lesson(chapter_id=chapter.id, **lesson_data)
                db.add(lesson)

        # Create quiz questions
        for q_data in QUIZ_QUESTIONS:
            question = models.QuizQuestion(material_id=material.id, **q_data)
            db.add(question)

        db.commit()
        print(f"Seeded: '{material.title}'")
        print(f"  Chapters : {len(CHAPTERS)}")
        print(f"  Lessons  : {sum(len(ch['lessons']) for ch in CHAPTERS)}")
        print(f"  Quiz Q's : {len(QUIZ_QUESTIONS)}")

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
