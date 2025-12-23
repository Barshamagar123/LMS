import { useState, useEffect } from "react";
import { GraduationCap, Menu, X, Search, User, ChevronDown } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect for subtle background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Courses", path: "/courses" },
    { label: "Categories", path: "/category" },
    { label: "Instructors", path: "/instructors" },
    { label: "Resources", path: "/resources" },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${
      isScrolled 
        ? "bg-blue-600/95 backdrop-blur-sm shadow-lg" 
        : "bg-blue-600"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-lg font-semibold text-white">
                LearnHub
              </span>
              <div className="text-xs text-blue-100 font-normal">Learning Platform</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors relative ${
                  isActive(item.path)
                    ? "text-white font-semibold"
                    : "text-blue-100 hover:text-white"
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute -bottom-6 left-0 w-full h-0.5 bg-white"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                />
              </div>
            </form>
          </div>

          {/* Auth Buttons & User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-white hover:text-blue-50 transition-colors px-3 py-2"
            >
              Sign in
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-4 py-2.5 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Get Started
            </button>
            
            {/* User Menu Placeholder */}
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-700 transition-colors">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-white/80" />
            </button>
          </div>

          {/* Mobile Menu Button with Search Icon */}
          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={handleSearch}
              className="p-2 rounded-lg hover:bg-blue-700"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-blue-700"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-700 bg-blue-600">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-blue-700">
              <button 
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-3 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-left"
              >
                Sign in
              </button>
              <button 
                onClick={() => {
                  navigate('/register');
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Get Started Free
              </button>
            </div>

            {/* Quick Links */}
            <div className="pt-6 mt-4 border-t border-blue-700">
              <div className="grid grid-cols-2 gap-2">
                {['Business', 'For Teams', 'Help Center', 'Blog'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm text-blue-100 hover:text-white p-2 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}