# Firebird API

Uma API Rest NodeJS que recebe um SQL, envia para um banco de dados Firebird e retorna um JSON.

## Instalação


```bash
npm install 
```

Você também precisa criar as variáveis de ambiente com usuário e senha do seu banco de dados:
```bash
FIREBIRDAPI_USER: SYSDBA
FIREBIRDAPI_PASSWORD: masterkey
NODE_FIREBIRD_ENCODING: UTF8 # Caso o banco tenha codificação WIN1252 ou ISO-8859-1 use LATIN1 (suportado pelo node.js)
```


Você também precisa criar o arquivo `src/config.json` com a seguinte estrutura:

```
{
  "connection": {
        "database": "C:/dados/database.fdb",
        "host": "127.0.0.1",
        "port": 3050,
        "pageSize": 4096,
		"encoding": "UTF8",
		"blobAsText": false 
  },
  transactionOptions {
    "autoCommit": false,
    "autoUndo": true,
    "isolation": [15, 18] # Valor do array Firebird.ISOLATION_READ_COMMITTED
    "ignoreLimbo": false,
    "readOnly": false,
    "wait": true,
    "waitTimeout": 0, 
  },
	"textEncoding": "WIN1252",
	"secret": "minha_chave_secreta",
    "cors": {
        "allowServerToServerAccess": false,
        "whitelist": ["meusite.com.br"]
    }
}
```

* `connection.database`: O endereço físico do seu banco de dados.
* `connection.host`: A URL ou IP do servidor onde se encontra seu banco de dados.
* `connection.port`: A porta do firebird no seu servidor.
* `connection.pageSize`: *Opcional* Default `4096`. O pageSize ideal de acordo com seu banco e servidor.
* `connection.encoding`: *Opcional* Default `UTF8`. A codificação da conexão do banco, como é usado em JSON, deve ser usado UTF-8 e convertido por textEncoding.
* `connection.blobAsText`: *Opcional* Default `false`. **Recomendado false** Utilizando o padrão recomendado `false` a API conseguirá ler apenas campos BLOB do tipo binário (`BLOB SUB_TYPE 0 Binary`). Esta opção é recomendada porque a comunidade `node-firebird` ainda não conseguiu ler campos BLOB do tipo texto (`BLOB SUB_TYPE 1 Text`) com segurança. [Veja aqui](https://github.com/hgourvest/node-firebird/issues/51#issuecomment-389193669) a issue ainda aberta no github sobre este problema, onde propus uma solução temporária de utilizarmos apenas campos BLOB do tipo binário, como essa opção faz por default. Caso você não tenha acesso ou não seja possível alterar o seus campos BLOB para tipo binário, faça testes habilitando essa opção para `true`, assim a API conseguirá ler automaticamente campos `BLOB SUB_TYPE 1 Text`. Essa opção não é recomendada pois para isso internamente é usado um fork do pacote `node-firebird` oficial, chamado `node-firebird-dev` que consegue contornar alguns problemas e ler esse tipo de blob. Porém esse pacote não recebe frequentes atualizações e pode trazer outros problemas . Habilite essa opção apenas se você tiver certeza do que está fazendo.
* `textEncoding`: *Opcional* Default `WIN1252`. A codificação de conversão de texto do banco, 
* `secret`: A chave secreta que foi utilizada para gerar o token JWT
* `cors.allowServerToServerAccess`: *Opcional* Default `false`. Se `true` o cors permite que a API seja acessada diretamente de outros servidores ou de ferramentas REST como Postman, Insomnia, dentre outros.
* `cors.whitelist`: Uma lista de domínios a partir de onde é permitido acessar a API. Há duasformas possíveis de uso:

1. **Recomendado** ["meusite.com.br", "meusite2.com.br"] permitirá que sua API seja acessada apenas de dentro de páginas destes domínios.
2. ["*"] permite acesso a partir de qualquer domínio da WEB.

## Endpoint

O servidor ficará disponivel na porta indicada na variável de ambiente PORT ou na porta 3000 por padrão.

Acessando o recurso principal:
```
POST /query
Content-Type: application/json
Authorization: Bearer **seu_token**

{
   "sql": "select * from MY_TABLE"
}
```

O retorno será um JSON: 

```
[
  {
    "ID": 6,
    "NOME": "José",
    "CIDADE": "São Paulo",
    "ESTADO": "SP"
  },
  {
    "ID": 2,
    "NOME": "Paulo",
    "CIDADE": "Palmas",
    "ESTADO": "TO"
  }
]
 ```

A resposta contém um header X-Total-Count com o total de registros retornados.

# Problemas com charsets
A conversão dos dados e envio via javascript/firebird às vezes gera problemas relacionados com charset, especialmente se os campos VARCHAR das tabelas estiverem sem Charset ou sem Collate. O retorno é sempre tratado, mas às vezes vocês precisarão realizar alguns workarouds com os sqls.  

Por exemplo:

`select CODIGO, DATA, OBSERVACOES from CALENDARIO where OBSERVACOES like 'Isenção%'`

O sql acima pode não retornar valores devido a acentuação. [Veja aqui uma discussão sobre isso](https://github.com/hgourvest/node-firebird/issues/125) Nesse caso sempre é recomendado realizar um cast para `varchar(256) character set latin1` no próprio SQL:

`select CODIGO, DATA, OBSERVACOES from CALENDARIO where OBSERVACOES like cast('Isenção%' as varchar(256) character set latin1)`

## Dependências
Esta API utiliza o pacote [node-firebird](https://www.npmjs.com/package/node-firebird) na sua versão mais estável (0.8.9). Atualizações para versões posteriores podem não se comportar corretamente.