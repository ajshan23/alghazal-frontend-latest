import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchUserView } from '../../api/api'
import { 
  HiPhone, 
  HiMail, 
  HiLocationMarker,
  HiUserCircle,
  HiDocumentText,
  HiCreditCard,
  HiIdentification,
  HiCalendar,
  HiCash,
  HiLockClosed,
  HiDocument 
} from 'react-icons/hi'
import { FaPassport, FaSignature } from 'react-icons/fa'

const StaffProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumbers: [],
    role: '',
    profileImage: '',
    signatureImage: '',
    salary: 0,
    address: '',
    accountNumber: '',
    emiratesId: '',
    emiratesIdDocument: '',
    passportNumber: '',
    passportDocument: '',
    isActive: false,
    createdAt: ''
  })
  const { id } = useParams()

  useEffect(() => {
    const loadData = async () => {
      const response = await fetchUserView(id)
      setProfile({
        firstName: response?.data?.firstName || 'Not provided',
        lastName: response?.data?.lastName || '',
        email: response?.data?.email || 'Not provided',
        phoneNumbers: response?.data?.phoneNumbers || [],
        role: response?.data?.role || 'Not specified',
        profileImage: response?.data?.profileImage,
        signatureImage: response?.data?.signatureImage,
        salary: response?.data?.salary || 0,
        address: response?.data?.address || 'Not provided',
        accountNumber: response?.data?.accountNumber || 'Not provided',
        emiratesId: response?.data?.emiratesId || 'Not provided',
        emiratesIdDocument: response?.data?.emiratesIdDocument,
        passportNumber: response?.data?.passportNumber || 'Not provided',
        passportDocument: response?.data?.passportDocument,
        isActive: response?.data?.isActive || false,
        createdAt: response?.data?.createdAt || ''
      })
    }
    loadData()
  }, [id])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            {profile.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md">
                <HiUserCircle className="text-6xl text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  {profile.firstName} {profile.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    profile.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                    {profile.role}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <HiCalendar className="mr-2 text-lg" />
                <span>Member since {formatDate(profile.createdAt)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <HiMail className="mr-2 text-blue-500" />
                <span className="truncate">{profile.email}</span>
              </div>
              
              {profile.phoneNumbers?.map((phone, index) => (
                <div key={index} className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                  <HiPhone className="mr-2 text-blue-500" />
                  <span className="truncate">{phone}</span>
                </div>
              ))}
              
              {profile.salary > 0 && (
                <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                  <HiCash className="mr-2 text-blue-500" />
                  <span>AED {profile.salary.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-100 dark:border-gray-700">
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-1">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <HiMail className="mr-2 text-blue-500" />
                  <span>Email</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium pl-7 truncate">
                  {profile.email}
                </p>
              </div>
              
              {/* Phone Numbers */}
              {profile.phoneNumbers?.map((phone, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <HiPhone className="mr-2 text-blue-500" />
                    <span>Phone {index > 0 ? index + 1 : ''}</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium pl-7">
                    {phone}
                  </p>
                </div>
              ))}
              
              {/* Salary */}
              {profile.salary > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <HiCash className="mr-2 text-blue-500" />
                    <span>Salary</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium pl-7">
                    AED {profile.salary.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              )}
              
              {/* Account Number */}
              <div className="space-y-1">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <HiCreditCard className="mr-2 text-blue-500" />
                  <span>Account Number</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium pl-7 truncate">
                  {profile.accountNumber}
                </p>
              </div>
              
              {/* Address */}
              <div className="space-y-1 md:col-span-2">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <HiLocationMarker className="mr-2 text-blue-500" />
                  <span>Address</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-medium pl-7 whitespace-pre-line break-words">
                  {profile.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Column */}
        <div className="space-y-6">
          {/* Emirates ID */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 w-full">
            <div className="flex items-center mb-4">
              <div className="p-2 mr-3 text-white bg-indigo-500 rounded-lg">
                <HiIdentification className="text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
                Emirates ID
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">ID Number</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {profile.emiratesId}
                </p>
              </div>
              
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                {profile.emiratesIdDocument ? (
                  <a 
                    href={profile.emiratesIdDocument} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <HiDocument className="mr-2" />
                    View Document
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
                    <HiDocumentText className="text-3xl text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">No document uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Passport */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 w-full">
            <div className="flex items-center mb-4">
              <div className="p-2 mr-3 text-white bg-teal-500 rounded-lg">
                <FaPassport className="text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
                Passport
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Passport Number</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {profile.passportNumber}
                </p>
              </div>
              
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                {profile.passportDocument ? (
                  <a 
                    href={profile.passportDocument} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <HiDocument className="mr-2" />
                    View Document
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
                    <HiDocumentText className="text-3xl text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">No document uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Signature */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 w-full">
            <div className="flex items-center mb-4">
              <div className="p-2 mr-3 text-white bg-purple-500 rounded-lg">
                <FaSignature className="text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
                Signature
              </h2>
            </div>
            
            <div className="flex justify-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              {profile.signatureImage ? (
                <img 
                  src={profile.signatureImage} 
                  alt="Signature" 
                  className="h-24 object-contain max-w-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-3">
                  <HiDocumentText className="text-3xl text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">No signature uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffProfile