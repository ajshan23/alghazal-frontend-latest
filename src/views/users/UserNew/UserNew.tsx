import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import UserForm, { SetSubmitting } from '../UserForm'
import { addUser, editUser, fetchUserById } from '../api/api'

const UserNew = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState<any>(null)
    const [loading, setLoading] = useState(!!id)

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    const response = await fetchUserById(id)
                    setInitialData({
                        ...response.data,
                        profileImage: response.data.profileImage || '',
                        signatureImage: response.data.signatureImage || '',
                        salary: response.data.salary || 0
                    })
                    setLoading(false)
                } catch (error) {
                    console.error('Error fetching user:', error)
                    setLoading(false)
                    toast.push(
                        <Notification
                            title={'Failed to fetch user data'}
                            type="danger"
                            duration={2500}
                        >
                            {error.message}
                        </Notification>,
                        {
                            placement: 'top-center',
                        },
                    )
                    navigate('/app/user-list')
                }
            }
            fetchData()
        }
    }, [id, navigate])

    const handleFormSubmit = async (
        formData: FormData,
        setSubmitting: SetSubmitting,
    ) => {
        setSubmitting(true)
        
        try {
            let response: any
            if (id) {
                response = await editUser(id, formData)
            } else {
                response = await addUser(formData)
            }

            if (response.status === (id ? 200 : 201)) {
                setSubmitting(false)
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} user`}
                        type="success"
                        duration={2500}
                    >
                        User {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    {
                        placement: 'top-center',
                    },
                )
                navigate('/app/user-list')
            } else {
                throw new Error(`Unexpected status code: ${response.status}`)
            }
        } catch (error) {
            console.error('Error during form submission:', error)
            setSubmitting(false)
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} user`}
                    type="danger"
                    duration={2500}
                >
                    {error.message}
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
        }
    }

    const handleDiscard = () => {
        navigate('/app/user-list')
    }

    if (loading) {
        return <div>Loading user data...</div>
    }

    return (
        <UserForm
            type={id ? 'edit' : 'new'}
            initialData={initialData || {
                firstName: '',
                lastName: '',
                email: '',
                phoneNumbers: [''],
                role: '',
                password: '',
                profileImage: '',
                signatureImage: '',
                salary: 0
            }}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default UserNew