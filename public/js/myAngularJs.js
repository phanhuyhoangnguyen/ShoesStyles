//AngularJs Script
var app = angular.module("myApp", ["ngRoute", "firebase", 'ui.bootstrap', 'ngAnimate', 'ngSanitize', 'ngCookies']);
var url = "data/shoes-data.txt";

app.factory("productDataFullArray", ["$firebaseArray",
    function ($firebaseArray) {
        // create a reference to the database where we will store our data
        var ref = firebase.database().ref("shoesDb");
        //return synchronized collection, real-time changing
        return $firebaseArray(ref);
    }
]);

// create a re-usable factory that generates the $firebaseAuth instance
app.factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
        return $firebaseAuth();
    }
]);

app.run(function ($rootScope, $firebaseArray, productDataFullArray, Auth, $cookies, $location) {

    $rootScope.productDataFullArray = productDataFullArray;

    $rootScope.clearSearch = function (scope) {
        scope.textSearch = "";
    }
    $rootScope.currentPageLocation = "";

    firebase.auth().onAuthStateChanged(function (firebaseUser) {
        if (firebaseUser) {
            $rootScope.firebaseUser = firebaseUser;
            console.log("User is Signed");
        } else {
            console.log("No one is signed", $rootScope.isLogged);
        }
    });

    $rootScope.signOut = function () {
        firebase.auth().signOut().then(function () {
            $rootScope.$apply(function () {
                $rootScope.firebaseUser = null;
            });
        }).catch(function (error) {
            console.log(error);
        });
    }

    $rootScope.cart = {
        items: [],
        totalPrice: 0
    }

    if ($cookies.getObject('cart') != null) {
        $rootScope.cart = $cookies.getObject('cart'); //get number item in the carts before the page is reloading
    }

    $rootScope.addItemToCart = function (item) {
        var index = findIndex($rootScope.cart.items, item);
        if (index > -1) {
            $rootScope.cart.items[index]['quanitySelected'] += item.quanitySelected; //increase quanity
        } else {
            $rootScope.cart.items.push(item);
        }
        $rootScope.saveCartForReload();
    }

    $rootScope.saveCartForReload = function () {
        $cookies.putObject('cart', $rootScope.cart); //save data incase page is reload
    }

    $rootScope.removeItemInCart = function (index) {
        $rootScope.cart.items.splice(index, 1);
        $rootScope.saveCartForReload();
    }

    $rootScope.navigateUserTo = function (destination) {
        $location.path(destination);
    }

    $rootScope.updateCurrentPageLocation = function (page) {
        $rootScope.currentPageLocation = page;
    }

    //this function is triggered automatically when an items in cart changed, defaultly invoked by AngularJs binding between items obj and cart obj
    $rootScope.totalPriceInCart = function () {
        var total = 0;
        angular.forEach($rootScope.cart.items, function (itemObj) {
            total += itemObj.price * itemObj.quanitySelected;
        });
        //update total price based on the items in itself                            
        $rootScope.cart.totalPrice = total;
        $rootScope.saveCartForReload();
        return total;
    }

    $rootScope.clearCart = function () {
        $rootScope.cart.items = [];
        totalPrice = 0;
        $rootScope.saveCartForReload();
    }

    $rootScope.$on("$routeChangeError", function (event, next, previous, error) {
        // catch the error thrown when the $requireSignIn promise is rejected
        // and redirect the user back to the login page
        if (error === "AUTH_REQUIRED") {
            $location.path("/login");
        }
    });
});

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when("/", {
            templateUrl: "resources/template/main.html",
            controller: "mainCtrl"
        })
        .when("/page/:nameIndex*", {
            templateUrl: function (urlArr) {
                return "resources/template/" + urlArr.nameIndex + '.html';
            },
            controller: "pageCtrl"
        })
        .when("/product/:productId", {
            templateUrl: "resources/template/product.html",
            controller: "productCtrl"
        })
        .when("/login", {
            templateUrl: "resources/template/login.html",
            controller: "loginCtrl"
        })
        .when("/register", {
            templateUrl: "resources/template/register.html",
            controller: "registerCtrl"
        })
        .when("/shoppingcart", {
            templateUrl: "resources/template/shoppingcart.html",
            controller: "shoppingcartCtrl"
        })
        .when("/checkout", {
            templateUrl: "resources/template/checkout.html",
            controller: "checkoutCtrl",
            resolve: {
                // controller will not be loaded until $requireSignIn resolves
                // Auth refers to our $firebaseAuth wrapper in the factory below
                "currentAuth": ["Auth", function (Auth) {
                    // $requireSignIn returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $routeChangeError (see above)
                    return Auth.$requireSignIn();
                }]
            }
        })
        .otherwise({
            template: "<h1>Error!</h1><p>Invalid Path. Page doesn't existed!</p>"
        });
});

app.controller("mainCtrl", function ($scope, Auth) {
    var numberProductsDisplayed = 6;
    $scope.updateCurrentPageLocation('main');
    // $scope.bannerArray = response.data.banner;
    $scope.productDataFullArray.$loaded()
        .then(function () {
            if ($scope.productDataFullArray.length >= numberProductsDisplayed) {
                $scope.shoesDisplayArray = $scope.productDataFullArray.slice(0, numberProductsDisplayed);
            }
        })
        .catch(function (err) {
            console.error(err);
        });
});

app.controller("pageCtrl", function ($scope, $routeParams) {
    $scope.updateCurrentPageLocation($routeParams.nameIndex);
    $scope.selectedSort = 'name';

    //--------html filter elements Creation:--------
    $scope.sortByAvailableObj = {
        "Most Popular": "-sold",
        "Newest": "-dateAdded",
        "Product Name": "name",
        "Price: Low To High": "price",
        "Price: High To Low": "-price"
    };

    $scope.brandAvailable = ['nike', 'adidas', 'puma', 'nb'];
    $scope.brandsSelectedArray = [];

    $scope.minPrice = 0;
    $scope.maxPrice = 1000;

    $scope.sizeAvailable = ['7', '8', '9', '10', '11', '12', '13', '14'];
    $scope.sizesSelectedArray = [];

    $scope.colourAvailable = ['black', 'white', 'yellow', 'red'];
    $scope.coloursSelectedArray = [];

    $scope.genderArray = ['men', 'women', 'unisex'];
    $scope.gendersSelectedArray = [];

    //list is the brandsSelectedArray that defined by newArrivals
    //toggle function is responsible for adding brands to be filted
    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) { //check if item is already in the list
            list.splice(idx, 1); //if there is item, delete this item at its index - equal to uncheck
        } else {
            list.push(item); //else if there is none item, add it to array
        }
    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.clearFilters = function () {
        $scope.brandsSelectedArray = [];
        $scope.sizesSelectedArray = [];
        $scope.coloursSelectedArray = [];
        $scope.gendersSelectedArray = [];
        $scope.minPrice = "";
        $scope.maxPrice = "";
    };

    //--------Pagnition:--------
    $scope.productsPerPage = 12;
    $scope.currentPageIndex = 0;

    // Controller – Page Control Methods
    $scope.prevPageDisabled = function () {
        return $scope.currentPageIndex === 0 ? "disabled" : ""; //return disabled value when current page is at start
    };

    $scope.prevPage = function () {
        if ($scope.currentPageIndex > 0) {
            $scope.currentPageIndex--;
        }
    };

    $scope.pageCount = function () {
        if ($scope.shoesDisplayArray != null) {
            return Math.ceil($scope.shoesDisplayArray.length / $scope.productsPerPage) - 1; //to match with array index start with 0
        } else {
            return 0;
        }
    };

    //page range according to current page: calculate each time page load
    $scope.range = function () {
        var pageIndexAvailable = [];
        var rangePageIndexSize;

        if ($scope.pageCount() >= 3) {
            rangePageIndexSize = 3; //Size of navigation option
        } else {
            rangePageIndexSize = $scope.pageCount();
        }

        var start = $scope.currentPageIndex;
        if (start >= $scope.pageCount() - rangePageIndexSize) {
            start = $scope.pageCount() - rangePageIndexSize + 1;
        }
        // -1 to sync with index array of shoesDisplayArray
        for (var i = start - 1; i < start + rangePageIndexSize; i++) {
            pageIndexAvailable.push(i);
        }
        return pageIndexAvailable;
    };

    $scope.setPage = function (n) {
        $scope.currentPageIndex = n;
    };

    $scope.nextPageDisabled = function () {
        return $scope.currentPageIndex === $scope.pageCount() ? "disabled" : "";
    };

    $scope.nextPage = function () {
        if ($scope.currentPageIndex < $scope.pageCount()) {
            $scope.currentPageIndex++;
        }
    };
});

app.controller("productCtrl", function ($scope, $routeParams, $firebaseArray, $firebaseObject, $uibModal) {
    $scope.updateCurrentPageLocation('Products');

    //retrive the current view product
    var ref = firebase.database().ref("shoesDb").child($routeParams.productId)
    $scope.productDisplay = $firebaseObject(ref);

    var ref = firebase.database().ref("reviewDb").child($routeParams.productId)
    $scope.reviews = $firebaseArray(ref);

    $scope.addNewReview = function (review) {
        // $add on a synchronized array is like Array.push() except it saves to the database!
        var date = new Date();
        $scope.reviews.$add({
            username: $scope.firebaseUser.displayName,
            userreview: review,
            rating: $scope.ratingValue,
            reviewtime: date.getTime(),
            userid: $scope.firebaseUser.uid
        })
        //clear input box and rating
        $scope.reviewInput = "";
        $scope.ratingValue = 0;
    };

    $scope.alerts = [];

    var newItem;

    $scope.addItem = function (item) {
        $scope.alerts.push({
            msg: 'Cart is updated!'
        });
        item.colourSelected = $scope.colourSelected;
        item.sizeSelected = $scope.sizeSelected;
        item.quanitySelected = $scope.quanitySelected;
        newItem = angular.copy(item);
        $scope.addItemToCart(newItem);
    };

    $scope.closeAlert = function (index) {
        $scope.alerts.splice(index, 1);
    };

    $scope.maxRating = 5;
    var ratingLabel = ["Terrible!", "Poor!", "Acceptable!", "Great!", "Love It!"]; //index array associate with rating scale

    //function to update label
    $scope.hoveringOver = function (value) {
        $scope.ratingValHover = value; //this ratingValHover will updated when hovering
        $scope.ratingLabel = ratingLabel[value - 1];
    };

    //function displaying the rating lable after mouse is left
    $scope.displayRatingValue = function () {
        $scope.ratingValHover = 0;
        if ($scope.ratingValue != 0) { //after selecting value, the label will be saved
            $scope.ratingLabel = ratingLabel[$scope.ratingValue - 1];
        }
    };

    $scope.actionsGranted = [];

    $scope.reportModal = {
        title: "Report User's Comment",
        body: "Please Fill the box below: ",
        action: "Report",
        okButtonEnabled: true,
        cancelButtonEnabled: true,
        inputBoxEnabled: true
    };

    $scope.deleteModal = {
        title: "Review Delete Confirmation",
        body: "Are you sure want to delete this?",
        action: "OK",
        okButtonEnabled: true,
        cancelButtonEnabled: true,
        inputBoxEnabled: false
    };

    $scope.toggled = function (review) {
        if ($scope.firebaseUser.uid == review.userid) { //if authorized user will be provided function to delete
            $scope.actionsGranted = [{
                    name: "edit",
                    function: function (reviewPara, reviewIndex) {
                        $scope.editReviewHandling(reviewPara, reviewIndex);
                    }
                },
                {
                    name: "delete",
                    function: function (reviewPara, reviewIndex) {
                        $scope.modalHandling("delete", $scope.deleteModal, reviewPara);
                    }
                }
            ];
        } else {
            $scope.actionsGranted = [{
                name: "report",
                function: function (reviewPara, reviewIndex) {
                    $scope.modalHandling("report", $scope.reportModal, reviewPara);
                }
            }];
        }
    }

    $scope.requestedBox = {}; //each review will have this object but null

    $scope.requestingBox = function (reviewIndex, reviewParam) {
        //Get existing comment value but clear reference -> static data, this for displaying in the input box
        $scope.requestedBox.index = reviewIndex;
        $scope.requestedBox.reviewContent = angular.copy(reviewParam.userreview);
        $scope.requestedBox.reivewRating = angular.copy(reviewParam.rating);
        //update the scope to tell which box is requesting
    }

    $scope.editReviewHandling = function (reviewParam, reviewIndex) {
        $scope.requestingBox(reviewIndex, reviewParam);
    }

    $scope.isOnEdit = function (reviewIndex) { //automatically updated when the $scope.requestedBox change
        return $scope.requestedBox.index == reviewIndex; //only review with requesting will have value -> show edit box
    }

    $scope.cancelEditRequest = function () {
        $scope.requestedBox = {}; //none parent is active -> hide all the input
    }

    $scope.updateEditedReview = function (review, reviewIndex) {
        //changes is occured on the array not on review object directly, update new content to object
        review.userreview = $scope.requestedBox.reviewContent;
        review.rating = $scope.requestedBox.reivewRating;
        $scope.requestedBox = {}; // requests is fullfiled -> clear the request, close box

        //update to database
        var date = new Date();
        var newReviewInfo = {
            username: $scope.firebaseUser.displayName,
            userid: $scope.firebaseUser.uid,
            userreview: review.userreview,
            rating: review.rating,
            reviewtime: date.getTime()
        };

        // Write the new report's data
        var updates = {};
        //update two data at two place in database
        updates['/reviewDb/' + $routeParams.productId + "/" + review.$id] = newReviewInfo;
        firebase.database().ref().update(updates);
    }

    $scope.deleteReview = function (reviewPara) {
        $scope.reviews.$remove(reviewPara);
    }

    $scope.reportReview = function (reviewPara, message) {
        var newReport = {
            reporter: $scope.firebaseUser.uid,
            reporteduser: reviewPara.userid,
            content: message
        };

        // Get a key generated first for a new "report" first
        var newReportUniqueKey = firebase.database().ref().child('reportDb').child($routeParams.productId).push().key;

        // Write the new report's data
        var updates = {};
        //update two data at two place in database
        updates['/reportDb/' + $routeParams.productId + "/" + newReportUniqueKey] = newReport;
        firebase.database().ref().update(updates);
    }

    //dynamic handling modal
    $scope.modalHandling = function (actionRequest, modalcontent, reviewPara) {
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: "resources/template/modal.html",
            controller: "productPageModalCtrl",
            scope: $scope,
            resolve: {
                //parameter to pass in the productPageModalCtrl
                param: function () {
                    return {
                        actionRequest: actionRequest,
                        modalcontent: modalcontent,
                        reviewPara: reviewPara
                    };
                }
            }
        })

        modalInstance.result.then(function (returnParam) {
            switch (returnParam.actionRequest) {
                case "delete":
                    $scope.deleteReview(returnParam.reviewPara);
                    break;
                case "report":
                    $scope.reportReview(returnParam.reviewPara, returnParam.message);
                    break;
            }
        }, function () {
            console.log('Modal dismissed!');
        });
    };
});

app.controller("productPageModalCtrl", function ($scope, Auth, $uibModalInstance, param) {
    $scope.modal = param.modalcontent;

    $scope.ok = function () {
        param.message = $scope.message;
        $uibModalInstance.close(param);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller("loginCtrl", function ($scope, Auth) {
    $scope.updateCurrentPageLocation('Login');

    $scope.login = function () {
        Auth.$signInWithEmailAndPassword($scope.email, $scope.password)
            .then(function (firebaseUser) {
                //redirect user
                Auth.currentUser = firebaseUser;
                $scope.navigateUserTo("/");
            }).catch(function (error) {
                console.log("Error:", error); //todo alert user to input correct password here
                $scope.errorMessage = "Account is not recorgnized!";
            });
    }
});

app.controller("registerCtrl", function ($scope, Auth) {
    $scope.updateCurrentPageLocation('Register');
    $scope.stateAvailable = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ATC", "NT"];
    $scope.checking = function (password) {
        return ($scope.passwordCF == password);
    };

    $scope.createUser = function () {
        // Create a new user
        Auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
            .then(function (firebaseUser) {
                var username = $scope.fname + " " + $scope.lname;
                $scope.createNewUser(firebaseUser.uid, username, $scope.email, $scope.password, $scope.gender, $scope.mobile, $scope.address, $scope.suburb, $scope.postCode, $scope.selectedState);
                $scope.updateUserProfile(firebaseUser, username);
                //redirect user after created
                $scope.navigateUserTo("/");
            }).catch(function (error) {
                $scope.errorMessage = error.message;
                console.log(error);
            });
    };

    // any time auth state changes, add the user data to scope
    Auth.$onAuthStateChanged(function (firebaseUser) {
        $scope.firebaseUser = firebaseUser;
        //todo: add redirect??
    });

    $scope.createNewUser = function (userId, username, email, password, gender, mobile, address, suburb, postCode, state) {
        // new post object
        var newUser = {
            username: username,
            email: email,
            password: password,
            gender: gender,
            mobile: mobile,
            address: address,
            suburb: suburb,
            postcode: postCode,
            state: state
        };

        // Write the new user's data
        var updates = {};
        updates['/usersDb/' + userId] = newUser;
        return firebase.database().ref().update(updates);
    }

    $scope.updateUserProfile = function (firebaseUser, username) {
        firebaseUser.updateProfile({
            displayName: username,
            //photoURL: "https://example.com/jane-q-user/profile.jpg"
        }).then(function () {
            console.log("Update successful");
        }).catch(function (error) {
            console.log("Error: ", error);
        });
    }
});

app.controller("shoppingcartCtrl", function ($scope, $uibModal) {

    $scope.checkLogged = function () {
        if ($scope.firebaseUser) {
            $scope.navigateUserTo("/checkout");
        } else {
            $scope.showModalRequestLogin();
        }
    }

    $scope.showModalRequestLogin = function () {
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: "resources/template/modal.html",
            controller: "shoppingcartLoginModalCtrl",
            scope: $scope
        })

        modalInstance.result.then(function (returnVal) {
            // $scope.something = selectedItem; //parent receives the value
            $scope.navigateUserTo(returnVal);
        }, function () {
            console.log('Modal dismissed!');
        });
    };
});

app.controller("shoppingcartLoginModalCtrl", function ($scope, Auth, $uibModalInstance) {

    $scope.modal = {
        title: "Login Request",
        body: "Please Login To Continue!",
        action: "Login",
        okButtonEnabled: true,
        cancelButtonEnabled: true,
        inputBoxEnabled: false
    }

    $scope.ok = function () {
        //   $uibModalInstance.close($ctrl.selected.item);  //can be used to pass value to its parent
        $uibModalInstance.close('/login');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller("checkoutCtrl", function ($scope, Auth, $uibModal) {
    $scope.updateCurrentPageLocation('Check Out');

    $scope.stateAvailable = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ATC", "NT"];

    $scope.createOrder = function () {
        var recipent = $scope.fname + " " + $scope.lname;
        //get only 4 last digits
        var endingDigits = $scope.creditcardNo.substr($scope.creditcardNo.length - 4);
        //hide the begining digits
        var hiddenCardNumber = 'xx' + endingDigits;

        var creditCard = {
            holdername: $scope.creditcardHolderName,
            number: hiddenCardNumber,
            expmonth: $scope.ccexpmonth,
            expday: $scope.ccexpyear
        }

        var items = [];
        angular.forEach($scope.cart.items, function (itemObj) {
            var item = {
                id: itemObj.$id,
                name: itemObj.name,
                colour: itemObj.colourSelected,
                quanity: itemObj.quanitySelected,
                price: itemObj.price,
                totalPrice: itemObj.price * itemObj.quanitySelected
            }
            items.push(item);
        });

        $scope.createPurchase($scope.firebaseUser, recipent, $scope.email, $scope.gender, $scope.mobile,
            $scope.address, $scope.suburb, $scope.postCode, $scope.selectedState, creditCard, items, $scope.cart.totalPrice);
    };

    $scope.createPurchase = function (user, recipent, email, gender, mobile, address, suburb, postCode, state, creditcard, items, orderprice) {
        // new purchase object
        var newPurchase = {
            recipent: recipent,
            email: email,
            gender: gender,
            mobile: mobile,
            address: address,
            suburb: suburb,
            postcode: postCode,
            state: state,
            creditcard: creditcard,
            purchasername: user.displayName,
            items: items,
            totalprice: orderprice
        };

        // Get a key generated first for a new "purchase" first
        var newPurchaseUniqueKey = firebase.database().ref().child('purchaseDb').child('inProgress').child(user.uid).push().key;

        // Write the new user's data
        var updates = {};
        //update two data at two place in database
        updates['/purchaseDb/' + 'inProgress/' + user.uid + "/" + newPurchaseUniqueKey] = newPurchase;
        firebase.database().ref().update(updates); //update/insert the purchaseDb not overwrite

        var newPurchaseRef = {
            status: 'inProgress'
        };

        updates['/usersDb/' + user.uid + '/purchase/' + newPurchaseUniqueKey] = newPurchaseRef;
        //update/insert the userDb not overwrite
        firebase.database().ref().update(updates, function (error) {
            if (error) {
                // The write failed...
            } else {
                $scope.updateStock();
                $scope.showModalCongrat();
                $scope.clearCart();
            }
        });
    }

    $scope.showModalCongrat = function () {
        var modalInstance = $uibModal.open({
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: "resources/template/modal.html",
            controller: "checkoutPageCongratModalCtrl",
            scope: $scope
        })

        modalInstance.result.then(function (returnVal) {
            // $scope.something = selectedItem; //parent receives the value
            $scope.navigateUserTo(returnVal);
        }, function () {
            console.log('Modal dismissed!');
        });
    };

    $scope.updateStock = function () {
        angular.forEach($scope.cart.items, function (itemObj) {
            var stockleft = itemObj.instock - itemObj.quanitySelected;
            var product = {
                instock: stockleft,
            };
            return firebase.database().ref().child('shoesDb').child(itemObj.$id).update(product);
        });
    }
});

app.controller("checkoutPageCongratModalCtrl", function ($scope, Auth, $uibModalInstance) {

    $scope.modal = {
        title: "Congratulation!",
        body: "Your Order Request has been received! The delivery is estimated to be within 1 - 2 working days.",
        action: "OK",
        okButtonEnabled: true,
        cancelButtonEnabled: false,
        inputBoxEnabled: false
    }

    $scope.ok = function () {
        //   $uibModalInstance.close($ctrl.selected.item);  //can be used to pass value to its parent
        $uibModalInstance.close('/');
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});