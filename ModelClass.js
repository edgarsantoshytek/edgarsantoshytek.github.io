//Las cosas que hereden de Model deben agregarse a esta lista.
var registeredObjects = [];

// La clase Model representa cualquier cosa que se quiera dibujar en WebGL.
class Model{
    constructor(gl, shaderProgram, path, position, angle, axis, scale, name, vertices, textureCoords, normals, animation, action, collision){
        this.name = name;                 // El nombre.
        
        this.vertexBuffer;              // El lugar donde se encuentran los vertices.
        this.textureBuffer;             // UV's de la textura para cada uno de los vertices
        this.normalBuffer;              // Las normales de la figura
        
        this.path = path;                       //La direccion de la textura
        this.texture;                           // La textura
        this.gl = gl;                           //Referencia a gl
        this.shaderProgram = shaderProgram;     //Referencia a ShaderProgram
        
        //Los datos para los buffers
        this.vertices = vertices;                       //Los vertices de la figura
        this.textureCoords = textureCoords;             //Las texturas de la figura
        this.normals = normals;                         //Las normales de la figura
        
        this.initBuffers();
        this.initTexture(path);
        
        this.x = position[0];
        this.y = position[1];
        this.z = position[2];
        this.angle = angle;
        this.axis = axis;
        this.sx = scale[0];
        this.sy = scale[1];
        this.sz = scale[2];
        
        
        
        //Para las animaciones
        this.animation = animation;
        
        this.loop = false;                                                               //Indica si la animación debe continuar ciclicamente
        this.firstTime = true;                                                          //Variable de control para las animaciones
        this.distance = [0,0,0,0,0,0,0,0,0,0];                                          //Variable de control para las animaciones. Indica la cantidad de unidades que debe de cambiar cada una de las transformaciones para llegar a su destino.
        this.finish = [false,false,false,false,false,false,false,false,false,false];    //Variable de control. Indica si ya llegaron a su destino.
        this.startDate = 0;                                                             //Variable de control para las animaciones. Indica a que hora empezó la animación
        this.timeAsOnlyFinishIndicator = false;                                          //Variable de control para las animaciones. Si es true, solo se usa el tiempo para indicar si ya se acabó la animación. Si es false, se usa el tiempo y se verifica que en verdad haya llegado a su posición.
        
        //Todo lo que está en original es para mantener los verdaderos datos de guardado.
        this.original = {};
        this.original.animation = this.animation.slice();
        this.original.x = position[0];
        this.original.y = position[1];
        this.original.z = position[2];
        this.original.angle = angle;
        this.original.axis = axis;
        this.original.sx = scale[0];
        this.original.sy = scale[1];
        this.original.sz = scale[2];
        
        this.original.vertices = this.vertices;
        this.original.normals = this.normals;
        
        //Para las acciones
        this.action = action;
        this.keyframesInCurrentAction = 0;      //Variable de control para las acciones. Vale la cantidad de cuadros llave por acción
        this.currentFrames = 0;                 //Variable de control. Indica cuantos frames lleva ejecutandose un fragmento de la acción.
        this.lastFrame;
        this.currentAction = undefined;         //Variable de control para las acciones. Indica el indice de la acción actual.
        
        //Para las colisiones
        //this.collision = [ [ [0,0,0], 1], [ [1,1,1], 1] ];          //Indica las colisiones, para cada una de las colisiones es un arreglo con otro arreglo que indica la traslación de la colisión y el segundo parámetro es un radio de colisión
        this.wireframe = false;
        this.collision = collision;
        //alert(this.collision); 
    }
    
    //Inicializa los buffers: Vertex Buffer, TextureCoordBuffer Y Normal Buffer
    initBuffers(gl){
        //Los vertices
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = this.vertices.length/3;
        
        //La textura
        this.textureBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoords), this.gl.STATIC_DRAW);
        this.textureBuffer.itemSize = 2;
        this.textureBuffer.numItems = this.textureCoords.length/2; 
        //Fin de la textura
        
        
        //Las normales
        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
        this.normalBuffer.itemSize = 3;
        this.normalBuffer.numItems = this.normals.length/3;
        //Fin de las normales
    }
    
    
    handleLoadedTexture(path){
        this.gl.bindTexture(this.gl.TEXTURE_2D, path);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, path.image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
    
    //Inicializa la textura
    //path = El nombre de la imagen a cargar
    initTexture(path){
        //var index = this.texture.length;
        this.texture = this.gl.createTexture();
        this.texture.image = new Image();
        var self = this;
        this.texture.image.onload = function(){
            self.handleLoadedTexture(self.texture);
        }
        this.texture.image.src = path;
    }
    
    draw(ambientLight, directionalLight){
        // El pedo del dibujado
        
        //IGNORAR, esto es mugrero cholo
        /*this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = this.vertices.length/3;*/
        
        // Los vertices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        
        //La textura y los UV's
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.textureBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
        
        //Las normales
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, this.normalBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        
        //La luz
        this.gl.uniform1i(this.shaderProgram.useLightUniform, true);
        if(true){
            this.gl.uniform3f(this.shaderProgram.ambientColorUniform, ambientLight[0], ambientLight[1], ambientLight[2]);
            var lightDirection = directionalLight[0];
            var adjustedLD = vec3.create();
            vec3.normalize(lightDirection, adjustedLD);
            vec3.scale(adjustedLD, -1);
            this.gl.uniform3fv(this.shaderProgram.lightingDirectionUniform, adjustedLD);
            this.gl.uniform3f(this.shaderProgram.directionalColorUniform, directionalLight[1][0], directionalLight[1][1], directionalLight[1][2]);
        }
        
        if(this.wireframe){
            this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.vertexBuffer.numItems);
        }
        else{
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBuffer.numItems);
        }
        
        
        if(this.animation.length > 0 && editorMode == 1 && play){
            this.animate(this.animation[0], this.animation[1]);
        }
        
        if(this.action.length > 0){
            this.doAction(0);
        }
        
        
    }
    
    
    //Crea una animación
    animate(where, time){
        
        if(this.firstTime){
            this.distance[0] = where[0] - this.x;
            this.distance[1] = where[1] - this.y;
            this.distance[2] = where[2] - this.z;
            this.distance[3] = where[3] - this.angle;
            this.distance[4] = where[4] - this.axis[0];
            this.distance[5] = where[5] - this.axis[1];
            this.distance[6] = where[6] - this.axis[2];
            this.distance[7] = where[7] - this.sx;
            this.distance[8] = where[8] - this.sy;
            this.distance[9] = where[9] - this.sz;
            this.firstTime = false;
            this.startDate = new Date().getTime();
        }
        
        if(Math.abs((where[0] - this.x)) <= 0.01){
            this.finish[0] = true;
        }
        if(Math.abs((where[1] - this.y)) <= 0.01){
            this.finish[1] = true;
        }
        if(Math.abs((where[2] - this.z)) <= 0.01){
            this.finish[2] = true;
        }
        if(Math.abs((where[3] - this.angle)) <= 0.01){
            this.finish[3] = true;
        }
        if(Math.abs((where[4] - this.axis[0])) <= 0.01){
            this.finish[4] = true;
        }
        if(Math.abs((where[5] - this.axis[1])) <= 0.01){
            this.finish[5] = true;
        }
        if(Math.abs((where[6] - this.axis[2])) <= 0.01){
            this.finish[6] = true;
        }
        if(Math.abs((where[7] - this.sx)) <= 0.01){
            this.finish[7] = true;
        }
        if(Math.abs((where[8] - this.sy)) <= 0.01){
            this.finish[8] = true;
        }
        if(Math.abs((where[9] - this.sz)) <= 0.01){
            this.finish[9] = true;
        }
        
        var allFinish = false;
        for(var i = 0; i < 10; i++){
            if(this.finish[i]){
                if(i == 9){
                    allFinish = true;
                }
                else{
                    continue;
                }
            }
            else{
                break;
            }
        }
        
        if(this.timeAsOnlyFinishIndicator){
            if(( new Date().getTime() - this.startDate) >= (time*1000)){
                //Ya todos acabaron
                
                this.x = where[0];
                this.y = where[1];
                this.z = where[2];
                this.angle = where[3];
                this.axis[0] = where[4];
                this.axis[1] = where[5];
                this.axis[2] = where[6];
                this.sx = where[7];
                this.sy = where[8];
                this.sz = where[9];
                
                if(this.loop){
                    var i = this.animation.shift();
                    var j = this.animation.shift();
                    this.animation.push(i);
                    this.animation.push(j);
                }
                else{
                    this.animation.splice(0,1);
                    this.animation.splice(0,1);
                }
                
                this.cleanUpAnimationVariables();
            }
        }
        else{
            if(allFinish && ( new Date().getTime() - this.startDate) >= (time*1000)){
                //Ya todos acabaron
                
                this.x = where[0];
                this.y = where[1];
                this.z = where[2];
                this.angle = where[3];
                this.axis[0] = where[4];
                this.axis[1] = where[5];
                this.axis[2] = where[6];
                this.sx = where[7];
                this.sy = where[8];
                this.sz = where[9];
                
                if(this.loop){
                    var i = this.animation.shift();
                    var j = this.animation.shift();
                    this.animation.push(i);
                    this.animation.push(j);
                }
                else{
                    this.animation.splice(0,1);
                    this.animation.splice(0,1);
                }
                
                this.cleanUpAnimationVariables();
            }
        }
        
        
        if(!allFinish){
            this.x += this.delta(this.distance[0], time);
            this.y += this.delta(this.distance[1], time);
            this.z += this.delta(this.distance[2], time);
            this.angle += this.delta(this.distance[3], time);
            this.axis[0] += this.delta(this.distance[4], time);
            this.axis[1] += this.delta(this.distance[5], time);
            this.axis[2] += this.delta(this.distance[6], time);
            this.sx += this.delta(this.distance[7], time);
            this.sy += this.delta(this.distance[8], time);
            this.sz += this.delta(this.distance[9], time);
        }
    }
    
    cleanUpAnimationVariables(){
        this.firstTime = true;
        this.startDate = 0;
        for(var i = 0; i < 10; i++){
            this.distance[i] = 0;
            this.finish[i] = false;
        }
    }
    
    //Cosas útiles
    
    // Devuelve la cantidad de unidades que se debe de mover las cosas en cada frame.
    delta(distance, time){
        // Distance es la distancia a moverse, en unidades cartecianas
        // time es el tiempo en segundos que tarda la accion
        time = time * 1000;
        return (((1000/60)*distance)/time);
    }
    
    animationToString(){
        var result = "[";
        for(var i = 0; i < this.original.animation.length; i+=2){
            if(i != 0){
                result += ",";
            }
            var pos = "[" + this.original.animation[i] + "]";
            var time = this.original.animation[i+1];
            result += pos + "," + time;
        }
        result += "]";
        return result;
    }
    
    //Para las acciones
    doAction(index){
        if(this.lastAction == undefined || this.lastAction != index){
            this.lastFrame = this.action[index].length-1;
            this.vertices = this.action[index][this.lastFrame].vertices.slice();
            this.normals = this.action[index][this.lastFrame].normals.slice();
            this.lastAction = index;
            
        }
        
        var nextFrame = this.nextStep(index);
        
        var frames = this.action[index][nextFrame].frames;
        
        for(var i = 0; i < this.vertices.length; i++){
            this.vertices[i] += (this.action[index][nextFrame].vertices[i] - this.action[index][this.lastFrame].vertices[i])/frames;
        }
        for(var i = 0; i < this.normals.length; i++){
            this.normals[i] += (this.action[index][nextFrame].normals[i] - this.action[index][this.lastFrame].normals[i])/frames;
        }
        
        //Actualiza los vertices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = this.vertices.length/3;
        
        //Actualiza las normales
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
        this.normalBuffer.itemSize = 3;
        this.normalBuffer.numItems = this.normals.length/3;
        
        this.currentFrames += 1;
        
        //console.log(this.vertices[0]);
        
        if(this.currentFrames >= frames){
            
            this.realNextStep(index);
            //console.log("this.lastFrame = " + this.lastFrame);
            this.currentFrames = 0;
        }
    }
    
    nextStep(index){
        if(this.lastFrame == this.action[index].length-1){
            return 0;
        }
        return this.lastFrame+1;
    }
    
    realNextStep(index){
        if(this.action != undefined){
                this.lastFrame++;
                if(this.lastFrame == this.action[index].length){
                    this.lastFrame = 0;
                }
            }
        }
        
    //Para las colisiones
    detectCollision(models){
        
        var result = [];
        
        //Los objetos de result son
        //collisionWith, yourCollisionIndex, itsCollisionIndex
        
        for(var i = 0; i < this.collision.length; i++){
            var actualCollision = this.collision[i];
            for(var j = 0; j < models.length; j++){
                var otherModel = models[j];
                if(this != otherModel){
                    for(var k = 0; k < otherModel.collision.length; k++){
                        /*var x1 = this.x + actualCollision[0][0];
                        var y1 = this.y + actualCollision[0][1];
                        var z1 = this.z + actualCollision[0][2];
                        
                        var x2 = otherModel.x + otherModel.collision[k][0][0];
                        var y2 = otherModel.y + otherModel.collision[k][0][1];
                        var z2 = otherModel.z + otherModel.collision[k][0][2];*/
                        
                        var auxMatrix = mat4.create();
                        mat4.identity(auxMatrix);
                        mat4.rotate(auxMatrix, this.angle, this.axis);
                        
                        var pX = actualCollision[0][0];
                        var pY = actualCollision[0][1];
                        var pZ = actualCollision[0][2];
                        
                        
                        var x1 = (pX * auxMatrix[0]) + (pY * auxMatrix[4]) + (pZ * auxMatrix[8]);
                        var y1 = (pX * auxMatrix[1]) + (pY * auxMatrix[5]) + (pZ * auxMatrix[9]);
                        var z1 = (pX * auxMatrix[2]) + (pY * auxMatrix[6]) + (pZ * auxMatrix[10]);
                        
                        x1 += this.x;
                        y1 += this.y;
                        z1 += this.z;
                        
                        //Para el otro
                        
                        var auxMatrix = mat4.create();
                        mat4.identity(auxMatrix);
                        mat4.rotate(auxMatrix, otherModel.angle, otherModel.axis);
                        
                        var pX2 = otherModel.collision[k][0][0];
                        var pY2 = otherModel.collision[k][0][1];
                        var pZ2 = otherModel.collision[k][0][2];
                        
                        /*var x2 = otherModel.x + otherModel.collision[k][0][0];
                        var y2 = otherModel.y + otherModel.collision[k][0][1];
                        var z2 = otherModel.z + otherModel.collision[k][0][2];*/
                        
                        var x2 = (pX2 * auxMatrix[0]) + (pY2 * auxMatrix[4]) + (pZ2 * auxMatrix[8]);
                        var y2 = (pX2 * auxMatrix[1]) + (pY2 * auxMatrix[5]) + (pZ2 * auxMatrix[9]);
                        var z2 = (pX2 * auxMatrix[2]) + (pY2 * auxMatrix[6]) + (pZ2 * auxMatrix[10]);
                        
                        
                        x2 += otherModel.x;
                        y2 += otherModel.y;
                        z2 += otherModel.z;
                        
                        
                        var distance = ( ( ((x2 - x1)**2) + ((y2 - y1)**2) + ((z2 - z1)**2) )**0.5);
                        
                        //console.log("Mi nombre es " + this.name + ". Su nombre es: " + otherModel.name + " Y la distancia es: " + distance);
                        //console.log("Mis coordenadas son: (" + x1 + "," + y1 + "," + z1 + ")");
                        //console.log("Sus coordenadas son: (" + x2 + "," + y2 + "," + z2 + ")");
                        //console.log(otherModel.name);
                        //console.log(distance);
                        
                        if(this.name == "TOCHA"){
                            //console.log("Mi nombre es " + this.name + ". Su nombre es: " + otherModel.name + " Y la distancia es: " + distance);
                            //console.log(x1);
                        }
                        
                        if(actualCollision[1] + otherModel.collision[k][1] > distance){
                            result.push({myName : this.name, itsName : otherModel.name, collisionWith : otherModel, yourCollisionIndex : i, itsCollisionIndex : k});
                        }
                    }
                }
            }
        }
        
        return result;
        
    }
        
}