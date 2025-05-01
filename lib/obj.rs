use std::fs::File;
use std::io::{Read, Write};

pub fn getObjVertices2D(obj: &String) -> Vec<Vec<String>> {
    let mut status = "READ";
    let mut vertices: Vec<Vec<String>> = Vec::new();
    let mut tempArray: Vec<String> = Vec::new();
    let mut tempString = String::new();

    for c in obj.chars() {

        if status == "GET_VERT" {
            if c == ' ' && tempString != String::new() {
                tempArray.push(tempString);
                tempString = String::new();
            }
            else if c == '\n' {
                tempArray.push(tempString);
                tempString = String::new();
                status = "READ";
                tempArray.remove(1);
                vertices.push(tempArray);
                tempArray = Vec::new();
            }
            else if c != ' ' {
                tempString = format!("{tempString}{c}");
            }
        }
        else if status == "READ" {
            tempString = format!("{tempString}{c}");
            if c == ' ' || c == '\n' {
                if tempString == "v " {status = "GET_VERT";}
                tempString = String::new();
            }
        }

    }

    vertices
}

pub fn getObjVertices(obj: &String) -> Vec<Vec<String>> {
    let mut status = "READ";
    let mut vertices: Vec<Vec<String>> = Vec::new();
    let mut tempArray: Vec<String> = Vec::new();
    let mut tempString = String::new();

    for c in obj.chars() {

        if status == "GET_VERT" {
            if c == ' ' && tempString != String::new() {
                tempArray.push(tempString);
                tempString = String::new();
            }
            else if c == '\n' {
                tempArray.push(tempString);
                tempString = String::new();
                status = "READ";
                vertices.push(tempArray);
                tempArray = Vec::new();
            }
            else if c != ' ' {
                tempString = format!("{tempString}{c}");
            }
        }
        else if status == "READ" {
            tempString = format!("{tempString}{c}");
            if c == ' ' || c == '\n' {
                if tempString == "v " {status = "GET_VERT";}
                tempString = String::new();
            }
        }

    }

    vertices
}

pub fn getObjV(obj: &String) -> Vec<Vec<Vec<String>>> {
    let mut status = "READ";
    let mut vertices: Vec<Vec<String>> = Vec::new();
    let mut uvCoords: Vec<Vec<String>> = Vec::new();
    let mut normals: Vec<Vec<String>> = Vec::new();
    let mut tempArray: Vec<String> = Vec::new();
    let mut tempString = String::new();

    for c in obj.chars() {

        if status == "GET_VERT" {
            if c == ' ' && tempString != String::new() {
                tempArray.push(tempString);
                tempString = String::new();
            }
            else if c == '\n' {
                tempArray.push(tempString);
                tempString = String::new();
                status = "READ";
                vertices.push(tempArray);
                tempArray = Vec::new();
            }
            else if c != ' ' {
                tempString = format!("{tempString}{c}");
            }
        }
        else if status == "GET_UV" {
            if c == ' ' && tempString != String::new() {
                tempArray.push(tempString);
                tempString = String::new();
            }
            else if c == '\n' {
                tempArray.push(tempString);
                tempString = String::new();
                status = "READ";
                uvCoords.push(tempArray);
                tempArray = Vec::new();
            }
            else if c != ' ' {
                tempString = format!("{tempString}{c}");
            }
        } else if status == "GET_NORM" {
            if c == ' ' && tempString != String::new() {
                tempArray.push(tempString);
                tempString = String::new();
            }
            else if c == '\n' {
                tempArray.push(tempString);
                tempString = String::new();
                status = "READ";
                normals.push(tempArray);
                tempArray = Vec::new();
            }
            else if c != ' ' {
                tempString = format!("{tempString}{c}");
            }
        }
        else if status == "READ" {
            tempString = format!("{tempString}{c}");
            if c == ' ' || c == '\n' {
                if tempString == "v " {status = "GET_VERT";}
                if tempString == "vt " {status = "GET_UV";}
                if tempString == "vn " {status = "GET_NORM";}
                tempString = String::new();
            }
        }

    }

    vec![vertices, uvCoords, normals]
}

pub fn getObjF(obj: &String) -> Vec<String> {
    let mut status = "READ";
    let mut barFlag = false;
    let mut arrayF: Vec<String> = Vec::new();
    let mut tempArray: Vec<String> = Vec::new();
    let mut tempString = String::new();

    for c in obj.chars() {

        if c == '/' {barFlag = true;}
        if c == ' ' {barFlag = false;}

        if status == "GET_F" {
            if c == ' ' && tempString != String::new() {
                arrayF.push(tempString);
                tempString = String::new();
            }
            else if c == '\n' {
                arrayF.push(tempString);
                tempString = String::new();
                status = "READ";
            }
            else {
                if c != ' ' && !barFlag {tempString = format!("{tempString}{c}");}
            }
        }

        if c == 'f' {status = "GET_F";}

    }

    arrayF
}

pub fn getObjFData(obj: &String) -> Vec<Vec<String>> {
    let mut status = "READ";
    let mut barFlag = false;
    let mut verticesF: Vec<String> = Vec::new();
    let mut uvCoordsF: Vec<String> = Vec::new();
    let mut normalsF: Vec<String> = Vec::new();
    let mut tempArray: Vec<String> = Vec::new();
    let mut tempString = String::new();

    for c in obj.chars() {

        if status == "GET_F" {
            if c == ' ' && tempString != String::new() {
                tempArray.push(tempString);
                tempString = String::new();
            } 
            else if c == '/' {
                tempArray.push(tempString);
                tempString = String::new();
            }
            else if c == '\n' {
                tempArray.push(tempString);
                tempString = String::new();
                status = "READ";
            }
            else {
                if c != ' ' && c != '/' {tempString = format!("{tempString}{c}");}
            }
        }


        if c == 'f' {status = "GET_F";}

    }

    let mut i = 0;
    for _ in 0..tempArray.len()/3  {
        verticesF.push(tempArray[i].clone());
        uvCoordsF.push(tempArray[i+1].clone());
        normalsF.push(tempArray[i+2].clone());
        i += 3;
    }

    vec![verticesF, uvCoordsF, normalsF]
}

pub fn getObjTriangles(fileAddr: &String, zSkip: bool) -> Vec<f32> {
    let mut file = File::open(fileAddr).unwrap();
    let mut obj = String::new();
    file.read_to_string(&mut obj);

    let mut triangles: Vec<f32> = Vec::new();
    let mut vertices: Vec<Vec<String>>;
    if zSkip {vertices = getObjVertices2D(&obj);}
    else {vertices = getObjVertices(&obj);}
    let mut arrayF: Vec<String> = getObjF(&obj);

    if zSkip {
        for f in arrayF {
            triangles.push(vertices[f.parse::<usize>().unwrap()-1][0].parse::<f32>().unwrap());
            triangles.push(vertices[f.parse::<usize>().unwrap()-1][1].parse::<f32>().unwrap());
        }
    }
    else {
        for f in arrayF {
            triangles.push(vertices[f.parse::<usize>().unwrap()-1][0].parse::<f32>().unwrap());
            triangles.push(vertices[f.parse::<usize>().unwrap()-1][1].parse::<f32>().unwrap());
            triangles.push(vertices[f.parse::<usize>().unwrap()-1][2].parse::<f32>().unwrap());
        }
    }

    triangles
}

pub fn getObjModel(fileAddr: &String) -> Vec<f32> {
    let mut file = File::open(fileAddr).unwrap();
    let mut obj = String::new();
    file.read_to_string(&mut obj);

    let mut model: Vec<f32> = Vec::new();
    let arrayV = getObjV(&obj);
    let arrayF = getObjFData(&obj);

    let vertices = arrayV[0].clone();
    let uvCoords = arrayV[1].clone();
    let normals = arrayV[2].clone();

    let verticesF = arrayF[0].clone();
    let uvCoordsF = arrayF[1].clone();
    let normalsF = arrayF[2].clone();

    for i in 0..verticesF.len() {
        model.push(vertices[verticesF[i].parse::<usize>().unwrap()-1][0].parse::<f32>().unwrap());
        model.push(vertices[verticesF[i].parse::<usize>().unwrap()-1][1].parse::<f32>().unwrap());
        model.push(vertices[verticesF[i].parse::<usize>().unwrap()-1][2].parse::<f32>().unwrap());

        model.push(uvCoords[uvCoordsF[i].parse::<usize>().unwrap()-1][0].parse::<f32>().unwrap());
        model.push(uvCoords[uvCoordsF[i].parse::<usize>().unwrap()-1][1].parse::<f32>().unwrap());

        model.push(normals[normalsF[i].parse::<usize>().unwrap()-1][0].parse::<f32>().unwrap());
        model.push(normals[normalsF[i].parse::<usize>().unwrap()-1][1].parse::<f32>().unwrap());
        model.push(normals[normalsF[i].parse::<usize>().unwrap()-1][2].parse::<f32>().unwrap());
    }

    model
}
