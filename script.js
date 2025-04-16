import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCL-y1VserUCDqL3plKcXwDe0E7-_dH43o",
  authDomain: "sw-customer-tracker.firebaseapp.com",
  projectId: "sw-customer-tracker",
  storageBucket: "sw-customer-tracker.appspot.com",
  messagingSenderId: "665099220770",
  appId: "1:665099220770:web:e8d7a04cce7e2a2d65d77b",
  measurementId: "G-KJDNWXT8EC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const profitForm = document.getElementById("profit-form");
const profitBody = document.getElementById("profitBody");
const profitChartCanvas = document.getElementById("profitChart");
const toast = document.getElementById("toast");

let profitData = JSON.parse(localStorage.getItem("profitData")) || [];

let chart;

function showToast(message, success = true) {
  toast.textContent = message;
  toast.className = `toast ${success ? "bg-green-600" : "bg-red-600"}`;
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

function renderProfitTable(data) {
  profitBody.innerHTML = "";
  data.forEach((item, index) => {
    const { profit, margin } = calculateProfit(item);
    profitBody.innerHTML += `
      <tr>
        <td class="p-2">${item.jobNo}</td>
        <td class="p-2">${item.customer}</td>
        <td class="p-2">${item.shipment}</td>
        <td class="p-2">${item.charge}</td>
        <td class="p-2">${item.actualCost}</td>
        <td class="p-2">${profit}</td>
        <td class="p-2">${margin}%</td>
        <td class="p-2">${item.status}</td>
        <td class="p-2">
          <button onclick="deleteRecord(${index})" class="text-red-600">Delete</button>
        </td>
      </tr>
    `;
  });
}

function renderChart() {
  const customerProfits = {};
  profitData.forEach((item) => {
    const profit = item.charge - item.actualCost;
    customerProfits[item.customer] = (customerProfits[item.customer] || 0) + profit;
  });

  const labels = Object.keys(customerProfits);
  const data = Object.values(customerProfits);

  if (chart) chart.destroy();
  chart = new Chart(profitChartCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Profit",
        data,
        backgroundColor: "#3b82f6"
      }]
    }
  });
}

window.deleteRecord = function (index) {
  profitData.splice(index, 1);
  saveData();
  renderProfitTable(profitData);
  renderChart();
  showToast("Record deleted");
};

profitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newItem = {
    jobNo: profitForm.jobNo.value,
    customer: profitForm.customer.value,
    shipment: profitForm.shipment.value,
    charge: parseFloat(profitForm.charge.value),
    actualCost: parseFloat(profitForm.actualCost.value),
    status: profitForm.status.value,
  };
  profitData.push(newItem);
  saveData();
  profitForm.reset();
  renderProfitTable(profitData);
  renderChart();
  showToast("Record added");
});

window.exportToExcel = function () {
  const ws = XLSX.utils.json_to_sheet(profitData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Profits");
  XLSX.writeFile(wb, "Profit_Report.xlsx");
};

window.toggleDarkMode = function () {
  document.body.classList.toggle("dark");
};

window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => showDashboard())
    .catch((err) => showToast(err.message, false));
};

window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => showDashboard())
    .catch((err) => showToast(err.message, false));
};

window.logout = function () {
  signOut(auth).then(() => {
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("auth-section").classList.remove("hidden");
    showToast("Logged out");
  });
};

function showDashboard() {
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("auth-section").classList.add("hidden");
  renderProfitTable(profitData);
  renderChart();
}
