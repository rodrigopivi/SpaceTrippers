///<reference path="../typings/poly2tri.d.ts"/>
///<reference path="../typings/jsfx.d.ts"/>
///<reference path="../typings/babylon.2.2.d.ts"/>
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
    export var hasStarted: boolean = false;
    export var isPaused: boolean = false;

    document.addEventListener("DOMContentLoaded", () => {
      if (BABYLON.Engine.isSupported()) {
        BABYLON.Engine.ShadersRepository = "/shaders/";

        canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
        engine = new BABYLON.Engine(canvas, true);
        //var screenSizes: number[] = Utilities.getScreenSize();
        //if (screenSizes[0] > 800 || screenSizes[1] > 600) {
          engine.setHardwareScalingLevel(1);
        //}
        engine.loadingUIBackgroundColor = "Black";
        currentScene = new Core.MainScene.Scene();
        Audio.enableWebkitWebAudio(canvas);

        window.addEventListener("browsertabchanged", (e: any) => {
          if (Game.hasStarted) {
            if (e.active) {
              if (Game.isPaused) { currentScene.runRenderLoop(); }
            } else {
              Game.isPaused = true;
              engine.stopRenderLoop();
            }
          }
        }, false);
        //currentScene.scene.debugLayer.show();
        window.addEventListener("resize", () => { engine.resize(); });
      }
    }, false);

  }
}
