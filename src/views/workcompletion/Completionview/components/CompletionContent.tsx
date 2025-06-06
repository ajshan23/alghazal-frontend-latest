// src/views/completion/components/CompletionContent.tsx
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Loading from '@/components/shared/Loading';
import Logo from '@/components/template/Logo';
import { HiLocationMarker, HiPhone, HiUser, HiPlus } from 'react-icons/hi';
import useThemeClass from '@/utils/hooks/useThemeClass';
import { useAppSelector } from '@/store';
import dayjs from 'dayjs';
import { Notification, toast } from '@/components/ui';
import ImageUploadModal from './ImageUploadModal';
import { apiGetCompletionData, apiUploadCompletionImages, apiCreateWorkCompletion, apiDownloadCompletionCertificate } from '../../api/api';
import { useNavigate, useParams } from 'react-router-dom';

type CompletionData = {
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
};

const CompletionContent = () => {
  const { textTheme } = useThemeClass();
  const mode = useAppSelector((state) => state.theme.mode);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CompletionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [creatingCompletion, setCreatingCompletion] = useState(false);

  // Get projectId from URL
  const {projectId} = useParams()
  const navigate=useNavigate()

  const fetchCompletionData = async () => {
    try {
      setLoading(true);
      const response = await apiGetCompletionData(projectId);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching completion data:', err);
      setError('Failed to load completion data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) navigate("/app/dashboard")
    fetchCompletionData();
  }, [projectId]);

  const handleUploadImages = async (files: File[], titles: string[], descriptions?: string[]) => {
    try {
      setLoading(true);
      
      // 1. Upload the images
      await apiUploadCompletionImages({
        projectId: projectId!,
        images: files,
        titles,
        descriptions
      });
      
      // 2. Refetch the complete data to ensure we have all populated fields
      const response = await apiGetCompletionData(projectId);
      setData(response.data);
      
      toast.push(
        <Notification title="Success" type="success">
          Images uploaded successfully
        </Notification>
      );
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to upload images: {error.response?.data?.message || error.message}
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompletion = async () => {
    try {
      setCreatingCompletion(true);
      const response = await apiCreateWorkCompletion(projectId);
      setData(response.data);
      toast.push(
        <Notification title="Success" type="success">
          Work completion created successfully
        </Notification>
      );
    } catch (error) {
      console.error('Error creating work completion:', error);
      toast.push(
        <Notification title="Error" type="danger">
          Failed to create work completion
        </Notification>
      );
    } finally {
      setCreatingCompletion(false);
    }
  };

  // src/views/completion/components/CompletionContent.tsx
const handleDownloadPdf = async () => {
  setPdfLoading(true);
  setError('');
  
  try {
    await apiDownloadCompletionCertificate(projectId!);
    
    toast.push(
      <Notification title="Success" type="success">
        PDF downloaded successfully
      </Notification>
    );
  } catch (error) {
    console.error('Error downloading PDF:', error);
    setError('Failed to download PDF');
    
    let errorMessage = 'Failed to download PDF';
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'Project data not found for PDF generation';
      } else if (error.response.status === 400) {
        errorMessage = 'Invalid project data for PDF generation';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    toast.push(
      <Notification title="Error" type="danger">
        {errorMessage}
      </Notification>
    );
  } finally {
    setPdfLoading(false);
  }
};

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loading loading={creatingCompletion} />
        <p className="mt-4 mb-6">No work completion record found for this project</p>
        <Button
          variant="solid"
          loading={creatingCompletion}
          onClick={handleCreateCompletion}
        >
          Create Work Completion
        </Button>
      </div>
    );
  }

  return (
    <Loading loading={loading}>
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadImages}
        projectId={projectId}
      />
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-10">
        <div>
          <Logo className="mb-3" mode={mode} />
          <h2 className="text-2xl font-bold mb-4">COMPLETION CERTIFICATE</h2>
        </div>
        <div className="my-4">
          <div className="mb-2">
            <h4>Reference: {data.referenceNumber}</h4>
            <div className="flex flex-col space-y-1">
              <span>
                Prepared On: {dayjs(data.createdAt).format('dddd, DD MMMM, YYYY')}
              </span>
            </div>
          </div>
          <div className="mt-4 flex">
            <HiUser className={`text-xl ${textTheme}`} />
            <div className="ltr:ml-3 rtl:mr-3">
              Prepared By: {data.preparedBy?.firstName} {data.preparedBy?.lastName}
            </div>
          </div>
          <div className="mt-4 flex">
            <HiLocationMarker className={`text-xl ${textTheme}`} />
            <div className="ltr:ml-3 rtl:mr-3">
              <h6>Project: {data.project.projectName}</h6>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>FM Contractor:</strong> {data.fmContractor}</p>
            <p><strong>Sub Contractor:</strong> {data.subContractor}</p>
          </div>
          <div>
            <p><strong>Project Description:</strong> {data.projectDescription}</p>
            <p><strong>Location:</strong> {data.location}</p>
          </div>
        </div>
        
        <div className="my-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p className="text-center italic">
            This is to certify that the work described above on project description has been cleared out and completed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <p><strong>Completion Date:</strong> {dayjs(data.completionDate).format('DD MMMM, YYYY')}</p>
          </div>
          <div>
            <p><strong>LPO Number:</strong> {data.lpoNumber}</p>
          </div>
          <div>
            <p><strong>LPO Date:</strong> {dayjs(data.lpoDate).format('DD MMMM, YYYY')}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border rounded p-4">
          <h5 className="font-bold mb-4 text-center">Hand Over By</h5>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 font-semibold">Company:</td>
                <td className="py-2">{data.handover.company}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Name:</td>
                <td className="py-2">{data.handover.name}</td>
              </tr>
              {/* <tr>
                <td className="py-2 font-semibold">Signature:</td>
                <td className="py-2">[Signature]</td>
              </tr> */}
              <tr>
                <td className="py-2 font-semibold">Date:</td>
                <td className="py-2">{dayjs(data.handover.date).format('DD MMMM, YYYY')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="border rounded p-4">
          <h5 className="font-bold mb-4 text-center">Accepted By</h5>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 font-semibold">Company:</td>
                <td className="py-2">{data.acceptance.company}</td>
              </tr>
              <tr>
                <td className="py-2 font-semibold">Name:</td>
                <td className="py-2">{data.acceptance.name}</td>
              </tr>
              {/* <tr>
                <td className="py-2 font-semibold">Signature:</td>
                <td className="py-2">[Signature]</td>
              </tr> */}
              <tr>
                <td className="py-2 font-semibold">Date:</td>
                <td className="py-2">{dayjs(data.acceptance.date).format('DD MMMM, YYYY')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h5 className="font-bold">Site Pictures:</h5>
          <Button
            variant="solid"
            icon={<HiPlus />}
            onClick={() => setUploadModalOpen(true)}
          >
            Add Images
          </Button>
        </div>
        
        {data.sitePictures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.sitePictures.map((image, index) => (
              <div key={`image-${index}`} className="border rounded overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.caption || `Site Image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                {image.caption && (
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 text-center">
                    <p className="text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded bg-gray-50 dark:bg-gray-700">
            <p>No site pictures uploaded yet</p>
            <Button
              className="mt-4"
              variant="solid"
              icon={<HiPlus />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Images
            </Button>
          </div>
        )}
      </div>

      <div className="print:hidden mt-6 flex items-center justify-end gap-2">
        <Button
          variant="solid"
          onClick={() => setUploadModalOpen(true)}
        >
          Add More Images
        </Button>
        <Button 
          variant="solid" 
          loading={pdfLoading}
          onClick={handleDownloadPdf}
        >
          {pdfLoading ? 'Generating PDF...' : 'Download Completion Certificate'}
        </Button>
      </div>
    </Loading>
  );
};

export default CompletionContent;