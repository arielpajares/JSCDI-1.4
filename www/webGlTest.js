let sceneText;

async function readFile() {

    const reader = await fetch("testScene/webGlScene.json")
    sceneText = await reader.text();
    sceneText = JSON.parse(sceneText);
    

    requestAnimationFrame(load);
}

let load = async function () {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl2");

    let width;
    let height;

    JSCGL.setGL(gl);
    gl.disable(gl.CULL_FACE);
    const jgl = new JSCGL(width, height);

    const mainScene = new Scene(sceneText);
    await mainScene.loadScene(jgl);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    jgl.updateDimensions(width, height);

    let cameras = mainScene.cameras;
    let camera = cameras[0];

    let shapes = mainScene.objects;

    let angleX = 0;
    let angleY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const keysPressed = {};

    window.addEventListener("keydown", (e) => {
        keysPressed[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
        keysPressed[e.key.toLowerCase()] = false;
    });

    canvas.addEventListener("click", async () => {
        await canvas.requestPointerLock();
    });

    function mouseMove(event) {
        mouseX = event.movementX;
        mouseY = event.movementY;
    }

    let sinCam = 0;
    let cosCam = 0;
    
    document.addEventListener("mousemove", mouseMove);

    let lastFrameTime = performance.now();
    function frame() {
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;

        if (angleX < 0) {angle = 360;}
        else if (angleX > 360) {angle = 0;}

        angleX += mouseX * dt * 10;
        mouseX = 0;

        angleY += mouseY * dt * 10;
        mouseY = 0;

        sinCam = Math.sin(Matrix3D.convertToRad(-angleX));
        cosCam = Math.cos(Matrix3D.convertToRad(-angleX));

        sinCamY = Math.sin(Matrix3D.convertToRad(-angleY));
        cosCamY = Math.cos(Matrix3D.convertToRad(-angleY));

        // Cube Move

        if (keysPressed['w'] == true) {
            camera.position[0] -= sinCam * dt * 10;
            camera.position[2] -= cosCam * dt * 10;
        }

        if (keysPressed['s'] == true) {
            camera.position[0] += sinCam * dt * 10;
            camera.position[2] += cosCam * dt * 10;
        }

        if (keysPressed['a'] == true) {
            camera.position[0] -= Math.sin(Matrix3D.convertToRad(-angleX+90)) * dt * 10;
            camera.position[2] -= Math.cos(Matrix3D.convertToRad(-angleX+90)) * dt * 10;
        }

        if (keysPressed['d'] == true) {
            camera.position[0] += Math.sin(Matrix3D.convertToRad(-angleX+90)) * dt * 10;
            camera.position[2] += Math.cos(Matrix3D.convertToRad(-angleX+90)) * dt * 10;
        }

        camera.rotation[2] = Matrix3D.convertToRad(angleY);
        camera.rotation[1] = Matrix3D.convertToRad(-angleX);

        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        cameras[0] = camera;
        mainScene.returnScene({'objects': shapes, 'cameras': cameras});

        mainScene.draw(JSCGL.gl, dt, width, height);

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
