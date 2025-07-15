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
export const exportBillToExcel = async ({
  
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
}: {
   
    search?: string;
    billType?: string;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
    category?: string;
    shop?: string;
    vehicle?: string;
    paymentMethod?: string;
}) => {
    try {
        // Prepare params object with proper typing
        const params: Record<string, any> = {
            
            
            search,
            billType,
            month,
            year,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            category,
            shop,
            vehicle,
            paymentMethod,
        };

        // Clean up undefined parameters
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        const response = await BaseService.get('/bills/export/excel', {
            params,
            responseType: 'blob',
        });

        // Validate response
        if (!response.data) {
            throw new Error('No data received from server');
        }

        // Create filename with current date and bill type
        const filename = `bills_export_${billType || 'all'}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        }));
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

        return true;
    } catch (error) {
        console.error('Error exporting bills:', error);
        
        // Enhanced error handling
        let errorMessage = 'Failed to export bills';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        throw new Error(errorMessage);
    }
};
//Report Sections and Expenses --- [ADIB REPORT & EXPENSES]
export const getAdibReportAndExpenses = async ({
    page,
    limit,
    search,
    reportType,
    month,
    year,
    startDate,
    endDate,
    category,
    shop,
    
}) => {
    try {
        const response = await BaseService.get(`/bank`, {
            params: {
                page,
                limit,
                search,
                reportType,
                month,
                year,
                startDate,
                endDate,
                category,
                shop,
               
            },
        })
        return response.data
    } catch (error) {
        console.error('Error fetching reports:', error)
        throw error
    }
}

export const addAdibReportAndExpenses = async (formData: FormData) => {
    try {
        const response = await BaseService.post('/bank/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error adding Aadib report:', error)
        throw error
    }
}

export const editAdibReportAndExpenses = async (id: string, formData: FormData) => {
    try {
        const response = await BaseService.put(`/bank/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response
    } catch (error) {
        console.error('Error editing Aadib report:', error)
        throw error
    }
}

export const fetchAdibReportAndExpensesById = async (id: string) => {
    try {
        const response = await BaseService.get(`/bank/${id}`)
        return {
            ...response.data,
            reportDate: response.data.reportDate || new Date().toISOString().split('T')[0],
            amount: Number(response.data.amount) || 0,
            category: response.data.category || { _id: '', name: '' },
            shop: response.data.shop || { _id: '', shopName: '' },
            remarks: response.data.remarks || ''
        }
    } catch (error) {
        console.error('Error fetching Aadib report:', error)
        throw error
    }
}

export const deleteAdibReportAndExpenses = async (id: string) => {
    try {
        const response = await BaseService.delete(`/bank/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting Aadib report:', error)
        throw error
    }
}
export const exportReportToExcel = async ({
  
    search,
    billType,
    month,
    year,
    startDate,
    endDate,
    category,
    shop,

}: {
   
    search?: string;
    billType?: string;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
    category?: string;
    shop?: string;

}) => {
    try {
        // Prepare params object with proper typing
        const params: Record<string, any> = {
            
            
            search,
            billType,
            month,
            year,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            category,
            shop,
      
        };

        // Clean up undefined parameters
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        const response = await BaseService.get('/bank/export/excel', {
            params,
            responseType: 'blob',
        });

        // Validate response
        if (!response.data) {
            throw new Error('No data received from server');
        }

        // Create filename with current date and bill type
        const filename = `bills_export_${billType || 'all'}_${new Date().toISOString().slice(0, 10)}.xlsx`;

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        }));
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

        return true;
    } catch (error) {
        console.error('Error exporting bills:', error);
        
        // Enhanced error handling
        let errorMessage = 'Failed to export bills';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        throw new Error(errorMessage);
    }
};









