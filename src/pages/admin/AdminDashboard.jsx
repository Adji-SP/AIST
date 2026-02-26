import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../auth/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, HardDrive, Activity } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        devices: 0,
        activeDevices: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Users Count
                const usersSnap = await getDocs(collection(db, 'users'));
                const usersCount = usersSnap.size;

                // Fetch Devices Statistics
                const devicesSnap = await getDocs(collection(db, 'devices'));
                const devicesCount = devicesSnap.size;
                const activeCount = devicesSnap.docs.filter(doc => doc.data().status === 'active').length;

                setStats({
                    users: usersCount,
                    devices: devicesCount,
                    activeDevices: activeCount
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
        <div className="rounded-sm border border-gray-200 bg-white py-6 px-7.5 shadow-sm">
            <div className={`flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-50 ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h4 className="text-xl font-bold text-black">{value}</h4>
                    <span className="text-sm font-medium text-gray-500">{title}</span>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-green-500">
                    {subtitle}
                </span>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-black">
                    Analytics Dashboard
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <span className="font-medium">Dashboard /</span>
                        </li>
                        <li className="font-medium text-blue-500">Analytics</li>
                    </ol>
                </nav>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
                    <MetricCard
                        title="Total Users"
                        value={stats.users}
                        subtitle="+10% this week"
                        icon={Users}
                        colorClass="text-blue-500 bg-blue-50"
                    />
                    <MetricCard
                        title="Registered Devices"
                        value={stats.devices}
                        subtitle="All hardware"
                        icon={HardDrive}
                        colorClass="text-green-500 bg-green-50"
                    />
                    <MetricCard
                        title="Active Sensors"
                        value={stats.activeDevices}
                        subtitle={`${Math.round((stats.activeDevices / (stats.devices || 1)) * 100)}% uptime`}
                        icon={Activity}
                        colorClass="text-purple-500 bg-purple-50"
                    />
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
