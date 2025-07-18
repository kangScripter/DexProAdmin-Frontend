import React from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const DashboardCharts = () => {
  // Blog Performance Line Chart
  const blogChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Views",
        data: [1500, 2100, 1800, 2500, 2200, 2700, 3000],
        fill: false,
        backgroundColor: "#6B21A8",
        borderColor: "#6B21A8",
        tension: 0.4,
      },
    ],
  };

  const blogChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 500 },
      },
    },
  };

  // Lead Sources Donut Chart
  const leadChartData = {
    labels: ["Blog Posts", "Social Media", "Direct Search", "Referrals"],
    datasets: [
      {
        label: "Leads",
        data: [45, 25, 20, 10],
        backgroundColor: ["#8B5CF6", "#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 1,
      },
    ],
  };

  const leadChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#374151",
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 justify-center">
      {/* Blog Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Blog Performance</h3>
          <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm pr-8">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div className="w-full h-[300px]">
          <Line data={blogChartData} options={blogChartOptions} />
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 justify-center">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Lead Sources</h3>
          <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm pr-8">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div className="w-full h-[300px]">
          <Doughnut data={leadChartData} options={leadChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
