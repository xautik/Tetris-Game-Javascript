(function () {
  var isStart = false;
  var tetris = {
    // Existing code...
  };

  // Helper function to iterate over array elements
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
      var T, k;
      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }
      var O = Object(this);
      var len = O.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
      }
      if (arguments.length > 1) {
        T = thisArg;
      }
      k = 0;
      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };
  }

  const startBtn = document.querySelector('#start');
  startBtn.addEventListener('click', function () {
    if (!isStart) {
      tetris.init();
      isStart = true;
    }
  });

  const pauseBtn = document.querySelector('#pause');
  pauseBtn.addEventListener('click', function () {
    if (isStart) {
      tetris.togglePause();
    }
  });
})();
