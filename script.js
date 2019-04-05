//Firebas settings
// Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();
// Create a storage reference from our storage service
var storageRef = storage.ref();

//HumanWorks : ModelShape to drawnshape
//Machine learns :  [Input] drawn shape [output]ModelShape

var ModelShape = {
    left: 0,
    top: 0,
    width: 0,
    height: 0
};


var canvas = null;
var ctx = null;

enable_draw = false;

function random(max, min) {
    return Math.floor(min + (Math.random() * 1000 % (max - min + 1)));
}

function setImage() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgb(25,25,25)';

    ModelShape.width = random(canvas.width, 10);
    ModelShape.left = random(canvas.width - ModelShape.width - 10, 10);
    ModelShape.height = random(canvas.height, 10);
    ModelShape.top = random(canvas.height - ModelShape.height - 10, 10);

    ctx.strokeRect(ModelShape.left, ModelShape.top, ModelShape.width, ModelShape.height);

    enable_draw = true;
}

function resetCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
}


function skip() {
    resetCanvas();
    setImage();
}


function save(blob, callback) {

    var ref = storageRef.child('rect_dataset/' + ModelShape.left + "_" + ModelShape.top + "_" + ModelShape.width + "_" + ModelShape.height + ".png");
    ref.put(blob).then(function(snapshot) {
        console.log('Upload succeed!');
        callback();
    });
}

function complete() {


    var ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = ImageData.data;

    var x = 0;
    var y = 0;

    for (i = 0; i < ImageData.width * ImageData.height * 4; i += 4) {
        // Do nothing with the colors red and green, set blue=255, and alpha=255:
        if (data[i + 0] != 255 && data[i + 1] != 0 && data[i + 2] != 0) {
            data[i + 0] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        }
    }

    ImageData.data = data;
    ctx.putImageData(ImageData, 0, 0);

    canvas.toBlob(function(pngBlob) {
        save(pngBlob, skip);
    });
}


window.onload = function() {
    canvas = document.getElementById('cvs');
    ctx = canvas.getContext("2d");
    setImage();

    //手書きの準備
    var moveflg = 0,
        Xpoint,
        Ypoint;

    //初期値（サイズ、色、アルファ値）の決定
    var defSize = 7,
        defColor = "rgb(255,0,0)";

    // PC対応
    canvas.addEventListener('mousedown', startPoint, false);
    canvas.addEventListener('mousemove', movePoint, false);
    canvas.addEventListener('mouseup', endPoint, false);
    // スマホ対応
    canvas.addEventListener('touchstart', startPoint, false);
    canvas.addEventListener('touchmove', movePoint, false);
    canvas.addEventListener('touchend', endPoint, false);

    function startPoint(e) {

        if (enable_draw) {
            e.preventDefault();
            ctx.beginPath();

            Xpoint = e.layerX;
            Ypoint = e.layerY;
            ctx.moveTo(Xpoint, Ypoint);
            defSize = random(14, 2);
        }
    }

    function movePoint(e) {
        if (enable_draw) {
            if (e.buttons === 1 || e.witch === 1 || e.type == 'touchmove') {
                Xpoint = e.layerX;
                Ypoint = e.layerY;
                moveflg = 1;

                ctx.lineTo(Xpoint, Ypoint);
                ctx.lineCap = "round";
                ctx.strokeStyle = defColor;
                ctx.lineWidth = defSize;
                ctx.stroke();

            }
        }
    }

    function endPoint(e) {
        if (enable_draw) {
            if (moveflg === 0) {
                ctx.lineTo(Xpoint - 1, Ypoint - 1);
                ctx.lineCap = "round";
                ctx.lineWidth = defSize * 2;
                ctx.strokeStyle = defColor;
                ctx.stroke();

            }
            moveflg = 0;
        }
    }
}