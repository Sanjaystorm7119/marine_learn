import {
  Anchor,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";
import "../pages/footer.css";

const Footer = () => {
  return (
    <footer className="footer-bg" id="contact">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <Anchor className="footer-logo-icon" />
              <span className="footer-logo-text">MarineLearn</span>
            </div>
            <p className="footer-tagline">
              Empowering maritime professionals with world-class training and
              certification programs for a safer ocean.
            </p>
            <div className="footer-socials">
              {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="social-btn">
                  <Icon className="social-icon" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              {["Home", "Courses", "Departments", "About Us", "Contact"].map(
                (link) => (
                  <li key={link}>
                    <a href="#" className="footer-link">
                      {link}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Departments */}
          <div className="footer-col">
            <h4 className="footer-col-title">Departments</h4>
            <ul className="footer-links">
              {[
                "Deck Department",
                "Engine Department",
                "Safety & Survival",
                "Navigation",
                "Electrical",
                "Catering & Hotel",
              ].map((dept) => (
                <li key={dept}>
                  <a href="#" className="footer-link">
                    {dept}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <MapPin className="contact-icon" />
                Port Maritime Academy, Dock 7, Chennai, India
              </li>
              <li className="footer-contact-item">
                <Phone className="contact-icon" />
                +91 98765 43210
              </li>
              <li className="footer-contact-item">
                <Mail className="contact-icon" />
                info@marinelearn.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © 2026 MarineLearn. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">
              Privacy Policy
            </a>
            <a href="#" className="footer-legal-link">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
