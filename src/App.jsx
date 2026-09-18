/**
 * EXISTING APPLICATION ROOT: starts session restoration and defines the current routes.
 * Dashboard migration touchpoints: imports pages/Dashboard and initializes legacy leads via a repository.
 * Passes leads/onCreateLead/onLogout into DashboardPage; successful creation updates this lead list.
 * Other routes and existing authentication behavior are retained during the incremental refactor.
 */
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import { mockLeadRepository } from "./features/lead/repositories/mockLeadRepository";
import LeadDetailPage from "./pages/LeadDetailPage";
import ConsentLandingPage from "./pages/ConsentLandingPage";
import ApplicationOnboardingPage from "./pages/application/ApplicationOnboardingPage";
import ApplicationDetailPage from "./pages/application/ApplicationDetailPage";

import "./styles/theme.css";
import "./index.css";



function AuthLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#334155",
        background: "#f8fafc",
      }}
    >
      Checking session...
    </div>
  );
}

function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState(() => mockLeadRepository.getSnapshot());

  const checkAuthSession = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (session.tokens?.accessToken) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkAuthSession();
  }, []);

  const handleLoginSuccess = async () => {
    setAuthChecking(true);
    await checkAuthSession();
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const handleCreateLead = (newLead) => {
    setLeads((previousLeads) => [newLead, ...previousLeads]);
    return newLead.id;
  };

  const handleConvertLead = (lead) => {
    setLeads((previousLeads) =>
      previousLeads.map((item) =>
        item.id === lead.id
          ? {
              ...item,
              status: "Converted",
            }
          : item
      )
    );
  };

  if (authChecking) {
    return <AuthLoader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute user={user}>
              <DashboardPage
                leads={leads}
                onCreateLead={handleCreateLead}
                onLogout={handleLogout}
              />
            </PrivateRoute>
          }
        />

        {/* Lead Detail */}
        <Route
          path="/leads/:leadId"
          element={
            <PrivateRoute user={user}>
              <LeadDetailPage
                leads={leads}
                onLogout={handleLogout}
                onConvertLead={handleConvertLead}
              />
            </PrivateRoute>
          }
        />

        {/* Application Onboarding */}
        <Route
          path="/applications/:leadId/onboarding"
          element={
            <PrivateRoute user={user}>
              <ApplicationOnboardingPage leads={leads} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        <Route
          path="/consent"
          element={<ConsentLandingPage />}
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/applications/:applicationNumber"
          element={<ApplicationDetailPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
