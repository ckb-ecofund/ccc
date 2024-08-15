import React, { useState } from 'react';
import Icon from './Icon';
import { icons } from 'lucide-react';

interface DropdownProps {
  options: { name: string; iconName: keyof typeof icons }[];
  selected: string;
  onSelect: (option: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen); 
  };

  const handleSelect = (name: string) => {
    onSelect(name);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left my-4 w-60 z-50">
      <button
        onClick={handleToggle}
        className="inline-flex justify-between items-center w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        <Icon
          name={options.find(option => option.name === selected)?.iconName!!}
          className="mr-2"
        />
        {selected}
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
      {isOpen && ( // 仅当 isOpen 为 true 时才显示下拉菜单
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {options.map(({ name, iconName }) => (
              <button
                key={name}
                className={`flex items-center block w-full text-left px-4 py-2 text-sm ${
                  name === selected ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } hover:bg-gray-100 hover:text-gray-900`}
                onClick={() => handleSelect(name)}
              >
                <Icon name={iconName} className="mr-2" />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;