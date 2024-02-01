use std::io::{self,Write,Read};
use std::fs::File;

pub struct Canvas {
pub width: String,
pub height: String
}

impl Canvas {
fn file_to_string(self,cont: &str) -> String {
let mut i1: u64 = 0;
let mut i2:u64 =0;
let mut final_cont = String::new();
let mut s1 = String::new();

for i in cont.chars() {

if i == ',' {
i1 = i1+1;
match i1 {
1 => final_cont = final_cont+&String::from("[".to_string()+&s1+&",".to_string()),
8 => {final_cont = final_cont+&String::from(s1+&"],".to_string());i2 = i2+1;},
9 => {final_cont = final_cont+&String::from("[".to_string()+&s1+&",".to_string());i1=1;},
_ => final_cont = final_cont+&String::from(s1+&",".to_string())
}
s1 = String::from("");
    }
else {
s1 = s1+&String::from(i);
    }
}
final_cont = final_cont+&String::from(subtract_char("\n",&s1)+&String::from("],"));

final_cont
    }

pub fn generate_js_file(self,name:&String,cont:&String){
let dimensions = String::from("];width=".to_string()+&self.width+&";height=".to_string()+&self.height+&";".to_string());
let final_cont = self.file_to_string(&cont);
let js_var = "screen=[".to_string()+&final_cont+&dimensions;

let mut filo = File::create(name).unwrap();
filo.write(js_var.as_bytes()).unwrap();
    }
}

fn subtract_char(x:&str,y:&str) -> String{
let mut z = String::new();
for i in y.chars() {
if i.to_string() != x {
z = z+&String::from(i);
        }
    }
z
}

pub fn decode_txt_file(input_file:&String,output_file:&String){
let mut fil = File::open(input_file).unwrap();
let mut cont = String::new();
fil.read_to_string(&mut cont).unwrap();

let canva_handler = Canvas {width:"800".to_string(),height:"600".to_string()};
canva_handler.generate_js_file(output_file,&cont);
}

pub fn decode_string_input(input:&String,output_file:&String){
    let canva_handler = Canvas {width:"800".to_string(),height:"600".to_string()};
    canva_handler.generate_js_file(output_file,input);
}
