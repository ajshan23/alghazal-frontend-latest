import BaseService from "@/services/BaseService"

// services/InvoiceService.ts
export const fetchInvoiceData = async (projectId: string) => {
    try {
      const response = await BaseService.get(`/project/${projectId}/invoice`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice data');
    }
  };

export const downloadInvoicePdf = async (projectId: string) => {
    try {
        console.log("Downloading invoice PDF for project:", projectId);
        const response = await BaseService.get(`/invoice/${projectId}/download`, {
            responseType: 'blob' // Important for file downloads
        })
        return response.data
    } catch (error) {
        console.error("Error downloading invoice PDF:", error)
        throw error
    }
}