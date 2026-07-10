let currentTab = 'income';
let allTransactions = [];
let allLendings = [];
let expenseChartInstance = null;
let investmentChartInstance = null;
let comparisonChartInstance = null;

const categories = {
    income: ['Salary', 'Side Hustle', 'Interest (Savings/FD)', 'Dividends', 'Freelance'],
    investments: ['SIP (Mutual Funds)', 'Stocks', 'Bonds', 'Fixed Deposit (FD)', 'Provident Fund (PF)', 'Gold'],
    expenses: ['Food', 'Travel', 'EMI', 'Donations', 'Rent', 'Utilities', 'Shopping', 'Subscriptions']
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    switchTab('income');
    refreshData();
});

function switchTab(tabName) {
    currentTab = tabName;

    document.querySelectorAll('.rail-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');

    const dataView = document.getElementById('data-view-container');
    const analysisView = document.getElementById('analysis-view-container');
    const entryCard = document.querySelector('.entry-card');
    const formTitle = document.getElementById('form-title');

    if (tabName === 'analysis') {
        dataView.style.display = 'none';
        entryCard.style.display = 'none';
        analysisView.style.display = 'flex';
        renderCharts();
    } else {
        dataView.style.display = 'block';
        entryCard.style.display = 'block';
        analysisView.style.display = 'none';
        const label = tabName === 'expenses' ? 'expense' : tabName === 'investments' ? 'investment' : tabName === 'lending' ? 'loan' : 'income';
        formTitle.innerText = `Log ${label}`;
        setupFormFields(tabName);
        renderTable();
    }
}

function setupFormFields(tab) {
    const categoryField = document.getElementById('category-field');
    const personField = document.getElementById('person-field');
    const descField = document.getElementById('desc-field');
    const categorySelect = document.getElementById('category');

    categorySelect.innerHTML = '';

    if (tab === 'lending') {
        categoryField.style.display = 'none';
        descField.style.display = 'none';
        personField.style.display = 'block';
    } else {
        categoryField.style.display = 'block';
        descField.style.display = 'block';
        personField.style.display = 'none';

        categories[tab].forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            categorySelect.appendChild(opt);
        });
    }
}

async function refreshData() {
    try {
        const transRes = await fetch('/api/transactions');
        allTransactions = await transRes.json();

        const lendRes = await fetch('/api/lending');
        allLendings = await lendRes.json();

        calculateDashboardMetrics();
        renderWeeklyStrip();
        populateComparisonFilters();

        if (currentTab === 'analysis') {
            renderCharts();
        } else {
            renderTable();
        }
    } catch (err) {
        console.error("Error loading financial data:", err);
    }
}

function populateComparisonFilters() {
    const select = document.getElementById('compare-month-select');
    if (!select || allTransactions.length === 0) return;

    const previousSelection = select.value;
    select.innerHTML = '';

    const monthsTracked = new Set();
    allTransactions.forEach(t => {
        if (t.date) monthsTracked.add(t.date.slice(0, 7));
    });

    const sortedMonths = Array.from(monthsTracked).sort().reverse();

    sortedMonths.forEach(ym => {
        const opt = document.createElement('option');
        opt.value = ym;
        const dateOptions = { year: 'numeric', month: 'long', timeZone: 'UTC' };
        opt.innerText = new Date(ym + "-02").toLocaleDateString('en-US', dateOptions);
        select.appendChild(opt);
    });

    if (previousSelection && sortedMonths.includes(previousSelection)) {
        select.value = previousSelection;
    }
}

function calculateDashboardMetrics() {
    let income = 0, invest = 0, expense = 0, lent = 0;

    allTransactions.forEach(t => {
        if (t.type === 'INCOME') income += t.amount;
        if (t.type === 'INVESTMENT') invest += t.amount;
        if (t.type === 'EXPENSE') expense += t.amount;
    });

    allLendings.forEach(l => {
        if (l.status === 'PENDING') lent += l.amount;
    });

    document.getElementById('total-income').innerText = `₹${income.toFixed(2)}`;
    document.getElementById('total-investments').innerText = `₹${invest.toFixed(2)}`;
    document.getElementById('total-expenses').innerText = `₹${expense.toFixed(2)}`;
    document.getElementById('total-lending').innerText = `₹${lent.toFixed(2)}`;
}

// ─────────────────────────────────────────────
//  WEEKLY LEDGER STRIP
//  Builds the last 6 calendar weeks (Mon–Sun), each as a
//  receipt-stub card, with the current week pinned & highlighted.
// ─────────────────────────────────────────────
function getWeekStart(d) {
    // Returns the Monday of the week containing d, at midnight
    const date = new Date(d);
    const day = date.getDay(); // 0 = Sun
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function fmtShortDate(d) {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function renderWeeklyStrip() {
    const strip = document.getElementById('weekly-strip');
    if (!strip) return;

    if (allTransactions.length === 0) {
        strip.innerHTML = `<div class="week-empty">No entries yet — add your first transaction to start the ledger.</div>`;
        return;
    }

    const thisMonday = getWeekStart(new Date());
    const weeks = [];
    for (let i = 5; i >= 0; i--) {
        const start = new Date(thisMonday);
        start.setDate(start.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        weeks.push({ start, end, isCurrent: i === 0 });
    }

    const cards = weeks.map(week => {
        let income = 0, expense = 0, invest = 0;

        allTransactions.forEach(t => {
            if (!t.date) return;
            const d = new Date(t.date);
            if (d >= week.start && d <= week.end) {
                if (t.type === 'INCOME') income += t.amount;
                if (t.type === 'EXPENSE') expense += t.amount;
                if (t.type === 'INVESTMENT') invest += t.amount;
            }
        });

        const net = income - expense - invest;
        const netClass = net >= 0 ? 'amt green' : 'amt red';
        const hasActivity = income || expense || invest;

        return `
            <div class="week-stub ${week.isCurrent ? 'current' : ''}">
                <p class="week-stub-range">${fmtShortDate(week.start)} – ${fmtShortDate(week.end)}</p>
                <p class="week-stub-label">
                    ${week.isCurrent ? 'This week' : `Week of ${fmtShortDate(week.start)}`}
                    ${week.isCurrent ? '<span class="week-pin">Now</span>' : ''}
                </p>
                ${hasActivity ? `
                    <div class="week-stub-row"><span class="lbl">Income</span><span class="val amt green">₹${income.toFixed(0)}</span></div>
                    <div class="week-stub-row"><span class="lbl">Spent</span><span class="val amt red">₹${expense.toFixed(0)}</span></div>
                    <div class="week-stub-row"><span class="lbl">Invested</span><span class="val amt blue">₹${invest.toFixed(0)}</span></div>
                    <div class="week-stub-net">
                        <span class="lbl">Net</span>
                        <span class="val ${netClass}">${net >= 0 ? '+' : '-'}₹${Math.abs(net).toFixed(0)}</span>
                    </div>
                ` : `<p style="color:var(--faint); font-size:0.78rem; margin-top:8px;">No activity</p>`}
            </div>
        `;
    });

    strip.innerHTML = cards.join('');

    // Auto-scroll to the current (rightmost) week on first render
    requestAnimationFrame(() => { strip.scrollLeft = strip.scrollWidth; });
}

// ─────────────────────────────────────────────
//  TABLE RENDERING
// ─────────────────────────────────────────────
function renderTable() {
    const tbody = document.getElementById('table-body');
    const viewTitle = document.getElementById('view-title');
    tbody.innerHTML = '';

    if (currentTab === 'lending') {
        viewTitle.innerText = "Friends & family loans";
        document.getElementById('col-header-1').innerText = "Borrower";
        document.getElementById('col-header-2').innerText = "Status";
        document.getElementById('col-header-3').innerText = "Timeline";
        document.getElementById('col-header-4').innerText = "Amount";

        if (allLendings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--faint); padding:30px 0;">No loans logged yet.</td></tr>`;
            return;
        }

        allLendings.forEach(l => {
            const isPending = l.status === 'PENDING';
            const statusBadge = isPending
                ? `<span class="status-pill pending">Pending</span>`
                : `<span class="status-pill done">Tallyed</span>`;

            const dateDisplay = isPending ? l.dateLent : `${l.dateLent} → ${l.dateReturned}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${l.personName}</td>
                <td>${statusBadge}</td>
                <td style="color:var(--muted)">${dateDisplay}</td>
                <td class="amt amber">₹${l.amount.toFixed(2)}</td>
                <td style="text-align:right;">
                    ${isPending ? `<button onclick="tallyLoan(${l.id})" class="tally-btn">Tally</button>` : `<i class="fa-solid fa-circle-check" style="color:var(--green)"></i>`}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        const titleMap = { income: 'Income', investments: 'Investments', expenses: 'Expenses' };
        viewTitle.innerText = titleMap[currentTab] || 'Records';
        document.getElementById('col-header-1').innerText = "Details";
        document.getElementById('col-header-2').innerText = "Category";
        document.getElementById('col-header-3').innerText = "Date";
        document.getElementById('col-header-4').innerText = "Amount";

        const mappedType = currentTab === 'income' ? 'INCOME' : currentTab === 'investments' ? 'INVESTMENT' : 'EXPENSE';
        const filtered = allTransactions.filter(t => t.type === mappedType);

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--faint); padding:30px 0;">No entries yet.</td></tr>`;
            return;
        }

        filtered
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(t => {
                let amtClass = "amt red";
                if (t.type === 'INCOME') amtClass = "amt green";
                if (t.type === 'INVESTMENT') amtClass = "amt blue";

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${t.description || '—'}</td>
                    <td><span class="pill">${t.category}</span></td>
                    <td style="color:var(--muted)">${t.date}</td>
                    <td class="${amtClass}">₹${t.amount.toFixed(2)}</td>
                    <td style="text-align:right;">
                        <button onclick="deleteRow(${t.id})" class="row-action"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
    }
}

// ─────────────────────────────────────────────
//  FORM SUBMIT / ACTIONS
// ─────────────────────────────────────────────
async function handleFormSubmit(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    if (currentTab === 'lending') {
        const personName = document.getElementById('personName').value;
        await fetch('/api/lending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ personName, amount, dateLent: date })
        });
        document.getElementById('personName').value = '';
    } else {
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const type = currentTab === 'income' ? 'INCOME' : currentTab === 'investments' ? 'INVESTMENT' : 'EXPENSE';

        await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, category, amount, date, description })
        });
        document.getElementById('description').value = '';
    }

    document.getElementById('amount').value = '';
    refreshData();
}

async function tallyLoan(id) {
    if (!id) {
        console.error('tallyLoan called with invalid id:', id);
        alert('Could not tally this loan — its ID is missing. Check the console for details.');
        return;
    }
    try {
        const res = await fetch(`/api/lending/${id}/tally`, { method: 'PUT' });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            console.error(`Tally failed: ${res.status} ${res.statusText}`, text);
            alert(`Could not tally this loan (server responded ${res.status}). Check the console for details.`);
            return;
        }
        await refreshData();
    } catch (err) {
        console.error('Tally request failed:', err);
        alert('Could not reach the server to tally this loan. Is the backend running?');
    }
}

async function deleteRow(id) {
    if (confirm("Permanently delete this entry?")) {
        await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
        refreshData();
    }
}

// ─────────────────────────────────────────────
//  CHARTS
// ─────────────────────────────────────────────
function renderCharts() {
    const expData = {}, invData = {};

    allTransactions.forEach(t => {
        if (t.type === 'EXPENSE') expData[t.category] = (expData[t.category] || 0) + t.amount;
        if (t.type === 'INVESTMENT') invData[t.category] = (invData[t.category] || 0) + t.amount;
    });

    if (expenseChartInstance) expenseChartInstance.destroy();
    if (investmentChartInstance) investmentChartInstance.destroy();
    if (comparisonChartInstance) comparisonChartInstance.destroy();

    // Chart colours — Ink Wash palette
    // Change CHART_PALETTE values to retheme all chart slices at once
    const CHART_PALETTE = ['#3A7D6E','#2E6B45','#2A5A8B','#7A6A30','#A03030','#6A9A82','#5A8A65','#1F3A32'];
    const CHART_TEXT  = '#6A9A82';  /* --muted mid jade        */
    const CHART_GRID  = '#C8D9CC';  /* --border-soft jade      */

    Chart.defaults.color = CHART_TEXT;
    Chart.defaults.font.family = "'Inter', sans-serif";

    const doughnutOpts = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: { boxWidth: 10, font: { size: 11 }, color: CHART_TEXT, padding: 14 }
            }
        },
        cutout: '65%',
    };

    const expenseEl = document.getElementById('expenseChart');
    if (expenseEl) {
        expenseChartInstance = new Chart(expenseEl, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expData),
                datasets: [{ data: Object.values(expData), backgroundColor: CHART_PALETTE, borderWidth: 0 }]
            },
            options: doughnutOpts
        });
    }

    const invEl = document.getElementById('investmentChart');
    if (invEl) {
        investmentChartInstance = new Chart(invEl, {
            type: 'doughnut',
            data: {
                labels: Object.keys(invData),
                datasets: [{ data: Object.values(invData), backgroundColor: CHART_PALETTE.slice(1), borderWidth: 0 }]
            },
            options: doughnutOpts
        });
    }

    // Month comparator
    const filterSelect = document.getElementById('compare-month-select');
    const selectedMonth = filterSelect ? filterSelect.value : null;

    let selectedMonthIncome = 0, selectedMonthExpense = 0, selectedMonthInvest = 0;
    const monthlyAggregates = {};

    allTransactions.forEach(t => {
        if (!t.date) return;
        const ym = t.date.slice(0, 7);
        if (!monthlyAggregates[ym]) monthlyAggregates[ym] = { inc: 0, exp: 0, inv: 0 };

        if (t.type === 'INCOME') monthlyAggregates[ym].inc += t.amount;
        if (t.type === 'EXPENSE') monthlyAggregates[ym].exp += t.amount;
        if (t.type === 'INVESTMENT') monthlyAggregates[ym].inv += t.amount;

        if (ym === selectedMonth) {
            if (t.type === 'INCOME') selectedMonthIncome += t.amount;
            if (t.type === 'EXPENSE') selectedMonthExpense += t.amount;
            if (t.type === 'INVESTMENT') selectedMonthInvest += t.amount;
        }
    });

    const totalMonthsCount = Object.keys(monthlyAggregates).length || 1;
    let avgIncomeSum = 0, avgOutflowSum = 0;

    Object.values(monthlyAggregates).forEach(m => {
        avgIncomeSum += m.inc;
        avgOutflowSum += (m.exp + m.inv);
    });

    const averageIncome = avgIncomeSum / totalMonthsCount;
    const averageOutflow = avgOutflowSum / totalMonthsCount;

    const compEl = document.getElementById('comparisonChart');
    if (compEl) {
        comparisonChartInstance = new Chart(compEl, {
            type: 'bar',
            data: {
                labels: ['Inflows', 'Outflows'],
                datasets: [
                    {
                        label: 'Selected month (₹)',
                        data: [selectedMonthIncome, (selectedMonthExpense + selectedMonthInvest)],
                        backgroundColor: '#3A7D6E',   /* --accent deep teal      */
                        borderRadius: 8
                    },
                    {
                        label: 'All-time average (₹)',
                        data: [averageIncome, averageOutflow],
                        backgroundColor: '#D4E4DA',   /* --panel-raised sage     */
                        borderColor: '#C8D9CC',        /* --border jade       */
                        borderWidth: 1,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: CHART_TEXT, font: { size: 11 } } }
                },
                scales: {
                    y: { grid: { color: CHART_GRID }, ticks: { color: CHART_TEXT }, beginAtZero: true },
                    x: { grid: { display: false }, ticks: { color: CHART_TEXT } }
                }
            }
        });
    }
}
