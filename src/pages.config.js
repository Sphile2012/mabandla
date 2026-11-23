/**
 * pages.config.js - Page routing configuration
 *
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 */
import About from './pages/About';
import AdminUpload from './pages/AdminUpload';
import Categories from './pages/Categories';
import Certificates from './pages/Certificates';
import ChangePassword from './pages/ChangePassword';
import CompleteProfile from './pages/CompleteProfile';
import DailyChallenge from './pages/DailyChallenge';
import DownloadApp from './pages/DownloadApp';
import Favorites from './pages/Favorites';
import Feedback from './pages/Feedback';
import Flashcards from './pages/Flashcards';
import ForgotPassword from './pages/ForgotPassword';
import FormulaSheets from './pages/FormulaSheets';
import Forum from './pages/Forum';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Messages from './pages/Messages';
import OTPVerify from './pages/OTPVerify';
import ParentPortal from './pages/ParentPortal';
import PaymentSuccess from './pages/PaymentSuccess';
import Practice from './pages/Practice';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import StudyGroups from './pages/StudyGroups';
import VideoPlayer from './pages/VideoPlayer';
import UserGuide from './pages/UserGuide';
import WorkedExamples from './pages/WorkedExamples';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "AdminUpload": AdminUpload,
    "Categories": Categories,
    "Certificates": Certificates,
    "ChangePassword": ChangePassword,
    "CompleteProfile": CompleteProfile,
    "DailyChallenge": DailyChallenge,
    "DownloadApp": DownloadApp,
    "Favorites": Favorites,
    "Feedback": Feedback,
    "Flashcards": Flashcards,
    "ForgotPassword": ForgotPassword,
    "FormulaSheets": FormulaSheets,
    "Forum": Forum,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Login": Login,
    "Messages": Messages,
    "OTPVerify": OTPVerify,
    "ParentPortal": ParentPortal,
    "PaymentSuccess": PaymentSuccess,
    "Practice": Practice,
    "Pricing": Pricing,
    "Profile": Profile,
    "PublicProfile": PublicProfile,
    "Register": Register,
    "ResetPassword": ResetPassword,
    "StudentDashboard": StudentDashboard,
    "StudyGroups": StudyGroups,
    "VideoPlayer": VideoPlayer,
    "UserGuide": UserGuide,
    "WorkedExamples": WorkedExamples,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};