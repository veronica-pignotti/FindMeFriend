if ('serviceWorker' in window.navigator) {
  window.addEventListener('load', function () {
    window.navigator.serviceWorker.register('/js/serviceworker.js').then(function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}