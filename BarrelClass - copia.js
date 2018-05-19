class Barrel extends Model{
    constructor(gl, shaderProgram, path, position, angle, axis, scale, name){
        
        var vertices = [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0];
        var textureCoords = [0.0, 0.0, 1.0, 1.0, 0.0, 1.0];
        var normals = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
        super(gl, shaderProgram, path, position, angle, axis, scale, name, vertices, textureCoords, normals);
    }
    
}