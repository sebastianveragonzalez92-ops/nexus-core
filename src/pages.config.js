import Activity from './pages/Activity';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import Modules from './pages/Modules';
import MyCourses from './pages/MyCourses';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Tutor from './pages/Tutor';
import AIQuizGenerator from './pages/AIQuizGenerator';
import Certificates from './pages/Certificates';
import CertificateTemplates from './pages/CertificateTemplates';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "CourseDetail": CourseDetail,
    "Courses": Courses,
    "Dashboard": Dashboard,
    "InstructorDashboard": InstructorDashboard,
    "Modules": Modules,
    "MyCourses": MyCourses,
    "Notifications": Notifications,
    "Settings": Settings,
    "Tutor": Tutor,
    "AIQuizGenerator": AIQuizGenerator,
    "Certificates": Certificates,
    "CertificateTemplates": CertificateTemplates,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};