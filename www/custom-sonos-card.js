/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function t(t,e,i,s){var o,r=arguments.length,n=r<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(n=(r<3?o(n):r>3?o(e,i,n):o(e,i))||n);return r>3&&n&&Object.defineProperty(e,i,n),n
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}const e=window.ShadowRoot&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),s=new Map;class o{constructor(t,e){if(this._$cssResult$=!0,e!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){let t=s.get(this.cssText);return e&&void 0===t&&(s.set(this.cssText,t=new CSSStyleSheet),t.replaceSync(this.cssText)),t}toString(){return this.cssText}}const r=(t,...e)=>{const s=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1]),t[0]);return new o(s,i)},n=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",i))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */;var a;const l=window.trustedTypes,c=l?l.emptyScript:"",d=window.reactiveElementPolyfillSupport,h={toAttribute(t,e){switch(e){case Boolean:t=t?c:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},u=(t,e)=>e!==t&&(e==e||t==t),m={attribute:!0,type:String,converter:h,reflect:!1,hasChanged:u};class v extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(t){var e;null!==(e=this.l)&&void 0!==e||(this.l=[]),this.l.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Eh(i,e);void 0!==s&&(this._$Eu.set(s,i),t.push(s))})),t}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i="symbol"==typeof t?Symbol():"__"+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const o=this[t];this[e]=s,this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||m}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(n(t))}else void 0!==t&&e.push(n(t));return e}static _$Eh(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}o(){var t;this._$Ep=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Em(),this.requestUpdate(),null===(t=this.constructor.l)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$Eg)&&void 0!==e?e:this._$Eg=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$Eg)||void 0===e||e.splice(this._$Eg.indexOf(t)>>>0,1)}_$Em(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Et.set(e,this[e]),delete this[e])}))}createRenderRoot(){var t;const i=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{e?t.adoptedStyleSheets=i.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):i.forEach((e=>{const i=document.createElement("style"),s=window.litNonce;void 0!==s&&i.setAttribute("nonce",s),i.textContent=e.cssText,t.appendChild(i)}))})(i,this.constructor.elementStyles),i}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ES(t,e,i=m){var s,o;const r=this.constructor._$Eh(t,i);if(void 0!==r&&!0===i.reflect){const n=(null!==(o=null===(s=i.converter)||void 0===s?void 0:s.toAttribute)&&void 0!==o?o:h.toAttribute)(e,i.type);this._$Ei=t,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Ei=null}}_$AK(t,e){var i,s,o;const r=this.constructor,n=r._$Eu.get(t);if(void 0!==n&&this._$Ei!==n){const t=r.getPropertyOptions(n),a=t.converter,l=null!==(o=null!==(s=null===(i=a)||void 0===i?void 0:i.fromAttribute)&&void 0!==s?s:"function"==typeof a?a:null)&&void 0!==o?o:h.fromAttribute;this._$Ei=n,this[n]=l(e,t.type),this._$Ei=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||u)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$Ei!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$Ep=this._$E_())}async _$E_(){this.isUpdatePending=!0;try{await this._$Ep}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach(((t,e)=>this[e]=t)),this._$Et=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$Eg)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$Eg)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$ES(e,this[e],t))),this._$EC=void 0),this._$EU()}updated(t){}firstUpdated(t){}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var p;v.finalized=!0,v.elementProperties=new Map,v.elementStyles=[],v.shadowRootOptions={mode:"open"},null==d||d({ReactiveElement:v}),(null!==(a=globalThis.reactiveElementVersions)&&void 0!==a?a:globalThis.reactiveElementVersions=[]).push("1.3.0");const y=globalThis.trustedTypes,g=y?y.createPolicy("lit-html",{createHTML:t=>t}):void 0,f=`lit$${(Math.random()+"").slice(9)}$`,b="?"+f,$=`<${b}>`,S=document,_=(t="")=>S.createComment(t),w=t=>null===t||"object"!=typeof t&&"function"!=typeof t,A=Array.isArray,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,x=/-->/g,k=/>/g,P=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,E=/'/g,M=/"/g,O=/^(?:script|style|textarea|title)$/i,T=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),I=Symbol.for("lit-noChange"),R=Symbol.for("lit-nothing"),j=new WeakMap,D=S.createTreeWalker(S,129,null,!1),U=(t,e)=>{const i=t.length-1,s=[];let o,r=2===e?"<svg>":"",n=C;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===C?"!--"===l[1]?n=x:void 0!==l[1]?n=k:void 0!==l[2]?(O.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=P):void 0!==l[3]&&(n=P):n===P?">"===l[0]?(n=null!=o?o:C,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?P:'"'===l[3]?M:E):n===M||n===E?n=P:n===x||n===k?n=C:(n=P,o=void 0);const h=n===P&&t[e+1].startsWith("/>")?" ":"";r+=n===C?i+$:c>=0?(s.push(a),i.slice(0,c)+"$lit$"+i.slice(c)+f+h):i+f+(-2===c?(s.push(void 0),e):h)}const a=r+(t[i]||"<?>")+(2===e?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return[void 0!==g?g.createHTML(a):a,s]};class N{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,r=0;const n=t.length-1,a=this.parts,[l,c]=U(t,e);if(this.el=N.createElement(l,i),D.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=D.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith("$lit$")||e.startsWith(f)){const i=c[r++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+"$lit$").split(f),e=/([.?@])?(.*)/.exec(i);a.push({type:1,index:o,name:e[2],strings:t,ctor:"."===e[1]?L:"?"===e[1]?G:"@"===e[1]?F:V})}else a.push({type:6,index:o})}for(const e of t)s.removeAttribute(e)}if(O.test(s.tagName)){const t=s.textContent.split(f),e=t.length-1;if(e>0){s.textContent=y?y.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],_()),D.nextNode(),a.push({type:2,index:++o});s.append(t[e],_())}}}else if(8===s.nodeType)if(s.data===b)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(f,t+1));)a.push({type:7,index:o}),t+=f.length-1}o++}}static createElement(t,e){const i=S.createElement("template");return i.innerHTML=t,i}}function B(t,e,i=t,s){var o,r,n,a;if(e===I)return e;let l=void 0!==s?null===(o=i._$Cl)||void 0===o?void 0:o[s]:i._$Cu;const c=w(e)?void 0:e._$litDirective$;return(null==l?void 0:l.constructor)!==c&&(null===(r=null==l?void 0:l._$AO)||void 0===r||r.call(l,!1),void 0===c?l=void 0:(l=new c(t),l._$AT(t,i,s)),void 0!==s?(null!==(n=(a=i)._$Cl)&&void 0!==n?n:a._$Cl=[])[s]=l:i._$Cu=l),void 0!==l&&(e=B(t,l._$AS(t,e.values),l,s)),e}class z{constructor(t,e){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var e;const{el:{content:i},parts:s}=this._$AD,o=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:S).importNode(i,!0);D.currentNode=o;let r=D.nextNode(),n=0,a=0,l=s[0];for(;void 0!==l;){if(n===l.index){let e;2===l.type?e=new H(r,r.nextSibling,this,t):1===l.type?e=new l.ctor(r,l.name,l.strings,this,t):6===l.type&&(e=new q(r,this,t)),this.v.push(e),l=s[++a]}n!==(null==l?void 0:l.index)&&(r=D.nextNode(),n++)}return o}m(t){let e=0;for(const i of this.v)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class H{constructor(t,e,i,s){var o;this.type=2,this._$AH=R,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cg=null===(o=null==s?void 0:s.isConnected)||void 0===o||o}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$Cg}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=B(this,t,e),w(t)?t===R||null==t||""===t?(this._$AH!==R&&this._$AR(),this._$AH=R):t!==this._$AH&&t!==I&&this.$(t):void 0!==t._$litType$?this.T(t):void 0!==t.nodeType?this.k(t):(t=>{var e;return A(t)||"function"==typeof(null===(e=t)||void 0===e?void 0:e[Symbol.iterator])})(t)?this.S(t):this.$(t)}A(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}k(t){this._$AH!==t&&(this._$AR(),this._$AH=this.A(t))}$(t){this._$AH!==R&&w(this._$AH)?this._$AA.nextSibling.data=t:this.k(S.createTextNode(t)),this._$AH=t}T(t){var e;const{values:i,_$litType$:s}=t,o="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(s.h,this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===o)this._$AH.m(i);else{const t=new z(o,this),e=t.p(this.options);t.m(i),this.k(e),this._$AH=t}}_$AC(t){let e=j.get(t.strings);return void 0===e&&j.set(t.strings,e=new N(t)),e}S(t){A(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new H(this.A(_()),this.A(_()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$Cg=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class V{constructor(t,e,i,s,o){this.type=1,this._$AH=R,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=R}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const o=this.strings;let r=!1;if(void 0===o)t=B(this,t,e,0),r=!w(t)||t!==this._$AH&&t!==I,r&&(this._$AH=t);else{const s=t;let n,a;for(t=o[0],n=0;n<o.length-1;n++)a=B(this,s[i+n],e,n),a===I&&(a=this._$AH[n]),r||(r=!w(a)||a!==this._$AH[n]),a===R?t=R:t!==R&&(t+=(null!=a?a:"")+o[n+1]),this._$AH[n]=a}r&&!s&&this.C(t)}C(t){t===R?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"")}}class L extends V{constructor(){super(...arguments),this.type=3}C(t){this.element[this.name]=t===R?void 0:t}}const W=y?y.emptyScript:"";class G extends V{constructor(){super(...arguments),this.type=4}C(t){t&&t!==R?this.element.setAttribute(this.name,W):this.element.removeAttribute(this.name)}}class F extends V{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=B(this,t,e,0))&&void 0!==i?i:R)===I)return;const s=this._$AH,o=t===R&&s!==R||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==R&&(s===R||o);o&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class q{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){B(this,t)}}const J=window.litHtmlPolyfillSupport;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var K,Y;null==J||J(N,H),(null!==(p=globalThis.litHtmlVersions)&&void 0!==p?p:globalThis.litHtmlVersions=[]).push("2.2.0");class Z extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=((t,e,i)=>{var s,o;const r=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let n=r._$litPart$;if(void 0===n){const t=null!==(o=null==i?void 0:i.renderBefore)&&void 0!==o?o:null;r._$litPart$=n=new H(e.insertBefore(_(),t),t,void 0,null!=i?i:{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Dt)||void 0===t||t.setConnected(!1)}render(){return I}}Z.finalized=!0,Z._$litElement$=!0,null===(K=globalThis.litElementHydrateSupport)||void 0===K||K.call(globalThis,{LitElement:Z});const Q=globalThis.litElementPolyfillSupport;null==Q||Q({LitElement:Z}),(null!==(Y=globalThis.litElementVersions)&&void 0!==Y?Y:globalThis.litElementVersions=[]).push("3.2.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(i){i.createProperty(e.key,t)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function tt(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):X(t,e)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function et(t){return tt({...t,state:!0})}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var it,st;function ot(t,e,i){const s=t.states[i].attributes.friendly_name||"";if(e.entityNameRegex){const t=e.entityNameRegex.split("/").filter((t=>t));if(2===t.length){const[e,i]=t;return s.replace(new RegExp(e,"g"),i)}}else if(e.entityNameRegexToReplace)return s.replace(new RegExp(e.entityNameRegexToReplace,"g"),e.entityNameReplacement||"");return s}function rt(t){return t.attributes.sonos_group||t.attributes.group_members}function nt(t,e,i){const s=t.filter((i=>function(t,e,i){const s=t.states[e];try{const t=rt(s).filter((t=>i.indexOf(t)>-1)),o=(null==t?void 0:t.length)>1,r=o&&t&&t[0]===e;return!o||r}catch(t){return console.error("Failed to determine group master",JSON.stringify(s),t),!1}}(e,i,t))),o=s.map((s=>function(t,e,i,s){const o=t.states[e];try{const r=rt(o).filter((t=>t!==e&&i.indexOf(t)>-1));return{entity:e,state:o.state,roomName:ot(t,s,e),members:at(r,t,s)}}catch(t){return console.error("Failed to create group",JSON.stringify(o),t),{}}}(e,s,t,i)));return Object.fromEntries(o.map((t=>[t.entity,t])))}function at(t,e,i){return Object.fromEntries(t.map((t=>[t,ot(e,i,t)])))}function lt(t,e,i,s){return ct(t)?(null==s?void 0:s.mobileWidth)||i:(null==s?void 0:s.width)||e}function ct(t){var e;return innerWidth<((null===(e=t.layout)||void 0===e?void 0:e.mobileThresholdPx)||650)}null===(it=window.HTMLSlotElement)||void 0===it||it.prototype.assignedElements,function(t){t.MEDIA_BROWSER="media browser",t.GROUPS="groups",t.PLAYER="player",t.GROUPING="grouping"}(st||(st={}));
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dt=1,ht=2,ut=t=>(...e)=>({_$litDirective$:t,values:e});class mt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const vt=(t,e)=>{var i,s;const o=t._$AN;if(void 0===o)return!1;for(const t of o)null===(s=(i=t)._$AO)||void 0===s||s.call(i,e,!1),vt(t,e);return!0},pt=t=>{let e,i;do{if(void 0===(e=t._$AM))break;i=e._$AN,i.delete(t),t=e}while(0===(null==i?void 0:i.size))},yt=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(void 0===i)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),bt(e)}};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function gt(t){void 0!==this._$AN?(pt(this),this._$AM=t,yt(this)):this._$AM=t}function ft(t,e=!1,i=0){const s=this._$AH,o=this._$AN;if(void 0!==o&&0!==o.size)if(e)if(Array.isArray(s))for(let t=i;t<s.length;t++)vt(s[t],!1),pt(s[t]);else null!=s&&(vt(s,!1),pt(s));else vt(this,t)}const bt=t=>{var e,i,s,o;t.type==ht&&(null!==(e=(s=t)._$AP)&&void 0!==e||(s._$AP=ft),null!==(i=(o=t)._$AQ)&&void 0!==i||(o._$AQ=gt))};class $t extends mt{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,e,i){super._$AT(t,e,i),yt(this),this.isConnected=t._$AU}_$AO(t,e=!0){var i,s;t!==this.isConnected&&(this.isConnected=t,t?null===(i=this.reconnected)||void 0===i||i.call(this):null===(s=this.disconnected)||void 0===s||s.call(this)),e&&(vt(this,t),pt(this))}setValue(t){if((t=>void 0===t.strings)(this._$Ct))this._$Ct._$AI(t,this);else{const e=[...this._$Ct._$AH];e[this._$Ci]=t,this._$Ct._$AI(e,this,0)}}disconnected(){}reconnected(){}}
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class St{constructor(t){this.U=t}disconnect(){this.U=void 0}reconnect(t){this.U=t}deref(){return this.U}}class _t{constructor(){this.Y=void 0,this.q=void 0}get(){return this.Y}pause(){var t;null!==(t=this.Y)&&void 0!==t||(this.Y=new Promise((t=>this.q=t)))}resume(){var t;null===(t=this.q)||void 0===t||t.call(this),this.Y=this.q=void 0}}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const wt=t=>!(t=>null===t||"object"!=typeof t&&"function"!=typeof t)(t)&&"function"==typeof t.then;const At=ut(class extends $t{constructor(){super(...arguments),this._$Cwt=1073741823,this._$Cyt=[],this._$CG=new St(this),this._$CK=new _t}render(...t){var e;return null!==(e=t.find((t=>!wt(t))))&&void 0!==e?e:I}update(t,e){const i=this._$Cyt;let s=i.length;this._$Cyt=e;const o=this._$CG,r=this._$CK;this.isConnected||this.disconnected();for(let t=0;t<e.length&&!(t>this._$Cwt);t++){const n=e[t];if(!wt(n))return this._$Cwt=t,n;t<s&&n===i[t]||(this._$Cwt=1073741823,s=0,Promise.resolve(n).then((async t=>{for(;r.get();)await r.get();const e=o.deref();if(void 0!==e){const i=e._$Cyt.indexOf(n);i>-1&&i<e._$Cwt&&(e._$Cwt=i,e.setValue(t))}})))}return I}disconnected(){this._$CG.disconnect(),this._$CK.pause()}reconnected(){this._$CG.reconnect(this),this._$CK.resume()}});
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Ct(t,e,i){return t?e():null==i?void 0:i()}class xt extends Z{render(){if(this.hass=this.main.hass,this.entityId=this.main.activePlayer,this.config=this.main.config,this.mediaControlService=this.main.mediaControlService,this.hassService=this.main.hassService,!this.config.singleSectionMode||this.config.singleSectionMode===st.PLAYER){const t=this.getEntityAttributes(),e=rt(this.hass.states[this.entityId]).length>1;let i=[];return e&&(i=rt(this.hass.states[this.entityId]).map((t=>this.getVolumeTemplate(t,ot(this.hass,this.config,t),e,!0)))),T`
        <div style="${this.containerStyle(this.hass.states[this.entityId])}">
          <div style="${this.bodyStyle()}">
            ${Ct(!this.main.showVolumes,(()=>t.media_title?T`
                    <div style="${this.infoStyle()}">
                      <div style="${this.artistAlbumStyle()}">${t.media_album_name}</div>
                      <div style="${this.songStyle()}">${t.media_title}</div>
                      <div style="${this.artistAlbumStyle()}">${t.media_artist}</div>
                    </div>
                  `:T` <div style="${this.noMediaTextStyle()}">
                    ${this.config.noMediaText?this.config.noMediaText:"🎺 What do you want to play? 🥁"}
                  </div>`))}
            <div style="${this.footerStyle()}" id="footer">
              <div ?hidden="${!this.main.showVolumes}">${i}</div>
              ${this.getVolumeTemplate(this.entityId,this.main.showVolumes?this.config.allVolumesText?this.config.allVolumesText:"All":"",e,!1,this.members)}
              <div style="${this.iconsStyle()}">
                ${this.clickableIcon("mdi:volume-minus",(async()=>await this.volumeDownClicked()))}
                ${this.clickableIcon("mdi:skip-backward",(async()=>await this.mediaControlService.prev(this.entityId)))}
                ${"playing"!==this.hass.states[this.entityId].state?this.clickableIcon("mdi:play",(async()=>await this.mediaControlService.play(this.entityId))):this.clickableIcon("mdi:stop",(async()=>await this.mediaControlService.pause(this.entityId)))}
                ${this.clickableIcon("mdi:skip-forward",(async()=>await this.mediaControlService.next(this.entityId)))}
                ${this.clickableIcon(this.shuffleIcon(),(async()=>await this.shuffleClicked()))}
                ${this.clickableIcon(this.repeatIcon(),(async()=>await this.repeatClicked()))}
                ${At(this.getAdditionalSwitches())}
                ${this.clickableIcon(this.allVolumesIcon(),(()=>this.toggleShowAllVolumes()),!e)}
                ${this.clickableIcon("mdi:volume-plus",(async()=>await this.volumeUp()))}
              </div>
            </div>
          </div>
        </div>
      `}return T``}async volumeDownClicked(){await this.mediaControlService.volumeDown(this.entityId,this.members)}allVolumesIcon(){return this.main.showVolumes?"mdi:arrow-collapse-vertical":"mdi:arrow-expand-vertical"}shuffleIcon(){return this.getEntityAttributes().shuffle?"mdi:shuffle-variant":"mdi:shuffle-disabled"}async shuffleClicked(){await this.mediaControlService.shuffle(this.entityId,!this.getEntityAttributes().shuffle)}async repeatClicked(){await this.mediaControlService.repeat(this.entityId,this.getEntityAttributes().repeat)}repeatIcon(){const t=this.hass.states[this.entityId];return"all"===t.attributes.repeat?"mdi:repeat":"one"===t.attributes.repeat?"mdi:repeat-once":"mdi:repeat-off"}async volumeUp(){await this.mediaControlService.volumeUp(this.entityId,this.members)}clickableIcon(t,e,i=!1,s){return T`
      <ha-icon
        @click="${e}"
        style="${this.iconStyle(s)}"
        class="hoverable"
        .icon=${t}
        ?hidden="${i}"
      ></ha-icon>
    `}getEntityAttributes(){return this.hass.states[this.entityId].attributes}getVolumeTemplate(t,e,i,s,o){const r=100*this.hass.states[t].attributes.volume_level;let n=100,a="rgb(211, 3, 32)";r<20&&(this.config.disableDynamicVolumeSlider||(n=30),a="rgb(72,187,14)");const l=o&&Object.keys(o).length?!Object.keys(o).some((t=>!this.hass.states[t].attributes.is_volume_muted)):this.hass.states[t].attributes.is_volume_muted;return T`
      <div style="${this.volumeStyle(s)}">
        ${e?T` <div style="${this.volumeNameStyle()}">${e}</div>`:""}
        <ha-icon
          style="${this.muteStyle()}"
          @click="${async()=>await this.mediaControlService.volumeMute(t,!l,o)}"
          .icon=${l?"mdi:volume-mute":"mdi:volume-high"}
        ></ha-icon>
        <div style="${this.volumeSliderStyle()}">
          <div style="${this.volumeLevelStyle()}">
            <div style="flex: ${r}">0%</div>
            ${r>0&&r<95?T` <div style="flex: 2; font-weight: bold; font-size: 12px;">${Math.round(r)}%</div>`:""}
            <div style="flex: ${n-r};text-align: right">${n}%</div>
          </div>
          <input
            type="range"
            .value="${r}"
            @change="${async e=>{var i;return await this.mediaControlService.volumeSet(t,null===(i=null==e?void 0:e.target)||void 0===i?void 0:i.value,o)}}"
            @click="${t=>{var e;return this.volumeClicked(r,Number.parseInt(null===(e=null==t?void 0:t.target)||void 0===e?void 0:e.value),i)}}"
            min="0"
            max="${n}"
            style="${this.volumeRangeStyle(a,r,n)}"
          />
        </div>
      </div>
    `}getAdditionalSwitches(){return this.config.skipAdditionalPlayerSwitches?"":this.hassService.getRelatedSwitchEntities(this.entityId).then((t=>t.map((t=>this.clickableIcon(this.hass.states[t].attributes.icon||"",(()=>this.hassService.toggle(t)),!1,"on"===this.hass.states[t].state?{color:"var(--sonos-int-accent-color)"}:{})))))}volumeClicked(t,e,i){i&&t===e&&this.toggleShowAllVolumes()}toggleShowAllVolumes(){this.main.showVolumes=!this.main.showVolumes,clearTimeout(this.timerToggleShowAllVolumes),this.main.showVolumes&&(this.scrollToBottomOfFooter(),this.timerToggleShowAllVolumes=window.setTimeout((()=>{this.main.showVolumes=!1,window.scrollTo(0,0)}),3e4))}scrollToBottomOfFooter(){setTimeout((()=>{var t;const e=null===(t=this.renderRoot)||void 0===t?void 0:t.querySelector("#footer");e&&(e.scrollTop=e.scrollHeight)}))}containerStyle(t){const e=t.attributes.entity_picture,i=t.attributes.media_title,s=t.attributes.media_content_id;let o={backgroundPosition:"center",backgroundRepeat:"no-repeat",backgroundSize:"cover",backgroundImage:e?`url(${e})`:""};const r=this.config.mediaArtworkOverrides;if(r){const t=r.find((t=>!e&&t.ifMissing||i===t.mediaTitleEquals||s===t.mediaContentIdEquals));t&&(o=Object.assign(Object.assign({},o),{backgroundImage:t.imageUrl?`url(${t.imageUrl})`:o.backgroundImage,backgroundSize:t.sizePercentage?`${t.sizePercentage}%`:o.backgroundSize}))}return this.main.stylable("player-container",Object.assign({marginTop:"1rem",position:"relative",background:"var(--sonos-int-background-color)",borderRadius:"var(--sonos-int-border-radius)",paddingBottom:"100%",border:"var(--sonos-int-border-width) solid var(--sonos-int-color)"},o))}bodyStyle(){return this.main.stylable("player-body",{position:"absolute",inset:"0px",display:"flex",flexDirection:"column",justifyContent:this.main.showVolumes?"flex-end":"space-between"})}footerStyle(){return this.main.stylable("player-footer",{background:"var(--sonos-int-player-section-background)",margin:"0.25rem",padding:"0.5rem",borderRadius:"var(--sonos-int-border-radius)",overflow:"hidden auto"})}iconsStyle(){return this.main.stylable("player-footer-icons",{justifyContent:"space-between",display:"flex"})}iconStyle(t){return this.main.stylable("player-footer-icon",Object.assign({padding:"0.3rem","--mdc-icon-size":"min(100%, 1.25rem)"},t))}volumeRangeStyle(t,e,i){return this.main.stylable("player-volume-range",{"-webkit-appearance":"none",height:"0.25rem",borderRadius:"var(--sonos-int-border-radius)",outline:"none",opacity:"0.7","-webkit-transition":"0.2s",transition:"opacity 0.2s",margin:"0.25rem 0.25rem 0 0.25rem",width:"97%",background:`linear-gradient(to right, ${t} 0%, ${t} ${100*e/i}%, rgb(211, 211, 211) ${100*e/i}%, rgb(211, 211, 211) 100%)`})}infoStyle(){return this.main.stylable("player-info",{margin:"0.25rem",padding:"0.5rem",textAlign:"center",background:"var(--sonos-int-player-section-background)",borderRadius:"var(--sonos-int-border-radius)"})}artistAlbumStyle(){return this.main.stylable("player-artist-album",{overflow:"hidden",textOverflow:"ellipsis",fontSize:"0.75rem",fontWeight:"300",color:"var(--sonos-int-artist-album-text-color)",whiteSpace:"wrap"})}songStyle(){return this.main.stylable("player-song",{overflow:"hidden",textOverflow:"ellipsis",fontSize:"1.15rem",fontWeight:"400",color:"var(--sonos-int-song-text-color)",whiteSpace:"wrap"})}noMediaTextStyle(){return this.main.stylable("no-media-text",{flexGrow:"1",display:"flex",justifyContent:"center",alignItems:"center"})}volumeStyle(t){return this.main.stylable("player-volume",Object.assign({display:"flex"},t&&{borderTop:"dotted var(--sonos-int-color)",marginTop:"0.4rem"}))}volumeNameStyle(){return this.main.stylable("player-volume-name",{marginTop:"1rem",marginLeft:"0.4rem",flex:"1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"})}volumeSliderStyle(){return this.main.stylable("player-volume-slider",{flex:"4"})}volumeLevelStyle(){return this.main.stylable("player-volume-level",{fontSize:"x-small",margin:"0 0.4rem",display:"flex"})}muteStyle(){return this.main.stylable("player-mute",{"--mdc-icon-size":"1.25rem",alignSelf:"center"})}static get styles(){return r`
      .hoverable:focus,
      .hoverable:hover {
        color: var(--sonos-int-accent-color);
      }
    `}}t([tt()],xt.prototype,"main",void 0),t([tt()],xt.prototype,"members",void 0),t([et()],xt.prototype,"timerToggleShowAllVolumes",void 0),customElements.define("sonos-player",xt);const kt={margin:"0.5rem 0",textAlign:"center",fontWeight:"bold",fontSize:"larger",color:"var(--sonos-int-title-color)"},Pt=ut(class extends mt{constructor(t){var e;if(super(t),t.type!==dt||"style"!==t.name||(null===(e=t.strings)||void 0===e?void 0:e.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,i)=>{const s=t[i];return null==s?e:e+`${i=i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`}),"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ct){this.ct=new Set;for(const t in e)this.ct.add(t);return this.render(e)}this.ct.forEach((t=>{null==e[t]&&(this.ct.delete(t),t.includes("-")?i.removeProperty(t):i[t]="")}));for(const t in e){const s=e[t];null!=s&&(this.ct.add(t),t.includes("-")?i.setProperty(t,s):i[t]=s)}return I}});
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Et extends Z{render(){const t=this.main.config,e=this.main.hass.states[this.group.entity],i=`${e.attributes.media_artist||""} - ${e.attributes.media_title||""}`.replace(/^ - /g,""),s=rt(e).map((e=>ot(this.main.hass,t,e))).join(" + ");return T`
      <div @click="${()=>this.handleGroupClicked()}" style="${this.groupStyle()}">
        <ul style="${this.speakersStyle()}">
          <span style="${this.speakerStyle()}">${s}</span>
        </ul>
        <div style="${this.infoStyle()}">
          ${i?T` <div style="flex: 1"><span style="${this.currentTrackStyle()}">${i}</span></div>
                ${Ct("playing"===e.state,(()=>T`
                    <div style="width: 0.55rem; position: relative;">
                      <div style="${Et.barStyle(1)}"></div>
                      <div style="${Et.barStyle(2)}"></div>
                      <div style="${Et.barStyle(3)}"></div>
                    </div>
                  `))}`:""}
        </div>
      </div>
    `}groupStyle(){const t=Object.assign({borderRadius:"var(--sonos-int-border-radius)",margin:"0.5rem 0",padding:"0.8rem",border:"var(--sonos-int-border-width) solid var(--sonos-int-color)",backgroundColor:"var(--sonos-int-background-color)"},this.activePlayer===this.group.entity&&{border:"var(--sonos-int-border-width) solid var(--sonos-int-accent-color)",color:"var(--sonos-int-accent-color)",fontWeight:"bold"});return this.main.stylable("group",t)}speakersStyle(){return this.main.stylable("group-speakers",{margin:"0",padding:"0"})}speakerStyle(){return this.main.stylable("group-speaker",{marginRight:"0.3rem",fontSize:"1rem",maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis"})}infoStyle(){return this.main.stylable("group-info",{display:"flex",flexDirection:"row",clear:"both"})}currentTrackStyle(){return Pt({display:this.main.config.hideGroupCurrentTrack?"none":"inline",fontSize:"0.8rem"})}static barStyle(t){return Pt({background:"var(--sonos-int-color)",bottom:"0.05rem",height:"0.15rem",position:"absolute",width:"0.15rem",animation:"sound 0ms -800ms linear infinite alternate",display:"block",left:1==t?"0.05rem":2==t?"0.25rem":"0.45rem",animationDuration:1==t?"474ms":2==t?"433ms":"407ms"})}handleGroupClicked(){this.main.setActivePlayer(this.group.entity),this.main.showVolumes=!1}static get styles(){return r`
      @keyframes sound {
        0% {
          opacity: 0.35;
          height: 0.15rem;
        }
        100% {
          opacity: 1;
          height: 1rem;
        }
      }
    `}}t([tt()],Et.prototype,"main",void 0),t([tt()],Et.prototype,"activePlayer",void 0),t([tt()],Et.prototype,"group",void 0),customElements.define("sonos-group",Et);class Mt extends Z{render(){const t=this.main.config;return t.singleSectionMode&&t.singleSectionMode!==st.GROUPS?T``:T`
        <div style="${this.main.buttonSectionStyle()}">
          <div style="${this.main.stylable("title",kt)}">
            ${t.groupsTitle?t.groupsTitle:"Groups"}
          </div>
          ${Object.values(this.groups).map((t=>T`
                <sonos-group .main=${this.main} .group=${t} .activePlayer="${this.activePlayer}"></sonos-group>
              `))}
        </div>
      `}}t([tt()],Mt.prototype,"main",void 0),t([tt()],Mt.prototype,"activePlayer",void 0),t([tt()],Mt.prototype,"groups",void 0),t([tt()],Mt.prototype,"mediaPlayers",void 0),customElements.define("sonos-groups",Mt);class Ot extends Z{render(){this.config=this.main.config;const t=this.main.activePlayer,e=this.mediaPlayers.filter((e=>e!==t&&this.groups[t].members[e])),i=this.mediaPlayers.filter((e=>e!==t&&!this.groups[t].members[e]));return T`
      <div style="${this.membersStyle()}">
        ${t&&this.mediaPlayers.map((i=>this.renderMediaPlayerGroupButton(i,t,e)))}
        ${Ct(i.length,(()=>this.getButton((async()=>await this.main.mediaControlService.join(t,i)),"mdi:checkbox-multiple-marked-outline")))}
        ${Ct(e.length,(()=>this.getButton((async()=>await this.main.mediaControlService.unjoin(e)),"mdi:minus-box-multiple-outline")))}
      </div>
      ${Ct(this.config.predefinedGroups,(()=>this.renderPredefinedGroup()))}
    `}renderMediaPlayerGroupButton(t,e,i){const s=ot(this.main.hass,this.config,t);return this.groups[e].members[t]||t===e&&i.length>0?this.getButton((async()=>await this.main.mediaControlService.unjoin([t])),"mdi:minus",s):t!==e?this.getButton((async()=>await this.main.mediaControlService.join(e,[t])),"mdi:plus",s):T``}renderPredefinedGroup(){var t;return T`
      <div style="${this.main.stylable("title",kt)}">
        ${this.config.predefinedGroupsTitle?this.config.predefinedGroupsTitle:"Predefined groups"}
      </div>
      <div style="${this.membersStyle()}">
        ${null===(t=this.config.predefinedGroups)||void 0===t?void 0:t.filter((t=>t.entities.length>1)).map((t=>this.getButton((async()=>{await this.main.mediaControlService.unjoin(t.entities),await this.main.mediaControlService.join(t.entities[0],t.entities)}),"",t.name)))}
      </div>
    `}getButton(t,e,i){return T`
      <div @click="${t}" style="${this.memberStyle()}" class="hoverable">
        ${i?T`<span style="${Ot.nameStyle()}">${i}</span>`:""}
        <ha-icon .icon=${e} style="${Ot.iconStyle()}"></ha-icon>
      </div>
    `}membersStyle(){return this.main.stylable("members",{padding:"0",margin:"0",display:"flex",flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between"})}memberStyle(){return this.main.stylable("member",{flexGrow:"1",borderRadius:"var(--sonos-int-border-radius)",margin:"0 0.25rem 0.5rem",padding:"0.45rem",display:"flex",justifyContent:"center",border:"var(--sonos-int-border-width) solid var(--sonos-int-color)",backgroundColor:"var(--sonos-int-background-color)",maxWidth:"calc(100% - 1.4rem)"})}static nameStyle(){return Pt({alignSelf:"center",fontSize:"1rem",overflow:"hidden",textOverflow:"ellipsis"})}static iconStyle(){return Pt({alignSelf:"center",fontSize:"0.5rem"})}static get styles(){return r`
      .hoverable:hover,
      .hoverable:focus {
        color: var(--sonos-int-accent-color);
        border: var(--sonos-int-border-width) solid var(--sonos-int-accent-color);
      }
    `}}t([tt()],Ot.prototype,"main",void 0),t([tt()],Ot.prototype,"groups",void 0),t([tt()],Ot.prototype,"mediaPlayers",void 0),customElements.define("sonos-grouping-buttons",Ot);class Tt extends Z{render(){const t=this.main.config;return t.singleSectionMode&&t.singleSectionMode!==st.GROUPING?T``:T`
        <div style="${this.main.buttonSectionStyle()}">
          <div style="${this.main.stylable("title",kt)}">
            ${t.groupingTitle?t.groupingTitle:"Grouping"}
          </div>
          <sonos-grouping-buttons
            .main=${this.main}
            .groups=${this.groups}
            .mediaPlayers=${this.mediaPlayers}
          ></sonos-grouping-buttons>
        </div>
      `}}t([tt()],Tt.prototype,"main",void 0),t([tt()],Tt.prototype,"groups",void 0),t([tt()],Tt.prototype,"mediaPlayers",void 0),customElements.define("sonos-grouping",Tt);class It extends Z{render(){const t=this.getThumbnail();return T`
      <div style="${this.wrapperStyle()}">
        <div style="${this.mediaButtonStyle(t)}" class="hoverable">
          <div style="${this.titleStyle(t)}">${this.mediaItem.title}</div>
          <ha-icon style="${this.folderStyle(t)}" .icon=${"mdi:folder-music"}></ha-icon>
        </div>
      </div>
    `}getThumbnail(){var t;let e=this.mediaItem.thumbnail;return e?(null==e?void 0:e.match(/https:\/\/brands.home-assistant.io\/.+\/logo.png/))&&(e=null==e?void 0:e.replace("logo.png","icon.png")):e=(null===(t=this.config.customThumbnailIfMissing)||void 0===t?void 0:t[this.mediaItem.title])||"",e}wrapperStyle(){return this.main.stylable("media-button-wrapper",{padding:"0 0.3rem 0.6rem 0.3rem"})}mediaButtonStyle(t){return this.main.stylable("media-button",Object.assign(Object.assign({boxSizing:"border-box","-moz-box-sizing":"border-box","-webkit-box-sizing":"border-box",overflow:"hidden",border:"var(--sonos-int-border-width) solid var(--sonos-int-color)",display:"flex",flexDirection:"column",borderRadius:"var(--sonos-int-border-radius)",justifyContent:"center",backgroundColor:"var(--sonos-int-background-color)"},(t||this.mediaItem.can_expand)&&{backgroundSize:"contain",backgroundRepeat:"no-repeat",backgroundPosition:"center",position:"relative",paddingBottom:"calc(100% - (var(--sonos-int-border-width) * 2))"}),t&&{backgroundImage:"url("+t+")"}))}titleStyle(t){return this.main.stylable("media-button-title",Object.assign({width:"calc(100% - 1rem)",fontSize:"1rem",padding:"0px 0.5rem"},(t||this.mediaItem.can_expand)&&{zIndex:"1",textOverflow:"ellipsis",overflow:"hidden",whiteSpace:"var(--sonos-int-media-button-white-space)",backgroundColor:"var(--sonos-int-player-section-background)",position:"absolute",top:"0rem",left:"0rem"}))}folderStyle(t){return this.main.stylable("media-button-folder",Object.assign({marginBottom:"-120%","--mdc-icon-size":"1"},(!this.mediaItem.can_expand||t)&&{display:"none"}))}static get styles(){return r`
      .hoverable:focus,
      .hoverable:hover {
        border-color: var(--sonos-int-accent-color);
        color: var(--sonos-int-accent-color);
      }
    `}}t([tt()],It.prototype,"mediaItem",void 0),t([tt()],It.prototype,"config",void 0),t([tt()],It.prototype,"main",void 0),customElements.define("sonos-media-button",It);class Rt extends Z{constructor(){super(...arguments),this.headerChildStyle={flex:"1","--mdc-icon-size":"1.5rem"}}render(){var t;return this.activePlayer=this.main.activePlayer,this.mediaControlService=this.main.mediaControlService,T`
      <div style="${this.headerStyle()}" class="hoverable">
        <div style="${this.playDirStyle()}" class="hoverable">
          ${(null===(t=this.currentDir)||void 0===t?void 0:t.can_play)?T` <ha-icon
                .icon=${"mdi:play"}
                @click="${async()=>await this.mediaBrowser.playItem(this.currentDir)}"
              ></ha-icon>`:""}
        </div>
        <div style="${this.titleStyle()}">${this.main.config.mediaTitle?this.main.config.mediaTitle:"Media"}</div>
        <div style="${this.browseStyle()}" @click="${()=>this.mediaBrowser.browseClicked()}">
          <ha-icon .icon=${this.browse?"mdi:arrow-left-bold":"mdi:play-box-multiple"}></ha-icon>
        </div>
      </div>
    `}headerStyle(){return this.main.stylable("media-browser-header",Object.assign({display:"flex",justifyContent:"space-between"},kt))}titleStyle(){return this.main.stylable("title",this.headerChildStyle)}playDirStyle(){return this.main.stylable("media-browser-play-dir",Object.assign({textAlign:"left",paddingRight:"-0.5rem",marginLeft:"0.5rem"},this.headerChildStyle))}browseStyle(){return this.main.stylable("media-browse",Object.assign({textAlign:"right",paddingRight:"0.5rem",marginLeft:"-0.5rem"},this.headerChildStyle))}static get styles(){return r`
      .hoverable:focus,
      .hoverable:hover {
        color: var(--sonos-int-accent-color);
      }
    `}}t([tt()],Rt.prototype,"main",void 0),t([tt()],Rt.prototype,"mediaBrowser",void 0),t([tt()],Rt.prototype,"browse",void 0),t([tt()],Rt.prototype,"currentDir",void 0),customElements.define("sonos-media-browser-header",Rt);class jt extends Z{constructor(){super(...arguments),this.mediaItems=[],this.parentDirs=[]}render(){if(this.config=this.main.config,this.activePlayer=this.main.activePlayer,this.mediaControlService=this.main.mediaControlService,this.mediaBrowseService=this.main.mediaBrowseService,!this.config.singleSectionMode||this.config.singleSectionMode===st.MEDIA_BROWSER){const t=localStorage.getItem("custom-sonos-card_currentDir");return t&&(this.currentDir=JSON.parse(t),this.browse=!0),T`
        <div style="${this.main.buttonSectionStyle({textAlign:"center"})}">
          <sonos-media-browser-header
            .main=${this.main}
            .mediaBrowser=${this}
            .browse=${this.browse}
            .currentDir=${this.currentDir}
          ></sonos-media-browser-header>
          ${""!==this.activePlayer&&At((this.browse?this.loadMediaDir(this.currentDir):this.getAllFavorites()).then((t=>{var e;const i=jt.itemsWithImage(t),s=i?lt(this.config,"33%","16%",null===(e=this.config.layout)||void 0===e?void 0:e.mediaItem):"100%";return T` <div style="${this.mediaButtonsStyle(i)}">
                ${t.map((t=>T`
                    <sonos-media-button
                      style="width: ${s};max-width: ${s};"
                      .mediaItem="${t}"
                      .config="${this.config}"
                      @click="${async()=>await this.onMediaItemClick(t)}"
                      .main="${this.main}"
                    ></sonos-media-button>
                  `))}
              </div>`})))}
        </div>
      `}return T``}browseClicked(){this.parentDirs.length?this.setCurrentDir(this.parentDirs.pop()):this.currentDir?this.setCurrentDir(void 0):this.browse=!this.browse}setCurrentDir(t){this.currentDir=t,t?localStorage.setItem("custom-sonos-card_currentDir",JSON.stringify(t)):localStorage.removeItem("custom-sonos-card_currentDir")}async onMediaItemClick(t){t.can_expand?(this.currentDir&&this.parentDirs.push(this.currentDir),this.setCurrentDir(t)):t.can_play&&await this.playItem(t)}async playItem(t){t.media_content_type||t.media_content_id?await this.mediaControlService.playMedia(this.activePlayer,t):await this.mediaControlService.setSource(this.activePlayer,t.title)}async getAllFavorites(){var t,e,i,s;let o=await this.mediaBrowseService.getAllFavorites(this.mediaPlayers,this.config.mediaBrowserTitlesToIgnore);return this.config.shuffleFavorites?jt.shuffleArray(o):o=o.sort(((t,e)=>t.title.localeCompare(e.title,"en",{sensitivity:"base"}))),[...(null===(e=null===(t=this.config.customSources)||void 0===t?void 0:t[this.activePlayer])||void 0===e?void 0:e.map(jt.createSource))||[],...(null===(s=null===(i=this.config.customSources)||void 0===i?void 0:i.all)||void 0===s?void 0:s.map(jt.createSource))||[],...o]}static createSource(t){return Object.assign(Object.assign({},t),{can_play:!0})}static shuffleArray(t){for(let e=t.length-1;e>0;e--){const i=Math.floor(Math.random()*(e+1));[t[e],t[i]]=[t[i],t[e]]}}static itemsWithImage(t){return t.some((t=>t.thumbnail||t.can_expand))}async loadMediaDir(t){return await(t?this.mediaBrowseService.getDir(this.activePlayer,t,this.config.mediaBrowserTitlesToIgnore):this.mediaBrowseService.getRoot(this.activePlayer,this.config.mediaBrowserTitlesToIgnore))}mediaButtonsStyle(t){return this.main.stylable("media-buttons",Object.assign({padding:"0",display:"flex",flexWrap:"wrap"},!t&&{flexDirection:"column"}))}}function Dt(t=[],e){return null==e?void 0:e.filter((e=>-1===["media-source://tts","media-source://camera"].indexOf(e.media_content_id||"")&&-1===t.indexOf(e.title)))}t([tt()],jt.prototype,"main",void 0),t([tt()],jt.prototype,"mediaPlayers",void 0),t([et()],jt.prototype,"browse",void 0),t([et()],jt.prototype,"currentDir",void 0),t([et()],jt.prototype,"mediaItems",void 0),customElements.define("sonos-media-browser",jt);class Ut{constructor(t,e){this.hass=t,this.hassService=e}async getRoot(t,e){return Dt(e,(await this.hassService.browseMedia(t)).children)||[]}async getDir(t,e,i){try{return Dt(i,(await this.hassService.browseMedia(t,e.media_content_type,e.media_content_id)).children)||[]}catch(t){return console.error(t),[]}}async getAllFavorites(t,e){if(!t.length)return[];let i=(await Promise.all(t.map((t=>this.getFavoritesForPlayer(t,e))))).flatMap((t=>t));return i=this.removeDuplicates(i),i.length?i:this.getFavoritesFromStates(t)}removeDuplicates(t){return t.filter(((t,e,i)=>e===i.findIndex((e=>e.title===t.title))))}async getFavoritesForPlayer(t,e){var i;const s=null===(i=(await this.hassService.browseMedia(t,"favorites","")).children)||void 0===i?void 0:i.map((e=>this.hassService.browseMedia(t,e.media_content_type,e.media_content_id)));return(s?await Promise.all(s):[]).flatMap((t=>Dt(e,t.children)||[]))}getFavoritesFromStates(t){console.log("Custom Sonos Card: found no favorites with thumbnails, trying with titles only");let e=t.map((t=>this.hass.states[t])).flatMap((t=>t.attributes.source_list));return e=[...new Set(e)],e.length||console.log("Custom Sonos Card: No favorites found"),e.map((t=>({title:t})))}}class Nt{constructor(t,e){this.hassService=e,this.hass=t}async join(t,e){await this.hassService.callMediaService("join",{entity_id:t,group_members:e})}async unjoin(t){await this.hassService.callMediaService("unjoin",{entity_id:t})}async pause(t){await this.hassService.callMediaService("media_pause",{entity_id:t})}async prev(t){await this.hassService.callMediaService("media_previous_track",{entity_id:t})}async next(t){await this.hassService.callMediaService("media_next_track",{entity_id:t})}async play(t){await this.hassService.callMediaService("media_play",{entity_id:t})}async shuffle(t,e){await this.hassService.callMediaService("shuffle_set",{entity_id:t,shuffle:e})}async repeat(t,e){const i="all"===e?"one":"one"===e?"off":"all";await this.hassService.callMediaService("repeat_set",{entity_id:t,repeat:i})}async volumeDown(t,e){await this.hassService.callMediaService("volume_down",{entity_id:t});for(const t in e)await this.hassService.callMediaService("volume_down",{entity_id:t})}async volumeUp(t,e){await this.hassService.callMediaService("volume_up",{entity_id:t});for(const t in e)await this.hassService.callMediaService("volume_up",{entity_id:t})}async volumeSet(t,e,i){const s=Number.parseInt(e)/100;await this.hassService.callMediaService("volume_set",{entity_id:t,volume_level:s});for(const t in i)await this.hassService.callMediaService("volume_set",{entity_id:t,volume_level:s})}async volumeMute(t,e,i){await this.hassService.callMediaService("volume_mute",{entity_id:t,is_volume_muted:e});for(const t in i)await this.hassService.callMediaService("volume_mute",{entity_id:t,is_volume_muted:e})}async setSource(t,e){await this.hassService.callMediaService("select_source",{source:e,entity_id:t})}async playMedia(t,e){await this.hassService.callMediaService("play_media",{entity_id:t,media_content_id:e.media_content_id,media_content_type:e.media_content_type})}}class Bt{constructor(t){this.hass=t}async callMediaService(t,e){await this.hass.callService("media_player",t,e)}async browseMedia(t,e,i){return await this.hass.callWS({type:"media_player/browse_media",entity_id:t,media_content_id:i,media_content_type:e})}async getRelatedSwitchEntities(t){const e=await this.hass.callApi("POST","template",{template:"{{ device_entities(device_id('"+t+"')) }}"});return JSON.parse(e.replace(/'/g,'"')).filter((t=>t.indexOf("switch")>-1))}async toggle(t){await this.hass.callService("homeassistant","toggle",{entity_id:t})}}window.customCards=window.customCards||[],window.customCards.push({type:"custom-sonos-card",name:"Sonos Card",description:"Customized media player for your Sonos speakers",preview:!0});class zt extends Z{constructor(){super(...arguments),this.activePlayerListener=t=>this.activePlayer=t.detail.player}connectedCallback(){super.connectedCallback(),window.addEventListener("sonos-card-active-player",this.activePlayerListener)}disconnectedCallback(){window.removeEventListener("sonos-card-active-player",this.activePlayerListener),super.disconnectedCallback()}render(){this.mediaBrowseService||(this.hassService=new Bt(this.hass),this.mediaBrowseService=new Ut(this.hass,this.hassService),this.mediaControlService=new Nt(this.hass,this.hassService));const t=(e=this.config,i=this.hass,e.entities?[...new Set(e.entities)].filter((t=>i.states[t])):Object.values(i.states).filter(rt).map((t=>t.entity_id)).sort());var e,i;const s=nt(t,this.hass,this.config);return this.determineActivePlayer(s),T`
      <ha-card style="${this.haCardStyle()}">
        <div style="${this.titleStyle()}">${this.config.name}</div>
        <div style="${this.contentStyle()}">
          <div style=${this.groupsStyle()}>
            <sonos-groups .main="${this}" .groups="${s}" .activePlayer="${this.activePlayer}" />
          </div>

          <div style=${this.playersStyle()}>
            <sonos-player .main=${this} .members=${s[this.activePlayer].members}></sonos-player>
            <sonos-grouping .main=${this} .groups=${s} .mediaPlayers=${t}></sonos-grouping>
          </div>

          <div style=${this.mediaBrowserStyle()}>
            <sonos-media-browser .main=${this} .mediaPlayers=${t}></sonos-media-browser>
          </div>
        </div>
      </ha-card>
    `}stylable(t,e){var i,s;return Pt(Object.assign(Object.assign({"--sonos-card-style-name":t},e),null===(s=null===(i=this.config)||void 0===i?void 0:i.styles)||void 0===s?void 0:s[t]))}buttonSectionStyle(t){return this.stylable("button-section",Object.assign({background:"var(--sonos-int-button-section-background-color)",borderRadius:"var(--sonos-int-border-radius)",border:"var(--sonos-int-border-width) solid var(--sonos-int-color)",marginTop:"1rem",padding:"0 0.5rem"},t))}titleStyle(){return this.stylable("title",Object.assign({display:this.config.name?"block":"none"},kt))}groupsStyle(){var t;return this.columnStyle(null===(t=this.config.layout)||void 0===t?void 0:t.groups,"1",this.getDefaultWidth("25%"),"groups",{padding:"0 1rem",boxSizing:"border-box"})}getDefaultWidth(t){return this.config.singleSectionMode?"100%":t}playersStyle(){var t;return this.columnStyle(null===(t=this.config.layout)||void 0===t?void 0:t.players,"0",this.getDefaultWidth("40%"),"players")}mediaBrowserStyle(){var t;return this.columnStyle(null===(t=this.config.layout)||void 0===t?void 0:t.mediaBrowser,"2",this.getDefaultWidth("25%"),"media-browser",{padding:"0 1rem",boxSizing:"border-box"})}columnStyle(t,e,i,s,o){const r=lt(this.config,i,"100%",t);let n=Object.assign({width:r,maxWidth:r},o);return ct(this.config)&&(n=Object.assign(Object.assign({},n),{order:e,padding:"0.5rem",margin:"0",boxSizing:"border-box"})),this.stylable(s,n)}haCardStyle(){return this.stylable("ha-card",{color:"var(--sonos-int-color)",background:"var(--sonos-int-ha-card-background-color)"})}contentStyle(){return this.stylable("content",{display:"flex",flexWrap:"wrap",justifyContent:"center"})}determineActivePlayer(t){const e=this.config.selectedPlayer||(window.location.href.indexOf("#")>0?window.location.href.replace(/.*#/g,""):"");if(this.activePlayer&&this.setActivePlayer(this.activePlayer),!this.activePlayer)for(const i in t)if(i===e)this.setActivePlayer(i);else for(const s in t[i].members)s===e&&this.setActivePlayer(i);if(!this.activePlayer)for(const e in t)"playing"===t[e].state&&this.setActivePlayer(e);this.activePlayer||this.setActivePlayer(Object.keys(t)[0])}setActivePlayer(t){if(this.activePlayer!==t){this.activePlayer=t;const e=window.location.href.replace(/#.*/g,"");window.location.href=`${e}#${t}`;const i=new CustomEvent("sonos-card-active-player",{bubbles:!0,composed:!0,detail:{player:t}});window.dispatchEvent(i)}}setConfig(t){var e,i;this.config=JSON.parse(JSON.stringify(t));const s=(t,e)=>console.log("Sonos Card: "+t+" configuration is deprecated. Please use "+e+" instead.");this.config.layout&&!(null===(e=this.config.layout)||void 0===e?void 0:e.mediaBrowser)&&this.config.layout.favorites&&(s("layout.favorites","layout.mediaBrowser"),this.config.layout.mediaBrowser=this.config.layout.favorites),this.config.layout&&!(null===(i=this.config.layout)||void 0===i?void 0:i.mediaItem)&&this.config.layout.favorite&&(s("layout.favorite","layout.mediaItem"),this.config.layout.mediaItem=this.config.layout.favorite),this.config.singleSectionMode&&(Object.values(st).includes(this.config.singleSectionMode)||(console.log('Sonos Card: invalid value supplied for "singleSectionMode", will show all sections.'),this.config.singleSectionMode=void 0))}getCardSize(){return 3}static get styles(){return r`
      :host {
        --sonos-int-background-color: var(
          --sonos-background-color,
          var(--ha-card-background, var(--card-background-color, white))
        );
        --sonos-int-ha-card-background-color: var(
          --sonos-ha-card-background-color,
          var(--ha-card-background, var(--card-background-color, white))
        );
        --sonos-int-player-section-background: var(--sonos-player-section-background, #ffffffe6);
        --sonos-int-color: var(--sonos-color, var(--secondary-text-color));
        --sonos-int-artist-album-text-color: var(--sonos-artist-album-text-color, var(--secondary-text-color));
        --sonos-int-song-text-color: var(--sonos-song-text-color, var(--sonos-accent-color, var(--accent-color)));
        --sonos-int-accent-color: var(--sonos-accent-color, var(--accent-color));
        --sonos-int-title-color: var(--sonos-title-color, var(--secondary-text-color));
        --sonos-int-border-radius: var(--sonos-border-radius, 0.25rem);
        --sonos-int-border-width: var(--sonos-border-width, 0.125rem);
        --sonos-int-media-button-white-space: var(
          --sonos-media-buttons-multiline,
          var(--sonos-favorites-multiline, nowrap)
        );
        --sonos-int-button-section-background-color: var(
          --sonos-button-section-background-color,
          var(--card-background-color)
        );
        --mdc-icon-size: 1rem;
      }
    `}}t([tt({attribute:!1})],zt.prototype,"hass",void 0),t([tt()],zt.prototype,"config",void 0),t([et()],zt.prototype,"activePlayer",void 0),t([et()],zt.prototype,"showVolumes",void 0),customElements.define("custom-sonos-card",zt);export{zt as CustomSonosCard};
