interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200"
    >
      {message}
    </div>
  );
}
