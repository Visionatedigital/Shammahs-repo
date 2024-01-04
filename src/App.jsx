import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage/LandingPage";
<<<<<<< HEAD
import DashBoard from "./Students/studentDashBoard";
import ParentDashBoard from "./Parent/parentDashBoard";
import TutorSignUp from "./Tutor/Tutorsignup";
import Logo from "./components/Logo/Logo";
=======
import Buttons from "./components/Buttons/Buttons";
>>>>>>> 53ad06aa8345eece06648e16fc39ed1879ed0cd7

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />}/>
          <Route path="/dashboard" element={<DashBoard/>}/>
          <Route path="/parent-dashboard" element={<ParentDashBoard/>}/>
          <Route path="/tutor-signup" element={<TutorSignUp/>}/>
          <Route path="/logo" element={<Logo/>}/>
        </Routes>
      </Router>

      
    </>
  );
}

export default App;
