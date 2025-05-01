use std::net::{TcpListener, TcpStream};
use std::thread;
use std::io::Read;
use std::io::Write;
use std::io;
use std::str;
use std::env;
use std::process;
use std::fs::File;
mod lib;
use lib::{request_handler, decoder, obj};

fn client_requestes(mut request: TcpStream){
println!("Conexion establecida!!!\nEscuchando al cliente...");
let mut request_content = String::new();
let mut reader = [0;1024];
let mut response = Vec::<u8>::new();

let bytes = match request.read(&mut reader) {Ok(x) => x,Err(d) => 0};
if bytes != 0 {
    request_content = str::from_utf8(&reader).unwrap().to_string();
    println!("Client's Request: {request_content}");
    response = request_handler::handle_request(&request_content);
    }
request.write_all(response.as_slice());
let mut reader = [0;1024];
    
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if &args[1] == &"--help" {
        println!("  | | | | JSCDI-1.5 | | | |   \n\nwebserver \"IP_ADDRESS\" \"PORT\"\n\nExample: webserver 127.0.0.1 80");
        process::exit(0);
    }

    let addr_input = String::from(args[1].clone()+&":"+&args[2]);
    let mut listener = TcpListener::bind(&addr_input.trim()).unwrap();

    for client_request in listener.incoming() {
        match client_request {
            Ok(request) => {thread::spawn(move || {client_requestes(request);});},
            Err(_) => {println!("Could not connect to client");}
        }
    }
}
