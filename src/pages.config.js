/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIQuizGenerator from './pages/AIQuizGenerator';
import Activity from './pages/Activity';
import CertificateTemplates from './pages/CertificateTemplates';
import Certificates from './pages/Certificates';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Gamification from './pages/Gamification';
import InstructorDashboard from './pages/InstructorDashboard';
import Maintenance from './pages/Maintenance';
import Modules from './pages/Modules';
import MyCourses from './pages/MyCourses';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import SpareParts from './pages/SpareParts';
import Tutor from './pages/Tutor';
import WebViewerDemo from './pages/WebViewerDemo';
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
    "InstructorDashboard": InstructorDashboard,
    "Maintenance": Maintenance,
    "Modules": Modules,
    "MyCourses": MyCourses,
    "Notifications": Notifications,
    "Settings": Settings,
    "SpareParts": SpareParts,
    "Tutor": Tutor,
    "WebViewerDemo": WebViewerDemo,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};