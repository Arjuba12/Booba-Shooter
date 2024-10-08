console.log(gsap)
const canvas = document.querySelector("canvas");
const startGame = document.querySelector("#start-button")
const menuEl = document.querySelector("#menuEl")
const bigScoreEl = document.querySelector("#big-score-el")
const bgm = document.querySelector("#bgm")
const impactSfx = document.querySelector("#impac-sfx")
const fireSfx = document.querySelector("#fire-sfx")
const c = canvas.getContext("2d");


canvas.width = innerWidth;
canvas.height = innerHeight;
bgm.volume = 0.6;
const scoreEl = document.querySelector('#score-el')

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }

}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }

}

const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 15, "white");
let projectiles = [];
let enemies = [];
let particles = [];

function init(){
   player = new Player(x, y, 15, "white");
   projectiles = [];
   enemies = [];
   particles = [];
   score = 0;
   bigScoreEl.innerHTML = score;
   scoreEl.innerHTML = score;

}

function spawnEnemies() {
  setInterval(()=>{
    const radius = Math.random() * (60 - 10) + 10;

    let x
    let y 

    if (Math.random() < 0.5){
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(
      canvas.height / 2 - y,
      canvas.width / 2 - x
    )
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
    console.log('Enemy Spotted');
  }, 1000);
}

let animationId;
let score = 0;

function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0){
      particles.splice(index,1);
    } else{
      particle.update();
    }
  })
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height)
    {
      setTimeout(() =>{
        projectiles.splice(index, 1);
      },0);
    }

  });

  enemies.forEach((enemy, index) => {
    enemy.update();

    const dist =  Math.hypot(player.x - enemy.x,
      player.y - enemy.y);
    // Game Over
    if (dist - enemy.radius - player.radius < 1){
      cancelAnimationFrame(animationId);
      menuEl.style.display = 'flex';
      bigScoreEl.innerHTML = score;
      bgm.pause();
      bgm.currentTime = 0;
    }

    projectiles.forEach((projectile, projectileIndex) => {
     const dist =  Math.hypot(projectile.x - enemy.x,
         projectile.y - enemy.y);

      // projectile colide enemy
      if (dist - enemy.radius - projectile.radius < 1){
        impactSfx.currentTime = 0;
        impactSfx.play();

      // manambahkan score
        score += 10;
        scoreEl.innerHTML = score;
        
        // Efek ledakan
        for(let i = 0; i < enemy.radius * 2; i++){
              particles.push(new Particle(projectile.x, projectile.y,
              Math.random() * 2, enemy.color, 
              {
                x: Math.random() - 0.5 * (Math.random() * 6),
                y: Math.random() - 0.5 * (Math.random() * 6)
              }
          ));

        }

        if(enemy.radius - 10 > 10){

          gsap.to(enemy, {
            radius: enemy.radius - 10
          });

          setTimeout(() =>{
            projectiles.splice(projectileIndex, 1);
          }, 0)

        } else{
          // musuh dimusnahkan
          score += 50;
          scoreEl.innerHTML = score;
          setTimeout(() =>{
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
            console.log('musuh')
          }, 0)
        }
      }
    })
  })
}

canvas.addEventListener("click", (event) => {
  fireSfx.currentTime = 0;
  fireSfx.play();
  console.log(projectiles);
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  )
  const velocity = {
    x: Math.cos(angle) * 3,
    y: Math.sin(angle) * 3
  }
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2,
       5, 'white', velocity
    )
  )
});

startGame.addEventListener("click", () =>{
  init();
  animate();
  bgm.play();
  
  menuEl.style.display = 'none';
})

spawnEnemies();
console.log(player);
