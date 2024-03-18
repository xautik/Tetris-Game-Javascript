(function () {
  var isStart = false;
  var tetris = {
    // Existing code...

    // New variables for timer and high score
    startTime: null,
    highScore: 0,

    init: function () {
      isStart = true;
      this.startTime = new Date();
      // Existing initialization code...
    },

    initTimer: function () {
      var me = this;
      var tLoop = function () {
        var currentTime = new Date();
        var elapsedTime = Math.floor((currentTime - me.startTime) / 1000); // in seconds
        me.time = elapsedTime;
        me.setInfo('time');
        me.timer = setTimeout(tLoop, 1000); // Update time every second
      };
      this.timer = setTimeout(tLoop, 1000);
    },

    // New function to update high score
    updateHighScore: function () {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        // You can add code here to display/update the high score in your UI
      }
    },

    // Existing code...

    gameOver: function () {
      this.updateHighScore(); // Update high score when game over
      // Existing game over code...
    },

    // Existing code...
  };

  const btn = document.querySelector('#start');
  btn.addEventListener('click', function () {
    if (!isStart) {
      tetris.init();
      tetris.initTimer(); // Start the timer when game starts
    }
  });

  const btn2 = document.querySelector('#pause');
  btn2.addEventListener('click', function () {
    if (isStart) {
      tetris.togglePause();
    }
  });

})();

if (!Array.prototype.eachdo) {
  Array.prototype.eachdo = function (fn) {
    for (var i = 0; i < this.length; i++) {
      fn.call(this[i], i);
    }
  };
}
if (!Array.prototype.remDup) {
  Array.prototype.remDup = function () {
    var temp = [];
    for (var i = 0; i < this.length; i++) {
      var bool = true;
      for (var j = i + 1; j < this.length; j++) {
        if (this[i] === this[j]) {
          bool = false;
        }
      }
      if (bool === true) {
        temp.push(this[i]);
      }
    }
    return temp;
  };
}
