'use strict';

angular.module('slingshot')

.service("sqlService", ['$timeout', 'localStorageService', function($timeout, localStorageService) {

    // var db = openDatabase("Slingshot", "1.0", "Slingshot App", 10000000),
        // sqlService = this;

    var db, sqlService = this;;
    var WIN_PLATFORM = 'Win32NT' || 'WinCE' || 'Win32';

    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {

        if (device.platform == WIN_PLATFORM)
            db = openDatabase("Slingshot", "1.0", "Slingshot App", 10000000);
        else
            db = openDatabase("Slingshot", "1.0", "Slingshot App", 10000000);

        initDB();
    };

    function initDB() {
        db.transaction(function(tx) {

            tx.executeSql('CREATE TABLE IF NOT EXISTS expenses(Id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT, dateTime INTEGER, amount REAL NOT NULL , currency TEXT, description TEXT , corporateCard TEXT, projectCard TEXT, entityCard TEXT, divisionCard TEXT, jobData TEXT, costData TEXT, iconData TEXT, fileData INTEGER)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS expenseUploadResults(Id INTEGER PRIMARY KEY AUTOINCREMENT, Status TEXT, ExpenseCode INTEGER, ExpenseDescription TEXT, ErrMessage TEXT, ErrDescription TEXT)');
        });

    }

    sqlService.resetDB = function() {

        db.transaction(function(tx) {
            tx.executeSql("DROP TABLE IF EXISTS expenses");
            tx.executeSql("DROP TABLE IF EXISTS expenseUploadResults");

            tx.executeSql('CREATE TABLE IF NOT EXISTS expenses (Id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT, dateTime INTEGER, amount REAL NOT NULL, currency TEXT, description TEXT , corporateCard TEXT, projectCard TEXT, entityCard TEXT, divisionCard TEXT, jobData TEXT, costData TEXT, iconData TEXT, fileData INTEGER)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS expenseUploadResults(Id INTEGER PRIMARY KEY AUTOINCREMENT, Status TEXT, ExpenseCode INTEGER, ExpenseDescription TEXT, ErrMessage TEXT, ErrDescription TEXT)');
        });

    };

    sqlService.addExpense = function(imageCode, dateTym, amnt, currency, desc, corpCrd, projectCrd, entityCrd, divCrd, jobdata, costdata, icondata, files) {

        db.transaction(function(tx) {

            tx.executeSql('INSERT INTO expenses (code, dateTime, amount, currency, description, corporateCard, projectCard, entityCard, divisionCard, jobData, costData, iconData, fileData) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)', [imageCode, dateTym, amnt, currency, desc, corpCrd, projectCrd, entityCrd, divCrd, jobdata, costdata, icondata, files], function(tx, res) {
            });

        });

    };

    sqlService.addExpenseUploadResult = function(uploadResult) {

        db.transaction(function(tx) {

            tx.executeSql('INSERT INTO expenseUploadResults(Status, ExpenseCode, ExpenseDescription, ErrMessage, ErrDescription) VALUES (?, ?, ?, ?, ?)', [uploadResult.Status, uploadResult.ExpenseCode, uploadResult.ExpenseDesc, uploadResult.ErrMessage, uploadResult.ErrDescription]);

        });

    };

    sqlService.updateExpense = function(imageCode, dateTym, amnt, currency, expensedesc, corpCrd, projectCrd, entityCrd, divCrd, jobdata, costdata, icondata, files, exID, callback) {

        db.transaction(function(tx, Id) {

            tx.executeSql('UPDATE expenses SET code=?, dateTime=?, amount=?, currency=?, description=?, corporateCard=?, projectCard=?, entityCard=?, divisionCard=?, jobData=?, costData=?, iconData=? , fileData=? WHERE Id=?', [imageCode, dateTym, amnt, currency, expensedesc, corpCrd, projectCrd, entityCrd, divCrd, jobdata, costdata, icondata, files, exID], function(tx, res) {
        
                    if (res.rowsAffected !== 0) {
                        callback({
                            'Success': true
                        });
                    } else {
                        callback({
                            'Success': false
                        });
                    }
            });

        });

    };

    sqlService.deleteExpense = function(exID, callback) {

        db.transaction(function(tx, Id) {

            tx.executeSql('DELETE FROM expenses WHERE Id = ?', [Id = exID], function(tx, res) {

                    if (res.rowsAffected !== 0) {
                        callback({
                            'Success': true
                        });
                    } else {
                        callback({
                            'Success': false
                        });
                    }
            });

        });

    };

    sqlService.getExpenses = function(callback) {
        var result = [];

        db.transaction(function(tx) {

            tx.executeSql('SELECT * FROM expenses ORDER BY dateTime DESC', [], function(tx, res) { //ORDER BY dateTime DESC

                for (var i = 0; i < res.rows.length; i++) {
                    result.push(res.rows.item(i))
                }             
                    callback(result);
            });

        });

    };

    sqlService.getLastInsertedExpense = function(callback) {
        var result = [];

        db.transaction(function(tx) {

            tx.executeSql('SELECT * FROM expenses', [], function(tx, res) { //ORDER BY dateTime DESC

                for (var i = 0; i < res.rows.length; i++) {
                    result.push(res.rows.item(i))
                }   
                var lastExpensePosition = result.length - 1; 
                if(lastExpensePosition != null)   {
                    callback(result[lastExpensePosition]);
                }    
            });

        });

    };

    sqlService.getExpense = function(exID, callback) {

        db.transaction(function(tx) {

            tx.executeSql('SELECT * FROM expenses WHERE Id = ?', [exID], function(tx, res) {
                    callback(res.rows.item(0));
            });

        });

    };

    sqlService.clearUploadResults = function() {

        db.transaction(function(tx) {
            tx.executeSql('DELETE FROM expenseUploadResults');
        });

    };

    sqlService.getUploadResults = function(callback) {
        var result = [];

        db.transaction(function(tx) {

            tx.executeSql('SELECT * FROM expenseUploadResults', [], function(tx, res) {

                for (var i = 0; i < res.rows.length; i++) {
                    result.push(res.rows.item(i))
                }
                    callback(result);
            });

        });

    };

    sqlService.getUploadResultsExpense = function(exId, callback) {

        db.transaction(function(tx) {

            tx.executeSql('SELECT * FROM expenseUploadResults WHERE Id = ?', [ID], function(tx, res) {
                    callback(res.rows.item(0));
            });

        });

    };

}])
