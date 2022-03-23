let foto = document.getElementById("imgFoto");
let arquivo = document.getElementById("flImage");
        
arquivo.addEventListener("change", (e) =>{
    let leitor = new FileReader();
    leitor.onload = () =>{
        foto.src = leitor.result;
    }
    leitor.readAsDataURL(arquivo.files[0]);
})