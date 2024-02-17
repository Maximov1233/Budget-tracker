import { transactionsArr as dataArr, categoriesData, getCategoryColor, checkAvailability } from "./data.js";

// if (!localStorage.transactions) localStorage.setItem('transactions', JSON.stringify(dataArr));

const init = () => {

  let transactionsArr = JSON.parse(localStorage.getItem('transactions')) || [];

  const addCategoryButton = document.querySelector('.budget-menu__add button');

  const categoriesSelectionPopup = document.querySelector('.categories-selection-popup'),
    categoriesSelectionList = categoriesSelectionPopup.querySelector('.categories-selection__list'),
    categoriesSelectionButton = categoriesSelectionPopup.querySelector('.categories-selection__button button');

  let categoriesArr = JSON.parse(localStorage.getItem('categories')) || [];

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
        // console.log(someObj);
        outerArr.push(someObj);
      }
      localStorage.setItem('sums', JSON.stringify(outerArr.flat()));
      console.log(outerArr.flat());
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

  const biggestAmount = (arr) => {
    let amount = 0;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].amount > amount) amount = arr[i].amount;
    }

    return amount;
  }

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
      finalArr.forEach((data) => {
        let theBiggestAmountOfCategories = data.amount === biggestAmount(finalArr);
        if (theBiggestAmountOfCategories) {
          data.percentage += remainingPercentage;
        }
      });
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

  addCategoryButton.onclick = () => {
    if (categoriesSelectionPopup.classList.contains('closed')) {
      categoriesSelectionPopup.classList.toggle('closed');
      categoriesSelectionList.innerHTML = '';
      categoriesList.innerHTML = '';
      categoriesData.forEach((category) => {
        let categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `
          <p>${category}</p>
          <input type="checkbox" id="${category}">
          `;
        categoriesSelectionList.appendChild(categoryDiv);
      });

      let selections = categoriesSelectionList.querySelectorAll('.category');

      selections.forEach((selection) => {
        if (checkAvailability(categoriesArr, selection.querySelector('p').innerHTML)) {
          selection.querySelector('input').setAttribute('checked', '');
        }
      });

      categoriesSelectionButton.addEventListener('click', () => {
        const inputs = categoriesSelectionList.querySelectorAll('.category input');

        let categoriesArray = [];
        inputs.forEach((input) => {
          if (input.checked) categoriesArray.push(input.id);
        });

        localStorage.setItem('categories', JSON.stringify(categoriesArray));
        categoriesListFill(categoriesArray);
        popupBuild(categoriesArray);
        categoriesSelectionPopup.classList.add('closed');
        init();
      });
    }
  }

  const nameOfMonthUS = new Intl.DateTimeFormat('en-US', { // writes the current date
    dateStyle: 'medium'
  }).format(new Date());

  const budgetDate = document.querySelector('.budget-pie__date p'); // inserting current date into the circle
  budgetDate.innerHTML = nameOfMonthUS;
  const budgetExpenses = budgetDate.nextSibling.nextSibling;
  budgetExpenses.innerHTML = `Total expenses: ${getPercentages()[1]}`;

  const sortByAmount = (arr) => {
    let lowestAmount,
      arrCopy = arr,
      arrSend = [];

    // console.log(arrCopy);

    const sortingFunc = () => {
      for (let i = 0; i < arrCopy.length; i++) {
        if (arrCopy[i].amount < lowestAmount || lowestAmount === undefined) {
          lowestAmount = arrCopy[i].amount;
          break;
        }
      }

      for (let j = 0; j < arrCopy.length; j++) {
        if (arrCopy[j].amount === lowestAmount) {
          arrSend.push(arrCopy[j]);
          arrCopy.splice(j, 1);
          break;
        }
      }
    }

    for (let z = 0; z < arr.length; z++) {
      console.log(arrCopy.length);
      if (arrCopy.length > 0) sortingFunc();
    }
    // console.log(arrCopy);
    console.log(arrSend);
    return arrSend;
  }

  const categoriesDOM = categoriesList.querySelectorAll('li'),
    categoryPopup = document.querySelector('.category-popup'),
    // categoryPopupList = categoryPopup.querySelector('.category-popup__list'),
    budgetTransactions = document.querySelector('.budget-transactions'),
    budgetTransactionsList = budgetTransactions.querySelector('.budget-transactions__list'),
    budgetTransactionsSum = budgetTransactions.querySelector('.budget-transactions__sum p');

  const categoriesDOMBuild = () => {
    for (let i = 0; i < categoriesDOM.length; i++) { // tracks the click and sets the font-size and opacity of pie elements
      categoriesDOM[i].addEventListener('click', () => {
        budgetTransactions.className = 'budget-transactions closed';
        let categoriesSumList = JSON.parse(localStorage.getItem('sums'));
        
        

        const categoriesPie = document.querySelectorAll('.category');

        const refresh = () => {
          budgetTransactions.classList.add('closed');
          budgetTransactionsList.innerHTML = '';
          budgetTransactionsSum.innerHTML = '';
          categoriesPie.forEach((item) => item.style.opacity = '1');
          // categoryPopup.classList.add('closed');
          // categoryPopupList.innerHTML = '';
          categoriesDOM.forEach((category) => {
            category.classList.remove('clicked');
            // category.style.borderBottom = 'none';
            // category.style.fontSize = '18px';
            // category.style.fontWeight = '400';
          });
        }

        let categoryIsClicked = categoriesDOM[i].classList.contains('clicked');
        refresh();

        if (!categoryIsClicked) {
          categoriesDOM[i].classList.add('clicked');
          // categoriesDOM[i].style.borderBottom = '3px solid #3544CF';
          // categoriesDOM[i].style.fontSize = '20px';
          // categoriesDOM[i].style.fontWeight = 'Bold';

          budgetTransactions.classList.remove('closed');

          categoriesPie.forEach((item) => {
            let itemThatIsNotClicked = !item.classList.contains(categoriesDOM[i].id);
            if (itemThatIsNotClicked) {
              item.style.opacity = '0.3';
            } else {
              categoriesSumList.forEach((sum) => {

                if (item.classList.contains(sum.category)) {
                  budgetTransactionsSum.innerHTML = `${sum.category}: ${sum.amount}`;
                }
              });

              let ourItem = categoriesCategorize()[i];
              
              ourItem.forEach((item) => {
                let transaction = document.createElement('div');
                transaction.className = `transaction`;
                transaction.innerHTML = `
                  <div class="transaction-amount">Amount: ${item.amount}</div>
                  <div class="transaction-date">Date: ${item.date}</div>
                  <div class="transaction-comment">Comment: ${item.comment}</div>
                  <div class="transaction-delete">
                    <button type="submit">Delete</button>
                  </div>
                `;
                budgetTransactionsList.appendChild(transaction);
              });
              budgetTransactions.classList.remove('closed')
              // budgetTransactions.appendChild(budgetTransactionsList);
              // categoryPopup.classList.remove('closed');
            }
          });


          // const categoryPopupSort = categoryPopup.querySelector('.category-popup__sort'),
          //   categoryPopupSortButton = categoryPopupSort.querySelector('button');

          // categoryPopupSortButton.addEventListener('click', () => {
          //   const sortKind = categoryPopupSort.querySelector('select').value;
          //   if (sortKind === 'amount') {
          //     let bizdinItem = categoriesCategorize()[i];
          //     console.log(bizdinItem);
          //     let sendingItem = bizdinItem;
          //     console.log(sendingItem);
          //     let sortedArr = sortByAmount(sendingItem);
          //     console.log(sortedArr);
          //   }
          // });

          const transactionsPopup = document.querySelectorAll('.transaction');
          for (let j = 0; j < transactionsPopup.length; j++) {
            let deleteButton = transactionsPopup[j].querySelector('button');

            deleteButton.addEventListener('click', () => {
              let transactionsArrDel = categoriesCategorize();
              transactionsArrDel[i].splice(j, 1);
              budgetTransactions.classList.add('closed');

              console.log(transactionsArrDel.flat());

              localStorage.removeItem('transactions');
              localStorage.setItem('transactions', JSON.stringify(transactionsArrDel.flat()));
              // categoryPopup.classList.add('closed');
              alert('Transaction has been deleted');
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

  const addDataButton = document.querySelector('.budget-add button');

  addDataButton.onclick = () => {
    if (categoriesArr[1]) {
      addTransactionPopup.classList.toggle('closed');
      budgetTransactions.className = 'budget-transactions closed';
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
      localStorage.removeItem('transactions');
      localStorage.setItem('transactions', JSON.stringify(transactionsArr));
      categoriesList.innerHTML = '';
      addTransactionPopup.classList.toggle('closed');
      alert('Transaction has been added');
      init();
    } else {
      alert('Fill the amount and date');
    }
  }
}

init();