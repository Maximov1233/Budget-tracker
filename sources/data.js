// data of transactions

export let transactionsArr = [
    {
        category: 'Shopping',
        amount: 5000,
        date: '10/08/2023',
        comment: ''
    },
    {
        category: 'Maintenance',
        amount: 1000,
        date: '11/08/2023',
        comment: ''
    },
    {
        category: 'Groceries',
        amount: 4000,
        date: '12/08/2023',
        comment: ''
    },
    // {
    //     category: 'Mortgage',
    //     amount: 10000,
    //     date: '13/08/2023',
    //     comment: ''
    // },
]



// export transactionsArr as arr;

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