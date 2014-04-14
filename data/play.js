var text = document.getElementById('htmlArea').innerHTML;
var html = $("<div/>").html(text).text();  // html decode
var domObj = HTMLtoDOM(html, document);

var trNum = $("tr").length;
var tdNum = $("td").length;


self.port.on("tableIndex", function(trIndex, tdIndex) 
{
    while(trIndex<trNum)
    {
        var res = '{ "td" : [';
        var resType = "";
        if( trIndex == 0 && tdIndex == 0)
        {
            self.port.emit("tableNumNow", trNum, tdNum, "", resType);
            break;
        }

        var tdText = $("td")[tdIndex].getAttribute("class");
        console.log(tdText);
        if(tdText == "nbaGIPbPLftScore" || tdText == "nbaGIPbPLft")
        {
            res += playEvent(trIndex, tdIndex);
            tdIndex += 3;

            resType = "playEvent";
        }
        else if( tdText == "nbaGIPbPTblHdr")
        {
            res += '{"text":"';
            res += $("td")[tdIndex].innerHTML.replace("&nbsp;","").trim();
            res += '"}';

            resType = "quarterEvent";
        }

        res += ']}';
        console.log(res);
        trIndex++;
        self.port.emit("tableNumNow", trNum, tdNum, res, resType);
    }
    self.port.emit("destructor");
});


function playEvent(trIndex, tdIndex)
{
    var playRes = "";
    for(i=0;i<3;i++)
    {
        var tdText = $("td")[tdIndex+i].getAttribute("class");
        if( tdText == "nbaGIPbPLftScore")
            playRes += '{"pos":"left" , "made":"y" , "text":"';
        else if( tdText == "nbaGIPbPLft")
            playRes += '{"pos":"left" , "made":"n" , "text":"';
        else if( tdText == "nbaGIPbPMidScore")
            playRes += '{"pos":"mid" , "made":"y" , "text":"';
        else if( tdText == "nbaGIPbPMid")
            playRes += '{"pos":"mid" , "made":"n" , "text":"';
        else if( tdText == "nbaGIPbPRgtScore")
            playRes += '{"pos":"right" , "made":"y" , "text":"';
        else if( tdText == "nbaGIPbPRgt")
            playRes += '{"pos":"right" , "made":"n" , "text":"';

        var resStr = $("td")[tdIndex+i].innerHTML.replace("&nbsp;","");
        resStr = resStr.replace("<br>"," ").trim();
        playRes += resStr;

        if( tdText != "nbaGIPbPRgtScore" && tdText != "nbaGIPbPRgt")
            playRes += '" }, ';
        else
            playRes += '" }';

    }
    return playRes;
}

String.prototype.trim=trim;    //傳回去除前後空白的值
function trim() 
{
    return this.replace(/^\s+|\s+$/g, "");
} 
