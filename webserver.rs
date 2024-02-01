use std::net::{TcpListener, TcpStream};
use std::thread;
use std::io::Read;
use std::io::Write;
use std::io;
use std::str;
use std::fs::File;
mod lib;
use lib::request_handler;
use lib::decoder;

fn client_requestes(mut request: TcpStream){
println!("Conexion establecida!!!\nEscuchando al cliente...");
let mut request_content = String::new();
let mut reader = [0;1024];
let mut response = String::new();

let bytes = match request.read(&mut reader) {Ok(x) => x,Err(d) => 0};
if bytes != 0 {
    request_content = str::from_utf8(&reader).unwrap().to_string();
    println!("Client's Request: {request_content}");
    response = request_handler::handle_request(&request_content);
    }
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