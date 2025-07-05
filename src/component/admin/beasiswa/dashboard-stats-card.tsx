import React, { useEffect, useState } from "react";
import { fetchDashboardStats } from "./dashboard-beswan-table";

const DashboardStatsCard: React.FC = () => {
  const [stats, setStats] = useState({ totalBeswan: 0, totalDocuments: 0, totalDiterima: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 w-full sm:grid-cols-2">
      {/* Total Beswan yang Lolos */}
      <div className="p-6 w-full bg-white rounded shadow">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Beswan yang Lolos</h3>
            <p className="text-2xl font-bold">{loading ? '...' : stats.totalDiterima}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Pendaftar */}
      <div className="p-6 w-full bg-white rounded shadow">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Pendaftar</h3>
            <p className="text-2xl font-bold">{loading ? '...' : stats.totalBeswan}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsCard; 