///<reference path="spaceShip.ts"/>
///<reference path="track.ts"/>
module Core.Scene1 {
    export class Scene {
        private canvas: HTMLCanvasElement;
        private engine: BABYLON.Engine;
        private addEventListeners: () => void;
        private removeEventListeners: () => void;

        public scene: BABYLON.Scene;
        public assetsManager: BABYLON.AssetsManager;
        public light: BABYLON.DirectionalLight;
        public shadowGenerator: BABYLON.ShadowGenerator;
        public camera: BABYLON.FollowCamera;

        public skyBox: BABYLON.Mesh;
        public spaceShip: SpaceShip;
        public spaceShipCurrentTrackLane: number = 0;
        public track: Track;

        constructor(canvas: HTMLCanvasElement, engine: BABYLON.Engine) {
            this.canvas = canvas;
            this.engine = engine;

            var skyboxMaterial: BABYLON.StandardMaterial,
                onKeyDownHandler: (event: KeyboardEvent) => void;

            this.scene = new BABYLON.Scene(engine);
            this.assetsManager = new BABYLON.AssetsManager(this.scene);

            this.light = new BABYLON.DirectionalLight("MainLight", new BABYLON.Vector3(0, -3, -1), this.scene);
            this.light.position = new BABYLON.Vector3(0, 80, 20);
            this.shadowGenerator = new BABYLON.ShadowGenerator(2048, this.light);
            this.shadowGenerator.usePoissonSampling = true;

            this.camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 15, -45), this.scene);
            this.camera.radius = 40; // how far from the object to follow
            this.camera.heightOffset = 16; // how high above the object to place the camera
            this.camera.rotationOffset = 180; // the viewing angle
            this.camera.cameraAcceleration = 0.2; // how fast to move
            this.camera.maxCameraSpeed = 20; // speed limit
            //this.scene.enablePhysics(null, new BABYLON.OimoJSPlugin());

            // Skybox creation
            this.skyBox = BABYLON.Mesh.CreateBox("skyBox", 1000, this.scene);
            skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("/assets/spacebox/spacebox", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            this.skyBox.material = skyboxMaterial;

            /* =============== Add Objects to Scene =============== */
            this.track = new Track(this.scene);
            this.spaceShipCurrentTrackLane = Math.round((this.track.lanes.length - 1) / 2);
            this.spaceShip = new SpaceShip(this.scene, this.assetsManager,
                (spaceShipMesh: BABYLON.AbstractMesh) => {
                    spaceShipMesh.position = new BABYLON.Vector3(0, 1, 0);
                    spaceShipMesh.position.x = this.track.lanes[this.spaceShipCurrentTrackLane].positionX;
                    spaceShipMesh.receiveShadows = true;
                    this.shadowGenerator.getShadowMap().renderList.push(spaceShipMesh);
                    // the camera will follow the space ship
                    this.camera.target = spaceShipMesh;
                });

            /* =============== Event Listeners =============== */

            this.addEventListeners = () => {
                onKeyDownHandler = (event) => {
                    var newLaneIndex: number;
                    switch (event.keyCode) {
                        case 37: // arrow left
                            newLaneIndex = this.spaceShipCurrentTrackLane - 1;
                            if (newLaneIndex !== -1) {
                                this.spaceShip.moveShipMeshToPositionX(
                                    this.track.lanes[newLaneIndex].positionX,
                                    () => { this.spaceShipCurrentTrackLane--; });
                            }
                            break;
                        case 39: // arrow right
                            newLaneIndex = this.spaceShipCurrentTrackLane + 1;
                            if (newLaneIndex < this.track.lanes.length) {
                                this.spaceShip.moveShipMeshToPositionX(
                                    this.track.lanes[newLaneIndex].positionX,
                                    () => { this.spaceShipCurrentTrackLane++; });
                            }
                            break;
                    }
                };
                window.addEventListener("keydown", onKeyDownHandler, false);
            };

            this.removeEventListeners = () => {
                if (onKeyDownHandler !== undefined) {
                    window.removeEventListener("keydown", onKeyDownHandler, false);
                    onKeyDownHandler = undefined;
                }
            };

            // Listen for assets that can't load
            this.assetsManager.onTaskError = (task: BABYLON.MeshAssetTask) => {
                console.log("error while loading " + task.name);
            }

            // Create the render loop once all the assets are loaded
            this.assetsManager.onFinish = (tasks: BABYLON.MeshAssetTask[]) => {
                console.log(tasks);
                this.addEventListeners();
                engine.runRenderLoop(() => {
                    this.light.position.z += 1;
                    this.spaceShip.spaceShipMesh.position.z += 1;
                    this.skyBox.position.z += 1;
                    if (this.camera.position.z > this.track.lanes[0].blocks[0].position.z + 40) {
                        this.track.repositionFirstLineOfBlocks();
                    }
                    updateStats();
                    this.scene.render();
                });
            };

            // Can now change loading background color:
            engine.loadingUIBackgroundColor = "Purple";

            // Just call load to initiate the loading sequence
            this.assetsManager.load();
        }
    }
}