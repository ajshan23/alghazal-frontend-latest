import BaseService from "@/services/BaseService"

export const fetchUser = async () => {
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
        
        const formData = new FormData();
        
        // Append all non-file fields
        Object.keys(values).forEach(key => {
            if (key !== 'profileImage' && 
                key !== 'signatureImage' && 
                key !== 'emiratesIdDocument' && 
                key !== 'passportDocument') {
                formData.append(key, values[key]);
            }
        });
        
        // Append files if they are File objects
        if (values.profileImage instanceof File) {
            formData.append('profileImage', values.profileImage);
        }
        if (values.signatureImage instanceof File) {
            formData.append('signatureImage', values.signatureImage);
        }
        if (values.emiratesIdDocument instanceof File) {
            formData.append('emiratesIdDocument', values.emiratesIdDocument);
        }
        if (values.passportDocument instanceof File) {
            formData.append('passportDocument', values.passportDocument);
        }
        
        // Add flags for document removal if needed
        if (values.removeEmiratesIdDocument) {
            formData.append('removeEmiratesIdDocument', 'true');
        }
        if (values.removePassportDocument) {
            formData.append('removePassportDocument', 'true');
        }
        
        const response = await BaseService.put(`/user/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
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
        
        const formData = new FormData();
        
        // Append all non-file fields
        Object.keys(values).forEach(key => {
            if (key !== 'profileImage' && 
                key !== 'signatureImage' && 
                key !== 'emiratesIdDocument' && 
                key !== 'passportDocument') {
                formData.append(key, values[key]);
            }
        });
        
        // Append files if they exist
        if (values.profileImage) {
            formData.append('profileImage', values.profileImage);
        }
        if (values.signatureImage) {
            formData.append('signatureImage', values.signatureImage);
        }
        if (values.emiratesIdDocument) {
            formData.append('emiratesIdDocument', values.emiratesIdDocument);
        }
        if (values.passportDocument) {
            formData.append('passportDocument', values.passportDocument);
        }
        
        const response = await BaseService.post("/user", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
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