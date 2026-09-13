import { classNames } from '../utils/helpers';

const LoadingSpinner = ({ size = 'medium', className }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-6 h-6 border-2',
    large: 'w-8 h-8 border-3'
  };

  return (
    <div className={classNames('loading-spinner', sizeClasses[size], className)} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;