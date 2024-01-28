use std::net::{TcpListener, TcpStream};
use std::thread;
use std::io::Read;
use std::io::Write;
use std::io;
use std::str;
use std::fs::File;

fn send_requested_file_data(input_content: &String) -> String {
let mut slash_encountered = false;
let mut stop_searching = false;
let mut content_slice = String::new();
let mut output_file:File;
let mut output_content = String::new();
for i in input_content.chars() {
    if i == '/' || slash_encountered == true {
        if i != ' ' && stop_searching != true {
            content_slice = format!("{}{}",content_slice,i.to_string());
            slash_encountered = true;
        }
        else {
            if slash_encountered == true && i == ' ' {stop_searching=true;}
    }
}
}
let mut edited_slice = String::new();
for i in content_slice.chars() {
    if i != '/' {
        edited_slice = format!("{edited_slice}{}",i.to_string());
    }
}
content_slice = edited_slice;

if content_slice == "" {
    output_file = File::open("RinWorld.html").unwrap();
} else {
    let content_directory = format!("{}",content_slice);
    output_file = File::open(content_directory).unwrap();
}
output_file.read_to_string(&mut output_content).unwrap();
format!("HTTP/1.1 200 OK\nContent-Length:{}\n\n{}",output_content.len(),output_content)
}

fn client_requestes(mut request: TcpStream){
println!("Conexion establecida!!!\nEscuchando al cliente...");
let mut request_content = String::new();
let mut reader = [0;1024];
let mut response = String::new();

let bytes = match request.read(&mut reader) {Ok(x) => x,Err(d) => 0};
if bytes != 0 {
    request_content = str::from_utf8(&reader).unwrap().to_string();
    println!("Client's Request: {request_content}");
    }
response = send_requested_file_data(&request_content);
request.write(response.as_bytes());
let mut reader = [0;1024];
    
}

fn main() {
    let mut addr_input = String::new();
    println!("Primero que todo, ingrese su direccion de ipv4 y el puerto en el que va a iniciar el servidor\nEjemplo: 127.0.0.1:8080\nAhora ingresa tu:");
    io::stdin().read_line(&mut addr_input).unwrap();
    let mut listener = TcpListener::bind(&addr_input.trim()).unwrap();

    for client_request in listener.incoming() {
        match client_request {
            Ok(request) => {thread::spawn(move || {client_requestes(request);});},
            Err(_) => {println!("Could not connect to client");}
        }
    }
}