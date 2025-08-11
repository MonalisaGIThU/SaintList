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
  // Input for unit in the manual add form
  const itemUnitInput = document.getElementById('itemUnit');
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

  // Manual form toggle button and section for custom item entry
  const toggleFormButton = document.getElementById('toggleFormButton');
  const inputFormSection = document.querySelector('.input-form');

  // Product grid container for the new interactive selection UI
  const productGrid = document.getElementById('productGrid');

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
   * Static product list loaded from the spreadsheet. Each entry contains
   * the product name, its default unit, and a default price. Users can
   * adjust the price via the UI and it will persist in localStorage
   * under itemPrices.
   */
  const itemsData = [
    // Categorized product data with cost (purchase price) equal to sale price by default.
    { name: "ลีโอ", unit: "กล่อง", price: 62.0, cost: 62.0, category: "เหล้า/บุหรี่" },
    { name: "ลีโอ กระป๋อง", unit: "แพค", price: 39.0, cost: 39.0, category: "เหล้า/บุหรี่" },
    { name: "ช้าง", unit: "กล่อง", price: 60.0, cost: 60.0, category: "เหล้า/บุหรี่" },
    { name: "ช้างกระป๋อง", unit: "แพค", price: 39.0, cost: 39.0, category: "เหล้า/บุหรี่" },
    { name: "เสือเล็ก", unit: "กล่อง", price: 85.0, cost: 85.0, category: "เหล้า/บุหรี่" },
    { name: "ขาวเล็ก", unit: "กล่อง", price: 70.0, cost: 70.0, category: "เหล้า/บุหรี่" },
    { name: "หงษ์กลม", unit: "ขวด", price: 280.0, cost: 280.0, category: "เหล้า/บุหรี่" },
    { name: "หงษ์แบน", unit: "กล่อง", price: 150.0, cost: 150.0, category: "เหล้า/บุหรี่" },
    { name: "285 กลม", unit: "ขวด", price: 285.0, cost: 285.0, category: "เหล้า/บุหรี่" },
    { name: "แสงโสมกลม", unit: "ขวด", price: 0, cost: 0, category: "เหล้า/บุหรี่" },
    { name: "แสงโสมแบน", unit: "แบน", price: 0, cost: 0, category: "เหล้า/บุหรี่" },
    { name: "สปายชมพู", unit: "กล่อง", price: 25.0, cost: 25.0, category: "เหล้า/บุหรี่" },
    { name: "SMS เขียว", unit: "ห่อ", price: 33.0, cost: 33.0, category: "เหล้า/บุหรี่" },
    { name: "SMS แดง", unit: "ห่อ", price: 70.0, cost: 70.0, category: "เหล้า/บุหรี่" },
    { name: "สมอ", unit: "ห่อ", price: 70.0, cost: 70.0, category: "เหล้า/บุหรี่" },
    { name: "แมวเขียว", unit: "ห่อ", price: 15.0, cost: 15.0, category: "เหล้า/บุหรี่" },
    { name: "กระดาษสมอ", unit: "ห่อ", price: 15.0, cost: 15.0, category: "เหล้า/บุหรี่" },
    { name: "กระดาษไก่", unit: "ห่อ", price: 0, cost: 0, category: "เหล้า/บุหรี่" },
    // Drinks
    { name: "M150", unit: "แพค", price: 0, cost: 0, category: "เครื่องดื่ม" },
    { name: "ลิโพ", unit: "แพค", price: 12.0, cost: 12.0, category: "เครื่องดื่ม" },
    { name: "คาราบาว (แพค)", unit: "แพค", price: 12.0, cost: 12.0, category: "เครื่องดื่ม" },
    { name: "คาราบาว (กล่อง)", unit: "กล่อง", price: 10.0, cost: 10.0, category: "เครื่องดื่ม" },
    { name: "โสม", unit: "แพค", price: 10.0, cost: 10.0, category: "เครื่องดื่ม" },
    { name: "กระทิงแดง", unit: "แพค", price: 12.0, cost: 12.0, category: "เครื่องดื่ม" },
    { name: "สปอนเซอร์", unit: "กล่อง", price: 12.0, cost: 12.0, category: "เครื่องดื่ม" },
    { name: "โซดาวันเวย์", unit: "ถาด", price: 10.0, cost: 10.0, category: "เครื่องดื่ม" },
    { name: "เป๊บซี่ใหญ่", unit: "แพค", price: 32.0, cost: 32.0, category: "เครื่องดื่ม" },
    { name: "เป็บซี่เล็ก", unit: "แพค", price: 13.0, cost: 13.0, category: "เครื่องดื่ม" },
    { name: "เบอร์ดี้แดงกระป๋อง", unit: "กล่อง", price: 17.0, cost: 17.0, category: "เครื่องดื่ม" },
    { name: "เนสเขียวกระป๋อง", unit: "กล่อง", price: 17.0, cost: 17.0, category: "เครื่องดื่ม" },
    { name: "เนสซองแดง", unit: "ห่อ", price: 5.0, cost: 5.0, category: "เครื่องดื่ม" },
    { name: "เนสซองเขียว", unit: "ห่อ", price: 5.0, cost: 5.0, category: "เครื่องดื่ม" },
    { name: "โอวัลตินซอง", unit: "แพค", price: 8.0, cost: 8.0, category: "เครื่องดื่ม" },
    { name: "เฮลบลูบอย", unit: "ฃวด", price: 4.0, cost: 4.0, category: "เครื่องดื่ม" },
    // Household/cleaning/personal care
    { name: "ซันไลต์", unit: "แพค", price: 13.0, cost: 13.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ไบกอนกล่อง", unit: "แพค", price: 20.0, cost: 20.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ไบกอน กระป๋อง", unit: "กระป๋อง", price: 20.0, cost: 20.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "แปรงสีฟัน", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "คอลเกตเล็ก", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ดาร์ลี่เล็ก", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "แป้งแคร์เล็ก", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "แป้งเภสัช", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ลักซ์", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "โพรเทค", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ซันซิลขวดเล็ก", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "โดฟขวด", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "คลินิก ขวดเล็ก", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "รีจอยซ์ขวด", unit: "แพค", price: 20.0, cost: 20.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "โอโมพลัส", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "บรีสเอกเซล", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "อีซี่", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "บริสน้ำ", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "คอมฟอรท ฟ้า", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "คอมฟอรท ชมพู", unit: "แพค", price: 0, cost: 0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ดาวนี่ แดง", unit: "แพค", price: 20.0, cost: 20.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ดาวนี่ ฟ้า", unit: "แพค", price: 10.0, cost: 10.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "เมอรี่ไบรท ทวิน", unit: "แผง", price: 10.0, cost: 10.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "เมอรี่ไบรท เขียว", unit: "แผง", price: 10.0, cost: 10.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ฝอยขัดหม้อ", unit: "แผง", price: 5.0, cost: 5.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "ฟองน้ำตาข่าย", unit: "แผง", price: 4.0, cost: 4.0, category: "ทำความสะอาด/ซักผ้า" },
    { name: "กระดาษทิชชู่", unit: "ห่อ", price: 5.0, cost: 5.0, category: "ทำความสะอาด/ซักผ้า" },
    // Other/miscellaneous items (packaging materials and bags)
    { name: "ถุง  3 x 5", unit: "", price: 5.0, cost: 5.0, category: "อื่นๆ" },
    { name: "ถุงร้อน  6 x 9", unit: "", price: 0, cost: 0, category: "อื่นๆ" },
    { name: "ถุงหิ้ว 6 x 11 บาง", unit: "", price: 0, cost: 0, category: "อื่นๆ" },
    { name: "ถุงหิ้ว 6 x 14 บาง", unit: "", price: 0, cost: 0, category: "อื่นๆ" },
    { name: "ถุงหิ้ว 8 x 16  บาง", unit: "", price: 0, cost: 0, category: "อื่นๆ" },
    { name: "ถุงน้ำขวด 6 x 12", unit: "", price: 65.0, cost: 65.0, category: "อื่นๆ" }
  ];

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
        <td>${item.unit || ''}</td>
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
    // Only include the product name and quantity in the summary. Price details are omitted.
    let summary = 'รายการสั่งซื้อ:\n';
    currentItems.forEach((item, idx) => {
      const unit = item.unit ? item.unit : '';
      const unitText = unit ? ` ${unit}` : '';
      summary += `${idx + 1}. ${item.name} จำนวน ${item.quantity}${unitText}\n`;
    });
    const totalQuantity = currentItems.reduce((sum, item) => sum + Number(item.quantity), 0);
    summary += `\nรวมทั้งหมด ${totalQuantity} รายการ`;
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
    // Render only the item names and quantities in the bill. Hide price and totals.
    html += '<thead><tr><th>#</th><th>ชื่อสินค้า</th><th>จำนวน</th><th>หน่วย</th></tr></thead><tbody>';
    let totalQty = 0;
    currentItems.forEach((item, idx) => {
      totalQty += Number(item.quantity);
      const unit = item.unit ? item.unit : '';
      html += `<tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.quantity}</td><td>${unit}</td></tr>`;
    });
    html += `<tr><td colspan="3"><strong>รวมทั้งหมด</strong></td><td><strong>${totalQty}</strong></td></tr>`;
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
   * Preview the bill/invoice without saving the list. Displays the overlay
   * showing only the current items and their quantities. If no items have
   * been added yet, alerts the user.
   */
  function previewBill() {
    if (currentItems.length === 0) {
      alert('ยังไม่มีสินค้าถูกเพิ่มในรายการ');
      return;
    }
    // Use a generic list name for preview; don't persist anything
    showBill('รายการชั่วคราว');
  }

  // Expose previewBill globally so it can be called from inline onclick attributes
  window.previewBill = previewBill;

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
   * Set the quantity for a given product. If quantity is zero, the product
   * is removed from the current list. Otherwise it is added or updated.
   * Price is resolved from itemPrices or its default in itemsData.
   * @param {string} name
   * @param {number} quantity
   */
  function setItemQuantity(name, quantity) {
    quantity = Math.max(0, quantity);
    const idx = currentItems.findIndex(it => it.name === name);
    if (quantity === 0) {
      if (idx !== -1) {
        currentItems.splice(idx, 1);
      }
    } else {
      const price = itemPrices[name] !== undefined
        ? Number(itemPrices[name])
        : (() => {
            const found = itemsData.find(d => d.name === name);
            return found ? Number(found.price) : 0;
          })();
    if (idx === -1) {
        // Look up the unit from itemsData
        const found = itemsData.find(d => d.name === name);
        const unit = found ? found.unit : '';
        currentItems.push({ name, quantity, price, unit });
      } else {
        currentItems[idx].quantity = quantity;
        // Also update unit if missing
        if (!currentItems[idx].unit) {
          const found = itemsData.find(d => d.name === name);
          currentItems[idx].unit = found ? found.unit : '';
        }
      }
    }
    renderTable();
  }

  /**
   * Set the price for a given product name. Persists to localStorage and
   * updates any existing entry in currentItems.
   * @param {string} name
   * @param {number} price
   */
  function setItemPrice(name, price) {
    price = Math.max(0, price);
    itemPrices[name] = price;
    saveItemPrices();
    const idx = currentItems.findIndex(it => it.name === name);
    if (idx !== -1) {
      currentItems[idx].price = price;
    }
    renderTable();
  }

  /**
   * Render the product selection grid with quantity and price controls. Each
   * card contains plus and minus buttons that adjust the quantity or price
   * respectively. Changes are reflected in currentItems and persisted via
   * setItemQuantity and setItemPrice.
   */
  function renderProductGrid() {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    itemsData.forEach((prod) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      // Create an image element for the product. The image filename is derived
      // from the product name by replacing spaces with hyphens and appending
      // .png. Images should be placed in the "img/products" folder. If the
      // specific image isn't found, the onerror handler falls back to a cute
      // bear image as a placeholder. This allows users to drop their own
      // product PNGs into the img/products folder without code changes.
      const imgEl = document.createElement('img');
      // Convert the product name into a safe filename: replace spaces and
      // problematic characters with hyphens. Encode URI components to handle
      // non‑Latin characters safely in file paths.
      const slug = encodeURIComponent(prod.name.replace(/\s+/g, '-'));
      imgEl.src = `img/products/${slug}.png`;
      imgEl.alt = prod.name;
      // When the image fails to load (e.g. missing file), fall back to a
      // default bear image. This ensures the card always has a cute graphic.
      imgEl.onerror = () => {
        imgEl.onerror = null; // prevent infinite loop if fallback missing
        imgEl.src = 'img/bear-donut.png';
      };
      imgEl.className = 'product-image';
      card.appendChild(imgEl);
      // Determine current values
      const existing = currentItems.find(it => it.name === prod.name);
      const qtyVal = existing ? Number(existing.quantity) : 0;
      const priceVal = itemPrices[prod.name] !== undefined ? Number(itemPrices[prod.name]) : Number(prod.price);
      // Product name
      const nameEl = document.createElement('div');
      nameEl.className = 'product-name';
      nameEl.textContent = prod.name;
      card.appendChild(nameEl);
      // Display unit under the product name for clarity
      const unitEl = document.createElement('div');
      unitEl.className = 'product-unit';
      unitEl.textContent = prod.unit ? `หน่วย: ${prod.unit}` : '';
      card.appendChild(unitEl);
      // Controls container
      const controls = document.createElement('div');
      controls.className = 'controls';
      // Quantity row
      const qtyRow = document.createElement('div');
      qtyRow.className = 'control-row';
      const qtyMinusBtn = document.createElement('button');
      qtyMinusBtn.textContent = '–';
      const qtyValueSpan = document.createElement('span');
      qtyValueSpan.className = 'value';
      qtyValueSpan.textContent = qtyVal;
      const qtyPlusBtn = document.createElement('button');
      qtyPlusBtn.textContent = '+';
      qtyRow.appendChild(qtyMinusBtn);
      qtyRow.appendChild(qtyValueSpan);
      qtyRow.appendChild(qtyPlusBtn);
      // Quantity label
      const qtyLabelDiv = document.createElement('div');
      qtyLabelDiv.textContent = 'จำนวน';
      qtyLabelDiv.style.fontSize = '0.8rem';
      qtyLabelDiv.style.marginTop = '0.25rem';
      // Price row
      const priceRow = document.createElement('div');
      priceRow.className = 'control-row';
      const priceMinusBtn = document.createElement('button');
      priceMinusBtn.textContent = '–';
      const priceValueSpan = document.createElement('span');
      priceValueSpan.className = 'value';
      priceValueSpan.textContent = priceVal;
      const pricePlusBtn = document.createElement('button');
      pricePlusBtn.textContent = '+';
      priceRow.appendChild(priceMinusBtn);
      priceRow.appendChild(priceValueSpan);
      priceRow.appendChild(pricePlusBtn);
      // Price label
      const priceLabelDiv = document.createElement('div');
      priceLabelDiv.textContent = 'ราคา/หน่วย';
      priceLabelDiv.style.fontSize = '0.8rem';
      priceLabelDiv.style.marginTop = '0.25rem';
      // Assemble the card
      controls.appendChild(qtyRow);
      controls.appendChild(qtyLabelDiv);
      controls.appendChild(priceRow);
      controls.appendChild(priceLabelDiv);
      card.appendChild(controls);
      productGrid.appendChild(card);
      // Event handlers
      qtyPlusBtn.addEventListener('click', () => {
        let cur = parseInt(qtyValueSpan.textContent, 10) || 0;
        cur += 1;
        qtyValueSpan.textContent = cur;
        setItemQuantity(prod.name, cur);
      });
      qtyMinusBtn.addEventListener('click', () => {
        let cur = parseInt(qtyValueSpan.textContent, 10) || 0;
        cur = Math.max(0, cur - 1);
        qtyValueSpan.textContent = cur;
        setItemQuantity(prod.name, cur);
      });
      pricePlusBtn.addEventListener('click', () => {
        let cur = parseFloat(priceValueSpan.textContent) || 0;
        cur = Math.round((cur + 1) * 100) / 100;
        priceValueSpan.textContent = cur;
        setItemPrice(prod.name, cur);
      });
      priceMinusBtn.addEventListener('click', () => {
        let cur = parseFloat(priceValueSpan.textContent) || 0;
        cur = Math.max(0, Math.round((cur - 1) * 100) / 100);
        priceValueSpan.textContent = cur;
        setItemPrice(prod.name, cur);
      });
    });
  }

  /**
   * Render the product selection grid grouped by category. Items within the same
   * category will appear under a heading to help users quickly find related
   * products. This function uses the same card layout as renderProductGrid() but
   * organizes the cards into sections. The order of categories is defined
   * explicitly to keep similar categories adjacent.
   */
  function renderCategorizedGrid() {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    // Group items by category
    const groups = {};
    itemsData.forEach((prod) => {
      const cat = prod.category || 'อื่นๆ';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(prod);
    });
    // Define display order for categories. Unlisted categories will appear at the end.
    const orderedCategories = ['เหล้า/บุหรี่', 'เครื่องดื่ม', 'ทำความสะอาด/ซักผ้า', 'เครื่องปรุงรส', 'ขนม', 'อื่นๆ'];
    const categories = [...orderedCategories.filter((c) => groups[c]), ...Object.keys(groups).filter((c) => !orderedCategories.includes(c))];
    categories.forEach((cat) => {
      const section = document.createElement('div');
      section.className = 'category-section';
      // Heading
      const heading = document.createElement('h3');
      heading.className = 'category-heading';
      heading.textContent = cat;
      section.appendChild(heading);
      // Grid container for this category
      const grid = document.createElement('div');
      grid.className = 'grid';
      groups[cat].forEach((prod) => {
        // Build card similar to renderProductGrid
        const card = document.createElement('div');
        card.className = 'product-card';
        const imgEl = document.createElement('img');
        const slug = encodeURIComponent(prod.name.replace(/\s+/g, '-'));
        imgEl.src = `img/products/${slug}.png`;
        imgEl.alt = prod.name;
        imgEl.onerror = () => {
          imgEl.onerror = null;
          imgEl.src = 'img/bear-donut.png';
        };
        imgEl.className = 'product-image';
        card.appendChild(imgEl);
        // Determine current values
        const existing = currentItems.find((it) => it.name === prod.name);
        const qtyVal = existing ? Number(existing.quantity) : 0;
        const priceVal = itemPrices[prod.name] !== undefined ? Number(itemPrices[prod.name]) : Number(prod.price);
        // Product name
        const nameEl = document.createElement('div');
        nameEl.className = 'product-name';
        nameEl.textContent = prod.name;
        card.appendChild(nameEl);
        // Display unit under the product name
        const unitEl = document.createElement('div');
        unitEl.className = 'product-unit';
        unitEl.textContent = prod.unit ? `หน่วย: ${prod.unit}` : '';
        card.appendChild(unitEl);
        // Controls container
        const controls = document.createElement('div');
        controls.className = 'controls';
        // Quantity row
        const qtyRow = document.createElement('div');
        qtyRow.className = 'control-row';
        const qtyMinusBtn = document.createElement('button');
        qtyMinusBtn.textContent = '–';
        const qtyValueSpan = document.createElement('span');
        qtyValueSpan.className = 'value';
        qtyValueSpan.textContent = qtyVal;
        const qtyPlusBtn = document.createElement('button');
        qtyPlusBtn.textContent = '+';
        qtyRow.appendChild(qtyMinusBtn);
        qtyRow.appendChild(qtyValueSpan);
        qtyRow.appendChild(qtyPlusBtn);
        // Quantity label
        const qtyLabelDiv = document.createElement('div');
        qtyLabelDiv.textContent = 'จำนวน';
        qtyLabelDiv.style.fontSize = '0.8rem';
        qtyLabelDiv.style.marginTop = '0.25rem';
        // Price row
        const priceRow = document.createElement('div');
        priceRow.className = 'control-row';
        const priceMinusBtn = document.createElement('button');
        priceMinusBtn.textContent = '–';
        const priceValueSpan = document.createElement('span');
        priceValueSpan.className = 'value';
        priceValueSpan.textContent = priceVal;
        const pricePlusBtn = document.createElement('button');
        pricePlusBtn.textContent = '+';
        priceRow.appendChild(priceMinusBtn);
        priceRow.appendChild(priceValueSpan);
        priceRow.appendChild(pricePlusBtn);
        // Price label
        const priceLabelDiv = document.createElement('div');
        priceLabelDiv.textContent = 'ราคา/หน่วย';
        priceLabelDiv.style.fontSize = '0.8rem';
        priceLabelDiv.style.marginTop = '0.25rem';
        // Assemble card
        controls.appendChild(qtyRow);
        controls.appendChild(qtyLabelDiv);
        controls.appendChild(priceRow);
        controls.appendChild(priceLabelDiv);
        card.appendChild(controls);
        grid.appendChild(card);
        // Event handlers
        qtyPlusBtn.addEventListener('click', () => {
          let cur = parseInt(qtyValueSpan.textContent, 10) || 0;
          cur += 1;
          qtyValueSpan.textContent = cur;
          setItemQuantity(prod.name, cur);
        });
        qtyMinusBtn.addEventListener('click', () => {
          let cur = parseInt(qtyValueSpan.textContent, 10) || 0;
          cur = Math.max(0, cur - 1);
          qtyValueSpan.textContent = cur;
          setItemQuantity(prod.name, cur);
        });
        pricePlusBtn.addEventListener('click', () => {
          let cur = parseFloat(priceValueSpan.textContent) || 0;
          cur = Math.round((cur + 1) * 100) / 100;
          priceValueSpan.textContent = cur;
          setItemPrice(prod.name, cur);
        });
        priceMinusBtn.addEventListener('click', () => {
          let cur = parseFloat(priceValueSpan.textContent) || 0;
          cur = Math.max(0, Math.round((cur - 1) * 100) / 100);
          priceValueSpan.textContent = cur;
          setItemPrice(prod.name, cur);
        });
      });
      section.appendChild(grid);
      productGrid.appendChild(section);
    });
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
    // Render the interactive product grid grouped by category for better UX
    renderCategorizedGrid();
  }

  // Event listeners
  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = itemNameInput.value.trim();
    const quantity = parseFloat(itemQtyInput.value);
    const price = parseFloat(itemPriceInput.value);
    // Retrieve the unit (may be empty string)
    const unit = itemUnitInput ? itemUnitInput.value.trim() : '';
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
    // Add to current list with unit property
    currentItems.push({ name, quantity, price, unit });
    // Save last price for this item
    itemPrices[name] = price;
    saveItemPrices();
    updateSuggestions();
    // Clear inputs for next entry
    itemNameInput.value = '';
    itemQtyInput.value = '1';
    itemPriceInput.value = '0';
    if (itemUnitInput) itemUnitInput.value = '';
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

  // Toggle visibility of the manual item form when the toggle button is clicked
  if (toggleFormButton && inputFormSection) {
    toggleFormButton.addEventListener('click', () => {
      inputFormSection.classList.toggle('hidden');
    });
  }

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