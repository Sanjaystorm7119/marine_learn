import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, ArrowRight, Users, BookOpen, Award, Compass, Cog, Shield, Navigation, Zap, UtensilsCrossed, ChevronLeft, ChevronRight, TrendingUp, Star, Clock } from "lucide-react";
import heroImage from "../assets/hero-ship.jpg";
import courseDeck from "../assets/course-deck.jpg";
import courseEngine from "../assets/course-engine.jpg";
import courseSafety from "../assets/course-safety.jpg";
import courseNavigation from "../assets/course-navigation.jpg";
import courseElectrical from "../assets/course-electrical.jpg";
import courseCatering from "../assets/course-catering.jpg";
import deptDeck from "../assets/dept-deck.jpg";
import deptEngine from "../assets/dept-engine.jpg";
import deptSafety from "../assets/dept-safety.jpg";
import deptNavigation from "../assets/dept-navigation.jpg";
import deptElectrical from "../assets/dept-electrical.jpg";
import deptCatering from "../assets/dept-catering.jpg";
import "../pages/home.css";

const topCourses = [
  { id: "ecdis-cybersecurity", deptId: "deck", title: "ECDIS Cybersecurity Fundamentals", dept: "Deck Department", duration: "1h 20min", lessons: 4, rating: 4.8, students: 2340, image: courseDeck, tag: "Bestseller" },
  { id: "engine-scada-security", deptId: "engine", title: "Engine Control SCADA Security", dept: "Engine Department", duration: "1h 30min", lessons: 4, rating: 4.7, students: 1890, image: courseEngine, tag: "Hot" },
  { id: "stcw-basic-safety", deptId: "safety", title: "STCW Cyber Safety Training", dept: "Safety & Survival", duration: "2h 00min", lessons: 6, rating: 4.9, students: 3120, image: courseSafety, tag: "Bestseller" },
  { id: "radar-arpa-fundamentals", deptId: "navigation", title: "Radar & ARPA Cyber Threats", dept: "Navigation", duration: "1h 40min", lessons: 4, rating: 4.6, students: 1560, image: courseNavigation, tag: "New" },
  { id: "marine-electrical-safety", deptId: "electrical", title: "Marine Electrical Cyber Safety", dept: "Electrical Department", duration: "1h 30min", lessons: 4, rating: 4.5, students: 1240, image: courseElectrical, tag: "Trending" },
  { id: "catering-data-privacy", deptId: "catering", title: "Crew Data Privacy & Protection", dept: "Catering & Hotel", duration: "45min", lessons: 2, rating: 4.4, students: 980, image: courseCatering, tag: "Popular" },
  { id: "bridge-network-security", deptId: "deck", title: "Bridge Network Security", dept: "Deck Department", duration: "1h 10min", lessons: 3, rating: 4.7, students: 1670, image: courseDeck, tag: "Bestseller" },
  { id: "ot-network-defense", deptId: "engine", title: "OT Network Defense for Engineers", dept: "Engine Department", duration: "1h 15min", lessons: 3, rating: 4.6, students: 1120, image: courseEngine, tag: "Advanced" },
];

const tagStyles = {
  Bestseller: "tag-bestseller",
  Hot: "tag-hot",
  New: "tag-new", 
  Trending: "tag-trending",
  Popular: "tag-popular",
  Advanced: "tag-advanced",
};

const stats = [
  { icon: Users, value: "5,000+", label: "Seafarers Trained" },
  { icon: BookOpen, value: "120+", label: "Courses Available" },
  { icon: Award, value: "98%", label: "Certification Rate" },
];

const departments = [
  {
    icon: Compass,
    title: "Deck Department",
    description: "Navigation, cargo handling, and seamanship skills for deck officers and ratings.",
    courses: 24,
    image: deptDeck,
  },
  {
    icon: Cog,
    title: "Engine Department",
    description: "Marine engineering, machinery maintenance, and propulsion systems training.",
    courses: 18,
    image: deptEngine,
  },
  {
    icon: Shield,
    title: "Safety & Survival",
    description: "SOLAS compliance, firefighting, and emergency response procedures.",
    courses: 22,
    image: deptSafety,
  },
  {
    icon: Navigation,
    title: "Navigation",
    description: "ECDIS, radar, ARPA, and celestial navigation certification courses.",
    courses: 16,
    image: deptNavigation,
  },
  {
    icon: Zap,
    title: "Electrical & Electronics",
    description: "Marine electrical systems, automation, and troubleshooting.",
    courses: 14,
    image: deptElectrical,
  },
  {
    icon: UtensilsCrossed,
    title: "Catering & Hotel",
    description: "Hospitality management, food safety, and galley operations onboard.",
    courses: 12,
    image: deptCatering,
  },
];

const HeroSection = () => {
  return (
    <section id="home" className="hero-section">

      {/* Background */}
      <div className="hero-bg">
        <img src={heroImage} alt="Ship sailing on the ocean" className="hero-bg-img" />
        <div className="hero-overlay" />
      </div>

      <div className="hero-container">
        <div className="hero-content">

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="hero-heading"
          >
            Navigate Your{" "}
            <span className="hero-heading-highlight">Maritime</span>{" "}
            Career Forward
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hero-subtext"
          >
            Comprehensive training programs designed for seafarers.
            Learn at your own pace with video lessons, quizzes, and
            certifications — all from onboard or ashore.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="hero-buttons"
          >
            <button className="btn-primary-hero">
              Start Learning
              <ArrowRight className="btn-icon" />
            </button>
            <button className="btn-outline-hero">
              <Play className="btn-icon" />
              Watch Demo
            </button>
          </motion.div>

        </div>
      </div>

      {/* Wave SVG */}
      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="wave-svg">
          <path
            d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H0V60Z"
            fill="hsl(210, 30%, 98%)"
          />
        </svg>
      </div>

    </section>
  );
};
// Certifications CTA Section
const CertificationsCTASection = () => {
  const certifications = [
    {
      title: "STCW",
      subtitle: "Safety & Compliance",
      image: deptSafety,
    },
    {
      title: "ECDIS",
      subtitle: "Navigation & Technology",
      image: deptNavigation,
    },
    {
      title: "Engine Room",
      subtitle: "Marine Engineering",
      image: deptEngine,
    },
  ];

  return (
    <section className="cta-section">
      <div className="cta-container">
        {/* Left Text */}
        <div className="cta-text">
          <h2 className="cta-heading">
            Get certified and get ahead in your career
          </h2>
          <p className="cta-subtext">
            Prep for certifications with comprehensive courses, practice tests,
            and special offers on exam vouchers.
          </p>
          <Link to="/coursepage" className="cta-link">
            Explore certifications and vouchers <ArrowRight className="cta-link-icon" />
          </Link>
        </div>

        {/* Right Cards */}
        <div className="cta-cards">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.title}
              className="cta-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="cta-card-img-wrapper">
                <img src={cert.image} alt={cert.title} className="cta-card-img" />
                <div className="cta-card-img-overlay" />
              </div>
              <div className="cta-card-body">
                <p className="cta-card-title">{cert.title}</p>
                <p className="cta-card-subtitle">{cert.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TopCoursesSection = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="topcourses-section">
      <div className="topcourses-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="topcourses-header"
        >
          <div>
            <div className="topcourses-label-row">
              <TrendingUp className="topcourses-label-icon" />
              <span className="topcourses-label">Top Rated</span>
            </div>
            <h2 className="topcourses-heading">
              Courses Learners <span className="topcourses-heading-highlight">Love</span>
            </h2>
          </div>
          <Link to="/coursepage" className="topcourses-view-all">
            View all courses →
          </Link>
        </motion.div>

        <div className="topcourses-carousel-wrapper">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className={`topcourses-arrow topcourses-arrow-left${canScrollLeft ? "" : " topcourses-arrow-hidden"}`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="topcourses-arrow-icon" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className={`topcourses-arrow topcourses-arrow-right${canScrollRight ? "" : " topcourses-arrow-hidden"}`}
            aria-label="Scroll right"
          >
            <ChevronRight className="topcourses-arrow-icon" />
          </button>

          {/* Gradient Fades */}
          <div className={`topcourses-fade-left${canScrollLeft ? "" : " topcourses-fade-hidden"}`} />
          <div className={`topcourses-fade-right${canScrollRight ? "" : " topcourses-fade-hidden"}`} />

          {/* Carousel */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="topcourses-scroll-row"
          >
            {topCourses.map((course, i) => (
              <motion.div
                key={course.id + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="topcourses-card-wrapper"
              >
                <a href={`/course/${course.deptId}/${course.id}`} className="topcourses-card-link">
                  <div className="topcourses-card">
                    {/* Image */}
                    <div className="topcourses-card-img-wrapper">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="topcourses-card-img"
                      />
                      <div className="topcourses-card-img-overlay" />
                      <span className={`topcourses-tag ${tagStyles[course.tag] || "tag-default"}`}>
                        {course.tag}
                      </span>
                    </div>

                    <div className="topcourses-card-body">
                      <p className="topcourses-card-dept">{course.dept}</p>
                      <h3 className="topcourses-card-title">{course.title}</h3>

                      {/* Rating */}
                      <div className="topcourses-rating-row">
                        <span className="topcourses-rating-value">{course.rating}</span>
                        <div className="topcourses-stars">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star
                              key={si}
                              className={`topcourses-star ${si < Math.floor(course.rating) ? "star-filled" : "star-empty"}`}
                            />
                          ))}
                        </div>
                        <span className="topcourses-students">({course.students.toLocaleString()})</span>
                      </div>

                      {/* Meta */}
                      <div className="topcourses-meta">
                        <span className="topcourses-meta-item">
                          <Clock className="topcourses-meta-icon" />
                          {course.duration}
                        </span>
                        <span className="topcourses-meta-item">
                          <BookOpen className="topcourses-meta-icon" />
                          {course.lessons} Lessons
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// TO: (then the existing HomePage below stays as-is, just update its return)

const DepartmentsSection = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 340;
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  return (
    <div id="departments" className="dept-section">
      <div className="dept-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="dept-header"
        >
          <span className="dept-label">Explore Departments</span>
          <h2 className="dept-heading">
            Choose Your <span className="dept-heading-highlight">Specialization</span>
          </h2>
          <p className="dept-subtext">
            Six comprehensive departments covering every aspect of maritime operations and training.
          </p>
        </motion.div>

        {/* Carousel wrapper */}
        <div className="dept-carousel-wrapper">
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className={`dept-arrow dept-arrow-left${canScrollLeft ? "" : " dept-arrow-hidden"}`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="dept-arrow-icon" />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className={`dept-arrow dept-arrow-right${canScrollRight ? "" : " dept-arrow-hidden"}`}
            aria-label="Scroll right"
          >
            <ChevronRight className="dept-arrow-icon" />
          </button>

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="dept-scroll-row"
          >
            {departments.map((dept, i) => (
              <motion.div
                key={dept.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="dept-card"
              >
                {/* Image */}
                <div className="dept-card-img-wrapper">
                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="dept-card-img"
                  />
                  <div className="dept-card-img-overlay" />
                  <div className="dept-card-img-footer">
                    <div className="dept-card-icon-wrap">
                      <dept.icon className="dept-card-icon" />
                    </div>
                    <span className="dept-card-img-title">{dept.title}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="dept-card-body">
                  <p className="dept-card-desc">{dept.description}</p>
                  <div className="dept-card-footer">
                    <span className="dept-card-courses">{dept.courses} Courses</span>
                    <span className="dept-card-explore">Explore →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <TopCoursesSection />
      <DepartmentsSection />
      <CertificationsCTASection />
    </>
  );
};

export default HomePage;

