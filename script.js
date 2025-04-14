let profitData = JSON.parse(localStorage.getItem("profitData")) || [];

const profitBody = document.getElementById("profitBody");
const searchInput = document.getElementById("searchInput");

let filteredData = [...profitData];

function renderProfitTable(data) {
  profitBody.innerHTML = "";
  data.forEach((item, index) => {
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
        <td class="p-2 space-x-2">
          <button onclick="editRecord(\${index})" class="text-blue-600">Edit</button>
          <button onclick="deleteRecord(\${index})" class="text-red-600">Delete</button>
        </td>
      </tr>\`;
  });
}

function saveToLocalStorage() {
  localStorage.setItem("profitData", JSON.stringify(profitData));
}

function deleteRecord(index) {
  if (confirm("Delete this record?")) {
    profitData.splice(index, 1);
    saveToLocalStorage();
    renderProfitTable(profitData);
    renderCharts();
  }
}

function editRecord(index) {
  const updated = prompt("Enter new charge and actual cost (comma separated)", 
    \`\${profitData[index].charge},\${profitData[index].actualCost}\`);
  if (updated) {
    const [charge, actualCost] = updated.split(",").map(Number);
    profitData[index].charge = charge;
    profitData[index].actualCost = actualCost;
    profitData[index].profit = charge - actualCost;
    profitData[index].margin = ((profitData[index].profit / charge) * 100).toFixed(1);
    profitData[index].status = profitData[index].profit >= 0 ? "Profitable" : "Loss";
    saveToLocalStorage();
    renderProfitTable(profitData);
    renderCharts();
  }
}

searchInput.addEventListener("input", () => {
  const val = searchInput.value.toLowerCase();
  filteredData = profitData.filter(d =>
    d.customer.toLowerCase().includes(val) || d.jobNo.toLowerCase().includes(val)
  );
  renderProfitTable(filteredData);
});

document.getElementById("newRecordForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const jobNo = document.getElementById("newJobNo").value.trim();
  const customer = document.getElementById("newCustomer").value.trim();
  const shipment = document.getElementById("newShipment").value;
  const estimatedCost = parseFloat(document.getElementById("newEstimatedCost").value);
  const actualCost = parseFloat(document.getElementById("newActualCost").value);
  const charge = parseFloat(document.getElementById("newCharge").value);

  const profit = charge - actualCost;
  const margin = ((profit / charge) * 100).toFixed(1);
  const status = profit >= 0 ? "Profitable" : "Loss";

  profitData.push({ jobNo, customer, shipment, estimatedCost, actualCost, charge, profit, margin, status });

  saveToLocalStorage();
  filteredData = [...profitData];
  renderProfitTable(filteredData);
  renderCharts();

  this.reset();
});

function renderCharts() {
  renderProfitTrendChart(filteredData);
  renderTopCustomersChart(filteredData);
}

let profitChart, topCustomersChart;

function renderProfitTrendChart(data) {
  const labels = data.map(d => d.jobNo);
  const profits = data.map(d => d.profit);
  if (profitChart) profitChart.destroy();
  profitChart = new Chart(document.getElementById("profitTrendChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "Profit", data: profits, borderColor: "#10B981", fill: false }]
    },
    options: { responsive: true }
  });
}

function renderTopCustomersChart(data) {
  const customerMap = {};
  data.forEach(d => {
    customerMap[d.customer] = (customerMap[d.customer] || 0) + d.profit;
  });
  const labels = Object.keys(customerMap);
  const profits = Object.values(customerMap);
  if (topCustomersChart) topCustomersChart.destroy();
  topCustomersChart = new Chart(document.getElementById("topCustomersChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Total Profit", data: profits, backgroundColor: "#3B82F6" }]
    },
    options: { responsive: true }
  });
}

const tabs = document.querySelectorAll(".tab");
const tabButtons = document.querySelectorAll(".tab-btn");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");
    tabs.forEach(tab => tab.classList.add("hidden"));
    document.getElementById(\`tab-\${target}\`).classList.remove("hidden");
    tabButtons.forEach(b => b.classList.remove("underline"));
    btn.classList.add("underline");
  });
});

document.getElementById("tab-profit").classList.remove("hidden");

renderProfitTable(filteredData);
renderCharts();
