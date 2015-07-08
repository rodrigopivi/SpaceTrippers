///<reference path="../typings/poly2tri.d.ts"/>
///<reference path="../typings/jsfx.d.ts"/>
///<reference path="../typings/babylon.2.1.d.ts"/>
///<reference path="utilities.ts"/>
///<reference path="audio.ts"/>
///<reference path="mainScene/mainScene.ts"/>

module Core {
    "use strict";

    export module Audio {}
    export module Utilities {}
    export module MainScene {}


    export module Game {
        export var canvas: HTMLCanvasElement;
        export var engine: BABYLON.Engine;
        export var currentScene: Core.MainScene.Scene;

        document.addEventListener("DOMContentLoaded", () => {
            if (BABYLON.Engine.isSupported()) {
                BABYLON.Engine.ShadersRepository = "/shaders/";

                canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
                engine = new BABYLON.Engine(canvas, true);

                currentScene = new Core.MainScene.Scene(canvas, engine);

                // currentScene.scene.debugLayer.show();
                // window.addEventListener("resize", () => { engine.resize(); });
            }
        }, false);

    }
}
