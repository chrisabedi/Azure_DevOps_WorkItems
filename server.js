const express = require('express')
const redis = require('redis');
const client = redis.createClient();
const app = express()
const bodyParser = require('body-parser');
const azdev = require('azure-devops-node-api')
const config = require('./config.json');
const defaultConfig = config.development;

const port = defaultConfig.port;
const orgUrl = defaultConfig.organization_url;
const token = defaultConfig.token;

let authHandler = azdev.getPersonalAccessTokenHandler(token); 
let connection = new azdev.WebApi(orgUrl, authHandler);    

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    next();
  });
  

// const queryString={ 
//     "query": "SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = 'Tools' AND [System.WorkItemType] = 'Bug' AND [Microsoft.VSTS.Common.Triage] <> 'Triaged' AND [System.State] <> 'On Hold' AND [System.State] <> 'Removed' ORDER BY [Microsoft.VSTS.Common.Severity]"
// };
const queryString = {
    "query": "SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = 'Tools' AND [System.WorkItemType] = 'Bug'  AND [System.State] = 'In Progress' ORDER BY [Microsoft.VSTS.Common.Severity]"
};

class vstsBug {
    constructor(id,name,description,severity,priority,state,startDate,hourRange=0){
        this.id = id;
        this.name = name;
        this.description = description;
        this.severity = severity;
        this.priority = priority;
        this.state =state;
        this.startDate = startDate;
        this.hourRange = hourRange;
    }
    toString(){
        return `${this.id},${this.name},${this.description},${this.severity},${this.priority},${this.state},${this.stateDate},${this.hourRange}`;
    }
}

  async function run() {
    try
    {

const workItemTracking = await connection.getWorkItemTrackingApi();
let wiqlResult = await workItemTracking.queryByWiql(queryString);
console.log(wiqlResult);
let num =[];
for (let j=0;j<wiqlResult.workItems.length;j++){
    num.push(wiqlResult.workItems[j].id);
}
console.log(num);
let workItemsInclusive = await workItemTracking.getWorkItems(num ,null,null,null,null,'tools');

  
    for (let i=0;i<workItemsInclusive.length;i++){
        let fields=workItemsInclusive[i].fields;
        let triageItem= new vstsBug(num[i],fields['System.Title'],fields['System.Description'], 
        fields['Microsoft.VSTS.Common.Severity'],fields['Microsoft.VSTS.Common.Priority'],
    fields['System.State'],fields['System.CreatedDate']);
       client.set(triageItem.id,JSON.stringify(triageItem));
    }

}
    finally{
        console.log('done');
    }
}

run();


app.get('/api/bugkeys',function(req,res){

    client.keys('[0-9]*', (err, keys) => {
      console.log(keys);
      if ((keys)!=null){
      console.log(keys);
          res.send(keys)
      }
        else
            res.send('Error with keys');
    });
});
    
app.get('/api/bug/:bugId',function(req,res){

    var bugId = req.params['bugId'];
    client.get(bugId,function(err,result){
        if (result!=null)
            res.send(result);
        else
            res.send(`Error with Get ${bugId}`);
    })
    
})

app.delete('/api/bug/:bugId',function(req,res){
    var bugId = req.params['bugId'];
    client.get(bugId,function(err,result){
        if (result!=null){
            client.del(bugId);
            res.send('Delete Performed');
        }
        else
        res.send(`bugId ${bugId} not found`)
    })
    
})

app.post('/api/bug/:bugId',function(req,res){

    console.log(req.body);
    var postBug = JSON.stringify(req.body);
    console.log(postBug);
    var bugObj = JSON.parse(postBug);
    client.set(bugObj.id,postBug)
    res.end(postBug);
})

app.put('/api/bug/:bugId',function(req,res){
    var bugId = req.params['bugId'];
    var updateBug = JSON.stringify(req.body.bug);
    var bugObj = JSON.parse(updateBug);

    if (client.get(bugId,function(err,result){
        if ((result!=null) && (bugId ==bugObj.id)){
            client.set(bugId,updateBug)
            res.send(updateBug);
        }
        else
        res.send(`error with update ${bugId}`);
    }));
})


app.get('/',function(req,res){

    res.send('Routes API DOCS: <no docs just right>');
   
});


app.listen(port, () => console.log(`App listening on port ${port}\n`));