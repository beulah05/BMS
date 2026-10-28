const API_BASE = "http://localhost:3000/api";
const STORAGE_KEY = "northstar_demo_account_id";
const $ = (selector) => document.querySelector(selector);

let accountId = localStorage.getItem(STORAGE_KEY);
let currentMode = "deposit";
let account = null;
let toastTimer;

const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", minimumFractionDigits: 2
}).format(Number(value || 0));

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
  } catch {
    throw new Error("Cannot reach the backend. Start the server in the backend folder.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function renderAccount(data) {
  account = data.account;
  const transactions = data.transactions || [];
  $("#welcomeName").textContent = `Welcome, ${account.full_name}`;
  $("#accountMeta").textContent = `Your demo account is ready · ${account.account_number}`;
  $("#avatar").textContent = (account.full_name || "G").trim().charAt(0).toUpperCase();
  $("#balance").textContent = money(account.balance);
  $("#holderName").textContent = account.full_name;
  $("#accountNumber").textContent = account.account_number;
  const deposits = transactions.filter(t => t.type === "deposit").reduce((sum, t) => sum + Number(t.amount), 0);
  const withdrawals = transactions.filter(t => t.type === "withdraw").reduce((sum, t) => sum + Number(t.amount), 0);
  $("#totalDeposits").textContent = money(deposits);
  $("#totalWithdrawals").textContent = money(withdrawals);
  $("#transactionCount").textContent = `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`;

  if (!transactions.length) {
    $("#transactionRows").innerHTML = '<tr><td colspan="5" class="empty-state">No transactions yet. Try a demo deposit.</td></tr>';
    return;
  }
  $("#transactionRows").innerHTML = transactions.map(tx => {
    const isDeposit = tx.type === "deposit";
    const date = new Date(tx.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    return `<tr>
      <td><div class="transaction-name"><span class="tx-icon ${isDeposit ? "deposit" : "withdraw"}">${isDeposit ? "↙" : "↗"}</span>${isDeposit ? "Cash deposit" : "Cash withdrawal"}</div></td>
      <td class="tx-date">${date}</td>
      <td><span class="type-chip ${tx.type}">${isDeposit ? "Deposit" : "Withdrawal"}</span></td>
      <td><span class="success-chip">Completed</span></td>
      <td class="align-right ${isDeposit ? "amount-positive" : "amount-negative"}">${isDeposit ? "+" : "−"}${money(tx.amount)}</td>
    </tr>`;
  }).join("");
}

async function loadAccount() {
  if (!accountId) return;
  try {
    const data = await api(`/accounts/${encodeURIComponent(accountId)}`);
    renderAccount(data);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    accountId = null;
    showToast(error.message);
  }
}

$("#createAccountBtn").addEventListener("click", async () => {
  const name = prompt("Enter a name for your demo account:");
  if (!name || !name.trim()) return;
  $("#createAccountBtn").disabled = true;
  try {
    const data = await api("/accounts", {
      method: "POST",
      body: JSON.stringify({ fullName: name.trim() })
    });
    accountId = data.account.id;
    localStorage.setItem(STORAGE_KEY, accountId);
    await loadAccount();
    showToast("Your demo account has been created.");
  } catch (error) {
    showToast(error.message);
  } finally {
    $("#createAccountBtn").disabled = false;
  }
});

function openTransaction(mode) {
  if (!accountId) {
    showToast("Create a demo account first.");
    return;
  }
  currentMode = mode;
  const isDeposit = mode === "deposit";
  $("#dialogIcon").textContent = isDeposit ? "＋" : "−";
  $("#dialogEyebrow").textContent = isDeposit ? "ADD DEMO FUNDS" : "REMOVE DEMO FUNDS";
  $("#dialogTitle").textContent = isDeposit ? "Deposit funds" : "Withdraw funds";
  $("#dialogDescription").textContent = isDeposit
    ? "Add simulated funds to your demo account."
    : "Withdraw simulated funds from your demo account.";
  $("#submitTransaction").textContent = isDeposit ? "Confirm deposit" : "Confirm withdrawal";
  $("#amount").value = "";
  $("#formError").textContent = "";
  $("#transactionDialog").showModal();
  $("#amount").focus();
}
$("#depositOpen").addEventListener("click", () => openTransaction("deposit"));
$("#withdrawOpen").addEventListener("click", () => openTransaction("withdraw"));
$("#dialogClose").addEventListener("click", () => $("#transactionDialog").close());

$("#transactionForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const amount = Number($("#amount").value);
  if (!Number.isFinite(amount) || amount <= 0) {
    $("#formError").textContent = "Enter an amount greater than zero.";
    return;
  }
  const button = $("#submitTransaction");
  button.disabled = true;
  button.textContent = "Processing…";
  try {
    await api(`/accounts/${encodeURIComponent(accountId)}/${currentMode}`, {
      method: "POST",
      body: JSON.stringify({ amount })
    });
    await loadAccount();
    $("#transactionDialog").close();
    showToast(currentMode === "deposit" ? "Demo deposit successful." : "Demo withdrawal successful.");
  } catch (error) {
    $("#formError").textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = currentMode === "deposit" ? "Confirm deposit" : "Confirm withdrawal";
  }
});

loadAccount();
