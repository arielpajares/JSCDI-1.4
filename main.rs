use std::io::{self,Write,Read};
use std::fs::File;

struct Canvas {
width: u64,
height: u64
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




fn main() {
let mut fil = File::open("gi.txt").unwrap();
let mut cont = String::new();
fil.read_to_string(&mut cont).unwrap();

let canvas_handler = Canvas {width:4,height:3};
let mut js_var = String::from("screen=[");
let mut final_cont = canvas_handler.file_to_string(&cont);
js_var = js_var+&final_cont+&"];".to_string();

let mut filo = File::create("xor.js").unwrap();
filo.write(js_var.as_bytes()).unwrap();
}
