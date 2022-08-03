(function (factory) {
    typeof define === 'function' && define.amd ? define('main', factory) :
    factory();
})((function () { 'use strict';

    /**
     * SSR Window 4.0.2
     * Better handling for window object in SSR environment
     * https://github.com/nolimits4web/ssr-window
     *
     * Copyright 2021, Vladimir Kharlampidi
     *
     * Licensed under MIT
     *
     * Released on: December 13, 2021
     */

    /* eslint-disable no-param-reassign */
    function isObject$1(obj) {
      return obj !== null && typeof obj === 'object' && 'constructor' in obj && obj.constructor === Object;
    }

    function extend$1(target = {}, src = {}) {
      Object.keys(src).forEach(key => {
        if (typeof target[key] === 'undefined') target[key] = src[key];else if (isObject$1(src[key]) && isObject$1(target[key]) && Object.keys(src[key]).length > 0) {
          extend$1(target[key], src[key]);
        }
      });
    }

    const ssrDocument = {
      body: {},

      addEventListener() {},

      removeEventListener() {},

      activeElement: {
        blur() {},

        nodeName: ''
      },

      querySelector() {
        return null;
      },

      querySelectorAll() {
        return [];
      },

      getElementById() {
        return null;
      },

      createEvent() {
        return {
          initEvent() {}

        };
      },

      createElement() {
        return {
          children: [],
          childNodes: [],
          style: {},

          setAttribute() {},

          getElementsByTagName() {
            return [];
          }

        };
      },

      createElementNS() {
        return {};
      },

      importNode() {
        return null;
      },

      location: {
        hash: '',
        host: '',
        hostname: '',
        href: '',
        origin: '',
        pathname: '',
        protocol: '',
        search: ''
      }
    };

    function getDocument() {
      const doc = typeof document !== 'undefined' ? document : {};
      extend$1(doc, ssrDocument);
      return doc;
    }

    const ssrWindow = {
      document: ssrDocument,
      navigator: {
        userAgent: ''
      },
      location: {
        hash: '',
        host: '',
        hostname: '',
        href: '',
        origin: '',
        pathname: '',
        protocol: '',
        search: ''
      },
      history: {
        replaceState() {},

        pushState() {},

        go() {},

        back() {}

      },
      CustomEvent: function CustomEvent() {
        return this;
      },

      addEventListener() {},

      removeEventListener() {},

      getComputedStyle() {
        return {
          getPropertyValue() {
            return '';
          }

        };
      },

      Image() {},

      Date() {},

      screen: {},

      setTimeout() {},

      clearTimeout() {},

      matchMedia() {
        return {};
      },

      requestAnimationFrame(callback) {
        if (typeof setTimeout === 'undefined') {
          callback();
          return null;
        }

        return setTimeout(callback, 0);
      },

      cancelAnimationFrame(id) {
        if (typeof setTimeout === 'undefined') {
          return;
        }

        clearTimeout(id);
      }

    };

    function getWindow() {
      const win = typeof window !== 'undefined' ? window : {};
      extend$1(win, ssrWindow);
      return win;
    }

    /**
     * Dom7 4.0.4
     * Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API
     * https://framework7.io/docs/dom7.html
     *
     * Copyright 2022, Vladimir Kharlampidi
     *
     * Licensed under MIT
     *
     * Released on: January 11, 2022
     */
    /* eslint-disable no-proto */

    function makeReactive(obj) {
      const proto = obj.__proto__;
      Object.defineProperty(obj, '__proto__', {
        get() {
          return proto;
        },

        set(value) {
          proto.__proto__ = value;
        }

      });
    }

    class Dom7 extends Array {
      constructor(items) {
        if (typeof items === 'number') {
          super(items);
        } else {
          super(...(items || []));
          makeReactive(this);
        }
      }

    }

    function arrayFlat(arr = []) {
      const res = [];
      arr.forEach(el => {
        if (Array.isArray(el)) {
          res.push(...arrayFlat(el));
        } else {
          res.push(el);
        }
      });
      return res;
    }

    function arrayFilter(arr, callback) {
      return Array.prototype.filter.call(arr, callback);
    }

    function arrayUnique(arr) {
      const uniqueArray = [];

      for (let i = 0; i < arr.length; i += 1) {
        if (uniqueArray.indexOf(arr[i]) === -1) uniqueArray.push(arr[i]);
      }

      return uniqueArray;
    }


    function qsa(selector, context) {
      if (typeof selector !== 'string') {
        return [selector];
      }

      const a = [];
      const res = context.querySelectorAll(selector);

      for (let i = 0; i < res.length; i += 1) {
        a.push(res[i]);
      }

      return a;
    }

    function $$1(selector, context) {
      const window = getWindow();
      const document = getDocument();
      let arr = [];

      if (!context && selector instanceof Dom7) {
        return selector;
      }

      if (!selector) {
        return new Dom7(arr);
      }

      if (typeof selector === 'string') {
        const html = selector.trim();

        if (html.indexOf('<') >= 0 && html.indexOf('>') >= 0) {
          let toCreate = 'div';
          if (html.indexOf('<li') === 0) toCreate = 'ul';
          if (html.indexOf('<tr') === 0) toCreate = 'tbody';
          if (html.indexOf('<td') === 0 || html.indexOf('<th') === 0) toCreate = 'tr';
          if (html.indexOf('<tbody') === 0) toCreate = 'table';
          if (html.indexOf('<option') === 0) toCreate = 'select';
          const tempParent = document.createElement(toCreate);
          tempParent.innerHTML = html;

          for (let i = 0; i < tempParent.childNodes.length; i += 1) {
            arr.push(tempParent.childNodes[i]);
          }
        } else {
          arr = qsa(selector.trim(), context || document);
        } // arr = qsa(selector, document);

      } else if (selector.nodeType || selector === window || selector === document) {
        arr.push(selector);
      } else if (Array.isArray(selector)) {
        if (selector instanceof Dom7) return selector;
        arr = selector;
      }

      return new Dom7(arrayUnique(arr));
    }

    $$1.fn = Dom7.prototype; // eslint-disable-next-line

    function addClass(...classes) {
      const classNames = arrayFlat(classes.map(c => c.split(' ')));
      this.forEach(el => {
        el.classList.add(...classNames);
      });
      return this;
    }

    function removeClass(...classes) {
      const classNames = arrayFlat(classes.map(c => c.split(' ')));
      this.forEach(el => {
        el.classList.remove(...classNames);
      });
      return this;
    }

    function toggleClass(...classes) {
      const classNames = arrayFlat(classes.map(c => c.split(' ')));
      this.forEach(el => {
        classNames.forEach(className => {
          el.classList.toggle(className);
        });
      });
    }

    function hasClass(...classes) {
      const classNames = arrayFlat(classes.map(c => c.split(' ')));
      return arrayFilter(this, el => {
        return classNames.filter(className => el.classList.contains(className)).length > 0;
      }).length > 0;
    }

    function attr(attrs, value) {
      if (arguments.length === 1 && typeof attrs === 'string') {
        // Get attr
        if (this[0]) return this[0].getAttribute(attrs);
        return undefined;
      } // Set attrs


      for (let i = 0; i < this.length; i += 1) {
        if (arguments.length === 2) {
          // String
          this[i].setAttribute(attrs, value);
        } else {
          // Object
          for (const attrName in attrs) {
            this[i][attrName] = attrs[attrName];
            this[i].setAttribute(attrName, attrs[attrName]);
          }
        }
      }

      return this;
    }

    function removeAttr(attr) {
      for (let i = 0; i < this.length; i += 1) {
        this[i].removeAttribute(attr);
      }

      return this;
    }

    function transform(transform) {
      for (let i = 0; i < this.length; i += 1) {
        this[i].style.transform = transform;
      }

      return this;
    }

    function transition$1(duration) {
      for (let i = 0; i < this.length; i += 1) {
        this[i].style.transitionDuration = typeof duration !== 'string' ? `${duration}ms` : duration;
      }

      return this;
    }

    function on(...args) {
      let [eventType, targetSelector, listener, capture] = args;

      if (typeof args[1] === 'function') {
        [eventType, listener, capture] = args;
        targetSelector = undefined;
      }

      if (!capture) capture = false;

      function handleLiveEvent(e) {
        const target = e.target;
        if (!target) return;
        const eventData = e.target.dom7EventData || [];

        if (eventData.indexOf(e) < 0) {
          eventData.unshift(e);
        }

        if ($$1(target).is(targetSelector)) listener.apply(target, eventData);else {
          const parents = $$1(target).parents(); // eslint-disable-line

          for (let k = 0; k < parents.length; k += 1) {
            if ($$1(parents[k]).is(targetSelector)) listener.apply(parents[k], eventData);
          }
        }
      }

      function handleEvent(e) {
        const eventData = e && e.target ? e.target.dom7EventData || [] : [];

        if (eventData.indexOf(e) < 0) {
          eventData.unshift(e);
        }

        listener.apply(this, eventData);
      }

      const events = eventType.split(' ');
      let j;

      for (let i = 0; i < this.length; i += 1) {
        const el = this[i];

        if (!targetSelector) {
          for (j = 0; j < events.length; j += 1) {
            const event = events[j];
            if (!el.dom7Listeners) el.dom7Listeners = {};
            if (!el.dom7Listeners[event]) el.dom7Listeners[event] = [];
            el.dom7Listeners[event].push({
              listener,
              proxyListener: handleEvent
            });
            el.addEventListener(event, handleEvent, capture);
          }
        } else {
          // Live events
          for (j = 0; j < events.length; j += 1) {
            const event = events[j];
            if (!el.dom7LiveListeners) el.dom7LiveListeners = {};
            if (!el.dom7LiveListeners[event]) el.dom7LiveListeners[event] = [];
            el.dom7LiveListeners[event].push({
              listener,
              proxyListener: handleLiveEvent
            });
            el.addEventListener(event, handleLiveEvent, capture);
          }
        }
      }

      return this;
    }

    function off(...args) {
      let [eventType, targetSelector, listener, capture] = args;

      if (typeof args[1] === 'function') {
        [eventType, listener, capture] = args;
        targetSelector = undefined;
      }

      if (!capture) capture = false;
      const events = eventType.split(' ');

      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];

        for (let j = 0; j < this.length; j += 1) {
          const el = this[j];
          let handlers;

          if (!targetSelector && el.dom7Listeners) {
            handlers = el.dom7Listeners[event];
          } else if (targetSelector && el.dom7LiveListeners) {
            handlers = el.dom7LiveListeners[event];
          }

          if (handlers && handlers.length) {
            for (let k = handlers.length - 1; k >= 0; k -= 1) {
              const handler = handlers[k];

              if (listener && handler.listener === listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              } else if (listener && handler.listener && handler.listener.dom7proxy && handler.listener.dom7proxy === listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              } else if (!listener) {
                el.removeEventListener(event, handler.proxyListener, capture);
                handlers.splice(k, 1);
              }
            }
          }
        }
      }

      return this;
    }

    function trigger(...args) {
      const window = getWindow();
      const events = args[0].split(' ');
      const eventData = args[1];

      for (let i = 0; i < events.length; i += 1) {
        const event = events[i];

        for (let j = 0; j < this.length; j += 1) {
          const el = this[j];

          if (window.CustomEvent) {
            const evt = new window.CustomEvent(event, {
              detail: eventData,
              bubbles: true,
              cancelable: true
            });
            el.dom7EventData = args.filter((data, dataIndex) => dataIndex > 0);
            el.dispatchEvent(evt);
            el.dom7EventData = [];
            delete el.dom7EventData;
          }
        }
      }

      return this;
    }

    function transitionEnd$1(callback) {
      const dom = this;

      function fireCallBack(e) {
        if (e.target !== this) return;
        callback.call(this, e);
        dom.off('transitionend', fireCallBack);
      }

      if (callback) {
        dom.on('transitionend', fireCallBack);
      }

      return this;
    }

    function outerWidth(includeMargins) {
      if (this.length > 0) {
        if (includeMargins) {
          const styles = this.styles();
          return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
        }

        return this[0].offsetWidth;
      }

      return null;
    }

    function outerHeight(includeMargins) {
      if (this.length > 0) {
        if (includeMargins) {
          const styles = this.styles();
          return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
        }

        return this[0].offsetHeight;
      }

      return null;
    }

    function offset() {
      if (this.length > 0) {
        const window = getWindow();
        const document = getDocument();
        const el = this[0];
        const box = el.getBoundingClientRect();
        const body = document.body;
        const clientTop = el.clientTop || body.clientTop || 0;
        const clientLeft = el.clientLeft || body.clientLeft || 0;
        const scrollTop = el === window ? window.scrollY : el.scrollTop;
        const scrollLeft = el === window ? window.scrollX : el.scrollLeft;
        return {
          top: box.top + scrollTop - clientTop,
          left: box.left + scrollLeft - clientLeft
        };
      }

      return null;
    }

    function styles() {
      const window = getWindow();
      if (this[0]) return window.getComputedStyle(this[0], null);
      return {};
    }

    function css(props, value) {
      const window = getWindow();
      let i;

      if (arguments.length === 1) {
        if (typeof props === 'string') {
          // .css('width')
          if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
        } else {
          // .css({ width: '100px' })
          for (i = 0; i < this.length; i += 1) {
            for (const prop in props) {
              this[i].style[prop] = props[prop];
            }
          }

          return this;
        }
      }

      if (arguments.length === 2 && typeof props === 'string') {
        // .css('width', '100px')
        for (i = 0; i < this.length; i += 1) {
          this[i].style[props] = value;
        }

        return this;
      }

      return this;
    }

    function each(callback) {
      if (!callback) return this;
      this.forEach((el, index) => {
        callback.apply(el, [el, index]);
      });
      return this;
    }

    function filter(callback) {
      const result = arrayFilter(this, callback);
      return $$1(result);
    }

    function html(html) {
      if (typeof html === 'undefined') {
        return this[0] ? this[0].innerHTML : null;
      }

      for (let i = 0; i < this.length; i += 1) {
        this[i].innerHTML = html;
      }

      return this;
    }

    function text(text) {
      if (typeof text === 'undefined') {
        return this[0] ? this[0].textContent.trim() : null;
      }

      for (let i = 0; i < this.length; i += 1) {
        this[i].textContent = text;
      }

      return this;
    }

    function is(selector) {
      const window = getWindow();
      const document = getDocument();
      const el = this[0];
      let compareWith;
      let i;
      if (!el || typeof selector === 'undefined') return false;

      if (typeof selector === 'string') {
        if (el.matches) return el.matches(selector);
        if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);
        if (el.msMatchesSelector) return el.msMatchesSelector(selector);
        compareWith = $$1(selector);

        for (i = 0; i < compareWith.length; i += 1) {
          if (compareWith[i] === el) return true;
        }

        return false;
      }

      if (selector === document) {
        return el === document;
      }

      if (selector === window) {
        return el === window;
      }

      if (selector.nodeType || selector instanceof Dom7) {
        compareWith = selector.nodeType ? [selector] : selector;

        for (i = 0; i < compareWith.length; i += 1) {
          if (compareWith[i] === el) return true;
        }

        return false;
      }

      return false;
    }

    function index() {
      let child = this[0];
      let i;

      if (child) {
        i = 0; // eslint-disable-next-line

        while ((child = child.previousSibling) !== null) {
          if (child.nodeType === 1) i += 1;
        }

        return i;
      }

      return undefined;
    }

    function eq(index) {
      if (typeof index === 'undefined') return this;
      const length = this.length;

      if (index > length - 1) {
        return $$1([]);
      }

      if (index < 0) {
        const returnIndex = length + index;
        if (returnIndex < 0) return $$1([]);
        return $$1([this[returnIndex]]);
      }

      return $$1([this[index]]);
    }

    function append(...els) {
      let newChild;
      const document = getDocument();

      for (let k = 0; k < els.length; k += 1) {
        newChild = els[k];

        for (let i = 0; i < this.length; i += 1) {
          if (typeof newChild === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newChild;

            while (tempDiv.firstChild) {
              this[i].appendChild(tempDiv.firstChild);
            }
          } else if (newChild instanceof Dom7) {
            for (let j = 0; j < newChild.length; j += 1) {
              this[i].appendChild(newChild[j]);
            }
          } else {
            this[i].appendChild(newChild);
          }
        }
      }

      return this;
    }

    function prepend(newChild) {
      const document = getDocument();
      let i;
      let j;

      for (i = 0; i < this.length; i += 1) {
        if (typeof newChild === 'string') {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newChild;

          for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
            this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
          }
        } else if (newChild instanceof Dom7) {
          for (j = 0; j < newChild.length; j += 1) {
            this[i].insertBefore(newChild[j], this[i].childNodes[0]);
          }
        } else {
          this[i].insertBefore(newChild, this[i].childNodes[0]);
        }
      }

      return this;
    }

    function next(selector) {
      if (this.length > 0) {
        if (selector) {
          if (this[0].nextElementSibling && $$1(this[0].nextElementSibling).is(selector)) {
            return $$1([this[0].nextElementSibling]);
          }

          return $$1([]);
        }

        if (this[0].nextElementSibling) return $$1([this[0].nextElementSibling]);
        return $$1([]);
      }

      return $$1([]);
    }

    function nextAll(selector) {
      const nextEls = [];
      let el = this[0];
      if (!el) return $$1([]);

      while (el.nextElementSibling) {
        const next = el.nextElementSibling; // eslint-disable-line

        if (selector) {
          if ($$1(next).is(selector)) nextEls.push(next);
        } else nextEls.push(next);

        el = next;
      }

      return $$1(nextEls);
    }

    function prev(selector) {
      if (this.length > 0) {
        const el = this[0];

        if (selector) {
          if (el.previousElementSibling && $$1(el.previousElementSibling).is(selector)) {
            return $$1([el.previousElementSibling]);
          }

          return $$1([]);
        }

        if (el.previousElementSibling) return $$1([el.previousElementSibling]);
        return $$1([]);
      }

      return $$1([]);
    }

    function prevAll(selector) {
      const prevEls = [];
      let el = this[0];
      if (!el) return $$1([]);

      while (el.previousElementSibling) {
        const prev = el.previousElementSibling; // eslint-disable-line

        if (selector) {
          if ($$1(prev).is(selector)) prevEls.push(prev);
        } else prevEls.push(prev);

        el = prev;
      }

      return $$1(prevEls);
    }

    function parent(selector) {
      const parents = []; // eslint-disable-line

      for (let i = 0; i < this.length; i += 1) {
        if (this[i].parentNode !== null) {
          if (selector) {
            if ($$1(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
          } else {
            parents.push(this[i].parentNode);
          }
        }
      }

      return $$1(parents);
    }

    function parents(selector) {
      const parents = []; // eslint-disable-line

      for (let i = 0; i < this.length; i += 1) {
        let parent = this[i].parentNode; // eslint-disable-line

        while (parent) {
          if (selector) {
            if ($$1(parent).is(selector)) parents.push(parent);
          } else {
            parents.push(parent);
          }

          parent = parent.parentNode;
        }
      }

      return $$1(parents);
    }

    function closest(selector) {
      let closest = this; // eslint-disable-line

      if (typeof selector === 'undefined') {
        return $$1([]);
      }

      if (!closest.is(selector)) {
        closest = closest.parents(selector).eq(0);
      }

      return closest;
    }

    function find(selector) {
      const foundElements = [];

      for (let i = 0; i < this.length; i += 1) {
        const found = this[i].querySelectorAll(selector);

        for (let j = 0; j < found.length; j += 1) {
          foundElements.push(found[j]);
        }
      }

      return $$1(foundElements);
    }

    function children(selector) {
      const children = []; // eslint-disable-line

      for (let i = 0; i < this.length; i += 1) {
        const childNodes = this[i].children;

        for (let j = 0; j < childNodes.length; j += 1) {
          if (!selector || $$1(childNodes[j]).is(selector)) {
            children.push(childNodes[j]);
          }
        }
      }

      return $$1(children);
    }

    function remove() {
      for (let i = 0; i < this.length; i += 1) {
        if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
      }

      return this;
    }

    const Methods = {
      addClass,
      removeClass,
      hasClass,
      toggleClass,
      attr,
      removeAttr,
      transform,
      transition: transition$1,
      on,
      off,
      trigger,
      transitionEnd: transitionEnd$1,
      outerWidth,
      outerHeight,
      styles,
      offset,
      css,
      each,
      html,
      text,
      is,
      index,
      eq,
      append,
      prepend,
      next,
      nextAll,
      prev,
      prevAll,
      parent,
      parents,
      closest,
      find,
      children,
      filter,
      remove
    };
    Object.keys(Methods).forEach(methodName => {
      Object.defineProperty($$1.fn, methodName, {
        value: Methods[methodName],
        writable: true
      });
    });

    function deleteProps(obj) {
      const object = obj;
      Object.keys(object).forEach(key => {
        try {
          object[key] = null;
        } catch (e) {// no getter for object
        }

        try {
          delete object[key];
        } catch (e) {// something got wrong
        }
      });
    }

    function nextTick(callback, delay) {
      if (delay === void 0) {
        delay = 0;
      }

      return setTimeout(callback, delay);
    }

    function now() {
      return Date.now();
    }

    function getComputedStyle$1(el) {
      const window = getWindow();
      let style;

      if (window.getComputedStyle) {
        style = window.getComputedStyle(el, null);
      }

      if (!style && el.currentStyle) {
        style = el.currentStyle;
      }

      if (!style) {
        style = el.style;
      }

      return style;
    }

    function getTranslate(el, axis) {
      if (axis === void 0) {
        axis = 'x';
      }

      const window = getWindow();
      let matrix;
      let curTransform;
      let transformMatrix;
      const curStyle = getComputedStyle$1(el);

      if (window.WebKitCSSMatrix) {
        curTransform = curStyle.transform || curStyle.webkitTransform;

        if (curTransform.split(',').length > 6) {
          curTransform = curTransform.split(', ').map(a => a.replace(',', '.')).join(', ');
        } // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case


        transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
      } else {
        transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
        matrix = transformMatrix.toString().split(',');
      }

      if (axis === 'x') {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); // Normal Browsers
        else curTransform = parseFloat(matrix[4]);
      }

      if (axis === 'y') {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); // Normal Browsers
        else curTransform = parseFloat(matrix[5]);
      }

      return curTransform || 0;
    }

    function isObject(o) {
      return typeof o === 'object' && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === 'Object';
    }

    function isNode(node) {
      // eslint-disable-next-line
      if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
        return node instanceof HTMLElement;
      }

      return node && (node.nodeType === 1 || node.nodeType === 11);
    }

    function extend() {
      const to = Object(arguments.length <= 0 ? undefined : arguments[0]);
      const noExtend = ['__proto__', 'constructor', 'prototype'];

      for (let i = 1; i < arguments.length; i += 1) {
        const nextSource = i < 0 || arguments.length <= i ? undefined : arguments[i];

        if (nextSource !== undefined && nextSource !== null && !isNode(nextSource)) {
          const keysArray = Object.keys(Object(nextSource)).filter(key => noExtend.indexOf(key) < 0);

          for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
            const nextKey = keysArray[nextIndex];
            const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

            if (desc !== undefined && desc.enumerable) {
              if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
                if (nextSource[nextKey].__swiper__) {
                  to[nextKey] = nextSource[nextKey];
                } else {
                  extend(to[nextKey], nextSource[nextKey]);
                }
              } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
                to[nextKey] = {};

                if (nextSource[nextKey].__swiper__) {
                  to[nextKey] = nextSource[nextKey];
                } else {
                  extend(to[nextKey], nextSource[nextKey]);
                }
              } else {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
      }

      return to;
    }

    function setCSSProperty(el, varName, varValue) {
      el.style.setProperty(varName, varValue);
    }

    function animateCSSModeScroll(_ref) {
      let {
        swiper,
        targetPosition,
        side
      } = _ref;
      const window = getWindow();
      const startPosition = -swiper.translate;
      let startTime = null;
      let time;
      const duration = swiper.params.speed;
      swiper.wrapperEl.style.scrollSnapType = 'none';
      window.cancelAnimationFrame(swiper.cssModeFrameID);
      const dir = targetPosition > startPosition ? 'next' : 'prev';

      const isOutOfBound = (current, target) => {
        return dir === 'next' && current >= target || dir === 'prev' && current <= target;
      };

      const animate = () => {
        time = new Date().getTime();

        if (startTime === null) {
          startTime = time;
        }

        const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
        const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
        let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);

        if (isOutOfBound(currentPosition, targetPosition)) {
          currentPosition = targetPosition;
        }

        swiper.wrapperEl.scrollTo({
          [side]: currentPosition
        });

        if (isOutOfBound(currentPosition, targetPosition)) {
          swiper.wrapperEl.style.overflow = 'hidden';
          swiper.wrapperEl.style.scrollSnapType = '';
          setTimeout(() => {
            swiper.wrapperEl.style.overflow = '';
            swiper.wrapperEl.scrollTo({
              [side]: currentPosition
            });
          });
          window.cancelAnimationFrame(swiper.cssModeFrameID);
          return;
        }

        swiper.cssModeFrameID = window.requestAnimationFrame(animate);
      };

      animate();
    }

    let support;

    function calcSupport() {
      const window = getWindow();
      const document = getDocument();
      return {
        smoothScroll: document.documentElement && 'scrollBehavior' in document.documentElement.style,
        touch: !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch),
        passiveListener: function checkPassiveListener() {
          let supportsPassive = false;

          try {
            const opts = Object.defineProperty({}, 'passive', {
              // eslint-disable-next-line
              get() {
                supportsPassive = true;
              }

            });
            window.addEventListener('testPassiveListener', null, opts);
          } catch (e) {// No support
          }

          return supportsPassive;
        }(),
        gestures: function checkGestures() {
          return 'ongesturestart' in window;
        }()
      };
    }

    function getSupport() {
      if (!support) {
        support = calcSupport();
      }

      return support;
    }

    let deviceCached;

    function calcDevice(_temp) {
      let {
        userAgent
      } = _temp === void 0 ? {} : _temp;
      const support = getSupport();
      const window = getWindow();
      const platform = window.navigator.platform;
      const ua = userAgent || window.navigator.userAgent;
      const device = {
        ios: false,
        android: false
      };
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line

      let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
      const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
      const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
      const windows = platform === 'Win32';
      let macos = platform === 'MacIntel'; // iPadOs 13 fix

      const iPadScreens = ['1024x1366', '1366x1024', '834x1194', '1194x834', '834x1112', '1112x834', '768x1024', '1024x768', '820x1180', '1180x820', '810x1080', '1080x810'];

      if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
        ipad = ua.match(/(Version)\/([\d.]+)/);
        if (!ipad) ipad = [0, 1, '13_0_0'];
        macos = false;
      } // Android


      if (android && !windows) {
        device.os = 'android';
        device.android = true;
      }

      if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
      } // Export object


      return device;
    }

    function getDevice(overrides) {
      if (overrides === void 0) {
        overrides = {};
      }

      if (!deviceCached) {
        deviceCached = calcDevice(overrides);
      }

      return deviceCached;
    }

    let browser;

    function calcBrowser() {
      const window = getWindow();

      function isSafari() {
        const ua = window.navigator.userAgent.toLowerCase();
        return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0;
      }

      return {
        isSafari: isSafari(),
        isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent)
      };
    }

    function getBrowser() {
      if (!browser) {
        browser = calcBrowser();
      }

      return browser;
    }

    function Resize(_ref) {
      let {
        swiper,
        on,
        emit
      } = _ref;
      const window = getWindow();
      let observer = null;
      let animationFrame = null;

      const resizeHandler = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        emit('beforeResize');
        emit('resize');
      };

      const createObserver = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        observer = new ResizeObserver(entries => {
          animationFrame = window.requestAnimationFrame(() => {
            const {
              width,
              height
            } = swiper;
            let newWidth = width;
            let newHeight = height;
            entries.forEach(_ref2 => {
              let {
                contentBoxSize,
                contentRect,
                target
              } = _ref2;
              if (target && target !== swiper.el) return;
              newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
              newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
            });

            if (newWidth !== width || newHeight !== height) {
              resizeHandler();
            }
          });
        });
        observer.observe(swiper.el);
      };

      const removeObserver = () => {
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }

        if (observer && observer.unobserve && swiper.el) {
          observer.unobserve(swiper.el);
          observer = null;
        }
      };

      const orientationChangeHandler = () => {
        if (!swiper || swiper.destroyed || !swiper.initialized) return;
        emit('orientationchange');
      };

      on('init', () => {
        if (swiper.params.resizeObserver && typeof window.ResizeObserver !== 'undefined') {
          createObserver();
          return;
        }

        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', orientationChangeHandler);
      });
      on('destroy', () => {
        removeObserver();
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('orientationchange', orientationChangeHandler);
      });
    }

    function Observer(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const observers = [];
      const window = getWindow();

      const attach = function (target, options) {
        if (options === void 0) {
          options = {};
        }

        const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
        const observer = new ObserverFunc(mutations => {
          // The observerUpdate event should only be triggered
          // once despite the number of mutations.  Additional
          // triggers are redundant and are very costly
          if (mutations.length === 1) {
            emit('observerUpdate', mutations[0]);
            return;
          }

          const observerUpdate = function observerUpdate() {
            emit('observerUpdate', mutations[0]);
          };

          if (window.requestAnimationFrame) {
            window.requestAnimationFrame(observerUpdate);
          } else {
            window.setTimeout(observerUpdate, 0);
          }
        });
        observer.observe(target, {
          attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
          childList: typeof options.childList === 'undefined' ? true : options.childList,
          characterData: typeof options.characterData === 'undefined' ? true : options.characterData
        });
        observers.push(observer);
      };

      const init = () => {
        if (!swiper.params.observer) return;

        if (swiper.params.observeParents) {
          const containerParents = swiper.$el.parents();

          for (let i = 0; i < containerParents.length; i += 1) {
            attach(containerParents[i]);
          }
        } // Observe container


        attach(swiper.$el[0], {
          childList: swiper.params.observeSlideChildren
        }); // Observe wrapper

        attach(swiper.$wrapperEl[0], {
          attributes: false
        });
      };

      const destroy = () => {
        observers.forEach(observer => {
          observer.disconnect();
        });
        observers.splice(0, observers.length);
      };

      extendParams({
        observer: false,
        observeParents: false,
        observeSlideChildren: false
      });
      on('init', init);
      on('destroy', destroy);
    }

    /* eslint-disable no-underscore-dangle */
    var eventsEmitter = {
      on(events, handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;
        const method = priority ? 'unshift' : 'push';
        events.split(' ').forEach(event => {
          if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
          self.eventsListeners[event][method](handler);
        });
        return self;
      },

      once(events, handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;

        function onceHandler() {
          self.off(events, onceHandler);

          if (onceHandler.__emitterProxy) {
            delete onceHandler.__emitterProxy;
          }

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          handler.apply(self, args);
        }

        onceHandler.__emitterProxy = handler;
        return self.on(events, onceHandler, priority);
      },

      onAny(handler, priority) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (typeof handler !== 'function') return self;
        const method = priority ? 'unshift' : 'push';

        if (self.eventsAnyListeners.indexOf(handler) < 0) {
          self.eventsAnyListeners[method](handler);
        }

        return self;
      },

      offAny(handler) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsAnyListeners) return self;
        const index = self.eventsAnyListeners.indexOf(handler);

        if (index >= 0) {
          self.eventsAnyListeners.splice(index, 1);
        }

        return self;
      },

      off(events, handler) {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsListeners) return self;
        events.split(' ').forEach(event => {
          if (typeof handler === 'undefined') {
            self.eventsListeners[event] = [];
          } else if (self.eventsListeners[event]) {
            self.eventsListeners[event].forEach((eventHandler, index) => {
              if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
                self.eventsListeners[event].splice(index, 1);
              }
            });
          }
        });
        return self;
      },

      emit() {
        const self = this;
        if (!self.eventsListeners || self.destroyed) return self;
        if (!self.eventsListeners) return self;
        let events;
        let data;
        let context;

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        if (typeof args[0] === 'string' || Array.isArray(args[0])) {
          events = args[0];
          data = args.slice(1, args.length);
          context = self;
        } else {
          events = args[0].events;
          data = args[0].data;
          context = args[0].context || self;
        }

        data.unshift(context);
        const eventsArray = Array.isArray(events) ? events : events.split(' ');
        eventsArray.forEach(event => {
          if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
            self.eventsAnyListeners.forEach(eventHandler => {
              eventHandler.apply(context, [event, ...data]);
            });
          }

          if (self.eventsListeners && self.eventsListeners[event]) {
            self.eventsListeners[event].forEach(eventHandler => {
              eventHandler.apply(context, data);
            });
          }
        });
        return self;
      }

    };

    function updateSize() {
      const swiper = this;
      let width;
      let height;
      const $el = swiper.$el;

      if (typeof swiper.params.width !== 'undefined' && swiper.params.width !== null) {
        width = swiper.params.width;
      } else {
        width = $el[0].clientWidth;
      }

      if (typeof swiper.params.height !== 'undefined' && swiper.params.height !== null) {
        height = swiper.params.height;
      } else {
        height = $el[0].clientHeight;
      }

      if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
        return;
      } // Subtract paddings


      width = width - parseInt($el.css('padding-left') || 0, 10) - parseInt($el.css('padding-right') || 0, 10);
      height = height - parseInt($el.css('padding-top') || 0, 10) - parseInt($el.css('padding-bottom') || 0, 10);
      if (Number.isNaN(width)) width = 0;
      if (Number.isNaN(height)) height = 0;
      Object.assign(swiper, {
        width,
        height,
        size: swiper.isHorizontal() ? width : height
      });
    }

    function updateSlides() {
      const swiper = this;

      function getDirectionLabel(property) {
        if (swiper.isHorizontal()) {
          return property;
        } // prettier-ignore


        return {
          'width': 'height',
          'margin-top': 'margin-left',
          'margin-bottom ': 'margin-right',
          'margin-left': 'margin-top',
          'margin-right': 'margin-bottom',
          'padding-left': 'padding-top',
          'padding-right': 'padding-bottom',
          'marginRight': 'marginBottom'
        }[property];
      }

      function getDirectionPropertyValue(node, label) {
        return parseFloat(node.getPropertyValue(getDirectionLabel(label)) || 0);
      }

      const params = swiper.params;
      const {
        $wrapperEl,
        size: swiperSize,
        rtlTranslate: rtl,
        wrongRTL
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
      const slides = $wrapperEl.children(`.${swiper.params.slideClass}`);
      const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
      let snapGrid = [];
      const slidesGrid = [];
      const slidesSizesGrid = [];
      let offsetBefore = params.slidesOffsetBefore;

      if (typeof offsetBefore === 'function') {
        offsetBefore = params.slidesOffsetBefore.call(swiper);
      }

      let offsetAfter = params.slidesOffsetAfter;

      if (typeof offsetAfter === 'function') {
        offsetAfter = params.slidesOffsetAfter.call(swiper);
      }

      const previousSnapGridLength = swiper.snapGrid.length;
      const previousSlidesGridLength = swiper.slidesGrid.length;
      let spaceBetween = params.spaceBetween;
      let slidePosition = -offsetBefore;
      let prevSlideSize = 0;
      let index = 0;

      if (typeof swiperSize === 'undefined') {
        return;
      }

      if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
        spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiperSize;
      }

      swiper.virtualSize = -spaceBetween; // reset margins

      if (rtl) slides.css({
        marginLeft: '',
        marginBottom: '',
        marginTop: ''
      });else slides.css({
        marginRight: '',
        marginBottom: '',
        marginTop: ''
      }); // reset cssMode offsets

      if (params.centeredSlides && params.cssMode) {
        setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-before', '');
        setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-after', '');
      }

      const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;

      if (gridEnabled) {
        swiper.grid.initSlides(slidesLength);
      } // Calc slides


      let slideSize;
      const shouldResetSlideSize = params.slidesPerView === 'auto' && params.breakpoints && Object.keys(params.breakpoints).filter(key => {
        return typeof params.breakpoints[key].slidesPerView !== 'undefined';
      }).length > 0;

      for (let i = 0; i < slidesLength; i += 1) {
        slideSize = 0;
        const slide = slides.eq(i);

        if (gridEnabled) {
          swiper.grid.updateSlide(i, slide, slidesLength, getDirectionLabel);
        }

        if (slide.css('display') === 'none') continue; // eslint-disable-line

        if (params.slidesPerView === 'auto') {
          if (shouldResetSlideSize) {
            slides[i].style[getDirectionLabel('width')] = ``;
          }

          const slideStyles = getComputedStyle(slide[0]);
          const currentTransform = slide[0].style.transform;
          const currentWebKitTransform = slide[0].style.webkitTransform;

          if (currentTransform) {
            slide[0].style.transform = 'none';
          }

          if (currentWebKitTransform) {
            slide[0].style.webkitTransform = 'none';
          }

          if (params.roundLengths) {
            slideSize = swiper.isHorizontal() ? slide.outerWidth(true) : slide.outerHeight(true);
          } else {
            // eslint-disable-next-line
            const width = getDirectionPropertyValue(slideStyles, 'width');
            const paddingLeft = getDirectionPropertyValue(slideStyles, 'padding-left');
            const paddingRight = getDirectionPropertyValue(slideStyles, 'padding-right');
            const marginLeft = getDirectionPropertyValue(slideStyles, 'margin-left');
            const marginRight = getDirectionPropertyValue(slideStyles, 'margin-right');
            const boxSizing = slideStyles.getPropertyValue('box-sizing');

            if (boxSizing && boxSizing === 'border-box') {
              slideSize = width + marginLeft + marginRight;
            } else {
              const {
                clientWidth,
                offsetWidth
              } = slide[0];
              slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
            }
          }

          if (currentTransform) {
            slide[0].style.transform = currentTransform;
          }

          if (currentWebKitTransform) {
            slide[0].style.webkitTransform = currentWebKitTransform;
          }

          if (params.roundLengths) slideSize = Math.floor(slideSize);
        } else {
          slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
          if (params.roundLengths) slideSize = Math.floor(slideSize);

          if (slides[i]) {
            slides[i].style[getDirectionLabel('width')] = `${slideSize}px`;
          }
        }

        if (slides[i]) {
          slides[i].swiperSlideSize = slideSize;
        }

        slidesSizesGrid.push(slideSize);

        if (params.centeredSlides) {
          slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
          if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
          if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
          if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
        } else {
          if (params.roundLengths) slidePosition = Math.floor(slidePosition);
          if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
          slidesGrid.push(slidePosition);
          slidePosition = slidePosition + slideSize + spaceBetween;
        }

        swiper.virtualSize += slideSize + spaceBetween;
        prevSlideSize = slideSize;
        index += 1;
      }

      swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;

      if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
        $wrapperEl.css({
          width: `${swiper.virtualSize + params.spaceBetween}px`
        });
      }

      if (params.setWrapperSize) {
        $wrapperEl.css({
          [getDirectionLabel('width')]: `${swiper.virtualSize + params.spaceBetween}px`
        });
      }

      if (gridEnabled) {
        swiper.grid.updateWrapperSize(slideSize, snapGrid, getDirectionLabel);
      } // Remove last grid elements depending on width


      if (!params.centeredSlides) {
        const newSlidesGrid = [];

        for (let i = 0; i < snapGrid.length; i += 1) {
          let slidesGridItem = snapGrid[i];
          if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);

          if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
            newSlidesGrid.push(slidesGridItem);
          }
        }

        snapGrid = newSlidesGrid;

        if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
          snapGrid.push(swiper.virtualSize - swiperSize);
        }
      }

      if (snapGrid.length === 0) snapGrid = [0];

      if (params.spaceBetween !== 0) {
        const key = swiper.isHorizontal() && rtl ? 'marginLeft' : getDirectionLabel('marginRight');
        slides.filter((_, slideIndex) => {
          if (!params.cssMode) return true;

          if (slideIndex === slides.length - 1) {
            return false;
          }

          return true;
        }).css({
          [key]: `${spaceBetween}px`
        });
      }

      if (params.centeredSlides && params.centeredSlidesBounds) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach(slideSizeValue => {
          allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
        });
        allSlidesSize -= params.spaceBetween;
        const maxSnap = allSlidesSize - swiperSize;
        snapGrid = snapGrid.map(snap => {
          if (snap < 0) return -offsetBefore;
          if (snap > maxSnap) return maxSnap + offsetAfter;
          return snap;
        });
      }

      if (params.centerInsufficientSlides) {
        let allSlidesSize = 0;
        slidesSizesGrid.forEach(slideSizeValue => {
          allSlidesSize += slideSizeValue + (params.spaceBetween ? params.spaceBetween : 0);
        });
        allSlidesSize -= params.spaceBetween;

        if (allSlidesSize < swiperSize) {
          const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
          snapGrid.forEach((snap, snapIndex) => {
            snapGrid[snapIndex] = snap - allSlidesOffset;
          });
          slidesGrid.forEach((snap, snapIndex) => {
            slidesGrid[snapIndex] = snap + allSlidesOffset;
          });
        }
      }

      Object.assign(swiper, {
        slides,
        snapGrid,
        slidesGrid,
        slidesSizesGrid
      });

      if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
        setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-before', `${-snapGrid[0]}px`);
        setCSSProperty(swiper.wrapperEl, '--swiper-centered-offset-after', `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
        const addToSnapGrid = -swiper.snapGrid[0];
        const addToSlidesGrid = -swiper.slidesGrid[0];
        swiper.snapGrid = swiper.snapGrid.map(v => v + addToSnapGrid);
        swiper.slidesGrid = swiper.slidesGrid.map(v => v + addToSlidesGrid);
      }

      if (slidesLength !== previousSlidesLength) {
        swiper.emit('slidesLengthChange');
      }

      if (snapGrid.length !== previousSnapGridLength) {
        if (swiper.params.watchOverflow) swiper.checkOverflow();
        swiper.emit('snapGridLengthChange');
      }

      if (slidesGrid.length !== previousSlidesGridLength) {
        swiper.emit('slidesGridLengthChange');
      }

      if (params.watchSlidesProgress) {
        swiper.updateSlidesOffset();
      }

      if (!isVirtual && !params.cssMode && (params.effect === 'slide' || params.effect === 'fade')) {
        const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
        const hasClassBackfaceClassAdded = swiper.$el.hasClass(backFaceHiddenClass);

        if (slidesLength <= params.maxBackfaceHiddenSlides) {
          if (!hasClassBackfaceClassAdded) swiper.$el.addClass(backFaceHiddenClass);
        } else if (hasClassBackfaceClassAdded) {
          swiper.$el.removeClass(backFaceHiddenClass);
        }
      }
    }

    function updateAutoHeight(speed) {
      const swiper = this;
      const activeSlides = [];
      const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
      let newHeight = 0;
      let i;

      if (typeof speed === 'number') {
        swiper.setTransition(speed);
      } else if (speed === true) {
        swiper.setTransition(swiper.params.speed);
      }

      const getSlideByIndex = index => {
        if (isVirtual) {
          return swiper.slides.filter(el => parseInt(el.getAttribute('data-swiper-slide-index'), 10) === index)[0];
        }

        return swiper.slides.eq(index)[0];
      }; // Find slides currently in view


      if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
        if (swiper.params.centeredSlides) {
          (swiper.visibleSlides || $$1([])).each(slide => {
            activeSlides.push(slide);
          });
        } else {
          for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
            const index = swiper.activeIndex + i;
            if (index > swiper.slides.length && !isVirtual) break;
            activeSlides.push(getSlideByIndex(index));
          }
        }
      } else {
        activeSlides.push(getSlideByIndex(swiper.activeIndex));
      } // Find new height from highest slide in view


      for (i = 0; i < activeSlides.length; i += 1) {
        if (typeof activeSlides[i] !== 'undefined') {
          const height = activeSlides[i].offsetHeight;
          newHeight = height > newHeight ? height : newHeight;
        }
      } // Update Height


      if (newHeight || newHeight === 0) swiper.$wrapperEl.css('height', `${newHeight}px`);
    }

    function updateSlidesOffset() {
      const swiper = this;
      const slides = swiper.slides;

      for (let i = 0; i < slides.length; i += 1) {
        slides[i].swiperSlideOffset = swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop;
      }
    }

    function updateSlidesProgress(translate) {
      if (translate === void 0) {
        translate = this && this.translate || 0;
      }

      const swiper = this;
      const params = swiper.params;
      const {
        slides,
        rtlTranslate: rtl,
        snapGrid
      } = swiper;
      if (slides.length === 0) return;
      if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();
      let offsetCenter = -translate;
      if (rtl) offsetCenter = translate; // Visible Slides

      slides.removeClass(params.slideVisibleClass);
      swiper.visibleSlidesIndexes = [];
      swiper.visibleSlides = [];

      for (let i = 0; i < slides.length; i += 1) {
        const slide = slides[i];
        let slideOffset = slide.swiperSlideOffset;

        if (params.cssMode && params.centeredSlides) {
          slideOffset -= slides[0].swiperSlideOffset;
        }

        const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + params.spaceBetween);
        const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + params.spaceBetween);
        const slideBefore = -(offsetCenter - slideOffset);
        const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
        const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;

        if (isVisible) {
          swiper.visibleSlides.push(slide);
          swiper.visibleSlidesIndexes.push(i);
          slides.eq(i).addClass(params.slideVisibleClass);
        }

        slide.progress = rtl ? -slideProgress : slideProgress;
        slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
      }

      swiper.visibleSlides = $$1(swiper.visibleSlides);
    }

    function updateProgress(translate) {
      const swiper = this;

      if (typeof translate === 'undefined') {
        const multiplier = swiper.rtlTranslate ? -1 : 1; // eslint-disable-next-line

        translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
      }

      const params = swiper.params;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
      let {
        progress,
        isBeginning,
        isEnd
      } = swiper;
      const wasBeginning = isBeginning;
      const wasEnd = isEnd;

      if (translatesDiff === 0) {
        progress = 0;
        isBeginning = true;
        isEnd = true;
      } else {
        progress = (translate - swiper.minTranslate()) / translatesDiff;
        isBeginning = progress <= 0;
        isEnd = progress >= 1;
      }

      Object.assign(swiper, {
        progress,
        isBeginning,
        isEnd
      });
      if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);

      if (isBeginning && !wasBeginning) {
        swiper.emit('reachBeginning toEdge');
      }

      if (isEnd && !wasEnd) {
        swiper.emit('reachEnd toEdge');
      }

      if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
        swiper.emit('fromEdge');
      }

      swiper.emit('progress', progress);
    }

    function updateSlidesClasses() {
      const swiper = this;
      const {
        slides,
        params,
        $wrapperEl,
        activeIndex,
        realIndex
      } = swiper;
      const isVirtual = swiper.virtual && params.virtual.enabled;
      slides.removeClass(`${params.slideActiveClass} ${params.slideNextClass} ${params.slidePrevClass} ${params.slideDuplicateActiveClass} ${params.slideDuplicateNextClass} ${params.slideDuplicatePrevClass}`);
      let activeSlide;

      if (isVirtual) {
        activeSlide = swiper.$wrapperEl.find(`.${params.slideClass}[data-swiper-slide-index="${activeIndex}"]`);
      } else {
        activeSlide = slides.eq(activeIndex);
      } // Active classes


      activeSlide.addClass(params.slideActiveClass);

      if (params.loop) {
        // Duplicate to all looped slides
        if (activeSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${realIndex}"]`).addClass(params.slideDuplicateActiveClass);
        } else {
          $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${realIndex}"]`).addClass(params.slideDuplicateActiveClass);
        }
      } // Next Slide


      let nextSlide = activeSlide.nextAll(`.${params.slideClass}`).eq(0).addClass(params.slideNextClass);

      if (params.loop && nextSlide.length === 0) {
        nextSlide = slides.eq(0);
        nextSlide.addClass(params.slideNextClass);
      } // Prev Slide


      let prevSlide = activeSlide.prevAll(`.${params.slideClass}`).eq(0).addClass(params.slidePrevClass);

      if (params.loop && prevSlide.length === 0) {
        prevSlide = slides.eq(-1);
        prevSlide.addClass(params.slidePrevClass);
      }

      if (params.loop) {
        // Duplicate to all looped slides
        if (nextSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicateNextClass);
        } else {
          $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${nextSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicateNextClass);
        }

        if (prevSlide.hasClass(params.slideDuplicateClass)) {
          $wrapperEl.children(`.${params.slideClass}:not(.${params.slideDuplicateClass})[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicatePrevClass);
        } else {
          $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass}[data-swiper-slide-index="${prevSlide.attr('data-swiper-slide-index')}"]`).addClass(params.slideDuplicatePrevClass);
        }
      }

      swiper.emitSlidesClasses();
    }

    function updateActiveIndex(newActiveIndex) {
      const swiper = this;
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
      const {
        slidesGrid,
        snapGrid,
        params,
        activeIndex: previousIndex,
        realIndex: previousRealIndex,
        snapIndex: previousSnapIndex
      } = swiper;
      let activeIndex = newActiveIndex;
      let snapIndex;

      if (typeof activeIndex === 'undefined') {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          if (typeof slidesGrid[i + 1] !== 'undefined') {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
              activeIndex = i;
            } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
              activeIndex = i + 1;
            }
          } else if (translate >= slidesGrid[i]) {
            activeIndex = i;
          }
        } // Normalize slideIndex


        if (params.normalizeSlideIndex) {
          if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
        }
      }

      if (snapGrid.indexOf(translate) >= 0) {
        snapIndex = snapGrid.indexOf(translate);
      } else {
        const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
        snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
      }

      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

      if (activeIndex === previousIndex) {
        if (snapIndex !== previousSnapIndex) {
          swiper.snapIndex = snapIndex;
          swiper.emit('snapIndexChange');
        }

        return;
      } // Get real index


      const realIndex = parseInt(swiper.slides.eq(activeIndex).attr('data-swiper-slide-index') || activeIndex, 10);
      Object.assign(swiper, {
        snapIndex,
        realIndex,
        previousIndex,
        activeIndex
      });
      swiper.emit('activeIndexChange');
      swiper.emit('snapIndexChange');

      if (previousRealIndex !== realIndex) {
        swiper.emit('realIndexChange');
      }

      if (swiper.initialized || swiper.params.runCallbacksOnInit) {
        swiper.emit('slideChange');
      }
    }

    function updateClickedSlide(e) {
      const swiper = this;
      const params = swiper.params;
      const slide = $$1(e).closest(`.${params.slideClass}`)[0];
      let slideFound = false;
      let slideIndex;

      if (slide) {
        for (let i = 0; i < swiper.slides.length; i += 1) {
          if (swiper.slides[i] === slide) {
            slideFound = true;
            slideIndex = i;
            break;
          }
        }
      }

      if (slide && slideFound) {
        swiper.clickedSlide = slide;

        if (swiper.virtual && swiper.params.virtual.enabled) {
          swiper.clickedIndex = parseInt($$1(slide).attr('data-swiper-slide-index'), 10);
        } else {
          swiper.clickedIndex = slideIndex;
        }
      } else {
        swiper.clickedSlide = undefined;
        swiper.clickedIndex = undefined;
        return;
      }

      if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
        swiper.slideToClickedSlide();
      }
    }

    var update = {
      updateSize,
      updateSlides,
      updateAutoHeight,
      updateSlidesOffset,
      updateSlidesProgress,
      updateProgress,
      updateSlidesClasses,
      updateActiveIndex,
      updateClickedSlide
    };

    function getSwiperTranslate(axis) {
      if (axis === void 0) {
        axis = this.isHorizontal() ? 'x' : 'y';
      }

      const swiper = this;
      const {
        params,
        rtlTranslate: rtl,
        translate,
        $wrapperEl
      } = swiper;

      if (params.virtualTranslate) {
        return rtl ? -translate : translate;
      }

      if (params.cssMode) {
        return translate;
      }

      let currentTranslate = getTranslate($wrapperEl[0], axis);
      if (rtl) currentTranslate = -currentTranslate;
      return currentTranslate || 0;
    }

    function setTranslate(translate, byController) {
      const swiper = this;
      const {
        rtlTranslate: rtl,
        params,
        $wrapperEl,
        wrapperEl,
        progress
      } = swiper;
      let x = 0;
      let y = 0;
      const z = 0;

      if (swiper.isHorizontal()) {
        x = rtl ? -translate : translate;
      } else {
        y = translate;
      }

      if (params.roundLengths) {
        x = Math.floor(x);
        y = Math.floor(y);
      }

      if (params.cssMode) {
        wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
      } else if (!params.virtualTranslate) {
        $wrapperEl.transform(`translate3d(${x}px, ${y}px, ${z}px)`);
      }

      swiper.previousTranslate = swiper.translate;
      swiper.translate = swiper.isHorizontal() ? x : y; // Check if we need to update progress

      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();

      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (translate - swiper.minTranslate()) / translatesDiff;
      }

      if (newProgress !== progress) {
        swiper.updateProgress(translate);
      }

      swiper.emit('setTranslate', swiper.translate, byController);
    }

    function minTranslate() {
      return -this.snapGrid[0];
    }

    function maxTranslate() {
      return -this.snapGrid[this.snapGrid.length - 1];
    }

    function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
      if (translate === void 0) {
        translate = 0;
      }

      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      if (translateBounds === void 0) {
        translateBounds = true;
      }

      const swiper = this;
      const {
        params,
        wrapperEl
      } = swiper;

      if (swiper.animating && params.preventInteractionOnTransition) {
        return false;
      }

      const minTranslate = swiper.minTranslate();
      const maxTranslate = swiper.maxTranslate();
      let newTranslate;
      if (translateBounds && translate > minTranslate) newTranslate = minTranslate;else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate;else newTranslate = translate; // Update progress

      swiper.updateProgress(newTranslate);

      if (params.cssMode) {
        const isH = swiper.isHorizontal();

        if (speed === 0) {
          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
        } else {
          if (!swiper.support.smoothScroll) {
            animateCSSModeScroll({
              swiper,
              targetPosition: -newTranslate,
              side: isH ? 'left' : 'top'
            });
            return true;
          }

          wrapperEl.scrollTo({
            [isH ? 'left' : 'top']: -newTranslate,
            behavior: 'smooth'
          });
        }

        return true;
      }

      if (speed === 0) {
        swiper.setTransition(0);
        swiper.setTranslate(newTranslate);

        if (runCallbacks) {
          swiper.emit('beforeTransitionStart', speed, internal);
          swiper.emit('transitionEnd');
        }
      } else {
        swiper.setTransition(speed);
        swiper.setTranslate(newTranslate);

        if (runCallbacks) {
          swiper.emit('beforeTransitionStart', speed, internal);
          swiper.emit('transitionStart');
        }

        if (!swiper.animating) {
          swiper.animating = true;

          if (!swiper.onTranslateToWrapperTransitionEnd) {
            swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
              if (!swiper || swiper.destroyed) return;
              if (e.target !== this) return;
              swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
              swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onTranslateToWrapperTransitionEnd);
              swiper.onTranslateToWrapperTransitionEnd = null;
              delete swiper.onTranslateToWrapperTransitionEnd;

              if (runCallbacks) {
                swiper.emit('transitionEnd');
              }
            };
          }

          swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
          swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onTranslateToWrapperTransitionEnd);
        }
      }

      return true;
    }

    var translate = {
      getTranslate: getSwiperTranslate,
      setTranslate,
      minTranslate,
      maxTranslate,
      translateTo
    };

    function setTransition(duration, byController) {
      const swiper = this;

      if (!swiper.params.cssMode) {
        swiper.$wrapperEl.transition(duration);
      }

      swiper.emit('setTransition', duration, byController);
    }

    function transitionEmit(_ref) {
      let {
        swiper,
        runCallbacks,
        direction,
        step
      } = _ref;
      const {
        activeIndex,
        previousIndex
      } = swiper;
      let dir = direction;

      if (!dir) {
        if (activeIndex > previousIndex) dir = 'next';else if (activeIndex < previousIndex) dir = 'prev';else dir = 'reset';
      }

      swiper.emit(`transition${step}`);

      if (runCallbacks && activeIndex !== previousIndex) {
        if (dir === 'reset') {
          swiper.emit(`slideResetTransition${step}`);
          return;
        }

        swiper.emit(`slideChangeTransition${step}`);

        if (dir === 'next') {
          swiper.emit(`slideNextTransition${step}`);
        } else {
          swiper.emit(`slidePrevTransition${step}`);
        }
      }
    }

    function transitionStart(runCallbacks, direction) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      const {
        params
      } = swiper;
      if (params.cssMode) return;

      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }

      transitionEmit({
        swiper,
        runCallbacks,
        direction,
        step: 'Start'
      });
    }

    function transitionEnd(runCallbacks, direction) {
      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      const {
        params
      } = swiper;
      swiper.animating = false;
      if (params.cssMode) return;
      swiper.setTransition(0);
      transitionEmit({
        swiper,
        runCallbacks,
        direction,
        step: 'End'
      });
    }

    var transition = {
      setTransition,
      transitionStart,
      transitionEnd
    };

    function slideTo(index, speed, runCallbacks, internal, initial) {
      if (index === void 0) {
        index = 0;
      }

      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      if (typeof index !== 'number' && typeof index !== 'string') {
        throw new Error(`The 'index' argument cannot have type other than 'number' or 'string'. [${typeof index}] given.`);
      }

      if (typeof index === 'string') {
        /**
         * The `index` argument converted from `string` to `number`.
         * @type {number}
         */
        const indexAsNumber = parseInt(index, 10);
        /**
         * Determines whether the `index` argument is a valid `number`
         * after being converted from the `string` type.
         * @type {boolean}
         */

        const isValidNumber = isFinite(indexAsNumber);

        if (!isValidNumber) {
          throw new Error(`The passed-in 'index' (string) couldn't be converted to 'number'. [${index}] given.`);
        } // Knowing that the converted `index` is a valid number,
        // we can update the original argument's value.


        index = indexAsNumber;
      }

      const swiper = this;
      let slideIndex = index;
      if (slideIndex < 0) slideIndex = 0;
      const {
        params,
        snapGrid,
        slidesGrid,
        previousIndex,
        activeIndex,
        rtlTranslate: rtl,
        wrapperEl,
        enabled
      } = swiper;

      if (swiper.animating && params.preventInteractionOnTransition || !enabled && !internal && !initial) {
        return false;
      }

      const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
      let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
      if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;

      if ((activeIndex || params.initialSlide || 0) === (previousIndex || 0) && runCallbacks) {
        swiper.emit('beforeSlideChangeStart');
      }

      const translate = -snapGrid[snapIndex]; // Update progress

      swiper.updateProgress(translate); // Normalize slideIndex

      if (params.normalizeSlideIndex) {
        for (let i = 0; i < slidesGrid.length; i += 1) {
          const normalizedTranslate = -Math.floor(translate * 100);
          const normalizedGrid = Math.floor(slidesGrid[i] * 100);
          const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);

          if (typeof slidesGrid[i + 1] !== 'undefined') {
            if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
              slideIndex = i;
            } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
              slideIndex = i + 1;
            }
          } else if (normalizedTranslate >= normalizedGrid) {
            slideIndex = i;
          }
        }
      } // Directions locks


      if (swiper.initialized && slideIndex !== activeIndex) {
        if (!swiper.allowSlideNext && translate < swiper.translate && translate < swiper.minTranslate()) {
          return false;
        }

        if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
          if ((activeIndex || 0) !== slideIndex) return false;
        }
      }

      let direction;
      if (slideIndex > activeIndex) direction = 'next';else if (slideIndex < activeIndex) direction = 'prev';else direction = 'reset'; // Update Index

      if (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate) {
        swiper.updateActiveIndex(slideIndex); // Update Height

        if (params.autoHeight) {
          swiper.updateAutoHeight();
        }

        swiper.updateSlidesClasses();

        if (params.effect !== 'slide') {
          swiper.setTranslate(translate);
        }

        if (direction !== 'reset') {
          swiper.transitionStart(runCallbacks, direction);
          swiper.transitionEnd(runCallbacks, direction);
        }

        return false;
      }

      if (params.cssMode) {
        const isH = swiper.isHorizontal();
        const t = rtl ? translate : -translate;

        if (speed === 0) {
          const isVirtual = swiper.virtual && swiper.params.virtual.enabled;

          if (isVirtual) {
            swiper.wrapperEl.style.scrollSnapType = 'none';
            swiper._immediateVirtual = true;
          }

          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;

          if (isVirtual) {
            requestAnimationFrame(() => {
              swiper.wrapperEl.style.scrollSnapType = '';
              swiper._swiperImmediateVirtual = false;
            });
          }
        } else {
          if (!swiper.support.smoothScroll) {
            animateCSSModeScroll({
              swiper,
              targetPosition: t,
              side: isH ? 'left' : 'top'
            });
            return true;
          }

          wrapperEl.scrollTo({
            [isH ? 'left' : 'top']: t,
            behavior: 'smooth'
          });
        }

        return true;
      }

      swiper.setTransition(speed);
      swiper.setTranslate(translate);
      swiper.updateActiveIndex(slideIndex);
      swiper.updateSlidesClasses();
      swiper.emit('beforeTransitionStart', speed, internal);
      swiper.transitionStart(runCallbacks, direction);

      if (speed === 0) {
        swiper.transitionEnd(runCallbacks, direction);
      } else if (!swiper.animating) {
        swiper.animating = true;

        if (!swiper.onSlideToWrapperTransitionEnd) {
          swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
            if (!swiper || swiper.destroyed) return;
            if (e.target !== this) return;
            swiper.$wrapperEl[0].removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
            swiper.$wrapperEl[0].removeEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
            swiper.onSlideToWrapperTransitionEnd = null;
            delete swiper.onSlideToWrapperTransitionEnd;
            swiper.transitionEnd(runCallbacks, direction);
          };
        }

        swiper.$wrapperEl[0].addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
        swiper.$wrapperEl[0].addEventListener('webkitTransitionEnd', swiper.onSlideToWrapperTransitionEnd);
      }

      return true;
    }

    function slideToLoop(index, speed, runCallbacks, internal) {
      if (index === void 0) {
        index = 0;
      }

      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      if (typeof index === 'string') {
        /**
         * The `index` argument converted from `string` to `number`.
         * @type {number}
         */
        const indexAsNumber = parseInt(index, 10);
        /**
         * Determines whether the `index` argument is a valid `number`
         * after being converted from the `string` type.
         * @type {boolean}
         */

        const isValidNumber = isFinite(indexAsNumber);

        if (!isValidNumber) {
          throw new Error(`The passed-in 'index' (string) couldn't be converted to 'number'. [${index}] given.`);
        } // Knowing that the converted `index` is a valid number,
        // we can update the original argument's value.


        index = indexAsNumber;
      }

      const swiper = this;
      let newIndex = index;

      if (swiper.params.loop) {
        newIndex += swiper.loopedSlides;
      }

      return swiper.slideTo(newIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideNext(speed, runCallbacks, internal) {
      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      const {
        animating,
        enabled,
        params
      } = swiper;
      if (!enabled) return swiper;
      let perGroup = params.slidesPerGroup;

      if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
        perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
      }

      const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;

      if (params.loop) {
        if (animating && params.loopPreventsSlide) return false;
        swiper.loopFix(); // eslint-disable-next-line

        swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      }

      if (params.rewind && swiper.isEnd) {
        return swiper.slideTo(0, speed, runCallbacks, internal);
      }

      return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slidePrev(speed, runCallbacks, internal) {
      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      const {
        params,
        animating,
        snapGrid,
        slidesGrid,
        rtlTranslate,
        enabled
      } = swiper;
      if (!enabled) return swiper;

      if (params.loop) {
        if (animating && params.loopPreventsSlide) return false;
        swiper.loopFix(); // eslint-disable-next-line

        swiper._clientLeft = swiper.$wrapperEl[0].clientLeft;
      }

      const translate = rtlTranslate ? swiper.translate : -swiper.translate;

      function normalize(val) {
        if (val < 0) return -Math.floor(Math.abs(val));
        return Math.floor(val);
      }

      const normalizedTranslate = normalize(translate);
      const normalizedSnapGrid = snapGrid.map(val => normalize(val));
      let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];

      if (typeof prevSnap === 'undefined' && params.cssMode) {
        let prevSnapIndex;
        snapGrid.forEach((snap, snapIndex) => {
          if (normalizedTranslate >= snap) {
            // prevSnap = snap;
            prevSnapIndex = snapIndex;
          }
        });

        if (typeof prevSnapIndex !== 'undefined') {
          prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
      }

      let prevIndex = 0;

      if (typeof prevSnap !== 'undefined') {
        prevIndex = slidesGrid.indexOf(prevSnap);
        if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;

        if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
          prevIndex = prevIndex - swiper.slidesPerViewDynamic('previous', true) + 1;
          prevIndex = Math.max(prevIndex, 0);
        }
      }

      if (params.rewind && swiper.isBeginning) {
        const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
        return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
      }

      return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideReset(speed, runCallbacks, internal) {
      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      const swiper = this;
      return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }

    /* eslint no-unused-vars: "off" */
    function slideToClosest(speed, runCallbacks, internal, threshold) {
      if (speed === void 0) {
        speed = this.params.speed;
      }

      if (runCallbacks === void 0) {
        runCallbacks = true;
      }

      if (threshold === void 0) {
        threshold = 0.5;
      }

      const swiper = this;
      let index = swiper.activeIndex;
      const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
      const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
      const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;

      if (translate >= swiper.snapGrid[snapIndex]) {
        // The current translate is on or after the current snap index, so the choice
        // is between the current index and the one after it.
        const currentSnap = swiper.snapGrid[snapIndex];
        const nextSnap = swiper.snapGrid[snapIndex + 1];

        if (translate - currentSnap > (nextSnap - currentSnap) * threshold) {
          index += swiper.params.slidesPerGroup;
        }
      } else {
        // The current translate is before the current snap index, so the choice
        // is between the current index and the one before it.
        const prevSnap = swiper.snapGrid[snapIndex - 1];
        const currentSnap = swiper.snapGrid[snapIndex];

        if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) {
          index -= swiper.params.slidesPerGroup;
        }
      }

      index = Math.max(index, 0);
      index = Math.min(index, swiper.slidesGrid.length - 1);
      return swiper.slideTo(index, speed, runCallbacks, internal);
    }

    function slideToClickedSlide() {
      const swiper = this;
      const {
        params,
        $wrapperEl
      } = swiper;
      const slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
      let slideToIndex = swiper.clickedIndex;
      let realIndex;

      if (params.loop) {
        if (swiper.animating) return;
        realIndex = parseInt($$1(swiper.clickedSlide).attr('data-swiper-slide-index'), 10);

        if (params.centeredSlides) {
          if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
            swiper.loopFix();
            slideToIndex = $wrapperEl.children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`).eq(0).index();
            nextTick(() => {
              swiper.slideTo(slideToIndex);
            });
          } else {
            swiper.slideTo(slideToIndex);
          }
        } else if (slideToIndex > swiper.slides.length - slidesPerView) {
          swiper.loopFix();
          slideToIndex = $wrapperEl.children(`.${params.slideClass}[data-swiper-slide-index="${realIndex}"]:not(.${params.slideDuplicateClass})`).eq(0).index();
          nextTick(() => {
            swiper.slideTo(slideToIndex);
          });
        } else {
          swiper.slideTo(slideToIndex);
        }
      } else {
        swiper.slideTo(slideToIndex);
      }
    }

    var slide = {
      slideTo,
      slideToLoop,
      slideNext,
      slidePrev,
      slideReset,
      slideToClosest,
      slideToClickedSlide
    };

    function loopCreate() {
      const swiper = this;
      const document = getDocument();
      const {
        params,
        $wrapperEl
      } = swiper; // Remove duplicated slides

      const $selector = $wrapperEl.children().length > 0 ? $$1($wrapperEl.children()[0].parentNode) : $wrapperEl;
      $selector.children(`.${params.slideClass}.${params.slideDuplicateClass}`).remove();
      let slides = $selector.children(`.${params.slideClass}`);

      if (params.loopFillGroupWithBlank) {
        const blankSlidesNum = params.slidesPerGroup - slides.length % params.slidesPerGroup;

        if (blankSlidesNum !== params.slidesPerGroup) {
          for (let i = 0; i < blankSlidesNum; i += 1) {
            const blankNode = $$1(document.createElement('div')).addClass(`${params.slideClass} ${params.slideBlankClass}`);
            $selector.append(blankNode);
          }

          slides = $selector.children(`.${params.slideClass}`);
        }
      }

      if (params.slidesPerView === 'auto' && !params.loopedSlides) params.loopedSlides = slides.length;
      swiper.loopedSlides = Math.ceil(parseFloat(params.loopedSlides || params.slidesPerView, 10));
      swiper.loopedSlides += params.loopAdditionalSlides;

      if (swiper.loopedSlides > slides.length && swiper.params.loopedSlidesLimit) {
        swiper.loopedSlides = slides.length;
      }

      const prependSlides = [];
      const appendSlides = [];
      slides.each((el, index) => {
        $$1(el).attr('data-swiper-slide-index', index);
      });

      for (let i = 0; i < swiper.loopedSlides; i += 1) {
        const index = i - Math.floor(i / slides.length) * slides.length;
        appendSlides.push(slides.eq(index)[0]);
        prependSlides.unshift(slides.eq(slides.length - index - 1)[0]);
      }

      for (let i = 0; i < appendSlides.length; i += 1) {
        $selector.append($$1(appendSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
      }

      for (let i = prependSlides.length - 1; i >= 0; i -= 1) {
        $selector.prepend($$1(prependSlides[i].cloneNode(true)).addClass(params.slideDuplicateClass));
      }
    }

    function loopFix() {
      const swiper = this;
      swiper.emit('beforeLoopFix');
      const {
        activeIndex,
        slides,
        loopedSlides,
        allowSlidePrev,
        allowSlideNext,
        snapGrid,
        rtlTranslate: rtl
      } = swiper;
      let newIndex;
      swiper.allowSlidePrev = true;
      swiper.allowSlideNext = true;
      const snapTranslate = -snapGrid[activeIndex];
      const diff = snapTranslate - swiper.getTranslate(); // Fix For Negative Oversliding

      if (activeIndex < loopedSlides) {
        newIndex = slides.length - loopedSlides * 3 + activeIndex;
        newIndex += loopedSlides;
        const slideChanged = swiper.slideTo(newIndex, 0, false, true);

        if (slideChanged && diff !== 0) {
          swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
        }
      } else if (activeIndex >= slides.length - loopedSlides) {
        // Fix For Positive Oversliding
        newIndex = -slides.length + activeIndex + loopedSlides;
        newIndex += loopedSlides;
        const slideChanged = swiper.slideTo(newIndex, 0, false, true);

        if (slideChanged && diff !== 0) {
          swiper.setTranslate((rtl ? -swiper.translate : swiper.translate) - diff);
        }
      }

      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;
      swiper.emit('loopFix');
    }

    function loopDestroy() {
      const swiper = this;
      const {
        $wrapperEl,
        params,
        slides
      } = swiper;
      $wrapperEl.children(`.${params.slideClass}.${params.slideDuplicateClass},.${params.slideClass}.${params.slideBlankClass}`).remove();
      slides.removeAttr('data-swiper-slide-index');
    }

    var loop = {
      loopCreate,
      loopFix,
      loopDestroy
    };

    function setGrabCursor(moving) {
      const swiper = this;
      if (swiper.support.touch || !swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
      const el = swiper.params.touchEventsTarget === 'container' ? swiper.el : swiper.wrapperEl;
      el.style.cursor = 'move';
      el.style.cursor = moving ? 'grabbing' : 'grab';
    }

    function unsetGrabCursor() {
      const swiper = this;

      if (swiper.support.touch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
        return;
      }

      swiper[swiper.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = '';
    }

    var grabCursor = {
      setGrabCursor,
      unsetGrabCursor
    };

    function closestElement(selector, base) {
      if (base === void 0) {
        base = this;
      }

      function __closestFrom(el) {
        if (!el || el === getDocument() || el === getWindow()) return null;
        if (el.assignedSlot) el = el.assignedSlot;
        const found = el.closest(selector);

        if (!found && !el.getRootNode) {
          return null;
        }

        return found || __closestFrom(el.getRootNode().host);
      }

      return __closestFrom(base);
    }

    function onTouchStart(event) {
      const swiper = this;
      const document = getDocument();
      const window = getWindow();
      const data = swiper.touchEventsData;
      const {
        params,
        touches,
        enabled
      } = swiper;
      if (!enabled) return;

      if (swiper.animating && params.preventInteractionOnTransition) {
        return;
      }

      if (!swiper.animating && params.cssMode && params.loop) {
        swiper.loopFix();
      }

      let e = event;
      if (e.originalEvent) e = e.originalEvent;
      let $targetEl = $$1(e.target);

      if (params.touchEventsTarget === 'wrapper') {
        if (!$targetEl.closest(swiper.wrapperEl).length) return;
      }

      data.isTouchEvent = e.type === 'touchstart';
      if (!data.isTouchEvent && 'which' in e && e.which === 3) return;
      if (!data.isTouchEvent && 'button' in e && e.button > 0) return;
      if (data.isTouched && data.isMoved) return; // change target el for shadow root component

      const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== '';

      if (swipingClassHasValue && e.target && e.target.shadowRoot && event.path && event.path[0]) {
        $targetEl = $$1(event.path[0]);
      }

      const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
      const isTargetShadow = !!(e.target && e.target.shadowRoot); // use closestElement for shadow root element to get the actual closest for nested shadow root element

      if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, $targetEl[0]) : $targetEl.closest(noSwipingSelector)[0])) {
        swiper.allowClick = true;
        return;
      }

      if (params.swipeHandler) {
        if (!$targetEl.closest(params.swipeHandler)[0]) return;
      }

      touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      const startX = touches.currentX;
      const startY = touches.currentY; // Do NOT start if iOS edge swipe is detected. Otherwise iOS app cannot swipe-to-go-back anymore

      const edgeSwipeDetection = params.edgeSwipeDetection || params.iOSEdgeSwipeDetection;
      const edgeSwipeThreshold = params.edgeSwipeThreshold || params.iOSEdgeSwipeThreshold;

      if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
        if (edgeSwipeDetection === 'prevent') {
          event.preventDefault();
        } else {
          return;
        }
      }

      Object.assign(data, {
        isTouched: true,
        isMoved: false,
        allowTouchCallbacks: true,
        isScrolling: undefined,
        startMoving: undefined
      });
      touches.startX = startX;
      touches.startY = startY;
      data.touchStartTime = now();
      swiper.allowClick = true;
      swiper.updateSize();
      swiper.swipeDirection = undefined;
      if (params.threshold > 0) data.allowThresholdMove = false;

      if (e.type !== 'touchstart') {
        let preventDefault = true;

        if ($targetEl.is(data.focusableElements)) {
          preventDefault = false;

          if ($targetEl[0].nodeName === 'SELECT') {
            data.isTouched = false;
          }
        }

        if (document.activeElement && $$1(document.activeElement).is(data.focusableElements) && document.activeElement !== $targetEl[0]) {
          document.activeElement.blur();
        }

        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;

        if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !$targetEl[0].isContentEditable) {
          e.preventDefault();
        }
      }

      if (swiper.params.freeMode && swiper.params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
        swiper.freeMode.onTouchStart();
      }

      swiper.emit('touchStart', e);
    }

    function onTouchMove(event) {
      const document = getDocument();
      const swiper = this;
      const data = swiper.touchEventsData;
      const {
        params,
        touches,
        rtlTranslate: rtl,
        enabled
      } = swiper;
      if (!enabled) return;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;

      if (!data.isTouched) {
        if (data.startMoving && data.isScrolling) {
          swiper.emit('touchMoveOpposite', e);
        }

        return;
      }

      if (data.isTouchEvent && e.type !== 'touchmove') return;
      const targetTouch = e.type === 'touchmove' && e.targetTouches && (e.targetTouches[0] || e.changedTouches[0]);
      const pageX = e.type === 'touchmove' ? targetTouch.pageX : e.pageX;
      const pageY = e.type === 'touchmove' ? targetTouch.pageY : e.pageY;

      if (e.preventedByNestedSwiper) {
        touches.startX = pageX;
        touches.startY = pageY;
        return;
      }

      if (!swiper.allowTouchMove) {
        if (!$$1(e.target).is(data.focusableElements)) {
          swiper.allowClick = false;
        }

        if (data.isTouched) {
          Object.assign(touches, {
            startX: pageX,
            startY: pageY,
            currentX: pageX,
            currentY: pageY
          });
          data.touchStartTime = now();
        }

        return;
      }

      if (data.isTouchEvent && params.touchReleaseOnEdges && !params.loop) {
        if (swiper.isVertical()) {
          // Vertical
          if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
            data.isTouched = false;
            data.isMoved = false;
            return;
          }
        } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) {
          return;
        }
      }

      if (data.isTouchEvent && document.activeElement) {
        if (e.target === document.activeElement && $$1(e.target).is(data.focusableElements)) {
          data.isMoved = true;
          swiper.allowClick = false;
          return;
        }
      }

      if (data.allowTouchCallbacks) {
        swiper.emit('touchMove', e);
      }

      if (e.targetTouches && e.targetTouches.length > 1) return;
      touches.currentX = pageX;
      touches.currentY = pageY;
      const diffX = touches.currentX - touches.startX;
      const diffY = touches.currentY - touches.startY;
      if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;

      if (typeof data.isScrolling === 'undefined') {
        let touchAngle;

        if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
          data.isScrolling = false;
        } else {
          // eslint-disable-next-line
          if (diffX * diffX + diffY * diffY >= 25) {
            touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
            data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
          }
        }
      }

      if (data.isScrolling) {
        swiper.emit('touchMoveOpposite', e);
      }

      if (typeof data.startMoving === 'undefined') {
        if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
          data.startMoving = true;
        }
      }

      if (data.isScrolling) {
        data.isTouched = false;
        return;
      }

      if (!data.startMoving) {
        return;
      }

      swiper.allowClick = false;

      if (!params.cssMode && e.cancelable) {
        e.preventDefault();
      }

      if (params.touchMoveStopPropagation && !params.nested) {
        e.stopPropagation();
      }

      if (!data.isMoved) {
        if (params.loop && !params.cssMode) {
          swiper.loopFix();
        }

        data.startTranslate = swiper.getTranslate();
        swiper.setTransition(0);

        if (swiper.animating) {
          swiper.$wrapperEl.trigger('webkitTransitionEnd transitionend');
        }

        data.allowMomentumBounce = false; // Grab Cursor

        if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
          swiper.setGrabCursor(true);
        }

        swiper.emit('sliderFirstMove', e);
      }

      swiper.emit('sliderMove', e);
      data.isMoved = true;
      let diff = swiper.isHorizontal() ? diffX : diffY;
      touches.diff = diff;
      diff *= params.touchRatio;
      if (rtl) diff = -diff;
      swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
      data.currentTranslate = diff + data.startTranslate;
      let disableParentSwiper = true;
      let resistanceRatio = params.resistanceRatio;

      if (params.touchReleaseOnEdges) {
        resistanceRatio = 0;
      }

      if (diff > 0 && data.currentTranslate > swiper.minTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
      } else if (diff < 0 && data.currentTranslate < swiper.maxTranslate()) {
        disableParentSwiper = false;
        if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
      }

      if (disableParentSwiper) {
        e.preventedByNestedSwiper = true;
      } // Directions locks


      if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }

      if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
        data.currentTranslate = data.startTranslate;
      }

      if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
        data.currentTranslate = data.startTranslate;
      } // Threshold


      if (params.threshold > 0) {
        if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
          if (!data.allowThresholdMove) {
            data.allowThresholdMove = true;
            touches.startX = touches.currentX;
            touches.startY = touches.currentY;
            data.currentTranslate = data.startTranslate;
            touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
            return;
          }
        } else {
          data.currentTranslate = data.startTranslate;
          return;
        }
      }

      if (!params.followFinger || params.cssMode) return; // Update active index in free mode

      if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }

      if (swiper.params.freeMode && params.freeMode.enabled && swiper.freeMode) {
        swiper.freeMode.onTouchMove();
      } // Update progress


      swiper.updateProgress(data.currentTranslate); // Update translate

      swiper.setTranslate(data.currentTranslate);
    }

    function onTouchEnd(event) {
      const swiper = this;
      const data = swiper.touchEventsData;
      const {
        params,
        touches,
        rtlTranslate: rtl,
        slidesGrid,
        enabled
      } = swiper;
      if (!enabled) return;
      let e = event;
      if (e.originalEvent) e = e.originalEvent;

      if (data.allowTouchCallbacks) {
        swiper.emit('touchEnd', e);
      }

      data.allowTouchCallbacks = false;

      if (!data.isTouched) {
        if (data.isMoved && params.grabCursor) {
          swiper.setGrabCursor(false);
        }

        data.isMoved = false;
        data.startMoving = false;
        return;
      } // Return Grab Cursor


      if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
        swiper.setGrabCursor(false);
      } // Time diff


      const touchEndTime = now();
      const timeDiff = touchEndTime - data.touchStartTime; // Tap, doubleTap, Click

      if (swiper.allowClick) {
        const pathTree = e.path || e.composedPath && e.composedPath();
        swiper.updateClickedSlide(pathTree && pathTree[0] || e.target);
        swiper.emit('tap click', e);

        if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
          swiper.emit('doubleTap doubleClick', e);
        }
      }

      data.lastClickTime = now();
      nextTick(() => {
        if (!swiper.destroyed) swiper.allowClick = true;
      });

      if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 || data.currentTranslate === data.startTranslate) {
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        return;
      }

      data.isTouched = false;
      data.isMoved = false;
      data.startMoving = false;
      let currentPos;

      if (params.followFinger) {
        currentPos = rtl ? swiper.translate : -swiper.translate;
      } else {
        currentPos = -data.currentTranslate;
      }

      if (params.cssMode) {
        return;
      }

      if (swiper.params.freeMode && params.freeMode.enabled) {
        swiper.freeMode.onTouchEnd({
          currentPos
        });
        return;
      } // Find current slide


      let stopIndex = 0;
      let groupSize = swiper.slidesSizesGrid[0];

      for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
        const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;

        if (typeof slidesGrid[i + increment] !== 'undefined') {
          if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
            stopIndex = i;
            groupSize = slidesGrid[i + increment] - slidesGrid[i];
          }
        } else if (currentPos >= slidesGrid[i]) {
          stopIndex = i;
          groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
        }
      }

      let rewindFirstIndex = null;
      let rewindLastIndex = null;

      if (params.rewind) {
        if (swiper.isBeginning) {
          rewindLastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
        } else if (swiper.isEnd) {
          rewindFirstIndex = 0;
        }
      } // Find current slide size


      const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
      const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;

      if (timeDiff > params.longSwipesMs) {
        // Long touches
        if (!params.longSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }

        if (swiper.swipeDirection === 'next') {
          if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);else swiper.slideTo(stopIndex);
        }

        if (swiper.swipeDirection === 'prev') {
          if (ratio > 1 - params.longSwipesRatio) {
            swiper.slideTo(stopIndex + increment);
          } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
            swiper.slideTo(rewindLastIndex);
          } else {
            swiper.slideTo(stopIndex);
          }
        }
      } else {
        // Short swipes
        if (!params.shortSwipes) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }

        const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);

        if (!isNavButtonTarget) {
          if (swiper.swipeDirection === 'next') {
            swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
          }

          if (swiper.swipeDirection === 'prev') {
            swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
          }
        } else if (e.target === swiper.navigation.nextEl) {
          swiper.slideTo(stopIndex + increment);
        } else {
          swiper.slideTo(stopIndex);
        }
      }
    }

    function onResize() {
      const swiper = this;
      const {
        params,
        el
      } = swiper;
      if (el && el.offsetWidth === 0) return; // Breakpoints

      if (params.breakpoints) {
        swiper.setBreakpoint();
      } // Save locks


      const {
        allowSlideNext,
        allowSlidePrev,
        snapGrid
      } = swiper; // Disable locks on resize

      swiper.allowSlideNext = true;
      swiper.allowSlidePrev = true;
      swiper.updateSize();
      swiper.updateSlides();
      swiper.updateSlidesClasses();

      if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides) {
        swiper.slideTo(swiper.slides.length - 1, 0, false, true);
      } else {
        swiper.slideTo(swiper.activeIndex, 0, false, true);
      }

      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.run();
      } // Return locks after resize


      swiper.allowSlidePrev = allowSlidePrev;
      swiper.allowSlideNext = allowSlideNext;

      if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
        swiper.checkOverflow();
      }
    }

    function onClick(e) {
      const swiper = this;
      if (!swiper.enabled) return;

      if (!swiper.allowClick) {
        if (swiper.params.preventClicks) e.preventDefault();

        if (swiper.params.preventClicksPropagation && swiper.animating) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    }

    function onScroll() {
      const swiper = this;
      const {
        wrapperEl,
        rtlTranslate,
        enabled
      } = swiper;
      if (!enabled) return;
      swiper.previousTranslate = swiper.translate;

      if (swiper.isHorizontal()) {
        swiper.translate = -wrapperEl.scrollLeft;
      } else {
        swiper.translate = -wrapperEl.scrollTop;
      } // eslint-disable-next-line


      if (swiper.translate === 0) swiper.translate = 0;
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
      let newProgress;
      const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();

      if (translatesDiff === 0) {
        newProgress = 0;
      } else {
        newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
      }

      if (newProgress !== swiper.progress) {
        swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
      }

      swiper.emit('setTranslate', swiper.translate, false);
    }

    let dummyEventAttached = false;

    function dummyEventListener() {}

    const events = (swiper, method) => {
      const document = getDocument();
      const {
        params,
        touchEvents,
        el,
        wrapperEl,
        device,
        support
      } = swiper;
      const capture = !!params.nested;
      const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
      const swiperMethod = method; // Touch Events

      if (!support.touch) {
        el[domMethod](touchEvents.start, swiper.onTouchStart, false);
        document[domMethod](touchEvents.move, swiper.onTouchMove, capture);
        document[domMethod](touchEvents.end, swiper.onTouchEnd, false);
      } else {
        const passiveListener = touchEvents.start === 'touchstart' && support.passiveListener && params.passiveListeners ? {
          passive: true,
          capture: false
        } : false;
        el[domMethod](touchEvents.start, swiper.onTouchStart, passiveListener);
        el[domMethod](touchEvents.move, swiper.onTouchMove, support.passiveListener ? {
          passive: false,
          capture
        } : capture);
        el[domMethod](touchEvents.end, swiper.onTouchEnd, passiveListener);

        if (touchEvents.cancel) {
          el[domMethod](touchEvents.cancel, swiper.onTouchEnd, passiveListener);
        }
      } // Prevent Links Clicks


      if (params.preventClicks || params.preventClicksPropagation) {
        el[domMethod]('click', swiper.onClick, true);
      }

      if (params.cssMode) {
        wrapperEl[domMethod]('scroll', swiper.onScroll);
      } // Resize handler


      if (params.updateOnWindowResize) {
        swiper[swiperMethod](device.ios || device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate', onResize, true);
      } else {
        swiper[swiperMethod]('observerUpdate', onResize, true);
      }
    };

    function attachEvents() {
      const swiper = this;
      const document = getDocument();
      const {
        params,
        support
      } = swiper;
      swiper.onTouchStart = onTouchStart.bind(swiper);
      swiper.onTouchMove = onTouchMove.bind(swiper);
      swiper.onTouchEnd = onTouchEnd.bind(swiper);

      if (params.cssMode) {
        swiper.onScroll = onScroll.bind(swiper);
      }

      swiper.onClick = onClick.bind(swiper);

      if (support.touch && !dummyEventAttached) {
        document.addEventListener('touchstart', dummyEventListener);
        dummyEventAttached = true;
      }

      events(swiper, 'on');
    }

    function detachEvents() {
      const swiper = this;
      events(swiper, 'off');
    }

    var events$1 = {
      attachEvents,
      detachEvents
    };

    const isGridEnabled = (swiper, params) => {
      return swiper.grid && params.grid && params.grid.rows > 1;
    };

    function setBreakpoint() {
      const swiper = this;
      const {
        activeIndex,
        initialized,
        loopedSlides = 0,
        params,
        $el
      } = swiper;
      const breakpoints = params.breakpoints;
      if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return; // Get breakpoint for window width and update parameters

      const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
      if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
      const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
      const breakpointParams = breakpointOnlyParams || swiper.originalParams;
      const wasMultiRow = isGridEnabled(swiper, params);
      const isMultiRow = isGridEnabled(swiper, breakpointParams);
      const wasEnabled = params.enabled;

      if (wasMultiRow && !isMultiRow) {
        $el.removeClass(`${params.containerModifierClass}grid ${params.containerModifierClass}grid-column`);
        swiper.emitContainerClasses();
      } else if (!wasMultiRow && isMultiRow) {
        $el.addClass(`${params.containerModifierClass}grid`);

        if (breakpointParams.grid.fill && breakpointParams.grid.fill === 'column' || !breakpointParams.grid.fill && params.grid.fill === 'column') {
          $el.addClass(`${params.containerModifierClass}grid-column`);
        }

        swiper.emitContainerClasses();
      } // Toggle navigation, pagination, scrollbar


      ['navigation', 'pagination', 'scrollbar'].forEach(prop => {
        const wasModuleEnabled = params[prop] && params[prop].enabled;
        const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;

        if (wasModuleEnabled && !isModuleEnabled) {
          swiper[prop].disable();
        }

        if (!wasModuleEnabled && isModuleEnabled) {
          swiper[prop].enable();
        }
      });
      const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
      const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);

      if (directionChanged && initialized) {
        swiper.changeDirection();
      }

      extend(swiper.params, breakpointParams);
      const isEnabled = swiper.params.enabled;
      Object.assign(swiper, {
        allowTouchMove: swiper.params.allowTouchMove,
        allowSlideNext: swiper.params.allowSlideNext,
        allowSlidePrev: swiper.params.allowSlidePrev
      });

      if (wasEnabled && !isEnabled) {
        swiper.disable();
      } else if (!wasEnabled && isEnabled) {
        swiper.enable();
      }

      swiper.currentBreakpoint = breakpoint;
      swiper.emit('_beforeBreakpoint', breakpointParams);

      if (needsReLoop && initialized) {
        swiper.loopDestroy();
        swiper.loopCreate();
        swiper.updateSlides();
        swiper.slideTo(activeIndex - loopedSlides + swiper.loopedSlides, 0, false);
      }

      swiper.emit('breakpoint', breakpointParams);
    }

    function getBreakpoint(breakpoints, base, containerEl) {
      if (base === void 0) {
        base = 'window';
      }

      if (!breakpoints || base === 'container' && !containerEl) return undefined;
      let breakpoint = false;
      const window = getWindow();
      const currentHeight = base === 'window' ? window.innerHeight : containerEl.clientHeight;
      const points = Object.keys(breakpoints).map(point => {
        if (typeof point === 'string' && point.indexOf('@') === 0) {
          const minRatio = parseFloat(point.substr(1));
          const value = currentHeight * minRatio;
          return {
            value,
            point
          };
        }

        return {
          value: point,
          point
        };
      });
      points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));

      for (let i = 0; i < points.length; i += 1) {
        const {
          point,
          value
        } = points[i];

        if (base === 'window') {
          if (window.matchMedia(`(min-width: ${value}px)`).matches) {
            breakpoint = point;
          }
        } else if (value <= containerEl.clientWidth) {
          breakpoint = point;
        }
      }

      return breakpoint || 'max';
    }

    var breakpoints = {
      setBreakpoint,
      getBreakpoint
    };

    function prepareClasses(entries, prefix) {
      const resultClasses = [];
      entries.forEach(item => {
        if (typeof item === 'object') {
          Object.keys(item).forEach(classNames => {
            if (item[classNames]) {
              resultClasses.push(prefix + classNames);
            }
          });
        } else if (typeof item === 'string') {
          resultClasses.push(prefix + item);
        }
      });
      return resultClasses;
    }

    function addClasses() {
      const swiper = this;
      const {
        classNames,
        params,
        rtl,
        $el,
        device,
        support
      } = swiper; // prettier-ignore

      const suffixes = prepareClasses(['initialized', params.direction, {
        'pointer-events': !support.touch
      }, {
        'free-mode': swiper.params.freeMode && params.freeMode.enabled
      }, {
        'autoheight': params.autoHeight
      }, {
        'rtl': rtl
      }, {
        'grid': params.grid && params.grid.rows > 1
      }, {
        'grid-column': params.grid && params.grid.rows > 1 && params.grid.fill === 'column'
      }, {
        'android': device.android
      }, {
        'ios': device.ios
      }, {
        'css-mode': params.cssMode
      }, {
        'centered': params.cssMode && params.centeredSlides
      }, {
        'watch-progress': params.watchSlidesProgress
      }], params.containerModifierClass);
      classNames.push(...suffixes);
      $el.addClass([...classNames].join(' '));
      swiper.emitContainerClasses();
    }

    function removeClasses() {
      const swiper = this;
      const {
        $el,
        classNames
      } = swiper;
      $el.removeClass(classNames.join(' '));
      swiper.emitContainerClasses();
    }

    var classes = {
      addClasses,
      removeClasses
    };

    function loadImage(imageEl, src, srcset, sizes, checkForComplete, callback) {
      const window = getWindow();
      let image;

      function onReady() {
        if (callback) callback();
      }

      const isPicture = $$1(imageEl).parent('picture')[0];

      if (!isPicture && (!imageEl.complete || !checkForComplete)) {
        if (src) {
          image = new window.Image();
          image.onload = onReady;
          image.onerror = onReady;

          if (sizes) {
            image.sizes = sizes;
          }

          if (srcset) {
            image.srcset = srcset;
          }

          if (src) {
            image.src = src;
          }
        } else {
          onReady();
        }
      } else {
        // image already loaded...
        onReady();
      }
    }

    function preloadImages() {
      const swiper = this;
      swiper.imagesToLoad = swiper.$el.find('img');

      function onReady() {
        if (typeof swiper === 'undefined' || swiper === null || !swiper || swiper.destroyed) return;
        if (swiper.imagesLoaded !== undefined) swiper.imagesLoaded += 1;

        if (swiper.imagesLoaded === swiper.imagesToLoad.length) {
          if (swiper.params.updateOnImagesReady) swiper.update();
          swiper.emit('imagesReady');
        }
      }

      for (let i = 0; i < swiper.imagesToLoad.length; i += 1) {
        const imageEl = swiper.imagesToLoad[i];
        swiper.loadImage(imageEl, imageEl.currentSrc || imageEl.getAttribute('src'), imageEl.srcset || imageEl.getAttribute('srcset'), imageEl.sizes || imageEl.getAttribute('sizes'), true, onReady);
      }
    }

    var images = {
      loadImage,
      preloadImages
    };

    function checkOverflow() {
      const swiper = this;
      const {
        isLocked: wasLocked,
        params
      } = swiper;
      const {
        slidesOffsetBefore
      } = params;

      if (slidesOffsetBefore) {
        const lastSlideIndex = swiper.slides.length - 1;
        const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
        swiper.isLocked = swiper.size > lastSlideRightEdge;
      } else {
        swiper.isLocked = swiper.snapGrid.length === 1;
      }

      if (params.allowSlideNext === true) {
        swiper.allowSlideNext = !swiper.isLocked;
      }

      if (params.allowSlidePrev === true) {
        swiper.allowSlidePrev = !swiper.isLocked;
      }

      if (wasLocked && wasLocked !== swiper.isLocked) {
        swiper.isEnd = false;
      }

      if (wasLocked !== swiper.isLocked) {
        swiper.emit(swiper.isLocked ? 'lock' : 'unlock');
      }
    }

    var checkOverflow$1 = {
      checkOverflow
    };

    var defaults = {
      init: true,
      direction: 'horizontal',
      touchEventsTarget: 'wrapper',
      initialSlide: 0,
      speed: 300,
      cssMode: false,
      updateOnWindowResize: true,
      resizeObserver: true,
      nested: false,
      createElements: false,
      enabled: true,
      focusableElements: 'input, select, option, textarea, button, video, label',
      // Overrides
      width: null,
      height: null,
      //
      preventInteractionOnTransition: false,
      // ssr
      userAgent: null,
      url: null,
      // To support iOS's swipe-to-go-back gesture (when being used in-app).
      edgeSwipeDetection: false,
      edgeSwipeThreshold: 20,
      // Autoheight
      autoHeight: false,
      // Set wrapper width
      setWrapperSize: false,
      // Virtual Translate
      virtualTranslate: false,
      // Effects
      effect: 'slide',
      // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'
      // Breakpoints
      breakpoints: undefined,
      breakpointsBase: 'window',
      // Slides grid
      spaceBetween: 0,
      slidesPerView: 1,
      slidesPerGroup: 1,
      slidesPerGroupSkip: 0,
      slidesPerGroupAuto: false,
      centeredSlides: false,
      centeredSlidesBounds: false,
      slidesOffsetBefore: 0,
      // in px
      slidesOffsetAfter: 0,
      // in px
      normalizeSlideIndex: true,
      centerInsufficientSlides: false,
      // Disable swiper and hide navigation when container not overflow
      watchOverflow: true,
      // Round length
      roundLengths: false,
      // Touches
      touchRatio: 1,
      touchAngle: 45,
      simulateTouch: true,
      shortSwipes: true,
      longSwipes: true,
      longSwipesRatio: 0.5,
      longSwipesMs: 300,
      followFinger: true,
      allowTouchMove: true,
      threshold: 0,
      touchMoveStopPropagation: false,
      touchStartPreventDefault: true,
      touchStartForcePreventDefault: false,
      touchReleaseOnEdges: false,
      // Unique Navigation Elements
      uniqueNavElements: true,
      // Resistance
      resistance: true,
      resistanceRatio: 0.85,
      // Progress
      watchSlidesProgress: false,
      // Cursor
      grabCursor: false,
      // Clicks
      preventClicks: true,
      preventClicksPropagation: true,
      slideToClickedSlide: false,
      // Images
      preloadImages: true,
      updateOnImagesReady: true,
      // loop
      loop: false,
      loopAdditionalSlides: 0,
      loopedSlides: null,
      loopedSlidesLimit: true,
      loopFillGroupWithBlank: false,
      loopPreventsSlide: true,
      // rewind
      rewind: false,
      // Swiping/no swiping
      allowSlidePrev: true,
      allowSlideNext: true,
      swipeHandler: null,
      // '.swipe-handler',
      noSwiping: true,
      noSwipingClass: 'swiper-no-swiping',
      noSwipingSelector: null,
      // Passive Listeners
      passiveListeners: true,
      maxBackfaceHiddenSlides: 10,
      // NS
      containerModifierClass: 'swiper-',
      // NEW
      slideClass: 'swiper-slide',
      slideBlankClass: 'swiper-slide-invisible-blank',
      slideActiveClass: 'swiper-slide-active',
      slideDuplicateActiveClass: 'swiper-slide-duplicate-active',
      slideVisibleClass: 'swiper-slide-visible',
      slideDuplicateClass: 'swiper-slide-duplicate',
      slideNextClass: 'swiper-slide-next',
      slideDuplicateNextClass: 'swiper-slide-duplicate-next',
      slidePrevClass: 'swiper-slide-prev',
      slideDuplicatePrevClass: 'swiper-slide-duplicate-prev',
      wrapperClass: 'swiper-wrapper',
      // Callbacks
      runCallbacksOnInit: true,
      // Internals
      _emitClasses: false
    };

    function moduleExtendParams(params, allModulesParams) {
      return function extendParams(obj) {
        if (obj === void 0) {
          obj = {};
        }

        const moduleParamName = Object.keys(obj)[0];
        const moduleParams = obj[moduleParamName];

        if (typeof moduleParams !== 'object' || moduleParams === null) {
          extend(allModulesParams, obj);
          return;
        }

        if (['navigation', 'pagination', 'scrollbar'].indexOf(moduleParamName) >= 0 && params[moduleParamName] === true) {
          params[moduleParamName] = {
            auto: true
          };
        }

        if (!(moduleParamName in params && 'enabled' in moduleParams)) {
          extend(allModulesParams, obj);
          return;
        }

        if (params[moduleParamName] === true) {
          params[moduleParamName] = {
            enabled: true
          };
        }

        if (typeof params[moduleParamName] === 'object' && !('enabled' in params[moduleParamName])) {
          params[moduleParamName].enabled = true;
        }

        if (!params[moduleParamName]) params[moduleParamName] = {
          enabled: false
        };
        extend(allModulesParams, obj);
      };
    }

    /* eslint no-param-reassign: "off" */
    const prototypes = {
      eventsEmitter,
      update,
      translate,
      transition,
      slide,
      loop,
      grabCursor,
      events: events$1,
      breakpoints,
      checkOverflow: checkOverflow$1,
      classes,
      images
    };
    const extendedDefaults = {};

    class Swiper {
      constructor() {
        let el;
        let params;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === 'Object') {
          params = args[0];
        } else {
          [el, params] = args;
        }

        if (!params) params = {};
        params = extend({}, params);
        if (el && !params.el) params.el = el;

        if (params.el && $$1(params.el).length > 1) {
          const swipers = [];
          $$1(params.el).each(containerEl => {
            const newParams = extend({}, params, {
              el: containerEl
            });
            swipers.push(new Swiper(newParams));
          });
          return swipers;
        } // Swiper Instance


        const swiper = this;
        swiper.__swiper__ = true;
        swiper.support = getSupport();
        swiper.device = getDevice({
          userAgent: params.userAgent
        });
        swiper.browser = getBrowser();
        swiper.eventsListeners = {};
        swiper.eventsAnyListeners = [];
        swiper.modules = [...swiper.__modules__];

        if (params.modules && Array.isArray(params.modules)) {
          swiper.modules.push(...params.modules);
        }

        const allModulesParams = {};
        swiper.modules.forEach(mod => {
          mod({
            swiper,
            extendParams: moduleExtendParams(params, allModulesParams),
            on: swiper.on.bind(swiper),
            once: swiper.once.bind(swiper),
            off: swiper.off.bind(swiper),
            emit: swiper.emit.bind(swiper)
          });
        }); // Extend defaults with modules params

        const swiperParams = extend({}, defaults, allModulesParams); // Extend defaults with passed params

        swiper.params = extend({}, swiperParams, extendedDefaults, params);
        swiper.originalParams = extend({}, swiper.params);
        swiper.passedParams = extend({}, params); // add event listeners

        if (swiper.params && swiper.params.on) {
          Object.keys(swiper.params.on).forEach(eventName => {
            swiper.on(eventName, swiper.params.on[eventName]);
          });
        }

        if (swiper.params && swiper.params.onAny) {
          swiper.onAny(swiper.params.onAny);
        } // Save Dom lib


        swiper.$ = $$1; // Extend Swiper

        Object.assign(swiper, {
          enabled: swiper.params.enabled,
          el,
          // Classes
          classNames: [],
          // Slides
          slides: $$1(),
          slidesGrid: [],
          snapGrid: [],
          slidesSizesGrid: [],

          // isDirection
          isHorizontal() {
            return swiper.params.direction === 'horizontal';
          },

          isVertical() {
            return swiper.params.direction === 'vertical';
          },

          // Indexes
          activeIndex: 0,
          realIndex: 0,
          //
          isBeginning: true,
          isEnd: false,
          // Props
          translate: 0,
          previousTranslate: 0,
          progress: 0,
          velocity: 0,
          animating: false,
          // Locks
          allowSlideNext: swiper.params.allowSlideNext,
          allowSlidePrev: swiper.params.allowSlidePrev,
          // Touch Events
          touchEvents: function touchEvents() {
            const touch = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
            const desktop = ['pointerdown', 'pointermove', 'pointerup'];
            swiper.touchEventsTouch = {
              start: touch[0],
              move: touch[1],
              end: touch[2],
              cancel: touch[3]
            };
            swiper.touchEventsDesktop = {
              start: desktop[0],
              move: desktop[1],
              end: desktop[2]
            };
            return swiper.support.touch || !swiper.params.simulateTouch ? swiper.touchEventsTouch : swiper.touchEventsDesktop;
          }(),
          touchEventsData: {
            isTouched: undefined,
            isMoved: undefined,
            allowTouchCallbacks: undefined,
            touchStartTime: undefined,
            isScrolling: undefined,
            currentTranslate: undefined,
            startTranslate: undefined,
            allowThresholdMove: undefined,
            // Form elements to match
            focusableElements: swiper.params.focusableElements,
            // Last click time
            lastClickTime: now(),
            clickTimeout: undefined,
            // Velocities
            velocities: [],
            allowMomentumBounce: undefined,
            isTouchEvent: undefined,
            startMoving: undefined
          },
          // Clicks
          allowClick: true,
          // Touches
          allowTouchMove: swiper.params.allowTouchMove,
          touches: {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
          },
          // Images
          imagesToLoad: [],
          imagesLoaded: 0
        });
        swiper.emit('_swiper'); // Init

        if (swiper.params.init) {
          swiper.init();
        } // Return app instance


        return swiper;
      }

      enable() {
        const swiper = this;
        if (swiper.enabled) return;
        swiper.enabled = true;

        if (swiper.params.grabCursor) {
          swiper.setGrabCursor();
        }

        swiper.emit('enable');
      }

      disable() {
        const swiper = this;
        if (!swiper.enabled) return;
        swiper.enabled = false;

        if (swiper.params.grabCursor) {
          swiper.unsetGrabCursor();
        }

        swiper.emit('disable');
      }

      setProgress(progress, speed) {
        const swiper = this;
        progress = Math.min(Math.max(progress, 0), 1);
        const min = swiper.minTranslate();
        const max = swiper.maxTranslate();
        const current = (max - min) * progress + min;
        swiper.translateTo(current, typeof speed === 'undefined' ? 0 : speed);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }

      emitContainerClasses() {
        const swiper = this;
        if (!swiper.params._emitClasses || !swiper.el) return;
        const cls = swiper.el.className.split(' ').filter(className => {
          return className.indexOf('swiper') === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
        });
        swiper.emit('_containerClasses', cls.join(' '));
      }

      getSlideClasses(slideEl) {
        const swiper = this;
        if (swiper.destroyed) return '';
        return slideEl.className.split(' ').filter(className => {
          return className.indexOf('swiper-slide') === 0 || className.indexOf(swiper.params.slideClass) === 0;
        }).join(' ');
      }

      emitSlidesClasses() {
        const swiper = this;
        if (!swiper.params._emitClasses || !swiper.el) return;
        const updates = [];
        swiper.slides.each(slideEl => {
          const classNames = swiper.getSlideClasses(slideEl);
          updates.push({
            slideEl,
            classNames
          });
          swiper.emit('_slideClass', slideEl, classNames);
        });
        swiper.emit('_slideClasses', updates);
      }

      slidesPerViewDynamic(view, exact) {
        if (view === void 0) {
          view = 'current';
        }

        if (exact === void 0) {
          exact = false;
        }

        const swiper = this;
        const {
          params,
          slides,
          slidesGrid,
          slidesSizesGrid,
          size: swiperSize,
          activeIndex
        } = swiper;
        let spv = 1;

        if (params.centeredSlides) {
          let slideSize = slides[activeIndex].swiperSlideSize;
          let breakLoop;

          for (let i = activeIndex + 1; i < slides.length; i += 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }

          for (let i = activeIndex - 1; i >= 0; i -= 1) {
            if (slides[i] && !breakLoop) {
              slideSize += slides[i].swiperSlideSize;
              spv += 1;
              if (slideSize > swiperSize) breakLoop = true;
            }
          }
        } else {
          // eslint-disable-next-line
          if (view === 'current') {
            for (let i = activeIndex + 1; i < slides.length; i += 1) {
              const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;

              if (slideInView) {
                spv += 1;
              }
            }
          } else {
            // previous
            for (let i = activeIndex - 1; i >= 0; i -= 1) {
              const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;

              if (slideInView) {
                spv += 1;
              }
            }
          }
        }

        return spv;
      }

      update() {
        const swiper = this;
        if (!swiper || swiper.destroyed) return;
        const {
          snapGrid,
          params
        } = swiper; // Breakpoints

        if (params.breakpoints) {
          swiper.setBreakpoint();
        }

        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateProgress();
        swiper.updateSlidesClasses();

        function setTranslate() {
          const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
          const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
          swiper.setTranslate(newTranslate);
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }

        let translated;

        if (swiper.params.freeMode && swiper.params.freeMode.enabled) {
          setTranslate();

          if (swiper.params.autoHeight) {
            swiper.updateAutoHeight();
          }
        } else {
          if ((swiper.params.slidesPerView === 'auto' || swiper.params.slidesPerView > 1) && swiper.isEnd && !swiper.params.centeredSlides) {
            translated = swiper.slideTo(swiper.slides.length - 1, 0, false, true);
          } else {
            translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
          }

          if (!translated) {
            setTranslate();
          }
        }

        if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
          swiper.checkOverflow();
        }

        swiper.emit('update');
      }

      changeDirection(newDirection, needUpdate) {
        if (needUpdate === void 0) {
          needUpdate = true;
        }

        const swiper = this;
        const currentDirection = swiper.params.direction;

        if (!newDirection) {
          // eslint-disable-next-line
          newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        }

        if (newDirection === currentDirection || newDirection !== 'horizontal' && newDirection !== 'vertical') {
          return swiper;
        }

        swiper.$el.removeClass(`${swiper.params.containerModifierClass}${currentDirection}`).addClass(`${swiper.params.containerModifierClass}${newDirection}`);
        swiper.emitContainerClasses();
        swiper.params.direction = newDirection;
        swiper.slides.each(slideEl => {
          if (newDirection === 'vertical') {
            slideEl.style.width = '';
          } else {
            slideEl.style.height = '';
          }
        });
        swiper.emit('changeDirection');
        if (needUpdate) swiper.update();
        return swiper;
      }

      changeLanguageDirection(direction) {
        const swiper = this;
        if (swiper.rtl && direction === 'rtl' || !swiper.rtl && direction === 'ltr') return;
        swiper.rtl = direction === 'rtl';
        swiper.rtlTranslate = swiper.params.direction === 'horizontal' && swiper.rtl;

        if (swiper.rtl) {
          swiper.$el.addClass(`${swiper.params.containerModifierClass}rtl`);
          swiper.el.dir = 'rtl';
        } else {
          swiper.$el.removeClass(`${swiper.params.containerModifierClass}rtl`);
          swiper.el.dir = 'ltr';
        }

        swiper.update();
      }

      mount(el) {
        const swiper = this;
        if (swiper.mounted) return true; // Find el

        const $el = $$1(el || swiper.params.el);
        el = $el[0];

        if (!el) {
          return false;
        }

        el.swiper = swiper;

        const getWrapperSelector = () => {
          return `.${(swiper.params.wrapperClass || '').trim().split(' ').join('.')}`;
        };

        const getWrapper = () => {
          if (el && el.shadowRoot && el.shadowRoot.querySelector) {
            const res = $$1(el.shadowRoot.querySelector(getWrapperSelector())); // Children needs to return slot items

            res.children = options => $el.children(options);

            return res;
          }

          if (!$el.children) {
            return $$1($el).children(getWrapperSelector());
          }

          return $el.children(getWrapperSelector());
        }; // Find Wrapper


        let $wrapperEl = getWrapper();

        if ($wrapperEl.length === 0 && swiper.params.createElements) {
          const document = getDocument();
          const wrapper = document.createElement('div');
          $wrapperEl = $$1(wrapper);
          wrapper.className = swiper.params.wrapperClass;
          $el.append(wrapper);
          $el.children(`.${swiper.params.slideClass}`).each(slideEl => {
            $wrapperEl.append(slideEl);
          });
        }

        Object.assign(swiper, {
          $el,
          el,
          $wrapperEl,
          wrapperEl: $wrapperEl[0],
          mounted: true,
          // RTL
          rtl: el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl',
          rtlTranslate: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || $el.css('direction') === 'rtl'),
          wrongRTL: $wrapperEl.css('display') === '-webkit-box'
        });
        return true;
      }

      init(el) {
        const swiper = this;
        if (swiper.initialized) return swiper;
        const mounted = swiper.mount(el);
        if (mounted === false) return swiper;
        swiper.emit('beforeInit'); // Set breakpoint

        if (swiper.params.breakpoints) {
          swiper.setBreakpoint();
        } // Add Classes


        swiper.addClasses(); // Create loop

        if (swiper.params.loop) {
          swiper.loopCreate();
        } // Update size


        swiper.updateSize(); // Update slides

        swiper.updateSlides();

        if (swiper.params.watchOverflow) {
          swiper.checkOverflow();
        } // Set Grab Cursor


        if (swiper.params.grabCursor && swiper.enabled) {
          swiper.setGrabCursor();
        }

        if (swiper.params.preloadImages) {
          swiper.preloadImages();
        } // Slide To Initial Slide


        if (swiper.params.loop) {
          swiper.slideTo(swiper.params.initialSlide + swiper.loopedSlides, 0, swiper.params.runCallbacksOnInit, false, true);
        } else {
          swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
        } // Attach events


        swiper.attachEvents(); // Init Flag

        swiper.initialized = true; // Emit

        swiper.emit('init');
        swiper.emit('afterInit');
        return swiper;
      }

      destroy(deleteInstance, cleanStyles) {
        if (deleteInstance === void 0) {
          deleteInstance = true;
        }

        if (cleanStyles === void 0) {
          cleanStyles = true;
        }

        const swiper = this;
        const {
          params,
          $el,
          $wrapperEl,
          slides
        } = swiper;

        if (typeof swiper.params === 'undefined' || swiper.destroyed) {
          return null;
        }

        swiper.emit('beforeDestroy'); // Init Flag

        swiper.initialized = false; // Detach events

        swiper.detachEvents(); // Destroy loop

        if (params.loop) {
          swiper.loopDestroy();
        } // Cleanup styles


        if (cleanStyles) {
          swiper.removeClasses();
          $el.removeAttr('style');
          $wrapperEl.removeAttr('style');

          if (slides && slides.length) {
            slides.removeClass([params.slideVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass].join(' ')).removeAttr('style').removeAttr('data-swiper-slide-index');
          }
        }

        swiper.emit('destroy'); // Detach emitter events

        Object.keys(swiper.eventsListeners).forEach(eventName => {
          swiper.off(eventName);
        });

        if (deleteInstance !== false) {
          swiper.$el[0].swiper = null;
          deleteProps(swiper);
        }

        swiper.destroyed = true;
        return null;
      }

      static extendDefaults(newDefaults) {
        extend(extendedDefaults, newDefaults);
      }

      static get extendedDefaults() {
        return extendedDefaults;
      }

      static get defaults() {
        return defaults;
      }

      static installModule(mod) {
        if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
        const modules = Swiper.prototype.__modules__;

        if (typeof mod === 'function' && modules.indexOf(mod) < 0) {
          modules.push(mod);
        }
      }

      static use(module) {
        if (Array.isArray(module)) {
          module.forEach(m => Swiper.installModule(m));
          return Swiper;
        }

        Swiper.installModule(module);
        return Swiper;
      }

    }

    Object.keys(prototypes).forEach(prototypeGroup => {
      Object.keys(prototypes[prototypeGroup]).forEach(protoMethod => {
        Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
      });
    });
    Swiper.use([Resize, Observer]);

    /* eslint-disable consistent-return */
    function Mousewheel(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const window = getWindow();
      extendParams({
        mousewheel: {
          enabled: false,
          releaseOnEdges: false,
          invert: false,
          forceToAxis: false,
          sensitivity: 1,
          eventsTarget: 'container',
          thresholdDelta: null,
          thresholdTime: null
        }
      });
      swiper.mousewheel = {
        enabled: false
      };
      let timeout;
      let lastScrollTime = now();
      let lastEventBeforeSnap;
      const recentWheelEvents = [];

      function normalize(e) {
        // Reasonable defaults
        const PIXEL_STEP = 10;
        const LINE_HEIGHT = 40;
        const PAGE_HEIGHT = 800;
        let sX = 0;
        let sY = 0; // spinX, spinY

        let pX = 0;
        let pY = 0; // pixelX, pixelY
        // Legacy

        if ('detail' in e) {
          sY = e.detail;
        }

        if ('wheelDelta' in e) {
          sY = -e.wheelDelta / 120;
        }

        if ('wheelDeltaY' in e) {
          sY = -e.wheelDeltaY / 120;
        }

        if ('wheelDeltaX' in e) {
          sX = -e.wheelDeltaX / 120;
        } // side scrolling on FF with DOMMouseScroll


        if ('axis' in e && e.axis === e.HORIZONTAL_AXIS) {
          sX = sY;
          sY = 0;
        }

        pX = sX * PIXEL_STEP;
        pY = sY * PIXEL_STEP;

        if ('deltaY' in e) {
          pY = e.deltaY;
        }

        if ('deltaX' in e) {
          pX = e.deltaX;
        }

        if (e.shiftKey && !pX) {
          // if user scrolls with shift he wants horizontal scroll
          pX = pY;
          pY = 0;
        }

        if ((pX || pY) && e.deltaMode) {
          if (e.deltaMode === 1) {
            // delta in LINE units
            pX *= LINE_HEIGHT;
            pY *= LINE_HEIGHT;
          } else {
            // delta in PAGE units
            pX *= PAGE_HEIGHT;
            pY *= PAGE_HEIGHT;
          }
        } // Fall-back if spin cannot be determined


        if (pX && !sX) {
          sX = pX < 1 ? -1 : 1;
        }

        if (pY && !sY) {
          sY = pY < 1 ? -1 : 1;
        }

        return {
          spinX: sX,
          spinY: sY,
          pixelX: pX,
          pixelY: pY
        };
      }

      function handleMouseEnter() {
        if (!swiper.enabled) return;
        swiper.mouseEntered = true;
      }

      function handleMouseLeave() {
        if (!swiper.enabled) return;
        swiper.mouseEntered = false;
      }

      function animateSlider(newEvent) {
        if (swiper.params.mousewheel.thresholdDelta && newEvent.delta < swiper.params.mousewheel.thresholdDelta) {
          // Prevent if delta of wheel scroll delta is below configured threshold
          return false;
        }

        if (swiper.params.mousewheel.thresholdTime && now() - lastScrollTime < swiper.params.mousewheel.thresholdTime) {
          // Prevent if time between scrolls is below configured threshold
          return false;
        } // If the movement is NOT big enough and
        // if the last time the user scrolled was too close to the current one (avoid continuously triggering the slider):
        //   Don't go any further (avoid insignificant scroll movement).


        if (newEvent.delta >= 6 && now() - lastScrollTime < 60) {
          // Return false as a default
          return true;
        } // If user is scrolling towards the end:
        //   If the slider hasn't hit the latest slide or
        //   if the slider is a loop and
        //   if the slider isn't moving right now:
        //     Go to next slide and
        //     emit a scroll event.
        // Else (the user is scrolling towards the beginning) and
        // if the slider hasn't hit the first slide or
        // if the slider is a loop and
        // if the slider isn't moving right now:
        //   Go to prev slide and
        //   emit a scroll event.


        if (newEvent.direction < 0) {
          if ((!swiper.isEnd || swiper.params.loop) && !swiper.animating) {
            swiper.slideNext();
            emit('scroll', newEvent.raw);
          }
        } else if ((!swiper.isBeginning || swiper.params.loop) && !swiper.animating) {
          swiper.slidePrev();
          emit('scroll', newEvent.raw);
        } // If you got here is because an animation has been triggered so store the current time


        lastScrollTime = new window.Date().getTime(); // Return false as a default

        return false;
      }

      function releaseScroll(newEvent) {
        const params = swiper.params.mousewheel;

        if (newEvent.direction < 0) {
          if (swiper.isEnd && !swiper.params.loop && params.releaseOnEdges) {
            // Return true to animate scroll on edges
            return true;
          }
        } else if (swiper.isBeginning && !swiper.params.loop && params.releaseOnEdges) {
          // Return true to animate scroll on edges
          return true;
        }

        return false;
      }

      function handle(event) {
        let e = event;
        let disableParentSwiper = true;
        if (!swiper.enabled) return;
        const params = swiper.params.mousewheel;

        if (swiper.params.cssMode) {
          e.preventDefault();
        }

        let target = swiper.$el;

        if (swiper.params.mousewheel.eventsTarget !== 'container') {
          target = $$1(swiper.params.mousewheel.eventsTarget);
        }

        if (!swiper.mouseEntered && !target[0].contains(e.target) && !params.releaseOnEdges) return true;
        if (e.originalEvent) e = e.originalEvent; // jquery fix

        let delta = 0;
        const rtlFactor = swiper.rtlTranslate ? -1 : 1;
        const data = normalize(e);

        if (params.forceToAxis) {
          if (swiper.isHorizontal()) {
            if (Math.abs(data.pixelX) > Math.abs(data.pixelY)) delta = -data.pixelX * rtlFactor;else return true;
          } else if (Math.abs(data.pixelY) > Math.abs(data.pixelX)) delta = -data.pixelY;else return true;
        } else {
          delta = Math.abs(data.pixelX) > Math.abs(data.pixelY) ? -data.pixelX * rtlFactor : -data.pixelY;
        }

        if (delta === 0) return true;
        if (params.invert) delta = -delta; // Get the scroll positions

        let positions = swiper.getTranslate() + delta * params.sensitivity;
        if (positions >= swiper.minTranslate()) positions = swiper.minTranslate();
        if (positions <= swiper.maxTranslate()) positions = swiper.maxTranslate(); // When loop is true:
        //     the disableParentSwiper will be true.
        // When loop is false:
        //     if the scroll positions is not on edge,
        //     then the disableParentSwiper will be true.
        //     if the scroll on edge positions,
        //     then the disableParentSwiper will be false.

        disableParentSwiper = swiper.params.loop ? true : !(positions === swiper.minTranslate() || positions === swiper.maxTranslate());
        if (disableParentSwiper && swiper.params.nested) e.stopPropagation();

        if (!swiper.params.freeMode || !swiper.params.freeMode.enabled) {
          // Register the new event in a variable which stores the relevant data
          const newEvent = {
            time: now(),
            delta: Math.abs(delta),
            direction: Math.sign(delta),
            raw: event
          }; // Keep the most recent events

          if (recentWheelEvents.length >= 2) {
            recentWheelEvents.shift(); // only store the last N events
          }

          const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : undefined;
          recentWheelEvents.push(newEvent); // If there is at least one previous recorded event:
          //   If direction has changed or
          //   if the scroll is quicker than the previous one:
          //     Animate the slider.
          // Else (this is the first time the wheel is moved):
          //     Animate the slider.

          if (prevEvent) {
            if (newEvent.direction !== prevEvent.direction || newEvent.delta > prevEvent.delta || newEvent.time > prevEvent.time + 150) {
              animateSlider(newEvent);
            }
          } else {
            animateSlider(newEvent);
          } // If it's time to release the scroll:
          //   Return now so you don't hit the preventDefault.


          if (releaseScroll(newEvent)) {
            return true;
          }
        } else {
          // Freemode or scrollContainer:
          // If we recently snapped after a momentum scroll, then ignore wheel events
          // to give time for the deceleration to finish. Stop ignoring after 500 msecs
          // or if it's a new scroll (larger delta or inverse sign as last event before
          // an end-of-momentum snap).
          const newEvent = {
            time: now(),
            delta: Math.abs(delta),
            direction: Math.sign(delta)
          };
          const ignoreWheelEvents = lastEventBeforeSnap && newEvent.time < lastEventBeforeSnap.time + 500 && newEvent.delta <= lastEventBeforeSnap.delta && newEvent.direction === lastEventBeforeSnap.direction;

          if (!ignoreWheelEvents) {
            lastEventBeforeSnap = undefined;

            if (swiper.params.loop) {
              swiper.loopFix();
            }

            let position = swiper.getTranslate() + delta * params.sensitivity;
            const wasBeginning = swiper.isBeginning;
            const wasEnd = swiper.isEnd;
            if (position >= swiper.minTranslate()) position = swiper.minTranslate();
            if (position <= swiper.maxTranslate()) position = swiper.maxTranslate();
            swiper.setTransition(0);
            swiper.setTranslate(position);
            swiper.updateProgress();
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();

            if (!wasBeginning && swiper.isBeginning || !wasEnd && swiper.isEnd) {
              swiper.updateSlidesClasses();
            }

            if (swiper.params.freeMode.sticky) {
              // When wheel scrolling starts with sticky (aka snap) enabled, then detect
              // the end of a momentum scroll by storing recent (N=15?) wheel events.
              // 1. do all N events have decreasing or same (absolute value) delta?
              // 2. did all N events arrive in the last M (M=500?) msecs?
              // 3. does the earliest event have an (absolute value) delta that's
              //    at least P (P=1?) larger than the most recent event's delta?
              // 4. does the latest event have a delta that's smaller than Q (Q=6?) pixels?
              // If 1-4 are "yes" then we're near the end of a momentum scroll deceleration.
              // Snap immediately and ignore remaining wheel events in this scroll.
              // See comment above for "remaining wheel events in this scroll" determination.
              // If 1-4 aren't satisfied, then wait to snap until 500ms after the last event.
              clearTimeout(timeout);
              timeout = undefined;

              if (recentWheelEvents.length >= 15) {
                recentWheelEvents.shift(); // only store the last N events
              }

              const prevEvent = recentWheelEvents.length ? recentWheelEvents[recentWheelEvents.length - 1] : undefined;
              const firstEvent = recentWheelEvents[0];
              recentWheelEvents.push(newEvent);

              if (prevEvent && (newEvent.delta > prevEvent.delta || newEvent.direction !== prevEvent.direction)) {
                // Increasing or reverse-sign delta means the user started scrolling again. Clear the wheel event log.
                recentWheelEvents.splice(0);
              } else if (recentWheelEvents.length >= 15 && newEvent.time - firstEvent.time < 500 && firstEvent.delta - newEvent.delta >= 1 && newEvent.delta <= 6) {
                // We're at the end of the deceleration of a momentum scroll, so there's no need
                // to wait for more events. Snap ASAP on the next tick.
                // Also, because there's some remaining momentum we'll bias the snap in the
                // direction of the ongoing scroll because it's better UX for the scroll to snap
                // in the same direction as the scroll instead of reversing to snap.  Therefore,
                // if it's already scrolled more than 20% in the current direction, keep going.
                const snapToThreshold = delta > 0 ? 0.8 : 0.2;
                lastEventBeforeSnap = newEvent;
                recentWheelEvents.splice(0);
                timeout = nextTick(() => {
                  swiper.slideToClosest(swiper.params.speed, true, undefined, snapToThreshold);
                }, 0); // no delay; move on next tick
              }

              if (!timeout) {
                // if we get here, then we haven't detected the end of a momentum scroll, so
                // we'll consider a scroll "complete" when there haven't been any wheel events
                // for 500ms.
                timeout = nextTick(() => {
                  const snapToThreshold = 0.5;
                  lastEventBeforeSnap = newEvent;
                  recentWheelEvents.splice(0);
                  swiper.slideToClosest(swiper.params.speed, true, undefined, snapToThreshold);
                }, 500);
              }
            } // Emit event


            if (!ignoreWheelEvents) emit('scroll', e); // Stop autoplay

            if (swiper.params.autoplay && swiper.params.autoplayDisableOnInteraction) swiper.autoplay.stop(); // Return page scroll on edge positions

            if (position === swiper.minTranslate() || position === swiper.maxTranslate()) return true;
          }
        }

        if (e.preventDefault) e.preventDefault();else e.returnValue = false;
        return false;
      }

      function events(method) {
        let target = swiper.$el;

        if (swiper.params.mousewheel.eventsTarget !== 'container') {
          target = $$1(swiper.params.mousewheel.eventsTarget);
        }

        target[method]('mouseenter', handleMouseEnter);
        target[method]('mouseleave', handleMouseLeave);
        target[method]('wheel', handle);
      }

      function enable() {
        if (swiper.params.cssMode) {
          swiper.wrapperEl.removeEventListener('wheel', handle);
          return true;
        }

        if (swiper.mousewheel.enabled) return false;
        events('on');
        swiper.mousewheel.enabled = true;
        return true;
      }

      function disable() {
        if (swiper.params.cssMode) {
          swiper.wrapperEl.addEventListener(event, handle);
          return true;
        }

        if (!swiper.mousewheel.enabled) return false;
        events('off');
        swiper.mousewheel.enabled = false;
        return true;
      }

      on('init', () => {
        if (!swiper.params.mousewheel.enabled && swiper.params.cssMode) {
          disable();
        }

        if (swiper.params.mousewheel.enabled) enable();
      });
      on('destroy', () => {
        if (swiper.params.cssMode) {
          enable();
        }

        if (swiper.mousewheel.enabled) disable();
      });
      Object.assign(swiper.mousewheel, {
        enable,
        disable
      });
    }

    function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
      const document = getDocument();

      if (swiper.params.createElements) {
        Object.keys(checkProps).forEach(key => {
          if (!params[key] && params.auto === true) {
            let element = swiper.$el.children(`.${checkProps[key]}`)[0];

            if (!element) {
              element = document.createElement('div');
              element.className = checkProps[key];
              swiper.$el.append(element);
            }

            params[key] = element;
            originalParams[key] = element;
          }
        });
      }

      return params;
    }

    function Navigation(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      extendParams({
        navigation: {
          nextEl: null,
          prevEl: null,
          hideOnClick: false,
          disabledClass: 'swiper-button-disabled',
          hiddenClass: 'swiper-button-hidden',
          lockClass: 'swiper-button-lock',
          navigationDisabledClass: 'swiper-navigation-disabled'
        }
      });
      swiper.navigation = {
        nextEl: null,
        $nextEl: null,
        prevEl: null,
        $prevEl: null
      };

      function getEl(el) {
        let $el;

        if (el) {
          $el = $$1(el);

          if (swiper.params.uniqueNavElements && typeof el === 'string' && $el.length > 1 && swiper.$el.find(el).length === 1) {
            $el = swiper.$el.find(el);
          }
        }

        return $el;
      }

      function toggleEl($el, disabled) {
        const params = swiper.params.navigation;

        if ($el && $el.length > 0) {
          $el[disabled ? 'addClass' : 'removeClass'](params.disabledClass);
          if ($el[0] && $el[0].tagName === 'BUTTON') $el[0].disabled = disabled;

          if (swiper.params.watchOverflow && swiper.enabled) {
            $el[swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
          }
        }
      }

      function update() {
        // Update Navigation Buttons
        if (swiper.params.loop) return;
        const {
          $nextEl,
          $prevEl
        } = swiper.navigation;
        toggleEl($prevEl, swiper.isBeginning && !swiper.params.rewind);
        toggleEl($nextEl, swiper.isEnd && !swiper.params.rewind);
      }

      function onPrevClick(e) {
        e.preventDefault();
        if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
        swiper.slidePrev();
        emit('navigationPrev');
      }

      function onNextClick(e) {
        e.preventDefault();
        if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
        swiper.slideNext();
        emit('navigationNext');
      }

      function init() {
        const params = swiper.params.navigation;
        swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
          nextEl: 'swiper-button-next',
          prevEl: 'swiper-button-prev'
        });
        if (!(params.nextEl || params.prevEl)) return;
        const $nextEl = getEl(params.nextEl);
        const $prevEl = getEl(params.prevEl);

        if ($nextEl && $nextEl.length > 0) {
          $nextEl.on('click', onNextClick);
        }

        if ($prevEl && $prevEl.length > 0) {
          $prevEl.on('click', onPrevClick);
        }

        Object.assign(swiper.navigation, {
          $nextEl,
          nextEl: $nextEl && $nextEl[0],
          $prevEl,
          prevEl: $prevEl && $prevEl[0]
        });

        if (!swiper.enabled) {
          if ($nextEl) $nextEl.addClass(params.lockClass);
          if ($prevEl) $prevEl.addClass(params.lockClass);
        }
      }

      function destroy() {
        const {
          $nextEl,
          $prevEl
        } = swiper.navigation;

        if ($nextEl && $nextEl.length) {
          $nextEl.off('click', onNextClick);
          $nextEl.removeClass(swiper.params.navigation.disabledClass);
        }

        if ($prevEl && $prevEl.length) {
          $prevEl.off('click', onPrevClick);
          $prevEl.removeClass(swiper.params.navigation.disabledClass);
        }
      }

      on('init', () => {
        if (swiper.params.navigation.enabled === false) {
          // eslint-disable-next-line
          disable();
        } else {
          init();
          update();
        }
      });
      on('toEdge fromEdge lock unlock', () => {
        update();
      });
      on('destroy', () => {
        destroy();
      });
      on('enable disable', () => {
        const {
          $nextEl,
          $prevEl
        } = swiper.navigation;

        if ($nextEl) {
          $nextEl[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.navigation.lockClass);
        }

        if ($prevEl) {
          $prevEl[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.navigation.lockClass);
        }
      });
      on('click', (_s, e) => {
        const {
          $nextEl,
          $prevEl
        } = swiper.navigation;
        const targetEl = e.target;

        if (swiper.params.navigation.hideOnClick && !$$1(targetEl).is($prevEl) && !$$1(targetEl).is($nextEl)) {
          if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
          let isHidden;

          if ($nextEl) {
            isHidden = $nextEl.hasClass(swiper.params.navigation.hiddenClass);
          } else if ($prevEl) {
            isHidden = $prevEl.hasClass(swiper.params.navigation.hiddenClass);
          }

          if (isHidden === true) {
            emit('navigationShow');
          } else {
            emit('navigationHide');
          }

          if ($nextEl) {
            $nextEl.toggleClass(swiper.params.navigation.hiddenClass);
          }

          if ($prevEl) {
            $prevEl.toggleClass(swiper.params.navigation.hiddenClass);
          }
        }
      });

      const enable = () => {
        swiper.$el.removeClass(swiper.params.navigation.navigationDisabledClass);
        init();
        update();
      };

      const disable = () => {
        swiper.$el.addClass(swiper.params.navigation.navigationDisabledClass);
        destroy();
      };

      Object.assign(swiper.navigation, {
        enable,
        disable,
        update,
        init,
        destroy
      });
    }

    function classesToSelector(classes) {
      if (classes === void 0) {
        classes = '';
      }

      return `.${classes.trim().replace(/([\.:!\/])/g, '\\$1') // eslint-disable-line
  .replace(/ /g, '.')}`;
    }

    function Pagination(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const pfx = 'swiper-pagination';
      extendParams({
        pagination: {
          el: null,
          bulletElement: 'span',
          clickable: false,
          hideOnClick: false,
          renderBullet: null,
          renderProgressbar: null,
          renderFraction: null,
          renderCustom: null,
          progressbarOpposite: false,
          type: 'bullets',
          // 'bullets' or 'progressbar' or 'fraction' or 'custom'
          dynamicBullets: false,
          dynamicMainBullets: 1,
          formatFractionCurrent: number => number,
          formatFractionTotal: number => number,
          bulletClass: `${pfx}-bullet`,
          bulletActiveClass: `${pfx}-bullet-active`,
          modifierClass: `${pfx}-`,
          currentClass: `${pfx}-current`,
          totalClass: `${pfx}-total`,
          hiddenClass: `${pfx}-hidden`,
          progressbarFillClass: `${pfx}-progressbar-fill`,
          progressbarOppositeClass: `${pfx}-progressbar-opposite`,
          clickableClass: `${pfx}-clickable`,
          lockClass: `${pfx}-lock`,
          horizontalClass: `${pfx}-horizontal`,
          verticalClass: `${pfx}-vertical`,
          paginationDisabledClass: `${pfx}-disabled`
        }
      });
      swiper.pagination = {
        el: null,
        $el: null,
        bullets: []
      };
      let bulletSize;
      let dynamicBulletIndex = 0;

      function isPaginationDisabled() {
        return !swiper.params.pagination.el || !swiper.pagination.el || !swiper.pagination.$el || swiper.pagination.$el.length === 0;
      }

      function setSideBullets($bulletEl, position) {
        const {
          bulletActiveClass
        } = swiper.params.pagination;
        $bulletEl[position]().addClass(`${bulletActiveClass}-${position}`)[position]().addClass(`${bulletActiveClass}-${position}-${position}`);
      }

      function update() {
        // Render || Update Pagination bullets/items
        const rtl = swiper.rtl;
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
        const $el = swiper.pagination.$el; // Current/Total

        let current;
        const total = swiper.params.loop ? Math.ceil((slidesLength - swiper.loopedSlides * 2) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;

        if (swiper.params.loop) {
          current = Math.ceil((swiper.activeIndex - swiper.loopedSlides) / swiper.params.slidesPerGroup);

          if (current > slidesLength - 1 - swiper.loopedSlides * 2) {
            current -= slidesLength - swiper.loopedSlides * 2;
          }

          if (current > total - 1) current -= total;
          if (current < 0 && swiper.params.paginationType !== 'bullets') current = total + current;
        } else if (typeof swiper.snapIndex !== 'undefined') {
          current = swiper.snapIndex;
        } else {
          current = swiper.activeIndex || 0;
        } // Types


        if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
          const bullets = swiper.pagination.bullets;
          let firstIndex;
          let lastIndex;
          let midIndex;

          if (params.dynamicBullets) {
            bulletSize = bullets.eq(0)[swiper.isHorizontal() ? 'outerWidth' : 'outerHeight'](true);
            $el.css(swiper.isHorizontal() ? 'width' : 'height', `${bulletSize * (params.dynamicMainBullets + 4)}px`);

            if (params.dynamicMainBullets > 1 && swiper.previousIndex !== undefined) {
              dynamicBulletIndex += current - (swiper.previousIndex - swiper.loopedSlides || 0);

              if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
                dynamicBulletIndex = params.dynamicMainBullets - 1;
              } else if (dynamicBulletIndex < 0) {
                dynamicBulletIndex = 0;
              }
            }

            firstIndex = Math.max(current - dynamicBulletIndex, 0);
            lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
            midIndex = (lastIndex + firstIndex) / 2;
          }

          bullets.removeClass(['', '-next', '-next-next', '-prev', '-prev-prev', '-main'].map(suffix => `${params.bulletActiveClass}${suffix}`).join(' '));

          if ($el.length > 1) {
            bullets.each(bullet => {
              const $bullet = $$1(bullet);
              const bulletIndex = $bullet.index();

              if (bulletIndex === current) {
                $bullet.addClass(params.bulletActiveClass);
              }

              if (params.dynamicBullets) {
                if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
                  $bullet.addClass(`${params.bulletActiveClass}-main`);
                }

                if (bulletIndex === firstIndex) {
                  setSideBullets($bullet, 'prev');
                }

                if (bulletIndex === lastIndex) {
                  setSideBullets($bullet, 'next');
                }
              }
            });
          } else {
            const $bullet = bullets.eq(current);
            const bulletIndex = $bullet.index();
            $bullet.addClass(params.bulletActiveClass);

            if (params.dynamicBullets) {
              const $firstDisplayedBullet = bullets.eq(firstIndex);
              const $lastDisplayedBullet = bullets.eq(lastIndex);

              for (let i = firstIndex; i <= lastIndex; i += 1) {
                bullets.eq(i).addClass(`${params.bulletActiveClass}-main`);
              }

              if (swiper.params.loop) {
                if (bulletIndex >= bullets.length) {
                  for (let i = params.dynamicMainBullets; i >= 0; i -= 1) {
                    bullets.eq(bullets.length - i).addClass(`${params.bulletActiveClass}-main`);
                  }

                  bullets.eq(bullets.length - params.dynamicMainBullets - 1).addClass(`${params.bulletActiveClass}-prev`);
                } else {
                  setSideBullets($firstDisplayedBullet, 'prev');
                  setSideBullets($lastDisplayedBullet, 'next');
                }
              } else {
                setSideBullets($firstDisplayedBullet, 'prev');
                setSideBullets($lastDisplayedBullet, 'next');
              }
            }
          }

          if (params.dynamicBullets) {
            const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
            const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
            const offsetProp = rtl ? 'right' : 'left';
            bullets.css(swiper.isHorizontal() ? offsetProp : 'top', `${bulletsOffset}px`);
          }
        }

        if (params.type === 'fraction') {
          $el.find(classesToSelector(params.currentClass)).text(params.formatFractionCurrent(current + 1));
          $el.find(classesToSelector(params.totalClass)).text(params.formatFractionTotal(total));
        }

        if (params.type === 'progressbar') {
          let progressbarDirection;

          if (params.progressbarOpposite) {
            progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
          } else {
            progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
          }

          const scale = (current + 1) / total;
          let scaleX = 1;
          let scaleY = 1;

          if (progressbarDirection === 'horizontal') {
            scaleX = scale;
          } else {
            scaleY = scale;
          }

          $el.find(classesToSelector(params.progressbarFillClass)).transform(`translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`).transition(swiper.params.speed);
        }

        if (params.type === 'custom' && params.renderCustom) {
          $el.html(params.renderCustom(swiper, current + 1, total));
          emit('paginationRender', $el[0]);
        } else {
          emit('paginationUpdate', $el[0]);
        }

        if (swiper.params.watchOverflow && swiper.enabled) {
          $el[swiper.isLocked ? 'addClass' : 'removeClass'](params.lockClass);
        }
      }

      function render() {
        // Render Container
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
        const $el = swiper.pagination.$el;
        let paginationHTML = '';

        if (params.type === 'bullets') {
          let numberOfBullets = swiper.params.loop ? Math.ceil((slidesLength - swiper.loopedSlides * 2) / swiper.params.slidesPerGroup) : swiper.snapGrid.length;

          if (swiper.params.freeMode && swiper.params.freeMode.enabled && !swiper.params.loop && numberOfBullets > slidesLength) {
            numberOfBullets = slidesLength;
          }

          for (let i = 0; i < numberOfBullets; i += 1) {
            if (params.renderBullet) {
              paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
            } else {
              paginationHTML += `<${params.bulletElement} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
          }

          $el.html(paginationHTML);
          swiper.pagination.bullets = $el.find(classesToSelector(params.bulletClass));
        }

        if (params.type === 'fraction') {
          if (params.renderFraction) {
            paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
          } else {
            paginationHTML = `<span class="${params.currentClass}"></span>` + ' / ' + `<span class="${params.totalClass}"></span>`;
          }

          $el.html(paginationHTML);
        }

        if (params.type === 'progressbar') {
          if (params.renderProgressbar) {
            paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
          } else {
            paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
          }

          $el.html(paginationHTML);
        }

        if (params.type !== 'custom') {
          emit('paginationRender', swiper.pagination.$el[0]);
        }
      }

      function init() {
        swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
          el: 'swiper-pagination'
        });
        const params = swiper.params.pagination;
        if (!params.el) return;
        let $el = $$1(params.el);
        if ($el.length === 0) return;

        if (swiper.params.uniqueNavElements && typeof params.el === 'string' && $el.length > 1) {
          $el = swiper.$el.find(params.el); // check if it belongs to another nested Swiper

          if ($el.length > 1) {
            $el = $el.filter(el => {
              if ($$1(el).parents('.swiper')[0] !== swiper.el) return false;
              return true;
            });
          }
        }

        if (params.type === 'bullets' && params.clickable) {
          $el.addClass(params.clickableClass);
        }

        $el.addClass(params.modifierClass + params.type);
        $el.addClass(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);

        if (params.type === 'bullets' && params.dynamicBullets) {
          $el.addClass(`${params.modifierClass}${params.type}-dynamic`);
          dynamicBulletIndex = 0;

          if (params.dynamicMainBullets < 1) {
            params.dynamicMainBullets = 1;
          }
        }

        if (params.type === 'progressbar' && params.progressbarOpposite) {
          $el.addClass(params.progressbarOppositeClass);
        }

        if (params.clickable) {
          $el.on('click', classesToSelector(params.bulletClass), function onClick(e) {
            e.preventDefault();
            let index = $$1(this).index() * swiper.params.slidesPerGroup;
            if (swiper.params.loop) index += swiper.loopedSlides;
            swiper.slideTo(index);
          });
        }

        Object.assign(swiper.pagination, {
          $el,
          el: $el[0]
        });

        if (!swiper.enabled) {
          $el.addClass(params.lockClass);
        }
      }

      function destroy() {
        const params = swiper.params.pagination;
        if (isPaginationDisabled()) return;
        const $el = swiper.pagination.$el;
        $el.removeClass(params.hiddenClass);
        $el.removeClass(params.modifierClass + params.type);
        $el.removeClass(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        if (swiper.pagination.bullets && swiper.pagination.bullets.removeClass) swiper.pagination.bullets.removeClass(params.bulletActiveClass);

        if (params.clickable) {
          $el.off('click', classesToSelector(params.bulletClass));
        }
      }

      on('init', () => {
        if (swiper.params.pagination.enabled === false) {
          // eslint-disable-next-line
          disable();
        } else {
          init();
          render();
          update();
        }
      });
      on('activeIndexChange', () => {
        if (swiper.params.loop) {
          update();
        } else if (typeof swiper.snapIndex === 'undefined') {
          update();
        }
      });
      on('snapIndexChange', () => {
        if (!swiper.params.loop) {
          update();
        }
      });
      on('slidesLengthChange', () => {
        if (swiper.params.loop) {
          render();
          update();
        }
      });
      on('snapGridLengthChange', () => {
        if (!swiper.params.loop) {
          render();
          update();
        }
      });
      on('destroy', () => {
        destroy();
      });
      on('enable disable', () => {
        const {
          $el
        } = swiper.pagination;

        if ($el) {
          $el[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.pagination.lockClass);
        }
      });
      on('lock unlock', () => {
        update();
      });
      on('click', (_s, e) => {
        const targetEl = e.target;
        const {
          $el
        } = swiper.pagination;

        if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && $el && $el.length > 0 && !$$1(targetEl).hasClass(swiper.params.pagination.bulletClass)) {
          if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
          const isHidden = $el.hasClass(swiper.params.pagination.hiddenClass);

          if (isHidden === true) {
            emit('paginationShow');
          } else {
            emit('paginationHide');
          }

          $el.toggleClass(swiper.params.pagination.hiddenClass);
        }
      });

      const enable = () => {
        swiper.$el.removeClass(swiper.params.pagination.paginationDisabledClass);

        if (swiper.pagination.$el) {
          swiper.pagination.$el.removeClass(swiper.params.pagination.paginationDisabledClass);
        }

        init();
        render();
        update();
      };

      const disable = () => {
        swiper.$el.addClass(swiper.params.pagination.paginationDisabledClass);

        if (swiper.pagination.$el) {
          swiper.pagination.$el.addClass(swiper.params.pagination.paginationDisabledClass);
        }

        destroy();
      };

      Object.assign(swiper.pagination, {
        enable,
        disable,
        render,
        update,
        init,
        destroy
      });
    }

    function Scrollbar(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      const document = getDocument();
      let isTouched = false;
      let timeout = null;
      let dragTimeout = null;
      let dragStartPos;
      let dragSize;
      let trackSize;
      let divider;
      extendParams({
        scrollbar: {
          el: null,
          dragSize: 'auto',
          hide: false,
          draggable: false,
          snapOnRelease: true,
          lockClass: 'swiper-scrollbar-lock',
          dragClass: 'swiper-scrollbar-drag',
          scrollbarDisabledClass: 'swiper-scrollbar-disabled',
          horizontalClass: `swiper-scrollbar-horizontal`,
          verticalClass: `swiper-scrollbar-vertical`
        }
      });
      swiper.scrollbar = {
        el: null,
        dragEl: null,
        $el: null,
        $dragEl: null
      };

      function setTranslate() {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        const {
          scrollbar,
          rtlTranslate: rtl,
          progress
        } = swiper;
        const {
          $dragEl,
          $el
        } = scrollbar;
        const params = swiper.params.scrollbar;
        let newSize = dragSize;
        let newPos = (trackSize - dragSize) * progress;

        if (rtl) {
          newPos = -newPos;

          if (newPos > 0) {
            newSize = dragSize - newPos;
            newPos = 0;
          } else if (-newPos + dragSize > trackSize) {
            newSize = trackSize + newPos;
          }
        } else if (newPos < 0) {
          newSize = dragSize + newPos;
          newPos = 0;
        } else if (newPos + dragSize > trackSize) {
          newSize = trackSize - newPos;
        }

        if (swiper.isHorizontal()) {
          $dragEl.transform(`translate3d(${newPos}px, 0, 0)`);
          $dragEl[0].style.width = `${newSize}px`;
        } else {
          $dragEl.transform(`translate3d(0px, ${newPos}px, 0)`);
          $dragEl[0].style.height = `${newSize}px`;
        }

        if (params.hide) {
          clearTimeout(timeout);
          $el[0].style.opacity = 1;
          timeout = setTimeout(() => {
            $el[0].style.opacity = 0;
            $el.transition(400);
          }, 1000);
        }
      }

      function setTransition(duration) {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        swiper.scrollbar.$dragEl.transition(duration);
      }

      function updateSize() {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        const {
          scrollbar
        } = swiper;
        const {
          $dragEl,
          $el
        } = scrollbar;
        $dragEl[0].style.width = '';
        $dragEl[0].style.height = '';
        trackSize = swiper.isHorizontal() ? $el[0].offsetWidth : $el[0].offsetHeight;
        divider = swiper.size / (swiper.virtualSize + swiper.params.slidesOffsetBefore - (swiper.params.centeredSlides ? swiper.snapGrid[0] : 0));

        if (swiper.params.scrollbar.dragSize === 'auto') {
          dragSize = trackSize * divider;
        } else {
          dragSize = parseInt(swiper.params.scrollbar.dragSize, 10);
        }

        if (swiper.isHorizontal()) {
          $dragEl[0].style.width = `${dragSize}px`;
        } else {
          $dragEl[0].style.height = `${dragSize}px`;
        }

        if (divider >= 1) {
          $el[0].style.display = 'none';
        } else {
          $el[0].style.display = '';
        }

        if (swiper.params.scrollbar.hide) {
          $el[0].style.opacity = 0;
        }

        if (swiper.params.watchOverflow && swiper.enabled) {
          scrollbar.$el[swiper.isLocked ? 'addClass' : 'removeClass'](swiper.params.scrollbar.lockClass);
        }
      }

      function getPointerPosition(e) {
        if (swiper.isHorizontal()) {
          return e.type === 'touchstart' || e.type === 'touchmove' ? e.targetTouches[0].clientX : e.clientX;
        }

        return e.type === 'touchstart' || e.type === 'touchmove' ? e.targetTouches[0].clientY : e.clientY;
      }

      function setDragPosition(e) {
        const {
          scrollbar,
          rtlTranslate: rtl
        } = swiper;
        const {
          $el
        } = scrollbar;
        let positionRatio;
        positionRatio = (getPointerPosition(e) - $el.offset()[swiper.isHorizontal() ? 'left' : 'top'] - (dragStartPos !== null ? dragStartPos : dragSize / 2)) / (trackSize - dragSize);
        positionRatio = Math.max(Math.min(positionRatio, 1), 0);

        if (rtl) {
          positionRatio = 1 - positionRatio;
        }

        const position = swiper.minTranslate() + (swiper.maxTranslate() - swiper.minTranslate()) * positionRatio;
        swiper.updateProgress(position);
        swiper.setTranslate(position);
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
      }

      function onDragStart(e) {
        const params = swiper.params.scrollbar;
        const {
          scrollbar,
          $wrapperEl
        } = swiper;
        const {
          $el,
          $dragEl
        } = scrollbar;
        isTouched = true;
        dragStartPos = e.target === $dragEl[0] || e.target === $dragEl ? getPointerPosition(e) - e.target.getBoundingClientRect()[swiper.isHorizontal() ? 'left' : 'top'] : null;
        e.preventDefault();
        e.stopPropagation();
        $wrapperEl.transition(100);
        $dragEl.transition(100);
        setDragPosition(e);
        clearTimeout(dragTimeout);
        $el.transition(0);

        if (params.hide) {
          $el.css('opacity', 1);
        }

        if (swiper.params.cssMode) {
          swiper.$wrapperEl.css('scroll-snap-type', 'none');
        }

        emit('scrollbarDragStart', e);
      }

      function onDragMove(e) {
        const {
          scrollbar,
          $wrapperEl
        } = swiper;
        const {
          $el,
          $dragEl
        } = scrollbar;
        if (!isTouched) return;
        if (e.preventDefault) e.preventDefault();else e.returnValue = false;
        setDragPosition(e);
        $wrapperEl.transition(0);
        $el.transition(0);
        $dragEl.transition(0);
        emit('scrollbarDragMove', e);
      }

      function onDragEnd(e) {
        const params = swiper.params.scrollbar;
        const {
          scrollbar,
          $wrapperEl
        } = swiper;
        const {
          $el
        } = scrollbar;
        if (!isTouched) return;
        isTouched = false;

        if (swiper.params.cssMode) {
          swiper.$wrapperEl.css('scroll-snap-type', '');
          $wrapperEl.transition('');
        }

        if (params.hide) {
          clearTimeout(dragTimeout);
          dragTimeout = nextTick(() => {
            $el.css('opacity', 0);
            $el.transition(400);
          }, 1000);
        }

        emit('scrollbarDragEnd', e);

        if (params.snapOnRelease) {
          swiper.slideToClosest();
        }
      }

      function events(method) {
        const {
          scrollbar,
          touchEventsTouch,
          touchEventsDesktop,
          params,
          support
        } = swiper;
        const $el = scrollbar.$el;
        if (!$el) return;
        const target = $el[0];
        const activeListener = support.passiveListener && params.passiveListeners ? {
          passive: false,
          capture: false
        } : false;
        const passiveListener = support.passiveListener && params.passiveListeners ? {
          passive: true,
          capture: false
        } : false;
        if (!target) return;
        const eventMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';

        if (!support.touch) {
          target[eventMethod](touchEventsDesktop.start, onDragStart, activeListener);
          document[eventMethod](touchEventsDesktop.move, onDragMove, activeListener);
          document[eventMethod](touchEventsDesktop.end, onDragEnd, passiveListener);
        } else {
          target[eventMethod](touchEventsTouch.start, onDragStart, activeListener);
          target[eventMethod](touchEventsTouch.move, onDragMove, activeListener);
          target[eventMethod](touchEventsTouch.end, onDragEnd, passiveListener);
        }
      }

      function enableDraggable() {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        events('on');
      }

      function disableDraggable() {
        if (!swiper.params.scrollbar.el || !swiper.scrollbar.el) return;
        events('off');
      }

      function init() {
        const {
          scrollbar,
          $el: $swiperEl
        } = swiper;
        swiper.params.scrollbar = createElementIfNotDefined(swiper, swiper.originalParams.scrollbar, swiper.params.scrollbar, {
          el: 'swiper-scrollbar'
        });
        const params = swiper.params.scrollbar;
        if (!params.el) return;
        let $el = $$1(params.el);

        if (swiper.params.uniqueNavElements && typeof params.el === 'string' && $el.length > 1 && $swiperEl.find(params.el).length === 1) {
          $el = $swiperEl.find(params.el);
        }

        $el.addClass(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        let $dragEl = $el.find(`.${swiper.params.scrollbar.dragClass}`);

        if ($dragEl.length === 0) {
          $dragEl = $$1(`<div class="${swiper.params.scrollbar.dragClass}"></div>`);
          $el.append($dragEl);
        }

        Object.assign(scrollbar, {
          $el,
          el: $el[0],
          $dragEl,
          dragEl: $dragEl[0]
        });

        if (params.draggable) {
          enableDraggable();
        }

        if ($el) {
          $el[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.scrollbar.lockClass);
        }
      }

      function destroy() {
        const params = swiper.params.scrollbar;
        const $el = swiper.scrollbar.$el;

        if ($el) {
          $el.removeClass(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        }

        disableDraggable();
      }

      on('init', () => {
        if (swiper.params.scrollbar.enabled === false) {
          // eslint-disable-next-line
          disable();
        } else {
          init();
          updateSize();
          setTranslate();
        }
      });
      on('update resize observerUpdate lock unlock', () => {
        updateSize();
      });
      on('setTranslate', () => {
        setTranslate();
      });
      on('setTransition', (_s, duration) => {
        setTransition(duration);
      });
      on('enable disable', () => {
        const {
          $el
        } = swiper.scrollbar;

        if ($el) {
          $el[swiper.enabled ? 'removeClass' : 'addClass'](swiper.params.scrollbar.lockClass);
        }
      });
      on('destroy', () => {
        destroy();
      });

      const enable = () => {
        swiper.$el.removeClass(swiper.params.scrollbar.scrollbarDisabledClass);

        if (swiper.scrollbar.$el) {
          swiper.scrollbar.$el.removeClass(swiper.params.scrollbar.scrollbarDisabledClass);
        }

        init();
        updateSize();
        setTranslate();
      };

      const disable = () => {
        swiper.$el.addClass(swiper.params.scrollbar.scrollbarDisabledClass);

        if (swiper.scrollbar.$el) {
          swiper.scrollbar.$el.addClass(swiper.params.scrollbar.scrollbarDisabledClass);
        }

        destroy();
      };

      Object.assign(swiper.scrollbar, {
        enable,
        disable,
        updateSize,
        setTranslate,
        init,
        destroy
      });
    }

    function Parallax(_ref) {
      let {
        swiper,
        extendParams,
        on
      } = _ref;
      extendParams({
        parallax: {
          enabled: false
        }
      });

      const setTransform = (el, progress) => {
        const {
          rtl
        } = swiper;
        const $el = $$1(el);
        const rtlFactor = rtl ? -1 : 1;
        const p = $el.attr('data-swiper-parallax') || '0';
        let x = $el.attr('data-swiper-parallax-x');
        let y = $el.attr('data-swiper-parallax-y');
        const scale = $el.attr('data-swiper-parallax-scale');
        const opacity = $el.attr('data-swiper-parallax-opacity');

        if (x || y) {
          x = x || '0';
          y = y || '0';
        } else if (swiper.isHorizontal()) {
          x = p;
          y = '0';
        } else {
          y = p;
          x = '0';
        }

        if (x.indexOf('%') >= 0) {
          x = `${parseInt(x, 10) * progress * rtlFactor}%`;
        } else {
          x = `${x * progress * rtlFactor}px`;
        }

        if (y.indexOf('%') >= 0) {
          y = `${parseInt(y, 10) * progress}%`;
        } else {
          y = `${y * progress}px`;
        }

        if (typeof opacity !== 'undefined' && opacity !== null) {
          const currentOpacity = opacity - (opacity - 1) * (1 - Math.abs(progress));
          $el[0].style.opacity = currentOpacity;
        }

        if (typeof scale === 'undefined' || scale === null) {
          $el.transform(`translate3d(${x}, ${y}, 0px)`);
        } else {
          const currentScale = scale - (scale - 1) * (1 - Math.abs(progress));
          $el.transform(`translate3d(${x}, ${y}, 0px) scale(${currentScale})`);
        }
      };

      const setTranslate = () => {
        const {
          $el,
          slides,
          progress,
          snapGrid
        } = swiper;
        $el.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]').each(el => {
          setTransform(el, progress);
        });
        slides.each((slideEl, slideIndex) => {
          let slideProgress = slideEl.progress;

          if (swiper.params.slidesPerGroup > 1 && swiper.params.slidesPerView !== 'auto') {
            slideProgress += Math.ceil(slideIndex / 2) - progress * (snapGrid.length - 1);
          }

          slideProgress = Math.min(Math.max(slideProgress, -1), 1);
          $$1(slideEl).find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]').each(el => {
            setTransform(el, slideProgress);
          });
        });
      };

      const setTransition = function (duration) {
        if (duration === void 0) {
          duration = swiper.params.speed;
        }

        const {
          $el
        } = swiper;
        $el.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]').each(parallaxEl => {
          const $parallaxEl = $$1(parallaxEl);
          let parallaxDuration = parseInt($parallaxEl.attr('data-swiper-parallax-duration'), 10) || duration;
          if (duration === 0) parallaxDuration = 0;
          $parallaxEl.transition(parallaxDuration);
        });
      };

      on('beforeInit', () => {
        if (!swiper.params.parallax.enabled) return;
        swiper.params.watchSlidesProgress = true;
        swiper.originalParams.watchSlidesProgress = true;
      });
      on('init', () => {
        if (!swiper.params.parallax.enabled) return;
        setTranslate();
      });
      on('setTranslate', () => {
        if (!swiper.params.parallax.enabled) return;
        setTranslate();
      });
      on('setTransition', (_swiper, duration) => {
        if (!swiper.params.parallax.enabled) return;
        setTransition(duration);
      });
    }

    /* eslint no-underscore-dangle: "off" */
    function Autoplay(_ref) {
      let {
        swiper,
        extendParams,
        on,
        emit
      } = _ref;
      let timeout;
      swiper.autoplay = {
        running: false,
        paused: false
      };
      extendParams({
        autoplay: {
          enabled: false,
          delay: 3000,
          waitForTransition: true,
          disableOnInteraction: true,
          stopOnLastSlide: false,
          reverseDirection: false,
          pauseOnMouseEnter: false
        }
      });

      function run() {
        if (!swiper.size) {
          swiper.autoplay.running = false;
          swiper.autoplay.paused = false;
          return;
        }

        const $activeSlideEl = swiper.slides.eq(swiper.activeIndex);
        let delay = swiper.params.autoplay.delay;

        if ($activeSlideEl.attr('data-swiper-autoplay')) {
          delay = $activeSlideEl.attr('data-swiper-autoplay') || swiper.params.autoplay.delay;
        }

        clearTimeout(timeout);
        timeout = nextTick(() => {
          let autoplayResult;

          if (swiper.params.autoplay.reverseDirection) {
            if (swiper.params.loop) {
              swiper.loopFix();
              autoplayResult = swiper.slidePrev(swiper.params.speed, true, true);
              emit('autoplay');
            } else if (!swiper.isBeginning) {
              autoplayResult = swiper.slidePrev(swiper.params.speed, true, true);
              emit('autoplay');
            } else if (!swiper.params.autoplay.stopOnLastSlide) {
              autoplayResult = swiper.slideTo(swiper.slides.length - 1, swiper.params.speed, true, true);
              emit('autoplay');
            } else {
              stop();
            }
          } else if (swiper.params.loop) {
            swiper.loopFix();
            autoplayResult = swiper.slideNext(swiper.params.speed, true, true);
            emit('autoplay');
          } else if (!swiper.isEnd) {
            autoplayResult = swiper.slideNext(swiper.params.speed, true, true);
            emit('autoplay');
          } else if (!swiper.params.autoplay.stopOnLastSlide) {
            autoplayResult = swiper.slideTo(0, swiper.params.speed, true, true);
            emit('autoplay');
          } else {
            stop();
          }

          if (swiper.params.cssMode && swiper.autoplay.running) run();else if (autoplayResult === false) {
            run();
          }
        }, delay);
      }

      function start() {
        if (typeof timeout !== 'undefined') return false;
        if (swiper.autoplay.running) return false;
        swiper.autoplay.running = true;
        emit('autoplayStart');
        run();
        return true;
      }

      function stop() {
        if (!swiper.autoplay.running) return false;
        if (typeof timeout === 'undefined') return false;

        if (timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }

        swiper.autoplay.running = false;
        emit('autoplayStop');
        return true;
      }

      function pause(speed) {
        if (!swiper.autoplay.running) return;
        if (swiper.autoplay.paused) return;
        if (timeout) clearTimeout(timeout);
        swiper.autoplay.paused = true;

        if (speed === 0 || !swiper.params.autoplay.waitForTransition) {
          swiper.autoplay.paused = false;
          run();
        } else {
          ['transitionend', 'webkitTransitionEnd'].forEach(event => {
            swiper.$wrapperEl[0].addEventListener(event, onTransitionEnd);
          });
        }
      }

      function onVisibilityChange() {
        const document = getDocument();

        if (document.visibilityState === 'hidden' && swiper.autoplay.running) {
          pause();
        }

        if (document.visibilityState === 'visible' && swiper.autoplay.paused) {
          run();
          swiper.autoplay.paused = false;
        }
      }

      function onTransitionEnd(e) {
        if (!swiper || swiper.destroyed || !swiper.$wrapperEl) return;
        if (e.target !== swiper.$wrapperEl[0]) return;
        ['transitionend', 'webkitTransitionEnd'].forEach(event => {
          swiper.$wrapperEl[0].removeEventListener(event, onTransitionEnd);
        });
        swiper.autoplay.paused = false;

        if (!swiper.autoplay.running) {
          stop();
        } else {
          run();
        }
      }

      function onMouseEnter() {
        if (swiper.params.autoplay.disableOnInteraction) {
          stop();
        } else {
          emit('autoplayPause');
          pause();
        }

        ['transitionend', 'webkitTransitionEnd'].forEach(event => {
          swiper.$wrapperEl[0].removeEventListener(event, onTransitionEnd);
        });
      }

      function onMouseLeave() {
        if (swiper.params.autoplay.disableOnInteraction) {
          return;
        }

        swiper.autoplay.paused = false;
        emit('autoplayResume');
        run();
      }

      function attachMouseEvents() {
        if (swiper.params.autoplay.pauseOnMouseEnter) {
          swiper.$el.on('mouseenter', onMouseEnter);
          swiper.$el.on('mouseleave', onMouseLeave);
        }
      }

      function detachMouseEvents() {
        swiper.$el.off('mouseenter', onMouseEnter);
        swiper.$el.off('mouseleave', onMouseLeave);
      }

      on('init', () => {
        if (swiper.params.autoplay.enabled) {
          start();
          const document = getDocument();
          document.addEventListener('visibilitychange', onVisibilityChange);
          attachMouseEvents();
        }
      });
      on('beforeTransitionStart', (_s, speed, internal) => {
        if (swiper.autoplay.running) {
          if (internal || !swiper.params.autoplay.disableOnInteraction) {
            swiper.autoplay.pause(speed);
          } else {
            stop();
          }
        }
      });
      on('sliderFirstMove', () => {
        if (swiper.autoplay.running) {
          if (swiper.params.autoplay.disableOnInteraction) {
            stop();
          } else {
            pause();
          }
        }
      });
      on('touchEnd', () => {
        if (swiper.params.cssMode && swiper.autoplay.paused && !swiper.params.autoplay.disableOnInteraction) {
          run();
        }
      });
      on('destroy', () => {
        detachMouseEvents();

        if (swiper.autoplay.running) {
          stop();
        }

        const document = getDocument();
        document.removeEventListener('visibilitychange', onVisibilityChange);
      });
      Object.assign(swiper.autoplay, {
        pause,
        run,
        start,
        stop
      });
    }

    function freeMode(_ref) {
      let {
        swiper,
        extendParams,
        emit,
        once
      } = _ref;
      extendParams({
        freeMode: {
          enabled: false,
          momentum: true,
          momentumRatio: 1,
          momentumBounce: true,
          momentumBounceRatio: 1,
          momentumVelocityRatio: 1,
          sticky: false,
          minimumVelocity: 0.02
        }
      });

      function onTouchStart() {
        const translate = swiper.getTranslate();
        swiper.setTranslate(translate);
        swiper.setTransition(0);
        swiper.touchEventsData.velocities.length = 0;
        swiper.freeMode.onTouchEnd({
          currentPos: swiper.rtl ? swiper.translate : -swiper.translate
        });
      }

      function onTouchMove() {
        const {
          touchEventsData: data,
          touches
        } = swiper; // Velocity

        if (data.velocities.length === 0) {
          data.velocities.push({
            position: touches[swiper.isHorizontal() ? 'startX' : 'startY'],
            time: data.touchStartTime
          });
        }

        data.velocities.push({
          position: touches[swiper.isHorizontal() ? 'currentX' : 'currentY'],
          time: now()
        });
      }

      function onTouchEnd(_ref2) {
        let {
          currentPos
        } = _ref2;
        const {
          params,
          $wrapperEl,
          rtlTranslate: rtl,
          snapGrid,
          touchEventsData: data
        } = swiper; // Time diff

        const touchEndTime = now();
        const timeDiff = touchEndTime - data.touchStartTime;

        if (currentPos < -swiper.minTranslate()) {
          swiper.slideTo(swiper.activeIndex);
          return;
        }

        if (currentPos > -swiper.maxTranslate()) {
          if (swiper.slides.length < snapGrid.length) {
            swiper.slideTo(snapGrid.length - 1);
          } else {
            swiper.slideTo(swiper.slides.length - 1);
          }

          return;
        }

        if (params.freeMode.momentum) {
          if (data.velocities.length > 1) {
            const lastMoveEvent = data.velocities.pop();
            const velocityEvent = data.velocities.pop();
            const distance = lastMoveEvent.position - velocityEvent.position;
            const time = lastMoveEvent.time - velocityEvent.time;
            swiper.velocity = distance / time;
            swiper.velocity /= 2;

            if (Math.abs(swiper.velocity) < params.freeMode.minimumVelocity) {
              swiper.velocity = 0;
            } // this implies that the user stopped moving a finger then released.
            // There would be no events with distance zero, so the last event is stale.


            if (time > 150 || now() - lastMoveEvent.time > 300) {
              swiper.velocity = 0;
            }
          } else {
            swiper.velocity = 0;
          }

          swiper.velocity *= params.freeMode.momentumVelocityRatio;
          data.velocities.length = 0;
          let momentumDuration = 1000 * params.freeMode.momentumRatio;
          const momentumDistance = swiper.velocity * momentumDuration;
          let newPosition = swiper.translate + momentumDistance;
          if (rtl) newPosition = -newPosition;
          let doBounce = false;
          let afterBouncePosition;
          const bounceAmount = Math.abs(swiper.velocity) * 20 * params.freeMode.momentumBounceRatio;
          let needsLoopFix;

          if (newPosition < swiper.maxTranslate()) {
            if (params.freeMode.momentumBounce) {
              if (newPosition + swiper.maxTranslate() < -bounceAmount) {
                newPosition = swiper.maxTranslate() - bounceAmount;
              }

              afterBouncePosition = swiper.maxTranslate();
              doBounce = true;
              data.allowMomentumBounce = true;
            } else {
              newPosition = swiper.maxTranslate();
            }

            if (params.loop && params.centeredSlides) needsLoopFix = true;
          } else if (newPosition > swiper.minTranslate()) {
            if (params.freeMode.momentumBounce) {
              if (newPosition - swiper.minTranslate() > bounceAmount) {
                newPosition = swiper.minTranslate() + bounceAmount;
              }

              afterBouncePosition = swiper.minTranslate();
              doBounce = true;
              data.allowMomentumBounce = true;
            } else {
              newPosition = swiper.minTranslate();
            }

            if (params.loop && params.centeredSlides) needsLoopFix = true;
          } else if (params.freeMode.sticky) {
            let nextSlide;

            for (let j = 0; j < snapGrid.length; j += 1) {
              if (snapGrid[j] > -newPosition) {
                nextSlide = j;
                break;
              }
            }

            if (Math.abs(snapGrid[nextSlide] - newPosition) < Math.abs(snapGrid[nextSlide - 1] - newPosition) || swiper.swipeDirection === 'next') {
              newPosition = snapGrid[nextSlide];
            } else {
              newPosition = snapGrid[nextSlide - 1];
            }

            newPosition = -newPosition;
          }

          if (needsLoopFix) {
            once('transitionEnd', () => {
              swiper.loopFix();
            });
          } // Fix duration


          if (swiper.velocity !== 0) {
            if (rtl) {
              momentumDuration = Math.abs((-newPosition - swiper.translate) / swiper.velocity);
            } else {
              momentumDuration = Math.abs((newPosition - swiper.translate) / swiper.velocity);
            }

            if (params.freeMode.sticky) {
              // If freeMode.sticky is active and the user ends a swipe with a slow-velocity
              // event, then durations can be 20+ seconds to slide one (or zero!) slides.
              // It's easy to see this when simulating touch with mouse events. To fix this,
              // limit single-slide swipes to the default slide duration. This also has the
              // nice side effect of matching slide speed if the user stopped moving before
              // lifting finger or mouse vs. moving slowly before lifting the finger/mouse.
              // For faster swipes, also apply limits (albeit higher ones).
              const moveDistance = Math.abs((rtl ? -newPosition : newPosition) - swiper.translate);
              const currentSlideSize = swiper.slidesSizesGrid[swiper.activeIndex];

              if (moveDistance < currentSlideSize) {
                momentumDuration = params.speed;
              } else if (moveDistance < 2 * currentSlideSize) {
                momentumDuration = params.speed * 1.5;
              } else {
                momentumDuration = params.speed * 2.5;
              }
            }
          } else if (params.freeMode.sticky) {
            swiper.slideToClosest();
            return;
          }

          if (params.freeMode.momentumBounce && doBounce) {
            swiper.updateProgress(afterBouncePosition);
            swiper.setTransition(momentumDuration);
            swiper.setTranslate(newPosition);
            swiper.transitionStart(true, swiper.swipeDirection);
            swiper.animating = true;
            $wrapperEl.transitionEnd(() => {
              if (!swiper || swiper.destroyed || !data.allowMomentumBounce) return;
              emit('momentumBounce');
              swiper.setTransition(params.speed);
              setTimeout(() => {
                swiper.setTranslate(afterBouncePosition);
                $wrapperEl.transitionEnd(() => {
                  if (!swiper || swiper.destroyed) return;
                  swiper.transitionEnd();
                });
              }, 0);
            });
          } else if (swiper.velocity) {
            emit('_freeModeNoMomentumRelease');
            swiper.updateProgress(newPosition);
            swiper.setTransition(momentumDuration);
            swiper.setTranslate(newPosition);
            swiper.transitionStart(true, swiper.swipeDirection);

            if (!swiper.animating) {
              swiper.animating = true;
              $wrapperEl.transitionEnd(() => {
                if (!swiper || swiper.destroyed) return;
                swiper.transitionEnd();
              });
            }
          } else {
            swiper.updateProgress(newPosition);
          }

          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        } else if (params.freeMode.sticky) {
          swiper.slideToClosest();
          return;
        } else if (params.freeMode) {
          emit('_freeModeNoMomentumRelease');
        }

        if (!params.freeMode.momentum || timeDiff >= params.longSwipesMs) {
          swiper.updateProgress();
          swiper.updateActiveIndex();
          swiper.updateSlidesClasses();
        }
      }

      Object.assign(swiper, {
        freeMode: {
          onTouchStart,
          onTouchMove,
          onTouchEnd
        }
      });
    }

    // @fancyapps/ui/Fancybox v4.0.31
    const t = t => "object" == typeof t && null !== t && t.constructor === Object && "[object Object]" === Object.prototype.toString.call(t),
          e = (...i) => {
      let s = !1;
      "boolean" == typeof i[0] && (s = i.shift());
      let o = i[0];
      if (!o || "object" != typeof o) throw new Error("extendee must be an object");
      const n = i.slice(1),
            a = n.length;

      for (let i = 0; i < a; i++) {
        const a = n[i];

        for (let i in a) if (a.hasOwnProperty(i)) {
          const n = a[i];

          if (s && (Array.isArray(n) || t(n))) {
            const t = Array.isArray(n) ? [] : {};
            o[i] = e(!0, o.hasOwnProperty(i) ? o[i] : t, n);
          } else o[i] = n;
        }
      }

      return o;
    },
          i = (t, e = 1e4) => (t = parseFloat(t) || 0, Math.round((t + Number.EPSILON) * e) / e),
          s = function (t) {
      return !!(t && "object" == typeof t && t instanceof Element && t !== document.body) && !t.__Panzoom && (function (t) {
        const e = getComputedStyle(t)["overflow-y"],
              i = getComputedStyle(t)["overflow-x"],
              s = ("scroll" === e || "auto" === e) && Math.abs(t.scrollHeight - t.clientHeight) > 1,
              o = ("scroll" === i || "auto" === i) && Math.abs(t.scrollWidth - t.clientWidth) > 1;
        return s || o;
      }(t) ? t : s(t.parentNode));
    },
          o = "undefined" != typeof window && window.ResizeObserver || class {
      constructor(t) {
        this.observables = [], this.boundCheck = this.check.bind(this), this.boundCheck(), this.callback = t;
      }

      observe(t) {
        if (this.observables.some(e => e.el === t)) return;
        const e = {
          el: t,
          size: {
            height: t.clientHeight,
            width: t.clientWidth
          }
        };
        this.observables.push(e);
      }

      unobserve(t) {
        this.observables = this.observables.filter(e => e.el !== t);
      }

      disconnect() {
        this.observables = [];
      }

      check() {
        const t = this.observables.filter(t => {
          const e = t.el.clientHeight,
                i = t.el.clientWidth;
          if (t.size.height !== e || t.size.width !== i) return t.size.height = e, t.size.width = i, !0;
        }).map(t => t.el);
        t.length > 0 && this.callback(t), window.requestAnimationFrame(this.boundCheck);
      }

    };

    class n {
      constructor(t) {
        this.id = self.Touch && t instanceof Touch ? t.identifier : -1, this.pageX = t.pageX, this.pageY = t.pageY, this.clientX = t.clientX, this.clientY = t.clientY;
      }

    }

    const a = (t, e) => e ? Math.sqrt((e.clientX - t.clientX) ** 2 + (e.clientY - t.clientY) ** 2) : 0,
          r = (t, e) => e ? {
      clientX: (t.clientX + e.clientX) / 2,
      clientY: (t.clientY + e.clientY) / 2
    } : t;

    class h {
      constructor(t, {
        start: e = () => !0,
        move: i = () => {},
        end: s = () => {}
      } = {}) {
        this._element = t, this.startPointers = [], this.currentPointers = [], this._pointerStart = t => {
          if (t.buttons > 0 && 0 !== t.button) return;
          const e = new n(t);
          this.currentPointers.some(t => t.id === e.id) || this._triggerPointerStart(e, t) && (window.addEventListener("mousemove", this._move), window.addEventListener("mouseup", this._pointerEnd));
        }, this._touchStart = t => {
          for (const e of Array.from(t.changedTouches || [])) this._triggerPointerStart(new n(e), t);
        }, this._move = t => {
          const e = this.currentPointers.slice(),
                i = (t => "changedTouches" in t)(t) ? Array.from(t.changedTouches).map(t => new n(t)) : [new n(t)];

          for (const t of i) {
            const e = this.currentPointers.findIndex(e => e.id === t.id);
            e < 0 || (this.currentPointers[e] = t);
          }

          this._moveCallback(e, this.currentPointers.slice(), t);
        }, this._triggerPointerEnd = (t, e) => {
          const i = this.currentPointers.findIndex(e => e.id === t.id);
          return !(i < 0) && (this.currentPointers.splice(i, 1), this.startPointers.splice(i, 1), this._endCallback(t, e), !0);
        }, this._pointerEnd = t => {
          t.buttons > 0 && 0 !== t.button || this._triggerPointerEnd(new n(t), t) && (window.removeEventListener("mousemove", this._move, {
            passive: !1
          }), window.removeEventListener("mouseup", this._pointerEnd, {
            passive: !1
          }));
        }, this._touchEnd = t => {
          for (const e of Array.from(t.changedTouches || [])) this._triggerPointerEnd(new n(e), t);
        }, this._startCallback = e, this._moveCallback = i, this._endCallback = s, this._element.addEventListener("mousedown", this._pointerStart, {
          passive: !1
        }), this._element.addEventListener("touchstart", this._touchStart, {
          passive: !1
        }), this._element.addEventListener("touchmove", this._move, {
          passive: !1
        }), this._element.addEventListener("touchend", this._touchEnd), this._element.addEventListener("touchcancel", this._touchEnd);
      }

      stop() {
        this._element.removeEventListener("mousedown", this._pointerStart, {
          passive: !1
        }), this._element.removeEventListener("touchstart", this._touchStart, {
          passive: !1
        }), this._element.removeEventListener("touchmove", this._move, {
          passive: !1
        }), this._element.removeEventListener("touchend", this._touchEnd), this._element.removeEventListener("touchcancel", this._touchEnd), window.removeEventListener("mousemove", this._move), window.removeEventListener("mouseup", this._pointerEnd);
      }

      _triggerPointerStart(t, e) {
        return !!this._startCallback(t, e) && (this.currentPointers.push(t), this.startPointers.push(t), !0);
      }

    }

    class l {
      constructor(t = {}) {
        this.options = e(!0, {}, t), this.plugins = [], this.events = {};

        for (const t of ["on", "once"]) for (const e of Object.entries(this.options[t] || {})) this[t](...e);
      }

      option(t, e, ...i) {
        t = String(t);
        let s = (o = t, n = this.options, o.split(".").reduce(function (t, e) {
          return t && t[e];
        }, n));
        var o, n;
        return "function" == typeof s && (s = s.call(this, this, ...i)), void 0 === s ? e : s;
      }

      localize(t, e = []) {
        return t = (t = String(t).replace(/\{\{(\w+).?(\w+)?\}\}/g, (t, i, s) => {
          let o = "";
          s ? o = this.option(`${i[0] + i.toLowerCase().substring(1)}.l10n.${s}`) : i && (o = this.option(`l10n.${i}`)), o || (o = t);

          for (let t = 0; t < e.length; t++) o = o.split(e[t][0]).join(e[t][1]);

          return o;
        })).replace(/\{\{(.*)\}\}/, (t, e) => e);
      }

      on(e, i) {
        if (t(e)) {
          for (const t of Object.entries(e)) this.on(...t);

          return this;
        }

        return String(e).split(" ").forEach(t => {
          const e = this.events[t] = this.events[t] || [];
          -1 == e.indexOf(i) && e.push(i);
        }), this;
      }

      once(e, i) {
        if (t(e)) {
          for (const t of Object.entries(e)) this.once(...t);

          return this;
        }

        return String(e).split(" ").forEach(t => {
          const e = (...s) => {
            this.off(t, e), i.call(this, this, ...s);
          };

          e._ = i, this.on(t, e);
        }), this;
      }

      off(e, i) {
        if (!t(e)) return e.split(" ").forEach(t => {
          const e = this.events[t];
          if (!e || !e.length) return this;
          let s = -1;

          for (let t = 0, o = e.length; t < o; t++) {
            const o = e[t];

            if (o && (o === i || o._ === i)) {
              s = t;
              break;
            }
          }

          -1 != s && e.splice(s, 1);
        }), this;

        for (const t of Object.entries(e)) this.off(...t);
      }

      trigger(t, ...e) {
        for (const i of [...(this.events[t] || [])].slice()) if (i && !1 === i.call(this, this, ...e)) return !1;

        for (const i of [...(this.events["*"] || [])].slice()) if (i && !1 === i.call(this, t, this, ...e)) return !1;

        return !0;
      }

      attachPlugins(t) {
        const i = {};

        for (const [s, o] of Object.entries(t || {})) !1 === this.options[s] || this.plugins[s] || (this.options[s] = e({}, o.defaults || {}, this.options[s]), i[s] = new o(this));

        for (const [t, e] of Object.entries(i)) e.attach(this);

        return this.plugins = Object.assign({}, this.plugins, i), this;
      }

      detachPlugins() {
        for (const t in this.plugins) {
          let e;
          (e = this.plugins[t]) && "function" == typeof e.detach && e.detach(this);
        }

        return this.plugins = {}, this;
      }

    }

    const c = {
      touch: !0,
      zoom: !0,
      pinchToZoom: !0,
      panOnlyZoomed: !1,
      lockAxis: !1,
      friction: .64,
      decelFriction: .88,
      zoomFriction: .74,
      bounceForce: .2,
      baseScale: 1,
      minScale: 1,
      maxScale: 2,
      step: .5,
      textSelection: !1,
      click: "toggleZoom",
      wheel: "zoom",
      wheelFactor: 42,
      wheelLimit: 5,
      draggableClass: "is-draggable",
      draggingClass: "is-dragging",
      ratio: 1
    };

    class d extends l {
      constructor(t, i = {}) {
        super(e(!0, {}, c, i)), this.state = "init", this.$container = t;

        for (const t of ["onLoad", "onWheel", "onClick"]) this[t] = this[t].bind(this);

        this.initLayout(), this.resetValues(), this.attachPlugins(d.Plugins), this.trigger("init"), this.updateMetrics(), this.attachEvents(), this.trigger("ready"), !1 === this.option("centerOnStart") ? this.state = "ready" : this.panTo({
          friction: 0
        }), t.__Panzoom = this;
      }

      initLayout() {
        const t = this.$container;
        if (!(t instanceof HTMLElement)) throw new Error("Panzoom: Container not found");
        const e = this.option("content") || t.querySelector(".panzoom__content");
        if (!e) throw new Error("Panzoom: Content not found");
        this.$content = e;
        let i = this.option("viewport") || t.querySelector(".panzoom__viewport");
        i || !1 === this.option("wrapInner") || (i = document.createElement("div"), i.classList.add("panzoom__viewport"), i.append(...t.childNodes), t.appendChild(i)), this.$viewport = i || e.parentNode;
      }

      resetValues() {
        this.updateRate = this.option("updateRate", /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 250 : 24), this.container = {
          width: 0,
          height: 0
        }, this.viewport = {
          width: 0,
          height: 0
        }, this.content = {
          origWidth: 0,
          origHeight: 0,
          width: 0,
          height: 0,
          x: this.option("x", 0),
          y: this.option("y", 0),
          scale: this.option("baseScale")
        }, this.transform = {
          x: 0,
          y: 0,
          scale: 1
        }, this.resetDragPosition();
      }

      onLoad(t) {
        this.updateMetrics(), this.panTo({
          scale: this.option("baseScale"),
          friction: 0
        }), this.trigger("load", t);
      }

      onClick(t) {
        if (t.defaultPrevented) return;
        if (document.activeElement && document.activeElement.closest("[contenteditable]")) return;
        if (this.option("textSelection") && window.getSelection().toString().length && (!t.target || !t.target.hasAttribute("data-fancybox-close"))) return void t.stopPropagation();
        const e = this.$content.getClientRects()[0];
        if ("ready" !== this.state && (this.dragPosition.midPoint || Math.abs(e.top - this.dragStart.rect.top) > 1 || Math.abs(e.left - this.dragStart.rect.left) > 1)) return t.preventDefault(), void t.stopPropagation();
        !1 !== this.trigger("click", t) && this.option("zoom") && "toggleZoom" === this.option("click") && (t.preventDefault(), t.stopPropagation(), this.zoomWithClick(t));
      }

      onWheel(t) {
        !1 !== this.trigger("wheel", t) && this.option("zoom") && this.option("wheel") && this.zoomWithWheel(t);
      }

      zoomWithWheel(t) {
        void 0 === this.changedDelta && (this.changedDelta = 0);
        const e = Math.max(-1, Math.min(1, -t.deltaY || -t.deltaX || t.wheelDelta || -t.detail)),
              i = this.content.scale;
        let s = i * (100 + e * this.option("wheelFactor")) / 100;
        if (e < 0 && Math.abs(i - this.option("minScale")) < .01 || e > 0 && Math.abs(i - this.option("maxScale")) < .01 ? (this.changedDelta += Math.abs(e), s = i) : (this.changedDelta = 0, s = Math.max(Math.min(s, this.option("maxScale")), this.option("minScale"))), this.changedDelta > this.option("wheelLimit")) return;
        if (t.preventDefault(), s === i) return;
        const o = this.$content.getBoundingClientRect(),
              n = t.clientX - o.left,
              a = t.clientY - o.top;
        this.zoomTo(s, {
          x: n,
          y: a
        });
      }

      zoomWithClick(t) {
        const e = this.$content.getClientRects()[0],
              i = t.clientX - e.left,
              s = t.clientY - e.top;
        this.toggleZoom({
          x: i,
          y: s
        });
      }

      attachEvents() {
        this.$content.addEventListener("load", this.onLoad), this.$container.addEventListener("wheel", this.onWheel, {
          passive: !1
        }), this.$container.addEventListener("click", this.onClick, {
          passive: !1
        }), this.initObserver();
        const t = new h(this.$container, {
          start: (e, i) => {
            if (!this.option("touch")) return !1;
            if (this.velocity.scale < 0) return !1;
            const o = i.composedPath()[0];

            if (!t.currentPointers.length) {
              if (-1 !== ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(o.nodeName)) return !1;
              if (this.option("textSelection") && ((t, e, i) => {
                const s = t.childNodes,
                      o = document.createRange();

                for (let t = 0; t < s.length; t++) {
                  const n = s[t];
                  if (n.nodeType !== Node.TEXT_NODE) continue;
                  o.selectNodeContents(n);
                  const a = o.getBoundingClientRect();
                  if (e >= a.left && i >= a.top && e <= a.right && i <= a.bottom) return n;
                }

                return !1;
              })(o, e.clientX, e.clientY)) return !1;
            }

            return !s(o) && !1 !== this.trigger("touchStart", i) && ("mousedown" === i.type && i.preventDefault(), this.state = "pointerdown", this.resetDragPosition(), this.dragPosition.midPoint = null, this.dragPosition.time = Date.now(), !0);
          },
          move: (e, i, s) => {
            if ("pointerdown" !== this.state) return;
            if (!1 === this.trigger("touchMove", s)) return void s.preventDefault();
            if (i.length < 2 && !0 === this.option("panOnlyZoomed") && this.content.width <= this.viewport.width && this.content.height <= this.viewport.height && this.transform.scale <= this.option("baseScale")) return;
            if (i.length > 1 && (!this.option("zoom") || !1 === this.option("pinchToZoom"))) return;
            const o = r(e[0], e[1]),
                  n = r(i[0], i[1]),
                  h = n.clientX - o.clientX,
                  l = n.clientY - o.clientY,
                  c = a(e[0], e[1]),
                  d = a(i[0], i[1]),
                  u = c && d ? d / c : 1;
            this.dragOffset.x += h, this.dragOffset.y += l, this.dragOffset.scale *= u, this.dragOffset.time = Date.now() - this.dragPosition.time;
            const f = 1 === this.dragStart.scale && this.option("lockAxis");

            if (f && !this.lockAxis) {
              if (Math.abs(this.dragOffset.x) < 6 && Math.abs(this.dragOffset.y) < 6) return void s.preventDefault();
              const t = Math.abs(180 * Math.atan2(this.dragOffset.y, this.dragOffset.x) / Math.PI);
              this.lockAxis = t > 45 && t < 135 ? "y" : "x";
            }

            if ("xy" === f || "y" !== this.lockAxis) {
              if (s.preventDefault(), s.stopPropagation(), s.stopImmediatePropagation(), this.lockAxis && (this.dragOffset["x" === this.lockAxis ? "y" : "x"] = 0), this.$container.classList.add(this.option("draggingClass")), this.transform.scale === this.option("baseScale") && "y" === this.lockAxis || (this.dragPosition.x = this.dragStart.x + this.dragOffset.x), this.transform.scale === this.option("baseScale") && "x" === this.lockAxis || (this.dragPosition.y = this.dragStart.y + this.dragOffset.y), this.dragPosition.scale = this.dragStart.scale * this.dragOffset.scale, i.length > 1) {
                const e = r(t.startPointers[0], t.startPointers[1]),
                      i = e.clientX - this.dragStart.rect.x,
                      s = e.clientY - this.dragStart.rect.y,
                      {
                  deltaX: o,
                  deltaY: a
                } = this.getZoomDelta(this.content.scale * this.dragOffset.scale, i, s);
                this.dragPosition.x -= o, this.dragPosition.y -= a, this.dragPosition.midPoint = n;
              } else this.setDragResistance();

              this.transform = {
                x: this.dragPosition.x,
                y: this.dragPosition.y,
                scale: this.dragPosition.scale
              }, this.startAnimation();
            }
          },
          end: (e, i) => {
            if ("pointerdown" !== this.state) return;
            if (this._dragOffset = { ...this.dragOffset
            }, t.currentPointers.length) return void this.resetDragPosition();
            if (this.state = "decel", this.friction = this.option("decelFriction"), this.recalculateTransform(), this.$container.classList.remove(this.option("draggingClass")), !1 === this.trigger("touchEnd", i)) return;
            if ("decel" !== this.state) return;
            const s = this.option("minScale");
            if (this.transform.scale < s) return void this.zoomTo(s, {
              friction: .64
            });
            const o = this.option("maxScale");

            if (this.transform.scale - o > .01) {
              const t = this.dragPosition.midPoint || e,
                    i = this.$content.getClientRects()[0];
              this.zoomTo(o, {
                friction: .64,
                x: t.clientX - i.left,
                y: t.clientY - i.top
              });
            }
          }
        });
        this.pointerTracker = t;
      }

      initObserver() {
        this.resizeObserver || (this.resizeObserver = new o(() => {
          this.updateTimer || (this.updateTimer = setTimeout(() => {
            const t = this.$container.getBoundingClientRect();
            t.width && t.height ? ((Math.abs(t.width - this.container.width) > 1 || Math.abs(t.height - this.container.height) > 1) && (this.isAnimating() && this.endAnimation(!0), this.updateMetrics(), this.panTo({
              x: this.content.x,
              y: this.content.y,
              scale: this.option("baseScale"),
              friction: 0
            })), this.updateTimer = null) : this.updateTimer = null;
          }, this.updateRate));
        }), this.resizeObserver.observe(this.$container));
      }

      resetDragPosition() {
        this.lockAxis = null, this.friction = this.option("friction"), this.velocity = {
          x: 0,
          y: 0,
          scale: 0
        };
        const {
          x: t,
          y: e,
          scale: i
        } = this.content;
        this.dragStart = {
          rect: this.$content.getBoundingClientRect(),
          x: t,
          y: e,
          scale: i
        }, this.dragPosition = { ...this.dragPosition,
          x: t,
          y: e,
          scale: i
        }, this.dragOffset = {
          x: 0,
          y: 0,
          scale: 1,
          time: 0
        };
      }

      updateMetrics(t) {
        !0 !== t && this.trigger("beforeUpdate");
        const e = this.$container,
              s = this.$content,
              o = this.$viewport,
              n = s instanceof HTMLImageElement,
              a = this.option("zoom"),
              r = this.option("resizeParent", a);
        let h = this.option("width"),
            l = this.option("height"),
            c = h || (d = s, Math.max(parseFloat(d.naturalWidth || 0), parseFloat(d.width && d.width.baseVal && d.width.baseVal.value || 0), parseFloat(d.offsetWidth || 0), parseFloat(d.scrollWidth || 0)));
        var d;

        let u = l || (t => Math.max(parseFloat(t.naturalHeight || 0), parseFloat(t.height && t.height.baseVal && t.height.baseVal.value || 0), parseFloat(t.offsetHeight || 0), parseFloat(t.scrollHeight || 0)))(s);

        Object.assign(s.style, {
          width: h ? `${h}px` : "",
          height: l ? `${l}px` : "",
          maxWidth: "",
          maxHeight: ""
        }), r && Object.assign(o.style, {
          width: "",
          height: ""
        });
        const f = this.option("ratio");
        c = i(c * f), u = i(u * f), h = c, l = u;
        const g = s.getBoundingClientRect(),
              p = o.getBoundingClientRect(),
              m = o == e ? p : e.getBoundingClientRect();
        let y = Math.max(o.offsetWidth, i(p.width)),
            v = Math.max(o.offsetHeight, i(p.height)),
            b = window.getComputedStyle(o);

        if (y -= parseFloat(b.paddingLeft) + parseFloat(b.paddingRight), v -= parseFloat(b.paddingTop) + parseFloat(b.paddingBottom), this.viewport.width = y, this.viewport.height = v, a) {
          if (Math.abs(c - g.width) > .1 || Math.abs(u - g.height) > .1) {
            const t = ((t, e, i, s) => {
              const o = Math.min(i / t || 0, s / e);
              return {
                width: t * o || 0,
                height: e * o || 0
              };
            })(c, u, Math.min(c, g.width), Math.min(u, g.height));

            h = i(t.width), l = i(t.height);
          }

          Object.assign(s.style, {
            width: `${h}px`,
            height: `${l}px`,
            transform: ""
          });
        }

        if (r && (Object.assign(o.style, {
          width: `${h}px`,
          height: `${l}px`
        }), this.viewport = { ...this.viewport,
          width: h,
          height: l
        }), n && a && "function" != typeof this.options.maxScale) {
          const t = this.option("maxScale");

          this.options.maxScale = function () {
            return this.content.origWidth > 0 && this.content.fitWidth > 0 ? this.content.origWidth / this.content.fitWidth : t;
          };
        }

        this.content = { ...this.content,
          origWidth: c,
          origHeight: u,
          fitWidth: h,
          fitHeight: l,
          width: h,
          height: l,
          scale: 1,
          isZoomable: a
        }, this.container = {
          width: m.width,
          height: m.height
        }, !0 !== t && this.trigger("afterUpdate");
      }

      zoomIn(t) {
        this.zoomTo(this.content.scale + (t || this.option("step")));
      }

      zoomOut(t) {
        this.zoomTo(this.content.scale - (t || this.option("step")));
      }

      toggleZoom(t = {}) {
        const e = this.option("maxScale"),
              i = this.option("baseScale"),
              s = this.content.scale > i + .5 * (e - i) ? i : e;
        this.zoomTo(s, t);
      }

      zoomTo(t = this.option("baseScale"), {
        x: e = null,
        y: s = null
      } = {}) {
        t = Math.max(Math.min(t, this.option("maxScale")), this.option("minScale"));
        const o = i(this.content.scale / (this.content.width / this.content.fitWidth), 1e7);
        null === e && (e = this.content.width * o * .5), null === s && (s = this.content.height * o * .5);
        const {
          deltaX: n,
          deltaY: a
        } = this.getZoomDelta(t, e, s);
        e = this.content.x - n, s = this.content.y - a, this.panTo({
          x: e,
          y: s,
          scale: t,
          friction: this.option("zoomFriction")
        });
      }

      getZoomDelta(t, e = 0, i = 0) {
        const s = this.content.fitWidth * this.content.scale,
              o = this.content.fitHeight * this.content.scale,
              n = e > 0 && s ? e / s : 0,
              a = i > 0 && o ? i / o : 0;
        return {
          deltaX: (this.content.fitWidth * t - s) * n,
          deltaY: (this.content.fitHeight * t - o) * a
        };
      }

      panTo({
        x: t = this.content.x,
        y: e = this.content.y,
        scale: i,
        friction: s = this.option("friction"),
        ignoreBounds: o = !1
      } = {}) {
        if (i = i || this.content.scale || 1, !o) {
          const {
            boundX: s,
            boundY: o
          } = this.getBounds(i);
          s && (t = Math.max(Math.min(t, s.to), s.from)), o && (e = Math.max(Math.min(e, o.to), o.from));
        }

        this.friction = s, this.transform = { ...this.transform,
          x: t,
          y: e,
          scale: i
        }, s ? (this.state = "panning", this.velocity = {
          x: (1 / this.friction - 1) * (t - this.content.x),
          y: (1 / this.friction - 1) * (e - this.content.y),
          scale: (1 / this.friction - 1) * (i - this.content.scale)
        }, this.startAnimation()) : this.endAnimation();
      }

      startAnimation() {
        this.rAF ? cancelAnimationFrame(this.rAF) : this.trigger("startAnimation"), this.rAF = requestAnimationFrame(() => this.animate());
      }

      animate() {
        if (this.setEdgeForce(), this.setDragForce(), this.velocity.x *= this.friction, this.velocity.y *= this.friction, this.velocity.scale *= this.friction, this.content.x += this.velocity.x, this.content.y += this.velocity.y, this.content.scale += this.velocity.scale, this.isAnimating()) this.setTransform();else if ("pointerdown" !== this.state) return void this.endAnimation();
        this.rAF = requestAnimationFrame(() => this.animate());
      }

      getBounds(t) {
        let e = this.boundX,
            s = this.boundY;
        if (void 0 !== e && void 0 !== s) return {
          boundX: e,
          boundY: s
        };
        e = {
          from: 0,
          to: 0
        }, s = {
          from: 0,
          to: 0
        }, t = t || this.transform.scale;
        const o = this.content.fitWidth * t,
              n = this.content.fitHeight * t,
              a = this.viewport.width,
              r = this.viewport.height;

        if (o < a) {
          const t = i(.5 * (a - o));
          e.from = t, e.to = t;
        } else e.from = i(a - o);

        if (n < r) {
          const t = .5 * (r - n);
          s.from = t, s.to = t;
        } else s.from = i(r - n);

        return {
          boundX: e,
          boundY: s
        };
      }

      setEdgeForce() {
        if ("decel" !== this.state) return;
        const t = this.option("bounceForce"),
              {
          boundX: e,
          boundY: i
        } = this.getBounds(Math.max(this.transform.scale, this.content.scale));
        let s, o, n, a;

        if (e && (s = this.content.x < e.from, o = this.content.x > e.to), i && (n = this.content.y < i.from, a = this.content.y > i.to), s || o) {
          let i = ((s ? e.from : e.to) - this.content.x) * t;
          const o = this.content.x + (this.velocity.x + i) / this.friction;
          o >= e.from && o <= e.to && (i += this.velocity.x), this.velocity.x = i, this.recalculateTransform();
        }

        if (n || a) {
          let e = ((n ? i.from : i.to) - this.content.y) * t;
          const s = this.content.y + (e + this.velocity.y) / this.friction;
          s >= i.from && s <= i.to && (e += this.velocity.y), this.velocity.y = e, this.recalculateTransform();
        }
      }

      setDragResistance() {
        if ("pointerdown" !== this.state) return;
        const {
          boundX: t,
          boundY: e
        } = this.getBounds(this.dragPosition.scale);
        let i, s, o, n;

        if (t && (i = this.dragPosition.x < t.from, s = this.dragPosition.x > t.to), e && (o = this.dragPosition.y < e.from, n = this.dragPosition.y > e.to), (i || s) && (!i || !s)) {
          const e = i ? t.from : t.to,
                s = e - this.dragPosition.x;
          this.dragPosition.x = e - .3 * s;
        }

        if ((o || n) && (!o || !n)) {
          const t = o ? e.from : e.to,
                i = t - this.dragPosition.y;
          this.dragPosition.y = t - .3 * i;
        }
      }

      setDragForce() {
        "pointerdown" === this.state && (this.velocity.x = this.dragPosition.x - this.content.x, this.velocity.y = this.dragPosition.y - this.content.y, this.velocity.scale = this.dragPosition.scale - this.content.scale);
      }

      recalculateTransform() {
        this.transform.x = this.content.x + this.velocity.x / (1 / this.friction - 1), this.transform.y = this.content.y + this.velocity.y / (1 / this.friction - 1), this.transform.scale = this.content.scale + this.velocity.scale / (1 / this.friction - 1);
      }

      isAnimating() {
        return !(!this.friction || !(Math.abs(this.velocity.x) > .05 || Math.abs(this.velocity.y) > .05 || Math.abs(this.velocity.scale) > .05));
      }

      setTransform(t) {
        let e, s, o;

        if (t ? (e = i(this.transform.x), s = i(this.transform.y), o = this.transform.scale, this.content = { ...this.content,
          x: e,
          y: s,
          scale: o
        }) : (e = i(this.content.x), s = i(this.content.y), o = this.content.scale / (this.content.width / this.content.fitWidth), this.content = { ...this.content,
          x: e,
          y: s
        }), this.trigger("beforeTransform"), e = i(this.content.x), s = i(this.content.y), t && this.option("zoom")) {
          let t, n;
          t = i(this.content.fitWidth * o), n = i(this.content.fitHeight * o), this.content.width = t, this.content.height = n, this.transform = { ...this.transform,
            width: t,
            height: n,
            scale: o
          }, Object.assign(this.$content.style, {
            width: `${t}px`,
            height: `${n}px`,
            maxWidth: "none",
            maxHeight: "none",
            transform: `translate3d(${e}px, ${s}px, 0) scale(1)`
          });
        } else this.$content.style.transform = `translate3d(${e}px, ${s}px, 0) scale(${o})`;

        this.trigger("afterTransform");
      }

      endAnimation(t) {
        cancelAnimationFrame(this.rAF), this.rAF = null, this.velocity = {
          x: 0,
          y: 0,
          scale: 0
        }, this.setTransform(!0), this.state = "ready", this.handleCursor(), !0 !== t && this.trigger("endAnimation");
      }

      handleCursor() {
        const t = this.option("draggableClass");
        t && this.option("touch") && (1 == this.option("panOnlyZoomed") && this.content.width <= this.viewport.width && this.content.height <= this.viewport.height && this.transform.scale <= this.option("baseScale") ? this.$container.classList.remove(t) : this.$container.classList.add(t));
      }

      detachEvents() {
        this.$content.removeEventListener("load", this.onLoad), this.$container.removeEventListener("wheel", this.onWheel, {
          passive: !1
        }), this.$container.removeEventListener("click", this.onClick, {
          passive: !1
        }), this.pointerTracker && (this.pointerTracker.stop(), this.pointerTracker = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null);
      }

      destroy() {
        "destroy" !== this.state && (this.state = "destroy", clearTimeout(this.updateTimer), this.updateTimer = null, cancelAnimationFrame(this.rAF), this.rAF = null, this.detachEvents(), this.detachPlugins(), this.resetDragPosition());
      }

    }

    d.version = "4.0.31", d.Plugins = {};

    const u = (t, e) => {
      let i = 0;
      return function (...s) {
        const o = new Date().getTime();
        if (!(o - i < e)) return i = o, t(...s);
      };
    };

    class f {
      constructor(t) {
        this.$container = null, this.$prev = null, this.$next = null, this.carousel = t, this.onRefresh = this.onRefresh.bind(this);
      }

      option(t) {
        return this.carousel.option(`Navigation.${t}`);
      }

      createButton(t) {
        const e = document.createElement("button");
        e.setAttribute("title", this.carousel.localize(`{{${t.toUpperCase()}}}`));
        const i = this.option("classNames.button") + " " + this.option(`classNames.${t}`);
        return e.classList.add(...i.split(" ")), e.setAttribute("tabindex", "0"), e.innerHTML = this.carousel.localize(this.option(`${t}Tpl`)), e.addEventListener("click", e => {
          e.preventDefault(), e.stopPropagation(), this.carousel["slide" + ("next" === t ? "Next" : "Prev")]();
        }), e;
      }

      build() {
        this.$container || (this.$container = document.createElement("div"), this.$container.classList.add(...this.option("classNames.main").split(" ")), this.carousel.$container.appendChild(this.$container)), this.$next || (this.$next = this.createButton("next"), this.$container.appendChild(this.$next)), this.$prev || (this.$prev = this.createButton("prev"), this.$container.appendChild(this.$prev));
      }

      onRefresh() {
        const t = this.carousel.pages.length;
        t <= 1 || t > 1 && this.carousel.elemDimWidth < this.carousel.wrapDimWidth && !Number.isInteger(this.carousel.option("slidesPerPage")) ? this.cleanup() : (this.build(), this.$prev.removeAttribute("disabled"), this.$next.removeAttribute("disabled"), this.carousel.option("infiniteX", this.carousel.option("infinite")) || (this.carousel.page <= 0 && this.$prev.setAttribute("disabled", ""), this.carousel.page >= t - 1 && this.$next.setAttribute("disabled", "")));
      }

      cleanup() {
        this.$prev && this.$prev.remove(), this.$prev = null, this.$next && this.$next.remove(), this.$next = null, this.$container && this.$container.remove(), this.$container = null;
      }

      attach() {
        this.carousel.on("refresh change", this.onRefresh);
      }

      detach() {
        this.carousel.off("refresh change", this.onRefresh), this.cleanup();
      }

    }

    f.defaults = {
      prevTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>',
      nextTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',
      classNames: {
        main: "carousel__nav",
        button: "carousel__button",
        next: "is-next",
        prev: "is-prev"
      }
    };

    class g {
      constructor(t) {
        this.carousel = t, this.selectedIndex = null, this.friction = 0, this.onNavReady = this.onNavReady.bind(this), this.onNavClick = this.onNavClick.bind(this), this.onNavCreateSlide = this.onNavCreateSlide.bind(this), this.onTargetChange = this.onTargetChange.bind(this);
      }

      addAsTargetFor(t) {
        this.target = this.carousel, this.nav = t, this.attachEvents();
      }

      addAsNavFor(t) {
        this.target = t, this.nav = this.carousel, this.attachEvents();
      }

      attachEvents() {
        this.nav.options.initialSlide = this.target.options.initialPage, this.nav.on("ready", this.onNavReady), this.nav.on("createSlide", this.onNavCreateSlide), this.nav.on("Panzoom.click", this.onNavClick), this.target.on("change", this.onTargetChange), this.target.on("Panzoom.afterUpdate", this.onTargetChange);
      }

      onNavReady() {
        this.onTargetChange(!0);
      }

      onNavClick(t, e, i) {
        const s = i.target.closest(".carousel__slide");
        if (!s) return;
        i.stopPropagation();
        const o = parseInt(s.dataset.index, 10),
              n = this.target.findPageForSlide(o);
        this.target.page !== n && this.target.slideTo(n, {
          friction: this.friction
        }), this.markSelectedSlide(o);
      }

      onNavCreateSlide(t, e) {
        e.index === this.selectedIndex && this.markSelectedSlide(e.index);
      }

      onTargetChange() {
        const t = this.target.pages[this.target.page].indexes[0],
              e = this.nav.findPageForSlide(t);
        this.nav.slideTo(e), this.markSelectedSlide(t);
      }

      markSelectedSlide(t) {
        this.selectedIndex = t, [...this.nav.slides].filter(t => t.$el && t.$el.classList.remove("is-nav-selected"));
        const e = this.nav.slides[t];
        e && e.$el && e.$el.classList.add("is-nav-selected");
      }

      attach(t) {
        const e = t.options.Sync;
        (e.target || e.nav) && (e.target ? this.addAsNavFor(e.target) : e.nav && this.addAsTargetFor(e.nav), this.friction = e.friction);
      }

      detach() {
        this.nav && (this.nav.off("ready", this.onNavReady), this.nav.off("Panzoom.click", this.onNavClick), this.nav.off("createSlide", this.onNavCreateSlide)), this.target && (this.target.off("Panzoom.afterUpdate", this.onTargetChange), this.target.off("change", this.onTargetChange));
      }

    }

    g.defaults = {
      friction: .92
    };
    const p = {
      Navigation: f,
      Dots: class {
        constructor(t) {
          this.carousel = t, this.$list = null, this.events = {
            change: this.onChange.bind(this),
            refresh: this.onRefresh.bind(this)
          };
        }

        buildList() {
          if (this.carousel.pages.length < this.carousel.option("Dots.minSlideCount")) return;
          const t = document.createElement("ol");
          return t.classList.add("carousel__dots"), t.addEventListener("click", t => {
            if (!("page" in t.target.dataset)) return;
            t.preventDefault(), t.stopPropagation();
            const e = parseInt(t.target.dataset.page, 10),
                  i = this.carousel;
            e !== i.page && (i.pages.length < 3 && i.option("infinite") ? i[0 == e ? "slidePrev" : "slideNext"]() : i.slideTo(e));
          }), this.$list = t, this.carousel.$container.appendChild(t), this.carousel.$container.classList.add("has-dots"), t;
        }

        removeList() {
          this.$list && (this.$list.parentNode.removeChild(this.$list), this.$list = null), this.carousel.$container.classList.remove("has-dots");
        }

        rebuildDots() {
          let t = this.$list;
          const e = !!t,
                i = this.carousel.pages.length;
          if (i < 2) return void (e && this.removeList());
          e || (t = this.buildList());
          const s = this.$list.children.length;
          if (s > i) for (let t = i; t < s; t++) this.$list.removeChild(this.$list.lastChild);else {
            for (let t = s; t < i; t++) {
              const e = document.createElement("li");
              e.classList.add("carousel__dot"), e.dataset.page = t, e.setAttribute("role", "button"), e.setAttribute("tabindex", "0"), e.setAttribute("title", this.carousel.localize("{{GOTO}}", [["%d", t + 1]])), e.addEventListener("keydown", t => {
                const i = t.code;
                let s;
                "Enter" === i || "NumpadEnter" === i ? s = e : "ArrowRight" === i ? s = e.nextSibling : "ArrowLeft" === i && (s = e.previousSibling), s && s.click();
              }), this.$list.appendChild(e);
            }

            this.setActiveDot();
          }
        }

        setActiveDot() {
          if (!this.$list) return;
          this.$list.childNodes.forEach(t => {
            t.classList.remove("is-selected");
          });
          const t = this.$list.childNodes[this.carousel.page];
          t && t.classList.add("is-selected");
        }

        onChange() {
          this.setActiveDot();
        }

        onRefresh() {
          this.rebuildDots();
        }

        attach() {
          this.carousel.on(this.events);
        }

        detach() {
          this.removeList(), this.carousel.off(this.events), this.carousel = null;
        }

      },
      Sync: g
    };
    const m = {
      slides: [],
      preload: 0,
      slidesPerPage: "auto",
      initialPage: null,
      initialSlide: null,
      friction: .92,
      center: !0,
      infinite: !0,
      fill: !0,
      dragFree: !1,
      prefix: "",
      classNames: {
        viewport: "carousel__viewport",
        track: "carousel__track",
        slide: "carousel__slide",
        slideSelected: "is-selected"
      },
      l10n: {
        NEXT: "Next slide",
        PREV: "Previous slide",
        GOTO: "Go to slide #%d"
      }
    };

    class y extends l {
      constructor(t, i = {}) {
        if (super(i = e(!0, {}, m, i)), this.state = "init", this.$container = t, !(this.$container instanceof HTMLElement)) throw new Error("No root element provided");
        this.slideNext = u(this.slideNext.bind(this), 250), this.slidePrev = u(this.slidePrev.bind(this), 250), this.init(), t.__Carousel = this;
      }

      init() {
        this.pages = [], this.page = this.pageIndex = null, this.prevPage = this.prevPageIndex = null, this.attachPlugins(y.Plugins), this.trigger("init"), this.initLayout(), this.initSlides(), this.updateMetrics(), this.$track && this.pages.length && (this.$track.style.transform = `translate3d(${-1 * this.pages[this.page].left}px, 0px, 0) scale(1)`), this.manageSlideVisiblity(), this.initPanzoom(), this.state = "ready", this.trigger("ready");
      }

      initLayout() {
        const t = this.option("prefix"),
              e = this.option("classNames");
        this.$viewport = this.option("viewport") || this.$container.querySelector(`.${t}${e.viewport}`), this.$viewport || (this.$viewport = document.createElement("div"), this.$viewport.classList.add(...(t + e.viewport).split(" ")), this.$viewport.append(...this.$container.childNodes), this.$container.appendChild(this.$viewport)), this.$track = this.option("track") || this.$container.querySelector(`.${t}${e.track}`), this.$track || (this.$track = document.createElement("div"), this.$track.classList.add(...(t + e.track).split(" ")), this.$track.append(...this.$viewport.childNodes), this.$viewport.appendChild(this.$track));
      }

      initSlides() {
        this.slides = [];
        this.$viewport.querySelectorAll(`.${this.option("prefix")}${this.option("classNames.slide")}`).forEach(t => {
          const e = {
            $el: t,
            isDom: !0
          };
          this.slides.push(e), this.trigger("createSlide", e, this.slides.length);
        }), Array.isArray(this.options.slides) && (this.slides = e(!0, [...this.slides], this.options.slides));
      }

      updateMetrics() {
        let t,
            e = 0,
            s = [];
        this.slides.forEach((i, o) => {
          const n = i.$el,
                a = i.isDom || !t ? this.getSlideMetrics(n) : t;
          i.index = o, i.width = a, i.left = e, t = a, e += a, s.push(o);
        });
        let o = Math.max(this.$track.offsetWidth, i(this.$track.getBoundingClientRect().width)),
            n = getComputedStyle(this.$track);
        o -= parseFloat(n.paddingLeft) + parseFloat(n.paddingRight), this.contentWidth = e, this.viewportWidth = o;
        const a = [],
              r = this.option("slidesPerPage");
        if (Number.isInteger(r) && e > o) for (let t = 0; t < this.slides.length; t += r) a.push({
          indexes: s.slice(t, t + r),
          slides: this.slides.slice(t, t + r)
        });else {
          let t = 0,
              e = 0;

          for (let i = 0; i < this.slides.length; i += 1) {
            let s = this.slides[i];
            (!a.length || e + s.width > o) && (a.push({
              indexes: [],
              slides: []
            }), t = a.length - 1, e = 0), e += s.width, a[t].indexes.push(i), a[t].slides.push(s);
          }
        }
        const h = this.option("center"),
              l = this.option("fill");
        a.forEach((t, i) => {
          t.index = i, t.width = t.slides.reduce((t, e) => t + e.width, 0), t.left = t.slides[0].left, h && (t.left += .5 * (o - t.width) * -1), l && !this.option("infiniteX", this.option("infinite")) && e > o && (t.left = Math.max(t.left, 0), t.left = Math.min(t.left, e - o));
        });
        const c = [];
        let d;
        a.forEach(t => {
          const e = { ...t
          };
          d && e.left === d.left ? (d.width += e.width, d.slides = [...d.slides, ...e.slides], d.indexes = [...d.indexes, ...e.indexes]) : (e.index = c.length, d = e, c.push(e));
        }), this.pages = c;
        let u = this.page;

        if (null === u) {
          const t = this.option("initialSlide");
          u = null !== t ? this.findPageForSlide(t) : parseInt(this.option("initialPage", 0), 10) || 0, c[u] || (u = c.length && u > c.length ? c[c.length - 1].index : 0), this.page = u, this.pageIndex = u;
        }

        this.updatePanzoom(), this.trigger("refresh");
      }

      getSlideMetrics(t) {
        if (!t) {
          const e = this.slides[0];
          (t = document.createElement("div")).dataset.isTestEl = 1, t.style.visibility = "hidden", t.classList.add(...(this.option("prefix") + this.option("classNames.slide")).split(" ")), e.customClass && t.classList.add(...e.customClass.split(" ")), this.$track.prepend(t);
        }

        let e = Math.max(t.offsetWidth, i(t.getBoundingClientRect().width));
        const s = t.currentStyle || window.getComputedStyle(t);
        return e = e + (parseFloat(s.marginLeft) || 0) + (parseFloat(s.marginRight) || 0), t.dataset.isTestEl && t.remove(), e;
      }

      findPageForSlide(t) {
        t = parseInt(t, 10) || 0;
        const e = this.pages.find(e => e.indexes.indexOf(t) > -1);
        return e ? e.index : null;
      }

      slideNext() {
        this.slideTo(this.pageIndex + 1);
      }

      slidePrev() {
        this.slideTo(this.pageIndex - 1);
      }

      slideTo(t, e = {}) {
        const {
          x: i = -1 * this.setPage(t, !0),
          y: s = 0,
          friction: o = this.option("friction")
        } = e;
        this.Panzoom.content.x === i && !this.Panzoom.velocity.x && o || (this.Panzoom.panTo({
          x: i,
          y: s,
          friction: o,
          ignoreBounds: !0
        }), "ready" === this.state && "ready" === this.Panzoom.state && this.trigger("settle"));
      }

      initPanzoom() {
        this.Panzoom && this.Panzoom.destroy();
        const t = e(!0, {}, {
          content: this.$track,
          wrapInner: !1,
          resizeParent: !1,
          zoom: !1,
          click: !1,
          lockAxis: "x",
          x: this.pages.length ? -1 * this.pages[this.page].left : 0,
          centerOnStart: !1,
          textSelection: () => this.option("textSelection", !1),
          panOnlyZoomed: function () {
            return this.content.width <= this.viewport.width;
          }
        }, this.option("Panzoom"));
        this.Panzoom = new d(this.$container, t), this.Panzoom.on({
          "*": (t, ...e) => this.trigger(`Panzoom.${t}`, ...e),
          afterUpdate: () => {
            this.updatePage();
          },
          beforeTransform: this.onBeforeTransform.bind(this),
          touchEnd: this.onTouchEnd.bind(this),
          endAnimation: () => {
            this.trigger("settle");
          }
        }), this.updateMetrics(), this.manageSlideVisiblity();
      }

      updatePanzoom() {
        this.Panzoom && (this.Panzoom.content = { ...this.Panzoom.content,
          fitWidth: this.contentWidth,
          origWidth: this.contentWidth,
          width: this.contentWidth
        }, this.pages.length > 1 && this.option("infiniteX", this.option("infinite")) ? this.Panzoom.boundX = null : this.pages.length && (this.Panzoom.boundX = {
          from: -1 * this.pages[this.pages.length - 1].left,
          to: -1 * this.pages[0].left
        }), this.option("infiniteY", this.option("infinite")) ? this.Panzoom.boundY = null : this.Panzoom.boundY = {
          from: 0,
          to: 0
        }, this.Panzoom.handleCursor());
      }

      manageSlideVisiblity() {
        const t = this.contentWidth,
              e = this.viewportWidth;
        let i = this.Panzoom ? -1 * this.Panzoom.content.x : this.pages.length ? this.pages[this.page].left : 0;
        const s = this.option("preload"),
              o = this.option("infiniteX", this.option("infinite")),
              n = parseFloat(getComputedStyle(this.$viewport, null).getPropertyValue("padding-left")),
              a = parseFloat(getComputedStyle(this.$viewport, null).getPropertyValue("padding-right"));
        this.slides.forEach(r => {
          let h,
              l,
              c = 0;
          h = i - n, l = i + e + a, h -= s * (e + n + a), l += s * (e + n + a);
          const d = r.left + r.width > h && r.left < l;
          h = i + t - n, l = i + t + e + a, h -= s * (e + n + a);
          const u = o && r.left + r.width > h && r.left < l;
          h = i - t - n, l = i - t + e + a, h -= s * (e + n + a);
          const f = o && r.left + r.width > h && r.left < l;
          u || d || f ? (this.createSlideEl(r), d && (c = 0), u && (c = -1), f && (c = 1), r.left + r.width > i && r.left <= i + e + a && (c = 0)) : this.removeSlideEl(r), r.hasDiff = c;
        });
        let r = 0,
            h = 0;
        this.slides.forEach((e, i) => {
          let s = 0;
          e.$el ? (i !== r || e.hasDiff ? s = h + e.hasDiff * t : h = 0, e.$el.style.left = Math.abs(s) > .1 ? `${h + e.hasDiff * t}px` : "", r++) : h += e.width;
        }), this.markSelectedSlides();
      }

      createSlideEl(t) {
        if (!t) return;

        if (t.$el) {
          let e = t.$el.dataset.index;

          if (!e || parseInt(e, 10) !== t.index) {
            let e;
            t.$el.dataset.index = t.index, t.$el.querySelectorAll("[data-lazy-srcset]").forEach(t => {
              t.srcset = t.dataset.lazySrcset;
            }), t.$el.querySelectorAll("[data-lazy-src]").forEach(t => {
              let e = t.dataset.lazySrc;
              t instanceof HTMLImageElement ? t.src = e : t.style.backgroundImage = `url('${e}')`;
            }), (e = t.$el.dataset.lazySrc) && (t.$el.style.backgroundImage = `url('${e}')`), t.state = "ready";
          }

          return;
        }

        const e = document.createElement("div");
        e.dataset.index = t.index, e.classList.add(...(this.option("prefix") + this.option("classNames.slide")).split(" ")), t.customClass && e.classList.add(...t.customClass.split(" ")), t.html && (e.innerHTML = t.html);
        const i = [];
        this.slides.forEach((t, e) => {
          t.$el && i.push(e);
        });
        const s = t.index;
        let o = null;

        if (i.length) {
          let t = i.reduce((t, e) => Math.abs(e - s) < Math.abs(t - s) ? e : t);
          o = this.slides[t];
        }

        return this.$track.insertBefore(e, o && o.$el ? o.index < t.index ? o.$el.nextSibling : o.$el : null), t.$el = e, this.trigger("createSlide", t, s), t;
      }

      removeSlideEl(t) {
        t.$el && !t.isDom && (this.trigger("removeSlide", t), t.$el.remove(), t.$el = null);
      }

      markSelectedSlides() {
        const t = this.option("classNames.slideSelected"),
              e = "aria-hidden";
        this.slides.forEach((i, s) => {
          const o = i.$el;
          if (!o) return;
          const n = this.pages[this.page];
          n && n.indexes && n.indexes.indexOf(s) > -1 ? (t && !o.classList.contains(t) && (o.classList.add(t), this.trigger("selectSlide", i)), o.removeAttribute(e)) : (t && o.classList.contains(t) && (o.classList.remove(t), this.trigger("unselectSlide", i)), o.setAttribute(e, !0));
        });
      }

      updatePage() {
        this.updateMetrics(), this.slideTo(this.page, {
          friction: 0
        });
      }

      onBeforeTransform() {
        this.option("infiniteX", this.option("infinite")) && this.manageInfiniteTrack(), this.manageSlideVisiblity();
      }

      manageInfiniteTrack() {
        const t = this.contentWidth,
              e = this.viewportWidth;
        if (!this.option("infiniteX", this.option("infinite")) || this.pages.length < 2 || t < e) return;
        const i = this.Panzoom;
        let s = !1;
        return i.content.x < -1 * (t - e) && (i.content.x += t, this.pageIndex = this.pageIndex - this.pages.length, s = !0), i.content.x > e && (i.content.x -= t, this.pageIndex = this.pageIndex + this.pages.length, s = !0), s && "pointerdown" === i.state && i.resetDragPosition(), s;
      }

      onTouchEnd(t, e) {
        const i = this.option("dragFree");
        if (!i && this.pages.length > 1 && t.dragOffset.time < 350 && Math.abs(t.dragOffset.y) < 1 && Math.abs(t.dragOffset.x) > 5) this[t.dragOffset.x < 0 ? "slideNext" : "slidePrev"]();else if (i) {
          const [, e] = this.getPageFromPosition(-1 * t.transform.x);
          this.setPage(e);
        } else this.slideToClosest();
      }

      slideToClosest(t = {}) {
        let [, e] = this.getPageFromPosition(-1 * this.Panzoom.content.x);
        this.slideTo(e, t);
      }

      getPageFromPosition(t) {
        const e = this.pages.length;
        this.option("center") && (t += .5 * this.viewportWidth);
        const i = Math.floor(t / this.contentWidth);
        t -= i * this.contentWidth;
        let s = this.slides.find(e => e.left <= t && e.left + e.width > t);

        if (s) {
          let t = this.findPageForSlide(s.index);
          return [t, t + i * e];
        }

        return [0, 0];
      }

      setPage(t, e) {
        let i = 0,
            s = parseInt(t, 10) || 0;
        const o = this.page,
              n = this.pageIndex,
              a = this.pages.length,
              r = this.contentWidth,
              h = this.viewportWidth;

        if (t = (s % a + a) % a, this.option("infiniteX", this.option("infinite")) && r > h) {
          const o = Math.floor(s / a) || 0,
                n = r;

          if (i = this.pages[t].left + o * n, !0 === e && a > 2) {
            let t = -1 * this.Panzoom.content.x;
            const e = i - n,
                  o = i + n,
                  r = Math.abs(t - i),
                  h = Math.abs(t - e),
                  l = Math.abs(t - o);
            l < r && l <= h ? (i = o, s += a) : h < r && h < l && (i = e, s -= a);
          }
        } else t = s = Math.max(0, Math.min(s, a - 1)), i = this.pages.length ? this.pages[t].left : 0;

        return this.page = t, this.pageIndex = s, null !== o && t !== o && (this.prevPage = o, this.prevPageIndex = n, this.trigger("change", t, o)), i;
      }

      destroy() {
        this.state = "destroy", this.slides.forEach(t => {
          this.removeSlideEl(t);
        }), this.slides = [], this.Panzoom.destroy(), this.detachPlugins();
      }

    }

    y.version = "4.0.31", y.Plugins = p;
    const v = !("undefined" == typeof window || !window.document || !window.document.createElement);
    let b = null;

    const x = ["a[href]", "area[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "button:not([disabled]):not([aria-hidden])", "iframe", "object", "embed", "video", "audio", "[contenteditable]", '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])'],
          w = t => {
      if (t && v) {
        null === b && document.createElement("div").focus({
          get preventScroll() {
            return b = !0, !1;
          }

        });

        try {
          if (t.setActive) t.setActive();else if (b) t.focus({
            preventScroll: !0
          });else {
            const e = window.pageXOffset || document.body.scrollTop,
                  i = window.pageYOffset || document.body.scrollLeft;
            t.focus(), document.body.scrollTo({
              top: e,
              left: i,
              behavior: "auto"
            });
          }
        } catch (t) {}
      }
    };

    const $ = {
      minSlideCount: 2,
      minScreenHeight: 500,
      autoStart: !0,
      key: "t",
      Carousel: {},
      tpl: '<div class="fancybox__thumb" style="background-image:url(\'{{src}}\')"></div>'
    };

    class C {
      constructor(t) {
        this.fancybox = t, this.$container = null, this.state = "init";

        for (const t of ["onPrepare", "onClosing", "onKeydown"]) this[t] = this[t].bind(this);

        this.events = {
          prepare: this.onPrepare,
          closing: this.onClosing,
          keydown: this.onKeydown
        };
      }

      onPrepare() {
        this.getSlides().length < this.fancybox.option("Thumbs.minSlideCount") ? this.state = "disabled" : !0 === this.fancybox.option("Thumbs.autoStart") && this.fancybox.Carousel.Panzoom.content.height >= this.fancybox.option("Thumbs.minScreenHeight") && this.build();
      }

      onClosing() {
        this.Carousel && this.Carousel.Panzoom.detachEvents();
      }

      onKeydown(t, e) {
        e === t.option("Thumbs.key") && this.toggle();
      }

      build() {
        if (this.$container) return;
        const t = document.createElement("div");
        t.classList.add("fancybox__thumbs"), this.fancybox.$carousel.parentNode.insertBefore(t, this.fancybox.$carousel.nextSibling), this.Carousel = new y(t, e(!0, {
          Dots: !1,
          Navigation: !1,
          Sync: {
            friction: 0
          },
          infinite: !1,
          center: !0,
          fill: !0,
          dragFree: !0,
          slidesPerPage: 1,
          preload: 1
        }, this.fancybox.option("Thumbs.Carousel"), {
          Sync: {
            target: this.fancybox.Carousel
          },
          slides: this.getSlides()
        })), this.Carousel.Panzoom.on("wheel", (t, e) => {
          e.preventDefault(), this.fancybox[e.deltaY < 0 ? "prev" : "next"]();
        }), this.$container = t, this.state = "visible";
      }

      getSlides() {
        const t = [];

        for (const e of this.fancybox.items) {
          const i = e.thumb;
          i && t.push({
            html: this.fancybox.option("Thumbs.tpl").replace(/\{\{src\}\}/gi, i),
            customClass: `has-thumb has-${e.type || "image"}`
          });
        }

        return t;
      }

      toggle() {
        "visible" === this.state ? this.hide() : "hidden" === this.state ? this.show() : this.build();
      }

      show() {
        "hidden" === this.state && (this.$container.style.display = "", this.Carousel.Panzoom.attachEvents(), this.state = "visible");
      }

      hide() {
        "visible" === this.state && (this.Carousel.Panzoom.detachEvents(), this.$container.style.display = "none", this.state = "hidden");
      }

      cleanup() {
        this.Carousel && (this.Carousel.destroy(), this.Carousel = null), this.$container && (this.$container.remove(), this.$container = null), this.state = "init";
      }

      attach() {
        this.fancybox.on(this.events);
      }

      detach() {
        this.fancybox.off(this.events), this.cleanup();
      }

    }

    C.defaults = $;

    const S = (t, e) => {
      const i = new URL(t),
            s = new URLSearchParams(i.search);
      let o = new URLSearchParams();

      for (const [t, i] of [...s, ...Object.entries(e)]) "t" === t ? o.set("start", parseInt(i)) : o.set(t, i);

      o = o.toString();
      let n = t.match(/#t=((.*)?\d+s)/);
      return n && (o += `#t=${n[1]}`), o;
    },
          E = {
      video: {
        autoplay: !0,
        ratio: 16 / 9
      },
      youtube: {
        autohide: 1,
        fs: 1,
        rel: 0,
        hd: 1,
        wmode: "transparent",
        enablejsapi: 1,
        html5: 1
      },
      vimeo: {
        hd: 1,
        show_title: 1,
        show_byline: 1,
        show_portrait: 0,
        fullscreen: 1
      },
      html5video: {
        tpl: '<video class="fancybox__html5video" playsinline controls controlsList="nodownload" poster="{{poster}}">\n  <source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos.</video>',
        format: ""
      }
    };

    class P {
      constructor(t) {
        this.fancybox = t;

        for (const t of ["onInit", "onReady", "onCreateSlide", "onRemoveSlide", "onSelectSlide", "onUnselectSlide", "onRefresh", "onMessage"]) this[t] = this[t].bind(this);

        this.events = {
          init: this.onInit,
          ready: this.onReady,
          "Carousel.createSlide": this.onCreateSlide,
          "Carousel.removeSlide": this.onRemoveSlide,
          "Carousel.selectSlide": this.onSelectSlide,
          "Carousel.unselectSlide": this.onUnselectSlide,
          "Carousel.refresh": this.onRefresh
        };
      }

      onInit() {
        for (const t of this.fancybox.items) this.processType(t);
      }

      processType(t) {
        if (t.html) return t.src = t.html, t.type = "html", void delete t.html;
        const i = t.src || "";
        let s = t.type || this.fancybox.options.type,
            o = null;

        if (!i || "string" == typeof i) {
          if (o = i.match(/(?:youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(?:watch\?(?:.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(?:.*)|[\w-]{11}|\?listType=(?:.*)&list=(?:.*))(?:.*)/i)) {
            const e = S(i, this.fancybox.option("Html.youtube")),
                  n = encodeURIComponent(o[1]);
            t.videoId = n, t.src = `https://www.youtube-nocookie.com/embed/${n}?${e}`, t.thumb = t.thumb || `https://i.ytimg.com/vi/${n}/mqdefault.jpg`, t.vendor = "youtube", s = "video";
          } else if (o = i.match(/^.+vimeo.com\/(?:\/)?([\d]+)(.*)?/)) {
            const e = S(i, this.fancybox.option("Html.vimeo")),
                  n = encodeURIComponent(o[1]);
            t.videoId = n, t.src = `https://player.vimeo.com/video/${n}?${e}`, t.vendor = "vimeo", s = "video";
          } else (o = i.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:(?:(?:maps\/(?:place\/(?:.*)\/)?\@(.*),(\d+.?\d+?)z))|(?:\?ll=))(.*)?/i)) ? (t.src = `//maps.google.${o[1]}/?ll=${(o[2] ? o[2] + "&z=" + Math.floor(o[3]) + (o[4] ? o[4].replace(/^\//, "&") : "") : o[4] + "").replace(/\?/, "&")}&output=${o[4] && o[4].indexOf("layer=c") > 0 ? "svembed" : "embed"}`, s = "map") : (o = i.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:maps\/search\/)(.*)/i)) && (t.src = `//maps.google.${o[1]}/maps?q=${o[2].replace("query=", "q=").replace("api=1", "")}&output=embed`, s = "map");

          s || ("#" === i.charAt(0) ? s = "inline" : (o = i.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i)) ? (s = "html5video", t.format = t.format || "video/" + ("ogv" === o[1] ? "ogg" : o[1])) : i.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? s = "image" : i.match(/\.(pdf)((\?|#).*)?$/i) && (s = "pdf")), t.type = s || this.fancybox.option("defaultType", "image"), "html5video" !== s && "video" !== s || (t.video = e({}, this.fancybox.option("Html.video"), t.video), t._width && t._height ? t.ratio = parseFloat(t._width) / parseFloat(t._height) : t.ratio = t.ratio || t.video.ratio || E.video.ratio);
        }
      }

      onReady() {
        this.fancybox.Carousel.slides.forEach(t => {
          t.$el && (this.setContent(t), t.index === this.fancybox.getSlide().index && this.playVideo(t));
        });
      }

      onCreateSlide(t, e, i) {
        "ready" === this.fancybox.state && this.setContent(i);
      }

      loadInlineContent(t) {
        let e;
        if (t.src instanceof HTMLElement) e = t.src;else if ("string" == typeof t.src) {
          const i = t.src.split("#", 2),
                s = 2 === i.length && "" === i[0] ? i[1] : i[0];
          e = document.getElementById(s);
        }

        if (e) {
          if ("clone" === t.type || e.$placeHolder) {
            e = e.cloneNode(!0);
            let i = e.getAttribute("id");
            i = i ? `${i}--clone` : `clone-${this.fancybox.id}-${t.index}`, e.setAttribute("id", i);
          } else {
            const t = document.createElement("div");
            t.classList.add("fancybox-placeholder"), e.parentNode.insertBefore(t, e), e.$placeHolder = t;
          }

          this.fancybox.setContent(t, e);
        } else this.fancybox.setError(t, "{{ELEMENT_NOT_FOUND}}");
      }

      loadAjaxContent(t) {
        const e = this.fancybox,
              i = new XMLHttpRequest();
        e.showLoading(t), i.onreadystatechange = function () {
          i.readyState === XMLHttpRequest.DONE && "ready" === e.state && (e.hideLoading(t), 200 === i.status ? e.setContent(t, i.responseText) : e.setError(t, 404 === i.status ? "{{AJAX_NOT_FOUND}}" : "{{AJAX_FORBIDDEN}}"));
        };
        const s = t.ajax || null;
        i.open(s ? "POST" : "GET", t.src), i.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), i.setRequestHeader("X-Requested-With", "XMLHttpRequest"), i.send(s), t.xhr = i;
      }

      loadIframeContent(t) {
        const e = this.fancybox,
              i = document.createElement("iframe");
        if (i.className = "fancybox__iframe", i.setAttribute("id", `fancybox__iframe_${e.id}_${t.index}`), i.setAttribute("allow", "autoplay; fullscreen"), i.setAttribute("scrolling", "auto"), t.$iframe = i, "iframe" !== t.type || !1 === t.preload) return i.setAttribute("src", t.src), this.fancybox.setContent(t, i), void this.resizeIframe(t);
        e.showLoading(t);
        const s = document.createElement("div");
        s.style.visibility = "hidden", this.fancybox.setContent(t, s), s.appendChild(i), i.onerror = () => {
          e.setError(t, "{{IFRAME_ERROR}}");
        }, i.onload = () => {
          e.hideLoading(t);
          let s = !1;
          i.isReady || (i.isReady = !0, s = !0), i.src.length && (i.parentNode.style.visibility = "", this.resizeIframe(t), s && e.revealContent(t));
        }, i.setAttribute("src", t.src);
      }

      setAspectRatio(t) {
        const e = t.$content,
              i = t.ratio;
        if (!e) return;
        let s = t._width,
            o = t._height;

        if (i || s && o) {
          Object.assign(e.style, {
            width: s && o ? "100%" : "",
            height: s && o ? "100%" : "",
            maxWidth: "",
            maxHeight: ""
          });
          let t = e.offsetWidth,
              n = e.offsetHeight;

          if (s = s || t, o = o || n, s > t || o > n) {
            let e = Math.min(t / s, n / o);
            s *= e, o *= e;
          }

          Math.abs(s / o - i) > .01 && (i < s / o ? s = o * i : o = s / i), Object.assign(e.style, {
            width: `${s}px`,
            height: `${o}px`
          });
        }
      }

      resizeIframe(t) {
        const e = t.$iframe;
        if (!e) return;
        let i = t._width || 0,
            s = t._height || 0;
        i && s && (t.autoSize = !1);
        const o = e.parentNode,
              n = o && o.style;
        if (!1 !== t.preload && !1 !== t.autoSize && n) try {
          const t = window.getComputedStyle(o),
                a = parseFloat(t.paddingLeft) + parseFloat(t.paddingRight),
                r = parseFloat(t.paddingTop) + parseFloat(t.paddingBottom),
                h = e.contentWindow.document,
                l = h.getElementsByTagName("html")[0],
                c = h.body;
          n.width = "", c.style.overflow = "hidden", i = i || l.scrollWidth + a, n.width = `${i}px`, c.style.overflow = "", n.flex = "0 0 auto", n.height = `${c.scrollHeight}px`, s = l.scrollHeight + r;
        } catch (t) {}

        if (i || s) {
          const t = {
            flex: "0 1 auto"
          };
          i && (t.width = `${i}px`), s && (t.height = `${s}px`), Object.assign(n, t);
        }
      }

      onRefresh(t, e) {
        e.slides.forEach(t => {
          t.$el && (t.$iframe && this.resizeIframe(t), t.ratio && this.setAspectRatio(t));
        });
      }

      setContent(t) {
        if (t && !t.isDom) {
          switch (t.type) {
            case "html":
              this.fancybox.setContent(t, t.src);
              break;

            case "html5video":
              this.fancybox.setContent(t, this.fancybox.option("Html.html5video.tpl").replace(/\{\{src\}\}/gi, t.src).replace("{{format}}", t.format || t.html5video && t.html5video.format || "").replace("{{poster}}", t.poster || t.thumb || ""));
              break;

            case "inline":
            case "clone":
              this.loadInlineContent(t);
              break;

            case "ajax":
              this.loadAjaxContent(t);
              break;

            case "pdf":
            case "video":
            case "map":
              t.preload = !1;

            case "iframe":
              this.loadIframeContent(t);
          }

          t.ratio && this.setAspectRatio(t);
        }
      }

      onSelectSlide(t, e, i) {
        "ready" === t.state && this.playVideo(i);
      }

      playVideo(t) {
        if ("html5video" === t.type && t.video.autoplay) try {
          const e = t.$el.querySelector("video");

          if (e) {
            const t = e.play();
            void 0 !== t && t.then(() => {}).catch(t => {
              e.muted = !0, e.play();
            });
          }
        } catch (t) {}
        if ("video" !== t.type || !t.$iframe || !t.$iframe.contentWindow) return;

        const e = () => {
          if ("done" === t.state && t.$iframe && t.$iframe.contentWindow) {
            let e;
            if (t.$iframe.isReady) return t.video && t.video.autoplay && (e = "youtube" == t.vendor ? {
              event: "command",
              func: "playVideo"
            } : {
              method: "play",
              value: "true"
            }), void (e && t.$iframe.contentWindow.postMessage(JSON.stringify(e), "*"));
            "youtube" === t.vendor && (e = {
              event: "listening",
              id: t.$iframe.getAttribute("id")
            }, t.$iframe.contentWindow.postMessage(JSON.stringify(e), "*"));
          }

          t.poller = setTimeout(e, 250);
        };

        e();
      }

      onUnselectSlide(t, e, i) {
        if ("html5video" === i.type) {
          try {
            i.$el.querySelector("video").pause();
          } catch (t) {}

          return;
        }

        let s = !1;
        "vimeo" == i.vendor ? s = {
          method: "pause",
          value: "true"
        } : "youtube" === i.vendor && (s = {
          event: "command",
          func: "pauseVideo"
        }), s && i.$iframe && i.$iframe.contentWindow && i.$iframe.contentWindow.postMessage(JSON.stringify(s), "*"), clearTimeout(i.poller);
      }

      onRemoveSlide(t, e, i) {
        i.xhr && (i.xhr.abort(), i.xhr = null), i.$iframe && (i.$iframe.onload = i.$iframe.onerror = null, i.$iframe.src = "//about:blank", i.$iframe = null);
        const s = i.$content;
        "inline" === i.type && s && (s.classList.remove("fancybox__content"), "none" !== s.style.display && (s.style.display = "none")), i.$closeButton && (i.$closeButton.remove(), i.$closeButton = null);
        const o = s && s.$placeHolder;
        o && (o.parentNode.insertBefore(s, o), o.remove(), s.$placeHolder = null);
      }

      onMessage(t) {
        try {
          let e = JSON.parse(t.data);

          if ("https://player.vimeo.com" === t.origin) {
            if ("ready" === e.event) for (let e of document.getElementsByClassName("fancybox__iframe")) e.contentWindow === t.source && (e.isReady = 1);
          } else "https://www.youtube-nocookie.com" === t.origin && "onReady" === e.event && (document.getElementById(e.id).isReady = 1);
        } catch (t) {}
      }

      attach() {
        this.fancybox.on(this.events), window.addEventListener("message", this.onMessage, !1);
      }

      detach() {
        this.fancybox.off(this.events), window.removeEventListener("message", this.onMessage, !1);
      }

    }

    P.defaults = E;

    class T {
      constructor(t) {
        this.fancybox = t;

        for (const t of ["onReady", "onClosing", "onDone", "onPageChange", "onCreateSlide", "onRemoveSlide", "onImageStatusChange"]) this[t] = this[t].bind(this);

        this.events = {
          ready: this.onReady,
          closing: this.onClosing,
          done: this.onDone,
          "Carousel.change": this.onPageChange,
          "Carousel.createSlide": this.onCreateSlide,
          "Carousel.removeSlide": this.onRemoveSlide
        };
      }

      onReady() {
        this.fancybox.Carousel.slides.forEach(t => {
          t.$el && this.setContent(t);
        });
      }

      onDone(t, e) {
        this.handleCursor(e);
      }

      onClosing(t) {
        clearTimeout(this.clickTimer), this.clickTimer = null, t.Carousel.slides.forEach(t => {
          t.$image && (t.state = "destroy"), t.Panzoom && t.Panzoom.detachEvents();
        }), "closing" === this.fancybox.state && this.canZoom(t.getSlide()) && this.zoomOut();
      }

      onCreateSlide(t, e, i) {
        "ready" === this.fancybox.state && this.setContent(i);
      }

      onRemoveSlide(t, e, i) {
        i.$image && (i.$el.classList.remove(t.option("Image.canZoomInClass")), i.$image.remove(), i.$image = null), i.Panzoom && (i.Panzoom.destroy(), i.Panzoom = null), i.$el && i.$el.dataset && delete i.$el.dataset.imageFit;
      }

      setContent(t) {
        if (t.isDom || t.html || t.type && "image" !== t.type) return;
        if (t.$image) return;
        t.type = "image", t.state = "loading";
        const e = document.createElement("div");
        e.style.visibility = "hidden";
        const i = document.createElement("img");
        i.addEventListener("load", e => {
          e.stopImmediatePropagation(), this.onImageStatusChange(t);
        }), i.addEventListener("error", () => {
          this.onImageStatusChange(t);
        }), i.src = t.src, i.alt = "", i.draggable = !1, i.classList.add("fancybox__image"), t.srcset && i.setAttribute("srcset", t.srcset), t.sizes && i.setAttribute("sizes", t.sizes), t.$image = i;
        const s = this.fancybox.option("Image.wrap");

        if (s) {
          const o = document.createElement("div");
          o.classList.add("string" == typeof s ? s : "fancybox__image-wrap"), o.appendChild(i), e.appendChild(o), t.$wrap = o;
        } else e.appendChild(i);

        t.$el.dataset.imageFit = this.fancybox.option("Image.fit"), this.fancybox.setContent(t, e), i.complete || i.error ? this.onImageStatusChange(t) : this.fancybox.showLoading(t);
      }

      onImageStatusChange(t) {
        const e = t.$image;
        e && "loading" === t.state && (e.complete && e.naturalWidth && e.naturalHeight ? (this.fancybox.hideLoading(t), "contain" === this.fancybox.option("Image.fit") && this.initSlidePanzoom(t), t.$el.addEventListener("wheel", e => this.onWheel(t, e), {
          passive: !1
        }), t.$content.addEventListener("click", e => this.onClick(t, e), {
          passive: !1
        }), this.revealContent(t)) : this.fancybox.setError(t, "{{IMAGE_ERROR}}"));
      }

      initSlidePanzoom(t) {
        t.Panzoom || (t.Panzoom = new d(t.$el, e(!0, this.fancybox.option("Image.Panzoom", {}), {
          viewport: t.$wrap,
          content: t.$image,
          width: t._width,
          height: t._height,
          wrapInner: !1,
          textSelection: !0,
          touch: this.fancybox.option("Image.touch"),
          panOnlyZoomed: !0,
          click: !1,
          wheel: !1
        })), t.Panzoom.on("startAnimation", () => {
          this.fancybox.trigger("Image.startAnimation", t);
        }), t.Panzoom.on("endAnimation", () => {
          "zoomIn" === t.state && this.fancybox.done(t), this.handleCursor(t), this.fancybox.trigger("Image.endAnimation", t);
        }), t.Panzoom.on("afterUpdate", () => {
          this.handleCursor(t), this.fancybox.trigger("Image.afterUpdate", t);
        }));
      }

      revealContent(t) {
        null === this.fancybox.Carousel.prevPage && t.index === this.fancybox.options.startIndex && this.canZoom(t) ? this.zoomIn() : this.fancybox.revealContent(t);
      }

      getZoomInfo(t) {
        const e = t.$thumb.getBoundingClientRect(),
              i = e.width,
              s = e.height,
              o = t.$content.getBoundingClientRect(),
              n = o.width,
              a = o.height,
              r = o.top - e.top,
              h = o.left - e.left;
        let l = this.fancybox.option("Image.zoomOpacity");
        return "auto" === l && (l = Math.abs(i / s - n / a) > .1), {
          top: r,
          left: h,
          scale: n && i ? i / n : 1,
          opacity: l
        };
      }

      canZoom(t) {
        const e = this.fancybox,
              i = e.$container;
        if (window.visualViewport && 1 !== window.visualViewport.scale) return !1;
        if (t.Panzoom && !t.Panzoom.content.width) return !1;
        if (!e.option("Image.zoom") || "contain" !== e.option("Image.fit")) return !1;
        const s = t.$thumb;
        if (!s || "loading" === t.state) return !1;
        i.classList.add("fancybox__no-click");
        const o = s.getBoundingClientRect();
        let n;

        if (this.fancybox.option("Image.ignoreCoveredThumbnail")) {
          const t = document.elementFromPoint(o.left + 1, o.top + 1) === s,
                e = document.elementFromPoint(o.right - 1, o.bottom - 1) === s;
          n = t && e;
        } else n = document.elementFromPoint(o.left + .5 * o.width, o.top + .5 * o.height) === s;

        return i.classList.remove("fancybox__no-click"), n;
      }

      zoomIn() {
        const t = this.fancybox,
              e = t.getSlide(),
              i = e.Panzoom,
              {
          top: s,
          left: o,
          scale: n,
          opacity: a
        } = this.getZoomInfo(e);
        t.trigger("reveal", e), i.panTo({
          x: -1 * o,
          y: -1 * s,
          scale: n,
          friction: 0,
          ignoreBounds: !0
        }), e.$content.style.visibility = "", e.state = "zoomIn", !0 === a && i.on("afterTransform", t => {
          "zoomIn" !== e.state && "zoomOut" !== e.state || (t.$content.style.opacity = Math.min(1, 1 - (1 - t.content.scale) / (1 - n)));
        }), i.panTo({
          x: 0,
          y: 0,
          scale: 1,
          friction: this.fancybox.option("Image.zoomFriction")
        });
      }

      zoomOut() {
        const t = this.fancybox,
              e = t.getSlide(),
              i = e.Panzoom;
        if (!i) return;
        e.state = "zoomOut", t.state = "customClosing", e.$caption && (e.$caption.style.visibility = "hidden");
        let s = this.fancybox.option("Image.zoomFriction");

        const o = t => {
          const {
            top: o,
            left: n,
            scale: a,
            opacity: r
          } = this.getZoomInfo(e);
          t || r || (s *= .82), i.panTo({
            x: -1 * n,
            y: -1 * o,
            scale: a,
            friction: s,
            ignoreBounds: !0
          }), s *= .98;
        };

        window.addEventListener("scroll", o), i.once("endAnimation", () => {
          window.removeEventListener("scroll", o), t.destroy();
        }), o();
      }

      handleCursor(t) {
        if ("image" !== t.type || !t.$el) return;
        const e = t.Panzoom,
              i = this.fancybox.option("Image.click", !1, t),
              s = this.fancybox.option("Image.touch"),
              o = t.$el.classList,
              n = this.fancybox.option("Image.canZoomInClass"),
              a = this.fancybox.option("Image.canZoomOutClass");

        if (o.remove(a), o.remove(n), e && "toggleZoom" === i) {
          e && 1 === e.content.scale && e.option("maxScale") - e.content.scale > .01 ? o.add(n) : e.content.scale > 1 && !s && o.add(a);
        } else "close" === i && o.add(a);
      }

      onWheel(t, e) {
        if ("ready" === this.fancybox.state && !1 !== this.fancybox.trigger("Image.wheel", e)) switch (this.fancybox.option("Image.wheel")) {
          case "zoom":
            "done" === t.state && t.Panzoom && t.Panzoom.zoomWithWheel(e);
            break;

          case "close":
            this.fancybox.close();
            break;

          case "slide":
            this.fancybox[e.deltaY < 0 ? "prev" : "next"]();
        }
      }

      onClick(t, e) {
        if ("ready" !== this.fancybox.state) return;
        const i = t.Panzoom;
        if (i && (i.dragPosition.midPoint || 0 !== i.dragOffset.x || 0 !== i.dragOffset.y || 1 !== i.dragOffset.scale)) return;
        if (this.fancybox.Carousel.Panzoom.lockAxis) return !1;

        const s = i => {
          switch (i) {
            case "toggleZoom":
              e.stopPropagation(), t.Panzoom && t.Panzoom.zoomWithClick(e);
              break;

            case "close":
              this.fancybox.close();
              break;

            case "next":
              e.stopPropagation(), this.fancybox.next();
          }
        },
              o = this.fancybox.option("Image.click"),
              n = this.fancybox.option("Image.doubleClick");

        n ? this.clickTimer ? (clearTimeout(this.clickTimer), this.clickTimer = null, s(n)) : this.clickTimer = setTimeout(() => {
          this.clickTimer = null, s(o);
        }, 300) : s(o);
      }

      onPageChange(t, e) {
        const i = t.getSlide();
        e.slides.forEach(t => {
          t.Panzoom && "done" === t.state && t.index !== i.index && t.Panzoom.panTo({
            x: 0,
            y: 0,
            scale: 1,
            friction: .8
          });
        });
      }

      attach() {
        this.fancybox.on(this.events);
      }

      detach() {
        this.fancybox.off(this.events);
      }

    }

    T.defaults = {
      canZoomInClass: "can-zoom_in",
      canZoomOutClass: "can-zoom_out",
      zoom: !0,
      zoomOpacity: "auto",
      zoomFriction: .82,
      ignoreCoveredThumbnail: !1,
      touch: !0,
      click: "toggleZoom",
      doubleClick: null,
      wheel: "zoom",
      fit: "contain",
      wrap: !1,
      Panzoom: {
        ratio: 1
      }
    };

    class L {
      constructor(t) {
        this.fancybox = t;

        for (const t of ["onChange", "onClosing"]) this[t] = this[t].bind(this);

        this.events = {
          initCarousel: this.onChange,
          "Carousel.change": this.onChange,
          closing: this.onClosing
        }, this.hasCreatedHistory = !1, this.origHash = "", this.timer = null;
      }

      onChange(t) {
        const e = t.Carousel;
        this.timer && clearTimeout(this.timer);
        const i = null === e.prevPage,
              s = t.getSlide(),
              o = new URL(document.URL).hash;
        let n = !1;
        if (s.slug) n = "#" + s.slug;else {
          const i = s.$trigger && s.$trigger.dataset,
                o = t.option("slug") || i && i.fancybox;
          o && o.length && "true" !== o && (n = "#" + o + (e.slides.length > 1 ? "-" + (s.index + 1) : ""));
        }
        i && (this.origHash = o !== n ? o : ""), n && o !== n && (this.timer = setTimeout(() => {
          try {
            window.history[i ? "pushState" : "replaceState"]({}, document.title, window.location.pathname + window.location.search + n), i && (this.hasCreatedHistory = !0);
          } catch (t) {}
        }, 300));
      }

      onClosing() {
        if (this.timer && clearTimeout(this.timer), !0 !== this.hasSilentClose) try {
          return void window.history.replaceState({}, document.title, window.location.pathname + window.location.search + (this.origHash || ""));
        } catch (t) {}
      }

      attach(t) {
        t.on(this.events);
      }

      detach(t) {
        t.off(this.events);
      }

      static startFromUrl() {
        const t = L.Fancybox;
        if (!t || t.getInstance() || !1 === t.defaults.Hash) return;
        const {
          hash: e,
          slug: i,
          index: s
        } = L.getParsedURL();
        if (!i) return;
        let o = document.querySelector(`[data-slug="${e}"]`);
        if (o && o.dispatchEvent(new CustomEvent("click", {
          bubbles: !0,
          cancelable: !0
        })), t.getInstance()) return;
        const n = document.querySelectorAll(`[data-fancybox="${i}"]`);
        n.length && (null === s && 1 === n.length ? o = n[0] : s && (o = n[s - 1]), o && o.dispatchEvent(new CustomEvent("click", {
          bubbles: !0,
          cancelable: !0
        })));
      }

      static onHashChange() {
        const {
          slug: t,
          index: e
        } = L.getParsedURL(),
              i = L.Fancybox,
              s = i && i.getInstance();

        if (s && s.plugins.Hash) {
          if (t) {
            const i = s.Carousel;
            if (t === s.option("slug")) return i.slideTo(e - 1);

            for (let e of i.slides) if (e.slug && e.slug === t) return i.slideTo(e.index);

            const o = s.getSlide(),
                  n = o.$trigger && o.$trigger.dataset;
            if (n && n.fancybox === t) return i.slideTo(e - 1);
          }

          s.plugins.Hash.hasSilentClose = !0, s.close();
        }

        L.startFromUrl();
      }

      static create(t) {
        function e() {
          window.addEventListener("hashchange", L.onHashChange, !1), L.startFromUrl();
        }

        L.Fancybox = t, v && window.requestAnimationFrame(() => {
          /complete|interactive|loaded/.test(document.readyState) ? e() : document.addEventListener("DOMContentLoaded", e);
        });
      }

      static destroy() {
        window.removeEventListener("hashchange", L.onHashChange, !1);
      }

      static getParsedURL() {
        const t = window.location.hash.substr(1),
              e = t.split("-"),
              i = e.length > 1 && /^\+?\d+$/.test(e[e.length - 1]) && parseInt(e.pop(-1), 10) || null;
        return {
          hash: t,
          slug: e.join("-"),
          index: i
        };
      }

    }

    const _ = {
      pageXOffset: 0,
      pageYOffset: 0,
      element: () => document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement,

      activate(t) {
        _.pageXOffset = window.pageXOffset, _.pageYOffset = window.pageYOffset, t.requestFullscreen ? t.requestFullscreen() : t.mozRequestFullScreen ? t.mozRequestFullScreen() : t.webkitRequestFullscreen ? t.webkitRequestFullscreen() : t.msRequestFullscreen && t.msRequestFullscreen();
      },

      deactivate() {
        document.exitFullscreen ? document.exitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen();
      }

    };

    class A {
      constructor(t) {
        this.fancybox = t, this.active = !1, this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
      }

      isActive() {
        return this.active;
      }

      setTimer() {
        if (!this.active || this.timer) return;
        const t = this.fancybox.option("slideshow.delay", 3e3);
        this.timer = setTimeout(() => {
          this.timer = null, this.fancybox.option("infinite") || this.fancybox.getSlide().index !== this.fancybox.Carousel.slides.length - 1 ? this.fancybox.next() : this.fancybox.jumpTo(0, {
            friction: 0
          });
        }, t);
        let e = this.$progress;
        e || (e = document.createElement("div"), e.classList.add("fancybox__progress"), this.fancybox.$carousel.parentNode.insertBefore(e, this.fancybox.$carousel), this.$progress = e, e.offsetHeight), e.style.transitionDuration = `${t}ms`, e.style.transform = "scaleX(1)";
      }

      clearTimer() {
        clearTimeout(this.timer), this.timer = null, this.$progress && (this.$progress.style.transitionDuration = "", this.$progress.style.transform = "", this.$progress.offsetHeight);
      }

      activate() {
        this.active || (this.active = !0, this.fancybox.$container.classList.add("has-slideshow"), "done" === this.fancybox.getSlide().state && this.setTimer(), document.addEventListener("visibilitychange", this.handleVisibilityChange, !1));
      }

      handleVisibilityChange() {
        this.deactivate();
      }

      deactivate() {
        this.active = !1, this.clearTimer(), this.fancybox.$container.classList.remove("has-slideshow"), document.removeEventListener("visibilitychange", this.handleVisibilityChange, !1);
      }

      toggle() {
        this.active ? this.deactivate() : this.fancybox.Carousel.slides.length > 1 && this.activate();
      }

    }

    const z = {
      display: ["counter", "zoom", "slideshow", "fullscreen", "thumbs", "close"],
      autoEnable: !0,
      items: {
        counter: {
          position: "left",
          type: "div",
          class: "fancybox__counter",
          html: '<span data-fancybox-index=""></span>&nbsp;/&nbsp;<span data-fancybox-count=""></span>',
          attr: {
            tabindex: -1
          }
        },
        prev: {
          type: "button",
          class: "fancybox__button--prev",
          label: "PREV",
          html: '<svg viewBox="0 0 24 24"><path d="M15 4l-8 8 8 8"/></svg>',
          attr: {
            "data-fancybox-prev": ""
          }
        },
        next: {
          type: "button",
          class: "fancybox__button--next",
          label: "NEXT",
          html: '<svg viewBox="0 0 24 24"><path d="M8 4l8 8-8 8"/></svg>',
          attr: {
            "data-fancybox-next": ""
          }
        },
        fullscreen: {
          type: "button",
          class: "fancybox__button--fullscreen",
          label: "TOGGLE_FULLSCREEN",
          html: '<svg viewBox="0 0 24 24">\n                <g><path d="M3 8 V3h5"></path><path d="M21 8V3h-5"></path><path d="M8 21H3v-5"></path><path d="M16 21h5v-5"></path></g>\n                <g><path d="M7 2v5H2M17 2v5h5M2 17h5v5M22 17h-5v5"/></g>\n            </svg>',
          click: function (t) {
            t.preventDefault(), _.element() ? _.deactivate() : _.activate(this.fancybox.$container);
          }
        },
        slideshow: {
          type: "button",
          class: "fancybox__button--slideshow",
          label: "TOGGLE_SLIDESHOW",
          html: '<svg viewBox="0 0 24 24">\n                <g><path d="M6 4v16"/><path d="M20 12L6 20"/><path d="M20 12L6 4"/></g>\n                <g><path d="M7 4v15M17 4v15"/></g>\n            </svg>',
          click: function (t) {
            t.preventDefault(), this.Slideshow.toggle();
          }
        },
        zoom: {
          type: "button",
          class: "fancybox__button--zoom",
          label: "TOGGLE_ZOOM",
          html: '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"></circle><path d="M16 16 L21 21"></svg>',
          click: function (t) {
            t.preventDefault();
            const e = this.fancybox.getSlide().Panzoom;
            e && e.toggleZoom();
          }
        },
        download: {
          type: "link",
          label: "DOWNLOAD",
          class: "fancybox__button--download",
          html: '<svg viewBox="0 0 24 24"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.62 2.48A2 2 0 004.56 21h14.88a2 2 0 001.94-1.51L22 17"/></svg>',
          click: function (t) {
            t.stopPropagation();
          }
        },
        thumbs: {
          type: "button",
          label: "TOGGLE_THUMBS",
          class: "fancybox__button--thumbs",
          html: '<svg viewBox="0 0 24 24"><circle cx="4" cy="4" r="1" /><circle cx="12" cy="4" r="1" transform="rotate(90 12 4)"/><circle cx="20" cy="4" r="1" transform="rotate(90 20 4)"/><circle cx="4" cy="12" r="1" transform="rotate(90 4 12)"/><circle cx="12" cy="12" r="1" transform="rotate(90 12 12)"/><circle cx="20" cy="12" r="1" transform="rotate(90 20 12)"/><circle cx="4" cy="20" r="1" transform="rotate(90 4 20)"/><circle cx="12" cy="20" r="1" transform="rotate(90 12 20)"/><circle cx="20" cy="20" r="1" transform="rotate(90 20 20)"/></svg>',
          click: function (t) {
            t.stopPropagation();
            const e = this.fancybox.plugins.Thumbs;
            e && e.toggle();
          }
        },
        close: {
          type: "button",
          label: "CLOSE",
          class: "fancybox__button--close",
          html: '<svg viewBox="0 0 24 24"><path d="M20 20L4 4m16 0L4 20"></path></svg>',
          attr: {
            "data-fancybox-close": "",
            tabindex: 0
          }
        }
      }
    };

    class k {
      constructor(t) {
        this.fancybox = t, this.$container = null, this.state = "init";

        for (const t of ["onInit", "onPrepare", "onDone", "onKeydown", "onClosing", "onChange", "onSettle", "onRefresh"]) this[t] = this[t].bind(this);

        this.events = {
          init: this.onInit,
          prepare: this.onPrepare,
          done: this.onDone,
          keydown: this.onKeydown,
          closing: this.onClosing,
          "Carousel.change": this.onChange,
          "Carousel.settle": this.onSettle,
          "Carousel.Panzoom.touchStart": () => this.onRefresh(),
          "Image.startAnimation": (t, e) => this.onRefresh(e),
          "Image.afterUpdate": (t, e) => this.onRefresh(e)
        };
      }

      onInit() {
        if (this.fancybox.option("Toolbar.autoEnable")) {
          let t = !1;

          for (const e of this.fancybox.items) if ("image" === e.type) {
            t = !0;
            break;
          }

          if (!t) return void (this.state = "disabled");
        }

        for (const e of this.fancybox.option("Toolbar.display")) {
          if ("close" === (t(e) ? e.id : e)) {
            this.fancybox.options.closeButton = !1;
            break;
          }
        }
      }

      onPrepare() {
        const t = this.fancybox;
        if ("init" === this.state && (this.build(), this.update(), this.Slideshow = new A(t), !t.Carousel.prevPage && (t.option("slideshow.autoStart") && this.Slideshow.activate(), t.option("fullscreen.autoStart") && !_.element()))) try {
          _.activate(t.$container);
        } catch (t) {}
      }

      onFsChange() {
        window.scrollTo(_.pageXOffset, _.pageYOffset);
      }

      onSettle() {
        const t = this.fancybox,
              e = this.Slideshow;
        e && e.isActive() && (t.getSlide().index !== t.Carousel.slides.length - 1 || t.option("infinite") ? "done" === t.getSlide().state && e.setTimer() : e.deactivate());
      }

      onChange() {
        this.update(), this.Slideshow && this.Slideshow.isActive() && this.Slideshow.clearTimer();
      }

      onDone(t, e) {
        const i = this.Slideshow;
        e.index === t.getSlide().index && (this.update(), i && i.isActive() && (t.option("infinite") || e.index !== t.Carousel.slides.length - 1 ? i.setTimer() : i.deactivate()));
      }

      onRefresh(t) {
        t && t.index !== this.fancybox.getSlide().index || (this.update(), !this.Slideshow || !this.Slideshow.isActive() || t && "done" !== t.state || this.Slideshow.deactivate());
      }

      onKeydown(t, e, i) {
        " " === e && this.Slideshow && (this.Slideshow.toggle(), i.preventDefault());
      }

      onClosing() {
        this.Slideshow && this.Slideshow.deactivate(), document.removeEventListener("fullscreenchange", this.onFsChange);
      }

      createElement(t) {
        let e;
        "div" === t.type ? e = document.createElement("div") : (e = document.createElement("link" === t.type ? "a" : "button"), e.classList.add("carousel__button")), e.innerHTML = t.html, e.setAttribute("tabindex", t.tabindex || 0), t.class && e.classList.add(...t.class.split(" "));

        for (const i in t.attr) e.setAttribute(i, t.attr[i]);

        t.label && e.setAttribute("title", this.fancybox.localize(`{{${t.label}}}`)), t.click && e.addEventListener("click", t.click.bind(this)), "prev" === t.id && e.setAttribute("data-fancybox-prev", ""), "next" === t.id && e.setAttribute("data-fancybox-next", "");
        const i = e.querySelector("svg");
        return i && (i.setAttribute("role", "img"), i.setAttribute("tabindex", "-1"), i.setAttribute("xmlns", "http://www.w3.org/2000/svg")), e;
      }

      build() {
        this.cleanup();
        const i = this.fancybox.option("Toolbar.items"),
              s = [{
          position: "left",
          items: []
        }, {
          position: "center",
          items: []
        }, {
          position: "right",
          items: []
        }],
              o = this.fancybox.plugins.Thumbs;

        for (const n of this.fancybox.option("Toolbar.display")) {
          let a, r;
          if (t(n) ? (a = n.id, r = e({}, i[a], n)) : (a = n, r = i[a]), ["counter", "next", "prev", "slideshow"].includes(a) && this.fancybox.items.length < 2) continue;

          if ("fullscreen" === a) {
            if (!document.fullscreenEnabled || window.fullScreen) continue;
            document.addEventListener("fullscreenchange", this.onFsChange);
          }

          if ("thumbs" === a && (!o || "disabled" === o.state)) continue;
          if (!r) continue;
          let h = r.position || "right",
              l = s.find(t => t.position === h);
          l && l.items.push(r);
        }

        const n = document.createElement("div");
        n.classList.add("fancybox__toolbar");

        for (const t of s) if (t.items.length) {
          const e = document.createElement("div");
          e.classList.add("fancybox__toolbar__items"), e.classList.add(`fancybox__toolbar__items--${t.position}`);

          for (const i of t.items) e.appendChild(this.createElement(i));

          n.appendChild(e);
        }

        this.fancybox.$carousel.parentNode.insertBefore(n, this.fancybox.$carousel), this.$container = n;
      }

      update() {
        const t = this.fancybox.getSlide(),
              e = t.index,
              i = this.fancybox.items.length,
              s = t.downloadSrc || ("image" !== t.type || t.error ? null : t.src);

        for (const t of this.fancybox.$container.querySelectorAll("a.fancybox__button--download")) s ? (t.removeAttribute("disabled"), t.removeAttribute("tabindex"), t.setAttribute("href", s), t.setAttribute("download", s), t.setAttribute("target", "_blank")) : (t.setAttribute("disabled", ""), t.setAttribute("tabindex", -1), t.removeAttribute("href"), t.removeAttribute("download"));

        const o = t.Panzoom,
              n = o && o.option("maxScale") > o.option("baseScale");

        for (const t of this.fancybox.$container.querySelectorAll(".fancybox__button--zoom")) n ? t.removeAttribute("disabled") : t.setAttribute("disabled", "");

        for (const e of this.fancybox.$container.querySelectorAll("[data-fancybox-index]")) e.innerHTML = t.index + 1;

        for (const t of this.fancybox.$container.querySelectorAll("[data-fancybox-count]")) t.innerHTML = i;

        if (!this.fancybox.option("infinite")) {
          for (const t of this.fancybox.$container.querySelectorAll("[data-fancybox-prev]")) 0 === e ? t.setAttribute("disabled", "") : t.removeAttribute("disabled");

          for (const t of this.fancybox.$container.querySelectorAll("[data-fancybox-next]")) e === i - 1 ? t.setAttribute("disabled", "") : t.removeAttribute("disabled");
        }
      }

      cleanup() {
        this.Slideshow && this.Slideshow.isActive() && this.Slideshow.clearTimer(), this.$container && this.$container.remove(), this.$container = null;
      }

      attach() {
        this.fancybox.on(this.events);
      }

      detach() {
        this.fancybox.off(this.events), this.cleanup();
      }

    }

    k.defaults = z;
    const O = {
      ScrollLock: class {
        constructor(t) {
          this.fancybox = t, this.viewport = null, this.pendingUpdate = null;

          for (const t of ["onReady", "onResize", "onTouchstart", "onTouchmove"]) this[t] = this[t].bind(this);
        }

        onReady() {
          const t = window.visualViewport;
          t && (this.viewport = t, this.startY = 0, t.addEventListener("resize", this.onResize), this.updateViewport()), window.addEventListener("touchstart", this.onTouchstart, {
            passive: !1
          }), window.addEventListener("touchmove", this.onTouchmove, {
            passive: !1
          }), window.addEventListener("wheel", this.onWheel, {
            passive: !1
          });
        }

        onResize() {
          this.updateViewport();
        }

        updateViewport() {
          const t = this.fancybox,
                e = this.viewport,
                i = e.scale || 1,
                s = t.$container;
          if (!s) return;
          let o = "",
              n = "",
              a = "";
          i - 1 > .1 && (o = e.width * i + "px", n = e.height * i + "px", a = `translate3d(${e.offsetLeft}px, ${e.offsetTop}px, 0) scale(${1 / i})`), s.style.width = o, s.style.height = n, s.style.transform = a;
        }

        onTouchstart(t) {
          this.startY = t.touches ? t.touches[0].screenY : t.screenY;
        }

        onTouchmove(t) {
          const e = this.startY,
                i = window.innerWidth / window.document.documentElement.clientWidth;
          if (!t.cancelable) return;
          if (t.touches.length > 1 || 1 !== i) return;
          const o = s(t.composedPath()[0]);
          if (!o) return void t.preventDefault();
          const n = window.getComputedStyle(o),
                a = parseInt(n.getPropertyValue("height"), 10),
                r = t.touches ? t.touches[0].screenY : t.screenY,
                h = e <= r && 0 === o.scrollTop,
                l = e >= r && o.scrollHeight - o.scrollTop === a;
          (h || l) && t.preventDefault();
        }

        onWheel(t) {
          s(t.composedPath()[0]) || t.preventDefault();
        }

        cleanup() {
          this.pendingUpdate && (cancelAnimationFrame(this.pendingUpdate), this.pendingUpdate = null);
          const t = this.viewport;
          t && (t.removeEventListener("resize", this.onResize), this.viewport = null), window.removeEventListener("touchstart", this.onTouchstart, !1), window.removeEventListener("touchmove", this.onTouchmove, !1), window.removeEventListener("wheel", this.onWheel, {
            passive: !1
          });
        }

        attach() {
          this.fancybox.on("initLayout", this.onReady);
        }

        detach() {
          this.fancybox.off("initLayout", this.onReady), this.cleanup();
        }

      },
      Thumbs: C,
      Html: P,
      Toolbar: k,
      Image: T,
      Hash: L
    };
    const M = {
      startIndex: 0,
      preload: 1,
      infinite: !0,
      showClass: "fancybox-zoomInUp",
      hideClass: "fancybox-fadeOut",
      animated: !0,
      hideScrollbar: !0,
      parentEl: null,
      mainClass: null,
      autoFocus: !0,
      trapFocus: !0,
      placeFocusBack: !0,
      click: "close",
      closeButton: "inside",
      dragToClose: !0,
      keyboard: {
        Escape: "close",
        Delete: "close",
        Backspace: "close",
        PageUp: "next",
        PageDown: "prev",
        ArrowUp: "next",
        ArrowDown: "prev",
        ArrowRight: "next",
        ArrowLeft: "prev"
      },
      template: {
        closeButton: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg>',
        spinner: '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="25 25 50 50" tabindex="-1"><circle cx="50" cy="50" r="20"/></svg>',
        main: null
      },
      l10n: {
        CLOSE: "Close",
        NEXT: "Next",
        PREV: "Previous",
        MODAL: "You can close this modal content with the ESC key",
        ERROR: "Something Went Wrong, Please Try Again Later",
        IMAGE_ERROR: "Image Not Found",
        ELEMENT_NOT_FOUND: "HTML Element Not Found",
        AJAX_NOT_FOUND: "Error Loading AJAX : Not Found",
        AJAX_FORBIDDEN: "Error Loading AJAX : Forbidden",
        IFRAME_ERROR: "Error Loading Page",
        TOGGLE_ZOOM: "Toggle zoom level",
        TOGGLE_THUMBS: "Toggle thumbnails",
        TOGGLE_SLIDESHOW: "Toggle slideshow",
        TOGGLE_FULLSCREEN: "Toggle full-screen mode",
        DOWNLOAD: "Download"
      }
    },
          I = new Map();
    let F = 0;

    class R extends l {
      constructor(t, i = {}) {
        t = t.map(t => (t.width && (t._width = t.width), t.height && (t._height = t.height), t)), super(e(!0, {}, M, i)), this.bindHandlers(), this.state = "init", this.setItems(t), this.attachPlugins(R.Plugins), this.trigger("init"), !0 === this.option("hideScrollbar") && this.hideScrollbar(), this.initLayout(), this.initCarousel(), this.attachEvents(), I.set(this.id, this), this.trigger("prepare"), this.state = "ready", this.trigger("ready"), this.$container.setAttribute("aria-hidden", "false"), this.option("trapFocus") && this.focus();
      }

      option(t, ...e) {
        const i = this.getSlide();
        let s = i ? i[t] : void 0;
        return void 0 !== s ? ("function" == typeof s && (s = s.call(this, this, ...e)), s) : super.option(t, ...e);
      }

      bindHandlers() {
        for (const t of ["onMousedown", "onKeydown", "onClick", "onFocus", "onCreateSlide", "onSettle", "onTouchMove", "onTouchEnd", "onTransform"]) this[t] = this[t].bind(this);
      }

      attachEvents() {
        document.addEventListener("mousedown", this.onMousedown), document.addEventListener("keydown", this.onKeydown, !0), this.option("trapFocus") && document.addEventListener("focus", this.onFocus, !0), this.$container.addEventListener("click", this.onClick);
      }

      detachEvents() {
        document.removeEventListener("mousedown", this.onMousedown), document.removeEventListener("keydown", this.onKeydown, !0), document.removeEventListener("focus", this.onFocus, !0), this.$container.removeEventListener("click", this.onClick);
      }

      initLayout() {
        this.$root = this.option("parentEl") || document.body;
        let t = this.option("template.main");
        t && (this.$root.insertAdjacentHTML("beforeend", this.localize(t)), this.$container = this.$root.querySelector(".fancybox__container")), this.$container || (this.$container = document.createElement("div"), this.$root.appendChild(this.$container)), this.$container.onscroll = () => (this.$container.scrollLeft = 0, !1), Object.entries({
          class: "fancybox__container",
          role: "dialog",
          tabIndex: "-1",
          "aria-modal": "true",
          "aria-hidden": "true",
          "aria-label": this.localize("{{MODAL}}")
        }).forEach(t => this.$container.setAttribute(...t)), this.option("animated") && this.$container.classList.add("is-animated"), this.$backdrop = this.$container.querySelector(".fancybox__backdrop"), this.$backdrop || (this.$backdrop = document.createElement("div"), this.$backdrop.classList.add("fancybox__backdrop"), this.$container.appendChild(this.$backdrop)), this.$carousel = this.$container.querySelector(".fancybox__carousel"), this.$carousel || (this.$carousel = document.createElement("div"), this.$carousel.classList.add("fancybox__carousel"), this.$container.appendChild(this.$carousel)), this.$container.Fancybox = this, this.id = this.$container.getAttribute("id"), this.id || (this.id = this.options.id || ++F, this.$container.setAttribute("id", "fancybox-" + this.id));
        const e = this.option("mainClass");
        return e && this.$container.classList.add(...e.split(" ")), document.documentElement.classList.add("with-fancybox"), this.trigger("initLayout"), this;
      }

      setItems(t) {
        const e = [];

        for (const i of t) {
          const t = i.$trigger;

          if (t) {
            const e = t.dataset || {};
            i.src = e.src || t.getAttribute("href") || i.src, i.type = e.type || i.type, !i.src && t instanceof HTMLImageElement && (i.src = t.currentSrc || i.$trigger.src);
          }

          let s = i.$thumb;

          if (!s) {
            let t = i.$trigger && i.$trigger.origTarget;
            t && (s = t instanceof HTMLImageElement ? t : t.querySelector("img:not([aria-hidden])")), !s && i.$trigger && (s = i.$trigger instanceof HTMLImageElement ? i.$trigger : i.$trigger.querySelector("img:not([aria-hidden])"));
          }

          i.$thumb = s || null;
          let o = i.thumb;
          !o && s && (o = s.currentSrc || s.src, !o && s.dataset && (o = s.dataset.lazySrc || s.dataset.src)), o || "image" !== i.type || (o = i.src), i.thumb = o || null, i.caption = i.caption || "", e.push(i);
        }

        this.items = e;
      }

      initCarousel() {
        return this.Carousel = new y(this.$carousel, e(!0, {}, {
          prefix: "",
          classNames: {
            viewport: "fancybox__viewport",
            track: "fancybox__track",
            slide: "fancybox__slide"
          },
          textSelection: !0,
          preload: this.option("preload"),
          friction: .88,
          slides: this.items,
          initialPage: this.options.startIndex,
          slidesPerPage: 1,
          infiniteX: this.option("infinite"),
          infiniteY: !0,
          l10n: this.option("l10n"),
          Dots: !1,
          Navigation: {
            classNames: {
              main: "fancybox__nav",
              button: "carousel__button",
              next: "is-next",
              prev: "is-prev"
            }
          },
          Panzoom: {
            textSelection: !0,
            panOnlyZoomed: () => this.Carousel && this.Carousel.pages && this.Carousel.pages.length < 2 && !this.option("dragToClose"),
            lockAxis: () => {
              if (this.Carousel) {
                let t = "x";
                return this.option("dragToClose") && (t += "y"), t;
              }
            }
          },
          on: {
            "*": (t, ...e) => this.trigger(`Carousel.${t}`, ...e),
            init: t => this.Carousel = t,
            createSlide: this.onCreateSlide,
            settle: this.onSettle
          }
        }, this.option("Carousel"))), this.option("dragToClose") && this.Carousel.Panzoom.on({
          touchMove: this.onTouchMove,
          afterTransform: this.onTransform,
          touchEnd: this.onTouchEnd
        }), this.trigger("initCarousel"), this;
      }

      onCreateSlide(t, e) {
        let i = e.caption || "";

        if ("function" == typeof this.options.caption && (i = this.options.caption.call(this, this, this.Carousel, e)), "string" == typeof i && i.length) {
          const t = document.createElement("div"),
                s = `fancybox__caption_${this.id}_${e.index}`;
          t.className = "fancybox__caption", t.innerHTML = i, t.setAttribute("id", s), e.$caption = e.$el.appendChild(t), e.$el.classList.add("has-caption"), e.$el.setAttribute("aria-labelledby", s);
        }
      }

      onSettle() {
        this.option("autoFocus") && this.focus();
      }

      onFocus(t) {
        this.isTopmost() && this.focus(t);
      }

      onClick(t) {
        if (t.defaultPrevented) return;
        let e = t.composedPath()[0];
        if (e.matches("[data-fancybox-close]")) return t.preventDefault(), void R.close(!1, t);
        if (e.matches("[data-fancybox-next]")) return t.preventDefault(), void R.next();
        if (e.matches("[data-fancybox-prev]")) return t.preventDefault(), void R.prev();
        const i = document.activeElement;

        if (i) {
          if (i.closest("[contenteditable]")) return;
          e.matches(x) || i.blur();
        }

        if (e.closest(".fancybox__content")) return;
        if (getSelection().toString().length) return;
        if (!1 === this.trigger("click", t)) return;

        switch (this.option("click")) {
          case "close":
            this.close();
            break;

          case "next":
            this.next();
        }
      }

      onTouchMove() {
        const t = this.getSlide().Panzoom;
        return !t || 1 === t.content.scale;
      }

      onTouchEnd(t) {
        const e = t.dragOffset.y;
        Math.abs(e) >= 150 || Math.abs(e) >= 35 && t.dragOffset.time < 350 ? (this.option("hideClass") && (this.getSlide().hideClass = "fancybox-throwOut" + (t.content.y < 0 ? "Up" : "Down")), this.close()) : "y" === t.lockAxis && t.panTo({
          y: 0
        });
      }

      onTransform(t) {
        if (this.$backdrop) {
          const e = Math.abs(t.content.y),
                i = e < 1 ? "" : Math.max(.33, Math.min(1, 1 - e / t.content.fitHeight * 1.5));
          this.$container.style.setProperty("--fancybox-ts", i ? "0s" : ""), this.$container.style.setProperty("--fancybox-opacity", i);
        }
      }

      onMousedown() {
        "ready" === this.state && document.body.classList.add("is-using-mouse");
      }

      onKeydown(t) {
        if (!this.isTopmost()) return;
        document.body.classList.remove("is-using-mouse");
        const e = t.key,
              i = this.option("keyboard");
        if (!i || t.ctrlKey || t.altKey || t.shiftKey) return;
        const s = t.composedPath()[0],
              o = document.activeElement && document.activeElement.classList,
              n = o && o.contains("carousel__button");

        if ("Escape" !== e && !n) {
          if (t.target.isContentEditable || -1 !== ["BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(s.nodeName)) return;
        }

        if (!1 === this.trigger("keydown", e, t)) return;
        const a = i[e];
        "function" == typeof this[a] && this[a]();
      }

      getSlide() {
        const t = this.Carousel;
        if (!t) return null;
        const e = null === t.page ? t.option("initialPage") : t.page,
              i = t.pages || [];
        return i.length && i[e] ? i[e].slides[0] : null;
      }

      focus(t) {
        if (R.ignoreFocusChange) return;
        if (["init", "closing", "customClosing", "destroy"].indexOf(this.state) > -1) return;
        const e = this.$container,
              i = this.getSlide(),
              s = "done" === i.state ? i.$el : null;
        if (s && s.contains(document.activeElement)) return;
        t && t.preventDefault(), R.ignoreFocusChange = !0;
        const o = Array.from(e.querySelectorAll(x));
        let n,
            a = [];

        for (let t of o) {
          const e = t.offsetParent,
                i = s && s.contains(t),
                o = !this.Carousel.$viewport.contains(t);
          e && (i || o) ? (a.push(t), void 0 !== t.dataset.origTabindex && (t.tabIndex = t.dataset.origTabindex, t.removeAttribute("data-orig-tabindex")), (t.hasAttribute("autoFocus") || !n && i && !t.classList.contains("carousel__button")) && (n = t)) : (t.dataset.origTabindex = void 0 === t.dataset.origTabindex ? t.getAttribute("tabindex") : t.dataset.origTabindex, t.tabIndex = -1);
        }

        t ? a.indexOf(t.target) > -1 ? this.lastFocus = t.target : this.lastFocus === e ? w(a[a.length - 1]) : w(e) : this.option("autoFocus") && n ? w(n) : a.indexOf(document.activeElement) < 0 && w(e), this.lastFocus = document.activeElement, R.ignoreFocusChange = !1;
      }

      hideScrollbar() {
        if (!v) return;
        const t = window.innerWidth - document.documentElement.getBoundingClientRect().width,
              e = "fancybox-style-noscroll";
        let i = document.getElementById(e);
        i || t > 0 && (i = document.createElement("style"), i.id = e, i.type = "text/css", i.innerHTML = `.compensate-for-scrollbar {padding-right: ${t}px;}`, document.getElementsByTagName("head")[0].appendChild(i), document.body.classList.add("compensate-for-scrollbar"));
      }

      revealScrollbar() {
        document.body.classList.remove("compensate-for-scrollbar");
        const t = document.getElementById("fancybox-style-noscroll");
        t && t.remove();
      }

      clearContent(t) {
        this.Carousel.trigger("removeSlide", t), t.$content && (t.$content.remove(), t.$content = null), t.$closeButton && (t.$closeButton.remove(), t.$closeButton = null), t._className && t.$el.classList.remove(t._className);
      }

      setContent(t, e, i = {}) {
        let s;
        const o = t.$el;
        if (e instanceof HTMLElement) ["img", "iframe", "video", "audio"].indexOf(e.nodeName.toLowerCase()) > -1 ? (s = document.createElement("div"), s.appendChild(e)) : s = e;else {
          const t = document.createRange().createContextualFragment(e);
          s = document.createElement("div"), s.appendChild(t);
        }
        if (t.filter && !t.error && (s = s.querySelector(t.filter)), s instanceof Element) return t._className = `has-${i.suffix || t.type || "unknown"}`, o.classList.add(t._className), s.classList.add("fancybox__content"), "none" !== s.style.display && "none" !== getComputedStyle(s).getPropertyValue("display") || (s.style.display = t.display || this.option("defaultDisplay") || "flex"), t.id && s.setAttribute("id", t.id), t.$content = s, o.prepend(s), this.manageCloseButton(t), "loading" !== t.state && this.revealContent(t), s;
        this.setError(t, "{{ELEMENT_NOT_FOUND}}");
      }

      manageCloseButton(t) {
        const e = void 0 === t.closeButton ? this.option("closeButton") : t.closeButton;
        if (!e || "top" === e && this.$closeButton) return;
        const i = document.createElement("button");
        i.classList.add("carousel__button", "is-close"), i.setAttribute("title", this.options.l10n.CLOSE), i.innerHTML = this.option("template.closeButton"), i.addEventListener("click", t => this.close(t)), "inside" === e ? (t.$closeButton && t.$closeButton.remove(), t.$closeButton = t.$content.appendChild(i)) : this.$closeButton = this.$container.insertBefore(i, this.$container.firstChild);
      }

      revealContent(t) {
        this.trigger("reveal", t), t.$content.style.visibility = "";
        let e = !1;
        t.error || "loading" === t.state || null !== this.Carousel.prevPage || t.index !== this.options.startIndex || (e = void 0 === t.showClass ? this.option("showClass") : t.showClass), e ? (t.state = "animating", this.animateCSS(t.$content, e, () => {
          this.done(t);
        })) : this.done(t);
      }

      animateCSS(t, e, i) {
        if (t && t.dispatchEvent(new CustomEvent("animationend", {
          bubbles: !0,
          cancelable: !0
        })), !t || !e) return void ("function" == typeof i && i());

        const s = function (o) {
          o.currentTarget === this && (t.removeEventListener("animationend", s), i && i(), t.classList.remove(e));
        };

        t.addEventListener("animationend", s), t.classList.add(e);
      }

      done(t) {
        t.state = "done", this.trigger("done", t);
        const e = this.getSlide();
        e && t.index === e.index && this.option("autoFocus") && this.focus();
      }

      setError(t, e) {
        t.error = e, this.hideLoading(t), this.clearContent(t);
        const i = document.createElement("div");
        i.classList.add("fancybox-error"), i.innerHTML = this.localize(e || "<p>{{ERROR}}</p>"), this.setContent(t, i, {
          suffix: "error"
        });
      }

      showLoading(t) {
        t.state = "loading", t.$el.classList.add("is-loading");
        let e = t.$el.querySelector(".fancybox__spinner");
        e || (e = document.createElement("div"), e.classList.add("fancybox__spinner"), e.innerHTML = this.option("template.spinner"), e.addEventListener("click", () => {
          this.Carousel.Panzoom.velocity || this.close();
        }), t.$el.prepend(e));
      }

      hideLoading(t) {
        const e = t.$el && t.$el.querySelector(".fancybox__spinner");
        e && (e.remove(), t.$el.classList.remove("is-loading")), "loading" === t.state && (this.trigger("load", t), t.state = "ready");
      }

      next() {
        const t = this.Carousel;
        t && t.pages.length > 1 && t.slideNext();
      }

      prev() {
        const t = this.Carousel;
        t && t.pages.length > 1 && t.slidePrev();
      }

      jumpTo(...t) {
        this.Carousel && this.Carousel.slideTo(...t);
      }

      isClosing() {
        return ["closing", "customClosing", "destroy"].includes(this.state);
      }

      isTopmost() {
        return R.getInstance().id == this.id;
      }

      close(t) {
        if (t && t.preventDefault(), this.isClosing()) return;
        if (!1 === this.trigger("shouldClose", t)) return;
        if (this.state = "closing", this.Carousel.Panzoom.destroy(), this.detachEvents(), this.trigger("closing", t), "destroy" === this.state) return;
        this.$container.setAttribute("aria-hidden", "true"), this.$container.classList.add("is-closing");
        const e = this.getSlide();

        if (this.Carousel.slides.forEach(t => {
          t.$content && t.index !== e.index && this.Carousel.trigger("removeSlide", t);
        }), "closing" === this.state) {
          const t = void 0 === e.hideClass ? this.option("hideClass") : e.hideClass;
          this.animateCSS(e.$content, t, () => {
            this.destroy();
          }, !0);
        }
      }

      destroy() {
        if ("destroy" === this.state) return;
        this.state = "destroy", this.trigger("destroy");
        const t = this.option("placeFocusBack") ? this.option("triggerTarget", this.getSlide().$trigger) : null;
        this.Carousel.destroy(), this.detachPlugins(), this.Carousel = null, this.options = {}, this.events = {}, this.$container.remove(), this.$container = this.$backdrop = this.$carousel = null, t && w(t), I.delete(this.id);
        const e = R.getInstance();
        e ? e.focus() : (document.documentElement.classList.remove("with-fancybox"), document.body.classList.remove("is-using-mouse"), this.revealScrollbar());
      }

      static show(t, e = {}) {
        return new R(t, e);
      }

      static fromEvent(t, e = {}) {
        if (t.defaultPrevented) return;
        if (t.button && 0 !== t.button) return;
        if (t.ctrlKey || t.metaKey || t.shiftKey) return;
        const i = t.composedPath()[0];
        let s,
            o,
            n,
            a = i;

        if ((a.matches("[data-fancybox-trigger]") || (a = a.closest("[data-fancybox-trigger]"))) && (e.triggerTarget = a, s = a && a.dataset && a.dataset.fancyboxTrigger), s) {
          const t = document.querySelectorAll(`[data-fancybox="${s}"]`),
                e = parseInt(a.dataset.fancyboxIndex, 10) || 0;
          a = t.length ? t[e] : a;
        }

        Array.from(R.openers.keys()).reverse().some(e => {
          n = a || i;
          let s = !1;

          try {
            n instanceof Element && ("string" == typeof e || e instanceof String) && (s = n.matches(e) || (n = n.closest(e)));
          } catch (t) {}

          return !!s && (t.preventDefault(), o = e, !0);
        });
        let r = !1;

        if (o) {
          e.event = t, e.target = n, n.origTarget = i, r = R.fromOpener(o, e);
          const s = R.getInstance();
          s && "ready" === s.state && t.detail && document.body.classList.add("is-using-mouse");
        }

        return r;
      }

      static fromOpener(t, i = {}) {
        let s = [],
            o = i.startIndex || 0,
            n = i.target || null;
        const a = void 0 !== (i = e({}, i, R.openers.get(t))).groupAll && i.groupAll,
              r = void 0 === i.groupAttr ? "data-fancybox" : i.groupAttr,
              h = r && n ? n.getAttribute(`${r}`) : "";

        if (!n || h || a) {
          const e = i.root || (n ? n.getRootNode() : document.body);
          s = [].slice.call(e.querySelectorAll(t));
        }

        if (n && !a && (s = h ? s.filter(t => t.getAttribute(`${r}`) === h) : [n]), !s.length) return !1;
        const l = R.getInstance();
        return !(l && s.indexOf(l.options.$trigger) > -1) && (o = n ? s.indexOf(n) : o, s = s.map(function (t) {
          const e = ["false", "0", "no", "null", "undefined"],
                i = ["true", "1", "yes"],
                s = Object.assign({}, t.dataset),
                o = {};

          for (let [t, n] of Object.entries(s)) if ("fancybox" !== t) if ("width" === t || "height" === t) o[`_${t}`] = n;else if ("string" == typeof n || n instanceof String) {
            if (e.indexOf(n) > -1) o[t] = !1;else if (i.indexOf(o[t]) > -1) o[t] = !0;else try {
              o[t] = JSON.parse(n);
            } catch (e) {
              o[t] = n;
            }
          } else o[t] = n;

          return t instanceof Element && (o.$trigger = t), o;
        }), new R(s, e({}, i, {
          startIndex: o,
          $trigger: n
        })));
      }

      static bind(t, e = {}) {
        function i() {
          document.body.addEventListener("click", R.fromEvent, !1);
        }

        v && (R.openers.size || (/complete|interactive|loaded/.test(document.readyState) ? i() : document.addEventListener("DOMContentLoaded", i)), R.openers.set(t, e));
      }

      static unbind(t) {
        R.openers.delete(t), R.openers.size || R.destroy();
      }

      static destroy() {
        let t;

        for (; t = R.getInstance();) t.destroy();

        R.openers = new Map(), document.body.removeEventListener("click", R.fromEvent, !1);
      }

      static getInstance(t) {
        if (t) return I.get(t);
        return Array.from(I.values()).reverse().find(t => !t.isClosing() && t) || null;
      }

      static close(t = !0, e) {
        if (t) for (const t of I.values()) t.close(e);else {
          const t = R.getInstance();
          t && t.close(e);
        }
      }

      static next() {
        const t = R.getInstance();
        t && t.next();
      }

      static prev() {
        const t = R.getInstance();
        t && t.prev();
      }

    }

    R.version = "4.0.31", R.defaults = M, R.openers = new Map(), R.Plugins = O, R.bind("[data-fancybox]");

    for (const [t, e] of Object.entries(R.Plugins || {})) "function" == typeof e.create && e.create(R);

    function createFashionSlider(el) {
      const swiperEl = el.querySelector('.swiper-fashion');
      let navigationLocked = false;
      let transitionDisabled = false;
      let frameId;

      const disableTransitions = $el => {
        $el.addClass('fashion-slider-no-transition');
        transitionDisabled = true;
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          $el.removeClass('fashion-slider-no-transition');
          transitionDisabled = false;
          navigationLocked = false;
        });
      };

      const initNavigation = swiper => {
        // Use lock to control the button locking time without using the button component that comes with it
        swiper.$el.find('.fashion-slider-button-next').on('click', () => {
          if (!navigationLocked) {
            swiper.slideNext();
          }
        });
        swiper.$el.find('.fashion-slider-button-prev').on('click', () => {
          if (!navigationLocked) {
            swiper.slidePrev();
          }
        });
      };

      const destroyNavigation = swiper => {
        swiper.$el.find('.fashion-slider-button-next, .fashion-slider-button-prev').off('click');
      };

      const fashionSlider = new Swiper(swiperEl, {
        modules: [Parallax, Pagination, Autoplay],
        speed: 1300,
        allowTouchMove: false,
        // no touch swiping
        parallax: true,
        // text parallax
        on: {
          transitionStart(swiper) {
            const {
              slides,
              previousIndex,
              activeIndex,
              $el
            } = swiper;
            if (!transitionDisabled) navigationLocked = true; // lock navigation buttons

            const $activeSlide = slides.eq(activeIndex);
            const $previousSlide = slides.eq(previousIndex);
            const $previousImageScale = $previousSlide.find('.fashion-slider-scale'); // image wrapper

            const $previousImage = $previousSlide.find('img'); // current image

            const $activeImage = $activeSlide.find('img'); // next image

            const direction = activeIndex - previousIndex;
            const bgColor = $activeSlide.attr('data-slide-bg-color');
            $el.css('background-color', bgColor); // background color animation

            $previousImageScale.transform('scale(0.6)');
            $previousImage.transition(1000).transform('scale(1.2)'); // image scaling parallax

            $previousSlide.find('.fashion-slider-title-text').transition(1000).css('color', 'rgba(255,255,255,0)') // text transparency animation
            .css('opacity', '0'); // text transparency animation

            $previousImage.transitionEnd(() => {
              $activeImage.transition(1300).transform('translate3d(0, 0, 0) scale(1.2)'); // image shift parallax

              $previousImage.transition(1300).transform(`translate3d(${60 * direction}%, 0, 0)  scale(1.2)`);
            });
          },

          transitionEnd(swiper) {
            const {
              slides,
              activeIndex,
              $el
            } = swiper;
            const $activeSlide = slides.eq(activeIndex);
            const $activeImage = $activeSlide.find('img');
            $activeSlide.find('.fashion-slider-scale').transform('scale(1)');
            $activeImage.transition(1000).transform('scale(1)');
            $activeSlide.find('.fashion-slider-title-text').transition(1000).css('color', 'rgba(255,255,255,1)').css('opacity', '1'); // text transparency animation

            $activeImage.transitionEnd(() => {
              navigationLocked = false;
            }); // First and last, disable button

            if (activeIndex === 0) {
              $el.find('.fashion-slider-button-prev').addClass('fashion-slider-button-disabled');
            } else {
              $el.find('.fashion-slider-button-prev').removeClass('fashion-slider-button-disabled');
            }

            if (activeIndex === slides.length - 1) {
              $el.find('.fashion-slider-button-next').addClass('fashion-slider-button-disabled');
            } else {
              $el.find('.fashion-slider-button-next').removeClass('fashion-slider-button-disabled');
            }
          },

          init(swiper) {
            // Set initial slide bg color
            const {
              slides,
              activeIndex,
              $el
            } = swiper; // disable initial transition

            disableTransitions($el); // set current bg color

            const bgColor = slides.eq(activeIndex).attr('data-slide-bg-color');
            $el.css('background-color', bgColor); // background color animation
            // trigger the transitionEnd event once during initialization

            swiper.emit('transitionEnd'); // init navigation

            initNavigation(swiper);
          },

          resize(swiper) {
            disableTransitions(swiper.$el);
          },

          destroy(swiper) {
            destroyNavigation(swiper);
          }

        },
        pagination: {
          el: ".fashion-pagination",
          type: 'bullets',
          clickable: true
        },
        autoplay: {
          delay: 2500,
          disableOnInteraction: false
        }
      });
      return fashionSlider;
    }

    /*
    some comment
    */
    var wpcf7Elm = document.querySelector('.wpcf7');

    if (wpcf7Elm) {
      wpcf7Elm.addEventListener('wpcf7mailsent', function (event) {
        close();
      }, false);
      wpcf7Elm.addEventListener('wpcf7submit', function (event) {
        var self = this;
        console.log('submitted');
        console.log(event);
        console.log(self);
        window.setTimeout(function () {//			console.log($(self).find('div.wpcf7-response-output').html());
          //			var responseOutput = $(self).find('div.wpcf7-response-output').html();
          //			Fancybox.open(responseOutput);

          /*
          const fancybox = new Fancybox([
            {
          	src: "<p>Lorem ipsum dolor sit amet.</p>",
          	type: "html",
            },
          ]);
          */
        }, 100);
      }, false);
    }
    /*
    $(document).ready(function(){
    	$('.wpcf7').on('wpcf7mailsent',function(){
    		$.fancybox.close( true );
    	});
    	$('.wpcf7').on('wpcf7submit',function(event){
    		//console.log(event);
    		//console.log('some');
    		var self=this;
    		window.setTimeout(function(){
    		console.log($(self).find('div.wpcf7-response-output').html());
    		var responseOutput = $(self).find('div.wpcf7-response-output').html();
    				jQuery.fancybox.open(responseOutput);
    	},100);
    	});
    });

    */

    /**
     * import main Fashion Slider function
     */
    /*end of inludes*/

    document.addEventListener("DOMContentLoaded", ready);

    function ready() {
      /**
       * Fashion Slider element
       */
      const sliderEl = document.querySelector('.fashion-slider');
      /**
       * Init Fashion Slider
       *
       * argument: pass .fashion-slider element
       */

      createFashionSlider(sliderEl); // =======================

      var cvpHandlers = {
        canvasClickHandler: null,
        videoTimeUpdateHandler: null,
        videoCanPlayHandler: null,
        windowResizeHandler: null
      };

      var CanvasVideoPlayer = function (options) {
        var i;
        this.options = {
          framesPerSecond: 25,
          hideVideo: true,
          autoplay: false,
          makeLoop: false,
          pauseOnClick: true,
          audio: false,
          timelineSelector: false,
          resetOnLastFrame: true
        };

        for (i in options) {
          this.options[i] = options[i];
        }

        this.video = document.querySelector(this.options.videoSelector);
        this.canvas = document.querySelector(this.options.canvasSelector);
        this.timeline = document.querySelector(this.options.timelineSelector);
        this.timelinePassed = document.querySelector(this.options.timelineSelector + '> div');

        if (!this.options.videoSelector || !this.video) {
          console.error('No "videoSelector" property, or the element is not found');
          return;
        }

        if (!this.options.canvasSelector || !this.canvas) {
          console.error('No "canvasSelector" property, or the element is not found');
          return;
        }

        if (this.options.timelineSelector && !this.timeline) {
          console.error('Element for the "timelineSelector" selector not found');
          return;
        }

        if (this.options.timelineSelector && !this.timelinePassed) {
          console.error('Element for the "timelinePassed" not found');
          return;
        }

        if (this.options.audio) {
          if (typeof this.options.audio === 'string') {
            // Use audio selector from options if specified
            this.audio = document.querySelectorAll(this.options.audio)[0];

            if (!this.audio) {
              console.error('Element for the "audio" not found');
              return;
            }
          } else {
            // Creates audio element which uses same video sources
            this.audio = document.createElement('audio');
            this.audio.innerHTML = this.video.innerHTML;
            this.video.parentNode.insertBefore(this.audio, this.video);
            this.audio.load();
          }

          var iOS = /iPad|iPhone|iPod/.test(navigator.platform);

          if (iOS) {
            // Autoplay doesn't work with audio on iOS
            // User have to manually start the audio
            this.options.autoplay = false;
          }
        } // Canvas context


        this.ctx = this.canvas.getContext('2d');
        this.playing = false;
        this.resizeTimeoutReference = false;
        this.RESIZE_TIMEOUT = 1000;
        this.init();
        this.bind();
      };

      CanvasVideoPlayer.prototype.init = function () {
        this.video.load();
        this.setCanvasSize();

        if (this.options.hideVideo) {
          this.video.style.display = 'none';
        }
      }; // Used most of the jQuery code for the .offset() method


      CanvasVideoPlayer.prototype.getOffset = function (elem) {
        var docElem, rect, doc;

        if (!elem) {
          return;
        }

        rect = elem.getBoundingClientRect(); // Make sure element is not hidden (display: none) or disconnected

        if (rect.width || rect.height || elem.getClientRects().length) {
          doc = elem.ownerDocument;
          docElem = doc.documentElement;
          return {
            top: rect.top + window.pageYOffset - docElem.clientTop,
            left: rect.left + window.pageXOffset - docElem.clientLeft
          };
        }
      };

      CanvasVideoPlayer.prototype.jumpTo = function (percentage) {
        this.video.currentTime = this.video.duration * percentage;

        if (this.options.audio) {
          this.audio.currentTime = this.audio.duration * percentage;
        }
      };

      CanvasVideoPlayer.prototype.bind = function () {
        var self = this; // Playes or pauses video on canvas click

        if (this.options.pauseOnClick === true) {
          this.canvas.addEventListener('click', cvpHandlers.canvasClickHandler = function () {
            self.playPause();
          });
        } // On every time update draws frame


        this.video.addEventListener('timeupdate', cvpHandlers.videoTimeUpdateHandler = function () {
          self.drawFrame();

          if (self.options.timelineSelector) {
            self.updateTimeline();
          }
        }); // Draws first frame

        this.video.addEventListener('canplay', cvpHandlers.videoCanPlayHandler = function () {
          self.drawFrame();
        }); // To be sure 'canplay' event that isn't already fired

        if (this.video.readyState >= 2) {
          self.drawFrame();
        }

        if (self.options.autoplay) {
          self.play();
        } // Click on the video seek video


        if (self.options.timelineSelector) {
          this.timeline.addEventListener('click', function (e) {
            var offset = e.clientX - self.getOffset(self.canvas).left;
            var percentage = offset / self.timeline.offsetWidth;
            self.jumpTo(percentage);
          });
        } // Cache canvas size on resize (doing it only once in a second)


        window.addEventListener('resize', cvpHandlers.windowResizeHandler = function () {
          clearTimeout(self.resizeTimeoutReference);
          self.resizeTimeoutReference = setTimeout(function () {
            self.setCanvasSize();
            self.drawFrame();
          }, self.RESIZE_TIMEOUT);
        });

        this.unbind = function () {
          this.canvas.removeEventListener('click', cvpHandlers.canvasClickHandler);
          this.video.removeEventListener('timeupdate', cvpHandlers.videoTimeUpdateHandler);
          this.video.removeEventListener('canplay', cvpHandlers.videoCanPlayHandler);
          window.removeEventListener('resize', cvpHandlers.windowResizeHandler);

          if (this.options.audio) {
            this.audio.parentNode.removeChild(this.audio);
          }
        };
      };

      CanvasVideoPlayer.prototype.updateTimeline = function () {
        var percentage = (this.video.currentTime * 100 / this.video.duration).toFixed(2);
        this.timelinePassed.style.width = percentage + '%';
      };

      CanvasVideoPlayer.prototype.setCanvasSize = function () {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.canvas.setAttribute('width', this.width);
        this.canvas.setAttribute('height', this.height);
      };

      CanvasVideoPlayer.prototype.play = function () {
        this.lastTime = Date.now();
        this.playing = true;
        this.loop();

        if (this.options.audio) {
          // Resync audio and video
          this.audio.currentTime = this.video.currentTime;
          this.audio.play();
        }
      };

      CanvasVideoPlayer.prototype.pause = function () {
        this.playing = false;

        if (this.options.audio) {
          this.audio.pause();
        }
      };

      CanvasVideoPlayer.prototype.playPause = function () {
        if (this.playing) {
          this.pause();
        } else {
          this.play();
        }
      };

      CanvasVideoPlayer.prototype.loop = function () {
        var self = this;
        var time = Date.now();
        var elapsed = (time - this.lastTime) / 1000; // Render

        if (elapsed >= 1 / this.options.framesPerSecond) {
          this.video.currentTime = this.video.currentTime + elapsed;
          this.lastTime = time; // Resync audio and video if they drift more than 300ms apart

          if (this.audio && Math.abs(this.audio.currentTime - this.video.currentTime) > .3) {
            this.audio.currentTime = this.video.currentTime;
          }
        } // If we are at the end of the video stop


        if (this.video.currentTime >= this.video.duration) {
          if (this.options.makeLoop === false) {
            this.playing = false;
          }

          if (this.options.resetOnLastFrame === true) {
            this.video.currentTime = 0;
          }
        }

        if (this.playing) {
          this.animationFrame = requestAnimationFrame(function () {
            self.loop();
          });
        } else {
          cancelAnimationFrame(this.animationFrame);
        }
      };

      CanvasVideoPlayer.prototype.drawFrame = function () {
        this.ctx.drawImage(this.video, 0, 0, this.width, this.height);
      }; // =======================


      let burgerBtns = [...document.querySelectorAll(".burger")];
      let body = document.querySelector("body");
      let html = document.querySelector("html");

      for (const burgerBtn of burgerBtns) {
        burgerBtn.addEventListener("click", function () {
          body.classList.toggle("active");
          html.classList.toggle("active");
        });
      }

      if (document.querySelector('.prise-slider')) {
        new Swiper(".prise-slider", {
          modules: [Navigation, Autoplay],
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          grabCursor: true,
          navigation: {
            nextEl: ".plans-navigation .button-next",
            prevEl: ".plans-navigation .button-prev"
          },
          autoplay: {
            delay: 2500,
            disableOnInteraction: false
          },
          on: {
            init() {
              this.el.addEventListener('mouseenter', () => {
                this.autoplay.stop();
              });
              this.el.addEventListener('mouseleave', () => {
                this.autoplay.start();
              });
            }

          },
          breakpoints: {
            320: {
              slidesPerView: 1.35,
              spaceBetween: 15,
              centeredSlides: true,
              loop: true
            },
            639: {
              slidesPerView: 1,
              spaceBetween: 15,
              centeredSlides: true,
              loop: true
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 15,
              centeredSlides: false,
              loop: true
            },
            1024: {
              slidesPerView: 2,
              spaceBetween: 30,
              centeredSlides: false,
              loop: false
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 30
            }
          }
        });
      }

      if (document.querySelector('.reviews-slider')) {
        new Swiper(".reviews-slider", {
          modules: [Navigation, Autoplay],
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          grabCursor: true,
          navigation: {
            nextEl: ".reviews-navigation .button-next",
            prevEl: ".reviews-navigation .button-prev"
          },
          autoplay: {
            delay: 2500,
            disableOnInteraction: false
          },
          on: {
            init() {
              this.el.addEventListener('mouseenter', () => {
                this.autoplay.stop();
              });
              this.el.addEventListener('mouseleave', () => {
                this.autoplay.start();
              });
            }

          },
          breakpoints: {
            320: {
              slidesPerView: 1.35,
              spaceBetween: 15,
              centeredSlides: true,
              loop: true
            },
            639: {
              slidesPerView: 2,
              spaceBetween: 15,
              centeredSlides: false,
              loop: true
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
              centeredSlides: false,
              loop: false
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 60
            }
          }
        });
      }

      if (document.querySelector('.page-swiper')) {
        let pageSwiper = new Swiper(".page-swiper", {
          modules: [Pagination, Scrollbar, freeMode, Mousewheel],
          wrapperClass: "page__wrapper",
          slideClass: "page__screen",
          direction: 'vertical',
          slidesPerView: 'auto',
          mousewheel: {
            sensitiviti: 1
          },
          init: false,
          watchOverflow: true,
          speed: 800,
          observer: true,
          observeParents: true,
          observeSlideChildren: true,
          on: {
            init: function () {
              setScrollType();
              screenContentPagging();
              hideToTopBtn();
            },
            resize: function () {
              setScrollType();
              screenContentPagging();
              setWidthPage();
            },
            afterInit: function () {
              hideToTopBtn();
            }
          },
          scrollbar: {
            el: '.page__scroll',
            dragClass: 'page__drag-scroll',
            draggable: true
          }
        });
        pageSwiper.init();

        function setScrollType() {
          let wrapper = document.querySelector('.page__wrapper');
          let page = document.querySelector('main.page');

          if (wrapper.classList.contains('_free')) {
            wrapper.classList.remove('_free');
            page.classList.remove('_free');
            pageSwiper.params.freeMode.enabled = false;
          }

          for (let index = 0; index < pageSwiper.slides.length; index++) {
            const pageSlide = pageSwiper.slides[index];
            const pageSlideContent = pageSlide.querySelector('.screen__content');

            if (pageSlideContent) {
              const pageSlideContentHeight = pageSlideContent.offsetHeight;

              if (pageSlideContentHeight > window.innerHeight) {
                wrapper.classList.add('_free');
                page.classList.add('_free');
                pageSwiper.params.freeMode.enabled = true;
                break;
              }
            }

            if (window.innerWidth > 1920) {
              wrapper.classList.add('_free');
              page.classList.add('_free');
              pageSwiper.params.freeMode.enabled = true;
            }
          }
        }

        function setWidthPage() {
          let windowWidth = window.innerWidth;

          if (windowWidth <= 1280) {
            pageSwiper.destroy();
          } else {
            pageSwiper.init();
          }
        }

        function screenContentPagging() {
          let wrapper = document.querySelector('.page__wrapper');
          let header = document.querySelector('header');
          let screenContents = document.querySelectorAll('.screen__content');
          let headerHeight = header.clientHeight;

          for (const screenContent of screenContents) {
            if (!wrapper.classList.contains('_free')) {
              screenContent.style.paddingTop = headerHeight + 'px';
            } else {
              screenContent.style.paddingTop = '0px';
            }
          }
        }

        let toTopPage = document.querySelector('.to-top-page');

        if (toTopPage) {
          toTopPage.addEventListener('click', e => {
            pageSwiper.slideTo(0, 800);

            if (window.innerWidth < 1279) {
              let body = 'body';
              scrollToBlock(e, body);
            }
          });
        }

        function scrollToBlock(e, id) {
          e.preventDefault();
          document.getElementById(id).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }

        pageSwiper.on('slideChange', function () {
          hideToTopBtn();
        });
        window.addEventListener('scroll', e => {
          hideToTopBtn();
        });

        function hideToTopBtn() {
          let activeIndexSlide = pageSwiper.activeIndex;

          if (activeIndexSlide === 0) {
            let toTopPage = document.querySelector('.to-top-page');
            toTopPage.style.display = 'none';
          } else {
            toTopPage.style.display = 'flex';
          }
        }
      }

      var isIOS = /iPad|iPhone|iPod/.test(navigator.platform);
      console.log(isIOS);

      if (isIOS) {
        let videos = document.querySelectorAll('.video');
        videos.forEach(e => {
          console.log('#' + e.getAttribute('id') + ' .video__video');
          new CanvasVideoPlayer({
            videoSelector: '#' + e.getAttribute('id') + ' .video__video',
            canvasSelector: '#' + e.getAttribute('id') + ' .video__canvas',
            timelineSelector: false,
            autoplay: true,
            makeLoop: true,
            pauseOnClick: false,
            audio: false
          });
        });
      } else {
        // Use HTML5 video
        document.querySelectorAll('.video__canvas')[0].style.display = 'none';
      }
    }

}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZSgnbWFpbicsIGZhY3RvcnkpIDpcbiAgICBmYWN0b3J5KCk7XG59KSgoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgICAvKipcbiAgICAgKiBTU1IgV2luZG93IDQuMC4yXG4gICAgICogQmV0dGVyIGhhbmRsaW5nIGZvciB3aW5kb3cgb2JqZWN0IGluIFNTUiBlbnZpcm9ubWVudFxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2xpbWl0czR3ZWIvc3NyLXdpbmRvd1xuICAgICAqXG4gICAgICogQ29weXJpZ2h0IDIwMjEsIFZsYWRpbWlyIEtoYXJsYW1waWRpXG4gICAgICpcbiAgICAgKiBMaWNlbnNlZCB1bmRlciBNSVRcbiAgICAgKlxuICAgICAqIFJlbGVhc2VkIG9uOiBEZWNlbWJlciAxMywgMjAyMVxuICAgICAqL1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tcGFyYW0tcmVhc3NpZ24gKi9cbiAgICBmdW5jdGlvbiBpc09iamVjdCQxKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0JyAmJiAnY29uc3RydWN0b3InIGluIG9iaiAmJiBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRlbmQkMSh0YXJnZXQgPSB7fSwgc3JjID0ge30pIHtcbiAgICAgIE9iamVjdC5rZXlzKHNyYykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIHRhcmdldFtrZXldID09PSAndW5kZWZpbmVkJykgdGFyZ2V0W2tleV0gPSBzcmNba2V5XTtlbHNlIGlmIChpc09iamVjdCQxKHNyY1trZXldKSAmJiBpc09iamVjdCQxKHRhcmdldFtrZXldKSAmJiBPYmplY3Qua2V5cyhzcmNba2V5XSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGV4dGVuZCQxKHRhcmdldFtrZXldLCBzcmNba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNzckRvY3VtZW50ID0ge1xuICAgICAgYm9keToge30sXG5cbiAgICAgIGFkZEV2ZW50TGlzdGVuZXIoKSB7fSxcblxuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcigpIHt9LFxuXG4gICAgICBhY3RpdmVFbGVtZW50OiB7XG4gICAgICAgIGJsdXIoKSB7fSxcblxuICAgICAgICBub2RlTmFtZTogJydcbiAgICAgIH0sXG5cbiAgICAgIHF1ZXJ5U2VsZWN0b3IoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcblxuICAgICAgcXVlcnlTZWxlY3RvckFsbCgpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSxcblxuICAgICAgZ2V0RWxlbWVudEJ5SWQoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSxcblxuICAgICAgY3JlYXRlRXZlbnQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW5pdEV2ZW50KCkge31cblxuICAgICAgICB9O1xuICAgICAgfSxcblxuICAgICAgY3JlYXRlRWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgICAgY2hpbGROb2RlczogW10sXG4gICAgICAgICAgc3R5bGU6IHt9LFxuXG4gICAgICAgICAgc2V0QXR0cmlidXRlKCkge30sXG5cbiAgICAgICAgICBnZXRFbGVtZW50c0J5VGFnTmFtZSgpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfTtcbiAgICAgIH0sXG5cbiAgICAgIGNyZWF0ZUVsZW1lbnROUygpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfSxcblxuICAgICAgaW1wb3J0Tm9kZSgpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9LFxuXG4gICAgICBsb2NhdGlvbjoge1xuICAgICAgICBoYXNoOiAnJyxcbiAgICAgICAgaG9zdDogJycsXG4gICAgICAgIGhvc3RuYW1lOiAnJyxcbiAgICAgICAgaHJlZjogJycsXG4gICAgICAgIG9yaWdpbjogJycsXG4gICAgICAgIHBhdGhuYW1lOiAnJyxcbiAgICAgICAgcHJvdG9jb2w6ICcnLFxuICAgICAgICBzZWFyY2g6ICcnXG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldERvY3VtZW50KCkge1xuICAgICAgY29uc3QgZG9jID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyA/IGRvY3VtZW50IDoge307XG4gICAgICBleHRlbmQkMShkb2MsIHNzckRvY3VtZW50KTtcbiAgICAgIHJldHVybiBkb2M7XG4gICAgfVxuXG4gICAgY29uc3Qgc3NyV2luZG93ID0ge1xuICAgICAgZG9jdW1lbnQ6IHNzckRvY3VtZW50LFxuICAgICAgbmF2aWdhdG9yOiB7XG4gICAgICAgIHVzZXJBZ2VudDogJydcbiAgICAgIH0sXG4gICAgICBsb2NhdGlvbjoge1xuICAgICAgICBoYXNoOiAnJyxcbiAgICAgICAgaG9zdDogJycsXG4gICAgICAgIGhvc3RuYW1lOiAnJyxcbiAgICAgICAgaHJlZjogJycsXG4gICAgICAgIG9yaWdpbjogJycsXG4gICAgICAgIHBhdGhuYW1lOiAnJyxcbiAgICAgICAgcHJvdG9jb2w6ICcnLFxuICAgICAgICBzZWFyY2g6ICcnXG4gICAgICB9LFxuICAgICAgaGlzdG9yeToge1xuICAgICAgICByZXBsYWNlU3RhdGUoKSB7fSxcblxuICAgICAgICBwdXNoU3RhdGUoKSB7fSxcblxuICAgICAgICBnbygpIHt9LFxuXG4gICAgICAgIGJhY2soKSB7fVxuXG4gICAgICB9LFxuICAgICAgQ3VzdG9tRXZlbnQ6IGZ1bmN0aW9uIEN1c3RvbUV2ZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sXG5cbiAgICAgIGFkZEV2ZW50TGlzdGVuZXIoKSB7fSxcblxuICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lcigpIHt9LFxuXG4gICAgICBnZXRDb21wdXRlZFN0eWxlKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGdldFByb3BlcnR5VmFsdWUoKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH07XG4gICAgICB9LFxuXG4gICAgICBJbWFnZSgpIHt9LFxuXG4gICAgICBEYXRlKCkge30sXG5cbiAgICAgIHNjcmVlbjoge30sXG5cbiAgICAgIHNldFRpbWVvdXQoKSB7fSxcblxuICAgICAgY2xlYXJUaW1lb3V0KCkge30sXG5cbiAgICAgIG1hdGNoTWVkaWEoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH0sXG5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcbiAgICAgIH0sXG5cbiAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGlkKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRpbWVvdXQoaWQpO1xuICAgICAgfVxuXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldFdpbmRvdygpIHtcbiAgICAgIGNvbnN0IHdpbiA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge307XG4gICAgICBleHRlbmQkMSh3aW4sIHNzcldpbmRvdyk7XG4gICAgICByZXR1cm4gd2luO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERvbTcgNC4wLjRcbiAgICAgKiBNaW5pbWFsaXN0aWMgSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBET00gbWFuaXB1bGF0aW9uLCB3aXRoIGEgalF1ZXJ5LWNvbXBhdGlibGUgQVBJXG4gICAgICogaHR0cHM6Ly9mcmFtZXdvcms3LmlvL2RvY3MvZG9tNy5odG1sXG4gICAgICpcbiAgICAgKiBDb3B5cmlnaHQgMjAyMiwgVmxhZGltaXIgS2hhcmxhbXBpZGlcbiAgICAgKlxuICAgICAqIExpY2Vuc2VkIHVuZGVyIE1JVFxuICAgICAqXG4gICAgICogUmVsZWFzZWQgb246IEphbnVhcnkgMTEsIDIwMjJcbiAgICAgKi9cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4gICAgZnVuY3Rpb24gbWFrZVJlYWN0aXZlKG9iaikge1xuICAgICAgY29uc3QgcHJvdG8gPSBvYmouX19wcm90b19fO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgJ19fcHJvdG9fXycsIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBwcm90bztcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICBwcm90by5fX3Byb3RvX18gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjbGFzcyBEb203IGV4dGVuZHMgQXJyYXkge1xuICAgICAgY29uc3RydWN0b3IoaXRlbXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtcyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBzdXBlcihpdGVtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VwZXIoLi4uKGl0ZW1zIHx8IFtdKSk7XG4gICAgICAgICAgbWFrZVJlYWN0aXZlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheUZsYXQoYXJyID0gW10pIHtcbiAgICAgIGNvbnN0IHJlcyA9IFtdO1xuICAgICAgYXJyLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShlbCkpIHtcbiAgICAgICAgICByZXMucHVzaCguLi5hcnJheUZsYXQoZWwpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXMucHVzaChlbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheUZpbHRlcihhcnIsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGFyciwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFycmF5VW5pcXVlKGFycikge1xuICAgICAgY29uc3QgdW5pcXVlQXJyYXkgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKHVuaXF1ZUFycmF5LmluZGV4T2YoYXJyW2ldKSA9PT0gLTEpIHVuaXF1ZUFycmF5LnB1c2goYXJyW2ldKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHVuaXF1ZUFycmF5O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gcXNhKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gW3NlbGVjdG9yXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYSA9IFtdO1xuICAgICAgY29uc3QgcmVzID0gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYS5wdXNoKHJlc1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uICQkMShzZWxlY3RvciwgY29udGV4dCkge1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG4gICAgICBsZXQgYXJyID0gW107XG5cbiAgICAgIGlmICghY29udGV4dCAmJiBzZWxlY3RvciBpbnN0YW5jZW9mIERvbTcpIHtcbiAgICAgICAgcmV0dXJuIHNlbGVjdG9yO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgRG9tNyhhcnIpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zdCBodG1sID0gc2VsZWN0b3IudHJpbSgpO1xuXG4gICAgICAgIGlmIChodG1sLmluZGV4T2YoJzwnKSA+PSAwICYmIGh0bWwuaW5kZXhPZignPicpID49IDApIHtcbiAgICAgICAgICBsZXQgdG9DcmVhdGUgPSAnZGl2JztcbiAgICAgICAgICBpZiAoaHRtbC5pbmRleE9mKCc8bGknKSA9PT0gMCkgdG9DcmVhdGUgPSAndWwnO1xuICAgICAgICAgIGlmIChodG1sLmluZGV4T2YoJzx0cicpID09PSAwKSB0b0NyZWF0ZSA9ICd0Ym9keSc7XG4gICAgICAgICAgaWYgKGh0bWwuaW5kZXhPZignPHRkJykgPT09IDAgfHwgaHRtbC5pbmRleE9mKCc8dGgnKSA9PT0gMCkgdG9DcmVhdGUgPSAndHInO1xuICAgICAgICAgIGlmIChodG1sLmluZGV4T2YoJzx0Ym9keScpID09PSAwKSB0b0NyZWF0ZSA9ICd0YWJsZSc7XG4gICAgICAgICAgaWYgKGh0bWwuaW5kZXhPZignPG9wdGlvbicpID09PSAwKSB0b0NyZWF0ZSA9ICdzZWxlY3QnO1xuICAgICAgICAgIGNvbnN0IHRlbXBQYXJlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRvQ3JlYXRlKTtcbiAgICAgICAgICB0ZW1wUGFyZW50LmlubmVySFRNTCA9IGh0bWw7XG5cbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRlbXBQYXJlbnQuY2hpbGROb2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYXJyLnB1c2godGVtcFBhcmVudC5jaGlsZE5vZGVzW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJyID0gcXNhKHNlbGVjdG9yLnRyaW0oKSwgY29udGV4dCB8fCBkb2N1bWVudCk7XG4gICAgICAgIH0gLy8gYXJyID0gcXNhKHNlbGVjdG9yLCBkb2N1bWVudCk7XG5cbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0b3Iubm9kZVR5cGUgfHwgc2VsZWN0b3IgPT09IHdpbmRvdyB8fCBzZWxlY3RvciA9PT0gZG9jdW1lbnQpIHtcbiAgICAgICAgYXJyLnB1c2goc2VsZWN0b3IpO1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdG9yKSkge1xuICAgICAgICBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBEb203KSByZXR1cm4gc2VsZWN0b3I7XG4gICAgICAgIGFyciA9IHNlbGVjdG9yO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IERvbTcoYXJyYXlVbmlxdWUoYXJyKSk7XG4gICAgfVxuXG4gICAgJCQxLmZuID0gRG9tNy5wcm90b3R5cGU7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuXG4gICAgZnVuY3Rpb24gYWRkQ2xhc3MoLi4uY2xhc3Nlcykge1xuICAgICAgY29uc3QgY2xhc3NOYW1lcyA9IGFycmF5RmxhdChjbGFzc2VzLm1hcChjID0+IGMuc3BsaXQoJyAnKSkpO1xuICAgICAgdGhpcy5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCguLi5jbGFzc05hbWVzKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoLi4uY2xhc3Nlcykge1xuICAgICAgY29uc3QgY2xhc3NOYW1lcyA9IGFycmF5RmxhdChjbGFzc2VzLm1hcChjID0+IGMuc3BsaXQoJyAnKSkpO1xuICAgICAgdGhpcy5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSguLi5jbGFzc05hbWVzKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlQ2xhc3MoLi4uY2xhc3Nlcykge1xuICAgICAgY29uc3QgY2xhc3NOYW1lcyA9IGFycmF5RmxhdChjbGFzc2VzLm1hcChjID0+IGMuc3BsaXQoJyAnKSkpO1xuICAgICAgdGhpcy5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgY2xhc3NOYW1lcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiB7XG4gICAgICAgICAgZWwuY2xhc3NMaXN0LnRvZ2dsZShjbGFzc05hbWUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc0NsYXNzKC4uLmNsYXNzZXMpIHtcbiAgICAgIGNvbnN0IGNsYXNzTmFtZXMgPSBhcnJheUZsYXQoY2xhc3Nlcy5tYXAoYyA9PiBjLnNwbGl0KCcgJykpKTtcbiAgICAgIHJldHVybiBhcnJheUZpbHRlcih0aGlzLCBlbCA9PiB7XG4gICAgICAgIHJldHVybiBjbGFzc05hbWVzLmZpbHRlcihjbGFzc05hbWUgPT4gZWwuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpLmxlbmd0aCA+IDA7XG4gICAgICB9KS5sZW5ndGggPiAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGF0dHIoYXR0cnMsIHZhbHVlKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgYXR0cnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIEdldCBhdHRyXG4gICAgICAgIGlmICh0aGlzWzBdKSByZXR1cm4gdGhpc1swXS5nZXRBdHRyaWJ1dGUoYXR0cnMpO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSAvLyBTZXQgYXR0cnNcblxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAvLyBTdHJpbmdcbiAgICAgICAgICB0aGlzW2ldLnNldEF0dHJpYnV0ZShhdHRycywgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE9iamVjdFxuICAgICAgICAgIGZvciAoY29uc3QgYXR0ck5hbWUgaW4gYXR0cnMpIHtcbiAgICAgICAgICAgIHRoaXNbaV1bYXR0ck5hbWVdID0gYXR0cnNbYXR0ck5hbWVdO1xuICAgICAgICAgICAgdGhpc1tpXS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIGF0dHJzW2F0dHJOYW1lXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUF0dHIoYXR0cikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXNbaV0ucmVtb3ZlQXR0cmlidXRlKGF0dHIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpc1tpXS5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zaXRpb24kMShkdXJhdGlvbikge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXNbaV0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gdHlwZW9mIGR1cmF0aW9uICE9PSAnc3RyaW5nJyA/IGAke2R1cmF0aW9ufW1zYCA6IGR1cmF0aW9uO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbiguLi5hcmdzKSB7XG4gICAgICBsZXQgW2V2ZW50VHlwZSwgdGFyZ2V0U2VsZWN0b3IsIGxpc3RlbmVyLCBjYXB0dXJlXSA9IGFyZ3M7XG5cbiAgICAgIGlmICh0eXBlb2YgYXJnc1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBbZXZlbnRUeXBlLCBsaXN0ZW5lciwgY2FwdHVyZV0gPSBhcmdzO1xuICAgICAgICB0YXJnZXRTZWxlY3RvciA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFjYXB0dXJlKSBjYXB0dXJlID0gZmFsc2U7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUxpdmVFdmVudChlKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICBpZiAoIXRhcmdldCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBldmVudERhdGEgPSBlLnRhcmdldC5kb203RXZlbnREYXRhIHx8IFtdO1xuXG4gICAgICAgIGlmIChldmVudERhdGEuaW5kZXhPZihlKSA8IDApIHtcbiAgICAgICAgICBldmVudERhdGEudW5zaGlmdChlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkJDEodGFyZ2V0KS5pcyh0YXJnZXRTZWxlY3RvcikpIGxpc3RlbmVyLmFwcGx5KHRhcmdldCwgZXZlbnREYXRhKTtlbHNlIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnRzID0gJCQxKHRhcmdldCkucGFyZW50cygpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHBhcmVudHMubGVuZ3RoOyBrICs9IDEpIHtcbiAgICAgICAgICAgIGlmICgkJDEocGFyZW50c1trXSkuaXModGFyZ2V0U2VsZWN0b3IpKSBsaXN0ZW5lci5hcHBseShwYXJlbnRzW2tdLCBldmVudERhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFdmVudChlKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IGUgJiYgZS50YXJnZXQgPyBlLnRhcmdldC5kb203RXZlbnREYXRhIHx8IFtdIDogW107XG5cbiAgICAgICAgaWYgKGV2ZW50RGF0YS5pbmRleE9mKGUpIDwgMCkge1xuICAgICAgICAgIGV2ZW50RGF0YS51bnNoaWZ0KGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgZXZlbnREYXRhKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXZlbnRzID0gZXZlbnRUeXBlLnNwbGl0KCcgJyk7XG4gICAgICBsZXQgajtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpc1tpXTtcblxuICAgICAgICBpZiAoIXRhcmdldFNlbGVjdG9yKSB7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGV2ZW50cy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBldmVudHNbal07XG4gICAgICAgICAgICBpZiAoIWVsLmRvbTdMaXN0ZW5lcnMpIGVsLmRvbTdMaXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgICAgIGlmICghZWwuZG9tN0xpc3RlbmVyc1tldmVudF0pIGVsLmRvbTdMaXN0ZW5lcnNbZXZlbnRdID0gW107XG4gICAgICAgICAgICBlbC5kb203TGlzdGVuZXJzW2V2ZW50XS5wdXNoKHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICAgIHByb3h5TGlzdGVuZXI6IGhhbmRsZUV2ZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZUV2ZW50LCBjYXB0dXJlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTGl2ZSBldmVudHNcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZXZlbnRzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgIGlmICghZWwuZG9tN0xpdmVMaXN0ZW5lcnMpIGVsLmRvbTdMaXZlTGlzdGVuZXJzID0ge307XG4gICAgICAgICAgICBpZiAoIWVsLmRvbTdMaXZlTGlzdGVuZXJzW2V2ZW50XSkgZWwuZG9tN0xpdmVMaXN0ZW5lcnNbZXZlbnRdID0gW107XG4gICAgICAgICAgICBlbC5kb203TGl2ZUxpc3RlbmVyc1tldmVudF0ucHVzaCh7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLFxuICAgICAgICAgICAgICBwcm94eUxpc3RlbmVyOiBoYW5kbGVMaXZlRXZlbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlTGl2ZUV2ZW50LCBjYXB0dXJlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb2ZmKC4uLmFyZ3MpIHtcbiAgICAgIGxldCBbZXZlbnRUeXBlLCB0YXJnZXRTZWxlY3RvciwgbGlzdGVuZXIsIGNhcHR1cmVdID0gYXJncztcblxuICAgICAgaWYgKHR5cGVvZiBhcmdzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIFtldmVudFR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlXSA9IGFyZ3M7XG4gICAgICAgIHRhcmdldFNlbGVjdG9yID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWNhcHR1cmUpIGNhcHR1cmUgPSBmYWxzZTtcbiAgICAgIGNvbnN0IGV2ZW50cyA9IGV2ZW50VHlwZS5zcGxpdCgnICcpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBldmVudCA9IGV2ZW50c1tpXTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBlbCA9IHRoaXNbal07XG4gICAgICAgICAgbGV0IGhhbmRsZXJzO1xuXG4gICAgICAgICAgaWYgKCF0YXJnZXRTZWxlY3RvciAmJiBlbC5kb203TGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBoYW5kbGVycyA9IGVsLmRvbTdMaXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0U2VsZWN0b3IgJiYgZWwuZG9tN0xpdmVMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzID0gZWwuZG9tN0xpdmVMaXN0ZW5lcnNbZXZlbnRdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChoYW5kbGVycyAmJiBoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGsgPSBoYW5kbGVycy5sZW5ndGggLSAxOyBrID49IDA7IGsgLT0gMSkge1xuICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnNba107XG5cbiAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyICYmIGhhbmRsZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlci5wcm94eUxpc3RlbmVyLCBjYXB0dXJlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVycy5zcGxpY2UoaywgMSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXIgJiYgaGFuZGxlci5saXN0ZW5lciAmJiBoYW5kbGVyLmxpc3RlbmVyLmRvbTdwcm94eSAmJiBoYW5kbGVyLmxpc3RlbmVyLmRvbTdwcm94eSA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLnByb3h5TGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzLnNwbGljZShrLCAxKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLnByb3h5TGlzdGVuZXIsIGNhcHR1cmUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzLnNwbGljZShrLCAxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmlnZ2VyKC4uLmFyZ3MpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgY29uc3QgZXZlbnRzID0gYXJnc1swXS5zcGxpdCgnICcpO1xuICAgICAgY29uc3QgZXZlbnREYXRhID0gYXJnc1sxXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgY29uc3QgZWwgPSB0aGlzW2pdO1xuXG4gICAgICAgICAgaWYgKHdpbmRvdy5DdXN0b21FdmVudCkge1xuICAgICAgICAgICAgY29uc3QgZXZ0ID0gbmV3IHdpbmRvdy5DdXN0b21FdmVudChldmVudCwge1xuICAgICAgICAgICAgICBkZXRhaWw6IGV2ZW50RGF0YSxcbiAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbC5kb203RXZlbnREYXRhID0gYXJncy5maWx0ZXIoKGRhdGEsIGRhdGFJbmRleCkgPT4gZGF0YUluZGV4ID4gMCk7XG4gICAgICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgICAgICAgICBlbC5kb203RXZlbnREYXRhID0gW107XG4gICAgICAgICAgICBkZWxldGUgZWwuZG9tN0V2ZW50RGF0YTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZCQxKGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBkb20gPSB0aGlzO1xuXG4gICAgICBmdW5jdGlvbiBmaXJlQ2FsbEJhY2soZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQgIT09IHRoaXMpIHJldHVybjtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgZG9tLm9mZigndHJhbnNpdGlvbmVuZCcsIGZpcmVDYWxsQmFjayk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBkb20ub24oJ3RyYW5zaXRpb25lbmQnLCBmaXJlQ2FsbEJhY2spO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvdXRlcldpZHRoKGluY2x1ZGVNYXJnaW5zKSB7XG4gICAgICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChpbmNsdWRlTWFyZ2lucykge1xuICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IHRoaXMuc3R5bGVzKCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXNbMF0ub2Zmc2V0V2lkdGggKyBwYXJzZUZsb2F0KHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKCdtYXJnaW4tcmlnaHQnKSkgKyBwYXJzZUZsb2F0KHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKCdtYXJnaW4tbGVmdCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzWzBdLm9mZnNldFdpZHRoO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvdXRlckhlaWdodChpbmNsdWRlTWFyZ2lucykge1xuICAgICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoaW5jbHVkZU1hcmdpbnMpIHtcbiAgICAgICAgICBjb25zdCBzdHlsZXMgPSB0aGlzLnN0eWxlcygpO1xuICAgICAgICAgIHJldHVybiB0aGlzWzBdLm9mZnNldEhlaWdodCArIHBhcnNlRmxvYXQoc3R5bGVzLmdldFByb3BlcnR5VmFsdWUoJ21hcmdpbi10b3AnKSkgKyBwYXJzZUZsb2F0KHN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKCdtYXJnaW4tYm90dG9tJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXNbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvZmZzZXQoKSB7XG4gICAgICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpc1swXTtcbiAgICAgICAgY29uc3QgYm94ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgICAgICBjb25zdCBjbGllbnRUb3AgPSBlbC5jbGllbnRUb3AgfHwgYm9keS5jbGllbnRUb3AgfHwgMDtcbiAgICAgICAgY29uc3QgY2xpZW50TGVmdCA9IGVsLmNsaWVudExlZnQgfHwgYm9keS5jbGllbnRMZWZ0IHx8IDA7XG4gICAgICAgIGNvbnN0IHNjcm9sbFRvcCA9IGVsID09PSB3aW5kb3cgPyB3aW5kb3cuc2Nyb2xsWSA6IGVsLnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3Qgc2Nyb2xsTGVmdCA9IGVsID09PSB3aW5kb3cgPyB3aW5kb3cuc2Nyb2xsWCA6IGVsLnNjcm9sbExlZnQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdG9wOiBib3gudG9wICsgc2Nyb2xsVG9wIC0gY2xpZW50VG9wLFxuICAgICAgICAgIGxlZnQ6IGJveC5sZWZ0ICsgc2Nyb2xsTGVmdCAtIGNsaWVudExlZnRcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3R5bGVzKCkge1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBpZiAodGhpc1swXSkgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXNbMF0sIG51bGwpO1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNzcyhwcm9wcywgdmFsdWUpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgbGV0IGk7XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvcHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgLy8gLmNzcygnd2lkdGgnKVxuICAgICAgICAgIGlmICh0aGlzWzBdKSByZXR1cm4gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpc1swXSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gLmNzcyh7IHdpZHRoOiAnMTAwcHgnIH0pXG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBwcm9wcykge1xuICAgICAgICAgICAgICB0aGlzW2ldLnN0eWxlW3Byb3BdID0gcHJvcHNbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgJiYgdHlwZW9mIHByb3BzID09PSAnc3RyaW5nJykge1xuICAgICAgICAvLyAuY3NzKCd3aWR0aCcsICcxMDBweCcpXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgdGhpc1tpXS5zdHlsZVtwcm9wc10gPSB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlYWNoKGNhbGxiYWNrKSB7XG4gICAgICBpZiAoIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICAgIHRoaXMuZm9yRWFjaCgoZWwsIGluZGV4KSA9PiB7XG4gICAgICAgIGNhbGxiYWNrLmFwcGx5KGVsLCBbZWwsIGluZGV4XSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbHRlcihjYWxsYmFjaykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXJyYXlGaWx0ZXIodGhpcywgY2FsbGJhY2spO1xuICAgICAgcmV0dXJuICQkMShyZXN1bHQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGh0bWwoaHRtbCkge1xuICAgICAgaWYgKHR5cGVvZiBodG1sID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gdGhpc1swXSA/IHRoaXNbMF0uaW5uZXJIVE1MIDogbnVsbDtcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHRoaXNbaV0uaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGV4dCh0ZXh0KSB7XG4gICAgICBpZiAodHlwZW9mIHRleHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzWzBdID8gdGhpc1swXS50ZXh0Q29udGVudC50cmltKCkgOiBudWxsO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdGhpc1tpXS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzKHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coKTtcbiAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgIGNvbnN0IGVsID0gdGhpc1swXTtcbiAgICAgIGxldCBjb21wYXJlV2l0aDtcbiAgICAgIGxldCBpO1xuICAgICAgaWYgKCFlbCB8fCB0eXBlb2Ygc2VsZWN0b3IgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChlbC5tYXRjaGVzKSByZXR1cm4gZWwubWF0Y2hlcyhzZWxlY3Rvcik7XG4gICAgICAgIGlmIChlbC53ZWJraXRNYXRjaGVzU2VsZWN0b3IpIHJldHVybiBlbC53ZWJraXRNYXRjaGVzU2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZWwubXNNYXRjaGVzU2VsZWN0b3IpIHJldHVybiBlbC5tc01hdGNoZXNTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIGNvbXBhcmVXaXRoID0gJCQxKHNlbGVjdG9yKTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29tcGFyZVdpdGgubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICBpZiAoY29tcGFyZVdpdGhbaV0gPT09IGVsKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGVjdG9yID09PSBkb2N1bWVudCkge1xuICAgICAgICByZXR1cm4gZWwgPT09IGRvY3VtZW50O1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZWN0b3IgPT09IHdpbmRvdykge1xuICAgICAgICByZXR1cm4gZWwgPT09IHdpbmRvdztcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGVjdG9yLm5vZGVUeXBlIHx8IHNlbGVjdG9yIGluc3RhbmNlb2YgRG9tNykge1xuICAgICAgICBjb21wYXJlV2l0aCA9IHNlbGVjdG9yLm5vZGVUeXBlID8gW3NlbGVjdG9yXSA6IHNlbGVjdG9yO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb21wYXJlV2l0aC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGlmIChjb21wYXJlV2l0aFtpXSA9PT0gZWwpIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5kZXgoKSB7XG4gICAgICBsZXQgY2hpbGQgPSB0aGlzWzBdO1xuICAgICAgbGV0IGk7XG5cbiAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICBpID0gMDsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cbiAgICAgICAgd2hpbGUgKChjaGlsZCA9IGNoaWxkLnByZXZpb3VzU2libGluZykgIT09IG51bGwpIHtcbiAgICAgICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IDEpIGkgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVxKGluZGV4KSB7XG4gICAgICBpZiAodHlwZW9mIGluZGV4ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIHRoaXM7XG4gICAgICBjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aDtcblxuICAgICAgaWYgKGluZGV4ID4gbGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gJCQxKFtdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBjb25zdCByZXR1cm5JbmRleCA9IGxlbmd0aCArIGluZGV4O1xuICAgICAgICBpZiAocmV0dXJuSW5kZXggPCAwKSByZXR1cm4gJCQxKFtdKTtcbiAgICAgICAgcmV0dXJuICQkMShbdGhpc1tyZXR1cm5JbmRleF1dKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICQkMShbdGhpc1tpbmRleF1dKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcHBlbmQoLi4uZWxzKSB7XG4gICAgICBsZXQgbmV3Q2hpbGQ7XG4gICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG5cbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgZWxzLmxlbmd0aDsgayArPSAxKSB7XG4gICAgICAgIG5ld0NoaWxkID0gZWxzW2tdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgbmV3Q2hpbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0ZW1wRGl2LmlubmVySFRNTCA9IG5ld0NoaWxkO1xuXG4gICAgICAgICAgICB3aGlsZSAodGVtcERpdi5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgIHRoaXNbaV0uYXBwZW5kQ2hpbGQodGVtcERpdi5maXJzdENoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKG5ld0NoaWxkIGluc3RhbmNlb2YgRG9tNykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuZXdDaGlsZC5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgICB0aGlzW2ldLmFwcGVuZENoaWxkKG5ld0NoaWxkW2pdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpc1tpXS5hcHBlbmRDaGlsZChuZXdDaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByZXBlbmQobmV3Q2hpbGQpIHtcbiAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgIGxldCBpO1xuICAgICAgbGV0IGo7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbmV3Q2hpbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3QgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgIHRlbXBEaXYuaW5uZXJIVE1MID0gbmV3Q2hpbGQ7XG5cbiAgICAgICAgICBmb3IgKGogPSB0ZW1wRGl2LmNoaWxkTm9kZXMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqIC09IDEpIHtcbiAgICAgICAgICAgIHRoaXNbaV0uaW5zZXJ0QmVmb3JlKHRlbXBEaXYuY2hpbGROb2Rlc1tqXSwgdGhpc1tpXS5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobmV3Q2hpbGQgaW5zdGFuY2VvZiBEb203KSB7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IG5ld0NoaWxkLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICB0aGlzW2ldLmluc2VydEJlZm9yZShuZXdDaGlsZFtqXSwgdGhpc1tpXS5jaGlsZE5vZGVzWzBdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpc1tpXS5pbnNlcnRCZWZvcmUobmV3Q2hpbGQsIHRoaXNbaV0uY2hpbGROb2Rlc1swXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dChzZWxlY3Rvcikge1xuICAgICAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICBpZiAodGhpc1swXS5uZXh0RWxlbWVudFNpYmxpbmcgJiYgJCQxKHRoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nKS5pcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHJldHVybiAkJDEoW3RoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuICQkMShbXSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpc1swXS5uZXh0RWxlbWVudFNpYmxpbmcpIHJldHVybiAkJDEoW3RoaXNbMF0ubmV4dEVsZW1lbnRTaWJsaW5nXSk7XG4gICAgICAgIHJldHVybiAkJDEoW10pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJCQxKFtdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBuZXh0QWxsKHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCBuZXh0RWxzID0gW107XG4gICAgICBsZXQgZWwgPSB0aGlzWzBdO1xuICAgICAgaWYgKCFlbCkgcmV0dXJuICQkMShbXSk7XG5cbiAgICAgIHdoaWxlIChlbC5uZXh0RWxlbWVudFNpYmxpbmcpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IGVsLm5leHRFbGVtZW50U2libGluZzsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgIGlmICgkJDEobmV4dCkuaXMoc2VsZWN0b3IpKSBuZXh0RWxzLnB1c2gobmV4dCk7XG4gICAgICAgIH0gZWxzZSBuZXh0RWxzLnB1c2gobmV4dCk7XG5cbiAgICAgICAgZWwgPSBuZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJCQxKG5leHRFbHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByZXYoc2VsZWN0b3IpIHtcbiAgICAgIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzWzBdO1xuXG4gICAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICAgIGlmIChlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nICYmICQkMShlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKS5pcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHJldHVybiAkJDEoW2VsLnByZXZpb3VzRWxlbWVudFNpYmxpbmddKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gJCQxKFtdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSByZXR1cm4gJCQxKFtlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nXSk7XG4gICAgICAgIHJldHVybiAkJDEoW10pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJCQxKFtdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmV2QWxsKHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCBwcmV2RWxzID0gW107XG4gICAgICBsZXQgZWwgPSB0aGlzWzBdO1xuICAgICAgaWYgKCFlbCkgcmV0dXJuICQkMShbXSk7XG5cbiAgICAgIHdoaWxlIChlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgIGNvbnN0IHByZXYgPSBlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgaWYgKCQkMShwcmV2KS5pcyhzZWxlY3RvcikpIHByZXZFbHMucHVzaChwcmV2KTtcbiAgICAgICAgfSBlbHNlIHByZXZFbHMucHVzaChwcmV2KTtcblxuICAgICAgICBlbCA9IHByZXY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAkJDEocHJldkVscyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyZW50KHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCBwYXJlbnRzID0gW107IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmICh0aGlzW2ldLnBhcmVudE5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgICAgIGlmICgkJDEodGhpc1tpXS5wYXJlbnROb2RlKS5pcyhzZWxlY3RvcikpIHBhcmVudHMucHVzaCh0aGlzW2ldLnBhcmVudE5vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJlbnRzLnB1c2godGhpc1tpXS5wYXJlbnROb2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuICQkMShwYXJlbnRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJlbnRzKHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCBwYXJlbnRzID0gW107IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGxldCBwYXJlbnQgPSB0aGlzW2ldLnBhcmVudE5vZGU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICBpZiAoJCQxKHBhcmVudCkuaXMoc2VsZWN0b3IpKSBwYXJlbnRzLnB1c2gocGFyZW50KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFyZW50cy5wdXNoKHBhcmVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuICQkMShwYXJlbnRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbG9zZXN0KHNlbGVjdG9yKSB7XG4gICAgICBsZXQgY2xvc2VzdCA9IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuICQkMShbXSk7XG4gICAgICB9XG5cbiAgICAgIGlmICghY2xvc2VzdC5pcyhzZWxlY3RvcikpIHtcbiAgICAgICAgY2xvc2VzdCA9IGNsb3Nlc3QucGFyZW50cyhzZWxlY3RvcikuZXEoMCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjbG9zZXN0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmQoc2VsZWN0b3IpIHtcbiAgICAgIGNvbnN0IGZvdW5kRWxlbWVudHMgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IGZvdW5kID0gdGhpc1tpXS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGZvdW5kLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgZm91bmRFbGVtZW50cy5wdXNoKGZvdW5kW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gJCQxKGZvdW5kRWxlbWVudHMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoaWxkcmVuKHNlbGVjdG9yKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFtdOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBjaGlsZE5vZGVzID0gdGhpc1tpXS5jaGlsZHJlbjtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNoaWxkTm9kZXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgICBpZiAoIXNlbGVjdG9yIHx8ICQkMShjaGlsZE5vZGVzW2pdKS5pcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2hpbGROb2Rlc1tqXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAkJDEoY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAodGhpc1tpXS5wYXJlbnROb2RlKSB0aGlzW2ldLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpc1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbnN0IE1ldGhvZHMgPSB7XG4gICAgICBhZGRDbGFzcyxcbiAgICAgIHJlbW92ZUNsYXNzLFxuICAgICAgaGFzQ2xhc3MsXG4gICAgICB0b2dnbGVDbGFzcyxcbiAgICAgIGF0dHIsXG4gICAgICByZW1vdmVBdHRyLFxuICAgICAgdHJhbnNmb3JtLFxuICAgICAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbiQxLFxuICAgICAgb24sXG4gICAgICBvZmYsXG4gICAgICB0cmlnZ2VyLFxuICAgICAgdHJhbnNpdGlvbkVuZDogdHJhbnNpdGlvbkVuZCQxLFxuICAgICAgb3V0ZXJXaWR0aCxcbiAgICAgIG91dGVySGVpZ2h0LFxuICAgICAgc3R5bGVzLFxuICAgICAgb2Zmc2V0LFxuICAgICAgY3NzLFxuICAgICAgZWFjaCxcbiAgICAgIGh0bWwsXG4gICAgICB0ZXh0LFxuICAgICAgaXMsXG4gICAgICBpbmRleCxcbiAgICAgIGVxLFxuICAgICAgYXBwZW5kLFxuICAgICAgcHJlcGVuZCxcbiAgICAgIG5leHQsXG4gICAgICBuZXh0QWxsLFxuICAgICAgcHJldixcbiAgICAgIHByZXZBbGwsXG4gICAgICBwYXJlbnQsXG4gICAgICBwYXJlbnRzLFxuICAgICAgY2xvc2VzdCxcbiAgICAgIGZpbmQsXG4gICAgICBjaGlsZHJlbixcbiAgICAgIGZpbHRlcixcbiAgICAgIHJlbW92ZVxuICAgIH07XG4gICAgT2JqZWN0LmtleXMoTWV0aG9kcykuZm9yRWFjaChtZXRob2ROYW1lID0+IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkJDEuZm4sIG1ldGhvZE5hbWUsIHtcbiAgICAgICAgdmFsdWU6IE1ldGhvZHNbbWV0aG9kTmFtZV0sXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGRlbGV0ZVByb3BzKG9iaikge1xuICAgICAgY29uc3Qgb2JqZWN0ID0gb2JqO1xuICAgICAgT2JqZWN0LmtleXMob2JqZWN0KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgb2JqZWN0W2tleV0gPSBudWxsO1xuICAgICAgICB9IGNhdGNoIChlKSB7Ly8gbm8gZ2V0dGVyIGZvciBvYmplY3RcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGVsZXRlIG9iamVjdFtrZXldO1xuICAgICAgICB9IGNhdGNoIChlKSB7Ly8gc29tZXRoaW5nIGdvdCB3cm9uZ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBuZXh0VGljayhjYWxsYmFjaywgZGVsYXkpIHtcbiAgICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGRlbGF5ID0gMDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoY2FsbGJhY2ssIGRlbGF5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3coKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDb21wdXRlZFN0eWxlJDEoZWwpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgbGV0IHN0eWxlO1xuXG4gICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghc3R5bGUgJiYgZWwuY3VycmVudFN0eWxlKSB7XG4gICAgICAgIHN0eWxlID0gZWwuY3VycmVudFN0eWxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXN0eWxlKSB7XG4gICAgICAgIHN0eWxlID0gZWwuc3R5bGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdHlsZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUcmFuc2xhdGUoZWwsIGF4aXMpIHtcbiAgICAgIGlmIChheGlzID09PSB2b2lkIDApIHtcbiAgICAgICAgYXhpcyA9ICd4JztcbiAgICAgIH1cblxuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBsZXQgbWF0cml4O1xuICAgICAgbGV0IGN1clRyYW5zZm9ybTtcbiAgICAgIGxldCB0cmFuc2Zvcm1NYXRyaXg7XG4gICAgICBjb25zdCBjdXJTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUkMShlbCk7XG5cbiAgICAgIGlmICh3aW5kb3cuV2ViS2l0Q1NTTWF0cml4KSB7XG4gICAgICAgIGN1clRyYW5zZm9ybSA9IGN1clN0eWxlLnRyYW5zZm9ybSB8fCBjdXJTdHlsZS53ZWJraXRUcmFuc2Zvcm07XG5cbiAgICAgICAgaWYgKGN1clRyYW5zZm9ybS5zcGxpdCgnLCcpLmxlbmd0aCA+IDYpIHtcbiAgICAgICAgICBjdXJUcmFuc2Zvcm0gPSBjdXJUcmFuc2Zvcm0uc3BsaXQoJywgJykubWFwKGEgPT4gYS5yZXBsYWNlKCcsJywgJy4nKSkuam9pbignLCAnKTtcbiAgICAgICAgfSAvLyBTb21lIG9sZCB2ZXJzaW9ucyBvZiBXZWJraXQgY2hva2Ugd2hlbiAnbm9uZScgaXMgcGFzc2VkOyBwYXNzXG4gICAgICAgIC8vIGVtcHR5IHN0cmluZyBpbnN0ZWFkIGluIHRoaXMgY2FzZVxuXG5cbiAgICAgICAgdHJhbnNmb3JtTWF0cml4ID0gbmV3IHdpbmRvdy5XZWJLaXRDU1NNYXRyaXgoY3VyVHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IGN1clRyYW5zZm9ybSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cmFuc2Zvcm1NYXRyaXggPSBjdXJTdHlsZS5Nb3pUcmFuc2Zvcm0gfHwgY3VyU3R5bGUuT1RyYW5zZm9ybSB8fCBjdXJTdHlsZS5Nc1RyYW5zZm9ybSB8fCBjdXJTdHlsZS5tc1RyYW5zZm9ybSB8fCBjdXJTdHlsZS50cmFuc2Zvcm0gfHwgY3VyU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgndHJhbnNmb3JtJykucmVwbGFjZSgndHJhbnNsYXRlKCcsICdtYXRyaXgoMSwgMCwgMCwgMSwnKTtcbiAgICAgICAgbWF0cml4ID0gdHJhbnNmb3JtTWF0cml4LnRvU3RyaW5nKCkuc3BsaXQoJywnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGF4aXMgPT09ICd4Jykge1xuICAgICAgICAvLyBMYXRlc3QgQ2hyb21lIGFuZCB3ZWJraXRzIEZpeFxuICAgICAgICBpZiAod2luZG93LldlYktpdENTU01hdHJpeCkgY3VyVHJhbnNmb3JtID0gdHJhbnNmb3JtTWF0cml4Lm00MTsgLy8gQ3JhenkgSUUxMCBNYXRyaXhcbiAgICAgICAgZWxzZSBpZiAobWF0cml4Lmxlbmd0aCA9PT0gMTYpIGN1clRyYW5zZm9ybSA9IHBhcnNlRmxvYXQobWF0cml4WzEyXSk7IC8vIE5vcm1hbCBCcm93c2Vyc1xuICAgICAgICBlbHNlIGN1clRyYW5zZm9ybSA9IHBhcnNlRmxvYXQobWF0cml4WzRdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGF4aXMgPT09ICd5Jykge1xuICAgICAgICAvLyBMYXRlc3QgQ2hyb21lIGFuZCB3ZWJraXRzIEZpeFxuICAgICAgICBpZiAod2luZG93LldlYktpdENTU01hdHJpeCkgY3VyVHJhbnNmb3JtID0gdHJhbnNmb3JtTWF0cml4Lm00MjsgLy8gQ3JhenkgSUUxMCBNYXRyaXhcbiAgICAgICAgZWxzZSBpZiAobWF0cml4Lmxlbmd0aCA9PT0gMTYpIGN1clRyYW5zZm9ybSA9IHBhcnNlRmxvYXQobWF0cml4WzEzXSk7IC8vIE5vcm1hbCBCcm93c2Vyc1xuICAgICAgICBlbHNlIGN1clRyYW5zZm9ybSA9IHBhcnNlRmxvYXQobWF0cml4WzVdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGN1clRyYW5zZm9ybSB8fCAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzT2JqZWN0KG8pIHtcbiAgICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCcgJiYgbyAhPT0gbnVsbCAmJiBvLmNvbnN0cnVjdG9yICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSkgPT09ICdPYmplY3QnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzTm9kZShub2RlKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LkhUTUxFbGVtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZSAmJiAobm9kZS5ub2RlVHlwZSA9PT0gMSB8fCBub2RlLm5vZGVUeXBlID09PSAxMSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0ZW5kKCkge1xuICAgICAgY29uc3QgdG8gPSBPYmplY3QoYXJndW1lbnRzLmxlbmd0aCA8PSAwID8gdW5kZWZpbmVkIDogYXJndW1lbnRzWzBdKTtcbiAgICAgIGNvbnN0IG5vRXh0ZW5kID0gWydfX3Byb3RvX18nLCAnY29uc3RydWN0b3InLCAncHJvdG90eXBlJ107XG5cbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG5leHRTb3VyY2UgPSBpIDwgMCB8fCBhcmd1bWVudHMubGVuZ3RoIDw9IGkgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgaWYgKG5leHRTb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBuZXh0U291cmNlICE9PSBudWxsICYmICFpc05vZGUobmV4dFNvdXJjZSkpIHtcbiAgICAgICAgICBjb25zdCBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpLmZpbHRlcihrZXkgPT4gbm9FeHRlbmQuaW5kZXhPZihrZXkpIDwgMCk7XG5cbiAgICAgICAgICBmb3IgKGxldCBuZXh0SW5kZXggPSAwLCBsZW4gPSBrZXlzQXJyYXkubGVuZ3RoOyBuZXh0SW5kZXggPCBsZW47IG5leHRJbmRleCArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBuZXh0S2V5ID0ga2V5c0FycmF5W25leHRJbmRleF07XG4gICAgICAgICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuZXh0U291cmNlLCBuZXh0S2V5KTtcblxuICAgICAgICAgICAgaWYgKGRlc2MgIT09IHVuZGVmaW5lZCAmJiBkZXNjLmVudW1lcmFibGUpIHtcbiAgICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHRvW25leHRLZXldKSAmJiBpc09iamVjdChuZXh0U291cmNlW25leHRLZXldKSkge1xuICAgICAgICAgICAgICAgIGlmIChuZXh0U291cmNlW25leHRLZXldLl9fc3dpcGVyX18pIHtcbiAgICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgZXh0ZW5kKHRvW25leHRLZXldLCBuZXh0U291cmNlW25leHRLZXldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzT2JqZWN0KHRvW25leHRLZXldKSAmJiBpc09iamVjdChuZXh0U291cmNlW25leHRLZXldKSkge1xuICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0ge307XG5cbiAgICAgICAgICAgICAgICBpZiAobmV4dFNvdXJjZVtuZXh0S2V5XS5fX3N3aXBlcl9fKSB7XG4gICAgICAgICAgICAgICAgICB0b1tuZXh0S2V5XSA9IG5leHRTb3VyY2VbbmV4dEtleV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGV4dGVuZCh0b1tuZXh0S2V5XSwgbmV4dFNvdXJjZVtuZXh0S2V5XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdG87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0Q1NTUHJvcGVydHkoZWwsIHZhck5hbWUsIHZhclZhbHVlKSB7XG4gICAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eSh2YXJOYW1lLCB2YXJWYWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYW5pbWF0ZUNTU01vZGVTY3JvbGwoX3JlZikge1xuICAgICAgbGV0IHtcbiAgICAgICAgc3dpcGVyLFxuICAgICAgICB0YXJnZXRQb3NpdGlvbixcbiAgICAgICAgc2lkZVxuICAgICAgfSA9IF9yZWY7XG4gICAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coKTtcbiAgICAgIGNvbnN0IHN0YXJ0UG9zaXRpb24gPSAtc3dpcGVyLnRyYW5zbGF0ZTtcbiAgICAgIGxldCBzdGFydFRpbWUgPSBudWxsO1xuICAgICAgbGV0IHRpbWU7XG4gICAgICBjb25zdCBkdXJhdGlvbiA9IHN3aXBlci5wYXJhbXMuc3BlZWQ7XG4gICAgICBzd2lwZXIud3JhcHBlckVsLnN0eWxlLnNjcm9sbFNuYXBUeXBlID0gJ25vbmUnO1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHN3aXBlci5jc3NNb2RlRnJhbWVJRCk7XG4gICAgICBjb25zdCBkaXIgPSB0YXJnZXRQb3NpdGlvbiA+IHN0YXJ0UG9zaXRpb24gPyAnbmV4dCcgOiAncHJldic7XG5cbiAgICAgIGNvbnN0IGlzT3V0T2ZCb3VuZCA9IChjdXJyZW50LCB0YXJnZXQpID0+IHtcbiAgICAgICAgcmV0dXJuIGRpciA9PT0gJ25leHQnICYmIGN1cnJlbnQgPj0gdGFyZ2V0IHx8IGRpciA9PT0gJ3ByZXYnICYmIGN1cnJlbnQgPD0gdGFyZ2V0O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgYW5pbWF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgIGlmIChzdGFydFRpbWUgPT09IG51bGwpIHtcbiAgICAgICAgICBzdGFydFRpbWUgPSB0aW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBNYXRoLm1heChNYXRoLm1pbigodGltZSAtIHN0YXJ0VGltZSkgLyBkdXJhdGlvbiwgMSksIDApO1xuICAgICAgICBjb25zdCBlYXNlUHJvZ3Jlc3MgPSAwLjUgLSBNYXRoLmNvcyhwcm9ncmVzcyAqIE1hdGguUEkpIC8gMjtcbiAgICAgICAgbGV0IGN1cnJlbnRQb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb24gKyBlYXNlUHJvZ3Jlc3MgKiAodGFyZ2V0UG9zaXRpb24gLSBzdGFydFBvc2l0aW9uKTtcblxuICAgICAgICBpZiAoaXNPdXRPZkJvdW5kKGN1cnJlbnRQb3NpdGlvbiwgdGFyZ2V0UG9zaXRpb24pKSB7XG4gICAgICAgICAgY3VycmVudFBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIud3JhcHBlckVsLnNjcm9sbFRvKHtcbiAgICAgICAgICBbc2lkZV06IGN1cnJlbnRQb3NpdGlvblxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoaXNPdXRPZkJvdW5kKGN1cnJlbnRQb3NpdGlvbiwgdGFyZ2V0UG9zaXRpb24pKSB7XG4gICAgICAgICAgc3dpcGVyLndyYXBwZXJFbC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgICAgICAgIHN3aXBlci53cmFwcGVyRWwuc3R5bGUuc2Nyb2xsU25hcFR5cGUgPSAnJztcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHN3aXBlci53cmFwcGVyRWwuc3R5bGUub3ZlcmZsb3cgPSAnJztcbiAgICAgICAgICAgIHN3aXBlci53cmFwcGVyRWwuc2Nyb2xsVG8oe1xuICAgICAgICAgICAgICBbc2lkZV06IGN1cnJlbnRQb3NpdGlvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHN3aXBlci5jc3NNb2RlRnJhbWVJRCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLmNzc01vZGVGcmFtZUlEID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICAgIH07XG5cbiAgICAgIGFuaW1hdGUoKTtcbiAgICB9XG5cbiAgICBsZXQgc3VwcG9ydDtcblxuICAgIGZ1bmN0aW9uIGNhbGNTdXBwb3J0KCkge1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzbW9vdGhTY3JvbGw6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnc2Nyb2xsQmVoYXZpb3InIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSxcbiAgICAgICAgdG91Y2g6ICEhKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyB8fCB3aW5kb3cuRG9jdW1lbnRUb3VjaCAmJiBkb2N1bWVudCBpbnN0YW5jZW9mIHdpbmRvdy5Eb2N1bWVudFRvdWNoKSxcbiAgICAgICAgcGFzc2l2ZUxpc3RlbmVyOiBmdW5jdGlvbiBjaGVja1Bhc3NpdmVMaXN0ZW5lcigpIHtcbiAgICAgICAgICBsZXQgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG4gICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0UGFzc2l2ZUxpc3RlbmVyJywgbnVsbCwgb3B0cyk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkgey8vIE5vIHN1cHBvcnRcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gc3VwcG9ydHNQYXNzaXZlO1xuICAgICAgICB9KCksXG4gICAgICAgIGdlc3R1cmVzOiBmdW5jdGlvbiBjaGVja0dlc3R1cmVzKCkge1xuICAgICAgICAgIHJldHVybiAnb25nZXN0dXJlc3RhcnQnIGluIHdpbmRvdztcbiAgICAgICAgfSgpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFN1cHBvcnQoKSB7XG4gICAgICBpZiAoIXN1cHBvcnQpIHtcbiAgICAgICAgc3VwcG9ydCA9IGNhbGNTdXBwb3J0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdXBwb3J0O1xuICAgIH1cblxuICAgIGxldCBkZXZpY2VDYWNoZWQ7XG5cbiAgICBmdW5jdGlvbiBjYWxjRGV2aWNlKF90ZW1wKSB7XG4gICAgICBsZXQge1xuICAgICAgICB1c2VyQWdlbnRcbiAgICAgIH0gPSBfdGVtcCA9PT0gdm9pZCAwID8ge30gOiBfdGVtcDtcbiAgICAgIGNvbnN0IHN1cHBvcnQgPSBnZXRTdXBwb3J0KCk7XG4gICAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coKTtcbiAgICAgIGNvbnN0IHBsYXRmb3JtID0gd2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybTtcbiAgICAgIGNvbnN0IHVhID0gdXNlckFnZW50IHx8IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50O1xuICAgICAgY29uc3QgZGV2aWNlID0ge1xuICAgICAgICBpb3M6IGZhbHNlLFxuICAgICAgICBhbmRyb2lkOiBmYWxzZVxuICAgICAgfTtcbiAgICAgIGNvbnN0IHNjcmVlbldpZHRoID0gd2luZG93LnNjcmVlbi53aWR0aDtcbiAgICAgIGNvbnN0IHNjcmVlbkhlaWdodCA9IHdpbmRvdy5zY3JlZW4uaGVpZ2h0O1xuICAgICAgY29uc3QgYW5kcm9pZCA9IHVhLm1hdGNoKC8oQW5kcm9pZCk7P1tcXHNcXC9dKyhbXFxkLl0rKT8vKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgICBsZXQgaXBhZCA9IHVhLm1hdGNoKC8oaVBhZCkuKk9TXFxzKFtcXGRfXSspLyk7XG4gICAgICBjb25zdCBpcG9kID0gdWEubWF0Y2goLyhpUG9kKSguKk9TXFxzKFtcXGRfXSspKT8vKTtcbiAgICAgIGNvbnN0IGlwaG9uZSA9ICFpcGFkICYmIHVhLm1hdGNoKC8oaVBob25lXFxzT1N8aU9TKVxccyhbXFxkX10rKS8pO1xuICAgICAgY29uc3Qgd2luZG93cyA9IHBsYXRmb3JtID09PSAnV2luMzInO1xuICAgICAgbGV0IG1hY29zID0gcGxhdGZvcm0gPT09ICdNYWNJbnRlbCc7IC8vIGlQYWRPcyAxMyBmaXhcblxuICAgICAgY29uc3QgaVBhZFNjcmVlbnMgPSBbJzEwMjR4MTM2NicsICcxMzY2eDEwMjQnLCAnODM0eDExOTQnLCAnMTE5NHg4MzQnLCAnODM0eDExMTInLCAnMTExMng4MzQnLCAnNzY4eDEwMjQnLCAnMTAyNHg3NjgnLCAnODIweDExODAnLCAnMTE4MHg4MjAnLCAnODEweDEwODAnLCAnMTA4MHg4MTAnXTtcblxuICAgICAgaWYgKCFpcGFkICYmIG1hY29zICYmIHN1cHBvcnQudG91Y2ggJiYgaVBhZFNjcmVlbnMuaW5kZXhPZihgJHtzY3JlZW5XaWR0aH14JHtzY3JlZW5IZWlnaHR9YCkgPj0gMCkge1xuICAgICAgICBpcGFkID0gdWEubWF0Y2goLyhWZXJzaW9uKVxcLyhbXFxkLl0rKS8pO1xuICAgICAgICBpZiAoIWlwYWQpIGlwYWQgPSBbMCwgMSwgJzEzXzBfMCddO1xuICAgICAgICBtYWNvcyA9IGZhbHNlO1xuICAgICAgfSAvLyBBbmRyb2lkXG5cblxuICAgICAgaWYgKGFuZHJvaWQgJiYgIXdpbmRvd3MpIHtcbiAgICAgICAgZGV2aWNlLm9zID0gJ2FuZHJvaWQnO1xuICAgICAgICBkZXZpY2UuYW5kcm9pZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChpcGFkIHx8IGlwaG9uZSB8fCBpcG9kKSB7XG4gICAgICAgIGRldmljZS5vcyA9ICdpb3MnO1xuICAgICAgICBkZXZpY2UuaW9zID0gdHJ1ZTtcbiAgICAgIH0gLy8gRXhwb3J0IG9iamVjdFxuXG5cbiAgICAgIHJldHVybiBkZXZpY2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0RGV2aWNlKG92ZXJyaWRlcykge1xuICAgICAgaWYgKG92ZXJyaWRlcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIG92ZXJyaWRlcyA9IHt9O1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRldmljZUNhY2hlZCkge1xuICAgICAgICBkZXZpY2VDYWNoZWQgPSBjYWxjRGV2aWNlKG92ZXJyaWRlcyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZXZpY2VDYWNoZWQ7XG4gICAgfVxuXG4gICAgbGV0IGJyb3dzZXI7XG5cbiAgICBmdW5jdGlvbiBjYWxjQnJvd3NlcigpIHtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuXG4gICAgICBmdW5jdGlvbiBpc1NhZmFyaSgpIHtcbiAgICAgICAgY29uc3QgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gdWEuaW5kZXhPZignc2FmYXJpJykgPj0gMCAmJiB1YS5pbmRleE9mKCdjaHJvbWUnKSA8IDAgJiYgdWEuaW5kZXhPZignYW5kcm9pZCcpIDwgMDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXNTYWZhcmk6IGlzU2FmYXJpKCksXG4gICAgICAgIGlzV2ViVmlldzogLyhpUGhvbmV8aVBvZHxpUGFkKS4qQXBwbGVXZWJLaXQoPyEuKlNhZmFyaSkvaS50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCcm93c2VyKCkge1xuICAgICAgaWYgKCFicm93c2VyKSB7XG4gICAgICAgIGJyb3dzZXIgPSBjYWxjQnJvd3NlcigpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYnJvd3NlcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBSZXNpemUoX3JlZikge1xuICAgICAgbGV0IHtcbiAgICAgICAgc3dpcGVyLFxuICAgICAgICBvbixcbiAgICAgICAgZW1pdFxuICAgICAgfSA9IF9yZWY7XG4gICAgICBjb25zdCB3aW5kb3cgPSBnZXRXaW5kb3coKTtcbiAgICAgIGxldCBvYnNlcnZlciA9IG51bGw7XG4gICAgICBsZXQgYW5pbWF0aW9uRnJhbWUgPSBudWxsO1xuXG4gICAgICBjb25zdCByZXNpemVIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkIHx8ICFzd2lwZXIuaW5pdGlhbGl6ZWQpIHJldHVybjtcbiAgICAgICAgZW1pdCgnYmVmb3JlUmVzaXplJyk7XG4gICAgICAgIGVtaXQoJ3Jlc2l6ZScpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgY3JlYXRlT2JzZXJ2ZXIgPSAoKSA9PiB7XG4gICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQgfHwgIXN3aXBlci5pbml0aWFsaXplZCkgcmV0dXJuO1xuICAgICAgICBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihlbnRyaWVzID0+IHtcbiAgICAgICAgICBhbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgaGVpZ2h0XG4gICAgICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICAgICAgbGV0IG5ld1dpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBsZXQgbmV3SGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgZW50cmllcy5mb3JFYWNoKF9yZWYyID0+IHtcbiAgICAgICAgICAgICAgbGV0IHtcbiAgICAgICAgICAgICAgICBjb250ZW50Qm94U2l6ZSxcbiAgICAgICAgICAgICAgICBjb250ZW50UmVjdCxcbiAgICAgICAgICAgICAgICB0YXJnZXRcbiAgICAgICAgICAgICAgfSA9IF9yZWYyO1xuICAgICAgICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldCAhPT0gc3dpcGVyLmVsKSByZXR1cm47XG4gICAgICAgICAgICAgIG5ld1dpZHRoID0gY29udGVudFJlY3QgPyBjb250ZW50UmVjdC53aWR0aCA6IChjb250ZW50Qm94U2l6ZVswXSB8fCBjb250ZW50Qm94U2l6ZSkuaW5saW5lU2l6ZTtcbiAgICAgICAgICAgICAgbmV3SGVpZ2h0ID0gY29udGVudFJlY3QgPyBjb250ZW50UmVjdC5oZWlnaHQgOiAoY29udGVudEJveFNpemVbMF0gfHwgY29udGVudEJveFNpemUpLmJsb2NrU2l6ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAobmV3V2lkdGggIT09IHdpZHRoIHx8IG5ld0hlaWdodCAhPT0gaGVpZ2h0KSB7XG4gICAgICAgICAgICAgIHJlc2l6ZUhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoc3dpcGVyLmVsKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlbW92ZU9ic2VydmVyID0gKCkgPT4ge1xuICAgICAgICBpZiAoYW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uRnJhbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9ic2VydmVyICYmIG9ic2VydmVyLnVub2JzZXJ2ZSAmJiBzd2lwZXIuZWwpIHtcbiAgICAgICAgICBvYnNlcnZlci51bm9ic2VydmUoc3dpcGVyLmVsKTtcbiAgICAgICAgICBvYnNlcnZlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IG9yaWVudGF0aW9uQ2hhbmdlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCB8fCAhc3dpcGVyLmluaXRpYWxpemVkKSByZXR1cm47XG4gICAgICAgIGVtaXQoJ29yaWVudGF0aW9uY2hhbmdlJyk7XG4gICAgICB9O1xuXG4gICAgICBvbignaW5pdCcsICgpID0+IHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMucmVzaXplT2JzZXJ2ZXIgJiYgdHlwZW9mIHdpbmRvdy5SZXNpemVPYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjcmVhdGVPYnNlcnZlcigpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemVIYW5kbGVyKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgb3JpZW50YXRpb25DaGFuZ2VIYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ2Rlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIHJlbW92ZU9ic2VydmVyKCk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemVIYW5kbGVyKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgb3JpZW50YXRpb25DaGFuZ2VIYW5kbGVyKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIE9ic2VydmVyKF9yZWYpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgZXh0ZW5kUGFyYW1zLFxuICAgICAgICBvbixcbiAgICAgICAgZW1pdFxuICAgICAgfSA9IF9yZWY7XG4gICAgICBjb25zdCBvYnNlcnZlcnMgPSBbXTtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuXG4gICAgICBjb25zdCBhdHRhY2ggPSBmdW5jdGlvbiAodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBPYnNlcnZlckZ1bmMgPSB3aW5kb3cuTXV0YXRpb25PYnNlcnZlciB8fCB3aW5kb3cuV2Via2l0TXV0YXRpb25PYnNlcnZlcjtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgT2JzZXJ2ZXJGdW5jKG11dGF0aW9ucyA9PiB7XG4gICAgICAgICAgLy8gVGhlIG9ic2VydmVyVXBkYXRlIGV2ZW50IHNob3VsZCBvbmx5IGJlIHRyaWdnZXJlZFxuICAgICAgICAgIC8vIG9uY2UgZGVzcGl0ZSB0aGUgbnVtYmVyIG9mIG11dGF0aW9ucy4gIEFkZGl0aW9uYWxcbiAgICAgICAgICAvLyB0cmlnZ2VycyBhcmUgcmVkdW5kYW50IGFuZCBhcmUgdmVyeSBjb3N0bHlcbiAgICAgICAgICBpZiAobXV0YXRpb25zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgZW1pdCgnb2JzZXJ2ZXJVcGRhdGUnLCBtdXRhdGlvbnNbMF0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IG9ic2VydmVyVXBkYXRlID0gZnVuY3Rpb24gb2JzZXJ2ZXJVcGRhdGUoKSB7XG4gICAgICAgICAgICBlbWl0KCdvYnNlcnZlclVwZGF0ZScsIG11dGF0aW9uc1swXSk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmICh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG9ic2VydmVyVXBkYXRlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQob2JzZXJ2ZXJVcGRhdGUsIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUodGFyZ2V0LCB7XG4gICAgICAgICAgYXR0cmlidXRlczogdHlwZW9mIG9wdGlvbnMuYXR0cmlidXRlcyA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogb3B0aW9ucy5hdHRyaWJ1dGVzLFxuICAgICAgICAgIGNoaWxkTGlzdDogdHlwZW9mIG9wdGlvbnMuY2hpbGRMaXN0ID09PSAndW5kZWZpbmVkJyA/IHRydWUgOiBvcHRpb25zLmNoaWxkTGlzdCxcbiAgICAgICAgICBjaGFyYWN0ZXJEYXRhOiB0eXBlb2Ygb3B0aW9ucy5jaGFyYWN0ZXJEYXRhID09PSAndW5kZWZpbmVkJyA/IHRydWUgOiBvcHRpb25zLmNoYXJhY3RlckRhdGFcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVycy5wdXNoKG9ic2VydmVyKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGluaXQgPSAoKSA9PiB7XG4gICAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5vYnNlcnZlcikgcmV0dXJuO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLm9ic2VydmVQYXJlbnRzKSB7XG4gICAgICAgICAgY29uc3QgY29udGFpbmVyUGFyZW50cyA9IHN3aXBlci4kZWwucGFyZW50cygpO1xuXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250YWluZXJQYXJlbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBhdHRhY2goY29udGFpbmVyUGFyZW50c1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IC8vIE9ic2VydmUgY29udGFpbmVyXG5cblxuICAgICAgICBhdHRhY2goc3dpcGVyLiRlbFswXSwge1xuICAgICAgICAgIGNoaWxkTGlzdDogc3dpcGVyLnBhcmFtcy5vYnNlcnZlU2xpZGVDaGlsZHJlblxuICAgICAgICB9KTsgLy8gT2JzZXJ2ZSB3cmFwcGVyXG5cbiAgICAgICAgYXR0YWNoKHN3aXBlci4kd3JhcHBlckVsWzBdLCB7XG4gICAgICAgICAgYXR0cmlidXRlczogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBkZXN0cm95ID0gKCkgPT4ge1xuICAgICAgICBvYnNlcnZlcnMuZm9yRWFjaChvYnNlcnZlciA9PiB7XG4gICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXJzLnNwbGljZSgwLCBvYnNlcnZlcnMubGVuZ3RoKTtcbiAgICAgIH07XG5cbiAgICAgIGV4dGVuZFBhcmFtcyh7XG4gICAgICAgIG9ic2VydmVyOiBmYWxzZSxcbiAgICAgICAgb2JzZXJ2ZVBhcmVudHM6IGZhbHNlLFxuICAgICAgICBvYnNlcnZlU2xpZGVDaGlsZHJlbjogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgb24oJ2luaXQnLCBpbml0KTtcbiAgICAgIG9uKCdkZXN0cm95JywgZGVzdHJveSk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZXJzY29yZS1kYW5nbGUgKi9cbiAgICB2YXIgZXZlbnRzRW1pdHRlciA9IHtcbiAgICAgIG9uKGV2ZW50cywgaGFuZGxlciwgcHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5ldmVudHNMaXN0ZW5lcnMgfHwgc2VsZi5kZXN0cm95ZWQpIHJldHVybiBzZWxmO1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHJldHVybiBzZWxmO1xuICAgICAgICBjb25zdCBtZXRob2QgPSBwcmlvcml0eSA/ICd1bnNoaWZ0JyA6ICdwdXNoJztcbiAgICAgICAgZXZlbnRzLnNwbGl0KCcgJykuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgICAgaWYgKCFzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF0pIHNlbGYuZXZlbnRzTGlzdGVuZXJzW2V2ZW50XSA9IFtdO1xuICAgICAgICAgIHNlbGYuZXZlbnRzTGlzdGVuZXJzW2V2ZW50XVttZXRob2RdKGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9LFxuXG4gICAgICBvbmNlKGV2ZW50cywgaGFuZGxlciwgcHJpb3JpdHkpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5ldmVudHNMaXN0ZW5lcnMgfHwgc2VsZi5kZXN0cm95ZWQpIHJldHVybiBzZWxmO1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHJldHVybiBzZWxmO1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uY2VIYW5kbGVyKCkge1xuICAgICAgICAgIHNlbGYub2ZmKGV2ZW50cywgb25jZUhhbmRsZXIpO1xuXG4gICAgICAgICAgaWYgKG9uY2VIYW5kbGVyLl9fZW1pdHRlclByb3h5KSB7XG4gICAgICAgICAgICBkZWxldGUgb25jZUhhbmRsZXIuX19lbWl0dGVyUHJveHk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGhhbmRsZXIuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICBvbmNlSGFuZGxlci5fX2VtaXR0ZXJQcm94eSA9IGhhbmRsZXI7XG4gICAgICAgIHJldHVybiBzZWxmLm9uKGV2ZW50cywgb25jZUhhbmRsZXIsIHByaW9yaXR5KTtcbiAgICAgIH0sXG5cbiAgICAgIG9uQW55KGhhbmRsZXIsIHByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXNlbGYuZXZlbnRzTGlzdGVuZXJzIHx8IHNlbGYuZGVzdHJveWVkKSByZXR1cm4gc2VsZjtcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gc2VsZjtcbiAgICAgICAgY29uc3QgbWV0aG9kID0gcHJpb3JpdHkgPyAndW5zaGlmdCcgOiAncHVzaCc7XG5cbiAgICAgICAgaWYgKHNlbGYuZXZlbnRzQW55TGlzdGVuZXJzLmluZGV4T2YoaGFuZGxlcikgPCAwKSB7XG4gICAgICAgICAgc2VsZi5ldmVudHNBbnlMaXN0ZW5lcnNbbWV0aG9kXShoYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSxcblxuICAgICAgb2ZmQW55KGhhbmRsZXIpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5ldmVudHNMaXN0ZW5lcnMgfHwgc2VsZi5kZXN0cm95ZWQpIHJldHVybiBzZWxmO1xuICAgICAgICBpZiAoIXNlbGYuZXZlbnRzQW55TGlzdGVuZXJzKSByZXR1cm4gc2VsZjtcbiAgICAgICAgY29uc3QgaW5kZXggPSBzZWxmLmV2ZW50c0FueUxpc3RlbmVycy5pbmRleE9mKGhhbmRsZXIpO1xuXG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgc2VsZi5ldmVudHNBbnlMaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSxcblxuICAgICAgb2ZmKGV2ZW50cywgaGFuZGxlcikge1xuICAgICAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCFzZWxmLmV2ZW50c0xpc3RlbmVycyB8fCBzZWxmLmRlc3Ryb3llZCkgcmV0dXJuIHNlbGY7XG4gICAgICAgIGlmICghc2VsZi5ldmVudHNMaXN0ZW5lcnMpIHJldHVybiBzZWxmO1xuICAgICAgICBldmVudHMuc3BsaXQoJyAnKS5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF0gPSBbXTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYuZXZlbnRzTGlzdGVuZXJzW2V2ZW50XSkge1xuICAgICAgICAgICAgc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdLmZvckVhY2goKGV2ZW50SGFuZGxlciwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50SGFuZGxlciA9PT0gaGFuZGxlciB8fCBldmVudEhhbmRsZXIuX19lbWl0dGVyUHJveHkgJiYgZXZlbnRIYW5kbGVyLl9fZW1pdHRlclByb3h5ID09PSBoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5ldmVudHNMaXN0ZW5lcnNbZXZlbnRdLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSxcblxuICAgICAgZW1pdCgpIHtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5ldmVudHNMaXN0ZW5lcnMgfHwgc2VsZi5kZXN0cm95ZWQpIHJldHVybiBzZWxmO1xuICAgICAgICBpZiAoIXNlbGYuZXZlbnRzTGlzdGVuZXJzKSByZXR1cm4gc2VsZjtcbiAgICAgICAgbGV0IGV2ZW50cztcbiAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgIGxldCBjb250ZXh0O1xuXG4gICAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICAgIGFyZ3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ3N0cmluZycgfHwgQXJyYXkuaXNBcnJheShhcmdzWzBdKSkge1xuICAgICAgICAgIGV2ZW50cyA9IGFyZ3NbMF07XG4gICAgICAgICAgZGF0YSA9IGFyZ3Muc2xpY2UoMSwgYXJncy5sZW5ndGgpO1xuICAgICAgICAgIGNvbnRleHQgPSBzZWxmO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV2ZW50cyA9IGFyZ3NbMF0uZXZlbnRzO1xuICAgICAgICAgIGRhdGEgPSBhcmdzWzBdLmRhdGE7XG4gICAgICAgICAgY29udGV4dCA9IGFyZ3NbMF0uY29udGV4dCB8fCBzZWxmO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS51bnNoaWZ0KGNvbnRleHQpO1xuICAgICAgICBjb25zdCBldmVudHNBcnJheSA9IEFycmF5LmlzQXJyYXkoZXZlbnRzKSA/IGV2ZW50cyA6IGV2ZW50cy5zcGxpdCgnICcpO1xuICAgICAgICBldmVudHNBcnJheS5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgICBpZiAoc2VsZi5ldmVudHNBbnlMaXN0ZW5lcnMgJiYgc2VsZi5ldmVudHNBbnlMaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzZWxmLmV2ZW50c0FueUxpc3RlbmVycy5mb3JFYWNoKGV2ZW50SGFuZGxlciA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50SGFuZGxlci5hcHBseShjb250ZXh0LCBbZXZlbnQsIC4uLmRhdGFdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWxmLmV2ZW50c0xpc3RlbmVycyAmJiBzZWxmLmV2ZW50c0xpc3RlbmVyc1tldmVudF0pIHtcbiAgICAgICAgICAgIHNlbGYuZXZlbnRzTGlzdGVuZXJzW2V2ZW50XS5mb3JFYWNoKGV2ZW50SGFuZGxlciA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50SGFuZGxlci5hcHBseShjb250ZXh0LCBkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNpemUoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgbGV0IHdpZHRoO1xuICAgICAgbGV0IGhlaWdodDtcbiAgICAgIGNvbnN0ICRlbCA9IHN3aXBlci4kZWw7XG5cbiAgICAgIGlmICh0eXBlb2Ygc3dpcGVyLnBhcmFtcy53aWR0aCAhPT0gJ3VuZGVmaW5lZCcgJiYgc3dpcGVyLnBhcmFtcy53aWR0aCAhPT0gbnVsbCkge1xuICAgICAgICB3aWR0aCA9IHN3aXBlci5wYXJhbXMud2lkdGg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aWR0aCA9ICRlbFswXS5jbGllbnRXaWR0aDtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBzd2lwZXIucGFyYW1zLmhlaWdodCAhPT0gJ3VuZGVmaW5lZCcgJiYgc3dpcGVyLnBhcmFtcy5oZWlnaHQgIT09IG51bGwpIHtcbiAgICAgICAgaGVpZ2h0ID0gc3dpcGVyLnBhcmFtcy5oZWlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWlnaHQgPSAkZWxbMF0uY2xpZW50SGVpZ2h0O1xuICAgICAgfVxuXG4gICAgICBpZiAod2lkdGggPT09IDAgJiYgc3dpcGVyLmlzSG9yaXpvbnRhbCgpIHx8IGhlaWdodCA9PT0gMCAmJiBzd2lwZXIuaXNWZXJ0aWNhbCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gU3VidHJhY3QgcGFkZGluZ3NcblxuXG4gICAgICB3aWR0aCA9IHdpZHRoIC0gcGFyc2VJbnQoJGVsLmNzcygncGFkZGluZy1sZWZ0JykgfHwgMCwgMTApIC0gcGFyc2VJbnQoJGVsLmNzcygncGFkZGluZy1yaWdodCcpIHx8IDAsIDEwKTtcbiAgICAgIGhlaWdodCA9IGhlaWdodCAtIHBhcnNlSW50KCRlbC5jc3MoJ3BhZGRpbmctdG9wJykgfHwgMCwgMTApIC0gcGFyc2VJbnQoJGVsLmNzcygncGFkZGluZy1ib3R0b20nKSB8fCAwLCAxMCk7XG4gICAgICBpZiAoTnVtYmVyLmlzTmFOKHdpZHRoKSkgd2lkdGggPSAwO1xuICAgICAgaWYgKE51bWJlci5pc05hTihoZWlnaHQpKSBoZWlnaHQgPSAwO1xuICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIsIHtcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgc2l6ZTogc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gd2lkdGggOiBoZWlnaHRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNsaWRlcygpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG5cbiAgICAgIGZ1bmN0aW9uIGdldERpcmVjdGlvbkxhYmVsKHByb3BlcnR5KSB7XG4gICAgICAgIGlmIChzd2lwZXIuaXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgICAgIH0gLy8gcHJldHRpZXItaWdub3JlXG5cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICd3aWR0aCc6ICdoZWlnaHQnLFxuICAgICAgICAgICdtYXJnaW4tdG9wJzogJ21hcmdpbi1sZWZ0JyxcbiAgICAgICAgICAnbWFyZ2luLWJvdHRvbSAnOiAnbWFyZ2luLXJpZ2h0JyxcbiAgICAgICAgICAnbWFyZ2luLWxlZnQnOiAnbWFyZ2luLXRvcCcsXG4gICAgICAgICAgJ21hcmdpbi1yaWdodCc6ICdtYXJnaW4tYm90dG9tJyxcbiAgICAgICAgICAncGFkZGluZy1sZWZ0JzogJ3BhZGRpbmctdG9wJyxcbiAgICAgICAgICAncGFkZGluZy1yaWdodCc6ICdwYWRkaW5nLWJvdHRvbScsXG4gICAgICAgICAgJ21hcmdpblJpZ2h0JzogJ21hcmdpbkJvdHRvbSdcbiAgICAgICAgfVtwcm9wZXJ0eV07XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldERpcmVjdGlvblByb3BlcnR5VmFsdWUobm9kZSwgbGFiZWwpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQobm9kZS5nZXRQcm9wZXJ0eVZhbHVlKGdldERpcmVjdGlvbkxhYmVsKGxhYmVsKSkgfHwgMCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcmFtcyA9IHN3aXBlci5wYXJhbXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgICR3cmFwcGVyRWwsXG4gICAgICAgIHNpemU6IHN3aXBlclNpemUsXG4gICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsLFxuICAgICAgICB3cm9uZ1JUTFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGNvbnN0IGlzVmlydHVhbCA9IHN3aXBlci52aXJ0dWFsICYmIHBhcmFtcy52aXJ0dWFsLmVuYWJsZWQ7XG4gICAgICBjb25zdCBwcmV2aW91c1NsaWRlc0xlbmd0aCA9IGlzVmlydHVhbCA/IHN3aXBlci52aXJ0dWFsLnNsaWRlcy5sZW5ndGggOiBzd2lwZXIuc2xpZGVzLmxlbmd0aDtcbiAgICAgIGNvbnN0IHNsaWRlcyA9ICR3cmFwcGVyRWwuY2hpbGRyZW4oYC4ke3N3aXBlci5wYXJhbXMuc2xpZGVDbGFzc31gKTtcbiAgICAgIGNvbnN0IHNsaWRlc0xlbmd0aCA9IGlzVmlydHVhbCA/IHN3aXBlci52aXJ0dWFsLnNsaWRlcy5sZW5ndGggOiBzbGlkZXMubGVuZ3RoO1xuICAgICAgbGV0IHNuYXBHcmlkID0gW107XG4gICAgICBjb25zdCBzbGlkZXNHcmlkID0gW107XG4gICAgICBjb25zdCBzbGlkZXNTaXplc0dyaWQgPSBbXTtcbiAgICAgIGxldCBvZmZzZXRCZWZvcmUgPSBwYXJhbXMuc2xpZGVzT2Zmc2V0QmVmb3JlO1xuXG4gICAgICBpZiAodHlwZW9mIG9mZnNldEJlZm9yZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvZmZzZXRCZWZvcmUgPSBwYXJhbXMuc2xpZGVzT2Zmc2V0QmVmb3JlLmNhbGwoc3dpcGVyKTtcbiAgICAgIH1cblxuICAgICAgbGV0IG9mZnNldEFmdGVyID0gcGFyYW1zLnNsaWRlc09mZnNldEFmdGVyO1xuXG4gICAgICBpZiAodHlwZW9mIG9mZnNldEFmdGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9mZnNldEFmdGVyID0gcGFyYW1zLnNsaWRlc09mZnNldEFmdGVyLmNhbGwoc3dpcGVyKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcHJldmlvdXNTbmFwR3JpZExlbmd0aCA9IHN3aXBlci5zbmFwR3JpZC5sZW5ndGg7XG4gICAgICBjb25zdCBwcmV2aW91c1NsaWRlc0dyaWRMZW5ndGggPSBzd2lwZXIuc2xpZGVzR3JpZC5sZW5ndGg7XG4gICAgICBsZXQgc3BhY2VCZXR3ZWVuID0gcGFyYW1zLnNwYWNlQmV0d2VlbjtcbiAgICAgIGxldCBzbGlkZVBvc2l0aW9uID0gLW9mZnNldEJlZm9yZTtcbiAgICAgIGxldCBwcmV2U2xpZGVTaXplID0gMDtcbiAgICAgIGxldCBpbmRleCA9IDA7XG5cbiAgICAgIGlmICh0eXBlb2Ygc3dpcGVyU2l6ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHNwYWNlQmV0d2VlbiA9PT0gJ3N0cmluZycgJiYgc3BhY2VCZXR3ZWVuLmluZGV4T2YoJyUnKSA+PSAwKSB7XG4gICAgICAgIHNwYWNlQmV0d2VlbiA9IHBhcnNlRmxvYXQoc3BhY2VCZXR3ZWVuLnJlcGxhY2UoJyUnLCAnJykpIC8gMTAwICogc3dpcGVyU2l6ZTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLnZpcnR1YWxTaXplID0gLXNwYWNlQmV0d2VlbjsgLy8gcmVzZXQgbWFyZ2luc1xuXG4gICAgICBpZiAocnRsKSBzbGlkZXMuY3NzKHtcbiAgICAgICAgbWFyZ2luTGVmdDogJycsXG4gICAgICAgIG1hcmdpbkJvdHRvbTogJycsXG4gICAgICAgIG1hcmdpblRvcDogJydcbiAgICAgIH0pO2Vsc2Ugc2xpZGVzLmNzcyh7XG4gICAgICAgIG1hcmdpblJpZ2h0OiAnJyxcbiAgICAgICAgbWFyZ2luQm90dG9tOiAnJyxcbiAgICAgICAgbWFyZ2luVG9wOiAnJ1xuICAgICAgfSk7IC8vIHJlc2V0IGNzc01vZGUgb2Zmc2V0c1xuXG4gICAgICBpZiAocGFyYW1zLmNlbnRlcmVkU2xpZGVzICYmIHBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIHNldENTU1Byb3BlcnR5KHN3aXBlci53cmFwcGVyRWwsICctLXN3aXBlci1jZW50ZXJlZC1vZmZzZXQtYmVmb3JlJywgJycpO1xuICAgICAgICBzZXRDU1NQcm9wZXJ0eShzd2lwZXIud3JhcHBlckVsLCAnLS1zd2lwZXItY2VudGVyZWQtb2Zmc2V0LWFmdGVyJywgJycpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBncmlkRW5hYmxlZCA9IHBhcmFtcy5ncmlkICYmIHBhcmFtcy5ncmlkLnJvd3MgPiAxICYmIHN3aXBlci5ncmlkO1xuXG4gICAgICBpZiAoZ3JpZEVuYWJsZWQpIHtcbiAgICAgICAgc3dpcGVyLmdyaWQuaW5pdFNsaWRlcyhzbGlkZXNMZW5ndGgpO1xuICAgICAgfSAvLyBDYWxjIHNsaWRlc1xuXG5cbiAgICAgIGxldCBzbGlkZVNpemU7XG4gICAgICBjb25zdCBzaG91bGRSZXNldFNsaWRlU2l6ZSA9IHBhcmFtcy5zbGlkZXNQZXJWaWV3ID09PSAnYXV0bycgJiYgcGFyYW1zLmJyZWFrcG9pbnRzICYmIE9iamVjdC5rZXlzKHBhcmFtcy5icmVha3BvaW50cykuZmlsdGVyKGtleSA9PiB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgcGFyYW1zLmJyZWFrcG9pbnRzW2tleV0uc2xpZGVzUGVyVmlldyAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgICB9KS5sZW5ndGggPiAwO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNsaWRlc0xlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHNsaWRlU2l6ZSA9IDA7XG4gICAgICAgIGNvbnN0IHNsaWRlID0gc2xpZGVzLmVxKGkpO1xuXG4gICAgICAgIGlmIChncmlkRW5hYmxlZCkge1xuICAgICAgICAgIHN3aXBlci5ncmlkLnVwZGF0ZVNsaWRlKGksIHNsaWRlLCBzbGlkZXNMZW5ndGgsIGdldERpcmVjdGlvbkxhYmVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzbGlkZS5jc3MoJ2Rpc3BsYXknKSA9PT0gJ25vbmUnKSBjb250aW51ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgICAgIGlmIChwYXJhbXMuc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgaWYgKHNob3VsZFJlc2V0U2xpZGVTaXplKSB7XG4gICAgICAgICAgICBzbGlkZXNbaV0uc3R5bGVbZ2V0RGlyZWN0aW9uTGFiZWwoJ3dpZHRoJyldID0gYGA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgc2xpZGVTdHlsZXMgPSBnZXRDb21wdXRlZFN0eWxlKHNsaWRlWzBdKTtcbiAgICAgICAgICBjb25zdCBjdXJyZW50VHJhbnNmb3JtID0gc2xpZGVbMF0uc3R5bGUudHJhbnNmb3JtO1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRXZWJLaXRUcmFuc2Zvcm0gPSBzbGlkZVswXS5zdHlsZS53ZWJraXRUcmFuc2Zvcm07XG5cbiAgICAgICAgICBpZiAoY3VycmVudFRyYW5zZm9ybSkge1xuICAgICAgICAgICAgc2xpZGVbMF0uc3R5bGUudHJhbnNmb3JtID0gJ25vbmUnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjdXJyZW50V2ViS2l0VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICBzbGlkZVswXS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAnbm9uZSc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhcmFtcy5yb3VuZExlbmd0aHMpIHtcbiAgICAgICAgICAgIHNsaWRlU2l6ZSA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/IHNsaWRlLm91dGVyV2lkdGgodHJ1ZSkgOiBzbGlkZS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgICBjb25zdCB3aWR0aCA9IGdldERpcmVjdGlvblByb3BlcnR5VmFsdWUoc2xpZGVTdHlsZXMsICd3aWR0aCcpO1xuICAgICAgICAgICAgY29uc3QgcGFkZGluZ0xlZnQgPSBnZXREaXJlY3Rpb25Qcm9wZXJ0eVZhbHVlKHNsaWRlU3R5bGVzLCAncGFkZGluZy1sZWZ0Jyk7XG4gICAgICAgICAgICBjb25zdCBwYWRkaW5nUmlnaHQgPSBnZXREaXJlY3Rpb25Qcm9wZXJ0eVZhbHVlKHNsaWRlU3R5bGVzLCAncGFkZGluZy1yaWdodCcpO1xuICAgICAgICAgICAgY29uc3QgbWFyZ2luTGVmdCA9IGdldERpcmVjdGlvblByb3BlcnR5VmFsdWUoc2xpZGVTdHlsZXMsICdtYXJnaW4tbGVmdCcpO1xuICAgICAgICAgICAgY29uc3QgbWFyZ2luUmlnaHQgPSBnZXREaXJlY3Rpb25Qcm9wZXJ0eVZhbHVlKHNsaWRlU3R5bGVzLCAnbWFyZ2luLXJpZ2h0Jyk7XG4gICAgICAgICAgICBjb25zdCBib3hTaXppbmcgPSBzbGlkZVN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKCdib3gtc2l6aW5nJyk7XG5cbiAgICAgICAgICAgIGlmIChib3hTaXppbmcgJiYgYm94U2l6aW5nID09PSAnYm9yZGVyLWJveCcpIHtcbiAgICAgICAgICAgICAgc2xpZGVTaXplID0gd2lkdGggKyBtYXJnaW5MZWZ0ICsgbWFyZ2luUmlnaHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgY2xpZW50V2lkdGgsXG4gICAgICAgICAgICAgICAgb2Zmc2V0V2lkdGhcbiAgICAgICAgICAgICAgfSA9IHNsaWRlWzBdO1xuICAgICAgICAgICAgICBzbGlkZVNpemUgPSB3aWR0aCArIHBhZGRpbmdMZWZ0ICsgcGFkZGluZ1JpZ2h0ICsgbWFyZ2luTGVmdCArIG1hcmdpblJpZ2h0ICsgKG9mZnNldFdpZHRoIC0gY2xpZW50V2lkdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjdXJyZW50VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICBzbGlkZVswXS5zdHlsZS50cmFuc2Zvcm0gPSBjdXJyZW50VHJhbnNmb3JtO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjdXJyZW50V2ViS2l0VHJhbnNmb3JtKSB7XG4gICAgICAgICAgICBzbGlkZVswXS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBjdXJyZW50V2ViS2l0VHJhbnNmb3JtO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXJhbXMucm91bmRMZW5ndGhzKSBzbGlkZVNpemUgPSBNYXRoLmZsb29yKHNsaWRlU2l6ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2xpZGVTaXplID0gKHN3aXBlclNpemUgLSAocGFyYW1zLnNsaWRlc1BlclZpZXcgLSAxKSAqIHNwYWNlQmV0d2VlbikgLyBwYXJhbXMuc2xpZGVzUGVyVmlldztcbiAgICAgICAgICBpZiAocGFyYW1zLnJvdW5kTGVuZ3Rocykgc2xpZGVTaXplID0gTWF0aC5mbG9vcihzbGlkZVNpemUpO1xuXG4gICAgICAgICAgaWYgKHNsaWRlc1tpXSkge1xuICAgICAgICAgICAgc2xpZGVzW2ldLnN0eWxlW2dldERpcmVjdGlvbkxhYmVsKCd3aWR0aCcpXSA9IGAke3NsaWRlU2l6ZX1weGA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNsaWRlc1tpXSkge1xuICAgICAgICAgIHNsaWRlc1tpXS5zd2lwZXJTbGlkZVNpemUgPSBzbGlkZVNpemU7XG4gICAgICAgIH1cblxuICAgICAgICBzbGlkZXNTaXplc0dyaWQucHVzaChzbGlkZVNpemUpO1xuXG4gICAgICAgIGlmIChwYXJhbXMuY2VudGVyZWRTbGlkZXMpIHtcbiAgICAgICAgICBzbGlkZVBvc2l0aW9uID0gc2xpZGVQb3NpdGlvbiArIHNsaWRlU2l6ZSAvIDIgKyBwcmV2U2xpZGVTaXplIC8gMiArIHNwYWNlQmV0d2VlbjtcbiAgICAgICAgICBpZiAocHJldlNsaWRlU2l6ZSA9PT0gMCAmJiBpICE9PSAwKSBzbGlkZVBvc2l0aW9uID0gc2xpZGVQb3NpdGlvbiAtIHN3aXBlclNpemUgLyAyIC0gc3BhY2VCZXR3ZWVuO1xuICAgICAgICAgIGlmIChpID09PSAwKSBzbGlkZVBvc2l0aW9uID0gc2xpZGVQb3NpdGlvbiAtIHN3aXBlclNpemUgLyAyIC0gc3BhY2VCZXR3ZWVuO1xuICAgICAgICAgIGlmIChNYXRoLmFicyhzbGlkZVBvc2l0aW9uKSA8IDEgLyAxMDAwKSBzbGlkZVBvc2l0aW9uID0gMDtcbiAgICAgICAgICBpZiAocGFyYW1zLnJvdW5kTGVuZ3Rocykgc2xpZGVQb3NpdGlvbiA9IE1hdGguZmxvb3Ioc2xpZGVQb3NpdGlvbik7XG4gICAgICAgICAgaWYgKGluZGV4ICUgcGFyYW1zLnNsaWRlc1Blckdyb3VwID09PSAwKSBzbmFwR3JpZC5wdXNoKHNsaWRlUG9zaXRpb24pO1xuICAgICAgICAgIHNsaWRlc0dyaWQucHVzaChzbGlkZVBvc2l0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocGFyYW1zLnJvdW5kTGVuZ3Rocykgc2xpZGVQb3NpdGlvbiA9IE1hdGguZmxvb3Ioc2xpZGVQb3NpdGlvbik7XG4gICAgICAgICAgaWYgKChpbmRleCAtIE1hdGgubWluKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyR3JvdXBTa2lwLCBpbmRleCkpICUgc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cCA9PT0gMCkgc25hcEdyaWQucHVzaChzbGlkZVBvc2l0aW9uKTtcbiAgICAgICAgICBzbGlkZXNHcmlkLnB1c2goc2xpZGVQb3NpdGlvbik7XG4gICAgICAgICAgc2xpZGVQb3NpdGlvbiA9IHNsaWRlUG9zaXRpb24gKyBzbGlkZVNpemUgKyBzcGFjZUJldHdlZW47XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIudmlydHVhbFNpemUgKz0gc2xpZGVTaXplICsgc3BhY2VCZXR3ZWVuO1xuICAgICAgICBwcmV2U2xpZGVTaXplID0gc2xpZGVTaXplO1xuICAgICAgICBpbmRleCArPSAxO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIudmlydHVhbFNpemUgPSBNYXRoLm1heChzd2lwZXIudmlydHVhbFNpemUsIHN3aXBlclNpemUpICsgb2Zmc2V0QWZ0ZXI7XG5cbiAgICAgIGlmIChydGwgJiYgd3JvbmdSVEwgJiYgKHBhcmFtcy5lZmZlY3QgPT09ICdzbGlkZScgfHwgcGFyYW1zLmVmZmVjdCA9PT0gJ2NvdmVyZmxvdycpKSB7XG4gICAgICAgICR3cmFwcGVyRWwuY3NzKHtcbiAgICAgICAgICB3aWR0aDogYCR7c3dpcGVyLnZpcnR1YWxTaXplICsgcGFyYW1zLnNwYWNlQmV0d2Vlbn1weGBcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMuc2V0V3JhcHBlclNpemUpIHtcbiAgICAgICAgJHdyYXBwZXJFbC5jc3Moe1xuICAgICAgICAgIFtnZXREaXJlY3Rpb25MYWJlbCgnd2lkdGgnKV06IGAke3N3aXBlci52aXJ0dWFsU2l6ZSArIHBhcmFtcy5zcGFjZUJldHdlZW59cHhgXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZ3JpZEVuYWJsZWQpIHtcbiAgICAgICAgc3dpcGVyLmdyaWQudXBkYXRlV3JhcHBlclNpemUoc2xpZGVTaXplLCBzbmFwR3JpZCwgZ2V0RGlyZWN0aW9uTGFiZWwpO1xuICAgICAgfSAvLyBSZW1vdmUgbGFzdCBncmlkIGVsZW1lbnRzIGRlcGVuZGluZyBvbiB3aWR0aFxuXG5cbiAgICAgIGlmICghcGFyYW1zLmNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICAgIGNvbnN0IG5ld1NsaWRlc0dyaWQgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNuYXBHcmlkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgbGV0IHNsaWRlc0dyaWRJdGVtID0gc25hcEdyaWRbaV07XG4gICAgICAgICAgaWYgKHBhcmFtcy5yb3VuZExlbmd0aHMpIHNsaWRlc0dyaWRJdGVtID0gTWF0aC5mbG9vcihzbGlkZXNHcmlkSXRlbSk7XG5cbiAgICAgICAgICBpZiAoc25hcEdyaWRbaV0gPD0gc3dpcGVyLnZpcnR1YWxTaXplIC0gc3dpcGVyU2l6ZSkge1xuICAgICAgICAgICAgbmV3U2xpZGVzR3JpZC5wdXNoKHNsaWRlc0dyaWRJdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzbmFwR3JpZCA9IG5ld1NsaWRlc0dyaWQ7XG5cbiAgICAgICAgaWYgKE1hdGguZmxvb3Ioc3dpcGVyLnZpcnR1YWxTaXplIC0gc3dpcGVyU2l6ZSkgLSBNYXRoLmZsb29yKHNuYXBHcmlkW3NuYXBHcmlkLmxlbmd0aCAtIDFdKSA+IDEpIHtcbiAgICAgICAgICBzbmFwR3JpZC5wdXNoKHN3aXBlci52aXJ0dWFsU2l6ZSAtIHN3aXBlclNpemUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzbmFwR3JpZC5sZW5ndGggPT09IDApIHNuYXBHcmlkID0gWzBdO1xuXG4gICAgICBpZiAocGFyYW1zLnNwYWNlQmV0d2VlbiAhPT0gMCkge1xuICAgICAgICBjb25zdCBrZXkgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgJiYgcnRsID8gJ21hcmdpbkxlZnQnIDogZ2V0RGlyZWN0aW9uTGFiZWwoJ21hcmdpblJpZ2h0Jyk7XG4gICAgICAgIHNsaWRlcy5maWx0ZXIoKF8sIHNsaWRlSW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoIXBhcmFtcy5jc3NNb2RlKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAgIGlmIChzbGlkZUluZGV4ID09PSBzbGlkZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KS5jc3Moe1xuICAgICAgICAgIFtrZXldOiBgJHtzcGFjZUJldHdlZW59cHhgXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLmNlbnRlcmVkU2xpZGVzICYmIHBhcmFtcy5jZW50ZXJlZFNsaWRlc0JvdW5kcykge1xuICAgICAgICBsZXQgYWxsU2xpZGVzU2l6ZSA9IDA7XG4gICAgICAgIHNsaWRlc1NpemVzR3JpZC5mb3JFYWNoKHNsaWRlU2l6ZVZhbHVlID0+IHtcbiAgICAgICAgICBhbGxTbGlkZXNTaXplICs9IHNsaWRlU2l6ZVZhbHVlICsgKHBhcmFtcy5zcGFjZUJldHdlZW4gPyBwYXJhbXMuc3BhY2VCZXR3ZWVuIDogMCk7XG4gICAgICAgIH0pO1xuICAgICAgICBhbGxTbGlkZXNTaXplIC09IHBhcmFtcy5zcGFjZUJldHdlZW47XG4gICAgICAgIGNvbnN0IG1heFNuYXAgPSBhbGxTbGlkZXNTaXplIC0gc3dpcGVyU2l6ZTtcbiAgICAgICAgc25hcEdyaWQgPSBzbmFwR3JpZC5tYXAoc25hcCA9PiB7XG4gICAgICAgICAgaWYgKHNuYXAgPCAwKSByZXR1cm4gLW9mZnNldEJlZm9yZTtcbiAgICAgICAgICBpZiAoc25hcCA+IG1heFNuYXApIHJldHVybiBtYXhTbmFwICsgb2Zmc2V0QWZ0ZXI7XG4gICAgICAgICAgcmV0dXJuIHNuYXA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLmNlbnRlckluc3VmZmljaWVudFNsaWRlcykge1xuICAgICAgICBsZXQgYWxsU2xpZGVzU2l6ZSA9IDA7XG4gICAgICAgIHNsaWRlc1NpemVzR3JpZC5mb3JFYWNoKHNsaWRlU2l6ZVZhbHVlID0+IHtcbiAgICAgICAgICBhbGxTbGlkZXNTaXplICs9IHNsaWRlU2l6ZVZhbHVlICsgKHBhcmFtcy5zcGFjZUJldHdlZW4gPyBwYXJhbXMuc3BhY2VCZXR3ZWVuIDogMCk7XG4gICAgICAgIH0pO1xuICAgICAgICBhbGxTbGlkZXNTaXplIC09IHBhcmFtcy5zcGFjZUJldHdlZW47XG5cbiAgICAgICAgaWYgKGFsbFNsaWRlc1NpemUgPCBzd2lwZXJTaXplKSB7XG4gICAgICAgICAgY29uc3QgYWxsU2xpZGVzT2Zmc2V0ID0gKHN3aXBlclNpemUgLSBhbGxTbGlkZXNTaXplKSAvIDI7XG4gICAgICAgICAgc25hcEdyaWQuZm9yRWFjaCgoc25hcCwgc25hcEluZGV4KSA9PiB7XG4gICAgICAgICAgICBzbmFwR3JpZFtzbmFwSW5kZXhdID0gc25hcCAtIGFsbFNsaWRlc09mZnNldDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzbGlkZXNHcmlkLmZvckVhY2goKHNuYXAsIHNuYXBJbmRleCkgPT4ge1xuICAgICAgICAgICAgc2xpZGVzR3JpZFtzbmFwSW5kZXhdID0gc25hcCArIGFsbFNsaWRlc09mZnNldDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBPYmplY3QuYXNzaWduKHN3aXBlciwge1xuICAgICAgICBzbGlkZXMsXG4gICAgICAgIHNuYXBHcmlkLFxuICAgICAgICBzbGlkZXNHcmlkLFxuICAgICAgICBzbGlkZXNTaXplc0dyaWRcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGFyYW1zLmNlbnRlcmVkU2xpZGVzICYmIHBhcmFtcy5jc3NNb2RlICYmICFwYXJhbXMuY2VudGVyZWRTbGlkZXNCb3VuZHMpIHtcbiAgICAgICAgc2V0Q1NTUHJvcGVydHkoc3dpcGVyLndyYXBwZXJFbCwgJy0tc3dpcGVyLWNlbnRlcmVkLW9mZnNldC1iZWZvcmUnLCBgJHstc25hcEdyaWRbMF19cHhgKTtcbiAgICAgICAgc2V0Q1NTUHJvcGVydHkoc3dpcGVyLndyYXBwZXJFbCwgJy0tc3dpcGVyLWNlbnRlcmVkLW9mZnNldC1hZnRlcicsIGAke3N3aXBlci5zaXplIC8gMiAtIHNsaWRlc1NpemVzR3JpZFtzbGlkZXNTaXplc0dyaWQubGVuZ3RoIC0gMV0gLyAyfXB4YCk7XG4gICAgICAgIGNvbnN0IGFkZFRvU25hcEdyaWQgPSAtc3dpcGVyLnNuYXBHcmlkWzBdO1xuICAgICAgICBjb25zdCBhZGRUb1NsaWRlc0dyaWQgPSAtc3dpcGVyLnNsaWRlc0dyaWRbMF07XG4gICAgICAgIHN3aXBlci5zbmFwR3JpZCA9IHN3aXBlci5zbmFwR3JpZC5tYXAodiA9PiB2ICsgYWRkVG9TbmFwR3JpZCk7XG4gICAgICAgIHN3aXBlci5zbGlkZXNHcmlkID0gc3dpcGVyLnNsaWRlc0dyaWQubWFwKHYgPT4gdiArIGFkZFRvU2xpZGVzR3JpZCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzbGlkZXNMZW5ndGggIT09IHByZXZpb3VzU2xpZGVzTGVuZ3RoKSB7XG4gICAgICAgIHN3aXBlci5lbWl0KCdzbGlkZXNMZW5ndGhDaGFuZ2UnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNuYXBHcmlkLmxlbmd0aCAhPT0gcHJldmlvdXNTbmFwR3JpZExlbmd0aCkge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy53YXRjaE92ZXJmbG93KSBzd2lwZXIuY2hlY2tPdmVyZmxvdygpO1xuICAgICAgICBzd2lwZXIuZW1pdCgnc25hcEdyaWRMZW5ndGhDaGFuZ2UnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNsaWRlc0dyaWQubGVuZ3RoICE9PSBwcmV2aW91c1NsaWRlc0dyaWRMZW5ndGgpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3NsaWRlc0dyaWRMZW5ndGhDaGFuZ2UnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy53YXRjaFNsaWRlc1Byb2dyZXNzKSB7XG4gICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNPZmZzZXQoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc1ZpcnR1YWwgJiYgIXBhcmFtcy5jc3NNb2RlICYmIChwYXJhbXMuZWZmZWN0ID09PSAnc2xpZGUnIHx8IHBhcmFtcy5lZmZlY3QgPT09ICdmYWRlJykpIHtcbiAgICAgICAgY29uc3QgYmFja0ZhY2VIaWRkZW5DbGFzcyA9IGAke3BhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzfWJhY2tmYWNlLWhpZGRlbmA7XG4gICAgICAgIGNvbnN0IGhhc0NsYXNzQmFja2ZhY2VDbGFzc0FkZGVkID0gc3dpcGVyLiRlbC5oYXNDbGFzcyhiYWNrRmFjZUhpZGRlbkNsYXNzKTtcblxuICAgICAgICBpZiAoc2xpZGVzTGVuZ3RoIDw9IHBhcmFtcy5tYXhCYWNrZmFjZUhpZGRlblNsaWRlcykge1xuICAgICAgICAgIGlmICghaGFzQ2xhc3NCYWNrZmFjZUNsYXNzQWRkZWQpIHN3aXBlci4kZWwuYWRkQ2xhc3MoYmFja0ZhY2VIaWRkZW5DbGFzcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzQ2xhc3NCYWNrZmFjZUNsYXNzQWRkZWQpIHtcbiAgICAgICAgICBzd2lwZXIuJGVsLnJlbW92ZUNsYXNzKGJhY2tGYWNlSGlkZGVuQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQXV0b0hlaWdodChzcGVlZCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IGFjdGl2ZVNsaWRlcyA9IFtdO1xuICAgICAgY29uc3QgaXNWaXJ0dWFsID0gc3dpcGVyLnZpcnR1YWwgJiYgc3dpcGVyLnBhcmFtcy52aXJ0dWFsLmVuYWJsZWQ7XG4gICAgICBsZXQgbmV3SGVpZ2h0ID0gMDtcbiAgICAgIGxldCBpO1xuXG4gICAgICBpZiAodHlwZW9mIHNwZWVkID09PSAnbnVtYmVyJykge1xuICAgICAgICBzd2lwZXIuc2V0VHJhbnNpdGlvbihzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSB0cnVlKSB7XG4gICAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKHN3aXBlci5wYXJhbXMuc3BlZWQpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBnZXRTbGlkZUJ5SW5kZXggPSBpbmRleCA9PiB7XG4gICAgICAgIGlmIChpc1ZpcnR1YWwpIHtcbiAgICAgICAgICByZXR1cm4gc3dpcGVyLnNsaWRlcy5maWx0ZXIoZWwgPT4gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpLCAxMCkgPT09IGluZGV4KVswXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzd2lwZXIuc2xpZGVzLmVxKGluZGV4KVswXTtcbiAgICAgIH07IC8vIEZpbmQgc2xpZGVzIGN1cnJlbnRseSBpbiB2aWV3XG5cblxuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyAhPT0gJ2F1dG8nICYmIHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyA+IDEpIHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuY2VudGVyZWRTbGlkZXMpIHtcbiAgICAgICAgICAoc3dpcGVyLnZpc2libGVTbGlkZXMgfHwgJCQxKFtdKSkuZWFjaChzbGlkZSA9PiB7XG4gICAgICAgICAgICBhY3RpdmVTbGlkZXMucHVzaChzbGlkZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IE1hdGguY2VpbChzd2lwZXIucGFyYW1zLnNsaWRlc1BlclZpZXcpOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gc3dpcGVyLmFjdGl2ZUluZGV4ICsgaTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IHN3aXBlci5zbGlkZXMubGVuZ3RoICYmICFpc1ZpcnR1YWwpIGJyZWFrO1xuICAgICAgICAgICAgYWN0aXZlU2xpZGVzLnB1c2goZ2V0U2xpZGVCeUluZGV4KGluZGV4KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3RpdmVTbGlkZXMucHVzaChnZXRTbGlkZUJ5SW5kZXgoc3dpcGVyLmFjdGl2ZUluZGV4KSk7XG4gICAgICB9IC8vIEZpbmQgbmV3IGhlaWdodCBmcm9tIGhpZ2hlc3Qgc2xpZGUgaW4gdmlld1xuXG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBhY3RpdmVTbGlkZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3RpdmVTbGlkZXNbaV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgY29uc3QgaGVpZ2h0ID0gYWN0aXZlU2xpZGVzW2ldLm9mZnNldEhlaWdodDtcbiAgICAgICAgICBuZXdIZWlnaHQgPSBoZWlnaHQgPiBuZXdIZWlnaHQgPyBoZWlnaHQgOiBuZXdIZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgIH0gLy8gVXBkYXRlIEhlaWdodFxuXG5cbiAgICAgIGlmIChuZXdIZWlnaHQgfHwgbmV3SGVpZ2h0ID09PSAwKSBzd2lwZXIuJHdyYXBwZXJFbC5jc3MoJ2hlaWdodCcsIGAke25ld0hlaWdodH1weGApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNsaWRlc09mZnNldCgpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCBzbGlkZXMgPSBzd2lwZXIuc2xpZGVzO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzbGlkZXNbaV0uc3dpcGVyU2xpZGVPZmZzZXQgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBzbGlkZXNbaV0ub2Zmc2V0TGVmdCA6IHNsaWRlc1tpXS5vZmZzZXRUb3A7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2xpZGVzUHJvZ3Jlc3ModHJhbnNsYXRlKSB7XG4gICAgICBpZiAodHJhbnNsYXRlID09PSB2b2lkIDApIHtcbiAgICAgICAgdHJhbnNsYXRlID0gdGhpcyAmJiB0aGlzLnRyYW5zbGF0ZSB8fCAwO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgc2xpZGVzLFxuICAgICAgICBydGxUcmFuc2xhdGU6IHJ0bCxcbiAgICAgICAgc25hcEdyaWRcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBpZiAoc2xpZGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgaWYgKHR5cGVvZiBzbGlkZXNbMF0uc3dpcGVyU2xpZGVPZmZzZXQgPT09ICd1bmRlZmluZWQnKSBzd2lwZXIudXBkYXRlU2xpZGVzT2Zmc2V0KCk7XG4gICAgICBsZXQgb2Zmc2V0Q2VudGVyID0gLXRyYW5zbGF0ZTtcbiAgICAgIGlmIChydGwpIG9mZnNldENlbnRlciA9IHRyYW5zbGF0ZTsgLy8gVmlzaWJsZSBTbGlkZXNcblxuICAgICAgc2xpZGVzLnJlbW92ZUNsYXNzKHBhcmFtcy5zbGlkZVZpc2libGVDbGFzcyk7XG4gICAgICBzd2lwZXIudmlzaWJsZVNsaWRlc0luZGV4ZXMgPSBbXTtcbiAgICAgIHN3aXBlci52aXNpYmxlU2xpZGVzID0gW107XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IHNsaWRlID0gc2xpZGVzW2ldO1xuICAgICAgICBsZXQgc2xpZGVPZmZzZXQgPSBzbGlkZS5zd2lwZXJTbGlkZU9mZnNldDtcblxuICAgICAgICBpZiAocGFyYW1zLmNzc01vZGUgJiYgcGFyYW1zLmNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICAgICAgc2xpZGVPZmZzZXQgLT0gc2xpZGVzWzBdLnN3aXBlclNsaWRlT2Zmc2V0O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2xpZGVQcm9ncmVzcyA9IChvZmZzZXRDZW50ZXIgKyAocGFyYW1zLmNlbnRlcmVkU2xpZGVzID8gc3dpcGVyLm1pblRyYW5zbGF0ZSgpIDogMCkgLSBzbGlkZU9mZnNldCkgLyAoc2xpZGUuc3dpcGVyU2xpZGVTaXplICsgcGFyYW1zLnNwYWNlQmV0d2Vlbik7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsU2xpZGVQcm9ncmVzcyA9IChvZmZzZXRDZW50ZXIgLSBzbmFwR3JpZFswXSArIChwYXJhbXMuY2VudGVyZWRTbGlkZXMgPyBzd2lwZXIubWluVHJhbnNsYXRlKCkgOiAwKSAtIHNsaWRlT2Zmc2V0KSAvIChzbGlkZS5zd2lwZXJTbGlkZVNpemUgKyBwYXJhbXMuc3BhY2VCZXR3ZWVuKTtcbiAgICAgICAgY29uc3Qgc2xpZGVCZWZvcmUgPSAtKG9mZnNldENlbnRlciAtIHNsaWRlT2Zmc2V0KTtcbiAgICAgICAgY29uc3Qgc2xpZGVBZnRlciA9IHNsaWRlQmVmb3JlICsgc3dpcGVyLnNsaWRlc1NpemVzR3JpZFtpXTtcbiAgICAgICAgY29uc3QgaXNWaXNpYmxlID0gc2xpZGVCZWZvcmUgPj0gMCAmJiBzbGlkZUJlZm9yZSA8IHN3aXBlci5zaXplIC0gMSB8fCBzbGlkZUFmdGVyID4gMSAmJiBzbGlkZUFmdGVyIDw9IHN3aXBlci5zaXplIHx8IHNsaWRlQmVmb3JlIDw9IDAgJiYgc2xpZGVBZnRlciA+PSBzd2lwZXIuc2l6ZTtcblxuICAgICAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICAgICAgc3dpcGVyLnZpc2libGVTbGlkZXMucHVzaChzbGlkZSk7XG4gICAgICAgICAgc3dpcGVyLnZpc2libGVTbGlkZXNJbmRleGVzLnB1c2goaSk7XG4gICAgICAgICAgc2xpZGVzLmVxKGkpLmFkZENsYXNzKHBhcmFtcy5zbGlkZVZpc2libGVDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBzbGlkZS5wcm9ncmVzcyA9IHJ0bCA/IC1zbGlkZVByb2dyZXNzIDogc2xpZGVQcm9ncmVzcztcbiAgICAgICAgc2xpZGUub3JpZ2luYWxQcm9ncmVzcyA9IHJ0bCA/IC1vcmlnaW5hbFNsaWRlUHJvZ3Jlc3MgOiBvcmlnaW5hbFNsaWRlUHJvZ3Jlc3M7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci52aXNpYmxlU2xpZGVzID0gJCQxKHN3aXBlci52aXNpYmxlU2xpZGVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVQcm9ncmVzcyh0cmFuc2xhdGUpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2YgdHJhbnNsYXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zdCBtdWx0aXBsaWVyID0gc3dpcGVyLnJ0bFRyYW5zbGF0ZSA/IC0xIDogMTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5cbiAgICAgICAgdHJhbnNsYXRlID0gc3dpcGVyICYmIHN3aXBlci50cmFuc2xhdGUgJiYgc3dpcGVyLnRyYW5zbGF0ZSAqIG11bHRpcGxpZXIgfHwgMDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgICAgIGNvbnN0IHRyYW5zbGF0ZXNEaWZmID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpIC0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpO1xuICAgICAgbGV0IHtcbiAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgIGlzQmVnaW5uaW5nLFxuICAgICAgICBpc0VuZFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGNvbnN0IHdhc0JlZ2lubmluZyA9IGlzQmVnaW5uaW5nO1xuICAgICAgY29uc3Qgd2FzRW5kID0gaXNFbmQ7XG5cbiAgICAgIGlmICh0cmFuc2xhdGVzRGlmZiA9PT0gMCkge1xuICAgICAgICBwcm9ncmVzcyA9IDA7XG4gICAgICAgIGlzQmVnaW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgaXNFbmQgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSAodHJhbnNsYXRlIC0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSAvIHRyYW5zbGF0ZXNEaWZmO1xuICAgICAgICBpc0JlZ2lubmluZyA9IHByb2dyZXNzIDw9IDA7XG4gICAgICAgIGlzRW5kID0gcHJvZ3Jlc3MgPj0gMTtcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIsIHtcbiAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgIGlzQmVnaW5uaW5nLFxuICAgICAgICBpc0VuZFxuICAgICAgfSk7XG4gICAgICBpZiAocGFyYW1zLndhdGNoU2xpZGVzUHJvZ3Jlc3MgfHwgcGFyYW1zLmNlbnRlcmVkU2xpZGVzICYmIHBhcmFtcy5hdXRvSGVpZ2h0KSBzd2lwZXIudXBkYXRlU2xpZGVzUHJvZ3Jlc3ModHJhbnNsYXRlKTtcblxuICAgICAgaWYgKGlzQmVnaW5uaW5nICYmICF3YXNCZWdpbm5pbmcpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3JlYWNoQmVnaW5uaW5nIHRvRWRnZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNFbmQgJiYgIXdhc0VuZCkge1xuICAgICAgICBzd2lwZXIuZW1pdCgncmVhY2hFbmQgdG9FZGdlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh3YXNCZWdpbm5pbmcgJiYgIWlzQmVnaW5uaW5nIHx8IHdhc0VuZCAmJiAhaXNFbmQpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ2Zyb21FZGdlJyk7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5lbWl0KCdwcm9ncmVzcycsIHByb2dyZXNzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTbGlkZXNDbGFzc2VzKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgc2xpZGVzLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgICR3cmFwcGVyRWwsXG4gICAgICAgIGFjdGl2ZUluZGV4LFxuICAgICAgICByZWFsSW5kZXhcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBjb25zdCBpc1ZpcnR1YWwgPSBzd2lwZXIudmlydHVhbCAmJiBwYXJhbXMudmlydHVhbC5lbmFibGVkO1xuICAgICAgc2xpZGVzLnJlbW92ZUNsYXNzKGAke3BhcmFtcy5zbGlkZUFjdGl2ZUNsYXNzfSAke3BhcmFtcy5zbGlkZU5leHRDbGFzc30gJHtwYXJhbXMuc2xpZGVQcmV2Q2xhc3N9ICR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQWN0aXZlQ2xhc3N9ICR7cGFyYW1zLnNsaWRlRHVwbGljYXRlTmV4dENsYXNzfSAke3BhcmFtcy5zbGlkZUR1cGxpY2F0ZVByZXZDbGFzc31gKTtcbiAgICAgIGxldCBhY3RpdmVTbGlkZTtcblxuICAgICAgaWYgKGlzVmlydHVhbCkge1xuICAgICAgICBhY3RpdmVTbGlkZSA9IHN3aXBlci4kd3JhcHBlckVsLmZpbmQoYC4ke3BhcmFtcy5zbGlkZUNsYXNzfVtkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cIiR7YWN0aXZlSW5kZXh9XCJdYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY3RpdmVTbGlkZSA9IHNsaWRlcy5lcShhY3RpdmVJbmRleCk7XG4gICAgICB9IC8vIEFjdGl2ZSBjbGFzc2VzXG5cblxuICAgICAgYWN0aXZlU2xpZGUuYWRkQ2xhc3MocGFyYW1zLnNsaWRlQWN0aXZlQ2xhc3MpO1xuXG4gICAgICBpZiAocGFyYW1zLmxvb3ApIHtcbiAgICAgICAgLy8gRHVwbGljYXRlIHRvIGFsbCBsb29wZWQgc2xpZGVzXG4gICAgICAgIGlmIChhY3RpdmVTbGlkZS5oYXNDbGFzcyhwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykpIHtcbiAgICAgICAgICAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc306bm90KC4ke3BhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzfSlbZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XCIke3JlYWxJbmRleH1cIl1gKS5hZGRDbGFzcyhwYXJhbXMuc2xpZGVEdXBsaWNhdGVBY3RpdmVDbGFzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHdyYXBwZXJFbC5jaGlsZHJlbihgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9LiR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3N9W2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVwiJHtyZWFsSW5kZXh9XCJdYCkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlQWN0aXZlQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9IC8vIE5leHQgU2xpZGVcblxuXG4gICAgICBsZXQgbmV4dFNsaWRlID0gYWN0aXZlU2xpZGUubmV4dEFsbChgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9YCkuZXEoMCkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlTmV4dENsYXNzKTtcblxuICAgICAgaWYgKHBhcmFtcy5sb29wICYmIG5leHRTbGlkZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgbmV4dFNsaWRlID0gc2xpZGVzLmVxKDApO1xuICAgICAgICBuZXh0U2xpZGUuYWRkQ2xhc3MocGFyYW1zLnNsaWRlTmV4dENsYXNzKTtcbiAgICAgIH0gLy8gUHJldiBTbGlkZVxuXG5cbiAgICAgIGxldCBwcmV2U2xpZGUgPSBhY3RpdmVTbGlkZS5wcmV2QWxsKGAuJHtwYXJhbXMuc2xpZGVDbGFzc31gKS5lcSgwKS5hZGRDbGFzcyhwYXJhbXMuc2xpZGVQcmV2Q2xhc3MpO1xuXG4gICAgICBpZiAocGFyYW1zLmxvb3AgJiYgcHJldlNsaWRlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBwcmV2U2xpZGUgPSBzbGlkZXMuZXEoLTEpO1xuICAgICAgICBwcmV2U2xpZGUuYWRkQ2xhc3MocGFyYW1zLnNsaWRlUHJldkNsYXNzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgICAgIC8vIER1cGxpY2F0ZSB0byBhbGwgbG9vcGVkIHNsaWRlc1xuICAgICAgICBpZiAobmV4dFNsaWRlLmhhc0NsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSkge1xuICAgICAgICAgICR3cmFwcGVyRWwuY2hpbGRyZW4oYC4ke3BhcmFtcy5zbGlkZUNsYXNzfTpub3QoLiR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3N9KVtkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cIiR7bmV4dFNsaWRlLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4Jyl9XCJdYCkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlTmV4dENsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc30uJHtwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzc31bZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XCIke25leHRTbGlkZS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpfVwiXWApLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZU5leHRDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJldlNsaWRlLmhhc0NsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSkge1xuICAgICAgICAgICR3cmFwcGVyRWwuY2hpbGRyZW4oYC4ke3BhcmFtcy5zbGlkZUNsYXNzfTpub3QoLiR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3N9KVtkYXRhLXN3aXBlci1zbGlkZS1pbmRleD1cIiR7cHJldlNsaWRlLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4Jyl9XCJdYCkuYWRkQ2xhc3MocGFyYW1zLnNsaWRlRHVwbGljYXRlUHJldkNsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc30uJHtwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzc31bZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XCIke3ByZXZTbGlkZS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpfVwiXWApLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZVByZXZDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3dpcGVyLmVtaXRTbGlkZXNDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQWN0aXZlSW5kZXgobmV3QWN0aXZlSW5kZXgpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB0cmFuc2xhdGUgPSBzd2lwZXIucnRsVHJhbnNsYXRlID8gc3dpcGVyLnRyYW5zbGF0ZSA6IC1zd2lwZXIudHJhbnNsYXRlO1xuICAgICAgY29uc3Qge1xuICAgICAgICBzbGlkZXNHcmlkLFxuICAgICAgICBzbmFwR3JpZCxcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBhY3RpdmVJbmRleDogcHJldmlvdXNJbmRleCxcbiAgICAgICAgcmVhbEluZGV4OiBwcmV2aW91c1JlYWxJbmRleCxcbiAgICAgICAgc25hcEluZGV4OiBwcmV2aW91c1NuYXBJbmRleFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGxldCBhY3RpdmVJbmRleCA9IG5ld0FjdGl2ZUluZGV4O1xuICAgICAgbGV0IHNuYXBJbmRleDtcblxuICAgICAgaWYgKHR5cGVvZiBhY3RpdmVJbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbGlkZXNHcmlkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzbGlkZXNHcmlkW2kgKyAxXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGlmICh0cmFuc2xhdGUgPj0gc2xpZGVzR3JpZFtpXSAmJiB0cmFuc2xhdGUgPCBzbGlkZXNHcmlkW2kgKyAxXSAtIChzbGlkZXNHcmlkW2kgKyAxXSAtIHNsaWRlc0dyaWRbaV0pIC8gMikge1xuICAgICAgICAgICAgICBhY3RpdmVJbmRleCA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRyYW5zbGF0ZSA+PSBzbGlkZXNHcmlkW2ldICYmIHRyYW5zbGF0ZSA8IHNsaWRlc0dyaWRbaSArIDFdKSB7XG4gICAgICAgICAgICAgIGFjdGl2ZUluZGV4ID0gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0cmFuc2xhdGUgPj0gc2xpZGVzR3JpZFtpXSkge1xuICAgICAgICAgICAgYWN0aXZlSW5kZXggPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSAvLyBOb3JtYWxpemUgc2xpZGVJbmRleFxuXG5cbiAgICAgICAgaWYgKHBhcmFtcy5ub3JtYWxpemVTbGlkZUluZGV4KSB7XG4gICAgICAgICAgaWYgKGFjdGl2ZUluZGV4IDwgMCB8fCB0eXBlb2YgYWN0aXZlSW5kZXggPT09ICd1bmRlZmluZWQnKSBhY3RpdmVJbmRleCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNuYXBHcmlkLmluZGV4T2YodHJhbnNsYXRlKSA+PSAwKSB7XG4gICAgICAgIHNuYXBJbmRleCA9IHNuYXBHcmlkLmluZGV4T2YodHJhbnNsYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHNraXAgPSBNYXRoLm1pbihwYXJhbXMuc2xpZGVzUGVyR3JvdXBTa2lwLCBhY3RpdmVJbmRleCk7XG4gICAgICAgIHNuYXBJbmRleCA9IHNraXAgKyBNYXRoLmZsb29yKChhY3RpdmVJbmRleCAtIHNraXApIC8gcGFyYW1zLnNsaWRlc1Blckdyb3VwKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNuYXBJbmRleCA+PSBzbmFwR3JpZC5sZW5ndGgpIHNuYXBJbmRleCA9IHNuYXBHcmlkLmxlbmd0aCAtIDE7XG5cbiAgICAgIGlmIChhY3RpdmVJbmRleCA9PT0gcHJldmlvdXNJbmRleCkge1xuICAgICAgICBpZiAoc25hcEluZGV4ICE9PSBwcmV2aW91c1NuYXBJbmRleCkge1xuICAgICAgICAgIHN3aXBlci5zbmFwSW5kZXggPSBzbmFwSW5kZXg7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ3NuYXBJbmRleENoYW5nZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBHZXQgcmVhbCBpbmRleFxuXG5cbiAgICAgIGNvbnN0IHJlYWxJbmRleCA9IHBhcnNlSW50KHN3aXBlci5zbGlkZXMuZXEoYWN0aXZlSW5kZXgpLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4JykgfHwgYWN0aXZlSW5kZXgsIDEwKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLCB7XG4gICAgICAgIHNuYXBJbmRleCxcbiAgICAgICAgcmVhbEluZGV4LFxuICAgICAgICBwcmV2aW91c0luZGV4LFxuICAgICAgICBhY3RpdmVJbmRleFxuICAgICAgfSk7XG4gICAgICBzd2lwZXIuZW1pdCgnYWN0aXZlSW5kZXhDaGFuZ2UnKTtcbiAgICAgIHN3aXBlci5lbWl0KCdzbmFwSW5kZXhDaGFuZ2UnKTtcblxuICAgICAgaWYgKHByZXZpb3VzUmVhbEluZGV4ICE9PSByZWFsSW5kZXgpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3JlYWxJbmRleENoYW5nZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3dpcGVyLmluaXRpYWxpemVkIHx8IHN3aXBlci5wYXJhbXMucnVuQ2FsbGJhY2tzT25Jbml0KSB7XG4gICAgICAgIHN3aXBlci5lbWl0KCdzbGlkZUNoYW5nZScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNsaWNrZWRTbGlkZShlKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcztcbiAgICAgIGNvbnN0IHNsaWRlID0gJCQxKGUpLmNsb3Nlc3QoYC4ke3BhcmFtcy5zbGlkZUNsYXNzfWApWzBdO1xuICAgICAgbGV0IHNsaWRlRm91bmQgPSBmYWxzZTtcbiAgICAgIGxldCBzbGlkZUluZGV4O1xuXG4gICAgICBpZiAoc2xpZGUpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzd2lwZXIuc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgaWYgKHN3aXBlci5zbGlkZXNbaV0gPT09IHNsaWRlKSB7XG4gICAgICAgICAgICBzbGlkZUZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzbGlkZSAmJiBzbGlkZUZvdW5kKSB7XG4gICAgICAgIHN3aXBlci5jbGlja2VkU2xpZGUgPSBzbGlkZTtcblxuICAgICAgICBpZiAoc3dpcGVyLnZpcnR1YWwgJiYgc3dpcGVyLnBhcmFtcy52aXJ0dWFsLmVuYWJsZWQpIHtcbiAgICAgICAgICBzd2lwZXIuY2xpY2tlZEluZGV4ID0gcGFyc2VJbnQoJCQxKHNsaWRlKS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpLCAxMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3dpcGVyLmNsaWNrZWRJbmRleCA9IHNsaWRlSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci5jbGlja2VkU2xpZGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHN3aXBlci5jbGlja2VkSW5kZXggPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5zbGlkZVRvQ2xpY2tlZFNsaWRlICYmIHN3aXBlci5jbGlja2VkSW5kZXggIT09IHVuZGVmaW5lZCAmJiBzd2lwZXIuY2xpY2tlZEluZGV4ICE9PSBzd2lwZXIuYWN0aXZlSW5kZXgpIHtcbiAgICAgICAgc3dpcGVyLnNsaWRlVG9DbGlja2VkU2xpZGUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdXBkYXRlID0ge1xuICAgICAgdXBkYXRlU2l6ZSxcbiAgICAgIHVwZGF0ZVNsaWRlcyxcbiAgICAgIHVwZGF0ZUF1dG9IZWlnaHQsXG4gICAgICB1cGRhdGVTbGlkZXNPZmZzZXQsXG4gICAgICB1cGRhdGVTbGlkZXNQcm9ncmVzcyxcbiAgICAgIHVwZGF0ZVByb2dyZXNzLFxuICAgICAgdXBkYXRlU2xpZGVzQ2xhc3NlcyxcbiAgICAgIHVwZGF0ZUFjdGl2ZUluZGV4LFxuICAgICAgdXBkYXRlQ2xpY2tlZFNsaWRlXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldFN3aXBlclRyYW5zbGF0ZShheGlzKSB7XG4gICAgICBpZiAoYXhpcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGF4aXMgPSB0aGlzLmlzSG9yaXpvbnRhbCgpID8gJ3gnIDogJ3knO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsLFxuICAgICAgICB0cmFuc2xhdGUsXG4gICAgICAgICR3cmFwcGVyRWxcbiAgICAgIH0gPSBzd2lwZXI7XG5cbiAgICAgIGlmIChwYXJhbXMudmlydHVhbFRyYW5zbGF0ZSkge1xuICAgICAgICByZXR1cm4gcnRsID8gLXRyYW5zbGF0ZSA6IHRyYW5zbGF0ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2xhdGU7XG4gICAgICB9XG5cbiAgICAgIGxldCBjdXJyZW50VHJhbnNsYXRlID0gZ2V0VHJhbnNsYXRlKCR3cmFwcGVyRWxbMF0sIGF4aXMpO1xuICAgICAgaWYgKHJ0bCkgY3VycmVudFRyYW5zbGF0ZSA9IC1jdXJyZW50VHJhbnNsYXRlO1xuICAgICAgcmV0dXJuIGN1cnJlbnRUcmFuc2xhdGUgfHwgMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRUcmFuc2xhdGUodHJhbnNsYXRlLCBieUNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgICR3cmFwcGVyRWwsXG4gICAgICAgIHdyYXBwZXJFbCxcbiAgICAgICAgcHJvZ3Jlc3NcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBsZXQgeCA9IDA7XG4gICAgICBsZXQgeSA9IDA7XG4gICAgICBjb25zdCB6ID0gMDtcblxuICAgICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgICB4ID0gcnRsID8gLXRyYW5zbGF0ZSA6IHRyYW5zbGF0ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHkgPSB0cmFuc2xhdGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMucm91bmRMZW5ndGhzKSB7XG4gICAgICAgIHggPSBNYXRoLmZsb29yKHgpO1xuICAgICAgICB5ID0gTWF0aC5mbG9vcih5KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIHdyYXBwZXJFbFtzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ10gPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAteCA6IC15O1xuICAgICAgfSBlbHNlIGlmICghcGFyYW1zLnZpcnR1YWxUcmFuc2xhdGUpIHtcbiAgICAgICAgJHdyYXBwZXJFbC50cmFuc2Zvcm0oYHRyYW5zbGF0ZTNkKCR7eH1weCwgJHt5fXB4LCAke3p9cHgpYCk7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5wcmV2aW91c1RyYW5zbGF0ZSA9IHN3aXBlci50cmFuc2xhdGU7XG4gICAgICBzd2lwZXIudHJhbnNsYXRlID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8geCA6IHk7IC8vIENoZWNrIGlmIHdlIG5lZWQgdG8gdXBkYXRlIHByb2dyZXNzXG5cbiAgICAgIGxldCBuZXdQcm9ncmVzcztcbiAgICAgIGNvbnN0IHRyYW5zbGF0ZXNEaWZmID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpIC0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpO1xuXG4gICAgICBpZiAodHJhbnNsYXRlc0RpZmYgPT09IDApIHtcbiAgICAgICAgbmV3UHJvZ3Jlc3MgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3UHJvZ3Jlc3MgPSAodHJhbnNsYXRlIC0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSAvIHRyYW5zbGF0ZXNEaWZmO1xuICAgICAgfVxuXG4gICAgICBpZiAobmV3UHJvZ3Jlc3MgIT09IHByb2dyZXNzKSB7XG4gICAgICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcyh0cmFuc2xhdGUpO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIuZW1pdCgnc2V0VHJhbnNsYXRlJywgc3dpcGVyLnRyYW5zbGF0ZSwgYnlDb250cm9sbGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtaW5UcmFuc2xhdGUoKSB7XG4gICAgICByZXR1cm4gLXRoaXMuc25hcEdyaWRbMF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF4VHJhbnNsYXRlKCkge1xuICAgICAgcmV0dXJuIC10aGlzLnNuYXBHcmlkW3RoaXMuc25hcEdyaWQubGVuZ3RoIC0gMV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlVG8odHJhbnNsYXRlLCBzcGVlZCwgcnVuQ2FsbGJhY2tzLCB0cmFuc2xhdGVCb3VuZHMsIGludGVybmFsKSB7XG4gICAgICBpZiAodHJhbnNsYXRlID09PSB2b2lkIDApIHtcbiAgICAgICAgdHJhbnNsYXRlID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHNwZWVkID09PSB2b2lkIDApIHtcbiAgICAgICAgc3BlZWQgPSB0aGlzLnBhcmFtcy5zcGVlZDtcbiAgICAgIH1cblxuICAgICAgaWYgKHJ1bkNhbGxiYWNrcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0cmFuc2xhdGVCb3VuZHMgPT09IHZvaWQgMCkge1xuICAgICAgICB0cmFuc2xhdGVCb3VuZHMgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHdyYXBwZXJFbFxuICAgICAgfSA9IHN3aXBlcjtcblxuICAgICAgaWYgKHN3aXBlci5hbmltYXRpbmcgJiYgcGFyYW1zLnByZXZlbnRJbnRlcmFjdGlvbk9uVHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1pblRyYW5zbGF0ZSA9IHN3aXBlci5taW5UcmFuc2xhdGUoKTtcbiAgICAgIGNvbnN0IG1heFRyYW5zbGF0ZSA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKTtcbiAgICAgIGxldCBuZXdUcmFuc2xhdGU7XG4gICAgICBpZiAodHJhbnNsYXRlQm91bmRzICYmIHRyYW5zbGF0ZSA+IG1pblRyYW5zbGF0ZSkgbmV3VHJhbnNsYXRlID0gbWluVHJhbnNsYXRlO2Vsc2UgaWYgKHRyYW5zbGF0ZUJvdW5kcyAmJiB0cmFuc2xhdGUgPCBtYXhUcmFuc2xhdGUpIG5ld1RyYW5zbGF0ZSA9IG1heFRyYW5zbGF0ZTtlbHNlIG5ld1RyYW5zbGF0ZSA9IHRyYW5zbGF0ZTsgLy8gVXBkYXRlIHByb2dyZXNzXG5cbiAgICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcyhuZXdUcmFuc2xhdGUpO1xuXG4gICAgICBpZiAocGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgY29uc3QgaXNIID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpO1xuXG4gICAgICAgIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICAgIHdyYXBwZXJFbFtpc0ggPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ10gPSAtbmV3VHJhbnNsYXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghc3dpcGVyLnN1cHBvcnQuc21vb3RoU2Nyb2xsKSB7XG4gICAgICAgICAgICBhbmltYXRlQ1NTTW9kZVNjcm9sbCh7XG4gICAgICAgICAgICAgIHN3aXBlcixcbiAgICAgICAgICAgICAgdGFyZ2V0UG9zaXRpb246IC1uZXdUcmFuc2xhdGUsXG4gICAgICAgICAgICAgIHNpZGU6IGlzSCA/ICdsZWZ0JyA6ICd0b3AnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdyYXBwZXJFbC5zY3JvbGxUbyh7XG4gICAgICAgICAgICBbaXNIID8gJ2xlZnQnIDogJ3RvcCddOiAtbmV3VHJhbnNsYXRlLFxuICAgICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKDApO1xuICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKG5ld1RyYW5zbGF0ZSk7XG5cbiAgICAgICAgaWYgKHJ1bkNhbGxiYWNrcykge1xuICAgICAgICAgIHN3aXBlci5lbWl0KCdiZWZvcmVUcmFuc2l0aW9uU3RhcnQnLCBzcGVlZCwgaW50ZXJuYWwpO1xuICAgICAgICAgIHN3aXBlci5lbWl0KCd0cmFuc2l0aW9uRW5kJyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKHNwZWVkKTtcbiAgICAgICAgc3dpcGVyLnNldFRyYW5zbGF0ZShuZXdUcmFuc2xhdGUpO1xuXG4gICAgICAgIGlmIChydW5DYWxsYmFja3MpIHtcbiAgICAgICAgICBzd2lwZXIuZW1pdCgnYmVmb3JlVHJhbnNpdGlvblN0YXJ0Jywgc3BlZWQsIGludGVybmFsKTtcbiAgICAgICAgICBzd2lwZXIuZW1pdCgndHJhbnNpdGlvblN0YXJ0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN3aXBlci5hbmltYXRpbmcpIHtcbiAgICAgICAgICBzd2lwZXIuYW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgICAgICAgIGlmICghc3dpcGVyLm9uVHJhbnNsYXRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCkge1xuICAgICAgICAgICAgc3dpcGVyLm9uVHJhbnNsYXRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25FbmQoZSkge1xuICAgICAgICAgICAgICBpZiAoIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkKSByZXR1cm47XG4gICAgICAgICAgICAgIGlmIChlLnRhcmdldCAhPT0gdGhpcykgcmV0dXJuO1xuICAgICAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgc3dpcGVyLm9uVHJhbnNsYXRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCk7XG4gICAgICAgICAgICAgIHN3aXBlci4kd3JhcHBlckVsWzBdLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdFRyYW5zaXRpb25FbmQnLCBzd2lwZXIub25UcmFuc2xhdGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICAgICAgc3dpcGVyLm9uVHJhbnNsYXRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCA9IG51bGw7XG4gICAgICAgICAgICAgIGRlbGV0ZSBzd2lwZXIub25UcmFuc2xhdGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kO1xuXG4gICAgICAgICAgICAgIGlmIChydW5DYWxsYmFja3MpIHtcbiAgICAgICAgICAgICAgICBzd2lwZXIuZW1pdCgndHJhbnNpdGlvbkVuZCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHN3aXBlci4kd3JhcHBlckVsWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBzd2lwZXIub25UcmFuc2xhdGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRUcmFuc2l0aW9uRW5kJywgc3dpcGVyLm9uVHJhbnNsYXRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHRyYW5zbGF0ZSA9IHtcbiAgICAgIGdldFRyYW5zbGF0ZTogZ2V0U3dpcGVyVHJhbnNsYXRlLFxuICAgICAgc2V0VHJhbnNsYXRlLFxuICAgICAgbWluVHJhbnNsYXRlLFxuICAgICAgbWF4VHJhbnNsYXRlLFxuICAgICAgdHJhbnNsYXRlVG9cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2V0VHJhbnNpdGlvbihkdXJhdGlvbiwgYnlDb250cm9sbGVyKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuXG4gICAgICBpZiAoIXN3aXBlci5wYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbC50cmFuc2l0aW9uKGR1cmF0aW9uKTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLmVtaXQoJ3NldFRyYW5zaXRpb24nLCBkdXJhdGlvbiwgYnlDb250cm9sbGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2l0aW9uRW1pdChfcmVmKSB7XG4gICAgICBsZXQge1xuICAgICAgICBzd2lwZXIsXG4gICAgICAgIHJ1bkNhbGxiYWNrcyxcbiAgICAgICAgZGlyZWN0aW9uLFxuICAgICAgICBzdGVwXG4gICAgICB9ID0gX3JlZjtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWN0aXZlSW5kZXgsXG4gICAgICAgIHByZXZpb3VzSW5kZXhcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBsZXQgZGlyID0gZGlyZWN0aW9uO1xuXG4gICAgICBpZiAoIWRpcikge1xuICAgICAgICBpZiAoYWN0aXZlSW5kZXggPiBwcmV2aW91c0luZGV4KSBkaXIgPSAnbmV4dCc7ZWxzZSBpZiAoYWN0aXZlSW5kZXggPCBwcmV2aW91c0luZGV4KSBkaXIgPSAncHJldic7ZWxzZSBkaXIgPSAncmVzZXQnO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIuZW1pdChgdHJhbnNpdGlvbiR7c3RlcH1gKTtcblxuICAgICAgaWYgKHJ1bkNhbGxiYWNrcyAmJiBhY3RpdmVJbmRleCAhPT0gcHJldmlvdXNJbmRleCkge1xuICAgICAgICBpZiAoZGlyID09PSAncmVzZXQnKSB7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoYHNsaWRlUmVzZXRUcmFuc2l0aW9uJHtzdGVwfWApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci5lbWl0KGBzbGlkZUNoYW5nZVRyYW5zaXRpb24ke3N0ZXB9YCk7XG5cbiAgICAgICAgaWYgKGRpciA9PT0gJ25leHQnKSB7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoYHNsaWRlTmV4dFRyYW5zaXRpb24ke3N0ZXB9YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoYHNsaWRlUHJldlRyYW5zaXRpb24ke3N0ZXB9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2l0aW9uU3RhcnQocnVuQ2FsbGJhY2tzLCBkaXJlY3Rpb24pIHtcbiAgICAgIGlmIChydW5DYWxsYmFja3MgPT09IHZvaWQgMCkge1xuICAgICAgICBydW5DYWxsYmFja3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXNcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBpZiAocGFyYW1zLmNzc01vZGUpIHJldHVybjtcblxuICAgICAgaWYgKHBhcmFtcy5hdXRvSGVpZ2h0KSB7XG4gICAgICAgIHN3aXBlci51cGRhdGVBdXRvSGVpZ2h0KCk7XG4gICAgICB9XG5cbiAgICAgIHRyYW5zaXRpb25FbWl0KHtcbiAgICAgICAgc3dpcGVyLFxuICAgICAgICBydW5DYWxsYmFja3MsXG4gICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgc3RlcDogJ1N0YXJ0J1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZChydW5DYWxsYmFja3MsIGRpcmVjdGlvbikge1xuICAgICAgaWYgKHJ1bkNhbGxiYWNrcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtc1xuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIHN3aXBlci5hbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgIGlmIChwYXJhbXMuY3NzTW9kZSkgcmV0dXJuO1xuICAgICAgc3dpcGVyLnNldFRyYW5zaXRpb24oMCk7XG4gICAgICB0cmFuc2l0aW9uRW1pdCh7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgcnVuQ2FsbGJhY2tzLFxuICAgICAgICBkaXJlY3Rpb24sXG4gICAgICAgIHN0ZXA6ICdFbmQnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgdHJhbnNpdGlvbiA9IHtcbiAgICAgIHNldFRyYW5zaXRpb24sXG4gICAgICB0cmFuc2l0aW9uU3RhcnQsXG4gICAgICB0cmFuc2l0aW9uRW5kXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNsaWRlVG8oaW5kZXgsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsLCBpbml0aWFsKSB7XG4gICAgICBpZiAoaW5kZXggPT09IHZvaWQgMCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChzcGVlZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHNwZWVkID0gdGhpcy5wYXJhbXMuc3BlZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChydW5DYWxsYmFja3MgPT09IHZvaWQgMCkge1xuICAgICAgICBydW5DYWxsYmFja3MgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJyAmJiB0eXBlb2YgaW5kZXggIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlICdpbmRleCcgYXJndW1lbnQgY2Fubm90IGhhdmUgdHlwZSBvdGhlciB0aGFuICdudW1iZXInIG9yICdzdHJpbmcnLiBbJHt0eXBlb2YgaW5kZXh9XSBnaXZlbi5gKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBgaW5kZXhgIGFyZ3VtZW50IGNvbnZlcnRlZCBmcm9tIGBzdHJpbmdgIHRvIGBudW1iZXJgLlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaW5kZXhBc051bWJlciA9IHBhcnNlSW50KGluZGV4LCAxMCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGBpbmRleGAgYXJndW1lbnQgaXMgYSB2YWxpZCBgbnVtYmVyYFxuICAgICAgICAgKiBhZnRlciBiZWluZyBjb252ZXJ0ZWQgZnJvbSB0aGUgYHN0cmluZ2AgdHlwZS5cbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqL1xuXG4gICAgICAgIGNvbnN0IGlzVmFsaWROdW1iZXIgPSBpc0Zpbml0ZShpbmRleEFzTnVtYmVyKTtcblxuICAgICAgICBpZiAoIWlzVmFsaWROdW1iZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwYXNzZWQtaW4gJ2luZGV4JyAoc3RyaW5nKSBjb3VsZG4ndCBiZSBjb252ZXJ0ZWQgdG8gJ251bWJlcicuIFske2luZGV4fV0gZ2l2ZW4uYCk7XG4gICAgICAgIH0gLy8gS25vd2luZyB0aGF0IHRoZSBjb252ZXJ0ZWQgYGluZGV4YCBpcyBhIHZhbGlkIG51bWJlcixcbiAgICAgICAgLy8gd2UgY2FuIHVwZGF0ZSB0aGUgb3JpZ2luYWwgYXJndW1lbnQncyB2YWx1ZS5cblxuXG4gICAgICAgIGluZGV4ID0gaW5kZXhBc051bWJlcjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGxldCBzbGlkZUluZGV4ID0gaW5kZXg7XG4gICAgICBpZiAoc2xpZGVJbmRleCA8IDApIHNsaWRlSW5kZXggPSAwO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHNuYXBHcmlkLFxuICAgICAgICBzbGlkZXNHcmlkLFxuICAgICAgICBwcmV2aW91c0luZGV4LFxuICAgICAgICBhY3RpdmVJbmRleCxcbiAgICAgICAgcnRsVHJhbnNsYXRlOiBydGwsXG4gICAgICAgIHdyYXBwZXJFbCxcbiAgICAgICAgZW5hYmxlZFxuICAgICAgfSA9IHN3aXBlcjtcblxuICAgICAgaWYgKHN3aXBlci5hbmltYXRpbmcgJiYgcGFyYW1zLnByZXZlbnRJbnRlcmFjdGlvbk9uVHJhbnNpdGlvbiB8fCAhZW5hYmxlZCAmJiAhaW50ZXJuYWwgJiYgIWluaXRpYWwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBza2lwID0gTWF0aC5taW4oc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cFNraXAsIHNsaWRlSW5kZXgpO1xuICAgICAgbGV0IHNuYXBJbmRleCA9IHNraXAgKyBNYXRoLmZsb29yKChzbGlkZUluZGV4IC0gc2tpcCkgLyBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwKTtcbiAgICAgIGlmIChzbmFwSW5kZXggPj0gc25hcEdyaWQubGVuZ3RoKSBzbmFwSW5kZXggPSBzbmFwR3JpZC5sZW5ndGggLSAxO1xuXG4gICAgICBpZiAoKGFjdGl2ZUluZGV4IHx8IHBhcmFtcy5pbml0aWFsU2xpZGUgfHwgMCkgPT09IChwcmV2aW91c0luZGV4IHx8IDApICYmIHJ1bkNhbGxiYWNrcykge1xuICAgICAgICBzd2lwZXIuZW1pdCgnYmVmb3JlU2xpZGVDaGFuZ2VTdGFydCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0cmFuc2xhdGUgPSAtc25hcEdyaWRbc25hcEluZGV4XTsgLy8gVXBkYXRlIHByb2dyZXNzXG5cbiAgICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcyh0cmFuc2xhdGUpOyAvLyBOb3JtYWxpemUgc2xpZGVJbmRleFxuXG4gICAgICBpZiAocGFyYW1zLm5vcm1hbGl6ZVNsaWRlSW5kZXgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzbGlkZXNHcmlkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFRyYW5zbGF0ZSA9IC1NYXRoLmZsb29yKHRyYW5zbGF0ZSAqIDEwMCk7XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZEdyaWQgPSBNYXRoLmZsb29yKHNsaWRlc0dyaWRbaV0gKiAxMDApO1xuICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRHcmlkTmV4dCA9IE1hdGguZmxvb3Ioc2xpZGVzR3JpZFtpICsgMV0gKiAxMDApO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBzbGlkZXNHcmlkW2kgKyAxXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGlmIChub3JtYWxpemVkVHJhbnNsYXRlID49IG5vcm1hbGl6ZWRHcmlkICYmIG5vcm1hbGl6ZWRUcmFuc2xhdGUgPCBub3JtYWxpemVkR3JpZE5leHQgLSAobm9ybWFsaXplZEdyaWROZXh0IC0gbm9ybWFsaXplZEdyaWQpIC8gMikge1xuICAgICAgICAgICAgICBzbGlkZUluZGV4ID0gaTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9ybWFsaXplZFRyYW5zbGF0ZSA+PSBub3JtYWxpemVkR3JpZCAmJiBub3JtYWxpemVkVHJhbnNsYXRlIDwgbm9ybWFsaXplZEdyaWROZXh0KSB7XG4gICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKG5vcm1hbGl6ZWRUcmFuc2xhdGUgPj0gbm9ybWFsaXplZEdyaWQpIHtcbiAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSAvLyBEaXJlY3Rpb25zIGxvY2tzXG5cblxuICAgICAgaWYgKHN3aXBlci5pbml0aWFsaXplZCAmJiBzbGlkZUluZGV4ICE9PSBhY3RpdmVJbmRleCkge1xuICAgICAgICBpZiAoIXN3aXBlci5hbGxvd1NsaWRlTmV4dCAmJiB0cmFuc2xhdGUgPCBzd2lwZXIudHJhbnNsYXRlICYmIHRyYW5zbGF0ZSA8IHN3aXBlci5taW5UcmFuc2xhdGUoKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3dpcGVyLmFsbG93U2xpZGVQcmV2ICYmIHRyYW5zbGF0ZSA+IHN3aXBlci50cmFuc2xhdGUgJiYgdHJhbnNsYXRlID4gc3dpcGVyLm1heFRyYW5zbGF0ZSgpKSB7XG4gICAgICAgICAgaWYgKChhY3RpdmVJbmRleCB8fCAwKSAhPT0gc2xpZGVJbmRleCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCBkaXJlY3Rpb247XG4gICAgICBpZiAoc2xpZGVJbmRleCA+IGFjdGl2ZUluZGV4KSBkaXJlY3Rpb24gPSAnbmV4dCc7ZWxzZSBpZiAoc2xpZGVJbmRleCA8IGFjdGl2ZUluZGV4KSBkaXJlY3Rpb24gPSAncHJldic7ZWxzZSBkaXJlY3Rpb24gPSAncmVzZXQnOyAvLyBVcGRhdGUgSW5kZXhcblxuICAgICAgaWYgKHJ0bCAmJiAtdHJhbnNsYXRlID09PSBzd2lwZXIudHJhbnNsYXRlIHx8ICFydGwgJiYgdHJhbnNsYXRlID09PSBzd2lwZXIudHJhbnNsYXRlKSB7XG4gICAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleChzbGlkZUluZGV4KTsgLy8gVXBkYXRlIEhlaWdodFxuXG4gICAgICAgIGlmIChwYXJhbXMuYXV0b0hlaWdodCkge1xuICAgICAgICAgIHN3aXBlci51cGRhdGVBdXRvSGVpZ2h0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuXG4gICAgICAgIGlmIChwYXJhbXMuZWZmZWN0ICE9PSAnc2xpZGUnKSB7XG4gICAgICAgICAgc3dpcGVyLnNldFRyYW5zbGF0ZSh0cmFuc2xhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiAhPT0gJ3Jlc2V0Jykge1xuICAgICAgICAgIHN3aXBlci50cmFuc2l0aW9uU3RhcnQocnVuQ2FsbGJhY2tzLCBkaXJlY3Rpb24pO1xuICAgICAgICAgIHN3aXBlci50cmFuc2l0aW9uRW5kKHJ1bkNhbGxiYWNrcywgZGlyZWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIGNvbnN0IGlzSCA9IHN3aXBlci5pc0hvcml6b250YWwoKTtcbiAgICAgICAgY29uc3QgdCA9IHJ0bCA/IHRyYW5zbGF0ZSA6IC10cmFuc2xhdGU7XG5cbiAgICAgICAgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgICAgY29uc3QgaXNWaXJ0dWFsID0gc3dpcGVyLnZpcnR1YWwgJiYgc3dpcGVyLnBhcmFtcy52aXJ0dWFsLmVuYWJsZWQ7XG5cbiAgICAgICAgICBpZiAoaXNWaXJ0dWFsKSB7XG4gICAgICAgICAgICBzd2lwZXIud3JhcHBlckVsLnN0eWxlLnNjcm9sbFNuYXBUeXBlID0gJ25vbmUnO1xuICAgICAgICAgICAgc3dpcGVyLl9pbW1lZGlhdGVWaXJ0dWFsID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3cmFwcGVyRWxbaXNIID8gJ3Njcm9sbExlZnQnIDogJ3Njcm9sbFRvcCddID0gdDtcblxuICAgICAgICAgIGlmIChpc1ZpcnR1YWwpIHtcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICAgIHN3aXBlci53cmFwcGVyRWwuc3R5bGUuc2Nyb2xsU25hcFR5cGUgPSAnJztcbiAgICAgICAgICAgICAgc3dpcGVyLl9zd2lwZXJJbW1lZGlhdGVWaXJ0dWFsID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFzd2lwZXIuc3VwcG9ydC5zbW9vdGhTY3JvbGwpIHtcbiAgICAgICAgICAgIGFuaW1hdGVDU1NNb2RlU2Nyb2xsKHtcbiAgICAgICAgICAgICAgc3dpcGVyLFxuICAgICAgICAgICAgICB0YXJnZXRQb3NpdGlvbjogdCxcbiAgICAgICAgICAgICAgc2lkZTogaXNIID8gJ2xlZnQnIDogJ3RvcCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd3JhcHBlckVsLnNjcm9sbFRvKHtcbiAgICAgICAgICAgIFtpc0ggPyAnbGVmdCcgOiAndG9wJ106IHQsXG4gICAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIuc2V0VHJhbnNpdGlvbihzcGVlZCk7XG4gICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKHRyYW5zbGF0ZSk7XG4gICAgICBzd2lwZXIudXBkYXRlQWN0aXZlSW5kZXgoc2xpZGVJbmRleCk7XG4gICAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuICAgICAgc3dpcGVyLmVtaXQoJ2JlZm9yZVRyYW5zaXRpb25TdGFydCcsIHNwZWVkLCBpbnRlcm5hbCk7XG4gICAgICBzd2lwZXIudHJhbnNpdGlvblN0YXJ0KHJ1bkNhbGxiYWNrcywgZGlyZWN0aW9uKTtcblxuICAgICAgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgIHN3aXBlci50cmFuc2l0aW9uRW5kKHJ1bkNhbGxiYWNrcywgZGlyZWN0aW9uKTtcbiAgICAgIH0gZWxzZSBpZiAoIXN3aXBlci5hbmltYXRpbmcpIHtcbiAgICAgICAgc3dpcGVyLmFuaW1hdGluZyA9IHRydWU7XG5cbiAgICAgICAgaWYgKCFzd2lwZXIub25TbGlkZVRvV3JhcHBlclRyYW5zaXRpb25FbmQpIHtcbiAgICAgICAgICBzd2lwZXIub25TbGlkZVRvV3JhcHBlclRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKGUpIHtcbiAgICAgICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldCAhPT0gdGhpcykgcmV0dXJuO1xuICAgICAgICAgICAgc3dpcGVyLiR3cmFwcGVyRWxbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHN3aXBlci5vblNsaWRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCk7XG4gICAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJraXRUcmFuc2l0aW9uRW5kJywgc3dpcGVyLm9uU2xpZGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICAgIHN3aXBlci5vblNsaWRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCA9IG51bGw7XG4gICAgICAgICAgICBkZWxldGUgc3dpcGVyLm9uU2xpZGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kO1xuICAgICAgICAgICAgc3dpcGVyLnRyYW5zaXRpb25FbmQocnVuQ2FsbGJhY2tzLCBkaXJlY3Rpb24pO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgc3dpcGVyLm9uU2xpZGVUb1dyYXBwZXJUcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgc3dpcGVyLiR3cmFwcGVyRWxbMF0uYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0VHJhbnNpdGlvbkVuZCcsIHN3aXBlci5vblNsaWRlVG9XcmFwcGVyVHJhbnNpdGlvbkVuZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNsaWRlVG9Mb29wKGluZGV4LCBzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCkge1xuICAgICAgaWYgKGluZGV4ID09PSB2b2lkIDApIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3BlZWQgPT09IHZvaWQgMCkge1xuICAgICAgICBzcGVlZCA9IHRoaXMucGFyYW1zLnNwZWVkO1xuICAgICAgfVxuXG4gICAgICBpZiAocnVuQ2FsbGJhY2tzID09PSB2b2lkIDApIHtcbiAgICAgICAgcnVuQ2FsbGJhY2tzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpbmRleCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBgaW5kZXhgIGFyZ3VtZW50IGNvbnZlcnRlZCBmcm9tIGBzdHJpbmdgIHRvIGBudW1iZXJgLlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgaW5kZXhBc051bWJlciA9IHBhcnNlSW50KGluZGV4LCAxMCk7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGBpbmRleGAgYXJndW1lbnQgaXMgYSB2YWxpZCBgbnVtYmVyYFxuICAgICAgICAgKiBhZnRlciBiZWluZyBjb252ZXJ0ZWQgZnJvbSB0aGUgYHN0cmluZ2AgdHlwZS5cbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqL1xuXG4gICAgICAgIGNvbnN0IGlzVmFsaWROdW1iZXIgPSBpc0Zpbml0ZShpbmRleEFzTnVtYmVyKTtcblxuICAgICAgICBpZiAoIWlzVmFsaWROdW1iZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwYXNzZWQtaW4gJ2luZGV4JyAoc3RyaW5nKSBjb3VsZG4ndCBiZSBjb252ZXJ0ZWQgdG8gJ251bWJlcicuIFske2luZGV4fV0gZ2l2ZW4uYCk7XG4gICAgICAgIH0gLy8gS25vd2luZyB0aGF0IHRoZSBjb252ZXJ0ZWQgYGluZGV4YCBpcyBhIHZhbGlkIG51bWJlcixcbiAgICAgICAgLy8gd2UgY2FuIHVwZGF0ZSB0aGUgb3JpZ2luYWwgYXJndW1lbnQncyB2YWx1ZS5cblxuXG4gICAgICAgIGluZGV4ID0gaW5kZXhBc051bWJlcjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGxldCBuZXdJbmRleCA9IGluZGV4O1xuXG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgIG5ld0luZGV4ICs9IHN3aXBlci5sb29wZWRTbGlkZXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzd2lwZXIuc2xpZGVUbyhuZXdJbmRleCwgc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpO1xuICAgIH1cblxuICAgIC8qIGVzbGludCBuby11bnVzZWQtdmFyczogXCJvZmZcIiAqL1xuICAgIGZ1bmN0aW9uIHNsaWRlTmV4dChzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCkge1xuICAgICAgaWYgKHNwZWVkID09PSB2b2lkIDApIHtcbiAgICAgICAgc3BlZWQgPSB0aGlzLnBhcmFtcy5zcGVlZDtcbiAgICAgIH1cblxuICAgICAgaWYgKHJ1bkNhbGxiYWNrcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHJ1bkNhbGxiYWNrcyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGFuaW1hdGluZyxcbiAgICAgICAgZW5hYmxlZCxcbiAgICAgICAgcGFyYW1zXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgaWYgKCFlbmFibGVkKSByZXR1cm4gc3dpcGVyO1xuICAgICAgbGV0IHBlckdyb3VwID0gcGFyYW1zLnNsaWRlc1Blckdyb3VwO1xuXG4gICAgICBpZiAocGFyYW1zLnNsaWRlc1BlclZpZXcgPT09ICdhdXRvJyAmJiBwYXJhbXMuc2xpZGVzUGVyR3JvdXAgPT09IDEgJiYgcGFyYW1zLnNsaWRlc1Blckdyb3VwQXV0bykge1xuICAgICAgICBwZXJHcm91cCA9IE1hdGgubWF4KHN3aXBlci5zbGlkZXNQZXJWaWV3RHluYW1pYygnY3VycmVudCcsIHRydWUpLCAxKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW5jcmVtZW50ID0gc3dpcGVyLmFjdGl2ZUluZGV4IDwgcGFyYW1zLnNsaWRlc1Blckdyb3VwU2tpcCA/IDEgOiBwZXJHcm91cDtcblxuICAgICAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgICAgIGlmIChhbmltYXRpbmcgJiYgcGFyYW1zLmxvb3BQcmV2ZW50c1NsaWRlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHN3aXBlci5sb29wRml4KCk7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuXG4gICAgICAgIHN3aXBlci5fY2xpZW50TGVmdCA9IHN3aXBlci4kd3JhcHBlckVsWzBdLmNsaWVudExlZnQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMucmV3aW5kICYmIHN3aXBlci5pc0VuZCkge1xuICAgICAgICByZXR1cm4gc3dpcGVyLnNsaWRlVG8oMCwgc3BlZWQsIHJ1bkNhbGxiYWNrcywgaW50ZXJuYWwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3dpcGVyLnNsaWRlVG8oc3dpcGVyLmFjdGl2ZUluZGV4ICsgaW5jcmVtZW50LCBzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50IG5vLXVudXNlZC12YXJzOiBcIm9mZlwiICovXG4gICAgZnVuY3Rpb24gc2xpZGVQcmV2KHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKSB7XG4gICAgICBpZiAoc3BlZWQgPT09IHZvaWQgMCkge1xuICAgICAgICBzcGVlZCA9IHRoaXMucGFyYW1zLnNwZWVkO1xuICAgICAgfVxuXG4gICAgICBpZiAocnVuQ2FsbGJhY2tzID09PSB2b2lkIDApIHtcbiAgICAgICAgcnVuQ2FsbGJhY2tzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBhbmltYXRpbmcsXG4gICAgICAgIHNuYXBHcmlkLFxuICAgICAgICBzbGlkZXNHcmlkLFxuICAgICAgICBydGxUcmFuc2xhdGUsXG4gICAgICAgIGVuYWJsZWRcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBpZiAoIWVuYWJsZWQpIHJldHVybiBzd2lwZXI7XG5cbiAgICAgIGlmIChwYXJhbXMubG9vcCkge1xuICAgICAgICBpZiAoYW5pbWF0aW5nICYmIHBhcmFtcy5sb29wUHJldmVudHNTbGlkZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBzd2lwZXIubG9vcEZpeCgpOyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcblxuICAgICAgICBzd2lwZXIuX2NsaWVudExlZnQgPSBzd2lwZXIuJHdyYXBwZXJFbFswXS5jbGllbnRMZWZ0O1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0cmFuc2xhdGUgPSBydGxUcmFuc2xhdGUgPyBzd2lwZXIudHJhbnNsYXRlIDogLXN3aXBlci50cmFuc2xhdGU7XG5cbiAgICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZSh2YWwpIHtcbiAgICAgICAgaWYgKHZhbCA8IDApIHJldHVybiAtTWF0aC5mbG9vcihNYXRoLmFicyh2YWwpKTtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodmFsKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgbm9ybWFsaXplZFRyYW5zbGF0ZSA9IG5vcm1hbGl6ZSh0cmFuc2xhdGUpO1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFNuYXBHcmlkID0gc25hcEdyaWQubWFwKHZhbCA9PiBub3JtYWxpemUodmFsKSk7XG4gICAgICBsZXQgcHJldlNuYXAgPSBzbmFwR3JpZFtub3JtYWxpemVkU25hcEdyaWQuaW5kZXhPZihub3JtYWxpemVkVHJhbnNsYXRlKSAtIDFdO1xuXG4gICAgICBpZiAodHlwZW9mIHByZXZTbmFwID09PSAndW5kZWZpbmVkJyAmJiBwYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICBsZXQgcHJldlNuYXBJbmRleDtcbiAgICAgICAgc25hcEdyaWQuZm9yRWFjaCgoc25hcCwgc25hcEluZGV4KSA9PiB7XG4gICAgICAgICAgaWYgKG5vcm1hbGl6ZWRUcmFuc2xhdGUgPj0gc25hcCkge1xuICAgICAgICAgICAgLy8gcHJldlNuYXAgPSBzbmFwO1xuICAgICAgICAgICAgcHJldlNuYXBJbmRleCA9IHNuYXBJbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh0eXBlb2YgcHJldlNuYXBJbmRleCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBwcmV2U25hcCA9IHNuYXBHcmlkW3ByZXZTbmFwSW5kZXggPiAwID8gcHJldlNuYXBJbmRleCAtIDEgOiBwcmV2U25hcEluZGV4XTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZXQgcHJldkluZGV4ID0gMDtcblxuICAgICAgaWYgKHR5cGVvZiBwcmV2U25hcCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcHJldkluZGV4ID0gc2xpZGVzR3JpZC5pbmRleE9mKHByZXZTbmFwKTtcbiAgICAgICAgaWYgKHByZXZJbmRleCA8IDApIHByZXZJbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleCAtIDE7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5zbGlkZXNQZXJWaWV3ID09PSAnYXV0bycgJiYgcGFyYW1zLnNsaWRlc1Blckdyb3VwID09PSAxICYmIHBhcmFtcy5zbGlkZXNQZXJHcm91cEF1dG8pIHtcbiAgICAgICAgICBwcmV2SW5kZXggPSBwcmV2SW5kZXggLSBzd2lwZXIuc2xpZGVzUGVyVmlld0R5bmFtaWMoJ3ByZXZpb3VzJywgdHJ1ZSkgKyAxO1xuICAgICAgICAgIHByZXZJbmRleCA9IE1hdGgubWF4KHByZXZJbmRleCwgMCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5yZXdpbmQgJiYgc3dpcGVyLmlzQmVnaW5uaW5nKSB7XG4gICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHN3aXBlci5wYXJhbXMudmlydHVhbCAmJiBzd2lwZXIucGFyYW1zLnZpcnR1YWwuZW5hYmxlZCAmJiBzd2lwZXIudmlydHVhbCA/IHN3aXBlci52aXJ0dWFsLnNsaWRlcy5sZW5ndGggLSAxIDogc3dpcGVyLnNsaWRlcy5sZW5ndGggLSAxO1xuICAgICAgICByZXR1cm4gc3dpcGVyLnNsaWRlVG8obGFzdEluZGV4LCBzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzd2lwZXIuc2xpZGVUbyhwcmV2SW5kZXgsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKTtcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQgbm8tdW51c2VkLXZhcnM6IFwib2ZmXCIgKi9cbiAgICBmdW5jdGlvbiBzbGlkZVJlc2V0KHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKSB7XG4gICAgICBpZiAoc3BlZWQgPT09IHZvaWQgMCkge1xuICAgICAgICBzcGVlZCA9IHRoaXMucGFyYW1zLnNwZWVkO1xuICAgICAgfVxuXG4gICAgICBpZiAocnVuQ2FsbGJhY2tzID09PSB2b2lkIDApIHtcbiAgICAgICAgcnVuQ2FsbGJhY2tzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIHJldHVybiBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXgsIHNwZWVkLCBydW5DYWxsYmFja3MsIGludGVybmFsKTtcbiAgICB9XG5cbiAgICAvKiBlc2xpbnQgbm8tdW51c2VkLXZhcnM6IFwib2ZmXCIgKi9cbiAgICBmdW5jdGlvbiBzbGlkZVRvQ2xvc2VzdChzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCwgdGhyZXNob2xkKSB7XG4gICAgICBpZiAoc3BlZWQgPT09IHZvaWQgMCkge1xuICAgICAgICBzcGVlZCA9IHRoaXMucGFyYW1zLnNwZWVkO1xuICAgICAgfVxuXG4gICAgICBpZiAocnVuQ2FsbGJhY2tzID09PSB2b2lkIDApIHtcbiAgICAgICAgcnVuQ2FsbGJhY2tzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRocmVzaG9sZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHRocmVzaG9sZCA9IDAuNTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGxldCBpbmRleCA9IHN3aXBlci5hY3RpdmVJbmRleDtcbiAgICAgIGNvbnN0IHNraXAgPSBNYXRoLm1pbihzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwU2tpcCwgaW5kZXgpO1xuICAgICAgY29uc3Qgc25hcEluZGV4ID0gc2tpcCArIE1hdGguZmxvb3IoKGluZGV4IC0gc2tpcCkgLyBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwKTtcbiAgICAgIGNvbnN0IHRyYW5zbGF0ZSA9IHN3aXBlci5ydGxUcmFuc2xhdGUgPyBzd2lwZXIudHJhbnNsYXRlIDogLXN3aXBlci50cmFuc2xhdGU7XG5cbiAgICAgIGlmICh0cmFuc2xhdGUgPj0gc3dpcGVyLnNuYXBHcmlkW3NuYXBJbmRleF0pIHtcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgdHJhbnNsYXRlIGlzIG9uIG9yIGFmdGVyIHRoZSBjdXJyZW50IHNuYXAgaW5kZXgsIHNvIHRoZSBjaG9pY2VcbiAgICAgICAgLy8gaXMgYmV0d2VlbiB0aGUgY3VycmVudCBpbmRleCBhbmQgdGhlIG9uZSBhZnRlciBpdC5cbiAgICAgICAgY29uc3QgY3VycmVudFNuYXAgPSBzd2lwZXIuc25hcEdyaWRbc25hcEluZGV4XTtcbiAgICAgICAgY29uc3QgbmV4dFNuYXAgPSBzd2lwZXIuc25hcEdyaWRbc25hcEluZGV4ICsgMV07XG5cbiAgICAgICAgaWYgKHRyYW5zbGF0ZSAtIGN1cnJlbnRTbmFwID4gKG5leHRTbmFwIC0gY3VycmVudFNuYXApICogdGhyZXNob2xkKSB7XG4gICAgICAgICAgaW5kZXggKz0gc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgdHJhbnNsYXRlIGlzIGJlZm9yZSB0aGUgY3VycmVudCBzbmFwIGluZGV4LCBzbyB0aGUgY2hvaWNlXG4gICAgICAgIC8vIGlzIGJldHdlZW4gdGhlIGN1cnJlbnQgaW5kZXggYW5kIHRoZSBvbmUgYmVmb3JlIGl0LlxuICAgICAgICBjb25zdCBwcmV2U25hcCA9IHN3aXBlci5zbmFwR3JpZFtzbmFwSW5kZXggLSAxXTtcbiAgICAgICAgY29uc3QgY3VycmVudFNuYXAgPSBzd2lwZXIuc25hcEdyaWRbc25hcEluZGV4XTtcblxuICAgICAgICBpZiAodHJhbnNsYXRlIC0gcHJldlNuYXAgPD0gKGN1cnJlbnRTbmFwIC0gcHJldlNuYXApICogdGhyZXNob2xkKSB7XG4gICAgICAgICAgaW5kZXggLT0gc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbmRleCA9IE1hdGgubWF4KGluZGV4LCAwKTtcbiAgICAgIGluZGV4ID0gTWF0aC5taW4oaW5kZXgsIHN3aXBlci5zbGlkZXNHcmlkLmxlbmd0aCAtIDEpO1xuICAgICAgcmV0dXJuIHN3aXBlci5zbGlkZVRvKGluZGV4LCBzcGVlZCwgcnVuQ2FsbGJhY2tzLCBpbnRlcm5hbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2xpZGVUb0NsaWNrZWRTbGlkZSgpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgJHdyYXBwZXJFbFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGNvbnN0IHNsaWRlc1BlclZpZXcgPSBwYXJhbXMuc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nID8gc3dpcGVyLnNsaWRlc1BlclZpZXdEeW5hbWljKCkgOiBwYXJhbXMuc2xpZGVzUGVyVmlldztcbiAgICAgIGxldCBzbGlkZVRvSW5kZXggPSBzd2lwZXIuY2xpY2tlZEluZGV4O1xuICAgICAgbGV0IHJlYWxJbmRleDtcblxuICAgICAgaWYgKHBhcmFtcy5sb29wKSB7XG4gICAgICAgIGlmIChzd2lwZXIuYW5pbWF0aW5nKSByZXR1cm47XG4gICAgICAgIHJlYWxJbmRleCA9IHBhcnNlSW50KCQkMShzd2lwZXIuY2xpY2tlZFNsaWRlKS5hdHRyKCdkYXRhLXN3aXBlci1zbGlkZS1pbmRleCcpLCAxMCk7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5jZW50ZXJlZFNsaWRlcykge1xuICAgICAgICAgIGlmIChzbGlkZVRvSW5kZXggPCBzd2lwZXIubG9vcGVkU2xpZGVzIC0gc2xpZGVzUGVyVmlldyAvIDIgfHwgc2xpZGVUb0luZGV4ID4gc3dpcGVyLnNsaWRlcy5sZW5ndGggLSBzd2lwZXIubG9vcGVkU2xpZGVzICsgc2xpZGVzUGVyVmlldyAvIDIpIHtcbiAgICAgICAgICAgIHN3aXBlci5sb29wRml4KCk7XG4gICAgICAgICAgICBzbGlkZVRvSW5kZXggPSAkd3JhcHBlckVsLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc31bZGF0YS1zd2lwZXItc2xpZGUtaW5kZXg9XCIke3JlYWxJbmRleH1cIl06bm90KC4ke3BhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzfSlgKS5lcSgwKS5pbmRleCgpO1xuICAgICAgICAgICAgbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhzbGlkZVRvSW5kZXgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHNsaWRlVG9JbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNsaWRlVG9JbmRleCA+IHN3aXBlci5zbGlkZXMubGVuZ3RoIC0gc2xpZGVzUGVyVmlldykge1xuICAgICAgICAgIHN3aXBlci5sb29wRml4KCk7XG4gICAgICAgICAgc2xpZGVUb0luZGV4ID0gJHdyYXBwZXJFbC5jaGlsZHJlbihgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9W2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4PVwiJHtyZWFsSW5kZXh9XCJdOm5vdCguJHtwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzc30pYCkuZXEoMCkuaW5kZXgoKTtcbiAgICAgICAgICBuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhzbGlkZVRvSW5kZXgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHNsaWRlVG9JbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlci5zbGlkZVRvKHNsaWRlVG9JbmRleCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNsaWRlID0ge1xuICAgICAgc2xpZGVUbyxcbiAgICAgIHNsaWRlVG9Mb29wLFxuICAgICAgc2xpZGVOZXh0LFxuICAgICAgc2xpZGVQcmV2LFxuICAgICAgc2xpZGVSZXNldCxcbiAgICAgIHNsaWRlVG9DbG9zZXN0LFxuICAgICAgc2xpZGVUb0NsaWNrZWRTbGlkZVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsb29wQ3JlYXRlKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICAkd3JhcHBlckVsXG4gICAgICB9ID0gc3dpcGVyOyAvLyBSZW1vdmUgZHVwbGljYXRlZCBzbGlkZXNcblxuICAgICAgY29uc3QgJHNlbGVjdG9yID0gJHdyYXBwZXJFbC5jaGlsZHJlbigpLmxlbmd0aCA+IDAgPyAkJDEoJHdyYXBwZXJFbC5jaGlsZHJlbigpWzBdLnBhcmVudE5vZGUpIDogJHdyYXBwZXJFbDtcbiAgICAgICRzZWxlY3Rvci5jaGlsZHJlbihgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9LiR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3N9YCkucmVtb3ZlKCk7XG4gICAgICBsZXQgc2xpZGVzID0gJHNlbGVjdG9yLmNoaWxkcmVuKGAuJHtwYXJhbXMuc2xpZGVDbGFzc31gKTtcblxuICAgICAgaWYgKHBhcmFtcy5sb29wRmlsbEdyb3VwV2l0aEJsYW5rKSB7XG4gICAgICAgIGNvbnN0IGJsYW5rU2xpZGVzTnVtID0gcGFyYW1zLnNsaWRlc1Blckdyb3VwIC0gc2xpZGVzLmxlbmd0aCAlIHBhcmFtcy5zbGlkZXNQZXJHcm91cDtcblxuICAgICAgICBpZiAoYmxhbmtTbGlkZXNOdW0gIT09IHBhcmFtcy5zbGlkZXNQZXJHcm91cCkge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmxhbmtTbGlkZXNOdW07IGkgKz0gMSkge1xuICAgICAgICAgICAgY29uc3QgYmxhbmtOb2RlID0gJCQxKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKS5hZGRDbGFzcyhgJHtwYXJhbXMuc2xpZGVDbGFzc30gJHtwYXJhbXMuc2xpZGVCbGFua0NsYXNzfWApO1xuICAgICAgICAgICAgJHNlbGVjdG9yLmFwcGVuZChibGFua05vZGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNsaWRlcyA9ICRzZWxlY3Rvci5jaGlsZHJlbihgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5zbGlkZXNQZXJWaWV3ID09PSAnYXV0bycgJiYgIXBhcmFtcy5sb29wZWRTbGlkZXMpIHBhcmFtcy5sb29wZWRTbGlkZXMgPSBzbGlkZXMubGVuZ3RoO1xuICAgICAgc3dpcGVyLmxvb3BlZFNsaWRlcyA9IE1hdGguY2VpbChwYXJzZUZsb2F0KHBhcmFtcy5sb29wZWRTbGlkZXMgfHwgcGFyYW1zLnNsaWRlc1BlclZpZXcsIDEwKSk7XG4gICAgICBzd2lwZXIubG9vcGVkU2xpZGVzICs9IHBhcmFtcy5sb29wQWRkaXRpb25hbFNsaWRlcztcblxuICAgICAgaWYgKHN3aXBlci5sb29wZWRTbGlkZXMgPiBzbGlkZXMubGVuZ3RoICYmIHN3aXBlci5wYXJhbXMubG9vcGVkU2xpZGVzTGltaXQpIHtcbiAgICAgICAgc3dpcGVyLmxvb3BlZFNsaWRlcyA9IHNsaWRlcy5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByZXBlbmRTbGlkZXMgPSBbXTtcbiAgICAgIGNvbnN0IGFwcGVuZFNsaWRlcyA9IFtdO1xuICAgICAgc2xpZGVzLmVhY2goKGVsLCBpbmRleCkgPT4ge1xuICAgICAgICAkJDEoZWwpLmF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4JywgaW5kZXgpO1xuICAgICAgfSk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3dpcGVyLmxvb3BlZFNsaWRlczsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gaSAtIE1hdGguZmxvb3IoaSAvIHNsaWRlcy5sZW5ndGgpICogc2xpZGVzLmxlbmd0aDtcbiAgICAgICAgYXBwZW5kU2xpZGVzLnB1c2goc2xpZGVzLmVxKGluZGV4KVswXSk7XG4gICAgICAgIHByZXBlbmRTbGlkZXMudW5zaGlmdChzbGlkZXMuZXEoc2xpZGVzLmxlbmd0aCAtIGluZGV4IC0gMSlbMF0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFwcGVuZFNsaWRlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAkc2VsZWN0b3IuYXBwZW5kKCQkMShhcHBlbmRTbGlkZXNbaV0uY2xvbmVOb2RlKHRydWUpKS5hZGRDbGFzcyhwYXJhbXMuc2xpZGVEdXBsaWNhdGVDbGFzcykpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gcHJlcGVuZFNsaWRlcy5sZW5ndGggLSAxOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAkc2VsZWN0b3IucHJlcGVuZCgkJDEocHJlcGVuZFNsaWRlc1tpXS5jbG9uZU5vZGUodHJ1ZSkpLmFkZENsYXNzKHBhcmFtcy5zbGlkZUR1cGxpY2F0ZUNsYXNzKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9vcEZpeCgpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBzd2lwZXIuZW1pdCgnYmVmb3JlTG9vcEZpeCcpO1xuICAgICAgY29uc3Qge1xuICAgICAgICBhY3RpdmVJbmRleCxcbiAgICAgICAgc2xpZGVzLFxuICAgICAgICBsb29wZWRTbGlkZXMsXG4gICAgICAgIGFsbG93U2xpZGVQcmV2LFxuICAgICAgICBhbGxvd1NsaWRlTmV4dCxcbiAgICAgICAgc25hcEdyaWQsXG4gICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgbGV0IG5ld0luZGV4O1xuICAgICAgc3dpcGVyLmFsbG93U2xpZGVQcmV2ID0gdHJ1ZTtcbiAgICAgIHN3aXBlci5hbGxvd1NsaWRlTmV4dCA9IHRydWU7XG4gICAgICBjb25zdCBzbmFwVHJhbnNsYXRlID0gLXNuYXBHcmlkW2FjdGl2ZUluZGV4XTtcbiAgICAgIGNvbnN0IGRpZmYgPSBzbmFwVHJhbnNsYXRlIC0gc3dpcGVyLmdldFRyYW5zbGF0ZSgpOyAvLyBGaXggRm9yIE5lZ2F0aXZlIE92ZXJzbGlkaW5nXG5cbiAgICAgIGlmIChhY3RpdmVJbmRleCA8IGxvb3BlZFNsaWRlcykge1xuICAgICAgICBuZXdJbmRleCA9IHNsaWRlcy5sZW5ndGggLSBsb29wZWRTbGlkZXMgKiAzICsgYWN0aXZlSW5kZXg7XG4gICAgICAgIG5ld0luZGV4ICs9IGxvb3BlZFNsaWRlcztcbiAgICAgICAgY29uc3Qgc2xpZGVDaGFuZ2VkID0gc3dpcGVyLnNsaWRlVG8obmV3SW5kZXgsIDAsIGZhbHNlLCB0cnVlKTtcblxuICAgICAgICBpZiAoc2xpZGVDaGFuZ2VkICYmIGRpZmYgIT09IDApIHtcbiAgICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKChydGwgPyAtc3dpcGVyLnRyYW5zbGF0ZSA6IHN3aXBlci50cmFuc2xhdGUpIC0gZGlmZik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYWN0aXZlSW5kZXggPj0gc2xpZGVzLmxlbmd0aCAtIGxvb3BlZFNsaWRlcykge1xuICAgICAgICAvLyBGaXggRm9yIFBvc2l0aXZlIE92ZXJzbGlkaW5nXG4gICAgICAgIG5ld0luZGV4ID0gLXNsaWRlcy5sZW5ndGggKyBhY3RpdmVJbmRleCArIGxvb3BlZFNsaWRlcztcbiAgICAgICAgbmV3SW5kZXggKz0gbG9vcGVkU2xpZGVzO1xuICAgICAgICBjb25zdCBzbGlkZUNoYW5nZWQgPSBzd2lwZXIuc2xpZGVUbyhuZXdJbmRleCwgMCwgZmFsc2UsIHRydWUpO1xuXG4gICAgICAgIGlmIChzbGlkZUNoYW5nZWQgJiYgZGlmZiAhPT0gMCkge1xuICAgICAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUoKHJ0bCA/IC1zd2lwZXIudHJhbnNsYXRlIDogc3dpcGVyLnRyYW5zbGF0ZSkgLSBkaWZmKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzd2lwZXIuYWxsb3dTbGlkZVByZXYgPSBhbGxvd1NsaWRlUHJldjtcbiAgICAgIHN3aXBlci5hbGxvd1NsaWRlTmV4dCA9IGFsbG93U2xpZGVOZXh0O1xuICAgICAgc3dpcGVyLmVtaXQoJ2xvb3BGaXgnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb29wRGVzdHJveSgpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgICR3cmFwcGVyRWwsXG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgc2xpZGVzXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgJHdyYXBwZXJFbC5jaGlsZHJlbihgLiR7cGFyYW1zLnNsaWRlQ2xhc3N9LiR7cGFyYW1zLnNsaWRlRHVwbGljYXRlQ2xhc3N9LC4ke3BhcmFtcy5zbGlkZUNsYXNzfS4ke3BhcmFtcy5zbGlkZUJsYW5rQ2xhc3N9YCkucmVtb3ZlKCk7XG4gICAgICBzbGlkZXMucmVtb3ZlQXR0cignZGF0YS1zd2lwZXItc2xpZGUtaW5kZXgnKTtcbiAgICB9XG5cbiAgICB2YXIgbG9vcCA9IHtcbiAgICAgIGxvb3BDcmVhdGUsXG4gICAgICBsb29wRml4LFxuICAgICAgbG9vcERlc3Ryb3lcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2V0R3JhYkN1cnNvcihtb3ZpbmcpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBpZiAoc3dpcGVyLnN1cHBvcnQudG91Y2ggfHwgIXN3aXBlci5wYXJhbXMuc2ltdWxhdGVUb3VjaCB8fCBzd2lwZXIucGFyYW1zLndhdGNoT3ZlcmZsb3cgJiYgc3dpcGVyLmlzTG9ja2VkIHx8IHN3aXBlci5wYXJhbXMuY3NzTW9kZSkgcmV0dXJuO1xuICAgICAgY29uc3QgZWwgPSBzd2lwZXIucGFyYW1zLnRvdWNoRXZlbnRzVGFyZ2V0ID09PSAnY29udGFpbmVyJyA/IHN3aXBlci5lbCA6IHN3aXBlci53cmFwcGVyRWw7XG4gICAgICBlbC5zdHlsZS5jdXJzb3IgPSAnbW92ZSc7XG4gICAgICBlbC5zdHlsZS5jdXJzb3IgPSBtb3ZpbmcgPyAnZ3JhYmJpbmcnIDogJ2dyYWInO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVuc2V0R3JhYkN1cnNvcigpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG5cbiAgICAgIGlmIChzd2lwZXIuc3VwcG9ydC50b3VjaCB8fCBzd2lwZXIucGFyYW1zLndhdGNoT3ZlcmZsb3cgJiYgc3dpcGVyLmlzTG9ja2VkIHx8IHN3aXBlci5wYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHN3aXBlcltzd2lwZXIucGFyYW1zLnRvdWNoRXZlbnRzVGFyZ2V0ID09PSAnY29udGFpbmVyJyA/ICdlbCcgOiAnd3JhcHBlckVsJ10uc3R5bGUuY3Vyc29yID0gJyc7XG4gICAgfVxuXG4gICAgdmFyIGdyYWJDdXJzb3IgPSB7XG4gICAgICBzZXRHcmFiQ3Vyc29yLFxuICAgICAgdW5zZXRHcmFiQ3Vyc29yXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNsb3Nlc3RFbGVtZW50KHNlbGVjdG9yLCBiYXNlKSB7XG4gICAgICBpZiAoYmFzZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGJhc2UgPSB0aGlzO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfX2Nsb3Nlc3RGcm9tKGVsKSB7XG4gICAgICAgIGlmICghZWwgfHwgZWwgPT09IGdldERvY3VtZW50KCkgfHwgZWwgPT09IGdldFdpbmRvdygpKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKGVsLmFzc2lnbmVkU2xvdCkgZWwgPSBlbC5hc3NpZ25lZFNsb3Q7XG4gICAgICAgIGNvbnN0IGZvdW5kID0gZWwuY2xvc2VzdChzZWxlY3Rvcik7XG5cbiAgICAgICAgaWYgKCFmb3VuZCAmJiAhZWwuZ2V0Um9vdE5vZGUpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb3VuZCB8fCBfX2Nsb3Nlc3RGcm9tKGVsLmdldFJvb3ROb2RlKCkuaG9zdCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBfX2Nsb3Nlc3RGcm9tKGJhc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uVG91Y2hTdGFydChldmVudCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgY29uc3QgZGF0YSA9IHN3aXBlci50b3VjaEV2ZW50c0RhdGE7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgdG91Y2hlcyxcbiAgICAgICAgZW5hYmxlZFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGlmICghZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICBpZiAoc3dpcGVyLmFuaW1hdGluZyAmJiBwYXJhbXMucHJldmVudEludGVyYWN0aW9uT25UcmFuc2l0aW9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzd2lwZXIuYW5pbWF0aW5nICYmIHBhcmFtcy5jc3NNb2RlICYmIHBhcmFtcy5sb29wKSB7XG4gICAgICAgIHN3aXBlci5sb29wRml4KCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBlID0gZXZlbnQ7XG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50KSBlID0gZS5vcmlnaW5hbEV2ZW50O1xuICAgICAgbGV0ICR0YXJnZXRFbCA9ICQkMShlLnRhcmdldCk7XG5cbiAgICAgIGlmIChwYXJhbXMudG91Y2hFdmVudHNUYXJnZXQgPT09ICd3cmFwcGVyJykge1xuICAgICAgICBpZiAoISR0YXJnZXRFbC5jbG9zZXN0KHN3aXBlci53cmFwcGVyRWwpLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkYXRhLmlzVG91Y2hFdmVudCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnO1xuICAgICAgaWYgKCFkYXRhLmlzVG91Y2hFdmVudCAmJiAnd2hpY2gnIGluIGUgJiYgZS53aGljaCA9PT0gMykgcmV0dXJuO1xuICAgICAgaWYgKCFkYXRhLmlzVG91Y2hFdmVudCAmJiAnYnV0dG9uJyBpbiBlICYmIGUuYnV0dG9uID4gMCkgcmV0dXJuO1xuICAgICAgaWYgKGRhdGEuaXNUb3VjaGVkICYmIGRhdGEuaXNNb3ZlZCkgcmV0dXJuOyAvLyBjaGFuZ2UgdGFyZ2V0IGVsIGZvciBzaGFkb3cgcm9vdCBjb21wb25lbnRcblxuICAgICAgY29uc3Qgc3dpcGluZ0NsYXNzSGFzVmFsdWUgPSAhIXBhcmFtcy5ub1N3aXBpbmdDbGFzcyAmJiBwYXJhbXMubm9Td2lwaW5nQ2xhc3MgIT09ICcnO1xuXG4gICAgICBpZiAoc3dpcGluZ0NsYXNzSGFzVmFsdWUgJiYgZS50YXJnZXQgJiYgZS50YXJnZXQuc2hhZG93Um9vdCAmJiBldmVudC5wYXRoICYmIGV2ZW50LnBhdGhbMF0pIHtcbiAgICAgICAgJHRhcmdldEVsID0gJCQxKGV2ZW50LnBhdGhbMF0pO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBub1N3aXBpbmdTZWxlY3RvciA9IHBhcmFtcy5ub1N3aXBpbmdTZWxlY3RvciA/IHBhcmFtcy5ub1N3aXBpbmdTZWxlY3RvciA6IGAuJHtwYXJhbXMubm9Td2lwaW5nQ2xhc3N9YDtcbiAgICAgIGNvbnN0IGlzVGFyZ2V0U2hhZG93ID0gISEoZS50YXJnZXQgJiYgZS50YXJnZXQuc2hhZG93Um9vdCk7IC8vIHVzZSBjbG9zZXN0RWxlbWVudCBmb3Igc2hhZG93IHJvb3QgZWxlbWVudCB0byBnZXQgdGhlIGFjdHVhbCBjbG9zZXN0IGZvciBuZXN0ZWQgc2hhZG93IHJvb3QgZWxlbWVudFxuXG4gICAgICBpZiAocGFyYW1zLm5vU3dpcGluZyAmJiAoaXNUYXJnZXRTaGFkb3cgPyBjbG9zZXN0RWxlbWVudChub1N3aXBpbmdTZWxlY3RvciwgJHRhcmdldEVsWzBdKSA6ICR0YXJnZXRFbC5jbG9zZXN0KG5vU3dpcGluZ1NlbGVjdG9yKVswXSkpIHtcbiAgICAgICAgc3dpcGVyLmFsbG93Q2xpY2sgPSB0cnVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMuc3dpcGVIYW5kbGVyKSB7XG4gICAgICAgIGlmICghJHRhcmdldEVsLmNsb3Nlc3QocGFyYW1zLnN3aXBlSGFuZGxlcilbMF0pIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdG91Y2hlcy5jdXJyZW50WCA9IGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnID8gZS50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYIDogZS5wYWdlWDtcbiAgICAgIHRvdWNoZXMuY3VycmVudFkgPSBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyA/IGUudGFyZ2V0VG91Y2hlc1swXS5wYWdlWSA6IGUucGFnZVk7XG4gICAgICBjb25zdCBzdGFydFggPSB0b3VjaGVzLmN1cnJlbnRYO1xuICAgICAgY29uc3Qgc3RhcnRZID0gdG91Y2hlcy5jdXJyZW50WTsgLy8gRG8gTk9UIHN0YXJ0IGlmIGlPUyBlZGdlIHN3aXBlIGlzIGRldGVjdGVkLiBPdGhlcndpc2UgaU9TIGFwcCBjYW5ub3Qgc3dpcGUtdG8tZ28tYmFjayBhbnltb3JlXG5cbiAgICAgIGNvbnN0IGVkZ2VTd2lwZURldGVjdGlvbiA9IHBhcmFtcy5lZGdlU3dpcGVEZXRlY3Rpb24gfHwgcGFyYW1zLmlPU0VkZ2VTd2lwZURldGVjdGlvbjtcbiAgICAgIGNvbnN0IGVkZ2VTd2lwZVRocmVzaG9sZCA9IHBhcmFtcy5lZGdlU3dpcGVUaHJlc2hvbGQgfHwgcGFyYW1zLmlPU0VkZ2VTd2lwZVRocmVzaG9sZDtcblxuICAgICAgaWYgKGVkZ2VTd2lwZURldGVjdGlvbiAmJiAoc3RhcnRYIDw9IGVkZ2VTd2lwZVRocmVzaG9sZCB8fCBzdGFydFggPj0gd2luZG93LmlubmVyV2lkdGggLSBlZGdlU3dpcGVUaHJlc2hvbGQpKSB7XG4gICAgICAgIGlmIChlZGdlU3dpcGVEZXRlY3Rpb24gPT09ICdwcmV2ZW50Jykge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oZGF0YSwge1xuICAgICAgICBpc1RvdWNoZWQ6IHRydWUsXG4gICAgICAgIGlzTW92ZWQ6IGZhbHNlLFxuICAgICAgICBhbGxvd1RvdWNoQ2FsbGJhY2tzOiB0cnVlLFxuICAgICAgICBpc1Njcm9sbGluZzogdW5kZWZpbmVkLFxuICAgICAgICBzdGFydE1vdmluZzogdW5kZWZpbmVkXG4gICAgICB9KTtcbiAgICAgIHRvdWNoZXMuc3RhcnRYID0gc3RhcnRYO1xuICAgICAgdG91Y2hlcy5zdGFydFkgPSBzdGFydFk7XG4gICAgICBkYXRhLnRvdWNoU3RhcnRUaW1lID0gbm93KCk7XG4gICAgICBzd2lwZXIuYWxsb3dDbGljayA9IHRydWU7XG4gICAgICBzd2lwZXIudXBkYXRlU2l6ZSgpO1xuICAgICAgc3dpcGVyLnN3aXBlRGlyZWN0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKHBhcmFtcy50aHJlc2hvbGQgPiAwKSBkYXRhLmFsbG93VGhyZXNob2xkTW92ZSA9IGZhbHNlO1xuXG4gICAgICBpZiAoZS50eXBlICE9PSAndG91Y2hzdGFydCcpIHtcbiAgICAgICAgbGV0IHByZXZlbnREZWZhdWx0ID0gdHJ1ZTtcblxuICAgICAgICBpZiAoJHRhcmdldEVsLmlzKGRhdGEuZm9jdXNhYmxlRWxlbWVudHMpKSB7XG4gICAgICAgICAgcHJldmVudERlZmF1bHQgPSBmYWxzZTtcblxuICAgICAgICAgIGlmICgkdGFyZ2V0RWxbMF0ubm9kZU5hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICAgICAgICBkYXRhLmlzVG91Y2hlZCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmICQkMShkb2N1bWVudC5hY3RpdmVFbGVtZW50KS5pcyhkYXRhLmZvY3VzYWJsZUVsZW1lbnRzKSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSAkdGFyZ2V0RWxbMF0pIHtcbiAgICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNob3VsZFByZXZlbnREZWZhdWx0ID0gcHJldmVudERlZmF1bHQgJiYgc3dpcGVyLmFsbG93VG91Y2hNb3ZlICYmIHBhcmFtcy50b3VjaFN0YXJ0UHJldmVudERlZmF1bHQ7XG5cbiAgICAgICAgaWYgKChwYXJhbXMudG91Y2hTdGFydEZvcmNlUHJldmVudERlZmF1bHQgfHwgc2hvdWxkUHJldmVudERlZmF1bHQpICYmICEkdGFyZ2V0RWxbMF0uaXNDb250ZW50RWRpdGFibGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZnJlZU1vZGUgJiYgc3dpcGVyLnBhcmFtcy5mcmVlTW9kZS5lbmFibGVkICYmIHN3aXBlci5mcmVlTW9kZSAmJiBzd2lwZXIuYW5pbWF0aW5nICYmICFwYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICBzd2lwZXIuZnJlZU1vZGUub25Ub3VjaFN0YXJ0KCk7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5lbWl0KCd0b3VjaFN0YXJ0JywgZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Ub3VjaE1vdmUoZXZlbnQpIHtcbiAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCBkYXRhID0gc3dpcGVyLnRvdWNoRXZlbnRzRGF0YTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICB0b3VjaGVzLFxuICAgICAgICBydGxUcmFuc2xhdGU6IHJ0bCxcbiAgICAgICAgZW5hYmxlZFxuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGlmICghZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgbGV0IGUgPSBldmVudDtcbiAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQpIGUgPSBlLm9yaWdpbmFsRXZlbnQ7XG5cbiAgICAgIGlmICghZGF0YS5pc1RvdWNoZWQpIHtcbiAgICAgICAgaWYgKGRhdGEuc3RhcnRNb3ZpbmcgJiYgZGF0YS5pc1Njcm9sbGluZykge1xuICAgICAgICAgIHN3aXBlci5lbWl0KCd0b3VjaE1vdmVPcHBvc2l0ZScsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5pc1RvdWNoRXZlbnQgJiYgZS50eXBlICE9PSAndG91Y2htb3ZlJykgcmV0dXJuO1xuICAgICAgY29uc3QgdGFyZ2V0VG91Y2ggPSBlLnR5cGUgPT09ICd0b3VjaG1vdmUnICYmIGUudGFyZ2V0VG91Y2hlcyAmJiAoZS50YXJnZXRUb3VjaGVzWzBdIHx8IGUuY2hhbmdlZFRvdWNoZXNbMF0pO1xuICAgICAgY29uc3QgcGFnZVggPSBlLnR5cGUgPT09ICd0b3VjaG1vdmUnID8gdGFyZ2V0VG91Y2gucGFnZVggOiBlLnBhZ2VYO1xuICAgICAgY29uc3QgcGFnZVkgPSBlLnR5cGUgPT09ICd0b3VjaG1vdmUnID8gdGFyZ2V0VG91Y2gucGFnZVkgOiBlLnBhZ2VZO1xuXG4gICAgICBpZiAoZS5wcmV2ZW50ZWRCeU5lc3RlZFN3aXBlcikge1xuICAgICAgICB0b3VjaGVzLnN0YXJ0WCA9IHBhZ2VYO1xuICAgICAgICB0b3VjaGVzLnN0YXJ0WSA9IHBhZ2VZO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghc3dpcGVyLmFsbG93VG91Y2hNb3ZlKSB7XG4gICAgICAgIGlmICghJCQxKGUudGFyZ2V0KS5pcyhkYXRhLmZvY3VzYWJsZUVsZW1lbnRzKSkge1xuICAgICAgICAgIHN3aXBlci5hbGxvd0NsaWNrID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5pc1RvdWNoZWQpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHRvdWNoZXMsIHtcbiAgICAgICAgICAgIHN0YXJ0WDogcGFnZVgsXG4gICAgICAgICAgICBzdGFydFk6IHBhZ2VZLFxuICAgICAgICAgICAgY3VycmVudFg6IHBhZ2VYLFxuICAgICAgICAgICAgY3VycmVudFk6IHBhZ2VZXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZGF0YS50b3VjaFN0YXJ0VGltZSA9IG5vdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5pc1RvdWNoRXZlbnQgJiYgcGFyYW1zLnRvdWNoUmVsZWFzZU9uRWRnZXMgJiYgIXBhcmFtcy5sb29wKSB7XG4gICAgICAgIGlmIChzd2lwZXIuaXNWZXJ0aWNhbCgpKSB7XG4gICAgICAgICAgLy8gVmVydGljYWxcbiAgICAgICAgICBpZiAocGFnZVkgPCB0b3VjaGVzLnN0YXJ0WSAmJiBzd2lwZXIudHJhbnNsYXRlIDw9IHN3aXBlci5tYXhUcmFuc2xhdGUoKSB8fCBwYWdlWSA+IHRvdWNoZXMuc3RhcnRZICYmIHN3aXBlci50cmFuc2xhdGUgPj0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSB7XG4gICAgICAgICAgICBkYXRhLmlzVG91Y2hlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZGF0YS5pc01vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBhZ2VYIDwgdG91Y2hlcy5zdGFydFggJiYgc3dpcGVyLnRyYW5zbGF0ZSA8PSBzd2lwZXIubWF4VHJhbnNsYXRlKCkgfHwgcGFnZVggPiB0b3VjaGVzLnN0YXJ0WCAmJiBzd2lwZXIudHJhbnNsYXRlID49IHN3aXBlci5taW5UcmFuc2xhdGUoKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZGF0YS5pc1RvdWNoRXZlbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xuICAgICAgICBpZiAoZS50YXJnZXQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgJCQxKGUudGFyZ2V0KS5pcyhkYXRhLmZvY3VzYWJsZUVsZW1lbnRzKSkge1xuICAgICAgICAgIGRhdGEuaXNNb3ZlZCA9IHRydWU7XG4gICAgICAgICAgc3dpcGVyLmFsbG93Q2xpY2sgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEuYWxsb3dUb3VjaENhbGxiYWNrcykge1xuICAgICAgICBzd2lwZXIuZW1pdCgndG91Y2hNb3ZlJywgZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChlLnRhcmdldFRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjtcbiAgICAgIHRvdWNoZXMuY3VycmVudFggPSBwYWdlWDtcbiAgICAgIHRvdWNoZXMuY3VycmVudFkgPSBwYWdlWTtcbiAgICAgIGNvbnN0IGRpZmZYID0gdG91Y2hlcy5jdXJyZW50WCAtIHRvdWNoZXMuc3RhcnRYO1xuICAgICAgY29uc3QgZGlmZlkgPSB0b3VjaGVzLmN1cnJlbnRZIC0gdG91Y2hlcy5zdGFydFk7XG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy50aHJlc2hvbGQgJiYgTWF0aC5zcXJ0KGRpZmZYICoqIDIgKyBkaWZmWSAqKiAyKSA8IHN3aXBlci5wYXJhbXMudGhyZXNob2xkKSByZXR1cm47XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YS5pc1Njcm9sbGluZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbGV0IHRvdWNoQW5nbGU7XG5cbiAgICAgICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSAmJiB0b3VjaGVzLmN1cnJlbnRZID09PSB0b3VjaGVzLnN0YXJ0WSB8fCBzd2lwZXIuaXNWZXJ0aWNhbCgpICYmIHRvdWNoZXMuY3VycmVudFggPT09IHRvdWNoZXMuc3RhcnRYKSB7XG4gICAgICAgICAgZGF0YS5pc1Njcm9sbGluZyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgIGlmIChkaWZmWCAqIGRpZmZYICsgZGlmZlkgKiBkaWZmWSA+PSAyNSkge1xuICAgICAgICAgICAgdG91Y2hBbmdsZSA9IE1hdGguYXRhbjIoTWF0aC5hYnMoZGlmZlkpLCBNYXRoLmFicyhkaWZmWCkpICogMTgwIC8gTWF0aC5QSTtcbiAgICAgICAgICAgIGRhdGEuaXNTY3JvbGxpbmcgPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyB0b3VjaEFuZ2xlID4gcGFyYW1zLnRvdWNoQW5nbGUgOiA5MCAtIHRvdWNoQW5nbGUgPiBwYXJhbXMudG91Y2hBbmdsZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEuaXNTY3JvbGxpbmcpIHtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ3RvdWNoTW92ZU9wcG9zaXRlJywgZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZGF0YS5zdGFydE1vdmluZyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKHRvdWNoZXMuY3VycmVudFggIT09IHRvdWNoZXMuc3RhcnRYIHx8IHRvdWNoZXMuY3VycmVudFkgIT09IHRvdWNoZXMuc3RhcnRZKSB7XG4gICAgICAgICAgZGF0YS5zdGFydE1vdmluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRhdGEuaXNTY3JvbGxpbmcpIHtcbiAgICAgICAgZGF0YS5pc1RvdWNoZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRhdGEuc3RhcnRNb3ZpbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIuYWxsb3dDbGljayA9IGZhbHNlO1xuXG4gICAgICBpZiAoIXBhcmFtcy5jc3NNb2RlICYmIGUuY2FuY2VsYWJsZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMudG91Y2hNb3ZlU3RvcFByb3BhZ2F0aW9uICYmICFwYXJhbXMubmVzdGVkKSB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghZGF0YS5pc01vdmVkKSB7XG4gICAgICAgIGlmIChwYXJhbXMubG9vcCAmJiAhcGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgICBzd2lwZXIubG9vcEZpeCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5zdGFydFRyYW5zbGF0ZSA9IHN3aXBlci5nZXRUcmFuc2xhdGUoKTtcbiAgICAgICAgc3dpcGVyLnNldFRyYW5zaXRpb24oMCk7XG5cbiAgICAgICAgaWYgKHN3aXBlci5hbmltYXRpbmcpIHtcbiAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbC50cmlnZ2VyKCd3ZWJraXRUcmFuc2l0aW9uRW5kIHRyYW5zaXRpb25lbmQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGEuYWxsb3dNb21lbnR1bUJvdW5jZSA9IGZhbHNlOyAvLyBHcmFiIEN1cnNvclxuXG4gICAgICAgIGlmIChwYXJhbXMuZ3JhYkN1cnNvciAmJiAoc3dpcGVyLmFsbG93U2xpZGVOZXh0ID09PSB0cnVlIHx8IHN3aXBlci5hbGxvd1NsaWRlUHJldiA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgICBzd2lwZXIuc2V0R3JhYkN1cnNvcih0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci5lbWl0KCdzbGlkZXJGaXJzdE1vdmUnLCBlKTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLmVtaXQoJ3NsaWRlck1vdmUnLCBlKTtcbiAgICAgIGRhdGEuaXNNb3ZlZCA9IHRydWU7XG4gICAgICBsZXQgZGlmZiA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/IGRpZmZYIDogZGlmZlk7XG4gICAgICB0b3VjaGVzLmRpZmYgPSBkaWZmO1xuICAgICAgZGlmZiAqPSBwYXJhbXMudG91Y2hSYXRpbztcbiAgICAgIGlmIChydGwpIGRpZmYgPSAtZGlmZjtcbiAgICAgIHN3aXBlci5zd2lwZURpcmVjdGlvbiA9IGRpZmYgPiAwID8gJ3ByZXYnIDogJ25leHQnO1xuICAgICAgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gZGlmZiArIGRhdGEuc3RhcnRUcmFuc2xhdGU7XG4gICAgICBsZXQgZGlzYWJsZVBhcmVudFN3aXBlciA9IHRydWU7XG4gICAgICBsZXQgcmVzaXN0YW5jZVJhdGlvID0gcGFyYW1zLnJlc2lzdGFuY2VSYXRpbztcblxuICAgICAgaWYgKHBhcmFtcy50b3VjaFJlbGVhc2VPbkVkZ2VzKSB7XG4gICAgICAgIHJlc2lzdGFuY2VSYXRpbyA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaWZmID4gMCAmJiBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPiBzd2lwZXIubWluVHJhbnNsYXRlKCkpIHtcbiAgICAgICAgZGlzYWJsZVBhcmVudFN3aXBlciA9IGZhbHNlO1xuICAgICAgICBpZiAocGFyYW1zLnJlc2lzdGFuY2UpIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IHN3aXBlci5taW5UcmFuc2xhdGUoKSAtIDEgKyAoLXN3aXBlci5taW5UcmFuc2xhdGUoKSArIGRhdGEuc3RhcnRUcmFuc2xhdGUgKyBkaWZmKSAqKiByZXNpc3RhbmNlUmF0aW87XG4gICAgICB9IGVsc2UgaWYgKGRpZmYgPCAwICYmIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA8IHN3aXBlci5tYXhUcmFuc2xhdGUoKSkge1xuICAgICAgICBkaXNhYmxlUGFyZW50U3dpcGVyID0gZmFsc2U7XG4gICAgICAgIGlmIChwYXJhbXMucmVzaXN0YW5jZSkgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpICsgMSAtIChzd2lwZXIubWF4VHJhbnNsYXRlKCkgLSBkYXRhLnN0YXJ0VHJhbnNsYXRlIC0gZGlmZikgKiogcmVzaXN0YW5jZVJhdGlvO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlzYWJsZVBhcmVudFN3aXBlcikge1xuICAgICAgICBlLnByZXZlbnRlZEJ5TmVzdGVkU3dpcGVyID0gdHJ1ZTtcbiAgICAgIH0gLy8gRGlyZWN0aW9ucyBsb2Nrc1xuXG5cbiAgICAgIGlmICghc3dpcGVyLmFsbG93U2xpZGVOZXh0ICYmIHN3aXBlci5zd2lwZURpcmVjdGlvbiA9PT0gJ25leHQnICYmIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA8IGRhdGEuc3RhcnRUcmFuc2xhdGUpIHtcbiAgICAgICAgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gZGF0YS5zdGFydFRyYW5zbGF0ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzd2lwZXIuYWxsb3dTbGlkZVByZXYgJiYgc3dpcGVyLnN3aXBlRGlyZWN0aW9uID09PSAncHJldicgJiYgZGF0YS5jdXJyZW50VHJhbnNsYXRlID4gZGF0YS5zdGFydFRyYW5zbGF0ZSkge1xuICAgICAgICBkYXRhLmN1cnJlbnRUcmFuc2xhdGUgPSBkYXRhLnN0YXJ0VHJhbnNsYXRlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXN3aXBlci5hbGxvd1NsaWRlUHJldiAmJiAhc3dpcGVyLmFsbG93U2xpZGVOZXh0KSB7XG4gICAgICAgIGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9IGRhdGEuc3RhcnRUcmFuc2xhdGU7XG4gICAgICB9IC8vIFRocmVzaG9sZFxuXG5cbiAgICAgIGlmIChwYXJhbXMudGhyZXNob2xkID4gMCkge1xuICAgICAgICBpZiAoTWF0aC5hYnMoZGlmZikgPiBwYXJhbXMudGhyZXNob2xkIHx8IGRhdGEuYWxsb3dUaHJlc2hvbGRNb3ZlKSB7XG4gICAgICAgICAgaWYgKCFkYXRhLmFsbG93VGhyZXNob2xkTW92ZSkge1xuICAgICAgICAgICAgZGF0YS5hbGxvd1RocmVzaG9sZE1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgdG91Y2hlcy5zdGFydFggPSB0b3VjaGVzLmN1cnJlbnRYO1xuICAgICAgICAgICAgdG91Y2hlcy5zdGFydFkgPSB0b3VjaGVzLmN1cnJlbnRZO1xuICAgICAgICAgICAgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gZGF0YS5zdGFydFRyYW5zbGF0ZTtcbiAgICAgICAgICAgIHRvdWNoZXMuZGlmZiA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/IHRvdWNoZXMuY3VycmVudFggLSB0b3VjaGVzLnN0YXJ0WCA6IHRvdWNoZXMuY3VycmVudFkgLSB0b3VjaGVzLnN0YXJ0WTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0YS5jdXJyZW50VHJhbnNsYXRlID0gZGF0YS5zdGFydFRyYW5zbGF0ZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFwYXJhbXMuZm9sbG93RmluZ2VyIHx8IHBhcmFtcy5jc3NNb2RlKSByZXR1cm47IC8vIFVwZGF0ZSBhY3RpdmUgaW5kZXggaW4gZnJlZSBtb2RlXG5cbiAgICAgIGlmIChwYXJhbXMuZnJlZU1vZGUgJiYgcGFyYW1zLmZyZWVNb2RlLmVuYWJsZWQgJiYgc3dpcGVyLmZyZWVNb2RlIHx8IHBhcmFtcy53YXRjaFNsaWRlc1Byb2dyZXNzKSB7XG4gICAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgICAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5mcmVlTW9kZSAmJiBwYXJhbXMuZnJlZU1vZGUuZW5hYmxlZCAmJiBzd2lwZXIuZnJlZU1vZGUpIHtcbiAgICAgICAgc3dpcGVyLmZyZWVNb2RlLm9uVG91Y2hNb3ZlKCk7XG4gICAgICB9IC8vIFVwZGF0ZSBwcm9ncmVzc1xuXG5cbiAgICAgIHN3aXBlci51cGRhdGVQcm9ncmVzcyhkYXRhLmN1cnJlbnRUcmFuc2xhdGUpOyAvLyBVcGRhdGUgdHJhbnNsYXRlXG5cbiAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUoZGF0YS5jdXJyZW50VHJhbnNsYXRlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvblRvdWNoRW5kKGV2ZW50KSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3QgZGF0YSA9IHN3aXBlci50b3VjaEV2ZW50c0RhdGE7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgdG91Y2hlcyxcbiAgICAgICAgcnRsVHJhbnNsYXRlOiBydGwsXG4gICAgICAgIHNsaWRlc0dyaWQsXG4gICAgICAgIGVuYWJsZWRcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcbiAgICAgIGxldCBlID0gZXZlbnQ7XG4gICAgICBpZiAoZS5vcmlnaW5hbEV2ZW50KSBlID0gZS5vcmlnaW5hbEV2ZW50O1xuXG4gICAgICBpZiAoZGF0YS5hbGxvd1RvdWNoQ2FsbGJhY2tzKSB7XG4gICAgICAgIHN3aXBlci5lbWl0KCd0b3VjaEVuZCcsIGUpO1xuICAgICAgfVxuXG4gICAgICBkYXRhLmFsbG93VG91Y2hDYWxsYmFja3MgPSBmYWxzZTtcblxuICAgICAgaWYgKCFkYXRhLmlzVG91Y2hlZCkge1xuICAgICAgICBpZiAoZGF0YS5pc01vdmVkICYmIHBhcmFtcy5ncmFiQ3Vyc29yKSB7XG4gICAgICAgICAgc3dpcGVyLnNldEdyYWJDdXJzb3IoZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5pc01vdmVkID0gZmFsc2U7XG4gICAgICAgIGRhdGEuc3RhcnRNb3ZpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBSZXR1cm4gR3JhYiBDdXJzb3JcblxuXG4gICAgICBpZiAocGFyYW1zLmdyYWJDdXJzb3IgJiYgZGF0YS5pc01vdmVkICYmIGRhdGEuaXNUb3VjaGVkICYmIChzd2lwZXIuYWxsb3dTbGlkZU5leHQgPT09IHRydWUgfHwgc3dpcGVyLmFsbG93U2xpZGVQcmV2ID09PSB0cnVlKSkge1xuICAgICAgICBzd2lwZXIuc2V0R3JhYkN1cnNvcihmYWxzZSk7XG4gICAgICB9IC8vIFRpbWUgZGlmZlxuXG5cbiAgICAgIGNvbnN0IHRvdWNoRW5kVGltZSA9IG5vdygpO1xuICAgICAgY29uc3QgdGltZURpZmYgPSB0b3VjaEVuZFRpbWUgLSBkYXRhLnRvdWNoU3RhcnRUaW1lOyAvLyBUYXAsIGRvdWJsZVRhcCwgQ2xpY2tcblxuICAgICAgaWYgKHN3aXBlci5hbGxvd0NsaWNrKSB7XG4gICAgICAgIGNvbnN0IHBhdGhUcmVlID0gZS5wYXRoIHx8IGUuY29tcG9zZWRQYXRoICYmIGUuY29tcG9zZWRQYXRoKCk7XG4gICAgICAgIHN3aXBlci51cGRhdGVDbGlja2VkU2xpZGUocGF0aFRyZWUgJiYgcGF0aFRyZWVbMF0gfHwgZS50YXJnZXQpO1xuICAgICAgICBzd2lwZXIuZW1pdCgndGFwIGNsaWNrJywgZSk7XG5cbiAgICAgICAgaWYgKHRpbWVEaWZmIDwgMzAwICYmIHRvdWNoRW5kVGltZSAtIGRhdGEubGFzdENsaWNrVGltZSA8IDMwMCkge1xuICAgICAgICAgIHN3aXBlci5lbWl0KCdkb3VibGVUYXAgZG91YmxlQ2xpY2snLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBkYXRhLmxhc3RDbGlja1RpbWUgPSBub3coKTtcbiAgICAgIG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgaWYgKCFzd2lwZXIuZGVzdHJveWVkKSBzd2lwZXIuYWxsb3dDbGljayA9IHRydWU7XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFkYXRhLmlzVG91Y2hlZCB8fCAhZGF0YS5pc01vdmVkIHx8ICFzd2lwZXIuc3dpcGVEaXJlY3Rpb24gfHwgdG91Y2hlcy5kaWZmID09PSAwIHx8IGRhdGEuY3VycmVudFRyYW5zbGF0ZSA9PT0gZGF0YS5zdGFydFRyYW5zbGF0ZSkge1xuICAgICAgICBkYXRhLmlzVG91Y2hlZCA9IGZhbHNlO1xuICAgICAgICBkYXRhLmlzTW92ZWQgPSBmYWxzZTtcbiAgICAgICAgZGF0YS5zdGFydE1vdmluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGRhdGEuaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgICBkYXRhLmlzTW92ZWQgPSBmYWxzZTtcbiAgICAgIGRhdGEuc3RhcnRNb3ZpbmcgPSBmYWxzZTtcbiAgICAgIGxldCBjdXJyZW50UG9zO1xuXG4gICAgICBpZiAocGFyYW1zLmZvbGxvd0Zpbmdlcikge1xuICAgICAgICBjdXJyZW50UG9zID0gcnRsID8gc3dpcGVyLnRyYW5zbGF0ZSA6IC1zd2lwZXIudHJhbnNsYXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudFBvcyA9IC1kYXRhLmN1cnJlbnRUcmFuc2xhdGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLmZyZWVNb2RlICYmIHBhcmFtcy5mcmVlTW9kZS5lbmFibGVkKSB7XG4gICAgICAgIHN3aXBlci5mcmVlTW9kZS5vblRvdWNoRW5kKHtcbiAgICAgICAgICBjdXJyZW50UG9zXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIEZpbmQgY3VycmVudCBzbGlkZVxuXG5cbiAgICAgIGxldCBzdG9wSW5kZXggPSAwO1xuICAgICAgbGV0IGdyb3VwU2l6ZSA9IHN3aXBlci5zbGlkZXNTaXplc0dyaWRbMF07XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2xpZGVzR3JpZC5sZW5ndGg7IGkgKz0gaSA8IHBhcmFtcy5zbGlkZXNQZXJHcm91cFNraXAgPyAxIDogcGFyYW1zLnNsaWRlc1Blckdyb3VwKSB7XG4gICAgICAgIGNvbnN0IGluY3JlbWVudCA9IGkgPCBwYXJhbXMuc2xpZGVzUGVyR3JvdXBTa2lwIC0gMSA/IDEgOiBwYXJhbXMuc2xpZGVzUGVyR3JvdXA7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzbGlkZXNHcmlkW2kgKyBpbmNyZW1lbnRdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGlmIChjdXJyZW50UG9zID49IHNsaWRlc0dyaWRbaV0gJiYgY3VycmVudFBvcyA8IHNsaWRlc0dyaWRbaSArIGluY3JlbWVudF0pIHtcbiAgICAgICAgICAgIHN0b3BJbmRleCA9IGk7XG4gICAgICAgICAgICBncm91cFNpemUgPSBzbGlkZXNHcmlkW2kgKyBpbmNyZW1lbnRdIC0gc2xpZGVzR3JpZFtpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFBvcyA+PSBzbGlkZXNHcmlkW2ldKSB7XG4gICAgICAgICAgc3RvcEluZGV4ID0gaTtcbiAgICAgICAgICBncm91cFNpemUgPSBzbGlkZXNHcmlkW3NsaWRlc0dyaWQubGVuZ3RoIC0gMV0gLSBzbGlkZXNHcmlkW3NsaWRlc0dyaWQubGVuZ3RoIC0gMl07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGV0IHJld2luZEZpcnN0SW5kZXggPSBudWxsO1xuICAgICAgbGV0IHJld2luZExhc3RJbmRleCA9IG51bGw7XG5cbiAgICAgIGlmIChwYXJhbXMucmV3aW5kKSB7XG4gICAgICAgIGlmIChzd2lwZXIuaXNCZWdpbm5pbmcpIHtcbiAgICAgICAgICByZXdpbmRMYXN0SW5kZXggPSBzd2lwZXIucGFyYW1zLnZpcnR1YWwgJiYgc3dpcGVyLnBhcmFtcy52aXJ0dWFsLmVuYWJsZWQgJiYgc3dpcGVyLnZpcnR1YWwgPyBzd2lwZXIudmlydHVhbC5zbGlkZXMubGVuZ3RoIC0gMSA6IHN3aXBlci5zbGlkZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfSBlbHNlIGlmIChzd2lwZXIuaXNFbmQpIHtcbiAgICAgICAgICByZXdpbmRGaXJzdEluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgICAgfSAvLyBGaW5kIGN1cnJlbnQgc2xpZGUgc2l6ZVxuXG5cbiAgICAgIGNvbnN0IHJhdGlvID0gKGN1cnJlbnRQb3MgLSBzbGlkZXNHcmlkW3N0b3BJbmRleF0pIC8gZ3JvdXBTaXplO1xuICAgICAgY29uc3QgaW5jcmVtZW50ID0gc3RvcEluZGV4IDwgcGFyYW1zLnNsaWRlc1Blckdyb3VwU2tpcCAtIDEgPyAxIDogcGFyYW1zLnNsaWRlc1Blckdyb3VwO1xuXG4gICAgICBpZiAodGltZURpZmYgPiBwYXJhbXMubG9uZ1N3aXBlc01zKSB7XG4gICAgICAgIC8vIExvbmcgdG91Y2hlc1xuICAgICAgICBpZiAoIXBhcmFtcy5sb25nU3dpcGVzKSB7XG4gICAgICAgICAgc3dpcGVyLnNsaWRlVG8oc3dpcGVyLmFjdGl2ZUluZGV4KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3dpcGVyLnN3aXBlRGlyZWN0aW9uID09PSAnbmV4dCcpIHtcbiAgICAgICAgICBpZiAocmF0aW8gPj0gcGFyYW1zLmxvbmdTd2lwZXNSYXRpbykgc3dpcGVyLnNsaWRlVG8ocGFyYW1zLnJld2luZCAmJiBzd2lwZXIuaXNFbmQgPyByZXdpbmRGaXJzdEluZGV4IDogc3RvcEluZGV4ICsgaW5jcmVtZW50KTtlbHNlIHN3aXBlci5zbGlkZVRvKHN0b3BJbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3dpcGVyLnN3aXBlRGlyZWN0aW9uID09PSAncHJldicpIHtcbiAgICAgICAgICBpZiAocmF0aW8gPiAxIC0gcGFyYW1zLmxvbmdTd2lwZXNSYXRpbykge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG8oc3RvcEluZGV4ICsgaW5jcmVtZW50KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHJld2luZExhc3RJbmRleCAhPT0gbnVsbCAmJiByYXRpbyA8IDAgJiYgTWF0aC5hYnMocmF0aW8pID4gcGFyYW1zLmxvbmdTd2lwZXNSYXRpbykge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG8ocmV3aW5kTGFzdEluZGV4KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG8oc3RvcEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNob3J0IHN3aXBlc1xuICAgICAgICBpZiAoIXBhcmFtcy5zaG9ydFN3aXBlcykge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHN3aXBlci5hY3RpdmVJbmRleCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXNOYXZCdXR0b25UYXJnZXQgPSBzd2lwZXIubmF2aWdhdGlvbiAmJiAoZS50YXJnZXQgPT09IHN3aXBlci5uYXZpZ2F0aW9uLm5leHRFbCB8fCBlLnRhcmdldCA9PT0gc3dpcGVyLm5hdmlnYXRpb24ucHJldkVsKTtcblxuICAgICAgICBpZiAoIWlzTmF2QnV0dG9uVGFyZ2V0KSB7XG4gICAgICAgICAgaWYgKHN3aXBlci5zd2lwZURpcmVjdGlvbiA9PT0gJ25leHQnKSB7XG4gICAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhyZXdpbmRGaXJzdEluZGV4ICE9PSBudWxsID8gcmV3aW5kRmlyc3RJbmRleCA6IHN0b3BJbmRleCArIGluY3JlbWVudCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHN3aXBlci5zd2lwZURpcmVjdGlvbiA9PT0gJ3ByZXYnKSB7XG4gICAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhyZXdpbmRMYXN0SW5kZXggIT09IG51bGwgPyByZXdpbmRMYXN0SW5kZXggOiBzdG9wSW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChlLnRhcmdldCA9PT0gc3dpcGVyLm5hdmlnYXRpb24ubmV4dEVsKSB7XG4gICAgICAgICAgc3dpcGVyLnNsaWRlVG8oc3RvcEluZGV4ICsgaW5jcmVtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhzdG9wSW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25SZXNpemUoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIGVsXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgaWYgKGVsICYmIGVsLm9mZnNldFdpZHRoID09PSAwKSByZXR1cm47IC8vIEJyZWFrcG9pbnRzXG5cbiAgICAgIGlmIChwYXJhbXMuYnJlYWtwb2ludHMpIHtcbiAgICAgICAgc3dpcGVyLnNldEJyZWFrcG9pbnQoKTtcbiAgICAgIH0gLy8gU2F2ZSBsb2Nrc1xuXG5cbiAgICAgIGNvbnN0IHtcbiAgICAgICAgYWxsb3dTbGlkZU5leHQsXG4gICAgICAgIGFsbG93U2xpZGVQcmV2LFxuICAgICAgICBzbmFwR3JpZFxuICAgICAgfSA9IHN3aXBlcjsgLy8gRGlzYWJsZSBsb2NrcyBvbiByZXNpemVcblxuICAgICAgc3dpcGVyLmFsbG93U2xpZGVOZXh0ID0gdHJ1ZTtcbiAgICAgIHN3aXBlci5hbGxvd1NsaWRlUHJldiA9IHRydWU7XG4gICAgICBzd2lwZXIudXBkYXRlU2l6ZSgpO1xuICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlcygpO1xuICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcblxuICAgICAgaWYgKChwYXJhbXMuc2xpZGVzUGVyVmlldyA9PT0gJ2F1dG8nIHx8IHBhcmFtcy5zbGlkZXNQZXJWaWV3ID4gMSkgJiYgc3dpcGVyLmlzRW5kICYmICFzd2lwZXIuaXNCZWdpbm5pbmcgJiYgIXN3aXBlci5wYXJhbXMuY2VudGVyZWRTbGlkZXMpIHtcbiAgICAgICAgc3dpcGVyLnNsaWRlVG8oc3dpcGVyLnNsaWRlcy5sZW5ndGggLSAxLCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXgsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN3aXBlci5hdXRvcGxheSAmJiBzd2lwZXIuYXV0b3BsYXkucnVubmluZyAmJiBzd2lwZXIuYXV0b3BsYXkucGF1c2VkKSB7XG4gICAgICAgIHN3aXBlci5hdXRvcGxheS5ydW4oKTtcbiAgICAgIH0gLy8gUmV0dXJuIGxvY2tzIGFmdGVyIHJlc2l6ZVxuXG5cbiAgICAgIHN3aXBlci5hbGxvd1NsaWRlUHJldiA9IGFsbG93U2xpZGVQcmV2O1xuICAgICAgc3dpcGVyLmFsbG93U2xpZGVOZXh0ID0gYWxsb3dTbGlkZU5leHQ7XG5cbiAgICAgIGlmIChzd2lwZXIucGFyYW1zLndhdGNoT3ZlcmZsb3cgJiYgc25hcEdyaWQgIT09IHN3aXBlci5zbmFwR3JpZCkge1xuICAgICAgICBzd2lwZXIuY2hlY2tPdmVyZmxvdygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uQ2xpY2soZSkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGlmICghc3dpcGVyLmVuYWJsZWQpIHJldHVybjtcblxuICAgICAgaWYgKCFzd2lwZXIuYWxsb3dDbGljaykge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5wcmV2ZW50Q2xpY2tzKSBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMucHJldmVudENsaWNrc1Byb3BhZ2F0aW9uICYmIHN3aXBlci5hbmltYXRpbmcpIHtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvblNjcm9sbCgpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIHdyYXBwZXJFbCxcbiAgICAgICAgcnRsVHJhbnNsYXRlLFxuICAgICAgICBlbmFibGVkXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG4gICAgICBzd2lwZXIucHJldmlvdXNUcmFuc2xhdGUgPSBzd2lwZXIudHJhbnNsYXRlO1xuXG4gICAgICBpZiAoc3dpcGVyLmlzSG9yaXpvbnRhbCgpKSB7XG4gICAgICAgIHN3aXBlci50cmFuc2xhdGUgPSAtd3JhcHBlckVsLnNjcm9sbExlZnQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzd2lwZXIudHJhbnNsYXRlID0gLXdyYXBwZXJFbC5zY3JvbGxUb3A7XG4gICAgICB9IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuXG5cbiAgICAgIGlmIChzd2lwZXIudHJhbnNsYXRlID09PSAwKSBzd2lwZXIudHJhbnNsYXRlID0gMDtcbiAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcbiAgICAgIGxldCBuZXdQcm9ncmVzcztcbiAgICAgIGNvbnN0IHRyYW5zbGF0ZXNEaWZmID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpIC0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpO1xuXG4gICAgICBpZiAodHJhbnNsYXRlc0RpZmYgPT09IDApIHtcbiAgICAgICAgbmV3UHJvZ3Jlc3MgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3UHJvZ3Jlc3MgPSAoc3dpcGVyLnRyYW5zbGF0ZSAtIHN3aXBlci5taW5UcmFuc2xhdGUoKSkgLyB0cmFuc2xhdGVzRGlmZjtcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld1Byb2dyZXNzICE9PSBzd2lwZXIucHJvZ3Jlc3MpIHtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKHJ0bFRyYW5zbGF0ZSA/IC1zd2lwZXIudHJhbnNsYXRlIDogc3dpcGVyLnRyYW5zbGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHN3aXBlci5lbWl0KCdzZXRUcmFuc2xhdGUnLCBzd2lwZXIudHJhbnNsYXRlLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgbGV0IGR1bW15RXZlbnRBdHRhY2hlZCA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gZHVtbXlFdmVudExpc3RlbmVyKCkge31cblxuICAgIGNvbnN0IGV2ZW50cyA9IChzd2lwZXIsIG1ldGhvZCkgPT4ge1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgY29uc3Qge1xuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHRvdWNoRXZlbnRzLFxuICAgICAgICBlbCxcbiAgICAgICAgd3JhcHBlckVsLFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHN1cHBvcnRcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICBjb25zdCBjYXB0dXJlID0gISFwYXJhbXMubmVzdGVkO1xuICAgICAgY29uc3QgZG9tTWV0aG9kID0gbWV0aG9kID09PSAnb24nID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICAgICAgY29uc3Qgc3dpcGVyTWV0aG9kID0gbWV0aG9kOyAvLyBUb3VjaCBFdmVudHNcblxuICAgICAgaWYgKCFzdXBwb3J0LnRvdWNoKSB7XG4gICAgICAgIGVsW2RvbU1ldGhvZF0odG91Y2hFdmVudHMuc3RhcnQsIHN3aXBlci5vblRvdWNoU3RhcnQsIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnRbZG9tTWV0aG9kXSh0b3VjaEV2ZW50cy5tb3ZlLCBzd2lwZXIub25Ub3VjaE1vdmUsIGNhcHR1cmUpO1xuICAgICAgICBkb2N1bWVudFtkb21NZXRob2RdKHRvdWNoRXZlbnRzLmVuZCwgc3dpcGVyLm9uVG91Y2hFbmQsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBhc3NpdmVMaXN0ZW5lciA9IHRvdWNoRXZlbnRzLnN0YXJ0ID09PSAndG91Y2hzdGFydCcgJiYgc3VwcG9ydC5wYXNzaXZlTGlzdGVuZXIgJiYgcGFyYW1zLnBhc3NpdmVMaXN0ZW5lcnMgPyB7XG4gICAgICAgICAgcGFzc2l2ZTogdHJ1ZSxcbiAgICAgICAgICBjYXB0dXJlOiBmYWxzZVxuICAgICAgICB9IDogZmFsc2U7XG4gICAgICAgIGVsW2RvbU1ldGhvZF0odG91Y2hFdmVudHMuc3RhcnQsIHN3aXBlci5vblRvdWNoU3RhcnQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgICAgIGVsW2RvbU1ldGhvZF0odG91Y2hFdmVudHMubW92ZSwgc3dpcGVyLm9uVG91Y2hNb3ZlLCBzdXBwb3J0LnBhc3NpdmVMaXN0ZW5lciA/IHtcbiAgICAgICAgICBwYXNzaXZlOiBmYWxzZSxcbiAgICAgICAgICBjYXB0dXJlXG4gICAgICAgIH0gOiBjYXB0dXJlKTtcbiAgICAgICAgZWxbZG9tTWV0aG9kXSh0b3VjaEV2ZW50cy5lbmQsIHN3aXBlci5vblRvdWNoRW5kLCBwYXNzaXZlTGlzdGVuZXIpO1xuXG4gICAgICAgIGlmICh0b3VjaEV2ZW50cy5jYW5jZWwpIHtcbiAgICAgICAgICBlbFtkb21NZXRob2RdKHRvdWNoRXZlbnRzLmNhbmNlbCwgc3dpcGVyLm9uVG91Y2hFbmQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gLy8gUHJldmVudCBMaW5rcyBDbGlja3NcblxuXG4gICAgICBpZiAocGFyYW1zLnByZXZlbnRDbGlja3MgfHwgcGFyYW1zLnByZXZlbnRDbGlja3NQcm9wYWdhdGlvbikge1xuICAgICAgICBlbFtkb21NZXRob2RdKCdjbGljaycsIHN3aXBlci5vbkNsaWNrLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgIHdyYXBwZXJFbFtkb21NZXRob2RdKCdzY3JvbGwnLCBzd2lwZXIub25TY3JvbGwpO1xuICAgICAgfSAvLyBSZXNpemUgaGFuZGxlclxuXG5cbiAgICAgIGlmIChwYXJhbXMudXBkYXRlT25XaW5kb3dSZXNpemUpIHtcbiAgICAgICAgc3dpcGVyW3N3aXBlck1ldGhvZF0oZGV2aWNlLmlvcyB8fCBkZXZpY2UuYW5kcm9pZCA/ICdyZXNpemUgb3JpZW50YXRpb25jaGFuZ2Ugb2JzZXJ2ZXJVcGRhdGUnIDogJ3Jlc2l6ZSBvYnNlcnZlclVwZGF0ZScsIG9uUmVzaXplLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN3aXBlcltzd2lwZXJNZXRob2RdKCdvYnNlcnZlclVwZGF0ZScsIG9uUmVzaXplLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gYXR0YWNoRXZlbnRzKCkge1xuICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgIGNvbnN0IGRvY3VtZW50ID0gZ2V0RG9jdW1lbnQoKTtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgcGFyYW1zLFxuICAgICAgICBzdXBwb3J0XG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgc3dpcGVyLm9uVG91Y2hTdGFydCA9IG9uVG91Y2hTdGFydC5iaW5kKHN3aXBlcik7XG4gICAgICBzd2lwZXIub25Ub3VjaE1vdmUgPSBvblRvdWNoTW92ZS5iaW5kKHN3aXBlcik7XG4gICAgICBzd2lwZXIub25Ub3VjaEVuZCA9IG9uVG91Y2hFbmQuYmluZChzd2lwZXIpO1xuXG4gICAgICBpZiAocGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgc3dpcGVyLm9uU2Nyb2xsID0gb25TY3JvbGwuYmluZChzd2lwZXIpO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIub25DbGljayA9IG9uQ2xpY2suYmluZChzd2lwZXIpO1xuXG4gICAgICBpZiAoc3VwcG9ydC50b3VjaCAmJiAhZHVtbXlFdmVudEF0dGFjaGVkKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBkdW1teUV2ZW50TGlzdGVuZXIpO1xuICAgICAgICBkdW1teUV2ZW50QXR0YWNoZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBldmVudHMoc3dpcGVyLCAnb24nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXRhY2hFdmVudHMoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgZXZlbnRzKHN3aXBlciwgJ29mZicpO1xuICAgIH1cblxuICAgIHZhciBldmVudHMkMSA9IHtcbiAgICAgIGF0dGFjaEV2ZW50cyxcbiAgICAgIGRldGFjaEV2ZW50c1xuICAgIH07XG5cbiAgICBjb25zdCBpc0dyaWRFbmFibGVkID0gKHN3aXBlciwgcGFyYW1zKSA9PiB7XG4gICAgICByZXR1cm4gc3dpcGVyLmdyaWQgJiYgcGFyYW1zLmdyaWQgJiYgcGFyYW1zLmdyaWQucm93cyA+IDE7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNldEJyZWFrcG9pbnQoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBhY3RpdmVJbmRleCxcbiAgICAgICAgaW5pdGlhbGl6ZWQsXG4gICAgICAgIGxvb3BlZFNsaWRlcyA9IDAsXG4gICAgICAgIHBhcmFtcyxcbiAgICAgICAgJGVsXG4gICAgICB9ID0gc3dpcGVyO1xuICAgICAgY29uc3QgYnJlYWtwb2ludHMgPSBwYXJhbXMuYnJlYWtwb2ludHM7XG4gICAgICBpZiAoIWJyZWFrcG9pbnRzIHx8IGJyZWFrcG9pbnRzICYmIE9iamVjdC5rZXlzKGJyZWFrcG9pbnRzKS5sZW5ndGggPT09IDApIHJldHVybjsgLy8gR2V0IGJyZWFrcG9pbnQgZm9yIHdpbmRvdyB3aWR0aCBhbmQgdXBkYXRlIHBhcmFtZXRlcnNcblxuICAgICAgY29uc3QgYnJlYWtwb2ludCA9IHN3aXBlci5nZXRCcmVha3BvaW50KGJyZWFrcG9pbnRzLCBzd2lwZXIucGFyYW1zLmJyZWFrcG9pbnRzQmFzZSwgc3dpcGVyLmVsKTtcbiAgICAgIGlmICghYnJlYWtwb2ludCB8fCBzd2lwZXIuY3VycmVudEJyZWFrcG9pbnQgPT09IGJyZWFrcG9pbnQpIHJldHVybjtcbiAgICAgIGNvbnN0IGJyZWFrcG9pbnRPbmx5UGFyYW1zID0gYnJlYWtwb2ludCBpbiBicmVha3BvaW50cyA/IGJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdIDogdW5kZWZpbmVkO1xuICAgICAgY29uc3QgYnJlYWtwb2ludFBhcmFtcyA9IGJyZWFrcG9pbnRPbmx5UGFyYW1zIHx8IHN3aXBlci5vcmlnaW5hbFBhcmFtcztcbiAgICAgIGNvbnN0IHdhc011bHRpUm93ID0gaXNHcmlkRW5hYmxlZChzd2lwZXIsIHBhcmFtcyk7XG4gICAgICBjb25zdCBpc011bHRpUm93ID0gaXNHcmlkRW5hYmxlZChzd2lwZXIsIGJyZWFrcG9pbnRQYXJhbXMpO1xuICAgICAgY29uc3Qgd2FzRW5hYmxlZCA9IHBhcmFtcy5lbmFibGVkO1xuXG4gICAgICBpZiAod2FzTXVsdGlSb3cgJiYgIWlzTXVsdGlSb3cpIHtcbiAgICAgICAgJGVsLnJlbW92ZUNsYXNzKGAke3BhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzfWdyaWQgJHtwYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzc31ncmlkLWNvbHVtbmApO1xuICAgICAgICBzd2lwZXIuZW1pdENvbnRhaW5lckNsYXNzZXMoKTtcbiAgICAgIH0gZWxzZSBpZiAoIXdhc011bHRpUm93ICYmIGlzTXVsdGlSb3cpIHtcbiAgICAgICAgJGVsLmFkZENsYXNzKGAke3BhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzfWdyaWRgKTtcblxuICAgICAgICBpZiAoYnJlYWtwb2ludFBhcmFtcy5ncmlkLmZpbGwgJiYgYnJlYWtwb2ludFBhcmFtcy5ncmlkLmZpbGwgPT09ICdjb2x1bW4nIHx8ICFicmVha3BvaW50UGFyYW1zLmdyaWQuZmlsbCAmJiBwYXJhbXMuZ3JpZC5maWxsID09PSAnY29sdW1uJykge1xuICAgICAgICAgICRlbC5hZGRDbGFzcyhgJHtwYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzc31ncmlkLWNvbHVtbmApO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLmVtaXRDb250YWluZXJDbGFzc2VzKCk7XG4gICAgICB9IC8vIFRvZ2dsZSBuYXZpZ2F0aW9uLCBwYWdpbmF0aW9uLCBzY3JvbGxiYXJcblxuXG4gICAgICBbJ25hdmlnYXRpb24nLCAncGFnaW5hdGlvbicsICdzY3JvbGxiYXInXS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICBjb25zdCB3YXNNb2R1bGVFbmFibGVkID0gcGFyYW1zW3Byb3BdICYmIHBhcmFtc1twcm9wXS5lbmFibGVkO1xuICAgICAgICBjb25zdCBpc01vZHVsZUVuYWJsZWQgPSBicmVha3BvaW50UGFyYW1zW3Byb3BdICYmIGJyZWFrcG9pbnRQYXJhbXNbcHJvcF0uZW5hYmxlZDtcblxuICAgICAgICBpZiAod2FzTW9kdWxlRW5hYmxlZCAmJiAhaXNNb2R1bGVFbmFibGVkKSB7XG4gICAgICAgICAgc3dpcGVyW3Byb3BdLmRpc2FibGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghd2FzTW9kdWxlRW5hYmxlZCAmJiBpc01vZHVsZUVuYWJsZWQpIHtcbiAgICAgICAgICBzd2lwZXJbcHJvcF0uZW5hYmxlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3QgZGlyZWN0aW9uQ2hhbmdlZCA9IGJyZWFrcG9pbnRQYXJhbXMuZGlyZWN0aW9uICYmIGJyZWFrcG9pbnRQYXJhbXMuZGlyZWN0aW9uICE9PSBwYXJhbXMuZGlyZWN0aW9uO1xuICAgICAgY29uc3QgbmVlZHNSZUxvb3AgPSBwYXJhbXMubG9vcCAmJiAoYnJlYWtwb2ludFBhcmFtcy5zbGlkZXNQZXJWaWV3ICE9PSBwYXJhbXMuc2xpZGVzUGVyVmlldyB8fCBkaXJlY3Rpb25DaGFuZ2VkKTtcblxuICAgICAgaWYgKGRpcmVjdGlvbkNoYW5nZWQgJiYgaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgc3dpcGVyLmNoYW5nZURpcmVjdGlvbigpO1xuICAgICAgfVxuXG4gICAgICBleHRlbmQoc3dpcGVyLnBhcmFtcywgYnJlYWtwb2ludFBhcmFtcyk7XG4gICAgICBjb25zdCBpc0VuYWJsZWQgPSBzd2lwZXIucGFyYW1zLmVuYWJsZWQ7XG4gICAgICBPYmplY3QuYXNzaWduKHN3aXBlciwge1xuICAgICAgICBhbGxvd1RvdWNoTW92ZTogc3dpcGVyLnBhcmFtcy5hbGxvd1RvdWNoTW92ZSxcbiAgICAgICAgYWxsb3dTbGlkZU5leHQ6IHN3aXBlci5wYXJhbXMuYWxsb3dTbGlkZU5leHQsXG4gICAgICAgIGFsbG93U2xpZGVQcmV2OiBzd2lwZXIucGFyYW1zLmFsbG93U2xpZGVQcmV2XG4gICAgICB9KTtcblxuICAgICAgaWYgKHdhc0VuYWJsZWQgJiYgIWlzRW5hYmxlZCkge1xuICAgICAgICBzd2lwZXIuZGlzYWJsZSgpO1xuICAgICAgfSBlbHNlIGlmICghd2FzRW5hYmxlZCAmJiBpc0VuYWJsZWQpIHtcbiAgICAgICAgc3dpcGVyLmVuYWJsZSgpO1xuICAgICAgfVxuXG4gICAgICBzd2lwZXIuY3VycmVudEJyZWFrcG9pbnQgPSBicmVha3BvaW50O1xuICAgICAgc3dpcGVyLmVtaXQoJ19iZWZvcmVCcmVha3BvaW50JywgYnJlYWtwb2ludFBhcmFtcyk7XG5cbiAgICAgIGlmIChuZWVkc1JlTG9vcCAmJiBpbml0aWFsaXplZCkge1xuICAgICAgICBzd2lwZXIubG9vcERlc3Ryb3koKTtcbiAgICAgICAgc3dpcGVyLmxvb3BDcmVhdGUoKTtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlcygpO1xuICAgICAgICBzd2lwZXIuc2xpZGVUbyhhY3RpdmVJbmRleCAtIGxvb3BlZFNsaWRlcyArIHN3aXBlci5sb29wZWRTbGlkZXMsIDAsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgc3dpcGVyLmVtaXQoJ2JyZWFrcG9pbnQnLCBicmVha3BvaW50UGFyYW1zKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCcmVha3BvaW50KGJyZWFrcG9pbnRzLCBiYXNlLCBjb250YWluZXJFbCkge1xuICAgICAgaWYgKGJhc2UgPT09IHZvaWQgMCkge1xuICAgICAgICBiYXNlID0gJ3dpbmRvdyc7XG4gICAgICB9XG5cbiAgICAgIGlmICghYnJlYWtwb2ludHMgfHwgYmFzZSA9PT0gJ2NvbnRhaW5lcicgJiYgIWNvbnRhaW5lckVsKSByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgbGV0IGJyZWFrcG9pbnQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHdpbmRvdyA9IGdldFdpbmRvdygpO1xuICAgICAgY29uc3QgY3VycmVudEhlaWdodCA9IGJhc2UgPT09ICd3aW5kb3cnID8gd2luZG93LmlubmVySGVpZ2h0IDogY29udGFpbmVyRWwuY2xpZW50SGVpZ2h0O1xuICAgICAgY29uc3QgcG9pbnRzID0gT2JqZWN0LmtleXMoYnJlYWtwb2ludHMpLm1hcChwb2ludCA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgcG9pbnQgPT09ICdzdHJpbmcnICYmIHBvaW50LmluZGV4T2YoJ0AnKSA9PT0gMCkge1xuICAgICAgICAgIGNvbnN0IG1pblJhdGlvID0gcGFyc2VGbG9hdChwb2ludC5zdWJzdHIoMSkpO1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gY3VycmVudEhlaWdodCAqIG1pblJhdGlvO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIHBvaW50XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdmFsdWU6IHBvaW50LFxuICAgICAgICAgIHBvaW50XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIHBvaW50cy5zb3J0KChhLCBiKSA9PiBwYXJzZUludChhLnZhbHVlLCAxMCkgLSBwYXJzZUludChiLnZhbHVlLCAxMCkpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgcG9pbnQsXG4gICAgICAgICAgdmFsdWVcbiAgICAgICAgfSA9IHBvaW50c1tpXTtcblxuICAgICAgICBpZiAoYmFzZSA9PT0gJ3dpbmRvdycpIHtcbiAgICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoYChtaW4td2lkdGg6ICR7dmFsdWV9cHgpYCkubWF0Y2hlcykge1xuICAgICAgICAgICAgYnJlYWtwb2ludCA9IHBvaW50O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA8PSBjb250YWluZXJFbC5jbGllbnRXaWR0aCkge1xuICAgICAgICAgIGJyZWFrcG9pbnQgPSBwb2ludDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gYnJlYWtwb2ludCB8fCAnbWF4JztcbiAgICB9XG5cbiAgICB2YXIgYnJlYWtwb2ludHMgPSB7XG4gICAgICBzZXRCcmVha3BvaW50LFxuICAgICAgZ2V0QnJlYWtwb2ludFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwcmVwYXJlQ2xhc3NlcyhlbnRyaWVzLCBwcmVmaXgpIHtcbiAgICAgIGNvbnN0IHJlc3VsdENsYXNzZXMgPSBbXTtcbiAgICAgIGVudHJpZXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIE9iamVjdC5rZXlzKGl0ZW0pLmZvckVhY2goY2xhc3NOYW1lcyA9PiB7XG4gICAgICAgICAgICBpZiAoaXRlbVtjbGFzc05hbWVzXSkge1xuICAgICAgICAgICAgICByZXN1bHRDbGFzc2VzLnB1c2gocHJlZml4ICsgY2xhc3NOYW1lcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgcmVzdWx0Q2xhc3Nlcy5wdXNoKHByZWZpeCArIGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHRDbGFzc2VzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZENsYXNzZXMoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBjbGFzc05hbWVzLFxuICAgICAgICBwYXJhbXMsXG4gICAgICAgIHJ0bCxcbiAgICAgICAgJGVsLFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHN1cHBvcnRcbiAgICAgIH0gPSBzd2lwZXI7IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gICAgICBjb25zdCBzdWZmaXhlcyA9IHByZXBhcmVDbGFzc2VzKFsnaW5pdGlhbGl6ZWQnLCBwYXJhbXMuZGlyZWN0aW9uLCB7XG4gICAgICAgICdwb2ludGVyLWV2ZW50cyc6ICFzdXBwb3J0LnRvdWNoXG4gICAgICB9LCB7XG4gICAgICAgICdmcmVlLW1vZGUnOiBzd2lwZXIucGFyYW1zLmZyZWVNb2RlICYmIHBhcmFtcy5mcmVlTW9kZS5lbmFibGVkXG4gICAgICB9LCB7XG4gICAgICAgICdhdXRvaGVpZ2h0JzogcGFyYW1zLmF1dG9IZWlnaHRcbiAgICAgIH0sIHtcbiAgICAgICAgJ3J0bCc6IHJ0bFxuICAgICAgfSwge1xuICAgICAgICAnZ3JpZCc6IHBhcmFtcy5ncmlkICYmIHBhcmFtcy5ncmlkLnJvd3MgPiAxXG4gICAgICB9LCB7XG4gICAgICAgICdncmlkLWNvbHVtbic6IHBhcmFtcy5ncmlkICYmIHBhcmFtcy5ncmlkLnJvd3MgPiAxICYmIHBhcmFtcy5ncmlkLmZpbGwgPT09ICdjb2x1bW4nXG4gICAgICB9LCB7XG4gICAgICAgICdhbmRyb2lkJzogZGV2aWNlLmFuZHJvaWRcbiAgICAgIH0sIHtcbiAgICAgICAgJ2lvcyc6IGRldmljZS5pb3NcbiAgICAgIH0sIHtcbiAgICAgICAgJ2Nzcy1tb2RlJzogcGFyYW1zLmNzc01vZGVcbiAgICAgIH0sIHtcbiAgICAgICAgJ2NlbnRlcmVkJzogcGFyYW1zLmNzc01vZGUgJiYgcGFyYW1zLmNlbnRlcmVkU2xpZGVzXG4gICAgICB9LCB7XG4gICAgICAgICd3YXRjaC1wcm9ncmVzcyc6IHBhcmFtcy53YXRjaFNsaWRlc1Byb2dyZXNzXG4gICAgICB9XSwgcGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3MpO1xuICAgICAgY2xhc3NOYW1lcy5wdXNoKC4uLnN1ZmZpeGVzKTtcbiAgICAgICRlbC5hZGRDbGFzcyhbLi4uY2xhc3NOYW1lc10uam9pbignICcpKTtcbiAgICAgIHN3aXBlci5lbWl0Q29udGFpbmVyQ2xhc3NlcygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUNsYXNzZXMoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgY29uc3Qge1xuICAgICAgICAkZWwsXG4gICAgICAgIGNsYXNzTmFtZXNcbiAgICAgIH0gPSBzd2lwZXI7XG4gICAgICAkZWwucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lcy5qb2luKCcgJykpO1xuICAgICAgc3dpcGVyLmVtaXRDb250YWluZXJDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzZXMgPSB7XG4gICAgICBhZGRDbGFzc2VzLFxuICAgICAgcmVtb3ZlQ2xhc3Nlc1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsb2FkSW1hZ2UoaW1hZ2VFbCwgc3JjLCBzcmNzZXQsIHNpemVzLCBjaGVja0ZvckNvbXBsZXRlLCBjYWxsYmFjaykge1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBsZXQgaW1hZ2U7XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVhZHkoKSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNQaWN0dXJlID0gJCQxKGltYWdlRWwpLnBhcmVudCgncGljdHVyZScpWzBdO1xuXG4gICAgICBpZiAoIWlzUGljdHVyZSAmJiAoIWltYWdlRWwuY29tcGxldGUgfHwgIWNoZWNrRm9yQ29tcGxldGUpKSB7XG4gICAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgICBpbWFnZSA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcbiAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBvblJlYWR5O1xuICAgICAgICAgIGltYWdlLm9uZXJyb3IgPSBvblJlYWR5O1xuXG4gICAgICAgICAgaWYgKHNpemVzKSB7XG4gICAgICAgICAgICBpbWFnZS5zaXplcyA9IHNpemVzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzcmNzZXQpIHtcbiAgICAgICAgICAgIGltYWdlLnNyY3NldCA9IHNyY3NldDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICBpbWFnZS5zcmMgPSBzcmM7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9uUmVhZHkoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaW1hZ2UgYWxyZWFkeSBsb2FkZWQuLi5cbiAgICAgICAgb25SZWFkeSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByZWxvYWRJbWFnZXMoKSB7XG4gICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgc3dpcGVyLmltYWdlc1RvTG9hZCA9IHN3aXBlci4kZWwuZmluZCgnaW1nJyk7XG5cbiAgICAgIGZ1bmN0aW9uIG9uUmVhZHkoKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3dpcGVyID09PSAndW5kZWZpbmVkJyB8fCBzd2lwZXIgPT09IG51bGwgfHwgIXN3aXBlciB8fCBzd2lwZXIuZGVzdHJveWVkKSByZXR1cm47XG4gICAgICAgIGlmIChzd2lwZXIuaW1hZ2VzTG9hZGVkICE9PSB1bmRlZmluZWQpIHN3aXBlci5pbWFnZXNMb2FkZWQgKz0gMTtcblxuICAgICAgICBpZiAoc3dpcGVyLmltYWdlc0xvYWRlZCA9PT0gc3dpcGVyLmltYWdlc1RvTG9hZC5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy51cGRhdGVPbkltYWdlc1JlYWR5KSBzd2lwZXIudXBkYXRlKCk7XG4gICAgICAgICAgc3dpcGVyLmVtaXQoJ2ltYWdlc1JlYWR5Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzd2lwZXIuaW1hZ2VzVG9Mb2FkLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IGltYWdlRWwgPSBzd2lwZXIuaW1hZ2VzVG9Mb2FkW2ldO1xuICAgICAgICBzd2lwZXIubG9hZEltYWdlKGltYWdlRWwsIGltYWdlRWwuY3VycmVudFNyYyB8fCBpbWFnZUVsLmdldEF0dHJpYnV0ZSgnc3JjJyksIGltYWdlRWwuc3Jjc2V0IHx8IGltYWdlRWwuZ2V0QXR0cmlidXRlKCdzcmNzZXQnKSwgaW1hZ2VFbC5zaXplcyB8fCBpbWFnZUVsLmdldEF0dHJpYnV0ZSgnc2l6ZXMnKSwgdHJ1ZSwgb25SZWFkeSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGltYWdlcyA9IHtcbiAgICAgIGxvYWRJbWFnZSxcbiAgICAgIHByZWxvYWRJbWFnZXNcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY2hlY2tPdmVyZmxvdygpIHtcbiAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzTG9ja2VkOiB3YXNMb2NrZWQsXG4gICAgICAgIHBhcmFtc1xuICAgICAgfSA9IHN3aXBlcjtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgc2xpZGVzT2Zmc2V0QmVmb3JlXG4gICAgICB9ID0gcGFyYW1zO1xuXG4gICAgICBpZiAoc2xpZGVzT2Zmc2V0QmVmb3JlKSB7XG4gICAgICAgIGNvbnN0IGxhc3RTbGlkZUluZGV4ID0gc3dpcGVyLnNsaWRlcy5sZW5ndGggLSAxO1xuICAgICAgICBjb25zdCBsYXN0U2xpZGVSaWdodEVkZ2UgPSBzd2lwZXIuc2xpZGVzR3JpZFtsYXN0U2xpZGVJbmRleF0gKyBzd2lwZXIuc2xpZGVzU2l6ZXNHcmlkW2xhc3RTbGlkZUluZGV4XSArIHNsaWRlc09mZnNldEJlZm9yZSAqIDI7XG4gICAgICAgIHN3aXBlci5pc0xvY2tlZCA9IHN3aXBlci5zaXplID4gbGFzdFNsaWRlUmlnaHRFZGdlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3dpcGVyLmlzTG9ja2VkID0gc3dpcGVyLnNuYXBHcmlkLmxlbmd0aCA9PT0gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5hbGxvd1NsaWRlTmV4dCA9PT0gdHJ1ZSkge1xuICAgICAgICBzd2lwZXIuYWxsb3dTbGlkZU5leHQgPSAhc3dpcGVyLmlzTG9ja2VkO1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyYW1zLmFsbG93U2xpZGVQcmV2ID09PSB0cnVlKSB7XG4gICAgICAgIHN3aXBlci5hbGxvd1NsaWRlUHJldiA9ICFzd2lwZXIuaXNMb2NrZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmICh3YXNMb2NrZWQgJiYgd2FzTG9ja2VkICE9PSBzd2lwZXIuaXNMb2NrZWQpIHtcbiAgICAgICAgc3dpcGVyLmlzRW5kID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGlmICh3YXNMb2NrZWQgIT09IHN3aXBlci5pc0xvY2tlZCkge1xuICAgICAgICBzd2lwZXIuZW1pdChzd2lwZXIuaXNMb2NrZWQgPyAnbG9jaycgOiAndW5sb2NrJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNoZWNrT3ZlcmZsb3ckMSA9IHtcbiAgICAgIGNoZWNrT3ZlcmZsb3dcbiAgICB9O1xuXG4gICAgdmFyIGRlZmF1bHRzID0ge1xuICAgICAgaW5pdDogdHJ1ZSxcbiAgICAgIGRpcmVjdGlvbjogJ2hvcml6b250YWwnLFxuICAgICAgdG91Y2hFdmVudHNUYXJnZXQ6ICd3cmFwcGVyJyxcbiAgICAgIGluaXRpYWxTbGlkZTogMCxcbiAgICAgIHNwZWVkOiAzMDAsXG4gICAgICBjc3NNb2RlOiBmYWxzZSxcbiAgICAgIHVwZGF0ZU9uV2luZG93UmVzaXplOiB0cnVlLFxuICAgICAgcmVzaXplT2JzZXJ2ZXI6IHRydWUsXG4gICAgICBuZXN0ZWQ6IGZhbHNlLFxuICAgICAgY3JlYXRlRWxlbWVudHM6IGZhbHNlLFxuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGZvY3VzYWJsZUVsZW1lbnRzOiAnaW5wdXQsIHNlbGVjdCwgb3B0aW9uLCB0ZXh0YXJlYSwgYnV0dG9uLCB2aWRlbywgbGFiZWwnLFxuICAgICAgLy8gT3ZlcnJpZGVzXG4gICAgICB3aWR0aDogbnVsbCxcbiAgICAgIGhlaWdodDogbnVsbCxcbiAgICAgIC8vXG4gICAgICBwcmV2ZW50SW50ZXJhY3Rpb25PblRyYW5zaXRpb246IGZhbHNlLFxuICAgICAgLy8gc3NyXG4gICAgICB1c2VyQWdlbnQ6IG51bGwsXG4gICAgICB1cmw6IG51bGwsXG4gICAgICAvLyBUbyBzdXBwb3J0IGlPUydzIHN3aXBlLXRvLWdvLWJhY2sgZ2VzdHVyZSAod2hlbiBiZWluZyB1c2VkIGluLWFwcCkuXG4gICAgICBlZGdlU3dpcGVEZXRlY3Rpb246IGZhbHNlLFxuICAgICAgZWRnZVN3aXBlVGhyZXNob2xkOiAyMCxcbiAgICAgIC8vIEF1dG9oZWlnaHRcbiAgICAgIGF1dG9IZWlnaHQ6IGZhbHNlLFxuICAgICAgLy8gU2V0IHdyYXBwZXIgd2lkdGhcbiAgICAgIHNldFdyYXBwZXJTaXplOiBmYWxzZSxcbiAgICAgIC8vIFZpcnR1YWwgVHJhbnNsYXRlXG4gICAgICB2aXJ0dWFsVHJhbnNsYXRlOiBmYWxzZSxcbiAgICAgIC8vIEVmZmVjdHNcbiAgICAgIGVmZmVjdDogJ3NsaWRlJyxcbiAgICAgIC8vICdzbGlkZScgb3IgJ2ZhZGUnIG9yICdjdWJlJyBvciAnY292ZXJmbG93JyBvciAnZmxpcCdcbiAgICAgIC8vIEJyZWFrcG9pbnRzXG4gICAgICBicmVha3BvaW50czogdW5kZWZpbmVkLFxuICAgICAgYnJlYWtwb2ludHNCYXNlOiAnd2luZG93JyxcbiAgICAgIC8vIFNsaWRlcyBncmlkXG4gICAgICBzcGFjZUJldHdlZW46IDAsXG4gICAgICBzbGlkZXNQZXJWaWV3OiAxLFxuICAgICAgc2xpZGVzUGVyR3JvdXA6IDEsXG4gICAgICBzbGlkZXNQZXJHcm91cFNraXA6IDAsXG4gICAgICBzbGlkZXNQZXJHcm91cEF1dG86IGZhbHNlLFxuICAgICAgY2VudGVyZWRTbGlkZXM6IGZhbHNlLFxuICAgICAgY2VudGVyZWRTbGlkZXNCb3VuZHM6IGZhbHNlLFxuICAgICAgc2xpZGVzT2Zmc2V0QmVmb3JlOiAwLFxuICAgICAgLy8gaW4gcHhcbiAgICAgIHNsaWRlc09mZnNldEFmdGVyOiAwLFxuICAgICAgLy8gaW4gcHhcbiAgICAgIG5vcm1hbGl6ZVNsaWRlSW5kZXg6IHRydWUsXG4gICAgICBjZW50ZXJJbnN1ZmZpY2llbnRTbGlkZXM6IGZhbHNlLFxuICAgICAgLy8gRGlzYWJsZSBzd2lwZXIgYW5kIGhpZGUgbmF2aWdhdGlvbiB3aGVuIGNvbnRhaW5lciBub3Qgb3ZlcmZsb3dcbiAgICAgIHdhdGNoT3ZlcmZsb3c6IHRydWUsXG4gICAgICAvLyBSb3VuZCBsZW5ndGhcbiAgICAgIHJvdW5kTGVuZ3RoczogZmFsc2UsXG4gICAgICAvLyBUb3VjaGVzXG4gICAgICB0b3VjaFJhdGlvOiAxLFxuICAgICAgdG91Y2hBbmdsZTogNDUsXG4gICAgICBzaW11bGF0ZVRvdWNoOiB0cnVlLFxuICAgICAgc2hvcnRTd2lwZXM6IHRydWUsXG4gICAgICBsb25nU3dpcGVzOiB0cnVlLFxuICAgICAgbG9uZ1N3aXBlc1JhdGlvOiAwLjUsXG4gICAgICBsb25nU3dpcGVzTXM6IDMwMCxcbiAgICAgIGZvbGxvd0ZpbmdlcjogdHJ1ZSxcbiAgICAgIGFsbG93VG91Y2hNb3ZlOiB0cnVlLFxuICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgdG91Y2hNb3ZlU3RvcFByb3BhZ2F0aW9uOiBmYWxzZSxcbiAgICAgIHRvdWNoU3RhcnRQcmV2ZW50RGVmYXVsdDogdHJ1ZSxcbiAgICAgIHRvdWNoU3RhcnRGb3JjZVByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICAgIHRvdWNoUmVsZWFzZU9uRWRnZXM6IGZhbHNlLFxuICAgICAgLy8gVW5pcXVlIE5hdmlnYXRpb24gRWxlbWVudHNcbiAgICAgIHVuaXF1ZU5hdkVsZW1lbnRzOiB0cnVlLFxuICAgICAgLy8gUmVzaXN0YW5jZVxuICAgICAgcmVzaXN0YW5jZTogdHJ1ZSxcbiAgICAgIHJlc2lzdGFuY2VSYXRpbzogMC44NSxcbiAgICAgIC8vIFByb2dyZXNzXG4gICAgICB3YXRjaFNsaWRlc1Byb2dyZXNzOiBmYWxzZSxcbiAgICAgIC8vIEN1cnNvclxuICAgICAgZ3JhYkN1cnNvcjogZmFsc2UsXG4gICAgICAvLyBDbGlja3NcbiAgICAgIHByZXZlbnRDbGlja3M6IHRydWUsXG4gICAgICBwcmV2ZW50Q2xpY2tzUHJvcGFnYXRpb246IHRydWUsXG4gICAgICBzbGlkZVRvQ2xpY2tlZFNsaWRlOiBmYWxzZSxcbiAgICAgIC8vIEltYWdlc1xuICAgICAgcHJlbG9hZEltYWdlczogdHJ1ZSxcbiAgICAgIHVwZGF0ZU9uSW1hZ2VzUmVhZHk6IHRydWUsXG4gICAgICAvLyBsb29wXG4gICAgICBsb29wOiBmYWxzZSxcbiAgICAgIGxvb3BBZGRpdGlvbmFsU2xpZGVzOiAwLFxuICAgICAgbG9vcGVkU2xpZGVzOiBudWxsLFxuICAgICAgbG9vcGVkU2xpZGVzTGltaXQ6IHRydWUsXG4gICAgICBsb29wRmlsbEdyb3VwV2l0aEJsYW5rOiBmYWxzZSxcbiAgICAgIGxvb3BQcmV2ZW50c1NsaWRlOiB0cnVlLFxuICAgICAgLy8gcmV3aW5kXG4gICAgICByZXdpbmQ6IGZhbHNlLFxuICAgICAgLy8gU3dpcGluZy9ubyBzd2lwaW5nXG4gICAgICBhbGxvd1NsaWRlUHJldjogdHJ1ZSxcbiAgICAgIGFsbG93U2xpZGVOZXh0OiB0cnVlLFxuICAgICAgc3dpcGVIYW5kbGVyOiBudWxsLFxuICAgICAgLy8gJy5zd2lwZS1oYW5kbGVyJyxcbiAgICAgIG5vU3dpcGluZzogdHJ1ZSxcbiAgICAgIG5vU3dpcGluZ0NsYXNzOiAnc3dpcGVyLW5vLXN3aXBpbmcnLFxuICAgICAgbm9Td2lwaW5nU2VsZWN0b3I6IG51bGwsXG4gICAgICAvLyBQYXNzaXZlIExpc3RlbmVyc1xuICAgICAgcGFzc2l2ZUxpc3RlbmVyczogdHJ1ZSxcbiAgICAgIG1heEJhY2tmYWNlSGlkZGVuU2xpZGVzOiAxMCxcbiAgICAgIC8vIE5TXG4gICAgICBjb250YWluZXJNb2RpZmllckNsYXNzOiAnc3dpcGVyLScsXG4gICAgICAvLyBORVdcbiAgICAgIHNsaWRlQ2xhc3M6ICdzd2lwZXItc2xpZGUnLFxuICAgICAgc2xpZGVCbGFua0NsYXNzOiAnc3dpcGVyLXNsaWRlLWludmlzaWJsZS1ibGFuaycsXG4gICAgICBzbGlkZUFjdGl2ZUNsYXNzOiAnc3dpcGVyLXNsaWRlLWFjdGl2ZScsXG4gICAgICBzbGlkZUR1cGxpY2F0ZUFjdGl2ZUNsYXNzOiAnc3dpcGVyLXNsaWRlLWR1cGxpY2F0ZS1hY3RpdmUnLFxuICAgICAgc2xpZGVWaXNpYmxlQ2xhc3M6ICdzd2lwZXItc2xpZGUtdmlzaWJsZScsXG4gICAgICBzbGlkZUR1cGxpY2F0ZUNsYXNzOiAnc3dpcGVyLXNsaWRlLWR1cGxpY2F0ZScsXG4gICAgICBzbGlkZU5leHRDbGFzczogJ3N3aXBlci1zbGlkZS1uZXh0JyxcbiAgICAgIHNsaWRlRHVwbGljYXRlTmV4dENsYXNzOiAnc3dpcGVyLXNsaWRlLWR1cGxpY2F0ZS1uZXh0JyxcbiAgICAgIHNsaWRlUHJldkNsYXNzOiAnc3dpcGVyLXNsaWRlLXByZXYnLFxuICAgICAgc2xpZGVEdXBsaWNhdGVQcmV2Q2xhc3M6ICdzd2lwZXItc2xpZGUtZHVwbGljYXRlLXByZXYnLFxuICAgICAgd3JhcHBlckNsYXNzOiAnc3dpcGVyLXdyYXBwZXInLFxuICAgICAgLy8gQ2FsbGJhY2tzXG4gICAgICBydW5DYWxsYmFja3NPbkluaXQ6IHRydWUsXG4gICAgICAvLyBJbnRlcm5hbHNcbiAgICAgIF9lbWl0Q2xhc3NlczogZmFsc2VcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbW9kdWxlRXh0ZW5kUGFyYW1zKHBhcmFtcywgYWxsTW9kdWxlc1BhcmFtcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGV4dGVuZFBhcmFtcyhvYmopIHtcbiAgICAgICAgaWYgKG9iaiA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgb2JqID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtb2R1bGVQYXJhbU5hbWUgPSBPYmplY3Qua2V5cyhvYmopWzBdO1xuICAgICAgICBjb25zdCBtb2R1bGVQYXJhbXMgPSBvYmpbbW9kdWxlUGFyYW1OYW1lXTtcblxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZVBhcmFtcyAhPT0gJ29iamVjdCcgfHwgbW9kdWxlUGFyYW1zID09PSBudWxsKSB7XG4gICAgICAgICAgZXh0ZW5kKGFsbE1vZHVsZXNQYXJhbXMsIG9iaik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKFsnbmF2aWdhdGlvbicsICdwYWdpbmF0aW9uJywgJ3Njcm9sbGJhciddLmluZGV4T2YobW9kdWxlUGFyYW1OYW1lKSA+PSAwICYmIHBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdID09PSB0cnVlKSB7XG4gICAgICAgICAgcGFyYW1zW21vZHVsZVBhcmFtTmFtZV0gPSB7XG4gICAgICAgICAgICBhdXRvOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKG1vZHVsZVBhcmFtTmFtZSBpbiBwYXJhbXMgJiYgJ2VuYWJsZWQnIGluIG1vZHVsZVBhcmFtcykpIHtcbiAgICAgICAgICBleHRlbmQoYWxsTW9kdWxlc1BhcmFtcywgb2JqKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zW21vZHVsZVBhcmFtTmFtZV0gPT09IHRydWUpIHtcbiAgICAgICAgICBwYXJhbXNbbW9kdWxlUGFyYW1OYW1lXSA9IHtcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXNbbW9kdWxlUGFyYW1OYW1lXSA9PT0gJ29iamVjdCcgJiYgISgnZW5hYmxlZCcgaW4gcGFyYW1zW21vZHVsZVBhcmFtTmFtZV0pKSB7XG4gICAgICAgICAgcGFyYW1zW21vZHVsZVBhcmFtTmFtZV0uZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhcmFtc1ttb2R1bGVQYXJhbU5hbWVdKSBwYXJhbXNbbW9kdWxlUGFyYW1OYW1lXSA9IHtcbiAgICAgICAgICBlbmFibGVkOiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBleHRlbmQoYWxsTW9kdWxlc1BhcmFtcywgb2JqKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyogZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOiBcIm9mZlwiICovXG4gICAgY29uc3QgcHJvdG90eXBlcyA9IHtcbiAgICAgIGV2ZW50c0VtaXR0ZXIsXG4gICAgICB1cGRhdGUsXG4gICAgICB0cmFuc2xhdGUsXG4gICAgICB0cmFuc2l0aW9uLFxuICAgICAgc2xpZGUsXG4gICAgICBsb29wLFxuICAgICAgZ3JhYkN1cnNvcixcbiAgICAgIGV2ZW50czogZXZlbnRzJDEsXG4gICAgICBicmVha3BvaW50cyxcbiAgICAgIGNoZWNrT3ZlcmZsb3c6IGNoZWNrT3ZlcmZsb3ckMSxcbiAgICAgIGNsYXNzZXMsXG4gICAgICBpbWFnZXNcbiAgICB9O1xuICAgIGNvbnN0IGV4dGVuZGVkRGVmYXVsdHMgPSB7fTtcblxuICAgIGNsYXNzIFN3aXBlciB7XG4gICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgbGV0IGVsO1xuICAgICAgICBsZXQgcGFyYW1zO1xuXG4gICAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgYXJnc1swXS5jb25zdHJ1Y3RvciAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJnc1swXSkuc2xpY2UoOCwgLTEpID09PSAnT2JqZWN0Jykge1xuICAgICAgICAgIHBhcmFtcyA9IGFyZ3NbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgW2VsLCBwYXJhbXNdID0gYXJncztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyYW1zKSBwYXJhbXMgPSB7fTtcbiAgICAgICAgcGFyYW1zID0gZXh0ZW5kKHt9LCBwYXJhbXMpO1xuICAgICAgICBpZiAoZWwgJiYgIXBhcmFtcy5lbCkgcGFyYW1zLmVsID0gZWw7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5lbCAmJiAkJDEocGFyYW1zLmVsKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgY29uc3Qgc3dpcGVycyA9IFtdO1xuICAgICAgICAgICQkMShwYXJhbXMuZWwpLmVhY2goY29udGFpbmVyRWwgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UGFyYW1zID0gZXh0ZW5kKHt9LCBwYXJhbXMsIHtcbiAgICAgICAgICAgICAgZWw6IGNvbnRhaW5lckVsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN3aXBlcnMucHVzaChuZXcgU3dpcGVyKG5ld1BhcmFtcykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBzd2lwZXJzO1xuICAgICAgICB9IC8vIFN3aXBlciBJbnN0YW5jZVxuXG5cbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgc3dpcGVyLl9fc3dpcGVyX18gPSB0cnVlO1xuICAgICAgICBzd2lwZXIuc3VwcG9ydCA9IGdldFN1cHBvcnQoKTtcbiAgICAgICAgc3dpcGVyLmRldmljZSA9IGdldERldmljZSh7XG4gICAgICAgICAgdXNlckFnZW50OiBwYXJhbXMudXNlckFnZW50XG4gICAgICAgIH0pO1xuICAgICAgICBzd2lwZXIuYnJvd3NlciA9IGdldEJyb3dzZXIoKTtcbiAgICAgICAgc3dpcGVyLmV2ZW50c0xpc3RlbmVycyA9IHt9O1xuICAgICAgICBzd2lwZXIuZXZlbnRzQW55TGlzdGVuZXJzID0gW107XG4gICAgICAgIHN3aXBlci5tb2R1bGVzID0gWy4uLnN3aXBlci5fX21vZHVsZXNfX107XG5cbiAgICAgICAgaWYgKHBhcmFtcy5tb2R1bGVzICYmIEFycmF5LmlzQXJyYXkocGFyYW1zLm1vZHVsZXMpKSB7XG4gICAgICAgICAgc3dpcGVyLm1vZHVsZXMucHVzaCguLi5wYXJhbXMubW9kdWxlcyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhbGxNb2R1bGVzUGFyYW1zID0ge307XG4gICAgICAgIHN3aXBlci5tb2R1bGVzLmZvckVhY2gobW9kID0+IHtcbiAgICAgICAgICBtb2Qoe1xuICAgICAgICAgICAgc3dpcGVyLFxuICAgICAgICAgICAgZXh0ZW5kUGFyYW1zOiBtb2R1bGVFeHRlbmRQYXJhbXMocGFyYW1zLCBhbGxNb2R1bGVzUGFyYW1zKSxcbiAgICAgICAgICAgIG9uOiBzd2lwZXIub24uYmluZChzd2lwZXIpLFxuICAgICAgICAgICAgb25jZTogc3dpcGVyLm9uY2UuYmluZChzd2lwZXIpLFxuICAgICAgICAgICAgb2ZmOiBzd2lwZXIub2ZmLmJpbmQoc3dpcGVyKSxcbiAgICAgICAgICAgIGVtaXQ6IHN3aXBlci5lbWl0LmJpbmQoc3dpcGVyKVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTsgLy8gRXh0ZW5kIGRlZmF1bHRzIHdpdGggbW9kdWxlcyBwYXJhbXNcblxuICAgICAgICBjb25zdCBzd2lwZXJQYXJhbXMgPSBleHRlbmQoe30sIGRlZmF1bHRzLCBhbGxNb2R1bGVzUGFyYW1zKTsgLy8gRXh0ZW5kIGRlZmF1bHRzIHdpdGggcGFzc2VkIHBhcmFtc1xuXG4gICAgICAgIHN3aXBlci5wYXJhbXMgPSBleHRlbmQoe30sIHN3aXBlclBhcmFtcywgZXh0ZW5kZWREZWZhdWx0cywgcGFyYW1zKTtcbiAgICAgICAgc3dpcGVyLm9yaWdpbmFsUGFyYW1zID0gZXh0ZW5kKHt9LCBzd2lwZXIucGFyYW1zKTtcbiAgICAgICAgc3dpcGVyLnBhc3NlZFBhcmFtcyA9IGV4dGVuZCh7fSwgcGFyYW1zKTsgLy8gYWRkIGV2ZW50IGxpc3RlbmVyc1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zICYmIHN3aXBlci5wYXJhbXMub24pIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhzd2lwZXIucGFyYW1zLm9uKS5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICAgICAgICBzd2lwZXIub24oZXZlbnROYW1lLCBzd2lwZXIucGFyYW1zLm9uW2V2ZW50TmFtZV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMgJiYgc3dpcGVyLnBhcmFtcy5vbkFueSkge1xuICAgICAgICAgIHN3aXBlci5vbkFueShzd2lwZXIucGFyYW1zLm9uQW55KTtcbiAgICAgICAgfSAvLyBTYXZlIERvbSBsaWJcblxuXG4gICAgICAgIHN3aXBlci4kID0gJCQxOyAvLyBFeHRlbmQgU3dpcGVyXG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIsIHtcbiAgICAgICAgICBlbmFibGVkOiBzd2lwZXIucGFyYW1zLmVuYWJsZWQsXG4gICAgICAgICAgZWwsXG4gICAgICAgICAgLy8gQ2xhc3Nlc1xuICAgICAgICAgIGNsYXNzTmFtZXM6IFtdLFxuICAgICAgICAgIC8vIFNsaWRlc1xuICAgICAgICAgIHNsaWRlczogJCQxKCksXG4gICAgICAgICAgc2xpZGVzR3JpZDogW10sXG4gICAgICAgICAgc25hcEdyaWQ6IFtdLFxuICAgICAgICAgIHNsaWRlc1NpemVzR3JpZDogW10sXG5cbiAgICAgICAgICAvLyBpc0RpcmVjdGlvblxuICAgICAgICAgIGlzSG9yaXpvbnRhbCgpIHtcbiAgICAgICAgICAgIHJldHVybiBzd2lwZXIucGFyYW1zLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBpc1ZlcnRpY2FsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN3aXBlci5wYXJhbXMuZGlyZWN0aW9uID09PSAndmVydGljYWwnO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICAvLyBJbmRleGVzXG4gICAgICAgICAgYWN0aXZlSW5kZXg6IDAsXG4gICAgICAgICAgcmVhbEluZGV4OiAwLFxuICAgICAgICAgIC8vXG4gICAgICAgICAgaXNCZWdpbm5pbmc6IHRydWUsXG4gICAgICAgICAgaXNFbmQ6IGZhbHNlLFxuICAgICAgICAgIC8vIFByb3BzXG4gICAgICAgICAgdHJhbnNsYXRlOiAwLFxuICAgICAgICAgIHByZXZpb3VzVHJhbnNsYXRlOiAwLFxuICAgICAgICAgIHByb2dyZXNzOiAwLFxuICAgICAgICAgIHZlbG9jaXR5OiAwLFxuICAgICAgICAgIGFuaW1hdGluZzogZmFsc2UsXG4gICAgICAgICAgLy8gTG9ja3NcbiAgICAgICAgICBhbGxvd1NsaWRlTmV4dDogc3dpcGVyLnBhcmFtcy5hbGxvd1NsaWRlTmV4dCxcbiAgICAgICAgICBhbGxvd1NsaWRlUHJldjogc3dpcGVyLnBhcmFtcy5hbGxvd1NsaWRlUHJldixcbiAgICAgICAgICAvLyBUb3VjaCBFdmVudHNcbiAgICAgICAgICB0b3VjaEV2ZW50czogZnVuY3Rpb24gdG91Y2hFdmVudHMoKSB7XG4gICAgICAgICAgICBjb25zdCB0b3VjaCA9IFsndG91Y2hzdGFydCcsICd0b3VjaG1vdmUnLCAndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnXTtcbiAgICAgICAgICAgIGNvbnN0IGRlc2t0b3AgPSBbJ3BvaW50ZXJkb3duJywgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCddO1xuICAgICAgICAgICAgc3dpcGVyLnRvdWNoRXZlbnRzVG91Y2ggPSB7XG4gICAgICAgICAgICAgIHN0YXJ0OiB0b3VjaFswXSxcbiAgICAgICAgICAgICAgbW92ZTogdG91Y2hbMV0sXG4gICAgICAgICAgICAgIGVuZDogdG91Y2hbMl0sXG4gICAgICAgICAgICAgIGNhbmNlbDogdG91Y2hbM11cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzd2lwZXIudG91Y2hFdmVudHNEZXNrdG9wID0ge1xuICAgICAgICAgICAgICBzdGFydDogZGVza3RvcFswXSxcbiAgICAgICAgICAgICAgbW92ZTogZGVza3RvcFsxXSxcbiAgICAgICAgICAgICAgZW5kOiBkZXNrdG9wWzJdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHN3aXBlci5zdXBwb3J0LnRvdWNoIHx8ICFzd2lwZXIucGFyYW1zLnNpbXVsYXRlVG91Y2ggPyBzd2lwZXIudG91Y2hFdmVudHNUb3VjaCA6IHN3aXBlci50b3VjaEV2ZW50c0Rlc2t0b3A7XG4gICAgICAgICAgfSgpLFxuICAgICAgICAgIHRvdWNoRXZlbnRzRGF0YToge1xuICAgICAgICAgICAgaXNUb3VjaGVkOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBpc01vdmVkOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBhbGxvd1RvdWNoQ2FsbGJhY2tzOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB0b3VjaFN0YXJ0VGltZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgaXNTY3JvbGxpbmc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGN1cnJlbnRUcmFuc2xhdGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHN0YXJ0VHJhbnNsYXRlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBhbGxvd1RocmVzaG9sZE1vdmU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIEZvcm0gZWxlbWVudHMgdG8gbWF0Y2hcbiAgICAgICAgICAgIGZvY3VzYWJsZUVsZW1lbnRzOiBzd2lwZXIucGFyYW1zLmZvY3VzYWJsZUVsZW1lbnRzLFxuICAgICAgICAgICAgLy8gTGFzdCBjbGljayB0aW1lXG4gICAgICAgICAgICBsYXN0Q2xpY2tUaW1lOiBub3coKSxcbiAgICAgICAgICAgIGNsaWNrVGltZW91dDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgLy8gVmVsb2NpdGllc1xuICAgICAgICAgICAgdmVsb2NpdGllczogW10sXG4gICAgICAgICAgICBhbGxvd01vbWVudHVtQm91bmNlOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBpc1RvdWNoRXZlbnQ6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHN0YXJ0TW92aW5nOiB1bmRlZmluZWRcbiAgICAgICAgICB9LFxuICAgICAgICAgIC8vIENsaWNrc1xuICAgICAgICAgIGFsbG93Q2xpY2s6IHRydWUsXG4gICAgICAgICAgLy8gVG91Y2hlc1xuICAgICAgICAgIGFsbG93VG91Y2hNb3ZlOiBzd2lwZXIucGFyYW1zLmFsbG93VG91Y2hNb3ZlLFxuICAgICAgICAgIHRvdWNoZXM6IHtcbiAgICAgICAgICAgIHN0YXJ0WDogMCxcbiAgICAgICAgICAgIHN0YXJ0WTogMCxcbiAgICAgICAgICAgIGN1cnJlbnRYOiAwLFxuICAgICAgICAgICAgY3VycmVudFk6IDAsXG4gICAgICAgICAgICBkaWZmOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBJbWFnZXNcbiAgICAgICAgICBpbWFnZXNUb0xvYWQ6IFtdLFxuICAgICAgICAgIGltYWdlc0xvYWRlZDogMFxuICAgICAgICB9KTtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ19zd2lwZXInKTsgLy8gSW5pdFxuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmluaXQpIHtcbiAgICAgICAgICBzd2lwZXIuaW5pdCgpO1xuICAgICAgICB9IC8vIFJldHVybiBhcHAgaW5zdGFuY2VcblxuXG4gICAgICAgIHJldHVybiBzd2lwZXI7XG4gICAgICB9XG5cbiAgICAgIGVuYWJsZSgpIHtcbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgaWYgKHN3aXBlci5lbmFibGVkKSByZXR1cm47XG4gICAgICAgIHN3aXBlci5lbmFibGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5ncmFiQ3Vyc29yKSB7XG4gICAgICAgICAgc3dpcGVyLnNldEdyYWJDdXJzb3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci5lbWl0KCdlbmFibGUnKTtcbiAgICAgIH1cblxuICAgICAgZGlzYWJsZSgpIHtcbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgaWYgKCFzd2lwZXIuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBzd2lwZXIuZW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmdyYWJDdXJzb3IpIHtcbiAgICAgICAgICBzd2lwZXIudW5zZXRHcmFiQ3Vyc29yKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuZW1pdCgnZGlzYWJsZScpO1xuICAgICAgfVxuXG4gICAgICBzZXRQcm9ncmVzcyhwcm9ncmVzcywgc3BlZWQpIHtcbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgcHJvZ3Jlc3MgPSBNYXRoLm1pbihNYXRoLm1heChwcm9ncmVzcywgMCksIDEpO1xuICAgICAgICBjb25zdCBtaW4gPSBzd2lwZXIubWluVHJhbnNsYXRlKCk7XG4gICAgICAgIGNvbnN0IG1heCA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKTtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IChtYXggLSBtaW4pICogcHJvZ3Jlc3MgKyBtaW47XG4gICAgICAgIHN3aXBlci50cmFuc2xhdGVUbyhjdXJyZW50LCB0eXBlb2Ygc3BlZWQgPT09ICd1bmRlZmluZWQnID8gMCA6IHNwZWVkKTtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZUFjdGl2ZUluZGV4KCk7XG4gICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgICB9XG5cbiAgICAgIGVtaXRDb250YWluZXJDbGFzc2VzKCkge1xuICAgICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMuX2VtaXRDbGFzc2VzIHx8ICFzd2lwZXIuZWwpIHJldHVybjtcbiAgICAgICAgY29uc3QgY2xzID0gc3dpcGVyLmVsLmNsYXNzTmFtZS5zcGxpdCgnICcpLmZpbHRlcihjbGFzc05hbWUgPT4ge1xuICAgICAgICAgIHJldHVybiBjbGFzc05hbWUuaW5kZXhPZignc3dpcGVyJykgPT09IDAgfHwgY2xhc3NOYW1lLmluZGV4T2Yoc3dpcGVyLnBhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzKSA9PT0gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIHN3aXBlci5lbWl0KCdfY29udGFpbmVyQ2xhc3NlcycsIGNscy5qb2luKCcgJykpO1xuICAgICAgfVxuXG4gICAgICBnZXRTbGlkZUNsYXNzZXMoc2xpZGVFbCkge1xuICAgICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgICBpZiAoc3dpcGVyLmRlc3Ryb3llZCkgcmV0dXJuICcnO1xuICAgICAgICByZXR1cm4gc2xpZGVFbC5jbGFzc05hbWUuc3BsaXQoJyAnKS5maWx0ZXIoY2xhc3NOYW1lID0+IHtcbiAgICAgICAgICByZXR1cm4gY2xhc3NOYW1lLmluZGV4T2YoJ3N3aXBlci1zbGlkZScpID09PSAwIHx8IGNsYXNzTmFtZS5pbmRleE9mKHN3aXBlci5wYXJhbXMuc2xpZGVDbGFzcykgPT09IDA7XG4gICAgICAgIH0pLmpvaW4oJyAnKTtcbiAgICAgIH1cblxuICAgICAgZW1pdFNsaWRlc0NsYXNzZXMoKSB7XG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5fZW1pdENsYXNzZXMgfHwgIXN3aXBlci5lbCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB1cGRhdGVzID0gW107XG4gICAgICAgIHN3aXBlci5zbGlkZXMuZWFjaChzbGlkZUVsID0+IHtcbiAgICAgICAgICBjb25zdCBjbGFzc05hbWVzID0gc3dpcGVyLmdldFNsaWRlQ2xhc3NlcyhzbGlkZUVsKTtcbiAgICAgICAgICB1cGRhdGVzLnB1c2goe1xuICAgICAgICAgICAgc2xpZGVFbCxcbiAgICAgICAgICAgIGNsYXNzTmFtZXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzd2lwZXIuZW1pdCgnX3NsaWRlQ2xhc3MnLCBzbGlkZUVsLCBjbGFzc05hbWVzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHN3aXBlci5lbWl0KCdfc2xpZGVDbGFzc2VzJywgdXBkYXRlcyk7XG4gICAgICB9XG5cbiAgICAgIHNsaWRlc1BlclZpZXdEeW5hbWljKHZpZXcsIGV4YWN0KSB7XG4gICAgICAgIGlmICh2aWV3ID09PSB2b2lkIDApIHtcbiAgICAgICAgICB2aWV3ID0gJ2N1cnJlbnQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV4YWN0ID09PSB2b2lkIDApIHtcbiAgICAgICAgICBleGFjdCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICBzbGlkZXMsXG4gICAgICAgICAgc2xpZGVzR3JpZCxcbiAgICAgICAgICBzbGlkZXNTaXplc0dyaWQsXG4gICAgICAgICAgc2l6ZTogc3dpcGVyU2l6ZSxcbiAgICAgICAgICBhY3RpdmVJbmRleFxuICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICBsZXQgc3B2ID0gMTtcblxuICAgICAgICBpZiAocGFyYW1zLmNlbnRlcmVkU2xpZGVzKSB7XG4gICAgICAgICAgbGV0IHNsaWRlU2l6ZSA9IHNsaWRlc1thY3RpdmVJbmRleF0uc3dpcGVyU2xpZGVTaXplO1xuICAgICAgICAgIGxldCBicmVha0xvb3A7XG5cbiAgICAgICAgICBmb3IgKGxldCBpID0gYWN0aXZlSW5kZXggKyAxOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAoc2xpZGVzW2ldICYmICFicmVha0xvb3ApIHtcbiAgICAgICAgICAgICAgc2xpZGVTaXplICs9IHNsaWRlc1tpXS5zd2lwZXJTbGlkZVNpemU7XG4gICAgICAgICAgICAgIHNwdiArPSAxO1xuICAgICAgICAgICAgICBpZiAoc2xpZGVTaXplID4gc3dpcGVyU2l6ZSkgYnJlYWtMb29wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGxldCBpID0gYWN0aXZlSW5kZXggLSAxOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgaWYgKHNsaWRlc1tpXSAmJiAhYnJlYWtMb29wKSB7XG4gICAgICAgICAgICAgIHNsaWRlU2l6ZSArPSBzbGlkZXNbaV0uc3dpcGVyU2xpZGVTaXplO1xuICAgICAgICAgICAgICBzcHYgKz0gMTtcbiAgICAgICAgICAgICAgaWYgKHNsaWRlU2l6ZSA+IHN3aXBlclNpemUpIGJyZWFrTG9vcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgIGlmICh2aWV3ID09PSAnY3VycmVudCcpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBhY3RpdmVJbmRleCArIDE7IGkgPCBzbGlkZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgY29uc3Qgc2xpZGVJblZpZXcgPSBleGFjdCA/IHNsaWRlc0dyaWRbaV0gKyBzbGlkZXNTaXplc0dyaWRbaV0gLSBzbGlkZXNHcmlkW2FjdGl2ZUluZGV4XSA8IHN3aXBlclNpemUgOiBzbGlkZXNHcmlkW2ldIC0gc2xpZGVzR3JpZFthY3RpdmVJbmRleF0gPCBzd2lwZXJTaXplO1xuXG4gICAgICAgICAgICAgIGlmIChzbGlkZUluVmlldykge1xuICAgICAgICAgICAgICAgIHNwdiArPSAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHByZXZpb3VzXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gYWN0aXZlSW5kZXggLSAxOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgICBjb25zdCBzbGlkZUluVmlldyA9IHNsaWRlc0dyaWRbYWN0aXZlSW5kZXhdIC0gc2xpZGVzR3JpZFtpXSA8IHN3aXBlclNpemU7XG5cbiAgICAgICAgICAgICAgaWYgKHNsaWRlSW5WaWV3KSB7XG4gICAgICAgICAgICAgICAgc3B2ICs9IDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3B2O1xuICAgICAgfVxuXG4gICAgICB1cGRhdGUoKSB7XG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHNuYXBHcmlkLFxuICAgICAgICAgIHBhcmFtc1xuICAgICAgICB9ID0gc3dpcGVyOyAvLyBCcmVha3BvaW50c1xuXG4gICAgICAgIGlmIChwYXJhbXMuYnJlYWtwb2ludHMpIHtcbiAgICAgICAgICBzd2lwZXIuc2V0QnJlYWtwb2ludCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNpemUoKTtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlcygpO1xuICAgICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MoKTtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcblxuICAgICAgICBmdW5jdGlvbiBzZXRUcmFuc2xhdGUoKSB7XG4gICAgICAgICAgY29uc3QgdHJhbnNsYXRlVmFsdWUgPSBzd2lwZXIucnRsVHJhbnNsYXRlID8gc3dpcGVyLnRyYW5zbGF0ZSAqIC0xIDogc3dpcGVyLnRyYW5zbGF0ZTtcbiAgICAgICAgICBjb25zdCBuZXdUcmFuc2xhdGUgPSBNYXRoLm1pbihNYXRoLm1heCh0cmFuc2xhdGVWYWx1ZSwgc3dpcGVyLm1heFRyYW5zbGF0ZSgpKSwgc3dpcGVyLm1pblRyYW5zbGF0ZSgpKTtcbiAgICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKG5ld1RyYW5zbGF0ZSk7XG4gICAgICAgICAgc3dpcGVyLnVwZGF0ZUFjdGl2ZUluZGV4KCk7XG4gICAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0cmFuc2xhdGVkO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmZyZWVNb2RlICYmIHN3aXBlci5wYXJhbXMuZnJlZU1vZGUuZW5hYmxlZCkge1xuICAgICAgICAgIHNldFRyYW5zbGF0ZSgpO1xuXG4gICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYXV0b0hlaWdodCkge1xuICAgICAgICAgICAgc3dpcGVyLnVwZGF0ZUF1dG9IZWlnaHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKChzd2lwZXIucGFyYW1zLnNsaWRlc1BlclZpZXcgPT09ICdhdXRvJyB8fCBzd2lwZXIucGFyYW1zLnNsaWRlc1BlclZpZXcgPiAxKSAmJiBzd2lwZXIuaXNFbmQgJiYgIXN3aXBlci5wYXJhbXMuY2VudGVyZWRTbGlkZXMpIHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZWQgPSBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuc2xpZGVzLmxlbmd0aCAtIDEsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJhbnNsYXRlZCA9IHN3aXBlci5zbGlkZVRvKHN3aXBlci5hY3RpdmVJbmRleCwgMCwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghdHJhbnNsYXRlZCkge1xuICAgICAgICAgICAgc2V0VHJhbnNsYXRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy53YXRjaE92ZXJmbG93ICYmIHNuYXBHcmlkICE9PSBzd2lwZXIuc25hcEdyaWQpIHtcbiAgICAgICAgICBzd2lwZXIuY2hlY2tPdmVyZmxvdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLmVtaXQoJ3VwZGF0ZScpO1xuICAgICAgfVxuXG4gICAgICBjaGFuZ2VEaXJlY3Rpb24obmV3RGlyZWN0aW9uLCBuZWVkVXBkYXRlKSB7XG4gICAgICAgIGlmIChuZWVkVXBkYXRlID09PSB2b2lkIDApIHtcbiAgICAgICAgICBuZWVkVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN3aXBlciA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGN1cnJlbnREaXJlY3Rpb24gPSBzd2lwZXIucGFyYW1zLmRpcmVjdGlvbjtcblxuICAgICAgICBpZiAoIW5ld0RpcmVjdGlvbikge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgICAgIG5ld0RpcmVjdGlvbiA9IGN1cnJlbnREaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyA/ICd2ZXJ0aWNhbCcgOiAnaG9yaXpvbnRhbCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3RGlyZWN0aW9uID09PSBjdXJyZW50RGlyZWN0aW9uIHx8IG5ld0RpcmVjdGlvbiAhPT0gJ2hvcml6b250YWwnICYmIG5ld0RpcmVjdGlvbiAhPT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgIHJldHVybiBzd2lwZXI7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuJGVsLnJlbW92ZUNsYXNzKGAke3N3aXBlci5wYXJhbXMuY29udGFpbmVyTW9kaWZpZXJDbGFzc30ke2N1cnJlbnREaXJlY3Rpb259YCkuYWRkQ2xhc3MoYCR7c3dpcGVyLnBhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzfSR7bmV3RGlyZWN0aW9ufWApO1xuICAgICAgICBzd2lwZXIuZW1pdENvbnRhaW5lckNsYXNzZXMoKTtcbiAgICAgICAgc3dpcGVyLnBhcmFtcy5kaXJlY3Rpb24gPSBuZXdEaXJlY3Rpb247XG4gICAgICAgIHN3aXBlci5zbGlkZXMuZWFjaChzbGlkZUVsID0+IHtcbiAgICAgICAgICBpZiAobmV3RGlyZWN0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICAgICAgICBzbGlkZUVsLnN0eWxlLndpZHRoID0gJyc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNsaWRlRWwuc3R5bGUuaGVpZ2h0ID0gJyc7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc3dpcGVyLmVtaXQoJ2NoYW5nZURpcmVjdGlvbicpO1xuICAgICAgICBpZiAobmVlZFVwZGF0ZSkgc3dpcGVyLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gc3dpcGVyO1xuICAgICAgfVxuXG4gICAgICBjaGFuZ2VMYW5ndWFnZURpcmVjdGlvbihkaXJlY3Rpb24pIHtcbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgaWYgKHN3aXBlci5ydGwgJiYgZGlyZWN0aW9uID09PSAncnRsJyB8fCAhc3dpcGVyLnJ0bCAmJiBkaXJlY3Rpb24gPT09ICdsdHInKSByZXR1cm47XG4gICAgICAgIHN3aXBlci5ydGwgPSBkaXJlY3Rpb24gPT09ICdydGwnO1xuICAgICAgICBzd2lwZXIucnRsVHJhbnNsYXRlID0gc3dpcGVyLnBhcmFtcy5kaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJyAmJiBzd2lwZXIucnRsO1xuXG4gICAgICAgIGlmIChzd2lwZXIucnRsKSB7XG4gICAgICAgICAgc3dpcGVyLiRlbC5hZGRDbGFzcyhgJHtzd2lwZXIucGFyYW1zLmNvbnRhaW5lck1vZGlmaWVyQ2xhc3N9cnRsYCk7XG4gICAgICAgICAgc3dpcGVyLmVsLmRpciA9ICdydGwnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN3aXBlci4kZWwucmVtb3ZlQ2xhc3MoYCR7c3dpcGVyLnBhcmFtcy5jb250YWluZXJNb2RpZmllckNsYXNzfXJ0bGApO1xuICAgICAgICAgIHN3aXBlci5lbC5kaXIgPSAnbHRyJztcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlci51cGRhdGUoKTtcbiAgICAgIH1cblxuICAgICAgbW91bnQoZWwpIHtcbiAgICAgICAgY29uc3Qgc3dpcGVyID0gdGhpcztcbiAgICAgICAgaWYgKHN3aXBlci5tb3VudGVkKSByZXR1cm4gdHJ1ZTsgLy8gRmluZCBlbFxuXG4gICAgICAgIGNvbnN0ICRlbCA9ICQkMShlbCB8fCBzd2lwZXIucGFyYW1zLmVsKTtcbiAgICAgICAgZWwgPSAkZWxbMF07XG5cbiAgICAgICAgaWYgKCFlbCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsLnN3aXBlciA9IHN3aXBlcjtcblxuICAgICAgICBjb25zdCBnZXRXcmFwcGVyU2VsZWN0b3IgPSAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGAuJHsoc3dpcGVyLnBhcmFtcy53cmFwcGVyQ2xhc3MgfHwgJycpLnRyaW0oKS5zcGxpdCgnICcpLmpvaW4oJy4nKX1gO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGdldFdyYXBwZXIgPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKGVsICYmIGVsLnNoYWRvd1Jvb3QgJiYgZWwuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKSB7XG4gICAgICAgICAgICBjb25zdCByZXMgPSAkJDEoZWwuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKGdldFdyYXBwZXJTZWxlY3RvcigpKSk7IC8vIENoaWxkcmVuIG5lZWRzIHRvIHJldHVybiBzbG90IGl0ZW1zXG5cbiAgICAgICAgICAgIHJlcy5jaGlsZHJlbiA9IG9wdGlvbnMgPT4gJGVsLmNoaWxkcmVuKG9wdGlvbnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghJGVsLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICByZXR1cm4gJCQxKCRlbCkuY2hpbGRyZW4oZ2V0V3JhcHBlclNlbGVjdG9yKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiAkZWwuY2hpbGRyZW4oZ2V0V3JhcHBlclNlbGVjdG9yKCkpO1xuICAgICAgICB9OyAvLyBGaW5kIFdyYXBwZXJcblxuXG4gICAgICAgIGxldCAkd3JhcHBlckVsID0gZ2V0V3JhcHBlcigpO1xuXG4gICAgICAgIGlmICgkd3JhcHBlckVsLmxlbmd0aCA9PT0gMCAmJiBzd2lwZXIucGFyYW1zLmNyZWF0ZUVsZW1lbnRzKSB7XG4gICAgICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgICAgIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAkd3JhcHBlckVsID0gJCQxKHdyYXBwZXIpO1xuICAgICAgICAgIHdyYXBwZXIuY2xhc3NOYW1lID0gc3dpcGVyLnBhcmFtcy53cmFwcGVyQ2xhc3M7XG4gICAgICAgICAgJGVsLmFwcGVuZCh3cmFwcGVyKTtcbiAgICAgICAgICAkZWwuY2hpbGRyZW4oYC4ke3N3aXBlci5wYXJhbXMuc2xpZGVDbGFzc31gKS5lYWNoKHNsaWRlRWwgPT4ge1xuICAgICAgICAgICAgJHdyYXBwZXJFbC5hcHBlbmQoc2xpZGVFbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHN3aXBlciwge1xuICAgICAgICAgICRlbCxcbiAgICAgICAgICBlbCxcbiAgICAgICAgICAkd3JhcHBlckVsLFxuICAgICAgICAgIHdyYXBwZXJFbDogJHdyYXBwZXJFbFswXSxcbiAgICAgICAgICBtb3VudGVkOiB0cnVlLFxuICAgICAgICAgIC8vIFJUTFxuICAgICAgICAgIHJ0bDogZWwuZGlyLnRvTG93ZXJDYXNlKCkgPT09ICdydGwnIHx8ICRlbC5jc3MoJ2RpcmVjdGlvbicpID09PSAncnRsJyxcbiAgICAgICAgICBydGxUcmFuc2xhdGU6IHN3aXBlci5wYXJhbXMuZGlyZWN0aW9uID09PSAnaG9yaXpvbnRhbCcgJiYgKGVsLmRpci50b0xvd2VyQ2FzZSgpID09PSAncnRsJyB8fCAkZWwuY3NzKCdkaXJlY3Rpb24nKSA9PT0gJ3J0bCcpLFxuICAgICAgICAgIHdyb25nUlRMOiAkd3JhcHBlckVsLmNzcygnZGlzcGxheScpID09PSAnLXdlYmtpdC1ib3gnXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaW5pdChlbCkge1xuICAgICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgICBpZiAoc3dpcGVyLmluaXRpYWxpemVkKSByZXR1cm4gc3dpcGVyO1xuICAgICAgICBjb25zdCBtb3VudGVkID0gc3dpcGVyLm1vdW50KGVsKTtcbiAgICAgICAgaWYgKG1vdW50ZWQgPT09IGZhbHNlKSByZXR1cm4gc3dpcGVyO1xuICAgICAgICBzd2lwZXIuZW1pdCgnYmVmb3JlSW5pdCcpOyAvLyBTZXQgYnJlYWtwb2ludFxuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmJyZWFrcG9pbnRzKSB7XG4gICAgICAgICAgc3dpcGVyLnNldEJyZWFrcG9pbnQoKTtcbiAgICAgICAgfSAvLyBBZGQgQ2xhc3Nlc1xuXG5cbiAgICAgICAgc3dpcGVyLmFkZENsYXNzZXMoKTsgLy8gQ3JlYXRlIGxvb3BcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgc3dpcGVyLmxvb3BDcmVhdGUoKTtcbiAgICAgICAgfSAvLyBVcGRhdGUgc2l6ZVxuXG5cbiAgICAgICAgc3dpcGVyLnVwZGF0ZVNpemUoKTsgLy8gVXBkYXRlIHNsaWRlc1xuXG4gICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXMoKTtcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy53YXRjaE92ZXJmbG93KSB7XG4gICAgICAgICAgc3dpcGVyLmNoZWNrT3ZlcmZsb3coKTtcbiAgICAgICAgfSAvLyBTZXQgR3JhYiBDdXJzb3JcblxuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmdyYWJDdXJzb3IgJiYgc3dpcGVyLmVuYWJsZWQpIHtcbiAgICAgICAgICBzd2lwZXIuc2V0R3JhYkN1cnNvcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMucHJlbG9hZEltYWdlcykge1xuICAgICAgICAgIHN3aXBlci5wcmVsb2FkSW1hZ2VzKCk7XG4gICAgICAgIH0gLy8gU2xpZGUgVG8gSW5pdGlhbCBTbGlkZVxuXG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHN3aXBlci5wYXJhbXMuaW5pdGlhbFNsaWRlICsgc3dpcGVyLmxvb3BlZFNsaWRlcywgMCwgc3dpcGVyLnBhcmFtcy5ydW5DYWxsYmFja3NPbkluaXQsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhzd2lwZXIucGFyYW1zLmluaXRpYWxTbGlkZSwgMCwgc3dpcGVyLnBhcmFtcy5ydW5DYWxsYmFja3NPbkluaXQsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgfSAvLyBBdHRhY2ggZXZlbnRzXG5cblxuICAgICAgICBzd2lwZXIuYXR0YWNoRXZlbnRzKCk7IC8vIEluaXQgRmxhZ1xuXG4gICAgICAgIHN3aXBlci5pbml0aWFsaXplZCA9IHRydWU7IC8vIEVtaXRcblxuICAgICAgICBzd2lwZXIuZW1pdCgnaW5pdCcpO1xuICAgICAgICBzd2lwZXIuZW1pdCgnYWZ0ZXJJbml0Jyk7XG4gICAgICAgIHJldHVybiBzd2lwZXI7XG4gICAgICB9XG5cbiAgICAgIGRlc3Ryb3koZGVsZXRlSW5zdGFuY2UsIGNsZWFuU3R5bGVzKSB7XG4gICAgICAgIGlmIChkZWxldGVJbnN0YW5jZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgZGVsZXRlSW5zdGFuY2UgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNsZWFuU3R5bGVzID09PSB2b2lkIDApIHtcbiAgICAgICAgICBjbGVhblN0eWxlcyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzd2lwZXIgPSB0aGlzO1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICRlbCxcbiAgICAgICAgICAkd3JhcHBlckVsLFxuICAgICAgICAgIHNsaWRlc1xuICAgICAgICB9ID0gc3dpcGVyO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3dpcGVyLnBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcgfHwgc3dpcGVyLmRlc3Ryb3llZCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLmVtaXQoJ2JlZm9yZURlc3Ryb3knKTsgLy8gSW5pdCBGbGFnXG5cbiAgICAgICAgc3dpcGVyLmluaXRpYWxpemVkID0gZmFsc2U7IC8vIERldGFjaCBldmVudHNcblxuICAgICAgICBzd2lwZXIuZGV0YWNoRXZlbnRzKCk7IC8vIERlc3Ryb3kgbG9vcFxuXG4gICAgICAgIGlmIChwYXJhbXMubG9vcCkge1xuICAgICAgICAgIHN3aXBlci5sb29wRGVzdHJveSgpO1xuICAgICAgICB9IC8vIENsZWFudXAgc3R5bGVzXG5cblxuICAgICAgICBpZiAoY2xlYW5TdHlsZXMpIHtcbiAgICAgICAgICBzd2lwZXIucmVtb3ZlQ2xhc3NlcygpO1xuICAgICAgICAgICRlbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICR3cmFwcGVyRWwucmVtb3ZlQXR0cignc3R5bGUnKTtcblxuICAgICAgICAgIGlmIChzbGlkZXMgJiYgc2xpZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgc2xpZGVzLnJlbW92ZUNsYXNzKFtwYXJhbXMuc2xpZGVWaXNpYmxlQ2xhc3MsIHBhcmFtcy5zbGlkZUFjdGl2ZUNsYXNzLCBwYXJhbXMuc2xpZGVOZXh0Q2xhc3MsIHBhcmFtcy5zbGlkZVByZXZDbGFzc10uam9pbignICcpKS5yZW1vdmVBdHRyKCdzdHlsZScpLnJlbW92ZUF0dHIoJ2RhdGEtc3dpcGVyLXNsaWRlLWluZGV4Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLmVtaXQoJ2Rlc3Ryb3knKTsgLy8gRGV0YWNoIGVtaXR0ZXIgZXZlbnRzXG5cbiAgICAgICAgT2JqZWN0LmtleXMoc3dpcGVyLmV2ZW50c0xpc3RlbmVycykuZm9yRWFjaChldmVudE5hbWUgPT4ge1xuICAgICAgICAgIHN3aXBlci5vZmYoZXZlbnROYW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRlbGV0ZUluc3RhbmNlICE9PSBmYWxzZSkge1xuICAgICAgICAgIHN3aXBlci4kZWxbMF0uc3dpcGVyID0gbnVsbDtcbiAgICAgICAgICBkZWxldGVQcm9wcyhzd2lwZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpcGVyLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZXh0ZW5kRGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICAgICAgZXh0ZW5kKGV4dGVuZGVkRGVmYXVsdHMsIG5ld0RlZmF1bHRzKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGdldCBleHRlbmRlZERlZmF1bHRzKCkge1xuICAgICAgICByZXR1cm4gZXh0ZW5kZWREZWZhdWx0cztcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGdldCBkZWZhdWx0cygpIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRzO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgaW5zdGFsbE1vZHVsZShtb2QpIHtcbiAgICAgICAgaWYgKCFTd2lwZXIucHJvdG90eXBlLl9fbW9kdWxlc19fKSBTd2lwZXIucHJvdG90eXBlLl9fbW9kdWxlc19fID0gW107XG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBTd2lwZXIucHJvdG90eXBlLl9fbW9kdWxlc19fO1xuXG4gICAgICAgIGlmICh0eXBlb2YgbW9kID09PSAnZnVuY3Rpb24nICYmIG1vZHVsZXMuaW5kZXhPZihtb2QpIDwgMCkge1xuICAgICAgICAgIG1vZHVsZXMucHVzaChtb2QpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyB1c2UobW9kdWxlKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG1vZHVsZSkpIHtcbiAgICAgICAgICBtb2R1bGUuZm9yRWFjaChtID0+IFN3aXBlci5pbnN0YWxsTW9kdWxlKG0pKTtcbiAgICAgICAgICByZXR1cm4gU3dpcGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgU3dpcGVyLmluc3RhbGxNb2R1bGUobW9kdWxlKTtcbiAgICAgICAgcmV0dXJuIFN3aXBlcjtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKHByb3RvdHlwZXMpLmZvckVhY2gocHJvdG90eXBlR3JvdXAgPT4ge1xuICAgICAgT2JqZWN0LmtleXMocHJvdG90eXBlc1twcm90b3R5cGVHcm91cF0pLmZvckVhY2gocHJvdG9NZXRob2QgPT4ge1xuICAgICAgICBTd2lwZXIucHJvdG90eXBlW3Byb3RvTWV0aG9kXSA9IHByb3RvdHlwZXNbcHJvdG90eXBlR3JvdXBdW3Byb3RvTWV0aG9kXTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFN3aXBlci51c2UoW1Jlc2l6ZSwgT2JzZXJ2ZXJdKTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIGNvbnNpc3RlbnQtcmV0dXJuICovXG4gICAgZnVuY3Rpb24gTW91c2V3aGVlbChfcmVmKSB7XG4gICAgICBsZXQge1xuICAgICAgICBzd2lwZXIsXG4gICAgICAgIGV4dGVuZFBhcmFtcyxcbiAgICAgICAgb24sXG4gICAgICAgIGVtaXRcbiAgICAgIH0gPSBfcmVmO1xuICAgICAgY29uc3Qgd2luZG93ID0gZ2V0V2luZG93KCk7XG4gICAgICBleHRlbmRQYXJhbXMoe1xuICAgICAgICBtb3VzZXdoZWVsOiB7XG4gICAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgcmVsZWFzZU9uRWRnZXM6IGZhbHNlLFxuICAgICAgICAgIGludmVydDogZmFsc2UsXG4gICAgICAgICAgZm9yY2VUb0F4aXM6IGZhbHNlLFxuICAgICAgICAgIHNlbnNpdGl2aXR5OiAxLFxuICAgICAgICAgIGV2ZW50c1RhcmdldDogJ2NvbnRhaW5lcicsXG4gICAgICAgICAgdGhyZXNob2xkRGVsdGE6IG51bGwsXG4gICAgICAgICAgdGhyZXNob2xkVGltZTogbnVsbFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHN3aXBlci5tb3VzZXdoZWVsID0ge1xuICAgICAgICBlbmFibGVkOiBmYWxzZVxuICAgICAgfTtcbiAgICAgIGxldCB0aW1lb3V0O1xuICAgICAgbGV0IGxhc3RTY3JvbGxUaW1lID0gbm93KCk7XG4gICAgICBsZXQgbGFzdEV2ZW50QmVmb3JlU25hcDtcbiAgICAgIGNvbnN0IHJlY2VudFdoZWVsRXZlbnRzID0gW107XG5cbiAgICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZShlKSB7XG4gICAgICAgIC8vIFJlYXNvbmFibGUgZGVmYXVsdHNcbiAgICAgICAgY29uc3QgUElYRUxfU1RFUCA9IDEwO1xuICAgICAgICBjb25zdCBMSU5FX0hFSUdIVCA9IDQwO1xuICAgICAgICBjb25zdCBQQUdFX0hFSUdIVCA9IDgwMDtcbiAgICAgICAgbGV0IHNYID0gMDtcbiAgICAgICAgbGV0IHNZID0gMDsgLy8gc3BpblgsIHNwaW5ZXG5cbiAgICAgICAgbGV0IHBYID0gMDtcbiAgICAgICAgbGV0IHBZID0gMDsgLy8gcGl4ZWxYLCBwaXhlbFlcbiAgICAgICAgLy8gTGVnYWN5XG5cbiAgICAgICAgaWYgKCdkZXRhaWwnIGluIGUpIHtcbiAgICAgICAgICBzWSA9IGUuZGV0YWlsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCd3aGVlbERlbHRhJyBpbiBlKSB7XG4gICAgICAgICAgc1kgPSAtZS53aGVlbERlbHRhIC8gMTIwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCd3aGVlbERlbHRhWScgaW4gZSkge1xuICAgICAgICAgIHNZID0gLWUud2hlZWxEZWx0YVkgLyAxMjA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJ3doZWVsRGVsdGFYJyBpbiBlKSB7XG4gICAgICAgICAgc1ggPSAtZS53aGVlbERlbHRhWCAvIDEyMDtcbiAgICAgICAgfSAvLyBzaWRlIHNjcm9sbGluZyBvbiBGRiB3aXRoIERPTU1vdXNlU2Nyb2xsXG5cblxuICAgICAgICBpZiAoJ2F4aXMnIGluIGUgJiYgZS5heGlzID09PSBlLkhPUklaT05UQUxfQVhJUykge1xuICAgICAgICAgIHNYID0gc1k7XG4gICAgICAgICAgc1kgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcFggPSBzWCAqIFBJWEVMX1NURVA7XG4gICAgICAgIHBZID0gc1kgKiBQSVhFTF9TVEVQO1xuXG4gICAgICAgIGlmICgnZGVsdGFZJyBpbiBlKSB7XG4gICAgICAgICAgcFkgPSBlLmRlbHRhWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgnZGVsdGFYJyBpbiBlKSB7XG4gICAgICAgICAgcFggPSBlLmRlbHRhWDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5ICYmICFwWCkge1xuICAgICAgICAgIC8vIGlmIHVzZXIgc2Nyb2xscyB3aXRoIHNoaWZ0IGhlIHdhbnRzIGhvcml6b250YWwgc2Nyb2xsXG4gICAgICAgICAgcFggPSBwWTtcbiAgICAgICAgICBwWSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKHBYIHx8IHBZKSAmJiBlLmRlbHRhTW9kZSkge1xuICAgICAgICAgIGlmIChlLmRlbHRhTW9kZSA9PT0gMSkge1xuICAgICAgICAgICAgLy8gZGVsdGEgaW4gTElORSB1bml0c1xuICAgICAgICAgICAgcFggKj0gTElORV9IRUlHSFQ7XG4gICAgICAgICAgICBwWSAqPSBMSU5FX0hFSUdIVDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZGVsdGEgaW4gUEFHRSB1bml0c1xuICAgICAgICAgICAgcFggKj0gUEFHRV9IRUlHSFQ7XG4gICAgICAgICAgICBwWSAqPSBQQUdFX0hFSUdIVDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gLy8gRmFsbC1iYWNrIGlmIHNwaW4gY2Fubm90IGJlIGRldGVybWluZWRcblxuXG4gICAgICAgIGlmIChwWCAmJiAhc1gpIHtcbiAgICAgICAgICBzWCA9IHBYIDwgMSA/IC0xIDogMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwWSAmJiAhc1kpIHtcbiAgICAgICAgICBzWSA9IHBZIDwgMSA/IC0xIDogMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3Bpblg6IHNYLFxuICAgICAgICAgIHNwaW5ZOiBzWSxcbiAgICAgICAgICBwaXhlbFg6IHBYLFxuICAgICAgICAgIHBpeGVsWTogcFlcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlTW91c2VFbnRlcigpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBzd2lwZXIubW91c2VFbnRlcmVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlTW91c2VMZWF2ZSgpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBzd2lwZXIubW91c2VFbnRlcmVkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFuaW1hdGVTbGlkZXIobmV3RXZlbnQpIHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubW91c2V3aGVlbC50aHJlc2hvbGREZWx0YSAmJiBuZXdFdmVudC5kZWx0YSA8IHN3aXBlci5wYXJhbXMubW91c2V3aGVlbC50aHJlc2hvbGREZWx0YSkge1xuICAgICAgICAgIC8vIFByZXZlbnQgaWYgZGVsdGEgb2Ygd2hlZWwgc2Nyb2xsIGRlbHRhIGlzIGJlbG93IGNvbmZpZ3VyZWQgdGhyZXNob2xkXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubW91c2V3aGVlbC50aHJlc2hvbGRUaW1lICYmIG5vdygpIC0gbGFzdFNjcm9sbFRpbWUgPCBzd2lwZXIucGFyYW1zLm1vdXNld2hlZWwudGhyZXNob2xkVGltZSkge1xuICAgICAgICAgIC8vIFByZXZlbnQgaWYgdGltZSBiZXR3ZWVuIHNjcm9sbHMgaXMgYmVsb3cgY29uZmlndXJlZCB0aHJlc2hvbGRcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gLy8gSWYgdGhlIG1vdmVtZW50IGlzIE5PVCBiaWcgZW5vdWdoIGFuZFxuICAgICAgICAvLyBpZiB0aGUgbGFzdCB0aW1lIHRoZSB1c2VyIHNjcm9sbGVkIHdhcyB0b28gY2xvc2UgdG8gdGhlIGN1cnJlbnQgb25lIChhdm9pZCBjb250aW51b3VzbHkgdHJpZ2dlcmluZyB0aGUgc2xpZGVyKTpcbiAgICAgICAgLy8gICBEb24ndCBnbyBhbnkgZnVydGhlciAoYXZvaWQgaW5zaWduaWZpY2FudCBzY3JvbGwgbW92ZW1lbnQpLlxuXG5cbiAgICAgICAgaWYgKG5ld0V2ZW50LmRlbHRhID49IDYgJiYgbm93KCkgLSBsYXN0U2Nyb2xsVGltZSA8IDYwKSB7XG4gICAgICAgICAgLy8gUmV0dXJuIGZhbHNlIGFzIGEgZGVmYXVsdFxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IC8vIElmIHVzZXIgaXMgc2Nyb2xsaW5nIHRvd2FyZHMgdGhlIGVuZDpcbiAgICAgICAgLy8gICBJZiB0aGUgc2xpZGVyIGhhc24ndCBoaXQgdGhlIGxhdGVzdCBzbGlkZSBvclxuICAgICAgICAvLyAgIGlmIHRoZSBzbGlkZXIgaXMgYSBsb29wIGFuZFxuICAgICAgICAvLyAgIGlmIHRoZSBzbGlkZXIgaXNuJ3QgbW92aW5nIHJpZ2h0IG5vdzpcbiAgICAgICAgLy8gICAgIEdvIHRvIG5leHQgc2xpZGUgYW5kXG4gICAgICAgIC8vICAgICBlbWl0IGEgc2Nyb2xsIGV2ZW50LlxuICAgICAgICAvLyBFbHNlICh0aGUgdXNlciBpcyBzY3JvbGxpbmcgdG93YXJkcyB0aGUgYmVnaW5uaW5nKSBhbmRcbiAgICAgICAgLy8gaWYgdGhlIHNsaWRlciBoYXNuJ3QgaGl0IHRoZSBmaXJzdCBzbGlkZSBvclxuICAgICAgICAvLyBpZiB0aGUgc2xpZGVyIGlzIGEgbG9vcCBhbmRcbiAgICAgICAgLy8gaWYgdGhlIHNsaWRlciBpc24ndCBtb3ZpbmcgcmlnaHQgbm93OlxuICAgICAgICAvLyAgIEdvIHRvIHByZXYgc2xpZGUgYW5kXG4gICAgICAgIC8vICAgZW1pdCBhIHNjcm9sbCBldmVudC5cblxuXG4gICAgICAgIGlmIChuZXdFdmVudC5kaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgaWYgKCghc3dpcGVyLmlzRW5kIHx8IHN3aXBlci5wYXJhbXMubG9vcCkgJiYgIXN3aXBlci5hbmltYXRpbmcpIHtcbiAgICAgICAgICAgIHN3aXBlci5zbGlkZU5leHQoKTtcbiAgICAgICAgICAgIGVtaXQoJ3Njcm9sbCcsIG5ld0V2ZW50LnJhdyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCghc3dpcGVyLmlzQmVnaW5uaW5nIHx8IHN3aXBlci5wYXJhbXMubG9vcCkgJiYgIXN3aXBlci5hbmltYXRpbmcpIHtcbiAgICAgICAgICBzd2lwZXIuc2xpZGVQcmV2KCk7XG4gICAgICAgICAgZW1pdCgnc2Nyb2xsJywgbmV3RXZlbnQucmF3KTtcbiAgICAgICAgfSAvLyBJZiB5b3UgZ290IGhlcmUgaXMgYmVjYXVzZSBhbiBhbmltYXRpb24gaGFzIGJlZW4gdHJpZ2dlcmVkIHNvIHN0b3JlIHRoZSBjdXJyZW50IHRpbWVcblxuXG4gICAgICAgIGxhc3RTY3JvbGxUaW1lID0gbmV3IHdpbmRvdy5EYXRlKCkuZ2V0VGltZSgpOyAvLyBSZXR1cm4gZmFsc2UgYXMgYSBkZWZhdWx0XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZWxlYXNlU2Nyb2xsKG5ld0V2ZW50KSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHN3aXBlci5wYXJhbXMubW91c2V3aGVlbDtcblxuICAgICAgICBpZiAobmV3RXZlbnQuZGlyZWN0aW9uIDwgMCkge1xuICAgICAgICAgIGlmIChzd2lwZXIuaXNFbmQgJiYgIXN3aXBlci5wYXJhbXMubG9vcCAmJiBwYXJhbXMucmVsZWFzZU9uRWRnZXMpIHtcbiAgICAgICAgICAgIC8vIFJldHVybiB0cnVlIHRvIGFuaW1hdGUgc2Nyb2xsIG9uIGVkZ2VzXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc3dpcGVyLmlzQmVnaW5uaW5nICYmICFzd2lwZXIucGFyYW1zLmxvb3AgJiYgcGFyYW1zLnJlbGVhc2VPbkVkZ2VzKSB7XG4gICAgICAgICAgLy8gUmV0dXJuIHRydWUgdG8gYW5pbWF0ZSBzY3JvbGwgb24gZWRnZXNcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlKGV2ZW50KSB7XG4gICAgICAgIGxldCBlID0gZXZlbnQ7XG4gICAgICAgIGxldCBkaXNhYmxlUGFyZW50U3dpcGVyID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFzd2lwZXIuZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLm1vdXNld2hlZWw7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0YXJnZXQgPSBzd2lwZXIuJGVsO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLm1vdXNld2hlZWwuZXZlbnRzVGFyZ2V0ICE9PSAnY29udGFpbmVyJykge1xuICAgICAgICAgIHRhcmdldCA9ICQkMShzd2lwZXIucGFyYW1zLm1vdXNld2hlZWwuZXZlbnRzVGFyZ2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3dpcGVyLm1vdXNlRW50ZXJlZCAmJiAhdGFyZ2V0WzBdLmNvbnRhaW5zKGUudGFyZ2V0KSAmJiAhcGFyYW1zLnJlbGVhc2VPbkVkZ2VzKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKGUub3JpZ2luYWxFdmVudCkgZSA9IGUub3JpZ2luYWxFdmVudDsgLy8ganF1ZXJ5IGZpeFxuXG4gICAgICAgIGxldCBkZWx0YSA9IDA7XG4gICAgICAgIGNvbnN0IHJ0bEZhY3RvciA9IHN3aXBlci5ydGxUcmFuc2xhdGUgPyAtMSA6IDE7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBub3JtYWxpemUoZSk7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5mb3JjZVRvQXhpcykge1xuICAgICAgICAgIGlmIChzd2lwZXIuaXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkYXRhLnBpeGVsWCkgPiBNYXRoLmFicyhkYXRhLnBpeGVsWSkpIGRlbHRhID0gLWRhdGEucGl4ZWxYICogcnRsRmFjdG9yO2Vsc2UgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChNYXRoLmFicyhkYXRhLnBpeGVsWSkgPiBNYXRoLmFicyhkYXRhLnBpeGVsWCkpIGRlbHRhID0gLWRhdGEucGl4ZWxZO2Vsc2UgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsdGEgPSBNYXRoLmFicyhkYXRhLnBpeGVsWCkgPiBNYXRoLmFicyhkYXRhLnBpeGVsWSkgPyAtZGF0YS5waXhlbFggKiBydGxGYWN0b3IgOiAtZGF0YS5waXhlbFk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVsdGEgPT09IDApIHJldHVybiB0cnVlO1xuICAgICAgICBpZiAocGFyYW1zLmludmVydCkgZGVsdGEgPSAtZGVsdGE7IC8vIEdldCB0aGUgc2Nyb2xsIHBvc2l0aW9uc1xuXG4gICAgICAgIGxldCBwb3NpdGlvbnMgPSBzd2lwZXIuZ2V0VHJhbnNsYXRlKCkgKyBkZWx0YSAqIHBhcmFtcy5zZW5zaXRpdml0eTtcbiAgICAgICAgaWYgKHBvc2l0aW9ucyA+PSBzd2lwZXIubWluVHJhbnNsYXRlKCkpIHBvc2l0aW9ucyA9IHN3aXBlci5taW5UcmFuc2xhdGUoKTtcbiAgICAgICAgaWYgKHBvc2l0aW9ucyA8PSBzd2lwZXIubWF4VHJhbnNsYXRlKCkpIHBvc2l0aW9ucyA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKTsgLy8gV2hlbiBsb29wIGlzIHRydWU6XG4gICAgICAgIC8vICAgICB0aGUgZGlzYWJsZVBhcmVudFN3aXBlciB3aWxsIGJlIHRydWUuXG4gICAgICAgIC8vIFdoZW4gbG9vcCBpcyBmYWxzZTpcbiAgICAgICAgLy8gICAgIGlmIHRoZSBzY3JvbGwgcG9zaXRpb25zIGlzIG5vdCBvbiBlZGdlLFxuICAgICAgICAvLyAgICAgdGhlbiB0aGUgZGlzYWJsZVBhcmVudFN3aXBlciB3aWxsIGJlIHRydWUuXG4gICAgICAgIC8vICAgICBpZiB0aGUgc2Nyb2xsIG9uIGVkZ2UgcG9zaXRpb25zLFxuICAgICAgICAvLyAgICAgdGhlbiB0aGUgZGlzYWJsZVBhcmVudFN3aXBlciB3aWxsIGJlIGZhbHNlLlxuXG4gICAgICAgIGRpc2FibGVQYXJlbnRTd2lwZXIgPSBzd2lwZXIucGFyYW1zLmxvb3AgPyB0cnVlIDogIShwb3NpdGlvbnMgPT09IHN3aXBlci5taW5UcmFuc2xhdGUoKSB8fCBwb3NpdGlvbnMgPT09IHN3aXBlci5tYXhUcmFuc2xhdGUoKSk7XG4gICAgICAgIGlmIChkaXNhYmxlUGFyZW50U3dpcGVyICYmIHN3aXBlci5wYXJhbXMubmVzdGVkKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5mcmVlTW9kZSB8fCAhc3dpcGVyLnBhcmFtcy5mcmVlTW9kZS5lbmFibGVkKSB7XG4gICAgICAgICAgLy8gUmVnaXN0ZXIgdGhlIG5ldyBldmVudCBpbiBhIHZhcmlhYmxlIHdoaWNoIHN0b3JlcyB0aGUgcmVsZXZhbnQgZGF0YVxuICAgICAgICAgIGNvbnN0IG5ld0V2ZW50ID0ge1xuICAgICAgICAgICAgdGltZTogbm93KCksXG4gICAgICAgICAgICBkZWx0YTogTWF0aC5hYnMoZGVsdGEpLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiBNYXRoLnNpZ24oZGVsdGEpLFxuICAgICAgICAgICAgcmF3OiBldmVudFxuICAgICAgICAgIH07IC8vIEtlZXAgdGhlIG1vc3QgcmVjZW50IGV2ZW50c1xuXG4gICAgICAgICAgaWYgKHJlY2VudFdoZWVsRXZlbnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICByZWNlbnRXaGVlbEV2ZW50cy5zaGlmdCgpOyAvLyBvbmx5IHN0b3JlIHRoZSBsYXN0IE4gZXZlbnRzXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgcHJldkV2ZW50ID0gcmVjZW50V2hlZWxFdmVudHMubGVuZ3RoID8gcmVjZW50V2hlZWxFdmVudHNbcmVjZW50V2hlZWxFdmVudHMubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgcmVjZW50V2hlZWxFdmVudHMucHVzaChuZXdFdmVudCk7IC8vIElmIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBwcmV2aW91cyByZWNvcmRlZCBldmVudDpcbiAgICAgICAgICAvLyAgIElmIGRpcmVjdGlvbiBoYXMgY2hhbmdlZCBvclxuICAgICAgICAgIC8vICAgaWYgdGhlIHNjcm9sbCBpcyBxdWlja2VyIHRoYW4gdGhlIHByZXZpb3VzIG9uZTpcbiAgICAgICAgICAvLyAgICAgQW5pbWF0ZSB0aGUgc2xpZGVyLlxuICAgICAgICAgIC8vIEVsc2UgKHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgdGhlIHdoZWVsIGlzIG1vdmVkKTpcbiAgICAgICAgICAvLyAgICAgQW5pbWF0ZSB0aGUgc2xpZGVyLlxuXG4gICAgICAgICAgaWYgKHByZXZFdmVudCkge1xuICAgICAgICAgICAgaWYgKG5ld0V2ZW50LmRpcmVjdGlvbiAhPT0gcHJldkV2ZW50LmRpcmVjdGlvbiB8fCBuZXdFdmVudC5kZWx0YSA+IHByZXZFdmVudC5kZWx0YSB8fCBuZXdFdmVudC50aW1lID4gcHJldkV2ZW50LnRpbWUgKyAxNTApIHtcbiAgICAgICAgICAgICAgYW5pbWF0ZVNsaWRlcihuZXdFdmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFuaW1hdGVTbGlkZXIobmV3RXZlbnQpO1xuICAgICAgICAgIH0gLy8gSWYgaXQncyB0aW1lIHRvIHJlbGVhc2UgdGhlIHNjcm9sbDpcbiAgICAgICAgICAvLyAgIFJldHVybiBub3cgc28geW91IGRvbid0IGhpdCB0aGUgcHJldmVudERlZmF1bHQuXG5cblxuICAgICAgICAgIGlmIChyZWxlYXNlU2Nyb2xsKG5ld0V2ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEZyZWVtb2RlIG9yIHNjcm9sbENvbnRhaW5lcjpcbiAgICAgICAgICAvLyBJZiB3ZSByZWNlbnRseSBzbmFwcGVkIGFmdGVyIGEgbW9tZW50dW0gc2Nyb2xsLCB0aGVuIGlnbm9yZSB3aGVlbCBldmVudHNcbiAgICAgICAgICAvLyB0byBnaXZlIHRpbWUgZm9yIHRoZSBkZWNlbGVyYXRpb24gdG8gZmluaXNoLiBTdG9wIGlnbm9yaW5nIGFmdGVyIDUwMCBtc2Vjc1xuICAgICAgICAgIC8vIG9yIGlmIGl0J3MgYSBuZXcgc2Nyb2xsIChsYXJnZXIgZGVsdGEgb3IgaW52ZXJzZSBzaWduIGFzIGxhc3QgZXZlbnQgYmVmb3JlXG4gICAgICAgICAgLy8gYW4gZW5kLW9mLW1vbWVudHVtIHNuYXApLlxuICAgICAgICAgIGNvbnN0IG5ld0V2ZW50ID0ge1xuICAgICAgICAgICAgdGltZTogbm93KCksXG4gICAgICAgICAgICBkZWx0YTogTWF0aC5hYnMoZGVsdGEpLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiBNYXRoLnNpZ24oZGVsdGEpXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBpZ25vcmVXaGVlbEV2ZW50cyA9IGxhc3RFdmVudEJlZm9yZVNuYXAgJiYgbmV3RXZlbnQudGltZSA8IGxhc3RFdmVudEJlZm9yZVNuYXAudGltZSArIDUwMCAmJiBuZXdFdmVudC5kZWx0YSA8PSBsYXN0RXZlbnRCZWZvcmVTbmFwLmRlbHRhICYmIG5ld0V2ZW50LmRpcmVjdGlvbiA9PT0gbGFzdEV2ZW50QmVmb3JlU25hcC5kaXJlY3Rpb247XG5cbiAgICAgICAgICBpZiAoIWlnbm9yZVdoZWVsRXZlbnRzKSB7XG4gICAgICAgICAgICBsYXN0RXZlbnRCZWZvcmVTbmFwID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgICAgIHN3aXBlci5sb29wRml4KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHN3aXBlci5nZXRUcmFuc2xhdGUoKSArIGRlbHRhICogcGFyYW1zLnNlbnNpdGl2aXR5O1xuICAgICAgICAgICAgY29uc3Qgd2FzQmVnaW5uaW5nID0gc3dpcGVyLmlzQmVnaW5uaW5nO1xuICAgICAgICAgICAgY29uc3Qgd2FzRW5kID0gc3dpcGVyLmlzRW5kO1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uID49IHN3aXBlci5taW5UcmFuc2xhdGUoKSkgcG9zaXRpb24gPSBzd2lwZXIubWluVHJhbnNsYXRlKCk7XG4gICAgICAgICAgICBpZiAocG9zaXRpb24gPD0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpKSBwb3NpdGlvbiA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKTtcbiAgICAgICAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKDApO1xuICAgICAgICAgICAgc3dpcGVyLnNldFRyYW5zbGF0ZShwb3NpdGlvbik7XG4gICAgICAgICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgIHN3aXBlci51cGRhdGVBY3RpdmVJbmRleCgpO1xuICAgICAgICAgICAgc3dpcGVyLnVwZGF0ZVNsaWRlc0NsYXNzZXMoKTtcblxuICAgICAgICAgICAgaWYgKCF3YXNCZWdpbm5pbmcgJiYgc3dpcGVyLmlzQmVnaW5uaW5nIHx8ICF3YXNFbmQgJiYgc3dpcGVyLmlzRW5kKSB7XG4gICAgICAgICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmZyZWVNb2RlLnN0aWNreSkge1xuICAgICAgICAgICAgICAvLyBXaGVuIHdoZWVsIHNjcm9sbGluZyBzdGFydHMgd2l0aCBzdGlja3kgKGFrYSBzbmFwKSBlbmFibGVkLCB0aGVuIGRldGVjdFxuICAgICAgICAgICAgICAvLyB0aGUgZW5kIG9mIGEgbW9tZW50dW0gc2Nyb2xsIGJ5IHN0b3JpbmcgcmVjZW50IChOPTE1Pykgd2hlZWwgZXZlbnRzLlxuICAgICAgICAgICAgICAvLyAxLiBkbyBhbGwgTiBldmVudHMgaGF2ZSBkZWNyZWFzaW5nIG9yIHNhbWUgKGFic29sdXRlIHZhbHVlKSBkZWx0YT9cbiAgICAgICAgICAgICAgLy8gMi4gZGlkIGFsbCBOIGV2ZW50cyBhcnJpdmUgaW4gdGhlIGxhc3QgTSAoTT01MDA/KSBtc2Vjcz9cbiAgICAgICAgICAgICAgLy8gMy4gZG9lcyB0aGUgZWFybGllc3QgZXZlbnQgaGF2ZSBhbiAoYWJzb2x1dGUgdmFsdWUpIGRlbHRhIHRoYXQnc1xuICAgICAgICAgICAgICAvLyAgICBhdCBsZWFzdCBQIChQPTE/KSBsYXJnZXIgdGhhbiB0aGUgbW9zdCByZWNlbnQgZXZlbnQncyBkZWx0YT9cbiAgICAgICAgICAgICAgLy8gNC4gZG9lcyB0aGUgbGF0ZXN0IGV2ZW50IGhhdmUgYSBkZWx0YSB0aGF0J3Mgc21hbGxlciB0aGFuIFEgKFE9Nj8pIHBpeGVscz9cbiAgICAgICAgICAgICAgLy8gSWYgMS00IGFyZSBcInllc1wiIHRoZW4gd2UncmUgbmVhciB0aGUgZW5kIG9mIGEgbW9tZW50dW0gc2Nyb2xsIGRlY2VsZXJhdGlvbi5cbiAgICAgICAgICAgICAgLy8gU25hcCBpbW1lZGlhdGVseSBhbmQgaWdub3JlIHJlbWFpbmluZyB3aGVlbCBldmVudHMgaW4gdGhpcyBzY3JvbGwuXG4gICAgICAgICAgICAgIC8vIFNlZSBjb21tZW50IGFib3ZlIGZvciBcInJlbWFpbmluZyB3aGVlbCBldmVudHMgaW4gdGhpcyBzY3JvbGxcIiBkZXRlcm1pbmF0aW9uLlxuICAgICAgICAgICAgICAvLyBJZiAxLTQgYXJlbid0IHNhdGlzZmllZCwgdGhlbiB3YWl0IHRvIHNuYXAgdW50aWwgNTAwbXMgYWZ0ZXIgdGhlIGxhc3QgZXZlbnQuXG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgICAgdGltZW91dCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICBpZiAocmVjZW50V2hlZWxFdmVudHMubGVuZ3RoID49IDE1KSB7XG4gICAgICAgICAgICAgICAgcmVjZW50V2hlZWxFdmVudHMuc2hpZnQoKTsgLy8gb25seSBzdG9yZSB0aGUgbGFzdCBOIGV2ZW50c1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgcHJldkV2ZW50ID0gcmVjZW50V2hlZWxFdmVudHMubGVuZ3RoID8gcmVjZW50V2hlZWxFdmVudHNbcmVjZW50V2hlZWxFdmVudHMubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIGNvbnN0IGZpcnN0RXZlbnQgPSByZWNlbnRXaGVlbEV2ZW50c1swXTtcbiAgICAgICAgICAgICAgcmVjZW50V2hlZWxFdmVudHMucHVzaChuZXdFdmVudCk7XG5cbiAgICAgICAgICAgICAgaWYgKHByZXZFdmVudCAmJiAobmV3RXZlbnQuZGVsdGEgPiBwcmV2RXZlbnQuZGVsdGEgfHwgbmV3RXZlbnQuZGlyZWN0aW9uICE9PSBwcmV2RXZlbnQuZGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIC8vIEluY3JlYXNpbmcgb3IgcmV2ZXJzZS1zaWduIGRlbHRhIG1lYW5zIHRoZSB1c2VyIHN0YXJ0ZWQgc2Nyb2xsaW5nIGFnYWluLiBDbGVhciB0aGUgd2hlZWwgZXZlbnQgbG9nLlxuICAgICAgICAgICAgICAgIHJlY2VudFdoZWVsRXZlbnRzLnNwbGljZSgwKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZWNlbnRXaGVlbEV2ZW50cy5sZW5ndGggPj0gMTUgJiYgbmV3RXZlbnQudGltZSAtIGZpcnN0RXZlbnQudGltZSA8IDUwMCAmJiBmaXJzdEV2ZW50LmRlbHRhIC0gbmV3RXZlbnQuZGVsdGEgPj0gMSAmJiBuZXdFdmVudC5kZWx0YSA8PSA2KSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgYXQgdGhlIGVuZCBvZiB0aGUgZGVjZWxlcmF0aW9uIG9mIGEgbW9tZW50dW0gc2Nyb2xsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgICAgICAgICAgICAgICAvLyB0byB3YWl0IGZvciBtb3JlIGV2ZW50cy4gU25hcCBBU0FQIG9uIHRoZSBuZXh0IHRpY2suXG4gICAgICAgICAgICAgICAgLy8gQWxzbywgYmVjYXVzZSB0aGVyZSdzIHNvbWUgcmVtYWluaW5nIG1vbWVudHVtIHdlJ2xsIGJpYXMgdGhlIHNuYXAgaW4gdGhlXG4gICAgICAgICAgICAgICAgLy8gZGlyZWN0aW9uIG9mIHRoZSBvbmdvaW5nIHNjcm9sbCBiZWNhdXNlIGl0J3MgYmV0dGVyIFVYIGZvciB0aGUgc2Nyb2xsIHRvIHNuYXBcbiAgICAgICAgICAgICAgICAvLyBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gYXMgdGhlIHNjcm9sbCBpbnN0ZWFkIG9mIHJldmVyc2luZyB0byBzbmFwLiAgVGhlcmVmb3JlLFxuICAgICAgICAgICAgICAgIC8vIGlmIGl0J3MgYWxyZWFkeSBzY3JvbGxlZCBtb3JlIHRoYW4gMjAlIGluIHRoZSBjdXJyZW50IGRpcmVjdGlvbiwga2VlcCBnb2luZy5cbiAgICAgICAgICAgICAgICBjb25zdCBzbmFwVG9UaHJlc2hvbGQgPSBkZWx0YSA+IDAgPyAwLjggOiAwLjI7XG4gICAgICAgICAgICAgICAgbGFzdEV2ZW50QmVmb3JlU25hcCA9IG5ld0V2ZW50O1xuICAgICAgICAgICAgICAgIHJlY2VudFdoZWVsRXZlbnRzLnNwbGljZSgwKTtcbiAgICAgICAgICAgICAgICB0aW1lb3V0ID0gbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG9DbG9zZXN0KHN3aXBlci5wYXJhbXMuc3BlZWQsIHRydWUsIHVuZGVmaW5lZCwgc25hcFRvVGhyZXNob2xkKTtcbiAgICAgICAgICAgICAgICB9LCAwKTsgLy8gbm8gZGVsYXk7IG1vdmUgb24gbmV4dCB0aWNrXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBnZXQgaGVyZSwgdGhlbiB3ZSBoYXZlbid0IGRldGVjdGVkIHRoZSBlbmQgb2YgYSBtb21lbnR1bSBzY3JvbGwsIHNvXG4gICAgICAgICAgICAgICAgLy8gd2UnbGwgY29uc2lkZXIgYSBzY3JvbGwgXCJjb21wbGV0ZVwiIHdoZW4gdGhlcmUgaGF2ZW4ndCBiZWVuIGFueSB3aGVlbCBldmVudHNcbiAgICAgICAgICAgICAgICAvLyBmb3IgNTAwbXMuXG4gICAgICAgICAgICAgICAgdGltZW91dCA9IG5leHRUaWNrKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHNuYXBUb1RocmVzaG9sZCA9IDAuNTtcbiAgICAgICAgICAgICAgICAgIGxhc3RFdmVudEJlZm9yZVNuYXAgPSBuZXdFdmVudDtcbiAgICAgICAgICAgICAgICAgIHJlY2VudFdoZWVsRXZlbnRzLnNwbGljZSgwKTtcbiAgICAgICAgICAgICAgICAgIHN3aXBlci5zbGlkZVRvQ2xvc2VzdChzd2lwZXIucGFyYW1zLnNwZWVkLCB0cnVlLCB1bmRlZmluZWQsIHNuYXBUb1RocmVzaG9sZCk7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSAvLyBFbWl0IGV2ZW50XG5cblxuICAgICAgICAgICAgaWYgKCFpZ25vcmVXaGVlbEV2ZW50cykgZW1pdCgnc2Nyb2xsJywgZSk7IC8vIFN0b3AgYXV0b3BsYXlcblxuICAgICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYXV0b3BsYXkgJiYgc3dpcGVyLnBhcmFtcy5hdXRvcGxheURpc2FibGVPbkludGVyYWN0aW9uKSBzd2lwZXIuYXV0b3BsYXkuc3RvcCgpOyAvLyBSZXR1cm4gcGFnZSBzY3JvbGwgb24gZWRnZSBwb3NpdGlvbnNcblxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uID09PSBzd2lwZXIubWluVHJhbnNsYXRlKCkgfHwgcG9zaXRpb24gPT09IHN3aXBlci5tYXhUcmFuc2xhdGUoKSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtlbHNlIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBldmVudHMobWV0aG9kKSB7XG4gICAgICAgIGxldCB0YXJnZXQgPSBzd2lwZXIuJGVsO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLm1vdXNld2hlZWwuZXZlbnRzVGFyZ2V0ICE9PSAnY29udGFpbmVyJykge1xuICAgICAgICAgIHRhcmdldCA9ICQkMShzd2lwZXIucGFyYW1zLm1vdXNld2hlZWwuZXZlbnRzVGFyZ2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldFttZXRob2RdKCdtb3VzZWVudGVyJywgaGFuZGxlTW91c2VFbnRlcik7XG4gICAgICAgIHRhcmdldFttZXRob2RdKCdtb3VzZWxlYXZlJywgaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgICAgIHRhcmdldFttZXRob2RdKCd3aGVlbCcsIGhhbmRsZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGVuYWJsZSgpIHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuY3NzTW9kZSkge1xuICAgICAgICAgIHN3aXBlci53cmFwcGVyRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBoYW5kbGUpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5tb3VzZXdoZWVsLmVuYWJsZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZXZlbnRzKCdvbicpO1xuICAgICAgICBzd2lwZXIubW91c2V3aGVlbC5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgICBzd2lwZXIud3JhcHBlckVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXN3aXBlci5tb3VzZXdoZWVsLmVuYWJsZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZXZlbnRzKCdvZmYnKTtcbiAgICAgICAgc3dpcGVyLm1vdXNld2hlZWwuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgb24oJ2luaXQnLCAoKSA9PiB7XG4gICAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5tb3VzZXdoZWVsLmVuYWJsZWQgJiYgc3dpcGVyLnBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgICAgZGlzYWJsZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubW91c2V3aGVlbC5lbmFibGVkKSBlbmFibGUoKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ2Rlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgICBlbmFibGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzd2lwZXIubW91c2V3aGVlbC5lbmFibGVkKSBkaXNhYmxlKCk7XG4gICAgICB9KTtcbiAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLm1vdXNld2hlZWwsIHtcbiAgICAgICAgZW5hYmxlLFxuICAgICAgICBkaXNhYmxlXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVFbGVtZW50SWZOb3REZWZpbmVkKHN3aXBlciwgb3JpZ2luYWxQYXJhbXMsIHBhcmFtcywgY2hlY2tQcm9wcykge1xuICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuXG4gICAgICBpZiAoc3dpcGVyLnBhcmFtcy5jcmVhdGVFbGVtZW50cykge1xuICAgICAgICBPYmplY3Qua2V5cyhjaGVja1Byb3BzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgaWYgKCFwYXJhbXNba2V5XSAmJiBwYXJhbXMuYXV0byA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBzd2lwZXIuJGVsLmNoaWxkcmVuKGAuJHtjaGVja1Byb3BzW2tleV19YClbMF07XG5cbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gY2hlY2tQcm9wc1trZXldO1xuICAgICAgICAgICAgICBzd2lwZXIuJGVsLmFwcGVuZChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGFyYW1zW2tleV0gPSBlbGVtZW50O1xuICAgICAgICAgICAgb3JpZ2luYWxQYXJhbXNba2V5XSA9IGVsZW1lbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBOYXZpZ2F0aW9uKF9yZWYpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgZXh0ZW5kUGFyYW1zLFxuICAgICAgICBvbixcbiAgICAgICAgZW1pdFxuICAgICAgfSA9IF9yZWY7XG4gICAgICBleHRlbmRQYXJhbXMoe1xuICAgICAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICAgICAgbmV4dEVsOiBudWxsLFxuICAgICAgICAgIHByZXZFbDogbnVsbCxcbiAgICAgICAgICBoaWRlT25DbGljazogZmFsc2UsXG4gICAgICAgICAgZGlzYWJsZWRDbGFzczogJ3N3aXBlci1idXR0b24tZGlzYWJsZWQnLFxuICAgICAgICAgIGhpZGRlbkNsYXNzOiAnc3dpcGVyLWJ1dHRvbi1oaWRkZW4nLFxuICAgICAgICAgIGxvY2tDbGFzczogJ3N3aXBlci1idXR0b24tbG9jaycsXG4gICAgICAgICAgbmF2aWdhdGlvbkRpc2FibGVkQ2xhc3M6ICdzd2lwZXItbmF2aWdhdGlvbi1kaXNhYmxlZCdcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzd2lwZXIubmF2aWdhdGlvbiA9IHtcbiAgICAgICAgbmV4dEVsOiBudWxsLFxuICAgICAgICAkbmV4dEVsOiBudWxsLFxuICAgICAgICBwcmV2RWw6IG51bGwsXG4gICAgICAgICRwcmV2RWw6IG51bGxcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIGdldEVsKGVsKSB7XG4gICAgICAgIGxldCAkZWw7XG5cbiAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgJGVsID0gJCQxKGVsKTtcblxuICAgICAgICAgIGlmIChzd2lwZXIucGFyYW1zLnVuaXF1ZU5hdkVsZW1lbnRzICYmIHR5cGVvZiBlbCA9PT0gJ3N0cmluZycgJiYgJGVsLmxlbmd0aCA+IDEgJiYgc3dpcGVyLiRlbC5maW5kKGVsKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICRlbCA9IHN3aXBlci4kZWwuZmluZChlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRlbDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdG9nZ2xlRWwoJGVsLCBkaXNhYmxlZCkge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLm5hdmlnYXRpb247XG5cbiAgICAgICAgaWYgKCRlbCAmJiAkZWwubGVuZ3RoID4gMCkge1xuICAgICAgICAgICRlbFtkaXNhYmxlZCA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXShwYXJhbXMuZGlzYWJsZWRDbGFzcyk7XG4gICAgICAgICAgaWYgKCRlbFswXSAmJiAkZWxbMF0udGFnTmFtZSA9PT0gJ0JVVFRPTicpICRlbFswXS5kaXNhYmxlZCA9IGRpc2FibGVkO1xuXG4gICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMud2F0Y2hPdmVyZmxvdyAmJiBzd2lwZXIuZW5hYmxlZCkge1xuICAgICAgICAgICAgJGVsW3N3aXBlci5pc0xvY2tlZCA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXShwYXJhbXMubG9ja0NsYXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAvLyBVcGRhdGUgTmF2aWdhdGlvbiBCdXR0b25zXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHJldHVybjtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICRuZXh0RWwsXG4gICAgICAgICAgJHByZXZFbFxuICAgICAgICB9ID0gc3dpcGVyLm5hdmlnYXRpb247XG4gICAgICAgIHRvZ2dsZUVsKCRwcmV2RWwsIHN3aXBlci5pc0JlZ2lubmluZyAmJiAhc3dpcGVyLnBhcmFtcy5yZXdpbmQpO1xuICAgICAgICB0b2dnbGVFbCgkbmV4dEVsLCBzd2lwZXIuaXNFbmQgJiYgIXN3aXBlci5wYXJhbXMucmV3aW5kKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25QcmV2Q2xpY2soZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChzd2lwZXIuaXNCZWdpbm5pbmcgJiYgIXN3aXBlci5wYXJhbXMubG9vcCAmJiAhc3dpcGVyLnBhcmFtcy5yZXdpbmQpIHJldHVybjtcbiAgICAgICAgc3dpcGVyLnNsaWRlUHJldigpO1xuICAgICAgICBlbWl0KCduYXZpZ2F0aW9uUHJldicpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvbk5leHRDbGljayhlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKHN3aXBlci5pc0VuZCAmJiAhc3dpcGVyLnBhcmFtcy5sb29wICYmICFzd2lwZXIucGFyYW1zLnJld2luZCkgcmV0dXJuO1xuICAgICAgICBzd2lwZXIuc2xpZGVOZXh0KCk7XG4gICAgICAgIGVtaXQoJ25hdmlnYXRpb25OZXh0Jyk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbjtcbiAgICAgICAgc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uID0gY3JlYXRlRWxlbWVudElmTm90RGVmaW5lZChzd2lwZXIsIHN3aXBlci5vcmlnaW5hbFBhcmFtcy5uYXZpZ2F0aW9uLCBzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24sIHtcbiAgICAgICAgICBuZXh0RWw6ICdzd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgICAgIHByZXZFbDogJ3N3aXBlci1idXR0b24tcHJldidcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghKHBhcmFtcy5uZXh0RWwgfHwgcGFyYW1zLnByZXZFbCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgJG5leHRFbCA9IGdldEVsKHBhcmFtcy5uZXh0RWwpO1xuICAgICAgICBjb25zdCAkcHJldkVsID0gZ2V0RWwocGFyYW1zLnByZXZFbCk7XG5cbiAgICAgICAgaWYgKCRuZXh0RWwgJiYgJG5leHRFbC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgJG5leHRFbC5vbignY2xpY2snLCBvbk5leHRDbGljayk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJHByZXZFbCAmJiAkcHJldkVsLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAkcHJldkVsLm9uKCdjbGljaycsIG9uUHJldkNsaWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLm5hdmlnYXRpb24sIHtcbiAgICAgICAgICAkbmV4dEVsLFxuICAgICAgICAgIG5leHRFbDogJG5leHRFbCAmJiAkbmV4dEVsWzBdLFxuICAgICAgICAgICRwcmV2RWwsXG4gICAgICAgICAgcHJldkVsOiAkcHJldkVsICYmICRwcmV2RWxbMF1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFzd2lwZXIuZW5hYmxlZCkge1xuICAgICAgICAgIGlmICgkbmV4dEVsKSAkbmV4dEVsLmFkZENsYXNzKHBhcmFtcy5sb2NrQ2xhc3MpO1xuICAgICAgICAgIGlmICgkcHJldkVsKSAkcHJldkVsLmFkZENsYXNzKHBhcmFtcy5sb2NrQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAkbmV4dEVsLFxuICAgICAgICAgICRwcmV2RWxcbiAgICAgICAgfSA9IHN3aXBlci5uYXZpZ2F0aW9uO1xuXG4gICAgICAgIGlmICgkbmV4dEVsICYmICRuZXh0RWwubGVuZ3RoKSB7XG4gICAgICAgICAgJG5leHRFbC5vZmYoJ2NsaWNrJywgb25OZXh0Q2xpY2spO1xuICAgICAgICAgICRuZXh0RWwucmVtb3ZlQ2xhc3Moc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmRpc2FibGVkQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRwcmV2RWwgJiYgJHByZXZFbC5sZW5ndGgpIHtcbiAgICAgICAgICAkcHJldkVsLm9mZignY2xpY2snLCBvblByZXZDbGljayk7XG4gICAgICAgICAgJHByZXZFbC5yZW1vdmVDbGFzcyhzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24uZGlzYWJsZWRDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb24oJ2luaXQnLCAoKSA9PiB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24uZW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICBkaXNhYmxlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9uKCd0b0VkZ2UgZnJvbUVkZ2UgbG9jayB1bmxvY2snLCAoKSA9PiB7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSk7XG4gICAgICBvbignZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgZGVzdHJveSgpO1xuICAgICAgfSk7XG4gICAgICBvbignZW5hYmxlIGRpc2FibGUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAkbmV4dEVsLFxuICAgICAgICAgICRwcmV2RWxcbiAgICAgICAgfSA9IHN3aXBlci5uYXZpZ2F0aW9uO1xuXG4gICAgICAgIGlmICgkbmV4dEVsKSB7XG4gICAgICAgICAgJG5leHRFbFtzd2lwZXIuZW5hYmxlZCA/ICdyZW1vdmVDbGFzcycgOiAnYWRkQ2xhc3MnXShzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24ubG9ja0NsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkcHJldkVsKSB7XG4gICAgICAgICAgJHByZXZFbFtzd2lwZXIuZW5hYmxlZCA/ICdyZW1vdmVDbGFzcycgOiAnYWRkQ2xhc3MnXShzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24ubG9ja0NsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbignY2xpY2snLCAoX3MsIGUpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICRuZXh0RWwsXG4gICAgICAgICAgJHByZXZFbFxuICAgICAgICB9ID0gc3dpcGVyLm5hdmlnYXRpb247XG4gICAgICAgIGNvbnN0IHRhcmdldEVsID0gZS50YXJnZXQ7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbi5oaWRlT25DbGljayAmJiAhJCQxKHRhcmdldEVsKS5pcygkcHJldkVsKSAmJiAhJCQxKHRhcmdldEVsKS5pcygkbmV4dEVsKSkge1xuICAgICAgICAgIGlmIChzd2lwZXIucGFnaW5hdGlvbiAmJiBzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24gJiYgc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmNsaWNrYWJsZSAmJiAoc3dpcGVyLnBhZ2luYXRpb24uZWwgPT09IHRhcmdldEVsIHx8IHN3aXBlci5wYWdpbmF0aW9uLmVsLmNvbnRhaW5zKHRhcmdldEVsKSkpIHJldHVybjtcbiAgICAgICAgICBsZXQgaXNIaWRkZW47XG5cbiAgICAgICAgICBpZiAoJG5leHRFbCkge1xuICAgICAgICAgICAgaXNIaWRkZW4gPSAkbmV4dEVsLmhhc0NsYXNzKHN3aXBlci5wYXJhbXMubmF2aWdhdGlvbi5oaWRkZW5DbGFzcyk7XG4gICAgICAgICAgfSBlbHNlIGlmICgkcHJldkVsKSB7XG4gICAgICAgICAgICBpc0hpZGRlbiA9ICRwcmV2RWwuaGFzQ2xhc3Moc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmhpZGRlbkNsYXNzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaXNIaWRkZW4gPT09IHRydWUpIHtcbiAgICAgICAgICAgIGVtaXQoJ25hdmlnYXRpb25TaG93Jyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVtaXQoJ25hdmlnYXRpb25IaWRlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCRuZXh0RWwpIHtcbiAgICAgICAgICAgICRuZXh0RWwudG9nZ2xlQ2xhc3Moc3dpcGVyLnBhcmFtcy5uYXZpZ2F0aW9uLmhpZGRlbkNsYXNzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoJHByZXZFbCkge1xuICAgICAgICAgICAgJHByZXZFbC50b2dnbGVDbGFzcyhzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24uaGlkZGVuQ2xhc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGVuYWJsZSA9ICgpID0+IHtcbiAgICAgICAgc3dpcGVyLiRlbC5yZW1vdmVDbGFzcyhzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24ubmF2aWdhdGlvbkRpc2FibGVkQ2xhc3MpO1xuICAgICAgICBpbml0KCk7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgZGlzYWJsZSA9ICgpID0+IHtcbiAgICAgICAgc3dpcGVyLiRlbC5hZGRDbGFzcyhzd2lwZXIucGFyYW1zLm5hdmlnYXRpb24ubmF2aWdhdGlvbkRpc2FibGVkQ2xhc3MpO1xuICAgICAgICBkZXN0cm95KCk7XG4gICAgICB9O1xuXG4gICAgICBPYmplY3QuYXNzaWduKHN3aXBlci5uYXZpZ2F0aW9uLCB7XG4gICAgICAgIGVuYWJsZSxcbiAgICAgICAgZGlzYWJsZSxcbiAgICAgICAgdXBkYXRlLFxuICAgICAgICBpbml0LFxuICAgICAgICBkZXN0cm95XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbGFzc2VzVG9TZWxlY3RvcihjbGFzc2VzKSB7XG4gICAgICBpZiAoY2xhc3NlcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGNsYXNzZXMgPSAnJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGAuJHtjbGFzc2VzLnRyaW0oKS5yZXBsYWNlKC8oW1xcLjohXFwvXSkvZywgJ1xcXFwkMScpIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgLnJlcGxhY2UoLyAvZywgJy4nKX1gO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFBhZ2luYXRpb24oX3JlZikge1xuICAgICAgbGV0IHtcbiAgICAgICAgc3dpcGVyLFxuICAgICAgICBleHRlbmRQYXJhbXMsXG4gICAgICAgIG9uLFxuICAgICAgICBlbWl0XG4gICAgICB9ID0gX3JlZjtcbiAgICAgIGNvbnN0IHBmeCA9ICdzd2lwZXItcGFnaW5hdGlvbic7XG4gICAgICBleHRlbmRQYXJhbXMoe1xuICAgICAgICBwYWdpbmF0aW9uOiB7XG4gICAgICAgICAgZWw6IG51bGwsXG4gICAgICAgICAgYnVsbGV0RWxlbWVudDogJ3NwYW4nLFxuICAgICAgICAgIGNsaWNrYWJsZTogZmFsc2UsXG4gICAgICAgICAgaGlkZU9uQ2xpY2s6IGZhbHNlLFxuICAgICAgICAgIHJlbmRlckJ1bGxldDogbnVsbCxcbiAgICAgICAgICByZW5kZXJQcm9ncmVzc2JhcjogbnVsbCxcbiAgICAgICAgICByZW5kZXJGcmFjdGlvbjogbnVsbCxcbiAgICAgICAgICByZW5kZXJDdXN0b206IG51bGwsXG4gICAgICAgICAgcHJvZ3Jlc3NiYXJPcHBvc2l0ZTogZmFsc2UsXG4gICAgICAgICAgdHlwZTogJ2J1bGxldHMnLFxuICAgICAgICAgIC8vICdidWxsZXRzJyBvciAncHJvZ3Jlc3NiYXInIG9yICdmcmFjdGlvbicgb3IgJ2N1c3RvbSdcbiAgICAgICAgICBkeW5hbWljQnVsbGV0czogZmFsc2UsXG4gICAgICAgICAgZHluYW1pY01haW5CdWxsZXRzOiAxLFxuICAgICAgICAgIGZvcm1hdEZyYWN0aW9uQ3VycmVudDogbnVtYmVyID0+IG51bWJlcixcbiAgICAgICAgICBmb3JtYXRGcmFjdGlvblRvdGFsOiBudW1iZXIgPT4gbnVtYmVyLFxuICAgICAgICAgIGJ1bGxldENsYXNzOiBgJHtwZnh9LWJ1bGxldGAsXG4gICAgICAgICAgYnVsbGV0QWN0aXZlQ2xhc3M6IGAke3BmeH0tYnVsbGV0LWFjdGl2ZWAsXG4gICAgICAgICAgbW9kaWZpZXJDbGFzczogYCR7cGZ4fS1gLFxuICAgICAgICAgIGN1cnJlbnRDbGFzczogYCR7cGZ4fS1jdXJyZW50YCxcbiAgICAgICAgICB0b3RhbENsYXNzOiBgJHtwZnh9LXRvdGFsYCxcbiAgICAgICAgICBoaWRkZW5DbGFzczogYCR7cGZ4fS1oaWRkZW5gLFxuICAgICAgICAgIHByb2dyZXNzYmFyRmlsbENsYXNzOiBgJHtwZnh9LXByb2dyZXNzYmFyLWZpbGxgLFxuICAgICAgICAgIHByb2dyZXNzYmFyT3Bwb3NpdGVDbGFzczogYCR7cGZ4fS1wcm9ncmVzc2Jhci1vcHBvc2l0ZWAsXG4gICAgICAgICAgY2xpY2thYmxlQ2xhc3M6IGAke3BmeH0tY2xpY2thYmxlYCxcbiAgICAgICAgICBsb2NrQ2xhc3M6IGAke3BmeH0tbG9ja2AsXG4gICAgICAgICAgaG9yaXpvbnRhbENsYXNzOiBgJHtwZnh9LWhvcml6b250YWxgLFxuICAgICAgICAgIHZlcnRpY2FsQ2xhc3M6IGAke3BmeH0tdmVydGljYWxgLFxuICAgICAgICAgIHBhZ2luYXRpb25EaXNhYmxlZENsYXNzOiBgJHtwZnh9LWRpc2FibGVkYFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHN3aXBlci5wYWdpbmF0aW9uID0ge1xuICAgICAgICBlbDogbnVsbCxcbiAgICAgICAgJGVsOiBudWxsLFxuICAgICAgICBidWxsZXRzOiBbXVxuICAgICAgfTtcbiAgICAgIGxldCBidWxsZXRTaXplO1xuICAgICAgbGV0IGR5bmFtaWNCdWxsZXRJbmRleCA9IDA7XG5cbiAgICAgIGZ1bmN0aW9uIGlzUGFnaW5hdGlvbkRpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gIXN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5lbCB8fCAhc3dpcGVyLnBhZ2luYXRpb24uZWwgfHwgIXN3aXBlci5wYWdpbmF0aW9uLiRlbCB8fCBzd2lwZXIucGFnaW5hdGlvbi4kZWwubGVuZ3RoID09PSAwO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRTaWRlQnVsbGV0cygkYnVsbGV0RWwsIHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBidWxsZXRBY3RpdmVDbGFzc1xuICAgICAgICB9ID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgICAgICAkYnVsbGV0RWxbcG9zaXRpb25dKCkuYWRkQ2xhc3MoYCR7YnVsbGV0QWN0aXZlQ2xhc3N9LSR7cG9zaXRpb259YClbcG9zaXRpb25dKCkuYWRkQ2xhc3MoYCR7YnVsbGV0QWN0aXZlQ2xhc3N9LSR7cG9zaXRpb259LSR7cG9zaXRpb259YCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgLy8gUmVuZGVyIHx8IFVwZGF0ZSBQYWdpbmF0aW9uIGJ1bGxldHMvaXRlbXNcbiAgICAgICAgY29uc3QgcnRsID0gc3dpcGVyLnJ0bDtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgICAgICBpZiAoaXNQYWdpbmF0aW9uRGlzYWJsZWQoKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBzbGlkZXNMZW5ndGggPSBzd2lwZXIudmlydHVhbCAmJiBzd2lwZXIucGFyYW1zLnZpcnR1YWwuZW5hYmxlZCA/IHN3aXBlci52aXJ0dWFsLnNsaWRlcy5sZW5ndGggOiBzd2lwZXIuc2xpZGVzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgJGVsID0gc3dpcGVyLnBhZ2luYXRpb24uJGVsOyAvLyBDdXJyZW50L1RvdGFsXG5cbiAgICAgICAgbGV0IGN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IHRvdGFsID0gc3dpcGVyLnBhcmFtcy5sb29wID8gTWF0aC5jZWlsKChzbGlkZXNMZW5ndGggLSBzd2lwZXIubG9vcGVkU2xpZGVzICogMikgLyBzd2lwZXIucGFyYW1zLnNsaWRlc1Blckdyb3VwKSA6IHN3aXBlci5zbmFwR3JpZC5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICAgIGN1cnJlbnQgPSBNYXRoLmNlaWwoKHN3aXBlci5hY3RpdmVJbmRleCAtIHN3aXBlci5sb29wZWRTbGlkZXMpIC8gc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cCk7XG5cbiAgICAgICAgICBpZiAoY3VycmVudCA+IHNsaWRlc0xlbmd0aCAtIDEgLSBzd2lwZXIubG9vcGVkU2xpZGVzICogMikge1xuICAgICAgICAgICAgY3VycmVudCAtPSBzbGlkZXNMZW5ndGggLSBzd2lwZXIubG9vcGVkU2xpZGVzICogMjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY3VycmVudCA+IHRvdGFsIC0gMSkgY3VycmVudCAtPSB0b3RhbDtcbiAgICAgICAgICBpZiAoY3VycmVudCA8IDAgJiYgc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uVHlwZSAhPT0gJ2J1bGxldHMnKSBjdXJyZW50ID0gdG90YWwgKyBjdXJyZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzd2lwZXIuc25hcEluZGV4ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGN1cnJlbnQgPSBzd2lwZXIuc25hcEluZGV4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1cnJlbnQgPSBzd2lwZXIuYWN0aXZlSW5kZXggfHwgMDtcbiAgICAgICAgfSAvLyBUeXBlc1xuXG5cbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAnYnVsbGV0cycgJiYgc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cyAmJiBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBidWxsZXRzID0gc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cztcbiAgICAgICAgICBsZXQgZmlyc3RJbmRleDtcbiAgICAgICAgICBsZXQgbGFzdEluZGV4O1xuICAgICAgICAgIGxldCBtaWRJbmRleDtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY0J1bGxldHMpIHtcbiAgICAgICAgICAgIGJ1bGxldFNpemUgPSBidWxsZXRzLmVxKDApW3N3aXBlci5pc0hvcml6b250YWwoKSA/ICdvdXRlcldpZHRoJyA6ICdvdXRlckhlaWdodCddKHRydWUpO1xuICAgICAgICAgICAgJGVsLmNzcyhzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAnd2lkdGgnIDogJ2hlaWdodCcsIGAke2J1bGxldFNpemUgKiAocGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0cyArIDQpfXB4YCk7XG5cbiAgICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY01haW5CdWxsZXRzID4gMSAmJiBzd2lwZXIucHJldmlvdXNJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGR5bmFtaWNCdWxsZXRJbmRleCArPSBjdXJyZW50IC0gKHN3aXBlci5wcmV2aW91c0luZGV4IC0gc3dpcGVyLmxvb3BlZFNsaWRlcyB8fCAwKTtcblxuICAgICAgICAgICAgICBpZiAoZHluYW1pY0J1bGxldEluZGV4ID4gcGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0cyAtIDEpIHtcbiAgICAgICAgICAgICAgICBkeW5hbWljQnVsbGV0SW5kZXggPSBwYXJhbXMuZHluYW1pY01haW5CdWxsZXRzIC0gMTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChkeW5hbWljQnVsbGV0SW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgZHluYW1pY0J1bGxldEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaXJzdEluZGV4ID0gTWF0aC5tYXgoY3VycmVudCAtIGR5bmFtaWNCdWxsZXRJbmRleCwgMCk7XG4gICAgICAgICAgICBsYXN0SW5kZXggPSBmaXJzdEluZGV4ICsgKE1hdGgubWluKGJ1bGxldHMubGVuZ3RoLCBwYXJhbXMuZHluYW1pY01haW5CdWxsZXRzKSAtIDEpO1xuICAgICAgICAgICAgbWlkSW5kZXggPSAobGFzdEluZGV4ICsgZmlyc3RJbmRleCkgLyAyO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJ1bGxldHMucmVtb3ZlQ2xhc3MoWycnLCAnLW5leHQnLCAnLW5leHQtbmV4dCcsICctcHJldicsICctcHJldi1wcmV2JywgJy1tYWluJ10ubWFwKHN1ZmZpeCA9PiBgJHtwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3N9JHtzdWZmaXh9YCkuam9pbignICcpKTtcblxuICAgICAgICAgIGlmICgkZWwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgYnVsbGV0cy5lYWNoKGJ1bGxldCA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0ICRidWxsZXQgPSAkJDEoYnVsbGV0KTtcbiAgICAgICAgICAgICAgY29uc3QgYnVsbGV0SW5kZXggPSAkYnVsbGV0LmluZGV4KCk7XG5cbiAgICAgICAgICAgICAgaWYgKGJ1bGxldEluZGV4ID09PSBjdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgJGJ1bGxldC5hZGRDbGFzcyhwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHBhcmFtcy5keW5hbWljQnVsbGV0cykge1xuICAgICAgICAgICAgICAgIGlmIChidWxsZXRJbmRleCA+PSBmaXJzdEluZGV4ICYmIGJ1bGxldEluZGV4IDw9IGxhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgJGJ1bGxldC5hZGRDbGFzcyhgJHtwYXJhbXMuYnVsbGV0QWN0aXZlQ2xhc3N9LW1haW5gKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYnVsbGV0SW5kZXggPT09IGZpcnN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgIHNldFNpZGVCdWxsZXRzKCRidWxsZXQsICdwcmV2Jyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGJ1bGxldEluZGV4ID09PSBsYXN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgIHNldFNpZGVCdWxsZXRzKCRidWxsZXQsICduZXh0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgJGJ1bGxldCA9IGJ1bGxldHMuZXEoY3VycmVudCk7XG4gICAgICAgICAgICBjb25zdCBidWxsZXRJbmRleCA9ICRidWxsZXQuaW5kZXgoKTtcbiAgICAgICAgICAgICRidWxsZXQuYWRkQ2xhc3MocGFyYW1zLmJ1bGxldEFjdGl2ZUNsYXNzKTtcblxuICAgICAgICAgICAgaWYgKHBhcmFtcy5keW5hbWljQnVsbGV0cykge1xuICAgICAgICAgICAgICBjb25zdCAkZmlyc3REaXNwbGF5ZWRCdWxsZXQgPSBidWxsZXRzLmVxKGZpcnN0SW5kZXgpO1xuICAgICAgICAgICAgICBjb25zdCAkbGFzdERpc3BsYXllZEJ1bGxldCA9IGJ1bGxldHMuZXEobGFzdEluZGV4KTtcblxuICAgICAgICAgICAgICBmb3IgKGxldCBpID0gZmlyc3RJbmRleDsgaSA8PSBsYXN0SW5kZXg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGJ1bGxldHMuZXEoaSkuYWRkQ2xhc3MoYCR7cGFyYW1zLmJ1bGxldEFjdGl2ZUNsYXNzfS1tYWluYCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJ1bGxldEluZGV4ID49IGJ1bGxldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gcGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0czsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYnVsbGV0cy5lcShidWxsZXRzLmxlbmd0aCAtIGkpLmFkZENsYXNzKGAke3BhcmFtcy5idWxsZXRBY3RpdmVDbGFzc30tbWFpbmApO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBidWxsZXRzLmVxKGJ1bGxldHMubGVuZ3RoIC0gcGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0cyAtIDEpLmFkZENsYXNzKGAke3BhcmFtcy5idWxsZXRBY3RpdmVDbGFzc30tcHJldmApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzZXRTaWRlQnVsbGV0cygkZmlyc3REaXNwbGF5ZWRCdWxsZXQsICdwcmV2Jyk7XG4gICAgICAgICAgICAgICAgICBzZXRTaWRlQnVsbGV0cygkbGFzdERpc3BsYXllZEJ1bGxldCwgJ25leHQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0U2lkZUJ1bGxldHMoJGZpcnN0RGlzcGxheWVkQnVsbGV0LCAncHJldicpO1xuICAgICAgICAgICAgICAgIHNldFNpZGVCdWxsZXRzKCRsYXN0RGlzcGxheWVkQnVsbGV0LCAnbmV4dCcpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhcmFtcy5keW5hbWljQnVsbGV0cykge1xuICAgICAgICAgICAgY29uc3QgZHluYW1pY0J1bGxldHNMZW5ndGggPSBNYXRoLm1pbihidWxsZXRzLmxlbmd0aCwgcGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0cyArIDQpO1xuICAgICAgICAgICAgY29uc3QgYnVsbGV0c09mZnNldCA9IChidWxsZXRTaXplICogZHluYW1pY0J1bGxldHNMZW5ndGggLSBidWxsZXRTaXplKSAvIDIgLSBtaWRJbmRleCAqIGJ1bGxldFNpemU7XG4gICAgICAgICAgICBjb25zdCBvZmZzZXRQcm9wID0gcnRsID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgICAgICAgICAgIGJ1bGxldHMuY3NzKHN3aXBlci5pc0hvcml6b250YWwoKSA/IG9mZnNldFByb3AgOiAndG9wJywgYCR7YnVsbGV0c09mZnNldH1weGApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2ZyYWN0aW9uJykge1xuICAgICAgICAgICRlbC5maW5kKGNsYXNzZXNUb1NlbGVjdG9yKHBhcmFtcy5jdXJyZW50Q2xhc3MpKS50ZXh0KHBhcmFtcy5mb3JtYXRGcmFjdGlvbkN1cnJlbnQoY3VycmVudCArIDEpKTtcbiAgICAgICAgICAkZWwuZmluZChjbGFzc2VzVG9TZWxlY3RvcihwYXJhbXMudG90YWxDbGFzcykpLnRleHQocGFyYW1zLmZvcm1hdEZyYWN0aW9uVG90YWwodG90YWwpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ3Byb2dyZXNzYmFyJykge1xuICAgICAgICAgIGxldCBwcm9ncmVzc2JhckRpcmVjdGlvbjtcblxuICAgICAgICAgIGlmIChwYXJhbXMucHJvZ3Jlc3NiYXJPcHBvc2l0ZSkge1xuICAgICAgICAgICAgcHJvZ3Jlc3NiYXJEaXJlY3Rpb24gPSBzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9ncmVzc2JhckRpcmVjdGlvbiA9IHN3aXBlci5pc0hvcml6b250YWwoKSA/ICdob3Jpem9udGFsJyA6ICd2ZXJ0aWNhbCc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgc2NhbGUgPSAoY3VycmVudCArIDEpIC8gdG90YWw7XG4gICAgICAgICAgbGV0IHNjYWxlWCA9IDE7XG4gICAgICAgICAgbGV0IHNjYWxlWSA9IDE7XG5cbiAgICAgICAgICBpZiAocHJvZ3Jlc3NiYXJEaXJlY3Rpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICAgICAgc2NhbGVYID0gc2NhbGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjYWxlWSA9IHNjYWxlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRlbC5maW5kKGNsYXNzZXNUb1NlbGVjdG9yKHBhcmFtcy5wcm9ncmVzc2JhckZpbGxDbGFzcykpLnRyYW5zZm9ybShgdHJhbnNsYXRlM2QoMCwwLDApIHNjYWxlWCgke3NjYWxlWH0pIHNjYWxlWSgke3NjYWxlWX0pYCkudHJhbnNpdGlvbihzd2lwZXIucGFyYW1zLnNwZWVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2N1c3RvbScgJiYgcGFyYW1zLnJlbmRlckN1c3RvbSkge1xuICAgICAgICAgICRlbC5odG1sKHBhcmFtcy5yZW5kZXJDdXN0b20oc3dpcGVyLCBjdXJyZW50ICsgMSwgdG90YWwpKTtcbiAgICAgICAgICBlbWl0KCdwYWdpbmF0aW9uUmVuZGVyJywgJGVsWzBdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbWl0KCdwYWdpbmF0aW9uVXBkYXRlJywgJGVsWzBdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLndhdGNoT3ZlcmZsb3cgJiYgc3dpcGVyLmVuYWJsZWQpIHtcbiAgICAgICAgICAkZWxbc3dpcGVyLmlzTG9ja2VkID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKHBhcmFtcy5sb2NrQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgLy8gUmVuZGVyIENvbnRhaW5lclxuICAgICAgICBjb25zdCBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLnBhZ2luYXRpb247XG4gICAgICAgIGlmIChpc1BhZ2luYXRpb25EaXNhYmxlZCgpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHNsaWRlc0xlbmd0aCA9IHN3aXBlci52aXJ0dWFsICYmIHN3aXBlci5wYXJhbXMudmlydHVhbC5lbmFibGVkID8gc3dpcGVyLnZpcnR1YWwuc2xpZGVzLmxlbmd0aCA6IHN3aXBlci5zbGlkZXMubGVuZ3RoO1xuICAgICAgICBjb25zdCAkZWwgPSBzd2lwZXIucGFnaW5hdGlvbi4kZWw7XG4gICAgICAgIGxldCBwYWdpbmF0aW9uSFRNTCA9ICcnO1xuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2J1bGxldHMnKSB7XG4gICAgICAgICAgbGV0IG51bWJlck9mQnVsbGV0cyA9IHN3aXBlci5wYXJhbXMubG9vcCA/IE1hdGguY2VpbCgoc2xpZGVzTGVuZ3RoIC0gc3dpcGVyLmxvb3BlZFNsaWRlcyAqIDIpIC8gc3dpcGVyLnBhcmFtcy5zbGlkZXNQZXJHcm91cCkgOiBzd2lwZXIuc25hcEdyaWQubGVuZ3RoO1xuXG4gICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuZnJlZU1vZGUgJiYgc3dpcGVyLnBhcmFtcy5mcmVlTW9kZS5lbmFibGVkICYmICFzd2lwZXIucGFyYW1zLmxvb3AgJiYgbnVtYmVyT2ZCdWxsZXRzID4gc2xpZGVzTGVuZ3RoKSB7XG4gICAgICAgICAgICBudW1iZXJPZkJ1bGxldHMgPSBzbGlkZXNMZW5ndGg7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkJ1bGxldHM7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5yZW5kZXJCdWxsZXQpIHtcbiAgICAgICAgICAgICAgcGFnaW5hdGlvbkhUTUwgKz0gcGFyYW1zLnJlbmRlckJ1bGxldC5jYWxsKHN3aXBlciwgaSwgcGFyYW1zLmJ1bGxldENsYXNzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBhZ2luYXRpb25IVE1MICs9IGA8JHtwYXJhbXMuYnVsbGV0RWxlbWVudH0gY2xhc3M9XCIke3BhcmFtcy5idWxsZXRDbGFzc31cIj48LyR7cGFyYW1zLmJ1bGxldEVsZW1lbnR9PmA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgJGVsLmh0bWwocGFnaW5hdGlvbkhUTUwpO1xuICAgICAgICAgIHN3aXBlci5wYWdpbmF0aW9uLmJ1bGxldHMgPSAkZWwuZmluZChjbGFzc2VzVG9TZWxlY3RvcihwYXJhbXMuYnVsbGV0Q2xhc3MpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2ZyYWN0aW9uJykge1xuICAgICAgICAgIGlmIChwYXJhbXMucmVuZGVyRnJhY3Rpb24pIHtcbiAgICAgICAgICAgIHBhZ2luYXRpb25IVE1MID0gcGFyYW1zLnJlbmRlckZyYWN0aW9uLmNhbGwoc3dpcGVyLCBwYXJhbXMuY3VycmVudENsYXNzLCBwYXJhbXMudG90YWxDbGFzcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhZ2luYXRpb25IVE1MID0gYDxzcGFuIGNsYXNzPVwiJHtwYXJhbXMuY3VycmVudENsYXNzfVwiPjwvc3Bhbj5gICsgJyAvICcgKyBgPHNwYW4gY2xhc3M9XCIke3BhcmFtcy50b3RhbENsYXNzfVwiPjwvc3Bhbj5gO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRlbC5odG1sKHBhZ2luYXRpb25IVE1MKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ3Byb2dyZXNzYmFyJykge1xuICAgICAgICAgIGlmIChwYXJhbXMucmVuZGVyUHJvZ3Jlc3NiYXIpIHtcbiAgICAgICAgICAgIHBhZ2luYXRpb25IVE1MID0gcGFyYW1zLnJlbmRlclByb2dyZXNzYmFyLmNhbGwoc3dpcGVyLCBwYXJhbXMucHJvZ3Jlc3NiYXJGaWxsQ2xhc3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWdpbmF0aW9uSFRNTCA9IGA8c3BhbiBjbGFzcz1cIiR7cGFyYW1zLnByb2dyZXNzYmFyRmlsbENsYXNzfVwiPjwvc3Bhbj5gO1xuICAgICAgICAgIH1cblxuICAgICAgICAgICRlbC5odG1sKHBhZ2luYXRpb25IVE1MKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSAhPT0gJ2N1c3RvbScpIHtcbiAgICAgICAgICBlbWl0KCdwYWdpbmF0aW9uUmVuZGVyJywgc3dpcGVyLnBhZ2luYXRpb24uJGVsWzBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24gPSBjcmVhdGVFbGVtZW50SWZOb3REZWZpbmVkKHN3aXBlciwgc3dpcGVyLm9yaWdpbmFsUGFyYW1zLnBhZ2luYXRpb24sIHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbiwge1xuICAgICAgICAgIGVsOiAnc3dpcGVyLXBhZ2luYXRpb24nXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLnBhZ2luYXRpb247XG4gICAgICAgIGlmICghcGFyYW1zLmVsKSByZXR1cm47XG4gICAgICAgIGxldCAkZWwgPSAkJDEocGFyYW1zLmVsKTtcbiAgICAgICAgaWYgKCRlbC5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy51bmlxdWVOYXZFbGVtZW50cyAmJiB0eXBlb2YgcGFyYW1zLmVsID09PSAnc3RyaW5nJyAmJiAkZWwubGVuZ3RoID4gMSkge1xuICAgICAgICAgICRlbCA9IHN3aXBlci4kZWwuZmluZChwYXJhbXMuZWwpOyAvLyBjaGVjayBpZiBpdCBiZWxvbmdzIHRvIGFub3RoZXIgbmVzdGVkIFN3aXBlclxuXG4gICAgICAgICAgaWYgKCRlbC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAkZWwgPSAkZWwuZmlsdGVyKGVsID0+IHtcbiAgICAgICAgICAgICAgaWYgKCQkMShlbCkucGFyZW50cygnLnN3aXBlcicpWzBdICE9PSBzd2lwZXIuZWwpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyYW1zLnR5cGUgPT09ICdidWxsZXRzJyAmJiBwYXJhbXMuY2xpY2thYmxlKSB7XG4gICAgICAgICAgJGVsLmFkZENsYXNzKHBhcmFtcy5jbGlja2FibGVDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICAkZWwuYWRkQ2xhc3MocGFyYW1zLm1vZGlmaWVyQ2xhc3MgKyBwYXJhbXMudHlwZSk7XG4gICAgICAgICRlbC5hZGRDbGFzcyhzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBwYXJhbXMuaG9yaXpvbnRhbENsYXNzIDogcGFyYW1zLnZlcnRpY2FsQ2xhc3MpO1xuXG4gICAgICAgIGlmIChwYXJhbXMudHlwZSA9PT0gJ2J1bGxldHMnICYmIHBhcmFtcy5keW5hbWljQnVsbGV0cykge1xuICAgICAgICAgICRlbC5hZGRDbGFzcyhgJHtwYXJhbXMubW9kaWZpZXJDbGFzc30ke3BhcmFtcy50eXBlfS1keW5hbWljYCk7XG4gICAgICAgICAgZHluYW1pY0J1bGxldEluZGV4ID0gMDtcblxuICAgICAgICAgIGlmIChwYXJhbXMuZHluYW1pY01haW5CdWxsZXRzIDwgMSkge1xuICAgICAgICAgICAgcGFyYW1zLmR5bmFtaWNNYWluQnVsbGV0cyA9IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy50eXBlID09PSAncHJvZ3Jlc3NiYXInICYmIHBhcmFtcy5wcm9ncmVzc2Jhck9wcG9zaXRlKSB7XG4gICAgICAgICAgJGVsLmFkZENsYXNzKHBhcmFtcy5wcm9ncmVzc2Jhck9wcG9zaXRlQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5jbGlja2FibGUpIHtcbiAgICAgICAgICAkZWwub24oJ2NsaWNrJywgY2xhc3Nlc1RvU2VsZWN0b3IocGFyYW1zLmJ1bGxldENsYXNzKSwgZnVuY3Rpb24gb25DbGljayhlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSAkJDEodGhpcykuaW5kZXgoKSAqIHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyR3JvdXA7XG4gICAgICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSBpbmRleCArPSBzd2lwZXIubG9vcGVkU2xpZGVzO1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG8oaW5kZXgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIucGFnaW5hdGlvbiwge1xuICAgICAgICAgICRlbCxcbiAgICAgICAgICBlbDogJGVsWzBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghc3dpcGVyLmVuYWJsZWQpIHtcbiAgICAgICAgICAkZWwuYWRkQ2xhc3MocGFyYW1zLmxvY2tDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uO1xuICAgICAgICBpZiAoaXNQYWdpbmF0aW9uRGlzYWJsZWQoKSkgcmV0dXJuO1xuICAgICAgICBjb25zdCAkZWwgPSBzd2lwZXIucGFnaW5hdGlvbi4kZWw7XG4gICAgICAgICRlbC5yZW1vdmVDbGFzcyhwYXJhbXMuaGlkZGVuQ2xhc3MpO1xuICAgICAgICAkZWwucmVtb3ZlQ2xhc3MocGFyYW1zLm1vZGlmaWVyQ2xhc3MgKyBwYXJhbXMudHlwZSk7XG4gICAgICAgICRlbC5yZW1vdmVDbGFzcyhzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyBwYXJhbXMuaG9yaXpvbnRhbENsYXNzIDogcGFyYW1zLnZlcnRpY2FsQ2xhc3MpO1xuICAgICAgICBpZiAoc3dpcGVyLnBhZ2luYXRpb24uYnVsbGV0cyAmJiBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzLnJlbW92ZUNsYXNzKSBzd2lwZXIucGFnaW5hdGlvbi5idWxsZXRzLnJlbW92ZUNsYXNzKHBhcmFtcy5idWxsZXRBY3RpdmVDbGFzcyk7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5jbGlja2FibGUpIHtcbiAgICAgICAgICAkZWwub2ZmKCdjbGljaycsIGNsYXNzZXNUb1NlbGVjdG9yKHBhcmFtcy5idWxsZXRDbGFzcykpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG9uKCdpbml0JywgKCkgPT4ge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmVuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgICAgICAgZGlzYWJsZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbignYWN0aXZlSW5kZXhDaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3dpcGVyLnNuYXBJbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbignc25hcEluZGV4Q2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9uKCdzbGlkZXNMZW5ndGhDaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmxvb3ApIHtcbiAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbignc25hcEdyaWRMZW5ndGhDaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb24oJ2Rlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIGRlc3Ryb3koKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ2VuYWJsZSBkaXNhYmxlJywgKCkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgJGVsXG4gICAgICAgIH0gPSBzd2lwZXIucGFnaW5hdGlvbjtcblxuICAgICAgICBpZiAoJGVsKSB7XG4gICAgICAgICAgJGVsW3N3aXBlci5lbmFibGVkID8gJ3JlbW92ZUNsYXNzJyA6ICdhZGRDbGFzcyddKHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5sb2NrQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9uKCdsb2NrIHVubG9jaycsICgpID0+IHtcbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICAgIG9uKCdjbGljaycsIChfcywgZSkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXRFbCA9IGUudGFyZ2V0O1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgJGVsXG4gICAgICAgIH0gPSBzd2lwZXIucGFnaW5hdGlvbjtcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmVsICYmIHN3aXBlci5wYXJhbXMucGFnaW5hdGlvbi5oaWRlT25DbGljayAmJiAkZWwgJiYgJGVsLmxlbmd0aCA+IDAgJiYgISQkMSh0YXJnZXRFbCkuaGFzQ2xhc3Moc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmJ1bGxldENsYXNzKSkge1xuICAgICAgICAgIGlmIChzd2lwZXIubmF2aWdhdGlvbiAmJiAoc3dpcGVyLm5hdmlnYXRpb24ubmV4dEVsICYmIHRhcmdldEVsID09PSBzd2lwZXIubmF2aWdhdGlvbi5uZXh0RWwgfHwgc3dpcGVyLm5hdmlnYXRpb24ucHJldkVsICYmIHRhcmdldEVsID09PSBzd2lwZXIubmF2aWdhdGlvbi5wcmV2RWwpKSByZXR1cm47XG4gICAgICAgICAgY29uc3QgaXNIaWRkZW4gPSAkZWwuaGFzQ2xhc3Moc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmhpZGRlbkNsYXNzKTtcblxuICAgICAgICAgIGlmIChpc0hpZGRlbiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgZW1pdCgncGFnaW5hdGlvblNob3cnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZW1pdCgncGFnaW5hdGlvbkhpZGUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkZWwudG9nZ2xlQ2xhc3Moc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLmhpZGRlbkNsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGVuYWJsZSA9ICgpID0+IHtcbiAgICAgICAgc3dpcGVyLiRlbC5yZW1vdmVDbGFzcyhzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24ucGFnaW5hdGlvbkRpc2FibGVkQ2xhc3MpO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFnaW5hdGlvbi4kZWwpIHtcbiAgICAgICAgICBzd2lwZXIucGFnaW5hdGlvbi4kZWwucmVtb3ZlQ2xhc3Moc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLnBhZ2luYXRpb25EaXNhYmxlZENsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluaXQoKTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgZGlzYWJsZSA9ICgpID0+IHtcbiAgICAgICAgc3dpcGVyLiRlbC5hZGRDbGFzcyhzd2lwZXIucGFyYW1zLnBhZ2luYXRpb24ucGFnaW5hdGlvbkRpc2FibGVkQ2xhc3MpO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFnaW5hdGlvbi4kZWwpIHtcbiAgICAgICAgICBzd2lwZXIucGFnaW5hdGlvbi4kZWwuYWRkQ2xhc3Moc3dpcGVyLnBhcmFtcy5wYWdpbmF0aW9uLnBhZ2luYXRpb25EaXNhYmxlZENsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlc3Ryb3koKTtcbiAgICAgIH07XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLnBhZ2luYXRpb24sIHtcbiAgICAgICAgZW5hYmxlLFxuICAgICAgICBkaXNhYmxlLFxuICAgICAgICByZW5kZXIsXG4gICAgICAgIHVwZGF0ZSxcbiAgICAgICAgaW5pdCxcbiAgICAgICAgZGVzdHJveVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gU2Nyb2xsYmFyKF9yZWYpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgZXh0ZW5kUGFyYW1zLFxuICAgICAgICBvbixcbiAgICAgICAgZW1pdFxuICAgICAgfSA9IF9yZWY7XG4gICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG4gICAgICBsZXQgaXNUb3VjaGVkID0gZmFsc2U7XG4gICAgICBsZXQgdGltZW91dCA9IG51bGw7XG4gICAgICBsZXQgZHJhZ1RpbWVvdXQgPSBudWxsO1xuICAgICAgbGV0IGRyYWdTdGFydFBvcztcbiAgICAgIGxldCBkcmFnU2l6ZTtcbiAgICAgIGxldCB0cmFja1NpemU7XG4gICAgICBsZXQgZGl2aWRlcjtcbiAgICAgIGV4dGVuZFBhcmFtcyh7XG4gICAgICAgIHNjcm9sbGJhcjoge1xuICAgICAgICAgIGVsOiBudWxsLFxuICAgICAgICAgIGRyYWdTaXplOiAnYXV0bycsXG4gICAgICAgICAgaGlkZTogZmFsc2UsXG4gICAgICAgICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICAgICAgICBzbmFwT25SZWxlYXNlOiB0cnVlLFxuICAgICAgICAgIGxvY2tDbGFzczogJ3N3aXBlci1zY3JvbGxiYXItbG9jaycsXG4gICAgICAgICAgZHJhZ0NsYXNzOiAnc3dpcGVyLXNjcm9sbGJhci1kcmFnJyxcbiAgICAgICAgICBzY3JvbGxiYXJEaXNhYmxlZENsYXNzOiAnc3dpcGVyLXNjcm9sbGJhci1kaXNhYmxlZCcsXG4gICAgICAgICAgaG9yaXpvbnRhbENsYXNzOiBgc3dpcGVyLXNjcm9sbGJhci1ob3Jpem9udGFsYCxcbiAgICAgICAgICB2ZXJ0aWNhbENsYXNzOiBgc3dpcGVyLXNjcm9sbGJhci12ZXJ0aWNhbGBcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzd2lwZXIuc2Nyb2xsYmFyID0ge1xuICAgICAgICBlbDogbnVsbCxcbiAgICAgICAgZHJhZ0VsOiBudWxsLFxuICAgICAgICAkZWw6IG51bGwsXG4gICAgICAgICRkcmFnRWw6IG51bGxcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIHNldFRyYW5zbGF0ZSgpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5lbCB8fCAhc3dpcGVyLnNjcm9sbGJhci5lbCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgc2Nyb2xsYmFyLFxuICAgICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsLFxuICAgICAgICAgIHByb2dyZXNzXG4gICAgICAgIH0gPSBzd2lwZXI7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAkZHJhZ0VsLFxuICAgICAgICAgICRlbFxuICAgICAgICB9ID0gc2Nyb2xsYmFyO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBzd2lwZXIucGFyYW1zLnNjcm9sbGJhcjtcbiAgICAgICAgbGV0IG5ld1NpemUgPSBkcmFnU2l6ZTtcbiAgICAgICAgbGV0IG5ld1BvcyA9ICh0cmFja1NpemUgLSBkcmFnU2l6ZSkgKiBwcm9ncmVzcztcblxuICAgICAgICBpZiAocnRsKSB7XG4gICAgICAgICAgbmV3UG9zID0gLW5ld1BvcztcblxuICAgICAgICAgIGlmIChuZXdQb3MgPiAwKSB7XG4gICAgICAgICAgICBuZXdTaXplID0gZHJhZ1NpemUgLSBuZXdQb3M7XG4gICAgICAgICAgICBuZXdQb3MgPSAwO1xuICAgICAgICAgIH0gZWxzZSBpZiAoLW5ld1BvcyArIGRyYWdTaXplID4gdHJhY2tTaXplKSB7XG4gICAgICAgICAgICBuZXdTaXplID0gdHJhY2tTaXplICsgbmV3UG9zO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChuZXdQb3MgPCAwKSB7XG4gICAgICAgICAgbmV3U2l6ZSA9IGRyYWdTaXplICsgbmV3UG9zO1xuICAgICAgICAgIG5ld1BvcyA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAobmV3UG9zICsgZHJhZ1NpemUgPiB0cmFja1NpemUpIHtcbiAgICAgICAgICBuZXdTaXplID0gdHJhY2tTaXplIC0gbmV3UG9zO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgICAgICRkcmFnRWwudHJhbnNmb3JtKGB0cmFuc2xhdGUzZCgke25ld1Bvc31weCwgMCwgMClgKTtcbiAgICAgICAgICAkZHJhZ0VsWzBdLnN0eWxlLndpZHRoID0gYCR7bmV3U2l6ZX1weGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGRyYWdFbC50cmFuc2Zvcm0oYHRyYW5zbGF0ZTNkKDBweCwgJHtuZXdQb3N9cHgsIDApYCk7XG4gICAgICAgICAgJGRyYWdFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtuZXdTaXplfXB4YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuaGlkZSkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAkZWxbMF0uc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgJGVsWzBdLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgICAgJGVsLnRyYW5zaXRpb24oNDAwKTtcbiAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRUcmFuc2l0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXIuZWwgfHwgIXN3aXBlci5zY3JvbGxiYXIuZWwpIHJldHVybjtcbiAgICAgICAgc3dpcGVyLnNjcm9sbGJhci4kZHJhZ0VsLnRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGRhdGVTaXplKCkge1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLmVsIHx8ICFzd2lwZXIuc2Nyb2xsYmFyLmVsKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBzY3JvbGxiYXJcbiAgICAgICAgfSA9IHN3aXBlcjtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICRkcmFnRWwsXG4gICAgICAgICAgJGVsXG4gICAgICAgIH0gPSBzY3JvbGxiYXI7XG4gICAgICAgICRkcmFnRWxbMF0uc3R5bGUud2lkdGggPSAnJztcbiAgICAgICAgJGRyYWdFbFswXS5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgdHJhY2tTaXplID0gc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJGVsWzBdLm9mZnNldFdpZHRoIDogJGVsWzBdLm9mZnNldEhlaWdodDtcbiAgICAgICAgZGl2aWRlciA9IHN3aXBlci5zaXplIC8gKHN3aXBlci52aXJ0dWFsU2l6ZSArIHN3aXBlci5wYXJhbXMuc2xpZGVzT2Zmc2V0QmVmb3JlIC0gKHN3aXBlci5wYXJhbXMuY2VudGVyZWRTbGlkZXMgPyBzd2lwZXIuc25hcEdyaWRbMF0gOiAwKSk7XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLmRyYWdTaXplID09PSAnYXV0bycpIHtcbiAgICAgICAgICBkcmFnU2l6ZSA9IHRyYWNrU2l6ZSAqIGRpdmlkZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZHJhZ1NpemUgPSBwYXJzZUludChzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5kcmFnU2l6ZSwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgICAgICRkcmFnRWxbMF0uc3R5bGUud2lkdGggPSBgJHtkcmFnU2l6ZX1weGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGRyYWdFbFswXS5zdHlsZS5oZWlnaHQgPSBgJHtkcmFnU2l6ZX1weGA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGl2aWRlciA+PSAxKSB7XG4gICAgICAgICAgJGVsWzBdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGVsWzBdLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5oaWRlKSB7XG4gICAgICAgICAgJGVsWzBdLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMud2F0Y2hPdmVyZmxvdyAmJiBzd2lwZXIuZW5hYmxlZCkge1xuICAgICAgICAgIHNjcm9sbGJhci4kZWxbc3dpcGVyLmlzTG9ja2VkID8gJ2FkZENsYXNzJyA6ICdyZW1vdmVDbGFzcyddKHN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLmxvY2tDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZ2V0UG9pbnRlclBvc2l0aW9uKGUpIHtcbiAgICAgICAgaWYgKHN3aXBlci5pc0hvcml6b250YWwoKSkge1xuICAgICAgICAgIHJldHVybiBlLnR5cGUgPT09ICd0b3VjaHN0YXJ0JyB8fCBlLnR5cGUgPT09ICd0b3VjaG1vdmUnID8gZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFggOiBlLmNsaWVudFg7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZS50eXBlID09PSAndG91Y2hzdGFydCcgfHwgZS50eXBlID09PSAndG91Y2htb3ZlJyA/IGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZIDogZS5jbGllbnRZO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXREcmFnUG9zaXRpb24oZSkge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgc2Nyb2xsYmFyLFxuICAgICAgICAgIHJ0bFRyYW5zbGF0ZTogcnRsXG4gICAgICAgIH0gPSBzd2lwZXI7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAkZWxcbiAgICAgICAgfSA9IHNjcm9sbGJhcjtcbiAgICAgICAgbGV0IHBvc2l0aW9uUmF0aW87XG4gICAgICAgIHBvc2l0aW9uUmF0aW8gPSAoZ2V0UG9pbnRlclBvc2l0aW9uKGUpIC0gJGVsLm9mZnNldCgpW3N3aXBlci5pc0hvcml6b250YWwoKSA/ICdsZWZ0JyA6ICd0b3AnXSAtIChkcmFnU3RhcnRQb3MgIT09IG51bGwgPyBkcmFnU3RhcnRQb3MgOiBkcmFnU2l6ZSAvIDIpKSAvICh0cmFja1NpemUgLSBkcmFnU2l6ZSk7XG4gICAgICAgIHBvc2l0aW9uUmF0aW8gPSBNYXRoLm1heChNYXRoLm1pbihwb3NpdGlvblJhdGlvLCAxKSwgMCk7XG5cbiAgICAgICAgaWYgKHJ0bCkge1xuICAgICAgICAgIHBvc2l0aW9uUmF0aW8gPSAxIC0gcG9zaXRpb25SYXRpbztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpICsgKHN3aXBlci5tYXhUcmFuc2xhdGUoKSAtIHN3aXBlci5taW5UcmFuc2xhdGUoKSkgKiBwb3NpdGlvblJhdGlvO1xuICAgICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MocG9zaXRpb24pO1xuICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKHBvc2l0aW9uKTtcbiAgICAgICAgc3dpcGVyLnVwZGF0ZUFjdGl2ZUluZGV4KCk7XG4gICAgICAgIHN3aXBlci51cGRhdGVTbGlkZXNDbGFzc2VzKCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KGUpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXI7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBzY3JvbGxiYXIsXG4gICAgICAgICAgJHdyYXBwZXJFbFxuICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgJGVsLFxuICAgICAgICAgICRkcmFnRWxcbiAgICAgICAgfSA9IHNjcm9sbGJhcjtcbiAgICAgICAgaXNUb3VjaGVkID0gdHJ1ZTtcbiAgICAgICAgZHJhZ1N0YXJ0UG9zID0gZS50YXJnZXQgPT09ICRkcmFnRWxbMF0gfHwgZS50YXJnZXQgPT09ICRkcmFnRWwgPyBnZXRQb2ludGVyUG9zaXRpb24oZSkgLSBlLnRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVtzd2lwZXIuaXNIb3Jpem9udGFsKCkgPyAnbGVmdCcgOiAndG9wJ10gOiBudWxsO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICR3cmFwcGVyRWwudHJhbnNpdGlvbigxMDApO1xuICAgICAgICAkZHJhZ0VsLnRyYW5zaXRpb24oMTAwKTtcbiAgICAgICAgc2V0RHJhZ1Bvc2l0aW9uKGUpO1xuICAgICAgICBjbGVhclRpbWVvdXQoZHJhZ1RpbWVvdXQpO1xuICAgICAgICAkZWwudHJhbnNpdGlvbigwKTtcblxuICAgICAgICBpZiAocGFyYW1zLmhpZGUpIHtcbiAgICAgICAgICAkZWwuY3NzKCdvcGFjaXR5JywgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5jc3NNb2RlKSB7XG4gICAgICAgICAgc3dpcGVyLiR3cmFwcGVyRWwuY3NzKCdzY3JvbGwtc25hcC10eXBlJywgJ25vbmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVtaXQoJ3Njcm9sbGJhckRyYWdTdGFydCcsIGUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvbkRyYWdNb3ZlKGUpIHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHNjcm9sbGJhcixcbiAgICAgICAgICAkd3JhcHBlckVsXG4gICAgICAgIH0gPSBzd2lwZXI7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAkZWwsXG4gICAgICAgICAgJGRyYWdFbFxuICAgICAgICB9ID0gc2Nyb2xsYmFyO1xuICAgICAgICBpZiAoIWlzVG91Y2hlZCkgcmV0dXJuO1xuICAgICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO2Vsc2UgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICBzZXREcmFnUG9zaXRpb24oZSk7XG4gICAgICAgICR3cmFwcGVyRWwudHJhbnNpdGlvbigwKTtcbiAgICAgICAgJGVsLnRyYW5zaXRpb24oMCk7XG4gICAgICAgICRkcmFnRWwudHJhbnNpdGlvbigwKTtcbiAgICAgICAgZW1pdCgnc2Nyb2xsYmFyRHJhZ01vdmUnLCBlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25EcmFnRW5kKGUpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXI7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBzY3JvbGxiYXIsXG4gICAgICAgICAgJHdyYXBwZXJFbFxuICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgJGVsXG4gICAgICAgIH0gPSBzY3JvbGxiYXI7XG4gICAgICAgIGlmICghaXNUb3VjaGVkKSByZXR1cm47XG4gICAgICAgIGlzVG91Y2hlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmNzc01vZGUpIHtcbiAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbC5jc3MoJ3Njcm9sbC1zbmFwLXR5cGUnLCAnJyk7XG4gICAgICAgICAgJHdyYXBwZXJFbC50cmFuc2l0aW9uKCcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJhbXMuaGlkZSkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChkcmFnVGltZW91dCk7XG4gICAgICAgICAgZHJhZ1RpbWVvdXQgPSBuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgICAkZWwuY3NzKCdvcGFjaXR5JywgMCk7XG4gICAgICAgICAgICAkZWwudHJhbnNpdGlvbig0MDApO1xuICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgZW1pdCgnc2Nyb2xsYmFyRHJhZ0VuZCcsIGUpO1xuXG4gICAgICAgIGlmIChwYXJhbXMuc25hcE9uUmVsZWFzZSkge1xuICAgICAgICAgIHN3aXBlci5zbGlkZVRvQ2xvc2VzdCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGV2ZW50cyhtZXRob2QpIHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHNjcm9sbGJhcixcbiAgICAgICAgICB0b3VjaEV2ZW50c1RvdWNoLFxuICAgICAgICAgIHRvdWNoRXZlbnRzRGVza3RvcCxcbiAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgc3VwcG9ydFxuICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICBjb25zdCAkZWwgPSBzY3JvbGxiYXIuJGVsO1xuICAgICAgICBpZiAoISRlbCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSAkZWxbMF07XG4gICAgICAgIGNvbnN0IGFjdGl2ZUxpc3RlbmVyID0gc3VwcG9ydC5wYXNzaXZlTGlzdGVuZXIgJiYgcGFyYW1zLnBhc3NpdmVMaXN0ZW5lcnMgPyB7XG4gICAgICAgICAgcGFzc2l2ZTogZmFsc2UsXG4gICAgICAgICAgY2FwdHVyZTogZmFsc2VcbiAgICAgICAgfSA6IGZhbHNlO1xuICAgICAgICBjb25zdCBwYXNzaXZlTGlzdGVuZXIgPSBzdXBwb3J0LnBhc3NpdmVMaXN0ZW5lciAmJiBwYXJhbXMucGFzc2l2ZUxpc3RlbmVycyA/IHtcbiAgICAgICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgICAgIGNhcHR1cmU6IGZhbHNlXG4gICAgICAgIH0gOiBmYWxzZTtcbiAgICAgICAgaWYgKCF0YXJnZXQpIHJldHVybjtcbiAgICAgICAgY29uc3QgZXZlbnRNZXRob2QgPSBtZXRob2QgPT09ICdvbicgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAncmVtb3ZlRXZlbnRMaXN0ZW5lcic7XG5cbiAgICAgICAgaWYgKCFzdXBwb3J0LnRvdWNoKSB7XG4gICAgICAgICAgdGFyZ2V0W2V2ZW50TWV0aG9kXSh0b3VjaEV2ZW50c0Rlc2t0b3Auc3RhcnQsIG9uRHJhZ1N0YXJ0LCBhY3RpdmVMaXN0ZW5lcik7XG4gICAgICAgICAgZG9jdW1lbnRbZXZlbnRNZXRob2RdKHRvdWNoRXZlbnRzRGVza3RvcC5tb3ZlLCBvbkRyYWdNb3ZlLCBhY3RpdmVMaXN0ZW5lcik7XG4gICAgICAgICAgZG9jdW1lbnRbZXZlbnRNZXRob2RdKHRvdWNoRXZlbnRzRGVza3RvcC5lbmQsIG9uRHJhZ0VuZCwgcGFzc2l2ZUxpc3RlbmVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRbZXZlbnRNZXRob2RdKHRvdWNoRXZlbnRzVG91Y2guc3RhcnQsIG9uRHJhZ1N0YXJ0LCBhY3RpdmVMaXN0ZW5lcik7XG4gICAgICAgICAgdGFyZ2V0W2V2ZW50TWV0aG9kXSh0b3VjaEV2ZW50c1RvdWNoLm1vdmUsIG9uRHJhZ01vdmUsIGFjdGl2ZUxpc3RlbmVyKTtcbiAgICAgICAgICB0YXJnZXRbZXZlbnRNZXRob2RdKHRvdWNoRXZlbnRzVG91Y2guZW5kLCBvbkRyYWdFbmQsIHBhc3NpdmVMaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZW5hYmxlRHJhZ2dhYmxlKCkge1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLmVsIHx8ICFzd2lwZXIuc2Nyb2xsYmFyLmVsKSByZXR1cm47XG4gICAgICAgIGV2ZW50cygnb24nKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZGlzYWJsZURyYWdnYWJsZSgpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5lbCB8fCAhc3dpcGVyLnNjcm9sbGJhci5lbCkgcmV0dXJuO1xuICAgICAgICBldmVudHMoJ29mZicpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgc2Nyb2xsYmFyLFxuICAgICAgICAgICRlbDogJHN3aXBlckVsXG4gICAgICAgIH0gPSBzd2lwZXI7XG4gICAgICAgIHN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyID0gY3JlYXRlRWxlbWVudElmTm90RGVmaW5lZChzd2lwZXIsIHN3aXBlci5vcmlnaW5hbFBhcmFtcy5zY3JvbGxiYXIsIHN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLCB7XG4gICAgICAgICAgZWw6ICdzd2lwZXItc2Nyb2xsYmFyJ1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXI7XG4gICAgICAgIGlmICghcGFyYW1zLmVsKSByZXR1cm47XG4gICAgICAgIGxldCAkZWwgPSAkJDEocGFyYW1zLmVsKTtcblxuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy51bmlxdWVOYXZFbGVtZW50cyAmJiB0eXBlb2YgcGFyYW1zLmVsID09PSAnc3RyaW5nJyAmJiAkZWwubGVuZ3RoID4gMSAmJiAkc3dpcGVyRWwuZmluZChwYXJhbXMuZWwpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICRlbCA9ICRzd2lwZXJFbC5maW5kKHBhcmFtcy5lbCk7XG4gICAgICAgIH1cblxuICAgICAgICAkZWwuYWRkQ2xhc3Moc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gcGFyYW1zLmhvcml6b250YWxDbGFzcyA6IHBhcmFtcy52ZXJ0aWNhbENsYXNzKTtcbiAgICAgICAgbGV0ICRkcmFnRWwgPSAkZWwuZmluZChgLiR7c3dpcGVyLnBhcmFtcy5zY3JvbGxiYXIuZHJhZ0NsYXNzfWApO1xuXG4gICAgICAgIGlmICgkZHJhZ0VsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICRkcmFnRWwgPSAkJDEoYDxkaXYgY2xhc3M9XCIke3N3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLmRyYWdDbGFzc31cIj48L2Rpdj5gKTtcbiAgICAgICAgICAkZWwuYXBwZW5kKCRkcmFnRWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihzY3JvbGxiYXIsIHtcbiAgICAgICAgICAkZWwsXG4gICAgICAgICAgZWw6ICRlbFswXSxcbiAgICAgICAgICAkZHJhZ0VsLFxuICAgICAgICAgIGRyYWdFbDogJGRyYWdFbFswXVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocGFyYW1zLmRyYWdnYWJsZSkge1xuICAgICAgICAgIGVuYWJsZURyYWdnYWJsZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRlbCkge1xuICAgICAgICAgICRlbFtzd2lwZXIuZW5hYmxlZCA/ICdyZW1vdmVDbGFzcycgOiAnYWRkQ2xhc3MnXShzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5sb2NrQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyO1xuICAgICAgICBjb25zdCAkZWwgPSBzd2lwZXIuc2Nyb2xsYmFyLiRlbDtcblxuICAgICAgICBpZiAoJGVsKSB7XG4gICAgICAgICAgJGVsLnJlbW92ZUNsYXNzKHN3aXBlci5pc0hvcml6b250YWwoKSA/IHBhcmFtcy5ob3Jpem9udGFsQ2xhc3MgOiBwYXJhbXMudmVydGljYWxDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBkaXNhYmxlRHJhZ2dhYmxlKCk7XG4gICAgICB9XG5cbiAgICAgIG9uKCdpbml0JywgKCkgPT4ge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5zY3JvbGxiYXIuZW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgICAgICBkaXNhYmxlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgIHVwZGF0ZVNpemUoKTtcbiAgICAgICAgICBzZXRUcmFuc2xhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbigndXBkYXRlIHJlc2l6ZSBvYnNlcnZlclVwZGF0ZSBsb2NrIHVubG9jaycsICgpID0+IHtcbiAgICAgICAgdXBkYXRlU2l6ZSgpO1xuICAgICAgfSk7XG4gICAgICBvbignc2V0VHJhbnNsYXRlJywgKCkgPT4ge1xuICAgICAgICBzZXRUcmFuc2xhdGUoKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ3NldFRyYW5zaXRpb24nLCAoX3MsIGR1cmF0aW9uKSA9PiB7XG4gICAgICAgIHNldFRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgICAgfSk7XG4gICAgICBvbignZW5hYmxlIGRpc2FibGUnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAkZWxcbiAgICAgICAgfSA9IHN3aXBlci5zY3JvbGxiYXI7XG5cbiAgICAgICAgaWYgKCRlbCkge1xuICAgICAgICAgICRlbFtzd2lwZXIuZW5hYmxlZCA/ICdyZW1vdmVDbGFzcycgOiAnYWRkQ2xhc3MnXShzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5sb2NrQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9uKCdkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICBkZXN0cm95KCk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZW5hYmxlID0gKCkgPT4ge1xuICAgICAgICBzd2lwZXIuJGVsLnJlbW92ZUNsYXNzKHN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLnNjcm9sbGJhckRpc2FibGVkQ2xhc3MpO1xuXG4gICAgICAgIGlmIChzd2lwZXIuc2Nyb2xsYmFyLiRlbCkge1xuICAgICAgICAgIHN3aXBlci5zY3JvbGxiYXIuJGVsLnJlbW92ZUNsYXNzKHN3aXBlci5wYXJhbXMuc2Nyb2xsYmFyLnNjcm9sbGJhckRpc2FibGVkQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5pdCgpO1xuICAgICAgICB1cGRhdGVTaXplKCk7XG4gICAgICAgIHNldFRyYW5zbGF0ZSgpO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgZGlzYWJsZSA9ICgpID0+IHtcbiAgICAgICAgc3dpcGVyLiRlbC5hZGRDbGFzcyhzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5zY3JvbGxiYXJEaXNhYmxlZENsYXNzKTtcblxuICAgICAgICBpZiAoc3dpcGVyLnNjcm9sbGJhci4kZWwpIHtcbiAgICAgICAgICBzd2lwZXIuc2Nyb2xsYmFyLiRlbC5hZGRDbGFzcyhzd2lwZXIucGFyYW1zLnNjcm9sbGJhci5zY3JvbGxiYXJEaXNhYmxlZENsYXNzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlc3Ryb3koKTtcbiAgICAgIH07XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLnNjcm9sbGJhciwge1xuICAgICAgICBlbmFibGUsXG4gICAgICAgIGRpc2FibGUsXG4gICAgICAgIHVwZGF0ZVNpemUsXG4gICAgICAgIHNldFRyYW5zbGF0ZSxcbiAgICAgICAgaW5pdCxcbiAgICAgICAgZGVzdHJveVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gUGFyYWxsYXgoX3JlZikge1xuICAgICAgbGV0IHtcbiAgICAgICAgc3dpcGVyLFxuICAgICAgICBleHRlbmRQYXJhbXMsXG4gICAgICAgIG9uXG4gICAgICB9ID0gX3JlZjtcbiAgICAgIGV4dGVuZFBhcmFtcyh7XG4gICAgICAgIHBhcmFsbGF4OiB7XG4gICAgICAgICAgZW5hYmxlZDogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHNldFRyYW5zZm9ybSA9IChlbCwgcHJvZ3Jlc3MpID0+IHtcbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgIHJ0bFxuICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICBjb25zdCAkZWwgPSAkJDEoZWwpO1xuICAgICAgICBjb25zdCBydGxGYWN0b3IgPSBydGwgPyAtMSA6IDE7XG4gICAgICAgIGNvbnN0IHAgPSAkZWwuYXR0cignZGF0YS1zd2lwZXItcGFyYWxsYXgnKSB8fCAnMCc7XG4gICAgICAgIGxldCB4ID0gJGVsLmF0dHIoJ2RhdGEtc3dpcGVyLXBhcmFsbGF4LXgnKTtcbiAgICAgICAgbGV0IHkgPSAkZWwuYXR0cignZGF0YS1zd2lwZXItcGFyYWxsYXgteScpO1xuICAgICAgICBjb25zdCBzY2FsZSA9ICRlbC5hdHRyKCdkYXRhLXN3aXBlci1wYXJhbGxheC1zY2FsZScpO1xuICAgICAgICBjb25zdCBvcGFjaXR5ID0gJGVsLmF0dHIoJ2RhdGEtc3dpcGVyLXBhcmFsbGF4LW9wYWNpdHknKTtcblxuICAgICAgICBpZiAoeCB8fCB5KSB7XG4gICAgICAgICAgeCA9IHggfHwgJzAnO1xuICAgICAgICAgIHkgPSB5IHx8ICcwJztcbiAgICAgICAgfSBlbHNlIGlmIChzd2lwZXIuaXNIb3Jpem9udGFsKCkpIHtcbiAgICAgICAgICB4ID0gcDtcbiAgICAgICAgICB5ID0gJzAnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHkgPSBwO1xuICAgICAgICAgIHggPSAnMCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoeC5pbmRleE9mKCclJykgPj0gMCkge1xuICAgICAgICAgIHggPSBgJHtwYXJzZUludCh4LCAxMCkgKiBwcm9ncmVzcyAqIHJ0bEZhY3Rvcn0lYDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4ID0gYCR7eCAqIHByb2dyZXNzICogcnRsRmFjdG9yfXB4YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh5LmluZGV4T2YoJyUnKSA+PSAwKSB7XG4gICAgICAgICAgeSA9IGAke3BhcnNlSW50KHksIDEwKSAqIHByb2dyZXNzfSVgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHkgPSBgJHt5ICogcHJvZ3Jlc3N9cHhgO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvcGFjaXR5ICE9PSAndW5kZWZpbmVkJyAmJiBvcGFjaXR5ICE9PSBudWxsKSB7XG4gICAgICAgICAgY29uc3QgY3VycmVudE9wYWNpdHkgPSBvcGFjaXR5IC0gKG9wYWNpdHkgLSAxKSAqICgxIC0gTWF0aC5hYnMocHJvZ3Jlc3MpKTtcbiAgICAgICAgICAkZWxbMF0uc3R5bGUub3BhY2l0eSA9IGN1cnJlbnRPcGFjaXR5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzY2FsZSA9PT0gJ3VuZGVmaW5lZCcgfHwgc2NhbGUgPT09IG51bGwpIHtcbiAgICAgICAgICAkZWwudHJhbnNmb3JtKGB0cmFuc2xhdGUzZCgke3h9LCAke3l9LCAwcHgpYCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgY3VycmVudFNjYWxlID0gc2NhbGUgLSAoc2NhbGUgLSAxKSAqICgxIC0gTWF0aC5hYnMocHJvZ3Jlc3MpKTtcbiAgICAgICAgICAkZWwudHJhbnNmb3JtKGB0cmFuc2xhdGUzZCgke3h9LCAke3l9LCAwcHgpIHNjYWxlKCR7Y3VycmVudFNjYWxlfSlgKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3Qgc2V0VHJhbnNsYXRlID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgJGVsLFxuICAgICAgICAgIHNsaWRlcyxcbiAgICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgICBzbmFwR3JpZFxuICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICAkZWwuY2hpbGRyZW4oJ1tkYXRhLXN3aXBlci1wYXJhbGxheF0sIFtkYXRhLXN3aXBlci1wYXJhbGxheC14XSwgW2RhdGEtc3dpcGVyLXBhcmFsbGF4LXldLCBbZGF0YS1zd2lwZXItcGFyYWxsYXgtb3BhY2l0eV0sIFtkYXRhLXN3aXBlci1wYXJhbGxheC1zY2FsZV0nKS5lYWNoKGVsID0+IHtcbiAgICAgICAgICBzZXRUcmFuc2Zvcm0oZWwsIHByb2dyZXNzKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNsaWRlcy5lYWNoKChzbGlkZUVsLCBzbGlkZUluZGV4KSA9PiB7XG4gICAgICAgICAgbGV0IHNsaWRlUHJvZ3Jlc3MgPSBzbGlkZUVsLnByb2dyZXNzO1xuXG4gICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyR3JvdXAgPiAxICYmIHN3aXBlci5wYXJhbXMuc2xpZGVzUGVyVmlldyAhPT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICBzbGlkZVByb2dyZXNzICs9IE1hdGguY2VpbChzbGlkZUluZGV4IC8gMikgLSBwcm9ncmVzcyAqIChzbmFwR3JpZC5sZW5ndGggLSAxKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzbGlkZVByb2dyZXNzID0gTWF0aC5taW4oTWF0aC5tYXgoc2xpZGVQcm9ncmVzcywgLTEpLCAxKTtcbiAgICAgICAgICAkJDEoc2xpZGVFbCkuZmluZCgnW2RhdGEtc3dpcGVyLXBhcmFsbGF4XSwgW2RhdGEtc3dpcGVyLXBhcmFsbGF4LXhdLCBbZGF0YS1zd2lwZXItcGFyYWxsYXgteV0sIFtkYXRhLXN3aXBlci1wYXJhbGxheC1vcGFjaXR5XSwgW2RhdGEtc3dpcGVyLXBhcmFsbGF4LXNjYWxlXScpLmVhY2goZWwgPT4ge1xuICAgICAgICAgICAgc2V0VHJhbnNmb3JtKGVsLCBzbGlkZVByb2dyZXNzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBzZXRUcmFuc2l0aW9uID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XG4gICAgICAgIGlmIChkdXJhdGlvbiA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgZHVyYXRpb24gPSBzd2lwZXIucGFyYW1zLnNwZWVkO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qge1xuICAgICAgICAgICRlbFxuICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICAkZWwuZmluZCgnW2RhdGEtc3dpcGVyLXBhcmFsbGF4XSwgW2RhdGEtc3dpcGVyLXBhcmFsbGF4LXhdLCBbZGF0YS1zd2lwZXItcGFyYWxsYXgteV0sIFtkYXRhLXN3aXBlci1wYXJhbGxheC1vcGFjaXR5XSwgW2RhdGEtc3dpcGVyLXBhcmFsbGF4LXNjYWxlXScpLmVhY2gocGFyYWxsYXhFbCA9PiB7XG4gICAgICAgICAgY29uc3QgJHBhcmFsbGF4RWwgPSAkJDEocGFyYWxsYXhFbCk7XG4gICAgICAgICAgbGV0IHBhcmFsbGF4RHVyYXRpb24gPSBwYXJzZUludCgkcGFyYWxsYXhFbC5hdHRyKCdkYXRhLXN3aXBlci1wYXJhbGxheC1kdXJhdGlvbicpLCAxMCkgfHwgZHVyYXRpb247XG4gICAgICAgICAgaWYgKGR1cmF0aW9uID09PSAwKSBwYXJhbGxheER1cmF0aW9uID0gMDtcbiAgICAgICAgICAkcGFyYWxsYXhFbC50cmFuc2l0aW9uKHBhcmFsbGF4RHVyYXRpb24pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIG9uKCdiZWZvcmVJbml0JywgKCkgPT4ge1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMucGFyYWxsYXguZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBzd2lwZXIucGFyYW1zLndhdGNoU2xpZGVzUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICBzd2lwZXIub3JpZ2luYWxQYXJhbXMud2F0Y2hTbGlkZXNQcm9ncmVzcyA9IHRydWU7XG4gICAgICB9KTtcbiAgICAgIG9uKCdpbml0JywgKCkgPT4ge1xuICAgICAgICBpZiAoIXN3aXBlci5wYXJhbXMucGFyYWxsYXguZW5hYmxlZCkgcmV0dXJuO1xuICAgICAgICBzZXRUcmFuc2xhdGUoKTtcbiAgICAgIH0pO1xuICAgICAgb24oJ3NldFRyYW5zbGF0ZScsICgpID0+IHtcbiAgICAgICAgaWYgKCFzd2lwZXIucGFyYW1zLnBhcmFsbGF4LmVuYWJsZWQpIHJldHVybjtcbiAgICAgICAgc2V0VHJhbnNsYXRlKCk7XG4gICAgICB9KTtcbiAgICAgIG9uKCdzZXRUcmFuc2l0aW9uJywgKF9zd2lwZXIsIGR1cmF0aW9uKSA9PiB7XG4gICAgICAgIGlmICghc3dpcGVyLnBhcmFtcy5wYXJhbGxheC5lbmFibGVkKSByZXR1cm47XG4gICAgICAgIHNldFRyYW5zaXRpb24oZHVyYXRpb24pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyogZXNsaW50IG5vLXVuZGVyc2NvcmUtZGFuZ2xlOiBcIm9mZlwiICovXG4gICAgZnVuY3Rpb24gQXV0b3BsYXkoX3JlZikge1xuICAgICAgbGV0IHtcbiAgICAgICAgc3dpcGVyLFxuICAgICAgICBleHRlbmRQYXJhbXMsXG4gICAgICAgIG9uLFxuICAgICAgICBlbWl0XG4gICAgICB9ID0gX3JlZjtcbiAgICAgIGxldCB0aW1lb3V0O1xuICAgICAgc3dpcGVyLmF1dG9wbGF5ID0ge1xuICAgICAgICBydW5uaW5nOiBmYWxzZSxcbiAgICAgICAgcGF1c2VkOiBmYWxzZVxuICAgICAgfTtcbiAgICAgIGV4dGVuZFBhcmFtcyh7XG4gICAgICAgIGF1dG9wbGF5OiB7XG4gICAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgZGVsYXk6IDMwMDAsXG4gICAgICAgICAgd2FpdEZvclRyYW5zaXRpb246IHRydWUsXG4gICAgICAgICAgZGlzYWJsZU9uSW50ZXJhY3Rpb246IHRydWUsXG4gICAgICAgICAgc3RvcE9uTGFzdFNsaWRlOiBmYWxzZSxcbiAgICAgICAgICByZXZlcnNlRGlyZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICBwYXVzZU9uTW91c2VFbnRlcjogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHJ1bigpIHtcbiAgICAgICAgaWYgKCFzd2lwZXIuc2l6ZSkge1xuICAgICAgICAgIHN3aXBlci5hdXRvcGxheS5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0ICRhY3RpdmVTbGlkZUVsID0gc3dpcGVyLnNsaWRlcy5lcShzd2lwZXIuYWN0aXZlSW5kZXgpO1xuICAgICAgICBsZXQgZGVsYXkgPSBzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmRlbGF5O1xuXG4gICAgICAgIGlmICgkYWN0aXZlU2xpZGVFbC5hdHRyKCdkYXRhLXN3aXBlci1hdXRvcGxheScpKSB7XG4gICAgICAgICAgZGVsYXkgPSAkYWN0aXZlU2xpZGVFbC5hdHRyKCdkYXRhLXN3aXBlci1hdXRvcGxheScpIHx8IHN3aXBlci5wYXJhbXMuYXV0b3BsYXkuZGVsYXk7XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgbGV0IGF1dG9wbGF5UmVzdWx0O1xuXG4gICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYXV0b3BsYXkucmV2ZXJzZURpcmVjdGlvbikge1xuICAgICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMubG9vcCkge1xuICAgICAgICAgICAgICBzd2lwZXIubG9vcEZpeCgpO1xuICAgICAgICAgICAgICBhdXRvcGxheVJlc3VsdCA9IHN3aXBlci5zbGlkZVByZXYoc3dpcGVyLnBhcmFtcy5zcGVlZCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgIGVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFzd2lwZXIuaXNCZWdpbm5pbmcpIHtcbiAgICAgICAgICAgICAgYXV0b3BsYXlSZXN1bHQgPSBzd2lwZXIuc2xpZGVQcmV2KHN3aXBlci5wYXJhbXMuc3BlZWQsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgICBlbWl0KCdhdXRvcGxheScpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghc3dpcGVyLnBhcmFtcy5hdXRvcGxheS5zdG9wT25MYXN0U2xpZGUpIHtcbiAgICAgICAgICAgICAgYXV0b3BsYXlSZXN1bHQgPSBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuc2xpZGVzLmxlbmd0aCAtIDEsIHN3aXBlci5wYXJhbXMuc3BlZWQsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgICBlbWl0KCdhdXRvcGxheScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoc3dpcGVyLnBhcmFtcy5sb29wKSB7XG4gICAgICAgICAgICBzd2lwZXIubG9vcEZpeCgpO1xuICAgICAgICAgICAgYXV0b3BsYXlSZXN1bHQgPSBzd2lwZXIuc2xpZGVOZXh0KHN3aXBlci5wYXJhbXMuc3BlZWQsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgZW1pdCgnYXV0b3BsYXknKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCFzd2lwZXIuaXNFbmQpIHtcbiAgICAgICAgICAgIGF1dG9wbGF5UmVzdWx0ID0gc3dpcGVyLnNsaWRlTmV4dChzd2lwZXIucGFyYW1zLnNwZWVkLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIGVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICAgICAgfSBlbHNlIGlmICghc3dpcGVyLnBhcmFtcy5hdXRvcGxheS5zdG9wT25MYXN0U2xpZGUpIHtcbiAgICAgICAgICAgIGF1dG9wbGF5UmVzdWx0ID0gc3dpcGVyLnNsaWRlVG8oMCwgc3dpcGVyLnBhcmFtcy5zcGVlZCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBlbWl0KCdhdXRvcGxheScpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuY3NzTW9kZSAmJiBzd2lwZXIuYXV0b3BsYXkucnVubmluZykgcnVuKCk7ZWxzZSBpZiAoYXV0b3BsYXlSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBydW4oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdGltZW91dCAhPT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHN3aXBlci5hdXRvcGxheS5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgZW1pdCgnYXV0b3BsYXlTdGFydCcpO1xuICAgICAgICBydW4oKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgIGlmICghc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lb3V0ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHRpbWVvdXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuYXV0b3BsYXkucnVubmluZyA9IGZhbHNlO1xuICAgICAgICBlbWl0KCdhdXRvcGxheVN0b3AnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBhdXNlKHNwZWVkKSB7XG4gICAgICAgIGlmICghc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcpIHJldHVybjtcbiAgICAgICAgaWYgKHN3aXBlci5hdXRvcGxheS5wYXVzZWQpIHJldHVybjtcbiAgICAgICAgaWYgKHRpbWVvdXQpIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKHNwZWVkID09PSAwIHx8ICFzd2lwZXIucGFyYW1zLmF1dG9wbGF5LndhaXRGb3JUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgIHJ1bigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFsndHJhbnNpdGlvbmVuZCcsICd3ZWJraXRUcmFuc2l0aW9uRW5kJ10uZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBvblRyYW5zaXRpb25FbmQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uVmlzaWJpbGl0eUNoYW5nZSgpIHtcbiAgICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuXG4gICAgICAgIGlmIChkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICdoaWRkZW4nICYmIHN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSB7XG4gICAgICAgICAgcGF1c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICd2aXNpYmxlJyAmJiBzd2lwZXIuYXV0b3BsYXkucGF1c2VkKSB7XG4gICAgICAgICAgcnVuKCk7XG4gICAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uVHJhbnNpdGlvbkVuZChlKSB7XG4gICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQgfHwgIXN3aXBlci4kd3JhcHBlckVsKSByZXR1cm47XG4gICAgICAgIGlmIChlLnRhcmdldCAhPT0gc3dpcGVyLiR3cmFwcGVyRWxbMF0pIHJldHVybjtcbiAgICAgICAgWyd0cmFuc2l0aW9uZW5kJywgJ3dlYmtpdFRyYW5zaXRpb25FbmQnXS5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgICBzd2lwZXIuJHdyYXBwZXJFbFswXS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBvblRyYW5zaXRpb25FbmQpO1xuICAgICAgICB9KTtcbiAgICAgICAgc3dpcGVyLmF1dG9wbGF5LnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghc3dpcGVyLmF1dG9wbGF5LnJ1bm5pbmcpIHtcbiAgICAgICAgICBzdG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcnVuKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25Nb3VzZUVudGVyKCkge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5hdXRvcGxheS5kaXNhYmxlT25JbnRlcmFjdGlvbikge1xuICAgICAgICAgIHN0b3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbWl0KCdhdXRvcGxheVBhdXNlJyk7XG4gICAgICAgICAgcGF1c2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFsndHJhbnNpdGlvbmVuZCcsICd3ZWJraXRUcmFuc2l0aW9uRW5kJ10uZm9yRWFjaChldmVudCA9PiB7XG4gICAgICAgICAgc3dpcGVyLiR3cmFwcGVyRWxbMF0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgb25UcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uTW91c2VMZWF2ZSgpIHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYXV0b3BsYXkuZGlzYWJsZU9uSW50ZXJhY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzd2lwZXIuYXV0b3BsYXkucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIGVtaXQoJ2F1dG9wbGF5UmVzdW1lJyk7XG4gICAgICAgIHJ1bigpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBhdHRhY2hNb3VzZUV2ZW50cygpIHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuYXV0b3BsYXkucGF1c2VPbk1vdXNlRW50ZXIpIHtcbiAgICAgICAgICBzd2lwZXIuJGVsLm9uKCdtb3VzZWVudGVyJywgb25Nb3VzZUVudGVyKTtcbiAgICAgICAgICBzd2lwZXIuJGVsLm9uKCdtb3VzZWxlYXZlJywgb25Nb3VzZUxlYXZlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBkZXRhY2hNb3VzZUV2ZW50cygpIHtcbiAgICAgICAgc3dpcGVyLiRlbC5vZmYoJ21vdXNlZW50ZXInLCBvbk1vdXNlRW50ZXIpO1xuICAgICAgICBzd2lwZXIuJGVsLm9mZignbW91c2VsZWF2ZScsIG9uTW91c2VMZWF2ZSk7XG4gICAgICB9XG5cbiAgICAgIG9uKCdpbml0JywgKCkgPT4ge1xuICAgICAgICBpZiAoc3dpcGVyLnBhcmFtcy5hdXRvcGxheS5lbmFibGVkKSB7XG4gICAgICAgICAgc3RhcnQoKTtcbiAgICAgICAgICBjb25zdCBkb2N1bWVudCA9IGdldERvY3VtZW50KCk7XG4gICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIG9uVmlzaWJpbGl0eUNoYW5nZSk7XG4gICAgICAgICAgYXR0YWNoTW91c2VFdmVudHMoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvbignYmVmb3JlVHJhbnNpdGlvblN0YXJ0JywgKF9zLCBzcGVlZCwgaW50ZXJuYWwpID0+IHtcbiAgICAgICAgaWYgKHN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSB7XG4gICAgICAgICAgaWYgKGludGVybmFsIHx8ICFzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmRpc2FibGVPbkludGVyYWN0aW9uKSB7XG4gICAgICAgICAgICBzd2lwZXIuYXV0b3BsYXkucGF1c2Uoc3BlZWQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9uKCdzbGlkZXJGaXJzdE1vdmUnLCAoKSA9PiB7XG4gICAgICAgIGlmIChzd2lwZXIuYXV0b3BsYXkucnVubmluZykge1xuICAgICAgICAgIGlmIChzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmRpc2FibGVPbkludGVyYWN0aW9uKSB7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhdXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9uKCd0b3VjaEVuZCcsICgpID0+IHtcbiAgICAgICAgaWYgKHN3aXBlci5wYXJhbXMuY3NzTW9kZSAmJiBzd2lwZXIuYXV0b3BsYXkucGF1c2VkICYmICFzd2lwZXIucGFyYW1zLmF1dG9wbGF5LmRpc2FibGVPbkludGVyYWN0aW9uKSB7XG4gICAgICAgICAgcnVuKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb24oJ2Rlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIGRldGFjaE1vdXNlRXZlbnRzKCk7XG5cbiAgICAgICAgaWYgKHN3aXBlci5hdXRvcGxheS5ydW5uaW5nKSB7XG4gICAgICAgICAgc3RvcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudCgpO1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgb25WaXNpYmlsaXR5Q2hhbmdlKTtcbiAgICAgIH0pO1xuICAgICAgT2JqZWN0LmFzc2lnbihzd2lwZXIuYXV0b3BsYXksIHtcbiAgICAgICAgcGF1c2UsXG4gICAgICAgIHJ1bixcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIHN0b3BcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZyZWVNb2RlKF9yZWYpIHtcbiAgICAgIGxldCB7XG4gICAgICAgIHN3aXBlcixcbiAgICAgICAgZXh0ZW5kUGFyYW1zLFxuICAgICAgICBlbWl0LFxuICAgICAgICBvbmNlXG4gICAgICB9ID0gX3JlZjtcbiAgICAgIGV4dGVuZFBhcmFtcyh7XG4gICAgICAgIGZyZWVNb2RlOiB7XG4gICAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgbW9tZW50dW06IHRydWUsXG4gICAgICAgICAgbW9tZW50dW1SYXRpbzogMSxcbiAgICAgICAgICBtb21lbnR1bUJvdW5jZTogdHJ1ZSxcbiAgICAgICAgICBtb21lbnR1bUJvdW5jZVJhdGlvOiAxLFxuICAgICAgICAgIG1vbWVudHVtVmVsb2NpdHlSYXRpbzogMSxcbiAgICAgICAgICBzdGlja3k6IGZhbHNlLFxuICAgICAgICAgIG1pbmltdW1WZWxvY2l0eTogMC4wMlxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KCkge1xuICAgICAgICBjb25zdCB0cmFuc2xhdGUgPSBzd2lwZXIuZ2V0VHJhbnNsYXRlKCk7XG4gICAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUodHJhbnNsYXRlKTtcbiAgICAgICAgc3dpcGVyLnNldFRyYW5zaXRpb24oMCk7XG4gICAgICAgIHN3aXBlci50b3VjaEV2ZW50c0RhdGEudmVsb2NpdGllcy5sZW5ndGggPSAwO1xuICAgICAgICBzd2lwZXIuZnJlZU1vZGUub25Ub3VjaEVuZCh7XG4gICAgICAgICAgY3VycmVudFBvczogc3dpcGVyLnJ0bCA/IHN3aXBlci50cmFuc2xhdGUgOiAtc3dpcGVyLnRyYW5zbGF0ZVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25Ub3VjaE1vdmUoKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICB0b3VjaEV2ZW50c0RhdGE6IGRhdGEsXG4gICAgICAgICAgdG91Y2hlc1xuICAgICAgICB9ID0gc3dpcGVyOyAvLyBWZWxvY2l0eVxuXG4gICAgICAgIGlmIChkYXRhLnZlbG9jaXRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgZGF0YS52ZWxvY2l0aWVzLnB1c2goe1xuICAgICAgICAgICAgcG9zaXRpb246IHRvdWNoZXNbc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJ3N0YXJ0WCcgOiAnc3RhcnRZJ10sXG4gICAgICAgICAgICB0aW1lOiBkYXRhLnRvdWNoU3RhcnRUaW1lXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLnZlbG9jaXRpZXMucHVzaCh7XG4gICAgICAgICAgcG9zaXRpb246IHRvdWNoZXNbc3dpcGVyLmlzSG9yaXpvbnRhbCgpID8gJ2N1cnJlbnRYJyA6ICdjdXJyZW50WSddLFxuICAgICAgICAgIHRpbWU6IG5vdygpXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblRvdWNoRW5kKF9yZWYyKSB7XG4gICAgICAgIGxldCB7XG4gICAgICAgICAgY3VycmVudFBvc1xuICAgICAgICB9ID0gX3JlZjI7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBwYXJhbXMsXG4gICAgICAgICAgJHdyYXBwZXJFbCxcbiAgICAgICAgICBydGxUcmFuc2xhdGU6IHJ0bCxcbiAgICAgICAgICBzbmFwR3JpZCxcbiAgICAgICAgICB0b3VjaEV2ZW50c0RhdGE6IGRhdGFcbiAgICAgICAgfSA9IHN3aXBlcjsgLy8gVGltZSBkaWZmXG5cbiAgICAgICAgY29uc3QgdG91Y2hFbmRUaW1lID0gbm93KCk7XG4gICAgICAgIGNvbnN0IHRpbWVEaWZmID0gdG91Y2hFbmRUaW1lIC0gZGF0YS50b3VjaFN0YXJ0VGltZTtcblxuICAgICAgICBpZiAoY3VycmVudFBvcyA8IC1zd2lwZXIubWluVHJhbnNsYXRlKCkpIHtcbiAgICAgICAgICBzd2lwZXIuc2xpZGVUbyhzd2lwZXIuYWN0aXZlSW5kZXgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjdXJyZW50UG9zID4gLXN3aXBlci5tYXhUcmFuc2xhdGUoKSkge1xuICAgICAgICAgIGlmIChzd2lwZXIuc2xpZGVzLmxlbmd0aCA8IHNuYXBHcmlkLmxlbmd0aCkge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG8oc25hcEdyaWQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3aXBlci5zbGlkZVRvKHN3aXBlci5zbGlkZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmFtcy5mcmVlTW9kZS5tb21lbnR1bSkge1xuICAgICAgICAgIGlmIChkYXRhLnZlbG9jaXRpZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgY29uc3QgbGFzdE1vdmVFdmVudCA9IGRhdGEudmVsb2NpdGllcy5wb3AoKTtcbiAgICAgICAgICAgIGNvbnN0IHZlbG9jaXR5RXZlbnQgPSBkYXRhLnZlbG9jaXRpZXMucG9wKCk7XG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IGxhc3RNb3ZlRXZlbnQucG9zaXRpb24gLSB2ZWxvY2l0eUV2ZW50LnBvc2l0aW9uO1xuICAgICAgICAgICAgY29uc3QgdGltZSA9IGxhc3RNb3ZlRXZlbnQudGltZSAtIHZlbG9jaXR5RXZlbnQudGltZTtcbiAgICAgICAgICAgIHN3aXBlci52ZWxvY2l0eSA9IGRpc3RhbmNlIC8gdGltZTtcbiAgICAgICAgICAgIHN3aXBlci52ZWxvY2l0eSAvPSAyO1xuXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoc3dpcGVyLnZlbG9jaXR5KSA8IHBhcmFtcy5mcmVlTW9kZS5taW5pbXVtVmVsb2NpdHkpIHtcbiAgICAgICAgICAgICAgc3dpcGVyLnZlbG9jaXR5ID0gMDtcbiAgICAgICAgICAgIH0gLy8gdGhpcyBpbXBsaWVzIHRoYXQgdGhlIHVzZXIgc3RvcHBlZCBtb3ZpbmcgYSBmaW5nZXIgdGhlbiByZWxlYXNlZC5cbiAgICAgICAgICAgIC8vIFRoZXJlIHdvdWxkIGJlIG5vIGV2ZW50cyB3aXRoIGRpc3RhbmNlIHplcm8sIHNvIHRoZSBsYXN0IGV2ZW50IGlzIHN0YWxlLlxuXG5cbiAgICAgICAgICAgIGlmICh0aW1lID4gMTUwIHx8IG5vdygpIC0gbGFzdE1vdmVFdmVudC50aW1lID4gMzAwKSB7XG4gICAgICAgICAgICAgIHN3aXBlci52ZWxvY2l0eSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3aXBlci52ZWxvY2l0eSA9IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3dpcGVyLnZlbG9jaXR5ICo9IHBhcmFtcy5mcmVlTW9kZS5tb21lbnR1bVZlbG9jaXR5UmF0aW87XG4gICAgICAgICAgZGF0YS52ZWxvY2l0aWVzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgbGV0IG1vbWVudHVtRHVyYXRpb24gPSAxMDAwICogcGFyYW1zLmZyZWVNb2RlLm1vbWVudHVtUmF0aW87XG4gICAgICAgICAgY29uc3QgbW9tZW50dW1EaXN0YW5jZSA9IHN3aXBlci52ZWxvY2l0eSAqIG1vbWVudHVtRHVyYXRpb247XG4gICAgICAgICAgbGV0IG5ld1Bvc2l0aW9uID0gc3dpcGVyLnRyYW5zbGF0ZSArIG1vbWVudHVtRGlzdGFuY2U7XG4gICAgICAgICAgaWYgKHJ0bCkgbmV3UG9zaXRpb24gPSAtbmV3UG9zaXRpb247XG4gICAgICAgICAgbGV0IGRvQm91bmNlID0gZmFsc2U7XG4gICAgICAgICAgbGV0IGFmdGVyQm91bmNlUG9zaXRpb247XG4gICAgICAgICAgY29uc3QgYm91bmNlQW1vdW50ID0gTWF0aC5hYnMoc3dpcGVyLnZlbG9jaXR5KSAqIDIwICogcGFyYW1zLmZyZWVNb2RlLm1vbWVudHVtQm91bmNlUmF0aW87XG4gICAgICAgICAgbGV0IG5lZWRzTG9vcEZpeDtcblxuICAgICAgICAgIGlmIChuZXdQb3NpdGlvbiA8IHN3aXBlci5tYXhUcmFuc2xhdGUoKSkge1xuICAgICAgICAgICAgaWYgKHBhcmFtcy5mcmVlTW9kZS5tb21lbnR1bUJvdW5jZSkge1xuICAgICAgICAgICAgICBpZiAobmV3UG9zaXRpb24gKyBzd2lwZXIubWF4VHJhbnNsYXRlKCkgPCAtYm91bmNlQW1vdW50KSB7XG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb24gPSBzd2lwZXIubWF4VHJhbnNsYXRlKCkgLSBib3VuY2VBbW91bnQ7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhZnRlckJvdW5jZVBvc2l0aW9uID0gc3dpcGVyLm1heFRyYW5zbGF0ZSgpO1xuICAgICAgICAgICAgICBkb0JvdW5jZSA9IHRydWU7XG4gICAgICAgICAgICAgIGRhdGEuYWxsb3dNb21lbnR1bUJvdW5jZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IHN3aXBlci5tYXhUcmFuc2xhdGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBhcmFtcy5sb29wICYmIHBhcmFtcy5jZW50ZXJlZFNsaWRlcykgbmVlZHNMb29wRml4ID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG5ld1Bvc2l0aW9uID4gc3dpcGVyLm1pblRyYW5zbGF0ZSgpKSB7XG4gICAgICAgICAgICBpZiAocGFyYW1zLmZyZWVNb2RlLm1vbWVudHVtQm91bmNlKSB7XG4gICAgICAgICAgICAgIGlmIChuZXdQb3NpdGlvbiAtIHN3aXBlci5taW5UcmFuc2xhdGUoKSA+IGJvdW5jZUFtb3VudCkge1xuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uID0gc3dpcGVyLm1pblRyYW5zbGF0ZSgpICsgYm91bmNlQW1vdW50O1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgYWZ0ZXJCb3VuY2VQb3NpdGlvbiA9IHN3aXBlci5taW5UcmFuc2xhdGUoKTtcbiAgICAgICAgICAgICAgZG9Cb3VuY2UgPSB0cnVlO1xuICAgICAgICAgICAgICBkYXRhLmFsbG93TW9tZW50dW1Cb3VuY2UgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3UG9zaXRpb24gPSBzd2lwZXIubWluVHJhbnNsYXRlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYXJhbXMubG9vcCAmJiBwYXJhbXMuY2VudGVyZWRTbGlkZXMpIG5lZWRzTG9vcEZpeCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMuZnJlZU1vZGUuc3RpY2t5KSB7XG4gICAgICAgICAgICBsZXQgbmV4dFNsaWRlO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNuYXBHcmlkLmxlbmd0aDsgaiArPSAxKSB7XG4gICAgICAgICAgICAgIGlmIChzbmFwR3JpZFtqXSA+IC1uZXdQb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIG5leHRTbGlkZSA9IGo7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHNuYXBHcmlkW25leHRTbGlkZV0gLSBuZXdQb3NpdGlvbikgPCBNYXRoLmFicyhzbmFwR3JpZFtuZXh0U2xpZGUgLSAxXSAtIG5ld1Bvc2l0aW9uKSB8fCBzd2lwZXIuc3dpcGVEaXJlY3Rpb24gPT09ICduZXh0Jykge1xuICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IHNuYXBHcmlkW25leHRTbGlkZV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IHNuYXBHcmlkW25leHRTbGlkZSAtIDFdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZXdQb3NpdGlvbiA9IC1uZXdQb3NpdGlvbjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobmVlZHNMb29wRml4KSB7XG4gICAgICAgICAgICBvbmNlKCd0cmFuc2l0aW9uRW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICBzd2lwZXIubG9vcEZpeCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSAvLyBGaXggZHVyYXRpb25cblxuXG4gICAgICAgICAgaWYgKHN3aXBlci52ZWxvY2l0eSAhPT0gMCkge1xuICAgICAgICAgICAgaWYgKHJ0bCkge1xuICAgICAgICAgICAgICBtb21lbnR1bUR1cmF0aW9uID0gTWF0aC5hYnMoKC1uZXdQb3NpdGlvbiAtIHN3aXBlci50cmFuc2xhdGUpIC8gc3dpcGVyLnZlbG9jaXR5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1vbWVudHVtRHVyYXRpb24gPSBNYXRoLmFicygobmV3UG9zaXRpb24gLSBzd2lwZXIudHJhbnNsYXRlKSAvIHN3aXBlci52ZWxvY2l0eSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYXJhbXMuZnJlZU1vZGUuc3RpY2t5KSB7XG4gICAgICAgICAgICAgIC8vIElmIGZyZWVNb2RlLnN0aWNreSBpcyBhY3RpdmUgYW5kIHRoZSB1c2VyIGVuZHMgYSBzd2lwZSB3aXRoIGEgc2xvdy12ZWxvY2l0eVxuICAgICAgICAgICAgICAvLyBldmVudCwgdGhlbiBkdXJhdGlvbnMgY2FuIGJlIDIwKyBzZWNvbmRzIHRvIHNsaWRlIG9uZSAob3IgemVybyEpIHNsaWRlcy5cbiAgICAgICAgICAgICAgLy8gSXQncyBlYXN5IHRvIHNlZSB0aGlzIHdoZW4gc2ltdWxhdGluZyB0b3VjaCB3aXRoIG1vdXNlIGV2ZW50cy4gVG8gZml4IHRoaXMsXG4gICAgICAgICAgICAgIC8vIGxpbWl0IHNpbmdsZS1zbGlkZSBzd2lwZXMgdG8gdGhlIGRlZmF1bHQgc2xpZGUgZHVyYXRpb24uIFRoaXMgYWxzbyBoYXMgdGhlXG4gICAgICAgICAgICAgIC8vIG5pY2Ugc2lkZSBlZmZlY3Qgb2YgbWF0Y2hpbmcgc2xpZGUgc3BlZWQgaWYgdGhlIHVzZXIgc3RvcHBlZCBtb3ZpbmcgYmVmb3JlXG4gICAgICAgICAgICAgIC8vIGxpZnRpbmcgZmluZ2VyIG9yIG1vdXNlIHZzLiBtb3Zpbmcgc2xvd2x5IGJlZm9yZSBsaWZ0aW5nIHRoZSBmaW5nZXIvbW91c2UuXG4gICAgICAgICAgICAgIC8vIEZvciBmYXN0ZXIgc3dpcGVzLCBhbHNvIGFwcGx5IGxpbWl0cyAoYWxiZWl0IGhpZ2hlciBvbmVzKS5cbiAgICAgICAgICAgICAgY29uc3QgbW92ZURpc3RhbmNlID0gTWF0aC5hYnMoKHJ0bCA/IC1uZXdQb3NpdGlvbiA6IG5ld1Bvc2l0aW9uKSAtIHN3aXBlci50cmFuc2xhdGUpO1xuICAgICAgICAgICAgICBjb25zdCBjdXJyZW50U2xpZGVTaXplID0gc3dpcGVyLnNsaWRlc1NpemVzR3JpZFtzd2lwZXIuYWN0aXZlSW5kZXhdO1xuXG4gICAgICAgICAgICAgIGlmIChtb3ZlRGlzdGFuY2UgPCBjdXJyZW50U2xpZGVTaXplKSB7XG4gICAgICAgICAgICAgICAgbW9tZW50dW1EdXJhdGlvbiA9IHBhcmFtcy5zcGVlZDtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChtb3ZlRGlzdGFuY2UgPCAyICogY3VycmVudFNsaWRlU2l6ZSkge1xuICAgICAgICAgICAgICAgIG1vbWVudHVtRHVyYXRpb24gPSBwYXJhbXMuc3BlZWQgKiAxLjU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbW9tZW50dW1EdXJhdGlvbiA9IHBhcmFtcy5zcGVlZCAqIDIuNTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLmZyZWVNb2RlLnN0aWNreSkge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlVG9DbG9zZXN0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhcmFtcy5mcmVlTW9kZS5tb21lbnR1bUJvdW5jZSAmJiBkb0JvdW5jZSkge1xuICAgICAgICAgICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKGFmdGVyQm91bmNlUG9zaXRpb24pO1xuICAgICAgICAgICAgc3dpcGVyLnNldFRyYW5zaXRpb24obW9tZW50dW1EdXJhdGlvbik7XG4gICAgICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKG5ld1Bvc2l0aW9uKTtcbiAgICAgICAgICAgIHN3aXBlci50cmFuc2l0aW9uU3RhcnQodHJ1ZSwgc3dpcGVyLnN3aXBlRGlyZWN0aW9uKTtcbiAgICAgICAgICAgIHN3aXBlci5hbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgJHdyYXBwZXJFbC50cmFuc2l0aW9uRW5kKCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFzd2lwZXIgfHwgc3dpcGVyLmRlc3Ryb3llZCB8fCAhZGF0YS5hbGxvd01vbWVudHVtQm91bmNlKSByZXR1cm47XG4gICAgICAgICAgICAgIGVtaXQoJ21vbWVudHVtQm91bmNlJyk7XG4gICAgICAgICAgICAgIHN3aXBlci5zZXRUcmFuc2l0aW9uKHBhcmFtcy5zcGVlZCk7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN3aXBlci5zZXRUcmFuc2xhdGUoYWZ0ZXJCb3VuY2VQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgJHdyYXBwZXJFbC50cmFuc2l0aW9uRW5kKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIHN3aXBlci50cmFuc2l0aW9uRW5kKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChzd2lwZXIudmVsb2NpdHkpIHtcbiAgICAgICAgICAgIGVtaXQoJ19mcmVlTW9kZU5vTW9tZW50dW1SZWxlYXNlJyk7XG4gICAgICAgICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MobmV3UG9zaXRpb24pO1xuICAgICAgICAgICAgc3dpcGVyLnNldFRyYW5zaXRpb24obW9tZW50dW1EdXJhdGlvbik7XG4gICAgICAgICAgICBzd2lwZXIuc2V0VHJhbnNsYXRlKG5ld1Bvc2l0aW9uKTtcbiAgICAgICAgICAgIHN3aXBlci50cmFuc2l0aW9uU3RhcnQodHJ1ZSwgc3dpcGVyLnN3aXBlRGlyZWN0aW9uKTtcblxuICAgICAgICAgICAgaWYgKCFzd2lwZXIuYW5pbWF0aW5nKSB7XG4gICAgICAgICAgICAgIHN3aXBlci5hbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAkd3JhcHBlckVsLnRyYW5zaXRpb25FbmQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghc3dpcGVyIHx8IHN3aXBlci5kZXN0cm95ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICBzd2lwZXIudHJhbnNpdGlvbkVuZCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpcGVyLnVwZGF0ZVByb2dyZXNzKG5ld1Bvc2l0aW9uKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzd2lwZXIudXBkYXRlQWN0aXZlSW5kZXgoKTtcbiAgICAgICAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5mcmVlTW9kZS5zdGlja3kpIHtcbiAgICAgICAgICBzd2lwZXIuc2xpZGVUb0Nsb3Nlc3QoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1zLmZyZWVNb2RlKSB7XG4gICAgICAgICAgZW1pdCgnX2ZyZWVNb2RlTm9Nb21lbnR1bVJlbGVhc2UnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyYW1zLmZyZWVNb2RlLm1vbWVudHVtIHx8IHRpbWVEaWZmID49IHBhcmFtcy5sb25nU3dpcGVzTXMpIHtcbiAgICAgICAgICBzd2lwZXIudXBkYXRlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICBzd2lwZXIudXBkYXRlQWN0aXZlSW5kZXgoKTtcbiAgICAgICAgICBzd2lwZXIudXBkYXRlU2xpZGVzQ2xhc3NlcygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oc3dpcGVyLCB7XG4gICAgICAgIGZyZWVNb2RlOiB7XG4gICAgICAgICAgb25Ub3VjaFN0YXJ0LFxuICAgICAgICAgIG9uVG91Y2hNb3ZlLFxuICAgICAgICAgIG9uVG91Y2hFbmRcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQGZhbmN5YXBwcy91aS9GYW5jeWJveCB2NC4wLjMxXG4gICAgY29uc3QgdCA9IHQgPT4gXCJvYmplY3RcIiA9PSB0eXBlb2YgdCAmJiBudWxsICE9PSB0ICYmIHQuY29uc3RydWN0b3IgPT09IE9iamVjdCAmJiBcIltvYmplY3QgT2JqZWN0XVwiID09PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCksXG4gICAgICAgICAgZSA9ICguLi5pKSA9PiB7XG4gICAgICBsZXQgcyA9ICExO1xuICAgICAgXCJib29sZWFuXCIgPT0gdHlwZW9mIGlbMF0gJiYgKHMgPSBpLnNoaWZ0KCkpO1xuICAgICAgbGV0IG8gPSBpWzBdO1xuICAgICAgaWYgKCFvIHx8IFwib2JqZWN0XCIgIT0gdHlwZW9mIG8pIHRocm93IG5ldyBFcnJvcihcImV4dGVuZGVlIG11c3QgYmUgYW4gb2JqZWN0XCIpO1xuICAgICAgY29uc3QgbiA9IGkuc2xpY2UoMSksXG4gICAgICAgICAgICBhID0gbi5sZW5ndGg7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGEgPSBuW2ldO1xuXG4gICAgICAgIGZvciAobGV0IGkgaW4gYSkgaWYgKGEuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICBjb25zdCBuID0gYVtpXTtcblxuICAgICAgICAgIGlmIChzICYmIChBcnJheS5pc0FycmF5KG4pIHx8IHQobikpKSB7XG4gICAgICAgICAgICBjb25zdCB0ID0gQXJyYXkuaXNBcnJheShuKSA/IFtdIDoge307XG4gICAgICAgICAgICBvW2ldID0gZSghMCwgby5oYXNPd25Qcm9wZXJ0eShpKSA/IG9baV0gOiB0LCBuKTtcbiAgICAgICAgICB9IGVsc2Ugb1tpXSA9IG47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG87XG4gICAgfSxcbiAgICAgICAgICBpID0gKHQsIGUgPSAxZTQpID0+ICh0ID0gcGFyc2VGbG9hdCh0KSB8fCAwLCBNYXRoLnJvdW5kKCh0ICsgTnVtYmVyLkVQU0lMT04pICogZSkgLyBlKSxcbiAgICAgICAgICBzID0gZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAhISh0ICYmIFwib2JqZWN0XCIgPT0gdHlwZW9mIHQgJiYgdCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgdCAhPT0gZG9jdW1lbnQuYm9keSkgJiYgIXQuX19QYW56b29tICYmIChmdW5jdGlvbiAodCkge1xuICAgICAgICBjb25zdCBlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0KVtcIm92ZXJmbG93LXlcIl0sXG4gICAgICAgICAgICAgIGkgPSBnZXRDb21wdXRlZFN0eWxlKHQpW1wib3ZlcmZsb3cteFwiXSxcbiAgICAgICAgICAgICAgcyA9IChcInNjcm9sbFwiID09PSBlIHx8IFwiYXV0b1wiID09PSBlKSAmJiBNYXRoLmFicyh0LnNjcm9sbEhlaWdodCAtIHQuY2xpZW50SGVpZ2h0KSA+IDEsXG4gICAgICAgICAgICAgIG8gPSAoXCJzY3JvbGxcIiA9PT0gaSB8fCBcImF1dG9cIiA9PT0gaSkgJiYgTWF0aC5hYnModC5zY3JvbGxXaWR0aCAtIHQuY2xpZW50V2lkdGgpID4gMTtcbiAgICAgICAgcmV0dXJuIHMgfHwgbztcbiAgICAgIH0odCkgPyB0IDogcyh0LnBhcmVudE5vZGUpKTtcbiAgICB9LFxuICAgICAgICAgIG8gPSBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiB3aW5kb3cgJiYgd2luZG93LlJlc2l6ZU9ic2VydmVyIHx8IGNsYXNzIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlcyA9IFtdLCB0aGlzLmJvdW5kQ2hlY2sgPSB0aGlzLmNoZWNrLmJpbmQodGhpcyksIHRoaXMuYm91bmRDaGVjaygpLCB0aGlzLmNhbGxiYWNrID0gdDtcbiAgICAgIH1cblxuICAgICAgb2JzZXJ2ZSh0KSB7XG4gICAgICAgIGlmICh0aGlzLm9ic2VydmFibGVzLnNvbWUoZSA9PiBlLmVsID09PSB0KSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBlID0ge1xuICAgICAgICAgIGVsOiB0LFxuICAgICAgICAgIHNpemU6IHtcbiAgICAgICAgICAgIGhlaWdodDogdC5jbGllbnRIZWlnaHQsXG4gICAgICAgICAgICB3aWR0aDogdC5jbGllbnRXaWR0aFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlcy5wdXNoKGUpO1xuICAgICAgfVxuXG4gICAgICB1bm9ic2VydmUodCkge1xuICAgICAgICB0aGlzLm9ic2VydmFibGVzID0gdGhpcy5vYnNlcnZhYmxlcy5maWx0ZXIoZSA9PiBlLmVsICE9PSB0KTtcbiAgICAgIH1cblxuICAgICAgZGlzY29ubmVjdCgpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlcyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBjaGVjaygpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMub2JzZXJ2YWJsZXMuZmlsdGVyKHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGUgPSB0LmVsLmNsaWVudEhlaWdodCxcbiAgICAgICAgICAgICAgICBpID0gdC5lbC5jbGllbnRXaWR0aDtcbiAgICAgICAgICBpZiAodC5zaXplLmhlaWdodCAhPT0gZSB8fCB0LnNpemUud2lkdGggIT09IGkpIHJldHVybiB0LnNpemUuaGVpZ2h0ID0gZSwgdC5zaXplLndpZHRoID0gaSwgITA7XG4gICAgICAgIH0pLm1hcCh0ID0+IHQuZWwpO1xuICAgICAgICB0Lmxlbmd0aCA+IDAgJiYgdGhpcy5jYWxsYmFjayh0KSwgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmJvdW5kQ2hlY2spO1xuICAgICAgfVxuXG4gICAgfTtcblxuICAgIGNsYXNzIG4ge1xuICAgICAgY29uc3RydWN0b3IodCkge1xuICAgICAgICB0aGlzLmlkID0gc2VsZi5Ub3VjaCAmJiB0IGluc3RhbmNlb2YgVG91Y2ggPyB0LmlkZW50aWZpZXIgOiAtMSwgdGhpcy5wYWdlWCA9IHQucGFnZVgsIHRoaXMucGFnZVkgPSB0LnBhZ2VZLCB0aGlzLmNsaWVudFggPSB0LmNsaWVudFgsIHRoaXMuY2xpZW50WSA9IHQuY2xpZW50WTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGNvbnN0IGEgPSAodCwgZSkgPT4gZSA/IE1hdGguc3FydCgoZS5jbGllbnRYIC0gdC5jbGllbnRYKSAqKiAyICsgKGUuY2xpZW50WSAtIHQuY2xpZW50WSkgKiogMikgOiAwLFxuICAgICAgICAgIHIgPSAodCwgZSkgPT4gZSA/IHtcbiAgICAgIGNsaWVudFg6ICh0LmNsaWVudFggKyBlLmNsaWVudFgpIC8gMixcbiAgICAgIGNsaWVudFk6ICh0LmNsaWVudFkgKyBlLmNsaWVudFkpIC8gMlxuICAgIH0gOiB0O1xuXG4gICAgY2xhc3MgaCB7XG4gICAgICBjb25zdHJ1Y3Rvcih0LCB7XG4gICAgICAgIHN0YXJ0OiBlID0gKCkgPT4gITAsXG4gICAgICAgIG1vdmU6IGkgPSAoKSA9PiB7fSxcbiAgICAgICAgZW5kOiBzID0gKCkgPT4ge31cbiAgICAgIH0gPSB7fSkge1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gdCwgdGhpcy5zdGFydFBvaW50ZXJzID0gW10sIHRoaXMuY3VycmVudFBvaW50ZXJzID0gW10sIHRoaXMuX3BvaW50ZXJTdGFydCA9IHQgPT4ge1xuICAgICAgICAgIGlmICh0LmJ1dHRvbnMgPiAwICYmIDAgIT09IHQuYnV0dG9uKSByZXR1cm47XG4gICAgICAgICAgY29uc3QgZSA9IG5ldyBuKHQpO1xuICAgICAgICAgIHRoaXMuY3VycmVudFBvaW50ZXJzLnNvbWUodCA9PiB0LmlkID09PSBlLmlkKSB8fCB0aGlzLl90cmlnZ2VyUG9pbnRlclN0YXJ0KGUsIHQpICYmICh3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLl9tb3ZlKSwgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMuX3BvaW50ZXJFbmQpKTtcbiAgICAgICAgfSwgdGhpcy5fdG91Y2hTdGFydCA9IHQgPT4ge1xuICAgICAgICAgIGZvciAoY29uc3QgZSBvZiBBcnJheS5mcm9tKHQuY2hhbmdlZFRvdWNoZXMgfHwgW10pKSB0aGlzLl90cmlnZ2VyUG9pbnRlclN0YXJ0KG5ldyBuKGUpLCB0KTtcbiAgICAgICAgfSwgdGhpcy5fbW92ZSA9IHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLmN1cnJlbnRQb2ludGVycy5zbGljZSgpLFxuICAgICAgICAgICAgICAgIGkgPSAodCA9PiBcImNoYW5nZWRUb3VjaGVzXCIgaW4gdCkodCkgPyBBcnJheS5mcm9tKHQuY2hhbmdlZFRvdWNoZXMpLm1hcCh0ID0+IG5ldyBuKHQpKSA6IFtuZXcgbih0KV07XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHQgb2YgaSkge1xuICAgICAgICAgICAgY29uc3QgZSA9IHRoaXMuY3VycmVudFBvaW50ZXJzLmZpbmRJbmRleChlID0+IGUuaWQgPT09IHQuaWQpO1xuICAgICAgICAgICAgZSA8IDAgfHwgKHRoaXMuY3VycmVudFBvaW50ZXJzW2VdID0gdCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fbW92ZUNhbGxiYWNrKGUsIHRoaXMuY3VycmVudFBvaW50ZXJzLnNsaWNlKCksIHQpO1xuICAgICAgICB9LCB0aGlzLl90cmlnZ2VyUG9pbnRlckVuZCA9ICh0LCBlKSA9PiB7XG4gICAgICAgICAgY29uc3QgaSA9IHRoaXMuY3VycmVudFBvaW50ZXJzLmZpbmRJbmRleChlID0+IGUuaWQgPT09IHQuaWQpO1xuICAgICAgICAgIHJldHVybiAhKGkgPCAwKSAmJiAodGhpcy5jdXJyZW50UG9pbnRlcnMuc3BsaWNlKGksIDEpLCB0aGlzLnN0YXJ0UG9pbnRlcnMuc3BsaWNlKGksIDEpLCB0aGlzLl9lbmRDYWxsYmFjayh0LCBlKSwgITApO1xuICAgICAgICB9LCB0aGlzLl9wb2ludGVyRW5kID0gdCA9PiB7XG4gICAgICAgICAgdC5idXR0b25zID4gMCAmJiAwICE9PSB0LmJ1dHRvbiB8fCB0aGlzLl90cmlnZ2VyUG9pbnRlckVuZChuZXcgbih0KSwgdCkgJiYgKHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMuX21vdmUsIHtcbiAgICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgICAgfSksIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLl9wb2ludGVyRW5kLCB7XG4gICAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSwgdGhpcy5fdG91Y2hFbmQgPSB0ID0+IHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGUgb2YgQXJyYXkuZnJvbSh0LmNoYW5nZWRUb3VjaGVzIHx8IFtdKSkgdGhpcy5fdHJpZ2dlclBvaW50ZXJFbmQobmV3IG4oZSksIHQpO1xuICAgICAgICB9LCB0aGlzLl9zdGFydENhbGxiYWNrID0gZSwgdGhpcy5fbW92ZUNhbGxiYWNrID0gaSwgdGhpcy5fZW5kQ2FsbGJhY2sgPSBzLCB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5fcG9pbnRlclN0YXJ0LCB7XG4gICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgfSksIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgdGhpcy5fdG91Y2hTdGFydCwge1xuICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgIH0pLCB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgdGhpcy5fbW92ZSwge1xuICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgIH0pLCB0aGlzLl9lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCB0aGlzLl90b3VjaEVuZCksIHRoaXMuX2VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoY2FuY2VsXCIsIHRoaXMuX3RvdWNoRW5kKTtcbiAgICAgIH1cblxuICAgICAgc3RvcCgpIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuX3BvaW50ZXJTdGFydCwge1xuICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgIH0pLCB0aGlzLl9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRoaXMuX3RvdWNoU3RhcnQsIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRoaXMuX21vdmUsIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy5fZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgdGhpcy5fdG91Y2hFbmQpLCB0aGlzLl9lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGNhbmNlbFwiLCB0aGlzLl90b3VjaEVuZCksIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMuX21vdmUpLCB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5fcG9pbnRlckVuZCk7XG4gICAgICB9XG5cbiAgICAgIF90cmlnZ2VyUG9pbnRlclN0YXJ0KHQsIGUpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5fc3RhcnRDYWxsYmFjayh0LCBlKSAmJiAodGhpcy5jdXJyZW50UG9pbnRlcnMucHVzaCh0KSwgdGhpcy5zdGFydFBvaW50ZXJzLnB1c2godCksICEwKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGNsYXNzIGwge1xuICAgICAgY29uc3RydWN0b3IodCA9IHt9KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IGUoITAsIHt9LCB0KSwgdGhpcy5wbHVnaW5zID0gW10sIHRoaXMuZXZlbnRzID0ge307XG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIFtcIm9uXCIsIFwib25jZVwiXSkgZm9yIChjb25zdCBlIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMub3B0aW9uc1t0XSB8fCB7fSkpIHRoaXNbdF0oLi4uZSk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbih0LCBlLCAuLi5pKSB7XG4gICAgICAgIHQgPSBTdHJpbmcodCk7XG4gICAgICAgIGxldCBzID0gKG8gPSB0LCBuID0gdGhpcy5vcHRpb25zLCBvLnNwbGl0KFwiLlwiKS5yZWR1Y2UoZnVuY3Rpb24gKHQsIGUpIHtcbiAgICAgICAgICByZXR1cm4gdCAmJiB0W2VdO1xuICAgICAgICB9LCBuKSk7XG4gICAgICAgIHZhciBvLCBuO1xuICAgICAgICByZXR1cm4gXCJmdW5jdGlvblwiID09IHR5cGVvZiBzICYmIChzID0gcy5jYWxsKHRoaXMsIHRoaXMsIC4uLmkpKSwgdm9pZCAwID09PSBzID8gZSA6IHM7XG4gICAgICB9XG5cbiAgICAgIGxvY2FsaXplKHQsIGUgPSBbXSkge1xuICAgICAgICByZXR1cm4gdCA9ICh0ID0gU3RyaW5nKHQpLnJlcGxhY2UoL1xce1xceyhcXHcrKS4/KFxcdyspP1xcfVxcfS9nLCAodCwgaSwgcykgPT4ge1xuICAgICAgICAgIGxldCBvID0gXCJcIjtcbiAgICAgICAgICBzID8gbyA9IHRoaXMub3B0aW9uKGAke2lbMF0gKyBpLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKDEpfS5sMTBuLiR7c31gKSA6IGkgJiYgKG8gPSB0aGlzLm9wdGlvbihgbDEwbi4ke2l9YCkpLCBvIHx8IChvID0gdCk7XG5cbiAgICAgICAgICBmb3IgKGxldCB0ID0gMDsgdCA8IGUubGVuZ3RoOyB0KyspIG8gPSBvLnNwbGl0KGVbdF1bMF0pLmpvaW4oZVt0XVsxXSk7XG5cbiAgICAgICAgICByZXR1cm4gbztcbiAgICAgICAgfSkpLnJlcGxhY2UoL1xce1xceyguKilcXH1cXH0vLCAodCwgZSkgPT4gZSk7XG4gICAgICB9XG5cbiAgICAgIG9uKGUsIGkpIHtcbiAgICAgICAgaWYgKHQoZSkpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IHQgb2YgT2JqZWN0LmVudHJpZXMoZSkpIHRoaXMub24oLi4udCk7XG5cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTdHJpbmcoZSkuc3BsaXQoXCIgXCIpLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgY29uc3QgZSA9IHRoaXMuZXZlbnRzW3RdID0gdGhpcy5ldmVudHNbdF0gfHwgW107XG4gICAgICAgICAgLTEgPT0gZS5pbmRleE9mKGkpICYmIGUucHVzaChpKTtcbiAgICAgICAgfSksIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIG9uY2UoZSwgaSkge1xuICAgICAgICBpZiAodChlKSkge1xuICAgICAgICAgIGZvciAoY29uc3QgdCBvZiBPYmplY3QuZW50cmllcyhlKSkgdGhpcy5vbmNlKC4uLnQpO1xuXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gU3RyaW5nKGUpLnNwbGl0KFwiIFwiKS5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIGNvbnN0IGUgPSAoLi4ucykgPT4ge1xuICAgICAgICAgICAgdGhpcy5vZmYodCwgZSksIGkuY2FsbCh0aGlzLCB0aGlzLCAuLi5zKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgZS5fID0gaSwgdGhpcy5vbih0LCBlKTtcbiAgICAgICAgfSksIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIG9mZihlLCBpKSB7XG4gICAgICAgIGlmICghdChlKSkgcmV0dXJuIGUuc3BsaXQoXCIgXCIpLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgY29uc3QgZSA9IHRoaXMuZXZlbnRzW3RdO1xuICAgICAgICAgIGlmICghZSB8fCAhZS5sZW5ndGgpIHJldHVybiB0aGlzO1xuICAgICAgICAgIGxldCBzID0gLTE7XG5cbiAgICAgICAgICBmb3IgKGxldCB0ID0gMCwgbyA9IGUubGVuZ3RoOyB0IDwgbzsgdCsrKSB7XG4gICAgICAgICAgICBjb25zdCBvID0gZVt0XTtcblxuICAgICAgICAgICAgaWYgKG8gJiYgKG8gPT09IGkgfHwgby5fID09PSBpKSkge1xuICAgICAgICAgICAgICBzID0gdDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLTEgIT0gcyAmJiBlLnNwbGljZShzLCAxKTtcbiAgICAgICAgfSksIHRoaXM7XG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIE9iamVjdC5lbnRyaWVzKGUpKSB0aGlzLm9mZiguLi50KTtcbiAgICAgIH1cblxuICAgICAgdHJpZ2dlcih0LCAuLi5lKSB7XG4gICAgICAgIGZvciAoY29uc3QgaSBvZiBbLi4uKHRoaXMuZXZlbnRzW3RdIHx8IFtdKV0uc2xpY2UoKSkgaWYgKGkgJiYgITEgPT09IGkuY2FsbCh0aGlzLCB0aGlzLCAuLi5lKSkgcmV0dXJuICExO1xuXG4gICAgICAgIGZvciAoY29uc3QgaSBvZiBbLi4uKHRoaXMuZXZlbnRzW1wiKlwiXSB8fCBbXSldLnNsaWNlKCkpIGlmIChpICYmICExID09PSBpLmNhbGwodGhpcywgdCwgdGhpcywgLi4uZSkpIHJldHVybiAhMTtcblxuICAgICAgICByZXR1cm4gITA7XG4gICAgICB9XG5cbiAgICAgIGF0dGFjaFBsdWdpbnModCkge1xuICAgICAgICBjb25zdCBpID0ge307XG5cbiAgICAgICAgZm9yIChjb25zdCBbcywgb10gb2YgT2JqZWN0LmVudHJpZXModCB8fCB7fSkpICExID09PSB0aGlzLm9wdGlvbnNbc10gfHwgdGhpcy5wbHVnaW5zW3NdIHx8ICh0aGlzLm9wdGlvbnNbc10gPSBlKHt9LCBvLmRlZmF1bHRzIHx8IHt9LCB0aGlzLm9wdGlvbnNbc10pLCBpW3NdID0gbmV3IG8odGhpcykpO1xuXG4gICAgICAgIGZvciAoY29uc3QgW3QsIGVdIG9mIE9iamVjdC5lbnRyaWVzKGkpKSBlLmF0dGFjaCh0aGlzKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5wbHVnaW5zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wbHVnaW5zLCBpKSwgdGhpcztcbiAgICAgIH1cblxuICAgICAgZGV0YWNoUGx1Z2lucygpIHtcbiAgICAgICAgZm9yIChjb25zdCB0IGluIHRoaXMucGx1Z2lucykge1xuICAgICAgICAgIGxldCBlO1xuICAgICAgICAgIChlID0gdGhpcy5wbHVnaW5zW3RdKSAmJiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGUuZGV0YWNoICYmIGUuZGV0YWNoKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucGx1Z2lucyA9IHt9LCB0aGlzO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgY29uc3QgYyA9IHtcbiAgICAgIHRvdWNoOiAhMCxcbiAgICAgIHpvb206ICEwLFxuICAgICAgcGluY2hUb1pvb206ICEwLFxuICAgICAgcGFuT25seVpvb21lZDogITEsXG4gICAgICBsb2NrQXhpczogITEsXG4gICAgICBmcmljdGlvbjogLjY0LFxuICAgICAgZGVjZWxGcmljdGlvbjogLjg4LFxuICAgICAgem9vbUZyaWN0aW9uOiAuNzQsXG4gICAgICBib3VuY2VGb3JjZTogLjIsXG4gICAgICBiYXNlU2NhbGU6IDEsXG4gICAgICBtaW5TY2FsZTogMSxcbiAgICAgIG1heFNjYWxlOiAyLFxuICAgICAgc3RlcDogLjUsXG4gICAgICB0ZXh0U2VsZWN0aW9uOiAhMSxcbiAgICAgIGNsaWNrOiBcInRvZ2dsZVpvb21cIixcbiAgICAgIHdoZWVsOiBcInpvb21cIixcbiAgICAgIHdoZWVsRmFjdG9yOiA0MixcbiAgICAgIHdoZWVsTGltaXQ6IDUsXG4gICAgICBkcmFnZ2FibGVDbGFzczogXCJpcy1kcmFnZ2FibGVcIixcbiAgICAgIGRyYWdnaW5nQ2xhc3M6IFwiaXMtZHJhZ2dpbmdcIixcbiAgICAgIHJhdGlvOiAxXG4gICAgfTtcblxuICAgIGNsYXNzIGQgZXh0ZW5kcyBsIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQsIGkgPSB7fSkge1xuICAgICAgICBzdXBlcihlKCEwLCB7fSwgYywgaSkpLCB0aGlzLnN0YXRlID0gXCJpbml0XCIsIHRoaXMuJGNvbnRhaW5lciA9IHQ7XG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIFtcIm9uTG9hZFwiLCBcIm9uV2hlZWxcIiwgXCJvbkNsaWNrXCJdKSB0aGlzW3RdID0gdGhpc1t0XS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuaW5pdExheW91dCgpLCB0aGlzLnJlc2V0VmFsdWVzKCksIHRoaXMuYXR0YWNoUGx1Z2lucyhkLlBsdWdpbnMpLCB0aGlzLnRyaWdnZXIoXCJpbml0XCIpLCB0aGlzLnVwZGF0ZU1ldHJpY3MoKSwgdGhpcy5hdHRhY2hFdmVudHMoKSwgdGhpcy50cmlnZ2VyKFwicmVhZHlcIiksICExID09PSB0aGlzLm9wdGlvbihcImNlbnRlck9uU3RhcnRcIikgPyB0aGlzLnN0YXRlID0gXCJyZWFkeVwiIDogdGhpcy5wYW5Ubyh7XG4gICAgICAgICAgZnJpY3Rpb246IDBcbiAgICAgICAgfSksIHQuX19QYW56b29tID0gdGhpcztcbiAgICAgIH1cblxuICAgICAgaW5pdExheW91dCgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuJGNvbnRhaW5lcjtcbiAgICAgICAgaWYgKCEodCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkgdGhyb3cgbmV3IEVycm9yKFwiUGFuem9vbTogQ29udGFpbmVyIG5vdCBmb3VuZFwiKTtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMub3B0aW9uKFwiY29udGVudFwiKSB8fCB0LnF1ZXJ5U2VsZWN0b3IoXCIucGFuem9vbV9fY29udGVudFwiKTtcbiAgICAgICAgaWYgKCFlKSB0aHJvdyBuZXcgRXJyb3IoXCJQYW56b29tOiBDb250ZW50IG5vdCBmb3VuZFwiKTtcbiAgICAgICAgdGhpcy4kY29udGVudCA9IGU7XG4gICAgICAgIGxldCBpID0gdGhpcy5vcHRpb24oXCJ2aWV3cG9ydFwiKSB8fCB0LnF1ZXJ5U2VsZWN0b3IoXCIucGFuem9vbV9fdmlld3BvcnRcIik7XG4gICAgICAgIGkgfHwgITEgPT09IHRoaXMub3B0aW9uKFwid3JhcElubmVyXCIpIHx8IChpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgaS5jbGFzc0xpc3QuYWRkKFwicGFuem9vbV9fdmlld3BvcnRcIiksIGkuYXBwZW5kKC4uLnQuY2hpbGROb2RlcyksIHQuYXBwZW5kQ2hpbGQoaSkpLCB0aGlzLiR2aWV3cG9ydCA9IGkgfHwgZS5wYXJlbnROb2RlO1xuICAgICAgfVxuXG4gICAgICByZXNldFZhbHVlcygpIHtcbiAgICAgICAgdGhpcy51cGRhdGVSYXRlID0gdGhpcy5vcHRpb24oXCJ1cGRhdGVSYXRlXCIsIC9pUGhvbmV8aVBhZHxpUG9kfEFuZHJvaWQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpID8gMjUwIDogMjQpLCB0aGlzLmNvbnRhaW5lciA9IHtcbiAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfSwgdGhpcy52aWV3cG9ydCA9IHtcbiAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICBoZWlnaHQ6IDBcbiAgICAgICAgfSwgdGhpcy5jb250ZW50ID0ge1xuICAgICAgICAgIG9yaWdXaWR0aDogMCxcbiAgICAgICAgICBvcmlnSGVpZ2h0OiAwLFxuICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgICB4OiB0aGlzLm9wdGlvbihcInhcIiwgMCksXG4gICAgICAgICAgeTogdGhpcy5vcHRpb24oXCJ5XCIsIDApLFxuICAgICAgICAgIHNjYWxlOiB0aGlzLm9wdGlvbihcImJhc2VTY2FsZVwiKVxuICAgICAgICB9LCB0aGlzLnRyYW5zZm9ybSA9IHtcbiAgICAgICAgICB4OiAwLFxuICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgc2NhbGU6IDFcbiAgICAgICAgfSwgdGhpcy5yZXNldERyYWdQb3NpdGlvbigpO1xuICAgICAgfVxuXG4gICAgICBvbkxvYWQodCkge1xuICAgICAgICB0aGlzLnVwZGF0ZU1ldHJpY3MoKSwgdGhpcy5wYW5Ubyh7XG4gICAgICAgICAgc2NhbGU6IHRoaXMub3B0aW9uKFwiYmFzZVNjYWxlXCIpLFxuICAgICAgICAgIGZyaWN0aW9uOiAwXG4gICAgICAgIH0pLCB0aGlzLnRyaWdnZXIoXCJsb2FkXCIsIHQpO1xuICAgICAgfVxuXG4gICAgICBvbkNsaWNrKHQpIHtcbiAgICAgICAgaWYgKHQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuICAgICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmNsb3Nlc3QoXCJbY29udGVudGVkaXRhYmxlXVwiKSkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5vcHRpb24oXCJ0ZXh0U2VsZWN0aW9uXCIpICYmIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS50b1N0cmluZygpLmxlbmd0aCAmJiAoIXQudGFyZ2V0IHx8ICF0LnRhcmdldC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWZhbmN5Ym94LWNsb3NlXCIpKSkgcmV0dXJuIHZvaWQgdC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMuJGNvbnRlbnQuZ2V0Q2xpZW50UmVjdHMoKVswXTtcbiAgICAgICAgaWYgKFwicmVhZHlcIiAhPT0gdGhpcy5zdGF0ZSAmJiAodGhpcy5kcmFnUG9zaXRpb24ubWlkUG9pbnQgfHwgTWF0aC5hYnMoZS50b3AgLSB0aGlzLmRyYWdTdGFydC5yZWN0LnRvcCkgPiAxIHx8IE1hdGguYWJzKGUubGVmdCAtIHRoaXMuZHJhZ1N0YXJ0LnJlY3QubGVmdCkgPiAxKSkgcmV0dXJuIHQucHJldmVudERlZmF1bHQoKSwgdm9pZCB0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAhMSAhPT0gdGhpcy50cmlnZ2VyKFwiY2xpY2tcIiwgdCkgJiYgdGhpcy5vcHRpb24oXCJ6b29tXCIpICYmIFwidG9nZ2xlWm9vbVwiID09PSB0aGlzLm9wdGlvbihcImNsaWNrXCIpICYmICh0LnByZXZlbnREZWZhdWx0KCksIHQuc3RvcFByb3BhZ2F0aW9uKCksIHRoaXMuem9vbVdpdGhDbGljayh0KSk7XG4gICAgICB9XG5cbiAgICAgIG9uV2hlZWwodCkge1xuICAgICAgICAhMSAhPT0gdGhpcy50cmlnZ2VyKFwid2hlZWxcIiwgdCkgJiYgdGhpcy5vcHRpb24oXCJ6b29tXCIpICYmIHRoaXMub3B0aW9uKFwid2hlZWxcIikgJiYgdGhpcy56b29tV2l0aFdoZWVsKHQpO1xuICAgICAgfVxuXG4gICAgICB6b29tV2l0aFdoZWVsKHQpIHtcbiAgICAgICAgdm9pZCAwID09PSB0aGlzLmNoYW5nZWREZWx0YSAmJiAodGhpcy5jaGFuZ2VkRGVsdGEgPSAwKTtcbiAgICAgICAgY29uc3QgZSA9IE1hdGgubWF4KC0xLCBNYXRoLm1pbigxLCAtdC5kZWx0YVkgfHwgLXQuZGVsdGFYIHx8IHQud2hlZWxEZWx0YSB8fCAtdC5kZXRhaWwpKSxcbiAgICAgICAgICAgICAgaSA9IHRoaXMuY29udGVudC5zY2FsZTtcbiAgICAgICAgbGV0IHMgPSBpICogKDEwMCArIGUgKiB0aGlzLm9wdGlvbihcIndoZWVsRmFjdG9yXCIpKSAvIDEwMDtcbiAgICAgICAgaWYgKGUgPCAwICYmIE1hdGguYWJzKGkgLSB0aGlzLm9wdGlvbihcIm1pblNjYWxlXCIpKSA8IC4wMSB8fCBlID4gMCAmJiBNYXRoLmFicyhpIC0gdGhpcy5vcHRpb24oXCJtYXhTY2FsZVwiKSkgPCAuMDEgPyAodGhpcy5jaGFuZ2VkRGVsdGEgKz0gTWF0aC5hYnMoZSksIHMgPSBpKSA6ICh0aGlzLmNoYW5nZWREZWx0YSA9IDAsIHMgPSBNYXRoLm1heChNYXRoLm1pbihzLCB0aGlzLm9wdGlvbihcIm1heFNjYWxlXCIpKSwgdGhpcy5vcHRpb24oXCJtaW5TY2FsZVwiKSkpLCB0aGlzLmNoYW5nZWREZWx0YSA+IHRoaXMub3B0aW9uKFwid2hlZWxMaW1pdFwiKSkgcmV0dXJuO1xuICAgICAgICBpZiAodC5wcmV2ZW50RGVmYXVsdCgpLCBzID09PSBpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IG8gPSB0aGlzLiRjb250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgICBuID0gdC5jbGllbnRYIC0gby5sZWZ0LFxuICAgICAgICAgICAgICBhID0gdC5jbGllbnRZIC0gby50b3A7XG4gICAgICAgIHRoaXMuem9vbVRvKHMsIHtcbiAgICAgICAgICB4OiBuLFxuICAgICAgICAgIHk6IGFcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHpvb21XaXRoQ2xpY2sodCkge1xuICAgICAgICBjb25zdCBlID0gdGhpcy4kY29udGVudC5nZXRDbGllbnRSZWN0cygpWzBdLFxuICAgICAgICAgICAgICBpID0gdC5jbGllbnRYIC0gZS5sZWZ0LFxuICAgICAgICAgICAgICBzID0gdC5jbGllbnRZIC0gZS50b3A7XG4gICAgICAgIHRoaXMudG9nZ2xlWm9vbSh7XG4gICAgICAgICAgeDogaSxcbiAgICAgICAgICB5OiBzXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBhdHRhY2hFdmVudHMoKSB7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgdGhpcy5vbkxvYWQpLCB0aGlzLiRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIHRoaXMub25XaGVlbCwge1xuICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgIH0pLCB0aGlzLiRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMub25DbGljaywge1xuICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgIH0pLCB0aGlzLmluaXRPYnNlcnZlcigpO1xuICAgICAgICBjb25zdCB0ID0gbmV3IGgodGhpcy4kY29udGFpbmVyLCB7XG4gICAgICAgICAgc3RhcnQ6IChlLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9uKFwidG91Y2hcIikpIHJldHVybiAhMTtcbiAgICAgICAgICAgIGlmICh0aGlzLnZlbG9jaXR5LnNjYWxlIDwgMCkgcmV0dXJuICExO1xuICAgICAgICAgICAgY29uc3QgbyA9IGkuY29tcG9zZWRQYXRoKClbMF07XG5cbiAgICAgICAgICAgIGlmICghdC5jdXJyZW50UG9pbnRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGlmICgtMSAhPT0gW1wiQlVUVE9OXCIsIFwiVEVYVEFSRUFcIiwgXCJPUFRJT05cIiwgXCJJTlBVVFwiLCBcIlNFTEVDVFwiLCBcIlZJREVPXCJdLmluZGV4T2Yoby5ub2RlTmFtZSkpIHJldHVybiAhMTtcbiAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9uKFwidGV4dFNlbGVjdGlvblwiKSAmJiAoKHQsIGUsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzID0gdC5jaGlsZE5vZGVzLFxuICAgICAgICAgICAgICAgICAgICAgIG8gPSBkb2N1bWVudC5jcmVhdGVSYW5nZSgpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPCBzLmxlbmd0aDsgdCsrKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuID0gc1t0XTtcbiAgICAgICAgICAgICAgICAgIGlmIChuLm5vZGVUeXBlICE9PSBOb2RlLlRFWFRfTk9ERSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICBvLnNlbGVjdE5vZGVDb250ZW50cyhuKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBvLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgICAgaWYgKGUgPj0gYS5sZWZ0ICYmIGkgPj0gYS50b3AgJiYgZSA8PSBhLnJpZ2h0ICYmIGkgPD0gYS5ib3R0b20pIHJldHVybiBuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiAhMTtcbiAgICAgICAgICAgICAgfSkobywgZS5jbGllbnRYLCBlLmNsaWVudFkpKSByZXR1cm4gITE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAhcyhvKSAmJiAhMSAhPT0gdGhpcy50cmlnZ2VyKFwidG91Y2hTdGFydFwiLCBpKSAmJiAoXCJtb3VzZWRvd25cIiA9PT0gaS50eXBlICYmIGkucHJldmVudERlZmF1bHQoKSwgdGhpcy5zdGF0ZSA9IFwicG9pbnRlcmRvd25cIiwgdGhpcy5yZXNldERyYWdQb3NpdGlvbigpLCB0aGlzLmRyYWdQb3NpdGlvbi5taWRQb2ludCA9IG51bGwsIHRoaXMuZHJhZ1Bvc2l0aW9uLnRpbWUgPSBEYXRlLm5vdygpLCAhMCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBtb3ZlOiAoZSwgaSwgcykgPT4ge1xuICAgICAgICAgICAgaWYgKFwicG9pbnRlcmRvd25cIiAhPT0gdGhpcy5zdGF0ZSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCExID09PSB0aGlzLnRyaWdnZXIoXCJ0b3VjaE1vdmVcIiwgcykpIHJldHVybiB2b2lkIHMucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmIChpLmxlbmd0aCA8IDIgJiYgITAgPT09IHRoaXMub3B0aW9uKFwicGFuT25seVpvb21lZFwiKSAmJiB0aGlzLmNvbnRlbnQud2lkdGggPD0gdGhpcy52aWV3cG9ydC53aWR0aCAmJiB0aGlzLmNvbnRlbnQuaGVpZ2h0IDw9IHRoaXMudmlld3BvcnQuaGVpZ2h0ICYmIHRoaXMudHJhbnNmb3JtLnNjYWxlIDw9IHRoaXMub3B0aW9uKFwiYmFzZVNjYWxlXCIpKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoaS5sZW5ndGggPiAxICYmICghdGhpcy5vcHRpb24oXCJ6b29tXCIpIHx8ICExID09PSB0aGlzLm9wdGlvbihcInBpbmNoVG9ab29tXCIpKSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgbyA9IHIoZVswXSwgZVsxXSksXG4gICAgICAgICAgICAgICAgICBuID0gcihpWzBdLCBpWzFdKSxcbiAgICAgICAgICAgICAgICAgIGggPSBuLmNsaWVudFggLSBvLmNsaWVudFgsXG4gICAgICAgICAgICAgICAgICBsID0gbi5jbGllbnRZIC0gby5jbGllbnRZLFxuICAgICAgICAgICAgICAgICAgYyA9IGEoZVswXSwgZVsxXSksXG4gICAgICAgICAgICAgICAgICBkID0gYShpWzBdLCBpWzFdKSxcbiAgICAgICAgICAgICAgICAgIHUgPSBjICYmIGQgPyBkIC8gYyA6IDE7XG4gICAgICAgICAgICB0aGlzLmRyYWdPZmZzZXQueCArPSBoLCB0aGlzLmRyYWdPZmZzZXQueSArPSBsLCB0aGlzLmRyYWdPZmZzZXQuc2NhbGUgKj0gdSwgdGhpcy5kcmFnT2Zmc2V0LnRpbWUgPSBEYXRlLm5vdygpIC0gdGhpcy5kcmFnUG9zaXRpb24udGltZTtcbiAgICAgICAgICAgIGNvbnN0IGYgPSAxID09PSB0aGlzLmRyYWdTdGFydC5zY2FsZSAmJiB0aGlzLm9wdGlvbihcImxvY2tBeGlzXCIpO1xuXG4gICAgICAgICAgICBpZiAoZiAmJiAhdGhpcy5sb2NrQXhpcykge1xuICAgICAgICAgICAgICBpZiAoTWF0aC5hYnModGhpcy5kcmFnT2Zmc2V0LngpIDwgNiAmJiBNYXRoLmFicyh0aGlzLmRyYWdPZmZzZXQueSkgPCA2KSByZXR1cm4gdm9pZCBzLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGNvbnN0IHQgPSBNYXRoLmFicygxODAgKiBNYXRoLmF0YW4yKHRoaXMuZHJhZ09mZnNldC55LCB0aGlzLmRyYWdPZmZzZXQueCkgLyBNYXRoLlBJKTtcbiAgICAgICAgICAgICAgdGhpcy5sb2NrQXhpcyA9IHQgPiA0NSAmJiB0IDwgMTM1ID8gXCJ5XCIgOiBcInhcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFwieHlcIiA9PT0gZiB8fCBcInlcIiAhPT0gdGhpcy5sb2NrQXhpcykge1xuICAgICAgICAgICAgICBpZiAocy5wcmV2ZW50RGVmYXVsdCgpLCBzLnN0b3BQcm9wYWdhdGlvbigpLCBzLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpLCB0aGlzLmxvY2tBeGlzICYmICh0aGlzLmRyYWdPZmZzZXRbXCJ4XCIgPT09IHRoaXMubG9ja0F4aXMgPyBcInlcIiA6IFwieFwiXSA9IDApLCB0aGlzLiRjb250YWluZXIuY2xhc3NMaXN0LmFkZCh0aGlzLm9wdGlvbihcImRyYWdnaW5nQ2xhc3NcIikpLCB0aGlzLnRyYW5zZm9ybS5zY2FsZSA9PT0gdGhpcy5vcHRpb24oXCJiYXNlU2NhbGVcIikgJiYgXCJ5XCIgPT09IHRoaXMubG9ja0F4aXMgfHwgKHRoaXMuZHJhZ1Bvc2l0aW9uLnggPSB0aGlzLmRyYWdTdGFydC54ICsgdGhpcy5kcmFnT2Zmc2V0LngpLCB0aGlzLnRyYW5zZm9ybS5zY2FsZSA9PT0gdGhpcy5vcHRpb24oXCJiYXNlU2NhbGVcIikgJiYgXCJ4XCIgPT09IHRoaXMubG9ja0F4aXMgfHwgKHRoaXMuZHJhZ1Bvc2l0aW9uLnkgPSB0aGlzLmRyYWdTdGFydC55ICsgdGhpcy5kcmFnT2Zmc2V0LnkpLCB0aGlzLmRyYWdQb3NpdGlvbi5zY2FsZSA9IHRoaXMuZHJhZ1N0YXJ0LnNjYWxlICogdGhpcy5kcmFnT2Zmc2V0LnNjYWxlLCBpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlID0gcih0LnN0YXJ0UG9pbnRlcnNbMF0sIHQuc3RhcnRQb2ludGVyc1sxXSksXG4gICAgICAgICAgICAgICAgICAgICAgaSA9IGUuY2xpZW50WCAtIHRoaXMuZHJhZ1N0YXJ0LnJlY3QueCxcbiAgICAgICAgICAgICAgICAgICAgICBzID0gZS5jbGllbnRZIC0gdGhpcy5kcmFnU3RhcnQucmVjdC55LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGRlbHRhWDogbyxcbiAgICAgICAgICAgICAgICAgIGRlbHRhWTogYVxuICAgICAgICAgICAgICAgIH0gPSB0aGlzLmdldFpvb21EZWx0YSh0aGlzLmNvbnRlbnQuc2NhbGUgKiB0aGlzLmRyYWdPZmZzZXQuc2NhbGUsIGksIHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ1Bvc2l0aW9uLnggLT0gbywgdGhpcy5kcmFnUG9zaXRpb24ueSAtPSBhLCB0aGlzLmRyYWdQb3NpdGlvbi5taWRQb2ludCA9IG47XG4gICAgICAgICAgICAgIH0gZWxzZSB0aGlzLnNldERyYWdSZXNpc3RhbmNlKCk7XG5cbiAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSB7XG4gICAgICAgICAgICAgICAgeDogdGhpcy5kcmFnUG9zaXRpb24ueCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLmRyYWdQb3NpdGlvbi55LFxuICAgICAgICAgICAgICAgIHNjYWxlOiB0aGlzLmRyYWdQb3NpdGlvbi5zY2FsZVxuICAgICAgICAgICAgICB9LCB0aGlzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlbmQ6IChlLCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoXCJwb2ludGVyZG93blwiICE9PSB0aGlzLnN0YXRlKSByZXR1cm47XG4gICAgICAgICAgICBpZiAodGhpcy5fZHJhZ09mZnNldCA9IHsgLi4udGhpcy5kcmFnT2Zmc2V0XG4gICAgICAgICAgICB9LCB0LmN1cnJlbnRQb2ludGVycy5sZW5ndGgpIHJldHVybiB2b2lkIHRoaXMucmVzZXREcmFnUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlID0gXCJkZWNlbFwiLCB0aGlzLmZyaWN0aW9uID0gdGhpcy5vcHRpb24oXCJkZWNlbEZyaWN0aW9uXCIpLCB0aGlzLnJlY2FsY3VsYXRlVHJhbnNmb3JtKCksIHRoaXMuJGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKHRoaXMub3B0aW9uKFwiZHJhZ2dpbmdDbGFzc1wiKSksICExID09PSB0aGlzLnRyaWdnZXIoXCJ0b3VjaEVuZFwiLCBpKSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKFwiZGVjZWxcIiAhPT0gdGhpcy5zdGF0ZSkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgcyA9IHRoaXMub3B0aW9uKFwibWluU2NhbGVcIik7XG4gICAgICAgICAgICBpZiAodGhpcy50cmFuc2Zvcm0uc2NhbGUgPCBzKSByZXR1cm4gdm9pZCB0aGlzLnpvb21UbyhzLCB7XG4gICAgICAgICAgICAgIGZyaWN0aW9uOiAuNjRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgbyA9IHRoaXMub3B0aW9uKFwibWF4U2NhbGVcIik7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zZm9ybS5zY2FsZSAtIG8gPiAuMDEpIHtcbiAgICAgICAgICAgICAgY29uc3QgdCA9IHRoaXMuZHJhZ1Bvc2l0aW9uLm1pZFBvaW50IHx8IGUsXG4gICAgICAgICAgICAgICAgICAgIGkgPSB0aGlzLiRjb250ZW50LmdldENsaWVudFJlY3RzKClbMF07XG4gICAgICAgICAgICAgIHRoaXMuem9vbVRvKG8sIHtcbiAgICAgICAgICAgICAgICBmcmljdGlvbjogLjY0LFxuICAgICAgICAgICAgICAgIHg6IHQuY2xpZW50WCAtIGkubGVmdCxcbiAgICAgICAgICAgICAgICB5OiB0LmNsaWVudFkgLSBpLnRvcFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBvaW50ZXJUcmFja2VyID0gdDtcbiAgICAgIH1cblxuICAgICAgaW5pdE9ic2VydmVyKCkge1xuICAgICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyIHx8ICh0aGlzLnJlc2l6ZU9ic2VydmVyID0gbmV3IG8oKCkgPT4ge1xuICAgICAgICAgIHRoaXMudXBkYXRlVGltZXIgfHwgKHRoaXMudXBkYXRlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHQgPSB0aGlzLiRjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0LndpZHRoICYmIHQuaGVpZ2h0ID8gKChNYXRoLmFicyh0LndpZHRoIC0gdGhpcy5jb250YWluZXIud2lkdGgpID4gMSB8fCBNYXRoLmFicyh0LmhlaWdodCAtIHRoaXMuY29udGFpbmVyLmhlaWdodCkgPiAxKSAmJiAodGhpcy5pc0FuaW1hdGluZygpICYmIHRoaXMuZW5kQW5pbWF0aW9uKCEwKSwgdGhpcy51cGRhdGVNZXRyaWNzKCksIHRoaXMucGFuVG8oe1xuICAgICAgICAgICAgICB4OiB0aGlzLmNvbnRlbnQueCxcbiAgICAgICAgICAgICAgeTogdGhpcy5jb250ZW50LnksXG4gICAgICAgICAgICAgIHNjYWxlOiB0aGlzLm9wdGlvbihcImJhc2VTY2FsZVwiKSxcbiAgICAgICAgICAgICAgZnJpY3Rpb246IDBcbiAgICAgICAgICAgIH0pKSwgdGhpcy51cGRhdGVUaW1lciA9IG51bGwpIDogdGhpcy51cGRhdGVUaW1lciA9IG51bGw7XG4gICAgICAgICAgfSwgdGhpcy51cGRhdGVSYXRlKSk7XG4gICAgICAgIH0pLCB0aGlzLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcy4kY29udGFpbmVyKSk7XG4gICAgICB9XG5cbiAgICAgIHJlc2V0RHJhZ1Bvc2l0aW9uKCkge1xuICAgICAgICB0aGlzLmxvY2tBeGlzID0gbnVsbCwgdGhpcy5mcmljdGlvbiA9IHRoaXMub3B0aW9uKFwiZnJpY3Rpb25cIiksIHRoaXMudmVsb2NpdHkgPSB7XG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwLFxuICAgICAgICAgIHNjYWxlOiAwXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICB4OiB0LFxuICAgICAgICAgIHk6IGUsXG4gICAgICAgICAgc2NhbGU6IGlcbiAgICAgICAgfSA9IHRoaXMuY29udGVudDtcbiAgICAgICAgdGhpcy5kcmFnU3RhcnQgPSB7XG4gICAgICAgICAgcmVjdDogdGhpcy4kY29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICB4OiB0LFxuICAgICAgICAgIHk6IGUsXG4gICAgICAgICAgc2NhbGU6IGlcbiAgICAgICAgfSwgdGhpcy5kcmFnUG9zaXRpb24gPSB7IC4uLnRoaXMuZHJhZ1Bvc2l0aW9uLFxuICAgICAgICAgIHg6IHQsXG4gICAgICAgICAgeTogZSxcbiAgICAgICAgICBzY2FsZTogaVxuICAgICAgICB9LCB0aGlzLmRyYWdPZmZzZXQgPSB7XG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwLFxuICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgIHRpbWU6IDBcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlTWV0cmljcyh0KSB7XG4gICAgICAgICEwICE9PSB0ICYmIHRoaXMudHJpZ2dlcihcImJlZm9yZVVwZGF0ZVwiKTtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMuJGNvbnRhaW5lcixcbiAgICAgICAgICAgICAgcyA9IHRoaXMuJGNvbnRlbnQsXG4gICAgICAgICAgICAgIG8gPSB0aGlzLiR2aWV3cG9ydCxcbiAgICAgICAgICAgICAgbiA9IHMgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50LFxuICAgICAgICAgICAgICBhID0gdGhpcy5vcHRpb24oXCJ6b29tXCIpLFxuICAgICAgICAgICAgICByID0gdGhpcy5vcHRpb24oXCJyZXNpemVQYXJlbnRcIiwgYSk7XG4gICAgICAgIGxldCBoID0gdGhpcy5vcHRpb24oXCJ3aWR0aFwiKSxcbiAgICAgICAgICAgIGwgPSB0aGlzLm9wdGlvbihcImhlaWdodFwiKSxcbiAgICAgICAgICAgIGMgPSBoIHx8IChkID0gcywgTWF0aC5tYXgocGFyc2VGbG9hdChkLm5hdHVyYWxXaWR0aCB8fCAwKSwgcGFyc2VGbG9hdChkLndpZHRoICYmIGQud2lkdGguYmFzZVZhbCAmJiBkLndpZHRoLmJhc2VWYWwudmFsdWUgfHwgMCksIHBhcnNlRmxvYXQoZC5vZmZzZXRXaWR0aCB8fCAwKSwgcGFyc2VGbG9hdChkLnNjcm9sbFdpZHRoIHx8IDApKSk7XG4gICAgICAgIHZhciBkO1xuXG4gICAgICAgIGxldCB1ID0gbCB8fCAodCA9PiBNYXRoLm1heChwYXJzZUZsb2F0KHQubmF0dXJhbEhlaWdodCB8fCAwKSwgcGFyc2VGbG9hdCh0LmhlaWdodCAmJiB0LmhlaWdodC5iYXNlVmFsICYmIHQuaGVpZ2h0LmJhc2VWYWwudmFsdWUgfHwgMCksIHBhcnNlRmxvYXQodC5vZmZzZXRIZWlnaHQgfHwgMCksIHBhcnNlRmxvYXQodC5zY3JvbGxIZWlnaHQgfHwgMCkpKShzKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHMuc3R5bGUsIHtcbiAgICAgICAgICB3aWR0aDogaCA/IGAke2h9cHhgIDogXCJcIixcbiAgICAgICAgICBoZWlnaHQ6IGwgPyBgJHtsfXB4YCA6IFwiXCIsXG4gICAgICAgICAgbWF4V2lkdGg6IFwiXCIsXG4gICAgICAgICAgbWF4SGVpZ2h0OiBcIlwiXG4gICAgICAgIH0pLCByICYmIE9iamVjdC5hc3NpZ24oby5zdHlsZSwge1xuICAgICAgICAgIHdpZHRoOiBcIlwiLFxuICAgICAgICAgIGhlaWdodDogXCJcIlxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZiA9IHRoaXMub3B0aW9uKFwicmF0aW9cIik7XG4gICAgICAgIGMgPSBpKGMgKiBmKSwgdSA9IGkodSAqIGYpLCBoID0gYywgbCA9IHU7XG4gICAgICAgIGNvbnN0IGcgPSBzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgICBwID0gby5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgbSA9IG8gPT0gZSA/IHAgOiBlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeSA9IE1hdGgubWF4KG8ub2Zmc2V0V2lkdGgsIGkocC53aWR0aCkpLFxuICAgICAgICAgICAgdiA9IE1hdGgubWF4KG8ub2Zmc2V0SGVpZ2h0LCBpKHAuaGVpZ2h0KSksXG4gICAgICAgICAgICBiID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobyk7XG5cbiAgICAgICAgaWYgKHkgLT0gcGFyc2VGbG9hdChiLnBhZGRpbmdMZWZ0KSArIHBhcnNlRmxvYXQoYi5wYWRkaW5nUmlnaHQpLCB2IC09IHBhcnNlRmxvYXQoYi5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoYi5wYWRkaW5nQm90dG9tKSwgdGhpcy52aWV3cG9ydC53aWR0aCA9IHksIHRoaXMudmlld3BvcnQuaGVpZ2h0ID0gdiwgYSkge1xuICAgICAgICAgIGlmIChNYXRoLmFicyhjIC0gZy53aWR0aCkgPiAuMSB8fCBNYXRoLmFicyh1IC0gZy5oZWlnaHQpID4gLjEpIHtcbiAgICAgICAgICAgIGNvbnN0IHQgPSAoKHQsIGUsIGksIHMpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgbyA9IE1hdGgubWluKGkgLyB0IHx8IDAsIHMgLyBlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogdCAqIG8gfHwgMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGUgKiBvIHx8IDBcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKGMsIHUsIE1hdGgubWluKGMsIGcud2lkdGgpLCBNYXRoLm1pbih1LCBnLmhlaWdodCkpO1xuXG4gICAgICAgICAgICBoID0gaSh0LndpZHRoKSwgbCA9IGkodC5oZWlnaHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocy5zdHlsZSwge1xuICAgICAgICAgICAgd2lkdGg6IGAke2h9cHhgLFxuICAgICAgICAgICAgaGVpZ2h0OiBgJHtsfXB4YCxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogXCJcIlxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHIgJiYgKE9iamVjdC5hc3NpZ24oby5zdHlsZSwge1xuICAgICAgICAgIHdpZHRoOiBgJHtofXB4YCxcbiAgICAgICAgICBoZWlnaHQ6IGAke2x9cHhgXG4gICAgICAgIH0pLCB0aGlzLnZpZXdwb3J0ID0geyAuLi50aGlzLnZpZXdwb3J0LFxuICAgICAgICAgIHdpZHRoOiBoLFxuICAgICAgICAgIGhlaWdodDogbFxuICAgICAgICB9KSwgbiAmJiBhICYmIFwiZnVuY3Rpb25cIiAhPSB0eXBlb2YgdGhpcy5vcHRpb25zLm1heFNjYWxlKSB7XG4gICAgICAgICAgY29uc3QgdCA9IHRoaXMub3B0aW9uKFwibWF4U2NhbGVcIik7XG5cbiAgICAgICAgICB0aGlzLm9wdGlvbnMubWF4U2NhbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50Lm9yaWdXaWR0aCA+IDAgJiYgdGhpcy5jb250ZW50LmZpdFdpZHRoID4gMCA/IHRoaXMuY29udGVudC5vcmlnV2lkdGggLyB0aGlzLmNvbnRlbnQuZml0V2lkdGggOiB0O1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbnRlbnQgPSB7IC4uLnRoaXMuY29udGVudCxcbiAgICAgICAgICBvcmlnV2lkdGg6IGMsXG4gICAgICAgICAgb3JpZ0hlaWdodDogdSxcbiAgICAgICAgICBmaXRXaWR0aDogaCxcbiAgICAgICAgICBmaXRIZWlnaHQ6IGwsXG4gICAgICAgICAgd2lkdGg6IGgsXG4gICAgICAgICAgaGVpZ2h0OiBsLFxuICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgIGlzWm9vbWFibGU6IGFcbiAgICAgICAgfSwgdGhpcy5jb250YWluZXIgPSB7XG4gICAgICAgICAgd2lkdGg6IG0ud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBtLmhlaWdodFxuICAgICAgICB9LCAhMCAhPT0gdCAmJiB0aGlzLnRyaWdnZXIoXCJhZnRlclVwZGF0ZVwiKTtcbiAgICAgIH1cblxuICAgICAgem9vbUluKHQpIHtcbiAgICAgICAgdGhpcy56b29tVG8odGhpcy5jb250ZW50LnNjYWxlICsgKHQgfHwgdGhpcy5vcHRpb24oXCJzdGVwXCIpKSk7XG4gICAgICB9XG5cbiAgICAgIHpvb21PdXQodCkge1xuICAgICAgICB0aGlzLnpvb21Ubyh0aGlzLmNvbnRlbnQuc2NhbGUgLSAodCB8fCB0aGlzLm9wdGlvbihcInN0ZXBcIikpKTtcbiAgICAgIH1cblxuICAgICAgdG9nZ2xlWm9vbSh0ID0ge30pIHtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMub3B0aW9uKFwibWF4U2NhbGVcIiksXG4gICAgICAgICAgICAgIGkgPSB0aGlzLm9wdGlvbihcImJhc2VTY2FsZVwiKSxcbiAgICAgICAgICAgICAgcyA9IHRoaXMuY29udGVudC5zY2FsZSA+IGkgKyAuNSAqIChlIC0gaSkgPyBpIDogZTtcbiAgICAgICAgdGhpcy56b29tVG8ocywgdCk7XG4gICAgICB9XG5cbiAgICAgIHpvb21Ubyh0ID0gdGhpcy5vcHRpb24oXCJiYXNlU2NhbGVcIiksIHtcbiAgICAgICAgeDogZSA9IG51bGwsXG4gICAgICAgIHk6IHMgPSBudWxsXG4gICAgICB9ID0ge30pIHtcbiAgICAgICAgdCA9IE1hdGgubWF4KE1hdGgubWluKHQsIHRoaXMub3B0aW9uKFwibWF4U2NhbGVcIikpLCB0aGlzLm9wdGlvbihcIm1pblNjYWxlXCIpKTtcbiAgICAgICAgY29uc3QgbyA9IGkodGhpcy5jb250ZW50LnNjYWxlIC8gKHRoaXMuY29udGVudC53aWR0aCAvIHRoaXMuY29udGVudC5maXRXaWR0aCksIDFlNyk7XG4gICAgICAgIG51bGwgPT09IGUgJiYgKGUgPSB0aGlzLmNvbnRlbnQud2lkdGggKiBvICogLjUpLCBudWxsID09PSBzICYmIChzID0gdGhpcy5jb250ZW50LmhlaWdodCAqIG8gKiAuNSk7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBkZWx0YVg6IG4sXG4gICAgICAgICAgZGVsdGFZOiBhXG4gICAgICAgIH0gPSB0aGlzLmdldFpvb21EZWx0YSh0LCBlLCBzKTtcbiAgICAgICAgZSA9IHRoaXMuY29udGVudC54IC0gbiwgcyA9IHRoaXMuY29udGVudC55IC0gYSwgdGhpcy5wYW5Ubyh7XG4gICAgICAgICAgeDogZSxcbiAgICAgICAgICB5OiBzLFxuICAgICAgICAgIHNjYWxlOiB0LFxuICAgICAgICAgIGZyaWN0aW9uOiB0aGlzLm9wdGlvbihcInpvb21GcmljdGlvblwiKVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZ2V0Wm9vbURlbHRhKHQsIGUgPSAwLCBpID0gMCkge1xuICAgICAgICBjb25zdCBzID0gdGhpcy5jb250ZW50LmZpdFdpZHRoICogdGhpcy5jb250ZW50LnNjYWxlLFxuICAgICAgICAgICAgICBvID0gdGhpcy5jb250ZW50LmZpdEhlaWdodCAqIHRoaXMuY29udGVudC5zY2FsZSxcbiAgICAgICAgICAgICAgbiA9IGUgPiAwICYmIHMgPyBlIC8gcyA6IDAsXG4gICAgICAgICAgICAgIGEgPSBpID4gMCAmJiBvID8gaSAvIG8gOiAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGRlbHRhWDogKHRoaXMuY29udGVudC5maXRXaWR0aCAqIHQgLSBzKSAqIG4sXG4gICAgICAgICAgZGVsdGFZOiAodGhpcy5jb250ZW50LmZpdEhlaWdodCAqIHQgLSBvKSAqIGFcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcGFuVG8oe1xuICAgICAgICB4OiB0ID0gdGhpcy5jb250ZW50LngsXG4gICAgICAgIHk6IGUgPSB0aGlzLmNvbnRlbnQueSxcbiAgICAgICAgc2NhbGU6IGksXG4gICAgICAgIGZyaWN0aW9uOiBzID0gdGhpcy5vcHRpb24oXCJmcmljdGlvblwiKSxcbiAgICAgICAgaWdub3JlQm91bmRzOiBvID0gITFcbiAgICAgIH0gPSB7fSkge1xuICAgICAgICBpZiAoaSA9IGkgfHwgdGhpcy5jb250ZW50LnNjYWxlIHx8IDEsICFvKSB7XG4gICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgYm91bmRYOiBzLFxuICAgICAgICAgICAgYm91bmRZOiBvXG4gICAgICAgICAgfSA9IHRoaXMuZ2V0Qm91bmRzKGkpO1xuICAgICAgICAgIHMgJiYgKHQgPSBNYXRoLm1heChNYXRoLm1pbih0LCBzLnRvKSwgcy5mcm9tKSksIG8gJiYgKGUgPSBNYXRoLm1heChNYXRoLm1pbihlLCBvLnRvKSwgby5mcm9tKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZyaWN0aW9uID0gcywgdGhpcy50cmFuc2Zvcm0gPSB7IC4uLnRoaXMudHJhbnNmb3JtLFxuICAgICAgICAgIHg6IHQsXG4gICAgICAgICAgeTogZSxcbiAgICAgICAgICBzY2FsZTogaVxuICAgICAgICB9LCBzID8gKHRoaXMuc3RhdGUgPSBcInBhbm5pbmdcIiwgdGhpcy52ZWxvY2l0eSA9IHtcbiAgICAgICAgICB4OiAoMSAvIHRoaXMuZnJpY3Rpb24gLSAxKSAqICh0IC0gdGhpcy5jb250ZW50LngpLFxuICAgICAgICAgIHk6ICgxIC8gdGhpcy5mcmljdGlvbiAtIDEpICogKGUgLSB0aGlzLmNvbnRlbnQueSksXG4gICAgICAgICAgc2NhbGU6ICgxIC8gdGhpcy5mcmljdGlvbiAtIDEpICogKGkgLSB0aGlzLmNvbnRlbnQuc2NhbGUpXG4gICAgICAgIH0sIHRoaXMuc3RhcnRBbmltYXRpb24oKSkgOiB0aGlzLmVuZEFuaW1hdGlvbigpO1xuICAgICAgfVxuXG4gICAgICBzdGFydEFuaW1hdGlvbigpIHtcbiAgICAgICAgdGhpcy5yQUYgPyBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLnJBRikgOiB0aGlzLnRyaWdnZXIoXCJzdGFydEFuaW1hdGlvblwiKSwgdGhpcy5yQUYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hbmltYXRlKCkpO1xuICAgICAgfVxuXG4gICAgICBhbmltYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5zZXRFZGdlRm9yY2UoKSwgdGhpcy5zZXREcmFnRm9yY2UoKSwgdGhpcy52ZWxvY2l0eS54ICo9IHRoaXMuZnJpY3Rpb24sIHRoaXMudmVsb2NpdHkueSAqPSB0aGlzLmZyaWN0aW9uLCB0aGlzLnZlbG9jaXR5LnNjYWxlICo9IHRoaXMuZnJpY3Rpb24sIHRoaXMuY29udGVudC54ICs9IHRoaXMudmVsb2NpdHkueCwgdGhpcy5jb250ZW50LnkgKz0gdGhpcy52ZWxvY2l0eS55LCB0aGlzLmNvbnRlbnQuc2NhbGUgKz0gdGhpcy52ZWxvY2l0eS5zY2FsZSwgdGhpcy5pc0FuaW1hdGluZygpKSB0aGlzLnNldFRyYW5zZm9ybSgpO2Vsc2UgaWYgKFwicG9pbnRlcmRvd25cIiAhPT0gdGhpcy5zdGF0ZSkgcmV0dXJuIHZvaWQgdGhpcy5lbmRBbmltYXRpb24oKTtcbiAgICAgICAgdGhpcy5yQUYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5hbmltYXRlKCkpO1xuICAgICAgfVxuXG4gICAgICBnZXRCb3VuZHModCkge1xuICAgICAgICBsZXQgZSA9IHRoaXMuYm91bmRYLFxuICAgICAgICAgICAgcyA9IHRoaXMuYm91bmRZO1xuICAgICAgICBpZiAodm9pZCAwICE9PSBlICYmIHZvaWQgMCAhPT0gcykgcmV0dXJuIHtcbiAgICAgICAgICBib3VuZFg6IGUsXG4gICAgICAgICAgYm91bmRZOiBzXG4gICAgICAgIH07XG4gICAgICAgIGUgPSB7XG4gICAgICAgICAgZnJvbTogMCxcbiAgICAgICAgICB0bzogMFxuICAgICAgICB9LCBzID0ge1xuICAgICAgICAgIGZyb206IDAsXG4gICAgICAgICAgdG86IDBcbiAgICAgICAgfSwgdCA9IHQgfHwgdGhpcy50cmFuc2Zvcm0uc2NhbGU7XG4gICAgICAgIGNvbnN0IG8gPSB0aGlzLmNvbnRlbnQuZml0V2lkdGggKiB0LFxuICAgICAgICAgICAgICBuID0gdGhpcy5jb250ZW50LmZpdEhlaWdodCAqIHQsXG4gICAgICAgICAgICAgIGEgPSB0aGlzLnZpZXdwb3J0LndpZHRoLFxuICAgICAgICAgICAgICByID0gdGhpcy52aWV3cG9ydC5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKG8gPCBhKSB7XG4gICAgICAgICAgY29uc3QgdCA9IGkoLjUgKiAoYSAtIG8pKTtcbiAgICAgICAgICBlLmZyb20gPSB0LCBlLnRvID0gdDtcbiAgICAgICAgfSBlbHNlIGUuZnJvbSA9IGkoYSAtIG8pO1xuXG4gICAgICAgIGlmIChuIDwgcikge1xuICAgICAgICAgIGNvbnN0IHQgPSAuNSAqIChyIC0gbik7XG4gICAgICAgICAgcy5mcm9tID0gdCwgcy50byA9IHQ7XG4gICAgICAgIH0gZWxzZSBzLmZyb20gPSBpKHIgLSBuKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGJvdW5kWDogZSxcbiAgICAgICAgICBib3VuZFk6IHNcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgc2V0RWRnZUZvcmNlKCkge1xuICAgICAgICBpZiAoXCJkZWNlbFwiICE9PSB0aGlzLnN0YXRlKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLm9wdGlvbihcImJvdW5jZUZvcmNlXCIpLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgYm91bmRYOiBlLFxuICAgICAgICAgIGJvdW5kWTogaVxuICAgICAgICB9ID0gdGhpcy5nZXRCb3VuZHMoTWF0aC5tYXgodGhpcy50cmFuc2Zvcm0uc2NhbGUsIHRoaXMuY29udGVudC5zY2FsZSkpO1xuICAgICAgICBsZXQgcywgbywgbiwgYTtcblxuICAgICAgICBpZiAoZSAmJiAocyA9IHRoaXMuY29udGVudC54IDwgZS5mcm9tLCBvID0gdGhpcy5jb250ZW50LnggPiBlLnRvKSwgaSAmJiAobiA9IHRoaXMuY29udGVudC55IDwgaS5mcm9tLCBhID0gdGhpcy5jb250ZW50LnkgPiBpLnRvKSwgcyB8fCBvKSB7XG4gICAgICAgICAgbGV0IGkgPSAoKHMgPyBlLmZyb20gOiBlLnRvKSAtIHRoaXMuY29udGVudC54KSAqIHQ7XG4gICAgICAgICAgY29uc3QgbyA9IHRoaXMuY29udGVudC54ICsgKHRoaXMudmVsb2NpdHkueCArIGkpIC8gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICBvID49IGUuZnJvbSAmJiBvIDw9IGUudG8gJiYgKGkgKz0gdGhpcy52ZWxvY2l0eS54KSwgdGhpcy52ZWxvY2l0eS54ID0gaSwgdGhpcy5yZWNhbGN1bGF0ZVRyYW5zZm9ybSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG4gfHwgYSkge1xuICAgICAgICAgIGxldCBlID0gKChuID8gaS5mcm9tIDogaS50bykgLSB0aGlzLmNvbnRlbnQueSkgKiB0O1xuICAgICAgICAgIGNvbnN0IHMgPSB0aGlzLmNvbnRlbnQueSArIChlICsgdGhpcy52ZWxvY2l0eS55KSAvIHRoaXMuZnJpY3Rpb247XG4gICAgICAgICAgcyA+PSBpLmZyb20gJiYgcyA8PSBpLnRvICYmIChlICs9IHRoaXMudmVsb2NpdHkueSksIHRoaXMudmVsb2NpdHkueSA9IGUsIHRoaXMucmVjYWxjdWxhdGVUcmFuc2Zvcm0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZXREcmFnUmVzaXN0YW5jZSgpIHtcbiAgICAgICAgaWYgKFwicG9pbnRlcmRvd25cIiAhPT0gdGhpcy5zdGF0ZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgYm91bmRYOiB0LFxuICAgICAgICAgIGJvdW5kWTogZVxuICAgICAgICB9ID0gdGhpcy5nZXRCb3VuZHModGhpcy5kcmFnUG9zaXRpb24uc2NhbGUpO1xuICAgICAgICBsZXQgaSwgcywgbywgbjtcblxuICAgICAgICBpZiAodCAmJiAoaSA9IHRoaXMuZHJhZ1Bvc2l0aW9uLnggPCB0LmZyb20sIHMgPSB0aGlzLmRyYWdQb3NpdGlvbi54ID4gdC50byksIGUgJiYgKG8gPSB0aGlzLmRyYWdQb3NpdGlvbi55IDwgZS5mcm9tLCBuID0gdGhpcy5kcmFnUG9zaXRpb24ueSA+IGUudG8pLCAoaSB8fCBzKSAmJiAoIWkgfHwgIXMpKSB7XG4gICAgICAgICAgY29uc3QgZSA9IGkgPyB0LmZyb20gOiB0LnRvLFxuICAgICAgICAgICAgICAgIHMgPSBlIC0gdGhpcy5kcmFnUG9zaXRpb24ueDtcbiAgICAgICAgICB0aGlzLmRyYWdQb3NpdGlvbi54ID0gZSAtIC4zICogcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgobyB8fCBuKSAmJiAoIW8gfHwgIW4pKSB7XG4gICAgICAgICAgY29uc3QgdCA9IG8gPyBlLmZyb20gOiBlLnRvLFxuICAgICAgICAgICAgICAgIGkgPSB0IC0gdGhpcy5kcmFnUG9zaXRpb24ueTtcbiAgICAgICAgICB0aGlzLmRyYWdQb3NpdGlvbi55ID0gdCAtIC4zICogaTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzZXREcmFnRm9yY2UoKSB7XG4gICAgICAgIFwicG9pbnRlcmRvd25cIiA9PT0gdGhpcy5zdGF0ZSAmJiAodGhpcy52ZWxvY2l0eS54ID0gdGhpcy5kcmFnUG9zaXRpb24ueCAtIHRoaXMuY29udGVudC54LCB0aGlzLnZlbG9jaXR5LnkgPSB0aGlzLmRyYWdQb3NpdGlvbi55IC0gdGhpcy5jb250ZW50LnksIHRoaXMudmVsb2NpdHkuc2NhbGUgPSB0aGlzLmRyYWdQb3NpdGlvbi5zY2FsZSAtIHRoaXMuY29udGVudC5zY2FsZSk7XG4gICAgICB9XG5cbiAgICAgIHJlY2FsY3VsYXRlVHJhbnNmb3JtKCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybS54ID0gdGhpcy5jb250ZW50LnggKyB0aGlzLnZlbG9jaXR5LnggLyAoMSAvIHRoaXMuZnJpY3Rpb24gLSAxKSwgdGhpcy50cmFuc2Zvcm0ueSA9IHRoaXMuY29udGVudC55ICsgdGhpcy52ZWxvY2l0eS55IC8gKDEgLyB0aGlzLmZyaWN0aW9uIC0gMSksIHRoaXMudHJhbnNmb3JtLnNjYWxlID0gdGhpcy5jb250ZW50LnNjYWxlICsgdGhpcy52ZWxvY2l0eS5zY2FsZSAvICgxIC8gdGhpcy5mcmljdGlvbiAtIDEpO1xuICAgICAgfVxuXG4gICAgICBpc0FuaW1hdGluZygpIHtcbiAgICAgICAgcmV0dXJuICEoIXRoaXMuZnJpY3Rpb24gfHwgIShNYXRoLmFicyh0aGlzLnZlbG9jaXR5LngpID4gLjA1IHx8IE1hdGguYWJzKHRoaXMudmVsb2NpdHkueSkgPiAuMDUgfHwgTWF0aC5hYnModGhpcy52ZWxvY2l0eS5zY2FsZSkgPiAuMDUpKTtcbiAgICAgIH1cblxuICAgICAgc2V0VHJhbnNmb3JtKHQpIHtcbiAgICAgICAgbGV0IGUsIHMsIG87XG5cbiAgICAgICAgaWYgKHQgPyAoZSA9IGkodGhpcy50cmFuc2Zvcm0ueCksIHMgPSBpKHRoaXMudHJhbnNmb3JtLnkpLCBvID0gdGhpcy50cmFuc2Zvcm0uc2NhbGUsIHRoaXMuY29udGVudCA9IHsgLi4udGhpcy5jb250ZW50LFxuICAgICAgICAgIHg6IGUsXG4gICAgICAgICAgeTogcyxcbiAgICAgICAgICBzY2FsZTogb1xuICAgICAgICB9KSA6IChlID0gaSh0aGlzLmNvbnRlbnQueCksIHMgPSBpKHRoaXMuY29udGVudC55KSwgbyA9IHRoaXMuY29udGVudC5zY2FsZSAvICh0aGlzLmNvbnRlbnQud2lkdGggLyB0aGlzLmNvbnRlbnQuZml0V2lkdGgpLCB0aGlzLmNvbnRlbnQgPSB7IC4uLnRoaXMuY29udGVudCxcbiAgICAgICAgICB4OiBlLFxuICAgICAgICAgIHk6IHNcbiAgICAgICAgfSksIHRoaXMudHJpZ2dlcihcImJlZm9yZVRyYW5zZm9ybVwiKSwgZSA9IGkodGhpcy5jb250ZW50LngpLCBzID0gaSh0aGlzLmNvbnRlbnQueSksIHQgJiYgdGhpcy5vcHRpb24oXCJ6b29tXCIpKSB7XG4gICAgICAgICAgbGV0IHQsIG47XG4gICAgICAgICAgdCA9IGkodGhpcy5jb250ZW50LmZpdFdpZHRoICogbyksIG4gPSBpKHRoaXMuY29udGVudC5maXRIZWlnaHQgKiBvKSwgdGhpcy5jb250ZW50LndpZHRoID0gdCwgdGhpcy5jb250ZW50LmhlaWdodCA9IG4sIHRoaXMudHJhbnNmb3JtID0geyAuLi50aGlzLnRyYW5zZm9ybSxcbiAgICAgICAgICAgIHdpZHRoOiB0LFxuICAgICAgICAgICAgaGVpZ2h0OiBuLFxuICAgICAgICAgICAgc2NhbGU6IG9cbiAgICAgICAgICB9LCBPYmplY3QuYXNzaWduKHRoaXMuJGNvbnRlbnQuc3R5bGUsIHtcbiAgICAgICAgICAgIHdpZHRoOiBgJHt0fXB4YCxcbiAgICAgICAgICAgIGhlaWdodDogYCR7bn1weGAsXG4gICAgICAgICAgICBtYXhXaWR0aDogXCJub25lXCIsXG4gICAgICAgICAgICBtYXhIZWlnaHQ6IFwibm9uZVwiLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlM2QoJHtlfXB4LCAke3N9cHgsIDApIHNjYWxlKDEpYFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgdGhpcy4kY29udGVudC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlM2QoJHtlfXB4LCAke3N9cHgsIDApIHNjYWxlKCR7b30pYDtcblxuICAgICAgICB0aGlzLnRyaWdnZXIoXCJhZnRlclRyYW5zZm9ybVwiKTtcbiAgICAgIH1cblxuICAgICAgZW5kQW5pbWF0aW9uKHQpIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yQUYpLCB0aGlzLnJBRiA9IG51bGwsIHRoaXMudmVsb2NpdHkgPSB7XG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwLFxuICAgICAgICAgIHNjYWxlOiAwXG4gICAgICAgIH0sIHRoaXMuc2V0VHJhbnNmb3JtKCEwKSwgdGhpcy5zdGF0ZSA9IFwicmVhZHlcIiwgdGhpcy5oYW5kbGVDdXJzb3IoKSwgITAgIT09IHQgJiYgdGhpcy50cmlnZ2VyKFwiZW5kQW5pbWF0aW9uXCIpO1xuICAgICAgfVxuXG4gICAgICBoYW5kbGVDdXJzb3IoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLm9wdGlvbihcImRyYWdnYWJsZUNsYXNzXCIpO1xuICAgICAgICB0ICYmIHRoaXMub3B0aW9uKFwidG91Y2hcIikgJiYgKDEgPT0gdGhpcy5vcHRpb24oXCJwYW5Pbmx5Wm9vbWVkXCIpICYmIHRoaXMuY29udGVudC53aWR0aCA8PSB0aGlzLnZpZXdwb3J0LndpZHRoICYmIHRoaXMuY29udGVudC5oZWlnaHQgPD0gdGhpcy52aWV3cG9ydC5oZWlnaHQgJiYgdGhpcy50cmFuc2Zvcm0uc2NhbGUgPD0gdGhpcy5vcHRpb24oXCJiYXNlU2NhbGVcIikgPyB0aGlzLiRjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSh0KSA6IHRoaXMuJGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKHQpKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoRXZlbnRzKCkge1xuICAgICAgICB0aGlzLiRjb250ZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIHRoaXMub25Mb2FkKSwgdGhpcy4kY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCB0aGlzLm9uV2hlZWwsIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy4kY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm9uQ2xpY2ssIHtcbiAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICB9KSwgdGhpcy5wb2ludGVyVHJhY2tlciAmJiAodGhpcy5wb2ludGVyVHJhY2tlci5zdG9wKCksIHRoaXMucG9pbnRlclRyYWNrZXIgPSBudWxsKSwgdGhpcy5yZXNpemVPYnNlcnZlciAmJiAodGhpcy5yZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KCksIHRoaXMucmVzaXplT2JzZXJ2ZXIgPSBudWxsKTtcbiAgICAgIH1cblxuICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgXCJkZXN0cm95XCIgIT09IHRoaXMuc3RhdGUgJiYgKHRoaXMuc3RhdGUgPSBcImRlc3Ryb3lcIiwgY2xlYXJUaW1lb3V0KHRoaXMudXBkYXRlVGltZXIpLCB0aGlzLnVwZGF0ZVRpbWVyID0gbnVsbCwgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5yQUYpLCB0aGlzLnJBRiA9IG51bGwsIHRoaXMuZGV0YWNoRXZlbnRzKCksIHRoaXMuZGV0YWNoUGx1Z2lucygpLCB0aGlzLnJlc2V0RHJhZ1Bvc2l0aW9uKCkpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgZC52ZXJzaW9uID0gXCI0LjAuMzFcIiwgZC5QbHVnaW5zID0ge307XG5cbiAgICBjb25zdCB1ID0gKHQsIGUpID0+IHtcbiAgICAgIGxldCBpID0gMDtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4ucykge1xuICAgICAgICBjb25zdCBvID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIGlmICghKG8gLSBpIDwgZSkpIHJldHVybiBpID0gbywgdCguLi5zKTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGNsYXNzIGYge1xuICAgICAgY29uc3RydWN0b3IodCkge1xuICAgICAgICB0aGlzLiRjb250YWluZXIgPSBudWxsLCB0aGlzLiRwcmV2ID0gbnVsbCwgdGhpcy4kbmV4dCA9IG51bGwsIHRoaXMuY2Fyb3VzZWwgPSB0LCB0aGlzLm9uUmVmcmVzaCA9IHRoaXMub25SZWZyZXNoLmJpbmQodGhpcyk7XG4gICAgICB9XG5cbiAgICAgIG9wdGlvbih0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhcm91c2VsLm9wdGlvbihgTmF2aWdhdGlvbi4ke3R9YCk7XG4gICAgICB9XG5cbiAgICAgIGNyZWF0ZUJ1dHRvbih0KSB7XG4gICAgICAgIGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO1xuICAgICAgICBlLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIHRoaXMuY2Fyb3VzZWwubG9jYWxpemUoYHt7JHt0LnRvVXBwZXJDYXNlKCl9fX1gKSk7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLm9wdGlvbihcImNsYXNzTmFtZXMuYnV0dG9uXCIpICsgXCIgXCIgKyB0aGlzLm9wdGlvbihgY2xhc3NOYW1lcy4ke3R9YCk7XG4gICAgICAgIHJldHVybiBlLmNsYXNzTGlzdC5hZGQoLi4uaS5zcGxpdChcIiBcIikpLCBlLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiMFwiKSwgZS5pbm5lckhUTUwgPSB0aGlzLmNhcm91c2VsLmxvY2FsaXplKHRoaXMub3B0aW9uKGAke3R9VHBsYCkpLCBlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBlID0+IHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCksIGUuc3RvcFByb3BhZ2F0aW9uKCksIHRoaXMuY2Fyb3VzZWxbXCJzbGlkZVwiICsgKFwibmV4dFwiID09PSB0ID8gXCJOZXh0XCIgOiBcIlByZXZcIildKCk7XG4gICAgICAgIH0pLCBlO1xuICAgICAgfVxuXG4gICAgICBidWlsZCgpIHtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyIHx8ICh0aGlzLiRjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLCB0aGlzLiRjb250YWluZXIuY2xhc3NMaXN0LmFkZCguLi50aGlzLm9wdGlvbihcImNsYXNzTmFtZXMubWFpblwiKS5zcGxpdChcIiBcIikpLCB0aGlzLmNhcm91c2VsLiRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy4kY29udGFpbmVyKSksIHRoaXMuJG5leHQgfHwgKHRoaXMuJG5leHQgPSB0aGlzLmNyZWF0ZUJ1dHRvbihcIm5leHRcIiksIHRoaXMuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLiRuZXh0KSksIHRoaXMuJHByZXYgfHwgKHRoaXMuJHByZXYgPSB0aGlzLmNyZWF0ZUJ1dHRvbihcInByZXZcIiksIHRoaXMuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLiRwcmV2KSk7XG4gICAgICB9XG5cbiAgICAgIG9uUmVmcmVzaCgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuY2Fyb3VzZWwucGFnZXMubGVuZ3RoO1xuICAgICAgICB0IDw9IDEgfHwgdCA+IDEgJiYgdGhpcy5jYXJvdXNlbC5lbGVtRGltV2lkdGggPCB0aGlzLmNhcm91c2VsLndyYXBEaW1XaWR0aCAmJiAhTnVtYmVyLmlzSW50ZWdlcih0aGlzLmNhcm91c2VsLm9wdGlvbihcInNsaWRlc1BlclBhZ2VcIikpID8gdGhpcy5jbGVhbnVwKCkgOiAodGhpcy5idWlsZCgpLCB0aGlzLiRwcmV2LnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpLCB0aGlzLiRuZXh0LnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpLCB0aGlzLmNhcm91c2VsLm9wdGlvbihcImluZmluaXRlWFwiLCB0aGlzLmNhcm91c2VsLm9wdGlvbihcImluZmluaXRlXCIpKSB8fCAodGhpcy5jYXJvdXNlbC5wYWdlIDw9IDAgJiYgdGhpcy4kcHJldi5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcIlwiKSwgdGhpcy5jYXJvdXNlbC5wYWdlID49IHQgLSAxICYmIHRoaXMuJG5leHQuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJcIikpKTtcbiAgICAgIH1cblxuICAgICAgY2xlYW51cCgpIHtcbiAgICAgICAgdGhpcy4kcHJldiAmJiB0aGlzLiRwcmV2LnJlbW92ZSgpLCB0aGlzLiRwcmV2ID0gbnVsbCwgdGhpcy4kbmV4dCAmJiB0aGlzLiRuZXh0LnJlbW92ZSgpLCB0aGlzLiRuZXh0ID0gbnVsbCwgdGhpcy4kY29udGFpbmVyICYmIHRoaXMuJGNvbnRhaW5lci5yZW1vdmUoKSwgdGhpcy4kY29udGFpbmVyID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgYXR0YWNoKCkge1xuICAgICAgICB0aGlzLmNhcm91c2VsLm9uKFwicmVmcmVzaCBjaGFuZ2VcIiwgdGhpcy5vblJlZnJlc2gpO1xuICAgICAgfVxuXG4gICAgICBkZXRhY2goKSB7XG4gICAgICAgIHRoaXMuY2Fyb3VzZWwub2ZmKFwicmVmcmVzaCBjaGFuZ2VcIiwgdGhpcy5vblJlZnJlc2gpLCB0aGlzLmNsZWFudXAoKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGYuZGVmYXVsdHMgPSB7XG4gICAgICBwcmV2VHBsOiAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIHRhYmluZGV4PVwiLTFcIj48cGF0aCBkPVwiTTE1IDNsLTkgOSA5IDlcIi8+PC9zdmc+JyxcbiAgICAgIG5leHRUcGw6ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgdGFiaW5kZXg9XCItMVwiPjxwYXRoIGQ9XCJNOSAzbDkgOS05IDlcIi8+PC9zdmc+JyxcbiAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgbWFpbjogXCJjYXJvdXNlbF9fbmF2XCIsXG4gICAgICAgIGJ1dHRvbjogXCJjYXJvdXNlbF9fYnV0dG9uXCIsXG4gICAgICAgIG5leHQ6IFwiaXMtbmV4dFwiLFxuICAgICAgICBwcmV2OiBcImlzLXByZXZcIlxuICAgICAgfVxuICAgIH07XG5cbiAgICBjbGFzcyBnIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy5jYXJvdXNlbCA9IHQsIHRoaXMuc2VsZWN0ZWRJbmRleCA9IG51bGwsIHRoaXMuZnJpY3Rpb24gPSAwLCB0aGlzLm9uTmF2UmVhZHkgPSB0aGlzLm9uTmF2UmVhZHkuYmluZCh0aGlzKSwgdGhpcy5vbk5hdkNsaWNrID0gdGhpcy5vbk5hdkNsaWNrLmJpbmQodGhpcyksIHRoaXMub25OYXZDcmVhdGVTbGlkZSA9IHRoaXMub25OYXZDcmVhdGVTbGlkZS5iaW5kKHRoaXMpLCB0aGlzLm9uVGFyZ2V0Q2hhbmdlID0gdGhpcy5vblRhcmdldENoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICBhZGRBc1RhcmdldEZvcih0KSB7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5jYXJvdXNlbCwgdGhpcy5uYXYgPSB0LCB0aGlzLmF0dGFjaEV2ZW50cygpO1xuICAgICAgfVxuXG4gICAgICBhZGRBc05hdkZvcih0KSB7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdCwgdGhpcy5uYXYgPSB0aGlzLmNhcm91c2VsLCB0aGlzLmF0dGFjaEV2ZW50cygpO1xuICAgICAgfVxuXG4gICAgICBhdHRhY2hFdmVudHMoKSB7XG4gICAgICAgIHRoaXMubmF2Lm9wdGlvbnMuaW5pdGlhbFNsaWRlID0gdGhpcy50YXJnZXQub3B0aW9ucy5pbml0aWFsUGFnZSwgdGhpcy5uYXYub24oXCJyZWFkeVwiLCB0aGlzLm9uTmF2UmVhZHkpLCB0aGlzLm5hdi5vbihcImNyZWF0ZVNsaWRlXCIsIHRoaXMub25OYXZDcmVhdGVTbGlkZSksIHRoaXMubmF2Lm9uKFwiUGFuem9vbS5jbGlja1wiLCB0aGlzLm9uTmF2Q2xpY2spLCB0aGlzLnRhcmdldC5vbihcImNoYW5nZVwiLCB0aGlzLm9uVGFyZ2V0Q2hhbmdlKSwgdGhpcy50YXJnZXQub24oXCJQYW56b29tLmFmdGVyVXBkYXRlXCIsIHRoaXMub25UYXJnZXRDaGFuZ2UpO1xuICAgICAgfVxuXG4gICAgICBvbk5hdlJlYWR5KCkge1xuICAgICAgICB0aGlzLm9uVGFyZ2V0Q2hhbmdlKCEwKTtcbiAgICAgIH1cblxuICAgICAgb25OYXZDbGljayh0LCBlLCBpKSB7XG4gICAgICAgIGNvbnN0IHMgPSBpLnRhcmdldC5jbG9zZXN0KFwiLmNhcm91c2VsX19zbGlkZVwiKTtcbiAgICAgICAgaWYgKCFzKSByZXR1cm47XG4gICAgICAgIGkuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IG8gPSBwYXJzZUludChzLmRhdGFzZXQuaW5kZXgsIDEwKSxcbiAgICAgICAgICAgICAgbiA9IHRoaXMudGFyZ2V0LmZpbmRQYWdlRm9yU2xpZGUobyk7XG4gICAgICAgIHRoaXMudGFyZ2V0LnBhZ2UgIT09IG4gJiYgdGhpcy50YXJnZXQuc2xpZGVUbyhuLCB7XG4gICAgICAgICAgZnJpY3Rpb246IHRoaXMuZnJpY3Rpb25cbiAgICAgICAgfSksIHRoaXMubWFya1NlbGVjdGVkU2xpZGUobyk7XG4gICAgICB9XG5cbiAgICAgIG9uTmF2Q3JlYXRlU2xpZGUodCwgZSkge1xuICAgICAgICBlLmluZGV4ID09PSB0aGlzLnNlbGVjdGVkSW5kZXggJiYgdGhpcy5tYXJrU2VsZWN0ZWRTbGlkZShlLmluZGV4KTtcbiAgICAgIH1cblxuICAgICAgb25UYXJnZXRDaGFuZ2UoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLnRhcmdldC5wYWdlc1t0aGlzLnRhcmdldC5wYWdlXS5pbmRleGVzWzBdLFxuICAgICAgICAgICAgICBlID0gdGhpcy5uYXYuZmluZFBhZ2VGb3JTbGlkZSh0KTtcbiAgICAgICAgdGhpcy5uYXYuc2xpZGVUbyhlKSwgdGhpcy5tYXJrU2VsZWN0ZWRTbGlkZSh0KTtcbiAgICAgIH1cblxuICAgICAgbWFya1NlbGVjdGVkU2xpZGUodCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0LCBbLi4udGhpcy5uYXYuc2xpZGVzXS5maWx0ZXIodCA9PiB0LiRlbCAmJiB0LiRlbC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtbmF2LXNlbGVjdGVkXCIpKTtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMubmF2LnNsaWRlc1t0XTtcbiAgICAgICAgZSAmJiBlLiRlbCAmJiBlLiRlbC5jbGFzc0xpc3QuYWRkKFwiaXMtbmF2LXNlbGVjdGVkXCIpO1xuICAgICAgfVxuXG4gICAgICBhdHRhY2godCkge1xuICAgICAgICBjb25zdCBlID0gdC5vcHRpb25zLlN5bmM7XG4gICAgICAgIChlLnRhcmdldCB8fCBlLm5hdikgJiYgKGUudGFyZ2V0ID8gdGhpcy5hZGRBc05hdkZvcihlLnRhcmdldCkgOiBlLm5hdiAmJiB0aGlzLmFkZEFzVGFyZ2V0Rm9yKGUubmF2KSwgdGhpcy5mcmljdGlvbiA9IGUuZnJpY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICBkZXRhY2goKSB7XG4gICAgICAgIHRoaXMubmF2ICYmICh0aGlzLm5hdi5vZmYoXCJyZWFkeVwiLCB0aGlzLm9uTmF2UmVhZHkpLCB0aGlzLm5hdi5vZmYoXCJQYW56b29tLmNsaWNrXCIsIHRoaXMub25OYXZDbGljayksIHRoaXMubmF2Lm9mZihcImNyZWF0ZVNsaWRlXCIsIHRoaXMub25OYXZDcmVhdGVTbGlkZSkpLCB0aGlzLnRhcmdldCAmJiAodGhpcy50YXJnZXQub2ZmKFwiUGFuem9vbS5hZnRlclVwZGF0ZVwiLCB0aGlzLm9uVGFyZ2V0Q2hhbmdlKSwgdGhpcy50YXJnZXQub2ZmKFwiY2hhbmdlXCIsIHRoaXMub25UYXJnZXRDaGFuZ2UpKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGcuZGVmYXVsdHMgPSB7XG4gICAgICBmcmljdGlvbjogLjkyXG4gICAgfTtcbiAgICBjb25zdCBwID0ge1xuICAgICAgTmF2aWdhdGlvbjogZixcbiAgICAgIERvdHM6IGNsYXNzIHtcbiAgICAgICAgY29uc3RydWN0b3IodCkge1xuICAgICAgICAgIHRoaXMuY2Fyb3VzZWwgPSB0LCB0aGlzLiRsaXN0ID0gbnVsbCwgdGhpcy5ldmVudHMgPSB7XG4gICAgICAgICAgICBjaGFuZ2U6IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgIHJlZnJlc2g6IHRoaXMub25SZWZyZXNoLmJpbmQodGhpcylcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgYnVpbGRMaXN0KCkge1xuICAgICAgICAgIGlmICh0aGlzLmNhcm91c2VsLnBhZ2VzLmxlbmd0aCA8IHRoaXMuY2Fyb3VzZWwub3B0aW9uKFwiRG90cy5taW5TbGlkZUNvdW50XCIpKSByZXR1cm47XG4gICAgICAgICAgY29uc3QgdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvbFwiKTtcbiAgICAgICAgICByZXR1cm4gdC5jbGFzc0xpc3QuYWRkKFwiY2Fyb3VzZWxfX2RvdHNcIiksIHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHQgPT4ge1xuICAgICAgICAgICAgaWYgKCEoXCJwYWdlXCIgaW4gdC50YXJnZXQuZGF0YXNldCkpIHJldHVybjtcbiAgICAgICAgICAgIHQucHJldmVudERlZmF1bHQoKSwgdC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNvbnN0IGUgPSBwYXJzZUludCh0LnRhcmdldC5kYXRhc2V0LnBhZ2UsIDEwKSxcbiAgICAgICAgICAgICAgICAgIGkgPSB0aGlzLmNhcm91c2VsO1xuICAgICAgICAgICAgZSAhPT0gaS5wYWdlICYmIChpLnBhZ2VzLmxlbmd0aCA8IDMgJiYgaS5vcHRpb24oXCJpbmZpbml0ZVwiKSA/IGlbMCA9PSBlID8gXCJzbGlkZVByZXZcIiA6IFwic2xpZGVOZXh0XCJdKCkgOiBpLnNsaWRlVG8oZSkpO1xuICAgICAgICAgIH0pLCB0aGlzLiRsaXN0ID0gdCwgdGhpcy5jYXJvdXNlbC4kY29udGFpbmVyLmFwcGVuZENoaWxkKHQpLCB0aGlzLmNhcm91c2VsLiRjb250YWluZXIuY2xhc3NMaXN0LmFkZChcImhhcy1kb3RzXCIpLCB0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmVtb3ZlTGlzdCgpIHtcbiAgICAgICAgICB0aGlzLiRsaXN0ICYmICh0aGlzLiRsaXN0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy4kbGlzdCksIHRoaXMuJGxpc3QgPSBudWxsKSwgdGhpcy5jYXJvdXNlbC4kY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoXCJoYXMtZG90c1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlYnVpbGREb3RzKCkge1xuICAgICAgICAgIGxldCB0ID0gdGhpcy4kbGlzdDtcbiAgICAgICAgICBjb25zdCBlID0gISF0LFxuICAgICAgICAgICAgICAgIGkgPSB0aGlzLmNhcm91c2VsLnBhZ2VzLmxlbmd0aDtcbiAgICAgICAgICBpZiAoaSA8IDIpIHJldHVybiB2b2lkIChlICYmIHRoaXMucmVtb3ZlTGlzdCgpKTtcbiAgICAgICAgICBlIHx8ICh0ID0gdGhpcy5idWlsZExpc3QoKSk7XG4gICAgICAgICAgY29uc3QgcyA9IHRoaXMuJGxpc3QuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICAgIGlmIChzID4gaSkgZm9yIChsZXQgdCA9IGk7IHQgPCBzOyB0KyspIHRoaXMuJGxpc3QucmVtb3ZlQ2hpbGQodGhpcy4kbGlzdC5sYXN0Q2hpbGQpO2Vsc2Uge1xuICAgICAgICAgICAgZm9yIChsZXQgdCA9IHM7IHQgPCBpOyB0KyspIHtcbiAgICAgICAgICAgICAgY29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgICAgICAgZS5jbGFzc0xpc3QuYWRkKFwiY2Fyb3VzZWxfX2RvdFwiKSwgZS5kYXRhc2V0LnBhZ2UgPSB0LCBlLnNldEF0dHJpYnV0ZShcInJvbGVcIiwgXCJidXR0b25cIiksIGUuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgXCIwXCIpLCBlLnNldEF0dHJpYnV0ZShcInRpdGxlXCIsIHRoaXMuY2Fyb3VzZWwubG9jYWxpemUoXCJ7e0dPVE99fVwiLCBbW1wiJWRcIiwgdCArIDFdXSkpLCBlLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGkgPSB0LmNvZGU7XG4gICAgICAgICAgICAgICAgbGV0IHM7XG4gICAgICAgICAgICAgICAgXCJFbnRlclwiID09PSBpIHx8IFwiTnVtcGFkRW50ZXJcIiA9PT0gaSA/IHMgPSBlIDogXCJBcnJvd1JpZ2h0XCIgPT09IGkgPyBzID0gZS5uZXh0U2libGluZyA6IFwiQXJyb3dMZWZ0XCIgPT09IGkgJiYgKHMgPSBlLnByZXZpb3VzU2libGluZyksIHMgJiYgcy5jbGljaygpO1xuICAgICAgICAgICAgICB9KSwgdGhpcy4kbGlzdC5hcHBlbmRDaGlsZChlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVEb3QoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZXRBY3RpdmVEb3QoKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLiRsaXN0KSByZXR1cm47XG4gICAgICAgICAgdGhpcy4kbGlzdC5jaGlsZE5vZGVzLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgICB0LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1zZWxlY3RlZFwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCB0ID0gdGhpcy4kbGlzdC5jaGlsZE5vZGVzW3RoaXMuY2Fyb3VzZWwucGFnZV07XG4gICAgICAgICAgdCAmJiB0LmNsYXNzTGlzdC5hZGQoXCJpcy1zZWxlY3RlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uQ2hhbmdlKCkge1xuICAgICAgICAgIHRoaXMuc2V0QWN0aXZlRG90KCk7XG4gICAgICAgIH1cblxuICAgICAgICBvblJlZnJlc2goKSB7XG4gICAgICAgICAgdGhpcy5yZWJ1aWxkRG90cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0YWNoKCkge1xuICAgICAgICAgIHRoaXMuY2Fyb3VzZWwub24odGhpcy5ldmVudHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGV0YWNoKCkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdCgpLCB0aGlzLmNhcm91c2VsLm9mZih0aGlzLmV2ZW50cyksIHRoaXMuY2Fyb3VzZWwgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBTeW5jOiBnXG4gICAgfTtcbiAgICBjb25zdCBtID0ge1xuICAgICAgc2xpZGVzOiBbXSxcbiAgICAgIHByZWxvYWQ6IDAsXG4gICAgICBzbGlkZXNQZXJQYWdlOiBcImF1dG9cIixcbiAgICAgIGluaXRpYWxQYWdlOiBudWxsLFxuICAgICAgaW5pdGlhbFNsaWRlOiBudWxsLFxuICAgICAgZnJpY3Rpb246IC45MixcbiAgICAgIGNlbnRlcjogITAsXG4gICAgICBpbmZpbml0ZTogITAsXG4gICAgICBmaWxsOiAhMCxcbiAgICAgIGRyYWdGcmVlOiAhMSxcbiAgICAgIHByZWZpeDogXCJcIixcbiAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgdmlld3BvcnQ6IFwiY2Fyb3VzZWxfX3ZpZXdwb3J0XCIsXG4gICAgICAgIHRyYWNrOiBcImNhcm91c2VsX190cmFja1wiLFxuICAgICAgICBzbGlkZTogXCJjYXJvdXNlbF9fc2xpZGVcIixcbiAgICAgICAgc2xpZGVTZWxlY3RlZDogXCJpcy1zZWxlY3RlZFwiXG4gICAgICB9LFxuICAgICAgbDEwbjoge1xuICAgICAgICBORVhUOiBcIk5leHQgc2xpZGVcIixcbiAgICAgICAgUFJFVjogXCJQcmV2aW91cyBzbGlkZVwiLFxuICAgICAgICBHT1RPOiBcIkdvIHRvIHNsaWRlICMlZFwiXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNsYXNzIHkgZXh0ZW5kcyBsIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQsIGkgPSB7fSkge1xuICAgICAgICBpZiAoc3VwZXIoaSA9IGUoITAsIHt9LCBtLCBpKSksIHRoaXMuc3RhdGUgPSBcImluaXRcIiwgdGhpcy4kY29udGFpbmVyID0gdCwgISh0aGlzLiRjb250YWluZXIgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHRocm93IG5ldyBFcnJvcihcIk5vIHJvb3QgZWxlbWVudCBwcm92aWRlZFwiKTtcbiAgICAgICAgdGhpcy5zbGlkZU5leHQgPSB1KHRoaXMuc2xpZGVOZXh0LmJpbmQodGhpcyksIDI1MCksIHRoaXMuc2xpZGVQcmV2ID0gdSh0aGlzLnNsaWRlUHJldi5iaW5kKHRoaXMpLCAyNTApLCB0aGlzLmluaXQoKSwgdC5fX0Nhcm91c2VsID0gdGhpcztcbiAgICAgIH1cblxuICAgICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5wYWdlcyA9IFtdLCB0aGlzLnBhZ2UgPSB0aGlzLnBhZ2VJbmRleCA9IG51bGwsIHRoaXMucHJldlBhZ2UgPSB0aGlzLnByZXZQYWdlSW5kZXggPSBudWxsLCB0aGlzLmF0dGFjaFBsdWdpbnMoeS5QbHVnaW5zKSwgdGhpcy50cmlnZ2VyKFwiaW5pdFwiKSwgdGhpcy5pbml0TGF5b3V0KCksIHRoaXMuaW5pdFNsaWRlcygpLCB0aGlzLnVwZGF0ZU1ldHJpY3MoKSwgdGhpcy4kdHJhY2sgJiYgdGhpcy5wYWdlcy5sZW5ndGggJiYgKHRoaXMuJHRyYWNrLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgkey0xICogdGhpcy5wYWdlc1t0aGlzLnBhZ2VdLmxlZnR9cHgsIDBweCwgMCkgc2NhbGUoMSlgKSwgdGhpcy5tYW5hZ2VTbGlkZVZpc2libGl0eSgpLCB0aGlzLmluaXRQYW56b29tKCksIHRoaXMuc3RhdGUgPSBcInJlYWR5XCIsIHRoaXMudHJpZ2dlcihcInJlYWR5XCIpO1xuICAgICAgfVxuXG4gICAgICBpbml0TGF5b3V0KCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5vcHRpb24oXCJwcmVmaXhcIiksXG4gICAgICAgICAgICAgIGUgPSB0aGlzLm9wdGlvbihcImNsYXNzTmFtZXNcIik7XG4gICAgICAgIHRoaXMuJHZpZXdwb3J0ID0gdGhpcy5vcHRpb24oXCJ2aWV3cG9ydFwiKSB8fCB0aGlzLiRjb250YWluZXIucXVlcnlTZWxlY3RvcihgLiR7dH0ke2Uudmlld3BvcnR9YCksIHRoaXMuJHZpZXdwb3J0IHx8ICh0aGlzLiR2aWV3cG9ydCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIHRoaXMuJHZpZXdwb3J0LmNsYXNzTGlzdC5hZGQoLi4uKHQgKyBlLnZpZXdwb3J0KS5zcGxpdChcIiBcIikpLCB0aGlzLiR2aWV3cG9ydC5hcHBlbmQoLi4udGhpcy4kY29udGFpbmVyLmNoaWxkTm9kZXMpLCB0aGlzLiRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy4kdmlld3BvcnQpKSwgdGhpcy4kdHJhY2sgPSB0aGlzLm9wdGlvbihcInRyYWNrXCIpIHx8IHRoaXMuJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGAuJHt0fSR7ZS50cmFja31gKSwgdGhpcy4kdHJhY2sgfHwgKHRoaXMuJHRyYWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgdGhpcy4kdHJhY2suY2xhc3NMaXN0LmFkZCguLi4odCArIGUudHJhY2spLnNwbGl0KFwiIFwiKSksIHRoaXMuJHRyYWNrLmFwcGVuZCguLi50aGlzLiR2aWV3cG9ydC5jaGlsZE5vZGVzKSwgdGhpcy4kdmlld3BvcnQuYXBwZW5kQ2hpbGQodGhpcy4kdHJhY2spKTtcbiAgICAgIH1cblxuICAgICAgaW5pdFNsaWRlcygpIHtcbiAgICAgICAgdGhpcy5zbGlkZXMgPSBbXTtcbiAgICAgICAgdGhpcy4kdmlld3BvcnQucXVlcnlTZWxlY3RvckFsbChgLiR7dGhpcy5vcHRpb24oXCJwcmVmaXhcIil9JHt0aGlzLm9wdGlvbihcImNsYXNzTmFtZXMuc2xpZGVcIil9YCkuZm9yRWFjaCh0ID0+IHtcbiAgICAgICAgICBjb25zdCBlID0ge1xuICAgICAgICAgICAgJGVsOiB0LFxuICAgICAgICAgICAgaXNEb206ICEwXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0aGlzLnNsaWRlcy5wdXNoKGUpLCB0aGlzLnRyaWdnZXIoXCJjcmVhdGVTbGlkZVwiLCBlLCB0aGlzLnNsaWRlcy5sZW5ndGgpO1xuICAgICAgICB9KSwgQXJyYXkuaXNBcnJheSh0aGlzLm9wdGlvbnMuc2xpZGVzKSAmJiAodGhpcy5zbGlkZXMgPSBlKCEwLCBbLi4udGhpcy5zbGlkZXNdLCB0aGlzLm9wdGlvbnMuc2xpZGVzKSk7XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZU1ldHJpY3MoKSB7XG4gICAgICAgIGxldCB0LFxuICAgICAgICAgICAgZSA9IDAsXG4gICAgICAgICAgICBzID0gW107XG4gICAgICAgIHRoaXMuc2xpZGVzLmZvckVhY2goKGksIG8pID0+IHtcbiAgICAgICAgICBjb25zdCBuID0gaS4kZWwsXG4gICAgICAgICAgICAgICAgYSA9IGkuaXNEb20gfHwgIXQgPyB0aGlzLmdldFNsaWRlTWV0cmljcyhuKSA6IHQ7XG4gICAgICAgICAgaS5pbmRleCA9IG8sIGkud2lkdGggPSBhLCBpLmxlZnQgPSBlLCB0ID0gYSwgZSArPSBhLCBzLnB1c2gobyk7XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgbyA9IE1hdGgubWF4KHRoaXMuJHRyYWNrLm9mZnNldFdpZHRoLCBpKHRoaXMuJHRyYWNrLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKSksXG4gICAgICAgICAgICBuID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLiR0cmFjayk7XG4gICAgICAgIG8gLT0gcGFyc2VGbG9hdChuLnBhZGRpbmdMZWZ0KSArIHBhcnNlRmxvYXQobi5wYWRkaW5nUmlnaHQpLCB0aGlzLmNvbnRlbnRXaWR0aCA9IGUsIHRoaXMudmlld3BvcnRXaWR0aCA9IG87XG4gICAgICAgIGNvbnN0IGEgPSBbXSxcbiAgICAgICAgICAgICAgciA9IHRoaXMub3B0aW9uKFwic2xpZGVzUGVyUGFnZVwiKTtcbiAgICAgICAgaWYgKE51bWJlci5pc0ludGVnZXIocikgJiYgZSA+IG8pIGZvciAobGV0IHQgPSAwOyB0IDwgdGhpcy5zbGlkZXMubGVuZ3RoOyB0ICs9IHIpIGEucHVzaCh7XG4gICAgICAgICAgaW5kZXhlczogcy5zbGljZSh0LCB0ICsgciksXG4gICAgICAgICAgc2xpZGVzOiB0aGlzLnNsaWRlcy5zbGljZSh0LCB0ICsgcilcbiAgICAgICAgfSk7ZWxzZSB7XG4gICAgICAgICAgbGV0IHQgPSAwLFxuICAgICAgICAgICAgICBlID0gMDtcblxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zbGlkZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGxldCBzID0gdGhpcy5zbGlkZXNbaV07XG4gICAgICAgICAgICAoIWEubGVuZ3RoIHx8IGUgKyBzLndpZHRoID4gbykgJiYgKGEucHVzaCh7XG4gICAgICAgICAgICAgIGluZGV4ZXM6IFtdLFxuICAgICAgICAgICAgICBzbGlkZXM6IFtdXG4gICAgICAgICAgICB9KSwgdCA9IGEubGVuZ3RoIC0gMSwgZSA9IDApLCBlICs9IHMud2lkdGgsIGFbdF0uaW5kZXhlcy5wdXNoKGkpLCBhW3RdLnNsaWRlcy5wdXNoKHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoID0gdGhpcy5vcHRpb24oXCJjZW50ZXJcIiksXG4gICAgICAgICAgICAgIGwgPSB0aGlzLm9wdGlvbihcImZpbGxcIik7XG4gICAgICAgIGEuZm9yRWFjaCgodCwgaSkgPT4ge1xuICAgICAgICAgIHQuaW5kZXggPSBpLCB0LndpZHRoID0gdC5zbGlkZXMucmVkdWNlKCh0LCBlKSA9PiB0ICsgZS53aWR0aCwgMCksIHQubGVmdCA9IHQuc2xpZGVzWzBdLmxlZnQsIGggJiYgKHQubGVmdCArPSAuNSAqIChvIC0gdC53aWR0aCkgKiAtMSksIGwgJiYgIXRoaXMub3B0aW9uKFwiaW5maW5pdGVYXCIsIHRoaXMub3B0aW9uKFwiaW5maW5pdGVcIikpICYmIGUgPiBvICYmICh0LmxlZnQgPSBNYXRoLm1heCh0LmxlZnQsIDApLCB0LmxlZnQgPSBNYXRoLm1pbih0LmxlZnQsIGUgLSBvKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBjID0gW107XG4gICAgICAgIGxldCBkO1xuICAgICAgICBhLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgY29uc3QgZSA9IHsgLi4udFxuICAgICAgICAgIH07XG4gICAgICAgICAgZCAmJiBlLmxlZnQgPT09IGQubGVmdCA/IChkLndpZHRoICs9IGUud2lkdGgsIGQuc2xpZGVzID0gWy4uLmQuc2xpZGVzLCAuLi5lLnNsaWRlc10sIGQuaW5kZXhlcyA9IFsuLi5kLmluZGV4ZXMsIC4uLmUuaW5kZXhlc10pIDogKGUuaW5kZXggPSBjLmxlbmd0aCwgZCA9IGUsIGMucHVzaChlKSk7XG4gICAgICAgIH0pLCB0aGlzLnBhZ2VzID0gYztcbiAgICAgICAgbGV0IHUgPSB0aGlzLnBhZ2U7XG5cbiAgICAgICAgaWYgKG51bGwgPT09IHUpIHtcbiAgICAgICAgICBjb25zdCB0ID0gdGhpcy5vcHRpb24oXCJpbml0aWFsU2xpZGVcIik7XG4gICAgICAgICAgdSA9IG51bGwgIT09IHQgPyB0aGlzLmZpbmRQYWdlRm9yU2xpZGUodCkgOiBwYXJzZUludCh0aGlzLm9wdGlvbihcImluaXRpYWxQYWdlXCIsIDApLCAxMCkgfHwgMCwgY1t1XSB8fCAodSA9IGMubGVuZ3RoICYmIHUgPiBjLmxlbmd0aCA/IGNbYy5sZW5ndGggLSAxXS5pbmRleCA6IDApLCB0aGlzLnBhZ2UgPSB1LCB0aGlzLnBhZ2VJbmRleCA9IHU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnVwZGF0ZVBhbnpvb20oKSwgdGhpcy50cmlnZ2VyKFwicmVmcmVzaFwiKTtcbiAgICAgIH1cblxuICAgICAgZ2V0U2xpZGVNZXRyaWNzKHQpIHtcbiAgICAgICAgaWYgKCF0KSB7XG4gICAgICAgICAgY29uc3QgZSA9IHRoaXMuc2xpZGVzWzBdO1xuICAgICAgICAgICh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSkuZGF0YXNldC5pc1Rlc3RFbCA9IDEsIHQuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCIsIHQuY2xhc3NMaXN0LmFkZCguLi4odGhpcy5vcHRpb24oXCJwcmVmaXhcIikgKyB0aGlzLm9wdGlvbihcImNsYXNzTmFtZXMuc2xpZGVcIikpLnNwbGl0KFwiIFwiKSksIGUuY3VzdG9tQ2xhc3MgJiYgdC5jbGFzc0xpc3QuYWRkKC4uLmUuY3VzdG9tQ2xhc3Muc3BsaXQoXCIgXCIpKSwgdGhpcy4kdHJhY2sucHJlcGVuZCh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlID0gTWF0aC5tYXgodC5vZmZzZXRXaWR0aCwgaSh0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKSk7XG4gICAgICAgIGNvbnN0IHMgPSB0LmN1cnJlbnRTdHlsZSB8fCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0KTtcbiAgICAgICAgcmV0dXJuIGUgPSBlICsgKHBhcnNlRmxvYXQocy5tYXJnaW5MZWZ0KSB8fCAwKSArIChwYXJzZUZsb2F0KHMubWFyZ2luUmlnaHQpIHx8IDApLCB0LmRhdGFzZXQuaXNUZXN0RWwgJiYgdC5yZW1vdmUoKSwgZTtcbiAgICAgIH1cblxuICAgICAgZmluZFBhZ2VGb3JTbGlkZSh0KSB7XG4gICAgICAgIHQgPSBwYXJzZUludCh0LCAxMCkgfHwgMDtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMucGFnZXMuZmluZChlID0+IGUuaW5kZXhlcy5pbmRleE9mKHQpID4gLTEpO1xuICAgICAgICByZXR1cm4gZSA/IGUuaW5kZXggOiBudWxsO1xuICAgICAgfVxuXG4gICAgICBzbGlkZU5leHQoKSB7XG4gICAgICAgIHRoaXMuc2xpZGVUbyh0aGlzLnBhZ2VJbmRleCArIDEpO1xuICAgICAgfVxuXG4gICAgICBzbGlkZVByZXYoKSB7XG4gICAgICAgIHRoaXMuc2xpZGVUbyh0aGlzLnBhZ2VJbmRleCAtIDEpO1xuICAgICAgfVxuXG4gICAgICBzbGlkZVRvKHQsIGUgPSB7fSkge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgeDogaSA9IC0xICogdGhpcy5zZXRQYWdlKHQsICEwKSxcbiAgICAgICAgICB5OiBzID0gMCxcbiAgICAgICAgICBmcmljdGlvbjogbyA9IHRoaXMub3B0aW9uKFwiZnJpY3Rpb25cIilcbiAgICAgICAgfSA9IGU7XG4gICAgICAgIHRoaXMuUGFuem9vbS5jb250ZW50LnggPT09IGkgJiYgIXRoaXMuUGFuem9vbS52ZWxvY2l0eS54ICYmIG8gfHwgKHRoaXMuUGFuem9vbS5wYW5Ubyh7XG4gICAgICAgICAgeDogaSxcbiAgICAgICAgICB5OiBzLFxuICAgICAgICAgIGZyaWN0aW9uOiBvLFxuICAgICAgICAgIGlnbm9yZUJvdW5kczogITBcbiAgICAgICAgfSksIFwicmVhZHlcIiA9PT0gdGhpcy5zdGF0ZSAmJiBcInJlYWR5XCIgPT09IHRoaXMuUGFuem9vbS5zdGF0ZSAmJiB0aGlzLnRyaWdnZXIoXCJzZXR0bGVcIikpO1xuICAgICAgfVxuXG4gICAgICBpbml0UGFuem9vbSgpIHtcbiAgICAgICAgdGhpcy5QYW56b29tICYmIHRoaXMuUGFuem9vbS5kZXN0cm95KCk7XG4gICAgICAgIGNvbnN0IHQgPSBlKCEwLCB7fSwge1xuICAgICAgICAgIGNvbnRlbnQ6IHRoaXMuJHRyYWNrLFxuICAgICAgICAgIHdyYXBJbm5lcjogITEsXG4gICAgICAgICAgcmVzaXplUGFyZW50OiAhMSxcbiAgICAgICAgICB6b29tOiAhMSxcbiAgICAgICAgICBjbGljazogITEsXG4gICAgICAgICAgbG9ja0F4aXM6IFwieFwiLFxuICAgICAgICAgIHg6IHRoaXMucGFnZXMubGVuZ3RoID8gLTEgKiB0aGlzLnBhZ2VzW3RoaXMucGFnZV0ubGVmdCA6IDAsXG4gICAgICAgICAgY2VudGVyT25TdGFydDogITEsXG4gICAgICAgICAgdGV4dFNlbGVjdGlvbjogKCkgPT4gdGhpcy5vcHRpb24oXCJ0ZXh0U2VsZWN0aW9uXCIsICExKSxcbiAgICAgICAgICBwYW5Pbmx5Wm9vbWVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50LndpZHRoIDw9IHRoaXMudmlld3BvcnQud2lkdGg7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzLm9wdGlvbihcIlBhbnpvb21cIikpO1xuICAgICAgICB0aGlzLlBhbnpvb20gPSBuZXcgZCh0aGlzLiRjb250YWluZXIsIHQpLCB0aGlzLlBhbnpvb20ub24oe1xuICAgICAgICAgIFwiKlwiOiAodCwgLi4uZSkgPT4gdGhpcy50cmlnZ2VyKGBQYW56b29tLiR7dH1gLCAuLi5lKSxcbiAgICAgICAgICBhZnRlclVwZGF0ZTogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQYWdlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBiZWZvcmVUcmFuc2Zvcm06IHRoaXMub25CZWZvcmVUcmFuc2Zvcm0uYmluZCh0aGlzKSxcbiAgICAgICAgICB0b3VjaEVuZDogdGhpcy5vblRvdWNoRW5kLmJpbmQodGhpcyksXG4gICAgICAgICAgZW5kQW5pbWF0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoXCJzZXR0bGVcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KSwgdGhpcy51cGRhdGVNZXRyaWNzKCksIHRoaXMubWFuYWdlU2xpZGVWaXNpYmxpdHkoKTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlUGFuem9vbSgpIHtcbiAgICAgICAgdGhpcy5QYW56b29tICYmICh0aGlzLlBhbnpvb20uY29udGVudCA9IHsgLi4udGhpcy5QYW56b29tLmNvbnRlbnQsXG4gICAgICAgICAgZml0V2lkdGg6IHRoaXMuY29udGVudFdpZHRoLFxuICAgICAgICAgIG9yaWdXaWR0aDogdGhpcy5jb250ZW50V2lkdGgsXG4gICAgICAgICAgd2lkdGg6IHRoaXMuY29udGVudFdpZHRoXG4gICAgICAgIH0sIHRoaXMucGFnZXMubGVuZ3RoID4gMSAmJiB0aGlzLm9wdGlvbihcImluZmluaXRlWFwiLCB0aGlzLm9wdGlvbihcImluZmluaXRlXCIpKSA/IHRoaXMuUGFuem9vbS5ib3VuZFggPSBudWxsIDogdGhpcy5wYWdlcy5sZW5ndGggJiYgKHRoaXMuUGFuem9vbS5ib3VuZFggPSB7XG4gICAgICAgICAgZnJvbTogLTEgKiB0aGlzLnBhZ2VzW3RoaXMucGFnZXMubGVuZ3RoIC0gMV0ubGVmdCxcbiAgICAgICAgICB0bzogLTEgKiB0aGlzLnBhZ2VzWzBdLmxlZnRcbiAgICAgICAgfSksIHRoaXMub3B0aW9uKFwiaW5maW5pdGVZXCIsIHRoaXMub3B0aW9uKFwiaW5maW5pdGVcIikpID8gdGhpcy5QYW56b29tLmJvdW5kWSA9IG51bGwgOiB0aGlzLlBhbnpvb20uYm91bmRZID0ge1xuICAgICAgICAgIGZyb206IDAsXG4gICAgICAgICAgdG86IDBcbiAgICAgICAgfSwgdGhpcy5QYW56b29tLmhhbmRsZUN1cnNvcigpKTtcbiAgICAgIH1cblxuICAgICAgbWFuYWdlU2xpZGVWaXNpYmxpdHkoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmNvbnRlbnRXaWR0aCxcbiAgICAgICAgICAgICAgZSA9IHRoaXMudmlld3BvcnRXaWR0aDtcbiAgICAgICAgbGV0IGkgPSB0aGlzLlBhbnpvb20gPyAtMSAqIHRoaXMuUGFuem9vbS5jb250ZW50LnggOiB0aGlzLnBhZ2VzLmxlbmd0aCA/IHRoaXMucGFnZXNbdGhpcy5wYWdlXS5sZWZ0IDogMDtcbiAgICAgICAgY29uc3QgcyA9IHRoaXMub3B0aW9uKFwicHJlbG9hZFwiKSxcbiAgICAgICAgICAgICAgbyA9IHRoaXMub3B0aW9uKFwiaW5maW5pdGVYXCIsIHRoaXMub3B0aW9uKFwiaW5maW5pdGVcIikpLFxuICAgICAgICAgICAgICBuID0gcGFyc2VGbG9hdChnZXRDb21wdXRlZFN0eWxlKHRoaXMuJHZpZXdwb3J0LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwicGFkZGluZy1sZWZ0XCIpKSxcbiAgICAgICAgICAgICAgYSA9IHBhcnNlRmxvYXQoZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLiR2aWV3cG9ydCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShcInBhZGRpbmctcmlnaHRcIikpO1xuICAgICAgICB0aGlzLnNsaWRlcy5mb3JFYWNoKHIgPT4ge1xuICAgICAgICAgIGxldCBoLFxuICAgICAgICAgICAgICBsLFxuICAgICAgICAgICAgICBjID0gMDtcbiAgICAgICAgICBoID0gaSAtIG4sIGwgPSBpICsgZSArIGEsIGggLT0gcyAqIChlICsgbiArIGEpLCBsICs9IHMgKiAoZSArIG4gKyBhKTtcbiAgICAgICAgICBjb25zdCBkID0gci5sZWZ0ICsgci53aWR0aCA+IGggJiYgci5sZWZ0IDwgbDtcbiAgICAgICAgICBoID0gaSArIHQgLSBuLCBsID0gaSArIHQgKyBlICsgYSwgaCAtPSBzICogKGUgKyBuICsgYSk7XG4gICAgICAgICAgY29uc3QgdSA9IG8gJiYgci5sZWZ0ICsgci53aWR0aCA+IGggJiYgci5sZWZ0IDwgbDtcbiAgICAgICAgICBoID0gaSAtIHQgLSBuLCBsID0gaSAtIHQgKyBlICsgYSwgaCAtPSBzICogKGUgKyBuICsgYSk7XG4gICAgICAgICAgY29uc3QgZiA9IG8gJiYgci5sZWZ0ICsgci53aWR0aCA+IGggJiYgci5sZWZ0IDwgbDtcbiAgICAgICAgICB1IHx8IGQgfHwgZiA/ICh0aGlzLmNyZWF0ZVNsaWRlRWwociksIGQgJiYgKGMgPSAwKSwgdSAmJiAoYyA9IC0xKSwgZiAmJiAoYyA9IDEpLCByLmxlZnQgKyByLndpZHRoID4gaSAmJiByLmxlZnQgPD0gaSArIGUgKyBhICYmIChjID0gMCkpIDogdGhpcy5yZW1vdmVTbGlkZUVsKHIpLCByLmhhc0RpZmYgPSBjO1xuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHIgPSAwLFxuICAgICAgICAgICAgaCA9IDA7XG4gICAgICAgIHRoaXMuc2xpZGVzLmZvckVhY2goKGUsIGkpID0+IHtcbiAgICAgICAgICBsZXQgcyA9IDA7XG4gICAgICAgICAgZS4kZWwgPyAoaSAhPT0gciB8fCBlLmhhc0RpZmYgPyBzID0gaCArIGUuaGFzRGlmZiAqIHQgOiBoID0gMCwgZS4kZWwuc3R5bGUubGVmdCA9IE1hdGguYWJzKHMpID4gLjEgPyBgJHtoICsgZS5oYXNEaWZmICogdH1weGAgOiBcIlwiLCByKyspIDogaCArPSBlLndpZHRoO1xuICAgICAgICB9KSwgdGhpcy5tYXJrU2VsZWN0ZWRTbGlkZXMoKTtcbiAgICAgIH1cblxuICAgICAgY3JlYXRlU2xpZGVFbCh0KSB7XG4gICAgICAgIGlmICghdCkgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0LiRlbCkge1xuICAgICAgICAgIGxldCBlID0gdC4kZWwuZGF0YXNldC5pbmRleDtcblxuICAgICAgICAgIGlmICghZSB8fCBwYXJzZUludChlLCAxMCkgIT09IHQuaW5kZXgpIHtcbiAgICAgICAgICAgIGxldCBlO1xuICAgICAgICAgICAgdC4kZWwuZGF0YXNldC5pbmRleCA9IHQuaW5kZXgsIHQuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1sYXp5LXNyY3NldF1cIikuZm9yRWFjaCh0ID0+IHtcbiAgICAgICAgICAgICAgdC5zcmNzZXQgPSB0LmRhdGFzZXQubGF6eVNyY3NldDtcbiAgICAgICAgICAgIH0pLCB0LiRlbC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbGF6eS1zcmNdXCIpLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgICAgIGxldCBlID0gdC5kYXRhc2V0LmxhenlTcmM7XG4gICAgICAgICAgICAgIHQgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50ID8gdC5zcmMgPSBlIDogdC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKCcke2V9JylgO1xuICAgICAgICAgICAgfSksIChlID0gdC4kZWwuZGF0YXNldC5sYXp5U3JjKSAmJiAodC4kZWwuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybCgnJHtlfScpYCksIHQuc3RhdGUgPSBcInJlYWR5XCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGUuZGF0YXNldC5pbmRleCA9IHQuaW5kZXgsIGUuY2xhc3NMaXN0LmFkZCguLi4odGhpcy5vcHRpb24oXCJwcmVmaXhcIikgKyB0aGlzLm9wdGlvbihcImNsYXNzTmFtZXMuc2xpZGVcIikpLnNwbGl0KFwiIFwiKSksIHQuY3VzdG9tQ2xhc3MgJiYgZS5jbGFzc0xpc3QuYWRkKC4uLnQuY3VzdG9tQ2xhc3Muc3BsaXQoXCIgXCIpKSwgdC5odG1sICYmIChlLmlubmVySFRNTCA9IHQuaHRtbCk7XG4gICAgICAgIGNvbnN0IGkgPSBbXTtcbiAgICAgICAgdGhpcy5zbGlkZXMuZm9yRWFjaCgodCwgZSkgPT4ge1xuICAgICAgICAgIHQuJGVsICYmIGkucHVzaChlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHMgPSB0LmluZGV4O1xuICAgICAgICBsZXQgbyA9IG51bGw7XG5cbiAgICAgICAgaWYgKGkubGVuZ3RoKSB7XG4gICAgICAgICAgbGV0IHQgPSBpLnJlZHVjZSgodCwgZSkgPT4gTWF0aC5hYnMoZSAtIHMpIDwgTWF0aC5hYnModCAtIHMpID8gZSA6IHQpO1xuICAgICAgICAgIG8gPSB0aGlzLnNsaWRlc1t0XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLiR0cmFjay5pbnNlcnRCZWZvcmUoZSwgbyAmJiBvLiRlbCA/IG8uaW5kZXggPCB0LmluZGV4ID8gby4kZWwubmV4dFNpYmxpbmcgOiBvLiRlbCA6IG51bGwpLCB0LiRlbCA9IGUsIHRoaXMudHJpZ2dlcihcImNyZWF0ZVNsaWRlXCIsIHQsIHMpLCB0O1xuICAgICAgfVxuXG4gICAgICByZW1vdmVTbGlkZUVsKHQpIHtcbiAgICAgICAgdC4kZWwgJiYgIXQuaXNEb20gJiYgKHRoaXMudHJpZ2dlcihcInJlbW92ZVNsaWRlXCIsIHQpLCB0LiRlbC5yZW1vdmUoKSwgdC4kZWwgPSBudWxsKTtcbiAgICAgIH1cblxuICAgICAgbWFya1NlbGVjdGVkU2xpZGVzKCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5vcHRpb24oXCJjbGFzc05hbWVzLnNsaWRlU2VsZWN0ZWRcIiksXG4gICAgICAgICAgICAgIGUgPSBcImFyaWEtaGlkZGVuXCI7XG4gICAgICAgIHRoaXMuc2xpZGVzLmZvckVhY2goKGksIHMpID0+IHtcbiAgICAgICAgICBjb25zdCBvID0gaS4kZWw7XG4gICAgICAgICAgaWYgKCFvKSByZXR1cm47XG4gICAgICAgICAgY29uc3QgbiA9IHRoaXMucGFnZXNbdGhpcy5wYWdlXTtcbiAgICAgICAgICBuICYmIG4uaW5kZXhlcyAmJiBuLmluZGV4ZXMuaW5kZXhPZihzKSA+IC0xID8gKHQgJiYgIW8uY2xhc3NMaXN0LmNvbnRhaW5zKHQpICYmIChvLmNsYXNzTGlzdC5hZGQodCksIHRoaXMudHJpZ2dlcihcInNlbGVjdFNsaWRlXCIsIGkpKSwgby5yZW1vdmVBdHRyaWJ1dGUoZSkpIDogKHQgJiYgby5jbGFzc0xpc3QuY29udGFpbnModCkgJiYgKG8uY2xhc3NMaXN0LnJlbW92ZSh0KSwgdGhpcy50cmlnZ2VyKFwidW5zZWxlY3RTbGlkZVwiLCBpKSksIG8uc2V0QXR0cmlidXRlKGUsICEwKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGVQYWdlKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZU1ldHJpY3MoKSwgdGhpcy5zbGlkZVRvKHRoaXMucGFnZSwge1xuICAgICAgICAgIGZyaWN0aW9uOiAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBvbkJlZm9yZVRyYW5zZm9ybSgpIHtcbiAgICAgICAgdGhpcy5vcHRpb24oXCJpbmZpbml0ZVhcIiwgdGhpcy5vcHRpb24oXCJpbmZpbml0ZVwiKSkgJiYgdGhpcy5tYW5hZ2VJbmZpbml0ZVRyYWNrKCksIHRoaXMubWFuYWdlU2xpZGVWaXNpYmxpdHkoKTtcbiAgICAgIH1cblxuICAgICAgbWFuYWdlSW5maW5pdGVUcmFjaygpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuY29udGVudFdpZHRoLFxuICAgICAgICAgICAgICBlID0gdGhpcy52aWV3cG9ydFdpZHRoO1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9uKFwiaW5maW5pdGVYXCIsIHRoaXMub3B0aW9uKFwiaW5maW5pdGVcIikpIHx8IHRoaXMucGFnZXMubGVuZ3RoIDwgMiB8fCB0IDwgZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpID0gdGhpcy5QYW56b29tO1xuICAgICAgICBsZXQgcyA9ICExO1xuICAgICAgICByZXR1cm4gaS5jb250ZW50LnggPCAtMSAqICh0IC0gZSkgJiYgKGkuY29udGVudC54ICs9IHQsIHRoaXMucGFnZUluZGV4ID0gdGhpcy5wYWdlSW5kZXggLSB0aGlzLnBhZ2VzLmxlbmd0aCwgcyA9ICEwKSwgaS5jb250ZW50LnggPiBlICYmIChpLmNvbnRlbnQueCAtPSB0LCB0aGlzLnBhZ2VJbmRleCA9IHRoaXMucGFnZUluZGV4ICsgdGhpcy5wYWdlcy5sZW5ndGgsIHMgPSAhMCksIHMgJiYgXCJwb2ludGVyZG93blwiID09PSBpLnN0YXRlICYmIGkucmVzZXREcmFnUG9zaXRpb24oKSwgcztcbiAgICAgIH1cblxuICAgICAgb25Ub3VjaEVuZCh0LCBlKSB7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLm9wdGlvbihcImRyYWdGcmVlXCIpO1xuICAgICAgICBpZiAoIWkgJiYgdGhpcy5wYWdlcy5sZW5ndGggPiAxICYmIHQuZHJhZ09mZnNldC50aW1lIDwgMzUwICYmIE1hdGguYWJzKHQuZHJhZ09mZnNldC55KSA8IDEgJiYgTWF0aC5hYnModC5kcmFnT2Zmc2V0LngpID4gNSkgdGhpc1t0LmRyYWdPZmZzZXQueCA8IDAgPyBcInNsaWRlTmV4dFwiIDogXCJzbGlkZVByZXZcIl0oKTtlbHNlIGlmIChpKSB7XG4gICAgICAgICAgY29uc3QgWywgZV0gPSB0aGlzLmdldFBhZ2VGcm9tUG9zaXRpb24oLTEgKiB0LnRyYW5zZm9ybS54KTtcbiAgICAgICAgICB0aGlzLnNldFBhZ2UoZSk7XG4gICAgICAgIH0gZWxzZSB0aGlzLnNsaWRlVG9DbG9zZXN0KCk7XG4gICAgICB9XG5cbiAgICAgIHNsaWRlVG9DbG9zZXN0KHQgPSB7fSkge1xuICAgICAgICBsZXQgWywgZV0gPSB0aGlzLmdldFBhZ2VGcm9tUG9zaXRpb24oLTEgKiB0aGlzLlBhbnpvb20uY29udGVudC54KTtcbiAgICAgICAgdGhpcy5zbGlkZVRvKGUsIHQpO1xuICAgICAgfVxuXG4gICAgICBnZXRQYWdlRnJvbVBvc2l0aW9uKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMucGFnZXMubGVuZ3RoO1xuICAgICAgICB0aGlzLm9wdGlvbihcImNlbnRlclwiKSAmJiAodCArPSAuNSAqIHRoaXMudmlld3BvcnRXaWR0aCk7XG4gICAgICAgIGNvbnN0IGkgPSBNYXRoLmZsb29yKHQgLyB0aGlzLmNvbnRlbnRXaWR0aCk7XG4gICAgICAgIHQgLT0gaSAqIHRoaXMuY29udGVudFdpZHRoO1xuICAgICAgICBsZXQgcyA9IHRoaXMuc2xpZGVzLmZpbmQoZSA9PiBlLmxlZnQgPD0gdCAmJiBlLmxlZnQgKyBlLndpZHRoID4gdCk7XG5cbiAgICAgICAgaWYgKHMpIHtcbiAgICAgICAgICBsZXQgdCA9IHRoaXMuZmluZFBhZ2VGb3JTbGlkZShzLmluZGV4KTtcbiAgICAgICAgICByZXR1cm4gW3QsIHQgKyBpICogZV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gWzAsIDBdO1xuICAgICAgfVxuXG4gICAgICBzZXRQYWdlKHQsIGUpIHtcbiAgICAgICAgbGV0IGkgPSAwLFxuICAgICAgICAgICAgcyA9IHBhcnNlSW50KHQsIDEwKSB8fCAwO1xuICAgICAgICBjb25zdCBvID0gdGhpcy5wYWdlLFxuICAgICAgICAgICAgICBuID0gdGhpcy5wYWdlSW5kZXgsXG4gICAgICAgICAgICAgIGEgPSB0aGlzLnBhZ2VzLmxlbmd0aCxcbiAgICAgICAgICAgICAgciA9IHRoaXMuY29udGVudFdpZHRoLFxuICAgICAgICAgICAgICBoID0gdGhpcy52aWV3cG9ydFdpZHRoO1xuXG4gICAgICAgIGlmICh0ID0gKHMgJSBhICsgYSkgJSBhLCB0aGlzLm9wdGlvbihcImluZmluaXRlWFwiLCB0aGlzLm9wdGlvbihcImluZmluaXRlXCIpKSAmJiByID4gaCkge1xuICAgICAgICAgIGNvbnN0IG8gPSBNYXRoLmZsb29yKHMgLyBhKSB8fCAwLFxuICAgICAgICAgICAgICAgIG4gPSByO1xuXG4gICAgICAgICAgaWYgKGkgPSB0aGlzLnBhZ2VzW3RdLmxlZnQgKyBvICogbiwgITAgPT09IGUgJiYgYSA+IDIpIHtcbiAgICAgICAgICAgIGxldCB0ID0gLTEgKiB0aGlzLlBhbnpvb20uY29udGVudC54O1xuICAgICAgICAgICAgY29uc3QgZSA9IGkgLSBuLFxuICAgICAgICAgICAgICAgICAgbyA9IGkgKyBuLFxuICAgICAgICAgICAgICAgICAgciA9IE1hdGguYWJzKHQgLSBpKSxcbiAgICAgICAgICAgICAgICAgIGggPSBNYXRoLmFicyh0IC0gZSksXG4gICAgICAgICAgICAgICAgICBsID0gTWF0aC5hYnModCAtIG8pO1xuICAgICAgICAgICAgbCA8IHIgJiYgbCA8PSBoID8gKGkgPSBvLCBzICs9IGEpIDogaCA8IHIgJiYgaCA8IGwgJiYgKGkgPSBlLCBzIC09IGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHQgPSBzID0gTWF0aC5tYXgoMCwgTWF0aC5taW4ocywgYSAtIDEpKSwgaSA9IHRoaXMucGFnZXMubGVuZ3RoID8gdGhpcy5wYWdlc1t0XS5sZWZ0IDogMDtcblxuICAgICAgICByZXR1cm4gdGhpcy5wYWdlID0gdCwgdGhpcy5wYWdlSW5kZXggPSBzLCBudWxsICE9PSBvICYmIHQgIT09IG8gJiYgKHRoaXMucHJldlBhZ2UgPSBvLCB0aGlzLnByZXZQYWdlSW5kZXggPSBuLCB0aGlzLnRyaWdnZXIoXCJjaGFuZ2VcIiwgdCwgbykpLCBpO1xuICAgICAgfVxuXG4gICAgICBkZXN0cm95KCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJkZXN0cm95XCIsIHRoaXMuc2xpZGVzLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVTbGlkZUVsKHQpO1xuICAgICAgICB9KSwgdGhpcy5zbGlkZXMgPSBbXSwgdGhpcy5QYW56b29tLmRlc3Ryb3koKSwgdGhpcy5kZXRhY2hQbHVnaW5zKCk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICB5LnZlcnNpb24gPSBcIjQuMC4zMVwiLCB5LlBsdWdpbnMgPSBwO1xuICAgIGNvbnN0IHYgPSAhKFwidW5kZWZpbmVkXCIgPT0gdHlwZW9mIHdpbmRvdyB8fCAhd2luZG93LmRvY3VtZW50IHx8ICF3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG4gICAgbGV0IGIgPSBudWxsO1xuXG4gICAgY29uc3QgeCA9IFtcImFbaHJlZl1cIiwgXCJhcmVhW2hyZWZdXCIsICdpbnB1dDpub3QoW2Rpc2FibGVkXSk6bm90KFt0eXBlPVwiaGlkZGVuXCJdKTpub3QoW2FyaWEtaGlkZGVuXSknLCBcInNlbGVjdDpub3QoW2Rpc2FibGVkXSk6bm90KFthcmlhLWhpZGRlbl0pXCIsIFwidGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pOm5vdChbYXJpYS1oaWRkZW5dKVwiLCBcImJ1dHRvbjpub3QoW2Rpc2FibGVkXSk6bm90KFthcmlhLWhpZGRlbl0pXCIsIFwiaWZyYW1lXCIsIFwib2JqZWN0XCIsIFwiZW1iZWRcIiwgXCJ2aWRlb1wiLCBcImF1ZGlvXCIsIFwiW2NvbnRlbnRlZGl0YWJsZV1cIiwgJ1t0YWJpbmRleF06bm90KFt0YWJpbmRleF49XCItXCJdKTpub3QoW2Rpc2FibGVkXSk6bm90KFthcmlhLWhpZGRlbl0pJ10sXG4gICAgICAgICAgdyA9IHQgPT4ge1xuICAgICAgaWYgKHQgJiYgdikge1xuICAgICAgICBudWxsID09PSBiICYmIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikuZm9jdXMoe1xuICAgICAgICAgIGdldCBwcmV2ZW50U2Nyb2xsKCkge1xuICAgICAgICAgICAgcmV0dXJuIGIgPSAhMCwgITE7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHQuc2V0QWN0aXZlKSB0LnNldEFjdGl2ZSgpO2Vsc2UgaWYgKGIpIHQuZm9jdXMoe1xuICAgICAgICAgICAgcHJldmVudFNjcm9sbDogITBcbiAgICAgICAgICB9KTtlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGUgPSB3aW5kb3cucGFnZVhPZmZzZXQgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsXG4gICAgICAgICAgICAgICAgICBpID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIHQuZm9jdXMoKSwgZG9jdW1lbnQuYm9keS5zY3JvbGxUbyh7XG4gICAgICAgICAgICAgIHRvcDogZSxcbiAgICAgICAgICAgICAgbGVmdDogaSxcbiAgICAgICAgICAgICAgYmVoYXZpb3I6IFwiYXV0b1wiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKHQpIHt9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0ICQgPSB7XG4gICAgICBtaW5TbGlkZUNvdW50OiAyLFxuICAgICAgbWluU2NyZWVuSGVpZ2h0OiA1MDAsXG4gICAgICBhdXRvU3RhcnQ6ICEwLFxuICAgICAga2V5OiBcInRcIixcbiAgICAgIENhcm91c2VsOiB7fSxcbiAgICAgIHRwbDogJzxkaXYgY2xhc3M9XCJmYW5jeWJveF9fdGh1bWJcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6dXJsKFxcJ3t7c3JjfX1cXCcpXCI+PC9kaXY+J1xuICAgIH07XG5cbiAgICBjbGFzcyBDIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveCA9IHQsIHRoaXMuJGNvbnRhaW5lciA9IG51bGwsIHRoaXMuc3RhdGUgPSBcImluaXRcIjtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgW1wib25QcmVwYXJlXCIsIFwib25DbG9zaW5nXCIsIFwib25LZXlkb3duXCJdKSB0aGlzW3RdID0gdGhpc1t0XS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xuICAgICAgICAgIHByZXBhcmU6IHRoaXMub25QcmVwYXJlLFxuICAgICAgICAgIGNsb3Npbmc6IHRoaXMub25DbG9zaW5nLFxuICAgICAgICAgIGtleWRvd246IHRoaXMub25LZXlkb3duXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9uUHJlcGFyZSgpIHtcbiAgICAgICAgdGhpcy5nZXRTbGlkZXMoKS5sZW5ndGggPCB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIlRodW1icy5taW5TbGlkZUNvdW50XCIpID8gdGhpcy5zdGF0ZSA9IFwiZGlzYWJsZWRcIiA6ICEwID09PSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIlRodW1icy5hdXRvU3RhcnRcIikgJiYgdGhpcy5mYW5jeWJveC5DYXJvdXNlbC5QYW56b29tLmNvbnRlbnQuaGVpZ2h0ID49IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiVGh1bWJzLm1pblNjcmVlbkhlaWdodFwiKSAmJiB0aGlzLmJ1aWxkKCk7XG4gICAgICB9XG5cbiAgICAgIG9uQ2xvc2luZygpIHtcbiAgICAgICAgdGhpcy5DYXJvdXNlbCAmJiB0aGlzLkNhcm91c2VsLlBhbnpvb20uZGV0YWNoRXZlbnRzKCk7XG4gICAgICB9XG5cbiAgICAgIG9uS2V5ZG93bih0LCBlKSB7XG4gICAgICAgIGUgPT09IHQub3B0aW9uKFwiVGh1bWJzLmtleVwiKSAmJiB0aGlzLnRvZ2dsZSgpO1xuICAgICAgfVxuXG4gICAgICBidWlsZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuJGNvbnRhaW5lcikgcmV0dXJuO1xuICAgICAgICBjb25zdCB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdC5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3hfX3RodW1ic1wiKSwgdGhpcy5mYW5jeWJveC4kY2Fyb3VzZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodCwgdGhpcy5mYW5jeWJveC4kY2Fyb3VzZWwubmV4dFNpYmxpbmcpLCB0aGlzLkNhcm91c2VsID0gbmV3IHkodCwgZSghMCwge1xuICAgICAgICAgIERvdHM6ICExLFxuICAgICAgICAgIE5hdmlnYXRpb246ICExLFxuICAgICAgICAgIFN5bmM6IHtcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpbmZpbml0ZTogITEsXG4gICAgICAgICAgY2VudGVyOiAhMCxcbiAgICAgICAgICBmaWxsOiAhMCxcbiAgICAgICAgICBkcmFnRnJlZTogITAsXG4gICAgICAgICAgc2xpZGVzUGVyUGFnZTogMSxcbiAgICAgICAgICBwcmVsb2FkOiAxXG4gICAgICAgIH0sIHRoaXMuZmFuY3lib3gub3B0aW9uKFwiVGh1bWJzLkNhcm91c2VsXCIpLCB7XG4gICAgICAgICAgU3luYzoge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLmZhbmN5Ym94LkNhcm91c2VsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzbGlkZXM6IHRoaXMuZ2V0U2xpZGVzKClcbiAgICAgICAgfSkpLCB0aGlzLkNhcm91c2VsLlBhbnpvb20ub24oXCJ3aGVlbFwiLCAodCwgZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKSwgdGhpcy5mYW5jeWJveFtlLmRlbHRhWSA8IDAgPyBcInByZXZcIiA6IFwibmV4dFwiXSgpO1xuICAgICAgICB9KSwgdGhpcy4kY29udGFpbmVyID0gdCwgdGhpcy5zdGF0ZSA9IFwidmlzaWJsZVwiO1xuICAgICAgfVxuXG4gICAgICBnZXRTbGlkZXMoKSB7XG4gICAgICAgIGNvbnN0IHQgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgdGhpcy5mYW5jeWJveC5pdGVtcykge1xuICAgICAgICAgIGNvbnN0IGkgPSBlLnRodW1iO1xuICAgICAgICAgIGkgJiYgdC5wdXNoKHtcbiAgICAgICAgICAgIGh0bWw6IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiVGh1bWJzLnRwbFwiKS5yZXBsYWNlKC9cXHtcXHtzcmNcXH1cXH0vZ2ksIGkpLFxuICAgICAgICAgICAgY3VzdG9tQ2xhc3M6IGBoYXMtdGh1bWIgaGFzLSR7ZS50eXBlIHx8IFwiaW1hZ2VcIn1gXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdDtcbiAgICAgIH1cblxuICAgICAgdG9nZ2xlKCkge1xuICAgICAgICBcInZpc2libGVcIiA9PT0gdGhpcy5zdGF0ZSA/IHRoaXMuaGlkZSgpIDogXCJoaWRkZW5cIiA9PT0gdGhpcy5zdGF0ZSA/IHRoaXMuc2hvdygpIDogdGhpcy5idWlsZCgpO1xuICAgICAgfVxuXG4gICAgICBzaG93KCkge1xuICAgICAgICBcImhpZGRlblwiID09PSB0aGlzLnN0YXRlICYmICh0aGlzLiRjb250YWluZXIuc3R5bGUuZGlzcGxheSA9IFwiXCIsIHRoaXMuQ2Fyb3VzZWwuUGFuem9vbS5hdHRhY2hFdmVudHMoKSwgdGhpcy5zdGF0ZSA9IFwidmlzaWJsZVwiKTtcbiAgICAgIH1cblxuICAgICAgaGlkZSgpIHtcbiAgICAgICAgXCJ2aXNpYmxlXCIgPT09IHRoaXMuc3RhdGUgJiYgKHRoaXMuQ2Fyb3VzZWwuUGFuem9vbS5kZXRhY2hFdmVudHMoKSwgdGhpcy4kY29udGFpbmVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIiwgdGhpcy5zdGF0ZSA9IFwiaGlkZGVuXCIpO1xuICAgICAgfVxuXG4gICAgICBjbGVhbnVwKCkge1xuICAgICAgICB0aGlzLkNhcm91c2VsICYmICh0aGlzLkNhcm91c2VsLmRlc3Ryb3koKSwgdGhpcy5DYXJvdXNlbCA9IG51bGwpLCB0aGlzLiRjb250YWluZXIgJiYgKHRoaXMuJGNvbnRhaW5lci5yZW1vdmUoKSwgdGhpcy4kY29udGFpbmVyID0gbnVsbCksIHRoaXMuc3RhdGUgPSBcImluaXRcIjtcbiAgICAgIH1cblxuICAgICAgYXR0YWNoKCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94Lm9uKHRoaXMuZXZlbnRzKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoKCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94Lm9mZih0aGlzLmV2ZW50cyksIHRoaXMuY2xlYW51cCgpO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgQy5kZWZhdWx0cyA9ICQ7XG5cbiAgICBjb25zdCBTID0gKHQsIGUpID0+IHtcbiAgICAgIGNvbnN0IGkgPSBuZXcgVVJMKHQpLFxuICAgICAgICAgICAgcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoaS5zZWFyY2gpO1xuICAgICAgbGV0IG8gPSBuZXcgVVJMU2VhcmNoUGFyYW1zKCk7XG5cbiAgICAgIGZvciAoY29uc3QgW3QsIGldIG9mIFsuLi5zLCAuLi5PYmplY3QuZW50cmllcyhlKV0pIFwidFwiID09PSB0ID8gby5zZXQoXCJzdGFydFwiLCBwYXJzZUludChpKSkgOiBvLnNldCh0LCBpKTtcblxuICAgICAgbyA9IG8udG9TdHJpbmcoKTtcbiAgICAgIGxldCBuID0gdC5tYXRjaCgvI3Q9KCguKik/XFxkK3MpLyk7XG4gICAgICByZXR1cm4gbiAmJiAobyArPSBgI3Q9JHtuWzFdfWApLCBvO1xuICAgIH0sXG4gICAgICAgICAgRSA9IHtcbiAgICAgIHZpZGVvOiB7XG4gICAgICAgIGF1dG9wbGF5OiAhMCxcbiAgICAgICAgcmF0aW86IDE2IC8gOVxuICAgICAgfSxcbiAgICAgIHlvdXR1YmU6IHtcbiAgICAgICAgYXV0b2hpZGU6IDEsXG4gICAgICAgIGZzOiAxLFxuICAgICAgICByZWw6IDAsXG4gICAgICAgIGhkOiAxLFxuICAgICAgICB3bW9kZTogXCJ0cmFuc3BhcmVudFwiLFxuICAgICAgICBlbmFibGVqc2FwaTogMSxcbiAgICAgICAgaHRtbDU6IDFcbiAgICAgIH0sXG4gICAgICB2aW1lbzoge1xuICAgICAgICBoZDogMSxcbiAgICAgICAgc2hvd190aXRsZTogMSxcbiAgICAgICAgc2hvd19ieWxpbmU6IDEsXG4gICAgICAgIHNob3dfcG9ydHJhaXQ6IDAsXG4gICAgICAgIGZ1bGxzY3JlZW46IDFcbiAgICAgIH0sXG4gICAgICBodG1sNXZpZGVvOiB7XG4gICAgICAgIHRwbDogJzx2aWRlbyBjbGFzcz1cImZhbmN5Ym94X19odG1sNXZpZGVvXCIgcGxheXNpbmxpbmUgY29udHJvbHMgY29udHJvbHNMaXN0PVwibm9kb3dubG9hZFwiIHBvc3Rlcj1cInt7cG9zdGVyfX1cIj5cXG4gIDxzb3VyY2Ugc3JjPVwie3tzcmN9fVwiIHR5cGU9XCJ7e2Zvcm1hdH19XCIgLz5Tb3JyeSwgeW91ciBicm93c2VyIGRvZXNuXFwndCBzdXBwb3J0IGVtYmVkZGVkIHZpZGVvcy48L3ZpZGVvPicsXG4gICAgICAgIGZvcm1hdDogXCJcIlxuICAgICAgfVxuICAgIH07XG5cbiAgICBjbGFzcyBQIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveCA9IHQ7XG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIFtcIm9uSW5pdFwiLCBcIm9uUmVhZHlcIiwgXCJvbkNyZWF0ZVNsaWRlXCIsIFwib25SZW1vdmVTbGlkZVwiLCBcIm9uU2VsZWN0U2xpZGVcIiwgXCJvblVuc2VsZWN0U2xpZGVcIiwgXCJvblJlZnJlc2hcIiwgXCJvbk1lc3NhZ2VcIl0pIHRoaXNbdF0gPSB0aGlzW3RdLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5ldmVudHMgPSB7XG4gICAgICAgICAgaW5pdDogdGhpcy5vbkluaXQsXG4gICAgICAgICAgcmVhZHk6IHRoaXMub25SZWFkeSxcbiAgICAgICAgICBcIkNhcm91c2VsLmNyZWF0ZVNsaWRlXCI6IHRoaXMub25DcmVhdGVTbGlkZSxcbiAgICAgICAgICBcIkNhcm91c2VsLnJlbW92ZVNsaWRlXCI6IHRoaXMub25SZW1vdmVTbGlkZSxcbiAgICAgICAgICBcIkNhcm91c2VsLnNlbGVjdFNsaWRlXCI6IHRoaXMub25TZWxlY3RTbGlkZSxcbiAgICAgICAgICBcIkNhcm91c2VsLnVuc2VsZWN0U2xpZGVcIjogdGhpcy5vblVuc2VsZWN0U2xpZGUsXG4gICAgICAgICAgXCJDYXJvdXNlbC5yZWZyZXNoXCI6IHRoaXMub25SZWZyZXNoXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9uSW5pdCgpIHtcbiAgICAgICAgZm9yIChjb25zdCB0IG9mIHRoaXMuZmFuY3lib3guaXRlbXMpIHRoaXMucHJvY2Vzc1R5cGUodCk7XG4gICAgICB9XG5cbiAgICAgIHByb2Nlc3NUeXBlKHQpIHtcbiAgICAgICAgaWYgKHQuaHRtbCkgcmV0dXJuIHQuc3JjID0gdC5odG1sLCB0LnR5cGUgPSBcImh0bWxcIiwgdm9pZCBkZWxldGUgdC5odG1sO1xuICAgICAgICBjb25zdCBpID0gdC5zcmMgfHwgXCJcIjtcbiAgICAgICAgbGV0IHMgPSB0LnR5cGUgfHwgdGhpcy5mYW5jeWJveC5vcHRpb25zLnR5cGUsXG4gICAgICAgICAgICBvID0gbnVsbDtcblxuICAgICAgICBpZiAoIWkgfHwgXCJzdHJpbmdcIiA9PSB0eXBlb2YgaSkge1xuICAgICAgICAgIGlmIChvID0gaS5tYXRjaCgvKD86eW91dHViZVxcLmNvbXx5b3V0dVxcLmJlfHlvdXR1YmVcXC1ub2Nvb2tpZVxcLmNvbSlcXC8oPzp3YXRjaFxcPyg/Oi4qJik/dj18dlxcL3x1XFwvfGVtYmVkXFwvPyk/KHZpZGVvc2VyaWVzXFw/bGlzdD0oPzouKil8W1xcdy1dezExfXxcXD9saXN0VHlwZT0oPzouKikmbGlzdD0oPzouKikpKD86LiopL2kpKSB7XG4gICAgICAgICAgICBjb25zdCBlID0gUyhpLCB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkh0bWwueW91dHViZVwiKSksXG4gICAgICAgICAgICAgICAgICBuID0gZW5jb2RlVVJJQ29tcG9uZW50KG9bMV0pO1xuICAgICAgICAgICAgdC52aWRlb0lkID0gbiwgdC5zcmMgPSBgaHR0cHM6Ly93d3cueW91dHViZS1ub2Nvb2tpZS5jb20vZW1iZWQvJHtufT8ke2V9YCwgdC50aHVtYiA9IHQudGh1bWIgfHwgYGh0dHBzOi8vaS55dGltZy5jb20vdmkvJHtufS9tcWRlZmF1bHQuanBnYCwgdC52ZW5kb3IgPSBcInlvdXR1YmVcIiwgcyA9IFwidmlkZW9cIjtcbiAgICAgICAgICB9IGVsc2UgaWYgKG8gPSBpLm1hdGNoKC9eLit2aW1lby5jb21cXC8oPzpcXC8pPyhbXFxkXSspKC4qKT8vKSkge1xuICAgICAgICAgICAgY29uc3QgZSA9IFMoaSwgdGhpcy5mYW5jeWJveC5vcHRpb24oXCJIdG1sLnZpbWVvXCIpKSxcbiAgICAgICAgICAgICAgICAgIG4gPSBlbmNvZGVVUklDb21wb25lbnQob1sxXSk7XG4gICAgICAgICAgICB0LnZpZGVvSWQgPSBuLCB0LnNyYyA9IGBodHRwczovL3BsYXllci52aW1lby5jb20vdmlkZW8vJHtufT8ke2V9YCwgdC52ZW5kb3IgPSBcInZpbWVvXCIsIHMgPSBcInZpZGVvXCI7XG4gICAgICAgICAgfSBlbHNlIChvID0gaS5tYXRjaCgvKD86bWFwc1xcLik/Z29vZ2xlXFwuKFthLXpdezIsM30oPzpcXC5bYS16XXsyfSk/KVxcLyg/Oig/Oig/Om1hcHNcXC8oPzpwbGFjZVxcLyg/Oi4qKVxcLyk/XFxAKC4qKSwoXFxkKy4/XFxkKz8peikpfCg/OlxcP2xsPSkpKC4qKT8vaSkpID8gKHQuc3JjID0gYC8vbWFwcy5nb29nbGUuJHtvWzFdfS8/bGw9JHsob1syXSA/IG9bMl0gKyBcIiZ6PVwiICsgTWF0aC5mbG9vcihvWzNdKSArIChvWzRdID8gb1s0XS5yZXBsYWNlKC9eXFwvLywgXCImXCIpIDogXCJcIikgOiBvWzRdICsgXCJcIikucmVwbGFjZSgvXFw/LywgXCImXCIpfSZvdXRwdXQ9JHtvWzRdICYmIG9bNF0uaW5kZXhPZihcImxheWVyPWNcIikgPiAwID8gXCJzdmVtYmVkXCIgOiBcImVtYmVkXCJ9YCwgcyA9IFwibWFwXCIpIDogKG8gPSBpLm1hdGNoKC8oPzptYXBzXFwuKT9nb29nbGVcXC4oW2Etel17MiwzfSg/OlxcLlthLXpdezJ9KT8pXFwvKD86bWFwc1xcL3NlYXJjaFxcLykoLiopL2kpKSAmJiAodC5zcmMgPSBgLy9tYXBzLmdvb2dsZS4ke29bMV19L21hcHM/cT0ke29bMl0ucmVwbGFjZShcInF1ZXJ5PVwiLCBcInE9XCIpLnJlcGxhY2UoXCJhcGk9MVwiLCBcIlwiKX0mb3V0cHV0PWVtYmVkYCwgcyA9IFwibWFwXCIpO1xuXG4gICAgICAgICAgcyB8fCAoXCIjXCIgPT09IGkuY2hhckF0KDApID8gcyA9IFwiaW5saW5lXCIgOiAobyA9IGkubWF0Y2goL1xcLihtcDR8bW92fG9ndnx3ZWJtKSgoXFw/fCMpLiopPyQvaSkpID8gKHMgPSBcImh0bWw1dmlkZW9cIiwgdC5mb3JtYXQgPSB0LmZvcm1hdCB8fCBcInZpZGVvL1wiICsgKFwib2d2XCIgPT09IG9bMV0gPyBcIm9nZ1wiIDogb1sxXSkpIDogaS5tYXRjaCgvKF5kYXRhOmltYWdlXFwvW2EtejAtOStcXC89XSosKXwoXFwuKGpwKGV8Z3xlZyl8Z2lmfHBuZ3xibXB8d2VicHxzdmd8aWNvKSgoXFw/fCMpLiopPyQpL2kpID8gcyA9IFwiaW1hZ2VcIiA6IGkubWF0Y2goL1xcLihwZGYpKChcXD98IykuKik/JC9pKSAmJiAocyA9IFwicGRmXCIpKSwgdC50eXBlID0gcyB8fCB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcImRlZmF1bHRUeXBlXCIsIFwiaW1hZ2VcIiksIFwiaHRtbDV2aWRlb1wiICE9PSBzICYmIFwidmlkZW9cIiAhPT0gcyB8fCAodC52aWRlbyA9IGUoe30sIHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSHRtbC52aWRlb1wiKSwgdC52aWRlbyksIHQuX3dpZHRoICYmIHQuX2hlaWdodCA/IHQucmF0aW8gPSBwYXJzZUZsb2F0KHQuX3dpZHRoKSAvIHBhcnNlRmxvYXQodC5faGVpZ2h0KSA6IHQucmF0aW8gPSB0LnJhdGlvIHx8IHQudmlkZW8ucmF0aW8gfHwgRS52aWRlby5yYXRpbyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb25SZWFkeSgpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveC5DYXJvdXNlbC5zbGlkZXMuZm9yRWFjaCh0ID0+IHtcbiAgICAgICAgICB0LiRlbCAmJiAodGhpcy5zZXRDb250ZW50KHQpLCB0LmluZGV4ID09PSB0aGlzLmZhbmN5Ym94LmdldFNsaWRlKCkuaW5kZXggJiYgdGhpcy5wbGF5VmlkZW8odCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgb25DcmVhdGVTbGlkZSh0LCBlLCBpKSB7XG4gICAgICAgIFwicmVhZHlcIiA9PT0gdGhpcy5mYW5jeWJveC5zdGF0ZSAmJiB0aGlzLnNldENvbnRlbnQoaSk7XG4gICAgICB9XG5cbiAgICAgIGxvYWRJbmxpbmVDb250ZW50KHQpIHtcbiAgICAgICAgbGV0IGU7XG4gICAgICAgIGlmICh0LnNyYyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSBlID0gdC5zcmM7ZWxzZSBpZiAoXCJzdHJpbmdcIiA9PSB0eXBlb2YgdC5zcmMpIHtcbiAgICAgICAgICBjb25zdCBpID0gdC5zcmMuc3BsaXQoXCIjXCIsIDIpLFxuICAgICAgICAgICAgICAgIHMgPSAyID09PSBpLmxlbmd0aCAmJiBcIlwiID09PSBpWzBdID8gaVsxXSA6IGlbMF07XG4gICAgICAgICAgZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHMpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICBpZiAoXCJjbG9uZVwiID09PSB0LnR5cGUgfHwgZS4kcGxhY2VIb2xkZXIpIHtcbiAgICAgICAgICAgIGUgPSBlLmNsb25lTm9kZSghMCk7XG4gICAgICAgICAgICBsZXQgaSA9IGUuZ2V0QXR0cmlidXRlKFwiaWRcIik7XG4gICAgICAgICAgICBpID0gaSA/IGAke2l9LS1jbG9uZWAgOiBgY2xvbmUtJHt0aGlzLmZhbmN5Ym94LmlkfS0ke3QuaW5kZXh9YCwgZS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICB0LmNsYXNzTGlzdC5hZGQoXCJmYW5jeWJveC1wbGFjZWhvbGRlclwiKSwgZS5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0LCBlKSwgZS4kcGxhY2VIb2xkZXIgPSB0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuZmFuY3lib3guc2V0Q29udGVudCh0LCBlKTtcbiAgICAgICAgfSBlbHNlIHRoaXMuZmFuY3lib3guc2V0RXJyb3IodCwgXCJ7e0VMRU1FTlRfTk9UX0ZPVU5EfX1cIik7XG4gICAgICB9XG5cbiAgICAgIGxvYWRBamF4Q29udGVudCh0KSB7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLmZhbmN5Ym94LFxuICAgICAgICAgICAgICBpID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIGUuc2hvd0xvYWRpbmcodCksIGkub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGkucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSAmJiBcInJlYWR5XCIgPT09IGUuc3RhdGUgJiYgKGUuaGlkZUxvYWRpbmcodCksIDIwMCA9PT0gaS5zdGF0dXMgPyBlLnNldENvbnRlbnQodCwgaS5yZXNwb25zZVRleHQpIDogZS5zZXRFcnJvcih0LCA0MDQgPT09IGkuc3RhdHVzID8gXCJ7e0FKQVhfTk9UX0ZPVU5EfX1cIiA6IFwie3tBSkFYX0ZPUkJJRERFTn19XCIpKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcyA9IHQuYWpheCB8fCBudWxsO1xuICAgICAgICBpLm9wZW4ocyA/IFwiUE9TVFwiIDogXCJHRVRcIiwgdC5zcmMpLCBpLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIiksIGkuc2V0UmVxdWVzdEhlYWRlcihcIlgtUmVxdWVzdGVkLVdpdGhcIiwgXCJYTUxIdHRwUmVxdWVzdFwiKSwgaS5zZW5kKHMpLCB0LnhociA9IGk7XG4gICAgICB9XG5cbiAgICAgIGxvYWRJZnJhbWVDb250ZW50KHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMuZmFuY3lib3gsXG4gICAgICAgICAgICAgIGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpO1xuICAgICAgICBpZiAoaS5jbGFzc05hbWUgPSBcImZhbmN5Ym94X19pZnJhbWVcIiwgaS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgZmFuY3lib3hfX2lmcmFtZV8ke2UuaWR9XyR7dC5pbmRleH1gKSwgaS5zZXRBdHRyaWJ1dGUoXCJhbGxvd1wiLCBcImF1dG9wbGF5OyBmdWxsc2NyZWVuXCIpLCBpLnNldEF0dHJpYnV0ZShcInNjcm9sbGluZ1wiLCBcImF1dG9cIiksIHQuJGlmcmFtZSA9IGksIFwiaWZyYW1lXCIgIT09IHQudHlwZSB8fCAhMSA9PT0gdC5wcmVsb2FkKSByZXR1cm4gaS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdC5zcmMpLCB0aGlzLmZhbmN5Ym94LnNldENvbnRlbnQodCwgaSksIHZvaWQgdGhpcy5yZXNpemVJZnJhbWUodCk7XG4gICAgICAgIGUuc2hvd0xvYWRpbmcodCk7XG4gICAgICAgIGNvbnN0IHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBzLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiLCB0aGlzLmZhbmN5Ym94LnNldENvbnRlbnQodCwgcyksIHMuYXBwZW5kQ2hpbGQoaSksIGkub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICBlLnNldEVycm9yKHQsIFwie3tJRlJBTUVfRVJST1J9fVwiKTtcbiAgICAgICAgfSwgaS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgZS5oaWRlTG9hZGluZyh0KTtcbiAgICAgICAgICBsZXQgcyA9ICExO1xuICAgICAgICAgIGkuaXNSZWFkeSB8fCAoaS5pc1JlYWR5ID0gITAsIHMgPSAhMCksIGkuc3JjLmxlbmd0aCAmJiAoaS5wYXJlbnROb2RlLnN0eWxlLnZpc2liaWxpdHkgPSBcIlwiLCB0aGlzLnJlc2l6ZUlmcmFtZSh0KSwgcyAmJiBlLnJldmVhbENvbnRlbnQodCkpO1xuICAgICAgICB9LCBpLnNldEF0dHJpYnV0ZShcInNyY1wiLCB0LnNyYyk7XG4gICAgICB9XG5cbiAgICAgIHNldEFzcGVjdFJhdGlvKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHQuJGNvbnRlbnQsXG4gICAgICAgICAgICAgIGkgPSB0LnJhdGlvO1xuICAgICAgICBpZiAoIWUpIHJldHVybjtcbiAgICAgICAgbGV0IHMgPSB0Ll93aWR0aCxcbiAgICAgICAgICAgIG8gPSB0Ll9oZWlnaHQ7XG5cbiAgICAgICAgaWYgKGkgfHwgcyAmJiBvKSB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihlLnN0eWxlLCB7XG4gICAgICAgICAgICB3aWR0aDogcyAmJiBvID8gXCIxMDAlXCIgOiBcIlwiLFxuICAgICAgICAgICAgaGVpZ2h0OiBzICYmIG8gPyBcIjEwMCVcIiA6IFwiXCIsXG4gICAgICAgICAgICBtYXhXaWR0aDogXCJcIixcbiAgICAgICAgICAgIG1heEhlaWdodDogXCJcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxldCB0ID0gZS5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgICAgbiA9IGUub2Zmc2V0SGVpZ2h0O1xuXG4gICAgICAgICAgaWYgKHMgPSBzIHx8IHQsIG8gPSBvIHx8IG4sIHMgPiB0IHx8IG8gPiBuKSB7XG4gICAgICAgICAgICBsZXQgZSA9IE1hdGgubWluKHQgLyBzLCBuIC8gbyk7XG4gICAgICAgICAgICBzICo9IGUsIG8gKj0gZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBNYXRoLmFicyhzIC8gbyAtIGkpID4gLjAxICYmIChpIDwgcyAvIG8gPyBzID0gbyAqIGkgOiBvID0gcyAvIGkpLCBPYmplY3QuYXNzaWduKGUuc3R5bGUsIHtcbiAgICAgICAgICAgIHdpZHRoOiBgJHtzfXB4YCxcbiAgICAgICAgICAgIGhlaWdodDogYCR7b31weGBcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXNpemVJZnJhbWUodCkge1xuICAgICAgICBjb25zdCBlID0gdC4kaWZyYW1lO1xuICAgICAgICBpZiAoIWUpIHJldHVybjtcbiAgICAgICAgbGV0IGkgPSB0Ll93aWR0aCB8fCAwLFxuICAgICAgICAgICAgcyA9IHQuX2hlaWdodCB8fCAwO1xuICAgICAgICBpICYmIHMgJiYgKHQuYXV0b1NpemUgPSAhMSk7XG4gICAgICAgIGNvbnN0IG8gPSBlLnBhcmVudE5vZGUsXG4gICAgICAgICAgICAgIG4gPSBvICYmIG8uc3R5bGU7XG4gICAgICAgIGlmICghMSAhPT0gdC5wcmVsb2FkICYmICExICE9PSB0LmF1dG9TaXplICYmIG4pIHRyeSB7XG4gICAgICAgICAgY29uc3QgdCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG8pLFxuICAgICAgICAgICAgICAgIGEgPSBwYXJzZUZsb2F0KHQucGFkZGluZ0xlZnQpICsgcGFyc2VGbG9hdCh0LnBhZGRpbmdSaWdodCksXG4gICAgICAgICAgICAgICAgciA9IHBhcnNlRmxvYXQodC5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQodC5wYWRkaW5nQm90dG9tKSxcbiAgICAgICAgICAgICAgICBoID0gZS5jb250ZW50V2luZG93LmRvY3VtZW50LFxuICAgICAgICAgICAgICAgIGwgPSBoLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaHRtbFwiKVswXSxcbiAgICAgICAgICAgICAgICBjID0gaC5ib2R5O1xuICAgICAgICAgIG4ud2lkdGggPSBcIlwiLCBjLnN0eWxlLm92ZXJmbG93ID0gXCJoaWRkZW5cIiwgaSA9IGkgfHwgbC5zY3JvbGxXaWR0aCArIGEsIG4ud2lkdGggPSBgJHtpfXB4YCwgYy5zdHlsZS5vdmVyZmxvdyA9IFwiXCIsIG4uZmxleCA9IFwiMCAwIGF1dG9cIiwgbi5oZWlnaHQgPSBgJHtjLnNjcm9sbEhlaWdodH1weGAsIHMgPSBsLnNjcm9sbEhlaWdodCArIHI7XG4gICAgICAgIH0gY2F0Y2ggKHQpIHt9XG5cbiAgICAgICAgaWYgKGkgfHwgcykge1xuICAgICAgICAgIGNvbnN0IHQgPSB7XG4gICAgICAgICAgICBmbGV4OiBcIjAgMSBhdXRvXCJcbiAgICAgICAgICB9O1xuICAgICAgICAgIGkgJiYgKHQud2lkdGggPSBgJHtpfXB4YCksIHMgJiYgKHQuaGVpZ2h0ID0gYCR7c31weGApLCBPYmplY3QuYXNzaWduKG4sIHQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG9uUmVmcmVzaCh0LCBlKSB7XG4gICAgICAgIGUuc2xpZGVzLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgdC4kZWwgJiYgKHQuJGlmcmFtZSAmJiB0aGlzLnJlc2l6ZUlmcmFtZSh0KSwgdC5yYXRpbyAmJiB0aGlzLnNldEFzcGVjdFJhdGlvKHQpKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHNldENvbnRlbnQodCkge1xuICAgICAgICBpZiAodCAmJiAhdC5pc0RvbSkge1xuICAgICAgICAgIHN3aXRjaCAodC50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwiaHRtbFwiOlxuICAgICAgICAgICAgICB0aGlzLmZhbmN5Ym94LnNldENvbnRlbnQodCwgdC5zcmMpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcImh0bWw1dmlkZW9cIjpcbiAgICAgICAgICAgICAgdGhpcy5mYW5jeWJveC5zZXRDb250ZW50KHQsIHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSHRtbC5odG1sNXZpZGVvLnRwbFwiKS5yZXBsYWNlKC9cXHtcXHtzcmNcXH1cXH0vZ2ksIHQuc3JjKS5yZXBsYWNlKFwie3tmb3JtYXR9fVwiLCB0LmZvcm1hdCB8fCB0Lmh0bWw1dmlkZW8gJiYgdC5odG1sNXZpZGVvLmZvcm1hdCB8fCBcIlwiKS5yZXBsYWNlKFwie3twb3N0ZXJ9fVwiLCB0LnBvc3RlciB8fCB0LnRodW1iIHx8IFwiXCIpKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJpbmxpbmVcIjpcbiAgICAgICAgICAgIGNhc2UgXCJjbG9uZVwiOlxuICAgICAgICAgICAgICB0aGlzLmxvYWRJbmxpbmVDb250ZW50KHQpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcImFqYXhcIjpcbiAgICAgICAgICAgICAgdGhpcy5sb2FkQWpheENvbnRlbnQodCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwicGRmXCI6XG4gICAgICAgICAgICBjYXNlIFwidmlkZW9cIjpcbiAgICAgICAgICAgIGNhc2UgXCJtYXBcIjpcbiAgICAgICAgICAgICAgdC5wcmVsb2FkID0gITE7XG5cbiAgICAgICAgICAgIGNhc2UgXCJpZnJhbWVcIjpcbiAgICAgICAgICAgICAgdGhpcy5sb2FkSWZyYW1lQ29udGVudCh0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0LnJhdGlvICYmIHRoaXMuc2V0QXNwZWN0UmF0aW8odCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb25TZWxlY3RTbGlkZSh0LCBlLCBpKSB7XG4gICAgICAgIFwicmVhZHlcIiA9PT0gdC5zdGF0ZSAmJiB0aGlzLnBsYXlWaWRlbyhpKTtcbiAgICAgIH1cblxuICAgICAgcGxheVZpZGVvKHQpIHtcbiAgICAgICAgaWYgKFwiaHRtbDV2aWRlb1wiID09PSB0LnR5cGUgJiYgdC52aWRlby5hdXRvcGxheSkgdHJ5IHtcbiAgICAgICAgICBjb25zdCBlID0gdC4kZWwucXVlcnlTZWxlY3RvcihcInZpZGVvXCIpO1xuXG4gICAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHQgPSBlLnBsYXkoKTtcbiAgICAgICAgICAgIHZvaWQgMCAhPT0gdCAmJiB0LnRoZW4oKCkgPT4ge30pLmNhdGNoKHQgPT4ge1xuICAgICAgICAgICAgICBlLm11dGVkID0gITAsIGUucGxheSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICh0KSB7fVxuICAgICAgICBpZiAoXCJ2aWRlb1wiICE9PSB0LnR5cGUgfHwgIXQuJGlmcmFtZSB8fCAhdC4kaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHJldHVybjtcblxuICAgICAgICBjb25zdCBlID0gKCkgPT4ge1xuICAgICAgICAgIGlmIChcImRvbmVcIiA9PT0gdC5zdGF0ZSAmJiB0LiRpZnJhbWUgJiYgdC4kaWZyYW1lLmNvbnRlbnRXaW5kb3cpIHtcbiAgICAgICAgICAgIGxldCBlO1xuICAgICAgICAgICAgaWYgKHQuJGlmcmFtZS5pc1JlYWR5KSByZXR1cm4gdC52aWRlbyAmJiB0LnZpZGVvLmF1dG9wbGF5ICYmIChlID0gXCJ5b3V0dWJlXCIgPT0gdC52ZW5kb3IgPyB7XG4gICAgICAgICAgICAgIGV2ZW50OiBcImNvbW1hbmRcIixcbiAgICAgICAgICAgICAgZnVuYzogXCJwbGF5VmlkZW9cIlxuICAgICAgICAgICAgfSA6IHtcbiAgICAgICAgICAgICAgbWV0aG9kOiBcInBsYXlcIixcbiAgICAgICAgICAgICAgdmFsdWU6IFwidHJ1ZVwiXG4gICAgICAgICAgICB9KSwgdm9pZCAoZSAmJiB0LiRpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShlKSwgXCIqXCIpKTtcbiAgICAgICAgICAgIFwieW91dHViZVwiID09PSB0LnZlbmRvciAmJiAoZSA9IHtcbiAgICAgICAgICAgICAgZXZlbnQ6IFwibGlzdGVuaW5nXCIsXG4gICAgICAgICAgICAgIGlkOiB0LiRpZnJhbWUuZ2V0QXR0cmlidXRlKFwiaWRcIilcbiAgICAgICAgICAgIH0sIHQuJGlmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KGUpLCBcIipcIikpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHQucG9sbGVyID0gc2V0VGltZW91dChlLCAyNTApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGUoKTtcbiAgICAgIH1cblxuICAgICAgb25VbnNlbGVjdFNsaWRlKHQsIGUsIGkpIHtcbiAgICAgICAgaWYgKFwiaHRtbDV2aWRlb1wiID09PSBpLnR5cGUpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaS4kZWwucXVlcnlTZWxlY3RvcihcInZpZGVvXCIpLnBhdXNlKCk7XG4gICAgICAgICAgfSBjYXRjaCAodCkge31cblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzID0gITE7XG4gICAgICAgIFwidmltZW9cIiA9PSBpLnZlbmRvciA/IHMgPSB7XG4gICAgICAgICAgbWV0aG9kOiBcInBhdXNlXCIsXG4gICAgICAgICAgdmFsdWU6IFwidHJ1ZVwiXG4gICAgICAgIH0gOiBcInlvdXR1YmVcIiA9PT0gaS52ZW5kb3IgJiYgKHMgPSB7XG4gICAgICAgICAgZXZlbnQ6IFwiY29tbWFuZFwiLFxuICAgICAgICAgIGZ1bmM6IFwicGF1c2VWaWRlb1wiXG4gICAgICAgIH0pLCBzICYmIGkuJGlmcmFtZSAmJiBpLiRpZnJhbWUuY29udGVudFdpbmRvdyAmJiBpLiRpZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShKU09OLnN0cmluZ2lmeShzKSwgXCIqXCIpLCBjbGVhclRpbWVvdXQoaS5wb2xsZXIpO1xuICAgICAgfVxuXG4gICAgICBvblJlbW92ZVNsaWRlKHQsIGUsIGkpIHtcbiAgICAgICAgaS54aHIgJiYgKGkueGhyLmFib3J0KCksIGkueGhyID0gbnVsbCksIGkuJGlmcmFtZSAmJiAoaS4kaWZyYW1lLm9ubG9hZCA9IGkuJGlmcmFtZS5vbmVycm9yID0gbnVsbCwgaS4kaWZyYW1lLnNyYyA9IFwiLy9hYm91dDpibGFua1wiLCBpLiRpZnJhbWUgPSBudWxsKTtcbiAgICAgICAgY29uc3QgcyA9IGkuJGNvbnRlbnQ7XG4gICAgICAgIFwiaW5saW5lXCIgPT09IGkudHlwZSAmJiBzICYmIChzLmNsYXNzTGlzdC5yZW1vdmUoXCJmYW5jeWJveF9fY29udGVudFwiKSwgXCJub25lXCIgIT09IHMuc3R5bGUuZGlzcGxheSAmJiAocy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCIpKSwgaS4kY2xvc2VCdXR0b24gJiYgKGkuJGNsb3NlQnV0dG9uLnJlbW92ZSgpLCBpLiRjbG9zZUJ1dHRvbiA9IG51bGwpO1xuICAgICAgICBjb25zdCBvID0gcyAmJiBzLiRwbGFjZUhvbGRlcjtcbiAgICAgICAgbyAmJiAoby5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzLCBvKSwgby5yZW1vdmUoKSwgcy4kcGxhY2VIb2xkZXIgPSBudWxsKTtcbiAgICAgIH1cblxuICAgICAgb25NZXNzYWdlKHQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsZXQgZSA9IEpTT04ucGFyc2UodC5kYXRhKTtcblxuICAgICAgICAgIGlmIChcImh0dHBzOi8vcGxheWVyLnZpbWVvLmNvbVwiID09PSB0Lm9yaWdpbikge1xuICAgICAgICAgICAgaWYgKFwicmVhZHlcIiA9PT0gZS5ldmVudCkgZm9yIChsZXQgZSBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZmFuY3lib3hfX2lmcmFtZVwiKSkgZS5jb250ZW50V2luZG93ID09PSB0LnNvdXJjZSAmJiAoZS5pc1JlYWR5ID0gMSk7XG4gICAgICAgICAgfSBlbHNlIFwiaHR0cHM6Ly93d3cueW91dHViZS1ub2Nvb2tpZS5jb21cIiA9PT0gdC5vcmlnaW4gJiYgXCJvblJlYWR5XCIgPT09IGUuZXZlbnQgJiYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGUuaWQpLmlzUmVhZHkgPSAxKTtcbiAgICAgICAgfSBjYXRjaCAodCkge31cbiAgICAgIH1cblxuICAgICAgYXR0YWNoKCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94Lm9uKHRoaXMuZXZlbnRzKSwgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMub25NZXNzYWdlLCAhMSk7XG4gICAgICB9XG5cbiAgICAgIGRldGFjaCgpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveC5vZmYodGhpcy5ldmVudHMpLCB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5vbk1lc3NhZ2UsICExKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIFAuZGVmYXVsdHMgPSBFO1xuXG4gICAgY2xhc3MgVCB7XG4gICAgICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgICAgIHRoaXMuZmFuY3lib3ggPSB0O1xuXG4gICAgICAgIGZvciAoY29uc3QgdCBvZiBbXCJvblJlYWR5XCIsIFwib25DbG9zaW5nXCIsIFwib25Eb25lXCIsIFwib25QYWdlQ2hhbmdlXCIsIFwib25DcmVhdGVTbGlkZVwiLCBcIm9uUmVtb3ZlU2xpZGVcIiwgXCJvbkltYWdlU3RhdHVzQ2hhbmdlXCJdKSB0aGlzW3RdID0gdGhpc1t0XS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge1xuICAgICAgICAgIHJlYWR5OiB0aGlzLm9uUmVhZHksXG4gICAgICAgICAgY2xvc2luZzogdGhpcy5vbkNsb3NpbmcsXG4gICAgICAgICAgZG9uZTogdGhpcy5vbkRvbmUsXG4gICAgICAgICAgXCJDYXJvdXNlbC5jaGFuZ2VcIjogdGhpcy5vblBhZ2VDaGFuZ2UsXG4gICAgICAgICAgXCJDYXJvdXNlbC5jcmVhdGVTbGlkZVwiOiB0aGlzLm9uQ3JlYXRlU2xpZGUsXG4gICAgICAgICAgXCJDYXJvdXNlbC5yZW1vdmVTbGlkZVwiOiB0aGlzLm9uUmVtb3ZlU2xpZGVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb25SZWFkeSgpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveC5DYXJvdXNlbC5zbGlkZXMuZm9yRWFjaCh0ID0+IHtcbiAgICAgICAgICB0LiRlbCAmJiB0aGlzLnNldENvbnRlbnQodCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBvbkRvbmUodCwgZSkge1xuICAgICAgICB0aGlzLmhhbmRsZUN1cnNvcihlKTtcbiAgICAgIH1cblxuICAgICAgb25DbG9zaW5nKHQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY2xpY2tUaW1lciksIHRoaXMuY2xpY2tUaW1lciA9IG51bGwsIHQuQ2Fyb3VzZWwuc2xpZGVzLmZvckVhY2godCA9PiB7XG4gICAgICAgICAgdC4kaW1hZ2UgJiYgKHQuc3RhdGUgPSBcImRlc3Ryb3lcIiksIHQuUGFuem9vbSAmJiB0LlBhbnpvb20uZGV0YWNoRXZlbnRzKCk7XG4gICAgICAgIH0pLCBcImNsb3NpbmdcIiA9PT0gdGhpcy5mYW5jeWJveC5zdGF0ZSAmJiB0aGlzLmNhblpvb20odC5nZXRTbGlkZSgpKSAmJiB0aGlzLnpvb21PdXQoKTtcbiAgICAgIH1cblxuICAgICAgb25DcmVhdGVTbGlkZSh0LCBlLCBpKSB7XG4gICAgICAgIFwicmVhZHlcIiA9PT0gdGhpcy5mYW5jeWJveC5zdGF0ZSAmJiB0aGlzLnNldENvbnRlbnQoaSk7XG4gICAgICB9XG5cbiAgICAgIG9uUmVtb3ZlU2xpZGUodCwgZSwgaSkge1xuICAgICAgICBpLiRpbWFnZSAmJiAoaS4kZWwuY2xhc3NMaXN0LnJlbW92ZSh0Lm9wdGlvbihcIkltYWdlLmNhblpvb21JbkNsYXNzXCIpKSwgaS4kaW1hZ2UucmVtb3ZlKCksIGkuJGltYWdlID0gbnVsbCksIGkuUGFuem9vbSAmJiAoaS5QYW56b29tLmRlc3Ryb3koKSwgaS5QYW56b29tID0gbnVsbCksIGkuJGVsICYmIGkuJGVsLmRhdGFzZXQgJiYgZGVsZXRlIGkuJGVsLmRhdGFzZXQuaW1hZ2VGaXQ7XG4gICAgICB9XG5cbiAgICAgIHNldENvbnRlbnQodCkge1xuICAgICAgICBpZiAodC5pc0RvbSB8fCB0Lmh0bWwgfHwgdC50eXBlICYmIFwiaW1hZ2VcIiAhPT0gdC50eXBlKSByZXR1cm47XG4gICAgICAgIGlmICh0LiRpbWFnZSkgcmV0dXJuO1xuICAgICAgICB0LnR5cGUgPSBcImltYWdlXCIsIHQuc3RhdGUgPSBcImxvYWRpbmdcIjtcbiAgICAgICAgY29uc3QgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGUuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgIGNvbnN0IGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICBpLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGUgPT4ge1xuICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCksIHRoaXMub25JbWFnZVN0YXR1c0NoYW5nZSh0KTtcbiAgICAgICAgfSksIGkuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsICgpID0+IHtcbiAgICAgICAgICB0aGlzLm9uSW1hZ2VTdGF0dXNDaGFuZ2UodCk7XG4gICAgICAgIH0pLCBpLnNyYyA9IHQuc3JjLCBpLmFsdCA9IFwiXCIsIGkuZHJhZ2dhYmxlID0gITEsIGkuY2xhc3NMaXN0LmFkZChcImZhbmN5Ym94X19pbWFnZVwiKSwgdC5zcmNzZXQgJiYgaS5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIiwgdC5zcmNzZXQpLCB0LnNpemVzICYmIGkuc2V0QXR0cmlidXRlKFwic2l6ZXNcIiwgdC5zaXplcyksIHQuJGltYWdlID0gaTtcbiAgICAgICAgY29uc3QgcyA9IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2Uud3JhcFwiKTtcblxuICAgICAgICBpZiAocykge1xuICAgICAgICAgIGNvbnN0IG8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgIG8uY2xhc3NMaXN0LmFkZChcInN0cmluZ1wiID09IHR5cGVvZiBzID8gcyA6IFwiZmFuY3lib3hfX2ltYWdlLXdyYXBcIiksIG8uYXBwZW5kQ2hpbGQoaSksIGUuYXBwZW5kQ2hpbGQobyksIHQuJHdyYXAgPSBvO1xuICAgICAgICB9IGVsc2UgZS5hcHBlbmRDaGlsZChpKTtcblxuICAgICAgICB0LiRlbC5kYXRhc2V0LmltYWdlRml0ID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS5maXRcIiksIHRoaXMuZmFuY3lib3guc2V0Q29udGVudCh0LCBlKSwgaS5jb21wbGV0ZSB8fCBpLmVycm9yID8gdGhpcy5vbkltYWdlU3RhdHVzQ2hhbmdlKHQpIDogdGhpcy5mYW5jeWJveC5zaG93TG9hZGluZyh0KTtcbiAgICAgIH1cblxuICAgICAgb25JbWFnZVN0YXR1c0NoYW5nZSh0KSB7XG4gICAgICAgIGNvbnN0IGUgPSB0LiRpbWFnZTtcbiAgICAgICAgZSAmJiBcImxvYWRpbmdcIiA9PT0gdC5zdGF0ZSAmJiAoZS5jb21wbGV0ZSAmJiBlLm5hdHVyYWxXaWR0aCAmJiBlLm5hdHVyYWxIZWlnaHQgPyAodGhpcy5mYW5jeWJveC5oaWRlTG9hZGluZyh0KSwgXCJjb250YWluXCIgPT09IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2UuZml0XCIpICYmIHRoaXMuaW5pdFNsaWRlUGFuem9vbSh0KSwgdC4kZWwuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIGUgPT4gdGhpcy5vbldoZWVsKHQsIGUpLCB7XG4gICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgfSksIHQuJGNvbnRlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGUgPT4gdGhpcy5vbkNsaWNrKHQsIGUpLCB7XG4gICAgICAgICAgcGFzc2l2ZTogITFcbiAgICAgICAgfSksIHRoaXMucmV2ZWFsQ29udGVudCh0KSkgOiB0aGlzLmZhbmN5Ym94LnNldEVycm9yKHQsIFwie3tJTUFHRV9FUlJPUn19XCIpKTtcbiAgICAgIH1cblxuICAgICAgaW5pdFNsaWRlUGFuem9vbSh0KSB7XG4gICAgICAgIHQuUGFuem9vbSB8fCAodC5QYW56b29tID0gbmV3IGQodC4kZWwsIGUoITAsIHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2UuUGFuem9vbVwiLCB7fSksIHtcbiAgICAgICAgICB2aWV3cG9ydDogdC4kd3JhcCxcbiAgICAgICAgICBjb250ZW50OiB0LiRpbWFnZSxcbiAgICAgICAgICB3aWR0aDogdC5fd2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiB0Ll9oZWlnaHQsXG4gICAgICAgICAgd3JhcElubmVyOiAhMSxcbiAgICAgICAgICB0ZXh0U2VsZWN0aW9uOiAhMCxcbiAgICAgICAgICB0b3VjaDogdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS50b3VjaFwiKSxcbiAgICAgICAgICBwYW5Pbmx5Wm9vbWVkOiAhMCxcbiAgICAgICAgICBjbGljazogITEsXG4gICAgICAgICAgd2hlZWw6ICExXG4gICAgICAgIH0pKSwgdC5QYW56b29tLm9uKFwic3RhcnRBbmltYXRpb25cIiwgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuZmFuY3lib3gudHJpZ2dlcihcIkltYWdlLnN0YXJ0QW5pbWF0aW9uXCIsIHQpO1xuICAgICAgICB9KSwgdC5QYW56b29tLm9uKFwiZW5kQW5pbWF0aW9uXCIsICgpID0+IHtcbiAgICAgICAgICBcInpvb21JblwiID09PSB0LnN0YXRlICYmIHRoaXMuZmFuY3lib3guZG9uZSh0KSwgdGhpcy5oYW5kbGVDdXJzb3IodCksIHRoaXMuZmFuY3lib3gudHJpZ2dlcihcIkltYWdlLmVuZEFuaW1hdGlvblwiLCB0KTtcbiAgICAgICAgfSksIHQuUGFuem9vbS5vbihcImFmdGVyVXBkYXRlXCIsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUN1cnNvcih0KSwgdGhpcy5mYW5jeWJveC50cmlnZ2VyKFwiSW1hZ2UuYWZ0ZXJVcGRhdGVcIiwgdCk7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cblxuICAgICAgcmV2ZWFsQ29udGVudCh0KSB7XG4gICAgICAgIG51bGwgPT09IHRoaXMuZmFuY3lib3guQ2Fyb3VzZWwucHJldlBhZ2UgJiYgdC5pbmRleCA9PT0gdGhpcy5mYW5jeWJveC5vcHRpb25zLnN0YXJ0SW5kZXggJiYgdGhpcy5jYW5ab29tKHQpID8gdGhpcy56b29tSW4oKSA6IHRoaXMuZmFuY3lib3gucmV2ZWFsQ29udGVudCh0KTtcbiAgICAgIH1cblxuICAgICAgZ2V0Wm9vbUluZm8odCkge1xuICAgICAgICBjb25zdCBlID0gdC4kdGh1bWIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICAgIGkgPSBlLndpZHRoLFxuICAgICAgICAgICAgICBzID0gZS5oZWlnaHQsXG4gICAgICAgICAgICAgIG8gPSB0LiRjb250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgICBuID0gby53aWR0aCxcbiAgICAgICAgICAgICAgYSA9IG8uaGVpZ2h0LFxuICAgICAgICAgICAgICByID0gby50b3AgLSBlLnRvcCxcbiAgICAgICAgICAgICAgaCA9IG8ubGVmdCAtIGUubGVmdDtcbiAgICAgICAgbGV0IGwgPSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLnpvb21PcGFjaXR5XCIpO1xuICAgICAgICByZXR1cm4gXCJhdXRvXCIgPT09IGwgJiYgKGwgPSBNYXRoLmFicyhpIC8gcyAtIG4gLyBhKSA+IC4xKSwge1xuICAgICAgICAgIHRvcDogcixcbiAgICAgICAgICBsZWZ0OiBoLFxuICAgICAgICAgIHNjYWxlOiBuICYmIGkgPyBpIC8gbiA6IDEsXG4gICAgICAgICAgb3BhY2l0eTogbFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBjYW5ab29tKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMuZmFuY3lib3gsXG4gICAgICAgICAgICAgIGkgPSBlLiRjb250YWluZXI7XG4gICAgICAgIGlmICh3aW5kb3cudmlzdWFsVmlld3BvcnQgJiYgMSAhPT0gd2luZG93LnZpc3VhbFZpZXdwb3J0LnNjYWxlKSByZXR1cm4gITE7XG4gICAgICAgIGlmICh0LlBhbnpvb20gJiYgIXQuUGFuem9vbS5jb250ZW50LndpZHRoKSByZXR1cm4gITE7XG4gICAgICAgIGlmICghZS5vcHRpb24oXCJJbWFnZS56b29tXCIpIHx8IFwiY29udGFpblwiICE9PSBlLm9wdGlvbihcIkltYWdlLmZpdFwiKSkgcmV0dXJuICExO1xuICAgICAgICBjb25zdCBzID0gdC4kdGh1bWI7XG4gICAgICAgIGlmICghcyB8fCBcImxvYWRpbmdcIiA9PT0gdC5zdGF0ZSkgcmV0dXJuICExO1xuICAgICAgICBpLmNsYXNzTGlzdC5hZGQoXCJmYW5jeWJveF9fbm8tY2xpY2tcIik7XG4gICAgICAgIGNvbnN0IG8gPSBzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgbjtcblxuICAgICAgICBpZiAodGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS5pZ25vcmVDb3ZlcmVkVGh1bWJuYWlsXCIpKSB7XG4gICAgICAgICAgY29uc3QgdCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoby5sZWZ0ICsgMSwgby50b3AgKyAxKSA9PT0gcyxcbiAgICAgICAgICAgICAgICBlID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChvLnJpZ2h0IC0gMSwgby5ib3R0b20gLSAxKSA9PT0gcztcbiAgICAgICAgICBuID0gdCAmJiBlO1xuICAgICAgICB9IGVsc2UgbiA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoby5sZWZ0ICsgLjUgKiBvLndpZHRoLCBvLnRvcCArIC41ICogby5oZWlnaHQpID09PSBzO1xuXG4gICAgICAgIHJldHVybiBpLmNsYXNzTGlzdC5yZW1vdmUoXCJmYW5jeWJveF9fbm8tY2xpY2tcIiksIG47XG4gICAgICB9XG5cbiAgICAgIHpvb21JbigpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuZmFuY3lib3gsXG4gICAgICAgICAgICAgIGUgPSB0LmdldFNsaWRlKCksXG4gICAgICAgICAgICAgIGkgPSBlLlBhbnpvb20sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICB0b3A6IHMsXG4gICAgICAgICAgbGVmdDogbyxcbiAgICAgICAgICBzY2FsZTogbixcbiAgICAgICAgICBvcGFjaXR5OiBhXG4gICAgICAgIH0gPSB0aGlzLmdldFpvb21JbmZvKGUpO1xuICAgICAgICB0LnRyaWdnZXIoXCJyZXZlYWxcIiwgZSksIGkucGFuVG8oe1xuICAgICAgICAgIHg6IC0xICogbyxcbiAgICAgICAgICB5OiAtMSAqIHMsXG4gICAgICAgICAgc2NhbGU6IG4sXG4gICAgICAgICAgZnJpY3Rpb246IDAsXG4gICAgICAgICAgaWdub3JlQm91bmRzOiAhMFxuICAgICAgICB9KSwgZS4kY29udGVudC5zdHlsZS52aXNpYmlsaXR5ID0gXCJcIiwgZS5zdGF0ZSA9IFwiem9vbUluXCIsICEwID09PSBhICYmIGkub24oXCJhZnRlclRyYW5zZm9ybVwiLCB0ID0+IHtcbiAgICAgICAgICBcInpvb21JblwiICE9PSBlLnN0YXRlICYmIFwiem9vbU91dFwiICE9PSBlLnN0YXRlIHx8ICh0LiRjb250ZW50LnN0eWxlLm9wYWNpdHkgPSBNYXRoLm1pbigxLCAxIC0gKDEgLSB0LmNvbnRlbnQuc2NhbGUpIC8gKDEgLSBuKSkpO1xuICAgICAgICB9KSwgaS5wYW5Ubyh7XG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwLFxuICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgIGZyaWN0aW9uOiB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLnpvb21GcmljdGlvblwiKVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgem9vbU91dCgpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuZmFuY3lib3gsXG4gICAgICAgICAgICAgIGUgPSB0LmdldFNsaWRlKCksXG4gICAgICAgICAgICAgIGkgPSBlLlBhbnpvb207XG4gICAgICAgIGlmICghaSkgcmV0dXJuO1xuICAgICAgICBlLnN0YXRlID0gXCJ6b29tT3V0XCIsIHQuc3RhdGUgPSBcImN1c3RvbUNsb3NpbmdcIiwgZS4kY2FwdGlvbiAmJiAoZS4kY2FwdGlvbi5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIik7XG4gICAgICAgIGxldCBzID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS56b29tRnJpY3Rpb25cIik7XG5cbiAgICAgICAgY29uc3QgbyA9IHQgPT4ge1xuICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIHRvcDogbyxcbiAgICAgICAgICAgIGxlZnQ6IG4sXG4gICAgICAgICAgICBzY2FsZTogYSxcbiAgICAgICAgICAgIG9wYWNpdHk6IHJcbiAgICAgICAgICB9ID0gdGhpcy5nZXRab29tSW5mbyhlKTtcbiAgICAgICAgICB0IHx8IHIgfHwgKHMgKj0gLjgyKSwgaS5wYW5Ubyh7XG4gICAgICAgICAgICB4OiAtMSAqIG4sXG4gICAgICAgICAgICB5OiAtMSAqIG8sXG4gICAgICAgICAgICBzY2FsZTogYSxcbiAgICAgICAgICAgIGZyaWN0aW9uOiBzLFxuICAgICAgICAgICAgaWdub3JlQm91bmRzOiAhMFxuICAgICAgICAgIH0pLCBzICo9IC45ODtcbiAgICAgICAgfTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBvKSwgaS5vbmNlKFwiZW5kQW5pbWF0aW9uXCIsICgpID0+IHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCBvKSwgdC5kZXN0cm95KCk7XG4gICAgICAgIH0pLCBvKCk7XG4gICAgICB9XG5cbiAgICAgIGhhbmRsZUN1cnNvcih0KSB7XG4gICAgICAgIGlmIChcImltYWdlXCIgIT09IHQudHlwZSB8fCAhdC4kZWwpIHJldHVybjtcbiAgICAgICAgY29uc3QgZSA9IHQuUGFuem9vbSxcbiAgICAgICAgICAgICAgaSA9IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2UuY2xpY2tcIiwgITEsIHQpLFxuICAgICAgICAgICAgICBzID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS50b3VjaFwiKSxcbiAgICAgICAgICAgICAgbyA9IHQuJGVsLmNsYXNzTGlzdCxcbiAgICAgICAgICAgICAgbiA9IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2UuY2FuWm9vbUluQ2xhc3NcIiksXG4gICAgICAgICAgICAgIGEgPSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLmNhblpvb21PdXRDbGFzc1wiKTtcblxuICAgICAgICBpZiAoby5yZW1vdmUoYSksIG8ucmVtb3ZlKG4pLCBlICYmIFwidG9nZ2xlWm9vbVwiID09PSBpKSB7XG4gICAgICAgICAgZSAmJiAxID09PSBlLmNvbnRlbnQuc2NhbGUgJiYgZS5vcHRpb24oXCJtYXhTY2FsZVwiKSAtIGUuY29udGVudC5zY2FsZSA+IC4wMSA/IG8uYWRkKG4pIDogZS5jb250ZW50LnNjYWxlID4gMSAmJiAhcyAmJiBvLmFkZChhKTtcbiAgICAgICAgfSBlbHNlIFwiY2xvc2VcIiA9PT0gaSAmJiBvLmFkZChhKTtcbiAgICAgIH1cblxuICAgICAgb25XaGVlbCh0LCBlKSB7XG4gICAgICAgIGlmIChcInJlYWR5XCIgPT09IHRoaXMuZmFuY3lib3guc3RhdGUgJiYgITEgIT09IHRoaXMuZmFuY3lib3gudHJpZ2dlcihcIkltYWdlLndoZWVsXCIsIGUpKSBzd2l0Y2ggKHRoaXMuZmFuY3lib3gub3B0aW9uKFwiSW1hZ2Uud2hlZWxcIikpIHtcbiAgICAgICAgICBjYXNlIFwiem9vbVwiOlxuICAgICAgICAgICAgXCJkb25lXCIgPT09IHQuc3RhdGUgJiYgdC5QYW56b29tICYmIHQuUGFuem9vbS56b29tV2l0aFdoZWVsKGUpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwiY2xvc2VcIjpcbiAgICAgICAgICAgIHRoaXMuZmFuY3lib3guY2xvc2UoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcInNsaWRlXCI6XG4gICAgICAgICAgICB0aGlzLmZhbmN5Ym94W2UuZGVsdGFZIDwgMCA/IFwicHJldlwiIDogXCJuZXh0XCJdKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb25DbGljayh0LCBlKSB7XG4gICAgICAgIGlmIChcInJlYWR5XCIgIT09IHRoaXMuZmFuY3lib3guc3RhdGUpIHJldHVybjtcbiAgICAgICAgY29uc3QgaSA9IHQuUGFuem9vbTtcbiAgICAgICAgaWYgKGkgJiYgKGkuZHJhZ1Bvc2l0aW9uLm1pZFBvaW50IHx8IDAgIT09IGkuZHJhZ09mZnNldC54IHx8IDAgIT09IGkuZHJhZ09mZnNldC55IHx8IDEgIT09IGkuZHJhZ09mZnNldC5zY2FsZSkpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMuZmFuY3lib3guQ2Fyb3VzZWwuUGFuem9vbS5sb2NrQXhpcykgcmV0dXJuICExO1xuXG4gICAgICAgIGNvbnN0IHMgPSBpID0+IHtcbiAgICAgICAgICBzd2l0Y2ggKGkpIHtcbiAgICAgICAgICAgIGNhc2UgXCJ0b2dnbGVab29tXCI6XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCksIHQuUGFuem9vbSAmJiB0LlBhbnpvb20uem9vbVdpdGhDbGljayhlKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJjbG9zZVwiOlxuICAgICAgICAgICAgICB0aGlzLmZhbmN5Ym94LmNsb3NlKCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwibmV4dFwiOlxuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpLCB0aGlzLmZhbmN5Ym94Lm5leHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICAgICAgIG8gPSB0aGlzLmZhbmN5Ym94Lm9wdGlvbihcIkltYWdlLmNsaWNrXCIpLFxuICAgICAgICAgICAgICBuID0gdGhpcy5mYW5jeWJveC5vcHRpb24oXCJJbWFnZS5kb3VibGVDbGlja1wiKTtcblxuICAgICAgICBuID8gdGhpcy5jbGlja1RpbWVyID8gKGNsZWFyVGltZW91dCh0aGlzLmNsaWNrVGltZXIpLCB0aGlzLmNsaWNrVGltZXIgPSBudWxsLCBzKG4pKSA6IHRoaXMuY2xpY2tUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY2xpY2tUaW1lciA9IG51bGwsIHMobyk7XG4gICAgICAgIH0sIDMwMCkgOiBzKG8pO1xuICAgICAgfVxuXG4gICAgICBvblBhZ2VDaGFuZ2UodCwgZSkge1xuICAgICAgICBjb25zdCBpID0gdC5nZXRTbGlkZSgpO1xuICAgICAgICBlLnNsaWRlcy5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgIHQuUGFuem9vbSAmJiBcImRvbmVcIiA9PT0gdC5zdGF0ZSAmJiB0LmluZGV4ICE9PSBpLmluZGV4ICYmIHQuUGFuem9vbS5wYW5Ubyh7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgICAgZnJpY3Rpb246IC44XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBhdHRhY2goKSB7XG4gICAgICAgIHRoaXMuZmFuY3lib3gub24odGhpcy5ldmVudHMpO1xuICAgICAgfVxuXG4gICAgICBkZXRhY2goKSB7XG4gICAgICAgIHRoaXMuZmFuY3lib3gub2ZmKHRoaXMuZXZlbnRzKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIFQuZGVmYXVsdHMgPSB7XG4gICAgICBjYW5ab29tSW5DbGFzczogXCJjYW4tem9vbV9pblwiLFxuICAgICAgY2FuWm9vbU91dENsYXNzOiBcImNhbi16b29tX291dFwiLFxuICAgICAgem9vbTogITAsXG4gICAgICB6b29tT3BhY2l0eTogXCJhdXRvXCIsXG4gICAgICB6b29tRnJpY3Rpb246IC44MixcbiAgICAgIGlnbm9yZUNvdmVyZWRUaHVtYm5haWw6ICExLFxuICAgICAgdG91Y2g6ICEwLFxuICAgICAgY2xpY2s6IFwidG9nZ2xlWm9vbVwiLFxuICAgICAgZG91YmxlQ2xpY2s6IG51bGwsXG4gICAgICB3aGVlbDogXCJ6b29tXCIsXG4gICAgICBmaXQ6IFwiY29udGFpblwiLFxuICAgICAgd3JhcDogITEsXG4gICAgICBQYW56b29tOiB7XG4gICAgICAgIHJhdGlvOiAxXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNsYXNzIEwge1xuICAgICAgY29uc3RydWN0b3IodCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94ID0gdDtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgW1wib25DaGFuZ2VcIiwgXCJvbkNsb3NpbmdcIl0pIHRoaXNbdF0gPSB0aGlzW3RdLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5ldmVudHMgPSB7XG4gICAgICAgICAgaW5pdENhcm91c2VsOiB0aGlzLm9uQ2hhbmdlLFxuICAgICAgICAgIFwiQ2Fyb3VzZWwuY2hhbmdlXCI6IHRoaXMub25DaGFuZ2UsXG4gICAgICAgICAgY2xvc2luZzogdGhpcy5vbkNsb3NpbmdcbiAgICAgICAgfSwgdGhpcy5oYXNDcmVhdGVkSGlzdG9yeSA9ICExLCB0aGlzLm9yaWdIYXNoID0gXCJcIiwgdGhpcy50aW1lciA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIG9uQ2hhbmdlKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHQuQ2Fyb3VzZWw7XG4gICAgICAgIHRoaXMudGltZXIgJiYgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICAgICAgICBjb25zdCBpID0gbnVsbCA9PT0gZS5wcmV2UGFnZSxcbiAgICAgICAgICAgICAgcyA9IHQuZ2V0U2xpZGUoKSxcbiAgICAgICAgICAgICAgbyA9IG5ldyBVUkwoZG9jdW1lbnQuVVJMKS5oYXNoO1xuICAgICAgICBsZXQgbiA9ICExO1xuICAgICAgICBpZiAocy5zbHVnKSBuID0gXCIjXCIgKyBzLnNsdWc7ZWxzZSB7XG4gICAgICAgICAgY29uc3QgaSA9IHMuJHRyaWdnZXIgJiYgcy4kdHJpZ2dlci5kYXRhc2V0LFxuICAgICAgICAgICAgICAgIG8gPSB0Lm9wdGlvbihcInNsdWdcIikgfHwgaSAmJiBpLmZhbmN5Ym94O1xuICAgICAgICAgIG8gJiYgby5sZW5ndGggJiYgXCJ0cnVlXCIgIT09IG8gJiYgKG4gPSBcIiNcIiArIG8gKyAoZS5zbGlkZXMubGVuZ3RoID4gMSA/IFwiLVwiICsgKHMuaW5kZXggKyAxKSA6IFwiXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBpICYmICh0aGlzLm9yaWdIYXNoID0gbyAhPT0gbiA/IG8gOiBcIlwiKSwgbiAmJiBvICE9PSBuICYmICh0aGlzLnRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5W2kgPyBcInB1c2hTdGF0ZVwiIDogXCJyZXBsYWNlU3RhdGVcIl0oe30sIGRvY3VtZW50LnRpdGxlLCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoICsgbiksIGkgJiYgKHRoaXMuaGFzQ3JlYXRlZEhpc3RvcnkgPSAhMCk7XG4gICAgICAgICAgfSBjYXRjaCAodCkge31cbiAgICAgICAgfSwgMzAwKSk7XG4gICAgICB9XG5cbiAgICAgIG9uQ2xvc2luZygpIHtcbiAgICAgICAgaWYgKHRoaXMudGltZXIgJiYgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpLCAhMCAhPT0gdGhpcy5oYXNTaWxlbnRDbG9zZSkgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gdm9pZCB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sIGRvY3VtZW50LnRpdGxlLCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoICsgKHRoaXMub3JpZ0hhc2ggfHwgXCJcIikpO1xuICAgICAgICB9IGNhdGNoICh0KSB7fVxuICAgICAgfVxuXG4gICAgICBhdHRhY2godCkge1xuICAgICAgICB0Lm9uKHRoaXMuZXZlbnRzKTtcbiAgICAgIH1cblxuICAgICAgZGV0YWNoKHQpIHtcbiAgICAgICAgdC5vZmYodGhpcy5ldmVudHMpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgc3RhcnRGcm9tVXJsKCkge1xuICAgICAgICBjb25zdCB0ID0gTC5GYW5jeWJveDtcbiAgICAgICAgaWYgKCF0IHx8IHQuZ2V0SW5zdGFuY2UoKSB8fCAhMSA9PT0gdC5kZWZhdWx0cy5IYXNoKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBoYXNoOiBlLFxuICAgICAgICAgIHNsdWc6IGksXG4gICAgICAgICAgaW5kZXg6IHNcbiAgICAgICAgfSA9IEwuZ2V0UGFyc2VkVVJMKCk7XG4gICAgICAgIGlmICghaSkgcmV0dXJuO1xuICAgICAgICBsZXQgbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNsdWc9XCIke2V9XCJdYCk7XG4gICAgICAgIGlmIChvICYmIG8uZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJjbGlja1wiLCB7XG4gICAgICAgICAgYnViYmxlczogITAsXG4gICAgICAgICAgY2FuY2VsYWJsZTogITBcbiAgICAgICAgfSkpLCB0LmdldEluc3RhbmNlKCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFtkYXRhLWZhbmN5Ym94PVwiJHtpfVwiXWApO1xuICAgICAgICBuLmxlbmd0aCAmJiAobnVsbCA9PT0gcyAmJiAxID09PSBuLmxlbmd0aCA/IG8gPSBuWzBdIDogcyAmJiAobyA9IG5bcyAtIDFdKSwgbyAmJiBvLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwiY2xpY2tcIiwge1xuICAgICAgICAgIGJ1YmJsZXM6ICEwLFxuICAgICAgICAgIGNhbmNlbGFibGU6ICEwXG4gICAgICAgIH0pKSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBvbkhhc2hDaGFuZ2UoKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICBzbHVnOiB0LFxuICAgICAgICAgIGluZGV4OiBlXG4gICAgICAgIH0gPSBMLmdldFBhcnNlZFVSTCgpLFxuICAgICAgICAgICAgICBpID0gTC5GYW5jeWJveCxcbiAgICAgICAgICAgICAgcyA9IGkgJiYgaS5nZXRJbnN0YW5jZSgpO1xuXG4gICAgICAgIGlmIChzICYmIHMucGx1Z2lucy5IYXNoKSB7XG4gICAgICAgICAgaWYgKHQpIHtcbiAgICAgICAgICAgIGNvbnN0IGkgPSBzLkNhcm91c2VsO1xuICAgICAgICAgICAgaWYgKHQgPT09IHMub3B0aW9uKFwic2x1Z1wiKSkgcmV0dXJuIGkuc2xpZGVUbyhlIC0gMSk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGUgb2YgaS5zbGlkZXMpIGlmIChlLnNsdWcgJiYgZS5zbHVnID09PSB0KSByZXR1cm4gaS5zbGlkZVRvKGUuaW5kZXgpO1xuXG4gICAgICAgICAgICBjb25zdCBvID0gcy5nZXRTbGlkZSgpLFxuICAgICAgICAgICAgICAgICAgbiA9IG8uJHRyaWdnZXIgJiYgby4kdHJpZ2dlci5kYXRhc2V0O1xuICAgICAgICAgICAgaWYgKG4gJiYgbi5mYW5jeWJveCA9PT0gdCkgcmV0dXJuIGkuc2xpZGVUbyhlIC0gMSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcy5wbHVnaW5zLkhhc2guaGFzU2lsZW50Q2xvc2UgPSAhMCwgcy5jbG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgTC5zdGFydEZyb21VcmwoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGNyZWF0ZSh0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGUoKSB7XG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIEwub25IYXNoQ2hhbmdlLCAhMSksIEwuc3RhcnRGcm9tVXJsKCk7XG4gICAgICAgIH1cblxuICAgICAgICBMLkZhbmN5Ym94ID0gdCwgdiAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAvY29tcGxldGV8aW50ZXJhY3RpdmV8bG9hZGVkLy50ZXN0KGRvY3VtZW50LnJlYWR5U3RhdGUpID8gZSgpIDogZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgZGVzdHJveSgpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIEwub25IYXNoQ2hhbmdlLCAhMSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBnZXRQYXJzZWRVUkwoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSksXG4gICAgICAgICAgICAgIGUgPSB0LnNwbGl0KFwiLVwiKSxcbiAgICAgICAgICAgICAgaSA9IGUubGVuZ3RoID4gMSAmJiAvXlxcKz9cXGQrJC8udGVzdChlW2UubGVuZ3RoIC0gMV0pICYmIHBhcnNlSW50KGUucG9wKC0xKSwgMTApIHx8IG51bGw7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaGFzaDogdCxcbiAgICAgICAgICBzbHVnOiBlLmpvaW4oXCItXCIpLFxuICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBjb25zdCBfID0ge1xuICAgICAgcGFnZVhPZmZzZXQ6IDAsXG4gICAgICBwYWdlWU9mZnNldDogMCxcbiAgICAgIGVsZW1lbnQ6ICgpID0+IGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50LFxuXG4gICAgICBhY3RpdmF0ZSh0KSB7XG4gICAgICAgIF8ucGFnZVhPZmZzZXQgPSB3aW5kb3cucGFnZVhPZmZzZXQsIF8ucGFnZVlPZmZzZXQgPSB3aW5kb3cucGFnZVlPZmZzZXQsIHQucmVxdWVzdEZ1bGxzY3JlZW4gPyB0LnJlcXVlc3RGdWxsc2NyZWVuKCkgOiB0Lm1velJlcXVlc3RGdWxsU2NyZWVuID8gdC5tb3pSZXF1ZXN0RnVsbFNjcmVlbigpIDogdC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbiA/IHQud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oKSA6IHQubXNSZXF1ZXN0RnVsbHNjcmVlbiAmJiB0Lm1zUmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgIH0sXG5cbiAgICAgIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuID8gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKSA6IGRvY3VtZW50Lm1vekNhbmNlbEZ1bGxTY3JlZW4gPyBkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuKCkgOiBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlbiAmJiBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgfVxuXG4gICAgfTtcblxuICAgIGNsYXNzIEEge1xuICAgICAgY29uc3RydWN0b3IodCkge1xuICAgICAgICB0aGlzLmZhbmN5Ym94ID0gdCwgdGhpcy5hY3RpdmUgPSAhMSwgdGhpcy5oYW5kbGVWaXNpYmlsaXR5Q2hhbmdlID0gdGhpcy5oYW5kbGVWaXNpYmlsaXR5Q2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICB9XG5cbiAgICAgIGlzQWN0aXZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmU7XG4gICAgICB9XG5cbiAgICAgIHNldFRpbWVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlIHx8IHRoaXMudGltZXIpIHJldHVybjtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuZmFuY3lib3gub3B0aW9uKFwic2xpZGVzaG93LmRlbGF5XCIsIDNlMyk7XG4gICAgICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLnRpbWVyID0gbnVsbCwgdGhpcy5mYW5jeWJveC5vcHRpb24oXCJpbmZpbml0ZVwiKSB8fCB0aGlzLmZhbmN5Ym94LmdldFNsaWRlKCkuaW5kZXggIT09IHRoaXMuZmFuY3lib3guQ2Fyb3VzZWwuc2xpZGVzLmxlbmd0aCAtIDEgPyB0aGlzLmZhbmN5Ym94Lm5leHQoKSA6IHRoaXMuZmFuY3lib3guanVtcFRvKDAsIHtcbiAgICAgICAgICAgIGZyaWN0aW9uOiAwXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIHQpO1xuICAgICAgICBsZXQgZSA9IHRoaXMuJHByb2dyZXNzO1xuICAgICAgICBlIHx8IChlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgZS5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3hfX3Byb2dyZXNzXCIpLCB0aGlzLmZhbmN5Ym94LiRjYXJvdXNlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlLCB0aGlzLmZhbmN5Ym94LiRjYXJvdXNlbCksIHRoaXMuJHByb2dyZXNzID0gZSwgZS5vZmZzZXRIZWlnaHQpLCBlLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IGAke3R9bXNgLCBlLnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGVYKDEpXCI7XG4gICAgICB9XG5cbiAgICAgIGNsZWFyVGltZXIoKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKSwgdGhpcy50aW1lciA9IG51bGwsIHRoaXMuJHByb2dyZXNzICYmICh0aGlzLiRwcm9ncmVzcy5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSBcIlwiLCB0aGlzLiRwcm9ncmVzcy5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiLCB0aGlzLiRwcm9ncmVzcy5vZmZzZXRIZWlnaHQpO1xuICAgICAgfVxuXG4gICAgICBhY3RpdmF0ZSgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmUgfHwgKHRoaXMuYWN0aXZlID0gITAsIHRoaXMuZmFuY3lib3guJGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaGFzLXNsaWRlc2hvd1wiKSwgXCJkb25lXCIgPT09IHRoaXMuZmFuY3lib3guZ2V0U2xpZGUoKS5zdGF0ZSAmJiB0aGlzLnNldFRpbWVyKCksIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ2aXNpYmlsaXR5Y2hhbmdlXCIsIHRoaXMuaGFuZGxlVmlzaWJpbGl0eUNoYW5nZSwgITEpKTtcbiAgICAgIH1cblxuICAgICAgaGFuZGxlVmlzaWJpbGl0eUNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgICB9XG5cbiAgICAgIGRlYWN0aXZhdGUoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gITEsIHRoaXMuY2xlYXJUaW1lcigpLCB0aGlzLmZhbmN5Ym94LiRjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcImhhcy1zbGlkZXNob3dcIiksIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ2aXNpYmlsaXR5Y2hhbmdlXCIsIHRoaXMuaGFuZGxlVmlzaWJpbGl0eUNoYW5nZSwgITEpO1xuICAgICAgfVxuXG4gICAgICB0b2dnbGUoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlID8gdGhpcy5kZWFjdGl2YXRlKCkgOiB0aGlzLmZhbmN5Ym94LkNhcm91c2VsLnNsaWRlcy5sZW5ndGggPiAxICYmIHRoaXMuYWN0aXZhdGUoKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGNvbnN0IHogPSB7XG4gICAgICBkaXNwbGF5OiBbXCJjb3VudGVyXCIsIFwiem9vbVwiLCBcInNsaWRlc2hvd1wiLCBcImZ1bGxzY3JlZW5cIiwgXCJ0aHVtYnNcIiwgXCJjbG9zZVwiXSxcbiAgICAgIGF1dG9FbmFibGU6ICEwLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgY291bnRlcjoge1xuICAgICAgICAgIHBvc2l0aW9uOiBcImxlZnRcIixcbiAgICAgICAgICB0eXBlOiBcImRpdlwiLFxuICAgICAgICAgIGNsYXNzOiBcImZhbmN5Ym94X19jb3VudGVyXCIsXG4gICAgICAgICAgaHRtbDogJzxzcGFuIGRhdGEtZmFuY3lib3gtaW5kZXg9XCJcIj48L3NwYW4+Jm5ic3A7LyZuYnNwOzxzcGFuIGRhdGEtZmFuY3lib3gtY291bnQ9XCJcIj48L3NwYW4+JyxcbiAgICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgICB0YWJpbmRleDogLTFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByZXY6IHtcbiAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgIGNsYXNzOiBcImZhbmN5Ym94X19idXR0b24tLXByZXZcIixcbiAgICAgICAgICBsYWJlbDogXCJQUkVWXCIsXG4gICAgICAgICAgaHRtbDogJzxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxwYXRoIGQ9XCJNMTUgNGwtOCA4IDggOFwiLz48L3N2Zz4nLFxuICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgIFwiZGF0YS1mYW5jeWJveC1wcmV2XCI6IFwiXCJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQ6IHtcbiAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgIGNsYXNzOiBcImZhbmN5Ym94X19idXR0b24tLW5leHRcIixcbiAgICAgICAgICBsYWJlbDogXCJORVhUXCIsXG4gICAgICAgICAgaHRtbDogJzxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxwYXRoIGQ9XCJNOCA0bDggOC04IDhcIi8+PC9zdmc+JyxcbiAgICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgICBcImRhdGEtZmFuY3lib3gtbmV4dFwiOiBcIlwiXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmdWxsc2NyZWVuOiB7XG4gICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICBjbGFzczogXCJmYW5jeWJveF9fYnV0dG9uLS1mdWxsc2NyZWVuXCIsXG4gICAgICAgICAgbGFiZWw6IFwiVE9HR0xFX0ZVTExTQ1JFRU5cIixcbiAgICAgICAgICBodG1sOiAnPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XFxuICAgICAgICAgICAgICAgIDxnPjxwYXRoIGQ9XCJNMyA4IFYzaDVcIj48L3BhdGg+PHBhdGggZD1cIk0yMSA4VjNoLTVcIj48L3BhdGg+PHBhdGggZD1cIk04IDIxSDN2LTVcIj48L3BhdGg+PHBhdGggZD1cIk0xNiAyMWg1di01XCI+PC9wYXRoPjwvZz5cXG4gICAgICAgICAgICAgICAgPGc+PHBhdGggZD1cIk03IDJ2NUgyTTE3IDJ2NWg1TTIgMTdoNXY1TTIyIDE3aC01djVcIi8+PC9nPlxcbiAgICAgICAgICAgIDwvc3ZnPicsXG4gICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICB0LnByZXZlbnREZWZhdWx0KCksIF8uZWxlbWVudCgpID8gXy5kZWFjdGl2YXRlKCkgOiBfLmFjdGl2YXRlKHRoaXMuZmFuY3lib3guJGNvbnRhaW5lcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzbGlkZXNob3c6IHtcbiAgICAgICAgICB0eXBlOiBcImJ1dHRvblwiLFxuICAgICAgICAgIGNsYXNzOiBcImZhbmN5Ym94X19idXR0b24tLXNsaWRlc2hvd1wiLFxuICAgICAgICAgIGxhYmVsOiBcIlRPR0dMRV9TTElERVNIT1dcIixcbiAgICAgICAgICBodG1sOiAnPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XFxuICAgICAgICAgICAgICAgIDxnPjxwYXRoIGQ9XCJNNiA0djE2XCIvPjxwYXRoIGQ9XCJNMjAgMTJMNiAyMFwiLz48cGF0aCBkPVwiTTIwIDEyTDYgNFwiLz48L2c+XFxuICAgICAgICAgICAgICAgIDxnPjxwYXRoIGQ9XCJNNyA0djE1TTE3IDR2MTVcIi8+PC9nPlxcbiAgICAgICAgICAgIDwvc3ZnPicsXG4gICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICB0LnByZXZlbnREZWZhdWx0KCksIHRoaXMuU2xpZGVzaG93LnRvZ2dsZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgem9vbToge1xuICAgICAgICAgIHR5cGU6IFwiYnV0dG9uXCIsXG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2J1dHRvbi0tem9vbVwiLFxuICAgICAgICAgIGxhYmVsOiBcIlRPR0dMRV9aT09NXCIsXG4gICAgICAgICAgaHRtbDogJzxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxjaXJjbGUgY3g9XCIxMFwiIGN5PVwiMTBcIiByPVwiN1wiPjwvY2lyY2xlPjxwYXRoIGQ9XCJNMTYgMTYgTDIxIDIxXCI+PC9zdmc+JyxcbiAgICAgICAgICBjbGljazogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLmZhbmN5Ym94LmdldFNsaWRlKCkuUGFuem9vbTtcbiAgICAgICAgICAgIGUgJiYgZS50b2dnbGVab29tKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkb3dubG9hZDoge1xuICAgICAgICAgIHR5cGU6IFwibGlua1wiLFxuICAgICAgICAgIGxhYmVsOiBcIkRPV05MT0FEXCIsXG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2J1dHRvbi0tZG93bmxvYWRcIixcbiAgICAgICAgICBodG1sOiAnPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+PHBhdGggZD1cIk0xMiAxNVYzbTAgMTJsLTQtNG00IDRsNC00TTIgMTdsLjYyIDIuNDhBMiAyIDAgMDA0LjU2IDIxaDE0Ljg4YTIgMiAwIDAwMS45NC0xLjUxTDIyIDE3XCIvPjwvc3ZnPicsXG4gICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICB0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGh1bWJzOiB7XG4gICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICBsYWJlbDogXCJUT0dHTEVfVEhVTUJTXCIsXG4gICAgICAgICAgY2xhc3M6IFwiZmFuY3lib3hfX2J1dHRvbi0tdGh1bWJzXCIsXG4gICAgICAgICAgaHRtbDogJzxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxjaXJjbGUgY3g9XCI0XCIgY3k9XCI0XCIgcj1cIjFcIiAvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiNFwiIHI9XCIxXCIgdHJhbnNmb3JtPVwicm90YXRlKDkwIDEyIDQpXCIvPjxjaXJjbGUgY3g9XCIyMFwiIGN5PVwiNFwiIHI9XCIxXCIgdHJhbnNmb3JtPVwicm90YXRlKDkwIDIwIDQpXCIvPjxjaXJjbGUgY3g9XCI0XCIgY3k9XCIxMlwiIHI9XCIxXCIgdHJhbnNmb3JtPVwicm90YXRlKDkwIDQgMTIpXCIvPjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMVwiIHRyYW5zZm9ybT1cInJvdGF0ZSg5MCAxMiAxMilcIi8+PGNpcmNsZSBjeD1cIjIwXCIgY3k9XCIxMlwiIHI9XCIxXCIgdHJhbnNmb3JtPVwicm90YXRlKDkwIDIwIDEyKVwiLz48Y2lyY2xlIGN4PVwiNFwiIGN5PVwiMjBcIiByPVwiMVwiIHRyYW5zZm9ybT1cInJvdGF0ZSg5MCA0IDIwKVwiLz48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjIwXCIgcj1cIjFcIiB0cmFuc2Zvcm09XCJyb3RhdGUoOTAgMTIgMjApXCIvPjxjaXJjbGUgY3g9XCIyMFwiIGN5PVwiMjBcIiByPVwiMVwiIHRyYW5zZm9ybT1cInJvdGF0ZSg5MCAyMCAyMClcIi8+PC9zdmc+JyxcbiAgICAgICAgICBjbGljazogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjb25zdCBlID0gdGhpcy5mYW5jeWJveC5wbHVnaW5zLlRodW1icztcbiAgICAgICAgICAgIGUgJiYgZS50b2dnbGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlOiB7XG4gICAgICAgICAgdHlwZTogXCJidXR0b25cIixcbiAgICAgICAgICBsYWJlbDogXCJDTE9TRVwiLFxuICAgICAgICAgIGNsYXNzOiBcImZhbmN5Ym94X19idXR0b24tLWNsb3NlXCIsXG4gICAgICAgICAgaHRtbDogJzxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPjxwYXRoIGQ9XCJNMjAgMjBMNCA0bTE2IDBMNCAyMFwiPjwvcGF0aD48L3N2Zz4nLFxuICAgICAgICAgIGF0dHI6IHtcbiAgICAgICAgICAgIFwiZGF0YS1mYW5jeWJveC1jbG9zZVwiOiBcIlwiLFxuICAgICAgICAgICAgdGFiaW5kZXg6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY2xhc3MgayB7XG4gICAgICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgICAgIHRoaXMuZmFuY3lib3ggPSB0LCB0aGlzLiRjb250YWluZXIgPSBudWxsLCB0aGlzLnN0YXRlID0gXCJpbml0XCI7XG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIFtcIm9uSW5pdFwiLCBcIm9uUHJlcGFyZVwiLCBcIm9uRG9uZVwiLCBcIm9uS2V5ZG93blwiLCBcIm9uQ2xvc2luZ1wiLCBcIm9uQ2hhbmdlXCIsIFwib25TZXR0bGVcIiwgXCJvblJlZnJlc2hcIl0pIHRoaXNbdF0gPSB0aGlzW3RdLmJpbmQodGhpcyk7XG5cbiAgICAgICAgdGhpcy5ldmVudHMgPSB7XG4gICAgICAgICAgaW5pdDogdGhpcy5vbkluaXQsXG4gICAgICAgICAgcHJlcGFyZTogdGhpcy5vblByZXBhcmUsXG4gICAgICAgICAgZG9uZTogdGhpcy5vbkRvbmUsXG4gICAgICAgICAga2V5ZG93bjogdGhpcy5vbktleWRvd24sXG4gICAgICAgICAgY2xvc2luZzogdGhpcy5vbkNsb3NpbmcsXG4gICAgICAgICAgXCJDYXJvdXNlbC5jaGFuZ2VcIjogdGhpcy5vbkNoYW5nZSxcbiAgICAgICAgICBcIkNhcm91c2VsLnNldHRsZVwiOiB0aGlzLm9uU2V0dGxlLFxuICAgICAgICAgIFwiQ2Fyb3VzZWwuUGFuem9vbS50b3VjaFN0YXJ0XCI6ICgpID0+IHRoaXMub25SZWZyZXNoKCksXG4gICAgICAgICAgXCJJbWFnZS5zdGFydEFuaW1hdGlvblwiOiAodCwgZSkgPT4gdGhpcy5vblJlZnJlc2goZSksXG4gICAgICAgICAgXCJJbWFnZS5hZnRlclVwZGF0ZVwiOiAodCwgZSkgPT4gdGhpcy5vblJlZnJlc2goZSlcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb25Jbml0KCkge1xuICAgICAgICBpZiAodGhpcy5mYW5jeWJveC5vcHRpb24oXCJUb29sYmFyLmF1dG9FbmFibGVcIikpIHtcbiAgICAgICAgICBsZXQgdCA9ICExO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBlIG9mIHRoaXMuZmFuY3lib3guaXRlbXMpIGlmIChcImltYWdlXCIgPT09IGUudHlwZSkge1xuICAgICAgICAgICAgdCA9ICEwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCF0KSByZXR1cm4gdm9pZCAodGhpcy5zdGF0ZSA9IFwiZGlzYWJsZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgdGhpcy5mYW5jeWJveC5vcHRpb24oXCJUb29sYmFyLmRpc3BsYXlcIikpIHtcbiAgICAgICAgICBpZiAoXCJjbG9zZVwiID09PSAodChlKSA/IGUuaWQgOiBlKSkge1xuICAgICAgICAgICAgdGhpcy5mYW5jeWJveC5vcHRpb25zLmNsb3NlQnV0dG9uID0gITE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb25QcmVwYXJlKCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5mYW5jeWJveDtcbiAgICAgICAgaWYgKFwiaW5pdFwiID09PSB0aGlzLnN0YXRlICYmICh0aGlzLmJ1aWxkKCksIHRoaXMudXBkYXRlKCksIHRoaXMuU2xpZGVzaG93ID0gbmV3IEEodCksICF0LkNhcm91c2VsLnByZXZQYWdlICYmICh0Lm9wdGlvbihcInNsaWRlc2hvdy5hdXRvU3RhcnRcIikgJiYgdGhpcy5TbGlkZXNob3cuYWN0aXZhdGUoKSwgdC5vcHRpb24oXCJmdWxsc2NyZWVuLmF1dG9TdGFydFwiKSAmJiAhXy5lbGVtZW50KCkpKSkgdHJ5IHtcbiAgICAgICAgICBfLmFjdGl2YXRlKHQuJGNvbnRhaW5lcik7XG4gICAgICAgIH0gY2F0Y2ggKHQpIHt9XG4gICAgICB9XG5cbiAgICAgIG9uRnNDaGFuZ2UoKSB7XG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbyhfLnBhZ2VYT2Zmc2V0LCBfLnBhZ2VZT2Zmc2V0KTtcbiAgICAgIH1cblxuICAgICAgb25TZXR0bGUoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmZhbmN5Ym94LFxuICAgICAgICAgICAgICBlID0gdGhpcy5TbGlkZXNob3c7XG4gICAgICAgIGUgJiYgZS5pc0FjdGl2ZSgpICYmICh0LmdldFNsaWRlKCkuaW5kZXggIT09IHQuQ2Fyb3VzZWwuc2xpZGVzLmxlbmd0aCAtIDEgfHwgdC5vcHRpb24oXCJpbmZpbml0ZVwiKSA/IFwiZG9uZVwiID09PSB0LmdldFNsaWRlKCkuc3RhdGUgJiYgZS5zZXRUaW1lcigpIDogZS5kZWFjdGl2YXRlKCkpO1xuICAgICAgfVxuXG4gICAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoKSwgdGhpcy5TbGlkZXNob3cgJiYgdGhpcy5TbGlkZXNob3cuaXNBY3RpdmUoKSAmJiB0aGlzLlNsaWRlc2hvdy5jbGVhclRpbWVyKCk7XG4gICAgICB9XG5cbiAgICAgIG9uRG9uZSh0LCBlKSB7XG4gICAgICAgIGNvbnN0IGkgPSB0aGlzLlNsaWRlc2hvdztcbiAgICAgICAgZS5pbmRleCA9PT0gdC5nZXRTbGlkZSgpLmluZGV4ICYmICh0aGlzLnVwZGF0ZSgpLCBpICYmIGkuaXNBY3RpdmUoKSAmJiAodC5vcHRpb24oXCJpbmZpbml0ZVwiKSB8fCBlLmluZGV4ICE9PSB0LkNhcm91c2VsLnNsaWRlcy5sZW5ndGggLSAxID8gaS5zZXRUaW1lcigpIDogaS5kZWFjdGl2YXRlKCkpKTtcbiAgICAgIH1cblxuICAgICAgb25SZWZyZXNoKHQpIHtcbiAgICAgICAgdCAmJiB0LmluZGV4ICE9PSB0aGlzLmZhbmN5Ym94LmdldFNsaWRlKCkuaW5kZXggfHwgKHRoaXMudXBkYXRlKCksICF0aGlzLlNsaWRlc2hvdyB8fCAhdGhpcy5TbGlkZXNob3cuaXNBY3RpdmUoKSB8fCB0ICYmIFwiZG9uZVwiICE9PSB0LnN0YXRlIHx8IHRoaXMuU2xpZGVzaG93LmRlYWN0aXZhdGUoKSk7XG4gICAgICB9XG5cbiAgICAgIG9uS2V5ZG93bih0LCBlLCBpKSB7XG4gICAgICAgIFwiIFwiID09PSBlICYmIHRoaXMuU2xpZGVzaG93ICYmICh0aGlzLlNsaWRlc2hvdy50b2dnbGUoKSwgaS5wcmV2ZW50RGVmYXVsdCgpKTtcbiAgICAgIH1cblxuICAgICAgb25DbG9zaW5nKCkge1xuICAgICAgICB0aGlzLlNsaWRlc2hvdyAmJiB0aGlzLlNsaWRlc2hvdy5kZWFjdGl2YXRlKCksIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJmdWxsc2NyZWVuY2hhbmdlXCIsIHRoaXMub25Gc0NoYW5nZSk7XG4gICAgICB9XG5cbiAgICAgIGNyZWF0ZUVsZW1lbnQodCkge1xuICAgICAgICBsZXQgZTtcbiAgICAgICAgXCJkaXZcIiA9PT0gdC50eXBlID8gZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikgOiAoZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIgPT09IHQudHlwZSA/IFwiYVwiIDogXCJidXR0b25cIiksIGUuY2xhc3NMaXN0LmFkZChcImNhcm91c2VsX19idXR0b25cIikpLCBlLmlubmVySFRNTCA9IHQuaHRtbCwgZS5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCB0LnRhYmluZGV4IHx8IDApLCB0LmNsYXNzICYmIGUuY2xhc3NMaXN0LmFkZCguLi50LmNsYXNzLnNwbGl0KFwiIFwiKSk7XG5cbiAgICAgICAgZm9yIChjb25zdCBpIGluIHQuYXR0cikgZS5zZXRBdHRyaWJ1dGUoaSwgdC5hdHRyW2ldKTtcblxuICAgICAgICB0LmxhYmVsICYmIGUuc2V0QXR0cmlidXRlKFwidGl0bGVcIiwgdGhpcy5mYW5jeWJveC5sb2NhbGl6ZShge3ske3QubGFiZWx9fX1gKSksIHQuY2xpY2sgJiYgZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdC5jbGljay5iaW5kKHRoaXMpKSwgXCJwcmV2XCIgPT09IHQuaWQgJiYgZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWZhbmN5Ym94LXByZXZcIiwgXCJcIiksIFwibmV4dFwiID09PSB0LmlkICYmIGUuc2V0QXR0cmlidXRlKFwiZGF0YS1mYW5jeWJveC1uZXh0XCIsIFwiXCIpO1xuICAgICAgICBjb25zdCBpID0gZS5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpO1xuICAgICAgICByZXR1cm4gaSAmJiAoaS5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsIFwiaW1nXCIpLCBpLnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiLTFcIiksIGkuc2V0QXR0cmlidXRlKFwieG1sbnNcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKSksIGU7XG4gICAgICB9XG5cbiAgICAgIGJ1aWxkKCkge1xuICAgICAgICB0aGlzLmNsZWFudXAoKTtcbiAgICAgICAgY29uc3QgaSA9IHRoaXMuZmFuY3lib3gub3B0aW9uKFwiVG9vbGJhci5pdGVtc1wiKSxcbiAgICAgICAgICAgICAgcyA9IFt7XG4gICAgICAgICAgcG9zaXRpb246IFwibGVmdFwiLFxuICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgcG9zaXRpb246IFwiY2VudGVyXCIsXG4gICAgICAgICAgaXRlbXM6IFtdXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBwb3NpdGlvbjogXCJyaWdodFwiLFxuICAgICAgICAgIGl0ZW1zOiBbXVxuICAgICAgICB9XSxcbiAgICAgICAgICAgICAgbyA9IHRoaXMuZmFuY3lib3gucGx1Z2lucy5UaHVtYnM7XG5cbiAgICAgICAgZm9yIChjb25zdCBuIG9mIHRoaXMuZmFuY3lib3gub3B0aW9uKFwiVG9vbGJhci5kaXNwbGF5XCIpKSB7XG4gICAgICAgICAgbGV0IGEsIHI7XG4gICAgICAgICAgaWYgKHQobikgPyAoYSA9IG4uaWQsIHIgPSBlKHt9LCBpW2FdLCBuKSkgOiAoYSA9IG4sIHIgPSBpW2FdKSwgW1wiY291bnRlclwiLCBcIm5leHRcIiwgXCJwcmV2XCIsIFwic2xpZGVzaG93XCJdLmluY2x1ZGVzKGEpICYmIHRoaXMuZmFuY3lib3guaXRlbXMubGVuZ3RoIDwgMikgY29udGludWU7XG5cbiAgICAgICAgICBpZiAoXCJmdWxsc2NyZWVuXCIgPT09IGEpIHtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuZnVsbHNjcmVlbkVuYWJsZWQgfHwgd2luZG93LmZ1bGxTY3JlZW4pIGNvbnRpbnVlO1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImZ1bGxzY3JlZW5jaGFuZ2VcIiwgdGhpcy5vbkZzQ2hhbmdlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoXCJ0aHVtYnNcIiA9PT0gYSAmJiAoIW8gfHwgXCJkaXNhYmxlZFwiID09PSBvLnN0YXRlKSkgY29udGludWU7XG4gICAgICAgICAgaWYgKCFyKSBjb250aW51ZTtcbiAgICAgICAgICBsZXQgaCA9IHIucG9zaXRpb24gfHwgXCJyaWdodFwiLFxuICAgICAgICAgICAgICBsID0gcy5maW5kKHQgPT4gdC5wb3NpdGlvbiA9PT0gaCk7XG4gICAgICAgICAgbCAmJiBsLml0ZW1zLnB1c2gocik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgbi5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3hfX3Rvb2xiYXJcIik7XG5cbiAgICAgICAgZm9yIChjb25zdCB0IG9mIHMpIGlmICh0Lml0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgIGUuY2xhc3NMaXN0LmFkZChcImZhbmN5Ym94X190b29sYmFyX19pdGVtc1wiKSwgZS5jbGFzc0xpc3QuYWRkKGBmYW5jeWJveF9fdG9vbGJhcl9faXRlbXMtLSR7dC5wb3NpdGlvbn1gKTtcblxuICAgICAgICAgIGZvciAoY29uc3QgaSBvZiB0Lml0ZW1zKSBlLmFwcGVuZENoaWxkKHRoaXMuY3JlYXRlRWxlbWVudChpKSk7XG5cbiAgICAgICAgICBuLmFwcGVuZENoaWxkKGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mYW5jeWJveC4kY2Fyb3VzZWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobiwgdGhpcy5mYW5jeWJveC4kY2Fyb3VzZWwpLCB0aGlzLiRjb250YWluZXIgPSBuO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGUoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLmZhbmN5Ym94LmdldFNsaWRlKCksXG4gICAgICAgICAgICAgIGUgPSB0LmluZGV4LFxuICAgICAgICAgICAgICBpID0gdGhpcy5mYW5jeWJveC5pdGVtcy5sZW5ndGgsXG4gICAgICAgICAgICAgIHMgPSB0LmRvd25sb2FkU3JjIHx8IChcImltYWdlXCIgIT09IHQudHlwZSB8fCB0LmVycm9yID8gbnVsbCA6IHQuc3JjKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgdGhpcy5mYW5jeWJveC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJhLmZhbmN5Ym94X19idXR0b24tLWRvd25sb2FkXCIpKSBzID8gKHQucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIiksIHQucmVtb3ZlQXR0cmlidXRlKFwidGFiaW5kZXhcIiksIHQuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBzKSwgdC5zZXRBdHRyaWJ1dGUoXCJkb3dubG9hZFwiLCBzKSwgdC5zZXRBdHRyaWJ1dGUoXCJ0YXJnZXRcIiwgXCJfYmxhbmtcIikpIDogKHQuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJcIiksIHQuc2V0QXR0cmlidXRlKFwidGFiaW5kZXhcIiwgLTEpLCB0LnJlbW92ZUF0dHJpYnV0ZShcImhyZWZcIiksIHQucmVtb3ZlQXR0cmlidXRlKFwiZG93bmxvYWRcIikpO1xuXG4gICAgICAgIGNvbnN0IG8gPSB0LlBhbnpvb20sXG4gICAgICAgICAgICAgIG4gPSBvICYmIG8ub3B0aW9uKFwibWF4U2NhbGVcIikgPiBvLm9wdGlvbihcImJhc2VTY2FsZVwiKTtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgdGhpcy5mYW5jeWJveC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZmFuY3lib3hfX2J1dHRvbi0tem9vbVwiKSkgbiA/IHQucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIikgOiB0LnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIFwiXCIpO1xuXG4gICAgICAgIGZvciAoY29uc3QgZSBvZiB0aGlzLmZhbmN5Ym94LiRjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWZhbmN5Ym94LWluZGV4XVwiKSkgZS5pbm5lckhUTUwgPSB0LmluZGV4ICsgMTtcblxuICAgICAgICBmb3IgKGNvbnN0IHQgb2YgdGhpcy5mYW5jeWJveC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1mYW5jeWJveC1jb3VudF1cIikpIHQuaW5uZXJIVE1MID0gaTtcblxuICAgICAgICBpZiAoIXRoaXMuZmFuY3lib3gub3B0aW9uKFwiaW5maW5pdGVcIikpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IHQgb2YgdGhpcy5mYW5jeWJveC4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1mYW5jeWJveC1wcmV2XVwiKSkgMCA9PT0gZSA/IHQuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgXCJcIikgOiB0LnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuXG4gICAgICAgICAgZm9yIChjb25zdCB0IG9mIHRoaXMuZmFuY3lib3guJGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtZmFuY3lib3gtbmV4dF1cIikpIGUgPT09IGkgLSAxID8gdC5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBcIlwiKSA6IHQucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2xlYW51cCgpIHtcbiAgICAgICAgdGhpcy5TbGlkZXNob3cgJiYgdGhpcy5TbGlkZXNob3cuaXNBY3RpdmUoKSAmJiB0aGlzLlNsaWRlc2hvdy5jbGVhclRpbWVyKCksIHRoaXMuJGNvbnRhaW5lciAmJiB0aGlzLiRjb250YWluZXIucmVtb3ZlKCksIHRoaXMuJGNvbnRhaW5lciA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGF0dGFjaCgpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveC5vbih0aGlzLmV2ZW50cyk7XG4gICAgICB9XG5cbiAgICAgIGRldGFjaCgpIHtcbiAgICAgICAgdGhpcy5mYW5jeWJveC5vZmYodGhpcy5ldmVudHMpLCB0aGlzLmNsZWFudXAoKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGsuZGVmYXVsdHMgPSB6O1xuICAgIGNvbnN0IE8gPSB7XG4gICAgICBTY3JvbGxMb2NrOiBjbGFzcyB7XG4gICAgICAgIGNvbnN0cnVjdG9yKHQpIHtcbiAgICAgICAgICB0aGlzLmZhbmN5Ym94ID0gdCwgdGhpcy52aWV3cG9ydCA9IG51bGwsIHRoaXMucGVuZGluZ1VwZGF0ZSA9IG51bGw7XG5cbiAgICAgICAgICBmb3IgKGNvbnN0IHQgb2YgW1wib25SZWFkeVwiLCBcIm9uUmVzaXplXCIsIFwib25Ub3VjaHN0YXJ0XCIsIFwib25Ub3VjaG1vdmVcIl0pIHRoaXNbdF0gPSB0aGlzW3RdLmJpbmQodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBvblJlYWR5KCkge1xuICAgICAgICAgIGNvbnN0IHQgPSB3aW5kb3cudmlzdWFsVmlld3BvcnQ7XG4gICAgICAgICAgdCAmJiAodGhpcy52aWV3cG9ydCA9IHQsIHRoaXMuc3RhcnRZID0gMCwgdC5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMub25SZXNpemUpLCB0aGlzLnVwZGF0ZVZpZXdwb3J0KCkpLCB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgdGhpcy5vblRvdWNoc3RhcnQsIHtcbiAgICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgICAgfSksIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRoaXMub25Ub3VjaG1vdmUsIHtcbiAgICAgICAgICAgIHBhc3NpdmU6ICExXG4gICAgICAgICAgfSksIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgdGhpcy5vbldoZWVsLCB7XG4gICAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgb25SZXNpemUoKSB7XG4gICAgICAgICAgdGhpcy51cGRhdGVWaWV3cG9ydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdXBkYXRlVmlld3BvcnQoKSB7XG4gICAgICAgICAgY29uc3QgdCA9IHRoaXMuZmFuY3lib3gsXG4gICAgICAgICAgICAgICAgZSA9IHRoaXMudmlld3BvcnQsXG4gICAgICAgICAgICAgICAgaSA9IGUuc2NhbGUgfHwgMSxcbiAgICAgICAgICAgICAgICBzID0gdC4kY29udGFpbmVyO1xuICAgICAgICAgIGlmICghcykgcmV0dXJuO1xuICAgICAgICAgIGxldCBvID0gXCJcIixcbiAgICAgICAgICAgICAgbiA9IFwiXCIsXG4gICAgICAgICAgICAgIGEgPSBcIlwiO1xuICAgICAgICAgIGkgLSAxID4gLjEgJiYgKG8gPSBlLndpZHRoICogaSArIFwicHhcIiwgbiA9IGUuaGVpZ2h0ICogaSArIFwicHhcIiwgYSA9IGB0cmFuc2xhdGUzZCgke2Uub2Zmc2V0TGVmdH1weCwgJHtlLm9mZnNldFRvcH1weCwgMCkgc2NhbGUoJHsxIC8gaX0pYCksIHMuc3R5bGUud2lkdGggPSBvLCBzLnN0eWxlLmhlaWdodCA9IG4sIHMuc3R5bGUudHJhbnNmb3JtID0gYTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uVG91Y2hzdGFydCh0KSB7XG4gICAgICAgICAgdGhpcy5zdGFydFkgPSB0LnRvdWNoZXMgPyB0LnRvdWNoZXNbMF0uc2NyZWVuWSA6IHQuc2NyZWVuWTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uVG91Y2htb3ZlKHQpIHtcbiAgICAgICAgICBjb25zdCBlID0gdGhpcy5zdGFydFksXG4gICAgICAgICAgICAgICAgaSA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICBpZiAoIXQuY2FuY2VsYWJsZSkgcmV0dXJuO1xuICAgICAgICAgIGlmICh0LnRvdWNoZXMubGVuZ3RoID4gMSB8fCAxICE9PSBpKSByZXR1cm47XG4gICAgICAgICAgY29uc3QgbyA9IHModC5jb21wb3NlZFBhdGgoKVswXSk7XG4gICAgICAgICAgaWYgKCFvKSByZXR1cm4gdm9pZCB0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgY29uc3QgbiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG8pLFxuICAgICAgICAgICAgICAgIGEgPSBwYXJzZUludChuLmdldFByb3BlcnR5VmFsdWUoXCJoZWlnaHRcIiksIDEwKSxcbiAgICAgICAgICAgICAgICByID0gdC50b3VjaGVzID8gdC50b3VjaGVzWzBdLnNjcmVlblkgOiB0LnNjcmVlblksXG4gICAgICAgICAgICAgICAgaCA9IGUgPD0gciAmJiAwID09PSBvLnNjcm9sbFRvcCxcbiAgICAgICAgICAgICAgICBsID0gZSA+PSByICYmIG8uc2Nyb2xsSGVpZ2h0IC0gby5zY3JvbGxUb3AgPT09IGE7XG4gICAgICAgICAgKGggfHwgbCkgJiYgdC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgb25XaGVlbCh0KSB7XG4gICAgICAgICAgcyh0LmNvbXBvc2VkUGF0aCgpWzBdKSB8fCB0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhbnVwKCkge1xuICAgICAgICAgIHRoaXMucGVuZGluZ1VwZGF0ZSAmJiAoY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5wZW5kaW5nVXBkYXRlKSwgdGhpcy5wZW5kaW5nVXBkYXRlID0gbnVsbCk7XG4gICAgICAgICAgY29uc3QgdCA9IHRoaXMudmlld3BvcnQ7XG4gICAgICAgICAgdCAmJiAodC5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMub25SZXNpemUpLCB0aGlzLnZpZXdwb3J0ID0gbnVsbCksIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCB0aGlzLm9uVG91Y2hzdGFydCwgITEpLCB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCB0aGlzLm9uVG91Y2htb3ZlLCAhMSksIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwid2hlZWxcIiwgdGhpcy5vbldoZWVsLCB7XG4gICAgICAgICAgICBwYXNzaXZlOiAhMVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0YWNoKCkge1xuICAgICAgICAgIHRoaXMuZmFuY3lib3gub24oXCJpbml0TGF5b3V0XCIsIHRoaXMub25SZWFkeSk7XG4gICAgICAgIH1cblxuICAgICAgICBkZXRhY2goKSB7XG4gICAgICAgICAgdGhpcy5mYW5jeWJveC5vZmYoXCJpbml0TGF5b3V0XCIsIHRoaXMub25SZWFkeSksIHRoaXMuY2xlYW51cCgpO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICBUaHVtYnM6IEMsXG4gICAgICBIdG1sOiBQLFxuICAgICAgVG9vbGJhcjogayxcbiAgICAgIEltYWdlOiBULFxuICAgICAgSGFzaDogTFxuICAgIH07XG4gICAgY29uc3QgTSA9IHtcbiAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICBwcmVsb2FkOiAxLFxuICAgICAgaW5maW5pdGU6ICEwLFxuICAgICAgc2hvd0NsYXNzOiBcImZhbmN5Ym94LXpvb21JblVwXCIsXG4gICAgICBoaWRlQ2xhc3M6IFwiZmFuY3lib3gtZmFkZU91dFwiLFxuICAgICAgYW5pbWF0ZWQ6ICEwLFxuICAgICAgaGlkZVNjcm9sbGJhcjogITAsXG4gICAgICBwYXJlbnRFbDogbnVsbCxcbiAgICAgIG1haW5DbGFzczogbnVsbCxcbiAgICAgIGF1dG9Gb2N1czogITAsXG4gICAgICB0cmFwRm9jdXM6ICEwLFxuICAgICAgcGxhY2VGb2N1c0JhY2s6ICEwLFxuICAgICAgY2xpY2s6IFwiY2xvc2VcIixcbiAgICAgIGNsb3NlQnV0dG9uOiBcImluc2lkZVwiLFxuICAgICAgZHJhZ1RvQ2xvc2U6ICEwLFxuICAgICAga2V5Ym9hcmQ6IHtcbiAgICAgICAgRXNjYXBlOiBcImNsb3NlXCIsXG4gICAgICAgIERlbGV0ZTogXCJjbG9zZVwiLFxuICAgICAgICBCYWNrc3BhY2U6IFwiY2xvc2VcIixcbiAgICAgICAgUGFnZVVwOiBcIm5leHRcIixcbiAgICAgICAgUGFnZURvd246IFwicHJldlwiLFxuICAgICAgICBBcnJvd1VwOiBcIm5leHRcIixcbiAgICAgICAgQXJyb3dEb3duOiBcInByZXZcIixcbiAgICAgICAgQXJyb3dSaWdodDogXCJuZXh0XCIsXG4gICAgICAgIEFycm93TGVmdDogXCJwcmV2XCJcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZToge1xuICAgICAgICBjbG9zZUJ1dHRvbjogJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiB0YWJpbmRleD1cIi0xXCI+PHBhdGggZD1cIk0yMCAyMEw0IDRtMTYgMEw0IDIwXCIvPjwvc3ZnPicsXG4gICAgICAgIHNwaW5uZXI6ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjUwXCIgaGVpZ2h0PVwiNTBcIiB2aWV3Qm94PVwiMjUgMjUgNTAgNTBcIiB0YWJpbmRleD1cIi0xXCI+PGNpcmNsZSBjeD1cIjUwXCIgY3k9XCI1MFwiIHI9XCIyMFwiLz48L3N2Zz4nLFxuICAgICAgICBtYWluOiBudWxsXG4gICAgICB9LFxuICAgICAgbDEwbjoge1xuICAgICAgICBDTE9TRTogXCJDbG9zZVwiLFxuICAgICAgICBORVhUOiBcIk5leHRcIixcbiAgICAgICAgUFJFVjogXCJQcmV2aW91c1wiLFxuICAgICAgICBNT0RBTDogXCJZb3UgY2FuIGNsb3NlIHRoaXMgbW9kYWwgY29udGVudCB3aXRoIHRoZSBFU0Mga2V5XCIsXG4gICAgICAgIEVSUk9SOiBcIlNvbWV0aGluZyBXZW50IFdyb25nLCBQbGVhc2UgVHJ5IEFnYWluIExhdGVyXCIsXG4gICAgICAgIElNQUdFX0VSUk9SOiBcIkltYWdlIE5vdCBGb3VuZFwiLFxuICAgICAgICBFTEVNRU5UX05PVF9GT1VORDogXCJIVE1MIEVsZW1lbnQgTm90IEZvdW5kXCIsXG4gICAgICAgIEFKQVhfTk9UX0ZPVU5EOiBcIkVycm9yIExvYWRpbmcgQUpBWCA6IE5vdCBGb3VuZFwiLFxuICAgICAgICBBSkFYX0ZPUkJJRERFTjogXCJFcnJvciBMb2FkaW5nIEFKQVggOiBGb3JiaWRkZW5cIixcbiAgICAgICAgSUZSQU1FX0VSUk9SOiBcIkVycm9yIExvYWRpbmcgUGFnZVwiLFxuICAgICAgICBUT0dHTEVfWk9PTTogXCJUb2dnbGUgem9vbSBsZXZlbFwiLFxuICAgICAgICBUT0dHTEVfVEhVTUJTOiBcIlRvZ2dsZSB0aHVtYm5haWxzXCIsXG4gICAgICAgIFRPR0dMRV9TTElERVNIT1c6IFwiVG9nZ2xlIHNsaWRlc2hvd1wiLFxuICAgICAgICBUT0dHTEVfRlVMTFNDUkVFTjogXCJUb2dnbGUgZnVsbC1zY3JlZW4gbW9kZVwiLFxuICAgICAgICBET1dOTE9BRDogXCJEb3dubG9hZFwiXG4gICAgICB9XG4gICAgfSxcbiAgICAgICAgICBJID0gbmV3IE1hcCgpO1xuICAgIGxldCBGID0gMDtcblxuICAgIGNsYXNzIFIgZXh0ZW5kcyBsIHtcbiAgICAgIGNvbnN0cnVjdG9yKHQsIGkgPSB7fSkge1xuICAgICAgICB0ID0gdC5tYXAodCA9PiAodC53aWR0aCAmJiAodC5fd2lkdGggPSB0LndpZHRoKSwgdC5oZWlnaHQgJiYgKHQuX2hlaWdodCA9IHQuaGVpZ2h0KSwgdCkpLCBzdXBlcihlKCEwLCB7fSwgTSwgaSkpLCB0aGlzLmJpbmRIYW5kbGVycygpLCB0aGlzLnN0YXRlID0gXCJpbml0XCIsIHRoaXMuc2V0SXRlbXModCksIHRoaXMuYXR0YWNoUGx1Z2lucyhSLlBsdWdpbnMpLCB0aGlzLnRyaWdnZXIoXCJpbml0XCIpLCAhMCA9PT0gdGhpcy5vcHRpb24oXCJoaWRlU2Nyb2xsYmFyXCIpICYmIHRoaXMuaGlkZVNjcm9sbGJhcigpLCB0aGlzLmluaXRMYXlvdXQoKSwgdGhpcy5pbml0Q2Fyb3VzZWwoKSwgdGhpcy5hdHRhY2hFdmVudHMoKSwgSS5zZXQodGhpcy5pZCwgdGhpcyksIHRoaXMudHJpZ2dlcihcInByZXBhcmVcIiksIHRoaXMuc3RhdGUgPSBcInJlYWR5XCIsIHRoaXMudHJpZ2dlcihcInJlYWR5XCIpLCB0aGlzLiRjb250YWluZXIuc2V0QXR0cmlidXRlKFwiYXJpYS1oaWRkZW5cIiwgXCJmYWxzZVwiKSwgdGhpcy5vcHRpb24oXCJ0cmFwRm9jdXNcIikgJiYgdGhpcy5mb2N1cygpO1xuICAgICAgfVxuXG4gICAgICBvcHRpb24odCwgLi4uZSkge1xuICAgICAgICBjb25zdCBpID0gdGhpcy5nZXRTbGlkZSgpO1xuICAgICAgICBsZXQgcyA9IGkgPyBpW3RdIDogdm9pZCAwO1xuICAgICAgICByZXR1cm4gdm9pZCAwICE9PSBzID8gKFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgcyAmJiAocyA9IHMuY2FsbCh0aGlzLCB0aGlzLCAuLi5lKSksIHMpIDogc3VwZXIub3B0aW9uKHQsIC4uLmUpO1xuICAgICAgfVxuXG4gICAgICBiaW5kSGFuZGxlcnMoKSB7XG4gICAgICAgIGZvciAoY29uc3QgdCBvZiBbXCJvbk1vdXNlZG93blwiLCBcIm9uS2V5ZG93blwiLCBcIm9uQ2xpY2tcIiwgXCJvbkZvY3VzXCIsIFwib25DcmVhdGVTbGlkZVwiLCBcIm9uU2V0dGxlXCIsIFwib25Ub3VjaE1vdmVcIiwgXCJvblRvdWNoRW5kXCIsIFwib25UcmFuc2Zvcm1cIl0pIHRoaXNbdF0gPSB0aGlzW3RdLmJpbmQodGhpcyk7XG4gICAgICB9XG5cbiAgICAgIGF0dGFjaEV2ZW50cygpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm9uTW91c2Vkb3duKSwgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbktleWRvd24sICEwKSwgdGhpcy5vcHRpb24oXCJ0cmFwRm9jdXNcIikgJiYgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMub25Gb2N1cywgITApLCB0aGlzLiRjb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMub25DbGljayk7XG4gICAgICB9XG5cbiAgICAgIGRldGFjaEV2ZW50cygpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm9uTW91c2Vkb3duKSwgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbktleWRvd24sICEwKSwgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMub25Gb2N1cywgITApLCB0aGlzLiRjb250YWluZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMub25DbGljayk7XG4gICAgICB9XG5cbiAgICAgIGluaXRMYXlvdXQoKSB7XG4gICAgICAgIHRoaXMuJHJvb3QgPSB0aGlzLm9wdGlvbihcInBhcmVudEVsXCIpIHx8IGRvY3VtZW50LmJvZHk7XG4gICAgICAgIGxldCB0ID0gdGhpcy5vcHRpb24oXCJ0ZW1wbGF0ZS5tYWluXCIpO1xuICAgICAgICB0ICYmICh0aGlzLiRyb290Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCB0aGlzLmxvY2FsaXplKHQpKSwgdGhpcy4kY29udGFpbmVyID0gdGhpcy4kcm9vdC5xdWVyeVNlbGVjdG9yKFwiLmZhbmN5Ym94X19jb250YWluZXJcIikpLCB0aGlzLiRjb250YWluZXIgfHwgKHRoaXMuJGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIHRoaXMuJHJvb3QuYXBwZW5kQ2hpbGQodGhpcy4kY29udGFpbmVyKSksIHRoaXMuJGNvbnRhaW5lci5vbnNjcm9sbCA9ICgpID0+ICh0aGlzLiRjb250YWluZXIuc2Nyb2xsTGVmdCA9IDAsICExKSwgT2JqZWN0LmVudHJpZXMoe1xuICAgICAgICAgIGNsYXNzOiBcImZhbmN5Ym94X19jb250YWluZXJcIixcbiAgICAgICAgICByb2xlOiBcImRpYWxvZ1wiLFxuICAgICAgICAgIHRhYkluZGV4OiBcIi0xXCIsXG4gICAgICAgICAgXCJhcmlhLW1vZGFsXCI6IFwidHJ1ZVwiLFxuICAgICAgICAgIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsXG4gICAgICAgICAgXCJhcmlhLWxhYmVsXCI6IHRoaXMubG9jYWxpemUoXCJ7e01PREFMfX1cIilcbiAgICAgICAgfSkuZm9yRWFjaCh0ID0+IHRoaXMuJGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoLi4udCkpLCB0aGlzLm9wdGlvbihcImFuaW1hdGVkXCIpICYmIHRoaXMuJGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaXMtYW5pbWF0ZWRcIiksIHRoaXMuJGJhY2tkcm9wID0gdGhpcy4kY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuZmFuY3lib3hfX2JhY2tkcm9wXCIpLCB0aGlzLiRiYWNrZHJvcCB8fCAodGhpcy4kYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLCB0aGlzLiRiYWNrZHJvcC5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3hfX2JhY2tkcm9wXCIpLCB0aGlzLiRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy4kYmFja2Ryb3ApKSwgdGhpcy4kY2Fyb3VzZWwgPSB0aGlzLiRjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5mYW5jeWJveF9fY2Fyb3VzZWxcIiksIHRoaXMuJGNhcm91c2VsIHx8ICh0aGlzLiRjYXJvdXNlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIHRoaXMuJGNhcm91c2VsLmNsYXNzTGlzdC5hZGQoXCJmYW5jeWJveF9fY2Fyb3VzZWxcIiksIHRoaXMuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLiRjYXJvdXNlbCkpLCB0aGlzLiRjb250YWluZXIuRmFuY3lib3ggPSB0aGlzLCB0aGlzLmlkID0gdGhpcy4kY29udGFpbmVyLmdldEF0dHJpYnV0ZShcImlkXCIpLCB0aGlzLmlkIHx8ICh0aGlzLmlkID0gdGhpcy5vcHRpb25zLmlkIHx8ICsrRiwgdGhpcy4kY29udGFpbmVyLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiZmFuY3lib3gtXCIgKyB0aGlzLmlkKSk7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLm9wdGlvbihcIm1haW5DbGFzc1wiKTtcbiAgICAgICAgcmV0dXJuIGUgJiYgdGhpcy4kY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoLi4uZS5zcGxpdChcIiBcIikpLCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcIndpdGgtZmFuY3lib3hcIiksIHRoaXMudHJpZ2dlcihcImluaXRMYXlvdXRcIiksIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIHNldEl0ZW1zKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgaSBvZiB0KSB7XG4gICAgICAgICAgY29uc3QgdCA9IGkuJHRyaWdnZXI7XG5cbiAgICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgY29uc3QgZSA9IHQuZGF0YXNldCB8fCB7fTtcbiAgICAgICAgICAgIGkuc3JjID0gZS5zcmMgfHwgdC5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpIHx8IGkuc3JjLCBpLnR5cGUgPSBlLnR5cGUgfHwgaS50eXBlLCAhaS5zcmMgJiYgdCBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgJiYgKGkuc3JjID0gdC5jdXJyZW50U3JjIHx8IGkuJHRyaWdnZXIuc3JjKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgcyA9IGkuJHRodW1iO1xuXG4gICAgICAgICAgaWYgKCFzKSB7XG4gICAgICAgICAgICBsZXQgdCA9IGkuJHRyaWdnZXIgJiYgaS4kdHJpZ2dlci5vcmlnVGFyZ2V0O1xuICAgICAgICAgICAgdCAmJiAocyA9IHQgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50ID8gdCA6IHQucXVlcnlTZWxlY3RvcihcImltZzpub3QoW2FyaWEtaGlkZGVuXSlcIikpLCAhcyAmJiBpLiR0cmlnZ2VyICYmIChzID0gaS4kdHJpZ2dlciBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgPyBpLiR0cmlnZ2VyIDogaS4kdHJpZ2dlci5xdWVyeVNlbGVjdG9yKFwiaW1nOm5vdChbYXJpYS1oaWRkZW5dKVwiKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaS4kdGh1bWIgPSBzIHx8IG51bGw7XG4gICAgICAgICAgbGV0IG8gPSBpLnRodW1iO1xuICAgICAgICAgICFvICYmIHMgJiYgKG8gPSBzLmN1cnJlbnRTcmMgfHwgcy5zcmMsICFvICYmIHMuZGF0YXNldCAmJiAobyA9IHMuZGF0YXNldC5sYXp5U3JjIHx8IHMuZGF0YXNldC5zcmMpKSwgbyB8fCBcImltYWdlXCIgIT09IGkudHlwZSB8fCAobyA9IGkuc3JjKSwgaS50aHVtYiA9IG8gfHwgbnVsbCwgaS5jYXB0aW9uID0gaS5jYXB0aW9uIHx8IFwiXCIsIGUucHVzaChpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaXRlbXMgPSBlO1xuICAgICAgfVxuXG4gICAgICBpbml0Q2Fyb3VzZWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLkNhcm91c2VsID0gbmV3IHkodGhpcy4kY2Fyb3VzZWwsIGUoITAsIHt9LCB7XG4gICAgICAgICAgcHJlZml4OiBcIlwiLFxuICAgICAgICAgIGNsYXNzTmFtZXM6IHtcbiAgICAgICAgICAgIHZpZXdwb3J0OiBcImZhbmN5Ym94X192aWV3cG9ydFwiLFxuICAgICAgICAgICAgdHJhY2s6IFwiZmFuY3lib3hfX3RyYWNrXCIsXG4gICAgICAgICAgICBzbGlkZTogXCJmYW5jeWJveF9fc2xpZGVcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAgdGV4dFNlbGVjdGlvbjogITAsXG4gICAgICAgICAgcHJlbG9hZDogdGhpcy5vcHRpb24oXCJwcmVsb2FkXCIpLFxuICAgICAgICAgIGZyaWN0aW9uOiAuODgsXG4gICAgICAgICAgc2xpZGVzOiB0aGlzLml0ZW1zLFxuICAgICAgICAgIGluaXRpYWxQYWdlOiB0aGlzLm9wdGlvbnMuc3RhcnRJbmRleCxcbiAgICAgICAgICBzbGlkZXNQZXJQYWdlOiAxLFxuICAgICAgICAgIGluZmluaXRlWDogdGhpcy5vcHRpb24oXCJpbmZpbml0ZVwiKSxcbiAgICAgICAgICBpbmZpbml0ZVk6ICEwLFxuICAgICAgICAgIGwxMG46IHRoaXMub3B0aW9uKFwibDEwblwiKSxcbiAgICAgICAgICBEb3RzOiAhMSxcbiAgICAgICAgICBOYXZpZ2F0aW9uOiB7XG4gICAgICAgICAgICBjbGFzc05hbWVzOiB7XG4gICAgICAgICAgICAgIG1haW46IFwiZmFuY3lib3hfX25hdlwiLFxuICAgICAgICAgICAgICBidXR0b246IFwiY2Fyb3VzZWxfX2J1dHRvblwiLFxuICAgICAgICAgICAgICBuZXh0OiBcImlzLW5leHRcIixcbiAgICAgICAgICAgICAgcHJldjogXCJpcy1wcmV2XCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIFBhbnpvb206IHtcbiAgICAgICAgICAgIHRleHRTZWxlY3Rpb246ICEwLFxuICAgICAgICAgICAgcGFuT25seVpvb21lZDogKCkgPT4gdGhpcy5DYXJvdXNlbCAmJiB0aGlzLkNhcm91c2VsLnBhZ2VzICYmIHRoaXMuQ2Fyb3VzZWwucGFnZXMubGVuZ3RoIDwgMiAmJiAhdGhpcy5vcHRpb24oXCJkcmFnVG9DbG9zZVwiKSxcbiAgICAgICAgICAgIGxvY2tBeGlzOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLkNhcm91c2VsKSB7XG4gICAgICAgICAgICAgICAgbGV0IHQgPSBcInhcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vcHRpb24oXCJkcmFnVG9DbG9zZVwiKSAmJiAodCArPSBcInlcIiksIHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uOiB7XG4gICAgICAgICAgICBcIipcIjogKHQsIC4uLmUpID0+IHRoaXMudHJpZ2dlcihgQ2Fyb3VzZWwuJHt0fWAsIC4uLmUpLFxuICAgICAgICAgICAgaW5pdDogdCA9PiB0aGlzLkNhcm91c2VsID0gdCxcbiAgICAgICAgICAgIGNyZWF0ZVNsaWRlOiB0aGlzLm9uQ3JlYXRlU2xpZGUsXG4gICAgICAgICAgICBzZXR0bGU6IHRoaXMub25TZXR0bGVcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMub3B0aW9uKFwiQ2Fyb3VzZWxcIikpKSwgdGhpcy5vcHRpb24oXCJkcmFnVG9DbG9zZVwiKSAmJiB0aGlzLkNhcm91c2VsLlBhbnpvb20ub24oe1xuICAgICAgICAgIHRvdWNoTW92ZTogdGhpcy5vblRvdWNoTW92ZSxcbiAgICAgICAgICBhZnRlclRyYW5zZm9ybTogdGhpcy5vblRyYW5zZm9ybSxcbiAgICAgICAgICB0b3VjaEVuZDogdGhpcy5vblRvdWNoRW5kXG4gICAgICAgIH0pLCB0aGlzLnRyaWdnZXIoXCJpbml0Q2Fyb3VzZWxcIiksIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIG9uQ3JlYXRlU2xpZGUodCwgZSkge1xuICAgICAgICBsZXQgaSA9IGUuY2FwdGlvbiB8fCBcIlwiO1xuXG4gICAgICAgIGlmIChcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHRoaXMub3B0aW9ucy5jYXB0aW9uICYmIChpID0gdGhpcy5vcHRpb25zLmNhcHRpb24uY2FsbCh0aGlzLCB0aGlzLCB0aGlzLkNhcm91c2VsLCBlKSksIFwic3RyaW5nXCIgPT0gdHlwZW9mIGkgJiYgaS5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zdCB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgICAgICBzID0gYGZhbmN5Ym94X19jYXB0aW9uXyR7dGhpcy5pZH1fJHtlLmluZGV4fWA7XG4gICAgICAgICAgdC5jbGFzc05hbWUgPSBcImZhbmN5Ym94X19jYXB0aW9uXCIsIHQuaW5uZXJIVE1MID0gaSwgdC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBzKSwgZS4kY2FwdGlvbiA9IGUuJGVsLmFwcGVuZENoaWxkKHQpLCBlLiRlbC5jbGFzc0xpc3QuYWRkKFwiaGFzLWNhcHRpb25cIiksIGUuJGVsLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxsZWRieVwiLCBzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvblNldHRsZSgpIHtcbiAgICAgICAgdGhpcy5vcHRpb24oXCJhdXRvRm9jdXNcIikgJiYgdGhpcy5mb2N1cygpO1xuICAgICAgfVxuXG4gICAgICBvbkZvY3VzKHQpIHtcbiAgICAgICAgdGhpcy5pc1RvcG1vc3QoKSAmJiB0aGlzLmZvY3VzKHQpO1xuICAgICAgfVxuXG4gICAgICBvbkNsaWNrKHQpIHtcbiAgICAgICAgaWYgKHQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuICAgICAgICBsZXQgZSA9IHQuY29tcG9zZWRQYXRoKClbMF07XG4gICAgICAgIGlmIChlLm1hdGNoZXMoXCJbZGF0YS1mYW5jeWJveC1jbG9zZV1cIikpIHJldHVybiB0LnByZXZlbnREZWZhdWx0KCksIHZvaWQgUi5jbG9zZSghMSwgdCk7XG4gICAgICAgIGlmIChlLm1hdGNoZXMoXCJbZGF0YS1mYW5jeWJveC1uZXh0XVwiKSkgcmV0dXJuIHQucHJldmVudERlZmF1bHQoKSwgdm9pZCBSLm5leHQoKTtcbiAgICAgICAgaWYgKGUubWF0Y2hlcyhcIltkYXRhLWZhbmN5Ym94LXByZXZdXCIpKSByZXR1cm4gdC5wcmV2ZW50RGVmYXVsdCgpLCB2b2lkIFIucHJldigpO1xuICAgICAgICBjb25zdCBpID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBpZiAoaSkge1xuICAgICAgICAgIGlmIChpLmNsb3Nlc3QoXCJbY29udGVudGVkaXRhYmxlXVwiKSkgcmV0dXJuO1xuICAgICAgICAgIGUubWF0Y2hlcyh4KSB8fCBpLmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlLmNsb3Nlc3QoXCIuZmFuY3lib3hfX2NvbnRlbnRcIikpIHJldHVybjtcbiAgICAgICAgaWYgKGdldFNlbGVjdGlvbigpLnRvU3RyaW5nKCkubGVuZ3RoKSByZXR1cm47XG4gICAgICAgIGlmICghMSA9PT0gdGhpcy50cmlnZ2VyKFwiY2xpY2tcIiwgdCkpIHJldHVybjtcblxuICAgICAgICBzd2l0Y2ggKHRoaXMub3B0aW9uKFwiY2xpY2tcIikpIHtcbiAgICAgICAgICBjYXNlIFwiY2xvc2VcIjpcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcIm5leHRcIjpcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG9uVG91Y2hNb3ZlKCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5nZXRTbGlkZSgpLlBhbnpvb207XG4gICAgICAgIHJldHVybiAhdCB8fCAxID09PSB0LmNvbnRlbnQuc2NhbGU7XG4gICAgICB9XG5cbiAgICAgIG9uVG91Y2hFbmQodCkge1xuICAgICAgICBjb25zdCBlID0gdC5kcmFnT2Zmc2V0Lnk7XG4gICAgICAgIE1hdGguYWJzKGUpID49IDE1MCB8fCBNYXRoLmFicyhlKSA+PSAzNSAmJiB0LmRyYWdPZmZzZXQudGltZSA8IDM1MCA/ICh0aGlzLm9wdGlvbihcImhpZGVDbGFzc1wiKSAmJiAodGhpcy5nZXRTbGlkZSgpLmhpZGVDbGFzcyA9IFwiZmFuY3lib3gtdGhyb3dPdXRcIiArICh0LmNvbnRlbnQueSA8IDAgPyBcIlVwXCIgOiBcIkRvd25cIikpLCB0aGlzLmNsb3NlKCkpIDogXCJ5XCIgPT09IHQubG9ja0F4aXMgJiYgdC5wYW5Ubyh7XG4gICAgICAgICAgeTogMFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgb25UcmFuc2Zvcm0odCkge1xuICAgICAgICBpZiAodGhpcy4kYmFja2Ryb3ApIHtcbiAgICAgICAgICBjb25zdCBlID0gTWF0aC5hYnModC5jb250ZW50LnkpLFxuICAgICAgICAgICAgICAgIGkgPSBlIDwgMSA/IFwiXCIgOiBNYXRoLm1heCguMzMsIE1hdGgubWluKDEsIDEgLSBlIC8gdC5jb250ZW50LmZpdEhlaWdodCAqIDEuNSkpO1xuICAgICAgICAgIHRoaXMuJGNvbnRhaW5lci5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tZmFuY3lib3gtdHNcIiwgaSA/IFwiMHNcIiA6IFwiXCIpLCB0aGlzLiRjb250YWluZXIuc3R5bGUuc2V0UHJvcGVydHkoXCItLWZhbmN5Ym94LW9wYWNpdHlcIiwgaSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb25Nb3VzZWRvd24oKSB7XG4gICAgICAgIFwicmVhZHlcIiA9PT0gdGhpcy5zdGF0ZSAmJiBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJpcy11c2luZy1tb3VzZVwiKTtcbiAgICAgIH1cblxuICAgICAgb25LZXlkb3duKHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVG9wbW9zdCgpKSByZXR1cm47XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImlzLXVzaW5nLW1vdXNlXCIpO1xuICAgICAgICBjb25zdCBlID0gdC5rZXksXG4gICAgICAgICAgICAgIGkgPSB0aGlzLm9wdGlvbihcImtleWJvYXJkXCIpO1xuICAgICAgICBpZiAoIWkgfHwgdC5jdHJsS2V5IHx8IHQuYWx0S2V5IHx8IHQuc2hpZnRLZXkpIHJldHVybjtcbiAgICAgICAgY29uc3QgcyA9IHQuY29tcG9zZWRQYXRoKClbMF0sXG4gICAgICAgICAgICAgIG8gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LFxuICAgICAgICAgICAgICBuID0gbyAmJiBvLmNvbnRhaW5zKFwiY2Fyb3VzZWxfX2J1dHRvblwiKTtcblxuICAgICAgICBpZiAoXCJFc2NhcGVcIiAhPT0gZSAmJiAhbikge1xuICAgICAgICAgIGlmICh0LnRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSB8fCAtMSAhPT0gW1wiQlVUVE9OXCIsIFwiVEVYVEFSRUFcIiwgXCJPUFRJT05cIiwgXCJJTlBVVFwiLCBcIlNFTEVDVFwiLCBcIlZJREVPXCJdLmluZGV4T2Yocy5ub2RlTmFtZSkpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghMSA9PT0gdGhpcy50cmlnZ2VyKFwia2V5ZG93blwiLCBlLCB0KSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBhID0gaVtlXTtcbiAgICAgICAgXCJmdW5jdGlvblwiID09IHR5cGVvZiB0aGlzW2FdICYmIHRoaXNbYV0oKTtcbiAgICAgIH1cblxuICAgICAgZ2V0U2xpZGUoKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLkNhcm91c2VsO1xuICAgICAgICBpZiAoIXQpIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBlID0gbnVsbCA9PT0gdC5wYWdlID8gdC5vcHRpb24oXCJpbml0aWFsUGFnZVwiKSA6IHQucGFnZSxcbiAgICAgICAgICAgICAgaSA9IHQucGFnZXMgfHwgW107XG4gICAgICAgIHJldHVybiBpLmxlbmd0aCAmJiBpW2VdID8gaVtlXS5zbGlkZXNbMF0gOiBudWxsO1xuICAgICAgfVxuXG4gICAgICBmb2N1cyh0KSB7XG4gICAgICAgIGlmIChSLmlnbm9yZUZvY3VzQ2hhbmdlKSByZXR1cm47XG4gICAgICAgIGlmIChbXCJpbml0XCIsIFwiY2xvc2luZ1wiLCBcImN1c3RvbUNsb3NpbmdcIiwgXCJkZXN0cm95XCJdLmluZGV4T2YodGhpcy5zdGF0ZSkgPiAtMSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBlID0gdGhpcy4kY29udGFpbmVyLFxuICAgICAgICAgICAgICBpID0gdGhpcy5nZXRTbGlkZSgpLFxuICAgICAgICAgICAgICBzID0gXCJkb25lXCIgPT09IGkuc3RhdGUgPyBpLiRlbCA6IG51bGw7XG4gICAgICAgIGlmIChzICYmIHMuY29udGFpbnMoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCkpIHJldHVybjtcbiAgICAgICAgdCAmJiB0LnByZXZlbnREZWZhdWx0KCksIFIuaWdub3JlRm9jdXNDaGFuZ2UgPSAhMDtcbiAgICAgICAgY29uc3QgbyA9IEFycmF5LmZyb20oZS5xdWVyeVNlbGVjdG9yQWxsKHgpKTtcbiAgICAgICAgbGV0IG4sXG4gICAgICAgICAgICBhID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgdCBvZiBvKSB7XG4gICAgICAgICAgY29uc3QgZSA9IHQub2Zmc2V0UGFyZW50LFxuICAgICAgICAgICAgICAgIGkgPSBzICYmIHMuY29udGFpbnModCksXG4gICAgICAgICAgICAgICAgbyA9ICF0aGlzLkNhcm91c2VsLiR2aWV3cG9ydC5jb250YWlucyh0KTtcbiAgICAgICAgICBlICYmIChpIHx8IG8pID8gKGEucHVzaCh0KSwgdm9pZCAwICE9PSB0LmRhdGFzZXQub3JpZ1RhYmluZGV4ICYmICh0LnRhYkluZGV4ID0gdC5kYXRhc2V0Lm9yaWdUYWJpbmRleCwgdC5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW9yaWctdGFiaW5kZXhcIikpLCAodC5oYXNBdHRyaWJ1dGUoXCJhdXRvRm9jdXNcIikgfHwgIW4gJiYgaSAmJiAhdC5jbGFzc0xpc3QuY29udGFpbnMoXCJjYXJvdXNlbF9fYnV0dG9uXCIpKSAmJiAobiA9IHQpKSA6ICh0LmRhdGFzZXQub3JpZ1RhYmluZGV4ID0gdm9pZCAwID09PSB0LmRhdGFzZXQub3JpZ1RhYmluZGV4ID8gdC5nZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiKSA6IHQuZGF0YXNldC5vcmlnVGFiaW5kZXgsIHQudGFiSW5kZXggPSAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0ID8gYS5pbmRleE9mKHQudGFyZ2V0KSA+IC0xID8gdGhpcy5sYXN0Rm9jdXMgPSB0LnRhcmdldCA6IHRoaXMubGFzdEZvY3VzID09PSBlID8gdyhhW2EubGVuZ3RoIC0gMV0pIDogdyhlKSA6IHRoaXMub3B0aW9uKFwiYXV0b0ZvY3VzXCIpICYmIG4gPyB3KG4pIDogYS5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIDwgMCAmJiB3KGUpLCB0aGlzLmxhc3RGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQsIFIuaWdub3JlRm9jdXNDaGFuZ2UgPSAhMTtcbiAgICAgIH1cblxuICAgICAgaGlkZVNjcm9sbGJhcigpIHtcbiAgICAgICAgaWYgKCF2KSByZXR1cm47XG4gICAgICAgIGNvbnN0IHQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCxcbiAgICAgICAgICAgICAgZSA9IFwiZmFuY3lib3gtc3R5bGUtbm9zY3JvbGxcIjtcbiAgICAgICAgbGV0IGkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlKTtcbiAgICAgICAgaSB8fCB0ID4gMCAmJiAoaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKSwgaS5pZCA9IGUsIGkudHlwZSA9IFwidGV4dC9jc3NcIiwgaS5pbm5lckhUTUwgPSBgLmNvbXBlbnNhdGUtZm9yLXNjcm9sbGJhciB7cGFkZGluZy1yaWdodDogJHt0fXB4O31gLCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0uYXBwZW5kQ2hpbGQoaSksIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcImNvbXBlbnNhdGUtZm9yLXNjcm9sbGJhclwiKSk7XG4gICAgICB9XG5cbiAgICAgIHJldmVhbFNjcm9sbGJhcigpIHtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwiY29tcGVuc2F0ZS1mb3Itc2Nyb2xsYmFyXCIpO1xuICAgICAgICBjb25zdCB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmYW5jeWJveC1zdHlsZS1ub3Njcm9sbFwiKTtcbiAgICAgICAgdCAmJiB0LnJlbW92ZSgpO1xuICAgICAgfVxuXG4gICAgICBjbGVhckNvbnRlbnQodCkge1xuICAgICAgICB0aGlzLkNhcm91c2VsLnRyaWdnZXIoXCJyZW1vdmVTbGlkZVwiLCB0KSwgdC4kY29udGVudCAmJiAodC4kY29udGVudC5yZW1vdmUoKSwgdC4kY29udGVudCA9IG51bGwpLCB0LiRjbG9zZUJ1dHRvbiAmJiAodC4kY2xvc2VCdXR0b24ucmVtb3ZlKCksIHQuJGNsb3NlQnV0dG9uID0gbnVsbCksIHQuX2NsYXNzTmFtZSAmJiB0LiRlbC5jbGFzc0xpc3QucmVtb3ZlKHQuX2NsYXNzTmFtZSk7XG4gICAgICB9XG5cbiAgICAgIHNldENvbnRlbnQodCwgZSwgaSA9IHt9KSB7XG4gICAgICAgIGxldCBzO1xuICAgICAgICBjb25zdCBvID0gdC4kZWw7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIFtcImltZ1wiLCBcImlmcmFtZVwiLCBcInZpZGVvXCIsIFwiYXVkaW9cIl0uaW5kZXhPZihlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID4gLTEgPyAocyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksIHMuYXBwZW5kQ2hpbGQoZSkpIDogcyA9IGU7ZWxzZSB7XG4gICAgICAgICAgY29uc3QgdCA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KGUpO1xuICAgICAgICAgIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLCBzLmFwcGVuZENoaWxkKHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0LmZpbHRlciAmJiAhdC5lcnJvciAmJiAocyA9IHMucXVlcnlTZWxlY3Rvcih0LmZpbHRlcikpLCBzIGluc3RhbmNlb2YgRWxlbWVudCkgcmV0dXJuIHQuX2NsYXNzTmFtZSA9IGBoYXMtJHtpLnN1ZmZpeCB8fCB0LnR5cGUgfHwgXCJ1bmtub3duXCJ9YCwgby5jbGFzc0xpc3QuYWRkKHQuX2NsYXNzTmFtZSksIHMuY2xhc3NMaXN0LmFkZChcImZhbmN5Ym94X19jb250ZW50XCIpLCBcIm5vbmVcIiAhPT0gcy5zdHlsZS5kaXNwbGF5ICYmIFwibm9uZVwiICE9PSBnZXRDb21wdXRlZFN0eWxlKHMpLmdldFByb3BlcnR5VmFsdWUoXCJkaXNwbGF5XCIpIHx8IChzLnN0eWxlLmRpc3BsYXkgPSB0LmRpc3BsYXkgfHwgdGhpcy5vcHRpb24oXCJkZWZhdWx0RGlzcGxheVwiKSB8fCBcImZsZXhcIiksIHQuaWQgJiYgcy5zZXRBdHRyaWJ1dGUoXCJpZFwiLCB0LmlkKSwgdC4kY29udGVudCA9IHMsIG8ucHJlcGVuZChzKSwgdGhpcy5tYW5hZ2VDbG9zZUJ1dHRvbih0KSwgXCJsb2FkaW5nXCIgIT09IHQuc3RhdGUgJiYgdGhpcy5yZXZlYWxDb250ZW50KHQpLCBzO1xuICAgICAgICB0aGlzLnNldEVycm9yKHQsIFwie3tFTEVNRU5UX05PVF9GT1VORH19XCIpO1xuICAgICAgfVxuXG4gICAgICBtYW5hZ2VDbG9zZUJ1dHRvbih0KSB7XG4gICAgICAgIGNvbnN0IGUgPSB2b2lkIDAgPT09IHQuY2xvc2VCdXR0b24gPyB0aGlzLm9wdGlvbihcImNsb3NlQnV0dG9uXCIpIDogdC5jbG9zZUJ1dHRvbjtcbiAgICAgICAgaWYgKCFlIHx8IFwidG9wXCIgPT09IGUgJiYgdGhpcy4kY2xvc2VCdXR0b24pIHJldHVybjtcbiAgICAgICAgY29uc3QgaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgICAgIGkuY2xhc3NMaXN0LmFkZChcImNhcm91c2VsX19idXR0b25cIiwgXCJpcy1jbG9zZVwiKSwgaS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCB0aGlzLm9wdGlvbnMubDEwbi5DTE9TRSksIGkuaW5uZXJIVE1MID0gdGhpcy5vcHRpb24oXCJ0ZW1wbGF0ZS5jbG9zZUJ1dHRvblwiKSwgaS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgdCA9PiB0aGlzLmNsb3NlKHQpKSwgXCJpbnNpZGVcIiA9PT0gZSA/ICh0LiRjbG9zZUJ1dHRvbiAmJiB0LiRjbG9zZUJ1dHRvbi5yZW1vdmUoKSwgdC4kY2xvc2VCdXR0b24gPSB0LiRjb250ZW50LmFwcGVuZENoaWxkKGkpKSA6IHRoaXMuJGNsb3NlQnV0dG9uID0gdGhpcy4kY29udGFpbmVyLmluc2VydEJlZm9yZShpLCB0aGlzLiRjb250YWluZXIuZmlyc3RDaGlsZCk7XG4gICAgICB9XG5cbiAgICAgIHJldmVhbENvbnRlbnQodCkge1xuICAgICAgICB0aGlzLnRyaWdnZXIoXCJyZXZlYWxcIiwgdCksIHQuJGNvbnRlbnQuc3R5bGUudmlzaWJpbGl0eSA9IFwiXCI7XG4gICAgICAgIGxldCBlID0gITE7XG4gICAgICAgIHQuZXJyb3IgfHwgXCJsb2FkaW5nXCIgPT09IHQuc3RhdGUgfHwgbnVsbCAhPT0gdGhpcy5DYXJvdXNlbC5wcmV2UGFnZSB8fCB0LmluZGV4ICE9PSB0aGlzLm9wdGlvbnMuc3RhcnRJbmRleCB8fCAoZSA9IHZvaWQgMCA9PT0gdC5zaG93Q2xhc3MgPyB0aGlzLm9wdGlvbihcInNob3dDbGFzc1wiKSA6IHQuc2hvd0NsYXNzKSwgZSA/ICh0LnN0YXRlID0gXCJhbmltYXRpbmdcIiwgdGhpcy5hbmltYXRlQ1NTKHQuJGNvbnRlbnQsIGUsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmRvbmUodCk7XG4gICAgICAgIH0pKSA6IHRoaXMuZG9uZSh0KTtcbiAgICAgIH1cblxuICAgICAgYW5pbWF0ZUNTUyh0LCBlLCBpKSB7XG4gICAgICAgIGlmICh0ICYmIHQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJhbmltYXRpb25lbmRcIiwge1xuICAgICAgICAgIGJ1YmJsZXM6ICEwLFxuICAgICAgICAgIGNhbmNlbGFibGU6ICEwXG4gICAgICAgIH0pKSwgIXQgfHwgIWUpIHJldHVybiB2b2lkIChcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGkgJiYgaSgpKTtcblxuICAgICAgICBjb25zdCBzID0gZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICBvLmN1cnJlbnRUYXJnZXQgPT09IHRoaXMgJiYgKHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImFuaW1hdGlvbmVuZFwiLCBzKSwgaSAmJiBpKCksIHQuY2xhc3NMaXN0LnJlbW92ZShlKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdC5hZGRFdmVudExpc3RlbmVyKFwiYW5pbWF0aW9uZW5kXCIsIHMpLCB0LmNsYXNzTGlzdC5hZGQoZSk7XG4gICAgICB9XG5cbiAgICAgIGRvbmUodCkge1xuICAgICAgICB0LnN0YXRlID0gXCJkb25lXCIsIHRoaXMudHJpZ2dlcihcImRvbmVcIiwgdCk7XG4gICAgICAgIGNvbnN0IGUgPSB0aGlzLmdldFNsaWRlKCk7XG4gICAgICAgIGUgJiYgdC5pbmRleCA9PT0gZS5pbmRleCAmJiB0aGlzLm9wdGlvbihcImF1dG9Gb2N1c1wiKSAmJiB0aGlzLmZvY3VzKCk7XG4gICAgICB9XG5cbiAgICAgIHNldEVycm9yKHQsIGUpIHtcbiAgICAgICAgdC5lcnJvciA9IGUsIHRoaXMuaGlkZUxvYWRpbmcodCksIHRoaXMuY2xlYXJDb250ZW50KHQpO1xuICAgICAgICBjb25zdCBpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgaS5jbGFzc0xpc3QuYWRkKFwiZmFuY3lib3gtZXJyb3JcIiksIGkuaW5uZXJIVE1MID0gdGhpcy5sb2NhbGl6ZShlIHx8IFwiPHA+e3tFUlJPUn19PC9wPlwiKSwgdGhpcy5zZXRDb250ZW50KHQsIGksIHtcbiAgICAgICAgICBzdWZmaXg6IFwiZXJyb3JcIlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgc2hvd0xvYWRpbmcodCkge1xuICAgICAgICB0LnN0YXRlID0gXCJsb2FkaW5nXCIsIHQuJGVsLmNsYXNzTGlzdC5hZGQoXCJpcy1sb2FkaW5nXCIpO1xuICAgICAgICBsZXQgZSA9IHQuJGVsLnF1ZXJ5U2VsZWN0b3IoXCIuZmFuY3lib3hfX3NwaW5uZXJcIik7XG4gICAgICAgIGUgfHwgKGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLCBlLmNsYXNzTGlzdC5hZGQoXCJmYW5jeWJveF9fc3Bpbm5lclwiKSwgZS5pbm5lckhUTUwgPSB0aGlzLm9wdGlvbihcInRlbXBsYXRlLnNwaW5uZXJcIiksIGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICB0aGlzLkNhcm91c2VsLlBhbnpvb20udmVsb2NpdHkgfHwgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9KSwgdC4kZWwucHJlcGVuZChlKSk7XG4gICAgICB9XG5cbiAgICAgIGhpZGVMb2FkaW5nKHQpIHtcbiAgICAgICAgY29uc3QgZSA9IHQuJGVsICYmIHQuJGVsLnF1ZXJ5U2VsZWN0b3IoXCIuZmFuY3lib3hfX3NwaW5uZXJcIik7XG4gICAgICAgIGUgJiYgKGUucmVtb3ZlKCksIHQuJGVsLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1sb2FkaW5nXCIpKSwgXCJsb2FkaW5nXCIgPT09IHQuc3RhdGUgJiYgKHRoaXMudHJpZ2dlcihcImxvYWRcIiwgdCksIHQuc3RhdGUgPSBcInJlYWR5XCIpO1xuICAgICAgfVxuXG4gICAgICBuZXh0KCkge1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5DYXJvdXNlbDtcbiAgICAgICAgdCAmJiB0LnBhZ2VzLmxlbmd0aCA+IDEgJiYgdC5zbGlkZU5leHQoKTtcbiAgICAgIH1cblxuICAgICAgcHJldigpIHtcbiAgICAgICAgY29uc3QgdCA9IHRoaXMuQ2Fyb3VzZWw7XG4gICAgICAgIHQgJiYgdC5wYWdlcy5sZW5ndGggPiAxICYmIHQuc2xpZGVQcmV2KCk7XG4gICAgICB9XG5cbiAgICAgIGp1bXBUbyguLi50KSB7XG4gICAgICAgIHRoaXMuQ2Fyb3VzZWwgJiYgdGhpcy5DYXJvdXNlbC5zbGlkZVRvKC4uLnQpO1xuICAgICAgfVxuXG4gICAgICBpc0Nsb3NpbmcoKSB7XG4gICAgICAgIHJldHVybiBbXCJjbG9zaW5nXCIsIFwiY3VzdG9tQ2xvc2luZ1wiLCBcImRlc3Ryb3lcIl0uaW5jbHVkZXModGhpcy5zdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlzVG9wbW9zdCgpIHtcbiAgICAgICAgcmV0dXJuIFIuZ2V0SW5zdGFuY2UoKS5pZCA9PSB0aGlzLmlkO1xuICAgICAgfVxuXG4gICAgICBjbG9zZSh0KSB7XG4gICAgICAgIGlmICh0ICYmIHQucHJldmVudERlZmF1bHQoKSwgdGhpcy5pc0Nsb3NpbmcoKSkgcmV0dXJuO1xuICAgICAgICBpZiAoITEgPT09IHRoaXMudHJpZ2dlcihcInNob3VsZENsb3NlXCIsIHQpKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLnN0YXRlID0gXCJjbG9zaW5nXCIsIHRoaXMuQ2Fyb3VzZWwuUGFuem9vbS5kZXN0cm95KCksIHRoaXMuZGV0YWNoRXZlbnRzKCksIHRoaXMudHJpZ2dlcihcImNsb3NpbmdcIiwgdCksIFwiZGVzdHJveVwiID09PSB0aGlzLnN0YXRlKSByZXR1cm47XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWhpZGRlblwiLCBcInRydWVcIiksIHRoaXMuJGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwiaXMtY2xvc2luZ1wiKTtcbiAgICAgICAgY29uc3QgZSA9IHRoaXMuZ2V0U2xpZGUoKTtcblxuICAgICAgICBpZiAodGhpcy5DYXJvdXNlbC5zbGlkZXMuZm9yRWFjaCh0ID0+IHtcbiAgICAgICAgICB0LiRjb250ZW50ICYmIHQuaW5kZXggIT09IGUuaW5kZXggJiYgdGhpcy5DYXJvdXNlbC50cmlnZ2VyKFwicmVtb3ZlU2xpZGVcIiwgdCk7XG4gICAgICAgIH0pLCBcImNsb3NpbmdcIiA9PT0gdGhpcy5zdGF0ZSkge1xuICAgICAgICAgIGNvbnN0IHQgPSB2b2lkIDAgPT09IGUuaGlkZUNsYXNzID8gdGhpcy5vcHRpb24oXCJoaWRlQ2xhc3NcIikgOiBlLmhpZGVDbGFzcztcbiAgICAgICAgICB0aGlzLmFuaW1hdGVDU1MoZS4kY29udGVudCwgdCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgICAgfSwgITApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIGlmIChcImRlc3Ryb3lcIiA9PT0gdGhpcy5zdGF0ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJkZXN0cm95XCIsIHRoaXMudHJpZ2dlcihcImRlc3Ryb3lcIik7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLm9wdGlvbihcInBsYWNlRm9jdXNCYWNrXCIpID8gdGhpcy5vcHRpb24oXCJ0cmlnZ2VyVGFyZ2V0XCIsIHRoaXMuZ2V0U2xpZGUoKS4kdHJpZ2dlcikgOiBudWxsO1xuICAgICAgICB0aGlzLkNhcm91c2VsLmRlc3Ryb3koKSwgdGhpcy5kZXRhY2hQbHVnaW5zKCksIHRoaXMuQ2Fyb3VzZWwgPSBudWxsLCB0aGlzLm9wdGlvbnMgPSB7fSwgdGhpcy5ldmVudHMgPSB7fSwgdGhpcy4kY29udGFpbmVyLnJlbW92ZSgpLCB0aGlzLiRjb250YWluZXIgPSB0aGlzLiRiYWNrZHJvcCA9IHRoaXMuJGNhcm91c2VsID0gbnVsbCwgdCAmJiB3KHQpLCBJLmRlbGV0ZSh0aGlzLmlkKTtcbiAgICAgICAgY29uc3QgZSA9IFIuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgZSA/IGUuZm9jdXMoKSA6IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIndpdGgtZmFuY3lib3hcIiksIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImlzLXVzaW5nLW1vdXNlXCIpLCB0aGlzLnJldmVhbFNjcm9sbGJhcigpKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIHNob3codCwgZSA9IHt9KSB7XG4gICAgICAgIHJldHVybiBuZXcgUih0LCBlKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGZyb21FdmVudCh0LCBlID0ge30pIHtcbiAgICAgICAgaWYgKHQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuICAgICAgICBpZiAodC5idXR0b24gJiYgMCAhPT0gdC5idXR0b24pIHJldHVybjtcbiAgICAgICAgaWYgKHQuY3RybEtleSB8fCB0Lm1ldGFLZXkgfHwgdC5zaGlmdEtleSkgcmV0dXJuO1xuICAgICAgICBjb25zdCBpID0gdC5jb21wb3NlZFBhdGgoKVswXTtcbiAgICAgICAgbGV0IHMsXG4gICAgICAgICAgICBvLFxuICAgICAgICAgICAgbixcbiAgICAgICAgICAgIGEgPSBpO1xuXG4gICAgICAgIGlmICgoYS5tYXRjaGVzKFwiW2RhdGEtZmFuY3lib3gtdHJpZ2dlcl1cIikgfHwgKGEgPSBhLmNsb3Nlc3QoXCJbZGF0YS1mYW5jeWJveC10cmlnZ2VyXVwiKSkpICYmIChlLnRyaWdnZXJUYXJnZXQgPSBhLCBzID0gYSAmJiBhLmRhdGFzZXQgJiYgYS5kYXRhc2V0LmZhbmN5Ym94VHJpZ2dlciksIHMpIHtcbiAgICAgICAgICBjb25zdCB0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtZmFuY3lib3g9XCIke3N9XCJdYCksXG4gICAgICAgICAgICAgICAgZSA9IHBhcnNlSW50KGEuZGF0YXNldC5mYW5jeWJveEluZGV4LCAxMCkgfHwgMDtcbiAgICAgICAgICBhID0gdC5sZW5ndGggPyB0W2VdIDogYTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFycmF5LmZyb20oUi5vcGVuZXJzLmtleXMoKSkucmV2ZXJzZSgpLnNvbWUoZSA9PiB7XG4gICAgICAgICAgbiA9IGEgfHwgaTtcbiAgICAgICAgICBsZXQgcyA9ICExO1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG4gaW5zdGFuY2VvZiBFbGVtZW50ICYmIChcInN0cmluZ1wiID09IHR5cGVvZiBlIHx8IGUgaW5zdGFuY2VvZiBTdHJpbmcpICYmIChzID0gbi5tYXRjaGVzKGUpIHx8IChuID0gbi5jbG9zZXN0KGUpKSk7XG4gICAgICAgICAgfSBjYXRjaCAodCkge31cblxuICAgICAgICAgIHJldHVybiAhIXMgJiYgKHQucHJldmVudERlZmF1bHQoKSwgbyA9IGUsICEwKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGxldCByID0gITE7XG5cbiAgICAgICAgaWYgKG8pIHtcbiAgICAgICAgICBlLmV2ZW50ID0gdCwgZS50YXJnZXQgPSBuLCBuLm9yaWdUYXJnZXQgPSBpLCByID0gUi5mcm9tT3BlbmVyKG8sIGUpO1xuICAgICAgICAgIGNvbnN0IHMgPSBSLmdldEluc3RhbmNlKCk7XG4gICAgICAgICAgcyAmJiBcInJlYWR5XCIgPT09IHMuc3RhdGUgJiYgdC5kZXRhaWwgJiYgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKFwiaXMtdXNpbmctbW91c2VcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcjtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGZyb21PcGVuZXIodCwgaSA9IHt9KSB7XG4gICAgICAgIGxldCBzID0gW10sXG4gICAgICAgICAgICBvID0gaS5zdGFydEluZGV4IHx8IDAsXG4gICAgICAgICAgICBuID0gaS50YXJnZXQgfHwgbnVsbDtcbiAgICAgICAgY29uc3QgYSA9IHZvaWQgMCAhPT0gKGkgPSBlKHt9LCBpLCBSLm9wZW5lcnMuZ2V0KHQpKSkuZ3JvdXBBbGwgJiYgaS5ncm91cEFsbCxcbiAgICAgICAgICAgICAgciA9IHZvaWQgMCA9PT0gaS5ncm91cEF0dHIgPyBcImRhdGEtZmFuY3lib3hcIiA6IGkuZ3JvdXBBdHRyLFxuICAgICAgICAgICAgICBoID0gciAmJiBuID8gbi5nZXRBdHRyaWJ1dGUoYCR7cn1gKSA6IFwiXCI7XG5cbiAgICAgICAgaWYgKCFuIHx8IGggfHwgYSkge1xuICAgICAgICAgIGNvbnN0IGUgPSBpLnJvb3QgfHwgKG4gPyBuLmdldFJvb3ROb2RlKCkgOiBkb2N1bWVudC5ib2R5KTtcbiAgICAgICAgICBzID0gW10uc2xpY2UuY2FsbChlLnF1ZXJ5U2VsZWN0b3JBbGwodCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG4gJiYgIWEgJiYgKHMgPSBoID8gcy5maWx0ZXIodCA9PiB0LmdldEF0dHJpYnV0ZShgJHtyfWApID09PSBoKSA6IFtuXSksICFzLmxlbmd0aCkgcmV0dXJuICExO1xuICAgICAgICBjb25zdCBsID0gUi5nZXRJbnN0YW5jZSgpO1xuICAgICAgICByZXR1cm4gIShsICYmIHMuaW5kZXhPZihsLm9wdGlvbnMuJHRyaWdnZXIpID4gLTEpICYmIChvID0gbiA/IHMuaW5kZXhPZihuKSA6IG8sIHMgPSBzLm1hcChmdW5jdGlvbiAodCkge1xuICAgICAgICAgIGNvbnN0IGUgPSBbXCJmYWxzZVwiLCBcIjBcIiwgXCJub1wiLCBcIm51bGxcIiwgXCJ1bmRlZmluZWRcIl0sXG4gICAgICAgICAgICAgICAgaSA9IFtcInRydWVcIiwgXCIxXCIsIFwieWVzXCJdLFxuICAgICAgICAgICAgICAgIHMgPSBPYmplY3QuYXNzaWduKHt9LCB0LmRhdGFzZXQpLFxuICAgICAgICAgICAgICAgIG8gPSB7fTtcblxuICAgICAgICAgIGZvciAobGV0IFt0LCBuXSBvZiBPYmplY3QuZW50cmllcyhzKSkgaWYgKFwiZmFuY3lib3hcIiAhPT0gdCkgaWYgKFwid2lkdGhcIiA9PT0gdCB8fCBcImhlaWdodFwiID09PSB0KSBvW2BfJHt0fWBdID0gbjtlbHNlIGlmIChcInN0cmluZ1wiID09IHR5cGVvZiBuIHx8IG4gaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YobikgPiAtMSkgb1t0XSA9ICExO2Vsc2UgaWYgKGkuaW5kZXhPZihvW3RdKSA+IC0xKSBvW3RdID0gITA7ZWxzZSB0cnkge1xuICAgICAgICAgICAgICBvW3RdID0gSlNPTi5wYXJzZShuKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgb1t0XSA9IG47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIG9bdF0gPSBuO1xuXG4gICAgICAgICAgcmV0dXJuIHQgaW5zdGFuY2VvZiBFbGVtZW50ICYmIChvLiR0cmlnZ2VyID0gdCksIG87XG4gICAgICAgIH0pLCBuZXcgUihzLCBlKHt9LCBpLCB7XG4gICAgICAgICAgc3RhcnRJbmRleDogbyxcbiAgICAgICAgICAkdHJpZ2dlcjogblxuICAgICAgICB9KSkpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgYmluZCh0LCBlID0ge30pIHtcbiAgICAgICAgZnVuY3Rpb24gaSgpIHtcbiAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBSLmZyb21FdmVudCwgITEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdiAmJiAoUi5vcGVuZXJzLnNpemUgfHwgKC9jb21wbGV0ZXxpbnRlcmFjdGl2ZXxsb2FkZWQvLnRlc3QoZG9jdW1lbnQucmVhZHlTdGF0ZSkgPyBpKCkgOiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpKSksIFIub3BlbmVycy5zZXQodCwgZSkpO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgdW5iaW5kKHQpIHtcbiAgICAgICAgUi5vcGVuZXJzLmRlbGV0ZSh0KSwgUi5vcGVuZXJzLnNpemUgfHwgUi5kZXN0cm95KCk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBkZXN0cm95KCkge1xuICAgICAgICBsZXQgdDtcblxuICAgICAgICBmb3IgKDsgdCA9IFIuZ2V0SW5zdGFuY2UoKTspIHQuZGVzdHJveSgpO1xuXG4gICAgICAgIFIub3BlbmVycyA9IG5ldyBNYXAoKSwgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgUi5mcm9tRXZlbnQsICExKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIGdldEluc3RhbmNlKHQpIHtcbiAgICAgICAgaWYgKHQpIHJldHVybiBJLmdldCh0KTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oSS52YWx1ZXMoKSkucmV2ZXJzZSgpLmZpbmQodCA9PiAhdC5pc0Nsb3NpbmcoKSAmJiB0KSB8fCBudWxsO1xuICAgICAgfVxuXG4gICAgICBzdGF0aWMgY2xvc2UodCA9ICEwLCBlKSB7XG4gICAgICAgIGlmICh0KSBmb3IgKGNvbnN0IHQgb2YgSS52YWx1ZXMoKSkgdC5jbG9zZShlKTtlbHNlIHtcbiAgICAgICAgICBjb25zdCB0ID0gUi5nZXRJbnN0YW5jZSgpO1xuICAgICAgICAgIHQgJiYgdC5jbG9zZShlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzdGF0aWMgbmV4dCgpIHtcbiAgICAgICAgY29uc3QgdCA9IFIuZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgdCAmJiB0Lm5leHQoKTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIHByZXYoKSB7XG4gICAgICAgIGNvbnN0IHQgPSBSLmdldEluc3RhbmNlKCk7XG4gICAgICAgIHQgJiYgdC5wcmV2KCk7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBSLnZlcnNpb24gPSBcIjQuMC4zMVwiLCBSLmRlZmF1bHRzID0gTSwgUi5vcGVuZXJzID0gbmV3IE1hcCgpLCBSLlBsdWdpbnMgPSBPLCBSLmJpbmQoXCJbZGF0YS1mYW5jeWJveF1cIik7XG5cbiAgICBmb3IgKGNvbnN0IFt0LCBlXSBvZiBPYmplY3QuZW50cmllcyhSLlBsdWdpbnMgfHwge30pKSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGUuY3JlYXRlICYmIGUuY3JlYXRlKFIpO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlRmFzaGlvblNsaWRlcihlbCkge1xuICAgICAgY29uc3Qgc3dpcGVyRWwgPSBlbC5xdWVyeVNlbGVjdG9yKCcuc3dpcGVyLWZhc2hpb24nKTtcbiAgICAgIGxldCBuYXZpZ2F0aW9uTG9ja2VkID0gZmFsc2U7XG4gICAgICBsZXQgdHJhbnNpdGlvbkRpc2FibGVkID0gZmFsc2U7XG4gICAgICBsZXQgZnJhbWVJZDtcblxuICAgICAgY29uc3QgZGlzYWJsZVRyYW5zaXRpb25zID0gJGVsID0+IHtcbiAgICAgICAgJGVsLmFkZENsYXNzKCdmYXNoaW9uLXNsaWRlci1uby10cmFuc2l0aW9uJyk7XG4gICAgICAgIHRyYW5zaXRpb25EaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lSWQpO1xuICAgICAgICBmcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAkZWwucmVtb3ZlQ2xhc3MoJ2Zhc2hpb24tc2xpZGVyLW5vLXRyYW5zaXRpb24nKTtcbiAgICAgICAgICB0cmFuc2l0aW9uRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICBuYXZpZ2F0aW9uTG9ja2VkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgY29uc3QgaW5pdE5hdmlnYXRpb24gPSBzd2lwZXIgPT4ge1xuICAgICAgICAvLyBVc2UgbG9jayB0byBjb250cm9sIHRoZSBidXR0b24gbG9ja2luZyB0aW1lIHdpdGhvdXQgdXNpbmcgdGhlIGJ1dHRvbiBjb21wb25lbnQgdGhhdCBjb21lcyB3aXRoIGl0XG4gICAgICAgIHN3aXBlci4kZWwuZmluZCgnLmZhc2hpb24tc2xpZGVyLWJ1dHRvbi1uZXh0Jykub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIGlmICghbmF2aWdhdGlvbkxvY2tlZCkge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlTmV4dCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHN3aXBlci4kZWwuZmluZCgnLmZhc2hpb24tc2xpZGVyLWJ1dHRvbi1wcmV2Jykub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgIGlmICghbmF2aWdhdGlvbkxvY2tlZCkge1xuICAgICAgICAgICAgc3dpcGVyLnNsaWRlUHJldigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBkZXN0cm95TmF2aWdhdGlvbiA9IHN3aXBlciA9PiB7XG4gICAgICAgIHN3aXBlci4kZWwuZmluZCgnLmZhc2hpb24tc2xpZGVyLWJ1dHRvbi1uZXh0LCAuZmFzaGlvbi1zbGlkZXItYnV0dG9uLXByZXYnKS5vZmYoJ2NsaWNrJyk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBmYXNoaW9uU2xpZGVyID0gbmV3IFN3aXBlcihzd2lwZXJFbCwge1xuICAgICAgICBtb2R1bGVzOiBbUGFyYWxsYXgsIFBhZ2luYXRpb24sIEF1dG9wbGF5XSxcbiAgICAgICAgc3BlZWQ6IDEzMDAsXG4gICAgICAgIGFsbG93VG91Y2hNb3ZlOiBmYWxzZSxcbiAgICAgICAgLy8gbm8gdG91Y2ggc3dpcGluZ1xuICAgICAgICBwYXJhbGxheDogdHJ1ZSxcbiAgICAgICAgLy8gdGV4dCBwYXJhbGxheFxuICAgICAgICBvbjoge1xuICAgICAgICAgIHRyYW5zaXRpb25TdGFydChzd2lwZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgc2xpZGVzLFxuICAgICAgICAgICAgICBwcmV2aW91c0luZGV4LFxuICAgICAgICAgICAgICBhY3RpdmVJbmRleCxcbiAgICAgICAgICAgICAgJGVsXG4gICAgICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICAgICAgaWYgKCF0cmFuc2l0aW9uRGlzYWJsZWQpIG5hdmlnYXRpb25Mb2NrZWQgPSB0cnVlOyAvLyBsb2NrIG5hdmlnYXRpb24gYnV0dG9uc1xuXG4gICAgICAgICAgICBjb25zdCAkYWN0aXZlU2xpZGUgPSBzbGlkZXMuZXEoYWN0aXZlSW5kZXgpO1xuICAgICAgICAgICAgY29uc3QgJHByZXZpb3VzU2xpZGUgPSBzbGlkZXMuZXEocHJldmlvdXNJbmRleCk7XG4gICAgICAgICAgICBjb25zdCAkcHJldmlvdXNJbWFnZVNjYWxlID0gJHByZXZpb3VzU2xpZGUuZmluZCgnLmZhc2hpb24tc2xpZGVyLXNjYWxlJyk7IC8vIGltYWdlIHdyYXBwZXJcblxuICAgICAgICAgICAgY29uc3QgJHByZXZpb3VzSW1hZ2UgPSAkcHJldmlvdXNTbGlkZS5maW5kKCdpbWcnKTsgLy8gY3VycmVudCBpbWFnZVxuXG4gICAgICAgICAgICBjb25zdCAkYWN0aXZlSW1hZ2UgPSAkYWN0aXZlU2xpZGUuZmluZCgnaW1nJyk7IC8vIG5leHQgaW1hZ2VcblxuICAgICAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gYWN0aXZlSW5kZXggLSBwcmV2aW91c0luZGV4O1xuICAgICAgICAgICAgY29uc3QgYmdDb2xvciA9ICRhY3RpdmVTbGlkZS5hdHRyKCdkYXRhLXNsaWRlLWJnLWNvbG9yJyk7XG4gICAgICAgICAgICAkZWwuY3NzKCdiYWNrZ3JvdW5kLWNvbG9yJywgYmdDb2xvcik7IC8vIGJhY2tncm91bmQgY29sb3IgYW5pbWF0aW9uXG5cbiAgICAgICAgICAgICRwcmV2aW91c0ltYWdlU2NhbGUudHJhbnNmb3JtKCdzY2FsZSgwLjYpJyk7XG4gICAgICAgICAgICAkcHJldmlvdXNJbWFnZS50cmFuc2l0aW9uKDEwMDApLnRyYW5zZm9ybSgnc2NhbGUoMS4yKScpOyAvLyBpbWFnZSBzY2FsaW5nIHBhcmFsbGF4XG5cbiAgICAgICAgICAgICRwcmV2aW91c1NsaWRlLmZpbmQoJy5mYXNoaW9uLXNsaWRlci10aXRsZS10ZXh0JykudHJhbnNpdGlvbigxMDAwKS5jc3MoJ2NvbG9yJywgJ3JnYmEoMjU1LDI1NSwyNTUsMCknKSAvLyB0ZXh0IHRyYW5zcGFyZW5jeSBhbmltYXRpb25cbiAgICAgICAgICAgIC5jc3MoJ29wYWNpdHknLCAnMCcpOyAvLyB0ZXh0IHRyYW5zcGFyZW5jeSBhbmltYXRpb25cblxuICAgICAgICAgICAgJHByZXZpb3VzSW1hZ2UudHJhbnNpdGlvbkVuZCgoKSA9PiB7XG4gICAgICAgICAgICAgICRhY3RpdmVJbWFnZS50cmFuc2l0aW9uKDEzMDApLnRyYW5zZm9ybSgndHJhbnNsYXRlM2QoMCwgMCwgMCkgc2NhbGUoMS4yKScpOyAvLyBpbWFnZSBzaGlmdCBwYXJhbGxheFxuXG4gICAgICAgICAgICAgICRwcmV2aW91c0ltYWdlLnRyYW5zaXRpb24oMTMwMCkudHJhbnNmb3JtKGB0cmFuc2xhdGUzZCgkezYwICogZGlyZWN0aW9ufSUsIDAsIDApICBzY2FsZSgxLjIpYCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgdHJhbnNpdGlvbkVuZChzd2lwZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgc2xpZGVzLFxuICAgICAgICAgICAgICBhY3RpdmVJbmRleCxcbiAgICAgICAgICAgICAgJGVsXG4gICAgICAgICAgICB9ID0gc3dpcGVyO1xuICAgICAgICAgICAgY29uc3QgJGFjdGl2ZVNsaWRlID0gc2xpZGVzLmVxKGFjdGl2ZUluZGV4KTtcbiAgICAgICAgICAgIGNvbnN0ICRhY3RpdmVJbWFnZSA9ICRhY3RpdmVTbGlkZS5maW5kKCdpbWcnKTtcbiAgICAgICAgICAgICRhY3RpdmVTbGlkZS5maW5kKCcuZmFzaGlvbi1zbGlkZXItc2NhbGUnKS50cmFuc2Zvcm0oJ3NjYWxlKDEpJyk7XG4gICAgICAgICAgICAkYWN0aXZlSW1hZ2UudHJhbnNpdGlvbigxMDAwKS50cmFuc2Zvcm0oJ3NjYWxlKDEpJyk7XG4gICAgICAgICAgICAkYWN0aXZlU2xpZGUuZmluZCgnLmZhc2hpb24tc2xpZGVyLXRpdGxlLXRleHQnKS50cmFuc2l0aW9uKDEwMDApLmNzcygnY29sb3InLCAncmdiYSgyNTUsMjU1LDI1NSwxKScpLmNzcygnb3BhY2l0eScsICcxJyk7IC8vIHRleHQgdHJhbnNwYXJlbmN5IGFuaW1hdGlvblxuXG4gICAgICAgICAgICAkYWN0aXZlSW1hZ2UudHJhbnNpdGlvbkVuZCgoKSA9PiB7XG4gICAgICAgICAgICAgIG5hdmlnYXRpb25Mb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pOyAvLyBGaXJzdCBhbmQgbGFzdCwgZGlzYWJsZSBidXR0b25cblxuICAgICAgICAgICAgaWYgKGFjdGl2ZUluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICRlbC5maW5kKCcuZmFzaGlvbi1zbGlkZXItYnV0dG9uLXByZXYnKS5hZGRDbGFzcygnZmFzaGlvbi1zbGlkZXItYnV0dG9uLWRpc2FibGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkZWwuZmluZCgnLmZhc2hpb24tc2xpZGVyLWJ1dHRvbi1wcmV2JykucmVtb3ZlQ2xhc3MoJ2Zhc2hpb24tc2xpZGVyLWJ1dHRvbi1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWN0aXZlSW5kZXggPT09IHNsaWRlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICRlbC5maW5kKCcuZmFzaGlvbi1zbGlkZXItYnV0dG9uLW5leHQnKS5hZGRDbGFzcygnZmFzaGlvbi1zbGlkZXItYnV0dG9uLWRpc2FibGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkZWwuZmluZCgnLmZhc2hpb24tc2xpZGVyLWJ1dHRvbi1uZXh0JykucmVtb3ZlQ2xhc3MoJ2Zhc2hpb24tc2xpZGVyLWJ1dHRvbi1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBpbml0KHN3aXBlcikge1xuICAgICAgICAgICAgLy8gU2V0IGluaXRpYWwgc2xpZGUgYmcgY29sb3JcbiAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgc2xpZGVzLFxuICAgICAgICAgICAgICBhY3RpdmVJbmRleCxcbiAgICAgICAgICAgICAgJGVsXG4gICAgICAgICAgICB9ID0gc3dpcGVyOyAvLyBkaXNhYmxlIGluaXRpYWwgdHJhbnNpdGlvblxuXG4gICAgICAgICAgICBkaXNhYmxlVHJhbnNpdGlvbnMoJGVsKTsgLy8gc2V0IGN1cnJlbnQgYmcgY29sb3JcblxuICAgICAgICAgICAgY29uc3QgYmdDb2xvciA9IHNsaWRlcy5lcShhY3RpdmVJbmRleCkuYXR0cignZGF0YS1zbGlkZS1iZy1jb2xvcicpO1xuICAgICAgICAgICAgJGVsLmNzcygnYmFja2dyb3VuZC1jb2xvcicsIGJnQ29sb3IpOyAvLyBiYWNrZ3JvdW5kIGNvbG9yIGFuaW1hdGlvblxuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgdHJhbnNpdGlvbkVuZCBldmVudCBvbmNlIGR1cmluZyBpbml0aWFsaXphdGlvblxuXG4gICAgICAgICAgICBzd2lwZXIuZW1pdCgndHJhbnNpdGlvbkVuZCcpOyAvLyBpbml0IG5hdmlnYXRpb25cblxuICAgICAgICAgICAgaW5pdE5hdmlnYXRpb24oc3dpcGVyKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgcmVzaXplKHN3aXBlcikge1xuICAgICAgICAgICAgZGlzYWJsZVRyYW5zaXRpb25zKHN3aXBlci4kZWwpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBkZXN0cm95KHN3aXBlcikge1xuICAgICAgICAgICAgZGVzdHJveU5hdmlnYXRpb24oc3dpcGVyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgcGFnaW5hdGlvbjoge1xuICAgICAgICAgIGVsOiBcIi5mYXNoaW9uLXBhZ2luYXRpb25cIixcbiAgICAgICAgICB0eXBlOiAnYnVsbGV0cycsXG4gICAgICAgICAgY2xpY2thYmxlOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGF1dG9wbGF5OiB7XG4gICAgICAgICAgZGVsYXk6IDI1MDAsXG4gICAgICAgICAgZGlzYWJsZU9uSW50ZXJhY3Rpb246IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZhc2hpb25TbGlkZXI7XG4gICAgfVxuXG4gICAgLypcclxuICAgIHNvbWUgY29tbWVudFxyXG4gICAgKi9cbiAgICB2YXIgd3BjZjdFbG0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcud3BjZjcnKTtcblxuICAgIGlmICh3cGNmN0VsbSkge1xuICAgICAgd3BjZjdFbG0uYWRkRXZlbnRMaXN0ZW5lcignd3BjZjdtYWlsc2VudCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBjbG9zZSgpO1xuICAgICAgfSwgZmFsc2UpO1xuICAgICAgd3BjZjdFbG0uYWRkRXZlbnRMaXN0ZW5lcignd3BjZjdzdWJtaXQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBjb25zb2xlLmxvZygnc3VibWl0dGVkJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgY29uc29sZS5sb2coc2VsZik7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsvL1x0XHRcdGNvbnNvbGUubG9nKCQoc2VsZikuZmluZCgnZGl2LndwY2Y3LXJlc3BvbnNlLW91dHB1dCcpLmh0bWwoKSk7XG4gICAgICAgICAgLy9cdFx0XHR2YXIgcmVzcG9uc2VPdXRwdXQgPSAkKHNlbGYpLmZpbmQoJ2Rpdi53cGNmNy1yZXNwb25zZS1vdXRwdXQnKS5odG1sKCk7XG4gICAgICAgICAgLy9cdFx0XHRGYW5jeWJveC5vcGVuKHJlc3BvbnNlT3V0cHV0KTtcblxuICAgICAgICAgIC8qXHJcbiAgICAgICAgICBjb25zdCBmYW5jeWJveCA9IG5ldyBGYW5jeWJveChbXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgIFx0c3JjOiBcIjxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LjwvcD5cIixcclxuICAgICAgICAgIFx0dHlwZTogXCJodG1sXCIsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICBdKTtcclxuICAgICAgICAgICovXG4gICAgICAgIH0sIDEwMCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfVxuICAgIC8qXHJcbiAgICAkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG4gICAgXHQkKCcud3BjZjcnKS5vbignd3BjZjdtYWlsc2VudCcsZnVuY3Rpb24oKXtcclxuICAgIFx0XHQkLmZhbmN5Ym94LmNsb3NlKCB0cnVlICk7XHJcbiAgICBcdH0pO1xyXG4gICAgXHQkKCcud3BjZjcnKS5vbignd3BjZjdzdWJtaXQnLGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgIFx0XHQvL2NvbnNvbGUubG9nKGV2ZW50KTtcclxuICAgIFx0XHQvL2NvbnNvbGUubG9nKCdzb21lJyk7XHJcbiAgICBcdFx0dmFyIHNlbGY9dGhpcztcclxuICAgIFx0XHR3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpe1xyXG4gICAgXHRcdGNvbnNvbGUubG9nKCQoc2VsZikuZmluZCgnZGl2LndwY2Y3LXJlc3BvbnNlLW91dHB1dCcpLmh0bWwoKSk7XHJcbiAgICBcdFx0dmFyIHJlc3BvbnNlT3V0cHV0ID0gJChzZWxmKS5maW5kKCdkaXYud3BjZjctcmVzcG9uc2Utb3V0cHV0JykuaHRtbCgpO1xyXG4gICAgXHRcdFx0XHRqUXVlcnkuZmFuY3lib3gub3BlbihyZXNwb25zZU91dHB1dCk7XHJcbiAgICBcdH0sMTAwKTtcclxuICAgIFx0fSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAqL1xuXG4gICAgLyoqXHJcbiAgICAgKiBpbXBvcnQgbWFpbiBGYXNoaW9uIFNsaWRlciBmdW5jdGlvblxyXG4gICAgICovXG4gICAgLyplbmQgb2YgaW5sdWRlcyovXG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCByZWFkeSk7XG5cbiAgICBmdW5jdGlvbiByZWFkeSgpIHtcbiAgICAgIC8qKlxyXG4gICAgICAgKiBGYXNoaW9uIFNsaWRlciBlbGVtZW50XHJcbiAgICAgICAqL1xuICAgICAgY29uc3Qgc2xpZGVyRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmFzaGlvbi1zbGlkZXInKTtcbiAgICAgIC8qKlxyXG4gICAgICAgKiBJbml0IEZhc2hpb24gU2xpZGVyXHJcbiAgICAgICAqXHJcbiAgICAgICAqIGFyZ3VtZW50OiBwYXNzIC5mYXNoaW9uLXNsaWRlciBlbGVtZW50XHJcbiAgICAgICAqL1xuXG4gICAgICBjcmVhdGVGYXNoaW9uU2xpZGVyKHNsaWRlckVsKTsgLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICAgdmFyIGN2cEhhbmRsZXJzID0ge1xuICAgICAgICBjYW52YXNDbGlja0hhbmRsZXI6IG51bGwsXG4gICAgICAgIHZpZGVvVGltZVVwZGF0ZUhhbmRsZXI6IG51bGwsXG4gICAgICAgIHZpZGVvQ2FuUGxheUhhbmRsZXI6IG51bGwsXG4gICAgICAgIHdpbmRvd1Jlc2l6ZUhhbmRsZXI6IG51bGxcbiAgICAgIH07XG5cbiAgICAgIHZhciBDYW52YXNWaWRlb1BsYXllciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgZnJhbWVzUGVyU2Vjb25kOiAyNSxcbiAgICAgICAgICBoaWRlVmlkZW86IHRydWUsXG4gICAgICAgICAgYXV0b3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1ha2VMb29wOiBmYWxzZSxcbiAgICAgICAgICBwYXVzZU9uQ2xpY2s6IHRydWUsXG4gICAgICAgICAgYXVkaW86IGZhbHNlLFxuICAgICAgICAgIHRpbWVsaW5lU2VsZWN0b3I6IGZhbHNlLFxuICAgICAgICAgIHJlc2V0T25MYXN0RnJhbWU6IHRydWVcbiAgICAgICAgfTtcblxuICAgICAgICBmb3IgKGkgaW4gb3B0aW9ucykge1xuICAgICAgICAgIHRoaXMub3B0aW9uc1tpXSA9IG9wdGlvbnNbaV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnZpZGVvID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdGlvbnMudmlkZW9TZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdGlvbnMuY2FudmFzU2VsZWN0b3IpO1xuICAgICAgICB0aGlzLnRpbWVsaW5lID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdGlvbnMudGltZWxpbmVTZWxlY3Rvcik7XG4gICAgICAgIHRoaXMudGltZWxpbmVQYXNzZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0aW9ucy50aW1lbGluZVNlbGVjdG9yICsgJz4gZGl2Jyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudmlkZW9TZWxlY3RvciB8fCAhdGhpcy52aWRlbykge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIFwidmlkZW9TZWxlY3RvclwiIHByb3BlcnR5LCBvciB0aGUgZWxlbWVudCBpcyBub3QgZm91bmQnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5jYW52YXNTZWxlY3RvciB8fCAhdGhpcy5jYW52YXMpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBcImNhbnZhc1NlbGVjdG9yXCIgcHJvcGVydHksIG9yIHRoZSBlbGVtZW50IGlzIG5vdCBmb3VuZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMudGltZWxpbmVTZWxlY3RvciAmJiAhdGhpcy50aW1lbGluZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0VsZW1lbnQgZm9yIHRoZSBcInRpbWVsaW5lU2VsZWN0b3JcIiBzZWxlY3RvciBub3QgZm91bmQnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRpbWVsaW5lU2VsZWN0b3IgJiYgIXRoaXMudGltZWxpbmVQYXNzZWQpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFbGVtZW50IGZvciB0aGUgXCJ0aW1lbGluZVBhc3NlZFwiIG5vdCBmb3VuZCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXVkaW8pIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5hdWRpbyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIC8vIFVzZSBhdWRpbyBzZWxlY3RvciBmcm9tIG9wdGlvbnMgaWYgc3BlY2lmaWVkXG4gICAgICAgICAgICB0aGlzLmF1ZGlvID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuYXVkaW8pWzBdO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuYXVkaW8pIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRWxlbWVudCBmb3IgdGhlIFwiYXVkaW9cIiBub3QgZm91bmQnKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBDcmVhdGVzIGF1ZGlvIGVsZW1lbnQgd2hpY2ggdXNlcyBzYW1lIHZpZGVvIHNvdXJjZXNcbiAgICAgICAgICAgIHRoaXMuYXVkaW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdWRpbycpO1xuICAgICAgICAgICAgdGhpcy5hdWRpby5pbm5lckhUTUwgPSB0aGlzLnZpZGVvLmlubmVySFRNTDtcbiAgICAgICAgICAgIHRoaXMudmlkZW8ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5hdWRpbywgdGhpcy52aWRlbyk7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvLmxvYWQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgaU9TID0gL2lQYWR8aVBob25lfGlQb2QvLnRlc3QobmF2aWdhdG9yLnBsYXRmb3JtKTtcblxuICAgICAgICAgIGlmIChpT1MpIHtcbiAgICAgICAgICAgIC8vIEF1dG9wbGF5IGRvZXNuJ3Qgd29yayB3aXRoIGF1ZGlvIG9uIGlPU1xuICAgICAgICAgICAgLy8gVXNlciBoYXZlIHRvIG1hbnVhbGx5IHN0YXJ0IHRoZSBhdWRpb1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmF1dG9wbGF5ID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9IC8vIENhbnZhcyBjb250ZXh0XG5cblxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnJlc2l6ZVRpbWVvdXRSZWZlcmVuY2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5SRVNJWkVfVElNRU9VVCA9IDEwMDA7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICB0aGlzLmJpbmQoKTtcbiAgICAgIH07XG5cbiAgICAgIENhbnZhc1ZpZGVvUGxheWVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnZpZGVvLmxvYWQoKTtcbiAgICAgICAgdGhpcy5zZXRDYW52YXNTaXplKCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5oaWRlVmlkZW8pIHtcbiAgICAgICAgICB0aGlzLnZpZGVvLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIH1cbiAgICAgIH07IC8vIFVzZWQgbW9zdCBvZiB0aGUgalF1ZXJ5IGNvZGUgZm9yIHRoZSAub2Zmc2V0KCkgbWV0aG9kXG5cblxuICAgICAgQ2FudmFzVmlkZW9QbGF5ZXIucHJvdG90eXBlLmdldE9mZnNldCA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHZhciBkb2NFbGVtLCByZWN0LCBkb2M7XG5cbiAgICAgICAgaWYgKCFlbGVtKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7IC8vIE1ha2Ugc3VyZSBlbGVtZW50IGlzIG5vdCBoaWRkZW4gKGRpc3BsYXk6IG5vbmUpIG9yIGRpc2Nvbm5lY3RlZFxuXG4gICAgICAgIGlmIChyZWN0LndpZHRoIHx8IHJlY3QuaGVpZ2h0IHx8IGVsZW0uZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpIHtcbiAgICAgICAgICBkb2MgPSBlbGVtLm93bmVyRG9jdW1lbnQ7XG4gICAgICAgICAgZG9jRWxlbSA9IGRvYy5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSBkb2NFbGVtLmNsaWVudFRvcCxcbiAgICAgICAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCAtIGRvY0VsZW0uY2xpZW50TGVmdFxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIENhbnZhc1ZpZGVvUGxheWVyLnByb3RvdHlwZS5qdW1wVG8gPSBmdW5jdGlvbiAocGVyY2VudGFnZSkge1xuICAgICAgICB0aGlzLnZpZGVvLmN1cnJlbnRUaW1lID0gdGhpcy52aWRlby5kdXJhdGlvbiAqIHBlcmNlbnRhZ2U7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdWRpbykge1xuICAgICAgICAgIHRoaXMuYXVkaW8uY3VycmVudFRpbWUgPSB0aGlzLmF1ZGlvLmR1cmF0aW9uICogcGVyY2VudGFnZTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgQ2FudmFzVmlkZW9QbGF5ZXIucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpczsgLy8gUGxheWVzIG9yIHBhdXNlcyB2aWRlbyBvbiBjYW52YXMgY2xpY2tcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBhdXNlT25DbGljayA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY3ZwSGFuZGxlcnMuY2FudmFzQ2xpY2tIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5wbGF5UGF1c2UoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSAvLyBPbiBldmVyeSB0aW1lIHVwZGF0ZSBkcmF3cyBmcmFtZVxuXG5cbiAgICAgICAgdGhpcy52aWRlby5hZGRFdmVudExpc3RlbmVyKCd0aW1ldXBkYXRlJywgY3ZwSGFuZGxlcnMudmlkZW9UaW1lVXBkYXRlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLmRyYXdGcmFtZSgpO1xuXG4gICAgICAgICAgaWYgKHNlbGYub3B0aW9ucy50aW1lbGluZVNlbGVjdG9yKSB7XG4gICAgICAgICAgICBzZWxmLnVwZGF0ZVRpbWVsaW5lKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTsgLy8gRHJhd3MgZmlyc3QgZnJhbWVcblxuICAgICAgICB0aGlzLnZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBjdnBIYW5kbGVycy52aWRlb0NhblBsYXlIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNlbGYuZHJhd0ZyYW1lKCk7XG4gICAgICAgIH0pOyAvLyBUbyBiZSBzdXJlICdjYW5wbGF5JyBldmVudCB0aGF0IGlzbid0IGFscmVhZHkgZmlyZWRcblxuICAgICAgICBpZiAodGhpcy52aWRlby5yZWFkeVN0YXRlID49IDIpIHtcbiAgICAgICAgICBzZWxmLmRyYXdGcmFtZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYub3B0aW9ucy5hdXRvcGxheSkge1xuICAgICAgICAgIHNlbGYucGxheSgpO1xuICAgICAgICB9IC8vIENsaWNrIG9uIHRoZSB2aWRlbyBzZWVrIHZpZGVvXG5cblxuICAgICAgICBpZiAoc2VsZi5vcHRpb25zLnRpbWVsaW5lU2VsZWN0b3IpIHtcbiAgICAgICAgICB0aGlzLnRpbWVsaW5lLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSBlLmNsaWVudFggLSBzZWxmLmdldE9mZnNldChzZWxmLmNhbnZhcykubGVmdDtcbiAgICAgICAgICAgIHZhciBwZXJjZW50YWdlID0gb2Zmc2V0IC8gc2VsZi50aW1lbGluZS5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIHNlbGYuanVtcFRvKHBlcmNlbnRhZ2UpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IC8vIENhY2hlIGNhbnZhcyBzaXplIG9uIHJlc2l6ZSAoZG9pbmcgaXQgb25seSBvbmNlIGluIGEgc2Vjb25kKVxuXG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGN2cEhhbmRsZXJzLndpbmRvd1Jlc2l6ZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYucmVzaXplVGltZW91dFJlZmVyZW5jZSk7XG4gICAgICAgICAgc2VsZi5yZXNpemVUaW1lb3V0UmVmZXJlbmNlID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnNldENhbnZhc1NpemUoKTtcbiAgICAgICAgICAgIHNlbGYuZHJhd0ZyYW1lKCk7XG4gICAgICAgICAgfSwgc2VsZi5SRVNJWkVfVElNRU9VVCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMudW5iaW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXMuY2FudmFzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY3ZwSGFuZGxlcnMuY2FudmFzQ2xpY2tIYW5kbGVyKTtcbiAgICAgICAgICB0aGlzLnZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RpbWV1cGRhdGUnLCBjdnBIYW5kbGVycy52aWRlb1RpbWVVcGRhdGVIYW5kbGVyKTtcbiAgICAgICAgICB0aGlzLnZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXknLCBjdnBIYW5kbGVycy52aWRlb0NhblBsYXlIYW5kbGVyKTtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgY3ZwSGFuZGxlcnMud2luZG93UmVzaXplSGFuZGxlcik7XG5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1ZGlvKSB7XG4gICAgICAgICAgICB0aGlzLmF1ZGlvLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5hdWRpbyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgQ2FudmFzVmlkZW9QbGF5ZXIucHJvdG90eXBlLnVwZGF0ZVRpbWVsaW5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcGVyY2VudGFnZSA9ICh0aGlzLnZpZGVvLmN1cnJlbnRUaW1lICogMTAwIC8gdGhpcy52aWRlby5kdXJhdGlvbikudG9GaXhlZCgyKTtcbiAgICAgICAgdGhpcy50aW1lbGluZVBhc3NlZC5zdHlsZS53aWR0aCA9IHBlcmNlbnRhZ2UgKyAnJSc7XG4gICAgICB9O1xuXG4gICAgICBDYW52YXNWaWRlb1BsYXllci5wcm90b3R5cGUuc2V0Q2FudmFzU2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuY2FudmFzLmNsaWVudFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2FudmFzLmNsaWVudEhlaWdodDtcbiAgICAgICAgdGhpcy5jYW52YXMuc2V0QXR0cmlidXRlKCd3aWR0aCcsIHRoaXMud2lkdGgpO1xuICAgICAgICB0aGlzLmNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIHRoaXMuaGVpZ2h0KTtcbiAgICAgIH07XG5cbiAgICAgIENhbnZhc1ZpZGVvUGxheWVyLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxhc3RUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5sb29wKCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdWRpbykge1xuICAgICAgICAgIC8vIFJlc3luYyBhdWRpbyBhbmQgdmlkZW9cbiAgICAgICAgICB0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lID0gdGhpcy52aWRlby5jdXJyZW50VGltZTtcbiAgICAgICAgICB0aGlzLmF1ZGlvLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgQ2FudmFzVmlkZW9QbGF5ZXIucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmF1ZGlvKSB7XG4gICAgICAgICAgdGhpcy5hdWRpby5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBDYW52YXNWaWRlb1BsYXllci5wcm90b3R5cGUucGxheVBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wbGF5aW5nKSB7XG4gICAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBDYW52YXNWaWRlb1BsYXllci5wcm90b3R5cGUubG9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgdGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBlbGFwc2VkID0gKHRpbWUgLSB0aGlzLmxhc3RUaW1lKSAvIDEwMDA7IC8vIFJlbmRlclxuXG4gICAgICAgIGlmIChlbGFwc2VkID49IDEgLyB0aGlzLm9wdGlvbnMuZnJhbWVzUGVyU2Vjb25kKSB7XG4gICAgICAgICAgdGhpcy52aWRlby5jdXJyZW50VGltZSA9IHRoaXMudmlkZW8uY3VycmVudFRpbWUgKyBlbGFwc2VkO1xuICAgICAgICAgIHRoaXMubGFzdFRpbWUgPSB0aW1lOyAvLyBSZXN5bmMgYXVkaW8gYW5kIHZpZGVvIGlmIHRoZXkgZHJpZnQgbW9yZSB0aGFuIDMwMG1zIGFwYXJ0XG5cbiAgICAgICAgICBpZiAodGhpcy5hdWRpbyAmJiBNYXRoLmFicyh0aGlzLmF1ZGlvLmN1cnJlbnRUaW1lIC0gdGhpcy52aWRlby5jdXJyZW50VGltZSkgPiAuMykge1xuICAgICAgICAgICAgdGhpcy5hdWRpby5jdXJyZW50VGltZSA9IHRoaXMudmlkZW8uY3VycmVudFRpbWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IC8vIElmIHdlIGFyZSBhdCB0aGUgZW5kIG9mIHRoZSB2aWRlbyBzdG9wXG5cblxuICAgICAgICBpZiAodGhpcy52aWRlby5jdXJyZW50VGltZSA+PSB0aGlzLnZpZGVvLmR1cmF0aW9uKSB7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tYWtlTG9vcCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVzZXRPbkxhc3RGcmFtZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy52aWRlby5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGxheWluZykge1xuICAgICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5sb29wKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25GcmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIENhbnZhc1ZpZGVvUGxheWVyLnByb3RvdHlwZS5kcmF3RnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSh0aGlzLnZpZGVvLCAwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICB9OyAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5cbiAgICAgIGxldCBidXJnZXJCdG5zID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYnVyZ2VyXCIpXTtcbiAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIik7XG4gICAgICBsZXQgaHRtbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJodG1sXCIpO1xuXG4gICAgICBmb3IgKGNvbnN0IGJ1cmdlckJ0biBvZiBidXJnZXJCdG5zKSB7XG4gICAgICAgIGJ1cmdlckJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICBodG1sLmNsYXNzTGlzdC50b2dnbGUoXCJhY3RpdmVcIik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByaXNlLXNsaWRlcicpKSB7XG4gICAgICAgIG5ldyBTd2lwZXIoXCIucHJpc2Utc2xpZGVyXCIsIHtcbiAgICAgICAgICBtb2R1bGVzOiBbTmF2aWdhdGlvbiwgQXV0b3BsYXldLFxuICAgICAgICAgIHdhdGNoT3ZlcmZsb3c6IHRydWUsXG4gICAgICAgICAgc3BlZWQ6IDgwMCxcbiAgICAgICAgICBvYnNlcnZlcjogdHJ1ZSxcbiAgICAgICAgICBvYnNlcnZlUGFyZW50czogdHJ1ZSxcbiAgICAgICAgICBvYnNlcnZlU2xpZGVDaGlsZHJlbjogdHJ1ZSxcbiAgICAgICAgICBncmFiQ3Vyc29yOiB0cnVlLFxuICAgICAgICAgIG5hdmlnYXRpb246IHtcbiAgICAgICAgICAgIG5leHRFbDogXCIucGxhbnMtbmF2aWdhdGlvbiAuYnV0dG9uLW5leHRcIixcbiAgICAgICAgICAgIHByZXZFbDogXCIucGxhbnMtbmF2aWdhdGlvbiAuYnV0dG9uLXByZXZcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAgYXV0b3BsYXk6IHtcbiAgICAgICAgICAgIGRlbGF5OiAyNTAwLFxuICAgICAgICAgICAgZGlzYWJsZU9uSW50ZXJhY3Rpb246IGZhbHNlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b3BsYXkuc3RvcCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b3BsYXkuc3RhcnQoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9LFxuICAgICAgICAgIGJyZWFrcG9pbnRzOiB7XG4gICAgICAgICAgICAzMjA6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMS4zNSxcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAxNSxcbiAgICAgICAgICAgICAgY2VudGVyZWRTbGlkZXM6IHRydWUsXG4gICAgICAgICAgICAgIGxvb3A6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA2Mzk6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMSxcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAxNSxcbiAgICAgICAgICAgICAgY2VudGVyZWRTbGlkZXM6IHRydWUsXG4gICAgICAgICAgICAgIGxvb3A6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA3Njg6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAxNSxcbiAgICAgICAgICAgICAgY2VudGVyZWRTbGlkZXM6IGZhbHNlLFxuICAgICAgICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTAyNDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDMwLFxuICAgICAgICAgICAgICBjZW50ZXJlZFNsaWRlczogZmFsc2UsXG4gICAgICAgICAgICAgIGxvb3A6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTI4MDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDMwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXZpZXdzLXNsaWRlcicpKSB7XG4gICAgICAgIG5ldyBTd2lwZXIoXCIucmV2aWV3cy1zbGlkZXJcIiwge1xuICAgICAgICAgIG1vZHVsZXM6IFtOYXZpZ2F0aW9uLCBBdXRvcGxheV0sXG4gICAgICAgICAgd2F0Y2hPdmVyZmxvdzogdHJ1ZSxcbiAgICAgICAgICBzcGVlZDogODAwLFxuICAgICAgICAgIG9ic2VydmVyOiB0cnVlLFxuICAgICAgICAgIG9ic2VydmVQYXJlbnRzOiB0cnVlLFxuICAgICAgICAgIG9ic2VydmVTbGlkZUNoaWxkcmVuOiB0cnVlLFxuICAgICAgICAgIGdyYWJDdXJzb3I6IHRydWUsXG4gICAgICAgICAgbmF2aWdhdGlvbjoge1xuICAgICAgICAgICAgbmV4dEVsOiBcIi5yZXZpZXdzLW5hdmlnYXRpb24gLmJ1dHRvbi1uZXh0XCIsXG4gICAgICAgICAgICBwcmV2RWw6IFwiLnJldmlld3MtbmF2aWdhdGlvbiAuYnV0dG9uLXByZXZcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAgYXV0b3BsYXk6IHtcbiAgICAgICAgICAgIGRlbGF5OiAyNTAwLFxuICAgICAgICAgICAgZGlzYWJsZU9uSW50ZXJhY3Rpb246IGZhbHNlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjoge1xuICAgICAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b3BsYXkuc3RvcCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b3BsYXkuc3RhcnQoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9LFxuICAgICAgICAgIGJyZWFrcG9pbnRzOiB7XG4gICAgICAgICAgICAzMjA6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMS4zNSxcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAxNSxcbiAgICAgICAgICAgICAgY2VudGVyZWRTbGlkZXM6IHRydWUsXG4gICAgICAgICAgICAgIGxvb3A6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA2Mzk6IHtcbiAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMixcbiAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAxNSxcbiAgICAgICAgICAgICAgY2VudGVyZWRTbGlkZXM6IGZhbHNlLFxuICAgICAgICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTAyNDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDMwLFxuICAgICAgICAgICAgICBjZW50ZXJlZFNsaWRlczogZmFsc2UsXG4gICAgICAgICAgICAgIGxvb3A6IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMTI4MDoge1xuICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICBzcGFjZUJldHdlZW46IDYwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYWdlLXN3aXBlcicpKSB7XG4gICAgICAgIGxldCBwYWdlU3dpcGVyID0gbmV3IFN3aXBlcihcIi5wYWdlLXN3aXBlclwiLCB7XG4gICAgICAgICAgbW9kdWxlczogW1BhZ2luYXRpb24sIFNjcm9sbGJhciwgZnJlZU1vZGUsIE1vdXNld2hlZWxdLFxuICAgICAgICAgIHdyYXBwZXJDbGFzczogXCJwYWdlX193cmFwcGVyXCIsXG4gICAgICAgICAgc2xpZGVDbGFzczogXCJwYWdlX19zY3JlZW5cIixcbiAgICAgICAgICBkaXJlY3Rpb246ICd2ZXJ0aWNhbCcsXG4gICAgICAgICAgc2xpZGVzUGVyVmlldzogJ2F1dG8nLFxuICAgICAgICAgIG1vdXNld2hlZWw6IHtcbiAgICAgICAgICAgIHNlbnNpdGl2aXRpOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBpbml0OiBmYWxzZSxcbiAgICAgICAgICB3YXRjaE92ZXJmbG93OiB0cnVlLFxuICAgICAgICAgIHNwZWVkOiA4MDAsXG4gICAgICAgICAgb2JzZXJ2ZXI6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVBhcmVudHM6IHRydWUsXG4gICAgICAgICAgb2JzZXJ2ZVNsaWRlQ2hpbGRyZW46IHRydWUsXG4gICAgICAgICAgb246IHtcbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgc2V0U2Nyb2xsVHlwZSgpO1xuICAgICAgICAgICAgICBzY3JlZW5Db250ZW50UGFnZ2luZygpO1xuICAgICAgICAgICAgICBoaWRlVG9Ub3BCdG4oKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXNpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgc2V0U2Nyb2xsVHlwZSgpO1xuICAgICAgICAgICAgICBzY3JlZW5Db250ZW50UGFnZ2luZygpO1xuICAgICAgICAgICAgICBzZXRXaWR0aFBhZ2UoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhZnRlckluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaGlkZVRvVG9wQnRuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBzY3JvbGxiYXI6IHtcbiAgICAgICAgICAgIGVsOiAnLnBhZ2VfX3Njcm9sbCcsXG4gICAgICAgICAgICBkcmFnQ2xhc3M6ICdwYWdlX19kcmFnLXNjcm9sbCcsXG4gICAgICAgICAgICBkcmFnZ2FibGU6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBwYWdlU3dpcGVyLmluaXQoKTtcblxuICAgICAgICBmdW5jdGlvbiBzZXRTY3JvbGxUeXBlKCkge1xuICAgICAgICAgIGxldCB3cmFwcGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhZ2VfX3dyYXBwZXInKTtcbiAgICAgICAgICBsZXQgcGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21haW4ucGFnZScpO1xuXG4gICAgICAgICAgaWYgKHdyYXBwZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdfZnJlZScpKSB7XG4gICAgICAgICAgICB3cmFwcGVyLmNsYXNzTGlzdC5yZW1vdmUoJ19mcmVlJyk7XG4gICAgICAgICAgICBwYWdlLmNsYXNzTGlzdC5yZW1vdmUoJ19mcmVlJyk7XG4gICAgICAgICAgICBwYWdlU3dpcGVyLnBhcmFtcy5mcmVlTW9kZS5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBhZ2VTd2lwZXIuc2xpZGVzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgY29uc3QgcGFnZVNsaWRlID0gcGFnZVN3aXBlci5zbGlkZXNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgcGFnZVNsaWRlQ29udGVudCA9IHBhZ2VTbGlkZS5xdWVyeVNlbGVjdG9yKCcuc2NyZWVuX19jb250ZW50Jyk7XG5cbiAgICAgICAgICAgIGlmIChwYWdlU2xpZGVDb250ZW50KSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBhZ2VTbGlkZUNvbnRlbnRIZWlnaHQgPSBwYWdlU2xpZGVDb250ZW50Lm9mZnNldEhlaWdodDtcblxuICAgICAgICAgICAgICBpZiAocGFnZVNsaWRlQ29udGVudEhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICAgICAgICAgIHdyYXBwZXIuY2xhc3NMaXN0LmFkZCgnX2ZyZWUnKTtcbiAgICAgICAgICAgICAgICBwYWdlLmNsYXNzTGlzdC5hZGQoJ19mcmVlJyk7XG4gICAgICAgICAgICAgICAgcGFnZVN3aXBlci5wYXJhbXMuZnJlZU1vZGUuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoID4gMTkyMCkge1xuICAgICAgICAgICAgICB3cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ19mcmVlJyk7XG4gICAgICAgICAgICAgIHBhZ2UuY2xhc3NMaXN0LmFkZCgnX2ZyZWUnKTtcbiAgICAgICAgICAgICAgcGFnZVN3aXBlci5wYXJhbXMuZnJlZU1vZGUuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2V0V2lkdGhQYWdlKCkge1xuICAgICAgICAgIGxldCB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXG4gICAgICAgICAgaWYgKHdpbmRvd1dpZHRoIDw9IDEyODApIHtcbiAgICAgICAgICAgIHBhZ2VTd2lwZXIuZGVzdHJveSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWdlU3dpcGVyLmluaXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzY3JlZW5Db250ZW50UGFnZ2luZygpIHtcbiAgICAgICAgICBsZXQgd3JhcHBlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYWdlX193cmFwcGVyJyk7XG4gICAgICAgICAgbGV0IGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWRlcicpO1xuICAgICAgICAgIGxldCBzY3JlZW5Db250ZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zY3JlZW5fX2NvbnRlbnQnKTtcbiAgICAgICAgICBsZXQgaGVhZGVySGVpZ2h0ID0gaGVhZGVyLmNsaWVudEhlaWdodDtcblxuICAgICAgICAgIGZvciAoY29uc3Qgc2NyZWVuQ29udGVudCBvZiBzY3JlZW5Db250ZW50cykge1xuICAgICAgICAgICAgaWYgKCF3cmFwcGVyLmNsYXNzTGlzdC5jb250YWlucygnX2ZyZWUnKSkge1xuICAgICAgICAgICAgICBzY3JlZW5Db250ZW50LnN0eWxlLnBhZGRpbmdUb3AgPSBoZWFkZXJIZWlnaHQgKyAncHgnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2NyZWVuQ29udGVudC5zdHlsZS5wYWRkaW5nVG9wID0gJzBweCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRvVG9wUGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50by10b3AtcGFnZScpO1xuXG4gICAgICAgIGlmICh0b1RvcFBhZ2UpIHtcbiAgICAgICAgICB0b1RvcFBhZ2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgIHBhZ2VTd2lwZXIuc2xpZGVUbygwLCA4MDApO1xuXG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAxMjc5KSB7XG4gICAgICAgICAgICAgIGxldCBib2R5ID0gJ2JvZHknO1xuICAgICAgICAgICAgICBzY3JvbGxUb0Jsb2NrKGUsIGJvZHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2Nyb2xsVG9CbG9jayhlLCBpZCkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnLFxuICAgICAgICAgICAgYmxvY2s6ICdzdGFydCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhZ2VTd2lwZXIub24oJ3NsaWRlQ2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGhpZGVUb1RvcEJ0bigpO1xuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGUgPT4ge1xuICAgICAgICAgIGhpZGVUb1RvcEJ0bigpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBoaWRlVG9Ub3BCdG4oKSB7XG4gICAgICAgICAgbGV0IGFjdGl2ZUluZGV4U2xpZGUgPSBwYWdlU3dpcGVyLmFjdGl2ZUluZGV4O1xuXG4gICAgICAgICAgaWYgKGFjdGl2ZUluZGV4U2xpZGUgPT09IDApIHtcbiAgICAgICAgICAgIGxldCB0b1RvcFBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG8tdG9wLXBhZ2UnKTtcbiAgICAgICAgICAgIHRvVG9wUGFnZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b1RvcFBhZ2Uuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGlzSU9TID0gL2lQYWR8aVBob25lfGlQb2QvLnRlc3QobmF2aWdhdG9yLnBsYXRmb3JtKTtcbiAgICAgIGNvbnNvbGUubG9nKGlzSU9TKTtcblxuICAgICAgaWYgKGlzSU9TKSB7XG4gICAgICAgIGxldCB2aWRlb3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudmlkZW8nKTtcbiAgICAgICAgdmlkZW9zLmZvckVhY2goZSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJyMnICsgZS5nZXRBdHRyaWJ1dGUoJ2lkJykgKyAnIC52aWRlb19fdmlkZW8nKTtcbiAgICAgICAgICBuZXcgQ2FudmFzVmlkZW9QbGF5ZXIoe1xuICAgICAgICAgICAgdmlkZW9TZWxlY3RvcjogJyMnICsgZS5nZXRBdHRyaWJ1dGUoJ2lkJykgKyAnIC52aWRlb19fdmlkZW8nLFxuICAgICAgICAgICAgY2FudmFzU2VsZWN0b3I6ICcjJyArIGUuZ2V0QXR0cmlidXRlKCdpZCcpICsgJyAudmlkZW9fX2NhbnZhcycsXG4gICAgICAgICAgICB0aW1lbGluZVNlbGVjdG9yOiBmYWxzZSxcbiAgICAgICAgICAgIGF1dG9wbGF5OiB0cnVlLFxuICAgICAgICAgICAgbWFrZUxvb3A6IHRydWUsXG4gICAgICAgICAgICBwYXVzZU9uQ2xpY2s6IGZhbHNlLFxuICAgICAgICAgICAgYXVkaW86IGZhbHNlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVXNlIEhUTUw1IHZpZGVvXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy52aWRlb19fY2FudmFzJylbMF0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgIH1cbiAgICB9XG5cbn0pKTtcbiJdLCJmaWxlIjoibWFpbi5qcyJ9
