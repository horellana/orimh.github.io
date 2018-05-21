const random_integer = (start, end) => {
    return Math.floor(Math.random() * end + start);
};

const infinite_movement = (obj) => {
    if (obj.x > obj.canvas.width + 20) {
        obj.x = 0;
    }

    if (obj.x < 0 - 150) {
        obj.x = obj.canvas.width;
    }

    if  (obj.y < 0 - 150) {
        obj.y = obj.canvas.height;
    }

    if (obj.y > obj.canvas.height + 20) {
        obj.y = 0;
    }
};

const collision = (a, b) => {
    const dist_x = a.x - b.x;
    const dist_y = a.y - b.y;
    const dist = Math.sqrt((dist_x * dist_x) + (dist_y * dist_y));
    return dist <= (a.r + b.r);
};

const load_asteroids = (canvas) => {
    const n = random_integer(5, 20);
    return Array.from({length: n}, (v, i) => {
        const x = random_integer(0, canvas.width);
        const y = random_integer(0, canvas.height);
        return new Asteroid(canvas, x, y);
    });
};

const calculate_dx = (rotation, speed) => {
    return Math.round(speed * Math.sin(rotation * Math.PI / 180));
};

const calculate_dy = (rotation, speed) => {
    return Math.round(-1 * speed * Math.cos(rotation * Math.PI / 180));
};

const decelerate = (obj, dv) => {
    window.setInterval(() => {
        if (obj.speed > 0) {
            obj.speed = obj.speed - dv;
        }

        if (obj.speed < 0) {
            obj.speed = 0;
        }
    }, 500);
};

class Asteroid {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this._load_img();

        this.x = x;
        this.y = y;

        this.dx = random_integer(-5, 10);
        this.dy = random_integer(-5, 10);

        this.collided = false;
        this.size = random_integer(1, 3);

        this.r = this.size * 25;
    }

    _draw_size() {
        switch(this.size) {
        case 1:
            return 50;
        case 2:
            return 100;
        case 3:
            return 200;
        default:
            return 250;
        }
    }

    _load_img() {
        const index = random_integer(1, 6);
        this.img = new Image();
        this.img.src = `static/asteroid_${index}.png`;
    }

    draw() {
        const ctx = this.canvas.getContext("2d");
        ctx.drawImage(this.img, this.x, this.y, this._draw_size(), this._draw_size());
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

        this.r = 5;

        this.rotation = rotation;
        this.img = new Image();
        this.img.src = "static/bullet.png";

        this.collided = false;

        this.start_time = new Date();

        window.setInterval(() => {
            const end_time = new Date();
            const elapsed_seconds = Math.round((end_time - this.start_time) / 1000);

            if (elapsed_seconds > 1) {
                this.collided = true;
            }

        }, 1000);
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
        ctx.drawImage(this.img, 0, 0, 50, 50);
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

        this.speed = 0;
        this.max_speed = 10;
        this.acceleration = 2;

        this.rotation_speed = 10;

        this.img = new Image();
        this.img.src = "static/player.png";
    }

    dx() {
        return calculate_dx(this.rotation, this.speed);
    }

    dy() {
        return calculate_dy(this.rotation, this.speed);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(this.img, 0, 0, 50, 50);
        ctx.restore();
    }

    move() {
        this.y = this.y + this.dy();
        this.x = this.x + this.dx();
    }

    _set_event_listeners() {
        decelerate(this, 2);

        window.addEventListener("keydown", (event) => {
            const keyName = event.key;

            switch (keyName) {
            case "ArrowUp":
                if (this.speed < this.max_speed) {
                    this.speed = this.speed + this.acceleration;
                }
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
    const draw_loop_interval = 20;
    const move_loop_interval = 20;
    const delete_objects_interval = 100;
    const update_info_interval = 500;
    const collision_detection_interval = 100;

    const canvas = document.getElementById('canvas');

    const player = new Player(canvas);
    let asteroids = load_asteroids(canvas);
    let bullets = new Array();

    window.addEventListener("keydown", (event) => {
        // 32 <=> Tecla espacio
        if (event.keyCode != 32) {
            return;
        }
        const bullet = new Bullet(canvas,
                                  player.x, player.y,
                                  calculate_dx(player.rotation, 10), calculate_dy(player.rotation, 10),
                                  player.rotation);
        bullets.push(bullet);
    });

    window.setInterval(() => {
        for (let b of bullets) {
            for (let a of asteroids) {
                if (collision(b, a)) {
                    a.collided = true;
                    b.collided = true;
                }
            }
        }
    }, collision_detection_interval);

    window.setInterval(() => {
        bullets = bullets.filter((bullet) => !bullet.collided);
        asteroids = asteroids.filter((asteroid) => !asteroid.collided);
    }, delete_objects_interval);

    window.setInterval(() => {
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "White";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        player.draw(ctx);

        for (let bullet of bullets) {
            bullet.draw();
        }

        for (let asteroid of asteroids) {
            asteroid.draw();
        }

        ctx.stroke();
    }, draw_loop_interval);

    window.setInterval(() => {
        player.move();
        infinite_movement(player);

        for (let bullet of bullets) {
            bullet.move();
            infinite_movement(bullet);
        }

        for (let asteroid of asteroids) {
            asteroid.move();
            infinite_movement(asteroid);
        }
    }, move_loop_interval);

    window.setInterval(() => {
        document.getElementById('speed').innerHTML = player.speed;
        document.getElementById('rotation').innerHTML = player.rotation;
        document.getElementById('dx').innerHTML = player.dx();
        document.getElementById('dy').innerHTML = player.dy();
        document.getElementById('bullets').innerHTML = bullets.length;
        document.getElementById('asteroids').innerHTML = asteroids.length;
    }, update_info_interval);
});
