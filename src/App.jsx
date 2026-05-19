import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import ApplicationOnboardingPage from "./pages/application/ApplicationOnboardingPage";

import "./styles/theme.css";
import "./index.css";

const initialLeads = [
  {
    id: "LD-10021",
    firstName: "Rahul",
    lastName: "Sharma",
    mobile: "9876543210",
    product: "Home Loan",
    source: "Website",
    status: "New",
    owner: "Amit Singh",
    createdDate: "04 May 2026",
  },
  {
    id: "LD-10022",
    firstName: "Priya",
    lastName: "Mehta",
    mobile: "9876501234",
    product: "Loan Against Property",
    source: "Mobile App",
    status: "In Progress",
    owner: "Neha Jain",
    createdDate: "04 May 2026",
  },
  {
    id: "LD-10023",
    firstName: "Amit",
    lastName: "Verma",
    mobile: "9988776655",
    product: "Working Capital",
    source: "Branch Walk-in",
    status: "Converted",
    owner: "Rohan Mehta",
    createdDate: "03 May 2026",
  },
  {
    id: "LD-10024",
    firstName: "Sneha",
    lastName: "Iyer",
    mobile: "9123456780",
    product: "Home Loan",
    source: "Digital Aggregator",
    status: "Disqualified",
    owner: "Contact Center",
    createdDate: "03 May 2026",
  },
  {
    id: "LD-10025",
    firstName: "Vikram",
    lastName: "Rao",
    mobile: "9090909090",
    product: "Business Loan",
    source: "Outbound Call",
    status: "New",
    owner: "Contact Center",
    createdDate: "02 May 2026",
  },
];

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
  const [leads, setLeads] = useState(initialLeads);

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
      console.error("Error checking auth session:", error);
      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
  let isMounted = true;

  const loadSession = async () => {
    try {
      const session = await fetchAuthSession();
      const user = await getCurrentUser();

      if (isMounted && session?.tokens) {
        setUser(user);
      }
    } catch (err) {
      console.log("No active session",err);
      if (isMounted) {
        setUser(null);
      }
    } finally {
      if (isMounted) {
        //setLoading(false);
      }
    }
  };

  loadSession();

  return () => {
    isMounted = false;
  };
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;