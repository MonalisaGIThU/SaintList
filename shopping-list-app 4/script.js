/**
 * Shopping List App
 *
 * This script powers the interactive shopping list web application.
 * Users can add items with quantities and unit prices, see a running
 * total, save named lists for later, and load or delete those lists.
 * Item names and their last prices are stored to provide autocompletion
 * and pre-filled pricing on subsequent use.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const itemForm = document.getElementById('itemForm');
  const itemNameInput = document.getElementById('itemName');
  const itemQtyInput = document.getElementById('itemQty');
  const itemPriceInput = document.getElementById('itemPrice');
  const itemTableBody = document.querySelector('#itemTable tbody');
  const totalCountEl = document.getElementById('totalCount');
  const totalPriceEl = document.getElementById('totalPrice');
  const clearListButton = document.getElementById('clearListButton');
  const summarizeButton = document.getElementById('summarizeButton');
  const summaryModal = document.getElementById('summaryModal');
  const summaryOutput = document.getElementById('summaryOutput');
  const closeModalBtn = document.getElementById('closeModal');
  const listNameInput = document.getElementById('listName');
  const saveListButton = document.getElementById('saveListButton');
  const savedListsSelect = document.getElementById('savedListsSelect');
  const loadListButton = document.getElementById('loadListButton');
  const deleteListButton = document.getElementById('deleteListButton');
  const itemSuggestions = document.getElementById('itemSuggestions');

  // Button to preview the current list as a bill/table
  const showBillButton = document.getElementById('showBillButton');

  // Bill overlay elements
  const billOverlay = document.getElementById('billOverlay');
  const billBody = document.getElementById('billBody');
  const closeBillBtn = document.getElementById('closeBill');

  // State variables
  let currentItems = [];
  let itemPrices = {};
  let savedLists = {};

  /**
   * Load persistent data from localStorage
   */
  function loadData() {
    try {
      itemPrices = JSON.parse(localStorage.getItem('itemPrices') || '{}');
    } catch (e) {
      itemPrices = {};
    }
    try {
      savedLists = JSON.parse(localStorage.getItem('savedLists') || '{}');
    } catch (e) {
      savedLists = {};
    }
  }

  /**
   * Save item price dictionary to localStorage
   */
  function saveItemPrices() {
    localStorage.setItem('itemPrices', JSON.stringify(itemPrices));
  }

  /**
   * Save all lists to localStorage
   */
  function saveLists() {
    localStorage.setItem('savedLists', JSON.stringify(savedLists));
  }

  /**
   * Update the suggestions datalist for item names
   */
  function updateSuggestions() {
    // Clear existing options
    itemSuggestions.innerHTML = '';
    Object.keys(itemPrices)
      .sort()
      .forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.label = `${name} (฿${formatCurrency(itemPrices[name])})`;
        itemSuggestions.appendChild(option);
      });
  }

  /**
   * Populate the saved lists selector
   */
  function updateSavedListsSelect() {
    // Clear current options
    savedListsSelect.innerHTML = '<option value="">-- เลือกรายการ --</option>';
    const names = Object.keys(savedLists);
    names.sort();
    names.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      savedListsSelect.appendChild(option);
    });
  }

  /**
   * Render the items table and totals
   */
  function renderTable() {
    // Clear table body
    itemTableBody.innerHTML = '';
    let totalQuantity = 0;
    let totalPrice = 0;

    currentItems.forEach((item, index) => {
      totalQuantity += Number(item.quantity);
      totalPrice += item.quantity * item.price;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.price)}</td>
        <td>${formatCurrency(item.price * item.quantity)}</td>
        <td><button class="btn danger btn-sm" data-index="${index}">ลบ</button></td>
      `;
      itemTableBody.appendChild(row);
    });

    totalCountEl.textContent = `รวมจำนวนสินค้า: ${totalQuantity}`;
    totalPriceEl.textContent = `ยอดรวม: ${formatCurrency(totalPrice)} บาท`;

    // Attach delete handlers
    const deleteButtons = itemTableBody.querySelectorAll('button[data-index]');
    deleteButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          currentItems.splice(idx, 1);
          renderTable();
        }
      });
    });
  }

  /**
   * Format numbers to currency with two decimal places
   * @param {number} num
   */
  function formatCurrency(num) {
    return parseFloat(num).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Generate a textual summary of the current items
   */
  function generateSummary() {
    let summary = 'รายการสั่งซื้อ:\n';
    currentItems.forEach((item, idx) => {
      summary += `${idx + 1}. ${item.name} จำนวน ${item.quantity} ชิ้น ราคาต่อหน่วย ${formatCurrency(item.price)} บาท ราคารวม ${formatCurrency(item.price * item.quantity)} บาท\n`;
    });
    const totalQuantity = currentItems.reduce((sum, item) => sum + Number(item.quantity), 0);
    const totalPrice = currentItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    summary += `\nรวมทั้งหมด ${totalQuantity} ชิ้น มูลค่ารวม ${formatCurrency(totalPrice)} บาท`;
    return summary;
  }

  /**
   * Show the modal with the current summary
   */
  function showSummaryModal() {
    if (currentItems.length === 0) {
      alert('ยังไม่มีสินค้าถูกเพิ่มในรายการ');
      return;
    }
    summaryOutput.value = generateSummary();
    listNameInput.value = '';
    summaryModal.classList.remove('hidden');
  }

  /**
   * Hide the modal
   */
  function hideSummaryModal() {
    summaryModal.classList.add('hidden');
  }

  /**
   * Build and display the bill/invoice overlay
   * @param {string} name The name of the list being saved
   */
  function showBill(name) {
    // Build HTML for the bill
    const dateStr = new Date().toLocaleDateString('th-TH');
    let html = '';
    // Add a cute bear icon at the top of the invoice
    html += `<img src="img/bear-stand.png" alt="Bear icon" class="bill-icon" />`;
    html += `<h2>บิลรายการสั่งซื้อ</h2>`;
    html += `<p>ชื่อรายการ: ${name}</p>`;
    html += `<p>วันที่: ${dateStr}</p>`;
    html += '<table class="bill-table">';
    html += '<thead><tr><th>#</th><th>ชื่อสินค้า</th><th>จำนวน</th><th>ราคาต่อหน่วย (บาท)</th><th>ราคารวม (บาท)</th></tr></thead><tbody>';
    let totalQty = 0;
    let totalPrice = 0;
    currentItems.forEach((item, idx) => {
      const itemTotal = item.quantity * item.price;
      totalQty += Number(item.quantity);
      totalPrice += itemTotal;
      html += `<tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.quantity}</td><td>${formatCurrency(item.price)}</td><td>${formatCurrency(itemTotal)}</td></tr>`;
    });
    html += `<tr><td colspan="2"><strong>รวมทั้งหมด</strong></td><td><strong>${totalQty}</strong></td><td></td><td><strong>${formatCurrency(totalPrice)}</strong></td></tr>`;
    html += '</tbody></table>';
    // Insert into bill body
    billBody.innerHTML = html;
    // Show overlay
    billOverlay.classList.remove('hidden');
  }

  /**
   * Hide the bill overlay
   */
  function hideBill() {
    billOverlay.classList.add('hidden');
  }

  /**
   * Reset the current list after confirmation
   */
  function clearCurrentList() {
    if (currentItems.length === 0) return;
    const confirmClear = confirm('ต้องการล้างรายการปัจจุบันทั้งหมดหรือไม่?');
    if (confirmClear) {
      currentItems = [];
      renderTable();
    }
  }

  /**
   * Save the current list under a provided name
   */
  function saveCurrentList() {
    const name = listNameInput.value.trim();
    // If user does not provide a name, generate one based on current date/time
    let listName = name;
    if (!listName) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('th-TH');
      const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      listName = `รายการ ${dateStr} ${timeStr}`;
    }
    const exists = Object.prototype.hasOwnProperty.call(savedLists, listName);
    let shouldSave = true;
    if (exists) {
      shouldSave = confirm(`มีรายการชื่อ "${listName}" อยู่แล้ว ต้องการเขียนทับหรือไม่?`);
    }
    if (shouldSave) {
      // Save the list (clone the array to avoid reference issues)
      savedLists[listName] = currentItems.map((item) => ({ ...item }));
      saveLists();
      updateSavedListsSelect();
      alert(`บันทึกรายการ "${listName}" เรียบร้อยแล้ว`);
      hideSummaryModal();
      // Show a bill view after saving
      showBill(listName);
    }
  }

  /**
   * Load a list from savedLists by name
   */
  function loadList() {
    const name = savedListsSelect.value;
    if (!name) {
      alert('กรุณาเลือกรายการที่จะโหลด');
      return;
    }
    const list = savedLists[name];
    if (!list) {
      alert('ไม่พบรายการที่เลือก');
      return;
    }
    let proceed = true;
    if (currentItems.length > 0) {
      proceed = confirm('การโหลดรายการจะล้างรายการปัจจุบัน ต้องการดำเนินการต่อหรือไม่?');
    }
    if (proceed) {
      // Deep clone list
      currentItems = list.map((item) => ({ ...item }));
      renderTable();
    }
  }

  /**
   * Delete a saved list
   */
  function deleteList() {
    const name = savedListsSelect.value;
    if (!name) {
      alert('กรุณาเลือกรายการที่จะลบ');
      return;
    }
    const confirmDelete = confirm(`ต้องการลบรายการ "${name}" หรือไม่?`);
    if (confirmDelete) {
      delete savedLists[name];
      saveLists();
      updateSavedListsSelect();
      alert(`ลบรายการ "${name}" แล้ว`);
    }
  }

  /**
   * When the item name changes, fill the price if known
   */
  function handleItemNameChange() {
    const name = itemNameInput.value.trim();
    if (itemPrices[name] !== undefined) {
      // Pre-fill price
      itemPriceInput.value = itemPrices[name];
    }
  }

  /**
   * Initialize the app
   */
  function init() {
    loadData();
    updateSuggestions();
    updateSavedListsSelect();
    renderTable();
  }

  // Event listeners
  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = itemNameInput.value.trim();
    const quantity = parseFloat(itemQtyInput.value);
    const price = parseFloat(itemPriceInput.value);
    if (!name) {
      alert('กรุณาระบุชื่อสินค้า');
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      alert('จำนวนสินค้าต้องมากกว่า 0');
      return;
    }
    if (isNaN(price) || price < 0) {
      alert('ราคาสินค้าต้องไม่ติดลบ');
      return;
    }
    // Add to current list
    currentItems.push({ name, quantity, price });
    // Save last price for this item
    itemPrices[name] = price;
    saveItemPrices();
    updateSuggestions();
    // Clear inputs for next entry
    itemNameInput.value = '';
    itemQtyInput.value = '1';
    itemPriceInput.value = '0';
    itemNameInput.focus();
    renderTable();
  });

  clearListButton.addEventListener('click', clearCurrentList);
  summarizeButton.addEventListener('click', showSummaryModal);
  closeModalBtn.addEventListener('click', hideSummaryModal);
  saveListButton.addEventListener('click', saveCurrentList);
  loadListButton.addEventListener('click', loadList);
  deleteListButton.addEventListener('click', deleteList);
  itemNameInput.addEventListener('change', handleItemNameChange);

  // Hide modal when clicking outside of modal-content
  summaryModal.addEventListener('click', (e) => {
    if (e.target === summaryModal) {
      hideSummaryModal();
    }
  });

  // Close bill overlay when clicking on close button
  closeBillBtn.addEventListener('click', hideBill);
  // Hide bill when clicking outside of the bill-content
  billOverlay.addEventListener('click', (e) => {
    if (e.target === billOverlay) {
      hideBill();
    }
  });

  // Show bill/table preview when clicking the preview button
  if (showBillButton) {
    showBillButton.addEventListener('click', () => {
      if (currentItems.length === 0) {
        alert('ยังไม่มีสินค้าถูกเพิ่มในรายการ');
        return;
      }
      // Use a generic name for preview purposes
      showBill('รายการปัจจุบัน');
    });
  }

  /**
   * Expose a global function to preview the current list as a bill. This is used
   * by the inline onclick handler on the preview button as a fallback in case
   * dynamic event listeners fail to attach for some reason. It relies on
   * variables defined within this scope via closure.
   */
  window.previewBill = function () {
    if (currentItems.length === 0) {
      alert('ยังไม่มีสินค้าถูกเพิ่มในรายการ');
      return;
    }
    showBill('รายการปัจจุบัน');
  };

  // Initialize app on first load
  init();
});