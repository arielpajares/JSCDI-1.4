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

    id;
    position;
    velocity;
    indices;
    inverted;
    invertNormalsUniform;
    size;
    rotation;
    vao;
    texture;

    constructor (id, position, velocity, size, rotation, model, inverted) {
        this.id = id;
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.rotation = rotation;
        this.model = model;
        this.inverted = inverted;
    }

    update(dt) {
        this.position[0] += this.velocity[0] * dt;
        this.position[1] += this.velocity[1] * dt;
        this.position[2] += this.velocity[2] * dt;
    }

    draw(jgl, pass, camera, matViewProjBuffer, inverted, pointLights) {
        let eye = camera.position;
        let eyeRot = camera.rotation;
        const matFromEyeWorld = Matrix3D.matTRS(this.position[0]-eye[0], this.position[1]-eye[1], this.position[2]-eye[2], [eyeRot[0], eyeRot[1], eyeRot[2]], [this.rotation[0], this.rotation[1], this.rotation[2]], this.size[0], this.size[1], this.size[2]);
        const matWorld = Matrix3D.matTRS(this.position[0], this.position[1], this.position[2], 0, [this.rotation[0], this.rotation[1], this.rotation[2]], this.size[0], this.size[1], this.size[2]);

        const invertNormals = new Float32Array([inverted]);
        const numPointLights = new Uint32Array([pointLights.length]);
        const cameraView = new Float32Array(eye);

        const structSize = 48;
        const lightPointsArray = new ArrayBuffer(structSize * 8);
        const lightsDataView = new DataView(lightPointsArray);

        for (let i = 0; i < pointLights.length; i++) {
            const offset = i * structSize; 
            const element = pointLights[i]
            lightsDataView.setFloat32(offset + 0, element.position[0], true);
            lightsDataView.setFloat32(offset + 4, element.position[1], true);
            lightsDataView.setFloat32(offset + 8, element.position[2], true);

            lightsDataView.setFloat32(offset + 16, element.color[0], true);
            lightsDataView.setFloat32(offset + 20, element.color[1], true);
            lightsDataView.setFloat32(offset + 24, element.color[2], true);

            lightsDataView.setFloat32(offset + 32, element.diffuseStrength, true);
            lightsDataView.setFloat32(offset + 36, element.specularStrength, true);
        }

        const invertNormalsBuffer = jgl.createUniformBuffer(invertNormals);
        const numPointLightsBuffer = jgl.createUniformBuffer(numPointLights);
        const lightPointBuffer = jgl.createUniformBuffer(lightPointsArray);
        const cameraViewBuffer = jgl.createUniformBuffer(cameraView);
        const matWorldBuffer = jgl.createUniformBuffer(matWorld);
        const matFromEyeWorldBuffer = jgl.createUniformBuffer(matFromEyeWorld);
        const matBindGroup = jgl.createUniformBindGroup(1, [matWorldBuffer, matFromEyeWorldBuffer, matViewProjBuffer, cameraViewBuffer, lightPointBuffer, numPointLightsBuffer, invertNormalsBuffer]);

        pass.setPipeline(jgl.cellPipeline);
        pass.setBindGroup(0, this.model.textureBindGroup.bindGroup);
        pass.setBindGroup(1, matBindGroup.bindGroup);
        pass.setVertexBuffer(0, this.model.vertexBuffer);
        pass.setVertexBuffer(1, this.model.vertexBuffer);
        pass.setVertexBuffer(2, this.model.vertexBuffer);
        pass.draw(this.model.vertices);
    }

    getRotationDeg() {
        return [Matrix3D.convertToDeg(this.rotation[0]), Matrix3D.convertToDeg(this.rotation[1]), Matrix3D.convertToDeg(this.rotation[2])];
    }

    setRotationDeg(rotation) {
        this.rotation = [Matrix3D.convertToRad(rotation[0]), Matrix3D.convertToRad(rotation[1]), Matrix3D.convertToRad(rotation[2])];
    }
}

class Model {
    vertices;
    indices;
    texture;

    constructor (model) {
        /*
            For now this will be obsolete
        if (indices) {
            this.indices = indices;
        }
        else {
        */
        this.indices = this.autoIndices(model.vertexData);
        //}
        this.vertices = model.vertexData;
        this.texture = model.textureData;
    }

    autoIndices(vertices) {
        let array_temp = [];
        for (let i = 0; i < vertices.length/8; i++) {
            array_temp.push(i);
        }
        return new Uint16Array(array_temp);
    }
}

class Scene {
    objects;
    sceneData;
    matViewProjBuffer;
    cameras;
    invertedObjects;

    constructor(scene, matViewProjBuffer) {
        this.sceneData = scene;
        this.objects = [];
        this.actualCamera = "camera00"
        this.pointLights = [];
        this.cameras = [];
        this.invertedObjects = [];
        this.matViewProjBuffer = matViewProjBuffer;
    }

    async loadScene(jgl) {
        let tempImage = new Image();
        let modelData = [];
        let models = [];
        let objects = [];
        let pointLights = [];
        let invertedObjects = [];
        let cameras = [];
        
        for (let i = 0; i < this.sceneData.src.models.length; i++) {
            let actualModel = this.sceneData.src.models[i];
            tempImage.src = this.sceneData.src.images[actualModel.image];
            await tempImage.decode();
            const tempImageBitmap = await createImageBitmap(tempImage);

            modelData.push(new Model(await this.fetchModel(actualModel.model, tempImageBitmap)));
        }
        
        for (let i = 0; i < modelData.length; i++) {
            models.push(jgl.loadModel(modelData[i]));
        }

        for (let i = 0; i < this.sceneData.data.objects.length; i++) {
            let actualObject = this.sceneData.data.objects[i];
            objects.push(jgl.newObject({id: actualObject.id, model: models[actualObject.model], position: actualObject.position, size: actualObject.scale, velocity: actualObject.velocity, rotation: actualObject.rotation, inverted: actualObject.inverted}));
        }
        objects.sort();

        for (let i = 0; i < objects.length; i++) {
            invertedObjects.push(objects[i].inverted);
        }

        for (let i = 0; i < this.sceneData.data.pointLights.length; i++) {
            let actualLight = this.sceneData.data.pointLights[i];
            pointLights.push({id: actualLight.id, position: actualLight.position, color: actualLight.color, diffuseStrength: actualLight.diffuseStrength, specularStrength: actualLight.diffuseStrength});
        }

        for (let i = 0; i < this.sceneData.data.cameras.length; i++) {
            let actualCamera = this.sceneData.data.cameras[i];
            cameras.push({id: actualCamera.id, position: actualCamera.position, rotation: actualCamera.rotation, fov: actualCamera.fov, active: actualCamera.active});
        }

        this.objects = objects;
        this.invertedObjects = invertedObjects;
        this.cameras = cameras.sort();
        this.pointLights = pointLights.sort();
    }

    draw(jgl, dt, matViewProjBuffer, width, height) {
        let camera;
        for (let i = 0; i < this.cameras.length; i++) {
            if (this.cameras[i].id == this.actualCamera) {
                camera = this.cameras[i];
                if (!this.cameras[i].active) {
                    this.cameras[i].active = true;
                    /*
                        For later Versions
                    
                    let matProj = Matrix3D.perspectiveMatrix(
                        Matrix3D.convertToRad(this.cameras[i].fov),
                        width / height,
                        0.1, 1000.0
                    );
                    let matViewProj = Matrix3D.multiplyMatrices(matProj, JSCGL.matView);*/
                    break;
                }
            }
        }

        let encoder = jgl.device.createCommandEncoder();

        let pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: jgl.context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: [0.1,0.1,0.1,1],
                storeOp: "store"
            }],
            depthStencilAttachment: {
                view: jgl.depthTexture.createView(),
                depthLoadOp: 'clear',
                depthClearValue: 1.0,
                depthStoreOp: 'store',
            }
        });

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].update(dt);
            if (this.invertedObjects[i] == true) {
                this.objects[i].draw(jgl, pass, camera, matViewProjBuffer, -1, this.pointLights );
            }
            else {
                this.objects[i].draw(jgl, pass, camera, matViewProjBuffer, 1, this.pointLights );
            }
            
        }
        pass.end();

        jgl.device.queue.submit([encoder.finish()]);
    }

    newCamera(position, rotation, active) {
        if (!active) {
            active = false;
        }
        this.cameras.push([position, rotation, active]);
    }

    getObjectById(id) {
        let first = 0;
        let last = this.objects.length - 1;
        let actual;
        while (first < last) {
            actual = parseInt((first + last) / 2);
            const element = this.objects[actual].id;

            if (element === id) {
                return actual;
            }
            else if (element < id) {
                first++;
            }
            else if (element > id) {
                last--;
            }
        }
        return false;
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

    txtToArray(txt) {
        let array = [];
        let array1 = [];
        let tempString = "";
    
        for (let i = 0; i < txt.length-1; i++) {
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

    async fetchModel(file, texture, indices) {
        let response = await this.fetchPostResponse("getObjModel()", file);
        let file_content = await response.text();
        if (indices) {
            return {vertexData: new Float32Array(this.txtToArray(file_content)), textureData: texture, indices: indices};
        }
        else {
            return {vertexData: new Float32Array(this.txtToArray(file_content)), textureData: texture};
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
    // WebGPU attributes
    device;
    pipeline;

    // GPU Shaders
    cellShaderModule;
    depthTexture;

    // Canvas attributes
    canvasFormat;
    context;
    width;
    height;


    constructor(device, context, canvasFormat, width, height) {
        if (!navigator.gpu) {
            alert("WebGPU is not Supported on this browser");
            throw new Error("WebGPU is not Supported on this browser");
        }

        this.context = context;
        this.canvasFormat = canvasFormat;
        this.device = device;

        this.width = width;
        this.height = height;
    }

    async init() {

        this.cellShaderModule = this.device.createShaderModule({
            label: "My first WebGPU Shader",
            code: `
            struct VertexOut {
                @builtin(position) position: vec4f,
                @location(0) uvCoords: vec2f,
                @location(1) brightness: vec3f
            }
            
            struct PointLight {
                position: vec3f,
                color: vec3f,
                diffuse: f32,
                specular: f32,
            }

            @group(0) @binding(0) var sampler1: sampler;
            @group(0) @binding(1) var texture1: texture_2d<f32>;

            @group(1) @binding(0) var<uniform> matWorld: mat4x4<f32>;
            @group(1) @binding(1) var<uniform> matFromEyeWorld: mat4x4<f32>;
            @group(1) @binding(2) var<uniform> matViewProj: mat4x4<f32>;
            @group(1) @binding(3) var<uniform> cameraView: vec3f;
            @group(1) @binding(4) var<uniform> lightPoint: array<PointLight, 8>;
            @group(1) @binding(5) var<uniform> numPointLights: u32;
            @group(1) @binding(6) var<uniform> invertNormals: f32;

            fn pointLightCalculation(light: PointLight, numPointLights: u32, finalNormal: vec3f, matWorld: mat3x3<f32>, vertWorldPosition: vec4f, cameraView: vec3f) -> vec3f {
                let lightPoint = vec3f(light.position[0], light.position[1], light.position[2]);
                let offset = lightPoint - vec3f(vertWorldPosition[0], vertWorldPosition[1], vertWorldPosition[2]);
                let distance = length(offset);
                let direction = normalize(offset);
                let specular = light.specular;
                let diffuse = light.specular;

                let diffuseRed = max(0.0, dot(direction, normalize(matWorld * finalNormal))) * light.color[0] * diffuse;
                let diffuseGreen = max(0.0, dot(direction, normalize(matWorld * finalNormal))) * light.color[1] * diffuse;
                let diffuseBlue = max(0.0, dot(direction, normalize(matWorld * finalNormal))) * light.color[2] * diffuse;
                let attenuation = 1.0 / ( 0.0025 * distance * distance + 0.25);
                let specularRed = pow(max(0.0, dot(normalize(cameraView), normalize(reflect(-direction, normalize(matWorld * finalNormal))) ) ), 16 ) * light.color[0] * specular;
                let specularGreen = pow(max(0.0, dot(normalize(cameraView), normalize(reflect(-direction, normalize(matWorld * finalNormal))) ) ), 16 ) * light.color[1] * specular;
                let specularBlue = pow(max(0.0, dot(normalize(cameraView), normalize(reflect(-direction, normalize(matWorld * finalNormal))) ) ), 16 ) * light.color[2] * specular;
                let diffuseLight = vec3f(diffuseRed * attenuation, diffuseGreen * attenuation, diffuseBlue * attenuation);
                let specularLight = vec3f(specularRed * attenuation, specularGreen * attenuation, specularBlue * attenuation);        
                
                return specularLight + diffuseLight;
            }
    
            @vertex
            fn vertexShader1(@location(0) vertPosition: vec3f, @location(1) uvCoords: vec2f, @location(2) normal: vec3f) -> VertexOut {
                var out: VertexOut;
                let finalNormal = vec3f(normal[0] * invertNormals, normal[1] * invertNormals, normal[2] * invertNormals);
                let vertWorldPosition = matWorld * vec4f(vertPosition, 1.0);
                out.brightness = vec3f(0, 0, 0);
                let normalMatrix: mat3x3<f32> = mat3x3<f32>(
                    matWorld[0].xyz,
                    matWorld[1].xyz,
                    matWorld[2].xyz
                );

                for (var i: u32 = 0; i < numPointLights; i += 1) {
                    out.brightness += pointLightCalculation(lightPoint[i], numPointLights, finalNormal, normalMatrix, vertWorldPosition, cameraView);
                }
                
                out.position = matViewProj * matFromEyeWorld * vec4f(vertPosition, 1);
                out.uvCoords = uvCoords;
                return out;
            }
    
            @fragment
            fn fragmentShader1(@location(0) uvCoords: vec2f, @location(1) brightness: vec3f) -> @location(0) vec4f {
                let textureColor = textureSample(texture1, sampler1, uvCoords);

                let textureRed = textureColor.r;
                let textureGreen = textureColor.g;
                let textureBlue = textureColor.b;

                let red = (textureRed * 0.2) + (textureRed * brightness[0]);
                let green = (textureGreen * 0.2) + (textureGreen * brightness[1]);
                let blue = (textureBlue * 0.2) + (textureBlue * brightness[2]);
                return vec4f(red, green, blue, 1.0);
            }
    
            `
        });

        this.depthTexture = this.device.createTexture({
            size: [this.width, this.height, 1],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        let positionBufferLayout = {
            arrayStride: 32,
            attributes: [{
                format: "float32x3",
                offset: 0,
                shaderLocation: 0
            }]
        }
        let uvCoordsBufferLayout = {
            arrayStride: 32,
            attributes: [{
                format: "float32x2",
                offset: 12,
                shaderLocation: 1
            }]
        }
        let normalsBufferLayout = {
            arrayStride: 32,
            attributes: [{
                format: "float32x3",
                offset: 20,
                shaderLocation: 2
            }]
        }

        this.cellPipeline = this.device.createRenderPipeline({
            label: "Cell Pipeline",
            layout: "auto",
            vertex: {
                module: this.cellShaderModule,
                entryPoint: "vertexShader1",
                buffers: [positionBufferLayout, uvCoordsBufferLayout, normalsBufferLayout]
            },
            fragment: {
                module: this.cellShaderModule,
                entryPoint: "fragmentShader1",
                targets: [{
                    format: this.canvasFormat
                }]
            },
            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less"
            }
        });

    }

    createVertexBuffer(data) {
        let vertexBuffer = this.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.device.queue.writeBuffer(vertexBuffer, 0, data);

        return vertexBuffer;
    }

    loadModel(model) {
        const textureBuffer = this.createTexture(model.texture);
        const textureBindGroup = this.createTextureBindGroup(textureBuffer);
        const vertexBuffer = this.createVertexBuffer(model.vertices);

        return {vertexBuffer: vertexBuffer, textureBindGroup: textureBindGroup, indices: model.indices, vertices: model.vertices.length/8};
    }

    newObject({id: id, model: model, position: shapePosition, size: shapeSize, velocity: shapeVelocity, rotation: shapeRotation, inverted: inverted}) {
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

        return new Object3D(id, position, velocity, size, rotation, model, inverted);
    }

    createUniformBuffer(data) {
        let size;
        if (data.byteLength < 16) {
            size = 16;
        }
        else {
            size = data.byteLength;
        }
        let buffer = this.device.createBuffer({
            size: size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        
        this.device.queue.writeBuffer(buffer, 0, data);

        return buffer;
    }

    createUniformBindGroup(group, bindings) {
        let entries = [];
        for (let i = 0; i < bindings.length; i++) {
            entries.push({ binding: i, resource: {buffer: bindings[i]} });  
        }
        let bindGroup = this.device.createBindGroup({
            layout: this.cellPipeline.getBindGroupLayout(group),
            entries: entries
        });

        return {group: group, bindGroup: bindGroup};
    }    

    createTexture(data, linear) {
        if (typeof linear == "undefined" || typeof linear == "null") {
            linear = true;
        }

        let sampler;
        let texture = this.device.createTexture({
            size: [data.width, data.height],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        if (linear) {
            sampler = this.device.createSampler({
                minFilter: "linear",
                magFilter: "linear"
            });
        }
        else {
            sampler = this.device.createSampler();
        }

        this.device.queue.copyExternalImageToTexture(
            { source: data },
            { texture: texture },
            [data.width, data.height]
        );

        return {texture: texture, sampler: sampler};
    }

    createTextureBindGroup(texture, id) {

        // Change If necessary
        if (typeof id == "undefined" || typeof id == "null") {
            id = 0;
        }

        let bindGroup = this.device.createBindGroup({
            layout: this.cellPipeline.getBindGroupLayout(id),
            entries: [
              { binding: 0, resource: texture.sampler },
              { binding: 1, resource: texture.texture.createView() },
            ]
        });

        return {group: id, bindGroup: bindGroup};
    }
}
