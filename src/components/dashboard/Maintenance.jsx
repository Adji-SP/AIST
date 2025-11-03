import React, { useState, useEffect } from 'react';
// Icon yang dibutuhkan telah ditambahkan
import {
    CalendarDays, ChevronLeft, ChevronRight, CheckCircle, Wind,
    Droplet, Leaf, AlarmClock, ListTodo, CircleAlert, CalendarClock, CheckCheck, PlusCircle, Trash2, X
} from 'lucide-react';
import Header from '../layout/header';
import Sidebar from '../layout/sidebar';

// =================================================================================
// Data Deskripsi Tugas
// =================================================================================
const TASK_DESCRIPTIONS = {
    conventional: {
        'Apply Pesticide + Foliar': 'Dilute solution 1000ml water(3 types of Pesticide (mix and matched from list) - Total 2 Liter) + 2 types Foliar (1litre + 500gm))',
        'Fertilizer_14': 'DEEBAJ SUPERGRO NPK x 2unit + Agroharta 2kg',
        'Fertilizer_24': 'Organic Fertiliser Guang Fong 25KG x 5unit'
    },
    regenerative: {
        'Apply Pesticide': 'Dilute solution 1000ml water(3 types of Pesticide (mix and matched from list) - Total 2L)',
        'Inject Microalgae': '6000L of Microalgae water'
    }
};


// =================================================================================
// Professional UI Components Tailored for this Page
// =================================================================================

const TaskMetricCard = ({ value, label, icon: Icon, color = "slate" }) => {
    const colors = {
        slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
        green: { bg: 'bg-green-100', text: 'text-green-600' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        red: { bg: 'bg-red-100', text: 'text-red-600' },
    };
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-3xl font-bold text-slate-800">{value}</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors[color].bg}`}>
                    <Icon className={`w-6 h-6 ${colors[color].text}`} />
                </div>
            </div>
        </div>
    );
};

const TaskCalendar = ({ events: monthEvents, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();

    const getEventsForDay = (day, allEvents) => {
        if (!day) return [];
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return allEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === targetDate.getFullYear() &&
                eventDate.getMonth() === targetDate.getMonth() &&
                eventDate.getDate() === targetDate.getDate();
        });
    };

    const navigateMonth = (direction) => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    const goToToday = () => setCurrentDate(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const calendarDays = Array(startDayOfMonth).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Task Schedule Calendar</h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="font-semibold w-36 text-center">{currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                    <button onClick={goToToday} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">Today</button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center font-semibold text-sm text-slate-600 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {calendarDays.map((day, index) => {
                    const eventsOnDay = getEventsForDay(day, monthEvents);
                    const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                    return (
                        <div key={index} className={`bg-white min-h-28 p-2 ${isToday ? 'bg-blue-50 border-2 border-blue-400' : ''}`}>
                            <span className={`font-semibold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</span>
                            <div className="space-y-1 mt-1">
                                {eventsOnDay.map((event, i) => (
                                    <div key={i} onClick={() => onEventClick(event)}
                                        className={`text-xs text-white rounded px-1.5 py-1 truncate cursor-pointer ${event.type === 'conventional' ? 'bg-orange-500 hover:bg-orange-600' :
                                            event.type === 'regenerative' ? 'bg-green-500 hover:bg-green-600' :
                                                'bg-blue-500 hover:bg-blue-600'
                                            }`}>
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const UpcomingSchedule = ({ events }) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcoming = events.filter(event => new Date(event.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
    const getIconForCategory = (category) => {
        switch (category) {
            case 'Pesticides': return <Wind className="w-5 h-5 text-green-600" />;
            case 'Soil Agent': return <Leaf className="w-5 h-5 text-green-600" />;
            case 'Manual Input': return <PlusCircle className="w-5 h-5 text-blue-600" />;
            default: return <Droplet className="w-5 h-5 text-orange-600" />
        }
    };
    const daysUntil = (dateStr) => {
        const date = new Date(dateStr);
        const diffTime = date.getTime() - today.getTime(); const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today'; if (days === 1) return 'Tomorrow'; return `${days} days`;
    };
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Upcoming Schedule</h3>
            {upcoming.length > 0 ? (
                <div className="space-y-4"> {upcoming.map((event, i) => (<div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200"> <div className="bg-white p-3 rounded-lg border border-slate-200">{getIconForCategory(event.category)}</div> <div> <p className="font-bold text-slate-800">{event.title}</p> <p className="text-sm text-slate-500">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p> </div> <div className="ml-auto text-right"> <div className="font-bold text-green-600 text-lg flex items-center gap-1.5"><AlarmClock className="w-5 h-5" /> {daysUntil(event.date)}</div> </div> </div>))} </div>
            ) : (<p className="text-center text-slate-500 py-8">No upcoming tasks found in the schedule.</p>)}
        </div>
    );
}

const OverdueTasksCard = ({ tasks, onToggle }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Actionable Tasks (Overdue)</h3>
        {tasks.length > 0 ? (
            <ul className="space-y-3">
                {tasks.map(task => (
                    <li key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <button
                            onClick={() => onToggle(task.id)}
                            className={`w-6 h-6 mt-1 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${task.isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-slate-300 hover:border-green-500'
                                }`}
                        >
                            {task.isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-grow">
                            <p className={`font-medium ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.title}</p>
                            {task.description && (
                                <p className={`text-xs ${task.isCompleted ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                                    {task.description}
                                </p>
                            )}
                            <p className={`text-sm mt-1 ${task.isCompleted ? 'text-slate-400' : 'text-red-500'}`}>
                                Due: {new Date(task.date).toLocaleDateString('en-US')}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                <p className="font-semibold text-slate-700">No Overdue Tasks</p>
                <p className="text-sm text-slate-500">You're all caught up. Great job!</p>
            </div>
        )}
    </div>
);


const ManualEventInput = ({ onAddEvent }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !date) {
            setError('Judul dan Tanggal wajib diisi.');
            return;
        }

        const [year, month, day] = date.split('-').map(Number);
        const correctedDate = new Date(year, month - 1, day);

        onAddEvent({
            id: `manual-${Date.now()}`,
            date: correctedDate,
            title,
            description,
            type: 'manual',
            category: 'Manual Input',
            isCompleted: false,
        });

        setTitle('');
        setDescription('');
        setDate('');
        setError('');
    };

    return (
        <div className="bg-white p-6 mt-8 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Add Manual Task</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Cek sistem irigasi" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description (Opsional)</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Pastikan semua sprinkler berfungsi dengan baik"></textarea>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div>
                    <button type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        <PlusCircle className="w-5 h-5" /> Add to Calendar
                    </button>
                </div>
            </form>
        </div>
    );
};

// [UPDATED] Komponen Modal dengan Efek Blur
const TaskDetailModal = ({ isOpen, onClose, task, onDelete }) => {
    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex justify-center items-center p-4 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{task.title}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 pb-4 border-b">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(task.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h3 className="text-md font-semibold text-slate-800 mb-2">Items/Deskripsi:</h3>
                <p className="text-slate-600 mb-6 min-h-[40px]">
                    {task.description || 'Tidak ada deskripsi untuk tugas ini.'}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" /> Delete Tasks
                    </button>
                </div>
            </div>
        </div>
    );
};

const TaskSchedulePage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [allEvents, setAllEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        let generatedEvents = [];
        const today = new Date();
        for (let i = -1; i < 12; i++) {
            const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth();
            const isConventional = year < 2024 || (year === 2024 && month < 8);
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const idPrefix = `${date.toISOString()}`;

                if (isConventional) {
                    if ([10, 20, 30].includes(day)) {
                        generatedEvents.push({ id: `${idPrefix}-pesticide`, date, title: 'Apply Pesticide + Foliar', type: 'conventional', category: 'Agrochemicals', isCompleted: false, description: TASK_DESCRIPTIONS.conventional['Apply Pesticide + Foliar'] });
                    }
                    if (day === 14) {
                        generatedEvents.push({ id: `${idPrefix}-fertilizer`, date, title: 'Apply Fertilizer', type: 'conventional', category: 'Fertilizer', isCompleted: false, description: TASK_DESCRIPTIONS.conventional.Fertilizer_14 });
                    }
                    if (day === 24) {
                        generatedEvents.push({ id: `${idPrefix}-fertilizer-organic`, date, title: 'Apply Fertilizer', type: 'conventional', category: 'Fertilizer', isCompleted: false, description: TASK_DESCRIPTIONS.conventional.Fertilizer_24 });
                    }
                } else { // Regenerative
                    if ([1, 15].includes(day)) {
                        generatedEvents.push({ id: `${idPrefix}-pesticide-regen`, date, title: 'Apply Pesticide', type: 'regenerative', category: 'Pesticides', isCompleted: false, description: TASK_DESCRIPTIONS.regenerative['Apply Pesticide'] });
                    }
                    if (day === 24) {
                        generatedEvents.push({ id: `${idPrefix}-microalgae`, date, title: 'Inject Microalgae', type: 'regenerative', category: 'Soil Agent', isCompleted: false, description: TASK_DESCRIPTIONS.regenerative['Inject Microalgae'] });
                    }
                }
            }
        }
        setAllEvents(generatedEvents);
    }, []);


    const handleToggleTask = (taskId) => {
        setAllEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === taskId
                    ? { ...event, isCompleted: !event.isCompleted }
                    : event
            )
        );
    };

    const handleAddManualEvent = (newEvent) => {
        setAllEvents(prevEvents => [...prevEvents, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)));
    };

    const handleEventClick = (event) => {
        setSelectedTask(event);
        setIsModalOpen(true);
    };

    const handleDeleteTask = (taskId) => {
        setAllEvents(prevEvents => prevEvents.filter(event => event.id !== taskId));
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const oneWeekFromNow = new Date(); oneWeekFromNow.setDate(today.getDate() + 7);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const upcomingThisWeek = allEvents.filter(e => new Date(e.date) >= today && new Date(e.date) <= oneWeekFromNow).length;
    const overdueTasks = allEvents.filter(e => new Date(e.date) < today && !e.isCompleted);
    const completedThisMonth = allEvents.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth && e.isCompleted;
    }).length;
    const totalTasksThisMonth = allEvents.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
    }).length;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)} />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header onMenuClick={() => setSidebarOpen(true)} selectedGarden={"Site A (3 Acres)"} onGardenChange={() => { }} />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <TaskMetricCard value={upcomingThisWeek} label="Upcoming (Next 7 Days)" icon={CalendarClock} color="yellow" />
                        <TaskMetricCard value={overdueTasks.length} label="Overdue Tasks" icon={CircleAlert} color="red" />
                        <TaskMetricCard value={completedThisMonth} label="Completed (This Month)" icon={CheckCheck} color="green" />
                        <TaskMetricCard value={totalTasksThisMonth} label="Total Tasks (This Month)" icon={ListTodo} color="slate" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2">
                            <TaskCalendar events={allEvents} onEventClick={handleEventClick} />
                            <ManualEventInput onAddEvent={handleAddManualEvent} />
                        </div>
                        <div className="flex flex-col gap-8">
                            <UpcomingSchedule events={allEvents.filter(e => !e.isCompleted)} />
                            <OverdueTasksCard tasks={overdueTasks} onToggle={handleToggleTask} />
                        </div>
                    </div>
                </main>
            </div>
            <TaskDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
};

export default TaskSchedulePage;