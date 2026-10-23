/**
 * ============================================================================
 * TASKFLOW LUXURY • STUDENT ACADEMIC WORKFLOW & TASK MANAGER
 * Frontend-Only Architecture • Built with React & React Router DOM
 * No Backend Required • Zero Remote Dependencies • Client-Side Routing
 * ============================================================================
 */

(function () {
    // -------------------------------------------------------------------------
    // 1. React & React Router DOM Safe Resolution & Fallback Environment
    // -------------------------------------------------------------------------
    const React = window.React;
    const ReactDOM = window.ReactDOM;

    // Check if React Router DOM is loaded via CDN; if not, provide a robust shim
    let RRD = window.ReactRouterDOM;

    if (!RRD && window.ReactRouter) {
        RRD = window.ReactRouter;
    }

    // Micro React Router DOM Fallback in case of offline/air-gapped environment
    if (!RRD) {
        console.warn("React Router DOM CDN not detected. Initializing built-in client router shim.");

        const RouterContext = React.createContext({
            pathname: window.location.hash.replace(/^#/, "") || "/",
            navigate: () => {}
        });

        const HashRouter = ({ children }) => {
            const [pathname, setPathname] = React.useState(
                () => window.location.hash.replace(/^#/, "") || "/"
            );

            React.useEffect(() => {
                const handleHashChange = () => {
                    const current = window.location.hash.replace(/^#/, "") || "/";
                    setPathname(current);
                };
                window.addEventListener("hashchange", handleHashChange);
                return () => window.removeEventListener("hashchange", handleHashChange);
            }, []);

            const navigate = (to) => {
                window.location.hash = to;
            };

            return (
                <RouterContext.Provider value={{ pathname, navigate }}>
                    {children}
                </RouterContext.Provider>
            );
        };

        const Routes = ({ children }) => {
            const { pathname } = React.useContext(RouterContext);
            let match = null;

            React.Children.forEach(children, (child) => {
                if (!match && React.isValidElement(child)) {
                    const { path } = child.props;
                    if (path === pathname || (path === "/" && pathname === "") || path === "*") {
                        match = child.props.element;
                    }
                }
            });

            return match || null;
        };

        const Route = () => null;

        const Link = ({ to, children, className = "", onClick, ...rest }) => {
            const { navigate } = React.useContext(RouterContext);
            const handleClick = (e) => {
                e.preventDefault();
                navigate(to);
                if (onClick) onClick(e);
            };
            return (
                <a href={`#${to}`} onClick={handleClick} className={className} {...rest}>
                    {children}
                </a>
            );
        };

        const NavLink = ({ to, children, className = "", ...rest }) => {
            const { pathname } = React.useContext(RouterContext);
            const isActive = pathname === to;
            const computedClass = typeof className === "function" 
                ? className({ isActive }) 
                : `${className} ${isActive ? "active" : ""}`.trim();

            return (
                <Link to={to} className={computedClass} {...rest}>
                    {children}
                </Link>
            );
        };

        const useNavigate = () => {
            const { navigate } = React.useContext(RouterContext);
            return navigate;
        };

        const useLocation = () => {
            const { pathname } = React.useContext(RouterContext);
            return { pathname };
        };

        RRD = {
            HashRouter,
            Routes,
            Route,
            Link,
            NavLink,
            useNavigate,
            useLocation,
            Navigate: ({ to }) => {
                const navigate = useNavigate();
                React.useEffect(() => { navigate(to); }, [to]);
                return null;
            }
        };
    }

    // Extract standard React Router DOM primitives
    const {
        HashRouter,
        Routes,
        Route,
        Link,
        NavLink,
        useNavigate,
        useLocation,
        Navigate
    } = RRD;

    // -------------------------------------------------------------------------
    // 2. Default Seed Data (Academic Tasks & Default Student Credentials)
    // -------------------------------------------------------------------------
    const DEFAULT_ACCOUNT = {
        username: "alex.student",
        password: "StudyFlow#2026Pass",
        fullName: "Alex Morgan",
        studentId: "DOSSL-2026-33279",
        program: "B.Tech Computer Science & Engineering",
        semester: "Semester 6 (Academic Year 2026)",
        email: "alex.morgan@university.edu",
        academicStanding: "Dean's Honor List • GPA 3.92",
        enrolledCourses: [
            "CS-301 Database Systems",
            "CS-302 Distributed & OS Systems (DOSSL)",
            "CS-303 Computer Networks",
            "CS-304 Software Engineering",
            "MA-201 Applied Discrete Mathematics"
        ],
        defaultPriority: "Medium",
        notificationsEnabled: true,
        soundEffectsEnabled: true
    };

    const DEFAULT_TASKS = [
        {
            id: 1,
            title: "Submit DOSSL Lab Assignment 4 on Git & CI/CD",
            course: "CS-302 Distributed & OS Systems (DOSSL)",
            priority: "High",
            status: "Pending",
            dueDate: "2026-10-26",
            notes: "Ensure automated build validation passes and documentation is complete in repository."
        },
        {
            id: 2,
            title: "Prepare DBMS Normalization & ER Diagram Presentation",
            course: "CS-301 Database Systems",
            priority: "High",
            status: "In Progress",
            dueDate: "2026-10-25",
            notes: "Cover 1NF, 2NF, 3NF, BCNF with student database schema examples and slide visuals."
        },
        {
            id: 3,
            title: "Read Computer Networks Chapter 5: Transport Layer",
            course: "CS-303 Computer Networks",
            priority: "Medium",
            status: "Completed",
            dueDate: "2026-10-22",
            notes: "TCP 3-way handshake, sliding window flow control, and UDP segment structures."
        },
        {
            id: 4,
            title: "Draft Software Engineering SRS Document for Project Milestone",
            course: "CS-304 Software Engineering",
            priority: "Medium",
            status: "Pending",
            dueDate: "2026-10-28",
            notes: "Detail functional and non-functional requirements with UML use case diagrams."
        },
        {
            id: 5,
            title: "Review Discrete Mathematics Graph Theory & Trees",
            course: "MA-201 Applied Discrete Mathematics",
            priority: "Low",
            status: "Completed",
            dueDate: "2026-10-20",
            notes: "Eulerian & Hamiltonian cycles, Kruskal & Prim minimum spanning tree algorithms."
        }
    ];

    // Local Storage Keys
    const STORAGE_KEY_TASKS = "taskflow_luxury_tasks_v2";
    const STORAGE_KEY_ACCOUNT = "taskflow_luxury_account_v2";

    // -------------------------------------------------------------------------
    // 3. Application State & Root Provider
    // -------------------------------------------------------------------------
    const AppContext = React.createContext();

    function AppProvider({ children }) {
        // Load tasks from localStorage or seed
        const [tasks, setTasks] = React.useState(() => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY_TASKS);
                return saved ? JSON.parse(saved) : DEFAULT_TASKS;
            } catch (e) {
                return DEFAULT_TASKS;
            }
        });

        // Load account credentials and settings
        const [account, setAccount] = React.useState(() => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY_ACCOUNT);
                return saved ? JSON.parse(saved) : DEFAULT_ACCOUNT;
            } catch (e) {
                return DEFAULT_ACCOUNT;
            }
        });

        // Toast notification system
        const [toast, setToast] = React.useState(null);

        const showToast = (message, type = "success") => {
            setToast({ message, type, id: Date.now() });
            setTimeout(() => {
                setToast(null);
            }, 3500);
        };

        // Persist tasks to localStorage
        React.useEffect(() => {
            try {
                localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
            } catch (e) {
                console.error("Failed to persist tasks:", e);
            }
        }, [tasks]);

        // Persist account to localStorage
        React.useEffect(() => {
            try {
                localStorage.setItem(STORAGE_KEY_ACCOUNT, JSON.stringify(account));
            } catch (e) {
                console.error("Failed to persist account:", e);
            }
        }, [account]);

        // Add task
        const addTask = (newTask) => {
            const taskWithId = {
                id: Date.now(),
                ...newTask
            };
            setTasks((prev) => [taskWithId, ...prev]);
            showToast(`Task added: "${newTask.title.slice(0, 30)}..."`, "success");
        };

        // Toggle Task Completed Status (One-Click button requirement)
        const toggleTaskComplete = (taskId) => {
            setTasks((prev) =>
                prev.map((t) => {
                    if (t.id === taskId) {
                        const isNowCompleted = t.status !== "Completed";
                        const updatedStatus = isNowCompleted ? "Completed" : "In Progress";
                        showToast(
                            isNowCompleted
                                ? `✨ Great work! Task marked as Completed.`
                                : `Task reopened to In Progress.`,
                            isNowCompleted ? "success" : "info"
                        );
                        return { ...t, status: updatedStatus };
                    }
                    return t;
                })
            );
        };

        // Update task status directly
        const updateTaskStatus = (taskId, newStatus) => {
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
            );
            showToast(`Status updated to ${newStatus}.`, "info");
        };

        // Delete task
        const deleteTask = (taskId) => {
            const task = tasks.find((t) => t.id === taskId);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            showToast(`Task deleted: "${task ? task.title.slice(0, 24) : ""}"`, "info");
        };

        // Update Account
        const updateAccount = (updates) => {
            setAccount((prev) => ({ ...prev, ...updates }));
            showToast("Account credentials and profile saved successfully!", "success");
        };

        // Reset to Default Demo State
        const resetToDefaults = () => {
            setTasks(DEFAULT_TASKS);
            setAccount(DEFAULT_ACCOUNT);
            localStorage.removeItem(STORAGE_KEY_TASKS);
            localStorage.removeItem(STORAGE_KEY_ACCOUNT);
            showToast("System reset to default tasks and credentials.", "info");
        };

        // Derived Statistics
        const stats = React.useMemo(() => {
            const total = tasks.length;
            const completed = tasks.filter((t) => t.status === "Completed").length;
            const inProgress = tasks.filter((t) => t.status === "In Progress").length;
            const pending = tasks.filter((t) => t.status === "Pending").length;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

            return { total, completed, inProgress, pending, completionRate };
        }, [tasks]);

        return (
            <AppContext.Provider
                value={{
                    tasks,
                    account,
                    stats,
                    toast,
                    addTask,
                    toggleTaskComplete,
                    updateTaskStatus,
                    deleteTask,
                    updateAccount,
                    resetToDefaults,
                    showToast
                }}
            >
                {children}
            </AppContext.Provider>
        );
    }

    const useApp = () => React.useContext(AppContext);

    // -------------------------------------------------------------------------
    // 4. Global UI Components: Sidebar, Topbar, Toast
    // -------------------------------------------------------------------------
    function Sidebar() {
        const { stats, account } = useApp();

        return (
            <aside className="sidebar">
                {/* Brand Logo & Crest */}
                <div className="brand">
                    <div className="brand-crest">
                        <span>✦</span>
                    </div>
                    <div className="brand-text">
                        <h2>TaskFlow</h2>
                        <span className="brand-badge">LUXURY ACADEMIC</span>
                    </div>
                </div>

                {/* Primary Navigation using React Router DOM Link / NavLink */}
                <nav className="sidebar-nav">
                    <div className="nav-group-label">WORKSPACE</div>

                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="nav-icon">⬚</span>
                        <span className="nav-label">Dashboard</span>
                        <span className="nav-glow"></span>
                    </NavLink>

                    <NavLink
                        to="/tasks"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="nav-icon">☑</span>
                        <span className="nav-label">My Tasks</span>
                        {stats.pending > 0 && (
                            <span className="nav-counter" title={`${stats.pending} pending tasks`}>
                                {stats.pending}
                            </span>
                        )}
                        <span className="nav-glow"></span>
                    </NavLink>

                    <div className="nav-group-label">ACCOUNT & SECURITY</div>

                    <NavLink
                        to="/account"
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="nav-icon">🛡</span>
                        <span className="nav-label">Account</span>
                        <span className="default-indicator" title="Default credentials active">
                            Default
                        </span>
                        <span className="nav-glow"></span>
                    </NavLink>
                </nav>

                {/* Academic Quick Stats Box */}
                <div className="sidebar-summary-card">
                    <div className="summary-card-header">
                        <span className="summary-title">SEMESTER GOAL</span>
                        <span className="summary-percent">{stats.completionRate}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${stats.completionRate}%` }}
                        ></div>
                    </div>
                    <p className="summary-desc">
                        {stats.completed} of {stats.total} academic milestones completed
                    </p>
                </div>

                {/* User Account Card at Bottom (Links to /account) */}
                <Link to="/account" className="sidebar-user-card" title="Click to view Account & Credentials">
                    <div className="user-avatar">
                        <span>{account.fullName.split(" ").map(n => n[0]).join("")}</span>
                        <span className="status-dot"></span>
                    </div>
                    <div className="user-info">
                        <strong>{account.fullName}</strong>
                        <span>{account.username}</span>
                    </div>
                    <div className="user-link-arrow">→</div>
                </Link>
            </aside>
        );
    }

    function Topbar() {
        const { stats, account } = useApp();
        const location = useLocation();

        const getRouteTitle = () => {
            switch (location.pathname) {
                case "/tasks":
                    return {
                        title: "My Academic Tasks",
                        subtitle: "View, filter, and mark your course assignments as completed."
                    };
                case "/account":
                    return {
                        title: "Student Account & Security",
                        subtitle: "Default credentials and academic profile • Pure frontend."
                    };
                default:
                    return {
                        title: "Academic Dashboard",
                        subtitle: `Welcome back, ${account.fullName.split(" ")[0]} • Keep achieving excellence.`
                    };
            }
        };

        const info = getRouteTitle();

        // Current formatted date
        const todayStr = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(new Date());

        return (
            <header className="topbar">
                <div className="topbar-left">
                    <div className="topbar-breadcrumb">
                        <span>TaskFlow</span>
                        <span className="crumb-sep">/</span>
                        <span className="crumb-current">
                            {location.pathname === "/tasks"
                                ? "My Tasks"
                                : location.pathname === "/account"
                                ? "Account"
                                : "Dashboard"}
                        </span>
                    </div>
                    <h1 className="topbar-title">{info.title}</h1>
                    <p className="topbar-subtitle">{info.subtitle}</p>
                </div>

                <div className="topbar-right">
                    {/* Live Date Pill */}
                    <div className="date-chip">
                        <span className="date-icon">📅</span>
                        <span>{todayStr}</span>
                    </div>

                    {/* Quick Link Navigation Buttons */}
                    <Link to="/tasks" className="topbar-action-btn" title="View My Tasks">
                        <span>☑</span>
                        <span>View Tasks</span>
                    </Link>

                    {/* Profile Link */}
                    <Link to="/account" className="topbar-profile-chip" title="Account Settings">
                        <div className="profile-mini-avatar">
                            {account.fullName[0]}
                        </div>
                        <div className="profile-mini-meta">
                            <span className="profile-username">{account.username}</span>
                            <span className="profile-role">Student</span>
                        </div>
                    </Link>
                </div>
            </header>
        );
    }

    function ToastNotification() {
        const { toast } = useApp();
        if (!toast) return null;

        return (
            <div className={`toast-container toast-${toast.type}`}>
                <div className="toast-icon">
                    {toast.type === "success" ? "✦" : "ℹ"}
                </div>
                <div className="toast-message">{toast.message}</div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // 5. Page: Academic Dashboard (Route: "/")
    // -------------------------------------------------------------------------
    function DashboardPage() {
        const { tasks, stats, addTask, toggleTaskComplete, deleteTask } = useApp();

        // Form state for adding tasks
        const [taskName, setTaskName] = React.useState("");
        const [course, setCourse] = React.useState("CS-302 Distributed & OS Systems (DOSSL)");
        const [dueDate, setDueDate] = React.useState("");
        const [priority, setPriority] = React.useState("Medium");
        const [status, setStatus] = React.useState("Pending");
        const [notes, setNotes] = React.useState("");

        const handleFormSubmit = (e) => {
            e.preventDefault();
            if (!taskName.trim()) {
                alert("Please provide a task description or title.");
                return;
            }

            addTask({
                title: taskName.trim(),
                course,
                priority,
                status,
                dueDate: dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
                notes: notes.trim()
            });

            // Reset form
            setTaskName("");
            setNotes("");
            setPriority("Medium");
            setStatus("Pending");
        };

        const presetTemplates = [
            { label: "+ Lab Report", name: "Submit DOSSL Lab Experiment Report", prio: "High", crs: "CS-302 Distributed & OS Systems (DOSSL)" },
            { label: "+ DBMS Project", name: "Implement SQL Database Schema & Queries", prio: "Medium", crs: "CS-301 Database Systems" },
            { label: "+ Viva Prep", name: "Review Transport Protocols & Handshake for Viva", prio: "High", crs: "CS-303 Computer Networks" },
            { label: "+ Reading", name: "Review Software Lifecycle & Agile Models", prio: "Low", crs: "CS-304 Software Engineering" }
        ];

        const applyPreset = (preset) => {
            setTaskName(preset.name);
            setPriority(preset.prio);
            setCourse(preset.crs);
        };

        // Recent 5 tasks
        const recentTasks = tasks.slice(0, 5);

        return (
            <div className="page-container dashboard-page">
                {/* 4 Luxury Statistics Cards */}
                <section className="stats-grid">
                    <div className="stat-card stat-total">
                        <div className="stat-card-glow"></div>
                        <div className="stat-icon-wrapper">✓</div>
                        <div className="stat-details">
                            <span className="stat-label">TOTAL MILESTONES</span>
                            <strong className="stat-number">{stats.total}</strong>
                            <span className="stat-trend positive">All Academic Work</span>
                        </div>
                    </div>

                    <div className="stat-card stat-pending">
                        <div className="stat-card-glow"></div>
                        <div className="stat-icon-wrapper">◷</div>
                        <div className="stat-details">
                            <span className="stat-label">PENDING TASKS</span>
                            <strong className="stat-number">{stats.pending}</strong>
                            <span className="stat-trend neutral">Awaiting action</span>
                        </div>
                    </div>

                    <div className="stat-card stat-progress">
                        <div className="stat-card-glow"></div>
                        <div className="stat-icon-wrapper">↻</div>
                        <div className="stat-details">
                            <span className="stat-label">IN PROGRESS</span>
                            <strong className="stat-number">{stats.inProgress}</strong>
                            <span className="stat-trend active">Currently active</span>
                        </div>
                    </div>

                    <div className="stat-card stat-completed">
                        <div className="stat-card-glow"></div>
                        <div className="stat-icon-wrapper">★</div>
                        <div className="stat-details">
                            <span className="stat-label">COMPLETED</span>
                            <strong className="stat-number">{stats.completed}</strong>
                            <span className="stat-trend success">
                                {stats.completionRate}% Success Rate
                            </span>
                        </div>
                    </div>
                </section>

                {/* Dashboard Two-Column Grid */}
                <div className="dashboard-grid">
                    {/* Left Column: Add Task Card */}
                    <div className="luxury-panel add-task-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-badge">QUICK ENTRY</span>
                                <h2>Add Academic Task</h2>
                                <p>Record assignments, lab reports, and exam preparation.</p>
                            </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="preset-strip">
                            <span className="preset-label">Templates:</span>
                            {presetTemplates.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className="preset-pill"
                                    onClick={() => applyPreset(item)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleFormSubmit} className="task-form">
                            <div className="form-group">
                                <label>Task Name / Objective <span className="req">*</span></label>
                                <input
                                    type="text"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    placeholder="e.g., Complete DOSSL assignment on Git branching"
                                    className="input-luxury"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Course / Subject</label>
                                    <select
                                        value={course}
                                        onChange={(e) => setCourse(e.target.value)}
                                        className="select-luxury"
                                    >
                                        <option value="CS-302 Distributed & OS Systems (DOSSL)">CS-302 DOSSL</option>
                                        <option value="CS-301 Database Systems">CS-301 DBMS</option>
                                        <option value="CS-303 Computer Networks">CS-303 Networks</option>
                                        <option value="CS-304 Software Engineering">CS-304 Software Eng</option>
                                        <option value="MA-201 Applied Discrete Mathematics">MA-201 Math</option>
                                        <option value="General Academic">General Academic</option>
                                    </select>
                                </div>

                                <div className="form-group flex-1">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="input-luxury"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Priority</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="select-luxury"
                                    >
                                        <option value="High">High Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="Low">Low Priority</option>
                                    </select>
                                </div>

                                <div className="form-group flex-1">
                                    <label>Initial Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="select-luxury"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notes / Instructions (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add references, lab instructions, or submission links..."
                                    rows="2"
                                    className="textarea-luxury"
                                />
                            </div>

                            <button type="submit" className="btn-luxury-primary">
                                <span className="btn-icon">＋</span>
                                <span>Create Academic Task</span>
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Recent Tasks & Quick Actions */}
                    <div className="luxury-panel recent-tasks-panel">
                        <div className="panel-header flex-between">
                            <div>
                                <span className="panel-badge">TASK OVERVIEW</span>
                                <h2>Recent Tasks</h2>
                                <p>Manage your upcoming deadlines & complete items on click.</p>
                            </div>

                            {/* React Router DOM Link to My Tasks */}
                            <Link to="/tasks" className="btn-luxury-ghost" title="Open My Tasks Page">
                                <span>View All ({tasks.length})</span>
                                <span className="arrow-icon">→</span>
                            </Link>
                        </div>

                        {recentTasks.length === 0 ? (
                            <div className="empty-state-luxury">
                                <div className="empty-icon-shield">✓</div>
                                <h3>No Academic Tasks Yet</h3>
                                <p>Create your first task using the form on the left.</p>
                            </div>
                        ) : (
                            <div className="task-items-list">
                                {recentTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`task-row ${
                                            task.status === "Completed" ? "row-completed" : ""
                                        }`}
                                    >
                                        {/* ONE-CLICK COMPLETE BUTTON REQUIREMENT */}
                                        <button
                                            type="button"
                                            className={`complete-toggle-btn ${
                                                task.status === "Completed" ? "is-completed" : ""
                                            }`}
                                            onClick={() => toggleTaskComplete(task.id)}
                                            title={
                                                task.status === "Completed"
                                                    ? "Click to Reopen Task"
                                                    : "Click to Mark Task as Completed"
                                            }
                                        >
                                            <span className="check-mark">✓</span>
                                        </button>

                                        <div className="task-row-content">
                                            <div className="task-row-title-bar">
                                                <h4 className="task-row-title">{task.title}</h4>
                                                <div className="badge-group">
                                                    <span
                                                        className={`badge-luxury badge-priority-${task.priority.toLowerCase()}`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                    <span
                                                        className={`badge-luxury badge-status-${task.status
                                                            .toLowerCase()
                                                            .replace(" ", "-")}`}
                                                    >
                                                        {task.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="task-row-meta">
                                                <span className="meta-item course-tag">
                                                    📚 {task.course.split(" ")[0]}
                                                </span>
                                                <span className="meta-item date-tag">
                                                    ⏳ Due: {task.dueDate || "Flexible"}
                                                </span>
                                                {task.notes && (
                                                    <span className="meta-item notes-snippet">
                                                        💬 {task.notes.slice(0, 35)}...
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions: Mark Complete & Delete */}
                                        <div className="task-row-actions">
                                            <button
                                                type="button"
                                                className={`action-btn-status ${
                                                    task.status === "Completed" ? "btn-reopen" : "btn-done"
                                                }`}
                                                onClick={() => toggleTaskComplete(task.id)}
                                            >
                                                {task.status === "Completed" ? "Reopen" : "Mark Done"}
                                            </button>

                                            <button
                                                type="button"
                                                className="action-btn-delete"
                                                onClick={() => deleteTask(task.id)}
                                                title="Delete Task"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Page Jump Banner */}
                        <div className="workflow-footer-banner">
                            <div className="footer-banner-text">
                                <strong>Need in-depth filters or search?</strong>
                                <span>Switch to the dedicated My Tasks page to manage all course loads.</span>
                            </div>
                            <Link to="/tasks" className="btn-luxury-secondary">
                                <span>Open My Tasks</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // 6. Page: My Tasks (Route: "/tasks") - Dedicated Task View
    // -------------------------------------------------------------------------
    function MyTasksPage() {
        const {
            tasks,
            stats,
            toggleTaskComplete,
            updateTaskStatus,
            deleteTask,
            addTask
        } = useApp();

        // Filters and search state
        const [statusFilter, setStatusFilter] = React.useState("All");
        const [priorityFilter, setPriorityFilter] = React.useState("All");
        const [courseFilter, setCourseFilter] = React.useState("All");
        const [searchQuery, setSearchQuery] = React.useState("");
        const [sortBy, setSortBy] = React.useState("dueDate");

        // Quick add modal / expander state
        const [showQuickAdd, setShowQuickAdd] = React.useState(false);
        const [newTitle, setNewTitle] = React.useState("");
        const [newCourse, setNewCourse] = React.useState("CS-302 Distributed & OS Systems (DOSSL)");
        const [newPriority, setNewPriority] = React.useState("High");
        const [newDate, setNewDate] = React.useState("");

        const handleQuickAdd = (e) => {
            e.preventDefault();
            if (!newTitle.trim()) return;
            addTask({
                title: newTitle.trim(),
                course: newCourse,
                priority: newPriority,
                status: "Pending",
                dueDate: newDate || new Date().toISOString().split("T")[0],
                notes: "Quickly logged from My Tasks view."
            });
            setNewTitle("");
            setShowQuickAdd(false);
        };

        // Filter and Sort Pipeline
        const filteredTasks = React.useMemo(() => {
            return tasks
                .filter((task) => {
                    // Status filter
                    if (statusFilter !== "All" && task.status !== statusFilter) return false;
                    // Priority filter
                    if (priorityFilter !== "All" && task.priority !== priorityFilter) return false;
                    // Course filter
                    if (courseFilter !== "All" && task.course !== courseFilter) return false;
                    // Search query
                    if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        const matchTitle = task.title.toLowerCase().includes(q);
                        const matchCourse = task.course.toLowerCase().includes(q);
                        const matchNotes = (task.notes || "").toLowerCase().includes(q);
                        if (!matchTitle && !matchCourse && !matchNotes) return false;
                    }
                    return true;
                })
                .sort((a, b) => {
                    if (sortBy === "priority") {
                        const prioOrder = { High: 1, Medium: 2, Low: 3 };
                        return (prioOrder[a.priority] || 4) - (prioOrder[b.priority] || 4);
                    }
                    if (sortBy === "title") {
                        return a.title.localeCompare(b.title);
                    }
                    // Default: dueDate
                    return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
                });
        }, [tasks, statusFilter, priorityFilter, courseFilter, searchQuery, sortBy]);

        // Distinct courses list for filter dropdown
        const availableCourses = React.useMemo(() => {
            const set = new Set(tasks.map((t) => t.course));
            return Array.from(set);
        }, [tasks]);

        return (
            <div className="page-container my-tasks-page">
                {/* Header & Controls Toolbar */}
                <div className="tasks-page-header">
                    <div>
                        <div className="page-tag">WORKFLOW MANAGER</div>
                        <h2>My Academic Tasks</h2>
                        <p>Complete task list with instant one-click completion & filter controls.</p>
                    </div>

                    <div className="tasks-page-actions">
                        <button
                            type="button"
                            className="btn-luxury-primary"
                            onClick={() => setShowQuickAdd(!showQuickAdd)}
                        >
                            <span>{showQuickAdd ? "✕ Close Form" : "＋ Add New Task"}</span>
                        </button>
                        <Link to="/" className="btn-luxury-ghost">
                            <span>← Dashboard</span>
                        </Link>
                    </div>
                </div>

                {/* Inline Quick Add Drawer */}
                {showQuickAdd && (
                    <div className="quick-add-drawer">
                        <h3>Quick Create Task</h3>
                        <form onSubmit={handleQuickAdd} className="quick-add-form">
                            <input
                                type="text"
                                placeholder="Task description..."
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="input-luxury flex-2"
                                autoFocus
                                required
                            />
                            <select
                                value={newCourse}
                                onChange={(e) => setNewCourse(e.target.value)}
                                className="select-luxury flex-1"
                            >
                                <option value="CS-302 Distributed & OS Systems (DOSSL)">CS-302 DOSSL</option>
                                <option value="CS-301 Database Systems">CS-301 DBMS</option>
                                <option value="CS-303 Computer Networks">CS-303 Networks</option>
                                <option value="CS-304 Software Engineering">CS-304 Software Eng</option>
                                <option value="MA-201 Applied Discrete Mathematics">MA-201 Math</option>
                            </select>
                            <select
                                value={newPriority}
                                onChange={(e) => setNewPriority(e.target.value)}
                                className="select-luxury"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="input-luxury"
                            />
                            <button type="submit" className="btn-luxury-primary">
                                Save
                            </button>
                        </form>
                    </div>
                )}

                {/* Statistics Strip */}
                <div className="tasks-stats-strip">
                    <div className="strip-item">
                        <span className="strip-label">Showing</span>
                        <strong className="strip-value">{filteredTasks.length} / {tasks.length}</strong>
                    </div>
                    <div className="strip-item">
                        <span className="strip-label">Pending</span>
                        <strong className="strip-value text-orange">{stats.pending}</strong>
                    </div>
                    <div className="strip-item">
                        <span className="strip-label">In Progress</span>
                        <strong className="strip-value text-purple">{stats.inProgress}</strong>
                    </div>
                    <div className="strip-item">
                        <span className="strip-label">Completed</span>
                        <strong className="strip-value text-green">{stats.completed}</strong>
                    </div>
                    <div className="strip-item flex-right">
                        <span className="strip-label">Completion Status</span>
                        <strong className="strip-value text-gold">{stats.completionRate}%</strong>
                    </div>
                </div>

                {/* Interactive Filter Bar */}
                <div className="filter-controls-bar">
                    {/* Status Tabs */}
                    <div className="status-tabs-group">
                        {["All", "Pending", "In Progress", "Completed"].map((st) => (
                            <button
                                key={st}
                                type="button"
                                className={`tab-btn ${statusFilter === st ? "active" : ""}`}
                                onClick={() => setStatusFilter(st)}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search tasks, subjects, notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-luxury"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() => setSearchQuery("")}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="select-luxury filter-dropdown"
                    >
                        <option value="All">All Priorities</option>
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                    </select>

                    {/* Course Filter */}
                    <select
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                        className="select-luxury filter-dropdown"
                    >
                        <option value="All">All Courses</option>
                        {availableCourses.map((crs, idx) => (
                            <option key={idx} value={crs}>
                                {crs.split(" ")[0]}
                            </option>
                        ))}
                    </select>

                    {/* Sort Options */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="select-luxury filter-dropdown"
                    >
                        <option value="dueDate">Sort by Due Date</option>
                        <option value="priority">Sort by Priority</option>
                        <option value="title">Sort by Title</option>
                    </select>
                </div>

                {/* Tasks List */}
                {filteredTasks.length === 0 ? (
                    <div className="empty-state-luxury full-width">
                        <div className="empty-icon-shield">✓</div>
                        <h3>No Tasks Match Your Filters</h3>
                        <p>Try clearing filters or search query to view all tasks.</p>
                        <button
                            type="button"
                            className="btn-luxury-secondary"
                            onClick={() => {
                                setStatusFilter("All");
                                setPriorityFilter("All");
                                setCourseFilter("All");
                                setSearchQuery("");
                            }}
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="tasks-grid-luxury">
                        {filteredTasks.map((task) => {
                            const isCompleted = task.status === "Completed";

                            return (
                                <div
                                    key={task.id}
                                    className={`task-card-luxury ${
                                        isCompleted ? "task-completed-card" : ""
                                    }`}
                                >
                                    <div className="task-card-top">
                                        <div className="task-card-badges">
                                            <span
                                                className={`badge-luxury badge-priority-${task.priority.toLowerCase()}`}
                                            >
                                                {task.priority}
                                            </span>
                                            <span
                                                className={`badge-luxury badge-status-${task.status
                                                    .toLowerCase()
                                                    .replace(" ", "-")}`}
                                            >
                                                {task.status}
                                            </span>
                                        </div>

                                        {/* Status dropdown to change directly */}
                                        <select
                                            value={task.status}
                                            onChange={(e) =>
                                                updateTaskStatus(task.id, e.target.value)
                                            }
                                            className="select-status-inline"
                                            title="Change status"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>

                                    <h3 className="task-card-title">{task.title}</h3>

                                    <div className="task-card-meta">
                                        <span className="card-meta-course">
                                            📚 {task.course}
                                        </span>
                                        <span className="card-meta-date">
                                            📅 Due: {task.dueDate || "No deadline"}
                                        </span>
                                    </div>

                                    {task.notes && (
                                        <p className="task-card-notes">
                                            {task.notes}
                                        </p>
                                    )}

                                    {/* USER REQUIREMENT: A clear button to click when task is completed */}
                                    <div className="task-card-bottom-actions">
                                        <button
                                            type="button"
                                            className={`btn-complete-task ${
                                                isCompleted ? "is-done" : "is-pending"
                                            }`}
                                            onClick={() => toggleTaskComplete(task.id)}
                                            title={
                                                isCompleted
                                                    ? "Click to reopen this task"
                                                    : "Click to complete this task"
                                            }
                                        >
                                            <span className="complete-btn-icon">
                                                {isCompleted ? "✓" : "○"}
                                            </span>
                                            <span className="complete-btn-text">
                                                {isCompleted
                                                    ? "Task Completed • Click to Reopen"
                                                    : "Mark as Completed"}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            className="btn-delete-card"
                                            onClick={() => deleteTask(task.id)}
                                            title="Delete Task"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // 7. Page: Account & Security Profile (Route: "/account")
    // -------------------------------------------------------------------------
    function AccountPage() {
        const { account, updateAccount, resetToDefaults, stats, showToast } = useApp();

        // Local edit form state
        const [username, setUsername] = React.useState(account.username);
        const [password, setPassword] = React.useState(account.password);
        const [fullName, setFullName] = React.useState(account.fullName);
        const [email, setEmail] = React.useState(account.email);
        const [showPassword, setShowPassword] = React.useState(false);
        const [copied, setCopied] = React.useState(false);

        const handleSave = (e) => {
            e.preventDefault();
            updateAccount({
                username: username.trim(),
                password: password.trim(),
                fullName: fullName.trim(),
                email: email.trim()
            });
        };

        const copyCredentials = () => {
            const text = `TaskFlow Credentials\nUsername: ${username}\nPassword: ${password}`;
            navigator.clipboard?.writeText(text);
            setCopied(true);
            showToast("Credentials copied to clipboard!", "info");
            setTimeout(() => setCopied(false), 2500);
        };

        return (
            <div className="page-container account-page">
                {/* Default Credentials Notice Banner */}
                <div className="credentials-banner">
                    <div className="banner-icon-badge">🛡️</div>
                    <div className="banner-content">
                        <h3>Default Student Credentials Active (Frontend-Only Architecture)</h3>
                        <p>
                            This project operates with <strong>no backend server or database</strong>. 
                            Default username and password are provided below and stored in your browser's local sandbox.
                        </p>
                    </div>
                    <div className="banner-badge-pill">Zero Backend</div>
                </div>

                <div className="account-grid">
                    {/* Left Column: Credentials & Security Card */}
                    <div className="luxury-panel credentials-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-badge">AUTHENTICATION</span>
                                <h2>Default Account Credentials</h2>
                                <p>Manage your default login information and access keys.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="credentials-form">
                            {/* Default Username Field */}
                            <div className="form-group">
                                <div className="label-with-tag">
                                    <label>Default Username</label>
                                    <span className="default-tag">System Default</span>
                                </div>
                                <div className="input-with-icon">
                                    <span className="field-icon">👤</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="input-luxury"
                                        required
                                    />
                                </div>
                                <span className="field-hint">
                                    Default student handle: <code>alex.student</code>
                                </span>
                            </div>

                            {/* Default Password Field with Show/Hide Toggle */}
                            <div className="form-group">
                                <div className="label-with-tag">
                                    <label>Default Password</label>
                                    <span className="default-tag">System Default</span>
                                </div>
                                <div className="password-input-wrapper">
                                    <span className="field-icon">🔑</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-luxury"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="eye-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "🙈 Hide" : "👁 Show"}
                                    </button>
                                </div>
                                <span className="field-hint">
                                    Default password: <code>StudyFlow#2026Pass</code>
                                </span>
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label>Student Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="input-luxury"
                                    />
                                </div>

                                <div className="form-group flex-1">
                                    <label>University Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-luxury"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="credentials-actions">
                                <button type="submit" className="btn-luxury-primary">
                                    <span>💾</span>
                                    <span>Save Profile Updates</span>
                                </button>

                                <button
                                    type="button"
                                    className="btn-luxury-outline"
                                    onClick={copyCredentials}
                                >
                                    <span>{copied ? "✓ Copied!" : "📋 Copy Credentials"}</span>
                                </button>
                            </div>
                        </form>

                        {/* Reset Section */}
                        <div className="reset-section">
                            <div>
                                <strong>Reset to Factory Defaults</strong>
                                <p>Restores default username, password, and starter academic tasks.</p>
                            </div>
                            <button
                                type="button"
                                className="btn-danger-outline"
                                onClick={() => {
                                    if (confirm("Reset all tasks and credentials to factory defaults?")) {
                                        resetToDefaults();
                                        setUsername("alex.student");
                                        setPassword("StudyFlow#2026Pass");
                                        setFullName("Alex Morgan");
                                        setEmail("alex.morgan@university.edu");
                                    }
                                }}
                            >
                                Reset Defaults
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Academic Identity & Enrolled Courses */}
                    <div className="luxury-panel profile-summary-panel">
                        <div className="panel-header">
                            <div>
                                <span className="panel-badge">STUDENT RECORD</span>
                                <h2>Academic Identity Card</h2>
                                <p>DOSSL Lab practical enrollment and course records.</p>
                            </div>
                        </div>

                        {/* Student ID Card Visual */}
                        <div className="student-id-card">
                            <div className="id-card-top">
                                <div className="id-university">
                                    <span className="uni-crest">✦</span>
                                    <span>STATE UNIVERSITY OF TECHNOLOGY</span>
                                </div>
                                <span className="id-badge-active">ACTIVE STUDENT</span>
                            </div>

                            <div className="id-card-body">
                                <div className="id-avatar-large">
                                    {account.fullName.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="id-details">
                                    <h3 className="id-name">{account.fullName}</h3>
                                    <span className="id-reg">ID: {account.studentId}</span>
                                    <div className="id-meta-line">
                                        <span>Program:</span>
                                        <strong>{account.program}</strong>
                                    </div>
                                    <div className="id-meta-line">
                                        <span>Term:</span>
                                        <strong>{account.semester}</strong>
                                    </div>
                                    <div className="id-meta-line">
                                        <span>Status:</span>
                                        <strong className="text-gold">{account.academicStanding}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="id-card-footer">
                                <span>Verified DOSSL Academic Workstation</span>
                                <span>• 2026 Session</span>
                            </div>
                        </div>

                        {/* Enrolled Courses Strip */}
                        <div className="enrolled-courses-box">
                            <h4>Enrolled Courses ({account.enrolledCourses.length})</h4>
                            <div className="courses-tags-cloud">
                                {account.enrolledCourses.map((c, i) => (
                                    <span key={i} className="course-chip">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="academic-stats-box">
                            <div className="stat-mini">
                                <span className="mini-num">{stats.completed}</span>
                                <span className="mini-text">Assignments Completed</span>
                            </div>
                            <div className="stat-mini">
                                <span className="mini-num">{stats.completionRate}%</span>
                                <span className="mini-text">Efficiency Rating</span>
                            </div>
                            <div className="stat-mini">
                                <span className="mini-num">{stats.pending}</span>
                                <span className="mini-text">Pending Deadlines</span>
                            </div>
                        </div>

                        {/* React Router DOM Navigation Links */}
                        <div className="account-navigation-footer">
                            <Link to="/tasks" className="btn-luxury-secondary flex-1">
                                <span>Go to My Tasks →</span>
                            </Link>
                            <Link to="/" className="btn-luxury-ghost flex-1">
                                <span>← Back to Dashboard</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // 8. Main Application Frame & Router Setup
    // -------------------------------------------------------------------------
    function AppLayout() {
        return (
            <div className="app-layout">
                {/* Luxury Sidebar */}
                <Sidebar />

                {/* Main Workspace Area */}
                <main className="main-viewport">
                    <Topbar />

                    <div className="viewport-content">
                        {/* React Router DOM Routes */}
                        <Routes>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/tasks" element={<MyTasksPage />} />
                            <Route path="/account" element={<AccountPage />} />
                            {/* Fallback route */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>

                    {/* Luxury Footer */}
                    <footer className="luxury-footer">
                        <div className="footer-content">
                            <span>TaskFlow Luxury • Built with React & React Router DOM</span>
                            <span className="footer-dot">•</span>
                            <span>Frontend-Only Academic Workflow Suite</span>
                            <span className="footer-dot">•</span>
                            <Link to="/account" className="footer-link">Default Credentials</Link>
                        </div>
                    </footer>
                </main>

                {/* Floating Notification */}
                <ToastNotification />
            </div>
        );
    }

    function App() {
        return (
            <AppProvider>
                <HashRouter>
                    <AppLayout />
                </HashRouter>
            </AppProvider>
        );
    }

    // -------------------------------------------------------------------------
    // 9. Mount React Application to Root DOM
    // -------------------------------------------------------------------------
    function mountApp() {
        const rootElement = document.getElementById("root");
        if (!rootElement) return;

        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(<App />);
        } else if (ReactDOM.render) {
            ReactDOM.render(<App />, rootElement);
        }
    }

    // Execute mount when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountApp);
    } else {
        mountApp();
    }
})();
