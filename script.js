// ==========================================
// CAMPUSSECURE - ACCESS CONTROL SYSTEM
// ==========================================


// DEMO USERS

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


// ROLE PERMISSIONS

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


// DOM ELEMENTS

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const dashboard = document.getElementById("dashboard");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const sidebarUsername = document.getElementById("sidebarUsername");
const sidebarRole = document.getElementById("sidebarRole");

const userAvatar = document.getElementById("userAvatar");
const topAvatar = document.getElementById("topAvatar");

const welcomeText = document.getElementById("welcomeText");

const pageTitle = document.getElementById("pageTitle");
const breadcrumbText = document.getElementById("breadcrumbText");

const currentDate = document.getElementById("currentDate");

const totalRequests = document.getElementById("totalRequests");
const grantedCount = document.getElementById("grantedCount");
const deniedCount = document.getElementById("deniedCount");
const securityEventText = document.getElementById("securityEventText");

const recentLogsTable = document.getElementById("recentLogsTable");
const allLogsTable = document.getElementById("allLogsTable");

const alertsContainer = document.getElementById("alertsContainer");

const accessResult = document.getElementById("accessResult");

const clearLogsBtn = document.getElementById("clearLogsBtn");
const logoutBtn = document.getElementById("logoutBtn");


// VARIABLES

let currentUser = null;

let logs = JSON.parse(localStorage.getItem("campusLogs")) || [];


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const user = users.find(function (u) {
        return u.username === username && u.password === password;
    });

    if (!user) {

        loginError.textContent = "Invalid username or password.";
        loginError.classList.remove("hidden");

        return;
    }

    loginError.classList.add("hidden");

    currentUser = user;

    showDashboard();

});


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {

    loginScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");

    sidebarUsername.textContent = currentUser.name;
    sidebarRole.textContent = currentUser.role;

    const initials = currentUser.name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase();

    userAvatar.textContent = initials;
    topAvatar.textContent = initials;

    welcomeText.textContent = `Welcome back, ${currentUser.name}`;

    updateDate();

    updateDashboard();

    showPage("overview");

}


// ==========================================
// DATE
// ==========================================

function updateDate() {

    const date = new Date();

    const formattedDate = date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    if (currentDate) {
        currentDate.textContent = formattedDate;
    }

}


// ==========================================
// NAVIGATION
// ==========================================

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(function (item) {

    item.addEventListener("click", function () {

        const page = item.dataset.page;

        showPage(page);

    });

});


function showPage(page) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(function (p) {
        p.classList.add("hidden");
    });

    const targetPage = document.getElementById(page + "Page");

    if (targetPage) {
        targetPage.classList.remove("hidden");
    }

    navItems.forEach(function (item) {

        item.classList.remove("active");

        if (item.dataset.page === page) {
            item.classList.add("active");
        }

    });

    const titles = {
        overview: "Overview",
        access: "Access Control",
        logs: "Access Logs",
        alerts: "Security Alerts"
    };

    pageTitle.textContent = titles[page] || "Dashboard";

    breadcrumbText.textContent = "Dashboard / " + (titles[page] || "Dashboard");

}


// VIEW ALL BUTTONS

document.querySelectorAll("[data-goto]").forEach(function (button) {

    button.addEventListener("click", function () {

        showPage(button.dataset.goto);

    });

});


// ==========================================
// ACCESS CONTROL
// ==========================================

const accessButtons = document.querySelectorAll("[data-facility]");

accessButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const facility = button.dataset.facility;

        checkAccess(facility);

    });

});


function checkAccess(facility) {

    const allowedFacilities = permissions[currentUser.role];

    const granted = allowedFacilities.includes(facility);

    const log = {

        username: currentUser.name,
        role: currentUser.role,
        facility: facility,
        status: granted ? "Granted" : "Denied",
        time: new Date().toLocaleString("en-IN")

    };

    logs.unshift(log);

    saveLogs();

    showAccessResult(facility, granted);

    updateDashboard();

}


// ==========================================
// ACCESS RESULT
// ==========================================

function showAccessResult(facility, granted) {

    accessResult.classList.remove("hidden");
    accessResult.classList.remove("granted", "denied");

    if (granted) {

        accessResult.classList.add("granted");

        accessResult.innerHTML = `
            <strong>✓ ACCESS GRANTED</strong><br><br>
            ${currentUser.name} is authorized to access 
            <strong>${facility}</strong>.<br>
            Role: ${currentUser.role}
        `;

    } else {

        accessResult.classList.add("denied");

        accessResult.innerHTML = `
            <strong>✕ ACCESS DENIED</strong><br><br>
            ${currentUser.name} is NOT authorized to access 
            <strong>${facility}</strong>.<br>
            Role: ${currentUser.role}<br><br>
            <strong>Security event recorded.</strong>
        `;

    }

}


// ==========================================
// UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    const total = logs.length;

    const granted = logs.filter(log => log.status === "Granted").length;

    const denied = logs.filter(log => log.status === "Denied").length;

    totalRequests.textContent = total;
    grantedCount.textContent = granted;
    deniedCount.textContent = denied;
    securityEventText.textContent = denied;

    renderLogs();

    renderAlerts();

}


// ==========================================
// RENDER LOGS
// ==========================================

function renderLogs() {

    // RECENT LOGS

    const recentLogs = logs.slice(0, 5);

    if (recentLogs.length === 0) {

        recentLogsTable.innerHTML = `
            <tr>
                <td colspan="3" class="empty-table">
                    No access activity yet.
                </td>
            </tr>
        `;

    } else {

        recentLogsTable.innerHTML = recentLogs.map(function (log) {

            const statusClass = log.status === "Granted"
                ? "status-granted"
                : "status-denied";

            return `
                <tr>
                    <td>${log.username}</td>
                    <td>${log.facility}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${log.status}
                        </span>
                    </td>
                </tr>
            `;

        }).join("");

    }


    // ALL LOGS

    if (logs.length === 0) {

        allLogsTable.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">
                    No logs available.
                </td>
            </tr>
        `;

    } else {

        allLogsTable.innerHTML = logs.map(function (log) {

            const statusClass = log.status === "Granted"
                ? "status-granted"
                : "status-denied";

            return `
                <tr>
                    <td>${log.username}</td>
                    <td>${log.role}</td>
                    <td>${log.facility}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${log.status}
                        </span>
                    </td>
                    <td>${log.time}</td>
                </tr>
            `;

        }).join("");

    }

}


// ==========================================
// SECURITY ALERTS
// ==========================================

function renderAlerts() {

    const deniedLogs = logs.filter(function (log) {
        return log.status === "Denied";
    });

    if (deniedLogs.length === 0) {

        alertsContainer.innerHTML = `
            <div class="empty-state">
                <span>🛡️</span>
                <p>No security alerts detected.</p>
            </div>
        `;

        return;

    }

    alertsContainer.innerHTML = deniedLogs.map(function (log) {

        return `
            <div class="alert-card">

                <strong style="color:#f87171">
                    ⚠ Unauthorized Access Attempt
                </strong>

                <p style="margin-top:12px;color:#cbd5e1;font-size:13px">
                    <strong>User:</strong> ${log.username}
                </p>

                <p style="margin-top:7px;color:#cbd5e1;font-size:13px">
                    <strong>Role:</strong> ${log.role}
                </p>

                <p style="margin-top:7px;color:#cbd5e1;font-size:13px">
                    <strong>Facility:</strong> ${log.facility}
                </p>

                <p style="margin-top:7px;color:#8b9890;font-size:12px">
                    ${log.time}
                </p>

            </div>
        `;

    }).join("");

}


// ==========================================
// SAVE LOGS
// ==========================================

function saveLogs() {

    localStorage.setItem("campusLogs", JSON.stringify(logs));

}


// ==========================================
// CLEAR LOGS
// ==========================================

clearLogsBtn.addEventListener("click", function () {

    const confirmClear = confirm("Are you sure you want to clear all access logs?");

    if (!confirmClear) {
        return;
    }

    logs = [];

    saveLogs();

    updateDashboard();

});


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener("click", function () {

    currentUser = null;

    dashboard.classList.add("hidden");
    loginScreen.classList.remove("hidden");

    loginForm.reset();

    loginError.classList.add("hidden");

    accessResult.classList.add("hidden");

});