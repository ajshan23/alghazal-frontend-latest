import { useState, useMemo, useRef } from 'react'
import DataTable from '@/components/shared/DataTable'
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate } from 'react-router-dom'
import type {
    DataTableResetHandle,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { getBills } from '../../api/api'
import moment from 'moment'
import BillDeleteConfirmation from './BillDeleteConfirmation'

type Bill = {
    _id: string
    billType: 'general' | 'fuel' | 'mess' | 'vehicle' | 'accommodation'
    billDate: string
    paymentMethod: string
    amount: number
    category: {
        _id: string
        name: string
    }
    shop?: {
        _id: string
        shopName: string
        shopNo:String
    }
    vehicle?: {
        vehicleNumber: string
    }
    accommodation?: {
        location: string
    }
    invoiceNo?: string
    remarks: string
    attachments: string[]
    createdAt: string
    updatedAt: string
}

type Pagination = {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

const paymentMethodColor = {
    adcb: {
        label: 'ADCB',
        dotClass: 'bg-blue-500',
        textClass: 'text-blue-500',
    },
    adib: {
        label: 'ADIB',
        dotClass: 'bg-green-500',
        textClass: 'text-green-500',
    },
    cash: {
        label: 'Cash',
        dotClass: 'bg-purple-500',
        textClass: 'text-purple-500',
    },
    masherq_card: {
        label: 'MASHREQ CARD',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-500',
    },
}

type ActionColumnProps = {
    row: Bill
    onDeleteClick: (bill: Bill) => void
}

const BillTable = () => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
    })
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

    const {
        data: response,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            'bills',
            pagination.page,
            pagination.limit,
            searchTerm,
            dateRange,
        ],
        queryFn: () =>
            getBills({
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                billType: 'general',
            }),
    })

    const bills = response?.data?.bills || []
    const paginationData = response?.data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    }

    const debouncedSearch = useMemo(
        () =>
            debounce((value: string) => {
                setSearchTerm(value)
                setPagination((prev) => ({ ...prev, page: 1 }))
            }, 500),
        [],
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value)
    }

    const handleDateRangeChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'startDate' | 'endDate',
    ) => {
        setDateRange((prev) => ({
            ...prev,
            [type]: e.target.value,
        }))
    }

    const ActionColumn = ({ row, onDeleteClick }: ActionColumnProps) => {
        const { textTheme } = useThemeClass()
        const navigate = useNavigate()
console.log(row,"123")
        return (
            <div className="flex text-lg">
                <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={() => navigate(`/app/bill-attachments`, { 
                    state: { data: row?.attachments } 
                })}
            >
                <HiOutlineEye/>
            </span>
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={() => navigate(`/app/new-gen-bill/${row._id}`)}
                >
                    <HiOutlinePencil />
                </span>
                <span
                    className="cursor-pointer p-2 hover:text-red-500"
                    onClick={() => onDeleteClick(row)}
                >
                    <HiOutlineTrash />
                </span>
            </div>
        )
    }

    const columns: ColumnDef<Bill>[] = useMemo(
        () => [
            {
                header: 'Bill Date',
                accessorKey: 'billDate',
                cell: (props) => (
                    <span>
                        {moment(props.row.original.billDate).format(
                            'DD MMM YYYY',
                        )}
                    </span>
                ),
            },
            {
                header: 'Shop',
                accessorKey: 'shop',
                cell: (props) => (
                    <span>{props.row.original.shop?.shopName || 'N/A'}</span>
                ),
            },
               {
                header: 'Shop Number',
                accessorKey: 'shop Number',
                cell: (props) => (
                    <span>{props.row.original.shop?.shopNo || 'N/A'}</span>
                ),
            },
            {
                header: 'Category',
                accessorKey: 'category',
                cell: (props) => (
                    <span>{props.row.original.category?.name || 'N/A'}</span>
                ),
            },
            {
                header: 'Amount',
                accessorKey: 'amount',
                cell: (props) => (
                    <span> {props.row.original.amount.toFixed(2)}</span>
                ),
            },
            {
                header: 'Payment Method',
                accessorKey: 'paymentMethod',
                cell: (props) => {
                    const method = props.row.original.paymentMethod
                    const payment = paymentMethodColor[
                        method as keyof typeof paymentMethodColor
                    ] || {
                        label: method,
                        dotClass: 'bg-gray-500',
                        textClass: 'text-gray-500',
                    }
                    return (
                        <div className="flex items-center gap-2">
                            <Badge className={payment.dotClass} />
                            <span
                                className={`capitalize font-semibold ${payment.textClass}`}
                            >
                                {payment.label}
                            </span>
                        </div>
                    )
                },
            },
            {
                header: 'Invoice No',
                accessorKey: 'invoiceNo',
                cell: (props) => (
                    <span>{props.row.original.invoiceNo || 'N/A'}</span>
                ),
            },
            {
                header: 'Remarks',
                accessorKey: 'remarks',
                cell: (props) => (
                    <span>{props.row.original.remarks || 'N/A'}</span>
                ),
            },
            {
                header: 'Action',
                id: 'action',
                cell: (props) => (
                    <ActionColumn 
                        row={props.row.original} 
                        onDeleteClick={(bill) => {
                            setSelectedBill(bill)
                            setIsDeleteOpen(true)
                        }} 
                    />
                ),
            },
        ],
        [],
    )

    const onPaginationChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }))
    }

    const onSelectChange = (limit: number) => {
        setPagination((prev) => ({ page: 1, limit }))
    }

    if (error) {
        return <div>Error loading bills: {(error as Error).message}</div>
    }

    return (
        <>
            <div className="mb-4 flex flex-col md:flex-row gap-4">
                <Input
                    placeholder="Search bills..."
                    onChange={handleSearchChange}
                    className="max-w-md"
                />
            </div>

            <DataTable
                ref={tableRef}
                columns={columns}
                data={bills}
                loading={isLoading}
                pagingData={{
                    total: paginationData.total,
                    pageIndex: paginationData.page,
                    pageSize: paginationData.limit,
                }}
                onPaginationChange={onPaginationChange}
                onSelectChange={onSelectChange}
            />
            
            <BillDeleteConfirmation
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                bill={selectedBill}
                refetch={refetch}
            />
        </>
    )
}

export default BillTable