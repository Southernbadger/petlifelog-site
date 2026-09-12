/* WagNote — THE LAUNCH SWITCH.
   ========================================================================
   TO LAUNCH: change the word false to true on the line below. That one word
   is the whole launch, across all five pages. It is the only edit needed,
   and it is the only place the value lives — index.html reads it from here.

   With it TRUE, every "Join the waitlist" control on the site becomes a
   link to the App Store listing, opening in a new tab:
     · the sticky bar button and the hero nav button on the home page —
       these two read just "Download", because they are small buttons and
       the full label can wrap on a phone
     · the one link in the header of privacy, terms, medical-disclaimer
       and support, reading "Download on the App Store"
     · the main call-to-action button (handled in index.html, which reads
       window.LAUNCHED from this file), where the email box also comes out
       of the row and the line under it becomes "Free to download on the
       App Store."
   and the call-to-action heading changes from "Be the first to know when
   it's ready." to "WagNote is out."

   With it FALSE this file changes nothing whatsoever — it returns before
   touching the page — so the waitlist stays exactly as it is today and
   nothing a visitor can read or click mentions the App Store.

   Loaded by all five pages at the end of <body>, so the DOM it edits is
   already parsed and no DOMContentLoaded wait is needed. If this file ever
   fails to load, window.LAUNCHED is undefined and every page falls back to
   the waitlist — the safe direction.
   ======================================================================== */
window.LAUNCHED = false;

(function () {
  if (!window.LAUNCHED) { return; }   // pre-launch: nothing below ever runs

  var APP_STORE_URL = 'https://apps.apple.com/app/id6783609217';
  var APP_STORE_LABEL = 'Download on the App Store';
  /* The sticky bar and the hero nav are small buttons and neither class sets
     white-space:nowrap, so the full label can wrap to two lines on a phone.
     They take the short word instead. Everywhere with room — the main
     call-to-action and the legal-page links — keeps the full label. */
  var SHORT_LABEL = 'Download';

  /* <button> → <a>, keeping the class it already had so it keeps its look.
     .sb-join and .nav-join are button styles and do not set text-decoration,
     so an <a> wearing them would underline; .lb-join already sets it. */
  function buttonToLink(el, label) {
    var a = document.createElement('a');
    a.className = el.className;
    a.href = APP_STORE_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    a.style.textDecoration = 'none';
    el.parentNode.replaceChild(a, el);
  }

  /* 1 — home page: the sticky bar and the hero nav. Both are buttons that
         scrolled to the call-to-action; they become links off the site. */
  var sb = document.querySelector('.sb-join');
  if (sb) { buttonToLink(sb, SHORT_LABEL); }
  var nav = document.querySelector('.nav-join');
  if (nav) { buttonToLink(nav, SHORT_LABEL); }

  /* 2 — privacy / terms / medical-disclaimer / support: already an <a>
         pointing at /#cta, so it only needs retargeting and relabelling. */
  var lb = document.querySelector('.lb-join');
  if (lb) {
    lb.href = APP_STORE_URL;
    lb.target = '_blank';
    lb.rel = 'noopener';
    lb.textContent = APP_STORE_LABEL;
  }

  /* 3 — home page: the call-to-action heading. */
  var h = document.querySelector('.cta-sec h2');
  if (h) { h.textContent = 'WagNote is out.'; }
})();
