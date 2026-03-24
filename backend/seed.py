"""
seed.py — Populate the study_materials, chapters, lessons, and quiz_questions tables.

Run once:
    source venv/Scripts/activate
    python seed.py
"""

from database import SessionLocal
from models import StudyMaterial, Chapter, Lesson, QuizQuestion

# Role visibility convention used throughout:
#   ALL_ROLES   — visible to every authenticated user (crew is the base level)
#   OFFICER_UP  — officers, department heads, admins only
#   DEPT_UP     — department heads and admins only

ALL_ROLES  = ["crew", "officer", "department_head", "admin"]
OFFICER_UP = ["officer", "department_head", "admin"]
DEPT_UP    = ["department_head", "admin"]

MATERIALS = [
    # ── 1. Maritime Cybersecurity Awareness (crew — everyone) ──────────────────
    {
        "material_key": "maritime-cyber-awareness",
        "title": "Maritime Cybersecurity Awareness",
        "description": "Core cyber-hygiene principles every crew member must know to protect vessel systems and personal data.",
        "icon": "🛡️",
        "total_duration": "1h 30min",
        "department": "general",
        "target_roles": ALL_ROLES,
        "order_index": 1,
        "chapters": [
            {
                "chapter_key": "ch1",
                "title": "Introduction to Maritime Cyber Threats",
                "order_index": 1,
                "lessons": [
                    {
                        "lesson_key": "l1",
                        "title": "What Is Maritime Cybersecurity?",
                        "duration": "15min",
                        "topics": ["Cyber risk in shipping", "IT vs OT systems", "IMO 2021 regulations"],
                        "content": (
                            "Maritime cybersecurity refers to the protection of information technology (IT) and operational "
                            "technology (OT) systems on board vessels and ashore against cyber threats.\n\n"
                            "Modern ships rely on integrated systems — navigation, propulsion, cargo management — many of "
                            "which are networked. A successful cyber attack can disable steering, falsify GPS data, or "
                            "disrupt engine controls.\n\n"
                            "The IMO Resolution MSC-FAL.1/Circ.3 requires ship operators to incorporate cyber risk "
                            "management into their Safety Management Systems (SMS) by January 2021."
                        ),
                    },
                    {
                        "lesson_key": "l2",
                        "title": "Common Attack Vectors at Sea",
                        "duration": "20min",
                        "topics": ["Phishing emails", "USB drops", "Unsecured Wi-Fi", "Remote access exploits"],
                        "content": (
                            "Attackers target maritime assets through several pathways:\n\n"
                            "Phishing — Crew members receive convincing emails posing as port authorities or shipping "
                            "agents. Clicking malicious links can install ransomware.\n\n"
                            "Physical media — USB drives left in crew areas or received from unknown sources can "
                            "auto-execute malware when plugged into ship systems.\n\n"
                            "Satellite / Wi-Fi links — Broadband connections used for crew welfare are often on the same "
                            "network as bridge systems. Attackers pivot from the crew network to critical OT systems.\n\n"
                            "Remote access — Vendor remote-maintenance ports left open between service calls are a "
                            "frequent entry point for threat actors."
                        ),
                    },
                ],
            },
            {
                "chapter_key": "ch2",
                "title": "Protecting Yourself and the Vessel",
                "order_index": 2,
                "lessons": [
                    {
                        "lesson_key": "l1",
                        "title": "Password & Account Hygiene",
                        "duration": "15min",
                        "topics": ["Strong passwords", "Multi-factor authentication", "Shared account risks"],
                        "content": (
                            "Weak credentials are the single most exploited vulnerability on ship systems.\n\n"
                            "Use passwords that are at least 12 characters long and combine uppercase letters, numbers, "
                            "and symbols. Never reuse passwords across systems.\n\n"
                            "Enable multi-factor authentication (MFA) wherever the system supports it — especially for "
                            "email and VPN access.\n\n"
                            "Never share login credentials with colleagues. Shared accounts make incident investigation "
                            "impossible and violate ISM accountability requirements."
                        ),
                    },
                    {
                        "lesson_key": "l2",
                        "title": "Incident Reporting Procedures",
                        "duration": "20min",
                        "topics": ["What to report", "How to report", "Escalation path", "No-blame culture"],
                        "content": (
                            "Early reporting is the most effective cyber defence available to crew.\n\n"
                            "Report immediately if you: notice unfamiliar programs running, find an unknown USB device "
                            "connected, receive a suspicious email requesting login credentials, or observe unusual "
                            "system behaviour (unexpected reboots, slow response, erratic displays).\n\n"
                            "The reporting path is: Ship Security Officer (SSO) → Master → Company Security Officer (CSO). "
                            "Do not attempt to fix the issue yourself — isolate the affected system first.\n\n"
                            "Maritime organisations operate a no-blame reporting culture. Reporting a suspected incident "
                            "promptly is always the right action regardless of how it occurred."
                        ),
                    },
                ],
            },
        ],
        "quiz_questions": [
            {
                "question": "Which IMO circular requires cyber risk management in the Safety Management System?",
                "options": [
                    {"key": "A", "text": "MSC-FAL.1/Circ.3"},
                    {"key": "B", "text": "SOLAS Chapter V"},
                    {"key": "C", "text": "MARPOL Annex VI"},
                    {"key": "D", "text": "ISM Code Section 9"},
                ],
                "correct_answer": "A",
                "explanation": "IMO Resolution MSC-FAL.1/Circ.3 (2017) provides guidelines on maritime cyber risk management, mandated through the ISM Code from January 2021.",
                "order_index": 1,
            },
            {
                "question": "What is the FIRST action to take when you suspect a cyber incident?",
                "options": [
                    {"key": "A", "text": "Try to remove the malware yourself"},
                    {"key": "B", "text": "Ignore it and monitor the situation"},
                    {"key": "C", "text": "Isolate the affected system and report to the SSO"},
                    {"key": "D", "text": "Reboot the system to clear the problem"},
                ],
                "correct_answer": "C",
                "explanation": "Isolating the system prevents spread. Reporting to the Ship Security Officer starts the proper escalation chain.",
                "order_index": 2,
            },
            {
                "question": "Which of the following is an example of an OT system on a vessel?",
                "options": [
                    {"key": "A", "text": "Crew email client"},
                    {"key": "B", "text": "Engine management system"},
                    {"key": "C", "text": "Onboard entertainment network"},
                    {"key": "D", "text": "HR payroll software"},
                ],
                "correct_answer": "B",
                "explanation": "Operational Technology (OT) systems directly control physical processes — engine management, steering, ballast systems, etc.",
                "order_index": 3,
            },
        ],
    },

    # ── 2. ECDIS Cybersecurity (crew — everyone) ──────────────────────────────
    {
        "material_key": "ecdis-cybersecurity",
        "title": "ECDIS Cybersecurity",
        "description": "Protecting Electronic Chart Display and Information Systems from GPS spoofing, chart tampering, and software vulnerabilities.",
        "icon": "🗺️",
        "total_duration": "1h 15min",
        "department": "deck",
        "target_roles": ALL_ROLES,
        "order_index": 2,
        "chapters": [
            {
                "chapter_key": "ch1",
                "title": "ECDIS Threat Landscape",
                "order_index": 1,
                "lessons": [
                    {
                        "lesson_key": "l1",
                        "title": "GPS Spoofing & GNSS Vulnerabilities",
                        "duration": "20min",
                        "topics": ["GPS spoofing definition", "Real-world incidents", "Detection indicators"],
                        "content": (
                            "GPS spoofing involves transmitting fake GPS signals that override the real satellite signals, "
                            "causing the ECDIS to display an incorrect vessel position.\n\n"
                            "Since 2016 there have been documented spoofing events in the Black Sea, Persian Gulf, and "
                            "Shanghai port approaches, where vessels have shown position jumps of several miles.\n\n"
                            "Detection indicators on ECDIS:\n"
                            "- Sudden jump in displayed position with no corresponding vessel motion\n"
                            "- Disagreement between GPS and radar/AIS targets\n"
                            "- GPS signal strength remains high but position drifts inland or to an airfield\n"
                            "- RAIM (Receiver Autonomous Integrity Monitoring) alarm activation\n\n"
                            "Cross-check ECDIS position against radar landmarks, visual bearings, and AIS at regular "
                            "intervals — especially in congested or politically sensitive waters."
                        ),
                    },
                    {
                        "lesson_key": "l2",
                        "title": "Chart Data Integrity",
                        "duration": "15min",
                        "topics": ["Official chart sources", "Update procedures", "Tampered chart risks"],
                        "content": (
                            "Electronic navigational charts (ENCs) must be sourced only from authorised distributors "
                            "approved by the relevant Hydrographic Office. Using charts from unofficial USB drives or "
                            "downloads introduces risk of tampered data.\n\n"
                            "A tampered chart might remove hazards, alter depth contours, or shift coastlines — "
                            "potentially causing grounding or collision.\n\n"
                            "Best practices:\n"
                            "- Update ENCs only via the official AVCS/PRIMAR/IC-ENC service\n"
                            "- Verify the digital signature / permit file before applying updates\n"
                            "- Log all chart update activities in the vessel's record system\n"
                            "- Never accept chart data via email attachment or personal USB"
                        ),
                    },
                ],
            },
            {
                "chapter_key": "ch2",
                "title": "ECDIS System Hardening",
                "order_index": 2,
                "lessons": [
                    {
                        "lesson_key": "l1",
                        "title": "Software Updates & Patch Management",
                        "duration": "20min",
                        "topics": ["Why updates matter", "Vendor patch process", "Testing before deployment"],
                        "content": (
                            "Unpatched ECDIS software is one of the most common vulnerabilities found during port state "
                            "control inspections. Vendors release security patches to fix known exploits.\n\n"
                            "The challenge at sea: applying patches while underway risks introducing instability to a "
                            "safety-critical system. Best practice is to:\n\n"
                            "1. Monitor vendor security bulletins (subscribe to email alerts)\n"
                            "2. Test patches on a shore-based simulator or backup unit first\n"
                            "3. Apply patches in port with a technician standing by\n"
                            "4. Verify ECDIS operation fully before departing\n"
                            "5. Keep a rollback image of the previous software version"
                        ),
                    },
                ],
            },
        ],
        "quiz_questions": [
            {
                "question": "What is the primary indicator of GPS spoofing on an ECDIS?",
                "options": [
                    {"key": "A", "text": "Loss of satellite signal entirely"},
                    {"key": "B", "text": "Sudden position jump inconsistent with vessel motion"},
                    {"key": "C", "text": "Slow chart loading"},
                    {"key": "D", "text": "Colour distortion on the chart display"},
                ],
                "correct_answer": "B",
                "explanation": "Spoofing inserts false position data, typically causing the displayed position to jump suddenly to an unrelated location while ship motion sensors show no corresponding movement.",
                "order_index": 1,
            },
            {
                "question": "Where should official ENCs be sourced from?",
                "options": [
                    {"key": "A", "text": "Any reputable website"},
                    {"key": "B", "text": "A colleague's USB drive with the latest charts"},
                    {"key": "C", "text": "Authorised distributors approved by the relevant Hydrographic Office"},
                    {"key": "D", "text": "Email attachments from the charterer"},
                ],
                "correct_answer": "C",
                "explanation": "Only charts from authorised distributors (AVCS, PRIMAR, IC-ENC) carry verified digital signatures ensuring data integrity.",
                "order_index": 2,
            },
        ],
    },

    # ── 3. Bridge Systems Advanced Security (officer+) ────────────────────────
    {
        "material_key": "bridge-systems-security",
        "title": "Bridge Systems Advanced Security",
        "description": "In-depth security management for integrated bridge systems — AIS, GMDSS, radar, and VDR — for officers and above.",
        "icon": "⚓",
        "total_duration": "2h 00min",
        "department": "navigation",
        "target_roles": OFFICER_UP,
        "order_index": 3,
        "chapters": [
            {
                "chapter_key": "ch1",
                "title": "AIS Security & Spoofing",
                "order_index": 1,
                "lessons": [
                    {
                        "lesson_key": "l1",
                        "title": "AIS Spoofing Threats",
                        "duration": "25min",
                        "topics": ["AIS spoofing methods", "Phantom vessel creation", "Collision risk scenarios"],
                        "content": (
                            "Automatic Identification System (AIS) data is transmitted without authentication, making it "
                            "trivially easy for an attacker to inject false vessel data.\n\n"
                            "Attack types:\n"
                            "- Phantom vessel injection: Creating non-existent vessels near real traffic to cause "
                            "  confusion or TCAS-style avoidance manoeuvres\n"
                            "- Target vessel manipulation: Altering another vessel's reported position, speed, or course\n"
                            "- Identity spoofing: Cloning a vessel's MMSI to impersonate it for fraudulent ATA reports\n\n"
                            "Officers must cross-validate AIS targets against radar returns. A vessel showing on AIS "
                            "with no corresponding radar echo is a strong spoofing indicator. Report discrepancies to "
                            "the MRCC and maintain a log entry."
                        ),
                    },
                    {
                        "lesson_key": "l2",
                        "title": "VDR Data Protection",
                        "duration": "20min",
                        "topics": ["VDR evidence value", "Tamper protection", "Post-incident preservation"],
                        "content": (
                            "The Voyage Data Recorder (VDR) is the maritime equivalent of an aircraft black box. Its "
                            "integrity is critical for accident investigation.\n\n"
                            "Officers are responsible for ensuring VDR data is NOT overwritten or tampered with after "
                            "a significant incident. Immediate actions:\n\n"
                            "1. Notify the Master and Company Security Officer\n"
                            "2. Activate the VDR's protected playback mode (consult manufacturer manual)\n"
                            "3. Do not restart or power-cycle the VDR\n"
                            "4. Preserve the capsule and document all access\n\n"
                            "Routine cyber protection: ensure only authorised personnel have access to the VDR maintenance "
                            "terminal. Change default passwords after installation."
                        ),
                    },
                ],
            },
            {
                "chapter_key": "ch2",
                "title": "Network Segmentation on the Bridge",
                "order_index": 2,
                "lessons": [
                    {
                        "lesson_key": "l1",
                        "title": "IT/OT Network Separation",
                        "duration": "25min",
                        "topics": ["VLAN design", "Firewall rules", "Maintenance access controls"],
                        "content": (
                            "Best practice architecture separates the bridge OT network (navigation, safety) from the "
                            "administrative IT network (email, crew welfare) using a firewall or data diode.\n\n"
                            "VLANs provide logical separation but are not sufficient alone — a misconfigured switch "
                            "can allow VLAN hopping. Physical network separation for the most critical systems "
                            "(ECDIS, autopilot, engine telegraph) is preferred.\n\n"
                            "Remote maintenance access by vendors should be:\n"
                            "- Time-limited (enabled only for the maintenance window)\n"
                            "- Logged with start/end timestamps\n"
                            "- Subject to officer supervision during the session\n"
                            "- Disabled immediately upon completion"
                        ),
                    },
                ],
            },
        ],
        "quiz_questions": [
            {
                "question": "How can an officer distinguish a spoofed AIS target from a real vessel?",
                "options": [
                    {"key": "A", "text": "Spoofed vessels always have an invalid MMSI"},
                    {"key": "B", "text": "Cross-validate AIS with radar — a real vessel shows a radar echo"},
                    {"key": "C", "text": "Check the vessel's name against port records"},
                    {"key": "D", "text": "Spoofed AIS targets always move at unrealistic speeds"},
                ],
                "correct_answer": "B",
                "explanation": "Radar return is independent of AIS. A spoofed phantom vessel will appear on AIS but have no corresponding radar echo.",
                "order_index": 1,
            },
            {
                "question": "After a significant incident, what is the FIRST VDR-related action?",
                "options": [
                    {"key": "A", "text": "Restart the VDR to ensure data is saved"},
                    {"key": "B", "text": "Delete sensitive data before port arrival"},
                    {"key": "C", "text": "Notify the Master and activate protected playback mode"},
                    {"key": "D", "text": "Copy VDR data to a personal USB for safekeeping"},
                ],
                "correct_answer": "C",
                "explanation": "Restarting or copying VDR data risks overwriting evidence. The correct action is to notify the Master and use the VDR's protected mode.",
                "order_index": 2,
            },
            {
                "question": "Why are VLANs alone insufficient for bridge OT network security?",
                "options": [
                    {"key": "A", "text": "VLANs slow down network traffic"},
                    {"key": "B", "text": "A misconfigured switch can allow VLAN hopping"},
                    {"key": "C", "text": "VLANs are only supported on older equipment"},
                    {"key": "D", "text": "VLANs cannot carry navigation data"},
                ],
                "correct_answer": "B",
                "explanation": "VLAN hopping exploits misconfigured trunk ports, allowing an attacker on one VLAN to access another. Physical separation is required for safety-critical OT systems.",
                "order_index": 3,
            },
        ],
    },

    # ── 4. Department Security Management (department_head+) ──────────────────
    {
        "material_key": "dept-security-management",
        "title": "Department Security Management",
        "description": "Policies, risk assessments, and crew training responsibilities for department heads managing shipboard cybersecurity programmes.",
        "icon": "📋",
        "total_duration": "1h 45min",
        "department": "general",
        "target_roles": DEPT_UP,
        "order_index": 4,
        "chapters": [
            {
                "chapter_key": "ch1",
                "title": "Cyber Risk Assessment",
                "order_index": 1,
                "lessons": [
                    {
                        "lesson_key": "l1",
                        "title": "Conducting a Shipboard Cyber Risk Assessment",
                        "duration": "30min",
                        "topics": ["Asset inventory", "Threat identification", "Vulnerability mapping", "Risk scoring"],
                        "content": (
                            "A cyber risk assessment follows the standard maritime risk management cycle adapted for "
                            "cyber threats:\n\n"
                            "Step 1 — Asset Inventory: List all systems that use software or are networked. Include "
                            "ECDIS, AIS, GMDSS, engine management, CCTV, crew Wi-Fi, and vendor remote access systems.\n\n"
                            "Step 2 — Threat Identification: For each asset, identify realistic threat scenarios "
                            "(ransomware, spoofing, unauthorised access, physical tampering).\n\n"
                            "Step 3 — Vulnerability Mapping: Identify weaknesses — default passwords, unpatched software, "
                            "open remote access ports, lack of network segmentation.\n\n"
                            "Step 4 — Risk Scoring: Use a likelihood × consequence matrix. Document in the SMS and "
                            "review annually or after any significant change to shipboard systems.\n\n"
                            "The BIMCO Guidelines on Cyber Security (5th Edition) provide a recommended framework "
                            "aligned with ISM Code requirements."
                        ),
                    },
                    {
                        "lesson_key": "l2",
                        "title": "Crew Training & Drills",
                        "duration": "25min",
                        "topics": ["Training frequency", "Drill scenarios", "Measuring effectiveness", "Records"],
                        "content": (
                            "Department heads are responsible for ensuring their team is trained to recognise and respond "
                            "to cyber incidents.\n\n"
                            "Minimum training requirements under the ISM Code and IMO guidelines:\n"
                            "- Annual cyber awareness refresher for all crew\n"
                            "- Role-specific training for personnel who operate networked systems\n"
                            "- At least one cyber incident drill per voyage (or per quarter for vessels on long voyages)\n\n"
                            "Effective drill scenarios include:\n"
                            "- Simulated phishing email — who clicks? who reports?\n"
                            "- ECDIS position anomaly exercise — bridge team response\n"
                            "- Ransomware lockout — can the vessel operate on fallback systems?\n\n"
                            "Record all training in the crew training matrix and retain for port state control inspection."
                        ),
                    },
                ],
            },
        ],
        "quiz_questions": [
            {
                "question": "What is the first step in a shipboard cyber risk assessment?",
                "options": [
                    {"key": "A", "text": "Scoring vulnerability severity"},
                    {"key": "B", "text": "Creating an asset inventory"},
                    {"key": "C", "text": "Identifying threat actors"},
                    {"key": "D", "text": "Drafting an incident response plan"},
                ],
                "correct_answer": "B",
                "explanation": "You cannot assess risk for systems you don't know exist. Asset inventory is always the first step in any risk assessment framework.",
                "order_index": 1,
            },
            {
                "question": "How often should cyber incident drills be conducted at minimum?",
                "options": [
                    {"key": "A", "text": "Once every 3 years"},
                    {"key": "B", "text": "Only when required by port state control"},
                    {"key": "C", "text": "At least once per voyage or per quarter"},
                    {"key": "D", "text": "Monthly, regardless of voyage length"},
                ],
                "correct_answer": "C",
                "explanation": "IMO guidelines and the ISM Code recommend at least one cyber drill per voyage (or quarterly for long voyages) to maintain crew readiness.",
                "order_index": 2,
            },
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(StudyMaterial).count()
        if existing > 0:
            print(f"Database already has {existing} study material(s). Skipping seed.")
            return

        for mat_data in MATERIALS:
            chapters_data = mat_data.pop("chapters")
            quiz_data = mat_data.pop("quiz_questions")

            material = StudyMaterial(**mat_data)
            db.add(material)
            db.flush()  # get material.id

            for ch_data in chapters_data:
                lessons_data = ch_data.pop("lessons")
                chapter = Chapter(material_id=material.id, **ch_data)
                db.add(chapter)
                db.flush()

                for idx, le_data in enumerate(lessons_data):
                    lesson = Lesson(chapter_id=chapter.id, order_index=idx + 1, **le_data)
                    db.add(lesson)

            for q_data in quiz_data:
                question = QuizQuestion(material_id=material.id, **q_data)
                db.add(question)

        db.commit()
        print(f"Seeded {len(MATERIALS)} study materials successfully.")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
