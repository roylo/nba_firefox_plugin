window.addEventListener('click', function(event) 
{
    var t = event.target;
    while(t.nodeName != "TR")
        t = t.parentNode;

    self.port.emit("highlightsSelect", t.rowIndex);
    
}, false)
