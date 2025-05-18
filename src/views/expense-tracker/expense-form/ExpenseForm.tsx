import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { Button, Input, FormItem, DatePicker, Notification, toast } from '@/components/ui';
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import { getProjectLaborData, createExpense, fetchExpense, updateExpense } from '../api/api';

interface MaterialItem {
  description: string;
  date: Date;
  invoiceNo: string;
  amount: number;
}

interface Worker {
  user: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  daysPresent: number;
  dailySalary: number;
  totalSalary: number;
}

interface Driver {
  user: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  daysPresent: number;
  dailySalary: number;
  totalSalary: number;
}

interface LaborData {
  workers: Worker[];
  driver: Driver | null;
  totalLaborCost: number;
}

const validationSchema = Yup.object().shape({
  materials: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('Description is required'),
      date: Yup.date().required('Date is required'),
      invoiceNo: Yup.string().required('Invoice number is required'),
      amount: Yup.number().min(0, 'Amount must be positive').required('Amount is required')
    })
  )
});

const ExpenseForm = () => {
  const { projectId, expenseId } = useParams();
  const navigate = useNavigate();
  const [laborData, setLaborData] = useState<LaborData | null>(null);
  const [initialValues, setInitialValues] = useState({
    materials: [{ description: '', date: new Date(), invoiceNo: '', amount: 0 }],
    laborDetails: {
      workers: [] as Worker[],
      driver: null as Driver | null,
      totalLaborCost: 0
    },
    totalMaterialCost: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const laborResponse = await getProjectLaborData(projectId!);
        setLaborData(laborResponse.data);
        
        if (expenseId) {
          const expenseResponse = await fetchExpense(expenseId);
          setInitialValues({
            materials: expenseResponse.data.materials.map((m: any) => ({
              description: m.description,
              date: new Date(m.date),
              invoiceNo: m.invoiceNo,
              amount: m.amount
            })),
            laborDetails: {
              workers: expenseResponse.data.laborDetails.workers,
              driver: expenseResponse.data.laborDetails.driver,
              totalLaborCost: expenseResponse.data.laborDetails.totalLaborCost
            },
            totalMaterialCost: expenseResponse.data.totalMaterialCost
          });
        } else {
          setInitialValues(prev => ({
            ...prev,
            laborDetails: laborResponse.data
          }));
        }
      } catch (error) {
        toast.push(
          <Notification title="Error" type="danger">
            Failed to load required data
          </Notification>
        );
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, expenseId]);

  const handleSubmit = async (values: typeof initialValues) => {
    try {
      if (expenseId) {
        await updateExpense(expenseId, {
          materials: values.materials
        });
        toast.push(
          <Notification title="Success" type="success">
            Expense updated successfully
          </Notification>
        );
      } else {
        await createExpense({
          projectId,
          materials: values.materials
        });
        toast.push(
          <Notification title="Success" type="success">
            Expense created successfully
          </Notification>
        );
      }
      navigate(`/projects/${projectId}/expenses`);
    } catch (error) {
      toast.push(
        <Notification title="Error" type="danger">
          Failed to save expense
        </Notification>
      );
      console.error("Error saving expense:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Material Expenses Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Material Expenses</h2>
              <FieldArray name="materials">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.materials.map((_, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <Field 
                            name={`materials[${index}].description`} 
                            as={Input} 
                            placeholder="Material description" 
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                          <Field name={`materials[${index}].date`}>
                            {({ field, form }: any) => (
                              <DatePicker
                                placeholder="Select date"
                                value={field.value}
                                onChange={(date) => form.setFieldValue(field.name, date)}
                              />
                            )}
                          </Field>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice No</label>
                          <Field 
                            name={`materials[${index}].invoiceNo`} 
                            as={Input} 
                            placeholder="Invoice number" 
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                          <Field 
                            name={`materials[${index}].amount`} 
                            type="number" 
                            as={Input} 
                            placeholder="Amount" 
                          />
                        </div>
                        {values.materials.length > 1 && (
                          <div className="col-span-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <HiOutlineTrash className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => push({ description: '', date: new Date(), invoiceNo: '', amount: 0 })}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <HiOutlinePlus className="mr-1" />
                      Add Material
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Labor Details Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Labor Details</h2>
              <div className="space-y-6">
                {/* Workers Table */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Workers</h3>
                  {laborData?.workers.length ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days Present</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Daily Salary</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {laborData.workers.map((worker, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {worker.profileImage && (
                                    <img className="h-10 w-10 rounded-full mr-3" src={worker.profileImage} alt="" />
                                  )}
                                  <div className="text-gray-900 dark:text-gray-100">
                                    {worker.firstName} {worker.lastName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{worker.daysPresent}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">AED {worker.dailySalary.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">AED {worker.totalSalary.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No workers assigned to this project</p>
                  )}
                </div>

                {/* Driver Details */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Driver</h3>
                  {laborData?.driver ? (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {laborData.driver.profileImage && (
                        <img className="h-12 w-12 rounded-full" src={laborData.driver.profileImage} alt="" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {laborData.driver.firstName} {laborData.driver.lastName}
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Days Present</div>
                            <div className="text-gray-900 dark:text-gray-100">{laborData.driver.daysPresent}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Daily Salary</div>
                            <div className="text-gray-900 dark:text-gray-100">AED {laborData.driver.dailySalary.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                            <div className="text-gray-900 dark:text-gray-100">AED {laborData.driver.totalSalary.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No driver assigned to this project</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Expense Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Total Material Cost</label>
                  <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AED {values.materials.reduce((sum, m) => sum + m.amount, 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Total Labor Cost</label>
                  <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    AED {laborData?.totalLaborCost.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Total Expense</label>
                  <div className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
                    AED {(values.materials.reduce((sum, m) => sum + m.amount, 0) + (laborData?.totalLaborCost || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className=" bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between shadow-lg">
              <button
                type="button"
                onClick={() => navigate(`/projects/${projectId}/expenses`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {expenseId ? 'Update Expense' : 'Create Expense'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ExpenseForm;