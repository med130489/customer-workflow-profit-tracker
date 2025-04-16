let profitData = JSON.parse(localStorage.getItem("profitData")) || [];
let editIndex = -1;
const profitForm = document.getElementById("profit-form");
const profitBody = document.getElementById("profitBody");
const toast = document.getElementById("toast");
const chartCtx = document.getElementById("profitChart").getContext("2d");

function showToast(message, success = true) {
  toast.textContent = message;
  toast.className = `toast ${success ? "bg-green-600" : "bg-red-600"} text-white px-4 py-2 rounded`;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

function saveData() {
  localStorage.setItem("profitData", JSON.stringify(profitData));
}

function calculateProfit(item) {
  const profit = item.charge - item.actualCost;
  const margin = item.charge ? ((profit / item.charge) * 100).toFixed(2) : 0;
  return { profit, margin };
}

function renderTable() {
  profitBody.innerHTML = "";
  profitData.forEach((item, index) => {
    const { profit, margin } = calculateProfit(item);
    profitBody.innerHTML += `
      <tr>
        <td>${item.jobNo}</td>
        <td>${item.customer}</td>
        <td>${item.shipment}</td>
        <td>${item.charge}</td>
        <td>${item.actualCost}</td>
        <td>${profit}</td>
        <td>${margin}%</td>
        <td>${item.status}</td>
        <td>
          <button onclick="editRecord(${index})">Edit</button>
          <button onclick="deleteRecord(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function renderChart() {
  const labels = profitData.map(i => i.customer);
  const profits = profitData.map(i => calculateProfit(i).profit);
  new Chart(chartCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Profit",
        data: profits,
        backgroundColor: "navy"
      }]
    }
  });
}

profitForm.addEventListener("submit", e => {
  e.preventDefault();
  const item = {
    jobNo: document.getElementById("jobNo").value,
    customer: document.getElementById("customer").value,
    shipment: document.getElementById("shipment").value,
    charge: +document.getElementById("charge").value,
    actualCost: +document.getElementById("actualCost").value,
    status: document.getElementById("status").value
  };
  if (editIndex > -1) {
    profitData[editIndex] = item;
    editIndex = -1;
    showToast("Record updated!");
  } else {
    profitData.push(item);
    showToast("Record added!");
  }
  profitForm.reset();
  saveData();
  renderTable();
  renderChart();
});

function editRecord(index) {
  const item = profitData[index];
  document.getElementById("jobNo").value = item.jobNo;
  document.getElementById("customer").value = item.customer;
  document.getElementById("shipment").value = item.shipment;
  document.getElementById("charge").value = item.charge;
  document.getElementById("actualCost").value = item.actualCost;
  document.getElementById("status").value = item.status;
  editIndex = index;
}

function deleteRecord(index) {
  profitData.splice(index, 1);
  saveData();
  renderTable();
  renderChart();
  showToast("Record deleted!");
}

function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(profitData.map(i => {
    const p = calculateProfit(i);
    return { ...i, Profit: p.profit, Margin: p.margin + "%" };
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Profits");
  XLSX.writeFile(wb, "ProfitData.xlsx");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  if (!email || !password) {
    showToast("Enter both fields", false);
    return;
  }
  localStorage.setItem("loggedIn", "true");
  showDashboard();
  showToast("Login successful!");
}

function signup() {
  login(); // Simulate same as login
}

function logout() {
  localStorage.removeItem("loggedIn");
  location.reload();
}

function showDashboard() {
  document.getElementById("auth-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");
  renderTable();
  renderChart();
}

// Auto login
if (localStorage.getItem("loggedIn") === "true") {
  showDashboard();
}
