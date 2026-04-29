import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/nav";
import Footer from "./components/footer";
import CoursesCatalog from "./components/Coursecatalog";

import Home from "./components/home";
import Certificates from "./components/certificate";
import Dashboard from "./components/dashboard";
import LearningPage from "./components/Learningpage";
import CoursePage from "./components/courses";
import Login from "./components/login";
import Signup from "./components/signup";
import CalendarPage from "./components/calendar";
import Settings from "./components/settings";
import Help from "./components/help";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminUserDetails from "./components/AdminUserDetails";
import AdminLayout from "./components/AdminLayout";
import MyCourses from "./components/mycourse";
import StudyMaterials from "./components/StudyMaterials";
import SystemSettings from "./components/SystemSettings";
import PhishingDrillPage from "./components/Phishingdrillpage";
import Superuserlayout from "./components/Superuserlayout";


import "./index.css";

const PublicLayout = ({ children }) => {
  const location = useLocation();
  const hideLayout =
    [
      "/login",
      "/signup",
      "/dashboard",
      "/calendar",
      "/certificates",
      "/mycourses",
      "/study-materials",
      "/Phishingdrillpage",
    ].includes(location.pathname) ||
    location.pathname.startsWith("/Admin") ||
    location.pathname.startsWith("/superuser");

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public / Student Routes */}
        <Route
          path="/*"
          element={
            <PublicLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/help" element={<Help />} />
                <Route path="/coursepage" element={<CoursesCatalog />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/Phishingdrillpage" element={<PhishingDrillPage />} />
                <Route path="/learn/:departmentId/:courseId" element={<LearningPage />} />
                <Route path="/course/:departmentId/:courseId" element={<CoursePage />} />
                <Route path="/mycourses" element={<MyCourses />} />
                <Route path="/study-materials" element={<StudyMaterials />} />
                <Route path="/superuserlayout" element={<Superuserlayout />} />
              </Routes>
            </PublicLayout>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/Admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/users/:id" element={<AdminUserDetails />} />
                <Route path="/settings" element={<SystemSettings />} />
                <Route path="/phishing-drill" element={<PhishingDrillPage />} />
                <Route path="/superuserlayout" element={<Superuserlayout />} />


              </Routes>
            </AdminLayout>
          }
        />
        {/* Superuser Routes */}
        <Route
          path="/superuser/phishing-drill"
          element={
            <Superuserlayout>
              <PhishingDrillPage />
            </Superuserlayout>
          }
        /> 

      </Routes>
    </BrowserRouter>
  );
}

export default App;

