///<reference path="vendor/Babylon.js/babylon.2.0.d.ts"/>
///<reference path="vendor/Babylon.js/References/poly2tri.d.ts"/>
///<reference path="vendor/Babylon.js/References/waa.d.ts"/>
///<reference path="lib/scene1/scene1.ts"/>
var Core;
(function (Core) {
    "use strict";

    var canvas, engine, currentScene;

    function updateStats() {
        console.log(currentScene);
        var innerHtml = "FPS: " + engine.getFps().toFixed(2) + "<br />" + "Total vertices: " + currentScene.scene.getTotalVertices().toFixed(2) + "<br>" + "Active vertices: " + currentScene.scene.getActiveVertices().toFixed(2) + "<br>" + "Active particles: " + currentScene.scene.getActiveParticles().toFixed(2) + "<br><br><br>" + "Frame duration: " + currentScene.scene.getLastFrameDuration().toFixed(2) + " ms<br><br>" + "<i>Evaluate Active Meshes duration:</i> " + currentScene.scene.getEvaluateActiveMeshesDuration().toFixed(2) + " ms<br>" + "<i>Render Targets duration:</i> " + currentScene.scene.getRenderTargetsDuration().toFixed(2) + " ms<br>" + "<i>Particles duration:</i> " + currentScene.scene.getParticlesDuration().toFixed(2) + " ms<br>" + "<i>Sprites duration:</i> " + currentScene.scene.getSpritesDuration().toFixed(2) + " ms<br>" + "<i>Render duration:</i> " + currentScene.scene.getRenderDuration().toFixed(2) + " ms";
        document.getElementById("stats").innerHTML = innerHtml;
    }
    Core.updateStats = updateStats;
    ;
    document.addEventListener("DOMContentLoaded", function () {
        if (BABYLON.Engine.isSupported()) {
            BABYLON.Engine.ShadersRepository = "/shaders/";

            // ***** Main Babylon initialization ***** //
            canvas = document.getElementById("renderCanvas");
            engine = new BABYLON.Engine(canvas, true);
            currentScene = new Core.Scene1.Scene(canvas, engine);

            window.addEventListener("resize", function () {
                engine.resize();
            });
        }
    }, false);
})(Core || (Core = {}));
//# sourceMappingURL=app.js.map
