/* =====================================
   MONEY TRACKER JAVASCRIPT
===================================== */


/* =====================================
   DATA
===================================== */

let transactions =
    JSON.parse(
        localStorage.getItem("moneyTrackerData")
    ) || [];

let currentType = "expense";

let editingId = null;


/* =====================================
   DOM ELEMENTS
===================================== */

const modal =
    document.getElementById("modal");

const form =
    document.getElementById("transactionForm");

const amountInput =
    document.getElementById("amount");

const descriptionInput =
    document.getElementById("description");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("transactionDate");

const transactionsContainer =
    document.getElementById("transactions");

const filterType =
    document.getElementById("filterType");

const searchInput =
    document.getElementById("searchTransaction");

const rangeFrom =
    document.getElementById("rangeFrom");

const rangeTo =
    document.getElementById("rangeTo");


/* =====================================
   INITIALIZATION
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setTodayDate();

        setDefaultDates();

        renderAll();

    }
);


/* =====================================
   SAVE DATA
===================================== */

function saveData() {

    localStorage.setItem(
        "moneyTrackerData",
        JSON.stringify(transactions)
    );
}


/* =====================================
   FORMAT MONEY
===================================== */

function formatMoney(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(amount);
}


/* =====================================
   DATE
===================================== */

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function setTodayDate() {

    const today = new Date();

    document.getElementById(
        "todayDate"
    ).textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
}


function setDefaultDates() {

    const today = getToday();

    dateInput.value = today;

    rangeFrom.value = today;

    rangeTo.value = today;
}


/* =====================================
   MODAL
===================================== */

function openModal(type = "expense") {

    editingId = null;

    form.reset();

    currentType = type;

    dateInput.value = getToday();

    document.getElementById(
        "modalTitle"
    ).textContent =
        type === "income"
            ? "Add Money"
            : "Add Expense";

    updateTypeButtons();

    modal.classList.add("active");

    setTimeout(
        () => amountInput.focus(),
        100
    );
}


function closeModal() {

    modal.classList.remove("active");

    editingId = null;

    form.reset();

    dateInput.value = getToday();
}


function setTransactionType(type) {

    currentType = type;

    updateTypeButtons();

    document.getElementById(
        "modalTitle"
    ).textContent =
        type === "income"
            ? "Add Money"
            : "Add Expense";
}


function updateTypeButtons() {

    const expenseBtn =
        document.getElementById(
            "expenseTypeBtn"
        );

    const incomeBtn =
        document.getElementById(
            "incomeTypeBtn"
        );

    expenseBtn.classList.remove("active");

    incomeBtn.classList.remove("active");

    if (currentType === "expense") {

        expenseBtn.classList.add("active");

    } else {

        incomeBtn.classList.add("active");
    }
}


/* =====================================
   ADD / EDIT TRANSACTION
===================================== */

form.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const amount =
            Number(
                amountInput.value
            );

        const description =
            descriptionInput.value.trim();

        const category =
            categoryInput.value;

        const date =
            dateInput.value;


        if (
            !amount ||
            amount <= 0 ||
            !description ||
            !date
        ) {

            alert(
                "Please enter valid transaction details."
            );

            return;
        }


        if (editingId) {

            const index =
                transactions.findIndex(
                    item =>
                        item.id === editingId
                );

            if (index !== -1) {

                transactions[index] = {

                    ...transactions[index],

                    type: currentType,

                    amount: amount,

                    description: description,

                    category: category,

                    date: date

                };
            }

        } else {

            const transaction = {

                id:
                    Date.now(),

                type:
                    currentType,

                amount:
                    amount,

                description:
                    description,

                category:
                    category,

                date:
                    date,

                createdAt:
                    new Date().toISOString()

            };

            transactions.push(
                transaction
            );
        }


        saveData();

        closeModal();

        renderAll();

    }
);


/* =====================================
   TOTAL CALCULATION
===================================== */

function calculateTotals(
    list = transactions
) {

    let income = 0;

    let expense = 0;

    list.forEach(
        transaction => {

            if (
                transaction.type ===
                "income"
            ) {

                income +=
                    Number(
                        transaction.amount
                    );

            } else {

                expense +=
                    Number(
                        transaction.amount
                    );
            }
        }
    );

    return {

        income,

        expense,

        balance:
            income - expense

    };
}


/* =====================================
   MAIN DASHBOARD
===================================== */

function renderDashboard() {

    const totals =
        calculateTotals();


    document.getElementById(
        "balance"
    ).textContent =
        formatMoney(
            totals.balance
        );


    document.getElementById(
        "totalIncome"
    ).textContent =
        formatMoney(
            totals.income
        );


    document.getElementById(
        "totalExpense"
    ).textContent =
        formatMoney(
            totals.expense
        );


    document.getElementById(
        "transactionCount"
    ).textContent =
        transactions.length;


    calculatePeriods();

    calculateDateRange();
}


/* =====================================
   DAILY / WEEKLY / MONTHLY
===================================== */

function calculatePeriods() {

    const today =
        new Date();

    const todayString =
        getToday();


    /* ---------- TODAY ---------- */

    const todayTransactions =
        transactions.filter(
            transaction =>
                transaction.date ===
                todayString
        );

    const todayTotals =
        calculateTotals(
            todayTransactions
        );


    document.getElementById(
        "todayTotal"
    ).textContent =
        formatMoney(
            todayTotals.balance
        );


    /* ---------- WEEK ---------- */

    const day =
        today.getDay();

    const monday =
        new Date(today);

    const diff =
        day === 0
            ? 6
            : day - 1;

    monday.setDate(
        today.getDate() - diff
    );

    monday.setHours(
        0, 0, 0, 0
    );


    const sunday =
        new Date(monday);

    sunday.setDate(
        monday.getDate() + 6
    );

    const weekTransactions =
        transactions.filter(
            transaction => {

                const transactionDate =
                    parseDate(
                        transaction.date
                    );

                return (
                    transactionDate >= monday &&
                    transactionDate <= sunday
                );

            }
        );


    const weekTotals =
        calculateTotals(
            weekTransactions
        );


    document.getElementById(
        "weekTotal"
    ).textContent =
        formatMoney(
            weekTotals.balance
        );


    /* ---------- MONTH ---------- */

    const year =
        today.getFullYear();

    const month =
        today.getMonth();


    const monthTransactions =
        transactions.filter(
            transaction => {

                const d =
                    parseDate(
                        transaction.date
                    );

                return (
                    d.getFullYear() === year &&
                    d.getMonth() === month
                );

            }
        );


    const monthTotals =
        calculateTotals(
            monthTransactions
        );


    document.getElementById(
        "monthTotal"
    ).textContent =
        formatMoney(
            monthTotals.balance
        );
}


/* =====================================
   DATE RANGE
===================================== */

rangeFrom.addEventListener(
    "change",
    calculateDateRange
);

rangeTo.addEventListener(
    "change",
    calculateDateRange
);


function calculateDateRange() {

    if (
        !rangeFrom.value ||
        !rangeTo.value
    ) {

        return;
    }


    const from =
        parseDate(
            rangeFrom.value
        );

    const to =
        parseDate(
            rangeTo.value
        );


    if (from > to) {

        document.getElementById(
            "rangeIncome"
        ).textContent = "Invalid";

        document.getElementById(
            "rangeExpense"
        ).textContent = "Range";

        document.getElementById(
            "rangeBalance"
        ).textContent = "❌";

        return;
    }


    const filtered =
        transactions.filter(
            transaction => {

                const d =
                    parseDate(
                        transaction.date
                    );

                return (
                    d >= from &&
                    d <= to
                );
            }
        );


    const totals =
        calculateTotals(
            filtered
        );


    document.getElementById(
        "rangeIncome"
    ).textContent =
        formatMoney(
            totals.income
        );


    document.getElementById(
        "rangeExpense"
    ).textContent =
        formatMoney(
            totals.expense
        );


    document.getElementById(
        "rangeBalance"
    ).textContent =
        formatMoney(
            totals.balance
        );
}


/* =====================================
   DATE PARSER
===================================== */

function parseDate(dateString) {

    const parts =
        dateString.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}


/* =====================================
   TRANSACTION LIST
===================================== */

function renderTransactions() {

    let filtered =
        [...transactions];


    /* ---------- TYPE FILTER ---------- */

    const type =
        filterType.value;

    if (type !== "all") {

        filtered =
            filtered.filter(
                transaction =>
                    transaction.type ===
                    type
            );
    }


    /* ---------- SEARCH ---------- */

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    if (search) {

        filtered =
            filtered.filter(
                transaction =>

                    transaction.description
                        .toLowerCase()
                        .includes(search)

                    ||

                    transaction.category
                        .toLowerCase()
                        .includes(search)
            );
    }


    /* ---------- SORT ---------- */

    filtered.sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.date
                ).getTime();

            const dateB =
                new Date(
                    b.date
                ).getTime();

            if (
                dateA !== dateB
            ) {

                return dateB - dateA;
            }

            return (
                b.id - a.id
            );
        }
    );


    /* ---------- EMPTY ---------- */

    if (
        filtered.length === 0
    ) {

        transactionsContainer.innerHTML = `

            <div class="empty">

                <div style="font-size:40px">
                    💰
                </div>

                <p>No transactions found</p>

                <small>
                    Add your first income or expense
                </small>

            </div>

        `;

        return;
    }


    /* ---------- RENDER ---------- */

    transactionsContainer.innerHTML =
        filtered.map(
            transaction =>
                createTransactionHTML(
                    transaction
                )
        ).join("");
}


/* =====================================
   TRANSACTION HTML
===================================== */

function createTransactionHTML(
    transaction
) {

    const isIncome =
        transaction.type ===
        "income";


    const icon =
        getCategoryIcon(
            transaction.category
        );


    const amount =
        isIncome
            ? `+ ${formatMoney(transaction.amount)}`
            : `− ${formatMoney(transaction.amount)}`;


    return `

        <div class="transaction">

            <div class="transaction-left">

                <div class="
                    transaction-icon
                    ${isIncome
                        ? "income-icon"
                        : "expense-icon"}
                ">

                    ${icon}

                </div>


                <div class="transaction-info">

                    <strong>
                        ${escapeHTML(
                            transaction.description
                        )}
                    </strong>

                    <small>

                        ${escapeHTML(
                            transaction.category
                        )}
                        •
                        ${formatDate(
                            transaction.date
                        )}

                    </small>

                </div>

            </div>


            <div class="transaction-right">

                <div
                    class="amount ${
                        isIncome
                            ? "income-text"
                            : "expense-text"
                    }"
                >

                    ${amount}

                </div>


                <div class="transaction-actions">

                    <button
                        onclick="editTransaction(${transaction.id})"
                    >
                        Edit
                    </button>

                    <button
                        onclick="deleteTransaction(${transaction.id})"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>

    `;
}


/* =====================================
   CATEGORY ICON
===================================== */

function getCategoryIcon(
    category
) {

    const icons = {

        Food: "🍔",

        Travel: "🚆",

        Shopping: "🛍️",

        Bills: "💡",

        Entertainment: "🎬",

        Health: "💊",

        Salary: "💼",

        Business: "💰",

        Other: "📦"

    };


    return (
        icons[category] ||
        "💰"
    );
}


/* =====================================
   EDIT
===================================== */

function editTransaction(id) {

    const transaction =
        transactions.find(
            item =>
                item.id === id
        );


    if (!transaction) {

        return;
    }


    editingId = id;

    currentType =
        transaction.type;


    amountInput.value =
        transaction.amount;

    descriptionInput.value =
        transaction.description;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;


    document.getElementById(
        "modalTitle"
    ).textContent =
        transaction.type ===
        "income"
            ? "Edit Money"
            : "Edit Expense";


    updateTypeButtons();

    modal.classList.add(
        "active"
    );
}


/* =====================================
   DELETE
===================================== */

function deleteTransaction(id) {

    const transaction =
        transactions.find(
            item =>
                item.id === id
        );


    if (!transaction) {

        return;
    }


    const confirmDelete =
        confirm(
            `Delete "${transaction.description}"?`
        );


    if (!confirmDelete) {

        return;
    }


    transactions =
        transactions.filter(
            item =>
                item.id !== id
        );


    saveData();

    renderAll();
}


/* =====================================
   FILTER EVENTS
===================================== */

filterType.addEventListener(
    "change",
    renderTransactions
);

searchInput.addEventListener(
    "input",
    renderTransactions
);


/* =====================================
   ESCAPE HTML
===================================== */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent = value;

    return div.innerHTML;
}


/* =====================================
   FORMAT DATE
===================================== */

function formatDate(
    dateString
) {

    const date =
        parseDate(
            dateString
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =====================================
   RENDER EVERYTHING
===================================== */

function renderAll() {

    renderDashboard();

    renderTransactions();
}


/* =====================================
   CLOSE MODAL
===================================== */

modal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === modal
        ) {

            closeModal();
        }

    }
);


/* =====================================
   ESC KEY
===================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();
        }

    }
);