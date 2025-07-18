import StatCard from "../components/StatCard";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DashboardCharts from "../components/DashboardCharts";
import BlogTable from "../components/BlogTable";
import { RiArticleLine, RiMailLine, RiMailAddLine, RiEyeLine } from "react-icons/ri";

export default function Dashboard() {
  const stats = [
    { title: "Total Blog Posts", value: "156", change: "+8 posts this month", icon: <RiArticleLine className="text-primary" />, color: "text-primary" },
    { title: "Total Leads", value: "482", change: "+12.5% conversion rate", icon: <RiMailLine className="text-green-600" />, color: "text-green-600" },
    { title: "Newsletter Subscribers", value: "2,845", change: "+16.8% vs last month", icon: <RiMailAddLine className="text-yellow-500" />, color: "text-yellow-500" },
    { title: "Monthly Page Views", value: "45.2K", change: "+22.4% vs last month", icon: <RiEyeLine className="text-pink-500" />, color: "text-pink-500" }
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <Header />
        <main className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
          <DashboardCharts />
          <BlogTable />
        </main>
      </div>
    </div>
  );
}