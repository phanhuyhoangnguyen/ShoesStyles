var LETTER_REGEX = /^[a-zA-Z]+(?:[ ][a-zA-Z]*)*$/;
app.directive('letter', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.letter = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }

                return LETTER_REGEX.test(viewValue); //LETTER_REGEX.test(viewValue) return true if the pattern is matched! else false
            };
        }
    };
});

app.directive('unamemin', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.unamemin = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }

                return (viewValue.length >= 3);
            };
        }
    };
});

var EMAIL_REGEX = /^.+@.+\..{2,3}$/;
app.directive('emailvalidate', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.emailvalidate = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }

                return EMAIL_REGEX.test(viewValue);
            };
        }
    };
});

var PASSWORD_REGEX = /(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}/;
app.directive('password', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.password = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }

                return PASSWORD_REGEX.test(viewValue);
            };
        }
    };
});

var PASSWORD_REGEX = /(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}/;
app.directive('password', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.password = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }

                return PASSWORD_REGEX.test(viewValue);
            };
        }
    };
});

var MOBILE_REGEXP = /^(04)\d{8,8}$/;
app.directive('mobile', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.mobile = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }

                return MOBILE_REGEXP.test(viewValue);
            };
        }
    };
});

var POSTCODE_REGEXP = /^\d{4,4}$/;
app.directive('postcode', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.postcode = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                return POSTCODE_REGEXP.test(viewValue);
            };
        }
    };
});


app.directive('ratingvalid', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.ratingvalid = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }

                return (viewValue > 0);
            };
        }
    };
});

var MASTERCARD_REGEXP = /^^5[1-5][0-9]{14}$/;
app.directive('ccnumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.ccnumber = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                return MASTERCARD_REGEXP.test(viewValue);
            };
        }
    };
});

app.directive('ccvnumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.ccvnumber = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                return viewValue.length == 3;
            };
        }
    };
});

app.directive('month', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.month = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                return viewValue <= 12;
            };
        }
    };
});

app.directive('year', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$validators.year = function (modelValue, viewValue) {
                if (ctrl.$isEmpty(modelValue)) {
                    return false;
                }
                return viewValue > 2017;
            };
        }
    };
});