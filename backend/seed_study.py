"""
Run once to populate study_modules, study_topics, and study_quiz_questions.
    python seed_study.py
"""

from database import SessionLocal
from models import Course, StudyModule, StudyTopic, StudyQuizQuestion

MODULES = [
    {
        "title": "Module 1: Introduction & Foundations of Maritime Cybersecurity",
        "description": "Understand what maritime cybersecurity is, why it matters, and the core principles that protect digital ship operations.",
        "order_num": 1,
        "topics": [
            {
                "title": "Introduction to Maritime Cybersecurity",
                "order_num": 1,
                "content": (
                    "Modern ships operate as floating digital environments where critical shipboard "
                    "functions depend on interconnected digital technologies. Core operations such as "
                    "navigation, engine and propulsion control, cargo handling, communication systems, "
                    "and crew welfare services rely heavily on computers, onboard networks, and "
                    "satellite-based connectivity.\n\n"
                    "THE REALITY OF CYBER RISK AT SEA\n\n"
                    "Unlike physical threats such as fire, collision, or grounding, cyberattacks may "
                    "occur without immediate physical warning signs. Cyber risks in the maritime "
                    "domain differ from traditional maritime hazards — they are often silent, unseen, "
                    "and difficult to detect until damage has already occurred.\n\n"
                    "Key realities:\n"
                    "• Cyber threats in maritime environments are invisible but highly dangerous\n"
                    "• Over 90% of global trade is transported by sea, making vessels attractive "
                    "targets for cybercriminals and state-sponsored attackers\n"
                    "• A single cyber incident can manipulate navigation systems, disable engines or "
                    "propulsion, disrupt cargo operations, and interrupt global supply chains\n"
                    "• These risks highlight why cybersecurity must be treated as a core component of "
                    "maritime safety management\n\n"
                    "KEY TRUTH FOR CREW\n\n"
                    "Cybersecurity is not only an IT responsibility. It is a critical safety issue, "
                    "comparable in importance to fire prevention, emergency preparedness, and collision "
                    "avoidance.\n\n"
                    "Simple human actions can unintentionally trigger serious cyber incidents, including:\n"
                    "• Clicking on malicious emails or links\n"
                    "• Using infected USB devices\n"
                    "• Creating weak or reused passwords\n"
                    "• Leaving systems unattended and unlocked\n\n"
                    "PREVENTION AND AWARENESS\n\n"
                    "The majority of maritime cyber incidents are preventable by improving "
                    "cybersecurity awareness, maintaining basic digital hygiene, and strictly following "
                    "company and shipboard cybersecurity procedures."
                ),
            },
            {
                "title": "Why Cybersecurity Matters in Maritime",
                "order_num": 2,
                "content": (
                    "Cybersecurity is no longer a technical or administrative concern — it is a core "
                    "maritime safety, environmental, and business risk.\n\n"
                    "NAVIGATION SAFETY: WHEN THE SHIP IS LED ASTRAY\n\n"
                    "Modern vessels rely extensively on digital navigation systems such as GPS, ECDIS, "
                    "and AIS to ensure safe passage. Cyber attackers can manipulate or spoof navigation "
                    "data, causing vessels to unknowingly deviate from their intended route while all "
                    "systems appear to function normally.\n\n"
                    "Potential Impact:\n"
                    "• Collisions with other vessels\n"
                    "• Grounding incidents\n"
                    "• Entry into restricted or high-risk waters\n"
                    "• Loss of situational awareness without visible warning signs\n\n"
                    "CREW SAFETY: WHEN SYSTEMS TURN AGAINST YOU\n\n"
                    "Shipboard operational technology (OT) systems such as engine automation, ballast "
                    "control, and power management systems are increasingly automated and "
                    "network-connected. If compromised, these systems can behave unpredictably or fail "
                    "completely.\n\n"
                    "Cyber incidents may result in:\n"
                    "• Unexpected engine shutdowns\n"
                    "• Unstable or incorrect ballast operations\n"
                    "• Total loss of electrical power (blackout)\n"
                    "• Life-threatening emergencies\n\n"
                    "ENVIRONMENTAL PROTECTION: WHEN NATURE PAYS THE PRICE\n\n"
                    "Cyberattacks can directly impact systems responsible for environmental safety. "
                    "A compromised system may trigger or fail to prevent:\n"
                    "• Oil spills and fuel leaks\n"
                    "• Release of hazardous or dangerous cargo\n"
                    "• Irreversible damage to marine ecosystems\n\n"
                    "BUSINESS CONTINUITY: WHEN THE WORLD STOPS MOVING\n\n"
                    "Case Study — NotPetya Cyberattack on Maersk (2017):\n"
                    "• Ports and terminals worldwide were shut down\n"
                    "• Operations halted for several days\n"
                    "• Estimated financial losses of USD 250–300 million\n"
                    "• Significant disruption to global trade and logistics\n\n"
                    "REGULATORY COMPLIANCE: CYBERSECURITY IS NOW THE LAW\n\n"
                    "The International Maritime Organization (IMO) mandates cyber risk management "
                    "under IMO Resolution MSC.428(98). Shipping companies must integrate cyber risk "
                    "management into their Safety Management System (SMS).\n\n"
                    "Failure to comply may result in vessel detention, regulatory penalties, loss of "
                    "certification, and operational restrictions."
                ),
            },
            {
                "title": "Cybersecurity Fundamentals",
                "order_num": 3,
                "content": (
                    "WHAT IS CYBERSECURITY?\n\n"
                    "Cybersecurity means protecting the ship's digital systems from attackers who try "
                    "to steal information, damage systems, or take control of operations. A cyberattack "
                    "does not need weapons or force — it can start with a USB drive, a malicious email, "
                    "an unlocked system, or outdated software.\n\n"
                    "If the ship runs on computers, it can be attacked.\n\n"
                    "THE CIA TRIAD: THREE PRINCIPLES FOR DIGITAL SAFETY\n\n"
                    "• Confidentiality: Only authorized people access ship data and systems\n"
                    "• Integrity: Information remains accurate and unaltered\n"
                    "• Availability: Systems work when needed, especially during critical operations\n\n"
                    "Ask yourself: What happens if ECDIS, engine control, or power systems are "
                    "unavailable during an emergency?\n\n"
                    "ESSENTIAL CYBER TERMS FOR SEAFARERS\n\n"
                    "• Malware: Harmful software that damages or spies on systems\n"
                    "• Ransomware: Locks important files and demands money to unlock them\n"
                    "• Phishing: Fake messages designed to trick users into clicking links or sharing "
                    "passwords\n"
                    "• Firewall: Digital security gate controlling what enters/exits ship systems\n"
                    "• Patch: Software update fixing known security holes\n"
                    "• Vulnerability: A weakness that attackers exploit, often caused by poor habits or "
                    "outdated systems\n\n"
                    "Critical Insight: Attackers don't hack ships — they exploit human mistakes.\n\n"
                    "THE THREE PILLARS OF CYBER SAFETY\n\n"
                    "PEOPLE — Trained, alert crew members who understand cyber risks and think "
                    "carefully before clicking links, opening emails, connecting USB devices, or sharing "
                    "information.\n\n"
                    "PROCESS — Clear and enforced procedures for safe use of computers, email systems, "
                    "removable media, passwords, and incident reporting.\n\n"
                    "TECHNOLOGY — Properly configured shipboard systems supported by firewalls, "
                    "antivirus software, access controls, network segregation, and regular system "
                    "updates.\n\n"
                    "Why All Three Pillars Matter:\n"
                    "• People alone are not enough without clear rules and technical protection\n"
                    "• Technology alone cannot prevent human error\n"
                    "• Processes fail if people do not follow them\n\n"
                    "MARITIME SAFETY PERSPECTIVE\n\n"
                    "In the maritime environment, a well-trained crew (People), following approved "
                    "procedures (Process), supported by secure and maintained systems (Technology), "
                    "creates a strong defence against cyber incidents — just like safety management "
                    "for fire, collision, or pollution prevention."
                ),
            },
        ],
        "quiz_questions": [
            {
                "question": "What percentage of global trade is transported by sea, making vessels attractive targets for cybercriminals?",
                "options": ["70%", "80%", "90%", "95%"],
                "correct_answer": 2,
                "explanation": "Over 90% of global trade is transported by sea, making vessels and maritime infrastructure highly attractive targets for cybercriminals and state-sponsored attackers.",
                "order_num": 1,
            },
            {
                "question": "What does the 'I' in the CIA Triad stand for in cybersecurity?",
                "options": ["Intelligence", "Integrity", "Internet", "Isolation"],
                "correct_answer": 1,
                "explanation": "The CIA Triad stands for Confidentiality, Integrity, and Availability. Integrity means that information remains accurate and unaltered.",
                "order_num": 2,
            },
            {
                "question": "Which of the following is NOT one of the Three Pillars of Cyber Safety?",
                "options": ["People", "Process", "Technology", "Protocol"],
                "correct_answer": 3,
                "explanation": "The Three Pillars of Cyber Safety are People, Process, and Technology. Protocol is not one of the named pillars.",
                "order_num": 3,
            },
            {
                "question": "Cybersecurity is described as comparable in importance to which of the following for crew?",
                "options": ["Administrative paperwork", "Fire prevention and emergency preparedness", "Cargo documentation", "Port entry procedures"],
                "correct_answer": 1,
                "explanation": "Cybersecurity is a critical safety issue comparable in importance to fire prevention, emergency preparedness, and collision avoidance — not just an IT responsibility.",
                "order_num": 4,
            },
            {
                "question": "Under which IMO Resolution is cyber risk management mandated in the Safety Management System (SMS)?",
                "options": ["MSC.428(98)", "STCW.2010", "SOLAS.74", "ISM.001"],
                "correct_answer": 0,
                "explanation": "IMO Resolution MSC.428(98) mandates that cyber risk management must be included in the Safety Management System (SMS) of all shipping companies.",
                "order_num": 5,
            },
        ],
    },
    {
        "title": "Module 2: Cyber Threats & Vulnerable Maritime Systems",
        "description": "Identify the major cyber threats targeting vessels at sea and understand which critical systems are most at risk.",
        "order_num": 2,
        "topics": [
            {
                "title": "Common Cyber Threats at Sea",
                "order_num": 1,
                "content": (
                    "PHISHING: THE MOST DANGEROUS MESSAGE YOU'LL EVER READ\n\n"
                    "Attackers send fake emails, SMS, or WhatsApp messages pretending to be port "
                    "authorities, company headquarters, charterers, or suppliers.\n\n"
                    "Red flags: Messages that create urgency or fear, demand immediate action, or "
                    "request login details.\n\n"
                    "Defense: Verify sender through a secondary communication channel before acting.\n\n"
                    "RANSOMWARE: DIGITAL HOSTAGE TAKING\n\n"
                    "Ransomware locks important systems and files, demanding payment for restoration.\n\n"
                    "Real Maritime Incidents:\n"
                    "• COSCO (2018): Terminal operations disrupted, email systems locked\n"
                    "• Port of San Diego (2018): Critical IT systems compromised, port operations "
                    "delayed\n\n"
                    "Impact: Imagine losing access to ship documents, cargo data, or operational systems "
                    "mid-voyage.\n\n"
                    "MALWARE VIA REMOVABLE MEDIA: THE INFECTED USB TRAP\n\n"
                    "USB drives, external hard disks, or contractor laptops can carry malware that "
                    "infects navigation systems, spreads into OT networks, and disables critical "
                    "controls.\n\n"
                    "A free USB can cost the ship millions.\n\n"
                    "GPS SPOOFING: WHEN THE BRIDGE IS LIED TO\n\n"
                    "Attackers transmit fake GPS signals, causing wrong position displayed on "
                    "GPS/ECDIS, false course and speed data, and increased grounding and collision "
                    "risk.\n\n"
                    "The ship may be off-course while the screen shows 'safe waters.'\n\n"
                    "AIS MANIPULATION: SHIPS THAT DON'T EXIST\n\n"
                    "Attackers can hide real vessels, create phantom ships on AIS, and broadcast false "
                    "vessel identity or position.\n\n"
                    "Impact: Poor collision avoidance decisions in congested waters.\n\n"
                    "UNAUTHORIZED ACCESS: ONE UNLOCKED SCREEN IS ENOUGH\n\n"
                    "Leaving systems unattended or protected with weak passwords allows physical "
                    "system access, remote unauthorized access, and data theft or manipulation.\n\n"
                    "An unlocked console is an open door.\n\n"
                    "SOCIAL ENGINEERING: WHEN ATTACKERS SOUND HELPFUL\n\n"
                    "Attackers pose as IT support staff, port inspection officers, or company "
                    "technicians. They use politeness, authority, and urgency to gain access.\n\n"
                    "If someone asks for passwords or system access, it's a red flag."
                ),
            },
            {
                "title": "Maritime IT, OT & Integrated Systems",
                "order_num": 2,
                "content": (
                    "Modern vessels are no longer separated into 'office' and 'engine room' worlds — "
                    "they are digitally connected ecosystems.\n\n"
                    "IT SYSTEMS: WHERE MOST ATTACKS BEGIN\n\n"
                    "IT (Information Technology) systems include:\n"
                    "• Email and messaging systems\n"
                    "• Office computers and servers\n"
                    "• Crew Wi-Fi and internet access\n"
                    "• Business and documentation applications\n\n"
                    "These systems are constantly exposed to the internet, making them the favourite "
                    "entry point for attackers.\n\n"
                    "Critical risk: An attack that begins in the 'office' can travel silently toward "
                    "critical ship systems.\n\n"
                    "OT SYSTEMS: WHERE CYBER INCIDENTS BECOME DANGEROUS\n\n"
                    "OT (Operational Technology) systems control:\n"
                    "• Engine automation and propulsion\n"
                    "• Power management and generators\n"
                    "• Ballast and stability systems\n"
                    "• Cargo handling and monitoring\n\n"
                    "These systems were designed for reliability, not cybersecurity. Compromise can "
                    "cause:\n"
                    "• Sudden engine shutdown\n"
                    "• Loss of propulsion or steering\n"
                    "• Power blackout\n"
                    "• Unsafe ballast conditions\n\n"
                    "When OT systems fail, there is no 'reset button' at sea.\n\n"
                    "INTEGRATION POINTS: THE HIDDEN DIGITAL BRIDGE\n\n"
                    "Modern vessels connect IT and OT through:\n"
                    "• Satellite communication links\n"
                    "• Remote diagnostics and maintenance\n"
                    "• Shore-based monitoring and support\n\n"
                    "If access is not properly controlled: An attacker can move from email to server "
                    "to OT system.\n\n"
                    "This integration is the most dangerous vulnerability in modern ship design from "
                    "a cybersecurity perspective."
                ),
            },
            {
                "title": "Critical Maritime Systems at Risk",
                "order_num": 3,
                "content": (
                    "ECDIS: WHEN THE CHART LIES\n\n"
                    "ECDIS (Electronic Chart Display and Information System) can be compromised "
                    "through:\n"
                    "• Infected USB drives\n"
                    "• Unauthorized chart updates\n"
                    "• Unverified software patches\n\n"
                    "Always remember: If the data source is untrusted, the chart cannot be trusted.\n\n"
                    "GPS: ACCURATE UNTIL IT ISN'T\n\n"
                    "GPS signals can be spoofed (fake signals) or jammed (blocked completely), "
                    "resulting in:\n"
                    "• Wrong position, course, or speed\n"
                    "• False confidence during critical manoeuvres\n\n"
                    "Golden Rule: Never trust GPS alone — cross-check with radar, depth sounder, and "
                    "visual bearings.\n\n"
                    "AIS: SHIPS THAT APPEAR AND DISAPPEAR\n\n"
                    "AIS data can be manipulated to:\n"
                    "• Create phantom vessels\n"
                    "• Hide real ships from view\n"
                    "• Broadcast false identity or location\n\n"
                    "If AIS traffic looks strange, verify with radar and VHF.\n\n"
                    "ENGINE CONTROL SYSTEMS: NO SECOND CHANCES\n\n"
                    "Engine control systems operate on OT networks and often lack modern cybersecurity "
                    "protection. Compromise can cause:\n"
                    "• Sudden engine stoppage\n"
                    "• Loss of manoeuvrability\n"
                    "• Total blackout\n\n"
                    "These systems must be physically isolated and accessed only by authorized "
                    "personnel.\n\n"
                    "CARGO MANAGEMENT SYSTEMS: DATA ERRORS, REAL DAMAGE\n\n"
                    "Tampering can cause:\n"
                    "• Incorrect load distribution\n"
                    "• Stability issues\n"
                    "• Regulatory violations\n\n"
                    "Only authorized roles should access cargo data, and all changes must be logged."
                ),
            },
        ],
        "quiz_questions": [
            {
                "question": "What type of cyberattack transmits fake GPS signals to deceive vessel navigation?",
                "options": ["Ransomware", "Phishing", "GPS Spoofing", "AIS Manipulation"],
                "correct_answer": 2,
                "explanation": "GPS Spoofing involves transmitting fake GPS signals that cause the vessel to display a wrong position while appearing to operate normally.",
                "order_num": 1,
            },
            {
                "question": "ECDIS can be compromised through which of the following?",
                "options": ["Only satellite communications", "Infected USB drives and unauthorized chart updates", "Engine room network only", "Crew Wi-Fi exclusively"],
                "correct_answer": 1,
                "explanation": "ECDIS can be compromised through infected USB drives, unauthorized chart updates, and unverified software patches.",
                "order_num": 2,
            },
            {
                "question": "What does OT stand for in the maritime cybersecurity context?",
                "options": ["Online Technology", "Operational Technology", "Offshore Terminal", "Output Technology"],
                "correct_answer": 1,
                "explanation": "OT stands for Operational Technology — systems that control engine automation, power management, ballast, and cargo handling.",
                "order_num": 3,
            },
            {
                "question": "If an attacker manipulates AIS data, what is the primary danger?",
                "options": ["Engine shutdown", "Data theft from cargo logs", "Poor collision avoidance decisions", "GPS system failure"],
                "correct_answer": 2,
                "explanation": "Manipulated AIS data can create phantom ships or hide real vessels, leading to poor collision avoidance decisions in congested waters.",
                "order_num": 4,
            },
            {
                "question": "Which Golden Rule applies to GPS navigation at sea?",
                "options": [
                    "Always trust GPS data as the primary source",
                    "Cross-check GPS with radar, depth sounder, and visual bearings",
                    "Report only when GPS fails completely",
                    "Use GPS as the sole positioning tool in clear weather",
                ],
                "correct_answer": 1,
                "explanation": "The Golden Rule is: Never trust GPS alone — always cross-check with radar, depth sounder, and visual bearings to maintain safe navigation.",
                "order_num": 5,
            },
        ],
    },
    {
        "title": "Module 3: Real Incidents & Crew Best Practices",
        "description": "Learn from real-world maritime cyberattacks and apply proven cyber hygiene practices to protect shipboard systems.",
        "order_num": 3,
        "topics": [
            {
                "title": "Case Studies — Real Maritime Cyberattacks",
                "order_num": 1,
                "content": (
                    "CASE STUDY 1: MAERSK NOTPETYA ATTACK (2017)\n\n"
                    "What Happened:\n"
                    "A routine update of trusted Ukrainian accounting software carried hidden malware. "
                    "Within minutes:\n"
                    "• 45,000 PCs and 4,000 servers destroyed\n"
                    "• 76 port terminals shut down worldwide\n"
                    "• Booking, cargo tracking, and documentation systems collapsed\n"
                    "• Financial losses: $250–300 million\n\n"
                    "Key Lesson:\n"
                    "The attacker did not break in — they were invited in through trusted software. "
                    "Network segmentation alone could not stop the attack, but offline backups saved "
                    "the company. One domain controller in Ghana that was offline during the attack "
                    "became the only source to rebuild the entire network.\n\n"
                    "Critical insight: If that power outage hadn't occurred, recovery could have taken "
                    "months or failed entirely.\n\n"
                    "CASE STUDY 2: COSCO SHIPPING RANSOMWARE (2018)\n\n"
                    "What Happened:\n"
                    "COSCO's North American network was hit by ransomware that locked systems and "
                    "shut down email and booking platforms.\n\n"
                    "Impact:\n"
                    "Staff were forced to use manual, paper-based processes. However, strong regional "
                    "network segmentation prevented spread beyond North America.\n\n"
                    "Lesson:\n"
                    "Segmentation limits damage when incidents occur. Having offline backup procedures "
                    "is essential.\n\n"
                    "CASE STUDY 3: PORT OF SAN DIEGO RANSOMWARE (2018)\n\n"
                    "What Happened:\n"
                    "Administrative systems including documentation and permits were compromised.\n\n"
                    "Impact:\n"
                    "Vessel scheduling was delayed, port operations backed up, and ships waited longer "
                    "at berth.\n\n"
                    "Lesson:\n"
                    "Administrative systems are operationally critical. Offline and manual procedures "
                    "must be available and tested before an incident occurs."
                ),
            },
            {
                "title": "Cyber Hygiene for Crew Members",
                "order_num": 2,
                "content": (
                    "PASSWORDS: YOUR FIRST LINE OF DEFENSE\n\n"
                    "Use strong, unique passwords for ship systems. Never share them, even with "
                    "colleagues.\n"
                    "If someone gets your password, they act with your authority.\n\n"
                    "Best practices:\n"
                    "• Use a mix of uppercase, lowercase, numbers, and symbols\n"
                    "• Change passwords periodically\n"
                    "• Never reuse the same password across multiple systems\n\n"
                    "USB DRIVES: THE SILENT INFECTION\n\n"
                    "Never plug unknown or personal USB drives into any ship system. Many cyber "
                    "incidents begin with a seemingly 'harmless' USB.\n\n"
                    "Rule: If you didn't bring it, approve it, or scan it — don't connect it.\n\n"
                    "SOFTWARE UPDATES: TRUST ONLY THE RIGHT SOURCE\n\n"
                    "Install software and updates only from authorized, verified vendors. Fake or "
                    "unofficial updates can contain hidden malware.\n\n"
                    "A wrong update can damage systems more than no update at all.\n\n"
                    "EMAILS & MESSAGES: URGENCY IS A RED FLAG\n\n"
                    "Be cautious of emails or messages that:\n"
                    "• Demand immediate action\n"
                    "• Threaten consequences\n"
                    "• Ask for passwords or links\n\n"
                    "Always verify the sender through a second channel before responding or clicking.\n\n"
                    "WORKSTATIONS: LOCK BEFORE YOU WALK AWAY\n\n"
                    "Always lock computers when unattended. An unlocked system is an open door for "
                    "misuse or attack.\n\n"
                    "If you leave it open, someone else controls it.\n\n"
                    "PERSONAL DEVICES: KEEP THEM SEPARATE\n\n"
                    "Avoid using public Wi-Fi on personal devices that also access ship data. Personal "
                    "devices should never be connected to operational networks.\n\n"
                    "EARLY REPORTING: IF IN DOUBT, REPORT\n\n"
                    "Report unusual system behaviour immediately — pop-ups, slowdowns, unexpected "
                    "reboots, or strange messages. Early reporting enables rapid response and limits "
                    "damage."
                ),
            },
            {
                "title": "Securing Shipboard IT Systems",
                "order_num": 3,
                "content": (
                    "Digital security on IT systems requires multiple layers of protection.\n\n"
                    "FIREWALLS & ENDPOINT PROTECTION\n\n"
                    "Firewalls act like the hull of the ship, keeping unwanted traffic out. If "
                    "outdated, attackers walk in unnoticed.\n\n"
                    "An unprotected system is an open sea — anyone can enter.\n\n"
                    "PATCHING & SOFTWARE CONTROL\n\n"
                    "Attackers exploit known vulnerabilities. Best practices:\n"
                    "• Apply patches as soon as approved by vendor/company\n"
                    "• Maintain an approved software list\n"
                    "• Remove unauthorized applications immediately\n\n"
                    "ACCESS CONTROL\n\n"
                    "Use role-based access so crew access only what they need for their role. Enable "
                    "multi-factor authentication (MFA) where possible.\n\n"
                    "If everyone can access everything, attackers can too.\n\n"
                    "NETWORK SEPARATION\n\n"
                    "Critical systems must never share networks with:\n"
                    "• Crew Wi-Fi\n"
                    "• Personal devices\n"
                    "• Entertainment systems\n\n"
                    "Crew Wi-Fi is for comfort. Operational networks are for safety.\n\n"
                    "BACKUPS: YOUR LAST LINE OF SURVIVAL\n\n"
                    "Regular backups ensure systems can be restored after an incident. Backups are "
                    "only useful if they are:\n"
                    "• Stored securely (not on the same compromised server)\n"
                    "• Offline or protected from the main network\n"
                    "• Tested regularly to ensure they work\n\n"
                    "The Maersk case proved this: a single offline server saved the entire company."
                ),
            },
            {
                "title": "Securing Operational Technology (OT)",
                "order_num": 4,
                "content": (
                    "Operational Technology controls engines, power, ballast, and propulsion. There "
                    "are no second chances at sea.\n\n"
                    "ISOLATION: KEEP OT OFF THE INTERNET\n\n"
                    "OT systems must be physically and logically isolated from IT systems and the "
                    "internet:\n"
                    "• No browsing on OT terminals\n"
                    "• No email access from OT systems\n"
                    "• No crew Wi-Fi connections to OT networks\n"
                    "• No shortcuts or exceptions\n\n"
                    "If OT is online, attackers are already closer than you think.\n\n"
                    "REMOTE ACCESS: CONVENIENCE IS A RISK\n\n"
                    "Vendor remote access must be:\n"
                    "• Absolutely essential (not just convenient)\n"
                    "• Time-limited to the duration of the task\n"
                    "• Closely monitored throughout the session\n"
                    "• Disabled immediately after use\n\n"
                    "Permanent remote access is an open hatch — not a service.\n\n"
                    "CHANGE & MAINTENANCE RECORDS\n\n"
                    "Every change to OT systems must be:\n"
                    "• Authorized by the responsible officer\n"
                    "• Logged with time, date, and reason\n"
                    "• Reviewed by a senior officer\n\n"
                    "If you don't know what changed, you don't know what can fail.\n\n"
                    "RISK ASSESSMENTS & EXERCISES\n\n"
                    "Regular tabletop exercises help crew understand failure scenarios and practice "
                    "decision-making before actual incidents occur.\n\n"
                    "Practicing the response is as important as knowing the procedure."
                ),
            },
        ],
        "quiz_questions": [
            {
                "question": "In the Maersk NotPetya attack (2017), how did the malware initially enter the network?",
                "options": [
                    "A phishing email opened by a crew member",
                    "An infected USB drive brought on board",
                    "A trusted accounting software update",
                    "An unsecured crew Wi-Fi connection",
                ],
                "correct_answer": 2,
                "explanation": "The malware entered through a routine update of trusted Ukrainian accounting software — the attacker was invited in through a trusted channel, not by breaking in.",
                "order_num": 1,
            },
            {
                "question": "What ultimately saved the Maersk network during the NotPetya attack?",
                "options": [
                    "A firewall update that blocked the malware",
                    "One offline domain controller in Ghana",
                    "Manual paper backup systems",
                    "A quick response from the IT team",
                ],
                "correct_answer": 1,
                "explanation": "One domain controller in Ghana happened to be offline during the attack due to a power outage. This single offline server became the only source to rebuild the entire global network.",
                "order_num": 2,
            },
            {
                "question": "Which of the following is NOT a recommended cyber hygiene practice for crew?",
                "options": [
                    "Use strong passwords and change them periodically",
                    "Share passwords with trusted colleagues only",
                    "Lock screens when leaving workstations unattended",
                    "Report unusual system behavior immediately",
                ],
                "correct_answer": 1,
                "explanation": "Passwords must NEVER be shared with anyone, even trusted colleagues. If someone has your password, they act with your authority.",
                "order_num": 3,
            },
            {
                "question": "What should you do FIRST if you receive an email demanding your password urgently?",
                "options": [
                    "Respond quickly to avoid consequences",
                    "Ignore and permanently delete it",
                    "Verify the sender through a second communication channel",
                    "Forward it to all crew members to warn them",
                ],
                "correct_answer": 2,
                "explanation": "Urgency is a red flag. Always verify the sender through a second channel (phone, radio) before responding. Never provide credentials via email.",
                "order_num": 4,
            },
            {
                "question": "For backups to be useful after a cyber incident, they must be:",
                "options": [
                    "Created daily on the same network server",
                    "Stored online for easy access from any device",
                    "Stored securely offline or in a protected location, and tested regularly",
                    "Shared with all crew members so multiple copies exist",
                ],
                "correct_answer": 2,
                "explanation": "Backups are only useful if stored securely, kept offline or protected from the main network, and regularly tested. A backup on the same compromised server is not a backup.",
                "order_num": 5,
            },
        ],
    },
    {
        "title": "Module 4: Physical Security, Incident Response & IMO Compliance",
        "description": "Master physical security onboard, follow the correct incident response steps, and understand IMO regulatory requirements.",
        "order_num": 4,
        "topics": [
            {
                "title": "Physical Cybersecurity Risks Onboard",
                "order_num": 1,
                "content": (
                    "Not all cyberattacks come through the internet. Some walk onboard wearing safety "
                    "shoes and carrying a laptop.\n\n"
                    "ACCESS TO BRIDGE & ENGINE CONTROL\n\n"
                    "The bridge and engine control room contain systems that directly control the "
                    "vessel.\n\n"
                    "Rules:\n"
                    "• Restrict access to authorized personnel only\n"
                    "• Never allow unsupervised access by any visitor\n"
                    "• Challenge unfamiliar faces politely but firmly\n\n"
                    "If someone can touch the system, they can control it.\n\n"
                    "NETWORK CLOSETS & CABLES\n\n"
                    "Network cabinets, switches, and cable runs are often poorly secured and poorly "
                    "labelled. An attacker can:\n"
                    "• Plug in a rogue device to capture data\n"
                    "• Disconnect alarm systems silently\n"
                    "• Intercept communications\n\n"
                    "One small device plugged into a network cabinet can compromise the entire ship.\n\n"
                    "TECHNICIANS & VISITORS\n\n"
                    "Before granting any access, always:\n"
                    "• Verify ID and port access badges\n"
                    "• Confirm purpose with the Master or Chief Engineer\n"
                    "• Supervise at all times throughout the visit\n\n"
                    "Uniforms and confidence are not proof of authorization.\n\n"
                    "Remember: Social engineers look and sound professional. Verification is always "
                    "required."
                ),
            },
            {
                "title": "Cybersecurity During Port Calls",
                "order_num": 2,
                "content": (
                    "A vessel is never more exposed than during a port call. New people, new networks, "
                    "time pressure, and routine work create perfect opportunities for cyber intrusion.\n\n"
                    "PORT NETWORKS: CONVENIENCE CAN BE A TRAP\n\n"
                    "Port and terminal networks are outside your control. Connecting ship systems to "
                    "untrusted networks can allow:\n"
                    "• Malware entry into ship systems\n"
                    "• Data interception by third parties\n"
                    "• Unauthorized access to operational systems\n\n"
                    "If you wouldn't connect engine controls to public Wi-Fi, don't do it digitally.\n\n"
                    "VISITING TECHNICIANS: SUPERVISE EVERY MOVE\n\n"
                    "Rules that must never be broken:\n"
                    "• Only pre-approved devices may be connected to ship systems\n"
                    "• All devices must be whitelisted and scanned before connection\n"
                    "• Activities must be recorded and logged throughout the visit\n"
                    "• No technician should work unsupervised at any time\n\n"
                    "Unsupervised access is an open invitation to attackers.\n\n"
                    "INFORMATION SHARING: LESS IS SAFER\n\n"
                    "Share only what is necessary — nothing more:\n"
                    "• Avoid sharing full system details or network architecture\n"
                    "• Do not share passwords or network layouts with any visitor\n"
                    "• Follow data minimization principles at all times\n\n"
                    "The more information shared, the more attackers can exploit. Port calls are "
                    "high-risk periods — maintain heightened vigilance throughout."
                ),
            },
            {
                "title": "Cyber Incident Reporting & Response",
                "order_num": 3,
                "content": (
                    "Cyber incidents do not start with explosions or alarms — they start with "
                    "something that 'doesn't look right.' Your response in the first few minutes "
                    "decides whether the ship stays safe or loses control.\n\n"
                    "STEP 1: IDENTIFY & CONTAIN\n\n"
                    "If you notice any of these warning signs:\n"
                    "• Pop-ups appearing unexpectedly\n"
                    "• System slowdown or unusual performance\n"
                    "• Unexpected reboots or restarts\n"
                    "• Strange messages or file locks\n\n"
                    "Action: Immediately isolate the affected system from the network if it is safe "
                    "to do so.\n\n"
                    "STEP 2: INFORM\n\n"
                    "Notify immediately:\n"
                    "• The Master\n"
                    "• The designated Cyber Officer\n"
                    "• Shore IT / Security team\n\n"
                    "Do NOT try to fix the issue alone.\n\n"
                    "STEP 3: PRESERVE\n\n"
                    "• Do NOT power off critical systems unless specifically instructed\n"
                    "• Avoid rebooting affected systems\n"
                    "• Preserve logs, alerts, and on-screen messages\n\n"
                    "Evidence helps experts stop the attack and prevent repeat incidents.\n\n"
                    "STEP 4: DOCUMENT\n\n"
                    "Record everything:\n"
                    "• Time of first symptom\n"
                    "• What you saw and what was happening\n"
                    "• What actions were taken\n"
                    "• Any error messages displayed\n\n"
                    "Your notes may be more valuable than the system itself.\n\n"
                    "STEP 5: COMMUNICATE\n\n"
                    "If email or ship systems are compromised:\n"
                    "• Use phones, satellite calls, or other out-of-band communication\n"
                    "• Follow the approved communication plan\n"
                    "• Do not use potentially compromised systems for incident communication\n\n"
                    "STEP 6: LEARN & STRENGTHEN\n\n"
                    "Once systems are restored:\n"
                    "• Review what went wrong and how it happened\n"
                    "• Update procedures to prevent recurrence\n"
                    "• Brief the entire crew on lessons learned\n"
                    "• Fix gaps before attackers return"
                ),
            },
            {
                "title": "IMO Regulations, Compliance & Best Practices",
                "order_num": 4,
                "content": (
                    "IMO RESOLUTION MSC.428(98): CYBERSECURITY IS NOW THE LAW\n\n"
                    "Cybersecurity is no longer a 'best practice' — it is a regulatory requirement "
                    "enforced by the International Maritime Organization (IMO).\n\n"
                    "This resolution mandates that cyber risk management must be included in the "
                    "Safety Management System (SMS). Cybersecurity is treated just like fire safety, "
                    "collision prevention, and pollution control.\n\n"
                    "Failure to comply can lead to:\n"
                    "• Audit findings and formal non-conformities\n"
                    "• Vessel detention\n"
                    "• Loss of certification\n"
                    "• Operational delays and port bans\n\n"
                    "WHAT AUDITORS LOOK FOR\n\n"
                    "During audits, inspectors verify whether the company and vessel have:\n"
                    "1. Cyber risk assessments — Do you know what systems are at risk?\n"
                    "2. Crew awareness and training — Do crew know how attacks happen and what to do?\n"
                    "3. Incident reporting and response procedures — Is there a clear plan?\n"
                    "4. Access control and system protection measures — Are systems properly "
                    "protected?\n\n"
                    "Auditors may ask: 'What would you do if systems go down?' or 'Have you practiced "
                    "this scenario?'\n\n"
                    "CYBERSECURITY: NOT JUST DOCUMENTATION\n\n"
                    "Having policies is not enough. Cybersecurity must be:\n"
                    "• Understood by the crew\n"
                    "• Practiced onboard\n"
                    "• Improved continuously\n\n"
                    "An SMS without cyber risk is considered incomplete."
                ),
            },
        ],
        "quiz_questions": [
            {
                "question": "What is the correct first step in the Cyber Incident Response procedure?",
                "options": [
                    "Immediately notify the Master",
                    "Power off all affected systems",
                    "Identify and contain by isolating the affected system from the network",
                    "Document the incident in the logbook",
                ],
                "correct_answer": 2,
                "explanation": "Step 1 is to Identify & Contain — isolate the affected system from the network if safe to do so. This prevents the incident from spreading to other systems.",
                "order_num": 1,
            },
            {
                "question": "Under IMO Resolution MSC.428(98), where must cyber risk management be included?",
                "options": [
                    "The crew employment contract",
                    "The Safety Management System (SMS)",
                    "The cargo manifest",
                    "The vessel maintenance log",
                ],
                "correct_answer": 1,
                "explanation": "IMO Resolution MSC.428(98) mandates that cyber risk management must be included in the Safety Management System (SMS) of all shipping companies.",
                "order_num": 2,
            },
            {
                "question": "Someone claiming to be 'IT support' asks for your ECDIS password to fix an issue. What is the correct response?",
                "options": [
                    "Provide it if they show a company ID badge",
                    "Provide it with time limit of 30 minutes",
                    "Do not provide it — verify identity through the Master and follow company procedures",
                    "Provide it only if the Chief Officer is present",
                ],
                "correct_answer": 2,
                "explanation": "Never provide passwords to anyone regardless of claimed authority. Verify the person's identity through the Master or designated Cyber Officer and follow company procedures.",
                "order_num": 3,
            },
            {
                "question": "During a port call, a visiting technician wants to connect their personal laptop to a ship system. What should you do?",
                "options": [
                    "Allow it if the technician is from a reputable company",
                    "Allow it if the Master gives verbal approval",
                    "Only allow pre-approved, whitelisted, and scanned devices; supervise at all times",
                    "Allow it during daytime hours only",
                ],
                "correct_answer": 2,
                "explanation": "Only pre-approved devices may be connected to ship systems. All devices must be whitelisted and scanned before connection, and technicians must be supervised at all times.",
                "order_num": 4,
            },
            {
                "question": "Why is a vessel considered most vulnerable during a port call?",
                "options": [
                    "The crew is usually on shore leave",
                    "New people, new networks, time pressure, and routine work create opportunities for intrusion",
                    "Port authorities control the vessel's systems",
                    "Engine systems are typically shut down",
                ],
                "correct_answer": 1,
                "explanation": "During port calls, new people board, untrusted networks are nearby, time pressure increases, and routine operations create perfect conditions for cyber intrusion.",
                "order_num": 5,
            },
        ],
    },
    {
        "title": "Module 5: Cybersecurity Standards, Assessment & Summary",
        "description": "Review cybersecurity best practices, test your knowledge with crew assessment scenarios, and consolidate key takeaways for maritime professionals.",
        "order_num": 5,
        "topics": [
            {
                "title": "Cybersecurity Do's & Don'ts for Vessels",
                "order_num": 1,
                "content": (
                    "Every crew member plays a role in the vessel's cyber defence. Knowing what to "
                    "do — and what to avoid — is the foundation of a secure ship.\n\n"
                    "CYBERSECURITY DO'S\n\n"
                    "Use strong passwords and MFA — Prevents unauthorized access to critical systems. "
                    "Combine uppercase, lowercase, numbers, and symbols. Enable multi-factor "
                    "authentication wherever available.\n\n"
                    "Keep systems patched and updated — Closes known security holes that attackers "
                    "actively exploit. Apply patches as soon as approved by the vendor or company.\n\n"
                    "Segregate IT and OT networks — Limits cyber incident damage by ensuring a "
                    "compromise in one zone cannot easily spread to another. Crew Wi-Fi must never "
                    "share a network with navigation or engine systems.\n\n"
                    "Verify all software updates and sources — Prevents malware distribution through "
                    "fake or unofficial updates. Only install software from authorized, verified "
                    "vendors.\n\n"
                    "Report suspicious activity immediately — Enables rapid response. Early reporting "
                    "can mean the difference between a contained incident and a catastrophic breach.\n\n"
                    "CYBERSECURITY DON'TS\n\n"
                    "Do not share credentials — Compromises access control. If someone has your "
                    "password, they act with your authority.\n\n"
                    "Do not connect personal devices to ship systems — Introduces outside threats "
                    "from uncontrolled networks.\n\n"
                    "Do not use unknown USBs — Risk of malware infection. A found USB drive can "
                    "carry malware that infects navigation and OT systems.\n\n"
                    "Do not click suspicious links — Enables phishing attacks. Messages with urgency "
                    "or fear are red flags.\n\n"
                    "Do not allow unsupervised vendor access — Permits unauthorized system access. "
                    "All visiting technicians must be supervised at all times.\n\n"
                    "KEY PRINCIPLE\n\n"
                    "Cybersecurity discipline is not about technology alone — it is about consistent, "
                    "daily behaviour. One moment of carelessness can undo months of security measures."
                ),
            },
            {
                "title": "Cybersecurity Assessment for Crew",
                "order_num": 2,
                "content": (
                    "Cybersecurity knowledge must be tested and practiced, not just taught. This "
                    "covers the critical scenarios every maritime professional must be prepared for.\n\n"
                    "SCENARIO 1: THE CIA TRIAD IN PRACTICE\n\n"
                    "The CIA Triad — Confidentiality, Integrity, and Availability — is the foundation "
                    "of digital security on vessels.\n\n"
                    "Confidentiality: Only authorized people access ship data and systems.\n"
                    "Integrity: Information remains accurate and unaltered.\n"
                    "Availability: Systems work when needed, especially during critical operations.\n\n"
                    "SCENARIO 2: RECOGNIZING RANSOMWARE\n\n"
                    "Signs of a ransomware incident include:\n"
                    "• Files locked with unusual extensions\n"
                    "• Ransom messages appearing on screens\n"
                    "• System slowdown or unusual performance\n"
                    "• Inability to access critical files or systems\n"
                    "• Unusual error messages appearing repeatedly\n\n"
                    "SCENARIO 3: GPS SPOOFING RESPONSE\n\n"
                    "If you suspect GPS spoofing, immediately:\n"
                    "• Stop relying on GPS alone\n"
                    "• Cross-check position with radar and visual bearings\n"
                    "• Notify the Master\n"
                    "• Verify course and position through multiple independent methods\n"
                    "• Report to shore if necessary\n\n"
                    "SCENARIO 4: NETWORK SEGMENTATION\n\n"
                    "Why it matters: Segmentation isolates critical systems (OT) from general "
                    "networks, preventing cyber incidents from spreading.\n\n"
                    "Maritime example: If crew Wi-Fi is compromised, isolated OT networks (engine "
                    "control, navigation) remain protected because they are on separate, firewalled "
                    "network zones.\n\n"
                    "SCENARIO 5: USB AND CONTRACTOR DEVICE SAFETY\n\n"
                    "Safe practices:\n"
                    "• Never connect unknown USB drives to any ship system\n"
                    "• Scan all external devices before use with up-to-date antivirus\n"
                    "• Use only whitelisted/approved contractor equipment\n"
                    "• Supervise all external device connections at all times\n"
                    "• Maintain logs of all connections made to ship systems\n\n"
                    "SCENARIO 6: SOCIAL ENGINEERING ATTEMPT\n\n"
                    "Situation: An individual claiming to be 'IT support' asks for your password to "
                    "fix ECDIS.\n\n"
                    "Correct Response: Do not provide the password. Verify the person's identity "
                    "through the Master or designated Cyber Officer. Follow company procedures. Never "
                    "share credentials with anyone, regardless of claimed authority or urgency."
                ),
            },
            {
                "title": "Conclusion & Best Practices Summary",
                "order_num": 3,
                "content": (
                    "CYBERSECURITY IS SEAMANSHIP IN THE DIGITAL AGE\n\n"
                    "The modern ship sails on steel, fuel, and data. When data is compromised, "
                    "control is compromised. Cybersecurity is no longer a technical issue left to "
                    "shore offices or IT teams. It is a core part of maritime safety, business "
                    "continuity, and legal compliance.\n\n"
                    "IMPACT OF A SINGLE CYBER INCIDENT\n\n"
                    "A cyber incident can:\n"
                    "• Mislead navigation through spoofing and data tampering\n"
                    "• Shut down engines through malware and ransomware\n"
                    "• Delay ports and cargo through system failures\n"
                    "• Harm the environment through accidental releases\n"
                    "• Endanger lives through loss of vessel control\n\n"
                    "Most importantly — it often starts with something small and preventable.\n\n"
                    "THE RESILIENCE FORMULA\n\n"
                    "Resilience = Awareness + Preparedness + Segmentation + Backups\n\n"
                    "• Awareness stops mistakes before they happen\n"
                    "• Preparedness enables fast and correct response\n"
                    "• Segmentation limits the spread of damage\n"
                    "• Backups enable full recovery after an incident\n\n"
                    "Miss one, and the entire defence weakens.\n\n"
                    "WHAT EVERY CREW MEMBER MUST REMEMBER\n\n"
                    "1. Practice cyber hygiene every day — strong passwords, locked systems, no "
                    "unknown USBs\n"
                    "2. Understand the threats — phishing, ransomware, spoofing, social engineering\n"
                    "3. Protect IT and OT systems — segmentation, controlled access, approved updates\n"
                    "4. Learn from real incidents — Maersk, COSCO, ports, GPS spoofing\n\n"
                    "Technology fails. Awareness saves.\n\n"
                    "FINAL REALITY CHECK\n\n"
                    "Cyber threats are:\n"
                    "• Invisible — No alarms or visible warning signs\n"
                    "• Patient — Attackers wait for the right moment\n"
                    "• Always evolving — New threats emerge constantly\n\n"
                    "They don't attack computers — they attack trust, routine, and complacency.\n\n"
                    "FINAL MESSAGE FOR MARITIME PROFESSIONALS\n\n"
                    "Just as you keep a proper lookout, follow safety procedures, and prepare for "
                    "emergencies — you must protect the ship digitally.\n\n"
                    "A cyber-aware crew is a safe crew.\n"
                    "A prepared ship is a resilient ship.\n"
                    "At sea, cybersecurity is seamanship."
                ),
            },
        ],
        "quiz_questions": [
            {
                "question": "Which of the following is a Cybersecurity DON'T for vessels?",
                "options": [
                    "Keep systems patched and updated",
                    "Report suspicious activity immediately",
                    "Connect personal devices to ship systems for convenience",
                    "Segregate IT and OT networks",
                ],
                "correct_answer": 2,
                "explanation": "Connecting personal devices to ship systems introduces outside threats from uncontrolled networks. Personal devices must never be connected to operational systems.",
                "order_num": 1,
            },
            {
                "question": "What is the correct Resilience Formula for maritime cybersecurity?",
                "options": [
                    "Detection + Response + Recovery + Review",
                    "Awareness + Preparedness + Segmentation + Backups",
                    "Speed + Strength + Stability + Backup",
                    "IT + OT + HR + Management",
                ],
                "correct_answer": 1,
                "explanation": "The Resilience Formula is: Resilience = Awareness + Preparedness + Segmentation + Backups. Each element addresses a different aspect of cyber defence.",
                "order_num": 2,
            },
            {
                "question": "If you suspect GPS spoofing, what should you do FIRST?",
                "options": [
                    "Turn off the GPS system entirely",
                    "Stop relying on GPS alone and cross-check with radar and visual bearings",
                    "Report to the nearest port authority",
                    "Restart the ECDIS system",
                ],
                "correct_answer": 1,
                "explanation": "The immediate response is to stop trusting GPS data alone and cross-check position with radar, depth sounder, and visual bearings before notifying the Master.",
                "order_num": 3,
            },
            {
                "question": "Why are cyber threats described as 'patient'?",
                "options": [
                    "They only affect old systems",
                    "Attackers wait for the right moment to strike",
                    "They are slow to spread through networks",
                    "They require physical access to the vessel",
                ],
                "correct_answer": 1,
                "explanation": "Cyber threats are patient because attackers wait for the right moment — often when defences are weakest, such as during port calls, crew changes, or routine operations.",
                "order_num": 4,
            },
            {
                "question": "A visiting technician wants to connect their own USB drive to update the ECDIS. What is the correct procedure?",
                "options": [
                    "Allow it if the technician has a company ID",
                    "Allow it but supervise the process",
                    "Only allow pre-approved, whitelisted, and scanned devices; supervise at all times",
                    "Refuse all external devices under any circumstances",
                ],
                "correct_answer": 2,
                "explanation": "Only pre-approved devices may be connected to ship systems. All devices must be whitelisted and scanned before connection, and the technician must be supervised at all times.",
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

        # Create the course first so modules can reference it
        course = Course(
            title="CyberSecurity Awareness",
            description=(
                "A comprehensive course covering maritime cybersecurity fundamentals, "
                "threats, best practices, and regulatory requirements for seafarers and "
                "maritime professionals."
            ),
            order_num=1,
        )
        db.add(course)
        db.flush()  # get course.id
        print(f"Created course: '{course.title}' (id={course.id})")

        for mod_data in MODULES:
            module = StudyModule(
                course_id=course.id,
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
