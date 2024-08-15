import React, { useState, useEffect } from "react";
import Message from "./message";
import { History } from "lucide-react";

interface NotificationProps {
  messages: ["info" | "error", string][];
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
      <div
        className={`fixed right-0 top-16 z-50 w-[420px] transition-transform duration-300 ease-in-out ${isExpanded ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
      >
        {isExpanded ? (
          <div className="relative overflow-hidden rounded-md bg-white shadow-lg md:max-h-96">
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
            <div className="pb-4 pr-4 text-right">
              <button
                onClick={toggleExpand}
                className="text-blue-500 underline"
              >
                Collapse
              </button>
            </div>
          </div>
        ) : (
          <div
            className="fixed bottom-0 right-0 mb-4 mr-4 flex cursor-pointer items-center md:bottom-auto md:right-4 md:top-16"
            onClick={toggleExpand}
          >
            <History className="h-8 w-8" />
            {messageCount > 0 && (
              <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                {messageCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 移动端全屏展示 */}
      {!isExpanded && (
        <div
          className="fixed right-4 top-4 z-50 md:hidden"
          onClick={toggleExpand}
        >
          <div className="relative cursor-pointer">
            <History className="h-8 w-8 " />
            {messageCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                {messageCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 移动端全屏展示 */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <button onClick={toggleExpand} className="text-lg">
              Close
            </button>
          </div>
          <div className="h-full overflow-y-auto p-4">
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
