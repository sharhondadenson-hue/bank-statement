let transactions = [];
const bankLogoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDAgNzkuYTE1NjYwYiwgMjAyMi8wOC8xNy0xMTo0MDoyMSAgICAgICAgIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIvPgogIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9InciPz5069sOAAAAX0lEQVRYhe3XMQ6AIBAEwPn/p9XChmAsuI0m9pYmFmY3pIQQQgghf8p69Sbe9pndm9u7O66v6vO6eL0Oru/s4p67u7vT3T19fT3u7+L6rq7v7Pquru/s+q6u7+z6rq7v7LoB66Yp9XpC+Q8AAAAASUVORK5CYII=";

window.onload = () => { loadFromLocal(); setupRealTimeValidation(); };

function setupRealTimeValidation() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => { input.classList.remove('error-border'); saveToLocal(); });
    });
}

function updateBalanceDisplay() {
    const startBal = parseFloat(document.getElementById('balance').value) || 0;
    const totalTransactions = transactions.reduce((acc, curr) => acc + parseFloat(curr[2].replace('$', '')), 0);
    const finalBal = startBal + totalTransactions;
    document.getElementById('liveBalance').innerText = `Closing Balance: $${finalBal.toFixed(2)}`;
    return finalBal;
}

function addTransaction() {
    const date = document.getElementById('transDate').value;
    const desc = document.getElementById('transDesc').value;
    const amount = document.getElementById('transAmount').value;
    if (!date || !desc || !amount) return alert("Please fill in transaction details.");
    
    transactions.push([date, desc, `$${parseFloat(amount).toFixed(2)}`]);
    renderTable();
    updateBalanceDisplay();
    saveToLocal();
    document.getElementById('transDesc').value = '';
    document.getElementById('transAmount').value = '';
}

function renderTable() {
    const tbody = document.querySelector("#transTable tbody");
    tbody.innerHTML = "";
    transactions.forEach(item => {
        const row = tbody.insertRow();
        row.innerHTML = `<td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td>`;
    });
}

function filterTransactions() {
    const filter = document.getElementById('searchTerm').value.toLowerCase();
    const rows = document.querySelectorAll("#transTable tbody tr");
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
    });
}

function validateInputs() {
    let valid = true;
    ['accName', 'balance', 'stmtDate'].forEach(id => {
        const el = document.getElementById(id);
        if (!el.value) { el.classList.add('error-border'); valid = false; }
    });
    if (transactions.length === 0) { alert("Add at least one transaction."); valid = false; }
    return valid;
}

function generatePDF() {
    if (!validateInputs()) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const name = document.getElementById('accName').value;
    const startBal = parseFloat(document.getElementById('balance').value);
    const date = document.getElementById('stmtDate').value;

    doc.addImage(bankLogoBase64, 'PNG', 14, 10, 15, 15);
    doc.setFontSize(20).text("BANK STATEMENT", 196, 20, { align: 'right' });
    doc.setFontSize(10).text(`Account: ${name}\nDate: ${date}\nStarting Balance: $${startBal.toFixed(2)}`, 14, 35);
    
    doc.autoTable({
        startY: 55,
        head: [['Date', 'Description', 'Amount']],
        body: transactions,
        theme: 'grid',
        headStyles: { fillColor: [26, 42, 108] }
    });
    doc.save(`${name}_Statement.pdf`);
}

function downloadCSV() {
    let csv = "Date,Description,Amount\n";
    transactions.forEach(t => csv += `"${t[0]}","${t[1]}","${t[2].replace('$', '')}"\n`);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Statement.csv'; a.click();
}

function printStatement() { if (validateInputs()) window.print(); }

function saveToLocal() {
    const data = { accName: document.getElementById('accName').value, balance: document.getElementById('balance').value, stmtDate: document.getElementById('stmtDate').value, transactions };
    localStorage.setItem('bankStmtData', JSON.stringify(data));
}

function loadFromLocal() {
    const saved = JSON.parse(localStorage.getItem('bankStmtData'));
    if (saved) {
        document.getElementById('accName').value = saved.accName || "";
        document.getElementById('balance').value = saved.balance || "";
        document.getElementById('stmtDate').value = saved.stmtDate || "";
        transactions = saved.transactions || [];
        renderTable();
        updateBalanceDisplay();
    }
}

function clearForm() {
    if (confirm("Clear all data?")) {
        localStorage.removeItem('bankStmtData');
        location.reload();
    }
}
