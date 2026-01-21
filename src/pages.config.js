import Activity from './pages/Activity';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Settings from './pages/Settings';
import Tutor from './pages/Tutor';
import Courses from './pages/Courses';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activity": Activity,
    "Dashboard": Dashboard,
    "Modules": Modules,
    "Settings": Settings,
    "Tutor": Tutor,
    "Courses": Courses,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};