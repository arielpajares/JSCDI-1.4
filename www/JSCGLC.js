class Matrix3D {
    static multiplyMatrices(a, b) {
        let result = new Float32Array(16);
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                let sum = 0;
                for (let i = 0; i < 4; i++) {
                    sum += b[i + row * 4] * a[col + i * 4];
                }
                result[col + row * 4] = sum;
            }
        }
        return result;
    }

    static scaleMatrix(sx, sy, sz) {
        return new Float32Array([
            sx, 0,  0,  0,
            0,  sy, 0,  0,
            0,  0,  sz, 0,
            0,  0,  0,  1
        ]);
    }

    static rotationYMatrix(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
    
        return new Float32Array([
             c,  0, s, 0,
             0,  1, 0, 0,
            -s,  0, c, 0,
             0,  0, 0, 1
        ]);
    }

    static rotationXMatrix(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
    
        return new Float32Array([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]);
    }

    static rotationZMatrix(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
    
        return new Float32Array([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static subtract(a, b) {
        return new Float32Array([
            a[0] - b[0],
            a[1] - b[1],
            a[2] - b[2]
        ]);
    }

    static normalize(v) {
        const len = Math.hypot(v[0], v[1], v[2]);
        if (len > 0) {
            return new Float32Array([
                v[0] / len,
                v[1] / len,
                v[2] / len
            ]);
        }
        return new Float32Array([0, 0, 0]);
    }

    static cross(a, b) {
        return new Float32Array([
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ]);
    }

    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    static lookAt(eye, center, up) {
        const zAxis = this.normalize(this.subtract(eye, center));
        const xAxis = this.normalize(this.cross(up, zAxis));
        const yAxis = this.cross(zAxis, xAxis);
    
        return new Float32Array([
            xAxis[0], yAxis[0], zAxis[0], 0,
            xAxis[1], yAxis[1], zAxis[1], 0,
            xAxis[2], yAxis[2], zAxis[2], 0,
            -this.dot(xAxis, eye),
            -this.dot(yAxis, eye),
            -this.dot(zAxis, eye),
            1
        ]);
    }

    static perspectiveMatrix(fovRad, aspect, near, far) {
        const f = 1.0 / Math.tan(fovRad / 2);
        const nf = 1 / (near - far);
    
        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, (2 * far * near) * nf, 0
        ]);
    }

    static translationMatrix(tx, ty, tz) {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ]);
    }
    

    static matTRS(tx, ty, tz, eyeRotation, rotation,  sx, sy, sz) {
        const T = this.translationMatrix(tx, ty, tz);
        const fromEyeR = this.multiplyMatrices(this.rotationXMatrix(eyeRotation[2]),this.multiplyMatrices(this.rotationYMatrix(eyeRotation[1]),this.rotationZMatrix(eyeRotation[0])));
        const fromShapeR = this.multiplyMatrices(this.rotationXMatrix(rotation[2]),this.multiplyMatrices(this.rotationYMatrix(rotation[1]),this.rotationZMatrix(rotation[0])));
        const S = this.scaleMatrix(sx, sy, sz);

        if (eyeRotation) {
            return this.multiplyMatrices(fromEyeR ,this.multiplyMatrices(T, this.multiplyMatrices(fromShapeR, S)));
        }
        else {
            return this.multiplyMatrices(T, this.multiplyMatrices(fromShapeR, S));
        }
    }

    static newMat4() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static convertToRad(angle) {
        return angle * Math.PI / 180;
    }
    
    static convertToDeg(angle) {
        return angle * 180.0 / Math.PI;
    }

    static vec3fromValues(x, y, z) {
        return new Float32Array([x, y, z]);
    }

}



class Object3D {
    static camera;

    position;
    velocity;
    indices;
    matFromEyeWorldUniform;
    matWorldUniform;
    invertNormalsUniform;
    size;
    rotation;
    vao;
    texture;

    constructor (position, velocity, size, rotation, indices, vao, texture, program, matFromEyeWorldUniform, matWorldUniform, invertNormalsUniform, cameraViewUniform, numPointLightsUniform) {
        this.position = position;
        this.velocity = velocity;
        this.indices = indices;
        this.size = size;
        this.rotation = rotation;
        Object3D.camera = [[0, 0, 0], [0, 0, 0]];
        this.vao = vao;
        this.texture = texture;

        this.program = program;

        // Shader uniforms
        this.matFromEyeWorldUniform = matFromEyeWorldUniform;
        this.matWorldUniform = matWorldUniform;
        this.invertNormalsUniform = invertNormalsUniform;
        this.cameraViewUniform = cameraViewUniform;
        this.numPointLightsUniform = numPointLightsUniform;
    }

    update(dt) {
        this.position[0] += this.velocity[0] * dt;
        this.position[1] += this.velocity[1] * dt;
        this.position[2] += this.velocity[2] * dt;
    }

    draw(gl, inverted, pointLights) {
        let eye = Object3D.camera[0];
        let eyeRot = Object3D.camera[1];
        this.matFromEyeWorld = Matrix3D.matTRS(this.position[0]-eye[0], this.position[1]-eye[1], this.position[2]-eye[2], [eyeRot[0], eyeRot[1], eyeRot[2]], [this.rotation[0], this.rotation[1], this.rotation[2]], this.size[0], this.size[1], this.size[2]);
        this.matWorld = Matrix3D.matTRS(this.position[0], this.position[1], this.position[2], 0, [this.rotation[0], this.rotation[1], this.rotation[2]], this.size[0], this.size[1], this.size[2]);
        gl.uniform1f(this.invertNormalsUniform, inverted);
        gl.uniform3fv(this.cameraViewUniform, new Float32Array(eye));
        gl.uniform1i(this.numPointLightsUniform, pointLights.length);
        for (i = 0; i < pointLights.length; i++) {
            let lightPointUniform = JSCGL.gl.getUniformLocation(this.program, "lightPoint["+i+"].position");
            let lightDiffuseUniform = JSCGL.gl.getUniformLocation(this.program, "lightPoint["+i+"].diffuse");
            let lightSpecularUniform = JSCGL.gl.getUniformLocation(this.program, "lightPoint["+i+"].specular");
            let lightColorUniform = JSCGL.gl.getUniformLocation(this.program, "lightPoint["+i+"].color");
            gl.uniform3fv(lightPointUniform, new Float32Array(pointLights[i].position));
            gl.uniform3fv(lightColorUniform, new Float32Array(pointLights[i].color));
            gl.uniform1f(lightDiffuseUniform, pointLights[i].diffuseStrength);
            gl.uniform1f(lightSpecularUniform, pointLights[i].specularStrength);
        }
        gl.uniformMatrix4fv(this.matWorldUniform, false, this.matWorld);
        gl.uniformMatrix4fv(this.matFromEyeWorldUniform, false, this.matFromEyeWorld);

        gl.bindVertexArray(this.vao);
        gl.bindTexture(JSCGL.gl.TEXTURE_2D, this.texture);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindTexture(JSCGL.gl.TEXTURE_2D, null);
    }

    getSize() {
        return this.size;
    }

    setSize(size) {
        this.size = size;
    }

    getX() {
        return this.position[0]
    }

    setX(x) {
        this.position[0] = x;
    }

    getY() {
        return this.position[1]
    }

    setY(y) {
        this.position[1] = y;
    }

    getZ() {
        return this.position[2];
    }

    setZ(z) {
        this.position[2] = z;
    }

    getV(v) {
        return this.velocity;
    }

    setV(v) {
        this.velocity = v;
    }

    getRotationDeg() {
        return [Matrix3D.convertToDeg(this.rotation[0]), Matrix3D.convertToDeg(this.rotation[1]), Matrix3D.convertToDeg(this.rotation[2])];
    }

    setRotationDeg(rotation) {
        this.rotation = [Matrix3D.convertToRad(rotation[0]), Matrix3D.convertToRad(rotation[1]), Matrix3D.convertToRad(rotation[2])];
    }

    static setCamera(position, rotation) {
        Object3D.camera = [position, rotation];
    }
}

class Model {
    vertices;
    indices;
    texture;

    constructor (model, indices) {
        if (indices) {
            this.indices = indices;
        }
        else {
            this.indices = this.autoIndices(model[0]);
        }
        this.vertices = model[0];
        this.texture = model[1];
    }

    autoIndices(shape) {
        let array_temp = [];
        for (i = 0; i < shape.length/3; i++) {
            array_temp.push(i);
        }
        return new Uint16Array(array_temp);
    }
}

class Scene {
    objects;
    sceneData;
    invertedObjects;
    cameras;
    pointLights;

    constructor(scene) {
        this.sceneData = scene;
        this.objects = [];
        this.pointLights = [];
        this.cameras = [];
        this.invertedObjects = [];
    }

    async loadScene(gl) {
        let tempImage = new Image();
        let modelData = [];
        let models = [];
        let objects = [];
        let pointLights = [];
        let invertedObjects = [];
        
        for (let i = 0; i < this.sceneData.src.models.length; i++) {
            let actualModel = this.sceneData.src.models[i];
            tempImage = await this.loadImageAsync(this.sceneData.src.images[actualModel.image]);

            modelData.push(new Model(await fetchModel(actualModel.model, tempImage)));
        }
        
        for (let i = 0; i < modelData.length; i++) {
            models.push(gl.loadModel(modelData[i]));
        }

        for (let i = 0; i < this.sceneData.data.objects.length; i++) {
            let actualObject = this.sceneData.data.objects[i];
            objects.push(gl.newObject(models[actualObject.model], actualObject.position, actualObject.scale, actualObject.velocity, actualObject.rotation));
            invertedObjects.push(actualObject.inverted);
        }

        for (let i = 0; i < this.sceneData.data.pointLights.length; i++) {
            let actualLight = this.sceneData.data.pointLights[i];
            pointLights.push({"position": actualLight.position, "color": actualLight.color, "diffuseStrength": actualLight.diffuseStrength, "specularStrength": actualLight.diffuseStrength});
        }

        this.objects = objects;
        this.invertedObjects = invertedObjects;
        console.log(pointLights);
        this.pointLights = pointLights;
    }
    
    loadImageAsync(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    returnScene(json) {
        if (json.objects) {
            this.objects = json.objects;
        }
        if (json.cameras) {
            this.cameras = json.cameras;
        }
    }

    draw(gl, dt) {
        let camera;
        for (let i = 0; i < this.cameras.length; i++) {
            camera = this.cameras[i];
            if (camera[2]) {
                Object3D.setCamera(camera[0], camera[1]);
            }
        }
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].update(dt);
            if (this.invertedObjects[i] == true) {
                this.objects[i].draw(gl, -1.0, this.pointLights);
            }
            else {
                this.objects[i].draw(gl, 1.0, this.pointLights);
            }
            
        }
    }

    newCamera(position, rotation, active) {
        if (!active) {
            active = false;
        }
        this.cameras.push([position, rotation, active]);
    }

    push(object, inverted) {
        if (typeof inverted != 'boolean') {
            inverted = false;
        }
        this.objects.push(object);
        this.invertedObjects.push(inverted);
    }

    unshift(object, inverted) {
        if (typeof inverted != 'boolean') {
            inverted = true;
        }
        this.objects.push(object);
        this.invertedObjects.push(inverted);
    }

    pop() {
        this.objects.pop();
    }

    shift() {
        this.objects.shift();
    }

    async fetchModel(file, texture, indices) {
        let response = await fetchPostResponse("getObjModel()", file);
        let file_content = await response.text();
        if (indices) {
            return [new Float32Array(txtToArray(file_content)), texture, indices];
        }
        else {
            return [new Float32Array(txtToArray(file_content)), texture];
        }
    }

    async fetchPostResponse(func, file) {
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
}

class JSCGL {
    static gl;
    static matFromEyeWorldUniform;
    static matWorldUniform;
    static lightColorUniform;
    static numPointLightsUniform;
    static invertNormalsUniform;
    static cameraViewUniform;

    // JSCGL Constructor

    constructor(width, height) {
        if (!width) {
            this.width = 800;
        }
        if (!height) {
            this.height = 600;
        }

        this.width = 1325;
        this.height = 613;

        console.log(this.width, this.height, 123)

        this.vertexShaderText = `#version 300 es
precision mediump float;

in vec3 vertPosition;
in vec2 vertColor;
in vec3 normal;
out vec3 brightness;
out vec2 uvCoords;

struct PointLight {
    vec3 position;
    vec3 color;
    float diffuse;
    float specular;
};

vec3 pointLightCalculation(PointLight light, int numPointLights, vec3 finalNormal, mat3 matWorld, vec4 vertWorldPosition, vec3 cameraView) {
        vec3 lightPoint = vec3(light.position[0], light.position[1], light.position[2]);
        vec3 offset = lightPoint - vec3(vertWorldPosition[0], vertWorldPosition[1], vertWorldPosition[2]);
        float distance = length(offset);
        vec3 direction = normalize(offset);

        float diffuseRed = max(0.0, dot(direction, normalize(mat3(matWorld) * finalNormal))) * light.color[0] * light.diffuse;
        float diffuseGreen = max(0.0, dot(direction, normalize(mat3(matWorld) * finalNormal))) * light.color[1] * light.diffuse;
        float diffuseBlue = max(0.0, dot(direction, normalize(mat3(matWorld) * finalNormal))) * light.color[2] * light.diffuse;
        float attenuation = 1.0 / ( 0.0025 * distance * distance + 0.25);
        float specularRed = exp(16.0 * log(max(0.0, dot(normalize(cameraView), normalize(reflect(-direction, finalNormal )))) ) ) * light.color[0] * light.specular;
        float specularGreen = exp(16.0 * log(max(0.0, dot(normalize(cameraView), normalize(reflect(-direction, finalNormal )))) ) ) * light.color[1] * light.specular;
        float specularBlue = exp(16.0 * log(max(0.0, dot(normalize(cameraView), normalize(reflect(-direction, finalNormal )))) ) ) * light.color[2] * light.specular;
        vec3 diffuseLight = vec3(diffuseRed * attenuation, diffuseGreen * attenuation, diffuseBlue * attenuation);
        vec3 specularLight = vec3(specularRed * attenuation, specularGreen * attenuation, specularBlue * attenuation);        
        
        return specularLight + diffuseLight;
}

uniform mat4 matWorld;
uniform mat4 matFromEyeWorld;
uniform mat4 matViewProj;
uniform int numPointLights;
uniform PointLight lightPoint[8];
uniform vec3 cameraView;
uniform float invertNormals;

void main() {
    vec3 finalNormal = vec3(normal[0] * invertNormals, normal[1] * invertNormals, normal[2] * invertNormals);
    vec4 vertWorldPosition = matWorld * vec4(vertPosition, 1.0);

    for (int i = 0; i < numPointLights; i++) {
        brightness += pointLightCalculation(lightPoint[i], numPointLights, finalNormal, mat3(matWorld), vertWorldPosition, cameraView);
    }
    uvCoords = vertColor;
    gl_Position = matViewProj * matFromEyeWorld * vec4(vertPosition, 1.0);
}
`;
        this.fragmentShaderText = `#version 300 es
precision mediump float;

in vec2 uvCoords;
in vec3 brightness;
out vec4 color;

uniform sampler2D uSampler;

void main() {
    vec4 textureColor = texture(uSampler, uvCoords);

    float textureRed = textureColor.r;
    float textureGreen = textureColor.g;
    float textureBlue = textureColor.b;

    float red = (textureRed * 0.2) + (textureRed * brightness[0]);
    float green = (textureGreen * 0.2) + (textureGreen * brightness[1]);
    float blue = (textureBlue * 0.2) + (textureBlue * brightness[2]);
    color = vec4(red, green, blue, 1.0);
}`;

        this.program = this.createGraphicsProgram(this.vertexShaderText, this.fragmentShaderText);
        this.positionAttribLocation = JSCGL.gl.getAttribLocation(this.program, "vertPosition");
        this.colorAttribLocation = JSCGL.gl.getAttribLocation(this.program, "vertColor");
        this.normalAttribLocation = JSCGL.gl.getAttribLocation(this.program, "normal");

        // 3D Stuff
        JSCGL.gl.useProgram(this.program);

        JSCGL.matWorldUniform = JSCGL.gl.getUniformLocation(this.program, "matWorld");
        JSCGL.matFromEyeWorldUniform = JSCGL.gl.getUniformLocation(this.program, "matFromEyeWorld");
        this.matViewProjUnifrom = JSCGL.gl.getUniformLocation(this.program, "matViewProj");
        JSCGL.invertNormalsUniform = JSCGL.gl.getUniformLocation(this.program, "invertNormals");
        JSCGL.numPointLightsUniform = JSCGL.gl.getUniformLocation(this.program, "numPointLights");
        JSCGL.cameraViewUniform = JSCGL.gl.getUniformLocation(this.program, "cameraView");

        this.matView = Matrix3D.lookAt(
            Matrix3D.vec3fromValues(0, 0, 0),
            Matrix3D.vec3fromValues(0, 0, -1),
            Matrix3D.vec3fromValues(0, 1, 0));
        this.matProj = Matrix3D.perspectiveMatrix(
            Matrix3D.convertToRad(60),
            this.width / this.height,
            0.1, 1000.0
        );
        this.matViewProj = Matrix3D.multiplyMatrices(this.matProj, this.matView);

        JSCGL.gl.uniformMatrix4fv(this.matViewProjUnifrom, false, this.matViewProj);

        JSCGL.gl.viewport(0, 0, this.width, this.height);
        JSCGL.gl.enable(JSCGL.gl.DEPTH_TEST);

    }

    static setGL(gl) {
        JSCGL.gl = gl;
    }

    // It creates a Buffer to load Vertex data into the GPU

    createVertexBuffer(data) {
        const buffer = JSCGL.gl.createBuffer();
    
        JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, buffer);
        JSCGL.gl.bufferData(JSCGL.gl.ARRAY_BUFFER, data, JSCGL.gl.STATIC_DRAW);
        JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, null);
    
        return buffer;
    }

    // It creates a Buffer to load Index data into the GPU
    
    createIndexBuffer(data) {
        const buffer = JSCGL.gl.createBuffer();
    
        JSCGL.gl.bindBuffer(JSCGL.gl.ELEMENT_ARRAY_BUFFER, buffer);
        JSCGL.gl.bufferData(JSCGL.gl.ELEMENT_ARRAY_BUFFER, data, JSCGL.gl.STATIC_DRAW);
        JSCGL.gl.bindBuffer(JSCGL.gl.ELEMENT_ARRAY_BUFFER, null);
    
        return buffer;
    }

    createTexture(data) {
        const texture = JSCGL.gl.createTexture();
    
        JSCGL.gl.bindTexture(JSCGL.gl.TEXTURE_2D, texture);
        JSCGL.gl.texImage2D(JSCGL.gl.TEXTURE_2D, 0 , JSCGL.gl.RGBA, data.naturalWidth, data.naturalHeight, 0, JSCGL.gl.RGBA, JSCGL.gl.UNSIGNED_BYTE, data);
        JSCGL.gl.texParameteri(JSCGL.gl.TEXTURE_2D, JSCGL.gl.TEXTURE_MIN_FILTER, JSCGL.gl.NEAREST);
        JSCGL.gl.texParameteri(JSCGL.gl.TEXTURE_2D, JSCGL.gl.TEXTURE_MAG_FILTER, JSCGL.gl.LINEAR);
        JSCGL.gl.bindTexture(JSCGL.gl.TEXTURE_2D, null);
    
        return texture;
    }

    // It creates a VAO to load position and color data to the GPU

    createTwoVertexArrayVao(positionBuffer, colorBuffer, indexBuffer) {
        const vao = JSCGL.gl.createVertexArray();

        JSCGL.gl.bindVertexArray(vao);

        JSCGL.gl.enableVertexAttribArray(this.positionAttribLocation);
        JSCGL.gl.enableVertexAttribArray(this.colorAttribLocation);

        if (!colorBuffer) {
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, positionBuffer);
            JSCGL.gl.vertexAttribPointer( this.positionAttribLocation, 2, JSCGL.gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0 );

            JSCGL.gl.vertexAttribPointer( this.colorAttribLocation, 3, JSCGL.gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, null);
        }else {

            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, positionBuffer);
            JSCGL.gl.vertexAttribPointer( this.positionAttribLocation, 2, JSCGL.gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0 );
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, null);

            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, colorBuffer);
            JSCGL.gl.vertexAttribPointer( this.colorAttribLocation, 3, JSCGL.gl.UNSIGNED_BYTE, true, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, null);

        }

        if (!indexBuffer) {
            JSCGL.gl.bindVertexArray(null);
        }
        else {
            JSCGL.gl.bindBuffer(JSCGL.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            JSCGL.gl.bindVertexArray(null);
            JSCGL.gl.bindBuffer(JSCGL.gl.ELEMENT_ARRAY_BUFFER, null);
        }
        return vao;
    }

    create3DTwoVertexArrayVao(positionBuffer, uvCoords, texture, normals, indexBuffer) {
        const vao = JSCGL.gl.createVertexArray();

        JSCGL.gl.bindVertexArray(vao);

        JSCGL.gl.enableVertexAttribArray(this.positionAttribLocation);
        JSCGL.gl.enableVertexAttribArray(this.colorAttribLocation);
        JSCGL.gl.enableVertexAttribArray(this.normalAttribLocation);

        if (!uvCoords && !normals) {
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, positionBuffer);
            JSCGL.gl.vertexAttribPointer( this.positionAttribLocation, 3, JSCGL.gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0 );

            JSCGL.gl.vertexAttribPointer( this.colorAttribLocation, 2, JSCGL.gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

            JSCGL.gl.vertexAttribPointer( this.normalAttribLocation, 3, JSCGL.gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, null);
        }else {

            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, positionBuffer);
            JSCGL.gl.vertexAttribPointer( this.positionAttribLocation, 3, JSCGL.gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, null);

            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, uvCoords);
            JSCGL.gl.vertexAttribPointer( this.colorAttribLocation, 2, JSCGL.gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0 );
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, null);

            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, normals);
            JSCGL.gl.vertexAttribPointer( this.normalAttribLocation, 3, JSCGL.gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0 );
            JSCGL.gl.bindBuffer(JSCGL.gl.ARRAY_BUFFER, null);

        }

        if (!indexBuffer) {
            JSCGL.gl.bindVertexArray(null);
        }
        else {
            JSCGL.gl.bindBuffer(JSCGL.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            JSCGL.gl.bindVertexArray(null);
            JSCGL.gl.bindBuffer(JSCGL.gl.ELEMENT_ARRAY_BUFFER, null);
        }

        return [vao, texture];
    }

    // It creates a VAO to load position and color data to the GPU for 3D Graphics

    // It creates a WebGL program compiling a vertexShader and a fragmentShader

    createGraphicsProgram(vertexShaderText, fragmentShaderText) {
        let vertexShader = JSCGL.gl.createShader(JSCGL.gl.VERTEX_SHADER);
        let fragmentShader = JSCGL.gl.createShader(JSCGL.gl.FRAGMENT_SHADER);
        
        JSCGL.gl.shaderSource(vertexShader, vertexShaderText);
        JSCGL.gl.shaderSource(fragmentShader, fragmentShaderText);

        JSCGL.gl.compileShader(vertexShader);
        if (!JSCGL.gl.getShaderParameter(vertexShader, JSCGL.gl.COMPILE_STATUS)) {
            console.error("ERROR compiling the Vertex Shader", JSCGL.gl.getShaderInfoLog(vertexShader));
            return;
        }

        JSCGL.gl.compileShader(fragmentShader);
        if (!JSCGL.gl.getShaderParameter(fragmentShader, JSCGL.gl.COMPILE_STATUS)) {
            console.error("ERROR compiling the Fragment Shader", JSCGL.gl.getShaderInfoLog(fragmentShader));
            return;
        }

        let program = JSCGL.gl.createProgram();
        JSCGL.gl.attachShader(program, vertexShader);
        JSCGL.gl.attachShader(program, fragmentShader);
        JSCGL.gl.linkProgram(program);
        if (!JSCGL.gl.getProgramParameter(program, JSCGL.gl.LINK_STATUS)) {
            console.error("ERROR Couldn't link the Program", JSCGL.gl.getProgramInfoLog(program));
            return;
        }
        JSCGL.gl.validateProgram(program);
        if (!JSCGL.gl.getProgramParameter(program, JSCGL.gl.VALIDATE_STATUS)) {
            console.error("ERROR Somthing wrong with Validation", JSCGL.gl.getProgramInfoLog(program));
            return;
        }

        return program;
    }

    loadModel(shape) {
        let shapeVertices;
        let shapeIndices;
        let shapeUvCoords;
        let shapeNormals;
        let shapeTexture;
    
        shapeIndices = this.createIndexBuffer(shape.indices);
        shapeVertices = this.createVertexBuffer(shape.vertices);
        shapeTexture = this.createTexture(shape.texture);
        
        let shapeVao = this.create3DTwoVertexArrayVao(shapeVertices, shapeUvCoords, shapeTexture, shapeNormals, shapeIndices);
        return [shapeVao[0], shape.indices, shapeVao[1]];
    }

    newObject(shape, shapePosition, shapeSize, shapeVelocity, shapeRotation) {
        let position = [0, 0, 0];
        let velocity = [0, 0, 0];
        let size = [1, 1, 1];
        let rotation = [0, 0, 0];

        if (shapePosition) {
            position = shapePosition;
        }

        if (shapeSize) {
            size = shapeSize;
        }

        if (shapeVelocity) {
            velocity = shapeVelocity;
        }

        if (shapeRotation) {
            rotation = shapeRotation;
        }

        return new Object3D(position, velocity, size, rotation, shape[1], shape[0], shape[2], this.program, JSCGL.matFromEyeWorldUniform, JSCGL.matWorldUniform, JSCGL.invertNormalsUniform, JSCGL.cameraViewUniform, JSCGL.numPointLightsUniform);
    }

    static setLightPosition(x, y, z) {
        let lightPosition = Matrix3D.vec3fromValues(x, y, z);
        JSCGL.gl.uniform3fv(this.lightPointUniform, lightPosition);
    }

    updateDimensions(width, height) {
        JSCGL.gl.viewport(0 , 0, width, height);
        this.matView = Matrix3D.lookAt(
            Matrix3D.vec3fromValues(0, 0, 0),
            Matrix3D.vec3fromValues(0, 0, -1),
            Matrix3D.vec3fromValues(0, 1, 0));
        this.matProj = Matrix3D.perspectiveMatrix(
            Matrix3D.convertToRad(60),
            this.width / this.height,
            0.1, 1000.0
        );
        this.matViewProj = Matrix3D.multiplyMatrices(this.matProj, this.matView);
        JSCGL.gl.uniformMatrix4fv(this.matViewProjUnifrom, false, this.matViewProj);
    }
}
