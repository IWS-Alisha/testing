'use strict';


angular.module('slingshot')

.controller('NewExpenseCtrl', ['$scope', '$state', '$window', 'localStorageService', '$cordovaCamera', '$filter', 'sqlService', 'toastService', '$rootScope', '$cordovaDialogs', 'initilizeCtrlData', 'fileService',

    function($scope, $state, $window, localStorageService, $cordovaCamera, $filter, sqlService, toastService, $rootScope, $cordovaDialogs, initilizeCtrlData, fileService) {

        cordova.plugins.Keyboard.close();

        var fileCount,
            images = [],
            expenseGLA,
            proLabel, proInput,
            viewData, iconName, billdefaults = localStorageService.get('BillingDefaults'),
            currDate, icon, accountingTab, descriptionTab,
            expenseCurrentStateData, getCurrencyFiledValue, isExpenseValid = false;

        $scope.$on("$destroy", function() {
            document.removeEventListener("deviceready", onDeviceReady, false);
            document.removeEventListener("backbutton", backButtonHandler, false);
        });

        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener('backbutton', backButtonHandler, false);

            window.addEventListener("native.keyboardhide", function(e) {
                var expenseForm = document.getElementById('expenseDiv');
                expenseForm.style.top = "0%";
                expenseForm.style.transition = "all .5s";
            });

            $scope.expenseHeaderName = 'New Expense';
            $scope.isShowDltButton = false;
            $scope.calender = false;
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

            $scope.showExpenseCodePicker = localStorageService.get('gridShow');

            if (isExpenseDefaultStateChange()) {
                getExpenseCurrentState();
            } else {
                getExpenseDefaultState();
            }

            setExpenseCurrentState();
        });

        function onDeviceReady() {
            if (device.platform === 'Android') {
                $scope.showBackBtn = false;
            } else {
                $scope.showBackBtn = true;
            }
            // window.addEventListener('native.keyboardshow', this.keyboardShowHandler);
            window.addEventListener('native.keyboardhide', this.keyboardHideHandler);

            this.keyboardHideHandler = function(event) {
                var expenseForm = document.getElementById('expenseDiv');
                expenseForm.style.top = "0%";
                expenseForm.style.transition = "all .5s";
                console.log('Goodnight, sweet prince');
            };
        };

        function initilizeExpenseData() {
            initilizeCtrlData.getResponse(function(response) {
                $scope.CorpCards = response.CorpCards;
                $scope.Entities = response.Entities;
                $scope.Divisions = response.Divisions;
                $scope.CostCenters = response.CostCenters;
                $scope.JobNumbers = response.JobNumbers;
                $scope.Project = response.Project;
            });
        };

        function isExpenseDefaultStateChange() {
            if ($rootScope.expenseCurrentState !== null) {
                return true;
            } else {
                return false;
            }
        };

        function getExpenseCurrentState() {
            $rootScope.expenseCurrentState.images = $rootScope.images;
            $rootScope.expenseCurrentState.files = $rootScope.images.length;
            expenseCurrentStateData = $rootScope.expenseCurrentState;
        };

        function getExpenseDefaultState() {
            images = [];
            $rootScope.images = [];
            expenseCurrentStateData = {
                isShowExpenseCodePicker: true,
                icon: null,
                iconName: null,
                date: new Date().toDateString(),
                amount: undefined,
                currency: 'USD',
                description: undefined,
                corporateCard: localStorageService.get('TripInfoCorporateCard'),
                jobnumber: localStorageService.get('TripInfoJobNumber'),
                entity: localStorageService.get('TripInfoEntity'),
                division: localStorageService.get('TripInfoDivision'),
                costCenter: null,
                project: localStorageService.get('TripInfoProject'),
                files: 0
            };
        };

        function setExpenseCurrentState() {

            $scope.AccountShow = false;
            $scope.DescShow = true;
            localStorageService.set('ExpensesExist', true);

            $scope.showExpenseCodePicker = expenseCurrentStateData.isShowExpenseCodePicker;
            $scope.date = expenseCurrentStateData.date;
            currDate = $scope.date;
            $scope.newcurrdata = {
                Code: expenseCurrentStateData.currency
            };
            $scope.numberdata = { value: expenseCurrentStateData.amount };
            $scope.expense = expenseCurrentStateData.description;

            $scope.newcorpdata = {
                name: expenseCurrentStateData.corporateCard
            };

            $scope.newjobdata = {
                name: expenseCurrentStateData.Jobnumber
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

            $scope.DescShow = true;
            $scope.AccountShow = false;
            $rootScope.$broadcast("hideList");
            accountingTab.style.backgroundColor = "#F0F1F3";
            descriptionTab.style.backgroundColor = "white";
            localStorageService.set('allFiles', expenseCurrentStateData.files);
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
            // $scope.$apply();
        };

        function setIconAndIconName() {
            var image = document.getElementById('imgSrc');
            image.src = "data:image/jpeg;base64," + icon;
            $scope.name = iconName;
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
            }
        };

        function accountingTabFileds() {
            iconName = localStorageService.get('IconName');
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

            isShowCorpCardsFiled();

            $scope.div = !(billdefaults.IsDivisionHidden) && !(setGLAElements('Division'));
            $scope.entity = !(billdefaults.IsEntityHidden) && !(setGLAElements('Entity'));
            $scope.cost = !(billdefaults.IsCostCenterHidden) && !(setGLAElements('Cost'));
            $scope.job = !(billdefaults.IsJobNumberHidden) && !(setGLAElements('Job'));

        };

        $scope.setScroll = function(isSet, offset) {
            cordova.plugins.Keyboard.disableScroll(isSet);
            if (device.platform !== 'iOS') {
                var expenseForm = document.getElementById('expenseDiv');
                expenseForm.style.top = offset + "%";
                expenseForm.style.transition = "all .5s";
            }
        };

        $scope.showDatePicker = function() {
            // alert("hello");
            cordova.plugins.Keyboard.close();
            $scope.calender = true;
            $scope.focusInput = true;
            $scope.date = null;
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
            var date = localStorageService.get('getDate');
            $scope.date = new Date(date).toDateString();
            console.log($scope.date);
        };

        $scope.onDescriptionTabClick = function() {
            cordova.plugins.Keyboard.close();
            $scope.DescShow = true;
            $scope.AccountShow = false;
            $rootScope.$broadcast("hideList");
            $rootScope.$broadcast("closeList");
            accountingTab.style.backgroundColor = "#F0F1F3";
            descriptionTab.style.backgroundColor = "white";
        };

        $scope.onAccountingTabClick = function() {
            cordova.plugins.Keyboard.close();
            $scope.DescShow = false;
            $scope.AccountShow = true;
            $rootScope.$broadcast("hideList");
            $rootScope.$broadcast("closeList");
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
                addExpense(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata);
            }
        };

        function checkIsExpenseValid(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata) {

            var newentity = newentity,
                divdata = divdata;
            if (newentity == undefined) {
                newentity = null;
            }
            if (divdata == undefined) {
                divdata = null;
            }
            iconName = localStorageService.get('IconName');
            expenseGLA = _.where(localStorageService.get('ExpenseCodes'), {
                Name: iconName
            });

            if (amount === null || amount === undefined) {
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
            } else if (_.contains(expenseGLA[0].GLAcctVariableElements, 'Entity') && newentity == null) {
                toastService.showToast('Entity field is reqiured.');
                $scope.AccountShow = true;
                $scope.DescShow = false;
                descriptionTab.style.backgroundColor = "#F0F1F3";
                accountingTab.style.backgroundColor = "white";
                isExpenseValid = false;
            } else if (_.contains(expenseGLA[0].GLAcctVariableElements, 'Division') && divdata == null) {
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

        function addExpense(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata) {
            var imageView = localStorageService.get('Icon'),
                projectdata, date;
            getCurrencyValue(iconName, currency);
            projectdata = prodata;

            date = Date.parse(date);
            sqlService.addExpense(imageView, date, amount, getCurrencyFiledValue, description, corpdata, projectdata, newentity, divdata, jobnumber, newcostdata, iconName, fileCount);
            if (isExpenseFilesExist()) {
                setFileSubDirectory();
            } else {
                getExpenseDefaultState();
                setExpenseCurrentState();
            }
        };

        function isExpenseFilesExist() {
            if ($rootScope.images.length !== 0) {
                return true;
            } else {
                return false;
            }
        };

        function setFileSubDirectory() {
            sqlService.getLastInsertedExpense(function(result) {
                localStorageService.set('ExpenseId', result.Id);
                fileService.writeFiles("images/" + result.Id, $rootScope.images, function(response) {
                    if (response.Success == true) {
                        getExpenseDefaultState();
                        setExpenseCurrentState();
                        $scope.$apply();
                    }
                });
            });
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

        function getCurrencyValue(iconName, currency) {
            if (iconName === 'Mileage') {
                getCurrencyFiledValue = 'Miles';
            } else if (iconName === 'PerDiem') {
                getCurrencyFiledValue = 'Days';
            } else {
                getCurrencyFiledValue = currency;
            }
        };
        $scope.saveExpenseCurrentState = function(date, amount, currency, description, corpdata, jobnumber, newentity, divdata, newcostdata, prodata) {
            var icon = localStorageService.get('Icon'),
                iconName = localStorageService.get('IconName');
            getCurrencyValue(iconName, currency);
            $rootScope.expenseCurrentState = {
                isShowExpenseCodePicker: false,
                icon: icon,
                iconName: iconName,
                date: date,
                amount: amount,
                currency: getCurrencyFiledValue,
                description: description,
                corporateCard: corpdata,
                jobnumber: jobnumber,
                entity: newentity,
                division: divdata,
                costCenter: newcostdata,
                project: prodata,
                files: fileCount
            };
            if (fileCount > 0) {
                // $rootScope.images = images;
                $state.go('newexpenseimageviewer');
            } else {
                $scope.viewer = true;
                takePicture();
            }
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
                $state.go('newexpenseimageviewer');
            }, function(err) {
                $scope.viewer = false;
                $scope.$digest();
            }, options);

        };

        $scope.showExpenseCodePickerPrompt = function() {
            $scope.showExpenseCodePicker = true;
        };

        function isShowCorpCardsFiled() {

            if ($scope.CorpCards == null) {
                $scope.corp = true;
            } else {
                $scope.corp = false;
            }
            if ($scope.Project == null) {
                $scope.pro = true;
            } else {
                $scope.pro = false;
            }
        };

        function setGLAElements(fieldValue) {

            expenseGLA = _.where($scope.ExpenseCodes, {
                Name: localStorageService.get('IconName')
            });
            return _.contains(expenseGLA[0].GLAcctVariableElements, fieldValue);

        };

        $scope.onClickBackButton = function() {
            backButtonBehaviour();
        };

        function backButtonHandler(event) {
            if ($state.current.name === 'newexpense') {
                backButtonBehaviour();
            }
        };

        function backButtonBehaviour() {
            if (localStorageService.get('Icon') === null) {
                $window.history.back();
            } else if ($scope.showExpenseCodePicker == true) {
                $scope.showExpenseCodePicker = false;
            } else {
                if (isExpenseInitialStateChange()) {
                    $cordovaDialogs.confirm('Discard changes?', '', ['Yes', 'No'])
                        .then(function(buttonIndex) {
                            // no button = 0, 'OK' = 1, 'Cancel' = 2
                            var btnIndex = buttonIndex;
                            if (btnIndex == 1) {
                                localStorageService.set('allFiles', 0);
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
                amount = $scope.numberdata.value,
                description = $scope.expense,
                currency = $scope.newcurrdata,
                corpdata = $scope.newcorpdata,
                newentity = $scope.newentitydata,
                divdata = $scope.newdivdata,
                prodata = $scope.newprodata;
            if (fileCount !== 0 || date !== currDate || currency.Code !== 'USD' || amount !== undefined || description !== undefined || corpdata.name !== localStorageService.get('TripInfoCorporateCard') || newentity.name !== localStorageService.get('TripInfoEntity') || divdata.name !== localStorageService.get('TripInfoDivision') || prodata.name !== localStorageService.get('TripInfoProject')) {
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
