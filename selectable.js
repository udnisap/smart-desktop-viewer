pc.script.create('selectable', function (app) {
    var tmp = new pc.Vec3();
    
    // Creates a new Selectable instance
    var Selectable = function (entity) {
        this.entity = entity;
    };

    Selectable.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this._sphere = new pc.BoundingSphere(this.entity.getPosition().clone(), 2);
            app.fire("selectorcamera:add", this.entity, this._sphere);
            
            this.STEP_MOVE = 0.01;
            this.STEP_SCALE = 0.01;
            
            this.isSelected = false;

            this.entity.on("selectorcamera:hover", this.onHover, this);
            this.entity.on("selectorcamera:unhover", this.onUnhover, this);
//             this.entity.on("selectorcamera:selectionprogress", this.onSelectionProgress, this);
//             this.entity.on("selectorcamera:select", this.onSelect, this);            
        },
        
        move: function(x, y) {
            if (x){
               this.entity.translateLocal(0, x * this.STEP_MOVE, 0 );     
            }else if (y){
               this.entity.translateLocal(y * this.STEP_MOVE,0 , 0 );     
            }
           
        },
        
        scale: function(val){
            var current = this.entity.getLocalScale().data;
            this.entity.setLocalScale(current[0] * val, current[1] * val, current[2] * val);                
        },
        
        update: function (dt) {
            if (this.isSelected){
                if (app.keyboard.isPressed(pc.KEY_W)) {
                    this.move(1, 0);
                }
                
                if (app.keyboard.isPressed(pc.KEY_S)) {
                    this.move(-1, 0);
                }
                
                if (app.keyboard.isPressed(pc.KEY_D)) {
                    this.move(0, 1);
                }
                
                if (app.keyboard.isPressed(pc.KEY_D)) {
                    this.move(0, -1);
                }
                
                if (app.keyboard.isPressed(pc.KEY_Z)) {
                    console.log('scaling', this);
                    this.scale((1+this.STEP_SCALE));
                }
                
                if (app.keyboard.isPressed(pc.KEY_X)) {
                    console.log('scaling', this);
                    this.scale(1-this.STEP_SCALE);
                }
            }
        },
        
        onHover: function () {
            console.log('selected', this.entity);
            this.isSelected = true;
        },
        
        onUnhover: function () {
            console.log('un selected', this.entity);
            this.isSelected = false;
        }
        
//         onSelect: function () {
//         },
        
//         onSelectionProgress: function (progress) {
//         }        
    };

    return Selectable;
});