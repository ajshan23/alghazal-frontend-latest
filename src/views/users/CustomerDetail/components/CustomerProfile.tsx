import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchUserView } from '../../api/api'
import { 
  HiPhone, 
  HiMail, 
  HiBadgeCheck,
  HiLocationMarker,
  HiUserCircle,
  HiDocumentText,
  HiOfficeBuilding
} from 'react-icons/hi'

const CustomerProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumbers: [],
    telephoneNumber: '',
    trnNumber: '',
    profileImage: '',
    signatureImage: '',
    role: '',
    clientAddress: ''
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
        telephoneNumber: response?.data?.telephoneNumber || 'Not provided',
        trnNumber: response?.data?.trnNumber || 'Not provided',
        profileImage: response?.data?.profileImage,
        signatureImage: response?.data?.signatureImage,
        role: response?.data?.role || 'Not specified',
        clientAddress: response?.data?.clientAddress || 'Not provided'
      })
    }
    loadData()
  }, [id])

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profile.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <HiUserCircle className="text-5xl text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Contact Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <HiMail className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-700 dark:text-gray-200">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <HiPhone className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Numbers</p>
                  <div className="space-y-1">
                    {profile.phoneNumbers?.map((number, i) => (
                      <p key={i} className="font-medium text-gray-700 dark:text-gray-200">{number}</p>
                    ))}
                    {profile.telephoneNumber && (
                      <p className="font-medium text-gray-700 dark:text-gray-200">{profile.telephoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <HiLocationMarker className="text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-700 dark:text-gray-200 whitespace-pre-line">{profile.clientAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* TRN Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              Official Information
            </h2>
            <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <HiOfficeBuilding className="text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">TRN Number</p>
                <p className="font-medium text-gray-700 dark:text-gray-200">{profile.trnNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Documents */}
        <div className="space-y-6">
        

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              Signature
            </h2>
            <div className="flex justify-center">
              {profile.signatureImage ? (
                <img 
                  src={profile.signatureImage} 
                  alt="Signature" 
                  className="h-40 w-full max-w-xs rounded-lg object-contain border-2 border-gray-200 dark:border-gray-600 bg-white p-4"
                />
              ) : (
                <div className="h-40 w-full max-w-xs rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center">
                  <HiDocumentText className="text-5xl text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerProfile