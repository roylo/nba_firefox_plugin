var Request = require("request").Request;
var timer = require("timers");
var {Cc, Ci} = require("chrome");
var notifications = require("notifications");
var data = require("self").data;
var panel = require("panel").Panel;
var tabs = require("tabs");

var xmlConvert = require("xmltojson.js");
var date = require("dateType.js");

var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);

var widget = require("widget").Widget;


var trCount = 0;
var tdCount = 0;
var todayDate;
var gamePref = "";
var pageWorkerNum = 0;
var timerId;
var panelArray = new Array();
var gameScorePanelType = "";

/******************************************
 * menu
 ******************************************/
var menuPanel = panel
({
    width: 200,
    height: 120,
    contentURL: data.url("menu/menu.html"),
    contentScriptFile: [data.url("menu/menuSelection.js")]

});

menuPanel.port.on("menuSelect", function(menubar)
{
    switch(menubar)
    {
        case "Game Score":
            showPanel(0);
            gameScorePanelType = "gameScore";
            break;
        case "Highlights":
            showPanel(1);
            break;
        case "Boxscore":
            showPanel(0);
            gameScorePanelType = "boxScore";
            break;
    }

});


/******************************************
 * play event
 ******************************************/
function getPlayByPlay(gameUrl, vistorTeamName, homeTeamName)
{ //{{{
            console.log(gameUrl);
    pageWorker = require("page-worker").Page
    ({
        contentURL: gameUrl,
        contentScriptFile: [data.url("jquery-1.4.4.min.js"),
                            data.url("htmlparser.js"),
                            data.url("play.js")]
    });
    pageWorkerNum++;
    console.log("pageWorkerNumAdd:" + pageWorkerNum);
    pageWorker.port.emit("tableIndex", trCount, tdCount);

    pageWorker.port.on("tableNumNow", function(trNow, tdNow, res, resType)
    {
        console.log("get msg from content");
        trCount = trNow;
        tdCount = tdNow;
        if(res != "")
        {
            var obj = eval ("(" + res + ")");
            var title, content, icon;
            if(resType == "playEvent")
            {
                for(i=0; i<obj.td.length; i++)
                {
                    if(obj.td[i].pos == "mid")
                        title = obj.td[i].text;
                    else
                    {
                        if(obj.td[i].text != "")
                        {
                            content = obj.td[i].text;

                            if(obj.td[i].pos == "left")
                                icon = "img/"+ vistorTeamName +".png";
                            else
                                icon = "img/"+ homeTeamName +".png";
                        }
                    }
                }
            }
            else if(resType == "quarterEvent")
            {
                title = obj.td[0].text;
                content = "";
                icon = "img/myAddon.png";
            }
            sendNotify(title, content, null, null, data.url(icon));
        }
    });
    pageWorker.port.on("destructor", function()
    {
        pageWorker.destroy();
        pageWorkerNum--;
        console.log("pageWorkerNumMinus:" + pageWorkerNum);
    });

} //}}}

/******************************************
 * gameResult
 ******************************************/
function nbaGameResultXmlToJson(response)
{ //{{{
    var xml = parser.parseFromString(response.text, "application/xml");
    var scoreboard = xml.getElementsByTagName('scoreboard');
    var version = scoreboard[0].getAttribute('version');

    var result = xmlConvert.xmlToJson(xml);
    return result;
} //}}}

function nbaGameResultOp(bSendNotify)
{ //{{{
    var nbaGameRequest = Request
    ({
        url: "http://data.nba.com/data/5s/xml/homepage/noseason/gt_other.xml",
        onComplete: function (response)
        {
            var result = nbaGameResultXmlToJson(response);
            todayDate = date.getToday();
            var dataStream = "";
            if ( todayDate == result.schedule.scoreboard.yesterday.game[0]["@attributes"].game_date )
                gamePref = result.schedule.scoreboard.yesterday.game;

            else if ( todayDate == result.schedule.scoreboard.today.game[0]["@attributes"].game_date )
                gamePref = result.schedule.scoreboard.today.game;

            for(i=0; i<gamePref.length; i++)
            {
                var vistor = gamePref[i].team[0]["@attributes"].abrv_name;
                var home = gamePref[i].team[1]["@attributes"].abrv_name;
                var v_score = gamePref[i].team[0]["@attributes"].total_score;
                var h_score = gamePref[i].team[1]["@attributes"].total_score;
                dataStream += vistor+" "+v_score+" vs. "+h_score+" "+home+"\n";
            }

            if(bSendNotify)
                sendNotify(todayDate, dataStream, null, null);
            generatePanelContent(gamePref);
        }
    });
    nbaGameRequest.get();
    gameScorePanel.port.emit("gameScoreLoading");
} //}}}

/******************************************
 * gamescore
 ******************************************/
var gameScorePanel = panel
({
    width: 100,
    height: 70,
    contentURL: data.url("gameScore.html"),
    contentScriptFile: [data.url("gameScore.js"),
                        data.url("gameScoreSelection.js"),]
});
panelArray.push(gameScorePanel);

gameScorePanel.port.on("gameSelect", function(index, op)
{
    if(gamePref != "")
    {
        var gameId, gameDate, nbaYear, playUrl, vistorTeamName, homeTeamName;
        gameId = gamePref[index]["@attributes"].id;
        gameDate = gamePref[index]["@attributes"].game_date;
        urlDate = gameDate.substr(6,4) + gameDate.substr(0,2) + gameDate.substr(3,2);
        if(gameDate.substr(0,2) > 6 && gameDate.substr(0,2) <= 12)
            nbaYear = gameDate.substr(6,4);
        else
            nbaYear = gameDate.substr(6,4) -1;

        playUrl = "http://data.nba.com/data/10s/html/nbacom/"
                + nbaYear
                + "/gameinfo/"
                + urlDate
                + "/" + gameId;

        if(gameScorePanelType == "gameScore" && (op=="start" || op=="end"))
        {

            playUrl += "_playbyplay_csi.html";

            vistorTeamName = gamePref[index].team[0]["@attributes"].abrv_name;
            homeTeamName = gamePref[index].team[1]["@attributes"].abrv_name;

            if(gamePref[index]["@attributes"].status_numeric == 2 && op == "start")
            {
                resetPlayByPlay();
                var title = "Start live play by play broadcast!";
                var text = vistorTeamName+" vs. "+homeTeamName;
                var icon = data.url("img/myAddon.png");
                sendNotify(title, text, null, null, icon);
                timerId = timer.setInterval(getPlayByPlay ,10000, playUrl, vistorTeamName, homeTeamName);
            }
            if(op == "end" && timerId > 0)
            {
                console.log("end");
                resetPlayByPlay();
            }
        }
        else if (gameScorePanelType == "boxScore")
        {
            playUrl += "_boxscore_csi.html";
            console.log(playUrl);
            getBoxScore(playUrl);
            showPanel(2);
        }
    }
});


/******************************************
 * highlight
 ******************************************/
var highlightsPanel = panel
({
    width: 270,
    height: 100,
    contentURL: data.url("highlights/highlightsMenu.html"),
    contentScriptFile: [data.url("highlights/highlights.js"),
                        data.url("highlights/highlightsSelection.js")]

});
panelArray.push(highlightsPanel);

highlightsPanel.port.on("highlightsSelect", function(index)
{
    var playerUrl = "http://player.longtailvideo.com/player.swf?autostart=true&file=http://nba.cdn.turner.com/nba/big/";
    var resolution = "_1280x720.mp4";
    var url;
    if(index < gamePref.length)
    {
        url = gamePref[index].links.link[2]["@attributes"].url;
        url = url.replace("http://www.nba.com/video/", "");
        url = url.replace("/index.html", "");
        resolution = "_1280x720.mp4";
    }
    else
    {
        url = "channels/top_plays/";
        url += todayDate.substr(6,4) + '/' + todayDate.substr(0,5) + '/';
        url += todayDate.substr(6,4) + todayDate.substr(0,2) + todayDate.substr(3,2);
        url += "-top-10";
        resolution = ".nba_1280x720.mp4";
    }
    console.log(url);
    tabs.open(playerUrl+url+resolution);
});


/******************************************
 * boxscore
 ******************************************/
function getBoxScore(boxScoreUrl)
{
    boxScorePageWorker = require("page-worker").Page
    ({
        contentURL: boxScoreUrl,
        contentScriptFile: [data.url("jquery-1.4.4.min.js"),
                            data.url("htmlparser.js"),
                            data.url("boxscore/boxscoreGet.js")]
    });
    boxScorePageWorker.port.on("boxscoreTable", function(tableHTML)
    {
        boxscorePanel.hide();
        boxscorePanel.port.emit("boxscoreTableHTML", tableHTML);
        boxscorePanel.resize(1090, 580);
        boxscorePanel.show();
        boxScorePageWorker.destroy();
    });
}


var boxscorePanel = panel
({
    width: 60,
    height: 20,
    contentURL: data.url("boxscore/boxscoreView.html"),
    contentScriptFile: [data.url("boxscore/boxscoreView.js"),
                        data.url("jquery-1.4.4.min.js")],
    onShow: function()
    {
        menuPanel.hide();
    },

    onHide: function()
    {
        boxscorePanel.resize(60,20);
        boxscorePanel.port.emit("clear");
    }

});
panelArray.push(boxscorePanel);

/******************************************
 * supporting function
 ******************************************/
function sendNotify (title, text, data, cbFunction, myIconURL)
{
    if(cbFunction != null && data != null)
    {
        notifications.notify
        ({
            title: title,
            text: text,
            data: data,
            onClick: cbFunction
        });
    }
    else
    {
        notifications.notify
        ({
            title: title,
            text: text,
            iconURL: myIconURL
        });
    }
}

function generatePanelContent(gamePref)
{
    var scoreWidth;
    var highlightsWidth = 300;
    if(gamePref[0].team[0]["@attributes"].total_score == "")
        scoreWidth = 470;
    else
        scoreWidth = 470;

    gameScorePanel.resize(scoreWidth, 50+47*gamePref.length);
    gameScorePanel.port.emit("gameScore", gamePref);
    if(gameScorePanel.isShowing)
    {
        gameScorePanel.hide();
        gameScorePanel.show();
    }

    highlightsPanel.resize(highlightsWidth, 30+47*(gamePref.length + 1));
    highlightsPanel.port.emit("highlights", gamePref);
    if(highlightsPanel.isShowing)
    {
        highlightsPanel.hide();
        highlightsPanel.show();
    }


}

function resetPlayByPlay()
{
    while(pageWorkerNum !=0)
    {
        console.log("reset before pageWorkerNum is zero!!");
    }
    if(timerId != 0)
        timer.clearInterval(timerId);
    trCount = 0;
    tdCount = 0;

}

function showPanel(index)
{
    for(i=0; i<panelArray.length; i++)
    {
        if(i==index)
            panelArray[i].show();
        else
            panelArray[i].hide();
    }
}


var myWidget = widget
({
    id: "my_icon",
    label: "My NBA Play Widget",
    contentURL: data.url("img/myAddon_1.png"),
    panel: menuPanel,
    onClick: function()
    {
        nbaGameResultOp(false);
    }
});

