import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, Wallet, Smartphone, Truck,
  Lock, Shield, Loader, AlertTriangle, ExternalLink,
  CheckCircle, Clock, Info, User, Mail, BookOpen,
  RefreshCw, AlertCircle
} from 'lucide-react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

// Payment method configurations
const PAYMENT_CONFIGS = {
  CARD: {
    name: 'Credit/Debit Card',
    icon: CreditCard,
    color: '#2563EB',
    description: 'Pay securely with your card'
  },
  ESEWA: {
    name: 'eSewa',
    icon: Wallet,
    color: '#059669',
    description: 'Digital wallet payment'
  },
  KHALTI: {
    name: 'Khalti',
    icon: Smartphone,
    color: '#7C3AED',
    description: 'Mobile wallet payment'
  },
  COD: {
    name: 'Pay Later',
    icon: Truck,
    color: '#DC2626',
    description: 'Enroll now, pay within 7 days'
  }
};

const PaymentPage = () => {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // States
  const [paymentMethod, setPaymentMethod] = useState('');
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
  // Form states
  const [cardInfo, setCardInfo] = useState({
    cardholder: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Get payment method from URL
  useEffect(() => {
    const method = searchParams.get('method');
    setDebugInfo(prev => prev + `\nPayment method from URL: ${method}`);
    
    if (method && Object.keys(PAYMENT_CONFIGS).includes(method)) {
      setPaymentMethod(method);
      setDebugInfo(prev => prev + `\nValid payment method set: ${method}`);
    } else {
      setDebugInfo(prev => prev + `\nInvalid payment method, redirecting...`);
      navigate(`/checkout/${courseId}`);
    }
  }, [searchParams, courseId, navigate]);

  // Fetch course and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        setDebugInfo('Starting data fetch...');
        
        // Check localStorage
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        setDebugInfo(prev => prev + `\nToken exists: ${!!token}`);
        setDebugInfo(prev => prev + `\nUser exists in localStorage: ${!!storedUser}`);
        
        if (!storedUser || !token) {
          setDebugInfo(prev => prev + `\nNo user/token, redirecting to login...`);
          navigate('/login', { 
            state: { 
              from: `/checkout/${courseId}/payment?method=${paymentMethod}`,
              message: 'Please login to complete payment'
            } 
          });
          return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setDebugInfo(prev => prev + `\nUser set: ${parsedUser.name}`);
        
        // Try to fetch course with different endpoints
        setDebugInfo(prev => prev + `\nTrying to fetch course with ID: ${courseId}`);
        
        let fetchedCourse = null;
        
        // Try endpoint 1: /courses/{id}
        try {
          const response = await API.get(`/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDebugInfo(prev => prev + `\nAPI Response status: ${response.status}`);
          setDebugInfo(prev => prev + `\nAPI Response data keys: ${Object.keys(response.data || {})}`);
          
          fetchedCourse = response.data?.course || response.data;
        } catch (apiErr) {
          setDebugInfo(prev => prev + `\nFirst API attempt failed: ${apiErr.message}`);
          
          // Try endpoint 2: /api/courses/{id}
          try {
            const response = await API.get(`/api/courses/${courseId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchedCourse = response.data?.course || response.data;
            setDebugInfo(prev => prev + `\nSecond API attempt successful`);
          } catch (secondErr) {
            setDebugInfo(prev => prev + `\nSecond API attempt failed: ${secondErr.message}`);
          }
        }
        
        if (!fetchedCourse) {
          throw new Error('Course not found. Please check the course ID.');
        }
        
        setDebugInfo(prev => prev + `\nCourse found: ${fetchedCourse.title}`);
        setCourse(fetchedCourse);
        
        // Check if already enrolled (optional)
        try {
          const enrollmentCheck = await API.get(`/enrollments/check/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (enrollmentCheck.data?.isEnrolled) {
            setDebugInfo(prev => prev + `\nUser already enrolled, redirecting...`);
            toast.info('You are already enrolled in this course!');
            navigate(`/courses/${courseId}`);
            return;
          }
        } catch (enrollmentErr) {
          setDebugInfo(prev => prev + `\nEnrollment check skipped: ${enrollmentErr.message}`);
          // Continue without enrollment check
        }
        
      } catch (err) {
        console.error('Fetch error:', err);
        
        let errorMessage = 'Failed to load payment information. ';
        
        if (err.response) {
          errorMessage += `Server responded with ${err.response.status}: ${err.response.data?.message || 'Unknown error'}`;
          setDebugInfo(prev => prev + `\nError response: ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          errorMessage += 'No response from server. Check your network connection.';
          setDebugInfo(prev => prev + `\nNo response from server`);
        } else {
          errorMessage += err.message;
        }
        
        setError(errorMessage);
        toast.error('Failed to load payment details');
        
      } finally {
        setLoading(false);
        setDebugInfo(prev => prev + `\nFetch completed, loading: ${loading}`);
      }
    };
    
    if (paymentMethod && courseId) {
      fetchData();
    }
  }, [paymentMethod, courseId, navigate]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Calculate total
  const calculateTotal = () => {
    const price = parseFloat(course?.price || 0);
    const tax = price * 0.1;
    const total = price + tax;
    
    return {
      subtotal: price,
      tax: tax,
      total: total,
      formattedSubtotal: formatCurrency(price),
      formattedTax: formatCurrency(tax),
      formattedTotal: formatCurrency(total)
    };
  };

  // Retry loading data
  const retryLoadData = () => {
    setError('');
    setLoading(true);
    
    // Trigger a re-fetch by updating a state
    setTimeout(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await API.get(`/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const fetchedCourse = response.data?.course || response.data;
          if (fetchedCourse) {
            setCourse(fetchedCourse);
            setError('');
          }
        } catch (err) {
          setError('Still unable to load data. Please check your connection.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }, 500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading payment information...</p>
          <p className="text-xs text-gray-400 mt-2">Course ID: {courseId}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Setup Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">Debug Information:</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {debugInfo || 'No debug information available'}
              </pre>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={retryLoadData}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Course
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const methodConfig = PAYMENT_CONFIGS[paymentMethod];
  const Icon = methodConfig?.icon;
  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(`/checkout/${courseId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Payment Method
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && !loading && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Note</p>
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${methodConfig.color}20` }}
            >
              <Icon className="w-8 h-8" style={{ color: methodConfig.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{methodConfig.name}</h1>
              <p className="text-gray-500">{methodConfig.description}</p>
            </div>
          </div>

          {/* Course Summary */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-gray-50">
                {course?.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{course?.title}</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Student: {user?.name}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-500">
                    {totals.formattedTotal}
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Price</span>
                  <span className="font-medium">{totals.formattedSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">{totals.formattedTax}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-lg font-bold text-blue-500">{totals.formattedTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Payment Form (Demo Only) */}
          <div className="pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-6">
              <div className="text-center">
                <h3 className="font-semibold text-blue-900 mb-2">Demo Payment System</h3>
                <p className="text-sm text-blue-700">
                  This is a demonstration. In a real application, you would integrate with a payment gateway.
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  // For demo purposes, navigate to success
                  navigate(`/checkout/${courseId}/success`, {
                    state: {
                      paymentDetails: {
                        id: `TXN-${Date.now()}`,
                        transactionId: `TXN-${Date.now()}`,
                        amount: totals.total,
                        paymentMethod: paymentMethod,
                        status: 'SUCCESS',
                        date: new Date().toISOString(),
                        invoiceNumber: `INV-${Date.now().toString().slice(-8)}`
                      },
                      course: course,
                      user: user
                    }
                  });
                }}
                disabled={processing}
                className="w-full py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-3"
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Demo Payment for {totals.formattedTotal}
                    <Lock className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-4">
                Note: This is a demonstration only. No real payment will be processed.
              </p>
            </div>
          </div>
        </div>

        {/* Test Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">For Testing</h3>
          </div>
          <div className="space-y-3 text-sm">
            <p className="text-gray-600">
              <strong>Course ID:</strong> {courseId}
            </p>
            <p className="text-gray-600">
              <strong>Payment Method:</strong> {paymentMethod}
            </p>
            <p className="text-gray-600">
              <strong>Course Title:</strong> {course?.title || 'Not loaded'}
            </p>
            <p className="text-gray-600">
              <strong>Course Price:</strong> {course?.price ? formatCurrency(course.price) : 'Not available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;