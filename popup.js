pc.script.attribute("popTime", "number", 1);

pc.script.create('popup', function (app) {
    // Creates a new Popup instance
    var Popup = function (entity) {
        this.entity = entity;
    };

    Popup.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.timer = 0;
            this.scale = 1;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if (this.timer > 0) {
                this.timer -= dt;
                this.scale = 1 - (this.timer / this.popTime);
            }
            
            this.entity.setLocalScale(this.scale, this.scale, this.scale);
        },
        
        onEnable: function () {
            // start scaling
            this.timer = this.popTime;
            
            // play sound effect
            this.entity.sound.play("pop");
        }
    };

    return Popup;
});