import BaseService from "@/services/BaseService"

// src/views/users/api/api.ts
export const fetchUser= async () => {
    try {
       
        const response = await BaseService.get(`/user`)
        console.log('User fetch response:', response)
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        throw error
    }
}
export const fetchUserById = async (id: string) => {
    try {
        console.log(`Fetching user with ID: ${id}`)
        const response = await BaseService.get(`/user/${id}`)
        console.log('User fetch response:', response)
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        throw error
    }
}

export const editUser = async (id: string, values: any) => {
    try {
        console.log(`Editing user with ID: ${id}`, values)
        const response = await BaseService.put(`/user/${id}`, values)
        console.log('Edit response:', response)
        return response
    } catch (error) {
        console.error('Error editing user:', error)
        throw error
    }
}

export const addUser = async (values: any) => {
    try {
        console.log('Adding new user:', values)
        const response = await BaseService.post("/user", values)
        console.log('Add response:', response)
        return response
    } catch (error) {
        console.error('Error adding user:', error)
        throw error
    }
}


export const fetchUserView = async (id: string) => {
    try {
        const response = await BaseService.get(`/user/${id}`)
        return response.data
    } catch (error) {
        console.error('Error fetching user:', error)
        throw error
    }
}