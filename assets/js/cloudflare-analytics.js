// assets/js/cloudflare-analytics.js

(function() {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', '{"token": "your-token"}');
    document.body.appendChild(script);
})();