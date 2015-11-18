module Core.MainScene {

  export interface IRoadBlocks {
    nextBlockPositionZ: number;
    blocks: BABYLON.Mesh[];
    lanesPositionX: number[];
  }

  export class Track {
    private static totalLanes: number = 7;
    private static laneInterval: number = 33;
    private static totalBlocksPerLane: number = 18;
    private static blockInterval: number = 33;
    private static blocksWidth: number = 23;
    private static blocksHeight: number = 3;
    private static blocksLength: number = 80;

    private scene: Core.MainScene.Scene;
    private originalBlock: BABYLON.Mesh;
    private blocksMaterial: BABYLON.StandardMaterial;
    private currentBlocksColor: BABYLON.Color3 = new BABYLON.Color3(
      Core.Utilities.getRandomInRange(1, 9) * 0.1,
      Core.Utilities.getRandomInRange(1, 9) * 0.1,
      Core.Utilities.getRandomInRange(1, 9) * 0.1
      );

    public static trackBlockZDimention: number = Track.totalBlocksPerLane * (Track.blocksLength + Track.blockInterval);
    public roadBlocks: IRoadBlocks;
    public repositionFirstLineOfBlocks: () => void;

    constructor(scene: Core.MainScene.Scene) {
      var self = this;
      this.scene = scene;
      preloadAssets();
      createBlocksMaterial();
      createOriginalBlock();
      generateTrack();
      recursiveChangeBlocksColor();

      this.repositionFirstLineOfBlocks = () => {
        var rowBlock = this.roadBlocks.blocks.shift();
        rowBlock.position.z = this.roadBlocks.nextBlockPositionZ;
        this.roadBlocks.blocks.push(rowBlock);
        this.roadBlocks.nextBlockPositionZ += Track.trackBlockZDimention;
      };

      function preloadAssets(): void {
        self.scene.assetsManager.addImageTask("cosmicboxnx", "/assets/cosmicskybox/cosmicskybox_nx.jpg");
        self.scene.assetsManager.addImageTask("cosmicboxnx", "/assets/cosmicskybox/cosmicskybox_ny.jpg");
        self.scene.assetsManager.addImageTask("cosmicboxnx", "/assets/cosmicskybox/cosmicskybox_nz.jpg");
        self.scene.assetsManager.addImageTask("cosmicboxnx", "/assets/cosmicskybox/cosmicskybox_px.jpg");
        self.scene.assetsManager.addImageTask("cosmicboxnx", "/assets/cosmicskybox/cosmicskybox_py.jpg");
        self.scene.assetsManager.addImageTask("cosmicboxnx", "/assets/cosmicskybox/cosmicskybox_pz.jpg");
      }

      function recursiveChangeBlocksColor(): void {
        self.currentBlocksColor = new BABYLON.Color3(
          Core.Utilities.getRandomInRange(1, 9) * 0.1,
          Core.Utilities.getRandomInRange(1, 9) * 0.1,
          Core.Utilities.getRandomInRange(1, 9) * 0.1
          );
        self.blocksMaterial.diffuseColor = self.currentBlocksColor;
        setTimeout(() => { recursiveChangeBlocksColor(); }, 10000);
      }

      function createBlocksMaterial(): void {
        self.blocksMaterial = new BABYLON.StandardMaterial("blocks Material", self.scene.scene);
        self.blocksMaterial.backFaceCulling = true;
        self.blocksMaterial.reflectionTexture = new BABYLON.CubeTexture("/assets/cosmicskybox/cosmicskybox", self.scene.scene);
        self.blocksMaterial.reflectionTexture.level = 0.8;
        self.blocksMaterial.specularPower = 10;
        self.blocksMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
        self.blocksMaterial.ambientColor = new BABYLON.Color3(0, 0, 0);
        self.blocksMaterial.diffuseColor = self.currentBlocksColor;
        self.blocksMaterial.alpha = 1;
        self.blocksMaterial.emissiveFresnelParameters = new BABYLON.FresnelParameters();
        self.blocksMaterial.emissiveFresnelParameters.bias = 0.4;
        self.blocksMaterial.emissiveFresnelParameters.power = 140;
      }

      function createOriginalBlock(): void {
        self.originalBlock = BABYLON.Mesh.CreateBox("original Block", 1, self.scene.scene);
        self.originalBlock.scaling.y = Track.blocksHeight;
        self.originalBlock.scaling.z = Track.blocksLength;
        self.originalBlock.isVisible = false;
      }

      function createBlock (blockId: string, positionZ: number, positionX: number): BABYLON.Mesh {
        var block = self.originalBlock.clone(blockId);
        block.scaling.x = Track.blocksWidth;
        block.scaling.y = Track.blocksHeight;
        block.scaling.z = Track.blocksLength;
        block.position.z = positionZ;
        block.position.x = positionX;
        block.position.y -= Track.blocksHeight / 2;
        return block;
      }

      function generateTrack() {
        var currentRowPositionZ: number = (Track.blocksLength) / 2,
            trackBlocks: BABYLON.Mesh[] = [],
            originalTrackBlock: BABYLON.Mesh;
        self.roadBlocks = { nextBlockPositionZ: 0, blocks: [], lanesPositionX: [] };
        for (var i = 0; i < Track.totalBlocksPerLane; i++) {
          var originalRowBlock: BABYLON.Mesh;
          if (!i) { // Create a row one time only
            var rowBlocks: BABYLON.Mesh[] = [],
                currentBlockPositionX: number = -1 * (Track.laneInterval * Track.totalLanes / 2);
            for (var j = 0; j < Track.totalLanes; j++) {
              var newBlock: BABYLON.Mesh = createBlock("Lane" + j + "Block" + i, currentRowPositionZ, currentBlockPositionX);
              newBlock.isVisible = false;
              newBlock.computeWorldMatrix(true);
              rowBlocks.push(newBlock);
              self.roadBlocks.lanesPositionX.push(currentBlockPositionX);
              currentBlockPositionX += Track.laneInterval;
            }
            originalRowBlock = Core.Utilities.mergeMeshes("OriginalRowBlock", rowBlocks, self.scene.scene);
            originalRowBlock.isVisible = false;
            rowBlocks.forEach((rowBlock: BABYLON.Mesh) => { self.scene.scene._toBeDisposed.push(rowBlock); });
          }
          var newBlockRowMesh = originalRowBlock.clone("Row" + i);
          newBlockRowMesh.isVisible = false;
          newBlockRowMesh.computeWorldMatrix(true);
          newBlockRowMesh.position.z = currentRowPositionZ;
          trackBlocks.push(newBlockRowMesh);
          currentRowPositionZ += Track.blocksLength + Track.blockInterval;
        }
        originalTrackBlock = Core.Utilities.mergeMeshes("OriginalTrackBlock", trackBlocks, self.scene.scene);
        originalTrackBlock.isVisible = false;
        trackBlocks.forEach((trackBlock: BABYLON.Mesh) => { self.scene.scene._toBeDisposed.push(trackBlock); });

        self.roadBlocks.nextBlockPositionZ = -1 * Track.blockInterval;
        for (var k = 0; k < 2; k++) {
          var newTrackBlock = originalTrackBlock.clone("track" + k);
          newBlockRowMesh.computeWorldMatrix(true);
          newTrackBlock.isVisible = true;
          newTrackBlock.renderingGroupId = 1;
          newTrackBlock.material = self.blocksMaterial;
          newTrackBlock.receiveShadows = true;
          newTrackBlock.position.z = self.roadBlocks.nextBlockPositionZ;
          self.roadBlocks.blocks.push(newTrackBlock);
          self.roadBlocks.nextBlockPositionZ += Track.trackBlockZDimention;
        }
      }

    }
  }
}
