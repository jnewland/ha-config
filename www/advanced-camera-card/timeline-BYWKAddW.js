import{Fo as e,Mo as t,No as n,Ro as r,U as i,jo as a,pt as o}from"./shared-DKvQuQy0.js";import"./timeline-core-ZyXv7wkI.js";var s=class extends n{render(){return this.timelineConfig?e`
      <advanced-camera-card-timeline-core
        .hass=${this.hass}
        .viewManagerEpoch=${this.viewManagerEpoch}
        .timelineConfig=${this.timelineConfig}
        .thumbnailConfig=${this.timelineConfig.controls.thumbnails}
        .cameraManager=${this.cameraManager}
        .foldersManager=${this.foldersManager}
        .conditionStateManager=${this.conditionStateManager}
        .viewItemManager=${this.viewItemManager}
        .cardWideConfig=${this.cardWideConfig}
        .itemClickAction=${this.timelineConfig.controls.thumbnails.mode===`none`?`play`:`select`}
      >
      </advanced-camera-card-timeline-core>
    `:e``}static get styles(){return r(i)}};o([a({attribute:!1})],s.prototype,`hass`,void 0),o([a({attribute:!1})],s.prototype,`viewManagerEpoch`,void 0),o([a({attribute:!1})],s.prototype,`timelineConfig`,void 0),o([a({attribute:!1})],s.prototype,`cameraManager`,void 0),o([a({attribute:!1})],s.prototype,`foldersManager`,void 0),o([a({attribute:!1})],s.prototype,`conditionStateManager`,void 0),o([a({attribute:!1})],s.prototype,`viewItemManager`,void 0),o([a({attribute:!1})],s.prototype,`cardWideConfig`,void 0),s=o([t(`advanced-camera-card-timeline`)],s);export{s as AdvancedCameraCardTimeline};