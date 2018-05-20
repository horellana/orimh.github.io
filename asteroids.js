class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this._set_event_listeners();

        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;

        this.rotation = 0;
        this.speed = -10;
        this.rotation_speed = 10;

        this.img = new Image();
        this.img.src = "static/player.png";
    }

    dx() {
        return Math.round(-1 * this.speed * Math.sin(this.rotation * Math.PI / 180));
    }

    dy() {
        return Math.round(this.speed * Math.cos(this.rotation * Math.PI / 180));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(this.img, 0, 0);
        ctx.stroke();
        ctx.restore();
    }

    _set_event_listeners() {
        window.addEventListener("keypress", (event) => {
            const keyName = event.key;

            switch (keyName) {
            case "ArrowUp":
                this.y = this.y + this.dy();
                this.x = this.x + this.dx();
                break;
            case "ArrowLeft":
                this.rotation = this.rotation - this.rotation_speed;
                break;
            case "ArrowRight":
                this.rotation = this.rotation + this.rotation_speed;
                break;
            }
        });
    }
};

window.addEventListener("load", () => {
    const canvas = document.getElementById('canvas');
    const player = new Player(canvas);

    const game_loop = () => {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "White";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        player.draw(ctx);
        ctx.stroke();
    };

    window.setInterval(game_loop, 10);

    window.setInterval(() => {
        document.getElementById('rotation').innerHTML = player.rotation;
        document.getElementById('dx').innerHTML = player.dx();
        document.getElementById('dy').innerHTML = player.dy();
    });
});
