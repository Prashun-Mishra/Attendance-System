import React, { useState } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';
import API_URL from '../config/api';

const Dashboard = () => {
    const handleExport = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/attendance/export`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Attendance_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading excel:', error);
            alert('Failed to download report');
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
                    <p className="text-gray-500 mt-1">Manage attendance records and reports.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="group flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/30"
                >
                    <Download size={20} className="group-hover:-translate-y-1 transition-transform" />
                    Export to Excel
                </button>
            </div>

            <div className="glass rounded-3xl p-10 text-center shadow-xl border border-white/50">
                <div className="max-w-md mx-auto">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Download size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Reports</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Download the daily attendance logs in Excel format. The file includes timestamps, student details, and verification status.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
