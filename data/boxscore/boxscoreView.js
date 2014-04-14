self.port.on("boxscoreTableHTML", function(text)
{
    var html = "";
    html += text;
    document.getElementById("boxDiv").innerHTML = html;
    for(i=0; i < $(".boxSPDF").length; i++)
    {
        $(".boxSPDF")[i].innerHTML = "";
    }
    var tt = $("a")[0].getAttribute("href");
    console.log( tt );
});

self.port.on("clear", function()
{
    document.getElementById("boxDiv").innerHTML = "Loading...";
});
