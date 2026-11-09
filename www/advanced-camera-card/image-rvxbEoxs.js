import{A as e,Ar as t,D as n,Do as r,Eo as i,Fo as a,Mo as o,No as s,Ro as c,an as l,j as u,jo as d,k as f,mr as p,nt as m,pt as h,rn as g}from"./shared-DKvQuQy0.js";import{t as _}from"./image-updating-player-DQiYfBf0.js";var v=`:host{--bracket-color:#7f7f7f1a}@supports (color:color-mix(in oklab, red, transparent 50%)){:host{--bracket-color:color-mix(in oklab, var(--advanced-camera-card-text-color), transparent 90%)}}:host{background-color:var(--advanced-camera-card-background);background-image:linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0), linear-gradient(var(--bracket-color) 0 0);background-position:10px 10px,10px 10px,right 10px top 10px,right 10px top 10px,left 10px bottom 10px,left 10px bottom 10px,right 10px bottom 10px,right 10px bottom 10px;background-repeat:no-repeat;background-size:24px 1px,1px 24px,24px 1px,1px 24px,24px 1px,1px 24px,24px 1px,1px 24px;width:100%;height:100%;display:block}.zoom-wrapper{width:100%;height:100%;display:block}`,y=class extends s{constructor(){super(),this._refImage=i(),new n(this,{getTargetID:()=>l,isLoadExpected:()=>!!this.hass&&!this._getConfigurationError(),getAttemptID:()=>this._getMediaEpoch()})}_getMediaEpoch(){return(this.viewManagerEpoch?.manager.getView())?.context?.mediaEpoch?.__IMAGE_VIEW__??0}_getConfigurationError(){return _({imageConfig:this.imageConfig,cameraConfig:this.cameraConfig})===`camera`&&!this.cameraConfig?p(`error.no_camera_for_image`):null}async getMediaPlayerController(){return await this.updateComplete,await this._refImage.value?.getMediaPlayerController()??null}_renderContainer(e){let t=l,n=this.viewManagerEpoch?.manager.getView(),r=_({imageConfig:this.imageConfig,cameraConfig:this.cameraConfig}),i=a` <advanced-camera-card-media-dimensions-container
      .dimensionsConfig=${r===`camera`?this.cameraConfig?.dimensions:void 0}
    >
      ${e}
    </advanced-camera-card-media-dimensions-container>`;return a` ${this.imageConfig?.zoomable?a`<advanced-camera-card-zoomer
          .defaultSettings=${u([this.imageConfig,this.cameraConfig?.dimensions?.layout],()=>r===`camera`&&this.cameraConfig?.dimensions?.layout?{pan:this.cameraConfig.dimensions.layout.pan,zoom:this.cameraConfig.dimensions.layout.zoom}:void 0)}
          .settings=${n?.context?.zoom?.[t]?.requested}
          @advanced-camera-card:zoom:change=${e=>g(e,this.viewManagerEpoch?.manager,t)}
        >
          ${i}
        </advanced-camera-card-zoomer>`:i}`}_resolveProxyConfig(e){return e?{...t(e),enabled:e.enabled,enforce:e.enabled}:null}render(){if(!this.hass)return;let t=this._getConfigurationError();if(t)return m(t,{icon:`mdi:camera-off`});let n=this.viewManagerEpoch?.manager.getView();return this._renderContainer(a`
      ${e(this._getMediaEpoch(),a`
          <advanced-camera-card-image-updating-player
            ${r(this._refImage)}
            .hass=${this.hass}
            .view=${n}
            .imageConfig=${this.imageConfig}
            .cameraConfig=${this.cameraConfig}
            .targetID=${l}
            .proxyConfig=${this._resolveProxyConfig(this.imageConfig?.proxy)??void 0}
            @advanced-camera-card:image-updating-player:error=${e=>f(this,{targetID:l,reason:e.detail})}
          >
          </advanced-camera-card-image-updating-player>
        `)}
    `)}static get styles(){return c(v)}};h([d({attribute:!1})],y.prototype,`hass`,void 0),h([d({attribute:!1})],y.prototype,`viewManagerEpoch`,void 0),h([d({attribute:!1})],y.prototype,`cameraConfig`,void 0),h([d({attribute:!1})],y.prototype,`cameraManager`,void 0),h([d({attribute:!1})],y.prototype,`imageConfig`,void 0),y=h([o(`advanced-camera-card-image`)],y);export{y as AdvancedCameraCardImage};