// ===============================
// USERS
// ===============================

const users = [
    {
        username: "student01",
        password: "1234",
        role: "Student",
        name: "Student User"
    },
    {
        username: "faculty01",
        password: "1234",
        role: "Faculty",
        name: "Faculty User"
    },
    {
        username: "admin01",
        password: "1234",
        role: "Admin",
        name: "Administrator"
    }
];


// ===============================
// PERMISSIONS
// ===============================

const permissions = {

    Student: [
        "Library",
        "Computer Lab",
        "Classroom"
    ],

    Faculty: [
        "Library",
        "Computer Lab",
        "Classroom",
        "Faculty Room"
    ],

    Admin: [
        "Library",
        "Computer Lab",
        "Classroom",
        "Faculty Room",
        "Admin Block",
        "Server Room"
    ]

};


// ===============================
// VARIABLES
// ===============================

let currentUser = null;

let logs = JSON.parse(localStorage.getItem("campusLogs")) || [];


// ===============================
// DATE
// ===============================

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });


// ===============================
// LOGIN
// ===============================

document.getElementById("loginForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();

    const password = document.getElementById("password").value;

    const user = users.find(function (user) {
        return user.username === username &&
               user.password === password;
    });

    if (user) {

        currentUser = user;

        document.getElementById("loginError").textContent = "";

        showDashboard();

    } else {

        document.getElementById("loginError").textContent =
            "Invalid credentials. Please try again.";

    }

});


// ===============================
// DASHBOARD
// ===============================

function showDashboard() {

    document.getElementById("loginScreen").classList.add("hidden");

    document.getElementById("dashboard").classList.remove("hidden");

    document.getElementById("sidebarUsername").textContent =
        currentUser.name;

    document.getElementById("sidebarRole").textContent =
        currentUser.role;

    const initial = currentUser.name.charAt(0).toUpperCase();

    document.getElementById("userAvatar").textContent = initial;

    document.getElementById("topAvatar").textContent = initial;

    document.getElementById("welcomeText").textContent =
        "Welcome back, " + currentUser.name + ".";

    showPage("overview");

}


// ===============================
// NAVIGATION
// ===============================

const navButtons = document.querySelectorAll(".nav-item");

navButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const page = button.dataset.page;

        showPage(page);

        navButtons.forEach(function (nav) {
            nav.classList.remove("active");
        });

        button.classList.add("active");

    });

});


function showPage(page) {

    document.querySelectorAll(".page").forEach(function (section) {

        section.classList.add("hidden");

    });

    document.getElementById(page + "Page").classList.remove("hidden");

    const pageTitles = {
        overview: "Overview",
        access: "Access Control",
        logs: "Access Logs",
        alerts: "Security Alerts"
    };

    document.getElementById("pageTitle").textContent =
        pageTitles[page];

    document.getElementById("breadcrumbText").textContent =
        page.toUpperCase();

    updateDashboard();

}


// ===============================
// VIEW ALL
// ===============================

document.querySelectorAll("[data-goto]").forEach(function (button) {

    button.addEventListener("click", function () {

        const page = button.dataset.goto;

        showPage(page);

        navButtons.forEach(function (nav) {

            nav.classList.toggle(
                "active",
                nav.dataset.page === page
            );

        });

    });

});


// ===============================
// FACILITY ACCESS
// ===============================

document.querySelectorAll("[data-facility]").forEach(function (button) {

    button.addEventListener("click", function () {

        const facility = button.dataset.facility;

        requestAccess(facility);

    });

});


function requestAccess(facility) {

    if (!currentUser) return;

    const userPermissions = permissions[currentUser.role];

    const granted = userPermissions.includes(facility);

    const logEntry = {

        username: currentUser.username,

        name: currentUser.name,

        role: currentUser.role,

        facility: facility,

        status: granted ? "Granted" : "Denied",

        time: new Date().toLocaleString("en-IN")

    };


    // Store the access attempt

    logs.unshift(logEntry);

    localStorage.setItem(
        "campusLogs",
        JSON.stringify(logs)
    );


    // Display result

    showAccessResult(logEntry);


    // Refresh dashboard

    updateDashboard();

}


// ===============================
// ACCESS RESULT
// ===============================

function showAccessResult(result) {

    const container = document.getElementById("accessResult");

    container.className = "access-result";

    container.classList.remove("hidden");

    if (result.status === "Granted") {

        container.classList.add("granted");

        container.innerHTML = `

            <h3>✓ ACCESS GRANTED</h3>

            <p>User: ${result.username}</p>

            <p>Role: ${result.role}</p>

            <p>Facility: ${result.facility}</p>

            <p>Authorization successful. Permission verified.</p>

        `;

    } else {

        container.classList.add("denied");

        container.innerHTML = `

            <h3>✕ ACCESS DENIED</h3>

            <p>User: ${result.username}</p>

            <p>Role: ${result.role}</p>

            <p>Facility: ${result.facility}</p>

            <p>Unauthorized access attempt detected.</p>

        `;

    }

}


// ===============================
// DASHBOARD STATS
// ===============================

function updateDashboard() {

    const total = logs.length;

    const granted = logs.filter(function (log) {

        return log.status === "Granted";

    }).length;

    const denied = logs.filter(function (log) {

        return log.status === "Denied";

    }).length;


    document.getElementById("totalRequests").textContent = total;

    document.getElementById("grantedCount").textContent = granted;

    document.getElementById("deniedCount").textContent = denied;


    document.getElementById("securityEventText").textContent =
        denied === 0
            ? "No events recorded"
            : denied + " unauthorized attempts";


    renderLogs();

    renderAlerts();

}


// ===============================
// LOGS
// ===============================

function renderLogs() {

    const recentTable =
        document.getElementById("recentLogsTable");

    const allTable =
        document.getElementById("allLogsTable");

    recentTable.innerHTML = "";

    allTable.innerHTML = "";


    logs.slice(0, 5).forEach(function (log) {

        recentTable.innerHTML += createLogRow(log);

    });


    logs.forEach(function (log) {

        allTable.innerHTML += createLogRow(log);

    });

}


function createLogRow(log) {

    const badgeClass =
        log.status === "Granted"
            ? "granted-badge"
            : "denied-badge";

    return `

        <tr>

            <td>${log.username}</td>

            <td>${log.facility}</td>

            <td>${log.role}</td>

            <td>
                <span class="badge ${badgeClass}">
                    ${log.status}
                </span>
            </td>

            <td>${log.time}</td>

        </tr>

    `;

}


// ===============================
// SECURITY ALERTS
// ===============================

function renderAlerts() {

    const container =
        document.getElementById("alertsContainer");

    const deniedLogs = logs.filter(function (log) {

        return log.status === "Denied";

    });

    container.innerHTML = "";


    if (deniedLogs.length === 0) {

        container.innerHTML = `

            <div class="security-status-card">

                <div class="security-status-icon">✓</div>

                <div>
                    <h4>No security alerts</h4>
                    <p>No unauthorized attempts detected.</p>
                </div>

            </div>

        `;

        return;

    }


    deniedLogs.forEach(function (log) {

        container.innerHTML += `

            <div class="alert-card">

                <strong>△ Unauthorized access detected</strong>

                <p>User: ${log.username}</p>

                <p>Role: ${log.role}</p>

                <p>Facility: ${log.facility}</p>

                <p>Access denied by the authorization system.</p>

                <small>${log.time}</small>

            </div>

        `;

    });

}


// ===============================
// CLEAR LOGS
// ===============================

document.getElementById("clearLogsBtn").addEventListener("click", function () {

    const confirmed = confirm("Clear all access logs?");

    if (confirmed) {

        logs = [];

        localStorage.removeItem("campusLogs");

        updateDashboard();

    }

});


// ===============================
// LOGOUT
// ===============================

document.getElementById("logoutBtn").addEventListener("click", function () {

    currentUser = null;

    document.getElementById("dashboard").classList.add("hidden");

    document.getElementById("loginScreen").classList.remove("hidden");

    document.getElementById("loginForm").reset();

    document.getElementById("loginError").textContent = "";

    document.getElementById("accessResult").classList.add("hidden");

});