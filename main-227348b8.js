(function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var jsxRuntime = {exports: {}};

	var reactJsxRuntime_production_min = {};

	var react = {exports: {}};

	var react_production_min = {};

	/**
	 * @license React
	 * react.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var hasRequiredReact_production_min;

	function requireReact_production_min () {
		if (hasRequiredReact_production_min) return react_production_min;
		hasRequiredReact_production_min = 1;
	var l=Symbol.for("react.element"),n=Symbol.for("react.portal"),p=Symbol.for("react.fragment"),q=Symbol.for("react.strict_mode"),r=Symbol.for("react.profiler"),t=Symbol.for("react.provider"),u=Symbol.for("react.context"),v=Symbol.for("react.forward_ref"),w=Symbol.for("react.suspense"),x=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),z=Symbol.iterator;function A(a){if(null===a||"object"!==typeof a)return null;a=z&&a[z]||a["@@iterator"];return "function"===typeof a?a:null}
		var B={isMounted:function(){return !1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},C=Object.assign,D={};function E(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B;}E.prototype.isReactComponent={};
		E.prototype.setState=function(a,b){if("object"!==typeof a&&"function"!==typeof a&&null!=a)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,a,b,"setState");};E.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate");};function F(){}F.prototype=E.prototype;function G(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B;}var H=G.prototype=new F;
		H.constructor=G;C(H,E.prototype);H.isPureReactComponent=!0;var I=Array.isArray,J=Object.prototype.hasOwnProperty,K={current:null},L={key:!0,ref:!0,__self:!0,__source:!0};
		function M(a,b,e){var d,c={},k=null,h=null;if(null!=b)for(d in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(k=""+b.key),b)J.call(b,d)&&!L.hasOwnProperty(d)&&(c[d]=b[d]);var g=arguments.length-2;if(1===g)c.children=e;else if(1<g){for(var f=Array(g),m=0;m<g;m++)f[m]=arguments[m+2];c.children=f;}if(a&&a.defaultProps)for(d in g=a.defaultProps,g)void 0===c[d]&&(c[d]=g[d]);return {$$typeof:l,type:a,key:k,ref:h,props:c,_owner:K.current}}
		function N(a,b){return {$$typeof:l,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function O(a){return "object"===typeof a&&null!==a&&a.$$typeof===l}function escape(a){var b={"=":"=0",":":"=2"};return "$"+a.replace(/[=:]/g,function(a){return b[a]})}var P=/\/+/g;function Q(a,b){return "object"===typeof a&&null!==a&&null!=a.key?escape(""+a.key):b.toString(36)}
		function R(a,b,e,d,c){var k=typeof a;if("undefined"===k||"boolean"===k)a=null;var h=!1;if(null===a)h=!0;else switch(k){case "string":case "number":h=!0;break;case "object":switch(a.$$typeof){case l:case n:h=!0;}}if(h)return h=a,c=c(h),a=""===d?"."+Q(h,0):d,I(c)?(e="",null!=a&&(e=a.replace(P,"$&/")+"/"),R(c,b,e,"",function(a){return a})):null!=c&&(O(c)&&(c=N(c,e+(!c.key||h&&h.key===c.key?"":(""+c.key).replace(P,"$&/")+"/")+a)),b.push(c)),1;h=0;d=""===d?".":d+":";if(I(a))for(var g=0;g<a.length;g++){k=
		a[g];var f=d+Q(k,g);h+=R(k,b,e,f,c);}else if(f=A(a),"function"===typeof f)for(a=f.call(a),g=0;!(k=a.next()).done;)k=k.value,f=d+Q(k,g++),h+=R(k,b,e,f,c);else if("object"===k)throw b=String(a),Error("Objects are not valid as a React child (found: "+("[object Object]"===b?"object with keys {"+Object.keys(a).join(", ")+"}":b)+"). If you meant to render a collection of children, use an array instead.");return h}
		function S(a,b,e){if(null==a)return a;var d=[],c=0;R(a,d,"","",function(a){return b.call(e,a,c++)});return d}function T(a){if(-1===a._status){var b=a._result;b=b();b.then(function(b){if(0===a._status||-1===a._status)a._status=1,a._result=b;},function(b){if(0===a._status||-1===a._status)a._status=2,a._result=b;});-1===a._status&&(a._status=0,a._result=b);}if(1===a._status)return a._result.default;throw a._result;}
		var U={current:null},V={transition:null},W={ReactCurrentDispatcher:U,ReactCurrentBatchConfig:V,ReactCurrentOwner:K};react_production_min.Children={map:S,forEach:function(a,b,e){S(a,function(){b.apply(this,arguments);},e);},count:function(a){var b=0;S(a,function(){b++;});return b},toArray:function(a){return S(a,function(a){return a})||[]},only:function(a){if(!O(a))throw Error("React.Children.only expected to receive a single React element child.");return a}};react_production_min.Component=E;react_production_min.Fragment=p;
		react_production_min.Profiler=r;react_production_min.PureComponent=G;react_production_min.StrictMode=q;react_production_min.Suspense=w;react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W;
		react_production_min.cloneElement=function(a,b,e){if(null===a||void 0===a)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+a+".");var d=C({},a.props),c=a.key,k=a.ref,h=a._owner;if(null!=b){void 0!==b.ref&&(k=b.ref,h=K.current);void 0!==b.key&&(c=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(f in b)J.call(b,f)&&!L.hasOwnProperty(f)&&(d[f]=void 0===b[f]&&void 0!==g?g[f]:b[f]);}var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){g=Array(f);
		for(var m=0;m<f;m++)g[m]=arguments[m+2];d.children=g;}return {$$typeof:l,type:a.type,key:c,ref:k,props:d,_owner:h}};react_production_min.createContext=function(a){a={$$typeof:u,_currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null};a.Provider={$$typeof:t,_context:a};return a.Consumer=a};react_production_min.createElement=M;react_production_min.createFactory=function(a){var b=M.bind(null,a);b.type=a;return b};react_production_min.createRef=function(){return {current:null}};
		react_production_min.forwardRef=function(a){return {$$typeof:v,render:a}};react_production_min.isValidElement=O;react_production_min.lazy=function(a){return {$$typeof:y,_payload:{_status:-1,_result:a},_init:T}};react_production_min.memo=function(a,b){return {$$typeof:x,type:a,compare:void 0===b?null:b}};react_production_min.startTransition=function(a){var b=V.transition;V.transition={};try{a();}finally{V.transition=b;}};react_production_min.unstable_act=function(){throw Error("act(...) is not supported in production builds of React.");};
		react_production_min.useCallback=function(a,b){return U.current.useCallback(a,b)};react_production_min.useContext=function(a){return U.current.useContext(a)};react_production_min.useDebugValue=function(){};react_production_min.useDeferredValue=function(a){return U.current.useDeferredValue(a)};react_production_min.useEffect=function(a,b){return U.current.useEffect(a,b)};react_production_min.useId=function(){return U.current.useId()};react_production_min.useImperativeHandle=function(a,b,e){return U.current.useImperativeHandle(a,b,e)};
		react_production_min.useInsertionEffect=function(a,b){return U.current.useInsertionEffect(a,b)};react_production_min.useLayoutEffect=function(a,b){return U.current.useLayoutEffect(a,b)};react_production_min.useMemo=function(a,b){return U.current.useMemo(a,b)};react_production_min.useReducer=function(a,b,e){return U.current.useReducer(a,b,e)};react_production_min.useRef=function(a){return U.current.useRef(a)};react_production_min.useState=function(a){return U.current.useState(a)};react_production_min.useSyncExternalStore=function(a,b,e){return U.current.useSyncExternalStore(a,b,e)};
		react_production_min.useTransition=function(){return U.current.useTransition()};react_production_min.version="18.2.0";
		return react_production_min;
	}

	{
	  react.exports = requireReact_production_min();
	}

	var reactExports = react.exports;

	/**
	 * @license React
	 * react-jsx-runtime.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var hasRequiredReactJsxRuntime_production_min;

	function requireReactJsxRuntime_production_min () {
		if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
		hasRequiredReactJsxRuntime_production_min = 1;
	var f=reactExports,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:!0,ref:!0,__self:!0,__source:!0};
		function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a)void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
		return reactJsxRuntime_production_min;
	}

	{
	  jsxRuntime.exports = requireReactJsxRuntime_production_min();
	}

	var jsxRuntimeExports = jsxRuntime.exports;

	var client = {};

	var reactDom = {exports: {}};

	var reactDom_production_min = {};

	var scheduler = {exports: {}};

	var scheduler_production_min = {};

	/**
	 * @license React
	 * scheduler.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var hasRequiredScheduler_production_min;

	function requireScheduler_production_min () {
		if (hasRequiredScheduler_production_min) return scheduler_production_min;
		hasRequiredScheduler_production_min = 1;
		(function (exports) {
	function f(a,b){var c=a.length;a.push(b);a:for(;0<c;){var d=c-1>>>1,e=a[d];if(0<g(e,b))a[d]=b,a[c]=e,c=d;else break a}}function h(a){return 0===a.length?null:a[0]}function k(a){if(0===a.length)return null;var b=a[0],c=a.pop();if(c!==b){a[0]=c;a:for(var d=0,e=a.length,w=e>>>1;d<w;){var m=2*(d+1)-1,C=a[m],n=m+1,x=a[n];if(0>g(C,c))n<e&&0>g(x,C)?(a[d]=x,a[n]=c,d=n):(a[d]=C,a[m]=c,d=m);else if(n<e&&0>g(x,c))a[d]=x,a[n]=c,d=n;else break a}}return b}
			function g(a,b){var c=a.sortIndex-b.sortIndex;return 0!==c?c:a.id-b.id}if("object"===typeof performance&&"function"===typeof performance.now){var l=performance;exports.unstable_now=function(){return l.now()};}else {var p=Date,q=p.now();exports.unstable_now=function(){return p.now()-q};}var r=[],t=[],u=1,v=null,y=3,z=!1,A=!1,B=!1,D="function"===typeof setTimeout?setTimeout:null,E="function"===typeof clearTimeout?clearTimeout:null,F="undefined"!==typeof setImmediate?setImmediate:null;
			"undefined"!==typeof navigator&&void 0!==navigator.scheduling&&void 0!==navigator.scheduling.isInputPending&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function G(a){for(var b=h(t);null!==b;){if(null===b.callback)k(t);else if(b.startTime<=a)k(t),b.sortIndex=b.expirationTime,f(r,b);else break;b=h(t);}}function H(a){B=!1;G(a);if(!A)if(null!==h(r))A=!0,I(J);else {var b=h(t);null!==b&&K(H,b.startTime-a);}}
			function J(a,b){A=!1;B&&(B=!1,E(L),L=-1);z=!0;var c=y;try{G(b);for(v=h(r);null!==v&&(!(v.expirationTime>b)||a&&!M());){var d=v.callback;if("function"===typeof d){v.callback=null;y=v.priorityLevel;var e=d(v.expirationTime<=b);b=exports.unstable_now();"function"===typeof e?v.callback=e:v===h(r)&&k(r);G(b);}else k(r);v=h(r);}if(null!==v)var w=!0;else {var m=h(t);null!==m&&K(H,m.startTime-b);w=!1;}return w}finally{v=null,y=c,z=!1;}}var N=!1,O=null,L=-1,P=5,Q=-1;
			function M(){return exports.unstable_now()-Q<P?!1:!0}function R(){if(null!==O){var a=exports.unstable_now();Q=a;var b=!0;try{b=O(!0,a);}finally{b?S():(N=!1,O=null);}}else N=!1;}var S;if("function"===typeof F)S=function(){F(R);};else if("undefined"!==typeof MessageChannel){var T=new MessageChannel,U=T.port2;T.port1.onmessage=R;S=function(){U.postMessage(null);};}else S=function(){D(R,0);};function I(a){O=a;N||(N=!0,S());}function K(a,b){L=D(function(){a(exports.unstable_now());},b);}
			exports.unstable_IdlePriority=5;exports.unstable_ImmediatePriority=1;exports.unstable_LowPriority=4;exports.unstable_NormalPriority=3;exports.unstable_Profiling=null;exports.unstable_UserBlockingPriority=2;exports.unstable_cancelCallback=function(a){a.callback=null;};exports.unstable_continueExecution=function(){A||z||(A=!0,I(J));};
			exports.unstable_forceFrameRate=function(a){0>a||125<a?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):P=0<a?Math.floor(1E3/a):5;};exports.unstable_getCurrentPriorityLevel=function(){return y};exports.unstable_getFirstCallbackNode=function(){return h(r)};exports.unstable_next=function(a){switch(y){case 1:case 2:case 3:var b=3;break;default:b=y;}var c=y;y=b;try{return a()}finally{y=c;}};exports.unstable_pauseExecution=function(){};
			exports.unstable_requestPaint=function(){};exports.unstable_runWithPriority=function(a,b){switch(a){case 1:case 2:case 3:case 4:case 5:break;default:a=3;}var c=y;y=a;try{return b()}finally{y=c;}};
			exports.unstable_scheduleCallback=function(a,b,c){var d=exports.unstable_now();"object"===typeof c&&null!==c?(c=c.delay,c="number"===typeof c&&0<c?d+c:d):c=d;switch(a){case 1:var e=-1;break;case 2:e=250;break;case 5:e=1073741823;break;case 4:e=1E4;break;default:e=5E3;}e=c+e;a={id:u++,callback:b,priorityLevel:a,startTime:c,expirationTime:e,sortIndex:-1};c>d?(a.sortIndex=c,f(t,a),null===h(r)&&a===h(t)&&(B?(E(L),L=-1):B=!0,K(H,c-d))):(a.sortIndex=e,f(r,a),A||z||(A=!0,I(J)));return a};
			exports.unstable_shouldYield=M;exports.unstable_wrapCallback=function(a){var b=y;return function(){var c=y;y=b;try{return a.apply(this,arguments)}finally{y=c;}}}; 
		} (scheduler_production_min));
		return scheduler_production_min;
	}

	var hasRequiredScheduler;

	function requireScheduler () {
		if (hasRequiredScheduler) return scheduler.exports;
		hasRequiredScheduler = 1;

		{
		  scheduler.exports = requireScheduler_production_min();
		}
		return scheduler.exports;
	}

	/**
	 * @license React
	 * react-dom.production.min.js
	 *
	 * Copyright (c) Facebook, Inc. and its affiliates.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var hasRequiredReactDom_production_min;

	function requireReactDom_production_min () {
		if (hasRequiredReactDom_production_min) return reactDom_production_min;
		hasRequiredReactDom_production_min = 1;
	var aa=reactExports,ca=requireScheduler();function p(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return "Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var da=new Set,ea={};function fa(a,b){ha(a,b);ha(a+"Capture",b);}
		function ha(a,b){ea[a]=b;for(a=0;a<b.length;a++)da.add(b[a]);}
		var ia=!("undefined"===typeof window||"undefined"===typeof window.document||"undefined"===typeof window.document.createElement),ja=Object.prototype.hasOwnProperty,ka=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,la=
		{},ma={};function oa(a){if(ja.call(ma,a))return !0;if(ja.call(la,a))return !1;if(ka.test(a))return ma[a]=!0;la[a]=!0;return !1}function pa(a,b,c,d){if(null!==c&&0===c.type)return !1;switch(typeof b){case "function":case "symbol":return !0;case "boolean":if(d)return !1;if(null!==c)return !c.acceptsBooleans;a=a.toLowerCase().slice(0,5);return "data-"!==a&&"aria-"!==a;default:return !1}}
		function qa(a,b,c,d){if(null===b||"undefined"===typeof b||pa(a,b,c,d))return !0;if(d)return !1;if(null!==c)switch(c.type){case 3:return !b;case 4:return !1===b;case 5:return isNaN(b);case 6:return isNaN(b)||1>b}return !1}function v(a,b,c,d,e,f,g){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=e;this.mustUseProperty=c;this.propertyName=a;this.type=b;this.sanitizeURL=f;this.removeEmptyString=g;}var z={};
		"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a){z[a]=new v(a,0,!1,a,null,!1,!1);});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];z[b]=new v(b,1,!1,a[1],null,!1,!1);});["contentEditable","draggable","spellCheck","value"].forEach(function(a){z[a]=new v(a,2,!1,a.toLowerCase(),null,!1,!1);});
		["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(a){z[a]=new v(a,2,!1,a,null,!1,!1);});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){z[a]=new v(a,3,!1,a.toLowerCase(),null,!1,!1);});
		["checked","multiple","muted","selected"].forEach(function(a){z[a]=new v(a,3,!0,a,null,!1,!1);});["capture","download"].forEach(function(a){z[a]=new v(a,4,!1,a,null,!1,!1);});["cols","rows","size","span"].forEach(function(a){z[a]=new v(a,6,!1,a,null,!1,!1);});["rowSpan","start"].forEach(function(a){z[a]=new v(a,5,!1,a.toLowerCase(),null,!1,!1);});var ra=/[\-:]([a-z])/g;function sa(a){return a[1].toUpperCase()}
		"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=a.replace(ra,
		sa);z[b]=new v(b,1,!1,a,null,!1,!1);});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(ra,sa);z[b]=new v(b,1,!1,a,"http://www.w3.org/1999/xlink",!1,!1);});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(ra,sa);z[b]=new v(b,1,!1,a,"http://www.w3.org/XML/1998/namespace",!1,!1);});["tabIndex","crossOrigin"].forEach(function(a){z[a]=new v(a,1,!1,a.toLowerCase(),null,!1,!1);});
		z.xlinkHref=new v("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(a){z[a]=new v(a,1,!1,a.toLowerCase(),null,!0,!0);});
		function ta(a,b,c,d){var e=z.hasOwnProperty(b)?z[b]:null;if(null!==e?0!==e.type:d||!(2<b.length)||"o"!==b[0]&&"O"!==b[0]||"n"!==b[1]&&"N"!==b[1])qa(b,c,e,d)&&(c=null),d||null===e?oa(b)&&(null===c?a.removeAttribute(b):a.setAttribute(b,""+c)):e.mustUseProperty?a[e.propertyName]=null===c?3===e.type?!1:"":c:(b=e.attributeName,d=e.attributeNamespace,null===c?a.removeAttribute(b):(e=e.type,c=3===e||4===e&&!0===c?"":""+c,d?a.setAttributeNS(d,b,c):a.setAttribute(b,c)));}
		var ua=aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,va=Symbol.for("react.element"),wa=Symbol.for("react.portal"),ya=Symbol.for("react.fragment"),za=Symbol.for("react.strict_mode"),Aa=Symbol.for("react.profiler"),Ba=Symbol.for("react.provider"),Ca=Symbol.for("react.context"),Da=Symbol.for("react.forward_ref"),Ea=Symbol.for("react.suspense"),Fa=Symbol.for("react.suspense_list"),Ga=Symbol.for("react.memo"),Ha=Symbol.for("react.lazy");	var Ia=Symbol.for("react.offscreen");var Ja=Symbol.iterator;function Ka(a){if(null===a||"object"!==typeof a)return null;a=Ja&&a[Ja]||a["@@iterator"];return "function"===typeof a?a:null}var A=Object.assign,La;function Ma(a){if(void 0===La)try{throw Error();}catch(c){var b=c.stack.trim().match(/\n( *(at )?)/);La=b&&b[1]||"";}return "\n"+La+a}var Na=!1;
		function Oa(a,b){if(!a||Na)return "";Na=!0;var c=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(b)if(b=function(){throw Error();},Object.defineProperty(b.prototype,"props",{set:function(){throw Error();}}),"object"===typeof Reflect&&Reflect.construct){try{Reflect.construct(b,[]);}catch(l){var d=l;}Reflect.construct(a,[],b);}else {try{b.call();}catch(l){d=l;}a.call(b.prototype);}else {try{throw Error();}catch(l){d=l;}a();}}catch(l){if(l&&d&&"string"===typeof l.stack){for(var e=l.stack.split("\n"),
		f=d.stack.split("\n"),g=e.length-1,h=f.length-1;1<=g&&0<=h&&e[g]!==f[h];)h--;for(;1<=g&&0<=h;g--,h--)if(e[g]!==f[h]){if(1!==g||1!==h){do if(g--,h--,0>h||e[g]!==f[h]){var k="\n"+e[g].replace(" at new "," at ");a.displayName&&k.includes("<anonymous>")&&(k=k.replace("<anonymous>",a.displayName));return k}while(1<=g&&0<=h)}break}}}finally{Na=!1,Error.prepareStackTrace=c;}return (a=a?a.displayName||a.name:"")?Ma(a):""}
		function Pa(a){switch(a.tag){case 5:return Ma(a.type);case 16:return Ma("Lazy");case 13:return Ma("Suspense");case 19:return Ma("SuspenseList");case 0:case 2:case 15:return a=Oa(a.type,!1),a;case 11:return a=Oa(a.type.render,!1),a;case 1:return a=Oa(a.type,!0),a;default:return ""}}
		function Qa(a){if(null==a)return null;if("function"===typeof a)return a.displayName||a.name||null;if("string"===typeof a)return a;switch(a){case ya:return "Fragment";case wa:return "Portal";case Aa:return "Profiler";case za:return "StrictMode";case Ea:return "Suspense";case Fa:return "SuspenseList"}if("object"===typeof a)switch(a.$$typeof){case Ca:return (a.displayName||"Context")+".Consumer";case Ba:return (a._context.displayName||"Context")+".Provider";case Da:var b=a.render;a=a.displayName;a||(a=b.displayName||
		b.name||"",a=""!==a?"ForwardRef("+a+")":"ForwardRef");return a;case Ga:return b=a.displayName||null,null!==b?b:Qa(a.type)||"Memo";case Ha:b=a._payload;a=a._init;try{return Qa(a(b))}catch(c){}}return null}
		function Ra(a){var b=a.type;switch(a.tag){case 24:return "Cache";case 9:return (b.displayName||"Context")+".Consumer";case 10:return (b._context.displayName||"Context")+".Provider";case 18:return "DehydratedFragment";case 11:return a=b.render,a=a.displayName||a.name||"",b.displayName||(""!==a?"ForwardRef("+a+")":"ForwardRef");case 7:return "Fragment";case 5:return b;case 4:return "Portal";case 3:return "Root";case 6:return "Text";case 16:return Qa(b);case 8:return b===za?"StrictMode":"Mode";case 22:return "Offscreen";
		case 12:return "Profiler";case 21:return "Scope";case 13:return "Suspense";case 19:return "SuspenseList";case 25:return "TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if("function"===typeof b)return b.displayName||b.name||null;if("string"===typeof b)return b}return null}function Sa(a){switch(typeof a){case "boolean":case "number":case "string":case "undefined":return a;case "object":return a;default:return ""}}
		function Ta(a){var b=a.type;return (a=a.nodeName)&&"input"===a.toLowerCase()&&("checkbox"===b||"radio"===b)}
		function Ua(a){var b=Ta(a)?"checked":"value",c=Object.getOwnPropertyDescriptor(a.constructor.prototype,b),d=""+a[b];if(!a.hasOwnProperty(b)&&"undefined"!==typeof c&&"function"===typeof c.get&&"function"===typeof c.set){var e=c.get,f=c.set;Object.defineProperty(a,b,{configurable:!0,get:function(){return e.call(this)},set:function(a){d=""+a;f.call(this,a);}});Object.defineProperty(a,b,{enumerable:c.enumerable});return {getValue:function(){return d},setValue:function(a){d=""+a;},stopTracking:function(){a._valueTracker=
		null;delete a[b];}}}}function Va(a){a._valueTracker||(a._valueTracker=Ua(a));}function Wa(a){if(!a)return !1;var b=a._valueTracker;if(!b)return !0;var c=b.getValue();var d="";a&&(d=Ta(a)?a.checked?"true":"false":a.value);a=d;return a!==c?(b.setValue(a),!0):!1}function Xa(a){a=a||("undefined"!==typeof document?document:void 0);if("undefined"===typeof a)return null;try{return a.activeElement||a.body}catch(b){return a.body}}
		function Ya(a,b){var c=b.checked;return A({},b,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:null!=c?c:a._wrapperState.initialChecked})}function Za(a,b){var c=null==b.defaultValue?"":b.defaultValue,d=null!=b.checked?b.checked:b.defaultChecked;c=Sa(null!=b.value?b.value:c);a._wrapperState={initialChecked:d,initialValue:c,controlled:"checkbox"===b.type||"radio"===b.type?null!=b.checked:null!=b.value};}function ab(a,b){b=b.checked;null!=b&&ta(a,"checked",b,!1);}
		function bb(a,b){ab(a,b);var c=Sa(b.value),d=b.type;if(null!=c)if("number"===d){if(0===c&&""===a.value||a.value!=c)a.value=""+c;}else a.value!==""+c&&(a.value=""+c);else if("submit"===d||"reset"===d){a.removeAttribute("value");return}b.hasOwnProperty("value")?cb(a,b.type,c):b.hasOwnProperty("defaultValue")&&cb(a,b.type,Sa(b.defaultValue));null==b.checked&&null!=b.defaultChecked&&(a.defaultChecked=!!b.defaultChecked);}
		function db(a,b,c){if(b.hasOwnProperty("value")||b.hasOwnProperty("defaultValue")){var d=b.type;if(!("submit"!==d&&"reset"!==d||void 0!==b.value&&null!==b.value))return;b=""+a._wrapperState.initialValue;c||b===a.value||(a.value=b);a.defaultValue=b;}c=a.name;""!==c&&(a.name="");a.defaultChecked=!!a._wrapperState.initialChecked;""!==c&&(a.name=c);}
		function cb(a,b,c){if("number"!==b||Xa(a.ownerDocument)!==a)null==c?a.defaultValue=""+a._wrapperState.initialValue:a.defaultValue!==""+c&&(a.defaultValue=""+c);}var eb=Array.isArray;
		function fb(a,b,c,d){a=a.options;if(b){b={};for(var e=0;e<c.length;e++)b["$"+c[e]]=!0;for(c=0;c<a.length;c++)e=b.hasOwnProperty("$"+a[c].value),a[c].selected!==e&&(a[c].selected=e),e&&d&&(a[c].defaultSelected=!0);}else {c=""+Sa(c);b=null;for(e=0;e<a.length;e++){if(a[e].value===c){a[e].selected=!0;d&&(a[e].defaultSelected=!0);return}null!==b||a[e].disabled||(b=a[e]);}null!==b&&(b.selected=!0);}}
		function gb(a,b){if(null!=b.dangerouslySetInnerHTML)throw Error(p(91));return A({},b,{value:void 0,defaultValue:void 0,children:""+a._wrapperState.initialValue})}function hb(a,b){var c=b.value;if(null==c){c=b.children;b=b.defaultValue;if(null!=c){if(null!=b)throw Error(p(92));if(eb(c)){if(1<c.length)throw Error(p(93));c=c[0];}b=c;}null==b&&(b="");c=b;}a._wrapperState={initialValue:Sa(c)};}
		function ib(a,b){var c=Sa(b.value),d=Sa(b.defaultValue);null!=c&&(c=""+c,c!==a.value&&(a.value=c),null==b.defaultValue&&a.defaultValue!==c&&(a.defaultValue=c));null!=d&&(a.defaultValue=""+d);}function jb(a){var b=a.textContent;b===a._wrapperState.initialValue&&""!==b&&null!==b&&(a.value=b);}function kb(a){switch(a){case "svg":return "http://www.w3.org/2000/svg";case "math":return "http://www.w3.org/1998/Math/MathML";default:return "http://www.w3.org/1999/xhtml"}}
		function lb(a,b){return null==a||"http://www.w3.org/1999/xhtml"===a?kb(b):"http://www.w3.org/2000/svg"===a&&"foreignObject"===b?"http://www.w3.org/1999/xhtml":a}
		var mb,nb=function(a){return "undefined"!==typeof MSApp&&MSApp.execUnsafeLocalFunction?function(b,c,d,e){MSApp.execUnsafeLocalFunction(function(){return a(b,c,d,e)});}:a}(function(a,b){if("http://www.w3.org/2000/svg"!==a.namespaceURI||"innerHTML"in a)a.innerHTML=b;else {mb=mb||document.createElement("div");mb.innerHTML="<svg>"+b.valueOf().toString()+"</svg>";for(b=mb.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;b.firstChild;)a.appendChild(b.firstChild);}});
		function ob(a,b){if(b){var c=a.firstChild;if(c&&c===a.lastChild&&3===c.nodeType){c.nodeValue=b;return}}a.textContent=b;}
		var pb={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,
		zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},qb=["Webkit","ms","Moz","O"];Object.keys(pb).forEach(function(a){qb.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);pb[b]=pb[a];});});function rb(a,b,c){return null==b||"boolean"===typeof b||""===b?"":c||"number"!==typeof b||0===b||pb.hasOwnProperty(a)&&pb[a]?(""+b).trim():b+"px"}
		function sb(a,b){a=a.style;for(var c in b)if(b.hasOwnProperty(c)){var d=0===c.indexOf("--"),e=rb(c,b[c],d);"float"===c&&(c="cssFloat");d?a.setProperty(c,e):a[c]=e;}}var tb=A({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});
		function ub(a,b){if(b){if(tb[a]&&(null!=b.children||null!=b.dangerouslySetInnerHTML))throw Error(p(137,a));if(null!=b.dangerouslySetInnerHTML){if(null!=b.children)throw Error(p(60));if("object"!==typeof b.dangerouslySetInnerHTML||!("__html"in b.dangerouslySetInnerHTML))throw Error(p(61));}if(null!=b.style&&"object"!==typeof b.style)throw Error(p(62));}}
		function vb(a,b){if(-1===a.indexOf("-"))return "string"===typeof b.is;switch(a){case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":return !1;default:return !0}}var wb=null;function xb(a){a=a.target||a.srcElement||window;a.correspondingUseElement&&(a=a.correspondingUseElement);return 3===a.nodeType?a.parentNode:a}var yb=null,zb=null,Ab=null;
		function Bb(a){if(a=Cb(a)){if("function"!==typeof yb)throw Error(p(280));var b=a.stateNode;b&&(b=Db(b),yb(a.stateNode,a.type,b));}}function Eb(a){zb?Ab?Ab.push(a):Ab=[a]:zb=a;}function Fb(){if(zb){var a=zb,b=Ab;Ab=zb=null;Bb(a);if(b)for(a=0;a<b.length;a++)Bb(b[a]);}}function Gb(a,b){return a(b)}function Hb(){}var Ib=!1;function Jb(a,b,c){if(Ib)return a(b,c);Ib=!0;try{return Gb(a,b,c)}finally{if(Ib=!1,null!==zb||null!==Ab)Hb(),Fb();}}
		function Kb(a,b){var c=a.stateNode;if(null===c)return null;var d=Db(c);if(null===d)return null;c=d[b];a:switch(b){case "onClick":case "onClickCapture":case "onDoubleClick":case "onDoubleClickCapture":case "onMouseDown":case "onMouseDownCapture":case "onMouseMove":case "onMouseMoveCapture":case "onMouseUp":case "onMouseUpCapture":case "onMouseEnter":(d=!d.disabled)||(a=a.type,d=!("button"===a||"input"===a||"select"===a||"textarea"===a));a=!d;break a;default:a=!1;}if(a)return null;if(c&&"function"!==
		typeof c)throw Error(p(231,b,typeof c));return c}var Lb=!1;if(ia)try{var Mb={};Object.defineProperty(Mb,"passive",{get:function(){Lb=!0;}});window.addEventListener("test",Mb,Mb);window.removeEventListener("test",Mb,Mb);}catch(a){Lb=!1;}function Nb(a,b,c,d,e,f,g,h,k){var l=Array.prototype.slice.call(arguments,3);try{b.apply(c,l);}catch(m){this.onError(m);}}var Ob=!1,Pb=null,Qb=!1,Rb=null,Sb={onError:function(a){Ob=!0;Pb=a;}};function Tb(a,b,c,d,e,f,g,h,k){Ob=!1;Pb=null;Nb.apply(Sb,arguments);}
		function Ub(a,b,c,d,e,f,g,h,k){Tb.apply(this,arguments);if(Ob){if(Ob){var l=Pb;Ob=!1;Pb=null;}else throw Error(p(198));Qb||(Qb=!0,Rb=l);}}function Vb(a){var b=a,c=a;if(a.alternate)for(;b.return;)b=b.return;else {a=b;do b=a,0!==(b.flags&4098)&&(c=b.return),a=b.return;while(a)}return 3===b.tag?c:null}function Wb(a){if(13===a.tag){var b=a.memoizedState;null===b&&(a=a.alternate,null!==a&&(b=a.memoizedState));if(null!==b)return b.dehydrated}return null}function Xb(a){if(Vb(a)!==a)throw Error(p(188));}
		function Yb(a){var b=a.alternate;if(!b){b=Vb(a);if(null===b)throw Error(p(188));return b!==a?null:a}for(var c=a,d=b;;){var e=c.return;if(null===e)break;var f=e.alternate;if(null===f){d=e.return;if(null!==d){c=d;continue}break}if(e.child===f.child){for(f=e.child;f;){if(f===c)return Xb(e),a;if(f===d)return Xb(e),b;f=f.sibling;}throw Error(p(188));}if(c.return!==d.return)c=e,d=f;else {for(var g=!1,h=e.child;h;){if(h===c){g=!0;c=e;d=f;break}if(h===d){g=!0;d=e;c=f;break}h=h.sibling;}if(!g){for(h=f.child;h;){if(h===
		c){g=!0;c=f;d=e;break}if(h===d){g=!0;d=f;c=e;break}h=h.sibling;}if(!g)throw Error(p(189));}}if(c.alternate!==d)throw Error(p(190));}if(3!==c.tag)throw Error(p(188));return c.stateNode.current===c?a:b}function Zb(a){a=Yb(a);return null!==a?$b(a):null}function $b(a){if(5===a.tag||6===a.tag)return a;for(a=a.child;null!==a;){var b=$b(a);if(null!==b)return b;a=a.sibling;}return null}
		var ac=ca.unstable_scheduleCallback,bc=ca.unstable_cancelCallback,cc=ca.unstable_shouldYield,dc=ca.unstable_requestPaint,B=ca.unstable_now,ec=ca.unstable_getCurrentPriorityLevel,fc=ca.unstable_ImmediatePriority,gc=ca.unstable_UserBlockingPriority,hc=ca.unstable_NormalPriority,ic=ca.unstable_LowPriority,jc=ca.unstable_IdlePriority,kc=null,lc=null;function mc(a){if(lc&&"function"===typeof lc.onCommitFiberRoot)try{lc.onCommitFiberRoot(kc,a,void 0,128===(a.current.flags&128));}catch(b){}}
		var oc=Math.clz32?Math.clz32:nc,pc=Math.log,qc=Math.LN2;function nc(a){a>>>=0;return 0===a?32:31-(pc(a)/qc|0)|0}var rc=64,sc=4194304;
		function tc(a){switch(a&-a){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return a&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return a&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;
		default:return a}}function uc(a,b){var c=a.pendingLanes;if(0===c)return 0;var d=0,e=a.suspendedLanes,f=a.pingedLanes,g=c&268435455;if(0!==g){var h=g&~e;0!==h?d=tc(h):(f&=g,0!==f&&(d=tc(f)));}else g=c&~e,0!==g?d=tc(g):0!==f&&(d=tc(f));if(0===d)return 0;if(0!==b&&b!==d&&0===(b&e)&&(e=d&-d,f=b&-b,e>=f||16===e&&0!==(f&4194240)))return b;0!==(d&4)&&(d|=c&16);b=a.entangledLanes;if(0!==b)for(a=a.entanglements,b&=d;0<b;)c=31-oc(b),e=1<<c,d|=a[c],b&=~e;return d}
		function vc(a,b){switch(a){case 1:case 2:case 4:return b+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return b+5E3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return -1;case 134217728:case 268435456:case 536870912:case 1073741824:return -1;default:return -1}}
		function wc(a,b){for(var c=a.suspendedLanes,d=a.pingedLanes,e=a.expirationTimes,f=a.pendingLanes;0<f;){var g=31-oc(f),h=1<<g,k=e[g];if(-1===k){if(0===(h&c)||0!==(h&d))e[g]=vc(h,b);}else k<=b&&(a.expiredLanes|=h);f&=~h;}}function xc(a){a=a.pendingLanes&-1073741825;return 0!==a?a:a&1073741824?1073741824:0}function yc(){var a=rc;rc<<=1;0===(rc&4194240)&&(rc=64);return a}function zc(a){for(var b=[],c=0;31>c;c++)b.push(a);return b}
		function Ac(a,b,c){a.pendingLanes|=b;536870912!==b&&(a.suspendedLanes=0,a.pingedLanes=0);a=a.eventTimes;b=31-oc(b);a[b]=c;}function Bc(a,b){var c=a.pendingLanes&~b;a.pendingLanes=b;a.suspendedLanes=0;a.pingedLanes=0;a.expiredLanes&=b;a.mutableReadLanes&=b;a.entangledLanes&=b;b=a.entanglements;var d=a.eventTimes;for(a=a.expirationTimes;0<c;){var e=31-oc(c),f=1<<e;b[e]=0;d[e]=-1;a[e]=-1;c&=~f;}}
		function Cc(a,b){var c=a.entangledLanes|=b;for(a=a.entanglements;c;){var d=31-oc(c),e=1<<d;e&b|a[d]&b&&(a[d]|=b);c&=~e;}}var C=0;function Dc(a){a&=-a;return 1<a?4<a?0!==(a&268435455)?16:536870912:4:1}var Ec,Fc,Gc,Hc,Ic,Jc=!1,Kc=[],Lc=null,Mc=null,Nc=null,Oc=new Map,Pc=new Map,Qc=[],Rc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
		function Sc(a,b){switch(a){case "focusin":case "focusout":Lc=null;break;case "dragenter":case "dragleave":Mc=null;break;case "mouseover":case "mouseout":Nc=null;break;case "pointerover":case "pointerout":Oc.delete(b.pointerId);break;case "gotpointercapture":case "lostpointercapture":Pc.delete(b.pointerId);}}
		function Tc(a,b,c,d,e,f){if(null===a||a.nativeEvent!==f)return a={blockedOn:b,domEventName:c,eventSystemFlags:d,nativeEvent:f,targetContainers:[e]},null!==b&&(b=Cb(b),null!==b&&Fc(b)),a;a.eventSystemFlags|=d;b=a.targetContainers;null!==e&&-1===b.indexOf(e)&&b.push(e);return a}
		function Uc(a,b,c,d,e){switch(b){case "focusin":return Lc=Tc(Lc,a,b,c,d,e),!0;case "dragenter":return Mc=Tc(Mc,a,b,c,d,e),!0;case "mouseover":return Nc=Tc(Nc,a,b,c,d,e),!0;case "pointerover":var f=e.pointerId;Oc.set(f,Tc(Oc.get(f)||null,a,b,c,d,e));return !0;case "gotpointercapture":return f=e.pointerId,Pc.set(f,Tc(Pc.get(f)||null,a,b,c,d,e)),!0}return !1}
		function Vc(a){var b=Wc(a.target);if(null!==b){var c=Vb(b);if(null!==c)if(b=c.tag,13===b){if(b=Wb(c),null!==b){a.blockedOn=b;Ic(a.priority,function(){Gc(c);});return}}else if(3===b&&c.stateNode.current.memoizedState.isDehydrated){a.blockedOn=3===c.tag?c.stateNode.containerInfo:null;return}}a.blockedOn=null;}
		function Xc(a){if(null!==a.blockedOn)return !1;for(var b=a.targetContainers;0<b.length;){var c=Yc(a.domEventName,a.eventSystemFlags,b[0],a.nativeEvent);if(null===c){c=a.nativeEvent;var d=new c.constructor(c.type,c);wb=d;c.target.dispatchEvent(d);wb=null;}else return b=Cb(c),null!==b&&Fc(b),a.blockedOn=c,!1;b.shift();}return !0}function Zc(a,b,c){Xc(a)&&c.delete(b);}function $c(){Jc=!1;null!==Lc&&Xc(Lc)&&(Lc=null);null!==Mc&&Xc(Mc)&&(Mc=null);null!==Nc&&Xc(Nc)&&(Nc=null);Oc.forEach(Zc);Pc.forEach(Zc);}
		function ad(a,b){a.blockedOn===b&&(a.blockedOn=null,Jc||(Jc=!0,ca.unstable_scheduleCallback(ca.unstable_NormalPriority,$c)));}
		function bd(a){function b(b){return ad(b,a)}if(0<Kc.length){ad(Kc[0],a);for(var c=1;c<Kc.length;c++){var d=Kc[c];d.blockedOn===a&&(d.blockedOn=null);}}null!==Lc&&ad(Lc,a);null!==Mc&&ad(Mc,a);null!==Nc&&ad(Nc,a);Oc.forEach(b);Pc.forEach(b);for(c=0;c<Qc.length;c++)d=Qc[c],d.blockedOn===a&&(d.blockedOn=null);for(;0<Qc.length&&(c=Qc[0],null===c.blockedOn);)Vc(c),null===c.blockedOn&&Qc.shift();}var cd=ua.ReactCurrentBatchConfig,dd=!0;
		function ed(a,b,c,d){var e=C,f=cd.transition;cd.transition=null;try{C=1,fd(a,b,c,d);}finally{C=e,cd.transition=f;}}function gd(a,b,c,d){var e=C,f=cd.transition;cd.transition=null;try{C=4,fd(a,b,c,d);}finally{C=e,cd.transition=f;}}
		function fd(a,b,c,d){if(dd){var e=Yc(a,b,c,d);if(null===e)hd(a,b,d,id,c),Sc(a,d);else if(Uc(e,a,b,c,d))d.stopPropagation();else if(Sc(a,d),b&4&&-1<Rc.indexOf(a)){for(;null!==e;){var f=Cb(e);null!==f&&Ec(f);f=Yc(a,b,c,d);null===f&&hd(a,b,d,id,c);if(f===e)break;e=f;}null!==e&&d.stopPropagation();}else hd(a,b,d,null,c);}}var id=null;
		function Yc(a,b,c,d){id=null;a=xb(d);a=Wc(a);if(null!==a)if(b=Vb(a),null===b)a=null;else if(c=b.tag,13===c){a=Wb(b);if(null!==a)return a;a=null;}else if(3===c){if(b.stateNode.current.memoizedState.isDehydrated)return 3===b.tag?b.stateNode.containerInfo:null;a=null;}else b!==a&&(a=null);id=a;return null}
		function jd(a){switch(a){case "cancel":case "click":case "close":case "contextmenu":case "copy":case "cut":case "auxclick":case "dblclick":case "dragend":case "dragstart":case "drop":case "focusin":case "focusout":case "input":case "invalid":case "keydown":case "keypress":case "keyup":case "mousedown":case "mouseup":case "paste":case "pause":case "play":case "pointercancel":case "pointerdown":case "pointerup":case "ratechange":case "reset":case "resize":case "seeked":case "submit":case "touchcancel":case "touchend":case "touchstart":case "volumechange":case "change":case "selectionchange":case "textInput":case "compositionstart":case "compositionend":case "compositionupdate":case "beforeblur":case "afterblur":case "beforeinput":case "blur":case "fullscreenchange":case "focus":case "hashchange":case "popstate":case "select":case "selectstart":return 1;case "drag":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "mousemove":case "mouseout":case "mouseover":case "pointermove":case "pointerout":case "pointerover":case "scroll":case "toggle":case "touchmove":case "wheel":case "mouseenter":case "mouseleave":case "pointerenter":case "pointerleave":return 4;
		case "message":switch(ec()){case fc:return 1;case gc:return 4;case hc:case ic:return 16;case jc:return 536870912;default:return 16}default:return 16}}var kd=null,ld=null,md=null;function nd(){if(md)return md;var a,b=ld,c=b.length,d,e="value"in kd?kd.value:kd.textContent,f=e.length;for(a=0;a<c&&b[a]===e[a];a++);var g=c-a;for(d=1;d<=g&&b[c-d]===e[f-d];d++);return md=e.slice(a,1<d?1-d:void 0)}
		function od(a){var b=a.keyCode;"charCode"in a?(a=a.charCode,0===a&&13===b&&(a=13)):a=b;10===a&&(a=13);return 32<=a||13===a?a:0}function pd(){return !0}function qd(){return !1}
		function rd(a){function b(b,d,e,f,g){this._reactName=b;this._targetInst=e;this.type=d;this.nativeEvent=f;this.target=g;this.currentTarget=null;for(var c in a)a.hasOwnProperty(c)&&(b=a[c],this[c]=b?b(f):f[c]);this.isDefaultPrevented=(null!=f.defaultPrevented?f.defaultPrevented:!1===f.returnValue)?pd:qd;this.isPropagationStopped=qd;return this}A(b.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():"unknown"!==typeof a.returnValue&&
		(a.returnValue=!1),this.isDefaultPrevented=pd);},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():"unknown"!==typeof a.cancelBubble&&(a.cancelBubble=!0),this.isPropagationStopped=pd);},persist:function(){},isPersistent:pd});return b}
		var sd={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(a){return a.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},td=rd(sd),ud=A({},sd,{view:0,detail:0}),vd=rd(ud),wd,xd,yd,Ad=A({},ud,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:zd,button:0,buttons:0,relatedTarget:function(a){return void 0===a.relatedTarget?a.fromElement===a.srcElement?a.toElement:a.fromElement:a.relatedTarget},movementX:function(a){if("movementX"in
		a)return a.movementX;a!==yd&&(yd&&"mousemove"===a.type?(wd=a.screenX-yd.screenX,xd=a.screenY-yd.screenY):xd=wd=0,yd=a);return wd},movementY:function(a){return "movementY"in a?a.movementY:xd}}),Bd=rd(Ad),Cd=A({},Ad,{dataTransfer:0}),Dd=rd(Cd),Ed=A({},ud,{relatedTarget:0}),Fd=rd(Ed),Gd=A({},sd,{animationName:0,elapsedTime:0,pseudoElement:0}),Hd=rd(Gd),Id=A({},sd,{clipboardData:function(a){return "clipboardData"in a?a.clipboardData:window.clipboardData}}),Jd=rd(Id),Kd=A({},sd,{data:0}),Ld=rd(Kd),Md={Esc:"Escape",
		Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Nd={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",
		119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Od={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Pd(a){var b=this.nativeEvent;return b.getModifierState?b.getModifierState(a):(a=Od[a])?!!b[a]:!1}function zd(){return Pd}
		var Qd=A({},ud,{key:function(a){if(a.key){var b=Md[a.key]||a.key;if("Unidentified"!==b)return b}return "keypress"===a.type?(a=od(a),13===a?"Enter":String.fromCharCode(a)):"keydown"===a.type||"keyup"===a.type?Nd[a.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:zd,charCode:function(a){return "keypress"===a.type?od(a):0},keyCode:function(a){return "keydown"===a.type||"keyup"===a.type?a.keyCode:0},which:function(a){return "keypress"===
		a.type?od(a):"keydown"===a.type||"keyup"===a.type?a.keyCode:0}}),Rd=rd(Qd),Sd=A({},Ad,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Td=rd(Sd),Ud=A({},ud,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:zd}),Vd=rd(Ud),Wd=A({},sd,{propertyName:0,elapsedTime:0,pseudoElement:0}),Xd=rd(Wd),Yd=A({},Ad,{deltaX:function(a){return "deltaX"in a?a.deltaX:"wheelDeltaX"in a?-a.wheelDeltaX:0},
		deltaY:function(a){return "deltaY"in a?a.deltaY:"wheelDeltaY"in a?-a.wheelDeltaY:"wheelDelta"in a?-a.wheelDelta:0},deltaZ:0,deltaMode:0}),Zd=rd(Yd),$d=[9,13,27,32],ae=ia&&"CompositionEvent"in window,be=null;ia&&"documentMode"in document&&(be=document.documentMode);var ce=ia&&"TextEvent"in window&&!be,de=ia&&(!ae||be&&8<be&&11>=be),ee=String.fromCharCode(32),fe=!1;
		function ge(a,b){switch(a){case "keyup":return -1!==$d.indexOf(b.keyCode);case "keydown":return 229!==b.keyCode;case "keypress":case "mousedown":case "focusout":return !0;default:return !1}}function he(a){a=a.detail;return "object"===typeof a&&"data"in a?a.data:null}var ie=!1;function je(a,b){switch(a){case "compositionend":return he(b);case "keypress":if(32!==b.which)return null;fe=!0;return ee;case "textInput":return a=b.data,a===ee&&fe?null:a;default:return null}}
		function ke(a,b){if(ie)return "compositionend"===a||!ae&&ge(a,b)?(a=nd(),md=ld=kd=null,ie=!1,a):null;switch(a){case "paste":return null;case "keypress":if(!(b.ctrlKey||b.altKey||b.metaKey)||b.ctrlKey&&b.altKey){if(b.char&&1<b.char.length)return b.char;if(b.which)return String.fromCharCode(b.which)}return null;case "compositionend":return de&&"ko"!==b.locale?null:b.data;default:return null}}
		var le={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function me(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return "input"===b?!!le[a.type]:"textarea"===b?!0:!1}function ne(a,b,c,d){Eb(d);b=oe(b,"onChange");0<b.length&&(c=new td("onChange","change",null,c,d),a.push({event:c,listeners:b}));}var pe=null,qe=null;function re(a){se(a,0);}function te(a){var b=ue(a);if(Wa(b))return a}
		function ve(a,b){if("change"===a)return b}var we=!1;if(ia){var xe;if(ia){var ye="oninput"in document;if(!ye){var ze=document.createElement("div");ze.setAttribute("oninput","return;");ye="function"===typeof ze.oninput;}xe=ye;}else xe=!1;we=xe&&(!document.documentMode||9<document.documentMode);}function Ae(){pe&&(pe.detachEvent("onpropertychange",Be),qe=pe=null);}function Be(a){if("value"===a.propertyName&&te(qe)){var b=[];ne(b,qe,a,xb(a));Jb(re,b);}}
		function Ce(a,b,c){"focusin"===a?(Ae(),pe=b,qe=c,pe.attachEvent("onpropertychange",Be)):"focusout"===a&&Ae();}function De(a){if("selectionchange"===a||"keyup"===a||"keydown"===a)return te(qe)}function Ee(a,b){if("click"===a)return te(b)}function Fe(a,b){if("input"===a||"change"===a)return te(b)}function Ge(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var He="function"===typeof Object.is?Object.is:Ge;
		function Ie(a,b){if(He(a,b))return !0;if("object"!==typeof a||null===a||"object"!==typeof b||null===b)return !1;var c=Object.keys(a),d=Object.keys(b);if(c.length!==d.length)return !1;for(d=0;d<c.length;d++){var e=c[d];if(!ja.call(b,e)||!He(a[e],b[e]))return !1}return !0}function Je(a){for(;a&&a.firstChild;)a=a.firstChild;return a}
		function Ke(a,b){var c=Je(a);a=0;for(var d;c;){if(3===c.nodeType){d=a+c.textContent.length;if(a<=b&&d>=b)return {node:c,offset:b-a};a=d;}a:{for(;c;){if(c.nextSibling){c=c.nextSibling;break a}c=c.parentNode;}c=void 0;}c=Je(c);}}function Le(a,b){return a&&b?a===b?!0:a&&3===a.nodeType?!1:b&&3===b.nodeType?Le(a,b.parentNode):"contains"in a?a.contains(b):a.compareDocumentPosition?!!(a.compareDocumentPosition(b)&16):!1:!1}
		function Me(){for(var a=window,b=Xa();b instanceof a.HTMLIFrameElement;){try{var c="string"===typeof b.contentWindow.location.href;}catch(d){c=!1;}if(c)a=b.contentWindow;else break;b=Xa(a.document);}return b}function Ne(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return b&&("input"===b&&("text"===a.type||"search"===a.type||"tel"===a.type||"url"===a.type||"password"===a.type)||"textarea"===b||"true"===a.contentEditable)}
		function Oe(a){var b=Me(),c=a.focusedElem,d=a.selectionRange;if(b!==c&&c&&c.ownerDocument&&Le(c.ownerDocument.documentElement,c)){if(null!==d&&Ne(c))if(b=d.start,a=d.end,void 0===a&&(a=b),"selectionStart"in c)c.selectionStart=b,c.selectionEnd=Math.min(a,c.value.length);else if(a=(b=c.ownerDocument||document)&&b.defaultView||window,a.getSelection){a=a.getSelection();var e=c.textContent.length,f=Math.min(d.start,e);d=void 0===d.end?f:Math.min(d.end,e);!a.extend&&f>d&&(e=d,d=f,f=e);e=Ke(c,f);var g=Ke(c,
		d);e&&g&&(1!==a.rangeCount||a.anchorNode!==e.node||a.anchorOffset!==e.offset||a.focusNode!==g.node||a.focusOffset!==g.offset)&&(b=b.createRange(),b.setStart(e.node,e.offset),a.removeAllRanges(),f>d?(a.addRange(b),a.extend(g.node,g.offset)):(b.setEnd(g.node,g.offset),a.addRange(b)));}b=[];for(a=c;a=a.parentNode;)1===a.nodeType&&b.push({element:a,left:a.scrollLeft,top:a.scrollTop});"function"===typeof c.focus&&c.focus();for(c=0;c<b.length;c++)a=b[c],a.element.scrollLeft=a.left,a.element.scrollTop=a.top;}}
		var Pe=ia&&"documentMode"in document&&11>=document.documentMode,Qe=null,Re=null,Se=null,Te=!1;
		function Ue(a,b,c){var d=c.window===c?c.document:9===c.nodeType?c:c.ownerDocument;Te||null==Qe||Qe!==Xa(d)||(d=Qe,"selectionStart"in d&&Ne(d)?d={start:d.selectionStart,end:d.selectionEnd}:(d=(d.ownerDocument&&d.ownerDocument.defaultView||window).getSelection(),d={anchorNode:d.anchorNode,anchorOffset:d.anchorOffset,focusNode:d.focusNode,focusOffset:d.focusOffset}),Se&&Ie(Se,d)||(Se=d,d=oe(Re,"onSelect"),0<d.length&&(b=new td("onSelect","select",null,b,c),a.push({event:b,listeners:d}),b.target=Qe)));}
		function Ve(a,b){var c={};c[a.toLowerCase()]=b.toLowerCase();c["Webkit"+a]="webkit"+b;c["Moz"+a]="moz"+b;return c}var We={animationend:Ve("Animation","AnimationEnd"),animationiteration:Ve("Animation","AnimationIteration"),animationstart:Ve("Animation","AnimationStart"),transitionend:Ve("Transition","TransitionEnd")},Xe={},Ye={};
		ia&&(Ye=document.createElement("div").style,"AnimationEvent"in window||(delete We.animationend.animation,delete We.animationiteration.animation,delete We.animationstart.animation),"TransitionEvent"in window||delete We.transitionend.transition);function Ze(a){if(Xe[a])return Xe[a];if(!We[a])return a;var b=We[a],c;for(c in b)if(b.hasOwnProperty(c)&&c in Ye)return Xe[a]=b[c];return a}var $e=Ze("animationend"),af=Ze("animationiteration"),bf=Ze("animationstart"),cf=Ze("transitionend"),df=new Map,ef="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
		function ff(a,b){df.set(a,b);fa(b,[a]);}for(var gf=0;gf<ef.length;gf++){var hf=ef[gf],jf=hf.toLowerCase(),kf=hf[0].toUpperCase()+hf.slice(1);ff(jf,"on"+kf);}ff($e,"onAnimationEnd");ff(af,"onAnimationIteration");ff(bf,"onAnimationStart");ff("dblclick","onDoubleClick");ff("focusin","onFocus");ff("focusout","onBlur");ff(cf,"onTransitionEnd");ha("onMouseEnter",["mouseout","mouseover"]);ha("onMouseLeave",["mouseout","mouseover"]);ha("onPointerEnter",["pointerout","pointerover"]);
		ha("onPointerLeave",["pointerout","pointerover"]);fa("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));fa("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));fa("onBeforeInput",["compositionend","keypress","textInput","paste"]);fa("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));fa("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));
		fa("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var lf="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),mf=new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
		function nf(a,b,c){var d=a.type||"unknown-event";a.currentTarget=c;Ub(d,b,void 0,a);a.currentTarget=null;}
		function se(a,b){b=0!==(b&4);for(var c=0;c<a.length;c++){var d=a[c],e=d.event;d=d.listeners;a:{var f=void 0;if(b)for(var g=d.length-1;0<=g;g--){var h=d[g],k=h.instance,l=h.currentTarget;h=h.listener;if(k!==f&&e.isPropagationStopped())break a;nf(e,h,l);f=k;}else for(g=0;g<d.length;g++){h=d[g];k=h.instance;l=h.currentTarget;h=h.listener;if(k!==f&&e.isPropagationStopped())break a;nf(e,h,l);f=k;}}}if(Qb)throw a=Rb,Qb=!1,Rb=null,a;}
		function D(a,b){var c=b[of];void 0===c&&(c=b[of]=new Set);var d=a+"__bubble";c.has(d)||(pf(b,a,2,!1),c.add(d));}function qf(a,b,c){var d=0;b&&(d|=4);pf(c,a,d,b);}var rf="_reactListening"+Math.random().toString(36).slice(2);function sf(a){if(!a[rf]){a[rf]=!0;da.forEach(function(b){"selectionchange"!==b&&(mf.has(b)||qf(b,!1,a),qf(b,!0,a));});var b=9===a.nodeType?a:a.ownerDocument;null===b||b[rf]||(b[rf]=!0,qf("selectionchange",!1,b));}}
		function pf(a,b,c,d){switch(jd(b)){case 1:var e=ed;break;case 4:e=gd;break;default:e=fd;}c=e.bind(null,b,c,a);e=void 0;!Lb||"touchstart"!==b&&"touchmove"!==b&&"wheel"!==b||(e=!0);d?void 0!==e?a.addEventListener(b,c,{capture:!0,passive:e}):a.addEventListener(b,c,!0):void 0!==e?a.addEventListener(b,c,{passive:e}):a.addEventListener(b,c,!1);}
		function hd(a,b,c,d,e){var f=d;if(0===(b&1)&&0===(b&2)&&null!==d)a:for(;;){if(null===d)return;var g=d.tag;if(3===g||4===g){var h=d.stateNode.containerInfo;if(h===e||8===h.nodeType&&h.parentNode===e)break;if(4===g)for(g=d.return;null!==g;){var k=g.tag;if(3===k||4===k)if(k=g.stateNode.containerInfo,k===e||8===k.nodeType&&k.parentNode===e)return;g=g.return;}for(;null!==h;){g=Wc(h);if(null===g)return;k=g.tag;if(5===k||6===k){d=f=g;continue a}h=h.parentNode;}}d=d.return;}Jb(function(){var d=f,e=xb(c),g=[];
		a:{var h=df.get(a);if(void 0!==h){var k=td,n=a;switch(a){case "keypress":if(0===od(c))break a;case "keydown":case "keyup":k=Rd;break;case "focusin":n="focus";k=Fd;break;case "focusout":n="blur";k=Fd;break;case "beforeblur":case "afterblur":k=Fd;break;case "click":if(2===c.button)break a;case "auxclick":case "dblclick":case "mousedown":case "mousemove":case "mouseup":case "mouseout":case "mouseover":case "contextmenu":k=Bd;break;case "drag":case "dragend":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "dragstart":case "drop":k=
		Dd;break;case "touchcancel":case "touchend":case "touchmove":case "touchstart":k=Vd;break;case $e:case af:case bf:k=Hd;break;case cf:k=Xd;break;case "scroll":k=vd;break;case "wheel":k=Zd;break;case "copy":case "cut":case "paste":k=Jd;break;case "gotpointercapture":case "lostpointercapture":case "pointercancel":case "pointerdown":case "pointermove":case "pointerout":case "pointerover":case "pointerup":k=Td;}var t=0!==(b&4),J=!t&&"scroll"===a,x=t?null!==h?h+"Capture":null:h;t=[];for(var w=d,u;null!==
		w;){u=w;var F=u.stateNode;5===u.tag&&null!==F&&(u=F,null!==x&&(F=Kb(w,x),null!=F&&t.push(tf(w,F,u))));if(J)break;w=w.return;}0<t.length&&(h=new k(h,n,null,c,e),g.push({event:h,listeners:t}));}}if(0===(b&7)){a:{h="mouseover"===a||"pointerover"===a;k="mouseout"===a||"pointerout"===a;if(h&&c!==wb&&(n=c.relatedTarget||c.fromElement)&&(Wc(n)||n[uf]))break a;if(k||h){h=e.window===e?e:(h=e.ownerDocument)?h.defaultView||h.parentWindow:window;if(k){if(n=c.relatedTarget||c.toElement,k=d,n=n?Wc(n):null,null!==
		n&&(J=Vb(n),n!==J||5!==n.tag&&6!==n.tag))n=null;}else k=null,n=d;if(k!==n){t=Bd;F="onMouseLeave";x="onMouseEnter";w="mouse";if("pointerout"===a||"pointerover"===a)t=Td,F="onPointerLeave",x="onPointerEnter",w="pointer";J=null==k?h:ue(k);u=null==n?h:ue(n);h=new t(F,w+"leave",k,c,e);h.target=J;h.relatedTarget=u;F=null;Wc(e)===d&&(t=new t(x,w+"enter",n,c,e),t.target=u,t.relatedTarget=J,F=t);J=F;if(k&&n)b:{t=k;x=n;w=0;for(u=t;u;u=vf(u))w++;u=0;for(F=x;F;F=vf(F))u++;for(;0<w-u;)t=vf(t),w--;for(;0<u-w;)x=
		vf(x),u--;for(;w--;){if(t===x||null!==x&&t===x.alternate)break b;t=vf(t);x=vf(x);}t=null;}else t=null;null!==k&&wf(g,h,k,t,!1);null!==n&&null!==J&&wf(g,J,n,t,!0);}}}a:{h=d?ue(d):window;k=h.nodeName&&h.nodeName.toLowerCase();if("select"===k||"input"===k&&"file"===h.type)var na=ve;else if(me(h))if(we)na=Fe;else {na=De;var xa=Ce;}else (k=h.nodeName)&&"input"===k.toLowerCase()&&("checkbox"===h.type||"radio"===h.type)&&(na=Ee);if(na&&(na=na(a,d))){ne(g,na,c,e);break a}xa&&xa(a,h,d);"focusout"===a&&(xa=h._wrapperState)&&
		xa.controlled&&"number"===h.type&&cb(h,"number",h.value);}xa=d?ue(d):window;switch(a){case "focusin":if(me(xa)||"true"===xa.contentEditable)Qe=xa,Re=d,Se=null;break;case "focusout":Se=Re=Qe=null;break;case "mousedown":Te=!0;break;case "contextmenu":case "mouseup":case "dragend":Te=!1;Ue(g,c,e);break;case "selectionchange":if(Pe)break;case "keydown":case "keyup":Ue(g,c,e);}var $a;if(ae)b:{switch(a){case "compositionstart":var ba="onCompositionStart";break b;case "compositionend":ba="onCompositionEnd";
		break b;case "compositionupdate":ba="onCompositionUpdate";break b}ba=void 0;}else ie?ge(a,c)&&(ba="onCompositionEnd"):"keydown"===a&&229===c.keyCode&&(ba="onCompositionStart");ba&&(de&&"ko"!==c.locale&&(ie||"onCompositionStart"!==ba?"onCompositionEnd"===ba&&ie&&($a=nd()):(kd=e,ld="value"in kd?kd.value:kd.textContent,ie=!0)),xa=oe(d,ba),0<xa.length&&(ba=new Ld(ba,a,null,c,e),g.push({event:ba,listeners:xa}),$a?ba.data=$a:($a=he(c),null!==$a&&(ba.data=$a))));if($a=ce?je(a,c):ke(a,c))d=oe(d,"onBeforeInput"),
		0<d.length&&(e=new Ld("onBeforeInput","beforeinput",null,c,e),g.push({event:e,listeners:d}),e.data=$a);}se(g,b);});}function tf(a,b,c){return {instance:a,listener:b,currentTarget:c}}function oe(a,b){for(var c=b+"Capture",d=[];null!==a;){var e=a,f=e.stateNode;5===e.tag&&null!==f&&(e=f,f=Kb(a,c),null!=f&&d.unshift(tf(a,f,e)),f=Kb(a,b),null!=f&&d.push(tf(a,f,e)));a=a.return;}return d}function vf(a){if(null===a)return null;do a=a.return;while(a&&5!==a.tag);return a?a:null}
		function wf(a,b,c,d,e){for(var f=b._reactName,g=[];null!==c&&c!==d;){var h=c,k=h.alternate,l=h.stateNode;if(null!==k&&k===d)break;5===h.tag&&null!==l&&(h=l,e?(k=Kb(c,f),null!=k&&g.unshift(tf(c,k,h))):e||(k=Kb(c,f),null!=k&&g.push(tf(c,k,h))));c=c.return;}0!==g.length&&a.push({event:b,listeners:g});}var xf=/\r\n?/g,yf=/\u0000|\uFFFD/g;function zf(a){return ("string"===typeof a?a:""+a).replace(xf,"\n").replace(yf,"")}function Af(a,b,c){b=zf(b);if(zf(a)!==b&&c)throw Error(p(425));}function Bf(){}
		var Cf=null,Df=null;function Ef(a,b){return "textarea"===a||"noscript"===a||"string"===typeof b.children||"number"===typeof b.children||"object"===typeof b.dangerouslySetInnerHTML&&null!==b.dangerouslySetInnerHTML&&null!=b.dangerouslySetInnerHTML.__html}
		var Ff="function"===typeof setTimeout?setTimeout:void 0,Gf="function"===typeof clearTimeout?clearTimeout:void 0,Hf="function"===typeof Promise?Promise:void 0,Jf="function"===typeof queueMicrotask?queueMicrotask:"undefined"!==typeof Hf?function(a){return Hf.resolve(null).then(a).catch(If)}:Ff;function If(a){setTimeout(function(){throw a;});}
		function Kf(a,b){var c=b,d=0;do{var e=c.nextSibling;a.removeChild(c);if(e&&8===e.nodeType)if(c=e.data,"/$"===c){if(0===d){a.removeChild(e);bd(b);return}d--;}else "$"!==c&&"$?"!==c&&"$!"!==c||d++;c=e;}while(c);bd(b);}function Lf(a){for(;null!=a;a=a.nextSibling){var b=a.nodeType;if(1===b||3===b)break;if(8===b){b=a.data;if("$"===b||"$!"===b||"$?"===b)break;if("/$"===b)return null}}return a}
		function Mf(a){a=a.previousSibling;for(var b=0;a;){if(8===a.nodeType){var c=a.data;if("$"===c||"$!"===c||"$?"===c){if(0===b)return a;b--;}else "/$"===c&&b++;}a=a.previousSibling;}return null}var Nf=Math.random().toString(36).slice(2),Of="__reactFiber$"+Nf,Pf="__reactProps$"+Nf,uf="__reactContainer$"+Nf,of="__reactEvents$"+Nf,Qf="__reactListeners$"+Nf,Rf="__reactHandles$"+Nf;
		function Wc(a){var b=a[Of];if(b)return b;for(var c=a.parentNode;c;){if(b=c[uf]||c[Of]){c=b.alternate;if(null!==b.child||null!==c&&null!==c.child)for(a=Mf(a);null!==a;){if(c=a[Of])return c;a=Mf(a);}return b}a=c;c=a.parentNode;}return null}function Cb(a){a=a[Of]||a[uf];return !a||5!==a.tag&&6!==a.tag&&13!==a.tag&&3!==a.tag?null:a}function ue(a){if(5===a.tag||6===a.tag)return a.stateNode;throw Error(p(33));}function Db(a){return a[Pf]||null}var Sf=[],Tf=-1;function Uf(a){return {current:a}}
		function E(a){0>Tf||(a.current=Sf[Tf],Sf[Tf]=null,Tf--);}function G(a,b){Tf++;Sf[Tf]=a.current;a.current=b;}var Vf={},H=Uf(Vf),Wf=Uf(!1),Xf=Vf;function Yf(a,b){var c=a.type.contextTypes;if(!c)return Vf;var d=a.stateNode;if(d&&d.__reactInternalMemoizedUnmaskedChildContext===b)return d.__reactInternalMemoizedMaskedChildContext;var e={},f;for(f in c)e[f]=b[f];d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=b,a.__reactInternalMemoizedMaskedChildContext=e);return e}
		function Zf(a){a=a.childContextTypes;return null!==a&&void 0!==a}function $f(){E(Wf);E(H);}function ag(a,b,c){if(H.current!==Vf)throw Error(p(168));G(H,b);G(Wf,c);}function bg(a,b,c){var d=a.stateNode;b=b.childContextTypes;if("function"!==typeof d.getChildContext)return c;d=d.getChildContext();for(var e in d)if(!(e in b))throw Error(p(108,Ra(a)||"Unknown",e));return A({},c,d)}
		function cg(a){a=(a=a.stateNode)&&a.__reactInternalMemoizedMergedChildContext||Vf;Xf=H.current;G(H,a);G(Wf,Wf.current);return !0}function dg(a,b,c){var d=a.stateNode;if(!d)throw Error(p(169));c?(a=bg(a,b,Xf),d.__reactInternalMemoizedMergedChildContext=a,E(Wf),E(H),G(H,a)):E(Wf);G(Wf,c);}var eg=null,fg=!1,gg=!1;function hg(a){null===eg?eg=[a]:eg.push(a);}function ig(a){fg=!0;hg(a);}
		function jg(){if(!gg&&null!==eg){gg=!0;var a=0,b=C;try{var c=eg;for(C=1;a<c.length;a++){var d=c[a];do d=d(!0);while(null!==d)}eg=null;fg=!1;}catch(e){throw null!==eg&&(eg=eg.slice(a+1)),ac(fc,jg),e;}finally{C=b,gg=!1;}}return null}var kg=[],lg=0,mg=null,ng=0,og=[],pg=0,qg=null,rg=1,sg="";function tg(a,b){kg[lg++]=ng;kg[lg++]=mg;mg=a;ng=b;}
		function ug(a,b,c){og[pg++]=rg;og[pg++]=sg;og[pg++]=qg;qg=a;var d=rg;a=sg;var e=32-oc(d)-1;d&=~(1<<e);c+=1;var f=32-oc(b)+e;if(30<f){var g=e-e%5;f=(d&(1<<g)-1).toString(32);d>>=g;e-=g;rg=1<<32-oc(b)+e|c<<e|d;sg=f+a;}else rg=1<<f|c<<e|d,sg=a;}function vg(a){null!==a.return&&(tg(a,1),ug(a,1,0));}function wg(a){for(;a===mg;)mg=kg[--lg],kg[lg]=null,ng=kg[--lg],kg[lg]=null;for(;a===qg;)qg=og[--pg],og[pg]=null,sg=og[--pg],og[pg]=null,rg=og[--pg],og[pg]=null;}var xg=null,yg=null,I=!1,zg=null;
		function Ag(a,b){var c=Bg(5,null,null,0);c.elementType="DELETED";c.stateNode=b;c.return=a;b=a.deletions;null===b?(a.deletions=[c],a.flags|=16):b.push(c);}
		function Cg(a,b){switch(a.tag){case 5:var c=a.type;b=1!==b.nodeType||c.toLowerCase()!==b.nodeName.toLowerCase()?null:b;return null!==b?(a.stateNode=b,xg=a,yg=Lf(b.firstChild),!0):!1;case 6:return b=""===a.pendingProps||3!==b.nodeType?null:b,null!==b?(a.stateNode=b,xg=a,yg=null,!0):!1;case 13:return b=8!==b.nodeType?null:b,null!==b?(c=null!==qg?{id:rg,overflow:sg}:null,a.memoizedState={dehydrated:b,treeContext:c,retryLane:1073741824},c=Bg(18,null,null,0),c.stateNode=b,c.return=a,a.child=c,xg=a,yg=
		null,!0):!1;default:return !1}}function Dg(a){return 0!==(a.mode&1)&&0===(a.flags&128)}function Eg(a){if(I){var b=yg;if(b){var c=b;if(!Cg(a,b)){if(Dg(a))throw Error(p(418));b=Lf(c.nextSibling);var d=xg;b&&Cg(a,b)?Ag(d,c):(a.flags=a.flags&-4097|2,I=!1,xg=a);}}else {if(Dg(a))throw Error(p(418));a.flags=a.flags&-4097|2;I=!1;xg=a;}}}function Fg(a){for(a=a.return;null!==a&&5!==a.tag&&3!==a.tag&&13!==a.tag;)a=a.return;xg=a;}
		function Gg(a){if(a!==xg)return !1;if(!I)return Fg(a),I=!0,!1;var b;(b=3!==a.tag)&&!(b=5!==a.tag)&&(b=a.type,b="head"!==b&&"body"!==b&&!Ef(a.type,a.memoizedProps));if(b&&(b=yg)){if(Dg(a))throw Hg(),Error(p(418));for(;b;)Ag(a,b),b=Lf(b.nextSibling);}Fg(a);if(13===a.tag){a=a.memoizedState;a=null!==a?a.dehydrated:null;if(!a)throw Error(p(317));a:{a=a.nextSibling;for(b=0;a;){if(8===a.nodeType){var c=a.data;if("/$"===c){if(0===b){yg=Lf(a.nextSibling);break a}b--;}else "$"!==c&&"$!"!==c&&"$?"!==c||b++;}a=a.nextSibling;}yg=
		null;}}else yg=xg?Lf(a.stateNode.nextSibling):null;return !0}function Hg(){for(var a=yg;a;)a=Lf(a.nextSibling);}function Ig(){yg=xg=null;I=!1;}function Jg(a){null===zg?zg=[a]:zg.push(a);}var Kg=ua.ReactCurrentBatchConfig;function Lg(a,b){if(a&&a.defaultProps){b=A({},b);a=a.defaultProps;for(var c in a)void 0===b[c]&&(b[c]=a[c]);return b}return b}var Mg=Uf(null),Ng=null,Og=null,Pg=null;function Qg(){Pg=Og=Ng=null;}function Rg(a){var b=Mg.current;E(Mg);a._currentValue=b;}
		function Sg(a,b,c){for(;null!==a;){var d=a.alternate;(a.childLanes&b)!==b?(a.childLanes|=b,null!==d&&(d.childLanes|=b)):null!==d&&(d.childLanes&b)!==b&&(d.childLanes|=b);if(a===c)break;a=a.return;}}function Tg(a,b){Ng=a;Pg=Og=null;a=a.dependencies;null!==a&&null!==a.firstContext&&(0!==(a.lanes&b)&&(Ug=!0),a.firstContext=null);}
		function Vg(a){var b=a._currentValue;if(Pg!==a)if(a={context:a,memoizedValue:b,next:null},null===Og){if(null===Ng)throw Error(p(308));Og=a;Ng.dependencies={lanes:0,firstContext:a};}else Og=Og.next=a;return b}var Wg=null;function Xg(a){null===Wg?Wg=[a]:Wg.push(a);}function Yg(a,b,c,d){var e=b.interleaved;null===e?(c.next=c,Xg(b)):(c.next=e.next,e.next=c);b.interleaved=c;return Zg(a,d)}
		function Zg(a,b){a.lanes|=b;var c=a.alternate;null!==c&&(c.lanes|=b);c=a;for(a=a.return;null!==a;)a.childLanes|=b,c=a.alternate,null!==c&&(c.childLanes|=b),c=a,a=a.return;return 3===c.tag?c.stateNode:null}var $g=!1;function ah(a){a.updateQueue={baseState:a.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null};}
		function bh(a,b){a=a.updateQueue;b.updateQueue===a&&(b.updateQueue={baseState:a.baseState,firstBaseUpdate:a.firstBaseUpdate,lastBaseUpdate:a.lastBaseUpdate,shared:a.shared,effects:a.effects});}function ch(a,b){return {eventTime:a,lane:b,tag:0,payload:null,callback:null,next:null}}
		function dh(a,b,c){var d=a.updateQueue;if(null===d)return null;d=d.shared;if(0!==(K&2)){var e=d.pending;null===e?b.next=b:(b.next=e.next,e.next=b);d.pending=b;return Zg(a,c)}e=d.interleaved;null===e?(b.next=b,Xg(d)):(b.next=e.next,e.next=b);d.interleaved=b;return Zg(a,c)}function eh(a,b,c){b=b.updateQueue;if(null!==b&&(b=b.shared,0!==(c&4194240))){var d=b.lanes;d&=a.pendingLanes;c|=d;b.lanes=c;Cc(a,c);}}
		function fh(a,b){var c=a.updateQueue,d=a.alternate;if(null!==d&&(d=d.updateQueue,c===d)){var e=null,f=null;c=c.firstBaseUpdate;if(null!==c){do{var g={eventTime:c.eventTime,lane:c.lane,tag:c.tag,payload:c.payload,callback:c.callback,next:null};null===f?e=f=g:f=f.next=g;c=c.next;}while(null!==c);null===f?e=f=b:f=f.next=b;}else e=f=b;c={baseState:d.baseState,firstBaseUpdate:e,lastBaseUpdate:f,shared:d.shared,effects:d.effects};a.updateQueue=c;return}a=c.lastBaseUpdate;null===a?c.firstBaseUpdate=b:a.next=
		b;c.lastBaseUpdate=b;}
		function gh(a,b,c,d){var e=a.updateQueue;$g=!1;var f=e.firstBaseUpdate,g=e.lastBaseUpdate,h=e.shared.pending;if(null!==h){e.shared.pending=null;var k=h,l=k.next;k.next=null;null===g?f=l:g.next=l;g=k;var m=a.alternate;null!==m&&(m=m.updateQueue,h=m.lastBaseUpdate,h!==g&&(null===h?m.firstBaseUpdate=l:h.next=l,m.lastBaseUpdate=k));}if(null!==f){var q=e.baseState;g=0;m=l=k=null;h=f;do{var r=h.lane,y=h.eventTime;if((d&r)===r){null!==m&&(m=m.next={eventTime:y,lane:0,tag:h.tag,payload:h.payload,callback:h.callback,
		next:null});a:{var n=a,t=h;r=b;y=c;switch(t.tag){case 1:n=t.payload;if("function"===typeof n){q=n.call(y,q,r);break a}q=n;break a;case 3:n.flags=n.flags&-65537|128;case 0:n=t.payload;r="function"===typeof n?n.call(y,q,r):n;if(null===r||void 0===r)break a;q=A({},q,r);break a;case 2:$g=!0;}}null!==h.callback&&0!==h.lane&&(a.flags|=64,r=e.effects,null===r?e.effects=[h]:r.push(h));}else y={eventTime:y,lane:r,tag:h.tag,payload:h.payload,callback:h.callback,next:null},null===m?(l=m=y,k=q):m=m.next=y,g|=r;
		h=h.next;if(null===h)if(h=e.shared.pending,null===h)break;else r=h,h=r.next,r.next=null,e.lastBaseUpdate=r,e.shared.pending=null;}while(1);null===m&&(k=q);e.baseState=k;e.firstBaseUpdate=l;e.lastBaseUpdate=m;b=e.shared.interleaved;if(null!==b){e=b;do g|=e.lane,e=e.next;while(e!==b)}else null===f&&(e.shared.lanes=0);hh|=g;a.lanes=g;a.memoizedState=q;}}
		function ih(a,b,c){a=b.effects;b.effects=null;if(null!==a)for(b=0;b<a.length;b++){var d=a[b],e=d.callback;if(null!==e){d.callback=null;d=c;if("function"!==typeof e)throw Error(p(191,e));e.call(d);}}}var jh=(new aa.Component).refs;function kh(a,b,c,d){b=a.memoizedState;c=c(d,b);c=null===c||void 0===c?b:A({},b,c);a.memoizedState=c;0===a.lanes&&(a.updateQueue.baseState=c);}
		var nh={isMounted:function(a){return (a=a._reactInternals)?Vb(a)===a:!1},enqueueSetState:function(a,b,c){a=a._reactInternals;var d=L(),e=lh(a),f=ch(d,e);f.payload=b;void 0!==c&&null!==c&&(f.callback=c);b=dh(a,f,e);null!==b&&(mh(b,a,e,d),eh(b,a,e));},enqueueReplaceState:function(a,b,c){a=a._reactInternals;var d=L(),e=lh(a),f=ch(d,e);f.tag=1;f.payload=b;void 0!==c&&null!==c&&(f.callback=c);b=dh(a,f,e);null!==b&&(mh(b,a,e,d),eh(b,a,e));},enqueueForceUpdate:function(a,b){a=a._reactInternals;var c=L(),d=
		lh(a),e=ch(c,d);e.tag=2;void 0!==b&&null!==b&&(e.callback=b);b=dh(a,e,d);null!==b&&(mh(b,a,d,c),eh(b,a,d));}};function oh(a,b,c,d,e,f,g){a=a.stateNode;return "function"===typeof a.shouldComponentUpdate?a.shouldComponentUpdate(d,f,g):b.prototype&&b.prototype.isPureReactComponent?!Ie(c,d)||!Ie(e,f):!0}
		function ph(a,b,c){var d=!1,e=Vf;var f=b.contextType;"object"===typeof f&&null!==f?f=Vg(f):(e=Zf(b)?Xf:H.current,d=b.contextTypes,f=(d=null!==d&&void 0!==d)?Yf(a,e):Vf);b=new b(c,f);a.memoizedState=null!==b.state&&void 0!==b.state?b.state:null;b.updater=nh;a.stateNode=b;b._reactInternals=a;d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=e,a.__reactInternalMemoizedMaskedChildContext=f);return b}
		function qh(a,b,c,d){a=b.state;"function"===typeof b.componentWillReceiveProps&&b.componentWillReceiveProps(c,d);"function"===typeof b.UNSAFE_componentWillReceiveProps&&b.UNSAFE_componentWillReceiveProps(c,d);b.state!==a&&nh.enqueueReplaceState(b,b.state,null);}
		function rh(a,b,c,d){var e=a.stateNode;e.props=c;e.state=a.memoizedState;e.refs=jh;ah(a);var f=b.contextType;"object"===typeof f&&null!==f?e.context=Vg(f):(f=Zf(b)?Xf:H.current,e.context=Yf(a,f));e.state=a.memoizedState;f=b.getDerivedStateFromProps;"function"===typeof f&&(kh(a,b,f,c),e.state=a.memoizedState);"function"===typeof b.getDerivedStateFromProps||"function"===typeof e.getSnapshotBeforeUpdate||"function"!==typeof e.UNSAFE_componentWillMount&&"function"!==typeof e.componentWillMount||(b=e.state,
		"function"===typeof e.componentWillMount&&e.componentWillMount(),"function"===typeof e.UNSAFE_componentWillMount&&e.UNSAFE_componentWillMount(),b!==e.state&&nh.enqueueReplaceState(e,e.state,null),gh(a,c,e,d),e.state=a.memoizedState);"function"===typeof e.componentDidMount&&(a.flags|=4194308);}
		function sh(a,b,c){a=c.ref;if(null!==a&&"function"!==typeof a&&"object"!==typeof a){if(c._owner){c=c._owner;if(c){if(1!==c.tag)throw Error(p(309));var d=c.stateNode;}if(!d)throw Error(p(147,a));var e=d,f=""+a;if(null!==b&&null!==b.ref&&"function"===typeof b.ref&&b.ref._stringRef===f)return b.ref;b=function(a){var b=e.refs;b===jh&&(b=e.refs={});null===a?delete b[f]:b[f]=a;};b._stringRef=f;return b}if("string"!==typeof a)throw Error(p(284));if(!c._owner)throw Error(p(290,a));}return a}
		function th(a,b){a=Object.prototype.toString.call(b);throw Error(p(31,"[object Object]"===a?"object with keys {"+Object.keys(b).join(", ")+"}":a));}function uh(a){var b=a._init;return b(a._payload)}
		function vh(a){function b(b,c){if(a){var d=b.deletions;null===d?(b.deletions=[c],b.flags|=16):d.push(c);}}function c(c,d){if(!a)return null;for(;null!==d;)b(c,d),d=d.sibling;return null}function d(a,b){for(a=new Map;null!==b;)null!==b.key?a.set(b.key,b):a.set(b.index,b),b=b.sibling;return a}function e(a,b){a=wh(a,b);a.index=0;a.sibling=null;return a}function f(b,c,d){b.index=d;if(!a)return b.flags|=1048576,c;d=b.alternate;if(null!==d)return d=d.index,d<c?(b.flags|=2,c):d;b.flags|=2;return c}function g(b){a&&
		null===b.alternate&&(b.flags|=2);return b}function h(a,b,c,d){if(null===b||6!==b.tag)return b=xh(c,a.mode,d),b.return=a,b;b=e(b,c);b.return=a;return b}function k(a,b,c,d){var f=c.type;if(f===ya)return m(a,b,c.props.children,d,c.key);if(null!==b&&(b.elementType===f||"object"===typeof f&&null!==f&&f.$$typeof===Ha&&uh(f)===b.type))return d=e(b,c.props),d.ref=sh(a,b,c),d.return=a,d;d=yh(c.type,c.key,c.props,null,a.mode,d);d.ref=sh(a,b,c);d.return=a;return d}function l(a,b,c,d){if(null===b||4!==b.tag||
		b.stateNode.containerInfo!==c.containerInfo||b.stateNode.implementation!==c.implementation)return b=zh(c,a.mode,d),b.return=a,b;b=e(b,c.children||[]);b.return=a;return b}function m(a,b,c,d,f){if(null===b||7!==b.tag)return b=Ah(c,a.mode,d,f),b.return=a,b;b=e(b,c);b.return=a;return b}function q(a,b,c){if("string"===typeof b&&""!==b||"number"===typeof b)return b=xh(""+b,a.mode,c),b.return=a,b;if("object"===typeof b&&null!==b){switch(b.$$typeof){case va:return c=yh(b.type,b.key,b.props,null,a.mode,c),
		c.ref=sh(a,null,b),c.return=a,c;case wa:return b=zh(b,a.mode,c),b.return=a,b;case Ha:var d=b._init;return q(a,d(b._payload),c)}if(eb(b)||Ka(b))return b=Ah(b,a.mode,c,null),b.return=a,b;th(a,b);}return null}function r(a,b,c,d){var e=null!==b?b.key:null;if("string"===typeof c&&""!==c||"number"===typeof c)return null!==e?null:h(a,b,""+c,d);if("object"===typeof c&&null!==c){switch(c.$$typeof){case va:return c.key===e?k(a,b,c,d):null;case wa:return c.key===e?l(a,b,c,d):null;case Ha:return e=c._init,r(a,
		b,e(c._payload),d)}if(eb(c)||Ka(c))return null!==e?null:m(a,b,c,d,null);th(a,c);}return null}function y(a,b,c,d,e){if("string"===typeof d&&""!==d||"number"===typeof d)return a=a.get(c)||null,h(b,a,""+d,e);if("object"===typeof d&&null!==d){switch(d.$$typeof){case va:return a=a.get(null===d.key?c:d.key)||null,k(b,a,d,e);case wa:return a=a.get(null===d.key?c:d.key)||null,l(b,a,d,e);case Ha:var f=d._init;return y(a,b,c,f(d._payload),e)}if(eb(d)||Ka(d))return a=a.get(c)||null,m(b,a,d,e,null);th(b,d);}return null}
		function n(e,g,h,k){for(var l=null,m=null,u=g,w=g=0,x=null;null!==u&&w<h.length;w++){u.index>w?(x=u,u=null):x=u.sibling;var n=r(e,u,h[w],k);if(null===n){null===u&&(u=x);break}a&&u&&null===n.alternate&&b(e,u);g=f(n,g,w);null===m?l=n:m.sibling=n;m=n;u=x;}if(w===h.length)return c(e,u),I&&tg(e,w),l;if(null===u){for(;w<h.length;w++)u=q(e,h[w],k),null!==u&&(g=f(u,g,w),null===m?l=u:m.sibling=u,m=u);I&&tg(e,w);return l}for(u=d(e,u);w<h.length;w++)x=y(u,e,w,h[w],k),null!==x&&(a&&null!==x.alternate&&u.delete(null===
		x.key?w:x.key),g=f(x,g,w),null===m?l=x:m.sibling=x,m=x);a&&u.forEach(function(a){return b(e,a)});I&&tg(e,w);return l}function t(e,g,h,k){var l=Ka(h);if("function"!==typeof l)throw Error(p(150));h=l.call(h);if(null==h)throw Error(p(151));for(var u=l=null,m=g,w=g=0,x=null,n=h.next();null!==m&&!n.done;w++,n=h.next()){m.index>w?(x=m,m=null):x=m.sibling;var t=r(e,m,n.value,k);if(null===t){null===m&&(m=x);break}a&&m&&null===t.alternate&&b(e,m);g=f(t,g,w);null===u?l=t:u.sibling=t;u=t;m=x;}if(n.done)return c(e,
		m),I&&tg(e,w),l;if(null===m){for(;!n.done;w++,n=h.next())n=q(e,n.value,k),null!==n&&(g=f(n,g,w),null===u?l=n:u.sibling=n,u=n);I&&tg(e,w);return l}for(m=d(e,m);!n.done;w++,n=h.next())n=y(m,e,w,n.value,k),null!==n&&(a&&null!==n.alternate&&m.delete(null===n.key?w:n.key),g=f(n,g,w),null===u?l=n:u.sibling=n,u=n);a&&m.forEach(function(a){return b(e,a)});I&&tg(e,w);return l}function J(a,d,f,h){"object"===typeof f&&null!==f&&f.type===ya&&null===f.key&&(f=f.props.children);if("object"===typeof f&&null!==f){switch(f.$$typeof){case va:a:{for(var k=
		f.key,l=d;null!==l;){if(l.key===k){k=f.type;if(k===ya){if(7===l.tag){c(a,l.sibling);d=e(l,f.props.children);d.return=a;a=d;break a}}else if(l.elementType===k||"object"===typeof k&&null!==k&&k.$$typeof===Ha&&uh(k)===l.type){c(a,l.sibling);d=e(l,f.props);d.ref=sh(a,l,f);d.return=a;a=d;break a}c(a,l);break}else b(a,l);l=l.sibling;}f.type===ya?(d=Ah(f.props.children,a.mode,h,f.key),d.return=a,a=d):(h=yh(f.type,f.key,f.props,null,a.mode,h),h.ref=sh(a,d,f),h.return=a,a=h);}return g(a);case wa:a:{for(l=f.key;null!==
		d;){if(d.key===l)if(4===d.tag&&d.stateNode.containerInfo===f.containerInfo&&d.stateNode.implementation===f.implementation){c(a,d.sibling);d=e(d,f.children||[]);d.return=a;a=d;break a}else {c(a,d);break}else b(a,d);d=d.sibling;}d=zh(f,a.mode,h);d.return=a;a=d;}return g(a);case Ha:return l=f._init,J(a,d,l(f._payload),h)}if(eb(f))return n(a,d,f,h);if(Ka(f))return t(a,d,f,h);th(a,f);}return "string"===typeof f&&""!==f||"number"===typeof f?(f=""+f,null!==d&&6===d.tag?(c(a,d.sibling),d=e(d,f),d.return=a,a=d):
		(c(a,d),d=xh(f,a.mode,h),d.return=a,a=d),g(a)):c(a,d)}return J}var Bh=vh(!0),Ch=vh(!1),Dh={},Eh=Uf(Dh),Fh=Uf(Dh),Gh=Uf(Dh);function Hh(a){if(a===Dh)throw Error(p(174));return a}function Ih(a,b){G(Gh,b);G(Fh,a);G(Eh,Dh);a=b.nodeType;switch(a){case 9:case 11:b=(b=b.documentElement)?b.namespaceURI:lb(null,"");break;default:a=8===a?b.parentNode:b,b=a.namespaceURI||null,a=a.tagName,b=lb(b,a);}E(Eh);G(Eh,b);}function Jh(){E(Eh);E(Fh);E(Gh);}
		function Kh(a){Hh(Gh.current);var b=Hh(Eh.current);var c=lb(b,a.type);b!==c&&(G(Fh,a),G(Eh,c));}function Lh(a){Fh.current===a&&(E(Eh),E(Fh));}var M=Uf(0);
		function Mh(a){for(var b=a;null!==b;){if(13===b.tag){var c=b.memoizedState;if(null!==c&&(c=c.dehydrated,null===c||"$?"===c.data||"$!"===c.data))return b}else if(19===b.tag&&void 0!==b.memoizedProps.revealOrder){if(0!==(b.flags&128))return b}else if(null!==b.child){b.child.return=b;b=b.child;continue}if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return null;b=b.return;}b.sibling.return=b.return;b=b.sibling;}return null}var Nh=[];
		function Oh(){for(var a=0;a<Nh.length;a++)Nh[a]._workInProgressVersionPrimary=null;Nh.length=0;}var Ph=ua.ReactCurrentDispatcher,Qh=ua.ReactCurrentBatchConfig,Rh=0,N=null,O=null,P=null,Sh=!1,Th=!1,Uh=0,Vh=0;function Q(){throw Error(p(321));}function Wh(a,b){if(null===b)return !1;for(var c=0;c<b.length&&c<a.length;c++)if(!He(a[c],b[c]))return !1;return !0}
		function Xh(a,b,c,d,e,f){Rh=f;N=b;b.memoizedState=null;b.updateQueue=null;b.lanes=0;Ph.current=null===a||null===a.memoizedState?Yh:Zh;a=c(d,e);if(Th){f=0;do{Th=!1;Uh=0;if(25<=f)throw Error(p(301));f+=1;P=O=null;b.updateQueue=null;Ph.current=$h;a=c(d,e);}while(Th)}Ph.current=ai;b=null!==O&&null!==O.next;Rh=0;P=O=N=null;Sh=!1;if(b)throw Error(p(300));return a}function bi(){var a=0!==Uh;Uh=0;return a}
		function ci(){var a={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};null===P?N.memoizedState=P=a:P=P.next=a;return P}function di(){if(null===O){var a=N.alternate;a=null!==a?a.memoizedState:null;}else a=O.next;var b=null===P?N.memoizedState:P.next;if(null!==b)P=b,O=a;else {if(null===a)throw Error(p(310));O=a;a={memoizedState:O.memoizedState,baseState:O.baseState,baseQueue:O.baseQueue,queue:O.queue,next:null};null===P?N.memoizedState=P=a:P=P.next=a;}return P}
		function ei(a,b){return "function"===typeof b?b(a):b}
		function fi(a){var b=di(),c=b.queue;if(null===c)throw Error(p(311));c.lastRenderedReducer=a;var d=O,e=d.baseQueue,f=c.pending;if(null!==f){if(null!==e){var g=e.next;e.next=f.next;f.next=g;}d.baseQueue=e=f;c.pending=null;}if(null!==e){f=e.next;d=d.baseState;var h=g=null,k=null,l=f;do{var m=l.lane;if((Rh&m)===m)null!==k&&(k=k.next={lane:0,action:l.action,hasEagerState:l.hasEagerState,eagerState:l.eagerState,next:null}),d=l.hasEagerState?l.eagerState:a(d,l.action);else {var q={lane:m,action:l.action,hasEagerState:l.hasEagerState,
		eagerState:l.eagerState,next:null};null===k?(h=k=q,g=d):k=k.next=q;N.lanes|=m;hh|=m;}l=l.next;}while(null!==l&&l!==f);null===k?g=d:k.next=h;He(d,b.memoizedState)||(Ug=!0);b.memoizedState=d;b.baseState=g;b.baseQueue=k;c.lastRenderedState=d;}a=c.interleaved;if(null!==a){e=a;do f=e.lane,N.lanes|=f,hh|=f,e=e.next;while(e!==a)}else null===e&&(c.lanes=0);return [b.memoizedState,c.dispatch]}
		function gi(a){var b=di(),c=b.queue;if(null===c)throw Error(p(311));c.lastRenderedReducer=a;var d=c.dispatch,e=c.pending,f=b.memoizedState;if(null!==e){c.pending=null;var g=e=e.next;do f=a(f,g.action),g=g.next;while(g!==e);He(f,b.memoizedState)||(Ug=!0);b.memoizedState=f;null===b.baseQueue&&(b.baseState=f);c.lastRenderedState=f;}return [f,d]}function hi(){}
		function ii(a,b){var c=N,d=di(),e=b(),f=!He(d.memoizedState,e);f&&(d.memoizedState=e,Ug=!0);d=d.queue;ji(ki.bind(null,c,d,a),[a]);if(d.getSnapshot!==b||f||null!==P&&P.memoizedState.tag&1){c.flags|=2048;li(9,mi.bind(null,c,d,e,b),void 0,null);if(null===R)throw Error(p(349));0!==(Rh&30)||ni(c,b,e);}return e}function ni(a,b,c){a.flags|=16384;a={getSnapshot:b,value:c};b=N.updateQueue;null===b?(b={lastEffect:null,stores:null},N.updateQueue=b,b.stores=[a]):(c=b.stores,null===c?b.stores=[a]:c.push(a));}
		function mi(a,b,c,d){b.value=c;b.getSnapshot=d;oi(b)&&pi(a);}function ki(a,b,c){return c(function(){oi(b)&&pi(a);})}function oi(a){var b=a.getSnapshot;a=a.value;try{var c=b();return !He(a,c)}catch(d){return !0}}function pi(a){var b=Zg(a,1);null!==b&&mh(b,a,1,-1);}
		function qi(a){var b=ci();"function"===typeof a&&(a=a());b.memoizedState=b.baseState=a;a={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:ei,lastRenderedState:a};b.queue=a;a=a.dispatch=ri.bind(null,N,a);return [b.memoizedState,a]}
		function li(a,b,c,d){a={tag:a,create:b,destroy:c,deps:d,next:null};b=N.updateQueue;null===b?(b={lastEffect:null,stores:null},N.updateQueue=b,b.lastEffect=a.next=a):(c=b.lastEffect,null===c?b.lastEffect=a.next=a:(d=c.next,c.next=a,a.next=d,b.lastEffect=a));return a}function si(){return di().memoizedState}function ti(a,b,c,d){var e=ci();N.flags|=a;e.memoizedState=li(1|b,c,void 0,void 0===d?null:d);}
		function ui(a,b,c,d){var e=di();d=void 0===d?null:d;var f=void 0;if(null!==O){var g=O.memoizedState;f=g.destroy;if(null!==d&&Wh(d,g.deps)){e.memoizedState=li(b,c,f,d);return}}N.flags|=a;e.memoizedState=li(1|b,c,f,d);}function vi(a,b){return ti(8390656,8,a,b)}function ji(a,b){return ui(2048,8,a,b)}function wi(a,b){return ui(4,2,a,b)}function xi(a,b){return ui(4,4,a,b)}
		function yi(a,b){if("function"===typeof b)return a=a(),b(a),function(){b(null);};if(null!==b&&void 0!==b)return a=a(),b.current=a,function(){b.current=null;}}function zi(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return ui(4,4,yi.bind(null,b,a),c)}function Ai(){}function Bi(a,b){var c=di();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&Wh(b,d[1]))return d[0];c.memoizedState=[a,b];return a}
		function Ci(a,b){var c=di();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&Wh(b,d[1]))return d[0];a=a();c.memoizedState=[a,b];return a}function Di(a,b,c){if(0===(Rh&21))return a.baseState&&(a.baseState=!1,Ug=!0),a.memoizedState=c;He(c,b)||(c=yc(),N.lanes|=c,hh|=c,a.baseState=!0);return b}function Ei(a,b){var c=C;C=0!==c&&4>c?c:4;a(!0);var d=Qh.transition;Qh.transition={};try{a(!1),b();}finally{C=c,Qh.transition=d;}}function Fi(){return di().memoizedState}
		function Gi(a,b,c){var d=lh(a);c={lane:d,action:c,hasEagerState:!1,eagerState:null,next:null};if(Hi(a))Ii(b,c);else if(c=Yg(a,b,c,d),null!==c){var e=L();mh(c,a,d,e);Ji(c,b,d);}}
		function ri(a,b,c){var d=lh(a),e={lane:d,action:c,hasEagerState:!1,eagerState:null,next:null};if(Hi(a))Ii(b,e);else {var f=a.alternate;if(0===a.lanes&&(null===f||0===f.lanes)&&(f=b.lastRenderedReducer,null!==f))try{var g=b.lastRenderedState,h=f(g,c);e.hasEagerState=!0;e.eagerState=h;if(He(h,g)){var k=b.interleaved;null===k?(e.next=e,Xg(b)):(e.next=k.next,k.next=e);b.interleaved=e;return}}catch(l){}finally{}c=Yg(a,b,e,d);null!==c&&(e=L(),mh(c,a,d,e),Ji(c,b,d));}}
		function Hi(a){var b=a.alternate;return a===N||null!==b&&b===N}function Ii(a,b){Th=Sh=!0;var c=a.pending;null===c?b.next=b:(b.next=c.next,c.next=b);a.pending=b;}function Ji(a,b,c){if(0!==(c&4194240)){var d=b.lanes;d&=a.pendingLanes;c|=d;b.lanes=c;Cc(a,c);}}
		var ai={readContext:Vg,useCallback:Q,useContext:Q,useEffect:Q,useImperativeHandle:Q,useInsertionEffect:Q,useLayoutEffect:Q,useMemo:Q,useReducer:Q,useRef:Q,useState:Q,useDebugValue:Q,useDeferredValue:Q,useTransition:Q,useMutableSource:Q,useSyncExternalStore:Q,useId:Q,unstable_isNewReconciler:!1},Yh={readContext:Vg,useCallback:function(a,b){ci().memoizedState=[a,void 0===b?null:b];return a},useContext:Vg,useEffect:vi,useImperativeHandle:function(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return ti(4194308,
		4,yi.bind(null,b,a),c)},useLayoutEffect:function(a,b){return ti(4194308,4,a,b)},useInsertionEffect:function(a,b){return ti(4,2,a,b)},useMemo:function(a,b){var c=ci();b=void 0===b?null:b;a=a();c.memoizedState=[a,b];return a},useReducer:function(a,b,c){var d=ci();b=void 0!==c?c(b):b;d.memoizedState=d.baseState=b;a={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:a,lastRenderedState:b};d.queue=a;a=a.dispatch=Gi.bind(null,N,a);return [d.memoizedState,a]},useRef:function(a){var b=
		ci();a={current:a};return b.memoizedState=a},useState:qi,useDebugValue:Ai,useDeferredValue:function(a){return ci().memoizedState=a},useTransition:function(){var a=qi(!1),b=a[0];a=Ei.bind(null,a[1]);ci().memoizedState=a;return [b,a]},useMutableSource:function(){},useSyncExternalStore:function(a,b,c){var d=N,e=ci();if(I){if(void 0===c)throw Error(p(407));c=c();}else {c=b();if(null===R)throw Error(p(349));0!==(Rh&30)||ni(d,b,c);}e.memoizedState=c;var f={value:c,getSnapshot:b};e.queue=f;vi(ki.bind(null,d,
		f,a),[a]);d.flags|=2048;li(9,mi.bind(null,d,f,c,b),void 0,null);return c},useId:function(){var a=ci(),b=R.identifierPrefix;if(I){var c=sg;var d=rg;c=(d&~(1<<32-oc(d)-1)).toString(32)+c;b=":"+b+"R"+c;c=Uh++;0<c&&(b+="H"+c.toString(32));b+=":";}else c=Vh++,b=":"+b+"r"+c.toString(32)+":";return a.memoizedState=b},unstable_isNewReconciler:!1},Zh={readContext:Vg,useCallback:Bi,useContext:Vg,useEffect:ji,useImperativeHandle:zi,useInsertionEffect:wi,useLayoutEffect:xi,useMemo:Ci,useReducer:fi,useRef:si,useState:function(){return fi(ei)},
		useDebugValue:Ai,useDeferredValue:function(a){var b=di();return Di(b,O.memoizedState,a)},useTransition:function(){var a=fi(ei)[0],b=di().memoizedState;return [a,b]},useMutableSource:hi,useSyncExternalStore:ii,useId:Fi,unstable_isNewReconciler:!1},$h={readContext:Vg,useCallback:Bi,useContext:Vg,useEffect:ji,useImperativeHandle:zi,useInsertionEffect:wi,useLayoutEffect:xi,useMemo:Ci,useReducer:gi,useRef:si,useState:function(){return gi(ei)},useDebugValue:Ai,useDeferredValue:function(a){var b=di();return null===
		O?b.memoizedState=a:Di(b,O.memoizedState,a)},useTransition:function(){var a=gi(ei)[0],b=di().memoizedState;return [a,b]},useMutableSource:hi,useSyncExternalStore:ii,useId:Fi,unstable_isNewReconciler:!1};function Ki(a,b){try{var c="",d=b;do c+=Pa(d),d=d.return;while(d);var e=c;}catch(f){e="\nError generating stack: "+f.message+"\n"+f.stack;}return {value:a,source:b,stack:e,digest:null}}function Li(a,b,c){return {value:a,source:null,stack:null!=c?c:null,digest:null!=b?b:null}}
		function Mi(a,b){try{console.error(b.value);}catch(c){setTimeout(function(){throw c;});}}var Ni="function"===typeof WeakMap?WeakMap:Map;function Oi(a,b,c){c=ch(-1,c);c.tag=3;c.payload={element:null};var d=b.value;c.callback=function(){Pi||(Pi=!0,Qi=d);Mi(a,b);};return c}
		function Ri(a,b,c){c=ch(-1,c);c.tag=3;var d=a.type.getDerivedStateFromError;if("function"===typeof d){var e=b.value;c.payload=function(){return d(e)};c.callback=function(){Mi(a,b);};}var f=a.stateNode;null!==f&&"function"===typeof f.componentDidCatch&&(c.callback=function(){Mi(a,b);"function"!==typeof d&&(null===Si?Si=new Set([this]):Si.add(this));var c=b.stack;this.componentDidCatch(b.value,{componentStack:null!==c?c:""});});return c}
		function Ti(a,b,c){var d=a.pingCache;if(null===d){d=a.pingCache=new Ni;var e=new Set;d.set(b,e);}else e=d.get(b),void 0===e&&(e=new Set,d.set(b,e));e.has(c)||(e.add(c),a=Ui.bind(null,a,b,c),b.then(a,a));}function Vi(a){do{var b;if(b=13===a.tag)b=a.memoizedState,b=null!==b?null!==b.dehydrated?!0:!1:!0;if(b)return a;a=a.return;}while(null!==a);return null}
		function Wi(a,b,c,d,e){if(0===(a.mode&1))return a===b?a.flags|=65536:(a.flags|=128,c.flags|=131072,c.flags&=-52805,1===c.tag&&(null===c.alternate?c.tag=17:(b=ch(-1,1),b.tag=2,dh(c,b,1))),c.lanes|=1),a;a.flags|=65536;a.lanes=e;return a}var Xi=ua.ReactCurrentOwner,Ug=!1;function Yi(a,b,c,d){b.child=null===a?Ch(b,null,c,d):Bh(b,a.child,c,d);}
		function Zi(a,b,c,d,e){c=c.render;var f=b.ref;Tg(b,e);d=Xh(a,b,c,d,f,e);c=bi();if(null!==a&&!Ug)return b.updateQueue=a.updateQueue,b.flags&=-2053,a.lanes&=~e,$i(a,b,e);I&&c&&vg(b);b.flags|=1;Yi(a,b,d,e);return b.child}
		function aj(a,b,c,d,e){if(null===a){var f=c.type;if("function"===typeof f&&!bj(f)&&void 0===f.defaultProps&&null===c.compare&&void 0===c.defaultProps)return b.tag=15,b.type=f,cj(a,b,f,d,e);a=yh(c.type,null,d,b,b.mode,e);a.ref=b.ref;a.return=b;return b.child=a}f=a.child;if(0===(a.lanes&e)){var g=f.memoizedProps;c=c.compare;c=null!==c?c:Ie;if(c(g,d)&&a.ref===b.ref)return $i(a,b,e)}b.flags|=1;a=wh(f,d);a.ref=b.ref;a.return=b;return b.child=a}
		function cj(a,b,c,d,e){if(null!==a){var f=a.memoizedProps;if(Ie(f,d)&&a.ref===b.ref)if(Ug=!1,b.pendingProps=d=f,0!==(a.lanes&e))0!==(a.flags&131072)&&(Ug=!0);else return b.lanes=a.lanes,$i(a,b,e)}return dj(a,b,c,d,e)}
		function ej(a,b,c){var d=b.pendingProps,e=d.children,f=null!==a?a.memoizedState:null;if("hidden"===d.mode)if(0===(b.mode&1))b.memoizedState={baseLanes:0,cachePool:null,transitions:null},G(fj,gj),gj|=c;else {if(0===(c&1073741824))return a=null!==f?f.baseLanes|c:c,b.lanes=b.childLanes=1073741824,b.memoizedState={baseLanes:a,cachePool:null,transitions:null},b.updateQueue=null,G(fj,gj),gj|=a,null;b.memoizedState={baseLanes:0,cachePool:null,transitions:null};d=null!==f?f.baseLanes:c;G(fj,gj);gj|=d;}else null!==
		f?(d=f.baseLanes|c,b.memoizedState=null):d=c,G(fj,gj),gj|=d;Yi(a,b,e,c);return b.child}function hj(a,b){var c=b.ref;if(null===a&&null!==c||null!==a&&a.ref!==c)b.flags|=512,b.flags|=2097152;}function dj(a,b,c,d,e){var f=Zf(c)?Xf:H.current;f=Yf(b,f);Tg(b,e);c=Xh(a,b,c,d,f,e);d=bi();if(null!==a&&!Ug)return b.updateQueue=a.updateQueue,b.flags&=-2053,a.lanes&=~e,$i(a,b,e);I&&d&&vg(b);b.flags|=1;Yi(a,b,c,e);return b.child}
		function ij(a,b,c,d,e){if(Zf(c)){var f=!0;cg(b);}else f=!1;Tg(b,e);if(null===b.stateNode)jj(a,b),ph(b,c,d),rh(b,c,d,e),d=!0;else if(null===a){var g=b.stateNode,h=b.memoizedProps;g.props=h;var k=g.context,l=c.contextType;"object"===typeof l&&null!==l?l=Vg(l):(l=Zf(c)?Xf:H.current,l=Yf(b,l));var m=c.getDerivedStateFromProps,q="function"===typeof m||"function"===typeof g.getSnapshotBeforeUpdate;q||"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||
		(h!==d||k!==l)&&qh(b,g,d,l);$g=!1;var r=b.memoizedState;g.state=r;gh(b,d,g,e);k=b.memoizedState;h!==d||r!==k||Wf.current||$g?("function"===typeof m&&(kh(b,c,m,d),k=b.memoizedState),(h=$g||oh(b,c,h,d,r,k,l))?(q||"function"!==typeof g.UNSAFE_componentWillMount&&"function"!==typeof g.componentWillMount||("function"===typeof g.componentWillMount&&g.componentWillMount(),"function"===typeof g.UNSAFE_componentWillMount&&g.UNSAFE_componentWillMount()),"function"===typeof g.componentDidMount&&(b.flags|=4194308)):
		("function"===typeof g.componentDidMount&&(b.flags|=4194308),b.memoizedProps=d,b.memoizedState=k),g.props=d,g.state=k,g.context=l,d=h):("function"===typeof g.componentDidMount&&(b.flags|=4194308),d=!1);}else {g=b.stateNode;bh(a,b);h=b.memoizedProps;l=b.type===b.elementType?h:Lg(b.type,h);g.props=l;q=b.pendingProps;r=g.context;k=c.contextType;"object"===typeof k&&null!==k?k=Vg(k):(k=Zf(c)?Xf:H.current,k=Yf(b,k));var y=c.getDerivedStateFromProps;(m="function"===typeof y||"function"===typeof g.getSnapshotBeforeUpdate)||
		"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||(h!==q||r!==k)&&qh(b,g,d,k);$g=!1;r=b.memoizedState;g.state=r;gh(b,d,g,e);var n=b.memoizedState;h!==q||r!==n||Wf.current||$g?("function"===typeof y&&(kh(b,c,y,d),n=b.memoizedState),(l=$g||oh(b,c,l,d,r,n,k)||!1)?(m||"function"!==typeof g.UNSAFE_componentWillUpdate&&"function"!==typeof g.componentWillUpdate||("function"===typeof g.componentWillUpdate&&g.componentWillUpdate(d,n,k),"function"===typeof g.UNSAFE_componentWillUpdate&&
		g.UNSAFE_componentWillUpdate(d,n,k)),"function"===typeof g.componentDidUpdate&&(b.flags|=4),"function"===typeof g.getSnapshotBeforeUpdate&&(b.flags|=1024)):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=1024),b.memoizedProps=d,b.memoizedState=n),g.props=d,g.state=n,g.context=k,d=l):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&r===
		a.memoizedState||(b.flags|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&r===a.memoizedState||(b.flags|=1024),d=!1);}return kj(a,b,c,d,f,e)}
		function kj(a,b,c,d,e,f){hj(a,b);var g=0!==(b.flags&128);if(!d&&!g)return e&&dg(b,c,!1),$i(a,b,f);d=b.stateNode;Xi.current=b;var h=g&&"function"!==typeof c.getDerivedStateFromError?null:d.render();b.flags|=1;null!==a&&g?(b.child=Bh(b,a.child,null,f),b.child=Bh(b,null,h,f)):Yi(a,b,h,f);b.memoizedState=d.state;e&&dg(b,c,!0);return b.child}function lj(a){var b=a.stateNode;b.pendingContext?ag(a,b.pendingContext,b.pendingContext!==b.context):b.context&&ag(a,b.context,!1);Ih(a,b.containerInfo);}
		function mj(a,b,c,d,e){Ig();Jg(e);b.flags|=256;Yi(a,b,c,d);return b.child}var nj={dehydrated:null,treeContext:null,retryLane:0};function oj(a){return {baseLanes:a,cachePool:null,transitions:null}}
		function pj(a,b,c){var d=b.pendingProps,e=M.current,f=!1,g=0!==(b.flags&128),h;(h=g)||(h=null!==a&&null===a.memoizedState?!1:0!==(e&2));if(h)f=!0,b.flags&=-129;else if(null===a||null!==a.memoizedState)e|=1;G(M,e&1);if(null===a){Eg(b);a=b.memoizedState;if(null!==a&&(a=a.dehydrated,null!==a))return 0===(b.mode&1)?b.lanes=1:"$!"===a.data?b.lanes=8:b.lanes=1073741824,null;g=d.children;a=d.fallback;return f?(d=b.mode,f=b.child,g={mode:"hidden",children:g},0===(d&1)&&null!==f?(f.childLanes=0,f.pendingProps=
		g):f=qj(g,d,0,null),a=Ah(a,d,c,null),f.return=b,a.return=b,f.sibling=a,b.child=f,b.child.memoizedState=oj(c),b.memoizedState=nj,a):rj(b,g)}e=a.memoizedState;if(null!==e&&(h=e.dehydrated,null!==h))return sj(a,b,g,d,h,e,c);if(f){f=d.fallback;g=b.mode;e=a.child;h=e.sibling;var k={mode:"hidden",children:d.children};0===(g&1)&&b.child!==e?(d=b.child,d.childLanes=0,d.pendingProps=k,b.deletions=null):(d=wh(e,k),d.subtreeFlags=e.subtreeFlags&14680064);null!==h?f=wh(h,f):(f=Ah(f,g,c,null),f.flags|=2);f.return=
		b;d.return=b;d.sibling=f;b.child=d;d=f;f=b.child;g=a.child.memoizedState;g=null===g?oj(c):{baseLanes:g.baseLanes|c,cachePool:null,transitions:g.transitions};f.memoizedState=g;f.childLanes=a.childLanes&~c;b.memoizedState=nj;return d}f=a.child;a=f.sibling;d=wh(f,{mode:"visible",children:d.children});0===(b.mode&1)&&(d.lanes=c);d.return=b;d.sibling=null;null!==a&&(c=b.deletions,null===c?(b.deletions=[a],b.flags|=16):c.push(a));b.child=d;b.memoizedState=null;return d}
		function rj(a,b){b=qj({mode:"visible",children:b},a.mode,0,null);b.return=a;return a.child=b}function tj(a,b,c,d){null!==d&&Jg(d);Bh(b,a.child,null,c);a=rj(b,b.pendingProps.children);a.flags|=2;b.memoizedState=null;return a}
		function sj(a,b,c,d,e,f,g){if(c){if(b.flags&256)return b.flags&=-257,d=Li(Error(p(422))),tj(a,b,g,d);if(null!==b.memoizedState)return b.child=a.child,b.flags|=128,null;f=d.fallback;e=b.mode;d=qj({mode:"visible",children:d.children},e,0,null);f=Ah(f,e,g,null);f.flags|=2;d.return=b;f.return=b;d.sibling=f;b.child=d;0!==(b.mode&1)&&Bh(b,a.child,null,g);b.child.memoizedState=oj(g);b.memoizedState=nj;return f}if(0===(b.mode&1))return tj(a,b,g,null);if("$!"===e.data){d=e.nextSibling&&e.nextSibling.dataset;
		if(d)var h=d.dgst;d=h;f=Error(p(419));d=Li(f,d,void 0);return tj(a,b,g,d)}h=0!==(g&a.childLanes);if(Ug||h){d=R;if(null!==d){switch(g&-g){case 4:e=2;break;case 16:e=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:e=32;break;case 536870912:e=268435456;break;default:e=0;}e=0!==(e&(d.suspendedLanes|g))?0:e;
		0!==e&&e!==f.retryLane&&(f.retryLane=e,Zg(a,e),mh(d,a,e,-1));}uj();d=Li(Error(p(421)));return tj(a,b,g,d)}if("$?"===e.data)return b.flags|=128,b.child=a.child,b=vj.bind(null,a),e._reactRetry=b,null;a=f.treeContext;yg=Lf(e.nextSibling);xg=b;I=!0;zg=null;null!==a&&(og[pg++]=rg,og[pg++]=sg,og[pg++]=qg,rg=a.id,sg=a.overflow,qg=b);b=rj(b,d.children);b.flags|=4096;return b}function wj(a,b,c){a.lanes|=b;var d=a.alternate;null!==d&&(d.lanes|=b);Sg(a.return,b,c);}
		function xj(a,b,c,d,e){var f=a.memoizedState;null===f?a.memoizedState={isBackwards:b,rendering:null,renderingStartTime:0,last:d,tail:c,tailMode:e}:(f.isBackwards=b,f.rendering=null,f.renderingStartTime=0,f.last=d,f.tail=c,f.tailMode=e);}
		function yj(a,b,c){var d=b.pendingProps,e=d.revealOrder,f=d.tail;Yi(a,b,d.children,c);d=M.current;if(0!==(d&2))d=d&1|2,b.flags|=128;else {if(null!==a&&0!==(a.flags&128))a:for(a=b.child;null!==a;){if(13===a.tag)null!==a.memoizedState&&wj(a,c,b);else if(19===a.tag)wj(a,c,b);else if(null!==a.child){a.child.return=a;a=a.child;continue}if(a===b)break a;for(;null===a.sibling;){if(null===a.return||a.return===b)break a;a=a.return;}a.sibling.return=a.return;a=a.sibling;}d&=1;}G(M,d);if(0===(b.mode&1))b.memoizedState=
		null;else switch(e){case "forwards":c=b.child;for(e=null;null!==c;)a=c.alternate,null!==a&&null===Mh(a)&&(e=c),c=c.sibling;c=e;null===c?(e=b.child,b.child=null):(e=c.sibling,c.sibling=null);xj(b,!1,e,c,f);break;case "backwards":c=null;e=b.child;for(b.child=null;null!==e;){a=e.alternate;if(null!==a&&null===Mh(a)){b.child=e;break}a=e.sibling;e.sibling=c;c=e;e=a;}xj(b,!0,c,null,f);break;case "together":xj(b,!1,null,null,void 0);break;default:b.memoizedState=null;}return b.child}
		function jj(a,b){0===(b.mode&1)&&null!==a&&(a.alternate=null,b.alternate=null,b.flags|=2);}function $i(a,b,c){null!==a&&(b.dependencies=a.dependencies);hh|=b.lanes;if(0===(c&b.childLanes))return null;if(null!==a&&b.child!==a.child)throw Error(p(153));if(null!==b.child){a=b.child;c=wh(a,a.pendingProps);b.child=c;for(c.return=b;null!==a.sibling;)a=a.sibling,c=c.sibling=wh(a,a.pendingProps),c.return=b;c.sibling=null;}return b.child}
		function zj(a,b,c){switch(b.tag){case 3:lj(b);Ig();break;case 5:Kh(b);break;case 1:Zf(b.type)&&cg(b);break;case 4:Ih(b,b.stateNode.containerInfo);break;case 10:var d=b.type._context,e=b.memoizedProps.value;G(Mg,d._currentValue);d._currentValue=e;break;case 13:d=b.memoizedState;if(null!==d){if(null!==d.dehydrated)return G(M,M.current&1),b.flags|=128,null;if(0!==(c&b.child.childLanes))return pj(a,b,c);G(M,M.current&1);a=$i(a,b,c);return null!==a?a.sibling:null}G(M,M.current&1);break;case 19:d=0!==(c&
		b.childLanes);if(0!==(a.flags&128)){if(d)return yj(a,b,c);b.flags|=128;}e=b.memoizedState;null!==e&&(e.rendering=null,e.tail=null,e.lastEffect=null);G(M,M.current);if(d)break;else return null;case 22:case 23:return b.lanes=0,ej(a,b,c)}return $i(a,b,c)}var Aj,Bj,Cj,Dj;
		Aj=function(a,b){for(var c=b.child;null!==c;){if(5===c.tag||6===c.tag)a.appendChild(c.stateNode);else if(4!==c.tag&&null!==c.child){c.child.return=c;c=c.child;continue}if(c===b)break;for(;null===c.sibling;){if(null===c.return||c.return===b)return;c=c.return;}c.sibling.return=c.return;c=c.sibling;}};Bj=function(){};
		Cj=function(a,b,c,d){var e=a.memoizedProps;if(e!==d){a=b.stateNode;Hh(Eh.current);var f=null;switch(c){case "input":e=Ya(a,e);d=Ya(a,d);f=[];break;case "select":e=A({},e,{value:void 0});d=A({},d,{value:void 0});f=[];break;case "textarea":e=gb(a,e);d=gb(a,d);f=[];break;default:"function"!==typeof e.onClick&&"function"===typeof d.onClick&&(a.onclick=Bf);}ub(c,d);var g;c=null;for(l in e)if(!d.hasOwnProperty(l)&&e.hasOwnProperty(l)&&null!=e[l])if("style"===l){var h=e[l];for(g in h)h.hasOwnProperty(g)&&
		(c||(c={}),c[g]="");}else "dangerouslySetInnerHTML"!==l&&"children"!==l&&"suppressContentEditableWarning"!==l&&"suppressHydrationWarning"!==l&&"autoFocus"!==l&&(ea.hasOwnProperty(l)?f||(f=[]):(f=f||[]).push(l,null));for(l in d){var k=d[l];h=null!=e?e[l]:void 0;if(d.hasOwnProperty(l)&&k!==h&&(null!=k||null!=h))if("style"===l)if(h){for(g in h)!h.hasOwnProperty(g)||k&&k.hasOwnProperty(g)||(c||(c={}),c[g]="");for(g in k)k.hasOwnProperty(g)&&h[g]!==k[g]&&(c||(c={}),c[g]=k[g]);}else c||(f||(f=[]),f.push(l,
		c)),c=k;else "dangerouslySetInnerHTML"===l?(k=k?k.__html:void 0,h=h?h.__html:void 0,null!=k&&h!==k&&(f=f||[]).push(l,k)):"children"===l?"string"!==typeof k&&"number"!==typeof k||(f=f||[]).push(l,""+k):"suppressContentEditableWarning"!==l&&"suppressHydrationWarning"!==l&&(ea.hasOwnProperty(l)?(null!=k&&"onScroll"===l&&D("scroll",a),f||h===k||(f=[])):(f=f||[]).push(l,k));}c&&(f=f||[]).push("style",c);var l=f;if(b.updateQueue=l)b.flags|=4;}};Dj=function(a,b,c,d){c!==d&&(b.flags|=4);};
		function Ej(a,b){if(!I)switch(a.tailMode){case "hidden":b=a.tail;for(var c=null;null!==b;)null!==b.alternate&&(c=b),b=b.sibling;null===c?a.tail=null:c.sibling=null;break;case "collapsed":c=a.tail;for(var d=null;null!==c;)null!==c.alternate&&(d=c),c=c.sibling;null===d?b||null===a.tail?a.tail=null:a.tail.sibling=null:d.sibling=null;}}
		function S(a){var b=null!==a.alternate&&a.alternate.child===a.child,c=0,d=0;if(b)for(var e=a.child;null!==e;)c|=e.lanes|e.childLanes,d|=e.subtreeFlags&14680064,d|=e.flags&14680064,e.return=a,e=e.sibling;else for(e=a.child;null!==e;)c|=e.lanes|e.childLanes,d|=e.subtreeFlags,d|=e.flags,e.return=a,e=e.sibling;a.subtreeFlags|=d;a.childLanes=c;return b}
		function Fj(a,b,c){var d=b.pendingProps;wg(b);switch(b.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return S(b),null;case 1:return Zf(b.type)&&$f(),S(b),null;case 3:d=b.stateNode;Jh();E(Wf);E(H);Oh();d.pendingContext&&(d.context=d.pendingContext,d.pendingContext=null);if(null===a||null===a.child)Gg(b)?b.flags|=4:null===a||a.memoizedState.isDehydrated&&0===(b.flags&256)||(b.flags|=1024,null!==zg&&(Gj(zg),zg=null));Bj(a,b);S(b);return null;case 5:Lh(b);var e=Hh(Gh.current);
		c=b.type;if(null!==a&&null!=b.stateNode)Cj(a,b,c,d,e),a.ref!==b.ref&&(b.flags|=512,b.flags|=2097152);else {if(!d){if(null===b.stateNode)throw Error(p(166));S(b);return null}a=Hh(Eh.current);if(Gg(b)){d=b.stateNode;c=b.type;var f=b.memoizedProps;d[Of]=b;d[Pf]=f;a=0!==(b.mode&1);switch(c){case "dialog":D("cancel",d);D("close",d);break;case "iframe":case "object":case "embed":D("load",d);break;case "video":case "audio":for(e=0;e<lf.length;e++)D(lf[e],d);break;case "source":D("error",d);break;case "img":case "image":case "link":D("error",
		d);D("load",d);break;case "details":D("toggle",d);break;case "input":Za(d,f);D("invalid",d);break;case "select":d._wrapperState={wasMultiple:!!f.multiple};D("invalid",d);break;case "textarea":hb(d,f),D("invalid",d);}ub(c,f);e=null;for(var g in f)if(f.hasOwnProperty(g)){var h=f[g];"children"===g?"string"===typeof h?d.textContent!==h&&(!0!==f.suppressHydrationWarning&&Af(d.textContent,h,a),e=["children",h]):"number"===typeof h&&d.textContent!==""+h&&(!0!==f.suppressHydrationWarning&&Af(d.textContent,
		h,a),e=["children",""+h]):ea.hasOwnProperty(g)&&null!=h&&"onScroll"===g&&D("scroll",d);}switch(c){case "input":Va(d);db(d,f,!0);break;case "textarea":Va(d);jb(d);break;case "select":case "option":break;default:"function"===typeof f.onClick&&(d.onclick=Bf);}d=e;b.updateQueue=d;null!==d&&(b.flags|=4);}else {g=9===e.nodeType?e:e.ownerDocument;"http://www.w3.org/1999/xhtml"===a&&(a=kb(c));"http://www.w3.org/1999/xhtml"===a?"script"===c?(a=g.createElement("div"),a.innerHTML="<script>\x3c/script>",a=a.removeChild(a.firstChild)):
		"string"===typeof d.is?a=g.createElement(c,{is:d.is}):(a=g.createElement(c),"select"===c&&(g=a,d.multiple?g.multiple=!0:d.size&&(g.size=d.size))):a=g.createElementNS(a,c);a[Of]=b;a[Pf]=d;Aj(a,b,!1,!1);b.stateNode=a;a:{g=vb(c,d);switch(c){case "dialog":D("cancel",a);D("close",a);e=d;break;case "iframe":case "object":case "embed":D("load",a);e=d;break;case "video":case "audio":for(e=0;e<lf.length;e++)D(lf[e],a);e=d;break;case "source":D("error",a);e=d;break;case "img":case "image":case "link":D("error",
		a);D("load",a);e=d;break;case "details":D("toggle",a);e=d;break;case "input":Za(a,d);e=Ya(a,d);D("invalid",a);break;case "option":e=d;break;case "select":a._wrapperState={wasMultiple:!!d.multiple};e=A({},d,{value:void 0});D("invalid",a);break;case "textarea":hb(a,d);e=gb(a,d);D("invalid",a);break;default:e=d;}ub(c,e);h=e;for(f in h)if(h.hasOwnProperty(f)){var k=h[f];"style"===f?sb(a,k):"dangerouslySetInnerHTML"===f?(k=k?k.__html:void 0,null!=k&&nb(a,k)):"children"===f?"string"===typeof k?("textarea"!==
		c||""!==k)&&ob(a,k):"number"===typeof k&&ob(a,""+k):"suppressContentEditableWarning"!==f&&"suppressHydrationWarning"!==f&&"autoFocus"!==f&&(ea.hasOwnProperty(f)?null!=k&&"onScroll"===f&&D("scroll",a):null!=k&&ta(a,f,k,g));}switch(c){case "input":Va(a);db(a,d,!1);break;case "textarea":Va(a);jb(a);break;case "option":null!=d.value&&a.setAttribute("value",""+Sa(d.value));break;case "select":a.multiple=!!d.multiple;f=d.value;null!=f?fb(a,!!d.multiple,f,!1):null!=d.defaultValue&&fb(a,!!d.multiple,d.defaultValue,
		!0);break;default:"function"===typeof e.onClick&&(a.onclick=Bf);}switch(c){case "button":case "input":case "select":case "textarea":d=!!d.autoFocus;break a;case "img":d=!0;break a;default:d=!1;}}d&&(b.flags|=4);}null!==b.ref&&(b.flags|=512,b.flags|=2097152);}S(b);return null;case 6:if(a&&null!=b.stateNode)Dj(a,b,a.memoizedProps,d);else {if("string"!==typeof d&&null===b.stateNode)throw Error(p(166));c=Hh(Gh.current);Hh(Eh.current);if(Gg(b)){d=b.stateNode;c=b.memoizedProps;d[Of]=b;if(f=d.nodeValue!==c)if(a=
		xg,null!==a)switch(a.tag){case 3:Af(d.nodeValue,c,0!==(a.mode&1));break;case 5:!0!==a.memoizedProps.suppressHydrationWarning&&Af(d.nodeValue,c,0!==(a.mode&1));}f&&(b.flags|=4);}else d=(9===c.nodeType?c:c.ownerDocument).createTextNode(d),d[Of]=b,b.stateNode=d;}S(b);return null;case 13:E(M);d=b.memoizedState;if(null===a||null!==a.memoizedState&&null!==a.memoizedState.dehydrated){if(I&&null!==yg&&0!==(b.mode&1)&&0===(b.flags&128))Hg(),Ig(),b.flags|=98560,f=!1;else if(f=Gg(b),null!==d&&null!==d.dehydrated){if(null===
		a){if(!f)throw Error(p(318));f=b.memoizedState;f=null!==f?f.dehydrated:null;if(!f)throw Error(p(317));f[Of]=b;}else Ig(),0===(b.flags&128)&&(b.memoizedState=null),b.flags|=4;S(b);f=!1;}else null!==zg&&(Gj(zg),zg=null),f=!0;if(!f)return b.flags&65536?b:null}if(0!==(b.flags&128))return b.lanes=c,b;d=null!==d;d!==(null!==a&&null!==a.memoizedState)&&d&&(b.child.flags|=8192,0!==(b.mode&1)&&(null===a||0!==(M.current&1)?0===T&&(T=3):uj()));null!==b.updateQueue&&(b.flags|=4);S(b);return null;case 4:return Jh(),
		Bj(a,b),null===a&&sf(b.stateNode.containerInfo),S(b),null;case 10:return Rg(b.type._context),S(b),null;case 17:return Zf(b.type)&&$f(),S(b),null;case 19:E(M);f=b.memoizedState;if(null===f)return S(b),null;d=0!==(b.flags&128);g=f.rendering;if(null===g)if(d)Ej(f,!1);else {if(0!==T||null!==a&&0!==(a.flags&128))for(a=b.child;null!==a;){g=Mh(a);if(null!==g){b.flags|=128;Ej(f,!1);d=g.updateQueue;null!==d&&(b.updateQueue=d,b.flags|=4);b.subtreeFlags=0;d=c;for(c=b.child;null!==c;)f=c,a=d,f.flags&=14680066,
		g=f.alternate,null===g?(f.childLanes=0,f.lanes=a,f.child=null,f.subtreeFlags=0,f.memoizedProps=null,f.memoizedState=null,f.updateQueue=null,f.dependencies=null,f.stateNode=null):(f.childLanes=g.childLanes,f.lanes=g.lanes,f.child=g.child,f.subtreeFlags=0,f.deletions=null,f.memoizedProps=g.memoizedProps,f.memoizedState=g.memoizedState,f.updateQueue=g.updateQueue,f.type=g.type,a=g.dependencies,f.dependencies=null===a?null:{lanes:a.lanes,firstContext:a.firstContext}),c=c.sibling;G(M,M.current&1|2);return b.child}a=
		a.sibling;}null!==f.tail&&B()>Hj&&(b.flags|=128,d=!0,Ej(f,!1),b.lanes=4194304);}else {if(!d)if(a=Mh(g),null!==a){if(b.flags|=128,d=!0,c=a.updateQueue,null!==c&&(b.updateQueue=c,b.flags|=4),Ej(f,!0),null===f.tail&&"hidden"===f.tailMode&&!g.alternate&&!I)return S(b),null}else 2*B()-f.renderingStartTime>Hj&&1073741824!==c&&(b.flags|=128,d=!0,Ej(f,!1),b.lanes=4194304);f.isBackwards?(g.sibling=b.child,b.child=g):(c=f.last,null!==c?c.sibling=g:b.child=g,f.last=g);}if(null!==f.tail)return b=f.tail,f.rendering=
		b,f.tail=b.sibling,f.renderingStartTime=B(),b.sibling=null,c=M.current,G(M,d?c&1|2:c&1),b;S(b);return null;case 22:case 23:return Ij(),d=null!==b.memoizedState,null!==a&&null!==a.memoizedState!==d&&(b.flags|=8192),d&&0!==(b.mode&1)?0!==(gj&1073741824)&&(S(b),b.subtreeFlags&6&&(b.flags|=8192)):S(b),null;case 24:return null;case 25:return null}throw Error(p(156,b.tag));}
		function Jj(a,b){wg(b);switch(b.tag){case 1:return Zf(b.type)&&$f(),a=b.flags,a&65536?(b.flags=a&-65537|128,b):null;case 3:return Jh(),E(Wf),E(H),Oh(),a=b.flags,0!==(a&65536)&&0===(a&128)?(b.flags=a&-65537|128,b):null;case 5:return Lh(b),null;case 13:E(M);a=b.memoizedState;if(null!==a&&null!==a.dehydrated){if(null===b.alternate)throw Error(p(340));Ig();}a=b.flags;return a&65536?(b.flags=a&-65537|128,b):null;case 19:return E(M),null;case 4:return Jh(),null;case 10:return Rg(b.type._context),null;case 22:case 23:return Ij(),
		null;case 24:return null;default:return null}}var Kj=!1,U=!1,Lj="function"===typeof WeakSet?WeakSet:Set,V=null;function Mj(a,b){var c=a.ref;if(null!==c)if("function"===typeof c)try{c(null);}catch(d){W(a,b,d);}else c.current=null;}function Nj(a,b,c){try{c();}catch(d){W(a,b,d);}}var Oj=!1;
		function Pj(a,b){Cf=dd;a=Me();if(Ne(a)){if("selectionStart"in a)var c={start:a.selectionStart,end:a.selectionEnd};else a:{c=(c=a.ownerDocument)&&c.defaultView||window;var d=c.getSelection&&c.getSelection();if(d&&0!==d.rangeCount){c=d.anchorNode;var e=d.anchorOffset,f=d.focusNode;d=d.focusOffset;try{c.nodeType,f.nodeType;}catch(F){c=null;break a}var g=0,h=-1,k=-1,l=0,m=0,q=a,r=null;b:for(;;){for(var y;;){q!==c||0!==e&&3!==q.nodeType||(h=g+e);q!==f||0!==d&&3!==q.nodeType||(k=g+d);3===q.nodeType&&(g+=
		q.nodeValue.length);if(null===(y=q.firstChild))break;r=q;q=y;}for(;;){if(q===a)break b;r===c&&++l===e&&(h=g);r===f&&++m===d&&(k=g);if(null!==(y=q.nextSibling))break;q=r;r=q.parentNode;}q=y;}c=-1===h||-1===k?null:{start:h,end:k};}else c=null;}c=c||{start:0,end:0};}else c=null;Df={focusedElem:a,selectionRange:c};dd=!1;for(V=b;null!==V;)if(b=V,a=b.child,0!==(b.subtreeFlags&1028)&&null!==a)a.return=b,V=a;else for(;null!==V;){b=V;try{var n=b.alternate;if(0!==(b.flags&1024))switch(b.tag){case 0:case 11:case 15:break;
		case 1:if(null!==n){var t=n.memoizedProps,J=n.memoizedState,x=b.stateNode,w=x.getSnapshotBeforeUpdate(b.elementType===b.type?t:Lg(b.type,t),J);x.__reactInternalSnapshotBeforeUpdate=w;}break;case 3:var u=b.stateNode.containerInfo;1===u.nodeType?u.textContent="":9===u.nodeType&&u.documentElement&&u.removeChild(u.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(p(163));}}catch(F){W(b,b.return,F);}a=b.sibling;if(null!==a){a.return=b.return;V=a;break}V=b.return;}n=Oj;Oj=!1;return n}
		function Qj(a,b,c){var d=b.updateQueue;d=null!==d?d.lastEffect:null;if(null!==d){var e=d=d.next;do{if((e.tag&a)===a){var f=e.destroy;e.destroy=void 0;void 0!==f&&Nj(b,c,f);}e=e.next;}while(e!==d)}}function Rj(a,b){b=b.updateQueue;b=null!==b?b.lastEffect:null;if(null!==b){var c=b=b.next;do{if((c.tag&a)===a){var d=c.create;c.destroy=d();}c=c.next;}while(c!==b)}}function Sj(a){var b=a.ref;if(null!==b){var c=a.stateNode;switch(a.tag){case 5:a=c;break;default:a=c;}"function"===typeof b?b(a):b.current=a;}}
		function Tj(a){var b=a.alternate;null!==b&&(a.alternate=null,Tj(b));a.child=null;a.deletions=null;a.sibling=null;5===a.tag&&(b=a.stateNode,null!==b&&(delete b[Of],delete b[Pf],delete b[of],delete b[Qf],delete b[Rf]));a.stateNode=null;a.return=null;a.dependencies=null;a.memoizedProps=null;a.memoizedState=null;a.pendingProps=null;a.stateNode=null;a.updateQueue=null;}function Uj(a){return 5===a.tag||3===a.tag||4===a.tag}
		function Vj(a){a:for(;;){for(;null===a.sibling;){if(null===a.return||Uj(a.return))return null;a=a.return;}a.sibling.return=a.return;for(a=a.sibling;5!==a.tag&&6!==a.tag&&18!==a.tag;){if(a.flags&2)continue a;if(null===a.child||4===a.tag)continue a;else a.child.return=a,a=a.child;}if(!(a.flags&2))return a.stateNode}}
		function Wj(a,b,c){var d=a.tag;if(5===d||6===d)a=a.stateNode,b?8===c.nodeType?c.parentNode.insertBefore(a,b):c.insertBefore(a,b):(8===c.nodeType?(b=c.parentNode,b.insertBefore(a,c)):(b=c,b.appendChild(a)),c=c._reactRootContainer,null!==c&&void 0!==c||null!==b.onclick||(b.onclick=Bf));else if(4!==d&&(a=a.child,null!==a))for(Wj(a,b,c),a=a.sibling;null!==a;)Wj(a,b,c),a=a.sibling;}
		function Xj(a,b,c){var d=a.tag;if(5===d||6===d)a=a.stateNode,b?c.insertBefore(a,b):c.appendChild(a);else if(4!==d&&(a=a.child,null!==a))for(Xj(a,b,c),a=a.sibling;null!==a;)Xj(a,b,c),a=a.sibling;}var X=null,Yj=!1;function Zj(a,b,c){for(c=c.child;null!==c;)ak(a,b,c),c=c.sibling;}
		function ak(a,b,c){if(lc&&"function"===typeof lc.onCommitFiberUnmount)try{lc.onCommitFiberUnmount(kc,c);}catch(h){}switch(c.tag){case 5:U||Mj(c,b);case 6:var d=X,e=Yj;X=null;Zj(a,b,c);X=d;Yj=e;null!==X&&(Yj?(a=X,c=c.stateNode,8===a.nodeType?a.parentNode.removeChild(c):a.removeChild(c)):X.removeChild(c.stateNode));break;case 18:null!==X&&(Yj?(a=X,c=c.stateNode,8===a.nodeType?Kf(a.parentNode,c):1===a.nodeType&&Kf(a,c),bd(a)):Kf(X,c.stateNode));break;case 4:d=X;e=Yj;X=c.stateNode.containerInfo;Yj=!0;
		Zj(a,b,c);X=d;Yj=e;break;case 0:case 11:case 14:case 15:if(!U&&(d=c.updateQueue,null!==d&&(d=d.lastEffect,null!==d))){e=d=d.next;do{var f=e,g=f.destroy;f=f.tag;void 0!==g&&(0!==(f&2)?Nj(c,b,g):0!==(f&4)&&Nj(c,b,g));e=e.next;}while(e!==d)}Zj(a,b,c);break;case 1:if(!U&&(Mj(c,b),d=c.stateNode,"function"===typeof d.componentWillUnmount))try{d.props=c.memoizedProps,d.state=c.memoizedState,d.componentWillUnmount();}catch(h){W(c,b,h);}Zj(a,b,c);break;case 21:Zj(a,b,c);break;case 22:c.mode&1?(U=(d=U)||null!==
		c.memoizedState,Zj(a,b,c),U=d):Zj(a,b,c);break;default:Zj(a,b,c);}}function bk(a){var b=a.updateQueue;if(null!==b){a.updateQueue=null;var c=a.stateNode;null===c&&(c=a.stateNode=new Lj);b.forEach(function(b){var d=ck.bind(null,a,b);c.has(b)||(c.add(b),b.then(d,d));});}}
		function dk(a,b){var c=b.deletions;if(null!==c)for(var d=0;d<c.length;d++){var e=c[d];try{var f=a,g=b,h=g;a:for(;null!==h;){switch(h.tag){case 5:X=h.stateNode;Yj=!1;break a;case 3:X=h.stateNode.containerInfo;Yj=!0;break a;case 4:X=h.stateNode.containerInfo;Yj=!0;break a}h=h.return;}if(null===X)throw Error(p(160));ak(f,g,e);X=null;Yj=!1;var k=e.alternate;null!==k&&(k.return=null);e.return=null;}catch(l){W(e,b,l);}}if(b.subtreeFlags&12854)for(b=b.child;null!==b;)ek(b,a),b=b.sibling;}
		function ek(a,b){var c=a.alternate,d=a.flags;switch(a.tag){case 0:case 11:case 14:case 15:dk(b,a);fk(a);if(d&4){try{Qj(3,a,a.return),Rj(3,a);}catch(t){W(a,a.return,t);}try{Qj(5,a,a.return);}catch(t){W(a,a.return,t);}}break;case 1:dk(b,a);fk(a);d&512&&null!==c&&Mj(c,c.return);break;case 5:dk(b,a);fk(a);d&512&&null!==c&&Mj(c,c.return);if(a.flags&32){var e=a.stateNode;try{ob(e,"");}catch(t){W(a,a.return,t);}}if(d&4&&(e=a.stateNode,null!=e)){var f=a.memoizedProps,g=null!==c?c.memoizedProps:f,h=a.type,k=a.updateQueue;
		a.updateQueue=null;if(null!==k)try{"input"===h&&"radio"===f.type&&null!=f.name&&ab(e,f);vb(h,g);var l=vb(h,f);for(g=0;g<k.length;g+=2){var m=k[g],q=k[g+1];"style"===m?sb(e,q):"dangerouslySetInnerHTML"===m?nb(e,q):"children"===m?ob(e,q):ta(e,m,q,l);}switch(h){case "input":bb(e,f);break;case "textarea":ib(e,f);break;case "select":var r=e._wrapperState.wasMultiple;e._wrapperState.wasMultiple=!!f.multiple;var y=f.value;null!=y?fb(e,!!f.multiple,y,!1):r!==!!f.multiple&&(null!=f.defaultValue?fb(e,!!f.multiple,
		f.defaultValue,!0):fb(e,!!f.multiple,f.multiple?[]:"",!1));}e[Pf]=f;}catch(t){W(a,a.return,t);}}break;case 6:dk(b,a);fk(a);if(d&4){if(null===a.stateNode)throw Error(p(162));e=a.stateNode;f=a.memoizedProps;try{e.nodeValue=f;}catch(t){W(a,a.return,t);}}break;case 3:dk(b,a);fk(a);if(d&4&&null!==c&&c.memoizedState.isDehydrated)try{bd(b.containerInfo);}catch(t){W(a,a.return,t);}break;case 4:dk(b,a);fk(a);break;case 13:dk(b,a);fk(a);e=a.child;e.flags&8192&&(f=null!==e.memoizedState,e.stateNode.isHidden=f,!f||
		null!==e.alternate&&null!==e.alternate.memoizedState||(gk=B()));d&4&&bk(a);break;case 22:m=null!==c&&null!==c.memoizedState;a.mode&1?(U=(l=U)||m,dk(b,a),U=l):dk(b,a);fk(a);if(d&8192){l=null!==a.memoizedState;if((a.stateNode.isHidden=l)&&!m&&0!==(a.mode&1))for(V=a,m=a.child;null!==m;){for(q=V=m;null!==V;){r=V;y=r.child;switch(r.tag){case 0:case 11:case 14:case 15:Qj(4,r,r.return);break;case 1:Mj(r,r.return);var n=r.stateNode;if("function"===typeof n.componentWillUnmount){d=r;c=r.return;try{b=d,n.props=
		b.memoizedProps,n.state=b.memoizedState,n.componentWillUnmount();}catch(t){W(d,c,t);}}break;case 5:Mj(r,r.return);break;case 22:if(null!==r.memoizedState){hk(q);continue}}null!==y?(y.return=r,V=y):hk(q);}m=m.sibling;}a:for(m=null,q=a;;){if(5===q.tag){if(null===m){m=q;try{e=q.stateNode,l?(f=e.style,"function"===typeof f.setProperty?f.setProperty("display","none","important"):f.display="none"):(h=q.stateNode,k=q.memoizedProps.style,g=void 0!==k&&null!==k&&k.hasOwnProperty("display")?k.display:null,h.style.display=
		rb("display",g));}catch(t){W(a,a.return,t);}}}else if(6===q.tag){if(null===m)try{q.stateNode.nodeValue=l?"":q.memoizedProps;}catch(t){W(a,a.return,t);}}else if((22!==q.tag&&23!==q.tag||null===q.memoizedState||q===a)&&null!==q.child){q.child.return=q;q=q.child;continue}if(q===a)break a;for(;null===q.sibling;){if(null===q.return||q.return===a)break a;m===q&&(m=null);q=q.return;}m===q&&(m=null);q.sibling.return=q.return;q=q.sibling;}}break;case 19:dk(b,a);fk(a);d&4&&bk(a);break;case 21:break;default:dk(b,
		a),fk(a);}}function fk(a){var b=a.flags;if(b&2){try{a:{for(var c=a.return;null!==c;){if(Uj(c)){var d=c;break a}c=c.return;}throw Error(p(160));}switch(d.tag){case 5:var e=d.stateNode;d.flags&32&&(ob(e,""),d.flags&=-33);var f=Vj(a);Xj(a,f,e);break;case 3:case 4:var g=d.stateNode.containerInfo,h=Vj(a);Wj(a,h,g);break;default:throw Error(p(161));}}catch(k){W(a,a.return,k);}a.flags&=-3;}b&4096&&(a.flags&=-4097);}function ik(a,b,c){V=a;jk(a);}
		function jk(a,b,c){for(var d=0!==(a.mode&1);null!==V;){var e=V,f=e.child;if(22===e.tag&&d){var g=null!==e.memoizedState||Kj;if(!g){var h=e.alternate,k=null!==h&&null!==h.memoizedState||U;h=Kj;var l=U;Kj=g;if((U=k)&&!l)for(V=e;null!==V;)g=V,k=g.child,22===g.tag&&null!==g.memoizedState?kk(e):null!==k?(k.return=g,V=k):kk(e);for(;null!==f;)V=f,jk(f),f=f.sibling;V=e;Kj=h;U=l;}lk(a);}else 0!==(e.subtreeFlags&8772)&&null!==f?(f.return=e,V=f):lk(a);}}
		function lk(a){for(;null!==V;){var b=V;if(0!==(b.flags&8772)){var c=b.alternate;try{if(0!==(b.flags&8772))switch(b.tag){case 0:case 11:case 15:U||Rj(5,b);break;case 1:var d=b.stateNode;if(b.flags&4&&!U)if(null===c)d.componentDidMount();else {var e=b.elementType===b.type?c.memoizedProps:Lg(b.type,c.memoizedProps);d.componentDidUpdate(e,c.memoizedState,d.__reactInternalSnapshotBeforeUpdate);}var f=b.updateQueue;null!==f&&ih(b,f,d);break;case 3:var g=b.updateQueue;if(null!==g){c=null;if(null!==b.child)switch(b.child.tag){case 5:c=
		b.child.stateNode;break;case 1:c=b.child.stateNode;}ih(b,g,c);}break;case 5:var h=b.stateNode;if(null===c&&b.flags&4){c=h;var k=b.memoizedProps;switch(b.type){case "button":case "input":case "select":case "textarea":k.autoFocus&&c.focus();break;case "img":k.src&&(c.src=k.src);}}break;case 6:break;case 4:break;case 12:break;case 13:if(null===b.memoizedState){var l=b.alternate;if(null!==l){var m=l.memoizedState;if(null!==m){var q=m.dehydrated;null!==q&&bd(q);}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;
		default:throw Error(p(163));}U||b.flags&512&&Sj(b);}catch(r){W(b,b.return,r);}}if(b===a){V=null;break}c=b.sibling;if(null!==c){c.return=b.return;V=c;break}V=b.return;}}function hk(a){for(;null!==V;){var b=V;if(b===a){V=null;break}var c=b.sibling;if(null!==c){c.return=b.return;V=c;break}V=b.return;}}
		function kk(a){for(;null!==V;){var b=V;try{switch(b.tag){case 0:case 11:case 15:var c=b.return;try{Rj(4,b);}catch(k){W(b,c,k);}break;case 1:var d=b.stateNode;if("function"===typeof d.componentDidMount){var e=b.return;try{d.componentDidMount();}catch(k){W(b,e,k);}}var f=b.return;try{Sj(b);}catch(k){W(b,f,k);}break;case 5:var g=b.return;try{Sj(b);}catch(k){W(b,g,k);}}}catch(k){W(b,b.return,k);}if(b===a){V=null;break}var h=b.sibling;if(null!==h){h.return=b.return;V=h;break}V=b.return;}}
		var mk=Math.ceil,nk=ua.ReactCurrentDispatcher,ok=ua.ReactCurrentOwner,pk=ua.ReactCurrentBatchConfig,K=0,R=null,Y=null,Z=0,gj=0,fj=Uf(0),T=0,qk=null,hh=0,rk=0,sk=0,tk=null,uk=null,gk=0,Hj=Infinity,vk=null,Pi=!1,Qi=null,Si=null,wk=!1,xk=null,yk=0,zk=0,Ak=null,Bk=-1,Ck=0;function L(){return 0!==(K&6)?B():-1!==Bk?Bk:Bk=B()}
		function lh(a){if(0===(a.mode&1))return 1;if(0!==(K&2)&&0!==Z)return Z&-Z;if(null!==Kg.transition)return 0===Ck&&(Ck=yc()),Ck;a=C;if(0!==a)return a;a=window.event;a=void 0===a?16:jd(a.type);return a}function mh(a,b,c,d){if(50<zk)throw zk=0,Ak=null,Error(p(185));Ac(a,c,d);if(0===(K&2)||a!==R)a===R&&(0===(K&2)&&(rk|=c),4===T&&Dk(a,Z)),Ek(a,d),1===c&&0===K&&0===(b.mode&1)&&(Hj=B()+500,fg&&jg());}
		function Ek(a,b){var c=a.callbackNode;wc(a,b);var d=uc(a,a===R?Z:0);if(0===d)null!==c&&bc(c),a.callbackNode=null,a.callbackPriority=0;else if(b=d&-d,a.callbackPriority!==b){null!=c&&bc(c);if(1===b)0===a.tag?ig(Fk.bind(null,a)):hg(Fk.bind(null,a)),Jf(function(){0===(K&6)&&jg();}),c=null;else {switch(Dc(d)){case 1:c=fc;break;case 4:c=gc;break;case 16:c=hc;break;case 536870912:c=jc;break;default:c=hc;}c=Gk(c,Hk.bind(null,a));}a.callbackPriority=b;a.callbackNode=c;}}
		function Hk(a,b){Bk=-1;Ck=0;if(0!==(K&6))throw Error(p(327));var c=a.callbackNode;if(Ik()&&a.callbackNode!==c)return null;var d=uc(a,a===R?Z:0);if(0===d)return null;if(0!==(d&30)||0!==(d&a.expiredLanes)||b)b=Jk(a,d);else {b=d;var e=K;K|=2;var f=Kk();if(R!==a||Z!==b)vk=null,Hj=B()+500,Lk(a,b);do try{Mk();break}catch(h){Nk(a,h);}while(1);Qg();nk.current=f;K=e;null!==Y?b=0:(R=null,Z=0,b=T);}if(0!==b){2===b&&(e=xc(a),0!==e&&(d=e,b=Ok(a,e)));if(1===b)throw c=qk,Lk(a,0),Dk(a,d),Ek(a,B()),c;if(6===b)Dk(a,d);
		else {e=a.current.alternate;if(0===(d&30)&&!Pk(e)&&(b=Jk(a,d),2===b&&(f=xc(a),0!==f&&(d=f,b=Ok(a,f))),1===b))throw c=qk,Lk(a,0),Dk(a,d),Ek(a,B()),c;a.finishedWork=e;a.finishedLanes=d;switch(b){case 0:case 1:throw Error(p(345));case 2:Qk(a,uk,vk);break;case 3:Dk(a,d);if((d&130023424)===d&&(b=gk+500-B(),10<b)){if(0!==uc(a,0))break;e=a.suspendedLanes;if((e&d)!==d){L();a.pingedLanes|=a.suspendedLanes&e;break}a.timeoutHandle=Ff(Qk.bind(null,a,uk,vk),b);break}Qk(a,uk,vk);break;case 4:Dk(a,d);if((d&4194240)===
		d)break;b=a.eventTimes;for(e=-1;0<d;){var g=31-oc(d);f=1<<g;g=b[g];g>e&&(e=g);d&=~f;}d=e;d=B()-d;d=(120>d?120:480>d?480:1080>d?1080:1920>d?1920:3E3>d?3E3:4320>d?4320:1960*mk(d/1960))-d;if(10<d){a.timeoutHandle=Ff(Qk.bind(null,a,uk,vk),d);break}Qk(a,uk,vk);break;case 5:Qk(a,uk,vk);break;default:throw Error(p(329));}}}Ek(a,B());return a.callbackNode===c?Hk.bind(null,a):null}
		function Ok(a,b){var c=tk;a.current.memoizedState.isDehydrated&&(Lk(a,b).flags|=256);a=Jk(a,b);2!==a&&(b=uk,uk=c,null!==b&&Gj(b));return a}function Gj(a){null===uk?uk=a:uk.push.apply(uk,a);}
		function Pk(a){for(var b=a;;){if(b.flags&16384){var c=b.updateQueue;if(null!==c&&(c=c.stores,null!==c))for(var d=0;d<c.length;d++){var e=c[d],f=e.getSnapshot;e=e.value;try{if(!He(f(),e))return !1}catch(g){return !1}}}c=b.child;if(b.subtreeFlags&16384&&null!==c)c.return=b,b=c;else {if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return !0;b=b.return;}b.sibling.return=b.return;b=b.sibling;}}return !0}
		function Dk(a,b){b&=~sk;b&=~rk;a.suspendedLanes|=b;a.pingedLanes&=~b;for(a=a.expirationTimes;0<b;){var c=31-oc(b),d=1<<c;a[c]=-1;b&=~d;}}function Fk(a){if(0!==(K&6))throw Error(p(327));Ik();var b=uc(a,0);if(0===(b&1))return Ek(a,B()),null;var c=Jk(a,b);if(0!==a.tag&&2===c){var d=xc(a);0!==d&&(b=d,c=Ok(a,d));}if(1===c)throw c=qk,Lk(a,0),Dk(a,b),Ek(a,B()),c;if(6===c)throw Error(p(345));a.finishedWork=a.current.alternate;a.finishedLanes=b;Qk(a,uk,vk);Ek(a,B());return null}
		function Rk(a,b){var c=K;K|=1;try{return a(b)}finally{K=c,0===K&&(Hj=B()+500,fg&&jg());}}function Sk(a){null!==xk&&0===xk.tag&&0===(K&6)&&Ik();var b=K;K|=1;var c=pk.transition,d=C;try{if(pk.transition=null,C=1,a)return a()}finally{C=d,pk.transition=c,K=b,0===(K&6)&&jg();}}function Ij(){gj=fj.current;E(fj);}
		function Lk(a,b){a.finishedWork=null;a.finishedLanes=0;var c=a.timeoutHandle;-1!==c&&(a.timeoutHandle=-1,Gf(c));if(null!==Y)for(c=Y.return;null!==c;){var d=c;wg(d);switch(d.tag){case 1:d=d.type.childContextTypes;null!==d&&void 0!==d&&$f();break;case 3:Jh();E(Wf);E(H);Oh();break;case 5:Lh(d);break;case 4:Jh();break;case 13:E(M);break;case 19:E(M);break;case 10:Rg(d.type._context);break;case 22:case 23:Ij();}c=c.return;}R=a;Y=a=wh(a.current,null);Z=gj=b;T=0;qk=null;sk=rk=hh=0;uk=tk=null;if(null!==Wg){for(b=
		0;b<Wg.length;b++)if(c=Wg[b],d=c.interleaved,null!==d){c.interleaved=null;var e=d.next,f=c.pending;if(null!==f){var g=f.next;f.next=e;d.next=g;}c.pending=d;}Wg=null;}return a}
		function Nk(a,b){do{var c=Y;try{Qg();Ph.current=ai;if(Sh){for(var d=N.memoizedState;null!==d;){var e=d.queue;null!==e&&(e.pending=null);d=d.next;}Sh=!1;}Rh=0;P=O=N=null;Th=!1;Uh=0;ok.current=null;if(null===c||null===c.return){T=1;qk=b;Y=null;break}a:{var f=a,g=c.return,h=c,k=b;b=Z;h.flags|=32768;if(null!==k&&"object"===typeof k&&"function"===typeof k.then){var l=k,m=h,q=m.tag;if(0===(m.mode&1)&&(0===q||11===q||15===q)){var r=m.alternate;r?(m.updateQueue=r.updateQueue,m.memoizedState=r.memoizedState,
		m.lanes=r.lanes):(m.updateQueue=null,m.memoizedState=null);}var y=Vi(g);if(null!==y){y.flags&=-257;Wi(y,g,h,f,b);y.mode&1&&Ti(f,l,b);b=y;k=l;var n=b.updateQueue;if(null===n){var t=new Set;t.add(k);b.updateQueue=t;}else n.add(k);break a}else {if(0===(b&1)){Ti(f,l,b);uj();break a}k=Error(p(426));}}else if(I&&h.mode&1){var J=Vi(g);if(null!==J){0===(J.flags&65536)&&(J.flags|=256);Wi(J,g,h,f,b);Jg(Ki(k,h));break a}}f=k=Ki(k,h);4!==T&&(T=2);null===tk?tk=[f]:tk.push(f);f=g;do{switch(f.tag){case 3:f.flags|=65536;
		b&=-b;f.lanes|=b;var x=Oi(f,k,b);fh(f,x);break a;case 1:h=k;var w=f.type,u=f.stateNode;if(0===(f.flags&128)&&("function"===typeof w.getDerivedStateFromError||null!==u&&"function"===typeof u.componentDidCatch&&(null===Si||!Si.has(u)))){f.flags|=65536;b&=-b;f.lanes|=b;var F=Ri(f,h,b);fh(f,F);break a}}f=f.return;}while(null!==f)}Tk(c);}catch(na){b=na;Y===c&&null!==c&&(Y=c=c.return);continue}break}while(1)}function Kk(){var a=nk.current;nk.current=ai;return null===a?ai:a}
		function uj(){if(0===T||3===T||2===T)T=4;null===R||0===(hh&268435455)&&0===(rk&268435455)||Dk(R,Z);}function Jk(a,b){var c=K;K|=2;var d=Kk();if(R!==a||Z!==b)vk=null,Lk(a,b);do try{Uk();break}catch(e){Nk(a,e);}while(1);Qg();K=c;nk.current=d;if(null!==Y)throw Error(p(261));R=null;Z=0;return T}function Uk(){for(;null!==Y;)Vk(Y);}function Mk(){for(;null!==Y&&!cc();)Vk(Y);}function Vk(a){var b=Wk(a.alternate,a,gj);a.memoizedProps=a.pendingProps;null===b?Tk(a):Y=b;ok.current=null;}
		function Tk(a){var b=a;do{var c=b.alternate;a=b.return;if(0===(b.flags&32768)){if(c=Fj(c,b,gj),null!==c){Y=c;return}}else {c=Jj(c,b);if(null!==c){c.flags&=32767;Y=c;return}if(null!==a)a.flags|=32768,a.subtreeFlags=0,a.deletions=null;else {T=6;Y=null;return}}b=b.sibling;if(null!==b){Y=b;return}Y=b=a;}while(null!==b);0===T&&(T=5);}function Qk(a,b,c){var d=C,e=pk.transition;try{pk.transition=null,C=1,Xk(a,b,c,d);}finally{pk.transition=e,C=d;}return null}
		function Xk(a,b,c,d){do Ik();while(null!==xk);if(0!==(K&6))throw Error(p(327));c=a.finishedWork;var e=a.finishedLanes;if(null===c)return null;a.finishedWork=null;a.finishedLanes=0;if(c===a.current)throw Error(p(177));a.callbackNode=null;a.callbackPriority=0;var f=c.lanes|c.childLanes;Bc(a,f);a===R&&(Y=R=null,Z=0);0===(c.subtreeFlags&2064)&&0===(c.flags&2064)||wk||(wk=!0,Gk(hc,function(){Ik();return null}));f=0!==(c.flags&15990);if(0!==(c.subtreeFlags&15990)||f){f=pk.transition;pk.transition=null;
		var g=C;C=1;var h=K;K|=4;ok.current=null;Pj(a,c);ek(c,a);Oe(Df);dd=!!Cf;Df=Cf=null;a.current=c;ik(c);dc();K=h;C=g;pk.transition=f;}else a.current=c;wk&&(wk=!1,xk=a,yk=e);f=a.pendingLanes;0===f&&(Si=null);mc(c.stateNode);Ek(a,B());if(null!==b)for(d=a.onRecoverableError,c=0;c<b.length;c++)e=b[c],d(e.value,{componentStack:e.stack,digest:e.digest});if(Pi)throw Pi=!1,a=Qi,Qi=null,a;0!==(yk&1)&&0!==a.tag&&Ik();f=a.pendingLanes;0!==(f&1)?a===Ak?zk++:(zk=0,Ak=a):zk=0;jg();return null}
		function Ik(){if(null!==xk){var a=Dc(yk),b=pk.transition,c=C;try{pk.transition=null;C=16>a?16:a;if(null===xk)var d=!1;else {a=xk;xk=null;yk=0;if(0!==(K&6))throw Error(p(331));var e=K;K|=4;for(V=a.current;null!==V;){var f=V,g=f.child;if(0!==(V.flags&16)){var h=f.deletions;if(null!==h){for(var k=0;k<h.length;k++){var l=h[k];for(V=l;null!==V;){var m=V;switch(m.tag){case 0:case 11:case 15:Qj(8,m,f);}var q=m.child;if(null!==q)q.return=m,V=q;else for(;null!==V;){m=V;var r=m.sibling,y=m.return;Tj(m);if(m===
		l){V=null;break}if(null!==r){r.return=y;V=r;break}V=y;}}}var n=f.alternate;if(null!==n){var t=n.child;if(null!==t){n.child=null;do{var J=t.sibling;t.sibling=null;t=J;}while(null!==t)}}V=f;}}if(0!==(f.subtreeFlags&2064)&&null!==g)g.return=f,V=g;else b:for(;null!==V;){f=V;if(0!==(f.flags&2048))switch(f.tag){case 0:case 11:case 15:Qj(9,f,f.return);}var x=f.sibling;if(null!==x){x.return=f.return;V=x;break b}V=f.return;}}var w=a.current;for(V=w;null!==V;){g=V;var u=g.child;if(0!==(g.subtreeFlags&2064)&&null!==
		u)u.return=g,V=u;else b:for(g=w;null!==V;){h=V;if(0!==(h.flags&2048))try{switch(h.tag){case 0:case 11:case 15:Rj(9,h);}}catch(na){W(h,h.return,na);}if(h===g){V=null;break b}var F=h.sibling;if(null!==F){F.return=h.return;V=F;break b}V=h.return;}}K=e;jg();if(lc&&"function"===typeof lc.onPostCommitFiberRoot)try{lc.onPostCommitFiberRoot(kc,a);}catch(na){}d=!0;}return d}finally{C=c,pk.transition=b;}}return !1}function Yk(a,b,c){b=Ki(c,b);b=Oi(a,b,1);a=dh(a,b,1);b=L();null!==a&&(Ac(a,1,b),Ek(a,b));}
		function W(a,b,c){if(3===a.tag)Yk(a,a,c);else for(;null!==b;){if(3===b.tag){Yk(b,a,c);break}else if(1===b.tag){var d=b.stateNode;if("function"===typeof b.type.getDerivedStateFromError||"function"===typeof d.componentDidCatch&&(null===Si||!Si.has(d))){a=Ki(c,a);a=Ri(b,a,1);b=dh(b,a,1);a=L();null!==b&&(Ac(b,1,a),Ek(b,a));break}}b=b.return;}}
		function Ui(a,b,c){var d=a.pingCache;null!==d&&d.delete(b);b=L();a.pingedLanes|=a.suspendedLanes&c;R===a&&(Z&c)===c&&(4===T||3===T&&(Z&130023424)===Z&&500>B()-gk?Lk(a,0):sk|=c);Ek(a,b);}function Zk(a,b){0===b&&(0===(a.mode&1)?b=1:(b=sc,sc<<=1,0===(sc&130023424)&&(sc=4194304)));var c=L();a=Zg(a,b);null!==a&&(Ac(a,b,c),Ek(a,c));}function vj(a){var b=a.memoizedState,c=0;null!==b&&(c=b.retryLane);Zk(a,c);}
		function ck(a,b){var c=0;switch(a.tag){case 13:var d=a.stateNode;var e=a.memoizedState;null!==e&&(c=e.retryLane);break;case 19:d=a.stateNode;break;default:throw Error(p(314));}null!==d&&d.delete(b);Zk(a,c);}var Wk;
		Wk=function(a,b,c){if(null!==a)if(a.memoizedProps!==b.pendingProps||Wf.current)Ug=!0;else {if(0===(a.lanes&c)&&0===(b.flags&128))return Ug=!1,zj(a,b,c);Ug=0!==(a.flags&131072)?!0:!1;}else Ug=!1,I&&0!==(b.flags&1048576)&&ug(b,ng,b.index);b.lanes=0;switch(b.tag){case 2:var d=b.type;jj(a,b);a=b.pendingProps;var e=Yf(b,H.current);Tg(b,c);e=Xh(null,b,d,a,e,c);var f=bi();b.flags|=1;"object"===typeof e&&null!==e&&"function"===typeof e.render&&void 0===e.$$typeof?(b.tag=1,b.memoizedState=null,b.updateQueue=
		null,Zf(d)?(f=!0,cg(b)):f=!1,b.memoizedState=null!==e.state&&void 0!==e.state?e.state:null,ah(b),e.updater=nh,b.stateNode=e,e._reactInternals=b,rh(b,d,a,c),b=kj(null,b,d,!0,f,c)):(b.tag=0,I&&f&&vg(b),Yi(null,b,e,c),b=b.child);return b;case 16:d=b.elementType;a:{jj(a,b);a=b.pendingProps;e=d._init;d=e(d._payload);b.type=d;e=b.tag=$k(d);a=Lg(d,a);switch(e){case 0:b=dj(null,b,d,a,c);break a;case 1:b=ij(null,b,d,a,c);break a;case 11:b=Zi(null,b,d,a,c);break a;case 14:b=aj(null,b,d,Lg(d.type,a),c);break a}throw Error(p(306,
		d,""));}return b;case 0:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Lg(d,e),dj(a,b,d,e,c);case 1:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Lg(d,e),ij(a,b,d,e,c);case 3:a:{lj(b);if(null===a)throw Error(p(387));d=b.pendingProps;f=b.memoizedState;e=f.element;bh(a,b);gh(b,d,null,c);var g=b.memoizedState;d=g.element;if(f.isDehydrated)if(f={element:d,isDehydrated:!1,cache:g.cache,pendingSuspenseBoundaries:g.pendingSuspenseBoundaries,transitions:g.transitions},b.updateQueue.baseState=
		f,b.memoizedState=f,b.flags&256){e=Ki(Error(p(423)),b);b=mj(a,b,d,c,e);break a}else if(d!==e){e=Ki(Error(p(424)),b);b=mj(a,b,d,c,e);break a}else for(yg=Lf(b.stateNode.containerInfo.firstChild),xg=b,I=!0,zg=null,c=Ch(b,null,d,c),b.child=c;c;)c.flags=c.flags&-3|4096,c=c.sibling;else {Ig();if(d===e){b=$i(a,b,c);break a}Yi(a,b,d,c);}b=b.child;}return b;case 5:return Kh(b),null===a&&Eg(b),d=b.type,e=b.pendingProps,f=null!==a?a.memoizedProps:null,g=e.children,Ef(d,e)?g=null:null!==f&&Ef(d,f)&&(b.flags|=32),
		hj(a,b),Yi(a,b,g,c),b.child;case 6:return null===a&&Eg(b),null;case 13:return pj(a,b,c);case 4:return Ih(b,b.stateNode.containerInfo),d=b.pendingProps,null===a?b.child=Bh(b,null,d,c):Yi(a,b,d,c),b.child;case 11:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Lg(d,e),Zi(a,b,d,e,c);case 7:return Yi(a,b,b.pendingProps,c),b.child;case 8:return Yi(a,b,b.pendingProps.children,c),b.child;case 12:return Yi(a,b,b.pendingProps.children,c),b.child;case 10:a:{d=b.type._context;e=b.pendingProps;f=b.memoizedProps;
		g=e.value;G(Mg,d._currentValue);d._currentValue=g;if(null!==f)if(He(f.value,g)){if(f.children===e.children&&!Wf.current){b=$i(a,b,c);break a}}else for(f=b.child,null!==f&&(f.return=b);null!==f;){var h=f.dependencies;if(null!==h){g=f.child;for(var k=h.firstContext;null!==k;){if(k.context===d){if(1===f.tag){k=ch(-1,c&-c);k.tag=2;var l=f.updateQueue;if(null!==l){l=l.shared;var m=l.pending;null===m?k.next=k:(k.next=m.next,m.next=k);l.pending=k;}}f.lanes|=c;k=f.alternate;null!==k&&(k.lanes|=c);Sg(f.return,
		c,b);h.lanes|=c;break}k=k.next;}}else if(10===f.tag)g=f.type===b.type?null:f.child;else if(18===f.tag){g=f.return;if(null===g)throw Error(p(341));g.lanes|=c;h=g.alternate;null!==h&&(h.lanes|=c);Sg(g,c,b);g=f.sibling;}else g=f.child;if(null!==g)g.return=f;else for(g=f;null!==g;){if(g===b){g=null;break}f=g.sibling;if(null!==f){f.return=g.return;g=f;break}g=g.return;}f=g;}Yi(a,b,e.children,c);b=b.child;}return b;case 9:return e=b.type,d=b.pendingProps.children,Tg(b,c),e=Vg(e),d=d(e),b.flags|=1,Yi(a,b,d,c),
		b.child;case 14:return d=b.type,e=Lg(d,b.pendingProps),e=Lg(d.type,e),aj(a,b,d,e,c);case 15:return cj(a,b,b.type,b.pendingProps,c);case 17:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:Lg(d,e),jj(a,b),b.tag=1,Zf(d)?(a=!0,cg(b)):a=!1,Tg(b,c),ph(b,d,e),rh(b,d,e,c),kj(null,b,d,!0,a,c);case 19:return yj(a,b,c);case 22:return ej(a,b,c)}throw Error(p(156,b.tag));};function Gk(a,b){return ac(a,b)}
		function al(a,b,c,d){this.tag=a;this.key=c;this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null;this.index=0;this.ref=null;this.pendingProps=b;this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null;this.mode=d;this.subtreeFlags=this.flags=0;this.deletions=null;this.childLanes=this.lanes=0;this.alternate=null;}function Bg(a,b,c,d){return new al(a,b,c,d)}function bj(a){a=a.prototype;return !(!a||!a.isReactComponent)}
		function $k(a){if("function"===typeof a)return bj(a)?1:0;if(void 0!==a&&null!==a){a=a.$$typeof;if(a===Da)return 11;if(a===Ga)return 14}return 2}
		function wh(a,b){var c=a.alternate;null===c?(c=Bg(a.tag,b,a.key,a.mode),c.elementType=a.elementType,c.type=a.type,c.stateNode=a.stateNode,c.alternate=a,a.alternate=c):(c.pendingProps=b,c.type=a.type,c.flags=0,c.subtreeFlags=0,c.deletions=null);c.flags=a.flags&14680064;c.childLanes=a.childLanes;c.lanes=a.lanes;c.child=a.child;c.memoizedProps=a.memoizedProps;c.memoizedState=a.memoizedState;c.updateQueue=a.updateQueue;b=a.dependencies;c.dependencies=null===b?null:{lanes:b.lanes,firstContext:b.firstContext};
		c.sibling=a.sibling;c.index=a.index;c.ref=a.ref;return c}
		function yh(a,b,c,d,e,f){var g=2;d=a;if("function"===typeof a)bj(a)&&(g=1);else if("string"===typeof a)g=5;else a:switch(a){case ya:return Ah(c.children,e,f,b);case za:g=8;e|=8;break;case Aa:return a=Bg(12,c,b,e|2),a.elementType=Aa,a.lanes=f,a;case Ea:return a=Bg(13,c,b,e),a.elementType=Ea,a.lanes=f,a;case Fa:return a=Bg(19,c,b,e),a.elementType=Fa,a.lanes=f,a;case Ia:return qj(c,e,f,b);default:if("object"===typeof a&&null!==a)switch(a.$$typeof){case Ba:g=10;break a;case Ca:g=9;break a;case Da:g=11;
		break a;case Ga:g=14;break a;case Ha:g=16;d=null;break a}throw Error(p(130,null==a?a:typeof a,""));}b=Bg(g,c,b,e);b.elementType=a;b.type=d;b.lanes=f;return b}function Ah(a,b,c,d){a=Bg(7,a,d,b);a.lanes=c;return a}function qj(a,b,c,d){a=Bg(22,a,d,b);a.elementType=Ia;a.lanes=c;a.stateNode={isHidden:!1};return a}function xh(a,b,c){a=Bg(6,a,null,b);a.lanes=c;return a}
		function zh(a,b,c){b=Bg(4,null!==a.children?a.children:[],a.key,b);b.lanes=c;b.stateNode={containerInfo:a.containerInfo,pendingChildren:null,implementation:a.implementation};return b}
		function bl(a,b,c,d,e){this.tag=b;this.containerInfo=a;this.finishedWork=this.pingCache=this.current=this.pendingChildren=null;this.timeoutHandle=-1;this.callbackNode=this.pendingContext=this.context=null;this.callbackPriority=0;this.eventTimes=zc(0);this.expirationTimes=zc(-1);this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0;this.entanglements=zc(0);this.identifierPrefix=d;this.onRecoverableError=e;this.mutableSourceEagerHydrationData=
		null;}function cl(a,b,c,d,e,f,g,h,k){a=new bl(a,b,c,h,k);1===b?(b=1,!0===f&&(b|=8)):b=0;f=Bg(3,null,null,b);a.current=f;f.stateNode=a;f.memoizedState={element:d,isDehydrated:c,cache:null,transitions:null,pendingSuspenseBoundaries:null};ah(f);return a}function dl(a,b,c){var d=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;return {$$typeof:wa,key:null==d?null:""+d,children:a,containerInfo:b,implementation:c}}
		function el(a){if(!a)return Vf;a=a._reactInternals;a:{if(Vb(a)!==a||1!==a.tag)throw Error(p(170));var b=a;do{switch(b.tag){case 3:b=b.stateNode.context;break a;case 1:if(Zf(b.type)){b=b.stateNode.__reactInternalMemoizedMergedChildContext;break a}}b=b.return;}while(null!==b);throw Error(p(171));}if(1===a.tag){var c=a.type;if(Zf(c))return bg(a,c,b)}return b}
		function fl(a,b,c,d,e,f,g,h,k){a=cl(c,d,!0,a,e,f,g,h,k);a.context=el(null);c=a.current;d=L();e=lh(c);f=ch(d,e);f.callback=void 0!==b&&null!==b?b:null;dh(c,f,e);a.current.lanes=e;Ac(a,e,d);Ek(a,d);return a}function gl(a,b,c,d){var e=b.current,f=L(),g=lh(e);c=el(c);null===b.context?b.context=c:b.pendingContext=c;b=ch(f,g);b.payload={element:a};d=void 0===d?null:d;null!==d&&(b.callback=d);a=dh(e,b,g);null!==a&&(mh(a,e,g,f),eh(a,e,g));return g}
		function hl(a){a=a.current;if(!a.child)return null;switch(a.child.tag){case 5:return a.child.stateNode;default:return a.child.stateNode}}function il(a,b){a=a.memoizedState;if(null!==a&&null!==a.dehydrated){var c=a.retryLane;a.retryLane=0!==c&&c<b?c:b;}}function jl(a,b){il(a,b);(a=a.alternate)&&il(a,b);}function kl(){return null}var ll="function"===typeof reportError?reportError:function(a){console.error(a);};function ml(a){this._internalRoot=a;}
		nl.prototype.render=ml.prototype.render=function(a){var b=this._internalRoot;if(null===b)throw Error(p(409));gl(a,b,null,null);};nl.prototype.unmount=ml.prototype.unmount=function(){var a=this._internalRoot;if(null!==a){this._internalRoot=null;var b=a.containerInfo;Sk(function(){gl(null,a,null,null);});b[uf]=null;}};function nl(a){this._internalRoot=a;}
		nl.prototype.unstable_scheduleHydration=function(a){if(a){var b=Hc();a={blockedOn:null,target:a,priority:b};for(var c=0;c<Qc.length&&0!==b&&b<Qc[c].priority;c++);Qc.splice(c,0,a);0===c&&Vc(a);}};function ol(a){return !(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType)}function pl(a){return !(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType&&(8!==a.nodeType||" react-mount-point-unstable "!==a.nodeValue))}function ql(){}
		function rl(a,b,c,d,e){if(e){if("function"===typeof d){var f=d;d=function(){var a=hl(g);f.call(a);};}var g=fl(b,d,a,0,null,!1,!1,"",ql);a._reactRootContainer=g;a[uf]=g.current;sf(8===a.nodeType?a.parentNode:a);Sk();return g}for(;e=a.lastChild;)a.removeChild(e);if("function"===typeof d){var h=d;d=function(){var a=hl(k);h.call(a);};}var k=cl(a,0,!1,null,null,!1,!1,"",ql);a._reactRootContainer=k;a[uf]=k.current;sf(8===a.nodeType?a.parentNode:a);Sk(function(){gl(b,k,c,d);});return k}
		function sl(a,b,c,d,e){var f=c._reactRootContainer;if(f){var g=f;if("function"===typeof e){var h=e;e=function(){var a=hl(g);h.call(a);};}gl(b,g,a,e);}else g=rl(c,b,a,e,d);return hl(g)}Ec=function(a){switch(a.tag){case 3:var b=a.stateNode;if(b.current.memoizedState.isDehydrated){var c=tc(b.pendingLanes);0!==c&&(Cc(b,c|1),Ek(b,B()),0===(K&6)&&(Hj=B()+500,jg()));}break;case 13:Sk(function(){var b=Zg(a,1);if(null!==b){var c=L();mh(b,a,1,c);}}),jl(a,1);}};
		Fc=function(a){if(13===a.tag){var b=Zg(a,134217728);if(null!==b){var c=L();mh(b,a,134217728,c);}jl(a,134217728);}};Gc=function(a){if(13===a.tag){var b=lh(a),c=Zg(a,b);if(null!==c){var d=L();mh(c,a,b,d);}jl(a,b);}};Hc=function(){return C};Ic=function(a,b){var c=C;try{return C=a,b()}finally{C=c;}};
		yb=function(a,b,c){switch(b){case "input":bb(a,c);b=c.name;if("radio"===c.type&&null!=b){for(c=a;c.parentNode;)c=c.parentNode;c=c.querySelectorAll("input[name="+JSON.stringify(""+b)+'][type="radio"]');for(b=0;b<c.length;b++){var d=c[b];if(d!==a&&d.form===a.form){var e=Db(d);if(!e)throw Error(p(90));Wa(d);bb(d,e);}}}break;case "textarea":ib(a,c);break;case "select":b=c.value,null!=b&&fb(a,!!c.multiple,b,!1);}};Gb=Rk;Hb=Sk;
		var tl={usingClientEntryPoint:!1,Events:[Cb,ue,Db,Eb,Fb,Rk]},ul={findFiberByHostInstance:Wc,bundleType:0,version:"18.2.0",rendererPackageName:"react-dom"};
		var vl={bundleType:ul.bundleType,version:ul.version,rendererPackageName:ul.rendererPackageName,rendererConfig:ul.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:ua.ReactCurrentDispatcher,findHostInstanceByFiber:function(a){a=Zb(a);return null===a?null:a.stateNode},findFiberByHostInstance:ul.findFiberByHostInstance||
		kl,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.2.0-next-9e3b772b8-20220608"};if("undefined"!==typeof __REACT_DEVTOOLS_GLOBAL_HOOK__){var wl=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!wl.isDisabled&&wl.supportsFiber)try{kc=wl.inject(vl),lc=wl;}catch(a){}}reactDom_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=tl;
		reactDom_production_min.createPortal=function(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;if(!ol(b))throw Error(p(200));return dl(a,b,null,c)};reactDom_production_min.createRoot=function(a,b){if(!ol(a))throw Error(p(299));var c=!1,d="",e=ll;null!==b&&void 0!==b&&(!0===b.unstable_strictMode&&(c=!0),void 0!==b.identifierPrefix&&(d=b.identifierPrefix),void 0!==b.onRecoverableError&&(e=b.onRecoverableError));b=cl(a,1,!1,null,null,c,!1,d,e);a[uf]=b.current;sf(8===a.nodeType?a.parentNode:a);return new ml(b)};
		reactDom_production_min.findDOMNode=function(a){if(null==a)return null;if(1===a.nodeType)return a;var b=a._reactInternals;if(void 0===b){if("function"===typeof a.render)throw Error(p(188));a=Object.keys(a).join(",");throw Error(p(268,a));}a=Zb(b);a=null===a?null:a.stateNode;return a};reactDom_production_min.flushSync=function(a){return Sk(a)};reactDom_production_min.hydrate=function(a,b,c){if(!pl(b))throw Error(p(200));return sl(null,a,b,!0,c)};
		reactDom_production_min.hydrateRoot=function(a,b,c){if(!ol(a))throw Error(p(405));var d=null!=c&&c.hydratedSources||null,e=!1,f="",g=ll;null!==c&&void 0!==c&&(!0===c.unstable_strictMode&&(e=!0),void 0!==c.identifierPrefix&&(f=c.identifierPrefix),void 0!==c.onRecoverableError&&(g=c.onRecoverableError));b=fl(b,null,a,1,null!=c?c:null,e,!1,f,g);a[uf]=b.current;sf(a);if(d)for(a=0;a<d.length;a++)c=d[a],e=c._getVersion,e=e(c._source),null==b.mutableSourceEagerHydrationData?b.mutableSourceEagerHydrationData=[c,e]:b.mutableSourceEagerHydrationData.push(c,
		e);return new nl(b)};reactDom_production_min.render=function(a,b,c){if(!pl(b))throw Error(p(200));return sl(null,a,b,!1,c)};reactDom_production_min.unmountComponentAtNode=function(a){if(!pl(a))throw Error(p(40));return a._reactRootContainer?(Sk(function(){sl(null,null,a,!1,function(){a._reactRootContainer=null;a[uf]=null;});}),!0):!1};reactDom_production_min.unstable_batchedUpdates=Rk;
		reactDom_production_min.unstable_renderSubtreeIntoContainer=function(a,b,c,d){if(!pl(c))throw Error(p(200));if(null==a||void 0===a._reactInternals)throw Error(p(38));return sl(a,b,c,!1,d)};reactDom_production_min.version="18.2.0-next-9e3b772b8-20220608";
		return reactDom_production_min;
	}

	function checkDCE() {
	  /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
	  if (
	    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
	    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
	  ) {
	    return;
	  }
	  try {
	    // Verify that the code above has been dead code eliminated (DCE'd).
	    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
	  } catch (err) {
	    // DevTools shouldn't crash React, no matter what.
	    // We should still report in case we break this code.
	    console.error(err);
	  }
	}

	{
	  // DCE check should happen before ReactDOM bundle executes so that
	  // DevTools can report bad minification during injection.
	  checkDCE();
	  reactDom.exports = requireReactDom_production_min();
	}

	var reactDomExports = reactDom.exports;

	var m = reactDomExports;
	{
	  client.createRoot = m.createRoot;
	  client.hydrateRoot = m.hydrateRoot;
	}

	var styles$9 = {"root":"app-module_root__4oC2J","sidebar":"app-module_sidebar__YKTq3","version":"app-module_version__fY8VA"};

	var classnames = {exports: {}};

	/*!
		Copyright (c) 2018 Jed Watson.
		Licensed under the MIT License (MIT), see
		http://jedwatson.github.io/classnames
	*/

	(function (module) {
		/* global define */

		(function () {

			var hasOwn = {}.hasOwnProperty;

			function classNames() {
				var classes = [];

				for (var i = 0; i < arguments.length; i++) {
					var arg = arguments[i];
					if (!arg) continue;

					var argType = typeof arg;

					if (argType === 'string' || argType === 'number') {
						classes.push(arg);
					} else if (Array.isArray(arg)) {
						if (arg.length) {
							var inner = classNames.apply(null, arg);
							if (inner) {
								classes.push(inner);
							}
						}
					} else if (argType === 'object') {
						if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
							classes.push(arg.toString());
							continue;
						}

						for (var key in arg) {
							if (hasOwn.call(arg, key) && arg[key]) {
								classes.push(key);
							}
						}
					}
				}

				return classes.join(' ');
			}

			if (module.exports) {
				classNames.default = classNames;
				module.exports = classNames;
			} else {
				window.classNames = classNames;
			}
		}()); 
	} (classnames));

	var classnamesExports = classnames.exports;
	var cn = /*@__PURE__*/getDefaultExportFromCjs(classnamesExports);

	var styles$8 = {"header":"collapse-module_header__rtZbY","collapseIcon":"collapse-module_collapseIcon__JV5PN","collapseIconExpand":"collapse-module_collapseIconExpand__JHeum","content":"collapse-module_content__jSg-f","collapsed":"collapse-module_collapsed__ne8uP"};

	const Chevron = () => (jsxRuntimeExports.jsx("svg", { xmlns: 'http://www.w3.org/2000/svg', width: '16px', height: '16px', viewBox: '0 0 16 16', version: '1.1', children: jsxRuntimeExports.jsx("g", { id: 'surface1', children: jsxRuntimeExports.jsx("path", { d: 'M 15.027344 11.882812 L 13.542969 13.355469 C 13.429688 13.46875 13.296875 13.527344 13.144531 13.527344 C 12.988281 13.527344 12.855469 13.46875 12.742188 13.355469 L 8 8.617188 L 3.257812 13.355469 C 3.144531 13.46875 3.011719 13.527344 2.855469 13.527344 C 2.703125 13.527344 2.570312 13.46875 2.457031 13.355469 L 0.972656 11.882812 C 0.859375 11.769531 0.804688 11.636719 0.804688 11.476562 C 0.804688 11.320312 0.859375 11.183594 0.972656 11.070312 L 7.597656 4.457031 C 7.710938 4.34375 7.84375 4.285156 8 4.285156 C 8.15625 4.285156 8.289062 4.34375 8.402344 4.457031 L 15.027344 11.070312 C 15.140625 11.183594 15.195312 11.320312 15.195312 11.476562 C 15.195312 11.636719 15.140625 11.769531 15.027344 11.882812 Z M 15.027344 11.882812 ' }) }) }));

	const Collapse = (props) => {
	    const heightRef = reactExports.useRef(0);
	    const [isCollapsed, setIsCollapsed] = reactExports.useState(props.isCollapsed);
	    const setHeight = reactExports.useCallback((ref) => {
	        if (ref) {
	            heightRef.current = ref.clientHeight;
	        }
	    }, []);
	    return (jsxRuntimeExports.jsxs("div", { className: props.className, children: [jsxRuntimeExports.jsxs("div", { className: styles$8.header, onClick: () => setIsCollapsed(!isCollapsed), children: [props.title, ' ', jsxRuntimeExports.jsx("span", { className: cn(styles$8.collapseIcon, isCollapsed && styles$8.collapseIconExpand), children: jsxRuntimeExports.jsx(Chevron, {}) })] }), jsxRuntimeExports.jsx("div", { className: cn(styles$8.content, isCollapsed && styles$8.collapsed), style: { height: isCollapsed ? 0 : heightRef.current || 'fit-content' }, children: jsxRuntimeExports.jsx("div", { ref: setHeight, children: props.children }) })] }));
	};

	var styles$7 = {"radio":"radio-group-module_radio__l6NV3"};

	const RadioGroup = (props) => {
	    const { className, options, value, onChange } = props;
	    return (jsxRuntimeExports.jsx("div", { className: className, children: options.map((option) => (jsxRuntimeExports.jsxs("label", { className: styles$7.radio, children: [jsxRuntimeExports.jsx("input", { type: 'radio', name: option.value, checked: value === option.value, onChange: () => onChange(option.value) }), option.label] }, option.value))) }));
	};

	var styles$6 = {"root":"patterns-settings-module_root__SrYF5","section":"patterns-settings-module_section__jeqUX","input":"patterns-settings-module_input__rI-RQ","sectionsWrapper":"patterns-settings-module_sectionsWrapper__Q03rS","sectionHeader":"patterns-settings-module_sectionHeader__Q7Qzv","applyButton":"patterns-settings-module_applyButton__EFBt-"};

	var styles$5 = {"root":"button-module_root__OO-ud"};

	const Button = (props) => {
	    return (jsxRuntimeExports.jsx("button", { className: cn(styles$5.root, props.className), onClick: props.onClick, disabled: props.disabled, children: props.children }));
	};

	const defaultPatterns$1 = [
	    {
	        name: 'example-stripes-pattern',
	        type: 'triangles',
	        config: {
	            color: 'rgb(255,206,71)',
	            background: 'rgb(227,180,76)',
	            spacing: 6,
	        },
	    },
	    {
	        name: 'example-combined-pattern',
	        type: 'combined',
	        config: [
	            {
	                type: 'stripes',
	                config: {
	                    color: 'rgba(100,115,217,0.63)',
	                    background: 'rgb(255,255,255,0)',
	                    angle: 125,
	                },
	            },
	            {
	                type: 'gradient',
	                config: {
	                    colors: [
	                        {
	                            color: 'rgba(137,211,255,0.5)',
	                            offset: 0,
	                        },
	                        {
	                            color: 'rgba(58,178,246,0.5)',
	                            offset: 0.1,
	                        },
	                        {
	                            color: 'rgba(0,166,255,0.5)',
	                            offset: 0.5,
	                        },
	                        {
	                            color: 'rgba(54,110,136,0.5)',
	                            offset: 0.9,
	                        },
	                        {
	                            color: 'rgba(29,49,58,0.5)',
	                            offset: 1,
	                        },
	                    ],
	                },
	            },
	            {
	                type: 'dots',
	                config: {
	                    color: 'rgba(64,255,0,0.35)',
	                    background: 'rgb(255,255,255,0)',
	                    size: 2,
	                    spacing: 2,
	                    align: 'center',
	                },
	            },
	        ],
	    },
	];
	const defaultPatternsNames = defaultPatterns$1.map((pattern) => pattern.name);
	const PatternsSettings = ({ value = [], onChange, }) => {
	    const [patterns, setPatterns] = reactExports.useState(value.map((pattern) => ({ ...pattern, config: JSON.stringify(pattern.config, null, 2) })));
	    const handleApply = reactExports.useCallback(() => {
	        onChange(patterns.map((pattern) => ({
	            ...pattern,
	            config: JSON.parse(pattern.config),
	        })));
	    }, [onChange, patterns]);
	    return (jsxRuntimeExports.jsxs("div", { className: styles$6.root, children: [jsxRuntimeExports.jsx("div", { className: styles$6.sectionsWrapper, children: patterns.map(({ name, type, config }, index) => (jsxRuntimeExports.jsxs("div", { className: styles$6.section, children: [jsxRuntimeExports.jsx("div", { className: styles$6.sectionHeader, children: name || type }), jsxRuntimeExports.jsx("textarea", { className: styles$6.input, value: config, onChange: (e) => {
	                                const newValue = e.target.value;
	                                setPatterns(patterns.map((pattern, i) => i === index ? { ...pattern, config: newValue } : pattern));
	                            } })] }, (name || type) + index))) }), jsxRuntimeExports.jsx("div", { children: jsxRuntimeExports.jsx(Button, { className: styles$6.applyButton, onClick: handleApply, children: "Apply" }) })] }));
	};

	const chars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
	const randomString = (length, minLength = 4) => {
	    const rndLength = rnd(length, minLength);
	    let str = '';
	    for (let i = rndLength; i--;) {
	        str += chars[rnd(chars.length - 1)];
	    }
	    return str;
	};
	const rnd = (max, min = 0) => Math.round(Math.random() * (max - min)) + min;
	const rndFloat = (max, min = 0) => Math.random() * (max - min) + min;
	const rndItem = (arr) => arr[rnd(arr.length - 1)];
	const generateRandomLevel = (count, minChild = 1, maxChild = 10) => {
	    const childrenCount = count ? rnd(Math.min(count, maxChild), Math.min(count, minChild)) : 0;
	    const children = Array(childrenCount)
	        .fill(null)
	        .map(() => ({ children: [] }));
	    const rest = count - childrenCount;
	    return {
	        rest,
	        children,
	    };
	};
	const generateRandomNesting = (count, minChild, maxChild) => {
	    const levels = [];
	    let rest = count;
	    let isStopped = false;
	    while (rest > 0 && !isStopped) {
	        if (!levels.length) {
	            const layer = generateRandomLevel(rest, Math.min(minChild, 1), maxChild);
	            levels.push([layer.children]);
	            rest = layer.rest;
	        }
	        else {
	            const level = levels[levels.length - 1];
	            const innerLevel = [];
	            level.forEach((subLevel) => {
	                subLevel.forEach((subSubLevel) => {
	                    const layer = generateRandomLevel(rest, minChild, maxChild);
	                    subSubLevel.children = layer.children;
	                    rest = layer.rest;
	                    innerLevel.push(layer.children);
	                });
	            });
	            if (!innerLevel.length) {
	                isStopped = true;
	            }
	            else {
	                levels.push(innerLevel);
	            }
	        }
	    }
	    console.log('Total count:', levels.reduce((acc, level) => level.reduce((acc, subLevel) => acc + subLevel.length, acc), 0));
	    return levels[0][0];
	};
	const map = (nodes, cb, parent) => {
	    return cb(nodes, parent).map((item) => {
	        item.children = item.children ? map(item.children, cb, item) : [];
	        return item;
	    });
	};
	const treeConfigDefaults = {
	    count: 100000,
	    start: 500,
	    end: 5000,
	    minChild: 1,
	    maxChild: 3,
	    thinning: 12,
	    colorsMonotony: 40,
	    colorsCount: 10,
	};
	const waterfallConfigDefaults = {
	    count: 100,
	    thinning: 15,
	    itemsOnLine: 5,
	    basesCount: 4,
	    baseThinning: 40,
	    start: 0,
	    end: 4500,
	};
	const marksConfigDefaults = {
	    count: 5,
	    start: 0,
	    end: 4500,
	};
	const timeseriesConfigDefaults = {
	    count: 100,
	    start: 400,
	    end: 4500,
	};
	const generateRandomTimestamps = (count, thinning, start, end) => {
	    const timestamps = count > 1
	        ? Array(count - 1)
	            .fill(null)
	            .map(() => rndFloat(start, end))
	            .concat(start, end)
	            .sort((a, b) => a - b)
	        : [start, end];
	    return Array(count)
	        .fill(null)
	        .map((_, index) => {
	        const currentWindow = timestamps[index + 1] - timestamps[index];
	        const start = timestamps[index] + rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
	        const end = timestamps[index + 1] - rndFloat(currentWindow, 0) * (rndFloat(thinning) / 100);
	        const duration = end - start;
	        return { start, end, duration };
	    });
	};
	const generateRandomTree = ({ count, start, end, minChild, maxChild, thinning, colorsMonotony, colorsCount, }) => {
	    const rootNodes = generateRandomNesting(count, minChild, maxChild);
	    const types = Array(colorsCount)
	        .fill(null)
	        .map(() => randomString(10));
	    let counter = 0;
	    let typesCounter = 0;
	    let currentType = types[typesCounter];
	    rootNodes.forEach((item) => {
	        var _a;
	        item.pattern = rndItem(defaultPatternsNames);
	        (_a = item.children) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
	            var _a;
	            return (_a = item.children) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
	                item.badge = 'rgb(197,5,0)';
	            });
	        });
	    });
	    const mappedNestingArrays = map(rootNodes, (nodes, parent) => {
	        const itemsCount = nodes.length;
	        const innerStart = (parent === null || parent === void 0 ? void 0 : parent.start) ? parent.start : start;
	        const innerEnd = typeof (parent === null || parent === void 0 ? void 0 : parent.duration) === 'number' ? innerStart + (parent === null || parent === void 0 ? void 0 : parent.duration) : end;
	        const timestamps = generateRandomTimestamps(itemsCount, thinning, innerStart, innerEnd);
	        nodes.forEach((item, index) => {
	            if (counter > colorsMonotony) {
	                counter = 0;
	                currentType = types[typesCounter];
	                typesCounter++;
	                if (typesCounter >= types.length) {
	                    typesCounter = 0;
	                }
	            }
	            item.start = timestamps[index].start;
	            item.duration = timestamps[index].duration;
	            item.name = randomString(14);
	            item.type = currentType;
	            counter++;
	        });
	        return nodes;
	    });
	    console.log('[generateRandomTree]', mappedNestingArrays);
	    return mappedNestingArrays;
	};
	const generateRandomWaterfallItems = ({ count, itemsOnLine, basesCount, baseThinning, thinning, start, end, }) => {
	    const items = [];
	    const types = Object.keys(waterfallIntervals);
	    const bases = generateRandomTimestamps(basesCount, baseThinning, start, end);
	    for (let i = 0; i < count; i += itemsOnLine) {
	        const base = bases[Math.floor(rndFloat(basesCount))];
	        const timestamps = generateRandomTimestamps(itemsOnLine, thinning, base.start, base.end);
	        items.push(...timestamps.map(({ start, end }) => ({
	            name: randomString(14),
	            timing: (() => {
	                const [requestStart, responseStart] = [rndFloat(start, end), rndFloat(start, end)].sort();
	                return {
	                    fetchStart: start,
	                    requestStart,
	                    responseStart,
	                    responseEnd: end,
	                };
	            })(),
	            intervals: rndItem(types),
	        })));
	    }
	    console.log('[generateRandomWaterfallItems]', items);
	    return items;
	};
	const waterfallIntervals = {
	    js: [
	        {
	            name: 'waiting',
	            color: 'rgba(0,0,0,0.5)',
	            type: 'line',
	            start: 'fetchStart',
	            end: 'requestStart',
	        },
	        {
	            name: 'request',
	            color: 'rgb(207,196,152)',
	            type: 'block',
	            start: 'requestStart',
	            end: 'responseStart',
	            timeframeChart: true,
	        },
	        {
	            name: 'downloading',
	            color: 'rgb(207,180,81)',
	            type: 'block',
	            start: 'responseStart',
	            end: 'responseEnd',
	            timeframeChart: true,
	        },
	    ],
	    css: [
	        {
	            name: 'waiting',
	            color: 'rgba(0,0,0,0.5)',
	            type: 'line',
	            start: 'fetchStart',
	            end: 'requestStart',
	        },
	        {
	            name: 'request',
	            color: 'rgb(144,188,210)',
	            type: 'block',
	            start: 'requestStart',
	            end: 'responseStart',
	            timeframeChart: true,
	        },
	        {
	            name: 'downloading',
	            color: 'rgb(90,169,208)',
	            type: 'block',
	            start: 'responseStart',
	            end: 'responseEnd',
	            timeframeChart: true,
	        },
	    ],
	};
	const marksColors = ['#4fd24a', '#4b7ad7', '#d74c4c', '#d74c9e', '#9e4cd7', '#4c9ed7', '#4cd7a1', '#d7c44c'];
	const generateRandomMarks = ({ count, start, end }) => {
	    const timestamps = Array(count)
	        .fill(null)
	        .map(() => rndFloat(start, end));
	    return timestamps.map((timestamp) => {
	        const shortName = randomString(4, 2).toUpperCase();
	        const fullName = shortName
	            .split('')
	            .map((char) => char + randomString(6).toLowerCase())
	            .join(' ');
	        return {
	            shortName,
	            fullName,
	            timestamp,
	            color: rndItem(marksColors),
	        };
	    });
	};
	const generateRandomTimeseries = ({ count, start, end, min, max }) => {
	    return Array(count)
	        .fill(null)
	        .map(() => [rndFloat(start, end), rndFloat(min !== null && min !== void 0 ? min : 0, max !== null && max !== void 0 ? max : 100)])
	        .sort((a, b) => a[0] - b[0]);
	};

	var styles$4 = {"root":"input-module_root__q1hi4","label":"input-module_label__csfP7"};

	const Input = (props) => {
	    const handleChange = reactExports.useCallback((event) => {
	        props.onChange(event.target.value);
	    }, [props.onChange]);
	    return (jsxRuntimeExports.jsxs("label", { className: cn(styles$4.root, props.className), children: [jsxRuntimeExports.jsx("span", { className: styles$4.label, children: props.label }), jsxRuntimeExports.jsx("input", { type: props.type, value: props.value, onChange: handleChange, placeholder: props.placeholder })] }));
	};

	var styles$3 = {"root":"tree-settings-module_root__gU3h2","inputsWrapper":"tree-settings-module_inputsWrapper__I481L","input":"tree-settings-module_input__mm-wm","fileInput":"tree-settings-module_fileInput__ECinh","fileButtons":"tree-settings-module_fileButtons__pWUd5","fileButton":"tree-settings-module_fileButton__Xg4Pl","generateButton":"tree-settings-module_generateButton__bPgRn"};

	const RandomDataSettings = (props) => {
	    const [values, setValues] = reactExports.useState({
	        ...props.config,
	    });
	    const applyConfig = reactExports.useCallback(() => {
	        props.onChange(values);
	    }, [props.onChange, values]);
	    reactExports.useEffect(() => {
	        props.onChange(values);
	    }, []);
	    return (jsxRuntimeExports.jsxs("div", { className: styles$3.root, children: [jsxRuntimeExports.jsx("div", { className: styles$3.inputsWrapper, children: Object.entries(values).map(([name, value]) => {
	                    var _a;
	                    return (jsxRuntimeExports.jsx(Input, { className: styles$3.input, value: value, label: ((_a = props.units) === null || _a === void 0 ? void 0 : _a[name]) ? `${name} (${props.units[name]})` : name, onChange: (newValue) => {
	                            const newValues = { ...values, [name]: parseFloat(newValue) };
	                            setValues(newValues);
	                        } }, name));
	                }) }), jsxRuntimeExports.jsx("div", { children: jsxRuntimeExports.jsx(Button, { onClick: applyConfig, disabled: props.isGenerating, className: styles$3.generateButton, children: props.children }) })] }));
	};

	const units$1 = {
	    thinning: '%',
	};
	const TreeSettings = (props) => {
	    return (jsxRuntimeExports.jsx(RandomDataSettings, { onChange: props.onChange, config: treeConfigDefaults, units: units$1, isGenerating: props.isGenerating, children: "Generate random flame chart items" }));
	};

	var domain;

	// This constructor is used to store event handlers. Instantiating this is
	// faster than explicitly calling `Object.create(null)` to get a "clean" empty
	// object (tested with v8 v4.9).
	function EventHandlers() {}
	EventHandlers.prototype = Object.create(null);

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}

	EventEmitter.usingDomains = false;

	EventEmitter.prototype.domain = undefined;
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	EventEmitter.init = function() {
	  this.domain = null;
	  if (EventEmitter.usingDomains) {
	    // if there is an active domain, then attach to it.
	    if (domain.active ) ;
	  }

	  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
	    this._events = new EventHandlers();
	    this._eventsCount = 0;
	  }

	  this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || isNaN(n))
	    throw new TypeError('"n" argument must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	function $getMaxListeners(that) {
	  if (that._maxListeners === undefined)
	    return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return $getMaxListeners(this);
	};

	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
	  if (isFn)
	    handler.call(self);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self);
	  }
	}
	function emitOne(handler, isFn, self, arg1) {
	  if (isFn)
	    handler.call(self, arg1);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1);
	  }
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
	  if (isFn)
	    handler.call(self, arg1, arg2);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2);
	  }
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
	  if (isFn)
	    handler.call(self, arg1, arg2, arg3);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2, arg3);
	  }
	}

	function emitMany(handler, isFn, self, args) {
	  if (isFn)
	    handler.apply(self, args);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].apply(self, args);
	  }
	}

	EventEmitter.prototype.emit = function emit(type) {
	  var er, handler, len, args, i, events, domain;
	  var doError = (type === 'error');

	  events = this._events;
	  if (events)
	    doError = (doError && events.error == null);
	  else if (!doError)
	    return false;

	  domain = this.domain;

	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    er = arguments[1];
	    if (domain) {
	      if (!er)
	        er = new Error('Uncaught, unspecified "error" event');
	      er.domainEmitter = this;
	      er.domain = domain;
	      er.domainThrown = false;
	      domain.emit('error', er);
	    } else if (er instanceof Error) {
	      throw er; // Unhandled 'error' event
	    } else {
	      // At least give some kind of context to the user
	      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	      err.context = er;
	      throw err;
	    }
	    return false;
	  }

	  handler = events[type];

	  if (!handler)
	    return false;

	  var isFn = typeof handler === 'function';
	  len = arguments.length;
	  switch (len) {
	    // fast cases
	    case 1:
	      emitNone(handler, isFn, this);
	      break;
	    case 2:
	      emitOne(handler, isFn, this, arguments[1]);
	      break;
	    case 3:
	      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
	      break;
	    case 4:
	      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
	      break;
	    // slower
	    default:
	      args = new Array(len - 1);
	      for (i = 1; i < len; i++)
	        args[i - 1] = arguments[i];
	      emitMany(handler, isFn, this, args);
	  }

	  return true;
	};

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');

	  events = target._events;
	  if (!events) {
	    events = target._events = new EventHandlers();
	    target._eventsCount = 0;
	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".
	    if (events.newListener) {
	      target.emit('newListener', type,
	                  listener.listener ? listener.listener : listener);

	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;
	    }
	    existing = events[type];
	  }

	  if (!existing) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] = prepend ? [listener, existing] :
	                                          [existing, listener];
	    } else {
	      // If we've already got an array, just append.
	      if (prepend) {
	        existing.unshift(listener);
	      } else {
	        existing.push(listener);
	      }
	    }

	    // Check for listener leak
	    if (!existing.warned) {
	      m = $getMaxListeners(target);
	      if (m && m > 0 && existing.length > m) {
	        existing.warned = true;
	        var w = new Error('Possible EventEmitter memory leak detected. ' +
	                            existing.length + ' ' + type + ' listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit');
	        w.name = 'MaxListenersExceededWarning';
	        w.emitter = target;
	        w.type = type;
	        w.count = existing.length;
	        emitWarning(w);
	      }
	    }
	  }

	  return target;
	}
	function emitWarning(e) {
	  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
	}
	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	    function prependListener(type, listener) {
	      return _addListener(this, type, listener, true);
	    };

	function _onceWrap(target, type, listener) {
	  var fired = false;
	  function g() {
	    target.removeListener(type, g);
	    if (!fired) {
	      fired = true;
	      listener.apply(target, arguments);
	    }
	  }
	  g.listener = listener;
	  return g;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');
	  this.on(type, _onceWrap(this, type, listener));
	  return this;
	};

	EventEmitter.prototype.prependOnceListener =
	    function prependOnceListener(type, listener) {
	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');
	      this.prependListener(type, _onceWrap(this, type, listener));
	      return this;
	    };

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener =
	    function removeListener(type, listener) {
	      var list, events, position, i, originalListener;

	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');

	      events = this._events;
	      if (!events)
	        return this;

	      list = events[type];
	      if (!list)
	        return this;

	      if (list === listener || (list.listener && list.listener === listener)) {
	        if (--this._eventsCount === 0)
	          this._events = new EventHandlers();
	        else {
	          delete events[type];
	          if (events.removeListener)
	            this.emit('removeListener', type, list.listener || listener);
	        }
	      } else if (typeof list !== 'function') {
	        position = -1;

	        for (i = list.length; i-- > 0;) {
	          if (list[i] === listener ||
	              (list[i].listener && list[i].listener === listener)) {
	            originalListener = list[i].listener;
	            position = i;
	            break;
	          }
	        }

	        if (position < 0)
	          return this;

	        if (list.length === 1) {
	          list[0] = undefined;
	          if (--this._eventsCount === 0) {
	            this._events = new EventHandlers();
	            return this;
	          } else {
	            delete events[type];
	          }
	        } else {
	          spliceOne(list, position);
	        }

	        if (events.removeListener)
	          this.emit('removeListener', type, originalListener || listener);
	      }

	      return this;
	    };

	EventEmitter.prototype.removeAllListeners =
	    function removeAllListeners(type) {
	      var listeners, events;

	      events = this._events;
	      if (!events)
	        return this;

	      // not listening for removeListener, no need to emit
	      if (!events.removeListener) {
	        if (arguments.length === 0) {
	          this._events = new EventHandlers();
	          this._eventsCount = 0;
	        } else if (events[type]) {
	          if (--this._eventsCount === 0)
	            this._events = new EventHandlers();
	          else
	            delete events[type];
	        }
	        return this;
	      }

	      // emit removeListener for all listeners on all events
	      if (arguments.length === 0) {
	        var keys = Object.keys(events);
	        for (var i = 0, key; i < keys.length; ++i) {
	          key = keys[i];
	          if (key === 'removeListener') continue;
	          this.removeAllListeners(key);
	        }
	        this.removeAllListeners('removeListener');
	        this._events = new EventHandlers();
	        this._eventsCount = 0;
	        return this;
	      }

	      listeners = events[type];

	      if (typeof listeners === 'function') {
	        this.removeListener(type, listeners);
	      } else if (listeners) {
	        // LIFO order
	        do {
	          this.removeListener(type, listeners[listeners.length - 1]);
	        } while (listeners[0]);
	      }

	      return this;
	    };

	EventEmitter.prototype.listeners = function listeners(type) {
	  var evlistener;
	  var ret;
	  var events = this._events;

	  if (!events)
	    ret = [];
	  else {
	    evlistener = events[type];
	    if (!evlistener)
	      ret = [];
	    else if (typeof evlistener === 'function')
	      ret = [evlistener.listener || evlistener];
	    else
	      ret = unwrapListeners(evlistener);
	  }

	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  if (typeof emitter.listenerCount === 'function') {
	    return emitter.listenerCount(type);
	  } else {
	    return listenerCount.call(emitter, type);
	  }
	};

	EventEmitter.prototype.listenerCount = listenerCount;
	function listenerCount(type) {
	  var events = this._events;

	  if (events) {
	    var evlistener = events[type];

	    if (typeof evlistener === 'function') {
	      return 1;
	    } else if (evlistener) {
	      return evlistener.length;
	    }
	  }

	  return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
	    list[i] = list[k];
	  list.pop();
	}

	function arrayClone(arr, i) {
	  var copy = new Array(i);
	  while (i--)
	    copy[i] = arr[i];
	  return copy;
	}

	function unwrapListeners(arr) {
	  var ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

	const mergeObjects = (defaultStyles, styles = {}) => Object.keys(defaultStyles).reduce((acc, key) => {
	    if (styles[key]) {
	        acc[key] = styles[key];
	    }
	    else {
	        acc[key] = defaultStyles[key];
	    }
	    return acc;
	}, {});
	const isNumber = (val) => typeof val === 'number';
	const last = (array) => array[array.length - 1];
	const getTrianglePoints = (width, height, direction) => {
	    const side = (width * Math.SQRT2) / 2;
	    let points = [];
	    switch (direction) {
	        case 'top':
	            points = [
	                { x: 0, y: height },
	                { x: width / 2, y: 0 },
	                { x: width, y: height },
	            ];
	            break;
	        case 'bottom':
	            points = [
	                { x: 0, y: 0 },
	                { x: width, y: 0 },
	                { x: width / 2, y: height },
	            ];
	            break;
	        case 'left':
	            points = [
	                { x: height, y: 0 },
	                { x: height, y: width },
	                { x: 0, y: width / 2 },
	            ];
	            break;
	        case 'right':
	            points = [
	                { x: 0, y: 0 },
	                { x: 0, y: width },
	                { x: height, y: width / 2 },
	            ];
	            break;
	        case 'top-left':
	            points = [
	                { x: 0, y: 0 },
	                { x: side, y: 0 },
	                { x: 0, y: side },
	            ];
	            break;
	        case 'top-right':
	            points = [
	                { x: 0, y: 0 },
	                { x: side, y: 0 },
	                { x: side, y: side },
	            ];
	            break;
	        case 'bottom-left':
	            points = [
	                { x: 0, y: 0 },
	                { x: 0, y: side },
	                { x: side, y: side },
	            ];
	            break;
	        case 'bottom-right':
	            points = [
	                { x: side, y: 0 },
	                { x: 0, y: side },
	                { x: side, y: side },
	            ];
	            break;
	    }
	    return points;
	};

	const createPatternCanvas = () => {
	    const canvas = document.createElement('canvas');
	    const ctx = canvas.getContext('2d');
	    return {
	        ctx,
	        canvas,
	    };
	};

	const stripesPattern = ({ color = 'black', background = 'rgb(255,255,255, 0)', lineWidth = 6, spacing = 4, angle = 45, dash, } = {}) => (engine) => {
	    const { ctx, canvas } = createPatternCanvas();
	    const scale = 4;
	    ctx.setTransform(scale, 0, 0, scale, 0, 0);
	    canvas.height = (engine.blockHeight + 1) * scale;
	    const realLineWidth = lineWidth * scale;
	    const realSpacing = spacing * scale + realLineWidth;
	    const angleRad = (angle * Math.PI) / 180.0;
	    const isAscending = (angleRad > (Math.PI * 3) / 2 && angleRad < Math.PI * 2) || (angleRad > Math.PI / 2 && angleRad < Math.PI);
	    const isStraight = angleRad === Math.PI || angleRad === Math.PI * 2;
	    const isPerpendicular = angleRad === Math.PI / 2 || angleRad === (Math.PI * 3) / 2;
	    const width = isStraight || isPerpendicular
	        ? isStraight
	            ? realLineWidth
	            : realLineWidth + realSpacing / 2
	        : Math.abs(Math.ceil(realSpacing / Math.cos(Math.PI / 2 - angleRad)));
	    canvas.width = width;
	    ctx.fillStyle = background;
	    ctx.fillRect(0, 0, canvas.width, canvas.height);
	    ctx.strokeStyle = color;
	    ctx.lineWidth = realLineWidth;
	    ctx.lineCap = 'square';
	    let y = 0;
	    ctx.beginPath();
	    if (dash) {
	        ctx.setLineDash(dash.map((value) => value * scale));
	    }
	    if (isStraight) {
	        y = realLineWidth / 2;
	        while (y <= canvas.height) {
	            ctx.moveTo(0, y);
	            ctx.lineTo(width, y);
	            y += realSpacing;
	        }
	    }
	    else if (isPerpendicular) {
	        ctx.moveTo(width / 2, 0);
	        ctx.lineTo(width / 2, canvas.height);
	    }
	    else {
	        const delta = Math.abs(realSpacing / Math.cos(angleRad));
	        const fixY = Math.abs(Math.ceil(Math.sin(angleRad) * realLineWidth));
	        if (!isAscending) {
	            while (y <= canvas.height + realLineWidth) {
	                ctx.moveTo(0, y - fixY);
	                y += delta;
	                ctx.lineTo(width, y - fixY);
	            }
	        }
	        else {
	            y = canvas.height;
	            while (y >= 0 - realLineWidth) {
	                ctx.moveTo(0, y + fixY);
	                y -= delta;
	                ctx.lineTo(width, y + fixY);
	            }
	        }
	    }
	    ctx.stroke();
	    const pattern = engine.ctx.createPattern(canvas, 'repeat');
	    return {
	        pattern,
	        width,
	        scale,
	    };
	};

	const dotsPattern = ({ color = 'black', background = 'rgb(255,255,255, 0)', size = 2, rows, align = 'center', spacing = 2, verticalSpicing = spacing, horizontalSpicing = spacing, } = {}) => (engine) => {
	    const { ctx, canvas } = createPatternCanvas();
	    const scale = 4;
	    const realSize = size * scale;
	    const realVerticalSpacing = verticalSpicing * scale;
	    const realHorizontalSpacing = horizontalSpicing * scale;
	    const width = (size + realHorizontalSpacing / 4) * scale;
	    const height = (engine.blockHeight + 1) * scale;
	    const rowsCount = rows ? rows : Math.floor(height / (realSize + realVerticalSpacing));
	    ctx.setTransform(scale, 0, 0, scale, 0, 0);
	    canvas.height = height;
	    canvas.width = width;
	    ctx.fillStyle = background;
	    ctx.fillRect(0, 0, canvas.width, canvas.height);
	    ctx.fillStyle = color;
	    const delta = align === 'center'
	        ? (height - (realSize + realVerticalSpacing) * (rowsCount + 1)) / 2
	        : align === 'top'
	            ? 0
	            : height - (realSize + realVerticalSpacing) * (rowsCount + 1);
	    for (let row = 1; row <= rowsCount; row++) {
	        ctx.arc(width / 2, delta + (realSize + realVerticalSpacing) * row, realSize / 2, 0, 2 * Math.PI);
	        ctx.fill();
	    }
	    const pattern = engine.ctx.createPattern(canvas, 'repeat');
	    return {
	        pattern,
	        width,
	        scale,
	    };
	};

	const gradientPattern = ({ colors }) => (engine) => {
	    const { ctx, canvas } = createPatternCanvas();
	    const scale = 4;
	    const width = scale;
	    const height = (engine.blockHeight + 1) * scale;
	    ctx.setTransform(scale, 0, 0, scale, 0, 0);
	    canvas.height = height;
	    canvas.width = width;
	    const gradient = ctx.createLinearGradient(0, 0, width, height);
	    for (const { offset, color } of colors) {
	        gradient.addColorStop(offset, color);
	    }
	    ctx.fillStyle = gradient;
	    ctx.fillRect(0, 0, width, height);
	    const pattern = engine.ctx.createPattern(canvas, 'repeat');
	    return {
	        pattern,
	        width,
	        scale,
	    };
	};

	const trianglesPattern = ({ color = 'black', background = 'rgb(255,255,255, 0)', width = 16, height = width / 2, align = 'center', direction = 'right', spacing = width, }) => (engine) => {
	    const { ctx, canvas } = createPatternCanvas();
	    const scale = 4;
	    const points = getTrianglePoints(width * scale, height * scale, direction);
	    const maxWidth = Math.max(...points.map(({ x }) => x));
	    const maxHeight = Math.max(...points.map(({ y }) => y));
	    const fullWidth = maxWidth + spacing * scale;
	    const fullHeight = (engine.blockHeight + 1) * scale;
	    const delta = align === 'center' ? (fullHeight - maxHeight) / 2 : align === 'top' ? 0 : fullHeight - maxHeight;
	    ctx.setTransform(scale, 0, 0, scale, 0, 0);
	    canvas.height = fullHeight;
	    canvas.width = fullWidth;
	    ctx.fillStyle = background;
	    ctx.fillRect(0, 0, canvas.width, canvas.height);
	    ctx.fillStyle = color;
	    ctx.beginPath();
	    ctx.moveTo(points[0].x, points[0].y + delta);
	    points.slice(1).forEach(({ x, y }) => ctx.lineTo(x, y + delta));
	    ctx.closePath();
	    ctx.fill();
	    const pattern = engine.ctx.createPattern(canvas, 'repeat');
	    return {
	        pattern,
	        width: fullWidth,
	        scale,
	    };
	};

	const combinedPatterns = {
	    stripes: stripesPattern,
	    dots: dotsPattern,
	    gradient: gradientPattern,
	    triangles: trianglesPattern,
	};
	function findNumber(arr, max = Infinity) {
	    const maxNumber = Math.max(...arr);
	    if (arr.every((n) => maxNumber % n === 0)) {
	        return maxNumber;
	    }
	    let num = 1;
	    while (num < max) {
	        let isDivisor = true;
	        for (let i = 0; i < arr.length; i++) {
	            if (num % arr[i] !== 0) {
	                isDivisor = false;
	                break;
	            }
	        }
	        if (isDivisor) {
	            return num;
	        }
	        num++;
	    }
	    return max;
	}
	const combinedPattern = (patterns) => (engine) => {
	    const { ctx, canvas } = createPatternCanvas();
	    const scale = 4;
	    const renderedPatterns = patterns.map((pattern) => {
	        if ('creator' in pattern) {
	            return pattern.creator(engine);
	        }
	        return combinedPatterns[pattern.type](pattern.config)(engine);
	    });
	    const height = (engine.blockHeight + 1) * scale;
	    const width = findNumber(renderedPatterns.map(({ width = 1, scale: patternScale = 1 }) => width * (scale / patternScale)), engine.width * scale);
	    const maxScale = Math.max(...renderedPatterns.map((pattern) => pattern.scale || 1));
	    ctx.setTransform(maxScale, 0, 0, maxScale, 0, 0);
	    canvas.height = height;
	    canvas.width = width;
	    renderedPatterns.forEach(({ scale: patternScale = 1, pattern }) => {
	        ctx.fillStyle = pattern;
	        pattern.setTransform(new DOMMatrixReadOnly().scale(scale / patternScale, scale / patternScale));
	        ctx.fillRect(0, 0, width, height);
	    });
	    const pattern = engine.ctx.createPattern(canvas, 'repeat');
	    return {
	        pattern,
	        width,
	        scale,
	    };
	};

	const defaultPatterns = {
	    stripes: stripesPattern,
	    dots: dotsPattern,
	    gradient: gradientPattern,
	    triangles: trianglesPattern,
	    combined: combinedPattern,
	};

	// eslint-disable-next-line prettier/prettier -- prettier complains about escaping of the " character
	const allChars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890_-+()[]{}\\/|\'";:.,?~';
	const checkSafari = () => {
	    const ua = navigator.userAgent.toLowerCase();
	    return ua.includes('safari') ? !ua.includes('chrome') : false;
	};
	function getPixelRatio(context) {
	    // Unfortunately using any here, since typescript is not aware of all of the browser prefixes
	    const ctx = context;
	    const dpr = window.devicePixelRatio || 1;
	    const bsr = ctx.webkitBackingStorePixelRatio ||
	        ctx.mozBackingStorePixelRatio ||
	        ctx.msBackingStorePixelRatio ||
	        ctx.oBackingStorePixelRatio ||
	        ctx.backingStorePixelRatio ||
	        1;
	    return dpr / bsr;
	}
	const defaultRenderSettings = {
	    tooltip: undefined,
	    timeUnits: 'ms',
	};
	const defaultRenderStyles = {
	    blockHeight: 16,
	    blockPaddingLeftRight: 4,
	    backgroundColor: 'white',
	    font: '10px sans-serif',
	    fontColor: 'black',
	    badgeSize: 8,
	    tooltipHeaderFontColor: 'black',
	    tooltipBodyFontColor: '#688f45',
	    tooltipBackgroundColor: 'white',
	    tooltipShadowColor: 'black',
	    tooltipShadowBlur: 6,
	    tooltipShadowOffsetX: 0,
	    tooltipShadowOffsetY: 0,
	    headerHeight: 14,
	    headerColor: 'rgba(112, 112, 112, 0.25)',
	    headerStrokeColor: 'rgba(112, 112, 112, 0.5)',
	    headerTitleLeftPadding: 16,
	};
	class BasicRenderEngine extends EventEmitter {
	    constructor(canvas, settings) {
	        super();
	        this.options = defaultRenderSettings;
	        this.timeUnits = 'ms';
	        this.styles = defaultRenderStyles;
	        this.blockPaddingLeftRight = 0;
	        this.blockHeight = 0;
	        this.blockPaddingTopBottom = 0;
	        this.charHeight = 0;
	        this.placeholderWidth = 0;
	        this.avgCharWidth = 0;
	        this.minTextWidth = 0;
	        this.queue = {};
	        this.zoom = 0;
	        this.positionX = 0;
	        this.min = 0;
	        this.max = 0;
	        this.patterns = {};
	        this.ctxCachedSettings = {};
	        this.ctxCachedCalls = {};
	        this.setCtxValue = (field, value) => {
	            if (this.ctxCachedSettings[field] !== value) {
	                this.ctx[field] = value;
	                this.ctxCachedSettings[field] = value;
	            }
	        };
	        this.callCtx = (fn, value) => {
	            if (!this.ctxCachedCalls[fn] || this.ctxCachedCalls[fn] !== value) {
	                this.ctx[fn](value);
	                this.ctxCachedCalls[fn] = value;
	            }
	        };
	        this.width = canvas.width;
	        this.height = canvas.height;
	        this.isSafari = checkSafari();
	        this.canvas = canvas;
	        this.ctx = canvas.getContext('2d', { alpha: false });
	        this.pixelRatio = getPixelRatio(this.ctx);
	        this.setSettings(settings);
	        this.applyCanvasSize();
	        this.reset();
	    }
	    setSettings({ options, styles, patterns }) {
	        this.options = mergeObjects(defaultRenderSettings, options);
	        this.styles = mergeObjects(defaultRenderStyles, styles);
	        if (patterns) {
	            const customPatterns = patterns.filter((preset) => 'creator' in preset);
	            const defaultPatterns = patterns.filter((preset) => !('creator' in preset));
	            defaultPatterns.forEach((pattern) => this.createDefaultPattern(pattern));
	            customPatterns.forEach((pattern) => this.createBlockPattern(pattern));
	        }
	        this.timeUnits = this.options.timeUnits;
	        this.blockHeight = this.styles.blockHeight;
	        this.ctx.font = this.styles.font;
	        const { actualBoundingBoxAscent: fontAscent, actualBoundingBoxDescent: fontDescent, width: allCharsWidth, } = this.ctx.measureText(allChars);
	        const { width: placeholderWidth } = this.ctx.measureText('…');
	        const fontHeight = fontAscent + fontDescent;
	        this.blockPaddingLeftRight = this.styles.blockPaddingLeftRight;
	        this.blockPaddingTopBottom = Math.ceil((this.blockHeight - fontHeight) / 2);
	        this.charHeight = fontHeight + 1;
	        this.placeholderWidth = placeholderWidth;
	        this.avgCharWidth = allCharsWidth / allChars.length;
	        this.minTextWidth = this.avgCharWidth + this.placeholderWidth;
	    }
	    reset() {
	        this.queue = {};
	        this.ctxCachedCalls = {};
	        this.ctxCachedSettings = {};
	    }
	    setCtxShadow(shadow) {
	        var _a, _b;
	        this.setCtxValue('shadowBlur', shadow.blur);
	        this.setCtxValue('shadowColor', shadow.color);
	        this.setCtxValue('shadowOffsetY', (_a = shadow.offsetY) !== null && _a !== void 0 ? _a : 0);
	        this.setCtxValue('shadowOffsetX', (_b = shadow.offsetX) !== null && _b !== void 0 ? _b : 0);
	    }
	    setCtxFont(font) {
	        if (font && this.ctx.font !== font) {
	            this.ctx.font = font;
	        }
	    }
	    fillRect(x, y, w, h) {
	        this.ctx.fillRect(x, y, w, h);
	    }
	    fillText(text, x, y) {
	        this.ctx.fillText(text, x, y);
	    }
	    renderBlock(x, y, w, h) {
	        this.ctx.fillRect(x, y, w, h !== null && h !== void 0 ? h : this.blockHeight);
	    }
	    renderStroke(color, x, y, w, h) {
	        this.setCtxValue('strokeStyle', color);
	        this.ctx.setLineDash([]);
	        this.ctx.strokeRect(x, y, w, h);
	    }
	    clear(w = this.width, h = this.height, x = 0, y = 0) {
	        this.setCtxValue('fillStyle', this.styles.backgroundColor);
	        this.ctx.clearRect(x, y, w, h - 1);
	        this.ctx.fillRect(x, y, w, h);
	        this.ctxCachedCalls = {};
	        this.ctxCachedSettings = {};
	        this.emit('clear');
	    }
	    timeToPosition(time) {
	        return time * this.zoom - this.positionX * this.zoom;
	    }
	    pixelToTime(width) {
	        return width / this.zoom;
	    }
	    setZoom(zoom) {
	        this.zoom = zoom;
	    }
	    setPositionX(x) {
	        const currentPos = this.positionX;
	        this.positionX = x;
	        return x - currentPos;
	    }
	    getQueue(priority = 0) {
	        const queue = this.queue[priority];
	        if (!queue) {
	            this.queue[priority] = { text: [], stroke: [], rect: {} };
	        }
	        return this.queue[priority];
	    }
	    addRect(rect, priority = 0) {
	        const queue = this.getQueue(priority);
	        rect.pattern = rect.pattern || 'none';
	        if (!queue.rect[rect.pattern]) {
	            queue.rect[rect.pattern] = {};
	        }
	        if (!queue.rect[rect.pattern][rect.color]) {
	            queue.rect[rect.pattern][rect.color] = [];
	        }
	        queue.rect[rect.pattern][rect.color].push(rect);
	    }
	    addText({ text, x, y, w }, priority = 0) {
	        if (text) {
	            const textMaxWidth = w - (this.blockPaddingLeftRight * 2 - (x < 0 ? x : 0));
	            if (textMaxWidth > 0) {
	                const queue = this.getQueue(priority);
	                queue.text.push({ text, x, y, w, textMaxWidth });
	            }
	        }
	    }
	    addStroke(stroke, priority = 0) {
	        const queue = this.getQueue(priority);
	        queue.stroke.push(stroke);
	    }
	    resolveQueue() {
	        Object.keys(this.queue)
	            .map((priority) => parseInt(priority))
	            .sort()
	            .forEach((priority) => {
	            const { rect, text, stroke } = this.queue[priority];
	            this.renderRects(rect);
	            this.renderTexts(text);
	            this.renderStrokes(stroke);
	        });
	        this.queue = {};
	    }
	    renderRects(rects) {
	        Object.entries(rects).forEach(([patternName, colors]) => {
	            var _a;
	            let matrix = new DOMMatrixReadOnly();
	            let scale = 1;
	            let pattern;
	            if (patternName !== 'none' && this.patterns[patternName]) {
	                scale = (_a = this.patterns[patternName].scale) !== null && _a !== void 0 ? _a : scale;
	                pattern = this.patterns[patternName].pattern;
	                if (scale !== 1) {
	                    matrix = matrix.scale(1 / scale, 1 / scale);
	                }
	                this.ctx.fillStyle = pattern;
	                this.ctxCachedSettings['fillStyle'] = patternName;
	            }
	            Object.entries(colors).forEach(([color, items]) => {
	                if (!pattern) {
	                    this.setCtxValue('fillStyle', color);
	                }
	                items.forEach((rect) => {
	                    if (pattern) {
	                        pattern.setTransform(matrix.translate(rect.x * scale, 0));
	                    }
	                    this.renderBlock(rect.x, rect.y, rect.w, rect.h);
	                });
	            });
	        });
	    }
	    renderTexts(texts) {
	        this.setCtxValue('fillStyle', this.styles.fontColor);
	        texts.forEach(({ text, x, y, textMaxWidth }) => {
	            const { width: textWidth } = this.ctx.measureText(text);
	            if (textWidth > textMaxWidth) {
	                const avgCharWidth = textWidth / text.length;
	                const maxChars = Math.floor((textMaxWidth - this.placeholderWidth) / avgCharWidth);
	                const halfChars = (maxChars - 1) / 2;
	                if (halfChars > 0) {
	                    text =
	                        text.slice(0, Math.ceil(halfChars)) +
	                            '…' +
	                            text.slice(text.length - Math.floor(halfChars), text.length);
	                }
	                else {
	                    text = '';
	                }
	            }
	            if (text) {
	                this.ctx.fillText(text, (x < 0 ? 0 : x) + this.blockPaddingLeftRight, y + this.blockHeight - this.blockPaddingTopBottom);
	            }
	        });
	    }
	    renderStrokes(strokes) {
	        strokes.forEach(({ color, x, y, w, h }) => {
	            this.renderStroke(color, x, y, w, h);
	        });
	    }
	    setMinMax(min, max) {
	        const hasChanges = min !== this.min || max !== this.max;
	        this.min = min;
	        this.max = max;
	        if (hasChanges) {
	            this.emit('min-max-change', min, max);
	        }
	    }
	    getTimeUnits() {
	        return this.timeUnits;
	    }
	    tryToChangePosition(positionDelta) {
	        const realView = this.getRealView();
	        if (this.positionX + positionDelta + realView <= this.max && this.positionX + positionDelta >= this.min) {
	            this.setPositionX(this.positionX + positionDelta);
	        }
	        else if (this.positionX + positionDelta <= this.min) {
	            this.setPositionX(this.min);
	        }
	        else if (this.positionX + positionDelta + realView >= this.max) {
	            this.setPositionX(this.max - realView);
	        }
	    }
	    getInitialZoom() {
	        if (this.max - this.min > 0) {
	            return this.width / (this.max - this.min);
	        }
	        return 1;
	    }
	    getRealView() {
	        return this.width / this.zoom;
	    }
	    resetView() {
	        this.setZoom(this.getInitialZoom());
	        this.setPositionX(this.min);
	    }
	    resize(width, height) {
	        const isWidthChanged = typeof width === 'number' && this.width !== width;
	        const isHeightChanged = typeof height === 'number' && this.height !== height;
	        if (isWidthChanged || isHeightChanged) {
	            this.width = isWidthChanged ? width : this.width;
	            this.height = isHeightChanged ? height : this.height;
	            this.applyCanvasSize();
	            this.emit('resize', { width: this.width, height: this.height });
	            return isHeightChanged;
	        }
	        return false;
	    }
	    applyCanvasSize() {
	        this.canvas.style.backgroundColor = 'white';
	        this.canvas.style.overflow = 'hidden';
	        this.canvas.style.width = this.width + 'px';
	        this.canvas.style.height = this.height + 'px';
	        this.canvas.width = this.width * this.pixelRatio;
	        this.canvas.height = this.height * this.pixelRatio;
	        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
	        this.ctx.font = this.styles.font;
	    }
	    copy(engine) {
	        const ratio = this.isSafari ? 1 : engine.pixelRatio;
	        if (engine.canvas.height) {
	            this.ctx.drawImage(engine.canvas, 0, 0, engine.canvas.width * ratio, engine.canvas.height * ratio, 0, engine.position || 0, engine.width * ratio, engine.height * ratio);
	        }
	    }
	    createDefaultPattern({ name, type, config }) {
	        const defaultPattern = defaultPatterns[type];
	        if (defaultPattern) {
	            this.createBlockPattern({
	                name,
	                creator: defaultPattern(config),
	            });
	        }
	    }
	    createCachedDefaultPattern(pattern) {
	        if (!this.patterns[pattern.name]) {
	            this.createDefaultPattern(pattern);
	        }
	    }
	    createBlockPattern({ name, creator }) {
	        this.patterns[name] = creator(this);
	    }
	    renderTooltipFromData(fields, mouse) {
	        const mouseX = mouse.x + 10;
	        const mouseY = mouse.y + 10;
	        const maxWidth = fields
	            .map(({ text }) => text)
	            .map((text) => this.ctx.measureText(text))
	            .reduce((acc, { width }) => Math.max(acc, width), 0);
	        const fullWidth = maxWidth + this.blockPaddingLeftRight * 2;
	        this.setCtxShadow({
	            color: this.styles.tooltipShadowColor,
	            blur: this.styles.tooltipShadowBlur,
	            offsetX: this.styles.tooltipShadowOffsetX,
	            offsetY: this.styles.tooltipShadowOffsetY,
	        });
	        this.setCtxValue('fillStyle', this.styles.tooltipBackgroundColor);
	        this.ctx.fillRect(mouseX, mouseY, fullWidth + this.blockPaddingLeftRight * 2, (this.charHeight + 2) * fields.length + this.blockPaddingLeftRight * 2);
	        this.setCtxShadow({
	            color: 'transparent',
	            blur: 0,
	        });
	        fields.forEach(({ text, color }, index) => {
	            if (color) {
	                this.setCtxValue('fillStyle', color);
	            }
	            else if (!index) {
	                this.setCtxValue('fillStyle', this.styles.tooltipHeaderFontColor);
	            }
	            else {
	                this.setCtxValue('fillStyle', this.styles.tooltipBodyFontColor);
	            }
	            this.ctx.fillText(text, mouseX + this.blockPaddingLeftRight, mouseY + this.blockHeight - this.blockPaddingTopBottom + (this.charHeight + 2) * index);
	        });
	    }
	    renderShape(color, dots, posX, posY) {
	        this.setCtxValue('fillStyle', color);
	        this.ctx.beginPath();
	        this.ctx.moveTo(dots[0].x + posX, dots[0].y + posY);
	        dots.slice(1).forEach(({ x, y }) => this.ctx.lineTo(x + posX, y + posY));
	        this.ctx.closePath();
	        this.ctx.fill();
	    }
	    renderTriangle(color, x, y, width, height, direction) {
	        this.renderShape(color, getTrianglePoints(width, height, direction).map(({ x, y }) => ({
	            x: x - width / 2,
	            y: y - height / 2,
	        })), x, y);
	    }
	    renderCircle(color, x, y, radius) {
	        this.ctx.beginPath();
	        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
	        this.setCtxValue('fillStyle', color);
	        this.ctx.fill();
	    }
	}

	const MIN_PIXEL_DELTA = 85;
	const defaultTimeGridStyles = {
	    color: 'rgba(90,90,90,0.20)',
	};
	class TimeGrid {
	    constructor(settings) {
	        this.styles = defaultTimeGridStyles;
	        this.timeUnits = 'ms';
	        this.start = 0;
	        this.end = 0;
	        this.accuracy = 0;
	        this.delta = 0;
	        this.setSettings(settings);
	    }
	    setDefaultRenderEngine(renderEngine) {
	        this.renderEngine = renderEngine;
	        this.timeUnits = this.renderEngine.getTimeUnits();
	    }
	    setSettings({ styles }) {
	        this.styles = mergeObjects(defaultTimeGridStyles, styles);
	        if (this.renderEngine) {
	            this.timeUnits = this.renderEngine.getTimeUnits();
	        }
	    }
	    recalc() {
	        const timeWidth = this.renderEngine.max - this.renderEngine.min;
	        const initialLinesCount = this.renderEngine.width / MIN_PIXEL_DELTA;
	        const initialTimeLineDelta = timeWidth / initialLinesCount;
	        const realView = this.renderEngine.getRealView();
	        const proportion = realView / (timeWidth || 1);
	        this.delta = initialTimeLineDelta / Math.pow(2, Math.floor(Math.log2(1 / proportion)));
	        this.start = Math.floor((this.renderEngine.positionX - this.renderEngine.min) / this.delta);
	        this.end = Math.ceil(realView / this.delta) + this.start;
	        this.accuracy = this.calcNumberFix();
	    }
	    calcNumberFix() {
	        var _a;
	        const strTimelineDelta = (this.delta / 2).toString();
	        if (strTimelineDelta.includes('e')) {
	            return Number((_a = strTimelineDelta.match(/\d+$/)) === null || _a === void 0 ? void 0 : _a[0]);
	        }
	        const zeros = strTimelineDelta.match(/(0\.0*)/);
	        return zeros ? zeros[0].length - 1 : 0;
	    }
	    getTimelineAccuracy() {
	        return this.accuracy;
	    }
	    forEachTime(cb) {
	        for (let i = this.start; i <= this.end; i++) {
	            const timePosition = i * this.delta + this.renderEngine.min;
	            const pixelPosition = this.renderEngine.timeToPosition(Number(timePosition.toFixed(this.accuracy)));
	            cb(pixelPosition, timePosition);
	        }
	    }
	    renderLines(start, height, renderEngine = this.renderEngine) {
	        renderEngine.setCtxValue('fillStyle', this.styles.color);
	        this.forEachTime((pixelPosition) => {
	            renderEngine.fillRect(pixelPosition, start, 1, height);
	        });
	    }
	    renderTimes(renderEngine = this.renderEngine) {
	        renderEngine.setCtxValue('fillStyle', renderEngine.styles.fontColor);
	        renderEngine.setCtxFont(renderEngine.styles.font);
	        this.forEachTime((pixelPosition, timePosition) => {
	            renderEngine.fillText(timePosition.toFixed(this.accuracy) + this.timeUnits, pixelPosition + renderEngine.blockPaddingLeftRight, renderEngine.charHeight);
	        });
	    }
	}

	class UIPlugin extends EventEmitter {
	    constructor(name) {
	        super();
	        this.name = name;
	    }
	    init(renderEngine, interactionsEngine) {
	        this.renderEngine = renderEngine;
	        this.interactionsEngine = interactionsEngine;
	    }
	}

	const defaultTimeGridPluginStyles = {
	    font: '10px sans-serif',
	    fontColor: 'black',
	};
	class TimeGridPlugin extends UIPlugin {
	    constructor(settings = {}) {
	        super('timeGridPlugin');
	        this.styles = defaultTimeGridPluginStyles;
	        this.height = 0;
	        this.setSettings(settings);
	    }
	    setSettings({ styles }) {
	        this.styles = mergeObjects(defaultTimeGridPluginStyles, styles);
	        if (this.renderEngine) {
	            this.overrideEngineSettings();
	        }
	    }
	    overrideEngineSettings() {
	        this.renderEngine.setSettingsOverrides({ styles: this.styles });
	        this.height = Math.round(this.renderEngine.charHeight + 10);
	    }
	    init(renderEngine, interactionsEngine) {
	        super.init(renderEngine, interactionsEngine);
	        this.overrideEngineSettings();
	    }
	    render() {
	        this.renderEngine.parent.timeGrid.renderTimes(this.renderEngine);
	        this.renderEngine.parent.timeGrid.renderLines(0, this.renderEngine.height, this.renderEngine);
	        return true;
	    }
	}

	const MIN_BLOCK_SIZE = 1;
	const STICK_DISTANCE = 0.25;
	const MIN_CLUSTER_SIZE = MIN_BLOCK_SIZE * 2 + STICK_DISTANCE;
	const walk = (treeList, cb, parent = null, level = 0) => {
	    treeList.forEach((child) => {
	        const res = cb(child, parent, level);
	        if (child.children) {
	            walk(child.children, cb, res || child, level + 1);
	        }
	    });
	};
	const flatTree = (treeList) => {
	    const result = [];
	    let index = 0;
	    walk(treeList, (node, parent, level) => {
	        const newNode = {
	            source: node,
	            end: node.start + node.duration,
	            parent,
	            level,
	            index: index++,
	        };
	        result.push(newNode);
	        return newNode;
	    });
	    return result.sort((a, b) => a.level - b.level || a.source.start - b.source.start);
	};
	const getFlatTreeMinMax = (flatTree) => {
	    let isFirst = true;
	    let min = 0;
	    let max = 0;
	    flatTree.forEach(({ source: { start }, end }) => {
	        if (isFirst) {
	            min = start;
	            max = end;
	            isFirst = false;
	        }
	        else {
	            min = min < start ? min : start;
	            max = max > end ? max : end;
	        }
	    });
	    return { min, max };
	};
	const calcClusterDuration = (nodes) => {
	    const firstNode = nodes[0];
	    const lastNode = last(nodes);
	    return lastNode.source.start + lastNode.source.duration - firstNode.source.start;
	};
	const checkNodeTimeboundNesting = (node, start, end) => (node.source.start < end && node.end > start) || (node.source.start > start && node.end < end);
	const checkClusterTimeboundNesting = (node, start, end) => (node.start < end && node.end > start) || (node.start > start && node.end < end);
	const defaultClusterizeCondition = (prevNode, node) => prevNode.source.color === node.source.color &&
	    prevNode.source.pattern === node.source.pattern &&
	    prevNode.source.type === node.source.type;
	function metaClusterizeFlatTree(flatTree, condition = defaultClusterizeCondition) {
	    return flatTree
	        .reduce((acc, node) => {
	        const lastCluster = last(acc);
	        const lastNode = lastCluster && last(lastCluster);
	        if (lastNode && lastNode.level === node.level && condition(lastNode, node)) {
	            lastCluster.push(node);
	        }
	        else {
	            acc.push([node]);
	        }
	        return acc;
	    }, [])
	        .filter((nodes) => nodes.length)
	        .map((nodes) => ({
	        nodes,
	    }));
	}
	const clusterizeFlatTree = (metaClusterizedFlatTree, zoom, start = 0, end = 0, stickDistance = STICK_DISTANCE, minBlockSize = MIN_BLOCK_SIZE) => {
	    let lastCluster = null;
	    let lastNode = null;
	    let index = 0;
	    return metaClusterizedFlatTree
	        .reduce((acc, { nodes }) => {
	        lastCluster = null;
	        lastNode = null;
	        index = 0;
	        for (const node of nodes) {
	            if (checkNodeTimeboundNesting(node, start, end)) {
	                if (lastCluster && !lastNode) {
	                    lastCluster[index] = node;
	                    index++;
	                }
	                else if (lastCluster &&
	                    lastNode &&
	                    (node.source.start - (lastNode.source.start + lastNode.source.duration)) * zoom <
	                        stickDistance &&
	                    node.source.duration * zoom < minBlockSize &&
	                    lastNode.source.duration * zoom < minBlockSize) {
	                    lastCluster[index] = node;
	                    index++;
	                }
	                else {
	                    lastCluster = [node];
	                    index = 1;
	                    acc.push(lastCluster);
	                }
	                lastNode = node;
	            }
	        }
	        return acc;
	    }, [])
	        .map((nodes) => {
	        var _a;
	        const node = nodes[0];
	        const duration = calcClusterDuration(nodes);
	        const badge = (_a = nodes.find((node) => node.source.badge)) === null || _a === void 0 ? void 0 : _a.source.badge;
	        return {
	            start: node.source.start,
	            end: node.source.start + duration,
	            duration,
	            type: node.source.type,
	            color: node.source.color,
	            pattern: node.source.pattern,
	            level: node.level,
	            badge,
	            nodes,
	        };
	    });
	};
	const reclusterizeClusteredFlatTree = (clusteredFlatTree, zoom, start, end, stickDistance, minBlockSize) => {
	    return clusteredFlatTree.reduce((acc, cluster) => {
	        if (checkClusterTimeboundNesting(cluster, start, end)) {
	            if (cluster.duration * zoom <= MIN_CLUSTER_SIZE) {
	                acc.push(cluster);
	            }
	            else {
	                acc.push(...clusterizeFlatTree([cluster], zoom, start, end, stickDistance, minBlockSize));
	            }
	        }
	        return acc;
	    }, []);
	};

	function getValueByChoice(array, property, comparator, defaultValue) {
	    if (array.length) {
	        return array.reduce((acc, { [property]: value }) => comparator(acc, value), array[0][property]);
	    }
	    return defaultValue;
	}
	const parseWaterfall = (waterfall) => {
	    return waterfall.items
	        .map(({ name, intervals, timing, meta }, index) => {
	        const resolvedIntervals = typeof intervals === 'string' ? waterfall.intervals[intervals] : intervals;
	        const preparedIntervals = resolvedIntervals
	            .map(({ start, end, ...rest }) => ({
	            start: typeof start === 'string' ? timing[start] : start,
	            end: typeof end === 'string' ? timing[end] : end,
	            ...rest,
	        }))
	            .filter(({ start, end }) => typeof start === 'number' && typeof end === 'number');
	        const blocks = preparedIntervals.filter(({ type }) => type === 'block');
	        const blockStart = getValueByChoice(blocks, 'start', Math.min, 0);
	        const blockEnd = getValueByChoice(blocks, 'end', Math.max, 0);
	        const min = getValueByChoice(preparedIntervals, 'start', Math.min, 0);
	        const max = getValueByChoice(preparedIntervals, 'end', Math.max, 0);
	        return {
	            intervals: preparedIntervals,
	            textBlock: {
	                start: blockStart,
	                end: blockEnd,
	            },
	            name,
	            timing,
	            min,
	            max,
	            index,
	            meta,
	        };
	    })
	        .filter(({ intervals }) => intervals.length)
	        .sort((a, b) => a.min - b.min || b.max - a.max);
	};

	var colorString$1 = {exports: {}};

	var colorName = {
		"aliceblue": [240, 248, 255],
		"antiquewhite": [250, 235, 215],
		"aqua": [0, 255, 255],
		"aquamarine": [127, 255, 212],
		"azure": [240, 255, 255],
		"beige": [245, 245, 220],
		"bisque": [255, 228, 196],
		"black": [0, 0, 0],
		"blanchedalmond": [255, 235, 205],
		"blue": [0, 0, 255],
		"blueviolet": [138, 43, 226],
		"brown": [165, 42, 42],
		"burlywood": [222, 184, 135],
		"cadetblue": [95, 158, 160],
		"chartreuse": [127, 255, 0],
		"chocolate": [210, 105, 30],
		"coral": [255, 127, 80],
		"cornflowerblue": [100, 149, 237],
		"cornsilk": [255, 248, 220],
		"crimson": [220, 20, 60],
		"cyan": [0, 255, 255],
		"darkblue": [0, 0, 139],
		"darkcyan": [0, 139, 139],
		"darkgoldenrod": [184, 134, 11],
		"darkgray": [169, 169, 169],
		"darkgreen": [0, 100, 0],
		"darkgrey": [169, 169, 169],
		"darkkhaki": [189, 183, 107],
		"darkmagenta": [139, 0, 139],
		"darkolivegreen": [85, 107, 47],
		"darkorange": [255, 140, 0],
		"darkorchid": [153, 50, 204],
		"darkred": [139, 0, 0],
		"darksalmon": [233, 150, 122],
		"darkseagreen": [143, 188, 143],
		"darkslateblue": [72, 61, 139],
		"darkslategray": [47, 79, 79],
		"darkslategrey": [47, 79, 79],
		"darkturquoise": [0, 206, 209],
		"darkviolet": [148, 0, 211],
		"deeppink": [255, 20, 147],
		"deepskyblue": [0, 191, 255],
		"dimgray": [105, 105, 105],
		"dimgrey": [105, 105, 105],
		"dodgerblue": [30, 144, 255],
		"firebrick": [178, 34, 34],
		"floralwhite": [255, 250, 240],
		"forestgreen": [34, 139, 34],
		"fuchsia": [255, 0, 255],
		"gainsboro": [220, 220, 220],
		"ghostwhite": [248, 248, 255],
		"gold": [255, 215, 0],
		"goldenrod": [218, 165, 32],
		"gray": [128, 128, 128],
		"green": [0, 128, 0],
		"greenyellow": [173, 255, 47],
		"grey": [128, 128, 128],
		"honeydew": [240, 255, 240],
		"hotpink": [255, 105, 180],
		"indianred": [205, 92, 92],
		"indigo": [75, 0, 130],
		"ivory": [255, 255, 240],
		"khaki": [240, 230, 140],
		"lavender": [230, 230, 250],
		"lavenderblush": [255, 240, 245],
		"lawngreen": [124, 252, 0],
		"lemonchiffon": [255, 250, 205],
		"lightblue": [173, 216, 230],
		"lightcoral": [240, 128, 128],
		"lightcyan": [224, 255, 255],
		"lightgoldenrodyellow": [250, 250, 210],
		"lightgray": [211, 211, 211],
		"lightgreen": [144, 238, 144],
		"lightgrey": [211, 211, 211],
		"lightpink": [255, 182, 193],
		"lightsalmon": [255, 160, 122],
		"lightseagreen": [32, 178, 170],
		"lightskyblue": [135, 206, 250],
		"lightslategray": [119, 136, 153],
		"lightslategrey": [119, 136, 153],
		"lightsteelblue": [176, 196, 222],
		"lightyellow": [255, 255, 224],
		"lime": [0, 255, 0],
		"limegreen": [50, 205, 50],
		"linen": [250, 240, 230],
		"magenta": [255, 0, 255],
		"maroon": [128, 0, 0],
		"mediumaquamarine": [102, 205, 170],
		"mediumblue": [0, 0, 205],
		"mediumorchid": [186, 85, 211],
		"mediumpurple": [147, 112, 219],
		"mediumseagreen": [60, 179, 113],
		"mediumslateblue": [123, 104, 238],
		"mediumspringgreen": [0, 250, 154],
		"mediumturquoise": [72, 209, 204],
		"mediumvioletred": [199, 21, 133],
		"midnightblue": [25, 25, 112],
		"mintcream": [245, 255, 250],
		"mistyrose": [255, 228, 225],
		"moccasin": [255, 228, 181],
		"navajowhite": [255, 222, 173],
		"navy": [0, 0, 128],
		"oldlace": [253, 245, 230],
		"olive": [128, 128, 0],
		"olivedrab": [107, 142, 35],
		"orange": [255, 165, 0],
		"orangered": [255, 69, 0],
		"orchid": [218, 112, 214],
		"palegoldenrod": [238, 232, 170],
		"palegreen": [152, 251, 152],
		"paleturquoise": [175, 238, 238],
		"palevioletred": [219, 112, 147],
		"papayawhip": [255, 239, 213],
		"peachpuff": [255, 218, 185],
		"peru": [205, 133, 63],
		"pink": [255, 192, 203],
		"plum": [221, 160, 221],
		"powderblue": [176, 224, 230],
		"purple": [128, 0, 128],
		"rebeccapurple": [102, 51, 153],
		"red": [255, 0, 0],
		"rosybrown": [188, 143, 143],
		"royalblue": [65, 105, 225],
		"saddlebrown": [139, 69, 19],
		"salmon": [250, 128, 114],
		"sandybrown": [244, 164, 96],
		"seagreen": [46, 139, 87],
		"seashell": [255, 245, 238],
		"sienna": [160, 82, 45],
		"silver": [192, 192, 192],
		"skyblue": [135, 206, 235],
		"slateblue": [106, 90, 205],
		"slategray": [112, 128, 144],
		"slategrey": [112, 128, 144],
		"snow": [255, 250, 250],
		"springgreen": [0, 255, 127],
		"steelblue": [70, 130, 180],
		"tan": [210, 180, 140],
		"teal": [0, 128, 128],
		"thistle": [216, 191, 216],
		"tomato": [255, 99, 71],
		"turquoise": [64, 224, 208],
		"violet": [238, 130, 238],
		"wheat": [245, 222, 179],
		"white": [255, 255, 255],
		"whitesmoke": [245, 245, 245],
		"yellow": [255, 255, 0],
		"yellowgreen": [154, 205, 50]
	};

	var simpleSwizzle = {exports: {}};

	var isArrayish$1 = function isArrayish(obj) {
		if (!obj || typeof obj === 'string') {
			return false;
		}

		return obj instanceof Array || Array.isArray(obj) ||
			(obj.length >= 0 && (obj.splice instanceof Function ||
				(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
	};

	var isArrayish = isArrayish$1;

	var concat = Array.prototype.concat;
	var slice = Array.prototype.slice;

	var swizzle$1 = simpleSwizzle.exports = function swizzle(args) {
		var results = [];

		for (var i = 0, len = args.length; i < len; i++) {
			var arg = args[i];

			if (isArrayish(arg)) {
				// http://jsperf.com/javascript-array-concat-vs-push/98
				results = concat.call(results, slice.call(arg));
			} else {
				results.push(arg);
			}
		}

		return results;
	};

	swizzle$1.wrap = function (fn) {
		return function () {
			return fn(swizzle$1(arguments));
		};
	};

	var simpleSwizzleExports = simpleSwizzle.exports;

	/* MIT license */

	var colorNames = colorName;
	var swizzle = simpleSwizzleExports;
	var hasOwnProperty = Object.hasOwnProperty;

	var reverseNames = Object.create(null);

	// create a list of reverse color names
	for (var name in colorNames) {
		if (hasOwnProperty.call(colorNames, name)) {
			reverseNames[colorNames[name]] = name;
		}
	}

	var cs = colorString$1.exports = {
		to: {},
		get: {}
	};

	cs.get = function (string) {
		var prefix = string.substring(0, 3).toLowerCase();
		var val;
		var model;
		switch (prefix) {
			case 'hsl':
				val = cs.get.hsl(string);
				model = 'hsl';
				break;
			case 'hwb':
				val = cs.get.hwb(string);
				model = 'hwb';
				break;
			default:
				val = cs.get.rgb(string);
				model = 'rgb';
				break;
		}

		if (!val) {
			return null;
		}

		return {model: model, value: val};
	};

	cs.get.rgb = function (string) {
		if (!string) {
			return null;
		}

		var abbr = /^#([a-f0-9]{3,4})$/i;
		var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
		var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
		var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
		var keyword = /^(\w+)$/;

		var rgb = [0, 0, 0, 1];
		var match;
		var i;
		var hexAlpha;

		if (match = string.match(hex)) {
			hexAlpha = match[2];
			match = match[1];

			for (i = 0; i < 3; i++) {
				// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
				var i2 = i * 2;
				rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
			}

			if (hexAlpha) {
				rgb[3] = parseInt(hexAlpha, 16) / 255;
			}
		} else if (match = string.match(abbr)) {
			match = match[1];
			hexAlpha = match[3];

			for (i = 0; i < 3; i++) {
				rgb[i] = parseInt(match[i] + match[i], 16);
			}

			if (hexAlpha) {
				rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
			}
		} else if (match = string.match(rgba)) {
			for (i = 0; i < 3; i++) {
				rgb[i] = parseInt(match[i + 1], 0);
			}

			if (match[4]) {
				if (match[5]) {
					rgb[3] = parseFloat(match[4]) * 0.01;
				} else {
					rgb[3] = parseFloat(match[4]);
				}
			}
		} else if (match = string.match(per)) {
			for (i = 0; i < 3; i++) {
				rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
			}

			if (match[4]) {
				if (match[5]) {
					rgb[3] = parseFloat(match[4]) * 0.01;
				} else {
					rgb[3] = parseFloat(match[4]);
				}
			}
		} else if (match = string.match(keyword)) {
			if (match[1] === 'transparent') {
				return [0, 0, 0, 0];
			}

			if (!hasOwnProperty.call(colorNames, match[1])) {
				return null;
			}

			rgb = colorNames[match[1]];
			rgb[3] = 1;

			return rgb;
		} else {
			return null;
		}

		for (i = 0; i < 3; i++) {
			rgb[i] = clamp(rgb[i], 0, 255);
		}
		rgb[3] = clamp(rgb[3], 0, 1);

		return rgb;
	};

	cs.get.hsl = function (string) {
		if (!string) {
			return null;
		}

		var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
		var match = string.match(hsl);

		if (match) {
			var alpha = parseFloat(match[4]);
			var h = ((parseFloat(match[1]) % 360) + 360) % 360;
			var s = clamp(parseFloat(match[2]), 0, 100);
			var l = clamp(parseFloat(match[3]), 0, 100);
			var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

			return [h, s, l, a];
		}

		return null;
	};

	cs.get.hwb = function (string) {
		if (!string) {
			return null;
		}

		var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
		var match = string.match(hwb);

		if (match) {
			var alpha = parseFloat(match[4]);
			var h = ((parseFloat(match[1]) % 360) + 360) % 360;
			var w = clamp(parseFloat(match[2]), 0, 100);
			var b = clamp(parseFloat(match[3]), 0, 100);
			var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
			return [h, w, b, a];
		}

		return null;
	};

	cs.to.hex = function () {
		var rgba = swizzle(arguments);

		return (
			'#' +
			hexDouble(rgba[0]) +
			hexDouble(rgba[1]) +
			hexDouble(rgba[2]) +
			(rgba[3] < 1
				? (hexDouble(Math.round(rgba[3] * 255)))
				: '')
		);
	};

	cs.to.rgb = function () {
		var rgba = swizzle(arguments);

		return rgba.length < 4 || rgba[3] === 1
			? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
			: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
	};

	cs.to.rgb.percent = function () {
		var rgba = swizzle(arguments);

		var r = Math.round(rgba[0] / 255 * 100);
		var g = Math.round(rgba[1] / 255 * 100);
		var b = Math.round(rgba[2] / 255 * 100);

		return rgba.length < 4 || rgba[3] === 1
			? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
			: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
	};

	cs.to.hsl = function () {
		var hsla = swizzle(arguments);
		return hsla.length < 4 || hsla[3] === 1
			? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
			: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
	};

	// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
	// (hwb have alpha optional & 1 is default value)
	cs.to.hwb = function () {
		var hwba = swizzle(arguments);

		var a = '';
		if (hwba.length >= 4 && hwba[3] !== 1) {
			a = ', ' + hwba[3];
		}

		return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
	};

	cs.to.keyword = function (rgb) {
		return reverseNames[rgb.slice(0, 3)];
	};

	// helpers
	function clamp(num, min, max) {
		return Math.min(Math.max(min, num), max);
	}

	function hexDouble(num) {
		var str = Math.round(num).toString(16).toUpperCase();
		return (str.length < 2) ? '0' + str : str;
	}

	var colorStringExports = colorString$1.exports;

	var conversions$2 = {exports: {}};

	/* MIT license */

	var cssKeywords = colorName;

	// NOTE: conversions should only return primitive values (i.e. arrays, or
	//       values that give correct `typeof` results).
	//       do not use box values types (i.e. Number(), String(), etc.)

	var reverseKeywords = {};
	for (var key in cssKeywords) {
		if (cssKeywords.hasOwnProperty(key)) {
			reverseKeywords[cssKeywords[key]] = key;
		}
	}

	var convert$2 = conversions$2.exports = {
		rgb: {channels: 3, labels: 'rgb'},
		hsl: {channels: 3, labels: 'hsl'},
		hsv: {channels: 3, labels: 'hsv'},
		hwb: {channels: 3, labels: 'hwb'},
		cmyk: {channels: 4, labels: 'cmyk'},
		xyz: {channels: 3, labels: 'xyz'},
		lab: {channels: 3, labels: 'lab'},
		lch: {channels: 3, labels: 'lch'},
		hex: {channels: 1, labels: ['hex']},
		keyword: {channels: 1, labels: ['keyword']},
		ansi16: {channels: 1, labels: ['ansi16']},
		ansi256: {channels: 1, labels: ['ansi256']},
		hcg: {channels: 3, labels: ['h', 'c', 'g']},
		apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
		gray: {channels: 1, labels: ['gray']}
	};

	// hide .channels and .labels properties
	for (var model in convert$2) {
		if (convert$2.hasOwnProperty(model)) {
			if (!('channels' in convert$2[model])) {
				throw new Error('missing channels property: ' + model);
			}

			if (!('labels' in convert$2[model])) {
				throw new Error('missing channel labels property: ' + model);
			}

			if (convert$2[model].labels.length !== convert$2[model].channels) {
				throw new Error('channel and label counts mismatch: ' + model);
			}

			var channels = convert$2[model].channels;
			var labels = convert$2[model].labels;
			delete convert$2[model].channels;
			delete convert$2[model].labels;
			Object.defineProperty(convert$2[model], 'channels', {value: channels});
			Object.defineProperty(convert$2[model], 'labels', {value: labels});
		}
	}

	convert$2.rgb.hsl = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var min = Math.min(r, g, b);
		var max = Math.max(r, g, b);
		var delta = max - min;
		var h;
		var s;
		var l;

		if (max === min) {
			h = 0;
		} else if (r === max) {
			h = (g - b) / delta;
		} else if (g === max) {
			h = 2 + (b - r) / delta;
		} else if (b === max) {
			h = 4 + (r - g) / delta;
		}

		h = Math.min(h * 60, 360);

		if (h < 0) {
			h += 360;
		}

		l = (min + max) / 2;

		if (max === min) {
			s = 0;
		} else if (l <= 0.5) {
			s = delta / (max + min);
		} else {
			s = delta / (2 - max - min);
		}

		return [h, s * 100, l * 100];
	};

	convert$2.rgb.hsv = function (rgb) {
		var rdif;
		var gdif;
		var bdif;
		var h;
		var s;

		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var v = Math.max(r, g, b);
		var diff = v - Math.min(r, g, b);
		var diffc = function (c) {
			return (v - c) / 6 / diff + 1 / 2;
		};

		if (diff === 0) {
			h = s = 0;
		} else {
			s = diff / v;
			rdif = diffc(r);
			gdif = diffc(g);
			bdif = diffc(b);

			if (r === v) {
				h = bdif - gdif;
			} else if (g === v) {
				h = (1 / 3) + rdif - bdif;
			} else if (b === v) {
				h = (2 / 3) + gdif - rdif;
			}
			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}

		return [
			h * 360,
			s * 100,
			v * 100
		];
	};

	convert$2.rgb.hwb = function (rgb) {
		var r = rgb[0];
		var g = rgb[1];
		var b = rgb[2];
		var h = convert$2.rgb.hsl(rgb)[0];
		var w = 1 / 255 * Math.min(r, Math.min(g, b));

		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

		return [h, w * 100, b * 100];
	};

	convert$2.rgb.cmyk = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var c;
		var m;
		var y;
		var k;

		k = Math.min(1 - r, 1 - g, 1 - b);
		c = (1 - r - k) / (1 - k) || 0;
		m = (1 - g - k) / (1 - k) || 0;
		y = (1 - b - k) / (1 - k) || 0;

		return [c * 100, m * 100, y * 100, k * 100];
	};

	/**
	 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	 * */
	function comparativeDistance(x, y) {
		return (
			Math.pow(x[0] - y[0], 2) +
			Math.pow(x[1] - y[1], 2) +
			Math.pow(x[2] - y[2], 2)
		);
	}

	convert$2.rgb.keyword = function (rgb) {
		var reversed = reverseKeywords[rgb];
		if (reversed) {
			return reversed;
		}

		var currentClosestDistance = Infinity;
		var currentClosestKeyword;

		for (var keyword in cssKeywords) {
			if (cssKeywords.hasOwnProperty(keyword)) {
				var value = cssKeywords[keyword];

				// Compute comparative distance
				var distance = comparativeDistance(rgb, value);

				// Check if its less, if so set as closest
				if (distance < currentClosestDistance) {
					currentClosestDistance = distance;
					currentClosestKeyword = keyword;
				}
			}
		}

		return currentClosestKeyword;
	};

	convert$2.keyword.rgb = function (keyword) {
		return cssKeywords[keyword];
	};

	convert$2.rgb.xyz = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;

		// assume sRGB
		r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
		g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
		b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

		var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
		var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
		var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

		return [x * 100, y * 100, z * 100];
	};

	convert$2.rgb.lab = function (rgb) {
		var xyz = convert$2.rgb.xyz(rgb);
		var x = xyz[0];
		var y = xyz[1];
		var z = xyz[2];
		var l;
		var a;
		var b;

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

		l = (116 * y) - 16;
		a = 500 * (x - y);
		b = 200 * (y - z);

		return [l, a, b];
	};

	convert$2.hsl.rgb = function (hsl) {
		var h = hsl[0] / 360;
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var t1;
		var t2;
		var t3;
		var rgb;
		var val;

		if (s === 0) {
			val = l * 255;
			return [val, val, val];
		}

		if (l < 0.5) {
			t2 = l * (1 + s);
		} else {
			t2 = l + s - l * s;
		}

		t1 = 2 * l - t2;

		rgb = [0, 0, 0];
		for (var i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * -(i - 1);
			if (t3 < 0) {
				t3++;
			}
			if (t3 > 1) {
				t3--;
			}

			if (6 * t3 < 1) {
				val = t1 + (t2 - t1) * 6 * t3;
			} else if (2 * t3 < 1) {
				val = t2;
			} else if (3 * t3 < 2) {
				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			} else {
				val = t1;
			}

			rgb[i] = val * 255;
		}

		return rgb;
	};

	convert$2.hsl.hsv = function (hsl) {
		var h = hsl[0];
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var smin = s;
		var lmin = Math.max(l, 0.01);
		var sv;
		var v;

		l *= 2;
		s *= (l <= 1) ? l : 2 - l;
		smin *= lmin <= 1 ? lmin : 2 - lmin;
		v = (l + s) / 2;
		sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

		return [h, sv * 100, v * 100];
	};

	convert$2.hsv.rgb = function (hsv) {
		var h = hsv[0] / 60;
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;
		var hi = Math.floor(h) % 6;

		var f = h - Math.floor(h);
		var p = 255 * v * (1 - s);
		var q = 255 * v * (1 - (s * f));
		var t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;

		switch (hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	convert$2.hsv.hsl = function (hsv) {
		var h = hsv[0];
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;
		var vmin = Math.max(v, 0.01);
		var lmin;
		var sl;
		var l;

		l = (2 - s) * v;
		lmin = (2 - s) * vmin;
		sl = s * vmin;
		sl /= (lmin <= 1) ? lmin : 2 - lmin;
		sl = sl || 0;
		l /= 2;

		return [h, sl * 100, l * 100];
	};

	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
	convert$2.hwb.rgb = function (hwb) {
		var h = hwb[0] / 360;
		var wh = hwb[1] / 100;
		var bl = hwb[2] / 100;
		var ratio = wh + bl;
		var i;
		var v;
		var f;
		var n;

		// wh + bl cant be > 1
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}

		i = Math.floor(6 * h);
		v = 1 - bl;
		f = 6 * h - i;

		if ((i & 0x01) !== 0) {
			f = 1 - f;
		}

		n = wh + f * (v - wh); // linear interpolation

		var r;
		var g;
		var b;
		switch (i) {
			default:
			case 6:
			case 0: r = v; g = n; b = wh; break;
			case 1: r = n; g = v; b = wh; break;
			case 2: r = wh; g = v; b = n; break;
			case 3: r = wh; g = n; b = v; break;
			case 4: r = n; g = wh; b = v; break;
			case 5: r = v; g = wh; b = n; break;
		}

		return [r * 255, g * 255, b * 255];
	};

	convert$2.cmyk.rgb = function (cmyk) {
		var c = cmyk[0] / 100;
		var m = cmyk[1] / 100;
		var y = cmyk[2] / 100;
		var k = cmyk[3] / 100;
		var r;
		var g;
		var b;

		r = 1 - Math.min(1, c * (1 - k) + k);
		g = 1 - Math.min(1, m * (1 - k) + k);
		b = 1 - Math.min(1, y * (1 - k) + k);

		return [r * 255, g * 255, b * 255];
	};

	convert$2.xyz.rgb = function (xyz) {
		var x = xyz[0] / 100;
		var y = xyz[1] / 100;
		var z = xyz[2] / 100;
		var r;
		var g;
		var b;

		r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
		g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
		b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

		// assume sRGB
		r = r > 0.0031308
			? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
			: r * 12.92;

		g = g > 0.0031308
			? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
			: g * 12.92;

		b = b > 0.0031308
			? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
			: b * 12.92;

		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);

		return [r * 255, g * 255, b * 255];
	};

	convert$2.xyz.lab = function (xyz) {
		var x = xyz[0];
		var y = xyz[1];
		var z = xyz[2];
		var l;
		var a;
		var b;

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

		l = (116 * y) - 16;
		a = 500 * (x - y);
		b = 200 * (y - z);

		return [l, a, b];
	};

	convert$2.lab.xyz = function (lab) {
		var l = lab[0];
		var a = lab[1];
		var b = lab[2];
		var x;
		var y;
		var z;

		y = (l + 16) / 116;
		x = a / 500 + y;
		z = y - b / 200;

		var y2 = Math.pow(y, 3);
		var x2 = Math.pow(x, 3);
		var z2 = Math.pow(z, 3);
		y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
		x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
		z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

		x *= 95.047;
		y *= 100;
		z *= 108.883;

		return [x, y, z];
	};

	convert$2.lab.lch = function (lab) {
		var l = lab[0];
		var a = lab[1];
		var b = lab[2];
		var hr;
		var h;
		var c;

		hr = Math.atan2(b, a);
		h = hr * 360 / 2 / Math.PI;

		if (h < 0) {
			h += 360;
		}

		c = Math.sqrt(a * a + b * b);

		return [l, c, h];
	};

	convert$2.lch.lab = function (lch) {
		var l = lch[0];
		var c = lch[1];
		var h = lch[2];
		var a;
		var b;
		var hr;

		hr = h / 360 * 2 * Math.PI;
		a = c * Math.cos(hr);
		b = c * Math.sin(hr);

		return [l, a, b];
	};

	convert$2.rgb.ansi16 = function (args) {
		var r = args[0];
		var g = args[1];
		var b = args[2];
		var value = 1 in arguments ? arguments[1] : convert$2.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

		value = Math.round(value / 50);

		if (value === 0) {
			return 30;
		}

		var ansi = 30
			+ ((Math.round(b / 255) << 2)
			| (Math.round(g / 255) << 1)
			| Math.round(r / 255));

		if (value === 2) {
			ansi += 60;
		}

		return ansi;
	};

	convert$2.hsv.ansi16 = function (args) {
		// optimization here; we already know the value and don't need to get
		// it converted for us.
		return convert$2.rgb.ansi16(convert$2.hsv.rgb(args), args[2]);
	};

	convert$2.rgb.ansi256 = function (args) {
		var r = args[0];
		var g = args[1];
		var b = args[2];

		// we use the extended greyscale palette here, with the exception of
		// black and white. normal palette only has 4 greyscale shades.
		if (r === g && g === b) {
			if (r < 8) {
				return 16;
			}

			if (r > 248) {
				return 231;
			}

			return Math.round(((r - 8) / 247) * 24) + 232;
		}

		var ansi = 16
			+ (36 * Math.round(r / 255 * 5))
			+ (6 * Math.round(g / 255 * 5))
			+ Math.round(b / 255 * 5);

		return ansi;
	};

	convert$2.ansi16.rgb = function (args) {
		var color = args % 10;

		// handle greyscale
		if (color === 0 || color === 7) {
			if (args > 50) {
				color += 3.5;
			}

			color = color / 10.5 * 255;

			return [color, color, color];
		}

		var mult = (~~(args > 50) + 1) * 0.5;
		var r = ((color & 1) * mult) * 255;
		var g = (((color >> 1) & 1) * mult) * 255;
		var b = (((color >> 2) & 1) * mult) * 255;

		return [r, g, b];
	};

	convert$2.ansi256.rgb = function (args) {
		// handle greyscale
		if (args >= 232) {
			var c = (args - 232) * 10 + 8;
			return [c, c, c];
		}

		args -= 16;

		var rem;
		var r = Math.floor(args / 36) / 5 * 255;
		var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
		var b = (rem % 6) / 5 * 255;

		return [r, g, b];
	};

	convert$2.rgb.hex = function (args) {
		var integer = ((Math.round(args[0]) & 0xFF) << 16)
			+ ((Math.round(args[1]) & 0xFF) << 8)
			+ (Math.round(args[2]) & 0xFF);

		var string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert$2.hex.rgb = function (args) {
		var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
		if (!match) {
			return [0, 0, 0];
		}

		var colorString = match[0];

		if (match[0].length === 3) {
			colorString = colorString.split('').map(function (char) {
				return char + char;
			}).join('');
		}

		var integer = parseInt(colorString, 16);
		var r = (integer >> 16) & 0xFF;
		var g = (integer >> 8) & 0xFF;
		var b = integer & 0xFF;

		return [r, g, b];
	};

	convert$2.rgb.hcg = function (rgb) {
		var r = rgb[0] / 255;
		var g = rgb[1] / 255;
		var b = rgb[2] / 255;
		var max = Math.max(Math.max(r, g), b);
		var min = Math.min(Math.min(r, g), b);
		var chroma = (max - min);
		var grayscale;
		var hue;

		if (chroma < 1) {
			grayscale = min / (1 - chroma);
		} else {
			grayscale = 0;
		}

		if (chroma <= 0) {
			hue = 0;
		} else
		if (max === r) {
			hue = ((g - b) / chroma) % 6;
		} else
		if (max === g) {
			hue = 2 + (b - r) / chroma;
		} else {
			hue = 4 + (r - g) / chroma + 4;
		}

		hue /= 6;
		hue %= 1;

		return [hue * 360, chroma * 100, grayscale * 100];
	};

	convert$2.hsl.hcg = function (hsl) {
		var s = hsl[1] / 100;
		var l = hsl[2] / 100;
		var c = 1;
		var f = 0;

		if (l < 0.5) {
			c = 2.0 * s * l;
		} else {
			c = 2.0 * s * (1.0 - l);
		}

		if (c < 1.0) {
			f = (l - 0.5 * c) / (1.0 - c);
		}

		return [hsl[0], c * 100, f * 100];
	};

	convert$2.hsv.hcg = function (hsv) {
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;

		var c = s * v;
		var f = 0;

		if (c < 1.0) {
			f = (v - c) / (1 - c);
		}

		return [hsv[0], c * 100, f * 100];
	};

	convert$2.hcg.rgb = function (hcg) {
		var h = hcg[0] / 360;
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		if (c === 0.0) {
			return [g * 255, g * 255, g * 255];
		}

		var pure = [0, 0, 0];
		var hi = (h % 1) * 6;
		var v = hi % 1;
		var w = 1 - v;
		var mg = 0;

		switch (Math.floor(hi)) {
			case 0:
				pure[0] = 1; pure[1] = v; pure[2] = 0; break;
			case 1:
				pure[0] = w; pure[1] = 1; pure[2] = 0; break;
			case 2:
				pure[0] = 0; pure[1] = 1; pure[2] = v; break;
			case 3:
				pure[0] = 0; pure[1] = w; pure[2] = 1; break;
			case 4:
				pure[0] = v; pure[1] = 0; pure[2] = 1; break;
			default:
				pure[0] = 1; pure[1] = 0; pure[2] = w;
		}

		mg = (1.0 - c) * g;

		return [
			(c * pure[0] + mg) * 255,
			(c * pure[1] + mg) * 255,
			(c * pure[2] + mg) * 255
		];
	};

	convert$2.hcg.hsv = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		var v = c + g * (1.0 - c);
		var f = 0;

		if (v > 0.0) {
			f = c / v;
		}

		return [hcg[0], f * 100, v * 100];
	};

	convert$2.hcg.hsl = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;

		var l = g * (1.0 - c) + 0.5 * c;
		var s = 0;

		if (l > 0.0 && l < 0.5) {
			s = c / (2 * l);
		} else
		if (l >= 0.5 && l < 1.0) {
			s = c / (2 * (1 - l));
		}

		return [hcg[0], s * 100, l * 100];
	};

	convert$2.hcg.hwb = function (hcg) {
		var c = hcg[1] / 100;
		var g = hcg[2] / 100;
		var v = c + g * (1.0 - c);
		return [hcg[0], (v - c) * 100, (1 - v) * 100];
	};

	convert$2.hwb.hcg = function (hwb) {
		var w = hwb[1] / 100;
		var b = hwb[2] / 100;
		var v = 1 - b;
		var c = v - w;
		var g = 0;

		if (c < 1) {
			g = (v - c) / (1 - c);
		}

		return [hwb[0], c * 100, g * 100];
	};

	convert$2.apple.rgb = function (apple) {
		return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
	};

	convert$2.rgb.apple = function (rgb) {
		return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
	};

	convert$2.gray.rgb = function (args) {
		return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
	};

	convert$2.gray.hsl = convert$2.gray.hsv = function (args) {
		return [0, 0, args[0]];
	};

	convert$2.gray.hwb = function (gray) {
		return [0, 100, gray[0]];
	};

	convert$2.gray.cmyk = function (gray) {
		return [0, 0, 0, gray[0]];
	};

	convert$2.gray.lab = function (gray) {
		return [gray[0], 0, 0];
	};

	convert$2.gray.hex = function (gray) {
		var val = Math.round(gray[0] / 100 * 255) & 0xFF;
		var integer = (val << 16) + (val << 8) + val;

		var string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert$2.rgb.gray = function (rgb) {
		var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
		return [val / 255 * 100];
	};

	var conversionsExports = conversions$2.exports;

	var conversions$1 = conversionsExports;

	/*
		this function routes a model to all other models.

		all functions that are routed have a property `.conversion` attached
		to the returned synthetic function. This property is an array
		of strings, each with the steps in between the 'from' and 'to'
		color models (inclusive).

		conversions that are not possible simply are not included.
	*/

	function buildGraph() {
		var graph = {};
		// https://jsperf.com/object-keys-vs-for-in-with-closure/3
		var models = Object.keys(conversions$1);

		for (var len = models.length, i = 0; i < len; i++) {
			graph[models[i]] = {
				// http://jsperf.com/1-vs-infinity
				// micro-opt, but this is simple.
				distance: -1,
				parent: null
			};
		}

		return graph;
	}

	// https://en.wikipedia.org/wiki/Breadth-first_search
	function deriveBFS(fromModel) {
		var graph = buildGraph();
		var queue = [fromModel]; // unshift -> queue -> pop

		graph[fromModel].distance = 0;

		while (queue.length) {
			var current = queue.pop();
			var adjacents = Object.keys(conversions$1[current]);

			for (var len = adjacents.length, i = 0; i < len; i++) {
				var adjacent = adjacents[i];
				var node = graph[adjacent];

				if (node.distance === -1) {
					node.distance = graph[current].distance + 1;
					node.parent = current;
					queue.unshift(adjacent);
				}
			}
		}

		return graph;
	}

	function link(from, to) {
		return function (args) {
			return to(from(args));
		};
	}

	function wrapConversion(toModel, graph) {
		var path = [graph[toModel].parent, toModel];
		var fn = conversions$1[graph[toModel].parent][toModel];

		var cur = graph[toModel].parent;
		while (graph[cur].parent) {
			path.unshift(graph[cur].parent);
			fn = link(conversions$1[graph[cur].parent][cur], fn);
			cur = graph[cur].parent;
		}

		fn.conversion = path;
		return fn;
	}

	var route$1 = function (fromModel) {
		var graph = deriveBFS(fromModel);
		var conversion = {};

		var models = Object.keys(graph);
		for (var len = models.length, i = 0; i < len; i++) {
			var toModel = models[i];
			var node = graph[toModel];

			if (node.parent === null) {
				// no possible conversion, or this node is the source model.
				continue;
			}

			conversion[toModel] = wrapConversion(toModel, graph);
		}

		return conversion;
	};

	var conversions = conversionsExports;
	var route = route$1;

	var convert$1 = {};

	var models = Object.keys(conversions);

	function wrapRaw(fn) {
		var wrappedFn = function (args) {
			if (args === undefined || args === null) {
				return args;
			}

			if (arguments.length > 1) {
				args = Array.prototype.slice.call(arguments);
			}

			return fn(args);
		};

		// preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	function wrapRounded(fn) {
		var wrappedFn = function (args) {
			if (args === undefined || args === null) {
				return args;
			}

			if (arguments.length > 1) {
				args = Array.prototype.slice.call(arguments);
			}

			var result = fn(args);

			// we're assuming the result is an array here.
			// see notice in conversions.js; don't use box types
			// in conversion functions.
			if (typeof result === 'object') {
				for (var len = result.length, i = 0; i < len; i++) {
					result[i] = Math.round(result[i]);
				}
			}

			return result;
		};

		// preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	models.forEach(function (fromModel) {
		convert$1[fromModel] = {};

		Object.defineProperty(convert$1[fromModel], 'channels', {value: conversions[fromModel].channels});
		Object.defineProperty(convert$1[fromModel], 'labels', {value: conversions[fromModel].labels});

		var routes = route(fromModel);
		var routeModels = Object.keys(routes);

		routeModels.forEach(function (toModel) {
			var fn = routes[toModel];

			convert$1[fromModel][toModel] = wrapRounded(fn);
			convert$1[fromModel][toModel].raw = wrapRaw(fn);
		});
	});

	var colorConvert = convert$1;

	var colorString = colorStringExports;
	var convert = colorConvert;

	var _slice = [].slice;

	var skippedModels = [
		// to be honest, I don't really feel like keyword belongs in color convert, but eh.
		'keyword',

		// gray conflicts with some method names, and has its own method defined.
		'gray',

		// shouldn't really be in color-convert either...
		'hex'
	];

	var hashedModelKeys = {};
	Object.keys(convert).forEach(function (model) {
		hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
	});

	var limiters = {};

	function Color(obj, model) {
		if (!(this instanceof Color)) {
			return new Color(obj, model);
		}

		if (model && model in skippedModels) {
			model = null;
		}

		if (model && !(model in convert)) {
			throw new Error('Unknown model: ' + model);
		}

		var i;
		var channels;

		if (obj == null) { // eslint-disable-line no-eq-null,eqeqeq
			this.model = 'rgb';
			this.color = [0, 0, 0];
			this.valpha = 1;
		} else if (obj instanceof Color) {
			this.model = obj.model;
			this.color = obj.color.slice();
			this.valpha = obj.valpha;
		} else if (typeof obj === 'string') {
			var result = colorString.get(obj);
			if (result === null) {
				throw new Error('Unable to parse color from string: ' + obj);
			}

			this.model = result.model;
			channels = convert[this.model].channels;
			this.color = result.value.slice(0, channels);
			this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
		} else if (obj.length) {
			this.model = model || 'rgb';
			channels = convert[this.model].channels;
			var newArr = _slice.call(obj, 0, channels);
			this.color = zeroArray(newArr, channels);
			this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
		} else if (typeof obj === 'number') {
			// this is always RGB - can be converted later on.
			obj &= 0xFFFFFF;
			this.model = 'rgb';
			this.color = [
				(obj >> 16) & 0xFF,
				(obj >> 8) & 0xFF,
				obj & 0xFF
			];
			this.valpha = 1;
		} else {
			this.valpha = 1;

			var keys = Object.keys(obj);
			if ('alpha' in obj) {
				keys.splice(keys.indexOf('alpha'), 1);
				this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
			}

			var hashedKeys = keys.sort().join('');
			if (!(hashedKeys in hashedModelKeys)) {
				throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
			}

			this.model = hashedModelKeys[hashedKeys];

			var labels = convert[this.model].labels;
			var color = [];
			for (i = 0; i < labels.length; i++) {
				color.push(obj[labels[i]]);
			}

			this.color = zeroArray(color);
		}

		// perform limitations (clamping, etc.)
		if (limiters[this.model]) {
			channels = convert[this.model].channels;
			for (i = 0; i < channels; i++) {
				var limit = limiters[this.model][i];
				if (limit) {
					this.color[i] = limit(this.color[i]);
				}
			}
		}

		this.valpha = Math.max(0, Math.min(1, this.valpha));

		if (Object.freeze) {
			Object.freeze(this);
		}
	}

	Color.prototype = {
		toString: function () {
			return this.string();
		},

		toJSON: function () {
			return this[this.model]();
		},

		string: function (places) {
			var self = this.model in colorString.to ? this : this.rgb();
			self = self.round(typeof places === 'number' ? places : 1);
			var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
			return colorString.to[self.model](args);
		},

		percentString: function (places) {
			var self = this.rgb().round(typeof places === 'number' ? places : 1);
			var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
			return colorString.to.rgb.percent(args);
		},

		array: function () {
			return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
		},

		object: function () {
			var result = {};
			var channels = convert[this.model].channels;
			var labels = convert[this.model].labels;

			for (var i = 0; i < channels; i++) {
				result[labels[i]] = this.color[i];
			}

			if (this.valpha !== 1) {
				result.alpha = this.valpha;
			}

			return result;
		},

		unitArray: function () {
			var rgb = this.rgb().color;
			rgb[0] /= 255;
			rgb[1] /= 255;
			rgb[2] /= 255;

			if (this.valpha !== 1) {
				rgb.push(this.valpha);
			}

			return rgb;
		},

		unitObject: function () {
			var rgb = this.rgb().object();
			rgb.r /= 255;
			rgb.g /= 255;
			rgb.b /= 255;

			if (this.valpha !== 1) {
				rgb.alpha = this.valpha;
			}

			return rgb;
		},

		round: function (places) {
			places = Math.max(places || 0, 0);
			return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
		},

		alpha: function (val) {
			if (arguments.length) {
				return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
			}

			return this.valpha;
		},

		// rgb
		red: getset('rgb', 0, maxfn(255)),
		green: getset('rgb', 1, maxfn(255)),
		blue: getset('rgb', 2, maxfn(255)),

		hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

		saturationl: getset('hsl', 1, maxfn(100)),
		lightness: getset('hsl', 2, maxfn(100)),

		saturationv: getset('hsv', 1, maxfn(100)),
		value: getset('hsv', 2, maxfn(100)),

		chroma: getset('hcg', 1, maxfn(100)),
		gray: getset('hcg', 2, maxfn(100)),

		white: getset('hwb', 1, maxfn(100)),
		wblack: getset('hwb', 2, maxfn(100)),

		cyan: getset('cmyk', 0, maxfn(100)),
		magenta: getset('cmyk', 1, maxfn(100)),
		yellow: getset('cmyk', 2, maxfn(100)),
		black: getset('cmyk', 3, maxfn(100)),

		x: getset('xyz', 0, maxfn(100)),
		y: getset('xyz', 1, maxfn(100)),
		z: getset('xyz', 2, maxfn(100)),

		l: getset('lab', 0, maxfn(100)),
		a: getset('lab', 1),
		b: getset('lab', 2),

		keyword: function (val) {
			if (arguments.length) {
				return new Color(val);
			}

			return convert[this.model].keyword(this.color);
		},

		hex: function (val) {
			if (arguments.length) {
				return new Color(val);
			}

			return colorString.to.hex(this.rgb().round().color);
		},

		rgbNumber: function () {
			var rgb = this.rgb().color;
			return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
		},

		luminosity: function () {
			// http://www.w3.org/TR/WCAG20/#relativeluminancedef
			var rgb = this.rgb().color;

			var lum = [];
			for (var i = 0; i < rgb.length; i++) {
				var chan = rgb[i] / 255;
				lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
			}

			return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
		},

		contrast: function (color2) {
			// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
			var lum1 = this.luminosity();
			var lum2 = color2.luminosity();

			if (lum1 > lum2) {
				return (lum1 + 0.05) / (lum2 + 0.05);
			}

			return (lum2 + 0.05) / (lum1 + 0.05);
		},

		level: function (color2) {
			var contrastRatio = this.contrast(color2);
			if (contrastRatio >= 7.1) {
				return 'AAA';
			}

			return (contrastRatio >= 4.5) ? 'AA' : '';
		},

		isDark: function () {
			// YIQ equation from http://24ways.org/2010/calculating-color-contrast
			var rgb = this.rgb().color;
			var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
			return yiq < 128;
		},

		isLight: function () {
			return !this.isDark();
		},

		negate: function () {
			var rgb = this.rgb();
			for (var i = 0; i < 3; i++) {
				rgb.color[i] = 255 - rgb.color[i];
			}
			return rgb;
		},

		lighten: function (ratio) {
			var hsl = this.hsl();
			hsl.color[2] += hsl.color[2] * ratio;
			return hsl;
		},

		darken: function (ratio) {
			var hsl = this.hsl();
			hsl.color[2] -= hsl.color[2] * ratio;
			return hsl;
		},

		saturate: function (ratio) {
			var hsl = this.hsl();
			hsl.color[1] += hsl.color[1] * ratio;
			return hsl;
		},

		desaturate: function (ratio) {
			var hsl = this.hsl();
			hsl.color[1] -= hsl.color[1] * ratio;
			return hsl;
		},

		whiten: function (ratio) {
			var hwb = this.hwb();
			hwb.color[1] += hwb.color[1] * ratio;
			return hwb;
		},

		blacken: function (ratio) {
			var hwb = this.hwb();
			hwb.color[2] += hwb.color[2] * ratio;
			return hwb;
		},

		grayscale: function () {
			// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
			var rgb = this.rgb().color;
			var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
			return Color.rgb(val, val, val);
		},

		fade: function (ratio) {
			return this.alpha(this.valpha - (this.valpha * ratio));
		},

		opaquer: function (ratio) {
			return this.alpha(this.valpha + (this.valpha * ratio));
		},

		rotate: function (degrees) {
			var hsl = this.hsl();
			var hue = hsl.color[0];
			hue = (hue + degrees) % 360;
			hue = hue < 0 ? 360 + hue : hue;
			hsl.color[0] = hue;
			return hsl;
		},

		mix: function (mixinColor, weight) {
			// ported from sass implementation in C
			// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
			if (!mixinColor || !mixinColor.rgb) {
				throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
			}
			var color1 = mixinColor.rgb();
			var color2 = this.rgb();
			var p = weight === undefined ? 0.5 : weight;

			var w = 2 * p - 1;
			var a = color1.alpha() - color2.alpha();

			var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
			var w2 = 1 - w1;

			return Color.rgb(
					w1 * color1.red() + w2 * color2.red(),
					w1 * color1.green() + w2 * color2.green(),
					w1 * color1.blue() + w2 * color2.blue(),
					color1.alpha() * p + color2.alpha() * (1 - p));
		}
	};

	// model conversion methods and static constructors
	Object.keys(convert).forEach(function (model) {
		if (skippedModels.indexOf(model) !== -1) {
			return;
		}

		var channels = convert[model].channels;

		// conversion methods
		Color.prototype[model] = function () {
			if (this.model === model) {
				return new Color(this);
			}

			if (arguments.length) {
				return new Color(arguments, model);
			}

			var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
			return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
		};

		// 'static' construction methods
		Color[model] = function (color) {
			if (typeof color === 'number') {
				color = zeroArray(_slice.call(arguments), channels);
			}
			return new Color(color, model);
		};
	});

	function roundTo(num, places) {
		return Number(num.toFixed(places));
	}

	function roundToPlace(places) {
		return function (num) {
			return roundTo(num, places);
		};
	}

	function getset(model, channel, modifier) {
		model = Array.isArray(model) ? model : [model];

		model.forEach(function (m) {
			(limiters[m] || (limiters[m] = []))[channel] = modifier;
		});

		model = model[0];

		return function (val) {
			var result;

			if (arguments.length) {
				if (modifier) {
					val = modifier(val);
				}

				result = this[model]();
				result.color[channel] = val;
				return result;
			}

			result = this[model]().color[channel];
			if (modifier) {
				result = modifier(result);
			}

			return result;
		};
	}

	function maxfn(max) {
		return function (v) {
			return Math.max(0, Math.min(max, v));
		};
	}

	function assertArray(val) {
		return Array.isArray(val) ? val : [val];
	}

	function zeroArray(arr, length) {
		for (var i = 0; i < length; i++) {
			if (typeof arr[i] !== 'number') {
				arr[i] = 0;
			}
		}

		return arr;
	}

	var color = Color;

	var Color$1 = /*@__PURE__*/getDefaultExportFromCjs(color);

	const castLevelToHeight = (level, minLevel, levelHeight, totalheight) => {
	    return totalheight - (level - minLevel) * levelHeight;
	};
	const defaultChartStyle = {
	    fillColor: 'rgba(0, 0, 0, 0.1)',
	    lineWidth: 1,
	    lineDash: [],
	    lineColor: 'rgba(0, 0, 0, 0.5)',
	    type: 'smooth',
	};
	const prepareTmeseries = (timeseries) => {
	    const timeboxes = [];
	    const preparedTimeseries = timeseries.map((chart) => {
	        var _a;
	        return ({
	            group: chart.units && !chart.group ? chart.units : 'default',
	            ...chart,
	            style: {
	                lineWidth: 1,
	                fillColor: 'rgba(0, 0, 0, 0.15)',
	                lineColor: 'rgba(0, 0, 0, 0.20)',
	                lineDash: [],
	                type: 'smooth',
	                ...((_a = chart.style) !== null && _a !== void 0 ? _a : {}),
	            },
	        });
	    });
	    const summary = preparedTimeseries.reduce((acc, { points, group, min, max }, index) => {
	        if (!acc[group]) {
	            acc[group] = {
	                min: min !== null && min !== void 0 ? min : points[0][1],
	                max: max !== null && max !== void 0 ? max : points[0][1],
	            };
	        }
	        timeboxes[index] = {
	            start: points[0][0],
	            end: last(points)[0],
	        };
	        points.forEach(([time, value]) => {
	            if (min === undefined) {
	                acc[group].min = Math.min(acc[group].min, value);
	            }
	            if (max === undefined) {
	                acc[group].max = Math.max(acc[group].max, value);
	            }
	            timeboxes[index].start = Math.min(timeboxes[index].start, time);
	            timeboxes[index].end = Math.max(timeboxes[index].end, time);
	        });
	        return acc;
	    }, {});
	    const min = Math.min(...timeboxes.map(({ start }) => start));
	    const max = Math.max(...timeboxes.map(({ end }) => end));
	    return {
	        summary,
	        total: {
	            min,
	            max,
	        },
	        timeseries: preparedTimeseries,
	        timeboxes: timeboxes,
	    };
	};
	const getMinMax = (points, chart, summary) => {
	    var _a, _b;
	    return chart.dynamicMinMax
	        ? points.reduce((acc, [, value]) => {
	            acc.min = Math.min(acc.min, value);
	            acc.max = Math.max(acc.max, value);
	            return acc;
	        }, { min: (_a = chart.min) !== null && _a !== void 0 ? _a : Infinity, max: (_b = chart.max) !== null && _b !== void 0 ? _b : -Infinity })
	        : chart.group
	            ? summary[chart.group]
	            : {
	                min: -Infinity,
	                max: Infinity,
	            };
	};
	const renderChartTooltipFields = (timestamp, { timeseries }) => {
	    const targetPoints = timeseries.reduce((acc, { points, units, name, group }) => {
	        const point = chartPointsBinarySearch(points, timestamp);
	        const hasGroup = group !== units && group !== 'default';
	        const resolvedGroup = hasGroup ? group : 'default';
	        let result = '';
	        if (point) {
	            if (name) {
	                result += name + ': ';
	            }
	            result += point[1].toFixed(2);
	            if (units) {
	                result += units;
	            }
	        }
	        if (!acc[resolvedGroup]) {
	            acc[resolvedGroup] = [];
	        }
	        acc[resolvedGroup].push(result);
	        return acc;
	    }, {});
	    return Object.entries(targetPoints).reduce((acc, [group, values]) => {
	        if (group !== 'default') {
	            acc.push({
	                text: group,
	                color: 'black',
	            });
	        }
	        values.forEach((value) => {
	            acc.push({
	                text: value,
	            });
	        });
	        return acc;
	    }, []);
	};
	const renderChart = ({ engine, points, style, min, max, }) => {
	    const resolvedStyle = {
	        ...defaultChartStyle,
	        ...(style !== null && style !== void 0 ? style : {}),
	    };
	    engine.setCtxValue('strokeStyle', resolvedStyle.lineColor);
	    engine.setCtxValue('fillStyle', resolvedStyle.fillColor);
	    engine.setCtxValue('lineWidth', resolvedStyle.lineWidth);
	    engine.callCtx('setLineDash', resolvedStyle.lineDash);
	    engine.ctx.beginPath();
	    const levelHeight = (engine.height - engine.charHeight - 4) / (max - min);
	    if (points.length > 1) {
	        const xy = points.map(([time, level]) => [
	            engine.timeToPosition(time),
	            castLevelToHeight(level, min, levelHeight, engine.height),
	        ]);
	        engine.ctx.moveTo(xy[0][0], engine.height);
	        engine.ctx.lineTo(xy[0][0], xy[0][1]);
	        if (resolvedStyle.type === 'smooth' || !resolvedStyle.type) {
	            for (let i = 1; i < xy.length - 2; i++) {
	                const xc = (xy[i][0] + xy[i + 1][0]) / 2;
	                const yc = (xy[i][1] + xy[i + 1][1]) / 2;
	                engine.ctx.quadraticCurveTo(xy[i][0], xy[i][1], xc, yc);
	            }
	            const preLastPoint = xy[xy.length - 2];
	            const lastPoint = last(xy);
	            engine.ctx.quadraticCurveTo(preLastPoint[0], preLastPoint[1], lastPoint[0], lastPoint[1]);
	            engine.ctx.quadraticCurveTo(lastPoint[0], lastPoint[1], lastPoint[0], engine.height);
	        }
	        else if (resolvedStyle.type === 'line') {
	            for (let i = 1; i < xy.length; i++) {
	                engine.ctx.lineTo(xy[i][0], xy[i][1]);
	            }
	        }
	        else if (resolvedStyle.type === 'bar') {
	            for (let i = 0; i < xy.length; i++) {
	                const currentPoint = xy[i];
	                const prevPoint = xy[i - 1] || currentPoint;
	                const nextPoint = xy[i + 1];
	                const barWidthLeft = (currentPoint[0] - prevPoint[0]) / 2;
	                const barWidthRight = nextPoint ? (nextPoint[0] - currentPoint[0]) / 2 : barWidthLeft;
	                engine.ctx.lineTo(prevPoint[0] + barWidthLeft, currentPoint[1]);
	                engine.ctx.lineTo(currentPoint[0] + barWidthRight, currentPoint[1]);
	                if (nextPoint) {
	                    engine.ctx.lineTo(currentPoint[0] + barWidthRight, nextPoint[1]);
	                }
	                else {
	                    engine.ctx.lineTo(currentPoint[0] + barWidthRight, engine.height);
	                }
	            }
	            engine.ctx.lineTo(last(xy)[0], engine.height);
	        }
	    }
	    engine.ctx.closePath();
	    engine.ctx.stroke();
	    engine.ctx.fill();
	};
	const chartPointsBinarySearch = (array, value, outside = true) => {
	    if (array[0][0] >= value) {
	        return outside ? array[0] : null;
	    }
	    if (last(array)[0] <= value) {
	        return outside ? last(array) : null;
	    }
	    if (array.length <= 1) {
	        return array[0];
	    }
	    let start = 0;
	    let end = array.length - 1;
	    while (start <= end) {
	        const mid = Math.ceil((end + start) / 2);
	        if (value >= array[mid - 1][0] && value <= array[mid][0]) {
	            const index = Math.abs(value - array[mid - 1][0]) < Math.abs(value - array[mid][0]) ? mid - 1 : mid;
	            return array[index];
	        }
	        if (array[mid][0] < value) {
	            start = mid + 1;
	        }
	        else {
	            end = mid - 1;
	        }
	    }
	    return null;
	};

	const TIMEFRAME_STICK_DISTANCE = 2;
	const defaultTimeframeSelectorPluginStyles = {
	    font: '9px sans-serif',
	    fontColor: 'black',
	    overlayColor: 'rgba(112, 112, 112, 0.5)',
	    graphStrokeColor: 'rgba(0, 0, 0, 0.10)',
	    graphFillColor: 'rgba(0, 0, 0, 0.15)',
	    flameChartGraphType: 'smooth',
	    waterfallStrokeOpacity: 0.4,
	    waterfallFillOpacity: 0.35,
	    waterfallGraphType: 'smooth',
	    bottomLineColor: 'rgba(0, 0, 0, 0.25)',
	    knobColor: 'rgb(131, 131, 131)',
	    knobStrokeColor: 'white',
	    knobSize: 6,
	    height: 60,
	    backgroundColor: 'white',
	};
	class TimeframeSelectorPlugin extends UIPlugin {
	    constructor({ waterfall, flameChartNodes, timeseries, settings, name = 'timeframeSelectorPlugin', }) {
	        super(name);
	        this.styles = defaultTimeframeSelectorPluginStyles;
	        this.height = 0;
	        this.leftKnobMoving = false;
	        this.rightKnobMoving = false;
	        this.selectingActive = false;
	        this.startSelectingPosition = 0;
	        this.actualClusters = [];
	        this.clusters = [];
	        this.flameChartMaxLevel = 0;
	        this.flameChartDots = [];
	        this.waterfallDots = [];
	        this.waterfallMaxLevel = 0;
	        this.actualClusterizedFlatTree = [];
	        this.hoveredRegion = null;
	        this.flameChartNodes = flameChartNodes;
	        this.waterfall = waterfall;
	        this.timeseries = timeseries;
	        this.shouldRender = true;
	        this.setSettings(settings);
	    }
	    init(renderEngine, interactionsEngine) {
	        super.init(renderEngine, interactionsEngine);
	        this.interactionsEngine.on('down', this.handleMouseDown.bind(this));
	        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
	        this.interactionsEngine.on('move', this.handleMouseMove.bind(this));
	        this.interactionsEngine.on('hover', this.handleHover.bind(this));
	        this.setSettings();
	    }
	    handleHover(region) {
	        this.hoveredRegion = region;
	    }
	    handleMouseDown(region, mouse) {
	        if (region) {
	            if (region.type === "timeframeKnob" /* RegionTypes.TIMEFRAME_KNOB */) {
	                if (region.data === 'left') {
	                    this.leftKnobMoving = true;
	                }
	                else {
	                    this.rightKnobMoving = true;
	                }
	                this.interactionsEngine.setCursor('ew-resize');
	            }
	            else if (region.type === "timeframeArea" /* RegionTypes.TIMEFRAME_AREA */) {
	                this.selectingActive = true;
	                this.startSelectingPosition = mouse.x;
	            }
	        }
	    }
	    handleMouseUp(_, mouse, isClick) {
	        let isDoubleClick = false;
	        if (this.timeout) {
	            isDoubleClick = true;
	        }
	        clearTimeout(this.timeout);
	        this.timeout = window.setTimeout(() => (this.timeout = void 0), 300);
	        this.leftKnobMoving = false;
	        this.rightKnobMoving = false;
	        this.interactionsEngine.clearCursor();
	        if (this.selectingActive && !isClick) {
	            this.applyChanges();
	        }
	        this.selectingActive = false;
	        if (isClick && !isDoubleClick) {
	            const rightKnobPosition = this.getRightKnobPosition();
	            const leftKnobPosition = this.getLeftKnobPosition();
	            if (mouse.x > rightKnobPosition) {
	                this.setRightKnobPosition(mouse.x);
	            }
	            else if (mouse.x > leftKnobPosition && mouse.x < rightKnobPosition) {
	                if (mouse.x - leftKnobPosition > rightKnobPosition - mouse.x) {
	                    this.setRightKnobPosition(mouse.x);
	                }
	                else {
	                    this.setLeftKnobPosition(mouse.x);
	                }
	            }
	            else {
	                this.setLeftKnobPosition(mouse.x);
	            }
	            this.applyChanges();
	        }
	        if (isDoubleClick) {
	            this.renderEngine.parent.setZoom(this.renderEngine.getInitialZoom());
	            this.renderEngine.parent.setPositionX(this.renderEngine.min);
	            this.renderEngine.parent.render();
	        }
	    }
	    handleMouseMove(_, mouse) {
	        if (this.leftKnobMoving) {
	            this.setLeftKnobPosition(mouse.x);
	            this.applyChanges();
	        }
	        if (this.rightKnobMoving) {
	            this.setRightKnobPosition(mouse.x);
	            this.applyChanges();
	        }
	        if (this.selectingActive) {
	            if (this.startSelectingPosition >= mouse.x) {
	                this.setLeftKnobPosition(mouse.x);
	                this.setRightKnobPosition(this.startSelectingPosition);
	            }
	            else {
	                this.setRightKnobPosition(mouse.x);
	                this.setLeftKnobPosition(this.startSelectingPosition);
	            }
	            this.renderEngine.render();
	        }
	    }
	    postInit() {
	        this.offscreenRenderEngine = this.renderEngine.makeChild();
	        this.offscreenRenderEngine.setSettingsOverrides({ styles: this.styles });
	        this.timeGrid = new TimeGrid({ styles: this.renderEngine.parent.timeGrid.styles });
	        this.timeGrid.setDefaultRenderEngine(this.offscreenRenderEngine);
	        this.offscreenRenderEngine.on('resize', () => {
	            this.offscreenRenderEngine.setZoom(this.renderEngine.getInitialZoom());
	            this.offscreenRender();
	        });
	        this.offscreenRenderEngine.on('min-max-change', () => (this.shouldRender = true));
	        this.setData({
	            flameChartNodes: this.flameChartNodes,
	            waterfall: this.waterfall,
	            timeseries: this.timeseries,
	        });
	    }
	    setLeftKnobPosition(mouseX) {
	        const maxPosition = this.getRightKnobPosition();
	        if (mouseX < maxPosition - 1) {
	            const realView = this.renderEngine.getRealView();
	            const delta = this.renderEngine.setPositionX(this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
	            const zoom = this.renderEngine.width / (realView - delta);
	            this.renderEngine.setZoom(zoom);
	        }
	    }
	    setRightKnobPosition(mouseX) {
	        const minPosition = this.getLeftKnobPosition();
	        if (mouseX > minPosition + 1) {
	            const realView = this.renderEngine.getRealView();
	            const delta = this.renderEngine.positionX +
	                realView -
	                (this.offscreenRenderEngine.pixelToTime(mouseX) + this.renderEngine.min);
	            const zoom = this.renderEngine.width / (realView - delta);
	            this.renderEngine.setZoom(zoom);
	        }
	    }
	    getLeftKnobPosition() {
	        return (this.renderEngine.positionX - this.renderEngine.min) * this.renderEngine.getInitialZoom();
	    }
	    getRightKnobPosition() {
	        return ((this.renderEngine.positionX - this.renderEngine.min + this.renderEngine.getRealView()) *
	            this.renderEngine.getInitialZoom());
	    }
	    applyChanges() {
	        this.renderEngine.parent.setPositionX(this.renderEngine.positionX);
	        this.renderEngine.parent.setZoom(this.renderEngine.zoom);
	        this.renderEngine.parent.render();
	    }
	    setSettings({ styles } = { styles: this.styles }) {
	        this.styles = mergeObjects(defaultTimeframeSelectorPluginStyles, styles);
	        this.height = this.styles.height;
	        if (this.offscreenRenderEngine) {
	            this.offscreenRenderEngine.setSettingsOverrides({ styles: this.styles });
	            this.timeGrid.setSettings({ styles: this.renderEngine.parent.timeGrid.styles });
	        }
	        this.shouldRender = true;
	    }
	    makeFlameChartDots() {
	        if (this.flameChartNodes) {
	            const flameChartDots = [];
	            const tree = flatTree(this.flameChartNodes);
	            const { min, max } = getFlatTreeMinMax(tree);
	            this.min = min;
	            this.max = max;
	            this.clusters = metaClusterizeFlatTree(tree, () => true);
	            this.actualClusters = clusterizeFlatTree(this.clusters, this.renderEngine.zoom, this.min, this.max, TIMEFRAME_STICK_DISTANCE, Infinity);
	            this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(this.actualClusters, this.renderEngine.zoom, this.min, this.max, TIMEFRAME_STICK_DISTANCE, Infinity).sort((a, b) => a.start - b.start);
	            this.actualClusterizedFlatTree.forEach(({ start, end }) => {
	                flameChartDots.push({
	                    time: start,
	                    type: 'start',
	                }, {
	                    time: end,
	                    type: 'end',
	                });
	            });
	            flameChartDots.sort((a, b) => a.time - b.time);
	            const { dots, maxLevel } = this.makeRenderDots(flameChartDots);
	            this.flameChartDots = dots;
	            this.flameChartMaxLevel = maxLevel;
	        }
	    }
	    makeRenderDots(dots) {
	        const renderDots = [];
	        let level = 0;
	        let maxLevel = 0;
	        dots.forEach(({ type, time }) => {
	            if (type === 'start' || type === 'end') {
	                renderDots.push([time, level]);
	            }
	            if (type === 'start') {
	                level++;
	            }
	            else {
	                level--;
	            }
	            maxLevel = Math.max(maxLevel, level);
	            renderDots.push([time, level]);
	        });
	        return {
	            dots: renderDots,
	            maxLevel,
	        };
	    }
	    makeWaterfallDots() {
	        if (this.waterfall) {
	            const data = parseWaterfall(this.waterfall);
	            const intervals = Object.entries(data.reduce((acc, { intervals }) => {
	                intervals.forEach((interval) => {
	                    const { timeframeChart } = interval;
	                    if (timeframeChart) {
	                        const key = typeof timeframeChart === 'string' ? timeframeChart : interval.color;
	                        if (!acc[key]) {
	                            acc[key] = [];
	                        }
	                        acc[key].push(interval);
	                    }
	                });
	                return acc;
	            }, {}));
	            const points = intervals.map(([color, intervals]) => {
	                const newPoints = [];
	                intervals.forEach(({ start, end }) => {
	                    newPoints.push({ type: 'start', time: start });
	                    newPoints.push({ type: 'end', time: end });
	                });
	                newPoints.sort((a, b) => a.time - b.time);
	                return {
	                    color,
	                    points: newPoints,
	                };
	            });
	            let globalMaxLevel = 0;
	            this.waterfallDots = points.map(({ color, points }) => {
	                const { dots, maxLevel } = this.makeRenderDots(points);
	                globalMaxLevel = Math.max(globalMaxLevel, maxLevel);
	                return {
	                    color,
	                    dots,
	                };
	            });
	            this.waterfallMaxLevel = globalMaxLevel;
	        }
	    }
	    prepareTimeseries() {
	        var _a;
	        if ((_a = this.timeseries) === null || _a === void 0 ? void 0 : _a.length) {
	            this.preparedTimeseries = prepareTmeseries(this.timeseries);
	        }
	        else {
	            this.preparedTimeseries = undefined;
	        }
	    }
	    setData({ flameChartNodes, waterfall, timeseries, }) {
	        this.flameChartNodes = flameChartNodes;
	        this.waterfall = waterfall;
	        this.timeseries = timeseries;
	        this.makeFlameChartDots();
	        this.makeWaterfallDots();
	        this.prepareTimeseries();
	        this.offscreenRender();
	    }
	    setTimeseries(timeseries) {
	        this.timeseries = timeseries;
	        this.prepareTimeseries();
	        this.offscreenRender();
	    }
	    setFlameChartNodes(flameChartNodes) {
	        this.flameChartNodes = flameChartNodes;
	        this.makeFlameChartDots();
	        this.offscreenRender();
	    }
	    setWaterfall(waterfall) {
	        this.waterfall = waterfall;
	        this.makeWaterfallDots();
	        this.offscreenRender();
	    }
	    offscreenRender() {
	        const zoom = this.offscreenRenderEngine.getInitialZoom();
	        this.offscreenRenderEngine.setZoom(zoom);
	        this.offscreenRenderEngine.setPositionX(this.offscreenRenderEngine.min);
	        this.offscreenRenderEngine.clear();
	        this.timeGrid.recalc();
	        this.timeGrid.renderLines(0, this.offscreenRenderEngine.height);
	        this.timeGrid.renderTimes();
	        renderChart({
	            engine: this.offscreenRenderEngine,
	            points: this.flameChartDots,
	            min: 0,
	            max: this.flameChartMaxLevel,
	            style: {
	                lineColor: this.styles.graphStrokeColor,
	                fillColor: this.styles.graphFillColor,
	                type: this.styles.flameChartGraphType,
	            },
	        });
	        this.waterfallDots.forEach(({ color, dots }) => {
	            const colorObj = new Color$1(color);
	            renderChart({
	                engine: this.offscreenRenderEngine,
	                points: dots,
	                min: 0,
	                max: this.waterfallMaxLevel,
	                style: {
	                    lineColor: colorObj.alpha(this.styles.waterfallStrokeOpacity).rgb().toString(),
	                    fillColor: colorObj.alpha(this.styles.waterfallFillOpacity).rgb().toString(),
	                    type: this.styles.waterfallGraphType,
	                },
	            });
	        });
	        if (this.preparedTimeseries) {
	            const { summary, timeseries } = this.preparedTimeseries;
	            timeseries.forEach((chart) => {
	                const minmax = getMinMax(chart.points, chart, summary);
	                renderChart({
	                    engine: this.offscreenRenderEngine,
	                    points: chart.points,
	                    min: minmax.min,
	                    max: minmax.max,
	                    style: chart.style,
	                });
	            });
	        }
	        this.offscreenRenderEngine.setCtxValue('fillStyle', this.styles.bottomLineColor);
	        this.offscreenRenderEngine.ctx.fillRect(0, this.height - 1, this.offscreenRenderEngine.width, 1);
	    }
	    renderTimeframe() {
	        const relativePositionX = this.renderEngine.positionX - this.renderEngine.min;
	        const currentLeftPosition = relativePositionX * this.renderEngine.getInitialZoom();
	        const currentRightPosition = (relativePositionX + this.renderEngine.getRealView()) * this.renderEngine.getInitialZoom();
	        const currentLeftKnobPosition = currentLeftPosition - this.styles.knobSize / 2;
	        const currentRightKnobPosition = currentRightPosition - this.styles.knobSize / 2;
	        const knobHeight = this.renderEngine.height / 3;
	        this.renderEngine.setCtxValue('fillStyle', this.styles.overlayColor);
	        this.renderEngine.fillRect(0, 0, currentLeftPosition, this.renderEngine.height);
	        this.renderEngine.fillRect(currentRightPosition, 0, this.renderEngine.width - currentRightPosition, this.renderEngine.height);
	        this.renderEngine.setCtxValue('fillStyle', this.styles.overlayColor);
	        this.renderEngine.fillRect(currentLeftPosition - 1, 0, 1, this.renderEngine.height);
	        this.renderEngine.fillRect(currentRightPosition + 1, 0, 1, this.renderEngine.height);
	        this.renderEngine.setCtxValue('fillStyle', this.styles.knobColor);
	        this.renderEngine.fillRect(currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
	        this.renderEngine.fillRect(currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);
	        this.renderEngine.renderStroke(this.styles.knobStrokeColor, currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight);
	        this.renderEngine.renderStroke(this.styles.knobStrokeColor, currentRightKnobPosition, 0, this.styles.knobSize, knobHeight);
	        this.interactionsEngine.addHitRegion("timeframeKnob" /* RegionTypes.TIMEFRAME_KNOB */, 'left', currentLeftKnobPosition, 0, this.styles.knobSize, knobHeight, "ew-resize" /* CursorTypes.EW_RESIZE */);
	        this.interactionsEngine.addHitRegion("timeframeKnob" /* RegionTypes.TIMEFRAME_KNOB */, 'right', currentRightKnobPosition, 0, this.styles.knobSize, knobHeight, "ew-resize" /* CursorTypes.EW_RESIZE */);
	        this.interactionsEngine.addHitRegion("timeframeArea" /* RegionTypes.TIMEFRAME_AREA */, null, 0, 0, this.renderEngine.width, this.renderEngine.height, "text" /* CursorTypes.TEXT */);
	    }
	    renderTooltip() {
	        if (this.hoveredRegion) {
	            const mouseX = this.interactionsEngine.getMouse().x;
	            const currentTimestamp = mouseX / this.renderEngine.getInitialZoom() + this.renderEngine.min;
	            const time = `${currentTimestamp.toFixed(this.renderEngine.getAccuracy() + 2)} ${this.renderEngine.timeUnits}`;
	            const timeseriesFields = this.preparedTimeseries
	                ? renderChartTooltipFields(currentTimestamp, this.preparedTimeseries)
	                : [];
	            this.renderEngine.renderTooltipFromData([
	                {
	                    text: time,
	                },
	                ...timeseriesFields,
	            ], this.interactionsEngine.getGlobalMouse());
	            return true;
	        }
	        return false;
	    }
	    render() {
	        if (this.shouldRender) {
	            this.shouldRender = false;
	            this.offscreenRender();
	        }
	        this.renderEngine.copy(this.offscreenRenderEngine);
	        this.renderTimeframe();
	        this.interactionsEngine.addHitRegion("timeframe" /* RegionTypes.TIMEFRAME */, null, 0, 0, this.renderEngine.width, this.height);
	        return true;
	    }
	}

	const defaultWaterfallPluginStyles = {
	    defaultHeight: 68,
	    lineWidth: 1,
	    lineHeight: 'inherit',
	};
	class WaterfallPlugin extends UIPlugin {
	    constructor({ data, name = 'waterfallPlugin', settings, }) {
	        super(name);
	        this.styles = defaultWaterfallPluginStyles;
	        this.height = defaultWaterfallPluginStyles.defaultHeight;
	        this.data = [];
	        this.positionY = 0;
	        this.hoveredRegion = null;
	        this.selectedRegion = null;
	        this.initialData = [];
	        this.setData(data);
	        this.setSettings(settings);
	    }
	    init(renderEngine, interactionsEngine) {
	        super.init(renderEngine, interactionsEngine);
	        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
	        this.interactionsEngine.on('hover', this.handleHover.bind(this));
	        this.interactionsEngine.on('select', this.handleSelect.bind(this));
	        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
	    }
	    handlePositionChange({ deltaX, deltaY }) {
	        const startPositionY = this.positionY;
	        const startPositionX = this.renderEngine.parent.positionX;
	        this.interactionsEngine.setCursor('grabbing');
	        if (this.positionY + deltaY >= 0) {
	            this.setPositionY(this.positionY + deltaY);
	        }
	        else {
	            this.setPositionY(0);
	        }
	        this.renderEngine.tryToChangePosition(deltaX);
	        if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
	            this.renderEngine.parent.render();
	        }
	    }
	    handleMouseUp() {
	        this.interactionsEngine.clearCursor();
	    }
	    handleHover(region) {
	        this.hoveredRegion = region;
	    }
	    handleSelect(region) {
	        if (this.selectedRegion !== region) {
	            this.selectedRegion = region;
	            this.emit('select', {
	                node: (region === null || region === void 0 ? void 0 : region.data) ? this.initialData[region.data] : null,
	                type: 'waterfall-node',
	            });
	            this.renderEngine.render();
	        }
	    }
	    setPositionY(y) {
	        this.positionY = y;
	    }
	    setSettings({ styles }) {
	        this.styles = mergeObjects(defaultWaterfallPluginStyles, styles);
	        this.height = this.styles.defaultHeight;
	        this.positionY = 0;
	    }
	    setData(waterfall) {
	        this.positionY = 0;
	        this.initialData = waterfall.items;
	        this.data = parseWaterfall(waterfall);
	        if (waterfall.items.length) {
	            this.min = this.data.reduce((acc, { min }) => Math.min(acc, min), this.data[0].min);
	            this.max = this.data.reduce((acc, { max }) => Math.max(acc, max), this.data[0].max);
	        }
	        if (this.renderEngine) {
	            this.renderEngine.recalcMinMax();
	            this.renderEngine.resetParentView();
	        }
	    }
	    calcRect(start, duration, isEnd) {
	        const w = duration * this.renderEngine.zoom;
	        return {
	            x: this.renderEngine.timeToPosition(start),
	            w: isEnd ? (w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3) : w,
	        };
	    }
	    renderTooltip() {
	        if (this.hoveredRegion) {
	            if (this.renderEngine.options.tooltip === false) {
	                return true;
	            }
	            else if (typeof this.renderEngine.options.tooltip === 'function') {
	                const { data: index } = this.hoveredRegion;
	                const data = { ...this.hoveredRegion };
	                // @ts-ignore data type on waterfall item is number but here it is something else?
	                data.data = this.data.find(({ index: i }) => index === i);
	                this.renderEngine.options.tooltip(data, this.renderEngine, this.interactionsEngine.getGlobalMouse());
	            }
	            else {
	                const { data: index } = this.hoveredRegion;
	                const dataItem = this.data.find(({ index: i }) => index === i);
	                if (dataItem) {
	                    const { name, intervals, timing, meta = [] } = dataItem;
	                    const timeUnits = this.renderEngine.getTimeUnits();
	                    const nodeAccuracy = this.renderEngine.getAccuracy() + 2;
	                    const header = { text: `${name}` };
	                    const intervalsHeader = {
	                        text: 'intervals',
	                        color: this.renderEngine.styles.tooltipHeaderFontColor,
	                    };
	                    const intervalsTexts = intervals.map(({ name, start, end }) => ({
	                        text: `${name}: ${(end - start).toFixed(nodeAccuracy)} ${timeUnits}`,
	                    }));
	                    const timingHeader = { text: 'timing', color: this.renderEngine.styles.tooltipHeaderFontColor };
	                    const timingTexts = Object.entries(timing)
	                        .filter(([, time]) => typeof time === 'number')
	                        .map(([name, time]) => ({
	                        text: `${name}: ${time.toFixed(nodeAccuracy)} ${timeUnits}`,
	                    }));
	                    const metaHeader = { text: 'meta', color: this.renderEngine.styles.tooltipHeaderFontColor };
	                    const metaTexts = meta
	                        ? meta.map(({ name, value, color }) => ({
	                            text: `${name}: ${value}`,
	                            color,
	                        }))
	                        : [];
	                    this.renderEngine.renderTooltipFromData([
	                        header,
	                        intervalsHeader,
	                        ...intervalsTexts,
	                        timingHeader,
	                        ...timingTexts,
	                        ...(metaTexts.length ? [metaHeader, ...metaTexts] : []),
	                    ], this.interactionsEngine.getGlobalMouse());
	                }
	            }
	            return true;
	        }
	        return false;
	    }
	    render() {
	        const rightSide = this.renderEngine.positionX + this.renderEngine.getRealView();
	        const leftSide = this.renderEngine.positionX;
	        const blockHeight = this.renderEngine.blockHeight + 1;
	        const stack = [];
	        const viewedData = this.data
	            .filter(({ min, max }) => !((rightSide < min && rightSide < max) || (leftSide > max && rightSide > min)))
	            .map((entry) => {
	            while (stack.length && entry.min - last(stack).max > 0) {
	                stack.pop();
	            }
	            const level = stack.length;
	            const result = {
	                ...entry,
	                level,
	            };
	            stack.push(entry);
	            return result;
	        });
	        viewedData.forEach(({ name, intervals, textBlock, level, index }) => {
	            const y = level * blockHeight - this.positionY;
	            if (y + blockHeight >= 0 && y - blockHeight <= this.renderEngine.height) {
	                const textStart = this.renderEngine.timeToPosition(textBlock.start);
	                const textEnd = this.renderEngine.timeToPosition(textBlock.end);
	                this.renderEngine.addText({ text: name, x: textStart, y: y, w: textEnd - textStart });
	                const { x, w } = intervals.reduce((acc, { color, pattern, start, end, type }, index) => {
	                    const { x, w } = this.calcRect(start, end - start, index === intervals.length - 1);
	                    if (type === 'block') {
	                        this.renderEngine.addRect({ color, pattern, x, y, w });
	                    }
	                    else if (type === 'line') {
	                        const lineWidth = Math.min(this.styles.lineWidth, w);
	                        this.renderEngine.addRect({
	                            color,
	                            pattern,
	                            x: index === 0 ? x + lineWidth : x,
	                            y: y + (blockHeight - this.styles.lineWidth) / 2,
	                            w: index === intervals.length - 1 ? w - lineWidth : w,
	                            h: this.styles.lineWidth,
	                        });
	                        if (index === 0 || index === intervals.length - 1) {
	                            const lineHeight = this.styles.lineHeight === 'inherit' ? blockHeight / 2 : this.styles.lineHeight;
	                            this.renderEngine.addRect({
	                                color,
	                                pattern,
	                                x: index === 0 ? x : x + w - lineWidth,
	                                y: y + (blockHeight - lineHeight) / 2,
	                                w: lineWidth,
	                                h: lineHeight,
	                            });
	                        }
	                    }
	                    return {
	                        x: acc.x === null ? x : acc.x,
	                        w: w + acc.w,
	                    };
	                }, { x: null, w: 0 });
	                if (this.selectedRegion && this.selectedRegion.type === 'waterfall-node') {
	                    const selectedIndex = this.selectedRegion.data;
	                    if (selectedIndex === index) {
	                        this.renderEngine.addStroke({
	                            color: 'green',
	                            x: x !== null && x !== void 0 ? x : 0,
	                            y,
	                            w,
	                            h: this.renderEngine.blockHeight,
	                        });
	                    }
	                }
	                this.interactionsEngine.addHitRegion("waterfall-node" /* RegionTypes.WATERFALL_NODE */, index, x !== null && x !== void 0 ? x : 0, y, w, this.renderEngine.blockHeight);
	            }
	        }, 0);
	    }
	}

	const defaultTogglePluginStyles = {
	    height: 16,
	    color: 'rgb(202,202,202, 0.25)',
	    strokeColor: 'rgb(138,138,138, 0.50)',
	    dotsColor: 'rgb(97,97,97)',
	    fontColor: 'black',
	    font: '10px sans-serif',
	    triangleWidth: 10,
	    triangleHeight: 7,
	    triangleColor: 'black',
	    leftPadding: 10,
	};
	class TogglePlugin extends UIPlugin {
	    constructor(title, settings) {
	        super('togglePlugin');
	        this.styles = defaultTogglePluginStyles;
	        this.height = 0;
	        this.resizeActive = false;
	        this.resizeStartHeight = 0;
	        this.resizeStartPosition = 0;
	        this.setSettings(settings);
	        this.title = title;
	    }
	    setSettings({ styles } = {}) {
	        this.styles = mergeObjects(defaultTogglePluginStyles, styles);
	        this.height = this.styles.height + 1;
	    }
	    init(renderEngine, interactionsEngine) {
	        super.init(renderEngine, interactionsEngine);
	        const nextEngine = this.getNextEngine();
	        nextEngine.setFlexible();
	        this.interactionsEngine.on('click', (region) => {
	            if (region && region.type === 'toggle' && region.data === this.renderEngine.id) {
	                const nextEngine = this.getNextEngine();
	                if (nextEngine.collapsed) {
	                    nextEngine.expand();
	                }
	                else {
	                    nextEngine.collapse();
	                }
	                this.renderEngine.parent.recalcChildrenSizes();
	                this.renderEngine.parent.render();
	            }
	        });
	        this.interactionsEngine.on('down', (region) => {
	            if (region && region.type === 'knob-resize' && region.data === this.renderEngine.id) {
	                const prevEngine = this.getPrevEngine();
	                this.interactionsEngine.setCursor('row-resize');
	                this.resizeActive = true;
	                this.resizeStartHeight = prevEngine.height;
	                this.resizeStartPosition = this.interactionsEngine.getGlobalMouse().y;
	            }
	        });
	        this.interactionsEngine.parent.on('move', () => {
	            if (this.resizeActive) {
	                const prevEngine = this.getPrevEngine();
	                const mouse = this.interactionsEngine.getGlobalMouse();
	                if (prevEngine.flexible) {
	                    const newPosition = this.resizeStartHeight - (this.resizeStartPosition - mouse.y);
	                    if (newPosition <= 0) {
	                        prevEngine.collapse();
	                        prevEngine.resize({ height: 0 });
	                    }
	                    else {
	                        if (prevEngine.collapsed) {
	                            prevEngine.expand();
	                        }
	                        prevEngine.resize({ height: newPosition });
	                    }
	                    this.renderEngine.parent.render();
	                }
	            }
	        });
	        this.interactionsEngine.parent.on('up', () => {
	            this.interactionsEngine.clearCursor();
	            this.resizeActive = false;
	        });
	    }
	    getPrevEngine() {
	        var _a;
	        const prevRenderEngineId = ((_a = this.renderEngine.id) !== null && _a !== void 0 ? _a : 0) - 1;
	        return this.renderEngine.parent.children[prevRenderEngineId];
	    }
	    getNextEngine() {
	        var _a;
	        const nextRenderEngineId = ((_a = this.renderEngine.id) !== null && _a !== void 0 ? _a : 0) + 1;
	        return this.renderEngine.parent.children[nextRenderEngineId];
	    }
	    render() {
	        const nextEngine = this.getNextEngine();
	        const prevEngine = this.getPrevEngine();
	        const triangleFullWidth = this.styles.leftPadding + this.styles.triangleWidth;
	        const centerW = this.renderEngine.width / 2;
	        const centerH = this.styles.height / 2;
	        this.renderEngine.setCtxFont(this.styles.font);
	        this.renderEngine.setCtxValue('fillStyle', this.styles.color);
	        this.renderEngine.setCtxValue('strokeStyle', this.styles.strokeColor);
	        this.renderEngine.fillRect(0, 0, this.renderEngine.width, this.styles.height);
	        this.renderEngine.setCtxValue('fillStyle', this.styles.fontColor);
	        this.renderEngine.addText({ text: this.title, x: triangleFullWidth, y: 0, w: this.renderEngine.width });
	        this.renderEngine.renderTriangle(this.styles.triangleColor, this.styles.leftPadding, this.styles.height / 2, this.styles.triangleWidth, this.styles.triangleHeight, nextEngine.collapsed ? 'right' : 'bottom');
	        const { width: titleWidth } = this.renderEngine.ctx.measureText(this.title);
	        const buttonWidth = titleWidth + triangleFullWidth;
	        this.interactionsEngine.addHitRegion("toggle" /* RegionTypes.TOGGLE */, this.renderEngine.id, 0, 0, buttonWidth, this.styles.height, "pointer" /* CursorTypes.POINTER */);
	        if (prevEngine.flexible) {
	            this.renderEngine.renderCircle(this.styles.dotsColor, centerW, centerH, 1.5);
	            this.renderEngine.renderCircle(this.styles.dotsColor, centerW - 10, centerH, 1.5);
	            this.renderEngine.renderCircle(this.styles.dotsColor, centerW + 10, centerH, 1.5);
	            this.interactionsEngine.addHitRegion("knob-resize" /* RegionTypes.KNOB_RESIZE */, this.renderEngine.id, buttonWidth, 0, this.renderEngine.width - buttonWidth, this.styles.height, "row-resize" /* CursorTypes.ROW_RESIZE */);
	        }
	    }
	}

	var styles$2 = {"root":"styles-settings-module_root__vr79J","inputsWrapper":"styles-settings-module_inputsWrapper__qDK9w","section":"styles-settings-module_section__dPX35","input":"styles-settings-module_input__Ev4xo","sectionsWrapper":"styles-settings-module_sectionsWrapper__Y7lbk","sectionHeader":"styles-settings-module_sectionHeader__PC3h0","applyButton":"styles-settings-module_applyButton__OQ5kz"};

	const defaultTimeseriesPluginStyles = {
	    height: 56,
	};
	const EXTRA_POINTS_FOR_RENDER = 2;
	class TimeseriesPlugin extends UIPlugin {
	    constructor({ name = 'timeseriesPlugin', data, settings, }) {
	        super(name);
	        this.height = 56;
	        this.hoveredRegion = null;
	        this.setSettings(settings);
	        this.setData(data);
	    }
	    init(renderEngine, interactionsEngine) {
	        super.init(renderEngine, interactionsEngine);
	        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
	        this.interactionsEngine.on('hover', this.handleHover.bind(this));
	        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
	    }
	    handlePositionChange(position) {
	        const startPositionX = this.renderEngine.parent.positionX;
	        this.interactionsEngine.setCursor("grabbing" /* CursorTypes.GRABBING */);
	        this.renderEngine.tryToChangePosition(position.deltaX);
	        if (startPositionX !== this.renderEngine.parent.positionX) {
	            this.renderEngine.parent.render();
	        }
	    }
	    handleMouseUp() {
	        this.interactionsEngine.clearCursor();
	    }
	    setSettings({ styles } = { styles: this.styles }) {
	        this.styles = mergeObjects(defaultTimeseriesPluginStyles, styles);
	        this.height = this.styles.height;
	    }
	    setData(data) {
	        const preparedTmeseries = prepareTmeseries(data);
	        this.data = preparedTmeseries;
	        this.min = preparedTmeseries.total.min;
	        this.max = preparedTmeseries.total.max;
	        if (this.renderEngine) {
	            this.renderEngine.recalcMinMax();
	            this.renderEngine.resetParentView();
	        }
	    }
	    handleHover(region) {
	        this.hoveredRegion = region;
	    }
	    renderTooltip() {
	        if (this.hoveredRegion) {
	            const mouseX = this.interactionsEngine.getMouse().x;
	            const currentTimestamp = this.renderEngine.pixelToTime(mouseX) + this.renderEngine.positionX;
	            const time = `${currentTimestamp.toFixed(this.renderEngine.getAccuracy() + 2)} ${this.renderEngine.timeUnits}`;
	            const values = renderChartTooltipFields(currentTimestamp, this.data);
	            this.renderEngine.renderTooltipFromData([
	                {
	                    text: time,
	                },
	                ...values,
	            ], this.interactionsEngine.getGlobalMouse());
	            return true;
	        }
	        return false;
	    }
	    render() {
	        if (this.data.timeseries.length === 0) {
	            return;
	        }
	        const timestampStart = this.renderEngine.positionX;
	        const timestampEnd = this.renderEngine.positionX + this.renderEngine.getRealView();
	        this.data.timeseries.forEach((chart, index) => {
	            if (this.data.timeboxes[index].end < timestampStart || this.data.timeboxes[index].start > timestampEnd) {
	                return;
	            }
	            const leftIndex = timestampStart <= this.data.timeboxes[index].start
	                ? 0
	                : Math.max(chart.points.findIndex(([timestamp]) => timestamp >= timestampStart) -
	                    EXTRA_POINTS_FOR_RENDER, 0);
	            const rightIndex = timestampEnd >= this.data.timeboxes[index].end
	                ? chart.points.length
	                : chart.points.findIndex(([timestamp]) => timestamp >= timestampEnd) + EXTRA_POINTS_FOR_RENDER;
	            const visiblePoints = chart.points.slice(leftIndex, rightIndex);
	            const minmax = getMinMax(visiblePoints, chart, this.data.summary);
	            renderChart({
	                engine: this.renderEngine,
	                points: visiblePoints,
	                min: minmax.min,
	                max: minmax.max,
	                style: chart.style,
	            });
	        });
	        this.interactionsEngine.addHitRegion("timeseries" /* RegionTypes.TIMESERIES */, null, 0, 0, this.renderEngine.width, this.height);
	    }
	}

	const defaultStyles = {
	    main: defaultRenderStyles,
	    timeGrid: defaultTimeGridStyles,
	    timeGridPlugin: defaultTimeGridPluginStyles,
	    timeseriesPlugin: defaultTimeseriesPluginStyles,
	    timeframeSelectorPlugin: defaultTimeframeSelectorPluginStyles,
	    waterfallPlugin: defaultWaterfallPluginStyles,
	    togglePlugin: defaultTogglePluginStyles,
	};
	const StylesSettings = (props) => {
	    const [values, setValues] = reactExports.useState({});
	    const handleApply = reactExports.useCallback(() => {
	        props.onChange(values);
	    }, [props.onChange, values]);
	    return (jsxRuntimeExports.jsxs("div", { className: styles$2.root, children: [jsxRuntimeExports.jsx("div", { className: styles$2.sectionsWrapper, children: Object.entries(defaultStyles).map(([sectionName, sectionStyles]) => (jsxRuntimeExports.jsxs("div", { className: styles$2.section, children: [jsxRuntimeExports.jsx("div", { className: styles$2.sectionHeader, children: sectionName }), jsxRuntimeExports.jsx("div", { className: styles$2.inputsWrapper, children: Object.entries(sectionStyles).map(([styleName, value]) => {
	                                var _a, _b;
	                                return (jsxRuntimeExports.jsx(Input, { className: styles$2.input, value: (_b = (_a = values === null || values === void 0 ? void 0 : values[sectionName]) === null || _a === void 0 ? void 0 : _a[styleName]) !== null && _b !== void 0 ? _b : value, label: styleName, type: typeof value === 'number' ? 'number' : 'text', onChange: (newValue) => {
	                                        const isNumber = typeof value === 'number';
	                                        const newSectionValues = {
	                                            ...values[sectionName],
	                                            [styleName]: isNumber ? parseFloat(newValue) : newValue,
	                                        };
	                                        setValues({ ...values, [sectionName]: newSectionValues });
	                                    } }, styleName));
	                            }) })] }, sectionName))) }), jsxRuntimeExports.jsx("div", { children: jsxRuntimeExports.jsx(Button, { className: styles$2.applyButton, onClick: handleApply, children: "Apply" }) })] }));
	};

	const DEFAULT_COLOR = Color$1.hsl(180, 30, 70);
	class FlameChartPlugin extends UIPlugin {
	    constructor({ data, colors = {}, name = 'flameChartPlugin', }) {
	        super(name);
	        this.height = 0;
	        this.flatTree = [];
	        this.positionY = 0;
	        this.colors = {};
	        this.selectedRegion = null;
	        this.hoveredRegion = null;
	        this.lastRandomColor = DEFAULT_COLOR;
	        this.metaClusterizedFlatTree = [];
	        this.actualClusterizedFlatTree = [];
	        this.initialClusterizedFlatTree = [];
	        this.lastUsedColor = null;
	        this.renderChartTimeout = -1;
	        this.data = data;
	        this.userColors = colors;
	        this.parseData();
	        this.reset();
	    }
	    init(renderEngine, interactionsEngine) {
	        super.init(renderEngine, interactionsEngine);
	        this.interactionsEngine.on('change-position', this.handlePositionChange.bind(this));
	        this.interactionsEngine.on('select', this.handleSelect.bind(this));
	        this.interactionsEngine.on('hover', this.handleHover.bind(this));
	        this.interactionsEngine.on('up', this.handleMouseUp.bind(this));
	        this.initData();
	    }
	    handlePositionChange({ deltaX, deltaY }) {
	        const startPositionY = this.positionY;
	        const startPositionX = this.renderEngine.parent.positionX;
	        this.interactionsEngine.setCursor('grabbing');
	        if (this.positionY + deltaY >= 0) {
	            this.setPositionY(this.positionY + deltaY);
	        }
	        else {
	            this.setPositionY(0);
	        }
	        this.renderEngine.tryToChangePosition(deltaX);
	        if (startPositionX !== this.renderEngine.parent.positionX || startPositionY !== this.positionY) {
	            this.renderEngine.parent.render();
	        }
	    }
	    handleMouseUp() {
	        this.interactionsEngine.clearCursor();
	    }
	    setPositionY(y) {
	        this.positionY = y;
	    }
	    reset() {
	        this.colors = {};
	        this.lastRandomColor = DEFAULT_COLOR;
	        this.positionY = 0;
	        this.selectedRegion = null;
	    }
	    calcMinMax() {
	        const { flatTree } = this;
	        const { min, max } = getFlatTreeMinMax(flatTree);
	        this.min = min;
	        this.max = max;
	    }
	    handleSelect(region) {
	        var _a, _b;
	        const selectedRegion = this.findNodeInCluster(region);
	        if (this.selectedRegion !== selectedRegion) {
	            this.selectedRegion = selectedRegion;
	            this.renderEngine.render();
	            this.emit('select', { node: (_b = (_a = this.selectedRegion) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : null, type: 'flame-chart-node' });
	        }
	    }
	    handleHover(region) {
	        this.hoveredRegion = this.findNodeInCluster(region);
	    }
	    findNodeInCluster(region) {
	        const mouse = this.interactionsEngine.getMouse();
	        if (region && region.type === "cluster" /* RegionTypes.CLUSTER */) {
	            const hoveredNode = region.data.nodes.find(({ level, source: { start, duration } }) => {
	                const { x, y, w } = this.calcRect(start, duration, level);
	                return mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + this.renderEngine.blockHeight;
	            });
	            if (hoveredNode) {
	                return {
	                    data: hoveredNode,
	                    type: 'node',
	                };
	            }
	        }
	        return null;
	    }
	    getColor(type = '_default', defaultColor) {
	        if (defaultColor) {
	            return defaultColor;
	        }
	        else if (this.colors[type]) {
	            return this.colors[type];
	        }
	        else if (this.userColors[type]) {
	            const color = new Color$1(this.userColors[type]);
	            this.colors[type] = color.rgb().toString();
	            return this.colors[type];
	        }
	        this.lastRandomColor = this.lastRandomColor.rotate(27);
	        this.colors[type] = this.lastRandomColor.rgb().toString();
	        return this.colors[type];
	    }
	    setData(data) {
	        this.data = data;
	        this.parseData();
	        this.initData();
	        this.reset();
	        this.renderEngine.recalcMinMax();
	        this.renderEngine.resetParentView();
	    }
	    parseData() {
	        this.flatTree = flatTree(this.data);
	        this.calcMinMax();
	    }
	    initData() {
	        this.metaClusterizedFlatTree = metaClusterizeFlatTree(this.flatTree);
	        this.initialClusterizedFlatTree = clusterizeFlatTree(this.metaClusterizedFlatTree, this.renderEngine.zoom, this.min, this.max);
	        this.reclusterizeClusteredFlatTree();
	    }
	    reclusterizeClusteredFlatTree() {
	        this.actualClusterizedFlatTree = reclusterizeClusteredFlatTree(this.initialClusterizedFlatTree, this.renderEngine.zoom, this.renderEngine.positionX, this.renderEngine.positionX + this.renderEngine.getRealView());
	    }
	    calcRect(start, duration, level) {
	        const w = duration * this.renderEngine.zoom;
	        return {
	            x: this.renderEngine.timeToPosition(start),
	            y: level * (this.renderEngine.blockHeight + 1) - this.positionY,
	            w: w <= 0.1 ? 0.1 : w >= 3 ? w - 1 : w - w / 3,
	        };
	    }
	    renderTooltip() {
	        if (this.hoveredRegion) {
	            if (this.renderEngine.options.tooltip === false) {
	                return true;
	            }
	            else if (typeof this.renderEngine.options.tooltip === 'function') {
	                this.renderEngine.options.tooltip(this.hoveredRegion, this.renderEngine, this.interactionsEngine.getGlobalMouse());
	            }
	            else {
	                const { data: { source: { start, duration, name, children }, }, } = this.hoveredRegion;
	                const timeUnits = this.renderEngine.getTimeUnits();
	                const selfTime = duration - (children ? children.reduce((acc, { duration }) => acc + duration, 0) : 0);
	                const nodeAccuracy = this.renderEngine.getAccuracy() + 2;
	                const header = `${name}`;
	                const dur = `duration: ${duration.toFixed(nodeAccuracy)} ${timeUnits} ${(children === null || children === void 0 ? void 0 : children.length) ? `(self ${selfTime.toFixed(nodeAccuracy)} ${timeUnits})` : ''}`;
	                const st = `start: ${start.toFixed(nodeAccuracy)}`;
	                this.renderEngine.renderTooltipFromData([{ text: header }, { text: dur }, { text: st }], this.interactionsEngine.getGlobalMouse());
	            }
	            return true;
	        }
	        return false;
	    }
	    render() {
	        const { width, blockHeight, height, minTextWidth } = this.renderEngine;
	        this.lastUsedColor = null;
	        this.reclusterizeClusteredFlatTree();
	        const processCluster = (cb) => {
	            return (cluster) => {
	                const { start, duration, level } = cluster;
	                const { x, y, w } = this.calcRect(start, duration, level);
	                if (x + w > 0 && x < width && y + blockHeight > 0 && y < height) {
	                    cb(cluster, x, y, w);
	                }
	            };
	        };
	        const renderCluster = (cluster, x, y, w) => {
	            const { type, nodes, color, pattern, badge } = cluster;
	            const mouse = this.interactionsEngine.getMouse();
	            if (mouse.y >= y && mouse.y <= y + blockHeight) {
	                addHitRegion(cluster, x, y, w);
	            }
	            if (w >= 0.25) {
	                this.renderEngine.addRect({ color: this.getColor(type, color), pattern, x, y, w }, 0);
	                if (badge) {
	                    const badgePatternName = `node-badge-${badge}`;
	                    const badgeWidth = (this.renderEngine.styles.badgeSize * 2) / Math.SQRT2;
	                    this.renderEngine.createCachedDefaultPattern({
	                        name: badgePatternName,
	                        type: 'triangles',
	                        config: {
	                            color: badge,
	                            width: badgeWidth,
	                            align: 'top',
	                            direction: 'top-left',
	                        },
	                    });
	                    this.renderEngine.addRect({
	                        pattern: badgePatternName,
	                        color: 'transparent',
	                        x,
	                        y,
	                        w: Math.min(badgeWidth, w),
	                    }, 1);
	                }
	            }
	            if (w >= minTextWidth && nodes.length === 1) {
	                this.renderEngine.addText({ text: nodes[0].source.name, x, y, w }, 2);
	            }
	        };
	        const addHitRegion = (cluster, x, y, w) => {
	            this.interactionsEngine.addHitRegion("cluster" /* RegionTypes.CLUSTER */, cluster, x, y, w, blockHeight);
	        };
	        this.actualClusterizedFlatTree.forEach(processCluster(renderCluster));
	        if (this.selectedRegion && this.selectedRegion.type === 'node') {
	            const { source: { start, duration }, level, } = this.selectedRegion.data;
	            const { x, y, w } = this.calcRect(start, duration, level);
	            this.renderEngine.addStroke({ color: 'green', x, y, w, h: this.renderEngine.blockHeight }, 2);
	        }
	        clearTimeout(this.renderChartTimeout);
	        this.renderChartTimeout = window.setTimeout(() => {
	            this.interactionsEngine.clearHitRegions();
	            this.actualClusterizedFlatTree.forEach(processCluster(addHitRegion));
	        }, 16);
	    }
	}

	class MarksPlugin extends UIPlugin {
	    constructor({ data, name = 'marksPlugin' }) {
	        super(name);
	        this.hoveredRegion = null;
	        this.selectedRegion = null;
	        this.marks = this.prepareMarks(data);
	        this.calcMinMax();
	    }
	    calcMinMax() {
	        const { marks } = this;
	        if (marks.length) {
	            this.min = marks.reduce((acc, { timestamp }) => (timestamp < acc ? timestamp : acc), marks[0].timestamp);
	            this.max = marks.reduce((acc, { timestamp }) => (timestamp > acc ? timestamp : acc), marks[0].timestamp);
	        }
	    }
	    init(renderEngine, interactionsEngine) {
	        super.init(renderEngine, interactionsEngine);
	        this.interactionsEngine.on('hover', this.handleHover.bind(this));
	        this.interactionsEngine.on('select', this.handleSelect.bind(this));
	    }
	    handleHover(region) {
	        this.hoveredRegion = region;
	    }
	    handleSelect(region) {
	        var _a;
	        if (this.selectedRegion !== region) {
	            this.selectedRegion = region;
	            this.emit('select', { node: (_a = region === null || region === void 0 ? void 0 : region.data) !== null && _a !== void 0 ? _a : null, type: 'mark' });
	            this.renderEngine.render();
	        }
	    }
	    get height() {
	        return this.renderEngine.blockHeight + 2;
	    }
	    prepareMarks(marks) {
	        return marks
	            .map(({ color, ...rest }) => ({
	            ...rest,
	            color: new Color$1(color).alpha(0.7).rgb().toString(),
	        }))
	            .sort((a, b) => a.timestamp - b.timestamp);
	    }
	    setMarks(marks) {
	        this.marks = this.prepareMarks(marks);
	        this.calcMinMax();
	        this.renderEngine.recalcMinMax();
	        this.renderEngine.resetParentView();
	    }
	    calcMarksBlockPosition(position, prevEnding) {
	        if (position > 0) {
	            if (prevEnding > position) {
	                return prevEnding;
	            }
	            return position;
	        }
	        return position;
	    }
	    render() {
	        this.marks.reduce((prevEnding, node) => {
	            const { timestamp, color, shortName } = node;
	            const { width } = this.renderEngine.ctx.measureText(shortName);
	            const fullWidth = width + this.renderEngine.blockPaddingLeftRight * 2;
	            const position = this.renderEngine.timeToPosition(timestamp);
	            const blockPosition = this.calcMarksBlockPosition(position, prevEnding);
	            this.renderEngine.addRect({ color, x: blockPosition, y: 1, w: fullWidth });
	            this.renderEngine.addText({ text: shortName, x: blockPosition, y: 1, w: fullWidth });
	            this.interactionsEngine.addHitRegion("timestamp" /* RegionTypes.TIMESTAMP */, node, blockPosition, 1, fullWidth, this.renderEngine.blockHeight);
	            return blockPosition + fullWidth;
	        }, 0);
	    }
	    postRender() {
	        this.marks.forEach((node) => {
	            const { timestamp, color } = node;
	            const position = this.renderEngine.timeToPosition(timestamp);
	            this.renderEngine.parent.setCtxValue('strokeStyle', color);
	            this.renderEngine.parent.setCtxValue('lineWidth', 1);
	            this.renderEngine.parent.callCtx('setLineDash', [8, 7]);
	            this.renderEngine.parent.ctx.beginPath();
	            this.renderEngine.parent.ctx.moveTo(position, this.renderEngine.position);
	            this.renderEngine.parent.ctx.lineTo(position, this.renderEngine.parent.height);
	            this.renderEngine.parent.ctx.stroke();
	        });
	    }
	    renderTooltip() {
	        if (this.hoveredRegion && this.hoveredRegion.type === 'timestamp') {
	            if (this.renderEngine.options.tooltip === false) {
	                return true;
	            }
	            else if (typeof this.renderEngine.options.tooltip === 'function') {
	                this.renderEngine.options.tooltip(this.hoveredRegion, this.renderEngine, this.interactionsEngine.getGlobalMouse());
	            }
	            else {
	                const { data: { fullName, timestamp }, } = this.hoveredRegion;
	                const marksAccuracy = this.renderEngine.getAccuracy() + 2;
	                const header = `${fullName}`;
	                const time = `${timestamp.toFixed(marksAccuracy)} ${this.renderEngine.timeUnits}`;
	                this.renderEngine.renderTooltipFromData([{ text: header }, { text: time }], this.interactionsEngine.getGlobalMouse());
	            }
	            return true;
	        }
	        return false;
	    }
	}

	class OffscreenRenderEngine extends BasicRenderEngine {
	    constructor({ width, height, parent, id }) {
	        const canvas = document.createElement('canvas');
	        canvas.width = width;
	        canvas.height = height;
	        super(canvas, { options: parent.options, styles: parent.styles });
	        this.flexible = false;
	        this.collapsed = false;
	        this.position = 0;
	        this.width = width;
	        this.height = height;
	        this.parent = parent;
	        this.id = id;
	        this.children = [];
	        this.applyCanvasSize();
	    }
	    makeChild() {
	        const child = new OffscreenRenderEngine({
	            width: this.width,
	            height: this.height,
	            parent: this.parent,
	            id: void 0,
	        });
	        this.children.push(child);
	        child.setMinMax(this.min, this.max);
	        child.resetView();
	        return child;
	    }
	    setFlexible() {
	        this.flexible = true;
	    }
	    collapse() {
	        this.collapsed = true;
	        this.clear();
	    }
	    expand() {
	        this.collapsed = false;
	    }
	    setSettingsOverrides(settings) {
	        this.setSettings({
	            styles: mergeObjects(this.styles, settings.styles),
	            options: mergeObjects(this.options, settings.options),
	        });
	        this.children.forEach((child) => child.setSettingsOverrides(settings));
	    }
	    // @ts-ignore - overrides a parent function which has different signature
	    resize({ width, height, position }, isParentCall) {
	        const isHeightChanged = super.resize(width, height);
	        if (!isParentCall && isHeightChanged) {
	            this.parent.recalcChildrenSizes();
	        }
	        if (typeof position === 'number') {
	            this.position = position;
	        }
	        this.children.forEach((child) => child.resize({ width, height, position }));
	    }
	    setMinMax(min, max) {
	        super.setMinMax(min, max);
	        this.children.forEach((child) => child.setMinMax(min, max));
	    }
	    setSettings(settings) {
	        super.setSettings(settings);
	        if (this.children) {
	            this.children.forEach((child) => child.setSettings(settings));
	        }
	    }
	    tryToChangePosition(positionDelta) {
	        this.parent.tryToChangePosition(positionDelta);
	    }
	    recalcMinMax() {
	        this.parent.calcMinMax();
	    }
	    getTimeUnits() {
	        return this.parent.getTimeUnits();
	    }
	    getAccuracy() {
	        return this.parent.timeGrid.accuracy;
	    }
	    renderTimeGrid() {
	        this.parent.timeGrid.renderLines(0, this.height, this);
	    }
	    renderTimeGridTimes() {
	        this.parent.timeGrid.renderTimes(this);
	    }
	    standardRender() {
	        this.resolveQueue();
	        this.renderTimeGrid();
	    }
	    renderTooltipFromData(fields, mouse) {
	        this.parent.renderTooltipFromData(fields, mouse);
	    }
	    resetParentView() {
	        this.parent.resetView();
	        this.parent.render();
	    }
	    render() {
	        this.parent.partialRender(this.id);
	    }
	}

	const MAX_ACCURACY = 6;
	class RenderEngine extends BasicRenderEngine {
	    constructor({ canvas, settings, timeGrid, plugins }) {
	        super(canvas, settings);
	        this.freeSpace = 0;
	        this.lastPartialAnimationFrame = null;
	        this.lastGlobalAnimationFrame = null;
	        this.plugins = plugins;
	        this.children = [];
	        this.requestedRenders = [];
	        this.timeGrid = timeGrid;
	        this.timeGrid.setDefaultRenderEngine(this);
	    }
	    makeInstance() {
	        const offscreenRenderEngine = new OffscreenRenderEngine({
	            width: this.width,
	            height: 0,
	            id: this.children.length,
	            parent: this,
	        });
	        offscreenRenderEngine.setMinMax(this.min, this.max);
	        offscreenRenderEngine.resetView();
	        this.children.push(offscreenRenderEngine);
	        return offscreenRenderEngine;
	    }
	    calcMinMax() {
	        const min = this.plugins
	            .map(({ min }) => min)
	            .filter(isNumber)
	            .reduce((acc, min) => Math.min(acc, min));
	        const max = this.plugins
	            .map(({ max }) => max)
	            .filter(isNumber)
	            .reduce((acc, max) => Math.max(acc, max));
	        this.setMinMax(min, max);
	    }
	    calcTimeGrid() {
	        this.timeGrid.recalc();
	    }
	    setMinMax(min, max) {
	        super.setMinMax(min, max);
	        this.children.forEach((engine) => engine.setMinMax(min, max));
	    }
	    setSettings(data) {
	        super.setSettings(data);
	        if (this.children) {
	            this.children.forEach((engine) => engine.setSettings(data));
	            this.recalcChildrenSizes();
	        }
	    }
	    resize(width, height) {
	        const currentWidth = this.width;
	        super.resize(width, height);
	        this.recalcChildrenSizes();
	        if (this.getInitialZoom() > this.zoom) {
	            this.resetView();
	        }
	        else if (this.positionX > this.min) {
	            this.tryToChangePosition(-this.pixelToTime((width - currentWidth) / 2));
	        }
	        return true;
	    }
	    recalcChildrenSizes() {
	        const childrenSizes = this.getChildrenSizes();
	        this.freeSpace = childrenSizes.reduce((acc, { height }) => acc - height, this.height);
	        this.children.forEach((engine, index) => {
	            engine.resize(childrenSizes[index], true);
	        });
	    }
	    getChildrenSizes() {
	        const indexes = this.children.map((_, index) => index);
	        const enginesTypes = indexes.map((index) => {
	            const plugin = this.plugins[index];
	            const engine = this.children[index];
	            if (engine.flexible && plugin.height) {
	                return 'flexibleStatic';
	            }
	            else if (!plugin.height) {
	                return 'flexibleGrowing';
	            }
	            return 'static';
	        });
	        const freeSpace = enginesTypes.reduce((acc, type, index) => {
	            var _a, _b;
	            const plugin = this.plugins[index];
	            const engine = this.children[index];
	            if (engine.collapsed) {
	                return acc;
	            }
	            else if (type === 'flexibleGrowing') {
	                return acc - (engine.height || 0);
	            }
	            else if (type === 'flexibleStatic') {
	                return acc - ((engine === null || engine === void 0 ? void 0 : engine.height) || (plugin === null || plugin === void 0 ? void 0 : plugin.height) || 0);
	            }
	            else if (type === 'static') {
	                return acc - ((_b = (_a = this.plugins[index]) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : 0);
	            }
	            return acc;
	        }, this.height);
	        const flexibleGrowingCount = enginesTypes.filter((type) => type === 'flexibleGrowing').length;
	        const freeSpacePart = Math.floor(freeSpace / flexibleGrowingCount);
	        return enginesTypes.reduce((acc, type, index) => {
	            var _a, _b;
	            const engine = this.children[index];
	            const plugin = this.plugins[index];
	            let height = 0;
	            if (engine.collapsed) {
	                height = 0;
	            }
	            else {
	                switch (type) {
	                    case 'static':
	                        height = (_a = plugin.height) !== null && _a !== void 0 ? _a : 0;
	                        break;
	                    case 'flexibleGrowing':
	                        height = (engine.height || 0) + freeSpacePart;
	                        break;
	                    case 'flexibleStatic':
	                        height = (_b = (engine.height || this.plugins[index].height)) !== null && _b !== void 0 ? _b : 0;
	                        break;
	                }
	            }
	            acc.result.push({
	                width: this.width,
	                position: acc.position,
	                height,
	            });
	            acc.position += height;
	            return acc;
	        }, {
	            position: 0,
	            result: [],
	        }).result;
	    }
	    getAccuracy() {
	        return this.timeGrid.accuracy;
	    }
	    setZoom(zoom) {
	        if (this.getAccuracy() < MAX_ACCURACY || zoom <= this.zoom) {
	            super.setZoom(zoom);
	            this.children.forEach((engine) => engine.setZoom(zoom));
	            return true;
	        }
	        return false;
	    }
	    setPositionX(x) {
	        const res = super.setPositionX(x);
	        this.children.forEach((engine) => engine.setPositionX(x));
	        return res;
	    }
	    renderPlugin(index) {
	        var _a;
	        const plugin = this.plugins[index];
	        const engine = this.children[index];
	        engine === null || engine === void 0 ? void 0 : engine.clear();
	        if (!engine.collapsed) {
	            const isFullRendered = (_a = plugin === null || plugin === void 0 ? void 0 : plugin.render) === null || _a === void 0 ? void 0 : _a.call(plugin);
	            if (!isFullRendered) {
	                engine.standardRender();
	            }
	        }
	    }
	    partialRender(id) {
	        if (typeof id === 'number') {
	            this.requestedRenders.push(id);
	        }
	        if (!this.lastPartialAnimationFrame) {
	            this.lastPartialAnimationFrame = requestAnimationFrame(() => {
	                this.requestedRenders.forEach((index) => this.renderPlugin(index));
	                this.shallowRender();
	                this.requestedRenders = [];
	                this.lastPartialAnimationFrame = null;
	            });
	        }
	    }
	    shallowRender() {
	        this.clear();
	        this.timeGrid.renderLines(this.height - this.freeSpace, this.freeSpace);
	        this.children.forEach((engine) => {
	            if (!engine.collapsed) {
	                this.copy(engine);
	            }
	        });
	        let tooltipRendered = false;
	        this.plugins.forEach((plugin) => {
	            if (plugin.postRender) {
	                plugin.postRender();
	            }
	        });
	        this.plugins.forEach((plugin) => {
	            if (plugin.renderTooltip) {
	                tooltipRendered = tooltipRendered || Boolean(plugin.renderTooltip());
	            }
	        });
	        if (!tooltipRendered && typeof this.options.tooltip === 'function') {
	            // notify tooltip of nothing to render
	            this.options.tooltip(null, this, null);
	        }
	    }
	    render(prepare) {
	        if (typeof this.lastPartialAnimationFrame === 'number') {
	            cancelAnimationFrame(this.lastPartialAnimationFrame);
	        }
	        this.requestedRenders = [];
	        this.lastPartialAnimationFrame = null;
	        if (!this.lastGlobalAnimationFrame) {
	            this.lastGlobalAnimationFrame = requestAnimationFrame(() => {
	                prepare === null || prepare === void 0 ? void 0 : prepare();
	                this.timeGrid.recalc();
	                this.children.forEach((_, index) => this.renderPlugin(index));
	                this.shallowRender();
	                this.lastGlobalAnimationFrame = null;
	            });
	        }
	    }
	}

	const EVENT_NAMES = ['down', 'up', 'move', 'click', 'select'];

	class SeparatedInteractionsEngine extends EventEmitter {
	    static getId() {
	        return SeparatedInteractionsEngine.count++;
	    }
	    constructor(parent, renderEngine) {
	        super();
	        this.id = SeparatedInteractionsEngine.getId();
	        this.parent = parent;
	        this.renderEngine = renderEngine;
	        renderEngine.on('clear', () => this.clearHitRegions());
	        EVENT_NAMES.forEach((eventName) => parent.on(eventName, (region, mouse, isClick) => {
	            if (!region || region.id === this.id) {
	                this.resend(eventName, region, mouse, isClick);
	            }
	        }));
	        ['hover'].forEach((eventName) => parent.on(eventName, (region, mouse) => {
	            if (!region || region.id === this.id) {
	                this.emit(eventName, region, mouse);
	            }
	        }));
	        parent.on('change-position', (data, startMouse, endMouse, instance) => {
	            if (instance === this) {
	                this.emit('change-position', data, startMouse, endMouse);
	            }
	        });
	        this.hitRegions = [];
	    }
	    resend(event, ...args) {
	        if (this.renderEngine.position <= this.parent.mouse.y &&
	            this.renderEngine.height + this.renderEngine.position >= this.parent.mouse.y) {
	            this.emit(event, ...args);
	        }
	    }
	    getMouse() {
	        const { x, y } = this.parent.mouse;
	        return {
	            x,
	            y: y - this.renderEngine.position,
	        };
	    }
	    getGlobalMouse() {
	        return this.parent.mouse;
	    }
	    clearHitRegions() {
	        this.hitRegions = [];
	    }
	    addHitRegion(type, data, x, y, w, h, cursor) {
	        this.hitRegions.push({
	            type,
	            data,
	            x,
	            y,
	            w,
	            h,
	            cursor,
	            id: this.id,
	        });
	    }
	    setCursor(cursor) {
	        this.parent.setCursor(cursor);
	    }
	    clearCursor() {
	        this.parent.clearCursor();
	    }
	}
	SeparatedInteractionsEngine.count = 0;

	class InteractionsEngine extends EventEmitter {
	    constructor(canvas, renderEngine) {
	        super();
	        this.selectedRegion = null;
	        this.hoveredRegion = null;
	        this.moveActive = false;
	        this.currentCursor = null;
	        this.renderEngine = renderEngine;
	        this.canvas = canvas;
	        this.hitRegions = [];
	        this.instances = [];
	        this.mouse = {
	            x: 0,
	            y: 0,
	        };
	        this.handleMouseWheel = this.handleMouseWheel.bind(this);
	        this.handleMouseDown = this.handleMouseDown.bind(this);
	        this.handleMouseUp = this.handleMouseUp.bind(this);
	        this.handleMouseMove = this.handleMouseMove.bind(this);
	        this.initListeners();
	        this.reset();
	    }
	    makeInstance(renderEngine) {
	        const separatedInteractionsEngine = new SeparatedInteractionsEngine(this, renderEngine);
	        this.instances.push(separatedInteractionsEngine);
	        return separatedInteractionsEngine;
	    }
	    reset() {
	        this.selectedRegion = null;
	        this.hoveredRegion = null;
	        this.hitRegions = [];
	    }
	    destroy() {
	        this.removeListeners();
	    }
	    initListeners() {
	        if (this.canvas) {
	            this.canvas.addEventListener('wheel', this.handleMouseWheel);
	            this.canvas.addEventListener('mousedown', this.handleMouseDown);
	            this.canvas.addEventListener('mouseup', this.handleMouseUp);
	            this.canvas.addEventListener('mouseleave', this.handleMouseUp);
	            this.canvas.addEventListener('mousemove', this.handleMouseMove);
	        }
	    }
	    removeListeners() {
	        if (this.canvas) {
	            this.canvas.removeEventListener('wheel', this.handleMouseWheel);
	            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
	            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
	            this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
	            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
	        }
	    }
	    handleMouseWheel(e) {
	        const { deltaY, deltaX } = e;
	        e.preventDefault();
	        const realView = this.renderEngine.getRealView();
	        const initialZoom = this.renderEngine.getInitialZoom();
	        const startPosition = this.renderEngine.positionX;
	        const startZoom = this.renderEngine.zoom;
	        const positionScrollDelta = deltaX / this.renderEngine.zoom;
	        let zoomDelta = (deltaY / 1000) * this.renderEngine.zoom;
	        this.renderEngine.tryToChangePosition(positionScrollDelta);
	        zoomDelta =
	            this.renderEngine.zoom - zoomDelta >= initialZoom ? zoomDelta : this.renderEngine.zoom - initialZoom;
	        if (zoomDelta !== 0) {
	            const zoomed = this.renderEngine.setZoom(this.renderEngine.zoom - zoomDelta);
	            if (zoomed) {
	                const proportion = this.mouse.x / this.renderEngine.width;
	                const timeDelta = realView - this.renderEngine.width / this.renderEngine.zoom;
	                const positionDelta = timeDelta * proportion;
	                this.renderEngine.tryToChangePosition(positionDelta);
	            }
	        }
	        this.checkRegionHover();
	        if (startPosition !== this.renderEngine.positionX || startZoom !== this.renderEngine.zoom) {
	            this.renderEngine.render();
	        }
	    }
	    handleMouseDown() {
	        this.moveActive = true;
	        this.mouseDownPosition = {
	            x: this.mouse.x,
	            y: this.mouse.y,
	        };
	        this.mouseDownHoveredInstance = this.hoveredInstance;
	        this.emit('down', this.hoveredRegion, this.mouse);
	    }
	    handleMouseUp() {
	        this.moveActive = false;
	        const isClick = this.mouseDownPosition &&
	            this.mouseDownPosition.x === this.mouse.x &&
	            this.mouseDownPosition.y === this.mouse.y;
	        if (isClick) {
	            this.handleRegionHit();
	        }
	        this.emit('up', this.hoveredRegion, this.mouse, isClick);
	        if (isClick) {
	            this.emit('click', this.hoveredRegion, this.mouse);
	        }
	    }
	    handleMouseMove(e) {
	        if (this.moveActive) {
	            const mouseDeltaY = this.mouse.y - e.offsetY;
	            const mouseDeltaX = (this.mouse.x - e.offsetX) / this.renderEngine.zoom;
	            if (mouseDeltaY || mouseDeltaX) {
	                this.emit('change-position', {
	                    deltaX: mouseDeltaX,
	                    deltaY: mouseDeltaY,
	                }, this.mouseDownPosition, this.mouse, this.mouseDownHoveredInstance);
	            }
	        }
	        this.mouse.x = e.offsetX;
	        this.mouse.y = e.offsetY;
	        this.checkRegionHover();
	        this.emit('move', this.hoveredRegion, this.mouse);
	    }
	    handleRegionHit() {
	        const selectedRegion = this.getHoveredRegion();
	        this.emit('select', selectedRegion, this.mouse);
	    }
	    checkRegionHover() {
	        const hoveredRegion = this.getHoveredRegion();
	        if (hoveredRegion && this.hoveredRegion && hoveredRegion.id !== this.hoveredRegion.id) {
	            this.emit('hover', null, this.mouse);
	        }
	        if (hoveredRegion) {
	            if (!this.currentCursor && hoveredRegion.cursor) {
	                this.renderEngine.canvas.style.cursor = hoveredRegion.cursor;
	            }
	            else if (!this.currentCursor) {
	                this.clearCursor();
	            }
	            this.hoveredRegion = hoveredRegion;
	            this.emit('hover', hoveredRegion, this.mouse);
	            this.renderEngine.partialRender();
	        }
	        else if (this.hoveredRegion && !hoveredRegion) {
	            if (!this.currentCursor) {
	                this.clearCursor();
	            }
	            this.hoveredRegion = null;
	            this.emit('hover', null, this.mouse);
	            this.renderEngine.partialRender();
	        }
	    }
	    getHoveredRegion() {
	        const hoveredRegion = this.hitRegions.find(({ x, y, w, h }) => this.mouse.x >= x && this.mouse.x <= x + w && this.mouse.y >= y && this.mouse.y <= y + h);
	        if (hoveredRegion) {
	            return hoveredRegion;
	        }
	        const hoveredInstance = this.instances.find(({ renderEngine }) => renderEngine.position <= this.mouse.y && renderEngine.height + renderEngine.position >= this.mouse.y);
	        this.hoveredInstance = hoveredInstance;
	        if (hoveredInstance) {
	            const offsetTop = hoveredInstance.renderEngine.position;
	            return hoveredInstance.hitRegions.find(({ x, y, w, h }) => this.mouse.x >= x &&
	                this.mouse.x <= x + w &&
	                this.mouse.y >= y + offsetTop &&
	                this.mouse.y <= y + h + offsetTop);
	        }
	        return null;
	    }
	    clearHitRegions() {
	        this.hitRegions = [];
	    }
	    addHitRegion(type, data, x, y, w, h, cursor) {
	        this.hitRegions.push({
	            type,
	            data,
	            x,
	            y,
	            w,
	            h,
	            cursor,
	        });
	    }
	    setCursor(cursor) {
	        this.renderEngine.canvas.style.cursor = cursor;
	        this.currentCursor = cursor;
	    }
	    clearCursor() {
	        const hoveredRegion = this.getHoveredRegion();
	        this.currentCursor = null;
	        if (hoveredRegion === null || hoveredRegion === void 0 ? void 0 : hoveredRegion.cursor) {
	            this.renderEngine.canvas.style.cursor = hoveredRegion.cursor;
	        }
	        else {
	            this.renderEngine.canvas.style.cursor = '';
	        }
	    }
	}

	class FlameChartContainer extends EventEmitter {
	    constructor({ canvas, plugins, settings }) {
	        var _a;
	        super();
	        const styles = (_a = settings === null || settings === void 0 ? void 0 : settings.styles) !== null && _a !== void 0 ? _a : {};
	        this.timeGrid = new TimeGrid({ styles: styles === null || styles === void 0 ? void 0 : styles.timeGrid });
	        this.renderEngine = new RenderEngine({
	            canvas,
	            settings: {
	                styles: styles === null || styles === void 0 ? void 0 : styles.main,
	                options: settings === null || settings === void 0 ? void 0 : settings.options,
	            },
	            plugins,
	            timeGrid: this.timeGrid,
	        });
	        this.interactionsEngine = new InteractionsEngine(canvas, this.renderEngine);
	        this.plugins = plugins;
	        const children = Array(this.plugins.length)
	            .fill(null)
	            .map(() => {
	            const renderEngine = this.renderEngine.makeInstance();
	            const interactionsEngine = this.interactionsEngine.makeInstance(renderEngine);
	            return { renderEngine, interactionsEngine };
	        });
	        this.plugins.forEach((plugin, index) => {
	            plugin.init(children[index].renderEngine, children[index].interactionsEngine);
	        });
	        this.renderEngine.calcMinMax();
	        this.renderEngine.resetView();
	        this.renderEngine.recalcChildrenSizes();
	        this.renderEngine.calcTimeGrid();
	        this.plugins.forEach((plugin) => { var _a; return (_a = plugin.postInit) === null || _a === void 0 ? void 0 : _a.call(plugin); });
	        this.renderEngine.render();
	    }
	    render() {
	        this.renderEngine.render();
	    }
	    resize(width, height) {
	        this.renderEngine.render(() => this.renderEngine.resize(width, height));
	    }
	    execOnPlugins(fnName, ...args) {
	        let index = 0;
	        while (index < this.plugins.length) {
	            if (this.plugins[index][fnName]) {
	                this.plugins[index][fnName](...args);
	            }
	            index++;
	        }
	    }
	    setSettings(settings) {
	        var _a, _b;
	        this.timeGrid.setSettings({ styles: (_a = settings.styles) === null || _a === void 0 ? void 0 : _a.timeGrid });
	        this.renderEngine.setSettings({
	            options: settings.options,
	            styles: (_b = settings.styles) === null || _b === void 0 ? void 0 : _b.main,
	            patterns: settings.patterns,
	        });
	        this.plugins.forEach((plugin) => { var _a, _b; return (_a = plugin.setSettings) === null || _a === void 0 ? void 0 : _a.call(plugin, { styles: (_b = settings.styles) === null || _b === void 0 ? void 0 : _b[plugin.name] }); });
	        this.renderEngine.render();
	    }
	    setZoom(start, end) {
	        const zoom = this.renderEngine.width / (end - start);
	        this.renderEngine.setPositionX(start);
	        this.renderEngine.setZoom(zoom);
	        this.renderEngine.render();
	    }
	}

	const defaultSettings = {};
	class FlameChart extends FlameChartContainer {
	    constructor({ canvas, data, marks, waterfall, timeframeTimeseries, timeseries, colors, settings = defaultSettings, plugins = [], }) {
	        var _a;
	        const activePlugins = [];
	        const { headers: { waterfall: waterfallName = 'waterfall', flameChart: flameChartName = 'flame chart' } = {} } = settings;
	        const styles = (_a = settings === null || settings === void 0 ? void 0 : settings.styles) !== null && _a !== void 0 ? _a : {};
	        const timeGridPlugin = new TimeGridPlugin({ styles: styles === null || styles === void 0 ? void 0 : styles.timeGridPlugin });
	        activePlugins.push(timeGridPlugin);
	        let marksPlugin;
	        let waterfallPlugin;
	        let timeframeSelectorPlugin;
	        let flameChartPlugin;
	        let timeseriesPlugin;
	        if (timeseries) {
	            timeseriesPlugin = new TimeseriesPlugin({
	                data: timeseries,
	                settings: { styles: styles === null || styles === void 0 ? void 0 : styles.timeseriesPlugin },
	            });
	            activePlugins.push(timeseriesPlugin);
	        }
	        if (marks) {
	            marksPlugin = new MarksPlugin({ data: marks });
	            marksPlugin.on('select', (data) => this.emit('select', data));
	            activePlugins.push(marksPlugin);
	        }
	        if (waterfall) {
	            waterfallPlugin = new WaterfallPlugin({ data: waterfall, settings: { styles: styles === null || styles === void 0 ? void 0 : styles.waterfallPlugin } });
	            waterfallPlugin.on('select', (data) => this.emit('select', data));
	            if (data) {
	                activePlugins.push(new TogglePlugin(waterfallName, { styles: styles === null || styles === void 0 ? void 0 : styles.togglePlugin }));
	            }
	            activePlugins.push(waterfallPlugin);
	        }
	        if (data) {
	            flameChartPlugin = new FlameChartPlugin({ data, colors });
	            flameChartPlugin.on('select', (data) => this.emit('select', data));
	            if (waterfall) {
	                activePlugins.push(new TogglePlugin(flameChartName, { styles: styles === null || styles === void 0 ? void 0 : styles.togglePlugin }));
	            }
	            activePlugins.push(flameChartPlugin);
	        }
	        if (data || waterfall || timeframeTimeseries) {
	            timeframeSelectorPlugin = new TimeframeSelectorPlugin({
	                flameChartNodes: data,
	                waterfall: waterfall,
	                timeseries: timeframeTimeseries,
	                settings: { styles: styles === null || styles === void 0 ? void 0 : styles.timeframeSelectorPlugin },
	            });
	            activePlugins.unshift(timeframeSelectorPlugin);
	        }
	        super({
	            canvas,
	            settings,
	            plugins: [...activePlugins, ...plugins],
	        });
	        if (flameChartPlugin && timeframeSelectorPlugin) {
	            this.setNodes = (data) => {
	                if (flameChartPlugin) {
	                    flameChartPlugin.setData(data);
	                }
	                if (timeframeSelectorPlugin) {
	                    timeframeSelectorPlugin.setFlameChartNodes(data);
	                }
	            };
	            this.setFlameChartPosition = ({ x, y }) => {
	                if (typeof x === 'number') {
	                    this.renderEngine.setPositionX(x);
	                }
	                if (typeof y === 'number' && flameChartPlugin) {
	                    flameChartPlugin.setPositionY(y);
	                }
	                this.renderEngine.render();
	            };
	        }
	        if (marksPlugin) {
	            this.setMarks = (data) => {
	                if (marksPlugin) {
	                    marksPlugin.setMarks(data);
	                }
	            };
	        }
	        if (waterfallPlugin) {
	            this.setWaterfall = (data) => {
	                if (waterfallPlugin) {
	                    waterfallPlugin.setData(data);
	                }
	                if (timeframeSelectorPlugin) {
	                    timeframeSelectorPlugin.setWaterfall(data);
	                }
	            };
	        }
	        if (timeseriesPlugin) {
	            this.setTimeseries = (data) => {
	                if (timeseriesPlugin) {
	                    timeseriesPlugin.setData(data);
	                }
	            };
	        }
	        if (timeframeSelectorPlugin) {
	            this.setTimeframeTimeseries = (data) => {
	                timeframeSelectorPlugin === null || timeframeSelectorPlugin === void 0 ? void 0 : timeframeSelectorPlugin.setTimeseries(data);
	            };
	        }
	    }
	}

	// This could've been more streamlined with internal state instead of abusing
	// refs to such extent, but then composing hooks and components could not opt out of unnecessary renders.
	function useResolvedElement(subscriber, refOrElement) {
	  var lastReportRef = reactExports.useRef(null);
	  var refOrElementRef = reactExports.useRef(null);
	  refOrElementRef.current = refOrElement;
	  var cbElementRef = reactExports.useRef(null); // Calling re-evaluation after each render without using a dep array,
	  // as the ref object's current value could've changed since the last render.

	  reactExports.useEffect(function () {
	    evaluateSubscription();
	  });
	  var evaluateSubscription = reactExports.useCallback(function () {
	    var cbElement = cbElementRef.current;
	    var refOrElement = refOrElementRef.current; // Ugly ternary. But smaller than an if-else block.

	    var element = cbElement ? cbElement : refOrElement ? refOrElement instanceof Element ? refOrElement : refOrElement.current : null;

	    if (lastReportRef.current && lastReportRef.current.element === element && lastReportRef.current.subscriber === subscriber) {
	      return;
	    }

	    if (lastReportRef.current && lastReportRef.current.cleanup) {
	      lastReportRef.current.cleanup();
	    }

	    lastReportRef.current = {
	      element: element,
	      subscriber: subscriber,
	      // Only calling the subscriber, if there's an actual element to report.
	      // Setting cleanup to undefined unless a subscriber returns one, as an existing cleanup function would've been just called.
	      cleanup: element ? subscriber(element) : undefined
	    };
	  }, [subscriber]); // making sure we call the cleanup function on unmount

	  reactExports.useEffect(function () {
	    return function () {
	      if (lastReportRef.current && lastReportRef.current.cleanup) {
	        lastReportRef.current.cleanup();
	        lastReportRef.current = null;
	      }
	    };
	  }, []);
	  return reactExports.useCallback(function (element) {
	    cbElementRef.current = element;
	    evaluateSubscription();
	  }, [evaluateSubscription]);
	}

	// We're only using the first element of the size sequences, until future versions of the spec solidify on how
	// exactly it'll be used for fragments in multi-column scenarios:
	// From the spec:
	// > The box size properties are exposed as FrozenArray in order to support elements that have multiple fragments,
	// > which occur in multi-column scenarios. However the current definitions of content rect and border box do not
	// > mention how those boxes are affected by multi-column layout. In this spec, there will only be a single
	// > ResizeObserverSize returned in the FrozenArray, which will correspond to the dimensions of the first column.
	// > A future version of this spec will extend the returned FrozenArray to contain the per-fragment size information.
	// (https://drafts.csswg.org/resize-observer/#resize-observer-entry-interface)
	//
	// Also, testing these new box options revealed that in both Chrome and FF everything is returned in the callback,
	// regardless of the "box" option.
	// The spec states the following on this:
	// > This does not have any impact on which box dimensions are returned to the defined callback when the event
	// > is fired, it solely defines which box the author wishes to observe layout changes on.
	// (https://drafts.csswg.org/resize-observer/#resize-observer-interface)
	// I'm not exactly clear on what this means, especially when you consider a later section stating the following:
	// > This section is non-normative. An author may desire to observe more than one CSS box.
	// > In this case, author will need to use multiple ResizeObservers.
	// (https://drafts.csswg.org/resize-observer/#resize-observer-interface)
	// Which is clearly not how current browser implementations behave, and seems to contradict the previous quote.
	// For this reason I decided to only return the requested size,
	// even though it seems we have access to results for all box types.
	// This also means that we get to keep the current api, being able to return a simple { width, height } pair,
	// regardless of box option.
	function extractSize(entry, boxProp, sizeType) {
	  if (!entry[boxProp]) {
	    if (boxProp === "contentBoxSize") {
	      // The dimensions in `contentBoxSize` and `contentRect` are equivalent according to the spec.
	      // See the 6th step in the description for the RO algorithm:
	      // https://drafts.csswg.org/resize-observer/#create-and-populate-resizeobserverentry-h
	      // > Set this.contentRect to logical this.contentBoxSize given target and observedBox of "content-box".
	      // In real browser implementations of course these objects differ, but the width/height values should be equivalent.
	      return entry.contentRect[sizeType === "inlineSize" ? "width" : "height"];
	    }

	    return undefined;
	  } // A couple bytes smaller than calling Array.isArray() and just as effective here.


	  return entry[boxProp][0] ? entry[boxProp][0][sizeType] : // TS complains about this, because the RO entry type follows the spec and does not reflect Firefox's current
	  // behaviour of returning objects instead of arrays for `borderBoxSize` and `contentBoxSize`.
	  // @ts-ignore
	  entry[boxProp][sizeType];
	}

	function useResizeObserver(opts) {
	  if (opts === void 0) {
	    opts = {};
	  }

	  // Saving the callback as a ref. With this, I don't need to put onResize in the
	  // effect dep array, and just passing in an anonymous function without memoising
	  // will not reinstantiate the hook's ResizeObserver.
	  var onResize = opts.onResize;
	  var onResizeRef = reactExports.useRef(undefined);
	  onResizeRef.current = onResize;
	  var round = opts.round || Math.round; // Using a single instance throughout the hook's lifetime

	  var resizeObserverRef = reactExports.useRef();

	  var _useState = reactExports.useState({
	    width: undefined,
	    height: undefined
	  }),
	      size = _useState[0],
	      setSize = _useState[1]; // In certain edge cases the RO might want to report a size change just after
	  // the component unmounted.


	  var didUnmount = reactExports.useRef(false);
	  reactExports.useEffect(function () {
	    didUnmount.current = false;
	    return function () {
	      didUnmount.current = true;
	    };
	  }, []); // Using a ref to track the previous width / height to avoid unnecessary renders.

	  var previous = reactExports.useRef({
	    width: undefined,
	    height: undefined
	  }); // This block is kinda like a useEffect, only it's called whenever a new
	  // element could be resolved based on the ref option. It also has a cleanup
	  // function.

	  var refCallback = useResolvedElement(reactExports.useCallback(function (element) {
	    // We only use a single Resize Observer instance, and we're instantiating it on demand, only once there's something to observe.
	    // This instance is also recreated when the `box` option changes, so that a new observation is fired if there was a previously observed element with a different box option.
	    if (!resizeObserverRef.current || resizeObserverRef.current.box !== opts.box || resizeObserverRef.current.round !== round) {
	      resizeObserverRef.current = {
	        box: opts.box,
	        round: round,
	        instance: new ResizeObserver(function (entries) {
	          var entry = entries[0];
	          var boxProp = opts.box === "border-box" ? "borderBoxSize" : opts.box === "device-pixel-content-box" ? "devicePixelContentBoxSize" : "contentBoxSize";
	          var reportedWidth = extractSize(entry, boxProp, "inlineSize");
	          var reportedHeight = extractSize(entry, boxProp, "blockSize");
	          var newWidth = reportedWidth ? round(reportedWidth) : undefined;
	          var newHeight = reportedHeight ? round(reportedHeight) : undefined;

	          if (previous.current.width !== newWidth || previous.current.height !== newHeight) {
	            var newSize = {
	              width: newWidth,
	              height: newHeight
	            };
	            previous.current.width = newWidth;
	            previous.current.height = newHeight;

	            if (onResizeRef.current) {
	              onResizeRef.current(newSize);
	            } else {
	              if (!didUnmount.current) {
	                setSize(newSize);
	              }
	            }
	          }
	        })
	      };
	    }

	    resizeObserverRef.current.instance.observe(element, {
	      box: opts.box
	    });
	    return function () {
	      if (resizeObserverRef.current) {
	        resizeObserverRef.current.instance.unobserve(element);
	      }
	    };
	  }, [opts.box, round]), opts.ref);
	  return reactExports.useMemo(function () {
	    return {
	      ref: refCallback,
	      width: size.width,
	      height: size.height
	    };
	  }, [refCallback, size.width, size.height]);
	}

	const FlameChartComponent = (props) => {
	    const boxRef = reactExports.useRef(null);
	    const canvasRef = reactExports.useRef(null);
	    const flameChart = reactExports.useRef(null);
	    useResizeObserver({
	        ref: boxRef,
	        onResize: ({ width = 0, height = 0 }) => { var _a; return (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.resize(width, height - 3); },
	    });
	    const initialize = reactExports.useCallback(() => {
	        const { data, marks, waterfall, timeseries, settings, colors, plugins, timeframeTimeseries } = props;
	        if (canvasRef.current && boxRef.current) {
	            const { width = 0, height = 0 } = boxRef.current.getBoundingClientRect();
	            canvasRef.current.width = width;
	            canvasRef.current.height = height - 3;
	            flameChart.current = new FlameChart({
	                canvas: canvasRef.current,
	                data,
	                marks,
	                waterfall,
	                timeseries,
	                timeframeTimeseries,
	                settings,
	                colors,
	                plugins,
	            });
	        }
	    }, []);
	    const setBoxRef = reactExports.useCallback((ref) => {
	        const isNewRef = ref !== boxRef.current;
	        boxRef.current = ref;
	        if (isNewRef) {
	            initialize();
	        }
	    }, []);
	    const setCanvasRef = reactExports.useCallback((ref) => {
	        const isNewRef = ref !== canvasRef.current;
	        canvasRef.current = ref;
	        if (isNewRef) {
	            initialize();
	        }
	    }, []);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.data) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setNodes(props.data);
	        }
	    }, [props.data]);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.marks) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setMarks(props.marks);
	        }
	    }, [props.marks]);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.waterfall) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setWaterfall(props.waterfall);
	        }
	    }, [props.waterfall]);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.timeseries) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setTimeseries(props.timeseries);
	        }
	    }, [props.timeseries]);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.timeframeTimeseries) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setTimeframeTimeseries(props.timeframeTimeseries);
	        }
	    }, [props.timeframeTimeseries]);
	    reactExports.useEffect(() => {
	        if (props.settings && flameChart.current) {
	            flameChart.current.setSettings(props.settings);
	            flameChart.current.renderEngine.recalcChildrenSizes();
	            flameChart.current.render();
	        }
	    }, [props.settings]);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.position) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setFlameChartPosition(props.position);
	        }
	    }, [props.position]);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.zoom) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setZoom(props.zoom.start, props.zoom.end);
	        }
	    }, [props.zoom]);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.onSelect) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.on('select', props.onSelect);
	        }
	        return () => {
	            var _a;
	            if (props.onSelect) {
	                (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.removeListener('select', props.onSelect);
	            }
	        };
	    }, [props.onSelect]);
	    return (jsxRuntimeExports.jsx("div", { className: props.className, ref: setBoxRef, children: jsxRuntimeExports.jsx("canvas", { ref: setCanvasRef }) }));
	};

	var styles$1 = {"flameChart":"default-flame-chart-module_flameChart__rlqP7"};

	const DefaultFlameChart = ({ flameChartData, waterfallData, marksData, timeseriesData, timeframeTimeseriesData, stylesSettings, patternsSettings, onSelect, }) => {
	    const waterfall = reactExports.useMemo(() => ({
	        intervals: waterfallIntervals,
	        items: waterfallData,
	    }), [waterfallData]);
	    const settings = reactExports.useMemo(() => ({
	        styles: stylesSettings,
	        patterns: patternsSettings,
	    }), [stylesSettings, patternsSettings]);
	    return (jsxRuntimeExports.jsx(FlameChartComponent, { data: flameChartData, waterfall: waterfall, marks: marksData, timeseries: timeseriesData, timeframeTimeseries: timeframeTimeseriesData, settings: settings, className: styles$1.flameChart, onSelect: onSelect }));
	};

	const FlameChartContainerComponent = (props) => {
	    const boxRef = reactExports.useRef(null);
	    const canvasRef = reactExports.useRef(null);
	    const flameChart = reactExports.useRef(null);
	    useResizeObserver({
	        ref: boxRef,
	        onResize: ({ width = 0, height = 0 }) => { var _a; return (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.resize(width, height - 3); },
	    });
	    const initialize = reactExports.useCallback(() => {
	        const { settings, plugins } = props;
	        if (canvasRef.current && boxRef.current) {
	            const { width = 0, height = 0 } = boxRef.current.getBoundingClientRect();
	            canvasRef.current.width = width;
	            canvasRef.current.height = height - 3;
	            flameChart.current = new FlameChartContainer({
	                canvas: canvasRef.current,
	                settings,
	                plugins,
	            });
	        }
	    }, []);
	    const setBoxRef = reactExports.useCallback((ref) => {
	        const isNewRef = ref !== boxRef.current;
	        boxRef.current = ref;
	        if (isNewRef) {
	            initialize();
	        }
	    }, []);
	    const setCanvasRef = reactExports.useCallback((ref) => {
	        const isNewRef = ref !== canvasRef.current;
	        canvasRef.current = ref;
	        if (isNewRef) {
	            initialize();
	        }
	    }, []);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.settings) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setSettings(props.settings);
	        }
	    }, [props.settings]);
	    reactExports.useEffect(() => {
	        var _a;
	        if (props.zoom) {
	            (_a = flameChart.current) === null || _a === void 0 ? void 0 : _a.setZoom(props.zoom.start, props.zoom.end);
	        }
	    }, [props.zoom]);
	    return (jsxRuntimeExports.jsx("div", { className: props.className, ref: setBoxRef, children: jsxRuntimeExports.jsx("canvas", { ref: setCanvasRef }) }));
	};

	const CustomFlameChart = ({ flameChartData, stylesSettings }) => {
	    const plugins = reactExports.useMemo(() => {
	        return [
	            new TimeGridPlugin(),
	            new TogglePlugin('FlameChart 1'),
	            new FlameChartPlugin({
	                name: 'flameChart1',
	                data: flameChartData[0],
	            }),
	            new TogglePlugin('FlameChart 2'),
	            new FlameChartPlugin({
	                name: 'flameChart2',
	                data: flameChartData[1],
	            }),
	        ];
	    }, [flameChartData]);
	    const settings = reactExports.useMemo(() => ({
	        styles: stylesSettings,
	    }), [stylesSettings]);
	    return jsxRuntimeExports.jsx(FlameChartContainerComponent, { settings: settings, plugins: plugins, className: styles$1.flameChart });
	};

	var styles = {"root":"selected-data-module_root__OsbFL","type":"selected-data-module_type__dQB0H","json":"selected-data-module_json__p0HGK"};

	const SelectedData = ({ data }) => {
	    var _a, _b;
	    const preparedDataNode = (data === null || data === void 0 ? void 0 : data.type) === 'flame-chart-node'
	        ? {
	            ...data.node,
	            parent: undefined,
	            source: {
	                ...((_b = (_a = data.node) === null || _a === void 0 ? void 0 : _a.source) !== null && _b !== void 0 ? _b : {}),
	                parent: undefined,
	                children: undefined,
	            },
	        }
	        : data === null || data === void 0 ? void 0 : data.node;
	    return (jsxRuntimeExports.jsxs("div", { className: styles.root, children: [jsxRuntimeExports.jsxs("div", { className: styles.type, children: ["type: ", data === null || data === void 0 ? void 0 : data.type] }), jsxRuntimeExports.jsx("pre", { className: styles.json, children: JSON.stringify(preparedDataNode, null, 2) })] }));
	};

	const units = {
	    thinning: '%',
	    baseThinning: '%',
	};
	const WaterfallSettings = (props) => {
	    return (jsxRuntimeExports.jsx(RandomDataSettings, { onChange: props.onChange, config: waterfallConfigDefaults, units: units, isGenerating: props.isGenerating, children: "Generate random waterfall items" }));
	};

	const MarksSettings = (props) => {
	    return (jsxRuntimeExports.jsx(RandomDataSettings, { onChange: props.onChange, config: marksConfigDefaults, isGenerating: props.isGenerating, children: "Generate random marks items" }));
	};

	const TimeseriesSettings = (props) => {
	    return (jsxRuntimeExports.jsx(RandomDataSettings, { onChange: props.onChange, config: timeseriesConfigDefaults, isGenerating: props.isGenerating, children: "Generate random timeseries items" }));
	};

	var ChartType;
	(function (ChartType) {
	    ChartType["Default"] = "default";
	    ChartType["Custom"] = "custom";
	})(ChartType || (ChartType = {}));
	const flameChartVariants = [
	    {
	        value: ChartType.Default,
	        label: 'Default',
	    },
	    {
	        value: ChartType.Custom,
	        label: 'Custom',
	    },
	];
	const App = () => {
	    const [treeConfig, setTreeConfig] = reactExports.useState();
	    const [stylesSettings, setStylesSettings] = reactExports.useState({});
	    const [patternsSettings, setPatternsSettings] = reactExports.useState(defaultPatterns$1);
	    const [currentChart, setCurrentChart] = reactExports.useState(ChartType.Default);
	    const [isGenerating, setIsGenerating] = reactExports.useState(false);
	    const [flameChartData, setFlameChartData] = reactExports.useState(null);
	    const [customFlameChartData, setCustomFlameChartData] = reactExports.useState(null);
	    const [waterfallData, setWaterfallData] = reactExports.useState(null);
	    const [marksData, setMarksData] = reactExports.useState(null);
	    const [timeseriesData, setTimeseriesData] = reactExports.useState(null);
	    const [timeframeTimeseriesData, setTimeframeTimeseriesData] = reactExports.useState(null);
	    const [selectedData, setSelectedData] = reactExports.useState(null);
	    const generateTree = reactExports.useCallback((chart, config) => {
	        setIsGenerating(true);
	        setTreeConfig(config);
	        setTimeout(() => {
	            if (config) {
	                if (chart === ChartType.Default) {
	                    const data = generateRandomTree(config);
	                    setFlameChartData(data);
	                }
	                else if (chart === ChartType.Custom) {
	                    const data1 = generateRandomTree(config);
	                    const data2 = generateRandomTree(config);
	                    setCustomFlameChartData([data1, data2]);
	                }
	            }
	            setIsGenerating(false);
	        });
	    }, []);
	    const generateWaterfall = reactExports.useCallback((config) => {
	        setIsGenerating(true);
	        setTimeout(() => {
	            if (config) {
	                const data = generateRandomWaterfallItems(config);
	                setWaterfallData(data);
	            }
	            setIsGenerating(false);
	        });
	    }, []);
	    const generateMarks = reactExports.useCallback((config) => {
	        if (config) {
	            const data = generateRandomMarks(config);
	            setMarksData(data);
	        }
	    }, []);
	    const generateTimeseries = reactExports.useCallback((config) => {
	        if (config) {
	            const cpuConfig = {
	                ...config,
	                min: 0,
	                max: 50,
	            };
	            const memConfig = {
	                ...config,
	                min: 0,
	                max: 8096,
	            };
	            setTimeframeTimeseriesData([
	                {
	                    name: 'CPU Total',
	                    points: generateRandomTimeseries(cpuConfig),
	                    units: '%',
	                    min: 0,
	                    max: 100,
	                    style: {
	                        lineColor: 'rgba(239,36,255,0.2)',
	                        fillColor: 'rgba(239,36,255,0.2)',
	                    },
	                },
	            ]);
	            setTimeseriesData([
	                {
	                    name: 'CPU #1',
	                    group: 'CPU',
	                    points: generateRandomTimeseries(cpuConfig),
	                    units: '%',
	                    min: 0,
	                    max: 100,
	                    style: {
	                        lineColor: 'rgba(203,179,20,0.2)',
	                        fillColor: 'rgba(203,179,20,0.2)',
	                    },
	                },
	                {
	                    name: 'CPU #2',
	                    group: 'CPU',
	                    points: generateRandomTimeseries(cpuConfig),
	                    units: '%',
	                    min: 0,
	                    max: 100,
	                    style: {
	                        lineColor: 'rgba(203,179,20,0.2)',
	                        fillColor: 'rgba(203,179,20,0.2)',
	                    },
	                },
	                {
	                    name: 'Allocated',
	                    group: 'Memory',
	                    points: generateRandomTimeseries(memConfig),
	                    units: 'MB',
	                    min: 0,
	                    style: {
	                        type: 'bar',
	                        lineColor: 'rgba(60,122,255,0.2)',
	                        fillColor: 'rgba(60,122,255,0.2)',
	                    },
	                },
	                {
	                    name: 'Free',
	                    group: 'Memory',
	                    points: generateRandomTimeseries(memConfig),
	                    units: 'MB',
	                    min: 0,
	                    style: {
	                        type: 'bar',
	                        lineColor: 'rgba(107,223,243,0.2)',
	                        fillColor: 'rgba(107,223,243,0.2)',
	                    },
	                },
	            ]);
	        }
	    }, []);
	    const handleChartChange = reactExports.useCallback((value) => {
	        setCurrentChart(value);
	        generateTree(value, treeConfig);
	    }, [treeConfig, generateTree]);
	    return (jsxRuntimeExports.jsxs("div", { className: styles$9.root, children: [jsxRuntimeExports.jsxs("div", { className: styles$9.sidebar, children: [jsxRuntimeExports.jsxs("div", { className: styles$9.version, children: ["v", window.app.version] }), jsxRuntimeExports.jsx(Collapse, { title: 'Variants', children: jsxRuntimeExports.jsx(RadioGroup, { value: currentChart, options: flameChartVariants, onChange: handleChartChange }) }), jsxRuntimeExports.jsx(Collapse, { title: 'Flame chart data settings', isCollapsed: true, children: jsxRuntimeExports.jsx(TreeSettings, { onChange: (config) => generateTree(currentChart, config), isGenerating: isGenerating }) }), jsxRuntimeExports.jsx(Collapse, { title: 'Waterfall data settings', isCollapsed: true, children: jsxRuntimeExports.jsx(WaterfallSettings, { onChange: (config) => generateWaterfall(config), isGenerating: isGenerating }) }), jsxRuntimeExports.jsx(Collapse, { title: 'Marks data settings', isCollapsed: true, children: jsxRuntimeExports.jsx(MarksSettings, { onChange: (config) => generateMarks(config), isGenerating: isGenerating }) }), jsxRuntimeExports.jsx(Collapse, { title: 'Timeseries data settings', isCollapsed: true, children: jsxRuntimeExports.jsx(TimeseriesSettings, { onChange: (config) => generateTimeseries(config), isGenerating: isGenerating }) }), jsxRuntimeExports.jsx(Collapse, { title: 'Style settings', isCollapsed: true, children: jsxRuntimeExports.jsx(StylesSettings, { onChange: setStylesSettings }) }), jsxRuntimeExports.jsx(Collapse, { title: 'Patterns settings', isCollapsed: true, children: jsxRuntimeExports.jsx(PatternsSettings, { onChange: setPatternsSettings, value: patternsSettings }) }), (selectedData === null || selectedData === void 0 ? void 0 : selectedData.node) && (jsxRuntimeExports.jsx(Collapse, { title: 'Selected node', isCollapsed: true, children: jsxRuntimeExports.jsx(SelectedData, { data: selectedData }) }))] }), currentChart === 'default' &&
	                flameChartData &&
	                waterfallData &&
	                marksData &&
	                timeseriesData &&
	                timeframeTimeseriesData && (jsxRuntimeExports.jsx(DefaultFlameChart, { flameChartData: flameChartData, waterfallData: waterfallData, marksData: marksData, timeseriesData: timeseriesData, timeframeTimeseriesData: timeframeTimeseriesData, stylesSettings: stylesSettings, patternsSettings: patternsSettings, onSelect: setSelectedData })), currentChart === 'custom' && customFlameChartData && (jsxRuntimeExports.jsx(CustomFlameChart, { flameChartData: customFlameChartData, stylesSettings: stylesSettings }))] }));
	};

	const init = () => {
	    const rootElement = document.getElementById('root');
	    if (rootElement) {
	        const root = client.createRoot(rootElement);
	        root.render(jsxRuntimeExports.jsx(App, {}));
	    }
	};
	init();

})();