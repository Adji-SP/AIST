// components/ui/Tasks.jsx
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const Tasks = ({ 
  tasks = [],
  title = "Tasks",
  onTaskToggle
}) => {
  // Default tasks if none provided
  const defaultTasks = [
    { 
      id: 1, 
      name: 'Watering', 
      time: '08:00 AM', 
      progress: 40, 
      completed: false, 
      description: 'Water plants with 1 inch of water in the morning' 
    },
    { 
      id: 2, 
      name: 'Fertilizing', 
      time: '06:00 AM', 
      progress: 100, 
      completed: true, 
      description: 'Apply organic fertilizer at base of plants. Quantity: 50g per plant' 
    },
    { 
      id: 3, 
      name: 'Pest Inspection', 
      time: '11:00 AM', 
      progress: 0, 
      completed: false, 
      description: 'Look for leaves for any signs of aphids or other pests' 
    },
    { 
      id: 4, 
      name: 'Soil Aeration', 
      time: '02:00 PM', 
      progress: 0, 
      completed: false, 
      description: 'Loosen soil around the plants stem without damaging roots' 
    }
  ];

  const tasksToShow = tasks.length > 0 ? tasks : defaultTasks;
  const completedTasks = tasksToShow.filter(task => task.completed).length;
  const totalTasks = tasksToShow.length;

  const handleTaskClick = (task) => {
    if (onTaskToggle) {
      onTaskToggle(task.id, !task.completed);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-sm text-gray-500">
          {completedTasks}/{totalTasks} completed
        </span>
      </div>
      
      <div className="space-y-4">
        {tasksToShow.map((task) => (
          <div key={task.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleTaskClick(task)}
                  className="transition-colors hover:scale-110"
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                <div>
                  <div className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.name}
                  </div>
                  <div className="text-sm text-gray-500">{task.time}</div>
                </div>
              </div>
              <span className="text-sm text-gray-500">{task.progress}%</span>
            </div>
            
            <div className="ml-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    task.completed ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <p className={`text-xs ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;