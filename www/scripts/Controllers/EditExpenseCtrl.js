'use strict';


angular.module('slingshot')

.controller('EditExpenseCtrl', ['$scope', '$state', '$window', 'localStorageService', '$cordovaCamera', 'sqlService', '$stateParams', '$rootScope', '$cordovaDialogs', 'toastService', 'initilizeCtrlData', 'fileService',
    function($scope, $state, $window, localStorageService, $cordovaCamera, sqlService, $stateParams, $rootScope, $cordovaDialogs, toastService, initilizeCtrlData, fileService) {


        cordova.plugins.Keyboard.close();
        cordova.plugins.Keyboard.disableScroll(true);
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        var proInput, proLabel,
            currDate, viewData, expenseGLA,
            expenseId = localStorageService.get('ExpenseId'),
            images = [],
            expenseCurrentStateData,
            Expense,
            fileCount, icon, iconName, currencyFiledValue, isExpenseValid = false,
            descriptionTab, accountingTab;

        var billdefaults = localStorageService.get('BillingDefaults');

        $scope.$on("$destroy", function() {
            document.removeEventListener("deviceready", onDeviceReady, false);
            document.removeEventListener("backbutton", backButtonHandler, false);
            window.removeEventListener("native.keyboardhide");
            $scope.date = null;
        });
        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener('backbutton', backButtonHandler, false);

            window.addEventListener("native.keyboardhide", function(e) {
                var expenseForm = document.getElementById('expenseDiv');
                expenseForm.style.top = "0%";
                expenseForm.style.transition = "all .5s";
            });


            $scope.expenseHeaderName = 'Edit Expense';
            $scope.isShowDltButton = true;
            $scope.calender = false;
            $scope.focusInput = false;

            $scope.viewer = false;
            $scope.DescShow = true;
            $scope.hideCurrencyList = false;
            $scope.currencyOption = false;
            $scope.BillingDefaults = billdefaults;
            $scope.CurrencyCodes = localStorageService.get('CurrencyCodes');
            $scope.ExpenseCodes = localStorageService.get('ExpenseCodes');
            accountingTab = document.getElementById("AccountTab");
            descriptionTab = document.getElementById("descTab");
            proLabel = document.getElementById('newPro');
            proInput = document.getElementById('infoProInput');
            initilizeExpenseData();
            if (isExpenseStateChange()) {
                getExpenseCurrentState();
            } else {
                getExpenseDefaultState();
            }
        });

        function onDeviceReady() {
            if (device.platform === 'Android') {
                $scope.showBackBtn = false;
            } else {
                $scope.showBackBtn = true;
            }
        };

        function initilizeExpenseData() {
            initilizeCtrlData.getResponse(function(reponse) {
                $scope.CorpCards = reponse.CorpCards;
                $scope.Project = reponse.Project;
                $scope.Entities = reponse.Entities;
                $scope.Divisions = reponse.Divisions;
                $scope.CostCenters = reponse.CostCenters;
                $scope.JobNumbers = reponse.JobNumbers;
            });
        };

        function isExpenseStateChange() {
            if ($rootScope.expenseCurrentState != null) {
                return true;
            } else {
                return false;
            }
        };

        function getExpenseDefaultState() {
            sqlService.getExpense($stateParams.exId, function(result) {
                $rootScope.images = [];
                Expense = result;
                $rootScope.expense = result;
                localStorageService.set('ExpenseId', result.Id);
                var date = result.dateTime;
                date = new Date(date).toDateString();
                localStorageService.set('getDate', date);
                images = [];
                $rootScope.images = [];
                expenseCurrentStateData = {
                    date: date,
                    icon: result.code,
                    iconName: result.iconData,
                    files: result.fileData,
                    amount: result.amount,
                    description: result.description,
                    currency: result.currency,
                    costCenter: result.costData,
                    division: result.divisionCard,
                    jobNumber: result.jobData,
                    corporateCard: result.corporateCard,
                    project: result.projectCard,
                    entity: result.entityCard,

                };
                localStorageService.set('FilesCount', result.fileData);
                setExpenseCurrentState();
            });
        };

        function setExpenseCurrentState() {

            $scope.AccountShow = false;
            $scope.DescShow = true;

            $scope.showExpenseCodePicker = false;
            $scope.date = expenseCurrentStateData.date;
            $scope.newcurrdata = {
                Code: expenseCurrentStateData.currency
            };
            $scope.numberdata = { value: expenseCurrentStateData.amount };
            $scope.expense = expenseCurrentStateData.description;

            $scope.newcorpdata = {
                name: expenseCurrentStateData.corporateCard
            };

            $scope.newjobdata = {
                name: expenseCurrentStateData.jobNumber
            };

            $scope.newentitydata = {
                name: expenseCurrentStateData.entity
            };

            $scope.newdivdata = {
                name: expenseCurrentStateData.division
            };

            $scope.newprodata = {
                name: expenseCurrentStateData.project
            };

            $rootScope.$broadcast("hideList");
            document.getElementById("AccountTab").style.backgroundColor = "#F0F1F3";
            document.getElementById("descTab").style.backgroundColor = "white";

            fileCount = expenseCurrentStateData.files;
            document.getElementById('imgCount').innerHTML = fileCount;
            localStorageService.set('Icon', expenseCurrentStateData.icon);
            if (expenseCurrentStateData.iconName !== null) {
                localStorageService.set('IconName', expenseCurrentStateData.iconName);
                icon = expenseCurrentStateData.icon;
                iconName = expenseCurrentStateData.iconName;
                setIconAndIconName();
                setCurrencyParameter();
                accountingTabFileds();
            }
            $scope.$apply();
        };

        function getExpenseCurrentState() {
            images = $rootScope.images;
            $rootScope.expenseCurrentState.files = $rootScope.images.length;
            expenseCurrentStateData = $rootScope.expenseCurrentState;
            Expense = $rootScope.expense;
            setExpenseCurrentState();
        };

        function setCurrencyParameter() {
            if (iconName === 'Mileage' || iconName === 'PerDiem') {
                $scope.hideCurrencyList = true;
                $scope.currencyOption = true;
                document.getElementById('changeText').innerHTML = "Days";
                if (iconName === 'Mileage') {
                    document.getElementById('changeText').innerHTML = "Miles";
                }
            } else {
                $scope.hideCurrencyList = false;
                $scope.currencyOption = false;
                document.getElementById('changeText').innerHTML = { Code: "USD" };
            }
        };

        function setIconAndIconName() {
            var image = document.getElementById('imgSrc');
            image.src = "data:image/jpeg;base64," + icon;
            $scope.name = iconName;
        };
        $scope.saveExpenseCurrentState = function(date, amount, currency, description, corpdata, jobnumber, entity, divdata, costdata, prodata) {
            cordova.plugins.Keyboard.close();
            icon = localStorageService.get('Icon'),
                iconName = localStorageService.get('IconName');
            // localStorageService.set('ExpenseId', Expense.Id);
            getCurrencyValue(iconName, currency);

            $rootScope.expenseCurrentState = {
                icon: icon,
                iconName: iconName,
                date: date,
                amount: amount,
                currency: currencyFiledValue,
                description: description,
                corporateCard: corpdata,
                jobNumber: jobnumber,
                entity: entity,
                division: divdata,
                costCenter: costdata,
                project: prodata,
                files: fileCount
            };

            if (fileCount > 0) {
                $rootScope.images = images;
                $state.go('editexpenseimageviewer');
            } else {
                $scope.viewer = true;
                takePicture();
            }
        };

        function getCurrencyValue(iconName, currency) {
            if (iconName === 'Mileage') {
                currencyFiledValue = 'Miles';
            } else if (iconName === 'PerDiem') {
                currencyFiledValue = 'Days';
            } else {
                currencyFiledValue = currency;
            }
        };

        $scope.ExpenseCodePicker = function(icodata) {

            // tempIcon = localStorageService.get('IconName');
            icon = icodata.Icon;
            iconName = icodata.Name;
            localStorageService.set('IconName', iconName);
            localStorageService.set('Icon', icon);
            $scope.showExpenseCodePicker = false;
            setIconAndIconName();
            setCurrencyParameter();
            accountingTabFileds();
        };

        $scope.showDatePicker = function() {
            cordova.plugins.Keyboard.close();
            $scope.calender = true;
            $scope.focusInput = true;
            $scope.date = null;
            cordova.plugins.Keyboard.close();
        };
        $scope.isNewDateSelect = function(date) {
            cordova.plugins.Keyboard.close();
            if (date === null) {
                $scope.calender = true;
                $scope.focusInput = true;
            } else {
                $scope.calender = false;
                $scope.focusInput = false;
                localStorageService.set('getDate', date);
            }

        };

        $scope.hideDatePicker = function() {
            cordova.plugins.Keyboard.close();
            $scope.calender = false;
            $scope.focusInput = false;
            $scope.date = localStorageService.get('getDate');
        };

        $scope.onDescriptionTabClick = function() {
            cordova.plugins.Keyboard.close();
            $scope.DescShow = true;
            $scope.AccountShow = false;
            $rootScope.$broadcast("closeList");
            accountingTab.style.backgroundColor = "#F0F1F3";
            descriptionTab.style.backgroundColor = "white";
        };

        $scope.onAccountingTabClick = function() {
            cordova.plugins.Keyboard.close();
            $rootScope.$broadcast("closeList");
            $scope.DescShow = false;
            $scope.AccountShow = true;
            descriptionTab.style.backgroundColor = "#F0F1F3";
            accountingTab.style.backgroundColor = "white";
        };

        $scope.hideList = function() {
            $rootScope.$broadcast("closeList");
            $rootScope.$broadcast("hideList");
        };

        $scope.validateAndInsertExpense = function(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata) {
            cordova.plugins.Keyboard.close();
            checkIsExpenseValid(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata);
            if (isExpenseValid) {
                updateExpense(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata);
            }

        };

        function checkIsExpenseValid(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata) {
            cordova.plugins.Keyboard.close();
            var entity = newentity,
                division = divdata;
            if (newentity == undefined) {
                newentity = null;
            }
            if (divdata == undefined) {
                division = null;
            }

            iconName = localStorageService.get('IconName');
            expenseGLA = _.where(localStorageService.get('ExpenseCodes'), {
                Name: iconName
            });
            if (amount == null || amount == undefined) {

                toastService.showToast('please enter amount');
                $scope.AccountShow = false;
                $scope.DescShow = true;
                descriptionTab.style.backgroundColor = "white";
                accountingTab.style.backgroundColor = "#F0F1F3";
                isExpenseValid = false;
            } else if (description === null || description === undefined) {
                toastService.showToast('please enter description');
                $scope.AccountShow = false;
                $scope.DescShow = true;
                descriptionTab.style.backgroundColor = "white";
                accountingTab.style.backgroundColor = "#F0F1F3";
                isExpenseValid = false;
            } else if (_.contains(expenseGLA[0].GLAcctVariableElements, 'Entity') && entity == null) {
                toastService.showToast('Entity field is reqiured.');
                $scope.AccountShow = true;
                $scope.DescShow = false;
                descriptionTab.style.backgroundColor = "#F0F1F3";
                accountingTab.style.backgroundColor = "white";
                isExpenseValid = false;
            } else if (_.contains(expenseGLA[0].GLAcctVariableElements, 'Division') && division == null) {
                toastService.showToast('Division field is reqiured.');
                $scope.AccountShow = true;
                $scope.DescShow = false;
                descriptionTab.style.backgroundColor = "#F0F1F3";
                accountingTab.style.backgroundColor = "white";
                isExpenseValid = false;
            } else {
                isExpenseValid = true;
                return true;
            }
        };

        function updateExpense(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata) {
            icon = localStorageService.get('Icon'),
                iconName = localStorageService.get('IconName');
            getCurrencyValue(iconName, currency);

            var date = Date.parse(date);

            sqlService.updateExpense(icon, date, amount, currencyFiledValue, description, corpdata, prodata, newentity, divdata, jobnumber, newcostdata, iconName, fileCount, $stateParams.exId, function(result) {
                if (result.Success) {
                    // if (isExpenseFilesExist()) {
                    // if (isExpenseFilesUpdate()) {
                    updateExpenseFiles();
                    // } else {
                    //     $window.history.back();
                    // }
                    // } else {
                    //     $window.history.back();
                    // }
                }
            });

        };

        function isExpenseFilesExist() {
            if (fileCount !== 0) {
                return true;
            } else {
                return false;
            }
        };
        //not in use
        function isExpenseFilesUpdate() {
            if ($rootScope.images.length !== 0) {
                return true;
            } else {
                return false;
            }
        };

        function updateExpenseFiles() {
            fileService.removeFiles("images/" + Expense.Id, function(response) {
                if (response) {
                    if ($rootScope.images.length !== 0) {
                        fileService.writeFiles("images/" + Expense.Id, $rootScope.images, function(response) {
                            if (response.Success == true) {
                                $window.history.back();
                            }
                        });
                    } else {
                        $window.history.back();
                    }
                }
            });
        };

        $scope.setScroll = function(isSet, offset) {
            cordova.plugins.Keyboard.disableScroll(isSet);
            if (device.platform !== 'iOS') {
                var expenseForm = document.getElementById('expenseDiv');
                expenseForm.style.top = offset + "%";
                expenseForm.style.transition = "all .5s";
            }
        };

        $scope.dltExpense = function() {
            $cordovaDialogs.confirm('Remove ' + Expense.iconData + ' ' + "'" + Expense.description + "'" + ' ?', '', ['Yes', 'No'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if (btnIndex == 1) {
                        sqlService.deleteExpense($stateParams.exId, function(result) {
                            if (result.Success) {
                                fileService.removeFiles("images/" + Expense.Id, function(response) {

                                    localStorageService.set('FilesCount', 0);
                                    $window.history.back();

                                });
                            }
                        });
                    }
                });
        };

        function takePicture() {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                correctOrientation: true
            };

            navigator.camera.getPicture(function(imageData) {
                viewData = {
                    Data: imageData
                };
                images.push(viewData);
                $rootScope.images = images;
                $state.go('editexpenseimageviewer');
            }, function(err) {
                $scope.viewer = false;
                $scope.$digest();
            }, options);
        };

        function accountingTabFileds() {

            var iconName = localStorageService.get('IconName');
            if (iconName === 'Mileage') {
                proLabel.style.top = 29 + "%";
                proInput.style.top = 35 + "%";
            } else if (iconName === 'Meals') {
                proLabel.style.top = 16 + "%";
                proInput.style.top = 22 + "%";
            } else {
                proLabel.style.top = 42 + "%";
                proInput.style.top = 48 + "%";
            }

            $scope.div = !(billdefaults.IsDivisionHidden) && !(setGLAElements('Division'));
            $scope.entity = !(billdefaults.IsEntityHidden) && !(setGLAElements('Entity'));
            $scope.cost = !(billdefaults.IsCostCenterHidden) && !(setGLAElements('Cost'));
            $scope.job = !(billdefaults.IsJobNumberHidden) && !(setGLAElements('Job'));

            if ($scope.Project == null) {
                $scope.pro = true;
            } else {
                $scope.pro = false;
            }

            if ($scope.CorporateData == null) {
                $scope.corp = false;
            } else {
                $scope.corp = true;
            }
        };

        function setGLAElements(fieldValue) {

            expenseGLA = _.where($scope.ExpenseCodes, {
                Name: localStorageService.get('IconName')
            });
            return _.contains(expenseGLA[0].GLAcctVariableElements, fieldValue);

        };

        $scope.showExpenseCodePickerPrompt = function() {
            $scope.showExpenseCodePicker = true;
        };

        function backButtonHandler(event) {
            event.preventDefault;
            if ($state.current.name === 'editexpense') {
                backButtonBehaviour();
            }
        };

        $scope.onClickBackButton = function() {
            backButtonBehaviour();
        };

        function backButtonBehaviour() {
            if ($scope.showExpenseCodePicker == true) {
                $scope.showExpenseCodePicker = false;
            } else {
                if (isExpenseInitialStateChange()) {
                    $cordovaDialogs.confirm('Discard changes?', '', ['Yes', 'No'])
                        .then(function(buttonIndex) {
                            // no button = 0, 'OK' = 1, 'Cancel' = 2
                            var btnIndex = buttonIndex;
                            if (btnIndex == 1) {
                                localStorageService.set('FilesCount', 0);
                                $window.history.back();
                            }
                        });
                } else {
                    $window.history.back();
                }
            }
        };

        function isExpenseInitialStateChange() {
            var date = $scope.date,
                amount = $scope.numberdata,
                description = $scope.expense,
                currency = $scope.newcurrdata,
                corpdata = $scope.newcorpdata,
                newentity = $scope.newentitydata,
                divdata = $scope.newdivdata,
                prodata = $scope.newprodata,
                icon = localStorageService.get('IconName');
            var expenseDate = Expense.dateTime;
            expenseDate = new Date(expenseDate).toDateString();
            if (fileCount !== localStorageService.get('FilesCount') || expenseDate !== date || Expense.currency !== currency.Code || Expense.amount !== amount.value || Expense.description !== description || Expense.corporateCard !== corpdata.name || Expense.entityCard !== newentity.name || Expense.divisionCard !== divdata.name || Expense.projectCard !== prodata.name || Expense.iconData !== icon) {
                return true;
            } else {
                return false;
            }
        };
        
        $scope.capitalizeFirstLetter = function(value) {
            if (value.length > 0) {

                var str = value.replace(value.substr(0, 1), value.substr(0, 1).toUpperCase());
                document.getElementById('textBox').value = str;

            }
        };

    }
]);
