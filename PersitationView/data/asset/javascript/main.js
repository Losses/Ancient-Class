/**
 * Created by losse on 2015-11-11.
 */

Math.pad = function (num, n) {
    return Array(Math.pow(10, n - 1) > num ? (n - ('' + num).length + 1) : 0).join(0) + num;
};

var _bridge, socket;

_bridge = {};

_bridge.audioEle = $('#ancient_audio>audio');

_bridge.onSwitchPage = function (el) {
    this.refreshVideo();
    this.changeBackground($(el).attr('data-background'));
    this.changeAudio($(el).attr('data-audio'));
    this.changeVideo($(el).attr('data-video'));

    if ($(el).attr('data-audio-stop')) _bridge.audioEle[0].pause();
};

_bridge.changeBackground = function (background) {
    if (!background) return false;

    var backgroundJqObj, backgroundObjSet, removeBackgroundItem,
        cssItem, cssValue;

    removeBackgroundItem = function () {
        var backgroundObjSet;

        backgroundObjSet = $('.background_warp>b');

        if (backgroundObjSet.length > 1) {
            $(backgroundObjSet)[0].remove();
            removeBackgroundItem();
        }
    };

    cssValue = (background.split('#')[0] === '') ? background : 'url("' + background + '")';
    cssItem = (background.split('#')[0] === '') ? 'background-color' : 'background-image';

    backgroundJqObj = $('<b>').css(cssItem, cssValue).hide();

    $('.background_warp').append(backgroundJqObj);

    backgroundObjSet = $('.background_warp>b');
    $(backgroundObjSet[backgroundObjSet.length - 1]).fadeIn(500);

    setTimeout(removeBackgroundItem, 500);
};

_bridge.changeAudio = function (audioLocation) {
    if (!audioLocation) return false;

    _bridge.audioEle.attr('src', audioLocation);
    _bridge.audioEle[0].play();
};

_bridge.refreshVideo = function () {
    $('.fullscreen_video').html('');
};

_bridge.changeVideo = function (videoLocation) {
    if (!videoLocation) return false;

    var videoContainer, newVideoElement;

    videoContainer = $('.fullscreen_video');
    newVideoElement = $('<video>').attr('autoplay', '1')
        .attr('src', videoLocation)
        .attr('controller', '')
        .fadeIn(500);

    videoContainer.html('')
        .append(newVideoElement);

};

$(function () {
    var volume, pauseVideo, elementPositionFix, inputFocus, inputBlur
        , requireIp, injectSocketScript, initSocket
        , setTimeCount, refreshTimeCounter, startTimeCount;

    requireIp = function () {
        var serverIp;
        serverIp = prompt('Please input the Ancient Class server IP: ');
        //serverIp = 'localhost';

        if (!serverIp) requireIp();

        return serverIp;
    };

    injectSocketScript = function (ip) {
        var scriptBody, scriptAddress;

        scriptAddress = 'http://' + ip + '/socket.io/socket.io.js';
        $.get(scriptAddress)
            .success(function () {
                scriptBody = $('<script>').attr('src', scriptAddress);
                $('body').append(scriptBody);

                socket = io('http://' + ip + '/presentView');
                initSocket(socket);
            })
            .fail(function () {
                injectSocketScript(requireIp());
                console.log('script not exists.');
            });
    };

    initSocket = function (socket) {
        console.log('socket init!');
        socket.emit('join', 'presentView');

        socket.on('activityData', function (data) {
            var listElement, iconElement, contentElement, lists;

            iconElement = $('<i>').attr('class', 'hobby-' + data.icon);
            contentElement = $('<span>').html(data.title);

            listElement = $('<li>').append(iconElement).append(contentElement).hide();

            $('#your_hobby .submitted').append(listElement);

            lists = $('#your_hobby .submitted li');

            $(lists[lists.length - 1]).slideDown();
        })
    };

    volume = function (event) {
        var player;
        player = _bridge.audioEle[0];

        if (event.wheelDeltaY > 0 && player.volume !== 1)
            player.volume = (player.volume + 0.1);

        if (event.wheelDeltaY < 0 && player.volume !== 0)
            player.volume = (player.volume - 0.1);


        event.preventDefault();
    };

    pauseVideo = function () {
        var videoElement;

        videoElement = $('video')[0];

        if (!videoElement) return false;

        if (videoElement.paused) videoElement.play();
        else videoElement.pause();
    };

    elementPositionFix = function (event) {
        var pointers, pointerElement, wordsContainerElement, pointerCount, squareSize
            , colCount, rowCount, thisStyle, thisElement, thisX, thisY, sumX, sumY
            , colFix, objCenters;

        pointerElement = $('<b>').html($('.new_hobby').val());
        wordsContainerElement = $('.words');
        wordsContainerElement.append(pointerElement);

        pointers = $('.words>b');
        pointerCount = pointers.length;
        squareSize = Math.round(Math.sqrt(pointerCount));
        colCount = rowCount = 1;
        objCenters = [];

        for (var i = 0; i < pointerCount; i++) {
            if (colCount > squareSize) {
                colCount = 1;
                rowCount++
            }

            colFix = (rowCount / 2 !== Math.ceil(rowCount / 2)) ? 0 : 50 / squareSize;
            thisElement = $(pointers[i]);

            thisX = 100 * colCount / (squareSize + 1) + colFix - 10;
            thisY = 100 * rowCount / (squareSize + 1) + Math.random() * 10 - 10;

            thisStyle = {
                'left': thisX + '%',
                'top': thisY + '%',
                'margin-top': -(50 + thisElement.height() / 2) + 'px',
                'margin-left': -(20 + thisElement.width() / 2) + 'px',
                'font-size': (pointerCount < 60 ? 110 - (pointerCount * 1.5) : 40) + 'px'
            };

            objCenters.push([thisX, thisY]);
            thisElement.css(thisStyle);

            colCount++;
        }

        sumX = sumY = 0;

        for (var j in objCenters) {
            sumX += parseInt(objCenters[j][0]);
            sumY += parseInt(objCenters[j][1]);
        }

        wordsContainerElement.css({
            'top': 50 - sumX / objCenters.length + '%',
            'left': 50 - sumY / objCenters.length + '%'
        });

        event.preventDefault();
    };

    inputFocus = function () {
        $(this).addClass('impressFocus');
    };

    inputBlur = function () {
        $(this).removeClass('impressFocus');
    };

    setTimeCount = function (mins, fn) {
        var baseTime, getNow, interval;

        baseTime = Date.parse(new Date()) / 1000 + mins * 60;

        getNow = function () {
            var timeMinus = baseTime - Date.parse(new Date()) / 1000;
            if (timeMinus <= 0) clearInterval(interval);
            fn(timeMinus);
        };

        interval = setInterval(getNow, 300);

        return interval;
    };

    refreshTimeCounter = function (element) {
        var refreshElement;

        refreshElement = function (timeLeft) {
            var minus, second;

            minus = Math.pad(Math.floor(timeLeft / 60), 2);
            second = Math.pad(timeLeft % 60, 2);

            $(element).html(minus + ':' + second);
        };

        return setTimeCount(2, refreshElement);
    };

    startTimeCount = function () {
        var intervalObject;

        intervalObject = refreshTimeCounter($('.timer'));

        $('#end_counter').one('click', function () {
            clearInterval(intervalObject);
        })
    };

    injectSocketScript(requireIp());
    document.addEventListener("mousewheel", volume);
    $(window).click(pauseVideo);
    $('#hobby_show').submit(elementPositionFix);
    $('input').focus(inputFocus).blur(inputBlur);
    $('#start_counter').click(startTimeCount);
    impress().init();
});