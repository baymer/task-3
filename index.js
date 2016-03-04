(function () {
debugger
    var video = document.querySelector('.camera__video');
    var canvas = document.querySelector('.camera__canvas');
    var ctx = canvas.getContext('2d');

    var width;
    var height;

    var getVideoStream = function (callback) {
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
            var r = pixel[i];
            var g = pixel[i + 1];
            var b = pixel[i + 2];
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            pixel[i] = pixel[i + 1] = pixel[i + 2] = v;

            return pixel;
        },
        threshold: function (pixel, i) {
            var r = pixel[i];
            var g = pixel[i + 1];
            var b = pixel[i + 2];
            var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
            pixel[i] = pixel[i + 1] = pixel[i + 2] = v;

            return pixel;
        }
    };

    var applyFilterToPixel = function (pixel, filterName, i) {
        filters[filterName](pixel, i);
    };

    var applyFilter = function () {
        var filterName = document.querySelector('.controls__filter').value;
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        var length = data.length;
        var pixel;

        // if (filterName === prevFilter) { return; }

        // prevFilter = filterName;

        for(var y = 0; y < height; y++) {
            for(var x = 0; x < width; x++) {
                applyFilterToPixel(data, filterName, ((width * y) + x) * 4);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    getVideoStream(function captureFrame() {
        width = canvas.width = video.videoWidth;
        height = canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        applyFilter();
        setTimeout(captureFrame, 16);
    });
})();
