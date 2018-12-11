const express = require('express')
const app = express()
const axios = require('axios')
const port = 3001
app.use('/',express.static(__dirname));

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

class bug {
    constructor(id,name,severity,description,startDate,dueDate,hourRange,progress){
        this.id = id;
        this.name = name;
        this.severity = severity;
        this.description = description;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.hourRange = hourRange;
        this.progress = progress;
    }
   
    toString(){
        return `${this.id},${this.severity},${this.description},${this.startDate},${this.dueDate},${this.hourRange},${this.progress}`;
    }
}

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
app.get('/',function(req,res){
    httpGetAsync('http://localhost:3000/api/bug/1',function(e){res.send(e)});
});

app.get('/home',function(req,res){
    res.sendFile('./front.html',{ root: __dirname });

})

app.get('/axios',function(req,res){
    let frontend = new bug(2,"name",2,2,2,2,2,2);
    let json = JSON.stringify(frontend);

    var data;
    
    axios.post('http://localhost:3000/api/bug/2',json)
    .then(function (response) {
        console.log('success');
        data = response.data;
        res.send(data);
  
      })
      .catch(function (response) {
        console.log('error');
      });
      
  
})


function httpGetAsync(url,callback){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function(){
        if (xmlHttp.readyState == 4 && xmlHttp.status==200)
        callback(xmlHttp.responseText);
    };
    xmlHttp.open('GET',url,true);
    xmlHttp.send(null);
}

app.listen(port, () => console.log(`App listening on port ${port}\n`));