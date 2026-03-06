// Scroll Lock Diagnostic Script
// Add this to your page to diagnose what's blocking scroll
// Usage: Copy this to browser console or add <script src="/debug-scroll.js"></script> to layout

(function() {
  console.log('🔍 SCROLL LOCK DIAGNOSTIC STARTING...\n');

  function checkScrollLock() {
    const results = {
      timestamp: new Date().toISOString(),
      canScroll: false,
      blockers: []
    };

    // Check body overflow
    const bodyOverflow = window.getComputedStyle(document.body).overflow;
    const bodyOverflowY = window.getComputedStyle(document.body).overflowY;
    if (bodyOverflow === 'hidden' || bodyOverflowY === 'hidden') {
      results.blockers.push({
        element: 'body',
        property: 'overflow',
        value: bodyOverflow,
        inline: document.body.style.overflow
      });
    }

    // Check html overflow
    const htmlOverflow = window.getComputedStyle(document.documentElement).overflow;
    const htmlOverflowY = window.getComputedStyle(document.documentElement).overflowY;
    if (htmlOverflow === 'hidden' || htmlOverflowY === 'hidden') {
      results.blockers.push({
        element: 'html',
        property: 'overflow',
        value: htmlOverflow,
        inline: document.documentElement.style.overflow
      });
    }

    // Check body touch-action
    const bodyTouchAction = window.getComputedStyle(document.body).touchAction;
    if (bodyTouchAction === 'none') {
      results.blockers.push({
        element: 'body',
        property: 'touch-action',
        value: bodyTouchAction
      });
    }

    // Check html touch-action
    const htmlTouchAction = window.getComputedStyle(document.documentElement).touchAction;
    if (htmlTouchAction === 'none') {
      results.blockers.push({
        element: 'html',
        property: 'touch-action',
        value: htmlTouchAction
      });
    }

    // Check for fixed position elements covering the page
    const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' &&
             parseInt(style.zIndex) > 100 &&
             style.pointerEvents !== 'none';
    });

    if (fixedElements.length > 0) {
      results.blockers.push({
        element: 'fixed-elements',
        count: fixedElements.length,
        elements: fixedElements.map(el => ({
          tag: el.tagName,
          class: el.className,
          zIndex: window.getComputedStyle(el).zIndex,
          pointerEvents: window.getComputedStyle(el).pointerEvents
        }))
      });
    }

    // Check for elements with touch-action: none
    const touchNoneElements = Array.from(document.querySelectorAll('*')).filter(el => {
      return window.getComputedStyle(el).touchAction === 'none';
    });

    if (touchNoneElements.length > 0) {
      results.blockers.push({
        element: 'touch-action-none-elements',
        count: touchNoneElements.length,
        elements: touchNoneElements.map(el => ({
          tag: el.tagName,
          class: el.className,
          id: el.id
        }))
      });
    }

    // Check document height vs viewport
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    results.scrollable = scrollHeight > clientHeight;
    results.scrollHeight = scrollHeight;
    results.clientHeight = clientHeight;

    // Check current scroll position
    results.scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Determine if can scroll
    results.canScroll = results.scrollable && results.blockers.length === 0;

    return results;
  }

  // Run diagnostic
  const diagnosis = checkScrollLock();

  console.log('📊 DIAGNOSTIC RESULTS:\n');
  console.log('Can Scroll:', diagnosis.canScroll ? '✅ YES' : '❌ NO');
  console.log('Scrollable Content:', diagnosis.scrollable ? '✅ YES' : '❌ NO');
  console.log('Scroll Height:', diagnosis.scrollHeight);
  console.log('Client Height:', diagnosis.clientHeight);
  console.log('Current Scroll Position:', diagnosis.scrollTop);
  console.log('\n🚫 BLOCKERS FOUND:', diagnosis.blockers.length);

  if (diagnosis.blockers.length > 0) {
    console.log('\n⚠️ SCROLL BLOCKERS DETECTED:\n');
    diagnosis.blockers.forEach((blocker, index) => {
      console.log(`\nBlocker #${index + 1}:`);
      console.log('  Element:', blocker.element);
      console.log('  Details:', blocker);
    });

    console.log('\n🔧 RECOMMENDED FIXES:\n');
    diagnosis.blockers.forEach((blocker, index) => {
      if (blocker.element === 'body' && blocker.property === 'overflow') {
        console.log(`${index + 1}. Body overflow is hidden. Run:`);
        console.log('   document.body.style.removeProperty("overflow")');
      }
      if (blocker.element === 'html' && blocker.property === 'overflow') {
        console.log(`${index + 1}. HTML overflow is hidden. Run:`);
        console.log('   document.documentElement.style.removeProperty("overflow")');
      }
      if (blocker.property === 'touch-action') {
        console.log(`${index + 1}. ${blocker.element} has touch-action: none`);
      }
    });

    console.log('\n🚀 QUICK FIX (run this):');
    console.log('document.body.style.removeProperty("overflow");');
    console.log('document.documentElement.style.removeProperty("overflow");');
    console.log('window.scrollTo(0, 1);');
  } else {
    console.log('\n✅ No blockers detected! Scroll should work.');
  }

  // Monitor for changes
  let checkInterval = setInterval(() => {
    const newDiagnosis = checkScrollLock();
    const blockersChanged = newDiagnosis.blockers.length !== diagnosis.blockers.length;

    if (blockersChanged) {
      console.log('\n⚡ SCROLL STATE CHANGED!');
      console.log('New blockers count:', newDiagnosis.blockers.length);
      console.log('Can scroll now:', newDiagnosis.canScroll ? '✅ YES' : '❌ NO');

      if (newDiagnosis.blockers.length > 0) {
        console.log('New blockers:', newDiagnosis.blockers);
      }
    }
  }, 1000);

  // Stop monitoring after 30 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    console.log('\n🛑 Diagnostic monitoring stopped (30s elapsed)');
  }, 30000);

  // Return diagnosis object for inspection
  window.__scrollDiagnosis = diagnosis;
  console.log('\n💡 TIP: Access full diagnosis data via window.__scrollDiagnosis');

})();
