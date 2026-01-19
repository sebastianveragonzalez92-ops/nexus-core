import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Modules": Modules,
    "Activity": Activity,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};