var db = new PouchDB('banco2');
var remoteCouch = "http://127.0.0.1:5984/daniel";
var syncDom = document.getElementById('sync-wrapper');

//Sempre que ocorrer uma mudança no back-end, esse bloco será chamado
db.changes({
    since: 'now',
    live: true
}).on('change', function () {});//o function vc preenche com o nome da função que quer chamar quando
//ocorrer mudanças no servidor
function busca() {
    db.find({
        selector: {nome: 'Paulo'}
    }).then(function (result) {
        var resultado = result.docs[0];
    }).catch(function (err) {
        console.log(err);
    });
}

function buscaTodos() {
    db.allDocs({
        include_docs: true //Sem essa linha, a consulta buscará apenas id e rev do documento
    }).then(function (result) {
        var resultado = result.rows;
    }).catch(function (err) {
        console.log(err);
    });
}

function sincronizacao() {
    var opts = {live: true, batch_size: 1000};

    db.sync(remoteCouch, opts).on('change', function (info) {
        // handle change
    }).on('paused', function (err) {
        // replication paused (e.g. replication up to date, user went offline)
    }).on('active', function () {
        // replicate resumed (e.g. new changes replicating, user went back online)
    }).on('denied', function (err) {
        // a document failed to replicate (e.g. due to permissions)
    }).on('complete', function (info) {
        // handle complete
    }).on('error', function (err) {
        console.log('ERRO: ' + err);
    });
}


function map(doc) {
    if (doc.type === "pessoa") {
        if (doc.nome === "Paulo") {
            emit(doc._id, doc.filhos);
        }
    }
}
function consultaComplexa() { //Usar apenas em último caso, pois há um custo computacional
    db.query(map, {include_docs: true}).then(function (result) {
        var filhos = result.rows[0].doc.filhos;
    }).catch(function (err) {
        console.log(err);
    });
}

function inserir() {
    db.put({
        _id: "2",
        nome: 'Pixote',
        type: "pessoa",
        idade: 2,
        filhos: [
            {
                nome: "Gioconda",
                idade: 24
            },
            {
                nome: "Anastácia",
                idade: 21
            }
        ]
    }).then(function (response) {
        // handle response
    }).catch(function (err) {
        console.log(err);
    });
}

function insercaoInicial() {
    db.put({
        _id: "1",
        nome: "Paulo",
        type: "pessoa",
        idade: 302,
        filhos: [
            {
                nome: "joana",
                idade: 12
            },
            {
                nome: "jupira",
                idade: 2
            }
        ]
    }).then(function (response) {
        // handle response
    }).catch(function (err) {
        console.log(err);
    });
}



window.onload = function () {
    if (remoteCouch) {
        insercaoInicial();
        sincronizacao();
    }
    document.querySelector("#busca-especifica").addEventListener("click", function (event) {
        event.preventDefault();
        busca();
    });
    document.querySelector("#busca-todos").addEventListener("click", function (event) {
        event.preventDefault();
        buscaTodos();
    });
    document.querySelector("#busca-complexa").addEventListener("click", function (event) {
        event.preventDefault();
        consultaComplexa();
    });
    document.querySelector("#inserir").addEventListener("click", function (event) {
        event.preventDefault();
        inserir();
    });
};