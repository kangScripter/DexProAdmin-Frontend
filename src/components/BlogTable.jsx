import { RiSearchLine, RiEditLine, RiDeleteBinLine, RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";

export default function BlogTable() {
  const blogData = [
    {
      avatar: "10",
      color: "bg-blue-500",
      title: "10 Proven SEO Strategies for 2025",
      subtitle: "Published on Apr 15, 2025",
      role: "SEO",
      roleColor: "bg-blue-100 text-blue-800",
      status: "Published",
      statusColor: "bg-green-100 text-green-800",
      lastActive: "2.9K views"
    },
    {
      avatar: "RW",
      color: "bg-green-500",
      title: "Robert Williams",
      subtitle: "robert.williams@example.com",
      role: "Editor",
      roleColor: "bg-purple-100 text-purple-800",
      status: "Active",
      statusColor: "bg-green-100 text-green-800",
      lastActive: "5 min ago"
    },
    {
      avatar: "SM",
      color: "bg-yellow-500",
      title: "Sophia Martinez",
      subtitle: "sophia.martinez@example.com",
      role: "Viewer",
      roleColor: "bg-yellow-100 text-yellow-800",
      status: "Inactive",
      statusColor: "bg-gray-100 text-gray-800",
      lastActive: "2 days ago"
    },
    {
      avatar: "DT",
      color: "bg-purple-500",
      title: "David Thompson",
      subtitle: "david.thompson@example.com",
      role: "Editor",
      roleColor: "bg-purple-100 text-purple-800",
      status: "Active",
      statusColor: "bg-green-100 text-green-800",
      lastActive: "1 hour ago"
    },
    {
      avatar: "OW",
      color: "bg-red-500",
      title: "Olivia Wilson",
      subtitle: "olivia.wilson@example.com",
      role: "Admin",
      roleColor: "bg-blue-100 text-blue-800",
      status: "Active",
      statusColor: "bg-green-100 text-green-800",
      lastActive: "3 hours ago"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Blog Posts Management</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search posts..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <RiSearchLine className="text-gray-400 text-sm" />
            </div>
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2 pr-8">
            <option>All Categories</option>
            <option>Technology</option>
            <option>Business</option>
            <option>Marketing</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 pr-8">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogData.map((row, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${row.color} rounded-full flex items-center justify-center text-white font-medium`}>
                      {row.avatar}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{row.title}</div>
                      <div className="text-sm text-gray-500">{row.subtitle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.roleColor}`}>
                    {row.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.statusColor}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{row.lastActive}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <RiEditLine />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">Showing 5 of 24 users</div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
            <RiArrowLeftSLine />
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`px-3 py-1 ${page === 1 ? "bg-primary text-white rounded" : "text-gray-500 hover:text-gray-700"}`}
            >
              {page}
            </button>
          ))}
          <button className="px-3 py-1 text-gray-500 hover:text-gray-700">
            <RiArrowRightSLine />
          </button>
        </div>
      </div>
    </div>
  );
}