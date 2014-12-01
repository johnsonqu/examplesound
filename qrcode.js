Parties = new Mongo.Collection("parties");
if (Meteor.isClient) {
    angular.module('qrcode',['angular-meteor', 'ui.router']);

    Meteor.startup(function () {
      angular.bootstrap(document, ['qrcode']);
    });
    
    angular.module("qrcode").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
      function($urlRouterProvider, $stateProvider, $locationProvider){

        $locationProvider.html5Mode(true);

        $stateProvider
          .state('parties', {
            url: '/parties',
            template: UiRouter.template('parties_list.html'),
            controller: 'PartiesListCtrl'
          })
          .state('partyDetails', {
            url: '/parties/:partyId',
            template: UiRouter.template('party_detail.html'),
            controller: 'PartyDetailsCtrl'
          })
          .state('parties2', {
            url: '/parties2',
            template: UiRouter.template('parties_list2.html'),
            controller: 'ScanInCtrl'
          });

          $urlRouterProvider.otherwise("/parties");
    }]);
    
    angular.module("qrcode").controller("PartiesListCtrl", ['$scope', '$collection',
      function($scope, $collection){
        $collection(Parties).bind($scope, 'parties', true, true); 
        $scope.remove = function(party){
          $scope.parties.splice( $scope.parties.indexOf(party), 1 );
        };
        $scope.insert = function(newParty) {
          $scope.parties.push(newParty);
        };
      }
    ]);
    
    angular.module("qrcode").controller("ScanInCtrl", ['$scope', '$collection',
      function($scope, $collection){
        $scope.barcode = '';
        $scope.scan = function(){
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    $scope.barcode = "Result: " + result.text + "\n" +
                    "Format: " + result.format + "\n" +
                    "Cancelled: " + result.cancelled;
                }, 
                function (error) {
                    alert("Scanning failed: " + error);
                }
            );

        };
      }
    ]);
    
    angular.module("qrcode").controller("PartyDetailsCtrl", ['$scope', '$stateParams', '$collection',
      function($scope, $stateParams, $collection){
        $collection(Parties).bindOne($scope, 'party', $stateParams.partyId, true, true);
    }]);

    angular.module("qrcode").controller("HeaderController", ['$scope', '$location',
      function HeaderController($scope, $location) 
      { 
          $scope.isActive = function (viewLocation) { 
              return viewLocation === $location.path();
          };
      } 
    ]);
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (Parties.find().count() === 0) {

      var parties = [
        {'name': 'Dubstep-Free Zone',
          'description': 'Fast just got faster with Nexus S.'},
        {'name': 'All dubstep all the time',
          'description': 'Get it on!'},
        {'name': 'Savage lounging',
          'description': 'Leisure suit required. And only fiercest manners.'}
      ];

      for (var i = 0; i < parties.length; i++)
        Parties.insert({name: parties[i].name, description: parties[i].description});

    }
  });
}
