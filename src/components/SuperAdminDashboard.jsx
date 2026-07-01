import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Building2,
  Eye,
} from "lucide-react";
import "../styles/Sat2FarmAdminPortal.css";

const GET_ADMIN_KEY_API_URL =
  import.meta.env.VITE_GET_ADMIN_KEY_API_URL;

const GET_ADMIN_INFO_API_URL =
  import.meta.env.VITE_GET_ADMIN_INFO_API_URL;

const FETCH_SUPERADMIN_AREA_API_URL =
  import.meta.env.VITE_FETCH_SUPERADMIN_AREA_API_URL;

export default function SuperAdminDashboard({
  user,
  onPageChange,
}) {
  const [adminInfo, setAdminInfo] = useState([]);
  const [areaData, setAreaData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchManagers();
  }, [user]);

  async function fetchManagers() {
    try {
      setLoading(true);
      setError(null);

      const phoneNumber =
        user?.phone_number ||
        user?.phoneNumber ||
        user?.phone ||
        user?.pNumber;

      if (!phoneNumber) {
        setError("Phone number not available");
        return;
      }

      // Get Admin Key
      const keyResponse = await fetch(
        `${GET_ADMIN_KEY_API_URL}?mobile_no=${phoneNumber}`
      );

      if (!keyResponse.ok) {
        throw new Error("Unable to fetch admin key");
      }

      const keyData = await keyResponse.json();
      const adminKey = keyData.api_key;

      if (!adminKey) {
        throw new Error("Admin key missing");
      }

      // Get Managers
      const managerResponse = await fetch(
        `${GET_ADMIN_INFO_API_URL}?key=${adminKey}`
      );

      if (!managerResponse.ok) {
        throw new Error("Unable to fetch managers");
      }

      const managerData = await managerResponse.json();

      setAdminInfo(
        Array.isArray(managerData)
          ? managerData
          : [managerData]
      );

      // Company Details
      const areaResponse = await fetch(
        `${FETCH_SUPERADMIN_AREA_API_URL}?mobile_no=${phoneNumber}`
      );

      if (areaResponse.ok) {
        const areaResult = await areaResponse.json();

        if (
          areaResult.status === "success" &&
          areaResult.data
        ) {
          setAreaData(areaResult.data);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const displayName =
    user?.name ||
    user?.fullName ||
    areaData?.company_name ||
    areaData?.organization_name ||
    areaData?.name ||
    "AGRICORE LTD";

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredManagers = useMemo(() => {
    let list = [...adminInfo];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();

      list = list.filter((m) => {
        return (
          m.full_name?.toLowerCase().includes(q) ||
          m.mobile_no?.includes(q) ||
          m.sub_admin_id?.toString().includes(q)
        );
      });
    }

    list.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.reg_date) -
          new Date(b.reg_date)
        );
      }

      return (
        new Date(b.reg_date) -
        new Date(a.reg_date)
      );
    });

    return list;
  }, [adminInfo, searchTerm, sortBy]);

  const handleCardClick = (manager) => {
    localStorage.setItem(
      "selectedManagerPhone",
      manager.mobile_no
    );

    onPageChange("manager-monthly-report");
  };

  return (
    <div className="main-full" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="topbar">
        <div className="tb-left">
          <div className="tb-page">Super Admin Dashboard</div>
        </div>

        <div className="tb-right">
          <div className="badge badge-green">Overview</div>
        </div>
      </div>

      <div className="content-area">
        <div className="sa-container">
          {/* ================= Welcome ================= */}
          <div className="sa-welcome">
            <div>
              <h1 className="sa-welcome-title">
                Welcome back,
                <span className="sa-company-name">
                  {" "}
                  {displayName}
                </span>
              </h1>
              <p className="sa-welcome-subtitle">
                Manage and monitor all your managers from one place.
              </p>
            </div>

            <div className="sa-overview-pill">
              <Building2 size={18} />
              <span>
                {filteredManagers.length} Managers
              </span>
            </div>
          </div>

          {/* ================= Toolbar ================= */}
          <div className="sa-toolbar">
            <div className="sa-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search manager by name, phone or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="sa-sort">
              <Filter size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* ================= Loading ================= */}
          {loading && (
            <div className="sa-empty">
              Loading managers...
            </div>
          )}

          {/* ================= Error ================= */}
          {!loading && error && (
            <div className="sa-error">
              {error}
            </div>
          )}

          {/* ================= Table ================= */}
          {!loading && !error && (
            <div className="sa-table-card">
              <table className="sa-table">
                <thead>
                  <tr>
                    <th style={{ width: "25%" }}>Manager</th>
                    <th style={{ width: "10%" }}>Manager ID</th>
                    <th style={{ width: "15%" }}>Phone Number</th>
                    <th style={{ width: "15%" }}>Registered Date</th>
                    <th style={{ width: "10%" }}>Status</th>
                    <th style={{ width: "25%", textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "60px",
                          color: "#64748b",
                        }}
                      >
                        No managers found.
                      </td>
                    </tr>
                  ) : (
                    filteredManagers.map((manager, index) => (
                      <tr
                        key={manager.mobile_no || index}
                        className="sa-table-row"
                      >
                        {/* Manager */}
                        <td>
                          <div className="sa-manager-cell">
                            <div className="sa-avatar">
                              {manager.full_name
                                ?.charAt(0)
                                ?.toUpperCase() || "M"}
                            </div>
                            <div>
                              <div className="sa-manager-name">
                                {manager.full_name}
                              </div>
                              <div className="sa-manager-role">
                                Manager
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Manager ID */}
                        <td>
                          <span className="sa-table-id">
                            {manager.sub_admin_id}
                          </span>
                        </td>

                        {/* Phone */}
                        <td>{manager.mobile_no}</td>

                        {/* Registered */}
                        <td>{formatDate(manager.reg_date)}</td>

                        {/* Status */}
                        <td>
                          <span className="sa-status-pill">
                            <span className="sa-status-dot"></span>
                            Active
                          </span>
                        </td>

                        {/* Action */}
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="sa-action-btn"
                            onClick={() => handleCardClick(manager)}
                          >
                            <Eye size={16} />
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
