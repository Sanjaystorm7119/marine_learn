import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/nav";
import Footer from "./components/footer";
import CoursesCatalog from "./components/Coursecatalog";

import Home from "./components/home";
import Certificates from "./components/certificate";
import Dashboard from "./components/dashboard";
import LearningPage   from "./components/Learningpage"; 
import CoursePage from "./components/courses";
import Login from "./components/login";
import Signup from "./components/signup";

import Settings from "./components/settings";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminUserDetails from "./components/AdminUserDetails";
import AdminLayout from "./components/AdminLayout";

import "./index.css";

// Wrapper to hide standard Navbar & Footer on auth pages AND admin pages
const PublicLayout = ({ children }) => {
  const location = useLocation();
  const hideLayout = ["/login", "/signup", "/dashboard"].includes(location.pathname) || location.pathname.startsWith('/admin');

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
        <Route path="/*" element={
          <PublicLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/coursepage" element={<CoursesCatalog />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/learn/:departmentId/:courseId" element={<LearningPage />} />
              <Route path="/course/:departmentId/:courseId" element={<CoursePage />} />
            </Routes>
          </PublicLayout>
        } />

        {/* Admin Routes with Dedicated Layout */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/users" element={<AdminUsers />} />
              <Route path="/users/:id" element={<AdminUserDetails />} />
            </Routes>
          </AdminLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;