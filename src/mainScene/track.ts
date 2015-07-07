module Core.MainScene {

    export interface IRoadBlock {
        nextBlockPositionZ: number;
        blocks: BABYLON.Mesh[];
        lanesPositionX: number[];
    }

    export class Track {
        private scene: BABYLON.Scene;
        private totalLanes: number = 7;
        private laneInterval: number = 33;
        private totalBlocksPerLane: number = 8;
        private blockInterval: number = 110;

        private blocksWidth: number = 23;
        private blocksHeight: number = 3;
        private blocksLength: number = 80;

        private originalBlock: BABYLON.Mesh;
        private blocksMaterial: BABYLON.StandardMaterial;

        private currentBlocksColor: BABYLON.Color3 = new BABYLON.Color3(
            (Math.random() * 0.9 + 0.1),
            (Math.random() * 0.9 + 0.1),
            (Math.random() * 0.9 + 0.1));

        private autoChangeBlocksColor: () => void;
        public currentBlocksMaterial: BABYLON.StandardMaterial;

        public rows: IRoadBlock = <IRoadBlock>{
            nextBlockPositionZ: 0,
            blocks: [],
            lanesPositionX: []
        };
        public repositionFirstLineOfBlocks: () => void;

        constructor(scene: BABYLON.Scene) {
            this.scene = scene;
            this.repositionFirstLineOfBlocks = () => {
                var rowBlock = this.rows.blocks.shift();
                rowBlock.position.z = this.rows.nextBlockPositionZ;
                rowBlock.material['diffuseColor'] = this.currentBlocksColor;
                this.rows.blocks.push(rowBlock);
                this.rows.nextBlockPositionZ += this.blockInterval;
            };
            
            var createBlock = (blockId: string, positionZ: number, positionX: number): BABYLON.Mesh => {
                var block = this.originalBlock.clone(blockId);
                block.scaling.x = this.blocksWidth;
                block.scaling.y = this.blocksHeight;
                block.scaling.z = this.blocksLength;
                block.position.z = positionZ;
                block.position.x = positionX;
                block.position.y -= this.blocksHeight / 2;
                return block;
            };

            this.autoChangeBlocksColor = (): void => {
                this.currentBlocksColor = new BABYLON.Color3(
                    Core.Utilities.getRandomInRange(1, 9) * 0.1,
                    Core.Utilities.getRandomInRange(1, 9) * 0.1,
                    Core.Utilities.getRandomInRange(1, 9) * 0.1
                    );
                setTimeout(() => { this.autoChangeBlocksColor(); }, 10000);
            };

            this.autoChangeBlocksColor();

            this.blocksMaterial = new BABYLON.StandardMaterial("blocks Material", this.scene);
            this.blocksMaterial.backFaceCulling = false;
            this.blocksMaterial.reflectionTexture = new BABYLON.CubeTexture("/assets/cosmicskybox/cosmicskybox", this.scene);
            this.blocksMaterial.reflectionTexture.level = 0.8;
            this.blocksMaterial.specularPower = 10;
            this.blocksMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
            this.blocksMaterial.ambientColor = new BABYLON.Color3(0, 0, 0);
            this.blocksMaterial.diffuseColor = this.currentBlocksColor;
            this.blocksMaterial.alpha = 1;
            this.blocksMaterial.emissiveFresnelParameters = new BABYLON.FresnelParameters();
            this.blocksMaterial.emissiveFresnelParameters.bias = 0.4;
            this.blocksMaterial.emissiveFresnelParameters.power = 140;

            this.originalBlock = BABYLON.Mesh.CreateBox("original Block", 1, this.scene);
            this.originalBlock.scaling.y = this.blocksHeight;
            this.originalBlock.scaling.z = this.blocksLength;
            this.originalBlock.isVisible = false;

            var currentRowPositionZ: number = 0;
            for (var i = 0; i < this.totalBlocksPerLane; i++) {
                var originalRowBlock: BABYLON.Mesh;
                if (!i) {
                    var rowBlocks: BABYLON.Mesh[] = [],
                        currentBlockPositionX: number = -1 * (this.laneInterval * this.totalLanes / 2);
                    for (var j = 0; j < this.totalLanes; j++) {
                        var newBlock: BABYLON.Mesh = createBlock("Lane" + j + "Block" + i, currentRowPositionZ, currentBlockPositionX);
                        newBlock.computeWorldMatrix(true);
                        rowBlocks.push(newBlock);
                        this.rows.lanesPositionX.push(currentBlockPositionX);
                        currentBlockPositionX += this.laneInterval;
                    }
                    originalRowBlock = Core.Utilities.mergeMeshes("OriginalRowBlock", rowBlocks, this.scene);
                    originalRowBlock.isVisible = false;
                    rowBlocks.forEach((rowBlock) => { this.scene._toBeDisposed.push(rowBlock); });
                    //this.scene._toBeDisposed.push(rowBlocks);
                }
                var newBlockRowMesh = originalRowBlock.clone("Row" + i);
                newBlockRowMesh.material = this.blocksMaterial;
                newBlockRowMesh.receiveShadows = true;
                newBlockRowMesh.position.z = currentRowPositionZ;
                newBlockRowMesh.isVisible = true;
                this.rows.blocks.push(newBlockRowMesh);
                currentRowPositionZ += this.blockInterval;
                this.rows.nextBlockPositionZ = currentRowPositionZ;
            }

        }
    }
}  