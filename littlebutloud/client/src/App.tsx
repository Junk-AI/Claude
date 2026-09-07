import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { MemberAuthProvider } from "./contexts/MemberAuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Connect from "./pages/Connect";
import Collaborate from "./pages/Collaborate";
import Convene from "./pages/Convene";
import EventRegistration from "./pages/EventRegistration";
import Create from "./pages/Create";
import Admin from "./pages/Admin";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ManageData from "./pages/ManageData";
import MembersPortal from "./pages/MembersPortal";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 page-enter">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/connect" component={() => <Layout><Connect /></Layout>} />
      <Route path="/collaborate" component={() => <Layout><Collaborate /></Layout>} />
      <Route path="/convene/register/:id" component={() => <Layout><EventRegistration /></Layout>} />
      <Route path="/convene" component={() => <Layout><Convene /></Layout>} />
      <Route path="/create" component={() => <Layout><Create /></Layout>} />
      <Route path="/admin" component={() => <Layout><Admin /></Layout>} />
      <Route path="/privacy" component={() => <Layout><Privacy /></Layout>} />
      <Route path="/terms" component={() => <Layout><Terms /></Layout>} />
      <Route path="/manage-data" component={() => <Layout><ManageData /></Layout>} />
      <Route path="/members-portal" component={() => <Layout><MembersPortal /></Layout>} />
      <Route path="/404" component={() => <Layout><NotFound /></Layout>} />
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MemberAuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </MemberAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
