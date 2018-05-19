// La clase Model representa cualquier cosa que se quiera dibujar en WebGL.
class Model{
    constructor(gl, shaderProgram, path, position, angle, axis, scale, name){
        this.vertexBuffer;              // El lugar donde se encuentran los vertices.
        this.textureBuffer;             // UV's de la textura para cada uno de los vertices
        this.indexBuffer;               // Orden en que se dibujaran los vertices
        
        this.texture;                           // La textura
        this.gl = gl;                           //Referencia a gl
        this.shaderProgram = shaderProgram;     //Referencia a ShaderProgram
        
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
        
        this.name = name;                 // El nombre.
    }
    
    //Inicializa los buffers: Vertex Buffer, TextureCoordBuffer e Index Buffer
    initBuffers(gl){
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        var vertices = [
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,
             0.5, -0.5,  0.5,
            -0.5, -0.5,  0.5,
             0.5,  0.5,  -0.5,
            -0.5,  0.5,  -0.5,
             0.5, -0.5,  -0.5,
            -0.5, -0.5,  -0.5
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.vertexBuffer.numItems = 8;
        
        //La textura
        this.textureBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        var textureCoords = [1.0, 0.0,
                            0.0, 0.0,
                            1.0, 1.0,
                            0.0, 1.0,
                            0.0, 0.0,
                            1.0, 0.0,
                            0.0, 1.0,
                            1.0, 1.0
                            
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);
        this.textureBuffer.itemSize = 2;
        this.textureBuffer.numItems = 8; 
        //Fin de la textura
        
        
        //Los indices del cubo
        
        var index = [0, 1, 2,
                    1, 3, 2,
                    1, 5, 3,
                    5, 7, 3,
                    4, 5, 6,
                    5, 7, 6,
                    4, 0, 6,
                    0, 2, 6,
                    4, 5, 0,
                    5, 1, 0,
                    2, 3, 6,
                    3, 7, 6
                    ];
                    
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), this.gl.STATIC_DRAW);
        this.indexBuffer.itemSize = 1;
        this.indexBuffer.numItems = 36;
    }
    
    
    handleLoadedTexture(path){
        this.gl.bindTexture(this.gl.TEXTURE_2D, path);
        //this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
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
    
    draw(){
        // El pedo del dibujado
        
        // Los vertices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        
        //La textura y los UV's
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer);
        this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.textureBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
        
        // Los indices
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexBuffer.numItems,this.gl.UNSIGNED_SHORT, 0);
        //Fin del pedo del dibujado
    }
}