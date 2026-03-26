import { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../pages/Coursecatalog.css";

// ─── SVG Icons (replacing lucide-react) ─────────────────────────────────────

const ShieldIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────

const departments = [
  {
    id: "deck",
    name: "Deck Department",
    icon: "🚢",
    courses: [
      { id: "ecdis-cybersecurity", title: "ECDIS Cybersecurity Fundamentals", duration: "1h 20min", lessons: 2, level: "Beginner", description: "Protect Electronic Chart Display systems from GPS spoofing and AIS vulnerabilities." },
      { id: "bridge-network-security", title: "Bridge Network Security", duration: "1h 10min", lessons: 3, level: "Intermediate", description: "Secure bridge communication networks against unauthorized access and data interception." },
      { id: "ais-spoofing-defense", title: "AIS Spoofing & Defense Strategies", duration: "55min", lessons: 2, level: "Intermediate", description: "Identify and counter Automatic Identification System spoofing attacks." },
      { id: "maritime-phishing-awareness", title: "Maritime Phishing Awareness", duration: "45min", lessons: 2, level: "Beginner", description: "Recognize phishing emails and social engineering tactics targeting deck officers." },
      { id: "gnss-vulnerability-assessment", title: "GNSS Vulnerability Assessment", duration: "1h 15min", lessons: 3, level: "Advanced", description: "Conduct vulnerability assessments on Global Navigation Satellite Systems onboard." },
      { id: "deck-usb-threat-prevention", title: "USB Threat Prevention for Deck", duration: "40min", lessons: 2, level: "Beginner", description: "Prevent malware infections through USB devices connected to bridge equipment." },
      { id: "deck-remote-access-security", title: "Remote Access Security Protocols", duration: "1h 05min", lessons: 3, level: "Advanced", description: "Secure remote desktop and VPN access used for vessel management from shore." },
    ],
  },
  {
    id: "engine",
    name: "Engine Department",
    icon: "⚙️",
    courses: [
      { id: "engine-scada-security", title: "Engine Control SCADA Security", duration: "1h 30min", lessons: 2, level: "Intermediate", description: "Master SCADA system security in marine engine rooms including PLC protection." },
      { id: "ot-network-defense", title: "OT Network Defense for Engineers", duration: "1h 15min", lessons: 3, level: "Advanced", description: "Defend operational technology networks from cyber intrusions in engine spaces." },
      { id: "plc-malware-protection", title: "PLC Malware Protection", duration: "1h 00min", lessons: 2, level: "Intermediate", description: "Protect Programmable Logic Controllers from targeted malware and firmware attacks." },
      { id: "engine-ransomware-response", title: "Engine Room Ransomware Response", duration: "50min", lessons: 2, level: "Beginner", description: "Learn response protocols for ransomware attacks affecting engine control systems." },
      { id: "industrial-iot-security", title: "Industrial IoT Security at Sea", duration: "1h 10min", lessons: 3, level: "Advanced", description: "Secure Internet of Things sensors and connected devices in the engine department." },
      { id: "engine-firmware-integrity", title: "Firmware Integrity Monitoring", duration: "1h 05min", lessons: 2, level: "Intermediate", description: "Monitor and validate firmware integrity on engine room control systems." },
      { id: "engine-patch-management", title: "OT Patch Management at Sea", duration: "55min", lessons: 2, level: "Beginner", description: "Implement safe patching strategies for operational technology in engine spaces." },
    ],
  },
  {
    id: "safety",
    name: "Safety Department",
    icon: "🛡️",
    courses: [
      { id: "stcw-basic-safety", title: "STCW Cyber Safety Training", duration: "2h 00min", lessons: 2, level: "Beginner", description: "STCW-compliant training covering cyber threats to safety-critical systems." },
      { id: "emergency-system-cyber-resilience", title: "Emergency System Cyber Resilience", duration: "1h 20min", lessons: 3, level: "Intermediate", description: "Ensure cyber resilience of fire detection, alarms, and emergency shutdown systems." },
      { id: "safety-data-integrity", title: "Safety Data Integrity & Tampering", duration: "1h 00min", lessons: 2, level: "Intermediate", description: "Detect and prevent tampering with safety logs, drills records, and compliance data." },
      { id: "cyber-incident-drills", title: "Cyber Incident Response Drills", duration: "1h 30min", lessons: 3, level: "Beginner", description: "Plan and execute cyber incident response drills as part of safety management." },
      { id: "ism-cyber-compliance", title: "ISM Code Cyber Compliance", duration: "55min", lessons: 2, level: "Advanced", description: "Integrate cybersecurity requirements into the ISM Code safety management system." },
      { id: "safety-reporting-protocols", title: "Cyber Incident Reporting Protocols", duration: "45min", lessons: 2, level: "Beginner", description: "Master the procedures for reporting cyber incidents to flag states and authorities." },
      { id: "safety-risk-assessment", title: "Cyber Risk Assessment for Safety", duration: "1h 15min", lessons: 3, level: "Advanced", description: "Conduct comprehensive cyber risk assessments aligned with maritime safety frameworks." },
    ],
  },
  {
    id: "navigation",
    name: "Navigation Department",
    icon: "📡",
    courses: [
      { id: "radar-arpa-fundamentals", title: "Radar & ARPA Cyber Threats", duration: "1h 40min", lessons: 2, level: "Intermediate", description: "Understand cyber threats to radar and ARPA systems used in navigation." },
      { id: "vdr-data-protection", title: "VDR Data Protection & Security", duration: "1h 00min", lessons: 2, level: "Beginner", description: "Protect Voyage Data Recorder data from unauthorized access and manipulation." },
      { id: "gmdss-cyber-awareness", title: "GMDSS Cyber Awareness", duration: "1h 15min", lessons: 3, level: "Intermediate", description: "Identify cyber risks to the Global Maritime Distress and Safety System." },
      { id: "nav-system-spoofing", title: "Navigation System Spoofing Attacks", duration: "1h 10min", lessons: 2, level: "Advanced", description: "Detect and mitigate spoofing attacks on integrated navigation systems." },
      { id: "electronic-chart-tampering", title: "Electronic Chart Tampering Defense", duration: "55min", lessons: 2, level: "Intermediate", description: "Prevent unauthorized modifications to electronic navigational charts." },
      { id: "nav-autopilot-security", title: "Autopilot System Cyber Defense", duration: "1h 20min", lessons: 3, level: "Advanced", description: "Protect autopilot and track control systems from unauthorized cyber manipulation." },
      { id: "nav-satcom-threats", title: "SATCOM Vulnerability Awareness", duration: "50min", lessons: 2, level: "Beginner", description: "Identify vulnerabilities in satellite communication systems used for navigation." },
    ],
  },
  {
    id: "electrical",
    name: "Electrical Department",
    icon: "⚡",
    courses: [
      { id: "marine-electrical-safety", title: "Marine Electrical Cyber Safety", duration: "1h 30min", lessons: 2, level: "Beginner", description: "Protect electrical control and monitoring systems from cyber attacks." },
      { id: "power-management-security", title: "Power Management System Security", duration: "1h 20min", lessons: 3, level: "Intermediate", description: "Secure power management and distribution systems against cyber threats." },
      { id: "ups-battery-cyber-risks", title: "UPS & Battery System Cyber Risks", duration: "50min", lessons: 2, level: "Beginner", description: "Understand cyber risks to uninterruptible power supplies and battery backups." },
      { id: "electrical-scada-hardening", title: "Electrical SCADA Hardening", duration: "1h 15min", lessons: 3, level: "Advanced", description: "Harden SCADA systems managing shipboard electrical generation and distribution." },
      { id: "switchboard-cyber-protection", title: "Switchboard Cyber Protection", duration: "1h 00min", lessons: 2, level: "Intermediate", description: "Protect digital switchboard controls from unauthorized cyber access." },
      { id: "electrical-network-segmentation", title: "Network Segmentation for Electrical", duration: "1h 10min", lessons: 3, level: "Advanced", description: "Implement network segmentation to isolate electrical control systems from IT networks." },
      { id: "electrical-smart-sensor-security", title: "Smart Sensor Security", duration: "45min", lessons: 2, level: "Beginner", description: "Secure smart sensors and IoT devices used in electrical monitoring systems." },
    ],
  },
  {
    id: "catering",
    name: "Catering Department",
    icon: "🍽️",
    courses: [
      { id: "catering-data-privacy", title: "Crew Data Privacy & Protection", duration: "45min", lessons: 2, level: "Beginner", description: "Protect crew personal data and payment information from cyber threats." },
      { id: "pos-system-security", title: "POS System Security Onboard", duration: "55min", lessons: 2, level: "Beginner", description: "Secure Point of Sale systems used in onboard shops and bars." },
      { id: "social-engineering-defense", title: "Social Engineering Defense", duration: "1h 00min", lessons: 3, level: "Intermediate", description: "Recognize social engineering attacks targeting non-technical crew members." },
      { id: "wifi-network-safety", title: "Wi-Fi & Network Safety for Crew", duration: "40min", lessons: 2, level: "Beginner", description: "Safe usage of Wi-Fi networks and personal devices while onboard." },
      { id: "supply-chain-cyber-risks", title: "Supply Chain Cyber Risks", duration: "1h 10min", lessons: 2, level: "Intermediate", description: "Identify cyber risks in the maritime catering supply chain and provisioning systems." },
      { id: "catering-password-hygiene", title: "Password Hygiene & MFA Basics", duration: "35min", lessons: 2, level: "Beginner", description: "Best practices for password management and multi-factor authentication for crew." },
      { id: "catering-device-safety", title: "Personal Device Safety Onboard", duration: "50min", lessons: 2, level: "Intermediate", description: "Safely use personal laptops, phones, and tablets while connected to ship networks." },
    ],
  },
];

const levelColors = {
  Beginner:     "cc-level-beginner",
  Intermediate: "cc-level-intermediate",
  Advanced:     "cc-level-advanced",
};

// ─── DepartmentCarousel ───────────────────────────────────────────────────────

const DepartmentCarousel = ({ dept, deptIndex }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <motion.section
      key={dept.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: deptIndex * 0.1 }}
    >
      <div className="cc-dept-header">
        <div className="cc-dept-title-group">
          <span className="cc-dept-icon">{dept.icon}</span>
          <h2 className="cc-dept-name">{dept.name}</h2>
          <span className="cc-badge">{dept.courses.length} Courses</span>
        </div>
        <div className="cc-scroll-controls">
          <button
            onClick={() => scroll("left")}
            className="cc-scroll-btn"
            aria-label="Scroll left"
          >
            <span className="cc-icon-md"><ChevronLeftIcon /></span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="cc-scroll-btn"
            aria-label="Scroll right"
          >
            <span className="cc-icon-md"><ChevronRightIcon /></span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="cc-carousel"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dept.courses.map((course, courseIndex) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: courseIndex * 0.05 }}
            className="cc-card-wrapper"
          >
            <Link to={`/learn/${dept.id}/${course.id}`} className="cc-card-link">
              <div className="cc-card">
                <div className="cc-card-content">
                  <span className={`cc-level-badge ${levelColors[course.level]}`}>
                    {course.level}
                  </span>
                  <h3 className="cc-card-title">{course.title}</h3>
                  <p className="cc-card-desc">{course.description}</p>
                  <div className="cc-card-footer">
                    <span className="cc-card-meta">
                      <span className="cc-icon-xs"><ClockIcon /></span>
                      {course.duration}
                    </span>
                    <span className="cc-card-meta">
                      <span className="cc-icon-xs"><BookOpenIcon /></span>
                      {course.lessons} Lessons
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

// ─── CoursesCatalog ───────────────────────────────────────────────────────────

const CoursesCatalog = () => {
  return (
    <div className="cc-page">
      <section className="cc-hero cc-nav-gradient">
        <div className="cc-hero-inner">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="cc-hero-content"
          >
            <div className="cc-hero-title-row">
              <span className="cc-hero-shield"><ShieldIcon /></span>
              <h1 className="cc-hero-title">Cyber Awareness Courses</h1>
            </div>
            <p className="cc-hero-subtitle">
              Department-wise maritime cybersecurity training to protect your vessel from modern cyber threats.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="cc-main">
        {departments.map((dept, deptIndex) => (
          <DepartmentCarousel key={dept.id} dept={dept} deptIndex={deptIndex} />
        ))}
      </main>
    </div>
  );
};

export default CoursesCatalog;