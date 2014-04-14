
window.addEventListener('click', function(event) 
{
    var t = event.target;
    while(t.nodeName != "TR")
        t = t.parentNode;
    for(i=0; i<document.getElementsByTagName("tr").length; i++)
    {
        var str_gameQuarter = "gameQuarter_"+i;
        var str_gameStatus = "gameStatus_"+i;
        var gameQuarter = document.getElementById(str_gameQuarter).innerHTML;
        var gameStatus = document.getElementById(str_gameStatus).innerHTML;
        var className = document.getElementsByTagName("tr")[i].getAttribute("class");
        if(className == "gameTr" && i == t.rowIndex && gameQuarter != "Start at" && gameStatus != "FINAL")
        {
            document.getElementsByTagName("tr")[i].setAttribute("class","gameTrSelected");
            self.port.emit("gameSelect", t.rowIndex, "start");
        }
        else
        {
            if(className == "gameTrSelected" && i == t.rowIndex)
            {
                self.port.emit("gameSelect", t.rowIndex, "end");
            }
            document.getElementsByTagName("tr")[i].setAttribute("class","gameTr");
        }

        if(i == t.rowIndex)
            self.port.emit("gameSelect", t.rowIndex, "click");
    }
    
}, false);

