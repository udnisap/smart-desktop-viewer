pc.script.attribute("selectionTime", "number", 3);
pc.script.attribute("range", "number", 100);

pc.script.create('selectorcamera', function (app) {
    // Creates a new Camera instance
    var SelectorCamera = function (entity) {
        this.entity = entity;
    };

    SelectorCamera.prototype = {
        initialize: function () {
            app.on("selectorcamera:add", this.addItem, this);
            app.on("selectorcamera:remove", this.removeItem, this);
            
            this._current = null;
            this._selected = null;
            this._items = [];
            this._spheres = [];
            this._ray = new pc.Ray();
            this._timer = 0;
        },
        

        update: function (dt) {
            this._ray.origin.copy(this.entity.getPosition());
            this._ray.direction.copy(this.entity.forward).scale(this.range);
            
            var selected = null;
            for (var i = 0, n = this._items.length; i < n; i++) {
                var item = this._items[i];
                // test against aabb
                var result = this._spheres[i].intersectRay(this._ray);
                if (result) {
                    selected = item;
                    if (item !== this._current) {
                        if (this._current) {
                            this._current.fire("selectorcamera:unhover");
                            app.fire("selectorcamera:unhover", this._current);
                        }
                            
                        item.fire("selectorcamera:hover");
                        app.fire("selectorcamera:hover", item);
                        this._current = item;
                        this._selected = null;
                        this._timer = 0;
                    } else if (!this._selected) {
                        this._timer += dt;
                        item.fire("selectorcamera:selectionprogress", (this._timer / this.selectionTime));
                        app.fire("selectorcamera:selectionprogress", (this._timer / this.selectionTime));
                        if (this._timer > this.selectionTime) {
                            item.fire("selectorcamera:select");
                            app.fire("selectorcamera:select", item);
                            this._selected = item;
                        }
                    }                       
                }
            }
            if (this._current && !selected) {
                this._current.fire("selectorcamera:unhover");
                app.fire("selectorcamera:unhover", this._current);
                this._current = null;
                this._selected = null;
                this._timer = 0;
            }
        },
        
        addItem: function (e, sphere) {
            if (e.model) {
                this._items.push(e);
                this._spheres.push(sphere);
            }
        },
        
        removeItem: function (e) {
            var i = this._items.indexOf(e);
            if (i >= 0) {
                this._items.splice(i, 1);
                this._spheres.splice(i, 1);
            }
        }
    };

    return SelectorCamera;
});