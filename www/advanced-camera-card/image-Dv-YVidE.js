import{Do as e,Eo as t,Fo as n,Mo as r,No as i,Ro as a,U as o,c as s,jo as c,pt as l}from"./shared-DKvQuQy0.js";import"./image-updating-player-DQiYfBf0.js";var u=class extends i{constructor(...e){super(...e),this._refImage=t()}async getMediaPlayerController(){return await this.updateComplete,await this._refImage.value?.getMediaPlayerController()??null}render(){let t=this.camera?.getConfig();if(!(!this.hass||!t))return n`
      <advanced-camera-card-image-updating-player
        ${e(this._refImage)}
        .hass=${this.hass}
        .imageConfig=${t.image}
        .cameraConfig=${t}
        .targetID=${this.targetID}
        .cameraTitle=${this.cameraTitle}
        .proxyConfig=${this.camera?.getLiveProxyConfig()}
        @advanced-camera-card:image-updating-player:error=${e=>s(this,{reason:e.detail})}
      >
      </advanced-camera-card-image-updating-player>
    `}static get styles(){return a(o)}};l([c({attribute:!1})],u.prototype,`hass`,void 0),l([c({attribute:!1})],u.prototype,`camera`,void 0),l([c({attribute:!1})],u.prototype,`targetID`,void 0),l([c({attribute:!1})],u.prototype,`cameraTitle`,void 0),u=l([r(`advanced-camera-card-live-image`)],u);export{u as AdvancedCameraCardLiveImage};