import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

interface LoadingIndicatorProps {
  message: string;
  progress?: number;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message, progress }) => {
  return (
    <div className="text-center py-12">
      <div className="relative mb-6">
        <div className="bg-gradient-to-r from-primary-100 to-primary-200 p-4 rounded-2xl inline-block animate-pulse-slow">
          <Camera className="h-12 w-12 text-primary-600" />
        </div>
        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1.5 animate-bounce">
          <Sparkles className="h-3 w-3 text-yellow-900" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-3">
        {message}
      </h3>

      {progress !== undefined && (
        <div className="w-full max-w-xs mx-auto mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-2">{progress}% complete</div>
        </div>
      )}

      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingIndicator;