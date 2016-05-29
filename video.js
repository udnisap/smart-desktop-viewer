pc.script.create('video_texture', function (app) {
    
    // Creates a new Video_texture instance
    var Video_texture = function (entity) {
        this.entity = entity;
        this.videoTexture = null;
    };

    Video_texture.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
             
            
//             if (app.touch){
//                 app.touch.on("touchstart", function(){
//                     this.video.play();
//                 }, this);
//             }
            app.on("stream", this.onStream, this);
            
            this.ready = false;
            
        },
        
        setupVideo: function(url){
          // Create a texture to hold the video frame data            
            var videoTexture = new pc.Texture(app.graphicsDevice, {
                format: pc.PIXELFORMAT_R5_G6_B5,
                autoMipmap: false
            });
            videoTexture.minFilter = pc.FILTER_LINEAR;
            videoTexture.magFilter = pc.FILTER_LINEAR;
            videoTexture.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
            videoTexture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
    
            // Create HTML Video Element to play the video
            var video = document.createElement('video');
            video.addEventListener('canplay', function (e) {
                videoTexture.setSource(video);
            });
            video.src = url;
            video.crossOrigin = 'anonymous';
            video.loop = true;
            video.play();
            this.video = video;
    
            var material = this.entity.model.material;
            material.emissiveMap = videoTexture;
            material.update();
            
            this.videoTexture = videoTexture;  
            this.ready = true;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.ready){
               this.videoTexture.upload(); 
            }
        },
        
        onStream: function(name, stream){
            if (name === this.entity.name){
                var url = URL.createObjectURL(stream);
                this.setupVideo(url);
                console.info('streaming received to', this.entity.name);    
            }
        }
        
    };

    return Video_texture;
});