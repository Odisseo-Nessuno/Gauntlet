
var WI=window.innerWidth;
var HE=window.innerHeight;

var mappaProva=[[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,0,0,0,0,0,1],[1,0,0,0,1,0,0,0,0,0,0,1],[1,0,1,0,1,0,0,1,0,0,0,1],[1,0,1,0,0,0,0,1,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,0,1],[1,0,0,0,1,1,1,1,1,1,0,1],[1,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,1,1,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1]]

var mappa= new Terreno(mappaProva);
var arrayNemici=[];

var Wterr=(mappa.map.length)*32 		//stabilite caselle grandi 32 px
var Hterr=(mappa.map[1].length)*32+32
var giocatore=new Player(64,128,100);

var c=document.getElementById("mainG");
var a=document.getElementById("actors");

c.width=Wterr;		//horizontal resolution 
c.height=Hterr;		//vertical resolution 
a.width=Wterr;
a.height=Hterr;
var ctx = c.getContext("2d");
var actx=a.getContext("2d");

var debug=false;//variabili di debug
var debugP=false;

var noMove=false;

var terrImgs=[] 								// array che contiene tutte le immagini del terreno
var enImgs=[] 									// array che contiene tutte le immagini dei nemici

var mx=500,	my=500;

var nemicoProva= new Nemico(1,5,5);

var spostCol=false, col;	//la uso per alternare i passi dello sprite

//QUESTI due incantesimi sarebbe bello metterli in un file separato per pulizia

var splProva=new Spell("rallenta",[[0,1],[1,0],[-1,0],[0,-1]],function(n){
	n.syncStateChange=function(){
		this.speed*=2;
		this.syncStateChange=null;
	}
},15,"Nemico")

var splProva2 = new Spell("Teletrasporta",[[0,0]],function(){
	giocatore.syncStateChange=function(){
		var dx=0;
		var dy=0;
		do{
			dx=parseInt(parseInt((Math.random())*10).toFixed()%3)+parseInt(this.rx);
			dy=parseInt(parseInt((Math.random())*10).toFixed()%3)+parseInt(this.ry);
			console.log("dx e dy",dx,dy)
		}while((mappa.map[dy][dx]!=undefined) && (mappa.map[dy][dx]!=0))		//molto pericoloso
		this.rx=dx;
		this.ry=dy;
		this.x=dx*32
		this.y=dy*32
		this.syncStateChange=null;
	}
},200,"Player")

//

var spells=[];
spells.push(splProva);
spells.push(splProva2);
loadTImages();





function provaNemici(){
	for (var i=2;i<7; i++ )
		arrayNemici.push(new Nemico(1,i,6));
}


function drawRotatedImage2(image, x, y, row) { 
var TO_RADIANS = Math.PI/180; 
	actx.save(); 
	actx.translate(x, y);
	actx.drawImage(image,0,row,32,32,0,0,32,32);
	actx.restore(); 
}

// le due funzioni sono praticamente identiche. dato che ho messo il controllo di cambio immagine quando premo i tasti,
// quando muovevo l'hero si muovevano anche i teschi. quindi per ora ho diviso le due funzioni solo per evitare sbatti :)

//Vedere di risolvere la cosa qui :) 
function drawRotatedImage(image, x, y, row) { 
var TO_RADIANS = Math.PI/180; 
	actx.save(); 
	actx.translate(x, y);
	actx.drawImage(image,col,row,32,32,0,0,32,32);
	actx.restore();
}



function i_prova(){
	////console.log("ok... sono i prova")
	mappa.makeTerr();
	provaNemici();
	i_update();
}


function i_update(){
	actx.clearRect(0,0,Wterr,Hterr);
	giocatore.update();
	for(var i=0; i< arrayNemici.length; i++){
		if(arrayNemici[i].update()){
			arrayNemici[i]=null;
			arrayNemici.splice(i,1);
		}
	}

	requestAnimationFrame(i_update);
}


function loadTImages(){							// callback è la funzione da eseguire al verificarsi di una condizione. nel nostro caso quando si finisce di caricare tutte le immagini.
	var timg = ["imgs/prova.png","imgs/bw.jpg"];			//percorso delle immagini, notare che la poszione corrisponde alla "codifica" es: immagine in posizione 0 è il terreno libero, 
	for (var i=0; i< timg.length; i++){					// e nella mappa 0 significa terreno libero
		loadSingleImg(i,timg,loadEImages,0);			// faccio una nuova funzione perchè altrimenti al prossimo ciclo mi sovrascrive l'indice dell'immagine da caricare
	}
}
function loadEImages(callback){							// callback è la funzione da eseguire al verificarsi di una condizione. nel nostro caso quando si finisce di caricare tutte le immagini.
	var timg = ["imgs/hero.png","imgs/z.png"];								//percorso delle immagini, notare che la poszione corrisponde alla "codifica" es: immagine in posizione 0 è il terreno libero, 
	for (var i=0; i< timg.length; i++){					// e nella mappa 0 significa terreno libero
		loadSingleImg(i,timg,i_prova,1);					// faccio una nuova funzione perchè altrimenti al prossimo ciclo mi sovrascrive l'indice dell'immagine da caricare
	}
}

function loadSingleImg(i,timg,callback,type){		
		var nuovaimg = new Image();
		nuovaimg.src=timg[i];
		////console.log(timg[i]);
		nuovaimg.onload=function(){
			if (type==0){								//if elif servono per decidere in quale array mettere l'immagine caricata
				terrImgs.push(nuovaimg)
				var arrLen=terrImgs.length;
			}
			else if (type==1){
				enImgs.push(nuovaimg)
				var arrLen=enImgs.length;
			}
			////console.log(arrLen)
			if (timg.length==arrLen){					// se ho finito di caricare tutte le immagini procedo :)
				callback();								// in questo caso chiamerò sempre la funzione di init 
			}
			
		};
}


function Terreno(map){			//si assume map matrice
	this.map =map;

	this.makeTerr=function(){
		ctx.drawImage(terrImgs[1],0,0)
	}
}


function Player(x,y,h){
	this.x=x;
	this.y=y;
	this.direction=[]
	this.movingX=0;
	this.movingY=0;
	this.movingCounter=0;
	this.syncStateChange=null;
	this.health=h;
	this.bullets=[]
	this.rx=(x/32).toFixed();
	this.ry=(y/32).toFixed();


	this.referencePosition=function(nx,ny){
		return([parseInt((this.x+nx)/32).toFixed(), parseInt(((this.y+ny)/32).toFixed())] )
	}

	this.move=function(){
		var map=mappa.map
		if(noMove==false){
			var dir = aCasoBottoni(); //x,y   ---------> #°# <--------
			mx=my=0;

			var dx=parseInt(this.rx)+(dir[0])	//prossima posione di this
			var dy=parseInt(this.ry)+(dir[1])
						
			if(map[dy][dx]==0 && (dir[0]!=0 || dir[1]!=0)){
				noMove=true;
				this.movingCounter=16
				this.movingX=dir[0]*2;
				this.movingY=dir[1]*2;
				this.direction=dir;
			}
		}
		else{
			if(this.movingCounter>0){
				this.x+=this.movingX;
				this.y+=this.movingY;
				this.movingCounter-=1;
				document.getElementById("mainG").style.left=String(WI/2-this.x)+"px"
				document.getElementById("mainG").style.top=String(HE/2-this.y)+"px"
				document.getElementById("actors").style.left=String(WI/2-this.x)+"px"
				document.getElementById("actors").style.top=String(HE/2-this.y)+"px"
			}
			else{
				this.rx=((this.x -16)/32).toFixed();
				this.ry=((this.y -16)/32 ).toFixed();
				noMove=false;
				if(this.syncStateChange!=null)
					this.syncStateChange();

			}
			//console.log(noMove,this.movingX,this.movingY)
		}
	}


	this.createBullet=function(){
		console.log("newBullet")
		if(this.bullets.length==0){					//NOTA: magari in futuro si faranno più proiettili contemporaneamente... il codice è gia' pronto...
			var pro=new Bullet(null,this.x,this.y,this.direction)
			this.bullets.push(pro);
		}
	}

	this.draw=function(){
		if (debugP){
			actx.strokeStyle="pink";
			actx.strokeRect(this.rx*32-16,this.ry*32-16,30,30);
		}
		drawRotatedImage(enImgs[0],this.x-16,this.y-16,fromDirToRot2(this.direction));
	}
	this.print2=function(){
		console.log("2")
	}
	this.update=function(){
		this.move();
		for(var i = 0; i<this.bullets.length; i++){
			this.bullets[i].update();
			if(this.bullets[i].checkDestroyCondition()){
				this.bullets[i]=null;
				this.bullets.splice(i,1);
			}

		}
		spells.map(function(s){s.update()});
		this.draw();
	}


}



function Nemico(img,rx,ry){
	this.rx=rx;					// riferimento della casella
	this.ry=ry; 
	this.x=rx*32;
	this.y=ry*32;
	this.plannedR=[rx,ry]
	this.direzione=[0,0];
	this.isMoving=false;
	this.counter=0;
	this.speed=32;
	this.img=img;
	this.health=100;
	this.syncStateChange=null;

	this.draw=function(){
		if (debugP){
			actx.strokeStyle="green";
			actx.strokeRect((this.rx*32)-16,(this.ry*32)-16,32,32)
			actx.strokeStyle="yellow";
			actx.strokeRect((this.plannedR[0]*32)-10,(this.plannedR[1]*32)-10,20,20)			
		}
		drawRotatedImage2(enImgs[this.img],this.x-16,this.y-16,fromDirToRot2(this.direzione))	//dimsegno alle sue  x e y con rotazione data dalla direzione attuale
	} 

	this.scegliDirezione=function(){
		var returnDir=[0,0];
		var nrx = parseInt(this.rx);
		var nry = parseInt(this.ry);
		var grx=parseInt(giocatore.rx);
		var gry=parseInt(giocatore.ry);
		if(nrx<grx)
			returnDir[0]=1;
		else if(nrx>grx)
			returnDir[0]=-1
		if(nry<gry)
			returnDir[1]=1;
		else if(nry>gry)
			returnDir[1]=-1
		return returnDir;
	}

	this.move=function(){
		if(this.isMoving){
			this.counter -=1;
			this.x+=this.direzione[0]*(32/this.speed);
			this.y+=this.direzione[1]*(32/this.speed);
			if (this.counter==0){
				this.isMoving=false;
				if(this.syncStateChange!=null){
					this.syncStateChange();
				}
			}
			var newRef  = tabellizeCoords(this.x,this.y,32,32);
			this.rx=newRef[0];
			this.ry=newRef[1];
			
		}
		else{
			var newDir = this.scegliDirezione();
			if (  mappa.map[parseInt(this.ry)+newDir[1]] [parseInt(this.rx)+newDir[0]] ==0){
				mappa.map[this.ry][this.rx]=0;
				this.plannedR=[(parseInt(this.rx)+newDir[0]),(parseInt(this.ry)+newDir[1])]
				mappa.map[this.plannedR[1]][this.plannedR[0]]=2;
				this.isMoving=true;
				this.counter=this.speed;
				this.direzione=newDir;
			}
			else
				this.plannedR=[(parseInt(this.rx)),(parseInt(this.ry))]
		}
	}
	this.update=function(){
		this.move();
		this.draw();
		return this.checkDeath();		
	}
	this.hit=function(dmg){ 				//sottrae vita al nemico in base ai danni dati dal proiettili
		console.log("hit",this.health)
		this.health -=dmg;
	}
	this.checkDeath=function(){			//controlla se il nemico muore
		if(this.health<= 0){	
			mappa.map[this.ry][this.rx]=0;
			console.log(this.plannedR)
			mappa.map[this.plannedR[1]][this.plannedR[0]]=0;
			return true;	
		}
		return false;
	}	

}





function Bullet(img,x,y,dir){
	this.img=img;
	this.x =x;
	this.y=y;
	var rif =tabellizeCoords(this.x,this.y,8,8)
	this.rx=rif[0];
	this.ry=rif[1];		
	this.dirs=dir;
	this.damage=50;


	this.tabCoords=function(){
	var rif = tabellizeCoords(this.x,this.y,8,8)
	this.rx=rif[0];
	this.ry=rif[1];		
	}

	this.move=function(){
		this.x+=this.dirs[0]*5;
		this.y+=this.dirs[1]*5;
		this.tabCoords();			//aggiorno rx e ry
		console.log(this.rx,this.ry)
	}
	this.draw=function(){
		actx.fillStyle="red";
		actx.fillRect(this.x-4,this.y-4,8,8)
	}
	this.update=function(){
		this.move()
		this.draw();
	}
	this.checkDestroyCondition=function(){			//se incontra un muro (1) o un nemico (2) ritorna true per essere distrutto. 
		if(mappa.map[this.ry][this.rx]==1){
			return true;
		}
		if(mappa.map[this.ry][this.rx]==2){
			for(var i =0; i<arrayNemici.length; i++){
				var nrx = parseInt(arrayNemici[i].rx)
				var nry = parseInt(arrayNemici[i].ry)
				if (checkCollision(this.x,this.y,arrayNemici[i].x,arrayNemici[i].y,16,32)){
					arrayNemici[i].hit(this.damage);
					return true;
				}
			}
		}
		return false;
	}
}

function Spell(name,area,effetto,cooldown,at){
	this.nome=name;
	this.area=area;					//se area ==[0,0] -> lincantesimo è per il giocatore
	this.effetto=effetto;
	this.cooldown=cooldown;
	this.applyTo=at
	this.timeCounter=0;

	this.apply=function(x,y){
		if(this.applyTo=="Nemico"){
			var caselle=(this.area).map(function(a){return [x+a[0],y+a[1]]});
			console.log(caselle)
			var afflicted=arrayNemici.filter(function(n){			//nemici nell'area dell'incantsimo
				for(var i=0; i<caselle.length; i++){
					if(caselle[i][0]==n.rx && caselle[i][1]==n.ry)
						return true;
				}
				return false;
			})
			afflicted.map(this.effetto)
			this.timeCounter=this.cooldown;
			console.log(afflicted)
			//debug
			actx.fillStyle="blue"
			afflicted.map(function(i){actx.fillRect(i.x-16,i.y-16,32,32)})
		}
		else{
			this.effetto();
		}
	}

	this.update=function(){
		if (this.timeCounter==0 ){
			return true;
		}
		else{
			this.timeCounter -=1;
			return false;
		}
	}
}

//funzioni di pubblica utilità

function tabellizeCoords(x,y,w,h){			//ritorna coordinate sulla tabella partendo dalle x e y attuali
	return ([(((x-w/2)/32).toFixed()),( ((y-h/2)/32 ).toFixed() )]);
}


function checkCollision(ax,ay,bx,by,wa,wb){			//controlla se il quad con CENTRO in mx my avente l= wa interseca quello in sx sy wb
	var dx = castPositive(ax-bx);
	var dy = castPositive(ay-by);
	var distanzaCasoLimite=wa/2+wb/2;
	return(dx<distanzaCasoLimite && dy<distanzaCasoLimite)
}

function castPositive(a){
	if (a<0)
		return a*-1
	else
		return a
}

function fromDirToRot2(dir){	//dir x,y c.e: {-1 0 1}
	var ang=0;
	var f=0, b=96, dx=64, sx=32;
	var ndir = dir[0]+","+dir[1]
	switch (ndir){
		case '1,0':
			ang=dx;
		break;
		case '1,-1':
			ang=b;
		break;
		case '0,-1':
			ang=b;
		break;
		case '-1,-1':
			ang=b;
		break;
		case '-1,0':
			ang=sx;
		break;
		case '-1,1':
			ang=sx;
		break;
		case '0,1':
			ang=f;
		break;
		case '1,1':
			ang=dx;
		break;
		
		return ang;

	}
	return ang;
}

function fromDirToRot(dir){	//dir x,y c.e: {-1 0 1}
	var ang=0;
	var ndir = dir[0]+","+dir[1]
	switch (ndir){
		case '1,1':
			ang=45;
		break;
		case '1,-1':
			ang=315;
		break;
		case '0,1':
			ang=90;
		break;
		case '0,-1':
			ang=270;
		break;
		case '-1,1':
			ang=135;
		break;
		case '-1,0':
			ang=180;
		break;
		case '-1,-1':
			ang=230;
		break;					
		return ang;

	}

	return ang;

}

function go(e){
	var ch= String.fromCharCode(e.keyCode);
	//console.log(ch)
	var pd=[]				//proiettile direzione
	switch (ch){			//trovare soluzione intelligente
		case 'I':
			pd=[0,-1]
			giocatore.direction=pd;
			giocatore.createBullet();
			break;
		case 'U':
			if(splProva.timeCounter==0){
				splProva.apply(parseInt(giocatore.rx),parseInt(giocatore.ry))
			}
			break;		
		case 'Y':
			if(splProva2.timeCounter==0){
				splProva2.apply(parseInt(giocatore.rx),parseInt(giocatore.ry))
			}
			break;				
		case 'K':
			pd=[0,1]
			giocatore.direction=pd;
			giocatore.createBullet();		
			break;
		case 'L':
			pd=[1,0]
			giocatore.direction=pd;
			giocatore.createBullet();
			break;
		case 'J':
			pd=[-1,0]
			giocatore.direction=pd;
			giocatore.createBullet();
			break;									
		case 'S':
			my=1;
			break;
		case 'A':
			mx=-1;
			break;			
		case 'W':
			my=-1;
			break;
		case 'D':
			mx=1;
			break;			
		case 'U':
			document.getElementById("servo").style="z-index:2;";
			break;
		case 'I':
			document.getElementById("servo").style="z-index:0;";
			break;			
		case 'Q':
			console.log("Q");
			giocatore.createBullet();
			break;	
		console.log(document.getElementById("servo"))
	}
}

var d = {};
onkeydown = function(e) { d[e.which] = true; };
onkeyup = function(e) { d[e.which] = false; };

function newValue(a,b) {
    var n =  -(d[a] ? 1 : 0) + (d[b] ? 1 : 0);
    return n;
}

function aCasoBottoni(){
	var dx=newValue(65, 68);
	var dy=newValue(87, 83); 
	
	// l'if-else può essere spostato da "qualsiasi" parte
	
	if(spostCol){
		spostCol = false;
		col=0;
	}
	else{
		spostCol = true;
		col=32;
	};
	
	return [dx,dy]
}

function acasoMove(){
	var dx=0;
	var dy=0;
	if( mx>giocatore.x)
		dx=1;
	else if(mx<giocatore.x)
		dx=-1
	if (my>giocatore.y)
		dy=1;
	else if(my<giocatore.y)
		dy=-1;
	return [dx,dy]
}
