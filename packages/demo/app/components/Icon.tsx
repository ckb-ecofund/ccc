import React from "react";
import { icons, LucideProps } from "lucide-react";

interface IconProps extends Omit<LucideProps, "name"> {
  name: keyof typeof icons;
}

const Icon: React.FC<IconProps> = ({ name, color, size, ...props }) => {
  const LucideIcon = icons[name];

  // 如果图标名称无效，返回 null 或者可以返回一个占位图标
  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon color={color} size={size} {...props} />;
};

export default Icon;
