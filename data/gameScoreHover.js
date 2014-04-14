window.addEventListener('mouseover', function(event)
{
        var t = event.target;
        while(t.nodeName != "TR")
            t = t.parentNode;
        console.log(t.nodeName);


});
