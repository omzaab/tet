import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import DashboardPage from "@/react-app/pages/Dashboard";
import SetupProfilePage from "@/react-app/pages/SetupProfile";
import PropertiesPage from "@/react-app/pages/Properties";
import ReviewsPage from "@/react-app/pages/Reviews";
import AddReviewPage from "@/react-app/pages/AddReview";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/setup-profile" element={<SetupProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/add-review" element={<AddReviewPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
