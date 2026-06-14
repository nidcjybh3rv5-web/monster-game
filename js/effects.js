function flashScreen() { document.body.classList.add('flash'); setTimeout(() => document.body.classList.remove('flash'), 200); }
function shakeScreen() { document.querySelector('.app').classList.add('shake'); setTimeout(() => document.querySelector('.app').classList.remove('shake'), 200); }
