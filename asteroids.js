const random_integer = (start, end) => {
    return Math.floor(Math.random() * end + start);
};

const infinite_movement = (obj) => {
    if (obj.x > obj.canvas.width) {
        obj.x = 0;
    }

    if (obj.x < 0) {
        obj.x = obj.canvas.width;
    }

    if  (obj.y < 0) {
        obj.y = obj.canvas.height;
    }

    if (obj.y > obj.canvas.height) {
        obj.y = 0;
    }
};

const load_asteroids = (canvas) => {
    const n = random_integer(5, 10);
    return Array.from({length: n}, (v, i) => {
        const x = random_integer(0, canvas.width);
        const y = random_integer(0, canvas.height);
        return new Asteroid(canvas, x, y);
    });
};

class Asteroid {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this._load_img();

        this.x = x;
        this.y = y;

        this.dx = random_integer(-5, 10);
        this.dy = random_integer(-5, 10);
    }

    _load_img() {
        const index = random_integer(1, 3);
        this.img = new Image();
        this.img.src = `static/asteroid_${index}.png`;
    }

    draw() {
        const ctx = this.canvas.getContext("2d");
        ctx.drawImage(this.img, this.x, this.y);
    }

    move() {
        this.x = this.x + this.dx;
        this.y = this.y + this.dy;


    }
}

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
        ctx.drawImage(this.img, 0, 0, 50, 50);
        ctx.restore();
    }

    _set_event_listeners() {
        window.addEventListener("keydown", (event) => {
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

    let asteroids = load_asteroids(canvas);

    const game_loop = () => {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "White";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        player.draw(ctx);

        infinite_movement(player);

        for (let bullet of player.bullets) {
            if (bullet.outside_canvas()) {
                continue;
            }

            bullet.draw();
            bullet.move();
            infinite_movement(bullet);
        }

        for (let asteroid of asteroids) {
            asteroid.draw();
            asteroid.move();
            infinite_movement(asteroid);
        }

        ctx.stroke();
    };

    window.setInterval(game_loop, 20);

    window.setInterval(() => {
        document.getElementById('rotation').innerHTML = player.rotation;
        document.getElementById('dx').innerHTML = player.dx();
        document.getElementById('dy').innerHTML = player.dy();
        document.getElementById('bullets').innerHTML = player.bullets.length;
        document.getElementById('asteroids').innerHTML = asteroids.length;
    }, 500);
});
