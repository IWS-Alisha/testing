'use strict';

angular.module('slingshot')

.controller('SlingPageCtrl', ['$scope', '$state', 'localStorageService', 'soapService', 'sqlService', '$cordovaDialogs', 'toastService', 'requestResponseHandler',
    function($scope, $state, localStorageService, soapService, sqlService, $cordovaDialogs, toastService, requestResponseHandler) {

        var serverapp = localStorageService.get('serverApp'),
            token = localStorageService.get('Token'),
            description = localStorageService.get('TripInfoDescription'),
            newDir,
            expenseCode = localStorageService.get('ExpenseCodes'),
            projectCode = localStorageService.get('Project');

        $scope.showFooter = true;

        var Expenses = [];
        var sum = 0,
            docId,
            counter = 0,
            images = [],
            imageList = [],
            expenseCounter,
            fileEntry, network;
        $scope.hideDues = true;

        $scope.isSubmitDisabled = true;

        cordova.plugins.Keyboard.close();
        cordova.plugins.Keyboard.disableScroll(true);

        $scope.$on("$destroy", function() {
            document.removeEventListener("deviceready", onDeviceReady, false);
            document.removeEventListener("backbutton", backButtonHandler, false);
        });

        $scope.$on('$viewContentLoaded', function() {
            document.addEventListener("deviceready", onDeviceReady, false);
            document.addEventListener("backbutton", backButtonHandler, false);
            document.body.style.background = "white";
            setTripDescriptionOnView();
            setExpensesAmount();

        });

        function onDeviceReady() {
            initilizeAppName();
        };

        function initilizeAppName() {
            //get app name from config file
            cordova.getAppVersion.getAppName(function(name) {
                $scope.appName = name;
            });
            //if platform nor the ios and neither the android use the hard coded app name 
            if (device.platform !== 'iOS' || device.platform !== 'Android') {
                $scope.appName = 'Expenses';
            }
        };

        function setTripDescriptionOnView() {
            if (description != null) {
                $scope.desc = description;
                $scope.tripInfo = '&#10003';
            } else {
                $scope.desc = "(Please enter trip info)";
                $scope.tripInfo = '?';
            }
        };

        function setExpensesAmount() {

            sqlService.getExpenses(function(result) {

                Expenses = result;

                if (result.length !== 0) {
                    if (description !== null) {
                        //enable submit button
                        $scope.isSubmitDisabled = false;
                        document.getElementById('submitBtn').style.backgroundColor = '#0270D7';
                    } else {
                        //disable submit button
                        document.getElementById('submitBtn').style.backgroundColor = '#adadad';
                    }

                    localStorageService.set('ExpensesExist', true);
                    var curr,
                        sum = 0,
                        sumDues = 0,
                        isCurr;

                    if (result[0].currency === 'Miles' || result[0].currency === 'PerDiem') {
                        curr = 'USD';
                    } else {
                        curr = result[0].currency;
                    }
                    for (var i = 0; i < result.length; i++) {

                        if (result[i].currency === 'Miles' || result[i].currency === 'PerDiem') {
                            isCurr = 'USD';
                        } else {
                            isCurr = result[i].currency;
                        }

                        //calculate total amount
                        var expenseRate = _.where(expenseCode, {
                            Name: result[i].iconData
                        });

                        if (expenseRate[0].IsRateBased) {
                            if (expenseRate[0].Rate > 0) {
                                sum = sum + result[i].amount * expenseRate[0].Rate;

                            } else {
                                sum = 'Unavailable';
                            }
                        } else {
                            sum = sum + result[i].amount;
                        }

                        $scope.hideDues = false;

                        //calculate due amonuts                    
                        if (result[i].corporateCard === null) {

                            var expenseRate = _.where(expenseCode, {
                                Name: result[i].iconData
                            });

                            if (expenseRate[0].IsRateBased) {
                                if (expenseRate[0].Rate > 0) {
                                    sumDues = sumDues + result[i].amount * expenseRate[0].Rate;

                                } else {
                                    sumDues = 'Unavailable';
                                }
                            } else {
                                sumDues = sumDues + result[i].amount;
                            }

                            $scope.hideDues = false;

                        }

                        if (curr !== isCurr) {
                            sum = 'Unavailable';
                            sumDues = 'Unavailable';
                        }
                        //set expense count
                        $scope.actionBtnExp = Expenses.length;
                        //set payment info like dues 
                        if (sum > 0 || sumDues > 0) {
                            $scope.totalCost = sum.toFixed(2) + ' ' + curr;
                            $scope.dueCost = sumDues.toFixed(2) + ' ' + curr;
                        } else if (sum === 'Unavailable' || sumDues === 'Unavailable') {
                            $scope.totalCost = 'Unavailable';

                            $scope.hideDues = true;
                        }
                    }

                } else if (Expenses.length === 0 || Expenses.length === null) {

                    $scope.actionBtnExp = 0;

                    $scope.hideDues = false;
                    $scope.dueCost = '0.00' + ' ' + 'USD';
                    $scope.totalCost = '0.00' + ' ' + 'USD';
                    document.getElementById('submitBtn').style.backgroundColor = '#adadad';
                }
                $scope.$digest();
            });
        };

        $scope.trip = function() {
            $state.go('tripinfo');
        };

        $scope.file = function() {
            stateChange();
        };

        function stateChange() {
            $state.go("capturedexpense");
        }

        $scope.setting = function() {
            $state.go('setting');
        };
        $scope.errors = function() {
            sqlService.getUploadResults(function(result) {
                // expenseUploadResults = result;

                if (result.length === 0) {
                    toastService.showToast('There have been no error recorded during the expense last submission.');
                } else {
                    $state.go('uploadResultPage');
                }
            });
        };

        $scope.web = function() {
            window.open(localStorageService.get('serverId'), '_system', 'location=yes');
            return false;
        };



        $scope.submit = function() {
            $cordovaDialogs.confirm('Post expenses to server?', '', ['Yes', 'No'])
                .then(function(buttonIndex) {
                    // no button = 0, 'OK' = 1, 'Cancel' = 2
                    var btnIndex = buttonIndex;
                    if (btnIndex == 1) {
                        showAlertIfNoInternetConnectionAvailable();
                    }
                });

        };

        function showAlertIfNoInternetConnectionAvailable() {
            if (navigator.connection.type == 'none') {
                alert('Warring' + '\n' + ' Cant submit data - no Internet connection.');
            } else {
                setActionUploadResult();
            }
        };

        function setActionUploadResult() {
            sqlService.clearUploadResults();
            $scope.ShowActionCounts = true;
            $scope.expenseCounter = Expenses.length;
            createOrUpdateReportHeader();
        };

        function createOrUpdateReportHeader() {

            var data = {
                TripDescription: localStorageService.get('TripInfoDescription'),
                BillingAttributes: createOrUpdateReportHeaderBillingAttributes()
            };

            soapService.createOrUpdateReportHeader(serverapp, token, data).then(function(response) {
                // console.log(response);
                if (response.code == 'InvalidRequest') {
                    toastService.showToast('Server appears unreachable');
                    var uploadResult = {
                        Status: response.code,
                        ErrMessage: response.message,
                        ErrDescription: 'server unreachable'
                    }
                    sqlService.addExpenseUploadResult(uploadResult);
                } else if (response.Code === 'ReAuth') {
                    toastService.showToast('ReAuth Required.');
                    $state.go('register');
                }
                if (response.Code == "Success") {
                    docId = response.DocumentID;
                    // $scope.expenseCounter = Expenses.length;
                    // $scope.ShowActionCounts = true;
                    takeAllFilesRelatedToExpense();

                }
            })
        };

        function createOrUpdateReportHeaderBillingAttributes() {
            var DICT = {};
            if (localStorageService.get('TripInfoCorporateCard') == null) {
                // DICT.CorpCard
            } else {
                DICT.CorpCard = localStorageService.get('TripInfoCorporateCard');
            }
            if (localStorageService.get('TripInfoProject') == null) {

            } else {
                var project = _.where(localStorageService.get('Project'), {
                    Name: localStorageService.get('TripInfoProject')
                });
                DICT.ProjectID = project[0].ID.toString();
            }
            if (localStorageService.get('TripInfoEntity') == null) {

            } else {
                DICT.Entity = localStorageService.get('TripInfoEntity');
            }
            if (localStorageService.get('TripInfoDivision') == null) {

            } else {
                DICT.Division = localStorageService.get('TripInfoDivision');
            }
            if (localStorageService.get('TripInfoCostCenter') == null) {

            } else {
                DICT.CostCenter = localStorageService.get('TripInfoCostCenter');
            }
            if (localStorageService.get('TripInfoJobNumber') == null) {

            } else {
                DICT.JobNumber = localStorageService.get('TripInfoJobNumber');
            }
            // DICT.JobNumber = localStorageService.get('info_JobNum');
            return DICT;
        };


        function takeAllFilesRelatedToExpense() {
            readDirectory();
        };

        function readDirectory() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onDirectorySuccessToRead, fail);
        };

        function onDirectorySuccessToRead(fs) {
            var newDir = Expenses[0].Id;
            //   alert(newDir);
            var dir = "images" + '/' + newDir;
            // alert(dir);
            fs.root.getDirectory(dir, null, gotDirectorySuccessToRead, fail);
        };

        function gotDirectorySuccessToRead(getDirectory) {

            var directoryReader = getDirectory.createReader();
            directoryReader.readEntries(success, fail);
        };

        function success(entries) {
            for (var i = 0; i < entries.length; i++) {
                imageList.push(entries[i]);
            }
            fileEntry = imageList[counter];
            gotFileEntryToRead(fileEntry);
        };

        function gotFileEntryToRead(fileEntry) {

            fileEntry.file(gotFile, fail);
        };

        function gotFile(file) {
            readAsText(file);
        };

        function readAsText(file) {

            var reader = new FileReader();
            reader.onloadend = function(evt) {
                images.push({
                    "Image": {
                        "Data": evt.target.result,
                        "Type": '.jpg'
                    }
                });
                if (counter < imageList.length - 1) {
                    counter = counter + 1;
                    fileEntry = imageList[counter];
                    gotFileEntryToRead(fileEntry);
                } else {
                    takeAllExpenses(docId);
                }
            };
            reader.readAsText(file);
        };

        function fail(error) {
            takeAllExpenses(docId);
        };

        function takeAllExpenses(docId) {

            var pro_card;

            var serverapp = localStorageService.get('serverApp');
            var token = localStorageService.get('Token');

            var datalist = Expenses[0];
            console.log(datalist);
            var res = datalist.dateTime;
            var data = {
                DocumentID: docId,
                Timestamp: new Date(res),
                Code: datalist.iconData,
                Amount: datalist.amount,
                Description: datalist.description,
                Currency: datalist.currency,
                BillingAttributes: getBillingAtributes(datalist),
                Images: images

            };

            soapService.takeExpense(serverapp, token, data).then(function(response) {

                $scope.expenseCounter--;
                images = [];

                if (response.Code == 'Success') {

                    toastService.showToast('Expense #' + datalist.iconData + ' has been submitted Successfully');
                    sqlService.deleteExpense(datalist.Id, function(result) {
                        sqlService.getExpenses(function(result) {
                            Expenses = result;
                            $scope.totalDocs = result.length;
                            if (result.length === 0) {
                                localStorageService.remove('TripInfoDescription');
                                $scope.desc = "(Please enter trip info)";
                                $scope.tripInfo = '?';
                                $scope.actionBtnExp = 0;
                                $scope.isSubmitDisabled = true;
                                $scope.ShowActionCounts = false;
                                $scope.$apply();
                            }
                        });
                    });
                    setExpensesAmount();

                } else if (response.Code == 'ReAuth') {
                    toastService.showToast('Your former login has expired. Please identify yourself..');
                    $state.go('register');
                    $scope.ShowActionCounts = false;
                    return;

                } else {
                    toastService.showToast('Error: #' + datalist.iconData + ' is not submitted');
                    $scope.ShowActionCounts = false;
                    var uploadResult = {
                        Status: response.code,
                        ExpenseCode: datalist.iconData,
                        ExpenseDesc: datalist.description,
                        ErrMessage: response.Message,
                        ErrDescription: response.StackTrace
                    }
                    sqlService.addExpenseUploadResult(uploadResult, function(result) {
                        return;
                    });
                }

            });

        };

        function getNextexpenseToUploadOnServer() {
            if (Expenses.length > 1) {
                setTimeout(function() {
                    takeAllFilesRelatedToExpense();
                }, 700);

            } else {
                var data = {
                    DocumentID: docId
                };
                soapService.postReport(serverapp, token, data).then(function(response) {

                    if (response.Code === 'Success') {
                        $scope.ShowActionCounts = false;
                        toastService.showToast('The expense report has been posted for approval.');
                    } else {
                        $scope.ShowActionCounts = false;
                        $cordovaDialogs.confirm('Your expenses have been submitted successfully, but the expense report has failed to be posted for approval.' + response.Message + 'Please access the web application, locate your report and try to re-post.', '', ['Ok', ''])
                            .then(function(buttonIndex) {
                                // no button = 0, 'OK' = 1, 'Cancel' = 2
                                var btnIndex = buttonIndex;
                                if (btnIndex == 1) {}
                            });

                    }
                });
            }
        };

        function getBillingAtributes(fields) {
            var expenseGLA, DICT = {},
                project;
            if (fields.corporateCard == null || fields.corporateCard == undefined) {

            } else {
                DICT.CorpCard = fields.corporateCard;
            }

            if (fields.projectCard == null || fields.projectCard == undefined || fields.projectCard == '') {

            } else {
                project = _.where(localStorageService.get('Project'), {
                    Name: fields.projectCard
                });
                DICT.Project = project[0].ID.toString();
            }
            expenseGLA = _.where(localStorageService.get('ExpenseCodes'), {
                Name: fields.iconData
            });
            if (_.contains(expenseGLA[0].GLAcctVariableElements, 'Entity')) {

                DICT.Entity = fields.entityCard;

                if (fields.iconData == 'Mileage') {

                } else {
                    DICT.Division = fields.divisionCard;
                }
            }
            if (_.contains(expenseGLA[0].GLAcctVariableElements, 'Cost')) {
                DICT.CostCenter = fields.costData;
            }
            if (_.contains(expenseGLA[0].GLAcctVariableElements, 'Job')) {
                DICT.JobNumber = fields.jobdata;
            }

            return DICT;

        };

        function backButtonHandler() {
            if ($state.current.name === 'slingmainpage') {
                navigator.app.exitApp(); // exit the app
            }
        };

    }
]);
