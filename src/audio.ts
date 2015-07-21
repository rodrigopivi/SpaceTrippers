module Core.Audio {
  export interface IAudioItem {
    shoot: any;
    gameOver: any;
    move: any;
    hit: any;
    collision: any;
    explosion: any;
  }
  export var audioContext = window.AudioContext !== undefined ? new AudioContext() : new webkitAudioContext();
  export var library: IAudioItem = <IAudioItem>{
    // audios generated from http://egonelbre.com/project/jsfx/
    shoot: getBufferFromJsfx(audioContext, ["square", 0.0000, 0.0700, 0.0250, 0.0940, 2.0610, 0.5680, 2392.0000, 265.0000, 33.0000, 0.4420, 0.6580, 0.8990, 10.2799, 0.0549, -0.1860, -0.5560, 0.6210, 0.3415, 0.1680, 0.3616, -0.5020, -0.1720, 0.9170, 0.4120, 0.2650, 0.4350, 0.1000]),
    gameOver: getBufferFromJsfx(audioContext, ["saw", 0.0000, 0.4000, 0.0000, 0.2400, 0.0000, 0.4480, 20.0000, 496.0000, 2400.0000, 0.2480, 0.0000, 0.6320, 13.6872, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]),
    move: getBufferFromJsfx(audioContext, ["square", 0.0000, 0.0380, 0.0000, 0.1440, 0.0000, 0.1100, 20.0000, 436.0000, 2400.0000, 0.3120, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.5000, 0.0000, 0.0000, 0.0000, 0.0000, 0.6450, 0.0000, 0.0000, 0.0000, 0.0000]),
    hit: getBufferFromJsfx(audioContext, ["noise", 0.0000, 0.0380, 0.0000, 0.0420, 0.0000, 0.1680, 20.0000, 648.0000, 2400.0000, -0.5140, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]),
    collision: getBufferFromJsfx(audioContext, ["noise", 0.0000, 0.0380, 0.0000, 0.2780, 0.4110, 0.4700, 20.0000, 1417.0000, 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]),
    explosion: getBufferFromJsfx(audioContext, ["noise", 0.0000, 0.2360, 0.0000, 0.3600, 0.7170, 0.4120, 20.0000, 265.0000, 1826.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, -0.6640, 0.7570, 0.0000, 0.0000, 0.0000, 0.3580, -0.0280, 0.9750, 0.0000, 0.0000, 0.0000, 0.0000])
  };
  export function getBufferFromJsfx(context: any, lib: any) {
    var params = jsfxlib.arrayToParams(lib),
      data = jsfx.generate(params),
      buffer = context.createBuffer(1, data.length, 44100),
      fArray = buffer.getChannelData(0);
    for (var i = 0; i < fArray.length; i++) {
      fArray[i] = data[i];
    }
    return buffer;
  }
  export function playSoundFromAudioLib(soundId: string) {
    var source = audioContext.createBufferSource();
    source.buffer = library[soundId];
    source.connect(audioContext.destination);
    source.start ? source.start(0) : source["noteOn"](0);
  }
}
