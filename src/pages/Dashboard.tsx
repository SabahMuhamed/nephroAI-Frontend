import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import { PieChart, Pie, Tooltip, Cell } from "recharts";

const COLORS = ["#ef4444", "#22c55e"];

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [stats, setStats] = useState({
    ckd: 0,
    non_ckd: 0,
  });

  // 🔥 LOAD USERS (ADMIN FIRST)
  const loadUsers = async () => {
    const { data } = await supabase.from("profiles").select("*");

    const sorted =
      data?.sort((a: any, b: any) =>
        a.role === "admin" ? -1 : b.role === "admin" ? 1 : 0
      ) || [];

    setUsers(sorted);
  };

  // 🔥 LOAD PATIENTS
  const loadPatients = async (userId?: string) => {
    let query = supabase.from("patients").select("*");

    if (userId && userId !== "ALL") {
      query = query.eq("user_id", userId);
    }

    const { data } = await query;
    setPatients(data || []);
  };

  // 🔥 APPLY FILTER + STATS
  useEffect(() => {
    let filtered = [...patients];

    if (filter === "ckd") {
      filtered = filtered.filter((p) => p.prediction === "ckd");
    } else if (filter === "non_ckd") {
      filtered = filtered.filter((p) => p.prediction !== "ckd");
    }

    setFilteredPatients(filtered);

    let ckd = 0;
    let non_ckd = 0;

    filtered.forEach((p) => {
      if (p.prediction === "ckd") ckd++;
      else non_ckd++;
    });

    setStats({ ckd, non_ckd });
  }, [patients, filter]);

  useEffect(() => {
    loadUsers();
    loadPatients();
  }, []);

  // 🔒 DELETE USER
  const deleteUser = async (user: any) => {
    if (user.role === "admin") {
      alert("Admin cannot be deleted");
      return;
    }

    await supabase.from("profiles").delete().eq("id", user.id);
    loadUsers();
  };

  // 📥 EXPORT CSV
  const exportCSV = () => {
    if (!patients.length) return;

    const headers = Object.keys(patients[0]);
    const rows = patients.map((p) =>
      headers.map((h) => p[h]).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "dataset.csv";
    a.click();
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <Navbar />

      <div className="p-6 mt-20 grid grid-cols-12 gap-6">

        {/* 👥 USERS */}
        <div className="col-span-3 bg-background/60 backdrop-blur-xl border border-border rounded-2xl p-4">
          <h2 className="mb-3 font-semibold text-lg">Users</h2>

          {/* 🔍 SEARCH */}
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded-lg bg-muted text-sm outline-none"
          />

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {users
              .filter((u) =>
                u.email.toLowerCase().includes(search.toLowerCase())
              )
              .map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    loadPatients(u.id);
                  }}
                  className={`p-3 rounded-xl cursor-pointer flex justify-between items-center ${selectedUser?.id === u.id
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/30"
                    }`}
                >
                  <div>
                    <p className="text-sm">{u.email}</p>

                    {u.role === "admin" && (
                      <span className="text-xs text-green-400">
                        Admin
                      </span>
                    )}
                  </div>

                  {u.role !== "admin" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUser(u);
                      }}
                      className="text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* 📊 MAIN */}
        <div className="col-span-9 space-y-6">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Dashboard {selectedUser ? `(${selectedUser.email})` : "(All Users)"}
            </h2>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  loadPatients("ALL");
                }}
                className="px-4 py-2 bg-muted rounded-lg text-sm"
              >
                Show All
              </button>

              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* FILTER */}
          <div className="flex gap-3">
            {["all", "ckd", "non_ckd"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-sm ${filter === f
                  ? "bg-primary text-white"
                  : "bg-muted"
                  }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card">
              <p>Total</p>
              <h2>{filteredPatients.length}</h2>
            </div>

            <div className="card">
              <p>CKD</p>
              <h2 className="text-red-400">{stats.ckd}</h2>
            </div>

            <div className="card">
              <p>Non-CKD</p>
              <h2 className="text-green-400">{stats.non_ckd}</h2>
            </div>
          </div>

          {/* CHART */}
          <div className="card">
            <h3 className="mb-3">Distribution</h3>

            <PieChart width={300} height={300}>
              <Pie
                data={[
                  { name: "CKD", value: stats.ckd },
                  { name: "Non-CKD", value: stats.non_ckd },
                ]}
                dataKey="value"
              >
                <Cell fill={COLORS[0]} />
                <Cell fill={COLORS[1]} />
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* TABLE */}
          <div className="card">
            <h3 className="mb-3">Patients</h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th>Name</th>
                  <th>Prediction</th>
                  <th>Confidence</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((p: any, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/30">
                    <td>{p.patient_name}</td>
                    <td>{p.prediction}</td>
                    <td>{p.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}