'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

const LoadingSpinner = ({ size = 'md', inline = false }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = inline 
    ? 'flex items-center justify-center'
    : 'min-h-screen flex items-center justify-center bg-gray-50';

  return (
    <div className={containerClasses}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-purple-500 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner; 