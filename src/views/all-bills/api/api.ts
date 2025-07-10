import BaseService from '@/services/BaseService'

export const fetchUser = async () => {
    try {
        const response = await BaseService.get(`/user`)
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        throw error
    }
}

export const fetchShops = async () => {
    try {
        const response = await BaseService.get(`/shops`)
        return response.data
    } catch (error) {
        console.error('Error fetching shops:', error)
        throw error
    }
}

export const fetchCategories = async () => {
    try {
        const response = await BaseService.get(`/categories`)
        return response.data
    } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
    }
}

export const fetchVehicles = async () => {
    try {
        const response = await BaseService.get(`/vehicles`)
        return response.data
    } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
    }
}

export const getBills = async ({
    page,
    limit,
    search,
    billType,
    month,
    year,
    startDate,
    endDate,
    category,
    shop,
    vehicle,
    paymentMethod,
}) => {
    try {
        const response = await BaseService.get(`/bills`, {
            params: {
                page,
                limit,
                search,
                billType,
                month,
                year,
                startDate,
                endDate,
                category,
                shop,
                vehicle,
                paymentMethod,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching bills:', error)
        throw error
    }
}

export const addBill = async (formData: FormData) => {
    try {
        const response = await BaseService.post('/bills/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error adding user:', error)
        throw error
    }
}

export const editBill = async (id: string, formData: FormData) => {
    try {
        const response = await BaseService.put(`/bills/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error editing user:', error)
        throw error
    }
}

export const fetchBillById = async (id: string) => {
    try {
        const response = await BaseService.get(`/bills/${id}`)
        return {
            ...response.data,
            attachments: Array.isArray(response.data.attachments)
                ? response.data.attachments
                : response.data.attachments
                  ? [response.data.attachments]
                  : [],
            category: response.data.category || { _id: '', name: '' },
            shop: response.data.shop || { _id: '', shopName: '' },
            billDate:
                response.data.billDate ||
                new Date().toISOString().split('T')[0],
            amount: Number(response.data.amount) || 0,
            invoiceNo: response.data.invoiceNo || '',
            remarks: response.data.remarks || '',
            paymentMethod: response.data.paymentMethod || '',
        }
    } catch (error) {
        console.error('Error fetching bill:', error)
        throw error
    }
}
export const deleteBill = async (id: string) => {
    try {
        const response = await BaseService.delete(`/bills/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting bill:', error)
        throw error
    }
}
