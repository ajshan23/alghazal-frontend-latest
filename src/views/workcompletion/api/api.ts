// src/services/completionService.ts
import BaseService from "@/services/BaseService";

interface CompletionData {
  _id: string;
  referenceNumber: string;
  fmContractor: string;
  subContractor: string;
  projectDescription: string;
  location: string;
  completionDate: string;
  lpoNumber: string;
  lpoDate: string;
  handover: {
    company: string;
    name: string;
    signature: string;
    date: string;
  };
  acceptance: {
    company: string;
    name: string;
    signature: string;
    date: string;
  };
  sitePictures: Array<{
    url: string;
    caption?: string;
  }>;
  project: {
    _id: string;
    projectName: string;
  };
  preparedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ImageUploadData {
  projectId: string;
  images: File[];
  titles: string[];
  descriptions?: string[];
}

export const apiGetCompletionData = async (projectId: string): Promise<{ data: CompletionData }> => {
  try {
    const response = await BaseService.get(`/work-completion/project/${projectId}/work-comp`);
    console.log(response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching completion data:", error);
    throw error;
  }
}

export const apiUploadCompletionImages = async (data: {
    projectId: string;
    images: File[];
    titles: string[];
    descriptions?: string[];
  }): Promise<{ data: CompletionData }> => {
    try {
      const formData = new FormData();
      
      // Append each image
      data.images.forEach((image) => {
        formData.append('images', image);
      });
      
      // Append titles
      data.titles.forEach((title) => {
        formData.append('titles', title);
      });
      
      // Append descriptions if they exist
      if (data.descriptions) {
        data.descriptions.forEach((desc) => {
          formData.append('descriptions', desc);
        });
      }
  
      const response = await BaseService.post(
        `/work-completion/project/${data.projectId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading completion images:", error);
      throw error;
    }
  };

export const apiCreateWorkCompletion = async (projectId: string): Promise<{ data: CompletionData }> => {
  try {
    const response = await BaseService.post('/work-completion', { projectId });
    return response.data;
  } catch (error) {
    console.error("Error creating work completion:", error);
    throw error;
  }
}