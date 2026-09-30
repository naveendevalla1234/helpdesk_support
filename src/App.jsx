import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./App.css";

const initialTickets = [
  {
    id: "HD-1001",
    title: "Unable to login to employee portal",
    description: "User is unable to access the employee portal.",
    requester: "Rahul Kumar",
    email: "rahul@example.com",
    agent: "Priya",
    priority: "High",
    status: "Open",
    category: "Technical",
    created: "2026-09-29",
    slaHours: 4,
    comments: [
      {
        user: "Priya",
        text: "I have started checking the login issue.",
        time: "10:30 AM",
      },
    ],
    activity: [
      { text: "Ticket created", time: "09:20 AM" },
      { text: "Assigned to Priya", time: "10:05 AM" },
    ],
  },
  {
    id: "HD-1002",
    title: "Laptop performance issue",
    description: "Laptop is running very slowly.",
    requester: "Anusha Reddy",
    email: "anusha@example.com",
    agent: "Arjun",
    priority: "Medium",
    status: "In Progress",
    category: "Hardware",
    created: "2026-09-28",
    slaHours: 8,
    comments: [],
    activity: [
      { text: "Ticket created", time: "08:30 AM" },
      { text: "Assigned to Arjun", time: "09:00 AM" },
    ],
  },
  {
    id: "HD-1003",
    title: "Email not syncing",
    description: "Outlook email is not synchronizing.",
    requester: "Kiran",
    email: "kiran@example.com",
    agent: "Priya",
    priority: "Critical",
    status: "Open",
    category: "Email",
    created: "2026-09-30",
    slaHours: 2,
    comments: [],
    activity: [{ text: "Ticket created", time: "11:15 AM" }],
  },
  {
    id: "HD-1004",
    title: "VPN connection problem",
    description: "Cannot connect to company VPN.",
    requester: "Suresh",
    email: "suresh@example.com",
    agent: "Vikram",
    priority: "High",
    status: "Resolved",
    category: "Network",
    created: "2026-09-27",
    slaHours: 4,
    comments: [
      {
        user: "Vikram",
        text: "VPN configuration was corrected.",
        time: "04:20 PM",
      },
    ],
    activity: [
      { text: "Ticket created", time: "02:00 PM" },
      { text: "Issue resolved", time: "04:20 PM" },
    ],
  },
  {
    id: "HD-1005",
    title: "Password reset request",
    description: "User requested password reset.",
    requester: "Sneha",
    email: "sneha@example.com",
    agent: "Arjun",
    priority: "Low",
    status: "Closed",
    category: "Account",
    created: "2026-09-26",
    slaHours: 24,
    comments: [],
    activity: [
      { text: "Ticket created", time: "09:00 AM" },
      { text: "Ticket closed", time: "10:00 AM" },
    ],
  },
  {
    id: "HD-1006",
    title: "Printer not working",
    description: "Office printer is not responding.",
    requester: "Ravi",
    email: "ravi@example.com",
    agent: "Priya",
    priority: "Medium",
    status: "In Progress",
    category: "Hardware",
    created: "2026-09-29",
    slaHours: 8,
    comments: [],
    activity: [{ text: "Ticket created", time: "01:00 PM" }],
  },
];

const agents = ["Unassigned", "Priya", "Arjun", "Vikram", "Meena"];

function App() {
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem("helpdeskTickets");
    return saved ? JSON.parse(saved) : initialTickets;
  });

  const [page, setPage] = useState("dashboard");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const ticketsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("helpdeskTickets", JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const stats = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((t) => t.status === "Open").length,
      progress: tickets.filter((t) => t.status === "In Progress").length,
      resolved: tickets.filter((t) => t.status === "Resolved").length,
      closed: tickets.filter((t) => t.status === "Closed").length,
      critical: tickets.filter((t) => t.priority === "Critical").length,
    }),
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    let result = tickets.filter((ticket) => {
      const text =
        `${ticket.id} ${ticket.title} ${ticket.requester} ${ticket.category}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    if (sortBy === "priority") {
      const order = { Critical: 1, High: 2, Medium: 3, Low: 4 };
      result.sort((a, b) => order[a.priority] - order[b.priority]);
    }

    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "newest") {
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [tickets, search, statusFilter, priorityFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTickets.length / ticketsPerPage)
  );

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ticketsPerPage,
    currentPage * ticketsPerPage
  );

  const showToast = (message) => {
    setToast(message);
  };

  const createTicket = (form) => {
    setLoading(true);

    setTimeout(() => {
      const newTicket = {
        id: `HD-${1000 + tickets.length + 1}`,
        title: form.title,
        description: form.description,
        requester: form.requester,
        email: form.email,
        agent: form.agent,
        priority: form.priority,
        status: "Open",
        category: form.category,
        created: new Date().toISOString().split("T")[0],
        slaHours:
          form.priority === "Critical"
            ? 2
            : form.priority === "High"
              ? 4
              : form.priority === "Medium"
                ? 8
                : 24,
        comments: [],
        activity: [
          {
            text: "Ticket created",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
      };

      setTickets((prev) => [newTicket, ...prev]);
      setLoading(false);
      setPage("tickets");
      showToast("Ticket created successfully!");
    }, 700);
  };

  const updateTicket = (updated) => {
    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === updated.id ? updated : ticket))
    );
    setSelectedTicket(updated);
    showToast("Ticket updated successfully!");
  };

  const deleteTicket = () => {
    if (!selectedTicket) return;

    setTickets((prev) =>
      prev.filter((ticket) => ticket.id !== selectedTicket.id)
    );

    setSelectedTicket(null);
    setShowDelete(false);
    setPage("tickets");
    showToast("Ticket deleted successfully!");
  };

  const addComment = (ticketId, text) => {
    const updatedTicket = tickets.find((t) => t.id === ticketId);

    if (!updatedTicket) return;

    const updated = {
      ...updatedTicket,
      comments: [
        ...updatedTicket.comments,
        {
          user: "You",
          text,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
      activity: [
        ...updatedTicket.activity,
        {
          text: "New comment added",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    updateTicket(updated);
  };

  const assignTicket = (ticket, agent) => {
    const updated = {
      ...ticket,
      agent,
      activity: [
        ...ticket.activity,
        {
          text: `Assigned to ${agent}`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    updateTicket(updated);
  };

  const changeStatus = (ticket, status) => {
    const updated = {
      ...ticket,
      status,
      activity: [
        ...ticket.activity,
        {
          text: `Status changed to ${status}`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    updateTicket(updated);
  };

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} />

      <main className="main">
        <header className="topbar">
          <div>
            <h2>
              {page === "dashboard"
                ? "Dashboard"
                : page === "tickets"
                  ? "Support Tickets"
                  : page === "create"
                    ? "Create Ticket"
                    : page === "analytics"
                      ? "Analytics"
                      : "Ticket Details"}
            </h2>
            <p>Helpdesk Support Management</p>
          </div>

          <div className="top-actions">
            <span className="notification">🔔</span>
            <div className="avatar">N</div>
            <strong>Naveen</strong>
          </div>
        </header>

        {page === "dashboard" && (
          <Dashboard
            stats={stats}
            tickets={tickets}
            setPage={setPage}
            setSelectedTicket={setSelectedTicket}
          />
        )}

        {page === "tickets" && (
          <TicketsPage
            tickets={tickets}
            filteredTickets={filteredTickets}
            paginatedTickets={paginatedTickets}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            setPage={setPage}
            setSelectedTicket={setSelectedTicket}
            setShowDelete={setShowDelete}
          />
        )}

        {page === "create" && (
          <CreateTicketPage
            createTicket={createTicket}
            loading={loading}
            setPage={setPage}
          />
        )}

        {page === "details" && selectedTicket && (
          <TicketDetails
            ticket={selectedTicket}
            agents={agents}
            setPage={setPage}
            assignTicket={assignTicket}
            changeStatus={changeStatus}
            addComment={addComment}
            setShowDelete={setShowDelete}
            updateTicket={updateTicket}
          />
        )}

        {page === "analytics" && (
          <Analytics tickets={tickets} stats={stats} />
        )}
      </main>

      {showDelete && (
        <ConfirmModal
          onCancel={() => setShowDelete(false)}
          onConfirm={deleteTicket}
        />
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">🎧</div>
        <div>
          <h2>HelpDesk</h2>
          <span>Support Center</span>
        </div>
      </div>

      <nav>
        <p className="menu-title">MAIN MENU</p>

        <button
          className={page === "dashboard" ? "nav active" : "nav"}
          onClick={() => setPage("dashboard")}
        >
          📊 Dashboard
        </button>

        <button
          className={
            page === "tickets" || page === "details" ? "nav active" : "nav"
          }
          onClick={() => setPage("tickets")}
        >
          🎫 Tickets
        </button>

        <button
          className={page === "create" ? "nav active" : "nav"}
          onClick={() => setPage("create")}
        >
          ➕ Create Ticket
        </button>

        <button
          className={page === "analytics" ? "nav active" : "nav"}
          onClick={() => setPage("analytics")}
        >
          📈 Analytics
        </button>

        <p className="menu-title">SYSTEM</p>

        <button className="nav">⚙️ Settings</button>
        <button className="nav">❓ Help Center</button>
      </nav>

      <div className="sidebar-bottom">
        <div className="online-dot"></div>
        <div>
          <strong>Support Team</strong>
          <small>Online now</small>
        </div>
      </div>
    </aside>
  );
}

function Dashboard({ stats, tickets, setPage, setSelectedTicket }) {
  const priorityData = [
    { name: "Critical", value: stats.critical },
    {
      name: "High",
      value: tickets.filter((t) => t.priority === "High").length,
    },
    {
      name: "Medium",
      value: tickets.filter((t) => t.priority === "Medium").length,
    },
    {
      name: "Low",
      value: tickets.filter((t) => t.priority === "Low").length,
    },
  ];

  const statusData = [
    { name: "Open", value: stats.open },
    { name: "In Progress", value: stats.progress },
    { name: "Resolved", value: stats.resolved },
    { name: "Closed", value: stats.closed },
  ];

  return (
    <section className="content">
      <div className="welcome">
        <div>
          <h1>Good afternoon, Naveen 👋</h1>
          <p>Here is what's happening with your support tickets today.</p>
        </div>

        <button className="primary-btn" onClick={() => setPage("create")}>
          + Create Ticket
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Tickets" value={stats.total} icon="🎫" />
        <StatCard title="Open Tickets" value={stats.open} icon="📂" />
        <StatCard title="In Progress" value={stats.progress} icon="🔄" />
        <StatCard title="Resolved" value={stats.resolved} icon="✅" />
      </div>

      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h3>Ticket Status</h3>
              <p>Current ticket distribution</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h3>Priority Overview</h3>
              <p>Tickets by priority</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={priorityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {priorityData.map((_, index) => (
                  <Cell key={index} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Recent Tickets</h3>
            <p>Latest support requests</p>
          </div>

          <button className="link-btn" onClick={() => setPage("tickets")}>
            View All →
          </button>
        </div>

        <TicketTable
          tickets={tickets.slice(0, 5)}
          setSelectedTicket={setSelectedTicket}
          setPage={setPage}
        />
      </div>
    </section>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <span>{title}</span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function TicketsPage({
  filteredTickets,
  paginatedTickets,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  currentPage,
  setCurrentPage,
  totalPages,
  setPage,
  setSelectedTicket,
}) {
  return (
    <section className="content">
      <div className="page-heading">
        <div>
          <h1>All Tickets</h1>
          <p>Manage and track all support requests.</p>
        </div>

        <button className="primary-btn" onClick={() => setPage("create")}>
          + New Ticket
        </button>
      </div>

      <div className="filter-panel">
        <input
          className="search"
          placeholder="🔍 Search tickets..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Priority</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div className="panel">
        {filteredTickets.length === 0 ? (
          <div className="empty">
            <div>📭</div>
            <h3>No tickets found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <TicketTable
            tickets={paginatedTickets}
            setSelectedTicket={setSelectedTicket}
            setPage={setPage}
          />
        )}

        {filteredTickets.length > 0 && (
          <div className="pagination">
            <span>
              Showing {paginatedTickets.length} of {filteredTickets.length}
            </span>

            <div>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ←
              </button>

              <strong>
                {currentPage} / {totalPages}
              </strong>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TicketTable({ tickets, setSelectedTicket, setPage }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Requester</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Agent</th>
            <th>SLA</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => {
                setSelectedTicket(ticket);
                setPage("details");
              }}
            >
              <td>
                <strong>{ticket.id}</strong>
                <small>{ticket.title}</small>
              </td>

              <td>{ticket.requester}</td>
              <td>{ticket.category}</td>
              <td>
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td>
                <StatusBadge status={ticket.status} />
              </td>
              <td>{ticket.agent}</td>
              <td>
                <SLAIndicator ticket={ticket} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreateTicketPage({ createTicket, loading, setPage }) {
  const [form, setForm] = useState({
    title: "",
    requester: "",
    email: "",
    category: "Technical",
    priority: "Medium",
    agent: "Unassigned",
    description: "",
    attachment: "",
  });

  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.requester.trim()) newErrors.requester = "Requester is required";
    if (!form.email.includes("@")) newErrors.email = "Valid email is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    createTicket(form);
  };

  return (
    <section className="content">
      <div className="page-heading">
        <div>
          <h1>Create Support Ticket</h1>
          <p>Submit a new support request.</p>
        </div>

        <button className="secondary-btn" onClick={() => setPage("tickets")}>
          Cancel
        </button>
      </div>

      <form className="form-card" onSubmit={submit}>
        <div className="form-grid">
          <div className="field full">
            <label>Ticket Title *</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Enter ticket title"
            />
            {errors.title && <small className="error">{errors.title}</small>}
          </div>

          <div className="field">
            <label>Requester *</label>
            <input
              value={form.requester}
              onChange={(e) => update("requester", e.target.value)}
              placeholder="Requester name"
            />
            {errors.requester && (
              <small className="error">{errors.requester}</small>
            )}
          </div>

          <div className="field">
            <label>Email *</label>
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@example.com"
            />
            {errors.email && <small className="error">{errors.email}</small>}
          </div>

          <div className="field">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option>Technical</option>
              <option>Hardware</option>
              <option>Network</option>
              <option>Email</option>
              <option>Account</option>
              <option>Software</option>
            </select>
          </div>

          <div className="field">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
            >
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="field">
            <label>Assign Agent</label>
            <select
              value={form.agent}
              onChange={(e) => update("agent", e.target.value)}
            >
              {agents.map((agent) => (
                <option key={agent}>{agent}</option>
              ))}
            </select>
          </div>

          <div className="field full">
            <label>Description *</label>
            <textarea
              rows="6"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the issue..."
            />
            {errors.description && (
              <small className="error">{errors.description}</small>
            )}
          </div>

          <div className="field full">
            <label>Attachment</label>
            <input
              type="file"
              onChange={(e) =>
                update("attachment", e.target.files?.[0]?.name || "")
              }
            />
            <small className="helper">
              {form.attachment || "No file selected"}
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setPage("tickets")}
          >
            Cancel
          </button>

          <button className="primary-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}

function TicketDetails({
  ticket,
  agents,
  setPage,
  assignTicket,
  changeStatus,
  addComment,
  setShowDelete,
  updateTicket,
}) {
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDescription, setEditDescription] = useState(ticket.description);

  const saveEdit = () => {
    updateTicket({
      ...ticket,
      title: editTitle,
      description: editDescription,
      activity: [
        ...ticket.activity,
        {
          text: "Ticket details edited",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    });

    setEditing(false);
  };

  const submitComment = () => {
    if (!comment.trim()) return;

    addComment(ticket.id, comment);
    setComment("");
  };

  return (
    <section className="content">
      <div className="page-heading">
        <div>
          <button className="back-btn" onClick={() => setPage("tickets")}>
            ← Back to Tickets
          </button>

          <h1>{ticket.id}</h1>
          <p>{ticket.title}</p>
        </div>

        <div className="detail-actions">
          <button className="secondary-btn" onClick={() => setEditing(!editing)}>
            ✏️ Edit
          </button>

          <button className="danger-btn" onClick={() => setShowDelete(true)}>
            🗑 Delete
          </button>
        </div>
      </div>

      {editing && (
        <div className="panel edit-panel">
          <h3>Edit Ticket</h3>

          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows="4"
          />

          <div className="form-actions">
            <button className="secondary-btn" onClick={() => setEditing(false)}>
              Cancel
            </button>

            <button className="primary-btn" onClick={saveEdit}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="details-grid">
        <div className="panel">
          <div className="ticket-title-row">
            <div>
              <span className="ticket-number">{ticket.id}</span>
              <h2>{ticket.title}</h2>
            </div>

            <StatusBadge status={ticket.status} />
          </div>

          <div className="detail-badges">
            <PriorityBadge priority={ticket.priority} />
            <span className="category-badge">{ticket.category}</span>
          </div>

          <hr />

          <h3>Description</h3>
          <p className="description">{ticket.description}</p>

          <div className="attachment-box">
            📎 <strong>Attachment UI</strong>
            <span>No attachment uploaded</span>
          </div>

          <CommentSection
            comments={ticket.comments}
            comment={comment}
            setComment={setComment}
            submitComment={submitComment}
          />
        </div>

        <div className="side-stack">
          <div className="panel">
            <h3>Ticket Information</h3>

            <InfoRow label="Requester" value={ticket.requester} />
            <InfoRow label="Email" value={ticket.email} />

            <div className="info-row">
              <span>Assigned Agent</span>
              <select
                value={ticket.agent}
                onChange={(e) => assignTicket(ticket, e.target.value)}
              >
                {agents.map((agent) => (
                  <option key={agent}>{agent}</option>
                ))}
              </select>
            </div>

            <div className="info-row">
              <span>Status</span>
              <select
                value={ticket.status}
                onChange={(e) => changeStatus(ticket, e.target.value)}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </div>

            <InfoRow label="Category" value={ticket.category} />
            <InfoRow label="Created" value={ticket.created} />
          </div>

          <div className="panel">
            <h3>SLA Tracking</h3>
            <SLAIndicator ticket={ticket} large />
          </div>

          <div className="panel">
            <ActivityTimeline activity={ticket.activity} />
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`badge status-${status.replace(" ", "-")}`}>{status}</span>;
}

function PriorityBadge({ priority }) {
  return (
    <span className={`badge priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}

function SLAIndicator({ ticket, large = false }) {
  const expired =
    ticket.status !== "Resolved" &&
    ticket.status !== "Closed" &&
    ticket.slaHours <= 2;

  return (
    <div className={large ? "sla large" : "sla"}>
      <div className="sla-top">
        <span>{expired ? "⚠️ At Risk" : "✓ On Track"}</span>
        <strong>{ticket.slaHours}h</strong>
      </div>

      <div className="sla-bar">
        <div
          style={{
            width: `${Math.min(100, (ticket.slaHours / 24) * 100)}%`,
          }}
        ></div>
      </div>

      {large && <small>SLA response target based on ticket priority.</small>}
    </div>
  );
}

function ActivityTimeline({ activity }) {
  return (
    <div>
      <h3>Activity Timeline</h3>

      <div className="timeline">
        {activity.map((item, index) => (
          <div className="timeline-item" key={index}>
            <div className="timeline-dot"></div>

            <div>
              <strong>{item.text}</strong>
              <small>{item.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentSection({
  comments,
  comment,
  setComment,
  submitComment,
}) {
  return (
    <div className="comments">
      <h3>Comments ({comments.length})</h3>

      {comments.length === 0 ? (
        <p className="muted">No comments yet.</p>
      ) : (
        comments.map((item, index) => (
          <div className="comment" key={index}>
            <div className="comment-avatar">
              {item.user.charAt(0)}
            </div>

            <div>
              <strong>{item.user}</strong>
              <small>{item.time}</small>
              <p>{item.text}</p>
            </div>
          </div>
        ))
      )}

      <div className="comment-input">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          rows="3"
        />

        <button className="primary-btn" onClick={submitComment}>
          Add Comment
        </button>
      </div>
    </div>
  );
}

function Analytics({ tickets, stats }) {
  const categoryData = Object.entries(
    tickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <section className="content">
      <div className="page-heading">
        <div>
          <h1>Analytics</h1>
          <p>Support performance and ticket analytics.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Tickets" value={stats.total} icon="🎫" />
        <StatCard title="Critical" value={stats.critical} icon="🚨" />
        <StatCard title="Resolved" value={stats.resolved} icon="✅" />
        <StatCard title="Closed" value={stats.closed} icon="🔒" />
      </div>

      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <h3>Tickets by Category</h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>Support Summary</h3>

          <div className="summary-list">
            <div>
              <span>Open</span>
              <strong>{stats.open}</strong>
            </div>

            <div>
              <span>In Progress</span>
              <strong>{stats.progress}</strong>
            </div>

            <div>
              <span>Resolved</span>
              <strong>{stats.resolved}</strong>
            </div>

            <div>
              <span>Closed</span>
              <strong>{stats.closed}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">⚠️</div>
        <h2>Delete Ticket?</h2>
        <p>
          Are you sure you want to delete this ticket? This action cannot be
          undone.
        </p>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>

          <button className="danger-btn" onClick={onConfirm}>
            Delete Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;