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
// import MyCourses from "./components/mycourse";
import StudyMaterials from "./components/StudyMaterials";
import AdminRole from "./components/AdminRole"; 
import AdminCourse from "./components/AdminCourse";
import { CourseForm as AdminCourseForm } from "./components/AdminCourse";
import AdminUserCourse from "./components/AdminUserCourse";  // 👈 ADD THIS
import "./index.css";

// Wrapper to hide standard Navbar & Footer on auth pages AND admin pages
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
      "/settings",
      "/help",
    ].includes(location.pathname) || location.pathname.startsWith("/admin");

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
                <Route path="/help" element={<Dashboard><Help /></Dashboard>} />
                <Route path="/coursepage" element={<CoursesCatalog />} />
                <Route path="/settings" element={<Dashboard><Settings /></Dashboard>} />
                <Route
                  path="/learn/:departmentId/:courseId"
                  element={<LearningPage />}
                />
                <Route
                  path="/course/:departmentId/:courseId"
                  element={<CoursePage />}
                />
                {/* <Route path="/mycourses" element={<MyCourses />} /> */}
                <Route path="/study-materials" element={<StudyMaterials />} />
              </Routes>
            </PublicLayout>
          }
        />

        {/* Admin Routes with Dedicated Layout */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/users/:id" element={<AdminUserDetails />} />
                <Route path="/roles" element={<AdminRole />} /> 
                <Route path="/courses" element={<AdminCourse />} /> 
                <Route path="courses/new" element={<AdminCourseForm />} />
                <Route path="courses/edit/:courseId" element={<AdminCourseForm />} />
                <Route path="/user-courses" element={<AdminUserCourse />} />
                
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
