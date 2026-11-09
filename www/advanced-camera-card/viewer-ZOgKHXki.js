import{A as e,Ao as t,At as n,Ct as r,D as i,Do as a,Eo as o,Fo as s,It as c,J as l,K as u,Lt as ee,Mo as d,N as f,No as p,Oo as m,Ro as h,St as te,Ti as ne,Tt as re,U as ie,W as ae,b as g,g as _,gn as v,gt as y,h as b,ht as x,j as S,jo as C,l as w,lr as T,m as E,mr as D,n as O,nt as k,p as A,pt as j,rn as M,s as N,tr as P,vi as F,vr as I,w as L,wn as R,wt as z,x as B}from"./shared-DKvQuQy0.js";import{t as V}from"./media-actions-controller-DQuok6k3.js";var H=`:host{flex-direction:column;gap:5px;width:100%;height:100%;display:flex}:host([empty]){aspect-ratio:16/9}advanced-camera-card-viewer-carousel{flex:1;min-height:0}`,U=`:host{--video-max-height:none;border-radius:var(--advanced-camera-card-border-radius-final);transition:max-height .1s ease-in-out;display:block;position:relative;overflow:hidden}:host(:not([grid-id])){height:100%}:host([unselected]) advanced-camera-card-carousel,:host([unselected]) .seek-warning{pointer-events:none}:host([unseekable]) advanced-camera-card-carousel{filter:brightness(50%)}:host([unseekable]) .seek-warning{display:block}.seek-warning{color:#fff;display:none;position:absolute;top:50%;left:50%;transform:translate(-50%)translateY(-50%)}.embla__slide{flex:0 0 100%;width:100%;height:100%;display:flex}`,W=(e,t)=>{let n=e?.context?.mediaViewer?.seek??null;if(n)return{time:n,inMedia:t.includesTime(n)};let r=t.getPlaybackStartTime();return r?{time:r,inMedia:!0}:null},G=class{constructor(e,t){this._value=null,this._pending=!1,this._targetContentID=null,this._requestGeneration=new T,(this._host=e).addController(this),this._getOptionsCallback=t}getValue(){return this._value}isPending(){return this._pending}hostDisconnected(){this._reset()}async hostUpdate(){let{cameraManager:e,view:t,media:n}=this._getOptionsCallback(),r=n?.getContentID()??null;if(!n||!r){this._reset();return}if(r===this._targetContentID)return;this._targetContentID=r,this._value=null,this._pending=!1;let i=W(t??null,n);if(!e||!i?.inMedia){this._requestGeneration.invalidate();return}this._pending=!0;let a=this._requestGeneration.next(),o=null;try{o=await e.getMediaSeekTime(n,i.time)}catch{}this._requestGeneration.isCurrent(a)&&(this._value=o,this._pending=!1,this._host.requestUpdate())}_reset(){this._requestGeneration.invalidate(),this._value=null,this._pending=!1,this._targetContentID=null}},K=class{constructor(e,t){this._value=null,this._targetContentID=null,this._targetCache=null,this._requestGeneration=new T,(this._host=e).addController(this),this._getOptionsCallback=t}getValue(){return this._value}hostDisconnected(){this._requestGeneration.invalidate(),this._value=null,this._targetContentID=null,this._targetCache=null}async hostUpdate(){let{hass:e,contentID:t,cache:n}=this._getOptionsCallback();if(!e||!t){this._requestGeneration.invalidate(),this._value=null,this._targetContentID=null,this._targetCache=null;return}let r=n??null;if(t===this._targetContentID&&r===this._targetCache)return;this._targetContentID=t,this._targetCache=r;let i=r?.get(t)??null;if(i){this._requestGeneration.invalidate(),this._value=i;return}this._value=null;let a=this._requestGeneration.next(),o=await v(e,t,r);this._requestGeneration.isCurrent(a)&&(this._value=o,this._host.requestUpdate())}},q=`:host{--bracket-color:#7f7f7f1a}@supports (color:color-mix(in oklab, red, transparent 50%)){:host{--bracket-color:color-mix(in oklab, var(--advanced-camera-card-text-color), transparent 90%)}}:host{background-color:var(--advanced-camera-card-background);background-image:linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0);background-position:10px 10px,10px 10px,right 10px top 10px,right 10px top 10px,left 10px bottom 10px,left 10px bottom 10px,right 10px bottom 10px,right 10px bottom 10px;background-repeat:no-repeat;background-size:24px 1px,1px 24px,24px 1px,1px 24px,24px 1px,1px 24px,24px 1px,1px 24px;width:100%;height:100%;display:block}.zoom-wrapper{width:100%;height:100%;display:block}advanced-camera-card-progress-indicator{box-sizing:border-box;padding:30px}`,J=`:host{width:100%;height:100%;display:block}video{object-fit:var(--advanced-camera-card-media-layout-fit,contain);object-position:var(--advanced-camera-card-media-layout-position-x,50%) var(--advanced-camera-card-media-layout-position-y,50%);object-view-box:inset(var(--advanced-camera-card-media-layout-view-box-top,0%) var(--advanced-camera-card-media-layout-view-box-right,0%) var(--advanced-camera-card-media-layout-view-box-bottom,0%) var(--advanced-camera-card-media-layout-view-box-left,0%));width:100%;height:100%;display:block}`,Y=class extends p{constructor(...e){super(...e),this.controls=!1,this._refVideo=o(),this._mediaPlayerController=new N(this,()=>this._refVideo.value??null,()=>this.controls),this._mediaLoadedInfoSourceController=new L(this,{getTargetID:()=>this.targetID??null})}async getMediaPlayerController(){return this._mediaPlayerController}render(){return s`
      <video
        ${a(this._refVideo)}
        muted
        playsinline
        crossorigin="anonymous"
        ?autoplay=${!1}
        ?controls=${this.controls}
        @loadedmetadata=${e=>{e.target&&this.controls&&w(e.target,2)}}
        @loadeddata="${e=>{let t=te(e,{...this._mediaPlayerController&&{mediaPlayerController:this._mediaPlayerController},capabilities:{supportsPause:!0,hasAudio:A(e.target)},technology:[`mp4`]});t&&this._mediaLoadedInfoSourceController.set(t)}}"
        @volumechange=${()=>re(this)}
        @play=${()=>z(this)}
        @pause=${()=>r(this)}
      >
        <source src="${m(this.url)}" type="video/mp4" />
      </video>
    `}static get styles(){return h(J)}};j([C()],Y.prototype,`url`,void 0),j([C()],Y.prototype,`targetID`,void 0),j([C({type:Boolean})],Y.prototype,`controls`,void 0),Y=j([d(`advanced-camera-card-video-player`)],Y);var X=class extends p{constructor(){super(),this.forceSelected=!1,this._refProvider=o(),this._lazyLoadController=new E(this),this._resolvedMediaController=new K(this,()=>({hass:this.hass,contentID:this._shouldLoad()?this.media?.getContentID()??null:null,cache:this.resolvedMediaCache})),this._signedURLController=new g(this,()=>{let e=this._resolvedMediaController.getValue();if(!this.hass||!e)return{};if(ee(e.url))return{endpoint:{endpoint:c(this.hass,e.url)}};let t=this.media?.getCameraID(),n=t?this.cameraManager?.getStore().getCamera(t):null;return{hass:this.hass,endpoint:{endpoint:e.url},proxyConfig:n?.getMediaProxyConfig()}}),this._mediaStartPositionController=new G(this,()=>({cameraManager:this.cameraManager,view:this.viewManagerEpoch?.manager.getView()??void 0,media:this._shouldLoad()&&this._classifyMedia().isHLS?this.media:void 0})),new i(this,{getTargetID:()=>this.media?.getID()??null,isLoadExpected:()=>this._shouldLoad()})}async getMediaPlayerController(){return await this.updateComplete,await this._refProvider.value?.getMediaPlayerController()??null}async _switchToRelatedClipView(){let e=this.viewManagerEpoch?.manager.getView();if(!this.hass||!e||!this.cameraManager||!this.media||!P.isEvent(this.media)||!e.query?.hasMediaQueriesOfType(R.Event))return;let t=O.convertToClips(e.query);await this.viewManagerEpoch?.manager.setViewByParametersWithExistingQuery({params:{view:`media`,query:t},queryExecutorOptions:{selectResult:{id:this.media.getID()??void 0},rejectResults:e=>!e.hasSelectedResult()}})}willUpdate(e){(e.has(`viewerConfig`)||e.has(`forceSelected`))&&this._lazyLoadController.setConfiguration({lazyLoad:this.viewerConfig?.lazy_load,forceSelected:this.forceSelected}),e.has(`viewerConfig`)&&this.viewerConfig?.zoomable&&import(`./zoomer-BIWc6aVH.js`)}_shouldLoad(){return this._lazyLoadController.isLoaded()}_classifyMedia(){return ae(this._resolvedMediaController.getValue()?.mime_type)}_getRelevantCameraConfig(){let e=this.media?.getCameraID();return e?this.cameraManager?.getStore().getCameraConfig(e)??null:null}_renderContainer(e){if(!this.media)return e;let t=this.media.getCameraID(),n=this.media.getID()??void 0,r=t?this.cameraManager?.getStore().getCameraConfig(t)??null:null,i=this.viewManagerEpoch?.manager.getView(),a=s` <advanced-camera-card-media-dimensions-container
      .dimensionsConfig=${this._getRelevantCameraConfig()?.dimensions}
    >
      ${e}
    </advanced-camera-card-media-dimensions-container>`;return s`
      ${this.viewerConfig?.zoomable?s`<advanced-camera-card-zoomer
            .defaultSettings=${S([r?.dimensions?.layout],()=>r?.dimensions?.layout?{pan:r.dimensions.layout.pan,zoom:r.dimensions.layout.zoom}:void 0)}
            .settings=${n?i?.context?.zoom?.[n]?.requested:void 0}
            @advanced-camera-card:zoom:zoomed=${async()=>(await this.getMediaPlayerController())?.setControls(!1)}
            @advanced-camera-card:zoom:unzoomed=${async()=>(await this.getMediaPlayerController())?.setControls()}
            @advanced-camera-card:zoom:change=${e=>M(e,this.viewManagerEpoch?.manager,n)}
          >
            ${a}
          </advanced-camera-card-zoomer>`:a}
    `}render(){if(!this._shouldLoad()||!this.media||!this.hass||!this.viewerConfig)return;let e=this._signedURLController.getError();if(e){let t=this.media?.getContentID();return k(B(e),{...t&&{metadata:[{text:t,icon:`mdi:identifier`}]}})}let{isHLS:t,isVideo:n}=this._classifyMedia(),r=this._signedURLController.getValue();if(!r||this._mediaStartPositionController.isPending())return u({cardWideConfig:this.cardWideConfig});let i=this.media.getID()??void 0,o=this._mediaStartPositionController.getValue()??void 0;return this._renderContainer(s`
      ${n?t?s`<advanced-camera-card-ha-hls-player
              ${a(this._refProvider)}
              allow-exoplayer
              aria-label="${this.media.getTitle()??``}"
              ?autoplay=${!1}
              controls
              muted
              playsinline
              title="${this.media.getTitle()??``}"
              url=${r}
              .hass=${this.hass}
              .startPosition=${o}
              .targetID=${i}
              ?controls=${this.viewerConfig.controls.builtin}
            >
            </advanced-camera-card-ha-hls-player>`:s`
              <advanced-camera-card-video-player
                ${a(this._refProvider)}
                url=${r}
                aria-label="${this.media.getTitle()??``}"
                title="${this.media.getTitle()??``}"
                .targetID=${i}
                ?controls=${this.viewerConfig.controls.builtin}
              >
              </advanced-camera-card-video-player>
            `:s`<advanced-camera-card-image-player
            ${a(this._refProvider)}
            url="${r}"
            aria-label="${this.media.getTitle()??``}"
            title="${this.media.getTitle()??``}"
            .targetID=${i}
            @click=${()=>{this.viewerConfig?.snapshot_click_plays_clip&&this._switchToRelatedClipView()}}
          ></advanced-camera-card-image-player>`}
    `)}static get styles(){return h(q)}};j([C({attribute:!1})],X.prototype,`hass`,void 0),j([C({attribute:!1})],X.prototype,`viewManagerEpoch`,void 0),j([C({attribute:!1})],X.prototype,`media`,void 0),j([C({attribute:!1})],X.prototype,`viewerConfig`,void 0),j([C({attribute:!1})],X.prototype,`resolvedMediaCache`,void 0),j([C({attribute:!1})],X.prototype,`cameraManager`,void 0),j([C({attribute:!1})],X.prototype,`cardWideConfig`,void 0),j([C({attribute:!1})],X.prototype,`forceSelected`,void 0),X=j([d(`advanced-camera-card-viewer-provider`)],X);var oe=`advanced-camera-card-viewer-provider`,Z=class extends p{constructor(...e){super(...e),this.showControls=!0,this.autoHeight=!0,this._selected=null,this._media=null,this._mediaActionsController=new V,this._mediaHeightController=new _(this,`.embla__slide`),this._refCarousel=o(),this._mediaLoadedInfoSinkController=new b(this,{getTargetID:()=>this._selected!==null&&this._media?.[this._selected]?.getID()||null,callback:()=>{this._mediaHeightController.recalculate(),this._seekHandler()}})}connectedCallback(){super.connectedCallback(),this.autoHeight&&this._mediaHeightController.setRoot(this.renderRoot),this.requestUpdate()}disconnectedCallback(){this._mediaActionsController.destroy(),this._mediaHeightController.destroy(),super.disconnectedCallback()}_getTransitionEffect(){return this.viewerConfig?.transition_effect??I.media_viewer.transition_effect}_getMediaNeighbors(){let e=this._media?.length??0;if(!this._media||this._selected===null)return null;let t=this._selected>0?this._selected-1:null,n=this._selected+1<e?this._selected+1:null;return{...t!==null&&{previous:{index:t,media:this._media[t]}},...n!==null&&{next:{index:n,media:this._media[n]}}}}_setViewSelectedIndex(e){let t=this.viewManagerEpoch?.manager.getView();if(!this._media||!t||this._selected===e)return;let n=t?.queryResults?.clone().selectResultIfFound(t=>t===this._media?.[e],{main:!0,cameraID:this.viewFilterCameraID});if(!n)return;let r=n.getSelectedResult(this.viewFilterCameraID),i=P.isMedia(r)?r.getCameraID():null;this.viewManagerEpoch?.manager.setViewByParameters({params:{queryResults:n,...i&&{camera:i}},modifiers:[new y(`mediaViewer`,`seek`)]})}_getSlides(){if(!this._media)return[];let e=[];for(let t=0;t<this._media.length;++t){let n=this._media[t];if(n){let r=this._renderMediaItem(n,t===this._selected);r&&(e[t]=r)}}return e}willUpdate(e){if(e.has(`viewerConfig`)&&this._mediaActionsController.setOptions({playerSelector:oe,...this.viewerConfig?.auto_play&&{autoPlayConditions:this.viewerConfig.auto_play},...this.viewerConfig?.auto_pause&&{autoPauseConditions:this.viewerConfig.auto_pause},...this.viewerConfig?.auto_mute&&{autoMuteConditions:this.viewerConfig.auto_mute},...this.viewerConfig?.auto_unmute&&{autoUnmuteConditions:this.viewerConfig.auto_unmute}}),e.has(`viewManagerEpoch`)){let e=this.viewManagerEpoch?.manager.getView();e?.context?.mediaViewer?.seek||this.toggleAttribute(`unseekable`,!1);let t=this.viewManagerEpoch?.oldView,n=t?.queryResults?.getResults(this.viewFilterCameraID)??null,r=e?.queryResults?.getResults(this.viewFilterCameraID)??null,i=!1;(!this._media||n!==r)&&(this._media=r?.filter(e=>P.isMedia(e))??null,i=!0);let a=t?.queryResults?.getSelectedResult(this.viewFilterCameraID),o=e?.queryResults?.getSelectedResult(this.viewFilterCameraID);if(a!==o||i){let e=this._media?.findIndex(e=>e===o)??null;this._selected=e??(this._media&&this._media.length?this._media.length-1:null)}}}_renderNextPrevious(e,t){let n=e=>{if(!t||!this._media)return;let n=(e===`previous`?t.previous?.index:t.next?.index)??null;n!==null&&this._setViewSelectedIndex(n)},r=l(this),i=r===`ltr`&&e===`left`||r===`rtl`&&e===`right`?`previous`:`next`;return s` <advanced-camera-card-next-previous-control
      slot=${e}
      .hass=${this.hass}
      .side=${e}
      .controlConfig=${this.viewerConfig?.controls.next_previous}
      .thumbnail=${t?.[i]?.media.getThumbnail()??void 0}
      .label=${t?.[i]?.media.getTitle()??``}
      .autoHideState=${x()}
      ?disabled=${!t?.[i]}
      @click=${e=>{n(i),F(e)}}
    ></advanced-camera-card-next-previous-control>`}render(){let e=this._media?.length??0;if(!this._media||!e)return f({cameraID:this.viewFilterCameraID??this.viewManagerEpoch?.manager.getView()?.camera??null},this.cameraManager);if(!this.hass||!this.cameraManager||this._selected===null)return;let t=this._getMediaNeighbors(),n=this.viewManagerEpoch?.manager.getView();return s`
      <advanced-camera-card-carousel
        ${a(this._refCarousel)}
        .dragEnabled=${this.viewerConfig?.draggable??!0}
        .selected=${this._selected}
        .wheelScrolling=${this.viewerConfig?.controls.wheel}
        transitionEffect=${this._getTransitionEffect()}
        @advanced-camera-card:carousel:select=${e=>{this._setViewSelectedIndex(e.detail.index)}}
      >
        ${this.showControls?this._renderNextPrevious(`left`,t):``}
        ${S([this._media,n],()=>this._getSlides())}
        ${this.showControls?this._renderNextPrevious(`right`,t):``}
      </advanced-camera-card-carousel>
      ${n?s` <advanced-camera-card-ptz
            .hass=${this.hass}
            .config=${this.viewerConfig?.controls.ptz}
            .forceVisibility=${n?.context?.ptzControls?.enabled}
          >
          </advanced-camera-card-ptz>`:``}
      <div class="seek-warning">
        <advanced-camera-card-icon
          title="${D(`media_viewer.unseekable`)}"
          .icon=${{icon:`mdi:clock-remove`}}
        >
        </advanced-camera-card-icon>
      </div>
    `}updated(e){super.updated(e),(this._refCarousel.value&&this._mediaActionsController.setRoot(this._refCarousel.value)||e.has(`viewManagerEpoch`))&&this._setMediaTarget(),e.has(`viewManagerEpoch`)&&this.viewManagerEpoch?.manager.getView()?.context?.mediaViewer?.seek?.getTime()!==this.viewManagerEpoch?.oldView?.context?.mediaViewer?.seek?.getTime()&&this._seekHandler()}_setMediaTarget(){!this._media?.length||this._selected===null?this._mediaActionsController.unsetTarget():(this._mediaActionsController.setTarget(this._selected,!this.viewFilterCameraID||this.viewManagerEpoch?.manager.getView()?.camera===this.viewFilterCameraID),this._mediaHeightController.setSelected(this._selected))}async _seekHandler(){let e=this._mediaLoadedInfoSinkController.get()?.mediaPlayerController??null;if(!this.hass||!this._media||!e||this._selected===null)return;let t=this._media[this._selected];if(!t)return;let n=W(this.viewManagerEpoch?.manager.getView()??null,t);if(!n||(this.toggleAttribute(`unseekable`,!n.inMedia),!n.inMedia&&!e.playback?.isPaused()?e.playback?.pause():n.inMedia&&e.playback?.isPaused()&&e.playback?.play(),!n.inMedia))return;let r=await this.cameraManager?.getMediaSeekTime(t,n.time)??null;r!==null&&e.seek?.(r)}_renderMediaItem(t,n){let r=this.viewManagerEpoch?.manager.getView();if(!this.hass||!r||!this.viewerConfig)return null;let i=t.getID(),a=i?r.context?.mediaEpoch?.[i]??0:0;return s` <div class="embla__slide">
      ${e(a,s`<advanced-camera-card-viewer-provider
          .hass=${this.hass}
          .viewManagerEpoch=${this.viewManagerEpoch}
          .media=${t}
          .viewerConfig=${this.viewerConfig}
          .resolvedMediaCache=${this.resolvedMediaCache}
          .cameraManager=${this.cameraManager}
          .cardWideConfig=${this.cardWideConfig}
          .forceSelected=${n}
        ></advanced-camera-card-viewer-provider>`)}
    </div>`}static get styles(){return h(U)}};j([C({attribute:!1})],Z.prototype,`hass`,void 0),j([C({attribute:!1})],Z.prototype,`viewManagerEpoch`,void 0),j([C({attribute:!1})],Z.prototype,`viewFilterCameraID`,void 0),j([C({attribute:!1,hasChanged:ne})],Z.prototype,`viewerConfig`,void 0),j([C({attribute:!1})],Z.prototype,`resolvedMediaCache`,void 0),j([C({attribute:!1})],Z.prototype,`cardWideConfig`,void 0),j([C({attribute:!1})],Z.prototype,`cameraManager`,void 0),j([C({attribute:!1})],Z.prototype,`showControls`,void 0),j([C({attribute:!1})],Z.prototype,`autoHeight`,void 0),j([t()],Z.prototype,`_selected`,void 0),Z=j([d(`advanced-camera-card-viewer-carousel`)],Z);var Q=class extends p{_renderCarousel(e){let t=this.viewManagerEpoch?.manager.getView()?.camera,n=e?this.cameraManager?.getStore().getCameraConfig(e)?.dimensions?.grid?.width_factor:void 0;return s`
      <advanced-camera-card-viewer-carousel
        grid-id=${m(e)}
        grid-width-factor=${m(n)}
        .hass=${this.hass}
        .viewManagerEpoch=${this.viewManagerEpoch}
        .viewFilterCameraID=${e}
        .autoHeight=${!e}
        .viewerConfig=${this.viewerConfig}
        .resolvedMediaCache=${this.resolvedMediaCache}
        .cameraManager=${this.cameraManager}
        .cardWideConfig=${this.cardWideConfig}
        .showControls=${!e||t===e}
        .viewItemManager=${this.viewItemManager}
      >
      </advanced-camera-card-viewer-carousel>
    `}willUpdate(e){e.has(`viewManagerEpoch`)&&this._getGridCameraIDs()&&import(`./media-grid-CMVxmBO8.js`)}_getGridCameraIDs(){let e=this.viewManagerEpoch?.manager.getView();return e?n(e):null}_gridSelectCamera(e){let t=this.viewManagerEpoch?.manager.getView();this.viewManagerEpoch?.manager.setViewByParameters({params:{camera:e,queryResults:t?.queryResults?.clone().promoteCameraSelectionToMainSelection(e)}})}render(){let e=this._getGridCameraIDs();return e?s`
      <advanced-camera-card-media-grid
        .selected=${this.viewManagerEpoch?.manager.getView()?.camera}
        .displayConfig=${this.viewerConfig?.display}
        @advanced-camera-card:media-grid:selected=${e=>this._gridSelectCamera(e.detail.selected)}
      >
        ${[...e].map(e=>this._renderCarousel(e))}
      </advanced-camera-card-media-grid>
    `:this._renderCarousel()}static get styles(){return h(ie)}};j([C({attribute:!1})],Q.prototype,`hass`,void 0),j([C({attribute:!1})],Q.prototype,`viewManagerEpoch`,void 0),j([C({attribute:!1})],Q.prototype,`viewerConfig`,void 0),j([C({attribute:!1})],Q.prototype,`resolvedMediaCache`,void 0),j([C({attribute:!1})],Q.prototype,`cardWideConfig`,void 0),j([C({attribute:!1})],Q.prototype,`cameraManager`,void 0),j([C({attribute:!1})],Q.prototype,`viewItemManager`,void 0),Q=j([d(`advanced-camera-card-viewer-grid`)],Q);var $=class extends p{constructor(...e){super(...e),this.isEmpty=!1}willUpdate(e){if(e.has(`viewManagerEpoch`)){let e=this.viewManagerEpoch?.manager.getView();this.isEmpty=!e?.queryResults?.getResults()?.filter(e=>P.isMedia(e)).length}}render(){if(!(!this.hass||!this.viewManagerEpoch||!this.viewerConfig||!this.cameraManager||!this.cardWideConfig))return this.isEmpty?f({cameraID:this.viewManagerEpoch.manager.getView()?.camera??null,inProgress:!!this.viewManagerEpoch.manager.getView()?.context?.loading?.query},this.cameraManager):s` <advanced-camera-card-viewer-grid
      .hass=${this.hass}
      .viewManagerEpoch=${this.viewManagerEpoch}
      .viewerConfig=${this.viewerConfig}
      .resolvedMediaCache=${this.resolvedMediaCache}
      .cameraManager=${this.cameraManager}
      .cardWideConfig=${this.cardWideConfig}
      .viewItemManager=${this.viewItemManager}
    >
    </advanced-camera-card-viewer-grid>`}static get styles(){return h(H)}};j([C({attribute:!1})],$.prototype,`hass`,void 0),j([C({attribute:!1})],$.prototype,`viewManagerEpoch`,void 0),j([C({attribute:!1})],$.prototype,`viewerConfig`,void 0),j([C({attribute:!1})],$.prototype,`resolvedMediaCache`,void 0),j([C({attribute:!1})],$.prototype,`cameraManager`,void 0),j([C({attribute:!1})],$.prototype,`cardWideConfig`,void 0),j([C({attribute:!1})],$.prototype,`viewItemManager`,void 0),j([C({attribute:`empty`,reflect:!0,type:Boolean})],$.prototype,`isEmpty`,void 0),$=j([d(`advanced-camera-card-viewer`)],$);export{$ as AdvancedCameraCardViewer};