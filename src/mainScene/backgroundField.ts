module Core.MainScene {

  export class BackgroundField {
    private scene: Core.MainScene.Scene;
    private shaderMaterial: BABYLON.ShaderMaterial;
    private mesh: BABYLON.Mesh;

    constructor(scene: Core.MainScene.Scene) {
      var self = this;
      this.scene = scene;
      preloadAssets();
      createShader();
      createBackgroundMesh();

      function preloadAssets(): void {
        self.scene.assetsManager.addTextFileTask("intestellarVertexShader", "/shaders/interstellar/interstellar.vertex.fx");
        self.scene.assetsManager.addTextFileTask("intestellarFragmentShader", "/shaders/interstellar/interstellar.fragment.fx");
        self.scene.assetsManager.addTextureTask("intestellarTexture", "/shaders/interstellar/interstellar.png");
      }

      function createShader(): void {
        self.shaderMaterial = new BABYLON.ShaderMaterial("interstellarShader", self.scene.scene,
          { vertexElement: "interstellar/interstellar", fragmentElement: "interstellar/interstellar" },
          { attributes: ["position", "normal", "uv"], uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"] });
          var refTexture = new BABYLON.Texture("/shaders/interstellar/interstellar.png", self.scene.scene);
          self.shaderMaterial.setTexture("refSampler", refTexture);
          self.shaderMaterial.setFloat("time", 6);
          self.shaderMaterial.setFloat("alpha", 0.0);
          self.shaderMaterial.setFloat("pointLongitude", 0.001);
          self.shaderMaterial.setVector3("cameraPosition", new BABYLON.Vector3(0, 200, 0));
          self.shaderMaterial.backFaceCulling = true;
      }

      function createBackgroundMesh(): void {
        //self.mesh = BABYLON.Mesh.CreatePlane("mesh", 2500, self.scene.scene);
        self.mesh = BABYLON.Mesh.CreatePlane("mesh", 100, self.scene.scene);
        self.mesh.renderingGroupId = 0;
        //self.mesh.rotation.y =  Math.PI * .5;
        self.mesh.material = self.shaderMaterial;
        // initialized values for the fragment shader
        var time = 6;
        var alpha = 0.0;
        var pointLongitude = 0.001; // from 0 to 0.06
        var position = new BABYLON.Vector3(0, 200, 0);
        var bgSpeed = 0.00025;
        var shown = false;
        self.scene.scene.registerBeforeRender(() => {
          self.mesh.position.z = self.scene.camera.position.z + + 40 ;
          self.mesh.position.x = self.scene.camera.position.x;
          self.mesh.position.y = self.scene.camera.position.y;
          self.shaderMaterial.setFloat("time", time);
          self.shaderMaterial.setFloat("pointLongitude", pointLongitude);
          self.shaderMaterial.setFloat("alpha", alpha);
          time += bgSpeed;

          var roundedPos = Math.round(self.mesh.position.z);
          if (!shown && alpha < 1) {
            bgSpeed += 0.0000005;
            pointLongitude += 0.00004;
            alpha += 0.00025;
            self.scene.spaceShip.speed += 0.00155;
            if (roundedPos % 500 === 0) {
              self.scene.rockGenerator.numberOfRocks++;
              self.scene.rockGenerator.rocksSpeed += 0.001;
            }
          } else {
            if (!shown) {
              shown = true;
              console.log(self.scene.rockGenerator.numberOfRocks);
              console.log(self.scene.rockGenerator.rocksSpeed);
              console.log(self.scene.spaceShip.speed);
            }
            if (alpha >= 0.00025)  {
              bgSpeed -= 0.0000005;
              pointLongitude -= 0.00004;
              alpha -= 0.00025;
              self.scene.spaceShip.speed -= 0.0015;
              if (roundedPos % 500 === 0) {
                self.scene.rockGenerator.numberOfRocks--;
                self.scene.rockGenerator.rocksSpeed -= 0.001;
              }
            } else {
              // next level
              shown = false;
            }
          }

        });
      }
    }
  }
}
