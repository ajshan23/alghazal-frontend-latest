import { forwardRef, useState, useEffect } from 'react'
import { FormContainer, FormItem } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import StickyFooter from '@/components/shared/StickyFooter'
import { Field, Form, Formik, FormikProps, FieldProps } from 'formik'
import { AiOutlineSave } from 'react-icons/ai'
import { HiOutlineTrash } from 'react-icons/hi'
import * as Yup from 'yup'
import { Input, Upload } from '@/components/ui'
import { AdaptableCard } from '@/components/shared'
import Select from '@/components/ui/Select'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

type FormikRef = FormikProps<any>

const ShopOptions = [
    { label: 'Shop A (SHOP001)', value: 'SHOP001' },
    { label: 'Shop B (SHOP002)', value: 'SHOP002' },
    { label: 'Shop C (SHOP003)', value: 'SHOP003' },
    { label: 'Shop D (SHOP004)', value: 'SHOP004' },
]

const PaymentMethodOptions = [
    { label: 'ADCB', value: 'adcb' },
    { label: 'ADIB', value: 'adib' },
    { label: 'Cash', value: 'cash' },
    { label: 'MASHREQ CARD', value: 'masherq_card' },
]

type InitialData = {
    shopName?: string
    shopNo?: string
    invoiceNumber?: string
    paymentMethod?: string
    invoiceAttachment?: string | File
}

export type FormModel = InitialData

export type SetSubmitting = (isSubmitting: boolean) => void
export type OnDeleteCallback = React.Dispatch<React.SetStateAction<boolean>>
type OnDelete = (callback: OnDeleteCallback) => void

type MessBillForm = {
    initialData?: InitialData
    type: 'edit' | 'new'
    onDiscard?: () => void
    onDelete?: OnDelete
    onFormSubmit: (formData: FormData, setSubmitting: SetSubmitting) => Promise<any>
}

const MessBillForm = forwardRef<FormikRef, MessBillForm>((props, ref) => {
    const {
        type,
        initialData = {
            shopName: '',
            shopNo: '',
            invoiceNumber: '',
            paymentMethod: '',
            invoiceAttachment: ''
        },
        onFormSubmit,
        onDiscard,
        onDelete,
    } = props

    const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
    const [existingInvoice, setExistingInvoice] = useState<string>(initialData.invoiceAttachment as string || '')

    useEffect(() => {
        setExistingInvoice(initialData.invoiceAttachment as string || '')
    }, [initialData])

    const validationSchema = Yup.object().shape({
        shopName: Yup.string().required('Shop Name is required'),
        shopNo: Yup.string().required('Shop Number is required'),
        paymentMethod: Yup.string().required('Payment Method is required'),
    })

    return (
        <Formik
            innerRef={ref}
            initialValues={{
                ...initialData,
                shopName: initialData.shopName,
                paymentMethod: initialData.paymentMethod,
                shopNo: initialData.shopName ? 
                    ShopOptions.find(shop => shop.value === initialData.shopName)?.label.split('(')[1].replace(')', '') || '' 
                    : ''
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
                const formData = new FormData()
                
                formData.append('shopName', values.shopName || '')
                formData.append('shopNo', values.shopNo || '')
                formData.append('paymentMethod', values.paymentMethod || '')
                
                if (values.invoiceNumber) {
                    formData.append('invoiceNumber', values.invoiceNumber)
                }

                if (invoiceFile) {
                    formData.append('invoiceAttachment', invoiceFile)
                }

                if (type === 'edit' && existingInvoice && !invoiceFile) {
                    formData.append('existingInvoice', existingInvoice)
                }

                try {
                    await onFormSubmit(formData, setSubmitting)
                } catch (error: any) {
                    setSubmitting(false)
                    if (error.message?.includes("Shop already exists")) {
                        setErrors({ shopName: "This shop already exists" })
                    }
                }
            }}
            enableReinitialize={true}
        >
            {({ values, touched, errors, isSubmitting, setFieldValue }) => {
                const handleInvoiceChange = (files: File[]) => {
                    if (files.length > 0) {
                        setInvoiceFile(files[0])
                        setFieldValue('invoiceAttachment', files[0].name)
                        setExistingInvoice('')
                    } else {
                        setInvoiceFile(null)
                        setFieldValue('invoiceAttachment', existingInvoice || '')
                    }
                }

                const handleInvoiceRemove = () => {
                    setInvoiceFile(null)
                    setFieldValue('invoiceAttachment', '')
                    setExistingInvoice('')
                }

                const handleShopChange = (shopValue: string) => {
                    setFieldValue('shopName', shopValue)
                    const shopNo = ShopOptions.find(shop => shop.value === shopValue)?.label.split('(')[1].replace(')', '') || ''
                    setFieldValue('shopNo', shopNo)
                }

                return (
                    <Form>
                        <FormContainer>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">
                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Shop Information</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="Shop Name"
                                                invalid={!!(errors.shopName && touched.shopName)}
                                                errorMessage={errors.shopName as string}
                                            >
                                                <Field name="shopName">
                                                    {({ field, form }: FieldProps) => (
                                                        <Select
                                                            placeholder="Select Shop"
                                                            field={field}
                                                            form={form}
                                                            options={ShopOptions}
                                                            value={ShopOptions.find(
                                                                (shop) => shop.value === values.shopName
                                                            )}
                                                            onChange={(option) => {
                                                                handleShopChange(option?.value || '')
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Shop Number"
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="shopNo"
                                                    component={Input}
                                                    disabled
                                                />
                                            </FormItem>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormItem
                                                label="Payment Method"
                                                invalid={!!(errors.paymentMethod && touched.paymentMethod)}
                                                errorMessage={errors.paymentMethod as string}
                                            >
                                                <Field name="paymentMethod">
                                                    {({ field, form }: FieldProps) => (
                                                        <Select
                                                            placeholder="Select Payment Method"
                                                            field={field}
                                                            form={form}
                                                            options={PaymentMethodOptions}
                                                            value={PaymentMethodOptions.find(
                                                                (method) => method.value === values.paymentMethod
                                                            )}
                                                            onChange={(option) => {
                                                                form.setFieldValue(field.name, option?.value || '')
                                                            }}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>

                                            <FormItem
                                                label="Invoice Number"
                                            >
                                                <Field
                                                    type="text"
                                                    autoComplete="off"
                                                    name="invoiceNumber"
                                                    placeholder="Invoice Number"
                                                    component={Input}
                                                />
                                            </FormItem>
                                        </div>
                                    </AdaptableCard>

                                    <AdaptableCard divider className="mb-4">
                                        <h5 className="mb-4">Invoice Attachment</h5>
                                        <FormItem
                                            label="Invoice File"
                                        >
                                            <Upload 
                                                onChange={handleInvoiceChange}
                                                onFileRemove={handleInvoiceRemove}
                                                uploadLimit={1}
                                                defaultFile={
                                                    existingInvoice 
                                                        ? [{ 
                                                            name: 'Invoice_Attachment', 
                                                            url: existingInvoice 
                                                          }]
                                                        : []
                                                }
                                                fileList={invoiceFile ? [invoiceFile] : []}
                                                accept=".pdf,.png,.jpeg,.jpg"
                                            />
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
                                        <DeleteShopButton
                                            onDelete={onDelete as OnDelete}
                                        />
                                    )}
                                </div>
                                <div className="md:flex items-center">
                                    <Button
                                        size="sm"
                                        className="ltr:mr-3 rtl:ml-3"
                                        type="button"
                                        onClick={() => onDiscard?.()}
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
                )
            }}
        </Formik>
    )
})

MessBillForm.displayName = 'MessBillForm'

const DeleteShopButton = ({ onDelete }: { onDelete: OnDelete }) => {
    const [dialogOpen, setDialogOpen] = useState(false)

    const onConfirmDialog = () => {
        setDialogOpen(false)
        onDelete?.(setDialogOpen)
    }

    const onDialogClose = () => {
        setDialogOpen(false)
    }

    return (
        <>
            <Button
                className="text-red-600"
                variant="plain"
                size="sm"
                icon={<HiOutlineTrash />}
                type="button"
                onClick={() => setDialogOpen(true)}
            >
                Delete
            </Button>
            <ConfirmDialog
                isOpen={dialogOpen}
                type="danger"
                title="Delete Shop Entry"
                confirmButtonColor="red-600"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
                onCancel={onDialogClose}
                onConfirm={onConfirmDialog}
            >
                <p>Are you sure you want to delete this shop entry?</p>
            </ConfirmDialog>
        </>
    )
}

export default MessBillForm