import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import Logo from '@/components/template/Logo';
import { Notification, toast } from '@/components/ui';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useAppSelector } from '@/store';
import dayjs from 'dayjs';
import { fetchInvoiceData, downloadInvoicePdf } from '../../api/api';
import ContentTable from './ContentTable';

type InvoiceData = {
    _id: string;
    invoiceNumber: string;
    date: string;
    orderNumber: string;
    vendor: {
        name: string;
        poBox: string;
        address: string;
        phone: string;
        fax: string;
        trn: string;
    };
    vendee: {
        name: string;
        contactPerson: string;
        poBox: string;
        address: string;
        phone: string;
        fax: string;
        trn: string;
        grnNumber: string;
        supplierNumber: string;
        servicePeriod: string;
    };
    subject: string;
    paymentTerms: string;
    amountInWords: string;
    products: Array<{
        sno: number;
        description: string;
        qty: number;
        unitPrice: number;
        total: number;
    }>;
    summary: {
        amount: number;
        vat: number;
        totalReceivable: number;
    };
    preparedBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
};

const InvoiceContent = () => {
    const { textTheme } = useThemeClass();
    const mode = useAppSelector((state) => state.theme.mode);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<InvoiceData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const { projectId } = useParams();

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!projectId) {
                throw new Error('Project ID is required');
            }

            const response = await fetchInvoiceData(projectId);
            
            // Basic validation of required fields
            if (!response || 
                !response.invoiceNumber || 
                !response.vendor || 
                !response.vendee || 
                !Array.isArray(response.products)) {
                throw new Error('Invalid invoice data received from server');
            }

            setData(response);
        } catch (err) {
            console.error('Error fetching invoice data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load invoice data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const handleDownloadPdf = async () => {
        if (!projectId) {
            toast.push(
                <Notification title="Error" type="danger">
                    Project ID is required
                </Notification>
            );
            return;
        }

        setPdfLoading(true);
        setError(null);
        
        try {
            const pdfBlob = await downloadInvoicePdf(projectId);
            
            const url = window.URL.createObjectURL(new Blob([pdfBlob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${data?.invoiceNumber || projectId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.push(
                <Notification title="Success" type="success">
                    PDF downloaded successfully
                </Notification>
            );
        } catch (error) {
            console.error('PDF download error:', error);
            setError('Failed to download PDF');
            toast.push(
                <Notification title="Error" type="danger">
                    Failed to download PDF
                </Notification>
            );
        } finally {
            setPdfLoading(false);
        }
    };

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                {error}
                <Button className="mt-4" onClick={fetchData}>
                    Retry
                </Button>
            </div>
        );
    }

    if (loading || !data) {
        return <Loading loading={true} />;
    }

    return (
        <div className="print:p-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div>
                    <Logo className="mb-3" mode={mode} />
                    <h2 className="text-2xl font-bold mb-4">TAX INVOICE</h2>
                </div>
                <div className="my-4">
                    <div className="mb-2">
                        <div className="flex justify-between">
                            <span>PO Box No: {data.vendor.poBox}</span>
                            <span>Date: {dayjs(data.date).format('DD/MM/YYYY')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Dubai, UAE</span>
                            <span>INV #: {data.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Website: www.alghazalgroup.com</span>
                            <span>Order No: {data.orderNumber}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-b border-gray-200 dark:border-gray-600 py-4 my-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold mb-2">Vendee</h4>
                        <p className="whitespace-pre-line">
                            {data.vendee.name}
                            <br />
                            {data.vendee.contactPerson}
                            <br />
                            {data.vendee.address}
                            <br />
                            PB {data.vendee.poBox}
                            <br />
                            Phone: {data.vendee.phone}
                            <br />
                            Fax: {data.vendee.fax}
                            <br />
                            TRN#: {data.vendee.trn}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2">Vendor</h4>
                        <p className="whitespace-pre-line">
                            {data.vendor.name}
                            <br />
                            PB: {data.vendor.poBox} {data.vendor.address}
                            <br />
                            Phone: {data.vendor.phone}
                            <br />
                            TRN#: {data.vendor.trn}
                            <br />
                            GRN Number: {data.vendee.grnNumber}
                            <br />
                            Supplier No.: {data.vendee.supplierNumber}
                            <br />
                            Service Period: {data.vendee.servicePeriod}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="my-6">
                <h4 className="font-bold">Subject:</h4>
                <p>{data.subject}</p>
            </div>
            
            <div className="my-6">
                <ContentTable products={data.products} summary={data.summary} />
            </div>
            
            <div className="my-6">
                <h4 className="font-bold mb-2">Comments or special instructions</h4>
                <p>Payment: {data.paymentTerms}</p>
                <p>Amt in Words: {data.amountInWords}</p>
            </div>
            
            <div className="mt-8">
                {/* <div className="flex justify-end">
                    <div className="text-center">
                        <p className="font-bold">Approved by:</p>
                        <p className="mt-8">Signature: ___________________</p>
                    </div>
                </div> */}
            </div>

            <div className="print:hidden mt-6 flex items-center justify-end">
                <Button 
                    variant="solid" 
                    loading={pdfLoading}
                    onClick={handleDownloadPdf}
                >
                    {pdfLoading ? 'Generating PDF...' : 'Download Invoice'}
                </Button>
            </div>
        </div>
    );
};

export default InvoiceContent;