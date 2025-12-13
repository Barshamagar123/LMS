import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Wallet, Truck, AlertTriangle, 
  User, Mail, BookOpen, Clock, Users, Shield, 
  ChevronRight, Home, Package, Tag, Star, Loader, 
  Check, Info, Lock, CheckCircle, Smartphone
} from 'lucide-react';
import API from '../../api/axios';

// Payment Options with enhanced details
const PAYMENT_OPTIONS = [
  { 
    id: 'CARD', 
    name: 'Credit/Debit Card', 
    icon: CreditCard, 
    color: '#2563EB',
    description: 'Pay securely with your card',
    popular: true
  },
  { 
    id: 'ESEWA', 
    name: 'eSewa', 
    icon: Wallet, 
    color: '#059669',
    description: 'Digital wallet payment',
    popular: true
  },
  { 
    id: 'KHALTI', 
    name: 'Khalti', 
    icon: Smartphone, 
    color: '#7C3AED',
    description: 'Mobile wallet payment'
  },
  { 
    id: 'COD', 
    name: 'Pay Later', 
    icon: Truck, 
    color: '#DC2626',
    description: 'Enroll now, pay within 7 days'
  }
];

const CheckoutPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // States
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null); // Changed from default to null

  // Get user from localStorage
  const getUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return {
          id: parsed.userId || parsed.id,
          name: parsed.name || 'User',
          email: parsed.email || 'user@example.com',
          role: parsed.role || 'STUDENT',
          isActive: true
        };
      }
    } catch (err) {
      console.error('Error parsing user from storage:', err);
    }
    return null;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const userData = getUserFromStorage();
        
        if (!userData) {
          navigate('/login', { 
            state: { 
              from: `/checkout/${courseId}`,
              message: 'Please login to complete purchase'
            } 
          });
          return;
        }
        
        setUser(userData);

        const courseResponse = await API.get(`/courses/${courseId}`);
        const fetchedCourse = courseResponse.data?.course || courseResponse.data;
        
        if (!fetchedCourse) {
          throw new Error('Course not found');
        }
        
        const coursePrice = parseFloat(fetchedCourse.price || 0);
        if (coursePrice === 0) {
          navigate(`/courses/${courseId}`, { replace: true });
          return;
        }
        
        setCourse(fetchedCourse);
        
      } catch (err) {
        console.error('Fetch error:', err);
        
        if (err.response?.status === 401) {
          navigate('/login', { 
            state: { 
              from: `/checkout/${courseId}`,
              message: 'Session expired. Please login again.'
            } 
          });
        } else if (err.response?.status === 404) {
          setError('Course not found or no longer available.');
        } else {
          setError('Failed to load checkout information. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate totals
  const calculateTotals = () => {
    const price = parseFloat(course?.price || 0);
    const tax = price * 0.1;
    const total = price + tax;
    
    return {
      subtotal: formatCurrency(price),
      tax: formatCurrency(tax),
      total: formatCurrency(total),
      rawTotal: total
    };
  };

  // Handle payment method selection
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError('');
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }
    
    // Navigate to PaymentPage with the selected method
    navigate(`/checkout/${courseId}/payment?method=${selectedMethod.id}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Checkout Error</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Course
            </button>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <button 
            onClick={() => navigate('/')}
            className="hover:text-blue-500 transition-colors flex items-center gap-1"
          >
            <Home className="w-3 h-3" />
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <button 
            onClick={() => navigate('/courses')}
            className="hover:text-blue-500 transition-colors"
          >
            Courses
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="font-medium text-gray-700">Checkout</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Summary */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50">
                  {course?.thumbnail ? (
                    <img
                      src={course.thumbnail.startsWith('/') 
                        ? `${window.location.origin}${course.thumbnail}`
                        : course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{course?.title}</h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course?.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(course?.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{course?.enrollmentsCount || 0} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span>{course?.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
              <p className="text-sm text-gray-500 mb-6">Choose how you'd like to pay for this course</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {PAYMENT_OPTIONS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod?.id === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method)}
                      className={`p-5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{
                        borderColor: isSelected ? method.color : '',
                        backgroundColor: isSelected ? `${method.color}10` : ''
                      }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-blue-500' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-medium text-gray-700 block">{method.name}</span>
                        {method.popular && (
                          <span className="text-xs text-blue-600 font-medium mt-1">Popular</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Proceed to Payment Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={!selectedMethod}
                className={`w-full py-3.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  !selectedMethod
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                }`}
              >
                {selectedMethod ? (
                  <>
                    <span>Proceed to {selectedMethod.name} Checkout</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                ) : (
                  'Select a payment method to continue'
                )}
              </button>
            </div>

            {/* User Information */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{user?.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Summary
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Course Price</span>
                    <span className="font-medium">{formatCurrency(course?.price || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tax (10%)</span>
                    <span className="font-medium">{totals.tax}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Platform Fee</span>
                    <span className="text-sm text-green-600">Free</span>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="text-xl font-bold text-blue-500">{totals.total}</span>
                    </div>
                  </div>
                </div>

                {/* Selected Method Display */}
                {selectedMethod && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${selectedMethod.color}20` }}>
                        {React.createElement(selectedMethod.icon, { 
                          className: "w-5 h-5",
                          style: { color: selectedMethod.color }
                        })}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{selectedMethod.name}</p>
                        <p className="text-xs text-gray-500">{selectedMethod.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Badges */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>

                {/* Terms */}
                <p className="text-xs text-gray-500 pt-2">
                  By proceeding, you agree to our{' '}
                  <a href="/terms" className="text-blue-500 hover:underline">Terms</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>

            {/* Support Card */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Need help?</p>
                  <p className="text-xs text-gray-600">Contact our support team</p>
                  <a 
                    href="mailto:support@example.com" 
                    className="text-xs text-blue-500 hover:text-blue-600 mt-2 inline-block"
                  >
                    support@example.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Learning Platform. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="/terms" className="text-xs text-gray-500 hover:text-gray-700">Terms</a>
              <a href="/privacy" className="text-xs text-gray-500 hover:text-gray-700">Privacy</a>
              <a href="/security" className="text-xs text-gray-500 hover:text-gray-700">Security</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;