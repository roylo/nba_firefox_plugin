window.addEventListener('click', function(event) 
{
    var t = event.target;
    while(t.nodeName != "DIV")
        t = t.parentNode;
    console.log(t.innerHTML);
    self.port.emit("menuSelect", t.innerHTML);      
}, false)
