import{Ct as e,Do as t,Eo as n,Fo as r,Lo as i,M as a,Mo as o,No as s,Oo as c,Pn as l,Po as u,Ro as d,St as f,Tt as p,a as m,c as h,d as g,f as _,jo as v,l as y,mr as b,pt as x,s as S,w as C,wt as w}from"./shared-DKvQuQy0.js";var T=`advanced-camera-card:ha-camera-stream:mute-change`,E=e=>{if(!(e instanceof CustomEvent))return!1;let t=e.detail;return typeof t==`object`&&!!t&&`muted`in t&&typeof t.muted==`boolean`},D=class{constructor(e,t){this._intendedMute=!0,this._outputMute=!0,this._cameraEntityID=null,this._muteChangeHandler=e=>{if(!E(e))return;let t=e.detail.muted,n=!1;t!==this._outputMute&&(this._outputMute=t,n=!0),this._intendedMute&&!t&&(this._intendedMute=!1,n=!0),n&&this._host.requestUpdate()},this._host=e,this._options=t,e.addController(this)}getIntendedMute(){return this._intendedMute}getOutputMute(){return this._outputMute}hostConnected(){this._host.addEventListener(T,this._muteChangeHandler)}hostDisconnected(){this._host.removeEventListener(T,this._muteChangeHandler)}hostUpdate(){let e=this._options.getCameraEntityID();e!==this._cameraEntityID&&(this._cameraEntityID=e,this._intendedMute=!this._options.getPreferAudioStream(),this._outputMute=!0)}};customElements.whenDefined(`ha-web-rtc-player`).then(()=>{let t=customElements.get(`ha-web-rtc-player`);class n extends t{constructor(...e){super(...e),this._mediaPlayerController=new S(this,()=>this._videoEl,()=>this.controls),this._mediaLoadedInfoSourceController=new C(this,{getTargetID:()=>this.targetID??null}),this._audioTracksMuteStateCleanup=null,this._lastErrored=!1,this._addTrack=async e=>{this._remoteStream&&(this._remoteStream.addTrack(e.track),this.hasUpdated||await this.updateComplete,this._videoEl.srcObject=this._remoteStream)}}async getMediaPlayerController(){return this._mediaPlayerController}async _startWebRtc(){await super._startWebRtc(),this.isConnected||this._cleanUp()}render(){return this._error?a({title:b(`issues.media_unavailable.reasons.playback_error`),detail:this._error,targetTitle:this.entityid}):r`
        <video
          id="remote-stream"
          ?autoplay=${this.autoPlay}
          .muted=${this.muted}
          ?playsinline=${this.playsInline}
          ?controls=${this.controls}
          poster=${c(this.posterUrl)}
          @loadedmetadata=${()=>{this.controls&&y(this._videoEl,2)}}
          @loadeddata=${e=>this._loadedDataHandler(e)}
          @volumechange=${()=>p(this)}
          @play=${()=>w(this)}
          @pause=${()=>e(this)}
        ></video>
      `}updated(e){e.has(`entityid`)&&(this._lastErrored=!1),super.updated(e);let t=!!this._error;t&&!this._lastErrored&&h(this,{description:this._error}),this._lastErrored=t}_loadedDataHandler(e){super._loadedData();let t=f(e,{mediaPlayerController:this._mediaPlayerController,capabilities:{supportsPause:!0,hasAudio:_(this._videoEl,{pc:this._peerConnection})},technology:[`webrtc`]});t&&this._mediaLoadedInfoSourceController.set(t),this._audioTracksMuteStateCleanup?.(),this._audioTracksMuteStateCleanup=g(this._peerConnection??null,()=>{let e=f(this._videoEl,{mediaPlayerController:this._mediaPlayerController,capabilities:{supportsPause:!0,hasAudio:_(this._videoEl,{pc:this._peerConnection})},technology:[`webrtc`]});e&&this._mediaLoadedInfoSourceController.set(e)})}_cleanUp(){super._cleanUp(),this._audioTracksMuteStateCleanup?.(),this._audioTracksMuteStateCleanup=null}static get styles(){return[super.styles,d(m),i`
          :host {
            width: 100%;
            height: 100%;
          }
          video {
            width: 100%;
            height: 100%;
          }
        `]}}x([v({attribute:!1})],n.prototype,`targetID`,void 0),customElements.define(`advanced-camera-card-ha-web-rtc-player`,n)}),customElements.whenDefined(`ha-camera-stream`).then(()=>{let e=e=>e.attributes.access_token?`/api/camera_proxy_stream/${e.entity_id}?token=${e.attributes.access_token}`:void 0,t=`web_rtc`,n=`mjpeg`,a=customElements.get(`ha-camera-stream`);class o extends a{constructor(){super(),this._mediaLoadedInfoPerStream={},this._mediaLoadedInfoSourceController=new C(this,{getTargetID:()=>this.targetID??null}),this._errorPerStream={},this._visibleStreamType=null,this.outputMute=!0,this._volumeChangeHandler=()=>{let e=this._getVisibleMediaLoadedInfo()?.mediaPlayerController?.isMuted()??!0;this.dispatchEvent(new CustomEvent(T,{detail:{muted:e},bubbles:!0,composed:!0}))},this.addEventListener(`advanced-camera-card:media:volumechange`,this._volumeChangeHandler)}async getMediaPlayerController(){return await this.updateComplete,this._getVisibleMediaLoadedInfo()?.mediaPlayerController??null}_getVisibleMediaLoadedInfo(){return this._visibleStreamType?this._mediaLoadedInfoPerStream[this._visibleStreamType]??null:null}_captureInnerLoad(e,t){t.stopPropagation(),this._mediaLoadedInfoPerStream[e]=t.detail.info,delete this._errorPerStream[e],l(t.detail.signal,()=>{this._mediaLoadedInfoPerStream[e]===t.detail.info&&delete this._mediaLoadedInfoPerStream[e]}),this.requestUpdate()}_captureInnerError(e,t){t.stopPropagation(),this._errorPerStream[e]={error:t.detail,dispatched:!1},this.requestUpdate()}_renderStream(i){if(!this.stateObj)return u;if(i.type===n){let t=this._connected===void 0||this._connected?e(this.stateObj):this._posterUrl;return t?r`
          <advanced-camera-card-image-player
            .targetID=${this.targetID}
            @advanced-camera-card:media:loaded=${e=>this._captureInnerLoad(n,e)}
            url=${t}
            technology="mjpeg"
            class="player"
          ></advanced-camera-card-image-player>
        `:u}return i.type===`hls`?r` <advanced-camera-card-ha-hls-player
          ?autoplay=${!1}
          playsinline
          .allowExoPlayer=${this.allowExoPlayer}
          .muted=${this.outputMute}
          .controls=${this.controls}
          .hass=${this.hass}
          .entityid=${this.stateObj.entity_id}
          .posterUrl=${this._posterUrl}
          .targetID=${this.targetID}
          @advanced-camera-card:media:loaded=${e=>this._captureInnerLoad(`hls`,e)}
          @advanced-camera-card:live:error=${e=>this._captureInnerError(`hls`,e)}
          @streams=${this._handleHlsStreams}
          class="player ${i.visible?``:`hidden`}"
        ></advanced-camera-card-ha-hls-player>`:i.type===t?r`<advanced-camera-card-ha-web-rtc-player
          ?autoplay=${!1}
          playsinline
          .muted=${this.outputMute}
          .controls=${this.controls}
          .hass=${this.hass}
          .entityid=${this.stateObj.entity_id}
          .posterUrl=${this._posterUrl}
          .targetID=${this.targetID}
          @advanced-camera-card:media:loaded=${e=>this._captureInnerLoad(t,e)}
          @advanced-camera-card:live:error=${e=>this._captureInnerError(t,e)}
          @streams=${this._handleWebRtcStreams}
          class="player ${i.visible?``:`hidden`}"
        ></advanced-camera-card-ha-web-rtc-player>`:u}updated(e){super.updated(e);let t=this._streams(this._capabilities?.frontend_stream_types,this._hlsStreams,this._webRtcStreams,this.muted).find(e=>e.visible)??null;this._visibleStreamType=t?.type??null;let n=this._getVisibleMediaLoadedInfo();n&&this._mediaLoadedInfoSourceController.set({...n,capabilities:{...n.capabilities,hasAudio:n.capabilities?.hasAudio||!!this._hlsStreams?.hasAudio||!!this._webRtcStreams?.hasAudio}}),this._discardErrorsOnEntityChange(e),this._dispatchVisibleStreamError()}_discardErrorsOnEntityChange(e){let t=e.get(`stateObj`);!t||t.entity_id===this.stateObj?.entity_id||(this._errorPerStream={})}_dispatchVisibleStreamError(){let e=this._visibleStreamType,t=e?this._errorPerStream[e]:null;!t||t.dispatched||(t.dispatched=!0,h(this,t.error))}static get styles(){return[super.styles,d(m),i`
          :host {
            width: 100%;
            height: 100%;
          }
          img {
            width: 100%;
            height: 100%;
          }
        `]}}x([v({attribute:!1})],o.prototype,`targetID`,void 0),x([v({attribute:!1})],o.prototype,`outputMute`,void 0),customElements.define(`advanced-camera-card-ha-camera-stream`,o)});var O=`:host{width:100%;height:100%;display:block}`,k=class extends s{constructor(...e){super(...e),this.controls=!1,this.preferAudioStream=!1,this._playerRef=n(),this._muteController=new D(this,{getCameraEntityID:()=>this.camera?.getConfig()?.camera_entity??null,getPreferAudioStream:()=>this.preferAudioStream})}async getMediaPlayerController(){return await this.updateComplete,await this._playerRef.value?.getMediaPlayerController()??null}render(){if(!this.hass)return;let e=this.camera?.getConfig()?.camera_entity;return r` <advanced-camera-card-ha-camera-stream
      ${t(this._playerRef)}
      .hass=${this.hass}
      .stateObj=${e?this.hass.states[e]:void 0}
      .controls=${this.controls}
      .targetID=${this.targetID}
      .muted=${this._muteController.getIntendedMute()}
      .outputMute=${this._muteController.getOutputMute()}
    >
    </advanced-camera-card-ha-camera-stream>`}static get styles(){return d(O)}};x([v({attribute:!1})],k.prototype,`hass`,void 0),x([v({attribute:!1})],k.prototype,`camera`,void 0),x([v({attribute:!1})],k.prototype,`targetID`,void 0),x([v({attribute:!0,type:Boolean})],k.prototype,`controls`,void 0),x([v({attribute:!1})],k.prototype,`preferAudioStream`,void 0),k=x([o(`advanced-camera-card-live-ha`)],k);export{k as AdvancedCameraCardLiveHA};