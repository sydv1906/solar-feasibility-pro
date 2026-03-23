import { Menu, Sun, X } from "lucide-react";
import { useState } from "react";

type Page = "home" | "prediction" | "dashboard";

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links: { id: Page; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "prediction", label: "Prediction" },
    { id: "dashboard", label: "Dashboard" },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1F3B]/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 text-white font-bold text-xl"
          >
            <div className="w-8 h-8 rounded-full bg-[#F4A62A] flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <span>
              Solar<span className="text-[#F4A62A]">Wise</span>
            </span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === link.id
                    ? "text-[#F4A62A] bg-[#F4A62A]/10"
                    : "text-[#C7D1DC] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex">
            <button
              type="button"
              onClick={() => onNavigate("prediction")}
              className="px-4 py-2 bg-[#F4A62A] hover:bg-[#F7B84A] text-white text-sm font-semibold rounded-lg transition-all"
            >
              Analyze My Site
            </button>
          </div>
          <button
            type="button"
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                  currentPage === link.id
                    ? "text-[#F4A62A] bg-[#F4A62A]/10"
                    : "text-[#C7D1DC] hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
