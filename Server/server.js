Math.factorial = function (num) {
    var result = 1;
    if (num == 0 || num == 1)  result = num;
    else  result = num * Math.factorial(num - 1);

    return result;
};

var express, io, server, mongoClient, db, ancient;

express = require('express');
ancient = express();
server = require('http').createServer(ancient);
io = require('socket.io').listen(server);
mongoClient = require('mongodb').MongoClient;

server.listen(80, "0.0.0.0");

/*database connection*/
var activityId, ancientDb;

activityId = 'hobby';
ancientDb = {};
mongoClient.connect('mongodb://localhost:27017/ancient', function (err, db) {
    ancientDb.receiveActivity = function (data) {
        var activityCollection, findCondition;

        activityCollection = db.collection('activity');
        findCondition = {"ssId": data.ssId, activityId: activityId};
        activityCollection.find(findCondition).toArray(function (err, docs) {
            if (docs.length === 0) activityCollection.insert(data);
            else activityCollection.updateOne({ssId: data.ssId}, {$set: data});
            //console.log('insert status: ' + (docs.length === 0));
        });
    };

    ancient.checkToken = function (token, fn) {
        var teacherCollection, findCondition;
        teacherCollection = db.collection('teacher');
        findCondition = {token: token};

        teacherCollection.find(findCondition).toArray(function (err, docs) {
            fn(docs.length !== 0);
        });
    };

    ancient.systemInit = function () {
        var groupCollection, statusCollection;

        groupCollection = db.collection('activityGroup');
        statusCollection = db.collection('status');

        groupCollection.removeMany();
        statusCollection.updateMany({status: 'online'}, {$set: {status: 'offline'}});
    };

    ancient.signIn = function (ssId, clientId, fn) {
        var statusCollection, findCondition, removeCondition;

        statusCollection = db.collection('status');
        findCondition = ssId ? {ssId: ssId} : {clientId: clientId};
        removeCondition = {clientId: clientId};

        statusCollection.remove(removeCondition);
        statusCollection.find(findCondition).toArray(function (err, docs) {
            console.log('[CONN] [IN] ' + ssId + ' connected');
            if (docs.length === 0 && ssId)
                statusCollection.insert({ssId: ssId, status: 'online', clientId: clientId});
            else if (ssId) {
                if (fn) fn({status: 'conflict', target: docs[0].clientId});
                statusCollection.updateOne(findCondition, {$set: {status: 'online', clientId: clientId}});
                return true;
            }

            if (fn) fn({status: 'allowed'});
        });
    };

    ancient.signOut = function (clientId) {
        var statusCollection, findCondition;

        statusCollection = db.collection('status');
        findCondition = {clientId: clientId};

        statusCollection.find(findCondition).toArray(function (err, docs) {
            if (docs.length !== 0) {
                console.log('[CONN] [OUT] ' + docs[0].ssId + ' disconnected');
                statusCollection.updateOne(findCondition, {$set: {status: 'offline'}});
            }
        });
    };

    ancient.listOnline = function (fn) {
        var statusCollection, findCondition, onlineSsId;

        onlineSsId = [];
        statusCollection = db.collection('status');
        findCondition = {"status": 'online'};

        statusCollection.find(findCondition).toArray(function (err, docs) {
            for (var i in docs)  onlineSsId.push(docs[i]['ssId']);

            fn(onlineSsId);
        })
    };

    ancient.listGroups = function (fn) {
        var groupCollection, allGroups;

        allGroups = [];

        groupCollection = db.collection('activityGroup');
        groupCollection.find().toArray(function (err, docs) {
            for (var i in docs) allGroups.push(docs[i].group);

            fn(allGroups);
        });
    };

    ancient.generateGroups = function (fn) {
        var groupCollection;

        groupCollection = db.collection('activityGroup');

        ancient.listOnline(function (onlineSsId) {
            if (onlineSsId.length < 2) return fn(false);
            ancient.listGroups(function (groups) {
                //if (groups.length >= Math.floor(onlineSsId / 2)) groupCollection.remove({});
                groupCollection.removeMany();
                var ssIdLast, insertGroup, currentGroup, combinedGroups,
                    shuffleArray, randomSort, generateGroup;

                insertGroup = [];
                combinedGroups = [];

                randomSort = function () {
                    return Math.random() > .5 ? -1 : 1;
                };

                shuffleArray = function (array) {
                    return array.sort(randomSort);
                };

                generateGroup = function () {
                    var thisCombinedGroup, result;
                    thisCombinedGroup = ssIdLast[0] + ',' + ssIdLast[1];
                    if (combinedGroups.indexOf(thisCombinedGroup) !== -1) {
                        ssIdLast = shuffleArray(ssIdLast);
                        return generateGroup();
                    } else {
                        result = [ssIdLast[0], ssIdLast[1]];
                        ssIdLast.splice(0, 2);

                        return result;
                    }
                };
                if (groups) {
                    for (var i in groups) combinedGroups.push(groups[i][0] + ',' + groups[i][1]);
                }

                ssIdLast = shuffleArray(onlineSsId);

                while (ssIdLast.length >= 2) {
                    currentGroup = generateGroup();

                    if (ssIdLast.length === 1) {
                        currentGroup.push(ssIdLast[0]);
                    }
                    insertGroup.push(currentGroup);
                    groupCollection.insert({group: currentGroup});
                }

                fn(insertGroup);
            })
        });
    };

    ancient.listStudents = function (fn) {
        var statusCollection, result;

        statusCollection = db.collection('status');
        result = {};

        statusCollection.find({status: 'online'}).toArray(function (err, docs) {
            for (var i in docs) result[docs[i].ssId] = {clientId: docs[i].clientId};

            fn(result);
        });
    };

    ancient.listActivity = function (fn) {
        var activityCollection;

        activityCollection = db.collection('activity');

        activityCollection.find({activityId: 'hobby'}).toArray(function (err, docs) {
            var result;

            result = {};

            for (var i in docs) {
                result[docs[i].ssId] = {
                    ssId: docs[i].ssId,
                    title: docs[i].title,
                    introduce: docs[i].introduce
                }
            }

            fn(result);
        });
    }
});

ancient.use('/', express.static('../webApp'));

/*FileServer*/
(function () {
    var now, presentSpace;

    now = '';

    presentSpace = io.of('/presentView');

    io.of('client').on('connection', function (socket) {
        console.log('[CONN] Mobile client connected:' + socket.id);
        socket.emit('init', {msg: 'welcome to ancient classroom!'});

        socket.on('whatsNow', function () {
            if (now !== '') socket.emit('now', now);
        });

        socket.on('activityData', function (data) {
            if (now !== 'activity') {
                socket.emit('info', 'be patient dear :3');
                console.log('[ACTY] ' + data.ssId + 'was rejected because too early.');
                return false;
            }

            if (data.toString() !== "[object Object]") {
                socket.emit('info', 'wrong data format.');
                console.log('[ACTY] ' + data.ssId + ' was rejected because not object.');
                return false;
            }

            if (!data.ssId || !data.title) {
                socket.emit('info', 'submit ssid and title!');
                console.log('[ACTY] ' + data.ssId + ' was rejected because incomplete information.');
                return false;
            }

            console.log('[ACTY] ' + data.ssId + ' submitted a data');

            data.ssId = parseInt(data.ssId);
            data.activityId = activityId;
            ancientDb.receiveActivity(data);
            presentSpace.emit('activityData', data);
        });

        socket.on('teacherIdentify', function () {

        });

        socket.on('switchPage', function (data) {
            console.log('[TCHR] [SWITCH] ' + data.page + ', token:' + data.token);
            ancient.checkToken(data.token, function (status) {
                if (!status) {
                    socket.emit('teacherError', 'need a correct token.');
                    console.log('[TCHR] [SWITCH] refused, token:' + data.token);
                    return false;
                }

                if (data.page === '')
                    socket.broadcast.emit('switchPage', 'menu');
                else {
                    socket.broadcast.emit('switchPage', data.page);
                }

                now = data.page;
            })
        });

        socket.on('shuffleGroup', function (data) {
            console.log('[TCHR] [SHUFFLE] request received.');
            ancient.checkToken(data.token, function (status) {
                if (!status) {
                    socket.emit('teacherError', 'need a correct token.');
                    console.log('[TCHR] [SHUFFLE] refused, token:' + data.token);
                    return false;
                }

                ancient.generateGroups(function (groups) {
                    ancient.listStudents(function (onlineSs) {
                        var targetSocketId;
                        for (var i in groups) {
                            for (var j in groups[i]) {
                                targetSocketId = onlineSs[groups[i][j]].clientId;
                                socket.broadcast.to(targetSocketId).emit('shuffleResult', groups[i]);
                            }
                        }
                    })
                });
            })
        });

        socket.on('sendHomework', function (data) {
            console.log('[TCHR] [HOMEWORK] request received.');
            ancient.checkToken(data.token, function (status) {
                if (!status) {
                    socket.emit('teacherError', 'need a correct token.');
                    console.log('[TCHR] [HOMEWORK] refused, token:' + data.token);
                    return false;
                }

                ancient.listGroups(function (groups) {
                    var groupList, currentUser, currentGroup, thisSsHomework;

                    groupList = {};

                    for (var i in groups) {
                        for (var j in groups[i]) {
                            currentUser = groups[i][j];
                            currentGroup = groups[i];

                            if (!groupList[currentUser]) groupList[currentUser] = [];

                            for (var k in currentGroup) {
                                if (currentGroup[k] === currentUser ||
                                    groupList[currentUser].indexOf(currentGroup[k]) !== -1)
                                    continue;

                                groupList[currentUser].push(currentGroup[k]);
                            }
                        }
                    }
                    ancient.listActivity(function (activities) {
                        ancient.listStudents(function (onlineSs) {
                            for (var i in groupList) {
                                thisSsHomework = [];

                                for (var j in groupList[i]) thisSsHomework.push(activities[groupList[i][j]]);

                                socket.broadcast.to(onlineSs[i].clientId).emit('homework', thisSsHomework);
                            }
                        });
                    });
                });
            });
        });

        socket.on('systemInit', function (data) {
            console.log('[TCHR] [INIT] request received.');
            ancient.checkToken(data.token, function (status) {
                if (!status) {
                    socket.emit('teacherError', 'need a correct token.');
                    console.log('[TCHR] [INIT] refused, token:' + data.token);
                    return false;
                }

                ancient.systemInit();
            });
        });

        socket.on('login', function (data) {
            ancient.signIn(data, socket.id, function (res) {
                if (res.status === 'allowed')
                    socket.emit('loginAllow', 'welcome!');
                else if (res.status === 'conflict') {
                    socket.emit('loginAllow', 'kicked another!');

                    socket.broadcast.to(res.target).emit('kick', '');
                    setTimeout(function () {
                        console.log('[CONN] [KICK] old ' + data + ' was kicked, id:' + res.target);
                        //socket.broadcast.to(res.target).disconnect();
                    }, 500);
                }
            });
        });

        socket.on('logout', function () {
            ancient.signOut(socket.id);
        });
    });

    presentSpace.on('connection', function (socket) {
        console.log('[CONN] Present view connected');

        socket.on('activityData', function (data) {
            console.log(data);
        })
    });
})();
