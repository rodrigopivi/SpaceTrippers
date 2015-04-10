module Core.Scene1 {
    export interface ITrackLane {
        positionX: number;
        nextBlockPositionZ: number;
        blocks: BABYLON.Mesh[];
    }

    export class Track {
        private scene: BABYLON.Scene;
        private totalLanes: number = 5;
        private laneInterval: number = 25;
        private totalBlocksPerLane: number = 11;
        private blockInterval: number = 60;

        private blocksWidth: number = 20;
        private blocksHeight: number = 2;
        private blocksLength: number = 50;

        public lanes: ITrackLane[] = [];
        public repositionFirstLineOfBlocks: () => void;

        constructor(scene: BABYLON.Scene) {
            this.scene = scene;
            this.repositionFirstLineOfBlocks = () => {
                this.lanes.forEach((lane: ITrackLane) => {
                    var block = lane.blocks.shift();
                    block.position.z = lane.nextBlockPositionZ;
                    lane.blocks.push(block);
                    lane.nextBlockPositionZ += this.blockInterval;
                });
            };

            var createBlock = (blockId: string, positionZ: number, positionX: number): BABYLON.Mesh => {
                var block = BABYLON.Mesh.CreateGround(blockId, 1, 1, 0, this.scene);
                //var lane = BABYLON.Mesh.CreateBox(blockId, 1, this.scene);
                block.scaling.x = this.blocksWidth;
                block.scaling.y = this.blocksHeight;
                block.scaling.z = this.blocksLength;
                block.receiveShadows = true;
                block.position.z = positionZ;
                block.position.x = positionX;
                return block;
                //lane.material = materialAmiga;
            };

            var currentLanePositionX: number = -1 * (this.laneInterval * this.totalLanes / 2);
            for (var i = 0; i < this.totalLanes; i++) {
                var currentBlockPositionZ: number = 0; //this.blockInterval * -1 * (this.totalBlocksPerLane / 2);
                var laneBlocks: BABYLON.Mesh[] = [];
                for (var j = 0; j < this.totalBlocksPerLane; j++) {
                    laneBlocks.push(createBlock("Lane" + i + "Block" + j, currentBlockPositionZ, currentLanePositionX));
                    currentBlockPositionZ += this.blockInterval;
                }
                this.lanes.push(<ITrackLane>{
                    positionX: currentLanePositionX,
                    nextBlockPositionZ: currentBlockPositionZ,
                    blocks: laneBlocks
                });
                currentLanePositionX += this.laneInterval;
            }
        }
    }
}  