(function() {
  if (localStorage.getItem('cookie-consent')) return;
  var banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'alert');
  banner.innerHTML =
    '<span>This site uses cookies for analytics and advertising. ' +
    'By continuing, you agree to our <a href="/privacy.html">Privacy Policy</a>.</span>' +
    '<button class="btn btn-primary" id="cookie-accept" style="padding:8px 18px;font-size:13px;">Got it</button>';
  document.body.appendChild(banner);
  document.getElementById('cookie-accept').addEventListener('click', function() {
    localStorage.setItem('cookie-consent', '1');
    banner.classList.add('hidden');
    setTimeout(function() { banner.remove(); }, 300);
  });
})();
