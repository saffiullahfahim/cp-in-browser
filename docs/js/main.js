ace.config.setModuleUrl("ace/theme/xcode", "./js/theme-xcode.js");
ace.config.setModuleUrl("ace/mode/c_cpp", "./js/mode-c_cpp.js");
ace.config.setModuleUrl("ace/snippets/c_cpp", "./js/snippets.js");

let editor = ace.edit("editor-container");
editor.session.setMode("ace/mode/c_cpp");
editor.setTheme("ace/theme/xcode");
editor.session.setTabSize(2);
editor.setOptions({
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true,
});

function undo(){
  editor.undo();
}

function redo(){
  editor.redo();
}

function changeCursor(type){
  let position = editor.getCursorPosition();
  if(type=="next") ++position.column;
  else --position.column;
  editor.clearSelection();
  editor.moveCursorToPosition(position);
  let position2 = editor.getCursorPosition();
  if(type=="next"){
    --position.column;
    ++position.row;
  }
  else {
    ++position.column;
    --position.row;
  }
  if(position.column == position2.column){
    position.column = 0;
    if(type!= 'next') position.column = Infinity;
    editor.moveCursorToPosition(position);
    //editor.clearSelection();
  }
  editor.focus();
}

let input = ace.edit("input-container");
input.session.setMode("ace/mode/c_cpp");
//input.setTheme("ace/theme/xcode");
input.session.setTabSize(2);
//input.setReadOnly(true)

let output = ace.edit("output-container");
output.session.setMode("ace/mode/c_cpp");
output.setTheme("ace/theme/xcode");
output.session.setTabSize(2);
output.setReadOnly(true);

let menuBtnStatus = true;
function OpenMenu(){
  if(menuBtnStatus){
    menuDiv.style.display = "block";
    menu.style.left = "0";
    menuBtnStatus = false;
  }
  else{
    menuDiv.style.display = "none";
    menu.style.left = "";
    menuBtnStatus = true;
  }
}

function changeType(value){
  clearElementAll();
  document.getElementById("problem-div").style.display = "none";
  
  if(value != "saveByName"){
    document.getElementById("run-btn").style.display = "none";
  } else{
    document.getElementById("run-btn").style.display = "inline";
  }
  if(value == "saveBySource"){
    document.getElementById("source-div").style.display = "flex";
  }
  else{
    document.getElementById("source-div").style.display = "none";
  }
}

function closeSetting(){
  document.getElementById("setting-div2").style.transform = "scale(0)";
  setTimeout(function(){document.getElementById("setting-div").style.display = "none";}, 300)
}

function openSetting(){
  let url = "./js/setting.json";
  fetch(url).then(res => res.text())
  .then(text => {
    let setting = JSON.parse(text);
    for(let x in setting){
      document.getElementById(x).value = setting[x];
    }
    document.getElementById("setting-div").style.display = "flex";
    setTimeout(function(){document.getElementById("setting-div2").style.transform = 'scale(1)';}, 300);
  })
  .catch(err => {console.log(err)})
}

function setSetting(){
  let btn = document.getElementById("setting-btn");
  let fontSize = document.getElementById("font-size");
  let templete = document.getElementById("templete");
  let languageType = document.getElementById("language-type");
  let freeze = document.getElementById("freeze");
  freeze.style.display = "flex";
  btn.innerText = "saving...";
  
  let setting = {
    "font-size": fontSize.value,
    "templete": templete.value,
    "language-type": languageType.value
  };
  
  let form = new FormData();
  form.append("data", JSON.stringify(setting));
  form.append("path", "../js/setting.json");
  fetch("./php/content.php",{
      method: "POST",
      mode: "no-cors",
      body: form,
      header: {
        "Content-Type": "application/json"
      }
  }).then(res => res.text())
  .then(text => {
    console.log(text);
    if(text == "success"){
      btn.innerText = "Save";
      document.getElementById("editor-container").style.fontSize = fontSize.value + "px";
      document.getElementById("output-container").style.fontSize = fontSize.value + "px";
      document.getElementById("input-container").style.fontSize = fontSize.value + "px";
      freeze.style.display = "none";
      closeSetting();
    }
  })
  .catch(err => console.log(err))
}

function showFiles(){
  document.getElementById("menu").innerHTML = "";
  
  let form = new FormData();
  form.append("path", "/sdcard/cp-in-browser");
  
  let url = "./php/file-list.php";
  fetch(url,{
        method: "POST",
        mode: "no-cors",
        header:{
        'Content-Type': 'application/json'
        },
        body:  form
  })
  .then(res => res.text())
  .then(text => {
      let files = JSON.parse(text);
      files.sort((a, b) => {
        //console.log (a, b)
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a > b) return 1;
        else if (a < b ) return -1;
        else return 0;
      });
      let header = document.createElement("div");
      header.setAttribute("class", "header");
      header.innerHTML = "Files List";
      document.getElementById("menu").appendChild(header);

      let div = document.createElement("div");
      div.setAttribute("class", "files-list");

      for(let i = 0; i < files.length; i++){
        let file = document.createElement("div");
        file.setAttribute("class", "menu-item");
        file.setAttribute("ondblclick", "openFile(this)");
        file.setAttribute("path", files[i]);
        let pre = document.createElement("pre");
        pre.setAttribute("class", "files");
        pre.innerText = files[i].replace("/sdcard/cp-in-browser/","");
        if(pre.innerText == document.getElementById("file-name").value){
          file.setAttribute("id", "active");
        }
        file.appendChild(pre);
        div.appendChild(file);
      }
      document.getElementById("menu").appendChild(div);
      if (document.getElementById("active")){
        document.getElementById("active").scrollIntoView();
      }
  })
  .catch(err => {console.log(err)});
}

function openFile(div){
  clearElementAll();
  if(document.getElementById("active")){
    document.getElementById("active").removeAttribute("id");
  }
  let path = div.getAttribute("path");
  div.setAttribute("id", "active");

  fetch("./php/content.php?path=" + path).then(res => res.text())
  .then(text => {
    document.getElementById("file-name").value = getFileNameWithExtention(div.innerText).fileFullName;
    let startCode = text.indexOf("*/");
    document.getElementById("discrebtion").value = text.substr(4).slice(0, startCode - 6);
    editor.session.setValue(text.substr(startCode + 4));
    OpenMenu();
  }).catch(err => console.log(err))
}

function getFileNameWithExtention(fileName){
  let data = {};
  if(fileName.substr(-2).toLowerCase() == ".c"){
    data.fileFullName = fileName.slice(0, -2) + fileName.substr(-2).toLowerCase();
    data.fileName = fileName.slice(0, -2);
    data.extention = fileName.substr(-2).toLowerCase();
  }
  else if(fileName.substr(-4).toLowerCase() == ".cpp"){
    data.fileFullName = fileName.slice(0, -4) + fileName.substr(-4).toLowerCase();
    data.fileName = fileName.slice(0, -4);
    data.extention = fileName.substr(-4).toLowerCase();
  }
  else{
    data.fileFullName = fileName + document.getElementById("language-type").value;
    data.fileName = fileName;
    data.extention = document.getElementById("language-type").value;
  }
  return data;
}

const saveFunction = {
  saveByName: function(){
    let fileName = document.getElementById("file-name");
    let fileError = document.getElementById("file-error");
    let path = "/sdcard/cp-in-browser/" + getFileNameWithExtention(fileName.value).fileFullName;
    fetch("./php/content.php?path=" + path).then(res => res.text())
    .then(text => {
       if(!text){
         let form = new FormData();
         let data = `/*
${document.getElementById("discrebtion").value}
*/
${editor.session.getValue()}`;
         form.append("data", data);
         form.append("path", path);
         fetch("./php/content.php",{
            method: "POST",
            mode: "no-cors",
            body: form,
            header: {
              "Content-Type": "application/json"
            }
         }).then(res => res.text())
         .then(text => {
           if(text == "success"){
              setTimeout(function (){document.getElementById("freeze").style.display = "none";}, 350)
              fileName.disabled = false;
              fileError.innerText = "";
              if(document.getElementById("active")){
                document.getElementById("active").removeAttribute("id");
              }
              fileName.value = getFileNameWithExtention(fileName.value).fileFullName;
              showFiles();
           }
         }).catch(err => console.log(err))
       }
       else{
         setTimeout(function (){document.getElementById("freeze").style.display = "none";}, 350);
         fileName.disabled = false;
         fileError.innerText = "File already exist!";
       }
    }).catch(err => console.log(err))
  },
  saveByLink: function(){
    let fileName = document.getElementById("file-name");
    let fileError = document.getElementById("file-error");

    if(getCF(fileName.value)){
      fileName.value = "CF-" + getCF(fileName.value).contest + getCF(fileName.value).problem;
      let form = new FormData();
      form.append("problem", getCF(fileName.value).problem);
      form.append("contest", getCF(fileName.value).contest);
      fetch("./php/cf-content.php",{
        method: "POST",
        mode: "no-cors",
        body: form,
        header: {
          "Content-Type": "application/json"
        }
      }).then(res => res.text())
      .then(text => {
        let getProblem = text.indexOf('<div class="problem-statement">');
        if(getProblem > -1){
          text = text.substr(getProblem);
          text = text.slice(0, text.indexOf("<script>"));
          
          let form = new FormData();
          form.append("data", text);
          form.append("path", "../problems/" + fileName.value);
          fetch("./php/content.php",{
	          method: "POST",
	          mode: "no-cors",
	          body: form,
	          header: {
	          	"Content-Type": "application/json"
	          }
          }).then(res => res.text())
          .then(text => console.log(text)).catch(err => console.log(err))
          document.getElementById("problem-div").style.display = "flex";
          document.getElementById("problem-code").innerText = fileName.value;
          document.getElementById("problem").innerHTML = text;
          //MathJax
          MathJax = {
	          options: {enableMenu: false,},
	          tex: {inlineMath: [['$$$','$$$']], displayMath: [['$$$$$$','$$$$$$']]},
	          svg: {fontCache: 'global'}
          };
          let js = document.createElement('script')
          js.src = "./js/tex-svg-full.js"
          document.getElementById("problem").appendChild(js)
          fileName.disabled = false;
          document.getElementById("cpp-type").value = "saveByName";
          document.getElementById("run-btn").style.display = 'inline';
          setTimeout(function (){document.getElementById("freeze").style.display = 'none';}, 350);
          
        }
        else{
	        fileError.innerText = "Invalid input detected!";
	        fileName.disabled = false;
	        setTimeout(function (){document.getElementById("freeze").style.display = 'none';}, 350);
        }
      }).catch(err => console.log (err))
    }
    else{
      fileError.innerText = "Invalid input detected!";
      fileName.disabled = false;
      setTimeout(function (){document.getElementById("freeze").style.display = 'none';}, 350);
    }
  },
  saveBySource: function(){
      let text = document.getElementById("source").value;
      let fileName = document.getElementById("file-name");
      let fileError = document.getElementById("file-error");
      let sourceError = document.getElementById("source-error");
      sourceError.innerText = "";
      fileError.innerText = "";
      let getProblem = text.indexOf('<div class="problem-statement">');
      if(fileName.value == ""){
        fileError.innerText = "Input Field required!";
        fileName.focus();
      }
      if(getProblem > -1 && fileName.value != ""){
	      text = text.substr(getProblem);
	      text = text.slice(0, text.indexOf("<script>"));
	      
	      document.getElementById("problem-div").style.display = "flex";
	      document.getElementById("problem-code").innerText = fileName.value;
	      document.getElementById("problem").innerHTML = text;
	      //MathJax
	      MathJax = {
	      options: {enableMenu: false,},
	      tex: {inlineMath: [['$$$','$$$']], displayMath: [['$$$$$$','$$$$$$']]},
	      svg: {fontCache: 'global'}
	      };
	      let js = document.createElement('script')
	      js.src = "./js/tex-svg-full.js"
	      document.getElementById("problem").appendChild(js)
	      fileName.disabled = false;
	      document.getElementById("cpp-type").value = "saveByName";
	      document.getElementById("run-btn").style.display = 'inline';
	      setTimeout(function (){document.getElementById("freeze").style.display = 'none';}, 350);
      }
      else{
      	sourceError.innerText = "Invalid input detected!";
      	fileName.disabled = false;
      	setTimeout(function (){document.getElementById("freeze").style.display = 'none';}, 350);
      }
   }
}

function saveFile(e){
  let fileName = document.getElementById("file-name");
  let fileError = document.getElementById("file-error");

  fileError.innerText = "";

  if(e.keyCode == 13){
    if(fileName.value == ''){
      fileError.innerText = "This input field required!";
      fileName.focus();
    }
    else{
      fileName.disabled = true;
      //document.getElementById("cpp-type").disabled = true;
      document.getElementById("freeze").style.display = "flex";
      saveFunction[document.getElementById("cpp-type").value]();
    }
  }
}

function generate(){
	saveFunction[document.getElementById("cpp-type").value]();
}

function clearElementAll(){
  document.getElementById("file-name").value = "";
  document.getElementById("file-error").innerText = "";
  document.getElementById("discrebtion").value = "";
  document.getElementById("source").value = "";
  input.session.setValue('');
  output.session.setValue('');
  editor.session.setValue(document.getElementById("templete").value);
  document.getElementById("output-div").style.display = "none";
  document.getElementById("compiling").style.display = "none";
}

function compiled(){
    document.getElementById("file-name").value = getFileNameWithExtention(document.getElementById("file-name").value).fileFullName;
    let form = new FormData();
    let data = `/*
${document.getElementById("discrebtion").value}
*/
${editor.session.getValue()}`;
    form.append("data", data);
    form.append("path", document.getElementById("active").getAttribute("path"));
    form.append("source", editor.session.getValue());
    form.append("input", input.session.getValue());
    form.append("language", getFileNameWithExtention(document.getElementById("file-name").value).extention);
    
    let controller = new AbortController();
    let signal = controller.signal;

    fetch("./php/compiled.php",{
      method: "POST",
      signal: signal,
      mode: "no-cors",
      body: form,
      header: {
        "Content-Type": "application/json"
      }
    }).then(res => res.text())
    .then(text => {
       text = text.replace(/\n/g, '\\n').replace(/\t/g,'\\t');
       console.log(text);
       document.getElementById("freeze").style.display = "none";
       document.getElementById("stop-btn").style.display = "none"; 
       document.getElementById("run-btn").innerText = "Run";
       
       setTimeout(function() {
       let data = JSON.parse(text);
       if(data.status == 200){
         output.session.setValue(data.output);
         document.getElementById("output-div").style.display = "flex";
       }
       else {
         let compiling = document.getElementById("compiling");
         compiling.innerHTML = "<pre>" + data.output + "</pre>";
         compiling.style.display = "block";
       }
       }, 50);
    }).catch(err => console.log(err));
    
    document.getElementById("stop-btn").onclick = () => {
      controller.abort();
      document.getElementById("stop-btn").style.display = "none";
      document.getElementById("run-btn").innerText = "Run";
      document.getElementById("freeze").style.display = "none";
    }
  };

function getCF(value){
  value = value.toLowerCase();
  let replace = ["https://", "http://", "/problem/", "codeforces.com/", "contest", "problemset", "/", "cf-", ".cpp"];
  replace.forEach((val) => {
    value = value.replace(val, "");
  })

  let CF = {};
  if(value.substr(-1) >= 'a' && value.substr(-1) <= 'z'){
     CF.problem = value.substr(-1).toUpperCase();
     if (Number(value.slice(0, -1))){
       CF.contest = value.slice(0, -1);
       return CF;
     }
     else return 0;
  }
  else return 0;
}

function run(btn){
  let fileName = document.getElementById("file-name");
  let fileError = document.getElementById("file-error");
  document.getElementById("output-div").style.display = "none";
  document.getElementById("compiling").style.display = "none";
  fileError.innerText = "";
  if(fileName.value == ''){
    fileError.innerText = "This input field required!";
    fileName.focus();
  }
  else{
    //fileName.disabled = true;
    document.getElementById("freeze").style.display = "flex";

    //document.getElementById("cpp-type").disabled = true;
    if(document.getElementById("cpp-type").value != "saveByName"){
      saveFunction[document.getElementById("cpp-type").value]();
      fileError.innerText = "";
    }
    compiled();
    btn.innerText = "running...";
    document.getElementById("stop-btn").style.display = "inline";

  }  
}

showFiles();
fetch("./js/setting.json").then(res => res.text())
.then(text => {
  let fontSize = JSON.parse(text)["font-size"];
  document.getElementById("editor-container").style.fontSize = fontSize + "px";
  document.getElementById("editor-container").style.fontSize = fontSize + "px";
  document.getElementById("editor-container").style.fontSize = fontSize + "px";
  editor.session.setValue(JSON.parse(text)["templete"]);
  
  let setting = JSON.parse(text);
  for(let x in setting){
    document.getElementById(x).value = setting[x];
  }
}).catch(err => console.log(err));


function codeCopy(){
   let str = editor.getValue();
   let el = document.createElement('textarea');
   el.value = str;
   document.body.appendChild(el);
   el.select();
   document.execCommand('copy');
   document.body.removeChild(el);
   document.execCommand('copy')
   alert("Code Copied");
}