"""
seed_study_data.py
──────────────────
Populates the study_modules, study_topics, and study_quiz_questions tables
with content parsed from CybersecurityStudyMaterial-Q1.pdf.

Run once:
    python seed_study_data.py
"""

import sys
from database import SessionLocal
import models

db = SessionLocal()

# Guard: skip if already seeded
if db.query(models.StudyModule).count() > 0:
    print("Study data already seeded. Skipping.")
    db.close()
    sys.exit(0)

# ── MODULES ────────────────────────────────────────────────────────────────────
MODULES = [
    {
        "title": "Module 1: Introduction & Foundations of Maritime Cybersecurity",
        "description": "Understand what maritime cybersecurity is, why it matters, and the core principles that protect digital ship operations.",
        "order_num": 1,
        "topics": [
            {
                "title": "Topic 1: Introduction to Maritime Cybersecurity",
                "order_num": 1,
                "content": """Modern ships operate as floating digital environments where critical shipboard functions depend on interconnected digital technologies. Core operations such as navigation, engine and propulsion control, cargo handling, communication systems, and crew welfare services rely heavily on computers, onboard networks, and satellite-based connectivity.

THE REALITY OF CYBER RISK AT SEA

Unlike physical threats such as fire, collision, or grounding, cyberattacks may occur without immediate physical warning signs. Cyber risks in the maritime domain differ from traditional maritime hazards — they are often silent, unseen, and difficult to detect until damage has already occurred.

Key realities:
• Cyber threats in maritime environments are invisible but highly dangerous
• Over 90% of global trade is transported by sea, making vessels attractive targets for cybercriminals and state-sponsored attackers
• A single cyber incident can manipulate navigation systems, disable engines or propulsion, disrupt cargo operations, and interrupt global supply chains
• These risks highlight why cybersecurity must be treated as a core component of maritime safety management

KEY TRUTH FOR CREW

Cybersecurity is not only an IT responsibility. It is a critical safety issue, comparable in importance to fire prevention, emergency preparedness, and collision avoidance.

Simple human actions can unintentionally trigger serious cyber incidents, including:
• Clicking on malicious emails or links
• Using infected USB devices
• Creating weak or reused passwords
• Leaving systems unattended and unlocked

PREVENTION AND AWARENESS

The majority of maritime cyber incidents are preventable by improving cybersecurity awareness, maintaining basic digital hygiene, and strictly following company and shipboard cybersecurity procedures.""",
            },
            {
                "title": "Topic 2: Why Cybersecurity Matters in Maritime",
                "order_num": 2,
                "content": """Cybersecurity is no longer a technical or administrative concern — it is a core maritime safety, environmental, and business risk.

NAVIGATION SAFETY: WHEN THE SHIP IS LED ASTRAY

Modern vessels rely extensively on digital navigation systems such as GPS, ECDIS, and AIS to ensure safe passage. Cyber attackers can manipulate or spoof navigation data, causing vessels to unknowingly deviate from their intended route while all systems appear to function normally.

Potential Impact:
• Collisions with other vessels
• Grounding incidents
• Entry into restricted or high-risk waters
• Loss of situational awareness without visible warning signs

CREW SAFETY: WHEN SYSTEMS TURN AGAINST YOU

Shipboard operational technology (OT) systems such as engine automation, ballast control, and power management systems are increasingly automated and network-connected. If compromised, these systems can behave unpredictably or fail completely.

Cyber incidents may result in:
• Unexpected engine shutdowns
• Unstable or incorrect ballast operations
• Total loss of electrical power (blackout)
• Life-threatening emergencies

ENVIRONMENTAL PROTECTION: WHEN NATURE PAYS THE PRICE

Cyberattacks can directly impact systems responsible for environmental safety. A compromised system may trigger or fail to prevent:
• Oil spills and fuel leaks
• Release of hazardous or dangerous cargo
• Irreversible damage to marine ecosystems

BUSINESS CONTINUITY: WHEN THE WORLD STOPS MOVING

Case Study — NotPetya Cyberattack on Maersk (2017):
• Ports and terminals worldwide were shut down
• Operations halted for several days
• Estimated financial losses of USD 250–300 million
• Significant disruption to global trade and logistics

REGULATORY COMPLIANCE: CYBERSECURITY IS NOW THE LAW

The International Maritime Organization (IMO) mandates cyber risk management under IMO Resolution MSC.428(98). Shipping companies must integrate cyber risk management into their Safety Management System (SMS).

Failure to comply may result in vessel detention, regulatory penalties, loss of certification, and operational restrictions.""",
            },
            {
                "title": "Topic 3: Cybersecurity Fundamentals",
                "order_num": 3,
                "content": """WHAT IS CYBERSECURITY?

Cybersecurity means protecting the ship's digital systems from attackers who try to steal information, damage systems, or take control of operations. A cyberattack does not need weapons or force — it can start with a USB drive, a malicious email, an unlocked system, or outdated software.

If the ship runs on computers, it can be attacked.

THE CIA TRIAD: THREE PRINCIPLES FOR DIGITAL SAFETY

• Confidentiality: Only authorized people access ship data and systems
• Integrity: Information remains accurate and unaltered
• Availability: Systems work when needed, especially during critical operations

Ask yourself: What happens if ECDIS, engine control, or power systems are unavailable during an emergency?

ESSENTIAL CYBER TERMS FOR SEAFARERS

• Malware: Harmful software that damages or spies on systems
• Ransomware: Locks important files and demands money to unlock them
• Phishing: Fake messages designed to trick users into clicking links or sharing passwords
• Firewall: Digital security gate controlling what enters/exits ship systems
• Patch: Software update fixing known security holes
• Vulnerability: A weakness that attackers exploit, often caused by poor habits or outdated systems

Critical Insight: Attackers don't hack ships — they exploit human mistakes.

THE THREE PILLARS OF CYBER SAFETY

Effective maritime cybersecurity is built on three interconnected pillars:

PEOPLE — Trained, alert crew members who understand cyber risks and think carefully before clicking links, opening emails, connecting USB devices, or sharing information.

PROCESS — Clear and enforced procedures for safe use of computers, email systems, removable media, passwords, and incident reporting.

TECHNOLOGY — Properly configured shipboard systems supported by firewalls, antivirus software, access controls, network segregation, and regular system updates.

Why All Three Pillars Matter:
• People alone are not enough without clear rules and technical protection
• Technology alone cannot prevent human error
• Processes fail if people do not follow them

MARITIME SAFETY PERSPECTIVE

In the maritime environment, a well-trained crew (People), following approved procedures (Process), supported by secure and maintained systems (Technology), creates a strong defence against cyber incidents — just like safety management for fire, collision, or pollution prevention.""",
            },
        ],
        "quiz": [
            {
                "order_num": 1,
                "question": "What percentage of global trade is transported by sea, making vessels attractive targets for cybercriminals?",
                "options": ["70%", "80%", "90%", "95%"],
                "correct_answer": 2,
                "explanation": "Over 90% of global trade is transported by sea, making vessels and maritime infrastructure highly attractive targets for cybercriminals and state-sponsored attackers.",
            },
            {
                "order_num": 2,
                "question": "What does the 'I' in the CIA Triad stand for in cybersecurity?",
                "options": ["Intelligence", "Integrity", "Internet", "Isolation"],
                "correct_answer": 1,
                "explanation": "The CIA Triad stands for Confidentiality, Integrity, and Availability. Integrity means that information remains accurate and unaltered.",
            },
            {
                "order_num": 3,
                "question": "Which of the following is NOT one of the Three Pillars of Cyber Safety?",
                "options": ["People", "Process", "Technology", "Protocol"],
                "correct_answer": 3,
                "explanation": "The Three Pillars of Cyber Safety are People, Process, and Technology. Protocol is not one of the named pillars.",
            },
            {
                "order_num": 4,
                "question": "Cybersecurity is described as comparable in importance to which of the following for crew?",
                "options": ["Administrative paperwork", "Fire prevention and emergency preparedness", "Cargo documentation", "Port entry procedures"],
                "correct_answer": 1,
                "explanation": "Cybersecurity is a critical safety issue comparable in importance to fire prevention, emergency preparedness, and collision avoidance — not just an IT responsibility.",
            },
            {
                "order_num": 5,
                "question": "Under which IMO Resolution is cyber risk management mandated in the Safety Management System (SMS)?",
                "options": ["MSC.428(98)", "STCW.2010", "SOLAS.74", "ISM.001"],
                "correct_answer": 0,
                "explanation": "IMO Resolution MSC.428(98) mandates that cyber risk management must be included in the Safety Management System (SMS) of all shipping companies.",
            },
        ],
    },
    {
        "title": "Module 2: Cyber Threats & Vulnerable Maritime Systems",
        "description": "Identify the major cyber threats targeting vessels at sea and understand which critical systems are most at risk.",
        "order_num": 2,
        "topics": [
            {
                "title": "Topic 1: Common Cyber Threats at Sea",
                "order_num": 1,
                "content": """PHISHING: THE MOST DANGEROUS MESSAGE YOU'LL EVER READ

Attackers send fake emails, SMS, or WhatsApp messages pretending to be port authorities, company headquarters, charterers, or suppliers.

Red flags: Messages that create urgency or fear, demand immediate action, or request login details.

Defense: Verify sender through a secondary communication channel before acting.

RANSOMWARE: DIGITAL HOSTAGE TAKING

Ransomware locks important systems and files, demanding payment for restoration.

Real Maritime Incidents:
• COSCO (2018): Terminal operations disrupted, email systems locked
• Port of San Diego (2018): Critical IT systems compromised, port operations delayed

Impact: Imagine losing access to ship documents, cargo data, or operational systems mid-voyage.

MALWARE VIA REMOVABLE MEDIA: THE INFECTED USB TRAP

USB drives, external hard disks, or contractor laptops can carry malware that infects navigation systems, spreads into OT networks, and disables critical controls.

A free USB can cost the ship millions.

GPS SPOOFING: WHEN THE BRIDGE IS LIED TO

Attackers transmit fake GPS signals, causing wrong position displayed on GPS/ECDIS, false course and speed data, and increased grounding and collision risk.

The ship may be off-course while the screen shows "safe waters."

AIS MANIPULATION: SHIPS THAT DON'T EXIST

Attackers can hide real vessels, create phantom ships on AIS, and broadcast false vessel identity or position.

Impact: Poor collision avoidance decisions in congested waters.

UNAUTHORIZED ACCESS: ONE UNLOCKED SCREEN IS ENOUGH

Leaving systems unattended or protected with weak passwords allows physical system access, remote unauthorized access, and data theft or manipulation.

An unlocked console is an open door.

SOCIAL ENGINEERING: WHEN ATTACKERS SOUND HELPFUL

Attackers pose as IT support staff, port inspection officers, or company technicians. They use politeness, authority, and urgency to gain access.

If someone asks for passwords or system access, it's a red flag.""",
            },
            {
                "title": "Topic 2: Maritime IT, OT & Integrated Systems",
                "order_num": 2,
                "content": """Modern vessels are no longer separated into "office" and "engine room" worlds — they are digitally connected ecosystems.

IT SYSTEMS: WHERE MOST ATTACKS BEGIN

IT (Information Technology) systems include:
• Email and messaging systems
• Office computers and servers
• Crew Wi-Fi and internet access
• Business and documentation applications

These systems are constantly exposed to the internet, making them the favourite entry point for attackers.

Critical risk: An attack that begins in the "office" can travel silently toward critical ship systems.

OT SYSTEMS: WHERE CYBER INCIDENTS BECOME DANGEROUS

OT (Operational Technology) systems control:
• Engine automation and propulsion
• Power management and generators
• Ballast and stability systems
• Cargo handling and monitoring

These systems were designed for reliability, not cybersecurity. Compromise can cause:
• Sudden engine shutdown
• Loss of propulsion or steering
• Power blackout
• Unsafe ballast conditions

When OT systems fail, there is no "reset button" at sea.

INTEGRATION POINTS: THE HIDDEN DIGITAL BRIDGE

Modern vessels connect IT and OT through:
• Satellite communication links
• Remote diagnostics and maintenance
• Shore-based monitoring and support

If access is not properly controlled: An attacker can move from email → server → OT system.

This integration is the most dangerous vulnerability in modern ship design from a cybersecurity perspective.""",
            },
            {
                "title": "Topic 3: Critical Maritime Systems at Risk",
                "order_num": 3,
                "content": """ECDIS: WHEN THE CHART LIES

ECDIS (Electronic Chart Display and Information System) can be compromised through:
• Infected USB drives
• Unauthorized chart updates
• Unverified software patches

Always remember: If the data source is untrusted, the chart cannot be trusted.

GPS: ACCURATE UNTIL IT ISN'T

GPS signals can be spoofed (fake signals) or jammed (blocked completely), resulting in:
• Wrong position, course, or speed
• False confidence during critical manoeuvres

Golden Rule: Never trust GPS alone — cross-check with radar, depth sounder, and visual bearings.

AIS: SHIPS THAT APPEAR AND DISAPPEAR

AIS data can be manipulated to:
• Create phantom vessels
• Hide real ships from view
• Broadcast false identity or location

If AIS traffic looks strange, verify with radar and VHF.

ENGINE CONTROL SYSTEMS: NO SECOND CHANCES

Engine control systems operate on OT networks and often lack modern cybersecurity protection. Compromise can cause:
• Sudden engine stoppage
• Loss of manoeuvrability
• Total blackout

These systems must be physically isolated and accessed only by authorized personnel.

CARGO MANAGEMENT SYSTEMS: DATA ERRORS, REAL DAMAGE

Tampering can cause:
• Incorrect load distribution
• Stability issues
• Regulatory violations

Only authorized roles should access cargo data, and all changes must be logged.""",
            },
        ],
        "quiz": [
            {
                "order_num": 1,
                "question": "What type of cyberattack transmits fake GPS signals to deceive vessel navigation?",
                "options": ["Ransomware", "Phishing", "GPS Spoofing", "AIS Manipulation"],
                "correct_answer": 2,
                "explanation": "GPS Spoofing involves transmitting fake GPS signals that cause the vessel to display a wrong position while appearing to operate normally.",
            },
            {
                "order_num": 2,
                "question": "ECDIS can be compromised through which of the following?",
                "options": ["Only satellite communications", "Infected USB drives and unauthorized chart updates", "Engine room network only", "Crew Wi-Fi exclusively"],
                "correct_answer": 1,
                "explanation": "ECDIS can be compromised through infected USB drives, unauthorized chart updates, and unverified software patches.",
            },
            {
                "order_num": 3,
                "question": "What does OT stand for in the maritime cybersecurity context?",
                "options": ["Online Technology", "Operational Technology", "Offshore Terminal", "Output Technology"],
                "correct_answer": 1,
                "explanation": "OT stands for Operational Technology — systems that control engine automation, power management, ballast, and cargo handling.",
            },
            {
                "order_num": 4,
                "question": "If an attacker manipulates AIS data, what is the primary danger?",
                "options": ["Engine shutdown", "Data theft from cargo logs", "Poor collision avoidance decisions", "GPS system failure"],
                "correct_answer": 2,
                "explanation": "Manipulated AIS data can create phantom ships or hide real vessels, leading to poor collision avoidance decisions in congested waters.",
            },
            {
                "order_num": 5,
                "question": "Which Golden Rule applies to GPS navigation at sea?",
                "options": ["Always trust GPS data as the primary source", "Cross-check GPS with radar, depth sounder, and visual bearings", "Report only when GPS fails completely", "Use GPS as the sole positioning tool in clear weather"],
                "correct_answer": 1,
                "explanation": "The Golden Rule is: Never trust GPS alone — always cross-check with radar, depth sounder, and visual bearings to maintain safe navigation.",
            },
        ],
    },
    {
        "title": "Module 3: Real Incidents & Crew Best Practices",
        "description": "Learn from real-world maritime cyberattacks and apply proven cyber hygiene practices to protect shipboard systems.",
        "order_num": 3,
        "topics": [
            {
                "title": "Topic 1: Case Studies — Real Maritime Cyberattacks",
                "order_num": 1,
                "content": """CASE STUDY 1: MAERSK NOTPETYA ATTACK (2017)

What Happened:
A routine update of trusted Ukrainian accounting software carried hidden malware. Within minutes:
• 45,000 PCs and 4,000 servers destroyed
• 76 port terminals shut down worldwide
• Booking, cargo tracking, and documentation systems collapsed
• Financial losses: $250–300 million

Key Lesson:
The attacker did not break in — they were invited in through trusted software. Network segmentation alone could not stop the attack, but offline backups saved the company. One domain controller in Ghana that was offline during the attack became the only source to rebuild the entire network.

Critical insight: If that power outage hadn't occurred, recovery could have taken months or failed entirely.

CASE STUDY 2: COSCO SHIPPING RANSOMWARE (2018)

What Happened:
COSCO's North American network was hit by ransomware that locked systems and shut down email and booking platforms.

Impact:
Staff were forced to use manual, paper-based processes. However, strong regional network segmentation prevented spread beyond North America.

Lesson:
Segmentation limits damage when incidents occur. Having offline backup procedures is essential.

CASE STUDY 3: PORT OF SAN DIEGO RANSOMWARE (2018)

What Happened:
Administrative systems including documentation and permits were compromised.

Impact:
Vessel scheduling was delayed, port operations backed up, and ships waited longer at berth.

Lesson:
Administrative systems are operationally critical. Offline and manual procedures must be available and tested before an incident occurs.""",
            },
            {
                "title": "Topic 2: Cyber Hygiene for Crew Members",
                "order_num": 2,
                "content": """PASSWORDS: YOUR FIRST LINE OF DEFENSE

Use strong, unique passwords for ship systems. Never share them, even with colleagues.
If someone gets your password, they act with your authority.

Best practices:
• Use a mix of uppercase, lowercase, numbers, and symbols
• Change passwords periodically
• Never reuse the same password across multiple systems

USB DRIVES: THE SILENT INFECTION

Never plug unknown or personal USB drives into any ship system. Many cyber incidents begin with a seemingly "harmless" USB.

Rule: If you didn't bring it, approve it, or scan it — don't connect it.

SOFTWARE UPDATES: TRUST ONLY THE RIGHT SOURCE

Install software and updates only from authorized, verified vendors. Fake or unofficial updates can contain hidden malware.

A wrong update can damage systems more than no update at all.

EMAILS & MESSAGES: URGENCY IS A RED FLAG

Be cautious of emails or messages that:
• Demand immediate action
• Threaten consequences
• Ask for passwords or links

Always verify the sender through a second channel before responding or clicking.

WORKSTATIONS: LOCK BEFORE YOU WALK AWAY

Always lock computers when unattended. An unlocked system is an open door for misuse or attack.

If you leave it open, someone else controls it.

PERSONAL DEVICES: KEEP THEM SEPARATE

Avoid using public Wi-Fi on personal devices that also access ship data. Personal devices should never be connected to operational networks.

EARLY REPORTING: IF IN DOUBT, REPORT

Report unusual system behaviour immediately — pop-ups, slowdowns, unexpected reboots, or strange messages. Early reporting enables rapid response and limits damage.""",
            },
            {
                "title": "Topic 3: Securing Shipboard IT Systems",
                "order_num": 3,
                "content": """Digital security on IT systems requires multiple layers of protection.

FIREWALLS & ENDPOINT PROTECTION

Firewalls act like the hull of the ship, keeping unwanted traffic out. If outdated, attackers walk in unnoticed.

An unprotected system is an open sea — anyone can enter.

PATCHING & SOFTWARE CONTROL

Attackers exploit known vulnerabilities. Best practices:
• Apply patches as soon as approved by vendor/company
• Maintain an approved software list
• Remove unauthorized applications immediately

ACCESS CONTROL

Use role-based access so crew access only what they need for their role. Enable multi-factor authentication (MFA) where possible.

If everyone can access everything, attackers can too.

NETWORK SEPARATION

Critical systems must never share networks with:
• Crew Wi-Fi
• Personal devices
• Entertainment systems

Crew Wi-Fi is for comfort. Operational networks are for safety.

BACKUPS: YOUR LAST LINE OF SURVIVAL

Regular backups ensure systems can be restored after an incident. Backups are only useful if they are:
• Stored securely (not on the same compromised server)
• Offline or protected from the main network
• Tested regularly to ensure they work

The Maersk case proved this: a single offline server saved the entire company.""",
            },
            {
                "title": "Topic 4: Securing Operational Technology (OT)",
                "order_num": 4,
                "content": """Operational Technology controls engines, power, ballast, and propulsion. There are no second chances at sea.

ISOLATION: KEEP OT OFF THE INTERNET

OT systems must be physically and logically isolated from IT systems and the internet:
• No browsing on OT terminals
• No email access from OT systems
• No crew Wi-Fi connections to OT networks
• No shortcuts or exceptions

If OT is online, attackers are already closer than you think.

REMOTE ACCESS: CONVENIENCE IS A RISK

Vendor remote access must be:
• Absolutely essential (not just convenient)
• Time-limited to the duration of the task
• Closely monitored throughout the session
• Disabled immediately after use

Permanent remote access is an open hatch — not a service.

CHANGE & MAINTENANCE RECORDS

Every change to OT systems must be:
• Authorized by the responsible officer
• Logged with time, date, and reason
• Reviewed by a senior officer

If you don't know what changed, you don't know what can fail.

RISK ASSESSMENTS & EXERCISES

Regular tabletop exercises help crew understand failure scenarios and practice decision-making before actual incidents occur.

Practicing the response is as important as knowing the procedure.""",
            },
        ],
        "quiz": [
            {
                "order_num": 1,
                "question": "In the Maersk NotPetya attack (2017), how did the malware initially enter the network?",
                "options": ["A phishing email opened by a crew member", "An infected USB drive brought on board", "A trusted accounting software update", "An unsecured crew Wi-Fi connection"],
                "correct_answer": 2,
                "explanation": "The malware entered through a routine update of trusted Ukrainian accounting software — the attacker was invited in through a trusted channel, not by breaking in.",
            },
            {
                "order_num": 2,
                "question": "What ultimately saved the Maersk network during the NotPetya attack?",
                "options": ["A firewall update that blocked the malware", "One offline domain controller in Ghana", "Manual paper backup systems", "A quick response from the IT team"],
                "correct_answer": 1,
                "explanation": "One domain controller in Ghana happened to be offline during the attack due to a power outage. This single offline server became the only source to rebuild the entire global network.",
            },
            {
                "order_num": 3,
                "question": "Which of the following is NOT a recommended cyber hygiene practice for crew?",
                "options": ["Use strong passwords and change them periodically", "Share passwords with trusted colleagues only", "Lock screens when leaving workstations unattended", "Report unusual system behavior immediately"],
                "correct_answer": 1,
                "explanation": "Passwords must NEVER be shared with anyone, even trusted colleagues. If someone has your password, they act with your authority.",
            },
            {
                "order_num": 4,
                "question": "What should you do FIRST if you receive an email demanding your password urgently?",
                "options": ["Respond quickly to avoid consequences", "Ignore and permanently delete it", "Verify the sender through a second communication channel", "Forward it to all crew members to warn them"],
                "correct_answer": 2,
                "explanation": "Urgency is a red flag. Always verify the sender through a second channel (phone, radio) before responding. Never provide credentials via email.",
            },
            {
                "order_num": 5,
                "question": "For backups to be useful after a cyber incident, they must be:",
                "options": ["Created daily on the same network server", "Stored online for easy access from any device", "Stored securely offline or in a protected location, and tested regularly", "Shared with all crew members so multiple copies exist"],
                "correct_answer": 2,
                "explanation": "Backups are only useful if stored securely, kept offline or protected from the main network, and regularly tested. A backup on the same compromised server is not a backup.",
            },
        ],
    },
    {
        "title": "Module 4: Physical Security, Incident Response & IMO Compliance",
        "description": "Master physical security onboard, follow the correct incident response steps, and understand IMO regulatory requirements.",
        "order_num": 4,
        "topics": [
            {
                "title": "Topic 1: Physical Cybersecurity Risks Onboard",
                "order_num": 1,
                "content": """Not all cyberattacks come through the internet. Some walk onboard wearing safety shoes and carrying a laptop.

ACCESS TO BRIDGE & ENGINE CONTROL

The bridge and engine control room contain systems that directly control the vessel.

Rules:
• Restrict access to authorized personnel only
• Never allow unsupervised access by any visitor
• Challenge unfamiliar faces politely but firmly

If someone can touch the system, they can control it.

NETWORK CLOSETS & CABLES

Network cabinets, switches, and cable runs are often poorly secured and poorly labelled. An attacker can:
• Plug in a rogue device to capture data
• Disconnect alarm systems silently
• Intercept communications

One small device plugged into a network cabinet can compromise the entire ship.

TECHNICIANS & VISITORS

Before granting any access, always:
• Verify ID and port access badges
• Confirm purpose with the Master or Chief Engineer
• Supervise at all times throughout the visit

Uniforms and confidence are not proof of authorization.

Remember: Social engineers look and sound professional. Verification is always required.""",
            },
            {
                "title": "Topic 2: Cybersecurity During Port Calls",
                "order_num": 2,
                "content": """A vessel is never more exposed than during a port call. New people, new networks, time pressure, and routine work create perfect opportunities for cyber intrusion.

PORT NETWORKS: CONVENIENCE CAN BE A TRAP

Port and terminal networks are outside your control. Connecting ship systems to untrusted networks can allow:
• Malware entry into ship systems
• Data interception by third parties
• Unauthorized access to operational systems

If you wouldn't connect engine controls to public Wi-Fi, don't do it digitally.

VISITING TECHNICIANS: SUPERVISE EVERY MOVE

Rules that must never be broken:
• Only pre-approved devices may be connected to ship systems
• All devices must be whitelisted and scanned before connection
• Activities must be recorded and logged throughout the visit
• No technician should work unsupervised at any time

Unsupervised access is an open invitation to attackers.

INFORMATION SHARING: LESS IS SAFER

Share only what is necessary — nothing more:
• Avoid sharing full system details or network architecture
• Do not share passwords or network layouts with any visitor
• Follow data minimization principles at all times

The more information shared, the more attackers can exploit. Port calls are high-risk periods — maintain heightened vigilance throughout.""",
            },
            {
                "title": "Topic 3: Cyber Incident Reporting & Response",
                "order_num": 3,
                "content": """Cyber incidents do not start with explosions or alarms — they start with something that "doesn't look right." Your response in the first few minutes decides whether the ship stays safe or loses control.

STEP 1: IDENTIFY & CONTAIN

If you notice any of these warning signs:
• Pop-ups appearing unexpectedly
• System slowdown or unusual performance
• Unexpected reboots or restarts
• Strange messages or file locks

Action: Immediately isolate the affected system from the network if it is safe to do so.

STEP 2: INFORM

Notify immediately:
• The Master
• The designated Cyber Officer
• Shore IT / Security team

Do NOT try to fix the issue alone.

STEP 3: PRESERVE

• Do NOT power off critical systems unless specifically instructed
• Avoid rebooting affected systems
• Preserve logs, alerts, and on-screen messages

Evidence helps experts stop the attack and prevent repeat incidents.

STEP 4: DOCUMENT

Record everything:
• Time of first symptom
• What you saw and what was happening
• What actions were taken
• Any error messages displayed

Your notes may be more valuable than the system itself.

STEP 5: COMMUNICATE

If email or ship systems are compromised:
• Use phones, satellite calls, or other out-of-band communication
• Follow the approved communication plan
• Do not use potentially compromised systems for incident communication

STEP 6: LEARN & STRENGTHEN

Once systems are restored:
• Review what went wrong and how it happened
• Update procedures to prevent recurrence
• Brief the entire crew on lessons learned
• Fix gaps before attackers return""",
            },
            {
                "title": "Topic 4: IMO Regulations, Compliance & Best Practices",
                "order_num": 4,
                "content": """IMO RESOLUTION MSC.428(98): CYBERSECURITY IS NOW THE LAW

Cybersecurity is no longer a "best practice" — it is a regulatory requirement enforced by the International Maritime Organization (IMO).

This resolution mandates that cyber risk management must be included in the Safety Management System (SMS). Cybersecurity is treated just like fire safety, collision prevention, and pollution control.

Failure to comply can lead to:
• Audit findings and formal non-conformities
• Vessel detention
• Loss of certification
• Operational delays and port bans

WHAT AUDITORS LOOK FOR

During audits, inspectors verify whether the company and vessel have:
1. Cyber risk assessments — Do you know what systems are at risk?
2. Crew awareness and training — Do crew know how attacks happen and what to do?
3. Incident reporting and response procedures — Is there a clear plan?
4. Access control and system protection measures — Are systems properly protected?

Auditors may ask: "What would you do if systems go down?" or "Have you practiced this scenario?"

CYBERSECURITY DO'S FOR VESSELS:
• Use strong passwords and MFA — Prevents unauthorized access
• Keep systems patched and updated — Closes known security holes
• Segregate IT and OT networks — Limits incident damage
• Verify all software updates and sources — Prevents malware distribution
• Report suspicious activity immediately — Enables rapid response

CYBERSECURITY DON'TS FOR VESSELS:
• Do not share credentials — Compromises access control
• Do not connect personal devices to ship systems — Introduces outside threats
• Do not use unknown USBs — Risk of malware infection
• Do not click suspicious links — Enables phishing attacks
• Do not allow unsupervised vendor access — Permits unauthorized system access

THE RESILIENCE FORMULA

Resilience = Awareness + Preparedness + Segmentation + Backups

• Awareness stops mistakes before they happen
• Preparedness enables fast and correct response
• Segmentation limits the spread of damage
• Backups enable full recovery after an incident

Miss one, and the entire defence weakens.

FINAL MESSAGE FOR MARITIME PROFESSIONALS

Just as you keep a proper lookout, follow safety procedures, and prepare for emergencies — you must protect the ship digitally.

A cyber-aware crew is a safe crew.
A prepared ship is a resilient ship.
At sea, cybersecurity is seamanship.""",
            },
        ],
        "quiz": [
            {
                "order_num": 1,
                "question": "What is the correct first step in the Cyber Incident Response procedure?",
                "options": [
                    "Immediately notify the Master",
                    "Power off all affected systems",
                    "Identify and contain by isolating the affected system from the network",
                    "Document the incident in the logbook",
                ],
                "correct_answer": 2,
                "explanation": "Step 1 is to Identify & Contain — isolate the affected system from the network if safe to do so. This prevents the incident from spreading to other systems.",
            },
            {
                "order_num": 2,
                "question": "Under IMO Resolution MSC.428(98), where must cyber risk management be included?",
                "options": [
                    "The crew employment contract",
                    "The Safety Management System (SMS)",
                    "The cargo manifest",
                    "The vessel maintenance log",
                ],
                "correct_answer": 1,
                "explanation": "IMO Resolution MSC.428(98) mandates that cyber risk management must be included in the Safety Management System (SMS) of all shipping companies.",
            },
            {
                "order_num": 3,
                "question": "Someone claiming to be 'IT support' asks for your ECDIS password to fix an issue. What is the correct response?",
                "options": [
                    "Provide it if they show a company ID badge",
                    "Provide it with time limit of 30 minutes",
                    "Do not provide it — verify identity through the Master and follow company procedures",
                    "Provide it only if the Chief Officer is present",
                ],
                "correct_answer": 2,
                "explanation": "Never provide passwords to anyone regardless of claimed authority. Verify the person's identity through the Master or designated Cyber Officer and follow company procedures.",
            },
            {
                "order_num": 4,
                "question": "According to the Resilience Formula, which four elements make a vessel cyber-resilient?",
                "options": [
                    "Speed, Strength, Stability, Backup",
                    "Awareness, Preparedness, Segmentation, Backups",
                    "IT, OT, HR, and Management",
                    "Detection, Response, Recovery, Review",
                ],
                "correct_answer": 1,
                "explanation": "The Resilience Formula is: Resilience = Awareness + Preparedness + Segmentation + Backups. Each element addresses a different aspect of cyber defence.",
            },
            {
                "order_num": 5,
                "question": "During a port call, a visiting technician wants to connect their personal laptop to a ship system. What should you do?",
                "options": [
                    "Allow it if the technician is from a reputable company",
                    "Allow it if the Master gives verbal approval",
                    "Only allow pre-approved, whitelisted, and scanned devices; supervise at all times",
                    "Allow it during daytime hours only",
                ],
                "correct_answer": 2,
                "explanation": "Only pre-approved devices may be connected to ship systems. All devices must be whitelisted and scanned before connection, and technicians must be supervised at all times.",
            },
        ],
    },
]

# ── SEED ───────────────────────────────────────────────────────────────────────
for mod_data in MODULES:
    module = models.StudyModule(
        title=mod_data["title"],
        description=mod_data["description"],
        order_num=mod_data["order_num"],
    )
    db.add(module)
    db.flush()  # get module.id

    for topic_data in mod_data["topics"]:
        topic = models.StudyTopic(
            module_id=module.id,
            title=topic_data["title"],
            content=topic_data["content"],
            order_num=topic_data["order_num"],
        )
        db.add(topic)

    for q_data in mod_data["quiz"]:
        question = models.StudyQuizQuestion(
            module_id=module.id,
            question=q_data["question"],
            options=q_data["options"],
            correct_answer=q_data["correct_answer"],
            explanation=q_data["explanation"],
            order_num=q_data["order_num"],
        )
        db.add(question)

db.commit()
db.close()
print("Study data seeded successfully.")
print(f"  {len(MODULES)} modules")
total_topics = sum(len(m["topics"]) for m in MODULES)
total_quiz = sum(len(m["quiz"]) for m in MODULES)
print(f"  {total_topics} topics")
print(f"  {total_quiz} quiz questions")
