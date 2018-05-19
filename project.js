function loadProject(){
	//manager.models.push(new Barrel(manager.gl, manager.shaderProgram, "textures/barrel.png", [0, 0, 0], 0, [0,0,1], [0.01, 0.01, 0.01], "BARRIL CHOLO", [[0,0,0,12.593333333333334,0,0,1,0.01,0.010000000000000446,0.01],4]));
	manager.models.push(new Tocha(manager.gl, manager.shaderProgram, "textures/tocha3.png", [-4, 0, 0], 0, [0,0,0], [0.1, 0.1, 0.1], "TOCHA", []));
	manager.models.push(new Extintor(manager.gl, manager.shaderProgram, "textures/barrel.png", [0, 0, 0], 0, [0,0,1], [0.01, 0.01, 0.01], "EXTINTOR", [[0,0,0,12.593333333333334,0,0,1,0.01,0.010000000000000446,0.01],4]));
        manager.initGUI();
}