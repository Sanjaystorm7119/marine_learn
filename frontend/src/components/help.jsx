import { useState } from "react";
import { Search, BookOpen, MessageCircle, Mail, LifeBuoy, FileText, ShieldCheck, Anchor, HelpCircle } from "lucide-react";
import "../pages/help.css";

const helpCategories = [
  { icon: BookOpen, title: "Getting Started", desc: "Learn how to navigate and start your first course." },
  { icon: FileText, title: "Certificates", desc: "How to earn, download, and verify certificates." },
  { icon: ShieldCheck, title: "Account & Security", desc: "Password resets, 2FA, and account management." },
  { icon: Anchor, title: "Courses & Content", desc: "Course access, video issues, and quiz help." },
];

const faqs = [
  { q: "How do I enroll in a course?", a: "Navigate to the Courses page, select a department, and click on any course card. You'll be taken to the course learning page where you can start watching lessons immediately." },
  { q: "How do I earn a certificate?", a: "Complete all lessons in a course and pass the final quiz with a score of 70% or higher. Once passed, your certificate will be unlocked and available for download from the Certificates page." },
  { q: "Can I retake a quiz if I fail?", a: "Yes! You can retake any quiz as many times as needed. Each attempt generates a randomized set of questions from the question pool to ensure a fair assessment." },
  { q: "Are the courses IMO/STCW compliant?", a: "Yes, all our courses are designed in accordance with IMO guidelines and STCW conventions. Each course covers the required competencies for maritime cybersecurity certification." },
  { q: "How do I track my learning progress?", a: "Your progress is tracked automatically as you complete lessons. Visit your Dashboard to see an overview of all enrolled courses, completed lessons, and earned certificates." },
  { q: "Can I access courses on mobile?", a: "Absolutely! MarineLearn is fully responsive and works on all devices including smartphones and tablets. Your progress syncs across all devices." },
  { q: "What video quality is available?", a: "All course videos are available in HD quality. If you experience buffering, try lowering the quality or checking your internet connection." },
  { q: "How do I reset my password?", a: "Go to Settings > Security, enter your current password, then set a new one. If you've forgotten your password, use the 'Forgot Password' link on the login page." },
];

const AccordionItem = ({ faq }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`hp-accordion-item ${open ? "hp-accordion-open" : ""}`}>
      <button
        className="hp-accordion-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{faq.q}</span>
        <span className={`hp-accordion-chevron ${open ? "hp-rotated" : ""}`}>&#8250;</span>
      </button>
      <div className="hp-accordion-content">
        <p className="hp-accordion-body">{faq.a}</p>
      </div>
    </div>
  );
};

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="hp-page">
      {/* Hero Section */}
      <section className="hp-hero hp-nav-gradient">
        <div className="hp-deco-circle hp-deco-circle-1" />
        <div className="hp-deco-circle hp-deco-circle-2" />
        <div className="hp-hero-content hp-fade-in-up">
          <LifeBuoy className="hp-hero-icon hp-animate-wave-float" />
          <h1 className="hp-hero-title">How can we help you?</h1>
          <p className="hp-hero-subtitle">Search our knowledge base or browse categories below.</p>
          <div className="hp-search-wrapper">
            <Search className="hp-search-icon" />
            <input
              type="text"
              placeholder="Search for help topics..."
              className="hp-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="hp-container">
        {/* Categories */}
        <div className="hp-categories-grid hp-fade-in-up hp-delay-1">
          {helpCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div key={i} className="hp-category-card">
                <div className="hp-category-icon-wrap hp-nav-gradient">
                  <Icon className="hp-category-icon" />
                </div>
                <h3 className="hp-category-title">{cat.title}</h3>
                <p className="hp-category-desc">{cat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="hp-faq-section hp-fade-in-up hp-delay-2">
          <h2 className="hp-faq-heading">
            <HelpCircle className="hp-faq-heading-icon" />
            Frequently Asked Questions
          </h2>
          <div className="hp-faq-card">
            <div className="hp-accordion">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, i) => (
                  <AccordionItem key={i} faq={faq} index={i} />
                ))
              ) : (
                <p className="hp-no-results">No results found. Try a different search term.</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="hp-support-section hp-fade-in-up hp-delay-3">
          <div className="hp-support-card hp-nav-gradient">
            <MessageCircle className="hp-support-icon" />
            <h3 className="hp-support-title">Still need help?</h3>
            <p className="hp-support-desc">
              Our maritime support team is available 24/7 to assist you with any questions.
            </p>
            <div className="hp-support-actions">
              <button className="hp-btn hp-btn-outline">
                <Mail className="hp-btn-icon" />
                Email Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;