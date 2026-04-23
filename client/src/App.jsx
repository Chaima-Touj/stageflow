import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Navbar         from "./components/Navbar";
import Sidebar        from "./components/Sidebar";
import Footer         from "./components/Footer";
import ScrollToTop    from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot        from "./components/ChatBot";

import Home        from "./pages/Home";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Dashboard   from "./pages/Dashboard";
import Offers      from "./pages/Offers";
import About       from "./pages/About";
import Contact     from "./pages/Contact";
import OfferDetails from "./pages/OfferDetails";
import Profile     from "./pages/Profile";
import NotFound    from "./pages/NotFound";
import AddOffer    from "./pages/AddOffer";
import Apply       from "./pages/Apply";

export default function App() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <ScrollToTop />
      {user ? <Sidebar /> : <Navbar />}
      <div className={user ? "sb-page" : ""}>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/offers"     element={<Offers />} />
          <Route path="/offers/:id" element={<OfferDetails />} />
          <Route path="/about"      element={<About />} />
          <Route path="/contact"    element={<Contact />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/add-offer"  element={<AddOffer />} />
          <Route path="/apply/:id"  element={<ProtectedRoute><Apply /></ProtectedRoute>} />
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*"           element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
      <ChatBot />
    </>
  );
}