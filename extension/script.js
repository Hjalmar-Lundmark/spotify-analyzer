const id = window.location.pathname.split('/playlist/')[1];
console.log(id);

document.getElementById('start').addEventListener('click', function() {
    console.log('run');
    console.log(window.location)
    // document.getElementById('test').innerHTML = window.location.href;
    

});