import { useState } from 'react';

const Attendance = () => {
  const [sessions, setSessions] = useState([]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">إدارة الحضور</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">جلسات الحضور</h2>
          <p className="text-gray-600">هذه الصفحة قيد التطوير...</p>
        </div>
      </div>
    </div>
  );
};

export default Attendance;