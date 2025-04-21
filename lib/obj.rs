use std::fs::File;
use std::io::{Read, Write};

fn getObjVert(obj: &String) -> Vec<Vec<String>> {
    let mut status = "READ";
    let mut vertices: Vec<Vec<String>> = vec![];
    let mut tempArray: Vec<String> = vec![];
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
                tempArray = vec![];
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

fn getObjF(obj: &String) -> Vec<String> {
    let mut status = "READ";
    let mut barFlag = false;
    let mut arrayF: Vec<String> = vec![];
    let mut tempArray: Vec<String> = vec![];
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

pub fn getObjTriangles(fileAddr: &String) -> Vec<f32> {
    let mut file = File::open(fileAddr).unwrap();
    let mut obj = String::new();
    file.read_to_string(&mut obj);

    let mut triangles: Vec<f32> = vec![];
    let mut vertices: Vec<Vec<String>> = getObjVert(&obj);
    let mut arrayF: Vec<String> = getObjF(&obj);

    println!("{:?}", arrayF);

    for f in arrayF {
        triangles.push(vertices[f.parse::<usize>().unwrap()-1][0].parse::<f32>().unwrap());
        triangles.push(vertices[f.parse::<usize>().unwrap()-1][1].parse::<f32>().unwrap());
    }

    triangles
}