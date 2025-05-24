import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Table, 
  Avatar, 
  Badge, 
  Button, 
  Notification,
  toast
} from '@/components/ui';
import { HiOutlineRefresh, HiUser } from 'react-icons/hi';
import { apiGetUserMonthlyAttendance, apiGetUsers } from '../api/api';
import dayjs from 'dayjs';
import { Loading } from '@/components/shared';

interface AttendanceRecord {
  _id: string;
  date: Date;
  present: boolean;
  markedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  type: 'project' | 'normal';
  project?: {
    _id: string;
    projectName: string;
  };
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

const UserMonthlyAttendancePage = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [month, setMonth] = useState<number>(dayjs().month() + 1);
  const [year, setYear] = useState<number>(dayjs().year());
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(userId || '');

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
  ];

  const years = Array.from({ length: 10 }, (_, i) => ({
    value: dayjs().year() - 5 + i,
    label: (dayjs().year() - 5 + i).toString(),
  }));

  const fetchUsers = async () => {
    try {
      const response = await apiGetUsers({ limit: 1000 });
      setUsers(response.data.data.users);
    } catch (error: any) {
      toast.push(
        <Notification title="Error fetching users" type="danger">
          {error.message}
        </Notification>
      );
    }
  };

  const fetchAttendance = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await apiGetUserMonthlyAttendance(
        selectedUser,
        month,
        year
      );
      setAttendance(response.data.data);
    } catch (error: any) {
      toast.push(
        <Notification title="Error fetching attendance" type="danger">
          {error.message}
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedUser, month, year]);

  const getStatusBadge = (present: boolean) => (
    <Badge
      content={present ? 'Present' : 'Absent'}
      innerClass={`${present ? 'bg-emerald-500' : 'bg-red-500'} text-white`}
    />
  );

  const getTypeBadge = (type: 'project' | 'normal') => (
    <Badge
      content={type === 'project' ? 'Project' : 'Normal'}
      innerClass={`${type === 'project' ? 'bg-blue-500' : 'bg-purple-500'} text-white`}
    />
  );

  return (
    <div className="container mx-auto px-4 h-full">
      <Card
        header={
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h4 className="text-lg font-bold">Monthly Attendance</h4>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <select
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select user</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <select
                  className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {months.map(m => (
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
                  {years.map(y => (
                    <option key={y.value} value={y.value}>
                      {y.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="plain"
                  icon={<HiOutlineRefresh />}
                  onClick={fetchAttendance}
                />
              </div>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Project</th>
                  <th>Marked By</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((record) => (
                    <tr key={record._id}>
                      <td>{dayjs(record.date).format('DD MMM YYYY')}</td>
                      <td>{getStatusBadge(record.present)}</td>
                      <td>{getTypeBadge(record.type)}</td>
                      <td>
                        {record.type === 'project' && record.project 
                          ? record.project.projectName 
                          : 'N/A'}
                      </td>
                      <td>
                        {record.markedBy 
                          ? `${record.markedBy.firstName} ${record.markedBy.lastName}`
                          : 'System'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No attendance records found for selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserMonthlyAttendancePage;