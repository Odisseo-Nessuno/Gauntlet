
var WI=window.innerWidth;
var HE=window.innerHeight;






var mappaProva=[
				[1,1,1,1,1,1,1,1,1,1,1,1],
				[1,1,1,1,1,1,0,0,0,0,0,1],
				[1,0,0,0,1,0,0,0,0,0,0,1],
				[1,0,0,0,1,0,0,1,0,0,0,1],
				[1,0,0,0,0,0,0,1,0,0,0,1],
				[1,0,1,1,1,1,1,1,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,1],
				[1,0,0,0,0,0,0,0,0,0,0,1],
				[1,0,0,0,1,1,1,0,0,0,0,1],
				[1,0,0,0,1,0,1,0,0,0,0,1],
				[1,0,0,1,1,0,0,0,0,0,0,1],
				[1,1,1,1,1,1,1,1,1,1,1,1]				
				];

var mappa= new Terreno(mappaProva);

var Wterr=(mappa.map.length)*32 		//stabilite caselle grandi 32
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

var debug=true;//variabili di debug
var debugP=true;

var noMove=false;

var terrImgs=[] 								// array che contiene tutte le immagini del terreno
var enImgs=[] 									// array che contiene tutte le immagini dei nemici

var mx=500;
var my=500;

loadTImages();


function drawRotatedImage(image, x, y, angle) { 
var TO_RADIANS = Math.PI/180; 
 
	// save the current co-ordinate system 
	// before we screw with it
	actx.save(); 
 
	// move to the middle of where we want to draw our image
	actx.translate(x, y);
 
	// rotate around that point, converting our 
	// angle from degrees to radians 
	actx.rotate(angle * TO_RADIANS);
 
	// draw it up and to the left by half the width
	// and height of the image 
	actx.drawImage(image, -(image.width/2), -(image.height/2));
 
	// and restore the co-ords to how they were when we began
	actx.restore(); 
}



function i_prova(){
	////console.log("ok... sono i prova")
	mappa.makeTerr();
	i_update();
}


function i_update(){
	actx.clearRect(0,0,Wterr,Hterr);
	giocatore.move(mappa.map);
	giocatore.draw();
	requestAnimationFrame(i_update);
	
}

function loadTImages(){							// callback è la funzione da eseguire al verificarsi di una condizione. nel nostro caso quando si finisce di caricare tutte le immagini.
	var timg = ["imgs/bt.jpg","imgs/bw.jpg"];			//percorso delle immagini, notare che la poszione corrisponde alla "codifica" es: immagine in posizione 0 è il terreno libero, 
	for (var i=0; i< timg.length; i++){					// e nella mappa 0 significa terreno libero
		loadSingleImg(i,timg,loadEImages,0);			// faccio una nuova funzione perchè altrimenti al prossimo ciclo mi sovrascrive l'indice dell'immagine da caricare
	}
}
function loadEImages(callback){							// callback è la funzione da eseguire al verificarsi di una condizione. nel nostro caso quando si finisce di caricare tutte le immagini.
	var timg = ["imgs/boh.png"];								//percorso delle immagini, notare che la poszione corrisponde alla "codifica" es: immagine in posizione 0 è il terreno libero, 
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
		for (var i=0; i<(this.map.length); i++){
			for(var k=0; k<this.map[i].length; k++){
				ctx.drawImage(terrImgs[this.map[i][k]],k*32-16,i*32-16,32,32); //per ogni elemento di map disegno l'immagine corrispondente
				if (debug){
					ctx.rect(k*32-16,i*32-16,32,32);
					ctx.stroke();
					ctx.rect(k*32,i*32,2,2)
					ctx.font="10px Georgia";
					//console.log(i)
					ctx.fillText(k+" "+i+".",k*32-8,i*32-16);
				}
			}
		}
	}
}

function Player(x,y,h){
	this.x=x;
	this.y=y;
	this.direction=[]
	this.movingX=0;
	this.movingY=0;
	this.movingCounter=0;
	this.health=h;
	this.bullets=[]
	this.rx=(x/32).toFixed();
	this.ry=(y/32).toFixed();

	this.update=function(){
		move();
		for(var i = 0; i<this.bullets.length; i++){
			this.bullets[i].move(mappa.map);
			if(this.bullets[i].checkDestroyCondition()){
				this.bullets[i]=null;
				this.bullets.splice(i,1);
			}

		}
	}

	this.referencePosition=function(nx,ny){
		return([parseInt((this.x+nx)/32).toFixed(), parseInt(((this.y+ny)/32).toFixed())] )
	}

	this.move=function(map){
		if(noMove==false){
			var dir = aCasoBottoni(); //x,y   ---------> #°# <--------
			mx=my=0;

			var dx=parseInt(this.rx)+(dir[0])	//prossima posione di this
			var dy=parseInt(this.ry)+(dir[1])
			if(map[dy][dx]==0 && (dir[0]!=0 || dir[1]!=0)){
				noMove=true;
				this.movingCounter=8
				this.movingX=dir[0]*4;
				this.movingY=dir[1]*4;
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
			}
			console.log(noMove,this.movingX,this.movingY)
		}
	}

	this.oldmove=function(map){
		/*
		codice tasti
		da sostituire in #°#

		*/
		if (debugP){
			actx.fillStyle="yellow";
			actx.fillRect(this.rx*32,this.ry*32,5,5);
			actx.font="10px Georgia";
			actx.fillText(this.rx+" "+this.ry,this.rx*32,this.ry*32);
		}
		var dir = aCasoBottoni(); //x,y   ---------> #°# <--------
		mx=my=0;

		var dx=this.x+(dir[0]*16)	//prossima posione di this
		var dy=this.y+(dir[1]*16)

		actx.strokeStyle="pink";
		actx.strokeRect(dx-16,dy-16,30,30);

		var caselleAdiacenti=[for (i of [-1,0,1]) for (j of [-1,0,1])  [parseInt(this.rx)+i,parseInt(this.ry)+j]];	//considero le 9 coordinate adiacenti a quella del giocatore
		//console.log(caselleAdiacenti)
		/*
		var ca=caselleAdiacenti.filter(function(ls){ if(map[ls[1]][ls[0]]){ 
														return (map[ls[1]][ls[0]]==0) //prendo solo le caselle vuote e definite
													}
													else
														return false});	
		*/
		var ca=[]
		for(var k = 0; k<caselleAdiacenti.length; k++){
			if (map[caselleAdiacenti[k][1]][caselleAdiacenti[k][0]]!=0)
				ca.push([ caselleAdiacenti[k][1],caselleAdiacenti[k][0] ])
		}
		//console.log(ca);
		var libero=[];
		for(var k = 0; k<ca.length; k++){
			libero.push(checkCollision(dx,dy,ca[k][0]*32,ca[k][1]*32,32,32))	//per ogni casella adiacente non vuota controllo se collide con la posizione futura di this
		}
		//console.log(libero)	
		var blocked=false
		if(libero.length>0){		//se il controllo fallisce tutte le caselle adiacenti sono vuote e ogni altro controllo è superfluo
			blocked=libero.reduce(function(lastVal,nextVal,index,array){
				console.log(lastVal,nextVal)
				return lastVal || nextVal;
			});
		}
		if(debug){
			actx.strokeStyle="yellow";
			actx.strokeRect(this.rx*32-16,this.ry*32-16,32,32);
			for(var k=0; k<caselleAdiacenti.length; k++){
				if(map[caselleAdiacenti[k][1]][caselleAdiacenti[k][0]]==0)
					actx.strokeStyle="green";
				else
					actx.strokeStyle="red";
				actx.strokeRect(caselleAdiacenti[k][0]*32 -16,caselleAdiacenti[k][1]*32-16,32,32);
			}
		}

		//console.log(blocked)

		if(!blocked){
			this.x=dx;
			this.y=dy;

			this.rx=((this.x -16)/32).toFixed();
			this.ry=((this.y -16)/32 ).toFixed();
			// per spostare i due canvas.

		}
	}
		

	this.createBullet=function(){
		var pro=new Bullet(null,this.x,this.y,this.direction)
		this.bullets.push(pro);
	}

	this.draw=function(){
		if (debugP){
			actx.strokeStyle="pink";
			actx.strokeRect(this.rx*32-16,this.ry*32-16,30,30);
		}
		drawRotatedImage(enImgs[0],this.x,this.y,fromDirToRot(this.direction));
	}


}

function Bullet(img,x,y,dir){
	this.img=img;
	this.x =x;
	this.y=y;
	var rif = tabellizeCoords(this.x,this.y)
	this.rx=rif[0];
	this.ry=rif[1];		
	this.dirs=dir;


	this.tabCoords=function(){
	var rif = tabellizeCoords(this.x,this.y)
	this.rx=rif[0];
	this.ry=rif[1];		
	}

	this.move=function(){
		this.x+=dirs[0];
		this.y+=dirs[1];
		tabCoords();			//aggiorno rx e ry
	}

	this.draw=function(){
		actx.fillStyle="red";
		actx.fillRect(this.rx*32-4,this.ry*32-4,8,8)
	}

	this.checkDestroyCondition=function(){
		if(mappa.map[this.ry][this.rx]!=0){
			return true;
		}
		return false;
	};
}



//funzioni di pubblica utilità

function tabellizeCoords(x,y){			//ritorna coordinate sulla tabella partendo dalle x e y attuali
	return ([(((x-16)/32).toFixed()),( ((y-16)/32 ).toFixed() )]);
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

function fromDirToRot(dir){	//dir x,y c.e: {-1 0 1}
	var ang=0;

	if(dir[0]<0){
		ang=180;
		if(dir[1]!=0){
			ang=dir[1]*45;
		}
	}
	else{
		ang=dir[1]*90;
	}
	return ang;

}

function go(e){
	var ch= String.fromCharCode(e.keyCode);
	//console.log(ch)
	switch (ch){
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
		case 'M':
			giocatore.createBullet();
			break;	
		console.log(document.getElementById("servo"))
	}
}

function aCasoBottoni(){
	var dx=0;
	var dy=0;
	if( mx==1)
		dx=1;
	else if(mx==-1)
		dx=-1
	if (my==1)
		dy=1;
	else if(my==-1)
		dy=-1;
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