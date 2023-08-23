import { transactionsArr as dataArr, findCategories } from "./data.js";

if (!localStorage.transactions) localStorage.setItem('transactions', JSON.stringify(dataArr));

let transactionsArr = JSON.parse(localStorage.getItem('transactions'));

// console.log(JSON.parse(hui));

const init = () => {
  
  let categoriesArr = findCategories();

  const categorizeFunc = () => { // creates subarrays into other array with same types of categories
    let outerArr = [];

    for (let i = 0; i < categoriesArr.length; i++) {
      let subArr = [];
      for (let j = 0; j < transactionsArr.length; j++) {
        let transactionMatchesCategory = transactionsArr[j].category === categoriesArr[i];
        if (transactionMatchesCategory) {
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
        let theBiggestAmountOfCategories = data.amount === biggestAmount(finalArr);
        if (theBiggestAmountOfCategories) {
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

  const categoriesDOM = categoriesList.querySelectorAll('li');

  const categoryPopup = document.querySelector('.category-popup');

  const categoriesDOMBuild = () => {
    for (let i = 0; i < categoriesDOM.length; i++) { // tracks the click and sets the font-size and opacity of pie elements
      categoriesDOM[i].addEventListener('click', () => {
        const categoriesPie = document.querySelectorAll('.category');

        const refresh = () => {
          categoriesPie.forEach((item) => item.style.opacity = '1');
          categoriesDOM.forEach((category) => {
            category.classList.remove('clicked');
            category.style.fontSize = '18px';
            categoryPopup.classList.add('closed');
            categoryPopup.innerHTML = ''; 
          });
        }

        let categoryIsClicked = categoriesDOM[i].classList.contains('clicked');

        if (categoryIsClicked) {
          refresh();
        } else {
          refresh();
          
          categoriesDOM[i].classList.add('clicked');
          categoriesDOM[i].style.fontSize = '20px';

          // console.log(categorizedArr[i]);
          categoriesPie.forEach((item) => {
            let itemNotClicked = !item.classList.contains(categoriesDOM[i].id);
            if (itemNotClicked) {
              item.style.opacity = '0.3';
            } else {
              let ourItem = categorizeFunc()[i];
              console.log(ourItem);

              ourItem.forEach((item) => {
                let transaction = document.createElement('div');
                transaction.className = 'transaction';
                transaction.innerHTML = `
                  <div class="transaction-category">Category: ${item.category}</div>
                  <div class="transaction-amount">Amount: ${item.amount}</div>
                  <div class="transaction-date">Date: ${item.date}</div>
                  <div class="transaction-comment">Comment: ${item.comment}</div>
                `;
                categoryPopup.classList.remove('closed');
                categoryPopup.appendChild(transaction);
              });
              
              // categorizeFunc().forEach((item) => {
              //   console.log(item);
              //   item.forEach((subItem) => {
              //     if (subItem.category === categoriesDOM[i].id) return item;
              //   });
                // if (categoriesDOM[i].id === item.category) console.log(item);
              // });
            }
          });
        }
      });
    }
  }

  categoriesDOMBuild();

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