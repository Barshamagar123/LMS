import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Lock, DollarSign, ArrowLeft, CreditCard, Wallet, Truck, AlertTriangle 
} from 'lucide-react';
import API from '../../api/axios';

// --- Local Payment Constants for UI ---
const PAYMENT_OPTIONS = {
  CARD: 'Credit/Debit Card',
  ESEWA: 'eSewa',
  KHALTI: 'Khalti',
  COD: 'Cash on Delivery (COD)' 
};

// --- Mock Toast Notification (Replace with a library like react-hot-toast in production) ---
const toast = {
    success: (message) => console.log(`[SUCCESS TOAST]: ${message}`),
    error: (message) => console.error(`[ERROR TOAST]: ${message}`),
    info: (message) => console.log(`[INFO TOAST]: ${message}`),
};

const CheckoutPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_OPTIONS.CARD);
  const [validationErrors, setValidationErrors] = useState({});

  const [paymentInfo, setPaymentInfo] = useState({ cardholder: '', cardNumber: '', expiry: '', cvc: '', phone: '' });

  // --- Data Fetching ---
  useEffect(() => {
    // ... (Data Fetching logic remains the same)
    const fetchCourseDetails = async () => {
      try {
        const response = await API.get(`/courses/${courseId}`);
        const fetchedCourse = response.data.course;
        
        if (!fetchedCourse || fetchedCourse.price === 0) {
          navigate(`/courses/${courseId}`, { replace: true });
          return;
        }
        setCourse(fetchedCourse);
      } catch (err) {
        toast.error('Failed to load course details.');
        setError('Failed to load course details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId, navigate]);

  // --- Input Validation ---
  const validateForm = () => {
    const errors = {};
    if (selectedMethod === PAYMENT_OPTIONS.CARD) {
        if (!paymentInfo.cardholder) errors.cardholder = "Cardholder name is required.";
        if (paymentInfo.cardNumber.length < 16) errors.cardNumber = "Card number must be 16 digits.";
        if (!paymentInfo.expiry || !paymentInfo.cvc) errors.expiry = "Expiry and CVC are required.";
    } else if (selectedMethod === PAYMENT_OPTIONS.ESEWA || selectedMethod === PAYMENT_OPTIONS.KHALTI) {
        if (!paymentInfo.phone || paymentInfo.phone.length < 9) errors.phone = "Valid mobile number is required.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };


  // --- Payment Logic ---
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!course || !validateForm()) {
        toast.error("Please fill out all required fields correctly.");
        return;
    }

    setIsProcessing(true);
    setError('');

    // --- Prepare Common Payload ---
    let transactionNotes = `Method: ${selectedMethod}`;
    let isRedirectionFlow = selectedMethod === PAYMENT_OPTIONS.ESEWA || selectedMethod === PAYMENT_OPTIONS.KHALTI;
    
    // --- SPECIAL CASE 1: Cash on Delivery (COD) ---
    if (selectedMethod === PAYMENT_OPTIONS.COD) {
        transactionNotes = 'Enrollment confirmed upon checkout (Digital COD).';
    }

    // --- Prepare API Call Payload ---
    const payload = {
        courseId: Number(courseId),
        amount: course.price, 
        paymentMethod: selectedMethod,
        paymentDetails: { ...paymentInfo, notes: transactionNotes }, // Send structured data
    };
    
    // --- SPECIAL CASE 2: E-Wallet Redirection Simulation ---
    if (isRedirectionFlow) {
        // In a real app: You'd call a backend endpoint to generate a payment URL.
        toast.info(`Simulating redirection to ${selectedMethod} for payment...`);
        // We simulate the backend call happening after the user returns from the gateway.
        // For simplicity here, we'll mock the success after a delay.
        
        setTimeout(async () => {
            try {
                const response = await API.post('/payments/purchase', payload);

                if (response.data.status === 'SUCCESS') {
                    toast.success('Payment successful! You are now enrolled.');
                    navigate(`/courses/${courseId}`); 
                } else {
                    setError(response.data.message || 'Payment processing failed after redirection.');
                    toast.error('Payment failed. Please check your E-wallet and try again.');
                }
            } catch (err) {
                // ... (Error handling remains the same)
                 const status = err.response?.status;
                 const message = err.response?.data?.message || 'Transaction error. Please try again.';
                 if (status === 409 && message.includes("already enrolled")) {
                    toast.info('You are already enrolled! Redirecting...');
                    setTimeout(() => navigate(`/courses/${courseId}`), 1000); 
                 } else {
                    setError(message);
                    toast.error(message);
                 }
            } finally {
                setIsProcessing(false);
            }
        }, 3000); // 3 seconds to simulate external gateway processing
        
        return; // Exit the function to wait for the timeout/redirection
    }

    // --- STANDARD SUBMISSION (Card & COD) ---
    try {
        const response = await API.post('/payments/purchase', payload);

        if (response.data.status === 'SUCCESS') {
            toast.success(selectedMethod === PAYMENT_OPTIONS.COD 
                ? 'Enrollment confirmed via COD!' 
                : 'Payment successful! You are now enrolled.'
            );
            navigate(`/courses/${courseId}`); 
        } else {
            setError(response.data.message || 'Payment processing failed.');
            toast.error('Payment failed: ' + response.data.message);
        }
    } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.message || 'Transaction error. Please try again.';

        if (status === 409 && message.includes("already enrolled")) {
            toast.info('You are already enrolled! Redirecting...');
            setTimeout(() => navigate(`/courses/${courseId}`), 2000); 
        } else {
            setError(message);
            toast.error(message);
        }
    } finally {
        // Only set processing to false here for standard submission
        if (!isRedirectionFlow) {
             setIsProcessing(false);
        }
    }
  };
  
  // --- Dynamic Form Rendering ---
  const renderPaymentForm = () => {
    const commonInputClasses = "w-full border rounded-lg p-3 transition duration-150 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const errorInputClasses = "border-red-500 focus:ring-red-500";
    
    const renderError = (key) => validationErrors[key] ? (
        <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1"/>{validationErrors[key]}
        </p>
    ) : null;

    switch (selectedMethod) {
        case PAYMENT_OPTIONS.CARD:
            return (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Card Details</h3>
                    
                    {/* Cardholder Name */}
                    <div>
                        <input type="text" placeholder="Cardholder Name" required 
                               className={`${commonInputClasses} ${validationErrors.cardholder ? errorInputClasses : 'border-gray-300'}`}
                               onChange={(e) => setPaymentInfo({...paymentInfo, cardholder: e.target.value})} />
                        {renderError('cardholder')}
                    </div>
                    
                    {/* Card Number */}
                    <div>
                        <input type="text" placeholder="Card Number" required minLength="16" maxLength="16"
                               className={`${commonInputClasses} ${validationErrors.cardNumber ? errorInputClasses : 'border-gray-300'}`}
                               onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value.replace(/\D/g, '')})} />
                        {renderError('cardNumber')}
                    </div>
                    
                    <div className="flex space-x-4">
                        {/* Expiry Date */}
                        <div className="w-1/2">
                            <input type="text" placeholder="MM/YY" required maxLength="5"
                                   className={`${commonInputClasses} ${validationErrors.expiry ? errorInputClasses : 'border-gray-300'}`}
                                   onChange={(e) => setPaymentInfo({...paymentInfo, expiry: e.target.value})} />
                            {renderError('expiry')}
                        </div>
                        
                        {/* CVC */}
                        <div className="w-1/2">
                            <input type="text" placeholder="CVC" required maxLength="4"
                                   className={`${commonInputClasses} ${validationErrors.cvc ? errorInputClasses : 'border-gray-300'}`}
                                   onChange={(e) => setPaymentInfo({...paymentInfo, cvc: e.target.value.replace(/\D/g, '')})} />
                            {renderError('cvc')}
                        </div>
                    </div>
                </div>
            );
        case PAYMENT_OPTIONS.ESEWA:
        case PAYMENT_OPTIONS.KHALTI:
            return (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">{selectedMethod} Payment</h3>
                    
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-sm text-gray-800 rounded-lg shadow-inner flex items-center">
                        <Wallet className="w-5 h-5 mr-3 shrink-0"/>
                        You will be securely redirected to the {selectedMethod} app/website to authorize and complete the payment.
                    </div>
                    
                    {/* Mobile Number Input */}
                    <div>
                        <input type="tel" placeholder="Mobile Number (required for E-wallet)" required
                               className={`${commonInputClasses} ${validationErrors.phone ? errorInputClasses : 'border-gray-300'}`}
                               onChange={(e) => setPaymentInfo({...paymentInfo, phone: e.target.value.replace(/\D/g, '')})} />
                        {renderError('phone')}
                    </div>
                </div>
            );
        case PAYMENT_OPTIONS.COD:
            return (
                <div className="p-6 bg-purple-50 border-2 border-purple-300 text-purple-800 rounded-xl shadow-md">
                    <p className="font-semibold text-lg flex items-center">
                        <Truck className="w-5 h-5 mr-2" />
                        Cash on Delivery (Digital Product)
                    </p>
                    <p className="mt-2 text-sm">
                        Since this is a digital course, selecting COD **immediately confirms your enrollment** and grants you access. For mock purposes, this transaction is treated as settled upon clicking "Confirm Enrollment."
                    </p>
                </div>
            );
        default:
            return <div className="p-4 text-gray-500">Select a payment method to view details.</div>;
    }
  };

  // --- Render Component ---
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error && !course) return <div className="min-h-screen text-center p-10 text-red-600 font-medium">{error}</div>;
  if (!course) return navigate('/courses', { replace: true });

  const isEwalletOrCard = selectedMethod === PAYMENT_OPTIONS.CARD || selectedMethod === PAYMENT_OPTIONS.ESEWA || selectedMethod === PAYMENT_OPTIONS.KHALTI;
  const submitButtonText = isProcessing 
    ? 'Processing...'
    : selectedMethod === PAYMENT_OPTIONS.COD 
      ? `Confirm Enrollment`
      : `Pay $${course.price?.toFixed(2)} and Enroll`;

  return (
    <div className="min-h-screen bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Course
        </button>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
            <Lock className="w-8 h-8 mr-3 text-blue-600" /> Secure Checkout
        </h1>
        <p className="text-gray-600 text-lg mb-8">Final step to unlock lifetime access to **{course.title}**.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-xl border border-red-300 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3 shrink-0"/>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Section 1: Payment Method Selection (1/3) */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              1. Select Payment Method
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-2xl space-y-3">
              {[PAYMENT_OPTIONS.CARD, PAYMENT_OPTIONS.ESEWA, PAYMENT_OPTIONS.KHALTI, PAYMENT_OPTIONS.COD].map(method => (
                <div
                  key={method}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition duration-200 ${
                    selectedMethod === method ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedMethod(method)}
                >
                  {method === PAYMENT_OPTIONS.CARD && <CreditCard className="w-5 h-5 mr-3 text-blue-600" />}
                  {(method === PAYMENT_OPTIONS.ESEWA || method === PAYMENT_OPTIONS.KHALTI) && <Wallet className="w-5 h-5 mr-3 text-green-600" />}
                  {method === PAYMENT_OPTIONS.COD && <Truck className="w-5 h-5 mr-3 text-purple-600" />}
                  
                  <span className="font-medium text-gray-700">{method}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Section 2: Payment Form & Summary (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Payment Details Form */}
            <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">
                2. Enter Details
              </h2>
              <form onSubmit={handlePaymentSubmit}>
                {renderPaymentForm()}
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-4 mt-8 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : isEwalletOrCard ? 'bg-blue-600 hover:bg-blue-700 shadow-xl' : 'bg-purple-600 hover:bg-purple-700 shadow-xl'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedMethod !== PAYMENT_OPTIONS.COD && <DollarSign className="w-5 h-5 mr-3" />}
                      {submitButtonText}
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Order Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-3">
                Order Summary
              </h2>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold line-clamp-2">{course.title}</h3>
                <p className="text-gray-500 text-sm">Course by: **{course.instructor?.name || 'Instructor Name'}**</p>
                
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <span className="text-lg font-semibold text-gray-700">Total Due</span>
                  <span className="text-3xl font-extrabold text-blue-600">
                    ${course.price?.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex items-center text-sm text-green-600 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                100% Secure Checkout & Lifetime Access Guaranteed.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;