const draw = (ctx, obj, size) => {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rotation * Math.PI / 180);
    ctx.drawImage(obj.img, -obj.r, -obj.r, size, size);
    ctx.restore();
};

const draw_radius = (ctx, obj) => {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI);
    ctx.stroke();
};

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
    constructor(canvas, x, y, size=random_integer(1, 3), rotation=random_integer(0, 360)) {
        this.canvas = canvas;
        this._load_img();

        this.x = x;
        this.y = y;

        this.dx = random_integer(-5, 5);
        this.dy = random_integer(-5, 5);

        this.collided = false;
        this.size = size;

        this.r = this._draw_size() * 0.5;

        this.rotation = rotation;
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
        draw(ctx, this, this._draw_size());
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
        draw(ctx, this, 50);
    }
}

class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this._set_event_listeners();

        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;

        this.r = 25;
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

    draw() {
        const ctx = this.canvas.getContext("2d");
        draw(ctx, this, 50);
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

class FrameLimiter {
    constructor(max_fps) {
        this.frames_this_second = 0;
        this.total_frames = 0;
        this.max_fps = max_fps;
        this.start = new Date();
        this.second_start = new Date();
    }

    fps() {
        const end_time = new Date();
        const elapsed_seconds = (end_time - this.start) / 1000;
        return Math.round(this.total_frames / elapsed_seconds);
    }

    limit(f) {
        this.frames_this_second = this.frames_this_second + 1;

        const end_time = new Date();
        const elapsed_seconds = (end_time - this.second_start) / 1000;

        if (elapsed_seconds > 1) {
            this.second_start = end_time;
            this.total_frames = this.total_frames + this.frames_this_second;
            this.frames_this_second = 0;

            if (this.fps() >= this.max_fps) {
                return;
            }
        }

        f();
    }
}

window.addEventListener("load", () => {
    const draw_loop_interval = 15;
    const move_loop_interval = 20;
    const delete_objects_interval = 250;
    const update_info_interval = 500;
    const collision_detection_interval = 250;
    const kill_player_interval = 250;

    const canvas = document.getElementById('canvas');

    const player = new Player(canvas);
    let asteroids = load_asteroids(canvas);
    let bullets = new Array();
    let fps_limiter = new FrameLimiter(60);

    window.addEventListener("keydown", (event) => {
        switch (event.keyCode) {
        case 32:
            const bullet = new Bullet(canvas,
                                      player.x, player.y,
                                      calculate_dx(player.rotation, 10),
                                      calculate_dy(player.rotation, 10),
                                      player.rotation);
            bullets.push(bullet);
            break;
        case 82:
            asteroids = load_asteroids(canvas);
            break;
        }
    });

    window.setInterval(() => {
        for (const asteroid of asteroids) {
            if (!collision(player, asteroid)) {
                continue;
            }
        }
    }, kill_player_interval);

    window.setInterval(() => {
        for (let b of bullets) {
            for (let a of asteroids) {
                if (!collision(b, a)) {
                    continue;
                }

                a.collided = true;
                b.collided = true;

                if (a.size > 1) {
                    asteroids.push(new Asteroid(canvas, a.x, a.y, size=a.size - 1));
                    asteroids.push(new Asteroid(canvas, a.x, a.y, size=a.size - 1));
                }
            }
        }
    }, collision_detection_interval);

    window.setInterval(() => {
        bullets = bullets.filter((bullet) => !bullet.collided);
        asteroids = asteroids.filter((asteroid) => !asteroid.collided);
    }, delete_objects_interval);

    window.setInterval(() => {
        fps_limiter.limit(() => {
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "White";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "Black";
            ctx.font = '18px Cambria';
            ctx.fillText(`FPS: ${fps_limiter.fps()}`, 5, 20);
            ctx.fillText(`Asteroids: ${asteroids.length}`, 5, 35);
            ctx.stroke();

            for (const obj of (Array.concat([player], bullets, asteroids))) {
                obj.draw();
            }

            ctx.stroke();
        });
    }, draw_loop_interval);

    window.setInterval(() => {
        for (const obj of (Array.concat([player], bullets, asteroids))) {
            obj.move();
            infinite_movement(obj);
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
