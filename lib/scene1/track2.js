var Core;
(function (Core) {
    var Scene1;
    (function (Scene1) {
        var Road = (function () {
            function Road(scene) {
                var _this = this;
                this.totalLanes = 7;
                this.laneInterval = 33;
                this.totalBlocksPerLane = 8;
                this.blockInterval = 110;
                this.blocksWidth = 23;
                this.blocksHeight = 3;
                this.blocksLength = 80;
                this.currentBlocksColor = new BABYLON.Color3((Math.random() * 0.9 + 0.1), (Math.random() * 0.9 + 0.1), (Math.random() * 0.9 + 0.1));
                this.rows = {
                    nextBlockPositionZ: 0,
                    blocks: [],
                    lanesPositionX: []
                };
                this.scene = scene;
                this.repositionFirstLineOfBlocks = function () {
                    var rowBlock = _this.rows.blocks.shift();
                    rowBlock.position.z = _this.rows.nextBlockPositionZ;
                    rowBlock.material['diffuseColor'] = _this.currentBlocksColor;
                    _this.rows.blocks.push(rowBlock);
                    _this.rows.nextBlockPositionZ += _this.blockInterval;
                };
                var createBlock = function (blockId, positionZ, positionX) {
                    var block = _this.originalBlock.clone(blockId);
                    block.scaling.x = _this.blocksWidth;
                    block.scaling.y = _this.blocksHeight;
                    block.scaling.z = _this.blocksLength;
                    block.position.z = positionZ;
                    block.position.x = positionX;
                    block.position.y -= _this.blocksHeight / 2;
                    return block;
                };
                this.autoChangeBlocksColor = function () {
                    _this.currentBlocksColor = new BABYLON.Color3(Core.getRandomInRange(1, 9) * 0.1, Core.getRandomInRange(1, 9) * 0.1, Core.getRandomInRange(1, 9) * 0.1);
                    setTimeout(function () {
                        _this.autoChangeBlocksColor();
                    }, 10000);
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
                var currentRowPositionZ = 0;
                for (var i = 0; i < this.totalBlocksPerLane; i++) {
                    var originalRowBlock;
                    if (!i) {
                        var rowBlocks = [], currentBlockPositionX = -1 * (this.laneInterval * this.totalLanes / 2);
                        for (var j = 0; j < this.totalLanes; j++) {
                            var newBlock = createBlock("Lane" + j + "Block" + i, currentRowPositionZ, currentBlockPositionX);
                            newBlock.computeWorldMatrix(true);
                            rowBlocks.push(newBlock);
                            this.rows.lanesPositionX.push(currentBlockPositionX);
                            currentBlockPositionX += this.laneInterval;
                        }
                        originalRowBlock = Core.mergeMeshes("OriginalRowBlock", rowBlocks, this.scene);
                        originalRowBlock.isVisible = false;
                        rowBlocks.forEach(function (rowBlock) {
                            _this.scene._toBeDisposed.push(rowBlock);
                        });
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
            return Road;
        })();
        Scene1.Road = Road;
    })(Scene1 = Core.Scene1 || (Core.Scene1 = {}));
})(Core || (Core = {}));
//# sourceMappingURL=track2.js.map