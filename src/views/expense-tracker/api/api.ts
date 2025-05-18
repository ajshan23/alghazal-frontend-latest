import BaseService from "@/services/BaseService";

interface MaterialInput {
  description: string;
  date: Date;
  invoiceNo: string;
  amount: number;
}

interface ExpenseData {
  projectId: string;
  materials: MaterialInput[];
}

export const getProjectLaborData = async (projectId: string) => {
  try {
    const response = await BaseService.get(`/expense/project/${projectId}/labor-data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching labor data:", error);
    throw error;
  }
};

export const createExpense = async (data: ExpenseData) => {
  try {
    const response = await BaseService.post(`/expense/project/${data.projectId}`, {
      materials: data.materials
    });
    return response.data;
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

export const fetchExpense = async (expenseId: string) => {
  try {
    const response = await BaseService.get(`/expense/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense:", error);
    throw error;
  }
};

export const updateExpense = async (expenseId: string, data: { materials: MaterialInput[] }) => {
  try {
    const response = await BaseService.put(`/expense/${expenseId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

export const getProjectExpenses = async (projectId: string, page = 1, limit = 10) => {
  try {
    const response = await BaseService.get(`/expense/project/${projectId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching project expenses:", error);
    throw error;
  }
};

export const getExpenseSummary = async (projectId: string) => {
  try {
    const response = await BaseService.get(`/expense/project/${projectId}/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expense summary:", error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string) => {
  try {
    const response = await BaseService.delete(`/expense/${expenseId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};