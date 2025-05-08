interface ErrorMessageProps {
    message: string;
  }
  
  export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="text-red-600 font-medium mb-2">Error</div>
        <div className="text-gray-600 text-center">{message}</div>
      </div>
    );
  } 