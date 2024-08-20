import React, { useState } from "react";
import { Icon } from "./Icon";
import { icons } from "lucide-react";

interface DropdownProps {
  options: {
    name: string;
    displayName?: string;
    iconName: keyof typeof icons;
  }[];
  selected: string;
  onSelect: (option: string) => void;
  className?: string;
}

export function Dropdown({
  options,
  selected,
  onSelect,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (name: string) => {
    onSelect(name);
    setIsOpen(false);
  };

  const selectedOption = options.find((option) => option.name === selected);

  return (
    <div className={`relative inline-block text-left ${className ?? ""}`}>
      <button
        onClick={handleToggle}
        className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        <Icon name={selectedOption?.iconName ?? "X"} className="mr-2" />
        {selectedOption?.displayName ?? selectedOption?.name}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {options.map(({ name, displayName, iconName }) => (
              <button
                key={name}
                className={`block flex w-full items-center px-4 py-2 text-left text-sm ${
                  name === selected
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700"
                } hover:bg-gray-100 hover:text-gray-900`}
                onClick={() => handleSelect(name)}
              >
                <Icon name={iconName} className="mr-2" />
                {displayName ?? name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
