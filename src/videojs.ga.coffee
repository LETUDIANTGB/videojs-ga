##
# ga
# https://github.com/mickey/videojs-ga
#
# Copyright (c) 2013 Michael Bensoussan
# Licensed under the MIT license.
##

videojs.plugin 'ga', (options = {}) ->
  # this loads options from the data-setup attribute of the video tag
  dataSetupOptions = {}
  if @options()["data-setup"]
    parsedOptions = JSON.parse(@options()["data-setup"])
    dataSetupOptions = parsedOptions.ga if parsedOptions.ga

  deafultsEventsToTrack = [
    'loaded', 'percentsPlayed', 'start', 'srcType'
    'end', 'seek', 'play', 'pause', 'resize',
    'volumeChange', 'error', 'fullscreen'
  ]
  eventsToTrack = options.eventsToTrack || dataSetupOptions.eventsToTrack || deafultsEventsToTrack
  percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 10
  eventActionPrefix = options.eventActionPrefix || dataSetupOptions.eventActionPrefix || ""

  eventCategory = options.eventCategory || dataSetupOptions.eventCategory || 'Video'
  # if you didn't specify a name, it will be 'guessed' from the video src after metadatas are loaded
  eventLabel = options.eventLabel || dataSetupOptions.eventLabel

  # init a few variables
  _gaq = _gaq || []
  percentsAlreadyTracked = []
  seekStart = seekEnd = 0
  seeking = false

  loaded = ->
    unless eventLabel
      eventLabel = @currentSrc().split("/").slice(-1)[0].replace(/\.(\w{3,4})(\?.*)?$/i,'')

    if "loadedmetadata" in eventsToTrack
      trackEvent('loadedmetadata')

    if "srcType" in eventsToTrack
      tmpSrcArray = @currentSrc().split(".")
      sourceType = tmpSrcArray[tmpSrcArray.length - 1]
      trackEvent('srcType', "#{@techName}/#{sourceType}")

    return

  timeupdate = ->
    currentTime = Math.round(@currentTime())
    duration = Math.round(@duration())
    percentPlayed = Math.round(currentTime/duration*100)

    for percent in [0..99] by percentsPlayedInterval
      if percentPlayed >= percent && percent not in percentsAlreadyTracked

        if "start" in eventsToTrack && percent == 0 && percentPlayed > 0
          trackEvent('start')
        else if "percentsPlayed" in eventsToTrack && percentPlayed != 0
          trackEvent("#{percent}")

        if percentPlayed > 0
          percentsAlreadyTracked.push(percent)

    if "seek" in eventsToTrack
      seekStart = seekEnd
      seekEnd = currentTime
      # if the difference between the start and the end are greater than 1 it's a seek.
      if Math.abs(seekStart - seekEnd) > 1
        seeking = true
        trackEvent('seek start', seekStart)
        trackEvent('seek end', seekEnd)
    return

  end = ->
    trackEvent('end')
    return

  play = ->
    currentTime = Math.round(@currentTime())
    if currentTime > 0 && !seeking
      trackEvent('play', currentTime)
    seeking = true
    return

  pause = ->
    currentTime = Math.round(@currentTime())
    duration = Math.round(@duration())
    if currentTime != duration && !seeking
      trackEvent('pause', currentTime)
    return

  # value between 0 (muted) and 1
  volumeChange = ->
    volume = if @muted() == true then 0 else @volume()
    trackEvent('volumeChange', volume)
    return

  resize = ->
    trackEvent('resize', "#{@width}*#{@height}")
    return

  error = ->
    currentTime = Math.round(@currentTime())
    # XXX: Is there some informations about the error somewhere ?
    trackEvent('error', currentTime)
    return

  fullscreen = ->
    currentTime = Math.round(@currentTime())
    if @isFullScreen
      trackEvent('enter fullscreen', currentTime)
    else
      trackEvent('exit fullscreen', currentTime)
    return

  trackEvent = (actions, value) ->
    prefixedActions = (eventActionPrefix + action for action in actions.split(" ")).join(' ')
    gaArray = ['_trackEvent', eventCategory, prefixedActions, eventLabel]
    if value
      gaArray.push(value)
    _gaq.push(gaArray)

  @on("loadedmetadata", loaded)
  @on("timeupdate", timeupdate)
  @on("ended", end) if "end" in eventsToTrack
  @on("play", play) if "play" in eventsToTrack
  @on("pause", pause) if "pause" in eventsToTrack
  @on("volumechange", volumeChange) if "volumeChange" in eventsToTrack
  @on("resize", resize) if "resize" in eventsToTrack
  @on("error", error) if "error" in eventsToTrack
  @on("fullscreenchange", fullscreen) if "fullscreen" in eventsToTrack
  return
