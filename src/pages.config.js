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
import About from './pages/About';
import AdminUpload from './pages/AdminUpload';
import Categories from './pages/Categories';
import CompleteProfile from './pages/CompleteProfile';
import DownloadApp from './pages/DownloadApp';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Login from './pages/Login';
import Messages from './pages/Messages';
import OTPVerify from './pages/OTPVerify';
import PaymentSuccess from './pages/PaymentSuccess';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import VideoPlayer from './pages/VideoPlayer';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminUpload": AdminUpload,
    "Categories": Categories,
    "CompleteProfile": CompleteProfile,
    "DownloadApp": DownloadApp,
    "Favorites": Favorites,
    "Home": Home,
    "Login": Login,
    "Messages": Messages,
    "OTPVerify": OTPVerify,
    "PaymentSuccess": PaymentSuccess,
    "Pricing": Pricing,
    "Profile": Profile,
    "Register": Register,
    "StudentDashboard": StudentDashboard,
    "VideoPlayer": VideoPlayer,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};