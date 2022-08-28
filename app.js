const env = require('dotenv').config().parsed;
const path = require('path')
const express = require('express');
const app = express()
app.use(express.json())

//Origem do arquivo json de teste: <script src="https://gist.github.com/marcosbrasil/7032532.js"></script>
//Origem dos dados usados para formar o json do crawler: https://www.monolitonimbus.com.br/mapa-com-aeroportos-e-siglas-icaoiata/

let aeroportos_raw = require(path.resolve('entrada_dados','aeroportos_scrape.json'))

//Regex para siglas genéricas
const from  = /[A-z]{3}/
const to  = /[A-z]{3}/


//Middleware de consulta no objeto JSON
function consultaAeroportos(req,res,next){
    const {from,to} = req.params;
    let locais = {
        "aeroporto_origem": "aeroporto_origem",
        "cidade_origem" : "cidade_origem",
        "aeroporto_destino": "aeroporto_destino",
        "cidade_destino" : "cidade_destino"
    };
    aeroportos_raw.forEach((aeroporto) => {
        if(from == aeroporto.IATA){
            locais.aeroporto_origem = aeroporto.Aeroporto;
            locais.cidade_origem = aeroporto.Cidade;
        }
        else if(to == aeroporto.IATA){
            locais.aeroporto_destino = aeroporto.Aeroporto;
            locais.cidade_destino = aeroporto.Cidade;
        }
    })
    req.locais = locais;
    next()
}

//Rota de chamada do voo
app.get('/flight/:from/:to',consultaAeroportos,
    (req,res)=>{
        const {from,to} = req.params;
        res.json({
            "origem": `${from}`,
            "destino": `${to}`,
            "descricao": `Voo partindo de ${req.locais.aeroporto_origem} (${req.locais.cidade_origem}) até ${req.locais.aeroporto_destino} (${req.locais.cidade_destino})`
        })
})


app.listen(env.PORT, console.log(`Server running at ${env.PORT}`))