const params = new URLSearchParams(window.location.search);
params.set('denemeYukle', '1');
window.location.replace('/?' + params.toString());

export {};
