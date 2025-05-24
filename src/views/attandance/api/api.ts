import BaseService from "@/services/BaseService"

// Project Attendance APIs
export const apiGetTodayProjectAttendance = (projectId: string) => {
    return BaseService.get(`/attandance/project/${projectId}/today`)
}

export const apiMarkAttendance = (data: {
    projectId: string
    userId: string
    present: boolean
}) => {
    return BaseService.post(`/attandance/project/${data.projectId}/user/${data.userId}`, {
        present: data.present
    })
}

export const apiGetAttendanceSummary = (projectId: string, params = {}) => {
    return BaseService.get(`/attandance/project/${projectId}/summary`, { params })
}

// Normal Attendance APIs
export const apiMarkNormalAttendance = (data: {
    userId: string
    present: boolean
    date?: Date
    type?: 'normal'
}) => {
    return BaseService.post('/attandance/normal', {
        ...data,
        type: 'normal' // Ensure type is always normal
    })
}

export const apiGetUserMonthlyAttendance = (
    userId: string,
    month: number,
    year: number
) => {
    return BaseService.get(`/attandance/normal/monthly/${userId}`, {
        params: { month, year }
    })
}

export const apiGetDailyNormalAttendance = (date: string) => {
    return BaseService.get('/attandance/normal/daily', {
        params: { date }
    })
}

// User APIs
export const apiGetUsers = (params?: {
    limit?: number
    page?: number
    search?: string
    role?: string
}) => {
    return BaseService.get('/user', { params })
}