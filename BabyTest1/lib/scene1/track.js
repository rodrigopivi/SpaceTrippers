var Core;
(function (Core) {
    (function (Scene1) {
        var Track = (function () {
            function Track(scene) {
                var _this = this;
                this.totalLanes = 5;
                this.laneInterval = 25;
                this.totalBlocksPerLane = 11;
                this.blockInterval = 60;
                this.blocksWidth = 20;
                this.blocksHeight = 2;
                this.blocksLength = 50;
                this.lanes = [];
                this.scene = scene;
                this.repositionFirstLineOfBlocks = function () {
                    _this.lanes.forEach(function (lane) {
                        var block = lane.blocks.shift();
                        block.position.z = lane.nextBlockPositionZ;
                        lane.blocks.push(block);
                        lane.nextBlockPositionZ += _this.blockInterval;
                    });
                };

                var createBlock = function (blockId, positionZ, positionX) {
                    var block = BABYLON.Mesh.CreateGround(blockId, 1, 1, 0, _this.scene);

                    //var lane = BABYLON.Mesh.CreateBox(blockId, 1, this.scene);
                    block.scaling.x = _this.blocksWidth;
                    block.scaling.y = _this.blocksHeight;
                    block.scaling.z = _this.blocksLength;
                    block.receiveShadows = true;
                    block.position.z = positionZ;
                    block.position.x = positionX;
                    return block;
                    //lane.material = materialAmiga;
                };

                var currentLanePositionX = -1 * (this.laneInterval * this.totalLanes / 2);
                for (var i = 0; i < this.totalLanes; i++) {
                    var currentBlockPositionZ = 0;
                    var laneBlocks = [];
                    for (var j = 0; j < this.totalBlocksPerLane; j++) {
                        laneBlocks.push(createBlock("Lane" + i + "Block" + j, currentBlockPositionZ, currentLanePositionX));
                        currentBlockPositionZ += this.blockInterval;
                    }
                    this.lanes.push({
                        positionX: currentLanePositionX,
                        nextBlockPositionZ: currentBlockPositionZ,
                        blocks: laneBlocks
                    });
                    currentLanePositionX += this.laneInterval;
                }
            }
            return Track;
        })();
        Scene1.Track = Track;
    })(Core.Scene1 || (Core.Scene1 = {}));
    var Scene1 = Core.Scene1;
})(Core || (Core = {}));
//# sourceMappingURL=track.js.map
