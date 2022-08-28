const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio');
const { response } = require('express');
const filesystem = require('fs');
const env = require('dotenv').config().parsed;
const app = express()

const url = 'https://www.monolitonimbus.com.br/mapa-com-aeroportos-e-siglas-icaoiata/';

function dividirArray(array, tamanho){
    var array_final = [];
    
    while (array.length) {
        array_final.push(array.splice(0, tamanho));
    }
    
    return array_final;
}


axios(url)
    .then(response => {
        //Lidando com a entrada de dados
        const html = response.data
        let aeroportos_codes = []
        const $ = cheerio.load(html)

        //Tomando as tags da table (tbody) e adicionando em um conjunto
        let check = true;
        let i = 0;
        while(check){
            const tbody1 = $('td',html)[i];
            if(tbody1 == undefined){
                check = false;
            }
            else{
                let tbody = tbody1.children[0].data;
                aeroportos_codes.push(tbody)
                i++;
            }
        }
        //Separando as tags em conjuntos por aeroporto (4 tags/aeroporto)
        aeroportos_codes = dividirArray(aeroportos_codes, 4);

        //Transformando o array em file JSON
        const keys = ["IATA","ICAO","Aeroporto","Cidade"]
        const objects = aeroportos_codes.map(array => {
            const object = {};
          
            keys.forEach((key, i) => object[key] = array[i]);
            
            return object;
          });
          
        const aeroportos = JSON.stringify(objects);
        filesystem.writeFile('aeroportos_scrape.json', aeroportos, function (err) {
            console.log(err);
        })
        ;
    })
    .catch((err) => {console.log(err)})

app.listen(env.SCRAPE_PORT, console.log(`Server running at ${env.SCRAPE_PORT}`))