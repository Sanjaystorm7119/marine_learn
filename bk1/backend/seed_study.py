"""
Run once to populate study_modules, study_topics, and study_quiz_questions.
    python seed_study.py
"""

from database import SessionLocal
from models import StudyModule, StudyTopic, StudyQuizQuestion

MODULES = [
    {
        "title": "Module 1: Maritime Cyber Threats",
        "description": "Understand the cyber threat landscape facing modern vessels and maritime infrastructure.",
        "order_num": 1,
        "topics": [
            {
                "title": "Introduction to Maritime Cybersecurity",
                "order_num": 1,
                "content": (
                    "Modern vessels rely heavily on interconnected digital systems — ECDIS, AIS, GMDSS, SCADA, "
                    "and satellite communications. This interconnectivity brings efficiency but also exposes ships "
                    "to cyber threats that were unimaginable a decade ago.\n\n"
                    "The International Maritime Organization (IMO) Resolution MSC-FAL.1/Circ.3 defines maritime "
                    "cyber risk as 'the extent to which a technology asset is threatened by a potential circumstance "
                    "or event, which may result in shipping-related operational, safety or security failures.'\n\n"
                    "Key threat categories include:\n"
                    "• Phishing and social engineering targeting crew\n"
                    "• Malware introduced via USB drives or infected software updates\n"
                    "• GPS/GNSS spoofing and jamming\n"
                    "• Ransomware targeting OT and IT systems\n"
                    "• Unauthorised remote access to vessel systems"
                ),
            },
            {
                "title": "GPS Spoofing and GNSS Vulnerabilities",
                "order_num": 2,
                "content": (
                    "GPS spoofing involves broadcasting counterfeit GPS signals to deceive a vessel's navigation "
                    "systems into reporting a false position. This is particularly dangerous in congested waterways "
                    "and near ports.\n\n"
                    "Notable incidents:\n"
                    "• 2017 Black Sea incident — over 20 vessels reported false positions near Novorossiysk\n"
                    "• Repeated spoofing events around the Strait of Hormuz affecting AIS data\n\n"
                    "Detection methods:\n"
                    "• Cross-check GPS position against radar, AIS, and celestial navigation\n"
                    "• Monitor for sudden position jumps or heading anomalies\n"
                    "• Use multi-constellation receivers (GPS + GLONASS + Galileo)\n\n"
                    "IMO requires vessels to maintain the ability to determine position by means independent of "
                    "electronic navigation systems as a fallback."
                ),
            },
            {
                "title": "AIS Security and Spoofing",
                "order_num": 3,
                "content": (
                    "The Automatic Identification System (AIS) was designed for collision avoidance and vessel "
                    "tracking — not security. AIS messages are transmitted unencrypted and unauthenticated, "
                    "making them trivially easy to spoof.\n\n"
                    "Attack vectors:\n"
                    "• Ghost vessels — injecting fake AIS targets to mislead OOWs\n"
                    "• Hiding real vessels by transmitting no signal (AIS silence)\n"
                    "• Manipulating CPA/TCPA calculations by broadcasting false speed/heading\n\n"
                    "Best practice:\n"
                    "• Never rely solely on AIS for collision avoidance — always use radar\n"
                    "• Be suspicious of AIS targets that do not appear on radar\n"
                    "• Report AIS anomalies to the relevant MRCC"
                ),
            },
        ],
        "quiz_questions": [
            {
                "question": "Which IMO resolution establishes guidelines for maritime cyber risk management?",
                "options": ["MSC-FAL.1/Circ.3", "SOLAS Chapter V", "MARPOL Annex VI", "ISM Code Section 9"],
                "correct_answer": 0,
                "explanation": "IMO MSC-FAL.1/Circ.3 provides guidelines on maritime cyber risk management.",
                "order_num": 1,
            },
            {
                "question": "What is GPS spoofing?",
                "options": [
                    "Jamming GPS signals to deny positioning",
                    "Broadcasting counterfeit GPS signals to cause false position readings",
                    "Hacking into the GPS satellite network",
                    "Intercepting GPS data from other vessels",
                ],
                "correct_answer": 1,
                "explanation": "GPS spoofing broadcasts fake GPS signals that override genuine satellite signals, causing the receiver to report a false position.",
                "order_num": 2,
            },
            {
                "question": "Why is AIS considered insecure by design?",
                "options": [
                    "It uses outdated VHF radio frequencies",
                    "It requires expensive hardware to operate",
                    "Messages are transmitted unencrypted and unauthenticated",
                    "It can only track vessels within 20 nautical miles",
                ],
                "correct_answer": 2,
                "explanation": "AIS was designed for collision avoidance, not security. Its messages have no encryption or authentication, allowing anyone to spoof or manipulate them.",
                "order_num": 3,
            },
            {
                "question": "What should an OOW do if an AIS target does not appear on radar?",
                "options": [
                    "Assume the vessel is a submarine",
                    "Trust the AIS reading and alter course accordingly",
                    "Be suspicious — it may be a spoofed AIS target",
                    "Switch off AIS to avoid interference",
                ],
                "correct_answer": 2,
                "explanation": "AIS targets that cannot be confirmed by radar should be treated with suspicion as they may be ghost vessels injected by an attacker.",
                "order_num": 4,
            },
            {
                "question": "Which combination of navigation systems best defends against GPS spoofing?",
                "options": [
                    "GPS only with frequent software updates",
                    "Multi-constellation GNSS receiver plus radar and celestial navigation cross-check",
                    "AIS and ECDIS only",
                    "Relying on port authority positioning services",
                ],
                "correct_answer": 1,
                "explanation": "Using multiple independent positioning sources — multi-constellation GNSS, radar, and celestial navigation — makes spoofing much harder to go undetected.",
                "order_num": 5,
            },
        ],
    },
    {
        "title": "Module 2: Crew Cyber Hygiene",
        "description": "Practical cybersecurity habits every crew member must follow to protect vessel systems.",
        "order_num": 2,
        "topics": [
            {
                "title": "Phishing Awareness for Seafarers",
                "order_num": 1,
                "content": (
                    "Phishing is the number-one entry point for cyberattacks on vessels. Crew members receive "
                    "emails from fake shipping companies, flag states, or port authorities designed to steal "
                    "credentials or install malware.\n\n"
                    "Red flags in phishing emails:\n"
                    "• Urgent or threatening language ('Your account will be suspended')\n"
                    "• Sender address doesn't match the organisation's real domain\n"
                    "• Links that look similar to real URLs (e.g., maers-k.com instead of maersk.com)\n"
                    "• Unexpected attachments, especially .exe, .zip, or Office macros\n\n"
                    "What to do:\n"
                    "1. Do not click links — navigate to the website directly\n"
                    "2. Verify unexpected requests via a separate channel (phone call)\n"
                    "3. Report suspicious emails to your IT officer or master\n"
                    "4. Never enter credentials on a page you reached via an email link"
                ),
            },
            {
                "title": "USB and Removable Media Policy",
                "order_num": 2,
                "content": (
                    "Removable media such as USB drives are one of the most common vectors for introducing "
                    "malware onto vessel systems. The 2017 NotPetya attack — which cost Maersk an estimated "
                    "$300 million — originated partly through infected removable media.\n\n"
                    "Vessel policy on removable media:\n"
                    "• Only company-approved and scanned USB drives may be connected to bridge or engine room computers\n"
                    "• Personal USB drives must never be connected to operational technology (OT) systems\n"
                    "• All new media must be scanned with an up-to-date antivirus tool before use\n"
                    "• Media found onboard of unknown origin must be reported to the master — do not plug it in\n\n"
                    "Autorun must be disabled on all vessel computers. If a computer prompts you to run a program "
                    "when you insert a drive, disconnect the drive immediately and report it."
                ),
            },
            {
                "title": "Password Security and Account Management",
                "order_num": 3,
                "content": (
                    "Weak or shared passwords are responsible for a large proportion of maritime cyber incidents. "
                    "Many vessels still operate with manufacturer default passwords on routers, ECDIS units, "
                    "and VSAT terminals.\n\n"
                    "Password requirements:\n"
                    "• Minimum 12 characters, mix of upper/lower case, numbers, and symbols\n"
                    "• Unique password for every system — never reuse passwords\n"
                    "• Change all default passwords during commissioning\n"
                    "• Passwords must not be written on sticky notes or stored in unencrypted files\n\n"
                    "Account management:\n"
                    "• Each crew member must have their own account — no shared logins\n"
                    "• Accounts of departed crew must be disabled within 24 hours of signing off\n"
                    "• Admin/root accounts should only be used when necessary\n\n"
                    "Use a password manager approved by your company to store credentials securely."
                ),
            },
        ],
        "quiz_questions": [
            {
                "question": "Which of the following is a red flag indicating a phishing email?",
                "options": [
                    "The email is from your company's official domain",
                    "The email contains an urgent request to click a link and enter your password",
                    "The email has the company logo in the header",
                    "The email was sent during business hours",
                ],
                "correct_answer": 1,
                "explanation": "Urgency combined with a request to click a link and enter credentials is a classic phishing indicator.",
                "order_num": 1,
            },
            {
                "question": "What should you do if you find a USB drive of unknown origin onboard?",
                "options": [
                    "Plug it in to see who it belongs to",
                    "Scan it with your phone before using it",
                    "Report it to the master without plugging it in",
                    "Format it and reuse it",
                ],
                "correct_answer": 2,
                "explanation": "Unknown USB drives could contain malware. Never plug them in — report to the master immediately.",
                "order_num": 2,
            },
            {
                "question": "How soon must accounts of crew who have signed off be disabled?",
                "options": ["Within 1 week", "Within 48 hours", "Within 24 hours", "At the next port call"],
                "correct_answer": 2,
                "explanation": "Departed crew accounts should be disabled within 24 hours to prevent unauthorised access.",
                "order_num": 3,
            },
            {
                "question": "What is the minimum recommended password length for vessel systems?",
                "options": ["6 characters", "8 characters", "10 characters", "12 characters"],
                "correct_answer": 3,
                "explanation": "A minimum of 12 characters with mixed character types provides adequate resistance to brute-force attacks.",
                "order_num": 4,
            },
            {
                "question": "The 2017 NotPetya attack cost Maersk approximately how much?",
                "options": ["$10 million", "$50 million", "$300 million", "$1 billion"],
                "correct_answer": 2,
                "explanation": "NotPetya cost Maersk an estimated $300 million and disrupted global shipping operations for weeks.",
                "order_num": 5,
            },
        ],
    },
    {
        "title": "Module 3: OT and IT Network Security",
        "description": "Understanding the separation between operational technology and IT networks on modern vessels.",
        "order_num": 3,
        "topics": [
            {
                "title": "IT vs OT Systems on Vessels",
                "order_num": 1,
                "content": (
                    "Modern vessels run two distinct types of networked systems:\n\n"
                    "IT (Information Technology) systems:\n"
                    "• Crew internet access, email, entertainment systems\n"
                    "• Administrative software (port documentation, payroll)\n"
                    "• Updates are frequent; uptime can tolerate brief interruptions\n\n"
                    "OT (Operational Technology) systems:\n"
                    "• ECDIS, radar, autopilot, engine management, power management\n"
                    "• SCADA and PLC systems controlling physical equipment\n"
                    "• Availability is safety-critical — a crash at sea could be catastrophic\n\n"
                    "The key principle is network segmentation: OT networks must be isolated from IT networks "
                    "and from the internet. Any bridge between them (e.g., for software updates) must be "
                    "tightly controlled with firewalls and jump hosts."
                ),
            },
            {
                "title": "Network Segmentation and Firewalls",
                "order_num": 2,
                "content": (
                    "Network segmentation divides the vessel's network into zones with different trust levels, "
                    "limiting how far an attacker can move if they compromise one system.\n\n"
                    "Recommended vessel network zones:\n"
                    "1. Navigation zone (bridge systems — highest security)\n"
                    "2. Engine/machinery zone (SCADA, PLCs)\n"
                    "3. Crew IT zone (email, internet — isolated from zones 1 and 2)\n"
                    "4. Guest/passenger zone (completely isolated)\n\n"
                    "Firewall rules should follow the principle of least privilege — only allow the traffic "
                    "that is explicitly needed between zones. All other traffic should be denied by default.\n\n"
                    "Unmanaged switches and consumer-grade routers must never be connected to OT networks."
                ),
            },
        ],
        "quiz_questions": [
            {
                "question": "Which of the following is an OT system on a vessel?",
                "options": [
                    "Crew email server",
                    "Passenger Wi-Fi router",
                    "Engine SCADA control system",
                    "Payroll software",
                ],
                "correct_answer": 2,
                "explanation": "SCADA systems that control physical machinery are Operational Technology (OT) — distinct from IT systems used for administration and communication.",
                "order_num": 1,
            },
            {
                "question": "What is the primary purpose of network segmentation on a vessel?",
                "options": [
                    "To improve internet speed for crew",
                    "To limit how far an attacker can move if one system is compromised",
                    "To reduce the number of IP addresses needed",
                    "To comply with MARPOL regulations",
                ],
                "correct_answer": 1,
                "explanation": "Segmentation contains breaches — if an attacker compromises the crew IT network, they should not be able to reach the navigation or engine systems.",
                "order_num": 2,
            },
            {
                "question": "What principle should govern firewall rules between vessel network zones?",
                "options": [
                    "Allow all traffic by default, block known threats",
                    "Allow traffic needed for work, deny everything else",
                    "Only block traffic at night",
                    "Allow all internal traffic, block only external",
                ],
                "correct_answer": 1,
                "explanation": "The principle of least privilege means only explicitly needed traffic is permitted — all other traffic is denied by default.",
                "order_num": 3,
            },
            {
                "question": "Why is OT availability considered safety-critical?",
                "options": [
                    "OT systems are expensive to replace",
                    "OT systems control physical equipment — a crash could endanger the vessel",
                    "OT systems store sensitive crew data",
                    "Flag state regulations require OT uptime guarantees",
                ],
                "correct_answer": 1,
                "explanation": "OT systems control propulsion, navigation, and power management. Unexpected downtime at sea can directly threaten the safety of the vessel and crew.",
                "order_num": 4,
            },
            {
                "question": "Which device should never be connected to an OT network?",
                "options": [
                    "A managed industrial firewall",
                    "A dedicated jump host for updates",
                    "A consumer-grade home router",
                    "A dedicated SCADA workstation",
                ],
                "correct_answer": 2,
                "explanation": "Consumer-grade routers lack the security controls needed for OT environments and should never be used on vessel operational networks.",
                "order_num": 5,
            },
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(StudyModule).count()
        if existing:
            print(f"Database already has {existing} module(s). Skipping seed.")
            return

        for mod_data in MODULES:
            module = StudyModule(
                title=mod_data["title"],
                description=mod_data["description"],
                order_num=mod_data["order_num"],
            )
            db.add(module)
            db.flush()  # get module.id

            for t in mod_data["topics"]:
                db.add(StudyTopic(
                    module_id=module.id,
                    title=t["title"],
                    content=t["content"],
                    order_num=t["order_num"],
                ))

            for q in mod_data["quiz_questions"]:
                db.add(StudyQuizQuestion(
                    module_id=module.id,
                    question=q["question"],
                    options=q["options"],
                    correct_answer=q["correct_answer"],
                    explanation=q["explanation"],
                    order_num=q["order_num"],
                ))

        db.commit()
        print(f"Seeded {len(MODULES)} modules successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
