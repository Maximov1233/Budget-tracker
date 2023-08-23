import {transactionsArr as dataArr, findCategories} from "./data.js";

if (!localStorage.transactions) localStorage.setItem('transactions', JSON.stringify(dataArr));
// findCategories();

let transactionsArr = JSON.parse(localStorage.getItem('transactions'));

// console.log(JSON.parse(hui));

const init = () => {
  let categoriesArr = findCategories();

  const categorizeFunc = () => { // creates subarrays into other array with same types of categories
    let outerArr = [];
    for (let i = 0; i < categoriesArr.length; i++) {
      let subArr = [];
      for (let j = 0; j < transactionsArr.length; j++) {
        if (transactionsArr[j].category === categoriesArr[i]) {
          subArr.push(transactionsArr[j]);
        }
      }
      outerArr.push(subArr);
    }

    return outerArr;
  }

  let categorizedArr = categorizeFunc();

  const nameOfMonthUS = new Intl.DateTimeFormat('en-US', { // writes the current date
    dateStyle: 'medium'
  }).format(new Date());

  const budgetDate = document.querySelector('.budget-pie__date p');
  budgetDate.innerHTML = nameOfMonthUS;

  const budgetPieCategories = document.querySelector('.budget-pie__categories');

  const addPopup = document.querySelector('.add-popup'),
    addCategorySelect = addPopup.querySelector('#categorySelect');

  const categoriesSum = (arr) => { // new summarize of categories (dynamic)
    let outerArr = [];
    for (let i = 0; i < arr.length; i++) {
      let someObj = {};
      someObj.amount = 0;
      for (let j = 0; j < arr[i].length; j++) {
        someObj.category = arr[i][j].category;
        someObj.amount += arr[i][j].amount;
      }
      outerArr.push(someObj);
    }
    return outerArr.flat();
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Shopping':
        return 'green';
      case 'Maintenance':
        return 'red';
      case 'Groceries':
        return 'blue';
      case 'Mortgage':
        return 'violet';
    }
  }

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
      data.percentage = Math.round(data.amount / sum * 100);
      data.color = getCategoryColor(data.category);
    });

    let checkPercentage = 0;

    finalArr.forEach((data) => {
      checkPercentage += data.percentage;
    });

    if (checkPercentage !== 100) {
      let remainingPercentage = 100 - checkPercentage;
      finalArr.forEach((data) => {
        if (data.amount === biggestAmount(finalArr)) {
          data.percentage += remainingPercentage;
        }
      });
    }

    return finalArr;
  }

  const categoriesList = document.querySelector('.budget-list ul');

  categoriesArr.forEach((category) => { // creates the list of categories to left of chart
    let arr = getPercentages(),
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

  let categories = getPercentages();

  const getRotationData = () => { // gathers information about rotating the segments as categories
    let sum = [];

    categories.forEach((category) => {
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

  const categoryFill = (categories) => { // creates div element of category and puts it into html
    for (let i = 0; i < categories.length; i++) {
      let category = document.createElement('div');
      category.className = 'category';
      category.style.background = `
      conic-gradient(${categories[i].color} ${categories[i].percentage}%, transparent 0)
      `;
      if (i !== 0) {
        category.style.transform = `rotate(${getRotationData()[i - 1] * 3.6}deg)`;
      }
      budgetPieCategories.appendChild(category);
    }
  }

  const popupBuild = (categories) => { // creates the popup to add transaction
    categories.forEach((category) => {
      let option = document.createElement('option');
      option.value = `${category.category}`;
      option.innerHTML = `${category.category}`;
      addCategorySelect.appendChild(option);
    });
  }

  categoryFill(categories);
  popupBuild(categories);

  const addDataButton = document.querySelector('.budget-add button');

  addDataButton.addEventListener('click', () => {
    addPopup.classList.toggle('closed');
  });

  const dataSubmitButton = document.querySelector('.category-submit button');

  dataSubmitButton.addEventListener('click', () => {
    let categoryInput = addCategorySelect.value,
      amountInput = parseInt(addPopup.querySelector('.category-value input').value),
      commentInput = addPopup.querySelector('.category-info input').value;

    if (commentInput === '') commentInput = 'No comment';

    let newTime = new Intl.DateTimeFormat('en-UK', { // writes the current date
      dateStyle: 'short'
    }).format(new Date());

    console.log(newTime);

    if (amountInput) {
      let newData = {
        category: categoryInput,
        amount: amountInput,
        date: newTime,
        comment: commentInput
      };
      transactionsArr.push(newData);
      localStorage.removeItem('transactions');
      localStorage.setItem('transactions', JSON.stringify(transactionsArr));
      categoriesList.innerHTML = '';
      addPopup.classList.toggle('closed');
      alert('Transaction has been added');
      init();
    } else {
      alert('Fill the amount');
    }
  });
}

init();