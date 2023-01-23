import $ from "./jquery.js";

console.log("load");
console.log("loaded");

$(function() {
  // config
  const REPLAY_SCALE = 1;
  let SPEED = 1;

  const $area = $('#area')

  // init elements
  const $begin = $("#start");
  // const $pause = $("#pause")
  const $record = $("#record");
  const $body = $("body");
  let $times = []
  $begin.attr("disabled", 1);
  // $pause.attr("disabled", 1)
  
  const $timeline = $("#line") 

  // Data type for storing a recording
  const recording = { events: [], startTime: -1, htmlCopy: "" };
  const video =[]

  // Record each type of event
  const handlers = [
    // {
    //   eventName: "mousemove",
    //   handler: function handleMouseMove(e) {
    //     recording.events.push({
    //       type: "mousemove",
    //       x: e.pageX,
    //       y: e.pageY,
    //       time: Date.now()
    //     });
    //   }
    // },
    // {
    //   eventName: "click",
    //   handler: function handleClick(e) {
    //     recording.events.push({
    //       type: "click",
    //       target: e.target,
    //       x: e.pageX,
    //       y: e.pageY,
    //       time: Date.now()
    //     });
    //   }
    // },
    {
      eventName: "keypress",
      handler: function handleKeyPress(e) {
        recording.events.push({
          type: "keypress",
          target: e.target,
          value: e.target.value,
          keyCode: e.keyCode,
          time: Date.now()
        });
      }
    }
  ];

  // Attach recording button
  $record.toggle(
    function startRecording() {
      // start recording
      $record.text("Recording (Click again to Stop)");
      $begin.attr("disabled", 1);
      recording.startTime = Date.now();
      recording.events = [];
      recording.htmlCopy = $(document.documentElement).html(); // There is something here, change from html to the wanted div
      recording.height = $(window).height();
      recording.width = $(window).width();
      handlers.map(x => listen(x.eventName, x.handler));
    },
    function stopRecording() {
      // stop recording
      recording.stopTime = Date.now()
      $record.text("Record");
      $begin.removeAttr("disabled");
      handlers.map(x => removeListener(x.eventName, x.handler));
      video.push(recording)
    }
  );

  // Replay
  $begin.click(function() {
    // init iframe set scale
    SPEED = 1
    const $iframe = $("<iframe>");
    $iframe.height(recording.height * REPLAY_SCALE);
    $iframe.width(recording.width * REPLAY_SCALE);
    $iframe.css({
      "-ms-zoom": `${REPLAY_SCALE}`,
      "-moz-transform": `scale(${REPLAY_SCALE})`,
      "-moz-transform-origin": `0 0`,
      "-o-transform": `scale(${REPLAY_SCALE})`,
      "-o-transform-origin": `0 0`,
      "-webkit-transform": `scale(${REPLAY_SCALE})`,
      "-webkit-transform-origin": `0 0`
    });
    $body.append($iframe);

    

    // Load HTML
    $iframe[0].contentDocument.documentElement.innerHTML = recording.htmlCopy;
    const $iframeDoc = $($iframe[0].contentDocument.documentElement);


    // Insert fake cursor
    const $fakeCursor = $('<div class="cursor"></div>');
    let $seek = $('<input id="dur" type="range" name="rng" min="0" step="0.25"   value="0" style="width: 248px">')
    let $vents = recording.events

    for(let i=0; i<$vents.length; i++){
      $times.push($vents[i].time)
      // let $iframeDoc.currentTime = i
    }
    // console
    console.log(recording.events)
    // console
    console.log($times)

    function mDur(){
      let $dope = $drip[drip.length - 1]
      $seek.max = $dope.time
    }
    function mPlay(){
      $seek.value = $iframeDoc.currentTime
    }
    function mSet(){
      $iframeDoc.currentTime = $seek.value
    }
    
    const $pause = $('<button id="pause" color="red">Pause</button>')
    const $play = $('<button id="pause" color="red">Play</button>')


    // $iframeDoc.find("body").append($fakeCursor);
    $iframeDoc.find("body").append($seek);
    $iframeDoc.find("body").append($pause)
    $iframeDoc.find("body").append($play)

    $pause.click(function() {
      SPEED -= 1
    })

    // $iframeDoc.click(function(){
    //   SPEED = -1
    // })
    

    $play.click(function() {
      SPEED += 1
    })
    // $pause.removeAttr("disabled");
    let i = 0;
    const startPlay = Date.now();

    


    (function draw() {
      let event = recording.events[i];
      if (!event) {
        return;
      }
      let offsetRecording = event.time - recording.startTime;
      let offsetPlay = (Date.now() - startPlay) * SPEED; 
      if (offsetPlay >= offsetRecording) {
        drawEvent(event, $fakeCursor, $iframeDoc);
        i++;
      }
      // console// 
      console.log(recording.stopTime, recording.startTime)
      
      if (i < recording.events.length) {
        requestAnimationFrame(draw);
      } else {
        $iframe.SPEED == 0;
      }
    })();
  });


  function drawEvent(event, $fakeCursor, $iframeDoc) {
    if (event.type === "click" || event.type === "mousemove") {
      $fakeCursor.css({
        top: event.y,
        left: event.x
      });
    }

    if (event.type === "click") {
      flashClass($fakeCursor, "click");
      const path = $(event.target).getPath();
      const $element = $iframeDoc.find(path);
      flashClass($element, "clicked");
    }

    if (event.type === "keypress") {
      const path = $(event.target).getPath();
      const $element = $iframeDoc.find(path);
      $element.trigger({ type: "keypress", keyCode: event.keyCode });
      $element.val(event.value);
    }
  }

  // Helpers

  function listen(eventName, handler) {
    // listens even if stopPropagation
    return document.documentElement.addEventListener(eventName, handler, true);
  }

  function removeListener(eventName, handler) {
    // removes listen even if stopPropagation
    return document.documentElement.removeEventListener(
      eventName,
      handler,
      true
    );
  }

  function flashClass($el, className) {
    $el
      .addClass(className)
      .delay(200)
      .queue(() => $el.removeClass(className).dequeue());
  }
});
