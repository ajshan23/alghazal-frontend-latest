import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Notification, toast } from '@/components/ui';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePencil, HiOutlineDownload, HiOutlineDocumentDownload } from 'react-icons/hi';
import { fetchExpense, deleteExpense, downloadPdf } from '../api/api';

interface MaterialInput {
  description: string;
  date: Date;
  invoiceNo: string;
  amount: number;
  supplierName?: string;
  supplierMobile?: string;
  supplierEmail?: string;
  documentUrl?: string;
  documentKey?: string;
}

export interface ExpenseDetails {
  _id: string;
  project: {
    _id: string;
    projectName: string;
    projectNumber: string;
  };
  materials: {
    description: string;
    date: string;
    invoiceNo: string;
    amount: number;
    supplierName?: string;
    supplierMobile?: string;
    supplierEmail?: string;
    _id: string;
    documentUrl?: string;
    documentKey?: string;
  }[];
  laborDetails: {
    workers: Worker[];
    driver: Driver | null;
    totalLaborCost: number;
  };
  totalMaterialCost: number;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  quotation: QuotationData | null;
}

interface QuotationData {
  netAmount: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
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

const ExpenseView = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<ExpenseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadExpense = async () => {
      try {
        setLoading(true);
        const response = await fetchExpense(expenseId!);
        setExpense(response.data);
        console.log("expense data", response.data);
        
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

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const fileName = `expense-${expense?.project.projectNumber}-${expenseId}.pdf`;
      await downloadPdf(expenseId!, fileName);
    } catch (error) {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to download PDF
        </Notification>
      );
      console.error("Error downloading PDF:", error);
    } finally {
      setDownloading(false);
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

  // Calculate totals with safeguards
  const totalMaterialCost = expense.totalMaterialCost || 0;
  const totalLaborCost = expense.laborDetails?.totalLaborCost || 0;
  const totalExpense = totalMaterialCost + totalLaborCost;
  const quotationAmount = expense.quotation?.netAmount || 0;
  const profit = quotationAmount - totalExpense;
  const profitPercentage = quotationAmount ? (profit / quotationAmount) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <HiOutlineArrowLeft className="mr-1" />
          Back
        </button>
        <div className="flex flex-wrap gap-2">
          {/* <Button
            variant="solid"
            icon={<HiOutlinePencil />}
            onClick={() => navigate(`/expenses/${expenseId}/edit`)}
          >
            Edit
          </Button> */}
          <Button
            variant="solid"
            icon={<HiOutlineDownload />}
            loading={downloading}
            onClick={handleDownloadPdf}
          >
            Download PDF
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
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Expense Details
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Project</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {expense.project?.projectName || 'N/A'} ({expense.project?.projectNumber || 'N/A'})
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {expense.createdBy?.firstName || 'Unknown'} {expense.createdBy?.lastName || ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created On</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {expense.createdAt ? formatDate(expense.createdAt) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Material Expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Material Expenses</h2>
        {expense.materials?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount (AED)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Document</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expense.materials.map((material, index) => {
                  const amount = typeof material.amount === 'number' ? material.amount : 0;
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                        {material._doc.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {material._doc.date ? formatDate(material.date) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {material._doc.invoiceNo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {material._doc.supplierName && (
                          <div className="space-y-1">
                            <p>{material._doc.supplierName}</p>
                            {material._doc.supplierMobile && <p>{material._doc.supplierMobile}</p>}
                            {material._doc.supplierEmail && <p className="text-blue-600 dark:text-blue-400">{material._doc.supplierEmail}</p>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {material._doc.documentUrl && (
                          <a 
                            href={material._doc.documentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <HiOutlineDocumentDownload className="mr-1" />
                            View Document
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <td colSpan={4} className="px-6 py-4 text-right text-gray-900 dark:text-gray-100">
                    Total Material Cost:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100" colSpan={2}>
                    {totalMaterialCost.toFixed(2)} AED
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
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Workers</h3>
          {expense.laborDetails?.workers?.length > 0 ? (
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
                          {worker.user?.profileImage && (
                            <img 
                              className="h-10 w-10 rounded-full mr-3" 
                              src={worker.user.profileImage} 
                              alt={`${worker.user.firstName || ''} ${worker.user.lastName || ''}`} 
                            />
                          )}
                          <div className="text-gray-900 dark:text-gray-100">
                            {worker.user?.firstName || 'Unknown'} {worker.user?.lastName || ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {worker.daysPresent || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {(worker.dailySalary || 0).toFixed(2)} AED
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {(worker.totalSalary || 0).toFixed(2)} AED
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                    <td colSpan={3} className="px-6 py-4 text-right text-gray-900 dark:text-gray-100">
                      Total Workers Cost:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                      {expense.laborDetails.workers
                        .reduce((sum, worker) => sum + (worker.totalSalary || 0), 0)
                        .toFixed(2)} AED
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No workers assigned</p>
          )}
        </div>

        {/* Driver */}
        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Driver</h3>
          {expense.laborDetails?.driver ? (
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
                <tbody className="bg-white dark:bg-gray-800">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {expense.laborDetails.driver.user?.profileImage && (
                          <img 
                            className="h-10 w-10 rounded-full mr-3" 
                            src={expense.laborDetails.driver.user.profileImage} 
                            alt={`${expense.laborDetails.driver.user.firstName || ''} ${expense.laborDetails.driver.user.lastName || ''}`}
                          />
                        )}
                        <div className="text-gray-900 dark:text-gray-100">
                          {expense.laborDetails.driver.user?.firstName || 'Unknown'} {expense.laborDetails.driver.user?.lastName || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {expense.laborDetails.driver.daysPresent || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {(expense.laborDetails.driver.dailySalary || 0).toFixed(2)} AED
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {(expense.laborDetails.driver.totalSalary || 0).toFixed(2)} AED
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No driver assigned</p>
          )}
        </div>
        
        {/* Labor Cost Summary */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 dark:text-gray-100 font-semibold">Total Labor Cost:</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {totalLaborCost.toFixed(2)} AED
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Expense Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">Total Material Cost</p>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {totalMaterialCost.toFixed(2)} AED
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
            <p className="text-sm text-purple-600 dark:text-purple-400">Total Labor Cost</p>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {totalLaborCost.toFixed(2)} AED
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">Total Expense</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {totalExpense.toFixed(2)} AED
            </p>
          </div>
          {expense.quotation && (
            <div className={`p-4 rounded-lg ${
              profit >= 0 
                ? 'bg-green-50 dark:bg-green-900/30' 
                : 'bg-red-50 dark:bg-red-900/30'
            }`}>
              <div className="mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">Quotation Amount</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {quotationAmount.toFixed(2)} AED
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Profit/Loss</p>
                <p className={`text-xl font-bold ${
                  profit >= 0 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {profit.toFixed(2)} AED ({profitPercentage.toFixed(2)}%)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseView;