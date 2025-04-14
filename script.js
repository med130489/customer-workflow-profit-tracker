let profitData = JSON.parse(localStorage.getItem("profitData")) || [];
let editingIndex = null;

const jobNoInput = document.getElementById("jobNo");
const customerInput = document.getElementById("customer");
const shipmentInput = document.getElementById("shipment");
const chargeInput = document.getElementById("charge");
const actualCostInput = document.getElementById("actualCost");
const statusInput = document.getElementById("status");

const profitBody = document.getElementById("profitBody");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");
const profitChart = document.getElementById("profitChart");

document.getElementById("addRecordBtn").addEventListener("click", () => {
  const jobNo = jobNoInput.value.trim();
  const customer = customerInput.value.trim();
  const shipment = shipmentInput.value.trim();
  const charge = parseFloat(chargeInput.value);
  const actualCost = parseFloat(actualCostInput.value);
  const status = statusInput.value.trim();
  const profit = charge - actualCost;
  const margin = charge > 0 ? ((profit / charge) * 100).toFixed(2) + "%" : "0%";

  if (!jobNo || !customer || isNaN(charge) || isNaN(actualCost)) {
    alert("Please fill in all fields correctly.");
    return;
  }

  const newRecord = { jobNo, customer, shipment, charge, actualCost, profit, margin, status };

  if (editingIndex !== null) {
    profitData[editingIndex] = newRecord;
    editingIndex = null;
  } else {
    profitData.push(newRecord);
  }

  localStorage.setItem("profitData", JSON.stringify(profitData));
  resetForm();
  renderProfitTable(profitData);
  updateChart(profitData);
  updateSummary(profitData);
});

function renderProfitTable(data) {
  profitBody.innerHTML = "";
  data.forEach((item, index) => {
    profitBody.innerHTML += `
      <tr class="border-b">
        <td class="p-2">${item.jobNo}</td>
        <td class="p-2">${item.customer}</td>
        <td class="p-2">${item.shipment}</td>
        <td class="p-2">${item.charge}</td>
        <td class="p-2">${item.actualCost}</td>
        <td class="p-2">${item.profit}</td>
        <td class="p-2">${item.margin}</td>
        <td class="p-2">${item.status}</td>
        <td class="p-2 space-x-2">
          <button onclick="editRecord(${index})" class="text-blue-600">Edit</button>
          <button onclick="deleteRecord(${index})" class="text-red-600">Delete</button>
        </td>
      </tr>`;
  });
}

function editRecord(index) {
  const item = profitData[index];
  jobNoInput.value = item.jobNo;
  customerInput.value = item.customer;
  shipmentInput.value = item.shipment;
  chargeInput.value = item.charge;
  actualCostInput.value = item.actualCost;
  statusInput.value = item.status;
  editingIndex = index;
}

function deleteRecord(index) {
  if (confirm("Delete this record?")) {
    profitData.splice(index, 1);
    localStorage.setItem("profitData", JSON.stringify(profitData));
    renderProfitTable(profitData);
    updateChart(profitData);
    updateSummary(profitData);
  }
}

function resetForm() {
  jobNoInput.value = "";
  customerInput.value = "";
  shipmentInput.value = "";
  chargeInput.value = "";
  actualCostInput.value = "";
  statusInput.value = "";
}

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = profitData.filter(item =>
    Object.values(item).some(value => String(value).toLowerCase().includes(term))
  );
  renderProfitTable(filtered);
  updateChart(filtered);
  updateSummary(filtered);
});

exportBtn.addEventListener("click", () => {
  const ws = XLSX.utils.json_to_sheet(profitData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Profit");
  XLSX.writeFile(wb, "profit-report.xlsx");
});

let chartInstance = null;

function updateChart(data) {
  const labels = data.map(d => d.jobNo + " (" + d.customer + ")");
  const profits = data.map(d => d.profit);

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(profitChart, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Profit by Job/Customer',
        data: profits,
        backgroundColor: '#1d4ed8'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function updateSummary(data) {
  document.getElementById("totalJobs").textContent = data.length;
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  document.getElementById("totalProfit").textContent = totalProfit.toFixed(2);
  const avgMargin = data.length ? (data.reduce((sum, item) => sum + parseFloat(item.margin), 0) / data.length).toFixed(2) : 0;
  document.getElementById("avgMargin").textContent = avgMargin + "%";
}

// Initial render
renderProfitTable(profitData);
updateChart(profitData);
updateSummary(profitData);
