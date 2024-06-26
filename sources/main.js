import { ExpensesCategoriesData, IncomesCategoriesData, getCategoryColor, checkAvailability } from "./data.js";

// if (!localStorage.transactions) localStorage.setItem('transactions', JSON.stringify(dataArr));

const init = () => {

  if (!JSON.parse(localStorage.getItem('budget-type'))) {
    localStorage.setItem('budget-type', JSON.stringify('expenses'));
  }

  let budgetType = JSON.parse(localStorage.getItem('budget-type'));

  let transactionsType = budgetType === 'expenses' ? 'transactions' : 'incomings';

  let transactionsArr = JSON.parse(localStorage.getItem(`${transactionsType}`)) || [];

  let categoriesType = budgetType === 'expenses' ? 'categories' : 'sources';

  const categoriesSelectionPopup = document.querySelector('.categories-selection-popup'),
    categoriesSelectionList = categoriesSelectionPopup.querySelector('.categories-selection__list'),
    categoriesSelectionButton = categoriesSelectionPopup.querySelector('.categories-selection__button button');

  let categoriesArr = JSON.parse(localStorage.getItem(`${categoriesType}`)) || [];

  const categoriesSum = (arr) => { // new summarize of categories (dynamic)
    if (arr) { // in case there is some transactions
      let outerArr = [];
      for (let i = 0; i < arr.length; i++) { // taking each category
        let someObj = {};
        someObj.amount = 0;
        for (let j = 0; j < arr[i].length; j++) { // then summarizing each transaction inside of it
          someObj.category = arr[i][j].category;
          someObj.amount += arr[i][j].amount;
        }
        outerArr.push(someObj);
      }
      localStorage.setItem('sums', JSON.stringify(outerArr.flat()));
      return outerArr.flat();
    } else { // in case there is no transactions
      let outerArr = [];
      for (let i = 0; i < categoriesArr.length; i++) {
        let someObj = {};
        someObj.category = categoriesArr[i];
        someObj.amount = 0;
        outerArr.push(someObj);
      }
      return outerArr;
    }
  };

  const categoriesCategorize = () => { // creates subarrays into other array with same types of categories
    let outerArr = [];

    if (transactionsArr.length !== 0) {
      for (let i = 0; i < categoriesArr.length; i++) {
        let subArr = [];
        for (let j = 0; j < transactionsArr.length; j++) {
          let transactionMatchesWithCategory = transactionsArr[j].category === categoriesArr[i];
          if (transactionMatchesWithCategory) {
            subArr.push(transactionsArr[j]);
          }
        }
        outerArr.push(subArr);
      }
      return outerArr;
    } else {
      return '';
    }
  }

  let categorizedArr = categoriesCategorize();

  const getPercentages = () => { // calculating the categories' percentages
    let finalArr = categoriesSum(categorizedArr);
    let sum = 0;

    finalArr.forEach((data) => {
      sum += data.amount;
    });

    finalArr.forEach((data) => {
      data.percentage = Math.round(data.amount / sum * 100) || 0;
      data.color = getCategoryColor(data.category);
    });

    let checkPercentage = 0;

    finalArr.forEach((data) => {
      checkPercentage += data.percentage;
    });

    if (checkPercentage !== 100 && checkPercentage > 0) {
      let remainingPercentage = 100 - checkPercentage;
      finalArr[0].percentage += remainingPercentage;
    }

    return [finalArr, sum];
  }

  const categoriesList = document.querySelector('.budget-menu__list ul');

  const categoriesListFill = (categoriesArrNew) => { // creates the list of categories to left of chart
    categoriesList.innerHTML = '';
    categoriesArrNew.forEach((category) => {
      let arr = getPercentages()[0],
        percentage = 0;
      arr.forEach((item) => {
        if (item.category === category) percentage = item.percentage;
      });
      let li = document.createElement('li');
      li.id = category;
      let style = li.style;
      style.setProperty('--listColor', getCategoryColor(category));
      li.innerHTML = `${category} - ${percentage}%`;
      categoriesList.appendChild(li);
    });
  }

  categoriesListFill(categoriesArr);

  const addCategoryButton = document.querySelector('.budget-menu__add button'); // add category window

  addCategoryButton.onclick = () => {

    const categorySelectionFill = (arr) => {
      arr.forEach((category) => {
        let categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `
              <p>${category}</p>
              <input type="checkbox" id="${category}">
              `;
        categoriesSelectionList.appendChild(categoryDiv);
      });
    }

    closeAllWindows();
    categoriesSelectionPopup.classList.toggle('closed');
    categoriesSelectionList.innerHTML = '';

    if (budgetType === 'expenses') {
      categorySelectionFill(ExpensesCategoriesData);
    } else {
      categorySelectionFill(IncomesCategoriesData);
    }

    let selections = categoriesSelectionList.querySelectorAll('.category');

    selections.forEach((selection) => {
      if (checkAvailability(categoriesArr, selection.querySelector('p').innerHTML)) {
        selection.querySelector('input').setAttribute('checked', '');
      }

      selection.addEventListener('click', () => {
        selection.querySelector('input').toggleAttribute('checked');
      });
    });

    categoriesSelectionButton.onclick = () => {
      const inputs = categoriesSelectionList.querySelectorAll('.category input');

      let categoriesArray = [];
      inputs.forEach((input) => {
        if (input.checked) categoriesArray.push(input.id);
      });

      localStorage.setItem(`${categoriesType}`, JSON.stringify(categoriesArray));
      categoriesListFill(categoriesArray);
      popupBuild(categoriesArray);
      categoriesSelectionPopup.classList.add('closed');
      init();
    }
  }

  const nameOfMonthUS = new Intl.DateTimeFormat('en-US', { // writes the current date
    dateStyle: 'medium'
  }).format(new Date());

  const budgetDate = document.querySelector('.budget-pie__date'),
    budgetDateText = budgetDate.querySelector('p'); // inserting current date into the circle
  budgetDateText.innerHTML = nameOfMonthUS;
  const budgetExpenses = budgetDateText.nextSibling.nextSibling;
  budgetExpenses.innerHTML = `Total ${budgetType === 'expenses' ? 'expenses' : 'incomes'}: ${getPercentages()[1]}`;


  budgetDate.onclick = () => {
    closeAllWindows();

    if (JSON.parse(localStorage.getItem('budget-type')) === 'expenses') {
      localStorage.setItem('budget-type', JSON.stringify('incomes'));
    } else {
      localStorage.setItem('budget-type', JSON.stringify('expenses'));
    }

    init();
  }

  const categoriesDOM = categoriesList.querySelectorAll('li'),
    budgetTransactions = document.querySelector('.budget-transactions'),
    budgetTransactionsList = budgetTransactions.querySelector('.budget-transactions__list'),
    budgetTransactionsHeader = budgetTransactions.querySelector('.budget-transactions__header');

  const budgetNotification = document.querySelector('.budget-notification'),
    budgetNotificationText = budgetNotification.querySelector('p');

  const notificationAlert = (add) => {
    budgetNotification.style.animationName = 'slideDown';
    budgetNotificationText.innerHTML = `Transaction has been ${add ? 'added' : 'deleted'}!`;
    setTimeout(() => {
      budgetNotification.style.animationName = '';
    }, 3000);
  }

  const categoriesDOMBuild = () => {
    for (let i = 0; i < categoriesDOM.length; i++) { // tracks the click and sets the font-size and opacity of pie elements
      categoriesDOM[i].addEventListener('click', () => {
        budgetTransactions.className = 'budget-transactions closed';

        let categoriesSumList = JSON.parse(localStorage.getItem('sums'));

        const categoriesPie = document.querySelectorAll('.category');

        const refresh = () => {
          budgetTransactions.classList.add('closed');
          budgetTransactionsList.innerHTML = '';
          budgetTransactionsHeader.innerHTML = '';
          categoriesPie.forEach((item) => item.style.opacity = '1');
          categoriesDOM.forEach((category) => {
            category.classList.remove('clicked');
          });
        }

        let categoryIsClicked = categoriesDOM[i].classList.contains('clicked');
        refresh();

        if (!categoryIsClicked) {
          categoriesDOM[i].classList.add('clicked');
          budgetTransactions.classList.remove('closed');

          categoriesPie.forEach((item) => {
            let itemThatIsNotClicked = !item.classList.contains(categoriesDOM[i].id);
            if (itemThatIsNotClicked) {
              item.style.opacity = '0.3';
            } else {
              let ourItem = categoriesCategorize()[i];

              categoriesSumList.forEach((sum) => {

                if (item.classList.contains(sum.category)) {
                  budgetTransactionsHeader.innerHTML = `
                  <div class="budget-transactions__header row-1">
                    <div class="budget-transactions__header-left">
                      <div class="transactions-sum">
                        <p>${sum.category}: ${sum.amount}</p>
                      </div>
                      <div class="transactions-number">
                        <p>Transactions: ${ourItem.length}</p>
                      </div>
                    </div>
                    <div class="budget-transactions__header-right">
                      <div class="transactions-sort">
                        <button class="button sort-button">Sort</button>
                        <form class="form-sort closed">
                          <fieldset>
                            <div>
                              <input type="radio" id="chronology" name="sortMethod" value="chronology" checked/>
                              <label for="chronology">In chronological order</label>
                            </div>
                            <div>
                              <input type="radio" id="amountUp" name="sortMethod" value="amountUp"/>
                              <label for="amountUp">Amount (Ascending)</label>
                            </div>
                            <div>
                              <input type="radio" id="amountDown" name="sortMethod" value="amountDown"/>
                              <label for="amountDown">Amount (Descending)</label>
                            </div>
                            <div>
                              <input type="radio" id="dateUp" name="sortMethod" value="dateUp"/>
                              <label for="dateUp">Date (Ascending)</label>
                            </div>
                            <div>
                              <input type="radio" id="dateDown" name="sortMethod" value="dateDown"/>
                              <label for="dateDown">Date (Descending)</label>
                            </div>
                          </fieldset>
                          <button type="button" class="button apply-button">Apply</button>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div class="budget-transactions__header row-2">
                    <div>Number</div>
                    <div>Amount</div>
                    <div>Date</div>
                    <div>Comment</div>
                    <div>Edit</div>
                  </div>
                  `;
                }
              });

              for (let i = 0; i < ourItem.length; i++) {
                let transaction = document.createElement('div');
                transaction.className = 'transaction';
                transaction.innerHTML = `
                  <div class="transaction-number">${i + 1}</div>
                  <div class="transaction-amount">Amount: ${ourItem[i].amount}</div>
                  <div class="transaction-date">Date: ${ourItem[i].date}</div>
                  <div class="transaction-comment">Comment: ${ourItem[i].comment}</div>
                  <div class="transaction-delete">
                    <button class="delete-button">Delete</button>
                  </div>
                `;
                budgetTransactionsList.appendChild(transaction);
              }

              budgetTransactions.classList.remove('closed');
            }
          });

          if (budgetTransactionsList.innerHTML === '') {
            budgetTransactionsList.innerHTML = `<p class="budget-transactions__list-empty">No transactions!</p>`;
          }

          // sort
          const sortButton = document.querySelector('.sort-button');

          sortButton.addEventListener('click', () => {
            const sortWindow = document.querySelector('.form-sort'),
            sortMethodList = sortWindow.querySelectorAll('input'),
            applyButton = sortWindow.querySelector('.apply-button');
            
            sortWindow.classList.remove('closed');

            let sortMethod = '';

            applyButton.addEventListener('click', () => {
              sortMethodList.forEach((method) => {
                if (method.checked) {
                  sortMethod = method.value;
                }
              });

              let sortArr = categoriesCategorize()[i];

              switch (sortMethod) {
                case 'chronology':
                  sortArr = categoriesCategorize()[i];
                  break;
                case 'amountUp':
                  sortArr.sort((a, b) => a.amount - b.amount);
                  break;
                case 'amountDown':
                  sortArr.sort((a, b) => a.amount - b.amount);
                  sortArr.reverse();
                  break;
                case 'dateUp':
                  sortArr.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
                  break;
                case 'dateDown':
                  sortArr.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
                  sortArr.reverse();
                  break;
              }

              budgetTransactionsList.innerHTML = '';

              for (let i = 0; i < sortArr.length; i++) {
                let transaction = document.createElement('div');
                transaction.className = 'transaction';
                transaction.innerHTML = `
                  <div class="transaction-number">${i + 1}</div>
                  <div class="transaction-amount">Amount: ${sortArr[i].amount}</div>
                  <div class="transaction-date">Date: ${sortArr[i].date}</div>
                  <div class="transaction-comment">Comment: ${sortArr[i].comment}</div>
                  <div class="transaction-delete">
                    <button class="delete-button">Delete</button>
                  </div>
                `;
                budgetTransactionsList.appendChild(transaction);
              }

              sortWindow.classList.add('closed');
            });
          });

          const transactionsPopup = document.querySelectorAll('.transaction');
          for (let j = 0; j < transactionsPopup.length; j++) {
            let deleteButton = transactionsPopup[j].querySelector('.delete-button');

            deleteButton.addEventListener('click', () => {
              let transactionsArrDel = categoriesCategorize();
              transactionsArrDel[i].splice(j, 1);
              budgetTransactions.classList.add('closed');
              localStorage.removeItem(`${transactionsType}`);
              localStorage.setItem(`${transactionsType}`, JSON.stringify(transactionsArrDel.flat()));
              notificationAlert();
              init();
            });
          }
        }
      });
    }
  }

  categoriesDOMBuild();

  let categoriesWithPercentages = getPercentages()[0];

  const getRotationData = () => { // gathers information about rotating the segments as categories
    let sum = [];

    categoriesWithPercentages.forEach((category) => {
      sum.push(parseInt(category.percentage));
    });

    sum.reverse();
    sum.shift();
    sum.reverse();

    let obj = 0,
      newArr = [];
    for (let i = 0; i < sum.length; i++) {
      obj += sum[i];
      newArr.push(obj);
    }

    return newArr;
  }

  const budgetPieCategories = document.querySelector('.budget-pie__categories');

  const categoryFill = (categories) => { // creates div element of category and puts it into html
    budgetPieCategories.innerHTML = '';
    for (let i = 0; i < categories.length; i++) {
      let category = document.createElement('div');
      category.className = `category ${categories[i].category}`;
      category.style.background = `
      conic-gradient(${categories[i].color} ${categories[i].percentage}%, transparent 0)
      `;

      let notFirstCategory = i !== 0;

      if (notFirstCategory) {
        category.style.transform = `rotate(${getRotationData()[i - 1] * 3.6}deg)`;
      }
      budgetPieCategories.appendChild(category);
    }
  }

  const addTransactionPopup = document.querySelector('.add-transaction-popup'),
    addTransactionCategorySelect = addTransactionPopup.querySelector('#categorySelect');

  const popupBuild = (categories) => { // creates the popup to add transaction
    addTransactionCategorySelect.innerHTML = '';
    if (categoriesArr) {
      categories.forEach((category) => {
        let option = document.createElement('option');
        option.value = `${category}`;
        option.innerHTML = `${category}`;
        addTransactionCategorySelect.appendChild(option);
      });
    }
  }

  popupBuild(categoriesArr);
  categoryFill(categoriesWithPercentages);

  const closeAllWindows = (addData) => {
    categoriesSelectionPopup.classList.add('closed');
    addTransactionPopup.classList.add('closed');
    if (addData) addTransactionPopup.classList.remove('closed');
    budgetTransactionsList.innerHTML = '';
    budgetTransactionsHeader.innerHTML = '';
    budgetPieCategories.querySelectorAll('.category').forEach((category) => category.style.opacity = '');
    categoriesDOM.forEach((category) => category.classList.remove('clicked'));
  }

  const addDataButton = document.querySelector('.budget-add button');

  addDataButton.onclick = () => {
    if (categoriesArr[1]) {
      closeAllWindows(true);
      addTransactionPopup.querySelectorAll('input').forEach((item) => item.value = '');
      const cancelButton = document.querySelector('.category-cancel');
      cancelButton.addEventListener('click', () => {
        addTransactionPopup.classList.add('closed');
      });
    } else {
      alert('Choose your categories first!');
    }
  }

  const dataSubmitButton = document.querySelector('.category-submit button');

  dataSubmitButton.onclick = () => {
    let categoryInput = addTransactionCategorySelect.value,
      amountInput = parseInt(addTransactionPopup.querySelector('.category-value input').value),
      commentInput = addTransactionPopup.querySelector('.category-info input').value,
      dateInput = addTransactionPopup.querySelector('.category-date input').value;

    if (amountInput > 0 && dateInput) {
      let newData = {
        category: categoryInput,
        amount: amountInput,
        date: dateInput,
        comment: commentInput ? commentInput : 'No comment'
      };

      transactionsArr.push(newData);
      console.log(newData);
      localStorage.removeItem(`${transactionsType}`);
      localStorage.setItem(`${transactionsType}`, JSON.stringify(transactionsArr));
      categoriesList.innerHTML = '';
      addTransactionPopup.classList.toggle('closed');
      notificationAlert(true);
      init();
    } else {
      alert('Fill the value and date');
    }
  }
}

init();