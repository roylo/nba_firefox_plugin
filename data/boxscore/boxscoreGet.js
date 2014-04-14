var text = document.getElementById('htmlArea').innerHTML;
text = text.replace('&lt;!--Final--&gt;', "");
var html = $("<div/>").html(text).text();
self.port.emit("boxscoreTable", html);

String.prototype.trim=trim;    //傳回去除前後空白的值
function trim() 
{
    return this.replace(/^\s+|\s+$/g, "");
} 
