import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, Download, ArrowLeft, Home, Mail, User,
  Calendar, CreditCard, FileText, Shield, Share2,
  Printer, Clock, BookOpen, Award, Users, Smartphone,
  ExternalLink, Loader, CreditCard as CardIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const PaymentSuccessPage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [payment, setPayment] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Initialize from location state or fetch from backend
  const initialPayment = location.state?.paymentDetails;
  const initialEnrollment = location.state?.enrollment;
  const initialCourse = location.state?.course;

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch payment and enrollment details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If we have initial data from location state, use it
        if (initialCourse) {
          setCourse(initialCourse);
        } else {
          // Fetch course details from backend
          const courseResponse = await API.get(`/courses/${courseId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setCourse(courseResponse.data?.course || courseResponse.data);
        }

        if (initialPayment) {
          setPayment(initialPayment);
        } else {
          // Fetch latest payment for this course
          const paymentsResponse = await API.get('/payments/history', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const userPayments = paymentsResponse.data?.payments || [];
          const coursePayment = userPayments.find(p => 
            p.course?.id === parseInt(courseId) || p.courseId === parseInt(courseId)
          );
          
          if (coursePayment) {
            setPayment(coursePayment);
          }
        }

        if (initialEnrollment) {
          setEnrollment(initialEnrollment);
        } else {
          // Fetch enrollment status
          try {
            const enrollmentResponse = await API.get(`/enrollments/course/${courseId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            setEnrollment(enrollmentResponse.data);
          } catch (enrollmentErr) {
            // Enrollment might not exist yet (will be created by payment)
            console.log('Enrollment not found, will be created');
          }
        }

      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load enrollment details');
        
        if (err.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        }
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, location.state, navigate, initialPayment, initialEnrollment, initialCourse]);

  // Verify payment on backend
  const verifyPayment = async () => {
    if (!payment?.id) return;
    
    try {
      const verifyResponse = await API.get(`/payments/verify/${payment.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (verifyResponse.data.success) {
        setPayment(verifyResponse.data.payment);
        toast.success('Payment verified successfully');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get payment method details
  const getPaymentMethodDetails = (method) => {
    const methods = {
      CARD: { name: 'Credit/Debit Card', icon: CardIcon, color: '#2563EB' },
      ESEWA: { name: 'eSewa', icon: Smartphone, color: '#059669' },
      KHALTI: { name: 'Khalti', icon: Smartphone, color: '#7C3AED' },
      COD: { name: 'Pay Later', icon: CreditCard, color: '#DC2626' }
    };
    return methods[method] || { name: 'Payment', icon: CreditCard, color: '#6B7280' };
  };

  // Generate and download receipt
  const downloadReceipt = async () => {
    if (!payment || !course || !user) {
      toast.error('Cannot generate receipt. Data missing.');
      return;
    }

    setDownloading(true);
    
    try {
      const response = await API.get(`/payments/receipt/${payment.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${payment.transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Receipt downloaded successfully');
      
    } catch (err) {
      console.error('Download error:', err);
      
      // Fallback to client-side PDF generation if backend fails
      if (err.response?.status === 404) {
        generateClientSideReceipt();
      } else {
        toast.error('Failed to download receipt. Please try again.');
      }
    } finally {
      setDownloading(false);
    }
  };

  // Fallback: Generate receipt on client side
  const generateClientSideReceipt = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const { autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add header
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text('PAYMENT RECEIPT', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Enrollment Confirmation', pageWidth / 2, 28, { align: 'center' });
      
      // Invoice details
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text('Payment Details', 20, 40);
      
      const invoiceData = [
        ['Receipt No:', payment.transactionId],
        ['Date:', formatDate(payment.createdAt || payment.date)],
        ['Payment Method:', getPaymentMethodDetails(payment.paymentMethod).name],
        ['Status:', payment.status === 'SUCCESS' ? 'PAID' : 'PENDING']
      ];
      
      autoTable(doc, {
        startY: 45,
        head: [],
        body: invoiceData,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: { 
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20 }
      });
      
      // Course details
      const courseY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('Course Information', 20, courseY);
      
      const courseData = [
        ['Course:', course.title],
        ['Student:', user.name],
        ['Email:', user.email]
      ];
      
      autoTable(doc, {
        startY: courseY + 5,
        body: courseData,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: { 
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20 }
      });
      
      // Payment summary
      const paymentY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('Payment Summary', 20, paymentY);
      
      const amount = parseFloat(payment.amount || 0);
      const tax = amount * 0.1;
      const subtotal = amount - tax;
      
      const paymentSummary = [
        ['Description', 'Amount'],
        ['Course Fee', formatCurrency(subtotal)],
        ['Tax (10%)', formatCurrency(tax)],
        ['Total Amount', formatCurrency(amount)]
      ];
      
      autoTable(doc, {
        startY: paymentY + 5,
        head: [paymentSummary[0]],
        body: paymentSummary.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 10 },
        styles: { fontSize: 10, halign: 'right' },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold' },
          1: { fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
      });
      
      // Footer
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text('Thank you for your payment.', pageWidth / 2, finalY, { align: 'center' });
      doc.text('This receipt is valid for tax purposes.', pageWidth / 2, finalY + 5, { align: 'center' });
      
      // Save PDF
      doc.save(`receipt-${payment.transactionId}.pdf`);
      
      toast.success('Receipt generated successfully');
      
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate receipt. Please try again.');
    }
  };

  // Send receipt via email
  const sendEmailReceipt = async () => {
    if (!payment?.id) {
      toast.error('Payment information not available');
      return;
    }

    setEmailSending(true);
    
    try {
      // Call backend API to send email
      const response = await API.post(`/payments/receipt/${payment.id}/email`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        toast.success('Receipt sent to your email successfully!');
      }
      
    } catch (err) {
      console.error('Email error:', err);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  // Print receipt
  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${payment?.transactionId || 'Payment'}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563EB; margin-bottom: 10px; }
          .title { font-size: 20px; font-weight: 600; color: #1F2937; margin: 20px 0; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 14px; font-weight: 600; color: #6B7280; margin-bottom: 10px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { color: #6B7280; }
          .value { font-weight: 500; }
          .total { border-top: 2px solid #E5E7EB; padding-top: 15px; margin-top: 15px; }
          .total .value { font-size: 18px; font-weight: 600; color: #2563EB; }
          .footer { margin-top: 30px; text-align: center; color: #9CA3AF; font-size: 12px; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Learning Platform</div>
          <div>Payment Receipt</div>
        </div>
        
        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="row">
            <span class="label">Transaction ID:</span>
            <span class="value">${payment?.transactionId || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Date:</span>
            <span class="value">${formatDate(payment?.createdAt || payment?.date)}</span>
          </div>
          <div class="row">
            <span class="label">Method:</span>
            <span class="value">${getPaymentMethodDetails(payment?.paymentMethod).name}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span class="value">${payment?.status === 'SUCCESS' ? 'PAID' : 'PENDING'}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Course Information</div>
          <div class="row">
            <span class="label">Course:</span>
            <span class="value">${course?.title || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Student:</span>
            <span class="value">${user?.name || 'N/A'}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Payment Summary</div>
          <div class="row">
            <span class="label">Course Fee:</span>
            <span class="value">${formatCurrency(payment?.amount ? payment.amount * 0.9 : 0)}</span>
          </div>
          <div class="row">
            <span class="label">Tax (10%):</span>
            <span class="value">${formatCurrency(payment?.amount ? payment.amount * 0.1 : 0)}</span>
          </div>
          <div class="row total">
            <span class="label">Total Amount:</span>
            <span class="value">${formatCurrency(payment?.amount || 0)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your payment.</p>
          <p>This receipt is valid for tax purposes.</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 1000);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Share enrollment
  const shareEnrollment = () => {
    if (navigator.share) {
      navigator.share({
        title: `I just enrolled in ${course?.title}!`,
        text: `Check out this course I just enrolled in: ${course?.title}`,
        url: window.location.origin + `/courses/${courseId}`
      }).catch(() => {
        // Fallback to copying link
        navigator.clipboard.writeText(window.location.origin + `/courses/${courseId}`);
        toast.success('Course link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/courses/${courseId}`);
      toast.success('Course link copied to clipboard!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !payment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Receipt</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const paymentMethodDetails = getPaymentMethodDetails(payment?.paymentMethod);
  const PaymentMethodIcon = paymentMethodDetails.icon;
  const amount = parseFloat(payment?.amount || 0);
  const tax = amount * 0.1;
  const subtotal = amount - tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to={`/courses/${courseId}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Payment Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Receipt */}
          <div className="lg:w-2/3">
            {/* Success Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-1">Payment Successful</h1>
                  <p className="text-gray-600">
                    You are now enrolled in <span className="font-medium text-gray-900">{course?.title}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Transaction ID: <span className="font-mono">{payment?.transactionId}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Payment Receipt
                </h2>
              </div>

              <div className="p-6">
                {/* Payment Status */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                         style={{ backgroundColor: `${paymentMethodDetails.color}10` }}>
                      <PaymentMethodIcon className="w-5 h-5" style={{ color: paymentMethodDetails.color }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-900">{paymentMethodDetails.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {payment?.status === 'SUCCESS' ? 'Completed' : payment?.status}
                    </span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                      <p className="font-mono text-sm text-gray-900">{payment?.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Payment Date</p>
                      <p className="font-medium text-gray-900">{formatDate(payment?.createdAt || payment?.date)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Course</p>
                      <p className="font-medium text-gray-900">{course?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Student</p>
                      <p className="font-medium text-gray-900">{user?.name}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course Fee</span>
                      <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-blue-600">{formatCurrency(amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receipt Actions */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={downloadReceipt}
                    disabled={downloading}
                    className="py-3 px-4 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PDF
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={sendEmailReceipt}
                    disabled={emailSending}
                    className="py-3 px-4 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {emailSending ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Email Receipt
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={printReceipt}
                    className="py-3 px-4 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="lg:w-1/3">
            {/* Course Access */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Course Access</h3>
              
              <Link
                to={`/courses/${courseId}/learn`}
                className="block w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-center mb-4"
              >
                Start Learning
              </Link>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Access Duration</p>
                    <p className="text-xs text-gray-600">Lifetime access</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Materials</p>
                    <p className="text-xs text-gray-600">All videos, exercises, and resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Certificate</p>
                    <p className="text-xs text-gray-600">Included upon completion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share & Support */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Share & Support</h3>
              
              <button
                onClick={shareEnrollment}
                className="w-full py-3 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <Share2 className="w-4 h-4" />
                Share Course
              </button>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Need Help?</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Our support team is available 24/7 to assist you.
                  </p>
                  <a 
                    href="mailto:support@example.com" 
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium inline-flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    support@example.com
                  </a>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Next Steps</p>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Complete course setup in your dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Join course community for discussions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>Download course materials for offline access</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dashboard Links */}
            <div className="mt-6 space-y-3">
              <Link
                to="/student-dashboard"
                className="block py-3 px-4 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/courses"
                className="block py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Browse More Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;