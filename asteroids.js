class Bullet {
    constructor(canvas, x, y, dx, dy, rotation) {
        this.canvas = canvas;

        this.x = x;
        this.y = y;

        this.dx = dx;
        this.dy = dy;

        this.rotation = rotation;
        this.img = new Image();
        this.img.src = "static/bullet.png";
    }

    outside_canvas() {
        return this.x > canvas.width || this.x < 0
            || this.y > canvas.height || this.y < 0;
    }

    move() {
        this.x = this.x + this.dx;
        this.y = this.y + this.dy;
    }

    draw() {
        const ctx = this.canvas.getContext("2d");

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(this.img, 0, 0);
        ctx.restore();
    }
}

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

        this.bullets = new Array();
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

        window.addEventListener("keydown", (event) => {
            // 32 <=> Tecla espacio
            if (event.keyCode != 32) {
                return;
            }
            const bullet = new Bullet(this.canvas, this.x, this.y, this.dx(), this.dy(), this.rotation);
            this.bullets.push(bullet);
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

        for (let bullet of player.bullets) {
            if (bullet.outside_canvas()) {
                continue;
            }

            bullet.draw();
            bullet.move();
        }

        ctx.stroke();
    };

    window.setInterval(game_loop, 10);

    window.setInterval(() => {
        document.getElementById('rotation').innerHTML = player.rotation;
        document.getElementById('dx').innerHTML = player.dx();
        document.getElementById('dy').innerHTML = player.dy();
    });
});
