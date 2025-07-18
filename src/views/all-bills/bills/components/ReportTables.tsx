import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import DataTable from '@/components/shared/DataTable'
import {
    HiOutlineEye,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineRefresh,
    HiOutlineDownload,
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
import {
    exportReportToExcel,
    getAdibReportAndExpenses,
    getProfitReport,
    exportProfitReportToExcel,
    getLabourExpensesReport,
    exportEmployeeExpensesToExcel,
    getPayrollReport,
    exportPayrollReportToExcel,
} from '../../api/api'
import moment from 'moment'
import BillDeleteConfirmation from './BillDeleteConfirmation'
import BillFilterDrawer from './BillFilterDrawer'

type ReportItem = {
    _id: string
    reportDate: string
    amount: number
    description?: string
    category?: {
        name: string
    }
    shop?: {
        shopName: string
    }
    remarks: string
    attachments?: any[]
    // Profit-specific fields
    revenue?: number
    expenses?: number
    profit?: number
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
//Generate Years For Dropdown
const generateYears = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 10 }, (_, i) => ({
        value: currentYear - i,
        label: (currentYear - i).toString(),
    }))
}

//Action Column For Reports
const ActionColumn = ({ row, onDeleteClick }: ActionColumnProps) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()
    const location = useLocation()

    const reportType = location.pathname.includes('/adib-report-view')
        ? 'adib'
        : location.pathname.includes('/profit-and-loss-report-view')
          ? 'profit'
          : location.pathname.includes('/labour-expenses-report-view')
            ? 'labour'
            : location.pathname.includes('/payroll-report-view')
              ? 'payroll'
              : 'expense'
    //Edit Paths For Reports
    const editPaths = {
        adib: '/app/new-adib-report',
        expense: '/app/new-expense-report',
        profit: '/app/new-profit-and-loss-report',
        labour: '/app/new-labour-expenses-report',
        payroll: '/app/new-payroll-report',
    }
    //Handle View Attachments For Reports
    const handleViewAttachments = () => {
        navigate(`/app/bill-attachments`, {
            state: { data: row?.attachments },
            type: 'report',
        })
    }
    //Handle Edit For Reports
    const handleEdit = () => {
        navigate(`${editPaths[reportType]}/${row._id}`)
    }

    return (
        <div className="flex text-lg">
            {reportType !== 'labour' && reportType !== 'payroll' && (
                <span
                    className={`cursor-pointer p-2 hover:${textTheme}`}
                    onClick={handleViewAttachments}
                >
                    <HiOutlineEye />
                </span>
            )}

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
    const [selectedReport, setSelectedReport] = useState<ReportItem | null>(
        null,
    )
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filters, setFilters] = useState<FilterParams>({
        startDate: '',
        endDate: '',
        category: '',
        shop: '',
    })
    const location = useLocation()
    //Get Report Type From Route
    const getReportTypeFromRoute = useCallback(() => {
        return location.pathname.includes('/adib-report-view')
            ? 'adib'
            : location.pathname.includes('/profit-and-loss-report-view')
              ? 'profit'
              : location.pathname.includes('/labour-expenses-report-view')
                ? 'labour'
                : location.pathname.includes('/payroll-report-view')
                  ? 'payroll'
                  : 'expense'
    }, [location.pathname])

    const reportType = getReportTypeFromRoute()

    const handleApplyFilters = (data: FilterParams) => {
        setFilters(data)
        setPagination((prev) => ({ ...prev, page: 1 }))
    }
    //API FOR  ALL REPORTS
    const reportApiMap = {
        profit: getProfitReport,
        labour: getLabourExpensesReport,
        payroll: getPayrollReport,
        default: getAdibReportAndExpenses,
    }

    const buildReportParams = () => {
        const baseParams = {
            page: pagination.page,
            limit: pagination.limit,
            search: searchTerm,
            month,
            year,
        }

        const filterParams = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            category: filters.category,
            shop: filters.shop,
            reportType,
        }

        switch (reportType) {
            case 'profit':
                return {
                    ...baseParams,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                }
            case 'expenses':
                return {
                    ...baseParams,
                    category: filters.category,
                    shop: filters.shop,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                }
            case 'payroll':
                return {
                    ...baseParams,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                }
            default:
                return {
                    ...baseParams,
                    ...filterParams,
                }
        }
    }

    const fetchReportData = async () => {
        const selectedApi = reportApiMap[reportType] || reportApiMap.default
        const params = buildReportParams()
        return await selectedApi(params)
    }
    //--------------------------------------------

    const {
        data: response,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            'reports',
            reportType,
            pagination.page,
            pagination.limit,
            searchTerm,
            month,
            year,
            filters,
        ],
        queryFn: fetchReportData,
        keepPreviousData: true,
    })

    const reports =
        response?.data?.reports ||
        response?.data?.projects ||
        response?.data?.expenses ||
        response?.data?.payrolls ||
        []

    console.log(reports, '123 re')
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
    //Handle Export For Reports
    const handleExport = async () => {
        setIsExporting(true)
        try {
            let exportResponse
            if (reportType === 'profit') {
                exportResponse = await exportProfitReportToExcel({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: searchTerm,
                    month,
                    year,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                })
            } else if (reportType === 'labour') {
                exportResponse = await exportEmployeeExpensesToExcel({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: searchTerm,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                })

            }
            else if (reportType === 'payroll') {
                exportResponse = await exportPayrollReportToExcel({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: searchTerm,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                })
            }
            else {
                exportResponse = await exportReportToExcel({
                    page: pagination.page,
                    limit: pagination.limit,
                    search: searchTerm,
                    category: filters.category,
                    shop: filters.shop,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    month,
                    year,
                    reportType,
                    export: true,
                })
            }

            const allReports = exportResponse?.data?.reports || []

            if (allReports.length === 0) {
                console.log('No data to export')
                return
            }

            const headers = Object.keys(allReports[0]).join(',') + '\n'
            const csvContent = allReports.reduce((content, report) => {
                const row = Object.values(report).join(',') + '\n'
                return content + row
            }, headers)

            const blob = new Blob([csvContent], {
                type: 'text/csv;charset=utf-8;',
            })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute(
                'download',
                `${reportType}-reports-${new Date().toISOString()}.csv`,
            )
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log('Data exported successfully')
        } catch (error) {
            console.error('Export failed:', error)
        } finally {
            setIsExporting(false)
        }
    }
    //Handle Delete Success For Reports
    const handleDeleteSuccess = useCallback(() => {
        setIsDeleteOpen(false)
        refetch() // This will trigger a new API call
    }, [refetch])

    //Handle Delete Click For Reports
    const handleDeleteClick = (row: ReportItem) => {
        setSelectedReport(row)
        setIsDeleteOpen(true)
    }
    //Columns For Reports
    const columns: ColumnDef<ReportItem>[] = useMemo(() => {
        if (reportType === 'expense') {
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
                    cell: (props) => (
                        <span>{props.row.original.description || '-'}</span>
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
        } else if (reportType === 'profit') {
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
                    header: 'Project Name',
                    accessorKey: 'projectName',
                    cell: (props) => (
                        <span>{props.row.original.projectName}</span>
                    ),
                },
                {
                    header: 'PO Number',
                    accessorKey: 'poNumber',
                    cell: (props) => <span>{props.row.original.poNumber}</span>,
                },
                {
                    header: 'Budget',
                    accessorKey: 'budget',
                    cell: (props) => (
                        <span className="text-green-500">
                            {props.row.original.budget?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'Expenses',
                    accessorKey: 'expenses',
                    cell: (props) => (
                        <span className="text-red-500">
                            {props.row.original.expenses?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'Profit',
                    accessorKey: 'profit',
                    cell: (props) => (
                        <span
                            className={
                                props.row.original.profit >= 0
                                    ? 'text-green-500'
                                    : 'text-red-500'
                            }
                        >
                            {props.row.original.profit?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'Remarks',
                    accessorKey: 'description',
                    cell: (props) => (
                        <span>{props.row.original.description || '-'}</span>
                    ),
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
        } else if (reportType === 'labour') {
            return [
                {
                    header: 'Employee',
                    accessorKey: 'employee',
                    cell: (props) => (
                        <span>
                            {props.row.original?.employee?.firstName}{' '}
                            {props.row.original?.employee?.lastName}
                        </span>
                    ),
                },
                {
                    header: 'Designation',
                    accessorKey: 'designation',
                    cell: (props) => (
                        <span>{props.row.original.designation}</span>
                    ),
                },
                {
                    header: 'Country',
                    accessorKey: 'country',
                    cell: (props) => <span>{props.row.original.country}</span>,
                },
                {
                    header: 'Basic Salary',
                    accessorKey: 'basicSalary',
                    cell: (props) => (
                        <span>
                            {props.row.original.basicSalary?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: 'Allowance',
                    accessorKey: 'allowance',
                    cell: (props) => (
                        <span>{props.row.original.allowance?.toFixed(2)}</span>
                    ),
                },
                {
                    header: 'Total Salary',
                    accessorKey: 'totalSalary',
                    cell: (props) => (
                        <span>
                            {props.row.original.totalSalary?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: '2 Year Salary',
                    accessorKey: 'twoYearSalary',
                    cell: (props) => (
                        <span>
                            {props.row.original.twoYearSalary?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: 'Yearly Expenses',
                    accessorKey: 'perYearExpenses',
                    cell: (props) => (
                        <span>
                            {props.row.original.perYearExpenses?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: 'Monthly Expenses',
                    accessorKey: 'perMonthExpenses',
                    cell: (props) => (
                        <span>
                            {props.row.original.perMonthExpenses?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: 'Daily Expenses',
                    accessorKey: 'perDayExpenses',
                    cell: (props) => (
                        <span>
                            {props.row.original.perDayExpenses?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: 'Total Expenses',
                    accessorKey: 'totalExpensesPerPerson',
                    cell: (props) => (
                        <span>
                            {props.row.original.totalExpensesPerPerson?.toFixed(
                                2,
                            )}
                        </span>
                    ),
                },
                {
                    header: 'Visa Expenses',
                    accessorKey: 'visaExpenses',
                    cell: (props) => (
                        <span>
                            {props.row.original.visaExpenses?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: '2 Year Uniform',
                    accessorKey: 'twoYearUniform',
                    cell: (props) => (
                        <span>
                            {props.row.original.twoYearUniform?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: 'Shoes',
                    accessorKey: 'shoes',
                    cell: (props) => (
                        <span>{props.row.original.shoes?.toFixed(2)}</span>
                    ),
                },
                {
                    header: '2 Year Accommodation',
                    accessorKey: 'twoYearAccommodation',
                    cell: (props) => (
                        <span>
                            {props.row.original.twoYearAccommodation?.toFixed(
                                2,
                            )}
                        </span>
                    ),
                },
                {
                    header: 'SEWA Bills',
                    accessorKey: 'sewaBills',
                    cell: (props) => (
                        <span>{props.row.original.sewaBills?.toFixed(2)}</span>
                    ),
                },
                {
                    header: 'DEWA Bills',
                    accessorKey: 'dewaBills',
                    cell: (props) => (
                        <span>{props.row.original.dewaBills?.toFixed(2)}</span>
                    ),
                },
                {
                    header: 'Insurance',
                    accessorKey: 'insurance',
                    cell: (props) => (
                        <span>{props.row.original.insurance?.toFixed(2)}</span>
                    ),
                },
                {
                    header: 'Transport',
                    accessorKey: 'transport',
                    cell: (props) => (
                        <span>{props.row.original.transport?.toFixed(2)}</span>
                    ),
                },
                {
                    header: 'Water',
                    accessorKey: 'water',
                    cell: (props) => (
                        <span>{props.row.original.water?.toFixed(2)}</span>
                    ),
                },
                {
                    header: '3rd Party Liabilities',
                    accessorKey: 'thirdPartyLiabilities',
                    cell: (props) => (
                        <span>
                            {props.row.original.thirdPartyLiabilities?.toFixed(
                                2,
                            )}
                        </span>
                    ),
                },
                {
                    header: 'Fairmont Certificate',
                    accessorKey: 'fairmontCertificate',
                    cell: (props) => (
                        <span>
                            {props.row.original.fairmontCertificate?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: 'Leave Salary',
                    accessorKey: 'leaveSalary',
                    cell: (props) => (
                        <span>
                            {props.row.original.leaveSalary?.toFixed(2)}
                        </span>
                    ),
                },
                {
                    header: 'Ticket',
                    accessorKey: 'ticket',
                    cell: (props) => (
                        <span>{props.row.original.ticket?.toFixed(2)}</span>
                    ),
                },
                {
                    header: 'Gratuity',
                    accessorKey: 'gratuity',
                    cell: (props) => (
                        <span>{props.row.original.gratuity?.toFixed(2)}</span>
                    ),
                },
                {
                    header: 'Custom Expenses',
                    accessorKey: 'customExpenses',
                    cell: (props) => (
                        <span>
                            {props.row.original?.customExpenses
                                ?.map(
                                    (exp: any) => `${exp.name}: ${exp.amount}`,
                                )
                                .join(', ')}
                        </span>
                    ),
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
        } else if (reportType === 'payroll') {
            return [
                {
                    header: 'Employee',
                    accessorKey: 'name',
                    cell: (props) => (
                        <span>{props.row.original.name || '-'}</span>
                    ),
                },
                {
                    header: 'Designation',
                    accessorKey: 'designation',
                    cell: (props) => (
                        <span>{props.row.original.designation || '-'}</span>
                    ),
                },
                {
                    header: 'Emirates ID',
                    accessorKey: 'emiratesId',
                    cell: (props) => (
                        <span>{props.row.original.emiratesId || '-'}</span>
                    ),
                },
                {
                    header: 'Labour Card',
                    accessorKey: 'labourCard',
                    cell: (props) => (
                        <span>{props.row.original.labourCard || '-'}</span>
                    ),
                },
                {
                    header: 'Personal No.',
                    accessorKey: 'labourCardPersonalNo',
                    cell: (props) => (
                        <span>{props.row.original.labourCardPersonalNo || '-'}</span>
                    ),
                },
                {
                    header: 'Period',
                    accessorKey: 'period',
                    cell: (props) => (
                        <span>{props.row.original.period || '-'}</span>
                    ),
                },
                {
                    header: 'Basic Salary',
                    accessorKey: 'basic',
                    cell: (props) => (
                        <span className="font-medium">
                            {props.row.original.basic?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'Allowance',
                    accessorKey: 'allowance',
                    cell: (props) => (
                        <span className="text-green-500">
                            {props.row.original.allowance?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'OT',
                    accessorKey: 'ot',
                    cell: (props) => (
                        <span>
                            {props.row.original.ot?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'Total Earning',
                    accessorKey: 'totalEarning',
                    cell: (props) => (
                        <span className="font-semibold">
                            {props.row.original.totalEarning?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'Deduction',
                    accessorKey: 'deduction',
                    cell: (props) => (
                        <span className="text-red-500">
                            {props.row.original.deduction?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'Mess',
                    accessorKey: 'mess',
                    cell: (props) => (
                        <span>{props.row.original.mess?.toFixed(2) || '0.00'}</span>
                    ),
                },
                {
                    header: 'Advance',
                    accessorKey: 'advance',
                    cell: (props) => (
                        <span>{props.row.original.advance?.toFixed(2) || '0.00'}</span>
                    ),
                },
                {
                    header: 'Net Salary',
                    accessorKey: 'net',
                    cell: (props) => (
                        <span className="font-semibold text-blue-500">
                            {props.row.original.net?.toFixed(2) || '0.00'}
                        </span>
                    ),
                },
                {
                    header: 'Remarks',
                    accessorKey: 'remark',
                    cell: (props) => (
                        <span>{props.row.original.remark || '-'}</span>
                    ),
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
            ];
        } else {
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
                    cell: (props) => (
                        <span>{props.row.original.category?.name}</span>
                    ),
                },
                {
                    header: 'Shop',
                    accessorKey: 'shop',
                    cell: (props) => (
                        <span>{props.row.original.shop?.shopName}</span>
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
        }
    }, [reportType, handleDeleteClick])

    const onPaginationChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }))
    }

    const onSelectChange = (limit: number) => {
        setPagination({ page: 1, limit })
    }

    useEffect(() => {
        const selectedMonthName =
            months.find((m) => m.value === month)?.label || ''
        onDropdownSelect(selectedMonthName)
    }, [month, onDropdownSelect])

    useEffect(() => {
        return () => {
            debouncedSearch.cancel()
        }
    }, [debouncedSearch])

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading reports: {(error as Error).message}
            </div>
        )
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
                        {reportType !== 'labour'||reportType !== 'payroll' && (
                            <>
                                <select
                                    className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                                    value={month}
                                    onChange={(e) => {
                                        const selectedValue = Number(
                                            e.target.value,
                                        )
                                        const selectedLabel =
                                            months.find(
                                                (m) =>
                                                    m.value === selectedValue,
                                            )?.label || ''
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
                                    onChange={(e) =>
                                        setYear(Number(e.target.value))
                                    }
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
                            </>
                        )}
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className={`p-2 ${
                                isExporting
                                    ? 'text-gray-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                            title={
                                isExporting ? 'Exporting...' : 'Export reports'
                            }
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
                refetch={handleDeleteSuccess}
                reportType={reportType}
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
