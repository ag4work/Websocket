/**
 * Created by agordeev on 02.04.2018.
 */
var Game = {};
Game.init = function(canvasId) {
    var direction;
    var leftPressed = 0;
    var rightPressed = 0;
    var spacePressed = 0;
    var WAIT_FOR_PLAYER = 0;
    var WAIT_FOR_START = 1;
    var PLAYING = 2;
    var GAME_OVER = 3;
    var gameState = WAIT_FOR_PLAYER;
    var playerName;
    function myrect(ctx, x, y, width, height, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.rect(x, y, width, height);
        ctx.fill();
        ctx.closePath();
    }
    function drawHuman1(player) {
        var w = canvas.width;
        var x = player.x;
        myrect(ctx, x * w / 100, 2, w / 10, canvas.height / 10, getColor(player));
        ctx.fillStyle = "white"; ctx.font = "15px Arial";
        ctx.fillText("Human1",(x+1) * w / 100, canvas.height / 20 + 4);
    }
    function drawHuman2(player) {
        var w = canvas.width;
        x = player.x;
        myrect(ctx, x * w / 100, canvas.height * 0.9 - 2, w / 10, canvas.height / 10, getColor(player));
        ctx.fillStyle = "white"; ctx.font = "15px Arial";
        ctx.fillText("Human2", (x+1) * w / 100, canvas.height * 0.95);
    }

    function getColor(player) {
        return player.alive ? "green" : "red";
    }

    function drawPC(player) {
        var w = canvas.width;
        var x = player.x;
        myrect(ctx, x * w / 100, canvas.height * 0.45, w / 10, canvas.height / 10, getColor(player));
        ctx.fillStyle = "white"; ctx.font = "15px Arial";
        ctx.fillText("PC", (x+1) * w / 100, canvas.height * 0.52);
    }

    function drawBullets(bullets) {
        var w = canvas.width;
        var h = canvas.height ;

        for (var i = 0; i < bullets.length; i++) {
            tx = bullets[i].x * w / 100;
            ty = bullets[i].y * h / 100;
            myrect(ctx, tx, ty, 2, 2, "red" );
        }
    }

    function keyUpHandler(e) {
        if (e.keyCode == '37') {
//            console.log("left key up");
            leftPressed = 0;
        }
        else if (e.keyCode == '39') {
//            console.log("right key up");
            rightPressed = 0;
        } else if (e.keyCode == '32') {
//            console.log("left key up");
            spacePressed = 0;
        }
    }

    function keyDownHandler(e) {
        if (e.keyCode == '37' && !leftPressed) {
//            console.log("left key down");
            Game.sendMessage("left");
            leftPressed = 1;
        }
        else if (e.keyCode == '39' && !rightPressed) {
//            console.log("right key down");
            Game.sendMessage("right");
            rightPressed = 1;
        }        else if (e.keyCode == '32' && !spacePressed) {
//            console.log("right key down");
            Game.sendMessage("shoot");
            spacePressed = 1;
        }
    }

    function left(ev) {
        Game.sendMessage("left");
    }
    function shoot(ev) {
        Game.sendMessage("shoot");
    }
    function right(ev) {
        Game.sendMessage("right");
    }

    function addKeyboardListners() {
        window.addEventListener('keydown', keyDownHandler, false);
        window.addEventListener('keyup', keyUpHandler, false);
        document.getElementById("left").ontouchstart = left;
        document.getElementById("shoot").ontouchstart = shoot;
        document.getElementById("right").ontouchstart = right;
    }
    function removeKeyboardListeners() {
        window.removeEventListener('keydown', keyDownHandler);
        window.removeEventListener('keyup', keyUpHandler);
    }

    Game.socket = {};
    Game.connect = function(host) {
        Game.socket = new WebSocket(host);
        Game.socket.onopen = function() {
            Console.log('Info: WebSocket connection opened.');
            Game.sendMessage("Hello from frontend");
        };
        Game.socket.onmessage = function (message) {
            var msg = JSON.parse(message.data);
            if (msg.messageType == "GameStarted") {
                gameState = PLAYING;
                playerName = msg.playerName;
                addKeyboardListners();
                Console.log("Game is starting. Your name:" + playerName);
            } else if (msg.messageType == "NotAllPlayers") {
                gameState = WAIT_FOR_PLAYER;
                Console.log("Waiting for another player");
            } else if (msg.messageType == "GameState") {
                // Console.log(JSON.stringify(msg));
                myrect(ctx, 0, 0, canvas.width, canvas.height, "black");
                drawHuman1(msg.playerDTOs[0]);
                drawHuman2(msg.playerDTOs[1]);
                drawPC(msg.playerDTOs[2]);
                drawBullets(msg.bullets);
            } else if (msg.messageType == "GameFinished") {
                gameState = GAME_OVER;
                removeKeyboardListeners();
                Console.log("Game over. Winner: " + msg.winnerName);
            }

        };
        Game.socket.onclose = function () {
            Console.log('Info: WebSocket closed.');
        };
    };
    Game.sendMessage = function(message) {
        Console.log("senging message:" + message);
        Game.socket.send(message);
    };

    var Console = {};
    Console.log = (function(message) {
        var console = document.getElementById('console');
        var p = document.createElement('p');
        p.style.wordWrap = 'break-word';
        p.innerHTML = message;
        console.appendChild(p);
        while (console.childNodes.length > 25) {
            console.removeChild(console.firstChild);
        }
        console.scrollTop = console.scrollHeight;
    });


    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    myrect(ctx, 0, 0, canvas.width, canvas.height, null);
    Game.connect('ws://' + window.location.host + window.location.pathname + '/websocket/endpoint');
};


