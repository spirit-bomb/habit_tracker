'use client';

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import {
    CheckCircle, Droplet, Monitor, Moon, Plus, Bell, ChevronRight,
    Award, TrendingUp, Clock, Zap, Flame,
    Activity, XCircle, Trash2, Home, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface DataPoint {
    day: string;
    value: number;
}

interface Habit {
    id: number;
    name: string;
    icon: string;
    target: number;
    unit: string;
    color: string;
    data: DataPoint[];
    streak: number;
}

interface Reminder {
    id: number;
    habitId: number;
    message: string;
    time: string;
}

// Sample data
const initialHabits: Habit[] = [
    {
        id: 1,
        name: 'Sleep',
        icon: 'Moon',
        target: 8,
        unit: 'hours',
        color: '#8B5CF6',
        data: [
            { day: 'Mon', value: 7.5 },
            { day: 'Tue', value: 8 },
            { day: 'Wed', value: 7 },
            { day: 'Thu', value: 8.5 },
            { day: 'Fri', value: 6.5 },
            { day: 'Sat', value: 9 },
            { day: 'Sun', value: 8.5 }
        ],
        streak: 5
    },
    {
        id: 2,
        name: 'Water',
        icon: 'Droplet',
        target: 8,
        unit: 'glasses',
        color: '#0EA5E9',
        data: [
            { day: 'Mon', value: 6 },
            { day: 'Tue', value: 7 },
            { day: 'Wed', value: 8 },
            { day: 'Thu', value: 8 },
            { day: 'Fri', value: 6 },
            { day: 'Sat', value: 5 },
            { day: 'Sun', value: 7 }
        ],
        streak: 3
    },
    {
        id: 3,
        name: 'Screen Time',
        icon: 'Monitor',
        target: 2,
        unit: 'hours',
        color: '#F43F5E',
        data: [
            { day: 'Mon', value: 3.5 },
            { day: 'Tue', value: 2.5 },
            { day: 'Wed', value: 2 },
            { day: 'Thu', value: 1.5 },
            { day: 'Fri', value: 3 },
            { day: 'Sat', value: 4 },
            { day: 'Sun', value: 3 }
        ],
        streak: 2
    },
    {
        id: 4,
        name: 'Exercise',
        icon: 'Activity',
        target: 30,
        unit: 'minutes',
        color: '#10B981',
        data: [
            { day: 'Mon', value: 45 },
            { day: 'Tue', value: 0 },
            { day: 'Wed', value: 30 },
            { day: 'Thu', value: 60 },
            { day: 'Fri', value: 15 },
            { day: 'Sat', value: 0 },
            { day: 'Sun', value: 45 }
        ],
        streak: 1
    }
];

export default function HabitTrackerApp() {
    const [habits, setHabits] = useState<Habit[]>(initialHabits);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
    const [showAddHabit, setShowAddHabit] = useState(false);
    const [newHabit, setNewHabit] = useState({name: '', target: 1, unit: ''});
    const [reminders, setReminders] = useState<Reminder[]>([
        {id: 1, habitId: 1, message: "Don't forget to log your sleep!", time: "09:00 AM"},
        {id: 2, habitId: 2, message: "Remember to drink water!", time: "11:30 AM"}
    ]);
    const [showReminderDialog, setShowReminderDialog] = useState(false);
    const [newReminder, setNewReminder] = useState({habitId: null as number | null, message: '', time: '08:00 AM'});
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        // Add window resize listener for responsive design
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            // Set initial width
            setWindowWidth(window.innerWidth);
        }

        return () => {
            clearTimeout(timer);
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    const selectedHabit = selectedHabitId !== null ? habits.find(h => h.id === selectedHabitId) : null;

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'Moon':
                return <Moon/>;
            case 'Droplet':
                return <Droplet/>;
            case 'Monitor':
                return <Monitor/>;
            case 'Activity':
                return <Activity/>;
            case 'CheckCircle':
                return <CheckCircle/>;
            case 'Flame':
                return <Flame/>;
            case 'Zap':
                return <Zap/>;
            default:
                return <CheckCircle/>;
        }
    };

    const handleAddHabit = () => {
        if (!newHabit.name.trim()) return;

        const newId = Math.max(...habits.map(h => h.id), 0) + 1;
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const habit: Habit = {
            id: newId,
            name: newHabit.name,
            icon: 'CheckCircle',
            target: parseFloat(newHabit.target.toString()) || 1,
            unit: newHabit.unit || 'times',
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            data: days.map(day => ({day, value: 0})),
            streak: 0
        };

        setHabits([...habits, habit]);
        setNewHabit({name: '', target: 1, unit: ''});
        setShowAddHabit(false);
    };

    const handleLogHabit = (habitId: number, value: number) => {
        setHabits(habits.map(habit => {
            if (habit.id === habitId) {
                const newData = [...habit.data];
                // Update today's value (for demo we'll update Sunday)
                newData[6] = {...newData[6], value};

                // Update streak
                let streak = habit.streak;
                if (value >= habit.target) {
                    streak += 1;
                } else {
                    streak = 0;
                }

                return {...habit, data: newData, streak};
            }
            return habit;
        }));
    };

    const handleDeleteHabit = (habitId: number) => {
        setHabits(habits.filter(h => h.id !== habitId));
        // Also delete associated reminders
        setReminders(reminders.filter(r => r.habitId !== habitId));

        if (selectedHabitId === habitId) {
            setSelectedHabitId(null);
        }
    };

    const handleAddReminder = () => {
        if (!newReminder.message.trim() || newReminder.habitId === null) return;

        const newId = Math.max(...reminders.map(r => r.id), 0) + 1;
        setReminders([...reminders, {...newReminder, id: newId, habitId: Number(newReminder.habitId)}]);
        setNewReminder({habitId: null, message: '', time: '08:00 AM'});
        setShowReminderDialog(false);
    };

    const calculatePerformance = (habit: Habit) => {
        const totalDays = habit.data.length;
        const daysOnTarget = habit.data.filter(d => d.value >= habit.target).length;
        return Math.round((daysOnTarget / totalDays) * 100);
    };

    const getBackgroundClasses = () => {
        return darkMode
            ? "bg-gray-900 text-white min-h-screen transition-colors duration-300"
            : "bg-gray-100 text-gray-900 min-h-screen transition-colors duration-300";
    };

    const getCardClasses = () => {
        return darkMode
            ? "bg-gray-800 shadow-xl rounded-xl"
            : "bg-white shadow-lg rounded-xl";
    };

    const renderStats = () => (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
            className="space-y-6 pb-20 md:pb-6"
        >
            <div className={`${getCardClasses()} p-6`}>
                <h2 className="text-xl font-bold mb-4">Habit Statistics</h2>

                <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={habits.map(habit => ({
                                name: habit.name,
                                success: calculatePerformance(habit),
                                color: habit.color
                            }))}
                            margin={{top: 20, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                           stroke={darkMode ? '#374151' : '#f3f4f6'}/>
                            <XAxis dataKey="name" tick={{fill: darkMode ? '#9ca3af' : '#6b7280'}}/>
                            <YAxis unit="%" tick={{fill: darkMode ? '#9ca3af' : '#6b7280'}}/>
                            <Tooltip/>
                            <Bar dataKey="success" name="Success Rate">
                                {habits.map((habit, index) => (
                                    <Cell key={`cell-${index}`} fill={habit.color}/>
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                    <h3 className="font-medium">Habit Performance Summary</h3>
                    {habits.map(habit => (
                        <div key={habit.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="p-2 rounded-full mr-2" style={{backgroundColor: habit.color + '20'}}>
                                    <div style={{color: habit.color}}>{getIconComponent(habit.icon)}</div>
                                </div>
                                <span>{habit.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className={`text-sm px-2 py-1 rounded-full ${
                                    calculatePerformance(habit) >= 70
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : calculatePerformance(habit) >= 40
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                    {calculatePerformance(habit)}%
                                </div>
                                <div className="flex items-center">
                                    <Flame className="text-orange-500 mr-1" size={16}/>
                                    <span>{habit.streak}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`${getCardClasses()} p-6`}>
                <h2 className="text-xl font-bold mb-4">Weekly Overview</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                const dayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day);
                                return {
                                    day,
                                    ...habits.reduce((acc, habit) => {
                                        acc[habit.name] = habit.data[dayIndex]?.value || 0;
                                        return acc;
                                    }, {} as Record<string, number>)
                                };
                            })}
                            margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                           stroke={darkMode ? '#374151' : '#f3f4f6'}/>
                            <XAxis dataKey="day" tick={{fill: darkMode ? '#9ca3af' : '#6b7280'}}/>
                            <YAxis tick={{fill: darkMode ? '#9ca3af' : '#6b7280'}}/>
                            <Tooltip/>
                            {habits.map(habit => (
                                <Line
                                    key={habit.id}
                                    type="monotone"
                                    dataKey={habit.name}
                                    stroke={habit.color}
                                    strokeWidth={2}
                                    activeDot={{r: 8}}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div
                className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="text-center">
                    <div className="text-white text-2xl font-bold mb-4">HabitSync</div>
                    <div className="relative h-2 w-64 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-white rounded-full"
                            initial={{width: 0}}
                            animate={{width: "100%"}}
                            transition={{duration: 1.5, ease: "easeInOut"}}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const isDesktop = windowWidth > 1024;

    const renderDashboard = () => (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.5}}
            className="space-y-6 pb-20 md:pb-6"
        >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-4">Your Progress Hub</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{habits.reduce((sum, h) => sum + h.streak, 0)}</div>
                        <div className="text-xs">Active Streaks</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">
                            {Math.round(habits.reduce((sum, h) => sum + calculatePerformance(h), 0) / habits.length)}%
                        </div>
                        <div className="text-xs">Success Rate</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{habits.length}</div>
                        <div className="text-xs">Habits</div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-sm">Weekly Overview</h3>
                        <div className="text-xs opacity-75">All habits combined</div>
                    </div>
                    <div className="h-24 md:h-32 lg:h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                    const dayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(day);
                                    const completedHabits = habits.filter(h =>
                                        h.data[dayIndex] && h.data[dayIndex].value >= h.target
                                    ).length;
                                    const percentage = (completedHabits / habits.length) * 100;
                                    return {
                                        day,
                                        completionRate: percentage
                                    };
                                })}
                                margin={{top: 5, right: 0, left: 0, bottom: 5}}
                            >
                                <defs>
                                    <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFF" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#FFF" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    tick={{fill: '#FFF', fontSize: 10}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completionRate"
                                    stroke="#FFF"
                                    fill="url(#colorCompletion)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Your Habits</h2>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className="text-sm flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                    >
                        <BarChart2 size={14}/>
                        <span>Stats</span>
                    </button>
                </div>

                <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
                    <AnimatePresence>
                        {habits.map((habit, index) => (
                            <motion.div
                                key={habit.id}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                transition={{duration: 0.3, delay: index * 0.1}}
                                className={`${getCardClasses()} p-5 cursor-pointer transition-all duration-300 hover:shadow-xl`}
                                onClick={() => setSelectedHabitId(habit.id)}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full mr-3"
                                             style={{backgroundColor: habit.color + '20'}}>
                                            <div className="text-lg"
                                                 style={{color: habit.color}}>{getIconComponent(habit.icon)}</div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{habit.name}</h3>
                                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Target: {habit.target} {habit.unit}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="mr-3 text-right">
                                            <div
                                                className="font-bold">{habit.streak} day{habit.streak !== 1 ? 's' : ''}</div>
                                            <div
                                                className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current
                                                streak
                                            </div>
                                        </div>
                                        <ChevronRight className={darkMode ? 'text-gray-500' : 'text-gray-400'}
                                                      size={20}/>
                                    </div>
                                </div>

                                <div className="h-24">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={habit.data}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                                           stroke={darkMode ? '#374151' : '#f3f4f6'}/>
                                            <XAxis
                                                dataKey="day"
                                                tick={{fontSize: 10, fill: darkMode ? '#9ca3af' : '#6b7280'}}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                hide
                                                domain={[0, Math.max(habit.target * 1.5, ...habit.data.map(d => d.value))]}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke={habit.color}
                                                strokeWidth={2.5}
                                                dot={{fill: habit.color, r: 4}}
                                                activeDot={{
                                                    r: 6,
                                                    fill: habit.color,
                                                    stroke: darkMode ? '#111827' : '#ffffff',
                                                    strokeWidth: 2
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center text-sm">
                                            <TrendingUp size={16} className="mr-1 text-indigo-500"/>
                                            <span>{calculatePerformance(habit)}% success rate</span>
                                        </div>
                                        <div className="text-sm font-medium" style={{color: habit.color}}>
                                            Today: {habit.data[6].value} {habit.unit}
                                        </div>
                                    </div>

                                    <div className="relative pt-1">
                                        <input
                                            type="range"
                                            min="0"
                                            max={habit.target * 2}
                                            step={habit.unit === 'hours' ? 0.5 : 1}
                                            value={habit.data[6].value}
                                            onChange={(e) => handleLogHabit(habit.id, parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div
                                            className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <div>0</div>
                                            <div className="relative">
                                                <div
                                                    className="absolute -top-1 w-0.5 h-2 bg-gray-400 left-1/2 -translate-x-1/2"></div>
                                                <div>{habit.target}</div>
                                            </div>
                                            <div>{habit.target * 2}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {habits.length === 0 && (
                        <div className={`${getCardClasses()} p-8 text-center md:col-span-2 lg:col-span-3`}>
                            <div className="text-gray-500 dark:text-gray-400 mb-3">No habits tracked yet</div>
                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg inline-flex items-center"
                                onClick={() => setShowAddHabit(true)}
                            >
                                <Plus size={16} className="mr-1"/>
                                Add your first habit
                            </button>
                        </div>
                    )}
                </div>

                <motion.button
                    className={`mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full p-4 shadow-lg fixed ${isDesktop ? 'bottom-6 right-6' : 'bottom-20 right-4'} z-10`}
                    onClick={() => setShowAddHabit(true)}
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.95}}
                >
                    <Plus/>
                </motion.button>
            </div>
        </motion.div>
    );

    const renderHabitDetail = () => {
        if (!selectedHabit) return null;

        return (
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{duration: 0.3}}
                className="pb-20 md:pb-6 space-y-6"
            >
                <button
                    className="mb-4 text-indigo-600 dark:text-indigo-400 flex items-center"
                    onClick={() => setSelectedHabitId(null)}
                >
                    <ChevronRight className="rotate-180 mr-1"/> Back to habits
                </button>

                <div className={`${getCardClasses()} p-6`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full mr-4"
                                 style={{backgroundColor: selectedHabit.color + '20'}}>
                                <div className="text-xl" style={{color: selectedHabit.color}}>
                                    {getIconComponent(selectedHabit.icon)}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{selectedHabit.name}</h2>
                                <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                    Target: {selectedHabit.target} {selectedHabit.unit} daily
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteHabit(selectedHabit.id);
                                }}
                            >
                                <Trash2 size={18} className="text-red-500"/>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                        <div className="flex items-center">
                            <Flame className="mr-1 text-orange-500"/>
                            <div className="font-bold text-lg">{selectedHabit.streak} day streak</div>
                        </div>
                        <div className={`text-sm px-3 py-1 rounded-full text-center ${
                            calculatePerformance(selectedHabit) >= 70
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : calculatePerformance(selectedHabit) >= 40
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {calculatePerformance(selectedHabit)}% success rate
                        </div>
                    </div>

                    <div className="h-64 mb-6 md:h-72 lg:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={selectedHabit.data} margin={{top: 10, right: 10, left: 0, bottom: 10}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}
                                               stroke={darkMode ? '#374151' : '#f3f4f6'}/>
                                <XAxis
                                    dataKey="day"
                                    tick={{fill: darkMode ? '#9ca3af' : '#6b7280'}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, Math.max(selectedHabit.target * 1.5, ...selectedHabit.data.map(d => d.value))]}
                                    tick={{fill: darkMode ? '#9ca3af' : '#6b7280'}}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                        borderColor: darkMode ? '#374151' : '#e5e7eb',
                                        color: darkMode ? '#f9fafb' : '#111827'
                                    }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill={selectedHabit.color}
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className={`p-4 sm:p-5 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-indigo-50/80'}`}>
                        <h3 className="font-bold mb-3">Log today's progress</h3>
                        <div className="flex items-center">
                            <input
                                type="range"
                                min="0"
                                max={selectedHabit.target * 2}
                                step={selectedHabit.unit === 'hours' ? 0.5 : 1}
                                value={selectedHabit.data[6].value}
                                onChange={(e) => handleLogHabit(selectedHabit.id, parseFloat(e.target.value))}
                                className="flex-grow h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="ml-4 font-bold text-lg w-16 text-center"
                                 style={{color: selectedHabit.color}}>
                                {selectedHabit.data[6].value} <span
                                className="text-xs font-normal">{selectedHabit.unit}</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <div>0</div>
                            <div className="relative">
                                <div className="absolute -top-1 w-0.5 h-2 bg-gray-400 left-1/2 -translate-x-1/2"></div>
                                <div
                                    className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedHabit.target}</div>
                            </div>
                            <div>{selectedHabit.target * 2}</div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                How much did you {selectedHabit.name.toLowerCase()} today?
                                {selectedHabit.data[6].value >= selectedHabit.target ? (
                                    <span className="ml-2 inline-flex items-center text-green-600 dark:text-green-400">
                                    <CheckCircle size={14} className="mr-1"/> Target reached!
                                </span>
                                ) : (
                                    <span className="ml-2 inline-flex items-center text-yellow-600 dark:text-yellow-400">
                                    <Clock size={14} className="mr-1"/> {Math.round((selectedHabit.data[6].value / selectedHabit.target) * 100)}% of daily target
                                </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${getCardClasses()} p-6`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Reminders</h3>
                        <button
                            onClick={() => {
                                setNewReminder({...newReminder, habitId: selectedHabit.id});
                                setShowReminderDialog(true);
                            }}
                            className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center"
                        >
                            <Plus size={16} className="mr-1"/>
                            Add Reminder
                        </button>
                    </div>

                    <div className="space-y-3">
                        {reminders.filter(r => r.habitId === selectedHabit.id).length > 0 ? (
                            reminders.filter(r => r.habitId === selectedHabit.id).map(reminder => (
                                <div
                                    key={reminder.id}
                                    className={`p-3 rounded-lg flex justify-between items-center ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                                >
                                    <div className="flex items-center">
                                        <Bell size={16} className="mr-2 text-indigo-500"/>
                                        <div>
                                            <div className="font-medium">{reminder.message}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {reminder.time}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                        onClick={() => setReminders(reminders.filter(r => r.id !== reminder.id))}
                                    >
                                        <XCircle size={16} className="text-gray-400 hover:text-red-500"/>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                No reminders set for this habit
                            </div>
                        )}
                    </div>
                </div>

                <div className={`${getCardClasses()} p-6`}>
                    <h3 className="font-bold mb-4">Stats & Insights</h3>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Best day</div>
                            <div className="font-bold mt-1">
                                {selectedHabit.data.reduce((best, current) =>
                                    current.value > best.value ? current : best
                                ).day}
                            </div>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Avg per day</div>
                            <div className="font-bold mt-1">
                                {(selectedHabit.data.reduce((sum, day) => sum + day.value, 0) /
                                    selectedHabit.data.length).toFixed(1)} {selectedHabit.unit}
                            </div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center mb-2">
                            <Award className="mr-2 text-indigo-500"/>
                            <div className="font-medium">Achievement</div>
                        </div>
                        <div className="text-sm">
                            {selectedHabit.streak >= 7 ? (
                                "Week warrior! You've maintained this habit for a full week!"
                            ) : selectedHabit.streak >= 3 ? (
                                "Building momentum! Keep going to reach a week streak!"
                            ) : (
                                "Just getting started. Consistency is key!"
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const bottomNav = () => {
        const isDesktop = windowWidth > 1024;

        const navClasses = isDesktop
            ? "fixed bottom-6 left-1/2 -translate-x-1/2 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 py-2 px-6 z-20"
            : "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-20";

        const buttonClasses = (tabName: string) => `
    p-2 ${isDesktop ? 'px-4' : 'rounded-md'} flex ${isDesktop ? 'flex-row' : 'flex-col'} items-center 
    ${activeTab === tabName
            ? 'text-indigo-600 dark:text-indigo-400' + (isDesktop ? ' bg-indigo-50 dark:bg-indigo-900/20 rounded-full' : '')
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
    transition-colors duration-200
  `;

        const labelClasses = isDesktop ? "ml-2" : "text-xs mt-1";

        return (
            <div className={navClasses}>
                <div className="flex justify-around">
                    <button
                        className={buttonClasses('dashboard')}
                        onClick={() => {
                            setActiveTab('dashboard');
                            setSelectedHabitId(null);
                        }}
                    >
                        <Home size={isDesktop ? 18 : 20} />
                        <span className={labelClasses}>Home</span>
                    </button>
                    <button
                        className={buttonClasses('stats')}
                        onClick={() => {
                            setActiveTab('stats');
                            setSelectedHabitId(null);
                        }}
                    >
                        <BarChart2 size={isDesktop ? 18 : 20} />
                        <span className={labelClasses}>Stats</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={getBackgroundClasses()}>
            <div className="container mx-auto px-4 md:px-20 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg mr-3">
                            <Zap size={20} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">HabitSync</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                            onClick={() => setDarkMode(!darkMode)}
                        >
                            {darkMode ? <Moon size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mb-16 md:mb-0">
                    {selectedHabitId !== null ? (
                        renderHabitDetail()
                    ) : activeTab === 'dashboard' ? (
                        renderDashboard()
                    ) : activeTab === 'stats' ? (
                        renderStats()
                    ) : null}
                </div>

                {bottomNav()}

                {/* Overlay */}

                {/* Add Habit Dialog */}
                {showAddHabit && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`${getCardClasses()} p-6 w-full max-w-md`}
                        >
                            <h2 className="text-xl font-bold mb-4">Add New Habit</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Habit Name</label>
                                    <input
                                        type="text"
                                        className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                        placeholder="e.g., Meditation"
                                        value={newHabit.name}
                                        onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Target</label>
                                        <input
                                            type="number"
                                            className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                            placeholder="e.g., 20"
                                            value={newHabit.target}
                                            onChange={(e) => setNewHabit({...newHabit, target:parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Unit</label>
                                        <input
                                            type="text"
                                            className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                            placeholder="e.g., minutes"
                                            value={newHabit.unit}
                                            onChange={(e) => setNewHabit({...newHabit, target:parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                        onClick={() => setShowAddHabit(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        onClick={handleAddHabit}
                                    >
                                        Add Habit
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Add Reminder Dialog */}
                {showReminderDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`${getCardClasses()} p-6 w-full max-w-md`}
                        >
                            <h2 className="text-xl font-bold mb-4">Add Reminder</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Message</label>
                                    <input
                                        type="text"
                                        className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                        placeholder="e.g., Time to drink water!"
                                        value={newReminder.message}
                                        onChange={(e) => setNewReminder({...newReminder, message: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Time</label>
                                    <input
                                        type="text"
                                        className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                        placeholder="e.g., 08:00 AM"
                                        value={newReminder.time}
                                        onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                        onClick={() => setShowReminderDialog(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        onClick={handleAddReminder}
                                    >
                                        Add Reminder
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}