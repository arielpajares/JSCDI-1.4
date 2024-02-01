use std::io::{self,Write,Read};
use std::fs::File;
mod lib;
use lib::decoder;

fn main() {
    let input_file = String::from("encoded-input.txt");
    let output_file = String::from("decoded-input.js");
    decoder::decode_txt_file(input_file,output_file);
}
