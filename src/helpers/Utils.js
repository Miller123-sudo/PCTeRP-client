const formatNumber = number => {
    //return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(number);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(number);
}

const findInitLetters = (...value) => {
    let initLetters = "";
    value.map(val => (initLetters += val.charAt(0).toUpperCase()));
    return initLetters;
}


export { formatNumber, findInitLetters };
