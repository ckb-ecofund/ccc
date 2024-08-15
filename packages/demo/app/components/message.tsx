import { CircleX, Lightbulb, OctagonAlert } from 'lucide-react';
import React, { useState } from 'react';

interface HintProps {
  message: string;
  title: string;
  type?: 'error' | 'warning' | 'info' | 'success'; 
  className?: string;
}

const Hint: React.FC<HintProps> = ({ message, title, type = 'info', className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLines = 2;

  let colorClass = '';
  let bgColorClass = '';
  
  // 根据提示类型设置颜色和背景色
  switch (type) {
    case 'error':
      colorClass = 'text-red-800';
      bgColorClass = 'bg-red-100';
      break;
    case 'warning':
      colorClass = 'text-yellow-800';
      bgColorClass = 'bg-yellow-100';
      break;
    case 'success': 
      colorClass = 'text-green-800';
      bgColorClass = 'bg-green-100';
      break;
    case 'info':
    default:
      colorClass = 'text-gray-800';
      bgColorClass = 'bg-gray-100';
      break;
  }

  return (
    <div className={`w-96 my-2 max-w-xl flex flex-col items-start p-4 rounded-md ${bgColorClass} ${className}`}>
      <div className="flex items-center w-full">
        {
          type === 'info' && <Lightbulb className={`mr-3 ${colorClass}`} />
        }
        {
          type === 'error' && <CircleX className={`mr-3 ${colorClass}`} /> 
        }
        {
          type === 'error' && <OctagonAlert className={`mr-3 ${colorClass}`} /> 
        }
        <p className={`font-semibold ${colorClass}`}>{title}</p>
      </div>
      <div className={`relative mt-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
        <p className={`text-sm w-80 whitespace-pre-wrap break-words ${colorClass}`}>
          {message}
        </p>
      </div>
      {message.length > 100 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="mt-2 text-sm text-blue-500 underline"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      )}
    </div>
  );
};

export default Hint;