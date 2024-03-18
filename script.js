(function () {
  var isStart = false;
  var tetris = {
    board: [],
    boardDiv: null,
    canvas: null,
    pSize: 20,
    canvasHeight: 440,
    canvasWidth: 200,
    boardHeight: 0,
    boardWidth: 0,
    spawnX: 4,
    spawnY: 1,
    shapes: [
      [
        [-1, 1],
        [0, 1],
        [1, 1],
        [0, 0], //T
      ],
      [
        [-1, 0],
        [0, 0],
        [1, 0],
        [2, 0], //Flat
      ],
      [
        [-1, -1],
        [-1, 0],
        [0, 0],
        [1, 0], //L
      ],
      [
        [1, -1],
        [-1, 0],
        [0, 0],
        [1, 0], //L Reverse
      ],
      [
        [0, -1],
        [1, -1],
        [-1, 0],
        [0, 0], // S Reverse
      ],
      [
        [-1, -1],
        [0, -1],
        [0, 0],
        [1, 0], //S
      ],
      [
        [0, -1],
        [1, -1],
        [0, 0],
        [1, 0], //Square
      ],
    ],
    tempShapes: null,
    curShape: null,
    curShapeIndex: null,
    curX: 0,
    curY: 0,
    curSqs: [],
    nextShape: null,
    nextShapeDisplay: null,
    nextShapeIndex: null,
    sqs: [],
    score: 0,
    scoreDisplay: null,
    level: 1,
    levelDisplay: null,
    numLevels: 10,
    time: 0,
    maxTime: 1000,
    timeDisplay: null,
    isActive: 0,
    curComplete: false,
    timer: null,
    pTimer: null,
    speed: 700,
    lines: 0,

    init: function () {
      isStart = true;
      this.canvas = document.getElementById('canvas');
      this.initBoard();
      this.initInfo();
      this.initLevelScores();
      this.initShapes();
      this.bindKeyEvents();
      this.play();
    },
    initBoard: function () {
      this.boardHeight = this.canvasHeight / this.pSize;
      this.boardWidth = this.canvasWidth / this.pSize;
      var s = this.boardHeight * this.boardWidth;
      for (var i = 0; i < s; i++) {
        this.board.push(0);
      }
      //this.boardDiv = document.getElementById('board); //for debugging
    },
    initInfo: function () {
      this.nextShapeDisplay = document.getElementById('next_shape');
      this.levelDisplay = document
        .getElementById('level')
        .getElementsByTagName('span')[0];
      this.timeDisplay = document
        .getElementById('time')
        .getElementsByTagName('span')[0];
      this.scoreDisplay = document
        .getElementById('score')
        .getElementsByTagName('span')[0];
      this.linesDisplay = document
        .getElementById('lines')
        .getElementsByTagName('span')[0];
      this.setInfo('time');
      this.setInfo('score');
      this.setInfo('level');
      this.setInfo('lines');
    },
    initShapes: function () {
      this.curSqs = [];
      this.curComplete = false;
      this.shiftTempShapes();
      this.curShapeIndex = this.tempShapes[0];
      this.curShape = this.shapes[this.curShapeIndex];
      this.initNextShape();
      this.setCurCoords(this.spawnX, this.spawnY);
      this.drawShape(this.curX, this.curY, this.curShape);
    },
    initNextShape: function () {
      if (typeof this.tempShapes[1] === 'undefined') {
        this.initTempShapes();
      }
      try {
        this.nextShapeIndex = this.tempShapes[1];
        this.nextShape = this.shapes[this.nextShapeIndex];
        this.drawNextShape();
      } catch (e) {
        throw new Error('Could not create next shape. ' + e);
      }
    },
    initTempShapes: function () {
      this.tempShapes = [];
      for (var i = 0; i < this.shapes.length; i++) {
        this.tempShapes.push(i);
      }
      var k = this.tempShapes.length;
      while (--k) {
        //Shuffle
        var j = Math.floor(Math.random() * (k + 1));
        var tempk = this.tempShapes[k];
        var tempj = this.tempShapes[j];
        this.tempShapes[k] = tempj;
        this.tempShapes[j] = tempk;
      }
    },
    shiftTempShapes: function () {
      try {
        if (
          typeof this.tempShapes === 'undefined' ||
          this.tempShapes === null
        ) {
          this.initTempShapes();
        } else {
          this.tempShapes.shift();
        }
      } catch (e) {
        throw new Error('Could not shift tempShapes. ' + e);
      }
    },
    initLevelScores: function () {
      var n = this.numLevels;
      var i = 1;
      var a = [];
      while (n--) {
        var s = i * 500;
        a.push(s);
        i++;
      }
      this.levelScores = a.reverse();
    },
    bindKeyEvents: function () {
      var self = this;
      document.addEventListener('keydown', function (e) {
        self.move(e.keyCode);
      });
    },
    move: function (keycode) {
      if (this.isActive) {
        switch (keycode) {
          case 37:
            this.checkMove('left');
            break;
          case 38:
            this.rotate();
            break;
          case 39:
            this.checkMove('right');
            break;
          case 40:
            this.checkMove('down');
            break;
          default:
            return;
        }
      }
    },
    play: function () {
      var self = this;
      var gameOver = this.gameOver.bind(this);
      this.timer = setInterval(function () {
        if (self.curComplete) {
          self.checkComplete();
          self.initShapes();
        } else {
          self.checkMove('down');
        }
      }, this.speed);
    },
    togglePause: function () {
      if (this.isActive) {
        clearInterval(this.timer);
        clearInterval(this.pTimer);
        this.isActive = 0;
        this.drawPause();
      } else {
        this.play();
        this.isActive = 1;
      }
    },
    checkComplete: function () {
      for (var i = 0; i < this.curSqs.length; i++) {
        if (this.curSqs[i].y < 1) {
          this.gameOver();
          return;
        }
        this.board[this.curSqs[i].index] = 1;
      }
      this.checkRows();
      this.isActive = 0;
      this.curComplete = false;
      clearInterval(this.timer);
    },
    checkRows: function () {
      var board = this.board;
      var height = this.boardHeight;
      var width = this.boardWidth;
      var rows = [];
      var lines = 0;
      var score = this.score;
      var n = height;
      while (n--) {
        var i = n * width;
        var j = i + width;
        var k = j;
        while (i < j) {
          if (!board[i]) {
            break;
          }
          i++;
        }
        if (i === k) {
          rows.push(n);
          lines++;
          score += 100 * this.level;
        }
      }
      if (lines) {
        this.clearRows(rows, lines, score);
      }
    },
    clearRows: function (rows, lines, score) {
      var width = this.boardWidth;
      var board = this.board;
      var s = width * rows[0];
      var j = s + width;
      var len = board.length;
      for (var k = 0; k < rows.length; k++) {
        var n = rows[k] * width;
        var i = n + width;
        var m = n;
        while (i--) {
          board[i] = 0;
        }
        while (n < len) {
          while (n < j) {
            board.splice(n, 1);
            n++;
          }
          j += width;
        }
        board.splice(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
      this.lines += lines;
      this.level = Math.floor(this.lines / 10) + 1;
      this.setInfo('score', score);
      this.setInfo('lines');
      this.setInfo('level');
    },
    checkMove: function (dir) {
      var x = this.curX;
      var y = this.curY;
      var shape = this.curShape;
      var board = this.board;
      var boardWidth = this.boardWidth;
      var isMove = true;
      switch (dir) {
        case 'left':
          x--;
          break;
        case 'right':
          x++;
          break;
        case 'down':
          y++;
          break;
      }
      if (this.isValidMove(x, y, shape)) {
        this.curX = x;
        this.curY = y;
        this.clearShape();
        this.drawShape(x, y, shape);
      } else {
        if (dir === 'down') {
          this.curComplete = true;
        }
      }
    },
    rotate: function () {
      var shape = this.curShape;
      var origShape = shape.slice();
      var numBlocks = shape.length;
      var s = [];
      var i = numBlocks;
      while (i--) {
        s.push([]);
      }
      for (var i = 0; i < numBlocks; i++) {
        var x = shape[i][0];
        var y = shape[i][1];
        s[i][0] = y * -1;
        s[i][1] = x;
      }
      if (this.isValidMove(this.curX, this.curY, s)) {
        this.clearShape();
        this.drawShape(this.curX, this.curY, s);
        this.curShape = s;
      } else {
        return;
      }
    },
    isValidMove: function (x, y, shape) {
      var width = this.boardWidth;
      var height = this.boardHeight;
      for (var i = 0; i < shape.length; i++) {
        var newX = x + shape[i][0];
        var newY = y + shape[i][1];
        if (
          newX < 0 ||
          newX >= width ||
          newY >= height ||
          this.board[newX + newY * width]
        ) {
          return false;
        }
      }
      return true;
    },
    drawShape: function (x, y, shape) {
      for (var i = 0; i < shape.length; i++) {
        var sq = document.createElement('div');
        sq.className = 'square type' + this.curShapeIndex;
        sq.style.left = (x + shape[i][0]) * this.pSize + 'px';
        sq.style.top = (y + shape[i][1]) * this.pSize + 'px';
        this.canvas.appendChild(sq);
        this.curSqs.push({
          x: x + shape[i][0],
          y: y + shape[i][1],
          index: x + shape[i][0] + (y + shape[i][1]) * this.boardWidth,
        });
      }
    },
    clearShape: function () {
      var numSqs = this.curSqs.length;
      for (var i = 0; i < numSqs; i++) {
        this.canvas.removeChild(this.canvas.lastChild);
      }
      this.curSqs = [];
    },
    drawNextShape: function () {
      var shape = this.nextShape;
      var sqs = document.createDocumentFragment();
      for (var i = 0; i < shape.length; i++) {
        var sq = document.createElement('div');
                sq.className = 'square type' + this.nextShapeIndex;
        sq.style.left = shape[i][0] * this.pSize + 'px';
        sq.style.top = shape[i][1] * this.pSize + 'px';
        sqs.appendChild(sq);
      }
      this.nextShapeDisplay.innerHTML = '';
      this.nextShapeDisplay.appendChild(sqs);
    },
    setInfo: function (type, score) {
      switch (type) {
        case 'time':
          this.timeDisplay.innerHTML = this.time;
          break;
        case 'score':
          this.scoreDisplay.innerHTML = score ? score : this.score;
          break;
        case 'level':
          this.levelDisplay.innerHTML = this.level;
          break;
        case 'lines':
          this.linesDisplay.innerHTML = this.lines;
          break;
      }
    },
    gameOver: function () {
      clearInterval(this.timer);
      clearInterval(this.pTimer);
      isStart = false;
      this.canvas.innerHTML = '<h1>Game Over</h1>';
      var pause = document.getElementById('pause');
      pause.innerHTML = 'Restart';
      pause.onclick = function () {
        if (!isStart) location.reload();
      };
    },
    drawPause: function () {
      var pause = document.getElementById('pause');
      pause.innerHTML = 'Resume';
      pause.onclick = this.togglePause.bind(this);
    },
  };

  document.getElementById('start').addEventListener('click', function () {
    if (!isStart) tetris.init();
  });

  document.getElementById('pause').addEventListener('click', function () {
    tetris.togglePause();
  });
})();


                          
