import { useAppDispatch, useAppSelector } from '@/store'
import { useEffect } from 'react'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import {
    HiOutlineUserCircle,
    HiOutlineMail,
    HiOutlineUser,
    HiOutlineShieldCheck, 
    HiOutlineCog,        
    HiOutlineCash,      
    HiOutlineTruck,      
    HiOutlineChip ,    
    HiOutlineClipboardCheck 
} from 'react-icons/hi'

const getRoleTitle = (authority: string) => {
    switch(authority) {
        case 'super_admin':
            return { title: 'Super Administrator', icon: <HiOutlineShieldCheck className="text-xl" /> };
        case 'admin':
            return { title: 'Administrator', icon: <HiOutlineShieldCheck className="text-xl" /> };
        case 'engineer':
            return { title: 'Engineer', icon: <HiOutlineCog className="text-xl" /> };
        case 'finance':
            return { title: 'Finance Officer', icon: <HiOutlineCash className="text-xl" /> };
        case 'driver':
            return { title: 'Driver', icon: <HiOutlineTruck className="text-xl" /> };
        case 'worker':
            return { title: 'Worker', icon: <HiOutlineChip  className="text-xl" /> };
        case 'supervisor':
            return { title: 'Supervisor', icon: <HiOutlineClipboardCheck className="text-xl" /> };
        default:
            return { title: 'User', icon: <HiOutlineUser className="text-xl" /> };
    }
}

const Profile = () => {
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user)


    console.log(user,2123)
    useEffect(() => {
        if (user) {
            dispatch({
                type: 'auth/setUser',
                payload: {
                    avatar: user.avatar ,
                    userName: user.userName || user.email,
                    email: user.email,
                    authority: user.authority ? [user.authority] : ['user'],
                },
            })
        }
    }, [dispatch, user])

    const roleInfo = user?.authority ? getRoleTitle(user.authority[0]) : getRoleTitle('user')

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
            
            <div className="space-y-5">
                <div className="flex items-center space-x-4">
                    <Avatar
                        size={80}
                        shape="circle"
                        src={user?.avatar}
                        icon={<HiOutlineUser />}
                    />
                    <div>
                        <h3 className="text-lg font-semibold">
                            {user?.userName || 'No name'}
                        </h3>
                        <p className="text-gray-500">{roleInfo.title}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                        readOnly
                        value={user?.userName || ''}
                        prefix={<HiOutlineUserCircle className="text-xl" />}
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                        readOnly
                        value={user?.email || ''}
                        prefix={<HiOutlineMail className="text-xl" />}
                    />
                </div>

                {/* Role Field */}
                <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <Input
                        readOnly
                        value={roleInfo.title}
                        prefix={roleInfo.icon}
                    />
                </div>
            </div>
        </div>
    )
}

export default Profile