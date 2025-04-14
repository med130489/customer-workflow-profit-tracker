// Get DOM elements
const profitForm = document.getElementById('profitForm');
const jobNoInput = document.getElementById('jobNo');
const customerInput = document.getElementById('customer');
const shipmentInput = document.getElementById('shipment');
const chargeInput = document.getElementById('charge');
const actualCostInput = document.getElementById('actualCost');
const statusInput = document.getElementById('status');
const profitBody = document.getElementById('profitBody');
const searchInput = document.getElementById('searchInput');
const profitChartCanvas = document.getElementById('profitChart');

// Initialize an empty array for profit records
let profitData = JSON.parse(localStorage.getItem('profitData')) || [];

// Render the profit table and chart
function renderProfitTable() {
  profitBody.innerHTML = '';
  profitData.forEach((item, index) => {
    const profit = item.charge - item.actualCost;
    const margin = ((profit / item.charge) * 100).toFixed(2);

    profitBody.innerHTML += `
      <tr>
        <td class="p-2 border">${item.jobNo}</td>
        <td class="p-2 border">${item.customer}</td>
        <td class="p-2 border">${item.shipment}</td>
        <td class="p-2 border">${item.charge}</td>
        <td class="p-2 border">${item.actualCost}</td>
        <td class="p-2 border">${profit.toFixed(2)}</td>
        <td class="p-2 border">${margin}%</td>
        <td class="p-2 border">${item.status}</td>
        <td class="p-2 border">
          <button onclick="editRecord(${index})" class="text-blue-600">Edit</button>
          <button onclick="deleteRecord(${index})" class="text-red-600">Delete</button>
        </td>
      </tr>
    `;
  });
  renderProfitChart();
}

// Handle Add/Edit form submission
profitForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const jobNo = jobNoInput.value.trim();
  const customer = customerInput.value.trim();
  const shipment = shipmentInput.value.trim();
  const charge = parseFloat(chargeInput.value.trim());
  const actualCost = parseFloat(actualCostInput.value.trim());
  const status = statusInput.value.trim();

  if (!jobNo || !customer || !charge || !actualCost) {
    alert('Please fill in all required fields.');
    return;
  }

  const newRecord = { jobNo, customer, shipment, charge, actualCost, status };

  // Add to existing data or edit existing record
  const recordIndex = profitData.findIndex((item) => item.jobNo === jobNo);
  if (recordIndex !== -1) {
    profitData[recordIndex] = newRecord;  // Edit record
  } else {
    profitData.push(newRecord);  // Add new record
  }

  localStorage.setItem('profitData', JSON.stringify(profitData));
  clearForm();
  renderProfitTable();
});

// Edit record function
function editRecord(index) {
  const record = profitData[index];
  jobNoInput.value = record.jobNo;
  customerInput.value = record.customer;
  shipmentInput.value = record.shipment;
  chargeInput.value = record.charge;
  actualCostInput.value = record.actualCost;
  statusInput.value = record.status;
}

// Delete record function
function deleteRecord(index) {
  if (confirm('Are you sure you want to delete this record?')) {
    profitData.splice(index, 1);
    localStorage.setItem('profitData', JSON.stringify(profitData));
    renderProfitTable();
  }
}

// Clear the form after submitting
function clearForm() {
  jobNoInput.value = '';
  customerInput.value = '';
  shipmentInput.value = '';
  chargeInput.value = '';
  actualCostInput.value = '';
  statusInput.value = '';
}

// Search functionality
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredData = profitData.filter((item) => 
    item.jobNo.toLowerCase().includes(searchTerm) || 
    item.customer.toLowerCase().includes(searchTerm)
  );
  renderFilteredTable(filteredData);
});

// Render the filtered table based on search
function renderFilteredTable(data) {
  profitBody.innerHTML = '';
  data.forEach((item, index) => {
    const profit = item.charge - item.actualCost;
    const margin = ((profit / item.charge) * 100).toFixed(2);

    profitBody.innerHTML += `
      <tr>
        <td class="p-2 border">${item.jobNo}</td>
        <td class="p-2 border">${item.customer}</td>
        <td class="p-2 border">${item.shipment}</td>
        <td class="p-2 border">${item.charge}</td>
        <td class="p-2 border">${item.actualCost}</td>
        <td class="p-2 border">${profit.toFixed(2)}</td>
        <td class="p-2 border">${margin}%</td>
        <td class="p-2 border">${item.status}</td>
        <td class="p-2 border">
          <button onclick="editRecord(${index})" class="text-blue-600">Edit</button>
          <button onclick="deleteRecord(${index})" class="text-red-600">Delete</button>
        </td>
      </tr>
    `;
  });
  renderProfitChart();
}

// Chart.js to render profit by customer/job
function renderProfitChart() {
  const labels = profitData.map(item => item.jobNo);
  const data = profitData.map(item => item.charge - item.actualCost);

  const chartData = {
    labels: labels,
    datasets: [{
      label: 'Profit by Job No',
      data: data,
      backgroundColor: '#4CAF50',
      borderColor: '#388E3C',
      borderWidth: 1,
      hoverBackgroundColor: '#66BB6A',
      hoverBorderColor: '#388E3C'
    }]
  };

  new Chart(profitChartCanvas, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      scales: {
        y: { 
          beginAtZero: true 
        }
      }
    }
  });
}

// Export to Excel using SheetJS
function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(profitData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Profit Data');
  XLSX.writeFile(wb, 'profit_data.xlsx');
}

// Initialize by rendering the table and chart
renderProfitTable();
