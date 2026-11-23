/* =========================================================
   Dera Crunch: home page behaviour
   Plain JavaScript, no frameworks, no build step.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Data: 8 items in 3 categories ---------- */

  var CATEGORIES = [
    { id: 'Chicken', art: 'art-chicken' },
    { id: 'Burgers', art: 'art-burgers' },
    { id: 'Sides and Drinks', art: 'art-sides' }
  ];

  var MENU = [
    { id: 'dera-drumsticks', cat: 'Chicken', icon: 'drumstick', price: 690, tag: 'Crowd fave',
      name: 'Crispy Dera Drumsticks', desc: 'Two golden drumsticks in our masala crumb. Pure crunch, pure maza.' },
    { id: 'zesty-strips', cat: 'Chicken', icon: 'strips', price: 540,
      name: 'Zesty Crunch Strips', desc: 'Five tender strips with a cheeky garlic-mayo dip on the side.' },
    { id: 'chatpata-wings', cat: 'Chicken', icon: 'chilli', price: 750, tag: 'Spicy',
      name: 'Chatpata Wings Box', desc: 'Eight tangy, spicy wings that make you say "bas ek aur!"' },
    { id: 'crunch-burger', cat: 'Burgers', icon: 'burger', price: 590,
      name: 'Dera Crunch Burger', desc: 'Crispy fillet, crunchy lettuce and creamy house sauce in a soft bun.' },
    { id: 'double-mazay', cat: 'Burgers', icon: 'burger', price: 1290, tag: 'Big bhook',
      name: 'Double Mazay Burger', desc: 'Two crunchy fillets, double cheese, extra sauce. Bhook ka pakka ilaaj.' },
    { id: 'masala-fries', cat: 'Sides and Drinks', icon: 'fries', price: 320,
      name: 'Masala Fries', desc: 'Crispy fries tossed in chatpata masala. Sharing is optional.' },
    { id: 'creamy-coleslaw', cat: 'Sides and Drinks', icon: 'bowl', price: 220,
      name: 'Creamy Coleslaw', desc: 'Cool, crunchy and creamy: the perfect thanda partner.' },
    { id: 'mint-lemonade', cat: 'Sides and Drinks', icon: 'cup', price: 280,
      name: 'Thandi Mint Lemonade', desc: 'Fresh lemon and pudina, shaken over lots of ice.' }
  ];

  var SPICE_LEVELS = [
    { level: 1, name: 'Mild', hint: 'Halka sa',
      comment: 'Nani approved! Itna halka ke bachay bhi double plate maangen.' },
    { level: 2, name: 'Medium', hint: 'Thora tez',
      comment: 'Aankhon mein halki si nami, dil mein poora maza. Perfect balance, boss!' },
    { level: 3, name: 'Dera Fire', hint: 'Full tez!',
      comment: 'Paani ka jug pehle se mangwa lo. Kaanon se dhuaan nikle toh hum zimmedar nahi!' }
  ];

  var TRACKER_STEPS = [
    { label: 'Order received', msg: 'Order mil gaya! Kitchen mein khushi ki lehar daur gayi.' },
    { label: 'Frying', msg: 'Chicken garma garam tel mein, crunch ban raha hai. Khushboo yahan tak aa rahi hai!' },
    { label: 'Packed', msg: 'Dabba pack, extra sauce bhi rakh di. Bas nikalne wale hain!' },
    { label: 'On the way', msg: 'Rider raste mein hai. Plate aur bhook dono ready rakhein!' }
  ];
  var TRACKER_STEP_MS = 3500;

  var byId = {};
  MENU.forEach(function (item) { byId[item.id] = item; });

  /* ---------- Helpers ---------- */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // Rs. 1,290 style: Rs. prefix, comma separators, no decimals
  function formatRs(amount) {
    var whole = Math.round(Number(amount) || 0);
    //   is a non-breaking space: it looks like "Rs. 1,290" but never splits across lines
    return 'Rs. ' + String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // 23 Nov 2026 style
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function formatDate(d) {
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function icon(name) {
    return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }

  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

  /* ---------- Phone validation (exactly 11 digits) ---------- */

  function phoneError(raw) {
    var value = raw.trim();
    if (!value) return 'Please enter your phone number.';
    if (/[^\d\s-]/.test(value)) return 'Use digits only, like 03XX-XXXXXXX.';
    var digits = value.replace(/\D/g, '');
    if (digits.length !== 11) {
      return 'Phone number must be exactly 11 digits. You entered ' + digits.length + '.';
    }
    return '';
  }

  // Show a valid number in the house format 03XX-XXXXXXX
  function formatPhone(raw) {
    var digits = raw.replace(/\D/g, '');
    return digits.slice(0, 4) + '-' + digits.slice(4);
  }

  function setFieldError(input, message) {
    var errEl = document.getElementById(input.id + '-err');
    if (errEl) errEl.textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  // Live feedback for every phone field
  $$('[data-phone]').forEach(function (input) {
    input.addEventListener('blur', function () {
      if (!input.value.trim()) return;
      var msg = phoneError(input.value);
      setFieldError(input, msg);
      if (!msg) input.value = formatPhone(input.value);
    });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true' && !phoneError(input.value)) {
        setFieldError(input, '');
      }
    });
  });

  // Clear a required-field error as soon as the user types something
  $$('form .input:not([data-phone])').forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true' && input.value.trim()) setFieldError(input, '');
      refreshAlert(input.form);
    });
  });
  $$('[data-phone]').forEach(function (input) {
    input.addEventListener('input', function () { refreshAlert(input.form); });
  });

  function refreshAlert(form) {
    var alertEl = form && $('.form-alert', form);
    if (alertEl && alertEl.textContent && !$('.input[aria-invalid="true"]', form)) alertEl.textContent = '';
  }

  // Validates required fields + phone. Returns true if all good.
  function validateForm(form) {
    var firstBad = null;
    $$('.input', form).forEach(function (input) {
      var msg = '';
      if (input.hasAttribute('data-phone')) {
        msg = phoneError(input.value);
      } else if (input.required && !input.value.trim()) {
        var label = form.querySelector('label[for="' + input.id + '"]');
        var labelText = label ? label.firstChild.textContent.trim() : 'This field';
        msg = labelText + ' is required. Please fill it in.';
      }
      setFieldError(input, msg);
      if (msg && !firstBad) firstBad = input;
    });
    var alertEl = $('.form-alert', form);
    var badCount = $$('.input[aria-invalid="true"]', form).length;
    if (alertEl) {
      alertEl.textContent = badCount
        ? 'Oho! Please fix ' + plural(badCount, 'field') + ' below, then try again.'
        : '';
    }
    if (firstBad) {
      firstBad.focus();
      return false;
    }
    var phone = $('[data-phone]', form);
    if (phone) phone.value = formatPhone(phone.value);
    return true;
  }

  /* ---------- Menu: tabs + cards ---------- */

  var filterBar = $('#filter-bar');
  var menuGrid = $('#menu-grid');
  var menuStatus = $('#menu-status');

  var artFor = {};
  CATEGORIES.forEach(function (c) { artFor[c.id] = c.art; });

  var filters = [{ id: 'All', count: MENU.length }].concat(CATEGORIES.map(function (c) {
    return { id: c.id, count: MENU.filter(function (m) { return m.cat === c.id; }).length };
  }));

  filterBar.innerHTML = filters.map(function (f, i) {
    return '<button type="button" class="filter-btn" data-filter="' + f.id + '" aria-pressed="' + (i === 0) + '">' +
      f.id + ' <span class="filter-count" aria-hidden="true">' + f.count + '</span></button>';
  }).join('');

  function renderMenu(filter) {
    var items = MENU.filter(function (m) { return filter === 'All' || m.cat === filter; });
    menuGrid.innerHTML = items.map(function (m, i) {
      return '<article class="menu-card" style="animation-delay:' + (i * 55) + 'ms">' +
        '<div class="menu-art ' + artFor[m.cat] + '">' +
          (m.tag ? '<span class="menu-tag">' + m.tag + '</span>' : '') +
          icon(m.icon) +
        '</div>' +
        '<div class="menu-body">' +
          '<span class="menu-cat">' + m.cat + '</span>' +
          '<h3>' + m.name + '</h3>' +
          '<p class="menu-desc">' + m.desc + '</p>' +
          '<div class="menu-foot">' +
            '<span class="price">' + formatRs(m.price) + '</span>' +
            '<button type="button" class="add-btn" data-add="' + m.id + '" aria-label="Add ' + m.name + ' to cart">+ Add</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
    menuStatus.textContent = 'Showing ' + plural(items.length, 'item') + (filter === 'All' ? '' : ' in ' + filter) + '.';
  }

  filterBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn', filterBar).forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === btn));
    });
    renderMenu(btn.getAttribute('data-filter'));
  });

  menuGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn) return;
    var item = byId[btn.getAttribute('data-add')];
    addToCart({ key: item.id, name: item.name, detail: item.cat, price: item.price, icon: item.icon });
    btn.classList.add('is-added');
    btn.textContent = 'Added!';
    clearTimeout(btn._t);
    btn._t = setTimeout(function () {
      btn.classList.remove('is-added');
      btn.textContent = '+ Add';
    }, 1200);
  });

  renderMenu('All');

  /* ---------- Cart ---------- */

  var STORAGE_KEY = 'deraCrunchCart.v2';
  var cart = loadCart();

  var cartPanel = $('#cart-panel');
  var cartOverlay = $('#cart-overlay');
  var cartToggle = $('#cart-toggle');
  var cartClose = $('#cart-close');
  var cartList = $('#cart-list');
  var cartEmpty = $('#cart-empty');
  var cartCount = $('#cart-count');
  var cartItemsLabel = $('#cart-items-label');
  var cartTotal = $('#cart-total');
  var cartFoot = $('#cart-foot');
  var cartView = $('#cart-view');
  var checkoutForm = $('#checkout-form');
  var placeOrder = $('#place-order');
  var orderDone = $('#order-done');

  function loadCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (l) {
        return l && typeof l.key === 'string' && typeof l.name === 'string' &&
          isFinite(l.price) && l.price >= 0 && isFinite(l.qty) && l.qty > 0;
      }).map(function (l) {
        return { key: l.key, name: l.name, detail: String(l.detail || ''), price: Math.round(l.price),
          qty: Math.min(99, Math.floor(l.qty)), icon: String(l.icon || 'drumstick') };
      });
    } catch (err) {
      return [];
    }
  }

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (err) { /* private mode: fine */ }
  }

  function cartQty() { return cart.reduce(function (s, l) { return s + l.qty; }, 0); }
  function cartSum() { return cart.reduce(function (s, l) { return s + l.price * l.qty; }, 0); }

  function addToCart(line) {
    var existing = cart.filter(function (l) { return l.key === line.key; })[0];
    if (existing) existing.qty = Math.min(99, existing.qty + 1);
    else cart.push({ key: line.key, name: line.name, detail: line.detail, price: line.price, qty: 1, icon: line.icon });
    saveCart();
    renderCart();
    bumpBadge();
    showToast(line.name + ' added. Maza aa gaya!');
  }

  function changeQty(key, delta) {
    cart = cart.map(function (l) {
      if (l.key === key) l.qty = Math.min(99, l.qty + delta);
      return l;
    }).filter(function (l) { return l.qty > 0; });
    saveCart();
    renderCart();
  }

  function removeLine(key) {
    cart = cart.filter(function (l) { return l.key !== key; });
    saveCart();
    renderCart();
  }

  function renderCart() {
    var qty = cartQty();
    var total = cartSum();

    cartList.innerHTML = '';
    cart.forEach(function (l) {
      var li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML =
        '<span class="cart-thumb" aria-hidden="true">' + icon(l.icon) + '</span>' +
        '<div><p class="cart-item-name"></p><p class="cart-item-detail"></p></div>' +
        '<span class="cart-line-total">' + formatRs(l.price * l.qty) + '</span>' +
        '<div class="cart-item-actions">' +
          '<div class="qty">' +
            '<button type="button" class="qty-btn" data-qty="-1">&minus;</button>' +
            '<span class="qty-value">' + l.qty + '</span>' +
            '<button type="button" class="qty-btn" data-qty="1">+</button>' +
          '</div>' +
          '<button type="button" class="link-btn" data-remove>Remove</button>' +
        '</div>';
      // Names come from data but use textContent anyway
      $('.cart-item-name', li).textContent = l.name;
      $('.cart-item-detail', li).textContent = l.detail + ' · ' + formatRs(l.price) + ' each';
      $('[data-qty="-1"]', li).setAttribute('aria-label', 'One less ' + l.name);
      $('[data-qty="1"]', li).setAttribute('aria-label', 'One more ' + l.name);
      $('[data-remove]', li).setAttribute('aria-label', 'Remove ' + l.name);
      li.setAttribute('data-key', l.key);
      cartList.appendChild(li);
    });

    var empty = cart.length === 0;
    cartEmpty.hidden = !empty;
    checkoutForm.hidden = empty;
    placeOrder.disabled = empty;
    placeOrder.textContent = empty ? 'Place order' : 'Place order · ' + formatRs(total);

    cartTotal.textContent = formatRs(total);
    cartCount.textContent = String(qty);
    cartCount.setAttribute('aria-label', plural(qty, 'item'));
    cartItemsLabel.textContent = '(' + plural(qty, 'item') + ')';
  }

  cartList.addEventListener('click', function (e) {
    var li = e.target.closest('.cart-item');
    if (!li) return;
    var key = li.getAttribute('data-key');
    var qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      changeQty(key, Number(qtyBtn.getAttribute('data-qty')));
      // Keep keyboard focus on the same control after re-render
      var again = cartList.querySelector('[data-key="' + CSS.escape(key) + '"] [data-qty="' + qtyBtn.getAttribute('data-qty') + '"]');
      (again || cartClose).focus();
    } else if (e.target.closest('[data-remove]')) {
      removeLine(key);
      cartClose.focus();
    }
  });

  function bumpBadge() {
    cartCount.classList.remove('bump');
    void cartCount.offsetWidth; // restart animation
    cartCount.classList.add('bump');
  }

  /* ---------- Drawer open / close with focus trap ---------- */

  var lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    // Keep showing the live tracker until the user starts a new cart
    showOrderView(trackerActive && cart.length === 0);
    cartPanel.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    hideToast();
    setTimeout(function () { cartClose.focus(); }, 60);
  }

  function closeCart() {
    cartPanel.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function isOpen() { return cartPanel.classList.contains('is-open'); }

  cartToggle.addEventListener('click', function () { isOpen() ? closeCart() : openCart(); });
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  $('#empty-browse').addEventListener('click', function () { lastFocus = null; closeCart(); });
  $('#order-again').addEventListener('click', function () {
    lastFocus = null;
    closeCart();
    location.hash = '#menu';
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { closeCart(); return; }
    if (e.key !== 'Tab') return;
    var focusable = $$('button, a[href], input, textarea, [tabindex="0"]', cartPanel).filter(function (el) {
      return !el.disabled && el.offsetParent !== null;
    });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Checkout ---------- */

  function showOrderView(done) {
    orderDone.hidden = !done;
    cartView.hidden = done;
    cartFoot.hidden = done;
  }

  checkoutForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!cart.length) return;
    if (!validateForm(checkoutForm)) return;

    var name = $('#o-name').value.trim();
    var phone = $('#o-phone').value;
    var orderNo = 'DC-' + String(Math.floor(1000 + Math.random() * 9000));
    var total = cartSum();

    $('#order-thanks').textContent = 'Shukriya, ' + name + '! Your crunchy order is in.';
    $('#order-meta').textContent = 'Order ' + orderNo + ' · ' + formatDate(new Date()) + ' · ' +
      formatRs(total) + ' · We\'ll call ' + phone;

    cart = [];
    saveCart();
    renderCart();
    checkoutForm.reset();
    showOrderView(true);
    $('#cart-scroll').scrollTop = 0;
    orderDone.focus();
    startTracker();
  });

  /* ---------- Live order tracker ---------- */

  var trackerActive = false;
  var trackerTimer = null;
  var tracker = $('#tracker');
  var trackerFill = $('#tracker-fill');
  var trackerBar = $('#tracker-bar');
  var trackerStatus = $('#tracker-status');
  var trackerMsg = $('#tracker-msg');
  var trackerItems = $$('#tracker-steps li');

  function showTrackerStep(i) {
    var step = TRACKER_STEPS[i];
    var pct = Math.round((i / (TRACKER_STEPS.length - 1)) * 100);
    // Leave a sliver visible on the first step so the bar reads as "started"
    trackerFill.style.width = Math.max(pct, 6) + '%';
    trackerBar.setAttribute('aria-valuenow', String(pct));
    trackerBar.setAttribute('aria-valuetext', 'Step ' + (i + 1) + ' of ' + TRACKER_STEPS.length + ': ' + step.label);
    trackerStatus.textContent = step.label;
    trackerItems.forEach(function (li, n) {
      li.classList.toggle('is-done', n < i);
      li.classList.toggle('is-current', n === i);
      if (n === i) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    trackerMsg.innerHTML = '';
    var strong = document.createElement('strong');
    strong.textContent = step.label + ': ';
    trackerMsg.appendChild(strong);
    trackerMsg.appendChild(document.createTextNode(step.msg));
    tracker.classList.toggle('is-done', i === TRACKER_STEPS.length - 1);
  }

  function startTracker() {
    clearTimeout(trackerTimer);
    trackerActive = true;
    var i = 0;
    showTrackerStep(0);
    (function next() {
      if (i >= TRACKER_STEPS.length - 1) return;
      trackerTimer = setTimeout(function () {
        i += 1;
        showTrackerStep(i);
        next();
      }, TRACKER_STEP_MS);
    })();
  }

  /* ---------- Toast ---------- */

  var toast = $('#toast');
  var toastMsg = $('#toast-msg');
  var toastTimer;

  function showToast(msg) {
    if (isOpen()) return;
    toastMsg.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 3200);
  }
  function hideToast() { toast.classList.remove('is-visible'); }
  $('#toast-view').addEventListener('click', openCart);

  /* ---------- Build Your Combo ---------- */

  var mains = MENU.filter(function (m) { return m.cat === 'Chicken' || m.cat === 'Burgers'; });
  var sides = [byId['masala-fries'], byId['creamy-coleslaw']];
  var drinks = [byId['mint-lemonade'], { id: 'no-drink', name: 'No drink, shukriya', price: 0, icon: 'cup' }];

  function choiceHtml(group, item, checked) {
    return '<label class="choice">' +
      '<input type="radio" name="' + group + '" value="' + item.id + '"' + (checked ? ' checked' : '') + '>' +
      '<span class="choice-card">' + icon(item.icon) +
        '<span class="choice-name">' + item.name + '</span>' +
        '<span class="choice-price">' + (item.price ? formatRs(item.price) : 'Free') + '</span>' +
      '</span></label>';
  }

  $('#combo-main').innerHTML = mains.map(function (m, i) { return choiceHtml('main', m, i === 0); }).join('');
  $('#combo-side').innerHTML = sides.map(function (m, i) { return choiceHtml('side', m, i === 0); }).join('');
  $('#combo-drink').innerHTML = drinks.map(function (m, i) { return choiceHtml('drink', m, i === 0); }).join('');
  $('#combo-spice').innerHTML = SPICE_LEVELS.map(function (s) {
    var chillies = '';
    for (var i = 0; i < s.level; i++) chillies += icon('chilli');
    return '<label class="choice">' +
      '<input type="radio" name="spice" value="' + s.level + '"' + (s.level === 2 ? ' checked' : '') + '>' +
      '<span class="choice-card spice-card"><span class="spice-icons">' + chillies + '</span>' +
        '<span class="choice-name">' + s.name + '</span>' +
        '<span class="spice-hint">' + s.hint + '</span>' +
      '</span></label>';
  }).join('');

  var comboForm = $('#combo-form');
  var allChoices = {};
  mains.concat(sides, drinks).forEach(function (m) { allChoices[m.id] = m; });

  function currentCombo() {
    var get = function (name) { return $('input[name="' + name + '"]:checked', comboForm).value; };
    var spiceLevel = Number(get('spice'));
    var combo = {
      main: allChoices[get('main')],
      side: allChoices[get('side')],
      drink: allChoices[get('drink')],
      spice: SPICE_LEVELS.filter(function (s) { return s.level === spiceLevel; })[0]
    };
    combo.total = combo.main.price + combo.side.price + combo.drink.price;
    return combo;
  }

  function setSummary(id, item) {
    var el = $(id);
    el.textContent = item.name;
    var small = document.createElement('small');
    small.textContent = item.price ? formatRs(item.price) : 'Free';
    el.appendChild(small);
  }

  function updateCombo() {
    var c = currentCombo();
    setSummary('#sum-main', c.main);
    setSummary('#sum-side', c.side);
    setSummary('#sum-drink', c.drink);
    $('#sum-spice').textContent = c.spice.name + ' (' + c.spice.hint + ')';
    $$('#spice-meter span').forEach(function (seg, i) { seg.classList.toggle('on', i < c.spice.level); });
    $('#combo-total').textContent = formatRs(c.total);
    updateSpiceMeter(c.spice);
  }

  /* ---------- Spice Meter: chillies fill up 1 → 3 ---------- */

  var lastSpice = null;
  function updateSpiceMeter(spice) {
    $$('#chilli-row .icon').forEach(function (ic, i) {
      var full = i < spice.level;
      var wasFull = ic.classList.contains('is-full');
      ic.classList.toggle('is-full', full);
      // Re-trigger the pop only on chillies that just filled up
      if (full && !wasFull && lastSpice !== null) {
        ic.style.animation = 'none';
        void ic.getBoundingClientRect();
        ic.style.animation = '';
      }
    });
    $('#spice-bar-fill').style.width = (spice.level / 3 * 100) + '%';
    var bar = $('#spice-bar');
    bar.setAttribute('aria-valuenow', String(spice.level));
    bar.setAttribute('aria-valuetext', 'Level ' + spice.level + ' of 3, ' + spice.name);
    $('#spice-level-name').textContent = 'Level ' + spice.level + ': ' + spice.name;
    if (lastSpice !== spice.level) $('#spice-comment').textContent = spice.comment;
    lastSpice = spice.level;
  }

  comboForm.addEventListener('change', updateCombo);

  $('#add-combo').addEventListener('click', function () {
    var c = currentCombo();
    var parts = [c.main.name, c.side.name];
    if (c.drink.price) parts.push(c.drink.name);
    addToCart({
      key: 'combo|' + c.main.id + '|' + c.side.id + '|' + c.drink.id + '|' + c.spice.level,
      name: 'My Combo: ' + c.main.name,
      detail: parts.join(' + ') + ' · ' + c.spice.name + ' spice',
      price: c.total,
      icon: c.main.icon
    });
  });

  updateCombo();

  /* ---------- Contact form ---------- */

  var contactForm = $('#contact-form');
  var contactSuccess = $('#contact-success');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    contactSuccess.textContent = '';
    if (!validateForm(contactForm)) return;
    var name = $('#c-name').value.trim();
    contactSuccess.textContent = 'Shukriya, ' + name + '! Message received on ' + formatDate(new Date()) +
      '. We\'ll get back to you soon. Maza aa gaya!';
    contactForm.reset();
  });

  /* ---------- Chef's Pick of the Day (picked from today's date) ---------- */

  (function chefsPick() {
    var today = new Date();
    // Whole days since 1 Jan 1970 in local time, so it changes at local midnight
    var dayNumber = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000);
    var item = MENU[dayNumber % MENU.length];

    $('#pick-name').textContent = item.name;
    $('#pick-desc').textContent = item.desc;
    $('#pick-price').textContent = formatRs(item.price);
    $('#pick-art').innerHTML = icon(item.icon);
    var dateEl = $('#pick-date');
    dateEl.textContent = formatDate(today);
    dateEl.setAttribute('datetime', today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0'));

    var addBtn = $('#pick-add');
    addBtn.setAttribute('aria-label', 'Add ' + item.name + ' to cart');
    addBtn.addEventListener('click', function () {
      addToCart({ key: item.id, name: item.name, detail: item.cat, price: item.price, icon: item.icon });
    });
  })();

  /* ---------- Go ---------- */

  renderCart();

  // about.html links to index.html#cart to open the saved cart straight away
  if (location.hash === '#cart') openCart();
})();
