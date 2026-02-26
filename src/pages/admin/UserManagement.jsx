import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../auth/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { role: newRole });

            // Optimistic UI update
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating sub role:", error);
            alert("Failed to update user role.");
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-black">
                    User Management
                </h2>
                <nav>
                    <ol className="flex items-center gap-2">
                        <li>
                            <span className="font-medium">Dashboard /</span>
                        </li>
                        <li className="font-medium text-blue-500">Users</li>
                    </ol>
                </nav>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white shadow-sm">
                <div className="py-6 px-4 md:px-6 xl:px-7.5">
                    <h4 className="text-xl font-semibold text-black">All Registered Users</h4>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-50 text-left">
                                    <th className="min-w-[220px] py-4 px-4 font-medium text-black xl:pl-11">User</th>
                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black">Email</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black">Role</th>
                                    <th className="min-w-[120px] py-4 px-4 font-medium text-black">Joined</th>
                                    <th className="py-4 px-4 font-medium text-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, key) => (
                                    <tr key={u.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-5 px-4 xl:pl-11">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                                    {u.photoURL ? (
                                                        <img src={u.photoURL} alt="User" className="w-full h-full object-cover" />
                                                    ) : (
                                                        u.displayName?.charAt(0).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <p className="text-black font-medium">{u.displayName || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <p className="text-black text-sm">{u.email}</p>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${u.role === 'admin' ? 'bg-purple-500 text-purple-600' : 'bg-green-500 text-green-600'
                                                }`}>
                                                {u.role === 'admin' ? 'Super Admin' : 'Basic User'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4">
                                            <p className="text-black text-sm">
                                                {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                                            </p>
                                        </td>
                                        <td className="py-5 px-4">
                                            <select
                                                value={u.role || 'user'}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default UserManagement;
