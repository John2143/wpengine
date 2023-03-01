class PetalList{
    constructor(canvas){
        this.petals = [];
        this.canvas = canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.ctx = canvas.getContext("2d");
    }
    addPetal(p){
        this.petals.push(p);
    }
    clear(){
        if(this.petals.length > 0) this.petals = [];
    }
    tick(t){
        for(let petal of this.petals){
            petal.tick(t);
        }
    }
    draw(t){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for(let petal of this.petals){
            petal.draw(this.canvas, this.ctx, t);
        }
        this.ctx.globalAlpha = 1
    }
}

const lerp = (val, min, max, outmin, outmax) => {
    if(val >= max) return outmax;
    if(val <= min) return outmin;
    return ((val - min) / (max - min)) * outmax + outmin;
}


let petalImg;

const spawnDelay = 1000;
const targetPetals = 100;
const overallSlow = 2;
//Age in ms
const MAXAGE = targetPetals * spawnDelay;
//20px by 20px @ 1080
const size = 20 * (window.innerWidth / 1920)
//slow side to side movement
const ageFactor = 20000;

class Petal{
    constructor(petalList){
        this.startx = (Math.random() * .8 + .1) * window.innerWidth;
        this.randomOffset = (Math.random() * ageFactor);
        this.y = 0;

        this.alpha = Math.random();
        this.angle = (Math.random() * .5 - .5);

        this.petalList = petalList;
        petalList.addPetal(this);

        if(petalList.petals.length > targetPetals - 5){
            //Place high up
            this.preAge = Math.random() * MAXAGE / 10;
        }else{
            //Place randomly
            this.preAge = Math.random() * MAXAGE;
        }

        this.dialation = Math.random() * .3 + 1;
    }

    remove(){
        this.petalList.petals.splice(this.petalList.petals.indexOf(this), 1);
    }

    tick(t){
        if(!this.t) this.t = t;
        let age = this.age = (t - this.t) * this.dialation + this.preAge;

        this.x = this.startx + Math.sin(age / ageFactor + this.randomOffset) * 500;
        this.y = (age / MAXAGE) * (window.innerHeight + size*2) - size;

        if(age > MAXAGE){
            this.remove();
        }
    }

    draw(canvas, ctx, t){
        ctx.globalAlpha = lerp(this.age - this.preAge, 0, 2000, 0, this.alpha);
        ctx.drawImage(petalImg, this.x, this.y, size, size);
    }
}

function load(){
    let petalList = new PetalList(document.getElementById("can"));
    petalImg = document.getElementById("petal");

    setInterval(() => {
        if(document.visibilityState !== "visible"){
            petalList.clear();
        }else{
            while(petalList.petals.length < targetPetals) new Petal(petalList);
        }
    }, spawnDelay);

    window.requestAnimationFrame(function step(time){
        missedAnimationFrames = 0;
        petalList.tick(time);
        petalList.draw();

        window.requestAnimationFrame(step);
    });
};

setTimeout(load, 300);
