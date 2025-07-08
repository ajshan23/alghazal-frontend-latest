import { FC, useState } from 'react'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { deleteBill } from '../../api/api';

type BillType = "general" | "fuel" | "mess" | "vehicle" | "accommodation";

type DeleteProps = {
    isOpen: boolean
    onClose: () => void
    bill: {
        _id: string
        invoiceNo?: string
        shop?: {
            shopName: string
        }
        vehicle?: {
            vehicleNumber: string
        }
        accommodation?: {
            location: string
        }
        billType: BillType
    } | null
    refetch: () => void
}

const BillDeleteConfirmation: FC<DeleteProps> = ({
    isOpen,
    onClose,
    bill,
    refetch,
}) => {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!isOpen || !bill) return null

    const getTitle = () => {
        switch (bill.billType) {
            case 'general':
                return `Delete General Bill ${bill.invoiceNo ? `#${bill.invoiceNo}` : ''}`
            case 'fuel':
                return `Delete Fuel Bill`
            case 'mess':
                return `Delete Mess Bill`
            case 'vehicle':
                return `Delete Vehicle Bill ${bill.vehicle?.vehicleNumber ? `(Vehicle ${bill.vehicle.vehicleNumber})` : ''}`
            case 'accommodation':
                return `Delete Accommodation Bill ${bill.accommodation?.location ? `(${bill.accommodation.location})` : ''}`
            default:
                return 'Delete Bill'
        }
    }

    const getDescription = () => {
        switch (bill.billType) {
            case 'general':
                return `Are you sure you want to delete this general bill${bill.invoiceNo ? ` (Invoice #${bill.invoiceNo})` : ''}? This action cannot be undone.`
            case 'fuel':
                return `Are you sure you want to delete this fuel bill? This action cannot be undone.`
            case 'mess':
                return `Are you sure you want to delete this mess bill? This action cannot be undone.`
            case 'vehicle':
                return `Are you sure you want to delete this vehicle bill${bill.vehicle?.vehicleNumber ? ` for vehicle ${bill.vehicle.vehicleNumber}` : ''}? This action cannot be undone.`
            case 'accommodation':
                return `Are you sure you want to delete this accommodation bill${bill.accommodation?.location ? ` for ${bill.accommodation.location}` : ''}? This action cannot be undone.`
            default:
                return 'Are you sure you want to delete this bill? This action cannot be undone.'
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteBill(bill._id)
            refetch()
            toast.push(
                <Notification
                    title={`${getTitle()} deleted successfully`}
                    type="success"
                    duration={2500}
                >
                    The bill has been successfully deleted.
                </Notification>,
                { placement: 'top-center' }
            )
            onClose()
        } catch (error: any) {
            console.error('Delete failed:', error)
            toast.push(
                <Notification
                    title={`Failed to delete ${getTitle()}`}
                    type="danger"
                    duration={2500}
                >
                    {error?.response?.data?.message || error.message || 'Something went wrong'}
                </Notification>,
                { placement: 'top-center' }
            )
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <ConfirmDialog
            isOpen={isOpen}
            type="danger"
            title={getTitle()}
            confirmButtonColor="red-600"
            onClose={onClose}
            onRequestClose={onClose}
            onCancel={onClose}
            onConfirm={handleDelete}
            confirmButtonDisabled={isDeleting}
        >
            <p>{getDescription()}</p>
            {isDeleting && (
                <div className="mt-4 flex justify-center">
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </ConfirmDialog>
    )
}

export default BillDeleteConfirmation