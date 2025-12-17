import React from 'react'
import Navbar from '../../components/Navbar'
import { Play, Star, Users, Award, Clock, CheckCircle, GraduationCap, ArrowRight, BookOpen, Globe, Shield, TrendingUp } from "lucide-react";
import CoursesPage from '../Courses/Courses';

export default function HomePage() {
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Expert-Led",
      description: "Learn from industry professionals"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Self-Paced",
      description: "Learn at your own speed"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Hands-On",
      description: "Practice with real projects"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global",
      description: "Join learners worldwide"
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Software Developer",
      text: "The courses here helped me transition into tech. The practical approach made all the difference.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      name: "Maria Garcia",
      role: "UX Designer",
      text: "As a working professional, the flexible schedule was perfect. The community support was invaluable.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop"
    },
    {
      name: "David Kim",
      role: "Data Analyst",
      text: "The quality of instruction exceeded my expectations. The skills I learned were immediately applicable.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Clean & Human */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  500,000+ learners worldwide
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Learn skills that
                <span className="text-blue-600 block">move your career forward</span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Practical courses taught by industry experts. Learn at your own pace with 
                hands-on projects and real-world applications.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/courses"
                  className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Start Free Trial
                </a>
              </div>
              
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card needed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>7-day free trial</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&crop=faces"
                  alt="Students collaborating"
                  className="rounded-xl shadow-lg w-full h-auto"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Success Rate</p>
                      <p className="text-lg font-bold text-gray-900">94%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  

   

      {/* Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       
          <CoursesPage />
        </div>
      </section>

      {/* CTA Section - Clean */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Start learning today
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of learners building skills for the future. 
              No risk, cancel anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try free for 7 days
              </a>
              <a
                href="/courses"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse all courses
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Free trial includes access to all courses
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold">LearnHub</span>
              </div>
              <p className="text-gray-400 text-sm">
                Practical education for career growth
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Platform</h3>
              <ul className="space-y-2">
                {['Courses', 'Instructors', 'Pricing', 'Enterprise'].map((item) => (
                  <li key={item}>
                    <a 
                      href={`/${item.toLowerCase()}`} 
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Resources</h3>
              <ul className="space-y-2">
                {['Blog', 'Help Center', 'Community', 'Careers'].map((item) => (
                  <li key={item}>
                    <a 
                      href={`/${item.toLowerCase().replace(' ', '-')}`} 
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Legal</h3>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map((item) => (
                  <li key={item}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} LearnHub. All rights reserved.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'YouTube', 'Instagram'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}