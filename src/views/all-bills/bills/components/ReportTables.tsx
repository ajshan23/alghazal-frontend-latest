import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import DataTable from '@/components/shared/DataTable'
import { 
    HiOutlineEye, 
    HiOutlinePencil, 
    HiOutlineTrash, 
    HiOutlineRefresh, 
    HiOutlineDownload 
} from 'react-icons/hi'
import { FiFilter } from 'react-icons/fi'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useNavigate, useLocation } from 'react-router-dom'
import type {
    DataTableResetHandle,
    ColumnDef,
} from '@/components/shared/DataTable'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import Input from '@/components/ui/Input'
import { exportReportToExcel, getAdibReportAndExpenses } from '../../api/api'
import moment from 'moment'
import BillDeleteConfirmation from './BillDeleteConfirmation'
import BillFilterDrawer from './BillFilterDrawer'

type ReportItem = {
    _id: string
    reportDate: string
    amount: number
    description?: string
    category: {
        name: string
    }
    shop: {
        shopName: string
    }
    remarks: string
    attachments?: any[]
}

type PaginationData = {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

type ActionColumnProps = {
    row: ReportItem
    onDeleteClick: (row: ReportItem) => void
}

type FilterParams = {
    startDate?: string
    endDate?: string
    category?: string
    shop?: string
}

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
]

const generateYears = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 10 }, (_, i) => ({
        value: currentYear - i,
        label: (currentYear - i).toString(),
    }))
}

const ActionColumn = ({ row, onDeleteClick }: ActionColumnProps) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()
    const location = useLocation()

    const reportType = location.pathname.includes('/adib-report-view') ? 'adib' : 'expense'

    const editPaths = {
        adib: '/app/new-adib-report',
        expense: '/app/new-expense-report'
    }

    const handleViewAttachments = () => {
        navigate(`/app/bill-attachments`, {
            state: { data: row?.attachments },
            type: 'report',
        })
    }

    const handleEdit = () => {
        navigate(`${editPaths[reportType]}/${row._id}`)
    }

    return (
        <div className="flex text-lg">
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={handleViewAttachments}
            >
                <HiOutlineEye />
            </span>
            <span
                className={`cursor-pointer p-2 hover:${textTheme}`}
                onClick={handleEdit}
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

interface ReportTablesProps {
    onDropdownSelect: (value: string) => void
}

const ReportTables = ({ onDropdownSelect }: ReportTablesProps) => {
    const tableRef = useRef<DataTableResetHandle>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [month, setMonth] = useState(new Date().getMonth() + 1)
    const [year, setYear] = useState(new Date().getFullYear())
    const [isExporting, setIsExporting] = useState(false)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    })
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filters, setFilters] = useState<FilterParams>({
        startDate: '',
        endDate: '',
        category: '',
        shop: '',
    })
    const location = useLocation()
    
    const getReportTypeFromRoute = useCallback(() => {
        return location.pathname.includes('/adib-report-view') ? 'adib' : 'expense'
    }, [location.pathname])
    
    const reportType = getReportTypeFromRoute()

    const handleApplyFilters = (data: FilterParams) => {
        setFilters(data)
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const { 
        data: response, 
        isLoading, 
        error, 
        refetch 
    } = useQuery({
        queryKey: [
            'reports', 
            reportType, 
            pagination.page, 
            pagination.limit, 
            searchTerm, 
            month, 
            year,
            filters
        ],
        queryFn: () => getAdibReportAndExpenses({
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm,
            category: filters.category,
            shop: filters.shop,
            month,
            year,
            reportType
        }),
        keepPreviousData: true
    })

    const reports = response?.data?.reports || []
    const paginationData = response?.data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
    }

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchTerm(value)
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 500),
        []
    )

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value)
    }

    const handleResetAll = () => {
        setSearchTerm('')
        setMonth(new Date().getMonth() + 1)
        setYear(new Date().getFullYear())
        setFilters({
            startDate: '',
            endDate: '',
            category: '',
            shop: '',
        })
        setPagination({ page: 1, limit: 10 })
        tableRef.current?.resetSorting()
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            // Get all data without pagination limits
            const exportResponse = await exportReportToExcel({
                page: pagination.page,
                limit: pagination.limit, 
                search: searchTerm,
                category: filters.category,
                shop: filters.shop,
                month,
                year,
                reportType,
                export: true // Add this flag if your API supports it
            })
    
            const allReports = exportResponse?.data?.reports || []
            
            if (allReports.length === 0) {
                console.log('No data to export')
                return
            }
    
            // Convert data to CSV format
            const headers = Object.keys(allReports[0]).join(',') + '\n'
            const csvContent = allReports.reduce((content, report) => {
                const row = Object.values(report).join(',') + '\n'
                return content + row
            }, headers)
    
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `reports-${new Date().toISOString()}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            console.log('Data exported successfully')
        } catch (error) {
            console.error('Export failed:', error)
            // You might want to show an error notification here
        } finally {
            setIsExporting(false)
        }
    }

    const handleDeleteClick = (row: ReportItem) => {
        setSelectedReport(row)
        setIsDeleteOpen(true)
    }

    // Define columns based on report type
    const columns: ColumnDef<ReportItem>[] = useMemo(
        () => {
            if (reportType === 'expense') {
                // For expense reports, show only: reportDate, description, amount, remarks
                return [
                    {
                        header: 'DATE',
                        accessorKey: 'reportDate',
                        cell: (props) => (
                            <span>
                                {moment(props.row.original.reportDate).format(
                                    'DD MMM YYYY',
                                )}
                            </span>
                        ),
                    },
                    {
                        header: 'Description',
                        accessorKey: 'description',
                        cell: (props) => <span>{props.row.original.description || '-'}</span>,
                    },
                    {
                        header: 'Amount',
                        accessorKey: 'amount',
                        cell: (props) => (
                            <span>{props.row.original.amount.toFixed(2)}</span>
                        ),
                    },
                    {
                        header: 'Remarks',
                        accessorKey: 'remarks',
                        cell: (props) => <span>{props.row.original.remarks}</span>,
                    },
                    {
                        header: 'Action',
                        id: 'action',
                        cell: (props) => (
                            <ActionColumn 
                                row={props.row.original} 
                                onDeleteClick={handleDeleteClick} 
                            />
                        ),
                    },
                ]
            } else {
                // For adib reports, show all columns
                return [
                    {
                        header: 'DATE',
                        accessorKey: 'reportDate',
                        cell: (props) => (
                            <span>
                                {moment(props.row.original.reportDate).format(
                                    'DD MMM YYYY',
                                )}
                            </span>
                        ),
                    },
                    {
                        header: 'Amount',
                        accessorKey: 'amount',
                        cell: (props) => (
                            <span>{props.row.original.amount.toFixed(2)}</span>
                        ),
                    },
                    {
                        header: 'Category',
                        accessorKey: 'category',
                        cell: (props) => <span>{props.row.original.category?.name}</span>,
                    },
                    {
                        header: 'Shop',
                        accessorKey: 'shop',
                        cell: (props) => <span>{props.row.original.shop?.shopName}</span>,
                    },
                    {
                        header: 'Remarks',
                        accessorKey: 'remarks',
                        cell: (props) => <span>{props.row.original.remarks}</span>,
                    },
                    {
                        header: 'Action',
                        id: 'action',
                        cell: (props) => (
                            <ActionColumn 
                                row={props.row.original} 
                                onDeleteClick={handleDeleteClick} 
                            />
                        ),
                    },
                ]
            }
        },
        [reportType]
    )

    const onPaginationChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }))
    }

    const onSelectChange = (limit: number) => {
        setPagination({ page: 1, limit })
    }

    useEffect(() => {
        const selectedMonthName = months.find((m) => m.value === month)?.label || ''
        onDropdownSelect(selectedMonthName)
    }, [month, onDropdownSelect])

    useEffect(() => {
        return () => {
            debouncedSearch.cancel()
        }
    }, [debouncedSearch])

    if (error) {
        return <div className="p-4 text-red-500">Error loading reports: {(error as Error).message}</div>
    }

    return (
        <>
            <div className="mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <Input
                        placeholder="Search reports..."
                        onChange={handleSearchChange}
                        className="w-full md:max-w-md"
                        value={searchTerm}
                    />
                    <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                        <select
                            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            value={month}
                            onChange={(e) => {
                                const selectedValue = Number(e.target.value)
                                const selectedLabel = months.find((m) => m.value === selectedValue)?.label || ''
                                setMonth(selectedValue)
                                onDropdownSelect(selectedLabel)
                            }}
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                        <select
                            className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        >
                            {generateYears().map((y) => (
                                <option key={y.value} value={y.value}>
                                    {y.label}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleResetAll}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Reset filters"
                        >
                            <HiOutlineRefresh size={18} />
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`p-2 ${
                                isExporting
                                    ? 'text-gray-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                            title={isExporting ? 'Exporting...' : 'Export reports'}
                        >
                            <HiOutlineDownload size={18} />
                        </button>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="px-4 py-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <FiFilter size={16} />
                            Filter
                        </button>
                    </div>
                </div>
            </div>
            
            <DataTable
                ref={tableRef}
                columns={columns}
                data={reports}
                skeletonAvatarColumns={[0]}
                skeletonAvatarProps={{ className: 'rounded-md' }}
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
                bill={selectedReport}
                refetch={refetch}
            />

            <BillFilterDrawer
                isOpen={isFilterOpen}
                billType={reportType}
                onClose={() => setIsFilterOpen(false)}
                onRequestClose={() => setIsFilterOpen(false)}
                onApplyFilters={handleApplyFilters}
                initialFilters={filters}
            />
        </>
    )
}

export default ReportTables