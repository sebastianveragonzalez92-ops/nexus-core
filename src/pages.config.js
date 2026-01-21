import Activity from './pages/Activity';
import Courses from './pages/Courses';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Settings from './pages/Settings';
import Tutor from './pages/Tutor';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "Courses": Courses,
    "Dashboard": Dashboard,
    "Modules": Modules,
    "Settings": Settings,
    "Tutor": Tutor,
    "CourseDetail": CourseDetail,
    "MyCourses": MyCourses,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};