import { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl text-gray-900 font-semibold">
              LearnHub
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/courses" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Courses
            </a>
            <a href="#categories" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Categories
            </a>
            <a href="#teach" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Teach on LearnHub
            </a>
            <a href="#about" className="text-gray-700 hover:text-indigo-600 transition-colors">
              About
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="/login" 
              className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Login
            </a>
            <a 
              href="/register" 
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign Up
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <a href="#courses" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Courses
              </a>
              <a href="#categories" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Categories
              </a>
              <a href="#teach" className="text-gray-700 hover:text-indigo-600 transition-colors">
                Teach on LearnHub
              </a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 transition-colors">
                About
              </a>

              <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                <a 
                  href="/login" 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  Login
                </a>
                <a 
                  href="/register" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
                >
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}