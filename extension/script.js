console.log('Hello from script.js');

document.getElementById('test').innerHTML = 'Hello from script.js';

document.getElementById('start').addEventListener('click', run() );

function run() {
    console.log('run');
    console.log(window.location)
    document.getElementById('test').innerHTML = 'running...';
}