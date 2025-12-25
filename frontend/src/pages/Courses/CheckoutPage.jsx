import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Wallet, Truck, AlertTriangle, 
  User, Mail, BookOpen, Clock, Users, Shield, 
  ChevronRight, Home, Package, Tag, Star, Loader, 
  Check, Info, Lock, CheckCircle, Smartphone, AlertCircle
} from 'lucide-react';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';

// Payment Options
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
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);

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
          role: parsed.role || 'STUDENT'
        };
      }
    } catch (err) {
      console.error('Error parsing user from storage:', err);
    }
    return null;
  };

  // Check if user is already enrolled or has paid
  const checkEnrollmentStatus = async (userId, courseId) => {
    try {
      console.log('🔍 Checking enrollment status...');
      
      // Check enrollment
      const enrollmentCheck = await API.get(`/enrollments/check/${courseId}`);
      console.log('📋 Enrollment check response:', enrollmentCheck.data);
      
      if (enrollmentCheck.data?.isEnrolled && enrollmentCheck.data?.data?.id) {
        setAlreadyEnrolled(true);
        setEnrollmentId(enrollmentCheck.data.data.id);
        console.log('✅ Already enrolled with ID:', enrollmentCheck.data.data.id);
        return true;
      }

      // Check payment (only for paid courses)
      const paymentCheck = await API.get(`/payments/check/${courseId}`);
      if (paymentCheck.data?.hasPaid) {
        setAlreadyPaid(true);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error checking enrollment status:', err);
      return false;
    }
  };

  // Get enrollment ID for already enrolled user
  const getEnrollmentIdForCourse = async () => {
    try {
      console.log('🔍 Fetching enrollment details for course:', courseId);
      
      // Method 1: Check enrollments/me endpoint
      const enrollmentsRes = await API.get('/enrollments/me');
      console.log('📋 My enrollments:', enrollmentsRes.data);
      
      if (enrollmentsRes.data?.success && Array.isArray(enrollmentsRes.data.data)) {
        const myEnrollments = enrollmentsRes.data.data;
        const enrollment = myEnrollments.find(e => 
          e.course?.id === parseInt(courseId) || 
          e.courseId === parseInt(courseId) ||
          (e.course && e.course.id === parseInt(courseId))
        );
        
        if (enrollment) {
          const foundId = enrollment.enrollmentId || enrollment.id;
          console.log('✅ Found enrollment ID in /enrollments/me:', foundId);
          setEnrollmentId(foundId);
          return foundId;
        }
      }
      
      // Method 2: Try to get specific enrollment
      try {
        const specificRes = await API.get(`/enrollments/course/${courseId}`);
        console.log('📋 Specific enrollment response:', specificRes.data);
        
        if (specificRes.data?.success && specificRes.data.data?.id) {
          setEnrollmentId(specificRes.data.data.id);
          console.log('✅ Found enrollment ID:', specificRes.data.data.id);
          return specificRes.data.data.id;
        }
      } catch (specificErr) {
        console.log('⚠️ Could not get specific enrollment:', specificErr.message);
      }
      
      console.log('❌ No enrollment ID found');
      return null;
      
    } catch (err) {
      console.error('Error getting enrollment ID:', err);
      return null;
    }
  };

  // Navigate to course with enrollment ID
  const navigateToCourse = async () => {
    try {
      // Try to get enrollment ID if not already set
      let id = enrollmentId;
      if (!id) {
        id = await getEnrollmentIdForCourse();
      }
      
      // Navigate with enrollment ID if available
      if (id) {
        console.log(`🚀 Navigating to: /courses/${courseId}/learn?enrollment=${id}`);
        navigate(`/courses/${courseId}/learn?enrollment=${id}`);
      } else {
        console.log(`⚠️ No enrollment ID, navigating to: /courses/${courseId}/learn`);
        navigate(`/courses/${courseId}/learn`);
      }
    } catch (err) {
      console.error('Error navigating to course:', err);
      navigate(`/courses/${courseId}/learn`);
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
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

        // Fetch course
        const courseResponse = await API.get(`/courses/${courseId}`);
        const fetchedCourse = courseResponse.data?.course || courseResponse.data;
        
        if (!fetchedCourse) {
          throw new Error('Course not found');
        }
        
        const coursePrice = parseFloat(fetchedCourse.price || 0);
        if (coursePrice === 0) {
          // If free, redirect to course page
          navigate(`/courses/${courseId}`, { replace: true });
          return;
        }
        
        setCourse(fetchedCourse);

        // Check if already enrolled/paid
        const isEnrolled = await checkEnrollmentStatus(userData.id, courseId);
        if (isEnrolled) {
          // Get enrollment ID if already enrolled
          await getEnrollmentIdForCourse();
          return;
        }
        
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

  // Process payment
  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    if (alreadyEnrolled || alreadyPaid) {
      setError('You are already enrolled in this course');
      setTimeout(() => {
        navigateToCourse();
      }, 2000);
      return;
    }

    try {
      setProcessing(true);
      setError('');
      setSuccess('');

      // Prepare payment data
      const paymentData = {
        courseId,
        paymentMethod: selectedMethod.id,
        paymentDetails: {
          selectedMethod: selectedMethod.name,
          timestamp: new Date().toISOString()
        }
      };

      // Call payment API
      const response = await API.post('/payments/process', paymentData);
      
      if (response.data.success) {
        setSuccess('Payment successful! Redirecting to course...');
        
        // Store payment info locally
        localStorage.setItem('lastPayment', JSON.stringify({
          courseId,
          paymentId: response.data.data?.payment?.id,
          date: new Date().toISOString()
        }));
        
        // Get enrollment ID from response
        const newEnrollmentId = response.data.data?.enrollment?.id || 
                               response.data.data?.enrollmentId ||
                               response.data.data?.id;
        
        // Redirect to learning page with enrollment ID
        setTimeout(() => {
          if (newEnrollmentId) {
            console.log(`🚀 Navigating with new enrollment ID: ${newEnrollmentId}`);
            navigate(`/courses/${courseId}/learn?enrollment=${newEnrollmentId}`);
          } else {
            navigateToCourse();
          }
        }, 2000);
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      
      const errorData = err.response?.data;
      
      if (err.response?.status === 409) {
        // Already enrolled or duplicate payment
        setError(errorData?.message || 'You have already purchased this course');
        
        // Update state
        if (errorData?.code === 'ALREADY_ENROLLED') {
          setAlreadyEnrolled(true);
          await getEnrollmentIdForCourse();
        } else if (errorData?.code === 'DUPLICATE_PAYMENT') {
          setAlreadyPaid(true);
        }
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigateToCourse();
        }, 3000);
        
      } else if (err.response?.status === 400) {
        setError(errorData?.message || 'Invalid payment request');
      } else if (err.response?.status === 404) {
        setError('Course not found or no longer available');
      } else {
        setError(errorData?.message || 'Payment failed. Please try again.');
      }
    } finally {
      setProcessing(false);
    }
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

  // Already enrolled/paid state
  if (alreadyEnrolled || alreadyPaid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {alreadyEnrolled ? 'Already Enrolled' : 'Already Purchased'}
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            {alreadyEnrolled 
              ? 'You are already enrolled in this course.' 
              : 'You have already purchased this course.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={navigateToCourse}
              className="w-full px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              {enrollmentId ? 'Go to Course' : 'Continue Learning'}
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="w-full px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Browse More Courses
            </button>
          </div>
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
          <div className="space-y-3">
            <button
              onClick={() => navigate('/courses')}
              className="w-full px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Browse Courses
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

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

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
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
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg mb-6 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Process Payment Button */}
              <button
                onClick={handleProcessPayment}
                disabled={!selectedMethod || processing}
                className={`w-full py-3.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  !selectedMethod || processing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                }`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing Payment...
                  </>
                ) : selectedMethod ? (
                  <>
                    <span>Pay {totals.total} with {selectedMethod.name}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                ) : (
                  'Select a payment method to continue'
                )}
              </button>
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

                {/* Security Badges */}
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>No duplicate charges</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className="w-3 h-3" />
                    <span>Instant enrollment after payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;