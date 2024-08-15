import React, { useState, useEffect } from 'react';
import Message from './message';
import { History } from 'lucide-react';

interface NotificationProps {
  messages: [ 'info' | 'error', string ][];
}

const Notifications: React.FC<NotificationProps> = ({ messages }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setIsExpanded(true);
    }
  }, [messages]);

  const messageCount = messages.length;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* PC 端右侧展示 */}
      <div className={`fixed z-50 right-0 top-16 w-[420px] transition-transform duration-300 ease-in-out ${isExpanded ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
        {isExpanded ? (
          <div className="relative bg-white shadow-lg rounded-md overflow-hidden md:max-h-96">
            <div className="p-4">
              {messages.map(([level, msg], i) => (
                <Message
                  key={messages.length - i}
                  title={`${messages.length - i}`}
                  message={msg}
                  type={level === "info" ? "success" : "error"}
                />
              ))}
            </div>
            <div className="text-right pr-4 pb-4">
              <button onClick={toggleExpand} className="text-blue-500 underline">
                Collapse
              </button>
            </div>
          </div>
        ) : (
          <div className="fixed bottom-0 right-0 mb-4 mr-4 flex items-center cursor-pointer md:top-16 md:right-4 md:bottom-auto" onClick={toggleExpand}>
            <History className="w-8 h-8" />
            {messageCount > 0 && (
              <span className="ml-2 text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center">
                {messageCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 移动端全屏展示 */}
      {isExpanded && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Messages</h2>
            <button onClick={toggleExpand} className="text-blue-500 text-lg">Close</button>
          </div>
          <div className="p-4 overflow-y-auto h-full">
            {messages.map(([level, msg], i) => (
              <Message
                key={messages.length - i}
                title={`${messages.length - i}`}
                message={msg}
                type={level === "info" ? "success" : "error"}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;