// BASE URL
const BASE_URL = window.location.hostname.includes("localhost")
    ? "http://localhost:3000"
    : "https://sandy-backend2-0.onrender.com";

// Firebase
let auth = null;
let currentUserUid = null;
let currentUserName = null;
let currentUserPhoto = null;

// Theme Management (Simplified for Tailwind Dark Mode)
const themes = ['dark', 'light'];
let currentThemeIndex = 0;

function initTheme() {
    // Default to dark mode for premium feel
    document.documentElement.classList.add('dark');
}

function cycleTheme() {
    document.documentElement.classList.toggle('dark');
}

// Initialize Firebase securely
async function initializeFirebase() {
    try {
        const response = await fetch(`${BASE_URL}/firebase-config`);
        const firebaseConfig = await response.json();

        if (!firebaseConfig.apiKey) throw new Error('Firebase config not available');

        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        console.log('Firebase initialized securely');
        setupAuthListener();

    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        showMessage('❌ Failed to connect to server. Please refresh.', 5000);
    }
}

// Setup auth state listener
function setupAuthListener() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserUid = user.uid;
            currentUserName = user.displayName || "User";
            currentUserPhoto = user.photoURL || null;

            toggleLoginState(true);
            updateUserDisplay(user);
            loadData();
            fetchBudget();
        } else {
            currentUserUid = null;
            currentUserName = null;
            currentUserPhoto = null;

            toggleLoginState(false);
            clearUserDisplay();
            clearBudgetUI();

            document.getElementById("tableContainer").innerHTML =
                "<div class='text-center py-10 opacity-50'>Login to view your expenses</div>";
            document.getElementById("analyticsContainer").style.display = "none";
        }
    });
}

// Update user display
function updateUserDisplay(user) {
    const userNameDisplay = document.getElementById("userNameDisplay");
    const userProfilePic = document.getElementById("userProfilePic");
    const userInitials = document.getElementById("userInitials");

    if (user.displayName) {
        userNameDisplay.textContent = user.displayName.split(' ')[0]; // First name only
        userNameDisplay.classList.remove('hidden');

        if (user.photoURL) {
            userProfilePic.src = user.photoURL;
            userProfilePic.classList.remove('hidden');
            userInitials.style.display = "none";
        } else {
            // Initials fallback
            const initials = (user.displayName || "U").charAt(0).toUpperCase();
            userInitials.textContent = initials;
            userInitials.style.display = "flex";
            userProfilePic.classList.add('hidden');
        }
    } else {
        userNameDisplay.textContent = "User";
        userInitials.textContent = "U";
        userInitials.style.display = "flex";
        userProfilePic.classList.add('hidden');
    }
}

function clearUserDisplay() {
    document.getElementById("userNameDisplay").textContent = "";
    document.getElementById("userProfilePic").classList.add('hidden');
    document.getElementById("userInitials").style.display = "none";
}

// Elements
const loginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("googleLogoutBtn");
const loginView = document.getElementById("loginView");
const appInterface = document.getElementById("appInterface");
const expenseFormContainer = document.getElementById("expenseFormContainer");
const tableContainer = document.getElementById("tableContainer");
const msgBox = document.getElementById("msgBox");
const analyticsContainer = document.getElementById("analyticsContainer");
const themeToggle = document.getElementById("themeToggle");

// Budget elements
const budgetCard = document.getElementById("budgetCard");
const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const resetBudgetBtn = document.getElementById("resetBudgetBtn");
const budgetProgressBar = document.getElementById("budgetProgressBar");
const budgetStatusText = document.getElementById("budgetStatusText");
const budgetAlerts = document.getElementById("budgetAlerts");
const budgetPercentage = document.getElementById("budgetPercentage");
const analyticsBadge = document.getElementById("analyticsBadge");

let currentBudgetAmount = 0;

// Modals
const aboutLink = document.getElementById("aboutLink");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = document.getElementById("closeAbout");

const historyLink = document.getElementById("historyLink");
const historyModal = document.getElementById("historyModal");
const closeHistory = document.getElementById("closeHistory");
const historyContent = document.getElementById("historyContent");

// Event Listeners
aboutLink && aboutLink.addEventListener("click", e => { e.preventDefault(); aboutModal.classList.remove("hidden"); });
closeAbout && closeAbout.addEventListener("click", () => { aboutModal.classList.add("hidden"); });

historyLink && historyLink.addEventListener("click", e => { e.preventDefault(); showHistory(); });
closeHistory && closeHistory.addEventListener("click", () => { historyModal.classList.add("hidden"); });

themeToggle && themeToggle.addEventListener("click", cycleTheme);

window.addEventListener("click", e => {
    if (e.target == aboutModal) aboutModal.classList.add("hidden");
    if (e.target == historyModal) historyModal.classList.add("hidden");
});

// Initialize
initTheme();
initializeFirebase();

// Toast Message
function showMessage(msg, duration = 3000) {
    msgBox.innerHTML = msg;
    msgBox.style.display = "block";

    // Animate in
    requestAnimationFrame(() => {
        msgBox.classList.remove("translate-y-20", "opacity-0");
    });

    setTimeout(() => {
        // Animate out
        msgBox.classList.add("translate-y-20", "opacity-0");
        setTimeout(() => msgBox.style.display = "none", 300);
    }, duration);

    // Auto color based on content
    if (msg.includes("❌")) msgBox.className = "fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md transform transition-all duration-300 bg-red-500/90 text-white font-medium";
    else if (msg.includes("⚠️")) msgBox.className = "fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md transform transition-all duration-300 bg-orange-500/90 text-white font-medium";
    else msgBox.className = "fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md transform transition-all duration-300 bg-emerald-500/90 text-white font-medium";
}

// Toggle UI State
function toggleLoginState(isLoggedIn) {
    if (isLoggedIn) {
        loginView.style.display = "none";
        // Ensure main interface is visible? It's always visible but covered by login view z-index
    } else {
        loginView.style.display = "flex";
    }
}

// Login Handler
loginBtn.addEventListener("click", async () => {
    if (!auth) {
        showMessage("Connection not ready...", 2000);
        return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        showMessage("✅ Welcome back, " + result.user.displayName.split(" ")[0]);
    } catch (err) {
        console.error(err);
        showMessage("❌ Login failed");
    }
});

// Logout Handler
logoutBtn && logoutBtn.addEventListener("click", async () => {
    if (!auth) return;
    try {
        await auth.signOut();
        showMessage("✅ Logged out successfully");
    } catch (err) {
        console.error(err);
        showMessage("❌ Logout failed");
    }
});

// Expense Form Handler
const form = document.getElementById("expenseForm");
const editId = document.getElementById("editId");

form && form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!currentUserUid) return;

    const btn = form.querySelector("button[type='submit']");
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = "<span class='animate-pulse'>Saving...</span>";
    btn.disabled = true;

    const data = {
        uid: currentUserUid,
        name: document.getElementById("name").value.trim(),
        amount: document.getElementById("amount").value.trim(),
        type: document.getElementById("type").value,
        description: document.getElementById("description").value.trim(),
        date: document.getElementById("date").value
    };

    try {
        const url = editId.value ? `${BASE_URL}/update/${editId.value}` : `${BASE_URL}/submit`;
        const method = editId.value ? "PUT" : "POST";

        if (editId.value) data.editorName = currentUserName;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        showMessage(result.message || "✅ Saved successfully");
        editId.value = "";
        form.reset();

        // Reset button state
        btn.innerHTML = "Add Expense";
        btn.classList.remove("from-orange-500", "to-red-500"); // Remove edit mode style if any
        btn.classList.add("from-primary-600", "to-indigo-600");

        await loadData();
        await fetchBudget();

    } catch (err) {
        console.error(err);
        showMessage("❌ Failed to save expense");
    } finally {
        btn.innerHTML = originalBtnText; // Restore text in case of error/or if I messed up above
        if (!editId.value) btn.innerHTML = "Add Expense"; // Ensure it goes back to Add
        btn.disabled = false;
    }
});

// BUDGET LOGIC
async function saveBudgetToServer(amount) {
    if (!currentUserUid) return;
    try {
        const res = await fetch(`${BASE_URL}/setBudget`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: currentUserUid, amount: parseFloat(amount) || 0 })
        });
        if (res.ok) showMessage("✅ Budget updated");
        else showMessage("❌ Failed to save budget");
        await fetchBudget();
    } catch (err) { console.error(err); showMessage("❌ Error saving budget"); }
}

async function fetchBudget() {
    if (!currentUserUid) { clearBudgetUI(); return; }
    try {
        const res = await fetch(`${BASE_URL}/getBudget?uid=${currentUserUid}`);
        if (!res.ok) { clearBudgetUI(); return; }

        const r = await res.json();
        const bAmount = (r && r.amount) ? parseFloat(r.amount) : 0;
        currentBudgetAmount = bAmount;

        // Use total from already loaded expenses if possible, else recalculate (here we recalculate to be safe)
        // Optimization: We can simply sum the current rendered list, but fetching again ensures sync
        const expensesRes = await fetch(`${BASE_URL}/users?uid=${currentUserUid}`);
        const arr = await expensesRes.json();
        let totalAmount = 0;
        if (Array.isArray(arr)) arr.forEach(x => totalAmount += parseFloat(x.amount) || 0);

        updateBudgetUI(currentBudgetAmount, totalAmount);
        if (budgetInput) budgetInput.value = currentBudgetAmount > 0 ? currentBudgetAmount : "";

    } catch (err) { console.error(err); clearBudgetUI(); }
}

function clearBudgetUI() {
    if (budgetProgressBar) budgetProgressBar.style.width = "0%";
    if (budgetStatusText) budgetStatusText.textContent = "No budget set";
    if (budgetPercentage) budgetPercentage.textContent = "0%";
    if (budgetAlerts) budgetAlerts.innerHTML = "";
    if (analyticsBadge) analyticsBadge.innerHTML = "";
    currentBudgetAmount = 0;
}

function updateBudgetUI(budgetAmount, totalSpent) {
    if (!budgetAmount || budgetAmount <= 0) {
        clearBudgetUI();
        return;
    }

    const pct = (totalSpent / budgetAmount) * 100;
    const clampedPct = Math.min(pct, 100);

    budgetProgressBar.style.width = `${clampedPct}%`;
    budgetPercentage.textContent = `${Math.round(pct)}%`;

    // Color logic
    budgetProgressBar.className = "h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)]";
    if (pct >= 100) budgetProgressBar.classList.add("bg-gradient-to-r", "from-red-500", "to-red-400");
    else if (pct >= 80) budgetProgressBar.classList.add("bg-gradient-to-r", "from-orange-500", "to-orange-400");
    else budgetProgressBar.classList.add("bg-gradient-to-r", "from-emerald-500", "to-emerald-400");

    budgetStatusText.innerHTML = `
        <span class="text-slate-400">Budget:</span> <span class="text-white font-mono">₹${budgetAmount.toLocaleString()}</span>
        <span class="mx-2 text-slate-600">|</span>
        <span class="text-slate-400">Spent:</span> <span class="text-white font-mono">₹${totalSpent.toLocaleString()}</span>
    `;

    // Alerts
    budgetAlerts.innerHTML = "";
    if (pct >= 100) {
        const over = totalSpent - budgetAmount;
        budgetAlerts.innerHTML = `<span class="text-red-400 flex items-center gap-1"><span class="material-symbols-outlined text-sm">warning</span> Over budget by ₹${over.toFixed(0)}!</span>`;
        analyticsBadge.innerHTML = `<span class="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">🚨 Over Budget</span>`;
    } else if (pct >= 80) {
        budgetAlerts.innerHTML = `<span class="text-orange-400 flex items-center gap-1"><span class="material-symbols-outlined text-sm">info</span> Approaching limit!</span>`;
        analyticsBadge.innerHTML = `<span class="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">⚠️ ${Math.round(pct)}% Used</span>`;
    } else {
        analyticsBadge.innerHTML = `<span class="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">✅ On Track</span>`;
    }
}

saveBudgetBtn && saveBudgetBtn.addEventListener("click", () => {
    const val = parseFloat(budgetInput.value);
    if (val > 0) saveBudgetToServer(val);
    else showMessage("⚠️ Enter a valid budget");
});

resetBudgetBtn && resetBudgetBtn.addEventListener("click", async () => {
    if (!currentUserUid) return;
    if (!confirm("Disable budget tracking?")) return;

    try {
        await fetch(`${BASE_URL}/setBudget`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: currentUserUid, amount: 0, reset: true })
        });
        showMessage("Budget disabled");
        clearBudgetUI();
    } catch (e) { console.error(e); }
});

// LOAD DATA & GENERATE UI
async function loadData() {
    if (!currentUserUid) return;

    try {
        const res = await fetch(`${BASE_URL}/users?uid=${currentUserUid}`);
        if (!res.ok) throw new Error("Fetch failed");

        const expenses = await res.json();

        if (!Array.isArray(expenses) || expenses.length === 0) {
            tableContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-slate-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                    <p>No transactions yet. Add your first expense!</p>
                </div>`;
            analyticsContainer.style.display = "none";

            // Still check budget to update UI if set
            const bRes = await fetch(`${BASE_URL}/getBudget?uid=${currentUserUid}`);
            if (bRes.ok) {
                const b = await bRes.json();
                if (b && b.amount) updateBudgetUI(parseFloat(b.amount), 0);
            }
            return;
        }

        let totalForSum = 0;
        let html = "";

        // Responsive Table/List Layout
        html += `<div class="hidden md:block w-full overflow-hidden rounded-xl border border-white/10">
            <table class="w-full text-left border-collapse">
                <thead class="bg-white/5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                    <tr>
                        <th class="p-4">Name</th>
                        <th class="p-4">Date</th>
                        <th class="p-4">Type</th>
                        <th class="p-4">Amount</th>
                        <th class="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5 bg-white/[0.02]">`;

        // Mobile-first Grid for Loop
        let mobileHtml = `<div class="md:hidden space-y-3">`;

        expenses.forEach((ex, i) => {
            const amount = parseFloat(ex.amount) || 0;
            totalForSum += amount;

            // Badge Colors
            let typeColor = "bg-slate-500/20 text-slate-300";
            if (ex.type === "Card") typeColor = "bg-blue-500/20 text-blue-300 border border-blue-500/30";
            else if (ex.type === "Cash") typeColor = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
            else if (ex.type === "Online" || ex.type === "Gpay/Paytm") typeColor = "bg-purple-500/20 text-purple-300 border border-purple-500/30";

            // Desktop Row
            html += `
                <tr class="hover:bg-white/5 transition-colors group">
                    <td class="p-4">
                        <div class="font-medium text-white">${ex.name}</div>
                        <div class="text-xs text-slate-500 truncate max-w-[150px]">${ex.description}</div>
                    </td>
                    <td class="p-4 text-sm text-slate-400 font-mono">${ex.date}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-md text-xs font-medium ${typeColor}">${ex.type}</span>
                    </td>
                    <td class="p-4 font-mono font-bold text-white">₹${amount.toFixed(2)}</td>
                    <td class="p-4 text-right">
                        <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="editExpense('${ex._id}')" class="p-1.5 rounded-lg hover:bg-white/10 text-orange-400 transition-colors" title="Edit">
                                <span class="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button onclick="viewHistory('${ex._id}')" class="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 transition-colors" title="History">
                                <span class="material-symbols-outlined text-lg">history</span>
                            </button>
                            <button onclick="deleteExpense('${ex._id}', '${ex.name}')" class="p-1.5 rounded-lg hover:bg-white/10 text-red-400 transition-colors" title="Delete">
                                <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>`;

            // Mobile Card
            mobileHtml += `
                <div class="p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/10 transition-colors relative">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-bold text-white text-base">${ex.name}</h4>
                            <span class="text-xs text-slate-500">${ex.date}</span>
                        </div>
                        <span class="font-mono font-bold text-lg text-white">₹${amount.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center mt-3">
                         <span class="px-2 py-0.5 rounded text-[10px] font-medium ${typeColor}">${ex.type}</span>
                         <div class="flex gap-2">
                             <button onclick="editExpense('${ex._id}')" class="text-orange-400 p-1"><span class="material-symbols-outlined text-lg">edit</span></button>
                             <button onclick="viewHistory('${ex._id}')" class="text-blue-400 p-1"><span class="material-symbols-outlined text-lg">history</span></button>
                             <button onclick="deleteExpense('${ex._id}', '${ex.name}')" class="text-red-400 p-1"><span class="material-symbols-outlined text-lg">delete</span></button>
                         </div>
                    </div>
                    <div class="mt-2 text-xs text-slate-400 italic bg-black/20 p-2 rounded">${ex.description}</div>
                </div>
            `;
        });

        html += `</tbody></table></div>`; // Close desktop table
        mobileHtml += `</div>`; // Close mobile grid

        tableContainer.innerHTML = html + mobileHtml;

        // Update Total Summary
        const totalDisplay = document.getElementById("totalExpensesDisplay");
        if (totalDisplay) totalDisplay.textContent = `₹${totalForSum.toLocaleString()}`;

        // Charts
        analyticsContainer.style.display = "grid";
        renderCharts(expenses);

    } catch (err) {
        console.error(err);
        tableContainer.innerHTML = `<div class="p-4 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">Failed to load data.</div>`;
    }
}

// Edit/Delete Globals
window.editExpense = async function (id) {
    try {
        const res = await fetch(`${BASE_URL}/user/${id}`);
        const user = await res.json();

        document.getElementById("name").value = user.name;
        document.getElementById("amount").value = user.amount;
        document.getElementById("type").value = user.type;
        document.getElementById("description").value = user.description;
        document.getElementById("date").value = user.date;
        document.getElementById("editId").value = id;

        // Visual indicator for edit mode
        const submitBtn = document.querySelector("#expenseForm button[type='submit']");
        submitBtn.innerHTML = "Update Expense";
        submitBtn.classList.remove("from-primary-600", "to-indigo-600");
        submitBtn.classList.add("from-orange-500", "to-red-500"); // Warning colors for edit

        // Scroll to form
        if (window.innerWidth < 768) {
            expenseFormContainer.scrollIntoView({ behavior: 'smooth' });
        }

        showMessage("✏️ Editing: " + user.name);
    } catch (e) { console.error(e); }
}

window.deleteExpense = async function (id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
        const res = await fetch(`${BASE_URL}/delete/${id}`, { method: "DELETE" });
        if (res.ok) {
            showMessage("🗑️ Deleted successfully");
            loadData();
            fetchBudget();
        } else showMessage("❌ Delete failed");
    } catch (e) { console.error(e); }
}

// History
window.viewHistory = async function (id) {
    historyModal.classList.remove("hidden");
    historyContent.innerHTML = `<div class="text-center py-8"><div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div></div>`;

    try {
        const res = await fetch(`${BASE_URL}/user/${id}`);
        const exp = await res.json();

        let h = `<div class="border-b border-white/10 pb-4 mb-4">
                    <h3 class="text-lg font-bold text-white">${exp.name}</h3>
                    <p class="text-sm text-slate-400">Created: ${new Date(exp.createdAt).toLocaleDateString()}</p>
                 </div>`;

        if (exp.editHistory && exp.editHistory.length > 0) {
            h += `<div class="space-y-4">`;
            exp.editHistory.forEach(edit => {
                h += `<div class="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div class="flex justify-between text-xs text-slate-400 mb-2">
                            <span class="font-bold text-primary-300">${edit.editorName || "User"}</span>
                            <span>${new Date(edit.date).toLocaleString()}</span>
                        </div>
                        <div class="text-sm text-slate-300 space-y-1">
                            ${formatChanges(edit.before, edit.after)}
                        </div>
                      </div>`;
            });
            h += `</div>`;
        } else {
            h += `<p class="text-center text-slate-500 italic">No edits recorded.</p>`;
        }
        historyContent.innerHTML = h;
    } catch (e) { historyContent.innerHTML = "Failed to load."; }
}

function formatChanges(before, after) {
    let s = "";
    if (before.name !== after.name) s += `<div>Name: <span class="text-red-300 line-through mr-1">${before.name}</span> → <span class="text-emerald-300">${after.name}</span></div>`;
    if (before.amount !== after.amount) s += `<div>Amt: <span class="text-red-300 line-through mr-1">₹${before.amount}</span> → <span class="text-emerald-300">₹${after.amount}</span></div>`;
    // ... add other fields similarly if needed
    if (s === "") s = "<div>Updated expenses details</div>";
    return s;
}

async function showHistory() {
    // Show all history (simplified for now)
    historyModal.classList.remove("hidden");
    historyContent.innerHTML = "<p class='text-center py-4 text-slate-500'>Global history view coming soon. Check individual items.</p>";
}

// Charts
function renderCharts(rawData) {
    const dates = {};
    const cats = {};

    // Process Data
    rawData.forEach(x => {
        const amt = parseFloat(x.amount) || 0;
        dates[x.date] = (dates[x.date] || 0) + amt;
        cats[x.type] = (cats[x.type] || 0) + amt;
    });

    // Line Chart
    if (window.lineChartVal) window.lineChartVal.destroy();
    const ctx1 = document.getElementById("lineChart").getContext("2d");

    // Gradient for Line
    const grad = ctx1.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); // primary-500
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    window.lineChartVal = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: Object.keys(dates),
            datasets: [{
                label: 'Spend',
                data: Object.values(dates),
                borderColor: '#60a5fa', // primary-400
                backgroundColor: grad,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1e1e1e'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Pie Chart
    if (window.pieChartVal) window.pieChartVal.destroy();

    // Premium Colors
    const palette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    window.pieChartVal = new Chart(document.getElementById("pieChart"), {
        type: 'doughnut',
        data: {
            labels: Object.keys(cats),
            datasets: [{
                data: Object.values(cats),
                backgroundColor: palette,
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#cbd5e1', padding: 20 } }
            }
        }
    });
}
