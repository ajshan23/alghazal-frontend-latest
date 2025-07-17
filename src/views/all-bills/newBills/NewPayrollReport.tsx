import toast from '@/components/ui/toast'
import Notification from '@/components/ui/notification'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {  
    addPayrollReport,
    editPayrollReport,
    fetchPayrollReportById 
} from '../api/api'
import PayrollForm from '../billForms/PayrollForm'

const defaultReportData = {
    reportDate: new Date().toISOString().split('T')[0], // Default to today's date
    name: '',
    designation: '',
    emiratesId: '',
    labourCard: '',
    labourCardPersonalNo: '',
    period: '',
    allowance: '',
    deduction: '',
    mess: '',
    advance: '',
    net: '',
    remark: ''
}

const NewPayrollReport = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [initialData, setInitialData] = useState(defaultReportData)
    const [loading, setLoading] = useState(!!id)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setInitialData(defaultReportData)
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await fetchPayrollReportById(id)

                if (!response?.data) {
                    throw new Error('Invalid payroll data received')
                }

                setInitialData({
                    reportDate: response.data.reportDate || defaultReportData.reportDate,
                    name: response.data.name || '',
                    designation: response.data.designation || '',
                    emiratesId: response.data.emiratesId || '',
                    labourCard: response.data.labourCard || '',
                    labourCardPersonalNo: response.data.labourCardPersonalNo || '',
                    period: response.data.period || '',
                    allowance: response.data.allowance || '',
                    deduction: response.data.deduction || '',
                    mess: response.data.mess || '',
                    advance: response.data.advance || '',
                    net: response.data.net || '',
                    remark: response.data.remark || ''
                })
                setError(null)
            } catch (error: any) {
                console.error('Error fetching payroll report:', error)
                setError(error.message || 'Failed to load payroll data')
                toast.push(
                    <Notification
                        title="Failed to fetch payroll report data"
                        type="danger"
                        duration={2500}
                    >
                        {error.message || 'Something went wrong'}
                    </Notification>,
                    { placement: 'top-center' }
                )
                setTimeout(() => navigate('/app/payroll-view'), 2500)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id, navigate])

    const handleFormSubmit = async (
        formData: any,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setSubmitting(true)
            
            const formDataToSend = new FormData()
            
            // Append all form fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key])
            })
            
            // Format dates if they are Date objects
            if (formData.reportDate instanceof Date) {
                formDataToSend.set('reportDate', formData.reportDate.toISOString())
            }
            if (formData.period instanceof Date) {
                formDataToSend.set('period', formData.period.toISOString())
            }

            const response = id 
                ? await editPayrollReport(id, formDataToSend) 
                : await addPayrollReport(formDataToSend)

            if ([200, 201].includes(response.status)) {
                toast.push(
                    <Notification
                        title={`Successfully ${id ? 'updated' : 'added'} payroll report`}
                        type="success"
                        duration={2500}
                    >
                        Payroll report {id ? 'updated' : 'added'} successfully
                    </Notification>,
                    { placement: 'top-center' }
                )
                navigate('/app/payroll-view')
            } else {
                throw new Error(response?.response?.data?.message || 'Unexpected status code')
            }
        } catch (error: any) {
            console.error('Error during form submission:', error)
            toast.push(
                <Notification
                    title={`Error ${id ? 'updating' : 'adding'} payroll report`}
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message || error.message}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleDiscard = () => {
        if (JSON.stringify(initialData) !== JSON.stringify(defaultReportData)) {
            if (window.confirm('Are you sure you want to discard changes?')) {
                navigate('/app/payroll-view')
            }
        } else {
            navigate('/app/payroll-view')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <Notification
                    title="Error loading payroll report"
                    type="danger"
                >
                    {error}
                </Notification>
            </div>
        )
    }

    return (
        <PayrollForm
            type={id ? 'edit' : 'new'}
            initialData={initialData}
            onFormSubmit={handleFormSubmit}
            onDiscard={handleDiscard}
        />
    )
}

export default NewPayrollReport