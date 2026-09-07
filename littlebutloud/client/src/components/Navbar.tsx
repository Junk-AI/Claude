import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import MemberLoginModal from "./MemberLoginModal";
import { useMemberAuth } from "@/contexts/MemberAuthContext";
import { BrandMark } from "./BrandMark";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/connect", label: "Connect" },
  { href: "/collaborate", label: "Collaborate" },
  { href: "/convene", label: "Convene" },
  { href: "/create", label: "Create" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [memberLoginOpen, setMemberLoginOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { isMemberLoggedIn, logout: logoutMember } = useMemberAuth();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const handleLogout = () => {
    logoutMember();
    if (isAuthenticated) {
      logout();
    }
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container px-0">
        <nav className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-foreground flex-shrink-0 hover:opacity-80 transition-opacity duration-200">
            <BrandMark className="h-10 w-10 rounded-md sm:h-12 sm:w-12" />
            <span className="hidden sm:block text-sm sm:text-base font-medium tracking-tight">Network of Deeds by Kids</span>
            <span className="sm:hidden text-xs font-medium tracking-tight">NODBK</span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Members Portal link - shown when member is logged in */}
            {isMemberLoggedIn && (
              <li>
                <Link
                  href="/members-portal"
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/members-portal")
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  Members Portal
                </Link>
              </li>
            )}
            {/* Admin CMS link - shown when admin is logged in */}
            {isAuthenticated && user?.role === "admin" && (
              <li>
                <Link
                  href="/admin"
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/admin")
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  Admin CMS
                </Link>
              </li>
            )}
          </ul>

          {/* Auth + mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Show Member Sign In only if not logged in as member or admin */}
            {!isMemberLoggedIn && !isAuthenticated && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMemberLoginOpen(true)}
                className="hidden sm:flex text-xs font-medium border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Member Sign In
              </Button>
            )}
            
            {/* Unified logout button with icon - shown for both member and admin */}
            {(isMemberLoggedIn || isAuthenticated) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="hidden sm:flex text-xs text-muted-foreground hover:text-foreground hover:bg-secondary gap-1.5 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-navigation" className="md:hidden bg-white border-t border-border shadow-lg animate-fade-in">
          <div className="container px-4 sm:px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isMemberLoggedIn && (
              <Link
                href="/members-portal"
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive("/members-portal")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                }`}
              >
                Members Portal
              </Link>
            )}
            <div className="border-t border-border mt-3 pt-3 flex flex-col gap-2">
              {/* Show Member Sign In only if not logged in */}
              {!isMemberLoggedIn && !isAuthenticated && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMemberLoginOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-xs font-medium border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Member Sign In
                </Button>
              )}
              
              {/* Admin CMS link - shown when admin is logged in */}
              {isAuthenticated && user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-md border border-primary px-3 py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  Admin CMS
                </Link>
              )}
              
              {/* Unified logout button - shown for both member and admin */}
              {(isMemberLoggedIn || isAuthenticated) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-xs font-medium border-primary text-primary hover:bg-primary hover:text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Member Login Modal */}
      <MemberLoginModal isOpen={memberLoginOpen} onClose={() => setMemberLoginOpen(false)} />
    </header>
  );
}
