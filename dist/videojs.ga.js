(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  videojs.plugin('ga', function(options) {
    var dataSetupOptions, deafultsEventsToTrack, end, error, eventActionPrefix, eventCategory, eventLabel, eventsToTrack, fullscreen, loaded, parsedOptions, pause, percentsAlreadyTracked, percentsPlayedInterval, play, resize, seekEnd, seekStart, seeking, timeupdate, trackEvent, volumeChange, _gaq;
    if (options == null) {
      options = {};
    }
    dataSetupOptions = {};
    if (this.options()["data-setup"]) {
      parsedOptions = JSON.parse(this.options()["data-setup"]);
      if (parsedOptions.ga) {
        dataSetupOptions = parsedOptions.ga;
      }
    }
    deafultsEventsToTrack = ['loaded', 'percentsPlayed', 'start', 'srcType', 'end', 'seek', 'play', 'pause', 'resize', 'volumeChange', 'error', 'fullscreen'];
    eventsToTrack = options.eventsToTrack || dataSetupOptions.eventsToTrack || deafultsEventsToTrack;
    percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 10;
    eventActionPrefix = options.eventActionPrefix || dataSetupOptions.eventActionPrefix || "";
    eventCategory = options.eventCategory || dataSetupOptions.eventCategory || 'Video';
    eventLabel = options.eventLabel || dataSetupOptions.eventLabel;
    _gaq = _gaq || [];
    percentsAlreadyTracked = [];
    seekStart = seekEnd = 0;
    seeking = false;
    loaded = function() {
      var sourceType, tmpSrcArray;
      if (!eventLabel) {
        eventLabel = this.currentSrc().split("/").slice(-1)[0].replace(/\.(\w{3,4})(\?.*)?$/i, '');
      }
      if (__indexOf.call(eventsToTrack, "loadedmetadata") >= 0) {
        trackEvent('loadedmetadata');
      }
      if (__indexOf.call(eventsToTrack, "srcType") >= 0) {
        tmpSrcArray = this.currentSrc().split(".");
        sourceType = tmpSrcArray[tmpSrcArray.length - 1];
        trackEvent('srcType', "" + this.techName + "/" + sourceType);
      }
    };
    timeupdate = function() {
      var currentTime, duration, percent, percentPlayed, _i;
      currentTime = Math.round(this.currentTime());
      duration = Math.round(this.duration());
      percentPlayed = Math.round(currentTime / duration * 100);
      for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
        if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
          if (__indexOf.call(eventsToTrack, "start") >= 0 && percent === 0 && percentPlayed > 0) {
            trackEvent('start');
          } else if (__indexOf.call(eventsToTrack, "percentsPlayed") >= 0 && percentPlayed !== 0) {
            trackEvent("" + percent);
          }
          if (percentPlayed > 0) {
            percentsAlreadyTracked.push(percent);
          }
        }
      }
      if (__indexOf.call(eventsToTrack, "seek") >= 0) {
        seekStart = seekEnd;
        seekEnd = currentTime;
        if (Math.abs(seekStart - seekEnd) > 1) {
          seeking = true;
          trackEvent('seek start', seekStart);
          trackEvent('seek end', seekEnd);
        }
      }
    };
    end = function() {
      trackEvent('end');
    };
    play = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      if (currentTime > 0 && !seeking) {
        trackEvent('play', currentTime);
      }
      seeking = true;
    };
    pause = function() {
      var currentTime, duration;
      currentTime = Math.round(this.currentTime());
      duration = Math.round(this.duration());
      if (currentTime !== duration && !seeking) {
        trackEvent('pause', currentTime);
      }
    };
    volumeChange = function() {
      var volume;
      volume = this.muted() === true ? 0 : this.volume();
      trackEvent('volumeChange', volume);
    };
    resize = function() {
      trackEvent('resize', "" + this.width + "*" + this.height);
    };
    error = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      trackEvent('error', currentTime);
    };
    fullscreen = function() {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      if (this.isFullScreen) {
        trackEvent('enter fullscreen', currentTime);
      } else {
        trackEvent('exit fullscreen', currentTime);
      }
    };
    trackEvent = function(actions, value) {
      var action, gaArray, prefixedActions;
      prefixedActions = ((function() {
        var _i, _len, _ref, _results;
        _ref = actions.split(" ");
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          action = _ref[_i];
          _results.push(eventActionPrefix + action);
        }
        return _results;
      })()).join(' ');
      gaArray = ['_trackEvent', eventCategory, prefixedActions, eventLabel];
      if (value) {
        gaArray.push(value);
      }
      return _gaq.push(gaArray);
    };
    this.on("loadedmetadata", loaded);
    this.on("timeupdate", timeupdate);
    if (__indexOf.call(eventsToTrack, "end") >= 0) {
      this.on("ended", end);
    }
    if (__indexOf.call(eventsToTrack, "play") >= 0) {
      this.on("play", play);
    }
    if (__indexOf.call(eventsToTrack, "pause") >= 0) {
      this.on("pause", pause);
    }
    if (__indexOf.call(eventsToTrack, "volumeChange") >= 0) {
      this.on("volumechange", volumeChange);
    }
    if (__indexOf.call(eventsToTrack, "resize") >= 0) {
      this.on("resize", resize);
    }
    if (__indexOf.call(eventsToTrack, "error") >= 0) {
      this.on("error", error);
    }
    if (__indexOf.call(eventsToTrack, "fullscreen") >= 0) {
      this.on("fullscreenchange", fullscreen);
    }
  });

}).call(this);
