var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.precentage = -1;

    };

    Expense.prototype.calculatePrecentage = function(totalincome) {
        if (totalincome > 0) {
            this.precentage = Math.round((this.value / totalincome) * 100);
        } else {
            this.precentage = -1;
        }
    };

    Expense.prototype.getPrecentage = function() {
        return this.precentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    };

    var calculateToatl = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }



    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        precentage: -1

    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            var typeInfo = data.allItems[type]

            if (typeInfo.length > 0) {
                ID = typeInfo[typeInfo.length - 1].id + 1;
            } else {
                ID = 0;
            }


            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            typeInfo.push(newItem);
            return newItem;
        },

        deletItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            })
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);

            }
        },

        calculateBudget: function() {
            calculateToatl('exp');
            calculateToatl('inc');
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.precentage = -1;
            }

        },

        calculatePrecentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calculatePrecentage(data.totals.inc)
            })
        },

        getPrecentages: function() {
            var allPrec = data.allItems.exp.map(function(cur) {
                return cur.getPrecentage();
            });
            return allPrec
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                precentage: data.precentage
            }
        },

        testing: function() {
            console.log(data)
        }

    }

})();

var UIcontroller = (function() {
    var DomStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        precentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        datelabel: '.budget__title--month'
    }

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };



    return {
        getInput: function() {
            return {
                type: document.querySelector(DomStrings.inputType).value,
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DomStrings.inputValue).value)
            }

        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DomStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DomStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        displayMonth: function() {
            var now, year, month, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date;
            month = now.getMonth()
            year = now.getFullYear();
            document.querySelector(DomStrings.datelabel).textContent = months[month] + ' ' + year;
        },

        deletListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue)
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach((current, index, array) => {
                current.value = '';
            });
            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.precentage > 0) {
                document.querySelector(DomStrings.precentageLabel).textContent = obj.precentage + '%'
            } else {
                document.querySelector(DomStrings.precentageLabel).textContent = '---'

            }
        },

        displayPercentages: function(precentages) {
            var fields = document.querySelectorAll(DomStrings.expensesPercLabel);



            nodeListForEach(fields, function(current, index) {
                if (precentages[index] > 0) {
                    current.textContent = precentages[index] + '%';
                } else {
                    current.textContent = '----';
                }

            });
        },


        changedType: function() {
            var fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.inputDescription + ',' +
                DomStrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DomStrings.inputButton).classList.toggle('red')

        },

        getDomeStrings: function() {
            return DomStrings;
        }
    }

})();


var controller = (function(budgetCntrl, UICtrl) {

    setupEventListeners = function() {
        var DOM = UIcontroller.getDomeStrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    var updateBudget = function() {
        budgetCntrl.calculateBudget();
        var budget = budgetCntrl.getBudget();
        UICtrl.displayBudget(budget)
    }

    var updatePrecentages = function() {
        budgetCntrl.calculatePrecentages();
        var precentages = budgetCntrl.getPrecentages();
        UICtrl.displayPercentages(precentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCntrl.addItem(input.type, input.description, input.value);
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePrecentages();
        }

    }

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCntrl.deletItem(type, ID);
            UICtrl.deletListItem(itemID);
            updateBudget();
            updatePrecentages();

        }
    }

    return {
        init: function() {
            console.log('aplication started');
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                precentage: -1
            })
            setupEventListeners();
        }
    }

})(budgetController, UIcontroller);

controller.init();