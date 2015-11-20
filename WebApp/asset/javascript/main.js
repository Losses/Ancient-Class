/**
 * Created by losse on 2015-11-05.
 */

angular.
module('ancient', ['ngRoute']).
config(function ($routeProvider) {
    $routeProvider.
    when('/menu', {
        templateUrl: './asset/part/main.html',
        controller: 'menuController'
    }).
    when('/login', {
        templateUrl: './asset/part/login.html',
        controller: 'loginController'
    }).
    when('/book', {
        templateUrl: './asset/part/book.html',
        controller: 'bookController'
    }).
    when('/activity', {
        templateUrl: './asset/part/activity.html',
        controller: 'activityController'
    }).
    when('/homework', {
        templateUrl: './asset/part/homework.html',
        controller: 'homeworkController'
    }).
    when('/about', {
        templateUrl: './asset/part/about.html',
        controller: 'aboutController'
    }).
    when('/setting', {
        templateUrl: './asset/part/setting.html',
        controller: 'settingController'
    }).
    when('/teacher', {
        templateUrl: './asset/part/teacher.html',
        controller: 'teacherController'
    }).
    otherwise({
        redirectTo: '/login'
    })
}).
controller('globController', function ($scope, $rootScope, $location, db, socket) {
    $scope.back = function () {
        $location.path('/menu').replace();
    };

    $rootScope.submitLoginInfo = function () {
        socket.emit('login', localStorage.ssId);
    };

    socket.on('init', function (data) {
        console.log(data);
    });

    socket.on('switchPage', function (data) {
        if ($location.path() === '/teacher') return false;
        $location.path(data).replace();
    });

    socket.on('now', function (data) {
        if (['/teacher', '/login'].indexOf($location.path()) !== -1) return false;
        $location.path(data).replace();
    });

    socket.on('alert', function (data) {
        alert(data);
    });

    socket.on('kick', function () {
        $('.kick').fadeIn(500);
    });

    socket.on('homework', function (data) {
        db.nameList.fetch.then(function (nameList) {
            for (var i in data)
                data[i].ssName = nameList[data[i].ssId].name

            localStorage.homework = JSON.stringify(data);
            $location.path('/homework').replace();
        });
    });
}).
controller('menuController', function ($scope) {
    $scope.ssName = localStorage.ssName;
}).
controller('loginController', function ($scope, $rootScope, $location, $timeout, socket, db) {
    $scope.checkingName = false;

    $scope.checkName = function () {
        var targetId;

        targetId = $('.login .id').val();
        db.nameList.fetch.then(function (data) {
            if (data[targetId]) {
                $scope.name = data[targetId].name;
                localStorage.ssName = data[targetId].name;
                localStorage.ssId = targetId;
                $scope.checkingName = true;
            } else {
                alert('你的学号并不存在，请检查并修改或者问问老师。')
            }
        });
    };

    $scope.toMenu = function () {
        $rootScope.submitLoginInfo();
    };

    socket.on('loginAllow', function () {
        $timeout(function () {
            $location.path('/menu').replace();
        }, 2000);
    });

    if (localStorage.ssId) {
        $('.login .id').val(localStorage.ssId);
        $scope.checkName();
    }
}).
controller('bookController', function ($scope, $sce, $location, db) {
    var defaultTitle, defaultHeaderColor;

    defaultTitle = '教材';
    defaultHeaderColor = 'orange';

    $scope.title = defaultTitle;
    $scope.headerColor = defaultHeaderColor;
    $scope.showContent = false;

    $scope.showPage = function (name, title, headerColor) {
        db.book.fetch.then(function (data) {
            if (!data[name]) return alert('你想看的教材不存在哦！');

            $scope.articleContent = $sce.trustAsHtml(data[name]);
            $scope.title = title;
            $scope.headerColor = headerColor;
            $scope.showContent = true;
        });
    };

    $scope.back = function () {
        if ($scope.showContent) {
            $scope.title = defaultTitle;
            $scope.headerColor = defaultHeaderColor;
            $scope.showContent = false;
        } else {
            $location.path('/menu').replace();
        }
    }

}).
controller('activityController', function ($scope, db, socket) {
    var themeColors, submitData;

    $scope.iconset = [];
    $scope.cardView = false;
    $scope.srtBackground = false;
    $scope.selectedIcon = 'heart';
    $scope.themeColor = '#795548';
    $scope.ssName = localStorage.ssName;
    $scope.submited = false;
    $scope.showShuffleName = false;

    themeColors = ['#f44336', '#9c27b0', '#e91e63', '#3f51b5', '#2196f3', '#4caf50', '#ff5722', '#009688', '#673ab7', '#607d8b'];

    $scope.selectIcon = function (iconName) {
        $scope.srtBackground = true;
        $scope.selectedIcon = iconName;
        $scope.cardView = true;
        $scope.themeColor = themeColors[Math.floor(Math.random() * (themeColors.length - 1))];
    };

    $scope.selectAgain = function () {
        if ($scope.submited) return;
        $scope.cardView = false;
        $scope.srtBackground = false;
        $scope.themeColor = themeColors[Math.floor(Math.random() * (themeColors.length - 1))];
    };

    $scope.submit = function () {
        if (!$('.hobby_name').val()) {
            alert('请输入你的爱好是什么。');
            return false;
        }
        $scope.submited = true;
        submitData();
    };

    $scope.modify = function () {
        $scope.submited = false;
    };

    submitData = function () {
        socket.emit('activityData', {
            ssId: localStorage.ssId,
            title: $('.hobby_name').val(),
            icon: $scope.selectedIcon,
            introduce: $('.introduce').val()
        });
    };

    socket.on('shuffleResult', function (data) {
        var resultNames;

        resultNames = [];

        db.nameList.fetch.then(function (nameList) {
            for (var i in data)
                localStorage.ssId == data[i] || nameList[data[i]] && resultNames.push(nameList[data[i]].name);

            $scope.shuffleResultName = resultNames.join('、');
            $scope.showShuffleName = true;
        });
    });

    db.activity.fetch.then(function (data) {
        $scope.iconset = data.interestIcon;
    });

}).
controller('homeworkController', function ($scope, db) {
    $scope.headerColor = '#f44336';
    $scope.title = '作业';

    $scope.homework = localStorage.homework ? JSON.parse(localStorage.homework) : {};
}).
controller('settingController', function ($scope, $location, socket) {
    $scope.title = '设置';
    $scope.headerColor = '#3f51b5';

    $scope.moe = function () {
        alert('好好上课亲……');
    };

    $scope.logout = function () {
        socket.emit('logout', '');
        delete localStorage.ssId;
        $location.path('/login');
    };

    $scope.about = function () {
        $location.path('/about');
    };

    $scope.clearCache = function () {
        delete localStorage.homework;
        delete localStorage.book;
        delete localStorage.activity;
        delete localStorage.nameList;
    };
}).
controller('aboutController', function () {

}).
controller('teacherController', function ($scope, socket) {
    $scope.title = '遥控器';
    $scope.headerColor = '#795548';

    $scope.startActivity = function () {
        socket.emit('switchPage', {"page": 'activity', "token": localStorage.token})
    };

    $scope.shuffle = function () {
        socket.emit('shuffleGroup', {token: localStorage.token})
    };

    $scope.releaseLock = function () {
        socket.emit('switchPage', {"page": '', "token": localStorage.token})
    };

    $scope.sendHomework = function () {
        socket.emit('sendHomework', {"page": '', "token": localStorage.token})
    };

    $scope.systemInit = function () {
        if (confirm("此操作将重置系统状态！"))
            socket.emit('systemInit', {"page": '', "token": localStorage.token})
    };

    $scope.importToken = function () {
        localStorage.token = prompt('输入教师密钥：', localStorage.token ? localStorage.token : '');
    };

    socket.on('teacherError', function (data) {
        alert(data);
    });
}).
service('db', function ($http, $q) {
    var nameListDeferred, bookDeferred, activityDeferred, fetchData;

    fetchData = function (sourceName, dataName, defer) {
        if (localStorage[dataName]) defer.resolve(JSON.parse(localStorage[dataName]));
        else $http.get('./asset/database/' + sourceName + '.json').
        then(function success(response) {
                localStorage[dataName] = JSON.stringify(response.data);
                defer.resolve(response.data)
            },
            function error(e) {
                defer.reject(e)
            }
        );
    };


    nameListDeferred = $q.defer();
    bookDeferred = $q.defer();
    activityDeferred = $q.defer();

    fetchData('namelist', 'nameList', nameListDeferred);
    fetchData('book', 'book', bookDeferred);
    fetchData('activity', 'activity', activityDeferred);

    function removeNameList() {
        if (localStorage.nameList) {
            delete localStorage.nameList;
            return true;
        } else {
            return false;
        }
    }

    return {
        nameList: {
            fetch: nameListDeferred.promise,
            remove: removeNameList
        },
        book: {
            fetch: bookDeferred.promise
        },
        activity: {
            fetch: activityDeferred.promise
        }
    }
}).
factory('socket', function ($rootScope, $location) {
    /*
     * By Brian Ford, From: HTML5ROCK
     * URL:http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
     * Thanks for your work!
     */
    var socket = io('/client');

    socket.on('connect', function () {
        console.log('NEW CONNECTION!');
        if (localStorage.ssId &&
            ['/login', '/teacher'].indexOf($location.path()) === -1)  $rootScope.submitLoginInfo();
    });

    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
}).
run(function ($rootScope, $location, socket) {
    $rootScope.$on('$routeChangeSuccess', function () {
        if ($location.path() === '/login' || $location.path() === '/teacher') return;
        if (!localStorage.ssId) $location.path('login').replace();
        socket.emit('whatsNow', '');
    })
});
