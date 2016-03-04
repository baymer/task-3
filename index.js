(function() {
    var controlFilter = document.querySelector('.controls__filter');
    var video = document.querySelector('.camera__video');
    var canvas = document.querySelector('.camera__canvas');
    var ctx = canvas.getContext('2d');

    var width;
    var height;

    var getVideoStream = function(callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var filters = {
        invert: function (pixel, i) {
            pixel[i] = 255 - pixel[i];
            pixel[i + 1] = 255 - pixel[i + 1];
            pixel[i + 2] = 255 - pixel[i + 2];
        },
        grayscale: function (pixel, i) {
            var v = 0.2126 * pixel[i] + 0.7152 * pixel[i + 1] + 0.0722 * pixel[i + 2];
            pixel[i] = pixel[i + 1] = pixel[i + 2] = v;
        },
        threshold: function (pixel, i) {
            var v = (0.2126 * pixel[i] + 0.7152 * pixel[i + 1] + 0.0722 * pixel[i + 2] >= 128) ? 255 : 0;
            pixel[i] = pixel[i + 1] = pixel[i + 2] = v;
        },
        scale: function (pixel, i) {
            pixel[i] = 255 % pixel[i];
            pixel[i + 1] = 255 % pixel[i + 1];
            pixel[i + 2] = 255 % pixel[i + 2];
        }
    };

    var applyFilter = function() {
        var filterName = controlFilter.value;
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        var length = data.length;
        var pixel;

        if (!filters[filterName]) {
            console.log("Filter ", filterName, " not supported");
            return false;
        }

        for(var i = 0; i < length; i += 4) {
            filters[filterName](pixel, i);
        }

        ctx.putImageData(imageData, 0, 0);

        return true;
    };

    var captureFrame = window.captureFrame = function() {
        ctx.drawImage(video, 0, 0);

        applyFilter() &&
        setTimeout(captureFrame, 16);
    };

    getVideoStream(function() {
        width = canvas.width = video.videoWidth;
        height = canvas.height = video.videoHeight;

        captureFrame();
    });
})();
