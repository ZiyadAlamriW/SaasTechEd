import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

const QRCodeGenerator = ({ data, size = 200, className = '' }) => {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (data) {
      setQrValue(JSON.stringify(data));
    }
  }, [data]);

  if (!qrValue) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ width: size, height: size }}>
        <span className="text-gray-500">لا توجد بيانات</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCode
          value={qrValue}
          size={size}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        />
      </div>
      {data && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            جلسة الحضور: {new Date(data.date).toLocaleDateString('ar-SA')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            انسخ الرمز لمسحه من هاتف الطالب
          </p>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
