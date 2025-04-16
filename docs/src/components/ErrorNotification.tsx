import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorNotificationProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
}

export function ErrorNotification({ message, isVisible, onDismiss }: ErrorNotificationProps) {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    setVisible(isVisible);
  }, [isVisible]);

  const dismiss = () => {
    setVisible(false);
    onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 p-4 z-50 shadow-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button 
              className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={dismiss}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
