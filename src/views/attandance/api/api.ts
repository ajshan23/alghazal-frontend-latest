import BaseService from "@/services/BaseService"

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