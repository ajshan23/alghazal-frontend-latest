import { lazy } from 'react'
import { APP_PREFIX_PATH } from '@/constants/route.constant'
import { ADMIN, ENGINEER, SUPERADMIN, USER } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const appsRoute: Routes = [
    {
        key: 'apps.dashboard',
        path: `${APP_PREFIX_PATH}/dashboard`,
        component: lazy(() => import('@/views/project/ProjectDashboard')),
        authority: [ADMIN, USER,ENGINEER,SUPERADMIN],
    },
    {
        key: 'appsEstimation.estimationList',
        path: `${APP_PREFIX_PATH}/estimation-list`,
        component: lazy(() => import('@/views/estimation/estimationlist/EstimationList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsEstimationCreation.estimationCreation',
        path: `${APP_PREFIX_PATH}/create-estimation/:projectId`,
        component: lazy(() => import('@/views/estimation/estimationcreation/EstimationCreations')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },
    {
        key: 'appsEstimation.estimationView',
        path: `${APP_PREFIX_PATH}/estimation/:id`,
        component: lazy(() => import('@/views/estimation/estimationView/EstimationView')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },
    {
        key: 'appsEstimationView.estimationView',
        path: `${APP_PREFIX_PATH}/estimation-view/:id`,
        component: lazy(() => import('@/views/estimation/estimationViews/EstimationView')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },    
      {
        key: 'appsEstimationEdit.estimationEdit',
        path: `${APP_PREFIX_PATH}/estimation/edit/:projectId/:estimationId`,
        component: lazy(() => import('@/views/estimation/estimationcreation/EstimationCreations')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },    
    {
        key: 'appsUsers.userNew',
        path: `${APP_PREFIX_PATH}/user-new`,
        component: lazy(() => import('@/views/users/UserNew/UserNew')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsUsers.userForm',
        path: `${APP_PREFIX_PATH}/user-form/:id?`, // Make id optional
        component: lazy(() => import('@/views/users/UserNew/UserNew')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsUsers.usersList',
        path: `${APP_PREFIX_PATH}/user-list`,
        component: lazy(() => import('@/views/users/UserList/UserList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsUserView.UserView',
        path: `${APP_PREFIX_PATH}/user-view/:id`,
        component: lazy(() => import('@/views/users/CustomerDetail/CustomerDetail')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsClients.clientsList',
        path: `${APP_PREFIX_PATH}/client-list`,
        component: lazy(() => import('@/views/client/ClientList/ClientList')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsClients.ClientNew',
        path: `${APP_PREFIX_PATH}/client-new`,
        component: lazy(() => import('@/views/client/ClientNew/ClientNew')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsClients.clientForm',
        path: `${APP_PREFIX_PATH}/client-form/:id?`, // Make id optional
        component: lazy(() => import('@/views/client/ClientNew/ClientNew')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsClients.clientView',
        path: `${APP_PREFIX_PATH}/client-view/:id?`, // Make id optional
        component: lazy(() => import('@/views/client/CustomerDetail/CustomerDetail')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsProjectNew.projectNew',
        path: `${APP_PREFIX_PATH}/project-new`,
        component: lazy(() => import('@/views/projectNew/ProjectNew/ProjectForm')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsProjectEdit.projectEdit',
        path: `${APP_PREFIX_PATH}/project-edit/:id`,
        component: lazy(() => import('@/views/projectNew/ProjectNew/ProjectForm')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsProjectList.ProjectList',
        path: `${APP_PREFIX_PATH}/project-list`,
        component: lazy(() => import('@/views/projectNew/ProjectList/components/ProjectTable')),
        authority: [ADMIN, USER,SUPERADMIN],
    },

    {
        key: 'appsProjectView.ProjectView',
        path: `${APP_PREFIX_PATH}/project-view/:id`,
        component: lazy(() => import('@/views/ProjectView/ProjectView/Wallets')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },
    {
        key: 'appsQuotation.quotationNew',
        path: `${APP_PREFIX_PATH}/quotation-new/:projectId`,
        component: lazy(() => import('@/views/quotation/quotationcreation/QuotationCreations')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.ongoingworks',
        path: `${APP_PREFIX_PATH}/ongoingworks`,
        component: lazy(() => import('@/views/workstatus/ProjectDashboard/ProjectDashboard')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsQuotationView.QuotationView',
        path: `${APP_PREFIX_PATH}/quotation-view/:projectId`,
        component: lazy(() => import('@/views/quotation/quotationview/QuotationView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'appsPublicView.PublicView',
        path: `${APP_PREFIX_PATH}/public-view`,
        component: lazy(() => import('@/views/publicview/publicviews/PublicView')),
        authority: [ADMIN, USER,SUPERADMIN,ENGINEER],
    },
    {
        key: 'apps.lpo',
        path: `${APP_PREFIX_PATH}/lpo/:projectId`,
        component: lazy(() => import('@/views/lpo/lpocreate/LpoForm/LpoForm')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.lpo',
        path: `${APP_PREFIX_PATH}/lpo-view/:id`,
        component: lazy(() => import('@/views/lpo/lpoView/lpoView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.workprogress',
        path: `${APP_PREFIX_PATH}/workprogress/:projectId`,
        component: lazy(() => import('@/views/workprogress/progress/progress/Progress')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.teamAssign',
        path: `${APP_PREFIX_PATH}/teams-assign/:projectId`,
        component: lazy(() => import('@/views/workprogress/progress/progress/TeamAssignment')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.workcompletionreport',
        path: `${APP_PREFIX_PATH}/workcompletionreport/:projectId`,
        component: lazy(() => import('@/views/workcompletion/Completionview/CompletionView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.invoice',
        path: `${APP_PREFIX_PATH}/invoice-view/:projectId`,
        component: lazy(() => import('@/views/invoice/invoiceview/InvoiceView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.projectAttandance',
        path: `${APP_PREFIX_PATH}/attendance-summary/:projectId`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/AttendanceSummary')),
        authority: [ADMIN, USER,SUPERADMIN ,ENGINEER],
    },
    {
        key: 'apps.normalAttendanceMark',
        path: `${APP_PREFIX_PATH}/attendance/normal/mark`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/NormalAttendanceMarkPage')),
        authority: [ADMIN, SUPERADMIN ],
    },
    {
        key: 'apps.monthlyAttendancePerUser',
        path: `${APP_PREFIX_PATH}/attendance/user/:userId?`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/UserMonthlyAttendancePage')),
        authority: [ADMIN, SUPERADMIN,],
    },
    {
        key: 'apps.attandanceDashboard',
        path: `${APP_PREFIX_PATH}/attendance/dashboard`,
        component: lazy(() => import('@/views/attandance/AttendanceManagement/AttendanceDashboard')),
        authority: [ADMIN, SUPERADMIN ],
    
    },
    
    
    // {
    //     key: 'apps.expenseAdd',
    //     path: `${APP_PREFIX_PATH}/expense/:projectId`,
    //     component: lazy(() => import('@/views/expense-tracker/expense-form/ExpenseForm')),
    //     authority: [ADMIN, USER,SUPERADMIN],
    // },
    // {
    //     key: 'apps.expenseAdd',
    //     path: `${APP_PREFIX_PATH}/expense/edit/:projectId`,
    //     component: lazy(() => import('@/views/expense-tracker/expense-form/ExpenseForm')),
    //     authority: [ADMIN, USER,SUPERADMIN],
    // },
    {
        key: 'apps.expenseAdd',
        path: `${APP_PREFIX_PATH}/expense/:projectId`,
        component: lazy(() => import('@/views/expense-tracker/expense-form/ExpenseForm')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    {
        key: 'apps.expenseView',
        path: `${APP_PREFIX_PATH}/expense-view/:expenseId`,
        component: lazy(() => import('@/views/expense-tracker/expense-form/EspenseView')),
        authority: [ADMIN, USER,SUPERADMIN],
    },
    
    
]

export default appsRoute
