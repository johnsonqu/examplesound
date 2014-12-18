Parties = new Mongo.Collection("parties");
if (Meteor.isClient) {
    //angular.module('qrcode',['angular-meteor', 'ui.router', 'ngAudio']);
    angular.module('qrcode',['angular-meteor', 'ui.router', 'ngAudio']);

    Meteor.startup(function () {
      angular.bootstrap(document, ['qrcode']);
    });

    angular.module("qrcode").filter('uninvited', function () {
      return function (users, party) {
        if (!party)
          return false;

        return _.filter(users, function (user) {
          if (user._id == party.owner ||
              _.contains(party.invited, user._id))
            return false;
          else
            return true;
        });
      }
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
          .state('audioTest', {
            url: '/partiesaudio',
            template: UiRouter.template('party_audio.html'),
            controller: 'PartyAudioCtrl'
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
        //$collection(Meteor.users).bind($scope, 'users', false, true);
        $scope.orderProperty = 'name';
        $scope.remove = function(party){
          $scope.parties.splice( $scope.parties.indexOf(party), 1 );
        };
        $scope.insert = function(newParty) {
          alert('Insert');
          $scope.parties.push(newParty);
        };
      }
    ]);

    angular.module("qrcode").controller("PartyAudioCtrl", ['$scope',
      function($scope) {
        $scope.palert = function() {
          $scope.sound = ngAudio.load("Alert.mp3");
          $scope.sound.play();
        };
      }
    ]);
    
    angular.module("qrcode").controller("ScanInCtrl", ['$scope', '$collection',
      function($scope, $collection){
        $scope.items = [];
        $scope.status_txt = '';
        $scope.codeformat = "QRCode";
        $scope.cur_qrcode = "";
        $scope.cur_barcode = "";
        $scope.scan = function(){
            if ($scope.items.length < 5) {
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        console.log(result.format);
                        console.log(result.cancelled);
                        if (result.cancelled ==0 ) {
                            if (result.format == 'QR_CODE') {
                                $scope.codeformat = "BarCode";
                                $scope.cur_qrcode = result.text;
                            } else {
                                $scope.codeformat = "QRCode";
                                $scope.cur_barcode = result.text;
                                $scope.items.push({'qrcode': $scope.cur_qrcode, 'barcode': $scope.cur_barcode});
                            }
                            $scope.$apply();
                            $scope.scan();
                        }
                    }, 
                    function (error) {
                        console.log("Error");
                    }
               );
            } else {
                $scope.status_txt = "Pls upload the codes.";
                $scope.$apply();
            }
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
  Meteor.publish("parties", function () {
    return Parties.find({
      $or:[
        {$and:[
          {"public": true},
          {"public": {$exists: true}}
        ]},
        {$and:[
          {owner: this.userId},
          {owner: {$exists: true}}
        ]}
      ]});
  });
  Parties.allow({
    insert: function (userId, party) {
      return userId && party.owner === userId;
    },
    update: function (userId, party, fields, modifier) {
      if (userId !== party.owner)
        return false;

      return true;
    },
    remove: function (userId, party) {
      if (userId !== party.owner)
        return false;

      return true;
    }
  });
  Meteor.publish("users", function () {
      return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
  });
}
