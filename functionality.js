

function GetBug(bugId){
    var resultElement = document.getElementById(`bug${bugId}`);
    var card = resultElement.childNodes;
    var cardBody = card[0].childNodes;
    var cardText=cardBody[0].childNodes;
    console.log(cardText);
    console.log("cardBody length is: "+cardBody.length);

    
    axios.get(`http://localhost:3000/api/bug/${bugId}`)
      .then(function (response) {
            let json =JSON.stringify(response.data);
            var jsonPretty = JSON.stringify(JSON.parse(json),null,2); 
            console.log(jsonPretty); 
            cardText[0].innerHTML=response.data.name;
            //cardText[1].innerHTML=jsonPretty;
            cardText[1].innerHTML=
            `<p>Bug id: ${response.data.id}</p>`+
             `<p>State: ${response.data.state}</p>`+
             `<p>Severity: ${response.data.severity}</p>`+
             `<p>Priority: ${response.data.priority}</p>`+
             `<p>StartDate: ${response.data.startDate}</p>`+
             `<p>Hours: ${response.data.hourRange}</p>`+
             `<p>Description: ${response.data.description}</p>`;
      })
      .catch(function (error) {
        resultElement.innerHTML = `<p>${error}</p>`;
      });   
}

function GetKeys(){
    var resultElement = document.getElementById('bugKeys');
    resultElement.innerHTML ='';
    console.log("is this ever called");

    axios.get('http://localhost:3000/api/bugkeys')
    .then(function (response) {
        let string = JSON.stringify(response.data);
        console.log(string);
        console.log(response.data);
        console.log(response.data[0])
        resultElement.innerHTML = string;

        var rowEle = document.getElementById("bugContainer");
        for (i=0;i<response.data.length;i++){
            let item = response.data[i];
            let ele=document.createElement("div");

            ele.className="col-sm-4";
            ele.id=`bug${item}`;

            let card = document.createElement("div");
            card.className="card";

            let cardBody = document.createElement("div");
            cardBody.className="card-body";
            
            let cardTitle = document.createElement("h5");
            cardTitle.className="card-title";
            cardTitle.id="cardtitle";

            let cardText=document.createElement("p");
            cardText.id="cardtext";

            let remove = document.createElement("a");
            remove.onclick = function() {RemoveBug(item);};
            let text = document.createTextNode("Delete");
            remove.className="btn btn-primary";
            remove.appendChild(text);
           
            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardText);
            cardBody.appendChild(remove);

            card.appendChild(cardBody);
            ele.appendChild(card);
            rowEle.appendChild(ele);
            console.log("Item:"+item);
            GetBug(item);
        }
    })
    .catch(function(error){
        resultElement.innerHTML = error;
    })  
}
function RemoveBug(bugId){
    console.log("RemoveBugCalled")
    axios.delete(`http://localhost:3000/api/bug/${bugId}`)
    .then(function (response){
        if (response!=null){
            location.href=location.href;
        }
    })
    .catch(function(error){
        console.log(error);
    })
}