use std::fs::File;
use std::sync::{Arc, Mutex, mpsc};
use std::io::{Read, Write, BufRead, BufReader};
use std::process::{Command, Stdio};
use obj;
use decoder;

fn subtract_char(x:&String,y:char) -> String{
    let mut z = String::new();
    for i in x.chars() {
    if i != y {
    z = format!("{}{}",z,i.to_string());
            }
        }
    z
    }

fn get_body_request_line(request: &String) -> String {
    let list_of_lines_incomplete = split_string(request,'\n');
    let mut list_of_lines = Vec::new();
    for i in list_of_lines_incomplete.iter() {
        list_of_lines.push(subtract_char(i, '\r'));
    }
    let mut line_index:usize = 0;
    let mut start_reading_line = String::new();
    let mut finished = false;
    let mut counter = 0;
    let mut output = String::new();
    for (index,value) in list_of_lines.iter().enumerate() {
        if value == "" {
            if finished != true {
                line_index = index;
                start_reading_line = value.to_string();
                finished = true;
            }
        }
    }
    finished = false;
    for i in request.chars() {
        if counter == line_index+1 {
            output = format!("{}{}",output,i.to_string());
            finished=true;
        }
        if i == '\n' {
            if finished != true {counter+=1;}
        }
    }
    output
}

fn read_between_chars(input: &String,x:char,y:char) -> String {
    let mut get_chars = false;
    let mut finished = false;
    let mut output = String::new();
    for i in input.chars() {
        if i == y {get_chars=false;}
        if get_chars == true {
            output = format!("{}{}",output,i.to_string());
        }
        if i == x {
            if finished != true {
                get_chars=true;
                finished=true;
                }
            }
    }
    if finished != true {
        output = "NONE".to_string();
    }
    output
}

fn split_string(input:&String,char_a:char) -> Vec<String> {
    let mut parameters_list = Vec::new();
    let mut temp_string = String::new();
    for i in input.chars() {
        if i == char_a {parameters_list.push(temp_string);temp_string = String::from("");}
        else {temp_string = format!("{}{}",temp_string,i.to_string());}
    }
    parameters_list
}

fn especial_split_string(input:&String,char_a:char) -> Vec<String> {
    let mut parameters_list = Vec::new();
    let mut temp_string = String::new();
    let mut stop = false;
    let mut stop2 = false;
    for i in input.chars() {
        if i == '[' {stop=true;}
        if i == ']' {stop=false;}
        if stop != true {
            if i == char_a {parameters_list.push(temp_string);temp_string = String::from("");stop2=true;}
        }
        if stop2 != true {
            if i != ']' {
                if i != '[' {
                    if i != '\r' {temp_string = format!("{}{}",temp_string,i.to_string());}
                }
            }
        }
        stop2 = false;
    }
    parameters_list
}

fn is_function(input:&String) -> bool {
    let mut output = false;
    if read_between_chars(input,'(',')') == "" {
        output = true;
    }
    output
}

fn execute_instruction(instruction:&String, parameters:&Vec<String>) -> String {
    let mut output = String::new();
    let mut instructions_list = Vec::new();
    instructions_list.push(String::from("character-decoder()"));
    instructions_list.push(String::from("decode-from-web-input()"));
    instructions_list.push(String::from("getObjTriangles()"));
    instructions_list.push(String::from("getObjTriangles2D()"));
    instructions_list.push(String::from("getObjVertices()"));
    instructions_list.push(String::from("getObjVertices2D()"));
    instructions_list.push(String::from("getObjIndices()"));
    instructions_list.push(String::from("getObjModel()"));
    if instruction == &instructions_list[0] {decoder::decode_txt_file(&parameters[0],&parameters[1]);}
    if instruction == &instructions_list[1] {decoder::decode_string_input(&parameters[0],&parameters[1]);}
    if instruction == &instructions_list[2] {let triangles = obj::getObjTriangles(&parameters[0], false); let trianglesLen = format!("{:?}", triangles).len(); output = format!("\nContent-Length:{}\n\n{:?}", trianglesLen, triangles); }
    if instruction == &instructions_list[3] {let triangles = obj::getObjTriangles(&parameters[0], true); let trianglesLen = format!("{:?}", triangles).len(); output = format!("\nContent-Length:{}\n\n{:?}", trianglesLen, triangles); }
    if instruction == &instructions_list[4] {let mut file = File::open(&parameters[0]).unwrap();let mut obj = String::new();file.read_to_string(&mut obj);let vertices = obj::getObjVertices(&obj); let verticesLen = format!("{:?}", vertices).len(); output = format!("\nContent-Length:{}\n\n{:?}", verticesLen, vertices); }
    if instruction == &instructions_list[5] {let mut file = File::open(&parameters[0]).unwrap();let mut obj = String::new();file.read_to_string(&mut obj);let vertices = obj::getObjVertices2D(&obj); let verticesLen = format!("{:?}", vertices).len(); output = format!("\nContent-Length:{}\n\n{:?}", verticesLen, vertices);  }
    if instruction == &instructions_list[6] {let mut file = File::open(&parameters[0]).unwrap();let mut obj = String::new();file.read_to_string(&mut obj);let indices = obj::getObjF(&obj); let indicesLen = format!("{:?}", indices).len(); output = format!("\nContent-Length:{}\n\n{:?}", indicesLen, indices); }
    if instruction == &instructions_list[7] {let model = obj::getObjModel(&parameters[0]); let modelLen = format!("{:?}", model).len(); output = format!("\nContent-Length:{}\n\n{:?}", modelLen, model); }

    output
}

fn execute_php(file: &String) -> String {
    let mut output = String::new();
    let mut aux_line = String::new();
    let mut contador = 0;
    let (tx, rx) = mpsc::channel();
    let mut test = Command::new("C:/xampp/php/php").arg("-f").arg(file).stdout(Stdio::piped()).spawn().unwrap();
    let mut test_output = test.stdout.take().unwrap();
    let mut pre_output = BufReader::new(test_output);

    for line in pre_output.lines() {
        contador = contador+1;
        let tx_clone = tx.clone();
        match line {
            Ok(output) => {tx_clone.send(output+&"\n".to_string());},
            Err(_) => {}
        }
    }
    for line in 0..contador {
        aux_line = rx.recv().unwrap();
        output += &aux_line;
    }

    output
}

pub fn handle_request(s1:&String) -> Vec<u8> {
    let mut parameters = Vec::new();
    let mut function_a = String::new();
    let mut file_directory = String::new();
    let mut file_content: Vec<u8> = Vec::new();
    let mut response: Vec<u8> = Vec::new();
    let mut requested_file: File;
    let line = split_string(s1,'\n')[0].to_string();
    if is_function(&line) == true {
        parameters = especial_split_string(&get_body_request_line(s1),',');
        function_a = read_between_chars(&line,'/',' ');
        let output = execute_instruction(&function_a,&parameters);
        response = format!("HTTP/1.1 200 OK{output}").into_bytes();
    }
    else {
        file_directory = read_between_chars(&line,'/',' ');
        if file_directory == "" {
            File::open("../../www/RinWorld.html").unwrap().read_to_end(&mut file_content);
            //file_content = execute_php(&"www/RinWorld.html".to_string());
        }else {
            File::open("../../www/".to_owned()+&file_directory).unwrap().read_to_end(&mut file_content);
            //file_content = execute_php(&("www/".to_string()+&file_directory));
        }
        response = format!("HTTP/1.1 200 OK\nContent-Length:{}\n\n",file_content.len()).into_bytes();
        response.extend(file_content);
    }
    response
}
