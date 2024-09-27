let bForm = document.querySelector(".b-form");
let balInput = bForm.querySelector("input");
let tForm = document.querySelector(".t-form");
let allInput = tForm.querySelectorAll("input");
let selectEl = tForm.querySelector("select");
let validate = tForm.querySelectorAll(".validate");
let btnClose = document.querySelector(".btn-close");
let balanceEl = document.querySelector(".balance");
let incomeEl = document.querySelector(".income");
let expenseEl = document.querySelector(".expense");
let tListEl = document.querySelector(".t-list");
let modalBtn = document.querySelector(".modal-btn");
let balDetails = document.querySelector(".balance-details");
let transDetails = document.querySelector(".transaction-details");
let clearBtn = document.querySelector(".clear-btn");
let msg = document.querySelector(".msg");
let filters = document.querySelectorAll(".t-filter");
let monthDetails = document.querySelector(".month-details");

let transactions = [];
if (localStorage.getItem("transaction") != null) {
  transactions = JSON.parse(localStorage.getItem("transaction"));
}

let balVal = JSON.parse(localStorage.getItem("balance")) || "";
if (balVal !== "") {
  balDetails.classList.add("d-none");
  transDetails.classList.remove("d-none");
}

const validateBalance = () => {
  let vBal = bForm.querySelector(".valid-bal");
  if (balInput.value <= 0) {
    vBal.innerText = "Please enter valid balance";
    return false;
  }
  vBal.innerText = "";
  return true;
}

bForm.onsubmit = (e) => {
  e.preventDefault();
  if (validateBalance()) {
    swal({
      title: "Are you sure?",
      text: "Once added, you will not be able to edit your balance!",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          localStorage.setItem("balance", JSON.stringify(balInput.value));
          balVal = JSON.parse(localStorage.getItem("balance"));
          swal(`${balVal}`, "success");
          balanceEl.innerText = `₹${balVal}`;
          bForm.reset();
          calculation();
          balDetails.classList.add("d-none");
          transDetails.classList.remove("d-none");
          swal("Your balance has been added!", {
            icon: "success",
          });
        } else {
          swal("Check your balance amount!");
        }
      });
  }
}

const formatDate = (d) => {
  let date = new Date(d);
  let yy = date.getFullYear();
  let mm = date.getMonth() + 1;
  let dd = date.getDate();
  let time = date.toLocaleTimeString();
  mm = mm < 10 ? '0' + mm : mm;
  dd = dd < 10 ? '0' + dd : dd;
  return `${dd}-${mm}-${yy} ${time}`;
}

const showTransactions = () => {
  tListEl.innerHTML = "";
  if (transactions.length == 0) {
    msg.classList.remove("d-none");
    return;
  }
  msg.classList.add("d-none");
  transactions.forEach((item) => {
    tListEl.innerHTML += `
      <tr>
        <td class="text-nowrap">${item.title}</td>
        <td class="text-nowrap">₹${item.amount}</td>
        <td class="text-nowrap">${item.type}</td>
        <td class="text-nowrap">${item.date}</td>
      </tr>
    `;
    document.querySelector(".clear-details").classList.remove("d-none");
  })
}

let credited;
let debited;

const calculation = () => {
  let totalCr = 0;
  let filterCr = transactions.filter((item) => item.type == "Credit");
  for (let obj of filterCr) {
    totalCr += Number(obj.amount);
  }
  let totalDb = 0;
  let filterDb = transactions.filter((item) => item.type == "Debit");
  for (let obj of filterDb) {
    totalDb += +obj.amount;
  }
  credited = totalCr;
  debited = totalDb;
  incomeEl.innerText = `₹${totalCr}`;
  expenseEl.innerText = `₹${totalDb}`;
  balVal = JSON.parse(localStorage.getItem("balance"));
  Number(balVal) + Number(totalCr - totalDb) <= 0 ? balanceEl.style.color = "red" : balanceEl.style.color = "green";
  balanceEl.innerText = `₹${Number(balVal) + Number(totalCr - totalDb)}`;
}

clearBtn.onclick = () => {
  swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this transactions!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((willDelete) => {
      if (willDelete) {
        let total = JSON.parse(localStorage.getItem("balance"));
        let totalBal = Number(total) + credited - debited;
        localStorage.setItem("balance", JSON.stringify(totalBal));
        localStorage.removeItem("transaction");
        transactions = [];
        showTransactions();
        calculation();
        document.querySelector(".clear-details").classList.add("d-none");
        if (filters[1].value != "00")
          showDetails(filters[1].value);
        swal("Your all transactions has been deleted!", {
          icon: "success",
        });
      } else {
        swal("Your all transactions are safe!");
      }
    });
}

const validateType = () => {
  if (selectEl.value == "transaction") {
    validate[0].innerText = "Transaction type is required";
    return false;
  }
  validate[0].innerText = "";
  return true;
}

const validateTitle = () => {
  if (allInput[0].value == "") {
    validate[1].innerText = "Transaction title is required";
    return false;
  }
  validate[1].innerText = "";
  return true;
}

const validateAmount = () => {
  if (allInput[1].value == "") {
    validate[2].innerText = "Transaction amount is required";
    return false;
  }
  if (allInput[1].value <= 0) {
    validate[2].innerText = "Provide valid transaction amount";
    return false;
  }
  validate[2].innerText = ""
  return true;
}

tForm.onsubmit = (e) => {
  e.preventDefault();
  if (validateType() && validateTitle() && validateAmount()) {
    swal({
      title: "Are you sure? Once added, you will not be able to edit your transaction!",
      text: `Your transaction details
      Type: ${selectEl.value}
      Title: ${allInput[0].value}
      Amount: ${allInput[1].value}
      `,
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          let obj = {
            title: allInput[0].value,
            amount: allInput[1].value,
            type: selectEl.value,
            date: formatDate(new Date())
          };
          transactions.unshift(obj);
          localStorage.setItem("transaction", JSON.stringify(transactions));
          swal("Success", "Transaction has added", "success");
          btnClose.click();
          tForm.reset();
          calculation();
          if (filters[0].value != "All" || filters[1].value != "00")
            filterTable(filters[0].value, filters[1].value);
          else
            showTransactions();
        } else {
          swal("Transaction has not added. Check once!");
        }
      });
  }
}

modalBtn.onclick = () => {
  tForm.reset();
  validate[0].innerText = "";
  validate[1].innerText = "";
  validate[2].innerText = "";
}

const showDetails = (filterDval) => {
  let totalCr = 0;
  let filterCr = transactions.filter((item) => item.type == "Credit" && item.date.split("-")[1] == filterDval);
  for (let obj of filterCr) {
    totalCr += Number(obj.amount);
  }
  let totalDb = 0;
  let filterDb = transactions.filter((item) => item.type == "Debit" && item.date.split("-")[1] == filterDval);
  for (let obj of filterDb) {
    totalDb += +obj.amount;
  }
  let month;
  let monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  monthList.forEach((item, index) => {
    if (index + 1 < 10) {
      let temp = (index + 1).toString();
      let i = "0" + temp;
      if (i == filterDval)
        month = item;
    }
    else {
      if (index + 1 == filterDval)
        month = item;
    }
  });
  monthDetails.innerHTML = "";
  monthDetails.innerHTML = `
    <h4 class="mt-3 mb-0 text-center month-name">${month} month transactions</h4>
    <div class="d-flex justify-content-around align-items-center">
      <h6 class="mb-0">Income</h6>
      <h6 class="mb-0">Expense</h6>
    </div>
    <div class="d-flex justify-content-around align-items-center">
      <h6 class="text-success month-income">₹${totalCr}</h6>
      <h6 class="text-danger month-expense">₹${totalDb}</h6>
    </div>
  `;
}

const filterTable = (filterTval, filterDval) => {
  tListEl.innerHTML = "";
  let filterList;
  if (filterDval == "00") {
    filterList = transactions.filter((item) => item.type == filterTval);
    monthDetails.innerHTML = "";
  }
  else if (filterTval == "All") {
    showDetails(filterDval);
    filterList = transactions.filter((item) => item.date.split("-")[1] == filterDval);
  }
  else {
    showDetails(filterDval);
    filterList = transactions.filter((item) => item.type == filterTval && item.date.split("-")[1] == filterDval);
  }
  if (filterList.length == 0) {
    msg.classList.remove("d-none");
    return;
  }
  msg.classList.add("d-none");
  filterList.forEach((item) => {
    tListEl.innerHTML += `
      <tr>
        <td class="text-nowrap">${item.title}</td>
        <td class="text-nowrap">₹${item.amount}</td>
        <td class="text-nowrap">${item.type}</td>
        <td class="text-nowrap">${item.date}</td>
      </tr>
    `;
  })
}

filters[0].onchange = () => {
  let filterTval = filters[0].value;
  if (filterTval == "All") {
    if (filters[1].value == "00")
      showTransactions();
    else
      filterTable(filterTval, filters[1].value);
  }
  else {
    filterTable(filterTval, filters[1].value);
  }
}

filters[1].onchange = () => {
  let filterDval = filters[1].value;
  if (filterDval == "00") {
    monthDetails.innerHTML = "";
    if (filters[0].value == "All")
      showTransactions();
    else
      filterTable(filters[0].value, filterDval);
  }
  else {
    filterTable(filters[0].value, filterDval);
  }
}

showTransactions();
calculation();