import StatCard from "../components/StatCard";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DashboardCharts from "../components/DashboardCharts";
import BlogTable from "../components/BlogTable";
import { RiArticleLine, RiMailLine, RiMailAddLine, RiEyeLine } from "react-icons/ri";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
export default function Blogs(){
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
    useEffect(() => {
      const stats = async () => {
        try {
          const resp = await axios.get(`${API_URL}/api/metrics`);
          const data = resp.data;
          console.log("Fetched stats:", data);
          return [
            {
              title: "Total Blogs Posts",
              value: data.total_blogs,
              icon: <RiArticleLine className="text-2xl text-blue-500" />
            },
            {
              title: "Total Leads",
              value: data.total_leads,
              icon: <RiMailLine className="text-2xl text-green-500" />
            },
            {
              title: "Newsletter Subscribers",
              value: data.total_newsletter_subscribers,
              icon: <RiMailAddLine className="text-2xl text-yellow-500" />
            },
            {
              title: "Monthly Page Views",
              value: data.total_views,
              icon: <RiEyeLine className="text-2xl text-red-500" />
            }
          ]
        } catch (error) {
          console.error("Error fetching stats:", error);
        }
      }
      stats().then(setStats);
    }, []
  );
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
