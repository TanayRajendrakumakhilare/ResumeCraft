interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = [
  "Personal Details",
  "Experience", 
  "Education",
  "Skills",
  "Review"
];

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div key={stepNumber} className="flex items-center space-x-2">
                  {index > 0 && (
                    <div className={`w-12 h-0.5 ${isCompleted ? 'bg-primary' : 'bg-gray-300'}`} />
                  )}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isActive
                          ? 'bg-primary text-white'
                          : isCompleted
                          ? 'bg-primary text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                      data-testid={`step-indicator-${stepNumber}`}
                    >
                      {stepNumber}
                    </div>
                    <span
                      className={`font-medium ${
                        isActive ? 'text-primary' : 'text-secondary'
                      } hidden sm:inline`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="text-sm text-secondary" data-testid="progress-text">
            Step {currentStep} of {totalSteps} • {percentage}% Complete
          </div>
        </div>
      </div>
    </div>
  );
}
