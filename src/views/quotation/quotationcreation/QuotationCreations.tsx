import { forwardRef, useState, useEffect } from 'react';
import { FormContainer } from '@/components/ui/Form';
import Button from '@/components/ui/Button';
import StickyFooter from '@/components/shared/StickyFooter';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import toast from '@/components/ui/toast';
import Notification from '@/components/ui/Notification';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AdaptableCard from '@/components/shared/AdaptableCard';
import Input from '@/components/ui/Input';
import { FormItem } from '@/components/ui/Form';
import { Field, FieldArray } from 'formik';
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
import DatePicker from '@/components/ui/DatePicker';
import Select from '@/components/ui/Select';
import { createQuotation, getQuotationByProject, updateQuotation } from '../api/api';
import { APP_PREFIX_PATH } from '@/constants/route.constant';
import { Upload } from '@/components/ui';

const measurementUnits = [
  // Mass
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'mg', label: 'Milligram (mg)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'ton', label: 'Ton (ton)' },

  // Volume
  { value: 'l', label: 'Liter (L)' },
  { value: 'ml', label: 'Milliliter (mL)' },
  { value: 'gal', label: 'Gallon (gal)' },
  { value: 'pt', label: 'Pint (pt)' },
  { value: 'qt', label: 'Quart (qt)' },
  { value: 'fl_oz', label: 'Fluid Ounce (fl oz)' },

  // Length
  { value: 'm', label: 'Meter (m)' },
  { value: 'cm', label: 'Centimeter (cm)' },
  { value: 'mm', label: 'Millimeter (mm)' },
  { value: 'in', label: 'Inch (in)' },
  { value: 'ft', label: 'Foot (ft)' },
  { value: 'yd', label: 'Yard (yd)' },

  // Count/Other
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'box', label: 'Box (box)' },
  { value: 'dozen', label: 'Dozen (dozen)' },
  { value: 'pack', label: 'Pack (pack)' }
];

const termsCategories = [
  { value: 'The work will be started after receiving the PO', label: 'The work will be started after receiving the PO' },
  { value: 'The work will be started after the confirmation of client', label: 'The work will be started after receiving the PO' },
  // ... other categories
];


const termsTypes = [
  { value: 'The payment as per accounting terms 90 days', label: 'The payment as per accounting terms 90 days' },
  { value: 'The payment as per accounting terms 60 days', label: 'The payment as per accounting terms 60 days' },
  { value: 'The payment as per accounting terms 30 days', label: 'The payment as per accounting terms 30 days' },
  { value: '50% advance and 50% after completion of work', label: '50% advance and 50% after completion of work' },
  { value: '50% advance before starting the work and 30% work on progress and 20% after completion of work', label: '50% advance before starting the work and 30% work on progress and 20% after completion of work' },
  { value: 'Cash on delivery', label: 'Cash on delivery' },
  // ... other types
];

interface IQuotationItem {
  description: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: {
    url: string;
    key: string;
    mimetype: string;
  };
}

interface InitialData {
  _id?: string;
  quotationNumber: string;
  date: Date;
  validUntil: Date;
  scopeOfWork: string[];
  items: IQuotationItem[];
  termsAndConditions: string[];
  vatPercentage: number;
  subtotal: number;
  vatAmount: number;
  netAmount: number;
  project?: string;
  estimation?: string;
}

export type QuotationFormModel = InitialData;

type FormikRef = FormikProps<QuotationFormModel>;

type QuotationFormProps = {
  onDiscard?: () => void;
};

const validationSchema = Yup.object().shape({
  validUntil: Yup.date().required('Valid Until date is required'),
  scopeOfWork: Yup.array()
    .of(Yup.string().required('Scope item cannot be empty'))
    .min(1, 'At least one scope item is required'),
  items: Yup.array()
    .of(
      Yup.object().shape({
        description: Yup.string().required('Description is required'),
        uom: Yup.string().required('Unit of measurement is required'),
        quantity: Yup.number()
          .required('Quantity is required')
          .min(0, 'Quantity must be positive'),
        unitPrice: Yup.number()
          .required('Unit price is required')
          .min(0, 'Unit price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
  termsAndConditions: Yup.array()
    .of(Yup.string().required('Term cannot be empty'))
    .min(1, 'At least one term is required'),
  vatPercentage: Yup.number()
    .min(0, 'VAT percentage cannot be negative')
    .max(100, 'VAT percentage cannot exceed 100'),
});

const QuotationForm = forwardRef<FormikRef, QuotationFormProps>((props, ref) => {
  const { onDiscard } = props;
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { state } = useLocation();
  
  const estimationId = state?.estimationId;
  const quotationId = state?.quotationId;

  const [initialValues, setInitialValues] = useState<QuotationFormModel>({
    quotationNumber: '',
    date: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    scopeOfWork: [''],
    items: [
      { description: '', uom: '', quantity: 0, unitPrice: 0, totalPrice: 0 },
    ],
    termsAndConditions: [''],
    vatPercentage: 5,
    subtotal: 0,
    vatAmount: 0,
    netAmount: 0,
    project: projectId,
    estimation: estimationId,
  });

  const [isLoading, setIsLoading] = useState(!!quotationId);
  const [files, setFiles] = useState<(File | null)[]>([]);
  const [existingImages, setExistingImages] = useState<{[key: number]: string}>({});

  useEffect(() => {
    const fetchQuotationData = async () => {
      if (quotationId) {
        try {
          const quotation = await getQuotationByProject(projectId!);
          
          const newExistingImages: {[key: number]: string} = {};
          const initialFiles: (File | null)[] = [];
          
          quotation.items.forEach((item, index) => {
            if (item.image?.url) {
              newExistingImages[index] = item.image.url;
            }
            initialFiles[index] = null;
          });
          
          setExistingImages(newExistingImages);
          setFiles(initialFiles);
          
          setInitialValues({
            _id: quotation._id,
            quotationNumber: quotation.quotationNumber,
            date: new Date(quotation.date),
            validUntil: new Date(quotation.validUntil),
            scopeOfWork: quotation.scopeOfWork.length > 0 
              ? quotation.scopeOfWork 
              : [''],
            items: quotation.items.map(item => ({
              description: item.description,
              uom: item.uom,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              image: item.image,
            })),
            termsAndConditions: quotation.termsAndConditions.length > 0 
              ? quotation.termsAndConditions 
              : [''],
            vatPercentage: quotation.vatPercentage,
            subtotal: quotation.subtotal,
            vatAmount: quotation.vatAmount,
            netAmount: quotation.netAmount,
            project: quotation.project._id,
            estimation: quotation.estimation._id,
          });
        } catch (error) {
          console.error('Error fetching quotation:', error);
          toast.push(
            <Notification title="Error" type="danger" duration={2500}>
              Failed to load quotation data.
            </Notification>,
            { placement: 'top-center' }
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchQuotationData();
  }, [quotationId, projectId]);

  const handleFormSubmit = async (values: QuotationFormModel) => {
    try {
      // Filter out null files
      const filesToUpload = files.filter(file => file !== null) as File[];
      
      if (quotationId) {
        await updateQuotation(quotationId, {
          ...values,
          projectId: values.project,
          estimationId: values.estimation
        }, filesToUpload);
        toast.push(
          <Notification title="Success" type="success" duration={2500}>
            Quotation updated successfully.
          </Notification>,
          { placement: 'top-center' }
        );
      } else {
        await createQuotation({
          ...values,
          projectId: values.project,
          estimationId: values.estimation
        }, filesToUpload);
        toast.push(
          <Notification title="Success" type="success" duration={2500}>
            Quotation created successfully.
          </Notification>,
          { placement: 'top-center' }
        );
      }
      navigate(-1)
    } catch (error) {
      console.error(`Error ${quotationId ? 'updating' : 'creating'} quotation:`, error);
      toast.push(
        <Notification title="Error" type="danger" duration={2500}>
          Failed to {quotationId ? 'update' : 'create'} quotation. Please try again.
        </Notification>,
        { placement: 'top-center' }
      );
    }
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);
    
    // Clear existing image if new file is uploaded
    if (file && existingImages[index]) {
      const newExistingImages = {...existingImages};
      delete newExistingImages[index];
      setExistingImages(newExistingImages);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Formik
      innerRef={ref}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize
    >
      {({ values, touched, errors, isSubmitting, setFieldValue }) => {
        // Calculate totals whenever values change
        useEffect(() => {
          // Calculate items totals
          values.items.forEach((item, index) => {
            const totalPrice = parseFloat((item.quantity * item.unitPrice).toFixed(2));
            if (item.totalPrice !== totalPrice) {
              setFieldValue(`items[${index}].totalPrice`, totalPrice);
            }
          });

          // Calculate subtotal
          const subtotal = values.items.reduce((sum, item) => sum + item.totalPrice, 0);
          if (values.subtotal !== subtotal) {
            setFieldValue('subtotal', subtotal);
          }

          // Calculate VAT and net amount
          const vatAmount = parseFloat((subtotal * (values.vatPercentage / 100)).toFixed(2));
          const netAmount = parseFloat((subtotal + vatAmount).toFixed(2));
          
          if (values.vatAmount !== vatAmount) {
            setFieldValue('vatAmount', vatAmount);
          }
          if (values.netAmount !== netAmount) {
            setFieldValue('netAmount', netAmount);
          }
        }, [values.items, values.vatPercentage]);

        return (
          <Form>
            <FormContainer>
              {/* Quotation Details Section */}
              <AdaptableCard divider className="mb-4">
                <h5>Quotation Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* <FormItem label="Quotation Number">
                    <Field name="quotationNumber" type="text" readOnly component={Input} />
                  </FormItem>
                  <FormItem label="Date">
                    <Field name="date" type="date" readOnly component={Input} />
                  </FormItem>
                  <FormItem
                    label="Valid Until *"
                    invalid={!!errors.validUntil && touched.validUntil}
                    errorMessage={errors.validUntil as string}
                  >
                    <Field name="validUntil">
                      {({ field, form }: any) => (
                        <DatePicker
                          placeholder="Select date"
                          value={field.value}
                          onChange={(date) => {
                            form.setFieldValue(field.name, date);
                          }}
                        />
                      )}
                    </Field>
                  </FormItem> */}
                </div>
              </AdaptableCard>

              {/* Scope of Work Section */}
              <AdaptableCard divider className="mb-4">
                <h5>Scope of Work</h5>
                <FieldArray name="scopeOfWork">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.scopeOfWork.map((scope, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <FormItem
                            className="flex-grow"
                            invalid={!!errors.scopeOfWork?.[index] && touched.scopeOfWork?.[index]}
                            errorMessage={errors.scopeOfWork?.[index] as string}
                          >
                            <Field
                              as={Input}
                              name={`scopeOfWork[${index}]`}
                              placeholder="Scope of work item"
                            />
                          </FormItem>
                          <Button
                            type="button"
                            size="sm"
                            variant="plain"
                            color="red"
                            icon={<HiOutlineTrash />}
                            onClick={() => remove(index)}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="twoTone"
                        icon={<HiOutlinePlus />}
                        onClick={() => push('')}
                      >
                        Add Scope Item
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </AdaptableCard>

              {/* Quotation Items Section */}
              <AdaptableCard divider className="mb-4">
                <h5>Quotation Items</h5>
                <FieldArray name="items">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end border-b pb-4">
                          {/* Item Description */}
                          <FormItem
                            label={`Item ${index + 1}`}
                            invalid={!!errors.items?.[index]?.description && touched.items?.[index]?.description}
                            errorMessage={errors.items?.[index]?.description}
                          >
                            <Field
                              as={Input}
                              name={`items[${index}].description`}
                              placeholder="Description"
                              textArea={true}
                            />
                          </FormItem>

                          {/* Unit of Measurement */}
                          <FormItem
                            label="UOM"
                            invalid={!!errors.items?.[index]?.uom && touched.items?.[index]?.uom}
                            errorMessage={errors.items?.[index]?.uom}
                          >
                            <Field name={`items[${index}].uom`}>
                              {({ field, form }: any) => (
                                <Select
                                  options={measurementUnits}
                                  value={measurementUnits.find(option => option.value === field.value) || null}
                                  onChange={(option: any) => {
                                    form.setFieldValue(field.name, option?.value || '');
                                  }}
                                  placeholder="Select unit"
                                />
                              )}
                            </Field>
                          </FormItem>

                          {/* Quantity */}
                          <FormItem
                            label="Qty"
                            invalid={!!errors.items?.[index]?.quantity && touched.items?.[index]?.quantity}
                            errorMessage={errors.items?.[index]?.quantity}
                          >
                            <Field
                              type="number"
                              name={`items[${index}].quantity`}
                              placeholder="Quantity"
                              component={Input}
                              min={0}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = parseFloat(e.target.value) || 0;
                                setFieldValue(`items[${index}].quantity`, value);
                              }}
                            />
                          </FormItem>

                          {/* Unit Price */}
                          <FormItem
                            label="Unit Price"
                            invalid={!!errors.items?.[index]?.unitPrice && touched.items?.[index]?.unitPrice}
                            errorMessage={errors.items?.[index]?.unitPrice}
                          >
                            <Field
                              type="number"
                              name={`items[${index}].unitPrice`}
                              placeholder="Unit price"
                              component={Input}
                              min={0}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = parseFloat(e.target.value) || 0;
                                setFieldValue(`items[${index}].unitPrice`, value);
                              }}
                            />
                          </FormItem>

                          {/* Total Price */}
                          <FormItem label="Total">
                            <Input
                              readOnly
                              value={(item.quantity * item.unitPrice).toFixed(2)}
                              placeholder="Total"
                            />
                          </FormItem>

                          {/* File Upload and Actions */}
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-end">
                              {values.items.length > 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="plain"
                                  color="red"
                                  icon={<HiOutlineTrash />}
                                  onClick={() => {
                                    remove(index);
                                    const newFiles = [...files];
                                    newFiles.splice(index, 1);
                                    setFiles(newFiles);
                                    if (existingImages[index]) {
                                      const newExistingImages = {...existingImages};
                                      delete newExistingImages[index];
                                      setExistingImages(newExistingImages);
                                    }
                                  }}
                                />
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileChange(index, e.target.files[0]);
                                } else {
                                  handleFileChange(index, null);
                                }
                              }}
                              className="text-sm"
                            />
                            {(existingImages[index] || (item.image?.url)) && (
                              <div className="mt-1">
                                <img 
                                  src={existingImages[index] || item.image?.url} 
                                  alt="Item" 
                                  className="h-10 w-10 object-cover rounded"
                                />
                              </div>
                            )}
                          </div>  
                        </div>
                      ))}

                      <Button
                        type="button"
                        size="sm"
                        variant="twoTone"
                        icon={<HiOutlinePlus />}
                        onClick={() => {
                          push({ description: '', uom: '', quantity: 0, unitPrice: 0, totalPrice: 0 });
                          setFiles([...files, null]);
                        }}
                      >
                        Add Item
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </AdaptableCard>

              {/* Terms & Conditions Section */}
              <AdaptableCard divider className="mb-4">
                <h5>Terms & Conditions</h5>
                <FieldArray name="termsAndConditions">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.termsAndConditions.map((term, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <FormItem
                            className="flex-grow"
                            invalid={!!errors.termsAndConditions?.[index] && touched.termsAndConditions?.[index]}
                            errorMessage={errors.termsAndConditions?.[index] as string}
                          >
                            {index < 2 ? (
                              <Field name={`termsAndConditions[${index}]`}>
                                {({ field, form }: any) => (
                                  <Select
                                    options={index === 0 ? termsCategories : termsTypes}
                                    value={(index === 0 ? termsCategories : termsTypes)
                                      .find(option => option.value === field.value) || null}
                                    onChange={(option: any) => {
                                      form.setFieldValue(field.name, option?.value || '');
                                    }}
                                    placeholder={index === 0 ? 'Select work start term' : 'Select payment term'}
                                  />
                                )}
                              </Field>
                            ) : (
                              <Field
                                as={Input}
                                name={`termsAndConditions[${index}]`}
                                placeholder="Additional term or condition"
                              />
                            )}
                          </FormItem>
                          <Button
                            type="button"
                            size="sm"
                            variant="plain"
                            color="red"
                            icon={<HiOutlineTrash />}
                            onClick={() => remove(index)}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="twoTone"
                        icon={<HiOutlinePlus />}
                        onClick={() => push('')}
                      >
                        Add Term
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </AdaptableCard>

              {/* Financial Summary Section */}
              <AdaptableCard divider className="mb-4">
                <h5>Financial Summary</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormItem label="Subtotal">
                    <Input
                      readOnly
                      value={values.subtotal.toFixed(2)}
                      placeholder="Subtotal"
                    />
                  </FormItem>
                  <FormItem
                    label="VAT Percentage"
                    invalid={!!errors.vatPercentage && touched.vatPercentage}
                    errorMessage={errors.vatPercentage as string}
                  >
                    <Field
                      as={Input}
                      type="number"
                      name="vatPercentage"
                      placeholder="VAT percentage"
                      min={0}
                      max={100}
                    />
                  </FormItem>
                  <FormItem label="VAT Amount">
                    <Input
                      readOnly
                      value={values.vatAmount.toFixed(2)}
                      placeholder="VAT amount"
                    />
                  </FormItem>
                  <FormItem label="Net Amount">
                    <Input
                      readOnly
                      value={values.netAmount.toFixed(2)}
                      placeholder="Net amount"
                    />
                  </FormItem>
                </div>
              </AdaptableCard>

              {/* Footer with Action Buttons */}
              <StickyFooter
                className="-mx-8 px-8 flex items-center justify-between py-4"
                stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <div>
                  <Button
                    size="sm"
                    className="ltr:mr-3 rtl:ml-3"
                    type="button"
                    onClick={onDiscard}
                  >
                    Discard
                  </Button>
                </div>
                <div className='md:flex grid-2 gap-2'>
                  <Button
                    size="sm"
                    variant="solid"
                    loading={isSubmitting}
                    type="submit"
                  >
                    {quotationId ? 'Update Quotation' : 'Create Quotation'}
                  </Button>
                </div>
              </StickyFooter>
            </FormContainer>
          </Form>
        );
      }}
    </Formik>
  );
});

QuotationForm.displayName = 'QuotationForm';

export default QuotationForm;