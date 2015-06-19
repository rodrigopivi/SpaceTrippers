///<reference path="spaceShip.ts"/>
///<reference path="track.ts"/>
///<reference path="bulletTrigger.ts"/>
///<reference path="meteoriteGenerator.ts"/>
///<reference path="rockGenerator.ts"/>

module Core.Scene1 {
    export class Scene {
        private canvas: HTMLCanvasElement;
        private engine: BABYLON.Engine;
        private addEventListeners: () => void;
        private removeEventListeners: () => void;
        private crateFollowCam: () => void;
        private light: any; //BABYLON.SpotLight;
        private shadowGenerator: BABYLON.ShadowGenerator;

        public scene: BABYLON.Scene;
        public assetsManager: BABYLON.AssetsManager;
        public sharedLight: BABYLON.DirectionalLight;
        public sharedShadowGenerator: BABYLON.ShadowGenerator;
        public camera: BABYLON.FollowCamera;

        public spaceShip: SpaceShip;
        public spaceShipCurrentTrackLane: number;
        public spaceShipTransitionTrackLane: number;
        public track: Track;
        public meteoriteGenerator: MeteoriteGenerator;
        public rockGenerator: RockGenerator;

        constructor(canvas: HTMLCanvasElement, engine: BABYLON.Engine) {
            this.canvas = canvas;
            this.engine = engine;

            var onKeyDownHandler: (event: KeyboardEvent) => void,
                onKeyUpHandler: (event: KeyboardEvent) => void;

            this.scene = new BABYLON.Scene(engine);
            this.assetsManager = new BABYLON.AssetsManager(this.scene);
            this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            this.scene.fogDensity = 0.0019;
            this.scene.fogColor = new BABYLON.Color3(0, 0, 0);

            this.scene.clearColor = new BABYLON.Color3(0.5, 1, 0.5);
            this.scene.ambientColor = new BABYLON.Color3(1, 0.3, 0.3);
            /*
            this.sharedLight = new BABYLON.DirectionalLight("SharedLight", new BABYLON.Vector3(0, -1, 1), this.scene);
            this.sharedLight.position = new BABYLON.Vector3(0, 80, -20);
            this.sharedShadowGenerator = new BABYLON.ShadowGenerator(1024, <any>this.sharedLight);
            this.sharedShadowGenerator.usePoissonSampling = true;
            */
            this.light = new BABYLON.SpotLight("RocksSpotLight", new BABYLON.Vector3(0, 190, -140), new BABYLON.Vector3(0, -1, 1), 2, 1, this.scene);
            this.light.intensity = 1.3;
            this.shadowGenerator = new BABYLON.ShadowGenerator(1024, <any>this.light);
            this.shadowGenerator.usePoissonSampling = true;

            //this.light = this.sharedLight;
            //this.shadowGenerator = this.sharedShadowGenerator;
            
            this.sharedLight = this.light;
            this.sharedShadowGenerator = this.shadowGenerator;
            
            this.crateFollowCam = () => {
                this.camera = new BABYLON.FollowCamera("FollowCam", BABYLON.Vector3.Zero(), this.scene);
                this.camera.radius = 80;
                this.camera.heightOffset = 25;
                this.camera.rotationOffset = 0;
                this.camera.cameraAcceleration = 0.05;
                this.camera.maxCameraSpeed = 20;
                this.camera.inertia = 0.5;
                this.camera.target = this.spaceShip.spaceShipMesh;
            };

            var backgroundImageTask = this.assetsManager.addImageTask("bgLoader", "/assets/earthbg.jpg");
            //var backgroundImageTask = this.assetsManager.addImageTask("bgLoader", "/assets/planetbg1.jpg");

            /* =============== Add Objects to Scene =============== */
            this.track = new Track(this.scene);
            this.spaceShipCurrentTrackLane = Math.round((this.track.rows.lanesPositionX.length - 1) / 2);

            this.spaceShip = new SpaceShip(this, this.assetsManager,
                (spaceShipMesh: BABYLON.AbstractMesh) => {
                    spaceShipMesh.position = new BABYLON.Vector3(
                        this.track.rows.lanesPositionX[this.spaceShipCurrentTrackLane],
                        1,
                        0);
                    spaceShipMesh.receiveShadows = true;
                    spaceShipMesh.renderingGroupId = 2;
                    this.shadowGenerator.getShadowMap().renderList.push(spaceShipMesh);
                    //this.track.addCollisionDetector(this.spaceShip.spaceShipMesh);
                    this.crateFollowCam();

                    this.meteoriteGenerator = new MeteoriteGenerator(this, this.spaceShip.spaceShipMesh);
                    this.rockGenerator = new RockGenerator(this, this.spaceShip.spaceShipMesh);
                });
            /* =============== Event Listeners =============== */
            this.addEventListeners = () => {
                onKeyDownHandler = (event) => {
                    var newLane;
                    switch (event.keyCode) {
                        case 37: // arrow left
                            newLane = this.spaceShipCurrentTrackLane - 1;
                            if (!this.spaceShip.isXMoving && newLane !== -1) {
                                this.spaceShipTransitionTrackLane = this.spaceShipCurrentTrackLane;
                                this.spaceShipCurrentTrackLane--;
                                this.spaceShip.moveShipMeshToLane(newLane,() => {
                                    this.spaceShipTransitionTrackLane = undefined;
                                });
                            }
                            break;
                        case 38: // arrow up
                            this.spaceShip.moveUp();
                            break;
                        case 39: // arrow right
                            newLane = this.spaceShipCurrentTrackLane + 1;
                            if (!this.spaceShip.isXMoving && newLane < this.track.rows.lanesPositionX.length) {
                                this.spaceShipTransitionTrackLane = this.spaceShipCurrentTrackLane;
                                this.spaceShipCurrentTrackLane++;
                                this.spaceShip.moveShipMeshToLane(newLane,() => {
                                    this.spaceShipTransitionTrackLane = undefined;
                                });
                            }
                            break;
                        case 40: // arrow down
                            this.spaceShip.moveDown();
                            break;
                    }
                };
                onKeyUpHandler = (event) => {
                    switch (event.keyCode) {
                        case 32: // space
                            this.spaceShip.triggerShot();
                            break;
                    }
                };
                window.addEventListener("keydown", onKeyDownHandler, true);
                window.addEventListener("keyup", onKeyUpHandler, false);

            };

            this.removeEventListeners = () => {
                if (onKeyDownHandler !== undefined) {
                    window.removeEventListener("keydown", onKeyDownHandler, false);
                    onKeyDownHandler = undefined;
                }
            };

            this.assetsManager.onTaskError = (task: BABYLON.MeshAssetTask) => {
                console.log("error while loading " + task.name);
            }
            // Create the render loop once all the assets are loaded
            this.assetsManager.onFinish = () => {
                this.addEventListeners();

                //this.canvas.style.background = "url(/assets/earthbg.jpg)";
                this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0.0000000000000001);
                this.canvas.style.background = "url(" + backgroundImageTask['image']['src'] + ")";
                this.canvas.style.backgroundPositionY = "-300px";
                this.canvas.style.backgroundPositionX = "-1235px";
                this.rockGenerator.recursiveRocksCreation();

                engine.runRenderLoop(() => {
                    this.spaceShip.spaceShipMesh.position.z += 3;
                    this.light.position.x = this.spaceShip.spaceShipMesh.position.x;
                    this.light.position.y = this.spaceShip.spaceShipMesh.position.y + 190;
                    this.light.position.z = this.spaceShip.spaceShipMesh.position.z - 140;
                    if (this.camera.position.z > this.track.rows.blocks[0].position.z + this.track.rows.blocks[0].scaling.z / 2) {
                        this.track.repositionFirstLineOfBlocks();
                    }
                    updateStats();
                    this.scene.render();
                });
            };

            engine.loadingUIBackgroundColor = "Black";
            this.assetsManager.load();
        }
    }
}