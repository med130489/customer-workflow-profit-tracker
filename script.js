import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCL-y1VserUCDqL3plKcXwDe0E7-_dH43o",
  authDomain: "sw-customer-tracker.firebaseapp.com",
  projectId: "sw-customer-tracker",
  storageBucket: "sw-customer-tracker.appspot.com",
  messagingSenderId: "665099220770",
  appId: "1:665099220770:web:e8d7a04cce7e2a2d65d77b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showToast("Signup successful!", true);
    window.location.href = "dashboard.html";
  } catch (error) {
    showToast(error.message, false);
  }
};

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Login successful!", true);
    window.location.href = "dashboard.html";
  } catch (error) {
    showToast(error.message, false);
  }
};

window.logout = function () {
  signOut(auth).then(() => {
    showToast("Logged out!", true);
    window.location.href = "index.html";
  });
};

const toast = document.getElementById("toast");
function showToast(message, success = true) {
  if (!toast) return;
  toast.textContent = message;
  toast.className = \`toast \${success ? "bg-green-600" : "bg-red-600"}\`;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// Dashboard logic
const profitForm = document.getElementById("profit-form");
const profitBody = document.getElementById("profitBody");
const profitChartCtx = document.getElementById("profitChart")?.getContext("2d");
let profitData = JSON.parse(localStorage.getItem("profitData") || "[]");

if (profitForm) {
  profitForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const item = {
      jobNo: document.getElementById("jobNo").value,
      customer: document.getElementById("customer").value,
      shipment: document.getElementById("shipment").value,
      charge: parseFloat(document.getElementById("charge").value),
      actualCost: parseFloat(document.getElementById("actualCost").value),
      status: document.getElementById("status").value,
    };
    const { profit, margin } = calculateProfit(item);
    item.profit = profit;
    item.margin = margin;
    profitData.push(item);
    saveData();
    renderProfitTable();
    updateChart();
    profitForm.reset();
    showToast("Record added!", true);
  });
}

function calculateProfit(item) {
  const profit = item.charge - item.actualCost;
  const margin = item.charge ? ((profit / item.charge) * 100).toFixed(2) : 0;
  return { profit, margin };
}

function saveData() {
  localStorage.setItem("profitData", JSON.stringify(profitData));
}

function renderProfitTable() {
  if (!profitBody) return;
  profitBody.innerHTML = "";
  profitData.forEach((item, index) => {
    profitBody.innerHTML += \`
      <tr class="border-b">
        <td class="p-2">\${item.jobNo}</td>
        <td class="p-2">\${item.customer}</td>
        <td class="p-2">\${item.shipment}</td>
        <td class="p-2">\${item.charge}</td>
        <td class="p-2">\${item.actualCost}</td>
        <td class="p-2">\${item.profit}</td>
        <td class="p-2">\${item.margin}</td>
        <td class="p-2">\${item.status}</td>
        <td class="p-2"><button onclick="deleteRecord(\${index})" class="text-red-500">Delete</button></td>
      </tr>\`;
  });
}

window.deleteRecord = function (index) {
  profitData.splice(index, 1);
  saveData();
  renderProfitTable();
  updateChart();
};

function updateChart() {
  if (!profitChartCtx) return;
  const customers = profitData.map(d => d.customer);
  const profits = profitData.map(d => d.profit);
  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(profitChartCtx, {
    type: "bar",
    data: {
      labels: customers,
      datasets: [{
        label: "Profit",
        data: profits,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

window.exportToExcel = function () {
  const ws = XLSX.utils.json_to_sheet(profitData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Profits");
  XLSX.writeFile(wb, "profit_data.xlsx");
};

onAuthStateChanged(auth, (user) => {
  if (!user && window.location.pathname.includes("dashboard")) {
    window.location.href = "index.html";
  }
});

renderProfitTable();
updateChart();
