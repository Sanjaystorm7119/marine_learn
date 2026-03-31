import ecdisLesson1 from "../assets/GPS Spoofing Defense - Lesson 1 Summary_720p_caption.mp4"; // courseData.js — Course data for all departments
import ecdisLesson2 from "../assets/GNSS Vulnerability Analysis - Lesson 2 Summary_720p_caption.mp4";
const coursesByDepartment = {
  deck: [
    {
      id: "ecdis-cybersecurity",
      title: "ECDIS Cybersecurity Fundamentals",
      icon: "🔒",
      description: "Learn to protect Electronic Chart Display and Information Systems from cyber threats, GPS spoofing, and AIS vulnerabilities.",
      totalDuration: "1h 20min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: GPS & GNSS Security",
          lessons: [
            { id: "l1", title: "GPS Spoofing Defense", duration: "20min", videoUrl: ecdisLesson1, topics: ["What is GPS spoofing", "Detection techniques", "Mitigation strategies", "Case studies"] },
            { id: "l2", title: "GNSS Vulnerability Analysis", duration: "20min", videoUrl: ecdisLesson2, topics: ["GNSS architecture overview", "Known vulnerabilities", "Hardening techniques", "Best practices"] },
          ],
        },
        
      ],
      quizPool: generateQuizPool("ECDIS Cybersecurity Fundamentals"),
    },
    {
      id: "bridge-network-security",
      title: "Bridge Network Security",
      icon: "🔒",
      description: "Comprehensive maritime cybersecurity training: Bridge Network Security",
      totalDuration: "1h 30min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Threat Awareness",
          lessons: [
            { id: "l1", title: "Understanding Cyber Threats", duration: "15min", topics: ["Threat landscape", "Common attack types", "Maritime-specific risks"] },
            { id: "l2", title: "Attack Vectors & Entry Points", duration: "15min", topics: ["Network entry points", "Wireless vulnerabilities", "Physical access risks"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Defense & Mitigation",
          lessons: [
            { id: "l3", title: "Firewall Configuration", duration: "15min", topics: ["Firewall basics", "Rule management", "Monitoring"] },
            { id: "l4", title: "Network Segmentation", duration: "15min", topics: ["VLAN setup", "DMZ concepts", "Isolation strategies"] },
          ],
        },
        {
          id: "ch3",
          title: "Chapter 3: Practical Application",
          lessons: [
            { id: "l5", title: "Incident Response on Bridge", duration: "15min", topics: ["Response procedures", "Escalation paths", "Documentation"] },
            { id: "l6", title: "Security Auditing", duration: "15min", topics: ["Audit checklists", "Log analysis", "Reporting"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Bridge Network Security"),
    },
    {
      id: "ais-spoofing-defense",
      title: "AIS Spoofing & Defense Strategies",
      icon: "📡",
      description: "Identify and counter Automatic Identification System spoofing attacks.",
      totalDuration: "55min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: AIS Spoofing Basics",
          lessons: [
            { id: "l1", title: "How AIS Spoofing Works", duration: "20min", topics: ["AIS protocol", "Spoofing methods", "Real-world examples"] },
            { id: "l2", title: "Detection Techniques", duration: "15min", topics: ["Anomaly detection", "Cross-referencing data", "Alert systems"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Defense Strategies",
          lessons: [
            { id: "l3", title: "Countermeasures & Best Practices", duration: "20min", topics: ["Authentication methods", "Redundant systems", "Reporting procedures"] },
          ],
        },
      ],
      quizPool: generateQuizPool("AIS Spoofing & Defense Strategies"),
    },
    {
      id: "maritime-phishing-awareness",
      title: "Maritime Phishing Awareness",
      icon: "🎣",
      description: "Recognize phishing emails and social engineering tactics targeting deck officers.",
      totalDuration: "45min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Phishing Fundamentals",
          lessons: [
            { id: "l1", title: "Types of Phishing Attacks", duration: "20min", topics: ["Email phishing", "Spear phishing", "Whaling attacks"] },
            { id: "l2", title: "Recognizing Phishing Attempts", duration: "25min", topics: ["Red flags", "URL inspection", "Email header analysis"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Maritime Phishing Awareness"),
    },
    {
      id: "gnss-vulnerability-assessment",
      title: "GNSS Vulnerability Assessment",
      icon: "🛰️",
      description: "Conduct vulnerability assessments on Global Navigation Satellite Systems onboard.",
      totalDuration: "1h 15min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: GNSS Fundamentals",
          lessons: [
            { id: "l1", title: "GNSS Architecture", duration: "25min", topics: ["System components", "Signal types", "Vulnerability overview"] },
            { id: "l2", title: "Assessment Methodology", duration: "25min", topics: ["Assessment framework", "Tools and techniques", "Documentation"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Remediation",
          lessons: [
            { id: "l3", title: "Mitigation and Hardening", duration: "25min", topics: ["Configuration hardening", "Monitoring setup", "Incident response"] },
          ],
        },
      ],
      quizPool: generateQuizPool("GNSS Vulnerability Assessment"),
    },
    {
      id: "deck-usb-threat-prevention",
      title: "USB Threat Prevention for Deck",
      icon: "💾",
      description: "Prevent malware infections through USB devices connected to bridge equipment.",
      totalDuration: "40min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: USB Threats",
          lessons: [
            { id: "l1", title: "USB Attack Vectors", duration: "20min", topics: ["Malware delivery", "BadUSB attacks", "Data exfiltration"] },
            { id: "l2", title: "Prevention & Policy", duration: "20min", topics: ["USB policies", "Device control", "Safe usage practices"] },
          ],
        },
      ],
      quizPool: generateQuizPool("USB Threat Prevention for Deck"),
    },
    {
      id: "deck-remote-access-security",
      title: "Remote Access Security Protocols",
      icon: "🔐",
      description: "Secure remote desktop and VPN access used for vessel management from shore.",
      totalDuration: "1h 05min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Remote Access Fundamentals",
          lessons: [
            { id: "l1", title: "VPN Security", duration: "20min", topics: ["VPN types", "Configuration", "Authentication"] },
            { id: "l2", title: "Remote Desktop Security", duration: "25min", topics: ["RDP hardening", "Session management", "Access controls"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Advanced Protocols",
          lessons: [
            { id: "l3", title: "Multi-Factor Authentication", duration: "20min", topics: ["MFA methods", "Implementation", "User training"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Remote Access Security Protocols"),
    },
  ],

  engine: [
    {
      id: "engine-scada-security",
      title: "Engine Control SCADA Security",
      icon: "⚙️",
      description: "Master SCADA system security in marine engine rooms including PLC protection.",
      totalDuration: "1h 30min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: SCADA Fundamentals",
          lessons: [
            { id: "l1", title: "SCADA Architecture Overview", duration: "30min", topics: ["System components", "Communication protocols", "Attack surface"] },
            { id: "l2", title: "Marine SCADA Specifics", duration: "30min", topics: ["Engine room systems", "Integration points", "Common vulnerabilities"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Security Controls",
          lessons: [
            { id: "l3", title: "Securing SCADA Systems", duration: "30min", topics: ["Access control", "Network isolation", "Monitoring and alerting"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Engine Control SCADA Security"),
    },
    {
      id: "ot-network-defense",
      title: "OT Network Defense for Engineers",
      icon: "🛡️",
      description: "Defend operational technology networks from cyber intrusions in engine spaces.",
      totalDuration: "1h 15min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: OT Network Basics",
          lessons: [
            { id: "l1", title: "OT vs IT Networks", duration: "25min", topics: ["Key differences", "Protocol overview", "Security challenges"] },
            { id: "l2", title: "Threat Landscape", duration: "25min", topics: ["Common threats", "Attack case studies", "Risk assessment"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Defense Techniques",
          lessons: [
            { id: "l3", title: "Network Segmentation & Monitoring", duration: "25min", topics: ["Zone model", "IDS/IPS for OT", "Log management"] },
          ],
        },
      ],
      quizPool: generateQuizPool("OT Network Defense for Engineers"),
    },
    {
      id: "plc-malware-protection",
      title: "PLC Malware Protection",
      icon: "🔧",
      description: "Protect Programmable Logic Controllers from targeted malware and firmware attacks.",
      totalDuration: "1h 00min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: PLC Security",
          lessons: [
            { id: "l1", title: "PLC Attack Methods", duration: "30min", topics: ["Malware types", "Firmware attacks", "Stuxnet analysis"] },
            { id: "l2", title: "Protection Strategies", duration: "30min", topics: ["Code integrity", "Access control", "Patch management"] },
          ],
        },
      ],
      quizPool: generateQuizPool("PLC Malware Protection"),
    },
    {
      id: "engine-ransomware-response",
      title: "Engine Room Ransomware Response",
      icon: "🚨",
      description: "Learn response protocols for ransomware attacks affecting engine control systems.",
      totalDuration: "50min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Ransomware Awareness",
          lessons: [
            { id: "l1", title: "Understanding Ransomware", duration: "25min", topics: ["How ransomware works", "Maritime incidents", "Impact assessment"] },
            { id: "l2", title: "Response Procedures", duration: "25min", topics: ["Isolation steps", "Communication protocols", "Recovery planning"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Engine Room Ransomware Response"),
    },
    {
      id: "industrial-iot-security",
      title: "Industrial IoT Security at Sea",
      icon: "📶",
      description: "Secure Internet of Things sensors and connected devices in the engine department.",
      totalDuration: "1h 10min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: IIoT Fundamentals",
          lessons: [
            { id: "l1", title: "IIoT Device Overview", duration: "20min", topics: ["Device types", "Communication protocols", "Attack surface"] },
            { id: "l2", title: "Vulnerabilities & Threats", duration: "20min", topics: ["Common weaknesses", "Real-world attacks", "Risk scoring"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Securing IIoT",
          lessons: [
            { id: "l3", title: "Security Best Practices", duration: "30min", topics: ["Device hardening", "Network controls", "Monitoring"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Industrial IoT Security at Sea"),
    },
    {
      id: "engine-firmware-integrity",
      title: "Firmware Integrity Monitoring",
      icon: "💡",
      description: "Monitor and validate firmware integrity on engine room control systems.",
      totalDuration: "1h 05min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Firmware Security",
          lessons: [
            { id: "l1", title: "Firmware Attack Vectors", duration: "30min", topics: ["Firmware modifications", "Supply chain risks", "Detection methods"] },
            { id: "l2", title: "Integrity Monitoring", duration: "35min", topics: ["Hash verification", "Secure boot", "Alerting systems"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Firmware Integrity Monitoring"),
    },
    {
      id: "engine-patch-management",
      title: "OT Patch Management at Sea",
      icon: "🔄",
      description: "Implement safe patching strategies for operational technology in engine spaces.",
      totalDuration: "55min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Patch Management",
          lessons: [
            { id: "l1", title: "OT Patching Challenges", duration: "25min", topics: ["Uptime requirements", "Compatibility risks", "Vendor coordination"] },
            { id: "l2", title: "Safe Patching Process", duration: "30min", topics: ["Change management", "Testing procedures", "Rollback plans"] },
          ],
        },
      ],
      quizPool: generateQuizPool("OT Patch Management at Sea"),
    },
  ],

  safety: [
    {
      id: "stcw-basic-safety",
      title: "STCW Cyber Safety Training",
      icon: "🛡️",
      description: "STCW-compliant training covering cyber threats to safety-critical systems.",
      totalDuration: "2h 00min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: STCW & Cyber",
          lessons: [
            { id: "l1", title: "STCW Cyber Requirements", duration: "30min", topics: ["Regulation overview", "Compliance requirements", "Training standards"] },
            { id: "l2", title: "Safety-Critical Systems", duration: "30min", topics: ["System identification", "Cyber-safety interface", "Risk analysis"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Practical Safety",
          lessons: [
            { id: "l3", title: "Emergency Procedures", duration: "30min", topics: ["Cyber emergency drills", "Communication protocols", "Safety backups"] },
            { id: "l4", title: "Compliance & Reporting", duration: "30min", topics: ["Audit preparation", "Incident reporting", "Documentation"] },
          ],
        },
      ],
      quizPool: generateQuizPool("STCW Cyber Safety Training"),
    },
    {
      id: "emergency-system-cyber-resilience",
      title: "Emergency System Cyber Resilience",
      icon: "🚨",
      description: "Ensure cyber resilience of fire detection, alarms, and emergency shutdown systems.",
      totalDuration: "1h 20min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Emergency Systems",
          lessons: [
            { id: "l1", title: "Fire & Alarm System Security", duration: "25min", topics: ["System overview", "Cyber risks", "Hardening steps"] },
            { id: "l2", title: "Emergency Shutdown Security", duration: "25min", topics: ["ESD systems", "Tampering risks", "Integrity checks"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Resilience Planning",
          lessons: [
            { id: "l3", title: "Resilience Strategies", duration: "30min", topics: ["Redundancy", "Failover planning", "Testing procedures"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Emergency System Cyber Resilience"),
    },
    {
      id: "safety-data-integrity",
      title: "Safety Data Integrity & Tampering",
      icon: "📋",
      description: "Detect and prevent tampering with safety logs, drills records, and compliance data.",
      totalDuration: "1h 00min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Data Integrity",
          lessons: [
            { id: "l1", title: "Log Tampering Threats", duration: "30min", topics: ["Attack methods", "Detection techniques", "Evidence preservation"] },
            { id: "l2", title: "Protecting Safety Records", duration: "30min", topics: ["Access controls", "Audit trails", "Backup strategies"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Safety Data Integrity & Tampering"),
    },
    {
      id: "cyber-incident-drills",
      title: "Cyber Incident Response Drills",
      icon: "📋",
      description: "Plan and execute cyber incident response drills as part of safety management.",
      totalDuration: "1h 30min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Drill Planning",
          lessons: [
            { id: "l1", title: "Planning Cyber Drills", duration: "30min", topics: ["Scenario design", "Roles and responsibilities", "Objectives"] },
            { id: "l2", title: "Executing Drills", duration: "30min", topics: ["Drill facilitation", "Communication", "Documentation"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: After Action",
          lessons: [
            { id: "l3", title: "After-Action Review", duration: "30min", topics: ["Lessons learned", "Gap analysis", "Improvement planning"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Cyber Incident Response Drills"),
    },
    {
      id: "ism-cyber-compliance",
      title: "ISM Code Cyber Compliance",
      icon: "📜",
      description: "Integrate cybersecurity requirements into the ISM Code safety management system.",
      totalDuration: "55min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: ISM & Cyber",
          lessons: [
            { id: "l1", title: "ISM Code Overview", duration: "25min", topics: ["ISM requirements", "Cyber integration", "Compliance framework"] },
            { id: "l2", title: "Implementation", duration: "30min", topics: ["Policy development", "Procedure updates", "Audit preparation"] },
          ],
        },
      ],
      quizPool: generateQuizPool("ISM Code Cyber Compliance"),
    },
    {
      id: "safety-reporting-protocols",
      title: "Cyber Incident Reporting Protocols",
      icon: "📣",
      description: "Master the procedures for reporting cyber incidents to flag states and authorities.",
      totalDuration: "45min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Reporting Requirements",
          lessons: [
            { id: "l1", title: "Reporting Obligations", duration: "20min", topics: ["Flag state requirements", "IMO guidelines", "Timelines"] },
            { id: "l2", title: "Reporting Process", duration: "25min", topics: ["Incident classification", "Report format", "Communication channels"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Cyber Incident Reporting Protocols"),
    },
    {
      id: "safety-risk-assessment",
      title: "Cyber Risk Assessment for Safety",
      icon: "⚖️",
      description: "Conduct comprehensive cyber risk assessments aligned with maritime safety frameworks.",
      totalDuration: "1h 15min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Risk Assessment Basics",
          lessons: [
            { id: "l1", title: "Risk Assessment Methodology", duration: "25min", topics: ["Risk frameworks", "Asset identification", "Threat modeling"] },
            { id: "l2", title: "Maritime Risk Context", duration: "25min", topics: ["Maritime-specific risks", "Consequence analysis", "Prioritization"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Assessment Execution",
          lessons: [
            { id: "l3", title: "Conducting the Assessment", duration: "25min", topics: ["Data collection", "Risk scoring", "Reporting"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Cyber Risk Assessment for Safety"),
    },
  ],

  navigation: [
    {
      id: "radar-arpa-fundamentals",
      title: "Radar & ARPA Cyber Threats",
      icon: "📡",
      description: "Understand cyber threats to radar and ARPA systems used in navigation.",
      totalDuration: "1h 40min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Radar System Security",
          lessons: [
            { id: "l1", title: "Radar Cyber Threats", duration: "30min", topics: ["Attack vectors", "Signal manipulation", "System vulnerabilities"] },
            { id: "l2", title: "ARPA Security", duration: "30min", topics: ["Data integrity", "Tracking manipulation", "Defense measures"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Protection Measures",
          lessons: [
            { id: "l3", title: "Securing Navigation Systems", duration: "40min", topics: ["Hardening techniques", "Monitoring", "Incident response"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Radar & ARPA Cyber Threats"),
    },
    {
      id: "vdr-data-protection",
      title: "VDR Data Protection & Security",
      icon: "💾",
      description: "Protect Voyage Data Recorder data from unauthorized access and manipulation.",
      totalDuration: "1h 00min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: VDR Security",
          lessons: [
            { id: "l1", title: "VDR System Overview", duration: "30min", topics: ["VDR architecture", "Data types", "Regulatory requirements"] },
            { id: "l2", title: "Protecting VDR Data", duration: "30min", topics: ["Access controls", "Tamper detection", "Data recovery"] },
          ],
        },
      ],
      quizPool: generateQuizPool("VDR Data Protection & Security"),
    },
    {
      id: "gmdss-cyber-awareness",
      title: "GMDSS Cyber Awareness",
      icon: "📻",
      description: "Identify cyber risks to the Global Maritime Distress and Safety System.",
      totalDuration: "1h 15min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: GMDSS Fundamentals",
          lessons: [
            { id: "l1", title: "GMDSS System Overview", duration: "25min", topics: ["System components", "Communication channels", "Cyber risks"] },
            { id: "l2", title: "Attack Scenarios", duration: "25min", topics: ["Jamming", "Spoofing", "Unauthorized access"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Security Measures",
          lessons: [
            { id: "l3", title: "GMDSS Security Best Practices", duration: "25min", topics: ["Configuration hardening", "Monitoring", "Incident response"] },
          ],
        },
      ],
      quizPool: generateQuizPool("GMDSS Cyber Awareness"),
    },
    {
      id: "nav-system-spoofing",
      title: "Navigation System Spoofing Attacks",
      icon: "🎯",
      description: "Detect and mitigate spoofing attacks on integrated navigation systems.",
      totalDuration: "1h 10min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Spoofing Fundamentals",
          lessons: [
            { id: "l1", title: "Types of Spoofing Attacks", duration: "35min", topics: ["GPS spoofing", "AIS spoofing", "Radar spoofing"] },
            { id: "l2", title: "Detection & Mitigation", duration: "35min", topics: ["Detection methods", "Cross-validation", "Response procedures"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Navigation System Spoofing Attacks"),
    },
    {
      id: "electronic-chart-tampering",
      title: "Electronic Chart Tampering Defense",
      icon: "🗺️",
      description: "Prevent unauthorized modifications to electronic navigational charts.",
      totalDuration: "55min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Chart Security",
          lessons: [
            { id: "l1", title: "Chart Tampering Threats", duration: "25min", topics: ["Modification methods", "Impact on navigation", "Detection"] },
            { id: "l2", title: "Security Controls", duration: "30min", topics: ["Authentication", "Integrity verification", "Update procedures"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Electronic Chart Tampering Defense"),
    },
    {
      id: "nav-autopilot-security",
      title: "Autopilot System Cyber Defense",
      icon: "🧭",
      description: "Protect autopilot and track control systems from unauthorized cyber manipulation.",
      totalDuration: "1h 20min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Autopilot Security",
          lessons: [
            { id: "l1", title: "Autopilot Vulnerabilities", duration: "25min", topics: ["System architecture", "Attack vectors", "Historical incidents"] },
            { id: "l2", title: "Defense Strategies", duration: "25min", topics: ["Access controls", "Anomaly detection", "Manual overrides"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Advanced Protection",
          lessons: [
            { id: "l3", title: "Advanced Security Measures", duration: "30min", topics: ["Encryption", "Authentication", "Continuous monitoring"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Autopilot System Cyber Defense"),
    },
    {
      id: "nav-satcom-threats",
      title: "SATCOM Vulnerability Awareness",
      icon: "🛰️",
      description: "Identify vulnerabilities in satellite communication systems used for navigation.",
      totalDuration: "50min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: SATCOM Security",
          lessons: [
            { id: "l1", title: "SATCOM Vulnerabilities", duration: "25min", topics: ["Known vulnerabilities", "Attack examples", "Risk assessment"] },
            { id: "l2", title: "Mitigation Strategies", duration: "25min", topics: ["Configuration hardening", "Monitoring", "Vendor coordination"] },
          ],
        },
      ],
      quizPool: generateQuizPool("SATCOM Vulnerability Awareness"),
    },
  ],

  electrical: [
    {
      id: "marine-electrical-safety",
      title: "Marine Electrical Cyber Safety",
      icon: "⚡",
      description: "Protect electrical control and monitoring systems from cyber attacks.",
      totalDuration: "1h 30min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Electrical System Threats",
          lessons: [
            { id: "l1", title: "Cyber Threats to Electrical Systems", duration: "30min", topics: ["System overview", "Attack vectors", "Impact analysis"] },
            { id: "l2", title: "Security Controls", duration: "30min", topics: ["Access management", "Network isolation", "Monitoring"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Practical Protection",
          lessons: [
            { id: "l3", title: "Implementing Electrical Cyber Safety", duration: "30min", topics: ["Policy implementation", "Training", "Incident response"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Marine Electrical Cyber Safety"),
    },
    {
      id: "power-management-security",
      title: "Power Management System Security",
      icon: "🔋",
      description: "Secure power management and distribution systems against cyber threats.",
      totalDuration: "1h 20min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: PMS Security",
          lessons: [
            { id: "l1", title: "PMS Architecture & Risks", duration: "25min", topics: ["System components", "Communication protocols", "Vulnerabilities"] },
            { id: "l2", title: "Attack Scenarios", duration: "25min", topics: ["Denial of service", "Unauthorized control", "Data manipulation"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Security Implementation",
          lessons: [
            { id: "l3", title: "Securing Power Management", duration: "30min", topics: ["Authentication", "Network controls", "Incident response"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Power Management System Security"),
    },
    {
      id: "ups-battery-cyber-risks",
      title: "UPS & Battery System Cyber Risks",
      icon: "🔌",
      description: "Understand cyber risks to uninterruptible power supplies and battery backups.",
      totalDuration: "50min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: UPS Cyber Risks",
          lessons: [
            { id: "l1", title: "UPS Attack Vectors", duration: "25min", topics: ["Network-connected UPS risks", "Firmware attacks", "Remote management"] },
            { id: "l2", title: "Protection Measures", duration: "25min", topics: ["Access controls", "Network isolation", "Monitoring"] },
          ],
        },
      ],
      quizPool: generateQuizPool("UPS & Battery System Cyber Risks"),
    },
    {
      id: "electrical-scada-hardening",
      title: "Electrical SCADA Hardening",
      icon: "⚡",
      description: "Harden SCADA systems managing shipboard electrical generation and distribution.",
      totalDuration: "1h 15min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: SCADA Hardening Basics",
          lessons: [
            { id: "l1", title: "Hardening Methodology", duration: "25min", topics: ["Baseline configuration", "Vulnerability assessment", "Prioritization"] },
            { id: "l2", title: "Technical Controls", duration: "25min", topics: ["Firewall rules", "User access", "Patch management"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Continuous Security",
          lessons: [
            { id: "l3", title: "Ongoing Monitoring & Maintenance", duration: "25min", topics: ["Log monitoring", "Change management", "Periodic review"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Electrical SCADA Hardening"),
    },
    {
      id: "switchboard-cyber-protection",
      title: "Switchboard Cyber Protection",
      icon: "🔌",
      description: "Protect digital switchboard controls from unauthorized cyber access.",
      totalDuration: "1h 00min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Switchboard Security",
          lessons: [
            { id: "l1", title: "Digital Switchboard Risks", duration: "30min", topics: ["System architecture", "Remote access risks", "Attack scenarios"] },
            { id: "l2", title: "Security Measures", duration: "30min", topics: ["Authentication", "Network controls", "Physical security"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Switchboard Cyber Protection"),
    },
    {
      id: "electrical-network-segmentation",
      title: "Network Segmentation for Electrical",
      icon: "🔀",
      description: "Implement network segmentation to isolate electrical control systems from IT networks.",
      totalDuration: "1h 10min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Segmentation Principles",
          lessons: [
            { id: "l1", title: "Why Segment Networks", duration: "20min", topics: ["Security benefits", "Compliance requirements", "Design principles"] },
            { id: "l2", title: "Segmentation Design", duration: "25min", topics: ["Zone model", "VLAN design", "Firewall placement"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Implementation",
          lessons: [
            { id: "l3", title: "Implementing Segmentation", duration: "25min", topics: ["Technical implementation", "Testing", "Documentation"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Network Segmentation for Electrical"),
    },
    {
      id: "electrical-smart-sensor-security",
      title: "Smart Sensor Security",
      icon: "📊",
      description: "Secure smart sensors and IoT devices used in electrical monitoring systems.",
      totalDuration: "45min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Smart Sensor Security",
          lessons: [
            { id: "l1", title: "Sensor Vulnerabilities", duration: "20min", topics: ["Common weaknesses", "Attack methods", "Real-world examples"] },
            { id: "l2", title: "Securing Sensors", duration: "25min", topics: ["Device hardening", "Communication security", "Monitoring"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Smart Sensor Security"),
    },
  ],

  catering: [
    {
      id: "catering-data-privacy",
      title: "Crew Data Privacy & Protection",
      icon: "🔐",
      description: "Protect crew personal data and payment information from cyber threats.",
      totalDuration: "45min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Data Privacy Basics",
          lessons: [
            { id: "l1", title: "GDPR & Maritime Data", duration: "20min", topics: ["GDPR overview", "Maritime context", "Crew data types"] },
            { id: "l2", title: "Protecting Personal Data", duration: "25min", topics: ["Data minimization", "Access controls", "Breach response"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Crew Data Privacy & Protection"),
    },
    {
      id: "pos-system-security",
      title: "POS System Security Onboard",
      icon: "💳",
      description: "Secure Point of Sale systems used in onboard shops and bars.",
      totalDuration: "55min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: POS Security",
          lessons: [
            { id: "l1", title: "POS Attack Methods", duration: "25min", topics: ["Skimming", "Network attacks", "Malware"] },
            { id: "l2", title: "Securing POS Systems", duration: "30min", topics: ["PCI-DSS basics", "Network isolation", "Software hardening"] },
          ],
        },
      ],
      quizPool: generateQuizPool("POS System Security Onboard"),
    },
    {
      id: "social-engineering-defense",
      title: "Social Engineering Defense",
      icon: "🎭",
      description: "Recognize social engineering attacks targeting non-technical crew members.",
      totalDuration: "1h 00min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Social Engineering",
          lessons: [
            { id: "l1", title: "Types of Social Engineering", duration: "20min", topics: ["Phishing", "Pretexting", "Baiting", "Quid pro quo"] },
            { id: "l2", title: "Recognition & Reporting", duration: "20min", topics: ["Red flags", "Verification steps", "Reporting channels"] },
          ],
        },
        {
          id: "ch2",
          title: "Chapter 2: Defense Techniques",
          lessons: [
            { id: "l3", title: "Building a Security Mindset", duration: "20min", topics: ["Security awareness", "Healthy skepticism", "Team culture"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Social Engineering Defense"),
    },
    {
      id: "wifi-network-safety",
      title: "Wi-Fi & Network Safety for Crew",
      icon: "📶",
      description: "Safe usage of Wi-Fi networks and personal devices while onboard.",
      totalDuration: "40min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Wi-Fi Safety",
          lessons: [
            { id: "l1", title: "Wi-Fi Risks Onboard", duration: "20min", topics: ["Rogue access points", "Man-in-the-middle", "Password hygiene"] },
            { id: "l2", title: "Safe Network Practices", duration: "20min", topics: ["VPN usage", "Device separation", "Reporting issues"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Wi-Fi & Network Safety for Crew"),
    },
    {
      id: "supply-chain-cyber-risks",
      title: "Supply Chain Cyber Risks",
      icon: "📦",
      description: "Identify cyber risks in the maritime catering supply chain and provisioning systems.",
      totalDuration: "1h 10min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Supply Chain Threats",
          lessons: [
            { id: "l1", title: "Supply Chain Attack Vectors", duration: "30min", topics: ["Vendor risks", "Software supply chain", "Hardware tampering"] },
            { id: "l2", title: "Mitigation Strategies", duration: "40min", topics: ["Vendor vetting", "Integrity checks", "Contractual controls"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Supply Chain Cyber Risks"),
    },
    {
      id: "catering-password-hygiene",
      title: "Password Hygiene & MFA Basics",
      icon: "🔑",
      description: "Best practices for password management and multi-factor authentication for crew.",
      totalDuration: "35min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Password Security",
          lessons: [
            { id: "l1", title: "Strong Password Practices", duration: "15min", topics: ["Password creation", "Password managers", "Common mistakes"] },
            { id: "l2", title: "Multi-Factor Authentication", duration: "20min", topics: ["MFA types", "Setup steps", "Recovery codes"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Password Hygiene & MFA Basics"),
    },
    {
      id: "catering-device-safety",
      title: "Personal Device Safety Onboard",
      icon: "📱",
      description: "Safely use personal laptops, phones, and tablets while connected to ship networks.",
      totalDuration: "50min",
      chapters: [
        {
          id: "ch1",
          title: "Chapter 1: Device Safety",
          lessons: [
            { id: "l1", title: "Personal Device Risks", duration: "25min", topics: ["Malware risks", "Data leakage", "Ship network impact"] },
            { id: "l2", title: "Safe Device Practices", duration: "25min", topics: ["Updates and patches", "Antivirus", "Acceptable use policy"] },
          ],
        },
      ],
      quizPool: generateQuizPool("Personal Device Safety Onboard"),
    },
  ],
};

// ─── Quiz Pool Generator ──────────────────────────────────────────────────────
function generateQuizPool(courseTitle) {
  return [
    { id: "q1", question: `What is the primary goal of cybersecurity in ${courseTitle}?`, options: ["Increase vessel speed", "Protect systems from unauthorized access and threats", "Reduce fuel consumption", "Improve navigation accuracy"], correctIndex: 1 },
    { id: "q2", question: "Which of the following is a common cyber threat in maritime environments?", options: ["Anchor drag", "GPS spoofing", "Hull corrosion", "Engine overheating"], correctIndex: 1 },
    { id: "q3", question: "What does MFA stand for?", options: ["Maritime Frequency Allocation", "Multi-Factor Authentication", "Manual Firewall Access", "Marine Fire Alarm"], correctIndex: 1 },
    { id: "q4", question: "Which action best protects against phishing attacks?", options: ["Click all email links to verify them", "Share login credentials with trusted colleagues", "Verify sender identity before clicking links", "Disable email filtering systems"], correctIndex: 2 },
    { id: "q5", question: "What is network segmentation?", options: ["Physically separating computers", "Dividing a network into isolated zones to limit threat spread", "Increasing network bandwidth", "Connecting all ship systems together"], correctIndex: 1 },
    { id: "q6", question: "What should you do if you suspect a cyber incident onboard?", options: ["Ignore it and continue working", "Report it immediately to the designated officer", "Try to fix it yourself without telling anyone", "Turn off all ship systems"], correctIndex: 1 },
    { id: "q7", question: "What is a vulnerability in cybersecurity?", options: ["A strength in the security system", "A weakness that could be exploited by attackers", "A type of firewall", "A backup power system"], correctIndex: 1 },
    { id: "q8", question: "Why is software patching important?", options: ["It increases internet speed", "It fixes security vulnerabilities in software", "It reduces power consumption", "It improves the user interface"], correctIndex: 1 },
    { id: "q9", question: "What is ransomware?", options: ["Navigation software", "Malware that encrypts data and demands payment for decryption", "A type of firewall", "Backup software"], correctIndex: 1 },
    { id: "q10", question: "Which is the safest password practice?", options: ["Using the same password everywhere for convenience", "Using short passwords that are easy to remember", "Using a unique, complex password for each account", "Writing passwords on a sticky note near your workstation"], correctIndex: 2 },
    { id: "q11", question: "What does 'social engineering' mean in cybersecurity?", options: ["Building social media platforms", "Manipulating people into revealing sensitive information", "Installing social networking software", "Organizing crew social events"], correctIndex: 1 },
    { id: "q12", question: "What is the purpose of a firewall?", options: ["To extinguish fires in the engine room", "To monitor and control network traffic based on security rules", "To boost Wi-Fi signal strength", "To speed up internet connections"], correctIndex: 1 },
    { id: "q13", question: "What is an insider threat?", options: ["A threat from outside the vessel", "A threat posed by individuals within the organization", "A navigation hazard", "A type of engine malfunction"], correctIndex: 1 },
    { id: "q14", question: "What should you do with suspicious USB devices found onboard?", options: ["Plug them in to see what they contain", "Report them to the security officer and do not connect them", "Share them with crew members", "Dispose of them overboard"], correctIndex: 1 },
    { id: "q15", question: "What does encryption do?", options: ["Deletes sensitive data permanently", "Converts data into unreadable format without the correct key", "Speeds up data transmission", "Creates backup copies of files"], correctIndex: 1 },
  ];
}

// ─── getDepartmentTitle ───────────────────────────────────────────────────────
export function getDepartmentTitle(departmentId) {
  const titles = {
    deck: "Deck Department",
    engine: "Engine Department",
    safety: "Safety Department",
    navigation: "Navigation Department",
    electrical: "Electrical Department",
    catering: "Catering Department",
  };
  return titles[departmentId] || departmentId;
}

// ─── getCourseData ────────────────────────────────────────────────────────────
export function getCourseData(departmentId, courseId) {
  const dept = coursesByDepartment[departmentId];
  if (!dept) return null;
  return dept.find(c => c.id === courseId) || null;
}

export { coursesByDepartment };