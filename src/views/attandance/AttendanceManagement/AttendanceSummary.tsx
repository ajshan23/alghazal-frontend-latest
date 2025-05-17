import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Avatar, 
  Badge, 
  Button, 
  DatePicker,
  toast 
} from '@/components/ui';
import { HiOutlineCalendar, HiRefresh } from 'react-icons/hi';
import { apiGetAttendanceSummary } from '../api/api';
import dayjs from 'dayjs';
import { Loading } from '@/components/shared';

interface Worker {
  _id: string;
  name: string;
  profileImage?: string;
}

interface SummaryItem {
  date: string;
  [workerId: string]: boolean | null | string;
}

interface AttendanceSummaryData {
  dates: string[];
  summary: SummaryItem[];
  totals: Record<string, number>;
  workers: Worker[];
}

const AttendanceSummary = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      
      if (dateRange[0] && dateRange[1]) {
        params.startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
        params.endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
      }

      const response = await apiGetAttendanceSummary(projectId as string, params);
      
      if (response.data && response.data.data) {
        const { workers = [], summary = [], totals = {} } = response.data.data;
        setWorkers(workers);
        setSummary(summary);
        setTotals(totals);
      }
    } catch (error: any) {
      toast.show({
        type: 'danger',
        title: 'Error fetching attendance summary',
        message: error.message || 'Failed to load attendance data'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, dateRange]);

  const handleDateChange = (value: [Date | null, Date | null]) => {
    setDateRange(value);
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return null;
    return (
      <Badge
        content={status ? 'P' : 'A'}
        innerClass={`${status ? 'bg-emerald-500' : 'bg-red-500'} text-white`}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 h-full">
      <Card
        header={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h4 className="text-lg font-bold">Attendance Summary</h4>
            <div className="flex items-center gap-2">
              {/* <DatePicker.RangePicker
                value={dateRange}
                onChange={handleDateChange}
                placeholder={['Start Date', 'End Date']}
                suffix={<HiOutlineCalendar className="text-lg" />}
              /> */}
              <Button
                variant="plain"
                icon={<HiRefresh />}
                onClick={fetchData}
              >
                Refresh
              </Button>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                {workers.map(worker => (
                  <th key={worker._id} className="text-center">
                    <div className="flex flex-col items-center">
                      <Avatar 
                        size="sm" 
                        src={worker.profileImage} 
                        className="mb-1"
                      />
                      <span className="text-xs whitespace-nowrap">
                        {worker.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map((row, index) => (
                <tr key={index}>
                  <td>{dayjs(row.date).format('DD MMM YYYY')}</td>
                  {workers.map(worker => (
                    <td 
                      key={`${row.date}-${worker._id}`} 
                      className="text-center"
                    >
                      {getStatusBadge(row[worker._id] as boolean | null)}
                    </td>
                  ))}
                </tr>
              ))}
              {summary.length > 0 && (
                <tr className="font-semibold bg-gray-50 dark:bg-gray-700">
                  <td>Total Present</td>
                  {workers.map(worker => (
                    <td key={`total-${worker._id}`} className="text-center">
                      {totals[worker._id] || 0}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </Table>
          {summary.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for the selected period
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AttendanceSummary;