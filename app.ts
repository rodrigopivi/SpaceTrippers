///<reference path="vendor/jquery/jquery.d.ts"/>
///<reference path="vendor/Babylon.js/babylon.2.1.d.ts"/>
///<reference path="vendor/Babylon.js/References/poly2tri.d.ts"/>
///<reference path="vendor/Babylon.js/References/waa.d.ts"/>
///<reference path="lib/scene1/scene1.ts"/>

// avoid type definitions for jsflxlib
declare var jsfxlib: any;
declare var jsfx: any;
declare var webkitAudioContext: new () => AudioContext;

module Core {
    "use strict";
    var canvas: HTMLCanvasElement,
        engine: BABYLON.Engine,
        currentScene: any;

    export function updateStats(): void {
        var innerHtml: string = "FPS: " + engine.getFps().toFixed(2) + "<br />"
            + "Potential FPS: " + BABYLON.Tools.Format(1000.0 / currentScene.scene.getLastFrameDuration(), 0) + "<br />";
        document.getElementById("stats").style.width = "80px";
        document.getElementById("stats").style.height = "25px";
        document.getElementById("stats").innerHTML = innerHtml;
    }

    export function getRandomInRange(min, max): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function getBufferFromJsfx(context, lib) {
        var params = jsfxlib.arrayToParams(lib);
        var data = jsfx.generate(params);
        var buffer = context.createBuffer(1, data.length, 44100);
        var fArray = buffer.getChannelData(0);
        for (var i = 0; i < fArray.length; i++) {
            fArray[i] = data[i];
        }
        return buffer;
    }

    export var audioContext = window.AudioContext !== undefined ? new AudioContext() : new webkitAudioContext();
    export function playSoundFromAudioLib(soundId: string) {
        var source = audioContext.createBufferSource();
        source.buffer = audioLib[soundId];
        source.connect(audioContext.destination);
        source.start(0);
    }
    export var audioLib: any = {
        // audios generated from http://egonelbre.com/project/jsfx/
        shoot: getBufferFromJsfx(audioContext, ["square", 0.0000, 0.0700, 0.0250, 0.0940, 2.0610, 0.5680, 2392.0000, 265.0000, 33.0000, 0.4420, 0.6580, 0.8990, 10.2799, 0.0549, -0.1860, -0.5560, 0.6210, 0.3415, 0.1680, 0.3616, -0.5020, -0.1720, 0.9170, 0.4120, 0.2650, 0.4350, 0.1000]),
        powerUp: getBufferFromJsfx(audioContext, ["saw", 0.0000, 0.4000, 0.0000, 0.2400, 0.0000, 0.4480, 20.0000, 496.0000, 2400.0000, 0.2480, 0.0000, 0.6320, 13.6872, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]),
        move: getBufferFromJsfx(audioContext, ["square", 0.0000, 0.0380, 0.0000, 0.1440, 0.0000, 0.1100, 20.0000, 436.0000, 2400.0000, 0.3120, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.5000, 0.0000, 0.0000, 0.0000, 0.0000, 0.6450, 0.0000, 0.0000, 0.0000, 0.0000]),
        hit: getBufferFromJsfx(audioContext, ["noise", 0.0000, 0.0380, 0.0000, 0.0420, 0.0000, 0.1680, 20.0000, 648.0000, 2400.0000, -0.5140, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]),
        explosion: getBufferFromJsfx(audioContext, ["noise", 0.0000, 0.0380, 0.0000, 0.2780, 0.4110, 0.4700, 20.0000, 1417.0000, 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000])
    };

    export function mergeMeshes(meshName, arrayObj, scene): BABYLON.Mesh {
            var arrayPos = [];
            var arrayNormal = [];
            var arrayUv = [];
            var arrayUv2 = [];
            var arrayColor = [];
            var arrayMatricesIndices = [];
            var arrayMatricesWeights = [];
            var arrayIndice = [];
            var savedPosition = [];
            var savedNormal = [];
            var newMesh = new BABYLON.Mesh(meshName, scene);
            var UVKind = true;
            var UV2Kind = true;
            var ColorKind = true;
            var MatricesIndicesKind = true;
            var MatricesWeightsKind = true;

            for (var i = 0; i != arrayObj.length; i++) {
                if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.UVKind]))
                    UVKind = false;
                if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.UV2Kind]))
                    UV2Kind = false;
                if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.ColorKind]))
                    ColorKind = false;
                if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesIndicesKind]))
                    MatricesIndicesKind = false;
                if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesWeightsKind]))
                    MatricesWeightsKind = false;
            }

            for (i = 0; i != arrayObj.length; i++) {
                arrayPos[i] = arrayObj[i].getVerticesData(BABYLON.VertexBuffer.PositionKind);
                arrayNormal[i] = arrayObj[i].getVerticesData(BABYLON.VertexBuffer.NormalKind);
                if (UVKind)
                    arrayUv = arrayUv.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.UVKind));
                if (UV2Kind)
                    arrayUv2 = arrayUv2.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.UV2Kind));
                if (ColorKind)
                    arrayColor = arrayColor.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.ColorKind));
                if (MatricesIndicesKind)
                    arrayMatricesIndices = arrayMatricesIndices.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind));
                if (MatricesWeightsKind)
                    arrayMatricesWeights = arrayMatricesWeights.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind));

                var maxValue = savedPosition.length / 3;

                arrayObj[i].computeWorldMatrix(true);
                var worldMatrix = arrayObj[i].getWorldMatrix();

                for (var ite = 0; ite != arrayPos[i].length; ite += 3) {
                    var vertex = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(arrayPos[i][ite], arrayPos[i][ite + 1], arrayPos[i][ite + 2]), worldMatrix);
                    savedPosition.push(vertex.x);
                    savedPosition.push(vertex.y);
                    savedPosition.push(vertex.z);
                }

                for (var iter = 0; iter != arrayNormal[i].length; iter += 3) {
                    var vertex1 = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(arrayNormal[i][iter], arrayNormal[i][iter + 1], arrayNormal[i][iter + 2]), worldMatrix);
                    savedNormal.push(vertex1.x);
                    savedNormal.push(vertex1.y);
                    savedNormal.push(vertex1.z);
                }

                var tmp = arrayObj[i].getIndices();
                for (var it = 0; it != tmp.length; it++) {
                    arrayIndice.push(tmp[it] + maxValue);
                }
                arrayIndice = arrayIndice.concat(tmp);

                arrayObj[i].dispose(false);
            }

            newMesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, savedPosition, false);
            newMesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, savedNormal, false);
            if (arrayUv.length > 0)
                newMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, arrayUv, false);
            if (arrayUv2.length > 0)
                newMesh.setVerticesData(BABYLON.VertexBuffer.UV2Kind, arrayUv, false);
            if (arrayColor.length > 0)
                newMesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, arrayUv, false);
            if (arrayMatricesIndices.length > 0)
                newMesh.setVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind, arrayUv, false);
            if (arrayMatricesWeights.length > 0)
                newMesh.setVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind, arrayUv, false);

            newMesh.setIndices(arrayIndice);
            return newMesh;
        };

    export var scene;
    document.addEventListener("DOMContentLoaded",() => {
        if (BABYLON.Engine.isSupported()) {
            BABYLON.Engine.ShadersRepository = "/shaders/";
            // ***** Main Babylon initialization ***** //
            canvas = <HTMLCanvasElement>document.getElementById("renderCanvas");
            engine = new BABYLON.Engine(canvas, true);
            //engine.setHardwareScalingLevel(1);
            currentScene = new Core.Scene1.Scene(canvas, engine);
            scene = currentScene;
            //currentScene.scene.debugLayer.show();
            window.addEventListener("resize",() => { engine.resize(); });
        }
    }, false);
}