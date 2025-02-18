import React from 'react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'dark' | 'light' | 'dimmed';
  sizeType?: 'short' | 'long';
  children: React.ReactNode;
}

const Button = ({
  variant = 'blue',
  sizeType = 'short',
  children,
  className,
  ...props
}: ButtonProps) => {
  const baseStyles = 'rounded-[8px] font-medium-18 flex items-center justify-center';

  const sizeStyles = {
    short: 'w-[12rem] h-[5.6rem]',
    long: 'w-[34.8rem] h-[5.6rem]',
  };

  const variantStyles = {
    blue: 'bg-blue text-white',
    dark: 'bg-darkgray100 text-white',
    light: 'bg-white text-black border border-lightgray500',
    dimmed: 'bg-transparent text-lightgray5',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[sizeType]} ${variantStyles[variant]} ${className}`}
      {...props}>
      {children}
    </button>
  );
};

export default Button;
