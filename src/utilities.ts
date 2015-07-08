module Core.Utilities {
  "use strict";

  export function updateStats(): void {
    var innerHtml: string = "FPS: " + Core.Game.engine.getFps().toFixed(2) + "<br />"
    + "Potential FPS: " + BABYLON.Tools.Format(1000.0 / Core.Game.currentScene.scene.getLastFrameDuration(), 0) + "<br />";
    document.getElementById("stats").style.width = "80px";
    document.getElementById("stats").style.height = "25px";
    document.getElementById("stats").innerHTML = innerHtml;
  }

  export function getRandomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export function mergeMeshes(meshName: string, arrayObj: any[], scene: BABYLON.Scene): BABYLON.Mesh {
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
    var UVKind: boolean = true;
    var UV2Kind: boolean = true;
    var ColorKind: boolean = true;
    var MatricesIndicesKind: boolean = true;
    var MatricesWeightsKind: boolean = true;
    for (var i = 0; i !== arrayObj.length; i++) {
      if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.UVKind])) {
        UVKind = false;
      }
      if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.UV2Kind])) {
        UV2Kind = false;
      }
      if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.ColorKind])) {
        ColorKind = false;
      }
      if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesIndicesKind])) {
        MatricesIndicesKind = false;
      }
      if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesWeightsKind])) {
        MatricesWeightsKind = false;
      }
    }
    for (i = 0; i !== arrayObj.length; i++) {
      arrayPos[i] = arrayObj[i].getVerticesData(BABYLON.VertexBuffer.PositionKind);
      arrayNormal[i] = arrayObj[i].getVerticesData(BABYLON.VertexBuffer.NormalKind);
      if (UVKind) {
        arrayUv = arrayUv.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.UVKind));
      }
      if (UV2Kind) {
        arrayUv2 = arrayUv2.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.UV2Kind));
      }
      if (ColorKind) {
        arrayColor = arrayColor.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.ColorKind));
      }
      if (MatricesIndicesKind) {
        arrayMatricesIndices = arrayMatricesIndices.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind));
      }
      if (MatricesWeightsKind) {
        arrayMatricesWeights = arrayMatricesWeights.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind));
      }
      var maxValue = savedPosition.length / 3;
      arrayObj[i].computeWorldMatrix(true);
      var worldMatrix = arrayObj[i].getWorldMatrix();
      for (var ite = 0; ite !== arrayPos[i].length; ite += 3) {
        var vertex = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(arrayPos[i][ite], arrayPos[i][ite + 1], arrayPos[i][ite + 2]), worldMatrix);
        savedPosition.push(vertex.x);
        savedPosition.push(vertex.y);
        savedPosition.push(vertex.z);
      }
      for (var iter = 0; iter !== arrayNormal[i].length; iter += 3) {
        var vertex1 = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(arrayNormal[i][iter], arrayNormal[i][iter + 1], arrayNormal[i][iter + 2]), worldMatrix);
        savedNormal.push(vertex1.x);
        savedNormal.push(vertex1.y);
        savedNormal.push(vertex1.z);
      }
      var tmp = arrayObj[i].getIndices();
      for (var it = 0; it !== tmp.length; it++) {
        arrayIndice.push(tmp[it] + maxValue);
      }
      arrayIndice = arrayIndice.concat(tmp);

      arrayObj[i].dispose(false);
    }
    newMesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, savedPosition, false);
    newMesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, savedNormal, false);
    if (arrayUv.length > 0) {
      newMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, arrayUv, false);
    }
    if (arrayUv2.length > 0) {
      newMesh.setVerticesData(BABYLON.VertexBuffer.UV2Kind, arrayUv, false);
    }
    if (arrayColor.length > 0) {
      newMesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, arrayUv, false);
    }
    if (arrayMatricesIndices.length > 0) {
      newMesh.setVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind, arrayUv, false);
    }
    if (arrayMatricesWeights.length > 0) {
      newMesh.setVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind, arrayUv, false);
    }
    newMesh.setIndices(arrayIndice);
    return newMesh;
  };
}
