import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Notification, toast } from '@/components/ui';
import { fetchExpense, deleteExpense } from '../api/api';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  salary?: number;
}

interface Worker {
  user: User;
  daysPresent: number;
  dailySalary: number;
  totalSalary: number;
  _id: string;
}

interface Driver {
  user: User;
  daysPresent: number;
  dailySalary: number;
  totalSalary: number;
}

interface MaterialItem {
  description: string;
  date: string;
  invoiceNo: string;
  amount: number;
  _id: string;
}

interface ExpenseDetails {
  _id: string;
  project: {
    _id: string;
    projectName: string;
    projectNumber: string;
  };
  materials: MaterialItem[];
  laborDetails: {
    workers: Worker[];
    driver: Driver;
    totalLaborCost: number;
  };
  totalMaterialCost: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

const ExpenseView = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<ExpenseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadExpense = async () => {
      try {
        setLoading(true);
        const response = await fetchExpense(expenseId!);
        setExpense(response.data);
      } catch (error) {
        toast.push(
          <Notification title="Error" type="danger">
            Failed to load expense details
          </Notification>
        );
        console.error("Error loading expense:", error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadExpense();
  }, [expenseId, navigate]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteExpense(expenseId!);
      toast.push(
        <Notification title="Success" type="success">
          Expense deleted successfully
        </Notification>
      );
      navigate(`/projects/${expense?.project._id}/expenses`);
    } catch (error) {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to delete expense
        </Notification>
      );
      console.error("Error deleting expense:", error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Expense not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <HiOutlineArrowLeft className="mr-1" />
          Back
        </button>
        
        {/* <div className="flex space-x-2">
          <Button
            variant="solid"
            icon={<HiOutlinePencil />}
            onClick={() => navigate(`/expenses/${expenseId}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="plain"
            icon={<HiOutlineTrash />}
            loading={deleting}
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </Button>
        </div> */}
      </div>

      {/* Project Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Expense Details
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Project</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {expense.project.projectName} ({expense.project.projectNumber})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {expense.createdBy.firstName} {expense.createdBy.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created On</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {formatDate(expense.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Material Expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Material Expenses</h2>
        {expense.materials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount (AED)</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expense.materials.map((material, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {material.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(material.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {material.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {material.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <td colSpan={3} className="px-6 py-4 text-right text-gray-900 dark:text-gray-100">
                    Total Material Cost:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                    {expense.totalMaterialCost.toFixed(2)} AED
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No material expenses recorded</p>
        )}
      </div>

      {/* Labor Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Labor Details</h2>
        
        {/* Workers */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Workers</h3>
          {expense.laborDetails.workers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Daily Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Salary</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {expense.laborDetails.workers.map((worker, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {worker.user.profileImage && (
                            <img 
                              className="h-10 w-10 rounded-full mr-3" 
                              src={worker.user.profileImage} 
                              alt={`${worker.user.firstName} ${worker.user.lastName}`} 
                            />
                          )}
                          <div className="text-gray-900 dark:text-gray-100">
                            {worker.user.firstName} {worker.user.lastName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {worker.daysPresent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {worker.dailySalary.toFixed(2)} AED
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {worker.totalSalary.toFixed(2)} AED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No workers assigned</p>
          )}
        </div>

        {/* Driver */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Driver</h3>
          {expense.laborDetails.driver ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center">
                {expense.laborDetails.driver.user.profileImage && (
                  <img 
                    className="h-10 w-10 rounded-full mr-3" 
                    src={expense.laborDetails.driver.user.profileImage} 
                    alt={`${expense.laborDetails.driver.user.firstName} ${expense.laborDetails.driver.user.lastName}`}
                  />
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {expense.laborDetails.driver.user.firstName} {expense.laborDetails.driver.user.lastName}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Days Present</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {expense.laborDetails.driver.daysPresent}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Daily Salary</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {expense.laborDetails.driver.dailySalary.toFixed(2)} AED
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Salary</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {expense.laborDetails.driver.totalSalary.toFixed(2)} AED
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No driver assigned</p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Expense Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">Total Material Cost</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {expense.totalMaterialCost.toFixed(2)} AED
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-purple-600 dark:text-purple-400">Total Labor Cost</p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {expense.laborDetails.totalLaborCost.toFixed(2)} AED
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Total Expense</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {(expense.totalMaterialCost + expense.laborDetails.totalLaborCost).toFixed(2)} AED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseView;