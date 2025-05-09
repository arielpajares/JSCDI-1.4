let testText;

async function readFile() {

    let response = await fetch("testing.json");
    testTxt = await response.text();
    testTxt = JSON.parse(testTxt);


    requestAnimationFrame(load);
}

let load = async function () {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl2");

    JSCGL.setGL(gl);
    const jgl = new JSCGL(width, height);

    const testScene = new Scene();
    const test1 = new Scene(testTxt);
    await test1.loadScene(jgl);

    width = innerWidth;
    height = innerHeight;

    canvas.width = width;
    canvas.height = height;

    jgl.updateDimensions(width, height);

    testScene.newCamera([0, 0, 10], [0, 0, 0], true);

    let cameras = testScene.cameras;
    let camera = cameras[0];

    let angleX = 0;
    let angleY = -10;
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
            camera[0][0] -= sinCam * dt * 10;
            camera[0][2] -= cosCam * dt * 10;
        }

        if (keysPressed['s'] == true) {
            camera[0][0] += sinCam * dt * 10;
            camera[0][2] += cosCam * dt * 10;
        }

        if (keysPressed['a'] == true) {
            camera[0][0] -= Math.sin(Matrix3D.convertToRad(-angleX+90)) * dt * 10;
            camera[0][2] -= Math.cos(Matrix3D.convertToRad(-angleX+90)) * dt * 10;
        }

        if (keysPressed['d'] == true) {
            camera[0][0] += Math.sin(Matrix3D.convertToRad(-angleX+90)) * dt * 10;
            camera[0][2] += Math.cos(Matrix3D.convertToRad(-angleX+90)) * dt * 10;
        }

        camera[1][0] = 0;
        camera[1][2] = Matrix3D.convertToRad(angleY);
        camera[1][1] = Matrix3D.convertToRad(-angleX);

        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        JSCGL.setLightPosition(0, 5, 0);

        cameras[0] = camera;
        testScene.returnScene({'objects': null, 'cameras': cameras});

        testScene.draw(JSCGL.gl, dt);

        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
