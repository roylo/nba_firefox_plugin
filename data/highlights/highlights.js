self.port.on("highlights", function(gamePref) 
{
    var content = "";
    var gameNum = gamePref.length;
    content += '<table id="highlightsTable">';
    for(i=0;i<gameNum;i++)
    {
        content += '<tr class="highlightsTr">';
            
        content += '<td class="imgTd">';
        content += '<img src="../img/'+gamePref[i].team[0]["@attributes"].abrv_name+'.gif" width="60" height="38"/>';
        content += '</td>';

        content += '<td class="nameTd">';
        content += gamePref[i].team[0]["@attributes"].abrv_name;
        content += '</td>';
        
        content += '<td class="nameTd">';
        content += gamePref[i].team[1]["@attributes"].abrv_name;
        content += '</td>';

        content += '<td class="imgTd">';
        content += '<img src="../img/'+gamePref[i].team[1]["@attributes"].abrv_name+'.gif" width="60" height="38"/>';
        content += '</td>';

        content += '</tr>';
    }
    content += '<tr class="highlightsTr">';
    content += '<td class="imgTd"><img src="../img/myAddon.png" width="55" height="55" />'; 
    content += '<td colspan="2">Top 10 Plays </td>'; 
    content += '<td class="imgTd"><img src="../img/myAddon.png" width="55" height="55" />'; 
    content += '</tr>';

    content += '</table>';
    document.getElementById("highlightsBar").innerHTML = content;

});



