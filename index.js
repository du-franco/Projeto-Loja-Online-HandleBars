const express = require('express')
const handle = require('express-handlebars')
const client = require('./conexao')

const LocalStorage = require('node-localstorage').LocalStorage
localStorage = new LocalStorage('./scratch')

//para conseguirmos ler uma propriedade do tipo objectId, precisamos fazer essa importação.
const ObjectId = require('mongodb').ObjectId

const app = express()

const porta = 3000

const dbo = client.db('lojaOnline')

const hbs = handle.create({
    partialsDir: ('views/partials/')
})
//dizer para o express que o motor de renderização da página html vai ser o handlebars, através da vairável hbs
app.engine('handlebars', hbs.engine)
//estamos setando o nosso view engine com o motor de rederização handle bars
app.set('view engine', 'handlebars')

//o tráfego de dados pode ser por string
app.use(express.urlencoded())

//o tráfego de daados pode ser por objetos json
app.use(express.json())

//os nossos arquivos estáticos estão na página public
app.use(express.static(__dirname + '/public'))

app.get('/cadastro', (req, res) => {
    res.render('cadastroProduto')
})

app.post('/add', (req, res) => {
    const obj = {
        nome: req.body.nome,
        valor: req.body.valor,
        foto: req.body.flImage,
    }
    dbo.collection('produtos').insertOne(obj, (erro, resultado) => {
        if (erro) throw erro
        console.log('Um produto inserido')
        res.redirect("/produtos")
    })
})

app.get('/produtos', (req, res) => {
    dbo.collection('produtos').find({}).toArray((erro, resultado) => {
        if (erro) throw erro
        res.render('listaProdutos', { resultado })
    })
})

app.get('/deletarProduto/:id', (req, res) => {
    let idProduto = req.params.id
    let obj_id = new ObjectId(idProduto)

    dbo.collection('produtos').deleteOne({ _id: obj_id }, (erro, resultado) => {
        if (erro) throw erro
        console.log(resultado.deletedCount)
        res.redirect('/produtos')
    })

})

app.get('/cards', (req, res) => {
    dbo.collection('produtos').find({}).toArray((erro, resultado) => {
        if (erro) throw erro
        const usuarioLogado = localStorage.getItem("perfilLogado")
        console.log(usuarioLogado)
        res.render('listaCards', { resultado })

    })
})

//rota para inserir produtos no carrinho, os atributos são passados pela url através dos parâmetros (/:)
// 

app.get('/inserirCarrinho/:id', (req, res) => {
    const idProduto = req.params.id

    const obj_id = new ObjectId(idProduto)

    const usuarioLogado = localStorage.getItem("perfilLogado")

    dbo.collection('clientes').findOne({ login: usuarioLogado }, (erro2, usuario) => {
        if (erro2) throw erro2

        dbo.collection('produtos').findOne({ _id: obj_id }, (erro, resultado) => {
            if (erro) throw erro
            const obj = {
                quantidade: 1,
                produto:{
                    idProduto: req.params.id,
                    nome: resultado.nome,
                    valor: resultado.valor,
                    foto: resultado.foto},
                 cliente:{idCliente: usuario._id,
                         nomeCliente: usuario.nome,
                         enderecoCliente: usuario.endereco}
                
                    
            }
            dbo.collection('carrinho').insertOne(obj, (erro, resultado) => {
                if (erro) throw erro
                console.log("Um produto inserido no carrinho")
                res.redirect('/listaCarrinho')
            })
        })


    })
})

app.get('/listaCarrinho', (req, res) => {
    dbo.collection('carrinho').find({}).toArray((erro, resultado) => {
        if (erro) throw erro


        const carrinho = resultado.map(function (e) {
            return {
                idItem: e._id,
                quant: e.quantidade,
                nome: e.produto.nome,
                valorUnit: e.produto.valor,
                foto: e.produto.foto,
                valorTotal: e.quantidade * e.produto.valor
            }
        })
        const totalCompra = carrinho.reduce((soma, x) =>
            soma + x.valorTotal, 0
        )
        res.render('listaCarrinho', { carrinho, totalCompra })
    })
})

app.get('/deleteItemCarrinho/:id', (req, res) => {
    const idItem = req.params.id
    const obj_id = new ObjectId(idItem)

    dbo.collection('carrinho').deleteOne({ _id: obj_id }, (erro, resultado) => {
        if (erro) throw erro
        res.redirect('/listaCarrinho')
    })
})

app.get('/cadCliente', (req, res) => {
    res.render('cadastroCliente')
})

app.post('/cliente', (req, res) => {
    const obj = {
        nome: req.body.nomeCliente,
        endereco: req.body.enderecoCliente,
        login: req.body.loginCliente,
        senha: req.body.senhaCliente,
    }
    dbo.collection('clientes').insertOne(obj, (erro, resultado) => {
        if (erro) throw erro
        console.log('Cliente cadastrado com sucesso')
        res.redirect("/cards")
    })
})

app.get('/clientes', (req, res) => {
    dbo.collection('clientes').find({}).toArray((erro, resultado) => {
        if (erro) throw erro
        res.render('listaClientes', { resultado })
    })
})

app.get('/deletarCliente/:id', (req, res) => {
    let idCliente = req.params.id
    let obj_id = new ObjectId(idCliente)

    dbo.collection('clientes').deleteOne({ _id: obj_id }, (erro, resultado) => {
        if (erro) throw erro
        console.log(resultado.deletedCount)
        res.redirect('/clientes')
    })

})

app.get('/loginUsuario', (req, res) => {
    res.render('login')
})

app.post('/verificaLogin', (req, res) => {
    //verificar se o cliente (ou usuário) está cadastrado no db da aplicação (collection clientes)
    const loginCliente = req.body.usuario
    const senhaCliente = req.body.senha
    dbo.collection('clientes').findOne({ login: loginCliente }, (erro, resultado) => {
        if (erro) throw erro
        if (resultado == null) {
            res.send("Usuário não encontrado")
        // }
        // else if (resultado.login == loginCliente && resultado.senha == senhaCliente) {

        } else if (resultado.login == loginCliente) {
            localStorage.setItem("perfilLogado", loginCliente)
            res.redirect('/cards')
        } else {
            res.send("Senha Incorreta")
        }
    })
})

app.listen(porta, () => {
    console.log('Servidor está rodando')
})