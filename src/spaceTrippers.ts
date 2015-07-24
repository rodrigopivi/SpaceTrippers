///<reference path="../typings/poly2tri.d.ts"/>
///<reference path="../typings/jsfx.d.ts"/>
///<reference path="../typings/babylon.2.1.d.ts"/>
///<reference path="utilities.ts"/>
///<reference path="audio.ts"/>
///<reference path="mainScene/mainScene.ts"/>

module Core {
  "use strict";

  export module Audio { }
  export module Utilities { }
  export module MainScene { }


  export module Game {
    export var canvas: HTMLCanvasElement;
    export var engine: BABYLON.Engine;
    export var currentScene: Core.MainScene.Scene;
    export var isEngineLoopRunning: boolean = false;

    document.addEventListener("DOMContentLoaded", () => {
      if (BABYLON.Engine.isSupported()) {
        BABYLON.Engine.ShadersRepository = "/shaders/";

        canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
        engine = new BABYLON.Engine(canvas, true);
        currentScene = new Core.MainScene.Scene(canvas, engine);

        // TODO: refactor this hack to activate sound for iOS WKWebView (need an event first to activate WebAudioApi)
        var audioEnabled = false;
        var hacktivateWebkitWebAudioFn = () => {
          if (!audioEnabled) { // we just need to hacktivate sound one time.
              Audio.playSoundFromAudioLib("move");
              audioEnabled = true;
              canvas.removeEventListener("touchmove", hacktivateWebkitWebAudioFn, false);
          }
        };
        canvas.addEventListener("touchmove", hacktivateWebkitWebAudioFn, false);
        window.addEventListener("browsertabchanged", (e: any) => {
          if (e.active) {
            currentScene.runRenderLoop();
          } else {
            isEngineLoopRunning = false;
            engine.stopRenderLoop();
          }
        }, false);
        // currentScene.scene.debugLayer.show();
        // window.addEventListener("resize", () => { engine.resize(); });
      }
    }, false);

  }
}
