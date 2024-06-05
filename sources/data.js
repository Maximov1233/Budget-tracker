export const ExpensesCategoriesData = ['Shopping', 'Maintenance', 'Groceries', 'Leisure', 'Mortgage', 'Rent'];
export const IncomesCategoriesData = ['Salary', 'Transfers', 'ROI', 'Other'];

export const getCategoryColor = (category) => {
      switch (category) {
        case 'Shopping':
        case 'Salary':
          return 'green';
        case 'Maintenance':
        case 'Transfers':
          return 'red';
        case 'Groceries':
        case 'ROI':
          return 'blue';
        case 'Leisure':
        case 'Other':
          return 'yellow';  
        case 'Mortgage':
          return 'violet';
        case 'Rent':
          return 'black';  
      }
    }
    
export const checkAvailability = (arr, val) => {
    return arr.some((arrVal) => val === arrVal);
}

export const findCategories = () => {
    let categoriesArr = [];

    transactionsArr.forEach((data) => {
        if (!checkAvailability(categoriesArr, data.category)) {
            categoriesArr.push(data.category);
        };
    });

    return categoriesArr;
}