function txtToArray(txt) {
    let array = [];
    let array1 = [];
    let tempString = "";

    for (i = 0; i < txt.length-1; i++) {
        if (txt[i] == ',') {
            array.push(parseFloat(tempString));
            array1.push(tempString);
            tempString = "";
        }
        else if (txt[i] != ' ' && txt[i] != '[' && txt[i] != ']' && txt[i] != '"') {
            tempString += txt[i];
        }
    }
    array.push(parseFloat(tempString)); 

    return array;
}

async function fetchModel(file, texture, indices) {
    let response = await fetchPostResponse("getObjModel()", file);
    let file_content = await response.text();
    if (indices) {
        return [new Float32Array(txtToArray(file_content)), texture, indices];
    }
    else {
        return [new Float32Array(txtToArray(file_content)), texture];
    }
}

async function fetchPostResponse(func, file) {
    while (true) {
        try {
            const response = await fetch(func, {
                method: "POST",
                body: file+","
            });
            if (response.ok) {
                return response;
            }
        } catch {}
    }
}


async function readFile() {

    let marble = new Image();
    let lightBulbTex = new Image();

    marble.src = "testScene/src/images/black_marmle.jpg";
    lightBulbTex.src = "testScene/src/images/light_bulb.jpg";

    testModel = new Model(await fetchModel("../../www/testScene/src/models/test.obj", lightBulbTex));
    lightBulbModel = new Model(await fetchModel("../../www/testScene/src/models/light_bulb.obj", lightBulbTex));
    floorModel = new Model(await fetchModel("../../www/testScene/src/models/floor.obj", marble));

    requestAnimationFrame(load);
}

let load = function () {
    const canvas = document.querySelector("canvas");
    const gl = canvas.getContext("webgl2");

    let width;
    let height;

    if (confirm("Would you like to specify canvas dimensions?")) {
        width = parseInt(prompt("Insert width:"));
        height = parseInt(prompt("Insert height:"));
    }
    else {
        width = 800;
        height = 600;
    }

    canvas.width = width;
    canvas.height = height;

    JSCGL.setGL(gl);
    const jgl = new JSCGL(width, height);

    const testScene = new Scene();

    const test = jgl.loadModel(testModel);
    const floor = jgl.loadModel(floorModel);
    const lightBulb = jgl.loadModel(lightBulbModel);

    testScene.newCamera([0, 0, 10], [0, 0, 0], true);

    let cameras = testScene.cameras;
    let camera = cameras[0];

    testScene.push(jgl.newObject(test, [0, 0, -3], [1, 1, 1]));
    testScene.push(jgl.newObject(floor, [0, -5, 0], [10, 10, 10]));
    testScene.push(jgl.newObject(lightBulb, [0, 5, 0], [7, 7, 7]), true);

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