(function() {
    var hidden = "hidden";

    // Standards:, looks for at 'document' props to know the browser to target
    if (hidden in document)
        document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", onchange);
    // IE 9 and lower:
    else if ("onfocusin" in document)
        document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;

    function triggerBrowserTabChangedEvent(isVisible) {
      var evt = document.createEvent('Event');
      evt.initEvent('browsertabchanged', true, true);
      evt.active = isVisible;
      window.dispatchEvent(evt);
    }

    function onchange (evt) {
        var evtMap = {
              focus: true, focusin: true, pageshow: true,
              blur: false, focusout: false, pagehide: false
            };

        evt = evt || window.event;
        if (evt.type in evtMap) { triggerBrowserTabChangedEvent(evtMap[evt.type]); }
        else { triggerBrowserTabChangedEvent(!this[hidden]); }
        console.info("Browser tab changed");
    }
})();
