const ProdutosImage = require('ssh2-sftp-client')

//caminho de onde o arquivo vai ser enviado
const localFile = 'C:\\Users\\Dalila\\Desktop\\Dev Web Full Stack - SoulCode Academy\\nodeJS\\profTati\\javascript\\projetoHandle\\public\\img\\pera.jpg'

//caminho para onde o arquivo vai ser enviado - são as pastas dentro do servidor
const localRemoto = 'C:/Users/Dalila/Desktop/Dev Web Full Stack - SoulCode Academy/nodeJS/profTati/javascript/projetoLoja/uploads/pera.jpg'

const produtosImage = new ProdutosImage()

function run(){
    produtosImage.connect({
        host: '000.000..00',
        port: '00',
        username:'',
        password: ''
    }).then(() => {
        //se foi feita a conexão - o arquivo é enviado através da função fatPut
        //na hora de trazer o arquivo do servidor para dentro da aplicação, usa-se a função
        produtosImage.fastPut(localFile, localRemoto)
    }).then(() => {
        console.log('upload realizado com sucesso')
    }).catch(erro => {
        console.log(erro, "Ocorreu algum erro")
    })
}

run()
module.exports = produtosImage
