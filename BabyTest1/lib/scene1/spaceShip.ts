module Core.Scene1 {

    export class SpaceShip {
        private assetsManager: BABYLON.AssetsManager;

        private scene: BABYLON.Scene;
        private name: string = "SpaceShip";
        private filePath: string = "/assets/";
        private fileName: string = "navecita.babylon";

        public spaceShipMesh: BABYLON.AbstractMesh;
        public moveShipMeshToPositionX: (positionX: number, animationEndCallback?: () => void) => void;

        constructor(scene: BABYLON.Scene, assetsManager: BABYLON.AssetsManager, afterLoadedCallback: (spaceShipMesh: BABYLON.AbstractMesh) => void) {
            this.scene = scene;
            this.assetsManager = assetsManager;

            var spaceShipMeskLoaderTask = assetsManager.addMeshTask(this.name, "", this.filePath, this.fileName);

            // when loaded the space ship model
            spaceShipMeskLoaderTask.onSuccess = (task: BABYLON.MeshAssetTask) => {
                this.spaceShipMesh = task.loadedMeshes[0];
                this.spaceShipMesh.rotate(BABYLON.Axis.Z, Math.PI, BABYLON.Space.LOCAL);
                afterLoadedCallback(this.spaceShipMesh);
            }

            this.moveShipMeshToPositionX = (positionX: number, animationEndCallback?: () => void) => {
                if (!this.spaceShipMesh.animations.length) {
                    var animationIndex: number,
                        easingFunction = new BABYLON.PowerEase(),
                        moveSpaceshipAnimation: BABYLON.Animation = new BABYLON.Animation("moveSpaceshipAnimation", "position.x", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

                    moveSpaceshipAnimation.setKeys([
                        { frame: 0, value: this.spaceShipMesh.position.x },
                        { frame: 25, value: positionX }
                    ]);
                    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
                    moveSpaceshipAnimation.setEasingFunction(easingFunction);
                    animationIndex = this.spaceShipMesh.animations.push(moveSpaceshipAnimation) - 1;
                    this.scene.beginAnimation(this.spaceShipMesh, 0, 25, false, 1, () => {
                        this.spaceShipMesh.animations.splice(animationIndex, 1);
                        if (animationEndCallback) { animationEndCallback(); }
                    });
                }
            };
        }
    }
} 