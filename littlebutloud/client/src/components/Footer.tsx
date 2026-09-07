import { Link } from "wouter";
import { Heart } from "lucide-react";
import { getLoginUrl } from "@/const";
import { BrandMark } from "./BrandMark";

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-foreground text-white mt-16">
      <div className="container py-8 sm:py-12 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <BrandMark className="h-11 w-11 rounded-md" />
              <span className="font-sans font-medium tracking-tight text-base sm:text-lg">Network of Deeds by Kids</span>
            </div>
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
              A Network of Deeds by Kids — connecting young changemakers, creating change through collaboration.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-xs sm:text-sm uppercase tracking-wider text-white/50 mb-3">Pages</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/connect", label: "Connect" },
                { href: "/collaborate", label: "Collaborate" },
                { href: "/convene", label: "Convene" },
                { href: "/create", label: "Create" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white text-xs sm:text-sm transition-colors" onClick={scrollToTop}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-xs sm:text-sm uppercase tracking-wider text-white/50 mb-3">Legal</h4>
            <ul className="space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/manage-data", label: "Manage Data" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-white text-xs sm:text-sm transition-colors" onClick={scrollToTop}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-xs sm:text-sm uppercase tracking-wider text-white/50 mb-3">Contact</h4>
            <p className="text-white/70 text-xs sm:text-sm">
              Little But Loud
            </p>
            <a
              href="mailto:littlebutloud.kids@gmail.com"
              className="text-primary hover:text-white text-xs sm:text-sm transition-colors break-all"
            >
              littlebutloud.kids@gmail.com
            </a>
          </div>

          {/* Admin */}
          <div>
            <h4 className="font-display font-semibold text-xs sm:text-sm uppercase tracking-wider text-white/50 mb-3">Admin</h4>
            <ul className="space-y-2">
              <li>
                <a href={getLoginUrl()} className="text-white/70 hover:text-white text-xs sm:text-sm transition-colors">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Deeds By Kids — Little But Loud. All rights reserved.
          </p>
          <p className="text-white/40 text-xs flex items-center gap-1 justify-center sm:justify-start">
            Made with <Heart className="w-3 h-3 text-pink-400 fill-pink-400" /> by young changemakers
          </p>
        </div>
      </div>
    </footer>
  );
}
