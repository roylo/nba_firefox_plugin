self.port.on("gameScore", function(gamePref) 
{
    var content = "";
    var gameNum = gamePref.length;
    content += '<table id="gameScoreTable">';
    for(i=0;i<gameNum;i++)
    {
        var className;
        if(document.getElementsByTagName("tr").length > 0)
            className = document.getElementsByTagName("tr")[i].getAttribute("class");
        if(typeof className === 'undefined')
            className = "gameTr";
        
        content += '<tr class="'+className+'">';
            
        content += '<td class="imgTd">';
        content += '<img src="img/'+gamePref[i].team[0]["@attributes"].abrv_name+'.gif" width="60" height="38"/>';
        content += '</td>';

        content += '<td class="nameTd">';
        content += gamePref[i].team[0]["@attributes"].abrv_name;
        content += '</td>';
        content += '<td class="scoreTd">';
        content += '<div id="gameQuarter_'+i+'">';
        var qtr = gamePref[i]["@attributes"].game_quarter;
        if(qtr != "" && qtr != 0 && qtr <= 4)
            content += 'QTR '+qtr+'</div>';
        else if(qtr > 4)
            content += 'OT '+(qtr-4)+'</div>';
        else 
            content += 'Start at</div>';
        
        content += gamePref[i].team[0]["@attributes"].total_score;
        content += '</td>';

        content += '<td class="scoreTd">';
        if(gamePref[i]["@attributes"].status_text != "")
            content += '<div id="gameStatus_'+i+'">'+gamePref[i]["@attributes"].status_text+'</div>';
        else
            content += '<div id="gameStatus_'+i+'">Half Time</div>';
        content += gamePref[i].team[1]["@attributes"].total_score;
        content += '</td>';
        content += '<td class="nameTd">';
        content += gamePref[i].team[1]["@attributes"].abrv_name;
        content += '</td>';

        content += '<td class="imgTd">';
        content += '<img src="img/'+gamePref[i].team[1]["@attributes"].abrv_name+'.gif" width="60" height="38"/>';
        content += '</td>';

        content += '</tr>';
    }
    content += '</table>';
    document.getElementById("gameScoreDiv").innerHTML = content;
    document.getElementById("loadingDiv").innerHTML = "Loading Complete";

});

self.port.on("gameScoreLoading", function()
{
    document.getElementById("loadingDiv").innerHTML = "Loading Now...";
});

