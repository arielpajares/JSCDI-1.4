use std::io::{self,Write,Read};
use std::fs::File;
mod lib;
use lib::decoder;

fn main() {
let mut fil = File::open("gi.txt").unwrap();
let mut cont = String::new();
fil.read_to_string(&mut cont).unwrap();

let canva_handler = decoder::Canvas {width:"800".to_string(),height:"600".to_string()};
canva_handler.generate_js_file(&"xor.js",&cont);
}
