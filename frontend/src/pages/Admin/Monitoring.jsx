import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import {
  MonitorHeart as MonitorIcon,
  Timeline as ChartIcon,
  Memory as RamIcon,
  Storage as DiskIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const Monitoring = () => {
  const [metrics, setMetrics] = useState({
    cpu: 18,
    memoryUsed: 1.25,
    memoryTotal: 4.0,
    dbPool: 8,
    kafkaLag: 0,
    diskSpace: 76.5,
    actuatorPing: 'UP'
  });

  useEffect(() => {
    // Simulate live actuator updates
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(5, prev.cpu + Math.floor(Math.random() * 7) - 3)),
        dbPool: Math.min(50, Math.max(3, prev.dbPool + Math.floor(Math.random() * 3) - 1)),
        memoryUsed: parseFloat(Math.min(prev.memoryTotal, Math.max(0.8, prev.memoryUsed + (Math.random() * 0.1) - 0.05)).toFixed(2))
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const getUsageColor = (val, max = 100) => {
    const pct = (val / max) * 100;
    if (pct >= 80) return 'bg-rose-500';
    if (pct >= 50) return 'bg-orange-500';
    return 'bg-teal-500';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-tight">System Monitoring</h1>
          <p className="text-slate-400 text-sm mt-1">
            System operations telemetry reports and server metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-450 border border-emerald-900 text-xs font-semibold uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Actuator: Connected (UP)
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-[#0f172a]/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">CPU Utilization</span>
            <span className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg"><SpeedIcon fontSize="small" /></span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-200 block">{metrics.cpu}%</span>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
              <div className={`h-full transition-all duration-500 ${getUsageColor(metrics.cpu)}`} style={{ width: `${metrics.cpu}%` }}></div>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0f172a]/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">JVM Heap Memory</span>
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><RamIcon fontSize="small" /></span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-extrabold text-slate-200">{metrics.memoryUsed} GB</span>
              <span className="text-xs text-slate-500 font-semibold">/ {metrics.memoryTotal} GB</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(metrics.memoryUsed / metrics.memoryTotal) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0f172a]/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Connections</span>
            <span className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg"><DiskIcon fontSize="small" /></span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-extrabold text-slate-200">{metrics.dbPool}</span>
              <span className="text-xs text-slate-500 font-semibold">/ 50 pool</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${(metrics.dbPool / 50) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0f172a]/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Logstash buffer lag</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><ChartIcon fontSize="small" /></span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-400 block">0 ms</span>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-500" style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
