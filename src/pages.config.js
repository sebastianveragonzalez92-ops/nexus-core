import AIQuizGenerator from './pages/AIQuizGenerator';
import Activity from './pages/Activity';
import CertificateTemplates from './pages/CertificateTemplates';
import Certificates from './pages/Certificates';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Gamification from './pages/Gamification';
import Modules from './pages/Modules';
import MyCourses from './pages/MyCourses';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Tutor from './pages/Tutor';
import InstructorDashboard from './pages/InstructorDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIQuizGenerator": AIQuizGenerator,
    "Activity": Activity,
    "CertificateTemplates": CertificateTemplates,
    "Certificates": Certificates,
    "CourseDetail": CourseDetail,
    "Courses": Courses,
    "Dashboard": Dashboard,
    "Gamification": Gamification,
    "Modules": Modules,
    "MyCourses": MyCourses,
    "Notifications": Notifications,
    "Settings": Settings,
    "Tutor": Tutor,
    "InstructorDashboard": InstructorDashboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};