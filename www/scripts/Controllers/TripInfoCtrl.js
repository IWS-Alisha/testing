  'use strict';


  angular.module('slingshot')

  .controller('TripInfoCtrl', ['$scope', '$state', '$window', 'localStorageService', 'soapService', '$rootScope', '$cordovaDialogs', 'initilizeCtrlData', 'toastService',
      function($scope, $state, $window, localStorageService, soapService, $rootScope, $cordovaDialogs, initilizeCtrlData, toastService) {

          cordova.plugins.Keyboard.close();
          cordova.plugins.Keyboard.disableScroll(true);
          var isLengthDescriptionLengthValid;
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
          $scope.$on("$destroy", function() {
              document.removeEventListener("deviceready", onDeviceReady, false);
              document.removeEventListener("backbutton", backButtonHandler, false);
              window.removeEventListener("native.keyboardhide");
          });
          $scope.$on('$viewContentLoaded', function() {
              document.addEventListener("deviceready", onDeviceReady, false);
              document.addEventListener('backbutton', backButtonHandler, false);

              window.addEventListener("native.keyboardhide", function(e) {
                  var expenseForm = document.getElementById('tripInfoDiv');
                  expenseForm.style.top = "0%";
                  expenseForm.style.transition = "all .5s";
              });

              $scope.BillingDefaults = localStorageService.get('BillingDefaults');

              $scope.DescShow = true;

              initilizeTripInfoTabData();

              getAndSetTripInfoTabData();
          });

          function onDeviceReady() {
              if (device.platform === 'Android') {
                  $scope.showBackBtn = false;
              } else {
                  $scope.showBackBtn = true;
              }
              // if (device.platform === 'iOS') {
              //     var hidelistAtBottom = document.getElementById('hideDropDownlistBottom');
              //     hidelistAtBottom.style.top = "95%";
              // }
          };

          function initilizeTripInfoTabData() {
              initilizeCtrlData.getResponse(function(reponse) {
                  $scope.CorpCards = reponse.CorpCards;
                  $scope.Entities = reponse.Entities;
                  $scope.Divisions = reponse.Divisions;
                  $scope.CostCenters = reponse.CostCenters;
                  $scope.JobNumbers = reponse.JobNumbers;
                  $scope.Project = reponse.Project;
              });
          };

          function getAndSetTripInfoTabData() {
              //$rootScope.$broadcast("closeList");
              $scope.description = localStorageService.get('TripInfoDescription');
              $scope.newcorpdata = localStorageService.get('TripInfoCorporateCard');
              $scope.newprodata = localStorageService.get('TripInfoProject');
              if ($scope.newcorpdata != null) {
                  $scope.newcorpdata = {
                      name: localStorageService.get('TripInfoCorporateCard')
                  };

              } else {
                  localStorageService.set('TripInfoCorporateCard', null);
                  $scope.newcorpdata = {
                      name: null
                  };
              }

              if ($scope.newprodata != null) {
                  $scope.newprodata = {
                      name: localStorageService.get('TripInfoProject')
                  };

              } else {
                  localStorageService.set('TripInfoProject', null);
                  $scope.newprodata = {
                      name: null
                  };
              }
              $scope.newjobdata = localStorageService.get('TripInfoJobNumber');
              if ($scope.newjobdata == null) {
                  $scope.newjobdata = {
                      name: null
                  };
              } else {
                  $scope.newjobdata = {
                      name: localStorageService.get('TripInfoJobNumber')
                  };
              }
              $scope.newentitydata = localStorageService.get('TripInfoEntity');
              if ($scope.newentitydata == null) {
                  $scope.newentitydata = {
                      name: null
                  };
              } else {
                  $scope.newentitydata = {
                      name: localStorageService.get('TripInfoEntity')
                  };
              }
              $scope.newdivdata = localStorageService.get('TripInfoDivision');
              if ($scope.newdivdata == null) {
                  $scope.newdivdata = {
                      name: null
                  };
              } else {
                  $scope.newdivdata = {
                      name: localStorageService.get('TripInfoDivision')
                  };
              }
              $scope.newcostdata = localStorageService.get('TripInfoCostCenter');
              if ($scope.newcostdata == null) {

                  $scope.newcostdata = {
                      name: null
                  };

              } else {
                  $scope.newcostdata = {
                      name: localStorageService.get('TripInfoCostCenter')
                  };
              }

          };

          $scope.setScroll = function(isSet, offset) {
              cordova.plugins.Keyboard.disableScroll(isSet, offset);
              if (device.platform !== 'iOS') {
                  var expenseForm = document.getElementById('tripInfoDiv');
                  expenseForm.style.top = offset + "%";
                  expenseForm.style.transition = "all .5s";
              }
          };

          $scope.descriptionTabChange = function() {
              cordova.plugins.Keyboard.close();
              $rootScope.$broadcast("hideList");
              $scope.DescShow = true;
              $scope.AccountShow = false;
              document.getElementById("AccountTab").style.backgroundColor = "#F0F1F3";
              document.getElementById("descTab").style.backgroundColor = "white";
          };

          $scope.accountingTabChange = function() {
              $rootScope.$broadcast("hideList");
              cordova.plugins.Keyboard.close();
              $scope.DescShow = false;
              $scope.AccountShow = true;
              document.getElementById("descTab").style.backgroundColor = "#F0F1F3";
              document.getElementById("AccountTab").style.backgroundColor = "white";
          };

          $scope.hideList = function() {
              $rootScope.$broadcast("closeList");
              $rootScope.$broadcast("hideList");
          };


          $scope.saveTripInfoTabData = function(description, corpdata, jobdata, entitydata, divdata, costdata, prodata) {
              // console.log(description, corpdata, jobdata, entitydata, divdata, costdata, prodata);
              cordova.plugins.Keyboard.close();
              checkDecsriptionLength(description);
              if (!isLengthDescriptionLengthValid) {
                  toastService.showToast('Description is longet than 250 characters.Please reduce.');
              } else {
                  if (description != null) {
                      localStorageService.set('TripInfoDescription', description);
                  };
                  localStorageService.set('TripInfoCorporateCard', corpdata);
                  localStorageService.set('TripInfoJobNumber', jobdata);
                  localStorageService.set('TripInfoEntity', entitydata);
                  localStorageService.set('TripInfoDivision', divdata);
                  localStorageService.set('TripInfoCostCenter', costdata);
                  localStorageService.set('TripInfoProject', prodata);
                  $window.history.back();
              }
          };

          function checkDecsriptionLength(description) {
              if (description.length > 250) {
                  isLengthDescriptionLengthValid = false;
              } else {
                  isLengthDescriptionLengthValid = true;
              }
          };

          $scope.onTripInfoTabBack = function() {
              backButtonBehaviour();
          };

          function backButtonHandler(event) {
              if ($state.current.name === 'tripinfo') {
                  backButtonBehaviour();
              }
          };

          function backButtonBehaviour() {
              if (isTripInfoStateChange()) {
                  $cordovaDialogs.confirm('Discard changes?', '', ['Yes', 'No'])
                      .then(function(buttonIndex) {
                          // no button = 0, 'OK' = 1, 'Cancel' = 2
                          var btnIndex = buttonIndex;
                          if (btnIndex == 1) {
                              $window.history.back();
                          }
                      });
              } else {
                  $window.history.back();
              }
          };

          function isTripInfoStateChange() {
              var description = $scope.description;
              var corpdata = $scope.newcorpdata,
                  jobdata = $scope.newjobdata,
                  entitydata = $scope.newentitydata,
                  divdata = $scope.newdivdata,
                  costdata = $scope.newcostdata,
                  prodata = $scope.newprodata

              if (localStorageService.get('TripInfoDescription') !== description || localStorageService.get('TripInfoCorporateCard') !== corpdata.name || localStorageService.get('TripInfoJobNumber') !== jobdata.name || localStorageService.get('TripInfoEntity') !== entitydata.name || localStorageService.get('TripInfoDivision') !== divdata.name || localStorageService.get('TripInfoCostCenter') !== costdata.name) {
                  return true;
              } else {
                  return false;
              }
          };

          $scope.capitalizeFirstLetter = function(value) {
              if (value.length > 0) {
                  var str = value.replace(value.substr(0, 1), value.substr(0, 1).toUpperCase());
                  document.getElementById('text').value = str;

              }
          };
      }
  ]);
