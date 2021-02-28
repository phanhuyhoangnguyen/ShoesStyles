//return different array from the sampe source array but different start value (current page and product per page)
//when change on pagnition, it triggers change automatically on start value -> products returned is updated
app.filter("offset", function () {
    return function (input, start) {
        if (input != null) {
            //check this error handling, this might cause error
            start = parseInt(start, 10); //take string and return integer with numeral system is 10

            //take the rest of “input” array start from “start” index and return as new array
            return input.slice(start);
        } else return input;
    };
});

app.filter("checkboxFilter", function () {
    return function (productsArray, valuesSelectedArray, filterType, scope) {
        var matchedProducts = [];
        //if there is a selected brand
        if (valuesSelectedArray.length > 0) {
            productsArray.forEach(function (product) {
                var valuesInItem = product[filterType]; //now it is not normal array, it's firebase format
                if (hasElements(valuesInItem, valuesSelectedArray)) {
                    matchedProducts.push(product);
                }
            });
        } else { //none value to be filtered, return all the products
            matchedProducts = productsArray;
        }
        //update with scope shoes display array
        scope.shoesDisplayArray = matchedProducts;
        //take the rest of “input” array start from “start” index and return as new array
        return matchedProducts;
    };
});

app.filter("rangeFilter", function () { //this cause error
    return function (productsArray, startValue, endValue, scope) {
        var matchedProducts = [];
        if (startValue == "") {
            scope.minPrice = 0;
        }
        if (endValue == "" || endValue == 0 || endValue == null) {
            productsArray.forEach(function (product) {
                if (product.price >= startValue) {
                    matchedProducts.push(product);
                }
            });
        } else { //end value is empty, doesn't take part in comparision
            productsArray.forEach(function (product) {
                if (product.price >= startValue && product.price <= endValue) {
                    matchedProducts.push(product);
                }
            });
        }

        //update with scope shoes display array for paginition
        scope.shoesDisplayArray = matchedProducts;
        //take the rest of “input” array start from “start” index and return as new array
        return matchedProducts;
    };
});

app.filter("textFilter", function () {
    return function (productsArray, keyword) {
        var matchedProducts = [];
        if (keyword != null && keyword != "") {
            productsArray.forEach(function (product) {
                if (product.name.toLowerCase().includes(keyword.toLowerCase())) {
                    matchedProducts.push(product);
                }
            });
        }
        return matchedProducts;
    };
});