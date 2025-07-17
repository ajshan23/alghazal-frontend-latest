import { forwardRef, useEffect, useState } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import * as Yup from 'yup'
import { Input, Select } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import DatePicker from '@/components/ui/DatePicker'
import { fetchUser } from '../api/api'

type FormikRef = FormikProps<any>

type InitialData = {
    name: string
    designation: string
    emiratesId: string
    labourCard: string
    labourCardPersonalNo: string
    period: string
    basicSalary: number
    allowances: number
    deductions: number
    mess: number
    advance: number
    netSalary: number
    paymentDate: Date | string
    status: string
    remark: string
}

export type FormModel = Omit<InitialData, 'paymentDate'> & { 
    paymentDate: Date
}

const today = new Date()

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type PayrollFormProps = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (
        formData: FormModel,
        setSubmitting: SetSubmitting,
    ) => Promise<any>
}

type UserOption = {
    value: string
    label: string
    role: string
    emiratesId: string
    labourCard: string
    labourCardPersonalNo: string
}

const PayrollForm = forwardRef<FormikRef, PayrollFormProps>((props, ref) => {
    const {
        type,
        initialData = {
            employee: '',
            designation: '',
            emiratesId: '',
            labourCard: '',
            labourCardPersonalNo: '',
            period: '',
            basicSalary: 0,
            allowances: 0,
            deductions: 0,
            mess: 0,
            advance: 0,
            netSalary: 0,
            paymentDate: new Date(),
            status: 'pending',
            remark: ''
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const [userOptions, setUserOptions] = useState<UserOption[]>([])


    console.log(userOptions,"123 userOptions")
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetchUser(); // Your API call
                console.log(response, "123 response");
                
                const options = response.data?.users.map((user: any) => ({
                    value: user._id,
                    label: `${user.firstName} ${user.lastName}`,
                    role: user.role,
                    emiratesId: user.emiratesId || '',
        
                }));
                
                setUserOptions(options);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };
    
        fetchUsers();
    }, []);

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Employee name is required'),
        designation: Yup.string()
            .required('Designation is required'),
        emiratesId: Yup.string()
            .required('Emirates ID is required'),
        labourCard: Yup.string()
            .required('Labour Card is required'),
        labourCardPersonalNo: Yup.string()
            .required('Labour Card Personal No is required'),
        period: Yup.string()
            .required('Period is required'),
        basicSalary: Yup.number()
            .required('Basic salary is required')
            .positive('Basic salary must be positive')
            .typeError('Basic salary must be a number'),
        allowances: Yup.number()
            .min(0, 'Allowances cannot be negative')
            .typeError('Allowances must be a number'),
        deductions: Yup.number()
            .min(0, 'Deductions cannot be negative')
            .typeError('Deductions must be a number'),
        mess: Yup.number()
            .min(0, 'Mess cannot be negative')
            .typeError('Mess must be a number'),
        advance: Yup.number()
            .min(0, 'Advance cannot be negative')
            .typeError('Advance must be a number'),
        netSalary: Yup.number()
            .required('Net salary is required')
            .typeError('Net salary must be a number'),
        paymentDate: Yup.date()
            .required('Payment date is required')
            .typeError('Please select a valid date'),
        status: Yup.string()
            .required('Status is required')
            .oneOf(['pending', 'paid', 'cancelled'], 'Invalid status'),
        remark: Yup.string()
            .max(500, 'Remark must be at most 500 characters'),
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                employee: initialData.employee || '',
                designation: initialData.designation || '',
                emiratesId: initialData.emiratesId || '',
                labourCard: initialData.labourCard || '',
                labourCardPersonalNo: initialData.labourCardPersonalNo || '',
                period: initialData.period || '',
                basicSalary: initialData.basicSalary || 0,
                allowances: initialData.allowances || 0,
                deductions: initialData.deductions || 0,
                mess: initialData.mess || 0,
                advance: initialData.advance || 0,
                netSalary: initialData.netSalary || 0,
                paymentDate: initialData.paymentDate instanceof Date 
                    ? initialData.paymentDate 
                    : new Date(initialData.paymentDate),
                status: initialData.status || 'pending',
                remark: initialData.remark || '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
                try {
                    await onFormSubmit(values as FormModel, setSubmitting)
                } catch (error: any) {
                    setSubmitting(false)
                    if (error.response?.data?.errors) {
                        setErrors(error.response.data.errors)
                    }
                    console.error('Form submission error:', error)
                }
            }}
            enableReinitialize={true}
        >
            {({
                values,
                touched,
                errors,
                isSubmitting,
                setFieldValue,
                handleBlur,
                resetForm,
            }) => (
                <Form>
                    <FormContainer>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Employee Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <FormItem
                                            label="EMPLOYEE"
                                            invalid={!!errors.employee}
                                            errorMessage={errors.employee as string}
                                        >
                                            <Select
                                                name="employee"
                                                placeholder="Select user"
                                                value={userOptions.find(opt => opt.label === values.name)}
                                                options={userOptions}
                                                onChange={(option) => {
                                                    setFieldValue("employee", option?.label);
                                                    setFieldValue("designation", option?.role);
                                                    setFieldValue("emiratesId", option?.emiratesId);
                                             
                                                }}
                                                onBlur={handleBlur}
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="DESIGNATION"
                                            invalid={!!errors.designation}
                                            errorMessage={errors.designation as string}
                                        >
                                            <Input
                                                name="designation"
                                                value={values.designation}
                                                readOnly
                                                onBlur={handleBlur}
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="EMIRATES ID"
                                            invalid={!!errors.emiratesId}
                                            errorMessage={errors.emiratesId as string}
                                        >
                                            <Input
                                                name="emiratesId"
                                                value={values.emiratesId}
                                                readOnly
                                                onBlur={handleBlur}
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="LABOUR CARD"
                                            invalid={!!errors.labourCard}
                                            errorMessage={errors.labourCard as string}
                                        >
                                            <Input
                                                name="labourCard"
                                                value={values.labourCard}
                                                readOnly
                                                onBlur={handleBlur}
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="LABOUR CARD PERSONAL NO"
                                            invalid={!!errors.labourCardPersonalNo}
                                            errorMessage={errors.labourCardPersonalNo as string}
                                        >
                                            <Input
                                                name="labourCardPersonalNo"
                                                value={values.labourCardPersonalNo}
                                                readOnly
                                                onBlur={handleBlur}
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="PERIOD"
                                            invalid={!!errors.period}
                                            errorMessage={errors.period as string}
                                        >
                                            <Field name="period">
                                                {({ field }: FieldProps) => (
                                                    <Input
                                                        autoComplete="off"
                                                        placeholder="e.g. January 2023"
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Salary Details</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Basic Salary"
                                            invalid={!!errors.basicSalary && touched.basicSalary}
                                            errorMessage={errors.basicSalary as string}
                                        >
                                            <Field name="basicSalary">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Basic Salary"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(field.name, e.target.value);
                                                            // Auto-calculate net salary
                                                            const basic = parseFloat(e.target.value) || 0;
                                                            const allowances = parseFloat(values.allowances) || 0;
                                                            const deductions = parseFloat(values.deductions) || 0;
                                                            const mess = parseFloat(values.mess) || 0;
                                                            const advance = parseFloat(values.advance) || 0;
                                                            const netSalary = basic + allowances - deductions - mess - advance;
                                                            form.setFieldValue('netSalary', netSalary);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Allowances"
                                            invalid={!!errors.allowances && touched.allowances}
                                            errorMessage={errors.allowances as string}
                                        >
                                            <Field name="allowances">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Allowances"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(field.name, e.target.value);
                                                            const basic = parseFloat(values.basicSalary) || 0;
                                                            const allowances = parseFloat(e.target.value) || 0;
                                                            const deductions = parseFloat(values.deductions) || 0;
                                                            const mess = parseFloat(values.mess) || 0;
                                                            const advance = parseFloat(values.advance) || 0;
                                                            const netSalary = basic + allowances - deductions - mess - advance;
                                                            form.setFieldValue('netSalary', netSalary);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Deductions"
                                            invalid={!!errors.deductions && touched.deductions}
                                            errorMessage={errors.deductions as string}
                                        >
                                            <Field name="deductions">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Deductions"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(field.name, e.target.value);
                                                            const basic = parseFloat(values.basicSalary) || 0;
                                                            const allowances = parseFloat(values.allowances) || 0;
                                                            const deductions = parseFloat(e.target.value) || 0;
                                                            const mess = parseFloat(values.mess) || 0;
                                                            const advance = parseFloat(values.advance) || 0;
                                                            const netSalary = basic + allowances - deductions - mess - advance;
                                                            form.setFieldValue('netSalary', netSalary);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="MESS"
                                            invalid={!!errors.mess && touched.mess}
                                            errorMessage={errors.mess as string}
                                        >
                                            <Field name="mess">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Mess"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(field.name, e.target.value);
                                                            const basic = parseFloat(values.basicSalary) || 0;
                                                            const allowances = parseFloat(values.allowances) || 0;
                                                            const deductions = parseFloat(values.deductions) || 0;
                                                            const mess = parseFloat(e.target.value) || 0;
                                                            const advance = parseFloat(values.advance) || 0;
                                                            const netSalary = basic + allowances - deductions - mess - advance;
                                                            form.setFieldValue('netSalary', netSalary);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="ADVANCE"
                                            invalid={!!errors.advance && touched.advance}
                                            errorMessage={errors.advance as string}
                                        >
                                            <Field name="advance">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Advance"
                                                        {...field}
                                                        onChange={(e) => {
                                                            form.setFieldValue(field.name, e.target.value);
                                                            const basic = parseFloat(values.basicSalary) || 0;
                                                            const allowances = parseFloat(values.allowances) || 0;
                                                            const deductions = parseFloat(values.deductions) || 0;
                                                            const mess = parseFloat(values.mess) || 0;
                                                            const advance = parseFloat(e.target.value) || 0;
                                                            const netSalary = basic + allowances - deductions - mess - advance;
                                                            form.setFieldValue('netSalary', netSalary);
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="NET"
                                            invalid={!!errors.netSalary && touched.netSalary}
                                            errorMessage={errors.netSalary as string}
                                        >
                                            <Field name="netSalary">
                                                {({ field }: FieldProps) => (
                                                    <Input
                                                        type="number"
                                                        autoComplete="off"
                                                        placeholder="Net Salary"
                                                        {...field}
                                                        readOnly
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Payment Information</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormItem
                                            label="Payment Date"
                                            invalid={!!errors.paymentDate && touched.paymentDate}
                                            errorMessage={errors.paymentDate as string}
                                        >
                                            <Field name="paymentDate">
                                                {({ field, form }: FieldProps) => {
                                                    const dateValue = field.value && !isNaN(new Date(field.value).getTime())
                                                        ? new Date(field.value)
                                                        : null
                                                    
                                                    return (
                                                        <DatePicker
                                                            placeholder="Select Payment Date"
                                                            value={dateValue}
                                                            onChange={(date) => form.setFieldValue(field.name, date || null)}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label="Status"
                                            invalid={!!errors.status && touched.status}
                                            errorMessage={errors.status as string}
                                        >
                                            <Field name="status">
                                                {({ field }: FieldProps) => (
                                                    <Select
                                                        placeholder="Select Status"
                                                        {...field}
                                                        options={[
                                                            { value: 'pending', label: 'Pending' },
                                                            { value: 'paid', label: 'Paid' },
                                                            { value: 'cancelled', label: 'Cancelled' },
                                                        ]}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </AdaptableCard>

                                <AdaptableCard divider className="mb-4">
                                    <h5 className="mb-4">Remarks</h5>
                                    <FormItem
                                        label="REMARK"
                                        invalid={!!errors.remark && touched.remark}
                                        errorMessage={errors.remark as string}
                                    >
                                        <Field name="remark">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    as="textarea"
                                                    autoComplete="off"
                                                    placeholder="Enter remarks"
                                                    {...field}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </AdaptableCard>
                            </div>
                        </div>

                        <StickyFooter
                            className="-mx-8 px-8 flex items-center justify-between py-4"
                            stickyClass="border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        >
                            <div>
                                {type === 'edit' && onDelete && (
                                    <Button
                                        size="sm"
                                        variant="plain"
                                        color="red"
                                        icon={<HiOutlineTrash />}
                                        type="button"
                                        onClick={() => onDelete((shouldDelete) => {
                                            if (shouldDelete) {
                                                resetForm()
                                            }
                                        })}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                            <div className="md:flex items-center">
                                <Button
                                    size="sm"
                                    className="ltr:mr-3 rtl:ml-3"
                                    type="button"
                                    onClick={() => {
                                        resetForm()
                                        onDiscard?.()
                                    }}
                                >
                                    Discard
                                </Button>
                                <Button
                                    size="sm"
                                    variant="solid"
                                    loading={isSubmitting}
                                    icon={<AiOutlineSave />}
                                    type="submit"
                                >
                                    Save
                                </Button>
                            </div>
                        </StickyFooter>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
})

PayrollForm.displayName = 'PayrollForm'

export default PayrollForm